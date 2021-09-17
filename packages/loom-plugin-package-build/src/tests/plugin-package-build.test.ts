import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

describe('@shopify/loom-plugin-package-build', () => {
  it('builds commmonjs, esmodules and esnext outputs by default', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@shopify/loom';
        import {babel} from '@shopify/loom-plugin-babel';
        import {packageBuild} from '@shopify/loom-plugin-package-build';
        export default createPackage((pkg) => {
          pkg.runtime(Runtime.Node);
          pkg.use(
            babel({config: {presets: ['@shopify/babel-preset']}}),
            packageBuild({
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
        'module.exports = interopRequireDefault(require("./build/cjs/index.js"));',
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
        import {createPackage, Runtime} from '@shopify/loom';
        import {babel} from '@shopify/loom-plugin-babel';
        import {packageBuild} from '@shopify/loom-plugin-package-build';
        export default createPackage((pkg) => {
          pkg.runtime(Runtime.Node);
          pkg.use(
            babel({config: {presets: ['@shopify/babel-preset']}}),
            packageBuild({
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
        import {createPackage, Runtime} from '@shopify/loom';
        import {babel} from '@shopify/loom-plugin-babel';
        import {packageBuild} from '@shopify/loom-plugin-package-build';
        export default createPackage((pkg) => {
          pkg.entry({root: './src/index'});
          pkg.entry({name: 'second', root: './src/second'});
          pkg.binary({name: 'cmd', root: './src/cmd'});
          pkg.runtime(Runtime.Node);
          pkg.use(
            babel({config: {presets: ['@shopify/babel-preset']}}),
            packageBuild({
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

      // Entrypoints
      expect(await workspace.contains('index.js')).toBeTruthy();
      expect(await workspace.contains('second.js')).toBeTruthy();
      expect(await workspace.contains('cmd.js')).toBeFalsy();
    });
  });

  it('generates binary files', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@shopify/loom';
        import {babel} from '@shopify/loom-plugin-babel';
        import {packageBuild} from '@shopify/loom-plugin-package-build';
        export default createPackage((pkg) => {
          pkg.binary({name: 'cmd', root: './src/index'});
          pkg.runtime(Runtime.Node);
          pkg.use(
            babel({config: {presets: ['@shopify/babel-preset']}}),
            packageBuild({
              esmodules: false,
              esnext: false,
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',
            }),
          );
        });
      `);

      // defined in pkg.binary
      await workspace.writeFile('src/index.js', `export const x = 'cmd';`);

      await workspace.run('build');

      // Build content
      expect(await workspace.contains('build/cjs/index.js')).toBeTruthy();

      // Bin file
      expect(await workspace.contains('bin/cmd')).toBeTruthy();
      expect(await workspace.contents('bin/cmd')).toContain(
        `#!/usr/bin/env node\nrequire("./../build/cjs/index.js")`,
      );
    });
  });

  it('can disable generation of root entrypoints', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
          import {createPackage, Runtime} from '@shopify/loom';
          import {babel} from '@shopify/loom-plugin-babel';
          import {packageBuild} from '@shopify/loom-plugin-package-build';
          export default createPackage((pkg) => {
            pkg.runtime(Runtime.Node);
            pkg.use(
              babel({config: {presets: ['@shopify/babel-preset']}}),
              packageBuild({
                browserTargets: 'chrome 88',
                nodeTargets: 'node 12',
                rootEntrypoints: false,
              }),
            );
          });
        `);

      await workspace.writeFile('src/index.js', `export const x = 'index';`);

      await workspace.run('build');

      // Entrypoints
      expect(await workspace.contains('index.js')).toBeFalsy();
      expect(await workspace.contains('index.mjs')).toBeFalsy();
      expect(await workspace.contains('index.esnext')).toBeFalsy();
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
        import {createPackage, Runtime} from '@shopify/loom';
        import {babel} from '@shopify/loom-plugin-babel';
        import {packageBuild} from '@shopify/loom-plugin-package-build';
        export default createPackage((pkg) => {
          pkg.runtimes(${runtimes});
          pkg.use(
            babel({config: {presets: ['@shopify/babel-preset']}}),
            packageBuild({
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

  it('builds entries and binaries when the source is not in the src directory', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@shopify/loom';
        import {babel} from '@shopify/loom-plugin-babel';
        import {packageBuild} from '@shopify/loom-plugin-package-build';
        export default createPackage((pkg) => {
          pkg.entry({root: './js/index'});
          pkg.runtime(Runtime.Node);
          pkg.use(
            babel({config: {presets: ['@shopify/babel-preset']}}),
            packageBuild({
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',

            }),
          );
        });
      `);

      await workspace.writeFile('js/index.js', `export const x = 'index';`);
      await workspace.writeFile('src/index.js', `export const x = 'nope';`);

      await workspace.run('build');

      workspace.debug();

      expect(await workspace.contains('build/cjs/index.js')).toBeTruthy();
      expect(await workspace.contains('build/esm/index.mjs')).toBeTruthy();
      expect(
        await workspace.contains('build/esnext/index.esnext'),
      ).toBeTruthy();

      // Entrypoints
      expect(await workspace.contents('index.js')).toContain(
        'module.exports = interopRequireDefault(require("./build/cjs/index.js"));',
      );
      expect(await workspace.contents('index.mjs')).toContain(
        'export * from "./build/esm/index.mjs"',
      );
      expect(await workspace.contents('index.esnext')).toContain(
        'export * from "./build/esnext/index.esnext"',
      );
    });
  });

  it('builds entries and binaries when the source is spread across multiple folders', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@shopify/loom';
        import {babel} from '@shopify/loom-plugin-babel';
        import {packageBuild} from '@shopify/loom-plugin-package-build';
        export default createPackage((pkg) => {
          pkg.entry({root: './src/index'});
          pkg.entry({name: 'second', root: './js/second'});
          pkg.binary({name: 'cmd', root: './cmd/cmd'});
          pkg.runtime(Runtime.Node);
          pkg.use(
            babel({config: {presets: ['@shopify/babel-preset']}}),
            packageBuild({
              browserTargets: 'chrome 88',
              nodeTargets: 'node 12',
            }),
          );
        });
      `);

      await workspace.writeFile('src/index.js', `export const x = 'index';`);
      await workspace.writeFile(
        'js/second/index.js',
        `export const x = 'second';`,
      );
      await workspace.writeFile('cmd/cmd.js', `export const x = 'cmd';`);

      await workspace.run('build');

      expect(await workspace.contains('build/cjs/src/index.js')).toBeTruthy();
      expect(await workspace.contains('build/esm/src/index.mjs')).toBeTruthy();
      expect(
        await workspace.contains('build/esnext/src/index.esnext'),
      ).toBeTruthy();

      expect(
        await workspace.contains('build/cjs/js/second/index.js'),
      ).toBeTruthy();
      expect(
        await workspace.contains('build/esm/js/second/index.mjs'),
      ).toBeTruthy();
      expect(
        await workspace.contains('build/esnext/js/second/index.esnext'),
      ).toBeTruthy();

      expect(await workspace.contains('build/cjs/cmd/cmd.js')).toBeTruthy();
      expect(await workspace.contains('build/esm/cmd/cmd.mjs')).toBeTruthy();
      expect(
        await workspace.contains('build/esnext/cmd/cmd.esnext'),
      ).toBeTruthy();

      // Entrypoints
      expect(await workspace.contents('index.js')).toContain(
        'module.exports = interopRequireDefault(require("./build/cjs/src/index.js"));',
      );

      expect(await workspace.contents('index.mjs')).toContain(
        'export * from "./build/esm/src/index.mjs"',
      );
      expect(await workspace.contents('index.esnext')).toContain(
        'export * from "./build/esnext/src/index.esnext"',
      );

      expect(await workspace.contents('second.js')).toContain(
        'module.exports = interopRequireDefault(require("./build/cjs/js/second/index.js"));',
      );
      expect(await workspace.contents('second.mjs')).toContain(
        'export * from "./build/esm/js/second/index.mjs"',
      );
      expect(await workspace.contents('second.esnext')).toContain(
        'export * from "./build/esnext/js/second/index.esnext"',
      );

      expect(await workspace.contents('bin/cmd')).toContain(
        '#!/usr/bin/env node\nrequire("./../build/cjs/cmd/cmd.js")',
      );
    });
  });
});
