<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { Pathname } from '$app/types';
	import { enhance } from '$app/forms';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';
	import SuperstoreFilterBar from '$lib/components/superstore/SuperstoreFilterBar.svelte';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const customersExportHref = $derived(
		resolvedLocalizedHref('/superstore/customers/export' as Pathname)
	);
	const customersExportJsonHref = $derived(`${customersExportHref}?format=json`);
	const customersExportCsvHref = $derived(`${customersExportHref}?format=csv`);
	const customersExportXlsxHref = $derived(`${customersExportHref}?format=xlsx`);

	let filterQuery = $state('');
	let filterStatus = $state<'all' | 'active' | 'pending'>('all');
	let filterLocation = $state('');

	const locations = $derived(
		[...new Set(data.customers.map((c) => c.location).filter((loc) => loc && loc !== '-'))].sort((a, b) =>
			a.localeCompare(b)
		)
	);

	const filteredCustomers = $derived(
		data.customers.filter((c) => {
			const q = filterQuery.trim().toLowerCase();
			if (q) {
				const hay = `${c.name} ${c.email}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			if (filterStatus !== 'all' && c.status !== filterStatus) return false;
			if (filterLocation && c.location !== filterLocation) return false;
			return true;
		})
	);

	const selectClass =
		'min-w-[8.5rem] rounded border border-mms-gold/25 bg-mms-ink2 px-2.5 py-1.5 text-[0.68rem] text-mms-cream focus:border-mms-gold focus:outline-none';
	const inputClass =
		'min-w-[12rem] flex-1 rounded border border-mms-gold/25 bg-mms-ink2 px-2.5 py-1.5 text-[0.68rem] text-mms-cream placeholder:text-mms-muted/70 focus:border-mms-gold focus:outline-none';

	function editHref(id: string) {
		return resolvedLocalizedHref(`/superstore/customers/${id}/edit` as Pathname);
	}
</script>

<svelte:head>
	<title>MMS Admin · Customers</title>
</svelte:head>

<div class="grid gap-px bg-mms-gold/10 sm:grid-cols-3">
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-mms-cream">
			{data.kpis.totalCustomers.toLocaleString()}
		</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Total customers</p>
	</div>
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-[#4CAF82]">
			{data.kpis.activeCustomers30d.toLocaleString()}
		</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Active (30d)</p>
	</div>
	<div class="bg-mms-ink2 px-5 py-4">
		<p class="font-mms-display text-[1.6rem] font-light text-mms-cream">{data.kpis.averageOrderValue}</p>
		<p class="mt-1 text-[0.58rem] tracking-[0.15em] text-mms-muted uppercase">Avg. order value</p>
	</div>
</div>

<div class="mt-8 bg-mms-ink2">
	{#if form?.importResult}
		<div
			class="mx-6 mt-4 rounded border border-emerald-500/25 bg-emerald-950/20 px-4 py-3 text-[0.72rem] leading-relaxed text-emerald-100"
		>
			Updated <strong>{form.importResult.updated}</strong> customer profile(s).
			{#if form.importResult.skipped > 0}
				<span class="text-mms-muted">
					Skipped <strong>{form.importResult.skipped}</strong> row(s) (email not found — import does not create accounts).
				</span>
			{/if}
			{#if form.importResult.errors.length > 0}
				<p class="mt-2 text-[0.65rem] text-amber-200/90">Issues:</p>
				<ul class="mt-1 max-h-40 list-inside list-disc overflow-y-auto text-[0.65rem] text-amber-100/85">
					{#each form.importResult.errors as err}
						<li>{err}</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
	<div class="flex flex-wrap items-center justify-between gap-4 border-b border-mms-gold/[0.06] px-6 py-5">
		<h2 class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Customer list</h2>
		<details class="group relative">
			<summary
				class="cursor-pointer list-none rounded border border-mms-gold/25 px-4 py-2 text-[0.6rem] tracking-[0.15em] text-mms-muted uppercase transition marker:content-none hover:border-mms-gold hover:text-mms-gold [&::-webkit-details-marker]:hidden"
			>
				Export / import
			</summary>
			<div
				class="absolute right-0 z-20 mt-2 w-[min(calc(100vw-3rem),24rem)] rounded border border-mms-gold/15 bg-mms-ink3 p-4 text-left shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
			>
				<p class="mb-3 text-[0.65rem] leading-relaxed text-mms-muted">
					<strong class="text-mms-cream">Export</strong> profile fields (no passwords). <strong class="text-mms-cream">Import</strong>
					updates existing customers matched by email (case-insensitive). Rows for unknown emails are skipped.
				</p>
				<div class="mb-4 grid grid-cols-3 gap-2">
					<a
						href={customersExportJsonHref}
						class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
					>
						JSON
					</a>
					<a
						href={customersExportCsvHref}
						class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
					>
						CSV
					</a>
					<a
						href={customersExportXlsxHref}
						class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
					>
						Excel
					</a>
				</div>
				<form method="POST" action="?/importCustomers" enctype="multipart/form-data" use:enhance>
					<span class="mb-2 block text-[0.55rem] uppercase tracking-[0.18em] text-mms-muted">Import profiles</span>
					<input
						name="file"
						type="file"
						accept="application/json,.json,text/csv,.csv,application/vnd.ms-excel,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
						required
						class="mb-3 w-full max-w-full text-[0.65rem] text-mms-muted file:mr-2 file:rounded file:border file:border-mms-gold/30 file:bg-mms-ink2 file:px-2 file:py-1 file:text-[0.58rem] file:text-mms-gold"
					/>
					<button
						type="submit"
						class="w-full rounded bg-mms-gold/15 py-2.5 text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold transition hover:bg-mms-gold/25"
					>
						Run import
					</button>
				</form>
			</div>
		</details>
	</div>
	{#if data.customers.length > 0}
		<SuperstoreFilterBar>
			<label class="flex min-w-[10rem] flex-1 flex-col gap-1">
				<span class="text-[0.55rem] tracking-[0.14em] text-mms-muted uppercase">Search</span>
				<input
					type="search"
					bind:value={filterQuery}
					placeholder="Name or email…"
					class={inputClass}
					autocomplete="off"
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-[0.55rem] tracking-[0.14em] text-mms-muted uppercase">Status</span>
				<select bind:value={filterStatus} class={selectClass}>
					<option value="all">All</option>
					<option value="active">Active</option>
					<option value="pending">Pending</option>
				</select>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-[0.55rem] tracking-[0.14em] text-mms-muted uppercase">Location</span>
				<select bind:value={filterLocation} class={selectClass}>
					<option value="">All</option>
					{#each locations as loc}
						<option value={loc}>{loc}</option>
					{/each}
				</select>
			</label>
			<p class="ml-auto self-center text-[0.65rem] text-mms-muted">
				{filteredCustomers.length} of {data.customers.length}
			</p>
		</SuperstoreFilterBar>
	{/if}
	<div class="overflow-x-auto">
		<table class="w-full min-w-[52rem] border-collapse text-left text-[0.75rem]">
			<thead>
				<tr class="border-b border-mms-gold/[0.06] bg-mms-gold/[0.03] text-[0.58rem] tracking-[0.18em] text-mms-muted uppercase">
					<th class="px-6 py-3">Customer</th>
					<th class="px-6 py-3">Email</th>
					<th class="px-6 py-3">Location</th>
					<th class="px-6 py-3">Orders</th>
					<th class="px-6 py-3">Total spent</th>
					<th class="px-6 py-3">Last order</th>
					<th class="px-6 py-3">Status</th>
					<th class="px-6 py-3">Action</th>
				</tr>
			</thead>
			<tbody class="text-mms-cream">
				{#if data.customers.length === 0}
					<tr>
						<td colspan="8" class="px-6 py-8 text-center text-mms-muted">No customer records yet.</td>
					</tr>
				{:else if filteredCustomers.length === 0}
					<tr>
						<td colspan="8" class="px-6 py-8 text-center text-mms-muted">No customers match the current filters.</td>
					</tr>
				{:else}
					{#each filteredCustomers as c (c.id)}
						<tr class="border-b border-mms-gold/[0.04] transition-colors hover:bg-mms-gold/[0.06]">
							<td class="px-6 py-3 font-medium">{c.name}</td>
							<td class="px-6 py-3 text-mms-muted">{c.email}</td>
							<td class="px-6 py-3 text-mms-muted">{c.location}</td>
							<td class="px-6 py-3">{c.orders}</td>
							<td class="px-6 py-3 text-mms-gold">{c.spent}</td>
							<td class="px-6 py-3 text-mms-muted">{c.last}</td>
							<td class="px-6 py-3"><SuperstoreStatusPill status={c.status} variant="customer" /></td>
							<td class="px-6 py-3">
								<a
									href={editHref(c.id)}
									class="inline-flex rounded border border-mms-gold/25 px-3 py-1.5 text-[0.6rem] tracking-[0.14em] text-mms-gold uppercase no-underline hover:border-mms-gold hover:bg-mms-gold/10"
								>
									Edit
								</a>
							</td>
						</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
