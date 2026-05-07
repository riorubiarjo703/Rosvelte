<script lang="ts">
	import { mmsReveal } from '$lib/mms-tailwind';

	/** Unique suffix when multiple blocks exist on one document (a11y ids). */
	let { id = 'nl' }: { id?: string } = $props();

	const headingId = $derived(`${id}-heading`);
	const emailId = $derived(`${id}-email`);
</script>

<section
	class="mms-site-newsletter grid gap-10 border-t border-mms-gold/12 px-6 py-16 md:grid-cols-2 md:items-center md:gap-16 md:px-12 md:py-24"
	aria-labelledby={headingId}
>
	<div class={mmsReveal}>
		<h2
			id={headingId}
			class="font-mms-display text-[clamp(1.5rem,3vw,2.8rem)] font-light leading-tight text-mms-cream"
		>
			First access to<br /><em class="text-mms-gold not-italic">rare allocations</em>
		</h2>
		<p class="mt-4 text-[0.82rem] font-light leading-[1.7] text-mms-muted">
			Join 40,000 members who receive our curated selections, tasting notes and exclusive pre-releases before anyone
			else.
		</p>
	</div>
	<div class="{mmsReveal} delay-100">
		<form class="flex flex-col border border-mms-gold/25 md:flex-row" onsubmit={(e) => e.preventDefault()}>
			<label class="sr-only" for={emailId}>Email address</label>
			<input
				id={emailId}
				class="min-h-12 flex-1 border-0 bg-transparent px-5 py-4 font-mms-sans text-[0.82rem] text-mms-cream placeholder:text-mms-muted focus:outline-none focus:ring-1 focus:ring-mms-gold"
				type="email"
				autocomplete="email"
				placeholder="Your email address"
			/>
			<button
				type="submit"
				class="min-h-12 bg-mms-gold px-8 font-mms-sans text-[0.65rem] font-medium uppercase tracking-[0.2em] text-mms-ink transition hover:bg-mms-gold-light md:px-8"
				>Join the list</button>
		</form>
		<p class="mt-3 text-[0.65rem] tracking-wide text-mms-muted">
			By subscribing you confirm you are of legal drinking age in your country.
		</p>
	</div>
</section>
