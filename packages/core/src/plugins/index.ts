export {DiagnosticError, LogLevel, TargetBuilder, TargetRuntime} from '../core';
export type {Loggable, Step, StepResources, StepStdio, Target} from '../core';
export {Task, Env} from '../tasks';
export type {WorkspaceTasks, ProjectTasks} from '../tasks';
export {SeriesHook, WaterfallHook} from '../hooks';
export {
  ProjectKind,
  Package,
  PackageBinary,
  PackageEntry,
  Service,
  WebApp,
  Workspace,
  Runtime,
} from '../core';
export type {Project} from '../core';

export type {PluginApi} from './api';
export {
  PLUGIN_MARKER,
  PluginTarget,
  createComposedProjectPlugin,
  createComposedWorkspacePlugin,
  createProjectBuildPlugin,
  createProjectDevPlugin,
  createProjectPlugin,
  createProjectTestPlugin,
  createWorkspaceBuildPlugin,
  createWorkspaceDevPlugin,
  createWorkspaceLintPlugin,
  createWorkspacePlugin,
  createWorkspaceTestPlugin,
  createWorkspaceTypeCheckPlugin,
} from './plugins';
export type {
  AnyPlugin,
  PluginComposer,
  ProjectPlugin,
  ProjectPluginContext,
  WorkspacePlugin,
  WorkspacePluginContext,
} from './plugins';
export {
  toArgs,
  addHooks,
  projectTypeSwitch,
  unwrapPossibleGetter,
  unwrapPossibleArrayGetter,
} from './utilities';
export type {ValueOrArray, ValueOrGetter} from './utilities';
export {MissingPluginError} from './errors';
