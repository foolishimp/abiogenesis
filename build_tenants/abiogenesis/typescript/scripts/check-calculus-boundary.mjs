// Calculus boundary (library design §2, the `abg/calculus/` row). The Event
// Calculus kernel imports only the modules that row's Imports cell names, less
// `abg/runtime_liveness.ts`: the owner ruled that the function deriving a
// fluent from events belongs to the calculus and the liveness owner consumes
// it, so the kernel imports nothing from that consumer. A `.ts` file under
// code/src/abg/calculus/ fails this check when an import or re-export
// declaration, `import type` included, or a dynamic `import()` names a module
// outside this set:
//   code/src/shared/admit/, code/src/shared/canonical_json.ts,
//   code/src/shared/digests.ts, code/src/shared/immutable.ts,
//   code/src/shared/refusal.ts, code/src/shared/select/, code/src/shared/value/,
//   code/src/product/worksite_effect.ts, code/src/product/native_workspace_work.ts,
//   code/src/abg/event_prefix.ts, code/src/abg/event_store.ts,
//   code/src/abg/runtime_liveness_contracts.ts, code/src/abg/c_call_outcome.ts,
//   code/src/abg/native_work_effect.ts,
// or another module under code/src/abg/calculus/. A package specifier is
// outside the set. Offenders print as `path:line: text`; any offender, or an
// allow-list entry that matches no line, exits 1.
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const calculusRoot = "code/src/abg/calculus/";

const ADMITTED = [
  "code/src/shared/admit/",
  "code/src/shared/canonical_json.ts",
  "code/src/shared/digests.ts",
  "code/src/shared/immutable.ts",
  "code/src/shared/refusal.ts",
  "code/src/shared/select/",
  "code/src/shared/value/",
  "code/src/product/worksite_effect.ts",
  "code/src/product/native_workspace_work.ts",
  "code/src/abg/event_prefix.ts",
  "code/src/abg/event_store.ts",
  "code/src/abg/runtime_liveness_contracts.ts",
  "code/src/abg/c_call_outcome.ts",
  "code/src/abg/native_work_effect.ts",
  calculusRoot,
];

// Each entry names the file, the exact trimmed line text, its line at the
// commit that added it, and the reason it is not an offender.
const ALLOWED = [];

async function typescriptFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await typescriptFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".ts")) files.push(path);
  }
  return files.sort();
}

// The repository path of a relative specifier, `.js` read as its `.ts` source;
// null for a package specifier.
function targetOf(file, specifier) {
  if (!specifier.startsWith(".")) return null;
  return relative(root, resolve(dirname(file), specifier)).replace(/\.js$/u, ".ts");
}

const admitted = (target) => target !== null &&
  ADMITTED.some((entry) => entry.endsWith("/") ? target.startsWith(entry) : target === entry);

const findings = [];
const files = await typescriptFiles(join(root, calculusRoot));
for (const file of files) {
  const path = relative(root, file);
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const check = (node, specifier) => {
    if (!ts.isStringLiteralLike(specifier) || admitted(targetOf(file, specifier.text))) return;
    const line = sourceFile.getLineAndCharacterOfPosition(specifier.getStart(sourceFile)).line + 1;
    findings.push({ path, line, text: lines[line - 1].trim() });
  };
  const visit = (node) => {
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier !== undefined) {
      check(node, node.moduleSpecifier);
    } else if (ts.isImportEqualsDeclaration(node) && ts.isExternalModuleReference(node.moduleReference)) {
      check(node, node.moduleReference.expression);
    } else if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0) {
      check(node, node.arguments[0]);
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      check(node, node.argument.literal);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

const allowedFor = (finding) =>
  ALLOWED.find((entry) => entry.path === finding.path && entry.text === finding.text);
const offenders = findings.filter((finding) => allowedFor(finding) === undefined);
const stale = ALLOWED.filter((entry) => !findings.some((finding) => allowedFor(finding) === entry));

for (const offender of offenders) console.error(`${offender.path}:${offender.line}: ${offender.text}`);
for (const entry of stale) console.error(`${entry.path}:${entry.line}: allow-list entry matches no line: ${entry.text}`);
if (offenders.length > 0 || stale.length > 0) {
  console.error(
    `check-calculus-boundary: ${offenders.length} offender(s), ${stale.length} stale allow-list entr${stale.length === 1 ? "y" : "ies"}`,
  );
  process.exit(1);
}
console.log(
  `check-calculus-boundary: ${files.length} modules under ${calculusRoot}; ${findings.length} allow-listed import(s), no offender`,
);
