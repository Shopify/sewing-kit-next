import {BabelConfig} from '@sewing-kit/plugin-javascript';

import {Plugin as RollupPlugin, PreRenderedChunk} from 'rollup';

import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';

export function rollupNameForTargetOptions(options: {rollupName?: string}) {
  return (
    options.rollupName || (Object.keys(options).length === 0 ? 'default' : '')
  );
}

/**
 * Foo.ts is compilied to Foo.js, while Foo.scss is compiled to Foo.scss.js
 * Optionally changing the .js for .mjs / .esnext
 */
export function entryFileNamesBuilder(ext = '.js') {
  const NonAssetExtensions = ['.js', '.jsx', '.ts', '.tsx'];
  return (chunkInfo: PreRenderedChunk) => {
    const isAssetfile = !NonAssetExtensions.some((nonAssetExt) =>
      (chunkInfo.facadeModuleId || '').endsWith(nonAssetExt),
    );

    return `[name]${isAssetfile ? '[extname]' : ''}${ext}`;
  };
}

export function inputPluginsFactory({
  targets,
  babelConfig,
}: {
  targets: string[];
  babelConfig: BabelConfig;
}): RollupPlugin[] {
  return [
    nodeResolve({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      // Only resolve files paths starting with a .
      // This treats every other path - i.e. modules like
      // `@shopify/address` or node built-ins like `path` as
      // externals that should not be bundled.
      resolveOnly: [/^\./],
    }),
    commonjs(),
    babel({
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      envName: 'production',
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
      configFile: false,
      // @ts-expect-error targets is a valid babel option but @types/babel__core doesn't know that yet
      targets,
      ...babelConfig,
    }),
  ];
}
