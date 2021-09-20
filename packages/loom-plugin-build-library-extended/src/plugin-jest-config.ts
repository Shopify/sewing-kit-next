import {createProjectTestPlugin} from '@shopify/loom';

import type {} from '@shopify/loom-plugin-jest';

const TRANSFORM_STYLES =
  '@shopify/loom-plugin-build-library-extended/transform-style.js';
const TRANSFORM_SVG =
  '@shopify/loom-plugin-build-library-extended/transform-svg.js';

export function jestConfig() {
  return createProjectTestPlugin(
    'Loom.BuildLibraryExtended.JestConfig',
    ({hooks}) => {
      hooks.configure.hook((configuration) => {
        configuration.jestTransforms?.hook((transforms) => ({
          ...transforms,
          '\\.graphql': require.resolve('graphql-mini-transforms/jest'),
          '\\.svg': require.resolve(TRANSFORM_SVG),
          '\\.s?css$': require.resolve(TRANSFORM_STYLES),
        }));
      });
    },
  );
}
