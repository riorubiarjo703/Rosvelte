<script lang="ts">
	import { mmsReveal } from '$lib/mms-tailwind';

	const stats = [
		{ value: '200+', label: 'Curated labels', delay: '' },
		{ value: '18', label: 'Countries of origin', delay: 'delay-100' },
		{ value: '25+', label: 'Years of expertise', delay: 'delay-200' },
		{ value: '40k', label: 'Members worldwide', delay: 'delay-300' }
	] as const;
</script>

<div
	class="grid grid-cols-2 divide-x divide-y divide-mms-gold/10 border-y border-mms-gold/15 md:grid-cols-4"
	aria-label="Maison highlights"
>
	{#each stats as s (s.label)}
		<div class="px-4 py-10 text-center md:px-8 md:py-10 {mmsReveal} {s.delay}">
			<span class="font-mms-display block text-3xl font-light leading-none text-mms-gold md:text-5xl">{s.value}</span>
			<span class="mt-2 block text-[0.65rem] uppercase tracking-[0.2em] text-mms-muted">{s.label}</span>
		</div>
	{/each}
</div>
