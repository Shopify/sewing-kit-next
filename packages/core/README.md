# `@sewing-kit/core`

A collection of types and classes that form the building blocks of `sewing-kit`. This package is depended upon by several core `sewing-kit` packages, such as [`@sewing-kit/cli`](../cli), [`@sewing-kit/config`](../config), and the like.

Important classes to highlight here are `TargetRuntime` and `TargetBuilder`. In the context of sewing-kit, a _target_ refers to the build output for a given [`Project`](../model#project).

### TargetRuntime

The `TargetRuntime` class contains information about the runtime for a build target (eg. Does the build run in a Node.js or browser runtime?). This class provides a static utility, `TargetRuntime.fromProject`, to generate the TargetRuntime for a given `Project`.

### TargetBuilder

This class is foundational to how sewing-kit generates build outputs for a given project. It's heavily used by the `sewing-kit build` CLI command. This class can also be used to plugin authors to generate custom build outputs (eg. multi-browser and multi-locale builds).

## Installation

```
yarn add @sewing-kit/core --dev
```
