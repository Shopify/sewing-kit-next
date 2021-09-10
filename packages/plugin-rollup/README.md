# `@sewing-kit/plugin-rollup`

Exposes hooks and build step to run [`rollup`](https://rollupjs.org/guide/en/).

## Installation

```sh
$ yarn add @sewing-kit/plugin-rollup --dev
```

## Usage

The low-level functionality of this package is split into two parts.

- `rollupHooks` is a plugin that exposes hooks to configure `rollup`.
- `rollupBuild` is a plugin that registers a build step that runs `rollup` with the configuration gathered by the hooks defined in `rollupHooks`.

Add both plugins to your project, along with configuration of the hooks. This example configures the `rollupInputOptions` and `rollupOutputs` hooks.

```js
import {
  createPackage,
  Runtime,
  createProjectBuildPlugin,
} from '@sewing-kit/core';
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

The `rollupInput`, `rollupPlugins` and `rollupExternal` hooks map to `input`, `plugins` and `externals` keys of Rollup's `InputOptions` object as documented at https://rollupjs.org/guide/en/#inputoptions-object.

The `rollupInputOptions` hook defines a whole `InputOptions` object, it includes any values set in `rollupInput`, `rollupPlugins` and `rollupExternal`, this can be used if you need to control any advanced input configuration options.

The `rollupOutputs` hook is an array of Rollup's `OutputOptions` objects as documented at https://rollupjs.org/guide/en/#outputoptions-object.

### `rollupPlugins` Helper

This package exports a `rollupPlugins` loom plugin that provides a shorthand to add items to the `rollupPlugins` hook. Give this plugin either an array of rollup plugins, or a function that takes a loom `Target` and returns an array of rollup plugins. This allows you to control what plugins are added based upon the `Target`.

```js
import {
  createPackage,
  Runtime,
  createProjectBuildPlugin,
} from '@sewing-kit/core';
import {
  rollupHooks,
  rollupBuild,
  rollupPlugins,
} from '@sewing-kit/plugin-rollup';

export default createPackage((pkg) => {
  pkg.use(
    rollupHooks(),
    rollupBuild(),
    rollupConfig(),
    // Adds the injecterPlugin to all targets with the same config
    rollupPlugins([injecterPlugin('all')]),
    // Only adds the injecterPlugin when compiling the target with the specialBuild option set
    rollupPlugins((target) => {
      return target.options.specialBuild
        ? [injecterPlugin('only specialBuild')]
        : [];
    }),
  );

  // A sample Rollup plugin that shall append some content to each file
  function injecterPlugin(string) {
    return {
      name: `test-injecter`,
      transform(code) {
        return code + '/*Injected content ~' + string + '~ */';
      },
    };
  }
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
