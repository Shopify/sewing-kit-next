/* eslint-disable no-console */

import path from 'path';
import {execSync} from 'child_process';
import glob from 'glob';
import fs from 'fs-extra';

const ROOT = path.resolve(__dirname, '../../');

const exec = (cmd) => execSync(cmd, {stdio: 'inherit', cwd: ROOT});
const execSilent = (cmd) => execSync(cmd, {stdio: 'ignore', cwd: ROOT});

run();

async function run() {
  const packages = glob.sync(path.resolve(ROOT, 'packages/*/package.json'));

  lintVersions(packages);

  format();
}

// Verify that the version in the package.json exists in the changelog
function lintVersions(pkgs: string[]) {
  pkgs.forEach((pkg) => {
    const changelogPath = path.resolve(pkg, '../CHANGELOG.md');
    const {version, name} = fs.readJSONSync(pkg);

    const changelogContents = fs.readFileSync(changelogPath, {
      encoding: 'utf-8',
    });

    if (changelogContents.includes(version)) {
      return false;
    }

    console.log(`
FAILED CHANGELOG LINT:
The following packages do not have their latest version in their respective CHANGELOG.md.
Please update these changelogs and run \`yarn run:ts scripts/changelogs/lint.ts\`.
     `);
    console.log(`- v${version} in ${name}. (See ${changelogPath})`);
    return true;
  });
}

function format() {
  execSilent('yarn run prettier  ./packages/*/CHANGELOG.md --write');
}
