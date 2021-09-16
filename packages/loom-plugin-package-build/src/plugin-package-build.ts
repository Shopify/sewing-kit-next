import {Package, createComposedProjectPlugin} from '@shopify/loom';
import {rollupHooks, rollupBuild} from '@shopify/loom-plugin-rollup';

import {rollupConfig} from './plugin-rollup-config';
import {writeBinaries} from './plugin-write-binaries';
import {writeEntrypoints} from './plugin-write-entrypoints';

export interface PackageBuildOptions {
  readonly browserTargets: string;
  readonly nodeTargets: string;
  readonly binaries?: boolean;
  readonly commonjs?: boolean;
  readonly esmodules?: boolean;
  readonly esnext?: boolean;
  readonly rootEntrypoints?: boolean;
}

export function packageBuild({
  browserTargets,
  nodeTargets,
  binaries = true,
  rootEntrypoints = true,
  commonjs = true,
  esmodules = true,
  esnext = true,
}: PackageBuildOptions) {
  return createComposedProjectPlugin<Package>(
    'Loom.PackageBuild',
    async (composer) => {
      composer.use(
        rollupHooks(),
        rollupBuild(),
        rollupConfig({
          browserTargets,
          nodeTargets,
          commonjs,
          esmodules,
          esnext,
        }),
        binaries && writeBinaries(),
        rootEntrypoints && writeEntrypoints({commonjs, esmodules, esnext}),
      );
    },
  );
}