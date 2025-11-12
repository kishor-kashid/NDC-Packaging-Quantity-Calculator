<script lang="ts">
	import { onMount } from 'svelte';

	export let data: unknown;

	let isExpanded: boolean = false;
	let jsonString: string = '';

	$: {
		jsonString = JSON.stringify(data, null, 2);
	}

	function toggle() {
		isExpanded = !isExpanded;
	}

	let copySuccess: boolean = false;

	async function copyToClipboard() {
		try {
			await navigator.clipboard.writeText(jsonString);
			copySuccess = true;
			setTimeout(() => {
				copySuccess = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
			alert('Failed to copy to clipboard');
		}
	}
</script>

<div class="json-output">
	<button class="toggle-button" on:click={toggle} aria-expanded={isExpanded}>
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class:rotated={isExpanded}>
			<path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
		</svg>
		<span>JSON Output</span>
	</button>
	{#if isExpanded}
		<div class="json-container">
			<button class="copy-button" on:click={copyToClipboard} class:success={copySuccess}>
				{#if copySuccess}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M13.5 4.5L6 12L2.5 8.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>Copied!</span>
				{:else}
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M6 4H4C3.44772 4 3 4.44772 3 5V12C3 12.5523 3.44772 13 4 13H11C11.5523 13 12 12.5523 12 12V10M9 3H13C13.5523 3 14 3.44772 14 4V8M9 3L13 7M9 3V7H13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
					<span>Copy</span>
				{/if}
			</button>
			<pre class="json-content"><code>{jsonString}</code></pre>
		</div>
	{/if}
</div>

<style>
	.json-output {
		margin-top: var(--spacing-xxl);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		overflow: hidden;
		box-shadow: var(--shadow-sm);
		background: var(--bg-primary);
	}

	.toggle-button {
		width: 100%;
		padding: var(--spacing-md) var(--spacing-lg);
		background: var(--bg-tertiary);
		border: none;
		text-align: left;
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-base);
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		color: var(--text-primary);
		font-size: var(--font-size-base);
	}

	.toggle-button:hover {
		background: var(--bg-hover);
		color: var(--primary);
	}

	.toggle-button svg {
		transition: transform var(--transition-base);
		flex-shrink: 0;
	}

	.toggle-button svg.rotated {
		transform: rotate(90deg);
	}

	.toggle-button svg path {
		transition: transform var(--transition-base);
	}

	.toggle-button:focus-visible {
		outline: 2px solid var(--primary);
		outline-offset: -2px;
	}

	.json-container {
		position: relative;
		background: var(--bg-primary);
		border-top: 1px solid var(--border);
	}

	.copy-button {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
		color: var(--text-inverse);
		border: none;
		border-radius: var(--radius-sm);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-base);
		z-index: 10;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.copy-button:hover {
		background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
		box-shadow: var(--shadow-md);
		transform: translateY(-1px);
	}

	.copy-button:active {
		transform: translateY(0);
	}

	.copy-button.success {
		background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
	}

	.copy-button svg {
		width: 16px;
		height: 16px;
	}

	.json-content {
		margin: 0;
		padding: var(--spacing-xl);
		overflow-x: auto;
		font-size: var(--font-size-sm);
		line-height: var(--line-height-relaxed);
		background: var(--bg-secondary);
		border-top: 1px solid var(--border-light);
	}

	.json-content code {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Courier New', monospace;
		color: var(--text-primary);
		font-size: var(--font-size-sm);
	}

	@media (max-width: 768px) {
		.copy-button {
			position: relative;
			top: 0;
			right: 0;
			width: 100%;
			margin: var(--spacing-md);
			justify-content: center;
		}

		.json-content {
			padding: var(--spacing-md);
		}
	}
</style>

