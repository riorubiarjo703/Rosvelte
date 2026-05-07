<script lang="ts">
	import type { MmsBottleViewId } from '$lib/data/mms-product-detail';
	import type { MmsProductBadge } from '$lib/data/mms-collection-products';
	import ProductBottleVisual from './ProductBottleVisual.svelte';

	let {
		watermark,
		badge,
		/** Public URLs for catalogue photos (ordered). When non-empty, replaces SVG bottle + view tabs. */
		productImageSrcs = [],
		productImageAlt = ''
	}: {
		watermark: string;
		badge: MmsProductBadge;
		productImageSrcs?: string[];
		productImageAlt?: string;
	} = $props();

	const views: { id: MmsBottleViewId; label: string }[] = [
		{ id: 'front', label: 'Front' },
		{ id: 'label', label: 'Label' },
		{ id: 'gift', label: 'Gift Box' },
		{ id: 'poured', label: 'Poured' }
	];

	let active = $state<MmsBottleViewId>('front');
	let activePhoto = $state(0);

	const badgeLabels: Record<Exclude<MmsProductBadge, ''>, string> = {
		rare: 'Rare Find',
		new: 'New Arrival',
		limited: 'Limited',
		exclusive: 'Exclusive'
	};

	const hasPhotos = $derived(productImageSrcs.length > 0);
	const mainPhotoSrc = $derived(productImageSrcs[activePhoto] ?? productImageSrcs[0] ?? null);
</script>

<div class="flex flex-col gap-0 lg:sticky lg:top-24 lg:self-start">
	<div
		class="relative flex min-h-[min(58vh,560px)] items-center justify-center overflow-hidden bg-mms-ink2 md:min-h-[min(64vh,640px)]"
	>
		<span
			class="pointer-events-none absolute bottom-0 left-1/2 whitespace-nowrap font-mms-logo text-[clamp(4rem,14vw,9rem)] leading-none tracking-[0.08em] text-mms-gold/[0.04]"
			aria-hidden="true"
		>
			{watermark}
		</span>
		{#if badge}
			<div class="absolute left-4 top-4 z-[2] md:left-6 md:top-6">
				<span
					class="inline-block border border-mms-gold/30 bg-mms-gold/15 px-3 py-1 font-mms-sans text-[0.55rem] uppercase tracking-[0.2em] text-mms-gold"
				>
					{badgeLabels[badge]}
				</span>
			</div>
		{/if}
		<div class="relative z-[2] flex w-full items-center justify-center px-4 py-8 md:px-8 md:py-12">
			{#if mainPhotoSrc}
				<img
					src={mainPhotoSrc}
					alt={productImageAlt}
					class="max-h-[min(58vh,560px)] w-auto max-w-[min(100%,min(92vw,520px))] object-contain md:max-h-[min(64vh,680px)] md:max-w-[min(100%,560px)]"
					loading="eager"
					decoding="async"
				/>
			{:else}
				<ProductBottleVisual view={active} {watermark} height={380} />
			{/if}
		</div>
	</div>
	{#if hasPhotos && productImageSrcs.length > 1}
		<div class="flex gap-px bg-mms-gold/10" role="tablist" aria-label="Product photos">
			{#each productImageSrcs as src, i (src)}
				<button
					type="button"
					role="tab"
					aria-selected={activePhoto === i}
					aria-label="View product photo {i + 1}"
					class="flex min-h-[5.5rem] flex-1 flex-col items-center justify-center bg-mms-ink3 py-3 text-center transition hover:bg-mms-ink2 {activePhoto === i
						? 'border-b-2 border-mms-gold bg-mms-ink2'
						: 'border-b-2 border-transparent'}"
					onclick={() => (activePhoto = i)}
				>
					<img
						src={src}
						alt=""
						class="mx-auto mb-1 h-16 w-auto max-w-[5.5rem] object-contain opacity-90 md:h-[4.25rem] md:max-w-[6rem]"
						loading="lazy"
						decoding="async"
					/>
				</button>
			{/each}
		</div>
	{:else if !hasPhotos}
		<div class="flex gap-px bg-mms-gold/10" role="tablist" aria-label="Bottle views">
			{#each views as v (v.id)}
				<button
					type="button"
					role="tab"
					aria-selected={active === v.id}
					class="flex min-h-[5.5rem] flex-1 flex-col items-center justify-center bg-mms-ink3 py-3 text-center transition hover:bg-mms-ink2 {active === v.id
						? 'border-b-2 border-mms-gold bg-mms-ink2'
						: 'border-b-2 border-transparent'}"
					onclick={() => (active = v.id)}
				>
					<span class="sr-only">Show {v.label} view</span>
					<span class="font-mms-sans text-[0.52rem] uppercase tracking-[0.12em] text-mms-muted">{v.label}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>
