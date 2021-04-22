import {Package, createComposedProjectPlugin} from '@sewing-kit/plugins';

import {rollupCore, RollupCorePluginOptions} from './plugin-rollup-core';
import {rollupCustomPlugins} from './plugin-rollup-custom-plugins';
import {rollupCss} from './plugin-rollup-css';

interface RollupPluginOptions extends RollupCorePluginOptions {
  css?: boolean;
  plugins?: Parameters<typeof rollupCustomPlugins>[0];
}

export function rollup({
  css = true,
  plugins,
  ...corePluginOptions
}: RollupPluginOptions) {
  return createComposedProjectPlugin<Package>('SewingKit.Rollup', [
    rollupCore(corePluginOptions),
    css && rollupCss(),
    plugins && rollupCustomPlugins(plugins),
  ]);
}
