/** Public storefront URL for a catalog product image (served by `/catalog/image/[uploadId]`). */
export function catalogHeroImagePublicPath(uploadId: number | null | undefined): string | null {
	if (uploadId == null || !Number.isFinite(uploadId) || uploadId < 1) return null;
	return `/catalog/image/${Math.trunc(uploadId)}`;
}
