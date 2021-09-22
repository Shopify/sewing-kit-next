# `config`

This folder provides a number functions to create loom configs. These functions can be used to create a config for a given `Project` or `Workspace`.

A loom config (`loom.config.ts`) file is required in the root folder of each `Project` or `Workspace`.

## API

The bulk of a loom config consists of configuring loom plugins. Default plugins are provided within the `@shopify/loom-plugin-*` ecosystem, or consumers can create their own plugin to define their custom configuration.

### `createWorkspace`

Use `createWorkspace` in a `loom.config.ts` file to define a workspace. The following config file defines the loom workspace itself. A workspace that uses eslint, jest, and TypeScript.

```js
// loom.config.ts

import {createWorkspace} from '@shopify/loom';

import {eslint} from '@shopify/loom-plugin-eslint';
import {jest} from '@shopify/loom-plugin-jest';
import {workspaceTypeScript} from '@shopify/loom-plugin-typescript';

export default createWorkspace((workspace) => {
  workspace.use(eslint(), jest(), workspaceTypeScript());
});
```

### `createPackage`

Use `createPackage` in a `loom.config.ts` file to define a package in the workspace. Loom itself uses this to define its own packages as follows:

```js
// packages/some-package

import {createPackage, Runtime} from '@shopify/loom';
import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  // tell loom the entry point into your package.
  pkg.entry({root: './src/index.js'});
  // If your app has multiple entrypoints you can add additional entries
  pkg.entry({name: 'second', root: './src/second.js'});

  // tell loom what kind of build outputs you want available
  pkg.use(createLoomPackagePlugin());
});
```

### `createWebApp`

`createWebApp` is used to create a web application within a given `Workspace`. Generally speaking, this would be a React app.

```js
// app/ui/loom.config.ts

import {createWebApp} from '@shopify/loom';
import {myPlugins} from '../../config/my-plugins';

export default createWebApp((app) => {
  // tell loom the entry into the app
  app.entry('./index');

  // apply your preferred plugins for your app
  // TODO: provide more specifc preconfigured plugins
  app.use(myPlugins());
});
```

### `createService`

Use `createService` in a `loom.config.ts` file to define a service in the workspace. In the context of loom, a service refers to a Node.js server.

```js
// server/loom.config.ts

import {createService} from '@shopify/loom';

export default createWebApp((app) => {
  // tell loom the entry into the server
  app.entry('./server');
});
```
