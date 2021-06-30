# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Breaking Change

- Removed package. the contents of this package is now provided by `@sewing-kit/core`.

## 0.3.0 - 2021-06-25

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]
- Remove unused dependency on `@babel/core` [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]

## 0.2.1 - 2021-06-18

- No updates. Transitive dependency bump.

## 0.2.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/sewing-kit-next/pull/170)]

### Changed

- Updated babel dependency to 7.14. [[#170](https://github.com/Shopify/sewing-kit-next/pull/170)]
- Updated babel dependency to 7.13. [[#148](https://github.com/Shopify/sewing-kit-next/pull/148)]

## 0.1.12 - 2021-04-14

- No updates. Transitive dependency bump.

## 0.1.11 - 2021-04-06

- No updates. Transitive dependency bump.

## 0.1.10 - 2021-03-30

- No updates. Transitive dependency bump.

## 0.1.9 - 2021-03-05

### Changed

- Support `sewing-kit-next.config.*` config as well ([#117](https://github.com/Shopify/sewing-kit-next/pull/117))
- no-op when detecting legacy sewing-kit (SK0) config ([#117](https://github.com/Shopify/sewing-kit-next/pull/117))

## 0.1.8

### Added

- Started changelog for @sewing-kit/config
