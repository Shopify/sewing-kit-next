import {
  toArgs,
  addHooks,
  WaterfallHook,
  createWorkspaceLintPlugin,
  DiagnosticError,
  LogLevel,
} from '@sewing-kit/core';

export interface StylelintFlags {
  readonly fix?: boolean;
  readonly cache?: boolean;
  readonly cacheLocation?: string;
  readonly maxWarnings?: number;
  readonly allowEmptyInput?: boolean;
  readonly reportNeedlessDisables?: boolean;
  readonly reportInvalidScopeDisables?: boolean;
  [key: string]: unknown;
}

interface StylelintHooks {
  readonly stylelintFlags: WaterfallHook<StylelintFlags>;
}

declare module '@sewing-kit/core' {
  interface LintWorkspaceConfigurationCustomHooks extends StylelintHooks {}
}

const PLUGIN = 'Loom.Stylelint';

export function stylelint({files = '**/*.css'} = {}) {
  return createWorkspaceLintPlugin(PLUGIN, ({hooks, options, api}) => {
    hooks.configureHooks.hook(
      addHooks<StylelintHooks>(() => ({
        stylelintFlags: new WaterfallHook(),
      })),
    );

    hooks.steps.hook((steps, {configuration}) => [
      ...steps,
      api.createStep(
        {id: 'Stylelint.Lint', label: 'run stylelint'},
        async (step) => {
          const {fix = false, allowEmpty = false} = options;
          const args = toArgs(
            await configuration.stylelintFlags!.run({
              fix,
              maxWarnings: 0,
              cache: true,
              cacheLocation: api.cachePath('stylelint/'),
              allowEmptyInput: allowEmpty,
            }),
            {dasherize: true},
          );

          try {
            await step.exec('node_modules/.bin/stylelint', [files, ...args], {
              all: true,
              env: {FORCE_COLOR: '1'},
            });
          } catch (error) {
            if (/No files matching the pattern .* were found/.test(error.all)) {
              step.log(`stylelint failed with error output:\n${error.all}`, {
                level: LogLevel.Debug,
              });

              throw new DiagnosticError({
                title: 'stylelint failed because no files were found to lint',
                suggestion: (fmt) =>
                  fmt`Add at least one file to lint. Alternatively, you can remove the stylelint plugin, or pass the {code --allow-empty} flag to the {code loom lint} command.`,
              });
            }

            throw new DiagnosticError({
              title: 'stylelint found lint errors.',
              content: error.all,
            });
          }
        },
      ),
    ]);
  });
}
