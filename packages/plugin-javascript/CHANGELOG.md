# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed

- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/sewing-kit-next/pull/217)]

## 0.6.0 - 2021-07-07

### Breaking Change

- Remove webpack configuration and `createJavaScriptWebpackRuleSet` helper. Consuming apps should configure webpack's `babel-loader` themselves. [[#213](https://github.com/Shopify/sewing-kit-next/pull/213)]
- Remove `babelExtensions`, `babelIgnorePatterns` and `babelCacheDependencies` hooks. `babelExtensions` and `babelIgnorePatterns` were only used when compiling with the babel CLI, which is no longer supported. `babelCacheDependencies` was only used when configuring webpack's `babel-loader`, which is now the responsibility of consuming apps.

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/sewing-kit-next/pull/210)]

## 0.5.0 - 2021-06-25

### Breaking Change

- Remove `createCompileBabelStep`, `writeEntries` and `ExportStyle` utilities. Project compilation using the Babel CLI is no longer supported, as Rollup provides a more complete experience.

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]

## 0.4.2 - 2021-06-18

### Changed

- Update `@babel/*` packages to their latest versions `7.14.5` [[#191](https://github.com/Shopify/sewing-kit-next/pull/191)]
- Add `interopRequireDefault` used by babel in `cjs` entry point generation [[#196](https://github.com/Shopify/sewing-kit-next/pull/196)]

## 0.4.1 - 2021-05-28

### Changed

- Set `corejs` to `false` when `polyfill` is `inline`. ([#173](https://github.com/Shopify/sewing-kit-next/pull/173))

## 0.4.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/sewing-kit-next/pull/170)]

### Added

- Expose the `writeEntries` helper so it can be used by build plugins. [[#145](https://github.com/Shopify/sewing-kit-next/pull/145)]

### Changed

- Updated babel dependency to 7.13. ([#148](https://github.com/Shopify/sewing-kit-next/pull/148))

## 0.3.4 - 2021-04-14

- No updates. Transitive dependency bump.

## 0.3.3 - 2021-04-07

### Changed

- Change `optionalDependencies` to `peerDependencies [[#125](https://github.com/Shopify/sewing-kit-next/pull/125/files)]

## 0.3.2 - 2021-04-06

- No updates. Transitive dependency bump.

## 0.3.1 - 2021-03-30

- No updates. Transitive dependency bump.

## 0.3.0

### Added

- Started changelog for @sewing-kit/plugin-javascript
