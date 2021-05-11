import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

describe('@sewing-kit/plugin-package-flexible-outputs', () => {
  it('builds commmonjs, esmodules and esnext outputs by default', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@sewing-kit/config';
        import {javascript} from '@sewing-kit/plugin-javascript';
        import {rollupOpinionated} from '@sewing-kit/plugin-package-flexible-outputs';

        export default createPackage((pkg) => {
          pkg.runtime(Runtime.Node);
          pkg.use(
            javascript(),
            rollupOpinionated({
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',
            }),
          );
        });
      `);

      await workspace.writeFile(
        'src/index.js',
        `
export function pkg(greet) {
  console.log(\`Hello, \${greet}!\`);
}
        `,
      );

      const result = await workspace.run('build');

      const expectedFunctionOutput = `
function pkg(greet) {
  console.log(\`Hello, \${greet}!\`);
}
`.trim();

      const cjsBuildContent = await workspace.contents('build/cjs/index.js');
      expect(cjsBuildContent).toContain(expectedFunctionOutput);
      expect(cjsBuildContent).toContain(`exports.pkg = pkg`);

      const esmBuildContent = await workspace.contents('build/esm/index.mjs');
      expect(esmBuildContent).toContain(expectedFunctionOutput);
      expect(esmBuildContent).toContain(`export { pkg }`);

      const esnextBuildContent = await workspace.contents(
        'build/esnext/index.esnext',
      );
      expect(esnextBuildContent).toContain(expectedFunctionOutput);
      expect(esnextBuildContent).toContain(`export { pkg }`);

      // Entrypoints
      expect(await workspace.contents('index.js')).toContain(
        'module.exports = require("./build/cjs/index.js");',
      );
      expect(await workspace.contents('index.mjs')).toContain(
        'export * from "./build/esm/index.mjs"',
      );
      expect(await workspace.contents('index.esnext')).toContain(
        'export * from "./build/esnext/index.esnext"',
      );
    });
  });

  it('builds only commmonjs outputs when esmodules/esnext are disabled', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@sewing-kit/config';
        import {javascript} from '@sewing-kit/plugin-javascript';
        import {rollupOpinionated} from '@sewing-kit/plugin-package-flexible-outputs';

        export default createPackage((pkg) => {
          pkg.runtime(Runtime.Node);
          pkg.use(
            javascript(),
            rollupOpinionated({
              esmodules: false,
              esnext: false,
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',
            }),
          );
        });
      `);

      await workspace.writeFile(
        'src/index.js',
        `
export function pkg(greet) {
  console.log(\`Hello, \${greet}!\`);
}
        `,
      );

      await workspace.run('build');

      // Build content
      expect(await workspace.contains('build/cjs/index.js')).toBeTruthy();
      expect(await workspace.contains('build/esm')).toBeFalsy();
      expect(await workspace.contains('build/esnext')).toBeFalsy();

      // Entrypoints
      expect(await workspace.contains('index.js')).toBeTruthy();
      expect(await workspace.contains('index.mjs')).toBeFalsy();
      expect(await workspace.contains('index.esnext')).toBeFalsy();
    });
  });

  it('builds multiple entrypoints', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@sewing-kit/config';
        import {javascript} from '@sewing-kit/plugin-javascript';
        import {rollupOpinionated} from '@sewing-kit/plugin-package-flexible-outputs';

        export default createPackage((pkg) => {
          pkg.entry({root: './src/index'});
          pkg.entry({name: 'second', root: './src/second'});
          pkg.binary({name: 'cmd', root: './src/cmd'});
          pkg.runtime(Runtime.Node);
          pkg.use(
            javascript(),
            rollupOpinionated({
              esmodules: false,
              esnext: false,
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',
            }),
          );
        });
      `);

      // defined in pkg.entry
      await workspace.writeFile('src/index.js', `export const x = 'index';`);
      await workspace.writeFile('src/second.js', `export const x = 'second';`);
      // defined in pkg.binary
      await workspace.writeFile('src/cmd.js', `export const x = 'cmd';`);

      await workspace.run('build');

      // Build content
      expect(await workspace.contains('build/cjs/index.js')).toBeTruthy();
      expect(await workspace.contains('build/cjs/second.js')).toBeTruthy();
      expect(await workspace.contains('build/cjs/cmd.js')).toBeTruthy();
    });
  });

  it.each([
    // uses target: "node 12", exponentiation supported, so should not transpile
    ['Runtime.Node', 'const x = 2 ** 2;'],
    // uses target: "chrome 10", exponentiation not supported, so should transpile
    ['Runtime.Browser', 'var x = Math.pow(2, 2);'],
    // uses target: "node 12, chrome 10", exponentiation not supported, so should transpile
    ['Runtime.Node, Runtime.Browser', 'var x = Math.pow(2, 2);'],
  ])(
    'transpiles js content when runtime is %p',
    async (runtimes, expectedOutput) => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        await workspace.writeConfig(`
        import {createPackage, Runtime} from '@sewing-kit/config';
        import {javascript} from '@sewing-kit/plugin-javascript';
        import {rollupOpinionated} from '@sewing-kit/plugin-package-flexible-outputs';

        export default createPackage((pkg) => {
          pkg.runtimes(${runtimes});
          pkg.use(
            javascript(),
            rollupOpinionated({
              // Needs to transpile exponentiation
              browserTargets: 'chrome 10',
              // Doesn't need to transpile exponentiation
              nodeTargets: 'node 12',
            }),
          );
        });
      `);

        await workspace.writeFile('src/index.js', 'export const x = 2 ** 2;');

        await workspace.run('build');

        // Build content
        expect(await workspace.contents('build/esm/index.mjs')).toContain(
          expectedOutput,
        );

        // Esnext always compiles to latest chrome
        // so no transpilation of exponentiation is needed
        expect(await workspace.contents('build/esnext/index.esnext')).toContain(
          'const x = 2 ** 2;',
        );
      });
    },
  );

  it.each([
    [
      'as an array',
      '[injecterPlugin({value: "fixed"})]',
      'const MAGIC = "fixed"',
      'const MAGIC = "fixed"',
    ],
    [
      'as an function to configure per target',
      '(target) => [injecterPlugin({value: JSON.stringify(target.options)})]',
      'const MAGIC = "{}"',
      'const MAGIC = "{\\"rollupEsnext\\":true}"',
    ],
  ])(
    'allows injecting custom rollup plugins %s',
    async (_, pluginsValue, expectedMainOutput, expectedEsnextOutput) => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        await workspace.writeConfig(`
        import {createPackage, Runtime} from '@sewing-kit/config';
        import {javascript} from '@sewing-kit/plugin-javascript';
        import {rollupOpinionated} from '@sewing-kit/plugin-package-flexible-outputs';

        function injecterPlugin({value}) {
          return {
            name: 'test-injecter',
            transform(code) {
              return code + 'export const MAGIC = ' + JSON.stringify(value) + ';';
            }
          }
        }

        export default createPackage((pkg) => {
          pkg.runtime(Runtime.Node);
          pkg.use(
            javascript(),
            rollupOpinionated({
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',
              plugins: ${pluginsValue}
            }),
          );
        });
      `);

        await workspace.writeFile('src/index.js', 'export const x = 2 ** 2;');

        await workspace.run('build');

        expect(await workspace.contents('build/esm/index.mjs')).toContain(
          expectedMainOutput,
        );

        expect(await workspace.contents('build/esnext/index.esnext')).toContain(
          expectedEsnextOutput,
        );
      });
    },
  );
});
