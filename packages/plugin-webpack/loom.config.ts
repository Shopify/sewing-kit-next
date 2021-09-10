import {createPackage, Runtime} from '@shopify/loom';

import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.entry({root: './src/index'});
  pkg.entry({name: 'noop', root: './src/noop'});
  pkg.use(createLoomPackagePlugin());
});
