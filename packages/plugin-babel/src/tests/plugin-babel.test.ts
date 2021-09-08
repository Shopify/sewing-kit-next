import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

const echoConfigFunctionString = `function echoConfig() {
  return createProjectBuildPlugin('Test', ({api, hooks}) => {
    hooks.target.hook(({hooks}) => {
      hooks.steps.hook(async (steps,configuration) => [
        ...steps,
        api.createStep(
          {id:'Test', label:'Test'},
          async (stepRunner) => {
            stepRunner.log(
              "BabelConfig: " + JSON.stringify(await configuration.babelConfig.run({})),
              {level: LogLevel.Info},
            );
          }
        )
      ])
    });
  });
}`;

describe('@sewing-kit/plugin-babel', () => {
  it('starts with an empty config', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, createProjectBuildPlugin, LogLevel} from '@sewing-kit/core';
        import {babel} from '@sewing-kit/plugin-babel';
        export default createPackage((pkg) => {
          pkg.use(
            babel(),
            echoConfig()
          );
        });
        ${echoConfigFunctionString}
      `);

      const result = await workspace.run('build');

      expect(result.stdout).toContain('BabelConfig: {}');
    });
  });

  it('sets config with an object', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, createProjectBuildPlugin, LogLevel} from '@sewing-kit/core';
        import {babel} from '@sewing-kit/plugin-babel';
        export default createPackage((pkg) => {
          pkg.use(
            babel({config: {presets: ['my-plugin']}}),
            echoConfig()
          );
        });
        ${echoConfigFunctionString}
      `);

      const result = await workspace.run('build');
      const expectedConfig = {presets: ['my-plugin']};
      expect(result.stdout).toContain(
        `BabelConfig: ${JSON.stringify(expectedConfig)}`,
      );
    });
  });

  it('sets config with a builder function', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, createProjectBuildPlugin, LogLevel} from '@sewing-kit/core';
        import {babel} from '@sewing-kit/plugin-babel';
        export default createPackage((pkg) => {
          pkg.use(
            babel({
              config(oldConfig) {
                return {presets: ['my-plugin']};
              }
            }),
            echoConfig()
          );
        });
        ${echoConfigFunctionString}
      `);

      const result = await workspace.run('build');
      const expectedConfig = {presets: ['my-plugin']};
      expect(result.stdout).toContain(
        `BabelConfig: ${JSON.stringify(expectedConfig)}`,
      );
    });
  });

  it('setting config with an object overides prior config', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, createProjectBuildPlugin, LogLevel} from '@sewing-kit/core';
        import {babel} from '@sewing-kit/plugin-babel';
        export default createPackage((pkg) => {
          pkg.use(
            babel({
              config: {presets: ['my-plugin']}
            }),
            babel({
              config: {presets: ['my-new-plugin']}
            }),
            echoConfig()
          );
        });
        ${echoConfigFunctionString}
      `);

      const result = await workspace.run('build');
      const expectedConfig = {presets: ['my-new-plugin']};
      expect(result.stdout).toContain(
        `BabelConfig: ${JSON.stringify(expectedConfig)}`,
      );
    });
  });

  it('setting config with a builder function augments prior config', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, createProjectBuildPlugin, LogLevel} from '@sewing-kit/core';
        import {babel} from '@sewing-kit/plugin-babel';
        export default createPackage((pkg) => {
          pkg.use(
            babel({
              config: {presets: ['my-plugin']}
            }),
            babel({
              config(babelConfig) {
                babelConfig.presets.push('my-new-plugin');
                return babelConfig;
              }
            }),
            echoConfig()
          );
        });
        ${echoConfigFunctionString}
      `);

      const result = await workspace.run('build');
      const expectedConfig = {presets: ['my-plugin', 'my-new-plugin']};
      expect(result.stdout).toContain(
        `BabelConfig: ${JSON.stringify(expectedConfig)}`,
      );
    });
  });
});
