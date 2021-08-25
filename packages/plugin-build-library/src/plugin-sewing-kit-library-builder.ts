import {
  createComposedWorkspacePlugin,
  createComposedProjectPlugin,
  createProjectPlugin,
  createWorkspacePlugin,
  DiagnosticError,
} from '@sewing-kit/core';
import {babel} from '@sewing-kit/plugin-babel';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';
import {eslint} from '@sewing-kit/plugin-eslint';
import {stylelint} from '@sewing-kit/plugin-stylelint';
import {prettier} from '@sewing-kit/plugin-prettier';
import {jest} from '@sewing-kit/plugin-jest';
import {packageBuild} from '@sewing-kit/plugin-package-build';

import {packageBuildEnhanced} from './rollup/plugin-package-build-enhanced';

export function libaryPackagePlugin() {
  return createComposedProjectPlugin('Sewing-kit.Library.Package.Plugin', [
    // this needs to be set here as the current setup cannot
    // find the babel.config.js file at the root of the project
    babel({
      config: {
        presets: [['@shopify/babel-preset', {typescript: true, react: true}]],
        plugins: ['@shopify/react-i18n/babel'],
        configFile: false,
      },
    }),
    createProjectPlugin(
      'Sewing-kit.Library.Package.Test',
      ({tasks: {test}}) => {
        test.hook(({hooks}) => {
          hooks.configure.hook((configuration) => {
            configuration.jestEnvironment?.hook(() => 'jsdom');
            configuration.jestTransforms?.hook((transforms) => ({
              ...transforms,
              '\\.graphql': require.resolve('graphql-mini-transforms/jest'),
              '\\.svg': '<rootDir>/config/jest/transform-svg.js',
              '\\.s?css$': '<rootDir>/config/jest/transform-style.js',
            }));
          });
        });
      },
    ),
    packageBuild({
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Browser`
      browserTargets: 'extends @shopify/browserslist-config, ios >= 12',
      // Required. A browserslist string that shall be targeted when your runtime includes `Runtime.Node`
      nodeTargets: 'node 12.13',
    }),
    packageBuildEnhanced(),
  ]);
}

export function libaryWorkspacePlugin() {
  return createComposedWorkspacePlugin('Sewing-kit.Library.Workspace.Plugin', [
    jest(),
    eslint(),
    stylelint({files: '**/*.scss'}),
    prettier({files: '**/*.{md,json,yaml,yml}'}),
    createWorkspacePlugin(
      'Sewing-kit.Library.Workspace.PreBuildTasks',
      ({api, tasks: {build}}) => {
        build.hook(({hooks}) => {
          hooks.pre.hook((steps) => {
            return [
              ...steps,
              api.createStep(
                {
                  id: 'Sewing-kit.Library.Workspace.PreBuild.TypeGeneration',
                  label: 'generating graphql type definitions',
                },
                async (step) => {
                  try {
                    await step.exec('./config/generate-graphql-types.js', [], {
                      all: true,
                      env: {FORCE_COLOR: '1'},
                    });
                  } catch (error) {
                    throw new DiagnosticError({
                      title: 'Could not generate graphql type definitions',
                      content: error.all,
                    });
                  }
                },
              ),
              api.createStep(
                {
                  id: 'Sewing-kit.Library.Workspace.PreBuild.SVGOptimization',
                  label: 'optimizing SVGs',
                },
                async (step) => {
                  try {
                    await step.exec('./config/process-svgs.js', [], {
                      all: true,
                      env: {FORCE_COLOR: '1'},
                    });
                  } catch (error) {
                    console.log('error', error);
                    throw new DiagnosticError({
                      title: 'Could not optimize SVGs',
                      content: error.all,
                    });
                  }
                },
              ),
            ];
          });
          hooks.post.hook((steps) => {
            return [
              ...steps,
              api.createStep(
                {
                  id: 'Sewing-kit.Library.Workspace.PostBuild.CopyTranslations',
                  label: 'Copying Translations',
                },
                async (step) => {
                  try {
                    await step.exec('./config/copy-translations.js', [], {
                      all: true,
                      env: {FORCE_COLOR: '1'},
                    });
                  } catch (error) {
                    throw new DiagnosticError({
                      title: 'Could not copy i18n translation files',
                      content: error.all,
                    });
                  }
                },
              ),
            ];
          });
        });
      },
    ),
    workspaceTypeScript(),
  ]);
}
