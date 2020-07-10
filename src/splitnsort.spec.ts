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

const valid = `import './code';

import { X } from './my-module.js';
import { Y as Z } from './my-module.js';

import { a } from './my-module.js';

import num from './my-module.js';

import * as validator from '@validator';

export function f() { }`;

const invalid = `import num, { a, X, Y as Z } from "./my-module.js";
import * as validator from "@validator";
import "./code";

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
      errors: [{
        suggestions: [{
          desc: 'Run autofix to sort these imports',
          output: valid
        }]
      }]
    }
  ]
});
