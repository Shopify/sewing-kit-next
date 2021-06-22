# `@sewing-kit/plugin-prettier`

This package provides a `sewing-kit` plugin that runs [Prettier](https://prettier.io) as part of the [`sewing-kit lint` command](TODO).

## Installation

```
yarn add @sewing-kit/plugin-prettier --dev
```

## `prettier()`

The `pretttier` function returns a `sewing-kit` plugin. This plugin applies to the workspace, not an individual project.

```ts
import {createWorkspace} from '@sewing-kit/config';
import {pretttier} from '@sewing-kit/plugin-prettier';

export default createWorkspace((workspace) => {
  workspace.use(pretttier());
});
```

### Hooks

This plugin adds the following hooks to `LintWorkspaceConfigurationCustomHooks`:

- `prettierFlags`: an object of options to convert into command line flags for the `prettier` command. These options are camelcase versions of their [CLI counterparts](https://prettier.io/docs/en/cli.html).

  ```tsx
  import {createWorkspaceLintPlugin} from '@sewing-kit/config';

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
