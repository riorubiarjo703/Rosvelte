<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import MmsSiteHeader from '$lib/components/site/MmsSiteHeader.svelte';
	import MmsSiteFooter from '$lib/components/site/MmsSiteFooter.svelte';
	import CollectionBottleArt from '$lib/components/collections/CollectionBottleArt.svelte';
	import {
		resolveCartLineHeroImageHref,
		cartLines,
		cartSubtotal,
		clearCart,
		formatIdr,
		removeFromCart,
		setLineQty
	} from '$lib/cart/mms-cart';
	import { storeTaxRate } from '$lib/store/mms-store-settings';

	const collectionsPath = resolve('/collections');
const checkoutPath = resolve('/checkout');
	const catalogHeroImages = $derived(page.data.catalogHeroImages);
	const taxAmount = $derived(Math.round(($cartSubtotal * $storeTaxRate) / 100));
	const grandTotal = $derived($cartSubtotal + taxAmount);
</script>

<svelte:head>
	<title>Shopping bag — Rosvelte</title>
	<meta name="description" content="Review your curated selection before checkout." />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="cart-page min-h-dvh overflow-x-hidden bg-mms-ink font-mms-sans text-mms-cream antialiased"
>
	<MmsSiteHeader />

	<section
		class="relative overflow-hidden border-b border-mms-gold/10 px-6 pb-10 pt-28 md:px-16 md:pb-14 md:pt-36"
	>
		<p
			class="pointer-events-none absolute -right-[2%] bottom-[-6%] whitespace-nowrap font-mms-logo text-[14vw] leading-none tracking-[0.05em] text-mms-gold/[0.03] md:text-[12vw]"
			aria-hidden="true"
		>
			BAG
		</p>
		<div class="relative z-[1]">
			<p
				class="mb-5 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.35em] text-mms-gold before:block before:h-px before:w-10 before:bg-mms-gold"
			>
				Rosvelte maison
			</p>
			<h1 class="font-mms-display text-[clamp(2.25rem,4vw,3.75rem)] font-light leading-[0.95] text-mms-cream">
				Your <em class="not-italic text-mms-gold-light">shopping</em> bag
			</h1>
			<p class="mt-4 max-w-xl text-[0.85rem] font-light leading-relaxed text-mms-muted">
				Each bottle is held for you here. Adjust quantities or continue browsing the collection.
			</p>
		</div>
	</section>

	<main class="px-6 py-12 md:px-16 md:py-16">
		{#if $cartLines.length === 0}
			<div
				class="mx-auto flex max-w-lg flex-col items-center gap-8 rounded-sm border border-mms-gold/10 bg-mms-ink2 px-8 py-16 text-center"
			>
				<div class="text-mms-gold/35" aria-hidden="true">
					<svg class="mx-auto size-16" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path
							d="M14 14h30l-3 24H17L14 14Z"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linejoin="round"
						/>
						<path
							d="M14 14 12 8H4"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
						<circle cx="20" cy="38" r="2" fill="currentColor" />
						<circle cx="34" cy="38" r="2" fill="currentColor" />
					</svg>
				</div>
				<div>
					<h2 class="font-mms-display text-2xl text-mms-cream">Nothing in your bag yet</h2>
					<p class="mt-3 text-[0.85rem] leading-relaxed text-mms-muted">
						Discover rare allocations and cellar releases in the collection.
					</p>
				</div>
				<a
					href={collectionsPath}
					class="inline-flex border border-mms-gold/40 bg-mms-gold px-10 py-3.5 font-mms-sans text-[0.68rem] uppercase tracking-[0.22em] text-mms-ink no-underline transition hover:bg-mms-gold-light"
				>
					Browse collection
				</a>
			</div>
		{:else}
			<div class="mx-auto grid max-w-5xl gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
				<div>
					<div class="mb-6 flex items-center justify-between gap-4 border-b border-mms-gold/10 pb-4">
						<span class="font-mms-sans text-[0.65rem] uppercase tracking-[0.25em] text-mms-muted"
							>{$cartLines.length} item{$cartLines.length === 1 ? '' : 's'}</span
						>
						<button
							type="button"
							class="text-[0.6rem] uppercase tracking-[0.18em] text-mms-muted underline decoration-mms-gold/30 underline-offset-4 transition hover:text-mms-gold"
							onclick={() => clearCart()}
						>
							Clear bag
						</button>
					</div>
					<ul class="flex flex-col gap-0 divide-y divide-mms-gold/[0.08]">
						{#each $cartLines as line (line.productId)}
							{@const lineImg = resolveCartLineHeroImageHref(line, catalogHeroImages)}
							<li class="flex gap-5 py-8 first:pt-0 md:gap-8 md:py-10">
								<div
									class="flex size-[112px] shrink-0 items-center justify-center overflow-hidden rounded border border-mms-gold/10 bg-mms-ink2 md:size-[132px]"
								>
									{#if lineImg}
										<img
											src={lineImg}
											alt={line.name}
											class="max-h-[7.25rem] max-w-full object-contain p-1.5 md:max-h-[7.75rem]"
											loading="lazy"
											decoding="async"
										/>
									{:else}
										<CollectionBottleArt height={88} />
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<p class="text-[0.6rem] uppercase tracking-[0.2em] text-mms-gold-dim">
										{line.country} · {line.region}
									</p>
									<h2 class="font-mms-display mt-1 text-xl text-mms-cream md:text-2xl">{line.name}</h2>
									<p class="font-mms-display mt-3 text-lg text-mms-gold md:text-xl">
										{formatIdr(line.price)}
										<span class="ml-2 font-mms-sans text-[0.65rem] font-normal uppercase tracking-[0.15em] text-mms-muted"
											>each</span
										>
									</p>
									<div class="mt-5 flex flex-wrap items-center gap-4">
										<div
											class="inline-flex items-center border border-mms-gold/25 font-mms-sans text-[0.7rem] text-mms-cream"
										>
											<button
												type="button"
												class="px-3 py-2 transition hover:bg-mms-gold/15"
												aria-label="Decrease quantity"
												onclick={() => setLineQty(line.productId, line.qty - 1)}
											>
												−
											</button>
											<span class="min-w-[2.5rem] text-center tabular-nums">{line.qty}</span>
											<button
												type="button"
												class="px-3 py-2 transition hover:bg-mms-gold/15"
												aria-label="Increase quantity"
												onclick={() => setLineQty(line.productId, line.qty + 1)}
											>
												+
											</button>
										</div>
										<button
											type="button"
											class="text-[0.65rem] uppercase tracking-[0.15em] text-mms-muted underline decoration-mms-gold/30 underline-offset-4 transition hover:text-mms-gold"
											onclick={() => removeFromCart(line.productId)}
										>
											Remove
										</button>
									</div>
								</div>
								<div class="hidden text-right md:block">
									<p class="font-mms-display text-xl text-mms-gold">
										{formatIdr(line.price * line.qty)}
									</p>
									<p class="mt-1 text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">Line total</p>
								</div>
							</li>
						{/each}
					</ul>
				</div>

				<aside class="h-fit border border-mms-gold/15 bg-mms-ink2 p-6 md:p-8" id="checkout">
					<h3 class="font-mms-sans text-[0.65rem] uppercase tracking-[0.28em] text-mms-gold">Summary</h3>
					<div class="mt-6 space-y-4 border-b border-mms-gold/10 pb-6">
						<div class="flex items-baseline justify-between gap-4">
							<span class="text-[0.7rem] uppercase tracking-[0.15em] text-mms-muted">Subtotal</span>
							<span class="font-mms-display text-2xl text-mms-gold">{formatIdr($cartSubtotal)}</span>
						</div>
						<div class="flex items-baseline justify-between gap-4">
							<span class="text-[0.7rem] uppercase tracking-[0.15em] text-mms-muted"
								>Tax ({$storeTaxRate}%)</span
							>
							<span class="font-mms-display text-xl text-mms-gold/90">{formatIdr(taxAmount)}</span>
						</div>
					</div>
					<div class="mt-6 flex items-baseline justify-between gap-4 border-b border-mms-gold/10 pb-6">
						<span class="text-[0.7rem] uppercase tracking-[0.15em] text-mms-muted">Total</span>
						<span class="font-mms-display text-3xl text-mms-gold">{formatIdr(grandTotal)}</span>
					</div>
					<p class="mt-5 text-[0.75rem] leading-relaxed text-mms-muted">
						Tax is applied from Store Settings. Shipping and allocation holds are confirmed with concierge
						at checkout. This demo does not process payments.
					</p>
					<a
						href={checkoutPath}
						class="mt-8 block w-full bg-mms-gold py-4 text-center font-mms-sans text-[0.68rem] uppercase tracking-[0.22em] text-mms-ink no-underline transition hover:bg-mms-gold-light"
					>
						Proceed to checkout
					</a>
					<a
						href={collectionsPath}
						class="mt-4 block w-full border border-mms-gold/30 py-3 text-center font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold no-underline transition hover:border-mms-gold hover:bg-mms-gold/10"
					>
						Continue shopping
					</a>
				</aside>
			</div>
		{/if}
	</main>

	<MmsSiteFooter />
</div>
