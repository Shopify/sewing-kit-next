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
  readonly graphql?: boolean;
  readonly jestEnvironment?: Parameters<
    typeof jestConfig
  >[0]['jestEnvironment'];
  readonly packageBuildOptions?: Partial<Parameters<typeof packageBuild>[0]>;
}

export function buildLibrary({
  browserTargets,
  nodeTargets,
  graphql = false,
  jestEnvironment = 'node',
  packageBuildOptions = {},
}: BuildLibraryOptions) {
  return createComposedProjectPlugin('Loom.BuildLibrary', [
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
    }),
    packageBuild({browserTargets, nodeTargets, ...packageBuildOptions}),
    rollupConfig({graphql}),
    jestConfig({jestEnvironment}),
  ]);
}

interface BuildLibraryWorkspaceOptions {
  readonly graphql?: boolean;
}

export function buildLibraryWorkspace({
  graphql = false,
}: BuildLibraryWorkspaceOptions) {
  return createComposedWorkspacePlugin('Loom.BuildLibraryWorkspace', [
    workspaceTypeScript(),
    jest(),
    graphql && generateGraphqlTypes(),
  ]);
}
