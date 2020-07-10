import splitnsort from './splitnsort';

export = {

  configs: {
    recommended: {
      parser: '@typescript-eslint/parser',
      parserOptions: { 
        sourceType: 'module' 
      },
      plugins: ['@typescript-eslint'],      
      rules: {
        'import-splitnsort/split-and-sort': 'error'
      }
    }
  },

  rules: {
    'split-and-sort': splitnsort
  }

};
