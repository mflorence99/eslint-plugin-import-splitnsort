import * as eslint from 'eslint';
import * as estree from 'estree';

const ruleModule: eslint.Rule.RuleModule = {

  create: (context: eslint.Rule.RuleContext): eslint.Rule.RuleListener => {

    let atLeastOne = false;

    // make a guess at the original source coding conventions

    let braces = ['{ ', ' }'];
    let quote = '\'';
    let semi = ';';

    // split-and-sort extracts imports into these categories

    const imports = {
      local: {
        sideEffect: [],
        namespace: { },
        namedClass: { },
        namedFunction: { },
        default: { }
      },
      nodeModules: {
        sideEffect: [],
        namespace: { },
        namedClass: { },
        namedFunction: { },
        default: { }
      }
    };

    // keep track of the location of the original imports
    // NOTE: we need this to pass to context.report()

    const loc: eslint.AST.SourceLocation = {
      start: {
        line: Number.MAX_SAFE_INTEGER,
        column: Number.MAX_SAFE_INTEGER,
      },
      end: {
        line: Number.MIN_SAFE_INTEGER,
        column: Number.MIN_SAFE_INTEGER
      }
    };

    // keep track of the range of the original imports
    // NOTE: we need this to pass to the fixer-upper

    const range: eslint.AST.Range = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];

    // perform split-and-sort operation on the original imports
    // and stach the result in "imports" above

    const splitnsort = (): string[] => {
      const generated: string[] = [];
      const sorter = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());
      Object.keys(imports).forEach(section => {
        Object.keys(imports[section]).forEach(type => {
          const extracted = imports[section][type];
          let stmts = [];
          switch (type) {
            case 'sideEffect':
              stmts = extracted.sort(sorter)
                .map(source => `import ${quote}${source}${quote}${semi}`);
              break;
            case 'namespace':
              stmts = Object.keys(extracted).sort(sorter)
                .map(nm => `import * as ${nm} from ${quote}${extracted[nm]}${quote}${semi}`);
              break;
            case 'namedClass':
            case 'namedFunction':
              stmts = Object.keys(extracted).sort(sorter)
                .map(nm => `import ${braces[0]}${nm}${braces[1]} from ${quote}${extracted[nm]}${quote}${semi}`);
              break;
            case 'default':
              stmts = Object.keys(extracted).sort(sorter)
                .map(nm => `import ${nm} from ${quote}${extracted[nm]}${quote}${semi}`);
              break;
          }
          generated.push(...stmts);
          generated.push('');
        });
        generated.push('');
      });
      // remove adjacent blank lines
      const deduplicated = generated
        .filter((stmt, ix, array) => (ix === 0) || (stmt !== array[ix - 1]));
      return deduplicated;
    };

    // ////////////////////////////////////////////////////////////////////////////////
    // the create function itself
    // ////////////////////////////////////////////////////////////////////////////////
    
    return {

      // on the way down the Program tree, extract all the ImportDeclarations

      // eslint-disable-next-line @typescript-eslint/naming-convention
      Program: (program: estree.Program) => {
        const sourceCode = context.getSourceCode();
        program.body
          .filter(node => node.type === 'ImportDeclaration')
          .forEach((declaration: estree.ImportDeclaration) => {
            atLeastOne = true;

            // expand the known location of the original imports
            loc.start.line = Math.min(loc.start.line, declaration.loc.start.line);
            loc.start.column = Math.min(loc.start.column, declaration.loc.start.column);
            loc.end.line = Math.max(loc.end.line, declaration.loc.end.line);
            loc.end.column = Math.max(loc.end.column, declaration.loc.end.column);

            // expand the known range of the original imports
            range[0] = Math.min(range[0], declaration.range[0]);
            range[1] = Math.max(range[1], declaration.range[1]);

            // "import...from" gives the module name
            // if the module name is a path, it is local to the project
            // otherwise the import is from node_modules
            const code = sourceCode.getText(declaration);
            const moduleName = declaration.source.value as string;
            const base = (moduleName.startsWith('.') || moduleName.startsWith('/')) ? 
              imports.local : imports.nodeModules;

            // make a guess at the original source coding conventions
            if (code.includes('\''))
              quote = '\'';
            else if (code.includes('"'))
              quote = '"';
            const match = /(\{[\s]*).*[^\s]+([\s]*\})/g.exec(code);
            if (match)
              braces = [match[1], match[2]];
            semi = code.endsWith(';') ? ';' : '';

            // no specifiers at all means a side-effect import
            // eg: import from 'esprima'
            if (!declaration.specifiers?.length)
              base.sideEffect.push(moduleName);

            else {
              declaration.specifiers.forEach(specifier => {

                // the local name is the thing being imported - eg: import { a }
                // by convention, a lowercase initial character indicates an instance
                // an uppercase initial character indicates a class
                let nm = specifier.local.name;
                const ch = specifier.local.name[0];
                const isFunction = (ch === ch.toLowerCase());

                // regex the original code to determine alias - eg: import { X as Y }
                const match = new RegExp(`([a-zA-Z_$][a-zA-Z\\d_$]*)[\\s]+as[\\s]+${nm}`, 'g').exec(code);
                if (match)
                  nm = `${match[1]} as ${nm}`;

                // stash the extracted import
                switch (specifier.type) {
                  case 'ImportDefaultSpecifier':
                    base.default[nm] = moduleName;
                    break;
                  case 'ImportNamespaceSpecifier':
                    base.namespace[nm] = moduleName;
                    break;
                  case 'ImportSpecifier':
                    if (isFunction)
                      base.namedFunction[nm] = moduleName;
                    else base.namedClass[nm] = moduleName;
                    break;
                }

              });
            }
            return declaration;
          });
      },

      // on the way up the Program tree, split-and-sort extracted imports
      // no error if imports already split-and-sorted

      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Program:exit': (program: estree.Program) => {
        const code = context.getSourceCode().getText(program);
        const generated = splitnsort().join('\n').trim();
        // NOTE: the "code" as generated from the program node doesn't start
        // until the first statement, skipping initial comments and whitespace
        // so ... we have to offset our range by the program start
        const offset = program.range[0];
        if (atLeastOne 
          && (generated !== code.substring(range[0] - offset, range[1] - offset))) {
          context.report({ 
            fix: (fixer: eslint.Rule.RuleFixer): any => {
              return fixer.replaceTextRange(range, generated);
            },
            loc, 
            messageId: 'splitnsort'
          });
        }
      }

    };
  },

  meta: {
    docs: {
      description: 'Split and sort TypeScript import statements.',
      recommended: true,
      url: 'https://github.com/mflorence99/eslint-plugin-import-splitnsort/blob/master/README.md'
    },
    fixable: 'code',
    messages: {
      splitnsort: 'Run autofix to sort these imports'
    },
    type: 'layout',
    schema: []
  }

};

export default ruleModule;
