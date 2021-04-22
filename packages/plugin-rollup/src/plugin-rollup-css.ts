import {createProjectBuildPlugin, Package} from '@sewing-kit/plugins';

import type {} from './plugin-rollup-core';

export function rollupCss() {
  return createProjectBuildPlugin<Package>(
    'SewingKit.Rollup.Css',
    ({hooks}) => {
      hooks.target.hook(({hooks}) => {
        hooks.configure.hook((hooks) => {
          hooks.rollupPlugins?.hook((rollupPlugins) => {
            const dummyPlugin = () => ({name: 'dummyCssPlugin'});

            rollupPlugins.push(dummyPlugin());
            return rollupPlugins;
          });
        });
      });
    },
  );
}
