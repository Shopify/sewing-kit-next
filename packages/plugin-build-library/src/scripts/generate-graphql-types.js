const {resolve: resolvePath} = require('path');

const {Builder, EnumFormat} = require('graphql-typescript-definitions');

(async () => {
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
})();
