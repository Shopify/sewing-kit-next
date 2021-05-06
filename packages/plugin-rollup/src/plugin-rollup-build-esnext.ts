import {
  createProjectBuildPlugin,
  Package,
  DiagnosticError,
} from '@sewing-kit/plugins';

import {entryFileNamesBuilder, inputPluginsFactory} from './utilities';

export function rollupBuildEsnext() {
  return createProjectBuildPlugin<Package>(
    'SewingKit.Rollup.EsnextBuild',
    ({hooks, project}) => {
      // Define additional build variant to build esnext output
      hooks.targets.hook((targets) => {
        return targets.map((target) => {
          return target.default ? target.add({rollupName: 'esnext'}) : target;
        });
      });

      // Define config for build variant
      hooks.target.hook(async ({target, hooks}) => {
        if (target.options.rollupName !== 'esnext') {
          return;
        }

        hooks.configure.hook(async (configuration) => {
          configuration.rollupInput?.hook((input) => {
            const inputEntries = [
              ...target.project.entries,
              ...target.project.binaries,
            ].map(({root}) => require.resolve(root, {paths: [project.root]}));

            if (inputEntries.length === 0) {
              throw new DiagnosticError({
                title: `No inputs found for "${project.name}".`,
                suggestion: `Set a pkg.entry() in your sewing-kit.config. Use 'pkg.entry({root: './src/index'})" to use the index file`,
              });
            }

            return input.concat(inputEntries);
          });

          configuration.rollupPlugins?.hook(async (plugins) => {
            const babelConfig = (await configuration.babelConfig?.run({
              presets: [
                [
                  '@sewing-kit/plugin-javascript/babel-preset',
                  {modules: 'auto'},
                ],
              ],
              plugins: [],
            })) || {presets: [], plugins: []};

            return plugins.concat(
              inputPluginsFactory({
                babelConfig,
                targets: ['last 1 chrome versions'],
              }),
            );
          });

          configuration.rollupOutputs?.hook((outputs) =>
            outputs.concat([
              {
                format: 'esm',
                dir: project.fs.buildPath('esnext'),
                preserveModules: true,
                entryFileNames: entryFileNamesBuilder('.esnext'),
              },
            ]),
          );
        });
      });
    },
  );
}
