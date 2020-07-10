# eslint-plugin-import-splitnsort

An ESLInt plugin to enforce idiosyncratic TypeScript import style and ordering, deprecating my VSCode extension [Split'n'Sort Imports](https://marketplace.visualstudio.com/items?itemName=mflo999.import-splitnsort).

`import-splitnsort` is highly opinionated so, like its predecessor, it will appeal perhaps to only a few users:

* imports that reference multiple exports can be *organized* but they can't really be *sorted* without splitting them up, one per line
* if you try to import multiple exports from the same module in one statement, sooner or later you violate the [max-len](https://eslint.org/docs/rules/max-len) rule 
* multi-export imports don't help you eyeball your imports and they disguise their 'weight' in your code

`import-splitnsort` is best used with autofix. In VSCode, that means these settings:

```json
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
```

## Before `import-splitnsort`

```ts
import num, { a, X, Y as Z } from './my-module';
import * as myModule from './my-module';
import './my-code.js';
```

## After `import-splitnsort`

```ts
import './my-code.js';

import * as myModule from './my-module';

import { X } from './my-module';
import { Y as Z } from './my-module';

import { a } from './my-module';

import num from './my-module';
```

## Background

Back in October 2019, [Ricardo Amaral](https://github.com/rfgamaral) kindly made some excellent suggestions for improving [Split'n'Sort Imports](https://marketplace.visualstudio.com/items?itemName=mflo999.import-splitnsort). However, I'd retired from building software and I never implemented them. Or so I thought ... now, in the middle of the horrible year of 2020, locked down by the virus, thankful that the only impact to me so far has been cabin fever, I'm trying to stay busy.

## Features

Imports are sorted case-sensitive and broken into 5 categories, in this order:

```ts
import 'code.js';                           // side-effect imports

import * as vscode from 'vscode';           // namespace imports

import { Observer } from 'rxjs';            // named class-like imports

import { map } from 'rxjs/operators';       // named function-like imports

import $ from 'JQuery';                     // default imports
```

> Of course, it is very rare for a single file to use all these different `import` types.

Comments before an after the imports are kept, but **all comments within them, as well as any line breaks or whitespace, are removed**.

Additionally, imports are partitioned into two sections. The first section comprises all the imports from files and modules local to your project, sorted and categorized as described above, the second is the same but for `node_modules`.

> `import-splitnsort` has a peer dependency on `@typescript-eslint/parser`, but that parser currently fails to parse these types of imports:

* `import type {APIResponseType} from "./api"`
* `import zip = require("./ZipCodeValidator");`

> I'll add support for these imports when I've figured out how.

## Installation

`npm i -D eslint-plugin-import-splitnsort`

In your `.eslintrc` configuration:

```js
{
  plugins: ['import-splitnsort', ...],
  extends: ['plugin:import-splitnsort/recommended', ...]
}
```

You can configure the one and only rule, or reconfigure it if you extended `plugin:import-splitnsort/recommended`:

```js
{
  rules: {
    'import-splitnsort/split-and-sort': 'off | warn | error'
  }
}
```

> Don't forget to turn off any other import sorting rules or VSCode plugins!

```js
{
  rules: {
    'sort-imports': 'off'
  }
}
```



