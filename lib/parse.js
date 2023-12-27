let postcss = require('postcss');
let Parser = require('./parser');
const { parseJs } = require('./parseJs');

/** @typedef {import('./types.d.ts').NodeData} NodeData */

/** @type {import('postcss').Parser<import('postcss').Document>} */
module.exports = function parse(css, opts) {
	let inputCode = typeof css === 'string' ? css : css.toString();

	let document = new postcss.Document({
		source: {
			input: new postcss.Input(inputCode, opts),
			start: { offset: 0, line: 1, column: 1 },
		},
	});

	/** @type {NodeData[]} */
	let foundNodes = parseJs(inputCode, opts);

	let components = foundNodes.filter((node) => isComponent(node, foundNodes));
	let lastComponent = components[components.length - 1];

	let previousComponentRangeEnd = 0;

	for (let node of foundNodes) {
		/** @type {postcss.Root} */
		let parsedNode;

		let input = new postcss.Input(node.css, opts);

		let interpolationsRanges = node.interpolationRanges.map((range) => {
			return {
				start: range.start - node.rangeStart,
				end: range.end - node.rangeStart - 1,
			};
		});

		let parser = new Parser(input, {
			interpolations: interpolationsRanges,
			isComponent: isComponent(node, foundNodes),
			raws: {
				originalContent: node.css,
				rangeStart: node.rangeStart,
				rangeEnd: node.rangeEnd,
				locationStart: node.locationStart,
			},
		});

		parser.parse();

		// @ts-ignore -- Parser types are missing in PostCSS
		parsedNode = parser.root;

		if (isComponent(node, foundNodes)) {
			parsedNode.raws.codeBefore = inputCode.slice(
				previousComponentRangeEnd,
				node.rangeStart,
			);

			previousComponentRangeEnd = node.rangeEnd;

			let isLastNode = node.rangeStart === lastComponent?.rangeStart;

			if (isLastNode) {
				parsedNode.raws.codeAfter = inputCode.slice(node.rangeEnd);
			}
		}

		document.append(parsedNode);
	}

	return document;
};

/**
 * Check if it's a standalone component or interpolation within a component
 *
 * @param {NodeData} node
 * @param {NodeData[]} allNodes
 * @returns {boolean}
 */
function isComponent(node, allNodes) {
	let isSubNode = allNodes.some((item) => {
		return item.interpolationRanges.some((range) => {
			return range.start < node.rangeStart && node.rangeEnd < range.end;
		});
	});

	return !isSubNode;
}
