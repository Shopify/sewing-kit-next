# `@sewing-kit/plugin-build-library`

Exposes two plugins (`libaryPackagePlugin`, `libaryWorkspacePlugin`) for off-the-shelf library building within `sewing-kit-next`.

## Installation

```sh
$ yarn add @sewing-kit/plugin-build-library --dev
```

## Usage

Add `libaryPackagePlugin` and `libaryWorkspacePlugin` to your sewing-kit plugins.

```js
import {createPackage, Runtime} from '@sewing-kit/core';
import {
  libaryPackagePlugin,
  libaryWorkspacePlugin,
} from '@sewing-kit/plugin-build-library';

export default createPackage((pkg) => {
  pkg.runtimes(Runtime.Node, Runtime.Browser);
  pkg.entry({root: './src/index'});
  pkg.use(libaryPackagePlugin(), libaryWorkspacePlugin());
});
```

### Assumptions

- `@svgr/rollup` will look up svgs under `**/icons/*.svg`, and convert them to functional React components.
- `@rollup/plugin-image` will look for images not under `**/icons/*.svg` and convert them to data uris.
