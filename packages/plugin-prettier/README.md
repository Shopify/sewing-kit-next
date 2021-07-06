# `@sewing-kit/plugin-prettier`

This package provides a `sewing-kit` plugin that runs [Prettier](https://prettier.io) as part of the [`sewing-kit lint` command](TODO).

## Installation

```
yarn add @sewing-kit/plugin-prettier --dev
```

## `prettier()`

The `prettier` function returns a `sewing-kit` plugin. This plugin applies to the workspace, not an individual project.

```js
import {createWorkspace} from '@sewing-kit/core';
import {prettier} from '@sewing-kit/plugin-prettier';

export default createWorkspace((workspace) => {
  workspace.use(prettier());
});
```

By default prettier runs over everything in the current folder. You can modify the files that are processed by passing in a `files` glob to the plugin's options. This is useful if you use `eslint-plugin-prettier` or `stylelint-prettier` to run prettier as part of `eslint` or `stylelint` as there is no point to running prettier over those files twice.

```js
export default createWorkspace((workspace) => {
  // Run prettier on md, json, yaml and yml files
  workspace.use(prettier({files: '**/*.{md,json,yaml,yml}'}));
});
```

### Hooks

This plugin adds the following hooks to `LintWorkspaceConfigurationCustomHooks`:

- `prettierFlags`: an object of options to convert into command line flags for the `prettier` command. These options are camelcase versions of their [CLI counterparts](https://prettier.io/docs/en/cli.html).

  ```tsx
  import {createWorkspaceLintPlugin} from '@sewing-kit/core';

  const plugin = createWorkspaceLintPlugin(({hooks}) => {
    hooks.configure.hook((configure) => {
      // Trigger error when encountering unknown files matched by patterns
      configure.prettierFlags!.hook((flags) => ({
        ...flags,
        ignoreUnknown: false,
      }));
    });
  });
  ```
