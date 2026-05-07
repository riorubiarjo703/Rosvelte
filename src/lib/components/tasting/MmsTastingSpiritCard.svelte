<script lang="ts">
	import type { MmsTastingSpirit } from '$lib/data/mms-tasting-notes';
	import MmsTastingBottle from './MmsTastingBottle.svelte';
	import MmsTastingScoreRing from './MmsTastingScoreRing.svelte';

	type Props = {
		spirit: MmsTastingSpirit;
		inCompare: boolean;
		revealClass: string;
		onopencard: () => void;
		oncompareclick: (e: MouseEvent) => void;
		onnotesclick: (e: MouseEvent) => void;
	};

	let { spirit: s, inCompare, revealClass, onopencard, oncompareclick, onnotesclick }: Props = $props();

	const nosePreview = $derived(
		s.nose.length > 110 ? `${s.nose.slice(0, 110)}…` : s.nose
	);

	const badgeLabel = $derived(
		s.badge === 'rare' ? 'Rare Find' : s.badge === 'new' ? 'New Arrival' : s.badge === 'exc' ? 'Exclusive' : ''
	);
</script>

<div
	class="spirit-card group relative cursor-pointer overflow-hidden bg-mms-ink2 transition-colors hover:bg-mms-ink3 {revealClass}"
	onclick={onopencard}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onopencard();
		}
	}}
	role="button"
	tabindex="0"
	aria-label="Open tasting notes for {s.name}"
>
	<div
		class="pointer-events-none absolute inset-x-0 top-0 z-[2] h-px origin-left scale-x-0 bg-mms-gold transition-transform duration-300 group-hover:scale-x-100"
	></div>
	<div class="flex gap-6 px-8 pb-6 pt-8 max-[500px]:flex-col max-[500px]:gap-4">
		<div class="shrink-0">
			<MmsTastingBottle color={s.color} height={130} />
		</div>
		<div class="min-w-0 flex-1">
			{#if s.badge}
				<span
					class="mb-3 inline-block px-2.5 py-1 text-[0.55rem] uppercase tracking-[0.18em] {s.badge === 'rare'
						? 'border border-mms-gold/25 bg-mms-gold/10 text-mms-gold'
						: s.badge === 'new'
							? 'border border-[rgba(80,120,180,0.25)] bg-[rgba(80,120,180,0.12)] text-[#8ABAEF]'
							: 'border border-[rgba(140,80,160,0.25)] bg-[rgba(140,80,160,0.12)] text-[#C8A8EF]'}"
				>
					{badgeLabel}
				</span>
			{/if}
			<p
				class="mb-1.5 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-mms-gold-dim before:block before:h-px before:w-2.5 before:bg-mms-gold-dim"
			>
				{s.origin} · {s.region}
			</p>
			<h3 class="font-mms-display text-[1.35rem] font-normal leading-tight text-mms-cream">{s.name}</h3>
			<p class="mt-1 text-[0.72rem] font-light text-mms-muted">{s.style}</p>
			<div class="mt-2 flex justify-center sm:justify-start">
				<MmsTastingScoreRing score={s.overall} r={30} />
			</div>
		</div>
	</div>
	<div class="mx-6 h-px bg-mms-gold/[0.06]"></div>
	<div class="px-8 py-6">
		<p class="mb-2 text-[0.58rem] uppercase tracking-[0.2em] text-mms-gold-dim">Nose</p>
		<p class="font-mms-display text-base font-light italic leading-relaxed text-mms-cream">“{nosePreview}”</p>
	</div>
	<div class="flex flex-col gap-2.5 px-8 pb-6">
		{#each s.flavours.slice(0, 4) as f}
			<div class="grid grid-cols-[70px_1fr_24px] items-center gap-2.5">
				<span class="text-[0.6rem] uppercase tracking-wide text-mms-muted">{f.l}</span>
				<div class="relative h-0.5 rounded-sm bg-mms-gold/[0.08]">
					<div
						class="absolute left-0 top-0 h-full rounded-sm bg-mms-gold transition-[width] duration-700"
						style:width="{f.v}%"
					></div>
				</div>
				<span class="text-right text-[0.65rem] text-mms-muted">{f.v}</span>
			</div>
		{/each}
	</div>
	<div
		class="flex flex-wrap items-center justify-between gap-3 border-t border-mms-gold/[0.06] px-8 pb-6 pt-4"
	>
		<div class="flex gap-5">
			<div class="text-center">
				<span class="font-mms-display block text-lg text-mms-cream">{s.age ? s.age : 'NAS'}</span>
				<span class="text-[0.52rem] uppercase tracking-[0.15em] text-mms-muted">{s.age ? 'Years' : 'Age'}</span>
			</div>
			<div class="text-center">
				<span class="font-mms-display block text-lg text-mms-cream">{s.abv}%</span>
				<span class="text-[0.52rem] uppercase tracking-[0.15em] text-mms-muted">ABV</span>
			</div>
			<div class="text-center">
				<span class="font-mms-display block text-lg text-mms-cream">{s.overall}</span>
				<span class="text-[0.52rem] uppercase tracking-[0.15em] text-mms-muted">Score</span>
			</div>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<button
				type="button"
				class="border px-[1.1rem] py-2.5 font-mms-sans text-[0.62rem] uppercase tracking-[0.18em] transition hover:bg-mms-gold hover:text-mms-ink {inCompare
					? 'border-mms-gold bg-mms-gold/15 text-mms-gold'
					: 'border-mms-gold/25 bg-transparent text-mms-gold'}"
				onclick={oncompareclick}
			>
				{inCompare ? 'Added' : 'Compare'}
			</button>
			<button
				type="button"
				class="border border-mms-gold/25 bg-transparent px-[1.1rem] py-2.5 font-mms-sans text-[0.62rem] uppercase tracking-[0.18em] text-mms-gold transition hover:bg-mms-gold hover:text-mms-ink"
				onclick={onnotesclick}
			>
				Notes →
			</button>
		</div>
	</div>
</div>
