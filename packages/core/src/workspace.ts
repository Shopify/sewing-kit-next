import {Base, Options as BaseOptions} from './base';

type WebApp = import('./web-app').WebApp;
type Service = import('./service').Service;
type Package = import('./package').Package;

export interface WorkspaceOptions extends BaseOptions {
  readonly webApps: ReadonlyArray<WebApp>;
  readonly packages: ReadonlyArray<Package>;
  readonly services: ReadonlyArray<Service>;
}

export class Workspace extends Base {
  readonly webApps: ReadonlyArray<WebApp>;
  readonly packages: ReadonlyArray<Package>;
  readonly services: ReadonlyArray<Service>;

  get projects() {
    return [...this.packages, ...this.webApps, ...this.services];
  }

  constructor({webApps, packages, services, ...rest}: WorkspaceOptions) {
    super(rest);

    this.webApps = webApps;
    this.packages = packages;
    this.services = services;
  }
}
