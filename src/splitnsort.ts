import * as eslint from 'eslint';
import * as estree from 'estree';

const ruleModule: eslint.Rule.RuleModule = {

  create: (context: eslint.Rule.RuleContext): eslint.Rule.RuleListener => {

    // TODO
    let atLeastOne = false;

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

    const range: eslint.AST.Range = [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];

    // const splitnsort = (fixer: eslint.Rule.RuleFixer): any => {
    const splitnsort = (): string[] => {
      const generated: string[] = [];
      const sorter = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());
      Object.keys(imports).forEach(section => {
        Object.keys(imports[section]).forEach(type => {
          const data = imports[section][type];
          let stmts = [];
          switch (type) {
            case 'sideEffect':
              stmts = data.sort(sorter).map(datum => `import '${datum}';`);
              break;
            case 'namespace':
              stmts = Object.keys(data).sort(sorter).map(key => `import * as ${key} from '${data[key]}';`);
              break;
            case 'namedClass':
            case 'namedFunction':
              stmts = Object.keys(data).sort(sorter).map(key => `import { ${key} } from '${data[key]}';`);
              break;
            case 'default':
              stmts = Object.keys(data).sort(sorter).map(key => `import ${key} from '${data[key]}';`);
              break;
          }
          generated.push(...stmts);
          generated.push('');
        });
        generated.push('');
      });
      const deduplicated = generated
        .filter((stmt, ix, array) => (ix === 0) || (stmt !== array[ix - 1]));
      console.log(deduplicated.join('\n'));
      return deduplicated;
    };
    
    return {

      // eslint-disable-next-line @typescript-eslint/naming-convention
      Program: (program: estree.Program) => {
        const sourceCode = context.getSourceCode();
        program.body
          .filter(node => node.type === 'ImportDeclaration')
          .forEach((declaration: estree.ImportDeclaration) => {
            // TODO
            atLeastOne = true;

            loc.start.line = Math.min(loc.start.line, declaration.loc.start.line);
            loc.start.column = Math.min(loc.start.column, declaration.loc.start.column);
            loc.end.line = Math.max(loc.end.line, declaration.loc.end.line);
            loc.end.column = Math.max(loc.end.column, declaration.loc.end.column);

            range[0] = Math.min(range[0], declaration.range[0]);
            range[1] = Math.max(range[1], declaration.range[1]);

            const code = sourceCode.getText(declaration);
            const moduleName = declaration.source.value as string;
            const base = (moduleName.startsWith('.') || moduleName.startsWith('/')) ? imports.local : imports.nodeModules;

            if (!declaration.specifiers?.length)
              base.sideEffect.push(moduleName);

            else {
              declaration.specifiers.forEach(specifier => {

                let nm = specifier.local.name;
                const ch = specifier.local.name[0];
                const isFunction = (ch === ch.toLowerCase());
                const match = new RegExp(`([a-zA-Z_$][a-zA-Z\\d_$]*)[\\s]+as[\\s]+${nm}`, 'g').exec(code);
                if (match)
                  nm = `${match[1]} as ${nm}`;

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

        // TODO
        if (atLeastOne) {
          console.log(JSON.stringify(imports));
          console.log(JSON.stringify(loc));
          console.log(JSON.stringify(range));
        }
      },

      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Program:exit': (program: estree.Program) => {
        const code = context.getSourceCode().getText(program);
        const generated = splitnsort().join('\n');
        if (generated !== code.substring(program.range[0], program.range[1])) {
          context.report({ 
            loc, 
            messageId: 'splitnsort', 
            fix: (fixer: eslint.Rule.RuleFixer): any => {
              fixer.replaceTextRange(range, generated);
            }
          });
        }
      }

    };
  },

  meta: {
    docs: {
      description: 'Split and sort TypeScript import statements.',
      recommended: true,
      url: 'https://github.com/mflorence99/eslint-plugin-import-splitnsort/blob/master/docs/splitnsort.md'
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
