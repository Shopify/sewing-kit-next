import {createProjectBuildPlugin, Package} from '@sewing-kit/plugins';

import {Plugin as RollupPlugin} from 'rollup';

import type {} from './plugin-rollup-core';

type PluginsOrPluginsBuilder =
  | ((target: string) => RollupPlugin[])
  | RollupPlugin[];

export function rollupCustomPlugins(plugins: PluginsOrPluginsBuilder) {
  return createProjectBuildPlugin<Package>(
    'SewingKit.Rollup.CustomPlugins',
    ({hooks}) => {
      hooks.target.hook(({hooks, target}) => {
        hooks.configure.hook((hooks) => {
          hooks.rollupPlugins?.hook((rollupPlugins) => {
            // plugins may be either an array of plugins or a builder function
            // that returns the plugins for a given target
            const pluginsArray = Array.isArray(plugins)
              ? plugins
              : plugins(target.options.rollupName || '');

            return rollupPlugins.concat(pluginsArray);
          });
        });
      });
    },
  );
}
