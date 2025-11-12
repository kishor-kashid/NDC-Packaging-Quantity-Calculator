<script lang="ts">
	import DrugInput from '$lib/components/DrugInput.svelte';
	import SigInput from '$lib/components/SigInput.svelte';
	import DaysSupplyInput from '$lib/components/DaysSupplyInput.svelte';
	import ResultsSummary from '$lib/components/ResultsSummary.svelte';
	import type { CalculationResult } from '$lib/types/index.js';
	import { getUserFriendlyErrorMessage } from '$lib/utils/index.js';
	import type { PageProps } from './$types';

	// Declare params prop to avoid SvelteKit warning (even if unused)
	export let params: PageProps['params'] = {};

	let drugName: string = '';
	let sig: string = '';
	let daysSupply: number | undefined = undefined;

	let result: CalculationResult | null = null;
	let loading: boolean = false;
	let error: string = '';

	async function calculate() {
		if (!drugName && !drugName.trim()) {
			error = 'Please enter a drug name or NDC';
			return;
		}

		if (!sig || !sig.trim()) {
			error = 'Please enter SIG (dosing instructions)';
			return;
		}

		if (!daysSupply || daysSupply <= 0) {
			error = 'Please enter a valid days supply';
			return;
		}

		loading = true;
		error = '';
		result = null;

		try {
			const response = await fetch('/api/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					drugName: drugName.trim() || undefined,
					sig: sig.trim(),
					daysSupply
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
			if (error.includes('not found') || error.includes('NORMALIZATION_ERROR')) {
				error += ' Try using a common drug name like "Lisinopril" or "Metformin", or use an NDC code instead.';
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
		<div class="page-header">
			<h1>NDC Packaging & Quantity Calculator</h1>
			<p class="subtitle">Accurately match prescriptions with valid NDCs and calculate correct dispense quantities</p>
		</div>

		<main class="main-content">
			<div class="form-card card fade-in">
				<div class="card-header">
					<h2>Prescription Information</h2>
					<p class="card-description">Enter the drug name or NDC, dosing instructions, and days supply to calculate the optimal dispense quantity.</p>
				</div>
				
				<form on:submit|preventDefault={calculate} class="calculator-form">
					<DrugInput bind:value={drugName} />
					<SigInput bind:value={sig} />
					<DaysSupplyInput bind:value={daysSupply} />

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
				<div class="fade-in">
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

	.page-header {
		text-align: center;
		margin-bottom: var(--spacing-xxxl);
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	.page-header h1 {
		font-size: var(--font-size-xxxl);
		margin-bottom: var(--spacing-md);
		color: var(--text-primary);
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.subtitle {
		font-size: var(--font-size-lg);
		color: var(--text-secondary);
		line-height: var(--line-height-relaxed);
		margin: 0;
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

	.error-alert {
		display: flex;
		align-items: flex-start;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background: var(--error-light);
		border: 1px solid var(--error);
		border-left: 4px solid var(--error);
		border-radius: var(--radius-md);
		color: #991b1b;
		margin-bottom: 0;
		font-size: var(--font-size-base);
		line-height: var(--line-height-relaxed);
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
	}

	.button-primary:hover:not(:disabled) {
		background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%);
		box-shadow: var(--shadow-md);
		transform: translateY(-1px);
	}

	.button-primary:active:not(:disabled) {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}

	.button-secondary {
		background: var(--bg-primary);
		color: var(--text-primary);
		border: 2px solid var(--border);
	}

	.button-secondary:hover:not(:disabled) {
		background: var(--bg-secondary);
		border-color: var(--border-dark);
		box-shadow: var(--shadow-sm);
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
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-lg);
	}

	.loading-spinner {
		animation: spin 1.5s linear infinite;
	}

	.loading-text {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--text-primary);
		margin: 0;
	}

	.loading-subtext {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		margin: 0;
	}

	@media (max-width: 768px) {
		.page-container {
			padding: var(--spacing-xl) 0;
		}

		.container {
			padding: 0 var(--spacing-lg);
		}

		.page-header {
			margin-bottom: var(--spacing-xxl);
		}

		.page-header h1 {
			font-size: var(--font-size-xxl);
		}

		.subtitle {
			font-size: var(--font-size-base);
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
