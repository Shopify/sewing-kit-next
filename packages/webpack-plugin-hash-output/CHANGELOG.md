# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## 0.3.0 - 2021-07-28

### Breaking Change

- `webpack-plugin-hash-ouput` has been removed and deprecated. Its functionality has been moved into `plugin-webpack`.

### Changed

- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/sewing-kit-next/pull/217)]

## 0.2.1 - 2021-07-07

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/sewing-kit-next/pull/210)]

## 0.2.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]

## 0.1.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/sewing-kit-next/pull/170)]

## 0.0.3

### Added

- Started changelog for @sewing-kit/webpack-plugin-hash-output
