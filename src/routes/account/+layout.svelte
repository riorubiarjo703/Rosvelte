<script lang="ts">
	import { page } from '$app/state';
	import { deLocalizeUrl } from '$lib/paraglide/runtime';
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';

	let { children } = $props();

	const dashboardHome = $derived(deLocalizeUrl(page.url).pathname.replace(/\/$/, '') === '/account');
	const wideAccountShell = $derived(
		dashboardHome || deLocalizeUrl(page.url).pathname.startsWith('/account/orders/')
	);
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="account-area min-h-dvh overflow-x-hidden bg-mms-ink font-mms-sans text-mms-cream antialiased"
>
	<MmsSiteHeader />
	<main
		class="w-full pb-12 pt-12 md:mx-auto md:pb-16 md:pt-12 {wideAccountShell
			? 'max-w-[1600px] px-0 md:px-6'
			: 'max-w-lg px-4 md:px-6'}"
	>
		{@render children()}
	</main>
	<MmsSiteFooter />
</div>
