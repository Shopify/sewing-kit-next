import {addHooks, WaterfallHook, createProjectPlugin} from '@sewing-kit/core';
import type {TransformOptions} from '@babel/core';

export type BabelConfig = Pick<TransformOptions, 'presets' | 'plugins'>;

interface BabelHooks {
  readonly babelConfig: WaterfallHook<BabelConfig>;
}

declare module '@sewing-kit/core' {
  interface TestProjectConfigurationCustomHooks extends BabelHooks {}
  interface BuildProjectConfigurationCustomHooks extends BabelHooks {}
  interface DevProjectConfigurationCustomHooks extends BabelHooks {}
}

const PLUGIN = 'SewingKit.JavaScript';

interface Options {
  presets?: BabelConfig['presets'];
  plugins?: BabelConfig['plugins'];
}

export function javascript({plugins = [], presets = []}: Options = {}) {
  return createProjectPlugin(PLUGIN, ({tasks: {dev, build, test}}) => {
    const addBabelHooks = addHooks<BabelHooks>(() => ({
      babelConfig: new WaterfallHook(),
    }));

    const explicitBabelConfig = (): BabelConfig => ({plugins, presets});

    test.hook(({hooks}) => {
      hooks.configureHooks.hook(addBabelHooks);

      hooks.configure.hook((configure) => {
        configure.babelConfig?.hook(explicitBabelConfig);
      });
    });

    build.hook(({hooks}) => {
      hooks.configureHooks.hook(addBabelHooks);

      hooks.target.hook(({hooks}) => {
        hooks.configure.hook((configure) => {
          configure.babelConfig?.hook(explicitBabelConfig);
        });
      });
    });

    dev.hook(({hooks}) => {
      hooks.configureHooks.hook(addBabelHooks);

      hooks.configure.hook((configure) => {
        configure.babelConfig?.hook(explicitBabelConfig);
      });
    });
  });
}
