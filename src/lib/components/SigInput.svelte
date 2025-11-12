<script lang="ts">
	import { validateSIG } from '$lib/utils/index.js';

	export let value: string = '';
	export let placeholder: string = 'e.g., Take 1 tablet by mouth twice daily';
	export let label: string = 'SIG (Dosing Instructions)';
	export let required: boolean = true;
	export let error: string = '';

	let inputError: string = '';
	let isFocused: boolean = false;

	$: {
		if (value) {
			const validationError = validateSIG(value);
			inputError = validationError ? validationError.message : '';
		} else {
			inputError = required ? 'This field is required' : '';
		}
	}

	$: displayError = error || inputError;

	const examples = [
		'Take 1 tablet by mouth twice daily',
		'Take 2 capsules every 8 hours',
		'Take 10ml by mouth once daily',
		'1 tablet every 12 hours'
	];

	function handleInput(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		value = target.value;
		error = '';
	}
</script>

<div class="input-group">
	<label for="sig-input" class="label">
		{label}
		{#if required}
			<span class="required">*</span>
		{/if}
	</label>
	<textarea
		id="sig-input"
		class="textarea"
		class:error={displayError}
		class:focused={isFocused}
		{placeholder}
		{value}
		{required}
		rows="3"
		on:input={handleInput}
		on:focus={() => (isFocused = true)}
		on:blur={() => (isFocused = false)}
		aria-invalid={displayError ? 'true' : 'false'}
		aria-describedby={displayError ? 'sig-error' : 'sig-help'}
	></textarea>
	<div id="sig-help" class="help-text">
		<strong>Examples:</strong>
		<ul>
			{#each examples as example}
				<li>{example}</li>
			{/each}
		</ul>
	</div>
	{#if displayError}
		<div id="sig-error" class="error-message" role="alert">
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

	.textarea {
		width: 100%;
		padding: var(--spacing-md) var(--spacing-lg);
		border: 2px solid var(--border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-family: inherit;
		resize: vertical;
		transition: all var(--transition-base);
		background: var(--bg-primary);
		color: var(--text-primary);
		line-height: var(--line-height-relaxed);
	}

	.textarea::placeholder {
		color: var(--text-muted);
	}

	.textarea:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px var(--primary-lighter);
		background: var(--bg-primary);
	}

	.textarea.error {
		border-color: var(--error);
		background: var(--error-light);
	}

	.textarea.error:focus {
		box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
	}

	.textarea.focused {
		border-color: var(--primary);
	}

	.help-text {
		margin-top: var(--spacing-sm);
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		background: var(--bg-secondary);
		padding: var(--spacing-md);
		border-radius: var(--radius-md);
		border: 1px solid var(--border-light);
	}

	.help-text strong {
		color: var(--text-primary);
		font-weight: var(--font-weight-semibold);
	}

	.help-text ul {
		margin: var(--spacing-xs) 0 0 var(--spacing-lg);
		padding: 0;
		list-style: disc;
	}

	.help-text li {
		margin: var(--spacing-xs) 0;
		color: var(--text-secondary);
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

