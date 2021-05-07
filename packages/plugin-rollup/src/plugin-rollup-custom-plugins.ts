import {createProjectBuildPlugin, Package} from '@sewing-kit/plugins';

import type {Plugin as RollupPlugin} from 'rollup';

// Ambient types for hooks provided by rollup-plugin-core
import type {} from './plugin-rollup-core';
import {rollupNameForTargetOptions} from './utilities';

type PluginsOrPluginsBuilder =
  | ((target: string) => RollupPlugin[])
  | RollupPlugin[];

/**
 * Sewing-kit plugin for adding additional Rollup plugins to the buiild.
 *
 * Accepts either:
 * - An array of Rollup plugins to be added
 * - A function that accepts the Rollup build type ('default' or 'esnext') and
 *   returns an array of Rollup plugins to be added
 */
export function rollupCustomPlugins(plugins: PluginsOrPluginsBuilder) {
  return createProjectBuildPlugin<Package>(
    'SewingKit.Rollup.CustomPlugins',
    ({hooks}) => {
      hooks.target.hook(({hooks, target}) => {
        const name = rollupNameForTargetOptions(target.options);

        if (!name) {
          return;
        }

        hooks.configure.hook((configuration) => {
          configuration.rollupPlugins?.hook((rollupPlugins) => {
            // plugins may be either an array of plugins or a builder function
            // that returns the plugins for a given target
            const pluginsArray = Array.isArray(plugins)
              ? plugins
              : plugins(name);

            return rollupPlugins.concat(pluginsArray);
          });
        });
      });
    },
  );
}
