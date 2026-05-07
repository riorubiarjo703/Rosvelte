<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import type { Pathname } from '$app/types';
	import { resolvedLocalizedHref } from '$lib/paraglide-resolved-href';

	type CustomerFieldErrors = Partial<Record<string, string[] | undefined>>;
	type CustomerAddress = {
		id: string;
		label: string;
		recipient: string;
		phone: string;
		addressLine: string;
		city: string;
		postalCode: string;
		isDefault: boolean;
	};

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const fe = $derived((form?.errors as CustomerFieldErrors | undefined) ?? {});
	let customerAddresses = $state<CustomerAddress[]>([]);
	let addressesHydrated = $state(false);

	const languageOptions = ['English', 'Bahasa Indonesia', '日本語'] as const;
	const spiritOptions: string[] = [
		'Scotch whisky — sherry cask',
		'Scotch whisky — bourbon cask',
		'Bourbon & rye',
		'Irish whiskey',
		'Japanese whisky',
		'World whisky'
	];

	function hrefFor(path: Pathname) {
		return resolvedLocalizedHref(path);
	}

	$effect(() => {
		if (addressesHydrated || typeof window === 'undefined') return;
		addressesHydrated = true;
		const key = `rosvelte-customer-addresses-${data.customer.id}`;
		try {
			const raw = localStorage.getItem(key);
			if (!raw) {
				customerAddresses = [];
				return;
			}
			const parsed = JSON.parse(raw) as CustomerAddress[];
			if (!Array.isArray(parsed)) {
				customerAddresses = [];
				return;
			}
			customerAddresses = parsed
				.filter((entry) => entry && typeof entry === 'object')
				.map((entry) => ({
					id: String(entry.id || ''),
					label: String(entry.label || 'Address'),
					recipient: String(entry.recipient || ''),
					phone: String(entry.phone || ''),
					addressLine: String(entry.addressLine || ''),
					city: String(entry.city || ''),
					postalCode: String(entry.postalCode || ''),
					isDefault: Boolean(entry.isDefault)
				}))
				.filter((entry) => entry.id && entry.recipient && entry.addressLine && entry.city && entry.postalCode);
		} catch {
			customerAddresses = [];
		}
	});
</script>

<svelte:head>
	<title>MMS Admin · Edit Customer</title>
</svelte:head>

{#if form?.message}
	<p class="mb-4 px-6 text-[0.75rem] text-red-400">{form.message}</p>
{/if}

<form class="space-y-px bg-mms-gold/10 relative" method="POST" action="?/updateCustomer">
	<input type="hidden" name="id" value={data.customer.id} />

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-6 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Customer profile
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="name">Full name</label>
				<input
					id="name"
					name="name"
					required
					value={data.customer.name}
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.name}<span class="text-[0.65rem] text-red-400">{fe.name.join(', ')}</span>{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="email">Email</label>
				<input
					id="email"
					value={data.customer.email}
					disabled
					class="cursor-not-allowed border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-muted"
				/>
				<p class="text-[0.65rem] text-mms-muted">Email edits are disabled in admin for now.</p>
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="phone">Phone</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					inputmode="tel"
					pattern="[+0-9()\\-. ]*"
					minlength="8"
					maxlength="20"
					value={data.customer.phone}
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.phone}<span class="text-[0.65rem] text-red-400">{fe.phone.join(', ')}</span>{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="birthDate">Birth date</label>
				<input
					id="birthDate"
					name="birthDate"
					type="date"
					value={data.customer.birthDate}
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				/>
				{#if fe.birthDate}<span class="text-[0.65rem] text-red-400">{fe.birthDate.join(', ')}</span>{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="preferredLanguage">Preferred language</label>
				<div class="relative">
					<select
						id="preferredLanguage"
						name="preferredLanguage"
						class="w-full appearance-none border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 pr-9 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					>
						<option value="">Select language</option>
						{#each languageOptions as lang}
							<option value={lang} selected={data.customer.preferredLanguage === lang}>{lang}</option>
						{/each}
					</select>
				</div>
				{#if fe.preferredLanguage}
					<span class="text-[0.65rem] text-red-400">{fe.preferredLanguage.join(', ')}</span>
				{/if}
			</div>

			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="spiritPreference">Spirit preference</label>
				<div class="relative">
					<select
						id="spiritPreference"
						name="spiritPreference"
						class="w-full appearance-none border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 pr-9 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					>
						<option value="">Select a style</option>
						{#each spiritOptions as spirit}
							<option value={spirit} selected={data.customer.spiritPreference === spirit}>{spirit}</option>
						{/each}
					</select>
				</div>
				{#if fe.spiritPreference}
					<span class="text-[0.65rem] text-red-400">{fe.spiritPreference.join(', ')}</span>
				{/if}
			</div>

			<div class="flex items-center gap-2 pt-6">
				<input
					id="emailVerified"
					name="emailVerified"
					type="checkbox"
					class="accent-mms-gold"
					checked={data.customer.emailVerified}
				/>
				<label class="text-[0.65rem] tracking-[0.15em] text-mms-muted uppercase" for="emailVerified">Email verified (Active status)</label>
			</div>
		</div>
	</section>

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-4 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Address list
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		{#if customerAddresses.length === 0}
			<p class="text-[0.72rem] leading-relaxed text-mms-muted">
				No saved addresses found for this customer in current browser storage.
			</p>
		{:else}
			<div class="grid gap-px bg-mms-gold/10 md:grid-cols-2">
				{#each customerAddresses as address (address.id)}
					<div class="relative bg-mms-ink3 p-4">
						{#if address.isDefault}
							<span
								class="absolute right-4 top-4 border border-mms-gold/25 bg-mms-gold/10 px-2 py-0.5 text-[0.52rem] uppercase tracking-[0.15em] text-mms-gold"
							>
								Default
							</span>
						{/if}
						<p class="text-[0.58rem] uppercase tracking-[0.18em] text-mms-gold-dim">{address.label}</p>
						<p class="mt-2 text-sm font-medium text-mms-cream">{address.recipient}</p>
						<p class="mt-2 text-[0.75rem] leading-relaxed text-mms-muted">
							{address.addressLine}
							<br />
							{address.city} {address.postalCode}
							{#if address.phone}
								<br />
								{address.phone}
							{/if}
						</p>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-4 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Account security and notifications
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<p class="text-[0.72rem] leading-relaxed text-mms-muted">
			Email notification toggles are currently stored on the storefront side per customer browser, and password updates are intentionally self-service in the customer account page (requires current password).
			Admin can control verification state via the <span class="text-mms-gold">Email verified</span> toggle above.
		</p>
	</section>

	<div class="flex flex-wrap justify-end gap-3 bg-mms-ink2 px-6 py-6">
		<a
			href={hrefFor('/superstore/customers')}
			class="rounded border border-mms-gold/25 px-5 py-2.5 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase no-underline hover:border-mms-gold hover:text-mms-gold"
			data-sveltekit-preload-data="hover">Back</a
		>
		<button
			type="submit"
			class="rounded bg-mms-gold px-5 py-2.5 text-[0.62rem] font-medium tracking-[0.12em] text-mms-ink uppercase hover:bg-mms-gold-light"
		>
			Save changes
		</button>
	</div>
</form>
