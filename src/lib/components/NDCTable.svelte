<script lang="ts">
	import type { NDC, DispenseRecommendation } from '$lib/types/index.js';
	import { NDCStatus } from '$lib/types/index.js';
	import { formatNDC, formatQuantity } from '$lib/utils/index.js';

	export let ndcs: NDC[];
	export let recommendations: DispenseRecommendation[] = [];

	let sortColumn: string | null = null;
	let sortDirection: 'asc' | 'desc' = 'asc';

	function sort(column: string) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}

		ndcs = [...ndcs].sort((a, b) => {
			let aVal: string | number = '';
			let bVal: string | number = '';

			switch (column) {
				case 'ndc':
					aVal = a.ndc;
					bVal = b.ndc;
					break;
				case 'product':
					aVal = a.productName;
					bVal = b.productName;
					break;
				case 'manufacturer':
					aVal = a.manufacturer || '';
					bVal = b.manufacturer || '';
					break;
				case 'package':
					aVal = a.packageInfo?.quantity || 0;
					bVal = b.packageInfo?.quantity || 0;
					break;
				case 'status':
					aVal = a.status;
					bVal = b.status;
					break;
			}

			const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
			return sortDirection === 'asc' ? comparison : -comparison;
		});
	}

	function getRecommendation(ndc: NDC): DispenseRecommendation | undefined {
		return recommendations.find((r) => r.ndc.ndc === ndc.ndc);
	}
</script>

<div class="table-container">
	<table class="ndc-table">
		<thead>
			<tr>
				<th on:click={() => sort('ndc')} class="sortable">
					NDC {#if sortColumn === 'ndc'}({sortDirection}){/if}
				</th>
				<th on:click={() => sort('product')} class="sortable">
					Product Name {#if sortColumn === 'product'}({sortDirection}){/if}
				</th>
				<th on:click={() => sort('manufacturer')} class="sortable">
					Manufacturer {#if sortColumn === 'manufacturer'}({sortDirection}){/if}
				</th>
				<th on:click={() => sort('package')} class="sortable">
					Package Size {#if sortColumn === 'package'}({sortDirection}){/if}
				</th>
				<th on:click={() => sort('status')} class="sortable">
					Status {#if sortColumn === 'status'}({sortDirection}){/if}
				</th>
				{#if recommendations.length > 0}
					<th>Recommendation</th>
				{/if}
			</tr>
		</thead>
		<tbody>
			{#each ndcs as ndc}
				{@const rec = getRecommendation(ndc)}
				<tr class:inactive={ndc.status === NDCStatus.INACTIVE} class:recommended={rec !== undefined}>
					<td>{ndc.ndc}</td>
					<td>{ndc.productName}</td>
					<td>{ndc.manufacturer || 'N/A'}</td>
					<td>
						{#if ndc.packageInfo}
							{formatQuantity(ndc.packageInfo.quantity || 0, ndc.packageInfo.unit)}
						{:else}
							N/A
						{/if}
					</td>
					<td>
						<span class="status" class:active={ndc.status === NDCStatus.ACTIVE} class:inactive={ndc.status === NDCStatus.INACTIVE}>
							{ndc.status}
						</span>
					</td>
					{#if recommendations.length > 0}
						<td>
							{#if rec}
								<span class="recommendation">
									Dispense {rec.packageCount} package{rec.packageCount !== 1 ? 's' : ''}
									{#if rec.exactMatch}
										<span class="exact-match">(Exact Match)</span>
									{/if}
								</span>
							{:else}
								—
							{/if}
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-container {
		overflow-x: auto;
		margin: var(--spacing-lg) 0;
		border-radius: var(--radius-lg);
		border: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
		background: var(--bg-primary);
	}

	.ndc-table {
		width: 100%;
		border-collapse: collapse;
		background: var(--bg-primary);
		font-size: var(--font-size-sm);
	}

	.ndc-table th {
		background: var(--bg-tertiary);
		padding: var(--spacing-md) var(--spacing-lg);
		text-align: left;
		font-weight: var(--font-weight-semibold);
		border-bottom: 2px solid var(--border);
		color: var(--text-primary);
		font-size: var(--font-size-sm);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.ndc-table th.sortable {
		cursor: pointer;
		user-select: none;
		transition: all var(--transition-base);
		position: relative;
	}

	.ndc-table th.sortable:hover {
		background: var(--bg-hover);
		color: var(--primary);
	}

	.ndc-table th.sortable::after {
		content: '↕';
		position: absolute;
		right: var(--spacing-sm);
		opacity: 0.3;
		font-size: 0.75rem;
	}

	.ndc-table td {
		padding: var(--spacing-md) var(--spacing-lg);
		border-bottom: 1px solid var(--border-light);
		color: var(--text-primary);
		vertical-align: middle;
	}

	.ndc-table tbody tr {
		transition: all var(--transition-fast);
	}

	.ndc-table tbody tr:hover {
		background: var(--bg-secondary);
	}

	.ndc-table tr.inactive {
		opacity: 0.7;
		background: var(--error-light);
	}

	.ndc-table tr.inactive:hover {
		background: rgba(254, 226, 226, 0.8);
	}

	.ndc-table tr.recommended {
		background: var(--primary-lighter);
		border-left: 3px solid var(--primary);
	}

	.ndc-table tr.recommended:hover {
		background: rgba(219, 234, 254, 0.8);
	}

	.status {
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-full);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		display: inline-block;
	}

	.status.active {
		background: var(--success-light);
		color: #065f46;
	}

	.status.inactive {
		background: var(--error-light);
		color: #991b1b;
	}

	.recommendation {
		font-weight: var(--font-weight-semibold);
		color: var(--primary);
		font-size: var(--font-size-sm);
	}

	.exact-match {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: var(--font-size-xs);
		color: var(--success);
		margin-top: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--success-light);
		border-radius: var(--radius-sm);
		font-weight: var(--font-weight-medium);
	}

	@media (max-width: 768px) {
		.table-container {
			border-radius: var(--radius-md);
		}

		.ndc-table th,
		.ndc-table td {
			padding: var(--spacing-sm) var(--spacing-md);
			font-size: 0.8125rem;
		}
	}
</style>

