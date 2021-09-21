import {
  createComposedWorkspacePlugin,
  createComposedProjectPlugin,
} from '@shopify/loom';
import {babel} from '@shopify/loom-plugin-babel';
import {workspaceTypeScript} from '@shopify/loom-plugin-typescript';
import {jest} from '@shopify/loom-plugin-jest';
import {rollupHooks, rollupBuild} from '@shopify/loom-plugin-rollup';

import {rollupConfig} from './plugin-rollup-config';
import {jestConfig} from './plugin-jest-config';
import {writeBinaries} from './plugin-write-binaries';
import {writeEntrypoints} from './plugin-write-entrypoints';

type JestEnvironment = Parameters<typeof jestConfig>[0]['jestEnvironment'];

interface BuildLibraryOptions {
  readonly targets: string;
  readonly commonjs?: boolean;
  readonly esmodules?: boolean;
  readonly esnext?: boolean;
  readonly binaries?: boolean;
  readonly rootEntrypoints?: boolean;
  readonly jestEnvironment?: JestEnvironment;
}

export function buildLibrary({
  targets,
  commonjs = false,
  esmodules = false,
  esnext = false,
  binaries = true,
  rootEntrypoints = true,
  jestEnvironment = 'node',
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
    rollupHooks(),
    rollupBuild(),
    rollupConfig({targets, commonjs, esmodules, esnext}),
    jestConfig({jestEnvironment}),
    binaries && writeBinaries(),
    rootEntrypoints && writeEntrypoints({commonjs, esmodules, esnext}),
  ]);
}

export function buildLibraryWorkspace() {
  return createComposedWorkspacePlugin('Loom.BuildLibraryWorkspace', [
    workspaceTypeScript(),
    jest(),
  ]);
}
