# `@sewing-kit/plugin-stylelint`

This package provides a `loom` plugin that runs [stylelint](https://stylelint.io) as part of the [`loom lint` command](TODO).

## Installation

```sh
yarn add @sewing-kit/plugin-stylelint --dev
```

## `stylelint()`

The `stylelint` function returns a `loom` plugin. This plugin applies to the workspace, not an individual project.

```js
import {createWorkspace} from '@sewing-kit/core';
import {stylelint} from '@sewing-kit/plugin-stylelint';

export default createWorkspace((workspace) => {
  workspace.use(stylelint());
});
```

By default stylelint runs over css files. You can modify the files that are processed by passing in a `files` glob to the plugin's options.

```js
export default createWorkspace((workspace) => {
  // Run stylelint on css and scss files
  workspace.use(stylelint({files: '**/*.{css,scss}'}));
});
```

### Hooks

This plugin adds the following hooks to `LintWorkspaceConfigurationCustomHooks`:

- `stylelintFlags`: an object of options to convert into command line flags for the `eslint` command. These options are camelcase versions of their [CLI counterparts](https://stylelint.io/user-guide/usage/cli/).

  ```js
  import {createWorkspaceLintPlugin} from '@sewing-kit/core';

  const plugin = createWorkspaceLintPlugin(({hooks}) => {
    hooks.configure.hook((configure) => {
      // Modify the maximum number of allowed warnings from the default of 0
      configure.stylelintFlags?.hook((flags) => ({
        ...flags,
        maxWarnings: 5,
      }));
    });
  });
  ```
