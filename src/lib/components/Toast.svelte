<script lang="ts">
	import { onMount } from 'svelte';

	export let message: string = '';
	export let type: 'success' | 'error' | 'info' = 'info';
	export let duration: number = 3000;

	let visible: boolean = false;

	onMount(() => {
		visible = true;
		if (duration > 0) {
			setTimeout(() => {
				visible = false;
			}, duration);
		}
	});

	function close() {
		visible = false;
	}
</script>

{#if visible}
	<div class="toast" class:success={type === 'success'} class:error={type === 'error'} class:info={type === 'info'} role="alert">
		<span class="message">{message}</span>
		<button class="close" on:click={close} aria-label="Close">×</button>
	</div>
{/if}

<style>
	.toast {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		padding: 1rem 1.5rem;
		border-radius: 4px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
		gap: 1rem;
		min-width: 300px;
		max-width: 500px;
		z-index: 1000;
		animation: slideIn 0.3s ease-out;
	}

	.toast.success {
		background: #d4edda;
		color: #155724;
		border-left: 4px solid #28a745;
	}

	.toast.error {
		background: #f8d7da;
		color: #721c24;
		border-left: 4px solid #dc3545;
	}

	.toast.info {
		background: #d1ecf1;
		color: #0c5460;
		border-left: 4px solid #17a2b8;
	}

	.message {
		flex: 1;
	}

	.close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		line-height: 1;
		opacity: 0.7;
	}

	.close:hover {
		opacity: 1;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>

