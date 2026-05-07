<script lang="ts">
	import type { Pathname } from '$app/types';
	import { enhance } from '$app/forms';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';

	let { title, onOpenMenu }: { title: string; onOpenMenu: () => void } = $props();

	function hrefFor(path: Pathname) {
		return resolvedLocalizedHref(path);
	}
</script>

<header
	class="sticky top-0 z-30 flex h-[60px] shrink-0 items-center gap-3 border-b border-mms-gold/10 bg-mms-ink2 px-4 md:gap-6 md:px-8"
>
	<div class="flex min-w-0 items-center gap-3">
		<button
			type="button"
			class="flex h-9 w-9 shrink-0 flex-col items-center justify-center gap-1 rounded border border-mms-gold/15 bg-mms-ink3 lg:hidden"
			aria-label="Open menu"
			onclick={onOpenMenu}
		>
			<span class="block h-px w-4 bg-mms-cream"></span>
			<span class="block h-px w-4 bg-mms-cream"></span>
			<span class="block h-px w-4 bg-mms-cream"></span>
		</button>
		<h1 class="truncate text-sm font-medium tracking-wide text-mms-cream">{title}</h1>
	</div>

	<div
		class="hidden min-w-[22rem] flex-1 justify-center px-2 md:flex md:max-w-md md:flex-initial lg:max-w-sm ml-auto"
	>
		<label
			class="flex w-full items-center gap-2 rounded border border-mms-gold/10 bg-mms-ink3 px-3"
		>
			<svg
				class="size-3.5 shrink-0 text-mms-muted"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg
			>
			<input
				type="search"
				placeholder="Search products, orders…"
				class="w-full min-w-0 bg-transparent text-[0.75rem] text-mms-cream placeholder:text-mms-muted outline-none"
				title="Preview — hook up search when backend is ready"
			/>
		</label>
	</div>

	<div class="flex shrink-0 items-center gap-2">
		<button
			type="button"
			class="relative flex h-[34px] w-[34px] items-center justify-center rounded border border-mms-gold/12 bg-transparent transition-colors hover:border-mms-gold-dim"
			aria-label="Notifications (preview)"
			disabled
		>
			<svg
				class="size-[15px] text-mms-muted"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" /></svg
			>
			<span class="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#e05252] ring-2 ring-mms-ink2"
			></span>
		</button>

		<form method="post" action="{hrefFor('/superstore')}?/signOut" use:enhance>
			<button
				type="submit"
				class="rounded border border-mms-gold/25 px-3 py-2 text-[0.62rem] tracking-[0.12em] text-mms-gold uppercase transition-colors hover:border-mms-gold hover:bg-mms-gold/10"
			>
				Sign out
			</button>
		</form>
	</div>
</header>
