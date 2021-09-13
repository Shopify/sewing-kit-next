import {createPackage, Runtime} from '@shopify/loom';

import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.use(createLoomPackagePlugin());
});
