import {relative, resolve} from 'path';

import {copy, remove} from 'fs-extra';
import {Package, createProjectBuildPlugin} from '@sewing-kit/plugins';

const PLUGIN = 'SewingKit.PackageTypeScript';

export interface BuildTypeScriptDefinitionsOptions {
  readonly typesAtRoot?: boolean;
}

export function buildTypeScriptDefinitions({
  typesAtRoot = false,
}: BuildTypeScriptDefinitionsOptions = {}) {
  return createProjectBuildPlugin<Package>(PLUGIN, ({hooks, project, api}) => {
    hooks.steps.hook((steps) => [
      ...steps,
      api.createStep(
        {
          id: 'PackageTypeScript.WriteTypeDefinitions',
          label: 'write type definitions',
        },
        async () => {
          await Promise.all(
            project.entries.map((entry) =>
              remove(project.fs.resolvePath(`${entry.name || 'index'}.d.ts`)),
            ),
          );

          if (typesAtRoot) {
            const outputPath = await getOutputPath(project);
            const files = await project.fs.glob(
              project.fs.resolvePath(outputPath, '**/*.d.ts'),
            );

            await Promise.all(
              files.map((file) =>
                copy(file, project.fs.resolvePath(relative(outputPath, file))),
              ),
            );
          } else {
            await writeTypeScriptEntries(project);
          }
        },
      ),
    ]);
  });
}

async function getOutputPath(pkg: Package) {
  if (await pkg.fs.hasFile('tsconfig.json')) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const tsconfig = require(pkg.fs.resolvePath('tsconfig.json'));
      const relativePath =
        (tsconfig.compilerOptions && tsconfig.compilerOptions.outDir) ||
        'build/ts';

      return pkg.fs.resolvePath(relativePath);
    } catch {
      // Fall through to the default below
    }
  }

  return pkg.fs.resolvePath('build/ts');
}

export async function writeTypeScriptEntries(pkg: Package) {
  const outputPath = await getOutputPath(pkg);

  const sourceRoot = pkg.fs.resolvePath('src');

  for (const entry of pkg.entries) {
    const absoluteEntryPath = (await pkg.fs.hasDirectory(entry.root))
      ? pkg.fs.resolvePath(entry.root, 'index')
      : pkg.fs.resolvePath(entry.root);
    const relativeFromSourceRoot = relative(sourceRoot, absoluteEntryPath);
    const destinationInOutput = resolve(outputPath, relativeFromSourceRoot);
    const relativeFromRoot = normalizedRelative(pkg.root, destinationInOutput);

    let hasDefault = true;
    let content = '';

    try {
      content = await pkg.fs.read(
        (await pkg.fs.glob(`${absoluteEntryPath}.*`))[0],
      );

      // export default ...
      // export {Foo as default} from ...
      // export {default} from ...
      hasDefault =
        /(?:export|as) default\b/.test(content) || /{default}/.test(content);
    } catch {
      // intentional no-op
      content = '';
    }

    await pkg.fs.write(
      `${entry.name || 'index'}.d.ts`,
      [
        `export * from ${JSON.stringify(relativeFromRoot)};`,
        hasDefault
          ? `export {default} from ${JSON.stringify(relativeFromRoot)};`
          : false,
      ]
        .filter(Boolean)
        .join('\n'),
    );
  }
}

function normalizedRelative(from: string, to: string) {
  const rel = relative(from, to);
  return rel.startsWith('.') ? rel : `./${rel}`;
}
