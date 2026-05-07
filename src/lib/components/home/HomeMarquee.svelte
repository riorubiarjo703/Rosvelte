<script lang="ts">
	const line =
		'Scotch Whisky ◆ Cognac ◆ Japanese Whisky ◆ Tequila ◆ Armagnac ◆ Rum ◆ Mezcal ◆ Calvados';
</script>

<div class="overflow-hidden bg-mms-gold py-4" role="presentation">
	<div class="flex w-max gap-16 font-mms-logo text-[1.1rem] tracking-[0.2em] text-mms-ink">
		<span
			class="flex shrink-0 animate-mms-marquee items-center gap-16 whitespace-nowrap after:text-[0.5rem] after:content-['◆']">{line}</span>
		<span
			class="flex shrink-0 animate-mms-marquee items-center gap-16 whitespace-nowrap after:text-[0.5rem] after:content-['◆']">{line}</span>
		<span
			class="flex shrink-0 animate-mms-marquee items-center gap-16 whitespace-nowrap after:text-[0.5rem] after:content-['◆']">{line}</span>
		<span
			class="flex shrink-0 animate-mms-marquee items-center gap-16 whitespace-nowrap after:text-[0.5rem] after:content-['◆']"
			aria-hidden="true">{line}</span>
	</div>
</div>
