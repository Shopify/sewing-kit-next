# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

<!-- ## Unreleased -->

## 0.5.0 - 2021-09-13

### Breaking Change

- Renamed package from `@sewing-kit/plugin-eslint` to `@shopify/loom-plugin-eslint`. [[#247](https://github.com/Shopify/loom/pull/247)]

## 0.4.4 - 2021-09-09

- No updates. Transitive dependency bump.

## 0.4.3 - 2021-09-08

- No updates. Transitive dependency bump.

## 0.4.2 - 2021-07-29

- No updates. Transitive dependency bump.

## 0.4.1 - 2021-07-28

### Changed

- Removed js output from `build/ts` folder. [[#217](https://github.com/Shopify/loom/pull/217)]

## 0.4.0 - 2021-07-07

### Breaking Change

- Added the ability to pass in a `files` option into the plugin. [[#208](https://github.com/Shopify/loom/pull/208)]
- Removed the `ESLintFlags` and `ESLintHooks` exports. [[#208](https://github.com/Shopify/loom/pull/208)]

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/loom/pull/210)]

## 0.3.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/loom/pull/177)]
- Removed `eslintExtensions` hook. ESLint lints files with extensions other than `.js` if they are specified in the lint configs's `overrides` section, so we don't need to control the list of extensions on the command line. [[#199](https://github.com/Shopify/loom/pull/199)]

## 0.2.1 - 2021-06-18

### Changed

- Removed dependency on `@sewing-kit/config` as it is not used [[#187](https://github.com/Shopify/loom/pull/187)]

## 0.2.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/loom/pull/170)]

## 0.1.11 - 2021-04-14

- No updates. Transitive dependency bump.

## 0.1.10 - 2021-04-06

- No updates. Transitive dependency bump.

## 0.1.9 - 2021-03-30

- No updates. Transitive dependency bump.

## 0.1.8 - 2021-03-05

- No updates. Transitive dependency bump.

## 0.1.7

### Added

- Started changelog for @sewing-kit/plugin-eslint
