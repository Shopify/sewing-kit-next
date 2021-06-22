# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]
- Removed `eslintExtensions` hook. ESLint lints files with extensions other than `.js` if they are specified in the lint configs's `overrides` section, so we don't need to control the list of extensions on the command line.

## 0.2.1 - 2021-06-18

### Changed

- Removed dependency on `@sewing-kit/config` as it is not used [[#187](https://github.com/Shopify/sewing-kit-next/pull/187)]

## 0.2.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/sewing-kit-next/pull/170)]

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
