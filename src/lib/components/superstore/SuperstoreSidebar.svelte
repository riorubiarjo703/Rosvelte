<script lang="ts">
	import type { Pathname } from '$app/types';
	import { page } from '$app/state';
	import { resolvedLocalizedHref } from '$lib/paraglide/resolved-href';
	import type { User } from 'better-auth/types';
	import { DEMO_KPIS } from '$lib/superstore/mms-admin-demo-data';
	import { storeHeaderLogo } from '$lib/store/mms-store-settings';

	let {
		open = $bindable(false),
		user
	}: {
		open?: boolean;
		user: User;
	} = $props();

	function hrefFor(path: Pathname) {
		return resolvedLocalizedHref(path);
	}

	function pathActive(path: Pathname): boolean {
		const h = hrefFor(path);
		const p = page.url.pathname;
		if (path === '/superstore') return p === h || p.endsWith('/superstore');
		return p === h || p.startsWith(h + '/');
	}

	function activeProducts(): boolean {
		const p = page.url.pathname;
		return p.includes('/superstore/products') && !p.includes('/products/new');
	}

	function activeAddProduct(): boolean {
		return page.url.pathname.includes('/superstore/products/new');
	}

	function initials(): string {
		const name = user.name?.trim();
		if (name) {
			const parts = name.split(/\s+/).filter(Boolean);
			return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase().slice(0, 2);
		}
		const email = user.email ?? '?';
		const local = email.split('@')[0] ?? '?';
		return local.slice(0, 2).toUpperCase();
	}

	function displayName(): string {
		return user.name?.trim() || user.email?.split('@')[0] || 'Staff';
	}
</script>

{#if open}
	<button
		type="button"
		class="fixed inset-0 z-40 bg-black/50 lg:hidden"
		aria-label="Close menu"
		onclick={() => (open = false)}
	></button>
{/if}

<aside
	class="fixed top-0 left-0 z-50 flex h-full w-[220px] flex-col border-r border-mms-gold/10 bg-mms-ink2 transition-transform duration-300 lg:translate-x-0 {open
		? 'translate-x-0'
		: '-translate-x-full lg:translate-x-0'}"
	aria-label="MMS Admin navigation"
>
	<div class="border-b border-mms-gold/10 px-5 pb-4 pt-6 flex items-center gap-2">
		{#if $storeHeaderLogo}
			<img src={$storeHeaderLogo} alt="RoSvelte" class="max-h-8 w-auto max-w-[9rem] object-contain" />
		{:else}
			<svg width="30px" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0)"><path d="M35.8 13H32L21 32L9.8 13H6" stroke="#c9a84c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path><path d="M25.7509 25.5961C31.3517 28.7465 38.446 26.7601 41.5964 21.1593C44.7469 15.5585 42.7605 8.46426 37.1597 5.31381C31.5589 2.16336 24.4646 4.14976 21.3142 9.75056" stroke="#c9a84c" stroke-width="4" stroke-linecap="round"></path><path d="M26 44H16" stroke="#c9a84c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path><path d="M21 44L21 32" stroke="#c9a84c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path><path d="M12 16C12 16 14 14 17 14C20 14 22 17 25 17C28 17 30 16 30 16" stroke="#c9a84c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path></g><defs><clipPath id="clip0"><rect width="48" height="48" fill="white"></rect></clipPath></defs></svg>
			<span class="mt-1 block text-[0.55rem] tracking-[0.2em] text-mms-muted uppercase">RoSvelte</span>
		{/if}
	</div>

	<nav class="flex-1 overflow-y-auto py-4">
		<p class="px-5 pb-2 pt-2 text-[0.52rem] tracking-[0.22em] text-mms-muted uppercase">Main</p>
		<a
			href={hrefFor('/superstore')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {pathActive('/superstore')
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
			</svg>
			Dashboard
		</a>
		<a
			href={hrefFor('/superstore/orders')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {pathActive('/superstore/orders')
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
			Orders
			<span class="ml-auto rounded-full bg-[#E05252] px-2 py-px text-[0.52rem] font-medium text-white"
				>{DEMO_KPIS.badgeOrders}</span
			>
		</a>
		<a
			href={hrefFor('/superstore/products')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {activeProducts()
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
			</svg>
			Products
		</a>
		<a
			href={hrefFor('/superstore/products/new')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {activeAddProduct()
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
			</svg>
			Add Product
		</a>

		<p class="px-5 pb-2 pt-5 text-[0.52rem] tracking-[0.22em] text-[#4a4238] uppercase">Store</p>
		<a
			href={hrefFor('/superstore/customers')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {pathActive('/superstore/customers')
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
			</svg>
			Customers
		</a>
		<a
			href={hrefFor('/superstore/inventory')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {pathActive('/superstore/inventory')
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M3 3h18v18H3zM3 9h18M9 21V9" />
			</svg>
			Inventory
			<span class="ml-auto rounded-full bg-[#E05252] px-2 py-px text-[0.52rem] font-medium text-white"
				>{DEMO_KPIS.badgeInventory}</span
			>
		</a>
		<a
			href={hrefFor('/superstore/analytics')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {pathActive('/superstore/analytics')
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
			</svg>
			Analytics
		</a>

		<p class="px-5 pb-2 pt-5 text-[0.52rem] tracking-[0.22em] text-[#4a4238] uppercase">Content</p>
		<a
			href={hrefFor('/superstore/journal')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {pathActive('/superstore/journal')
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
			</svg>
			Journal Posts
		</a>
		<a
			href={hrefFor('/superstore/settings')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {pathActive('/superstore/settings')
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
			</svg>
			Settings
		</a>

		<p class="px-5 pb-2 pt-5 text-[0.52rem] tracking-[0.22em] text-mms-muted uppercase">Tools</p>
		<a
			href={hrefFor('/superstore/tasks')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {pathActive('/superstore/tasks')
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
			</svg>
			Tasks
		</a>
		<a
			href={hrefFor('/superstore/uploads')}
			class="flex items-center gap-3 border-l-2 py-2.5 pr-5 pl-[calc(1.25rem-2px)] text-[0.72rem] transition-colors {pathActive('/superstore/uploads')
				? 'border-mms-gold bg-mms-gold/[0.08] text-mms-gold'
				: 'border-transparent text-mms-muted hover:bg-mms-gold/[0.06] hover:text-mms-cream'}"
			onclick={() => (open = false)}
		>
			<svg class="size-[15px] shrink-0 opacity-70" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
			</svg>
			Uploads
		</a>
	</nav>

	<div class="border-t border-mms-gold/10 p-4">
		<div class="flex cursor-default items-center gap-3 rounded-md p-2">
			<div
				class="flex size-8 shrink-0 items-center justify-center rounded-full border border-mms-gold/30 bg-mms-gold/15 text-[0.65rem] font-medium text-mms-gold"
			>
				{initials()}
			</div>
			<div class="min-w-0">
				<span class="block truncate text-[0.72rem] text-mms-cream">{displayName()}</span>
				<span class="block truncate text-[0.6rem] text-mms-muted">Staff</span>
			</div>
		</div>
	</div>
</aside>
