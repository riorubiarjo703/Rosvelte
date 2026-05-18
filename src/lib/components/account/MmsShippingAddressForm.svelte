<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'account' | 'checkout';

	const ACCOUNT_LABEL =
		'mb-1 block text-[0.58rem] uppercase tracking-[0.18em] text-mms-muted';
	const ACCOUNT_INPUT =
		'w-full border border-mms-gold/15 bg-mms-ink3 px-3 py-2.5 text-sm text-mms-cream placeholder:text-mms-muted/45 focus:border-mms-gold/40 focus:outline-none';

	const CHECKOUT_LABEL =
		'mb-1 block text-[0.57rem] uppercase tracking-[0.18em] text-[#9a9285]';
	const CHECKOUT_INPUT =
		'w-full border border-[rgba(201,168,76,0.22)] bg-[#1a1713] px-3 py-2.5 text-[0.82rem] text-[#f5f0e8] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.35)] placeholder:text-[#5c564c] focus:border-[rgba(201,168,76,0.45)] focus:outline-none focus:ring-1 focus:ring-[rgba(201,168,76,0.25)]';

	let {
		variant = 'account',
		idPrefix = 'shipping',
		error = '',
		showDefaultCheckbox = true,
		showSubmitButton = false,
		submitLabel = 'Save address',
		label = $bindable(''),
		recipient = $bindable(''),
		addressLine = $bindable(''),
		city = $bindable(''),
		postalCode = $bindable(''),
		phone = $bindable(''),
		setAsDefault = $bindable(false),
		footer
	}: {
		variant?: Variant;
		idPrefix?: string;
		error?: string;
		showDefaultCheckbox?: boolean;
		showSubmitButton?: boolean;
		submitLabel?: string;
		label?: string;
		recipient?: string;
		addressLine?: string;
		city?: string;
		postalCode?: string;
		phone?: string;
		setAsDefault?: boolean;
		footer?: Snippet;
	} = $props();

	const labelClass = $derived(variant === 'checkout' ? CHECKOUT_LABEL : ACCOUNT_LABEL);
	const inputClass = $derived(variant === 'checkout' ? CHECKOUT_INPUT : ACCOUNT_INPUT);
	const gridClass = $derived(
		variant === 'checkout'
			? 'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3'
			: 'grid grid-cols-1 gap-4 md:grid-cols-2'
	);
	const span2 = $derived(variant === 'checkout' ? 'sm:col-span-2' : 'md:col-span-2');

	const submitWrapClass = $derived(
		variant === 'checkout' ? 'mt-5 flex justify-end' : 'mt-6 flex justify-end'
	);
	const submitBtnClass = $derived(
		variant === 'checkout'
			? 'border-0 bg-[#c9a84c] px-5 py-2.5 text-[0.62rem] font-medium uppercase tracking-[0.18em] text-[#0d0b08] transition hover:brightness-105'
			: 'border border-mms-gold bg-mms-gold px-6 py-2.5 text-[0.62rem] uppercase tracking-[0.18em] text-mms-ink transition hover:bg-mms-gold-light'
	);

	const errClass = $derived(
		variant === 'checkout'
			? 'mb-3 text-[0.82rem] leading-snug text-[#f0a8a8]'
			: 'mb-4 text-[0.78rem] text-red-400/95'
	);

	const defaultRowClass = $derived(
		variant === 'checkout'
			? 'mt-3 flex cursor-pointer items-center gap-2 text-[0.78rem] text-[#9a9285]'
			: 'mt-4 inline-flex cursor-pointer items-center gap-2 text-[0.72rem] text-mms-muted'
	);
</script>

<div class="mms-shipping-address-form" data-variant={variant}>
	{#if error}
		<p class={errClass} role="alert">{error}</p>
	{/if}

	<div class={gridClass}>
		<div>
			<label class={labelClass} for={`${idPrefix}-label`}>Label</label>
			<input
				id={`${idPrefix}-label`}
				name="addressLabel"
				class={inputClass}
				type="text"
				autocomplete="shipping address-level1"
				placeholder="Home, Office, etc."
				bind:value={label}
			/>
		</div>
		<div>
			<label class={labelClass} for={`${idPrefix}-recipient`}>Recipient name</label>
			<input
				id={`${idPrefix}-recipient`}
				name="addressRecipient"
				class={inputClass}
				type="text"
				autocomplete="name"
				required
				bind:value={recipient}
			/>
		</div>
		<div class={span2}>
			<label class={labelClass} for={`${idPrefix}-line`}>Address line</label>
			<textarea
				id={`${idPrefix}-line`}
				name="addressLine"
				class="{inputClass} min-h-[5.5rem] resize-y leading-relaxed"
				rows="3"
				required
				autocomplete="street-address"
				placeholder="Street, building, district"
				bind:value={addressLine}
			></textarea>
		</div>
		<div>
			<label class={labelClass} for={`${idPrefix}-city`}>City</label>
			<input
				id={`${idPrefix}-city`}
				name="addressCity"
				class={inputClass}
				type="text"
				autocomplete="address-level2"
				required
				bind:value={city}
			/>
		</div>
		<div>
			<label class={labelClass} for={`${idPrefix}-postal`}>Postal code</label>
			<input
				id={`${idPrefix}-postal`}
				name="addressPostalCode"
				class={inputClass}
				type="text"
				autocomplete="postal-code"
				required
				bind:value={postalCode}
			/>
		</div>
		<div class={span2}>
			<label class={labelClass} for={`${idPrefix}-phone`}>Phone (optional)</label>
			<input
				id={`${idPrefix}-phone`}
				name="addressPhone"
				class={inputClass}
				type="tel"
				autocomplete="tel"
				bind:value={phone}
			/>
		</div>
	</div>

	{#if showDefaultCheckbox}
		<label class={defaultRowClass}>
			<input type="checkbox" name="addressDefault" class="accent-mms-gold" bind:checked={setAsDefault} />
			Set as default address
		</label>
	{/if}

	{#if showSubmitButton}
		<div class={submitWrapClass}>
			<button type="submit" class={submitBtnClass}>
				{submitLabel}
			</button>
		</div>
	{/if}

	{@render footer?.()}
</div>

<style>
	/* Checkout: ensure panel is opaque when teleported outside theme wrappers */
	.mms-shipping-address-form[data-variant='checkout'] {
		color: #f5f0e8;
	}
</style>
