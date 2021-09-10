import {Package, createComposedProjectPlugin} from '@shopify/loom';
import {babel} from '@shopify/loom-plugin-babel';
import {packageBuild} from '@shopify/loom-plugin-package-build';

import type {} from '@shopify/loom-plugin-jest';

export const createLoomPackagePlugin = () =>
  createComposedProjectPlugin<Package>('Loom.InternalPackage', [
    babel({
      config: {
        configFile: false,
        presets: [['@shopify/babel-preset', {typescript: true}]],
      },
    }),
    packageBuild({
      browserTargets: 'defaults',
      nodeTargets: 'node 12.14.0',
      esmodules: false,
      esnext: false,
      commonjs: true,
      binaries: true,
    }),
  ]);
