<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { Pathname } from '$app/types';
	import { enhance } from '$app/forms';
	import { resolvedLocalizedHref } from '$lib/paraglide/resolved-href';
	import SuperstoreStatusPill from '$lib/components/superstore/SuperstoreStatusPill.svelte';

	let { data, form }: { data: PageData; form?: ActionData } = $props();

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
	<div class="flex flex-wrap items-center justify-between gap-4 border-b border-mms-gold/[0.06] px-6 py-5">
		<h2 class="text-[0.75rem] font-medium tracking-wide text-mms-cream">Journal posts</h2>
		<button
			type="button"
			class="rounded bg-mms-gold px-4 py-2 text-[0.6rem] font-medium tracking-[0.12em] text-mms-ink uppercase hover:bg-mms-gold-light"
			disabled
		>
			+ New post
		</button>
	</div>
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
				{#each data.journalPosts as j (j.id)}
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
			</tbody>
		</table>
	</div>
</div>
