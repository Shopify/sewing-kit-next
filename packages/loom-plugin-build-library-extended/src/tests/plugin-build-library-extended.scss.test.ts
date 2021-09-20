import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

describe('@shopify/loom-plugin-build-library-extended buildLibraryExtended', () => {
  it('builds styles', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(`
        import {createPackage, Runtime} from '@shopify/loom';
        import {buildLibrary} from '@shopify/loom-plugin-build-library';
        import {buildLibraryExtended} from '@shopify/loom-plugin-build-library-extended';
        export default createPackage((pkg) => {
          pkg.runtime(Runtime.Node);
          pkg.use(
            buildLibrary({browserTargets: 'chrome 88', nodeTargets: 'node 12'}),
            buildLibraryExtended(),
          );
        });
      `);

      await workspace.writeFile(
        'src/index.js',
        `
        export {default as styles1} from './style1.scss';
        export {default as styles2} from './style2.scss';
        `,
      );

      await workspace.writeFile(
        'src/style1.scss',
        `.foo { color: red; }\n.bar { color: blue; }`,
      );
      await workspace.writeFile('src/style2.scss', `.base { color: green; }`);

      await workspace.run('build');

      const esmStyleContent = await workspace.contents('build/esm/styles.css');
      expect(esmStyleContent).toContain(
        `._foo_192ss_1{ color:red; }\n\n._bar_192ss_3{ color:blue; }\n\n\n._base_99dno_1{ color:green; }`,
      );

      const esnextStyleContent = await workspace.contents(
        'build/esnext/style1.scss.esnext',
      );
      expect(esnextStyleContent).toContain(`import './style1.css';`);
    });
  });
});
