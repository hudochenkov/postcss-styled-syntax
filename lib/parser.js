// @ts-nocheck
'use strict';

let { Declaration, Rule } = require('postcss');
let PostCSSParser = require('postcss/lib/parser');
let tokenizer = require('./tokenizer');

// eslint-disable-next-line consistent-return
function findLastWithPosition(tokens) {
	for (let i = tokens.length - 1; i >= 0; i--) {
		let token = tokens[i];
		let pos = token[3] || token[2];

		if (pos) return pos;
	}
}

class Parser extends PostCSSParser {
	constructor(input, options) {
		super(input);
		this.interpolations = options.interpolations;

		this.createTokenizer(options);
		this.root.source = {
			input,
			start: {
				offset: options.raws.rangeStart,
				line: options.raws.locationStart.line,
				column: options.raws.locationStart.column,
			},
		};

		this.root.raws.styledSyntaxRangeStart = options.raws.rangeStart;
		this.root.raws.styledSyntaxRangeEnd = options.raws.rangeEnd;

		// Add a flag to enable PostCSS and Stylelint to adjust to CSS-in-JS quirks
		// E. g. if something processes only rules, it could also process `root` if this flag is present
		this.root.raws.isRuleLike = true;

		if (options.isComponent) {
			this.root.raws.styledSyntaxIsComponent = true;
		} else {
			this.root.raws.styledOriginalContent = options.raws.originalContent;
		}
	}

	createTokenizer(tokenizerOptions) {
		this.tokenizer = tokenizer(this.input, tokenizerOptions);
	}

	parse() {
		// STYLED PATCH The only difference from PostCSS parser is try-catch wrap
		// Catching errors here to catch errors from both parser and tokenizer and fix reported error positions
		try {
			let token;

			while (!this.tokenizer.endOfFile()) {
				token = this.tokenizer.nextToken();

				switch (token[0]) {
					case 'space':
						this.spaces += token[1];
						break;

					case ';':
						this.freeSemicolon(token);
						break;

					case '}':
						this.end(token);
						break;

					case 'comment':
						this.comment(token);
						break;

					case 'at-word':
						this.atrule(token);
						break;

					case '{':
						this.emptyRule(token);
						break;

					default:
						this.other(token);
						break;
				}
			}

			this.endFile();
		} catch (error) {
			throw this.fixErrorPosition(error);
		}
	}

	other(start) {
		let end = false;
		let type = null;
		let colon = false;
		let bracket = null;
		let brackets = [];
		let customProperty = start[1].startsWith('--');

		let tokens = [];
		let token = start;

		while (token) {
			type = token[0];
			tokens.push(token);

			if (type === '(' || type === '[') {
				if (!bracket) bracket = token;

				brackets.push(type === '(' ? ')' : ']');
			} else if (customProperty && colon && type === '{') {
				if (!bracket) bracket = token;

				brackets.push('}');
			} else if (brackets.length === 0) {
				if (type === ';') {
					if (colon) {
						this.decl(tokens, customProperty);

						return;
					}

					break;
				} else if (type === '{') {
					this.rule(tokens);

					return;
				} else if (type === '}') {
					this.tokenizer.back(tokens.pop());
					end = true;
					break;
				} else if (type === ':') {
					colon = true;
					// STYLED PATCH {
				} else if (type === 'at-word') {
					this.tokenizer.back(tokens.pop());
					end = true;
					break;
					// } STYLED PATCH
				}
			} else if (type === brackets[brackets.length - 1]) {
				brackets.pop();

				if (brackets.length === 0) bracket = null;
			}

			token = this.tokenizer.nextToken();
		}

		if (this.tokenizer.endOfFile()) end = true;

		if (brackets.length > 0) this.unclosedBracket(bracket);

		if (end && colon) {
			if (!customProperty) {
				while (tokens.length) {
					token = tokens[tokens.length - 1][0];

					if (token !== 'space' && token !== 'comment') break;

					this.tokenizer.back(tokens.pop());
				}
			}

			this.decl(tokens, customProperty);

			// STYLED PATCH {
			return;
			// } STYLED PATCH
		}

		// STYLED PATCH {
		for (token of tokens) {
			if (this.isInterpolation(token) || token[0] === 'space' || token[0] === ';') {
				this.spaces += token[1];
			} else if (token[0] === 'comment') {
				this.comment(token);
			} else {
				this.unknownWord([token]);
			}
		}
		// } STYLED PATCH
	}

	rule(tokens) {
		// Removes {
		tokens.pop();

		// STYLED PATCH {
		this.spaces += this.spacesAndInterpolationsFromStart(tokens);
		// } STYLED PATCH

		let node = new Rule();

		this.init(node, tokens[0][2]);

		node.raws.between = this.spacesAndCommentsFromEnd(tokens);
		this.raw(node, 'selector', tokens);
		this.current = node;
	}

	decl(tokens, customProperty) {
		let node = new Declaration();

		this.init(node, tokens[0][2]);

		let last = tokens[tokens.length - 1];

		if (last[0] === ';') {
			this.semicolon = true;
			tokens.pop();
		}

		node.source.end = this.getPosition(last[3] || last[2] || findLastWithPosition(tokens));

		// STYLED PATCH {
		// Add all “lose” words to node raws
		while (
			tokens[0][0] !== 'word' ||
			(this.isInterpolation(tokens[0]) && tokens[1][0] === 'space') ||
			(this.isInterpolation(tokens[0]) && this.isInterpolation(tokens[1]))
		) {
			// } STYLED PATCH
			if (tokens.length === 1) this.unknownWord(tokens);

			node.raws.before += tokens.shift()[1];
		}

		node.source.start = this.getPosition(tokens[0][2]);

		node.prop = '';

		while (tokens.length) {
			let type = tokens[0][0];

			if (type === ':' || type === 'space' || type === 'comment') {
				break;
			}

			node.prop += tokens.shift()[1];
		}

		node.raws.between = '';

		let token;

		while (tokens.length) {
			token = tokens.shift();

			if (token[0] === ':') {
				node.raws.between += token[1];
				break;
			} else {
				if (token[0] === 'word' && /\w/.test(token[1])) {
					this.unknownWord([token]);
				}

				node.raws.between += token[1];
			}
		}

		if (node.prop[0] === '_' || node.prop[0] === '*') {
			node.raws.before += node.prop[0];
			node.prop = node.prop.slice(1);
		}

		let firstSpaces = [];
		let next;

		while (tokens.length) {
			next = tokens[0][0];

			if (next !== 'space' && next !== 'comment') break;

			firstSpaces.push(tokens.shift());
		}

		this.precheckMissedSemicolon(tokens);

		for (let i = tokens.length - 1; i >= 0; i--) {
			token = tokens[i];

			if (token[1].toLowerCase() === '!important') {
				node.important = true;
				let string = this.stringFrom(tokens, i);

				string = this.spacesFromEnd(tokens) + string;

				if (string !== ' !important') node.raws.important = string;

				break;
			} else if (token[1].toLowerCase() === 'important') {
				let cache = [...tokens];
				let str = '';

				for (let j = i; j > 0; j--) {
					let type = cache[j][0];

					if (str.trim().indexOf('!') === 0 && type !== 'space') {
						break;
					}

					str = cache.pop()[1] + str;
				}

				if (str.trim().indexOf('!') === 0) {
					node.important = true;
					node.raws.important = str;
					tokens = cache; // eslint-disable-line no-param-reassign
				}
			}

			if (token[0] !== 'space' && token[0] !== 'comment') {
				break;
			}
		}

		let hasWord = tokens.some((i) => i[0] !== 'space' && i[0] !== 'comment');

		if (hasWord) {
			node.raws.between += firstSpaces.map((i) => i[1]).join('');
			firstSpaces = [];
		}

		this.raw(node, 'value', firstSpaces.concat(tokens), customProperty); // eslint-disable-line unicorn/prefer-spread

		if (node.value.includes(':') && !customProperty) {
			this.checkMissedSemicolon(tokens);
		}
	}

	// Helpers

	fixLine(line) {
		return this.root.source.start.line - 1 + line;
	}

	fixColumn(line, column) {
		let isSameLineAsRootStart = line === 1;

		return isSameLineAsRootStart ? this.root.source.start.column - 1 + column : column;
	}

	unfixPosition(position) {
		return {
			offset: position.offset - this.root.source.start.offset,
			line: position.line - this.root.source.start.line + 1,
			column:
				position.line === this.root.source.start.line
					? position.column - this.root.source.start.column + 1
					: position.column,
		};
	}

	getPosition(offset) {
		let pos = this.input.fromOffset(offset);

		// STYLED PATCH {
		return {
			offset: this.root.source.start.offset + offset,
			line: this.fixLine(pos.line),
			column: this.fixColumn(pos.line, pos.col),
		};
		// } STYLED PATCH
	}

	isInterpolation(token) {
		if (token[0] !== 'word') {
			return false;
		}

		return this.interpolations?.some(
			(item) => item.start === token[2] && item.end === token[3],
		);
	}

	spacesAndInterpolationsFromStart(tokens) {
		let spaces = '';
		let removedTokens = [];
		let hasInterpolation = false;
		let tokensLength = tokens.length;
		let index;

		for (index = 0; index < tokensLength; index++) {
			let current = tokens.shift();

			spaces += current[1];
			removedTokens.push(current);

			if (index === 0 && this.isInterpolation(current)) {
				hasInterpolation = true;
			}

			if (current[0] === 'space' && current[1].includes('\n')) {
				const nextToken = tokens[0];

				if (nextToken && this.isInterpolation(nextToken)) {
					continue;
				}

				break;
			}
		}

		// If all tokens were cycled through, then it means there were no interpolation on a separate line
		if (index === tokensLength || !hasInterpolation) {
			tokens.unshift(...removedTokens);

			return '';
		}

		return spaces;
	}

	// Errors

	fixErrorPosition(rawError) {
		let error = rawError;

		if (error.name === 'CssSyntaxError') {
			if (error.line) {
				error.line = this.fixLine(error.line);

				if (error.column) {
					error.column = this.fixColumn(error.line, error.column);
				}
			}

			if (error.endLine) {
				error.endLine = this.fixLine(error.endLine);

				if (error.endColumn) {
					error.endColumn = this.fixColumn(error.endLine, error.endColumn);
				}
			}

			if (error.input) {
				if (error.input.line) {
					error.input.line = this.fixLine(error.input.line);

					if (error.input.column) {
						error.input.column = this.fixColumn(error.input.line, error.input.column);
					}
				}

				if (error.input.endLine) {
					error.input.endLine = this.fixLine(error.input.endLine);

					if (error.input.endColumn) {
						error.input.endColumn = this.fixColumn(
							error.input.endLine,
							error.input.endColumn,
						);
					}
				}
			}

			error.message = error.message.replace(/:\d+:\d+:/, `:${error.line}:${error.column}:`);
		}

		throw error;
	}

	unclosedBlock() {
		// STYLED PATCH {
		let pos = this.unfixPosition(this.current.source.start);
		// } STYLED PATCH

		throw this.input.error('Unclosed block', pos.line, pos.column);
	}
}

module.exports = Parser;
