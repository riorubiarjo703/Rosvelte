<script lang="ts">
	import type { Pathname } from '$app/types';
	import { enhance } from '$app/forms';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';
	import SuperstoreMiniBottle from '$lib/components/superstore/SuperstoreMiniBottle.svelte';
	import SuperstoreFilterBar from '$lib/components/superstore/SuperstoreFilterBar.svelte';

	let { data, form } = $props();

	const inventoryExportHref = $derived(
		resolvedLocalizedHref('/superstore/inventory/export' as Pathname)
	);
	const inventoryExportJsonHref = $derived(`${inventoryExportHref}?format=json`);
	const inventoryExportCsvHref = $derived(`${inventoryExportHref}?format=csv`);
	const inventoryExportXlsxHref = $derived(`${inventoryExportHref}?format=xlsx`);

	let filterQuery = $state('');
	let filterCategory = $state('');
	let filterStock = $state<'all' | 'active' | 'low' | 'out'>('all');

	function stockStatus(stock: number): string {
		if (stock === 0) return 'out';
		if (stock <= 5) return 'low';
		return 'active';
	}

	const categories = $derived(
		[...new Set(data.products.map((p) => p.cat))].sort((a, b) => String(a).localeCompare(String(b)))
	);

	const filteredProducts = $derived(
		data.products.filter((p) => {
			const q = filterQuery.trim().toLowerCase();
			if (q) {
				const hay = `${p.name} ${p.sku}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			if (filterCategory && p.cat !== filterCategory) return false;
			if (filterStock !== 'all' && stockStatus(p.stockQty) !== filterStock) return false;
			return true;
		})
	);

	const skuCount = $derived(data.products.length);
	const outOfStock = $derived(data.products.filter((p) => p.stockQty === 0).length);
	const lowStock = $derived(data.products.filter((p) => p.stockQty > 0 && p.stockQty <= 5).length);
	const maxStock = $derived(
		filteredProducts.length === 0 ? 12 : Math.max(12, ...filteredProducts.map((p) => p.stockQty))
	);

	const selectClass =
		'min-w-[8.5rem] rounded border border-mms-gold/25 bg-mms-ink2 px-2.5 py-1.5 text-[0.68rem] text-mms-cream focus:border-mms-gold focus:outline-none';
	const inputClass =
		'min-w-[12rem] flex-1 rounded border border-mms-gold/25 bg-mms-ink2 px-2.5 py-1.5 text-[0.68rem] text-mms-cream placeholder:text-mms-muted/70 focus:border-mms-gold focus:outline-none';

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
	{#if form?.importResult}
		<div
			class="mx-6 mt-4 rounded border border-emerald-500/25 bg-emerald-950/20 px-4 py-3 text-[0.72rem] leading-relaxed text-emerald-100"
		>
			Updated <strong>{form.importResult.updated}</strong> SKU row(s).
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
		<h2 class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Stock levels</h2>
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
						<strong class="text-mms-cream">Export</strong> is SKU + <code class="text-mms-gold/90">stockQty</code> only.
						<strong class="text-mms-cream">Import</strong> updates existing catalogue rows by SKU; unknown SKUs are reported
						but skipped.
					</p>
					<div class="mb-4 grid grid-cols-3 gap-2">
						<a
							href={inventoryExportJsonHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							JSON
						</a>
						<a
							href={inventoryExportCsvHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							CSV
						</a>
						<a
							href={inventoryExportXlsxHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							Excel
						</a>
					</div>
					<form method="POST" action="?/importInventory" enctype="multipart/form-data" use:enhance>
						<span class="mb-2 block text-[0.55rem] uppercase tracking-[0.18em] text-mms-muted">Import stock</span>
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
	{#if data.products.length > 0}
		<SuperstoreFilterBar>
			<label class="flex min-w-[10rem] flex-1 flex-col gap-1">
				<span class="text-[0.55rem] tracking-[0.14em] text-mms-muted uppercase">Search</span>
				<input
					type="search"
					bind:value={filterQuery}
					placeholder="Name or SKU…"
					class={inputClass}
					autocomplete="off"
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-[0.55rem] tracking-[0.14em] text-mms-muted uppercase">Category</span>
				<select bind:value={filterCategory} class={selectClass}>
					<option value="">All</option>
					{#each categories as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-[0.55rem] tracking-[0.14em] text-mms-muted uppercase">Status</span>
				<select bind:value={filterStock} class={selectClass}>
					<option value="all">All</option>
					<option value="active">In stock</option>
					<option value="low">Low stock</option>
					<option value="out">Out of stock</option>
				</select>
			</label>
			<p class="ml-auto self-center text-[0.65rem] text-mms-muted">
				{filteredProducts.length} of {data.products.length}
			</p>
		</SuperstoreFilterBar>
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
				{#if data.products.length > 0 && filteredProducts.length === 0}
					<tr>
						<td colspan="7" class="px-6 py-8 text-center text-mms-muted">No rows match the current filters.</td>
					</tr>
				{:else}
					{#each filteredProducts as p (p.id)}
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
				{/if}
			</tbody>
		</table>
	</div>
</div>
