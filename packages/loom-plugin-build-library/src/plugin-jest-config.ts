import {createProjectTestPlugin} from '@shopify/loom';

interface JestConfigOptions {
  jestEnvironment: 'node' | 'jsdom';
}

export function jestConfig({jestEnvironment}: JestConfigOptions) {
  return createProjectTestPlugin('Loom.BuildLibrary.JestConfig', ({hooks}) => {
    hooks.configure.hook((configuration) => {
      configuration.jestEnvironment?.hook(() => jestEnvironment);
    });
  });
}
