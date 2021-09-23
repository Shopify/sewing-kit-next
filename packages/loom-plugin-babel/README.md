# `@shopify/loom-plugin-babel`

Exposes hooks to configure [Babel](https://babeljs.io), which may then be used by other build and test plugins.

## Installation

```sh
yarn add @shopify/loom-plugin-babel --dev
```

## Usage

`babel()` is a plugin that exposes hooks to configure babel at the project level and sets default values for that configuration based on what the user provides.

Add the plugin to your project and specify any defaults that you wish to set using the `config` option, which is either an object containing all the options described on [Babel's options page](https://babeljs.io/docs/en/options) with the exception of `include` and `exclude`, or a function that accepts the existing babel options and expects the new babel options object to be returned. This example defines a `config` that uses the `@shopify/babel-preset` preset.

```js
import {createPackage, Runtime} from '@shopify/loom';
import {babel} from '@shopify/loom-plugin-babel';

export default createPackage((pkg) => {
  pkg.use(
    babel({
      // Overrides any current config that is set
      config: {presets: ['@shopify/babel-preset']},
    }),
  );
});
```

```js
import {createPackage, Runtime} from '@shopify/loom';
import {babel} from '@shopify/loom-plugin-babel';

export default createPackage((pkg) => {
  pkg.use(
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

### Hooks

This plugin adds the following hooks to each of the `TestProjectConfigurationHooks`, `BuildProjectConfigurationHooks`, and `DevProjectConfigurationHooks`:

- `babelConfig`: the configuration used when transpiling with Babel.

  ```js
  import {createProjectBuildPlugin} from '@shopify/loom';

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
