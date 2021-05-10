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

Add both plugins to your project, along with hook configuration of the hooks. This example configures the `rollupInputOptions` and `rollupOutputs` hooks.

```
import {createPackage, Runtime} from '@sewing-kit/config';
import {createProjectBuildPlugin} from '@sewing-kit/plugins';
import {javascript} from '@sewing-kit/plugin-javascript';
import {rollupHooks, rollupBuild} from '@sewing-kit/plugin-rollup';

export default createPackage((pkg) => {
  pkg.use(javascript(), rollupHooks(), rollupBuild(), rollupConfig());
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
