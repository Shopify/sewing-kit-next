# `@sewing-kit/plugin-rollup`

Exposes hooks and build step to run [`rollup`](https://rollupjs.org/guide/en/).

## Installation

```bash
$ yarn add @sewing-kit/plugin-rollup
```

## Usage

The low-level functionality of this package is split into two parts.

- `rollupHooks` is a plugin that exposes hooks to configure `rollup`.
- `rollupBuild` is a plugin that registers a build step that runs `rollup` with the configuration gathered by the hooks defined in `rollupHooks`.

Add both plugins to your project, along with configuration of the hooks. This example configures the `rollupInputOptions` and `rollupOutputs` hooks.

```
import {createPackage, Runtime} from '@sewing-kit/config';
import {createProjectBuildPlugin} from '@sewing-kit/plugins';
import {rollupHooks, rollupBuild} from '@sewing-kit/plugin-rollup';

export default createPackage((pkg) => {
  pkg.use(rollupHooks(), rollupBuild(), rollupConfig());
});

function rollupConfig() {
  return createProjectBuildPlugin('Test', ({hooks, project}) => {
    hooks.target.hook(({hooks}) => {
      hooks.configure.hook((configuration) => {
        configuration.rollupInputOptions?.hook(() => {
          return {input: project.fs.resolvePath('./src/index.js')};
        });
        configuration.rollupOutputs?.hook(() => {
          return [{format: 'esm', dir: project.fs.buildPath('esm')}];
        });
      });
    });
  });
}
```

### Hooks

The `rollupInput`, `rollupPlugins` and `rollupExternals` hooks map to `input`, `plugins` and `externals` keys of Rollup's `InputOptions` object as documented at https://rollupjs.org/guide/en/#inputoptions-object.

The `rollupInputOptions` hook defines a whole `InputOptions` object, it includes any values set in `rollupInput`, `rollupPlugins` and `rollupExternals`, this can be used if you need to control any advanced input configuration options.

The `rollupOutputs` hook is an array of Rollup's `OutputOptions` objects as documented at https://rollupjs.org/guide/en/#outputoptions-object.

## Usage (Opionated)

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
