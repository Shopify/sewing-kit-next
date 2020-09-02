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
    it('writes file', async () => {
      const fileName = 'something.txt';
      const contents = 'hi, world';

      try {
        await fileSystem.write(fileName, contents);
        const fileContents = await fileSystem.read(fileName);

        expect(fileContents).toBe(contents);
      } finally {
        await rm(fileName);
      }
    });

    it('writes nested file', async () => {
      const fileName = 'some/thing.txt';
      const contents = 'hi, world';

      try {
        await fileSystem.write(fileName, contents);
        const fileContents = await fileSystem.read(fileName);

        expect(fileContents).toBe(contents);
      } finally {
        await rm('some');
      }
    });
  });

  describe('copy', () => {
    it('copies file', async () => {
      const fromFile = 'file.json';
      const toFile = 'copy.json';

      try {
        await fileSystem.copy(fromFile, toFile);
        const fileContents = await fileSystem.read(toFile);

        expect(fileContents).toBe(`{ "foo": "bar" }\n`);
      } finally {
        await rm(toFile);
      }
    });

    it('copies directory', async () => {
      const fromDir = 'folder';
      const toDir = 'copied-folder';

      try {
        await fileSystem.copy(fromDir, toDir);
        const dirGlob = await fileSystem.glob(`${toDir}/*`);
        const [file] = dirGlob;

        expect(file).toMatch('copied-folder/file.json');
      } finally {
        await rm(toDir);
      }
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
