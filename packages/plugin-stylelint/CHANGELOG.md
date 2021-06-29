# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Breaking Change

- Refactored the plugin so it mimics the behaviour of the eslint and prettier plugins. This plugin now only exposes the `stylelintFlags` hook for controling CLI flags, and configuration of the files glob is done through the `files` option when invoking the plugin. [[#208](https://github.com/Shopify/sewing-kit-next/pull/208)]
- Stylelint no longer runs with `--report-needless-disables` and `--report-invalid-scope-disables` options. These options should be configured [within your stylelint config file](https://stylelint.io/user-guide/configure#reportneedlessdisables) if they are desired. [[#208](https://github.com/Shopify/sewing-kit-next/pull/208)]
- Removed `stylelintExtensions`, `stylelintFlags` and `stylelintIgnorePatterns` exports. [[#208](https://github.com/Shopify/sewing-kit-next/pull/208)]

### Changed

- Reworked how types are exposed to avoid root-level `.d.ts` files. [[#210](https://github.com/Shopify/sewing-kit-next/pull/210)]

## 0.3.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]

## 0.2.1 - 2021-06-18

- No updates. Transitive dependency bump.

## 0.2.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/sewing-kit-next/pull/170)]

## 0.1.10 - 2021-04-14

- No updates. Transitive dependency bump.

## 0.1.9 - 2021-04-06

- No updates. Transitive dependency bump.

## 0.1.8 - 2021-03-30

- No updates. Transitive dependency bump.

## 0.1.7

### Added

- Started changelog for @sewing-kit/plugin-stylelint
