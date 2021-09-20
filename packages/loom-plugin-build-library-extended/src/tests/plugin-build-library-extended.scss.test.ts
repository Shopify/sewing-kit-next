import {resolve} from 'path';
import {readFileSync} from 'fs';

import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

const configContent = `
import {createPackage, Runtime} from '@shopify/loom';
import {buildLibrary} from '@shopify/loom-plugin-build-library';
import {buildLibraryExtended} from '@shopify/loom-plugin-build-library-extended';
export default createPackage((pkg) => {
  pkg.runtime(Runtime.Node);
  pkg.use(
    buildLibrary({browserTargets: 'defaults',  nodeTargets: 'node 12'}),
    buildLibraryExtended(),
  );
});
`;

describe('@shopify/loom-plugin-build-library-extended scss generation', () => {
  it('builds commmonjs, esmodules and esnext css outputs for one import', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(configContent);

      await workspace.writeFile(
        'src/first.scss',
        readFileSync(resolve(__dirname, './fixtures/scss/first.scss')) as any,
      );

      await workspace.writeFile(
        'src/index.js',
        `export {default as styles} from './first.scss';`,
      );

      await workspace.run('build');

      const cjsCSSContent = prepareContent(
        await workspace.contents('build/cjs/styles.css'),
      );
      const cjsBuildContent = prepareContent(
        await workspace.contents('build/cjs/index.js'),
      );
      const cjsBuildCSSContent = prepareContent(
        await workspace.contents('build/cjs/first.scss.js'),
      );
      const esmCSSContent = prepareContent(
        await workspace.contents('build/esm/styles.css'),
      );
      const esmBuildContent = prepareContent(
        await workspace.contents('build/esm/index.mjs'),
      );
      const esmBuildCSSContent = prepareContent(
        await workspace.contents('build/esm/first.scss.mjs'),
      );

      const esnextCSSContent = prepareContent(
        await workspace.contents('build/esnext/first.css'),
      );
      const esnextBuildContent = prepareContent(
        await workspace.contents('build/esnext/index.esnext'),
      );

      const expectedCSSContent = '._First_1gjmh_1{ margin:10px; }';

      const cjsExpectedBuildCSSOutput = prepareContent(`
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var first = {
  "First": "_First_1gjmh_1"
};

exports.default = first;
      `);

      const esmExpectedBuildCSSOutput = prepareContent(`
var first = {
  "First": "_First_1gjmh_1"
};

export default first;
      `);

      expect(cjsBuildContent).toContain("require('./first.scss.js');");
      expect(cjsCSSContent).toStrictEqual(expectedCSSContent);
      expect(cjsBuildCSSContent).toStrictEqual(cjsExpectedBuildCSSOutput);

      expect(esmBuildContent).toContain(
        "export { default as styles } from './first.scss.mjs';",
      );
      expect(esmCSSContent).toStrictEqual(expectedCSSContent);
      expect(esmBuildCSSContent).toStrictEqual(esmExpectedBuildCSSOutput);

      expect(esnextBuildContent).toContain(
        "export { default as styles } from './first.scss.esnext';",
      );
      expect(esnextCSSContent).toStrictEqual(expectedCSSContent);
      expect(await workspace.contains('build/esnext/styles.css')).toBeFalsy();
    });
  });

  it('builds commmonjs, esmodules css outputs for multiple imports', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(configContent);

      await workspace.writeFile(
        'src/first.scss',
        readFileSync(resolve(__dirname, './fixtures/scss/first.scss')) as any,
      );

      await workspace.writeFile(
        'src/second.scss',
        readFileSync(resolve(__dirname, './fixtures/scss/second.scss')) as any,
      );

      await workspace.writeFile(
        'src/first.js',
        `export {default as first} from './first.scss';`,
      );
      await workspace.writeFile(
        'src/second.js',
        `export {default as second} from './second.scss';`,
      );
      await workspace.writeFile(
        'src/index.js',
        `export {first} from './first'; export {second} from './second';`,
      );

      await workspace.run('build');

      const cjsCSSContent = prepareContent(
        await workspace.contents('build/cjs/styles.css'),
      );

      const esmCSSContent = prepareContent(
        await workspace.contents('build/esm/styles.css'),
      );
      const expectedCSSContent = prepareContent(`
._First_1gjmh_1{ margin:10px; }


._Second_336qy_1{ margin:20px; }
      `);

      expect(cjsCSSContent).toStrictEqual(expectedCSSContent);
      expect(esmCSSContent).toStrictEqual(expectedCSSContent);
      expect(await workspace.contains('build/esnext/styles.css')).toBeFalsy();
    });
  });

  it('builds commmonjs, esmodules css outputs for multiple recursive imports', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(configContent);

      await workspace.writeFile(
        'src/first.scss',
        readFileSync(resolve(__dirname, './fixtures/scss/first.scss')) as any,
      );

      await workspace.writeFile(
        'src/second.scss',
        readFileSync(resolve(__dirname, './fixtures/scss/second.scss')) as any,
      );

      await workspace.writeFile(
        'src/third.scss',
        readFileSync(resolve(__dirname, './fixtures/scss/third.scss')) as any,
      );

      await workspace.writeFile(
        'src/first.js',
        `export {third} from './third'; export {default as first} from './first.scss';`,
      );
      await workspace.writeFile(
        'src/second.js',
        `export {default as second} from './second.scss';`,
      );

      await workspace.writeFile(
        'src/third.js',
        `export {default as third} from './third.scss';`,
      );

      await workspace.writeFile(
        'src/index.js',
        `export {first} from './first'; export {second} from './second';`,
      );

      await workspace.run('build');

      const cjsCSSContent = prepareContent(
        await workspace.contents('build/cjs/styles.css'),
      );

      const esmCSSContent = prepareContent(
        await workspace.contents('build/esm/styles.css'),
      );
      const expectedCSSContent = prepareContent(`
._Third_nk0pg_1{ margin:30px; }


._First_1gjmh_1{ margin:10px; }


._Second_336qy_1{ margin:20px; }
      `);
      expect(cjsCSSContent).toStrictEqual(expectedCSSContent);
      expect(esmCSSContent).toStrictEqual(expectedCSSContent);
      expect(await workspace.contains('build/esnext/styles.css')).toBeFalsy();
    });
  });
});

function prepareContent(content: string): string {
  return content.trim();
}
