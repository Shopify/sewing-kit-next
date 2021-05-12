import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

describe('@sewing-kit/plugin-rollup', () => {
  it('does nothing if no rollupInputOptions / rollupOuputOptions are configured', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@sewing-kit/config';
        import {createProjectBuildPlugin} from '@sewing-kit/plugins';
        import {rollupHooks, rollupBuild} from '@sewing-kit/plugin-rollup';
        export default createPackage((pkg) => {
          pkg.use(rollupHooks(), rollupBuild());
        });
      `);

      await workspace.writeFile(
        'src/index.js',
        `export function pkg(greet) { console.log(\`Hello, \${greet}!\`);}`,
      );

      await workspace.run('build');

      expect(await workspace.contains('build')).toBeFalsy();
    });
  });

  it('can configure input options through the rollupInputOptions hook', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@sewing-kit/config';
        import {createProjectBuildPlugin} from '@sewing-kit/plugins';
        import {rollupHooks, rollupBuild} from '@sewing-kit/plugin-rollup';
        export default createPackage((pkg) => {
          pkg.use(rollupHooks(), rollupBuild(), rollupConfig());
        });
        function rollupConfig() {
          return createProjectBuildPlugin('Test', ({hooks, project}) => {
            hooks.target.hook(({hooks}) => {
              hooks.configure.hook((configuration) => {
                configuration.rollupInputOptions?.hook(() => {
                  return {input: project.fs.resolvePath('./src/index.js')};
                });
                configuration.rollupOutputs?.hook(() => {
                  return [{format: 'esm', dir: project.fs.buildPath('esm')}];
                });
              });
            });
          });
        }
      `);

      await workspace.writeFile(
        'src/index.js',
        `
export function pkg(greet) {
  console.log(\`Hello, \${greet}!\`);
}`,
      );

      await workspace.run('build');

      const expectedFunctionOutput = `
function pkg(greet) {
  console.log(\`Hello, \${greet}!\`);
}
`.trim();

      const esmBuildContent = await workspace.contents('build/esm/index.js');
      expect(esmBuildContent).toContain(expectedFunctionOutput);
      expect(esmBuildContent).toContain(`export { pkg }`);
    });
  });

  it('can configure input options through the rollupInput, rollupExternal and rollupPlugins hooks', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@sewing-kit/config';
        import {createProjectBuildPlugin} from '@sewing-kit/plugins';
        import {rollupHooks, rollupBuild} from '@sewing-kit/plugin-rollup';
        export default createPackage((pkg) => {
          pkg.use(rollupHooks(), rollupBuild(), rollupConfig());
        });
        function rollupConfig() {
          return createProjectBuildPlugin('Test', ({hooks, project}) => {
            hooks.target.hook(({hooks}) => {
              hooks.configure.hook((configuration) => {
                configuration.rollupInput?.hook(() => {
                  return [project.fs.resolvePath('./src/index.js')];
                });
                configuration.rollupExternal?.hook(() => {
                  return [/y.js$/];
                });
                configuration.rollupPlugins?.hook(() => {
                  return [injecterPlugin()];
                });
                configuration.rollupOutputs?.hook(() => {
                  return [{format: 'esm', dir: project.fs.buildPath('esm')}];
                });
              });
            });
          });
        }
        function injecterPlugin() {
          return {
            name: 'test-injecter',
            transform(code) {
              return code + '/*Content injected from plugin */';
            }
          }
        }
      `);

      await workspace.writeFile(
        'src/index.js',
        `
import {x} from "./x.js";
import {y} from "./y.js";
export function pkg(greet) {
  console.log(\`Hello, \${greet}! \${x} \${y}\`);
}
`,
      );

      await workspace.writeFile('src/x.js', `export const x = 1;`);
      await workspace.writeFile('src/y.js', `export const y = 2;`);

      await workspace.run('build');

      const expectedFunctionOutput = `
function pkg(greet) {
  console.log(\`Hello, \${greet}! \${x} \${y}\`);
}
`.trim();

      const esmBuildContent = await workspace.contents('build/esm/index.js');
      expect(esmBuildContent).toContain(expectedFunctionOutput);
      expect(esmBuildContent).toContain(`export { pkg }`);

      // The contents of x.js is inlined.
      expect(esmBuildContent).not.toContain("import { x } from './x.js';");
      expect(esmBuildContent).toContain('const x = 1;');

      // the contents of y.js is not inlined because it is in the externals list
      expect(esmBuildContent).toContain("import { y } from './y.js';");
      expect(esmBuildContent).not.toContain('const y = 2;');

      // Content injected by a rollup plugin to prove rollup plugins are configured
      expect(esmBuildContent).toContain('/*Content injected from plugin */');
    });
  });

  it('can configure rollup plugins using the rollupPlugins helper plugin', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@sewing-kit/config';
        import {createProjectBuildPlugin} from '@sewing-kit/plugins';
        import {rollupHooks, rollupBuild, rollupPlugins} from '@sewing-kit/plugin-rollup';
        export default createPackage((pkg) => {
          pkg.use(
            rollupHooks(),
            rollupBuild(),
            rollupConfig(),
            rollupPlugins([injecterPlugin('all')]),
            rollupPlugins((target) => [injecterPlugin(JSON.stringify(target.options))]),
          );
        });
        function rollupConfig() {
          return createProjectBuildPlugin('Test', ({hooks, project}) => {
            hooks.target.hook(({hooks}) => {
              hooks.configure.hook((configuration) => {
                configuration.rollupInput?.hook(() => {
                  return [project.fs.resolvePath('./src/index.js')];
                });
                configuration.rollupOutputs?.hook(() => {
                  return [{format: 'esm', dir: project.fs.buildPath('esm')}];
                });
              });
            });
          });
        }
        function injecterPlugin(string) {
          return {
            name: 'test-injecter',
            transform(code) {
              return code + '/*Injected content ~' + string + '~ */';
            }
          }
        }
      `);

      await workspace.writeFile('src/index.js', `export function pkg() {}`);

      await workspace.run('build');

      const esmBuildContent = await workspace.contents('build/esm/index.js');

      // Content injected from the first call to rollupPlugins
      expect(esmBuildContent).toContain('/*Injected content ~all~ */');

      // Content injected from the second call to rollupPlugins
      expect(esmBuildContent).toContain('/*Injected content ~{}~ */');
    });
  });
});
