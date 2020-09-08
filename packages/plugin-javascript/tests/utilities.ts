import {statSync as stat} from 'fs';

import {Package} from '@sewing-kit/plugins';
import {Workspace, generateUniqueWorkspaceID} from '../../../tests/utilities';

export function getModifiedTime(filepath: string) {
  return stat(filepath).mtimeMs;
}

export async function writeToSrc(
  workspace: Workspace,
  filepath: string,
  contents?: string,
) {
  await workspace.writeFile(
    `src/${filepath}`,
    contents
      ? contents
      : `export function pkg(greet) { console.log(\`Hello, \${greet}!\`); }`,
  );
}

export function createTestPackage(workspace: Workspace) {
  return new Package({name: generateUniqueWorkspaceID(), root: workspace.root});
}
