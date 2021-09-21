import {createComposedProjectPlugin} from '@shopify/loom';
import {buildLibrary} from '@shopify/loom-plugin-build-library';

export const createLoomPackagePlugin = () =>
  createComposedProjectPlugin('InternalPackage', [
    buildLibrary({
      targets: 'node 12.14.0',
      commonjs: true,
      binaries: true,
    }),
  ]);
