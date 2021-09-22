import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

describe('@shopify/loom-plugin-build-library buildLibrary', () => {
  it('throws an error if you do not specify any entries', async () => {
    const workspaceId = generateUniqueWorkspaceID();

    await withWorkspace(workspaceId, async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage} from '@shopify/loom';
        import {buildLibrary} from '@shopify/loom-plugin-build-library';
        export default createPackage((pkg) => {
          pkg.use(
            buildLibrary({targets: 'node 12'}),
          );
        });
      `);

      await workspace.writeFile('src/index.js', `export const x = 1;`);

      const result = await workspace.run('build');

      expect(result.stdout()).toContain(
        `failed during step build package ${workspaceId} variant`,
      );

      expect(result.stdout()).not.toContain('build completed successfully');

      expect(result.stderr()).toContain(
        `No inputs found for "${workspaceId}".`,
      );
    });
  });

  it('throws an error if you specify an entry/binary that does not exist on disk', async () => {
    const workspaceId = generateUniqueWorkspaceID();

    await withWorkspace(workspaceId, async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage} from '@shopify/loom';
        import {buildLibrary} from '@shopify/loom-plugin-build-library';
        export default createPackage((pkg) => {
          // Real file papth is src/index.js
          pkg.entry({root: './src/index'})
          pkg.binary({root: './src/index2.js'})
          pkg.use(
            buildLibrary({targets: 'node 12'}),
          );
        });
      `);

      await workspace.writeFile('src/index.js', `export const x = 1;`);

      const result = await workspace.run('build');

      expect(result.stdout()).toContain(
        `failed during step build package ${workspaceId} variant`,
      );

      expect(result.stdout()).not.toContain('build completed successfully');

      expect(result.stderr()).toContain(
        `The following entry/binary root paths were defined in "${workspaceId}" but do not exist on disk: "./src/index", "./src/index2.js".`,
      );
    });
  });
});
