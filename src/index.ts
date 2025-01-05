import splitnsort from './splitnsort';

export = {

  configs: {
    recommended: {
      name: 'eslint-plugin-import-splitnsort',
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

  rules: {
    'split-and-sort': splitnsort
  }

};
