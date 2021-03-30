import {join} from 'path';
import {FileSystem} from '../fs';

jest.mock('fs-extra');
jest.mock('glob');

const {
  writeFile: mockWriteFile,
  readFile: mockReadFile,
  mkdirp: mockMkdirp,
  copy: mockCopy,
  remove: mockRemove,
} = jest.requireMock('fs-extra');
const {sync: mockGlob} = jest.requireMock('glob');

const root = join(__dirname, 'mock', 'root');

describe('FileSystem', () => {
  const fileSystem = new FileSystem(root);

  beforeEach(() => {
    mockWriteFile.mockReset();
    mockReadFile.mockReset();
    mockMkdirp.mockReset();
    mockCopy.mockReset();
    mockGlob.mockReset();
    mockRemove.mockReset();
  });

  describe('root', () => {
    it('is provided path', () => {
      expect(fileSystem.root).toBe(root);
    });
  });

  describe('read', () => {
    it('reads file', async () => {
      mockReadFile.mockReturnValue(`{ "foo": "bar" }`);

      const contents = await fileSystem.read('file.json');

      expect(contents).toBe(`{ "foo": "bar" }`);
      expect(mockReadFile).toHaveBeenCalledWith(
        join(root, 'file.json'),
        'utf8',
      );
    });
  });

  describe('write', () => {
    it('writes file', async () => {
      const fileName = 'something.txt';
      const contents = 'hi, world';
      await fileSystem.write(fileName, contents);

      expect(mockMkdirp).toHaveBeenCalledWith(root);
      expect(mockWriteFile).toHaveBeenCalledWith(
        join(root, fileName),
        contents,
      );
    });

    it('writes nested file', async () => {
      const fileName = 'some/thing.txt';
      const contents = 'hi, world';
      await fileSystem.write(fileName, contents);

      expect(mockMkdirp).toHaveBeenCalledWith(join(root, 'some'));
      expect(mockWriteFile).toHaveBeenCalledWith(
        join(root, fileName),
        contents,
      );
    });
  });

  describe('copy', () => {
    it('copies file', async () => {
      const fromFile = 'file.json';
      const toFile = 'copy.json';
      await fileSystem.copy(fromFile, toFile);

      expect(mockCopy).toHaveBeenCalledWith(
        join(root, fromFile),
        join(root, toFile),
        undefined,
      );
    });

    it('copies directory', async () => {
      const fromDir = 'folder';
      const toDir = 'copied-folder';
      await fileSystem.copy(fromDir, toDir);

      expect(mockCopy).toHaveBeenCalledWith(
        join(root, fromDir),
        join(root, toDir),
        undefined,
      );
    });
  });

  describe('remove', () => {
    it('removes a file', async () => {
      const fromFile = 'file.json';
      await fileSystem.remove(fromFile);

      expect(mockRemove).toHaveBeenCalledWith(join(root, fromFile));
    });

    it('removes directory', async () => {
      const fromDir = 'folder';
      await fileSystem.remove(fromDir);

      expect(mockRemove).toHaveBeenCalledWith(join(root, fromDir));
    });
  });

  describe('hasFile', () => {
    it('detects file', async () => {
      mockGlob.mockReturnValue([join(root, 'file.json')]);
      expect(await fileSystem.hasFile('file.json')).toBe(true);
    });

    it('ignores directory', async () => {
      mockGlob.mockReturnValue([]);
      expect(await fileSystem.hasFile('folder')).toBe(false);
      expect(mockGlob).toHaveBeenCalledWith('folder', {
        cwd: fileSystem.root,
        absolute: true,
        nodir: true,
      });
    });
  });

  describe('hasDirectory', () => {
    it('detects directory', async () => {
      mockGlob.mockReturnValue([join(root, 'folder/')]);
      expect(await fileSystem.hasDirectory('folder')).toBe(true);
    });

    it('ignores file', async () => {
      mockGlob.mockReturnValue([]);
      expect(await fileSystem.hasDirectory('file.json')).toBe(false);
      expect(mockGlob).toHaveBeenCalledWith('file.json/', {
        cwd: fileSystem.root,
        absolute: true,
      });
    });
  });

  describe('glob', () => {
    it('globs', async () => {
      mockGlob.mockReturnValue([
        join(root, 'file.json'),
        join(root, 'folder/'),
        join(root, 'folder/file.json'),
      ]);
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
