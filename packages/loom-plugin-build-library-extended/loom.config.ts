import {createPackage, Runtime} from '@shopify/loom';

import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.entry({root: './src/index'});
  pkg.entry({name: 'transform-style', root: './src/jest/transform-style'});
  pkg.entry({name: 'transform-svg', root: './src/jest/transform-svg'});
  pkg.use(createLoomPackagePlugin());
});
