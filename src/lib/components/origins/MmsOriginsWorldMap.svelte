<script lang="ts">
	import type { OriginKey } from '$lib/data/mms-origins';
	import { MMS_ORIGIN_MAP_PINS } from '$lib/data/mms-origins';
	import { mmsReveal } from '$lib/mms-tailwind';

	let {
		onPick
	}: {
		onPick: (key: OriginKey) => void;
	} = $props();

	let mapWrapEl = $state<HTMLDivElement | undefined>();
	let tooltipVisible = $state(false);
	let ttCountry = $state('');
	let ttSpirit = $state('');
	let ttLabels = $state('');
	let tipLeft = $state(0);
	let tipTop = $state(0);

	function showTip(pin: (typeof MMS_ORIGIN_MAP_PINS)[number]) {
		ttCountry = pin.country;
		ttSpirit = pin.spirit;
		ttLabels = pin.labels;
		tooltipVisible = true;
	}

	function moveTip(e: MouseEvent) {
		if (!mapWrapEl || !tooltipVisible) return;
		const rect = mapWrapEl.getBoundingClientRect();
		let x = e.clientX - rect.left + 16;
		let y = e.clientY - rect.top + 16;
		if (x + 200 > rect.width) x = e.clientX - rect.left - 216;
		tipLeft = x;
		tipTop = y;
	}

	function hideTip() {
		tooltipVisible = false;
	}
</script>

<section class="map-section px-6 py-8 md:px-16 md:py-16">
	<p class={`map-section-title mb-8 flex items-center gap-4 text-[0.65rem] uppercase tracking-[0.3em] text-mms-gold before:block before:h-px before:w-8 before:bg-mms-gold ${mmsReveal}`}>
		Sourced Worldwide
	</p>
	<div
		bind:this={mapWrapEl}
		class={`map-wrap relative overflow-hidden border border-mms-gold/10 bg-mms-ink2 ${mmsReveal}`}
	>
		<div
			class="pointer-events-none absolute z-10 min-w-[180px] border border-mms-gold/30 bg-mms-ink3 px-5 py-4 transition-opacity duration-200 {tooltipVisible
				? 'opacity-100'
				: 'opacity-0'}"
			style="left: {tipLeft}px; top: {tipTop}px;"
			role="status"
		>
			<p class="mb-1 text-[0.6rem] uppercase tracking-[0.2em] text-mms-gold-dim">{ttCountry}</p>
			<p class="font-mms-display mb-1 text-xl font-normal text-mms-cream">{ttSpirit}</p>
			<p class="text-[0.72rem] text-mms-muted">{ttLabels}</p>
		</div>

		<svg class="block w-full text-mms-gold" viewBox="0 0 900 450" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
			<rect width="900" height="450" fill="#111009" />
			<path
				d="M80 80 L200 70 L230 90 L240 130 L220 160 L200 200 L180 230 L160 250 L130 260 L100 250 L80 220 L60 180 L50 140 L60 100Z"
				fill="#1A1713"
				stroke="rgba(201,168,76,0.12)"
				stroke-width="0.8"
			/>
			<path
				d="M160 270 L200 260 L220 280 L225 320 L210 370 L190 400 L170 410 L150 390 L140 350 L145 300 L150 275Z"
				fill="#1A1713"
				stroke="rgba(201,168,76,0.12)"
				stroke-width="0.8"
			/>
			<path
				d="M390 60 L440 55 L460 70 L455 100 L440 120 L410 130 L390 120 L375 100 L380 75Z"
				fill="#1A1713"
				stroke="rgba(201,168,76,0.12)"
				stroke-width="0.8"
			/>
			<path
				d="M400 140 L450 130 L470 150 L475 200 L465 250 L450 300 L430 330 L410 340 L390 320 L375 270 L370 210 L375 160 L390 140Z"
				fill="#1A1713"
				stroke="rgba(201,168,76,0.12)"
				stroke-width="0.8"
			/>
			<path
				d="M460 60 L560 50 L620 60 L650 80 L660 110 L640 140 L600 150 L560 140 L520 150 L500 140 L470 120 L455 100 L460 70Z"
				fill="#1A1713"
				stroke="rgba(201,168,76,0.12)"
				stroke-width="0.8"
			/>
			<path
				d="M560 150 L620 140 L660 150 L680 170 L670 200 L640 210 L600 200 L570 190 L555 170Z"
				fill="#1A1713"
				stroke="rgba(201,168,76,0.12)"
				stroke-width="0.8"
			/>
			<path
				d="M700 80 L715 75 L720 90 L710 105 L698 100 L695 88Z"
				fill="#1A1713"
				stroke="rgba(201,168,76,0.12)"
				stroke-width="0.8"
			/>
			<path
				d="M680 280 L740 270 L770 290 L775 330 L755 360 L720 365 L690 345 L675 310 L680 285Z"
				fill="#1A1713"
				stroke="rgba(201,168,76,0.12)"
				stroke-width="0.8"
			/>
			<line x1="0" y1="225" x2="900" y2="225" stroke="rgba(201,168,76,0.04)" stroke-width="1" />
			<line x1="450" y1="0" x2="450" y2="450" stroke="rgba(201,168,76,0.04)" stroke-width="1" />
			<line x1="225" y1="0" x2="225" y2="450" stroke="rgba(201,168,76,0.025)" stroke-width="0.5" />
			<line x1="675" y1="0" x2="675" y2="450" stroke="rgba(201,168,76,0.025)" stroke-width="0.5" />

			{#each MMS_ORIGIN_MAP_PINS as pin, i (i)}
				<g
					transform="translate({pin.x},{pin.y})"
					class="cursor-pointer transition-transform duration-200 hover:scale-[1.3]"
					role="button"
					tabindex="0"
					onmouseenter={() => showTip(pin)}
					onmousemove={moveTip}
					onmouseleave={hideTip}
					onclick={() => onPick(pin.key)}
					onkeydown={(e) => {
						if (e.key === 'Enter' || e.key === ' ') {
							e.preventDefault();
							onPick(pin.key);
						}
					}}
				>
					<circle
						r={pin.outerR}
						fill="rgba(201,168,76,0.08)"
						class="origin-pin-pulse"
						style={pin.pulseDelay ? `animation-delay: ${pin.pulseDelay}` : ''}
					/>
					<circle
						r={pin.innerR}
						fill="rgba(201,168,76,0.3)"
						stroke="currentColor"
						stroke-width="1.5"
					/>
					<circle r="2" fill="currentColor" />
				</g>
			{/each}

			<g transform="translate(18,410)">
				<circle r="5" fill="rgba(201,168,76,0.3)" stroke="currentColor" stroke-width="1.5" cx="6" cy="0" />
				<circle r="2" fill="currentColor" cx="6" cy="0" />
				<text
					x="16"
					y="4"
					font-family="DM Sans, sans-serif"
					font-size="9"
					fill="rgba(201,168,76,0.5)"
					letter-spacing="1">SOURCING ORIGIN</text>
			</g>
		</svg>
	</div>
</section>

<style>
	.origin-pin-pulse {
		animation: mms-pin-pulse 2.5s ease-in-out infinite;
		transform-origin: center;
	}
</style>
