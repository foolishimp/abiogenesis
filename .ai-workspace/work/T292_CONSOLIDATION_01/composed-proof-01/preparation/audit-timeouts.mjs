// Static preparation only: parse test source, never import or execute a test.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const [tenant, oldMap, output] = process.argv.slice(2);
if (!tenant || !oldMap || !output) throw Error('usage: node audit-timeouts.mjs TENANT OLD_MAP OUTPUT');
const require = createRequire(path.join(tenant, 'package.json'));
const ts = require('typescript');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const prior = JSON.parse(fs.readFileSync(oldMap));
const files = fs.readdirSync(path.join(tenant, 'test_env/tests')).filter(p => p.endsWith('.test.mjs')).map(p => 'test_env/tests/' + p).sort();
files.push('test_env/uat/harness.test.mjs');
const rows = [];
for (const file of files) {
  const bytes = fs.readFileSync(path.join(tenant, file)), text = bytes.toString('utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const constants = new Map(), calls = [], unknown = [];
  function collect(node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) constants.set(node.name.text, node.initializer);
    ts.forEachChild(node, collect);
  }
  collect(source);
  function number(node, seen = new Set()) {
    if (!node) return null;
    if (ts.isNumericLiteral(node)) return Number(node.text.replaceAll('_', ''));
    if (ts.isParenthesizedExpression(node)) return number(node.expression, seen);
    if (ts.isIdentifier(node) && constants.has(node.text) && !seen.has(node.text)) return number(constants.get(node.text), new Set([...seen, node.text]));
    if (ts.isBinaryExpression(node)) {
      const a = number(node.left, seen), b = number(node.right, seen);
      if (a === null || b === null) return null;
      const ops = { [ts.SyntaxKind.PlusToken]: () => a+b, [ts.SyntaxKind.MinusToken]: () => a-b, [ts.SyntaxKind.AsteriskToken]: () => a*b, [ts.SyntaxKind.SlashToken]: () => a/b };
      return ops[node.operatorToken.kind]?.() ?? null;
    }
    return null;
  }
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && ['test','it'].includes(node.expression.text)) {
      const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      let multiplicity = 1, loop = null;
      for (let parent = node.parent; parent; parent = parent.parent) {
        if (ts.isForOfStatement(parent)) {
          let values = parent.expression;
          if (ts.isIdentifier(values)) values = constants.get(values.text) ?? values;
          if (ts.isArrayLiteralExpression(values)) multiplicity *= values.elements.length;
          else loop = parent.expression.getText(source);
        } else if (ts.isForStatement(parent) || ts.isWhileStatement(parent) || ts.isDoStatement(parent)) loop = parent.getText(source).split('\n')[0];
        else if (ts.isCallExpression(parent) && ts.isPropertyAccessExpression(parent.expression) && ['forEach','map','flatMap'].includes(parent.expression.name.text)) loop = parent.expression.getText(source);
      }
      const options = node.arguments[1];
      if (options && ts.isObjectLiteralExpression(options)) {
        const timeout = options.properties.find(p => ts.isPropertyAssignment(p) && p.name.getText(source).replaceAll(/["']/g,'') === 'timeout');
        const spreads = options.properties.filter(ts.isSpreadAssignment).map(p => p.expression.getText(source));
        if (timeout) {
          const value = number(timeout.initializer);
          calls.push({line, expression:timeout.initializer.getText(source), timeoutMs:value, multiplicity, unresolvedLoop:loop, name:node.arguments[0]?.getText(source).slice(0,160)});
          if (value === null || loop) unknown.push({line, reason:value === null ? 'dynamic timeout' : 'unresolved multiplicity', expression:timeout.initializer.getText(source), loop});
        } else if (spreads.length) unknown.push({line, reason:'spread options may carry timeout', spreads, loop});
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  const knownTotal = calls.reduce((n,r) => n+(r.timeoutMs ?? 0)*r.multiplicity,0);
  const floor = prior.historicalOverrides[file] ?? prior.defaultFileMs;
  rows.push({path:file, sha256:sha(bytes), bytes:bytes.length, literalOrConstantCaseTimeoutTotalMs:knownTotal, explicitTimeouts:calls, unresolved:unknown,
    historicalFloorMs:floor, proposedOuterMs:Math.max(floor,knownTotal+120000), standing:unknown.length ? 'proposal; Root must resolve dynamic options/multiplicity' : 'proposal; literal case ceilings plus 120s setup/drainage, no duration prediction'});
}
fs.writeFileSync(output, JSON.stringify({kind:'static-timeout-preparation', tenant, notFinalPopulation:true, parserVersion:ts.version,
  oldMapSha256:sha(fs.readFileSync(oldMap)), finalRootRulingRequired:true, overallDeadlineMs:null,
  assumption:'Top-level explicit case timeout sums are conservative allowances; skipped live cases remain included. No test or provider execution. Unknown dynamic/spread values stay explicit.', rows}, null, 2)+'\n', {flag:'wx'});
console.log(JSON.stringify({files:rows.length, overridesPreserved:Object.keys(prior.historicalOverrides).length, unresolvedFiles:rows.filter(r=>r.unresolved.length).map(r=>({path:r.path,unresolved:r.unresolved})), proposedAboveHistorical:rows.filter(r=>r.proposedOuterMs>r.historicalFloorMs).map(r=>({path:r.path,knownTotal:r.literalOrConstantCaseTimeoutTotalMs,proposed:r.proposedOuterMs}))},null,2));
