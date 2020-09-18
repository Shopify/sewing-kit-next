import {
  withWorkspace,
  generateUniqueWorkspaceID,
} from '../../../tests/utilities';
import {
  ExportStyle,
  fileContentsHash,
  generateBabelPackageCacheValue,
} from '../src/utilities';
import {getModifiedTime, writeToSrc, createTestPackage} from './utilities';

describe('utilities', () => {
  describe('fileContentsHash()', () => {
    it('uses the same hash for the same file name', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const fileExtensions = ['.js'];
        await writeToSrc(workspace, 'index.js');
        const beforeHash = await fileContentsHash(testPackage, fileExtensions);

        await workspace.removeFile('src/index.js');
        await writeToSrc(workspace, 'index.js');
        const afterHash = await fileContentsHash(testPackage, fileExtensions);

        expect(beforeHash).toBe(afterHash);
      });
    });

    it('uses the different hash if the file name changes', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const fileExtensions = ['.js'];
        await writeToSrc(workspace, 'index.js');
        const beforeHash = await fileContentsHash(testPackage, fileExtensions);

        await workspace.removeFile('src/index.js');
        await writeToSrc(workspace, 'index-two.js');

        const afterHash = await fileContentsHash(testPackage, fileExtensions);

        expect(beforeHash).not.toBe(afterHash);
      });
    });

    it('uses a different hash if the file contents change', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const fileExtensions = ['.js'];
        await writeToSrc(workspace, 'index.js');
        const beforeHash = await fileContentsHash(testPackage, fileExtensions);

        await writeToSrc(workspace, 'index.js', 'console.log("changed")');

        const afterHash = await fileContentsHash(testPackage, fileExtensions);

        expect(beforeHash).not.toBe(afterHash);
      });
    });

    it('uses a different hash if a new file is added', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const fileExtensions = ['.js'];
        await writeToSrc(workspace, 'index.js');
        const beforeHash = await fileContentsHash(testPackage, fileExtensions);

        await writeToSrc(workspace, 'index-new.js');

        const afterHash = await fileContentsHash(testPackage, fileExtensions);

        expect(beforeHash).not.toBe(afterHash);
      });
    });

    it('uses a different hash if a file is removed', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const fileExtensions = ['.js'];
        await writeToSrc(workspace, 'index.js');
        await writeToSrc(workspace, 'file-to-remove.js');
        const beforeHash = await fileContentsHash(testPackage, fileExtensions);

        await workspace.removeFile('src/file-to-remove.js');

        const afterHash = await fileContentsHash(testPackage, fileExtensions);

        expect(beforeHash).not.toBe(afterHash);
      });
    });

    it('excludes .ts file extensions when it is not included in fileExtensions', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const fileExtensions = ['.js'];

        await writeToSrc(workspace, 'index.js');
        const beforeHash = await fileContentsHash(testPackage, fileExtensions);

        await writeToSrc(workspace, 'typescript-file.ts');
        const afterHash = await fileContentsHash(testPackage, fileExtensions);

        expect(beforeHash).toStrictEqual(afterHash);
      });
    });
  });

  describe('generateBabelPackageCacheValue()', () => {
    const options = {
      babelConfig: {
        presets: ['@babel/some-preset', '@babel/some-other-preset'],
        plugins: ['@babel/some-plugin', '@babel/some-other-plugin'],
      },
      outputPath: 'build/esm',
      extension: '.mjs',
      exportStyle: ExportStyle.EsModules,
      babelCacheDependencies: [
        '@babel/some-plugin',
        '@babel/some-other-plugin',
      ],
      babelIgnorePatterns: ['.json', '.graphql'],
      babelExtensions: ['.js', '.mjs', '.ts'],
    };

    it('generates the same hash for unchanged options/dependencies/modified time', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);

        expect(
          generateBabelPackageCacheValue(testPackage, options),
        ).toStrictEqual(generateBabelPackageCacheValue(testPackage, options));
      });
    });

    it('generates a different hash if the Babel config changes', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const newOptions = {
          ...options,
          babelConfig: {
            ...options.babelConfig,
            plugins: [...options.babelConfig.plugins, '@babel/some-new-plugin'],
          },
        };

        expect(
          await generateBabelPackageCacheValue(testPackage, options),
        ).not.toStrictEqual(
          await generateBabelPackageCacheValue(testPackage, newOptions),
        );
      });
    });

    it('generates a different hash if the output path changes', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const newOptions = {
          ...options,
          outputPath: 'build/meme',
        };

        expect(
          await generateBabelPackageCacheValue(testPackage, options),
        ).not.toStrictEqual(
          await generateBabelPackageCacheValue(testPackage, newOptions),
        );
      });
    });

    it('generates a different hash if the extension changes', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const newOptions = {
          ...options,
          extension: '.meme',
        };

        expect(
          await generateBabelPackageCacheValue(testPackage, options),
        ).not.toStrictEqual(
          await generateBabelPackageCacheValue(testPackage, newOptions),
        );
      });
    });

    it('generates a different hash if the export style changes', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const newOptions = {
          ...options,
          exportStyle: ExportStyle.CommonJs,
        };

        expect(
          await generateBabelPackageCacheValue(testPackage, options),
        ).not.toStrictEqual(
          await generateBabelPackageCacheValue(testPackage, newOptions),
        );
      });
    });

    it('generates a different hash if the cache dependencies change', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const newOptions = {
          ...options,
          babelCacheDependencies: [
            ...options.babelCacheDependencies,
            '@babel/some-new-cache-dep',
          ],
        };

        expect(
          await generateBabelPackageCacheValue(testPackage, options),
        ).not.toStrictEqual(
          await generateBabelPackageCacheValue(testPackage, newOptions),
        );
      });
    });

    it('generates a different hash if the ignore patterns change', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const newOptions = {
          ...options,
          babelIgnorePatterns: [...options.babelIgnorePatterns, '.py'],
        };

        expect(
          await generateBabelPackageCacheValue(testPackage, options),
        ).not.toStrictEqual(
          await generateBabelPackageCacheValue(testPackage, newOptions),
        );
      });
    });

    it('generates a different hash if the extensions change', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);
        const newOptions = {
          ...options,
          babelExtensions: [...options.babelExtensions, '.esnext'],
        };

        expect(
          await generateBabelPackageCacheValue(testPackage, options),
        ).not.toStrictEqual(
          await generateBabelPackageCacheValue(testPackage, newOptions),
        );
      });
    });

    it('generates a different hash if a new files are added', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);

        await writeToSrc(workspace, 'file.js');

        const oldHash = await generateBabelPackageCacheValue(
          testPackage,
          options,
        );

        await writeToSrc(workspace, 'file2.js');

        const newHash = await generateBabelPackageCacheValue(
          testPackage,
          options,
        );

        expect(oldHash).not.toStrictEqual(newHash);
      });
    });

    it('generates the same hash if only a excluded file changes', async () => {
      await withWorkspace(generateUniqueWorkspaceID(), async (workspace) => {
        const testPackage = createTestPackage(workspace);

        await writeToSrc(workspace, 'file.esnext');

        const oldHash = await generateBabelPackageCacheValue(
          testPackage,
          options,
        );

        await writeToSrc(workspace, 'file.esnext');

        const newHash = await generateBabelPackageCacheValue(
          testPackage,
          options,
        );

        expect(oldHash).toStrictEqual(newHash);
      });
    });
  });
});
