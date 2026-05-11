<script lang="ts">
	import { resolve } from '$app/paths';
	import { clearCart, formatIdr } from '$lib/cart/mms-cart';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const collectionsPath = resolve('/collections');

	onMount(() => {
		clearCart();
	});
</script>

<svelte:head>
	<title>Payment successful - Rosvelte</title>
</svelte:head>

<div class="wrap">
	<div class="card">
		<div class="icon" aria-hidden="true">
			<svg viewBox="0 0 24 24">
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		</div>
		<h1>Payment <em>received</em></h1>
		<p class="sub">
			Thank you, {data.order.customerName.split(' ')[0] ?? 'friend'}. If you paid via bank transfer or VA, confirmation may take a
			moment — we will email you when the order is confirmed.
		</p>
		<dl class="meta">
			<div class="row">
				<dt>Order</dt>
				<dd class="gold">#{data.order.orderCode}</dd>
			</div>
			<div class="row">
				<dt>Total</dt>
				<dd class="gold">{formatIdr(data.order.totalIdr)}</dd>
			</div>
			<div class="row">
				<dt>Items</dt>
				<dd>{data.order.productSummary}</dd>
			</div>
		</dl>
		<div class="actions">
			<a href={collectionsPath} class="btn primary">Continue shopping</a>
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
		max-width: 440px;
		text-align: center;
		border: 1px solid rgba(201, 168, 76, 0.15);
		background: #1a1713;
		padding: 2.5rem 2rem;
	}

	.icon {
		width: 64px;
		height: 64px;
		margin: 0 auto 1.5rem;
		border-radius: 50%;
		border: 1.5px solid #c9a84c;
		display: grid;
		place-items: center;
	}

	.icon svg {
		width: 28px;
		height: 28px;
		stroke: #c9a84c;
		fill: none;
		stroke-width: 2;
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

	.meta {
		text-align: left;
		border: 1px solid rgba(201, 168, 76, 0.12);
		padding: 1rem 1.25rem;
		margin-bottom: 1.75rem;
	}

	.row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.4rem 0;
		font-size: 0.78rem;
		border-bottom: 1px solid rgba(201, 168, 76, 0.06);
	}

	.row:last-child {
		border-bottom: 0;
	}

	dt {
		color: #6b6355;
	}

	dd {
		margin: 0;
		text-align: right;
		color: #f5f0e8;
	}

	.gold {
		color: #c9a84c !important;
	}

	.actions {
		display: flex;
		justify-content: center;
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
</style>
