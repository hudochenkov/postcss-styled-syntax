let ts = require('typescript');
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
		let sourceFile = ts.createSourceFile(
			opts?.from || 'unnamed.ts',
			inputCode,
			ts.ScriptTarget.Latest,
			// true,
			// ts.ScriptKind.TSX,
		);

		/**
		 * Recursively visits the nodes in the AST
		 *
		 * @param {ts.Node} node - The current node in the AST.
		 */
		// eslint-disable-next-line no-inner-declarations
		function visit(node) {
			// Check if the node is a TaggedTemplateExpression
			if (ts.isTaggedTemplateExpression(node) && isStyledComponent(node)) {
				let nodeCssData = getNodeCssData(node, inputCode, sourceFile);

				foundNodes.push(nodeCssData);
			}

			// Continue recursion down the tree
			ts.forEachChild(node, visit);
		}

		// @ts-expect-error -- parseDiagnostics is not public API. However, TS is crashing or very-very slow if using official way
		// https://github.com/microsoft/TypeScript/issues/21940
		let hasParseErrors = sourceFile.parseDiagnostics?.length > 0;

		if (!hasParseErrors) {
			visit(sourceFile);
		}
	} catch (error) {
		// Don't show parsing errors for JavaScript/TypeScript, because they are not relevant to CSS. And these errors most likely caught for user by JavaScript tools already
	}

	return foundNodes;
};

/**
 *
 * @param {ts.TaggedTemplateExpression} node
 * @param {string} inputCode
 * @param {ts.SourceFile} sourceFile
 * @return {NodeData}
 */
function getNodeCssData(node, inputCode, sourceFile) {
	// TypeScript AST doesn't provide comments, but it count comments towards `pos` and `end` of the node. We have to use creative ways to get true `pos` and `end` of nodes

	/** @type {NodeData["interpolationRanges"]} */
	let interpolationRanges = [];

	if ('templateSpans' in node.template) {
		for (let index = 0; index < node.template.templateSpans.length; index++) {
			let templateSpan = node.template.templateSpans[index];

			// To include `${`
			let start = templateSpan.pos - 2;
			// To include `}`
			let end = templateSpan.literal.end - (templateSpan.literal.rawText?.length || 0);

			if (ts.isTemplateTail(templateSpan.literal)) {
				end = end - 1;
			} else {
				// If it's a TemplateMiddle
				end = end - 2;
			}

			interpolationRanges.push({ start, end });
		}
	}

	let text;

	// Template literal without interpolation
	if (ts.isNoSubstitutionTemplateLiteral(node.template)) {
		text = node.template.rawText || '';
	} else {
		// If it's a TemplateExpression
		text = node.template.head.rawText || '';
	}

	// exclude backticks
	let rangeStart = inputCode.indexOf(text, node.template.pos + 1);
	let rangeEnd = node.template.end - 1;

	let { line, character } = ts.getLineAndCharacterOfPosition(sourceFile, node.template.pos);

	return {
		css: inputCode.slice(rangeStart, rangeEnd),
		interpolationRanges,
		rangeStart,
		rangeEnd,
		// Location is a start of a range, but converted into line and column
		locationStart: {
			line: line + 1,
			column: character + 2, // +1 to start count from 1, and not from 0. Another +1 to include backticks similar to range
		},
	};
}
