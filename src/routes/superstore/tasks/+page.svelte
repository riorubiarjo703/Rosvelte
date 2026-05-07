<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import SuperstoreTaskTable from '$lib/components/superstore/SuperstoreTaskTable.svelte';
	import type { SuperstoreTaskRow } from '$lib/components/superstore/SuperstoreTaskTable.svelte';
	import { Button } from 'bits-ui';
	import { Dialog } from 'bits-ui';
	import { Label } from 'bits-ui';

	let { data, form } = $props();

	let createOpen = $state(false);
	let editOpen = $state(false);
	let editTask = $state<SuperstoreTaskRow | null>(null);

	function openEdit(t: SuperstoreTaskRow) {
		editTask = t;
		editOpen = true;
	}

	function onEditOpenChange(open: boolean) {
		editOpen = open;
		if (!open) editTask = null;
	}

	function searchParamsWith(updates: Record<string, string>) {
		const p = new SvelteURLSearchParams(page.url.searchParams);
		for (const [k, v] of Object.entries(updates)) {
			p.set(k, v);
		}
		return `?${p.toString()}`;
	}
</script>

<svelte:head>
	<title>Superstore · Tasks</title>
</svelte:head>

<div class="flex flex-wrap items-end justify-between gap-4">
	<div>
		<h1 class="font-mms-display text-3xl font-semibold text-mms-cream">Tasks</h1>
		<p class="mt-1 text-sm text-mms-muted">Server pagination, Zod actions, TanStack Table core.</p>
	</div>
	<Dialog.Root bind:open={createOpen}>
		<Dialog.Trigger
			class="inline-flex cursor-pointer rounded-md bg-mms-gold px-4 py-2 text-sm font-medium text-mms-ink hover:bg-mms-gold-light"
		>
			New task
		</Dialog.Trigger>
		<Dialog.Portal>
			<Dialog.Overlay class="fixed inset-0 z-50 bg-black/40" />
			<Dialog.Content
				class="fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-mms-gold/15 bg-mms-ink2 p-6 shadow-xl outline-none"
			>
				<Dialog.Title class="font-mms-display text-xl font-semibold text-mms-cream"
					>New task</Dialog.Title
				>
				<Dialog.Description class="mt-1 text-sm text-mms-muted"
					>Add a row to the demo <code class="text-xs">task</code> table.</Dialog.Description
				>
				<form method="post" action="?/createTask" class="mt-4 space-y-4" use:enhance>
					<div>
						<Label.Root for="new-title" class="text-sm font-medium text-mms-cream">Title</Label.Root>
						<input
							id="new-title"
							name="title"
							required
							class="mt-1 w-full rounded-md border border-mms-gold/20 bg-mms-ink3 px-3 py-2 text-sm text-mms-cream placeholder:text-mms-muted"
						/>
						{#if form?.errors?.title}
							<p class="mt-1 text-xs text-red-600">{form.errors.title[0]}</p>
						{/if}
					</div>
					<div>
						<Label.Root for="new-priority" class="text-sm font-medium text-mms-cream"
							>Priority (1–5)</Label.Root
						>
						<input
							id="new-priority"
							name="priority"
							type="number"
							min="1"
							max="5"
							value="1"
							class="mt-1 w-full rounded-md border border-mms-gold/20 bg-mms-ink3 px-3 py-2 text-sm text-mms-cream placeholder:text-mms-muted"
						/>
						{#if form?.errors?.priority}
							<p class="mt-1 text-xs text-red-600">{form.errors.priority[0]}</p>
						{/if}
					</div>
					<div class="flex justify-end gap-2 pt-2">
						<Dialog.Close
							class="rounded-md border border-mms-gold/20 bg-mms-ink2 px-4 py-2 text-sm text-mms-cream hover:bg-mms-gold/[0.06]"
						>
							Cancel
						</Dialog.Close>
						<Button.Root
							type="submit"
							class="rounded-md bg-mms-gold px-4 py-2 text-sm font-medium text-mms-ink hover:bg-mms-gold-light"
						>
							Create
						</Button.Root>
					</div>
				</form>
			</Dialog.Content>
		</Dialog.Portal>
	</Dialog.Root>
</div>

{#if data.invalidQuery}
	<p class="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
		Invalid query params; using defaults.
	</p>
{/if}

<form method="get" class="mt-6 flex flex-wrap items-end gap-3">
	<div>
		<Label.Root for="q" class="text-xs font-medium text-mms-muted">Search title</Label.Root>
		<input
			id="q"
			name="q"
			value={data.q}
			class="mt-1 rounded-md border border-mms-gold/20 bg-mms-ink3 px-3 py-2 text-sm text-mms-cream placeholder:text-mms-muted"
			placeholder="Contains…"
		/>
	</div>
	<input type="hidden" name="pageSize" value={data.pageSize} />
	<input type="hidden" name="sort" value={data.sort} />
	<input type="hidden" name="order" value={data.order} />
	<Button.Root
		type="submit"
		class="rounded-md border border-mms-gold/20 bg-mms-ink3 px-4 py-2 text-sm text-mms-cream hover:border-mms-gold/35 hover:bg-mms-gold/[0.06]"
	>
		Apply
	</Button.Root>
</form>

<div class="mt-6">
	<SuperstoreTaskTable tasks={data.tasks} sort={data.sort} order={data.order}>
		{#snippet actionsCell(t)}
			<button
				type="button"
				class="rounded-md border border-mms-gold/20 bg-mms-ink2 px-3 py-1.5 text-xs font-medium text-mms-cream hover:bg-mms-gold/[0.06]"
				onclick={() => openEdit(t)}
			>
				Edit
			</button>

			<form method="post" action="?/deleteTask" use:enhance>
				<input type="hidden" name="id" value={t.id} />
				<Button.Root
					type="submit"
					class="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
				>
					Delete
				</Button.Root>
			</form>
		{/snippet}
	</SuperstoreTaskTable>
</div>

<Dialog.Root open={editOpen} onOpenChange={onEditOpenChange}>
	<Dialog.Portal>
		<Dialog.Overlay class="fixed inset-0 z-50 bg-black/40" />
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-50 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-mms-gold/15 bg-mms-ink2 p-6 shadow-xl outline-none"
		>
			<Dialog.Title class="font-mms-display text-xl font-semibold text-mms-cream"
				>Edit task</Dialog.Title
			>
			{#if editTask}
				{#key editTask.id}
					<form method="post" action="?/updateTask" class="mt-4 space-y-4" use:enhance>
						<input type="hidden" name="id" value={editTask.id} />
						<div>
							<Label.Root for="ed-title" class="text-sm font-medium text-mms-cream">Title</Label.Root
							>
							<input
								id="ed-title"
								name="title"
								value={editTask.title}
								class="mt-1 w-full rounded-md border border-mms-gold/20 bg-mms-ink3 px-3 py-2 text-sm text-mms-cream placeholder:text-mms-muted"
							/>
						</div>
						<div>
							<Label.Root for="ed-priority" class="text-sm font-medium text-mms-cream"
								>Priority</Label.Root
							>
							<input
								id="ed-priority"
								name="priority"
								type="number"
								min="1"
								max="5"
								value={editTask.priority}
								class="mt-1 w-full rounded-md border border-mms-gold/20 bg-mms-ink3 px-3 py-2 text-sm text-mms-cream placeholder:text-mms-muted"
							/>
						</div>
						<div class="flex justify-end gap-2 pt-2">
							<Dialog.Close
								class="rounded-md border border-mms-gold/20 bg-mms-ink2 px-4 py-2 text-sm text-mms-cream hover:bg-mms-gold/[0.06]"
							>
								Cancel
							</Dialog.Close>
							<Button.Root
								type="submit"
								class="rounded-md bg-mms-gold px-4 py-2 text-sm font-medium text-mms-ink hover:bg-mms-gold-light"
							>
								Save
							</Button.Root>
						</div>
					</form>
				{/key}
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

{#if data.pageCount > 1}
	<nav class="mt-6 flex flex-wrap items-center gap-2 text-sm" aria-label="Pagination">
		{#if data.page > 1}
			<Button.Root
				href={searchParamsWith({ page: String(data.page - 1) })}
				class="rounded-md border border-mms-gold/20 bg-mms-ink2 px-3 py-2 text-mms-cream hover:bg-mms-gold/[0.06]"
			>
				Previous
			</Button.Root>
		{/if}
		<span class="text-mms-muted">
			Page {data.page} of {data.pageCount} ({data.total} tasks)
		</span>
		{#if data.page < data.pageCount}
			<Button.Root
				href={searchParamsWith({ page: String(data.page + 1) })}
				class="rounded-md border border-mms-gold/20 bg-mms-ink2 px-3 py-2 text-mms-cream hover:bg-mms-gold/[0.06]"
			>
				Next
			</Button.Root>
		{/if}
	</nav>
{/if}
