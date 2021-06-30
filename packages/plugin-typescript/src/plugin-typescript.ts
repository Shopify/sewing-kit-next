import {join, resolve} from 'path';

import {copy} from 'fs-extra';
import {
  Env,
  Workspace,
  WaterfallHook,
  DiagnosticError,
  createProjectPlugin,
  createWorkspacePlugin,
  WorkspacePluginContext,
  TargetRuntime,
} from '@sewing-kit/plugins';
import {createJavaScriptWebpackRuleSet} from '@sewing-kit/plugin-javascript';
import type {BabelConfig} from '@sewing-kit/plugin-javascript';

import type {} from '@sewing-kit/plugin-jest';
import type {} from '@sewing-kit/plugin-webpack';

interface TypeScriptTypeCheckingHooks {
  readonly typescriptHeap: WaterfallHook<number>;
}

declare module '@sewing-kit/hooks' {
  interface TypeCheckWorkspaceConfigurationCustomHooks
    extends TypeScriptTypeCheckingHooks {}
  interface BuildWorkspaceConfigurationCustomHooks
    extends TypeScriptTypeCheckingHooks {}
}

const PLUGIN = 'SewingKit.TypeScript';

export function typescript() {
  return createProjectPlugin(
    PLUGIN,
    ({api, project, tasks: {dev, build, test}}) => {
      test.hook(({hooks}) => {
        hooks.configure.hook((hooks) => {
          hooks.jestExtensions?.hook(addTypeScriptExtensions);
          hooks.jestTransforms?.hook((transforms, {babelTransform}) => ({
            ...transforms,
            '^.+\\.tsx?$': babelTransform,
          }));

          hooks.babelConfig?.hook(addTypeScriptBabelConfig);
        });
      });

      build.hook(({hooks, options}) => {
        hooks.target.hook(({target, hooks}) => {
          hooks.configure.hook((configure) => {
            configure.babelConfig?.hook(addTypeScriptBabelConfig);
            configure.babelExtensions?.hook(addTypeScriptExtensions);
            configure.babelIgnorePatterns?.hook(addTypeScriptTestIgnorePattern);
            configure.webpackExtensions?.hook(addTypeScriptExtensions);
            configure.webpackPlugins?.hook(addWebpackPlugins);
            configure.webpackRules?.hook(async (rules) => [
              ...rules,
              {
                test: /\.tsx?/,
                exclude: /node_modules/,
                use: await createJavaScriptWebpackRuleSet({
                  api,
                  target,
                  env: options.simulateEnv,
                  configuration: configure,
                  cacheDirectory: 'ts',
                  cacheDependencies: [],
                }),
              },
            ]);
          });
        });
      });

      dev.hook(({hooks}) => {
        hooks.configure.hook((configure) => {
          configure.babelConfig?.hook(addTypeScriptBabelConfig);
          configure.webpackExtensions?.hook(addTypeScriptExtensions);
          configure.webpackPlugins?.hook(addWebpackPlugins);
          configure.webpackRules?.hook(async (rules) => [
            ...rules,
            {
              test: /\.tsx?/,
              exclude: /node_modules/,
              use: await createJavaScriptWebpackRuleSet({
                api,
                target: {
                  project,
                  options: {},
                  runtime: TargetRuntime.fromProject(project),
                },
                env: Env.Development,
                configuration: configure,
                cacheDirectory: 'ts',
                cacheDependencies: [],
              }),
            },
          ]);
        });
      });
    },
  );
}

export function workspaceTypeScript() {
  return createWorkspacePlugin(PLUGIN, (context) => {
    const {
      workspace,
      tasks: {build, typeCheck},
    } = context;

    build.hook(({hooks, options}) => {
      hooks.configureHooks.hook((hooks: any) => ({
        ...hooks,
        typescriptHeap: new WaterfallHook(),
      }));

      // We don’t build TypeScript definitions for workspaces that only include
      // web apps or services
      if (
        (workspace.webApps.length > 0 || workspace.services.length > 0) &&
        workspace.packages.length === 0
      ) {
        return;
      }

      hooks.pre.hook((steps, {configuration}) => {
        const newSteps = [...steps];

        if (options.cache) {
          newSteps.push(createLoadTypeScriptCacheStep(context));
        }

        newSteps.push(createRunTypeScriptStep(context, configuration));

        return newSteps;
      });

      if (options.cache) {
        hooks.post.hook((steps) => [...steps, createCacheSaveStep(context)]);
      }
    });

    typeCheck.hook(({hooks, options}) => {
      hooks.configureHooks.hook((hooks) => ({
        ...hooks,
        typescriptHeap: new WaterfallHook(),
      }));

      hooks.pre.hook((steps) => {
        const newSteps = [...steps];

        if (options.cache) {
          newSteps.push(createLoadTypeScriptCacheStep(context));
        }

        return newSteps;
      });

      hooks.steps.hook((steps, {configuration}) => [
        ...steps,
        createRunTypeScriptStep(context, configuration),
      ]);

      if (options.cache) {
        hooks.post.hook((steps) => [...steps, createCacheSaveStep(context)]);
      }
    });
  });
}

const OUTPUT_DIRECTORY_NAME = 'output';
const BUILD_DIRECTORY_CACHE_FILENAME = 'info';
const TSBUILDINFO_FILE = 'tsconfig.tsbuildinfo';

function createCacheSaveStep({workspace, api}: WorkspacePluginContext) {
  return api.createStep(
    {
      id: 'TypeScript.SaveCache',
      label: 'save typescript cache',
    },
    async () => {
      try {
        const {references = []} = JSON.parse(
          await workspace.fs.read('tsconfig.json'),
        ) as {references?: {path: string}[]};

        await Promise.all(
          references.map(async ({path: reference}) => {
            const outDirectory = await getTscOutputDirectory(
              reference,
              workspace,
            );
            const projectCacheDirectory = join(
              api.cachePath('typescript'),
              reference.replace(/^\.*\/?/, '').replace(/\//g, '_'),
            );
            const cacheOutputDirectory = join(
              projectCacheDirectory,
              OUTPUT_DIRECTORY_NAME,
            );

            await workspace.fs.write(
              join(projectCacheDirectory, TSBUILDINFO_FILE),
              await workspace.fs.read(
                resolve(outDirectory, `../${TSBUILDINFO_FILE}`),
              ),
            );

            await workspace.fs.write(
              join(projectCacheDirectory, BUILD_DIRECTORY_CACHE_FILENAME),
              outDirectory,
            );

            await copy(
              workspace.fs.resolvePath(reference, outDirectory),
              cacheOutputDirectory,
              {preserveTimestamps: true},
            );
          }),
        );
      } catch {
        // noop
      }
    },
  );
}

async function getTscOutputDirectory(project: string, workspace: Workspace) {
  const tsconfig = JSON.parse(
    await workspace.fs.read(workspace.fs.resolvePath(project, 'tsconfig.json')),
  ) as {compilerOptions?: {outDir?: string}};

  return workspace.fs.resolvePath(
    project,
    tsconfig.compilerOptions?.outDir ?? 'build/ts',
  );
}

function createLoadTypeScriptCacheStep({
  workspace,
  api,
}: WorkspacePluginContext) {
  return api.createStep(
    {
      id: 'TypeScript.RestoreCache',
      label: 'restore typescript cache',
    },
    async () => {
      try {
        const projectCacheDirectories = await workspace.fs.glob(
          join(api.cachePath('typescript'), '*/'),
        );

        await Promise.all(
          projectCacheDirectories.map(async (projectCacheDirectory) => {
            const outDirectory = await workspace.fs.read(
              join(projectCacheDirectory, BUILD_DIRECTORY_CACHE_FILENAME),
            );

            await copy(
              join(projectCacheDirectory, TSBUILDINFO_FILE),
              resolve(outDirectory, `../${TSBUILDINFO_FILE}`),
              {preserveTimestamps: true},
            );

            await copy(
              join(projectCacheDirectory, OUTPUT_DIRECTORY_NAME),
              outDirectory,
              {preserveTimestamps: true},
            );
          }),
        );
      } catch {
        // noop
      }
    },
  );
}

export function createRunTypeScriptStep(
  {api}: Pick<WorkspacePluginContext, 'api'>,
  configure: Partial<TypeScriptTypeCheckingHooks>,
) {
  return api.createStep(
    {
      id: 'TypeScript.TypeCheck',
      label: 'run typescript',
    },
    async (step) => {
      const heap = await configure.typescriptHeap!.run(0);
      const heapArguments = heap ? [`--max-old-space-size=${heap}`] : [];

      try {
        await step.exec(
          'node',
          [...heapArguments, 'node_modules/.bin/tsc', '--build', '--pretty'],
          {all: true, env: {FORCE_COLOR: '1'}},
        );
      } catch (error) {
        throw new DiagnosticError({
          title: 'TypeScript found type errors',
          content: error.all,
        });
      }
    },
  );
}

function addTypeScriptExtensions(extensions: ReadonlyArray<string>) {
  return ['.ts', '.tsx', ...extensions];
}

function addTypeScriptTestIgnorePattern(patterns: ReadonlyArray<string>) {
  return [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/tests/**/*.ts',
    '**/tests/**/*.tsx',
    ...patterns,
  ];
}

async function addWebpackPlugins(
  plugins: ReadonlyArray<import('webpack').Plugin>,
) {
  const [
    {IgnoreMissingTypeExportWarningsPlugin},
    {WatchIgnorePlugin},
  ] = await Promise.all([
    import('./webpack-parts'),
    import('webpack'),
  ] as const);

  return [
    ...plugins,
    new IgnoreMissingTypeExportWarningsPlugin(),
    new WatchIgnorePlugin([/\.d\.ts$/]),
  ];
}

function addTypeScriptBabelConfig(config: BabelConfig): BabelConfig {
  return {
    ...config,
    plugins: [
      ...config.plugins,
      [
        require.resolve('@babel/plugin-proposal-decorators'),
        {decoratorsBeforeExport: true},
      ],
      '@babel/plugin-proposal-class-properties',
    ],
    presets: [...config.presets, require.resolve('@babel/preset-typescript')],
  };
}
