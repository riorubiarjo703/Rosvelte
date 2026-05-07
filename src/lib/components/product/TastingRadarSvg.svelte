<script lang="ts">
	let { axes }: { axes: { label: string; value: number }[] } = $props();

	const size = 280;
	const cx = size / 2;
	const cy = size / 2;
	const R = 108;
	const n = $derived(axes.length || 6);

	function point(i: number, t: number): { x: number; y: number } {
		const angle = (-Math.PI / 2 + (2 * Math.PI * i) / n) % (2 * Math.PI);
		return { x: cx + R * t * Math.cos(angle), y: cy + R * t * Math.sin(angle) };
	}

	const gridLevels = [0.25, 0.5, 0.75, 1];
	const polyPoints = $derived(
		axes
			.map((a, i) => {
				const t = Math.min(1, Math.max(0, a.value));
				const { x, y } = point(i, t);
				return `${x},${y}`;
			})
			.join(' ')
	);
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 {size} {size}"
	class="mx-auto max-w-full text-mms-gold/25"
	aria-hidden="true"
>
	{#each gridLevels as lv (lv)}
		<polygon
			points={axes
				.map((_, i) => {
					const { x, y } = point(i, lv);
					return `${x},${y}`;
				})
				.join(' ')}
			fill="none"
			stroke="currentColor"
			stroke-width="0.5"
		/>
	{/each}
	{#each axes as _, i (i)}
		{@const p = point(i, 1)}
		<line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="currentColor" stroke-width="0.5" />
	{/each}
	<polygon points={polyPoints} fill="rgba(201,168,76,0.18)" stroke="#c9a84c" stroke-width="1.2" />
	{#each axes as a, i (i)}
		{@const p = point(i, 1.12)}
		<text
			x={p.x}
			y={p.y}
			text-anchor="middle"
			dominant-baseline="middle"
			class="fill-mms-muted font-mms-sans text-[0.55rem] uppercase tracking-[0.08em]"
		>
			{a.label}
		</text>
	{/each}
</svg>
