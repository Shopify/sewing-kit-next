import {WorkspacePlugin} from '@sewing-kit/plugins';
import {WorkspaceOptions} from '@sewing-kit/core';
import {BaseBuilder, ConfigurationKind} from './base';

class WorkspaceBuilder extends BaseBuilder<WorkspacePlugin, WorkspaceOptions> {
  constructor() {
    super(ConfigurationKind.Workspace);
  }
}

export function createWorkspace(
  create: (pkg: WorkspaceBuilder) => void | Promise<void>,
) {
  return async () => {
    const builder = new WorkspaceBuilder();
    await create(builder);
    return builder.toOptions();
  };
}
