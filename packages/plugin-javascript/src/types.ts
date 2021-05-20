import type {WaterfallHook} from '@sewing-kit/plugins';

export interface BabelConfig {
  presets: (string | [string, {[key: string]: unknown}?])[];
  plugins: (string | [string, {[key: string]: unknown}?])[];
}

export interface BabelHooks {
  readonly babelConfig: WaterfallHook<BabelConfig>;
  readonly babelExtensions: WaterfallHook<ReadonlyArray<string>>;
  readonly babelIgnorePatterns: WaterfallHook<ReadonlyArray<string>>;
  readonly babelCacheDependencies: WaterfallHook<ReadonlyArray<string>>;
}
