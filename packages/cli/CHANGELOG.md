# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## 0.6.1 - 2021-07-28

### Changed

- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/sewing-kit-next/pull/217)]

## 0.6.0 - 2021-07-07

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/sewing-kit-next/pull/210)]
- Improved the exec command logger so arguments are quoted properly. [[#209](https://github.com/Shopify/sewing-kit-next/pull/209)]

## 0.5.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]

## 0.4.2 - 2021-06-18

- No updates. Transitive dependency bump.

## 0.4.1 - 2021-06-01

### Changed

- Removed dependency on core-js as we no longer need the polyfills it provides [[#174](https://github.com/Shopify/sewing-kit-next/pull/174)]

## 0.4.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/sewing-kit-next/pull/170)]

## 0.3.4 - 2021-04-16

### Fixed

- Support `error` as a `--log-level` for better backwards compatibility with legacy sewing-kit and sewing_kit

## 0.3.3 - 2021-04-14

- No updates. Transitive dependency bump.

## 0.3.2 - 2021-04-06

- No updates. Transitive dependency bump.

## 0.3.1 - 2021-03-30

- No updates. Transitive dependency bump.

## 0.3.0 - 2021-03-05

### Breaking Change

- Renamed `sewing-kit` binary to `sewing-kit-next` [[#117](https://github.com/Shopify/sewing-kit-next/pull/117)]

## 0.2.1

### Added

- Started changelog for @sewing-kit/cli
