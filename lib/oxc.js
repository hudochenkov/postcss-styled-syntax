// CJS wrapper for oxc-parser's native binding
// oxc-parser is ESM-only, so we load the native binding directly

let binding = loadBinding();

function loadBinding() {
	let pkg = require('oxc-parser/package.json');

	for (let name of Object.keys(pkg.optionalDependencies || {})) {
		try {
			return require(name);
		} catch {
			// Not installed for this platform, try next
		}
	}

	throw new Error('oxc-parser: no native binding found for this platform');
}

/**
 * @param {string} filename
 * @param {string} sourceText
 * @param {Record<string, any>} [options]
 * @returns {{ program: any, errors: Array<any>, comments: Array<any> }}
 */
module.exports.parseSync = function parseSync(filename, sourceText, options) {
	let result = binding.parseSync(filename, sourceText, options || {});

	let { node: program, fixes } = JSON.parse(result.program);

	for (let fixPath of fixes) {
		let node = program;

		for (let key of fixPath) {
			node = node[key];
		}

		if (node.bigint) {
			node.value = BigInt(node.bigint);
		} else {
			try {
				node.value = RegExp(node.regex.pattern, node.regex.flags);
			} catch {
				// Invalid regexp
			}
		}
	}

	return {
		program,
		errors: result.errors,
		comments: result.comments,
	};
};
