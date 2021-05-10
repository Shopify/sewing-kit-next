import {createProjectBuildPlugin, Package, Target} from '@sewing-kit/plugins';
import type {BuildPackageTargetOptions} from '@sewing-kit/hooks';

import type {Plugin as RollupPlugin} from 'rollup';

// Ambient types for hooks provided by rollup-plugin
import type {} from './plugin-rollup';

type PluginsOrPluginsBuilder =
  | ((target: Target<Package, BuildPackageTargetOptions>) => RollupPlugin[])
  | RollupPlugin[];

/**
 * Sewing-kit plugin for adding additional Rollup plugins to the build.
 *
 * Accepts either:
 * - An array of Rollup plugins to be added
 * - A function that accepts a Target object and returns an array of Rollup
 *   plugins to be added
 */
export function rollupCustomPlugins(plugins: PluginsOrPluginsBuilder) {
  return createProjectBuildPlugin<Package>(
    'SewingKit.Rollup.CustomPlugins',
    ({hooks}) => {
      hooks.target.hook(({hooks, target}) => {
        hooks.configure.hook((configuration) => {
          configuration.rollupPlugins?.hook((rollupPlugins) => {
            // plugins may be either an array of plugins or a builder function
            // that returns the plugins for a given target
            const pluginsArray = Array.isArray(plugins)
              ? plugins
              : plugins(target);

            return rollupPlugins.concat(pluginsArray);
          });
        });
      });
    },
  );
}
