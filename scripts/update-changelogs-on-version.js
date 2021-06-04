/**
 * A script to be ran in a `version` hook that will package update and update
 * CHANGELOG.md headings accordingly.
 *
 * - CHANGELOGs containing a "Unreleased" heading will comment out the heading
 *   and add a new heading for new version of the package.
 * - CHANGELOGs containing a commented out "Unreleased" heading will add a new
 *   heading for the new version of the dependency and note that the only change
 *   is due to a transitive dependency update.
 *
 * Important: Add as the `version` script in your root package.json file. This
 * will cause it to run as part of the version release hooks as part of
 * `lerna version`. The `version` hook runs after version keys in package.json
 * files have been updated but before the changes are comitted, whiich allows
 * this script to update CHANGELOG.md files with versions that match those that
 * you selected when choosing what packages to update.
 */

// @type-check

const path = require('path');
const {execSync} = require('child_process');
const {readFileSync, writeFileSync} = require('fs');

const ROOT_PATH = path.resolve(__dirname, '..');

const updatedChangelogs = JSON.parse(
  execSync(`yarn run --silent lerna changed --json`, {stdio: ['pipe']}),
)
  .map(({location}) => updateChangelogForPackage(location))
  .filter((changelog) => changelog !== '');

if (updatedChangelogs.length > 0) {
  const changelogsForGit = updatedChangelogs
    .map((changelogPath) => JSON.stringify(changelogPath))
    .join(' ');

  execSync(`git add ${changelogsForGit}`);
}

/**
 * @param {string} packageLocation
 */
function updateChangelogForPackage(packageLocation) {
  const packageJsonPath = path.join(packageLocation, 'package.json');
  const changelogPath = path.join(packageLocation, 'CHANGELOG.md');
  const relativeChangelogPath = path.relative(ROOT_PATH, changelogPath);

  const newVersion = JSON.parse(readFileSync(packageJsonPath)).version;
  const changelogContent = readFileSync(changelogPath, 'utf8');

  if (newVersion.includes('-')) {
    console.log(
      `- ${relativeChangelogPath}: Skipping as ${newVersion} is a prerelease`,
    );
    return '';
  }

  if (changelogContent.includes(`\n## ${newVersion}`)) {
    console.log(
      `- ${relativeChangelogPath}: Skipping as ${newVersion} header is already present`,
    );
    return '';
  }

  if (changelogContent.includes('\n## Unreleased\n')) {
    console.log(
      `- ${relativeChangelogPath}: Replacing Unreleased header with ${newVersion} header`,
    );

    const newContent = changelogContent.replace(
      '\n## Unreleased\n',
      `\n<!-- ## Unreleased -->\n\n${headingFormat(newVersion)}\n`,
    );
    writeFileSync(changelogPath, newContent);
    return changelogPath;
  }

  if (changelogContent.includes('\n<!-- ## Unreleased -->\n')) {
    console.log(`- ${relativeChangelogPath}: Adding ${newVersion} header`);

    const newContent = changelogContent.replace(
      '\n<!-- ## Unreleased -->\n',
      `\n<!-- ## Unreleased -->\n\n${headingFormat(
        newVersion,
      )}\n\n- No updates. Transitive dependency bump.\n`,
    );
    writeFileSync(changelogPath, newContent);
    return changelogPath;
  }

  console.warn(
    `- ${relativeChangelogPath}: Skipping as no commented, or uncommented 'Unreleased' header was found`,
  );

  return '';
}

/**
 * @param {string} version
 */
function headingFormat(version) {
  // Date based on iso8601 - YYYY-MM-DD format
  const isoDate = new Date().toISOString().split('T')[0];
  return `## ${version} - ${isoDate}`;
}
