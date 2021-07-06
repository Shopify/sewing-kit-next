import {
  toArgs,
  addHooks,
  WaterfallHook,
  createWorkspaceLintPlugin,
  DiagnosticError,
  LogLevel,
} from '@sewing-kit/core';

interface PrettierFlags {
  check?: boolean;
  write?: boolean;
  ignoreUnknown?: boolean;
  noErrorOnUnmatchedPattern?: boolean;
  [key: string]: unknown;
}

interface PrettierHooks {
  readonly prettierFlags: WaterfallHook<PrettierFlags>;
}

declare module '@sewing-kit/core' {
  interface LintWorkspaceConfigurationCustomHooks extends PrettierHooks {}
}

const PLUGIN = 'SewingKit.Prettier';

export function prettier({files = '.'} = {}) {
  return createWorkspaceLintPlugin(PLUGIN, ({hooks, options, api}) => {
    hooks.configureHooks.hook(
      addHooks<PrettierHooks>(() => ({
        prettierFlags: new WaterfallHook(),
      })),
    );

    hooks.steps.hook((steps, {configuration}) => [
      ...steps,
      api.createStep(
        {id: 'Prettier.Lint', label: 'run prettier'},
        async (step) => {
          const {fix = false, allowEmpty = false} = options;
          const args = toArgs(
            await configuration.prettierFlags!.run({
              check: !fix,
              write: fix,
              ignoreUnknown: fix,
              noErrorOnUnmatchedPattern: allowEmpty,
            }),
            {dasherize: true},
          );

          try {
            await step.exec('node_modules/.bin/prettier', [files, ...args], {
              all: true,
              env: {FORCE_COLOR: '1'},
            });
          } catch (error) {
            if (/No files matching the pattern were found:/.test(error.all)) {
              step.log(`Prettier failed with error output:\n${error.all}`, {
                level: LogLevel.Debug,
              });

              throw new DiagnosticError({
                title: 'Prettier failed because no files were found to lint',
                suggestion: (fmt) =>
                  fmt`Add at least one file to lint. Alternatively, you can remove the prettier plugin, or pass the {code --allow-empty} flag to the {code sewing-kit lint} command.`,
              });
            }

            throw new DiagnosticError({
              title: 'Prettier found unformatted files.',
              content: error.all,
            });
          }
        },
      ),
    ]);
  });
}
