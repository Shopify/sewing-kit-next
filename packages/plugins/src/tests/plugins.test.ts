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
} from '..';

import {
  createProjectPluginContext,
  createWorkspacePluginContext,
} from './utilities';

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
  it('creates project plugin object scoped to build', () => {
    const id = 'project-build-plugin';
    const target = PluginTarget.Project;
    const pluginRunSpy = jest.fn();
    const plugin = createProjectBuildPlugin(id, pluginRunSpy);
    const {run, ...pluginExceptRun} = plugin;

    const pluginContext = createProjectPluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.build.run(tasks.build as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.build,
    });
    expect(pluginExceptRun).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });
});

describe('createProjectDevPlugin', () => {
  it('creates project plugin object scoped to dev', () => {
    const id = 'project-dev-plugin';
    const target = PluginTarget.Project;
    const pluginRunSpy = jest.fn();
    const plugin = createProjectDevPlugin(id, pluginRunSpy);
    const {run, ...pluginExceptRun} = plugin;

    const pluginContext = createProjectPluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.dev.run(tasks.dev as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.dev,
    });
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createProjectTestPlugin', () => {
  it('creates project plugin object scoped to test', () => {
    const id = 'project-test-plugin';
    const target = PluginTarget.Project;
    const pluginRunSpy = jest.fn();
    const plugin = createProjectTestPlugin(id, pluginRunSpy);
    const {run, ...pluginExceptRun} = plugin;

    const pluginContext = createProjectPluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.test.run(tasks.test as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.test,
    });
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
    const compose = [createProjectPlugin('project-plugin', jest.fn())];
    const target = PluginTarget.Project;
    const plugin = createComposedProjectPlugin(id, compose);

    const {compose: pluginCompose, ...pluginExceptCompose} = plugin;
    const composer = {use: jest.fn()};

    pluginCompose!(composer);

    expect(composer.use).toHaveBeenCalledTimes(1);
    expect(composer.use).toHaveBeenCalledWith(...compose);
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
    const target = PluginTarget.Workspace;
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceBuildPlugin(id, pluginRunSpy);
    const {run, ...pluginExceptRun} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.build.run(tasks.build as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.build,
    });
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceDevPlugin', () => {
  it('creates workspace plugin object scoped to dev', () => {
    const id = 'workspace-dev-plugin';
    const target = PluginTarget.Workspace;
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceDevPlugin(id, pluginRunSpy);
    const {run, ...pluginExceptRun} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.dev.run(tasks.dev as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.dev,
    });
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceTestPlugin', () => {
  it('creates workspace plugin object scoped to test', () => {
    const id = 'workspace-test-plugin';
    const target = PluginTarget.Workspace;
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceTestPlugin(id, pluginRunSpy);
    const {run, ...pluginExceptRun} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.test.run(tasks.test as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.test,
    });
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceTypeCheckPlugin', () => {
  it('creates workspace plugin object scoped to type checking', () => {
    const id = 'workspace-type-check-plugin';
    const target = PluginTarget.Workspace;
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceTypeCheckPlugin(id, pluginRunSpy);
    const {run, ...pluginExceptRun} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.typeCheck.run(tasks.typeCheck as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.typeCheck,
    });
    expect(pluginExceptRun).toStrictEqual({id, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceLintPlugin', () => {
  it('creates workspace plugin object scoped to linting', () => {
    const id = 'workspace-lint-plugin';
    const target = PluginTarget.Workspace;
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceLintPlugin(id, pluginRunSpy);
    const {run, ...pluginExceptRun} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.lint.run(tasks.lint as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.lint,
    });
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
    const compose = [createWorkspacePlugin('workspace-plugin', jest.fn())];
    const target = PluginTarget.Workspace;
    const plugin = createComposedWorkspacePlugin(id, compose);

    const {compose: pluginCompose, ...pluginExceptCompose} = plugin;
    const composer = {use: jest.fn()};

    pluginCompose!(composer);

    expect(composer.use).toHaveBeenCalledTimes(1);
    expect(composer.use).toHaveBeenCalledWith(...compose);
    expect(pluginExceptCompose).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });
});
