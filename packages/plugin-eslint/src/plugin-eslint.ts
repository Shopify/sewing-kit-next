import {
  toArgs,
  addHooks,
  WaterfallHook,
  createWorkspaceLintPlugin,
  DiagnosticError,
  LogLevel,
} from '@shopify/loom';

export interface ESLintFlags {
  readonly eslintrc?: false;
  readonly config?: string;
  readonly env?: string[];
  readonly ext?: string[];
  readonly global?: string[];
  readonly parser?: string;
  readonly parserOptions?: {[key: string]: unknown};
  readonly resolvePluginsRelativeTo?: string;
  readonly rulesdir?: string;
  readonly plugin?: string[];
  readonly rule?: {[key: string]: unknown};
  readonly fix?: boolean;
  readonly fixDryRun?: boolean;
  readonly fixType?: ('problem' | 'suggestion' | 'layout')[];
  readonly ignorePath?: string;
  readonly ignore?: false;
  readonly ignorePattern?: string[];
  readonly quite?: boolean;
  readonly maxWarnings?: number;
  readonly outputFile?: string;
  readonly format?: string;
  readonly color?: boolean;
  readonly cache?: boolean;
  readonly cacheFile?: string;
  readonly cacheLocation?: string;
  readonly noErrorOnUnmatchedPattern?: boolean;
  readonly debug?: true;
  [key: string]: unknown;
}

interface ESLintHooks {
  readonly eslintFlags: WaterfallHook<ESLintFlags>;
}

declare module '@shopify/loom' {
  interface LintWorkspaceConfigurationCustomHooks extends ESLintHooks {}
}

const PLUGIN = 'Loom.ESLint';

export function eslint({files = '.'} = {}) {
  return createWorkspaceLintPlugin(PLUGIN, ({hooks, options, api}) => {
    hooks.configureHooks.hook(
      addHooks<ESLintHooks>(() => ({
        eslintFlags: new WaterfallHook(),
      })),
    );

    hooks.steps.hook((steps, {configuration}) => [
      ...steps,
      api.createStep({id: 'ESLint.Lint', label: 'run eslint'}, async (step) => {
        const {fix = false, allowEmpty = false} = options;
        const args = toArgs(
          await configuration.eslintFlags!.run({
            fix,
            maxWarnings: 0,
            format: 'codeframe',
            cache: true,
            cacheLocation: api.cachePath('eslint/'),
            noErrorOnUnmatchedPattern: allowEmpty,
          }),
          {dasherize: true},
        );

        try {
          await step.exec('node_modules/.bin/eslint', [files, ...args], {
            all: true,
            env: {FORCE_COLOR: '1'},
          });
        } catch (error) {
          if (/No files matching the pattern .* were found/.test(error.all)) {
            step.log(`ESLint failed with error output:\n${error.all}`, {
              level: LogLevel.Debug,
            });

            throw new DiagnosticError({
              title: 'ESLint failed because no files were found to lint',
              suggestion: (fmt) =>
                fmt`Add at least one file to lint, or add overrides to your ESLint config to teach it about additional file types. Alternatively, you can remove the eslint plugin, or pass the {code --allow-empty} flag to the {code loom lint} command.`,
            });
          }

          throw new DiagnosticError({
            title: 'ESLint found lint errors.',
            content: error.all,
          });
        }
      }),
    ]);
  });
}
