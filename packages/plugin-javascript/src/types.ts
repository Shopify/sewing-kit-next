import type {WaterfallHook} from '@sewing-kit/core';

export interface BabelConfig {
  presets: (string | [string, {[key: string]: unknown}?])[];
  plugins: (string | [string, {[key: string]: unknown}?])[];
}

export interface BabelHooks {
  readonly babelConfig: WaterfallHook<BabelConfig>;
}
