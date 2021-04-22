import path from 'path';

import {
  createProjectBuildPlugin,
  Package,
  addHooks,
  WaterfallHook,
  Runtime,
  LogLevel,
} from '@sewing-kit/plugins';
import {
  writeEntries,
  BabelConfig,
  ExportStyle,
} from '@sewing-kit/plugin-javascript';
import {
  rollup as rollupFn,
  InputOptions,
  OutputOptions,
  PreRenderedChunk,
  Plugin as RollupPlugin,
} from 'rollup';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

interface RollupHooks {
  readonly rollupPlugins: WaterfallHook<RollupPlugin[]>;
  readonly rollupOutputs: WaterfallHook<OutputOptions[]>;
}

declare module '@sewing-kit/hooks' {
  interface BuildPackageConfigurationCustomHooks extends RollupHooks {}

  interface BuildPackageTargetOptions {
    rollupName?: string;
  }
}

export interface RollupCorePluginOptions {
  browserTargets: string;
  nodeTargets: string;
  commonjs?: boolean;
  esmodules?: boolean;
  esnext?: boolean;
}

type ResolvedRollupCorePluginOptions = Required<RollupCorePluginOptions>;

const defaultOptions = {
  commonjs: true,
  esmodules: true,
  esnext: true,
};

export function rollupCore(baseOptions: RollupCorePluginOptions) {
  const options: ResolvedRollupCorePluginOptions = {
    ...defaultOptions,
    ...baseOptions,
  };

  return createProjectBuildPlugin<Package>(
    'SewingKit.Rollup.Core',
    ({api, hooks, project}) => {
      // Define hooks that are available to be configured
      // Allows for consumers and other SK plugins to adjust the rollup config
      // by adding additional plugins and outputs per build variant
      hooks.configureHooks.hook(
        addHooks<RollupHooks>(() => ({
          rollupPlugins: new WaterfallHook(),
          rollupOutputs: new WaterfallHook(),
        })),
      );

      // Define default build variants to build based off options.
      // Enabling cjs/esm builds shall enable the 'main' variant
      // Enabling esnext builds shall enable the 'esnext' variant
      hooks.targets.hook((targets) => {
        return targets.map((target) => {
          if (!target.default) {
            return target;
          }

          const newVariants = [];

          if (options.commonjs || options.esmodules) {
            newVariants.push({rollupName: 'main'});
          }

          if (options.esnext) {
            newVariants.push({rollupName: 'esnext'});
          }

          return target.add(...newVariants);
        });
      });

      hooks.target.hook(({target, hooks}) => {
        const name = target.options.rollupName || '';

        if (!name) {
          return;
        }

        const babelTargets: string[] = [];
        if (target.runtime.includes(Runtime.Browser)) {
          babelTargets.push(options.browserTargets);
        }
        if (target.runtime.includes(Runtime.Node)) {
          babelTargets.push(options.nodeTargets);
        }

        if (babelTargets.length === 0) {
          throw new Error(
            `No targets found for "${project.name}". Try setting a Runtime in your sewing-kit.config.`,
          );
        }

        // Add default plugins and outputs for the default build variants
        hooks.configure.hook(async (hooks) => {
          const babelConfig = (await hooks.babelConfig?.run({
            presets: [
              [
                '@sewing-kit/plugin-javascript/babel-preset',
                // undefined targets as we use the top-level targets option
                {modules: 'auto', target: undefined},
              ],
            ],
            plugins: [],
          })) || {presets: [], plugins: []};

          hooks.rollupPlugins?.hook((plugins) =>
            plugins.concat(
              rollupDefaultPluginsBuilder(name, babelConfig, babelTargets) ||
                [],
            ),
          );

          hooks.rollupOutputs?.hook((outputs) =>
            outputs.concat(
              rollupDefaultOutputsBuilder(
                name,
                options,
                project.fs.buildPath(),
              ),
            ),
          );
        });

        // Add build steps
        hooks.steps.hook((steps, configuration) => [
          ...steps,
          api.createStep(
            {id: 'Rollup', label: 'Building the package with Rollup'},
            async (stepRunner) => {
              const inputEntries = [
                ...target.project.entries,
                ...target.project.binaries,
              ].map(({root}) => require.resolve(root, {paths: [project.root]}));
              const rollupPlugins =
                (await configuration.rollupPlugins?.run([])) ?? [];
              const rollupOutputs =
                (await configuration.rollupOutputs?.run([])) ?? [];

              if (inputEntries.length === 0) {
                throw new Error(
                  `No inputs found for "${project.name}". Try setting an Entry in your sewing-kit.config.`,
                );
              }

              if (rollupOutputs.length === 0) {
                return;
              }

              await build(
                {input: inputEntries, plugins: rollupPlugins},
                rollupOutputs,
              );

              function entriesConfigForOutput(outputDir: string) {
                const outputdirBase = path.basename(outputDir || '');

                if (outputdirBase.endsWith('/esm')) {
                  return {
                    outputPath: outputDir,
                    exportStyle: ExportStyle.EsModules,
                    extension: '.mjs',
                  };
                }
                if (outputdirBase.endsWith('/cjs')) {
                  return {
                    outputPath: outputDir,
                    exportStyle: ExportStyle.CommonJs,
                    extension: '.js',
                  };
                }
                if (outputdirBase.endsWith('/esnext')) {
                  return {
                    outputPath: outputDir,
                    exportStyle: ExportStyle.EsModules,
                    extension: '.esnext',
                  };
                }

                return null;
              }

              for (const output of rollupOutputs) {
                const entryConfig = entriesConfigForOutput(output.dir || '');
                if (entryConfig) {
                  await writeEntries({project, ...entryConfig});
                }
              }

              const logOutputs = rollupOutputs.map(({dir}) => dir);
              const logInputs = target.project.entries
                .map(({root}) => root)
                .join(', ');

              stepRunner.log(
                `Created ${logOutputs} for input(s): ${logInputs}`,
                {level: LogLevel.Info},
              );
            },
          ),
        ]);
      });
    },
  );
}

function rollupDefaultPluginsBuilder(
  variant: string,
  babelConfig: BabelConfig,
  targets: string[],
): InputOptions['plugins'] {
  if (variant === 'main') {
    return inputPluginsFactory({babelConfig, targets});
  }

  if (variant === 'esnext') {
    return inputPluginsFactory({
      babelConfig,
      targets: ['last 1 chrome versions'],
    });
  }

  return [];
}

function rollupDefaultOutputsBuilder(
  variant: string,
  options: ResolvedRollupCorePluginOptions,
  rootDir: string,
): OutputOptions[] {
  // Foo.ts is compilied to Foo.js, while Foo.scss is compiled to Foo.scss.js
  // Optionally changing the .js for .mjs / .esnext
  const entryFileNamesBuilder = (ext = '.js') => {
    const NonAssetExtensions = ['.js', '.jsx', '.ts', '.tsx'];
    return (chunkInfo: PreRenderedChunk) => {
      const isAssetfile = !NonAssetExtensions.some((nonAssetExt) =>
        (chunkInfo.facadeModuleId || '').endsWith(nonAssetExt),
      );

      return `[name]${isAssetfile ? '[extname]' : ''}${ext}`;
    };
  };

  if (variant === 'main') {
    const outputs: OutputOptions[] = [];

    if (options.commonjs) {
      outputs.push({
        format: 'cjs',
        dir: `${rootDir}/cjs`,
        preserveModules: true,
        exports: 'named',
      });
    }

    if (options.esmodules) {
      outputs.push({
        format: 'esm',
        dir: `${rootDir}/esm`,
        preserveModules: true,
        entryFileNames: entryFileNamesBuilder('.mjs'),
      });
    }

    return outputs;
  }

  if (variant === 'esnext') {
    return [
      {
        format: 'esm',
        dir: `${rootDir}/esnext`,
        preserveModules: true,
        entryFileNames: entryFileNamesBuilder('.esnext'),
      },
    ];
  }

  return [];
}

function inputPluginsFactory({
  targets,
  babelConfig,
}: {
  targets: string[];
  babelConfig: BabelConfig;
}): InputOptions['plugins'] {
  return [
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      // Only resolve files paths starting with a .
      // This treats every other path - i.e. modules like
      // `@shopify/address` or node built-ins like `path` as
      // externals that shoould not be bundled.
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

async function build(
  inputOptions: InputOptions,
  outputOptionsArray: OutputOptions[],
) {
  // create a bundle
  const bundle = await rollupFn(inputOptions);

  // console.log(inputOptions, outputOptionsArray);

  for (const outputOptions of outputOptionsArray) {
    await bundle.write(outputOptions);
  }

  // closes the bundle
  await bundle.close();

  return bundle;
}
