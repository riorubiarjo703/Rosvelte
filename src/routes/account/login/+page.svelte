<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Sign in — Rosvelte</title>
</svelte:head>

<div class="rounded-2xl border border-mms-gold/25 bg-mms-ink3 px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-10">
	<h1 class="text-center font-mms-display text-2xl font-semibold tracking-[0.08em] text-mms-gold uppercase">
		Sign in
	</h1>
	<p class="mt-3 text-center text-sm leading-relaxed text-mms-cream/65">
		Access your Rosvelte account.
	</p>

	{#if data.passwordResetOk}
		<p class="mt-6 rounded border border-mms-gold/25 bg-mms-gold/10 px-4 py-3 text-center text-sm text-mms-cream/90">
			Your password was updated. Sign in with your new password.
		</p>
	{/if}

	<form method="post" class="mt-8 space-y-5" use:enhance>
		{#if data.redirectTo}
			<input type="hidden" name="redirectTo" value={data.redirectTo} />
		{/if}
		<div>
			<label for="acct-email" class="text-xs font-semibold tracking-[0.15em] text-mms-gold/90 uppercase">
				Email
			</label>
			<input
				id="acct-email"
				name="email"
				type="email"
				autocomplete="email"
				required
				class="mt-2 w-full border border-mms-gold/30 bg-mms-ink/80 px-4 py-3 text-sm text-mms-cream placeholder:text-mms-cream/35 focus:border-mms-gold focus:ring-1 focus:ring-mms-gold/40 focus:outline-none"
			/>
		</div>
		<div>
			<label for="acct-password" class="text-xs font-semibold tracking-[0.15em] text-mms-gold/90 uppercase">
				Password
			</label>
			<input
				id="acct-password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
				class="mt-2 w-full border border-mms-gold/30 bg-mms-ink/80 px-4 py-3 text-sm text-mms-cream placeholder:text-mms-cream/35 focus:border-mms-gold focus:ring-1 focus:ring-mms-gold/40 focus:outline-none"
			/>
		</div>

		{#if form?.message}
			<p class="text-center text-sm text-amber-200/90">{form.message}</p>
		{/if}

		<button
			type="submit"
			class="w-full border border-mms-gold/80 bg-transparent py-3.5 text-xs font-semibold tracking-[0.2em] text-mms-gold uppercase transition hover:bg-mms-gold hover:text-mms-ink"
		>
			Sign in
		</button>
	</form>

	<p class="mt-6 text-center text-sm text-mms-cream/55">
		<a href={resolve('/account/forgot-password')} class="text-mms-gold/90 underline-offset-4 hover:underline">
			Forgot password?
		</a>
	</p>
	<p class="mt-4 text-center text-sm text-mms-cream/55">
		No account?
		<a href={resolve('/account/signup')} class="font-semibold text-mms-gold hover:text-mms-gold-dim">Create one</a>
	</p>
</div>
