<script lang="ts">
	import type { MmsProductDetailModel } from '$lib/data/mms-product-detail';
	import TastingRadarSvg from './TastingRadarSvg.svelte';

	let { model }: { model: MmsProductDetailModel } = $props();

	const tabs = $derived([
		{ id: 'about' as const, label: 'About' },
		{ id: 'tasting' as const, label: 'Tasting Notes' },
		{ id: 'specs' as const, label: 'Specifications' },
		{ id: 'reviews' as const, label: `Reviews (${model.reviews.total})` }
	]);

	let tab = $state<(typeof tabs)[number]['id']>('about');
</script>

<div class="border-b border-mms-gold/10">
	<div class="flex gap-0 overflow-x-auto" role="tablist" aria-label="Product information">
		{#each tabs as t (t.id)}
			<button
				type="button"
				role="tab"
				aria-selected={tab === t.id}
				class="whitespace-nowrap border-b-2 border-transparent bg-transparent px-5 py-4 font-mms-sans text-[0.62rem] uppercase tracking-[0.2em] text-mms-muted transition hover:text-mms-cream md:px-8 {tab === t.id
					? 'border-mms-gold text-mms-gold'
					: ''}"
				onclick={() => (tab = t.id)}
			>
				{t.label}
			</button>
		{/each}
	</div>
</div>

<div class="py-10 md:py-12">
	{#if tab === 'about'}
		<div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
			<div>
				<h2 class="font-mms-display text-[clamp(1.5rem,3vw,2rem)] font-light leading-tight text-mms-cream">
					{model.about.title}
				</h2>
				<div class="mt-6 space-y-4 text-[0.84rem] font-light leading-[1.9] text-mms-muted">
					{#each model.about.paragraphs as para, i (i)}
						<p>{para}</p>
					{/each}
				</div>
			</div>
			<div class="flex flex-col divide-y divide-mms-gold/[0.06]">
				{#each model.about.steps as step, i (i)}
					<div class="grid grid-cols-[3rem_1fr] gap-4 py-6 first:pt-0 md:grid-cols-[3.5rem_1fr] md:gap-5">
						<span class="font-mms-logo text-3xl leading-none text-mms-gold/20 md:text-4xl"
							>{String(i + 1).padStart(2, '0')}</span
						>
						<div>
							<p class="mb-2 font-mms-sans text-[0.78rem] uppercase tracking-[0.12em] text-mms-gold-dim">
								{step.title}
							</p>
							<p class="text-[0.78rem] font-light leading-relaxed text-mms-muted">{step.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else if tab === 'tasting'}
		<div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
			<div>
				{#each [{ k: 'Colour', v: model.tasting.colour }, { k: 'Nose', v: model.tasting.nose }, { k: 'Palate', v: model.tasting.palate }, { k: 'Finish', v: model.tasting.finish }] as note (note.k)}
					<div class="mb-8">
						<p
							class="mb-3 flex items-center gap-3 font-mms-sans text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim after:h-px after:flex-1 after:bg-mms-gold/10"
						>
							{note.k}
						</p>
						<p class="font-mms-display text-[1.05rem] font-light italic leading-relaxed text-mms-cream">
							{note.v}
						</p>
					</div>
				{/each}
				<div class="border-l-2 border-mms-gold-dim bg-mms-ink3 p-6">
					<p class="font-mms-display text-[1rem] font-light italic leading-[1.85] text-mms-cream">
						“{model.tasting.verdict}”
					</p>
					<p class="mt-3 font-mms-sans text-[0.62rem] tracking-[0.1em] text-mms-gold-dim">
						— {model.curator.name}, {model.curator.role} · MMS {model.mmsScore}/100
					</p>
				</div>
			</div>
			<div>
				<p class="mb-6 font-mms-sans text-[0.62rem] uppercase tracking-[0.2em] text-mms-muted">
					Flavour profile
				</p>
				{#each model.tasting.flavours as fl (fl.label)}
					<div class="mb-4 grid grid-cols-[5.5rem_1fr_2rem] items-center gap-3">
						<span class="font-mms-sans text-[0.65rem] uppercase tracking-[0.1em] text-mms-muted"
							>{fl.label}</span
						>
						<div class="h-[3px] rounded-sm bg-mms-gold/10">
							<div
								class="h-full rounded-sm bg-mms-gold"
								style={`width: ${Math.min(100, fl.value)}%`}
							></div>
						</div>
						<span class="text-right font-mms-sans text-[0.7rem] text-mms-muted">{fl.value}</span>
					</div>
				{/each}
				<div class="mt-8 flex justify-center bg-mms-ink2 p-6 md:p-8">
					<TastingRadarSvg axes={model.tasting.radar} />
				</div>
			</div>
		</div>
	{:else if tab === 'specs'}
		<table class="w-full border-collapse">
			<tbody>
				{#each model.specs as section (section.section)}
					<tr>
						<td
							class="bg-mms-gold/[0.04] px-4 py-4 font-mms-logo text-[0.75rem] uppercase tracking-[0.2em] text-mms-gold-dim md:px-6"
							colspan="2">{section.section}</td
						>
					</tr>
					{#each section.rows as row (row.k)}
						<tr class="border-b border-mms-gold/[0.06] last:border-0">
							<td
								class="w-[40%] bg-mms-ink2 px-4 py-3.5 font-mms-sans text-[0.65rem] uppercase tracking-[0.15em] text-mms-muted md:w-[200px] md:px-6"
								>{row.k}</td
							>
							<td class="bg-mms-ink2/40 px-4 py-3.5 text-[0.8rem] font-light text-mms-cream md:px-6"
								>{row.v}</td
							>
						</tr>
					{/each}
				{/each}
			</tbody>
		</table>
	{:else}
		<div class="mb-10 flex flex-col gap-10 md:flex-row md:items-start md:gap-16">
			<div class="text-center md:text-left">
				<span class="font-mms-display text-[clamp(3rem,8vw,5rem)] font-light leading-none text-mms-gold"
					>{model.reviews.avg}</span
				>
				<div class="mt-2 flex justify-center gap-0.5 text-sm md:justify-start" aria-hidden="true">
					{#each Array(5) as _, i (i)}
						<span class={i < Math.round(model.reviews.avg) ? 'text-mms-gold' : 'text-mms-muted/25'}
							>★</span
						>
					{/each}
				</div>
				<p class="mt-3 font-mms-sans text-[0.62rem] uppercase tracking-[0.2em] text-mms-muted">
					{model.reviews.total} reviews
				</p>
			</div>
			<div class="min-w-[200px] flex-1">
				{#each model.reviews.bars as b (b.star)}
					<div class="mb-2 grid grid-cols-[3rem_1fr_2rem] items-center gap-2">
						<span class="font-mms-sans text-[0.68rem] text-mms-muted">{b.star} ★</span>
						<div class="h-1 rounded-sm bg-mms-gold/10">
							<div class="h-full rounded-sm bg-mms-gold" style={`width: ${b.widthPct}%`}></div>
						</div>
						<span class="text-right font-mms-sans text-[0.65rem] text-mms-muted">{b.count}</span>
					</div>
				{/each}
			</div>
		</div>
		<div class="grid grid-cols-1 gap-px bg-mms-gold/10 sm:grid-cols-2">
			{#each model.reviews.cards as c (c.name + c.date)}
				<div class="bg-mms-ink2 p-7">
					<div class="mb-3 flex items-start justify-between gap-3">
						<span class="text-[0.8rem] font-medium text-mms-cream">{c.name}</span>
						<span class="text-[0.65rem] text-mms-muted">{c.date}</span>
					</div>
					<div class="mb-2 flex gap-0.5">
						{#each Array(5) as _, i (i)}
							<svg
								class="size-3 {i < c.rating ? 'text-mms-gold' : 'text-mms-muted/30'}"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									d="M12 2l3 7h7l-5.5 4 2 7L12 17l-6.5 4 2-7L2 9h7z"
								/>
							</svg>
						{/each}
					</div>
					<p class="font-mms-display text-[1.05rem] text-mms-cream">{c.title}</p>
					<p class="mt-2 text-[0.78rem] font-light leading-relaxed text-mms-muted">{c.body}</p>
					<p
						class="mt-4 flex items-center gap-1 font-mms-sans text-[0.58rem] uppercase tracking-[0.15em] text-mms-gold-dim"
					>
						<svg class="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
						</svg>
						Verified purchase
					</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
