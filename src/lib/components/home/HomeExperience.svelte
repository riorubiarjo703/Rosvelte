<script lang="ts">
	import { resolve } from '$app/paths';
	import { mmsReveal } from '$lib/mms-tailwind';

	const bars = [
		{ label: 'Complexity', value: 92 },
		{ label: 'Finish', value: 88 },
		{ label: 'Nose', value: 95 },
		{ label: 'Balance', value: 90 }
	] as const;
</script>

<section id="tasting" class="relative overflow-hidden bg-mms-cream2 px-6 py-16 text-mms-ink md:px-12 md:py-24" aria-labelledby="editorial-heading">
	<p
		class="pointer-events-none absolute right-[-2%] top-1/2 -translate-y-1/2 font-mms-logo text-[22vw] leading-none tracking-wide text-mms-ink/[0.04]"
		aria-hidden="true"
	>
		MMS
	</p>
	<div class="relative z-[1] grid gap-12 md:grid-cols-2 md:items-center md:gap-24">
		<div class={mmsReveal}>
			<p
				class="mb-6 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-mms-gold-dim before:block before:h-px before:w-6 before:bg-mms-gold-dim"
			>
				The MMS approach
			</p>
			<h2
				id="editorial-heading"
				class="font-mms-display mb-6 text-[clamp(1.5rem,3.5vw,3rem)] font-light leading-tight text-mms-ink"
			>
				Tasting is<br /><em class="text-mms-gold-dim not-italic">an art</em> worth<br />mastering
			</h2>
			<p class="mb-8 text-[0.85rem] font-light leading-[1.9] text-mms-ink/60">
				Every expression in our collection has been tasted, debated, and approved by a team that believes a great spirit
				is never accidental. It is the result of land, climate, craft — and time itself.
			</p>
			<a
				href={resolve('/tasting-notes')}
				class="border-b border-mms-ink/30 pb-1 text-[0.7rem] uppercase tracking-[0.2em] text-mms-ink no-underline transition hover:border-mms-ink"
				>Browse curator tasting notes →</a>
		</div>
		<div class="flex flex-col gap-6 {mmsReveal} delay-100">
			{#each bars as b (b.label)}
				<div class="grid grid-cols-[120px_1fr_auto] items-center gap-6 border-b border-mms-ink/10 pb-6 last:border-0 last:pb-0">
					<span class="text-[0.65rem] uppercase tracking-[0.15em] text-mms-ink/50">{b.label}</span>
					<div class="relative h-0.5 flex-1 bg-mms-ink/10">
						<div class="absolute inset-y-0 left-0 bg-mms-gold-dim" style="width: {b.value}%"></div>
					</div>
					<span class="font-mms-display text-xl text-mms-ink">{b.value}</span>
				</div>
			{/each}
			<p class="mt-2 text-[0.65rem] uppercase tracking-[0.1em] text-mms-ink/40">
				Average across MMS reserve collection
			</p>
		</div>
	</div>
</section>
