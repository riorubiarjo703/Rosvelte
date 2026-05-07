<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount, tick, untrack } from 'svelte';
	import { mmsReveal } from '$lib/mms-tailwind';
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';
	import MmsSiteNewsletter from '$lib/components/site/MmsSiteNewsletter.svelte';
	import CollectionProductCard from '$lib/components/collections/CollectionProductCard.svelte';
	import type { MmsCollectionCategory, MmsCollectionProduct } from '$lib/data/mms-collection-products';
	import {
		mmsBuildCollectionsUrl,
		mmsParseCollectionCategory,
		mmsParseCollectionCountry,
		mmsParseCollectionRegion
	} from '$lib/data/mms-site-nav';
	import { addToCart } from '$lib/cart/mms-cart';
	import { toggleWishlistProduct, wishlistEntries } from '$lib/wishlist/mms-wishlist';
	import { catalogHeroImagePublicPath } from '$lib/catalog/hero-image-path';
	import { resolvedPath } from '$lib/paraglide/resolved-href';

	let { data } = $props();
	const catalogProducts = $derived(data.products);

	function catalogHeroHref(p: MmsCollectionProduct) {
		const rel = catalogHeroImagePublicPath(p.heroImageUploadId);
		return rel ? resolvedPath(rel) : null;
	}

	const tabs: { cat: MmsCollectionCategory; label: string }[] = [
		{ cat: 'all', label: 'All' },
		{ cat: 'scotch', label: 'Scotch' },
		{ cat: 'cognac', label: 'Cognac' },
		{ cat: 'japanese', label: 'Japanese' },
		{ cat: 'tequila', label: 'Tequila' },
		{ cat: 'rum', label: 'Rum' },
		{ cat: 'other', label: 'Other' }
	];

	const cardDelays = ['delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300', 'delay-[350ms]'];

	const currentCat = $derived(mmsParseCollectionCategory(page.url.searchParams));
	const activeCountry = $derived(mmsParseCollectionCountry(page.url.searchParams));
	const activeRegion = $derived(mmsParseCollectionRegion(page.url.searchParams));

	function setCollectionCat(cat: MmsCollectionCategory) {
		goto(
			mmsBuildCollectionsUrl(resolve('/collections'), {
				cat,
				country: activeCountry,
				region: activeRegion
			}),
			{ replaceState: true, noScroll: true, keepFocus: true }
		);
	}
	let sortKey = $state<
		'featured' | 'price-asc' | 'price-desc' | 'age-desc' | 'rating'
	>('featured');
	let isListView = $state(false);
	let priceSlider = $state(10_000_000);
	let activePage = $state(1);

	let io: IntersectionObserver | undefined;

	function ageNum(age: string): number {
		if (age === 'NAS') return 0;
		if (age === 'XO') return 20;
		if (age === 'XO+') return 35;
		const n = parseInt(age, 10);
		return Number.isNaN(n) ? 0 : n;
	}

	const filtered = $derived.by(() => {
		let list =
			currentCat === 'all'
				? [...catalogProducts]
				: catalogProducts.filter((p) => p.cat === currentCat);

		if (activeCountry) list = list.filter((p) => p.country === activeCountry);
		if (activeRegion) list = list.filter((p) => p.region === activeRegion);

		if (sortKey === 'price-asc') list.sort((a, b) => a.price - b.price);
		else if (sortKey === 'price-desc') list.sort((a, b) => b.price - a.price);
		else if (sortKey === 'age-desc') list.sort((a, b) => ageNum(b.age) - ageNum(a.age));
		else if (sortKey === 'rating') list.sort((a, b) => b.rating - a.rating);

		return list;
	});

	onMount(() => {
		io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					(e.target as HTMLElement).classList.add('visible');
					io?.unobserve(e.target);
				}
			},
			{ threshold: 0.08 }
		);

		const t = window.setTimeout(() => {
			document
				.querySelectorAll(
					'.collections-page .page-hero .reveal, .collections-page aside.collections-sidebar.reveal, .collections-page .collections-pagination.reveal'
				)
				.forEach((el) => el.classList.add('visible'));
		}, 100);

		tick().then(() => {
			document.querySelectorAll('.collections-page .mms-site-newsletter .reveal').forEach((el) => {
				io?.observe(el);
			});
		});

		return () => {
			window.clearTimeout(t);
			io?.disconnect();
		};
	});

	$effect(() => {
		if (!browser) return;
		void filtered;
		void isListView;
		const observer = io;
		if (!observer) return;

		tick().then(() => {
			untrack(() => {
				document.querySelectorAll('.collections-page .product-card.reveal').forEach((el) => {
					el.classList.remove('visible');
					observer.observe(el);
				});
			});
		});
	});
</script>

<svelte:head>
	<title>Collections — MMS</title>
	<meta name="description" content="Browse the complete MMS curated spirits collection." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="collections-page min-h-dvh overflow-x-hidden bg-mms-ink font-mms-sans text-mms-cream antialiased"
>
	<MmsSiteHeader />

	<section
		class="page-hero relative overflow-hidden border-b border-mms-gold/10 px-6 pb-12 pt-28 md:px-16 md:pb-20 md:pt-36"
	>
		<p
			class="pointer-events-none absolute -right-[2%] bottom-[-5%] whitespace-nowrap font-mms-logo text-[18vw] leading-none tracking-[0.05em] text-mms-gold/[0.03]"
			aria-hidden="true"
		>
			COLLECTIONS
		</p>
		<div class="relative z-[1] grid items-end gap-6 md:grid-cols-[1fr_auto] md:gap-12">
			<div class={mmsReveal}>
				<p
					class="mb-6 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.35em] text-mms-gold before:block before:h-px before:w-10 before:bg-mms-gold"
				>
					MMS maison de spiritueux
				</p>
				<h1 class="font-mms-display text-[clamp(3rem,5vw,5rem)] font-light leading-[0.95] tracking-tight text-mms-cream">
					The <em class="italic text-mms-gold-light">complete</em><br />collection
				</h1>
			</div>
			<div class={`text-left md:text-right ${mmsReveal}`}>
				<span class="font-mms-display block text-5xl font-light leading-none text-mms-gold md:text-6xl"
					>{filtered.length}</span>
				<span class="text-[0.65rem] uppercase tracking-[0.2em] text-mms-muted">Curated expressions</span>
			</div>
		</div>
	</section>

	<div
		class="sticky top-[4.5rem] z-50 border-b border-mms-gold/10 bg-mms-ink/97 px-6 py-4 backdrop-blur-md md:top-[4.5625rem] md:px-16 md:py-8"
	>
		<div class="flex flex-wrap items-center justify-between gap-4">
			<div class="flex max-w-full gap-0 overflow-x-auto border border-mms-gold/20 [-webkit-overflow-scrolling:touch]">
				{#each tabs as tab (tab.cat)}
					<button
						type="button"
						class="shrink-0 border-r border-mms-gold/15 bg-transparent px-4 py-2.5 font-mms-sans text-[0.65rem] uppercase tracking-[0.18em] text-mms-muted transition last:border-r-0 hover:bg-mms-gold hover:text-mms-ink md:px-5"
						class:bg-mms-gold={currentCat === tab.cat}
						class:text-mms-ink={currentCat === tab.cat}
						onclick={() => setCollectionCat(tab.cat)}
					>
						{tab.label}
					</button>
				{/each}
			</div>
			<div class="flex flex-wrap items-center gap-3 md:gap-4">
				<span class="text-[0.7rem] tracking-[0.1em] text-mms-muted">{filtered.length} results</span>
				<label class="sr-only" for="sort-sel">Sort by</label>
				<select
					class="hidden cursor-pointer appearance-none border border-mms-gold/20 bg-transparent bg-[length:10px_6px] bg-[position:right_0.7rem_center] bg-no-repeat py-2.5 pl-4 pr-8 font-mms-sans text-[0.65rem] uppercase tracking-[0.15em] text-mms-cream sm:block"
					style:background-image={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238B6E2F'/%3E%3C/svg%3E")`}
					id="sort-sel"
					bind:value={sortKey}
				>
					<option value="featured" class="bg-mms-ink2 text-mms-cream">Featured</option>
					<option value="price-asc" class="bg-mms-ink2 text-mms-cream">Price: Low to High</option>
					<option value="price-desc" class="bg-mms-ink2 text-mms-cream">Price: High to Low</option>
					<option value="age-desc" class="bg-mms-ink2 text-mms-cream">Age: Oldest First</option>
					<option value="rating" class="bg-mms-ink2 text-mms-cream">Highest Rated</option>
				</select>
				<div class="hidden gap-px sm:flex">
					<button
						type="button"
						class="flex size-[34px] items-center justify-center border border-mms-gold/20 bg-transparent text-mms-muted transition hover:border-mms-gold [&_svg]:size-3.5 [&_svg]:fill-current"
						class:border-mms-gold={!isListView}
						class:text-mms-gold={!isListView}
						onclick={() => (isListView = false)}
						title="Grid view"
						aria-pressed={!isListView}
					>
						<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
							<rect x="0" y="0" width="6" height="6" /><rect x="8" y="0" width="6" height="6" /><rect
								x="0"
								y="8"
								width="6"
								height="6"
							/><rect x="8" y="8" width="6" height="6" />
						</svg>
					</button>
					<button
						type="button"
						class="flex size-[34px] items-center justify-center border border-mms-gold/20 bg-transparent text-mms-muted transition hover:border-mms-gold [&_svg]:size-3.5 [&_svg]:fill-current"
						class:border-mms-gold={isListView}
						class:text-mms-gold={isListView}
						onclick={() => (isListView = true)}
						title="List view"
						aria-pressed={isListView}
					>
						<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
							<rect x="0" y="0" width="14" height="2" /><rect x="0" y="5" width="14" height="2" /><rect
								x="0"
								y="10"
								width="14"
								height="2"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
	</div>

	<section class="px-6 py-8 pb-16 md:px-16 md:py-12 md:pb-24">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_260px] lg:items-start lg:gap-12">
			<div class="min-w-0">
				<div
					class={`grid gap-px bg-mms-gold/10 ${isListView ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}
				>
					{#if filtered.length === 0}
						<p
							class="col-span-full bg-mms-ink px-4 py-12 text-center text-[0.85rem] tracking-[0.08em] text-mms-muted sm:col-span-2 lg:col-span-3"
						>
							No expressions in this category yet.
						</p>
					{:else}
						{#each filtered as p, i (p.id)}
							<CollectionProductCard
								product={p}
								listView={isListView}
								loved={$wishlistEntries.some((e) => e.productId === p.id)}
								delayClass={cardDelays[i % cardDelays.length]}
								heroImageSrc={catalogHeroHref(p)}
								onToggleWishlist={toggleWishlistProduct}
								onAddToCart={(qty) => addToCart(p, qty)}
							/>
						{/each}
					{/if}
				</div>
				<div
					class={`collections-pagination mt-16 flex justify-center border border-mms-gold/15 ${mmsReveal}`}
				>
					{#each [1, 2, 3, 4] as n (n)}
						<button
							type="button"
							class="h-11 w-11 border-r border-mms-gold/10 bg-transparent font-mms-sans text-[0.75rem] text-mms-muted transition last:border-r-0 hover:bg-mms-gold hover:text-mms-ink"
							class:bg-mms-gold={activePage === n}
							class:text-mms-ink={activePage === n}
							onclick={() => (activePage = n)}>{n}</button>
					{/each}
					<button
						type="button"
						class="h-11 border-r-0 border-none bg-transparent px-5 font-mms-sans text-[0.65rem] uppercase tracking-[0.1em] text-mms-muted transition hover:bg-mms-gold hover:text-mms-ink"
						>Next →</button>
				</div>
			</div>

			<aside
				class="collections-sidebar reveal top-40 max-lg:grid max-lg:grid-cols-2 max-lg:gap-px max-sm:grid-cols-1 lg:sticky {mmsReveal}"
			>
				<div class="mb-px bg-mms-ink2 p-7">
					<p class="mb-5 flex items-center gap-2">
						<span class="shrink-0 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim"
							>Filter by country</span>
						<span class="h-px flex-1 bg-mms-gold/12"></span>
					</p>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" checked class="accent-mms-gold" /> Scotland <span
							class="ml-auto text-[0.7rem] text-mms-muted">14</span></label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" checked class="accent-mms-gold" /> France <span
							class="ml-auto text-[0.7rem] text-mms-muted">9</span></label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" checked class="accent-mms-gold" /> Japan <span
							class="ml-auto text-[0.7rem] text-mms-muted">8</span></label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" checked class="accent-mms-gold" /> Mexico <span
							class="ml-auto text-[0.7rem] text-mms-muted">7</span></label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" class="accent-mms-gold" /> Ireland <span
							class="ml-auto text-[0.7rem] text-mms-muted">5</span></label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" class="accent-mms-gold" /> Caribbean <span
							class="ml-auto text-[0.7rem] text-mms-muted">5</span></label
					>
				</div>

				<div class="mb-px bg-mms-ink2 p-7">
					<p class="mb-5 flex items-center gap-2">
						<span class="shrink-0 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">Price range</span>
						<span class="h-px flex-1 bg-mms-gold/12"></span>
					</p>
					<div class="py-2">
						<input
							type="range"
							min="500000"
							max="20000000"
							step="100000"
							bind:value={priceSlider}
							class="h-0.5 w-full cursor-pointer appearance-none accent-mms-gold [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-mms-gold [&::-webkit-slider-thumb]:appearance-none"
						/>
						<div class="mt-2.5 flex justify-between text-[0.68rem] text-mms-muted">
							<span>Rp 500k</span>
							<span>Rp {priceSlider.toLocaleString('id-ID')}</span>
						</div>
					</div>
				</div>

				<div class="mb-px bg-mms-ink2 p-7">
					<p class="mb-5 flex items-center gap-2">
						<span class="shrink-0 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim"
							>Age statement</span>
						<span class="h-px flex-1 bg-mms-gold/12"></span>
					</p>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" class="accent-mms-gold" /> No age statement</label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" class="accent-mms-gold" /> 10–14 years</label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" checked class="accent-mms-gold" /> 15–20 years</label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" checked class="accent-mms-gold" /> 21–30 years</label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" class="accent-mms-gold" /> 30+ years</label
					>
				</div>

				<div class="mb-px bg-mms-ink2 p-7">
					<p class="mb-5 flex items-center gap-2">
						<span class="shrink-0 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim"
							>Availability</span>
						<span class="h-px flex-1 bg-mms-gold/12"></span>
					</p>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" class="accent-mms-gold" /> In stock only</label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" class="accent-mms-gold" /> Limited editions</label
					>
					<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
						><input type="checkbox" checked class="accent-mms-gold" /> All items</label
					>
				</div>

				<div class="bg-mms-ink2 p-0 max-lg:col-span-2">
					<button
						type="button"
						class="w-full border-none bg-mms-gold px-4 py-3.5 font-mms-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-mms-ink transition hover:bg-mms-gold-light"
						>Apply filters</button>
				</div>
			</aside>
		</div>
	</section>

	<MmsSiteNewsletter id="collections-nl" />

	<MmsSiteFooter />
</div>
