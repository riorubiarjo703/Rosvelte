<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const canSubmit = $derived(Boolean(data.token) && !data.invalid);
</script>

<svelte:head>
	<title>Reset password — Rosvelte</title>
</svelte:head>

<div class="rounded-2xl border border-mms-gold/25 bg-mms-ink3 px-8 py-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:px-10">
	<h1 class="text-center font-mms-display text-2xl font-semibold tracking-[0.08em] text-mms-gold uppercase">
		Reset password
	</h1>

	{#if data.invalid || !data.token}
		<p class="mt-6 text-center text-sm text-amber-200/90">
			This reset link is invalid or has expired.
			<a href={resolve('/account/forgot-password')} class="block pt-3 text-mms-gold underline-offset-4 hover:underline">
				Request a new link
			</a>
		</p>
	{:else}
		<p class="mt-3 text-center text-sm text-mms-cream/65">Choose a new password for your account.</p>

		<form method="post" class="mt-8 space-y-5" use:enhance>
			<input type="hidden" name="token" value={data.token} />
			<div>
				<label for="rp-pass" class="text-xs font-semibold tracking-[0.15em] text-mms-gold/90 uppercase">
					New password
				</label>
				<input
					id="rp-pass"
					name="newPassword"
					type="password"
					autocomplete="new-password"
					required
					minlength="8"
					class="mt-2 w-full border border-mms-gold/30 bg-mms-ink/80 px-4 py-3 text-sm text-mms-cream focus:border-mms-gold focus:ring-1 focus:ring-mms-gold/40 focus:outline-none"
				/>
			</div>

			{#if form?.message}
				<p class="text-center text-sm text-amber-200/90">{form.message}</p>
			{/if}

			<button
				type="submit"
				disabled={!canSubmit}
				class="w-full border border-mms-gold/80 bg-transparent py-3.5 text-xs font-semibold tracking-[0.2em] text-mms-gold uppercase transition enabled:hover:bg-mms-gold enabled:hover:text-mms-ink disabled:cursor-not-allowed disabled:opacity-40"
			>
				Update password
			</button>
		</form>
	{/if}

	<p class="mt-6 text-center text-sm text-mms-cream/55">
		<a href={resolve('/account/login')} class="text-mms-gold/90 underline-offset-4 hover:underline">Sign in</a>
	</p>
</div>
