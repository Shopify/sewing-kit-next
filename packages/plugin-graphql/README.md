# `@sewing-kit/plugin-graphql`

> New to `sewing-kit`? [This guide](TODO) explains what `sewing-kit` is, how it’s organized, and how to use it in a project. Read through that overview if you haven’t already — it should help to clarify how to use the tools documented below.

This package provides a group of `sewing-kit` plugins that allow developers to write [GraphQL](https://graphql.org) in dedicated `.graphql` files.

## Installation

```
yarn add @sewing-kit/plugin-graphql --dev
```

## `graphql()`

The `graphql` function returns a `sewing-kit` plugin. This plugin applies to an individual project.

```ts
import {createWebApp} from '@sewing-kit/config';
import {graphql} from '@sewing-kit/plugin-graphql';

export default createWebApp((app) => {
  app.use(graphql());
});
```

This plugin integrates with [`@sewing-kit/plugin-webpack`](TODO) and [`@sewing-kit/plugin-jest`](TODO). In Webpack and Jest, `.graphql` files are configured to be processed by the transforms in [`@sewing-kit/graphql`](TODO).

### Webpack

If `@sewing-kit/plugin-webpack`’s `webpackHooks` plugin is included for this project, this plugin will use it to configure Webpack to support importing `.graphql` files. This support is provided by the [`@sewing-kit/graphql/webpack` loader](TODO).

### Jest

If `@sewing-kit/plugin-jest`’s `jestHooks` plugin is also included for the project, this plugin will use it to configure Jest to support importing `.graphql` files. This support is provided by the [`@sewing-kit/graphql/jest` loader](TODO).

### Options

The `graphql()` plugin accepts the following options:

- `export: import('@sewing-kit/graphql').ExportStyle` (default: `document`). Determines what format GraphQL files will be imported as. This option corresponds to the [`export` option from `@sewing-kit/graphql`](TODO). When set, this will update both the Webpack and Jest transforms.

  ```ts
  import {createWebApp} from '@sewing-kit/config';
  import {graphql} from '@sewing-kit/plugin-graphql';

  export default createWebApp((app) => {
    app.use(graphql({export: 'simple'}));
  });
  ```

- `extensions: string[]` (default: `['.graphql']`). Determines what file extensions are treated as GraphQL files.

  ```ts
  import {createWebApp} from '@sewing-kit/config';
  import {graphql} from '@sewing-kit/plugin-graphql';

  export default createWebApp((app) => {
    // Process both .graphql and .gql files
    app.use(graphql({extensions: ['.graphql', '.gql']}));
  });
  ```
