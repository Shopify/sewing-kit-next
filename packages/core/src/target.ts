import {Runtime} from './types';
import {Package} from './package';
import {WebApp} from './web-app';
import {Service} from './service';

import type {Project} from '.';

export class TargetRuntime {
  static fromProject(project: Service | WebApp | Package) {
    if (project instanceof Service) {
      return new TargetRuntime([Runtime.Node]);
    }

    if (project instanceof WebApp) {
      return new TargetRuntime([Runtime.Browser]);
    }

    const runtimes = new Set(project.runtimes ?? []);

    for (const entry of project.entries) {
      if (entry.runtimes) {
        for (const entryRuntime of entry.runtimes) {
          runtimes.add(entryRuntime);
        }
      }
    }

    return new TargetRuntime(runtimes);
  }

  readonly runtimes: Set<Runtime>;

  constructor(runtimes: Iterable<Runtime>) {
    this.runtimes = new Set(runtimes);
  }

  includes(runtime: Runtime) {
    return this.runtimes.has(runtime);
  }
}

export interface Target<TKind extends Project, TOptions> {
  readonly options: TOptions;
  readonly project: TKind;
  readonly runtime: TargetRuntime;
}

interface BuilderOptions<TKind extends Project, TOptions> {
  project: TKind;
  options?: TOptions[];
  runtime?: TargetRuntime;
  needs?: Iterable<TargetBuilder<TKind, TOptions>>;
  default?: boolean;
}

export class TargetBuilder<TKind extends Project, TOptions> {
  readonly default: boolean;
  readonly needs: Set<TargetBuilder<TKind, TOptions>>;
  readonly project: TKind;
  readonly runtime: TargetRuntime;
  private readonly options: TOptions[];

  constructor({
    project,
    options,
    needs,
    runtime = TargetRuntime.fromProject(project),
    default: isDefault = options == null,
  }: BuilderOptions<TKind, TOptions>) {
    this.project = project;
    this.runtime = runtime;
    this.default = isDefault;
    this.options = options ?? [{} as any];
    this.needs = new Set(needs);
  }

  add(...options: TOptions[]) {
    return new TargetBuilder({
      project: this.project,
      runtime: this.runtime,
      default: this.default,
      options: [...this.options, ...options],
    });
  }

  multiply(multiplier: (options: TOptions) => TOptions[]) {
    return new TargetBuilder({
      project: this.project,
      runtime: this.runtime,
      default: this.default,
      options: this.options.map(multiplier).flat(),
    });
  }

  toTargets(): Target<TKind, TOptions>[] {
    const {project, runtime, options} = this;

    return options.map((options) => ({
      project,
      runtime,
      options,
    }));
  }
}

export type LogFormatter = (
  strings: TemplateStringsArray,
  ...interpolated: Loggable[]
) => string;

export type Loggable = ((format: LogFormatter) => string) | string;

export enum LogLevel {
  Errors,
  Warnings,
  Info,
  Debug,
}

export interface LogOptions {
  level?: LogLevel;
}

export type Log = (loggable: Loggable, options?: LogOptions) => void;

export interface StepResources {
  readonly cpu?: number;
  readonly memory?: number;
}

export interface StepStdio {
  readonly stdout: import('stream').Writable;
  readonly stderr: import('stream').Writable;
  readonly stdin: import('stream').Readable;
}

interface IndefiniteStepRunner {
  readonly stdio: StepStdio;
}

// We probably need to add some sort of listener system so the step can
// listen for types of events (close, switch to another stdio stream?),
// primarily for cleaning up spawned processes and the like
export interface StepRunner {
  indefinite(run: (runner: IndefiniteStepRunner) => void): void;
  log(arg: Loggable, options?: LogOptions): void;
  status(status: Loggable): void;
  exec(
    file: string,
    args?: ReadonlyArray<string> | import('execa').Options,
    options?: import('execa').Options,
  ): import('execa').ExecaChildProcess;
  runNested(steps: ReadonlyArray<Step>): Promise<void>;
}

export interface Step {
  readonly id: string;
  readonly label: Loggable;
  readonly source?: any;
  readonly resources?: StepResources;
  needs?(step: Step): boolean;
  run(runner: StepRunner): void | Promise<void>;
}
