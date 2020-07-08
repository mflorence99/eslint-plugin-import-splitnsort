import plugin from './';

describe('index', () => {

  test('configs are correctly exported', () => {
    expect(plugin.configs.recommended.parser).toBe('@typescript-eslint/parser');
  });

  test('rules are correctly exported', () => {
    expect(plugin.rules['split-and-sort'].meta.docs.url).toBe('https://github.com/mflorence99/eslint-plugin-import-splitnsort/blob/master/docs/splitnsort.md');
  });

});
