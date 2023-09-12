/* eslint-disable no-useless-concat */
let tokenizer = require('../tokenizer');
let { Input } = require('postcss');

/**
 * @param {string} css
 * @param {import('../tokenizer').TokenizerOptions} [opts]
 */
function tokenize(css, opts) {
	let processor = tokenizer(new Input(css), opts);
	let tokens = [];

	while (!processor.endOfFile()) {
		tokens.push(processor.nextToken());
	}

	return tokens;
}

/**
 * @param {string} css
 * @param {Array<Array<string | number>>} tokens
 * @param {tokenizer.TokenizerOptions} [opts]
 */
function run(css, tokens, opts) {
	expect(tokenize(css, opts)).toEqual(tokens);
}

describe('interpolations', () => {
	test('declaration value', () => {
		run(
			'color: ${va};',
			[
				['word', 'color', 0, 4],
				[':', ':', 5],
				['space', ' '],
				['word', '${va}', 7, 11],
				[';', ';', 12],
			],
			{ interpolations: [{ start: 7, end: 11 }] },
		);
	});

	test('declaration value with url function and simple interpolation', () => {
		run(
			'background-image: url(${props.backgroundImageFdfsdfsdfsd})',
			[
				['word', 'background-image', 0, 15],
				[':', ':', 16],
				['space', ' '],
				['word', 'url', 18, 20],
				['brackets', '(${props.backgroundImageFdfsdfsdfsd})', 21, 57],
			],
			{ interpolations: [{ start: 22, end: 56 }] },
		);
	});

	test('declaration value with url function and brackets inside interpolation', () => {
		run(
			'background-image: url(${(props) => props.backgroundImage})',
			[
				['word', 'background-image', 0, 15],
				[':', ':', 16],
				['space', ' '],
				['word', 'url', 18, 20],
				['brackets', '(${(props) => props.backgroundImage})', 21, 57],
			],
			{ interpolations: [{ start: 22, end: 56 }] },
		);
	});

	test('declaration property', () => {
		run(
			'${co}: black;',
			[
				['word', '${co}', 0, 4],
				[':', ':', 5],
				['space', ' '],
				['word', 'black', 7, 11],
				[';', ';', 12],
			],
			{ interpolations: [{ start: 0, end: 4 }] },
		);
	});

	test('standalone before rule without semicolon', () => {
		let css = '${props}\n' + '\n' + 'a {}';

		run(
			css,
			[
				['word', '${props}', 0, 7],
				['space', '\n\n'],
				['word', 'a', 10, 10],
				['space', ' '],
				['{', '{', 12],
				['}', '}', 13],
			],
			{ interpolations: [{ start: 0, end: 7 }] },
		);
	});

	test('standalone before rule with semicolon', () => {
		let css = '${props};\n' + '\n' + 'a {}';

		run(
			css,
			[
				['word', '${props}', 0, 7],
				[';', ';', 8],
				['space', '\n\n'],
				['word', 'a', 11, 11],
				['space', ' '],
				['{', '{', 13],
				['}', '}', 14],
			],
			{ interpolations: [{ start: 0, end: 7 }] },
		);
	});

	test('standalone after rule without semicolon', () => {
		run(
			'a {}\n\n${props}',
			[
				['word', 'a', 0, 0],
				['space', ' '],
				['{', '{', 2],
				['}', '}', 3],
				['space', '\n\n'],
				['word', '${props}', 6, 13],
			],
			{ interpolations: [{ start: 6, end: 13 }] },
		);
	});

	test('standalone before rule with semicolon', () => {
		run(
			'a {}\n\n${props};',
			[
				['word', 'a', 0, 0],
				['space', ' '],
				['{', '{', 2],
				['}', '}', 3],
				['space', '\n\n'],
				['word', '${props}', 6, 13],
				[';', ';', 14],
			],
			{ interpolations: [{ start: 6, end: 13 }] },
		);
	});

	test('selector with interpolation', () => {
		run(
			'${cls} a {}',
			[
				['word', '${cls}', 0, 5],
				['space', ' '],
				['word', 'a', 7, 7],
				['space', ' '],
				['{', '{', 9],
				['}', '}', 10],
			],
			{ interpolations: [{ start: 0, end: 5 }] },
		);
	});

	test('selector with interpolation, which has symbot immedittelly before', () => {
		run(
			'.${cls} a {}',
			[
				['word', '.${cls}', 0, 6],
				['space', ' '],
				['word', 'a', 8, 8],
				['space', ' '],
				['{', '{', 10],
				['}', '}', 11],
			],
			{ interpolations: [{ start: 1, end: 6 }] },
		);
	});

	test('interpolation with semicolon before at-rule', () => {
		run(
			'${borderWidth};@media screen {}',
			[
				['word', '${borderWidth}', 0, 13],
				[';', ';', 14],
				['at-word', '@media', 15, 20],
				['space', ' '],
				['word', 'screen', 22, 27],
				['space', ' '],
				['{', '{', 29],
				['}', '}', 30],
			],
			{ interpolations: [{ start: 0, end: 13 }] },
		);
	});

	test('interpolation with semicolon before at-rule', () => {
		run(
			'${borderWidth} @media screen {}',
			[
				['word', '${borderWidth}', 0, 13],
				['space', ' '],
				['at-word', '@media', 15, 20],
				['space', ' '],
				['word', 'screen', 22, 27],
				['space', ' '],
				['{', '{', 29],
				['}', '}', 30],
			],
			{ interpolations: [{ start: 0, end: 13 }] },
		);
	});
});

describe('standard PostCSS tests', () => {
	test('tokenizes empty file', () => {
		run('', []);
	});

	test('tokenizes space', () => {
		run('\r\n \f\t', [['space', '\r\n \f\t']]);
	});

	test('tokenizes word', () => {
		run('ab', [['word', 'ab', 0, 1]]);
	});

	test('splits word by !', () => {
		run('aa!bb', [
			['word', 'aa', 0, 1],
			['word', '!bb', 2, 4],
		]);
	});

	test('changes lines in spaces', () => {
		run('a \n b', [
			['word', 'a', 0, 0],
			['space', ' \n '],
			['word', 'b', 4, 4],
		]);
	});

	test('tokenizes control chars', () => {
		run('{:;}', [
			['{', '{', 0],
			[':', ':', 1],
			[';', ';', 2],
			['}', '}', 3],
		]);
	});

	test('escapes control symbols', () => {
		run('\\(\\{\\"\\@\\\\""', [
			['word', '\\(', 0, 1],
			['word', '\\{', 2, 3],
			['word', '\\"', 4, 5],
			['word', '\\@', 6, 7],
			['word', '\\\\', 8, 9],
			['string', '""', 10, 11],
		]);
	});

	test('escapes backslash', () => {
		run('\\\\\\\\{', [
			['word', '\\\\\\\\', 0, 3],
			['{', '{', 4],
		]);
	});

	test('tokenizes simple brackets', () => {
		run('(ab)', [['brackets', '(ab)', 0, 3]]);
	});

	test('tokenizes square brackets', () => {
		run('a[bc]', [
			['word', 'a', 0, 0],
			['[', '[', 1],
			['word', 'bc', 2, 3],
			[']', ']', 4],
		]);
	});

	test('tokenizes complicated brackets', () => {
		run('(())("")(/**/)(\\\\)(\n)(', [
			['(', '(', 0],
			['brackets', '()', 1, 2],
			[')', ')', 3],
			['(', '(', 4],
			['string', '""', 5, 6],
			[')', ')', 7],
			['(', '(', 8],
			['comment', '/**/', 9, 12],
			[')', ')', 13],
			['(', '(', 14],
			['word', '\\\\', 15, 16],
			[')', ')', 17],
			['(', '(', 18],
			['space', '\n'],
			[')', ')', 20],
			['(', '(', 21],
		]);
	});

	test('tokenizes string', () => {
		run('\'"\'"\\""', [
			['string', "'\"'", 0, 2],
			['string', '"\\""', 3, 6],
		]);
	});

	test('tokenizes escaped string', () => {
		run('"\\\\"', [['string', '"\\\\"', 0, 3]]);
	});

	test('changes lines in strings', () => {
		run('"\n\n""\n\n"', [
			['string', '"\n\n"', 0, 3],
			['string', '"\n\n"', 4, 7],
		]);
	});

	test('tokenizes at-word', () => {
		run('@word ', [
			['at-word', '@word', 0, 4],
			['space', ' '],
		]);
	});

	test('tokenizes at-word end', () => {
		run('@one{@two()@three""@four;', [
			['at-word', '@one', 0, 3],
			['{', '{', 4],
			['at-word', '@two', 5, 8],
			['brackets', '()', 9, 10],
			['at-word', '@three', 11, 16],
			['string', '""', 17, 18],
			['at-word', '@four', 19, 23],
			[';', ';', 24],
		]);
	});

	test('tokenizes urls', () => {
		run('url(/*\\))', [
			['word', 'url', 0, 2],
			['brackets', '(/*\\))', 3, 8],
		]);
	});

	test('tokenizes quoted urls', () => {
		run('url(")")', [
			['word', 'url', 0, 2],
			['(', '(', 3],
			['string', '")"', 4, 6],
			[')', ')', 7],
		]);
	});

	test('tokenizes at-symbol', () => {
		run('@', [['at-word', '@', 0, 0]]);
	});

	test('tokenizes comment', () => {
		run('/* a\nb */', [['comment', '/* a\nb */', 0, 8]]);
	});

	test('changes lines in comments', () => {
		run('a/* \n */b', [
			['word', 'a', 0, 0],
			['comment', '/* \n */', 1, 7],
			['word', 'b', 8, 8],
		]);
	});

	test('supports line feed', () => {
		run('a\fb', [
			['word', 'a', 0, 0],
			['space', '\f'],
			['word', 'b', 2, 2],
		]);
	});

	test('supports carriage return', () => {
		run('a\rb\r\nc', [
			['word', 'a', 0, 0],
			['space', '\r'],
			['word', 'b', 2, 2],
			['space', '\r\n'],
			['word', 'c', 5, 5],
		]);
	});

	test('tokenizes CSS', () => {
		let css =
			'a {\n' +
			'  content: "a";\n' +
			'  width: calc(1px;)\n' +
			'  }\n' +
			'/* small screen */\n' +
			'@media screen {}';

		run(css, [
			['word', 'a', 0, 0],
			['space', ' '],
			['{', '{', 2],
			['space', '\n  '],
			['word', 'content', 6, 12],
			[':', ':', 13],
			['space', ' '],
			['string', '"a"', 15, 17],
			[';', ';', 18],
			['space', '\n  '],
			['word', 'width', 22, 26],
			[':', ':', 27],
			['space', ' '],
			['word', 'calc', 29, 32],
			['brackets', '(1px;)', 33, 38],
			['space', '\n  '],
			['}', '}', 42],
			['space', '\n'],
			['comment', '/* small screen */', 44, 61],
			['space', '\n'],
			['at-word', '@media', 63, 68],
			['space', ' '],
			['word', 'screen', 70, 75],
			['space', ' '],
			['{', '{', 77],
			['}', '}', 78],
		]);
	});

	test('throws error on unclosed string', () => {
		expect(() => {
			tokenize(' "');
		}).toThrow(/:1:2: Unclosed string/);
	});

	test('throws error on unclosed comment', () => {
		expect(() => {
			tokenize(' /*');
		}).toThrow(/:1:2: Unclosed comment/);
	});

	test('throws error on unclosed url', () => {
		expect(() => {
			tokenize('url(');
		}).toThrow(/:1:4: Unclosed bracket/);
	});

	test('ignores unclosing string on request', () => {
		run(
			' "',
			[
				['space', ' '],
				['string', '"', 1, 2],
			],
			{ ignoreErrors: true },
		);
	});

	test('ignores unclosing comment on request', () => {
		run(
			' /*',
			[
				['space', ' '],
				['comment', '/*', 1, 3],
			],
			{ ignoreErrors: true },
		);
	});

	test('ignores unclosing function on request', () => {
		run(
			'url(',
			[
				['word', 'url', 0, 2],
				['brackets', '(', 3, 3],
			],
			{ ignoreErrors: true },
		);
	});

	test('tokenizes hexadecimal escape', () => {
		run('\\0a \\09 \\z ', [
			['word', '\\0a ', 0, 3],
			['word', '\\09 ', 4, 7],
			['word', '\\z', 8, 9],
			['space', ' '],
		]);
	});

	test('ignore unclosed per token request', () => {
		/**
		 * @param {string} css
		 * @param {import('../tokenizer').TokenizerOptions} opts
		 */
		function token(css, opts) {
			let processor = tokenizer(new Input(css), opts);
			let tokens = [];

			while (!processor.endOfFile()) {
				tokens.push(processor.nextToken({ ignoreUnclosed: true }));
			}

			return tokens;
		}

		let css = "How's it going (";
		let tokens = token(css, {});
		let expected = [
			['word', 'How', 0, 2],
			['string', "'s", 3, 4],
			['space', ' '],
			['word', 'it', 6, 7],
			['space', ' '],
			['word', 'going', 9, 13],
			['space', ' '],
			['(', '(', 15],
		];

		expect(tokens).toEqual(expected);
	});

	test('provides correct position', () => {
		let css = 'Three tokens';
		let processor = tokenizer(new Input(css));

		expect(processor.position()).toBe(0);
		processor.nextToken();
		expect(processor.position()).toBe(5);
		processor.nextToken();
		expect(processor.position()).toBe(6);
		processor.nextToken();
		expect(processor.position()).toBe(12);
		processor.nextToken();
		expect(processor.position()).toBe(12);
	});
});
