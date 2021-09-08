# `@sewing-kit/plugin-package-build`

Exposes a build step for generating package output, in commonjs, esmodules, and esnext formats. This is the build configuration used to build sewing-kit-next itself and provides a solid base for creating JS-only packages.

## Installation

```sh
$ yarn add @sewing-kit/plugin-package-build --dev
```

## Usage

Add `packageBuild` to your sewing-kit plugins.

```js
import {createPackage, Runtime} from '@sewing-kit/core';
import {babel} from '@sewing-kit/plugin-babel';
import {packageBuild} from '@sewing-kit/plugin-package-build';
export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.entry({root: './src/index'});
  pkg.entry({root: './src/second-entry', name: 'second-entry'});
  pkg.use(
    babel(),
    packageBuild({
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Browser`
      browserTargets: 'defaults',
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Node`
      nodeTargets: 'node 12.20',
      // Optional. Defaults to true. Defines if commonjs outputs should be generated.
      commonjs: true,
      // Optional. Defaults to true. Defines if esmodules outputs should be generated.
      esmodules: true,
      // Optional. Defaults to true. Defines if esnext outputs should be generated.
      esnext: true,
      // Optional. Defaults to true. Defines if entrypoints should be written at
      // the root of the repository. You can disable this if you have a single
      // entrypoint or if your package uses the `exports` key in package.json
      rootEntrypoints: true,
    }),
  );
});
```

### Targets

The `browserTargets` and `nodeTargets` options are [browserslist](https://github.com/browserslist/browserslist) strings that control the level of transpilation that is required based on the runtime you configure.

- `pkg.runtime(Runtime.Node)` for a node-only package, transpilation shall use `nodeTargets`.
- `pkg.runtime(Runtime.Browser)` for a browser-only, package transpilation shall use `browserTargets`.
- `pkg.runtimes(Runtimes.Node, Runtime.Browser)` for an isomorphic package that runs on node and in the browser, transpilation shall combine `nodeTargets` and `browserTargets`.

Using `browserTargets: 'defaults',` and `nodeTargets: 'maintained node versions'` are moving targets that depend data in the `caniuse-lite` package. You can see what environments these values correspond to by running e.g. `npx browserslist 'defaults'`. If you find these values unclear or are concerned that changes to them may be non-obvious, you can use explicit version numbers instead.

### Entrypoints

By default, entrypoint files are written to the root of your package that correspond the package's `entry`s defined in its config file. This is to support packages with multiple entrypoints in a world where package.json's [`exports`](https://nodejs.org/api/packages.html#packages_package_entry_points) support is not pervasive as Webpack 4, TypeScript and Jest support is currently absent at time of writing (September 2020).

### Single entrypoint

When creating a package with a single entrypoint, you can set `rootEntrypoints: true` to not write any root entrypoints, and point fields in your package.json to the contents of the build folder.

Given a `sewing-kit.config.js` file that contains:

```js
export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.entry({root: './src/index'});
  packageBuild({
    browserTargets: 'defaults',
    nodeTargets: 'node 12.20',
    rootEntrypoints: false,
  });
});
```

In the `package.json` add the following `main` (for commonjs output), `module` (for esmodules output), `esnext` (for esnext output) and `types`(for TypeScript types) keys. You can omit a given key if you are not generating a particular output type.

```json
{
  "main": "build/cjs/index.js" /* commonjs output */,
  "module": "build/esm/index.mjs" /* esmodules output */,
  "esnext": "build/esnext/index.esnext" /* esnext output */,
  "types": "build/ts/index.d.ts" /* typescript output - this path depends upon your tsconfig.json */
}
```

### Multiple entrypoints

If you have multiple entrypoints then you should leave `rootEntrypoints: true` to generate entrypoints at the root. This is a slightly flawed approach as only commonjs content for the additional entrypoints is supported, but is the best that we can do give current support.

Given a `sewing-kit.config.js` file that contains:

```js
export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.entry({root: './src/index'});
  pkg.entry({root: './src/second-entry', name: 'second-entry'});
  packageBuild({
    browserTargets: 'defaults',
    nodeTargets: 'node 12.20',
    rootEntrypoints: true,
  });
});
```

Then this shall write sets of outputs for each entrypoint at the root of your package:

- `index.js` that reexports content from `build/cjs/index.js`
- `index.mjs` that reexports content from `build/esm/index.mjs`
- `index.esnext` that reexports content from `build/esnext/index.esnext`
- `second-entry.js` that reexports content from `build/cjs/second-entry.js`
- `second-entry.mjs` that reexports content from `build/esm/second-entry.mjs`
- `second-entry.esnext` that reexports content from `build/esnext/second-entry.esnext`

In the `package.json` add the following `main` (for commonjs output), `module` (for esmodules output), `esnext` (for esnext output) and `types`(for TypeScript types) keys. You can omit a given key if you are not generating a particular output type.

```json
{
  "main": "index.js" /* commonjs output */,
  "module": "index.mjs" /* esmodules output */,
  "esnext": "index.esnext" /* esnext output */,
  "types": "build/ts/index.d.ts" /* typescript output - this path depends upon your tsconfig.json */,
  "typesVersions": {
    "*": {
      /* typescript types for the second-entry entrypoint */
      "second-entry": ["./build/ts/second-entry.d.ts"]
    }
  }
}
```

If a consuming app imports `your-package/second-entry` then it shall load `second-entry.js` from the root of your package.
