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
  pkg.use(
    babel(),
    packageBuild({
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Browser`
      browserTargets: 'defaults',
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Node`
      nodeTargets: 'node 12.13',
      // Optional. Defaults to true. Defines if commonjs outputs should be generated.
      commonjs: true,
      // Optional. Defaults to true. Defines if esmodules outputs should be generated.
      esmodules: true,
      // Optional. Defaults to true. Defines if esnext outputs should be generated.
      esnext: true,
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
