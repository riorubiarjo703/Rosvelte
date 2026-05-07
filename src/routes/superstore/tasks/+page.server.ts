import { fail, redirect } from '@sveltejs/kit';
import { asc, count, desc, eq, ilike } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { task } from '$lib/server/db/schema';
import { assertSuperstore } from '$lib/server/superstore/access';
import {
	taskCreateSchema,
	taskDeleteSchema,
	taskListQuerySchema,
	taskUpdateSchema
} from '$lib/superstore/schemas';

export const load: PageServerLoad = async (event) => {
	assertSuperstore(event);

	const parsed = taskListQuerySchema.safeParse({
		page: event.url.searchParams.get('page') ?? undefined,
		pageSize: event.url.searchParams.get('pageSize') ?? undefined,
		q: event.url.searchParams.get('q') ?? undefined,
		sort: event.url.searchParams.get('sort') ?? undefined,
		order: event.url.searchParams.get('order') ?? undefined
	});

	const qv = parsed.success ? parsed.data : taskListQuerySchema.parse({});
	const { page: pageNum, pageSize, q, sort, order } = qv;

	const whereClause = q ? ilike(task.title, `%${q}%`) : undefined;

	const orderCol = sort === 'title' ? task.title : sort === 'priority' ? task.priority : task.id;
	const orderFn = order === 'asc' ? asc : desc;

	const offset = (pageNum - 1) * pageSize;

	const [rows, [{ total }]] = await Promise.all([
		db
			.select()
			.from(task)
			.where(whereClause)
			.orderBy(orderFn(orderCol))
			.limit(pageSize)
			.offset(offset),
		db.select({ total: count() }).from(task).where(whereClause)
	]);

	const pageCount = Math.max(1, Math.ceil(total / pageSize));

	return {
		tasks: rows,
		total,
		page: pageNum,
		pageSize,
		pageCount,
		q,
		sort,
		order,
		invalidQuery: !parsed.success
	};
};

export const actions: Actions = {
	createTask: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const raw = { title: fd.get('title'), priority: fd.get('priority') };
		const parsed = taskCreateSchema.safeParse(raw);
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, message: 'Invalid task' });
		}
		await db.insert(task).values(parsed.data);
		throw redirect(303, event.url.pathname + event.url.search);
	},

	updateTask: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = taskUpdateSchema.safeParse({
			id: fd.get('id'),
			title: fd.get('title'),
			priority: fd.get('priority')
		});
		if (!parsed.success) {
			return fail(400, { errors: parsed.error.flatten().fieldErrors, message: 'Invalid task' });
		}
		const { id, ...rest } = parsed.data;
		await db.update(task).set(rest).where(eq(task.id, id));
		throw redirect(303, event.url.pathname + event.url.search);
	},

	deleteTask: async (event) => {
		assertSuperstore(event);
		const fd = await event.request.formData();
		const parsed = taskDeleteSchema.safeParse({ id: fd.get('id') });
		if (!parsed.success) {
			return fail(400, { message: 'Invalid id' });
		}
		await db.delete(task).where(eq(task.id, parsed.data.id));
		throw redirect(303, event.url.pathname + event.url.search);
	}
};
