<script lang="ts">
	import {
		setStoreFavicon,
		setStoreHeaderLogo,
		setStoreTaxRate,
		storeFavicon,
		storeHeaderLogo,
		storeTaxRate
	} from '$lib/store/mms-store-settings';

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

<p class="mt-4 text-[0.72rem] text-mms-muted">Preview only — persist settings via your config API when ready.</p>
