import {Workspace, Project} from '../core';
import {WorkspacePlugin, ProjectPlugin} from '../plugins';

export interface PluginSource {
  pluginsForWorkspace(workspace: Workspace): ReadonlyArray<WorkspacePlugin>;
  pluginsForProject<TType extends Project>(
    project: Project,
  ): ReadonlyArray<ProjectPlugin<TType>>;
  ancestorsForPlugin<TPlugin extends ProjectPlugin<any> | WorkspacePlugin>(
    plugin: TPlugin,
  ): ReadonlyArray<TPlugin>;
}
