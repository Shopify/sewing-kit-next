import {ProjectKind} from '../types';
import {WebApp, ServiceWorker} from '..';

const name = 'some-web-app';
const root = 'some/root';

describe('WebApp', () => {
  const webApp = new WebApp({name, root});

  describe('kind', () => {
    it('is web app', () => {
      expect(webApp.kind).toBe(ProjectKind.WebApp);
    });
  });

  describe('entry', () => {
    it('is undefined by default', () => {
      expect(webApp.entry).toBeUndefined();
    });

    describe('provided entry', () => {
      const webApp = new WebApp({name, root, entry: 'entry'});

      it('is provided entries', () => {
        expect(webApp.entry).toBe('entry');
      });
    });
  });

  describe('serviceWorker', () => {
    it('is undefined by default', () => {
      expect(webApp.serviceWorker).toBeUndefined();
    });

    describe('provided serviceWorker', () => {
      const serviceWorker = {entry: 'service-worker-entry'};
      const webApp = new WebApp({name, root, serviceWorker});

      it('is provided serviceWorker', () => {
        expect(webApp.serviceWorker).toStrictEqual(
          new ServiceWorker(serviceWorker),
        );
      });
    });
  });

  describe('id', () => {
    it('is based on name', () => {
      expect(webApp.id).toBe('WebApp.SomeWebApp');
    });
  });
});
