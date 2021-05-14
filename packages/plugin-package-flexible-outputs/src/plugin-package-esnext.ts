import {
  Project,
  createProjectPlugin,
  Env,
  Runtime,
  TargetRuntime,
} from '@sewing-kit/plugins';
import {createJavaScriptWebpackRuleSet} from '@sewing-kit/plugin-javascript';

import type {} from '@sewing-kit/plugin-webpack';

export function esnextOutput() {
  return createProjectPlugin<Project>(
    `SewingKit.PackageEsNext.Consumer`,
    ({api, project, tasks: {build, dev}}) => {
      build.hook(({hooks, options}) => {
        hooks.target.hook(({target, hooks}) => {
          hooks.configure.hook((configuration) => {
            configuration.webpackExtensions?.hook(addExtension);
            configuration.webpackConfig?.hook(
              createMainFieldAdder(target.runtime),
            );
            configuration.webpackRules?.hook(async (rules) => [
              ...rules,
              {
                test: /\.esnext/,
                include: /node_modules/,
                use: await createJavaScriptWebpackRuleSet({
                  api,
                  target,
                  env: options.simulateEnv,
                  configuration,
                  cacheDirectory: 'esnext',
                }),
              },
            ]);
          });
        });
      });

      dev.hook(({hooks}) => {
        hooks.configure.hook((configure) => {
          configure.webpackExtensions?.hook(addExtension);
          configure.webpackConfig?.hook(
            createMainFieldAdder(TargetRuntime.fromProject(project)),
          );
          configure.webpackRules?.hook(async (rules) => [
            ...rules,
            {
              test: /\.esnext/,
              include: /node_modules/,
              use: await createJavaScriptWebpackRuleSet({
                api,
                target: {
                  project,
                  options: {},
                  runtime: TargetRuntime.fromProject(project),
                },
                env: Env.Development,
                configuration: configure,
                cacheDirectory: 'esnext',
              }),
            },
          ]);
        });
      });

      function createMainFieldAdder(runtime: TargetRuntime) {
        return (config: import('webpack').Configuration) => {
          return {
            ...config,
            resolve: {
              ...config.resolve,
              mainFields: [
                'esnext',
                ...(config.resolve?.mainFields ??
                  (runtime.includes(Runtime.Node) && runtime.runtimes.size === 1
                    ? ['module', 'main']
                    : ['browser', 'module', 'main'])),
              ] as string[] | string[][],
            },
          };
        };
      }
    },
  );
}

function addExtension(extensions: readonly string[]): readonly string[] {
  return ['.esnext', ...extensions];
}
