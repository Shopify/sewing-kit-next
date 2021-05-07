# `@sewing-kit/plugin-rollup`

Exposes [`rollup`](https://rollupjs.org/guide/en/) as a sewing-kit plugin. The `rollup` export offers an opinonated build configuration that allows you to output commonjs, esmodules and esnext builds.

Most consumers shouldn't need to use this plugin directly. Instead they should use`plugin-flexible-outputs` to handle binary file and `d.ts` entrypoint creation in addition to the build output that `plugin-rollup` provides.

## Installation

```bash
$ yarn add @sewing-kit/plugin-rollup
```

## Usage

Add `rollupOpinionated` to your sewing-kit plugins.

```
import {createPackage, Runtime} from '@sewing-kit/config';
import {javascript} from '@sewing-kit/plugin-javascript';
import {rollup} from '@sewing-kit/plugin-rollup';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.use(
    javascript(),
    rollupOpinionated({
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Browser`
      browserTargets: 'defaults',
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Node`
      nodeTargets: 'maintained node versions',
      // Optional. Defaults to true. Defines if commonjs outputs should be generated.
      commonjs: true
      // Optional. Defaults to true. Defines if esmodules outputs should be generated.
      esmodules: true,
      // Optional. Defaults to true. Defines if esnext outputs should be generated.
      esnext: true,
      // Optional. Any additional rollup plugins to be added to the build
      plugins: [],
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
