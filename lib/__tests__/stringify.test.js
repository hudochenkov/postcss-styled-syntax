let stringify = require('../stringify');
let parse = require('../parse');

let tests = [
	'let Component = styled.div`color: red;`;',
	'let Component = styled.div`color: red;`;\nlet Component = styled.div`border-color: blue`;',
	'let Component = styled.div``;',
	'let Component = styled.div`\n\tcolor: red;\n`;',
	'let Component = styled.div` \n\tcolor: red;\n`;',
	'let Component = styled.div`color: ${red}`;',
	'let Component = styled.div`color: ${red};`;',
	'let Component = styled.div`color: ${red} !important`;',
	'let Component = styled.div`color: ${red} !important;`;',
	'let Component = styled.div`box-shadow: ${elevation1}, ${elevation2}`;',
	'let Component = styled.div`${color}: red`;',
	'let Component = styled.div`display: flex; ${color}: red`;',
	'let Component = styled.div`${Component} { color: red; }`;',
	'let Component = styled.div`${Component}, a { color: red; }`;',
	'let Component = styled.div`a, ${Component} { color: red; }`;',
	'let Component = styled.div`a ${Component} { color: red; }`;',
	'let Component = styled.div`${Component} a { color: red; }`;',
	'let Component = styled.div`${Component}; a { color: red; }`;',
	'let Component = styled.div`color: red; ${borderWidth}`;',
	'let Component = styled.div`color: red; ${borderWidth} `;',
	'let Component = styled.div`color: red; ${borderWidth} ${hello} `;',
	'let Component = styled.div`color: red; ${borderWidth};`;',
	'let Component = styled.div`${borderWidth}color: red`;',
	'let Component = styled.div`${borderWidth} color: red`;',
	'let Component = styled.div`${borderWidth};color: red`;',
	'let Component = styled.div`${borderWidth}; color: red`;',
	'let Component = styled.div`color: red; ${borderWidth} border-color: blue;`;',
	'let Component = styled.div`color: red; ${borderWidth}; border-color: blue;`;',
	'let Component = styled.div`${color}`;',
	'let Component = styled.div`${color};`;',
	'let Component = styled.div`color: red; ${borderWidth} border-color: blue; ${anotherThing} display: none;`;',
	'let Component = styled.div`color: red; ${ borderWidth} border-color: blue; ${anotherThing}`;',
	'let Component = styled.div`color: red; ${borderWidth}${borderWidth}`;',
	'let Component = styled.div`color: red; ${borderWidth} ${borderWidth} `;',
	'let Component = styled.div`color: red; ${borderWidth};`;',
	'let Component = styled.div`${borderWidth}${borderWidth}color: red`;',
	'let Component = styled.div`${borderWidth} ${borderWidth} color: red`;',
	'let Component = styled.div`${borderWidth}${borderWidth};color: red`;',
	'let Component = styled.div`${borderWidth}${borderWidth}; color: red`;',
	'let Component = styled.div`color: red; ${borderWidth} ${borderWidth} border-color: blue;`;',
	'let Component = styled.div`color: red; ${borderWidth} ${borderWidth}; border-color: blue;`;',
	'let Component = styled.div`${color}`;',
	'let Component = styled.div`${color}${color};`;',
	'let Component = styled.div`div{${Component} { color: red; }}`;',
	'let Component = styled.div`div{ ${Component} a { color: red; } }`;',
	'let Component = styled.div`div {${Component}; a { color: red; }}`;',
	'let Component = styled.div`div{color: red; ${borderWidth} }`;',
	'let Component = styled.div`div{color: red; ${borderWidth};}`;',
	'let Component = styled.div`div{${color}}`;',
	'let Component = styled.div`div{${color};}`;',
	'let Component = styled.div`color: green;${css`color: red`}`;',
	'let Component = styled.div`${css`color: red`} color: green;`;',
	'let Component = styled.div`${css`color: red`} color: green;${css`color: blue`}`;',
	'let Component = styled.div`${css`color: red`}${css`color: blue`}`;',
	'let Component = styled.div`${css`color: red;${css`color: blue`}`}`;',
	'let Component = styled.div`${css`color: red;${css`color: blue;${css`color: green;`}`}`}`;',
	'let Component = styled.div`${css`${css`color: blue`} color: red;`}`;',
	'let Component = styled.div`color: green;${props => `color: red`}`;',
	'let Component = styled.div`color: green;${props => css`color: red`}`;',
	'let Component = styled.div`${props => `color: red`} color: green;`;',
	'let Component = styled.div`${props => css`color: red`} color: green;`;',
	'let Component = styled.div<{ isDisabled?: boolean; }>`color: red;`;',
	'let Component = "";',
	'const StyledHeader = styled.thead`\n${css`position: sticky;`}\n`;\nconst Trigger = styled.div``;',
	'let Component = styled.div`a,\n\tb { color: red; }`;',
	'let Component = styled.div`${hello}\n\ta { color: red; }`;',
	'let Component = styled.div`position: sticky',
	'let Component = styled.div(props => `position: sticky;`)',
	'let Component = styled.div(props => `position: ${pos};`)',
];

/**
 * @param {string} css
 */
function run(css) {
	let root = parse(css);
	let output = '';

	stringify(root, (i) => {
		output += i;
	});

	expect(output).toBe(css);
}

test.each(tests)('%s', (componentCode) => {
	run(componentCode);
});

test('stringify should not mutate AST', () => {
	let document = parse('let Component = styled.div`color: red; ${css`padding: 0;`}`;');

	expect(document.nodes).toHaveLength(2);

	stringify(document, () => {});

	expect(document.nodes).toHaveLength(2);
});
