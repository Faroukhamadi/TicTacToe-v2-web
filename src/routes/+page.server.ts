import type { Action } from './$types';

export const POST: Action = async ({ request }) => {
	const values = await request.formData();
	const name = values.get('name');
	return {
		location: `/?name=${name}`
	};
};
