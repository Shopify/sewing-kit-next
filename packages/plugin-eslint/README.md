# `@shopify/loom-plugin-eslint`

This package provides a `loom` plugin that runs [ESLint](https://eslint.org) as part of the [`loom lint` command](TODO).

## Installation

```sh
yarn add @shopify/loom-plugin-eslint --dev
```

## `eslint()`

The `eslint` function returns a `loom` plugin. This plugin applies to the workspace, not an individual project.

```js
import {createWorkspace} from '@shopify/loom';
import {eslint} from '@shopify/loom-plugin-eslint';

export default createWorkspace((workspace) => {
  workspace.use(eslint());
});
```

By default ESLint runs over everything in the current folder. You can modify the files that are processed by passing in a `files` glob to the plugin's options.

```js
export default createWorkspace((workspace) => {
  // Run eslint on a single subfolder
  workspace.use(pretttier({files: 'some-subfolder/**/*'}));
});
```

### Hooks

This plugin adds the following hooks to `LintWorkspaceConfigurationCustomHooks`:

- `eslintFlags`: an object of options to convert into command line flags for the `eslint` command. These options are camelcase versions of their [CLI counterparts](https://eslint.org/docs/user-guide/command-line-interface).

  ```js
  import {createWorkspaceLintPlugin} from '@shopify/loom';

  const plugin = createWorkspaceLintPlugin(({hooks}) => {
    hooks.configure.hook((configure) => {
      // Modify the maximum number of allowed warnings from the default of 0
      configure.eslintFlags?.hook((flags) => ({
        ...flags,
        maxWarnings: 5,
      }));
    });
  });
  ```
