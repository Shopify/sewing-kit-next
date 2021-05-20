import {WebApp, Package, Service} from '@sewing-kit/core';

import {
  projectTypeSwitch,
  toArgs,
  addHooks,
  unwrapPossibleGetter,
  unwrapPossibleArrayGetter,
} from '..';

class NotCalledError extends Error {}

describe('projectTypeSwitch', () => {
  it('switches on web app', () => {
    let switchedProject;
    const project = new WebApp({name: 'name', root: '.'});
    projectTypeSwitch(project, {
      webApp: (project) => (switchedProject = project),
      package: () => {
        throw new NotCalledError();
      },
      service: () => {
        throw new NotCalledError();
      },
    });

    expect(switchedProject).toBe(project);
  });

  it('switches on package', () => {
    let switchedProject;
    const project = new Package({name: 'name', root: '.'});
    projectTypeSwitch(project, {
      webApp: () => {
        throw new NotCalledError();
      },
      package: (project) => (switchedProject = project),
      service: () => {
        throw new NotCalledError();
      },
    });

    expect(switchedProject).toBe(project);
  });

  it('switches on service', () => {
    let switchedProject;
    const project = new Service({name: 'name', root: '.'});
    projectTypeSwitch(project, {
      webApp: () => {
        throw new NotCalledError();
      },
      package: () => {
        throw new NotCalledError();
      },
      service: (project) => (switchedProject = project),
    });

    expect(switchedProject).toBe(project);
  });
});

describe('toArgs', () => {
  it('parses boolean flag', () => {
    expect(toArgs({bool: true})).toStrictEqual(['--bool']);
  });

  it('parses array flag', () => {
    expect(toArgs({array: [1, 'two']})).toStrictEqual([
      '--array',
      '1',
      '--array',
      'two',
    ]);
  });

  it('parses dasherized flag', () => {
    expect(toArgs({anOption: 'value'}, {dasherize: true})).toStrictEqual([
      '--an-option',
      'value',
    ]);
  });

  it('parses object flag', () => {
    expect(toArgs({object: {foo: 'bar'}}, {json: false})).toStrictEqual([
      '--object',
      '[object Object]',
    ]);
  });

  it('parses JSON object flag', () => {
    expect(toArgs({object: {foo: 'bar'}})).toStrictEqual([
      '--object',
      '{"foo":"bar"}',
    ]);
  });
});

describe('addHooks', () => {
  it('expands factory object into provided object', () => {
    const one = '一';
    const two = '二';
    const three = '三';

    const countingFactory = addHooks<{[key: string]: unknown}>(() => ({
      two,
      three,
    }));
    expect(countingFactory({one})).toStrictEqual({one, two, three});
  });
});

describe('unwrapPossibleGetter', () => {
  it('unwraps getter', async () => {
    const boolAsStringGetter = (bool: boolean) => (bool ? 'true' : 'false');
    expect(await unwrapPossibleGetter(boolAsStringGetter, true)).toBe('true');
  });

  it('passes through value', async () => {
    const value = 'foo';
    expect(await unwrapPossibleGetter(value)).toBe('foo');
  });
});

describe('unwrapPossibleArrayGetter', () => {
  it('unwraps array getter', async () => {
    const boolAsStringsGetter = (bool: boolean) =>
      bool ? ['true', 'yes'] : ['false', 'no'];
    expect(
      await unwrapPossibleArrayGetter(boolAsStringsGetter, true),
    ).toStrictEqual(['true', 'yes']);
  });

  it('unwraps getter as array', async () => {
    const boolAsStringGetter = (bool: boolean) => (bool ? 'true' : 'false');
    expect(
      await unwrapPossibleArrayGetter(boolAsStringGetter, true),
    ).toStrictEqual(['true']);
  });

  it('passes through array value', async () => {
    const values = ['foo'];
    expect(await unwrapPossibleArrayGetter(values)).toStrictEqual(['foo']);
  });

  it('passes through value as array', async () => {
    const value = 'foo';
    expect(await unwrapPossibleArrayGetter(value)).toStrictEqual(['foo']);
  });
});
