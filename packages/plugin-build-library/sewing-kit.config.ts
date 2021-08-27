import {createPackage, Runtime} from '@sewing-kit/core';

import {createSewingKitPackagePlugin} from '../../config/sewing-kit';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.entry({root: './src/index'});
  pkg.entry({
    name: 'transform-style',
    root: './src/jest/transform-style',
  });
  pkg.entry({
    name: 'transform-svg',
    root: './src/jest/transform-svg',
  });
  pkg.use(createSewingKitPackagePlugin());
});
