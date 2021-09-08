import {resolve, relative} from 'path';

import {
  Package,
  createProjectBuildPlugin,
  ProjectPluginContext,
} from '@sewing-kit/core';

interface EntryConfig {
  extension: string;
  outputPath: string;
  exportStyle: 'commonjs' | 'esmodules';
}

interface BuildEntrypointsOptions {
  commonjs: boolean;
  esmodules: boolean;
  esnext: boolean;
}

export function writeEntrypoints(options: BuildEntrypointsOptions) {
  return createProjectBuildPlugin<Package>(
    'SewingKit.PackageBuild.Entrypoints',
    ({hooks, project, api}) => {
      hooks.steps.hook((steps) => [
        ...steps,
        createWriteEntrypointsStep({project, api}, options),
      ]);
    },
  );
}

function createWriteEntrypointsStep(
  {project, api}: Pick<ProjectPluginContext<Package>, 'api' | 'project'>,
  options: BuildEntrypointsOptions,
) {
  return api.createStep(
    {
      id: 'PackageBuild.Entrypoints',
      label: 'Adding entries for Rollup outputs',
    },
    async () => {
      const entryConfigs: EntryConfig[] = [];

      if (options.commonjs) {
        entryConfigs.push({
          exportStyle: 'commonjs',
          outputPath: project.fs.buildPath('cjs'),
          extension: '.js',
        });
      }

      if (options.esmodules) {
        entryConfigs.push({
          exportStyle: 'esmodules',
          outputPath: project.fs.buildPath('esm'),
          extension: '.mjs',
        });
      }

      if (options.esnext) {
        entryConfigs.push({
          exportStyle: 'esmodules',
          outputPath: project.fs.buildPath('esnext'),
          extension: '.esnext',
        });
      }

      await Promise.all(
        entryConfigs.map((config) => writeEntries(project, config)),
      );
    },
  );
}

async function writeEntries(
  project: Package,
  {extension, outputPath, exportStyle}: EntryConfig,
) {
  const sourceRoot = resolve(project.root, 'src');

  await Promise.all(
    project.entries.map(async (entry) => {
      const absoluteEntryPath = (await project.fs.hasFile(`${entry.root}.*`))
        ? project.fs.resolvePath(entry.root)
        : project.fs.resolvePath(entry.root, 'index');

      const relativeFromSourceRoot = relative(sourceRoot, absoluteEntryPath);
      const destinationInOutput = resolve(outputPath, relativeFromSourceRoot);
      const relativeFromRoot = `${normalizedRelative(
        project.root,
        destinationInOutput,
      )}${extension}`;

      if (exportStyle === 'commonjs') {
        // interopRequireDefault copied from https://github.com/babel/babel/blob/56044c7851d583d498f919e9546caddf8f80a72f/packages/babel-helpers/src/helpers.js#L558-L562
        const linkPath = JSON.stringify(relativeFromRoot);
        await project.fs.write(
          `${entry.name || 'index'}${extension}`,
          `function interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}
module.exports = interopRequireDefault(require(${linkPath}));
`,
        );

        return;
      }

      let hasDefault = true;
      let content = '';

      try {
        content = await project.fs.read(
          (await project.fs.glob(`${absoluteEntryPath}.*`))[0],
        );

        // export default ...
        // export {Foo as default} from ...
        // export {default} from ...
        hasDefault =
          /(?:export|as) default\b/.test(content) || /{default}/.test(content);
      } catch {
        // intentional no-op
      }

      const entryExtension = `${entry.name ?? 'index'}${extension}`;
      const entryContents = [
        `export * from ${JSON.stringify(relativeFromRoot)};`,
        hasDefault
          ? `export {default} from ${JSON.stringify(relativeFromRoot)};`
          : false,
      ]
        .filter(Boolean)
        .join('\n');

      await project.fs.write(entryExtension, entryContents);
    }),
  );
}

function normalizedRelative(from: string, to: string) {
  const rel = relative(from, to);
  return rel.startsWith('.') ? rel : `./${rel}`;
}
