import {createPackage, Runtime} from '@sewing-kit/core';

import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.use(createLoomPackagePlugin());
});
