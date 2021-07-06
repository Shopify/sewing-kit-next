import {
  createProjectBuildPlugin,
  createProjectPlugin,
  addHooks,
  WaterfallHook,
  LogLevel,
  Target,
  Project,
} from '@sewing-kit/core';
import type {
  rollup as rollupFnType,
  Plugin as RollupPlugin,
  InputOptions,
  OutputOptions,
} from 'rollup';

interface RollupHooks {
  readonly rollupInput: WaterfallHook<string[]>;
  readonly rollupPlugins: WaterfallHook<NonNullable<InputOptions['plugins']>>;
  readonly rollupExternal: WaterfallHook<NonNullable<InputOptions['external']>>;
  readonly rollupInputOptions: WaterfallHook<InputOptions>;
  readonly rollupOutputs: WaterfallHook<OutputOptions[]>;
}

declare module '@sewing-kit/core' {
  interface BuildProjectConfigurationCustomHooks extends RollupHooks {}
  interface DevProjectConfigurationCustomHooks extends RollupHooks {}
}

/**
 * Core configuration of a Rollup-based build.
 * Exposes hooks that configure rollup.
 *
 * The `rollupInput`, `rollupPlugins` and `rollupExternal` hooks map to
 * `input`, `plugins` and `externals` keys of Rollup's `InputOptions` object
 * as documented at https://rollupjs.org/guide/en/#inputoptions-object.
 *
 * The `rollupInputOptions` hook is a whole `InputOptions` object, including any
 * values set in `rollupInput`, `rollupPlugins` and `rollupExternal`, this
 * can be used if you need to control any advanced input configuration options.
 *
 * The `rollupOutputs` hook is an array of Rollup's `OutputOptions` objects as
 * documented at https://rollupjs.org/guide/en/#outputoptions-object.
 */
export function rollupHooks() {
  return createProjectPlugin('SewingKit.Rollup', ({tasks: {dev, build}}) => {
    const addRollupHooks = addHooks<RollupHooks>(() => ({
      rollupInput: new WaterfallHook(),
      rollupPlugins: new WaterfallHook(),
      rollupExternal: new WaterfallHook(),
      rollupInputOptions: new WaterfallHook(),
      rollupOutputs: new WaterfallHook(),
    }));

    build.hook(({hooks}) => {
      hooks.configureHooks.hook(addRollupHooks);
    });

    dev.hook(({hooks}) => {
      hooks.configureHooks.hook(addRollupHooks);
    });
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

              const rollupFn = (await import('rollup')).rollup;
              await build(rollupFn, inputOptions, outputs);

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

/**
 * Utility plugin for cleanly adding additional Rollup plugins to the build.
 *
 * Accepts either:
 * - An array of Rollup plugins to be added
 * - A function that accepts a Target object and returns an array of Rollup
 *   plugins to be added
 */
export function rollupPlugins(
  plugins:
    | ((target: Target<Project, {[key: string]: unknown}>) => RollupPlugin[])
    | RollupPlugin[],
) {
  return createProjectBuildPlugin(
    'SewingKit.Rollup.CustomPlugins',
    ({hooks}) => {
      hooks.target.hook(({hooks, target}) => {
        hooks.configure.hook((configuration) => {
          configuration.rollupPlugins?.hook((rollupPlugins) => {
            // plugins may be either an array of plugins or a builder function
            // that returns the plugins for a given target
            const pluginsArray = Array.isArray(plugins)
              ? plugins
              : plugins(target);

            return rollupPlugins.concat(pluginsArray);
          });
        });
      });
    },
  );
}

async function build(
  rollup: typeof rollupFnType,
  inputOptions: InputOptions,
  outputOptionsArray: OutputOptions[],
) {
  // create a bundle
  const bundle = await rollup(inputOptions);

  await Promise.all(outputOptionsArray.map((options) => bundle.write(options)));

  // closes the bundle
  await bundle.close();

  return bundle;
}
