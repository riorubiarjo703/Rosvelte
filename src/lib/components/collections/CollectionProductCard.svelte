<script lang="ts">
	import { resolve } from '$app/paths';
	import type { MmsCollectionProduct, MmsProductBadge } from '$lib/data/mms-collection-products';
	import { mmsRevealShort } from '$lib/mms-tailwind';
	import CollectionBottleArt from './CollectionBottleArt.svelte';

	let {
		product,
		listView,
		loved,
		delayClass = '',
		heroImageSrc = null,
		onToggleWishlist,
		onAddToCart
	}: {
		product: MmsCollectionProduct;
		listView: boolean;
		loved: boolean;
		delayClass?: string;
		/** Resolved public URL for hero photo (e.g. `/catalog/image/…`). */
		heroImageSrc?: string | null;
		onToggleWishlist: (product: MmsCollectionProduct) => void;
		/** Adds this product with the chosen quantity to the shared bag. */
		onAddToCart?: (qty: number) => void;
	} = $props();

	let qty = $state(1);
	const maxStockQty = $derived.by(() => {
		if (product.stockQty === undefined || !Number.isFinite(product.stockQty)) return null;
		return Math.max(0, Math.trunc(product.stockQty));
	});
	const isOutOfStock = $derived(maxStockQty !== null && maxStockQty <= 0);

	const detailHref = $derived(resolve('/collections/[id]', { id: String(product.id) }));

	const badgeLabels: Record<Exclude<MmsProductBadge, ''>, string> = {
		rare: 'Rare find',
		new: 'New arrival',
		limited: 'Limited',
		exclusive: 'Exclusive'
	};

	function badgeClass(b: MmsProductBadge): string {
		if (!b) return '';
		const base = 'text-[0.55rem] uppercase tracking-[0.18em] px-2 py-1 border';
		if (b === 'rare') return `${base} border-mms-gold/30 bg-mms-gold/15 text-mms-gold`;
		if (b === 'new') return `${base} border-mms-gold/15 bg-mms-gold/10 text-mms-gold-dim`;
		if (b === 'limited')
			return `${base} border-[rgba(180,80,50,0.3)] bg-[rgba(180,80,50,0.15)] text-mms-badge-limited-fg`;
		return `${base} border-[rgba(100,80,160,0.3)] bg-[rgba(100,80,160,0.2)] text-mms-badge-exclusive-fg`;
	}

	function formatPrice(p: number) {
		return `Rp ${p.toLocaleString('id-ID')}`;
	}

	function ageLabel(age: string) {
		if (age === 'NAS' || age === 'XO' || age === 'XO+') return age;
		return `${age} yr`;
	}

	function bumpQty(delta: number) {
		if (isOutOfStock) return;
		let next = Math.min(6, Math.max(1, qty + delta));
		if (maxStockQty !== null) next = Math.min(next, maxStockQty);
		qty = next;
	}

	function handleAddToCart(e: MouseEvent) {
		e.stopPropagation();
		if (isOutOfStock) return;
		onAddToCart?.(qty);
		qty = 1;
	}

	function handleWishlist(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		onToggleWishlist(product);
	}
</script>

{#if listView}
	<div
		class="product-card group reveal relative grid grid-cols-[88px_1fr] gap-4 border-b border-mms-gold/[0.06] bg-mms-ink2 p-6 transition-colors hover:bg-mms-ink3 md:grid-cols-[140px_1fr_auto] md:items-center md:gap-8 md:p-8 {mmsRevealShort} {delayClass}"
	>
		<a
			href={detailHref}
			class="absolute inset-0 z-[1]"
			aria-label={`View ${product.name}`}
			tabindex="-1">&nbsp;</a
		>
		<div class="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-mms-gold transition-transform duration-300 group-hover:scale-x-100"></div>
		<button
			type="button"
			class="absolute right-5 top-5 z-[4] flex size-9 items-center justify-center border border-mms-gold/25 bg-mms-ink2/90 shadow-sm backdrop-blur-sm transition hover:border-mms-gold md:right-7 md:top-7 {loved
				? '[&_svg]:fill-mms-gold [&_svg]:stroke-mms-gold'
				: ''}"
			aria-pressed={loved}
			aria-label={loved ? 'Remove from wishlist' : 'Add to wishlist'}
			onclick={handleWishlist}
		>
			<svg class="size-3.5 fill-none stroke-mms-muted stroke-[1.5] transition hover:stroke-mms-gold" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
				/>
			</svg>
		</button>
		<div class="pointer-events-none relative z-[2] flex h-[7.5rem] items-center justify-center md:h-32">
			{#if heroImageSrc}
				<img
					src={heroImageSrc}
					alt={product.name}
					class="max-h-[7rem] w-auto max-w-[5.5rem] object-contain md:max-h-[7.5rem] md:max-w-[6.5rem]"
					loading="lazy"
					decoding="async"
				/>
			{:else}
				<CollectionBottleArt height={100} />
			{/if}
		</div>
		<div class="pointer-events-none relative z-[2] min-w-0">
			<div class="mb-2 flex flex-wrap gap-2">
				{#if product.badge}
					<span class={badgeClass(product.badge)}>{badgeLabels[product.badge]}</span>
				{/if}
			</div>
			<p
				class="mb-1 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-mms-gold-dim before:block before:h-px before:w-3 before:bg-mms-gold-dim"
			>
				{product.country} · {product.region}
			</p>
			<h3 class="font-mms-display text-xl text-mms-cream md:text-[1.6rem]">{product.name}</h3>
			<div class="mt-3 flex gap-6">
				<div class="text-center">
					<span class="font-mms-display block text-lg text-mms-cream">{ageLabel(product.age)}</span>
					<span class="text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">Age</span>
				</div>
				<div class="text-center">
					<span class="font-mms-display block text-lg text-mms-cream">{product.abv}%</span>
					<span class="text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">ABV</span>
				</div>
				<div class="text-center">
					<span class="font-mms-display block text-lg text-mms-cream">{product.rating}</span>
					<span class="text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">Score</span>
				</div>
			</div>
		</div>
		<div class="pointer-events-none relative z-[2] hidden min-w-[200px] flex-col items-end gap-3 md:flex">
			<span class="font-mms-display text-xl text-mms-gold md:text-[1.4rem]">{formatPrice(product.price)}</span>
			{#if maxStockQty !== null}
				<span class="text-[0.56rem] uppercase tracking-[0.16em] {isOutOfStock ? 'text-red-400' : 'text-mms-muted'}">
					{isOutOfStock ? 'Out of stock' : `In stock: ${maxStockQty}`}
				</span>
			{/if}
			<div class="pointer-events-auto relative z-[3] flex max-w-full items-center gap-2">
				<div class="flex shrink-0 items-stretch border border-mms-gold/25 bg-mms-ink2">
					<button
						type="button"
						class="w-9 bg-transparent font-mms-sans text-mms-cream transition hover:bg-mms-gold/10"
						aria-label="Decrease quantity"
						onclick={(e) => {
							e.stopPropagation();
							bumpQty(-1);
						}}>−</button
					>
					<span
						class="flex min-w-[2.25rem] items-center justify-center border-x border-mms-gold/15 font-mms-sans text-[0.8rem] tabular-nums text-mms-cream"
						>{qty}</span
					>
					<button
						type="button"
						class="w-9 bg-transparent font-mms-sans text-mms-cream transition hover:bg-mms-gold/10 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
						aria-label="Increase quantity"
						disabled={isOutOfStock || (maxStockQty !== null && qty >= maxStockQty)}
						onclick={(e) => {
							e.stopPropagation();
							bumpQty(1);
						}}>+</button
					>
				</div>
				<button
					type="button"
					class="min-w-0 shrink whitespace-nowrap border border-mms-gold/30 bg-transparent px-4 py-2.5 font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold transition hover:bg-mms-gold hover:text-mms-ink disabled:cursor-not-allowed disabled:border-mms-gold/15 disabled:text-mms-muted disabled:hover:bg-transparent"
					disabled={isOutOfStock}
					onclick={handleAddToCart}
				>{isOutOfStock ? 'Out of stock' : 'Add to cart'}</button>
			</div>
		</div>
	</div>
{:else}
	<div
		class="product-card group reveal relative cursor-pointer bg-mms-ink2 p-8 transition-colors hover:bg-mms-ink3 md:px-7 md:pb-8 md:pt-8 {mmsRevealShort} {delayClass}"
	>
		<a
			href={detailHref}
			class="absolute inset-0 z-[1]"
			aria-label={`View ${product.name}`}
			tabindex="-1">&nbsp;</a
		>
		<div class="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-mms-gold transition-transform duration-300 group-hover:scale-x-100"></div>
		<button
			type="button"
			class="absolute right-5 top-5 z-[4] flex size-9 items-center justify-center border border-mms-gold/25 bg-mms-ink2/90 shadow-sm backdrop-blur-sm transition hover:border-mms-gold md:right-7 md:top-7 {loved
				? '[&_svg]:fill-mms-gold [&_svg]:stroke-mms-gold'
				: ''}"
			aria-pressed={loved}
			aria-label={loved ? 'Remove from wishlist' : 'Add to wishlist'}
			onclick={handleWishlist}
		>
			<svg class="size-3.5 fill-none stroke-mms-muted stroke-[1.5] transition hover:stroke-mms-gold" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
				/>
			</svg>
		</button>
		<div class="pointer-events-none relative z-[2] mb-7 flex min-h-[240px] items-center justify-center md:h-[300px]">
			<div class="absolute left-0 top-0 z-[1] flex max-w-[calc(100%-3rem)] flex-col gap-1 pr-2">
				{#if product.badge}
					<span class={badgeClass(product.badge)}>{badgeLabels[product.badge]}</span>
				{/if}
			</div>
			{#if heroImageSrc}
				<img
					src={heroImageSrc}
					alt={product.name}
					class="max-h-[min(52vw,260px)] w-auto max-w-[min(100%,220px)] object-contain md:max-h-[280px] md:max-w-[260px]"
					loading="lazy"
					decoding="async"
				/>
			{:else}
				<CollectionBottleArt height={220} />
			{/if}
		</div>
		<p
			class="pointer-events-none relative z-[2] mb-2 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-mms-gold-dim before:block before:h-px before:w-3 before:bg-mms-gold-dim"
		>
			{product.country} · {product.region}
		</p>
		<h3 class="pointer-events-none relative z-[2] font-mms-display mb-2 text-[1.4rem] font-normal leading-tight text-mms-cream">{product.name}</h3>
		<p class="pointer-events-none relative z-[2] mb-5 text-[0.75rem] font-light leading-relaxed text-mms-muted">{product.desc}</p>
		<div class="pointer-events-none relative z-[2] mb-6 flex gap-6">
			<div class="text-center">
				<span class="font-mms-display block text-lg text-mms-cream">{ageLabel(product.age)}</span>
				<span class="text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">Age</span>
			</div>
			<div class="text-center">
				<span class="font-mms-display block text-lg text-mms-cream">{product.abv}%</span>
				<span class="text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">ABV</span>
			</div>
			<div class="text-center">
				<span class="font-mms-display block text-lg text-mms-cream">{product.rating}</span>
				<span class="text-[0.55rem] uppercase tracking-[0.15em] text-mms-muted">Score</span>
			</div>
		</div>
		<span class="pointer-events-none relative z-[2] font-mms-display mb-4 block text-[1.6rem] font-light text-mms-gold">{formatPrice(product.price)}</span>
		{#if maxStockQty !== null}
			<p class="pointer-events-none relative z-[2] mb-3 text-[0.58rem] uppercase tracking-[0.16em] {isOutOfStock
				? 'text-red-400'
				: 'text-mms-muted'}">
				{isOutOfStock ? 'Out of stock' : `In stock: ${maxStockQty}`}
			</p>
		{/if}
		<div class="pointer-events-auto relative z-[3] flex items-stretch gap-2">
			<div class="flex shrink-0 items-stretch border border-mms-gold/25 bg-transparent">
				<button
					type="button"
					class="w-9 bg-transparent font-mms-sans text-mms-cream transition hover:bg-mms-gold/10"
					aria-label="Decrease quantity"
					onclick={(e) => {
						e.stopPropagation();
						bumpQty(-1);
					}}>−</button
				>
				<span
					class="flex min-w-[2.25rem] items-center justify-center border-x border-mms-gold/15 font-mms-sans text-[0.85rem] tabular-nums text-mms-cream"
					>{qty}</span
				>
				<button
					type="button"
					class="w-9 bg-transparent font-mms-sans text-mms-cream transition hover:bg-mms-gold/10 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent"
					aria-label="Increase quantity"
					disabled={isOutOfStock || (maxStockQty !== null && qty >= maxStockQty)}
					onclick={(e) => {
						e.stopPropagation();
						bumpQty(1);
					}}>+</button
				>
			</div>
			<button
				type="button"
				class="min-w-0 flex-1 border border-mms-gold/30 bg-transparent px-2 py-3 font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] text-mms-gold transition hover:bg-mms-gold hover:text-mms-ink disabled:cursor-not-allowed disabled:border-mms-gold/15 disabled:text-mms-muted disabled:hover:bg-transparent"
				disabled={isOutOfStock}
				onclick={handleAddToCart}
			>{isOutOfStock ? 'Out of stock' : 'Add to cart'}</button>
		</div>
	</div>
{/if}
