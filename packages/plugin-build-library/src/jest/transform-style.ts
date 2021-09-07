import type {Transformer} from '@jest/transform';

const transformer: Transformer = {
  process() {
    return `module.exports = new Proxy({}, {get: (_, key) => (key === '__esModule' ? false : key)})`;
  },
};

export default transformer;
