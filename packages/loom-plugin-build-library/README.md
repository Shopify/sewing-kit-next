# `@shopify/loom-plugin-build-library`

Exposes two plugins (`buildLibrary`, `buildLibraryWorkspace`) for off-the-shelf library building within `loom`.

## Installation

```sh
$ yarn add @shopify/loom-plugin-build-library --dev
```

## Usage

Add `buildLibrary` and `buildLibraryWorkspace` to your loom plugins.

```js
import {createPackage, Runtime} from '@shopify/loom';
import {
  buildLibrary,
  buildLibraryWorkspace,
} from '@shopify/loom-plugin-build-library';

export default createPackage((pkg) => {
  pkg.runtimes(Runtime.Node, Runtime.Browser);
  pkg.entry({root: './src/index'});
  pkg.use(
    buildLibrary({
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Browser`
      browserTargets: 'defaults',
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Node`
      nodeTargets: 'node 12.20',
      // Optional. Defaults to true. Defines if commonjs outputs should be generated.
      commonjs: true,
      // Optional. Defaults to true. Defines if esmodules outputs should be generated.
      esmodules: true,
      // Optional. Defaults to true. Defines if esnext outputs should be generated.
      esnext: true,
      // Optional. Defaults to true. Defines if entrypoints should be written at
      // the root of the repository. You can disable this if you have a single
      // entrypoint or if your package uses the `exports` key in package.json
      rootEntrypoints: true,
      // Optional. Defaults to false. Defines if graphql files should be processed.
      graphql: false,
      // Optional. Defaults to 'node'. Defines if the jest environment should be 'node' or 'jsdom'.
      jestEnvironment: 'node',
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
import {createPackage, Runtime} from '@shopify/loom';
import {
  buildLibrary,
  buildLibraryWorkspace,
  babel,
} from '@shopify/loom-plugin-build-library';

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
    // Override initial babel options.
    // Return a new object, instead of mutating the argument object.
    babel({
      config(babelConfig) {
        return {
          ...babelConfig,
          plugins: [...(babelConfig.plugins || []), 'my-custom-babel-plugin'],
        };
      },
    }),
  );
});
```

### Assumptions

- `@svgr/rollup` will look up svgs under `**/icons/*.svg`, and convert them to functional React components.
- `@rollup/plugin-image` will look for images not under `**/icons/*.svg` and convert them to data uris.
