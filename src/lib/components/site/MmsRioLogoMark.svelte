<script lang="ts">
	/** Optional extra classes on the root SVG (e.g. height). */
	let { class: className = '' } = $props<{ class?: string }>();
</script>

<!-- Condensed wordmark: geometric R · I · ring O — scales with `currentColor` -->
<svg
	class={className}
	viewBox="0 0 86 22"
	fill="currentColor"
	xmlns="http://www.w3.org/2000/svg"
	aria-hidden="true"
	focusable="false"
>
	<!-- R -->
	<path
		d="M1 1.5h6.2c4.2 0 6.8 2.1 6.8 5.6 0 2.6-1.4 4.4-3.8 5.1L15.2 20.5h-4.9l-4.2-7.2H4.4v7.2H1V1.5Zm3.4 3v6.3h2.6c2.4 0 3.7-1.1 3.7-3.1 0-2.1-1.3-3.2-3.7-3.2H4.4Z"
	/>
	<!-- I -->
	<path d="M20.5 1.5h3.4v19H20.5v-19Z" />
	<!-- O -->
	<path
		fill-rule="evenodd"
		d="M31.8 11c0-5.2 3.8-9.5 8.8-9.5s8.8 4.3 8.8 9.5-3.8 9.5-8.8 9.5-8.8-4.3-8.8-9.5Zm3.5 0c0 3.4 2.4 6.2 5.3 6.2s5.3-2.8 5.3-6.2-2.4-6.2-5.3-6.2-5.3 2.8-5.3 6.2Z"
	/>
</svg>
