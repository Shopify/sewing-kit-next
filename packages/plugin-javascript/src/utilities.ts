import {unwrapPossibleGetter, ValueOrGetter} from '@sewing-kit/core';

import type {BabelConfig} from './types';
import type {Options as BabelPresetOptions} from './babel-preset';

export const CORE_PRESET = '@sewing-kit/plugin-javascript/babel-preset';

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
