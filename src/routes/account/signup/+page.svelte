<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Create account — Rosvelte</title>
</svelte:head>

<div class="rounded-2xl border border-mms-gold/25 bg-mms-ink3 px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-10">
	<h1 class="text-center font-mms-display text-2xl font-semibold tracking-[0.08em] text-mms-gold uppercase">
		Create account
	</h1>
	<p class="mt-3 text-center text-sm leading-relaxed text-mms-cream/65">
		Rosvelte is reserved for guests 21+. We ask for your date of birth to confirm eligibility.
	</p>

	<form method="post" class="mt-8 space-y-5" use:enhance>
		{#if data.redirectTo}
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
		{/if}
		<div>
			<label for="su-name" class="text-xs font-semibold tracking-[0.15em] text-mms-gold/90 uppercase">Name</label>
			<input
				id="su-name"
				name="name"
				type="text"
				autocomplete="name"
				required
				class="mt-2 w-full border border-mms-gold/30 bg-mms-ink/80 px-4 py-3 text-sm text-mms-cream focus:border-mms-gold focus:ring-1 focus:ring-mms-gold/40 focus:outline-none"
			/>
		</div>
		<div>
			<label for="su-email" class="text-xs font-semibold tracking-[0.15em] text-mms-gold/90 uppercase">Email</label>
			<input
				id="su-email"
				name="email"
				type="email"
				autocomplete="email"
				required
				class="mt-2 w-full border border-mms-gold/30 bg-mms-ink/80 px-4 py-3 text-sm text-mms-cream focus:border-mms-gold focus:ring-1 focus:ring-mms-gold/40 focus:outline-none"
			/>
		</div>
		<div>
			<label for="su-dob" class="text-xs font-semibold tracking-[0.15em] text-mms-gold/90 uppercase">
				Date of birth
			</label>
			<input
				id="su-dob"
				name="birthDate"
				type="date"
				required
				class="mt-2 w-full border border-mms-gold/30 bg-mms-ink/80 px-4 py-3 text-sm text-mms-cream focus:border-mms-gold focus:ring-1 focus:ring-mms-gold/40 focus:outline-none [color-scheme:dark]"
			/>
		</div>
		<div>
			<label for="su-password" class="text-xs font-semibold tracking-[0.15em] text-mms-gold/90 uppercase">
				Password
			</label>
			<input
				id="su-password"
				name="password"
				type="password"
				autocomplete="new-password"
				required
				class="mt-2 w-full border border-mms-gold/30 bg-mms-ink/80 px-4 py-3 text-sm text-mms-cream focus:border-mms-gold focus:ring-1 focus:ring-mms-gold/40 focus:outline-none"
			/>
		</div>

		{#if form?.message}
			<p class="text-center text-sm text-amber-200/90">{form.message}</p>
		{/if}

		<button
			type="submit"
			class="w-full border border-mms-gold/80 bg-transparent py-3.5 text-xs font-semibold tracking-[0.2em] text-mms-gold uppercase transition hover:bg-mms-gold hover:text-mms-ink"
		>
			Sign up
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-mms-cream/55">
		Already have an account?
		<a href={resolve('/account/login')} class="font-semibold text-mms-gold hover:text-mms-gold-dim">Sign in</a>
	</p>
</div>
