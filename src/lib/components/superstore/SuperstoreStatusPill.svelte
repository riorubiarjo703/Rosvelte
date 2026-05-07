<script lang="ts">
	let {
		status,
		variant = 'product'
	}: {
		status: string;
		variant?: 'order' | 'product' | 'customer' | 'journal';
	} = $props();

	const productMap: Record<string, { cls: string; label: string }> = {
		active: { cls: 'border border-[#4CAF82]/20 bg-[#4CAF82]/10 text-[#4CAF82]', label: 'Active' },
		low: { cls: 'border border-[#E8B434]/20 bg-[#E8B434]/10 text-[#E8B434]', label: 'Low Stock' },
		out: { cls: 'border border-[#E05252]/20 bg-[#E05252]/10 text-[#E05252]', label: 'Out of Stock' },
		pending: { cls: 'border border-[#5A8AEF]/20 bg-[#5A8AEF]/10 text-[#5A8AEF]', label: 'Pending' }
	};

	const orderMap: Record<string, { cls: string; label: string }> = {
		pending: { cls: 'border border-[#5A8AEF]/20 bg-[#5A8AEF]/10 text-[#5A8AEF]', label: 'Pending' },
		active: { cls: 'border border-[#4CAF82]/20 bg-[#4CAF82]/10 text-[#4CAF82]', label: 'Active' },
		out: { cls: 'border border-[#E05252]/20 bg-[#E05252]/10 text-[#E05252]', label: 'Out of Stock' }
	};

	const custMap: Record<string, { cls: string; label: string }> = {
		active: productMap.active,
		pending: orderMap.pending
	};

	const journalMap: Record<string, { cls: string; label: string }> = {
		active: productMap.active,
		pending: orderMap.pending,
		out: productMap.out
	};

	const resolved = $derived(
		variant === 'order'
			? (orderMap[status] ?? orderMap.pending)
			: variant === 'customer'
				? (custMap[status] ?? custMap.active)
				: variant === 'journal'
					? (journalMap[status] ?? journalMap.pending)
					: (productMap[status] ?? productMap.active)
	);
</script>

<span
	class="inline-block rounded-full px-2.5 py-0.5 text-[0.58rem] tracking-[0.12em] uppercase {resolved.cls}"
>
	{resolved.label}
</span>
