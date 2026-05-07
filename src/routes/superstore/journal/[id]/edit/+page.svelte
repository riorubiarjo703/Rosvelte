<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { Pathname } from '$app/types';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';
	import { JOURNAL_CATEGORY_TABS } from '$lib/data/mms-journal';

	type FieldErrors = Partial<Record<string, string[] | undefined>>;

	let { data, form }: { data: PageData; form?: ActionData } = $props();

	const fe = $derived((form?.errors as FieldErrors | undefined) ?? {});

	function hrefFor(path: Pathname) {
		return resolvedLocalizedHref(path);
	}

	const categoryTabs = $derived(JOURNAL_CATEGORY_TABS.filter((t) => t.id !== 'all'));

	const statuses = [
		{ v: 'active', l: 'Active (live on site)' },
		{ v: 'pending', l: 'Pending' },
		{ v: 'out', l: 'Draft / unpublished' }
	] as const;
</script>

<svelte:head>
	<title>MMS Admin · Edit journal · {data.fields.title.slice(0, 48)}{data.fields.title.length > 48 ? '…' : ''}</title>
</svelte:head>

<div class="border-b border-mms-gold/[0.06] px-6 py-4">
	<a
		href={hrefFor('/superstore/journal')}
		class="text-[0.65rem] uppercase tracking-[0.16em] text-mms-muted no-underline transition hover:text-mms-gold"
		>← Journal list</a>
</div>

{#if form?.message}
	<p class="border-b border-mms-gold/[0.06] px-6 py-3 text-[0.72rem] text-red-400">{form.message}</p>
{/if}

<form method="POST" action="?/updatePost" class="space-y-px bg-mms-gold/10 relative">
	<input type="hidden" name="id" value={data.fields.id} />

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-6 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Story
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<p class="mb-4 text-[0.65rem] text-mms-muted">
			Legacy seed id <span class="text-mms-gold">{data.fields.legacyArticleId}</span> · slug{' '}
			<code class="text-mms-gold/90">{data.fields.slug}</code>
		</p>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="md:col-span-2 flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="title">Title</label>
				<input
					id="title"
					name="title"
					required
					value={data.fields.title}
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.title}<span class="text-[0.65rem] text-red-400">{fe.title.join(', ')}</span>{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="cat">Category</label>
				<select
					id="cat"
					name="cat"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				>
					{#each categoryTabs as tab (tab.id)}
						<option value={tab.id} selected={data.fields.cat === tab.id}>{tab.label}</option>
					{/each}
				</select>
				{#if fe.cat}<span class="text-[0.65rem] text-red-400">{fe.cat.join(', ')}</span>{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="author">Author</label>
				<input
					id="author"
					name="author"
					required
					value={data.fields.author}
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.author}<span class="text-[0.65rem] text-red-400">{fe.author.join(', ')}</span>{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="adminDateDisplay"
					>Display date</label
				>
				<input
					id="adminDateDisplay"
					name="adminDateDisplay"
					required
					value={data.fields.adminDateDisplay}
					placeholder="28 Apr 2025"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.adminDateDisplay}<span class="text-[0.65rem] text-red-400">{fe.adminDateDisplay.join(', ')}</span
					>{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="readTime">Read time</label>
				<input
					id="readTime"
					name="readTime"
					required
					value={data.fields.readTime}
					placeholder="12 min"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.readTime}<span class="text-[0.65rem] text-red-400">{fe.readTime.join(', ')}</span>{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="viewsCount">Views (admin)</label>
				<input
					id="viewsCount"
					name="viewsCount"
					type="number"
					min="0"
					required
					value={data.fields.viewsCount}
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.viewsCount}<span class="text-[0.65rem] text-red-400">{fe.viewsCount.join(', ')}</span>{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="status">Status</label>
				<select
					id="status"
					name="status"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				>
					{#each statuses as st (st.v)}
						<option value={st.v} selected={data.fields.status === st.v}>{st.l}</option>
					{/each}
				</select>
				{#if fe.status}<span class="text-[0.65rem] text-red-400">{fe.status.join(', ')}</span>{/if}
			</div>

			<div class="md:col-span-2 flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="tags">Tags (comma-separated)</label>
				<input
					id="tags"
					name="tags"
					value={data.fields.tags}
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.tags}<span class="text-[0.65rem] text-red-400">{fe.tags.join(', ')}</span>{/if}
			</div>

			<div class="md:col-span-2 flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="excerpt">Excerpt</label>
				<textarea
					id="excerpt"
					name="excerpt"
					required
					rows="5"
					value={data.fields.excerpt}
					class="resize-y border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				></textarea>
				{#if fe.excerpt}<span class="text-[0.65rem] text-red-400">{fe.excerpt.join(', ')}</span>{/if}
			</div>

			<div class="flex flex-wrap gap-6 md:col-span-2">
				<label class="flex cursor-pointer items-center gap-2 text-[0.72rem] text-mms-cream">
					<input type="checkbox" name="featured" class="accent-mms-gold" checked={data.fields.featured} />
					Featured (hero on /journal)
				</label>
				<label class="flex cursor-pointer items-center gap-2 text-[0.72rem] text-mms-cream">
					<input type="checkbox" name="wide" class="accent-mms-gold" checked={data.fields.wide} />
					Wide card (grid)
				</label>
			</div>
		</div>
	</section>

	<div class="flex flex-wrap items-center justify-between gap-3 bg-mms-ink2 p-6">
		<button
			type="submit"
			class="rounded bg-mms-gold px-5 py-2.5 text-[0.6rem] font-medium tracking-[0.14em] text-mms-ink uppercase transition hover:bg-mms-gold-light"
		>
			Save changes
		</button>
	</div>
</form>

<form
	method="POST"
	action="?/deletePost"
	class="mt-4 border-t border-mms-gold/[0.08] px-6 py-6"
	onsubmit={(e) => {
		if (!confirm('Delete this journal post from the database?')) e.preventDefault();
	}}
>
	<input type="hidden" name="id" value={data.fields.id} />
	<button
		type="submit"
		class="rounded border border-red-500/40 px-4 py-2 text-[0.58rem] uppercase tracking-[0.14em] text-red-400 transition hover:bg-red-950/40"
	>
		Delete post
	</button>
</form>
