/* eslint-disable no-console */

import path from 'path';
import glob from 'glob';
import fs from 'fs-extra';
import {format, staleChangelogs, ROOT} from './utilities';

run();

async function run() {
  const packages = glob.sync(path.resolve(ROOT, 'packages/*/package.json'));

  lintVersions(packages);

  format();
}

// Verify that the version in the package.json exists in the changelog
function lintVersions(pkgs: string[]) {
  const changelogs = staleChangelogs(pkgs);

  if (changelogs.length > 0) {
    changelogs.forEach(({name, version, path}) => {
      console.log(`Updating CHANGELOG.md for ${name}. (See ${path})`);

      const changelogContents = fs.readFileSync(path, {
        encoding: 'utf-8',
      });

      const date = new Date();
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1);
      const day = pad(date.getDate() + 1);

      fs.writeFileSync(
        path,
        changelogContents.replace(
          '## [Unreleased]',
          `      
## [Unreleased]

## [${version}] - ${year}-${month}-${day}

- No updates. Transitive dependency bump.
      `,
        ),
      );
    });

    format();
  } else {
    console.log('👍 CHANGELOGs look good!');
  }
}

function pad(num) {
  return `0${num}`.slice(-2);
}
