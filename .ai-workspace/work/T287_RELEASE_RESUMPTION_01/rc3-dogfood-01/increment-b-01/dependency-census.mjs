// Read-only lower bound, not a complete dynamic dependency proof.
import { createRequire } from 'node:module';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { createHash } from 'node:crypto';
const require = createRequire(import.meta.url);
const ts = require('/Users/jim/Library/Application Support/ABIogenesis/toolchains/rc2-dogfood-01/node_modules/typescript');
const root = '/Users/jim/src/apps/abiogenesis-rc3-dogfood/build_tenants/abiogenesis/typescript';
const tests = ['t287-default-library.test.mjs','t287-default-library-fulfillment.test.mjs',
  't287-native-semantic-revision.test.mjs','t287-native-workspace-work.test.mjs',
  'm5-worker-transport.test.mjs','t287-stdo3-run-environment.test.mjs',
  'r1-packed-artifact.test.mjs','installed-language-smoke.test.mjs'];
const queue = tests.map(x => resolve(root,'test_env/tests',x));
const seen = new Set(), dynamic = [], missing = [];
while (queue.length) {
  const file = queue.shift();
  if (seen.has(file)) continue;
  if (!existsSync(file)) { missing.push(relative(root,file)); continue; }
  if (!file.startsWith(root + '/test_env/')) continue;
  seen.add(file);
  const source = readFileSync(file,'utf8');
  const ast = ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  function walk(node) {
    let spec = null;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) spec = node.moduleSpecifier.text;
    if (ts.isCallExpression(node)) {
      const expression = node.expression.getText(ast);
      if (expression === 'import' || expression === 'require') {
        const arg = node.arguments[0];
        if (arg && ts.isStringLiteral(arg)) spec = arg.text;
        else dynamic.push({file:relative(root,file),line:ast.getLineAndCharacterOfPosition(node.getStart()).line+1,kind:'computed module load'});
      }
      if (/(^|\.)(readFile|readFileSync|copyFile|copyFileSync|cp|cpSync|readdir|readdirSync|glob|globSync|open|openSync|execFile|execFileSync|spawn|spawnSync)$/.test(expression))
        dynamic.push({file:relative(root,file),line:ast.getLineAndCharacterOfPosition(node.getStart()).line+1,kind:'filesystem or process access requires review',call:expression});
    }
    if (ts.isNewExpression(node) && node.expression.getText(ast) === 'URL')
      dynamic.push({file:relative(root,file),line:ast.getLineAndCharacterOfPosition(node.getStart()).line+1,kind:'URL-derived resource requires review'});
    if (spec?.startsWith('.')) {
      const target = resolve(dirname(file),spec);
      if (target.startsWith(root + '/test_env/')) queue.push(target);
    }
    ts.forEachChild(node,walk);
  }
  walk(ast);
}
const files = [...seen].sort().map(file => ({path:relative(root,file),bytes:statSync(file).size,sha256:createHash('sha256').update(readFileSync(file)).digest('hex')}));
console.log(JSON.stringify({kind:'rc3_increment_b_static_test_import_lower_bound',typescript:ts.version,
  entryTests:tests.map(x=>'test_env/tests/'+x),files,totalBytes:files.reduce((a,x)=>a+x.bytes,0),missing,
  dynamic,limits:'Literal relative module imports within test_env only. Computed paths, filesystem APIs, subprocesses, generated files, fixture assets, owner-selected testSources, new unwritten tests, and imports outside test_env require separate closure proof. This is not a narrowed C2 snapshot.'},null,2));
