import {
  WebApp,
  Package,
  Service,
  createComposedProjectPlugin,
} from '@sewing-kit/plugins';

const PLUGIN = 'SewingKit.PackageFlexibleOutputs';

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
        typeof import('@sewing-kit/plugin-package-typescript').buildTypeScriptDefinitions
      >[0];
}

const emptyPromise = Promise.resolve(undefined);

export function buildFlexibleOutputs({
  browserTargets,
  nodeTargets,
  binaries = true,
  commonjs = true,
  esmodules = true,
  esnext = true,
  typescript = true,
}: Options) {
  return createComposedProjectPlugin<Package>(PLUGIN, async (composer) => {
    const composed = await Promise.all([
      import('@sewing-kit/plugin-rollup').then((mod) => mod.rollupHooks()),
      import('@sewing-kit/plugin-rollup').then((mod) => mod.rollupBuild()),

      import('./plugin-rollup-config').then(({rollupConfig}) =>
        rollupConfig({
          browserTargets,
          nodeTargets,
          commonjs,
          esmodules,
          esnext,
        }),
      ),

      binaries
        ? import(
            '@sewing-kit/plugin-package-binaries'
          ).then(({buildBinaries}) => buildBinaries())
        : emptyPromise,

      typescript
        ? import(
            '@sewing-kit/plugin-package-typescript'
          ).then(({buildTypeScriptDefinitions}) =>
            typeof typescript === 'boolean'
              ? buildTypeScriptDefinitions()
              : buildTypeScriptDefinitions(typescript),
          )
        : emptyPromise,
    ]);

    composer.use(...composed);
  });
}

export interface ConsumerOptions
  extends Pick<Options, 'esnext' | 'esmodules'> {}

export function flexibleOutputs({
  esmodules = true,
  esnext = true,
}: ConsumerOptions = {}) {
  return createComposedProjectPlugin<WebApp | Service>(
    PLUGIN,
    async (composer) => {
      const composed = await Promise.all([
        esmodules
          ? import(
              '@sewing-kit/plugin-package-esmodules'
            ).then(({esmodulesOutput}) => esmodulesOutput())
          : emptyPromise,
        esnext
          ? import('@sewing-kit/plugin-package-esnext').then(({esnextOutput}) =>
              esnextOutput(),
            )
          : emptyPromise,
      ]);

      composer.use(...composed);
    },
  );
}
