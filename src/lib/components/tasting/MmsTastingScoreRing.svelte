<script lang="ts">
	type Props = { score: number; r?: number };
	let { score, r = 28 }: Props = $props();
	const circ = $derived(2 * Math.PI * r);
	const dash = $derived((score / 100) * circ);
	const pad = 8;
	const size = $derived(r * 2 + pad * 2);
	const c = $derived(r + pad);
</script>

<svg width={size} height={size} viewBox="0 0 {size} {size}" aria-hidden="true">
	<circle cx={c} cy={c} {r} fill="none" stroke="rgba(201,168,76,0.08)" stroke-width="3" />
	<circle
		cx={c}
		cy={c}
		{r}
		fill="none"
		stroke="rgba(201,168,76,0.6)"
		stroke-width="3"
		stroke-dasharray="{dash} {circ}"
		stroke-dashoffset={circ * 0.25}
		stroke-linecap="round"
	/>
	<text
		x={c}
		y={c + 1}
		text-anchor="middle"
		dominant-baseline="middle"
		class="fill-mms-gold font-mms-display font-light"
		font-size={r < 22 ? 13 : 16}>{score}</text>
</svg>
