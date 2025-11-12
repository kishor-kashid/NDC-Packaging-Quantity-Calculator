<script lang="ts">
	import { validateDrugName, validateNDC } from '$lib/utils/index.js';
	import type { DrugSuggestion } from '$lib/types/index.js';
	import { onMount } from 'svelte';

	export let value: string = '';
	export let placeholder: string = 'Enter drug name or NDC';
	export let label: string = 'Drug Name or NDC';
	export let required: boolean = true;
	export let error: string = '';

	let inputError: string = '';
	let isFocused: boolean = false;
	let suggestions: DrugSuggestion[] = [];
	let showSuggestions: boolean = false;
	let selectedIndex: number = -1;
	let isLoading: boolean = false;
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	$: {
		if (value) {
			// Try to validate as drug name first, then NDC
			const drugError = validateDrugName(value);
			const ndcError = validateNDC(value);
			inputError = drugError && ndcError ? 'Please enter a valid drug name or NDC' : '';
		} else {
			inputError = required ? 'This field is required' : '';
		}
	}

	$: displayError = error || inputError;

	async function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		error = '';

		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		// Don't search if it looks like an NDC
		const cleanValue = value.trim().replace(/[-\s]/g, '');
		if (/^\d{8,11}$/.test(cleanValue)) {
			suggestions = [];
			showSuggestions = false;
			return;
		}

		// Only search if value is at least 2 characters
		if (value.length < 2) {
			suggestions = [];
			showSuggestions = false;
			return;
		}

		// Debounce search
		isLoading = true;
		searchTimeout = setTimeout(async () => {
			try {
				const response = await fetch(`/api/drug-search?q=${encodeURIComponent(value)}&limit=10`);
				if (response.ok) {
					const data = await response.json();
					if (data.success && data.data?.suggestions) {
						suggestions = data.data.suggestions;
						showSuggestions = suggestions.length > 0 && isFocused;
						selectedIndex = -1;
					}
				}
			} catch (err) {
				console.error('Search error:', err);
				suggestions = [];
			} finally {
				isLoading = false;
			}
		}, 300);
	}

	function handleFocus() {
		isFocused = true;
		if (suggestions.length > 0) {
			showSuggestions = true;
		}
	}

	function handleBlur() {
		// Delay to allow click on suggestion
		setTimeout(() => {
			isFocused = false;
			showSuggestions = false;
		}, 200);
	}

	function selectSuggestion(suggestion: DrugSuggestion) {
		value = suggestion.name;
		suggestions = [];
		showSuggestions = false;
		error = '';
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!showSuggestions || suggestions.length === 0) {
			return;
		}

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
		} else if (event.key === 'Enter' && selectedIndex >= 0) {
			event.preventDefault();
			selectSuggestion(suggestions[selectedIndex]);
		} else if (event.key === 'Escape') {
			showSuggestions = false;
			selectedIndex = -1;
		}
	}
</script>

<div class="input-group autocomplete-wrapper">
	<label for="drug-input" class="label">
		{label}
		{#if required}
			<span class="required">*</span>
		{/if}
	</label>
	<div class="input-container">
		<input
			id="drug-input"
			type="text"
			class="input"
			class:error={displayError}
			class:focused={isFocused}
			{placeholder}
			{value}
			{required}
			on:input={handleInput}
			on:focus={handleFocus}
			on:blur={handleBlur}
			on:keydown={handleKeyDown}
			aria-invalid={displayError ? 'true' : 'false'}
			aria-describedby={displayError ? 'drug-error' : undefined}
			aria-autocomplete="list"
			aria-expanded={showSuggestions}
			role="combobox"
		/>
		{#if isLoading}
			<div class="loading-indicator" aria-label="Searching...">
				<svg class="spinner" viewBox="0 0 24 24">
					<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="31.416" stroke-dashoffset="31.416">
						<animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
						<animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
					</circle>
				</svg>
			</div>
		{/if}
	</div>
	{#if showSuggestions && suggestions.length > 0}
		<ul class="suggestions-list" role="listbox" id="drug-suggestions">
			{#each suggestions as suggestion, index}
				<li
					class="suggestion-item"
					class:selected={index === selectedIndex}
					role="option"
					aria-selected={index === selectedIndex}
					on:click={() => selectSuggestion(suggestion)}
					on:mouseenter={() => (selectedIndex = index)}
				>
					<span class="suggestion-name">{suggestion.name}</span>
					{#if suggestion.strength}
						<span class="suggestion-strength">{suggestion.strength}</span>
					{/if}
					{#if suggestion.isBrand}
						<span class="suggestion-badge">Brand</span>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if displayError}
		<div id="drug-error" class="error-message" role="alert">
			{displayError}
		</div>
	{/if}
</div>

<style>
	.autocomplete-wrapper {
		position: relative;
	}

	.input-container {
		position: relative;
	}

	.loading-indicator {
		position: absolute;
		right: var(--spacing-md);
		top: 50%;
		transform: translateY(-50%);
		width: 20px;
		height: 20px;
		pointer-events: none;
	}

	.spinner {
		width: 100%;
		height: 100%;
		color: var(--primary);
	}

	.suggestions-list {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: var(--bg-primary);
		border: 2px solid var(--border);
		border-top: none;
		border-radius: 0 0 var(--radius-md) var(--radius-md);
		max-height: 300px;
		overflow-y: auto;
		z-index: 1000;
		box-shadow: var(--shadow-lg);
		margin: 0;
		padding: var(--spacing-xs) 0;
		list-style: none;
	}

	.suggestion-item {
		padding: var(--spacing-md) var(--spacing-lg);
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		transition: background-color var(--transition-base);
	}

	.suggestion-item:hover,
	.suggestion-item.selected {
		background: var(--primary-lighter);
	}

	.suggestion-name {
		flex: 1;
		font-weight: var(--font-weight-medium);
		color: var(--text-primary);
	}

	.suggestion-strength {
		color: var(--text-muted);
		font-size: var(--font-size-sm);
	}

	.suggestion-badge {
		background: var(--primary);
		color: white;
		padding: 2px 8px;
		border-radius: var(--radius-sm);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
	}

	.input-group {
		margin-bottom: 0;
	}

	.label {
		display: block;
		margin-bottom: var(--spacing-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		font-size: var(--font-size-base);
	}

	.required {
		color: var(--error);
		margin-left: var(--spacing-xs);
		font-weight: var(--font-weight-bold);
	}

	.input {
		width: 100%;
		padding: var(--spacing-md) var(--spacing-lg);
		padding-right: 50px;
		border: 2px solid var(--border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		transition: all var(--transition-base);
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: inherit;
	}

	.input::placeholder {
		color: var(--text-muted);
	}

	.input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px var(--primary-lighter);
		background: var(--bg-primary);
	}

	.input.error {
		border-color: var(--error);
		background: var(--error-light);
	}

	.input.error:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.input.focused {
		border-color: var(--primary);
	}

	.error-message {
		margin-top: var(--spacing-xs);
		color: var(--error);
		font-size: var(--font-size-sm);
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}
</style>

