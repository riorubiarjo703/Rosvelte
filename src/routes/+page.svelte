<script lang="ts">
	import { onMount } from 'svelte';
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import HomeHero from '$lib/components/home/HomeHero.svelte';
	import HomeStats from '$lib/components/home/HomeStats.svelte';
	import HomeMarquee from '$lib/components/home/HomeMarquee.svelte';
	import HomeCategories from '$lib/components/home/HomeCategories.svelte';
	import HomeFeatured from '$lib/components/home/HomeFeatured.svelte';
	import HomeExperience from '$lib/components/home/HomeExperience.svelte';
	import MmsSiteNewsletter from '$lib/components/site/MmsSiteNewsletter.svelte';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';

	onMount(() => {
		const root = document.querySelector<HTMLElement>('.mms-site');
		if (!root) return;

		const obs = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					(e.target as HTMLElement).classList.add('visible');
					obs.unobserve(e.target);
				}
			},
			{ threshold: 0.12 }
		);

		root.querySelectorAll<HTMLElement>('.reveal').forEach((el) => obs.observe(el));

		const t = window.setTimeout(() => {
			root.querySelectorAll<HTMLElement>('.hero .reveal').forEach((el) => el.classList.add('visible'));
		}, 100);

		return () => {
			window.clearTimeout(t);
			obs.disconnect();
		};
	});
</script>

<svelte:head>
	<title>RoSvelte — Maison de spiritueux</title>
	<meta
		name="description"
		content="Curated spirits, rare allocations, and tastings—where origin becomes excellence."
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
		<HomeHero />
		<HomeStats />
		<HomeMarquee />
		<HomeCategories />
		<HomeFeatured />
		<HomeExperience />
		<MmsSiteNewsletter />
	</main>
	<MmsSiteFooter />
</div>
