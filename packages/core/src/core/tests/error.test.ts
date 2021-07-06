import {DiagnosticError, isDiagnosticError} from '..';

const title = 'An error happened';
const content = 'This is what happened';
const suggestion = 'This is what you can do about it';

describe('DiagnosticError', () => {
  it('defines a DiagnosticError', () => {
    const diagErr = new DiagnosticError({title, content, suggestion});
    expect(isDiagnosticError(diagErr)).toBe(true);
  });

  it('defines an Error', () => {
    const err = new DiagnosticError({title, content, suggestion});
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toMatch(title);
  });
});
