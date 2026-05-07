<script lang="ts">
	type Props = { color: string; height?: number };
	let { color, height = 140 }: Props = $props();
	const w = $derived(Math.round(height * 0.36));
</script>

<svg width={w} {height} viewBox="0 0 52 145" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
	<rect x="18" y="0" width="16" height="12" rx="2" fill="rgba(201,168,76,0.5)" stroke="rgba(201,168,76,0.7)" stroke-width="0.5" />
	<path
		d="M18 12 Q14 32 12 50 L12 128 Q12 138 26 138 Q40 138 40 128 L40 50 Q38 32 34 12Z"
		fill={color}
		stroke="rgba(201,168,76,0.45)"
		stroke-width="0.8"
	/>
	<rect x="14" y="66" width="24" height="40" rx="0.5" fill="none" stroke="rgba(201,168,76,0.3)" stroke-width="0.6" />
	<text
		x="26"
		y="80"
		text-anchor="middle"
		font-family="Bebas Neue, sans-serif"
		font-size="5.5"
		fill="rgba(201,168,76,0.7)"
		letter-spacing="1.5">MMS</text>
	<line x1="16" y1="87" x2="36" y2="87" stroke="rgba(201,168,76,0.2)" stroke-width="0.4" />
	<text
		x="26"
		y="97"
		text-anchor="middle"
		font-family="Cormorant Garamond, serif"
		font-size="4"
		fill="rgba(201,168,76,0.4)"
		letter-spacing="0.5">TASTING NOTE</text>
	<rect x="12" y="128" width="28" height="8" rx="1" fill="rgba(201,168,76,0.12)" stroke="rgba(201,168,76,0.25)" stroke-width="0.5" />
	<line x1="20" y1="40" x2="20" y2="120" stroke="rgba(255,255,255,0.04)" stroke-width="5" />
</svg>
