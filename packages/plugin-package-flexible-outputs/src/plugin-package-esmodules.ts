import {WebApp, Service, createProjectPlugin} from '@sewing-kit/plugins';

import type {} from '@sewing-kit/plugin-webpack';
import type {} from '@sewing-kit/hooks';

export function esmodulesOutput() {
  return createProjectPlugin<WebApp | Service>(
    `SewingKit.PackageEsModules.Consumer`,
    ({tasks: {build, dev}}) => {
      build.hook(({hooks}) => {
        hooks.target.hook(({hooks}) => {
          hooks.configure.hook((configuration) => {
            configuration.webpackRules?.hook(addWebpackRule);
            configuration.webpackExtensions?.hook(addExtension);
          });
        });
      });

      dev.hook(({hooks}) => {
        hooks.configure.hook((configuration) => {
          configuration.webpackRules?.hook(addWebpackRule);
          configuration.webpackExtensions?.hook(addExtension);
        });
      });
    },
  );
}

function addExtension(extensions: readonly string[]): readonly string[] {
  return ['.mjs', ...extensions];
}

function addWebpackRule(rules: readonly any[]) {
  return [
    ...rules,
    {
      test: /\.mjs$/,
      include: /node_modules/,
      type: 'javascript/auto',
    },
  ];
}