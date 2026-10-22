// Lifecycle boundary (design §9.1). Lifecycle questions about actor processes
// are answered from the fold through `holdsAt`, and only the process owners
// read the physical facts. Outside code/src/abg/calculus/, a `.ts` file under
// code/src fails this check when it
//   - writes a lifecycle fluent name in any position other than the `name` of
//     a pattern passed to `holdsAt`
//     (`holdsAt(state, constructRuntimeFluentPattern({ name: "<fluent>", ... }))`
//     or `holdsAt(state, { name: "<fluent>", ... })`), or
//   - reads `scopeAbsence` or `directExit` (property access, element access or
//     destructuring) outside the process owners listed below.
// `actor_process_termination_unconfirmed` is also a process terminal event
// kind. That spelling is an event kind, not a fluent name, where it is
// compared with a `.kind`, is a `kind:` member, is a `case` of a switch on a
// `.kind`, is the argument of a same-file function parameter named `kind`, or
// is an element of an array bound to a name containing `EVENT_KIND`.
// Offenders print as `path:line: text`; any offender, or an allow-list entry
// that matches no line, exits 1.
import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = join(root, "code/src");
const calculusRoot = "code/src/abg/calculus/";

const LIFECYCLE_FLUENTS = new Set([
  "actor_process_live",
  "actor_process_terminated",
  "actor_process_termination_unconfirmed",
  "actor_cleanup_pending",
  "terminationConfirmed_copy_disagrees",
]);
const ALSO_EVENT_KINDS = new Set(["actor_process_termination_unconfirmed"]);
const PROCESS_FACTS = new Set(["scopeAbsence", "directExit"]);
const PROCESS_FACT_OWNERS = [
  "code/src/shared/process/",
  "code/src/shared/owned_process_lifetime.ts",
  "code/src/abg/worker_transport.ts",
  "code/src/abg/actor_process.ts",
  "code/src/implementation/worksite_command_helper.ts",
];

// Each entry names the file, the exact trimmed line text, its line at the
// commit that added it, and the reason it is not an offender.
const ALLOWED = [
  ...[
    [638, 'const processLive = lifecycle("actor_process_live");'],
    [639, 'const terminationUnconfirmed = lifecycle("actor_process_termination_unconfirmed");'],
    [640, 'const cleanupPending = lifecycle("actor_cleanup_pending");'],
  ].map(([line, text]) => ({
    path: "code/src/abg/actor_process.ts", line, text,
    reason: "argument of the local `lifecycle` reader (:636-637), whose only use of it is the `name` of the holdsAt pattern",
  })),
  ...[
    [322, '"actor_cleanup_pending",'],
    [329, '"actor_process_live",'],
    [349, '"actor_process_terminated",'],
    [350, '"actor_process_termination_unconfirmed",'],
    [362, '"terminationConfirmed_copy_disagrees",'],
  ].map(([line, text]) => ({
    path: "code/src/abg/replay.ts", line, text,
    reason: "Run quiescence name table: classifies each fluent of the folded held set as blocking or historical; constructs no fluent and re-derives no lifecycle fact",
  })),
  ...[
    [66, "record(facts.directExit) && hasExactKeys(facts.directExit, [\"signal\", \"status\"]) &&"],
    [68, "facts.directExit.status === transport.status && facts.directExit.signal === transport.signal;"],
  ].map(([line, text]) => ({
    path: "code/src/abg/worksite_construction_recovery.ts", line, text,
    reason: "verifies the digest-bound transport artifact's encoded facts against the same artifact's exit (referenced evidence, design §9.1); not a lifecycle question",
  })),
];

async function typescriptFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await typescriptFiles(path));
    else if (entry.isFile() && entry.name.endsWith(".ts")) files.push(path);
  }
  return files.sort();
}

const calleeName = (call) =>
  ts.isIdentifier(call.expression) ? call.expression.text
    : ts.isPropertyAccessExpression(call.expression) ? call.expression.name.text : null;
const isCallTo = (node, name) => node !== undefined && ts.isCallExpression(node) && calleeName(node) === name;
const isKindAccess = (node) => ts.isPropertyAccessExpression(node) && node.name.text === "kind";
const propertyNamed = (node, name) =>
  ts.isPropertyAssignment(node) && (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name)) && node.name.text === name;

// The literal is the `name` of a fluent pattern that is itself an argument of
// holdsAt, directly or through constructRuntimeFluentPattern.
function isHoldsAtPatternName(literal) {
  const member = literal.parent;
  if (!propertyNamed(member, "name") || member.initializer !== literal) return false;
  const object = member.parent;
  let argument = object;
  if (isCallTo(object.parent, "constructRuntimeFluentPattern") && object.parent.arguments.includes(object)) {
    argument = object.parent;
  }
  return isCallTo(argument.parent, "holdsAt") && argument.parent.arguments.includes(argument);
}

// The same-file function bound to `name`, if any.
function localFunction(sourceFile, name) {
  let found = null;
  const visit = (node) => {
    if (found !== null) return;
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) found = node;
    else if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === name &&
      node.initializer !== undefined &&
      (ts.isArrowFunction(node.initializer) || ts.isFunctionExpression(node.initializer))) found = node.initializer;
    else ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  return found;
}

function isEventKindPosition(literal, sourceFile) {
  const parent = literal.parent;
  if (ts.isBinaryExpression(parent) &&
    [ts.SyntaxKind.EqualsEqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsEqualsToken,
      ts.SyntaxKind.EqualsEqualsToken, ts.SyntaxKind.ExclamationEqualsToken].includes(parent.operatorToken.kind)) {
    return isKindAccess(parent.left === literal ? parent.right : parent.left);
  }
  if (propertyNamed(parent, "kind") && parent.initializer === literal) return true;
  if (ts.isCaseClause(parent) && isKindAccess(parent.parent.parent.expression)) return true;
  if (ts.isCallExpression(parent) && ts.isIdentifier(parent.expression)) {
    const index = parent.arguments.indexOf(literal);
    const parameter = localFunction(sourceFile, parent.expression.text)?.parameters[index];
    return parameter !== undefined && ts.isIdentifier(parameter.name) && parameter.name.text === "kind";
  }
  if (ts.isArrayLiteralExpression(parent)) {
    let holder = parent.parent;
    while (holder !== undefined && !ts.isVariableDeclaration(holder) && !ts.isPropertyAssignment(holder) &&
      !ts.isSourceFile(holder)) holder = holder.parent;
    return holder !== undefined && !ts.isSourceFile(holder) && /EVENT_KIND/u.test(holder.name.getText(sourceFile));
  }
  return false;
}

function factMemberRead(node) {
  if (ts.isPropertyAccessExpression(node)) return PROCESS_FACTS.has(node.name.text);
  if (ts.isElementAccessExpression(node)) {
    return ts.isStringLiteralLike(node.argumentExpression) && PROCESS_FACTS.has(node.argumentExpression.text);
  }
  if (ts.isBindingElement(node) && ts.isObjectBindingPattern(node.parent)) {
    const name = node.propertyName ?? node.name;
    return (ts.isIdentifier(name) || ts.isStringLiteral(name)) && PROCESS_FACTS.has(name.text);
  }
  return false;
}

const findings = [];
const files = await typescriptFiles(sourceRoot);
for (const file of files) {
  const path = relative(root, file);
  if (path.startsWith(calculusRoot)) continue;
  const text = await readFile(file, "utf8");
  const lines = text.split("\n");
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const factOwner = PROCESS_FACT_OWNERS.some((owner) => owner.endsWith("/") ? path.startsWith(owner) : path === owner);
  const record = (node) => {
    const line = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
    findings.push({ path, line, text: lines[line - 1].trim() });
  };
  const visit = (node) => {
    if (ts.isStringLiteralLike(node) && LIFECYCLE_FLUENTS.has(node.text) && !isHoldsAtPatternName(node) &&
      !(ALSO_EVENT_KINDS.has(node.text) && isEventKindPosition(node, sourceFile))) record(node);
    else if (!factOwner && factMemberRead(node)) record(node);
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
}

const unique = [...new Map(findings.map((finding) => [`${finding.path}:${finding.line}`, finding])).values()];
const allowedFor = (finding) =>
  ALLOWED.find((entry) => entry.path === finding.path && entry.text === finding.text);
const offenders = unique.filter((finding) => allowedFor(finding) === undefined);
const stale = ALLOWED.filter((entry) => !unique.some((finding) => allowedFor(finding) === entry));

for (const offender of offenders) console.error(`${offender.path}:${offender.line}: ${offender.text}`);
for (const entry of stale) console.error(`${entry.path}:${entry.line}: allow-list entry matches no line: ${entry.text}`);
if (offenders.length > 0 || stale.length > 0) {
  console.error(
    `check-lifecycle-boundary: ${offenders.length} offender(s), ${stale.length} stale allow-list entr${stale.length === 1 ? "y" : "ies"}`,
  );
  process.exit(1);
}
console.log(
  `check-lifecycle-boundary: ${files.length} modules under code/src; ${unique.length - offenders.length} allow-listed site(s), no offender`,
);
