import {join} from 'path';
import {remove} from 'fs-extra';
import {FileSystem} from '../fs';

const root = join(__dirname, 'fixtures', 'fs');
const rm = async (file: string) => remove(join(root, file));

describe('FileSystem', () => {
  const fileSystem = new FileSystem(root);

  describe('root', () => {
    it('is provided path', () => {
      expect(fileSystem.root).toBe(root);
    });
  });

  describe('read', () => {
    it('reads file', async () => {
      const contents = await fileSystem.read('file.json');

      expect(contents).toBe(`{ "foo": "bar" }\n`);
    });
  });

  describe('write', () => {
    const fileName = 'something.txt';
    const nestedFileName = 'some/thing.txt';

    afterEach(async () => {
      await rm(fileName);
      await rm('some');
    });

    it('writes file', async () => {
      const contents = 'hi, world';
      await fileSystem.write(fileName, contents);
      const fileContents = await fileSystem.read(fileName);

      expect(fileContents).toBe(contents);
    });

    it('writes nested file', async () => {
      const contents = 'hi, world';
      await fileSystem.write(nestedFileName, contents);
      const fileContents = await fileSystem.read(nestedFileName);

      expect(fileContents).toBe(contents);
    });
  });

  describe('copy', () => {
    const toFile = 'copy.json';
    const toDir = 'copied-folder';

    afterEach(async () => {
      await rm(toFile);
      await rm(toDir);
    });

    it('copies file', async () => {
      const fromFile = 'file.json';
      await fileSystem.copy(fromFile, toFile);
      const fileContents = await fileSystem.read(toFile);

      expect(fileContents).toBe(`{ "foo": "bar" }\n`);
    });

    it('copies directory', async () => {
      const fromDir = 'folder';
      await fileSystem.copy(fromDir, toDir);
      const dirGlob = await fileSystem.glob(`${toDir}/*`);
      const [file] = dirGlob;

      expect(file).toMatch('copied-folder/file.json');
    });
  });

  describe('hasFile', () => {
    it('detects file', async () => {
      expect(await fileSystem.hasFile('file.json')).toBe(true);
    });

    it('ignores directory', async () => {
      expect(await fileSystem.hasFile('folder')).toBe(false);
    });
  });

  describe('hasDirectory', () => {
    it('detects directory', async () => {
      expect(await fileSystem.hasDirectory('folder')).toBe(true);
    });

    it('ignores file', async () => {
      expect(await fileSystem.hasDirectory('file.json')).toBe(false);
    });
  });

  describe('glob', () => {
    it('globs', async () => {
      const glob = await fileSystem.glob('**/*');
      const [file, folder, nestedFile] = glob;

      expect(file).toMatch('/file.json');
      expect(folder).toMatch('/folder');
      expect(nestedFile).toMatch('/folder/file.json');
    });
  });

  describe('buildPath', () => {
    it('returns build prefixed path', () => {
      const path = fileSystem.buildPath('anything');

      expect(path).toMatch('/build/anything');
    });
  });

  describe('resolvePath', () => {
    it('returns build prefixed path', () => {
      const path = fileSystem.resolvePath('anything');

      expect(path).toMatch('/anything');
    });
  });
});
