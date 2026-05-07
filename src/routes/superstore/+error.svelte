<script lang="ts">
	import { page } from '$app/state';

	const status = $derived(page.status);
	const msg = $derived(page.error?.message ?? '');
	const showAccessHint = $derived(status === 403 || /access denied/i.test(msg));
	const showDbHint = $derived(
		!showAccessHint &&
			(status === 500 || status === 503) &&
			page.url.pathname.includes('/superstore')
	);
</script>

<div
	class="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-red-950 shadow-sm"
>
	<h1 class="font-mms-display text-xl font-semibold">Superstore</h1>
	<p class="mt-3 text-sm">{page.error?.message}</p>
	{#if showAccessHint}
		<p class="mt-4 text-sm text-red-800/80">
			If you need access, set <code class="rounded bg-red-100 px-1">SUPERSTORE_ALLOWED_EMAILS</code> (comma-separated
			emails) or enable
			<code class="rounded bg-red-100 px-1">SUPERSTORE_ALLOW_ANY_AUTHENTICATED_USER=true</code> in
			<code class="rounded bg-red-100 px-1">.env</code>, then restart the dev server.
		</p>
	{/if}
	{#if showDbHint}
		<p class="mt-4 text-sm text-red-800/80">
			This often means Postgres is unreachable or the schema is missing. Check
			<code class="rounded bg-red-100 px-1">DATABASE_URL</code> in
			<code class="rounded bg-red-100 px-1">.env</code>, run
			<code class="rounded bg-red-100 px-1">npm run db:push</code> (confirm in a real terminal), then
			<code class="rounded bg-red-100 px-1">npm run db:seed:catalog</code> if you want demo products.
		</p>
	{/if}
</div>
