// Design-selected verifier for obligations 4, 5 and 6.
// Proves presence of required document elements, not faithfulness.
// Read-only: never imports or executes subject code, spawns nothing, writes nothing.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let checks = 0;
let failures = 0;

function check(id, reasons) {
  checks += 1;
  if (reasons.length === 0) {
    console.log(`ok ${id}`);
  } else {
    failures += 1;
    console.log(`not ok ${id} - ${reasons.join("; ")}`);
  }
}

function read(rel) {
  try {
    const bytes = fs.readFileSync(path.join(root, rel));
    console.log(`digest ${rel} sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`);
    return bytes.toString("utf8");
  } catch {
    return null;
  }
}

// Each needle is [text, exact]; non-exact needles compare case-insensitively.
function missing(text, rel, needles) {
  if (text === null) return [`${rel} missing or unreadable`];
  const lower = text.toLowerCase();
  const reasons = [];
  for (const [needle, exact] of needles) {
    const found = exact ? text.includes(needle) : lower.includes(needle.toLowerCase());
    if (!found) reasons.push(`${rel} lacks '${needle}'`);
  }
  return reasons;
}

const CONFORMANCE = "specification/project-conformance.md";
const IMPLEMENTATION = "design/implementation-design.md";
const TEST_DESIGN = "design/test-design.md";

const conformance = read(CONFORMANCE);
check("conformance-pressure", missing(conformance, CONFORMANCE, [["JavaScript Hello World software build traversal", false]]));
for (const name of [
  "implementation design",
  "source",
  "test design",
  "component test source",
  "UAT test source",
  "test execution plan",
  "test execution result",
]) {
  check(`conformance-surface:${name}`, missing(conformance, CONFORMANCE, [[name, false]]));
}
check(
  "conformance-ownership",
  missing(conformance, CONFORMANCE, [
    ["ABG owns startup admission, registry selection, graph-call opening, vector traversal, F_P dispatch, evidence admission, event emission, closure, and convergence.", true],
  ]),
);
check("conformance-authority-for-design", missing(conformance, CONFORMANCE, [["design/implementation-design.md", false]]));

const implementation = read(IMPLEMENTATION);
check("design-authority", missing(implementation, IMPLEMENTATION, [["Authority: specification/project-conformance.md", true]]));
check("design-module", missing(implementation, IMPLEMENTATION, [["helloWorld", false], ["Hello, world!", true]]));
for (const name of [
  "package.json",
  "src/hello.mjs",
  "design/test-design.md",
  "test/component/hello.test.mjs",
  "test/uat/hello.uat.test.mjs",
  "test-execution-plan.json",
  "execution result",
]) {
  check(`design-surface:${name}`, missing(implementation, IMPLEMENTATION, [[name, false]]));
}
check("design-package-fields", missing(implementation, IMPLEMENTATION, [["private", false], ["module", false]]));

const testDesign = read(TEST_DESIGN);
check("test-design-evidence-source", missing(testDesign, TEST_DESIGN, [["Evidence source: package.json and src/hello.mjs", true]]));
check(
  "test-design-component",
  missing(testDesign, TEST_DESIGN, [["test/component/hello.test.mjs", false], ["helloWorld", false], ["Hello, world!", true]]),
);
check("test-design-uat", missing(testDesign, TEST_DESIGN, [["test/uat/hello.uat.test.mjs", false], ["same exported function", false]]));
check("test-design-libraries", missing(testDesign, TEST_DESIGN, [["node:test", false], ["node:assert/strict", false]]));

console.log(`check-documents: ${checks} checks, ${failures} failures`);
if (failures > 0) process.exitCode = 1;
