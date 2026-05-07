<script lang="ts">
	import MmsCustomerDashboard from '$lib/components/account/MmsCustomerDashboard.svelte';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<svelte:head>
	<title>My account — Rosvelte</title>
</svelte:head>

{#if data.customer}
	<MmsCustomerDashboard customer={data.customer} curated={data.curated} {form} />
{/if}
