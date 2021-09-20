import {createComposedProjectPlugin} from '@shopify/loom';
import {buildLibrary} from '@shopify/loom-plugin-build-library';

export const createLoomPackagePlugin = () =>
  createComposedProjectPlugin('InternalPackage', [
    buildLibrary({
      browserTargets: 'defaults',
      nodeTargets: 'node 12.14.0',
      esmodules: false,
      esnext: false,
      commonjs: true,
      binaries: true,
    }),
  ]);
