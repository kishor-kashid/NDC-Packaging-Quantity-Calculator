<script lang="ts">
	import { validateDaysSupply } from '$lib/utils/index.js';

	export let value: number | undefined = undefined;
	export let placeholder: string = '30';
	export let label: string = "Days' Supply";
	export let required: boolean = true;
	export let error: string = '';

	let inputError: string = '';
	let isFocused: boolean = false;
	let stringValue: string = value?.toString() || '';

	$: {
		if (stringValue) {
			const numValue = parseInt(stringValue, 10);
			const validationError = validateDaysSupply(numValue);
			inputError = validationError ? validationError.message : '';
			if (!validationError) {
				value = numValue;
			}
		} else {
			inputError = required ? 'This field is required' : '';
			value = undefined;
		}
	}

	$: displayError = error || inputError;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		stringValue = target.value;
		error = '';
	}
</script>

<div class="input-group">
	<label for="days-supply-input" class="label">
		{label}
		{#if required}
			<span class="required">*</span>
		{/if}
	</label>
	<input
		id="days-supply-input"
		type="number"
		class="input"
		class:error={displayError}
		class:focused={isFocused}
		{placeholder}
		min="1"
		max="365"
		step="1"
		value={stringValue}
		{required}
		on:input={handleInput}
		on:focus={() => (isFocused = true)}
		on:blur={() => (isFocused = false)}
		aria-invalid={displayError ? 'true' : 'false'}
		aria-describedby={displayError ? 'days-supply-error' : undefined}
	/>
	{#if displayError}
		<div id="days-supply-error" class="error-message" role="alert">
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

