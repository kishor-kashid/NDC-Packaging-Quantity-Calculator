<script lang="ts">
	import '../app.css';
	import type { LayoutProps } from './$types';

	// Declare params prop to avoid SvelteKit warning (even if unused)
	export let params: LayoutProps['params'] = {};
</script>

<header class="site-header">
	<div class="header-content">
		<div class="header-brand">
			<div class="brand-icon">
				<svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" opacity="0.9"/>
					<path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					<path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
				</svg>
			</div>
			<div class="brand-text">
				<h1 class="brand-title">Foundation Health</h1>
				<p class="brand-subtitle">NDC Calculator</p>
			</div>
		</div>
	</div>
</header>

<main>
	<slot />
</main>

<footer class="site-footer">
	<div class="footer-content">
		<p>&copy; 2024 Foundation Health. All rights reserved.</p>
		<p class="footer-subtitle">Prescription Fulfillment Tool</p>
	</div>
</footer>

<style>
	.site-header {
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: 100;
		backdrop-filter: blur(10px);
		background: rgba(255, 255, 255, 0.95);
	}

	.header-content {
		max-width: 1280px;
		margin: 0 auto;
		padding: var(--spacing-lg) var(--spacing-xl);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.header-brand {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.brand-icon {
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
		border-radius: var(--radius-lg);
		color: var(--text-inverse);
		box-shadow: var(--shadow-md);
	}

	.brand-text {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.brand-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--text-primary);
		margin: 0;
		line-height: 1.2;
	}

	.brand-subtitle {
		font-size: var(--font-size-sm);
		color: var(--text-secondary);
		margin: 0;
		font-weight: var(--font-weight-normal);
	}

	main {
		min-height: calc(100vh - 200px);
		padding: 0;
	}

	.site-footer {
		background: var(--bg-primary);
		border-top: 1px solid var(--border);
		margin-top: var(--spacing-xxxl);
		padding: var(--spacing-xl) 0;
	}

	.footer-content {
		max-width: 1280px;
		margin: 0 auto;
		padding: 0 var(--spacing-xl);
		text-align: center;
		color: var(--text-secondary);
	}

	.footer-content p {
		margin: var(--spacing-xs) 0;
		font-size: var(--font-size-sm);
	}

	.footer-subtitle {
		color: var(--text-muted);
		font-size: var(--font-size-sm);
	}

	@media (max-width: 768px) {
		.header-content {
			padding: var(--spacing-md) var(--spacing-lg);
		}

		.brand-icon {
			width: 40px;
			height: 40px;
		}

		.brand-title {
			font-size: var(--font-size-lg);
		}

		.brand-subtitle {
			font-size: 0.75rem;
		}
	}
</style>
