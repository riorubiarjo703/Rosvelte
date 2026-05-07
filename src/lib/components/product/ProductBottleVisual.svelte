<script lang="ts">
	import type { MmsBottleViewId } from '$lib/data/mms-product-detail';

	let {
		view,
		watermark = 'MMS',
		height = 280
	}: {
		view: MmsBottleViewId;
		watermark: string;
		height?: number;
	} = $props();

	const w = $derived(height * 0.32);
	const accent = 'rgba(201,168,76,0.65)';
	const fillBottle = 'rgba(201,168,76,0.08)';
</script>

<!-- Four illustration modes for the PDP gallery -->
<svg
	class="max-h-[min(58vh,560px)] w-auto md:max-h-[min(64vh,640px)]"
	width={w}
	height={height}
	viewBox="0 0 40 125"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	{#if view === 'gift'}
		<rect x="2" y="55" width="36" height="62" rx="2" stroke={accent} stroke-width="0.6" opacity="0.35" />
		<line x1="6" y1="62" x2="34" y2="62" stroke={accent} stroke-width="0.4" opacity="0.25" />
		<line x1="20" y1="55" x2="20" y2="117" stroke={accent} stroke-width="0.4" opacity="0.2" />
	{/if}

	{#if view === 'poured'}
		<path
			d="M28 95 Q32 88 30 78 L26 70 Q24 66 26 62"
			stroke={accent}
			stroke-width="0.9"
			fill="none"
			opacity="0.5"
		/>
		<ellipse cx="27" cy="96" rx="4" ry="1.2" fill={accent} opacity="0.25" />
		<path d="M26 62 L24 58 L22 56" stroke={accent} stroke-width="0.6" opacity="0.4" />
	{/if}

	<rect x="15" y="0" width="10" height="10" rx="1.5" fill={accent} opacity={view === 'label' ? 0.35 : 0.5} />
	<path
		d="M15 10 Q12 28 10 44 L10 112 Q10 120 20 120 Q30 120 30 112 L30 44 Q28 28 25 10Z"
		fill={fillBottle}
		stroke={accent}
		stroke-width="0.85"
		opacity={view === 'gift' ? 0.85 : 1}
	/>

	{#if view === 'label'}
		<rect x="9" y="48" width="22" height="38" rx="1" fill="rgba(201,168,76,0.04)" stroke={accent} stroke-width="0.5" />
		<text
			x="20"
			y="62"
			text-anchor="middle"
			font-family="ui-serif, Georgia, serif"
			font-size="4.2"
			fill={accent}
			opacity="0.9">{watermark.slice(0, 10)}</text
		>
		<line x1="12" y1="68" x2="28" y2="68" stroke={accent} stroke-width="0.35" opacity="0.45" />
		<text
			x="20"
			y="76"
			text-anchor="middle"
			font-family="'DM Sans', sans-serif"
			font-size="3"
			fill={accent}
			opacity="0.55">EST.</text
		>
	{:else}
		<rect x="12" y="56" width="16" height="34" rx="0.5" fill="none" stroke={accent} stroke-width="0.45" opacity="0.55" />
		<text
			x="20"
			y="68"
			text-anchor="middle"
			font-family="'Bebas Neue', sans-serif"
			font-size="5"
			fill={accent}
			opacity="0.75"
			letter-spacing="0.5">MMS</text
		>
		<line x1="14" y1="73" x2="26" y2="73" stroke={accent} stroke-width="0.35" opacity="0.4" />
	{/if}

	<rect
		x="10"
		y="112"
		width="20"
		height="6"
		rx="1"
		fill="rgba(201,168,76,0.12)"
		stroke={accent}
		stroke-width="0.45"
		opacity="0.45"
	/>
</svg>
