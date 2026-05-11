<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div
	class="flex flex-wrap items-end gap-3 border-b border-mms-gold/[0.06] bg-mms-gold/[0.03] px-6 py-3"
>
	{@render children()}
</div>
