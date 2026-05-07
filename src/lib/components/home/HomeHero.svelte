<script lang="ts">
	import { mmsReveal } from '$lib/mms-tailwind';
</script>

<section
	class="relative grid min-h-screen grid-cols-1 overflow-hidden lg:grid-cols-2"
	aria-labelledby="hero-heading"
>
	<div class="relative z-[2] flex flex-col justify-center px-6 pb-16 pt-28 md:px-12 md:pb-16 md:pl-16 md:pt-36 lg:pr-8">
		<p
			class="mb-8 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.35em] text-mms-gold before:block before:h-px before:w-10 before:bg-mms-gold {mmsReveal}"
		>
			Curated spirits since 1998
		</p>
		<h1
			id="hero-heading"
			class="font-mms-display text-[clamp(2.25rem,6vw,5.5rem)] font-light leading-[0.95] tracking-tight text-mms-cream {mmsReveal} delay-100"
		>
			Where <em class="text-mms-gold-light not-italic">Origin</em><br />
			Becomes<br />
			Excellence
		</h1>
		<p
			class="mb-12 max-w-[340px] text-[0.85rem] font-light leading-[1.8] tracking-wide text-mms-muted {mmsReveal} delay-200"
		>
			MMS curates the world’s most distinguished liquors — from the peat-smoked isles of Scotland to the agave fields
			of Jalisco. Each bottle, a story of heritage.
		</p>
		<div class="flex flex-wrap items-center gap-6 {mmsReveal} delay-300">
			<a
				href="#collections"
				class="inline-block bg-mms-gold px-9 py-4 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-mms-ink no-underline transition hover:-translate-y-px hover:bg-mms-gold-light"
				>Explore collection</a>
			<a
				href="#story"
				class="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.15em] text-mms-cream/70 no-underline transition after:translate-x-0 after:transition-transform hover:text-mms-cream hover:after:translate-x-1 after:content-['→']"
				>Our story</a>
		</div>
		<div
			class="absolute bottom-10 left-6 hidden items-center gap-4 text-[0.6rem] uppercase tracking-[0.2em] text-mms-muted md:left-16 lg:flex"
		>
			<div class="h-px w-10 origin-left bg-mms-gold-dim animate-mms-scroll-line"></div>
			Scroll to discover
		</div>
	</div>
	<div class="relative hidden items-center justify-center lg:flex">
		<div
			class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_60%_50%,rgba(201,168,76,0.08),transparent_70%)]"
		></div>
		<div class="relative z-[2] flex h-full items-center justify-center pt-20">
			<svg
				class="opacity-85"
				width="180"
				height="500"
				viewBox="0 0 180 500"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<line x1="90" y1="0" x2="90" y2="60" stroke="rgba(201,168,76,0.2)" stroke-width="1" />
				<rect x="72" y="60" width="36" height="18" rx="2" fill="rgba(201,168,76,0.3)" stroke="rgba(201,168,76,0.5)" stroke-width="0.5" />
				<path
					d="M72 78 Q68 100 62 130 L62 180 L118 180 Q112 100 108 78Z"
					fill="rgba(201,168,76,0.08)"
					stroke="rgba(201,168,76,0.35)"
					stroke-width="0.8"
				/>
				<path
					d="M62 180 Q50 195 44 220 L44 420 Q44 440 90 440 Q136 440 136 420 L136 220 Q130 195 118 180Z"
					fill="rgba(201,168,76,0.06)"
					stroke="rgba(201,168,76,0.3)"
					stroke-width="0.8"
				/>
				<rect x="54" y="240" width="72" height="120" rx="1" fill="rgba(201,168,76,0.05)" stroke="rgba(201,168,76,0.2)" stroke-width="0.5" />
				<line x1="60" y1="258" x2="120" y2="258" stroke="rgba(201,168,76,0.2)" stroke-width="0.5" />
				<line x1="60" y1="342" x2="120" y2="342" stroke="rgba(201,168,76,0.2)" stroke-width="0.5" />
				<text
					x="90"
					y="285"
					text-anchor="middle"
					font-family="'Bebas Neue',sans-serif"
					font-size="11"
					fill="rgba(201,168,76,0.5)"
					letter-spacing="4">MMS</text>
				<text
					x="90"
					y="310"
					text-anchor="middle"
					font-family="'Cormorant Garamond',serif"
					font-size="7"
					fill="rgba(201,168,76,0.35)"
					letter-spacing="1">MAISON DE</text>
				<text
					x="90"
					y="323"
					text-anchor="middle"
					font-family="'Cormorant Garamond',serif"
					font-size="7"
					fill="rgba(201,168,76,0.35)"
					letter-spacing="1">SPIRITUEUX</text>
				<rect x="44" y="420" width="92" height="20" rx="2" fill="rgba(201,168,76,0.1)" stroke="rgba(201,168,76,0.25)" stroke-width="0.5" />
				<path d="M46 340 L46 420 Q46 438 90 438 Q134 438 134 420 L134 340Z" fill="rgba(201,168,76,0.04)" />
				<line x1="70" y1="140" x2="70" y2="400" stroke="rgba(201,168,76,0.08)" stroke-width="8" />
				<rect x="66" y="100" width="48" height="2" rx="1" fill="none" stroke="rgba(201,168,76,0.2)" stroke-width="0.5" />
				<rect x="64" y="110" width="52" height="2" rx="1" fill="none" stroke="rgba(201,168,76,0.15)" stroke-width="0.5" />
			</svg>
		</div>
		<p
			class="pointer-events-none absolute right-12 top-[35%] font-mms-display text-[0.7rem] uppercase tracking-[0.2em] text-mms-gold/30 [writing-mode:vertical-rl]"
			aria-hidden="true"
		>
			Rare · Refined · Reserve
		</p>
	</div>
</section>
