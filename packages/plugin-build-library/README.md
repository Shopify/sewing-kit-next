# `@sewing-kit/plugin-build-library`

Exposes two plugins (`buildLibrary`, `buildLibraryWorkspace`) for off-the-shelf library building within `sewing-kit-next`.

## Installation

```sh
$ yarn add @sewing-kit/plugin-build-library --dev
```

## Usage

Add `buildLibrary` and `buildLibraryWorkspace` to your sewing-kit plugins.

```js
import {createPackage, Runtime} from '@sewing-kit/core';
import {
  buildLibrary,
  buildLibraryWorkspace,
} from '@sewing-kit/plugin-build-library';

export default createPackage((pkg) => {
  pkg.runtimes(Runtime.Node, Runtime.Browser);
  pkg.entry({root: './src/index'});
  pkg.use(
    buildLibrary({
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Browser`
      browserTargets: 'defaults',
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Node`
      nodeTargets: 'node 12.13',
      // Optional. Defaults to false. Defines if graphql files should be processed.
      graphql: false,
      // Optional. Defaults to 'node'. Defines if the jest environment should be 'node' or 'jsdom'.
      jestEnvironment = 'node',
      // Optional. Defaults to empty object. Defines any additional config to pass to plugin-package-build
      packageBuildOptions: {}
    }),
    buildLibraryWorkspace({
      // Optional. Defaults to false. Defines if d.ts files should be generated for graphql files.
      graphql: false,
    }),
  );
});
```

### Overriding Babel config

We provide an initial babel config that supports typescript and react, using `@shopify/babel-plugin`. If you need to adjust this config, you can call the `babel()` plugin after `buildLibrary` to override the defaults.

```js
import {createPackage, Runtime} from '@sewing-kit/core';
import {
  buildLibrary,
  buildLibraryWorkspace,
  babel,
} from '@sewing-kit/plugin-build-library';

export default createPackage((pkg) => {
  pkg.runtimes(Runtime.Node, Runtime.Browser);
  pkg.entry({root: './src/index'});
  pkg.use(
    buildLibrary({
      browserTargets: 'defaults',
      nodeTargets: 'node 12.13',
    }),
    buildLibraryWorkspace({
      // Optional. Defaults to false. Defines if d.ts files should be generated for graphql files.
      graphql: false,
    }),
    babel({
      config(babelConfig) {
        // the plugins array may not be set initially
        if (!babelConfig.plugins) {
          babelConfig.plugins = [];
        }
        babelConfig.plugins.push('my-custom-babel-plugin');
        return babelConfig;
      },
    }),
  );
});
```

### Assumptions

- `@svgr/rollup` will look up svgs under `**/icons/*.svg`, and convert them to functional React components.
- `@rollup/plugin-image` will look for images not under `**/icons/*.svg` and convert them to data uris.
