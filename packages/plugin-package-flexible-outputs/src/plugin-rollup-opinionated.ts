import {createComposedProjectPlugin} from '@sewing-kit/plugins';

import {
  rollupHooks,
  rollupBuild,
  rollupCustomPlugins,
} from '@sewing-kit/plugin-rollup';
import {
  rollupBuildDefault,
  RollupBuildDefaultPluginOptions,
} from './plugin-rollup-build-default';

interface RollupPluginOptions extends RollupBuildDefaultPluginOptions {
  css?: boolean;
  plugins?: Parameters<typeof rollupCustomPlugins>[0];
}

export function rollupOpinionated({
  css = true,
  plugins,
  ...rest
}: RollupPluginOptions) {
  return createComposedProjectPlugin('SewingKit.Rollup.OpinionatedSetup', [
    rollupHooks(),
    rollupBuild(),
    rollupBuildDefault(rest),
    css && rollupCss(),
    plugins && rollupCustomPlugins(plugins),
  ]);
}

function rollupCss() {
  const dummyPlugin = () => ({name: 'dummyCssPlugin'});
  return rollupCustomPlugins([dummyPlugin]);
}
