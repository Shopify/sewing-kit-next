# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## Unreleased

### Changed

- Added package metadata and limit files included in packages. Ensure `*.tsbuildinfo` files are absent to greatly shink package size. [[#177](https://github.com/Shopify/sewing-kit-next/pull/177)]
- Removed `workspaceGraphQL` plugin. This was only used for adding extensions to eslint, which is no longer required as graphql files can be included in linting by modifying ESLint config files.

## 0.2.1 - 2021-06-18

- No updates. Transitive dependency bump.

## 0.2.0 - 2021-05-20

### Breaking Change

- Update minimum supported node version to 12.14.0. Add engines field to help enforce usage of this version. [[#170](https://github.com/Shopify/sewing-kit-next/pull/170)]

## 0.1.30 - 2021-04-14

- No updates. Transitive dependency bump.

## 0.1.29 - 2021-04-07

### Changed

- Change `optionalDependencies` to `peerDependencies [[#125](https://github.com/Shopify/sewing-kit-next/pull/125/files)]

## 0.1.28 - 2021-04-06

- No updates. Transitive dependency bump.

## 0.1.27 - 2021-03-30

- No updates. Transitive dependency bump.

## 0.1.26 - 2021-03-05

- No updates. Transitive dependency bump.

## 0.1.25

### Added

- Started changelog for @sewing-kit/plugin-graphql
