# `@sewing-kit/plugin-javascript`

This package provides a collection of `sewing-kit` plugins and other utilities for using JavaScript. It includes built-in support for transforming JavaScript with [Babel](https://babeljs.io).

## Installation

```sh
yarn add @sewing-kit/plugin-javascript --dev
```

## Plugins

### `javascript()`

The `javascript` function returns a `sewing-kit` plugin. To use it, include it in the `sewing-kit` configuration file of any project (but not the workspace).

```js
import {createWebApp} from '@sewing-kit/core';
import {javascript} from '@sewing-kit/plugin-javascript';

export default createWebApp((app) => {
  app.use(javascript());
});
```

#### Options

The `javascript()` plugin accepts the following options:

- `babelConfig: Partial<BabelConfig>` (default: `undefined`). Sets a base Babel config to use for all tools relying on Babel.

  ```js
  import {createWebApp} from '@sewing-kit/core';
  import {javascript} from '@sewing-kit/plugin-javascript';

  export default createWebApp((app) => {
    app.use(javascript({
      babelConfig: {presets: ['babel-preset-mycompany'],
    }));
  });
  ```

#### Hooks

The `javascript()` plugin adds a number of Babel-related hooks to `sewing-kit`. These hooks are used by other plugins, like [`@sewing-kit/plugin-jest`](TODO), to use Babel as part of other developer tools.

This plugin adds the following hooks to each of the `TestProjectConfigurationHooks`, `BuildProjectConfigurationHooks`, and `DevProjectConfigurationHooks`:

- `babelConfig`: the configuration used when transpiling with Babel.

  ```js
  import {createProjectBuildPlugin} from '@sewing-kit/core';

  const plugin = createProjectBuildPlugin(({hooks}) => {
    hooks.configure.hook((configure) => {
      configure.babelConfig?.hook((config) => ({
        ...config,
        plugins: [...config.plugins, require.resolve('my-babel-plugin')],
      }));
    });
  });
  ```
