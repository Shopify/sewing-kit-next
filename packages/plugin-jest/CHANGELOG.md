# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed

- Support typescript files (`ts`/`tsx`) by default.
- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/sewing-kit-next/pull/217)]

## 0.4.1 - 2021-07-07

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/sewing-kit-next/pull/210)]

## 0.4.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]
- Add `jestTestRunner` hook to allow for easily overriding Jest's [`testRunner`](https://jestjs.io/docs/configuration#testrunner-string) option [[#198](https://github.com/Shopify/sewing-kit-next/pull/198)]

## 0.3.0 - 2021-06-18

### Changed

- Update `jest` to version `27` [[#193](https://github.com/Shopify/sewing-kit-next/pull/193/)]
- Add `@sewing-kit/hooks` as a dependency [[#187](https://github.com/Shopify/sewing-kit-next/pull/187)]

## 0.2.1 - 2021-05-28

- No updates. Transitive dependency bump.

## 0.2.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/sewing-kit-next/pull/170)]

### Changed

- Updated Jest dependency to latest - v26.6.3 [[#152](https://github.com/Shopify/sewing-kit-next/pull/152)]

## 0.1.27 - 2021-04-21

### Fixed

- Use explicit type imports for configuration hooks [[#144](https://github.com/Shopify/sewing-kit-next/pull/144/files)

## 0.1.26 - 2021-04-14

- No updates. Transitive dependency bump.

## 0.1.25 - 2021-04-07

### Changed

- Change `optionalDependencies` to `peerDependencies [[#125](https://github.com/Shopify/sewing-kit-next/pull/125/files)]

## 0.1.24 - 2021-04-06

- No updates. Transitive dependency bump.

## 0.1.23 - 2021-03-30

- No updates. Transitive dependency bump.

## 0.1.22

### Added

- Started changelog for @sewing-kit/plugin-jest
