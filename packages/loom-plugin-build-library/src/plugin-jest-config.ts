import {createProjectTestPlugin} from '@shopify/loom';

interface JestConfigOptions {
  jestEnvironment: 'node' | 'jsdom';
}

const TRANSFORM_STYLES =
  '@shopify/loom-plugin-build-library/transform-style.js';
const TRANSFORM_SVG = '@shopify/loom-plugin-build-library/transform-svg.js';

export function jestConfig({jestEnvironment}: JestConfigOptions) {
  return createProjectTestPlugin('Loom.BuildLibrary.JestConfig', ({hooks}) => {
    hooks.configure.hook((configuration) => {
      configuration.jestEnvironment?.hook(() => jestEnvironment);
      configuration.jestTransforms?.hook((transforms) => ({
        ...transforms,
        '\\.graphql': require.resolve('graphql-mini-transforms/jest'),
        '\\.svg': require.resolve(TRANSFORM_SVG),
        '\\.s?css$': require.resolve(TRANSFORM_STYLES),
      }));
    });
  });
}
