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

  // File creation in CI is so fast that stat.mtimeMs results
  // are the same when multiple writeToSrc are called back-to-back
  await sleep(10);
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createTestPackage(workspace: Workspace) {
  return new Package({name: generateUniqueWorkspaceID(), root: workspace.root});
}
