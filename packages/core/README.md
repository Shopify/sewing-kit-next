# `@sewing-kit/core`

## Modeling

Loom parses the shape of a codebase by modeling it into concepts it understands. At a high-level these these concepts are a `Workspace` and `Project`.

### Project

A `Project` can be a either a `Package` (NPM library), `WebApp` (a react app) or `Service` (a Node.js server).

### Workspace

A `Workspace` is a composition of `Project`s. It includes all the `WebApp`, `Package`, and `Services` for a given codebase.

### Base

`Workspace`, `WebApp`, `Package`, and `Service` all extend a `Base` class. The `Base` class provides a number of useful properties for the classes extending it. These include the a root directory, the NPM dependencies used, and an `fs` property which should be used for all `FileSystem` related operations.

## Core

Important classes to highlight here are `TargetRuntime` and `TargetBuilder`. In the context of loom, a _target_ refers to the build output for a given [`Project`](#project).

### TargetRuntime

The `TargetRuntime` class contains information about the runtime for a build target (eg. Does the build run in a Node.js or browser runtime?). This class provides a static utility, `TargetRuntime.fromProject`, to generate the TargetRuntime for a given `Project`.

### TargetBuilder

This class is foundational to how loom generates build outputs for a given project. It's heavily used by the `loom build` CLI command. This class can also be used to plugin authors to generate custom build outputs (eg. multi-browser and multi-locale builds).

## Installation

```sh
yarn add @sewing-kit/core --dev
```
