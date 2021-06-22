import {createWorkspace} from '@sewing-kit/config';
import {createWorkspaceTestPlugin} from '@sewing-kit/plugins';
import {eslint} from '@sewing-kit/plugin-eslint';
import {prettier} from '@sewing-kit/plugin-prettier';
import {jest} from '@sewing-kit/plugin-jest';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';

export default createWorkspace((workspace) => {
  workspace.use(
    eslint(),
    prettier(),
    jest(),
    workspaceTypeScript(),
    runWorkspaceTests(),
  );
});

function runWorkspaceTests() {
  return createWorkspaceTestPlugin('SK.WorkspaceTests', ({hooks}) => {
    hooks.configure.hook((hooks) => {
      hooks.jestConfig?.hook((config) => {
        if (Array.isArray(config.projects)) {
          config.projects.unshift({
            ...(config.projects[0] as any),
            displayName: 'root',
            rootDir: 'tests',
          });
        }
        return config;
      });
    });
  });
}
