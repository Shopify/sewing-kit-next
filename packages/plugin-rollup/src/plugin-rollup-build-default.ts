import {
  createProjectBuildPlugin,
  Package,
  Runtime,
  DiagnosticError,
} from '@sewing-kit/plugins';

import {entryFileNamesBuilder, inputPluginsFactory} from './utilities';

const defaultOptions = {
  commonjs: true,
  esmodules: true,
};

export interface RollupBuildDefaultPluginOptions {
  browserTargets: string;
  nodeTargets: string;
  commonjs?: boolean;
  esmodules?: boolean;
}

type ResolvedRollupCorePluginOptions = Required<
  RollupBuildDefaultPluginOptions
>;

export function rollupBuildDefault(
  baseOptions: RollupBuildDefaultPluginOptions,
) {
  const options: ResolvedRollupCorePluginOptions = {
    ...defaultOptions,
    ...baseOptions,
  };

  return createProjectBuildPlugin<Package>(
    'SewingKit.Rollup.DefaultBuild',
    ({hooks, project}) => {
      // Define config for build variants
      hooks.target.hook(async ({target, hooks}) => {
        if (Object.keys(target.options).length !== 0) {
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

            const babelTargets: string[] = [];
            if (target.runtime.includes(Runtime.Browser)) {
              babelTargets.push(options.browserTargets);
            }
            if (target.runtime.includes(Runtime.Node)) {
              babelTargets.push(options.nodeTargets);
            }

            if (babelTargets.length === 0) {
              throw new DiagnosticError({
                title: `No targets found for "${project.name}".`,
                suggestion: `Set a pkg.runtime() in your sewing-kit.config. Use "pkg.runtime(Runtime.Node)" for a node-only package. Use "pkg.runtime(Runtime.Node, Runtime.Browser)" for an isomorphic package that can be ran in node and the browser`,
              });
            }

            return plugins.concat(
              inputPluginsFactory({babelConfig, targets: babelTargets}),
            );
          });

          configuration.rollupOutputs?.hook((outputs) => {
            const additionalOutputs: typeof outputs = [];

            if (options.commonjs) {
              additionalOutputs.push({
                format: 'cjs',
                dir: project.fs.buildPath('cjs'),
                preserveModules: true,
                exports: 'named',
              });
            }

            if (options.esmodules) {
              additionalOutputs.push({
                format: 'esm',
                dir: project.fs.buildPath('esm'),
                preserveModules: true,
                entryFileNames: entryFileNamesBuilder('.mjs'),
              });
            }

            return outputs.concat(additionalOutputs);
          });
        });
      });
    },
  );
}
