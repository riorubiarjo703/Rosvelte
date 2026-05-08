<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import CollectionBottleArt from '$lib/components/collections/CollectionBottleArt.svelte';
	import {
		resolveCartLineHeroImageHref,
		cartLines,
		cartSubtotal,
		formatIdr,
		removeFromCart,
		setLineQty
	} from '$lib/cart/mms-cart';

	let {
		open = false,
		onClose,
		catalogHeroImages = undefined,
		catalogStockQtys = undefined
	}: {
		open: boolean;
		onClose: () => void;
		catalogHeroImages?: Record<string, number | null>;
		catalogStockQtys?: Record<string, number>;
	} = $props();

	const cartPath = resolve('/cart');

	function goCart() {
		onClose();
		void goto(cartPath);
	}

	onMount(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape') onClose();
		}
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	$effect(() => {
		if (!open || typeof document === 'undefined') return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});
</script>

{#if open}
	<div class="fixed inset-0 z-[200]" role="presentation">
		<button
			type="button"
			class="absolute inset-0 bg-mms-ink/5 backdrop-blur-sm transition-opacity"
			aria-label="Close cart"
			onclick={onClose}
		></button>
		<div
			class="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-mms-gold/15 bg-[#0f0d0a] shadow-[-24px_0_48px_rgba(0,0,0,0.5)]"
			aria-label="Shopping bag"
			role="dialog"
			aria-modal="true"
		>
			<header
				class="flex items-center justify-between border-b border-mms-gold/10 px-6 py-5 md:px-7"
			>
				<p
					class="flex items-center gap-3 font-mms-sans text-[0.65rem] uppercase tracking-[0.28em] text-mms-cream"
				>
					<span class="text-mms-gold">Bag</span>
					<span class="text-mms-muted">{$cartLines.length} line{$cartLines.length === 1 ? '' : 's'}</span>
				</p>
				<button
					type="button"
					class="border border-mms-gold/25 px-3 py-1.5 font-mms-sans text-[0.6rem] uppercase tracking-[0.2em] text-mms-gold transition hover:border-mms-gold hover:bg-mms-gold/10"
					onclick={onClose}
				>
					Close
				</button>
			</header>

			<div class="min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-7">
				{#if $cartLines.length === 0}
					<div class="flex flex-col items-center justify-center gap-6 py-16 text-center">
						<div class="text-mms-gold/40" aria-hidden="true">
							<svg class="mx-auto size-14" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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
								<circle cx="24" cy="38" r="4" fill="currentColor" />
								<circle cx="36" cy="38" r="4" fill="currentColor" />
							</svg>
						</div>
						<div>
							<p class="font-mms-display text-xl text-mms-cream">Your bag is empty</p>
							<p class="mt-2 max-w-xs text-[0.8rem] font-light text-mms-muted">
								Add bottles from the collection — each one is chosen for the cellar.
							</p>
						</div>
						<a
							href={resolve('/collections')}
							class="border border-mms-gold/40 bg-mms-gold px-8 py-3 font-mms-sans text-[0.65rem] uppercase tracking-[0.22em] text-mms-ink no-underline transition hover:bg-mms-gold-light"
							onclick={onClose}
						>
							Browse collection
						</a>
					</div>
				{:else}
					<ul class="flex flex-col gap-6">
						{#each $cartLines as line (line.productId)}
							{@const lineImg = resolveCartLineHeroImageHref(line, catalogHeroImages)}
							{@const lineStockQty = line.stockQty ?? catalogStockQtys?.[String(line.productId)] ?? null}
							{@const lineMaxQty =
								typeof lineStockQty === 'number' && Number.isFinite(lineStockQty)
									? Math.max(0, Math.trunc(lineStockQty))
									: null}
							{@const lineOutOfStock = lineMaxQty !== null && lineMaxQty <= 0}
							{@const lineAtMax = lineMaxQty !== null && line.qty >= lineMaxQty}
							<li class="flex gap-4 border-b border-mms-gold/[0.07] pb-6 last:border-0">
								<div
									class="flex size-[96px] shrink-0 items-center justify-center overflow-hidden rounded border border-mms-gold/10 bg-mms-ink2/80"
								>
									{#if lineImg}
										<img
											src={lineImg}
											alt={line.name}
											class="max-h-[5.5rem] max-w-full object-contain p-1"
											loading="lazy"
											decoding="async"
										/>
									{:else}
										<CollectionBottleArt height={72} />
									{/if}
								</div>
								<div class="min-w-0 flex-1">
									<p
										class="mb-1 text-[0.55rem] uppercase tracking-[0.18em] text-mms-gold-dim"
									>
										{line.country} · {line.region}
									</p>
									<h3 class="font-mms-display text-lg leading-snug text-mms-cream">{line.name}</h3>
									<p class="mt-2 font-mms-display text-mms-gold">{formatIdr(line.price)}</p>
									{#if lineMaxQty !== null}
										<p class="mt-1 text-[0.56rem] uppercase tracking-[0.16em] {lineOutOfStock
											? 'text-red-400'
											: 'text-mms-muted'}">
											{lineOutOfStock ? 'Out of stock' : `In stock: ${lineMaxQty}`}
										</p>
									{/if}
									<div class="mt-3 flex flex-wrap items-center gap-3">
										<div
											class="inline-flex items-center border border-mms-gold/20 font-mms-sans text-[0.65rem] text-mms-cream"
										>
											<button
												type="button"
												class="px-2.5 py-1.5 transition hover:bg-mms-gold/15"
												aria-label="Decrease quantity"
												onclick={() => setLineQty(line.productId, line.qty - 1)}
											>
												−
											</button>
											<span class="min-w-[2rem] text-center tabular-nums">{line.qty}</span>
											<button
												type="button"
												class="px-2.5 py-1.5 transition hover:bg-mms-gold/15 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
												aria-label="Increase quantity"
												disabled={lineOutOfStock || lineAtMax}
												onclick={() => setLineQty(line.productId, line.qty + 1, lineMaxQty)}
											>
												+
											</button>
										</div>
										<button
											type="button"
											class="text-[0.6rem] uppercase tracking-[0.15em] text-mms-muted underline decoration-mms-gold/30 underline-offset-4 transition hover:text-mms-gold"
											onclick={() => removeFromCart(line.productId)}
										>
											Remove
										</button>
									</div>
								</div>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			{#if $cartLines.length > 0}
				<footer class="border-t border-mms-gold/10 px-6 py-6 md:px-7">
					<div class="mb-5 flex items-baseline justify-between gap-4">
						<span class="font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] text-mms-muted"
							>Subtotal</span
						>
						<span class="font-mms-display text-2xl text-mms-gold">{formatIdr($cartSubtotal)}</span>
					</div>
					<p class="mb-4 text-[0.7rem] leading-relaxed text-mms-muted">
						Shipping and duties are estimated at checkout. This is a demo storefront — no payment is
						processed.
					</p>
					<div class="flex flex-col gap-3">
						<button
							type="button"
							class="w-full bg-mms-gold py-3.5 font-mms-sans text-[0.68rem] uppercase tracking-[0.22em] text-mms-ink transition hover:bg-mms-gold-light"
							onclick={goCart}
						>
							View full bag
						</button>
						<button
							type="button"
							class="w-full border border-mms-gold/35 py-3 font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold transition hover:border-mms-gold hover:bg-mms-gold/10"
							onclick={onClose}
						>
							Continue browsing
						</button>
					</div>
				</footer>
			{/if}
		</div>
	</div>
{/if}
