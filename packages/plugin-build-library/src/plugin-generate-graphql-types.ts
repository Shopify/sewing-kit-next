import {
  createWorkspacePlugin,
  DiagnosticError,
  WorkspacePluginContext,
} from '@sewing-kit/core';
import type {PluginApi} from '@sewing-kit/core';
import {Builder, EnumFormat} from 'graphql-typescript-definitions';

export function generateGraphqlTypes() {
  return createWorkspacePlugin(
    'Loom.BuildLibraryWorkspace.GenerateGraphqlTypes',
    (context) => {
      const {
        tasks: {build, typeCheck},
      } = context;

      build.hook(({hooks}) => {
        hooks.pre.hook((steps) => {
          return [...steps, createRunGraphqlTypeDefinitionsStep(context)];
        });
      });

      typeCheck.hook(({hooks}) => {
        hooks.pre.hook((steps) => {
          return [...steps, createRunGraphqlTypeDefinitionsStep(context)];
        });
      });
    },
  );
}

export function createRunGraphqlTypeDefinitionsStep(
  context: WorkspacePluginContext,
) {
  return context.api.createStep(
    {
      id: 'BuildLibraryWorkspace.GenerateGraphqlTypes',
      label: 'generating GraphQL type definitions',
    },
    async () => {
      try {
        await generateGraphqlTypeDefinitions(context.api);
      } catch (error) {
        throw new DiagnosticError({
          title: 'Could not generate GraphQL type definitions',
          content: error.all,
        });
      }
    },
  );
}

async function generateGraphqlTypeDefinitions(api: PluginApi) {
  const builder = new Builder({
    cwd: api.resolvePath('..'),
    schemaTypesPath: api.resolvePath('../src/types/graphql'),
    enumFormat: EnumFormat.PascalCase,
    addTypename: true,
  });
  builder.on('end:docs', () => {
    console.log('Built GraphQL type definitions');
  });

  builder.on('end:schema', () => {
    console.log('Built GraphQL schema types');
  });

  builder.on('error', (error) => {
    console.log(`Build Error: ${error.message}`);
  });

  builder.on('build:docs', ({definitionPath}) => {
    console.log(`Built GraphQL type definition: ${definitionPath}`);
  });

  builder.on('build:schema', ({schemaTypesPath}) => {
    console.log(`Built GraphQL schema types: ${schemaTypesPath}`);
  });
  await builder.run();
}
