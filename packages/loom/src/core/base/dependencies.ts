import {join} from 'path';

interface PackageJsonInternal {
  name?: string;
  dependencies?: {[key: string]: string};
  devDependencies?: {[key: string]: string};
}

export class PackageJson {
  static load(root: string) {
    try {
      return new PackageJson(require(join(root, 'package.json')));
    } catch {
      return undefined;
    }
  }

  get name() {
    return this.internal.name;
  }

  get dependencies() {
    return this.internal.dependencies ?? {};
  }

  get devDependencies() {
    return this.internal.devDependencies ?? {};
  }

  constructor(private readonly internal: PackageJsonInternal) {}

  dependency(dependency: string) {
    return this.internal.dependencies?.[dependency];
  }

  devDependency(dependency: string) {
    return this.internal.devDependencies?.[dependency];
  }
}
