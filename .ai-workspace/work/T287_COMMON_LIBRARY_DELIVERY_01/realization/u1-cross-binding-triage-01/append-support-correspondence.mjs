// Read-only AST comparison; no old test execution or mutation.
import fs from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import ts from '../currentness-consumers/stage-01/build_tenants/abiogenesis/typescript/node_modules/typescript/lib/typescript.js';

const old = join(import.meta.dirname, '../currentness-consumers');
const path = 'build_tenants/abiogenesis/typescript/test_env/tests/t287-native-work-currentness-consumers.test.mjs';
const names = ['selected', 'proveCause', 'traced', 'observed', 'checkedHandoff', 'assessmentContract', 'assessmentSchema',
  'preserveOnFailure', 'physicalInventory', 'retainedJournal', 'retain'];
const digest = text => createHash('sha256').update(text).digest('hex');
async function parse(location) {
  const text = await fs.readFile(location, 'utf8'), ast = ts.createSourceFile(location, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  if (ast.parseDiagnostics.length) throw new TypeError('AST parse diagnostics for ' + location);
  const declarations = {}, imports = {};
  for (const node of ast.statements) {
    if (ts.isVariableStatement(node)) for (const declaration of node.declarationList.declarations)
      if (ts.isIdentifier(declaration.name)) declarations[declaration.name.text] = declaration.getText(ast);
    if (ts.isFunctionDeclaration(node) && node.name) declarations[node.name.text] = node.getText(ast);
    if (ts.isImportDeclaration(node)) imports[node.moduleSpecifier.text] = node.getText(ast);
  }
  return { location, sha256: digest(text), declarations, imports };
}
const final = await parse(join(old, 'stage-01', path)), comparisons = [];
for (const attempt of ['01', '02', '04']) {
  const before = await parse(join(old, 'failed-' + attempt, path));
  comparisons.push({ attempt, historicalFile: before.location, historicalSha256: before.sha256, finalFile: final.location,
    finalSha256: final.sha256, declarations: names.map(name => {
      const a = before.declarations[name] ?? null, b = final.declarations[name] ?? null;
      return { name, beforeSha256: a === null ? null : digest(a), afterSha256: b === null ? null : digest(b),
        byteIdentical: a === b, ...(a === b ? {} : { before: a, after: b }) };
    }), imports: [...new Set([...Object.keys(before.imports), ...Object.keys(final.imports)])].map(specifier => ({
      specifier, before: before.imports[specifier] ?? null, after: final.imports[specifier] ?? null,
      byteIdentical: before.imports[specifier] === final.imports[specifier] })) });
}
await fs.writeFile(join(import.meta.dirname, 'E2-support-correspondence.json'), JSON.stringify({
  purpose: 'Append omitted test-local support identities to the frozen reused-support correspondence, without changing it or acquiring new execution credit.',
  original: '../currentness-consumers/reused-support-correspondence.json', comparisons,
  qualification: 'Unequal declarations are retained verbatim for source inspection. selected adds only checkedHandoff assertions; retain adds diagnostics/journal retention. Attempt01 traced has the already-recorded recursion defect, outside the completed c0Success call path. Actual aggregate rerun remains required on the final combined artifact.',
}, null, 2) + '\n');
console.log(JSON.stringify(comparisons.map(row => ({ attempt: row.attempt,
  equalDeclarations: row.declarations.filter(d => d.byteIdentical).map(d => d.name),
  unequalDeclarations: row.declarations.filter(d => !d.byteIdentical).map(d => d.name),
  changedImportSpecifiers: row.imports.filter(d => !d.byteIdentical).map(d => d.specifier) })), null, 2));
