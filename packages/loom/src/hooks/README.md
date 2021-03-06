# `hooks`

Interfaces and types for `loom` hooks.

## Overview

Hooks, along with [plugins](../plugins), form the functional heart of `loom`. Inspired by webpack's [tapable library](https://github.com/webpack/tapable) ([guide](https://codeburst.io/what-the-hook-learn-the-basics-of-tapable-d95eb0401e2c)), hooks provide a way for plugins to tap into `loom` tasks in order to impart functionality to your workspace's dev setup.

## Calling hooks

The two types of hooks provided are a `SeriesHook` and a `WaterfallHook`. Both of these clases provide a `hook` and `run` method

```ts
import {SeriesHook} from '@shopify/loom';

const dog = {
  breed: new SeriesHook<string>(),
};

dog.breed.hook((breed) => {
  console.log('Received changes on the breed: ', breed);
});

dog.breed.run('American Bully');
// Received changes on the breed: American Bully
```

### SeriesHook vs WaterfallHooks

When `run` is called on a `SeriesHook` all the conainted hooks are resolved in sequential order. With a `Waterfall` hook, the result of a hook is passed in as the argument for the next hook.

## Usage

### Adding hooks

A lot of your use cases can probably covered by the hooks provided by core `loom`, but you can always add your own hooks via plugins and a task's `configureHooks` hook (adding hooks with hooks). For example, if you add, say, a plugin that [introduces Jest](../../../plugin-jest) to your workspace's testing setup, that plugin can also add a hook to let other plugins hook into its Jest configuration.

```ts
// Code from @shopify/loom-plugin-jest

hooks.configureHooks.hook(
  addHooks<JestWorkspaceHooks>(() => ({
    jestSetupEnv: new WaterfallHook(),
    jestSetupTests: new WaterfallHook(),
    jestWatchPlugins: new WaterfallHook(),
    jestConfig: new WaterfallHook(),
    jestFlags: new WaterfallHook(),
  })),
);
```

### Configuring/tapping into hooks

Following from the previous example, another plugin further down might then do something like:

```ts
createWorkspaceTestPlugin('CustomPlugin', ({hooks}) => {
  hooks.configure.hook((hooks) => {
    hooks.jestSetupEnv.hook((oldJestSetupEnv) => {
      // Do something to oldJestSetupEnv and return the new value
    });

    hooks.jestConfig.hook((oldJestConfig) => {
      // Do something to oldJestConfig and return the new value
    });

    // ..etc
  });
});
```

When you run `loom test`, `loom` will pick up your configs and plugins and run Jest with your specified option/config values.
