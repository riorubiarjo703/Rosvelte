<script lang="ts">
	import type { Pathname } from '$app/types';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
	import {
		DEMO_KPIS,
		dashboardActivity,
		demoOrders
	} from '$lib/superstore/mms-admin-demo-data';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';

	function hrefFor(path: Pathname) {
		return resolvedLocalizedHref(path);
	}

	const recentOrders = demoOrders.slice(0, 4);

	const revenueBars = [42, 58, 51, 67, 73, 69, 88, 94];
	const revenueMonths = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
	const revenueMax = Math.max(...revenueBars);

	type DonutSeg = { label: string; v: number; color: string };
	const categorySegments: DonutSeg[] = [
		{ label: 'Scotch', v: 42, color: '#C9A84C' },
		{ label: 'Cognac', v: 22, color: '#8ABAEF' },
		{ label: 'Japanese', v: 18, color: '#9FE1CB' },
		{ label: 'Tequila', v: 11, color: '#F5C4B3' },
		{ label: 'Rum', v: 7, color: '#CECBF6' }
	];

	const donutTotal = categorySegments.reduce((s, x) => s + x.v, 0);
	const cx = 55;
	const cy = 55;
	const r = 40;
	const innerR = 26;

	let donutAngle = -Math.PI / 2;
	const donutPaths = categorySegments.map((s) => {
		const sweep = (s.v / donutTotal) * 2 * Math.PI;
		const x1 = cx + r * Math.cos(donutAngle);
		const y1 = cy + r * Math.sin(donutAngle);
		donutAngle += sweep;
		const x2 = cx + r * Math.cos(donutAngle);
		const y2 = cy + r * Math.sin(donutAngle);
		const large = sweep > Math.PI ? 1 : 0;
		return {
			d: `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
			color: s.color,
			label: s.label,
			pct: Math.round((s.v / donutTotal) * 100)
		};
	});
</script>

<div class="animate-mms-fade-up space-y-8">
	<!-- Commerce KPIs (MMS mock — swap DEMO_KPIS / fetch when backend exists) -->
	<div class="grid gap-px bg-mms-gold/10 sm:grid-cols-2 xl:grid-cols-4">
		<div class="group relative bg-mms-ink2 p-6 transition-colors hover:bg-mms-ink3">
			<span
				class="absolute top-0 right-0 left-0 h-0.5 bg-mms-gold opacity-0 transition-opacity group-hover:opacity-100"
			></span>
			<div
				class="mb-4 flex size-9 items-center justify-center rounded-sm bg-mms-gold/[0.08] text-mms-gold"
			>
				<svg class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<line x1="12" y1="1" x2="12" y2="23" />
					<path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
				</svg>
			</div>
			<p class="font-mms-display text-[2rem] font-light leading-none text-mms-cream">
				{DEMO_KPIS.totalRevenueDisplay}
			</p>
			<p class="mt-3 mb-2 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase">Total revenue</p>
			<p class="flex items-center gap-1 text-[0.68rem] text-[#4CAF82]">{DEMO_KPIS.totalRevenueTrend}</p>
		</div>

		<a
			href={hrefFor('/superstore/orders')}
			class="group relative bg-mms-ink2 p-6 transition-colors hover:bg-mms-ink3"
		>
			<span
				class="absolute top-0 right-0 left-0 h-0.5 bg-[#4CAF82] opacity-0 transition-opacity group-hover:opacity-100"
			></span>
			<div
				class="mb-4 flex size-9 items-center justify-center rounded-sm bg-[#4CAF82]/10 text-[#4CAF82]"
			>
				<svg class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path
						d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
					/>
				</svg>
			</div>
			<p class="font-mms-display text-[2rem] font-light leading-none text-mms-cream">
				{DEMO_KPIS.ordersThisMonth.toLocaleString()}
			</p>
			<p class="mt-3 mb-2 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase">Orders this month</p>
			<p class="text-[0.68rem] text-[#4CAF82]">{DEMO_KPIS.ordersTrend}</p>
		</a>

		<a
			href={hrefFor('/superstore/customers')}
			class="group relative bg-mms-ink2 p-6 transition-colors hover:bg-mms-ink3"
		>
			<span
				class="absolute top-0 right-0 left-0 h-0.5 bg-[#5A8AEF] opacity-0 transition-opacity group-hover:opacity-100"
			></span>
			<div
				class="mb-4 flex size-9 items-center justify-center rounded-sm bg-[#5A8AEF]/10 text-[#5A8AEF]"
			>
				<svg class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
					<circle cx="9" cy="7" r="4" />
					<path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
				</svg>
			</div>
			<p class="font-mms-display text-[2rem] font-light leading-none text-mms-cream">
				{DEMO_KPIS.activeCustomers.toLocaleString()}
			</p>
			<p class="mt-3 mb-2 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase">Active customers</p>
			<p class="text-[0.68rem] text-[#4CAF82]">{DEMO_KPIS.customersTrend}</p>
		</a>

		<a
			href={hrefFor('/superstore/inventory')}
			class="group relative bg-mms-ink2 p-6 transition-colors hover:bg-mms-ink3"
		>
			<span
				class="absolute top-0 right-0 left-0 h-0.5 bg-[#E05252] opacity-0 transition-opacity group-hover:opacity-100"
			></span>
			<div class="mb-4 flex size-9 items-center justify-center rounded-sm bg-[#E05252]/10 text-[#E05252]">
				<svg class="size-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
				</svg>
			</div>
			<p class="font-mms-display text-[2rem] font-light leading-none text-mms-cream">{DEMO_KPIS.outOfStock}</p>
			<p class="mt-3 mb-2 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase">Out of stock</p>
			<p class="text-[0.68rem] text-[#E05252]">{DEMO_KPIS.outOfStockTrend}</p>
		</a>
	</div>

	<p class="text-[0.72rem] text-mms-muted">
		Staff tools:
		<a href={hrefFor('/superstore/tasks')} class="text-mms-gold underline-offset-4 hover:underline">Tasks</a>
		·
		<a href={hrefFor('/superstore/uploads')} class="text-mms-gold underline-offset-4 hover:underline">Uploads</a>
	</p>

	<!-- Charts row -->
	<div class="grid gap-px bg-mms-gold/10 lg:grid-cols-[2fr_1fr]">
		<div class="bg-mms-ink2 p-6">
			<div class="mb-6 flex flex-wrap items-start justify-between gap-3">
				<div>
					<p class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Revenue overview</p>
					<p class="mt-1 text-[0.62rem] text-mms-muted">Last 8 months · demo data</p>
				</div>
				<a
					href={hrefFor('/superstore/analytics')}
					class="text-[0.6rem] tracking-[0.15em] text-mms-gold-dim uppercase transition-colors hover:text-mms-gold"
				>
					View report →
				</a>
			</div>
			<div class="flex h-[120px] items-end gap-1.5 pt-2">
				{#each revenueBars as v, i (i)}
					<div class="flex h-full flex-1 flex-col items-center justify-end gap-1">
						<div class="flex h-full w-full items-end">
							<div
								class="w-full rounded-t-[1px] transition-all hover:brightness-125"
								style="height: {Math.round((v / revenueMax) * 100)}%; background: {i === revenueBars.length - 1
									? 'var(--color-mms-gold)'
									: 'rgba(201,168,76,0.28)'}"
							></div>
						</div>
					</div>
				{/each}
			</div>
			<div class="mt-1.5 flex justify-between">
				{#each revenueMonths as m (m)}
					<span class="flex-1 text-center text-[0.52rem] tracking-wide text-mms-muted">{m}</span>
				{/each}
			</div>
		</div>

		<div class="bg-mms-ink2 p-6">
			<div class="mb-6">
				<p class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Sales by category</p>
				<p class="mt-1 text-[0.62rem] text-mms-muted">This month · demo</p>
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

	<!-- Recent orders + activity -->
	<div class="grid gap-px bg-mms-gold/10 lg:grid-cols-2">
		<div class="bg-mms-ink2 p-6">
			<div class="mb-6 flex flex-wrap items-start justify-between gap-3">
				<div>
					<p class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Recent orders</p>
					<p class="mt-1 text-[0.62rem] text-mms-muted">Last 24 hours · demo</p>
				</div>
				<a
					href={hrefFor('/superstore/orders')}
					class="text-[0.6rem] tracking-[0.15em] text-mms-gold-dim uppercase transition-colors hover:text-mms-gold"
				>
					All orders →
				</a>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full min-w-[22rem] border-collapse text-left">
					<thead>
						<tr
							class="border-b border-mms-gold/[0.06] bg-mms-gold/[0.03] text-[0.58rem] tracking-[0.18em] text-mms-muted uppercase"
						>
							<th class="px-4 py-3">Order ID</th>
							<th class="px-4 py-3">Customer</th>
							<th class="px-4 py-3">Product</th>
							<th class="px-4 py-3">Total</th>
							<th class="px-4 py-3">Status</th>
						</tr>
					</thead>
					<tbody class="text-[0.75rem] text-mms-cream">
						{#each recentOrders as o (o.id)}
							<tr class="border-b border-mms-gold/[0.04] transition-colors hover:bg-mms-gold/[0.06]">
								<td class="px-4 py-3 font-mms-display text-mms-gold">{o.id}</td>
								<td class="px-4 py-3">{o.customer}</td>
								<td class="max-w-[140px] truncate px-4 py-3">{o.product}</td>
								<td class="px-4 py-3 text-mms-gold">{o.total}</td>
								<td class="px-4 py-3"><SuperstoreStatusPill status={o.status} variant="order" /></td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<div class="bg-mms-ink2 p-6">
			<div class="mb-6">
				<p class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Activity feed</p>
				<p class="mt-1 text-[0.62rem] text-mms-muted">Live updates · demo</p>
			</div>
			<div class="flex flex-col">
				{#each dashboardActivity as item (item.time)}
					<div
						class="flex cursor-default gap-4 border-b border-mms-gold/[0.04] px-1 py-4 transition-colors last:border-0 hover:bg-mms-gold/[0.06]"
					>
						<div class="mt-1 size-2 shrink-0 rounded-full" style="background: {item.color}"></div>
						<div class="min-w-0 flex-1">
							<p class="text-[0.75rem] text-mms-cream">{@html item.html}</p>
							<p class="mt-1 text-[0.62rem] text-mms-muted">{item.time}</p>
						</div>
						{#if item.amt}
							<span class="font-mms-display pt-0.5 text-[0.8rem] text-mms-cream">{item.amt}</span>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
