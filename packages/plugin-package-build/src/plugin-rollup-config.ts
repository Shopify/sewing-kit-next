import {resolve, relative} from 'path';

import {
  createProjectBuildPlugin,
  Package,
  Runtime,
  DiagnosticError,
} from '@sewing-kit/core';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import externals from 'rollup-plugin-node-externals';

import type {} from '@sewing-kit/plugin-babel';

declare module '@sewing-kit/core' {
  interface BuildPackageTargetOptions {
    rollupEsnext?: boolean;
  }
}

interface RollupConfigOptions {
  browserTargets: string;
  nodeTargets: string;
  commonjs: boolean;
  esmodules: boolean;
  esnext: boolean;
}

export function rollupConfig(options: RollupConfigOptions) {
  return createProjectBuildPlugin<Package>(
    'SewingKit.PackageFlexibleOutputs.RollupConfig',
    ({api, hooks, project}) => {
      // Define additional build variant to build esnext output
      hooks.targets.hook((targets) => {
        return targets.map((target) => {
          return options.esnext && target.default
            ? target.add({rollupEsnext: true})
            : target;
        });
      });

      // Define config for build variants
      hooks.target.hook(async ({target, hooks}) => {
        const isDefaultBuild = Object.keys(target.options).length === 0;
        const isEsnextBuild = Boolean(target.options.rollupEsnext);
        if (!(isDefaultBuild || isEsnextBuild)) {
          return;
        }

        hooks.configure.hook(async (configuration) => {
          configuration.rollupInput?.hook((input) => {
            const inputEntries = [
              ...target.project.entries,
              ...target.project.binaries,
            ].map(({root}) => require.resolve(root, {paths: [project.root]}));

            if (inputEntries.length === 0) {
              throw new DiagnosticError({
                title: `No inputs found for "${project.name}".`,
                suggestion: `Set a pkg.entry() in your sewing-kit.config. Use 'pkg.entry({root: './src/index'})" to use the index file`,
              });
            }

            return input.concat(inputEntries);
          });

          configuration.rollupPlugins?.hook(async (plugins) => {
            const babelConfig = await configuration.babelConfig?.run({});

            const babelTargets: string[] = [];

            if (isDefaultBuild) {
              if (target.runtime.includes(Runtime.Browser)) {
                babelTargets.push(options.browserTargets);
              }
              if (target.runtime.includes(Runtime.Node)) {
                babelTargets.push(options.nodeTargets);
              }
            } else if (isEsnextBuild) {
              babelTargets.push('last 1 chrome versions');
            }

            if (babelTargets.length === 0) {
              throw new DiagnosticError({
                title: `No targets found for "${project.name}".`,
                suggestion: `Set a pkg.runtime() in your sewing-kit.config. Use "pkg.runtime(Runtime.Node)" for a node-only package. Use "pkg.runtime(Runtime.Node, Runtime.Browser)" for an isomorphic package that can be ran in node and the browser`,
              });
            }

            const packagePath = (await project.fs.hasFile('./package.json'))
              ? project.fs.resolvePath('./package.json')
              : [];

            return plugins.concat([
              externals({
                deps: true,
                packagePath,
              }),
              nodeResolve({
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
              }),
              commonjs(),
              babel({
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                envName: 'production',
                exclude: 'node_modules/**',
                babelHelpers: 'bundled',
                // @ts-expect-error targets is a valid babel option but @types/babel__core doesn't know that yet
                targets: babelTargets,
                ...babelConfig,
              }),
            ]);
          });

          configuration.rollupOutputs?.hook((outputs) => {
            const additionalOutputs: typeof outputs = [];

            if (isDefaultBuild) {
              if (options.commonjs) {
                additionalOutputs.push({
                  format: 'cjs',
                  dir: project.fs.buildPath('cjs'),
                  preserveModules: true,
                  entryFileNames: '[name][assetExtname].js',
                  exports: 'named',
                });
              }

              if (options.esmodules) {
                additionalOutputs.push({
                  format: 'esm',
                  dir: project.fs.buildPath('esm'),
                  preserveModules: true,
                  entryFileNames: '[name][assetExtname].mjs',
                });
              }
            } else if (isEsnextBuild) {
              if (options.esmodules) {
                additionalOutputs.push({
                  format: 'esm',
                  dir: project.fs.buildPath('esnext'),
                  preserveModules: true,
                  entryFileNames: '[name][assetExtname].esnext',
                });
              }
            }

            return outputs.concat(additionalOutputs);
          });
        });

        // Create entries
        hooks.steps.hook((steps) => [
          ...steps,
          api.createStep(
            {id: 'Rollup.Entries', label: 'Adding entries for Rollup outputs'},
            async () => {
              const entryConfigs = [];

              if (isDefaultBuild) {
                if (options.commonjs) {
                  entryConfigs.push({
                    exportStyle: ExportStyle.CommonJs,
                    outputPath: project.fs.buildPath('cjs'),
                    extension: '.js',
                  });
                }

                if (options.esmodules) {
                  entryConfigs.push({
                    exportStyle: ExportStyle.EsModules,
                    outputPath: project.fs.buildPath('esm'),
                    extension: '.mjs',
                  });
                }
              } else if (isEsnextBuild) {
                if (options.esnext) {
                  entryConfigs.push({
                    exportStyle: ExportStyle.EsModules,
                    outputPath: project.fs.buildPath('esnext'),
                    extension: '.esnext',
                  });
                }
              }

              await Promise.all(
                entryConfigs.map((config) =>
                  writeEntries({project, ...config}),
                ),
              );
            },
          ),
        ]);
      });
    },
  );
}

enum ExportStyle {
  EsModules,
  CommonJs,
}

async function writeEntries({
  project,
  extension,
  outputPath,
  exportStyle,
}: {
  project: Package;
  extension: string;
  outputPath: string;
  exportStyle: ExportStyle;
}) {
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

      if (exportStyle === ExportStyle.CommonJs) {
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
