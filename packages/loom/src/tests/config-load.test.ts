import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';
import {loadWorkspace} from '../config-load';

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
});
