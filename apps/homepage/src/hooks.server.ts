import { redirects } from '$lib/redirects';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Remove trailing slashes
	if (event.url.pathname.endsWith('/')) {
		event.url.pathname = event.url.pathname.slice(0, -1);
	}

	const newPath = redirects[event.url.pathname];
	if (newPath) {
		return new Response(null, {
			status: 302,
			headers: {
				location: newPath
			}
		});
	}

	// If no redirect is necessary, continue with the normal resolve process
	const response = await resolve(event);
	return response;
};
