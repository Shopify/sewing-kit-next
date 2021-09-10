# `@sewing-kit/cli`

The CLI for working with `loom`.

These commands trigger the functionality imparted to your project by the plugins consumed in your `sewing-kit.config`s. The options will be passed to the plugins.

## Installation

```sh
yarn add @sewing-kit/cli --dev
```

## Usage

```sh
yarn loom <command> <options>
```

## Commands

| Command                       | Function                                                  |
| ----------------------------- | --------------------------------------------------------- |
| [`build`](#build)             | Builds the apps, services, and packages in your workspace |
| [`dev`](#dev)                 | Starts a hot-reloading development server                 |
| [`test`](#test)               | Runs tests                                                |
| [`lint`](#lint)               | Lints your code                                           |
| [`type-check`](###type-check) | Type-checks your code                                     |

## Options

### `build`

| Option          | Description                                                    | Type and Default                   |
| --------------- | -------------------------------------------------------------- | ---------------------------------- |
| `--source-maps` | Generate sourcemaps for the build                              | `boolean`, defaults to `false`     |
| `--env`         | Whether to build for `production` (or `prod`) or `development` | `string`, defaults to `production` |
| `--no-cache`    | Runs a build without cache                                     | `boolean`, defaults to `false`     |

### `dev`

| Option          | Description                       | Type and Default               |
| --------------- | --------------------------------- | ------------------------------ |
| `--source-maps` | Generate sourcemaps for the build | `boolean`, defaults to `false` |
| `--reload`      | Use fast reloading (`fast`)       | `string`, defaults to `none`   |

### `test`

| Option                | Description                                                                                    | Type and Default                      |
| --------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------- |
| `--help`              | Display options and their descriptions (WIP)                                                   |                                       |
| `--no-watch`          | Turn off watch mode                                                                            | `boolean`, defaults to `false`        |
| `--coverage`          | Generate coverage data                                                                         | `boolean` defaults to `false`         |
| `--debug`             | Run tests in debug mode (for instance, with `plugin-jest` this enables the `runInBand` option) | `boolean`, defaults to `false`        |
| `--update-snapshots`  | Enable [snapshots](https://jestjs.io/docs/en/cli#--updatesnapshot) for failed tests            | `boolean`, defaults to `false`        |
| `--test-name-pattern` | Matching string or globbing pattern to run specific tests                                      | `string`, defaults to running nothing |

### `lint`

| Option          | Description                                                                                                       | Type and Default               |
| --------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `--fix`         | Fix lint errors                                                                                                   | `boolean`, defaults to `false` |
| `--cache`       | Cache linting results for performance                                                                             | `boolean`, defaults to `true`  |
| `--allow-empty` | [Allow matchless globs](https://eslint.org/docs/user-guide/command-line-interface#-no-error-on-unmatched-pattern) | `boolean`, defaults to `false` |

### `type-check`

| Option    | Description              | Type and Default               |
| --------- | ------------------------ | ------------------------------ |
| `--watch` | Type-check in watch mode | `boolean`, defaults to `false` |
| `--cache` | Cache type-check results | `boolean`, defaults to `true`  |
