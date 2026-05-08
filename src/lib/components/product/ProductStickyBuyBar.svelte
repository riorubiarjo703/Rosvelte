<script lang="ts">
	import CollectionBottleArt from '$lib/components/collections/CollectionBottleArt.svelte';

	let {
		visible,
		thumbSrc = null,
		thumbAlt = '',
		name,
		priceLabel,
		score,
		qty,
		onAdd,
		added,
		disabled = false
	}: {
		visible: boolean;
		/** Primary product photo (public catalogue URL) */
		thumbSrc?: string | null;
		thumbAlt?: string;
		name: string;
		priceLabel: string;
		score: number;
		qty: number;
		onAdd: () => void;
		added: boolean;
		disabled?: boolean;
	} = $props();
</script>

<div
	class="fixed inset-x-0 bottom-0 z-[95] border-t border-mms-gold/15 bg-mms-ink/97 px-4 py-3 backdrop-blur-md transition-transform duration-300 md:px-10 md:py-4 {visible
		? 'translate-y-0'
		: 'translate-y-full'}"
	aria-hidden={!visible}
>
	<div class="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
		<div class="flex min-w-0 items-center gap-3 sm:gap-5">
			<div
				class="flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded border border-mms-gold/15 bg-mms-ink2 sm:size-[5.25rem]"
			>
				{#if thumbSrc}
					<img
						src={thumbSrc}
						alt={thumbAlt}
						class="max-h-full max-w-full object-contain p-1"
						loading="lazy"
						decoding="async"
					/>
				{:else}
					<CollectionBottleArt height={52} />
				{/if}
			</div>
			<div class="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
				<span class="truncate font-mms-display text-lg font-light text-mms-cream md:text-xl">{name}</span>
				<span class="font-mms-display text-xl text-mms-gold md:text-2xl">{priceLabel}</span>
				<span class="font-mms-display text-sm text-mms-muted md:text-base">
					Score <strong class="text-mms-gold">{score}</strong>/100
				</span>
			</div>
		</div>
		<div class="flex shrink-0 items-center gap-3">
			<span class="font-mms-sans text-[0.62rem] uppercase tracking-[0.15em] text-mms-muted">Qty {qty}</span>
			<button
				type="button"
				class="min-w-[10rem] px-6 py-3 font-mms-sans text-[0.65rem] uppercase tracking-[0.2em] transition md:min-w-[12rem] {added
					? 'bg-emerald-700 text-white hover:bg-emerald-600'
					: 'bg-mms-gold text-mms-ink hover:bg-mms-gold-light'} disabled:cursor-not-allowed disabled:bg-mms-gold/20 disabled:text-mms-muted"
				disabled={disabled}
				onclick={onAdd}
			>
				{#if disabled}
					Out of stock
				{:else}
					{added ? 'Added ✓' : 'Add to cart'}
				{/if}
			</button>
		</div>
	</div>
</div>
