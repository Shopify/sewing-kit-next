const {resolve, basename} = require('path');
const {execSync} = require('child_process');

const {writeFile} = require('fs-extra');
const glob = require('glob');
const esbuild = require('esbuild');
const jsResolve = require('resolve');

const root = resolve(__dirname, '..');
const outFile = resolve(root, '.loom/internal/cli.js');

const CUSTOM_ENTRIES = new Map([['core', ['index', 'config-load']]]);

const NON_RELATIVE_IMPORTS_FILTER_RE = /^[^./]|^\.[^./]|^\.\.[^/]/;
const BUILD_FROM_SOURCE_FILTER_RE = /^@sewing-kit\/(core|cli)/;

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

  // Run esbuild and generate the CLI, which we shall then run
  await esbuild.build({
    entryPoints: [resolve(root, 'packages/cli/src/cli.ts')],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    target: 'node12',
    plugins: [
      // Alias local source folders
      // This can be replaced by specifying a custom condition that points to
      // the source folder in the exports field once we bump our minimum node
      // versions to 12.22.0 / 14.17.0.
      {
        name: 'local-aliases',
        setup(build) {
          build.onResolve({filter: BUILD_FROM_SOURCE_FILTER_RE}, (args) => ({
            path: jsResolve.sync(
              args.path.replace(
                BUILD_FROM_SOURCE_FILTER_RE,
                `${root}/packages/$1/src`,
              ),
              {extensions: ['.ts', '.tsx', '.mjs', '.js', '.json']},
            ),
          }));
        },
      },
      // Treat all non relative imports as exteernal
      {
        name: 'external-node-modules',
        setup(build) {
          // Must not start with "/" or "./" or "../"
          build.onResolve({filter: NON_RELATIVE_IMPORTS_FILTER_RE}, (args) => ({
            path: args.path,
            external: true,
          }));
        },
      },
    ],
  });

  // Execute the generated file.
  // Errors must trigger a non-zero exit code otherwise CI won't mark erroring
  // test/lint runs as failing.
  try {
    execSync(['node', outFile, ...process.argv.slice(2)].join(' '), {
      stdio: 'inherit',
      env: {...process.env, SEWING_KIT_FROM_SOURCE: '1'},
    });
  } catch (error) {
    process.exitCode = 1;
  }
})();
