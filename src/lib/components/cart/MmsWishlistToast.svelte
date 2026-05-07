<script lang="ts">
	import { wishlistFeedback } from '$lib/wishlist/mms-wishlist';
</script>

{#if $wishlistFeedback}
	<div
		class="pointer-events-none fixed left-1/2 top-[max(5rem,calc(env(safe-area-inset-top,0px)+4.25rem))] z-[230] max-w-[min(90vw,28rem)] -translate-x-1/2 px-4"
		role="status"
		aria-live="polite"
	>
		<div
			class="pointer-events-auto border px-5 py-3.5 font-mms-sans text-[0.8rem] leading-snug shadow-lg backdrop-blur-sm {$wishlistFeedback.tone === 'in'
				? 'border-emerald-700/40 bg-emerald-950/95 text-emerald-100'
				: 'border-mms-gold/30 bg-mms-ink2/95 text-mms-cream'}"
		>
			{$wishlistFeedback.message}
		</div>
	</div>
{/if}
