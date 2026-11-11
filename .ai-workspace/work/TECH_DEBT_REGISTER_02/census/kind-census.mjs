// Census of kind-like string literals in code/src.
// Usage: node kind-census.mjs <tenantDir> <outDir>
//
// For every snake_case string literal it counts the syntactic positions the
// value appears in:
//   type     - inside a type (a union member, a literal type)
//   test     - compared with ===/!==, a `case` label, or an `includes(...)` argument
//   produce  - the value of an object property, a call argument, an array element,
//              a return value or an initializer
// and how many test-side files contain the quoted value.
// Two candidate lists follow from that:
//   neverProduced - typed or tested in source, never produced there. The code
//                   handles a kind it never creates. External inputs (provider
//                   streams, parsed files) are legitimate exceptions.
//   neverRead     - produced in source, never typed or tested there or in tests.
// It reads source only.
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const tenant = path.resolve(process.argv[2]);
const outDir = path.resolve(process.argv[3]);
fs.mkdirSync(outDir, { recursive: true });
const ts = createRequire(path.join(tenant, "package.json"))("typescript");
const srcRoot = path.join(tenant, "code/src") + path.sep;

const files = [];
const walkDir = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); if (e.isDirectory()) walkDir(p); else if (e.name.endsWith(".ts")) files.push(p); } };
walkDir(srcRoot);

const KIND = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/; // snake_case with at least one underscore
const values = new Map();
const entry = (v) => { let e = values.get(v); if (!e) values.set(v, (e = { type: 0, test: 0, produce: 0, props: new Map(), files: new Set(), sites: [] })); return e; };
const isTypeNode = (n) => { for (let c = n; c; c = c.parent) { if (ts.isTypeNode(c)) return true; if (ts.isStatement(c)) return false; } return false; };
const EQ = new Set([ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken, ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken]);

for (const file of files) {
  const sf = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.ES2022, true);
  const rel = path.relative(srcRoot, file);
  const visit = (node) => {
    if (ts.isStringLiteralLike(node) && KIND.test(node.text)) {
      const e = entry(node.text);
      e.files.add(rel);
      const p = node.parent;
      let where;
      if (isTypeNode(node)) { e.type += 1; where = "type"; }
      else if (ts.isCaseClause(p) || (ts.isBinaryExpression(p) && EQ.has(p.operatorToken.kind)) ||
               (ts.isCallExpression(p) && ts.isPropertyAccessExpression(p.expression) && ["includes", "has", "startsWith", "endsWith"].includes(p.expression.name.text))) { e.test += 1; where = "test"; }
      else {
        e.produce += 1; where = "produce";
        if (ts.isPropertyAssignment(p) && p.initializer === node) { const k = p.name.getText(sf); e.props.set(k, (e.props.get(k) ?? 0) + 1); }
      }
      if (e.sites.length < 6) e.sites.push(`${rel}:${sf.getLineAndCharacterOfPosition(node.getStart(sf)).line + 1}:${where}`);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}

// quoted mentions on the test side
const testRoots = ["test_env/tests", "test_env/support", "test_env/fixtures", "test_env/uat", "test_env/downstream", "test_env/falsifiers", "test_env/qualification", "scripts"];
const skipDir = new Set(["node_modules", "build", "dist", ".git", "test_runs", "evidence", "proof"]);
const testMention = new Map();
const scan = (dir) => {
  let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!skipDir.has(e.name)) scan(p); continue; }
    if (!/\.(mjs|cjs|js|ts|mts|json)$/.test(e.name)) continue;
    let text; try { if (fs.statSync(p).size > 4_000_000) continue; text = fs.readFileSync(p, "utf8"); } catch { continue; }
    for (const m of new Set(text.match(/["'`]([a-z][a-z0-9]*(?:_[a-z0-9]+)+)["'`]/g) ?? [])) { const v = m.slice(1, -1); testMention.set(v, (testMention.get(v) ?? 0) + 1); }
  }
};
for (const r of testRoots) scan(path.join(tenant, r));

const rows = [...values].map(([value, e]) => ({ value, type: e.type, test: e.test, produce: e.produce,
  props: Object.fromEntries(e.props), files: e.files.size, testFiles: testMention.get(value) ?? 0, sites: e.sites }))
  .sort((a, b) => a.value.localeCompare(b.value));
const neverProduced = rows.filter((r) => r.produce === 0 && (r.type > 0 || r.test > 0));
const neverRead = rows.filter((r) => r.produce > 0 && r.type === 0 && r.test === 0 && r.testFiles === 0);
fs.writeFileSync(path.join(outDir, "kinds.json"), JSON.stringify(rows));
fs.writeFileSync(path.join(outDir, "kinds-never-produced.json"), JSON.stringify(neverProduced, null, 1));
fs.writeFileSync(path.join(outDir, "kinds-never-read.json"), JSON.stringify(neverRead, null, 1));
console.log(JSON.stringify({ values: rows.length, neverProduced: neverProduced.length,
  neverProducedAndNoTestMention: neverProduced.filter((r) => r.testFiles === 0).length, neverRead: neverRead.length }, null, 1));
