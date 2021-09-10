import {DiagnosticError} from '../core';

export class MissingPluginError extends DiagnosticError {
  constructor(plugin: string) {
    super({
      title: `Missing hooks provided by ${plugin}`,
      suggestion: (fmt) =>
        fmt`Run {command yarn add ${plugin}}, import it into your loom config file, and include it using the {code plugins} option.`,
    });
  }
}
