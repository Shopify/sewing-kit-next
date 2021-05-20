import path from 'path';
import {execSync} from 'child_process';

import fs from 'fs-extra';

export const ROOT = path.resolve(__dirname, '../../');

const execSilent = (cmd) => execSync(cmd, {stdio: 'ignore', cwd: ROOT});

export function staleChangelogs(
  pkgs: string[],
): {version: string; name: string; path: string}[] {
  return pkgs
    .map((pkg) => {
      const changelogPath = path.resolve(pkg, '../CHANGELOG.md');
      const {version, name} = fs.readJSONSync(pkg);

      const changelogContents = fs.readFileSync(changelogPath, {
        encoding: 'utf-8',
      });

      if (changelogContents.includes(version)) {
        return null;
      }

      return {
        version,
        name,
        path: changelogPath,
      };
    })
    .filter((error) => Boolean(error));
}

export function format() {
  execSilent('yarn run prettier  ./packages/*/CHANGELOG.md --write');
}
