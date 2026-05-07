<script lang="ts">
	import { MMS_ORIGIN_TAB_ORDER, originTabLabel, type OriginKey } from '$lib/data/mms-origins';
	import { mmsOriginsHref } from '$lib/data/mms-site-nav';
	import { MMS_MEGA_ORIGINS_PROMOS } from '$lib/data/mms-mega-nav';

	type Props = {
		originsPath: string;
		activeOrigin: OriginKey;
	};

	let { originsPath, activeOrigin }: Props = $props();

	const promos = $derived([
		{ ...MMS_MEGA_ORIGINS_PROMOS[0], href: mmsOriginsHref(originsPath, 'scotland') },
		{ ...MMS_MEGA_ORIGINS_PROMOS[1], href: mmsOriginsHref(originsPath, 'mexico') },
		{ ...MMS_MEGA_ORIGINS_PROMOS[2], href: mmsOriginsHref(originsPath, 'france') }
	]);

	const head = 'mb-5 flex items-center gap-3 border-b border-mms-gold/25 pb-3';
	const headLabel = 'font-mms-sans text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-mms-gold';
	const headRule = 'h-px w-8 shrink-0 bg-mms-gold/80';

	function linkClass(active: boolean) {
		return `block rounded-sm px-1.5 py-2.5 text-[0.8rem] font-light leading-snug tracking-wide text-mms-cream/90 no-underline outline-none transition-colors hover:bg-mms-gold/[0.08] hover:text-mms-gold focus-visible:ring-1 focus-visible:ring-mms-gold/50 ${active ? 'bg-mms-gold/12 text-mms-gold' : ''}`;
	}
</script>

<div
	class="mx-auto grid max-w-[1480px] gap-12 px-6 py-11 sm:px-10 lg:grid-cols-[minmax(0,200px)_minmax(0,1fr)_minmax(280px,380px)] lg:gap-16 lg:px-14 lg:py-14"
>
	<div class="min-w-0 lg:px-1 lg:pt-0.5">
		<p class={head}>
			<span class={headRule} aria-hidden="true"></span>
			<span class={headLabel}>Geography</span>
		</p>
		<nav class="flex flex-col gap-0.5" aria-label="Origins regions">
			{#each MMS_ORIGIN_TAB_ORDER as key}
				<a href={mmsOriginsHref(originsPath, key)} class={linkClass(activeOrigin === key)}>{originTabLabel(key)}</a>
			{/each}
		</nav>
	</div>

	<div class="hidden min-w-0 border-t border-mms-gold/15 pt-10 lg:block lg:border-l lg:border-t-0 lg:px-10 lg:pt-0.5">
		<p class={head}>
			<span class={headRule} aria-hidden="true"></span>
			<span class={headLabel}>Narrative</span>
		</p>
		<p class="max-w-lg text-[0.84rem] font-light leading-[1.85] text-mms-cream/75">
			Each region traces water, grain, climate, and craft — the provenance behind what ends up in your glass.
		</p>
	</div>

	<div
		class="flex min-w-0 flex-col gap-5 border-t border-mms-gold/15 pt-10 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0.5"
	>
		<p class="font-mms-sans text-[0.6rem] uppercase tracking-[0.22em] text-mms-muted lg:hidden">Highlights</p>
		<a
			href={promos[2].href}
			class="group relative flex min-h-[160px] overflow-hidden rounded border border-mms-gold/25 bg-mms-ink3 shadow-[inset_0_0_0_1px_rgba(201,168,76,0.06)]"
		>
			<img
				src={promos[2].image}
				alt={promos[2].imageAlt}
				class="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.03]"
				loading="lazy"
				width="640"
				height="520"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-mms-ink via-mms-ink/75 to-mms-ink/10"></div>
			<div class="relative z-[1] mt-auto p-6">
				{#if promos[2].logoText}
					<p class="font-mms-logo mb-2 text-xl tracking-[0.28em] text-mms-gold">{promos[2].logoText}</p>
				{/if}
				<p class="text-[0.62rem] font-medium uppercase tracking-[0.22em] text-mms-gold-light">{promos[2].eyebrow}</p>
				<p class="font-mms-display mt-1 text-2xl font-light leading-tight text-mms-cream">{promos[2].title}</p>
				{#if promos[2].subtitle}
					<p class="mt-2 max-w-sm text-[0.8rem] font-light leading-relaxed text-mms-cream/75">{promos[2].subtitle}</p>
				{/if}
			</div>
		</a>
		<div class="grid grid-cols-2 gap-4">
			{#each promos.slice(0, 2) as p}
				<a
					href={p.href}
					class="group relative flex aspect-[4/5] min-h-[210px] flex-col overflow-hidden rounded border border-mms-gold/25 bg-mms-ink3 shadow-[inset_0_0_0_1px_rgba(201,168,76,0.06)]"
				>
					<img
						src={p.image}
						alt={p.imageAlt}
						class="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-[1.04]"
						loading="lazy"
						width="720"
						height="900"
					/>
					<div class="absolute inset-0 bg-gradient-to-t from-mms-ink via-mms-ink/65 to-transparent"></div>
					<div class="relative z-[1] mt-auto p-5">
						{#if p.logoText}
							<p class="font-mms-logo mb-1.5 text-base tracking-[0.32em] text-mms-gold">{p.logoText}</p>
						{/if}
						<p class="text-[0.58rem] font-medium uppercase tracking-[0.2em] text-mms-gold-light">{p.eyebrow}</p>
						<p class="font-mms-display mt-1 text-lg font-light leading-snug text-mms-cream">{p.title}</p>
						{#if p.subtitle}
							<p class="mt-2 line-clamp-2 text-[0.72rem] font-light leading-snug text-mms-cream/70">{p.subtitle}</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	</div>
</div>
