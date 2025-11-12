<script lang="ts">
	import type { Warning } from '$lib/types/index.js';
	import { WarningType } from '$lib/types/index.js';

	export let warnings: Warning[];

	function getSeverityClass(severity: string): string {
		switch (severity) {
			case 'high':
				return 'high';
			case 'medium':
				return 'medium';
			case 'low':
				return 'low';
			default:
				return 'low';
		}
	}

	function getWarningIcon(type: WarningType): string {
		switch (type) {
			case WarningType.OVERFILL:
			case WarningType.UNDERFILL:
				return '⚠️';
			case WarningType.INACTIVE_NDC:
				return '🚫';
			case WarningType.PACKAGE_MISMATCH:
				return '⚠️';
			case WarningType.UNUSUAL_QUANTITY:
				return 'ℹ️';
			default:
				return '⚠️';
		}
	}
</script>

<div class="warnings-container">
	{#each warnings as warning}
		<div class="warning" class:high={warning.severity === 'high'} class:medium={warning.severity === 'medium'} class:low={warning.severity === 'low'}>
			<span class="icon">{getWarningIcon(warning.type)}</span>
			<span class="message">{warning.message}</span>
		</div>
	{/each}
</div>

<style>
	.warnings-container {
		margin: var(--spacing-xl) 0;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.warning {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		border-radius: var(--radius-md);
		border-left: 4px solid;
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-base);
	}

	.warning:hover {
		box-shadow: var(--shadow-md);
		transform: translateX(2px);
	}

	.warning.high {
		background: var(--error-light);
		border-color: var(--error);
		color: #991b1b;
	}

	.warning.medium {
		background: var(--warning-light);
		border-color: var(--warning);
		color: #92400e;
	}

	.warning.low {
		background: var(--info-light);
		border-color: var(--info);
		color: #0e7490;
	}

	.icon {
		font-size: 1.5rem;
		flex-shrink: 0;
		line-height: 1;
	}

	.message {
		flex: 1;
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		font-weight: var(--font-weight-medium);
	}
</style>

