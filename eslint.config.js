/**
 * @module eslint.config
 * Lint rules for the whole repo (ADR 0004).
 *
 * Besides the usual TypeScript and Svelte checks, lint enforces two project rules:
 * - every exported function, class and module has a docstring and full types (CLAUDE.md);
 * - identifiers say "color", never "colour" (D-035). Comments and language files can say "colour".
 */
import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import svelteConfig from './apps/web/svelte.config.js';

export default tseslint.config(
  {
    ignores: [
      '**/dist/',
      '**/coverage/',
      'playwright-report/',
      'test-results/',
      // Research evidence is kept as it was produced (ADR 0003).
      'docs/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // D-035: "color" in code. The pattern rejects any identifier containing "colour".
      'id-match': [
        'error',
        '^(?![\\s\\S]*[Cc]olour)[\\s\\S]*$',
        {
          properties: true,
          classFields: true,
          onlyDeclarations: false,
          ignoreDestructuring: false,
        },
      ],
    },
  },
  {
    files: ['**/*.svelte', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.svelte'],
        svelteConfig,
      },
    },
    rules: {
      // Repeats the compiler's warnings, including accessibility, as lint errors (ADR 0003).
      'svelte/valid-compile': 'error',
    },
  },
  {
    // Source modules: docstrings on every module and export, and explicit types at the boundary.
    files: ['packages/*/src/**/*.ts', 'apps/web/src/**/*.ts', 'scripts/**/*.ts'],
    ignores: ['**/*.test.ts'],
    plugins: { jsdoc },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      'jsdoc/require-file-overview': [
        'error',
        {
          tags: {
            file: { mustExist: false },
            module: { mustExist: true, preventDuplicates: true, initialCommentsOnly: true },
          },
        },
      ],
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            ClassDeclaration: true,
            MethodDefinition: true,
            ArrowFunctionExpression: true,
            FunctionExpression: true,
          },
          contexts: [
            'TSInterfaceDeclaration',
            'TSTypeAliasDeclaration',
            'ExportNamedDeclaration > VariableDeclaration',
          ],
        },
      ],
      'jsdoc/require-description': 'error',
      'jsdoc/require-param': 'error',
      'jsdoc/require-param-description': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-returns-description': 'error',
      'jsdoc/require-throws': 'error',
      'jsdoc/check-param-names': 'error',
      'jsdoc/check-tag-names': 'error',
      // Types come from TypeScript, not from JSDoc.
      'jsdoc/no-types': 'error',
    },
  },
);
