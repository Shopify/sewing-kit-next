// This file is only here so that, when we run babel-node to run the source
// version of sewing-kit against itself, it has a set of transforms that will
// actually result in valid code for Node to run.
module.exports = {
  plugins: [
    '@babel/plugin-proposal-numeric-separator',
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-class-properties',
  ],
  targets: 'current node',
  presets: [
    ['@babel/preset-env', {modules: 'commonjs'}],
    '@babel/preset-typescript',
  ],
};
