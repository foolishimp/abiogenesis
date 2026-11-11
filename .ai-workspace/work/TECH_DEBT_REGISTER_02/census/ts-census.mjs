// Symbol-level reachability census of the TypeScript tenant.
// Usage: node ts-census.mjs <tenantDir> <outDir>
//
// For every top-level declaration under code/src it records:
//   - the source files that use it (other files, and uses inside its own file);
//   - whether it is reachable from the product's runtime roots ("runtime"),
//     otherwise from the in-process SDK export "./public" ("sdk"), otherwise
//     only from another package export ("package"), or from none ("none").
//     Runtime roots are: the load-time statements of the CLI entry points and
//     of the two modules the product spawns as processes; the exports the
//     Public definition calls resolve by name (`definitionBindingExportName`,
//     looked up in the package export beside it); and every export of a module the product loads
//     by a "build/code/src/....js" string;
//   - how many test-side files mention its name. That is a whole-word text
//     match: a hit can be a coincidence, a miss is real.
// It also lists the compiler's unused-local diagnostics and the module graph.
// It reads source only and never runs product code.
import { createRequire } from "node:module";
import path from "node:path";
import fs from "node:fs";

const tenant = path.resolve(process.argv[2]);
const outDir = path.resolve(process.argv[3]);
fs.mkdirSync(outDir, { recursive: true });
const require = createRequire(path.join(tenant, "package.json"));
const ts = require("typescript");
const pkg = JSON.parse(fs.readFileSync(path.join(tenant, "package.json"), "utf8"));
const srcRoot = path.join(tenant, "code/src") + path.sep;
const rel = (file) => path.relative(srcRoot, file);

process.chdir(tenant); // automatic @types resolution starts from the current directory
const cfgFile = path.join(tenant, "tsconfig.json");
const cfg = ts.readConfigFile(cfgFile, ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(cfg.config, ts.sys, tenant, undefined, cfgFile);
const options = { ...parsed.options, noEmit: true, noUnusedLocals: true, noUnusedParameters: true };
const program = ts.createProgram(parsed.fileNames, options);
const checker = program.getTypeChecker();
const sources = program.getSourceFiles().filter((f) => f.fileName.startsWith(srcRoot));
const lineOf = (sf, pos) => sf.getLineAndCharacterOfPosition(pos).line + 1;

// ---------------------------------------------------------------- entry points
const buildToSrc = (p) => path.join(tenant, p.replace(/^\.\/build\/code\/src\//, "code/src/").replace(/\.js$/, ".ts"));
const exportEntries = Object.entries(pkg.exports ?? {}).map(([key, v]) => ({ key, file: buildToSrc(v.import ?? v) }));
const binEntries = Object.entries(pkg.bin ?? {}).map(([key, v]) => ({ key, file: buildToSrc(v) }));

// ---------------------------------------------------------------- declarations
const decls = [];
const declOfNode = new Map();      // declaration node -> decl
const declsOfStatement = new Map(); // top-level statement -> decl[]
const overloads = new Map();       // file#name -> function decl
const effectStatements = new Map(); // file -> statements that run at module load
const kindName = (node) => ts.isFunctionDeclaration(node) ? "function" : ts.isClassDeclaration(node) ? "class"
  : ts.isInterfaceDeclaration(node) ? "interface" : ts.isTypeAliasDeclaration(node) ? "type"
  : ts.isEnumDeclaration(node) ? "enum" : ts.isModuleDeclaration(node) ? "namespace" : "const";

for (const sf of sources) {
  const effects = [];
  for (const st of sf.statements) {
    const span = lineOf(sf, st.end) - lineOf(sf, st.getStart(sf)) + 1;
    const tags = ts.getJSDocTags(st).map((t) => t.tagName.text);
    const add = (nameNode, node) => {
      const name = nameNode.getText(sf);
      const key = `${sf.fileName}#${name}`;
      let d = ts.isFunctionDeclaration(node) ? overloads.get(key) : undefined;
      if (d) d.lines += span;
      else {
        d = { id: decls.length, file: rel(sf.fileName), name, kind: kindName(node), exported: false,
          line: lineOf(sf, st.getStart(sf)), lines: span, deprecated: tags.includes("deprecated"),
          internal: tags.includes("internal"), usedBy: new Set(), usedBySameFile: 0, refs: new Set() };
        decls.push(d);
        if (ts.isFunctionDeclaration(node)) overloads.set(key, d);
      }
      declOfNode.set(node, d);
      const list = declsOfStatement.get(st) ?? [];
      if (!list.includes(d)) list.push(d);
      declsOfStatement.set(st, list);
    };
    if (ts.isFunctionDeclaration(st) || ts.isClassDeclaration(st) || ts.isInterfaceDeclaration(st) ||
        ts.isTypeAliasDeclaration(st) || ts.isEnumDeclaration(st) || ts.isModuleDeclaration(st)) {
      if (st.name) add(st.name, st);
    } else if (ts.isVariableStatement(st)) {
      for (const v of st.declarationList.declarations) {
        if (ts.isIdentifier(v.name)) add(v.name, v);
        else {
          const visit = (n) => { if (ts.isBindingElement(n) && ts.isIdentifier(n.name)) add(n.name, n); ts.forEachChild(n, visit); };
          visit(v.name);
        }
      }
    } else if (!ts.isImportDeclaration(st) && !ts.isExportDeclaration(st) && !ts.isImportEqualsDeclaration(st) &&
               st.kind !== ts.SyntaxKind.EmptyStatement) {
      effects.push(st);
    }
  }
  effectStatements.set(sf.fileName, effects);
}

/** The top-level declaration that owns a symbol's declaration, when it is in code/src. */
function ownerOfSymbol(sym) {
  if (!sym) return null;
  if (sym.flags & ts.SymbolFlags.Alias) { try { sym = checker.getAliasedSymbol(sym); } catch { return null; } }
  for (const d of sym.declarations ?? []) {
    if (!d.getSourceFile().fileName.startsWith(srcRoot)) continue;
    for (let cur = d; cur; cur = cur.parent) { const hit = declOfNode.get(cur); if (hit) return hit; }
  }
  return null;
}
function symbolAt(id) {
  const p = id.parent;
  if (ts.isShorthandPropertyAssignment(p) && p.name === id) return checker.getShorthandAssignmentValueSymbol(p);
  return checker.getSymbolAtLocation(id);
}
const isPlumbing = (id) => {
  const p = id.parent;
  return ts.isImportSpecifier(p) || ts.isImportClause(p) || ts.isNamespaceImport(p) || ts.isExportSpecifier(p) ||
    ts.isNamespaceExport(p) || ts.isImportEqualsDeclaration(p);
};

// exported flag from the module's own export table (covers `export { x }`)
for (const sf of sources) {
  const mod = checker.getSymbolAtLocation(sf);
  if (!mod) continue;
  for (const s of checker.getExportsOfModule(mod)) {
    const d = ownerOfSymbol(s);
    if (d && d.file === rel(sf.fileName)) d.exported = true;
  }
}

// ---------------------------------------------------------------- references
const importEdges = new Map(); // file -> Set(file)
const effectRefs = new Map();  // file -> Set(decl id) used by load-time statements
for (const sf of sources) {
  const edges = new Set();
  const loadRefs = new Set();
  importEdges.set(sf.fileName, edges);
  effectRefs.set(sf.fileName, loadRefs);
  const here = rel(sf.fileName);
  const resolve = (spec) => {
    const r = ts.resolveModuleName(spec, sf.fileName, options, ts.sys).resolvedModule?.resolvedFileName;
    if (r && r.startsWith(srcRoot)) edges.add(r);
  };
  let current = null; // decl being walked, "effect", or null for import/export statements
  const walk = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) resolve(node.moduleSpecifier.text);
    if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword && node.arguments[0] && ts.isStringLiteral(node.arguments[0])) resolve(node.arguments[0].text);
    if (ts.isIdentifier(node) && !isPlumbing(node)) {
      const target = ownerOfSymbol(symbolAt(node));
      const ownName = target && declOfNode.get(node.parent) === target && node.parent.name === node;
      if (target && !ownName && current !== target) {
        if (current === "effect") loadRefs.add(target.id);
        else if (current) current.refs.add(target.id);
        if (here === target.file) target.usedBySameFile += 1; else target.usedBy.add(here);
      }
    }
    ts.forEachChild(node, walk);
  };
  for (const st of sf.statements) {
    const owned = declsOfStatement.get(st);
    if (owned && ts.isVariableStatement(st)) {
      for (const v of st.declarationList.declarations) { current = declOfNode.get(v) ?? owned[0]; walk(v); }
    } else if (owned) { current = owned[0]; walk(st); }
    else if (ts.isImportDeclaration(st) || ts.isExportDeclaration(st)) { current = null; walk(st); }
    else { current = "effect"; walk(st); }
  }
}

// ---------------------------------------------------------------- reachability
function moduleReach(entryFiles) {
  const seen = new Set(entryFiles.filter((f) => importEdges.has(f)));
  const queue = [...seen];
  while (queue.length) for (const next of importEdges.get(queue.pop()) ?? []) if (!seen.has(next)) { seen.add(next); queue.push(next); }
  return seen;
}
function exportedDeclsOf(file) {
  const sf = program.getSourceFile(file);
  const mod = sf && checker.getSymbolAtLocation(sf);
  return mod ? checker.getExportsOfModule(mod).map((s) => ownerOfSymbol(s)).filter(Boolean) : [];
}
function symbolReach(rootIds, loadedModules) {
  const seen = new Set(rootIds);
  for (const file of loadedModules) for (const id of effectRefs.get(file) ?? []) seen.add(id);
  const queue = [...seen];
  while (queue.length) for (const next of decls[queue.pop()].refs) if (!seen.has(next)) { seen.add(next); queue.push(next); }
  return seen;
}
const cliFiles = binEntries.map((e) => e.file);
// Modules the product starts as separate processes (self-invocation checks at
// abg/governed_context_client.ts and implementation/worksite_command_helper.ts).
const processFiles = ["abg/governed_context_client.ts", "implementation/worksite_command_helper.ts"].map((f) => path.join(srcRoot, f));
// Modules and exports the product resolves from strings at runtime.
const dynamicModules = new Map(); // src file -> naming sites
const danglingModulePaths = [];
const namedRootNames = new Map(); // export name -> naming sites
for (const sf of sources) {
  const visit = (node) => {
    if (ts.isStringLiteralLike(node)) {
      const m = /^build\/code\/src\/(.+)\.js$/.exec(node.text); // a module path the product loads; "./build/..." literals are package-export checks
      if (m) {
        const file = path.join(srcRoot, `${m[1]}.ts`);
        const site = `${rel(sf.fileName)}:${lineOf(sf, node.getStart(sf))}`;
        if (importEdges.has(file)) dynamicModules.set(file, [...(dynamicModules.get(file) ?? []), site]);
        else danglingModulePaths.push({ path: node.text, site });
      }
    }
    // A Public definition call resolves `definitionBindingExportName` inside the
    // package export named beside it (`packageExportPath`). Same-named exports
    // exist in sibling modules, so the root is resolved through that barrel.
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === "definitionBindingExportName" &&
        ts.isStringLiteralLike(node.initializer) && ts.isObjectLiteralExpression(node.parent)) {
      const sibling = node.parent.properties.find((q) => ts.isPropertyAssignment(q) && ts.isIdentifier(q.name) &&
        q.name.text === "packageExportPath" && ts.isStringLiteralLike(q.initializer));
      const site = `${rel(sf.fileName)}:${lineOf(sf, node.getStart(sf))}`;
      namedRootNames.set(node.initializer.text, { exportPath: sibling ? sibling.initializer.text : null, site });
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
}
const runtimeRoots = new Set();
const unresolvedNamedRoots = [];
for (const [name, { exportPath, site }] of namedRootNames) {
  const entry = exportEntries.find((e) => e.key === exportPath);
  const sf = entry && program.getSourceFile(entry.file);
  const mod = sf && checker.getSymbolAtLocation(sf);
  const sym = mod && checker.getExportsOfModule(mod).find((x) => x.name === name);
  const d = sym && ownerOfSymbol(sym);
  if (d) runtimeRoots.add(d.id); else unresolvedNamedRoots.push({ name, exportPath, site });
}
for (const file of dynamicModules.keys()) for (const d of exportedDeclsOf(file)) runtimeRoots.add(d.id);
const runtimeModules = moduleReach([...cliFiles, ...processFiles, ...dynamicModules.keys()]);
const runtimeReach = symbolReach([...runtimeRoots], runtimeModules);
// The in-process SDK surface: what a host reaches through the "./public" export.
const sdkFile = exportEntries.find((e) => e.key === "./public")?.file;
const sdkRoots = sdkFile ? exportedDeclsOf(sdkFile).map((d) => d.id) : [];
const sdkReach = symbolReach([...sdkRoots, ...runtimeReach], moduleReach([...(sdkFile ? [sdkFile] : []), ...cliFiles, ...processFiles, ...dynamicModules.keys()]));
const pkgFiles = exportEntries.map((e) => e.file);
const pkgModules = moduleReach([...pkgFiles, ...cliFiles, ...processFiles, ...dynamicModules.keys()]);
const pkgRoots = new Set();
for (const f of pkgFiles) for (const d of exportedDeclsOf(f)) pkgRoots.add(d.id);
const pkgReach = symbolReach([...pkgRoots, ...runtimeReach], pkgModules);

// ---------------------------------------------------------------- test-side mentions
const testRoots = ["test_env/tests", "test_env/support", "test_env/fixtures", "test_env/uat", "test_env/downstream",
  "test_env/falsifiers", "test_env/qualification", "test_env/types", "scripts"];
const skipDir = new Set(["node_modules", "build", "dist", ".git", "test_runs", "evidence", "proof"]);
const mention = new Map(); // identifier -> Map(area -> files)
let testFiles = 0;
const scan = (dir, area) => {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { if (!skipDir.has(e.name)) scan(p, area); continue; }
    if (!/\.(mjs|cjs|js|ts|mts)$/.test(e.name) || e.name.endsWith(".d.ts")) continue;
    let text;
    try { if (fs.statSync(p).size > 4_000_000) continue; text = fs.readFileSync(p, "utf8"); } catch { continue; }
    testFiles += 1;
    for (const m of new Set(text.match(/[A-Za-z_$][\w$]*/g) ?? [])) {
      let s = mention.get(m);
      if (!s) mention.set(m, (s = new Map()));
      s.set(area, (s.get(area) ?? 0) + 1);
    }
  }
};
for (const r of testRoots) scan(path.join(tenant, r), r.replace(/^test_env\//, ""));

// ---------------------------------------------------------------- output
const UNUSED = [6133, 6138, 6192, 6196, 6198, 6199, 6205];
const rows = decls.map((d) => {
  const m = mention.get(d.name);
  return { file: d.file, name: d.name, kind: d.kind, exported: d.exported, line: d.line, lines: d.lines,
    deprecated: d.deprecated, internal: d.internal, usedByFiles: d.usedBy.size, usedBySameFile: d.usedBySameFile,
    tier: runtimeReach.has(d.id) ? "runtime" : sdkReach.has(d.id) ? "sdk" : pkgReach.has(d.id) ? "package" : "none",
    testFiles: m ? [...m.values()].reduce((a, b) => a + b, 0) : 0, testMentions: m ? Object.fromEntries(m) : {} };
});
fs.writeFileSync(path.join(outDir, "declarations.json"), JSON.stringify(rows));

const diag = ts.getPreEmitDiagnostics(program)
  .filter((d) => d.file && d.file.fileName.startsWith(srcRoot))
  .map((d) => ({ file: rel(d.file.fileName), line: lineOf(d.file, d.start ?? 0), code: d.code, text: ts.flattenDiagnosticMessageText(d.messageText, " ") }));
fs.writeFileSync(path.join(outDir, "compiler-unused.json"), JSON.stringify(diag.filter((d) => UNUSED.includes(d.code)), null, 1));

const modules = sources.map((sf) => ({
  file: rel(sf.fileName), lines: lineOf(sf, sf.end),
  imports: [...(importEdges.get(sf.fileName) ?? [])].map(rel),
  importedBy: sources.filter((o) => importEdges.get(o.fileName)?.has(sf.fileName)).map((o) => rel(o.fileName)),
  reachRuntime: runtimeModules.has(sf.fileName), reachPackage: pkgModules.has(sf.fileName),
}));
fs.writeFileSync(path.join(outDir, "modules.json"), JSON.stringify(modules, null, 1));

const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const byDir = {};
for (const r of rows) {
  const dir = r.file.includes("/") ? r.file.split("/")[0] : "(root)";
  const b = (byDir[dir] ??= { declarations: 0, lines: 0, runtime: 0, sdk: 0, package: 0, none: 0, noneNoTests: 0, packageNoTests: 0 });
  b.declarations += 1; b.lines += r.lines; b[r.tier] += r.lines;
  if (r.tier === "none" && r.testFiles === 0) b.noneNoTests += r.lines;
  if (r.tier === "package" && r.testFiles === 0) b.packageNoTests += r.lines;
}
const summary = {
  typescript: ts.version, sourceFiles: sources.length, testSideFilesScanned: testFiles,
  declarations: rows.length, declarationLines: sum(rows.map((r) => r.lines)),
  exportEntries: exportEntries.map((e) => ({ key: e.key, file: rel(e.file), exists: fs.existsSync(e.file) })),
  binEntries: binEntries.map((e) => ({ key: e.key, file: rel(e.file), exists: fs.existsSync(e.file) })),
  processEntries: processFiles.map(rel),
  dynamicModules: Object.fromEntries([...dynamicModules].map(([f, sites]) => [rel(f), sites.length])),
  danglingModulePaths,
  namedRuntimeRoots: [...namedRootNames.keys()].sort(),
  unresolvedNamedRoots,
  modulesNotLoadedByRuntime: modules.filter((m) => !m.reachRuntime).map((m) => m.file),
  modulesNotReachableFromPackage: modules.filter((m) => !m.reachPackage).map((m) => m.file),
  tierLines: Object.fromEntries(["runtime", "sdk", "package", "none"].map((t) => [t, sum(rows.filter((r) => r.tier === t).map((r) => r.lines))])),
  compilerUnused: diag.filter((d) => UNUSED.includes(d.code)).length,
  compilerOtherByCode: Object.fromEntries(Object.entries(diag.filter((d) => !UNUSED.includes(d.code)).reduce((a, d) => ((a[d.code] = (a[d.code] ?? 0) + 1), a), {}))),
  compilerOtherSample: diag.filter((d) => !UNUSED.includes(d.code)).slice(0, 3),
  byDir,
};
fs.writeFileSync(path.join(outDir, "summary.json"), JSON.stringify(summary, null, 1));
console.log(JSON.stringify(summary, null, 1));
