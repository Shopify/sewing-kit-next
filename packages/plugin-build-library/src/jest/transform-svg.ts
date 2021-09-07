import {basename} from 'path';

import type {Transformer} from '@jest/transform';

const ICON_REGEX = /icons\/.*\.svg$/;

const transformer: Transformer = {
  process(_, filename) {
    if (ICON_REGEX.test(filename)) {
      return `const React = require('react');
      module.exports = () => React.createElement("svg", {"data-src": ${JSON.stringify(
        basename(filename),
      )}});`;
    }

    return `module.exports = ${JSON.stringify(basename(filename))};`;
  },
};

export default transformer;
