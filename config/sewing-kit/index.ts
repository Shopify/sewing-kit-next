import {Package, createComposedProjectPlugin} from '@sewing-kit/core';
import {babel} from '@sewing-kit/plugin-babel';
import {packageBuild} from '@sewing-kit/plugin-package-build';

import type {} from '@sewing-kit/plugin-jest';

export const createSewingKitPackagePlugin = () =>
  createComposedProjectPlugin<Package>('SewingKit.InternalPackage', [
    babel({
      config: {
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
