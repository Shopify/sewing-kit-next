import {createPackage} from '@shopify/loom';

import {createLoomPackagePlugin} from '../../config/loom';

export default createPackage((pkg) => {
  pkg.entry({root: './src/index'});
  pkg.binary({name: 'loom', root: './src/cli'});
  pkg.use(createLoomPackagePlugin());
});
