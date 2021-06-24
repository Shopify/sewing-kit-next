import {Package, createComposedProjectPlugin} from '@sewing-kit/plugins';
import {rollupHooks, rollupBuild} from '@sewing-kit/plugin-rollup';

import {rollupConfig} from './plugin-rollup-config';
import {buildBinaries} from './plugin-package-binaries';
import {buildTypeScriptDefinitions} from './plugin-package-typescript';
import type {BuildTypeScriptDefinitionsOptions} from './plugin-package-typescript';

export interface PackageBuildOptions {
  readonly browserTargets: string;
  readonly nodeTargets: string;
  readonly binaries?: boolean;
  readonly commonjs?: boolean;
  readonly esmodules?: boolean;
  readonly esnext?: boolean;
  readonly typescript?: boolean | BuildTypeScriptDefinitionsOptions;
}

export function packageBuild({
  browserTargets,
  nodeTargets,
  binaries = true,
  commonjs = true,
  esmodules = true,
  esnext = true,
  typescript = true,
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
        typescript &&
          buildTypeScriptDefinitions(
            typeof typescript === 'boolean' ? {} : typescript,
          ),
      );
    },
  );
}
