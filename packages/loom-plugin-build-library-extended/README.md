# `@shopify/loom-plugin-build-library-extended`

This package is a compliment to `@shopify/loom-plugin-build-library`. It enhances the build provided by `@shopify/loom-plugin-build-library`, teaching Rollup and Jest about additional file types. It provides support for parsing styles (`.scss` files), images (`.svg`, `.jpg`, `.png` files) and graphql (`.graphql` files). In also provdes type generation for graphql files.

Ite exposes two plugins - `buildLibraryExtended` and `buildLibraryExtendedWorkspace` that should be added to your loom plugins as a sibling of `@shopify/loom-plugin-build-library`.

## Installation

```sh
$ yarn add @shopify/loom-plugin-build-library-extended --dev
```

## Usage

Add `buildLibraryExtended` and `buildLibraryExtendedWorkspace` to your loom plugins.

```js
import {createPackage, Runtime} from '@shopify/loom';
import {
  buildLibrary,
  buildLibraryWorkspace,
} from '@shopify/loom-plugin-build-library';
import {
  buildLibraryExtended,
  buildLibraryExtendedWorkspace,
} from '@shopify/loom-plugin-build-library-extended';

export default createPackage((pkg) => {
  pkg.runtimes(Runtime.Node, Runtime.Browser);
  pkg.entry({root: './src/index'});
  pkg.use(
    buildLibrary({browserTargets: 'defaults', nodeTargets: 'node 12.20'}),
    buildLibraryWorkspace(),
    buildLibraryExtended({
      // Optional. Defaults to false. Defines if graphql files should be processed.
      graphql: false,,
    }),
    buildLibraryExtendedWorkspace({
      // Optional. Defaults to false. Defines if d.ts files should be generated for graphql files.
      graphql: false,
    }),
  );
});
```

### Assumptions

- `@svgr/rollup` will look up svgs under `**/icons/*.svg`, and convert them to functional React components.
- `@rollup/plugin-image` will look for images not under `**/icons/*.svg` and convert them to data uris.
