import {
  WaterfallHook,
  DiagnosticError,
  createWorkspacePlugin,
  WorkspacePluginContext,
  addHooks,
} from '@shopify/loom';

interface TypeScriptTypeCheckingHooks {
  readonly typescriptHeap: WaterfallHook<number>;
}

declare module '@shopify/loom' {
  interface TypeCheckWorkspaceConfigurationCustomHooks
    extends TypeScriptTypeCheckingHooks {}
  interface BuildWorkspaceConfigurationCustomHooks
    extends TypeScriptTypeCheckingHooks {}
}

const PLUGIN = 'Loom.TypeScript';

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
          ['--build', '--pretty', ...heapArguments],
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
