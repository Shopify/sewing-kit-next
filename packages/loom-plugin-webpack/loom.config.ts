import {createPackage} from '@shopify/loom';

import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  pkg.entry({root: './src/index.ts'});
  pkg.entry({name: 'noop', root: './src/noop.ts'});
  pkg.use(createLoomPackagePlugin());
});
