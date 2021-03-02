import {dirname, basename, resolve} from 'path';
import {sync as glob} from 'glob';
import {pathExists} from 'fs-extra';

import {
  Package,
  WebApp,
  Service,
  Workspace,
  Project,
  DiagnosticError,
} from '@sewing-kit/core';
import {ProjectPlugin, AnyPlugin} from '@sewing-kit/plugins';

import {
  ConfigurationBuilderResult,
  BUILDER_RESULT_MARKER,
  ConfigurationKind,
} from './base';
import {PluginSource} from './plugins';

export {ConfigurationKind, ConfigurationBuilderResult};

const DIRECTORIES_NOT_TO_USE_FOR_NAME = new Set([
  'src',
  'lib',
  'server',
  'app',
  'client',
  'ui',
]);

const IS_TSX = /.tsx?$/;
const IS_MJS = /.mjs$/;

const IGNORE_FOLDERS = ['node_modules', '.sewing-kit'];

export interface LoadedWorkspace {
  readonly workspace: Workspace;
  readonly plugins: PluginSource;
}

interface LoadContext {
  readonly parents: WeakMap<AnyPlugin, AnyPlugin>;
}

type LoadedConfigFile<
  T extends {name: string; root: string}
> = ConfigurationBuilderResult<T> & {readonly file: string};

export async function loadWorkspace(root: string): Promise<LoadedWorkspace> {
  const packages = new Set<Package>();
  const webApps = new Set<WebApp>();
  const services = new Set<Service>();
  const pluginMap = new WeakMap<Project, readonly ProjectPlugin<Project>[]>();
  const pluginParents = new WeakMap<AnyPlugin, AnyPlugin>();

  const configFiles = glob('**/sewing-{kit,kit-next}.config.*', {
    cwd: root as string,
    ignore: ['**/node_modules/**', `${root}/**/build/**`],
    absolute: true,
  });

  const loadContext: LoadContext = {parents: pluginParents};
  const loadedConfigs = (
    await Promise.all(
      configFiles.map((config) => loadConfig(config, loadContext)),
    )
  ).filter((config) => Boolean(config)) as LoadedConfigFile<{
    name: string;
    root: string;
  }>[];

  const workspaceConfigs = loadedConfigs.filter(
    (config) =>
      config.workspacePlugins.length > 0 ||
      config.kind === ConfigurationKind.Workspace,
  );

  if (workspaceConfigs.length > 1) {
    // needs a better error, showing files/ what workspace plugins exist
    throw new DiagnosticError({
      title: `Multiple workspace configurations found`,
      content: `Found ${workspaceConfigs.length} workspace configurations. Only one sewing-kit config can declare workspace plugins and/ or use the createWorkspace() utility from @sewing-kit/config`,
    });
  }

  const [workspaceConfig] = workspaceConfigs;

  if (
    workspaceConfig?.workspacePlugins.length > 0 &&
    workspaceConfig.kind !== ConfigurationKind.Workspace &&
    loadedConfigs.length > 1
  ) {
    // needs a better error, showing which project
    throw new DiagnosticError({
      title: `Invalid workspace plugins in project configuration`,
      content: `You declared workspace plugins in a project, but this is only supported for workspace with a single project.`,
      suggestion: `Move the workspace plugins to a root sewing-kit config file, and include them using the createWorkspace() function from @sewing-kit/config`,
    });
  }

  for (const {kind, options, projectPlugins} of loadedConfigs) {
    switch (kind) {
      case ConfigurationKind.Package: {
        const pkg = new Package({
          entries: [{root: './src/index', runtime: (options as any).runtime}],
          ...options,
        } as any);
        packages.add(pkg);
        pluginMap.set(pkg, projectPlugins);
        break;
      }
      case ConfigurationKind.WebApp: {
        const webApp = new WebApp({entry: './index', ...options} as any);
        webApps.add(webApp);
        pluginMap.set(webApp, projectPlugins);
        break;
      }
      case ConfigurationKind.Service: {
        const service = new Service({entry: './index', ...options} as any);
        services.add(service);
        pluginMap.set(service, projectPlugins);
        break;
      }
    }
  }

  const workspace = new Workspace({
    root: root as string,
    name: basename(root as string),
    ...(workspaceConfig?.options ?? {}),
    webApps: [...webApps],
    packages: [...packages],
    services: [...services],
  });

  const workspacePlugins = workspaceConfig?.workspacePlugins ?? [];

  const plugins: PluginSource = {
    pluginsForWorkspace(forWorkspace) {
      return forWorkspace === workspace ? workspacePlugins : [];
    },
    pluginsForProject(project) {
      return pluginMap.get(project) ?? [];
    },
    ancestorsForPlugin: ancestorsForPlugin as any,
  };

  return {workspace, plugins};

  function ancestorsForPlugin(plugin: AnyPlugin): readonly AnyPlugin[] {
    const parent = pluginParents.get(plugin);
    return parent ? [parent, ...ancestorsForPlugin(parent)] : [];
  }
}

async function loadConfig<
  T extends {name: string; root: string} = {name: string; root: string}
>(file: string, context: LoadContext) {
  if (!(await pathExists(file))) {
    throw new DiagnosticError({
      title: `No config file found at ${file}`,
      suggestion:
        'Make sure you have specified the --config flag to point at a valid workspace config file.',
    });
  }

  loadInlineTranspiler(file);
  return loadConfigFile<T>(file, context);
}

async function loadConfigFile<T extends {name: string; root: string}>(
  file: string,
  context: LoadContext,
): Promise<LoadedConfigFile<T> | null> {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const exports = require(file);
  const normalized = exports?.default ?? exports;

  if (normalized == null) {
    throw new DiagnosticError({
      title: 'Invalid configuration file',
      content: `The configuration file ${file} did not export any configuration`,
      suggestion: file.endsWith('.ts')
        ? `Ensure that you are exporting the result of calling a function from @sewing-kit/config as the default export, then run your command again.`
        : `Ensure that you are setting the result of calling a function from @sewing-kit/config to module.exports, then run your command again.`,
    });
  } else if (typeof normalized !== 'function') {
    throw new DiagnosticError({
      title: 'Invalid configuration file',
      content: `The configuration file ${file} did not export a function`,
      suggestion: `Ensure that you are exporting the result of calling a function from @sewing-kit/config, then run your command again.`,
    });
  }

  let result;
  try {
    result = await normalized();
  } catch {
    // we hit a legacy sewing-kit config
    return null;
  }

  if (!looksLikeValidConfigurationObject(result)) {
    throw new DiagnosticError({
      title: 'Invalid configuration file',
      content: `The configuration file ${file} did not export a function that creates a configuration object`,
      suggestion: `Ensure that you are exporting the result of calling a function from @sewing-kit/config, then run your command again.`,
    });
  }

  const configDir = dirname(file);
  const configDirName = basename(configDir);
  const name = DIRECTORIES_NOT_TO_USE_FOR_NAME.has(configDirName)
    ? basename(dirname(configDir))
    : configDirName;

  const [workspacePlugins, projectPlugins] = await Promise.all([
    (
      await Promise.all(
        result.workspacePlugins.map((plugin) => expandPlugin(plugin, context)),
      )
    ).flat(1),
    (
      await Promise.all(
        result.projectPlugins.map((plugin) => expandPlugin(plugin, context)),
      )
    ).flat(1),
  ] as const);

  return {
    ...result,
    file,
    workspacePlugins,
    projectPlugins,
    options: {root: configDir, name, ...(result.options as any)},
  };
}

function looksLikeValidConfigurationObject(
  value: unknown,
): value is ConfigurationBuilderResult {
  return (
    typeof value === 'object' && value != null && BUILDER_RESULT_MARKER in value
  );
}

async function expandPlugin<Plugin extends AnyPlugin>(
  plugin: Plugin,
  context: LoadContext,
): Promise<Plugin[]> {
  if (plugin.compose == null) {
    return [plugin];
  }

  const children = new Set<typeof plugin>();

  await plugin.compose({
    use(...plugins: any[]) {
      for (const child of plugins) {
        if (!child) continue;

        children.add(child);
        context.parents.set(child, plugin);
      }
    },
  });

  const expandedChildren = await Promise.all(
    [...children].map((plugin) => expandPlugin(plugin, context)),
  );

  return [plugin, ...expandedChildren.flat()];
}

function loadInlineTranspiler(file: string) {
  if (IS_TSX.test(file)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@babel/register')({
      extensions: ['.mjs', '.js', '.ts', '.tsx'],
      ignore: [ignoreFromCompilation],
      presets: [
        require.resolve('@babel/preset-typescript'),
        [require.resolve('@babel/preset-env'), {targets: {node: true}}],
      ],
    });
  }

  if (IS_MJS.test(file)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('@babel/register')({
      extensions: ['.mjs', '.js'],
      ignore: [ignoreFromCompilation],
      presets: [
        [require.resolve('@babel/preset-env'), {targets: {node: true}}],
      ],
    });
  }

  function ignoreFromCompilation(filePath: string) {
    return IGNORE_FOLDERS.some((folder) => filePath.includes(resolve(folder)));
  }
}
