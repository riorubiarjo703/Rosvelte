import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { storefrontOrder, type StorefrontOrderLinePayload } from '$lib/server/db/schema';
import type { OrderExportRow } from '$lib/superstore/schemas';
import { randomBytes } from 'node:crypto';

export type StorefrontOrderRow = typeof storefrontOrder.$inferSelect;

export function normalizeOrderCode(raw: string): string {
	const s = raw.trim().replace(/^#/, '').toUpperCase();
	return s.slice(0, 80);
}

export async function listAllStorefrontOrders(): Promise<StorefrontOrderRow[]> {
	return db.select().from(storefrontOrder).orderBy(desc(storefrontOrder.orderedAt), desc(storefrontOrder.id));
}

export async function getStorefrontOrderByCode(
	orderCode: string
): Promise<StorefrontOrderRow | undefined> {
	const key = normalizeOrderCode(orderCode);
	const [row] = await db.select().from(storefrontOrder).where(eq(storefrontOrder.orderCode, key)).limit(1);
	return row ?? undefined;
}

export async function getStorefrontOrderById(id: number): Promise<StorefrontOrderRow | undefined> {
	const [row] = await db.select().from(storefrontOrder).where(eq(storefrontOrder.id, id)).limit(1);
	return row ?? undefined;
}

/** Match checkout email to logged-in customer (case-insensitive). */
export async function listStorefrontOrdersByCustomerEmail(email: string): Promise<StorefrontOrderRow[]> {
	const normalized = email.trim().toLowerCase();
	if (!normalized) return [];
	return db
		.select()
		.from(storefrontOrder)
		.where(sql`lower(${storefrontOrder.customerEmail}) = ${normalized}`)
		.orderBy(desc(storefrontOrder.orderedAt), desc(storefrontOrder.id));
}

/** Unique display code for live checkout (`ORD-` + time + random suffix). */
export function allocateLiveOrderCode(): string {
	const suffix = randomBytes(3).toString('hex').toUpperCase();
	return `ORD-${Date.now()}-${suffix}`;
}

export async function deleteStorefrontOrderById(id: number): Promise<void> {
	await db.delete(storefrontOrder).where(eq(storefrontOrder.id, id));
}

export async function getStorefrontOrderByXenditExternalId(
	externalId: string
): Promise<StorefrontOrderRow | undefined> {
	const [row] = await db
		.select()
		.from(storefrontOrder)
		.where(eq(storefrontOrder.xenditExternalId, externalId))
		.limit(1);
	return row ?? undefined;
}

export async function getStorefrontOrderByXenditInvoiceId(
	invoiceId: string
): Promise<StorefrontOrderRow | undefined> {
	const [row] = await db
		.select()
		.from(storefrontOrder)
		.where(eq(storefrontOrder.xenditInvoiceId, invoiceId))
		.limit(1);
	return row ?? undefined;
}

export async function insertPendingPaymentOrder(args: {
	orderCode: string;
	customerName: string;
	customerEmail: string;
	phone: string | null;
	productSummary: string;
	totalIdr: number;
	subtotalIdr: number;
	promoDiscountIdr: number;
	shippingIdr: number;
	taxIdr: number;
	shippingLabel: string;
	addressLabel: string;
	linesPayload: StorefrontOrderLinePayload[];
	xenditExternalId: string;
}): Promise<number> {
	const now = new Date();
	const [row] = await db
		.insert(storefrontOrder)
		.values({
			orderCode: args.orderCode,
			customerName: args.customerName,
			customerEmail: args.customerEmail,
			phone: args.phone,
			productSummary: args.productSummary,
			totalIdr: args.totalIdr,
			subtotalIdr: args.subtotalIdr,
			promoDiscountIdr: args.promoDiscountIdr,
			shippingIdr: args.shippingIdr,
			taxIdr: args.taxIdr,
			shippingLabel: args.shippingLabel,
			addressLabel: args.addressLabel,
			linesPayload: args.linesPayload,
			xenditExternalId: args.xenditExternalId,
			paymentStatus: 'pending_payment',
			currency: 'IDR',
			status: 'pending',
			orderedAt: now,
			updatedAt: now
		})
		.returning({ id: storefrontOrder.id });
	if (!row) throw new Error('insertPendingPaymentOrder');
	return row.id;
}

export async function updateStorefrontOrderInvoiceMeta(
	id: number,
	args: { xenditInvoiceId: string; checkoutInvoiceUrl: string }
): Promise<void> {
	await db
		.update(storefrontOrder)
		.set({
			xenditInvoiceId: args.xenditInvoiceId,
			checkoutInvoiceUrl: args.checkoutInvoiceUrl,
			updatedAt: new Date()
		})
		.where(eq(storefrontOrder.id, id));
}

export async function markStorefrontOrderPaidByExternalId(externalId: string): Promise<boolean> {
	const now = new Date();
	const result = await db
		.update(storefrontOrder)
		.set({
			paymentStatus: 'paid',
			status: 'active',
			updatedAt: now
		})
		.where(eq(storefrontOrder.xenditExternalId, externalId))
		.returning({ id: storefrontOrder.id });
	return result.length > 0;
}

export async function markStorefrontOrderPaymentStatus(
	externalId: string,
	paymentStatus: 'expired' | 'failed'
): Promise<boolean> {
	const now = new Date();
	const result = await db
		.update(storefrontOrder)
		.set({
			paymentStatus,
			updatedAt: now
		})
		.where(
			and(
				eq(storefrontOrder.xenditExternalId, externalId),
				eq(storefrontOrder.paymentStatus, 'pending_payment')
			)
		)
		.returning({ id: storefrontOrder.id });
	return result.length > 0;
}

export async function upsertStorefrontOrderFromImport(row: OrderExportRow): Promise<void> {
	const code = normalizeOrderCode(row.orderCode);
	const existing = await getStorefrontOrderByCode(code);
	const now = new Date();

	let orderedAt = existing?.orderedAt ?? now;
	if (row.orderedAt) {
		const parsed = new Date(row.orderedAt);
		if (!Number.isNaN(parsed.getTime())) orderedAt = parsed;
	}

	if (existing) {
		await db
			.update(storefrontOrder)
			.set({
				customerName: row.customerName,
				customerEmail: row.customerEmail,
				productSummary: row.productSummary,
				totalIdr: row.totalIdr,
				currency: row.currency,
				status: row.status,
				orderedAt,
				updatedAt: now
			})
			.where(eq(storefrontOrder.id, existing.id));
		return;
	}

	await db.insert(storefrontOrder).values({
		orderCode: code,
		customerName: row.customerName,
		customerEmail: row.customerEmail,
		productSummary: row.productSummary,
		totalIdr: row.totalIdr,
		currency: row.currency,
		status: row.status,
		orderedAt,
		updatedAt: now
	});
}
