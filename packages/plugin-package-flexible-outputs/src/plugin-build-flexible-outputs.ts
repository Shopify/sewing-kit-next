import {Package, createComposedProjectPlugin} from '@sewing-kit/plugins';

import {rollupHooks, rollupBuild} from '@sewing-kit/plugin-rollup';
import {rollupConfig} from './plugin-rollup-config';
import {buildBinaries} from './plugin-package-binaries';

export interface Options {
  readonly browserTargets: string;
  readonly nodeTargets: string;
  readonly binaries?: boolean;
  readonly commonjs?: boolean;
  readonly esmodules?: boolean;
  readonly esnext?: boolean;
  readonly typescript?:
    | boolean
    | Parameters<
        typeof import('./plugin-package-typescript').buildTypeScriptDefinitions
      >[0];
}

export function buildFlexibleOutputs({
  browserTargets,
  nodeTargets,
  binaries = true,
  commonjs = true,
  esmodules = true,
  esnext = true,
  typescript = true,
}: Options) {
  return createComposedProjectPlugin<Package>(
    'SewingKit.PackageBuildFlexibleOutputs',
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
