import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

const configContent = `
import {createPackage} from '@shopify/loom';
import {buildLibrary} from '@shopify/loom-plugin-build-library';
import {buildLibraryExtended} from '@shopify/loom-plugin-build-library-extended';
export default createPackage((pkg) => {
  pkg.use(
    buildLibrary({
      targets: 'node 12.20.0',
      commonjs: true,
      esmodules: true,
      esnext: true,
    }),
    buildLibraryExtended(),
  );
});
`;

describe('@shopify/loom-plugin-build-library-extended scss generation', () => {
  it('builds commmonjs, esmodules and esnext css outputs for one import', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(configContent);

      await workspace.writeFileMap({
        'src/index.js': `export {default as styles} from './first.scss';`,
        'src/first.scss': `$size: 10px;\n.First { margin: $size; }`,
      });

      await workspace.run('build');

      const expectedCSSContent = '._First_1gjmh_1{ margin:10px; }\n';

      const cjsExpectedBuildCSSOutput = `'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var first = {
  "First": "_First_1gjmh_1"
};

exports.default = first;
`;

      const esmExpectedBuildCSSOutput = `var first = {
  "First": "_First_1gjmh_1"
};

export default first;
`;

      const esnextExpectedBuildCSSOutput = `import './first.css';

var first = {
  "First": "_First_1gjmh_1"
};

export default first;
`;

      expect(await workspace.contents('build/cjs/index.js')).toContain(
        "require('./first.scss.js');",
      );
      expect(await workspace.contents('build/cjs/first.scss.js')).toStrictEqual(
        cjsExpectedBuildCSSOutput,
      );
      expect(await workspace.contents('build/cjs/styles.css')).toStrictEqual(
        expectedCSSContent,
      );

      expect(await workspace.contents('build/esm/index.mjs')).toContain(
        "export { default as styles } from './first.scss.mjs';",
      );
      expect(
        await workspace.contents('build/esm/first.scss.mjs'),
      ).toStrictEqual(esmExpectedBuildCSSOutput);
      expect(await workspace.contents('build/esm/styles.css')).toStrictEqual(
        expectedCSSContent,
      );

      expect(await workspace.contents('build/esnext/index.esnext')).toContain(
        "export { default as styles } from './first.scss.esnext';\n",
      );
      expect(
        await workspace.contents('build/esnext/first.scss.esnext'),
      ).toStrictEqual(esnextExpectedBuildCSSOutput);
      expect(await workspace.contents('build/esnext/first.css')).toStrictEqual(
        expectedCSSContent,
      );

      expect(await workspace.contains('build/esnext/styles.css')).toBeFalsy();
    });
  });

  it('builds commmonjs, esmodules css outputs for multiple imports', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(configContent);

      await workspace.writeFileMap({
        'src/first.js': `export {default as first} from './first.scss';`,
        'src/second.js': `export {default as second} from './second.scss';`,
        'src/index.js': `export {first} from './first'; export {second} from './second';`,
        'src/first.scss': `$size: 10px;\n.First { margin: $size; }`,
        'src/second.scss': `$size: 20px;\n.Second { margin: $size; }`,
      });

      await workspace.run('build');

      const expectedCSSContent = `._First_1gjmh_1{ margin:10px; }\n\n\n._Second_336qy_1{ margin:20px; }\n`;

      expect(await workspace.contents('build/cjs/styles.css')).toStrictEqual(
        expectedCSSContent,
      );
      expect(await workspace.contents('build/esm/styles.css')).toStrictEqual(
        expectedCSSContent,
      );
      expect(await workspace.contains('build/esnext/styles.css')).toBeFalsy();
    });
  });

  it('builds commmonjs, esmodules css outputs for multiple recursive imports', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(configContent);

      await workspace.writeFileMap({
        'src/first.js': `export {third} from './third'; export {default as first} from './first.scss';`,
        'src/second.js': `export {default as second} from './second.scss';`,
        'src/third.js': `export {default as third} from './third.scss';`,
        'src/index.js': `export {first} from './first'; export {second} from './second';`,
        'src/first.scss': `$size: 10px;\n.First { margin: $size; }`,
        'src/second.scss': `$size: 20px;\n.Second { margin: $size; }`,
        'src/third.scss': `$size: 30px;\n.Third { margin: $size; }`,
      });

      await workspace.run('build');

      const expectedCSSContent = `._Third_nk0pg_1{ margin:30px; }\n\n\n._First_1gjmh_1{ margin:10px; }\n\n\n._Second_336qy_1{ margin:20px; }\n`;

      expect(await workspace.contents('build/cjs/styles.css')).toStrictEqual(
        expectedCSSContent,
      );
      expect(await workspace.contents('build/esm/styles.css')).toStrictEqual(
        expectedCSSContent,
      );
      expect(await workspace.contains('build/esnext/styles.css')).toBeFalsy();
    });
  });
});
