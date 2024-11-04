let ts = require('typescript');

/**
 * Checkes where it is a styled component or css`` interpolation
 *
 * @param {ts.Node} node
 * @return {boolean}
 */
module.exports.isStyledComponent = function isStyledComponent(node) {
	if (ts.isTaggedTemplateExpression(node)) {
		// styled.foo``
		if (ts.isPropertyAccessExpression(node.tag)) {
			return isStyledIdentifier(node.tag.expression);
		}

		if (ts.isCallExpression(node.tag)) {
			// styled(Component)``
			if (isStyledIdentifier(node.tag.expression)) {
				return true;
			}

			// styled.foo.attrs({})``
			if (
				ts.isPropertyAccessExpression(node.tag.expression) &&
				ts.isPropertyAccessExpression(node.tag.expression.expression) &&
				isStyledIdentifier(node.tag.expression.expression.expression)
			) {
				return true;
			}

			// styled(Component).attrs({})``
			if (
				ts.isPropertyAccessExpression(node.tag.expression) &&
				ts.isCallExpression(node.tag.expression.expression) &&
				isStyledIdentifier(node.tag.expression.expression.expression)
			) {
				return true;
			}

			return false;
		}

		// css`` or createGlobalStyle``
		if (ts.isIdentifier(node.tag)) {
			return node.tag.text === 'css' || node.tag.text === 'createGlobalStyle';
		}
	}

	// styled.foo(props => ``)
	if (
		ts.isCallExpression(node) &&
		ts.isPropertyAccessExpression(node.expression) &&
		isStyledIdentifier(node.expression.expression) &&
		ts.isArrowFunction(node.arguments[0]) &&
		(ts.isNoSubstitutionTemplateLiteral(node.arguments[0].body) ||
			ts.isTemplateExpression(node.arguments[0].body))
	) {
		return true;
	}

	// styled(Component)(props => ``)
	if (
		ts.isCallExpression(node) &&
		ts.isCallExpression(node.expression) &&
		isStyledIdentifier(node.expression.expression) &&
		ts.isArrowFunction(node.arguments[0]) &&
		(ts.isNoSubstitutionTemplateLiteral(node.arguments[0].body) ||
			ts.isTemplateExpression(node.arguments[0].body))
	) {
		return true;
	}

	return false;
};

/**
 * @param {ts.LeftHandSideExpression} expression
 * @return {boolean}
 */
function isStyledIdentifier(expression) {
	return ts.isIdentifier(expression) && expression.text === 'styled';
}
