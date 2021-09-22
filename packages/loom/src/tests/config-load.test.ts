import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';
import {loadWorkspace} from '../config-load';
import {DiagnosticError} from '../core';

const configs = [
  'loom.config.js',
  'loom.config.ts',
  'config/loom.config.js',
  'config/loom.config.ts',
];

const packageConfig = `
import {createPackage} from '@shopify/loom';

export default createPackage((pkg) => {
  pkg.entry({root: '/src/index'});
})`;

const defaultEntry = `
export function pkg(greet) {
  console.log(\`Hello, \${greet}!\`);
}
`;

describe('loadWorkspace', () => {
  it.each(configs)('generates a project with a %s config', async (config) => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeFile('src/index.js', defaultEntry);
      await workspace.writeConfig(packageConfig, config);

      const parsedConfig = await loadWorkspace(workspace.root);
      expect(parsedConfig.workspace.projects).toHaveLength(1);
    });
  });

  it('fails miserably with a config that does not export anything', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      const badPackageConfig = `
      import {createPackage} from '@shopify/loom';

      createPackage((pkg) => { // Does not export
        pkg.entry({root: '/src/index'});
      })`;

      await workspace.writeFile('src/index.js', defaultEntry);
      await workspace.writeConfig(badPackageConfig, 'loom.config.js');

      await expect(async () => {
        const parsedConfig = await loadWorkspace(workspace.root);
      }).rejects.toThrow(DiagnosticError);
    });
  });
});
