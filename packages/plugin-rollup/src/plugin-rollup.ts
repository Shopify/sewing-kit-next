import {
  createProjectBuildPlugin,
  addHooks,
  WaterfallHook,
  LogLevel,
} from '@sewing-kit/plugins';
import {rollup as rollupFn, InputOptions, OutputOptions} from 'rollup';

interface RollupHooks {
  readonly rollupInput: WaterfallHook<string[]>;
  readonly rollupPlugins: WaterfallHook<NonNullable<InputOptions['plugins']>>;
  readonly rollupExternal: WaterfallHook<NonNullable<InputOptions['external']>>;
  readonly rollupInputOptions: WaterfallHook<InputOptions>;
  readonly rollupOutputs: WaterfallHook<OutputOptions[]>;
}

declare module '@sewing-kit/hooks' {
  interface BuildProjectConfigurationCustomHooks extends RollupHooks {}
}

/**
 * Core configuration of a Rollup-based build.
 * Exposes hooks that configure rollup.
 *
 * The `rollupInput`, `rollupPlugins` and `rollupExternals` hooks map to
 * `input`, `plugins` and `externals` keys of Rollup's `InputOptions` object
 * as documented at https://rollupjs.org/guide/en/#inputoptions-object.
 *
 * The `rollupInputOptions` hook is a whole `InputOptions` object, including any
 * values set in `rollupInput`, `rollupPlugins` and `rollupExternals`, this
 * can be used if you need to control any advanced input configuration options.
 *
 * The `rollupOutputs` hook is an array of Rollup's `OutputOptions` objects as
 * documented at https://rollupjs.org/guide/en/#outputoptions-object.
 */
export function rollupHooks() {
  return createProjectBuildPlugin('SewingKit.Rollup', ({hooks}) => {
    hooks.configureHooks.hook(
      addHooks<RollupHooks>(() => ({
        rollupInput: new WaterfallHook(),
        rollupPlugins: new WaterfallHook(),
        rollupExternal: new WaterfallHook(),
        rollupInputOptions: new WaterfallHook(),
        rollupOutputs: new WaterfallHook(),
      })),
    );
  });
}

/**
 * Run a rollup build step using data from the hooks provided by `rollupHooks`
 */
export function rollupBuild() {
  return createProjectBuildPlugin(
    'SewingKit.Rollup.Build',
    ({api, hooks, project}) => {
      hooks.target.hook(({target, hooks}) => {
        // Add build steps
        hooks.steps.hook((steps, configuration) => [
          ...steps,
          api.createStep(
            {id: 'Rollup.Build', label: 'bundling with rollup'},
            async (stepRunner) => {
              const [inputOptions, outputs] = await Promise.all([
                Promise.all([
                  configuration.rollupInput!.run([]),
                  configuration.rollupPlugins!.run([]),
                  configuration.rollupExternal!.run([]),
                ]).then(([input, plugins, external]) => {
                  return configuration.rollupInputOptions!.run({
                    input,
                    plugins,
                    external,
                  });
                }),
                configuration.rollupOutputs!.run([]),
              ]);

              if (
                (inputOptions.input ?? []).length === 0 ||
                outputs.length === 0
              ) {
                return;
              }

              await build(inputOptions, outputs);

              const logOutputs = outputs.map(({dir = ''}) =>
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

async function build(
  inputOptions: InputOptions,
  outputOptionsArray: OutputOptions[],
) {
  // create a bundle
  const bundle = await rollupFn(inputOptions);

  await Promise.all(outputOptionsArray.map((options) => bundle.write(options)));

  // closes the bundle
  await bundle.close();

  return bundle;
}
