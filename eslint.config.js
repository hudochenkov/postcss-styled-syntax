import { configs } from 'eslint-config-hudochenkov';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
	...configs.main,
	eslintConfigPrettier,
	{
		languageOptions: {
			globals: {
				...Object.fromEntries(Object.entries(globals.browser).map(([key]) => [key, 'off'])),
				...globals.node,
				...globals.jest,
				groupTest: true,
				runTest: true,
			},
		},
		rules: {
			'unicorn/prefer-at': 0,
			'no-template-curly-in-string': 0,
		},
	},
];
