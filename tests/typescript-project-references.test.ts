import {resolve} from 'path';

import glob from 'glob';
import {readJSONSync} from 'fs-extra';

const ROOT = resolve(__dirname, '..');
const basePackagePath = resolve(ROOT, 'packages');
const projectReferencesConfig = resolve(ROOT, 'tsconfig.json');

// When deprecating packages, we temporarily remove package content and publish
// an empty package before fully removing the folder. This list helps omit those
// in that interim period
const skiplist: string[] = [];

describe('typescript project references', () => {
  const referencesConfig: {
    references: {path: string}[];
  } = readJSONSync(projectReferencesConfig);
  const references = referencesConfig.references.map(({path}) =>
    path.replace('./packages/', ''),
  );
  const quiltReferences = references.map(prefixPackageName);

  it('includes all the packages', () => {
    const packages = glob
      .sync(resolve(basePackagePath, '*/package.json'))
      .map(
        (packageJsonPath) =>
          /sewing-kit-next\/packages\/(?<packageName>[\w._-]+)\/package\.json$/i.exec(
            packageJsonPath,
          )!.groups!.packageName,
      )
      .filter((packageName) => !skiplist.includes(packageName));

    expect(packages.sort()).toStrictEqual(references.sort());
  });

  references.map((packageName) => {
    const displayedName = prefixPackageName(packageName);

    describe(`${displayedName}`, () => {
      it(`includes internal packages used as references`, () => {
        const packageJson = resolvePackageJSONFile(packageName, 'package.json');
        const tsconfigJson: {
          references: {path: string}[];
        } = resolvePackageJSONFile(packageName, 'tsconfig.json');
        const internalReferences = tsconfigJson.references || [];

        const internalPackages = internalReferences
          .map((internalReference) =>
            extractPackagesFromInternalReference(internalReference),
          )
          .sort();

        const dependencies = Object.keys({
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
          ...packageJson.peerDependencies,
        });

        const quiltPackage = dependencies
          .filter((lib) => quiltReferences.includes(lib))
          .sort();

        expect(internalPackages).toStrictEqual(quiltPackage);
      });
    });
  });
});

function prefixPackageName(packageName: string) {
  return `@sewing-kit/${packageName}`;
}

function resolvePackageJSONFile(packageName: string, file: string) {
  const path = glob.sync(resolve(basePackagePath, packageName, file))[0];
  return readJSONSync(path);
}

const internalReferenceRegex = /\.\.\/(?<packageName>[\w._-]+)/i;
function extractPackagesFromInternalReference(internalReference: {
  path: string;
}) {
  return prefixPackageName(
    internalReferenceRegex.exec(internalReference.path)!.groups!.packageName,
  );
}
