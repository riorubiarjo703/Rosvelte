<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import { enhance } from '$app/forms';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';

	let { data, form } = $props();

	const ordersExportHref = $derived(
		resolvedLocalizedHref('/superstore/orders/export' as Pathname)
	);
	const ordersExportJsonHref = $derived(`${ordersExportHref}?format=json`);
	const ordersExportCsvHref = $derived(`${ordersExportHref}?format=csv`);
	const ordersExportXlsxHref = $derived(`${ordersExportHref}?format=xlsx`);
</script>

<svelte:head>
	<title>MMS Admin · Orders</title>
</svelte:head>

<div class="grid gap-px bg-mms-gold/10 sm:grid-cols-3">
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-mms-cream">
			{data.kpis.ordersThisMonth.toLocaleString()}
		</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Orders (this month)</p>
	</div>
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-mms-gold">{data.kpis.totalRevenueDisplay}</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Revenue (all time)</p>
	</div>
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-[#E05252]">{data.kpis.badgeOrders}</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Pending</p>
	</div>
</div>

<div class="mt-8 bg-mms-ink2">
	{#if form?.message}
		<p class="border-b border-mms-gold/[0.06] px-6 py-3 text-[0.72rem] text-red-400">{form.message}</p>
	{/if}
	{#if form?.importResult}
		<div
			class="mx-6 mt-4 rounded border border-emerald-500/25 bg-emerald-950/20 px-4 py-3 text-[0.72rem] leading-relaxed text-emerald-100"
		>
			Imported <strong>{form.importResult.created}</strong> new and updated <strong>{form.importResult.updated}</strong> by
			order code.
			{#if form.importResult.errors.length > 0}
				<p class="mt-2 text-[0.65rem] text-amber-200/90">Some rows failed:</p>
				<ul class="mt-1 max-h-40 list-inside list-disc overflow-y-auto text-[0.65rem] text-amber-100/85">
					{#each form.importResult.errors as err}
						<li>{err}</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
	<div class="flex flex-wrap items-center justify-between gap-4 border-b border-mms-gold/[0.06] px-6 py-5">
		<h2 class="text-[0.75rem] font-medium tracking-wide text-mms-cream">All orders</h2>
		<div class="flex flex-wrap items-center gap-2">
			<details class="group relative">
				<summary
					class="cursor-pointer list-none rounded border border-mms-gold/25 px-4 py-2 text-[0.6rem] tracking-[0.15em] text-mms-muted uppercase transition marker:content-none hover:border-mms-gold hover:text-mms-gold [&::-webkit-details-marker]:hidden"
				>
					Export / import
				</summary>
				<div
					class="absolute right-0 z-20 mt-2 w-[min(calc(100vw-3rem),22rem)] rounded border border-mms-gold/15 bg-mms-ink3 p-4 text-left shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
				>
					<p class="mb-3 text-[0.65rem] leading-relaxed text-mms-muted">
						<strong class="text-mms-cream">Export</strong> downloads all orders as JSON, CSV, or Excel.
						<strong class="text-mms-cream">Import</strong> merges by <code class="text-mms-gold/90">orderCode</code> (e.g.
						ORD-2842; optional <code class="text-mms-gold/90">#</code> prefix). <code class="text-mms-gold/90">totalIdr</code>
						is integer Rupiah. Empty <code class="text-mms-gold/90">orderedAt</code> on update keeps the existing timestamp.
					</p>
					<div class="mb-4 grid grid-cols-3 gap-2">
						<a
							href={ordersExportJsonHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							JSON
						</a>
						<a
							href={ordersExportCsvHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							CSV
						</a>
						<a
							href={ordersExportXlsxHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							Excel
						</a>
					</div>
					<form method="POST" action="?/importOrders" enctype="multipart/form-data" use:enhance>
						<span class="mb-2 block text-[0.55rem] uppercase tracking-[0.18em] text-mms-muted">Import merge</span>
						<input
							name="file"
							type="file"
							accept="application/json,.json,text/csv,.csv,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
							required
							class="mb-3 w-full max-w-full text-[0.65rem] text-mms-muted file:mr-2 file:rounded file:border file:border-mms-gold/30 file:bg-mms-ink2 file:px-2 file:py-1 file:text-[0.58rem] file:text-mms-gold"
						/>
						<button
							type="submit"
							class="w-full rounded bg-mms-gold/15 py-2.5 text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold transition hover:bg-mms-gold/25"
						>
							Run import
						</button>
					</form>
				</div>
			</details>
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
				{#each data.orders as o (o.dbId)}
					<tr class="border-b border-mms-gold/[0.04] transition-colors hover:bg-mms-gold/[0.06]">
						<td class="px-6 py-3 font-mms-display">
							<a
								class="text-mms-gold hover:underline"
								href={resolve('/superstore/orders/[id]', { id: String(o.dbId) })}
							>{o.id}</a>
						</td>
						<td class="px-6 py-3">{o.customer}</td>
						<td class="px-6 py-3">{o.product}</td>
						<td class="px-6 py-3 text-mms-muted">{o.date}</td>
						<td class="px-6 py-3 text-mms-gold">{o.total}</td>
						<td class="px-6 py-3"><SuperstoreStatusPill status={o.status} variant="order" /></td>
						<td class="px-6 py-3">
							<a
								href={resolve('/superstore/orders/[id]', { id: String(o.dbId) })}
								class="inline-flex size-[26px] items-center justify-center rounded border border-mms-gold/10 text-mms-gold transition-colors hover:border-mms-gold"
								aria-label="View order details"
							>
								<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
									<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
									<circle cx="12" cy="12" r="3" />
								</svg>
							</a>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

{#if data.orders.length === 0}
	<p class="mt-6 px-6 text-[0.72rem] text-mms-muted">
		No orders yet. Run <code class="text-mms-gold/80">npm run db:seed:orders</code> after <code class="text-mms-gold/80">npm run db:push</code>, or import a file.
	</p>
{/if}
