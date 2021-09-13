import {ProjectKind} from '../types';
import {Service} from '..';

const name = 'some-service';
const root = 'some/root';

describe('Service', () => {
  const service = new Service({name, root});

  describe('kind', () => {
    it('is service', () => {
      expect(service.kind).toBe(ProjectKind.Service);
    });
  });

  describe('entry', () => {
    it('is undefined by default', () => {
      expect(service.entry).toBeUndefined();
    });

    describe('provided entry', () => {
      const service = new Service({name, root, entry: 'entry'});

      it('is provided entries', () => {
        expect(service.entry).toBe('entry');
      });
    });
  });

  describe('id', () => {
    it('is based on name', () => {
      expect(service.id).toBe('Service.SomeService');
    });
  });
});
