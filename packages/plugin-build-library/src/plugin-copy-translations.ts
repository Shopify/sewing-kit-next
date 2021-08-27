import {createWorkspacePlugin, DiagnosticError} from '@sewing-kit/core';
import type {PluginApi} from '@sewing-kit/core';
import cpy from 'cpy';

export function pluginCopyTranslations() {
  return createWorkspacePlugin(
    'Sewing-kit.Library.Workspace.GenerateGraphqlTypes',
    ({api, tasks: {build}}) => {
      build.hook(({hooks}) => {
        hooks.post.hook((steps) => {
          return [
            ...steps,
            api.createStep(
              {
                id: 'Sewing-kit.Library.Workspace.PostBuild.CopyTranslations',
                label: 'Copying translation files to build folder',
              },
              () => {
                try {
                  copyTranslations(api);
                } catch (error) {
                  throw new DiagnosticError({
                    title: 'Could not copy translations',
                    content: error.all,
                  });
                }
              },
            ),
          ];
        });
      });
    },
  );
}

function copyTranslations(api: PluginApi) {
  Promise.all(
    ['cjs', 'esm', 'esnext'].map((target) =>
      cpy(['**/*.json'], `../build/${target}/`, {
        cwd: api.resolvePath('..', 'src'),
        overwrite: true,
        parents: true,
      }),
    ),
  ).catch((error) => console.error(error));
}
