import {MissingPluginError} from '../errors';

const plugin = 'some-plugin';

interface FunctionSuggestion {
  suggestion: () => void;
}

describe('MissingPluginError', () => {
  describe('title', () => {
    it('mentions plugin is missing', () => {
      const error = new MissingPluginError(plugin);

      expect(error.title).toBe('Missing hooks provided by some-plugin');
    });
  });

  describe('suggestion', () => {
    it('is loggable', () => {
      const error = new MissingPluginError(plugin) as MissingPluginError &
        FunctionSuggestion;
      const fmtSpy = jest.fn();

      error.suggestion(fmtSpy);

      expect(fmtSpy).toHaveBeenCalledWith(
        [
          'Run {command yarn add ',
          '}, import it into your loom config file, and include it using the {code plugins} option.',
        ],
        'some-plugin',
      );
    });
  });

  describe('content', () => {
    it('is undefined', () => {
      const error = new MissingPluginError(plugin) as MissingPluginError &
        FunctionSuggestion;

      expect(error.content).toBeUndefined();
    });
  });
});
