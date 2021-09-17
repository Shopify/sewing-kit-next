# `@shopify/loom-plugin-build-library`

This package is your entrypoint into building libraries with loom. It configures a core series of tools for building libraries:

- Rollup for bundling
- Babel for single file transforms
- Jest for testing
- Typescript for type checking

Ite exposes two plugins - `buildLibrary` and `buildLibraryWorkspace` that should be added to your loom plugins.

## Installation

```sh
$ yarn add @shopify/loom-plugin-build-library --dev
```

## Usage

Add `buildLibrary` and `buildLibraryWorkspace` to your loom plugins.

```js
import {createPackage, Runtime} from '@shopify/loom';
import {
  buildLibrary,
  buildLibraryWorkspace,
} from '@shopify/loom-plugin-build-library';

export default createPackage((pkg) => {
  pkg.runtimes(Runtime.Node, Runtime.Browser);
  pkg.entry({root: './src/index'});
  pkg.use(
    buildLibrary({
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
      // Optional. Defaults to false. Defines if graphql files should be processed.
      graphql: false,
      // Optional. Defaults to 'node'. Defines if the jest environment should be 'node' or 'jsdom'.
      jestEnvironment: 'node',
    }),
    buildLibraryWorkspace({
      // Optional. Defaults to false. Defines if d.ts files should be generated for graphql files.
      graphql: false,
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

Given a `loom.config.js` file that contains:

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

```js
{
  "main": "build/cjs/index.js" /* commonjs output */,
  "module": "build/esm/index.mjs" /* esmodules output */,
  "esnext": "build/esnext/index.esnext" /* esnext output */,
  "types": "build/ts/index.d.ts" /* typescript output - this path depends upon your tsconfig.json */
}
```

### Multiple entrypoints

If you have multiple entrypoints then you should leave `rootEntrypoints: true` to generate entrypoints at the root. This is a slightly flawed approach as only commonjs content for the additional entrypoints is supported, but is the best that we can do give current support.

Given a `loom.config.js` file that contains:

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

In the `package.json` add the following `main` (for commonjs output), `module` (for esmodules output), `esnext` (for esnext output) and `types`(for TypeScript types) keys. You can omit a given key if you are not generating a particular output type. If you specify a `files` array, remember to add these root entrypoints to it.

```js
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

### Overriding Babel config

We provide an initial babel config that supports typescript and react, using `@shopify/babel-plugin`. If you need to adjust this config, you can call the `babel()` plugin after `buildLibrary` to override the defaults.

```js
import {createPackage, Runtime} from '@shopify/loom';
import {
  buildLibrary,
  buildLibraryWorkspace,
  babel,
} from '@shopify/loom-plugin-build-library';

export default createPackage((pkg) => {
  pkg.runtimes(Runtime.Node, Runtime.Browser);
  pkg.entry({root: './src/index'});
  pkg.use(
    buildLibrary({
      browserTargets: 'defaults',
      nodeTargets: 'node 12.13',
    }),
    buildLibraryWorkspace({
      // Optional. Defaults to false. Defines if d.ts files should be generated for graphql files.
      graphql: false,
    }),
    // Override initial babel options.
    // Return a new object, instead of mutating the argument object.
    babel({
      config(babelConfig) {
        return {
          ...babelConfig,
          plugins: [...(babelConfig.plugins || []), 'my-custom-babel-plugin'],
        };
      },
    }),
  );
});
```
