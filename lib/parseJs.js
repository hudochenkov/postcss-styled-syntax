let { parseSync } = require('./oxc');
let { isStyledComponent } = require('./isStyledComponent');

/** @typedef {import('./types.d.ts').NodeData} NodeData */

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
		let filename = opts?.from || 'unnamed.tsx';
		let result = parseSync(filename, inputCode, { sourceType: 'unambiguous' });

		if (result.errors.length > 0) {
			return foundNodes;
		}

		visit(result.program);

		/**
		 * Recursively visits the nodes in the AST
		 *
		 * @param {any} node
		 */
		function visit(node) {
			if (!node || typeof node !== 'object') return;

			if (node.type === 'TaggedTemplateExpression' && isStyledComponent(node)) {
				let nodeCssData = getNodeCssData(node.quasi, inputCode);

				foundNodes.push(nodeCssData);
			}

			if (node.type === 'CallExpression' && isStyledComponent(node)) {
				let arg = node.arguments[0];

				if (
					arg?.type === 'ArrowFunctionExpression' &&
					arg.body.type === 'TemplateLiteral'
				) {
					let nodeCssData = getNodeCssData(arg.body, inputCode);

					foundNodes.push(nodeCssData);
				}
			}

			for (let key of Object.keys(node)) {
				let value = node[key];

				if (Array.isArray(value)) {
					for (let item of value) {
						if (item && typeof item === 'object' && item.type) {
							visit(item);
						}
					}
				} else if (value && typeof value === 'object' && value.type) {
					visit(value);
				}
			}
		}
	} catch {
		// Don't show parsing errors for JavaScript/TypeScript, because they are not relevant to CSS. And these errors most likely caught for user by JavaScript tools already
	}

	return foundNodes;
};

/**
 *
 * @param {any} template
 * @param {string} inputCode
 * @return {NodeData}
 */
function getNodeCssData(template, inputCode) {
	/** @type {NodeData["interpolationRanges"]} */
	let interpolationRanges = [];

	for (let i = 0; i < template.expressions.length; i++) {
		// Use quasis boundaries to find interpolation ranges
		// This correctly handles comments inside interpolations
		let start = template.quasis[i].end - 2; // -2 to include `${`
		let end = template.quasis[i + 1].start + 1; // +1 to include `}`

		interpolationRanges.push({ start, end });
	}

	// rangeStart is after the opening backtick, rangeEnd is before the closing backtick
	let rangeStart = template.start + 1;
	let rangeEnd = template.end - 1;

	let locationStart = getLineAndColumn(inputCode, template.start);

	return {
		css: inputCode.slice(rangeStart, rangeEnd),
		interpolationRanges,
		rangeStart,
		rangeEnd,
		locationStart: {
			line: locationStart.line,
			column: locationStart.column + 1, // +1 so column points to first CSS char (after backtick)
		},
	};
}

/**
 * Get 1-based line and column for a given offset
 *
 * @param {string} source
 * @param {number} offset
 * @return {{ line: number, column: number }}
 */
function getLineAndColumn(source, offset) {
	let line = 1;
	let column = 1;

	for (let i = 0; i < offset; i++) {
		if (source[i] === '\n') {
			line++;
			column = 1;
		} else {
			column++;
		}
	}

	return { line, column };
}
