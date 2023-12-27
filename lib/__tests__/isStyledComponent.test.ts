let ts = require('typescript');
let { isStyledComponent } = require('../isStyledComponent');

describe('isStyledComponent', () => {
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
});
