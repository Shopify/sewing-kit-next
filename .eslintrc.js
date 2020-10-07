module.exports = {
  extends: [
    'plugin:@sewing-kit/typescript',
    'plugin:@sewing-kit/node',
    'plugin:@sewing-kit/prettier',
  ],
  rules: {
    // Leaving TODOs for the time being
    'no-warning-comments': 'off',
    // A bunch of tools do wonky stuff with Node
    'node/global-require': 'off',
  },
  overrides: [
    {
      files: ['*.test.ts', '*.test.tsx', './tests/**/*'],
      extends: ['plugin:@sewing-kit/jest'],
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
