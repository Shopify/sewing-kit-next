const {resolve, basename} = require('path');
const {execSync} = require('child_process');

const {writeFile} = require('fs-extra');
const glob = require('glob');
const {rollup} = require('rollup');
const commonjs = require('@rollup/plugin-commonjs');
const alias = require('@rollup/plugin-alias');
const nodeResolve = require('@rollup/plugin-node-resolve').default;
const esbuild = require('rollup-plugin-esbuild');
const nodeExternals = require('rollup-plugin-node-externals');

const root = resolve(__dirname, '..');
const outFile = resolve(root, '.sewing-kit/internal/cli.js');

const CUSTOM_ENTRIES = new Map([['core', ['index', 'config-load']]]);

(async () => {
  // Replace entrypoints with custom file that points to the src folder
  // This is needed as the call to babel/register within the config-load can't
  // handle aliasing these packages to read from source files
  await Promise.all(
    glob.sync('packages/*/').map((pkg) => {
      return (CUSTOM_ENTRIES.get(basename(pkg)) || ['index']).map((entry) => {
        return writeFile(
          resolve(pkg, `${entry}.js`),
          `module.exports = require("./src/${entry}");\n`,
        );
      });
    }),
  );

  // Run rollup and output a version of the CLI
  await rollup({
    input: resolve(root, 'packages/cli/src/cli.ts'),
    external: [/node_modules/],
    plugins: [
      alias({
        entries: [
          {
            find: /^@sewing-kit\/(core|cli)/,
            replacement: resolve(`${root}/packages/$1/src`),
          },
        ],
      }),
      nodeResolve({extensions: ['.ts', '.tsx', '.mjs', '.js', '.json']}),
      nodeExternals(),
      commonjs(),
      esbuild({
        target: 'node12',
      }),
    ],
  }).then((bundle) => {
    return bundle.write({
      file: outFile,
      format: 'cjs',
      inlineDynamicImports: true,
    });
  });

  // Execute the generated file
  execSync(['node', outFile, ...process.argv.slice(2)].join(' '), {
    stdio: 'inherit',
    env: {...process.env, SEWING_KIT_FROM_SOURCE: '1'},
  });
})();
