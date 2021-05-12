import {createComposedProjectPlugin} from '@sewing-kit/plugins';

import {rollupCustomPlugins} from '@sewing-kit/plugin-rollup';
import {buildFlexibleOutputs, Options} from './index';

interface RollupPluginOptions extends Options {
  css?: boolean;
  plugins?: Parameters<typeof rollupCustomPlugins>[0];
}

export function rollupOpinionated({
  css = true,
  plugins,
  ...rest
}: RollupPluginOptions) {
  return createComposedProjectPlugin('SewingKit.Rollup.OpinionatedSetup', [
    buildFlexibleOutputs(rest),
    css && rollupCss(),
    plugins && rollupCustomPlugins(plugins),
  ]);
}

function rollupCss() {
  const dummyPlugin = () => ({name: 'dummyCssPlugin'});
  return rollupCustomPlugins([dummyPlugin]);
}
