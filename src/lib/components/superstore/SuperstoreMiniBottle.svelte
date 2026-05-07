<script lang="ts">
	let { accent = '#1A0A04' }: { accent?: string } = $props();
</script>

<svg width="16" height="24" viewBox="0 0 24 38" fill="none" aria-hidden="true" class="shrink-0">
	<rect x="8" y="0" width="8" height="5" rx="1" fill="rgba(201,168,76,0.4)" />
	<path
		d="M8 5 Q6 11 5 16 L5 34 Q5 38 12 38 Q19 38 19 34 L19 16 Q18 11 16 5Z"
		fill={accent}
		stroke="rgba(201,168,76,0.35)"
		stroke-width="0.5"
	/>
</svg>
