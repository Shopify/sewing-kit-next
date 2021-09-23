import {createPackage} from '@shopify/loom';

import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  pkg.use(createLoomPackagePlugin());
});
