# `@sewing-kit/plugin-babel`

Exposes hooks to configure [Babel](https://babeljs.io), which may then be used by other build and test plugins.

## Installation

```sh
yarn add @sewing-kit/plugin-babel --dev
```

## Usage

`babel()` is a plugin that exposes hooks to configure babel at the project level and sets default values for that configuration based on what the user provides.

Add the plugin to your project and specify any defaults that you wish to set using the `config` option, which is either an object containing all the options described on [Babel's options page](https://babeljs.io/docs/en/options) with the exception of `include` and `exclude`, or a function that accepts the existing babel options and expects the new babel options object to be returned. This example defines a `config` that uses the `@shopify/babel-preset` preset.

```js
import {createPackage, Runtime} from '@sewing-kit/core';
import {babel} from '@sewing-kit/plugin-babel';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.use(
    babel({
      // Overrides any current config that is set
      config: {presets: ['@shopify/babel-preset']},
    }),
  );
});
```

```js
import {createPackage, Runtime} from '@sewing-kit/core';
import {babel} from '@sewing-kit/plugin-babel';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.use(
    babel({
      // Modifies any current config that has been set by other sewing-kit plugins
      config(babelConfig) {
        // the plugins array may not be set initially
        if (!babelConfig.plugins) {
          babelConfig.plugins = [];
        }
        babelConfig.plugins.push('my-custom-babel-plugin');
        return babelConfig;
      },
    }),
  );
});
```

### Hooks

This plugin adds the following hooks to each of the `TestProjectConfigurationHooks`, `BuildProjectConfigurationHooks`, and `DevProjectConfigurationHooks`:

- `babelConfig`: the configuration used when transpiling with Babel.

  ```js
  import {createProjectBuildPlugin} from '@sewing-kit/core';

  const plugin = createProjectBuildPlugin(({hooks}) => {
    hooks.configure.hook((configure) => {
      // Add an additional plugins when building
      configure.babelConfig?.hook((config) => ({
        ...config,
        plugins: [...config.plugins, require.resolve('my-babel-plugin')],
      }));
    });
  });
  ```
