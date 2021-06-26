# `@sewing-kit/plugin-eslint`

> New to `sewing-kit`? [This guide](TODO) explains what `sewing-kit` is, how it’s organized, and how to use it in a project. Read through that overview if you haven’t already — it should help to clarify how to use the tools documented below.

This package provides a `sewing-kit` plugin that runs [ESLint](https://eslint.org) as part of the [`sewing-kit lint` command](TODO).

## Installation

```
yarn add @sewing-kit/plugin-eslint --dev
```

## `eslint()`

The `eslint` function returns a `sewing-kit` plugin. This plugin applies to the workspace, not an individual project.

```ts
import {createWorkspace} from '@sewing-kit/config';
import {eslint} from '@sewing-kit/plugin-eslint';

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

  ```tsx
  import {createWorkspaceLintPlugin} from '@sewing-kit/config';

  const plugin = createWorkspaceLintPlugin(({hooks}) => {
    hooks.configure.hook((configure) => {
      // Modify the maximum number of allowed warnings from the default of 0
      configure.eslintFlags!.hook((flags) => ({
        ...flags,
        maxWarnings: 5,
      }));
    });
  });
  ```
