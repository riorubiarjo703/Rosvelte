<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import SuperstoreLoginLogo from '$lib/components/superstore/SuperstoreLoginLogo.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let mode = $state<'signin' | 'register'>('signin');
</script>

<svelte:head>
	<title>Superstore · Sign in</title>
</svelte:head>

<div
	class="flex min-h-[calc(100vh-0px)] items-center justify-center px-4 py-12 sm:py-16"
	role="presentation"
>
	<div
		class="w-full max-w-[420px] rounded-2xl border border-mms-gold/20 bg-mms-white px-8 py-10 shadow-[0_24px_80px_rgba(13,11,8,0.08)] sm:px-10"
	>
		<div class="flex flex-col items-center text-center">
			<div
				class="flex size-14 items-center justify-center rounded-xl bg-mms-ink shadow-inner ring-1 ring-mms-gold/25"
			>
				<SuperstoreLoginLogo class="h-9 w-9" />
			</div>
			<h1 class="mt-6 font-mms-display text-2xl font-semibold tracking-tight text-mms-ink">
				Welcome back
			</h1>
			<p class="mt-2 font-mms-sans text-sm leading-relaxed text-mms-muted">
				Enter your credentials to access Superstore.
			</p>
		</div>

		{#if mode === 'signin'}
			<form method="post" action="?/signInEmail" class="mt-8 space-y-5" use:enhance>
				{#if data.redirectTo}
					<input type="hidden" name="redirectTo" value={data.redirectTo} />
				{/if}
				<div>
					<label
						for="ss-email"
						class="font-mms-sans text-xs font-semibold tracking-wide text-mms-ink uppercase"
					>
						Email
					</label>
					<input
						id="ss-email"
						name="email"
						type="email"
						autocomplete="email"
						required
						placeholder="you@company.com"
						class="mt-2 w-full rounded-lg border border-mms-gold/25 bg-mms-cream/40 px-4 py-3 font-mms-sans text-sm text-mms-ink placeholder:text-mms-muted/70 focus:border-mms-gold focus:ring-2 focus:ring-mms-gold/25 focus:outline-none"
					/>
				</div>
				<div>
					<label
						for="ss-password"
						class="font-mms-sans text-xs font-semibold tracking-wide text-mms-ink uppercase"
					>
						Password
					</label>
					<input
						id="ss-password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
						placeholder="••••••••"
						class="mt-2 w-full rounded-lg border border-mms-gold/25 bg-mms-cream/40 px-4 py-3 font-mms-sans text-sm text-mms-ink placeholder:text-mms-muted/70 focus:border-mms-gold focus:ring-2 focus:ring-mms-gold/25 focus:outline-none"
					/>
				</div>

				{#if form?.message}
					<p class="text-center font-mms-sans text-sm text-red-700">{form.message}</p>
				{/if}

				<button
					type="submit"
					class="w-full rounded-lg bg-mms-ink py-3.5 font-mms-sans text-sm font-semibold tracking-[0.12em] text-mms-white uppercase transition hover:bg-mms-ink2"
				>
					Sign in
				</button>
			</form>

			<p class="mt-6 text-center font-mms-sans text-sm text-mms-muted">
				<button
					type="button"
					class="text-mms-ink underline decoration-mms-gold/40 underline-offset-4 transition hover:text-mms-gold-dim"
					onclick={() => (mode = 'register')}
				>
					Don't have an account? <span class="font-semibold text-mms-ink">Register</span>
				</button>
			</p>
		{:else}
			<form method="post" action="?/signUpEmail" class="mt-8 space-y-5" use:enhance>
				{#if data.redirectTo}
					<input type="hidden" name="redirectTo" value={data.redirectTo} />
				{/if}
				<div>
					<label
						for="ss-name"
						class="font-mms-sans text-xs font-semibold tracking-wide text-mms-ink uppercase"
					>
						Name
					</label>
					<input
						id="ss-name"
						name="name"
						type="text"
						autocomplete="name"
						required
						placeholder="Your name"
						class="mt-2 w-full rounded-lg border border-mms-gold/25 bg-mms-cream/40 px-4 py-3 font-mms-sans text-sm text-mms-ink placeholder:text-mms-muted/70 focus:border-mms-gold focus:ring-2 focus:ring-mms-gold/25 focus:outline-none"
					/>
				</div>
				<div>
					<label
						for="ss-reg-email"
						class="font-mms-sans text-xs font-semibold tracking-wide text-mms-ink uppercase"
					>
						Email
					</label>
					<input
						id="ss-reg-email"
						name="email"
						type="email"
						autocomplete="email"
						required
						placeholder="you@company.com"
						class="mt-2 w-full rounded-lg border border-mms-gold/25 bg-mms-cream/40 px-4 py-3 font-mms-sans text-sm text-mms-ink placeholder:text-mms-muted/70 focus:border-mms-gold focus:ring-2 focus:ring-mms-gold/25 focus:outline-none"
					/>
				</div>
				<div>
					<label
						for="ss-reg-password"
						class="font-mms-sans text-xs font-semibold tracking-wide text-mms-ink uppercase"
					>
						Password
					</label>
					<input
						id="ss-reg-password"
						name="password"
						type="password"
						autocomplete="new-password"
						required
						placeholder="••••••••"
						class="mt-2 w-full rounded-lg border border-mms-gold/25 bg-mms-cream/40 px-4 py-3 font-mms-sans text-sm text-mms-ink placeholder:text-mms-muted/70 focus:border-mms-gold focus:ring-2 focus:ring-mms-gold/25 focus:outline-none"
					/>
				</div>

				{#if form?.message}
					<p class="text-center font-mms-sans text-sm text-red-700">{form.message}</p>
				{/if}

				<button
					type="submit"
					class="w-full rounded-lg bg-mms-ink py-3.5 font-mms-sans text-sm font-semibold tracking-[0.12em] text-mms-white uppercase transition hover:bg-mms-ink2"
				>
					Create account
				</button>
			</form>

			<p class="mt-6 text-center font-mms-sans text-sm text-mms-muted">
				<button
					type="button"
					class="text-mms-ink underline decoration-mms-gold/40 underline-offset-4 transition hover:text-mms-gold-dim"
					onclick={() => (mode = 'signin')}
				>
					Already have an account? <span class="font-semibold text-mms-ink">Sign in</span>
				</button>
			</p>
		{/if}

		<p class="mt-8 text-center font-mms-sans text-xs text-mms-muted/90">
			Forgot your password? Contact your administrator — self-serve reset is not enabled yet.
		</p>
	</div>
</div>
