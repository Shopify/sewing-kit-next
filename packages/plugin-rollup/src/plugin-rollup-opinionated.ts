import {Package, createComposedProjectPlugin} from '@sewing-kit/plugins';

import {rollupHooks, rollupBuild} from './plugin-rollup';
import {
  rollupBuildDefault,
  RollupBuildDefaultPluginOptions,
} from './plugin-rollup-build-default';
import {rollupCustomPlugins} from './plugin-rollup-custom-plugins';
import {rollupCss} from './plugin-rollup-css';

interface RollupPluginOptions extends RollupBuildDefaultPluginOptions {
  css?: boolean;
  plugins?: Parameters<typeof rollupCustomPlugins>[0];
}

export function rollupOpinionated({
  css = true,
  plugins,
  ...rest
}: RollupPluginOptions) {
  return createComposedProjectPlugin<Package>(
    'SewingKit.Rollup.OpinionatedSetup',
    [
      rollupHooks(),
      rollupBuild(),
      rollupBuildDefault(rest),
      css && rollupCss(),
      plugins && rollupCustomPlugins(plugins),
    ],
  );
}
