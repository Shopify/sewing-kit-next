import {link} from 'ansi-escapes';
import chalk from 'chalk';
import {supportsHyperlink} from 'supports-hyperlinks';

import {LogLevel, LogOptions, Loggable, LogFormatter} from '@sewing-kit/core';

export {LogLevel};
export type {LogOptions, Loggable, LogFormatter};

interface Options {
  stdin: NodeJS.ReadStream;
  stdout: NodeJS.WriteStream;
  stderr: NodeJS.WriteStream;
  level: LogLevel;
  isInteractive: boolean;
}

const CHALK_MAPPINGS = new Map([
  ['success', 'green'],
  ['error', 'red'],
  ['info', 'blue'],
  ['subdued', 'dim'],
  ['emphasis', 'bold'],
  ['code', 'inverse'],
  ['command', 'bold'],
  ['title', 'bold.underline'],
]);

function createFormatter(stream: NodeJS.WriteStream) {
  const supportsLinks = supportsHyperlink(stream);

  const formatString = (str: string) => {
    const formattingRegex = /\{(success|error|info|subdued|emphasis|code|command|title)/g;
    const linkRegex = /\{link\s+(.*?)(?= http) ([^}]*)\}/g;

    return str
      .replace(linkRegex, (_, text: string, url: string) => {
        return supportsLinks
          ? link(text.trim(), url)
          : `${text.trim()} (${url})`;
      })
      .replace(formattingRegex, (_, format) => {
        return `{${CHALK_MAPPINGS.get(format)}`;
      });
  };

  const processInterpolation = (interpolated: Loggable) => {
    return typeof interpolated === 'function'
      ? interpolated(formatter)
      : interpolated || '';
  };

  const formatter = (
    strings: TemplateStringsArray,
    ...interpolated: Loggable[]
  ): string => {
    const newStrings = strings.map(formatString);
    (newStrings as any).raw = newStrings;

    return chalk(newStrings as any, ...interpolated.map(processInterpolation));
  };

  return formatter;
}

class FormattedStream {
  private readonly formatter: LogFormatter;

  constructor(public readonly stream: NodeJS.WriteStream) {
    this.formatter = createFormatter(stream);
  }

  stringify(value: Loggable) {
    return typeof value === 'function' ? value(this.formatter) : String(value);
  }

  write(value: Loggable) {
    const stringified = this.stringify(value);
    this.stream.write(stringified);
    return stringified;
  }
}

export class Ui {
  readonly stdout: FormattedStream;
  readonly stderr: FormattedStream;
  readonly level: LogLevel;
  readonly isInteractive: boolean;

  constructor({
    stdout = process.stdout,
    stderr = process.stderr,
    level = LogLevel.Info,
    isInteractive = false,
  }: Partial<Options> = {}) {
    this.stdout = new FormattedStream(stdout);
    this.stderr = new FormattedStream(stderr);
    this.level = level;
    this.isInteractive = isInteractive;
  }

  log = (value: Loggable, {level = LogLevel.Info}: LogOptions = {}) => {
    if (!this.canLogLevel(level)) {
      return;
    }

    this.stdout.write(value);
    this.stdout.write('\n');
  };

  error = (value: Loggable, {level = LogLevel.Info}: LogOptions = {}) => {
    if (!this.canLogLevel(level)) {
      return;
    }

    this.stderr.write(value);
    this.stderr.write('\n');
  };

  canLogLevel = (level: LogLevel) => {
    return this.level >= level;
  };
}
