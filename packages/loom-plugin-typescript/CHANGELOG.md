# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Breaking Change

- Renamed package from `@sewing-kit/plugin-typescript` to `@shopify/loom-plugin-typescript`. [[#247](https://github.com/Shopify/loom/pull/247)]

## 0.7.1 - 2021-09-09

- No updates. Transitive dependency bump.

## 0.7.0 - 2021-09-08

### Changed

- Added `--pretty` argument to tsc command to improve human readable output [[#230](https://github.com/Shopify/loom/pull/230)]

## 0.6.1 - 2021-07-29

- No updates. Transitive dependency bump.

## 0.6.0 - 2021-07-28

### Breaking Change

- Removed the `typescript()` project plugin, it no longer has any value. `plugin-babel` lets you add typescript babel presets and `plugin-jest` v0.5.0 enables typescript out of the box.

### Changed

- Typescript output is no longer cached in the `.sewing-kit` folder and restored on each run. Cachable output still occurs in `packages/*/build/*.tsbuildinfo` and `packages/*/build/ts`. Those two locations should be addded to any CI cache storage step. [[#217](https://github.com/Shopify/loom/pull/217)]
- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/loom/pull/217)]

## 0.5.0 - 2021-07-07

### Breaking Change

- Removed generation of `.d.ts` entrpoint files. You should add a `types` or `typesVersions` key to your package.json to ensure types are referenced correctly. [[#210](https://github.com/Shopify/loom/pull/210)]
- Remove webpack configuration. Consuming apps should configure webpack's `babel-loader` themselves, and enable `isolatedModules: true` in their `tsconfig.json` to identify and fix missing type reexports. [[#213](https://github.com/Shopify/loom/pull/213)]
- Remove configuring `babelExtensions` and `babelIgnorePatterns` as these hooks have been removed from `plugin-javascript`.

### Changed

- Updated typescript dependency to `^4.3.5` [[#212](https://github.com/Shopify/loom/pull/212)]
- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/loom/pull/210)]

## 0.4.0 - 2021-06-25

### Breaking Change

- Remove `writeTypescriptEntries` and `EntryStrategy` utilities. The writing of entry files should be managed by build plugins if it is required

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/loom/pull/177)]
- Removed configuration of eslint extensions, which is no longer required as typescript files can be included in linting by modifying ESLint config files. [[#199](https://github.com/Shopify/loom/pull/199)]

## 0.3.0 - 2021-06-18

### Changed

- Update `@babel/*` packages to their latest versions `7.14.5` [[#191](https://github.com/Shopify/loom/pull/191)]
- Remove `babel-plugin-convert-empty-file-to-esmodule`. This feature is now provided by `@babel/plugin-transform-typescript` [[#195](https://github.com/Shopify/loom/pull/195)]

## 0.2.1 - 2021-05-28

- No updates. Transitive dependency bump.

## 0.2.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/loom/pull/170)]

### Changed

- Updated babel dependency to 7.13. ([#148](https://github.com/Shopify/loom/pull/148))

## 0.1.28 - 2021-04-21

### Fixed

- Use explicit type imports for configuration hooks [[#144](https://github.com/Shopify/loom/pull/144/files)

## 0.1.27 - 2021-04-14

- Update `workspaceTypeScript` early bailout logic to fix [#138](https://github.com/Shopify/loom/issues/138) [[#139](https://github.com/Shopify/loom/pull/139)]

## 0.1.26 - 2021-04-07

### Changed

- Change `optionalDependencies` to `peerDependencies [[#125](https://github.com/Shopify/loom/pull/125/files)]

## 0.1.25 - 2021-04-06

- No updates. Transitive dependency bump.

## 0.1.24 - 2021-03-30

- No updates. Transitive dependency bump.

## 0.1.23 - 2021-03-05

- No updates. Transitive dependency bump.

## 0.1.22

### Added

- Started changelog for @sewing-kit/plugin-typescript
