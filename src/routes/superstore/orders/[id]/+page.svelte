<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const order = $derived(data.order);
	const lines = $derived(order.linesPayload ?? []);

	function fmtDate(d: Date): string {
		return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
	}

	function formatIdr(n: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
	}
</script>

<svelte:head>
	<title>MMS Admin · Order #{order.orderCode}</title>
</svelte:head>

<div class="mx-auto max-w-4xl px-6 py-8">
	<p class="mb-2 text-[0.58rem] uppercase tracking-[0.2em] text-mms-muted">
		<a href={resolve('/superstore/orders')} class="text-mms-gold hover:underline">Orders</a>
		<span class="mx-2 text-mms-gold/40">/</span>
		#{order.orderCode}
	</p>
	<h1 class="font-mms-display text-2xl font-light text-mms-cream">
		Order <span class="text-mms-gold">#{order.orderCode}</span>
	</h1>

	<div class="mt-8 grid gap-6 md:grid-cols-2">
		<section class="rounded border border-mms-gold/10 bg-mms-ink2 p-5">
			<h2 class="mb-3 text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">Customer</h2>
			<dl class="space-y-2 text-[0.78rem]">
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Name</dt><dd>{order.customerName}</dd></div>
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Email</dt><dd class="break-all">{order.customerEmail}</dd></div>
				{#if order.phone}
					<div class="flex justify-between gap-4"><dt class="text-mms-muted">Phone</dt><dd>{order.phone}</dd></div>
				{/if}
			</dl>
		</section>

		<section class="rounded border border-mms-gold/10 bg-mms-ink2 p-5">
			<h2 class="mb-3 text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">Delivery</h2>
			<dl class="space-y-2 text-[0.78rem]">
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Shipping</dt><dd>{order.shippingLabel || '—'}</dd></div>
				<div class="flex flex-col gap-1">
					<dt class="text-mms-muted">Address</dt>
					<dd class="whitespace-pre-wrap text-mms-cream/90">{order.addressLabel || '—'}</dd>
				</div>
			</dl>
		</section>
	</div>

	<section class="mt-6 rounded border border-mms-gold/10 bg-mms-ink2 p-5">
		<h2 class="mb-3 text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">Payment & status</h2>
		<dl class="grid gap-3 text-[0.78rem] sm:grid-cols-2">
			<div class="flex justify-between gap-4"><dt class="text-mms-muted">Total</dt><dd class="text-mms-gold">{formatIdr(order.totalIdr)}</dd></div>
			<div class="flex justify-between gap-4"><dt class="text-mms-muted">Payment status</dt><dd>{order.paymentStatus}</dd></div>
			<div class="flex justify-between gap-4"><dt class="text-mms-muted">Order status</dt><dd>{order.status}</dd></div>
			<div class="flex justify-between gap-4"><dt class="text-mms-muted">Ordered</dt><dd>{fmtDate(order.orderedAt)}</dd></div>
			{#if order.xenditInvoiceId}
				<div class="flex justify-between gap-4 sm:col-span-2"><dt class="text-mms-muted">Xendit invoice</dt><dd class="break-all font-mono text-[0.68rem]">{order.xenditInvoiceId}</dd></div>
			{/if}
			{#if order.xenditExternalId}
				<div class="flex justify-between gap-4 sm:col-span-2"><dt class="text-mms-muted">External ID</dt><dd class="break-all font-mono text-[0.68rem]">{order.xenditExternalId}</dd></div>
			{/if}
		</dl>
	</section>

	<section class="mt-6 rounded border border-mms-gold/10 bg-mms-ink2 p-5">
		<h2 class="mb-4 text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">Line items</h2>
		{#if lines.length === 0}
			<p class="text-[0.78rem] text-mms-muted">No line payload stored.</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-left text-[0.75rem]">
					<thead>
						<tr class="border-b border-mms-gold/10 text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">
							<th class="py-2 pr-4">SKU</th>
							<th class="py-2 pr-4">Product</th>
							<th class="py-2 pr-4">Qty</th>
							<th class="py-2 text-right">Line total</th>
						</tr>
					</thead>
					<tbody>
						{#each lines as line}
							<tr class="border-b border-mms-gold/[0.06]">
								<td class="py-2 pr-4 font-mono text-[0.68rem]">{line.sku}</td>
								<td class="py-2 pr-4">{line.name}</td>
								<td class="py-2 pr-4">{line.qty}</td>
								<td class="py-2 text-right">{formatIdr(line.lineTotalIdr)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<dl class="mt-4 flex flex-wrap gap-x-8 gap-y-2 border-t border-mms-gold/10 pt-4 text-[0.72rem] text-mms-muted">
				<div>Subtotal <span class="text-mms-cream">{formatIdr(order.subtotalIdr)}</span></div>
				<div>Shipping <span class="text-mms-cream">{formatIdr(order.shippingIdr)}</span></div>
				<div>Tax <span class="text-mms-cream">{formatIdr(order.taxIdr)}</span></div>
				{#if order.promoDiscountIdr > 0}
					<div>Promo <span class="text-mms-cream">−{formatIdr(order.promoDiscountIdr)}</span></div>
				{/if}
			</dl>
		{/if}
	</section>
</div>
