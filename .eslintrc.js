module.exports = {
  extends: [
    'plugin:@shopify/typescript',
    'plugin:@shopify/node',
    'plugin:@shopify/prettier',
  ],
  rules: {
    // Leaving TODOs for the time being
    'no-warning-comments': 'off',
    // A bunch of tools do wonky stuff with Node
    'node/global-require': 'off',
    // this rule doesn't play well with the hooks api currently
    'babel/no-unused-expressions': 'off',
    'no-restricted-syntax': [
      'error',
      {
        selector:
          'ImportDeclaration[specifiers.length=0][importKind=value][source.value!=/core-js.*/]',
        message: "Use 'import type' for empty imports",
      },
    ],
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', './tests/**/*'],
      extends: ['plugin:@shopify/jest'],
      rules: {
        // this rule doesn't work well with itContains when it's a straight up boolean
        'jest/no-truthy-falsy': 'off',
      },
    },
    {
      files: [
        'sewing-kit.config.ts',
        'config/sewing-kit/**/*',
        'templates/**/*.ts',
      ],
      rules: {
        'import/no-extraneous-dependencies': 'off',
      },
    },
  ],
};
