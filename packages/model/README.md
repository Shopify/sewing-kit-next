# `@sewing-kit/model`

Sewing-kit parses the shape of a codebase by modeling it into concepts it understands. At a high-level these these concepts are a `Workspace` and `Project`.

### Project

A `Project` can be a either a `Package` (NPM library), `WebApp` (a react app) or `Service` (a Node.js server).

### Workspace

A `Workspace` is a composition of `Project`s. It includes all the `WebApp`, `Package`, and `Services` for a given codebase.

### Base

`Workspace`, `WebApp`, `Package`, and `Service` all extend a `Base` class. The `Base` class provides a number of useful properties for the classes extending it. These include the a root directory, the NPM dependencies used, and an `fs` property which should be used for all `FileSystem` related operations.

## Installation

```
yarn add @sewing-kit/model --dev
```
