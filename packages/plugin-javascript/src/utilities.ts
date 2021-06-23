import {createHash} from 'crypto';

import nodeObjectHash from 'node-object-hash';
import {
  Env,
  Project,
  PluginApi,
  Target,
  Runtime,
  unwrapPossibleGetter,
  ValueOrGetter,
} from '@sewing-kit/plugins';

import type {BabelConfig} from './types';
import type {Options as BabelPresetOptions} from './babel-preset';

export const CORE_PRESET = '@sewing-kit/plugin-javascript/babel-preset';

export async function createJavaScriptWebpackRuleSet({
  api,
  env,
  target,
  configuration,
  cacheDirectory: cacheDirectoryName,
  cacheDependencies: initialCacheDependencies = [],
}: {
  api: PluginApi;
  env: Env;
  target: Target<Project, any>;
  configuration:
    | import('@sewing-kit/hooks').BuildProjectConfigurationHooks
    | import('@sewing-kit/hooks').DevProjectConfigurationHooks;
  cacheDirectory: string;
  cacheDependencies?: string[];
}) {
  const [
    babelOptions = {},
    babelCacheDependencies = [],
    cacheDirectory,
  ] = await Promise.all([
    configuration.babelConfig?.run({
      plugins: [],
      presets: [
        [
          CORE_PRESET,
          {
            modules: 'preserve',
            target:
              target.runtime.includes(Runtime.Node) &&
              target.runtime.runtimes.size === 1
                ? 'node'
                : undefined,
          },
        ],
      ],
    }),
    configuration.babelCacheDependencies?.run([
      '@babel/core',
      ...initialCacheDependencies,
    ]),
    configuration.webpackCachePath!.run(
      api.cachePath('webpack/babel', cacheDirectoryName),
    ),
  ] as const);

  return [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory,
        envName: env,
        configFile: false,
        cacheIdentifier: babelCacheIdentifier(
          env,
          target.project,
          babelOptions,
          babelCacheDependencies,
        ),
        ...babelOptions,
      },
    },
  ];
}

function babelCacheIdentifier(
  env: Env,
  project: Project,
  babelOptions: Partial<BabelConfig>,
  dependencies: ReadonlyArray<string>,
) {
  const optionsHash = nodeObjectHash().hash(babelOptions);
  const prefix = `sk:${env}:`;
  const dependencyString = createDependencyString(
    ['webpack', ...dependencies],
    project,
  );

  return `${prefix}${createHash('sha1')
    .update(dependencyString)
    .digest('hex')}@${optionsHash}`;
}

function createDependencyString(dependencies: string[], project: Project) {
  return dependencies
    .map(
      (dependency) =>
        `${dependency}:${
          project.dependency(dependency)?.version || 'notinstalled'
        }`,
    )
    .join('&');
}

export function updateBabelPlugin<TOptions extends {[key: string]: unknown}>(
  plugin: string | string[],
  options: ValueOrGetter<TOptions, [Partial<TOptions>]>,
  {addIfMissing = true} = {},
) {
  const normalizedPlugins = Array.isArray(plugin) ? plugin : [plugin];

  return async (config: BabelConfig) => {
    let hasMatch = false;

    const newConfig = {
      ...config,
      plugins:
        config.plugins &&
        (await Promise.all(
          config.plugins.map<
            Promise<string | [string, {[key: string]: unknown}?]>
          >(async (plugin) => {
            const [name, currentOptions = {}] = Array.isArray(plugin)
              ? plugin
              : [plugin];

            if (normalizedPlugins.includes(name)) {
              hasMatch = true;

              const newOptions = await unwrapPossibleGetter(
                options,
                currentOptions as any,
              );

              return [
                name,
                typeof options === 'function'
                  ? {...newOptions}
                  : {...currentOptions, ...newOptions},
              ];
            }

            return plugin;
          }),
        )),
    };

    if (!hasMatch && addIfMissing) {
      newConfig.plugins.push([
        normalizedPlugins[0],
        await unwrapPossibleGetter(options, {}),
      ]);
    }

    return newConfig;
  };
}

export function updateBabelPreset<TOptions extends {[key: string]: unknown}>(
  preset: string | string[],
  options: ValueOrGetter<TOptions, [Partial<TOptions>]>,
  {addIfMissing = true} = {},
) {
  const normalizedPresets = Array.isArray(preset) ? preset : [preset];

  return async (config: BabelConfig) => {
    let hasMatch = false;

    const newConfig = {
      ...config,
      presets:
        config.presets &&
        (await Promise.all(
          config.presets.map<
            Promise<string | [string, {[key: string]: unknown}?]>
          >(async (preset) => {
            const [name, currentOptions = {}] = Array.isArray(preset)
              ? preset
              : [preset];

            if (normalizedPresets.includes(name)) {
              hasMatch = true;

              const newOptions = await unwrapPossibleGetter(
                options,
                currentOptions as any,
              );

              return [
                name,
                typeof options === 'function'
                  ? {...newOptions}
                  : {...currentOptions, ...newOptions},
              ];
            }

            return preset;
          }),
        )),
    };

    if (!hasMatch && addIfMissing) {
      newConfig.presets.push([
        normalizedPresets[0],
        await unwrapPossibleGetter(options, {}),
      ]);
    }

    return newConfig;
  };
}

export function updateSewingKitBabelPreset(
  options: ValueOrGetter<BabelPresetOptions, [Partial<BabelPresetOptions>]>,
  {addIfMissing = false} = {},
) {
  return updateBabelPreset<BabelPresetOptions>(
    [CORE_PRESET, require.resolve(CORE_PRESET)],
    options,
    {addIfMissing},
  );
}
