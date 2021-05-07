import {createProjectBuildPlugin, Package} from '@sewing-kit/plugins';

// Ambient types for hooks provided by rollup-plugin
import type {} from './plugin-rollup';

export function rollupCss() {
  return createProjectBuildPlugin<Package>(
    'SewingKit.Rollup.Css',
    ({hooks}) => {
      hooks.target.hook(({hooks}) => {
        hooks.configure.hook((configuration) => {
          configuration.rollupPlugins?.hook((rollupPlugins) => {
            const dummyPlugin = () => ({name: 'dummyCssPlugin'});

            rollupPlugins.push(dummyPlugin());
            return rollupPlugins;
          });
        });
      });
    },
  );
}
