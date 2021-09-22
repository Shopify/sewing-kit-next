import {createPackage} from '@shopify/loom';

import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  pkg.entry({root: './src/index.ts'});
  pkg.entry({name: 'transform-style', root: './src/jest/transform-style.ts'});
  pkg.entry({name: 'transform-svg', root: './src/jest/transform-svg.ts'});
  pkg.use(createLoomPackagePlugin());
});
