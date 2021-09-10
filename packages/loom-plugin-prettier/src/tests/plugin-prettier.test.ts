import {createWorkspace} from '@shopify/loom';

import {prettier} from '../plugin-prettier';

describe('@shopify/loom-plugin-prettier', () => {
  describe('prettier()', () => {
    it('applies the prettier plugin', async () => {
      const workspaceBuilder = createWorkspace((workspace) => {
        workspace.use(prettier());
      });
      const workspace = await workspaceBuilder();
      const workspacePlugins = workspace.workspacePlugins;
      const prettierPlugin = workspacePlugins[0];
      expect(prettierPlugin.id).toBe('Loom.Prettier');
    });
  });
});
