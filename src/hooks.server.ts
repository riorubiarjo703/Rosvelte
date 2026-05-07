import { sequence } from '@sveltejs/kit/hooks';
import { building } from '$app/environment';
import { auth } from '$lib/server/auth';
import { customerAuth } from '$lib/server/customer-auth';
import { isAuthPath } from 'better-auth/svelte-kit';
import type { Handle } from '@sveltejs/kit';
import { getTextDirection } from '$lib/paraglide/runtime';
import { paraglideMiddleware } from '$lib/paraglide/server';

const handleParaglide: Handle = ({ event, resolve }) =>
	paraglideMiddleware(event.request, ({ request, locale }) => {
		event.request = request;

		return resolve(event, {
			transformPageChunk: ({ html }) =>
				html
					.replace('%paraglide.lang%', locale)
					.replace('%paraglide.dir%', getTextDirection(locale))
		});
	});

const handleBetterAuth: Handle = async ({ event, resolve }) => {
	if (building) return resolve(event);

	const staffSession = await auth.api.getSession({ headers: event.request.headers });
	if (staffSession) {
		event.locals.session = staffSession.session;
		event.locals.user = staffSession.user;
	}

	const customerSession = await customerAuth.api.getSession({ headers: event.request.headers });
	if (customerSession) {
		event.locals.customerSession = customerSession.session;
		event.locals.customer = customerSession.user;
	}

	const url = event.url.toString();
	if (isAuthPath(url, auth.options)) return auth.handler(event.request);
	if (isAuthPath(url, customerAuth.options)) return customerAuth.handler(event.request);

	return resolve(event);
};

export const handle: Handle = sequence(handleParaglide, handleBetterAuth);
