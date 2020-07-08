import * as eslint from 'eslint';

import parser from '@typescript-eslint/parser';
import splitnsort from './splitnsort';

const ruleTester = new eslint.RuleTester({
  parser: parser,
  parserOptions: {
    ecmaVersion: '2020',
    sourceType: 'module'
  }
});

ruleTester.run('split-and-sort: Smote Test', splitnsort, {
  valid: [
    {
      code: `
        import './code';

        import { X } from './my-module.js';
        import { Y as Z } from './my-module.js';

        import { a } from './my-module.js';

        import num from './my-module.js';

        import * as validator from '@validator';
      `
    }
  ],
  invalid: [
    {
      code: `
        import num, { a, X, Y as Z } from "./my-module.js";
        import * as validator from "@validator";
        import "./code";
        // import zip = require('./ZipCodeValidator');
        // import type { APIResponseType } from "./api";

        export function f() { }
      `,
      errors: [{messageId: 'splitnsort'}]
    }
  ]
});
