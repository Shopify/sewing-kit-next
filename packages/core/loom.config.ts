import {createPackage, Runtime} from '@shopify/loom';

import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.entry({root: './src/index'});
  pkg.entry({root: './src/config-load', name: 'config-load'});
  pkg.use(createLoomPackagePlugin());
});
