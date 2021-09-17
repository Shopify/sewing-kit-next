import {
  createComposedWorkspacePlugin,
  createComposedProjectPlugin,
} from '@shopify/loom';

import {rollupConfig} from './plugin-rollup-config';
import {jestConfig} from './plugin-jest-config';
import {generateGraphqlTypes} from './plugin-generate-graphql-types';

interface BuildLibraryExtendedOptions {
  readonly graphql?: boolean;
}

export function buildLibraryExtended({
  graphql = false,
}: BuildLibraryExtendedOptions = {}) {
  return createComposedProjectPlugin('Loom.BuildLibraryExtended', [
    rollupConfig({graphql}),
    jestConfig(),
  ]);
}

interface BuildLibraryWorkspaceExtendedOptions {
  readonly graphql?: boolean;
}

export function buildLibraryExtendedWorkspace({
  graphql = false,
}: BuildLibraryWorkspaceExtendedOptions = {}) {
  return createComposedWorkspacePlugin('Loom.BuildLibraryExtendedWorkspace', [
    graphql && generateGraphqlTypes(),
  ]);
}
