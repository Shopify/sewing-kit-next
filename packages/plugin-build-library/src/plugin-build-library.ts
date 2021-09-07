import {
  createComposedWorkspacePlugin,
  createComposedProjectPlugin,
} from '@sewing-kit/core';
import {babel} from '@sewing-kit/plugin-babel';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';
import {jest} from '@sewing-kit/plugin-jest';
import {packageBuild} from '@sewing-kit/plugin-package-build';

import {rollupConfig} from './plugin-rollup-config';
import {jestConfig} from './plugin-jest-config';
import {generateGraphqlTypes} from './plugin-generate-graphql-types';

interface BuildLibraryOptions {
  browserTargets: string;
  nodeTargets: string;
  readonly hasGraphql?: boolean;
  readonly jestEnvironment?: Parameters<
    typeof jestConfig
  >[0]['jestEnvironment'];
  readonly packageBuildOptions?: Parameters<typeof packageBuild>[0];
  readonly babelOptions?: Parameters<typeof babel>[0];
}

export function buildLibrary({
  browserTargets,
  nodeTargets,
  hasGraphql = false,
  jestEnvironment = 'node',
  babelOptions = {},
  packageBuildOptions = {browserTargets, nodeTargets},
}: BuildLibraryOptions) {
  return createComposedProjectPlugin('SewingKit.BuildLibrary', [
    // this needs to be set/ find the babel.config.js file at the root of the proje here as'the't
    babel({
      config: {
        presets: [
          [
            require.resolve('@shopify/babel-preset'),
            {typescript: true, react: true},
          ],
        ],
        configFile: false,
      },
      ...babelOptions,
    }),
    packageBuild(packageBuildOptions),
    rollupConfig({hasGraphql}),
    jestConfig({jestEnvironment}),
  ]);
}

interface BuildLibraryWorkspaceOptions {
  readonly hasGraphql?: boolean;
}

export function buildLibraryWorkspace({
  hasGraphql = false,
}: BuildLibraryWorkspaceOptions) {
  return createComposedWorkspacePlugin('SewingKit.BuildLibraryWorkspace', [
    workspaceTypeScript(),
    jest(),
    hasGraphql && generateGraphqlTypes(),
  ]);
}
