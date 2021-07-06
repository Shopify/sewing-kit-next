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
} from '../plugins';

import {
  createProjectPluginContext,
  createWorkspacePluginContext,
} from './utilities/plugins';

describe('createProjectPlugin', () => {
  const id = 'project-plugin';

  it('creates project plugin object', () => {
    const run = jest.fn();
    const target = PluginTarget.Project;
    const plugin = createProjectPlugin(id, run);

    expect(plugin).toStrictEqual({id, run, target, [PLUGIN_MARKER]: true});
  });
});

describe('createProjectBuildPlugin', () => {
  const id = 'project-build-plugin';

  it('creates project plugin object', () => {
    const target = PluginTarget.Project;
    const plugin = createProjectBuildPlugin(id, jest.fn());
    const {run, ...pluginExceptRun} = plugin;

    expect(pluginExceptRun).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });

  it('scopes project plugin run to build', () => {
    const pluginRunSpy = jest.fn();
    const plugin = createProjectBuildPlugin(id, pluginRunSpy);
    const {run} = plugin;

    const pluginContext = createProjectPluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.build.run(tasks.build as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.build,
    });
  });
});

describe('createProjectDevPlugin', () => {
  const id = 'project-dev-plugin';

  it('creates project plugin object', () => {
    const target = PluginTarget.Project;
    const plugin = createProjectDevPlugin(id, jest.fn());
    const {run, ...pluginExceptRun} = plugin;

    expect(pluginExceptRun).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });

  it('scopes project plugin run to dev', () => {
    const pluginRunSpy = jest.fn();
    const plugin = createProjectDevPlugin(id, pluginRunSpy);
    const {run} = plugin;

    const pluginContext = createProjectPluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.dev.run(tasks.dev as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.dev,
    });
  });
});

describe('createProjectTestPlugin', () => {
  const id = 'project-test-plugin';

  it('creates project plugin object', () => {
    const target = PluginTarget.Project;
    const plugin = createProjectTestPlugin(id, jest.fn());
    const {run, ...pluginExceptRun} = plugin;

    expect(pluginExceptRun).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });

  it('scopes project plugin run to test', () => {
    const pluginRunSpy = jest.fn();
    const plugin = createProjectTestPlugin(id, pluginRunSpy);
    const {run} = plugin;

    const pluginContext = createProjectPluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.test.run(tasks.test as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.test,
    });
  });
});

describe('createComposedProjectPlugin', () => {
  const id = 'composed-project-plugin';

  it('creates project plugin object', () => {
    const compose = jest.fn();
    const target = PluginTarget.Project;
    const plugin = createComposedProjectPlugin(id, compose);

    expect(plugin).toStrictEqual({id, compose, target, [PLUGIN_MARKER]: true});
  });

  describe('with compose array', () => {
    it('creates project plugin object', () => {
      const compose = [createProjectPlugin('project-plugin', jest.fn())];
      const target = PluginTarget.Project;
      const plugin = createComposedProjectPlugin(id, compose);

      const {compose: pluginCompose, ...pluginExceptCompose} = plugin;
      const composer = {use: jest.fn()};

      pluginCompose!(composer);

      expect(pluginExceptCompose).toStrictEqual({
        id,
        target,
        [PLUGIN_MARKER]: true,
      });
    });

    it('composes project plugin', () => {
      const compose = [createProjectPlugin('project-plugin', jest.fn())];
      const plugin = createComposedProjectPlugin(id, compose);

      const {compose: pluginCompose} = plugin;
      const composer = {use: jest.fn()};

      pluginCompose!(composer);

      expect(composer.use).toHaveBeenCalledTimes(1);
      expect(composer.use).toHaveBeenCalledWith(...compose);
    });
  });
});

describe('createWorkspacePlugin', () => {
  const id = 'workspace-plugin';

  it('creates workspace plugin object', () => {
    const run = jest.fn();
    const target = PluginTarget.Workspace;
    const plugin = createWorkspacePlugin(id, run);

    expect(plugin).toStrictEqual({id, run, target, [PLUGIN_MARKER]: true});
  });
});

describe('createWorkspaceBuildPlugin', () => {
  const id = 'workspace-build-plugin';

  it('creates workspace plugin object', () => {
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceBuildPlugin(id, jest.fn());
    const {run, ...pluginExceptRun} = plugin;

    expect(pluginExceptRun).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });

  it('scopes workspace plugin run to build', () => {
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceBuildPlugin(id, pluginRunSpy);
    const {run} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.build.run(tasks.build as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.build,
    });
  });
});

describe('createWorkspaceDevPlugin', () => {
  const id = 'workspace-dev-plugin';

  it('creates workspace plugin object', () => {
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceDevPlugin(id, jest.fn());
    const {run, ...pluginExceptRun} = plugin;

    expect(pluginExceptRun).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });

  it('scopes workspace plugin run to dev', () => {
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceDevPlugin(id, pluginRunSpy);
    const {run} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.dev.run(tasks.dev as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.dev,
    });
  });
});

describe('createWorkspaceTestPlugin', () => {
  const id = 'workspace-test-plugin';

  it('creates workspace plugin object', () => {
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceTestPlugin(id, jest.fn());
    const {run, ...pluginExceptRun} = plugin;

    expect(pluginExceptRun).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });

  it('scopes workspace plugin run to test', () => {
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceTestPlugin(id, pluginRunSpy);
    const {run} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.test.run(tasks.test as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.test,
    });
  });
});

describe('createWorkspaceTypeCheckPlugin', () => {
  const id = 'workspace-type-check-plugin';

  it('creates workspace plugin object', () => {
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceTypeCheckPlugin(id, jest.fn());
    const {run, ...pluginExceptRun} = plugin;

    expect(pluginExceptRun).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });

  it('scopes workspace plugin run to type checking', () => {
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceTypeCheckPlugin(id, pluginRunSpy);
    const {run} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.typeCheck.run(tasks.typeCheck as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.typeCheck,
    });
  });
});

describe('createWorkspaceLintPlugin', () => {
  const id = 'workspace-lint-plugin';

  it('creates workspace plugin object', () => {
    const target = PluginTarget.Workspace;
    const plugin = createWorkspaceLintPlugin(id, jest.fn());
    const {run, ...pluginExceptRun} = plugin;

    expect(pluginExceptRun).toStrictEqual({
      id,
      target,
      [PLUGIN_MARKER]: true,
    });
  });

  it('scopes workspace plugin run to linting', () => {
    const pluginRunSpy = jest.fn();
    const plugin = createWorkspaceLintPlugin(id, pluginRunSpy);
    const {run} = plugin;

    const pluginContext = createWorkspacePluginContext();
    const {tasks, ...pluginContextWithoutTasks} = pluginContext;

    run!(pluginContext);
    pluginContext.tasks.lint.run(tasks.lint as any);

    expect(pluginRunSpy).toHaveBeenCalledTimes(1);
    expect(pluginRunSpy).toHaveBeenCalledWith({
      ...pluginContextWithoutTasks,
      ...tasks.lint,
    });
  });
});

describe('createComposedWorkspacePlugin', () => {
  const id = 'composed-workspace-plugin';

  it('creates workspace plugin object', () => {
    const compose = jest.fn();
    const target = PluginTarget.Workspace;
    const plugin = createComposedWorkspacePlugin(id, compose);

    expect(plugin).toStrictEqual({id, compose, target, [PLUGIN_MARKER]: true});
  });

  describe('with compose array', () => {
    it('creates workspace plugin object', () => {
      const compose = [createWorkspacePlugin('workspace-plugin', jest.fn())];
      const target = PluginTarget.Workspace;
      const plugin = createComposedWorkspacePlugin(id, compose);

      const {compose: pluginCompose, ...pluginExceptCompose} = plugin;
      const composer = {use: jest.fn()};

      pluginCompose!(composer);

      expect(pluginExceptCompose).toStrictEqual({
        id,
        target,
        [PLUGIN_MARKER]: true,
      });
    });

    it('composes workspace plugin', () => {
      const compose = [createWorkspacePlugin('workspace-plugin', jest.fn())];
      const plugin = createComposedWorkspacePlugin(id, compose);

      const {compose: pluginCompose} = plugin;
      const composer = {use: jest.fn()};

      pluginCompose!(composer);

      expect(composer.use).toHaveBeenCalledTimes(1);
      expect(composer.use).toHaveBeenCalledWith(...compose);
    });
  });
});
