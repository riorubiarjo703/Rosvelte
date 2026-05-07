<script lang="ts">
	import { mmsReveal } from '$lib/mms-tailwind';
</script>

<section id="collections" class="relative px-6 py-16 md:px-12 md:py-28" aria-labelledby="origins-heading">
	<div class="mb-12 grid items-end gap-8 md:mb-20 md:grid-cols-[1fr_auto]">
		<div class={mmsReveal}>
			<p
				class="mb-4 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-mms-gold before:block before:h-px before:w-8 before:bg-mms-gold"
			>
				Provenance
			</p>
			<h2
				id="origins-heading"
				class="font-mms-display text-[clamp(1.75rem,4vw,3.8rem)] font-light leading-tight text-mms-cream"
			>
				Spirits from the<br /><em class="text-mms-gold-light not-italic">World’s finest</em> origins
			</h2>
		</div>
		<a
			href="#collections"
			class="text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold no-underline transition hover:text-mms-gold-light md:pb-1 md:text-right {mmsReveal}"
			>View all origins →</a>
	</div>

	<div class="grid grid-cols-1 gap-px bg-mms-gold/20 md:grid-cols-[1.4fr_1fr_1fr] md:grid-rows-2">
		<article
			class="group relative overflow-hidden bg-mms-ink2 transition-transform duration-500 ease-out hover:z-[2] hover:scale-[1.01] md:row-span-2"
		>
			<div
				class="bg-mms-origin-scotland absolute inset-0 origin-center scale-100 bg-cover bg-center brightness-[0.45] saturate-[0.7] transition-[transform,filter] duration-500 group-hover:scale-105 group-hover:brightness-[0.35] group-hover:saturate-[0.6]"
			></div>
			<div
				class="absolute inset-0 bg-gradient-to-t from-mms-ink/90 via-transparent to-transparent to-60%"
			></div>
			<div class="relative flex min-h-[340px] flex-col justify-end p-8 md:min-h-[560px]">
				<div class="relative z-[2]">
					<p
						class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold before:block before:h-px before:w-[18px] before:bg-mms-gold-dim"
					>
						Scotland · Highlands &amp; Islay
					</p>
					<h3 class="font-mms-display text-2xl font-normal leading-tight text-mms-cream md:text-[2.6rem]">
						Single malt<br />Scotch
					</h3>
					<p class="mt-2 text-[0.75rem] leading-relaxed tracking-wide text-mms-muted">
						Peat, smoke and sea salt from the ancient distilleries of Speyside, Islay, and the Highlands.
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						{#each ['Glenfarclas', 'Laphroaig', 'Macallan', 'Bruichladdich'] as b (b)}
							<span
								class="border border-mms-gold/30 px-3 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-mms-gold-light">{b}</span>
						{/each}
					</div>
				</div>
			</div>
		</article>

		<article
			class="group relative overflow-hidden bg-mms-ink2 transition-transform duration-500 hover:z-[2] hover:scale-[1.01]"
		>
			<div
				class="bg-mms-origin-france absolute inset-0 bg-cover bg-center brightness-[0.45] saturate-[0.7] transition-[transform,filter] duration-500 group-hover:scale-105 group-hover:brightness-[0.35] group-hover:saturate-[0.6]"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-mms-ink/90 via-transparent to-60%"></div>
			<div class="relative flex min-h-[260px] flex-col justify-end p-8">
				<div class="relative z-[2]">
					<p
						class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold before:block before:h-px before:w-[18px] before:bg-mms-gold-dim"
					>
						France · Cognac &amp; Armagnac
					</p>
					<h3 class="font-mms-display text-[1.8rem] font-normal text-mms-cream">French brandies</h3>
					<p class="mt-2 text-[0.75rem] leading-relaxed tracking-wide text-mms-muted">
						Centuries of mastery in Grande Champagne and Gascony.
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						{#each ['Rémy Martin', 'Armagnac Tariquet'] as b (b)}
							<span
								class="border border-mms-gold/30 px-3 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-mms-gold-light">{b}</span>
						{/each}
					</div>
				</div>
			</div>
		</article>

		<article
			class="group relative overflow-hidden bg-mms-ink2 transition-transform duration-500 hover:z-[2] hover:scale-[1.01]"
		>
			<div
				class="bg-mms-origin-japan absolute inset-0 bg-cover bg-center brightness-[0.45] saturate-[0.7] transition-[transform,filter] duration-500 group-hover:scale-105 group-hover:brightness-[0.35] group-hover:saturate-[0.6]"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-mms-ink/90 via-transparent to-60%"></div>
			<div class="relative flex min-h-[260px] flex-col justify-end p-8">
				<div class="relative z-[2]">
					<p
						class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold before:block before:h-px before:w-[18px] before:bg-mms-gold-dim"
					>
						Japan · Yamazaki &amp; Nikka
					</p>
					<h3 class="font-mms-display text-[1.8rem] font-normal text-mms-cream">Japanese whisky</h3>
					<p class="mt-2 text-[0.75rem] leading-relaxed tracking-wide text-mms-muted">
						Meticulous craft and nature’s silence, bottled in perfect balance.
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						{#each ['Suntory', 'Nikka'] as b (b)}
							<span
								class="border border-mms-gold/30 px-3 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-mms-gold-light">{b}</span>
						{/each}
					</div>
				</div>
			</div>
		</article>

		<article class="group relative overflow-hidden bg-mms-ink2 transition-transform duration-500 hover:z-[2] hover:scale-[1.01]">
			<div
				class="bg-mms-origin-mexico absolute inset-0 bg-cover bg-center brightness-[0.45] saturate-[0.7] transition-[transform,filter] duration-500 group-hover:scale-105 group-hover:brightness-[0.35] group-hover:saturate-[0.6]"
			></div>
			<div class="absolute inset-0 bg-gradient-to-t from-mms-ink/90 via-transparent to-60%"></div>
			<div class="relative flex min-h-[260px] flex-col justify-end p-8">
				<div class="relative z-[2]">
					<p
						class="mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold before:block before:h-px before:w-[18px] before:bg-mms-gold-dim"
					>
						Mexico · Jalisco &amp; Oaxaca
					</p>
					<h3 class="font-mms-display text-[1.8rem] font-normal text-mms-cream">Tequila &amp; mezcal</h3>
					<p class="mt-2 text-[0.75rem] leading-relaxed tracking-wide text-mms-muted">
						Earth, fire and centuries of tradition from the agave heartland.
					</p>
					<div class="mt-4 flex flex-wrap gap-2">
						{#each ['Don Julio', 'El Silencio'] as b (b)}
							<span
								class="border border-mms-gold/30 px-3 py-1 text-[0.6rem] uppercase tracking-[0.15em] text-mms-gold-light">{b}</span>
						{/each}
					</div>
				</div>
			</div>
		</article>
	</div>
</section>
