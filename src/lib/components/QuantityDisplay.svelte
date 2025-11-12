<script lang="ts">
	import { formatQuantity } from '$lib/utils/index.js';

	export let quantity: number;
	export let unit: string;
	export let daysSupply: number;
</script>

<div class="quantity-display">
	<div class="quantity-value">
		<span class="value">{formatQuantity(quantity, unit)}</span>
	</div>
	<div class="quantity-details">
		<p>For <strong>{daysSupply}</strong> days supply</p>
	</div>
</div>

<style>
	.quantity-display {
		text-align: center;
		padding: var(--spacing-xxl);
		background: linear-gradient(135deg, var(--primary-lighter) 0%, rgba(59, 130, 246, 0.1) 100%);
		border: 2px solid var(--primary);
		border-radius: var(--radius-xl);
		margin-bottom: var(--spacing-xl);
		box-shadow: var(--shadow-md);
		position: relative;
		overflow: hidden;
	}

	.quantity-display::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, var(--primary) 0%, var(--primary-light) 100%);
	}

	.quantity-value {
		margin-bottom: var(--spacing-md);
	}

	.value {
		font-size: 3.5rem;
		font-weight: var(--font-weight-bold);
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		line-height: 1;
		letter-spacing: -0.02em;
	}

	.quantity-details {
		color: var(--text-secondary);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-medium);
	}

	.quantity-details strong {
		color: var(--text-primary);
		font-weight: var(--font-weight-bold);
	}

	@media (max-width: 768px) {
		.quantity-display {
			padding: var(--spacing-xl);
		}

		.value {
			font-size: 2.5rem;
		}
	}
</style>

