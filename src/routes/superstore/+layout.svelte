<script lang="ts">
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import SuperstoreSidebar from '$lib/components/superstore/SuperstoreSidebar.svelte';
	import SuperstoreAdminTopbar from '$lib/components/superstore/SuperstoreAdminTopbar.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import { syncDocumentFavicon } from '$lib/client/sync-document-favicon';
	import { storeFavicon } from '$lib/store/mms-store-settings';

	let { data, children } = $props();

	let sidebarOpen = $state(false);

	const pageHeading = $derived.by(() => {
		const p = page.url.pathname;
		const pairs: [string, string][] = [
			['/superstore/products/new', 'Add Product'],
			['/superstore/orders', 'Orders'],
			['/superstore/products', 'Products'],
			['/superstore/customers', 'Customers'],
			['/superstore/inventory', 'Inventory'],
			['/superstore/analytics', 'Analytics'],
			['/superstore/journal', 'Journal Posts'],
			['/superstore/settings', 'Settings'],
			['/superstore/tasks', 'Tasks'],
			['/superstore/uploads', 'Uploads']
		];
		for (const [prefix, title] of pairs) {
			if (p.includes(prefix)) return title;
		}
		return 'Dashboard';
	});

	const defaultFaviconHref = favicon satisfies string;

	$effect(() => {
		if (!browser) return;

		return storeFavicon.subscribe((custom) => {
			syncDocumentFavicon(custom ?? defaultFaviconHref);
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={$storeFavicon ?? defaultFaviconHref} />
</svelte:head>

{#if data.guestMode}
	<div class="min-h-screen bg-mms-cream font-mms-sans text-mms-ink">
		{@render children()}
	</div>
{:else}
	<div class="min-h-screen bg-mms-ink font-mms-sans text-mms-cream">
		<SuperstoreSidebar bind:open={sidebarOpen} user={data.user} />
		<div class="flex min-h-screen flex-col lg:ml-[220px]">
			<SuperstoreAdminTopbar title={pageHeading} onOpenMenu={() => (sidebarOpen = true)} />
			<main class="flex-1 overflow-x-hidden px-4 py-6 md:px-8 md:py-8">
				{@render children()}
			</main>
		</div>
	</div>
{/if}
