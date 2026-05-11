<script lang="ts">
	import { enhance } from '$app/forms';
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
	import MmsSiteSearchField from './MmsSiteSearchField.svelte';
	import { cartItemCount, syncCartHeroIdsFromCatalog, syncCartStockQtysFromCatalog } from '$lib/cart/mms-cart';
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
	const accountSignupPath = $derived(resolve('/account/signup'));
	const accountDashboardPath = $derived(`${accountPath}?section=overview`);
	const accountOrdersPath = $derived(`${accountPath}?section=orders`);
	const accountWishlistPath = $derived(`${accountPath}?section=wishlist`);
	const accountSignOutAction = $derived(`${accountPath}?/signOut`);
	const catalogSearchItems = $derived(page.data.catalogSearchItems ?? []);
	const searchCat = $derived(searchParams.get('cat')?.trim() ?? '');
	const searchCountry = $derived(searchParams.get('country')?.trim() ?? '');
	const searchRegion = $derived(searchParams.get('region')?.trim() ?? '');

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
		const stockMap = page.data.catalogStockQtys;
		if (stockMap && Object.keys(stockMap).length > 0) {
			syncCartStockQtysFromCatalog(stockMap);
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

	const accountMenuWrap =
		'group/account relative z-[102] flex items-center';
	const accountMenuPanel =
		'pointer-events-none invisible absolute right-0 top-full z-[110] min-w-[13rem] pt-2 opacity-0 transition duration-100 group-hover/account:pointer-events-auto group-hover/account:visible group-hover/account:opacity-100 group-focus-within/account:pointer-events-auto group-focus-within/account:visible group-focus-within/account:opacity-100';
	const accountMenuCard =
		'rounded-lg border border-mms-gold/30 bg-[#12100c]/98 py-1 shadow-[0_20px_48px_rgba(0,0,0,0.55)] backdrop-blur-md';
	const accountMenuLink =
		'flex items-center gap-2.5 px-4 py-2.5 font-mms-sans text-[0.72rem] leading-snug text-mms-cream no-underline transition hover:bg-mms-gold/[0.08] hover:text-mms-gold';
	const accountMenuBtn =
		'flex w-full items-center gap-2.5 px-4 py-2.5 font-mms-sans text-[0.72rem] leading-snug text-mms-cream/90 transition hover:bg-red-500/10 hover:text-red-400';
	const accountMenuIconClass = 'size-[15px] shrink-0 opacity-80';
	const mobileAccountSubLink =
		'flex items-center gap-2 py-1.5 text-[0.68rem] uppercase tracking-[0.15em] no-underline text-mms-cream/70 hover:text-mms-gold';
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

{#snippet accountIconSignIn()}
	<svg class={accountMenuIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
		<polyline points="10 17 15 12 10 7" />
		<line x1="15" y1="12" x2="3" y2="12" />
	</svg>
{/snippet}

{#snippet accountIconSignUp()}
	<svg class={accountMenuIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<line x1="19" y1="8" x2="19" y2="14" />
		<line x1="22" y1="11" x2="16" y2="11" />
	</svg>
{/snippet}

{#snippet accountIconDashboard()}
	<svg class={accountMenuIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<rect x="3" y="3" width="7" height="7" rx="1" />
		<rect x="14" y="3" width="7" height="7" rx="1" />
		<rect x="14" y="14" width="7" height="7" rx="1" />
		<rect x="3" y="14" width="7" height="7" rx="1" />
	</svg>
{/snippet}

{#snippet accountIconOrders()}
	<svg class={accountMenuIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
		<path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" />
		<path d="M9 12h6" />
		<path d="M9 16h6" />
	</svg>
{/snippet}

{#snippet accountIconWishlist()}
	<svg class={accountMenuIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
	</svg>
{/snippet}

{#snippet accountIconSignOut()}
	<svg class={accountMenuIconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
		<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
		<polyline points="16 17 21 12 16 7" />
		<line x1="21" y1="12" x2="9" y2="12" />
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
			<MmsSiteSearchField
				inputId="site-search-mobile"
				{collectionsPath}
				items={catalogSearchItems}
				submitVariant="text"
				formClass="flex w-full items-center gap-2 border border-mms-gold/25 px-2 py-2 rounded-full"
				inputClass="min-w-0 flex-1 border-none bg-transparent px-2 py-1 font-mms-sans text-[0.72rem] text-mms-cream outline-none placeholder:text-mms-muted"
			/>
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
				<div class="flex flex-col gap-2 border-b border-mms-gold/10 pb-4">
					<a
						href={accountDashboardPath}
						class="flex max-w-[min(240px,calc(100vw-11rem))] items-center gap-2.5 border border-mms-gold/35 rounded-full text-mms-cream no-underline transition hover:border-mms-gold/55 hover:bg-mms-gold/[0.06] sm:gap-3 sm:px-3 {isAccount
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
					<div class="flex flex-col gap-1 pl-1">
						<a href={accountDashboardPath} class={mobileAccountSubLink} onclick={closeMenu}
							>{@render accountIconDashboard()} My Account</a>
						<a href={accountOrdersPath} class={mobileAccountSubLink} onclick={closeMenu}
							>{@render accountIconOrders()} My Orders</a>
						<a href={accountWishlistPath} class={mobileAccountSubLink} onclick={closeMenu}
							>{@render accountIconWishlist()} My Wishlist</a>
						<form method="post" action={accountSignOutAction} use:enhance class="contents">
							<button
								type="submit"
								class="flex w-fit items-center gap-2 py-1.5 text-left text-[0.68rem] uppercase tracking-[0.15em] text-mms-muted transition hover:text-red-400"
							>
								{@render accountIconSignOut()}
								Sign out
							</button>
						</form>
					</div>
				</div>
			{:else}
				<div class="flex flex-col gap-2 border-b border-mms-gold/10 pb-4">
					<a
						href={accountLoginPath}
						class="inline-flex items-center gap-2 py-1.5 text-mms-cream no-underline transition hover:text-mms-gold {isAccount
							? 'text-mms-gold'
							: ''}"
						aria-current={isAccount ? 'page' : undefined}
						aria-label="Sign in"
						onclick={closeMenu}
					>
						{@render profileIcon('size-7 shrink-0')}
						<span class="text-[0.68rem] uppercase tracking-[0.15em]">Account</span>
					</a>
					<div class="flex flex-col gap-1 pl-1">
						<a href={accountLoginPath} class={mobileAccountSubLink} onclick={closeMenu}
							>{@render accountIconSignIn()} Sign in</a>
						<a href={accountSignupPath} class={mobileAccountSubLink} onclick={closeMenu}
							>{@render accountIconSignUp()} Sign up</a>
					</div>
				</div>
			{/if}
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
		<div class="relative z-[102]">
			<MmsSiteSearchField
				inputId="site-search-desktop"
				{collectionsPath}
				items={catalogSearchItems}
				formClass="flex items-center gap-2 border border-mms-gold/25 bg-mms-ink/40 px-2 rounded-full"
				inputClass="w-[9.5rem] border-none bg-transparent px-1 py-1 font-mms-sans text-[0.68rem] tracking-[0.08em] text-mms-cream outline-none placeholder:text-mms-muted lg:w-[11rem]"
			/>
		</div>
		{#if sessionUser}
			{@render cartTrigger(
				'relative z-[102] flex shrink-0 border-none bg-transparent p-1.5 text-mms-cream transition hover:text-mms-gold'
			)}
			<div class={accountMenuWrap}>
				<a
					href={accountDashboardPath}
					class="relative z-[102] flex max-w-[11rem] shrink-0 items-center gap-2.5 rounded-full border border-mms-gold/35 pr-4 text-mms-cream no-underline transition hover:border-mms-gold/55 hover:bg-mms-gold/[0.06] lg:max-w-[13rem] lg:gap-3 {isAccount
						? 'border-mms-gold/60 text-mms-gold'
						: ''}"
					aria-current={isAccount ? 'page' : undefined}
					aria-label="My account"
					aria-haspopup="true"
					aria-expanded="false"
					aria-controls="site-account-menu-signed-in"
				>
					<span
						class="flex size-8 shrink-0 items-center justify-center rounded-full border border-mms-gold/40 font-mms-sans text-[0.68rem] font-medium uppercase tracking-wider text-mms-gold"
					>
						{customerInitials}
					</span>
					<span class="truncate font-mms-sans text-[0.8rem] leading-tight text-mms-cream capitalize">{sessionUser.name}</span>
				</a>
				<div
					id="site-account-menu-signed-in"
					class={accountMenuPanel}
					role="menu"
					aria-label="Account menu"
				>
					<div class={accountMenuCard}>
						<a href={accountDashboardPath} class={accountMenuLink} role="menuitem"
							>{@render accountIconDashboard()} My Account</a>
						<a href={accountOrdersPath} class={accountMenuLink} role="menuitem"
							>{@render accountIconOrders()} My Orders</a>
						<a href={accountWishlistPath} class={accountMenuLink} role="menuitem"
							>{@render accountIconWishlist()} My Wishlist</a>
						<form method="post" action={accountSignOutAction} use:enhance>
							<button type="submit" class={accountMenuBtn} role="menuitem"
								>{@render accountIconSignOut()} Sign out</button>
						</form>
					</div>
				</div>
			</div>
		{:else}
			<div class={accountMenuWrap}>
				<a
					href={accountLoginPath}
					class="relative z-[102] inline-flex shrink-0 border-none bg-transparent p-1.5 text-mms-cream no-underline transition hover:text-mms-gold {isAccount
						? 'text-mms-gold'
						: ''}"
					aria-current={isAccount ? 'page' : undefined}
					aria-label="Account"
					aria-haspopup="true"
					aria-expanded="false"
					aria-controls="site-account-menu-guest"
				>
					{@render profileIcon('size-6')}
				</a>
				<div id="site-account-menu-guest" class={accountMenuPanel} role="menu" aria-label="Account menu">
					<div class={accountMenuCard}>
						<a href={accountLoginPath} class={accountMenuLink} role="menuitem"
							>{@render accountIconSignIn()} Sign in</a>
						<a href={accountSignupPath} class={accountMenuLink} role="menuitem"
							>{@render accountIconSignUp()} Sign up</a>
					</div>
				</div>
			</div>
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
		catalogStockQtys={page.data.catalogStockQtys}
	/>
</div>
