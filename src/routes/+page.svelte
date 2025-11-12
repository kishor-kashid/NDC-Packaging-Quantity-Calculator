<script lang="ts">
	import DrugInputAutocomplete from '$lib/components/DrugInputAutocomplete.svelte';
	import FilterPanel from '$lib/components/FilterPanel.svelte';
	import SigInput from '$lib/components/SigInput.svelte';
	import DaysSupplyInput from '$lib/components/DaysSupplyInput.svelte';
	import ResultsSummary from '$lib/components/ResultsSummary.svelte';
	import type { CalculationResult, DosageFormFilter } from '$lib/types/index.js';
	import { getUserFriendlyErrorMessage } from '$lib/utils/index.js';
	import type { PageProps } from './$types';

	// Declare params prop to avoid SvelteKit warning (even if unused)
	export let params: PageProps['params'] = {};

	let drugName: string = '';
	let sig: string = '';
	let daysSupply: number | undefined = undefined;
	
	// Filter options
	let dosageFormFilter: DosageFormFilter = null;
	let strengthFilter: string = '';
	let showInsurance: boolean = false;
	let showInteractions: boolean = false;
	let insurancePlan: string = '';
	let knownAllergies: string = '';
	let patientConditions: string = '';
	let currentMedications: string = '';

	let result: CalculationResult | null = null;
	let loading: boolean = false;
	let error: string = '';

	async function calculate() {
		if (!drugName || !drugName.trim()) {
			error = 'Please enter a drug name or NDC';
			return;
		}

		if (!sig || !sig.trim()) {
			error = 'Please enter SIG (dosing instructions)';
			return;
		}

		// Check daysSupply - also try to get it from the input element if it's not set
		let finalDaysSupply = daysSupply;
		if (finalDaysSupply === undefined || finalDaysSupply === null || finalDaysSupply <= 0 || isNaN(finalDaysSupply)) {
			// Try to get value from DOM input element as fallback
			const inputElement = document.getElementById('days-supply-input') as HTMLInputElement;
			if (inputElement && inputElement.value) {
				const inputValue = parseInt(inputElement.value, 10);
				if (!isNaN(inputValue) && inputValue > 0) {
					finalDaysSupply = inputValue;
					daysSupply = inputValue; // Update the bound value
				}
			}
			
			if (!finalDaysSupply || finalDaysSupply <= 0 || isNaN(finalDaysSupply)) {
				error = 'Please enter a valid days supply';
				return;
			}
		}

		loading = true;
		error = '';
		result = null;

		try {
			// Parse allergies, conditions, and medications from comma-separated strings
			const allergiesArray = knownAllergies.split(',').map(a => a.trim()).filter(a => a);
			const conditionsArray = patientConditions.split(',').map(c => c.trim()).filter(c => c);
			// For medications, we'd need to parse NDCs - simplified for now
			const medicationsArray: any[] = []; // Would need to be parsed from input
			
			const response = await fetch('/api/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					drugName: drugName.trim() || undefined,
					sig: sig.trim(),
					daysSupply: finalDaysSupply,
					dosageFormFilter: dosageFormFilter,
					strengthFilter: strengthFilter.trim() || undefined,
					checkInsurance: showInsurance,
					checkInteractions: showInteractions,
					insurancePlan: insurancePlan.trim() || undefined,
					knownAllergies: allergiesArray.length > 0 ? allergiesArray : undefined,
					patientConditions: conditionsArray.length > 0 ? conditionsArray : undefined,
					currentMedications: medicationsArray.length > 0 ? medicationsArray : undefined
				})
			});

			const data = await response.json();

			if (!response.ok || !data.success) {
				// Extract detailed error information
				const errorDetails = data.error;
				let errorMsg = errorDetails?.message || 'Calculation failed';
				
				// Add suggestion if available
				if (errorDetails?.details?.suggestion) {
					errorMsg += ` ${errorDetails.details.suggestion}`;
				}
				
				throw new Error(errorMsg);
			}

			result = data.data;
		} catch (err) {
			console.error('Calculation error:', err);
			
			// Extract error message
			if (err instanceof Error) {
				error = err.message;
			} else {
				error = getUserFriendlyErrorMessage(err);
			}
			
			// Provide additional guidance for common errors
			// Only add generic suggestion if it's not already in the error message
			if ((error.includes('not found') || error.includes('NORMALIZATION_ERROR')) && !error.includes('Try searching by drug name')) {
				// Check if it's an NDC not found error - if so, the suggestion is already included
				if (!error.includes('NDC code not found')) {
					error += ' Try using a common drug name like "Lisinopril" or "Metformin", or use an NDC code instead.';
				}
			}
		} finally {
			loading = false;
		}
	}

	function clear() {
		drugName = '';
		sig = '';
		daysSupply = undefined;
		result = null;
		error = '';
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			calculate();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="page-container">
	<div class="container">
		<main class="main-content">
			<div class="form-card card fade-in">
				<div class="card-header">
					<h2>Prescription Information</h2>
					<p class="card-description">Enter the drug name or NDC, dosing instructions, and days supply to calculate the optimal dispense quantity.</p>
				</div>
				
				<form on:submit|preventDefault={calculate} class="calculator-form">
					<DrugInputAutocomplete bind:value={drugName} />
					<SigInput bind:value={sig} />
					<DaysSupplyInput bind:value={daysSupply} />
					
					<FilterPanel
						bind:dosageForm={dosageFormFilter}
						bind:strength={strengthFilter}
						bind:showInsurance={showInsurance}
						bind:showInteractions={showInteractions}
					/>
					
					{#if showInsurance}
						<div class="filter-group">
							<label for="insurance-plan" class="filter-label">Insurance Plan (Optional)</label>
							<input
								id="insurance-plan"
								type="text"
								class="filter-input"
								placeholder="e.g., Blue Cross Blue Shield"
								bind:value={insurancePlan}
							/>
						</div>
					{/if}
					
					{#if showInteractions}
						<div class="interaction-fields">
							<div class="filter-group">
								<label for="known-allergies" class="filter-label">Known Allergies (comma-separated)</label>
								<input
									id="known-allergies"
									type="text"
									class="filter-input"
									placeholder="e.g., Penicillin, Sulfa"
									bind:value={knownAllergies}
								/>
							</div>
							<div class="filter-group">
								<label for="patient-conditions" class="filter-label">Patient Conditions (comma-separated)</label>
								<input
									id="patient-conditions"
									type="text"
									class="filter-input"
									placeholder="e.g., Pregnancy, Liver Disease"
									bind:value={patientConditions}
								/>
							</div>
						</div>
					{/if}

					{#if error}
						<div class="error-alert" role="alert">
							<svg class="error-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" stroke-width="2"/>
								<path d="M10 6V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
								<path d="M10 14H10.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
							</svg>
							<span>{error}</span>
						</div>
					{/if}

					<div class="button-group">
						<button type="submit" class="button button-primary" disabled={loading}>
							{#if loading}
								<svg class="spinner" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="32" opacity="0.3"/>
									<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-dasharray="32" stroke-dashoffset="24"/>
								</svg>
								<span>Calculating...</span>
							{:else}
								<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z" stroke="currentColor" stroke-width="1.5"/>
									<path d="M7.5 10L9.16667 11.6667L12.5 8.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
								</svg>
								<span>Calculate</span>
							{/if}
						</button>
						<button type="button" class="button button-secondary" on:click={clear} disabled={loading}>
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
							</svg>
							<span>Clear</span>
						</button>
					</div>
				</form>
			</div>

			{#if loading}
				<div class="loading-card card fade-in">
					<div class="loading-content">
						<div class="loading-spinner">
							<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
								<circle cx="24" cy="24" r="20" stroke="var(--primary-lighter)" stroke-width="4" opacity="0.3"/>
								<circle cx="24" cy="24" r="20" stroke="var(--primary)" stroke-width="4" stroke-linecap="round" stroke-dasharray="80" stroke-dashoffset="60"/>
							</svg>
						</div>
						<p class="loading-text">Processing your request...</p>
						<p class="loading-subtext">Retrieving NDC information and calculating quantities</p>
					</div>
				</div>
			{/if}

			{#if result}
				<div class="slide-up">
					<ResultsSummary {result} />
				</div>
			{/if}
		</main>
	</div>
</div>

<style>
	.page-container {
		min-height: calc(100vh - 200px);
		padding: var(--spacing-xxl) 0;
	}

	.container {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
	}

	.main-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.form-card {
		margin-bottom: 0;
	}

	.card-description {
		color: var(--text-secondary);
		font-size: var(--font-size-base);
		margin: var(--spacing-sm) 0 0 0;
		line-height: var(--line-height-relaxed);
	}

	.calculator-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
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
	}

	.filter-input:hover {
		border-color: var(--border-dark);
	}

	.filter-input:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 4px var(--primary-lighter);
		background: var(--bg-primary);
	}

	.interaction-fields {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.error-alert {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background: linear-gradient(135deg, var(--error-light) 0%, #fee2e2 100%);
		border: 1px solid var(--error);
		border-left: 4px solid var(--error);
		border-radius: var(--radius-lg);
		color: #991b1b;
		margin-bottom: 0;
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
		box-shadow: 0 2px 4px -1px rgba(239, 68, 68, 0.2);
		animation: shake 0.5s ease-in-out;
	}

	.error-icon {
		flex-shrink: 0;
		margin-top: 2px;
		color: var(--error);
	}

	.button-group {
		display: flex;
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
		flex-wrap: wrap;
	}

	.button {
		padding: var(--spacing-md) var(--spacing-xl);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-semibold);
		cursor: pointer;
		transition: all var(--transition-base);
		min-width: 140px;
		box-shadow: var(--shadow-sm);
	}

	.button-primary {
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
		color: var(--text-inverse);
		position: relative;
		overflow: hidden;
	}

	.button-primary::before {
		content: '';
		position: absolute;
		top: 0;
		left: -100%;
		width: 100%;
		height: 100%;
		background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
		transition: left 0.5s;
	}

	.button-primary:hover:not(:disabled)::before {
		left: 100%;
	}

	.button-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
		box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.4);
		transform: translateY(-2px);
	}

	.button-primary:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: 0 4px 8px -2px rgba(37, 99, 235, 0.3);
	}

	.button-secondary {
		background: var(--bg-primary);
		color: var(--text-primary);
		border: 2px solid var(--border);
		position: relative;
	}

	.button-secondary:hover:not(:disabled) {
		background: var(--bg-secondary);
		border-color: var(--primary-light);
		box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
		color: var(--primary);
	}

	.button-secondary:active:not(:disabled) {
		transform: translateY(0);
	}

	.button svg {
		width: 20px;
		height: 20px;
	}

	.spinner {
		animation: spin 1s linear infinite;
	}

	.loading-card {
		text-align: center;
		padding: var(--spacing-xxxl);
		background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.loading-spinner {
		animation: spin 1.5s linear infinite;
		position: relative;
	}

	.loading-spinner::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		background: var(--primary);
		border-radius: 50%;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.loading-text {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		margin: 0;
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.loading-subtext {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		margin: 0;
		animation: pulse 2s ease-in-out infinite;
	}

	@media (max-width: 768px) {
		.page-container {
			padding: var(--spacing-xl) 0;
		}

		.container {
			padding: 0 var(--spacing-lg);
		}

		.form-card {
			padding: var(--spacing-lg);
		}

		.button-group {
			flex-direction: column;
		}

		.button {
			width: 100%;
		}

		.loading-card {
			padding: var(--spacing-xxl);
		}
	}
</style>
