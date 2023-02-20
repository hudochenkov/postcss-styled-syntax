let postcss = require('postcss');
let tsESTree = require('@typescript-eslint/typescript-estree');
let { walk } = require('estree-walker');
let Parser = require('./parser');

/**
 * @typedef {object} NodeData
 * @property {string} css
 * @property {number} rangeStart
 * @property {number} rangeEnd
 * @property {Array<{ start: number; end: number }>} interpolationRanges
 * @property {{ line: number; column: number }} locationStart
 */

/** @typedef {import('@typescript-eslint/typescript-estree').TSESTree.TaggedTemplateExpression} TaggedTemplateExpression */
/** @typedef {import('@typescript-eslint/typescript-estree').TSESTree.LeftHandSideExpression} LeftHandSideExpression */

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
				node.rangeStart
			);

			previousComponentRangeEnd = node.rangeEnd;

			let isLastNode = node.rangeStart === lastComponent?.rangeStart;

			if (isLastNode) {
				parsedNode.raws.codeAfter = inputCode.slice(node.rangeEnd);
			}

			parsedNode.raws.styledSyntaxIsComponent = true;
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
 * @param {LeftHandSideExpression} node
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
