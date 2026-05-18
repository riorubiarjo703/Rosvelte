<script lang="ts">
	import {
		setStoreFavicon,
		setStoreHeaderLogo,
		setStoreTaxRate,
		storeFavicon,
		storeHeaderLogo,
		storeTaxRate
	} from '$lib/store/mms-store-settings';

	let { data, form } = $props();

	let taxDbInput = $state('');
	$effect(() => {
		taxDbInput = String(data.serverTaxRatePercent);
	});
	let enableXendit = $state(true);
	$effect(() => {
		enableXendit = data.xenditPaymentEnabled;
	});
	let xenditModeLocal = $state<'test' | 'production'>('test');
	$effect(() => {
		xenditModeLocal = data.xenditMode;
	});
	let checkoutCard = $state(true);
	let checkoutVa = $state(true);
	let checkoutEwallet = $state(true);
	$effect(() => {
		checkoutCard = data.xenditCheckoutMethods.card;
		checkoutVa = data.xenditCheckoutMethods.va;
		checkoutEwallet = data.xenditCheckoutMethods.ewallet;
	});
	let newOrderAlerts = $state(true);
	let lowStock = $state(true);
	let newCustomer = $state(false);
	let weeklyReport = $state(true);
	let ageGate = $state(true);
	let rememberVerified = $state(true);
	let taxRateInput = $state(String($storeTaxRate));
	let headerLogoInput = $state<string | null>($storeHeaderLogo);
	let faviconInput = $state<string | null>($storeFavicon);
	let uploadError = $state('');

	const MAX_HEADER_LOGO_BYTES = 1_500_000;
	const MAX_FAVICON_BYTES = 500_000;

	function resetUploadError(): void {
		uploadError = '';
	}

	function readImageFile(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => {
				if (typeof reader.result === 'string') resolve(reader.result);
				else reject(new Error('Unable to read image'));
			};
			reader.onerror = () => reject(new Error('Unable to read image'));
			reader.readAsDataURL(file);
		});
	}

	async function handleAssetPick(
		event: Event,
		kind: 'headerLogo' | 'favicon',
		maxBytes: number
	): Promise<void> {
		resetUploadError();
		const input = event.currentTarget as HTMLInputElement | null;
		const file = input?.files?.[0];
		if (!file) return;
		if (!file.type.startsWith('image/')) {
			uploadError = 'Please upload an image file.';
			return;
		}
		if (file.size > maxBytes) {
			uploadError =
				kind === 'headerLogo'
					? 'Header logo must be under 1.5MB.'
					: 'Favicon must be under 500KB.';
			return;
		}
		try {
			const dataUrl = await readImageFile(file);
			if (kind === 'headerLogo') headerLogoInput = dataUrl;
			else faviconInput = dataUrl;
		} catch {
			uploadError = 'Failed to read image file.';
		}
	}

	function resetSettings(): void {
		taxRateInput = String($storeTaxRate);
		headerLogoInput = $storeHeaderLogo;
		faviconInput = $storeFavicon;
		resetUploadError();
	}

	function saveSettings(): void {
		resetUploadError();
		const parsedRate = Number.parseFloat(taxRateInput);
		if (Number.isFinite(parsedRate)) {
			setStoreTaxRate(parsedRate);
		}
		setStoreHeaderLogo(headerLogoInput);
		setStoreFavicon(faviconInput);
		taxRateInput = String($storeTaxRate);
		headerLogoInput = $storeHeaderLogo;
		faviconInput = $storeFavicon;
	}
</script>

<svelte:head>
	<title>MMS Admin · Settings</title>
</svelte:head>

<div class="space-y-px bg-mms-gold/10 relative">
	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-6 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Store settings
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<div class="grid gap-4 md:grid-cols-2">
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="sn">Store name</label>
				<input
					id="sn"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					value="MMS — Maison de Spiritueux"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="se">Store email</label>
				<input
					id="se"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					value="admin@mms-spirits.com"
				/>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="cur">Currency</label>
				<select
					id="cur"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
				>
					<option>IDR — Indonesian Rupiah</option>
					<option>USD — US Dollar</option>
					<option>EUR — Euro</option>
				</select>
			</div>
			<div class="flex flex-col gap-1">
				<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="tax">Tax rate (%)</label>
				<input
					id="tax"
					type="number"
					min="0"
					max="100"
					step="0.1"
					class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
					bind:value={taxRateInput}
				/>
			</div>
		</div>
	</section>

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-6 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Brand assets
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<div class="grid gap-5 md:grid-cols-2">
			<div class="space-y-3">
				<p class="text-[0.62rem] tracking-[0.14em] text-mms-muted uppercase">Header logo</p>
				<div class="flex min-h-[4rem] items-center justify-center border border-dashed border-mms-gold/20 bg-mms-ink3 p-3">
					{#if headerLogoInput}
						<img
							src={headerLogoInput}
							alt="Header logo preview"
							class="max-h-12 w-auto max-w-full object-contain"
						/>
					{:else}
						<span class="text-[0.68rem] text-mms-muted">Using default logo</span>
					{/if}
				</div>
				<div class="flex flex-wrap gap-2">
					<input
						type="file"
						accept="image/png,image/jpeg,image/webp,image/svg+xml"
						class="block w-full text-[0.68rem] text-mms-muted file:mr-2 file:rounded file:border-0 file:bg-mms-gold file:px-3 file:py-2 file:text-[0.66rem] file:font-medium file:tracking-[0.08em] file:text-mms-ink file:uppercase hover:file:bg-mms-gold-light"
						onchange={(event) => handleAssetPick(event, 'headerLogo', MAX_HEADER_LOGO_BYTES)}
					/>
					<button
						type="button"
						class="rounded border border-mms-gold/25 px-3 py-1.5 text-[0.6rem] tracking-[0.12em] text-mms-muted uppercase hover:border-mms-gold hover:text-mms-gold"
						onclick={() => {
							headerLogoInput = null;
							resetUploadError();
						}}
					>
						Use default
					</button>
				</div>
			</div>
			<div class="space-y-3">
				<p class="text-[0.62rem] tracking-[0.14em] text-mms-muted uppercase">Favicon</p>
				<div class="flex min-h-[4rem] items-center justify-center border border-dashed border-mms-gold/20 bg-mms-ink3 p-3">
					{#if faviconInput}
						<img src={faviconInput} alt="Favicon preview" class="size-8 object-contain" />
					{:else}
						<span class="text-[0.68rem] text-mms-muted">Using default favicon</span>
					{/if}
				</div>
				<div class="flex flex-wrap gap-2">
					<input
						type="file"
						accept="image/png,image/x-icon,image/vnd.microsoft.icon,.ico,image/svg+xml,image/jpeg,image/webp"
						class="block w-full text-[0.68rem] text-mms-muted file:mr-2 file:rounded file:border-0 file:bg-mms-gold file:px-3 file:py-2 file:text-[0.66rem] file:font-medium file:tracking-[0.08em] file:text-mms-ink file:uppercase hover:file:bg-mms-gold-light"
						onchange={(event) => handleAssetPick(event, 'favicon', MAX_FAVICON_BYTES)}
					/>
					<button
						type="button"
						class="rounded border border-mms-gold/25 px-3 py-1.5 text-[0.6rem] tracking-[0.12em] text-mms-muted uppercase hover:border-mms-gold hover:text-mms-gold"
						onclick={() => {
							faviconInput = null;
							resetUploadError();
						}}
					>
						Use default
					</button>
				</div>
			</div>
		</div>
		{#if uploadError}
			<p class="mt-3 text-[0.7rem] text-[#e07272]">{uploadError}</p>
		{/if}
	</section>

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-2 flex items-center gap-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">
			Payment secrets (Xendit)
			<span class="h-px flex-1 bg-mms-gold/[0.08]"></span>
		</h3>
		<p class="mb-5 text-[0.72rem] leading-relaxed text-mms-muted">
			Store API credentials in the database (staff-only). Checkout and webhooks read these first; optional
			<code class="text-mms-gold/90">.env</code> values are used only as a fallback when nothing is saved here.
		</p>
		<p class="mb-5 rounded border border-mms-gold/12 bg-mms-ink3/60 px-4 py-3 text-[0.68rem] leading-relaxed text-mms-muted">
			<strong class="font-medium text-mms-cream/90">Secrets stay off the wire:</strong> values are never loaded into this page.
			Use <span class="text-emerald-400/85">— saved</span> and the bullet strip as confirmation. If checkout shows a Xendit
			permission error, enable <strong class="text-mms-cream/90">Invoice</strong> for your secret key in the Xendit Dashboard
			(API Keys → permissions)—that is separate from choosing test vs production below.
		</p>

		{#if form?.paymentSaved}
			<p class="mb-4 text-[0.72rem] text-emerald-400/90" role="status">Payment settings saved.</p>
		{/if}
		{#if form?.paymentCleared}
			<p class="mb-4 text-[0.72rem] text-emerald-400/90" role="status">Stored secrets removed from the database.</p>
		{/if}
		{#if form?.paymentError}
			<p class="mb-4 text-[0.72rem] text-[#e07272]" role="alert">{form.paymentError}</p>
		{/if}

		<form method="POST" action="?/savePaymentSecrets" class="space-y-4">
			<label class="flex cursor-pointer items-start gap-3 rounded border border-mms-gold/15 bg-mms-ink3/80 p-4">
				<input
					type="checkbox"
					name="xenditEnabled"
					bind:checked={enableXendit}
					class="mt-0.5 size-4 shrink-0 accent-mms-gold"
				/>
				<span class="min-w-0">
					<span class="block text-[0.72rem] font-medium tracking-[0.06em] text-mms-cream">
						Enable Xendit checkout
					</span>
					<span class="mt-1 block text-[0.62rem] leading-relaxed text-mms-muted">
						When off, the storefront hides online payment and checkout is blocked. Secret fields below are shown only
						when enabled.
					</span>
				</span>
			</label>

			{#if enableXendit}
			<div class="space-y-4">
				<div
					class="flex flex-col gap-3 rounded border border-mms-gold/15 bg-mms-ink3/80 p-4 md:flex-row md:items-start md:justify-between"
				>
					<div class="min-w-0 flex-1">
						<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="xmode"
							>Active checkout environment</label
						>
						<p class="mt-1 text-[0.62rem] leading-relaxed text-mms-muted">
							Choose which key pair the storefront uses. While developing, keep this on <strong class="text-mms-cream/85"
								>Test</strong
							>
							and use a key starting with <code class="text-mms-gold/85">xnd_development_</code>. For go-live, switch to
							<strong class="text-mms-cream/85">Production</strong> and
							<code class="text-mms-gold/85">xnd_production_</code>.
						</p>
					</div>
					<select
						id="xmode"
						name="xenditMode"
						bind:value={xenditModeLocal}
						class="w-full shrink-0 border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40 md:w-56"
					>
						<option value="test">Test (development)</option>
						<option value="production">Production (live)</option>
					</select>
				</div>

				{#if data.paymentSecrets.hasLegacySecretKey}
					<p class="rounded border border-amber-500/25 bg-amber-500/5 px-3 py-2 text-[0.62rem] leading-relaxed text-mms-muted">
						A <strong class="text-mms-cream/90">legacy single API key</strong> is still stored. It is only used when the
						environment-specific key for the active mode above is empty. Use the dropdown to switch mode and save keys for
						Test or Production separately.
					</p>
				{/if}

				{#if xenditModeLocal === 'test'}
					<div class="max-w-2xl space-y-4 rounded border border-mms-gold/10 bg-mms-ink3/40 p-4">
						<p class="text-[0.65rem] font-medium tracking-[0.14em] text-mms-gold-dim uppercase">Test (development)</p>
						<div class="flex flex-col gap-1">
							<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="xsk-test">
								Secret API key
								{#if data.paymentSecrets.hasTestSecretKey}
									<span class="text-emerald-400/80"> — saved</span>
								{/if}
							</label>
							{#if data.paymentSecrets.hasTestSecretKey}
								<div
									class="mb-0.5 rounded border border-mms-gold/25 bg-mms-ink3/95 px-4 py-2.5 font-mono text-[0.82rem] tracking-[0.42em] text-mms-gold/55 select-none"
									aria-hidden="true"
								>
									••••••••••••••••••••••
								</div>
							{/if}
							<input
								id="xsk-test"
								name="xenditSecretKeyTest"
								type="password"
								autocomplete="off"
								class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
								placeholder={data.paymentSecrets.hasTestSecretKey
									? 'Optional: new test key'
									: 'xnd_development_…'}
							/>
						</div>
						<div class="flex flex-col gap-1">
							<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="xwh-test">
								Webhook verification token
								{#if data.paymentSecrets.hasTestWebhook}
									<span class="text-emerald-400/80"> — saved</span>
								{/if}
							</label>
							{#if data.paymentSecrets.hasTestWebhook}
								<div
									class="mb-0.5 rounded border border-mms-gold/25 bg-mms-ink3/95 px-4 py-2.5 font-mono text-[0.82rem] tracking-[0.42em] text-mms-gold/55 select-none"
									aria-hidden="true"
								>
									••••••••••••••••••••••
								</div>
							{/if}
							<input
								id="xwh-test"
								name="xenditWebhookTokenTest"
								type="password"
								autocomplete="off"
								class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
								placeholder={data.paymentSecrets.hasTestWebhook
									? 'Optional: new test token'
									: 'Callback token (test dashboard)'}
							/>
						</div>
					</div>
				{:else}
					<div class="max-w-2xl space-y-4 rounded border border-mms-gold/10 bg-mms-ink3/40 p-4">
						<p class="text-[0.65rem] font-medium tracking-[0.14em] text-mms-gold-dim uppercase">Production (live)</p>
						<div class="flex flex-col gap-1">
							<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="xsk-live">
								Secret API key
								{#if data.paymentSecrets.hasLiveSecretKey}
									<span class="text-emerald-400/80"> — saved</span>
								{/if}
							</label>
							{#if data.paymentSecrets.hasLiveSecretKey}
								<div
									class="mb-0.5 rounded border border-mms-gold/25 bg-mms-ink3/95 px-4 py-2.5 font-mono text-[0.82rem] tracking-[0.42em] text-mms-gold/55 select-none"
									aria-hidden="true"
								>
									••••••••••••••••••••••
								</div>
							{/if}
							<input
								id="xsk-live"
								name="xenditSecretKeyLive"
								type="password"
								autocomplete="off"
								class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
								placeholder={data.paymentSecrets.hasLiveSecretKey
									? 'Optional: new live key'
									: 'xnd_production_…'}
							/>
						</div>
						<div class="flex flex-col gap-1">
							<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="xwh-live">
								Webhook verification token
								{#if data.paymentSecrets.hasLiveWebhook}
									<span class="text-emerald-400/80"> — saved</span>
								{/if}
							</label>
							{#if data.paymentSecrets.hasLiveWebhook}
								<div
									class="mb-0.5 rounded border border-mms-gold/25 bg-mms-ink3/95 px-4 py-2.5 font-mono text-[0.82rem] tracking-[0.42em] text-mms-gold/55 select-none"
									aria-hidden="true"
								>
									••••••••••••••••••••••
								</div>
							{/if}
							<input
								id="xwh-live"
								name="xenditWebhookTokenLive"
								type="password"
								autocomplete="off"
								class="border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
								placeholder={data.paymentSecrets.hasLiveWebhook
									? 'Optional: new live token'
									: 'Callback token (live dashboard)'}
							/>
						</div>
					</div>
				{/if}
				
				<div class="space-y-3 rounded border border-mms-gold/15 bg-mms-ink3/80 p-4">
					<div class="min-w-0">
						<p class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase">Checkout payment types</p>
						<p class="mt-1 text-[0.62rem] leading-relaxed text-mms-muted">
							Controls which options appear in the storefront checkout payment section. The same set is passed to Xendit
							for the hosted invoice page.
						</p>
					</div>
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							name="xenditCheckoutCard"
							bind:checked={checkoutCard}
							class="mt-0.5 size-4 shrink-0 accent-mms-gold"
						/>
						<span class="text-[0.72rem] leading-snug text-mms-cream">Card (credit / debit)</span>
					</label>
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							name="xenditCheckoutVa"
							bind:checked={checkoutVa}
							class="mt-0.5 size-4 shrink-0 accent-mms-gold"
						/>
						<span class="text-[0.72rem] leading-snug text-mms-cream">Bank transfer (virtual account)</span>
					</label>
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							name="xenditCheckoutEwallet"
							bind:checked={checkoutEwallet}
							class="mt-0.5 size-4 shrink-0 accent-mms-gold"
						/>
						<span class="text-[0.72rem] leading-snug text-mms-cream">E-wallet (GoPay, OVO, DANA, etc.)</span>
					</label>
					<p class="text-[0.6rem] leading-relaxed text-mms-muted">
						At least one type must stay on while Xendit checkout is enabled.
					</p>
				</div>
				
				<div class="flex flex-col gap-1 md:max-w-xl">
					<label class="text-[0.6rem] tracking-[0.18em] text-mms-muted uppercase" for="taxsrv">
						Checkout tax rate (%)
					</label>
					<input
						id="taxsrv"
						name="storeTaxRatePercent"
						type="number"
						min="0"
						max="100"
						step="0.1"
						class="max-w-xs border border-mms-gold/15 bg-mms-ink3 px-4 py-2.5 text-sm text-mms-cream outline-none focus:border-mms-gold/40"
						bind:value={taxDbInput}
					/>
					<p class="text-[0.62rem] text-mms-muted">
						Applied on the server for checkout totals. Matches storefront preview when set here.
					</p>
				</div>
			</div>
			{:else}
				<p class="rounded border border-dashed border-mms-gold/20 bg-mms-ink3/50 px-4 py-3 text-[0.68rem] text-mms-muted">
					Enable Xendit above to edit API keys and checkout tax rate.
				</p>
			{/if}
			<button
				type="submit"
				class="rounded bg-mms-gold px-5 py-2.5 text-[0.62rem] font-medium tracking-[0.12em] text-mms-ink uppercase hover:bg-mms-gold-light"
			>
				Save payment settings
			</button>
		</form>

		<form method="POST" action="?/clearPaymentSecrets" class="mt-8 border-t border-mms-gold/[0.08] pt-6">
			<input type="hidden" name="confirmClear" value="true" />
			<p class="mb-3 text-[0.68rem] text-mms-muted">
				Remove all stored Xendit keys (test + production + legacy), webhook tokens, tax rate, and active environment from the
				database (environment fallback in <code class="text-mms-gold/90">.env</code> still applies if set).
			</p>
			<button
				type="submit"
				class="rounded border border-[#c05050]/40 px-5 py-2.5 text-[0.62rem] tracking-[0.12em] text-[#e08080] uppercase hover:border-[#e07070] hover:text-[#ff9e9e]"
			>
				Clear stored payment secrets
			</button>
		</form>
	</section>

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">Notifications</h3>
		<div class="divide-y divide-mms-gold/[0.06]">
			<div class="flex items-center justify-between gap-4 py-3">
				<div>
					<p id="tog-new-order" class="text-[0.75rem] text-mms-cream">New order alerts</p>
					<p class="text-[0.62rem] text-mms-muted">Email for every new order</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-labelledby="tog-new-order"
					aria-checked={newOrderAlerts}
					class="relative h-5 w-9 shrink-0 rounded-full transition-colors {newOrderAlerts ? 'bg-mms-gold' : 'bg-mms-muted'}"
					onclick={() => (newOrderAlerts = !newOrderAlerts)}
				>
					<span
						class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform {newOrderAlerts
							? 'translate-x-4'
							: ''}"
					></span>
				</button>
			</div>
			<div class="flex items-center justify-between gap-4 py-3">
				<div>
					<p id="tog-low-stock" class="text-[0.75rem] text-mms-cream">Low stock warnings</p>
					<p class="text-[0.62rem] text-mms-muted">Alert below threshold</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-labelledby="tog-low-stock"
					aria-checked={lowStock}
					class="relative h-5 w-9 shrink-0 rounded-full transition-colors {lowStock ? 'bg-mms-gold' : 'bg-mms-muted'}"
					onclick={() => (lowStock = !lowStock)}
				>
					<span
						class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform {lowStock
							? 'translate-x-4'
							: ''}"
					></span>
				</button>
			</div>
			<div class="flex items-center justify-between gap-4 py-3">
				<div>
					<p id="tog-new-cust" class="text-[0.75rem] text-mms-cream">New customer signup</p>
					<p class="text-[0.62rem] text-mms-muted">Notify on registration</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-labelledby="tog-new-cust"
					aria-checked={newCustomer}
					class="relative h-5 w-9 shrink-0 rounded-full transition-colors {newCustomer ? 'bg-mms-gold' : 'bg-mms-muted'}"
					onclick={() => (newCustomer = !newCustomer)}
				>
					<span
						class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform {newCustomer
							? 'translate-x-4'
							: ''}"
					></span>
				</button>
			</div>
			<div class="flex items-center justify-between gap-4 py-3">
				<div>
					<p id="tog-weekly" class="text-[0.75rem] text-mms-cream">Weekly report</p>
					<p class="text-[0.62rem] text-mms-muted">Analytics digest</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-labelledby="tog-weekly"
					aria-checked={weeklyReport}
					class="relative h-5 w-9 shrink-0 rounded-full transition-colors {weeklyReport ? 'bg-mms-gold' : 'bg-mms-muted'}"
					onclick={() => (weeklyReport = !weeklyReport)}
				>
					<span
						class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform {weeklyReport
							? 'translate-x-4'
							: ''}"
					></span>
				</button>
			</div>
		</div>
	</section>

	<section class="bg-mms-ink2 p-6">
		<h3 class="mb-2 text-[0.65rem] tracking-[0.2em] text-mms-gold-dim uppercase">Age verification</h3>
		<div class="divide-y divide-mms-gold/[0.06]">
			<div class="flex items-center justify-between gap-4 py-3">
				<div>
					<p id="tog-age" class="text-[0.75rem] text-mms-cream">Enable age gate</p>
					<p class="text-[0.62rem] text-mms-muted">Verification on site entry</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-labelledby="tog-age"
					aria-checked={ageGate}
					class="relative h-5 w-9 shrink-0 rounded-full transition-colors {ageGate ? 'bg-mms-gold' : 'bg-mms-muted'}"
					onclick={() => (ageGate = !ageGate)}
				>
					<span
						class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform {ageGate
							? 'translate-x-4'
							: ''}"
					></span>
				</button>
			</div>
			<div class="flex items-center justify-between gap-4 py-3">
				<div>
					<p id="tog-remember" class="text-[0.75rem] text-mms-cream">Remember verified users</p>
					<p class="text-[0.62rem] text-mms-muted">Skip gate for returning visitors</p>
				</div>
				<button
					type="button"
					role="switch"
					aria-labelledby="tog-remember"
					aria-checked={rememberVerified}
					class="relative h-5 w-9 shrink-0 rounded-full transition-colors {rememberVerified ? 'bg-mms-gold' : 'bg-mms-muted'}"
					onclick={() => (rememberVerified = !rememberVerified)}
				>
					<span
						class="absolute top-0.5 left-0.5 size-4 rounded-full bg-white transition-transform {rememberVerified
							? 'translate-x-4'
							: ''}"
					></span>
				</button>
			</div>
		</div>
	</section>

	<div class="flex flex-wrap justify-end gap-3 bg-mms-ink2 px-6 py-6">
		<button
			type="button"
			class="rounded border border-mms-gold/25 px-5 py-2.5 text-[0.62rem] tracking-[0.15em] text-mms-muted uppercase hover:border-mms-gold hover:text-mms-gold"
			onclick={resetSettings}
		>
			Reset
		</button>
		<button
			type="button"
			class="rounded bg-mms-gold px-5 py-2.5 text-[0.62rem] font-medium tracking-[0.12em] text-mms-ink uppercase hover:bg-mms-gold-light"
			onclick={saveSettings}
		>
			Save settings
		</button>
	</div>
</div>

<p class="mt-4 text-[0.72rem] text-mms-muted">
	Brand / tax preview uses browser storage; payment credentials use Superstore → Settings below when saved.
</p>
