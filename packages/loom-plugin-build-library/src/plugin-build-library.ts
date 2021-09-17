import {
  createComposedWorkspacePlugin,
  createComposedProjectPlugin,
} from '@shopify/loom';
import {babel} from '@shopify/loom-plugin-babel';
import {workspaceTypeScript} from '@shopify/loom-plugin-typescript';
import {jest} from '@shopify/loom-plugin-jest';
import {packageBuild} from '@shopify/loom-plugin-package-build';

import {rollupConfigExtended} from './plugin-rollup-config-extended';
import {jestConfig} from './plugin-jest-config';
import {generateGraphqlTypes} from './plugin-generate-graphql-types';

type PackageBuildOptions = Parameters<typeof packageBuild>[0];

type JestEnvironment = Parameters<typeof jestConfig>[0]['jestEnvironment'];

interface BuildLibraryOptions extends PackageBuildOptions {
  readonly graphql?: boolean;
  readonly jestEnvironment?: JestEnvironment;
}

export function buildLibrary({
  graphql = false,
  jestEnvironment = 'node',
  ...packageBuildOptions
}: BuildLibraryOptions) {
  return createComposedProjectPlugin('Loom.BuildLibrary', [
    babel({
      config: {
        presets: [
          [
            require.resolve('@shopify/babel-preset'),
            {typescript: true, react: true},
          ],
        ],
        // Disable loading content from babel.config.js
        configFile: false,
      },
    }),
    packageBuild(packageBuildOptions),
    rollupConfigExtended({graphql}),
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
