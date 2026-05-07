<script lang="ts">
	import { DEMO_KPIS, demoProducts } from '$lib/superstore/mms-admin-demo-data';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';
	import SuperstoreMiniBottle from '$lib/components/superstore/SuperstoreMiniBottle.svelte';
	import SuperstoreIconBtns from '$lib/components/superstore/SuperstoreIconBtns.svelte';

	const skuCount = demoProducts.length;
	const lowStock = demoProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;

	function pct(stock: number, max: number) {
		return Math.min(100, Math.round((stock / max) * 100));
	}

	function barColor(stock: number) {
		if (stock === 0) return '#E05252';
		if (stock <= 5) return '#E8B434';
		return '#4CAF82';
	}
</script>

<svelte:head>
	<title>MMS Admin · Inventory</title>
</svelte:head>

<div class="grid gap-px bg-mms-gold/10 sm:grid-cols-3">
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-mms-cream">{skuCount}</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Total SKUs</p>
	</div>
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-[#E05252]">{DEMO_KPIS.outOfStock}</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Out of stock</p>
	</div>
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-mms-cream">{lowStock}</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Low stock</p>
	</div>
</div>

<div class="mt-8 bg-mms-ink2">
	<div class="flex flex-wrap items-center justify-between gap-4 border-b border-mms-gold/[0.06] px-6 py-5">
		<h2 class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Stock levels</h2>
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class="rounded border border-mms-gold/25 px-4 py-2 text-[0.6rem] tracking-[0.15em] text-mms-muted uppercase hover:border-mms-gold hover:text-mms-gold"
				disabled
			>
				Export
			</button>
			<button
				type="button"
				class="rounded bg-mms-gold px-4 py-2 text-[0.6rem] font-medium tracking-[0.12em] text-mms-ink uppercase hover:bg-mms-gold-light"
				disabled
			>
				+ Restock
			</button>
		</div>
	</div>
	<div class="overflow-x-auto">
		<table class="w-full min-w-[52rem] border-collapse text-left text-[0.75rem]">
			<thead>
				<tr class="border-b border-mms-gold/[0.06] bg-mms-gold/[0.03] text-[0.58rem] tracking-[0.18em] text-mms-muted uppercase">
					<th class="px-6 py-3">Product</th>
					<th class="px-6 py-3">SKU</th>
					<th class="px-6 py-3">Category</th>
					<th class="px-6 py-3">In stock</th>
					<th class="px-6 py-3">Level</th>
					<th class="px-6 py-3">Status</th>
					<th class="px-6 py-3">Action</th>
				</tr>
			</thead>
			<tbody class="text-mms-cream">
				{#each demoProducts as p (p.sku)}
					<tr class="border-b border-mms-gold/[0.04] transition-colors hover:bg-mms-gold/[0.06]">
						<td class="px-6 py-3">
							<div class="flex items-center gap-2">
								<SuperstoreMiniBottle /><span>{p.name}</span>
							</div>
						</td>
						<td class="px-6 py-3 font-mono text-[0.68rem] text-mms-muted">{p.sku}</td>
						<td class="px-6 py-3 text-[0.65rem] tracking-wider text-mms-muted uppercase">{p.category}</td>
						<td class="px-6 py-3">
							<strong>{p.stock}</strong><span class="text-mms-muted"> / {p.max}</span>
						</td>
						<td class="px-6 py-3">
							<div class="h-1 w-20 rounded-sm bg-mms-gold/10">
								<div
									class="h-full rounded-sm"
									style="width: {pct(p.stock, p.max)}%; background: {barColor(p.stock)}"
								></div>
							</div>
						</td>
						<td class="px-6 py-3"><SuperstoreStatusPill status={p.status} variant="product" /></td>
						<td class="px-6 py-3"><SuperstoreIconBtns /></td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
