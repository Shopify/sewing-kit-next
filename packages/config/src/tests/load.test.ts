import {loadWorkspace} from '../load';
import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';
import {defaultEntry, packageConfig, legacySewingKitConfig} from './utilities';

const configs = [
  'sewing-kit.config.js',
  'sewing-kit.config.ts',
  'config/sewing-kit.config.js',
  'config/sewing-kit.config.ts',

  'sewing-kit-next.config.js',
  'sewing-kit-next.config.ts',
  'config/sewing-kit-next.config.js',
  'config/sewing-kit-next.config.ts',
];

describe('loadWorkspace', () => {
  it.each(configs)('generates a project with a %s config', async (config) => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeFile('src/index.js', defaultEntry);
      await workspace.writeConfig(packageConfig, config);

      const parsedConfig = await loadWorkspace(workspace.root);
      expect(parsedConfig.workspace.projects).toHaveLength(1);
    });
  });

  it.each(configs)('no-ops with legacy %s configs', async (config) => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeFile('src/index.js', defaultEntry);
      await workspace.writeConfig(legacySewingKitConfig, config);

      const parsedConfig = await loadWorkspace(workspace.root);
      expect(parsedConfig.workspace.projects).toHaveLength(0);
    });
  });

  it('only consumes the SK1 config in a SK0/SK1 hybrid project', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeFile('src/index.js', defaultEntry);

      await workspace.writeConfig(packageConfig, 'sewing-kit-next.config.ts');
      await workspace.writeConfig(
        legacySewingKitConfig,
        'sewing-kit.config.ts',
      );

      const parsedConfig = await loadWorkspace(workspace.root);
      expect(parsedConfig.workspace.packages).toHaveLength(1);
    });
  });
});
