import {rollupPlugins} from '@shopify/loom-plugin-build-library';
import postcssShopify from '@shopify/postcss-plugin';
import pluginGraphql from '@rollup/plugin-graphql';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import svgr from '@svgr/rollup';

import {styles} from './rollup/rollup-plugin-styles';

interface RollupConfigOptions {
  readonly graphql?: boolean;
}

export function rollupConfig({graphql = false}: RollupConfigOptions) {
  return rollupPlugins((target) => {
    const stylesConfig = target.options.rollupEsnext
      ? {
          mode: 'esnext',
          plugins: [postcssShopify],
        }
      : {
          mode: 'standalone',
          output: 'styles.css',
          plugins: [postcssShopify],
        };

    return [
      json(),
      graphql && pluginGraphql(),
      // TODO fix the svgr plugin casting as any when Plugin signature is compatible with rollup Plugin signature
      svgr({include: '**/icons/*.svg', exclude: '', babel: true}) as any,
      image({exclude: '**/icons/*.svg'}),
      styles(stylesConfig),
    ];
  });
}
