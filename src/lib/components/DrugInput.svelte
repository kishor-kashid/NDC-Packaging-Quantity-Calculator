<script lang="ts">
	import { validateDrugName, validateNDC } from '$lib/utils/index.js';

	export let value: string = '';
	export let placeholder: string = 'Enter drug name or NDC';
	export let label: string = 'Drug Name or NDC';
	export let required: boolean = true;
	export let error: string = '';

	let inputError: string = '';
	let isFocused: boolean = false;

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

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		error = '';
	}
</script>

<div class="input-group">
	<label for="drug-input" class="label">
		{label}
		{#if required}
			<span class="required">*</span>
		{/if}
	</label>
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
		on:focus={() => (isFocused = true)}
		on:blur={() => (isFocused = false)}
		aria-invalid={displayError ? 'true' : 'false'}
		aria-describedby={displayError ? 'drug-error' : undefined}
	/>
	{#if displayError}
		<div id="drug-error" class="error-message" role="alert">
			{displayError}
		</div>
	{/if}
</div>

<style>
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

