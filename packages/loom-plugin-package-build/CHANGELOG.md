# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## 0.7.0 - 2021-09-13

### Breaking Change

- Renamed package from `@sewing-kit/plugin-package-build` to `@shopify/loom-plugin-package-build`. [[#247](https://github.com/Shopify/loom/pull/247)]

## 0.6.1 - 2021-09-09

- No updates. Transitive dependency bump.

## 0.6.0 - 2021-09-08

- Add `rootEntrypoints` config option, to configure if the root entrypoint files should be generated. It defaults to true, this can be set to false if you have a single entrypoint. [[#237](https://github.com/Shopify/loom/pull/237)]

## 0.5.1 - 2021-07-29

- No updates. Transitive dependency bump.

## 0.5.0 - 2021-07-28

### Breaking Change

- Load babel config from `plugin-babel` instead of `plugin-javascript`. [[#218](https://github.com/Shopify/loom/pull/218)]
- The hardcoded `configFile: false` option passed to `@rollup/babel` has been removed. This means that Babel can look at `babel.config.js` files for config. If you wish to disable this, set `configFile: false` explicitly when configuring the sewing-kit's `babel()` plugin. [[#218](https://github.com/Shopify/loom/pull/218)]

### Changed

- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/loom/pull/217)]

## 0.4.0 - 2021-07-07

### Breaking Change

- Removed generation of `.d.ts` entrpoint files. You should add a `types` or `typesVersions` key to your package.json to ensure types are referenced correctly. [[#210](https://github.com/Shopify/loom/pull/210)]

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/loom/pull/210)]

## 0.3.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/loom/pull/177)]
- Remove unused dependency on `@babel/core` [[#177](https://github.com/Shopify/loom/pull/177)]
- Remove dependencies on `@sewing-kit/plugin-babel` and `@sewing-kit/plugin-typescript`. `plugin-package-build` is now responsible for writing js/mjs/esnext/d.ts entry files.

## 0.2.4 - 2021-06-18

### Changed

- Update `@babel/*` packages to their latest versions `7.14.5` [[#191](https://github.com/Shopify/loom/pull/191)]

## 0.2.3 - 2021-06-01

### Changed

- Fixed bin file generation to ensure it always points at the `build/cjs` folder [[#178](https://github.com/Shopify/loom/pull/178)]
- Reexport `rollupPlugins` from `@sewing-kit/plugin-rollup` to ease build customisation [[#179](https://github.com/Shopify/loom/pull/179)]

## 0.2.2 - 2021-05-28

- No updates. Transitive dependency bump.

## 0.2.1 - 2021-05-20

- No updates. Transitive dependency bump.

## 0.2.0 - 2021-05-20

### Added

- Started changelog for @sewing-kit/plugin-package-build
