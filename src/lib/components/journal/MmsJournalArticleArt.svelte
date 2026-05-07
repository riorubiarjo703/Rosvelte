<script lang="ts">
	import type { JournalArticleCat } from '$lib/data/mms-journal';

	let {
		cat,
		size = 80
	}: {
		cat: JournalArticleCat;
		size?: number;
	} = $props();

	const accent = 'rgba(201,168,76,0.5)';
</script>

{#if cat === 'tasting'}
	<svg width={size} height={size * 1.5} viewBox="0 0 60 90" fill="none" class="opacity-[0.55]" aria-hidden="true">
		<path
			d="M20 5 Q18 25 16 38 L16 78 Q16 84 30 84 Q44 84 44 78 L44 38 Q42 25 40 5Z"
			stroke={accent}
			stroke-width="0.8"
			fill="rgba(201,168,76,0.05)"
		/>
		<rect x="22" y="42" width="16" height="26" rx="0.5" stroke="rgba(201,168,76,0.3)" stroke-width="0.5" fill="none" />
		<text
			x="30"
			y="50"
			text-anchor="middle"
			font-family="Bebas Neue, sans-serif"
			font-size="4"
			fill="rgba(201,168,76,0.6)"
			letter-spacing="1">MMS</text>
		<line x1="23" y1="55" x2="37" y2="55" stroke="rgba(201,168,76,0.2)" stroke-width="0.5" />
		<rect x="22" y="5" width="16" height="8" rx="1" fill="rgba(201,168,76,0.3)" stroke={accent} stroke-width="0.5" />
		<rect x="16" y="78" width="28" height="5" rx="1" fill="rgba(201,168,76,0.12)" stroke="rgba(201,168,76,0.3)" stroke-width="0.5" />
	</svg>
{:else if cat === 'distillery'}
	<svg width={size * 1.2} height={size} viewBox="0 0 100 80" fill="none" class="opacity-[0.45]" aria-hidden="true">
		<rect x="10" y="40" width="25" height="35" stroke="rgba(201,168,76,0.4)" stroke-width="0.8" fill="rgba(201,168,76,0.04)" />
		<path d="M10 40 L22 20 L35 40Z" stroke="rgba(201,168,76,0.35)" stroke-width="0.8" fill="rgba(201,168,76,0.05)" />
		<rect x="45" y="30" width="40" height="45" stroke="rgba(201,168,76,0.4)" stroke-width="0.8" fill="rgba(201,168,76,0.04)" />
		<path d="M45 30 L65 5 L85 30Z" stroke="rgba(201,168,76,0.35)" stroke-width="0.8" fill="rgba(201,168,76,0.05)" />
		<line x1="58" y1="30" x2="58" y2="75" stroke="rgba(201,168,76,0.15)" stroke-width="0.5" />
		<line x1="72" y1="30" x2="72" y2="75" stroke="rgba(201,168,76,0.15)" stroke-width="0.5" />
		<circle cx="65" cy="50" r="8" stroke="rgba(201,168,76,0.25)" stroke-width="0.8" fill="rgba(201,168,76,0.06)" />
	</svg>
{:else if cat === 'guide'}
	<svg width={size} height={size} viewBox="0 0 80 80" fill="none" class="opacity-50" aria-hidden="true">
		<rect x="15" y="8" width="50" height="64" rx="1" stroke="rgba(201,168,76,0.4)" stroke-width="0.8" fill="rgba(201,168,76,0.04)" />
		<line x1="24" y1="22" x2="56" y2="22" stroke="rgba(201,168,76,0.25)" stroke-width="0.5" />
		<line x1="24" y1="30" x2="56" y2="30" stroke="rgba(201,168,76,0.25)" stroke-width="0.5" />
		<line x1="24" y1="38" x2="48" y2="38" stroke="rgba(201,168,76,0.25)" stroke-width="0.5" />
		<circle cx="40" cy="55" r="12" stroke="rgba(201,168,76,0.4)" stroke-width="0.8" fill="rgba(201,168,76,0.06)" />
		<path d="M36 52 L36 58 L44 55Z" fill="rgba(201,168,76,0.4)" />
	</svg>
{:else if cat === 'history'}
	<svg width={size} height={size} viewBox="0 0 80 80" fill="none" class="opacity-50" aria-hidden="true">
		<circle cx="40" cy="40" r="30" stroke="rgba(201,168,76,0.3)" stroke-width="0.8" fill="rgba(201,168,76,0.03)" />
		<circle cx="40" cy="40" r="22" stroke="rgba(201,168,76,0.2)" stroke-width="0.5" fill="none" />
		<line x1="40" y1="18" x2="40" y2="40" stroke="rgba(201,168,76,0.5)" stroke-width="1" />
		<line x1="40" y1="40" x2="55" y2="48" stroke="rgba(201,168,76,0.4)" stroke-width="0.8" />
		<circle cx="40" cy="40" r="2.5" fill="rgba(201,168,76,0.7)" />
		<line x1="40" y1="10" x2="40" y2="14" stroke="rgba(201,168,76,0.4)" stroke-width="1" />
		<line x1="40" y1="66" x2="40" y2="70" stroke="rgba(201,168,76,0.4)" stroke-width="1" />
		<line x1="10" y1="40" x2="14" y2="40" stroke="rgba(201,168,76,0.4)" stroke-width="1" />
		<line x1="66" y1="40" x2="70" y2="40" stroke="rgba(201,168,76,0.4)" stroke-width="1" />
	</svg>
{:else if cat === 'pairing'}
	<svg width={size} height={size} viewBox="0 0 80 80" fill="none" class="opacity-50" aria-hidden="true">
		<ellipse cx="28" cy="50" rx="16" ry="22" stroke="rgba(201,168,76,0.4)" stroke-width="0.8" fill="rgba(201,168,76,0.05)" />
		<line x1="28" y1="28" x2="28" y2="15" stroke="rgba(201,168,76,0.4)" stroke-width="0.8" />
		<path d="M18 15 Q28 8 38 15" stroke="rgba(201,168,76,0.35)" stroke-width="0.8" fill="none" />
		<path
			d="M52 20 Q55 15 60 18 Q65 20 63 28 Q60 35 52 32Z"
			stroke="rgba(201,168,76,0.4)"
			stroke-width="0.8"
			fill="rgba(201,168,76,0.05)"
		/>
		<path d="M52 32 Q54 50 55 65" stroke="rgba(201,168,76,0.3)" stroke-width="0.8" />
		<line x1="48" y1="65" x2="62" y2="65" stroke="rgba(201,168,76,0.3)" stroke-width="0.8" />
	</svg>
{:else}
	<!-- howto -->
	<svg width={size} height={size} viewBox="0 0 80 80" fill="none" class="opacity-50" aria-hidden="true">
		<path
			d="M20 60 Q20 30 35 20 Q50 10 55 20 Q60 30 50 40 Q40 50 45 60Z"
			stroke="rgba(201,168,76,0.4)"
			stroke-width="0.8"
			fill="rgba(201,168,76,0.05)"
		/>
		<path d="M35 60 Q35 50 40 45 Q45 40 45 60Z" stroke="rgba(201,168,76,0.3)" stroke-width="0.5" fill="rgba(201,168,76,0.08)" />
		<line x1="22" y1="65" x2="48" y2="65" stroke="rgba(201,168,76,0.4)" stroke-width="1" />
		<line x1="25" y1="70" x2="45" y2="70" stroke="rgba(201,168,76,0.3)" stroke-width="0.8" />
	</svg>
{/if}
