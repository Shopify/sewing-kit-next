import {
  // hooks
  SeriesHook,
  WaterfallHook,
  DevServiceHooks,
  DevWebAppHooks,
  DevPackageHooks,
  // tasks
  DevTaskOptions,
  DevWorkspaceTaskHooks,
} from '@shopify/loom';

import {LogLevel} from '../ui';
import {run} from '../runner';
import {
  createStep,
  createCommand,
  TaskContext,
  createWorkspaceTasksAndApplyPlugins,
  createProjectTasksAndApplyPlugins,
} from '../common';

export const dev = createCommand(
  {
    '--reload': String,
    '--source-maps': Boolean,
  },
  async ({'--source-maps': sourceMaps, '--reload': reload}, context) => {
    await runDev(context, {
      sourceMaps,
      reload: reload == null ? undefined : normalizeReload(reload),
    });
  },
);

function normalizeReload(reload: string): DevTaskOptions['reload'] {
  switch (reload) {
    case 'none':
      return false;
    case 'fast':
      return 'fast';
    default: {
      throw new Error(`Unknown --reload option: ${reload}`);
    }
  }
}

export async function runDev(
  taskContext: TaskContext,
  options: DevTaskOptions,
) {
  const {workspace} = taskContext;
  const {dev} = await createWorkspaceTasksAndApplyPlugins(taskContext);

  const devTaskHooks: DevWorkspaceTaskHooks = {
    configureHooks: new WaterfallHook(),
    configure: new SeriesHook(),
    pre: new WaterfallHook(),
    post: new WaterfallHook(),
    project: new SeriesHook(),
    package: new SeriesHook(),
    service: new SeriesHook(),
    webApp: new SeriesHook(),
    context: new WaterfallHook(),
  };

  await dev.run({
    hooks: devTaskHooks,
    options,
  });

  const configuration = await devTaskHooks.configureHooks.run({});
  await devTaskHooks.configure.run(configuration);

  const workspaceContext = await devTaskHooks.context.run({configuration});

  const webAppSteps = await Promise.all(
    workspace.webApps.map(async (webApp) => {
      const {dev} = await createProjectTasksAndApplyPlugins(
        webApp,
        taskContext,
      );

      const hooks: DevWebAppHooks = {
        configure: new SeriesHook(),
        configureHooks: new WaterfallHook(),
        context: new WaterfallHook(),
        steps: new WaterfallHook(),
      };

      const details = {
        options,
        hooks,
        context: workspaceContext,
      };

      const projectDetails = {
        project: webApp,
        ...details,
      };

      await devTaskHooks.project.run(projectDetails);
      await devTaskHooks.webApp.run(projectDetails);
      await dev.run(details);

      const configuration = await hooks.configureHooks.run({});
      await hooks.configure.run(configuration);

      const context = await hooks.context.run({});
      const steps = await hooks.steps.run([], configuration, context);

      const step = createStep(
        {
          id: 'Loom.DevWebApp',
          label: (fmt) => fmt`start dev mode for {emphasis ${webApp.name}}`,
        },
        async (step) => {
          if (steps.length === 0) {
            step.log('no development steps available', {level: LogLevel.Debug});
            return;
          }

          await step.runNested(steps);
        },
      );

      return {step, target: webApp};
    }),
  );

  const serviceSteps = await Promise.all(
    workspace.services.map(async (service) => {
      const {dev} = await createProjectTasksAndApplyPlugins(
        service,
        taskContext,
      );

      const hooks: DevServiceHooks = {
        configureHooks: new WaterfallHook(),
        configure: new SeriesHook(),
        context: new WaterfallHook(),
        steps: new WaterfallHook(),
      };

      const details = {
        options,
        hooks,
        context: workspaceContext,
      };

      const projectDetails = {
        project: service,
        ...details,
      };

      await devTaskHooks.project.run(projectDetails);
      await devTaskHooks.service.run(projectDetails);
      await dev.run(details);

      const configuration = await hooks.configureHooks.run({
        ip: new WaterfallHook(),
        port: new WaterfallHook(),
      });
      await hooks.configure.run(configuration);

      const context = await hooks.context.run({});
      const steps = await hooks.steps.run([], configuration, context);

      const step = createStep(
        {
          id: 'Loom.DevService',
          label: (fmt) => fmt`start dev mode for {emphasis ${service.name}}`,
        },
        async (step) => {
          if (steps.length === 0) {
            step.log('no development steps available', {level: LogLevel.Debug});
            return;
          }

          await step.runNested(steps);
        },
      );

      return {step, target: service};
    }),
  );

  const packageSteps = await Promise.all(
    workspace.packages.map(async (pkg) => {
      const {dev} = await createProjectTasksAndApplyPlugins(pkg, taskContext);

      const hooks: DevPackageHooks = {
        configureHooks: new WaterfallHook(),
        configure: new SeriesHook(),
        context: new WaterfallHook(),
        steps: new WaterfallHook(),
      };

      const details = {
        options,
        hooks,
        context: workspaceContext,
      };

      const projectDetails = {
        project: pkg,
        ...details,
      };

      await devTaskHooks.project.run(projectDetails);
      await devTaskHooks.package.run(projectDetails);
      await dev.run(details);

      const configuration = await hooks.configureHooks.run({});
      await hooks.configure.run(configuration);

      const context = await hooks.context.run({});
      const steps = await hooks.steps.run([], configuration, context);

      const step = createStep(
        {
          id: 'Loom.DevPackage',
          label: (fmt) => fmt`start dev mode for {emphasis ${pkg.name}}`,
        },
        async (step) => {
          if (steps.length === 0) {
            step.log('no development steps available', {level: LogLevel.Debug});
            return;
          }

          await step.runNested(steps);
        },
      );

      return {step, target: pkg};
    }),
  );

  const allSteps = [...packageSteps, ...webAppSteps, ...serviceSteps];

  const [pre, post] = await Promise.all([
    devTaskHooks.pre.run([], workspaceContext),
    devTaskHooks.post.run([], workspaceContext),
  ]);

  await run(taskContext, {
    title: 'dev',
    pre,
    post,
    steps: allSteps,
    epilogue(log) {
      log((fmt) => fmt`{success dev completed successfully!}`);
    },
  });
}
