<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/state';
	import { locales, localizeHref } from '$lib/paraglide/runtime';
	import { resolvedPath } from '$lib/paraglide-resolved-href';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { syncDocumentFavicon } from '$lib/client/sync-document-favicon';
	import { storeFavicon } from '$lib/store/mms-store-settings';
	import MmsAddedToCartModal from '$lib/components/cart/MmsAddedToCartModal.svelte';
	import MmsWishlistToast from '$lib/components/cart/MmsWishlistToast.svelte';
import MmsSiteCursor from '$lib/components/site/MmsSiteCursor.svelte';

	let { children } = $props();

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
{@render children()}
<MmsSiteCursor />

<MmsAddedToCartModal />
<MmsWishlistToast />

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolvedPath(localizeHref(page.url.pathname, { locale }) as string)}>{locale}</a>
	{/each}
</div>
