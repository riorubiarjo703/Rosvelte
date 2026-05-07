<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>Forgot password — Rosvelte</title>
</svelte:head>

<div class="rounded-2xl border border-mms-gold/25 bg-mms-ink3 px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-10">
	<h1 class="text-center font-mms-display text-2xl font-semibold tracking-[0.08em] text-mms-gold uppercase">
		Forgot password
	</h1>
	<p class="mt-3 text-center text-sm leading-relaxed text-mms-cream/65">
		Enter your email and we will send a reset link if an account exists. Check the server log for the link
		while email delivery is not configured.
	</p>

	{#if data.alreadySignedIn}
		<p class="mt-8 text-center text-sm text-mms-cream/70">
			You are signed in.
			<a href={resolve('/account')} class="text-mms-gold hover:underline">Go to your account</a>
		</p>
	{:else if form?.ok}
		<p class="mt-8 text-center text-sm text-mms-cream/80">
			If that email is registered, instructions are on the way. If nothing arrives, confirm the address or
			check with support.
		</p>
		<p class="mt-6 text-center">
			<a href={resolve('/account/login')} class="text-sm text-mms-gold underline-offset-4 hover:underline">
				Back to sign in
			</a>
		</p>
	{:else}
		<form method="post" class="mt-8 space-y-5" use:enhance>
			<div>
				<label for="fp-email" class="text-xs font-semibold tracking-[0.15em] text-mms-gold/90 uppercase">
					Email
				</label>
				<input
					id="fp-email"
					name="email"
					type="email"
					autocomplete="email"
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
				Send reset link
			</button>
		</form>

		<p class="mt-6 text-center text-sm text-mms-cream/55">
			<a href={resolve('/account/login')} class="text-mms-gold/90 underline-offset-4 hover:underline">Sign in</a>
		</p>
	{/if}
</div>
