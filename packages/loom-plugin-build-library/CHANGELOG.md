# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Breaking Change

- Removed support for styles, images and graphql files. Support for these file types is now provided by `@shopify/loom-plugin-build-library-extended`. Add that to your loom config as a sibling of `@shopify/loom-plugin-build-library`. [[#256](https://github.com/Shopify/loom/pull/256)]
- Expose `commonjs`, `esmodules`, `esnext`, `binaries` and `rootEntrypoints` as top level options instead of nesting them in the `packageBuildOptions` object. [[#253](https://github.com/Shopify/loom/pull/253)]
- The `commonjs`, `esmodules`, `esnext` options now all default to `false` instead of `true`. You must opt into the types of build that you desire. [[#257](https://github.com/Shopify/loom/pull/257)]
- Merged the `nodeTargets` and `browsersTargets` options into a single required `targets` option. What you specify in `pkg.runtimes` no longer controls how the targets are merged - whatever is in the `targets` option is always used for the commonjs and esmodules builds. [[#257](https://github.com/Shopify/loom/pull/257)]

### Changed

- Fixed path generation in entrypoints / bin files when the entrypoints do not live in the `src` folder [[#254](https://github.com/Shopify/loom/pull/254)]

## 0.3.2 - 2021-09-13

### Changed

- Updated `@shopify/babel-preset` [[#249](https://github.com/Shopify/loom/pull/249)]

## 0.3.1 - 2021-09-13

### Added

- Add missing dependencies [[#248](https://github.com/Shopify/loom/pull/248)]

## 0.3.0 - 2021-09-13

### Breaking Change

- Renamed package from `@sewing-kit/plugin-build-library` to `@shopify/loom-plugin-build-library`. [[#247](https://github.com/Shopify/loom/pull/247)]

## 0.2.0 - 2021-09-09

### Changed

- Ensure graphql type definitions are generated within the project. [[#242](https://github.com/Shopify/loom/pull/242)]
- Remove unused dependency on `svgo`. [[#240](https://github.com/Shopify/loom/pull/240)]
- Remove `babelConfig` option. Users should use `babel()` to further modify babel config. [#239](https://github.com/Shopify/loom/pull/239)

## 0.1.0 - 2021-09-08

### Added

- Started changelog for @sewing-kit/plugin-build-library
