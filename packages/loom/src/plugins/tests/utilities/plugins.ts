import {
  Project,
  Service,
  WebApp,
  Package,
  ProjectKind,
  Workspace,
} from '../../../core';
import {SeriesHook} from '../../../hooks';
import {
  BuildProjectTask,
  DevProjectTask,
  TestProjectTask,
  ProjectTasks,
  WorkspaceTasks,
} from '../../../tasks';
import {WorkspacePluginContext, ProjectPluginContext} from '../../plugins';

function createProjectTasks(): ProjectTasks<Project> {
  return {
    build: new SeriesHook<BuildProjectTask<Project>>(),
    dev: new SeriesHook<DevProjectTask<Project>>(),
    test: new SeriesHook<TestProjectTask<Project>>(),
  };
}

function createWorkspaceTasks(): WorkspaceTasks {
  return {
    build: new SeriesHook(),
    dev: new SeriesHook(),
    test: new SeriesHook(),
    lint: new SeriesHook(),
    typeCheck: new SeriesHook(),
  };
}

export function createProjectPluginContext(
  {
    kind,
  }: {
    kind: ProjectKind;
  } = {
    kind: ProjectKind.Service,
  },
): ProjectPluginContext<Project> {
  let project: Project;

  if (kind === ProjectKind.Package) {
    project = new Package({name: '', root: ''});
  } else if (kind === ProjectKind.WebApp) {
    project = new WebApp({name: '', root: ''});
  } else {
    project = new Service({name: '', root: ''});
  }

  return {
    api: {
      read: jest.fn(),
      write: jest.fn(),
      resolvePath: jest.fn(),
      configPath: jest.fn(),
      cachePath: jest.fn(),
      tmpPath: jest.fn(),
      createStep: jest.fn(),
    },
    tasks: createProjectTasks(),
    project,
    workspace: new Workspace({
      name: '',
      root: '',
      webApps: [],
      packages: [],
      services: [],
    }),
  };
}

export function createWorkspacePluginContext(): WorkspacePluginContext {
  const workspace = new Workspace({
    name: '',
    root: '',
    webApps: [],
    packages: [],
    services: [],
  });

  return {
    api: {
      read: jest.fn(),
      write: jest.fn(),
      resolvePath: jest.fn(),
      configPath: jest.fn(),
      cachePath: jest.fn(),
      tmpPath: jest.fn(),
      createStep: jest.fn(),
    },
    tasks: createWorkspaceTasks(),
    workspace,
  };
}
