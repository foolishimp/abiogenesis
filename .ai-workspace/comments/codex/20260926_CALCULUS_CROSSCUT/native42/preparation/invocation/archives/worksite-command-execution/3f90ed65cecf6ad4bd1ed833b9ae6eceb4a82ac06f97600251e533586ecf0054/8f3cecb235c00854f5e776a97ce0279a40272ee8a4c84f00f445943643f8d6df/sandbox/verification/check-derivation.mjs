// Design-selected verifier for obligations 5, 6, 9 and 12.
// Checks named derivation edges and cross-surface facts. It cannot observe the
// admitted construction basis or write order; those are reported as notes.
// Read-only: never imports or executes subject code, spawns nothing, writes nothing.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let checks = 0;
let failures = 0;

const CONFORMANCE = "specification/project-conformance.md";
const IMPLEMENTATION = "design/implementation-design.md";
const PACKAGE = "package.json";
const SOURCE = "src/hello.mjs";
const TEST_DESIGN = "design/test-design.md";
const COMPONENT = "test/component/hello.test.mjs";
const UAT = "test/uat/hello.uat.test.mjs";
const PLAN = "test-execution-plan.json";
const SURFACES = [CONFORMANCE, IMPLEMENTATION, PACKAGE, SOURCE, TEST_DESIGN, COMPONENT, UAT, PLAN];

function check(id, reasons) {
  checks += 1;
  if (reasons.length === 0) {
    console.log(`ok ${id}`);
  } else {
    failures += 1;
    console.log(`not ok ${id} - ${reasons.join("; ")}`);
  }
}

const bytes = {};
const texts = {};
for (const rel of SURFACES) {
  try {
    bytes[rel] = fs.readFileSync(path.join(root, rel));
    texts[rel] = bytes[rel].toString("utf8");
  } catch {
    bytes[rel] = null;
    texts[rel] = null;
  }
}

function parse(rel) {
  if (texts[rel] === null) return null;
  try {
    return JSON.parse(texts[rel]);
  } catch {
    return null;
  }
}
const pkg = parse(PACKAGE);
const plan = parse(PLAN);

function contains(rel, needles) {
  if (texts[rel] === null) return [`${rel} missing or unreadable`];
  return needles.filter((n) => !texts[rel].includes(n)).map((n) => `${rel} lacks '${n}'`);
}

const EDGES = [
  ["edge-conformance-design", () => [
    ...contains(IMPLEMENTATION, ["Authority: specification/project-conformance.md"]),
    ...contains(CONFORMANCE, ["design/implementation-design.md"]),
  ]],
  ["edge-design-source", () => [
    ...contains(SOURCE, ["design/implementation-design.md"]),
    ...contains(IMPLEMENTATION, ["private", "module"]),
    ...(pkg === null ? [`${PACKAGE} missing or unparsable`] : []),
    ...(pkg !== null && pkg.private !== true ? ["package.json private is not true"] : []),
    ...(pkg !== null && pkg.type !== "module" ? ["package.json type is not module"] : []),
  ]],
  ["edge-source-test-design", () => contains(TEST_DESIGN, ["Evidence source: package.json and src/hello.mjs"])],
  ["edge-test-design-component", () => contains(COMPONENT, ["design/test-design.md", "src/hello.mjs"])],
  ["edge-to-uat", () => contains(UAT, ["test/component/hello.test.mjs", "design/test-design.md", "src/hello.mjs"])],
  ["edge-verifiers-plan", () => {
    if (plan === null) return [`${PLAN} missing or unparsable`];
    const reasons = [];
    const expected = JSON.stringify([COMPONENT, UAT]);
    if (JSON.stringify(plan.derivedFrom) !== expected) reasons.push(`derivedFrom is ${JSON.stringify(plan.derivedFrom)}`);
    if (!Array.isArray(plan.args) || JSON.stringify(plan.derivedFrom) !== JSON.stringify(plan.args.slice(1))) {
      reasons.push("derivedFrom does not equal args.slice(1)");
    }
    return reasons;
  }],
];

for (const [id, evaluate] of EDGES) check(id, evaluate());

const FACT_FILES = [IMPLEMENTATION, TEST_DESIGN, SOURCE, COMPONENT, UAT];
check("fact-function-name", FACT_FILES.flatMap((rel) => contains(rel, ["helloWorld"])));
check("fact-return-value", [
  ...FACT_FILES.flatMap((rel) => contains(rel, ["Hello, world!"])),
  ...(plan === null ? [`${PLAN} missing or unparsable`] : plan.assertedReturnValue === "Hello, world!" ? [] : ["assertedReturnValue differs"]),
]);
check("fact-module-path", [IMPLEMENTATION, TEST_DESIGN].flatMap((rel) => contains(rel, ["src/hello.mjs"])));
check("fact-verifier-paths", [
  ...[IMPLEMENTATION, TEST_DESIGN].flatMap((rel) => contains(rel, [COMPONENT, UAT])),
  ...(plan === null || !Array.isArray(plan.args)
    ? [`${PLAN} args unavailable`]
    : [COMPONENT, UAT].filter((rel) => !plan.args.includes(rel)).map((rel) => `plan args lack ${rel}`)),
]);

for (const rel of SURFACES) {
  if (bytes[rel] === null) console.log(`digest ${rel} missing`);
  else console.log(`digest ${rel} sha256:${crypto.createHash("sha256").update(bytes[rel]).digest("hex")}`);
}
for (const [id] of EDGES) console.log(`note construction-basis-not-admitted ${id}`);
console.log("note derivation-order-not-observable");

console.log(`check-derivation: ${checks} checks, ${failures} failures`);
if (failures > 0) process.exitCode = 1;
