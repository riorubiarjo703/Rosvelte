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
		mmsNavCollectionCountries,
		mmsParseCollectionCategory,
		mmsParseCollectionCountry,
		mmsParseCollectionRegion
	} from '$lib/data/mms-site-nav';
	import { addToCart } from '$lib/cart/mms-cart';
	import { toggleWishlistProduct, wishlistEntries } from '$lib/wishlist/mms-wishlist';
	import type { Pathname } from '$app/types';
	import { catalogHeroImagePublicPath } from '$lib/catalog/hero-image-path';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';

	let { data } = $props();
	const catalogProducts = $derived(data.products);

	function catalogHeroHref(p: MmsCollectionProduct) {
		const rel = catalogHeroImagePublicPath(p.heroImageUploadId);
		return rel ? resolvedLocalizedHref(rel as Pathname) : null;
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
	const searchQuery = $derived(page.url.searchParams.get('q')?.trim() ?? '');
	const searchNeedle = $derived(searchQuery.toLocaleLowerCase());

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
	const PRICE_FILTER_MIN = 500_000;
	const PRICE_SLIDER_MAX = 20_000_000;

	const AGE_BUCKETS: { id: string; label: string }[] = [
		{ id: 'nas', label: 'No age statement' },
		{ id: 'y10_14', label: '10–14 years' },
		{ id: 'y15_20', label: '15–20 years' },
		{ id: 'y21_30', label: '21–30 years' },
		{ id: 'y30plus', label: '30+ years' }
	];

	function productAgeBucketIds(p: MmsCollectionProduct): string[] {
		const a = p.age;
		const ids = new Set<string>();
		if (a === 'NAS') ids.add('nas');
		if (a === 'XO+') ids.add('y30plus');
		if (a === 'XO') ids.add('y15_20');
		const n = parseInt(a, 10);
		if (!Number.isNaN(n)) {
			if (n >= 10 && n <= 14) ids.add('y10_14');
			if (n >= 15 && n <= 20) ids.add('y15_20');
			if (n >= 21 && n <= 30) ids.add('y21_30');
			if (n >= 31) ids.add('y30plus');
		}
		return [...ids];
	}

	function isLimitedEditionBadge(b: MmsCollectionProduct['badge']): boolean {
		return b === 'limited' || b === 'rare' || b === 'exclusive';
	}

	let sortKey = $state<
		'featured' | 'price-asc' | 'price-desc' | 'age-desc' | 'rating'
	>('featured');
	let isListView = $state(false);
	let priceSlider = $state(PRICE_SLIDER_MAX);
	const priceTrackFillPct = $derived(
		((priceSlider - PRICE_FILTER_MIN) / (PRICE_SLIDER_MAX - PRICE_FILTER_MIN)) * 100
	);
	let activePage = $state(1);

	const navCountries = mmsNavCollectionCountries();
	let selectedCountries = $state<Set<string>>(new Set(navCountries));
	let selectedAgeBuckets = $state<Set<string>>(new Set(AGE_BUCKETS.map((b) => b.id)));
	let availabilityMode = $state<'all' | 'in_stock' | 'limited'>('all');

	let lastSyncedUrlCountry = $state<string | null | undefined>(undefined);

	$effect(() => {
		const ac = activeCountry;
		if (ac === lastSyncedUrlCountry) return;
		lastSyncedUrlCountry = ac;
		if (ac && navCountries.includes(ac)) {
			selectedCountries = new Set([ac]);
		} else {
			selectedCountries = new Set(navCountries);
		}
	});

	let io: IntersectionObserver | undefined;

	function ageNum(age: string): number {
		if (age === 'NAS') return 0;
		if (age === 'XO') return 20;
		if (age === 'XO+') return 35;
		const n = parseInt(age, 10);
		return Number.isNaN(n) ? 0 : n;
	}

	/** Products matching category, region, and search — used for country facet counts. */
	const productsForCountryCounts = $derived.by(() => {
		let list =
			currentCat === 'all'
				? [...catalogProducts]
				: catalogProducts.filter((p) => p.cat === currentCat);

		if (activeRegion) list = list.filter((p) => p.region === activeRegion);
		if (searchNeedle) {
			list = list.filter((p) => {
				const haystack = `${p.name} ${p.country} ${p.region} ${p.desc}`.toLocaleLowerCase();
				return haystack.includes(searchNeedle);
			});
		}
		return list;
	});

	const countryCounts = $derived.by(() => {
		const m = new Map<string, number>();
		for (const p of productsForCountryCounts) {
			m.set(p.country, (m.get(p.country) ?? 0) + 1);
		}
		return m;
	});

	const filtered = $derived.by(() => {
		let list = [...productsForCountryCounts];

		const allCountriesSelected = navCountries.every((c) => selectedCountries.has(c));
		if (!allCountriesSelected) {
			list = list.filter((p) => selectedCountries.has(p.country));
		}

		list = list.filter((p) => p.price >= PRICE_FILTER_MIN && p.price <= priceSlider);

		const allAgeSelected = AGE_BUCKETS.every((b) => selectedAgeBuckets.has(b.id));
		if (!allAgeSelected) {
			list = list.filter((p) => productAgeBucketIds(p).some((id) => selectedAgeBuckets.has(id)));
		}

		if (availabilityMode === 'in_stock') {
			list = list.filter((p) => p.stockQty === undefined || p.stockQty > 0);
		} else if (availabilityMode === 'limited') {
			list = list.filter((p) => isLimitedEditionBadge(p.badge));
		}

		if (sortKey === 'price-asc') list.sort((a, b) => a.price - b.price);
		else if (sortKey === 'price-desc') list.sort((a, b) => b.price - a.price);
		else if (sortKey === 'age-desc') list.sort((a, b) => ageNum(b.age) - ageNum(a.age));
		else if (sortKey === 'rating') list.sort((a, b) => b.rating - a.rating);

		return list;
	});

	function toggleCountry(country: string) {
		const next = new Set(selectedCountries);
		if (next.has(country)) next.delete(country);
		else next.add(country);
		selectedCountries = next;
	}

	function toggleAgeBucket(id: string) {
		const next = new Set(selectedAgeBuckets);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedAgeBuckets = next;
	}

	function resetSidebarFilters() {
		selectedCountries = new Set(navCountries);
		selectedAgeBuckets = new Set(AGE_BUCKETS.map((b) => b.id));
		priceSlider = PRICE_SLIDER_MAX;
		availabilityMode = 'all';
	}

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
					'.collections-page .page-hero .reveal, .collections-page .collections-sidebar-inner.reveal, .collections-page .collections-pagination.reveal'
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
	class="collections-page min-h-dvh overflow-x-clip bg-mms-ink font-mms-sans text-mms-cream antialiased"
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
							{#if searchQuery}
								No products found for "{searchQuery}".
							{:else}
								No expressions in this category yet.
							{/if}
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
				class="collections-sidebar lg:sticky lg:top-[10.25rem] lg:z-10 lg:max-h-[calc(100dvh-11rem)] lg:self-start lg:overflow-y-auto"
			>
				<div
					class={`collections-sidebar-inner max-lg:grid max-lg:grid-cols-2 max-lg:gap-px max-sm:grid-cols-1 lg:flex lg:flex-col lg:gap-px ${mmsReveal}`}
				>
					<div class="mb-px bg-mms-ink2 p-7">
						<p class="mb-5 flex items-center gap-2">
							<span class="shrink-0 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim"
								>Filter by country</span>
							<span class="h-px flex-1 bg-mms-gold/12"></span>
						</p>
						{#each navCountries as country (country)}
							<label
								class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
							>
								<input
									type="checkbox"
									class="accent-mms-gold"
									checked={selectedCountries.has(country)}
									onchange={() => toggleCountry(country)}
								/>
								{country}
								<span class="ml-auto text-[0.7rem] text-mms-muted"
									>{countryCounts.get(country) ?? 0}</span>
							</label>
						{/each}
					</div>

					<div class="mb-px bg-mms-ink2 p-7">
						<p class="mb-5 flex items-center gap-2">
							<span class="shrink-0 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim"
								>Price range</span>
							<span class="h-px flex-1 bg-mms-gold/12"></span>
						</p>
						<div class="py-2">
							<div class="relative flex h-9 items-center">
								<div
									class="pointer-events-none absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-mms-gold/18"
									aria-hidden="true"
								></div>
								<div
									class="pointer-events-none absolute left-0 top-1/2 h-1 max-w-full -translate-y-1/2 rounded-full bg-mms-gold/55"
									style:width="{priceTrackFillPct}%"
									aria-hidden="true"
								></div>
								<input
									type="range"
									min={PRICE_FILTER_MIN}
									max={PRICE_SLIDER_MAX}
									step="100000"
									bind:value={priceSlider}
									aria-valuemin={PRICE_FILTER_MIN}
									aria-valuemax={PRICE_SLIDER_MAX}
									aria-valuenow={priceSlider}
									aria-label="Maximum price"
									class="relative z-10 h-9 w-full cursor-pointer appearance-none bg-transparent accent-mms-gold [&::-webkit-slider-runnable-track]:h-1 [&::-webkit-slider-runnable-track]:cursor-pointer [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:-mt-1.5 [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-mms-gold [&::-webkit-slider-thumb]:bg-mms-gold [&::-webkit-slider-thumb]:shadow-[0_0_0_1px_rgba(0,0,0,0.35)] [&::-webkit-slider-thumb]:appearance-none [&::-moz-range-track]:h-1 [&::-moz-range-track]:cursor-pointer [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-transparent [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-mms-gold [&::-moz-range-thumb]:bg-mms-gold"
								/>
							</div>
							<div class="mt-2.5 flex justify-between text-[0.68rem] text-mms-muted">
								<span>Rp {(PRICE_FILTER_MIN / 1000).toLocaleString('id-ID')}k</span>
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
						{#each AGE_BUCKETS as bucket (bucket.id)}
							<label
								class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]"
							>
								<input
									type="checkbox"
									class="accent-mms-gold"
									checked={selectedAgeBuckets.has(bucket.id)}
									onchange={() => toggleAgeBucket(bucket.id)}
								/>
								{bucket.label}
							</label>
						{/each}
					</div>

					<div class="mb-px bg-mms-ink2 p-7">
						<p class="mb-5 flex items-center gap-2">
							<span class="shrink-0 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim"
								>Availability</span>
							<span class="h-px flex-1 bg-mms-gold/12"></span>
						</p>
						<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]">
							<input
								type="radio"
								name="collections-availability"
								value="all"
								class="accent-mms-gold"
								bind:group={availabilityMode}
							/>
							All items
						</label>
						<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]">
							<input
								type="radio"
								name="collections-availability"
								value="in_stock"
								class="accent-mms-gold"
								bind:group={availabilityMode}
							/>
							In stock only
						</label>
						<label class="flex cursor-pointer select-none items-center gap-3 py-2 text-[0.78rem]">
							<input
								type="radio"
								name="collections-availability"
								value="limited"
								class="accent-mms-gold"
								bind:group={availabilityMode}
							/>
							Limited and rare (badge)
						</label>
					</div>

					<div class="bg-mms-ink2 p-0 max-lg:col-span-2">
						<button
							type="button"
							class="w-full border-none bg-mms-gold px-4 py-3.5 font-mms-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-mms-ink transition hover:bg-mms-gold-light"
							onclick={resetSidebarFilters}
						>
							Reset filters
						</button>
					</div>
				</div>
			</aside>
		</div>
	</section>

	<MmsSiteNewsletter id="collections-nl" />

	<MmsSiteFooter />
</div>
