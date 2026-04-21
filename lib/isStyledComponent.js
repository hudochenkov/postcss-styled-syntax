/**
 * Checks whether it is a styled component or css`` interpolation
 *
 * @param {any} node
 * @return {boolean}
 */
module.exports.isStyledComponent = function isStyledComponent(node) {
	if (node.type === 'TaggedTemplateExpression') {
		// styled.foo``
		if (node.tag.type === 'MemberExpression' && !node.tag.computed) {
			return isStyledIdentifier(node.tag.object);
		}

		if (node.tag.type === 'CallExpression') {
			// styled(Component)``
			if (isStyledIdentifier(node.tag.callee)) {
				return true;
			}

			// styled.foo.attrs({})``
			if (
				node.tag.callee.type === 'MemberExpression' &&
				!node.tag.callee.computed &&
				node.tag.callee.object.type === 'MemberExpression' &&
				!node.tag.callee.object.computed &&
				isStyledIdentifier(node.tag.callee.object.object)
			) {
				return true;
			}

			// styled(Component).attrs({})``
			if (
				node.tag.callee.type === 'MemberExpression' &&
				!node.tag.callee.computed &&
				node.tag.callee.object.type === 'CallExpression' &&
				isStyledIdentifier(node.tag.callee.object.callee)
			) {
				return true;
			}

			return false;
		}

		// css`` or createGlobalStyle``
		if (node.tag.type === 'Identifier') {
			return node.tag.name === 'css' || node.tag.name === 'createGlobalStyle';
		}
	}

	// styled.foo(props => ``)
	if (
		node.type === 'CallExpression' &&
		node.callee.type === 'MemberExpression' &&
		!node.callee.computed &&
		isStyledIdentifier(node.callee.object) &&
		node.arguments[0]?.type === 'ArrowFunctionExpression' &&
		isTemplateLiteral(node.arguments[0].body)
	) {
		return true;
	}

	// styled(Component)(props => ``)
	if (
		node.type === 'CallExpression' &&
		node.callee.type === 'CallExpression' &&
		isStyledIdentifier(node.callee.callee) &&
		node.arguments[0]?.type === 'ArrowFunctionExpression' &&
		isTemplateLiteral(node.arguments[0].body)
	) {
		return true;
	}

	return false;
};

/**
 * @param {any} expression
 * @return {boolean}
 */
function isStyledIdentifier(expression) {
	return expression.type === 'Identifier' && expression.name === 'styled';
}

/**
 * @param {any} node
 * @return {boolean}
 */
function isTemplateLiteral(node) {
	return node.type === 'TemplateLiteral';
}
