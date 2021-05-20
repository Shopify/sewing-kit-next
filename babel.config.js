// This file is only here so that, when we run babel-node to run the source
// version of sewing-kit against itself, it has a set of transforms that will
// actually result in valid code for Node to run.
module.exports = {
  targets: 'current node',
  presets: [
    ['@babel/preset-env', {modules: 'commonjs'}],
    '@babel/preset-typescript',
  ],
};
