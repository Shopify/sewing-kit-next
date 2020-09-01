# `@sewing-kit/config`

This package provides a number functions to create sewing-kit configs. These functions can be used to create a config for a given `Project` or `Workspace`.

A sewing-kit config (`sewing-kit.config.ts`) file is required in the root folder of each `Project` or `Workspace`.

## Installation

```
yarn add @sewing-kit/config --dev
```

## API

The bulk of a sewing-kit config consists of configuring sewing-kit plugins. Default plugins are provided within the `@sewing-kit/*` ecosystem, or consumers can create their own plugin to define their custom configuration.

### `createWorkspace`

Use `createWorkspace` in a `sewing-kit.config.ts` file to define a workspace. The following config file defines the sewing-kit workspace itself. A workspace that uses eslint, jest, and TypeScript.

```ts
// sewing-kit.config.ts

import {createWorkspace} from '@sewing-kit/config';

import {eslint} from '@sewing-kit/plugin-eslint';
import {jest} from '@sewing-kit/plugin-jest';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';

export default createWorkspace((workspace) => {
  workspace.use(eslint(), jest(), workspaceTypeScript());
});
```

### `createPackage`

Use `createPackage` in a `sewing-kit.config.ts` file to define a package in the workspace. Sewing-kit itself uses this to define its own packages as follows:

```ts
// packages/some-package

import {createPackage, Runtime} from '@sewing-kit/config';
import {createSewingKitPackagePlugin} from '../../config/sewing-kit';

export default createPackage((pkg) => {
  // tells sewing-kit that we're building a Node.js package
  pkg.runtime(Runtime.Node);

  // tell sewing-kit what kind of build outputs you want available
  pkg.use(createSewingKitPackagePlugin());
});
```

### `createWebApp`

`createWebApp` is used to create a web application within a given `Workspace`. Generally speaking, this would be a React app.

```ts
// app/ui/sewing-kit.config.ts

import {createWebApp} from '@sewing-kit/config';
import {myPlugins} from '../../config/myPlugins';

export default createWebApp((app) => {
  // tell sewing-kit the entry into the app
  app.entry('./index');

  // apply your preferred plugins for your app
  // TODO: provide more specifc preconfigured plugins
  app.use(myPlugins());
});
```

### `createService`

Use `createService` in a `sewing-kit.config.ts` file to define a service in the workspace. In the context of sewing-kit, a service refers to a Node.js server.

```ts
// server/sewing-kit.config.ts

import {createService} from '@sewing-kit/config';

export default createWebApp((app) => {
  // tell sewing-kit the entry into the server
  app.entry('./server');
});
```
