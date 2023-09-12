# postcss-styled-syntax

PostCSS syntax for template literals CSS-in-JS (e. g. styled-components, Emotion). It was built to be used as [Stylelint] custom syntax or with [PostCSS] plugins.

Syntax supports:

- Full spectrum of styled-components syntax
- Deeply nested interpolations
- Interpolations in selectors, property names, and values
- JavaScript and TypeScript (including files with JSX)
- All functions:
	- `styled.foo`
	- `styled(Component)`
	- `styled.foo.attrs({})`
	- `styled(Component).attrs({})`
	- `css`
	- `createGlobalStyle`

```js
let Component = styled.p`
	color: #bada55;
`;
```

## Install

```
npm install --save-dev postcss-styled-syntax
```

## Usage

### Stylelint

Install syntax and add to a Stylelint config:

```json
{
	"customSyntax": "postcss-styled-syntax"
}
```

Stylelint [custom syntax documentation](https://stylelint.io/user-guide/usage/options#customsyntax).

### PostCSS

Install syntax and add to a PostCSS config:

```js
module.exports = {
	syntax: 'postcss-styled-syntax',
	plugins: [ /* ... */ ],
};
```

An example assumes using [PostCSS CLI](https://github.com/postcss/postcss-cli) or another PostCSS runner with config support.

## How it works

### Parsing

Syntax parser JavaScript/TypeScript code and find all supported components and functions (e.g., <code>css\`\`</code>). Then, it goes over them and builds a PostCSS AST, where all found components become `Root` nodes inside the `Document` node.

All interpolations within the found component CSS end up in the AST. E. g. for a declaration `color: ${brand}` `Decl` node will look like this:

```js
Decl {
	prop: 'color',
	value: '${brand}',
}
```

When interpolation is not part of any node, it goes to the next node's `raws.before`. For example, for the following code:

```js
let Component = styled.p`
	${textStyles}

	color: red;
`;
```

AST will look like:

```js
Decl {
	prop: 'color',
	value: 'red',
	raws: {
		before: '\n\t${textStyles}\n\n\t',
		// ...
	}
}
```

If there is no next node after interpolation, it will go to parents `raws.after`. For example, for the following code:

```js
let Component = styled.p`
	color: red;

	${textStyles}
`;
```

AST will look like:

```js
Root {
	nodes: [
		Decl {
			prop: 'color',
			value: 'red',
		},
	],
	raws: {
		after: '\n\n\t${textStyles}\n'
		// ...
	},
}
```

### Stringifying

Mostly, it works just as the default PostCSS stringifyer. The main difference is the `css` helper in interpolations within a styled component code. E. g. situations like this:

```js
let Component = styled.p`
	${(props) =>
		props.isPrimary
			? css`
					background: green;
			  `
			: css`
					border: 1px solid blue;
			  `}

	color: red;
`;
```

`css` helper inside an interpolation within `Component` code.

During parsing, the whole interpolation (`${(props) ... }`) is added as `raws.before` to `color: red` node. And it should not be modified. Each `css` helper remembers their original content (as a string).

When stringifyer reaches a node's `raws.before`, it checks if it has interpolations with `css` helpers. If yes, it searches for the original content of `css` helper and replaces it with a stringified `css` helper. This way, changes to the AST of the `css` helper will be stringified.

## Known issues

- Double-slash comments (`//`) will result in a parsing error. Use standard CSS comments instead (`/* */`). It is definitely possible to add support for double-slash comments, but let's use standard CSS as much as possible

- Source maps won't work or cannot be trusted. I did not disable them on purpose. But did not test them at all. Because of the way we need to handle `css` helpers within a styled component, `source.end` positions on a node might change if `css` AST changes. See the “How it works” section on stringifying for more info.

## Acknowledgements

[PostCSS] for tokenizer, parser, stringifier, and tests for them.

[Prettier](https://prettier.io/) for styled-components detection function in an ESTree AST.

[Stylelint]: https://stylelint.io/
[PostCSS]: https://postcss.org/
