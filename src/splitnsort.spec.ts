import splitnsort from './splitnsort';

import * as eslint from 'eslint';

import parser from '@typescript-eslint/parser';

const ruleTester = new eslint.RuleTester({
  parser: parser,
  parserOptions: {
    ecmaVersion: '2020',
    sourceType: 'module'
  }
});

const valid = `
// a comment
/* another comment */ export const xxx = 1;

/* my imports */ import './code';

import { X } from './my-module.js';
import { Y as Z } from './my-module.js';

import { a } from './my-module.js';

import num from './my-module.js';

import * as validator from '@validator';

// start of my code
export function f() { }`;

const invalid = `
// a comment
/* another comment */ export const xxx = 1;

/* my imports */ import num, { a, X, Y as Z } from './my-module.js';
import * as validator from '@validator';
import './code';

// start of my code
export function f() { }`;

ruleTester.run('split-and-sort: Smote Test', splitnsort, {
  valid: [
    {
      code: valid
    }
  ],
  invalid: [
    {
      code: invalid,
      errors: [{ messageId: 'splitnsort' }],
      output: valid
    }
  ]
});
