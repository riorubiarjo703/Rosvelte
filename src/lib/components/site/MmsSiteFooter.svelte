<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { deLocalizeUrl } from '$lib/paraglide/runtime';

	const delocalizedPath = $derived(deLocalizeUrl(page.url).pathname);
	const isHome = $derived(delocalizedPath === '/' || delocalizedPath === '');

	function sectionHref(hash: string) {
		const h = hash.startsWith('#') ? hash : `#${hash}`;
		if (isHome) return h;
		return `${resolve('/')}${h}`;
	}
</script>

<div class="contents">
	<footer
		class="grid gap-10 border-t border-mms-gold/10 px-6 py-12 md:grid-cols-2 md:gap-12 md:px-12 md:py-16 lg:grid-cols-[200px_1fr_1fr_1fr]"
	>
		<div>
			<p class="font-mms-logo mb-3 text-[1.8rem] tracking-[0.3em] text-mms-gold">MMS</p>
			<p class="max-w-xs text-[0.72rem] font-light leading-relaxed text-mms-muted">
				Maison de spiritueux — sourcing the world’s finest liquors since 1998.
			</p>
		</div>
		<div>
			<h4 class="mb-5 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">Collection</h4>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#collections')}>Scotch whisky</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#collections')}>Cognac &amp; Armagnac</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#collections')}>Japanese whisky</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#collections')}>Tequila &amp; mezcal</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={resolve('/collections')}>Rum</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#collections')}>Gift sets</a>
		</div>
		<div>
			<h4 class="mb-5 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">Company</h4>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={resolve('/about')}>About MMS</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#story')}>Our curators</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#journal')}>The journal</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#events')}>Tasting events</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#membership')}>Membership</a>
		</div>
		<div>
			<h4 class="mb-5 text-[0.6rem] uppercase tracking-[0.25em] text-mms-gold-dim">Support</h4>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#delivery')}>Delivery info</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#returns')}>Returns</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#contact')}>Contact</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#privacy')}>Privacy policy</a>
			<a
				class="mb-2 block text-[0.78rem] text-mms-muted no-underline transition hover:text-mms-cream"
				href={sectionHref('#terms')}>Terms</a>
		</div>
	</footer>
	<div
		class="flex flex-col gap-3 border-t border-mms-gold/[0.06] px-6 py-6 text-center md:flex-row md:items-center md:justify-between md:px-12 md:text-left"
	>
		<p class="text-[0.68rem] tracking-wide text-mms-muted/50">
			© {new Date().getFullYear()} MMS — Maison de spiritueux. All rights reserved.
		</p>
		<p class="text-[0.65rem] uppercase tracking-[0.15em] text-mms-gold-dim">For adults of legal drinking age only</p>
	</div>
</div>
