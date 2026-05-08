<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';
	import SuperstoreMiniBottle from '$lib/components/superstore/SuperstoreMiniBottle.svelte';

	let { data, form } = $props();

	const skuCount = $derived(data.products.length);
	const outOfStock = $derived(data.products.filter((p) => p.stockQty === 0).length);
	const lowStock = $derived(data.products.filter((p) => p.stockQty > 0 && p.stockQty <= 5).length);
	const maxStock = $derived(Math.max(12, ...data.products.map((p) => p.stockQty)));

	function pct(stock: number) {
		if (maxStock <= 0) return 0;
		const max = maxStock;
		return Math.min(100, Math.round((stock / max) * 100));
	}

	function barColor(stock: number) {
		if (stock === 0) return '#E05252';
		if (stock <= 5) return '#E8B434';
		return '#4CAF82';
	}

	function stockStatus(stock: number): string {
		if (stock === 0) return 'out';
		if (stock <= 5) return 'low';
		return 'active';
	}

	function uploadHref(uploadId: number): string {
		return resolvedLocalizedHref(`/superstore/uploads/${uploadId}` as Pathname);
	}

	function editHref(id: number): string {
		return resolvedLocalizedHref(`/superstore/products/${id}/edit` as Pathname);
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
		<p class="font-mms-display text-[1.6rem] font-light text-[#E05252]">{outOfStock}</p>
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
			<form method="POST" action="?/restockLow">
				<input type="hidden" name="threshold" value="5" />
				<input type="hidden" name="targetStock" value="20" />
				<button
					type="submit"
					class="rounded bg-mms-gold px-4 py-2 text-[0.6rem] font-medium tracking-[0.12em] text-mms-ink uppercase transition-colors hover:bg-mms-gold-light"
				>
					+ Restock
				</button>
			</form>
		</div>
	</div>
	{#if form?.message}
		<p class="border-b border-mms-gold/[0.06] px-6 py-3 text-[0.72rem] text-mms-gold">{form.message}</p>
	{/if}
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
				{#each data.products as p (p.id)}
					<tr class="border-b border-mms-gold/[0.04] transition-colors hover:bg-mms-gold/[0.06]">
						<td class="px-6 py-3">
							<div class="flex items-center gap-2">
								{#if p.heroImageUploadId}
									<img
										src={uploadHref(p.heroImageUploadId)}
										alt=""
										class="h-7 w-6 shrink-0 rounded-sm border border-mms-gold/15 object-contain"
									/>
								{:else}
									<SuperstoreMiniBottle />
								{/if}
								<span>{p.name}</span>
							</div>
						</td>
						<td class="px-6 py-3 font-mono text-[0.68rem] text-mms-muted">{p.sku}</td>
						<td class="px-6 py-3 text-[0.65rem] tracking-wider text-mms-muted uppercase">{p.cat}</td>
						<td class="px-6 py-3">
							<strong>{p.stockQty}</strong>
						</td>
						<td class="px-6 py-3">
							<div class="h-1 w-20 rounded-sm bg-mms-gold/10">
								<div
									class="h-full rounded-sm"
									style="width: {pct(p.stockQty)}%; background: {barColor(p.stockQty)}"
								></div>
							</div>
						</td>
						<td class="px-6 py-3"><SuperstoreStatusPill status={stockStatus(p.stockQty)} variant="product" /></td>
						<td class="px-6 py-3">
							<div class="flex gap-1">
								<a
									href={editHref(p.id)}
									class="flex size-[26px] items-center justify-center rounded border border-mms-gold/10 bg-transparent transition-colors hover:border-mms-gold"
									aria-label="Edit product"
								>
									<svg class="size-3 text-mms-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
										<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
										<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
									</svg>
								</a>
								<form method="POST" action="?/deleteProduct">
									<input type="hidden" name="id" value={p.id} />
									<button
										type="submit"
										class="flex size-[26px] items-center justify-center rounded border border-mms-gold/10 bg-transparent transition-colors hover:border-red-400"
										aria-label="Delete product"
									>
										<svg class="size-3 text-mms-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
										</svg>
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
