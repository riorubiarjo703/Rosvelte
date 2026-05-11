/** Shared checkout totals (mirrors `src/routes/checkout/+page.svelte`). */

export type ShippingOption = 'standard' | 'express' | 'same' | 'free';
export type AddressOption = 'home' | 'office' | 'new';

export const PROMO_GOLDMEMBER_DISCOUNT_IDR = 500_000;

export const SHIPPING_COST_MAP: Record<ShippingOption, number> = {
	standard: 35_000,
	express: 85_000,
	same: 55_000,
	free: 0
};

export const DEFAULT_STORE_TAX_RATE_PERCENT = 11;

export function shippingLabel(option: ShippingOption): string {
	switch (option) {
		case 'standard':
			return 'JNE Regular - 3-5 days';
		case 'express':
			return 'JNE YES - next day';
		case 'same':
			return 'Gojek Instant - same day';
		default:
			return 'Complimentary delivery';
	}
}

export function addressLabel(option: AddressOption): string {
	switch (option) {
		case 'home':
			return 'Home - Jl. Kemang Raya No. 45, Jakarta Selatan';
		case 'office':
			return 'Office - Menara Sudirman Lt. 12, Jakarta Pusat';
		default:
			return 'Different address (see notes)';
	}
}

export function computeCheckoutTotals(args: {
	subtotalIdr: number;
	promoApplied: boolean;
	shippingOption: ShippingOption;
	taxRatePercent: number;
}): {
	shippingIdr: number;
	promoDiscountIdr: number;
	discountedSubtotalIdr: number;
	taxIdr: number;
	totalIdr: number;
} {
	const promoDiscountIdr = args.promoApplied ? PROMO_GOLDMEMBER_DISCOUNT_IDR : 0;
	const discountedSubtotalIdr = Math.max(args.subtotalIdr - promoDiscountIdr, 0);
	const shippingIdr = SHIPPING_COST_MAP[args.shippingOption];
	const taxIdr = Math.round((discountedSubtotalIdr * args.taxRatePercent) / 100);
	const totalIdr = discountedSubtotalIdr + taxIdr + shippingIdr;
	return {
		shippingIdr,
		promoDiscountIdr,
		discountedSubtotalIdr,
		taxIdr,
		totalIdr
	};
}
