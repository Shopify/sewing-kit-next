import {resolve} from 'path';
import {readFileSync} from 'fs';

import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

describe('@shopify/loom-plugin-build-library scss generation', () => {
  it('builds commmonjs, esmodules and esnext css outputs for one import', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@shopify/loom';
        import {buildLibrary} from '@shopify/loom-plugin-build-library';
        export default createPackage((pkg) => {
          pkg.runtime(Runtime.Node);
          pkg.use(
            buildLibrary({
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',
            }),
          );
        });
      `);

      await workspace.writeFile(
        'src/first.scss',
        readFileSync(resolve(__dirname, './fixtures/scss/first.scss')) as any,
      );

      await workspace.writeFile(
        'src/_helpers.scss',
        readFileSync(
          resolve(__dirname, './fixtures/scss/_helpers.scss'),
        ) as any,
      );

      await workspace.writeFile(
        'src/index.js',
        `
import styles from './first.scss';

export function pkg(greet) {
  console.log(\`Hello, \${greet}!\`);
}
        `,
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

      const expectedCSSContent = prepareContent(`
._Nav_125a3_1 ._Ul_125a3_1{ margin:2.37rem; padding:0; list-style:none; }

._Nav_125a3_1 ._Li_125a3_3{ display:inline-block; }

._Nav_125a3_1 ._Link_125a3_5{ display:block; padding:6px 12px; text-decoration:none; }
      `);

      const cjsExpectedBuildCSSOutput = prepareContent(`
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var first = {
  "Nav": "_Nav_125a3_1",
  "Ul": "_Ul_125a3_1",
  "Li": "_Li_125a3_3",
  "Link": "_Link_125a3_5"
};

exports.default = first;
      `);

      const esmExpectedBuildCSSOutput = prepareContent(`
var first = {
  "Nav": "_Nav_125a3_1",
  "Ul": "_Ul_125a3_1",
  "Li": "_Li_125a3_3",
  "Link": "_Link_125a3_5"
};

export default first;
      `);

      expect(cjsBuildContent).toContain("require('./first.scss.js');");
      expect(cjsCSSContent).toStrictEqual(expectedCSSContent);
      expect(cjsBuildCSSContent).toStrictEqual(cjsExpectedBuildCSSOutput);

      expect(esmBuildContent).toContain("import './first.scss.mjs';");
      expect(esmCSSContent).toStrictEqual(expectedCSSContent);
      expect(esmBuildCSSContent).toStrictEqual(esmExpectedBuildCSSOutput);

      expect(esnextBuildContent).toContain("import './first.css';");
      expect(esnextCSSContent).toStrictEqual(expectedCSSContent);
      expect(await workspace.contains('build/esnext/styles.css')).toBeFalsy();
    });
  });

  it('builds commmonjs, esmodules css outputs for multiple imports', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@shopify/loom';
        import {buildLibrary} from '@shopify/loom-plugin-build-library';
        export default createPackage((pkg) => {
          pkg.runtime(Runtime.Node);
          pkg.use(
            buildLibrary({
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',
            }),
          );
        });
      `);

      await workspace.writeFile(
        'src/first.scss',
        readFileSync(resolve(__dirname, './fixtures/scss/first.scss')) as any,
      );

      await workspace.writeFile(
        'src/second.scss',
        readFileSync(resolve(__dirname, './fixtures/scss/second.scss')) as any,
      );

      await workspace.writeFile(
        'src/_helpers.scss',
        readFileSync(
          resolve(__dirname, './fixtures/scss/_helpers.scss'),
        ) as any,
      );

      await workspace.writeFile(
        'src/first.js',
        `
import styles from './first.scss';

export function first() {
  console.log(\`Hello, I am first\`);
}
        `,
      );
      await workspace.writeFile(
        'src/second.js',
        `
import styles from './second.scss';

export function second() {
  console.log(\`Hello, I am second\`);
}
        `,
      );
      await workspace.writeFile(
        'src/index.js',
        `
export {first} from './first';
export {second} from './second';
        `,
      );

      await workspace.run('build');

      const cjsCSSContent = prepareContent(
        await workspace.contents('build/cjs/styles.css'),
      );

      const esmCSSContent = prepareContent(
        await workspace.contents('build/esm/styles.css'),
      );
      const expectedCSSContent = prepareContent(`
._Nav_125a3_1 ._Ul_125a3_1{ margin:2.37rem; padding:0; list-style:none; }

._Nav_125a3_1 ._Li_125a3_3{ display:inline-block; }

._Nav_125a3_1 ._Link_125a3_5{ display:block; padding:6px 12px; text-decoration:none; }


._Second_z4vpy_1 ._Nav_z4vpy_1{ margin:2.37rem; padding:0; list-style:none; }

._Second_z4vpy_1 ._Link_z4vpy_3{ display:inline-block; }

._Second_z4vpy_1 ._Table_z4vpy_5{ display:block; padding:6px 12px; text-decoration:none; }
      `);

      expect(cjsCSSContent).toStrictEqual(expectedCSSContent);
      expect(esmCSSContent).toStrictEqual(expectedCSSContent);
      expect(await workspace.contains('build/esnext/styles.css')).toBeFalsy();
    });
  });

  it('builds commmonjs, esmodules css outputs for multiple recursive imports', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@shopify/loom';
        import {buildLibrary} from '@shopify/loom-plugin-build-library';
        export default createPackage((pkg) => {
          pkg.runtime(Runtime.Node);
          pkg.use(
            buildLibrary({
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',
            }),
          );
        });
      `);

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
        'src/_helpers.scss',
        readFileSync(
          resolve(__dirname, './fixtures/scss/_helpers.scss'),
        ) as any,
      );

      await workspace.writeFile(
        'src/first.js',
        `
import {third} from './third';
import styles from './first.scss';

export function first() {
  console.log(\`Hello, I am first and this is \${third()}\`);
}
        `,
      );
      await workspace.writeFile(
        'src/second.js',
        `
import styles from './second.scss';

export function second() {
  console.log(\`Hello, I am second\`);
}
        `,
      );

      await workspace.writeFile(
        'src/third.js',
        `
import styles from './third.scss';

export function third() {
  console.log(\`Hello, I am third\`);
}
        `,
      );

      await workspace.writeFile(
        'src/index.js',
        `
export {first} from './first';
export {second} from './second';
        `,
      );

      await workspace.run('build');

      const cjsCSSContent = prepareContent(
        await workspace.contents('build/cjs/styles.css'),
      );

      const esmCSSContent = prepareContent(
        await workspace.contents('build/esm/styles.css'),
      );
      const expectedCSSContent = prepareContent(`
._Third_1u85a_1 ._Icon_1u85a_1{ margin:2.37rem; padding:0; list-style:none; }

._Third_1u85a_1 ._Logo_1u85a_3{ display:inline-block; }

._Third_1u85a_1 ._Svg_1u85a_5{ display:block; padding:6px 12px; text-decoration:none; }


._Nav_125a3_1 ._Ul_125a3_1{ margin:2.37rem; padding:0; list-style:none; }

._Nav_125a3_1 ._Li_125a3_3{ display:inline-block; }

._Nav_125a3_1 ._Link_125a3_5{ display:block; padding:6px 12px; text-decoration:none; }


._Second_z4vpy_1 ._Nav_z4vpy_1{ margin:2.37rem; padding:0; list-style:none; }

._Second_z4vpy_1 ._Link_z4vpy_3{ display:inline-block; }

._Second_z4vpy_1 ._Table_z4vpy_5{ display:block; padding:6px 12px; text-decoration:none; }
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
