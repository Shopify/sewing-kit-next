import {createPackage, Runtime} from '@sewing-kit/core';

import {createSewingKitPackagePlugin} from '../../config/sewing-kit';

export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.use(createSewingKitPackagePlugin());
});
