import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

describe('@shopify/loom-plugin-build-library buildLibrary', () => {
  it('builds commmonjs, esmodules and esnext outputs by default', async () => {
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

  it('builds tsx files', async () => {
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
        'src/index.tsx',
        `
export function MyComponent({greet}: {greet: string}) {
  return <div>{greet}</div>
}
        `,
      );

      await workspace.run('build');

      const expectedFunctionOutput = `
function MyComponent({
  greet
}) {
  return /*#__PURE__*/React.createElement("div", null, greet);
}
`.trim();

      const esmBuildContent = await workspace.contents('build/esm/index.mjs');
      expect(esmBuildContent).toContain(expectedFunctionOutput);
    });
  });
});
