import {relative, dirname, join} from 'path';

import {
  Package,
  createProjectBuildPlugin,
  ProjectPluginContext,
} from '@shopify/loom';
import findCommonAncestorPath from 'common-ancestor-path';

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
    'Loom.BuildLibrary.Entrypoints',
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
      id: 'BuildLibrary.Entrypoints',
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
  const commonEntryRoot = findCommonAncestorPath(
    ...(await Promise.all(
      [...project.entries, ...project.binaries].map(async ({root}) =>
        dirname(project.fs.resolvePath(root)),
      ),
    )),
  );

  // This is present as a typeguard that should never trigger as
  // findCommonAncestorPath will only return null if you're on windows and you
  // feed it files that are on different drives - which should never occur if
  // you're building a project that is contained within a single folder
  if (commonEntryRoot === null) {
    throw new Error(
      'Could not find a common ancestor folder for all your entrypoints',
    );
  }

  await Promise.all(
    project.entries.map(async ({name, root}) => {
      const entryPath = project.fs.resolvePath(root);
      const entryRelativeToCommonRoot = relative(commonEntryRoot, entryPath);

      const pathToBuiltEntry = `./${relative(
        project.root,
        join(outputPath, entryRelativeToCommonRoot.replace(/\..+$/, extension)),
      )}`;

      if (exportStyle === 'commonjs') {
        // interopRequireDefault copied from https://github.com/babel/babel/blob/56044c7851d583d498f919e9546caddf8f80a72f/packages/babel-helpers/src/helpers.js#L558-L562
        const linkPath = JSON.stringify(pathToBuiltEntry);
        await project.fs.write(
          `${name || 'index'}${extension}`,
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
        content = await project.fs.read(entryPath);

        // export default ...
        // export {Foo as default} from ...
        // export {default} from ...
        hasDefault =
          /(?:export|as) default\b/.test(content) || /{default}/.test(content);
      } catch {
        // intentional no-op
      }

      const entryExtension = `${name ?? 'index'}${extension}`;
      const entryContents = [
        `export * from ${JSON.stringify(pathToBuiltEntry)};`,
        hasDefault
          ? `export {default} from ${JSON.stringify(pathToBuiltEntry)};`
          : false,
      ]
        .filter(Boolean)
        .join('\n');

      await project.fs.write(entryExtension, entryContents);
    }),
  );
}
