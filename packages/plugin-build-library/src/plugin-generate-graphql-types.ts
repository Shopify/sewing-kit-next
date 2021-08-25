import {resolve as resolvePath} from 'path';

import {createWorkspacePlugin, DiagnosticError} from '@sewing-kit/core';
import {Builder, EnumFormat} from 'graphql-typescript-definitions';

export function pluginGraphqlGraphqlTypes() {
  return createWorkspacePlugin(
    'Sewing-kit.Library.Workspace.GenerateGraphqlTypes',
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
              async () => {
                try {
                  await generateGraphqlTypeDefinitions();
                } catch (error) {
                  throw new DiagnosticError({
                    title: 'Could not generate graphql type definitions',
                    content: error.all,
                  });
                }
              },
            ),
          ];
        });
      });
    },
  );
}

async function generateGraphqlTypeDefinitions() {
  const builder = new Builder({
    cwd: resolvePath(__dirname, '..'),
    schemaTypesPath: resolvePath(__dirname, '../src/types/graphql'),
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
