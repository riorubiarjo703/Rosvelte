<script lang="ts">
	import type { Pathname } from '$app/types';
	import { enhance } from '$app/forms';
	import { resolvedLocalizedHref } from '$lib/paraglide/resolved-href';
	import { formatIdr } from '$lib/cart/mms-cart';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';
	import SuperstoreMiniBottle from '$lib/components/superstore/SuperstoreMiniBottle.svelte';

	let { data, form } = $props();

	function hrefFor(path: Pathname) {
		return resolvedLocalizedHref(path);
	}

	const catalogExportHref = $derived(
		resolvedLocalizedHref('/superstore/products/export' as Pathname)
	);
	const catalogExportJsonHref = $derived(`${catalogExportHref}?format=json`);
	const catalogExportCsvHref = $derived(`${catalogExportHref}?format=csv`);
	const catalogExportXlsxHref = $derived(`${catalogExportHref}?format=xlsx`);

	function editHref(id: number) {
		return resolvedLocalizedHref(`/superstore/products/${id}/edit` as Pathname);
	}

	function stockPct(stock: number, max: number) {
		return Math.min(100, Math.round((stock / max) * 100));
	}

	function stockColor(stock: number) {
		if (stock === 0) return '#E05252';
		if (stock <= 5) return '#E8B434';
		return '#4CAF82';
	}

	function stockStatus(stock: number): string {
		if (stock === 0) return 'out';
		if (stock <= 5) return 'low';
		return 'active';
	}

	const maxStock = $derived(Math.max(12, ...data.products.map((p) => p.stockQty)));
</script>

<svelte:head>
	<title>MMS Admin · Products</title>
</svelte:head>

<div class="bg-mms-ink2">
	<div class="flex flex-wrap items-center justify-between gap-4 border-b border-mms-gold/[0.06] px-6 py-5">
		<h2 class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Product catalogue</h2>
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
						<strong class="text-mms-cream">Export</strong> downloads all rows as JSON, CSV, or Excel.
						<strong class="text-mms-cream">Import</strong> accepts the same formats and merges by SKU (update existing,
						insert new). <code class="text-mms-gold/90">detailPayloadJson</code> is optional in CSV/Excel and can be
						left blank or removed; it only applies custom PDP detail JSON when provided.
					</p>
					<div class="mb-4 grid grid-cols-3 gap-2">
						<a
							href={catalogExportJsonHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							JSON
						</a>
						<a
							href={catalogExportCsvHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							CSV
						</a>
						<a
							href={catalogExportXlsxHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							Excel
						</a>
					</div>
					<form method="POST" action="?/importCatalog" enctype="multipart/form-data" use:enhance>
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
			<a
				href={hrefFor('/superstore/products/new')}
				class="rounded bg-mms-gold px-4 py-2 text-[0.6rem] font-medium tracking-[0.12em] text-mms-ink uppercase no-underline transition-colors hover:bg-mms-gold-light"
			>
				+ Add product
			</a>
		</div>
	</div>
	{#if form?.message}
		<p class="border-b border-mms-gold/[0.06] px-6 py-3 text-[0.72rem] text-red-400">{form.message}</p>
	{/if}
	{#if form?.importResult}
		<div
			class="mx-6 mt-4 rounded border border-emerald-500/25 bg-emerald-950/20 px-4 py-3 text-[0.72rem] leading-relaxed text-emerald-100"
		>
			Imported <strong>{form.importResult.created}</strong> new and updated <strong>{form.importResult.updated}</strong> by
			SKU.
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
	{#if data.products.length === 0}
		<p class="px-6 py-10 text-[0.75rem] text-mms-muted">
			No products in the database yet. Seed demo data with <code class="text-mms-gold">npm run db:seed:catalog</code> or add a product.
		</p>
	{:else}
		<div class="overflow-x-auto">
			<table class="w-full min-w-[56rem] border-collapse text-left text-[0.75rem]">
				<thead>
					<tr
						class="border-b border-mms-gold/[0.06] bg-mms-gold/[0.03] text-[0.58rem] tracking-[0.18em] text-mms-muted uppercase"
					>
						<th class="px-6 py-3">Product</th>
						<th class="px-6 py-3">Category</th>
						<th class="px-6 py-3">Price</th>
						<th class="px-6 py-3">Stock</th>
						<th class="px-6 py-3">Score</th>
						<th class="px-6 py-3">Status</th>
						<th class="px-6 py-3">Action</th>
					</tr>
				</thead>
				<tbody class="text-mms-cream">
					{#each data.products as p (p.id)}
						<tr class="border-b border-mms-gold/[0.04] transition-colors hover:bg-mms-gold/[0.06]">
							<td class="px-6 py-3">
								<div class="flex items-center gap-3">
									{#if p.heroImageUploadId}
										<img
											src={resolvedLocalizedHref(`/superstore/uploads/${p.heroImageUploadId}` as Pathname)}
											alt=""
											class="h-7 w-6 shrink-0 rounded-sm border border-mms-gold/15 object-contain"
										/>
									{:else}
										<SuperstoreMiniBottle />
									{/if}
									<div>
										<p class="text-[0.78rem]">
											{p.name}
											{#if !p.published}
												<span class="text-[0.58rem] tracking-wider text-mms-muted uppercase"> · Draft</span>
											{/if}
										</p>
										<p class="text-[0.6rem] text-mms-muted">{p.sku}</p>
									</div>
								</div>
							</td>
							<td class="px-6 py-3 text-[0.65rem] tracking-wider text-mms-muted uppercase">{p.cat}</td>
							<td class="px-6 py-3 text-mms-gold">{formatIdr(p.price)}</td>
							<td class="px-6 py-3">
								<div class="flex items-center gap-2">
									<span class="min-w-[1.25rem] text-[0.8rem]">{p.stockQty}</span>
									<div class="h-1 w-[60px] rounded-sm bg-mms-gold/10">
										<div
											class="h-full rounded-sm"
											style="width: {stockPct(p.stockQty, maxStock)}%; background: {stockColor(p.stockQty)}"
										></div>
									</div>
								</div>
							</td>
							<td class="px-6 py-3 font-mms-display text-[1rem] text-mms-gold">{p.rating}</td>
							<td class="px-6 py-3">
								<SuperstoreStatusPill status={stockStatus(p.stockQty)} variant="product" />
							</td>
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
									<form method="POST" action="?/deleteProduct" use:enhance>
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
	{/if}
</div>
