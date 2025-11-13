<script lang="ts">
	import type { CalculationResult } from '$lib/types/index.js';
	import QuantityDisplay from './QuantityDisplay.svelte';
	import WarningAlerts from './WarningAlerts.svelte';
	import NDCTable from './NDCTable.svelte';

	export let result: CalculationResult | null = null;
</script>

{#if result}
	<div class="results-summary">
		<h2>Calculation Results</h2>
		
		<QuantityDisplay
			quantity={result.totalQuantity}
			unit={result.unit}
			daysSupply={result.daysSupply}
		/>

		{#if result.warnings.length > 0}
			<WarningAlerts warnings={result.warnings} />
		{/if}

		{#if result.recommendations.length > 0}
			<div class="recommendations">
				<h3>Recommended NDC Packages</h3>
				<NDCTable
					ndcs={result.recommendations.map((r) => r.ndc)}
					recommendations={result.recommendations}
				/>
			</div>
		{/if}

		{#if result.availableNDCs.length > 0}
			<div class="available-ndcs">
				<h3>All Available NDCs</h3>
				<NDCTable ndcs={result.availableNDCs} />
			</div>
		{/if}
	</div>
{/if}

<style>
	.results-summary {
		margin-top: 0;
		padding: var(--spacing-xxl);
		background: var(--bg-primary);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--border);
	}

	h2 {
		margin-top: 0;
		margin-bottom: var(--spacing-lg);
		color: var(--text-primary);
		font-size: var(--font-size-xxl);
		padding-bottom: var(--spacing-md);
		border-bottom: 2px solid var(--border-light);
	}

	h3 {
		margin-top: var(--spacing-xxl);
		margin-bottom: var(--spacing-lg);
		color: var(--text-primary);
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
	}

	.recommendations,
	.available-ndcs {
		margin-top: var(--spacing-xxl);
	}

	.recommendations {
		padding-top: var(--spacing-xl);
		border-top: 1px solid var(--border-light);
	}

	.available-ndcs {
		padding-top: var(--spacing-xl);
		border-top: 1px solid var(--border-light);
	}
</style>
