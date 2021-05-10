import {
  createProjectBuildPlugin,
  Package,
  Runtime,
  DiagnosticError,
} from '@sewing-kit/plugins';

import {
  BabelConfig,
  writeEntries,
  ExportStyle,
} from '@sewing-kit/plugin-javascript';

import {Plugin as RollupPlugin, PreRenderedChunk} from 'rollup';

import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

declare module '@sewing-kit/hooks' {
  interface BuildPackageTargetOptions {
    rollupEsnext?: boolean;
  }
}

const defaultOptions = {
  commonjs: true,
  esmodules: true,
  esnext: true,
};

export interface RollupBuildDefaultPluginOptions {
  browserTargets: string;
  nodeTargets: string;
  commonjs?: boolean;
  esmodules?: boolean;
  esnext?: boolean;
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
    ({api, hooks, project}) => {
      // Define additional build variant to build esnext output
      hooks.targets.hook((targets) => {
        return targets.map((target) => {
          return options.esnext && target.default
            ? target.add({rollupEsnext: true})
            : target;
        });
      });

      // Define config for build variants
      hooks.target.hook(async ({target, hooks}) => {
        const isDefaultBuild = Object.keys(target.options).length === 0;
        const isEsnextBuild = Boolean(target.options.rollupEsnext);
        if (!(isDefaultBuild || isEsnextBuild)) {
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

            if (isDefaultBuild) {
              if (target.runtime.includes(Runtime.Browser)) {
                babelTargets.push(options.browserTargets);
              }
              if (target.runtime.includes(Runtime.Node)) {
                babelTargets.push(options.nodeTargets);
              }
            } else if (isEsnextBuild) {
              babelTargets.push('last 1 chrome versions');
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

            if (isDefaultBuild) {
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
            } else if (isEsnextBuild) {
              if (options.esmodules) {
                additionalOutputs.push({
                  format: 'esm',
                  dir: project.fs.buildPath('esnext'),
                  preserveModules: true,
                  entryFileNames: entryFileNamesBuilder('.esnext'),
                });
              }
            }

            return outputs.concat(additionalOutputs);
          });
        });

        // Create entries
        hooks.steps.hook((steps) => [
          ...steps,
          api.createStep(
            {id: 'Rollup.Entries', label: 'Adding entries for Rollup outputs'},
            async () => {
              const entryConfigs = [];

              if (isDefaultBuild) {
                if (options.commonjs) {
                  entryConfigs.push({
                    exportStyle: ExportStyle.CommonJs,
                    outputPath: project.fs.buildPath('cjs'),
                    extension: '.js',
                  });
                }

                if (options.esmodules) {
                  entryConfigs.push({
                    exportStyle: ExportStyle.EsModules,
                    outputPath: project.fs.buildPath('esm'),
                    extension: '.mjs',
                  });
                }
              } else if (isEsnextBuild) {
                if (options.esnext) {
                  entryConfigs.push({
                    exportStyle: ExportStyle.EsModules,
                    outputPath: project.fs.buildPath('esnext'),
                    extension: '.esnext',
                  });
                }
              }

              await Promise.all(
                entryConfigs.map((config) =>
                  writeEntries({project, ...config}),
                ),
              );
            },
          ),
        ]);
      });
    },
  );
}

function inputPluginsFactory({
  targets,
  babelConfig,
}: {
  targets: string[];
  babelConfig: BabelConfig;
}): RollupPlugin[] {
  return [
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      // Only resolve files paths starting with a .
      // This treats every other path - i.e. modules like
      // `@shopify/address` or node built-ins like `path` as
      // externals that should not be bundled.
      resolveOnly: [/^\./],
    }),
    commonjs(),
    babel({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      envName: 'production',
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
      configFile: false,
      // @ts-expect-error targets is a valid babel option but @types/babel__core doesn't know that yet
      targets,
      ...babelConfig,
    }),
  ];
}

/**
 * Foo.ts is compilied to Foo.js, while Foo.scss is compiled to Foo.scss.js
 * Optionally changing the .js for .mjs / .esnext
 */
export function entryFileNamesBuilder(ext = '.js') {
  const NonAssetExtensions = ['.js', '.jsx', '.ts', '.tsx'];
  return (chunkInfo: PreRenderedChunk) => {
    const isAssetfile = !NonAssetExtensions.some((nonAssetExt) =>
      (chunkInfo.facadeModuleId || '').endsWith(nonAssetExt),
    );

    return `[name]${isAssetfile ? '[extname]' : ''}${ext}`;
  };
}
