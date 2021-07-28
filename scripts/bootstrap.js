// We want sewing-kit to be able to build itself. Unfortunately, when cloning
// this repo for the first time, there are some problems with doing so. First
// and foremost is the problem that, even if we use babel-node to run the CLI
// from /packages/cli/src, that command will attempt to read the various
// sewing-kit.config.ts files, which generally import from /packages/config,
// which doesn't exist yet. Classic chicken and egg problem!
//
// To address this case, we write a tiny index file at the root of each package
// that points to the source, rather than the compiled output. Since we run with
// babel-node, this entry will be enough to make everything resolve properly. This
// is basically the same way we build type definitions for packages in `sewing-kit build`,
// but outside of sewing-kit.

const {resolve, basename} = require('path');

const {writeFile, removeSync} = require('fs-extra');
const glob = require('glob');

for (const file of glob.sync('packages/*/*.{js,mjs,node,esnext,ts}', {
  ignore: '**/sewing-kit.config.*',
})) {
  removeSync(file);
}

const CUSTOM_ENTRIES = new Map([['core', ['index', 'config-load']]]);

const jsExport = (name = 'index') =>
  `module.exports = require("./src/${name}");`;

(async () => {
  await Promise.all(
    glob.sync('packages/*/').map((pkg) => {
      return (CUSTOM_ENTRIES.get(basename(pkg)) || ['index']).map((entry) => {
        return writeFile(resolve(pkg, `${entry}.js`), jsExport(entry));
      });
    }),
  );
})();
