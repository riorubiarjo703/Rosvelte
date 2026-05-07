<script lang="ts">
	import { enhance } from '$app/forms';
	import type { Pathname } from '$app/types';
	import { resolve } from '$app/paths';
	import type { User } from 'better-auth/types';
	import type { MmsCollectionProduct } from '$lib/data/mms-collection-products';
	import { formatIdr } from '$lib/cart/mms-cart';
	import type { MmsWishlistEntry } from '$lib/wishlist/mms-wishlist';
	import { removeWishlistProduct, wishlistEntries } from '$lib/wishlist/mms-wishlist';
	import CollectionBottleArt from '$lib/components/collections/CollectionBottleArt.svelte';
	import { catalogHeroImagePublicPath } from '$lib/catalog/hero-image-path';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
	import { Switch } from 'bits-ui';

	type CustomerUser = User & {
		birthDate?: string | null;
		phone?: string | null;
		preferredLanguage?: string | null;
		spiritPreference?: string | null;
	};

	type AccountForm = {
		profileMessage?: string;
		passwordMessage?: string;
		profileOk?: boolean;
		passwordOk?: boolean;
		message?: string;
	};

	type Panel =
		| 'overview'
		| 'orders'
		| 'wishlist'
		| 'tasting'
		| 'recommendations'
		| 'addresses'
		| 'profile';

	let {
		customer,
		curated,
		form
	}: { customer: CustomerUser; curated: MmsCollectionProduct[]; form?: AccountForm | null } = $props();

	let activePanel = $state<Panel>('overview');
	let mobileNavOpen = $state(false);

	const firstName = $derived(customer.name.trim().split(/\s+/)[0] || customer.name);
	const initials = $derived.by(() => {
		const parts = customer.name.trim().split(/\s+/).filter(Boolean);
		if (parts.length >= 2)
			return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
		return customer.name.slice(0, 2).toUpperCase();
	});
	const memberSince = $derived.by(() => {
		const raw = customer.createdAt;
		if (!raw) return 'Recently';
		const d = typeof raw === 'string' ? new Date(raw) : new Date(raw);
		return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
	});

	function setPanel(p: Panel) {
		activePanel = p;
		mobileNavOpen = false;
	}

	function navItemClass(p: Panel) {
		const base =
			'flex w-full items-center gap-3 border-l-2 border-transparent py-2.5 pl-6 pr-4 text-left text-[0.72rem] text-mms-muted transition-colors hover:bg-mms-gold/[0.06] hover:text-mms-cream';
		const active =
			p === activePanel ? ' border-mms-gold bg-mms-gold/[0.08] text-mms-gold' : '';
		return base + active;
	}

	function heroSrc(p: MmsCollectionProduct): string | null {
		return catalogHeroImagePublicPath(p.heroImageUploadId);
	}

	function wishlistHeroHref(e: MmsWishlistEntry): string | null {
		const rel = catalogHeroImagePublicPath(e.heroImageUploadId);
		return rel ? resolvedLocalizedHref(rel as Pathname) : null;
	}

	function splitName(full: string) {
		const parts = full.trim().split(/\s+/).filter(Boolean);
		return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
	}

	let pfFirst = $state('');
	let pfLast = $state('');
	let pfBirth = $state('');
	let pfPhone = $state('');
	let pfLang = $state('English');
	let pfSpirit = $state('');

	let pwCurrent = $state('');
	let pwNew = $state('');
	let pwConfirm = $state('');

	type NotifKey = 'drops' | 'orders' | 'digest' | 'wishlist' | 'events';
	let notifs = $state<Record<NotifKey, boolean>>({
		drops: true,
		orders: true,
		digest: true,
		wishlist: true,
		events: false
	});
	let notifsHydrated = $state(false);

	function loadProfileFromCustomer() {
		const { first, last } = splitName(customer.name);
		pfFirst = first;
		pfLast = last;
		pfBirth = customer.birthDate?.trim() ?? '';
		pfPhone = customer.phone?.trim() ?? '';
		pfLang = customer.preferredLanguage?.trim() || 'English';
		pfSpirit = customer.spiritPreference?.trim() || '';
	}

	function notifStorageKey() {
		return `rosvelte-customer-notifs-${customer.id}`;
	}

	function loadNotifsFromStorage() {
		if (typeof localStorage === 'undefined') return;
		try {
			const raw = localStorage.getItem(notifStorageKey());
			if (!raw) return;
			const parsed = JSON.parse(raw) as Partial<Record<NotifKey, boolean>>;
			notifs = {
				drops: parsed.drops ?? true,
				orders: parsed.orders ?? true,
				digest: parsed.digest ?? true,
				wishlist: parsed.wishlist ?? true,
				events: parsed.events ?? false
			};
		} catch {
			/* keep defaults */
		}
	}

	function persistNotifs() {
		if (typeof localStorage === 'undefined') return;
		try {
			localStorage.setItem(notifStorageKey(), JSON.stringify(notifs));
		} catch {
			/* ignore */
		}
	}

	function setNotif(key: NotifKey, value: boolean) {
		notifs = { ...notifs, [key]: value };
		persistNotifs();
	}

	$effect(() => {
		if (activePanel !== 'profile') {
			notifsHydrated = false;
			return;
		}
		if (notifsHydrated || typeof window === 'undefined') return;
		notifsHydrated = true;
		loadNotifsFromStorage();
	});

	const inputClass =
		'w-full border border-mms-gold/15 bg-mms-ink3 px-3 py-2.5 text-sm text-mms-cream placeholder:text-mms-muted/45 focus:border-mms-gold/40 focus:outline-none';
	const labelClass = 'mb-1 block text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted';

	const languageOptions = ['English', 'Bahasa Indonesia', '日本語'] as const;
	const spiritOptions: string[] = [
		'Scotch whisky — sherry cask',
		'Scotch whisky — bourbon cask',
		'Bourbon & rye',
		'Irish whiskey',
		'Japanese whisky',
		'World whisky'
	];

	/** Bits-UI switch — matches dark track + ink thumb (see MMS notification mock). */
	const notifSwitchRootClass =
		'relative mt-2 inline-flex h-7 w-12 shrink-0 cursor-default items-center rounded-full border border-mms-gold/20 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-mms-gold/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1713] data-[state=checked]:bg-mms-gold/90 data-[state=unchecked]:bg-mms-gold/10 sm:mt-0';
	const notifSwitchThumbClass =
		'pointer-events-none block size-6 translate-x-0.5 rounded-full bg-mms-cream2 transition-transform will-change-transform data-[state=checked]:translate-x-[1.35rem]';

	$effect(() => {
		if (activePanel !== 'profile') return;
		void customer.id;
		void customer.name;
		void customer.birthDate;
		void customer.phone;
		void customer.preferredLanguage;
		void customer.spiritPreference;
		loadProfileFromCustomer();
	});
</script>

<div
	class="relative grid min-h-[calc(100dvh-5rem)] w-full grid-cols-1 border-t border-mms-gold/10 lg:grid-cols-[minmax(0,240px)_1fr]"
>
	{#if mobileNavOpen}
		<button
			type="button"
			class="fixed inset-0 z-[85] bg-black/60 lg:hidden"
			aria-label="Close menu"
			onclick={() => (mobileNavOpen = false)}
		></button>
	{/if}

	<!-- Sidebar -->
	<aside
		class="z-[90] flex flex-col border-mms-gold/10 bg-[#1a1713] max-lg:fixed max-lg:top-16 max-lg:h-[calc(100dvh-4rem)] max-lg:w-[min(260px,88vw)] max-lg:overflow-y-auto max-lg:border-r max-lg:transition-transform lg:sticky lg:top-16 lg:h-[calc(100dvh-4rem)] lg:border-r {mobileNavOpen
			? 'max-lg:translate-x-0'
			: 'max-lg:-translate-x-full'}"
	>
		<div class="border-b border-mms-gold/[0.06] px-6 py-8">
			<div
				class="mb-3 flex size-16 items-center justify-center rounded-full border-2 border-mms-gold/30 bg-mms-gold/10 font-mms-serif text-2xl font-light text-mms-gold"
			>
				{initials}
			</div>
			<p class="font-mms-serif text-lg font-light text-mms-cream">{customer.name}</p>
			<p class="mt-1 text-[0.6rem] uppercase tracking-[0.22em] text-mms-gold-dim">Member</p>
			<p class="mt-1 text-[0.65rem] text-mms-muted">Member since {memberSince}</p>
		</div>

		<p class="px-6 pt-4 text-[0.52rem] uppercase tracking-[0.25em] text-mms-muted/80">Shop</p>
		<button type="button" class={navItemClass('overview')} onclick={() => setPanel('overview')}>
			<svg class="size-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<rect x="3" y="3" width="7" height="7" />
				<rect x="14" y="3" width="7" height="7" />
				<rect x="3" y="14" width="7" height="7" />
				<rect x="14" y="14" width="7" height="7" />
			</svg>
			Overview
		</button>
		<button type="button" class={navItemClass('orders')} onclick={() => setPanel('orders')}>
			<svg class="size-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path
					d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
				/>
			</svg>
			My orders
			<span class="ml-auto rounded-md bg-red-600/90 px-1.5 py-0.5 text-[0.5rem] font-medium text-white">0</span>
		</button>
		<button type="button" class={navItemClass('wishlist')} onclick={() => setPanel('wishlist')}>
			<svg class="size-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path
					d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
				/>
			</svg>
			Wishlist
			<span class="ml-auto rounded-md bg-mms-gold px-1.5 py-0.5 text-[0.5rem] font-medium text-mms-ink"
				>{$wishlistEntries.length}</span
			>
		</button>
		<button type="button" class={navItemClass('tasting')} onclick={() => setPanel('tasting')}>
			<svg class="size-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
				<rect x="9" y="3" width="6" height="4" rx="1" />
				<path d="M9 12h6M9 16h4" />
			</svg>
			Tasting log
		</button>
		<button type="button" class={navItemClass('recommendations')} onclick={() => setPanel('recommendations')}>
			<svg class="size-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
			</svg>
			For you
			<span class="ml-auto rounded-md bg-mms-gold px-1.5 py-0.5 text-[0.5rem] font-medium text-mms-ink">New</span>
		</button>

		<p class="px-6 pt-5 text-[0.52rem] uppercase tracking-[0.25em] text-mms-muted/80">Account</p>
		<button type="button" class={navItemClass('addresses')} onclick={() => setPanel('addresses')}>
			<svg class="size-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
				<circle cx="12" cy="10" r="3" />
			</svg>
			Addresses
		</button>
		<button type="button" class={navItemClass('profile')} onclick={() => setPanel('profile')}>
			<svg class="size-[15px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
				<circle cx="12" cy="7" r="4" />
			</svg>
			Profile & settings
		</button>

		<div class="mt-auto border-t border-mms-gold/[0.06] p-5">
			<form method="post" action="?/signOut" use:enhance>
				<button
					type="submit"
					class="flex w-full items-center justify-center gap-2 border border-mms-gold/15 py-2.5 text-[0.65rem] uppercase tracking-[0.18em] text-mms-muted transition hover:border-red-500/50 hover:text-red-400"
				>
					<svg class="size-[13px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
					</svg>
					Sign out
				</button>
			</form>
		</div>
	</aside>

	<!-- Main -->
	<div class="min-w-0 bg-mms-ink px-4 py-8 md:px-10 md:py-10">
		<div class="mb-6 flex items-center justify-between lg:hidden">
			<button
				type="button"
				class="border border-mms-gold/20 px-3 py-2 text-[0.65rem] uppercase tracking-[0.15em] text-mms-gold"
				onclick={() => (mobileNavOpen = true)}
			>
				Menu
			</button>
		</div>

		<!-- Overview -->
		{#if activePanel === 'overview'}
			<header class="mb-8">
				<p
					class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim before:block before:h-px before:w-4 before:bg-mms-gold-dim"
				>
					Dashboard
				</p>
				<h1 class="font-mms-display text-3xl font-light leading-tight text-mms-cream md:text-[2rem]">
					Welcome back, <em class="text-mms-gold-light italic">{firstName}</em>
				</h1>
			</header>

			<div
				class="relative mb-8 flex flex-col gap-6 overflow-hidden border border-mms-gold/15 bg-[#1a1713] px-6 py-8 md:flex-row md:items-center md:justify-between md:px-10"
			>
				<p
					class="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 font-mms-display text-[5.5rem] leading-none tracking-[0.05em] text-mms-gold/[0.04] select-none md:text-[8rem]"
					aria-hidden="true"
				>
					Rosvelte
				</p>
				<div class="relative z-[1] max-w-xl">
					<h2 class="font-mms-display text-xl font-light text-mms-cream md:text-[1.6rem]">
						Your <em class="text-mms-gold-light italic">member</em> benefits are active
					</h2>
					<p class="mt-2 text-[0.78rem] font-light leading-relaxed text-mms-muted">
						Early access to allocations, tasting notes, and journal features ship with checkout. Explore the collection
						while we finish order history here.
					</p>
				</div>
				<div class="relative z-[1] text-left md:text-right">
					<span class="font-mms-display text-sm tracking-[0.28em] text-mms-gold">★ Member</span>
					<span class="mt-1 block font-mms-serif text-3xl font-light text-mms-cream">0</span>
					<span class="mt-1 block text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">Loyalty points</span>
				</div>
			</div>

			<div class="mb-8 grid grid-cols-2 gap-px bg-mms-gold/10 md:grid-cols-4">
				{#each [{ v: '0', l: 'Orders placed', s: 'All time' }, { v: '0', l: 'Total spent', s: 'Lifetime' }, { v: '0', l: 'Bottles logged', s: 'Tasting journal' }] as stat}
					<div
						class="group relative bg-[#1a1713] p-5 transition-colors hover:bg-[#221f1a] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:scale-x-0 before:bg-mms-gold before:opacity-0 before:transition-[opacity,transform] group-hover:before:scale-x-100 group-hover:before:opacity-100"
					>
						<span class="font-mms-serif text-2xl font-light text-mms-cream">{stat.v}</span>
						<span class="mt-1 block text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">{stat.l}</span>
						<p class="mt-2 text-[0.65rem] text-mms-muted/80">{stat.s}</p>
					</div>
				{/each}
				<div
					class="group relative bg-[#1a1713] p-5 transition-colors hover:bg-[#221f1a] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:scale-x-0 before:bg-mms-gold before:opacity-0 before:transition-[opacity,transform] group-hover:before:scale-x-100 group-hover:before:opacity-100"
				>
					<span class="font-mms-serif text-2xl font-light text-mms-cream">{$wishlistEntries.length}</span>
					<span class="mt-1 block text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted">Wishlist</span>
					<p class="mt-2 text-[0.65rem] text-mms-muted/80">Saved bottles</p>
				</div>
			</div>

			<p class="mb-4 flex items-center gap-3 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim after:h-px after:flex-1 after:bg-mms-gold/10">
				Latest order
			</p>
			<div class="mb-8 border border-mms-gold/10 bg-[#1a1713] p-6 md:p-8">
				<p class="text-center font-mms-serif text-lg text-mms-muted">No orders yet</p>
				<p class="mx-auto mt-2 max-w-sm text-center text-[0.78rem] text-mms-muted/90">
					When you purchase from Rosvelte, status and tracking will appear here.
				</p>
				<a
					href={resolve('/collections')}
					class="mx-auto mt-6 flex w-fit border border-mms-gold/40 px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.2em] text-mms-gold no-underline transition hover:bg-mms-gold hover:text-mms-ink"
				>
					Browse collection
				</a>
			</div>

			<p class="mb-4 flex items-center gap-3 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim after:h-px after:flex-1 after:bg-mms-gold/10">
				Curated for you
			</p>
			<div class="grid grid-cols-1 gap-px bg-mms-gold/10 sm:grid-cols-2 lg:grid-cols-3">
				{#each curated as p}
					<a
						href={resolve('/collections/[id]', { id: String(p.id) })}
						class="group relative block bg-[#1a1713] p-6 no-underline transition-colors before:absolute before:inset-x-0 before:top-0 before:h-px before:origin-left before:scale-x-0 before:bg-mms-gold before:transition-transform hover:bg-[#221f1a] hover:before:scale-x-100"
					>
						<p
							class="mb-3 inline-block border border-mms-gold/15 px-2 py-1 text-[0.55rem] uppercase tracking-[0.15em] text-mms-gold-dim"
						>
							Based on your region
						</p>
						<div class="mb-4 flex h-[90px] items-center justify-center">
							{#if heroSrc(p)}
								<img src={heroSrc(p)!} alt="" class="max-h-full max-w-[72px] object-contain opacity-90" />
							{:else}
								<CollectionBottleArt height={90} />
							{/if}
						</div>
						<p class="text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold-dim">
							{p.country} — {p.region}
						</p>
						<p class="mt-1 font-mms-serif text-base text-mms-cream">{p.name}</p>
						<p class="mt-2 text-[0.68rem] text-mms-muted">MMS score <strong class="text-mms-gold">{p.rating}</strong></p>
						<span class="mt-2 block font-mms-sans text-[0.9rem] text-mms-gold">{formatIdr(p.price)}</span>
						<span
							class="mt-4 block w-full border border-mms-gold/25 py-2 text-center text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold transition group-hover:border-mms-gold group-hover:bg-mms-gold group-hover:text-mms-ink"
						>
							View & add to bag
						</span>
					</a>
				{/each}
			</div>
		{/if}

		<!-- Orders -->
		{#if activePanel === 'orders'}
			<header class="mb-8">
				<p class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim before:block before:h-px before:w-4 before:bg-mms-gold-dim">Purchase history</p>
				<h1 class="font-mms-display text-3xl font-light text-mms-cream md:text-[2rem]">My <em class="text-mms-gold-light italic">orders</em></h1>
			</header>
			<div class="border border-mms-gold/10 bg-[#1a1713] p-10 text-center text-mms-muted">
				<p class="font-mms-serif text-lg text-mms-cream/90">No orders to show</p>
				<p class="mt-2 text-sm">Order history will appear here after checkout launches.</p>
			</div>
		{/if}

		{#if activePanel === 'wishlist'}
			<header class="mb-8">
				<p
					class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim before:block before:h-px before:w-4 before:bg-mms-gold-dim"
				>
					Saved bottles
				</p>
				<h1 class="font-mms-display text-3xl font-light text-mms-cream md:text-[2rem]">
					Wish<em class="text-mms-gold-light italic">list</em>
				</h1>
			</header>

			{#if $wishlistEntries.length === 0}
				<div class="border border-mms-gold/10 bg-[#1a1713] p-10 text-center text-mms-muted">
					<p class="font-mms-serif text-lg text-mms-cream/90">No bottles saved yet</p>
					<p class="mx-auto mt-2 max-w-md text-sm leading-relaxed">
						Save expressions from the collection with the heart icon — they will appear here on this device.
					</p>
					<a
						href={resolve('/collections')}
						class="mx-auto mt-8 inline-flex border border-mms-gold/40 px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.2em] text-mms-gold no-underline transition hover:bg-mms-gold hover:text-mms-ink"
					>
						Browse collection
					</a>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-px bg-mms-gold/10 sm:grid-cols-2">
					{#each $wishlistEntries as entry (entry.productId)}
						<div
							class="relative flex gap-5 bg-[#1a1713] p-6 transition-colors hover:bg-[#221f1a] md:p-7"
						>
							<a
								href={resolve('/collections/[id]', { id: String(entry.productId) })}
								class="flex min-w-0 flex-1 gap-4 no-underline"
							>
								<div
									class="flex size-24 shrink-0 items-center justify-center overflow-hidden border border-mms-gold/10 bg-[#221f1a]"
								>
									{#if wishlistHeroHref(entry)}
										<img
											src={wishlistHeroHref(entry)!}
											alt=""
											class="max-h-full max-w-full object-contain p-1"
										/>
									{:else}
										<CollectionBottleArt height={80} />
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<p class="text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold-dim">
										{entry.country} — {entry.region}
									</p>
									<p class="mt-1 font-mms-serif text-base text-mms-cream">{entry.name}</p>
									<p class="mt-2 text-[0.68rem] text-mms-muted">
										Score <strong class="text-mms-gold">{entry.rating}</strong>
									</p>
									<span class="mt-3 block font-mms-sans text-[0.95rem] text-mms-gold">{formatIdr(entry.price)}</span>
								</div>
							</a>
							<button
								type="button"
								class="absolute right-4 top-4 border border-mms-gold/20 px-2 py-1 font-mms-sans text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted transition hover:border-mms-gold hover:text-mms-gold"
								aria-label="Remove {entry.name} from wishlist"
								onclick={() => removeWishlistProduct(entry.productId)}
							>
								Remove
							</button>
						</div>
					{/each}
				</div>
			{/if}
		{/if}

		{#if activePanel === 'tasting'}
			<header class="mb-8">
				<p class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim before:block before:h-px before:w-4 before:bg-mms-gold-dim">Coming soon</p>
				<h1 class="font-mms-display text-3xl font-light capitalize text-mms-cream md:text-[2rem]">Tasting log</h1>
			</header>
			<div class="border border-mms-gold/10 bg-[#1a1713] p-10 text-center text-mms-muted">
				<p class="text-sm leading-relaxed">This area will sync with your bag and tasting journal.</p>
			</div>
		{/if}

		{#if activePanel === 'recommendations'}
			<header class="mb-8">
				<p class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim before:block before:h-px before:w-4 before:bg-mms-gold-dim">Personalised picks</p>
				<h1 class="font-mms-display text-3xl font-light text-mms-cream md:text-[2rem]">
					Curated <em class="text-mms-gold-light italic">for you</em>
				</h1>
			</header>
			<p class="mb-8 max-w-2xl text-[0.78rem] font-light leading-relaxed text-mms-muted">
				Based on the collection and regional highlights, here are bottles worth exploring next.
			</p>
			<div class="grid grid-cols-1 gap-px bg-mms-gold/10 sm:grid-cols-2 lg:grid-cols-3">
				{#each curated as p}
					<a
						href={resolve('/collections/[id]', { id: String(p.id) })}
						class="group relative block bg-[#1a1713] p-6 no-underline transition-colors hover:bg-[#221f1a]"
					>
						<p
							class="mb-3 inline-block border border-mms-gold/15 px-2 py-1 text-[0.55rem] uppercase tracking-[0.15em] text-mms-gold-dim"
						>
							Curator pick
						</p>
						<div class="relative z-[2] mb-7 flex min-h-[240px] items-center justify-center md:h-[300px]">
							{#if heroSrc(p)}
								<img src={heroSrc(p)!} alt="" class="max-h-[min(52vw,260px)] w-auto max-w-[min(100%,220px)] object-contain md:max-h-[280px] md:max-w-[260px]" />
							{:else}
								<CollectionBottleArt height={90} />
							{/if}
						</div>
						<p class="text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold-dim">
							{p.country} — {p.region}
						</p>
						<p class="mt-1 font-mms-serif text-base text-mms-cream">{p.name}</p>
						<p class="mt-2 text-[0.68rem] text-mms-muted">MMS score <strong class="text-mms-gold">{p.rating}</strong></p>
						<span class="mt-2 block font-mms-sans text-[0.9rem] text-mms-gold">{formatIdr(p.price)}</span>
						<span
							class="mt-4 block w-full border border-mms-gold/25 py-2 text-center text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold transition group-hover:border-mms-gold group-hover:bg-mms-gold group-hover:text-mms-ink"
						>
							View & add to bag
						</span>
					</a>
				{/each}
			</div>
		{/if}

		{#if activePanel === 'addresses'}
			<header class="mb-8">
				<p class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim before:block before:h-px before:w-4 before:bg-mms-gold-dim">Delivery</p>
				<h1 class="font-mms-display text-3xl font-light text-mms-cream md:text-[2rem]">My <em class="text-mms-gold-light italic">addresses</em></h1>
			</header>
			<div class="grid grid-cols-1 gap-px bg-mms-gold/10 md:grid-cols-2">
				<div class="relative bg-[#1a1713] p-7">
					<span
						class="absolute right-6 top-6 border border-mms-gold/25 bg-mms-gold/10 px-2 py-0.5 text-[0.52rem] uppercase tracking-[0.15em] text-mms-gold"
					>
						Example
					</span>
					<p class="text-[0.6rem] uppercase tracking-[0.2em] text-mms-gold-dim">Home</p>
					<p class="mt-3 text-sm font-medium text-mms-cream">{customer.name}</p>
					<p class="mt-2 text-[0.78rem] leading-relaxed text-mms-muted">
						Saved shipping addresses will appear here for faster checkout.
					</p>
				</div>
				<button
					type="button"
					class="flex min-h-[180px] flex-col items-center justify-center gap-2 border border-dashed border-mms-gold/20 bg-[#221f1a] text-mms-muted transition hover:border-mms-gold/40"
				>
					<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
						<circle cx="12" cy="12" r="10" />
						<path d="M12 8v8M8 12h8" />
					</svg>
					<span class="text-[0.65rem] uppercase tracking-[0.18em]">Add address (soon)</span>
				</button>
			</div>
		{/if}

		{#if activePanel === 'profile'}
			<header class="mb-8">
				<p class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim before:block before:h-px before:w-4 before:bg-mms-gold-dim">Account settings</p>
				<h1 class="font-mms-display text-3xl font-light text-mms-cream md:text-[2rem]">
					Profile & <em class="text-mms-gold-light italic">preferences</em>
				</h1>
			</header>

			<div class="flex max-w-4xl flex-col gap-px bg-mms-gold/10">
				<!-- Personal information -->
				<section class="border border-mms-gold/10 bg-[#1a1713] p-6 md:p-8">
					<h2 class="mb-6 font-mms-serif text-lg font-light text-mms-gold">Personal information</h2>
					{#if form?.profileMessage}
						<p class="mb-4 text-[0.8rem] text-red-400/95">{form.profileMessage}</p>
					{/if}
					{#if form?.profileOk}
						<p class="mb-4 text-[0.8rem] text-emerald-400/90">Your profile was updated.</p>
					{/if}
					<form
						method="post"
						action="?/updateProfile"
						use:enhance={() =>
							async ({ result, update }) => {
								await update({ reset: false });
							}}
					>
						<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div>
								<label class={labelClass} for="pf-first">First name</label>
								<input id="pf-first" name="firstName" class={inputClass} bind:value={pfFirst} autocomplete="given-name" />
							</div>
							<div>
								<label class={labelClass} for="pf-last">Last name</label>
								<input id="pf-last" name="lastName" class={inputClass} bind:value={pfLast} autocomplete="family-name" />
							</div>
							<div>
								<label class={labelClass} for="pf-email">Email</label>
								<input
									id="pf-email"
									class="{inputClass} cursor-not-allowed opacity-75"
									value={customer.email}
									disabled
									autocomplete="email"
								/>
								<p class="mt-1 text-[0.65rem] text-mms-muted/80">Email cannot be changed here.</p>
							</div>
							<div>
								<label class={labelClass} for="pf-phone">Phone</label>
								<input id="pf-phone" name="phone" class={inputClass} bind:value={pfPhone} type="tel" autocomplete="tel" />
							</div>
							<div>
								<label class={labelClass} for="pf-birth">Date of birth</label>
								<input id="pf-birth" name="birthDate" class={inputClass} bind:value={pfBirth} type="date" />
							</div>
							<div>
								<label class={labelClass} for="pf-lang">Preferred language</label>
								<div class="relative">
									<select id="pf-lang" name="preferredLanguage" class="{inputClass} appearance-none pr-9" bind:value={pfLang}>
										{#each languageOptions as lang}
											<option value={lang}>{lang}</option>
										{/each}
									</select>
								</div>
							</div>
							<div class="md:col-span-2">
								<label class={labelClass} for="pf-spirit">Spirit preferences</label>
								<div class="relative">
									<select id="pf-spirit" name="spiritPreference" class="{inputClass} appearance-none pr-9" bind:value={pfSpirit}>
										<option value="">Select a style</option>
										{#each spiritOptions as s}
											<option value={s}>{s}</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
						<p class="mt-4 text-[0.65rem] text-mms-muted/80">
							Email verified: <strong class="text-mms-cream">{customer.emailVerified ? 'Yes' : 'No'}</strong>
						</p>
						<div class="mt-8 flex flex-wrap justify-end gap-3">
							<button
								type="button"
								class="border border-mms-gold/25 px-5 py-2.5 text-[0.62rem] uppercase tracking-[0.18em] text-mms-muted transition hover:border-mms-gold/40 hover:text-mms-cream"
								onclick={() => loadProfileFromCustomer()}
							>
								Cancel
							</button>
							<button
								type="submit"
								class="border border-mms-gold bg-mms-gold px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.18em] text-mms-ink transition hover:bg-mms-gold-light"
							>
								Save changes
							</button>
						</div>
					</form>
				</section>

				<!-- Email notifications -->
				<section class="border border-mms-gold/10 bg-[#1a1713] p-6 md:p-8">
					<h2 class="mb-2 font-mms-serif text-lg font-light text-mms-gold">Email notifications</h2>
					<p class="mb-6 text-[0.72rem] text-mms-muted">
						Preferences are saved in this browser until server sync is available for every channel.
					</p>
					<ul class="divide-y divide-mms-gold/10">
						<li class="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p class="text-sm font-medium text-mms-cream">New allocation drops</p>
								<p class="text-[0.72rem] text-mms-muted">Be first to know when limited releases go live.</p>
							</div>
							<Switch.Root
								id="notif-drops"
								class={notifSwitchRootClass}
								checked={notifs.drops}
								aria-label="New allocation drops email"
								onCheckedChange={(v) => setNotif('drops', v)}
							>
								<Switch.Thumb class={notifSwitchThumbClass} />
							</Switch.Root>
						</li>
						<li class="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p class="text-sm font-medium text-mms-cream">Order updates</p>
								<p class="text-[0.72rem] text-mms-muted">Shipping, delivery, and receipt confirmations.</p>
							</div>
							<Switch.Root
								id="notif-orders"
								class={notifSwitchRootClass}
								checked={notifs.orders}
								aria-label="Order updates email"
								onCheckedChange={(v) => setNotif('orders', v)}
							>
								<Switch.Thumb class={notifSwitchThumbClass} />
							</Switch.Root>
						</li>
						<li class="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p class="text-sm font-medium text-mms-cream">Weekly journal digest</p>
								<p class="text-[0.72rem] text-mms-muted">Stories, tastings, and editorial from Rosvelte.</p>
							</div>
							<Switch.Root
								id="notif-digest"
								class={notifSwitchRootClass}
								checked={notifs.digest}
								aria-label="Weekly journal digest email"
								onCheckedChange={(v) => setNotif('digest', v)}
							>
								<Switch.Thumb class={notifSwitchThumbClass} />
							</Switch.Root>
						</li>
						<li class="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p class="text-sm font-medium text-mms-cream">Wishlist back in stock</p>
								<p class="text-[0.72rem] text-mms-muted">When a saved bottle returns to the cellar.</p>
							</div>
							<Switch.Root
								id="notif-wishlist"
								class={notifSwitchRootClass}
								checked={notifs.wishlist}
								aria-label="Wishlist back in stock email"
								onCheckedChange={(v) => setNotif('wishlist', v)}
							>
								<Switch.Thumb class={notifSwitchThumbClass} />
							</Switch.Root>
						</li>
						<li class="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<p class="text-sm font-medium text-mms-cream">Event invitations</p>
								<p class="text-[0.72rem] text-mms-muted">Private tastings and member experiences.</p>
							</div>
							<Switch.Root
								id="notif-events"
								class={notifSwitchRootClass}
								checked={notifs.events}
								aria-label="Event invitations email"
								onCheckedChange={(v) => setNotif('events', v)}
							>
								<Switch.Thumb class={notifSwitchThumbClass} />
							</Switch.Root>
						</li>
					</ul>
				</section>

				<!-- Change password -->
				<section class="border border-mms-gold/10 bg-[#1a1713] p-6 md:p-8">
					<h2 class="mb-6 font-mms-serif text-lg font-light text-mms-gold">Change password</h2>
					{#if form?.passwordMessage}
						<p class="mb-4 text-[0.8rem] text-red-400/95">{form.passwordMessage}</p>
					{/if}
					{#if form?.passwordOk}
						<p class="mb-4 text-[0.8rem] text-emerald-400/90">Password updated.</p>
					{/if}
					<form
						method="post"
						action="?/changeCustomerPassword"
						use:enhance={() =>
							async ({ result, update }) => {
								await update({ reset: false });
								if (result.type === 'success') {
									pwCurrent = '';
									pwNew = '';
									pwConfirm = '';
								}
							}}
					>
						<div class="grid grid-cols-1 gap-5 md:grid-cols-2">
							<div class="md:col-span-2">
								<label class={labelClass} for="pw-current">Current password</label>
								<input
									id="pw-current"
									name="currentPassword"
									class={inputClass}
									type="password"
									autocomplete="current-password"
									bind:value={pwCurrent}
								/>
							</div>
							<div>
								<label class={labelClass} for="pw-new">New password</label>
								<input
									id="pw-new"
									name="newPassword"
									class={inputClass}
									type="password"
									autocomplete="new-password"
									placeholder="Min. 8 characters"
									bind:value={pwNew}
								/>
							</div>
							<div>
								<label class={labelClass} for="pw-confirm">Confirm new password</label>
								<input
									id="pw-confirm"
									name="confirmPassword"
									class={inputClass}
									type="password"
									autocomplete="new-password"
									bind:value={pwConfirm}
								/>
							</div>
						</div>
						<div class="mt-8 flex flex-wrap items-center justify-between gap-4">
							<a
								href={resolve('/account/forgot-password')}
								class="text-[0.65rem] uppercase tracking-[0.15em] text-mms-gold-dim underline-offset-4 hover:text-mms-gold"
							>
								Forgot password?
							</a>
							<button
								type="submit"
								class="border border-mms-gold bg-mms-gold px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.18em] text-mms-ink transition hover:bg-mms-gold-light"
							>
								Update password
							</button>
						</div>
					</form>
				</section>
			</div>
		{/if}
	</div>
</div>
