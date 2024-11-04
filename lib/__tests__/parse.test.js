// @ts-nocheck
const parse = require('../parse');

describe('no interpolations', () => {
	test('one component', () => {
		let document = parse('let Component = styled.div`color: red;`;');

		expect(document.nodes).toHaveLength(1);

		let firstComponent = document.first;

		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 38,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '',
			semicolon: true,
		});
		expect(firstComponent.source.start).toEqual({
			offset: 27,
			line: 1,
			column: 28,
		});

		let decl = firstComponent.first;

		expect(decl.prop).toBe('color');
		expect(decl.value).toBe('red');
		expect(decl.source.start).toEqual({
			offset: 27,
			line: 1,
			column: 28,
		});
		expect(decl.source.end).toEqual({
			offset: 37,
			line: 1,
			column: 38,
		});
	});

	test('two components', () => {
		let document = parse(
			'let Component = styled.div`color: red;`;\nlet Component = styled.div`border-color: blue`;',
		);

		expect(document.nodes).toHaveLength(2);

		let firstComponent = document.first;

		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 38,
			codeBefore: 'let Component = styled.div`',
			after: '',
			semicolon: true,
		});
		expect(firstComponent.source.start).toEqual({
			offset: 27,
			line: 1,
			column: 28,
		});

		expect(firstComponent.first.prop).toBe('color');
		expect(firstComponent.first.value).toBe('red');
		expect(firstComponent.first.source.start).toEqual({
			offset: 27,
			line: 1,
			column: 28,
		});
		expect(firstComponent.first.source.end).toEqual({
			offset: 37,
			line: 1,
			column: 38,
		});

		let secondComponent = document.first.next();

		expect(secondComponent.nodes).toHaveLength(1);
		expect(secondComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 68,
			styledSyntaxRangeEnd: 86,
			codeBefore: '`;\nlet Component = styled.div`',
			codeAfter: '`;',
			after: '',
			semicolon: false,
		});
		expect(secondComponent.source.start).toEqual({
			offset: 68,
			line: 2,
			column: 28,
		});

		expect(secondComponent.first.prop).toBe('border-color');
		expect(secondComponent.first.value).toBe('blue');
		expect(secondComponent.first.source.start).toEqual({
			offset: 68,
			line: 2,
			column: 28,
		});
		expect(secondComponent.first.source.end).toEqual({
			offset: 85,
			line: 2,
			column: 45,
		});
	});

	test('empty component', () => {
		let document = parse('let Component = styled.div``;');

		expect(document.nodes).toHaveLength(1);
		expect(document.first.nodes).toHaveLength(0);
		expect(document.first.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 27,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '',
		});
		expect(document.first.toString()).toBe('');
	});

	test('property on its row. no extra space', () => {
		let document = parse('let Component = styled.div`\n\tcolor: red;\n`;');

		expect(document.nodes).toHaveLength(1);

		let firstComponent = document.first;

		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.raws).toEqual({
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '\n',
			semicolon: true,
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeEnd: 41,
			styledSyntaxRangeStart: 27,
		});
		expect(firstComponent.source.start).toEqual({
			offset: 27,
			line: 1,
			column: 28,
		});

		let decl = firstComponent.first;

		expect(decl.prop).toBe('color');
		expect(decl.value).toBe('red');
		expect(decl.source.start).toEqual({
			offset: 29,
			line: 2,
			column: 2,
		});
		expect(decl.source.end).toEqual({
			offset: 39,
			line: 2,
			column: 12,
		});
	});

	test('property on its row. extra space in the begining', () => {
		let document = parse('let Component = styled.div` \n\tcolor: red;\n`;');

		expect(document.nodes).toHaveLength(1);
		expect(document.first.nodes).toHaveLength(1);
		expect(document.first.first.prop).toBe('color');
		expect(document.first.first.value).toBe('red');
		expect(document.first.raws).toEqual({
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '\n',
			semicolon: true,
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeEnd: 42,
			styledSyntaxRangeStart: 27,
		});

		expect(document.first.toString()).toBe(' \n\tcolor: red;\n');
	});

	test('empty file', () => {
		let document = parse('');

		expect(document.nodes).toHaveLength(0);
		expect(document.toString()).toBe('');
	});

	test('no components in a file', () => {
		let document = parse('function styled() { return false }');

		expect(document.nodes).toHaveLength(0);
		expect(document.toString()).toBe('');
		expect(document.raws).toEqual({});
	});

	test('selector could be on multiple lines', () => {
		let document = parse('let Component = styled.div`a,\n\tb { color: red; }`;');

		expect(document.nodes).toHaveLength(1);
		expect(document.first.nodes).toHaveLength(1);
		expect(document.first.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 48,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '',
			semicolon: false,
		});

		let firstNode = document.first.first;

		expect(firstNode.type).toBe('rule');
		expect(firstNode.selector).toBe('a,\n\tb');
		expect(firstNode.nodes).toHaveLength(1);
		expect(firstNode.raws.before).toBe('');
	});

	test('comment in selector', () => {
		let document = parse('let Component = styled.div`a, /* hello */ b { color: red; }`;');

		expect(document.nodes).toHaveLength(1);
		expect(document.first.nodes).toHaveLength(1);
		expect(document.first.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 59,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '',
			semicolon: false,
		});

		let firstNode = document.first.first;

		expect(firstNode.type).toBe('rule');
		expect(firstNode.selector).toBe('a,  b');
		expect(firstNode.nodes).toHaveLength(1);
		expect(firstNode.raws.before).toBe('');
		expect(firstNode.raws.selector).toEqual({
			value: 'a,  b',
			raw: 'a, /* hello */ b',
		});
	});
});

describe('simple interpolations', () => {
	describe('properties', () => {
		test('property value (no semicolon)', () => {
			let document = parse('let Component = styled.div`color: ${red}`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 40,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('${red}');
		});

		test('property value with symbol right before interpolation', () => {
			let document = parse('let Component = styled.div`margin: -${space}`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 44,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('margin');
			expect(firstNode.value).toBe('-${space}');
		});

		test('property value (with semicolon)', () => {
			let document = parse('let Component = styled.div`color: ${red};`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 41,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: true,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('${red}');
		});

		test('property value and !important (no semicolon)', () => {
			let document = parse('let Component = styled.div`color: ${red} !important`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 51,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('${red}');
			expect(firstNode.important).toBe(true);
		});

		test('property value and !important (with semicolon)', () => {
			let document = parse('let Component = styled.div`color: ${red} !important;`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 52,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: true,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('${red}');
			expect(firstNode.important).toBe(true);
		});

		test('property value with two interpolations', () => {
			let document = parse(
				'let Component = styled.div`box-shadow: ${elevation1}, ${elevation2}`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 67,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('box-shadow');
			expect(firstNode.value).toBe('${elevation1}, ${elevation2}');
		});

		test('property value with props interpolation', () => {
			let document = parse(
				'let Component = styled.div`background-image: ${(props) => props.backgroundImage}`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 80,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('background-image');
			expect(firstNode.value).toBe('${(props) => props.backgroundImage}');
		});

		test('property value with interpolation inside url function', () => {
			let document = parse('let Component = styled.div`background-image: url(${imageUrl})`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 61,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('background-image');
			expect(firstNode.value).toBe('url(${imageUrl})');
		});

		test('property value with props interpolation inside url function', () => {
			let document = parse(
				'let Component = styled.div`background-image: url(${(props) => props.backgroundImage})`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 85,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('background-image');
			expect(firstNode.value).toBe('url(${(props) => props.backgroundImage})');
		});

		test('property name (first property)', () => {
			let document = parse('let Component = styled.div`${color}: red`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 40,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('${color}');
			expect(firstNode.value).toBe('red');
		});

		test('property name (second property)', () => {
			let document = parse('let Component = styled.div`display: flex; ${color}: red`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(2);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 55,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;
			let secondNode = firstNode.next();

			expect(firstNode.prop).toBe('display');
			expect(firstNode.value).toBe('flex');

			expect(secondNode.prop).toBe('${color}');
			expect(secondNode.value).toBe('red');
		});
	});

	describe('selectors', () => {
		test('in selector (whole selector)', () => {
			let document = parse('let Component = styled.div`${Component} { color: red; }`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 55,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('${Component}');
			expect(firstNode.nodes).toHaveLength(1);
		});

		test('two interpolations in selector (whole selector)', () => {
			let document = parse(
				'let Component = styled.div`${Component} ${Component1} { color: red; }`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 69,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('${Component} ${Component1}');
			expect(firstNode.nodes).toHaveLength(1);
		});

		test('in selector (whole selector starts with a dot)', () => {
			let document = parse('let Component = styled.div`.${Component} { color: red; }`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 56,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('.${Component}');
			expect(firstNode.nodes).toHaveLength(1);
		});

		test('in selector (first selector is interpolation)', () => {
			let document = parse('let Component = styled.div`${Component}, a { color: red; }`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 58,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('${Component}, a');
			expect(firstNode.nodes).toHaveLength(1);
		});

		test('in selector (second selector is interpolation, two selectors)', () => {
			let document = parse('let Component = styled.div`a, ${Component} { color: red; }`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 58,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('a, ${Component}');
			expect(firstNode.nodes).toHaveLength(1);
		});

		test('in selector (second part is interpolation, one selector)', () => {
			let document = parse('let Component = styled.div`a ${Component} { color: red; }`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 57,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('a ${Component}');
			expect(firstNode.nodes).toHaveLength(1);
		});

		test('in selector (first part is interpolation, one selector)', () => {
			let document = parse('let Component = styled.div`${Component} a { color: red; }`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 57,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('${Component} a');
			expect(firstNode.nodes).toHaveLength(1);
		});

		test('interpolation with semicolon before selector', () => {
			let document = parse('let Component = styled.div`${Component}; a { color: red; }`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 58,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('a');
			expect(firstNode.nodes).toHaveLength(1);
			expect(firstNode.raws.before).toBe('${Component}; ');
		});

		test('interpolation on a new line before selector', () => {
			let document = parse('let Component = styled.div`${hello}\n\ta { color: red; }`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 54,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('a');
			expect(firstNode.nodes).toHaveLength(1);
			expect(firstNode.raws.before).toBe('${hello}\n\t');
		});

		test('two interpolations on a new line before selector', () => {
			let document = parse(
				'let Component = styled.div`${hello}\n\t${hello}\n\ta { color: red; }`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 64,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('a');
			expect(firstNode.nodes).toHaveLength(1);
			expect(firstNode.raws.before).toBe('${hello}\n\t${hello}\n\t');
		});

		test('comment in selector with interpolation', () => {
			let document = parse(
				'let Component = styled.div`${Card}:hover, /* hello */ b { color: red; }`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 71,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('rule');
			expect(firstNode.selector).toBe('${Card}:hover,  b');
			expect(firstNode.nodes).toHaveLength(1);
			expect(firstNode.raws.before).toBe('');
			expect(firstNode.raws.selector).toEqual({
				value: '${Card}:hover,  b',
				raw: '${Card}:hover, /* hello */ b',
			});
		});
	});

	describe('standalone interpolation', () => {
		test('after declaration (no semicolon, no space after)', () => {
			let document = parse('let Component = styled.div`color: red; ${borderWidth}`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 53,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${borderWidth}',
				semicolon: true,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
		});

		test('after declaration (no semicolon, space after)', () => {
			let document = parse('let Component = styled.div`color: red; ${borderWidth} `;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 54,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${borderWidth} ',
				semicolon: true,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
		});

		test('multiple after declaration (no semicolon, space after)', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${borderWidth} ${hello} `;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 63,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${borderWidth} ${hello} ',
				semicolon: true,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
		});

		test('after declaration (with semicolon)', () => {
			let document = parse('let Component = styled.div`color: red; ${borderWidth};`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 54,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${borderWidth};',
				semicolon: true,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
		});

		test('throws for non-interpolation word after declaration', () => {
			expect(() => {
				parse('let Component = styled.div`color: red; ${borderWidth} notInterpolation`;');
			}).toThrow(/:1:55: Unknown word/);
		});

		test('before declaration (no semicolon, no space)', () => {
			let document = parse('let Component = styled.div`${borderWidth}color: red`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 51,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('${borderWidth}color');
			expect(firstNode.value).toBe('red');
		});

		test('before declaration (with space)', () => {
			let document = parse('let Component = styled.div`${borderWidth} color: red`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 52,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
			expect(firstNode.raws.before).toBe('${borderWidth} ');
		});

		test('before declaration (with semicolon)', () => {
			let document = parse('let Component = styled.div`${borderWidth};color: red`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 52,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
			expect(firstNode.raws.before).toBe('${borderWidth};');
		});

		test('before declaration (with semicolon and space)', () => {
			let document = parse('let Component = styled.div`${borderWidth}; color: red`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 53,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
			expect(firstNode.raws.before).toBe('${borderWidth}; ');
		});

		test('between two declarations (no semicolon)', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${borderWidth} border-color: blue;`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(2);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 73,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: true,
			});

			let firstNode = document.first.first;
			let secondNode = firstNode.next();

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');

			expect(secondNode.prop).toBe('border-color');
			expect(secondNode.value).toBe('blue');

			expect(secondNode.raws.before).toBe(' ${borderWidth} ');
		});

		test('between two declarations (with semicolon)', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${borderWidth}; border-color: blue;`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(2);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 74,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: true,
			});

			let firstNode = document.first.first;
			let secondNode = firstNode.next();

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');

			expect(secondNode.prop).toBe('border-color');
			expect(secondNode.value).toBe('blue');

			expect(secondNode.raws.before).toBe(' ${borderWidth}; ');
		});

		test('as the only content (no semicolon)', () => {
			let document = parse('let Component = styled.div`${color}`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(0);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 35,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '${color}',
			});
		});

		test('as the only content (with semicolon)', () => {
			let document = parse('let Component = styled.div`${color};`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(0);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 36,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '${color};',
			});
		});

		test('between three declarations (no semicolon)', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${borderWidth} border-color: blue; ${anotherThing} display: none;`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(3);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 104,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: true,
			});

			let firstNode = document.first.first;
			let secondNode = firstNode.next();
			let thirdNode = secondNode.next();

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');

			expect(secondNode.prop).toBe('border-color');
			expect(secondNode.value).toBe('blue');

			expect(secondNode.raws.before).toBe(' ${borderWidth} ');

			expect(thirdNode.prop).toBe('display');
			expect(thirdNode.value).toBe('none');

			expect(thirdNode.raws.before).toBe(' ${anotherThing} ');
		});

		test('between two declarations, and also trailing interpolation', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${ borderWidth} border-color: blue; ${anotherThing}`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(2);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 90,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${anotherThing}',
				semicolon: true,
			});

			let firstNode = document.first.first;
			let secondNode = firstNode.next();

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');

			expect(secondNode.prop).toBe('border-color');
			expect(secondNode.value).toBe('blue');

			expect(secondNode.raws.before).toBe(' ${ borderWidth} ');
		});

		test('after comment (no semicolon)', () => {
			let document = parse('let Component = styled.div`/* hello */ ${borderWidth}`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 53,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${borderWidth}',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('comment');
			expect(firstNode.text).toBe('hello');
		});

		test('after comment (with semicolon)', () => {
			let document = parse('let Component = styled.div`/* hello */ ${borderWidth};`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 54,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${borderWidth};',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('comment');
			expect(firstNode.text).toBe('hello');
		});

		test('before comment (no semicolon, no space)', () => {
			let document = parse('let Component = styled.div`${borderWidth}/* hello */`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 52,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('comment');
			expect(firstNode.text).toBe('hello');
			expect(firstNode.raws.before).toBe('${borderWidth}');
		});

		test('before comment (no semicolon, with space)', () => {
			let document = parse('let Component = styled.div`${borderWidth} /* hello */`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 53,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('comment');
			expect(firstNode.text).toBe('hello');
			expect(firstNode.raws.before).toBe('${borderWidth} ');
		});

		test('before comment (with semicolon, no space)', () => {
			let document = parse('let Component = styled.div`${borderWidth};/* hello */`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 53,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('comment');
			expect(firstNode.text).toBe('hello');
			expect(firstNode.raws.before).toBe('${borderWidth};');
		});

		test('before comment (with semicolon and space)', () => {
			let document = parse('let Component = styled.div`${borderWidth}; /* hello */`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 54,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('comment');
			expect(firstNode.text).toBe('hello');
			expect(firstNode.raws.before).toBe('${borderWidth}; ');
		});

		test('before at-rule (with semicolon)', () => {
			let document = parse('let Component = styled.div`${borderWidth};@media screen {}`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 58,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('atrule');
			expect(firstNode.name).toBe('media');
			expect(firstNode.params).toBe('screen');
			expect(firstNode.raws.before).toBe('${borderWidth};');
			expect(firstNode.nodes).toHaveLength(0);
		});

		test('before at-rule (without semicolon)', () => {
			let document = parse('let Component = styled.div`${borderWidth} @media screen {}`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 58,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('atrule');
			expect(firstNode.name).toBe('media');
			expect(firstNode.params).toBe('screen');
			expect(firstNode.raws.before).toBe('${borderWidth} ');
			expect(firstNode.nodes).toHaveLength(0);
		});
	});

	describe('multiple standalone interpolations', () => {
		test('after declaration (no semicolon, no space after)', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${borderWidth}${borderWidth}`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 67,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${borderWidth}${borderWidth}',
				semicolon: true,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
		});

		test('after declaration (no semicolon, space after)', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${borderWidth} ${borderWidth} `;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 69,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${borderWidth} ${borderWidth} ',
				semicolon: true,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
		});

		test('after declaration (with semicolon)', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${borderWidth} ${borderWidth};`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 69,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: ' ${borderWidth} ${borderWidth};',
				semicolon: true,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
		});

		test('before declaration (no semicolon, no space)', () => {
			let document = parse(
				'let Component = styled.div`${borderWidth} ${background}color: red`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 65,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('${background}color');
			expect(firstNode.value).toBe('red');
			expect(firstNode.raws.before).toBe('${borderWidth} ');
		});

		test('before declaration (no semicolon, with space)', () => {
			let document = parse(
				'let Component = styled.div`${borderWidth}${background} color: red`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 65,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
			expect(firstNode.raws.before).toBe('${borderWidth}${background} ');
		});

		test('before declaration (no semicolon, with space, three interpolations)', () => {
			let document = parse(
				'let Component = styled.div`${borderWidth}${background}${display} color: red`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 75,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
			expect(firstNode.raws.before).toBe('${borderWidth}${background}${display} ');
		});

		test('before declaration (with space)', () => {
			let document = parse(
				'let Component = styled.div`${borderWidth} ${borderWidth} color: red`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 67,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
			expect(firstNode.raws.before).toBe('${borderWidth} ${borderWidth} ');
		});

		test('before declaration (with semicolon)', () => {
			let document = parse(
				'let Component = styled.div`${borderWidth}${borderWidth};color: red`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 66,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
			expect(firstNode.raws.before).toBe('${borderWidth}${borderWidth};');
		});

		test('before declaration (with semicolon and space)', () => {
			let document = parse(
				'let Component = styled.div`${borderWidth}${borderWidth}; color: red`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 67,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');
			expect(firstNode.raws.before).toBe('${borderWidth}${borderWidth}; ');
		});

		test('between two declarations (no semicolon)', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${borderWidth} ${borderWidth} border-color: blue;`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(2);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 88,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: true,
			});

			let firstNode = document.first.first;
			let secondNode = firstNode.next();

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');

			expect(secondNode.prop).toBe('border-color');
			expect(secondNode.value).toBe('blue');

			expect(secondNode.raws.before).toBe(' ${borderWidth} ${borderWidth} ');
		});

		test('between two declarations (with semicolon)', () => {
			let document = parse(
				'let Component = styled.div`color: red; ${borderWidth} ${borderWidth}; border-color: blue;`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(2);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 89,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: true,
			});

			let firstNode = document.first.first;
			let secondNode = firstNode.next();

			expect(firstNode.prop).toBe('color');
			expect(firstNode.value).toBe('red');

			expect(secondNode.prop).toBe('border-color');
			expect(secondNode.value).toBe('blue');

			expect(secondNode.raws.before).toBe(' ${borderWidth} ${borderWidth}; ');
		});

		test('before comment (no semicolon, with space)', () => {
			let document = parse(
				'let Component = styled.div`${borderWidth}${background} /* hello */`;',
			);

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(1);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 66,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '',
				semicolon: false,
			});

			let firstNode = document.first.first;

			expect(firstNode.type).toBe('comment');
			expect(firstNode.text).toBe('hello');
			expect(firstNode.raws.before).toBe('${borderWidth}${background} ');
		});

		test('as the only content (no semicolon)', () => {
			let document = parse('let Component = styled.div`${color}${color}`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(0);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 43,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '${color}${color}',
			});
		});

		test('as the only content (with semicolon)', () => {
			let document = parse('let Component = styled.div`${color}${color};`;');

			expect(document.nodes).toHaveLength(1);
			expect(document.first.nodes).toHaveLength(0);
			expect(document.first.raws).toEqual({
				isRuleLike: true,
				styledSyntaxIsComponent: true,
				styledSyntaxRangeStart: 27,
				styledSyntaxRangeEnd: 44,
				codeBefore: 'let Component = styled.div`',
				codeAfter: '`;',
				after: '${color}${color};',
			});
		});
	});

	describe('inside a rule', () => {
		describe('selectors', () => {
			test('in selector (whole selector)', () => {
				let document = parse(
					'let Component = styled.div`div{${Component} { color: red; }}`;',
				);

				expect(document.nodes).toHaveLength(1);
				expect(document.first.nodes).toHaveLength(1);
				expect(document.first.raws).toEqual({
					isRuleLike: true,
					styledSyntaxIsComponent: true,
					styledSyntaxRangeStart: 27,
					styledSyntaxRangeEnd: 60,
					codeBefore: 'let Component = styled.div`',
					codeAfter: '`;',
					after: '',
					semicolon: false,
				});

				let firstNode = document.first.first;

				expect(firstNode.type).toBe('rule');
				expect(firstNode.selector).toBe('div');
				expect(firstNode.nodes).toHaveLength(1);

				let firstInsideNode = firstNode.first;

				expect(firstInsideNode.type).toBe('rule');
				expect(firstInsideNode.selector).toBe('${Component}');
				expect(firstInsideNode.nodes).toHaveLength(1);
			});

			test('in selector (first part is interpolation, one selector)', () => {
				let document = parse(
					'let Component = styled.div`div{ ${Component} a { color: red; } }`;',
				);

				expect(document.nodes).toHaveLength(1);
				expect(document.first.nodes).toHaveLength(1);
				expect(document.first.raws).toEqual({
					isRuleLike: true,
					styledSyntaxIsComponent: true,
					styledSyntaxRangeStart: 27,
					styledSyntaxRangeEnd: 64,
					codeBefore: 'let Component = styled.div`',
					codeAfter: '`;',
					after: '',
					semicolon: false,
				});

				let firstNode = document.first.first;

				expect(firstNode.type).toBe('rule');
				expect(firstNode.selector).toBe('div');
				expect(firstNode.nodes).toHaveLength(1);

				let firstInsideNode = firstNode.first;

				expect(firstInsideNode.type).toBe('rule');
				expect(firstInsideNode.selector).toBe('${Component} a');
				expect(firstInsideNode.nodes).toHaveLength(1);
			});

			test('interpolation with semicolon before selector', () => {
				let document = parse(
					'let Component = styled.div`div {${Component}; a { color: red; }}`;',
				);

				expect(document.nodes).toHaveLength(1);
				expect(document.first.nodes).toHaveLength(1);
				expect(document.first.raws).toEqual({
					isRuleLike: true,
					styledSyntaxIsComponent: true,
					styledSyntaxRangeStart: 27,
					styledSyntaxRangeEnd: 64,
					codeBefore: 'let Component = styled.div`',
					codeAfter: '`;',
					after: '',
					semicolon: false,
				});

				let firstNode = document.first.first;

				expect(firstNode.type).toBe('rule');
				expect(firstNode.selector).toBe('div');
				expect(firstNode.nodes).toHaveLength(1);

				let firstInsideNode = firstNode.first;

				expect(firstInsideNode.type).toBe('rule');
				expect(firstInsideNode.selector).toBe('a');
				expect(firstInsideNode.nodes).toHaveLength(1);
				expect(firstInsideNode.raws.before).toBe('${Component}; ');
			});
		});

		describe('standalone interpolation', () => {
			test('after declaration (no semicolon, space after)', () => {
				let document = parse(
					'let Component = styled.div`div{color: red; ${borderWidth} }`;',
				);

				expect(document.nodes).toHaveLength(1);
				expect(document.first.nodes).toHaveLength(1);
				expect(document.first.raws).toEqual({
					isRuleLike: true,
					styledSyntaxIsComponent: true,
					styledSyntaxRangeStart: 27,
					styledSyntaxRangeEnd: 59,
					codeBefore: 'let Component = styled.div`',
					codeAfter: '`;',
					after: '',
					semicolon: false,
				});

				let firstNode = document.first.first;

				expect(firstNode.type).toBe('rule');
				expect(firstNode.selector).toBe('div');
				expect(firstNode.nodes).toHaveLength(1);
				expect(firstNode.raws).toEqual({
					before: '',
					between: '',
					after: ' ${borderWidth} ',
					semicolon: true,
				});

				let firstInsideNode = firstNode.first;

				expect(firstInsideNode.prop).toBe('color');
				expect(firstInsideNode.value).toBe('red');
			});

			test('after declaration (with semicolon)', () => {
				let document = parse(
					'let Component = styled.div`div{color: red; ${borderWidth};}`;',
				);

				expect(document.nodes).toHaveLength(1);
				expect(document.first.nodes).toHaveLength(1);
				expect(document.first.raws).toEqual({
					isRuleLike: true,
					styledSyntaxIsComponent: true,
					styledSyntaxRangeStart: 27,
					styledSyntaxRangeEnd: 59,
					codeBefore: 'let Component = styled.div`',
					codeAfter: '`;',
					after: '',
					semicolon: false,
				});

				let firstNode = document.first.first;

				expect(firstNode.type).toBe('rule');
				expect(firstNode.selector).toBe('div');
				expect(firstNode.nodes).toHaveLength(1);
				expect(firstNode.raws).toEqual({
					before: '',
					between: '',
					after: ' ${borderWidth};',
					semicolon: true,
				});

				let firstInsideNode = firstNode.first;

				expect(firstInsideNode.prop).toBe('color');
				expect(firstInsideNode.value).toBe('red');
			});

			test('throws for non-interpolation word after declaration', () => {
				expect(() => {
					parse(
						'let Component = styled.div`div{color: red; ${borderWidth} notInterpolation}`;',
					);
				}).toThrow(/:1:59: Unknown word/);
			});

			test('as the only content (no semicolon)', () => {
				let document = parse('let Component = styled.div`div{${color}}`;');

				expect(document.nodes).toHaveLength(1);
				expect(document.first.nodes).toHaveLength(1);
				expect(document.first.raws).toEqual({
					isRuleLike: true,
					styledSyntaxIsComponent: true,
					styledSyntaxRangeStart: 27,
					styledSyntaxRangeEnd: 40,
					codeBefore: 'let Component = styled.div`',
					codeAfter: '`;',
					after: '',
					semicolon: false,
				});

				let firstNode = document.first.first;

				expect(firstNode.type).toBe('rule');
				expect(firstNode.selector).toBe('div');
				expect(firstNode.nodes).toHaveLength(0);
				expect(firstNode.raws).toEqual({
					before: '',
					between: '',
					after: '${color}',
				});
			});

			test('as the only content (with semicolon)', () => {
				let document = parse('let Component = styled.div`div{${color};}`;');

				expect(document.nodes).toHaveLength(1);
				expect(document.first.nodes).toHaveLength(1);
				expect(document.first.raws).toEqual({
					isRuleLike: true,
					styledSyntaxIsComponent: true,
					styledSyntaxRangeStart: 27,
					styledSyntaxRangeEnd: 41,
					codeBefore: 'let Component = styled.div`',
					codeAfter: '`;',
					after: '',
					semicolon: false,
				});

				let firstNode = document.first.first;

				expect(firstNode.type).toBe('rule');
				expect(firstNode.selector).toBe('div');
				expect(firstNode.nodes).toHaveLength(0);
				expect(firstNode.raws).toEqual({
					before: '',
					between: '',
					after: '${color};',
				});
			});
		});
	});
});

describe('interpolations with css helper (one level deep)', () => {
	test('single at the end', () => {
		let document = parse('let Component = styled.div`color: green;${css`color: red`}`;');

		expect(document.nodes).toHaveLength(2);

		let firstComponent = document.first;

		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 58,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '${css`color: red`}',
			semicolon: true,
		});
		expect(firstComponent.source.start).toEqual({
			offset: 27,
			line: 1,
			column: 28,
		});

		expect(firstComponent.first.prop).toBe('color');
		expect(firstComponent.first.value).toBe('green');
		expect(firstComponent.first.source.start).toEqual({
			offset: 27,
			line: 1,
			column: 28,
		});
		expect(firstComponent.first.source.end).toEqual({
			offset: 39,
			line: 1,
			column: 40,
		});

		let cssInterpolation = document.first.next();

		expect(cssInterpolation.nodes).toHaveLength(1);
		expect(cssInterpolation.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: red',
			styledSyntaxRangeEnd: 56,
			styledSyntaxRangeStart: 46,
		});
		expect(cssInterpolation.source.start).toEqual({
			offset: 46,
			line: 1,
			column: 47,
		});

		expect(cssInterpolation.first.prop).toBe('color');
		expect(cssInterpolation.first.value).toBe('red');
		expect(cssInterpolation.first.source.start).toEqual({
			offset: 46,
			line: 1,
			column: 47,
		});
		expect(cssInterpolation.first.source.end).toEqual({
			offset: 55,
			line: 1,
			column: 56,
		});
	});

	test('single at the start', () => {
		let document = parse('let Component = styled.div`${css`color: red`} color: green;`;');

		expect(document.nodes).toHaveLength(2);

		let firstComponent = document.first;

		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 59,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '',
			semicolon: true,
		});

		let firstNode = firstComponent.first;

		expect(firstNode.prop).toBe('color');
		expect(firstNode.value).toBe('green');
		expect(firstNode.raws.before).toBe('${css`color: red`} ');

		let cssInterpolation = document.first.next();

		expect(cssInterpolation.nodes).toHaveLength(1);
		expect(cssInterpolation.first.prop).toBe('color');
		expect(cssInterpolation.first.value).toBe('red');
		expect(cssInterpolation.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: red',
			styledSyntaxRangeEnd: 43,
			styledSyntaxRangeStart: 33,
		});
	});

	test('single at the start and at the end', () => {
		let document = parse(
			'let Component = styled.div`${css`color: red`} color: green;${css`color: blue`}`;',
		);

		expect(document.nodes).toHaveLength(3);

		let firstComponent = document.first;

		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 78,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '${css`color: blue`}',
			semicolon: true,
		});

		let firstNode = firstComponent.first;

		expect(firstNode.prop).toBe('color');
		expect(firstNode.value).toBe('green');
		expect(firstNode.raws.before).toBe('${css`color: red`} ');

		let cssInterpolationOne = document.first.next();

		expect(cssInterpolationOne.nodes).toHaveLength(1);
		expect(cssInterpolationOne.first.prop).toBe('color');
		expect(cssInterpolationOne.first.value).toBe('red');
		expect(cssInterpolationOne.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: red',
			styledSyntaxRangeEnd: 43,
			styledSyntaxRangeStart: 33,
		});

		let cssInterpolationTwo = document.last;

		expect(cssInterpolationTwo.nodes).toHaveLength(1);
		expect(cssInterpolationTwo.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: blue',
			styledSyntaxRangeEnd: 76,
			styledSyntaxRangeStart: 65,
		});

		expect(cssInterpolationTwo.first.prop).toBe('color');
		expect(cssInterpolationTwo.first.value).toBe('blue');
	});

	test('only two interpolations', () => {
		let document = parse('let Component = styled.div`${css`color: red`}${css`color: blue`}`;');

		expect(document.nodes).toHaveLength(3);

		let firstComponent = document.first;

		expect(firstComponent.nodes).toHaveLength(0);
		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 64,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '${css`color: red`}${css`color: blue`}',
		});

		let cssInterpolationOne = document.first.next();

		expect(cssInterpolationOne.nodes).toHaveLength(1);
		expect(cssInterpolationOne.first.prop).toBe('color');
		expect(cssInterpolationOne.first.value).toBe('red');
		expect(cssInterpolationOne.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: red',
			styledSyntaxRangeEnd: 43,
			styledSyntaxRangeStart: 33,
		});

		let cssInterpolationTwo = document.last;

		expect(cssInterpolationTwo.nodes).toHaveLength(1);
		expect(cssInterpolationTwo.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: blue',
			styledSyntaxRangeEnd: 62,
			styledSyntaxRangeStart: 51,
		});

		expect(cssInterpolationTwo.first.prop).toBe('color');
		expect(cssInterpolationTwo.first.value).toBe('blue');
	});
});

describe('interpolations with css helper (many levels deep)', () => {
	test('two levels deep at the end', () => {
		let document = parse('let Component = styled.div`${css`color: red;${css`color: blue`}`}`;');

		expect(document.nodes).toHaveLength(3);

		let firstComponent = document.first;

		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 65,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '${css`color: red;${css`color: blue`}`}',
		});
		expect(firstComponent.nodes).toHaveLength(0);

		let cssInterpolationFirst = document.first.next();

		expect(cssInterpolationFirst.nodes).toHaveLength(1);
		expect(cssInterpolationFirst.raws).toEqual({
			after: '${css`color: blue`}',
			semicolon: true,
			isRuleLike: true,
			styledOriginalContent: 'color: red;${css`color: blue`}',
			styledSyntaxRangeEnd: 63,
			styledSyntaxRangeStart: 33,
		});

		expect(cssInterpolationFirst.first.prop).toBe('color');
		expect(cssInterpolationFirst.first.value).toBe('red');

		let cssInterpolationSecond = cssInterpolationFirst.next();

		expect(cssInterpolationSecond.nodes).toHaveLength(1);
		expect(cssInterpolationSecond.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: blue',
			styledSyntaxRangeEnd: 61,
			styledSyntaxRangeStart: 50,
		});

		expect(cssInterpolationSecond.first.prop).toBe('color');
		expect(cssInterpolationSecond.first.value).toBe('blue');
	});

	test('three levels deep at the end', () => {
		let document = parse(
			'let Component = styled.div`${css`color: red;${css`color: blue;${css`color: green;`}`}`}`;',
		);

		expect(document.nodes).toHaveLength(4);

		let firstComponent = document.first;

		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 87,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '${css`color: red;${css`color: blue;${css`color: green;`}`}`}',
		});
		expect(firstComponent.nodes).toHaveLength(0);

		let cssInterpolationFirst = document.first.next();

		expect(cssInterpolationFirst.nodes).toHaveLength(1);
		expect(cssInterpolationFirst.raws).toEqual({
			after: '${css`color: blue;${css`color: green;`}`}',
			semicolon: true,
			isRuleLike: true,
			styledOriginalContent: 'color: red;${css`color: blue;${css`color: green;`}`}',
			styledSyntaxRangeEnd: 85,
			styledSyntaxRangeStart: 33,
		});

		expect(cssInterpolationFirst.first.prop).toBe('color');
		expect(cssInterpolationFirst.first.value).toBe('red');

		let cssInterpolationSecond = cssInterpolationFirst.next();

		expect(cssInterpolationSecond.nodes).toHaveLength(1);
		expect(cssInterpolationSecond.raws).toEqual({
			after: '${css`color: green;`}',
			semicolon: true,
			isRuleLike: true,
			styledOriginalContent: 'color: blue;${css`color: green;`}',
			styledSyntaxRangeEnd: 83,
			styledSyntaxRangeStart: 50,
		});

		expect(cssInterpolationSecond.first.prop).toBe('color');
		expect(cssInterpolationSecond.first.value).toBe('blue');

		let cssInterpolationThird = cssInterpolationSecond.next();

		expect(cssInterpolationThird.nodes).toHaveLength(1);
		expect(cssInterpolationThird.raws).toEqual({
			after: '',
			semicolon: true,
			isRuleLike: true,
			styledOriginalContent: 'color: green;',
			styledSyntaxRangeEnd: 81,
			styledSyntaxRangeStart: 68,
		});

		expect(cssInterpolationThird.first.prop).toBe('color');
		expect(cssInterpolationThird.first.value).toBe('green');
	});

	test('two levels at the beginning', () => {
		let document = parse(
			'let Component = styled.div`${css`${css`color: blue`} color: red;`}`;',
		);

		expect(document.nodes).toHaveLength(3);

		let firstComponent = document.first;

		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 66,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '${css`${css`color: blue`} color: red;`}',
		});
		expect(firstComponent.nodes).toHaveLength(0);

		let cssInterpolationFirst = document.first.next();

		expect(cssInterpolationFirst.nodes).toHaveLength(1);
		expect(cssInterpolationFirst.raws).toEqual({
			after: '',
			semicolon: true,
			isRuleLike: true,
			styledOriginalContent: '${css`color: blue`} color: red;',
			styledSyntaxRangeEnd: 64,
			styledSyntaxRangeStart: 33,
		});

		expect(cssInterpolationFirst.first.prop).toBe('color');
		expect(cssInterpolationFirst.first.value).toBe('red');
		expect(cssInterpolationFirst.first.raws.before).toBe('${css`color: blue`} ');

		let cssInterpolationSecond = cssInterpolationFirst.next();

		expect(cssInterpolationSecond.nodes).toHaveLength(1);
		expect(cssInterpolationSecond.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: blue',
			styledSyntaxRangeEnd: 50,
			styledSyntaxRangeStart: 39,
		});

		expect(cssInterpolationSecond.first.prop).toBe('color');
		expect(cssInterpolationSecond.first.value).toBe('blue');
	});
});

describe('interpolations with props', () => {
	test('props with no styled helpers (at the end)', () => {
		let document = parse('let Component = styled.div`color: green;${props => `color: red`}`;');

		expect(document.nodes).toHaveLength(1);

		let firstComponent = document.first;

		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 64,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '${props => `color: red`}',
			semicolon: true,
		});
		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.first.prop).toBe('color');
		expect(firstComponent.first.value).toBe('green');
	});

	test('props with css helper (at the end)', () => {
		let document = parse(
			'let Component = styled.div`color: green;${props => css`color: red`}`;',
		);

		expect(document.nodes).toHaveLength(2);

		let firstComponent = document.first;

		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 67,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '${props => css`color: red`}',
			semicolon: true,
		});
		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.first.prop).toBe('color');
		expect(firstComponent.first.value).toBe('green');

		let cssInterpolationFirst = firstComponent.next();

		expect(cssInterpolationFirst.nodes).toHaveLength(1);
		expect(cssInterpolationFirst.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: red',
			styledSyntaxRangeEnd: 65,
			styledSyntaxRangeStart: 55,
		});

		expect(cssInterpolationFirst.first.prop).toBe('color');
		expect(cssInterpolationFirst.first.value).toBe('red');
		expect(cssInterpolationFirst.first.raws.before).toBe('');
	});

	test('props with no styled helpers (at the beginning)', () => {
		let document = parse('let Component = styled.div`${props => `color: red`} color: green;`;');

		expect(document.nodes).toHaveLength(1);

		let firstComponent = document.first;

		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 65,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '',
			semicolon: true,
		});
		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.first.prop).toBe('color');
		expect(firstComponent.first.value).toBe('green');
		expect(firstComponent.first.raws.before).toBe('${props => `color: red`} ');
	});

	test('props with css helper (at the beginning)', () => {
		let document = parse(
			'let Component = styled.div`${props => css`color: red`} color: green;`;',
		);

		expect(document.nodes).toHaveLength(2);

		let firstComponent = document.first;

		expect(firstComponent.raws).toEqual({
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 27,
			styledSyntaxRangeEnd: 68,
			codeBefore: 'let Component = styled.div`',
			codeAfter: '`;',
			after: '',
			semicolon: true,
		});
		expect(firstComponent.nodes).toHaveLength(1);
		expect(firstComponent.first.prop).toBe('color');
		expect(firstComponent.first.value).toBe('green');
		expect(firstComponent.first.raws.before).toBe('${props => css`color: red`} ');

		let cssInterpolation = firstComponent.next();

		expect(cssInterpolation.nodes).toHaveLength(1);
		expect(cssInterpolation.raws).toEqual({
			after: '',
			semicolon: false,
			isRuleLike: true,
			styledOriginalContent: 'color: red',
			styledSyntaxRangeEnd: 52,
			styledSyntaxRangeStart: 42,
		});

		expect(cssInterpolation.first.prop).toBe('color');
		expect(cssInterpolation.first.value).toBe('red');
		expect(cssInterpolation.first.raws.before).toBe('');
	});
});

describe('component notations', () => {
	const notations = [
		'styled.foo',
		'styled(Component)',
		'styled.foo.attrs({})',
		'styled(Component).attrs({})',
		'css',
		'createGlobalStyle',
	];

	test.each(notations)('%s', (notation) => {
		let document = parse('let Component = ' + notation + '`color: red;`;');

		expect(document.nodes).toHaveLength(1);

		let component = document.first;

		expect(component.nodes).toHaveLength(1);
		expect(component.first.prop).toBe('color');
		expect(component.first.value).toBe('red');
		expect(component.raws).toEqual({
			codeBefore: 'let Component = ' + notation + '`',
			codeAfter: '`;',
			after: '',
			semicolon: true,
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 17 + notation.length,
			styledSyntaxRangeEnd: 17 + notation.length + 11,
		});
	});

	test('passing a function', () => {
		let document = parse('let Component = styled.div(props => `color: red;`);');

		expect(document.nodes).toHaveLength(1);

		let component = document.first;

		expect(component.nodes).toHaveLength(1);
		expect(component.first.prop).toBe('color');
		expect(component.first.value).toBe('red');
		expect(component.raws).toEqual({
			codeBefore: 'let Component = styled.div(props => `',
			codeAfter: '`);',
			after: '',
			semicolon: true,
			isRuleLike: true,
			styledSyntaxIsComponent: true,
			styledSyntaxRangeStart: 37,
			styledSyntaxRangeEnd: 37 + 11,
		});
	});
});

test('supports TypeScript', () => {
	let document = parse('let Component = styled.div<{ isDisabled?: boolean; }>`color: red;`;');

	expect(document.nodes).toHaveLength(1);
	expect(document.first.nodes).toHaveLength(1);
	expect(document.first.first.prop).toBe('color');
	expect(document.first.first.value).toBe('red');
	expect(document.first.raws).toEqual({
		codeBefore: 'let Component = styled.div<{ isDisabled?: boolean; }>`',
		codeAfter: '`;',
		after: '',
		semicolon: true,
		isRuleLike: true,
		styledSyntaxIsComponent: true,
		styledSyntaxRangeEnd: 65,
		styledSyntaxRangeStart: 54,
	});
	expect(document.first.toString()).toBe('color: red;');
});

test('component after a component with interpolation', () => {
	let document = parse(
		'const Component = styled.div`\n${css`position: sticky;`}\n`;\nconst Trigger = styled.div``;',
	);

	expect(document.nodes).toHaveLength(3);

	expect(document.nodes[0].raws).toEqual({
		styledSyntaxRangeStart: 29,
		styledSyntaxRangeEnd: 56,
		after: '\n${css`position: sticky;`}\n',
		codeBefore: 'const Component = styled.div`',
		isRuleLike: true,
		styledSyntaxIsComponent: true,
	});

	expect(document.nodes[1].raws).toEqual({
		styledSyntaxRangeStart: 36,
		styledSyntaxRangeEnd: 53,
		isRuleLike: true,
		styledOriginalContent: 'position: sticky;',
		semicolon: true,
		after: '',
	});

	expect(document.nodes[2].raws).toEqual({
		styledSyntaxRangeStart: 86,
		styledSyntaxRangeEnd: 86,
		after: '',
		codeBefore: '`;\nconst Trigger = styled.div`',
		codeAfter: '`;',
		isRuleLike: true,
		styledSyntaxIsComponent: true,
	});
});

test('does not crash for invalid JavaScript syntax', () => {
	let document = parse('const Component = styled.div`position: sticky');

	expect(document.nodes).toHaveLength(0);
	expect(document.toString()).toBe('');
	expect(document.raws).toEqual({});
});
