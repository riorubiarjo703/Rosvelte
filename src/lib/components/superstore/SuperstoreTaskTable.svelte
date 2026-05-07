<script lang="ts" module>
	export type SuperstoreTaskRow = { id: number; title: string; priority: number };
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { createTable, getCoreRowModel, createColumnHelper } from '@tanstack/table-core';
	import type { Pathname } from '$app/types';
	import { goto } from '$app/navigation';
	import { resolvedPath } from '$lib/paraglide-resolved-href';
	import { page } from '$app/state';

	let {
		tasks,
		sort,
		order,
		actionsCell
	}: {
		tasks: SuperstoreTaskRow[];
		sort: string;
		order: 'asc' | 'desc';
		actionsCell: Snippet<[SuperstoreTaskRow]>;
	} = $props();

	const columnHelper = createColumnHelper<SuperstoreTaskRow>();

	const columns = [
		columnHelper.accessor('id', { header: 'ID' }),
		columnHelper.accessor('title', { header: 'Title' }),
		columnHelper.accessor('priority', { header: 'Priority' }),
		columnHelper.display({ id: 'actions', header: '' })
	];

	const table = $derived.by(() =>
		createTable({
			data: tasks,
			columns,
			state: {
				sorting: [{ id: sort, desc: order === 'desc' }]
			},
			onStateChange: () => {},
			renderFallbackValue: () => '',
			getCoreRowModel: getCoreRowModel(),
			manualSorting: true
		})
	);

	function toggleSort(columnId: string) {
		const u = new URL(page.url.href);
		if (u.searchParams.get('sort') === columnId) {
			u.searchParams.set('order', u.searchParams.get('order') === 'asc' ? 'desc' : 'asc');
		} else {
			u.searchParams.set('sort', columnId);
			u.searchParams.set('order', 'asc');
		}
		u.searchParams.set('page', '1');
		const path = u.pathname as Pathname;
		// resolve() only accepts pathname; query is appended for sort/pagination.
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- see above
		void goto(resolvedPath(path) + u.search);
	}
</script>

<div class="overflow-x-auto rounded-lg border border-mms-gold/10 bg-mms-ink2 shadow-sm">
	<table class="w-full min-w-[32rem] border-collapse text-left text-sm text-mms-cream">
		<thead
			class="border-b border-mms-gold/[0.06] bg-mms-gold/[0.03] text-xs font-semibold tracking-wide text-mms-muted uppercase"
		>
			{#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
				<tr>
					{#each headerGroup.headers as header (header.id)}
						<th class="px-4 py-3">
							{#if header.column.id === 'actions'}
								<span class="sr-only">Actions</span>
							{:else}
								<button
									type="button"
									class="inline-flex items-center gap-1 rounded-md px-1 py-0.5 hover:bg-mms-gold/15"
									onclick={() => toggleSort(header.column.id)}
								>
									{typeof header.column.columnDef.header === 'string'
										? header.column.columnDef.header
										: header.column.id}
									{#if sort === header.column.id}
										<span aria-hidden="true">{order === 'asc' ? '↑' : '↓'}</span>
									{/if}
								</button>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody class="divide-y divide-mms-gold/[0.06]">
			{#each table.getRowModel().rows as row (row.id)}
				<tr class="transition-colors hover:bg-mms-gold/[0.06]">
					{#each row.getVisibleCells() as cell (cell.id)}
						<td class="px-4 py-3 align-middle">
							{#if cell.column.id === 'actions'}
								<div class="flex flex-wrap gap-2">
									{@render actionsCell(row.original)}
								</div>
							{:else}
								{cell.getValue() as string | number}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
