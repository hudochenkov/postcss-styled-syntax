let ts = require('typescript');
let { isStyledComponent } = require('../isStyledComponent');

describe('isStyledComponent', () => {
	/**
	 * @param {string} code
	 */
	function getExpression(code) {
		const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);

		// @ts-ignore
		const expression = sourceFile.statements[0].expression;

		return expression;
	}

	it('allow styled.foo``', () => {
		let tag = getExpression('styled.foo``');

		expect(isStyledComponent(tag)).toBe(true);
	});

	it('allow styled(Component)``', () => {
		let tag = getExpression('styled(Component)``');

		expect(isStyledComponent(tag)).toBe(true);
	});

	it('allow styled.foo.attrs({})``', () => {
		let tag = getExpression('styled.foo.attrs({})``');

		expect(isStyledComponent(tag)).toBe(true);
	});

	it('allow styled(Component).attrs({})``', () => {
		let tag = getExpression('styled(Component).attrs({})``');

		expect(isStyledComponent(tag)).toBe(true);
	});

	it('allow css``', () => {
		let tag = getExpression('css``');

		expect(isStyledComponent(tag)).toBe(true);
	});

	it('allow createGlobalStyle``', () => {
		let tag = getExpression('createGlobalStyle``');

		expect(isStyledComponent(tag)).toBe(true);
	});

	it('disallow other identifiers', () => {
		let tag = getExpression('other``');

		expect(isStyledComponent(tag)).toBe(false);
	});

	it('disallow sstyled.foo``', () => {
		let tag = getExpression('sstyled.foo``');

		expect(isStyledComponent(tag)).toBe(false);
	});

	it('disallow sstyled(Component)``', () => {
		let tag = getExpression('sstyled(Component)``');

		expect(isStyledComponent(tag)).toBe(false);
	});

	it('disallow sstyled.foo.attrs({})``', () => {
		let tag = getExpression('sstyled.foo.attrs({})``');

		expect(isStyledComponent(tag)).toBe(false);
	});

	it('disallow sstyled(Component).attrs({})``', () => {
		let tag = getExpression('sstyled(Component).attrs({})``');

		expect(isStyledComponent(tag)).toBe(false);
	});

	it('allow styled.foo(props => ``)', () => {
		let tag = getExpression('styled.foo(props => ``)');

		expect(isStyledComponent(tag)).toBe(true);
	});

	it('allow styled.foo(({ prop }) => ``)', () => {
		let tag = getExpression('styled.foo(({ prop }) => ``)');

		expect(isStyledComponent(tag)).toBe(true);
	});

	it("allow styled('foo')(props => ``)", () => {
		let tag = getExpression("styled('foo')(props => ``)");

		expect(isStyledComponent(tag)).toBe(true);
	});

	it('allow styled(Component)(props => ``)', () => {
		let tag = getExpression('styled(Component)(props => ``)');

		expect(isStyledComponent(tag)).toBe(true);
	});

	it('disallow conditional return', () => {
		let tag = getExpression('styled.foo(({ prop }) => props ? `` : ``)');

		expect(isStyledComponent(tag)).toBe(false);
	});

	it('disallow explicit return', () => {
		let tag = getExpression('styled.foo(({ prop }) => { return ``; })');

		expect(isStyledComponent(tag)).toBe(false);
	});

	it('disallow return of not template literal', () => {
		let tag = getExpression("styled.foo(({ prop }) => '')");

		expect(isStyledComponent(tag)).toBe(false);
	});

	it('disallow anything else in the function body', () => {
		let tag = getExpression('styled.foo(({ prop }) => {})');

		expect(isStyledComponent(tag)).toBe(false);
	});
});
