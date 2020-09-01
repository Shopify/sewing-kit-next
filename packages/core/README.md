# `@sewing-kit/core`

A collection of types and classes that form the building blocks of `sewing-kit`. This package is depended upon by several core `sewing-kit` packages, such as [`@sewing-kit/cli`](../packages/cli), [`@sewing-kit/config`](../packages/config), and the like.

Important classes to highlight here are `TargetRuntime` and `TargetBuilder`. In the context of sewing-kit, a _target_ refers to the build output for a given `Project`.

### TargetRuntime

This class provides a static utility, `TargetRuntime.fromProject`, to generate the TargetRuntime for a given `Project`.

### TargetBuilder

This class is foundational to how sewing-kit generates build outputs for a given project. It's heavily used by the `sewing-kit build` CLI command. This class can also be used to plugin authors to generate custom build outputs (eg. multi-browser and multi-locale builds).

## Installation

```
yarn add @sewing-kit/core --dev
```
