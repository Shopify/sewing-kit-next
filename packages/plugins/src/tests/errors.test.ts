import {MissingPluginError} from '..';

const plugin = 'some-plugin';

interface FunctionSuggestion {
  suggestion: () => void;
}

describe('MissingPluginError', () => {
  const error = new MissingPluginError(plugin);

  describe('title', () => {
    it('mentions plugin is missing', () => {
      expect(error.title).toBe('Missing hooks provided by some-plugin');
    });
  });

  describe('suggestion', () => {
    const error = new MissingPluginError(plugin) as MissingPluginError &
      FunctionSuggestion;

    it('is loggable', () => {
      const fmt = jest.fn();

      error.suggestion(fmt);

      expect(fmt).toHaveBeenCalledWith(
        [
          'Run {command yarn add ',
          '}, import it into your sewing-kit config file, and include it using the {code plugins} option.',
        ],
        'some-plugin',
      );
    });
  });

  describe('content', () => {
    it('is undefined', () => {
      expect(error.content).toBeUndefined();
    });
  });
});
