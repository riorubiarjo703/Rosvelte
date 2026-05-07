<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount, tick, untrack } from 'svelte';
	import { mmsReveal } from '$lib/mms-tailwind';
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';
	import MmsSiteNewsletter from '$lib/components/site/MmsSiteNewsletter.svelte';
	import MmsOriginsWorldMap from '$lib/components/origins/MmsOriginsWorldMap.svelte';
	import MmsOriginsPanel from '$lib/components/origins/MmsOriginsPanel.svelte';
	import { MMS_ORIGIN_TAB_ORDER, originTabLabel, type OriginKey } from '$lib/data/mms-origins';
	import { mmsOriginsHref, mmsParseOriginKey } from '$lib/data/mms-site-nav';

	const selectedOrigin = $derived(mmsParseOriginKey(page.url.searchParams));
	let io = $state<IntersectionObserver | undefined>(undefined);
	let tabsEl = $state<HTMLDivElement | undefined>();

	function pickOrigin(key: OriginKey) {
		goto(mmsOriginsHref(resolve('/origins'), key), { replaceState: true, noScroll: true, keepFocus: true });
		tick().then(() => {
			tabsEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}

	onMount(() => {
		io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					(e.target as HTMLElement).classList.add('visible');
					io?.unobserve(e.target);
				}
			},
			{ threshold: 0.07 }
		);

		const t = window.setTimeout(() => {
			document
				.querySelectorAll('.origins-page .page-hero .reveal, .origins-page .map-section .reveal')
				.forEach((el) => el.classList.add('visible'));
		}, 100);

		tick().then(() => {
			document.querySelectorAll('.origins-page .mms-site-newsletter .reveal').forEach((el) => {
				io?.observe(el);
			});
		});

		return () => {
			window.clearTimeout(t);
			io?.disconnect();
		};
	});

	$effect(() => {
		if (!browser) return;
		void io;
		void selectedOrigin;
		const observer = io;
		if (!observer) return;

		tick().then(() => {
			untrack(() => {
				document.querySelectorAll('.origins-page .origin-panel .reveal').forEach((el) => {
					el.classList.remove('visible');
					observer.observe(el);
				});
			});
		});
	});
</script>

<svelte:head>
	<title>Origins — MMS</title>
	<meta
		name="description"
		content="Explore provenance and terroir — where MMS spirits are born, from Scotland to the Caribbean."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="origins-page min-h-dvh overflow-x-hidden bg-mms-ink font-mms-sans text-mms-cream antialiased"
>
	<MmsSiteHeader />

	<section
		class="page-hero relative overflow-hidden border-b border-mms-gold/10 px-6 pb-12 pt-28 md:px-16 md:pb-20 md:pt-36"
	>
		<p
			class="pointer-events-none absolute -right-[1%] bottom-[-8%] whitespace-nowrap font-mms-logo text-[18vw] leading-none tracking-[0.05em] text-mms-gold/[0.03]"
			aria-hidden="true"
		>
			ORIGINS
		</p>
		<div class="relative z-[1] grid items-end gap-8 md:grid-cols-2 md:gap-16">
			<div class={mmsReveal}>
				<p
					class="mb-6 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.35em] text-mms-gold before:block before:h-px before:w-10 before:bg-mms-gold"
				>
					Provenance & Terroir
				</p>
				<h1 class="font-mms-display text-[clamp(3rem,5vw,5rem)] font-light leading-[0.95] text-mms-cream">
					Spirits Born<br />from the <em class="italic text-mms-gold-light">Land</em>
				</h1>
			</div>
			<div class={`${mmsReveal} delay-100`}>
				<p class="mb-8 max-w-md text-[0.85rem] font-light leading-[1.9] text-mms-muted">
					Every great spirit carries the fingerprint of its birthplace — the water, the grain, the climate, the
					hands that shaped it. We source from 18 countries, each offering something irreplaceable.
				</p>
				<div class="flex gap-10 md:gap-12">
					<div class="text-center">
						<span class="font-mms-display block text-5xl font-light leading-none text-mms-gold">18</span>
						<span class="text-[0.6rem] uppercase tracking-[0.2em] text-mms-muted">Countries</span>
					</div>
					<div class="text-center">
						<span class="font-mms-display block text-5xl font-light leading-none text-mms-gold">47</span>
						<span class="text-[0.6rem] uppercase tracking-[0.2em] text-mms-muted">Regions</span>
					</div>
					<div class="text-center">
						<span class="font-mms-display block text-5xl font-light leading-none text-mms-gold">120+</span>
						<span class="text-[0.6rem] uppercase tracking-[0.2em] text-mms-muted">Distilleries</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<MmsOriginsWorldMap onPick={pickOrigin} />

	<div class="px-6 md:px-16">
		<div
			bind:this={tabsEl}
			id="origin-tabs"
			class="flex gap-0 overflow-x-auto border-b border-mms-gold/10 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			{#each MMS_ORIGIN_TAB_ORDER as key (key)}
				<button
					type="button"
					class="group flex shrink-0 items-center gap-2.5 border-b-2 border-transparent bg-transparent px-6 py-5 font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] text-mms-muted transition hover:text-mms-gold md:px-8"
					class:border-mms-gold={selectedOrigin === key}
					class:text-mms-gold={selectedOrigin === key}
					onclick={() => pickOrigin(key)}
				>
					<span
						class="size-1.5 shrink-0 rounded-full transition-colors {selectedOrigin === key
							? 'bg-mms-gold'
							: 'bg-mms-muted group-hover:bg-mms-gold'}"
					></span>
					{originTabLabel(key)}
				</button>
			{/each}
		</div>
	</div>

	{#key selectedOrigin}
		<div class="animate-[mms-fade-up_0.4s_ease-out]">
			<MmsOriginsPanel origin={selectedOrigin} />
		</div>
	{/key}

	<MmsSiteNewsletter id="origins-nl" />

	<MmsSiteFooter />
</div>
