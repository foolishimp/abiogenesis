// Read-only extraction over the two exact test sources; no test execution.
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import ts from './stage-01/build_tenants/abiogenesis/typescript/node_modules/typescript/lib/typescript.js';
const digest = value => createHash('sha256').update(value).digest('hex');
const relative = 'build_tenants/abiogenesis/typescript/test_env/tests/t287-native-work-currentness-consumers.test.mjs';
async function read(path) {
  const text = await fs.readFile(path, 'utf8'), ast = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (ast.parseDiagnostics.length) throw new TypeError('parse diagnostics: ' + path);
  const declarations = {}, bindings = {}, tests = {};
  for (const node of ast.statements) {
    if (ts.isVariableStatement(node)) for (const d of node.declarationList.declarations)
      if (ts.isIdentifier(d.name)) declarations[d.name.text] = d.getText(ast);
    if (ts.isFunctionDeclaration(node) && node.name) declarations[node.name.text] = node.getText(ast);
    if (ts.isImportDeclaration(node)) {
      const c = node.importClause, specifier = node.moduleSpecifier.text;
      if (c?.name) bindings[c.name.text] = { specifier, imported: 'default' };
      if (c?.namedBindings && ts.isNamespaceImport(c.namedBindings)) bindings[c.namedBindings.name.text] = { specifier, imported: '*' };
      if (c?.namedBindings && ts.isNamedImports(c.namedBindings)) for (const e of c.namedBindings.elements)
        bindings[e.name.text] = { specifier, imported: (e.propertyName ?? e.name).text };
    }
    if (ts.isExpressionStatement(node) && ts.isCallExpression(node.expression) && node.expression.expression.getText(ast) === 'test')
      tests[node.expression.arguments[0].text] = node.getText(ast);
  }
  return { path, sha256: digest(text), declarations, bindings, tests };
}
const before = await read(join(import.meta.dirname, '../currentness-consumers/stage-01', relative));
const after = await read(join(import.meta.dirname, 'stage-01', relative));
const match = (kind, left, right) => Object.entries(left).map(([name, value]) => ({ kind, name,
  beforeSha256: digest(JSON.stringify(value)), afterSha256: right[name] === undefined ? null : digest(JSON.stringify(right[name])),
  equal: JSON.stringify(value) === JSON.stringify(right[name]) }));
const matches = [...match('top-level declaration', before.declarations, after.declarations),
  ...match('existing import binding', before.bindings, after.bindings), ...match('existing test body', before.tests, after.tests)];
const result = { before: { path: before.path, sha256: before.sha256 }, after: { path: after.path, sha256: after.sha256 }, matches,
  allExistingEqual: matches.every(row => row.equal), additionalTestNames: Object.keys(after.tests).filter(name => !(name in before.tests)),
  originalCorrespondence: '../currentness-consumers/reused-support-correspondence.json',
  originalE2Appendix: '../u1-cross-binding-triage-01/E2-support-correspondence.json',
  limit: 'No earlier 38-call aggregate or 26-body population is re-executed here. All old declarations/bindings/test body and shared support are conserved. The intentional EventCalculus target-predicate change is separately proved by the new selected population; final combined aggregate remains required.' };
await fs.writeFile(join(import.meta.dirname, 'support-correspondence.json'), JSON.stringify(result, null, 2) + '\n');
if (!result.allExistingEqual) throw new TypeError('existing support correspondence differs');
console.log(JSON.stringify({ matches: matches.length, allExistingEqual: result.allExistingEqual, additionalTestNames: result.additionalTestNames }));
