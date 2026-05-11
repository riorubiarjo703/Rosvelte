<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const checkoutPath = resolve('/checkout');
	const collectionsPath = resolve('/collections');
</script>

<svelte:head>
	<title>Payment incomplete - Rosvelte</title>
</svelte:head>

<div class="wrap">
	<div class="card">
		<h1>Payment <em>not completed</em></h1>
		<p class="sub">
			No charge was finalized for order <strong class="gold">#{data.order.orderCode}</strong>. You can return to checkout to try again or choose a
			different payment method on the Xendit page.
		</p>
		<div class="actions">
			<a href={checkoutPath} class="btn primary">Back to checkout</a>
			<a href={collectionsPath} class="btn ghost">Browse collection</a>
		</div>
	</div>
</div>

<style>
	.wrap {
		min-height: 100dvh;
		display: grid;
		place-items: center;
		padding: 2rem;
		background: #0d0b08;
		color: #f5f0e8;
		font-family: 'DM Sans', system-ui, sans-serif;
	}

	.card {
		max-width: 460px;
		text-align: center;
		border: 1px solid rgba(201, 168, 76, 0.15);
		background: #1a1713;
		padding: 2.5rem 2rem;
	}

	h1 {
		font-family: 'Cormorant Garamond', Georgia, serif;
		font-size: 2.5rem;
		font-weight: 300;
		margin-bottom: 0.75rem;
		line-height: 1.1;
	}

	h1 em {
		font-style: italic;
		color: #e8c97a;
	}

	.sub {
		font-size: 0.85rem;
		color: #6b6355;
		line-height: 1.7;
		margin-bottom: 1.75rem;
	}

	.gold {
		color: #c9a84c;
	}

	.actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.75rem;
	}

	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.85rem 1.75rem;
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.btn.primary {
		background: #c9a84c;
		color: #0d0b08;
		border: 0;
	}

	.btn.ghost {
		background: transparent;
		border: 1px solid rgba(201, 168, 76, 0.25);
		color: #6b6355;
	}
</style>
