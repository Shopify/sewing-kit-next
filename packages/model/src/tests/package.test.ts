import {ProjectKind, Runtime} from '../types';
import {Package, PackageEntry, PackageBinary} from '..';

const name = 'some-package';
const root = 'some/root';

describe('Package', () => {
  const pkg = new Package({name, root});

  describe('kind', () => {
    it('is package', () => {
      expect(pkg.kind).toBe(ProjectKind.Package);
    });
  });

  describe('runtimes', () => {
    it('is undefined by default', () => {
      expect(pkg.runtimes).toBeUndefined();
    });

    describe('provided runtimes', () => {
      const pkg = new Package({name, root, runtimes: [Runtime.Node]});

      it('is provided entries', () => {
        expect(pkg.runtimes).toStrictEqual([Runtime.Node]);
      });
    });
  });

  describe('entires', () => {
    it('is empty by default', () => {
      expect(pkg.entries).toStrictEqual([]);
    });

    describe('provided entries', () => {
      const entry = {root: 'root', name: 'name', runtimes: [Runtime.Browser]};
      const pkg = new Package({name, root, entries: [entry]});

      it('is provided entries', () => {
        expect(pkg.entries).toStrictEqual([new PackageEntry(entry)]);
      });
    });
  });

  describe('binaries', () => {
    it('is empty by default', () => {
      expect(pkg.binaries).toStrictEqual([]);
    });

    describe('provided binaries', () => {
      const binary = {root: 'root', name: 'name', aliases: ['alias']};
      const pkg = new Package({name, root, binaries: [binary]});

      it('is provided binaries', () => {
        expect(pkg.binaries).toStrictEqual([new PackageBinary(binary)]);
      });
    });
  });

  describe('id', () => {
    it('is based on name', () => {
      expect(pkg.id).toBe('Package.SomePackage');
    });
  });
});
