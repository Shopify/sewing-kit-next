import {paramCase} from 'change-case';

import {Project, Package, WebApp, Service} from '../core';

type TypeOrCreator<TType, TProjectType> =
  | TType
  | ((project: TProjectType) => TType);

/* eslint-disable consistent-return */
export function projectTypeSwitch<
  TPackageReturn = undefined,
  TWebAppReturn = undefined,
  TServiceReturn = undefined
>(
  project: Project,
  {
    package: pkg,
    webApp,
    service,
  }: {
    package?: TypeOrCreator<TPackageReturn, Package>;
    webApp?: TypeOrCreator<TWebAppReturn, WebApp>;
    service?: TypeOrCreator<TServiceReturn, Service>;
  },
) {
  if (project instanceof Package) {
    return typeof pkg === 'function' ? (pkg as any)(project) : pkg;
  } else if (project instanceof WebApp) {
    return typeof webApp === 'function' ? (webApp as any)(project) : webApp;
  } else if (project instanceof Service) {
    return typeof service === 'function' ? (service as any)(project) : service;
  }
}
/* eslint-enable consistent-return */
export function toArgs(
  flags: {[key: string]: unknown},
  {dasherize = false, json = true} = {},
) {
  return Object.entries(flags).reduce<string[]>((all, [key, value]) => {
    const newArgs: string[] = [];
    const normalizedKey = dasherize ? paramCase(key) : key;

    if (typeof value === 'boolean') {
      if (value) {
        newArgs.push(`--${normalizedKey}`);
      }
    } else if (Array.isArray(value)) {
      newArgs.push(
        ...value.flatMap((subValue) => [
          `--${normalizedKey}`,
          String(subValue),
        ]),
      );
    } else if (value != null) {
      if (typeof value === 'object' && json) {
        newArgs.push(`--${normalizedKey}`, JSON.stringify(value));
      } else {
        newArgs.push(`--${normalizedKey}`, String(value));
      }
    }

    return [...all, ...newArgs];
  }, []);
}

export function addHooks<T>(
  adder: () => T,
): <THooks extends Partial<T>>(hooks: THooks) => THooks & T {
  return (hooks) => ({...hooks, ...adder()});
}

export type ValueOrArray<TValue> = TValue | TValue[];
export type ValueOrGetter<TValue, TArgs extends any[] = []> =
  | TValue
  | ((...args: TArgs) => TValue | Promise<TValue>);

export function unwrapPossibleGetter<T, TArgs extends any[] = []>(
  maybeGetter: ValueOrGetter<T, TArgs>,
  ...args: TArgs
): T | Promise<T> {
  return typeof maybeGetter === 'function'
    ? (maybeGetter as any)(...args)
    : maybeGetter;
}

export async function unwrapPossibleArrayGetter<T, TArgs extends any[] = []>(
  maybeGetter: ValueOrGetter<ValueOrArray<T>, TArgs>,
  ...args: TArgs
) {
  const result = await unwrapPossibleGetter(maybeGetter, ...args);
  return Array.isArray(result) ? result : [result];
}
