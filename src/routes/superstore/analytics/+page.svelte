<script lang="ts">
	import { analyticsBarLabels, analyticsBars, trafficDonut } from '$lib/superstore/mms-admin-demo-data';

	const barMax = Math.max(...analyticsBars);

	const cx = 55;
	const cy = 55;
	const r = 40;
	const innerR = 26;
	const donutTotal = trafficDonut.reduce((s, x) => s + x.v, 0);
	let donutAngle = -Math.PI / 2;
	const donutPaths = trafficDonut.map((seg) => {
		const sweep = (seg.v / donutTotal) * 2 * Math.PI;
		const x1 = cx + r * Math.cos(donutAngle);
		const y1 = cy + r * Math.sin(donutAngle);
		donutAngle += sweep;
		const x2 = cx + r * Math.cos(donutAngle);
		const y2 = cy + r * Math.sin(donutAngle);
		const large = sweep > Math.PI ? 1 : 0;
		return {
			d: `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
			color: seg.color,
			label: seg.label,
			pct: Math.round((seg.v / donutTotal) * 100)
		};
	});
</script>

<svelte:head>
	<title>MMS Admin · Analytics</title>
</svelte:head>

<div class="grid gap-px bg-mms-gold/10 sm:grid-cols-2 xl:grid-cols-4">
	<div class="relative bg-mms-ink2 p-6">
		<span class="absolute top-0 right-0 left-0 h-0.5 bg-mms-gold"></span>
		<div class="mb-4 flex size-9 items-center justify-center rounded-sm bg-mms-gold/10 text-mms-gold">
			<svg class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
			</svg>
		</div>
		<p class="font-mms-display text-[2rem] font-light text-mms-cream">3,842</p>
		<p class="mt-3 mb-2 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase">Page views / day</p>
		<p class="text-[0.68rem] text-[#4CAF82]">↑ 22% this week</p>
	</div>
	<div class="relative bg-mms-ink2 p-6">
		<span class="absolute top-0 right-0 left-0 h-0.5 bg-[#4CAF82]"></span>
		<div class="mb-4 flex size-9 items-center justify-center rounded-sm bg-[#4CAF82]/10 text-[#4CAF82]">
			<svg class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
			</svg>
		</div>
		<p class="font-mms-display text-[2rem] font-light text-mms-cream">4.2%</p>
		<p class="mt-3 mb-2 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase">Conversion rate</p>
		<p class="text-[0.68rem] text-[#4CAF82]">↑ 0.4% vs last week</p>
	</div>
	<div class="relative bg-mms-ink2 p-6">
		<span class="absolute top-0 right-0 left-0 h-0.5 bg-[#5A8AEF]"></span>
		<div class="mb-4 flex size-9 items-center justify-center rounded-sm bg-[#5A8AEF]/10 text-[#5A8AEF]">
			<svg class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
			</svg>
		</div>
		<p class="font-mms-display text-[2rem] font-light text-mms-cream">3m 42s</p>
		<p class="mt-3 mb-2 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase">Avg. session time</p>
		<p class="text-[0.68rem] text-[#4CAF82]">↑ 18s this week</p>
	</div>
	<div class="relative bg-mms-ink2 p-6">
		<span class="absolute top-0 right-0 left-0 h-0.5 bg-[#E05252]"></span>
		<div class="mb-4 flex size-9 items-center justify-center rounded-sm bg-[#E05252]/10 text-[#E05252]">
			<svg class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
				<polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
			</svg>
		</div>
		<p class="font-mms-display text-[2rem] font-light text-mms-cream">62%</p>
		<p class="mt-3 mb-2 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase">Bounce rate</p>
		<p class="text-[0.68rem] text-[#E05252]">↓ Needs attention</p>
	</div>
</div>

<div class="mt-8 grid gap-px bg-mms-gold/10 lg:grid-cols-2">
	<div class="bg-mms-ink2 p-6">
		<div class="mb-6">
			<p class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Top products by revenue</p>
			<p class="mt-1 text-[0.62rem] text-mms-muted">This month · demo</p>
		</div>
		<div class="flex h-[120px] items-end gap-1.5 pt-2">
			{#each analyticsBars as v, i (i)}
				<div class="flex h-full flex-1 flex-col items-center justify-end">
					<div class="flex h-full w-full items-end">
						<div
							class="w-full rounded-t-[1px] transition-all hover:brightness-125"
							style="height: {Math.round((v / barMax) * 100)}%; background: {i === 0
								? 'var(--color-mms-gold)'
								: 'rgba(201,168,76,0.28)'}"
						></div>
					</div>
				</div>
			{/each}
		</div>
		<div class="mt-1.5 flex justify-between gap-1">
			{#each analyticsBarLabels as lab (lab)}
				<span class="flex-1 text-center text-[0.52rem] text-mms-muted">{lab}</span>
			{/each}
		</div>
	</div>

	<div class="bg-mms-ink2 p-6">
		<div class="mb-6">
			<p class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Traffic sources</p>
			<p class="mt-1 text-[0.62rem] text-mms-muted">Last 30 days · demo</p>
		</div>
		<div class="flex flex-wrap items-center gap-8">
			<svg width="110" height="110" viewBox="0 0 110 110" class="shrink-0">
				{#each donutPaths as slice (slice.d)}
					<path d={slice.d} fill={slice.color} opacity="0.88" />
				{/each}
				<circle cx={cx} cy={cy} r={innerR} fill="var(--color-mms-ink2)" />
			</svg>
			<div class="flex min-w-[8rem] flex-1 flex-col gap-3">
				{#each donutPaths as slice (slice.label)}
					<div class="flex items-center gap-2 text-[0.7rem] text-mms-cream">
						<span class="size-2 shrink-0 rounded-full" style="background: {slice.color}"></span>
						{slice.label}
						<span class="ml-auto text-[0.68rem] text-mms-muted">{slice.pct}%</span>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
