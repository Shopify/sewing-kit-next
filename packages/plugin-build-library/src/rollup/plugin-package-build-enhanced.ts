import {rollupPlugins} from '@sewing-kit/plugin-rollup';
import postcssShopify from '@shopify/postcss-plugin';
import graphql from '@rollup/plugin-graphql';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import svgr from '@svgr/rollup';

import {styles} from './rollup-plugin-styles';

export function packageBuildEnhanced() {
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
      graphql(),
      // TODO fix the svgr plugin casting as any when Plugin signature is compatible with rollup Plugin signature
      svgr({include: '**/icons/*.svg', exclude: '', babel: true}) as any,
      image({exclude: '**/icons/*.svg'}),
      styles(stylesConfig),
    ];
  });
}
