<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import CollectionBottleArt from '$lib/components/collections/CollectionBottleArt.svelte';
	import { get } from 'svelte/store';
	import {
		addedToCartModal,
		cartItemCount,
		cartSubtotal,
		closeAddedToCartModal,
		formatIdr,
		resolveCartLineHeroImageHref,
		type AddedToCartModalPayload,
		type MmsCartLine
	} from '$lib/cart/mms-cart';

	const cartPath = resolve('/cart');
	const AUTO_CLOSE_MS = 7000;

	let autoCloseTimer: ReturnType<typeof setTimeout> | undefined;

	function lineForImage(p: AddedToCartModalPayload): MmsCartLine {
		return {
			productId: p.productId,
			qty: p.qtyAdded,
			name: p.productName,
			price: p.unitPrice,
			country: '',
			region: '',
			heroImageUploadId: p.heroImageUploadId
		};
	}

	const catalogHeroImages = $derived(
		(page.data as { catalogHeroImages?: Record<string, number | null> }).catalogHeroImages
	);

	function thumbHref(p: AddedToCartModalPayload): string | null {
		return resolveCartLineHeroImageHref(lineForImage(p), catalogHeroImages);
	}

	function clearAutoClose() {
		if (autoCloseTimer !== undefined) {
			clearTimeout(autoCloseTimer);
			autoCloseTimer = undefined;
		}
	}

	function scheduleAutoClose() {
		clearAutoClose();
		autoCloseTimer = setTimeout(() => {
			closeAddedToCartModal();
			autoCloseTimer = undefined;
		}, AUTO_CLOSE_MS);
	}

	function goCart() {
		clearAutoClose();
		closeAddedToCartModal();
		void goto(cartPath);
	}

	function continueShopping() {
		clearAutoClose();
		closeAddedToCartModal();
	}

	$effect(() => {
		if ($addedToCartModal) scheduleAutoClose();
		else clearAutoClose();
	});

	$effect(() => {
		if (!$addedToCartModal || typeof document === 'undefined') return;
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	onMount(() => {
		function onKey(e: KeyboardEvent) {
			if (e.key === 'Escape' && get(addedToCartModal)) continueShopping();
		}
		window.addEventListener('keydown', onKey);
		return () => {
			clearAutoClose();
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

{#if $addedToCartModal}
	{@const p = $addedToCartModal}
	{@const heroSrc = thumbHref(p)}
	<div class="fixed inset-0 z-[220] flex items-center justify-center p-4 sm:p-8" role="presentation">
		<button
			type="button"
			class="absolute inset-0 bg-mms-ink/60 backdrop-blur-sm"
			aria-label="Close dialog"
			onclick={continueShopping}
		></button>
		<div
			class="relative z-[1] flex max-h-[min(90dvh,720px)] w-full max-w-4xl flex-col overflow-hidden rounded-sm border border-mms-gold/15 bg-[#faf9f7] shadow-[0_24px_80px_rgba(0,0,0,0.35)] md:max-h-[min(85dvh,640px)] md:flex-row"
			role="dialog"
			aria-modal="true"
			aria-labelledby="added-to-cart-heading"
			tabindex="-1"
		>
			<button
				type="button"
				class="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full border border-mms-ink/10 text-mms-ink/50 transition hover:border-mms-ink/25 hover:text-mms-ink"
				aria-label="Close"
				onclick={continueShopping}
			>
				<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
					<path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
				</svg>
			</button>

			<div
				class="flex min-h-0 flex-1 flex-col gap-5 border-b border-mms-ink/10 p-6 pt-12 md:border-b-0 md:border-r md:p-8 md:pt-10"
			>
				<div class="flex items-start gap-3">
					<span
						class="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white"
						aria-hidden="true"
					>
						<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
							<path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</span>
					<p
						id="added-to-cart-heading"
						class="font-mms-sans text-[0.95rem] font-medium leading-snug text-emerald-800 underline decoration-emerald-700/30 underline-offset-2"
					>
						Product successfully added to your shopping bag
					</p>
				</div>

				<div class="flex gap-4">
					<div
						class="flex size-20 shrink-0 items-center justify-center overflow-hidden border border-mms-ink/10 bg-white sm:size-24"
					>
						{#if heroSrc}
							<img
								src={heroSrc}
								alt=""
								class="max-h-full max-w-full object-contain p-1"
								loading="lazy"
								decoding="async"
							/>
						{:else}
							<CollectionBottleArt height={72} />
						{/if}
					</div>
					<div class="min-w-0 flex-1">
						<p class="font-mms-display text-lg font-light leading-snug text-mms-ink sm:text-xl">
							{p.productName}
						</p>
						<p class="mt-2 font-mms-display text-xl text-emerald-700">{formatIdr(p.unitPrice)}</p>
						<p class="mt-1 font-mms-sans text-[0.75rem] text-mms-ink/55">Qty: {p.qtyAdded}</p>
					</div>
				</div>

				<p class="mt-auto font-mms-sans text-[0.7rem] text-mms-ink/45">
					This popup closes automatically after 7 seconds.
				</p>
			</div>

			<div
				class="flex min-h-0 flex-1 flex-col justify-between gap-8 p-6 md:p-8"
			>
				<div>
					<p class="font-mms-sans text-[0.85rem] text-mms-ink/80">
						There {$cartItemCount === 1 ? 'is' : 'are'}
						<strong class="text-mms-ink">{$cartItemCount}</strong>
						item{$cartItemCount === 1 ? '' : 's'} in your bag.
					</p>
					<p
						class="mt-4 font-mms-display text-4xl font-light tabular-nums text-mms-ink sm:text-5xl"
					>
						{formatIdr($cartSubtotal)}
					</p>
				</div>
				<div class="flex flex-col gap-3">
					<button
						type="button"
						class="w-full border border-transparent bg-emerald-700 px-6 py-3.5 font-mms-sans text-[0.65rem] uppercase tracking-[0.22em] text-white transition hover:bg-emerald-600"
						onclick={goCart}
					>
						Checkout
					</button>
					<button
						type="button"
						class="w-full border border-mms-ink/20 bg-white px-6 py-3.5 font-mms-sans text-[0.65rem] uppercase tracking-[0.22em] text-mms-ink transition hover:border-mms-ink/40"
						onclick={continueShopping}
					>
						Continue shopping
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
