<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { catalogHeroImagePublicPath } from '$lib/catalog/hero-image-path';
	import {
		mmsCatalogSearchHaystack,
		type MmsCatalogSearchItem
	} from '$lib/data/mms-catalog-search';
	import { MMS_NAV_COLLECTION_CATS } from '$lib/data/mms-site-nav';
	import { deLocalizeUrl } from '$lib/paraglide/runtime';

	let {
		inputId,
		collectionsPath,
		items,
		formClass = '',
		inputClass = '',
		submitVariant = 'icon'
	}: {
		inputId: string;
		collectionsPath: string;
		items: MmsCatalogSearchItem[];
		formClass?: string;
		inputClass?: string;
		submitVariant?: 'icon' | 'text';
	} = $props();

	const searchParams = $derived(page.url.searchParams);
	const searchQuery = $derived(searchParams.get('q')?.trim() ?? '');
	const delocalizedPath = $derived(deLocalizeUrl(page.url).pathname);
	const isCollections = $derived(delocalizedPath.startsWith('/collections'));
	const searchCat = $derived(searchParams.get('cat')?.trim() ?? '');
	const searchCountry = $derived(searchParams.get('country')?.trim() ?? '');
	const searchRegion = $derived(searchParams.get('region')?.trim() ?? '');

	let localQuery = $state('');
	let dismissed = $state(false);
	let rootEl: HTMLDivElement | undefined;

	const listboxId = $derived(`mms-search-suggest-${inputId}`);

	const needle = $derived(localQuery.trim().toLocaleLowerCase());

	const matches = $derived.by(() => {
		if (needle.length < 2) return [];
		return items.filter((p) => mmsCatalogSearchHaystack(p).includes(needle));
	});

	const suggestionNames = $derived.by(() => {
		const seen = new Set<string>();
		const out: string[] = [];
		for (const p of matches) {
			const n = p.name.trim();
			const key = n.toLocaleLowerCase();
			if (!seen.has(key)) {
				seen.add(key);
				out.push(n);
				if (out.length >= 6) break;
			}
		}
		return out;
	});

	const productPreview = $derived(matches.slice(0, 4));

	const hasHits = $derived(suggestionNames.length > 0 || productPreview.length > 0);
	const panelOpen = $derived(needle.length >= 2 && !dismissed && hasHits);

	$effect(() => {
		void page.url.href;
		localQuery = searchQuery;
	});

	$effect(() => {
		void localQuery;
		dismissed = false;
	});

	$effect(() => {
		if (!panelOpen || typeof document === 'undefined') return;
		const onDoc = (ev: PointerEvent) => {
			const t = ev.target;
			if (t instanceof Node && rootEl && !rootEl.contains(t)) dismissed = true;
		};
		document.addEventListener('pointerdown', onDoc, true);
		return () => document.removeEventListener('pointerdown', onDoc, true);
	});

	const seeAllHref = $derived.by(() => {
		const sp = new URLSearchParams();
		const q = localQuery.trim();
		if (q) sp.set('q', q);
		if (isCollections && searchCat) sp.set('cat', searchCat);
		if (isCollections && searchCountry) sp.set('country', searchCountry);
		if (isCollections && searchRegion) sp.set('region', searchRegion);
		const qs = sp.toString();
		return qs ? `${collectionsPath}?${qs}` : collectionsPath;
	});

	function catLabel(cat: string): string {
		return MMS_NAV_COLLECTION_CATS.find((r) => r.cat === cat)?.label ?? cat;
	}

	function formatPrice(p: number) {
		return `Rp ${p.toLocaleString('id-ID')}`;
	}

	function productHref(id: number) {
		return resolve('/collections/[id]', { id: String(id) });
	}

	function onInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			dismissed = true;
			(e.currentTarget as HTMLInputElement).blur();
		}
	}
</script>

<div class="relative isolate" bind:this={rootEl}>
	<form method="GET" action={collectionsPath} class={formClass} role="search">
		<label class="sr-only" for={inputId}>Search products</label>
		<input
			id={inputId}
			name="q"
			type="search"
			placeholder="Search products"
			autocomplete="off"
			aria-autocomplete="list"
			aria-expanded={panelOpen}
			aria-controls={listboxId}
			role="combobox"
			bind:value={localQuery}
			class={inputClass}
			onfocus={() => (dismissed = false)}
			onkeydown={onInputKeydown}
		/>
		{#if isCollections && searchCat}
			<input type="hidden" name="cat" value={searchCat} />
		{/if}
		{#if isCollections && searchCountry}
			<input type="hidden" name="country" value={searchCountry} />
		{/if}
		{#if isCollections && searchRegion}
			<input type="hidden" name="region" value={searchRegion} />
		{/if}
		{#if submitVariant === 'text'}
			<button
				type="submit"
				class="inline-flex shrink-0 items-center px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold transition hover:text-mms-ink"
			>
				<svg class="size-4 fill-none stroke-white stroke-[1.5]" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
			</button>
		{:else}
			<button
				type="submit"
				class="inline-flex shrink-0 items-center px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold transition hover:text-mms-ink"
				aria-label="Search"
			>
				<svg class="size-4 fill-none stroke-white stroke-[1.5]" viewBox="0 0 24 24" aria-hidden="true"
					><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg
				>
			</button>
		{/if}
	</form>

	{#if panelOpen}
		<div
			id={listboxId}
			role="listbox"
			class="absolute right-0 top-[calc(100%+0.35rem)] z-[140] w-[min(calc(100vw-1.25rem),22rem)] rounded-md border border-mms-gold/20 bg-[#f9f7f3] py-4 pl-4 pr-3 text-mms-ink shadow-[0_18px_40px_rgba(0,0,0,0.35)] sm:w-[min(calc(100vw-2rem),34rem)] bg-mms-gold"
		>
			<div class="grid max-h-[min(70vh,22rem)] grid-cols-1 gap-5 overflow-y-auto sm:grid-cols-2 sm:gap-6">
				<div class="min-w-0 pr-1">
					<p class="mb-2 font-mms-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-mms-ink">
						Suggestions
					</p>
					<ul class="space-y-1.5" role="presentation">
						{#each suggestionNames as name (name)}
							<li>
								<button
									type="button"
									class="w-full truncate text-left font-mms-sans text-[0.72rem] text-mms-ink/90 underline-offset-2 transition hover:text-mms-ink hover:underline"
									onclick={() => (localQuery = name)}
								>
									{name}
								</button>
							</li>
						{/each}
					</ul>
					<p class="mt-4 border-t border-mms-ink/10 pt-3">
						<a
							href={seeAllHref}
							class="font-mms-sans text-[0.72rem] font-semibold text-mms-ink underline decoration-mms-ink/40 underline-offset-2 transition hover:decoration-mms-ink"
						>
							See all ‘{localQuery.trim()}’
						</a>
					</p>
				</div>
				<div class="min-w-0 border-t border-mms-ink/10 pt-4 sm:border-t-0 sm:pt-0 sm:pl-2 sm:border-l sm:border-mms-ink/10">
					<p class="mb-2 font-mms-sans text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-mms-ink">Products</p>
					<ul class="space-y-3" role="presentation">
						{#each productPreview as p (p.id)}
							<li>
								<a
									href={productHref(p.id)}
									class="flex gap-2.5 no-underline transition hover:opacity-85"
								>
									{#if catalogHeroImagePublicPath(p.heroImageUploadId)}
										<img
											src={catalogHeroImagePublicPath(p.heroImageUploadId)}
											alt=""
											class="size-12 shrink-0 rounded-sm border border-mms-ink/10 object-cover"
										/>
									{:else}
										<span
											class="flex size-12 shrink-0 items-center justify-center rounded-sm border border-mms-ink/10 bg-mms-ink/[0.04] font-mms-sans text-[0.55rem] text-mms-muted"
										>
											—
										</span>
									{/if}
									<span class="min-w-0 flex-1">
										<span class="block truncate font-mms-sans text-[0.62rem] text-mms-muted">
											{catLabel(p.cat)} · {p.country}
										</span>
										<span class="mt-0.5 block truncate font-mms-sans text-[0.74rem] font-semibold text-mms-ink">
											{p.name}
										</span>
										<span class="mt-0.5 block font-mms-sans text-[0.72rem] text-mms-ink">{formatPrice(p.price)}</span>
									</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	{/if}
</div>
