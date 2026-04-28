import { Stringifier } from './stringifier.js';

/** @type {import('postcss').Stringifier} */
export function stringify(node, builder) {
	let str = new Stringifier(builder);

	str.stringify(node);
}
