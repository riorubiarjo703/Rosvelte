<script lang="ts">
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';
	import MmsAboutPage from '$lib/components/about/MmsAboutPage.svelte';
</script>

<svelte:head>
	<title>About MMS — Maison de spiritueux</title>
	<meta
		name="description"
		content="Maison de Spiritueux — our story, curators, and principles. Sourcing the world's finest spirits since 1998."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="mms-site min-h-dvh overflow-x-hidden bg-mms-ink font-mms-sans text-mms-cream antialiased">
	<MmsSiteHeader />
	<main>
		<MmsAboutPage />
	</main>
	<MmsSiteFooter />
</div>
