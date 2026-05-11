<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { Pathname } from '$app/types';
	import { enhance } from '$app/forms';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';
	import SuperstoreFilterBar from '$lib/components/superstore/SuperstoreFilterBar.svelte';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const journalExportHref = $derived(
		resolvedLocalizedHref('/superstore/journal/export' as Pathname)
	);
	const journalExportJsonHref = $derived(`${journalExportHref}?format=json`);
	const journalExportCsvHref = $derived(`${journalExportHref}?format=csv`);
	const journalExportXlsxHref = $derived(`${journalExportHref}?format=xlsx`);

	let filterQuery = $state('');
	let filterCategory = $state('');
	let filterStatus = $state<'all' | 'active' | 'pending' | 'out'>('all');

	const categories = $derived(
		[...new Set(data.journalPosts.map((j) => j.category))].sort((a, b) => a.localeCompare(b))
	);

	const filteredJournalPosts = $derived(
		data.journalPosts.filter((j) => {
			const q = filterQuery.trim().toLowerCase();
			if (q) {
				const hay = `${j.title} ${j.author} ${j.category}`.toLowerCase();
				if (!hay.includes(q)) return false;
			}
			if (filterCategory && j.category !== filterCategory) return false;
			if (filterStatus !== 'all' && j.status !== filterStatus) return false;
			return true;
		})
	);

	const selectClass =
		'min-w-[8.5rem] rounded border border-mms-gold/25 bg-mms-ink2 px-2.5 py-1.5 text-[0.68rem] text-mms-cream focus:border-mms-gold focus:outline-none';
	const inputClass =
		'min-w-[12rem] flex-1 rounded border border-mms-gold/25 bg-mms-ink2 px-2.5 py-1.5 text-[0.68rem] text-mms-cream placeholder:text-mms-muted/70 focus:border-mms-gold focus:outline-none';

	function editJournalHref(id: number) {
		return resolvedLocalizedHref(`/superstore/journal/${id}/edit` as Pathname);
	}
</script>

<svelte:head>
	<title>MMS Admin · Journal</title>
</svelte:head>

<div class="bg-mms-ink2">
	{#if form?.message}
		<p class="border-b border-mms-gold/[0.06] px-6 py-3 text-[0.72rem] text-red-400">{form.message}</p>
	{/if}
	{#if form?.importResult}
		<div
			class="mx-6 mt-4 rounded border border-emerald-500/25 bg-emerald-950/20 px-4 py-3 text-[0.72rem] leading-relaxed text-emerald-100"
		>
			Imported <strong>{form.importResult.created}</strong> new and updated <strong>{form.importResult.updated}</strong> by
			legacy article id.
			{#if form.importResult.errors.length > 0}
				<p class="mt-2 text-[0.65rem] text-amber-200/90">Some rows failed:</p>
				<ul class="mt-1 max-h-40 list-inside list-disc overflow-y-auto text-[0.65rem] text-amber-100/85">
					{#each form.importResult.errors as err}
						<li>{err}</li>
					{/each}
				</ul>
			{/if}
		</div>
	{/if}
	<div class="flex flex-wrap items-center justify-between gap-4 border-b border-mms-gold/[0.06] px-6 py-5">
		<h2 class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Journal posts</h2>
		<div class="flex flex-wrap items-center gap-2">
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
						<strong class="text-mms-cream">Export</strong> full post metadata. <strong class="text-mms-cream">Import</strong>
						merges by <code class="text-mms-gold/90">legacyArticleId</code>. CSV column
						<code class="text-mms-gold/90">tagsJson</code> is a JSON array or comma-separated list.
					</p>
					<div class="mb-4 grid grid-cols-3 gap-2">
						<a
							href={journalExportJsonHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							JSON
						</a>
						<a
							href={journalExportCsvHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							CSV
						</a>
						<a
							href={journalExportXlsxHref}
							class="rounded border border-mms-gold/35 py-2 text-center text-[0.55rem] uppercase tracking-[0.16em] text-mms-gold no-underline transition hover:bg-mms-gold/10"
						>
							Excel
						</a>
					</div>
					<form method="POST" action="?/importJournal" enctype="multipart/form-data" use:enhance>
						<span class="mb-2 block text-[0.55rem] uppercase tracking-[0.18em] text-mms-muted">Import merge</span>
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
			<button
				type="button"
				class="rounded bg-mms-gold px-4 py-2 text-[0.6rem] font-medium tracking-[0.12em] text-mms-ink uppercase hover:bg-mms-gold-light"
				disabled
			>
				+ New post
			</button>
		</div>
	</div>
	{#if data.journalPosts.length > 0}
		<SuperstoreFilterBar>
			<label class="flex min-w-[10rem] flex-1 flex-col gap-1">
				<span class="text-[0.55rem] tracking-[0.14em] text-mms-muted uppercase">Search</span>
				<input
					type="search"
					bind:value={filterQuery}
					placeholder="Title, author, category…"
					class={inputClass}
					autocomplete="off"
				/>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-[0.55rem] tracking-[0.14em] text-mms-muted uppercase">Category</span>
				<select bind:value={filterCategory} class={selectClass}>
					<option value="">All</option>
					{#each categories as cat}
						<option value={cat}>{cat}</option>
					{/each}
				</select>
			</label>
			<label class="flex flex-col gap-1">
				<span class="text-[0.55rem] tracking-[0.14em] text-mms-muted uppercase">Status</span>
				<select bind:value={filterStatus} class={selectClass}>
					<option value="all">All</option>
					<option value="active">Active</option>
					<option value="pending">Pending</option>
					<option value="out">Out / hidden</option>
				</select>
			</label>
			<p class="ml-auto self-center text-[0.65rem] text-mms-muted">
				{filteredJournalPosts.length} of {data.journalPosts.length}
			</p>
		</SuperstoreFilterBar>
	{/if}
	<div class="overflow-x-auto">
		<table class="w-full min-w-[48rem] border-collapse text-left text-[0.75rem]">
			<thead>
				<tr class="border-b border-mms-gold/[0.06] bg-mms-gold/[0.03] text-[0.58rem] tracking-[0.18em] text-mms-muted uppercase">
					<th class="px-6 py-3">Title</th>
					<th class="px-6 py-3">Category</th>
					<th class="px-6 py-3">Author</th>
					<th class="px-6 py-3">Date</th>
					<th class="px-6 py-3">Views</th>
					<th class="px-6 py-3">Status</th>
					<th class="px-6 py-3">Action</th>
				</tr>
			</thead>
			<tbody class="text-mms-cream">
				{#if data.journalPosts.length > 0 && filteredJournalPosts.length === 0}
					<tr>
						<td colspan="7" class="px-6 py-8 text-center text-mms-muted">No posts match the current filters.</td>
					</tr>
				{:else}
					{#each filteredJournalPosts as j (j.id)}
					<tr class="border-b border-mms-gold/[0.04] transition-colors hover:bg-mms-gold/[0.06]">
						<td class="max-w-[14rem] px-6 py-3 font-medium">{j.title}</td>
						<td class="px-6 py-3 text-[0.7rem] text-mms-muted">{j.category}</td>
						<td class="px-6 py-3 text-mms-muted">{j.author}</td>
						<td class="px-6 py-3 text-mms-muted">{j.date}</td>
						<td class="px-6 py-3 font-mms-display text-mms-gold">{j.views}</td>
						<td class="px-6 py-3"><SuperstoreStatusPill status={j.status} variant="journal" /></td>
						<td class="px-6 py-3">
							<div class="flex gap-1">
								<a
									href={editJournalHref(j.id)}
									class="flex size-[26px] items-center justify-center rounded border border-mms-gold/10 bg-transparent transition-colors hover:border-mms-gold"
									aria-label="Edit journal post"
								>
									<svg class="size-3 text-mms-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
										<path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
										<path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
									</svg>
								</a>
								<form
									method="POST"
									action="?/deleteJournalPost"
									use:enhance
									onsubmit={(e) => {
										if (!confirm('Delete this journal post?')) e.preventDefault();
									}}
								>
									<input type="hidden" name="id" value={j.id} />
									<button
										type="submit"
										class="flex size-[26px] items-center justify-center rounded border border-mms-gold/10 bg-transparent transition-colors hover:border-red-400"
										aria-label="Delete journal post"
									>
										<svg class="size-3 text-mms-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
											<polyline points="3 6 5 6 21 6" />
											<path d="M19 6l-1 14H6L5 6M10 11v6M14 11v6M9 6V4h6v2" />
										</svg>
									</button>
								</form>
							</div>
						</td>
					</tr>
					{/each}
				{/if}
			</tbody>
		</table>
	</div>
</div>
