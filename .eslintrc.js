module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    project: './tsconfig.json'
  },
  env: {
    browser: true,
    es2020: true,
    jest: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended'
  ],
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    'no-undef': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    'react/no-unknown-property': ['error', { ignore: ['stroke-width'] }],
    'react-hooks/exhaustive-deps': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'prefer-const': 'error',
    '@typescript-eslint/no-var-requires': 'off',
    'react/no-unescaped-entities': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};