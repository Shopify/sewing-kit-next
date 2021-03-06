# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## 0.4.0 - 2021-09-13

### Breaking Change

- Renamed package from `@sewing-kit/plugin-rollup` to `@shopify/loom-plugin-rollup`. [[#247](https://github.com/Shopify/loom/pull/247)]

## 0.3.5 - 2021-09-09

- No updates. Transitive dependency bump.

## 0.3.4 - 2021-09-08

- No updates. Transitive dependency bump.

## 0.3.3 - 2021-07-29

- No updates. Transitive dependency bump.

## 0.3.2 - 2021-07-28

### Changed

- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/loom/pull/217)]

## 0.3.1 - 2021-07-07

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/loom/pull/210)]

## 0.3.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/loom/pull/177)]

## 0.2.3 - 2021-06-18

- No updates. Transitive dependency bump.

## 0.2.2 - 2021-05-28

- No updates. Transitive dependency bump.

## 0.2.1 - 2021-05-20

### Added

- `rollupHooks()` now adds hooks to the `dev` task in addition to `build` [[#171](https://github.com/Shopify/loom/pull/171)]

## 0.2.0 - 2021-05-20

### Added

- `@sewing-kit/plugin-rollup` package
