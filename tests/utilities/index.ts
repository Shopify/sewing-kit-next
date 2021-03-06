import {resolve, dirname} from 'path';
import {Readable, Writable} from 'stream';
import {StringDecoder} from 'string_decoder';

import {
  mkdirp,
  rmdir,
  writeFile,
  readFile,
  pathExists,
  emptyDir,
  remove,
} from 'fs-extra';
import stripAnsiFn from 'strip-ansi';
import toTree from 'tree-node-cli';

const commandMap = {
  build: () =>
    import('../../packages/loom-cli/src/commands/build').then(
      ({build}) => build,
    ),
};

type CommandMap = typeof commandMap;

class TestOutputStream extends Writable {
  private data = '';
  private decoder = new StringDecoder();

  _write(chunk: Buffer, encoding: string, callback: () => void) {
    this.data += encoding === 'buffer' ? this.decoder.write(chunk) : chunk;
    callback();
  }

  _final(callback: () => void) {
    this.data += this.decoder.end();
    callback();
  }

  toString() {
    return this.data;
  }
}

export class Workspace {
  private lastRunResults: {
    [key: string]: RunResult;
  } = {};

  constructor(public readonly root: string) {}

  async run<TK extends keyof CommandMap>(command: TK, args: string[] = []) {
    const stdout = new TestOutputStream();
    const stderr = new TestOutputStream();
    const stdin = new Readable();

    const commandTask = await commandMap[command]();
    await commandTask([...args, '--root', this.root], {
      __internal: {stdin, stdout, stderr},
    });

    stdout.end();
    stderr.end();

    const result = new RunResult(stdout.toString(), stderr.toString());

    this.lastRunResults[command] = result;
    return result;
  }

  async writeConfig(contents: string, config = 'loom.config.js') {
    const configPath = resolve(this.root, config);

    await mkdirp(dirname(configPath));
    await writeFile(configPath, contents);
  }

  async writeFile(file: string, contents: string) {
    const path = this.resolvePath(file);
    await mkdirp(dirname(path));
    await writeFile(path, contents);
  }

  async writeFileMap(fileMap: {[key: string]: string}) {
    return Promise.all(
      Object.entries(fileMap).map(([file, path]) => this.writeFile(file, path)),
    );
  }

  async writeFileFromFixture(file: string, path: string) {
    return this.writeFile(file, await readFile(path, {encoding: 'utf8'}));
  }

  async writeFileFromFixtureMap(fileMap: {[key: string]: string}) {
    return Promise.all(
      Object.entries(fileMap).map(([file, path]) =>
        this.writeFileFromFixture(file, path),
      ),
    );
  }

  async removeFile(file: string) {
    await remove(this.resolvePath(file));
  }

  contents(file: string) {
    return readFile(this.resolvePath(file), 'utf8');
  }

  contains(file: string) {
    return pathExists(this.resolvePath(file));
  }

  resolvePath(file: string) {
    return resolve(this.root, file);
  }

  debug() {
    console.log(toTree(this.root, {allFiles: true}));
  }

  debugLastRun(command: keyof CommandMap, {stripAnsi = true} = {}) {
    const lastCommand = this.lastRunResults[command];

    console.log({
      stdout: lastCommand.stdout({stripAnsi}),
      stderr: lastCommand.stderr({stripAnsi}),
    });
  }
}

class RunResult {
  #stdout: string;
  #stderr: string;

  constructor(stdout: string, stderr: string) {
    this.#stdout = stdout;
    this.#stderr = stderr;
  }

  stdout({stripAnsi = true} = {}) {
    return stripAnsi ? stripAnsiFn(this.#stdout) : this.#stdout;
  }

  stderr({stripAnsi = true} = {}) {
    return stripAnsi ? stripAnsiFn(this.#stderr) : this.#stderr;
  }
}

export function generateUniqueWorkspaceID() {
  return `test-workspace-${Math.random()}`;
}

export async function withWorkspace(
  name: string,
  useWorkspace: (workspace: Workspace) => void | Promise<void>,
) {
  const root = resolve(__dirname, '../../tmp');
  const directory = resolve(root, name);
  const workspace = new Workspace(directory);

  try {
    await mkdirp(directory);
    await useWorkspace(workspace);
  } finally {
    await emptyDir(directory);
    await rmdir(directory);
  }
}

withWorkspace.extend = (
  extend: (workspace: Workspace) => void | Promise<void>,
) => {
  return (
    name: string,
    useWorkspace: (workspace: Workspace) => void | Promise<void>,
  ) => {
    return withWorkspace(name, async (workspace: Workspace) => {
      await extend(workspace);
      await useWorkspace(workspace);
    });
  };
};
