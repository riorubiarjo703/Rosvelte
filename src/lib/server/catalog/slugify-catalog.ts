/** Pure slug helper for catalog products; keep separate from `repo` so CLI seeds avoid `$env`. */
export function slugifyCatalog(input: string): string {
	const s = input
		.toLowerCase()
		.trim()
		.normalize('NFKD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '')
		.slice(0, 120);
	return s || 'product';
}
