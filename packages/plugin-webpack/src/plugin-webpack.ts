import {join} from 'path';
import {createHash} from 'crypto';

import {
  Env,
  Task,
  Target,
  Service,
  WebApp,
  Package,
  Project,
  Workspace,
  PluginApi,
  addHooks,
  StepResources,
  MissingPluginError,
  WaterfallHook,
  createProjectPlugin,
  createProjectBuildPlugin,
  projectTypeSwitch,
  Runtime,
} from '@shopify/loom';
import type {
  BuildWebAppTargetOptions,
  BuildServiceTargetOptions,
  BuildPackageTargetOptions,
  BuildWebAppConfigurationHooks,
  BuildServiceConfigurationHooks,
  DevWebAppConfigurationHooks,
  DevServiceConfigurationHooks,
} from '@shopify/loom';

interface WebpackHooks {
  readonly webpackCachePath: WaterfallHook<string>;
  readonly webpackTarget: WaterfallHook<
    Extract<import('webpack').Configuration['target'], string>
  >;
  readonly webpackRules: WaterfallHook<
    ReadonlyArray<import('webpack').RuleSetRule>
  >;
  readonly webpackDevtool: WaterfallHook<
    import('webpack').Options.Devtool | undefined
  >;
  readonly webpackPlugins: WaterfallHook<
    ReadonlyArray<import('webpack').Plugin>
  >;
  readonly webpackConfig: WaterfallHook<
    Readonly<import('webpack').Configuration>
  >;
  readonly webpackPublicPath: WaterfallHook<string>;
  readonly webpackExternals: WaterfallHook<
    ReadonlyArray<import('webpack').ExternalsElement>
  >;

  readonly webpackOutputDirectory: WaterfallHook<string>;
  readonly webpackOutputFilename: WaterfallHook<string>;
  readonly webpackOutputChunkFilename: WaterfallHook<string>;
  readonly webpackOutputHashFunction: WaterfallHook<string>;
  readonly webpackOutputHashDigestLength: WaterfallHook<number>;
  readonly webpackEntries: WaterfallHook<ReadonlyArray<string>>;
  readonly webpackExtensions: WaterfallHook<ReadonlyArray<string>>;
  readonly webpackAliases: WaterfallHook<{[key: string]: string}>;
  readonly webpackMainFields: WaterfallHook<ReadonlyArray<string>>;

  readonly webpackOptimize: WaterfallHook<
    import('webpack').Options.Optimization
  >;
  readonly webpackOptimizeMinimize: WaterfallHook<boolean>;
  readonly webpackOptimizeNamedOutputs: WaterfallHook<boolean>;
  readonly webpackOptimizeMinizers: WaterfallHook<
    Readonly<NonNullable<import('webpack').Options.Optimization['minimizer']>>
  >;
  readonly webpackOptimizeRuntimeChunk: WaterfallHook<
    import('webpack').Options.Optimization['runtimeChunk']
  >;
  readonly webpackOptimizeSplitChunks: WaterfallHook<
    import('webpack').Options.Optimization['splitChunks']
  >;
  readonly webpackTerserOptions: WaterfallHook<
    import('terser-webpack-plugin').TerserPluginOptions['terserOptions']
  >;
  readonly webpackTerserParallel: WaterfallHook<
    import('terser-webpack-plugin').TerserPluginOptions['parallel']
  >;
  readonly webpackTerserPluginOptions: WaterfallHook<
    import('terser-webpack-plugin').TerserPluginOptions
  >;
  readonly webpackPerformance: WaterfallHook<
    import('webpack').Options.Performance
  >;
}

type WebpackStats = import('webpack').Stats;
type WebpackStatsMap<TType extends Project> = Map<
  TType extends WebApp
    ? BuildWebAppTargetOptions
    : TType extends Package
    ? BuildPackageTargetOptions
    : TType extends Service
    ? BuildServiceTargetOptions
    : never,
  WebpackStats
>;

interface WebpackProjectContext<TType extends Project = Project> {
  readonly webpackStats: WebpackStatsMap<TType>;
}

declare module '@shopify/loom' {
  interface BuildProjectConfigurationCustomHooks extends WebpackHooks {}
  interface DevProjectConfigurationCustomHooks extends WebpackHooks {}

  interface BuildWebAppCustomContext extends WebpackProjectContext<WebApp> {}
  interface BuildPackageCustomContext extends WebpackProjectContext<Package> {}
  interface BuildServiceCustomContext extends WebpackProjectContext<Service> {}
}

const PLUGIN = 'Loom.Webpack';

const addWebpackHooks = addHooks<WebpackHooks>(() => ({
  webpackCachePath: new WaterfallHook(),
  webpackTarget: new WaterfallHook(),
  webpackRules: new WaterfallHook(),
  webpackConfig: new WaterfallHook(),
  webpackPlugins: new WaterfallHook(),
  webpackExternals: new WaterfallHook(),
  webpackPublicPath: new WaterfallHook(),
  webpackOutputDirectory: new WaterfallHook(),
  webpackOutputFilename: new WaterfallHook(),
  webpackOutputChunkFilename: new WaterfallHook(),
  webpackOutputHashFunction: new WaterfallHook(),
  webpackOutputHashDigestLength: new WaterfallHook(),
  webpackMainFields: new WaterfallHook(),
  webpackEntries: new WaterfallHook(),
  webpackExtensions: new WaterfallHook(),
  webpackAliases: new WaterfallHook(),
  webpackDevtool: new WaterfallHook(),
  webpackOptimize: new WaterfallHook(),
  webpackOptimizeMinize: new WaterfallHook(),
  webpackOptimizeNamedOutputs: new WaterfallHook(),
  webpackOptimizeMinizers: new WaterfallHook(),
  webpackOptimizeRuntimeChunk: new WaterfallHook(),
  webpackOptimizeMinimize: new WaterfallHook(),
  webpackOptimizeSplitChunks: new WaterfallHook(),
  webpackTerserOptions: new WaterfallHook(),
  webpackTerserParallel: new WaterfallHook(),
  webpackTerserPluginOptions: new WaterfallHook(),
  webpackPerformance: new WaterfallHook(),
}));

export function webpackHooks() {
  return createProjectPlugin(PLUGIN, ({tasks: {build, dev}}) => {
    build.hook(({hooks}) => {
      hooks.configureHooks.hook(addWebpackHooks);
      hooks.context.hook((context) => ({
        ...context,
        webpackStats: new Map(),
      }));
    });

    dev.hook(({hooks}) => {
      hooks.configureHooks.hook(addWebpackHooks);
    });
  });
}

interface BuildWebpackOptions {
  config?: Partial<import('webpack').Configuration>;
  resources?: StepResources;
}

export function webpackBuild({config, resources}: BuildWebpackOptions = {}) {
  return createProjectBuildPlugin<WebApp | Service>(
    `${PLUGIN}.Build`,
    ({api, hooks, options, workspace}) => {
      hooks.target.hook(({target, hooks, context}) => {
        hooks.steps.hook((steps, configuration) => [
          ...steps,
          createWebpackBuildStep({
            api,
            workspace,
            hooks: configuration,
            env: options.simulateEnv,
            sourceMaps: options.sourceMaps ?? true,
            config,
            resources,
            stats: context.project.webpackStats,
            target,
          }),
        ]);
      });
    },
  );
}

interface BuildWebpackStepOptions extends BuildWebpackOptions {
  env: Env;
  api: PluginApi;
  hooks: Partial<WebpackHooks>;
  target: Target<Project, any>;
  workspace: Workspace;
  sourceMaps?: boolean;
  stats?: WebpackStatsMap<any>;
}

export function createWebpackBuildStep({
  env,
  api,
  hooks,
  workspace,
  sourceMaps,
  config,
  resources,
  stats,
  target,
}: BuildWebpackStepOptions) {
  return api.createStep(
    {id: 'Webpack.Build', label: 'bundling with webpack', resources},
    async () => {
      const webpackStats = await buildWebpack(
        await createWebpackConfig({
          env,
          api,
          hooks,
          target,
          workspace,
          sourceMaps,
          config,
        }),
      );

      if (target) stats?.set(target as any, webpackStats);
    },
  );
}

async function buildWebpack(config: import('webpack').Configuration) {
  const {default: webpack} = await import('webpack');
  const compiler = webpack(config);

  return new Promise<import('webpack').Stats>((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
        return;
      }

      if (stats.hasErrors()) {
        reject(new Error(stats.toString('errors-warnings')));
        return;
      }

      resolve(stats);
    });
  });
}

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

const RUNTIME_TO_TARGET: {
  [K in Runtime]: Extract<import('webpack').Configuration['target'], string>;
} = {
  [Runtime.Node]: 'node',
  [Runtime.Browser]: 'web',
  [Runtime.WebWorker]: 'webworker',
  [Runtime.ServiceWorker]: 'webworker',
};

export async function createWebpackConfig({
  env,
  api,
  hooks,
  target,
  workspace,
  sourceMaps = false,
  config: explicitConfig = {},
}: Pick<
  BuildWebpackStepOptions,
  'env' | 'api' | 'hooks' | 'target' | 'workspace' | 'sourceMaps' | 'config'
>) {
  if (hooks.webpackConfig == null) {
    throw new MissingPluginError('@shopify/loom-plugin-webpack');
  }

  const [
    {
      optimize: {LimitChunkCountPlugin},
    },
    {HashOutputPlugin},
    {default: TerserWebpackPlugin},
    {default: CaseSensitivePathsPlugin},
    {default: merge},
  ] = await Promise.all([
    import('webpack'),
    import('./webpack-plugins/HashOutputPlugin'),
    import('terser-webpack-plugin'),
    import('case-sensitive-paths-webpack-plugin'),
    import('webpack-merge'),
  ] as const);

  const runtime = [...target.runtime.runtimes][0] ?? Runtime.Browser;

  const webpackTarget = await hooks.webpackTarget!.run(
    RUNTIME_TO_TARGET[runtime],
  );

  const isBrowserTarget = new Set<typeof webpackTarget>([
    'web',
    'webworker',
  ]).has(webpackTarget);

  const mode = toMode(env);
  const cachePath = await hooks.webpackCachePath!.run(api.cachePath('webpack'));

  const rules = await hooks.webpackRules!.run([]);

  const plugins = await hooks.webpackPlugins!.run([
    new CaseSensitivePathsPlugin(),
    ...(mode === 'development' && webpackTarget === 'node'
      ? [new LimitChunkCountPlugin({maxChunks: 1})]
      : []),
    ...(mode === 'production' && webpackTarget === 'web'
      ? [new HashOutputPlugin()]
      : []),
  ]);

  const extensions = await hooks.webpackExtensions!.run([
    '.mjs',
    '.js',
    '.json',
  ]);

  const variantPart = Object.keys(target.options).map((key) => {
    const value = (target.options as any)[key];

    if (typeof value === 'boolean') return value ? key : `no-${key}`;

    return value;
  });
  const outputPath = await hooks.webpackOutputDirectory!.run(
    projectTypeSwitch(target.project, {
      webApp: (webApp) =>
        workspace.fs.buildPath(
          workspace.webApps.length > 1 ? `apps/${webApp.name}` : 'app',
          ...variantPart,
        ),
      service: (service) =>
        workspace.fs.buildPath(
          workspace.services.length > 1
            ? `services/${service.name}`
            : 'service',
          ...variantPart,
        ),
      package: (pkg) => pkg.fs.buildPath(...variantPart),
    }),
  );

  const externals = await hooks.webpackExternals!.run([]);

  // TODO: do some research on whether this is the right default strategy
  let defaultSourcemaps: import('webpack').Options.Devtool | undefined;

  if (sourceMaps) {
    if (webpackTarget === 'web') {
      defaultSourcemaps = mode === 'production' ? 'hidden-source-map' : 'eval';
    } else if (webpackTarget === 'node') {
      defaultSourcemaps =
        mode === 'production' ? 'source-map' : 'hidden-source-map';
    }
  } else {
    defaultSourcemaps = false;
  }

  const devtool = await hooks.webpackDevtool!.run(defaultSourcemaps);

  const filename = await hooks.webpackOutputFilename!.run(
    webpackTarget === 'web' && mode === 'production'
      ? '[name]-[chunkhash].js'
      : '[name].js',
  );
  const chunkFilename = await hooks.webpackOutputChunkFilename!.run(
    '[name]-[chunkhash].js',
  );

  // Good defaults for subresource integrity checks
  const hashFunction = await hooks.webpackOutputHashFunction!.run('sha256');
  const hashDigestLength = await hooks.webpackOutputHashDigestLength!.run(64);

  const publicPath = await hooks.webpackPublicPath!.run('/assets/');
  const entry = await hooks.webpackEntries!.run(
    projectTypeSwitch(target.project, {
      webApp: (app) => app.entry && [app.fs.resolvePath(app.entry)],
      service: (service) =>
        service.entry && [service.fs.resolvePath(service.entry)],
      package: (pkg) =>
        pkg.entries[0]?.root && [pkg.fs.resolvePath(pkg.entries[0].root)],
    }) ?? [],
  );

  const minimize = await hooks.webpackOptimizeMinimize!.run(
    mode === 'production' && isBrowserTarget,
  );

  const [
    namedOutputs,
    minimizer,
    runtimeChunk,
    splitChunks,
    aliases,
    mainFields,
  ] = await Promise.all([
    hooks.webpackOptimizeNamedOutputs!.run(true),
    minimize
      ? []
      : (async () => {
          const [parallel, terserOptions] = await Promise.all([
            // TODO: Shopify/ CircleCI plugin to set: https://github.com/Shopify/sewing-kit/blob/1c5e7acd53786fa7530c60e3d9cdeb39e9433896/packages/sewing-kit/src/tools/webpack/config/optimization.ts#L121
            hooks.webpackTerserParallel!.run(true),
            // TODO: are these the best options? Should differential serving
            // configure them differently?
            hooks.webpackTerserOptions!.run({
              ecma: 8,
              warnings: false,
              // Per one of the authors of Preact, the extra pass may inline more esmodule imports
              // @see https://github.com/webpack-contrib/mini-css-extract-plugin/pull/509#issuecomment-599083073
              compress: {
                passes: 2,
              },
              ie8: false,
              safari10: true,
              mangle: {
                safari10: true,
              },
              // TODO: use these options for a debug mode
              // output: {beautify: true},
              // compress: {
              //   booleans: false,
              //   conditionals: false,
              //   comparisons: false,
              //   // eslint-disable-next-line @typescript-eslint/camelcase
              //   dead_code: true,
              //   inline: false,
              // },
              // mangle: false,
            }),
          ] as const);

          const options = await hooks.webpackTerserPluginOptions!.run({
            cache: join(cachePath, 'terser'),
            parallel,
            terserOptions,
          });

          return hooks.webpackOptimizeMinizers!.run([
            new TerserWebpackPlugin(options),
          ]);
        })(),
    hooks.webpackOptimizeRuntimeChunk!.run(
      mode === 'production' && webpackTarget === 'web' ? 'single' : false,
    ),
    // TODO: what is the "best" default chunking strategy for the web?
    hooks.webpackOptimizeSplitChunks!.run(
      mode === 'production' && webpackTarget === 'web'
        ? {chunks: 'all'}
        : false,
    ),
    hooks.webpackAliases!.run(defaultWorkspaceAliases(workspace)),
    // TODO do we still want to support jsnext:main?
    hooks.webpackMainFields!.run(
      webpackTarget === 'web'
        ? ['browser', 'module', 'jsnext:main', 'main']
        : ['module', 'jsnext:main', 'main'],
    ),
  ] as const);

  const optimization = await hooks.webpackOptimize!.run({
    minimize,
    minimizer:
      minimizer.length === 0
        ? undefined
        : (minimizer as Mutable<typeof minimizer>),
    noEmitOnErrors: true,
    splitChunks,
    runtimeChunk,
    namedChunks: namedOutputs,
    namedModules: namedOutputs,
    // TODO: is it safe for the server to concatenate modules?
    concatenateModules: mode === 'production',
    // TODO: is it safe to exclude server modules for side effects?
    // (current SK says no but I think it should be fine if the library
    // correctly sets sideEffects :S)
    sideEffects: true,
    nodeEnv: mode,
  });

  // TODO: figure out a better default
  const performance = await hooks.webpackPerformance!.run({
    hints: false,
  });

  return hooks.webpackConfig.run(
    merge(
      {
        mode,
        target: webpackTarget,
        // We have to set this to be able to use these items when executing in
        // node, otherwise strangeness happens, like __dirname resolving
        // to '/'.
        node:
          webpackTarget === 'node'
            ? {
                __dirname: true,
                __filename: true,
              }
            : undefined,
        entry: entry as Mutable<typeof entry>,
        devtool,
        resolve: {
          alias: aliases,
          extensions: extensions as Mutable<typeof extensions>,
          mainFields: mainFields as Mutable<typeof mainFields>,
        },
        module: {rules: rules as Mutable<typeof rules>},
        externals: externals as Mutable<typeof externals>,
        optimization,
        performance,
        output: {
          path: outputPath,
          filename,
          chunkFilename,
          publicPath,
          globalObject: webpackTarget === 'node' ? 'global' : 'self',
          libraryTarget: webpackTarget === 'node' ? 'commonjs2' : undefined,
          hashFunction,
          hashDigestLength,
          // Setting crossorigin=anonymous on async chunks improves the browser
          // behavior when errors are thrown from async chunks.
          crossOriginLoading:
            mode === 'development' && webpackTarget === 'web'
              ? 'anonymous'
              : undefined,
        },
        plugins: plugins as Mutable<typeof plugins>,
      },
      explicitConfig,
    ),
  );
}

interface CacheLoaderOptions {
  env: Env;
  api: PluginApi;
  postfix?: string;
  project: Project;
  cachePath: string;
  dependencies: ReadonlyArray<string>;
  configuration: Partial<WebpackHooks>;
}

export async function createCacheLoaderRule({
  env,
  api,
  postfix,
  project,
  dependencies,
  cachePath,
  configuration,
}: CacheLoaderOptions): Promise<import('webpack').RuleSetUse> {
  return {
    loader: 'cache-loader',
    options: {
      cacheDirectory: join(
        await configuration.webpackCachePath!.run(api.cachePath('webpack')),
        cachePath,
      ),
      cacheIdentifier: cacheIdentifierForDependencies({
        env,
        dependencies,
        project,
        postfix,
      }),
    },
  };
}

function cacheIdentifierForDependencies({
  env,
  project,
  dependencies,
  postfix = '',
}: Pick<CacheLoaderOptions, 'env' | 'project' | 'postfix' | 'dependencies'>) {
  const prefix = `sk:${env}:`;
  const dependencyString = ['webpack', ...dependencies]
    .map(
      (dependency) =>
        `${dependency}:${
          project.dependency(dependency)?.version || 'notinstalled'
        }`,
    )
    .join('&');

  return `${prefix}${createHash('md5')
    .update(dependencyString)
    .digest('hex')}${postfix}`;
}

function toMode(env: Env) {
  switch (env) {
    case Env.Production:
    case Env.Staging:
      return 'production';
    default:
      return 'development';
  }
}

interface WebpackConfigurationChangePluginOptions {
  id?: string;
  include?: (Task.Dev | Task.Build)[];
}

type ValueOrArray<TValue> = TValue | TValue[];
type ValueOrGetter<TValue> = TValue | (() => TValue | Promise<TValue>);

export function webpackRules(
  rules: ValueOrGetter<ValueOrArray<import('webpack').Rule>>,
  options: WebpackConfigurationChangePluginOptions = {},
) {
  return createWebpackConfigurationChangePlugin(
    {id: `${PLUGIN}.AddWebpackRules`, ...options},
    (configure) => {
      configure.webpackRules?.hook(async (existingRules) => [
        ...existingRules,
        ...(await unwrapPossibleArrayGetter(rules)),
      ]);
    },
  );
}

export function webpackPlugins(
  plugins: ValueOrGetter<ValueOrArray<import('webpack').Plugin>>,
  options: WebpackConfigurationChangePluginOptions = {},
) {
  return createWebpackConfigurationChangePlugin(
    {id: `${PLUGIN}.AddWebpackPlugins`, ...options},
    (configure) => {
      configure.webpackPlugins?.hook(async (existingPlugins) => [
        ...existingPlugins,
        ...(await unwrapPossibleArrayGetter(plugins)),
      ]);
    },
  );
}

export function webpackExternals(
  externals: ValueOrGetter<ValueOrArray<import('webpack').ExternalsElement>>,
  options: WebpackConfigurationChangePluginOptions = {},
) {
  return createWebpackConfigurationChangePlugin(
    {id: `${PLUGIN}.AddWebpackExternals`, ...options},
    (configure) => {
      configure.webpackExternals?.hook(async (existingExternals) => [
        ...existingExternals,
        ...(await unwrapPossibleArrayGetter(externals)),
      ]);
    },
  );
}

export function webpackSplitChunks(
  splitChunks: ValueOrGetter<
    NonNullable<import('webpack').Options.Optimization['splitChunks']>
  >,
  options: WebpackConfigurationChangePluginOptions = {},
) {
  return createWebpackConfigurationChangePlugin(
    {id: `${PLUGIN}.SetWebpackSplitChunks`, ...options},
    (configure) => {
      configure.webpackOptimizeSplitChunks?.hook(() =>
        unwrapPossibleGetter(splitChunks),
      );
    },
  );
}

export function webpackDevtool(
  devtool: ValueOrGetter<import('webpack').Options.Devtool>,
  options: WebpackConfigurationChangePluginOptions = {},
) {
  return createWebpackConfigurationChangePlugin(
    {id: `${PLUGIN}.SetWebpackDevtool`, ...options},
    (configure) => {
      configure.webpackDevtool?.hook(() => unwrapPossibleGetter(devtool));
    },
  );
}

export function webpackAliases(
  aliases: ValueOrGetter<{[key: string]: string}>,
  options: WebpackConfigurationChangePluginOptions = {},
) {
  return createWebpackConfigurationChangePlugin(
    {id: `${PLUGIN}.AddWebpackAliases`, ...options},
    (configure) => {
      configure.webpackAliases?.hook(async (existingAliases) => ({
        ...existingAliases,
        ...unwrapPossibleGetter(aliases),
      }));
    },
  );
}

export function noopModuleWithWebpack(
  module: RegExp,
  options?: WebpackConfigurationChangePluginOptions,
) {
  return webpackPlugins(
    async () =>
      new (await import('webpack')).NormalModuleReplacementPlugin(
        module,
        require.resolve('./noop'),
      ),
    options,
  );
}

function createWebpackConfigurationChangePlugin(
  {
    id,
    include = [Task.Build, Task.Dev],
  }: WebpackConfigurationChangePluginOptions & {id: string},
  run: (
    hooks:
      | BuildWebAppConfigurationHooks
      | BuildServiceConfigurationHooks
      | DevWebAppConfigurationHooks
      | DevServiceConfigurationHooks,
  ) => void,
) {
  return createProjectPlugin<WebApp | Service>(id, ({tasks: {build, dev}}) => {
    if (include.includes(Task.Build)) {
      build.hook(({hooks}) => {
        hooks.target.hook(({hooks}) => {
          hooks.configure.hook(run);
        });
      });
    }

    if (include.includes(Task.Dev)) {
      dev.hook(({hooks}) => {
        hooks.configure.hook(run);
      });
    }
  });
}

type Handler = (stats: import('webpack').Stats) => any;

export class BuildManager {
  private readonly listeners = new Map<Project, Set<Handler>>();

  on(project: Project, handler: Handler) {
    const listeners = this.listeners.get(project) ?? new Set();
    listeners.add(handler);
    this.listeners.set(project, listeners);
    return () => listeners.delete(handler);
  }

  emit(project: Project, stats: import('webpack').Stats) {
    const listeners = this.listeners.get(project);

    if (listeners == null) return;

    for (const listener of listeners) {
      listener(stats);
    }
  }
}

function unwrapPossibleGetter<T>(
  maybeGetter: ValueOrGetter<T>,
): T | Promise<T> {
  return typeof maybeGetter === 'function'
    ? (maybeGetter as any)()
    : maybeGetter;
}

async function unwrapPossibleArrayGetter<T>(
  maybeGetter: ValueOrGetter<ValueOrArray<T>>,
) {
  const result = await unwrapPossibleGetter(maybeGetter);
  return Array.isArray(result) ? result : [result];
}

function defaultWorkspaceAliases({packages}: Workspace) {
  const aliases: {[key: string]: string} = {};

  for (const pkg of packages) {
    const {entries, runtimeName} = pkg;

    for (const {name, root} of entries) {
      aliases[
        name ? join(runtimeName, `${name}$`) : `${runtimeName}$`
      ] = pkg.fs.resolvePath(root);
    }
  }

  return aliases;
}
