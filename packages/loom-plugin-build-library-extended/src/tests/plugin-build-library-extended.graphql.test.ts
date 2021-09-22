import {resolve} from 'path';

import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../../tests/utilities';

const configContent = (graphql = false) => {
  return `
import {createPackage, Runtime} from '@shopify/loom';
import {
  buildLibrary,
  buildLibraryWorkspace,
} from '@shopify/loom-plugin-build-library';
import {
  buildLibraryExtended,
  buildLibraryExtendedWorkspace,
} from '@shopify/loom-plugin-build-library-extended';
export default createPackage((pkg) => {
  pkg.use(
    buildLibrary({
      targets: 'defaults, node 12',
      commonjs: true,
      esmodules: true,
      esnext: true,
    }),
    buildLibraryExtended({graphql: ${graphql}}),
    ${graphql ? 'buildLibraryWorkspace(),' : ''}
    ${graphql ? `buildLibraryExtendedWorkspace({graphql: 'true'}),` : ''}
  );
});
`;
};

describe('@shopify/loom-plugin-build-library-extended graphql generation', () => {
  it('does not generate', async () => {
    await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
      await workspace.writeConfig(configContent());

      await workspace.writeFilesFromFixtureDirectory(
        resolve(__dirname, './fixtures/graphql'),
      );

      console.log(await workspace.run('build'));
      workspace.debug();
      expect(await workspace.contains('./firstQuery.graphql.d.ts')).toBeFalsy();
      expect(
        await workspace.contains('./destinationFieldsFragment.graphql.d.ts'),
      ).toBeFalsy();
      expect(
        await workspace.contains('./organizationFieldsFragment.graphql.d.ts'),
      ).toBeFalsy();
    });
  });
});
