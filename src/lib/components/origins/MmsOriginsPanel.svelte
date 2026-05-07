<script lang="ts">
	import { resolve } from '$app/paths';
	import type { OriginKey } from '$lib/data/mms-origins';
	import { mmsOrigins } from '$lib/data/mms-origins';
	import { mmsReveal, mmsRevealShort } from '$lib/mms-tailwind';
	import CollectionBottleArt from '$lib/components/collections/CollectionBottleArt.svelte';

	let { origin }: { origin: OriginKey } = $props();

	const data = $derived(mmsOrigins[origin]);

	const regionDelays = ['delay-75', 'delay-100', 'delay-150', 'delay-200', 'delay-300'];
</script>

<div class="origin-panel">
	<div class="grid min-h-[420px] grid-cols-1 overflow-hidden md:grid-cols-2">
		<div class="relative min-h-[240px] overflow-hidden md:min-h-0">
			<div
				class="absolute inset-0 flex items-center justify-center"
				style:background-color={data.bgColor}
			>
				<CollectionBottleArt height={180} />
			</div>
			<div
				class="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent to-mms-ink/30"
			></div>
		</div>
		<div class="relative flex flex-col justify-center bg-mms-ink2 px-6 py-8 md:p-16">
			<p
				class="mb-4 flex items-center gap-3 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold before:block before:h-px before:w-6 before:bg-mms-gold"
			>
				{data.flag}
			</p>
			<h2 class="font-mms-display mb-6 text-[clamp(2.5rem,4vw,4rem)] font-light leading-[0.95] text-mms-cream">
				{data.title}<br /><em class="italic text-mms-gold-light">{data.titleEm}</em>
			</h2>
			<p class="mb-6 max-w-[380px] text-[0.82rem] font-light leading-[1.85] text-mms-muted">{data.desc}</p>
			<div class="mb-8 flex flex-wrap gap-2">
				{#each data.tags as t (t)}
					<span
						class="border border-mms-gold/25 px-3 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-mms-gold-light"
						>{t}</span>
				{/each}
			</div>
			<a
				href={resolve('/collections')}
				class="inline-block self-start border border-mms-gold-dim bg-transparent px-7 py-3 font-mms-sans text-[0.7rem] uppercase tracking-[0.2em] text-mms-gold no-underline transition hover:bg-mms-gold hover:text-mms-ink"
				>Shop {data.titleEm} →</a>
		</div>
	</div>

	<div class="px-6 pb-0 pt-8 md:px-16 md:pt-12">
		<p
			class="mb-8 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.3em] text-mms-gold before:block before:h-px before:w-6 before:bg-mms-gold"
		>
			Key Regions
		</p>
		<div class="grid grid-cols-1 gap-px bg-mms-gold/10 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.regions as r, i (r.name)}
				<div
					class="group relative cursor-pointer bg-mms-ink2 p-8 transition-colors hover:bg-mms-ink3 {mmsRevealShort} {regionDelays[i % regionDelays.length] ?? ''}"
				>
					<div
						class="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-mms-gold transition-transform duration-300 group-hover:scale-x-100"
					></div>
					<span class="font-mms-logo mb-2 block text-6xl leading-none tracking-wide text-mms-gold/[0.07]"
						>{r.num}</span>
					<h3 class="font-mms-display mb-2 text-2xl font-normal leading-tight text-mms-cream">{r.name}</h3>
					<p class="mb-3 text-[0.65rem] uppercase tracking-[0.18em] text-mms-gold-dim">{r.type}</p>
					<p class="mb-5 text-[0.75rem] font-light leading-relaxed text-mms-muted">{r.desc}</p>
					<div class="flex gap-6 border-t border-mms-gold/[0.08] pt-4">
						{#each r.meta as m (m.l)}
							<div class="text-left">
								<span class="font-mms-display block text-xl font-light text-mms-cream">{m.v}</span>
								<span class="text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">{m.l}</span>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="px-6 py-8 md:px-16 md:py-12">
		<p
			class="mb-8 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.3em] text-mms-gold before:block before:h-px before:w-6 before:bg-mms-gold"
		>
			Featured Brands
		</p>
		<div class="grid grid-cols-1 gap-px bg-mms-gold/10 sm:grid-cols-2 lg:grid-cols-4">
			{#each data.brands as b (b.name)}
				<div
					class="group relative flex cursor-pointer flex-col gap-3 bg-mms-ink2 p-7 transition-colors hover:bg-mms-ink3 {mmsRevealShort}"
				>
					<div
						class="absolute bottom-6 right-6 translate-x-[-4px] text-base text-mms-gold-dim opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
					>
						→
					</div>
					<div
						class="flex size-12 items-center justify-center border border-mms-gold/20 font-mms-logo text-[0.8rem] tracking-wide text-mms-gold-dim"
					>
						{b.init}
					</div>
					<p class="font-mms-display text-xl font-normal leading-tight text-mms-cream">{b.name}</p>
					<p class="text-[0.65rem] uppercase tracking-[0.15em] text-mms-gold-dim">{b.origin}</p>
					<p class="text-[0.72rem] text-mms-muted">{b.type}</p>
					<p class="mt-auto text-[0.65rem] uppercase tracking-[0.15em] text-mms-muted">{b.products}</p>
				</div>
			{/each}
		</div>
	</div>

	<div class="grid grid-cols-1 gap-8 px-6 pb-8 pt-0 md:grid-cols-2 md:gap-12 md:px-16 md:pb-16">
		<div class={`bg-mms-ink2 p-8 ${mmsReveal}`}>
			<h3 class="font-mms-display mb-6 text-2xl font-light text-mms-cream">Flavour Profile</h3>
			{#each data.flavours as f (f.l)}
				<div class="mb-4 grid grid-cols-[110px_1fr_auto] items-center gap-4">
					<span class="text-[0.68rem] uppercase tracking-[0.12em] text-mms-muted">{f.l}</span>
					<div class="relative h-[3px] bg-mms-gold/10">
						<div class="absolute left-0 top-0 h-full bg-mms-gold transition-[width] duration-700 ease-out" style:width="{f.v}%"></div>
					</div>
					<span class="min-w-6 text-right font-mms-display text-base text-mms-cream">{f.v}</span>
				</div>
			{/each}
		</div>
		<div class={`bg-mms-ink2 p-8 ${mmsReveal} delay-100`}>
			<h3 class="font-mms-display mb-6 text-2xl font-light text-mms-cream">Origin Snapshot</h3>
			{#each data.distInfo as row (row.l)}
				<div class="flex items-center justify-between gap-4 border-b border-mms-gold/[0.06] py-3 text-[0.8rem] last:border-b-0">
					<span class="text-[0.68rem] uppercase tracking-[0.1em] text-mms-muted">{row.l}</span>
					<span class="max-w-[55%] text-right font-light text-mms-cream">{row.v}</span>
				</div>
			{/each}
		</div>
	</div>

	<div class="border-t border-mms-gold/[0.08] px-6 py-10 md:px-16 md:py-16">
		<h2 class="font-mms-display mb-10 text-3xl font-light text-mms-cream md:text-4xl">
			A History of <em class="italic text-mms-gold-light">Craft</em>
		</h2>
		<div class="relative pl-12">
			<div class="absolute bottom-0 left-0 top-2 w-px bg-mms-gold/15"></div>
			{#each data.timeline as t (t.year)}
				<div class="relative mb-10 {mmsRevealShort}">
					<div
						class="absolute -left-12 top-2 size-2 rounded-full border border-mms-gold-dim bg-mms-ink2"
						style="transform: translateX(-3.5px)"
					></div>
					<span class="font-mms-logo mb-1 block text-lg tracking-[0.15em] text-mms-gold">{t.year}</span>
					<p class="font-mms-display mb-1 text-lg font-normal text-mms-cream">{t.event}</p>
					<p class="text-[0.75rem] font-light leading-relaxed text-mms-muted">{t.desc}</p>
				</div>
			{/each}
		</div>
	</div>
</div>
