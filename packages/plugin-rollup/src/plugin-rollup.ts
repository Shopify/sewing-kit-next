import {
  createProjectBuildPlugin,
  Package,
  addHooks,
  WaterfallHook,
  LogLevel,
} from '@sewing-kit/plugins';
import {writeEntries, ExportStyle} from '@sewing-kit/plugin-javascript';
import {rollup as rollupFn, InputOptions, OutputOptions} from 'rollup';

import {rollupNameForTargetOptions} from './utilities';

interface RollupHooks {
  readonly rollupInput: WaterfallHook<string[]>;
  readonly rollupPlugins: WaterfallHook<NonNullable<InputOptions['plugins']>>;
  readonly rollupExternal: WaterfallHook<NonNullable<InputOptions['external']>>;
  readonly rollupOutputs: WaterfallHook<OutputOptions[]>;
}

declare module '@sewing-kit/hooks' {
  interface BuildPackageConfigurationCustomHooks extends RollupHooks {}

  interface BuildPackageTargetOptions {
    rollupName?: string;
  }
}

/**
 * Core configuration of a Rollup-based build.
 *
 * Rollup input can be customised using the rollupInput hook
 * Rollup plugins can be customised using the rollupPlugins hook.
 * Rollup externals can be customised using the rollupExternals hook.
 * Rollup outputs can be customised by using the rollupOutputs hook.
 */
export function rollupHooks() {
  return createProjectBuildPlugin<Package>('SewingKit.Rollup', ({hooks}) => {
    // Define hooks that are available to be configured
    // Allows for consumers and other SK plugins to adjust the rollup config
    // by adding additional plugins and outputs per build variant
    //
    // input, plugins and external are part of the InputOptions object
    // @see https://rollupjs.org/guide/en/#inputoptions-object
    // outputs is the OutputOptions object
    // @see https://rollupjs.org/guide/en/#outputoptions-object
    hooks.configureHooks.hook(
      addHooks<RollupHooks>(() => ({
        rollupInput: new WaterfallHook(),
        rollupPlugins: new WaterfallHook(),
        rollupExternal: new WaterfallHook(),
        rollupOutputs: new WaterfallHook(),
      })),
    );
  });
}

export function rollupBuild() {
  return createProjectBuildPlugin<Package>(
    'SewingKit.Rollup.Core',
    ({api, hooks, project}) => {
      hooks.target.hook(({target, hooks}) => {
        const name = rollupNameForTargetOptions(target.options);

        if (!name) {
          return;
        }

        // Add build steps
        hooks.steps.hook((steps, configuration) => [
          ...steps,
          api.createStep(
            {id: 'Rollup', label: 'Building the package with Rollup'},
            async (stepRunner) => {
              const rollupInputOptions = {
                input: await configuration.rollupInput!.run([]),
                plugins: await configuration.rollupPlugins!.run([]),
                external: await configuration.rollupExternal!.run([]),
              };

              const rollupOutputs = await configuration.rollupOutputs!.run([]);

              if (
                rollupInputOptions.input.length === 0 ||
                rollupOutputs.length === 0
              ) {
                return;
              }

              await build(rollupInputOptions, rollupOutputs);

              for (const output of rollupOutputs) {
                const outputDir = output.dir || '';
                const entryConfig = entriesConfigForOutput(outputDir);
                if (entryConfig) {
                  await writeEntries({
                    project,
                    outputPath: outputDir,
                    ...entryConfig,
                  });
                }
              }

              const logOutputs = rollupOutputs.map(({dir = ''}) =>
                project.fs.relativePath(dir),
              );
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

function entriesConfigForOutput(outputDir: string) {
  if (outputDir.endsWith('/esm')) {
    return {
      exportStyle: ExportStyle.EsModules,
      extension: '.mjs',
    };
  }

  if (outputDir.endsWith('/cjs')) {
    return {
      exportStyle: ExportStyle.CommonJs,
      extension: '.js',
    };
  }

  if (outputDir.endsWith('/esnext')) {
    return {
      exportStyle: ExportStyle.EsModules,
      extension: '.esnext',
    };
  }

  return null;
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
