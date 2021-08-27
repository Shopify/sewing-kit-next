import {
  createComposedWorkspacePlugin,
  createComposedProjectPlugin,
  createProjectPlugin,
} from '@sewing-kit/core';
import {babel} from '@sewing-kit/plugin-babel';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';
import {jest} from '@sewing-kit/plugin-jest';
import {packageBuild} from '@sewing-kit/plugin-package-build';

import {pluginRollupConfig} from './plugin-rollup-config';
import {pluginGraphqlGraphqlTypes} from './plugin-generate-graphql-types';
import {pluginCopyTranslations} from './plugin-copy-translations';

export interface LibaryPackageOptions {
  readonly hasGraphql?: boolean;
  readonly jestEnvironment?: 'node' | 'jsdom';
}

export interface LibaryWorkspaceOptions {
  readonly hasGraphql?: boolean;
}

const TRANSFORM_STYLES = '@sewing-kit/plugin-build-library/transform-style.js';
const TRANSFORM_SVG = '@sewing-kit/plugin-build-library/transform-svg.js';

export function libaryPackagePlugin({
  hasGraphql = false,
  jestEnvironment = 'node',
}: LibaryPackageOptions) {
  return createComposedProjectPlugin('Sewing-kit.Library.Package.Plugin', [
    // this needs to be set/ find the babel.config.js file at the root of the proje here as'the't
    babel({
      config: {
        presets: [
          [
            require.resolve('@shopify/babel-preset'),
            {typescript: true, react: true},
          ],
        ],
        plugins: [require.resolve('@shopify/react-i18n/babel')],
        configFile: false,
      },
    }),
    createProjectPlugin(
      'Sewing-kit.Library.Package.Test',
      ({tasks: {test}}) => {
        test.hook(({hooks}) => {
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
      },
    ),
    packageBuild({
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Browser`
      browserTargets: 'extends @shopify/browserslist-config, ios >= 12',
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Node`
      nodeTargets: 'node 12.13',
    }),
    pluginRollupConfig({hasGraphql}),
  ]);
}

export function libaryWorkspacePlugin({
  hasGraphql = false,
}: LibaryWorkspaceOptions) {
  return createComposedWorkspacePlugin('Sewing-kit.Library.Workspace.Plugin', [
    jest(),
    hasGraphql && pluginGraphqlGraphqlTypes(),
    workspaceTypeScript(),
    pluginCopyTranslations(),
  ]);
}
