let tsESTree = require('@typescript-eslint/typescript-estree');
let { walk } = require('estree-walker');

/**
 * @typedef {object} NodeData
 * @property {string} css
 * @property {number} rangeStart
 * @property {number} rangeEnd
 * @property {Array<{ start: number; end: number }>} interpolationRanges
 * @property {{ line: number; column: number }} locationStart
 */

/** @typedef {import('@typescript-eslint/typescript-estree').TSESTree.TaggedTemplateExpression} TaggedTemplateExpression */
/** @typedef {import('@typescript-eslint/typescript-estree').TSESTree.Expression} Expression */

/**
 *
 * @param {string} inputCode
 * @param {import('postcss').ProcessOptions} [opts]
 * @returns {NodeData[]}
 */
module.exports.parseJs = function parseJs(inputCode, opts) {
	/** @type {NodeData[]} */
	let foundNodes = [];

	try {
		let jsAst = tsESTree.parse(inputCode, {
			filePath: opts?.from,
			loc: true,
			range: true,
			tokens: true,
		});

		walk(jsAst, {
			enter(node) {
				if (isTaggedTemplateExpression(node)) {
					if (isStyledComponent(node.tag)) {
						let nodeCssData = getNodeCssData(node, inputCode);

						foundNodes.push(nodeCssData);
					}
				}
			},
		});
	} catch (error) {
		// Don't show parsing errors for JavaScript/TypeScript, because they are not relevant to CSS. And these errors most likely caught for user by JavaScript tools already
	}

	return foundNodes;
};

/**
 * Checkes where it is a styled component or css`` interpolation
 *
 * @param {TaggedTemplateExpression['tag']} tag
 * @return {boolean}
 */
function isStyledComponent(tag) {
	switch (tag.type) {
		case 'MemberExpression':
			// styled.foo``
			return isStyledIdentifier(tag.object);

		case 'CallExpression':
			return (
				// styled(Component)``
				isStyledIdentifier(tag.callee) ||
				(tag.callee.type === 'MemberExpression' &&
					((tag.callee.object.type === 'MemberExpression' &&
						// styled.foo.attrs({})``
						isStyledIdentifier(tag.callee.object.object)) ||
						// styled(Component).attrs({})``
						(tag.callee.object.type === 'CallExpression' &&
							isStyledIdentifier(tag.callee.object.callee))))
			);

		case 'Identifier':
			// css`` or createGlobalStyle``
			return tag.name === 'css' || tag.name === 'createGlobalStyle';

		default:
			return false;
	}
}

/**
 * @param {Expression} node
 * @return {boolean}
 */
function isStyledIdentifier(node) {
	return node.type === 'Identifier' && node.name === 'styled';
}

/**
 * @param {any} node
 * @return {node is TaggedTemplateExpression}
 */
function isTaggedTemplateExpression(node) {
	return node.type === 'TaggedTemplateExpression';
}

/**
 *
 * @param {TaggedTemplateExpression} node
 * @param {string} inputCode
 * @return {NodeData}
 */
function getNodeCssData(node, inputCode) {
	let { quasis } = node.quasi;

	/** @type {NodeData["interpolationRanges"]} */
	let interpolationRanges = [];

	for (let index = 0; index < quasis.length; index++) {
		let quasi = quasis[index];

		let isLastQuasi = quasi.tail;

		if (!isLastQuasi) {
			// To include `${`
			let currentEnd = quasi.range[1] - 2;
			// To include `}`
			let nextStart = quasis[index + 1].range[0] + 1;

			interpolationRanges.push({ start: currentEnd, end: nextStart });
		}
	}

	// exclude backticks
	let rangeStart = quasis[0].range[0] + 1;
	let rangeEnd = quasis[quasis.length - 1].range[1] - 1;

	return {
		css: inputCode.slice(rangeStart, rangeEnd),
		interpolationRanges,
		rangeStart,
		rangeEnd,
		locationStart: {
			line: quasis[0].loc.start.line,
			column: quasis[0].loc.start.column + 2, // +1 to start count from 1, and not from 0. Another +1 to include backticks similar to range
		},
	};
}
