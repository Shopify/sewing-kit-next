import {
  createProjectPlugin,
  createProjectBuildPlugin,
  createProjectDevPlugin,
  createProjectTestPlugin,
  createComposedProjectPlugin,
  createWorkspacePlugin,
  createWorkspaceBuildPlugin,
  createWorkspaceDevPlugin,
  createWorkspaceTestPlugin,
  createWorkspaceTypeCheckPlugin,
  createWorkspaceLintPlugin,
  createComposedWorkspacePlugin,
  PluginTarget,
  PLUGIN_MARKER,
  SeriesHook,
  ProjectKind,
} from '..';

import {createProjectPluginContext, createProjectTasks} from './utilities';

describe('createProjectPlugin', () => {
  it('creates project plugin object', () => {
    const id = 'project-plugin';
    const run = jest.fn();
    const target = PluginTarget.Project;
    const plugin = createProjectPlugin(id, run);

    expect(plugin).toStrictEqual({id, run, target, [PLUGIN_MARKER]: true});
  });
});

describe('createProjectBuildPlugin', () => {
  it.only('creates project plugin object scoped to build', () => {
    const id = 'project-build-plugin';
    const pluginRunSpy = jest.fn();
    const {run, ...pluginExceptRun} = createProjectBuildPlugin(
      id,
      pluginRunSpy,
    );

    const pluginContext = createProjectPluginContext({
      kind: ProjectKind.Service,
    });

    run!(pluginContext);

    const {build: buildTask} = createProjectTasks();
    pluginContext.tasks.build.run(buildTask as any);

    const {tasks, ...pluginContextWithoutTask} = pluginContext;

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTask,
      ...buildTask,
    });
    expect(pluginExceptRun).toStrictEqual({
      id,
      target: PluginTarget.Project,
      [PLUGIN_MARKER]: true,
    });
  });
});

describe('createProjectDevPlugin', () => {
  it('creates project plugin object scoped to dev', () => {
    const id = 'project-dev-plugin';
    const run = jest.fn();
    const target = PluginTarget.Project;
    const plugin = createProjectDevPlugin(id, run);

    const {run: pluginRun, ...pluginExceptRun} = plugin;
    const pluginContext = {
      tasks: {dev: new SeriesHook()},
      contextArg: 1,
    } as any;

    pluginRun!(pluginContext);

    const [hook] = Array.from(pluginContext.tasks.dev.hooks);
    const task = {options: {taskArg: 1}} as any;

    if (typeof hook === 'function') {
      hook(task);
    }

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith({...task, contextArg: 1});
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createProjectTestPlugin', () => {
  it('creates project plugin object scoped to test', () => {
    const id = 'project-test-plugin';
    const run = jest.fn();
    const target = PluginTarget.Project;
    const plugin = createProjectTestPlugin(id, run);

    const {run: pluginRun, ...pluginExceptRun} = plugin;
    const pluginContext = {
      tasks: {test: new SeriesHook()},
      contextArg: 1,
    } as any;

    pluginRun!(pluginContext);

    const [hook] = Array.from(pluginContext.tasks.test.hooks);
    const task = {options: {taskArg: 1}} as any;

    if (typeof hook === 'function') {
      hook(task);
    }

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith({...task, contextArg: 1});
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createComposedProjectPlugin', () => {
  it('creates project plugin object', () => {
    const id = 'composed-project-plugin';
    const compose = jest.fn();
    const target = PluginTarget.Project;
    const plugin = createComposedProjectPlugin(id, compose);

    expect(plugin).toStrictEqual({id, compose, target, [PLUGIN_MARKER]: true});
  });

  it('creates composed project plugin object', () => {
    const id = 'composed-project-plugin';
    const compose = ['plugin'] as any;
    const target = PluginTarget.Project;
    const plugin = createComposedProjectPlugin(id, compose);

    const {compose: pluginCompose, ...pluginExceptCompose} = plugin;
    const composer = {use: jest.fn()};

    pluginCompose!(composer);

    expect(composer.use).toHaveBeenCalledTimes(1);
    expect(composer.use).toHaveBeenCalledWith('plugin');
    expect(pluginExceptCompose).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });
});

describe('createWorkspacePlugin', () => {
  it('creates workspace plugin object', () => {
    const id = 'workspace-plugin';
    const run = jest.fn();
    const target = PluginTarget.Workspace;
    const plugin = createWorkspacePlugin(id, run);

    expect(plugin).toStrictEqual({id, run, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceBuildPlugin', () => {
  it('creates workspace plugin object scoped to build', () => {
    const id = 'workspace-build-plugin';
    const run = jest.fn();
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceBuildPlugin(id, run);

    const {run: pluginRun, ...pluginExceptRun} = plugin;
    const pluginContext = {
      tasks: {build: new SeriesHook()},
      contextArg: 1,
    } as any;

    pluginRun!(pluginContext);

    const [hook] = Array.from(pluginContext.tasks.build.hooks);
    const task = {options: {taskArg: 1}} as any;

    if (typeof hook === 'function') {
      hook(task);
    }

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith({...task, contextArg: 1});
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceDevPlugin', () => {
  it('creates workspace plugin object scoped to dev', () => {
    const id = 'workspace-dev-plugin';
    const run = jest.fn();
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceDevPlugin(id, run);

    const {run: pluginRun, ...pluginExceptRun} = plugin;
    const pluginContext = {
      tasks: {dev: new SeriesHook()},
      contextArg: 1,
    } as any;

    pluginRun!(pluginContext);

    const [hook] = Array.from(pluginContext.tasks.dev.hooks);
    const task = {options: {taskArg: 1}} as any;

    if (typeof hook === 'function') {
      hook(task);
    }

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith({...task, contextArg: 1});
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceTestPlugin', () => {
  it('creates workspace plugin object scoped to test', () => {
    const id = 'workspace-test-plugin';
    const run = jest.fn();
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceTestPlugin(id, run);

    const {run: pluginRun, ...pluginExceptRun} = plugin;
    const pluginContext = {
      tasks: {test: new SeriesHook()},
      contextArg: 1,
    } as any;

    pluginRun!(pluginContext);

    const [hook] = Array.from(pluginContext.tasks.test.hooks);
    const task = {options: {taskArg: 1}} as any;

    if (typeof hook === 'function') {
      hook(task);
    }

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith({...task, contextArg: 1});
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceTypeCheckPlugin', () => {
  it('creates workspace plugin object scoped to type checking', () => {
    const id = 'workspace-type-check-plugin';
    const run = jest.fn();
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceTypeCheckPlugin(id, run);

    const {run: pluginRun, ...pluginExceptRun} = plugin;
    const pluginContext = {
      tasks: {typeCheck: new SeriesHook()},
      contextArg: 1,
    } as any;

    pluginRun!(pluginContext);

    const [hook] = Array.from(pluginContext.tasks.typeCheck.hooks);
    const task = {options: {taskArg: 1}} as any;

    if (typeof hook === 'function') {
      hook(task);
    }

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith({...task, contextArg: 1});
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceLintPlugin', () => {
  it('creates workspace plugin object scoped to linting', () => {
    const id = 'workspace-lint-plugin';
    const run = jest.fn();
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceLintPlugin(id, run);

    const {run: pluginRun, ...pluginExceptRun} = plugin;
    const pluginContext = {
      tasks: {lint: new SeriesHook()},
      contextArg: 1,
    } as any;

    pluginRun!(pluginContext);

    const [hook] = Array.from(pluginContext.tasks.lint.hooks);
    const task = {options: {taskArg: 1}} as any;

    if (typeof hook === 'function') {
      hook(task);
    }

    expect(run).toHaveBeenCalledTimes(1);
    expect(run).toHaveBeenCalledWith({...task, contextArg: 1});
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createComposedWorkspacePlugin', () => {
  it('creates project plugin object', () => {
    const id = 'composed-workspace-plugin';
    const compose = jest.fn();
    const target = PluginTarget.Workspace;
    const plugin = createComposedWorkspacePlugin(id, compose);

    expect(plugin).toStrictEqual({id, compose, target, [PLUGIN_MARKER]: true});
  });

  it('creates composed project plugin object', () => {
    const id = 'composed-workspace-plugin';
    const compose = ['plugin'] as any;
    const target = PluginTarget.Workspace;
    const plugin = createComposedWorkspacePlugin(id, compose);

    const {compose: pluginCompose, ...pluginExceptCompose} = plugin;
    const composer = {use: jest.fn()};

    pluginCompose!(composer);

    expect(composer.use).toHaveBeenCalledTimes(1);
    expect(composer.use).toHaveBeenCalledWith('plugin');
    expect(pluginExceptCompose).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });
});
