import {Package, createComposedProjectPlugin} from '@sewing-kit/core';
import {rollupHooks, rollupBuild} from '@sewing-kit/plugin-rollup';

import {rollupConfig} from './plugin-rollup-config';
import {buildBinaries} from './plugin-package-binaries';

export interface PackageBuildOptions {
  readonly browserTargets: string;
  readonly nodeTargets: string;
  readonly binaries?: boolean;
  readonly commonjs?: boolean;
  readonly esmodules?: boolean;
  readonly esnext?: boolean;
}

export function packageBuild({
  browserTargets,
  nodeTargets,
  binaries = true,
  commonjs = true,
  esmodules = true,
  esnext = true,
}: PackageBuildOptions) {
  return createComposedProjectPlugin<Package>(
    'SewingKit.PackageBuild',
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
        binaries && buildBinaries(),
      );
    },
  );
}
