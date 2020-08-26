import {resolve} from 'path';

import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../tests/utilities';
import {getModifiedTime, writeToSrc} from './utilities';

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
      options: {cache},
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
    describe('caching', () => {
      it('creates a cache', async () => {
        await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
          await workspace.writeConfig(babelCompilationConfig);
          await writeToSrc(workspace, 'index.js');

          await workspace.run('build');

          expect(
            await workspace.contains(
              '.sewing-kit/cache/babel/packages/simple-package/babel-esm-js',
            ),
          ).toBe(true);
        });
      });

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

          const builtOutputModifiedTime = getModifiedTime(builtIndexFilePath);

          await workspace.run('build');

          const updatedBuiltOutputModifiedTime = getModifiedTime(
            builtIndexFilePath,
          );

          expect(builtOutputModifiedTime).toStrictEqual(
            updatedBuiltOutputModifiedTime,
          );
        });
      });

      it('invalidates cache if something changes', async () => {
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

          const builtOutputModifiedTime = getModifiedTime(builtIndexFilePath);

          await writeToSrc(workspace, 'index.js');

          await workspace.run('build');

          const updatedBuiltOutputModifiedTime = getModifiedTime(
            builtIndexFilePath,
          );

          expect(builtOutputModifiedTime).not.toStrictEqual(
            updatedBuiltOutputModifiedTime,
          );
        });
      });
    });
  });
});
