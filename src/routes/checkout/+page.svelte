<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import CollectionBottleArt from '$lib/components/collections/CollectionBottleArt.svelte';
	import {
		cartLines,
		cartSubtotal,
		formatIdr,
		resolveCartLineHeroImageHref
	} from '$lib/cart/mms-cart';
	import {
		PROMO_GOLDMEMBER_DISCOUNT_IDR,
		SHIPPING_COST_MAP,
		type AddressOption,
		type ShippingOption
	} from '$lib/checkout/mms-checkout-pricing';

	type PaymentOption = 'card' | 'transfer' | 'ewallet';
	type BankOption = 'bca' | 'bni' | 'mandiri' | 'bri';
	type WalletOption = 'gopay' | 'ovo' | 'dana' | 'shopeepay' | 'linkaja' | 'qris';

	let { data, form } = $props();

	const cartPath = resolve('/cart');
	const collectionsPath = resolve('/collections');
	const catalogHeroImages = $derived(page.data.catalogHeroImages);

	let firstName = $state('Budi');
	let lastName = $state('Santoso');
	let email = $state('budi@email.com');
	let phone = $state('+62 812 3456 7890');

	let selectedAddress = $state<AddressOption>('home');
	let selectedShipping = $state<ShippingOption>('standard');
	let selectedPayment = $state<PaymentOption>('card');
	let selectedBank = $state<BankOption>('bca');
	let selectedWallet = $state<WalletOption>('gopay');
	let promoCode = $state('');
	const promoApplied = $derived(promoCode.trim().toUpperCase() === 'GOLDMEMBER');
	let ageConfirmed = $state(false);
	let cardNumber = $state('');

	const taxRatePercent = $derived(data.taxRatePercent);

	const promoDiscount = $derived(promoApplied ? PROMO_GOLDMEMBER_DISCOUNT_IDR : 0);
	const shippingCost = $derived(SHIPPING_COST_MAP[selectedShipping]);
	const discountedSubtotal = $derived(Math.max($cartSubtotal - promoDiscount, 0));
	const taxAmount = $derived(Math.round((discountedSubtotal * taxRatePercent) / 100));
	const totalAmount = $derived(discountedSubtotal + taxAmount + shippingCost);
	const checkoutDisabled = $derived(!ageConfirmed || $cartLines.length === 0);

	const cartLinesJson = $derived(
		JSON.stringify($cartLines.map((l) => ({ productId: l.productId, qty: l.qty })))
	);

	function handleCardInput(value: string) {
		cardNumber = value
			.replace(/\D/g, '')
			.replace(/(.{4})/g, '$1 ')
			.trim()
			.slice(0, 19);
	}
</script>

<svelte:head>
	<title>Checkout - Rosvelte</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="checkout-page">
	<nav>
		<span class="nav-logo">MMS</span>
		<div class="nav-secure">Secure Checkout</div>
		<a href={cartPath} class="nav-back">Back to cart</a>
	</nav>

	<div class="progress-bar">
		<div class="progress-steps">
			<div class="step done"><div class="step-circle">✓</div><span>Cart</span></div>
			<div class="step-line done"></div>
			<div class="step active"><div class="step-circle">2</div><span>Checkout</span></div>
			<div class="step-line"></div>
			<div class="step"><div class="step-circle">3</div><span>Confirmed</span></div>
		</div>
	</div>

	{#if $cartLines.length === 0}
		<div class="empty-state">
			<h1>Your bag is empty</h1>
			<p>Add bottles from the collection before checking out.</p>
			<a href={collectionsPath}>Browse collection</a>
		</div>
	{:else}
		<form method="POST" action="?/checkout" class="checkout-form">
			{#if form?.error}
				<div class="checkout-error" role="alert">{form.error}</div>
			{/if}
			<input type="hidden" name="cartLines" value={cartLinesJson} />
			<input type="hidden" name="shipping" value={selectedShipping} />
			<input type="hidden" name="address" value={selectedAddress} />
			<div class="checkout-wrap">
			<div>
				<div class="checkout-section">
					<span class="section-num">01</span>
					<h2 class="section-title">Contact <em>Information</em></h2>
					<div class="form-grid">
						<div class="form-group">
							<label for="checkout-first-name">First Name</label>
							<input
								id="checkout-first-name"
								class="form-input"
								name="firstName"
								autocomplete="given-name"
								bind:value={firstName}
							/>
						</div>
						<div class="form-group">
							<label for="checkout-last-name">Last Name</label>
							<input
								id="checkout-last-name"
								class="form-input"
								name="lastName"
								autocomplete="family-name"
								bind:value={lastName}
							/>
						</div>
						<div class="form-group">
							<label for="checkout-email">Email Address</label>
							<input
								id="checkout-email"
								class="form-input"
								type="email"
								name="email"
								autocomplete="email"
								bind:value={email}
							/>
						</div>
						<div class="form-group">
							<label for="checkout-phone">Phone Number</label>
							<input
								id="checkout-phone"
								class="form-input"
								type="tel"
								name="phone"
								autocomplete="tel"
								bind:value={phone}
							/>
						</div>
					</div>
				</div>

				<div class="form-divider"></div>

				<div class="checkout-section">
					<span class="section-num">02</span>
					<h2 class="section-title">Delivery <em>Address</em></h2>
					<div class="radio-cards">
						<button
							type="button"
							class="radio-card"
							class:selected={selectedAddress === 'home'}
							onclick={() => (selectedAddress = 'home')}
						>
							<div class="radio-circle"></div>
							<div class="radio-info">
								<div class="radio-title">Home - Jl. Kemang Raya No. 45, Jakarta Selatan</div>
							</div>
						</button>
						<button
							type="button"
							class="radio-card"
							class:selected={selectedAddress === 'office'}
							onclick={() => (selectedAddress = 'office')}
						>
							<div class="radio-circle"></div>
							<div class="radio-info">
								<div class="radio-title">Office - Menara Sudirman Lt. 12, Jakarta Pusat</div>
							</div>
						</button>
						<button
							type="button"
							class="radio-card dashed"
							class:selected={selectedAddress === 'new'}
							onclick={() => (selectedAddress = 'new')}
						>
							<div class="radio-circle"></div>
							<div class="radio-info"><div class="radio-sub">Use a different address</div></div>
						</button>
					</div>
				</div>

				<div class="form-divider"></div>

				<div class="checkout-section">
					<span class="section-num">03</span>
					<h2 class="section-title">Delivery <em>Method</em></h2>
					<div class="radio-cards">
						<button
							type="button"
							class="radio-card"
							class:selected={selectedShipping === 'standard'}
							onclick={() => (selectedShipping = 'standard')}
						>
							<div class="radio-circle"></div>
							<div class="radio-info">
								<div class="radio-title">Standard - JNE Regular</div>
								<div class="radio-sub">3-5 business days</div>
							</div>
							<div class="radio-price">{formatIdr(SHIPPING_COST_MAP.standard)}</div>
						</button>
						<button
							type="button"
							class="radio-card"
							class:selected={selectedShipping === 'express'}
							onclick={() => (selectedShipping = 'express')}
						>
							<div class="radio-circle"></div>
							<div class="radio-info">
								<div class="radio-title">Express - JNE YES</div>
								<div class="radio-sub">Next business day</div>
							</div>
							<div class="radio-price">{formatIdr(SHIPPING_COST_MAP.express)}</div>
						</button>
						<button
							type="button"
							class="radio-card"
							class:selected={selectedShipping === 'same'}
							onclick={() => (selectedShipping = 'same')}
						>
							<div class="radio-circle"></div>
							<div class="radio-info">
								<div class="radio-title">Same-Day - Gojek Instant</div>
								<div class="radio-sub">Within 4 hours</div>
							</div>
							<div class="radio-price">{formatIdr(SHIPPING_COST_MAP.same)}</div>
						</button>
						<button
							type="button"
							class="radio-card"
							class:selected={selectedShipping === 'free'}
							onclick={() => (selectedShipping = 'free')}
						>
							<div class="radio-circle"></div>
							<div class="radio-info">
								<div class="radio-title">Free Delivery - Complimentary</div>
								<div class="radio-sub">For eligible orders</div>
							</div>
							<div class="radio-price free">Free</div>
						</button>
					</div>
				</div>

				<div class="form-divider"></div>

				<div class="checkout-section">
					<span class="section-num">04</span>
					<h2 class="section-title">Payment <em>Method</em></h2>
					<div class="pay-tabs">
						<button class="pay-tab" class:active={selectedPayment === 'card'} onclick={() => (selectedPayment = 'card')}>
							Card
						</button>
						<button
							class="pay-tab"
							class:active={selectedPayment === 'transfer'}
							onclick={() => (selectedPayment = 'transfer')}
						>
							Bank Transfer
						</button>
						<button
							class="pay-tab"
							class:active={selectedPayment === 'ewallet'}
							onclick={() => (selectedPayment = 'ewallet')}
						>
							E-Wallet
						</button>
					</div>

					{#if selectedPayment === 'card'}
						<div class="form-grid full">
							<div class="form-group full">
								<label for="checkout-card-number">Card Number</label>
								<div class="card-input-wrap">
									<input
										id="checkout-card-number"
										class="form-input w-full"
										placeholder="1234 5678 9012 3456"
										value={cardNumber}
										oninput={(event) => handleCardInput((event.currentTarget as HTMLInputElement).value)}
									/>
									<div class="card-icons">
										<span class="card-icon">VISA</span>
										<span class="card-icon">MC</span>
									</div>
								</div>
							</div>
							<div class="form-group">
								<label for="checkout-cardholder">Cardholder Name</label>
								<input id="checkout-cardholder" class="form-input" />
							</div>
							<div class="form-group">
								<label for="checkout-expiry">Expiry Date</label>
								<input id="checkout-expiry" class="form-input" placeholder="MM / YY" />
							</div>
							<div class="form-group">
								<label for="checkout-cvv">CVV</label>
								<input id="checkout-cvv" class="form-input" type="password" />
							</div>
						</div>
					{:else if selectedPayment === 'transfer'}
						<div class="bank-grid">
							<button
								type="button"
								class="bank-card"
								class:selected={selectedBank === 'bca'}
								onclick={() => (selectedBank = 'bca')}
							>
								<span class="bank-icon">BCA</span>
								<span class="bank-text">
									<span class="bank-name">BCA Virtual Account</span>
									<span class="bank-sub">Instant confirmation</span>
								</span>
							</button>
							<button
								type="button"
								class="bank-card"
								class:selected={selectedBank === 'bni'}
								onclick={() => (selectedBank = 'bni')}
							>
								<span class="bank-icon">BNI</span>
								<span class="bank-text">
									<span class="bank-name">BNI Virtual Account</span>
									<span class="bank-sub">Instant confirmation</span>
								</span>
							</button>
							<button
								type="button"
								class="bank-card"
								class:selected={selectedBank === 'mandiri'}
								onclick={() => (selectedBank = 'mandiri')}
							>
								<span class="bank-icon">MDR</span>
								<span class="bank-text">
									<span class="bank-name">Mandiri Bill Payment</span>
									<span class="bank-sub">Instant confirmation</span>
								</span>
							</button>
							<button
								type="button"
								class="bank-card"
								class:selected={selectedBank === 'bri'}
								onclick={() => (selectedBank = 'bri')}
							>
								<span class="bank-icon">BRI</span>
								<span class="bank-text">
									<span class="bank-name">BRI Virtual Account</span>
									<span class="bank-sub">Instant confirmation</span>
								</span>
							</button>
						</div>
					{:else}
						<div class="ewallet-grid">
							<button
								type="button"
								class="wallet-card"
								class:selected={selectedWallet === 'gopay'}
								onclick={() => (selectedWallet = 'gopay')}
							>
								<span class="wallet-icon">GoPay</span>
								<span>GoPay</span>
							</button>
							<button
								type="button"
								class="wallet-card"
								class:selected={selectedWallet === 'ovo'}
								onclick={() => (selectedWallet = 'ovo')}
							>
								<span class="wallet-icon">OVO</span>
								<span>OVO</span>
							</button>
							<button
								type="button"
								class="wallet-card"
								class:selected={selectedWallet === 'dana'}
								onclick={() => (selectedWallet = 'dana')}
							>
								<span class="wallet-icon">DANA</span>
								<span>DANA</span>
							</button>
							<button
								type="button"
								class="wallet-card"
								class:selected={selectedWallet === 'shopeepay'}
								onclick={() => (selectedWallet = 'shopeepay')}
							>
								<span class="wallet-icon">SP</span>
								<span>ShopeePay</span>
							</button>
							<button
								type="button"
								class="wallet-card"
								class:selected={selectedWallet === 'linkaja'}
								onclick={() => (selectedWallet = 'linkaja')}
							>
								<span class="wallet-icon">Link</span>
								<span>LinkAja</span>
							</button>
							<button
								type="button"
								class="wallet-card"
								class:selected={selectedWallet === 'qris'}
								onclick={() => (selectedWallet = 'qris')}
							>
								<span class="wallet-icon">QR</span>
								<span>QRIS</span>
							</button>
						</div>
					{/if}
				</div>

				<div class="form-divider"></div>

				<div class="checkout-section">
					<span class="section-num">05</span>
					<h2 class="section-title">Age <em>Verification</em></h2>
					<label class="check-row">
						<input type="checkbox" name="ageConfirmed" bind:checked={ageConfirmed} />
						<span>I confirm I am 21 years old or older and agree to terms and privacy policy.</span>
					</label>
				</div>
			</div>

			<div class="summary-col">
				<div class="summary-card">
					<div class="summary-header">
						<span>Order Summary</span>
						<a href={cartPath}>Back to Cart</a>
					</div>

					<div class="summary-items">
						{#each $cartLines as line (line.productId)}
							{@const lineImg = resolveCartLineHeroImageHref(line, catalogHeroImages)}
							<div class="summary-item">
								<div class="sum-img">
									{#if lineImg}
										<img src={lineImg} alt={line.name} />
									{:else}
										<CollectionBottleArt height={46} />
									{/if}
									<div class="sum-qty">{line.qty}</div>
								</div>
								<div class="sum-info">
									<div class="sum-name">{line.name}</div>
									<div class="sum-origin">{line.country} - {line.region}</div>
								</div>
								<div class="sum-price">{formatIdr(line.price * line.qty)}</div>
							</div>
						{/each}
					</div>

					<div class="promo-wrap">
						<input
							class="promo-input"
							placeholder="Promo code"
							name="promoCode"
							bind:value={promoCode}
						/>
					</div>

					<div class="summary-totals">
						<div class="sum-row"><span>Subtotal</span><span>{formatIdr($cartSubtotal)}</span></div>
						{#if promoApplied}
							<div class="sum-row promo"><span>Promo</span><span>- {formatIdr(promoDiscount)}</span></div>
						{/if}
						<div class="sum-row"><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : formatIdr(shippingCost)}</span></div>
						<div class="sum-row"><span>Tax ({taxRatePercent}%)</span><span>{formatIdr(taxAmount)}</span></div>
					</div>

					<div class="sum-total-row">
						<span>Total</span>
						<span>{formatIdr(totalAmount)}</span>
					</div>

					<div class="summary-cta">
						<button class="btn-checkout" type="submit" disabled={checkoutDisabled}>
							Pay securely with Xendit
						</button>
					</div>
				</div>
			</div>
		</div>
		</form>
	{/if}
</div>

<style>
	:global(body) {
		background: #0d0b08;
	}

	.checkout-form {
		max-width: 1200px;
		margin: 0 auto;
	}

	.checkout-error {
		margin: 0 3rem 1rem;
		padding: 0.85rem 1rem;
		border: 1px solid rgba(220, 90, 70, 0.45);
		background: rgba(220, 90, 70, 0.08);
		color: #e8c4be;
		font-size: 0.78rem;
		line-height: 1.45;
	}

	@media (max-width: 980px) {
		.checkout-error {
			margin: 0 1.5rem 1rem;
		}
	}

	.checkout-page {
		--gold: #c9a84c;
		--gold-light: #e8c97a;
		--gold-dim: #8b6e2f;
		--ink: #0d0b08;
		--ink2: #1a1713;
		--ink3: #221f1a;
		--cream: #f5f0e8;
		--muted: #6b6355;
		--muted2: #4a4238;
		--green: #4caf82;
		min-height: 100dvh;
		background: var(--ink);
		color: var(--cream);
		font-family: 'DM Sans', sans-serif;
	}

	nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 40;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.2rem 3rem;
		background: rgba(13, 11, 8, 0.97);
		border-bottom: 1px solid rgba(201, 168, 76, 0.08);
	}

	.nav-logo {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 1.7rem;
		letter-spacing: 0.35em;
		color: var(--gold);
	}

	.nav-secure,
	.nav-back {
		font-size: 0.62rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--muted);
		text-decoration: none;
	}

	.progress-bar {
		padding: 5.5rem 3rem 1.5rem;
		border-bottom: 1px solid rgba(201, 168, 76, 0.08);
	}

	.progress-steps {
		display: flex;
		align-items: center;
		max-width: 520px;
	}

	.step {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.62rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.step-circle {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: 1px solid var(--muted2);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.step.done .step-circle,
	.step.active .step-circle {
		border-color: var(--gold);
		color: var(--gold);
	}

	.step-line {
		flex: 1;
		height: 1px;
		background: rgba(201, 168, 76, 0.12);
		margin: 0 0.5rem;
	}

	.step-line.done {
		background: rgba(201, 168, 76, 0.4);
	}

	.checkout-wrap {
		padding: 2rem 3rem 5rem;
		display: grid;
		grid-template-columns: minmax(0, 1fr) 380px;
		gap: 3rem;
		max-width: 1200px;
		margin: 0 auto;
		align-items: start;
	}

	.checkout-section {
		margin-bottom: 2.3rem;
		background: transparent;
	}

	.section-num {
		font-family: 'Bebas Neue', sans-serif;
		font-size: 3rem;
		color: rgba(201, 168, 76, 0.06);
		line-height: 1;
	}

	.section-title {
		margin-top: -0.3rem;
		margin-bottom: 1.3rem;
		font-family: 'Cormorant Garamond', serif;
		font-size: 1.7rem;
		font-weight: 300;
	}

	.section-title em {
		font-style: italic;
		color: var(--gold-light);
	}

	.form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.8rem;
	}

	.form-grid.full {
		grid-template-columns: 1fr 1fr;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.form-group.full {
		grid-column: span 2;
	}

	.form-group label {
		font-size: 0.57rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.form-input {
		background: var(--ink2);
		border: 1px solid rgba(201, 168, 76, 0.12);
		padding: 0.75rem 1rem;
		color: var(--cream);
		font-size: 0.8rem;
	}

	.card-input-wrap {
		position: relative;
	}

	.card-input-wrap .form-input {
		padding-right: 5.1rem;
	}

	.card-icons {
		position: absolute;
		top: 50%;
		right: 0.7rem;
		transform: translateY(-50%);
		display: flex;
		gap: 0.3rem;
	}

	.card-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 18px;
		border: 1px solid rgba(201, 168, 76, 0.18);
		background: rgba(201, 168, 76, 0.08);
		color: var(--gold-dim);
		font-size: 0.46rem;
		letter-spacing: 0.03em;
	}

	.radio-cards {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}

	.radio-card {
		border: 1px solid rgba(201, 168, 76, 0.12);
		padding: 1rem 1.1rem;
		display: flex;
		align-items: center;
		gap: 0.9rem;
		background: var(--ink2);
		color: inherit;
		font: inherit;
		text-align: left;
	}

	.radio-card.dashed {
		border-style: dashed;
	}

	.radio-card.selected {
		border-color: var(--gold);
		background: rgba(201, 168, 76, 0.04);
	}

	.radio-circle {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1.5px solid var(--muted2);
	}

	.radio-card.selected .radio-circle {
		border-color: var(--gold);
		box-shadow: inset 0 0 0 4px rgba(201, 168, 76, 0.92);
	}

	.radio-title {
		font-size: 0.78rem;
		color: var(--cream);
	}

	.radio-sub {
		font-size: 0.64rem;
		color: var(--muted);
	}

	.radio-price {
		margin-left: auto;
		font-family: 'Cormorant Garamond', serif;
		font-size: 1rem;
		color: var(--gold);
	}

	.radio-price.free {
		color: var(--green);
	}

	.pay-tabs {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: 1px solid rgba(201, 168, 76, 0.12);
		margin-bottom: 1rem;
	}

	.pay-tab {
		padding: 0.7rem;
		border: 0;
		background: transparent;
		border-right: 1px solid rgba(201, 168, 76, 0.08);
		font-size: 0.62rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.pay-tab.active {
		background: var(--gold);
		color: var(--ink);
	}

	.bank-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem;
	}

	.bank-card {
		border: 1px solid rgba(201, 168, 76, 0.12);
		padding: 0.9rem 1rem;
		background: var(--ink2);
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: inherit;
		font: inherit;
		text-align: left;
	}

	.bank-card.selected {
		border-color: var(--gold);
		background: rgba(201, 168, 76, 0.04);
	}

	.bank-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 22px;
		border: 1px solid rgba(201, 168, 76, 0.18);
		background: rgba(201, 168, 76, 0.08);
		color: var(--gold-dim);
		font-size: 0.52rem;
		letter-spacing: 0.05em;
		flex-shrink: 0;
	}

	.bank-text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.bank-name {
		font-size: 0.72rem;
		color: var(--cream);
	}

	.bank-sub {
		font-size: 0.6rem;
		color: var(--muted);
	}

	.ewallet-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.6rem;
	}

	.wallet-card {
		border: 1px solid rgba(201, 168, 76, 0.12);
		background: var(--ink2);
		padding: 0.8rem 0.6rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.45rem;
		color: var(--cream);
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.wallet-card.selected {
		border-color: var(--gold);
		background: rgba(201, 168, 76, 0.04);
	}

	.wallet-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 42px;
		height: 26px;
		border: 1px solid rgba(201, 168, 76, 0.18);
		background: rgba(201, 168, 76, 0.08);
		color: var(--gold-dim);
		font-size: 0.5rem;
		letter-spacing: 0.04em;
	}

	.form-divider {
		height: 1px;
		background: rgba(201, 168, 76, 0.08);
		margin: 1.6rem 0;
	}

	.check-row {
		display: flex;
		gap: 0.6rem;
		align-items: start;
		font-size: 0.72rem;
		color: var(--muted);
		line-height: 1.7;
	}

	.summary-col {
		position: sticky;
		top: 112px;
		height: fit-content;
		align-self: start;
	}

	.summary-card {
		background: var(--ink2);
		border: 1px solid rgba(201, 168, 76, 0.1);
	}

	.summary-header {
		padding: 1.2rem 1.4rem;
		border-bottom: 1px solid rgba(201, 168, 76, 0.06);
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.62rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--gold-dim);
	}

	.summary-header a {
		color: var(--muted);
		text-decoration: none;
	}

	.summary-items,
	.summary-totals {
		padding: 1rem 1.4rem;
		border-bottom: 1px solid rgba(201, 168, 76, 0.06);
	}

	.summary-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 0.9rem;
	}

	.summary-item:last-child {
		margin-bottom: 0;
	}

	.sum-img {
		width: 44px;
		height: 56px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--ink3);
	}

	.sum-img img {
		max-width: 100%;
		max-height: 52px;
		object-fit: contain;
	}

	.sum-qty {
		position: absolute;
		top: -5px;
		right: -5px;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--gold);
		color: var(--ink);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.55rem;
		font-weight: 600;
	}

	.sum-info {
		flex: 1;
		min-width: 0;
	}

	.sum-name {
		font-size: 0.75rem;
		line-height: 1.35;
	}

	.sum-origin {
		font-size: 0.6rem;
		color: var(--muted);
	}

	.sum-price {
		font-family: 'Cormorant Garamond', serif;
		font-size: 1rem;
		color: var(--gold);
	}

	.promo-wrap {
		padding: 1rem 1.4rem;
		border-bottom: 1px solid rgba(201, 168, 76, 0.06);
	}

	.promo-input {
		width: 100%;
		box-sizing: border-box;
		background: var(--ink3);
		border: 1px solid rgba(201, 168, 76, 0.12);
		padding: 0.65rem 0.85rem;
		color: var(--cream);
		font-size: 0.74rem;
	}

	.sum-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.65rem;
		font-size: 0.72rem;
		color: var(--muted);
	}

	.sum-row span:last-child {
		color: var(--cream);
	}

	.sum-row.promo span {
		color: var(--green);
	}

	.sum-total-row {
		padding: 1.1rem 1.4rem;
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		border-bottom: 1px solid rgba(201, 168, 76, 0.06);
	}

	.sum-total-row span:first-child {
		font-size: 0.62rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--muted);
	}

	.sum-total-row span:last-child {
		font-family: 'Cormorant Garamond', serif;
		font-size: 1.9rem;
		color: var(--gold);
	}

	.summary-cta {
		padding: 1.2rem 1.4rem;
	}

	.btn-checkout {
		width: 100%;
		background: var(--gold);
		border: 0;
		color: var(--ink);
		font-size: 0.66rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		padding: 1rem;
	}

	.btn-checkout:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.empty-state {
		max-width: 560px;
		margin: 8rem auto;
		padding: 2rem;
		border: 1px solid rgba(201, 168, 76, 0.2);
		background: var(--ink2);
		text-align: center;
	}

	.empty-state h1 {
		font-family: 'Cormorant Garamond', serif;
		font-size: 2.2rem;
		margin-bottom: 0.6rem;
	}

	.empty-state p {
		color: var(--muted);
		margin-bottom: 1.2rem;
	}

	.empty-state a {
		color: var(--ink);
		background: var(--gold);
		padding: 0.7rem 1rem;
		text-decoration: none;
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.success-overlay {
		position: fixed;
		inset: 0;
		z-index: 80;
		display: grid;
		place-items: center;
		background: rgba(13, 11, 8, 0.96);
	}

	.success-box {
		padding: 3rem 2.4rem;
		text-align: center;
	}

	.success-icon {
		width: 70px;
		height: 70px;
		margin: 0 auto 1.8rem;
		border-radius: 50%;
		border: 1.5px solid var(--gold);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.success-icon svg {
		width: 30px;
		height: 30px;
		stroke: var(--gold);
		fill: none;
		stroke-width: 2;
	}

	.success-title {
		font-family: 'Cormorant Garamond', serif;
		font-size: 4rem;
		font-weight: 300;
		line-height: 1;
		margin-bottom: 1.1rem;
	}

	.success-title em {
		font-style: italic;
		color: var(--gold-light);
	}

	.success-sub {
		font-size: 0.82rem;
		color: var(--muted);
		line-height: 1.9;
		margin-bottom: 1.8rem;
	}

	.success-order {
		border: 1px solid rgba(201, 168, 76, 0.15);
		background: var(--ink2);
		padding: 1.2rem 1.8rem;
		text-align: left;
		margin-bottom: 1.8rem;
	}

	.success-order-row {
		display: flex;
		justify-content: space-between;
		gap: 0.8rem;
		font-size: 0.75rem;
		padding: 0.44rem 0;
		border-bottom: 1px solid rgba(201, 168, 76, 0.04);
	}

	.success-order-row:last-child {
		border-bottom: 0;
	}

	.success-order-row span:first-child {
		color: var(--muted);
	}

	.success-order-row span:last-child {
		color: var(--cream);
		text-align: right;
	}

	.order-gold {
		color: var(--gold) !important;
	}

	.success-btns {
		display: flex;
		justify-content: center;
		gap: 0.8rem;
	}

	.btn-primary-sm {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.9rem;
		background: var(--gold);
		border: 0;
		color: var(--ink);
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	.btn-ghost-sm {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1.7rem;
		background: transparent;
		border: 1px solid rgba(201, 168, 76, 0.2);
		color: var(--muted);
		font-size: 0.65rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		text-decoration: none;
	}

	.btn-ghost-sm:hover {
		border-color: var(--gold);
		color: var(--gold);
	}

	@media (max-width: 980px) {
		nav {
			padding: 1rem 1.5rem;
		}

		.progress-bar {
			padding: 4.6rem 1.5rem 1rem;
		}

		.checkout-wrap {
			grid-template-columns: 1fr;
			padding: 1.5rem;
			gap: 2rem;
		}

		.summary-col {
			position: static;
		}

		.form-grid,
		.form-grid.full,
		.bank-grid,
		.ewallet-grid {
			grid-template-columns: 1fr;
		}

		.form-group.full {
			grid-column: span 1;
		}

		.success-box {
			padding: 2rem 1.2rem;
		}

		.success-title {
			font-size: 3rem;
		}

		.success-btns {
			flex-direction: column;
		}
	}
</style>
