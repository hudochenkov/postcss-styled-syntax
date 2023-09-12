'use strict';

let PostCSSStringifier = require('postcss/lib/stringifier').default;

class Stringifier extends PostCSSStringifier {
	/**
	 * @param {import("postcss").Builder} builder
	 */
	constructor(builder) {
		super(builder);

		// Used to restore builder, which we replace for non-component roots to avoid adding these roots twice
		this.originalBuilder = builder;

		// Non-component roots
		/** @type {Array<{ start: number; end: number; content: string; originalContent: string; }>} */
		this.stringifiedInterpolations = [];
	}

	/**
	 * @param {import("postcss").Document} node
	 */
	document(node) {
		// If file has no components return it's original content
		if (node.nodes.length === 0) {
			// @ts-ignore -- it will have source, because parser always sets it
			this.builder(node.source.input.css);

			return;
		}

		let interpolationRoots = node.nodes.filter((item) => !item.raws.styledSyntaxIsComponent);

		for (let child of interpolationRoots) {
			let content = '';

			this.builder = (/** @type {string} */ item) => {
				content += item;
			};

			// @ts-ignore
			let semicolon = /** @type {import("postcss").Root["raws"]["semicolon"]} */ (
				this.raw(child, 'semicolon')
			);

			this.stringify(child, semicolon);

			let stringifiedInterpolation = {
				start: child.raws.styledSyntaxRangeStart,
				end: child.raws.styledSyntaxRangeEnd,
				content,
				originalContent: child.raws.styledOriginalContent,
			};

			this.stringifiedInterpolations.push(stringifiedInterpolation);
		}

		this.builder = this.originalBuilder;

		this.body(node);
	}

	/**
	 * @param {import("postcss").Root} node
	 */
	root(node) {
		if (node.raws.codeBefore) {
			this.builder(node.raws.codeBefore);
		}

		this.body(node);

		if (node.raws.after) {
			node.raws.after = this.replaceInterpolations(
				node.raws.after,
				node.raws.styledSyntaxRangeEnd,
			);

			this.builder(node.raws.after);
		}

		if (node.raws.codeAfter) {
			this.builder(node.raws.codeAfter);
		}
	}

	/**
	 * @param {import("postcss").Container<import("postcss").ChildNode> | import("postcss").Document} node
	 */
	body(node) {
		// STYLED PATCH {
		let nodes = node.nodes;

		// Ignore interpolations for a Document node
		if (isDocument(node)) {
			nodes = node.nodes.filter((item) => item.raws.styledSyntaxIsComponent);
		}
		// } STYLED PATCH

		let last = nodes.length - 1;

		while (last > 0) {
			if (nodes[last].type !== 'comment') break;

			last -= 1;
		}

		// @ts-ignore -- PostCSS code
		let semicolon = this.raw(node, 'semicolon');

		// eslint-disable-next-line unicorn/no-for-loop -- disabling for performance reasons
		for (let i = 0; i < nodes.length; i++) {
			let child = nodes[i];

			let before = this.raw(child, 'before');

			if (before) {
				// STYLED PATCH {
				if (typeof child?.source?.start?.offset !== 'undefined') {
					before = this.replaceInterpolations(before, child.source.start.offset);
				}
				// } STYLED PATCH

				this.builder(before);
			}

			// @ts-ignore -- PostCSS code
			this.stringify(child, last !== i || semicolon);
		}
	}

	/**
	 * @param {import("postcss").Rule | import("postcss").AtRule} node
	 * @param {string} start
	 */
	block(node, start) {
		let between = this.raw(node, 'between', 'beforeOpen');

		this.builder(start + between + '{', node, 'start');

		let after;

		if (node.nodes && node.nodes.length) {
			this.body(node);
			after = this.raw(node, 'after');
		} else {
			after = this.raw(node, 'after', 'emptyBody');
		}

		if (after) {
			// STYLED PATCH {
			if (typeof node?.source?.end?.offset !== 'undefined') {
				after = this.replaceInterpolations(after, node.source.end.offset);
			}
			// } STYLED PATCH

			this.builder(after);
		}

		this.builder('}', node, 'end');
	}

	/**
	 * @param {string} str
	 * @param {number} strEndOffset
	 *
	 * @returns {string}
	 */
	replaceInterpolations(str, strEndOffset) {
		let newStr = str;

		if (newStr.includes('${')) {
			let startOfStr = strEndOffset - newStr.length;
			let endOfStr = strEndOffset;

			for (let i = 0; i < this.stringifiedInterpolations.length; i++) {
				let interpolation = this.stringifiedInterpolations[i];

				if (startOfStr <= interpolation.start && interpolation.end <= endOfStr) {
					newStr = newStr.replace(interpolation.originalContent, interpolation.content);
				}
			}
		}

		return newStr;
	}
}

/**
 * @param {import("postcss").Container<import("postcss").ChildNode> | import("postcss").Document} node
 *
 * @returns {node is import("postcss").Document}
 */
function isDocument(node) {
	return node.type === 'document';
}

module.exports = Stringifier;
