<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { deLocalizeUrl } from '$lib/paraglide/runtime';
	import {
		mmsParseCollectionCategory,
		mmsParseCollectionCountry,
		mmsParseCollectionRegion,
		mmsParseJournalChannel,
		mmsParseJournalTopic,
		mmsParseOriginKey,
		mmsCollectionsHref,
		MMS_NAV_COLLECTION_CATS
	} from '$lib/data/mms-site-nav';
	import MmsNavMegaShop from './MmsNavMegaShop.svelte';
	import MmsNavMegaOrigins from './MmsNavMegaOrigins.svelte';
	import MmsNavMegaEditorial from './MmsNavMegaEditorial.svelte';
	import MmsMiniCart from '$lib/components/cart/MmsMiniCart.svelte';
	import { cartItemCount, syncCartHeroIdsFromCatalog } from '$lib/cart/mms-cart';
	import { storeHeaderLogo } from '$lib/store/mms-store-settings';

	let menuOpen = $state(false);
	let cartOpen = $state(false);

	const delocalizedPath = $derived(deLocalizeUrl(page.url).pathname);
	const searchParams = $derived(page.url.searchParams);
	const isHome = $derived(delocalizedPath === '/' || delocalizedPath === '');
	const isCollections = $derived(delocalizedPath.startsWith('/collections'));
	const isOrigins = $derived(delocalizedPath.startsWith('/origins'));
	const isTastingNotes = $derived(delocalizedPath.startsWith('/tasting-notes'));
	const isJournal = $derived(delocalizedPath.startsWith('/journal'));
	const isCart = $derived(delocalizedPath.startsWith('/cart'));
	const isAccount = $derived(delocalizedPath.startsWith('/account'));

	const sessionUser = $derived(page.data.customer);

	const activeCollectionCat = $derived(mmsParseCollectionCategory(searchParams));
	const activeCollectionCountry = $derived(mmsParseCollectionCountry(searchParams));
	const activeCollectionRegion = $derived(mmsParseCollectionRegion(searchParams));
	const activeOrigin = $derived(mmsParseOriginKey(searchParams));
	const activeJournalChannel = $derived(mmsParseJournalChannel(searchParams));
	const activeJournalTopic = $derived(mmsParseJournalTopic(searchParams));

	const isOriginsActive = $derived(isOrigins);
	const isEditorialActive = $derived(isJournal);

	const collectionsPath = $derived(resolve('/collections'));
	const originsPath = $derived(resolve('/origins'));
	const journalPath = $derived(resolve('/journal'));
	const tastingNotesPath = $derived(resolve('/tasting-notes'));
	const cartPath = $derived(resolve('/cart'));
	const accountPath = $derived(resolve('/account'));
	const accountLoginPath = $derived(resolve('/account/login'));

	function toggleMenu() {
		menuOpen = !menuOpen;
	}

	function closeMenu() {
		menuOpen = false;
	}

	function sectionHref(hash: string) {
		const h = hash.startsWith('#') ? hash : `#${hash}`;
		if (isHome) return h;
		return `${resolve('/')}${h}`;
	}

	const reserveHref = $derived(sectionHref('#reserve'));

	const customerInitials = $derived.by(() => {
		const name = sessionUser?.name?.trim() ?? '';
		const parts = name.split(/\s+/).filter(Boolean);
		if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		return name.slice(0, 2).toUpperCase() || '?';
	});

	$effect(() => {
		const map = page.data.catalogHeroImages;
		if (map && Object.keys(map).length > 0) {
			syncCartHeroIdsFromCatalog(map);
		}
	});

	/** Mega nav trigger: underline follows named `group/{name}` hover / focus-within (literals for Tailwind JIT). */
	function navMegaTriggerClass(active: boolean, name: 'collection' | 'origins' | 'editorial') {
		const base =
			'relative z-[106] inline-flex items-center bg-transparent py-2 font-mms-sans text-[0.7rem] uppercase tracking-[0.2em] no-underline transition after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-mms-gold after:transition';
		const state = active ? 'text-mms-gold after:scale-x-100' : 'text-mms-cream/70 hover:text-mms-gold';
		if (name === 'collection')
			return `${base} group-hover/collection:after:scale-x-100 group-focus-within/collection:after:scale-x-100 ${state}`;
		if (name === 'origins')
			return `${base} group-hover/origins:after:scale-x-100 group-focus-within/origins:after:scale-x-100 ${state}`;
		return `${base} group-hover/editorial:after:scale-x-100 group-focus-within/editorial:after:scale-x-100 ${state}`;
	}

	/** Fixed layers: start high enough to overlap nav; panel pulled up so no dead zone / visible seam. */
	const megaBridgeTop = 'top-[3.25rem] md:top-[4.1rem]';
	const megaBridgeH = 'h-12';
	const megaPanelTop = 'top-[3.85rem] md:top-[6.55rem]';
	const megaPanelPull = '-mt-6';

	/** Top-level link (no mega): underline follows link hover. */
	function navPlainLinkClass(active: boolean) {
		return `relative z-[106] inline-flex items-center py-2 font-mms-sans text-[0.7rem] uppercase tracking-[0.2em] no-underline transition after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-mms-gold after:transition hover:after:scale-x-100 ${active ? 'text-mms-gold after:scale-x-100' : 'text-mms-cream/70 hover:text-mms-gold'}`;
	}

	function mobileLink(active: boolean) {
		return `block py-1.5 text-[0.68rem] uppercase tracking-[0.15em] no-underline ${active ? 'text-mms-gold' : 'text-mms-cream/70 hover:text-mms-gold'}`;
	}

	const headerIconBox =
		'inline-flex shrink-0 items-center justify-center border border-mms-gold/35 bg-transparent text-mms-gold transition hover:border-mms-gold/55 hover:bg-mms-gold/[0.06]';
</script>

{#snippet cartTrigger(className: string)}
	<button
		type="button"
		class={className}
		onclick={() => (cartOpen = true)}
		aria-label="Open shopping bag"
		aria-expanded={cartOpen}
	>
		<span class="relative inline-flex">
			<svg class="size-6 mb-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<path
					d="M6 7h15l-1.5 12H7.5L6 7Z"
					stroke="currentColor"
					stroke-width="1.25"
					stroke-linejoin="round"
				/>
				<path d="M6 7 5 4H2" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" />
				<circle cx="10" cy="22" r="2" fill="currentColor" />
				<circle cx="17" cy="22" r="2" fill="currentColor" />
			</svg>
			{#if $cartItemCount > 0}
				<span
					class="absolute -right-1.5 -top-1 flex min-h-[1rem] min-w-[1rem] items-center justify-center rounded-full bg-mms-gold px-1 font-mms-sans text-[0.55rem] font-medium leading-none text-mms-ink"
				>
					{$cartItemCount > 99 ? '99+' : $cartItemCount}
				</span>
			{/if}
		</span>
	</button>
{/snippet}

{#snippet profileIcon(svgClass: string)}
	<svg class={svgClass} viewBox="0 0 32 32" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
		<g fill="currentColor">
			<path
				d="M16,31C7.729,31,1,24.271,1,16S7.729,1,16,1s15,6.729,15,15S24.271,31,16,31z M16,2C8.28,2,2,8.28,2,16s6.28,14,14,14s14-6.28,14-14S23.72,2,16,2z"
			/>
			<path
				d="M23.64,20.713l-4.762-1.652l-0.323-2.584c-0.215,0.307-0.523,0.546-0.924,0.671l0.293,2.345c0.023,0.189,0.152,0.349,0.332,0.41l5.055,1.756c0.9,0.314,1.689,1.427,1.689,2.381v-0.007c0,0.276,0.224,0.5,0.5,0.5c0.275,0,0.499-0.223,0.5-0.498C25.997,22.656,24.94,21.168,23.64,20.713z"
			/>
			<path
				d="M6.5,24.532c-0.276,0-0.5-0.224-0.5-0.5v0.007c0-1.379,1.059-2.871,2.359-3.326l4.762-1.641l0.012-0.28c0.034-0.274,0.289-0.465,0.559-0.434c0.273,0.034,0.468,0.284,0.434,0.559l-0.051,0.589c-0.023,0.189-0.153,0.348-0.333,0.41l-5.054,1.742C7.789,21.973,7,23.086,7,24.039v-0.007C7,24.309,6.776,24.532,6.5,24.532z"
			/>
			<path
				d="M16,18.039c-2.779,0-4.192-1.844-4.201-6.469c-0.002-1.174,0.123-2.363,1.227-3.469C13.729,7.396,14.729,7.039,16,7.039s2.271,0.357,2.975,1.063c1.104,1.105,1.229,2.295,1.227,3.469C20.192,16.195,18.779,18.039,16,18.039z M16,8.039c-1.009,0-1.75,0.252-2.267,0.769c-0.632,0.633-0.938,1.2-0.935,2.761c0.008,4.018,1.055,5.471,3.201,5.471s3.193-1.453,3.201-5.471c0.003-1.561-0.303-2.128-0.935-2.761C17.75,8.291,17.009,8.039,16,8.039z"
			/>
		</g>
	</svg>
{/snippet}

<!-- Fixed bar: parent `overflow-x-hidden` breaks `sticky`; spacer reserves the same height in normal flow. -->
<div>
	<div class="h-16 shrink-0 md:h-[4.25rem]" aria-hidden="true"></div>
	<nav
		class="fixed inset-x-0 top-0 z-[100] flex w-full items-center gap-3 border-b border-mms-gold/10 bg-gradient-to-b from-mms-ink/95 via-mms-ink/90 to-mms-ink/10 px-5 py-2 backdrop-blur-lg md:gap-4 md:px-12"
	>
	<a
		href={resolve('/')}
		class="inline-flex shrink-0 items-center gap-2 text-mms-gold no-underline transition hover:opacity-90 z-[102]"
		onclick={closeMenu}
	>
		<span class="sr-only">Rio — home</span>
		{#if $storeHeaderLogo}
			<img src={$storeHeaderLogo} alt="Rosvelte" class="h-8 w-auto max-w-[11rem] object-contain" />
		{:else}
			<svg width="30px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
				<g clip-path="url(#clip0)">
				<path d="M35.8 13H32L21 32L9.8 13H6" stroke="#c9a84c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M25.7509 25.5961C31.3517 28.7465 38.446 26.7601 41.5964 21.1593C44.7469 15.5585 42.7605 8.46426 37.1597 5.31381C31.5589 2.16336 24.4646 4.14976 21.3142 9.75056" stroke="#c9a84c" stroke-width="4" stroke-linecap="round"/>
				<path d="M26 44H16" stroke="#c9a84c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M21 44L21 32" stroke="#c9a84c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
				<path d="M12 16C12 16 14 14 17 14C20 14 22 17 25 17C28 17 30 16 30 16" stroke="#c9a84c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
				</g>
				<defs>
				<clipPath id="clip0">
				<rect width="48" height="48" fill="white"/>
				</clipPath>
				</defs>
				</svg>
				Rosvelte
		{/if}
	</a>
	<div
		id="mms-site-nav"
		class="flex flex-1 min-w-0 items-center justify-end gap-6 md:flex md:flex-row md:gap-2 lg:gap-4 {menuOpen
			? 'max-md:flex max-md:fixed max-md:inset-0 max-md:z-[101] max-md:h-screen max-md:flex-col max-md:justify-start max-md:overflow-y-auto max-md:bg-mms-ink/97 max-md:gap-6 max-md:px-6 max-md:pb-12 max-md:pt-24'
			: 'max-md:hidden'}"
	>
		<!-- Mobile -->
		<div class="hidden max-md:flex max-md:w-full max-md:flex-col max-md:gap-8">
			<div>
				<p class="mb-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">Collection</p>
				<a href={collectionsPath} class={mobileLink(isCollections && activeCollectionCat === 'all')} onclick={closeMenu}
					>All spirits</a>
				{#each MMS_NAV_COLLECTION_CATS as row}
					<a
						href={mmsCollectionsHref(collectionsPath, row.cat)}
						class={mobileLink(isCollections && activeCollectionCat === row.cat)}
						onclick={closeMenu}>{row.label}</a>
				{/each}
			</div>
			<div>
				<p class="mb-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">Origins</p>
				<a href={originsPath} class={mobileLink(isOrigins)} onclick={closeMenu}>Explore origins</a>
			</div>
			<div>
				<p class="mb-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">Editorial</p>
				<a href={journalPath} class={mobileLink(isJournal)} onclick={closeMenu}>The journal</a>
			</div>
			<div>
				<p class="mb-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">Tasting notes</p>
				<a href={tastingNotesPath} class={mobileLink(isTastingNotes)} onclick={closeMenu}>Curator tasting notes</a>
			</div>
			<a
				href={cartPath}
				class={mobileLink(isCart)}
				onclick={closeMenu}>Shopping bag</a>
			{#if sessionUser}
				<button
					type="button"
					class="{headerIconBox} relative size-[2.4rem]"
					disabled
					aria-disabled="true"
					aria-label="Notifications (available soon)"
				>
					<svg
						class="size-[1.125rem]"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						stroke="currentColor"
						stroke-width="1.4"
						aria-hidden="true"
					>
						<path
							d="M12 3a5 5 0 00-5 5v3.5L5 17h14l-2-5.5V8a5 5 0 00-5-5z"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path d="M10 21a2 2 0 004 0" stroke-linecap="round" />
					</svg>
					<span class="pointer-events-none absolute right-2 top-1.5 size-2 rounded-full bg-red-600" aria-hidden="true"
					></span>
				</button>
				<a
					href={accountPath}
					class="flex max-w-[min(240px,calc(100vw-11rem))] items-center gap-2.5 border border-mms-gold/35 px-2.5 py-1.5 text-mms-cream no-underline transition hover:border-mms-gold/55 hover:bg-mms-gold/[0.06] sm:gap-3 sm:px-3 {isAccount
						? 'border-mms-gold/60 text-mms-gold'
						: ''}"
					aria-current={isAccount ? 'page' : undefined}
					onclick={closeMenu}
				>
					<span
						class="flex size-[2.125rem] shrink-0 items-center justify-center rounded-full border border-mms-gold/40 font-mms-sans text-[0.65rem] font-medium uppercase tracking-wider text-mms-gold"
					>
						{customerInitials}
					</span>
					<span class="truncate text-left font-mms-sans text-[0.8rem] text-mms-cream">{sessionUser.name}</span>
				</a>
			{:else}
				<a
					href={accountLoginPath}
					class="inline-flex items-center py-1.5 text-mms-cream no-underline transition hover:text-mms-gold {isAccount
						? 'text-mms-gold'
						: ''}"
					aria-current={isAccount ? 'page' : undefined}
					aria-label="Sign in"
					onclick={closeMenu}
				>
					{@render profileIcon('size-7 shrink-0')}
				</a>
			{/if}
			<a
				href={reserveHref}
				class="border border-mms-gold-dim px-5 py-2 text-center text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold no-underline transition hover:bg-mms-gold hover:text-mms-ink"
				onclick={closeMenu}>Reserve</a>
		</div>

		<!-- Desktop: megas open on hover / focus-within only; full-width bridge keeps hover while moving into panel. -->
		<div class="max-md:hidden md:flex md:items-stretch md:gap-6 lg:gap-8">
			<!-- md:pb-*: fixed mega/bridge don't extend layout box; padding keeps :hover on group while moving into panel -->
			<div
				class="group/collection relative z-10 flex items-center group-hover/collection:z-50 group-focus-within/collection:z-50 h-20"
			>
				<a
					href={collectionsPath}
					class={navMegaTriggerClass(isCollections, 'collection')}
					aria-haspopup="true"
					aria-expanded="false"
				>
					Collection
				</a>
				<!-- Invisible strip: cursor path from label → mega without leaving the group -->
				<div
					aria-hidden="true"
					class="pointer-events-none invisible fixed inset-x-0 z-[104] opacity-0 {megaBridgeH} {megaBridgeTop} group-hover/collection:pointer-events-auto group-hover/collection:visible group-hover/collection:opacity-100 group-focus-within/collection:pointer-events-auto group-focus-within/collection:visible group-focus-within/collection:opacity-100"
				></div>
				<div
					class="pointer-events-none invisible fixed inset-x-0 z-[105] {megaPanelPull} max-h-[calc(100dvh-3.5rem)] overflow-x-hidden overflow-y-auto border-t-2 border-mms-gold/45 bg-[#12100c] pt-2 opacity-0 shadow-[0_28px_56px_rgba(0,0,0,0.65)] backdrop-blur-xl transition duration-150 {megaPanelTop} group-hover/collection:pointer-events-auto group-hover/collection:visible group-hover/collection:opacity-100 group-focus-within/collection:pointer-events-auto group-focus-within/collection:visible group-focus-within/collection:opacity-100"
				>
					<MmsNavMegaShop
						{collectionsPath}
						{tastingNotesPath}
						{reserveHref}
						activeCat={activeCollectionCat}
						activeCountry={activeCollectionCountry}
						activeRegion={activeCollectionRegion}
					/>
				</div>
			</div>

			<div
				class="group/origins relative z-10 flex items-center group-hover/origins:z-50 group-focus-within/origins:z-50"
			>
				<a href={originsPath} class={navMegaTriggerClass(isOriginsActive, 'origins')}>Origins</a>
				<div
					aria-hidden="true"
					class="pointer-events-none invisible fixed inset-x-0 z-[104] opacity-0 {megaBridgeH} {megaBridgeTop} group-hover/origins:pointer-events-auto group-hover/origins:visible group-hover/origins:opacity-100 group-focus-within/origins:pointer-events-auto group-focus-within/origins:visible group-focus-within/origins:opacity-100"
				></div>
				<div
					class="pointer-events-none invisible fixed inset-x-0 z-[105] {megaPanelPull} max-h-[calc(100dvh-3.5rem)] overflow-x-hidden overflow-y-auto border-t-2 border-mms-gold/45 bg-[#12100c] pt-2 opacity-0 shadow-[0_28px_56px_rgba(0,0,0,0.65)] backdrop-blur-xl transition duration-150 {megaPanelTop} group-hover/origins:pointer-events-auto group-hover/origins:visible group-hover/origins:opacity-100 group-focus-within/origins:pointer-events-auto group-focus-within/origins:visible group-focus-within/origins:opacity-100"
				>
					<MmsNavMegaOrigins {originsPath} activeOrigin={activeOrigin} />
				</div>
			</div>

			<div
				class="group/editorial relative z-10 flex items-center group-hover/editorial:z-50 group-focus-within/editorial:z-50"
			>
				<a href={journalPath} class={navMegaTriggerClass(isEditorialActive, 'editorial')}>Editorial</a>
				<div
					aria-hidden="true"
					class="pointer-events-none invisible fixed inset-x-0 z-[104] opacity-0 {megaBridgeH} {megaBridgeTop} group-hover/editorial:pointer-events-auto group-hover/editorial:visible group-hover/editorial:opacity-100 group-focus-within/editorial:pointer-events-auto group-focus-within/editorial:visible group-focus-within/editorial:opacity-100"
				></div>
				<div
					class="pointer-events-none invisible fixed inset-x-0 z-[105] {megaPanelPull} max-h-[calc(100dvh-3.5rem)] overflow-x-hidden overflow-y-auto border-t-2 border-mms-gold/45 bg-[#12100c] pt-2 opacity-0 shadow-[0_28px_56px_rgba(0,0,0,0.65)] backdrop-blur-xl transition duration-150 {megaPanelTop} group-hover/editorial:pointer-events-auto group-hover/editorial:visible group-hover/editorial:opacity-100 group-focus-within/editorial:pointer-events-auto group-focus-within/editorial:visible group-focus-within/editorial:opacity-100"
				>
					<MmsNavMegaEditorial
						{journalPath}
						{tastingNotesPath}
						{collectionsPath}
						activeChannel={activeJournalChannel}
						activeTopic={activeJournalTopic}
					/>
				</div>
			</div>

			<div class="flex items-center">
				<a href={tastingNotesPath} class={navPlainLinkClass(isTastingNotes)}>Tasting notes</a>
			</div>
		</div>
	</div>
	<div class="hidden shrink-0 items-center gap-2 md:flex md:gap-3 lg:gap-4">
		<a
			href={reserveHref}
			class="border border-mms-gold-dim px-5 py-2 text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold no-underline transition hover:bg-mms-gold hover:text-mms-ink"
		>
			Reserve
		</a>
		{#if sessionUser}
			{@render cartTrigger(
				'relative z-[102] flex shrink-0 border-none bg-transparent p-1.5 text-mms-cream transition hover:text-mms-gold'
			)}
			<a
				href={accountPath}
				class="relative z-[102] flex max-w-[11rem] shrink-0 items-center gap-2.5 border border-mms-gold/35 text-mms-cream no-underline transition hover:border-mms-gold/55 hover:bg-mms-gold/[0.06] lg:max-w-[13rem] lg:gap-3 rounded-full pr-4 {isAccount
					? 'border-mms-gold/60 text-mms-gold'
					: ''}"
				aria-current={isAccount ? 'page' : undefined}
				aria-label="My account"
			>
				<span
					class="flex size-8 shrink-0 items-center justify-center rounded-full border border-mms-gold/40 font-mms-sans text-[0.68rem] font-medium uppercase tracking-wider text-mms-gold"
				>
					{customerInitials}
				</span>
				<span class="truncate font-mms-sans text-[0.8rem] leading-tight text-mms-cream">{sessionUser.name}</span>
			</a>
		{:else}
			<a
				href={accountLoginPath}
				class="relative z-[102] inline-flex shrink-0 border-none bg-transparent p-1.5 text-mms-cream no-underline transition hover:text-mms-gold {isAccount
					? 'text-mms-gold'
					: ''}"
				aria-current={isAccount ? 'page' : undefined}
				aria-label="Sign in"
			>
				{@render profileIcon('size-6')}
			</a>
		{/if}
	</div>
	{#if sessionUser}
		{@render cartTrigger(
			'relative z-[102] ml-auto flex shrink-0 border-none bg-transparent p-1.5 text-mms-cream transition hover:text-mms-gold md:hidden'
		)}
	{/if}
	{#if !sessionUser}
		{@render cartTrigger(
			'relative z-[102] ml-auto flex shrink-0 border-none bg-transparent p-1.5 text-mms-cream transition hover:text-mms-gold md:ml-0'
		)}
	{/if}
	<button
		type="button"
		class="relative z-[102] flex shrink-0 flex-col gap-1.5 border-none bg-transparent p-1 md:hidden"
		onclick={toggleMenu}
		aria-expanded={menuOpen}
		aria-controls="mms-site-nav"
		aria-label={menuOpen ? 'Close menu' : 'Open menu'}
	>
		<span class="block h-px w-[22px] bg-mms-cream"></span>
		<span class="block h-px w-[22px] bg-mms-cream"></span>
		<span class="block h-px w-[22px] bg-mms-cream"></span>
	</button>
	</nav>
	<MmsMiniCart
		open={cartOpen}
		onClose={() => (cartOpen = false)}
		catalogHeroImages={page.data.catalogHeroImages}
	/>
</div>
