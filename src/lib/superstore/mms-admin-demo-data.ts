/** Static demo payloads for MMS-style admin screens — replace with API / DB when wired. */

export const DEMO_KPIS = {
	totalRevenueDisplay: 'Rp 184M',
	totalRevenueTrend: '↑ 18.4% vs last month',
	ordersThisMonth: 342,
	ordersTrend: '↑ 12.1% vs last month',
	activeCustomers: 2841,
	customersTrend: '↑ 8.3% this quarter',
	outOfStock: 3,
	outOfStockTrend: '↑ Needs restock',
	badgeOrders: 12,
	badgeInventory: 3
} as const;

export type OrderStatus = 'pending' | 'active' | 'out';
export type ProductStatus = 'active' | 'low' | 'out';
export type CustomerStatus = 'active' | 'pending';
export type JournalStatus = 'active' | 'pending' | 'out';

export type DemoOrder = {
	id: string;
	customer: string;
	product: string;
	date: string;
	total: string;
	status: OrderStatus;
};

export type DemoProduct = {
	name: string;
	sku: string;
	category: string;
	price: string;
	stock: number;
	max: number;
	score: number;
	status: ProductStatus;
};

export type DemoCustomer = {
	name: string;
	email: string;
	location: string;
	orders: number;
	spent: string;
	last: string;
	status: CustomerStatus;
};

export const demoOrders: DemoOrder[] = [
	{ id: '#ORD-2842', customer: 'Budi Santoso', product: 'Macallan 18', date: 'Today 14:22', total: 'Rp 5.800.000', status: 'pending' },
	{ id: '#ORD-2841', customer: 'Anita Wijaya', product: 'Rémy XO × 2', date: 'Today 11:05', total: 'Rp 7.200.000', status: 'active' },
	{ id: '#ORD-2840', customer: 'Marcus Lie', product: 'Yamazaki 12', date: 'Today 09:41', total: 'Rp 2.200.000', status: 'active' },
	{ id: '#ORD-2839', customer: 'Dewi Hartono', product: 'Glenfarclas 25', date: 'Yesterday', total: 'Rp 4.200.000', status: 'active' },
	{ id: '#ORD-2838', customer: 'Rizky Pratama', product: 'Don Julio 1942', date: 'Yesterday', total: 'Rp 1.800.000', status: 'pending' },
	{ id: '#ORD-2837', customer: 'Sari Indah', product: 'Diplomatico Rsv', date: '2 days ago', total: 'Rp 850.000', status: 'out' }
];

export const demoProducts: DemoProduct[] = [
	{ name: 'Macallan 18 Sherry Oak', sku: 'MMS-SCT-MC18', category: 'Scotch', price: 'Rp 5.800.000', stock: 8, max: 30, score: 96, status: 'active' },
	{ name: 'Glenfarclas 25', sku: 'MMS-SCT-GF25', category: 'Scotch', price: 'Rp 4.200.000', stock: 4, max: 20, score: 95, status: 'low' },
	{ name: 'Laphroaig 18 Year', sku: 'MMS-SCT-LP18', category: 'Scotch', price: 'Rp 2.900.000', stock: 14, max: 30, score: 92, status: 'active' },
	{ name: 'Rémy Martin XO', sku: 'MMS-CGN-RM-XO', category: 'Cognac', price: 'Rp 3.600.000', stock: 0, max: 15, score: 93, status: 'out' },
	{ name: 'Yamazaki 12 Year', sku: 'MMS-JPN-YZ12', category: 'Japanese', price: 'Rp 2.200.000', stock: 11, max: 25, score: 90, status: 'active' },
	{ name: 'Don Julio 1942', sku: 'MMS-TQL-DJ42', category: 'Tequila', price: 'Rp 1.800.000', stock: 3, max: 20, score: 88, status: 'low' },
	{ name: 'Diplomatico Reserva', sku: 'MMS-RUM-DP12', category: 'Rum', price: 'Rp 850.000', stock: 22, max: 40, score: 87, status: 'active' },
	{ name: 'Hennessy Paradis', sku: 'MMS-CGN-HN-PX', category: 'Cognac', price: 'Rp 12.500.000', stock: 2, max: 8, score: 98, status: 'low' }
];

export const demoCustomers: DemoCustomer[] = [
	{ name: 'Budi Santoso', email: 'budi@email.com', location: 'Jakarta', orders: 12, spent: 'Rp 42.4M', last: 'Today', status: 'active' },
	{ name: 'Anita Wijaya', email: 'anita@email.com', location: 'Surabaya', orders: 8, spent: 'Rp 28.1M', last: 'Today', status: 'active' },
	{ name: 'Marcus Lie', email: 'marcus@email.com', location: 'Bali', orders: 5, spent: 'Rp 14.6M', last: 'Today', status: 'active' },
	{ name: 'Dewi Hartono', email: 'dewi@email.com', location: 'Bandung', orders: 3, spent: 'Rp 9.2M', last: 'Yesterday', status: 'active' },
	{ name: 'Rizky Pratama', email: 'rizky@email.com', location: 'Jakarta', orders: 2, spent: 'Rp 4.6M', last: 'Yesterday', status: 'pending' },
	{ name: 'Sari Indah', email: 'sari@email.com', location: 'Medan', orders: 1, spent: 'Rp 850k', last: '2d ago', status: 'active' }
];

export const dashboardActivity = [
	{ color: '#4CAF82', html: 'New order <strong class="text-mms-gold-light">#ORD-2842</strong> from Budi Santoso', time: '2 minutes ago', amt: 'Rp 5.800.000' },
	{ color: '#5A8AEF', html: 'Customer <strong class="text-mms-gold-light">Anita Wijaya</strong> created account', time: '18 minutes ago', amt: '' },
	{ color: '#C9A84C', html: 'Stock low alert: <strong class="text-mms-gold-light">Glenfarclas 25</strong> (4 left)', time: '1 hour ago', amt: '' },
	{ color: '#E05252', html: 'Out of stock: <strong class="text-mms-gold-light">Rémy Martin XO</strong>', time: '2 hours ago', amt: '' },
	{ color: '#4CAF82', html: 'Order <strong class="text-mms-gold-light">#ORD-2841</strong> shipped successfully', time: '3 hours ago', amt: '' }
] as const;

export const analyticsBars = [94, 72, 68, 55, 48, 38];
export const analyticsBarLabels = ['Macallan', 'Glenfarclas', 'Rémy', 'Yamazaki', 'Don Julio', 'Diplomatico'];

export const trafficDonut = [
	{ label: 'Organic', v: 38, color: '#C9A84C' },
	{ label: 'Direct', v: 28, color: '#8ABAEF' },
	{ label: 'Social', v: 20, color: '#9FE1CB' },
	{ label: 'Email', v: 14, color: '#CECBF6' }
];
