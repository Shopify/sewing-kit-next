import {createWorkspace} from '@sewing-kit/core';

import {prettier} from '../src/plugin-prettier';

describe('@sewing-kit/prettier', () => {
  describe('prettier()', () => {
    it('applies the prettier plugin', async () => {
      const workspaceBuilder = createWorkspace((workspace) => {
        workspace.use(prettier());
      });
      const workspace = await workspaceBuilder();
      const workspacePlugins = workspace.workspacePlugins;
      const prettierPlugin = workspacePlugins[0];
      expect(prettierPlugin.id).toBe('SewingKit.Prettier');
    });
  });
});
