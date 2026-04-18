// eslint.config.mjs
import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import importPlugin from 'eslint-plugin-import'

const base = {
  'no-undef': 'off',
  'semi': ['error', 'never'],
  'no-use-before-define': 'off',
  'no-unused-vars': 'warn',
  'comma-dangle': ['error', 'always-multiline'],
  'jsx-quotes': ['error', 'prefer-double'],
  'no-useless-return': 'off',
  'no-redeclare': 'error',
  'no-trailing-spaces': 2,
  'quotes': ['error', 'single'],
  'eol-last': 'error',
  'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
  'newline-before-return': 'error',
  'newline-after-var': ['error', 'always'],
  'keyword-spacing': ['error', { before: true }],
  'space-before-blocks': 'error',
  'space-infix-ops': 'error',
  'space-unary-ops': 'error',
  'brace-style': 'error',
  'curly': 'off',
  'eqeqeq': ['error', 'always', { null: 'ignore' }],
  'react-hooks/exhaustive-deps': 'off',
  'block-spacing': 'error',
  'object-curly-spacing': [1, 'always'],
  'indent': [1, 2, {
    SwitchCase: 1,
  }],
}

const typescript = {
  '@typescript-eslint/explicit-module-boundary-types': 'off',
  '@typescript-eslint/no-namespace': 'off',
  '@typescript-eslint/ban-ts-comment': 'off',
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-var-requires': 'off',
  '@typescript-eslint/no-unused-vars': 'warn',
  '@typescript-eslint/no-require-imports': 'off',
  '@typescript-eslint/no-redeclare': ['warn'],
}

const imports = {
  'import/order': [
    'error',
    {
      groups: ['builtin', 'external', 'internal', 'parent', 'index', 'sibling', 'object', 'type'],
      'newlines-between': 'always',
      pathGroups: [
        {
          pattern: 'react**',
          group: 'external',
          position: 'before',
        },
        {
          pattern: '@/**',
          group: 'internal',
        },
        {
          pattern: '@**/**',
          group: 'external',
        },
      ],
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
      pathGroupsExcludedImportTypes: ['react'],
    },
  ],
}

const react = {
  'react/no-array-index-key': 'off',
  'react/self-closing-comp': 'error',
  'react/react-in-jsx-scope': 'off',
  'react/prop-types': 'off',
  'react/display-name': 'off',
  'react/jsx-closing-bracket-location': 1,
  'react/jsx-curly-newline': 1,
  'react/jsx-indent': ['error', 2, {
    indentLogicalExpressions: true,
  }],
  'react/jsx-indent-props': ['warn', 2],
  'react/jsx-wrap-multilines': ['warn', {
    arrow: 'parens-new-line',
    condition: 'parens-new-line',
    logical: 'parens-new-line',
    prop: 'parens-new-line',
  }],
  'react/jsx-curly-spacing': [1, {
    when: 'never',
    children: {
      when: 'never',
    },
  }],
}

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      ...base,
      ...typescript,
      ...react,
      ...imports,
    },
  },

  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
