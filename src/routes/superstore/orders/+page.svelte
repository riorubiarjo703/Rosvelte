<script lang="ts">
	import { DEMO_KPIS, demoOrders } from '$lib/superstore/mms-admin-demo-data';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';
	import SuperstoreIconBtns from '$lib/components/superstore/SuperstoreIconBtns.svelte';
</script>

<svelte:head>
	<title>MMS Admin · Orders</title>
</svelte:head>

<div class="grid gap-px bg-mms-gold/10 sm:grid-cols-3">
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-mms-cream">{DEMO_KPIS.ordersThisMonth}</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Total orders</p>
	</div>
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-mms-gold">{DEMO_KPIS.totalRevenueDisplay}</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Revenue</p>
	</div>
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-[#E05252]">{DEMO_KPIS.badgeOrders}</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Pending</p>
	</div>
</div>

<div class="mt-8 bg-mms-ink2">
	<div class="flex flex-wrap items-center justify-between gap-4 border-b border-mms-gold/[0.06] px-6 py-5">
		<h2 class="text-[0.75rem] font-medium tracking-wide text-mms-cream">All orders</h2>
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class="rounded border border-mms-gold/25 px-4 py-2 text-[0.6rem] tracking-[0.15em] text-mms-muted uppercase transition-colors hover:border-mms-gold hover:text-mms-gold"
				disabled
			>
				Export CSV
			</button>
			<button
				type="button"
				class="rounded bg-mms-gold px-4 py-2 text-[0.6rem] font-medium tracking-[0.12em] text-mms-ink uppercase transition-colors hover:bg-mms-gold-light"
				disabled
			>
				+ New order
			</button>
		</div>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full min-w-[52rem] border-collapse text-left text-[0.75rem] text-mms-cream">
			<thead>
				<tr class="border-b border-mms-gold/[0.06] bg-mms-gold/[0.03] text-[0.58rem] tracking-[0.18em] text-mms-muted uppercase">
					<th class="px-6 py-3">Order ID</th>
					<th class="px-6 py-3">Customer</th>
					<th class="px-6 py-3">Products</th>
					<th class="px-6 py-3">Date</th>
					<th class="px-6 py-3">Total</th>
					<th class="px-6 py-3">Status</th>
					<th class="px-6 py-3">Action</th>
				</tr>
			</thead>
			<tbody>
				{#each demoOrders as o (o.id)}
					<tr class="border-b border-mms-gold/[0.04] transition-colors hover:bg-mms-gold/[0.06]">
						<td class="px-6 py-3 font-mms-display text-mms-gold">{o.id}</td>
						<td class="px-6 py-3">{o.customer}</td>
						<td class="px-6 py-3">{o.product}</td>
						<td class="px-6 py-3 text-mms-muted">{o.date}</td>
						<td class="px-6 py-3 text-mms-gold">{o.total}</td>
						<td class="px-6 py-3"><SuperstoreStatusPill status={o.status} variant="order" /></td>
						<td class="px-6 py-3"><SuperstoreIconBtns /></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<p class="mt-6 text-[0.72rem] text-mms-muted">
	Demo rows from <code class="text-mms-gold/80">demoOrders</code> — replace with API integration.
</p>
