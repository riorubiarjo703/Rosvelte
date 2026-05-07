<script lang="ts">
	let { height = 120 }: { height?: number } = $props();
	const w = $derived(height * 0.32);
	const accent = 'rgba(201,168,76,0.6)';
</script>

<svg
	class="opacity-75 transition-opacity duration-300 group-hover:opacity-100"
	width={w}
	height={height}
	viewBox="0 0 40 125"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
>
	<rect x="15" y="0" width="10" height="10" rx="1.5" fill={accent} opacity="0.5" />
	<path
		d="M15 10 Q12 28 10 44 L10 112 Q10 120 20 120 Q30 120 30 112 L30 44 Q28 28 25 10Z"
		fill="rgba(201,168,76,0.07)"
		stroke={accent}
		stroke-width="0.8"
	/>
	<rect x="12" y="56" width="16" height="34" rx="0.5" fill="none" stroke={accent} stroke-width="0.5" opacity="0.6" />
	<text
		x="20"
		y="68"
		text-anchor="middle"
		font-family="'Bebas Neue', sans-serif"
		font-size="5"
		fill={accent}
		opacity="0.7"
		letter-spacing="1">MMS</text>
	<line x1="14" y1="73" x2="26" y2="73" stroke={accent} stroke-width="0.4" opacity="0.4" />
	<rect x="10" y="112" width="20" height="6" rx="1" fill="rgba(201,168,76,0.12)" stroke={accent} stroke-width="0.5" opacity="0.4" />
</svg>
