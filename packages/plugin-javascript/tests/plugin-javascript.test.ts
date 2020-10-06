import {resolve} from 'path';
import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../tests/utilities';
import {
  getModifiedTime,
  writeToSrc,
  readFromWorkspace,
  sleep,
} from './utilities';

import execa from 'execa';

const run = (command: string, options: string[]) => {
  return execa(`yarn sk ${command}`, options);
};

const babelCompilationConfig = `
import {createPackage} from '@sewing-kit/config';
import {
  javascript,
  ExportStyle,
  updateSewingKitBabelPreset,
  createCompileBabelStep,
} from '@sewing-kit/plugin-javascript';
import {createProjectBuildPlugin} from '@sewing-kit/plugins';

function compileBabelBuild() {
  return createProjectBuildPlugin('TestPackage.BuildPlugin', (context) => {
    const {
      api,
      hooks,
      project,
      options: {cache, watch},
    } = context;

    hooks.targets.hook((targets) =>
      targets.map((target) =>
        target.default ? target.add({esmodules: true}) : target,
      ),
    );

    hooks.target.hook(({target, hooks}) => {
      if (!target.options.esmodules) return;

      hooks.configure.hook((configuration) => {
        configuration.babelConfig?.hook(updateSewingKitBabelPreset({
          polyfill: 'inline',
          modules: 'preserve',
        }));
      });

      hooks.steps.hook((steps, configuration) => {
        const outputPath = project.fs.buildPath('esm');

        return [
          ...steps,
          createCompileBabelStep({
            api,
            project,
            configuration,
            outputPath,
            extension: '.mjs',
            configFile: 'babel.esm.js',
            exportStyle: ExportStyle.EsModules,
            cache,
            watch
          }),
        ];
      });
    });
  });
}

export default createPackage((pkg) => {
  pkg.use(javascript(), compileBabelBuild());
});
`;

describe('@sewing-kit/plugin-javascript', () => {
  describe('createCompileBabelStep()', () => {
    describe('--cache', () => {
      it('reads from the cache and skips compilation if hash is same', async () => {
        await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
          const builtIndexFilePath = resolve(
            workspace.root,
            'build',
            'esm',
            'index.mjs',
          );

          await workspace.writeConfig(babelCompilationConfig);
          await writeToSrc(workspace, 'index.js');

          await workspace.run('build');

          const initialBuildTime = getModifiedTime(builtIndexFilePath);

          await workspace.run('build');

          expect(initialBuildTime).toStrictEqual(
            getModifiedTime(builtIndexFilePath),
          );
        });
      });

      describe('updates the cache', () => {
        it('when a file is changed', async () => {
          await withWorkspace(
            generateUniqueWorkspaceID(),
            async (workspace) => {
              const builtIndexFilePath = resolve(
                workspace.root,
                'build',
                'esm',
                'index.mjs',
              );

              await workspace.writeConfig(babelCompilationConfig);
              await writeToSrc(workspace, 'index.js');

              await workspace.run('build');

              const initialBuildTime = getModifiedTime(builtIndexFilePath);

              await writeToSrc(
                workspace,
                'index.js',
                'console.log("changed");',
              );

              await workspace.run('build');

              expect(initialBuildTime).not.toStrictEqual(
                getModifiedTime(builtIndexFilePath),
              );
            },
          );
        });

        it('when a file is added', async () => {
          await withWorkspace(
            generateUniqueWorkspaceID(),
            async (workspace) => {
              const builtIndexFilePath = resolve(
                workspace.root,
                'build',
                'esm',
                'index.mjs',
              );

              await workspace.writeConfig(babelCompilationConfig);
              await writeToSrc(workspace, 'index.js');

              await workspace.run('build');

              const initialBuildTime = getModifiedTime(builtIndexFilePath);

              await writeToSrc(workspace, 'new-index.js');

              await workspace.run('build');

              expect(initialBuildTime).not.toStrictEqual(
                getModifiedTime(builtIndexFilePath),
              );
            },
          );
        });

        it('when a file is removed', async () => {
          const fileToRemove = `some-dir/foo.js`;

          await withWorkspace(
            generateUniqueWorkspaceID(),
            async (workspace) => {
              const builtIndexFilePath = resolve(
                workspace.root,
                'build',
                'esm',
                'index.mjs',
              );

              await workspace.writeConfig(babelCompilationConfig);
              await writeToSrc(workspace, 'index.js');
              await writeToSrc(workspace, fileToRemove);

              await workspace.run('build');

              const initialBuildTime = getModifiedTime(builtIndexFilePath);

              await workspace.removeFile(`src/${fileToRemove}`);
              await workspace.run('build');

              expect(initialBuildTime).not.toStrictEqual(
                getModifiedTime(builtIndexFilePath),
              );
            },
          );
        });
      });
    });

    describe('--no-cache', () => {
      it('does not read from the cache', async () => {
        await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
          const builtIndexFilePath = resolve(
            workspace.root,
            'build',
            'esm',
            'index.mjs',
          );

          await workspace.writeConfig(babelCompilationConfig);
          await writeToSrc(workspace, 'index.js');

          await workspace.run('build');

          const initialBuildTime = getModifiedTime(builtIndexFilePath);

          await workspace.run('build', ['--no-cache']);

          expect(initialBuildTime).not.toStrictEqual(
            getModifiedTime(builtIndexFilePath),
          );
        });
      });
    });

    describe('--watch', () => {
      it('watches builds', async () => {
        await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
          await workspace.writeConfig(babelCompilationConfig);
          await writeToSrc(workspace, 'index.js');

          run('build', ['--watch']);
          // eslint-disable-next-line line-comment-position
          await sleep(300); // wait for initial build

          await writeToSrc(workspace, 'index.js', 'const foo = "bar";');

          // eslint-disable-next-line line-comment-position
          await sleep(300); // wait for watcher

          expect(
            await readFromWorkspace(workspace, 'build/esm/index.mjs'),
          ).toStrictEqual('var foo = "bar";');
        });
      });
    });

    it('does not watch builds', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        await workspace.writeConfig(babelCompilationConfig);
        await writeToSrc(workspace, 'index.js');

        await run('build');
        await writeToSrc(workspace, 'index.js', 'const foo = "bar";');

        // eslint-disable-next-line line-comment-position
        await sleep(300); // wait for watcher

        expect(
          await readFromWorkspace(workspace, 'build/esm/index.mjs'),
        ).not.toStrictEqual('var foo = "bar";');
      });
    });
  });
});
