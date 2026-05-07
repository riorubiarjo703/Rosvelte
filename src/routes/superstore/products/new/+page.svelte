<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolvedLocalizedHref } from '$lib/paraglide/resolved-href';

	type CatalogFieldErrors = Partial<Record<string, string[] | undefined>>;

	let { form } = $props();

	const fe = $derived((form?.errors as CatalogFieldErrors | undefined) ?? {});

	function hrefFor(path: Pathname) {
		return resolvedLocalizedHref(path);
	}

	const cats = [
		{ v: 'scotch', l: 'Scotch' },
		{ v: 'cognac', l: 'Cognac' },
		{ v: 'japanese', l: 'Japanese' },
		{ v: 'tequila', l: 'Tequila' },
		{ v: 'rum', l: 'Rum' },
		{ v: 'other', l: 'Other' }
	] as const;

	const badges = [
		{ v: '', l: 'None' },
		{ v: 'rare', l: 'Rare' },
		{ v: 'new', l: 'New' },
		{ v: 'limited', l: 'Limited' },
		{ v: 'exclusive', l: 'Exclusive' }
	] as const;
</script>

<svelte:head>
	<title>MMS Admin · Add Product</title>
</svelte:head>

{#if form?.message}
	<p class="mb-4 px-6 text-[0.75rem] text-red-400">{form.message}</p>
{/if}

<form class="space-y-px bg-mms-gold/10 relative" method="POST" action="?/createProduct" enctype="multipart/form-data">
	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-6 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Basic information
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="name">Product name</label>
				<input
					id="name"
					name="name"
					required
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="e.g. Macallan 18 Sherry"
				/>
				{#if fe.name}<span class="text-[0.65rem] text-red-400">{fe.name.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="sku">SKU</label>
				<input
					id="sku"
					name="sku"
					required
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="e.g. MMS-SCT-MAC-18-700"
				/>
				{#if fe.sku}<span class="text-[0.65rem] text-red-400">{fe.sku.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="slug">URL slug (optional)</label>
				<input
					id="slug"
					name="slug"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="auto from name"
				/>
				{#if fe.slug}<span class="text-[0.65rem] text-red-400">{fe.slug.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="region">Region</label>
				<input
					id="region"
					name="region"
					required
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="e.g. Speyside"
				/>
				{#if fe.region}<span class="text-[0.65rem] text-red-400">{fe.region.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="country">Country</label>
				<input
					id="country"
					name="country"
					required
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="e.g. Scotland"
				/>
				{#if fe.country}<span class="text-[0.65rem] text-red-400">{fe.country.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="cat">Category</label>
				<select
					id="cat"
					name="cat"
					required
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				>
					{#each cats as c}
						<option value={c.v}>{c.l}</option>
					{/each}
				</select>
				{#if fe.cat}<span class="text-[0.65rem] text-red-400">{fe.cat.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="badge">Badge</label>
				<select
					id="badge"
					name="badge"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				>
					{#each badges as b}
						<option value={b.v}>{b.l}</option>
					{/each}
				</select>
				{#if fe.badge}<span class="text-[0.65rem] text-red-400">{fe.badge.join(', ')}</span>{/if}
			</div>
			<div class="md:col-span-2">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="desc">Short description</label>
				<textarea
					id="desc"
					name="desc"
					required
					rows="4"
					class="mt-1 w-full border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="Listing card copy…"
				></textarea>
				{#if fe.desc}<span class="text-[0.65rem] text-red-400">{fe.desc.join(', ')}</span>{/if}
			</div>
		</div>
	</section>

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-6 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Specs & commerce
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="age">Age statement</label>
				<input
					id="age"
					name="age"
					required
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="18 / NAS / XO"
				/>
				{#if fe.age}<span class="text-[0.65rem] text-red-400">{fe.age.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="abv">ABV (%)</label>
				<input
					id="abv"
					name="abv"
					required
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="43"
				/>
				{#if fe.abv}<span class="text-[0.65rem] text-red-400">{fe.abv.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="price">Price (IDR, integer)</label>
				<input
					id="price"
					name="price"
					type="number"
					min="0"
					required
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="5800000"
				/>
				{#if fe.price}<span class="text-[0.65rem] text-red-400">{fe.price.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="stockQty">Stock quantity</label>
				<input
					id="stockQty"
					name="stockQty"
					type="number"
					min="0"
					value="12"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.stockQty}<span class="text-[0.65rem] text-red-400">{fe.stockQty.join(', ')}</span>{/if}
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="rating">MMS score (0–100)</label>
				<input
					id="rating"
					name="rating"
					type="number"
					min="0"
					max="100"
					required
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					placeholder="96"
				/>
				{#if fe.rating}<span class="text-[0.65rem] text-red-400">{fe.rating.join(', ')}</span>{/if}
			</div>
			<div class="flex items-center gap-2 pt-6">
				<input id="published" name="published" type="checkbox" checked class="accent-mms-gold" />
				<label class="text-[0.65rem] tracking-[0.15em] text-mms-muted uppercase" for="published">Published on storefront</label>
			</div>
		</div>
	</section>

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-6 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Product images (optional, up to 4)
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<p class="mb-6 text-[0.72rem] text-mms-muted">
			JPEG, PNG, or WebP. Slot 1 is the collections grid cover; all filled slots appear on the product page when published. You can change them anytime from edit.
		</p>
		<div class="grid gap-6 md:grid-cols-2">
			{#each [0, 1, 2, 3] as i (i)}
				<div class="rounded border border-mms-gold/10 bg-mms-ink3/40 p-4">
					<p class="mb-3 font-mms-sans text-[0.58rem] uppercase tracking-[0.2em] text-mms-gold-dim">
						Image {i + 1}{i === 0 ? ' · cover' : ''}
					</p>
					<input
						type="file"
						name={`productImage${i}`}
						accept="image/jpeg,image/png,image/webp"
						class="max-w-full text-[0.72rem] text-mms-muted file:mr-3 file:rounded file:border file:border-mms-gold/30 file:bg-mms-ink3 file:px-3 file:py-1.5 file:text-[0.65rem] file:text-mms-gold"
					/>
				</div>
			{/each}
		</div>
	</section>

	<section class="bg-mms-ink2 px-6 pt-6 pb-16">
		<h3 class="mb-6 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Product detail JSON (optional)
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<p class="mb-3 text-[0.72rem] text-mms-muted">
			Leave empty to auto-build tabs, tasting notes, specs, and reviews from the fields above (same behaviour as demo products).
			Paste a full payload (watermark, subtitle, about, tasting, specs, reviews) to override the PDP.
		</p>
		<textarea
			id="detailJson"
			name="detailJson"
			rows="14"
			class="w-full border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 font-mono text-[0.72rem] text-mms-cream outline-none focus:border-mms-gold/40"
			placeholder={'{\n  "watermark": "…",\n  "subtitle": "…",\n  …\n}'}
		></textarea>
	</section>

	<div class="flex flex-wrap justify-end gap-3 bg-mms-ink2 px-6 py-6 fixed w-full z-[2] bottom-0 left-0">
		<a
			href={hrefFor('/superstore/products')}
			class="rounded border border-mms-gold/25 px-5 py-2.5 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase no-underline hover:border-mms-gold hover:text-mms-gold"
			data-sveltekit-preload-data="hover">Cancel</a
		>
		<button
			type="submit"
			class="rounded bg-mms-gold px-5 py-2.5 text-[0.62rem] font-medium tracking-[0.12em] text-mms-ink uppercase hover:bg-mms-gold-light"
		>
			Create product
		</button>
	</div>
</form>
