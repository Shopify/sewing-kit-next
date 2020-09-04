import {join} from 'path';
import {createWorkspace} from '@sewing-kit/config';
import {createWorkspaceTestPlugin} from '@sewing-kit/plugins';

import {eslint} from '@sewing-kit/plugin-eslint';
import {jest} from '@sewing-kit/plugin-jest';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';

export default createWorkspace((workspace) => {
  workspace.use(
    eslint(),
    jest(),
    workspaceTypeScript(),
    createWorkspaceTestPlugin('Meh', ({hooks}) => {
      hooks.configure.hook((configuration) => {
        configuration.jestSetupTests?.hook((env) => {
          return [...env, join(__dirname, 'tests', 'before-all.ts')];
        });
      });
    }),
  );
});
