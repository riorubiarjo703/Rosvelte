<script lang="ts">
	import type { Pathname } from '$app/types';
	import { enhance } from '$app/forms';
	import { Button } from 'bits-ui';
	import { Label } from 'bits-ui';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';

	let { data, form } = $props();

	function fileHref(id: number) {
		return resolvedLocalizedHref(`/superstore/uploads/${id}` as Pathname);
	}
</script>

<svelte:head>
	<title>Superstore · Uploads</title>
</svelte:head>

<h1 class="font-mms-display text-3xl font-semibold text-mms-cream">Uploads</h1>
<p class="mt-2 max-w-2xl text-sm text-mms-muted">
	Files are stored on disk (see <code class="text-xs">SUPERSTORE_UPLOAD_DIR</code>) and downloaded
	only when signed in with Superstore access.
</p>

<section class="mt-8 rounded-xl border border-mms-gold/10 bg-mms-ink2 p-6 shadow-sm">
	<h2 class="text-sm font-semibold tracking-wide text-mms-muted uppercase">Upload</h2>
	<form
		method="post"
		action="?/upload"
		enctype="multipart/form-data"
		class="mt-4 space-y-4"
		use:enhance
	>
		<div>
			<Label.Root for="file" class="text-sm font-medium text-mms-cream">File</Label.Root>
			<input
				id="file"
				name="file"
				type="file"
				accept="image/jpeg,image/png,image/webp,application/pdf"
				class="mt-1 block w-full text-sm text-mms-cream file:mr-3 file:rounded-md file:border-0 file:bg-mms-gold file:px-3 file:py-2 file:text-mms-ink file:hover:bg-mms-gold-light"
			/>
		</div>
		{#if form?.message}
			<p class="text-sm text-red-600">{form.message}</p>
		{/if}
		<Button.Root
			type="submit"
			class="rounded-md bg-mms-gold px-4 py-2 text-sm font-medium text-mms-ink hover:bg-mms-gold-light"
		>
			Upload
		</Button.Root>
	</form>
</section>

<section class="mt-8">
	<h2 class="text-sm font-semibold tracking-wide text-mms-muted uppercase">Recent</h2>
	<div class="mt-4 overflow-x-auto rounded-lg border border-mms-gold/10 bg-mms-ink2 shadow-sm">
		<table class="w-full min-w-[40rem] border-collapse text-left text-sm text-mms-cream">
			<thead
				class="border-b border-mms-gold/[0.06] bg-mms-gold/[0.03] text-xs font-semibold text-mms-muted uppercase"
			>
				<tr>
					<th class="px-4 py-3">ID</th>
					<th class="px-4 py-3">Name</th>
					<th class="px-4 py-3">Type</th>
					<th class="px-4 py-3">Size</th>
					<th class="px-4 py-3"></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-mms-gold/[0.06]">
				{#each data.uploads as row (row.id)}
					<tr class="transition-colors hover:bg-mms-gold/[0.06]">
						<td class="px-4 py-3 font-mono text-xs text-mms-muted">{row.id}</td>
						<td class="px-4 py-3">{row.originalName}</td>
						<td class="px-4 py-3 text-mms-muted">{row.mimeType}</td>
						<td class="px-4 py-3 text-mms-muted">{(row.sizeBytes / 1024).toFixed(1)} KB</td>
						<td class="px-4 py-3">
							<div class="flex flex-wrap gap-2">
								<Button.Root
									href={fileHref(row.id)}
									class="rounded-md border border-mms-gold/20 bg-mms-ink3 px-3 py-1.5 text-xs font-medium text-mms-cream hover:bg-mms-gold/[0.06]"
								>
									Open
								</Button.Root>
								<form method="post" action="?/deleteUpload" use:enhance>
									<input type="hidden" name="id" value={row.id} />
									<Button.Root
										type="submit"
										class="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-100"
									>
										Delete
									</Button.Root>
								</form>
							</div>
						</td>
					</tr>
				{:else}
					<tr>
						<td colspan="5" class="px-4 py-8 text-center text-sm text-mms-muted">No uploads yet.</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
