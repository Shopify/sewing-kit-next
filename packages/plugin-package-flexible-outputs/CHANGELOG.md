# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking Changes

This plugin now uses `plugin-rollup` for building JS. Build targets are no longer inferred from a browserslist configuration. You will need to add two new required parameters - `nodeTargets` and `browserTargets` when you call `buildFlexibleOutputs` to specify build targets. All other options remain the same. For `browserTargets` in Shopify projects we recommend extending from [`@shopify/browserslist-config`](https://github.com/Shopify/web-configs/tree/main/packages/browserslist-config).

```diff
buildFlexibleOutputs({
+  browserTargets: 'defaults',
+  nodeTargets: 'maintained node versions',
}),
```

## [0.1.28] - 2021-04-21

- No updates. Transitive dependency bump.

## [0.1.27] - 2021-04-14

- No updates. Transitive dependency bump.

## [0.1.26] - 2021-04-07

- No updates. Transitive dependency bump.

## [0.1.25] - 2021-04-06

- No updates. Transitive dependency bump.

## [0.1.24] - 2021-03-30

- No updates. Transitive dependency bump.

## [0.1.23] - 2021-03-05

- No updates. Transitive dependency bump.

## [0.1.22]

### Added

- Started changelog for @sewing-kit/plugin-package-flexible-outputs
