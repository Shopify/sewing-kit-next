# `tasks`

`tasks` provides a number of helpful types and interfaces that describe the kinds of things that `sewing-kit` can do for your workspace.

This folder is closely tied with and extends from [`hooks`](../hooks/README.md) and the interfaces it provides.

## Tasks

Tasks are what `sewing-kit` runs against your codebase to perform a variety of things, such as linting, building, and testing. At a high level, `sewing-kit` distinguishes between `WorkspaceTasks` (which apply to the entire workspace) and `ProjectTasks` (which apply to the individual projects within a workspace).

- `WorkspaceTasks`
  - Building (`BuildWorkspaceTask`)
  - Running a development server (`DevWorkspaceTask`)
  - Testing (`TestWorkspaceTask`)
  - Linting (`LintWorkspaceTask`)
  - Type-checking (`TypeCheckWorkspaceTask`)
- `ProjectTasks`
  - Building (`BuildProjectTask`)
  - Running a develoment server (`DevProjectTask`)
  - Testing (`TestProjectTask`)

A task (e.g. `build`, `dev`, `test`) is made up of options and [hooks](../hooks/README.md). Options exist to configure the task, and can be passed in through [`sewing-kit`'s CLI](../../../cli/README.md) and propagated through the hooks to relevant plugins. Tasks' hooks expose a way for plugins (either `@sewing-kit`'s or your own) to tap into and customize and define `sewing-kit`'s behaviour.