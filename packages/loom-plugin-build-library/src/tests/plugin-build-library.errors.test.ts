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
      workspace.debugLastRun('build');

      expect(result.stdout()).toContain(
        `failed during step build package ${workspaceId} variant`,
      );

      expect(result.stdout()).not.toContain('build completed successfully');

      expect(result.stderr()).toContain(
        `No inputs found for "${workspaceId}".`,
      );
    });
  });
});
