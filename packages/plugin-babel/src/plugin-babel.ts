import {addHooks, WaterfallHook, createProjectPlugin} from '@sewing-kit/core';
import type {TransformOptions as BabelConfig} from '@babel/core';

interface BabelHooks {
  readonly babelConfig: WaterfallHook<BabelConfig>;
}

declare module '@sewing-kit/core' {
  interface TestProjectConfigurationCustomHooks extends BabelHooks {}
  interface BuildProjectConfigurationCustomHooks extends BabelHooks {}
  interface DevProjectConfigurationCustomHooks extends BabelHooks {}
}

const PLUGIN = 'SewingKit.Babel';

interface Options {
  config?: BabelConfig;
}

export function babel({config = {}}: Options = {}) {
  return createProjectPlugin(PLUGIN, ({tasks: {dev, build, test}}) => {
    const addBabelHooks = addHooks<BabelHooks>(() => ({
      babelConfig: new WaterfallHook(),
    }));

    const addBabelConfig = () => config;

    test.hook(({hooks}) => {
      hooks.configureHooks.hook(addBabelHooks);

      hooks.configure.hook((configure) => {
        configure.babelConfig?.hook(addBabelConfig);
      });
    });

    build.hook(({hooks}) => {
      hooks.configureHooks.hook(addBabelHooks);

      hooks.target.hook(({hooks}) => {
        hooks.configure.hook((configure) => {
          configure.babelConfig?.hook(addBabelConfig);
        });
      });
    });

    dev.hook(({hooks}) => {
      hooks.configureHooks.hook(addBabelHooks);

      hooks.configure.hook((configure) => {
        configure.babelConfig?.hook(addBabelConfig);
      });
    });
  });
}
