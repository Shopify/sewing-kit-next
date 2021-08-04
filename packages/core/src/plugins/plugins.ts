import {Project, WebApp, Package, Service, Workspace} from '../core';
import {
  ProjectTasks,
  WorkspaceTasks,
  DevProjectTask,
  DevWorkspaceTask,
  TestProjectTask,
  TestWorkspaceTask,
  BuildProjectTask,
  BuildWorkspaceTask,
  LintWorkspaceTask,
  TypeCheckWorkspaceTask,
} from '../tasks';

import {PluginApi} from './api';

export const PLUGIN_MARKER = Symbol.for('SewingKit.Plugin');

export enum PluginTarget {
  Project,
  Workspace,
}

interface BasePlugin {
  readonly id: string;
  readonly target: PluginTarget;
  readonly [PLUGIN_MARKER]: true;
  readonly parent?: BasePlugin;
}

export interface PluginComposer<TPlugin extends BasePlugin> {
  use(...plugins: (TPlugin | false | undefined | null)[]): void;
}

export interface ProjectPluginContext<TType extends Project> {
  readonly api: PluginApi;
  readonly tasks: ProjectTasks<TType>;
  readonly project: TType;
  readonly workspace: Workspace;
}

export interface ProjectPlugin<TType extends Project = Project>
  extends BasePlugin {
  readonly target: PluginTarget.Project;
  readonly parent?: ProjectPlugin<Project>;
  run?(context: ProjectPluginContext<TType>): any;
  compose?(composer: PluginComposer<ProjectPlugin<TType>>): any;
}

export interface WorkspacePluginContext {
  readonly api: PluginApi;
  readonly tasks: WorkspaceTasks;
  readonly workspace: Workspace;
}

export interface WorkspacePlugin extends BasePlugin {
  readonly target: PluginTarget.Workspace;
  readonly parent?: WorkspacePlugin;
  run?(context: WorkspacePluginContext): any;
  compose?(composer: PluginComposer<WorkspacePlugin>): any;
}

export type AnyPlugin = ProjectPlugin<Project> | WorkspacePlugin;

export function createProjectPlugin<
  TType extends Project = WebApp | Service | Package
>(
  id: BasePlugin['id'],
  run: NonNullable<ProjectPlugin<TType>['run']>,
): ProjectPlugin<TType> {
  return {id, run, target: PluginTarget.Project, [PLUGIN_MARKER]: true};
}

export const createProjectBuildPlugin = <
  TType extends Project = WebApp | Service | Package
>(
  id: BasePlugin['id'],
  run: (
    context: Omit<ProjectPluginContext<TType>, 'tasks'> &
      BuildProjectTask<TType>,
  ) => void | Promise<void>,
) =>
  createProjectPlugin<TType>(id, ({tasks, ...context}) => {
    tasks.build.hook((task) => run({...context, ...task}));
  });

export const createProjectDevPlugin = <
  TType extends Project = WebApp | Service | Package
>(
  id: BasePlugin['id'],
  run: (
    context: Omit<ProjectPluginContext<TType>, 'tasks'> & DevProjectTask<TType>,
  ) => void | Promise<void>,
) =>
  createProjectPlugin<TType>(id, ({tasks, ...context}) => {
    tasks.dev.hook((task) => run({...context, ...task}));
  });

export const createProjectTestPlugin = <
  TType extends Project = WebApp | Service | Package
>(
  id: BasePlugin['id'],
  run: (
    context: Omit<ProjectPluginContext<TType>, 'tasks'> &
      TestProjectTask<TType>,
  ) => void | Promise<void>,
) =>
  createProjectPlugin<TType>(id, ({tasks, ...context}) => {
    tasks.test.hook((task) => run({...context, ...task}));
  });

export function createComposedProjectPlugin<
  TType extends Project = WebApp | Service | Package
>(
  id: BasePlugin['id'],
  pluginsOrCompose:
    | ReadonlyArray<ProjectPlugin<TType> | false | null | undefined>
    | NonNullable<ProjectPlugin<TType>['compose']>,
): ProjectPlugin<TType> {
  const compose: NonNullable<ProjectPlugin<TType>['compose']> =
    typeof pluginsOrCompose === 'function'
      ? pluginsOrCompose
      : (composer) => {
          for (const plugin of pluginsOrCompose) {
            if (plugin) composer.use(plugin);
          }
        };

  return {id, compose, target: PluginTarget.Project, [PLUGIN_MARKER]: true};
}

export function createWorkspacePlugin(
  id: BasePlugin['id'],
  run: NonNullable<WorkspacePlugin['run']>,
): WorkspacePlugin {
  return {id, run, target: PluginTarget.Workspace, [PLUGIN_MARKER]: true};
}

export const createWorkspaceBuildPlugin = (
  id: BasePlugin['id'],
  run: (
    context: Omit<WorkspacePluginContext, 'tasks'> & BuildWorkspaceTask,
  ) => void | Promise<void>,
) =>
  createWorkspacePlugin(id, ({tasks, ...context}) => {
    tasks.build.hook((task) => run({...context, ...task}));
  });

export const createWorkspaceDevPlugin = (
  id: BasePlugin['id'],
  run: (
    context: Omit<WorkspacePluginContext, 'tasks'> & DevWorkspaceTask,
  ) => void | Promise<void>,
) =>
  createWorkspacePlugin(id, ({tasks, ...context}) => {
    tasks.dev.hook((task) => run({...context, ...task}));
  });

export const createWorkspaceTestPlugin = (
  id: BasePlugin['id'],
  run: (
    context: Omit<WorkspacePluginContext, 'tasks'> & TestWorkspaceTask,
  ) => void | Promise<void>,
) =>
  createWorkspacePlugin(id, ({tasks, ...context}) => {
    tasks.test.hook((task) => run({...context, ...task}));
  });

export const createWorkspaceTypeCheckPlugin = (
  id: BasePlugin['id'],
  run: (
    context: Omit<WorkspacePluginContext, 'tasks'> & TypeCheckWorkspaceTask,
  ) => void | Promise<void>,
) =>
  createWorkspacePlugin(id, ({tasks, ...context}) => {
    tasks.typeCheck.hook((task) => run({...context, ...task}));
  });

export const createWorkspaceLintPlugin = (
  id: BasePlugin['id'],
  run: (
    context: Omit<WorkspacePluginContext, 'tasks'> & LintWorkspaceTask,
  ) => void | Promise<void>,
) =>
  createWorkspacePlugin(id, ({tasks, ...context}) => {
    tasks.lint.hook((task) => run({...context, ...task}));
  });

export function createComposedWorkspacePlugin(
  id: BasePlugin['id'],
  pluginsOrCompose:
    | ReadonlyArray<WorkspacePlugin | false | null | undefined>
    | NonNullable<WorkspacePlugin['compose']>,
): WorkspacePlugin {
  const compose: NonNullable<WorkspacePlugin['compose']> =
    typeof pluginsOrCompose === 'function'
      ? pluginsOrCompose
      : (composer) => {
          for (const plugin of pluginsOrCompose) {
            if (plugin) composer.use(plugin);
          }
        };

  return {id, compose, target: PluginTarget.Workspace, [PLUGIN_MARKER]: true};
}
