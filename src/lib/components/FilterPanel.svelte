<script lang="ts">
	import type { DosageFormFilter } from '$lib/types/index.js';

	export let dosageForm: DosageFormFilter = null;
	export let strength: string = '';
	export let showInsurance: boolean = false;
	export let showInteractions: boolean = false;

	const dosageFormOptions: { value: DosageFormFilter; label: string }[] = [
		{ value: null, label: 'All Forms' },
		{ value: 'TABLET', label: 'Tablet' },
		{ value: 'CAPSULE', label: 'Capsule' },
		{ value: 'LIQUID', label: 'Liquid' },
		{ value: 'INJECTION', label: 'Injection' },
		{ value: 'INHALER', label: 'Inhaler' },
		{ value: 'TOPICAL', label: 'Topical' },
		{ value: 'SUPPOSITORY', label: 'Suppository' }
	];

	function handleDosageFormChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		const value = target.value;
		dosageForm = value === 'null' || value === '' ? null : (value as DosageFormFilter);
	}

	function handleStrengthChange(event: Event) {
		const target = event.target as HTMLInputElement;
		strength = target.value;
	}
</script>

<div class="filter-panel">
	<div class="filter-header">
		<h3 class="filter-title">Filters</h3>
	</div>
	
	<div class="filter-content">
		<div class="filter-group">
			<label for="dosage-form-filter" class="filter-label">
				Dosage Form
			</label>
			<select
				id="dosage-form-filter"
				class="filter-select"
				value={dosageForm || 'null'}
				on:change={handleDosageFormChange}
			>
				{#each dosageFormOptions as option}
					<option value={option.value || 'null'}>{option.label}</option>
				{/each}
			</select>
		</div>

		<div class="filter-group">
			<label for="strength-filter" class="filter-label">
				Strength (e.g., 20mg, 5mg/5ml)
			</label>
			<input
				id="strength-filter"
				type="text"
				class="filter-input"
				placeholder="e.g., 20mg"
				value={strength}
				on:input={handleStrengthChange}
			/>
		</div>

		<div class="filter-group">
			<label class="filter-label">
				Additional Checks
			</label>
			<div class="checkbox-group">
				<label class="checkbox-label">
					<input
						type="checkbox"
						class="checkbox"
						bind:checked={showInsurance}
					/>
					<span>Check Insurance Coverage</span>
				</label>
				<label class="checkbox-label">
					<input
						type="checkbox"
						class="checkbox"
						bind:checked={showInteractions}
					/>
					<span>Check Drug Interactions</span>
				</label>
			</div>
		</div>
	</div>
</div>

<style>
	.filter-panel {
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
		border: 2px solid var(--border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-lg);
		box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.06);
		transition: all var(--transition-base);
		position: relative;
		overflow: hidden;
	}

	.filter-panel::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
		opacity: 0.5;
	}

	.filter-panel:hover {
		box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.08);
		border-color: var(--primary-lighter);
	}

	.filter-header {
		margin-bottom: var(--spacing-md);
	}

	.filter-title {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		margin: 0;
	}

	.filter-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.filter-label {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--text-primary);
	}

	.filter-select,
	.filter-input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 2px solid var(--border);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: inherit;
		transition: all var(--transition-base);
		cursor: pointer;
	}

	.filter-select:hover,
	.filter-input:hover {
		border-color: var(--border-dark);
		background: var(--bg-primary);
	}

	.filter-select:focus,
	.filter-input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 4px var(--primary-lighter);
		background: var(--bg-primary);
	}

	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		cursor: pointer;
		font-size: var(--font-size-sm);
		color: var(--text-primary);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--radius-sm);
		transition: all var(--transition-base);
		user-select: none;
	}

	.checkbox-label:hover {
		background: var(--bg-tertiary);
		color: var(--primary);
	}

	.checkbox {
		width: 20px;
		height: 20px;
		cursor: pointer;
		accent-color: var(--primary);
		transition: transform var(--transition-fast);
	}

	.checkbox:checked {
		transform: scale(1.1);
	}

	.checkbox-label:hover .checkbox {
		transform: scale(1.05);
	}
</style>

