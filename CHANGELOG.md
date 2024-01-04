# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](https://semver.org/).

## 0.6.4
* Fixed parsing for CSS with escaped characters

## 0.6.3
* Fixed interpolation range if comment after interpolation has a backslash

## 0.6.2
* Fixed a JS parsing issue if a comment between a tag function and template literal is present

## 0.6.1
* Fixed interpolation ranges if there is a comment inside an interpolation
* Catch more JavaScript parsing errors

## 0.6.0
* Use TypeScript instead of @typescript-eslint/typescript-estree for parsing. This fixes “unsupported TypeScript version” messages and reduces install size.
* Fixed parsing for two interpolations before rule selector. Fixes #24
* Dropped support for Node.js 14 and 16

## 0.5.0
* Moved `typescript` from `peerDependencies` to `dependencies`. This should also remove “unsupported TypeScript version” messages. Your project doesn't need to be a TypeScript project. `typescript` package is used as a parser for JavaScript and TypeScript files.

## 0.4.0
* Added `raws.isRuleLike` to all Roots. Enable PostCSS and Stylelint to adjust to CSS-in-JS quirks. E. g. if something processes only rules, it could also process `root` if this flag is present

## 0.3.3
* Fixed: Catch JavaScript parsing errors

## 0.3.2
* Fixed stringifier mutating AST

## 0.3.1
* Fixed regression for comments inside a selector

## 0.3.0
* Interpolation on a separate line before `Rule` now added to `rule.raws.before` instead of being part of a selector
* Fixed at-rule with interpolation before it parsed as a rule
* Fixed parsing error for interpolations before a comment
* Fixed parsing error for multiple interpolations before declaration, while they have no spacing between them

## 0.2.0
* Add Node.js 14 support.

## 0.1.0
* Initial release.
