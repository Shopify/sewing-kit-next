import {Package, createComposedProjectPlugin} from '@sewing-kit/plugins';
import {rollupHooks, rollupBuild} from '@sewing-kit/plugin-rollup';

import {rollupConfig} from './plugin-rollup-config';
import {buildBinaries} from './plugin-package-binaries';
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
      );

      // Typescript support only works if `@sewing-kit/plugin-typescript`
      // is available as a peer dependency. Failing is expected if it is absent.
      if (typescript) {
        try {
          const {buildTypeScriptDefinitions} = await import(
            './plugin-package-typescript'
          );

          composer.use(
            buildTypeScriptDefinitions(
              typeof typescript === 'boolean' ? {} : typescript,
            ),
          );
        } catch {
          // intentional noop
        }
      }
    },
  );
}
