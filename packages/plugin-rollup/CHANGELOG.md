# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## 0.3.2 - 2021-07-28

### Changed

- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/sewing-kit-next/pull/217)]

## 0.3.1 - 2021-07-07

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/sewing-kit-next/pull/210)]

## 0.3.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]

## 0.2.3 - 2021-06-18

- No updates. Transitive dependency bump.

## 0.2.2 - 2021-05-28

- No updates. Transitive dependency bump.

## 0.2.1 - 2021-05-20

### Added

- `rollupHooks()` now adds hooks to the `dev` task in addition to `build` [[#171](https://github.com/Shopify/sewing-kit-next/pull/171)]

## 0.2.0 - 2021-05-20

### Added

- `@sewing-kit/plugin-rollup` package
