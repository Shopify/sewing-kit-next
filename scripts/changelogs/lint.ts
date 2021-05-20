import path from 'path';

import glob from 'glob';

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
    console.log(`
FAILED CHANGELOG LINT:
The following packages do not have their latest version in their respective CHANGELOG.md.
Please update these changelogs and run \`yarn run lint:changelogs\`.
    `);
    changelogs.forEach(({name, version, path}) =>
      console.log(`- v${version} in ${name}. (See ${path})`),
    );

    console.log(`
If the above changelogs are all the result of a transitive dependency bump, run \`yarn run lint:changelogs:fix\`.
    `);
  } else {
    console.log('👍 CHANGELOGs look good!');
  }
}
