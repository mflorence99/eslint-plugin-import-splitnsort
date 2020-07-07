import plugin from './';

describe('index', () => {

  test('Rule is correctly exported', () => {
    expect(plugin.configs.recommended.parser).toBe('@typescript-eslint/parser');
  });

});
