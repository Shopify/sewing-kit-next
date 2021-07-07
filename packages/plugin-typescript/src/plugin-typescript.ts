import {
  WaterfallHook,
  DiagnosticError,
  createProjectPlugin,
  createWorkspacePlugin,
  WorkspacePluginContext,
  addHooks,
} from '@sewing-kit/core';

import type {} from '@sewing-kit/plugin-javascript';
import type {} from '@sewing-kit/plugin-jest';

interface TypeScriptTypeCheckingHooks {
  readonly typescriptHeap: WaterfallHook<number>;
}

declare module '@sewing-kit/core' {
  interface TypeCheckWorkspaceConfigurationCustomHooks
    extends TypeScriptTypeCheckingHooks {}
  interface BuildWorkspaceConfigurationCustomHooks
    extends TypeScriptTypeCheckingHooks {}
}

const PLUGIN = 'SewingKit.TypeScript';

export function typescript() {
  return createProjectPlugin(PLUGIN, ({tasks: {dev, build, test}}) => {
    test.hook(({hooks}) => {
      hooks.configure.hook((hooks) => {
        hooks.babelConfig?.hook(addTypeScriptBabelConfig);

        hooks.jestExtensions?.hook((extensions) => {
          return ['.ts', '.tsx', ...extensions];
        });
        hooks.jestTransforms?.hook((transforms, {babelTransform}) => {
          return {...transforms, '^.+\\.tsx?$': babelTransform};
        });
      });
    });

    build.hook(({hooks}) => {
      hooks.target.hook(({hooks}) => {
        hooks.configure.hook((configure) => {
          configure.babelConfig?.hook(addTypeScriptBabelConfig);
        });
      });
    });

    dev.hook(({hooks}) => {
      hooks.configure.hook((configure) => {
        configure.babelConfig?.hook(addTypeScriptBabelConfig);
      });
    });
  });
}

export function workspaceTypeScript() {
  return createWorkspacePlugin(PLUGIN, (context) => {
    const {
      workspace,
      tasks: {build, typeCheck},
    } = context;

    build.hook(({hooks}) => {
      hooks.configureHooks.hook(
        addHooks<TypeScriptTypeCheckingHooks>(() => ({
          typescriptHeap: new WaterfallHook(),
        })),
      );

      // We don’t build TypeScript definitions for workspaces that only include
      // web apps or services
      if (
        (workspace.webApps.length > 0 || workspace.services.length > 0) &&
        workspace.packages.length === 0
      ) {
        return;
      }

      hooks.pre.hook((steps, {configuration}) => {
        return [...steps, createRunTypeScriptStep(context, configuration)];
      });
    });

    typeCheck.hook(({hooks}) => {
      hooks.configureHooks.hook(
        addHooks<TypeScriptTypeCheckingHooks>(() => ({
          typescriptHeap: new WaterfallHook(),
        })),
      );

      hooks.steps.hook((steps, {configuration}) => {
        return [...steps, createRunTypeScriptStep(context, configuration)];
      });
    });
  });
}

export function createRunTypeScriptStep(
  context: WorkspacePluginContext,
  configuration: Partial<TypeScriptTypeCheckingHooks>,
) {
  return context.api.createStep(
    {
      id: 'TypeScript.TypeCheck',
      label: 'run typescript',
    },
    async (step) => {
      const heap = await configuration.typescriptHeap!.run(0);
      const heapArguments = heap ? [`--max-old-space-size=${heap}`] : [];

      try {
        await step.exec(
          'node_modules/.bin/tsc',
          ['--build', ...heapArguments],
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

interface BabelConfig {
  presets: (string | [string, {[key: string]: unknown}?])[];
  plugins: (string | [string, {[key: string]: unknown}?])[];
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
