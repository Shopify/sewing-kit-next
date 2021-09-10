# `plugins`

Provides API for building `sewing-kit` plugins.

_For a more in-depth explanation of plugins and the philosophy behind them, check out these [docs](/documentation/plugins.md)_

## Overview

In `sewing-kit`, plugins are the things that actually "do" stuff. They piggyback off the architecture provided by `sewing-kit`'s core (i.e. [hooks](../hooks)) to inject actual actions into your workspace's tasks.

The `@sewing-kit` monorepo provides a suite of ready-made plugins for common use cases, like [type-checking with TypeScript](../../../plugin-typescript), [transpiling with Babel](../../../plugin-babel), and [testing with Jest](../../../plugin-jest). However, using `sewing-kit`'s API you're able (and encouraged) to write your own to fit your specific needs.

## Example

Below is an example `loom.config.ts` that sets up a `sewing-kit` workspace to lint with ESLint, test with Jest, and type-check with TypeScript. It also includes a custom plugin made with `createWorkspaceTestPlugin` that taps into the `jestConfig` hook introduced by the `jest` plugin to specify a coverage directory.

```js
import {createWorkspace} from '@sewing-kit/core';

import {eslint} from '@sewing-kit/plugin-eslint';
import {jest} from '@sewing-kit/plugin-jest';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';

import {createWorkspaceTestPlugin} from '@sewing-kit/core';

export default createWorkspace((workspace) => {
  workspace.use(
    eslint(),
    jest(),
    workspaceTypeScript(),
    createWorkspaceTestPlugin('JestCoveragePlugin', (taskContext) => {
      const {hooks: taskHooks} = taskContext;

      taskHooks.configure.hook((configHooks) => {
        configHooks.jestConfig?.hook((jestConfig) => ({
          ...jestConfig,
          coverageDirectory: './coverage',
        }));
      });
    }),
  );
});
```

Plugins can do anything from configuring hooks, adding steps to tasks, or introducing hooks for other plugins to hook into. Note that `JestCoveragePlugin` makes use of the `jestConfig` hook, which isn't provided by core `sewing-kit` but is introduced to the workspace by `jest`.

For more examples on how to write your own plugins, check out the source code for [`@sewing-kit/plugin-jest`](../../../plugin-jest), [`@sewing-kit/plugin-eslint`](../../../plugin-eslint), [`@sewing-kit/plugin-typescript`](../../../plugin-typescript), among others.

## Usage

### Plugin creation

The following functions are provided to help make writing your own plugins easier:

**For composing several plugins into one:**

- `createComposedProjectPlugin()`
- `createComposedWorkspacePlugin()`

**For project plugins:**

- `createProjectBuildPlugin()`
- `createProjectDevPlugin()`
- `createProjectPlugin()`
- `createProjectTestPlugin()`

**For workspace plugins:**

- `createWorkspaceBuildPlugin()`
- `createWorkspaceDevPlugin()`
- `createWorkspaceLintPlugin()`
- `createWorkspacePlugin()`
- `createWorkspaceTestPlugin()`
- `createWorkspaceTypeCheckPlugin()`
