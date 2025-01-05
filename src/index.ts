import splitnsort from './splitnsort';

export = {

  configs: {
    recommended: {
      parser: '@typescript-eslint/parser',
      parserOptions: { 
        sourceType: 'module' 
      },
      plugins: ['import-splitnsort'],      
      rules: {
        'import-splitnsort/split-and-sort': 'error'
      }
    }
  },

  name: 'eslint-plugin-import-splitnsort',

  rules: {
    'split-and-sort': splitnsort
  }

};
