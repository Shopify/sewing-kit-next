# `@sewing-kit/plugins`

Provides API for building Sewing Kit plugins.

_For a more in-depth explanation of plugins and the philosophy behind them, check out these [docs](/documentation/plugins.md)_

`@sewing-kit/plugins` also re-exports numerous types and classes from other Sewing Kit packages, such as `core`, `tasks`, and `hooks`.

## Installation

```
yarn add @sewing-kit/plugins --dev
```

## Overview

In Sewing Kit, plugins are the things that actually "do" stuff. They piggyback off the architecture provided by Sewing Kit's core (i.e. hooks) to inject actual actions into your workspace's tasks.

The `@sewing-kit` monorepo provides a suite of ready-made plugins for common use cases, like [type-checking with TypeScript](../packages/plugin-typescript), [transpiling with Babel](../packages/plugin-javascript), and [testing with Jest](../packages/plugin-jest). However, using Sewing Kit's API you're able (and encouraged) to write your own to fit your specific needs.

## Example

Below is an example `sewing-kit.config.ts` that sets up a Sewing Kit workspace to lint with ESLint, test with Jest, and type-check with TypeScript. It also includes a custom plugin made with `createWorkspaceTestPlugin` that taps into the `jestConfig` hook introduced by the `jest` plugin to specify a coverage directory.

```ts
import {createWorkspace} from '@sewing-kit/config';

import {eslint} from '@sewing-kit/plugin-eslint';
import {jest} from '@sewing-kit/plugin-jest';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';

import {createWorkspaceTestPlugin} from '@sewing-kit/plugins';

export default createWorkspace((workspace) => {
  workspace.use(
    eslint(),
    jest(),
    workspaceTypeScript(),
    createWorkspaceTestPlugin('JestCoveragePlugin', ({testTaskHooks}) => {
      testTaskHooks.configure.hook((configHooks) => {
        configHooks.jestConfig?.hook((jestConfig) => ({
          ...jestConfig,
          coverageDirectory: './coverage',
        }));
      });
    }),
  );
});
```

Plugins can do anything from configuring hooks, adding steps to tasks, or introducing hooks for other plugins to hook into. Note that `JestCoveragePlugin` makes use of the `jestConfig` hook, which isn't provided by core Sewing Kit but is introduced to the setup by `jest`.

## Usage
