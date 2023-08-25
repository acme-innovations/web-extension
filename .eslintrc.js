module.exports = {
  extends: ['plugin:react/recommended', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'],
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  env: {
    browser: true,
    commonjs: true,
    node: true,
    es2020: true,
    'jest/globals': true,
  },
  plugins: ['react', 'jsx-a11y', 'import', 'jest'],
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
};
