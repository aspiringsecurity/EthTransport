module.exports = {
  parser: '@typescript-eslint/parser',
  env: {
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint', 'unused-imports', 'simple-import-sort', 'prettier', 'unicorn'],
  extends: ['next', 'next/core-web-vitals'],
  rules: {
    curly: 'error',
    'no-unused-vars': 'off',
    'prettier/prettier': 'error',
    'import/no-duplicates': ['error', { considerQueryString: true }],
    'react/prop-types': 'off',
    'react/no-unescaped-entities': 'off',
    'react/no-unknown-property': 'off',
    'react/jsx-no-useless-fragment': 'error',
    'react/self-closing-comp': 'error',
    'unused-imports/no-unused-imports': 'error',
    '@next/next/no-html-link-for-pages': 'off',
    '@next/next/no-img-element': 'off',
    'prefer-destructuring': ['error', { VariableDeclarator: { object: true } }],
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off', // turn warn
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/consistent-type-imports': 'error',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'jsx-a11y/role-supports-aria-props': 'off',
    'no-use-before-define': 'error',
    'no-unexpected-multiline': 'error',
    'unicorn/better-regex': 'error',
    'unicorn/catch-error-name': 'error',
    'unicorn/no-array-for-each': 'error',
    'unicorn/no-for-loop': 'error',
    'unicorn/no-lonely-if': 'error',
    'unicorn/no-useless-undefined': 'error',
    'unicorn/prefer-array-find': 'error'
  }
};
