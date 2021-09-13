# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## 0.7.0 - 2021-09-13

### Breaking Change

- Renamed package from `@sewing-kit/core` to `@shopify/loom`. [[#247](https://github.com/Shopify/loom/pull/247)]
- The config file name has been renamed. Loading config from `sewing-kit.config.*` has been removed and replaced with reading config from `loom.config.*`. You must rename your config files. [[#246](https://github.com/Shopify/loom/pull/246)]
- The metadata directory has been renamed. The `.sewing-kit` directory has been replaced with `.loom`. You must update any `.gitignore` etc files. [[#246](https://github.com/Shopify/loom/pull/246)]

## 0.6.4 - 2021-09-09

- No updates. Transitive dependency bump.

## 0.6.3 - 2021-09-08

### Changed

- Use `Symbol.for()` instead of `new Symbol()` when defining symbols [[#227](https://github.com/Shopify/loom/pull/227)]

## 0.6.2 - 2021-07-29

### Changed

- Fix regression in babel parsing of config files introduced in 0.6.1

## 0.6.1 - 2021-07-28

### Changed

- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/loom/pull/217)]

## 0.6.0 - 2021-07-07

### Breaking Change

- Moved the contents of `@sewing-kit/config`, `@sewing-kit/hooks`, `@sewing-kit/plugins` and `@sewing-kit/tasks` into `@sewing-kit/core`. This single package now provides most of the functionality for consuming and writing SK plugins. [[#211](https://github.com/Shopify/loom/pull/211)]

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/loom/pull/210)]

## 0.5.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/loom/pull/177)]

## 0.4.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/loom/pull/170)]

### Added

Add `relativePath` to FileSystem [[#160](https://github.com/Shopify/loom/pull/160)]

## 0.3.0 - 2021-04-14

- Remove `private` getter on the `Workspace` class [[#139](https://github.com/Shopify/loom/pull/139)]

## 0.2.1 - 2021-04-06

### Added

- Add `append` to `FileSystem` class [[#129](https://github.com/Shopify/loom/pull/129)]
- Expose `FileSystem` type [[#128](https://github.com/Shopify/loom/pull/128)]

## 0.2.0 - 2021-03-30

### Added

- Add `remove` to `fs` api [[#124](https://github.com/Shopify/loom/pull/124)]

## 0.1.5

### Added

- Started changelog for @sewing-kit/core
