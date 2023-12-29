let { parseJs } = require('../parseJs');

describe('no interpolations', () => {
	test('one component', () => {
		let document = parseJs('let Component = styled.div`color: red;`;');

		expect(document).toMatchSnapshot();
	});

	test('two components', () => {
		let document = parseJs(
			'let Component = styled.div`color: red;`;\nlet Component = styled.div`border-color: blue`;',
		);

		expect(document).toMatchSnapshot();
	});

	test('empty component', () => {
		let document = parseJs('let Component = styled.div``;');

		expect(document).toMatchSnapshot();
	});

	test('property on its row. no extra space', () => {
		let document = parseJs('let Component = styled.div`\n\tcolor: red;\n`;');

		expect(document).toMatchSnapshot();
	});

	test('property on its row. extra space in the begining', () => {
		let document = parseJs('let Component = styled.div` \n\tcolor: red;\n`;');

		expect(document).toMatchSnapshot();
	});

	test('empty file', () => {
		let document = parseJs('');

		expect(document).toMatchSnapshot();
	});

	test('no components in a file', () => {
		let document = parseJs('function styled() { return false }');

		expect(document).toMatchSnapshot();
	});

	test('selector could be on multiple lines', () => {
		let document = parseJs('let Component = styled.div`a,\n\tb { color: red; }`;');

		expect(document).toMatchSnapshot();
	});

	test('comment in selector', () => {
		let document = parseJs('let Component = styled.div`a, /* hello */ b { color: red; }`;');

		expect(document).toMatchSnapshot();
	});
});

describe('simple interpolations', () => {
	describe('properties', () => {
		test('property value (no semicolon)', () => {
			let document = parseJs('let Component = styled.div`color: ${red}`;');

			expect(document).toMatchSnapshot();
		});

		test('property value with symbol right before interpolation', () => {
			let document = parseJs('let Component = styled.div`margin: -${space}`;');

			expect(document).toMatchSnapshot();
		});

		test('property value (with semicolon)', () => {
			let document = parseJs('let Component = styled.div`color: ${red};`;');

			expect(document).toMatchSnapshot();
		});

		test('property value and !important (no semicolon)', () => {
			let document = parseJs('let Component = styled.div`color: ${red} !important`;');

			expect(document).toMatchSnapshot();
		});

		test('property value and !important (with semicolon)', () => {
			let document = parseJs('let Component = styled.div`color: ${red} !important;`;');

			expect(document).toMatchSnapshot();
		});

		test('property value with two interpolations', () => {
			let document = parseJs(
				'let Component = styled.div`box-shadow: ${elevation1}, ${elevation2}`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('property value with props interpolation', () => {
			let document = parseJs(
				'let Component = styled.div`background-image: ${(props) => props.backgroundImage}`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('property value with interpolation inside url function', () => {
			let document = parseJs(
				'let Component = styled.div`background-image: url(${imageUrl})`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('property value with props interpolation inside url function', () => {
			let document = parseJs(
				'let Component = styled.div`background-image: url(${(props) => props.backgroundImage})`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('property name (first property)', () => {
			let document = parseJs('let Component = styled.div`${color}: red`;');

			expect(document).toMatchSnapshot();
		});

		test('property name (second property)', () => {
			let document = parseJs('let Component = styled.div`display: flex; ${color}: red`;');

			expect(document).toMatchSnapshot();
		});
	});

	describe('selectors', () => {
		test('in selector (whole selector)', () => {
			let document = parseJs('let Component = styled.div`${Component} { color: red; }`;');

			expect(document).toMatchSnapshot();
		});

		test('in selector (whole selector starts with a dot)', () => {
			let document = parseJs('let Component = styled.div`.${Component} { color: red; }`;');

			expect(document).toMatchSnapshot();
		});

		test('in selector (first selector is interpolation)', () => {
			let document = parseJs('let Component = styled.div`${Component}, a { color: red; }`;');

			expect(document).toMatchSnapshot();
		});

		test('in selector (second selector is interpolation, two selectors)', () => {
			let document = parseJs('let Component = styled.div`a, ${Component} { color: red; }`;');

			expect(document).toMatchSnapshot();
		});

		test('in selector (second part is interpolation, one selector)', () => {
			let document = parseJs('let Component = styled.div`a ${Component} { color: red; }`;');

			expect(document).toMatchSnapshot();
		});

		test('in selector (first part is interpolation, one selector)', () => {
			let document = parseJs('let Component = styled.div`${Component} a { color: red; }`;');

			expect(document).toMatchSnapshot();
		});

		test('interpolation with semicolon before selector', () => {
			let document = parseJs('let Component = styled.div`${Component}; a { color: red; }`;');

			expect(document).toMatchSnapshot();
		});

		test('interpolation on a new line before selector', () => {
			let document = parseJs('let Component = styled.div`${hello}\n\ta { color: red; }`;');

			expect(document).toMatchSnapshot();
		});

		test('comment in selector with interpolation', () => {
			let document = parseJs(
				'let Component = styled.div`${Card}:hover, /* hello */ b { color: red; }`;',
			);

			expect(document).toMatchSnapshot();
		});
	});

	describe('standalone interpolation', () => {
		test('after declaration (no semicolon, no space after)', () => {
			let document = parseJs('let Component = styled.div`color: red; ${borderWidth}`;');

			expect(document).toMatchSnapshot();
		});

		test('after declaration (no semicolon, space after)', () => {
			let document = parseJs('let Component = styled.div`color: red; ${borderWidth} `;');

			expect(document).toMatchSnapshot();
		});

		test('multiple after declaration (no semicolon, space after)', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${borderWidth} ${hello} `;',
			);

			expect(document).toMatchSnapshot();
		});

		test('after declaration (with semicolon)', () => {
			let document = parseJs('let Component = styled.div`color: red; ${borderWidth};`;');

			expect(document).toMatchSnapshot();
		});

		test('before declaration (no semicolon, no space)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth}color: red`;');

			expect(document).toMatchSnapshot();
		});

		test('before declaration (with space)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth} color: red`;');

			expect(document).toMatchSnapshot();
		});

		test('before declaration (with semicolon)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth};color: red`;');

			expect(document).toMatchSnapshot();
		});

		test('before declaration (with semicolon and space)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth}; color: red`;');

			expect(document).toMatchSnapshot();
		});

		test('between two declarations (no semicolon)', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${borderWidth} border-color: blue;`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('between two declarations (with semicolon)', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${borderWidth}; border-color: blue;`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('as the only content (no semicolon)', () => {
			let document = parseJs('let Component = styled.div`${color}`;');

			expect(document).toMatchSnapshot();
		});

		test('as the only content (with semicolon)', () => {
			let document = parseJs('let Component = styled.div`${color};`;');

			expect(document).toMatchSnapshot();
		});

		test('between three declarations (no semicolon)', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${borderWidth} border-color: blue; ${anotherThing} display: none;`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('between two declarations, and also trailing interpolation', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${ borderWidth} border-color: blue; ${anotherThing}`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('after comment (no semicolon)', () => {
			let document = parseJs('let Component = styled.div`/* hello */ ${borderWidth}`;');

			expect(document).toMatchSnapshot();
		});

		test('after comment (with semicolon)', () => {
			let document = parseJs('let Component = styled.div`/* hello */ ${borderWidth};`;');

			expect(document).toMatchSnapshot();
		});

		test('before comment (no semicolon, no space)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth}/* hello */`;');

			expect(document).toMatchSnapshot();
		});

		test('before comment (no semicolon, with space)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth} /* hello */`;');

			expect(document).toMatchSnapshot();
		});

		test('before comment (with semicolon, no space)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth};/* hello */`;');

			expect(document).toMatchSnapshot();
		});

		test('before comment (with semicolon and space)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth}; /* hello */`;');

			expect(document).toMatchSnapshot();
		});

		test('before at-rule (with semicolon)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth};@media screen {}`;');

			expect(document).toMatchSnapshot();
		});

		test('before at-rule (without semicolon)', () => {
			let document = parseJs('let Component = styled.div`${borderWidth} @media screen {}`;');

			expect(document).toMatchSnapshot();
		});
	});

	describe('multiple standalone interpolations', () => {
		test('after declaration (no semicolon, no space after)', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${borderWidth}${borderWidth}`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('after declaration (no semicolon, space after)', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${borderWidth} ${borderWidth} `;',
			);

			expect(document).toMatchSnapshot();
		});

		test('after declaration (with semicolon)', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${borderWidth} ${borderWidth};`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('before declaration (no semicolon, no space)', () => {
			let document = parseJs(
				'let Component = styled.div`${borderWidth} ${background}color: red`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('before declaration (no semicolon, with space)', () => {
			let document = parseJs(
				'let Component = styled.div`${borderWidth}${background} color: red`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('before declaration (no semicolon, with space, three interpolations)', () => {
			let document = parseJs(
				'let Component = styled.div`${borderWidth}${background}${display} color: red`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('before declaration (with space)', () => {
			let document = parseJs(
				'let Component = styled.div`${borderWidth} ${borderWidth} color: red`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('before declaration (with semicolon)', () => {
			let document = parseJs(
				'let Component = styled.div`${borderWidth}${borderWidth};color: red`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('before declaration (with semicolon and space)', () => {
			let document = parseJs(
				'let Component = styled.div`${borderWidth}${borderWidth}; color: red`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('between two declarations (no semicolon)', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${borderWidth} ${borderWidth} border-color: blue;`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('between two declarations (with semicolon)', () => {
			let document = parseJs(
				'let Component = styled.div`color: red; ${borderWidth} ${borderWidth}; border-color: blue;`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('before comment (no semicolon, with space)', () => {
			let document = parseJs(
				'let Component = styled.div`${borderWidth}${background} /* hello */`;',
			);

			expect(document).toMatchSnapshot();
		});

		test('as the only content (no semicolon)', () => {
			let document = parseJs('let Component = styled.div`${color}${color}`;');

			expect(document).toMatchSnapshot();
		});

		test('as the only content (with semicolon)', () => {
			let document = parseJs('let Component = styled.div`${color}${color};`;');

			expect(document).toMatchSnapshot();
		});
	});
});

describe('interpolations with css helper (one level deep)', () => {
	test('single at the end', () => {
		let document = parseJs('let Component = styled.div`color: green;${css`color: red`}`;');

		expect(document).toMatchSnapshot();
	});

	test('single at the start', () => {
		let document = parseJs('let Component = styled.div`${css`color: red`} color: green;`;');

		expect(document).toMatchSnapshot();
	});

	test('single at the start and at the end', () => {
		let document = parseJs(
			'let Component = styled.div`${css`color: red`} color: green;${css`color: blue`}`;',
		);

		expect(document).toMatchSnapshot();
	});

	test('only two interpolations', () => {
		let document = parseJs(
			'let Component = styled.div`${css`color: red`}${css`color: blue`}`;',
		);

		expect(document).toMatchSnapshot();
	});
});

describe('interpolations with css helper (many levels deep)', () => {
	test('two levels deep at the end', () => {
		let document = parseJs(
			'let Component = styled.div`${css`color: red;${css`color: blue`}`}`;',
		);

		expect(document).toMatchSnapshot();
	});

	test('three levels deep at the end', () => {
		let document = parseJs(
			'let Component = styled.div`${css`color: red;${css`color: blue;${css`color: green;`}`}`}`;',
		);

		expect(document).toMatchSnapshot();
	});

	test('two levels at the beginning', () => {
		let document = parseJs(
			'let Component = styled.div`${css`${css`color: blue`} color: red;`}`;',
		);

		expect(document).toMatchSnapshot();
	});
});

describe('interpolations with props', () => {
	test('props with no styled helpers (at the end)', () => {
		let document = parseJs(
			'let Component = styled.div`color: green;${props => `color: red`}`;',
		);

		expect(document).toMatchSnapshot();
	});

	test('props with css helper (at the end)', () => {
		let document = parseJs(
			'let Component = styled.div`color: green;${props => css`color: red`}`;',
		);

		expect(document).toMatchSnapshot();
	});

	test('props with no styled helpers (at the beginning)', () => {
		let document = parseJs(
			'let Component = styled.div`${props => `color: red`} color: green;`;',
		);

		expect(document).toMatchSnapshot();
	});

	test('props with css helper (at the beginning)', () => {
		let document = parseJs(
			'let Component = styled.div`${props => css`color: red`} color: green;`;',
		);

		expect(document).toMatchSnapshot();
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
		let document = parseJs('let Component = ' + notation + '`color: red;`;');

		expect(document).toMatchSnapshot();
	});
});

describe('do not parse not component notations', () => {
	const notations = [
		'sstyled.foo',
		'styledd(Component)',
		'styledd.foo.attrs({})',
		'sstyled(Component).attrs({})',
		'csss',
		'ccreateGlobalStyle',
	];

	test.each(notations)('%s', (notation) => {
		let document = parseJs('let Component = ' + notation + '`color: red;`;');

		expect(document).toEqual([]);
	});
});

test('supports TypeScript', () => {
	let document = parseJs('let Component = styled.div<{ isDisabled?: boolean; }>`color: red;`;');

	expect(document).toMatchSnapshot();
});

test('component after a component with interpolation', () => {
	let document = parseJs(
		'const Component = styled.div`\n${css`position: sticky;`}\n`;\nconst Trigger = styled.div``;',
	);

	expect(document).toMatchSnapshot();
});

test('does not crash for invalid JavaScript syntax', () => {
	let document = parseJs('const Component = styled.div`position: sticky', { from: 'test.js' });

	expect(document).toMatchSnapshot();
});
