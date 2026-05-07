<script lang="ts">
	import type { MmsTastingScores } from '$lib/data/mms-tasting-notes';

	type Props = {
		scores: MmsTastingScores;
		/** SVG viewBox width/height (square), e.g. 340 for hero, 120 for modal. */
		box: number;
		showLabels?: boolean;
	};

	let { scores, box, showLabels = true }: Props = $props();

	const axes = ['nose', 'palate', 'finish', 'balance', 'complexity'] as const;
	const colors = ['#C9A84C', '#8ABAEF', '#9FE1CB', '#F5C4B3', '#CECBF6'];
	const n = axes.length;

	const cx = $derived(box / 2);
	const cy = $derived(box / 2);
	/** Matches reference: inner chart “size” was 320 in a 340 box → r = 150. */
	const r = $derived(box / 2 - 20);

	const pts = $derived(
		axes.map((k, i) => {
			const angle = (2 * Math.PI * i) / n - Math.PI / 2;
			const val = scores[k] / 100;
			return { x: cx + r * val * Math.cos(angle), y: cy + r * val * Math.sin(angle), i };
		})
	);

	const gridPolys = $derived(
		[0.25, 0.5, 0.75, 1].map((t) =>
			axes.map((_, i) => {
				const a = (2 * Math.PI * i) / n - Math.PI / 2;
				return { x: cx + r * t * Math.cos(a), y: cy + r * t * Math.sin(a) };
			})
		)
	);

	const axisLines = $derived(
		axes.map((_, i) => {
			const a = (2 * Math.PI * i) / n - Math.PI / 2;
			return { x2: cx + r * Math.cos(a), y2: cy + r * Math.sin(a) };
		})
	);

	const labelPts = $derived(
		axes.map((k, i) => {
			const a = (2 * Math.PI * i) / n - Math.PI / 2;
			return {
				k: k.toUpperCase(),
				x: cx + (r + 14) * Math.cos(a),
				y: cy + (r + 14) * Math.sin(a) + 4
			};
		})
	);

	const polyPoints = $derived(pts.map((p) => `${p.x},${p.y}`).join(' '));
</script>

<svg width={box} height={box} viewBox="0 0 {box} {box}" aria-hidden="true">
	{#each gridPolys as g}
		<polygon
			points={g.map((p) => `${p.x},${p.y}`).join(' ')}
			fill="none"
			stroke="rgba(201,168,76,0.08)"
			stroke-width="0.6"
		/>
	{/each}
	{#each axisLines as line}
		<line x1={cx} y1={cy} x2={line.x2} y2={line.y2} stroke="rgba(201,168,76,0.1)" stroke-width="0.6" />
	{/each}
	<polygon
		points={polyPoints}
		fill="rgba(201,168,76,0.12)"
		stroke="rgba(201,168,76,0.6)"
		stroke-width="1.2"
	/>
	{#each pts as p}
		<circle cx={p.x} cy={p.y} r="3" fill={colors[p.i]} />
	{/each}
	{#if showLabels}
		{#each labelPts as lp}
			<text
				x={lp.x}
				y={lp.y}
				text-anchor="middle"
				class="fill-mms-gold/50 font-mms-sans text-[7px] tracking-wide"
			>
				{lp.k}
			</text>
		{/each}
	{/if}
</svg>
