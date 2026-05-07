<script lang="ts">
	import { resolve } from '$app/paths';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import MmsJournalArticleArt from '$lib/components/journal/MmsJournalArticleArt.svelte';
	import { journalBgForCat } from '$lib/data/mms-journal';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>{data.article.title} — The Journal</title>
	<meta name="description" content={data.article.excerpt} />
</svelte:head>

<div class="min-h-dvh overflow-x-hidden bg-mms-ink font-mms-sans text-mms-cream antialiased">
	<MmsSiteHeader />

	<main class="mx-auto w-full max-w-5xl px-6 pb-12 pt-12 md:px-10 md:pt-32">
		<nav
			class="mb-10 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.62rem] uppercase tracking-[0.15em] text-mms-muted"
			aria-label="Breadcrumb"
		>
			<a href={resolve('/')} class="transition hover:text-mms-gold">Home</a>
			<span class="text-mms-gold-dim">/</span>
			<a href={resolve('/journal')} class="transition hover:text-mms-gold">Journal</a>
			<span class="text-mms-gold-dim">/</span>
			<span class="text-mms-cream">{data.article.title}</span>
		</nav>

		<section class="overflow-hidden border border-mms-gold/15 bg-mms-ink2">
			<div class="grid grid-cols-1 md:grid-cols-[1.3fr_0.7fr]">
				<div class="p-8 md:p-12">
					<p class="mb-5 text-[0.62rem] uppercase tracking-[0.2em] text-mms-gold">{data.article.catLabel}</p>
					<h1 class="font-mms-display mb-6 text-[clamp(2rem,5vw,3.2rem)] font-light leading-[1.04] text-mms-cream">
						{data.article.title}
					</h1>
					<div class="mb-8 flex flex-wrap items-center gap-3 gap-y-2 text-[0.72rem] text-mms-muted">
						<span>{data.article.author}</span>
						<span>{data.article.date}</span>
						<span>{data.article.read} read</span>
						{#if data.source === 'db'}
							<span class="border border-mms-gold/25 px-2 py-0.5 text-[0.58rem] uppercase tracking-[0.14em] text-mms-gold-dim">
								Live
							</span>
						{/if}
					</div>
					<p class="text-[0.92rem] font-light leading-[1.95] text-mms-muted">{data.article.excerpt}</p>
				</div>
				<div class="relative min-h-[260px] overflow-hidden md:min-h-full">
					<div
						class="absolute inset-0 flex items-center justify-center"
						style:background-color={journalBgForCat(data.article.cat)}
					>
						<MmsJournalArticleArt cat={data.article.cat} size={96} />
					</div>
					<div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-mms-ink/45 to-transparent"></div>
				</div>
			</div>
		</section>

		<section class="mt-10 border border-mms-gold/10 bg-mms-ink2 p-8 md:p-10">
			<p class="mb-5 text-[0.62rem] uppercase tracking-[0.2em] text-mms-gold-dim">Article</p>
			<div class="space-y-6 text-[0.86rem] font-light leading-[2] text-mms-muted">
				<p>
					{data.article.excerpt} This editorial dispatch is part of the MMS Journal, where our team explores the
					craft, provenance, and collecting culture surrounding world-class spirits.
				</p>
				<p>
					From production decisions to regional identity, every bottle carries a story. We focus on practical
					context for collectors and curious drinkers alike, so each piece can be used as both reading and reference.
				</p>
				<p>
					For a deeper look, continue exploring related reads below and browse by category from the journal index.
				</p>
			</div>
			{#if data.article.tags.length > 0}
				<div class="mt-8 flex flex-wrap gap-2">
					{#each data.article.tags as tag (tag)}
						<span
							class="border border-mms-gold/20 px-3 py-1 text-[0.6rem] uppercase tracking-[0.14em] text-mms-gold-dim"
							>{tag}</span
						>
					{/each}
				</div>
			{/if}
		</section>

		{#if data.related.length > 0}
			<section class="mt-10">
				<div class="mb-5 flex items-center justify-between gap-4">
					<h2 class="font-mms-display text-[1.6rem] font-light text-mms-cream">Related Articles</h2>
					<a href={resolve('/journal')} class="text-[0.65rem] uppercase tracking-[0.16em] text-mms-gold transition hover:text-mms-gold-light">
						All Journal
					</a>
				</div>
				<div class="grid grid-cols-1 gap-px bg-mms-gold/10 md:grid-cols-3">
					{#each data.related as item (item.id)}
						<a href={resolve('/journal/[id]', { id: String(item.id) })} class="group bg-mms-ink2 p-6 transition-colors hover:bg-mms-ink3">
							<p class="mb-3 text-[0.58rem] uppercase tracking-[0.2em] text-mms-gold-dim">{item.catLabel}</p>
							<h3 class="font-mms-display text-xl leading-tight text-mms-cream">{item.title}</h3>
							<p class="mt-4 text-[0.72rem] text-mms-muted">{item.author} · {item.date}</p>
							<p class="mt-4 text-[0.68rem] uppercase tracking-[0.15em] text-mms-gold transition group-hover:tracking-[0.18em]">
								Read article →
							</p>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	</main>

	<MmsSiteFooter />
</div>
