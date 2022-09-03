import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const name = url.searchParams.get('name');
	if (!name) {
		throw redirect(307, '/login');
	}
	return {
		name: name
	};
};
