const {resolve: resolvePath} = require('path');

const cpy = require('cpy');
const {exit} = require('yargs');

const root = resolvePath(__dirname, '..');

(() => {
  Promise.all(
    ['cjs', 'esm', 'esnext'].map((target) =>
      cpy(['**/*.json'], `../build/${target}/`, {
        cwd: resolvePath(root, 'src'),
        overwrite: true,
        parents: true,
      }),
    ),
  ).catch((error) => exit(1, error));
})();
