<script lang="ts">
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const accountOrdersHref = `${resolve('/account')}?section=orders`;

	const order = $derived(data.order);
	const lines = $derived(order.linesPayload ?? []);

	function fmtDate(d: Date): string {
		return new Date(d).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
	}

	function formatIdr(n: number): string {
		return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
	}

	function paymentLabel(ps: string): string {
		if (ps === 'paid') return 'Paid';
		if (ps === 'pending_payment') return 'Awaiting payment';
		if (ps === 'expired') return 'Expired';
		if (ps === 'failed') return 'Failed';
		return ps;
	}

	function statusLabel(s: string): string {
		if (s === 'active') return 'Confirmed';
		if (s === 'pending') return 'Processing';
		return s;
	}
</script>

<svelte:head>
	<title>Order #{order.orderCode} — Rosvelte</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl px-4 py-8 md:px-6">
	<p class="mb-2 text-[0.58rem] uppercase tracking-[0.2em] text-mms-muted">
		<a href={accountOrdersHref} class="text-mms-gold hover:underline">My orders</a>
		<span class="mx-2 text-mms-gold/40">/</span>
		#{order.orderCode}
	</p>
	<h1 class="font-mms-display text-2xl font-light text-mms-cream md:text-[1.85rem]">
		Order <span class="text-mms-gold-light italic">#{order.orderCode}</span>
	</h1>

	<div class="mt-8 grid gap-6 md:grid-cols-2">
		<section class="rounded border border-mms-gold/12 bg-[#1a1713] p-5">
			<h2 class="mb-3 text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">Delivery details</h2>
			<dl class="space-y-2 text-[0.8rem]">
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Name</dt><dd>{order.customerName}</dd></div>
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Email</dt><dd class="break-all">{order.customerEmail}</dd></div>
				{#if order.phone}
					<div class="flex justify-between gap-4"><dt class="text-mms-muted">Phone</dt><dd>{order.phone}</dd></div>
				{/if}
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Shipping</dt><dd>{order.shippingLabel || '—'}</dd></div>
				<div class="flex flex-col gap-1 pt-1">
					<dt class="text-mms-muted">Address</dt>
					<dd class="whitespace-pre-wrap leading-relaxed text-mms-cream/95">{order.addressLabel || '—'}</dd>
				</div>
			</dl>
		</section>

		<section class="rounded border border-mms-gold/12 bg-[#1a1713] p-5">
			<h2 class="mb-3 text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">Payment & status</h2>
			<dl class="space-y-2 text-[0.8rem]">
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Total</dt><dd class="font-mms-display text-mms-gold">{formatIdr(order.totalIdr)}</dd></div>
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Payment</dt><dd>{paymentLabel(order.paymentStatus)}</dd></div>
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Order status</dt><dd>{statusLabel(order.status)}</dd></div>
				<div class="flex justify-between gap-4"><dt class="text-mms-muted">Placed</dt><dd>{fmtDate(order.orderedAt)}</dd></div>
			</dl>
		</section>
	</div>

	<section class="mt-6 rounded border border-mms-gold/12 bg-[#1a1713] p-5">
		<h2 class="mb-4 text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">Items</h2>
		{#if lines.length === 0}
			<p class="text-[0.78rem] text-mms-muted">{order.productSummary}</p>
		{:else}
			<div class="overflow-x-auto">
				<table class="w-full border-collapse text-left text-[0.78rem]">
					<thead>
						<tr class="border-b border-mms-gold/10 text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">
							<th class="py-2 pr-3">Product</th>
							<th class="py-2 pr-3">Qty</th>
							<th class="py-2 text-right">Line total</th>
						</tr>
					</thead>
					<tbody>
						{#each lines as line}
							<tr class="border-b border-mms-gold/[0.06]">
								<td class="py-2.5 pr-3">
									<span class="block">{line.name}</span>
									<span class="text-[0.65rem] text-mms-muted">{line.country} · {line.region}</span>
								</td>
								<td class="py-2.5 pr-3">{line.qty}</td>
								<td class="py-2.5 text-right">{formatIdr(line.lineTotalIdr)}</td>
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

	<p class="mt-8 text-center">
		<a
			href={accountOrdersHref}
			class="inline-flex border border-mms-gold/35 px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.18em] text-mms-gold no-underline transition hover:bg-mms-gold hover:text-mms-ink"
		>
			Back to my orders
		</a>
	</p>
</div>
