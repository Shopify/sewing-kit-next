import {Base, toId} from '..';
import {FileSystem} from '../fs';

const name = 'app';
const root = 'base';

jest.mock('dep/package.json', () => ({version: '0.0.1'}), {virtual: true});

jest.mock(
  'base/package.json',
  () => ({
    name: 'fixture',
    private: true,
    devDependencies: {
      'dev-dep': '0.0.5',
    },
    dependencies: {
      dep: '0.0.2',
      'other-dep': '0.0.3',
    },
  }),
  {virtual: true},
);

describe('Base', () => {
  const base = new Base({name, root});

  describe('name', () => {
    it('is provided name', () => {
      expect(base.name).toBe(name);
    });
  });

  describe('root', () => {
    it('is provided root', () => {
      expect(base.root).toBe(root);
    });
  });

  describe('fs', () => {
    it('is a filesystem', () => {
      expect(base.fs).toBeInstanceOf(FileSystem);
    });
  });

  describe('dependencies', () => {
    it('lists prod dependencies by default', () => {
      expect(base.dependencies()).toStrictEqual(['dep', 'other-dep']);
    });

    it('lists prod dependencies', () => {
      const prod = true;

      expect(base.dependencies({prod})).toStrictEqual(['dep', 'other-dep']);
    });

    it('lists dev dependencies', () => {
      const dev = true;

      expect(base.dependencies({dev})).toStrictEqual(['dev-dep']);
    });

    it('lists all dependencies', () => {
      const all = true;

      expect(base.dependencies({all})).toStrictEqual([
        'dep',
        'other-dep',
        'dev-dep',
      ]);
    });
  });

  describe('dependency', () => {
    it('returns specific dependency', () => {
      expect(base.dependency('dep')).toStrictEqual({version: '0.0.1'});
    });
  });

  describe('hasDependency', () => {
    it('returns true when dependency exists', async () => {
      expect(await base.hasDependency('dep')).toBe(true);
    });

    it('returns false when dependency does not exist', async () => {
      expect(await base.hasDependency('dep-that-does-not-exist')).toBe(false);
    });
  });
});

describe('toId', () => {
  it('camelizes strings', () => {
    const id = toId('testing_value-123');

    expect(id).toBe('TestingValue123');
  });
});
