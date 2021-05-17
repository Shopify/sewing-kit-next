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
        typeof import('./plugin-package-typescript').buildTypeScriptDefinitions
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
    const hasPluginTypescriptDependency = await import(
      '@sewing-kit/plugin-typescript'
    ).then(
      () => true,
      () => false,
    );

    const [
      {rollupHooks, rollupBuild},
      {rollupConfig},
      {buildBinaries} = {buildBinaries: undefined},
      {buildTypeScriptDefinitions} = {buildTypeScriptDefinitions: undefined},
    ] = await Promise.all([
      import('@sewing-kit/plugin-rollup'),
      import('./plugin-rollup-config'),
      binaries ? import('./plugin-package-binaries') : emptyPromise,
      hasPluginTypescriptDependency && typescript
        ? import('./plugin-package-typescript')
        : emptyPromise,
    ]);

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
      buildBinaries && buildBinaries(),
      buildTypeScriptDefinitions &&
        buildTypeScriptDefinitions(
          typeof typescript === 'boolean' ? {} : typescript,
        ),
    );
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
          ? import('./plugin-package-esmodules').then(({esmodulesOutput}) =>
              esmodulesOutput(),
            )
          : emptyPromise,
        esnext
          ? import('./plugin-package-esnext').then(({esnextOutput}) =>
              esnextOutput(),
            )
          : emptyPromise,
      ]);

      composer.use(...composed);
    },
  );
}
