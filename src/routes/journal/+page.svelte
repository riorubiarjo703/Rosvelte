<script lang="ts">
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { onMount, tick, untrack } from 'svelte';
	import type { PageData } from './$types';
	import { mmsReveal, mmsRevealShort } from '$lib/mms-tailwind';
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';
	import MmsSiteNewsletter from '$lib/components/site/MmsSiteNewsletter.svelte';
	import MmsJournalArticleArt from '$lib/components/journal/MmsJournalArticleArt.svelte';
	import {
		formatFeaturedTitle,
		journalBgForCat,
		JOURNAL_CATEGORY_TABS,
		JOURNAL_MARQUEE_ITEMS,
		JOURNAL_TOPIC_TAGS,
		mmsJournal,
		type JournalArticle,
		type JournalCat
	} from '$lib/data/mms-journal';
	import { mmsJournalHref, mmsParseJournalChannel, mmsParseJournalTopic } from '$lib/data/mms-site-nav';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	const currentCat = $derived(mmsParseJournalChannel(page.url.searchParams));
	const activeTopic = $derived(mmsParseJournalTopic(page.url.searchParams));
	let isListView = $state(false);
	let activePage = $state(1);
	let io = $state<IntersectionObserver | undefined>(undefined);

	const featuredParts = $derived(formatFeaturedTitle(data.featured.title));

	function setJournalChannel(cat: JournalCat) {
		goto(mmsJournalHref(resolve('/journal'), { channel: cat, topic: activeTopic }), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	function setJournalTopic(tag: string | null) {
		goto(mmsJournalHref(resolve('/journal'), { channel: currentCat, topic: tag }), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	const filtered = $derived.by(() => {
		let list = currentCat === 'all' ? [...data.articles] : data.articles.filter((a) => a.cat === currentCat);
		if (activeTopic) {
			list = list.filter((a) =>
				a.tags.some((t) => t.toLowerCase() === activeTopic.toLowerCase())
			);
		}
		return list;
	});

	const cardDelays = ['delay-75', 'delay-100', 'delay-150', 'delay-200'];

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
				.querySelectorAll(
					'.journal-page .page-hero .reveal, .journal-page .featured-journal .reveal, .journal-page .journal-pagination.reveal'
				)
				.forEach((el) => el.classList.add('visible'));
		}, 100);

		tick().then(() => {
			document.querySelectorAll('.journal-page .mms-site-newsletter .reveal').forEach((el) => {
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
		void currentCat;
		void isListView;
		const observer = io;
		if (!observer) return;

		tick().then(() => {
			untrack(() => {
				document.querySelectorAll('.journal-page .journal-articles .reveal').forEach((el) => {
					el.classList.remove('visible');
					observer.observe(el);
				});
			});
		});
	});

	function artSize(a: JournalArticle, i: number, list: boolean): number {
		if (list) return 40;
		if (a.wide && i === 0) return 80;
		return 55;
	}
</script>

<svelte:head>
	<title>The Journal — MMS</title>
	<meta
		name="description"
		content="Dispatches from distilleries, tasting notes, collector guides, and histories behind fine spirits."
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="journal-page min-h-dvh overflow-x-hidden bg-mms-ink font-mms-sans text-mms-cream antialiased"
>
	<MmsSiteHeader />

	<section
		class="page-hero relative overflow-hidden border-b border-mms-gold/10 px-6 pb-12 pt-28 md:px-16 md:pb-20 md:pt-36"
	>
		<p
			class="pointer-events-none absolute -right-[1%] bottom-[-8%] whitespace-nowrap font-mms-logo text-[17vw] leading-none tracking-[0.05em] text-mms-gold/[0.03]"
			aria-hidden="true"
		>
			JOURNAL
		</p>
		<div class="relative z-[1] grid items-end gap-8 md:grid-cols-2 md:gap-16">
			<div class={mmsReveal}>
				<p
					class="mb-6 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.35em] text-mms-gold before:block before:h-px before:w-10 before:bg-mms-gold"
				>
					MMS Editorial
				</p>
				<h1 class="font-mms-display text-[clamp(3rem,5vw,5rem)] font-light leading-[0.95] text-mms-cream">
					Stories from<br />the World of <em class="italic text-mms-gold-light">Spirits</em>
				</h1>
			</div>
			<div class={`${mmsReveal} delay-100`}>
				<p class="mb-8 max-w-md text-[0.85rem] font-light leading-[1.9] text-mms-muted">
					Dispatches from distilleries, tasting notes from our curators, guides for the discerning drinker, and the
					untold histories behind the world's finest bottles.
				</p>
				<form
					class="flex overflow-hidden border border-mms-gold/20"
					onsubmit={(e) => {
						e.preventDefault();
					}}
				>
					<label class="sr-only" for="journal-search">Search articles</label>
					<input
						id="journal-search"
						class="min-h-12 flex-1 border-0 bg-transparent px-4 py-3.5 font-mms-sans text-[0.8rem] text-mms-cream placeholder:text-mms-muted focus:outline-none focus:ring-1 focus:ring-mms-gold md:px-5"
						type="search"
						placeholder="Search articles, origins, brands..."
						bind:value={searchQuery}
					/>
					<button
						type="submit"
						class="shrink-0 bg-mms-gold px-4 py-3.5 font-mms-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-mms-ink transition hover:bg-mms-gold-light md:px-6"
						>Search</button>
				</form>
			</div>
		</div>
	</section>

	<div class="overflow-hidden border-y border-mms-gold/10 bg-mms-gold/[0.06] py-2">
		<div
			class="flex w-max animate-mms-marquee gap-12 font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold-dim"
		>
			{#each [...JOURNAL_MARQUEE_ITEMS, ...JOURNAL_MARQUEE_ITEMS] as item, i (i)}
				<span class="flex shrink-0 items-center gap-12 whitespace-nowrap after:text-[0.4rem] after:content-['◆']"
					>{item}</span>
			{/each}
		</div>
	</div>

	<section class="featured-journal px-6 py-8 md:px-16 md:py-16">
		<p
			class={`featured-label mb-8 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.3em] text-mms-gold before:block before:h-px before:w-6 before:bg-mms-gold ${mmsReveal}`}
		>
			Featured Article
		</p>
		<div
			class={`group relative grid cursor-pointer grid-cols-1 overflow-hidden bg-mms-ink2 transition-colors hover:bg-mms-ink3 md:grid-cols-2 ${mmsReveal}`}
		>
			<div
				class="pointer-events-none absolute inset-x-0 top-0 z-[2] h-0.5 origin-left scale-x-0 bg-mms-gold transition-transform duration-500 group-hover:scale-x-100"
			></div>
			<div class="relative min-h-[260px] overflow-hidden md:min-h-[480px]">
				<div
					class="absolute inset-0 flex items-center justify-center"
					style:background-color={journalBgForCat(data.featured.cat)}
				>
					<MmsJournalArticleArt cat={data.featured.cat} size={90} />
				</div>
				<div class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-mms-ink/20"></div>
			</div>
			<div class="relative flex flex-col justify-center p-8 md:p-14">
				<span
					class="mb-6 inline-block self-start border border-mms-gold/30 px-3 py-1 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold"
					>{data.featured.catLabel}</span>
				{#if featuredParts}
					<h2 class="font-mms-display mb-5 text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-[1.05] text-mms-cream">
						{featuredParts.before}<br /><em class="italic text-mms-gold-light">{featuredParts.em}</em>{featuredParts.after}
					</h2>
				{:else}
					<h2 class="font-mms-display mb-5 text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-[1.05] text-mms-cream">
						{data.featured.title}
					</h2>
				{/if}
				<p class="mb-8 text-[0.82rem] font-light leading-[1.85] text-mms-muted">{data.featured.excerpt}</p>
				<div class="mb-8 flex flex-wrap items-center gap-6">
					<div class="flex items-center gap-3">
						<div
							class="flex size-8 items-center justify-center rounded-full border border-mms-gold/30 bg-mms-gold/15 text-[0.65rem] font-medium tracking-wide text-mms-gold"
						>
							{data.featured.initials}
						</div>
						<span class="text-[0.72rem] text-mms-cream">{data.featured.author}</span>
					</div>
					<span class="text-[0.68rem] tracking-wide text-mms-muted">{data.featured.date}</span>
					<span class="border-l border-mms-gold/15 pl-6 text-[0.68rem] text-mms-muted"
						>{data.featured.read} read</span>
				</div>
				<button
					type="button"
					class="flex cursor-pointer items-center gap-2 self-start border-none bg-transparent p-0 text-left font-mms-sans text-[0.7rem] uppercase tracking-[0.2em] text-mms-gold transition-[gap] duration-200 hover:gap-3"
					>Read Article →</button>
			</div>
		</div>
	</section>

	<div class="px-6 md:px-16">
		<div
			class="flex gap-0 overflow-x-auto border-b border-mms-gold/10 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
		>
			{#each JOURNAL_CATEGORY_TABS as tab (tab.id)}
				<button
					type="button"
					class="shrink-0 border-b-2 border-transparent bg-transparent px-5 py-4 font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] text-mms-muted transition hover:text-mms-gold md:px-7"
					class:border-mms-gold={currentCat === tab.id}
					class:text-mms-gold={currentCat === tab.id}
					onclick={() => setJournalChannel(tab.id)}
				>
					{tab.label}
				</button>
			{/each}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 px-6 py-8 align-start lg:grid-cols-[1fr_300px] lg:gap-12 lg:px-16 lg:py-10">
		<div>
			<div class="mb-6 flex flex-wrap items-center justify-between gap-4">
				<span class="text-[0.72rem] text-mms-muted">
					Showing {filtered.length} article{filtered.length !== 1 ? 's' : ''}
				</span>
				<div class="flex gap-px">
					<button
						type="button"
						class="flex size-8 items-center justify-center border border-mms-gold/20 bg-transparent text-mms-muted transition hover:border-mms-gold [&_svg]:size-[13px] [&_svg]:fill-current"
						class:border-mms-gold={!isListView}
						class:text-mms-gold={!isListView}
						onclick={() => (isListView = false)}
						title="Grid view"
						aria-pressed={!isListView}
					>
						<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
							<rect x="0" y="0" width="6" height="6" /><rect x="8" y="0" width="6" height="6" /><rect
								x="0"
								y="8"
								width="6"
								height="6"
							/><rect x="8" y="8" width="6" height="6" />
						</svg>
					</button>
					<button
						type="button"
						class="flex size-8 items-center justify-center border border-mms-gold/20 bg-transparent text-mms-muted transition hover:border-mms-gold [&_svg]:size-[13px] [&_svg]:fill-current"
						class:border-mms-gold={isListView}
						class:text-mms-gold={isListView}
						onclick={() => (isListView = true)}
						title="List view"
						aria-pressed={isListView}
					>
						<svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
							<rect x="0" y="0" width="14" height="2" /><rect x="0" y="5" width="14" height="2" /><rect
								x="0"
								y="10"
								width="14"
								height="2"
							/>
						</svg>
					</button>
				</div>
			</div>

			<div id="journal-articles" class="journal-articles">
				{#if isListView}
					<div class="flex flex-col gap-px bg-mms-gold/10">
						{#each filtered as a (a.id)}
							<div
								class="group relative grid cursor-pointer grid-cols-[90px_1fr] bg-mms-ink2 transition-colors hover:bg-mms-ink3 sm:grid-cols-[120px_1fr] {mmsRevealShort}"
							>
								<div
									class="pointer-events-none absolute bottom-0 left-0 top-0 w-px origin-top scale-y-0 bg-mms-gold transition-transform group-hover:scale-y-100"
								></div>
								<div class="relative overflow-hidden bg-mms-ink3">
									<div
										class="absolute inset-0 flex items-center justify-center"
										style:background-color={journalBgForCat(a.cat)}
									>
										<MmsJournalArticleArt cat={a.cat} size={40} />
									</div>
								</div>
								<div class="flex flex-col justify-between gap-2 px-4 py-3.5 sm:px-6 sm:py-4">
									<div>
										<span
											class="mb-2 inline-block border border-mms-gold/20 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.2em] text-mms-gold-dim"
											>{a.catLabel}</span>
										<p class="font-mms-display text-lg font-normal leading-tight text-mms-cream">{a.title}</p>
									</div>
									<div class="flex flex-wrap gap-4 text-[0.65rem] text-mms-muted">
										<span>{a.author}</span>
										<span>{a.date}</span>
										<span>{a.read} read</span>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="mb-12 grid grid-cols-1 gap-px bg-mms-gold/10 sm:grid-cols-2">
						{#each filtered as a, i (a.id)}
							<div
								class="group relative flex cursor-pointer flex-col overflow-hidden bg-mms-ink2 transition-colors hover:bg-mms-ink3 {a.wide && i === 0
									? 'sm:col-span-2'
									: ''} {mmsRevealShort} {cardDelays[i % cardDelays.length] ?? ''}"
							>
								<div
									class="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-mms-gold transition-transform group-hover:scale-x-100"
								></div>
								<div class="grid h-full grid-cols-1 {a.wide && i === 0 ? 'md:grid-cols-[1.2fr_1fr]' : ''}">
									<div
										class="relative overflow-hidden bg-mms-ink3 {a.wide && i === 0
											? 'min-h-[200px] md:min-h-[280px]'
											: 'h-[200px]'}"
									>
										<div
											class="absolute inset-0 flex items-center justify-center"
											style:background-color={journalBgForCat(a.cat)}
										>
											<MmsJournalArticleArt cat={a.cat} size={artSize(a, i, false)} />
										</div>
									</div>
									<div class="flex flex-col p-7 {a.wide && i === 0 ? 'md:justify-center md:p-9' : ''}">
										<span
											class="mb-4 inline-block self-start border border-mms-gold/25 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.22em] text-mms-gold-dim"
											>{a.catLabel}</span>
										<h3
											class="font-mms-display mb-3 font-normal leading-snug text-mms-cream {a.wide && i === 0
												? 'text-[1.7rem]'
												: 'text-xl'}"
										>
											{a.title}
										</h3>
										{#if a.wide && i === 0}
											<p class="mb-5 text-[0.75rem] font-light leading-relaxed text-mms-muted">{a.excerpt}</p>
										{/if}
										<div class="mt-auto flex items-end justify-between gap-4 pt-2">
											<span class="text-[0.68rem] text-mms-muted">{a.author}</span>
											<div class="flex gap-3 text-[0.63rem] tracking-wide text-mms-muted">
												<span>{a.date}</span>
												<span>{a.read}</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>

			<div
				class={`journal-pagination mt-10 flex border border-mms-gold/15 ${mmsReveal}`}
			>
				{#each [1, 2, 3] as n (n)}
					<button
						type="button"
						class="min-h-[42px] min-w-[42px] border-r border-mms-gold/10 bg-transparent font-mms-sans text-[0.75rem] text-mms-muted transition last:border-r-0 hover:bg-mms-gold hover:text-mms-ink"
						class:bg-mms-gold={activePage === n}
						class:text-mms-ink={activePage === n}
						onclick={() => (activePage = n)}>{n}</button>
				{/each}
				<button
					type="button"
					class="min-h-[42px] border-none bg-transparent px-5 font-mms-sans text-[0.65rem] uppercase tracking-[0.1em] text-mms-muted transition hover:bg-mms-gold hover:text-mms-ink"
					>Next →</button>
			</div>
		</div>

		<aside
			class="top-[6.25rem] max-lg:grid max-lg:grid-cols-2 max-lg:gap-px max-sm:grid-cols-1 lg:sticky"
		>
			<div class="mb-px bg-mms-ink2 p-7 max-lg:last:col-span-2">
				<p class="mb-5 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">
					<span class="shrink-0">Popular This Month</span>
					<span class="h-px flex-1 bg-mms-gold/12"></span>
				</p>
				{#each mmsJournal.popular as p, i (p.title)}
					<div
						class="flex cursor-pointer gap-4 border-b border-mms-gold/[0.06] py-3.5 transition-opacity last:border-b-0 hover:opacity-80"
					>
						<span class="font-mms-logo min-w-7 pt-0.5 text-2xl leading-none text-mms-gold/[0.15]"
							>0{i + 1}</span>
						<div>
							<p class="mb-1 text-[0.8rem] leading-snug text-mms-cream">{p.title}</p>
							<p class="text-[0.62rem] tracking-wide text-mms-muted">{p.cat} · {p.date}</p>
						</div>
					</div>
				{/each}
			</div>

			<div class="mb-px bg-mms-ink2 p-7 max-lg:last:col-span-2">
				<p class="mb-5 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">
					<span class="shrink-0">Browse by Topic</span>
					<span class="h-px flex-1 bg-mms-gold/12"></span>
				</p>
				<div class="flex flex-wrap gap-2">
					{#each JOURNAL_TOPIC_TAGS as tag (tag)}
						<button
							type="button"
							class="cursor-pointer border border-mms-gold/18 px-3 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-mms-muted transition hover:border-mms-gold hover:text-mms-gold"
							class:border-mms-gold={activeTopic === tag}
							class:text-mms-gold={activeTopic === tag}
							onclick={() => setJournalTopic(activeTopic === tag ? null : tag)}
						>
							{tag}
						</button>
					{/each}
				</div>
			</div>

			<div class="mb-px bg-mms-ink2 p-7 max-lg:last:col-span-2">
				<p class="mb-5 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">
					<span class="shrink-0">Journal Updates</span>
					<span class="h-px flex-1 bg-mms-gold/12"></span>
				</p>
				<form onsubmit={(e) => e.preventDefault()}>
					<label class="sr-only" for="sb-nl-email">Email for journal updates</label>
					<input
						id="sb-nl-email"
						class="mb-2 w-full border border-mms-gold/20 bg-transparent px-4 py-3 font-mms-sans text-[0.78rem] text-mms-cream placeholder:text-mms-muted focus:outline-none focus:ring-1 focus:ring-mms-gold"
						type="email"
						autocomplete="email"
						placeholder="Your email address"
					/>
					<button
						type="submit"
						class="w-full border-none bg-mms-gold py-3 font-mms-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-mms-ink transition hover:bg-mms-gold-light"
						>Subscribe</button>
				</form>
				<p class="mt-2.5 text-[0.68rem] leading-relaxed text-mms-muted">New articles every Tuesday. No spam, ever.</p>
			</div>

			<div class="bg-mms-ink2 p-0 max-lg:col-span-2">
				<p class="flex items-center gap-2 px-7 pb-3 pt-7 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">
					<span class="shrink-0">Editor's Picks</span>
					<span class="h-px flex-1 bg-mms-gold/12"></span>
				</p>
				{#each mmsJournal.editorsPicks as ep (ep.title)}
					<div
						class="cursor-pointer border-t border-mms-gold/[0.06] bg-mms-ink3 px-5 py-4 transition-opacity hover:opacity-80"
					>
						<p class="mb-2 text-[0.55rem] uppercase tracking-[0.2em] text-mms-gold-dim">{ep.label}</p>
						<p class="font-mms-display mb-1 text-base font-normal leading-snug text-mms-cream">{ep.title}</p>
						<p class="text-[0.63rem] text-mms-muted">{ep.meta}</p>
					</div>
				{/each}
			</div>
		</aside>
	</div>

	<MmsSiteNewsletter id="journal-nl" />

	<MmsSiteFooter />
</div>
