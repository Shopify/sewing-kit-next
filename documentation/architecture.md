# Loom Architecture

## Overview

Understanding the architecture about this project is mostly about understanding the problem it seeks to solve. In short, that there is a complex matrix of tasks and tools involved in web development, and loom’s job is to model those concepts in a way that enables us to give web developers a world-class starting point; a set of configuration for those tools that will maximize both end user and developer happiness, and that aligns with the technology bets we are making as a company. At a high-level you can model this matrix using the following categories:

- **Tasks:** when actively working on or verifying a project, we might be linting, testing, type checking, building, developing, or deploying (others might exist too; loom seeks to model them).

- **Projects:** even a single logical "app" might be made up of several components that are treated differently for the purposes of our tasks and tools. Loom currently understands the notion of a service, a web app, and a package, and a repo can conceivably contain as many of each as is appropriate for solving the problem at hand in a way that is ergonomic to the developer.

- **Tools:** some tools are used for a single task, like ESLint for linting. Some are used for multiple tasks, like webpack. Some are languages or other concepts that apply regardless of task, like Sass. Unlike projects and tasks, `loom` does not model tools directly like it does for projects and tasks. Instead, it offers a plugin API that can be used to connect tools to the tasks and projects with appropriate configuration, and even to expose API for other plugins to configure behavior in a flexible way.

With this understanding in mind, we can translate these concepts into various Core packages with each package owning a portion of the above mentioned categories.

## Loom Core

The contents of the `@shopify/loom` pacakge enables core loom orchestration. This package does not include any tool specific knowledge. Tool specific functionalities are enabled entirely through [Loom Plugins](./plugins.md)

`@shopify/loom`'s source is split into 5 subdirectories:

### `core`

The core directory currently provides two key features:

1. The definition of the core model of loom: `Workspace`, `WebApp`, `Package`, and `Service`
2. The instructions for the different tasks loom can perform. Given a set of options, a root object, and (usually) a `Workspace`, loom provides a function that can create and run the appropriate hooks for completing tasks.

### `tasks`

This directory provides a collection of interfaces that describe the different commands (eg. dev, build, lint, test, type-check) loom supports. This package is integrated closely with hooks to create the intersection between hooks and Project/Workspaces.

### `plugins`

This directory provides API for building Loom plugins. The APIs provided here are what enable Loom to have all its features entirely through plugins. They provide abstractions to provide functionality into whichever tasks a given plugin is concerned with.

### `hooks`

This directory defines most of the core types for loom. Of particular note, many of the hook objects used as part of various loom tasks rely on this package to give them the object shape. This separation is done so that plugins can "augment" the hook typings, allowing them to add additional hooks in a type-safe way.

### `config`

The config directory provides the utilities for loading and validating `loom.config` files. It also provides the APIs which config files use to declare configuration in a clean, type-safe way. Any single Loom config can be authored with one of the following provided functions: `createWorkspace`, `createPackage`, `createWebApp` or `createService`.

## `@shopify/loom-cli`

The CLI takes the task functions from `@shopify/loom` and embeds them in a CLI. Because `@shopify/loom` does most of the heavy lifting, this package is just a fairly simple layer that translates CLI arguments into options for the task functions to run.

TODO (this was recently moved, `core` needs to change too):

This package provides a set of utilities for managing the UI of the CLI. It also provides implementation for a core concept of several tasks: steps. Steps are pieces of code that can be run with the UI context, and also support things many tasks need, like the ability to dynamically skip certain tasks based on command-line flags. The `ui` package also provides a default runner for steps, which creates a stateful representation of steps being run and prints them to the terminal. This is useful for tasks that follow a "configure, create steps, run steps" pattern, like building, linting, and testing. Finally, this package provides `DiagnosticError`, a base class for errors that can be elegantly displayed (with troubleshooting information), and that should be used for all errors thrown in the system.
