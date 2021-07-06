import {resolve, relative, dirname} from 'path';

import {
  appendFile,
  readFile,
  mkdirp,
  copy as copyExtra,
  CopyOptions,
  remove,
  writeFile,
} from 'fs-extra';
import glob, {IOptions as GlobOptions} from 'glob';

import type {FileSystem as FSType} from '../types';

export class FileSystem implements FSType {
  constructor(public readonly root: string) {}

  async read(file: string) {
    return readFile(this.resolvePath(file), 'utf8');
  }

  async write(file: string, contents: string) {
    const resolved = this.resolvePath(file);
    await mkdirp(dirname(resolved));
    await writeFile(resolved, contents);
  }

  async append(file: string, contents: string) {
    const resolved = this.resolvePath(file);
    await mkdirp(dirname(resolved));
    await appendFile(resolved, contents);
  }

  async remove(file: string) {
    const resolved = this.resolvePath(file);
    await remove(resolved);
  }

  async copy(from: string, to: string, options?: CopyOptions) {
    const resolvedFrom = this.resolvePath(from);
    const resolvedTo = this.resolvePath(to);

    await copyExtra(resolvedFrom, resolvedTo, options);
  }

  async hasFile(file: string) {
    const matches = await this.glob(file, {nodir: true});
    return matches.length > 0;
  }

  async hasDirectory(dir: string) {
    const matches = await this.glob(dir.endsWith('/') ? dir : `${dir}/`);
    return matches.length > 0;
  }

  async glob(pattern: string, options: Omit<GlobOptions, 'cwd'> = {}) {
    return glob.sync(pattern, {...options, cwd: this.root, absolute: true});
  }

  buildPath(...paths: string[]) {
    return this.resolvePath('build', ...paths);
  }

  resolvePath(...paths: string[]) {
    return resolve(this.root, ...paths);
  }

  relativePath(path: string) {
    return relative(this.root, path);
  }
}
