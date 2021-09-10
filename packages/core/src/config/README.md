# `config`

This folder provides a number functions to create loom configs. These functions can be used to create a config for a given `Project` or `Workspace`.

A loom config (`loom.config.ts`) file is required in the root folder of each `Project` or `Workspace`.

## API

The bulk of a loom config consists of configuring loom plugins. Default plugins are provided within the `@sewing-kit/*` ecosystem, or consumers can create their own plugin to define their custom configuration.

### `createWorkspace`

Use `createWorkspace` in a `loom.config.ts` file to define a workspace. The following config file defines the loom workspace itself. A workspace that uses eslint, jest, and TypeScript.

```js
// loom.config.ts

import {createWorkspace} from '@sewing-kit/core';

import {eslint} from '@sewing-kit/plugin-eslint';
import {jest} from '@sewing-kit/plugin-jest';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';

export default createWorkspace((workspace) => {
  workspace.use(eslint(), jest(), workspaceTypeScript());
});
```

### `createPackage`

Use `createPackage` in a `loom.config.ts` file to define a package in the workspace. Loom itself uses this to define its own packages as follows:

```js
// packages/some-package

import {createPackage, Runtime} from '@sewing-kit/core';
import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  // tells loom that we're building a Node.js package
  pkg.runtime(Runtime.Node);

  // tell loom what kind of build outputs you want available
  pkg.use(createLoomPackagePlugin());
});
```

### `createWebApp`

`createWebApp` is used to create a web application within a given `Workspace`. Generally speaking, this would be a React app.

```js
// app/ui/loom.config.ts

import {createWebApp} from '@sewing-kit/core';
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

import {createService} from '@sewing-kit/core';

export default createWebApp((app) => {
  // tell loom the entry into the server
  app.entry('./server');
});
```
