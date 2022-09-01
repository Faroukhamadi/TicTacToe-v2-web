import { name } from '../stores';
import { get } from 'svelte/store';

export function load({}) {
	const storeValue = get(name);
	console.log('this is the store value server side: ', storeValue);
}
