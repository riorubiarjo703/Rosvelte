import type { CatalogProductRow } from '$lib/server/catalog/repo';
import { getCatalogProductById } from '$lib/server/catalog/repo';
import type { ShippingOption } from '$lib/checkout/mms-checkout-pricing';
import {
	PROMO_GOLDMEMBER_DISCOUNT_IDR,
	computeCheckoutTotals
} from '$lib/checkout/mms-checkout-pricing';
import type { StorefrontOrderLinePayload } from '$lib/server/db/schema';

export type CartLineInput = { productId: number; qty: number };

export type PricedCheckout =
	| {
			ok: true;
			lines: StorefrontOrderLinePayload[];
			productSummary: string;
			subtotalIdr: number;
			promoDiscountIdr: number;
			shippingIdr: number;
			taxIdr: number;
			totalIdr: number;
	  }
	| { ok: false; message: string };

const MAX_LINES = 80;
const MAX_QTY_PER_LINE = 99;

function normalizeQty(qty: unknown): number | null {
	if (typeof qty !== 'number' || !Number.isFinite(qty)) return null;
	const n = Math.trunc(qty);
	if (n < 1 || n > MAX_QTY_PER_LINE) return null;
	return n;
}

function normalizeProductId(id: unknown): number | null {
	if (typeof id !== 'number' || !Number.isFinite(id)) return null;
	const n = Math.trunc(id);
	if (n < 1) return null;
	return n;
}

export async function priceCheckoutCart(args: {
	rawLines: unknown;
	shippingOption: ShippingOption;
	promoCodeTrimmed: string;
	taxRatePercent: number;
}): Promise<PricedCheckout> {
	let parsed: unknown;
	try {
		parsed = typeof args.rawLines === 'string' ? JSON.parse(args.rawLines) : args.rawLines;
	} catch {
		return { ok: false, message: 'Invalid cart data.' };
	}
	if (!Array.isArray(parsed)) return { ok: false, message: 'Invalid cart data.' };
	if (parsed.length === 0) return { ok: false, message: 'Your bag is empty.' };
	if (parsed.length > MAX_LINES) return { ok: false, message: 'Cart has too many lines.' };

	const inputs: CartLineInput[] = [];
	const seen = new Set<number>();
	for (const row of parsed) {
		if (!row || typeof row !== 'object') continue;
		const r = row as Record<string, unknown>;
		const productId = normalizeProductId(r.productId);
		const qty = normalizeQty(r.qty);
		if (productId == null || qty == null) continue;
		if (seen.has(productId)) return { ok: false, message: 'Duplicate product in cart.' };
		seen.add(productId);
		inputs.push({ productId, qty });
	}

	if (inputs.length === 0) return { ok: false, message: 'Your bag is empty.' };

	const rows = new Map<number, CatalogProductRow>();
	for (const line of inputs) {
		const row = await getCatalogProductById(line.productId);
		if (!row || !row.published) {
			return { ok: false, message: 'One or more products are no longer available.' };
		}
		const stock = Math.max(0, Math.trunc(row.stockQty));
		if (stock > 0 && line.qty > stock) {
			return { ok: false, message: `Insufficient stock for ${row.name}.` };
		}
		if (stock === 0) {
			return { ok: false, message: `${row.name} is out of stock.` };
		}
		rows.set(line.productId, row);
	}

	const lines: StorefrontOrderLinePayload[] = inputs.map((input) => {
		const row = rows.get(input.productId)!;
		const unitPriceIdr = row.price;
		const lineTotalIdr = unitPriceIdr * input.qty;
		return {
			productId: row.id,
			sku: row.sku,
			name: row.name,
			qty: input.qty,
			unitPriceIdr,
			lineTotalIdr,
			country: row.country,
			region: row.region
		};
	});

	const subtotalIdr = lines.reduce((sum, l) => sum + l.lineTotalIdr, 0);
	const promoApplied =
		args.promoCodeTrimmed.toUpperCase() === 'GOLDMEMBER' ? true : false;
	if (promoApplied && subtotalIdr < PROMO_GOLDMEMBER_DISCOUNT_IDR) {
		return { ok: false, message: 'Promo code cannot be applied to this order.' };
	}

	const totals = computeCheckoutTotals({
		subtotalIdr,
		promoApplied,
		shippingOption: args.shippingOption,
		taxRatePercent: args.taxRatePercent
	});

	const productSummary =
		lines
			.map((l) => l.name)
			.slice(0, 3)
			.join(' - ') + (lines.length > 3 ? ' …' : '');

	return {
		ok: true,
		lines,
		productSummary,
		subtotalIdr,
		promoDiscountIdr: totals.promoDiscountIdr,
		shippingIdr: totals.shippingIdr,
		taxIdr: totals.taxIdr,
		totalIdr: totals.totalIdr
	};
}
