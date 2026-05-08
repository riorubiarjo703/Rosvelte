<script lang="ts">
	import { browser } from '$app/environment';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { addToCart, formatIdr } from '$lib/cart/mms-cart';
	import { mmsBuildCollectionsUrl } from '$lib/data/mms-site-nav';
	import { mmsBuildProductDetailModel, mmsRelatedProducts } from '$lib/data/mms-product-detail';
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';
	import ProductBottleShowcase from '$lib/components/product/ProductBottleShowcase.svelte';
	import ProductDetailTabs from '$lib/components/product/ProductDetailTabs.svelte';
	import ProductStickyBuyBar from '$lib/components/product/ProductStickyBuyBar.svelte';
	import CollectionBottleArt from '$lib/components/collections/CollectionBottleArt.svelte';
	import type { Pathname } from '$app/types';
	import { catalogHeroImagePublicPath } from '$lib/catalog/hero-image-path';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
	import { toggleWishlistProduct, wishlistEntries } from '$lib/wishlist/mms-wishlist';

	let { data } = $props();
	const product = $derived(data.product);

	const galleryUploadIds = $derived.by(() => {
		if (product.imageUploadIds != null && product.imageUploadIds.length > 0) {
			return product.imageUploadIds;
		}
		if (product.heroImageUploadId) return [product.heroImageUploadId];
		return [];
	});

	const productImageSrcs = $derived.by(() =>
		galleryUploadIds
			.map((id) => {
				const rel = catalogHeroImagePublicPath(id);
				return rel ? resolvedLocalizedHref(rel as Pathname) : '';
			})
			.filter((s): s is string => s.length > 0)
	);

	function catalogHeroHrefFor(p: { heroImageUploadId?: number | null; imageUploadIds?: number[] }) {
		const ids =
			p.imageUploadIds != null && p.imageUploadIds.length > 0
				? p.imageUploadIds
				: p.heroImageUploadId
					? [p.heroImageUploadId]
					: [];
		const first = ids[0];
		const rel = catalogHeroImagePublicPath(first);
		return rel ? resolvedLocalizedHref(rel as Pathname) : null;
	}
	const model = $derived(mmsBuildProductDetailModel(product, data.detailPayload));
	const related = $derived(mmsRelatedProducts(product, 4, data.catalogProducts));

	const collectionsPath = resolve('/collections');

	let sizeId = $state<'700' | '350' | '1000'>('700');
	let vintage = $state('2019');
	let qty = $state(1);
	let heroEl = $state<HTMLElement | null>(null);
	let showSticky = $state(false);
	const maxStockQty = $derived.by(() => {
		if (product.stockQty === undefined || !Number.isFinite(product.stockQty)) return null;
		return Math.max(0, Math.trunc(product.stockQty));
	});
	const isOutOfStock = $derived(maxStockQty !== null && maxStockQty <= 0);

	const displayPrice = $derived.by(() => {
		let base = product.price;
		if (sizeId === '350') base *= 0.8;
		if (sizeId === '1000') base += 800_000;
		return Math.round(base);
	});

	const priceLabel = $derived(formatIdr(displayPrice));

	function bumpQty(d: number) {
		if (isOutOfStock) return;
		let next = Math.min(6, Math.max(1, qty + d));
		if (maxStockQty !== null) next = Math.min(next, maxStockQty);
		qty = next;
	}

	function handleAdd() {
		if (isOutOfStock) return;
		addToCart(product, qty, { unitPrice: displayPrice });
	}

	async function shareProduct() {
		const url = typeof window !== 'undefined' ? window.location.href : '';
		try {
			await navigator.share?.({ title: product.name, url });
		} catch {
			try {
				await navigator.clipboard.writeText(url);
			} catch {
				/* ignore */
			}
		}
	}

	const starFilled = $derived(Math.min(5, Math.round(model.mmsScore / 20)));

	const loved = $derived($wishlistEntries.some((e) => e.productId === product.id));

	onMount(() => {
		if (!browser || !heroEl) return;
		const io = new IntersectionObserver(
			([e]) => {
				showSticky = (e?.intersectionRatio ?? 1) < 0.35;
			},
			{ threshold: [0, 0.15, 0.35, 0.55, 1] }
		);
		io.observe(heroEl);
		return () => io.disconnect();
	});
</script>

<svelte:head>
	<title>{product.name} — Rosvelte</title>
	<meta name="description" content={product.desc} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="product-detail-page min-h-dvh overflow-x-hidden bg-mms-ink pb-24 font-mms-sans text-mms-cream antialiased md:pb-8"
>
	<MmsSiteHeader />

	<nav
		class="flex flex-wrap items-center gap-x-2 gap-y-1 px-5 pb-2 pt-24 text-[0.62rem] uppercase tracking-[0.15em] text-mms-muted md:px-12 md:pb-0 md:pt-28"
		aria-label="Breadcrumb"
	>
		<a href={resolve('/')} class="transition hover:text-mms-gold">Home</a>
		<span class="text-mms-gold-dim">/</span>
		<a href={collectionsPath} class="transition hover:text-mms-gold">Collections</a>
		<span class="text-mms-gold-dim">/</span>
		<a
			href={mmsBuildCollectionsUrl(collectionsPath, { cat: product.cat, country: null, region: null })}
			class="capitalize transition hover:text-mms-gold">{product.cat}</a
		>
		<span class="text-mms-gold-dim">/</span>
		<a
			href={mmsBuildCollectionsUrl(collectionsPath, {
				cat: product.cat,
				country: null,
				region: product.region
			})}
			class="transition hover:text-mms-gold">{product.region}</a
		>
		<span class="text-mms-gold-dim">/</span>
		<span class="text-mms-cream">{product.name}</span>
	</nav>

	<section
		bind:this={heroEl}
		id="product-hero"
		class="grid grid-cols-1 gap-0 px-5 pb-12 pt-6 md:grid-cols-2 md:gap-8 md:px-12 md:pb-16 md:pt-8 lg:min-h-[85vh] lg:grid-cols-[1.12fr_0.88fr] lg:gap-12"
	>
		<ProductBottleShowcase
			watermark={model.watermark}
			badge={product.badge}
			productImageSrcs={productImageSrcs}
			productImageAlt={product.name}
		/>

		<div class="flex flex-col pt-6 md:pt-10 md:pl-0 lg:pl-4">
			<p
				class="mb-4 flex items-center gap-3 font-mms-sans text-[0.62rem] uppercase tracking-[0.25em] text-mms-gold-dim before:block before:h-px before:w-5 before:bg-mms-gold-dim"
			>
				{product.country} · {product.region} · {model.distilleryLine}
			</p>
			<h1 class="font-mms-display text-[clamp(2rem,4vw,3.25rem)] font-light leading-[0.98] text-mms-cream">
				{product.name}
			</h1>
			<p class="mt-3 text-[0.82rem] font-light tracking-wide text-mms-muted">{model.subtitle}</p>

			<div
				class="my-8 flex flex-wrap items-center gap-4 border-y border-mms-gold/[0.08] py-5 md:gap-6"
			>
				<div class="flex items-center gap-3">
					<span class="font-mms-display text-4xl font-light text-mms-gold md:text-[2.5rem]"
						>{model.mmsScore}</span
					>
					<div>
						<span class="mb-1 block font-mms-sans text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted"
							>MMS Score</span
						>
						<div class="flex gap-0.5" aria-hidden="true">
							{#each Array(5) as _, i (i)}
								<svg
									class="size-3 {i < starFilled ? 'text-mms-gold' : 'text-mms-muted/25'}"
									viewBox="0 0 24 24"
									fill="currentColor"
								>
									<path
										d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 4 2-7L2 9h7z"
									/>
								</svg>
							{/each}
						</div>
						<span class="mt-0.5 block font-mms-sans text-[0.72rem] text-mms-muted">/ 100</span>
					</div>
				</div>
				<div class="hidden h-9 w-px bg-mms-gold/15 sm:block"></div>
				<button
					type="button"
					class="border-b border-transparent font-mms-sans text-[0.7rem] text-mms-muted transition hover:border-mms-muted"
					onclick={() => {
						document.getElementById('tab-reviews-anchor')?.scrollIntoView({ behavior: 'smooth' });
					}}
				>
					{model.reviewCount} reviews
				</button>
				<div class="ml-auto flex items-center gap-3">
					<div
						class="flex size-8 items-center justify-center rounded-full border border-mms-gold/25 bg-mms-gold/10 font-mms-sans text-[0.62rem] font-medium text-mms-gold"
						aria-hidden="true"
					>
						{model.curator.initials}
					</div>
					<div>
						<span class="block font-mms-sans text-[0.65rem] text-mms-cream">{model.curator.name}</span>
						<span class="block font-mms-sans text-[0.58rem] text-mms-muted">{model.curator.role}</span>
					</div>
				</div>
			</div>

			<div class="mb-8 grid grid-cols-2 gap-px bg-mms-gold/10 md:grid-cols-4">
				<div class="bg-mms-ink2 px-3 py-4 text-center md:px-4">
					<span class="font-mms-display block text-xl text-mms-cream md:text-2xl">{product.age}</span>
					<span class="mt-1 block font-mms-sans text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted"
						>Age</span
					>
				</div>
				<div class="bg-mms-ink2 px-3 py-4 text-center md:px-4">
					<span class="font-mms-display block text-xl text-mms-cream md:text-2xl">{product.abv}%</span>
					<span class="mt-1 block font-mms-sans text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted"
						>ABV</span
					>
				</div>
				<div class="bg-mms-ink2 px-3 py-4 text-center md:px-4">
					<span class="font-mms-display block text-xl text-mms-cream md:text-2xl"
						>{sizeId === '350' ? '350ml' : sizeId === '1000' ? '1L' : '700ml'}</span
					>
					<span class="mt-1 block font-mms-sans text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted"
						>Volume</span
					>
				</div>
				<div class="bg-mms-ink2 px-3 py-4 text-center md:px-4">
					<span class="font-mms-display block text-xl text-mms-cream md:text-2xl">{model.caskTypeShort}</span>
					<span class="mt-1 block font-mms-sans text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted"
						>Cask type</span
					>
				</div>
			</div>

			<div class="mb-6">
				<p class="mb-2 font-mms-sans text-[0.62rem] uppercase tracking-[0.2em] text-mms-muted">Bottle size</p>
				<div class="flex flex-wrap gap-2">
					<button
						type="button"
						class="border px-4 py-2 font-mms-sans text-[0.7rem] tracking-wide transition {sizeId === '700'
							? 'border-mms-gold bg-mms-gold/10 text-mms-gold'
							: 'border-mms-gold/20 text-mms-muted hover:border-mms-gold-dim hover:text-mms-cream'}"
						onclick={() => (sizeId = '700')}>700ml</button
					>
					<button
						type="button"
						class="border px-4 py-2 font-mms-sans text-[0.7rem] tracking-wide transition {sizeId === '350'
							? 'border-mms-gold bg-mms-gold/10 text-mms-gold'
							: 'border-mms-gold/20 text-mms-muted hover:border-mms-gold-dim hover:text-mms-cream'}"
						onclick={() => (sizeId = '350')}
						>350ml <span class="text-[0.58rem] opacity-70">–20%</span></button
					>
					<button
						type="button"
						class="border px-4 py-2 font-mms-sans text-[0.7rem] tracking-wide transition {sizeId === '1000'
							? 'border-mms-gold bg-mms-gold/10 text-mms-gold'
							: 'border-mms-gold/20 text-mms-muted hover:border-mms-gold-dim hover:text-mms-cream'}"
						onclick={() => (sizeId = '1000')}
						>1L <span class="text-[0.58rem] opacity-70">+ Rp 800k</span></button
					>
				</div>
			</div>

			<div class="mb-6">
				<p class="mb-2 font-mms-sans text-[0.62rem] uppercase tracking-[0.2em] text-mms-muted">Vintage year</p>
				<div class="flex flex-wrap gap-2">
					{#each ['2019', '2018', '2017', '2016'] as y (y)}
						<button
							type="button"
							disabled={y === '2016'}
							class="border px-4 py-2 font-mms-sans text-[0.7rem] tracking-wide transition disabled:cursor-not-allowed disabled:opacity-35 {vintage === y
								? 'border-mms-gold bg-mms-gold/10 text-mms-gold'
								: 'border-mms-gold/20 text-mms-muted hover:border-mms-gold-dim hover:text-mms-cream'}"
							onclick={() => {
								if (y !== '2016') vintage = y;
							}}
						>
							{y}
							{#if y === '2017'}
								<span class="text-[0.58rem] text-mms-gold-dim"> · Last 2</span>
							{/if}
							{#if y === '2016'}
								<span class="text-[0.58rem]"> · Sold out</span>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<div class="mb-6">
				<p class="font-mms-display text-4xl font-light text-mms-gold">{priceLabel}</p>
				<p class="mt-2 flex flex-wrap items-center gap-2 font-mms-sans text-[0.68rem] text-mms-muted">
					Per bottle · incl. tax
					<span
						class="border border-mms-gold/15 bg-mms-gold/5 px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.12em] text-mms-gold-dim"
						>Free delivery above Rp 1.5M</span
					>
				</p>
				{#if maxStockQty !== null}
					<p class="mt-2 text-[0.62rem] uppercase tracking-[0.16em] {isOutOfStock ? 'text-red-400' : 'text-mms-muted'}">
						{isOutOfStock ? 'Out of stock' : `In stock: ${maxStockQty}`}
					</p>
				{/if}
			</div>

			<div class="mb-6 flex flex-wrap items-stretch gap-2 sm:flex-nowrap">
				<div class="flex border border-mms-gold/20">
					<button
						type="button"
						class="w-10 bg-transparent font-mms-sans text-mms-cream transition hover:bg-mms-gold/10"
						aria-label="Decrease quantity"
						onclick={() => bumpQty(-1)}>−</button
					>
					<span
						class="flex w-11 items-center justify-center border-x border-mms-gold/15 font-mms-sans text-[0.9rem] tabular-nums"
						>{qty}</span
					>
					<button
						type="button"
						class="w-10 bg-transparent font-mms-sans text-mms-cream transition hover:bg-mms-gold/10 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
						aria-label="Increase quantity"
						disabled={isOutOfStock || (maxStockQty !== null && qty >= maxStockQty)}
						onclick={() => bumpQty(1)}>+</button
					>
				</div>
				<button
					type="button"
					class="min-h-[3rem] flex-1 bg-mms-gold px-4 font-mms-sans text-[0.7rem] uppercase tracking-[0.22em] text-mms-ink transition hover:bg-mms-gold-light disabled:cursor-not-allowed disabled:bg-mms-gold/20 disabled:text-mms-muted disabled:hover:bg-mms-gold/20 sm:min-w-[200px]"
					disabled={isOutOfStock}
					onclick={handleAdd}
				>
					{isOutOfStock ? 'Out of stock' : 'Add to cart'}
				</button>
				<button
					type="button"
					class="flex size-[3rem] shrink-0 items-center justify-center border border-mms-gold/20 transition hover:border-mms-gold {loved
						? '[&_svg]:fill-mms-gold [&_svg]:stroke-mms-gold'
						: ''}"
					aria-pressed={loved}
					aria-label={loved ? 'Remove from wishlist' : 'Add to wishlist'}
					onclick={() => toggleWishlistProduct(product)}
				>
					<svg class="size-[18px] fill-none stroke-mms-muted stroke-[1.5]" viewBox="0 0 24 24">
						<path
							d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
						/>
					</svg>
				</button>
				<button
					type="button"
					class="flex size-[3rem] shrink-0 items-center justify-center border border-mms-gold/20 transition hover:border-mms-gold"
					aria-label="Share product"
					onclick={shareProduct}
				>
					<svg class="size-4 fill-none stroke-mms-muted stroke-[1.5]" viewBox="0 0 24 24">
						<circle cx="18" cy="5" r="3" />
						<circle cx="6" cy="12" r="3" />
						<circle cx="18" cy="19" r="3" />
						<line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
						<line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
					</svg>
				</button>
			</div>

			<div class="flex flex-wrap gap-x-6 gap-y-3 border-t border-mms-gold/[0.08] pt-5 font-mms-sans text-[0.68rem] text-mms-muted">
				<span class="flex items-center gap-2 text-mms-gold-dim">
					<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
					</svg>
					100% Authentic
				</span>
				<span class="flex items-center gap-2 text-mms-gold-dim">
					<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
					</svg>
					Original packaging
				</span>
				<span class="flex items-center gap-2 text-mms-gold-dim">
					<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
					</svg>
					Secure payment
				</span>
				<span class="flex items-center gap-2 text-mms-gold-dim">
					<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
					</svg>
					Easy returns
				</span>
			</div>
		</div>
	</section>

	<section class="px-5 pb-12 md:px-12 md:pb-20" id="tab-reviews-anchor">
		<ProductDetailTabs {model} />
	</section>

	<section class="border-t border-mms-gold/10 px-5 py-12 md:px-12 md:py-16">
		<h2 class="font-mms-display text-[clamp(1.5rem,3vw,2rem)] font-light text-mms-cream">
			You may also <em class="not-italic text-mms-gold-light">enjoy</em>
		</h2>
		<div class="mt-8 grid grid-cols-2 gap-px bg-mms-gold/10 md:grid-cols-4">
			{#each related as r (r.id)}
				{@const rh = catalogHeroHrefFor(r)}
				<a
					href={resolve('/collections/[id]', { id: String(r.id) })}
					class="group relative bg-mms-ink2 transition-colors hover:bg-mms-ink3"
				>
					<div
						class="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-mms-gold transition-transform group-hover:scale-x-100"
					></div>
					<div class="relative flex h-44 items-center justify-center bg-mms-ink3 md:h-52">
						<span
							class="absolute right-3 top-3 font-mms-logo text-base tracking-wider text-mms-gold"
							>{r.rating}</span
						>
						{#if rh}
							<img
								src={rh}
								alt={r.name}
								class="max-h-[min(42vw,200px)] w-auto max-w-[min(48%,140px)] object-contain md:max-h-[220px] md:max-w-[160px]"
								loading="lazy"
								decoding="async"
							/>
						{:else}
							<CollectionBottleArt height={160} />
						{/if}
					</div>
					<div class="p-5">
						<p class="mb-1 font-mms-sans text-[0.58rem] uppercase tracking-[0.2em] text-mms-gold-dim">
							{r.country} · {r.region}
						</p>
						<p class="font-mms-display text-lg text-mms-cream">{r.name}</p>
						<p class="mt-3 font-mms-display text-mms-gold">{formatIdr(r.price)}</p>
					</div>
				</a>
			{/each}
		</div>
	</section>

	<MmsSiteFooter />

	<ProductStickyBuyBar
		visible={showSticky}
		thumbSrc={productImageSrcs[0] ?? null}
		thumbAlt={product.name}
		name={product.name}
		{priceLabel}
		score={model.mmsScore}
		{qty}
		added={false}
		disabled={isOutOfStock}
		onAdd={handleAdd}
	/>
</div>
