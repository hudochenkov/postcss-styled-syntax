let Stringifier = require('./stringifier');

/** @type {import('postcss').Stringifier} */
module.exports = function stringify(node, builder) {
	let str = new Stringifier(builder);

	str.stringify(node);
};
