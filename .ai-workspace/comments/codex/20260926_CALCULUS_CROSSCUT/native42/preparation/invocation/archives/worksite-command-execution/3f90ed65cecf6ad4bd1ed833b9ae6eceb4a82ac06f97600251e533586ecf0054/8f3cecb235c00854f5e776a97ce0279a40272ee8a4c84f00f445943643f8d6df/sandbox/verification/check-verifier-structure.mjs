// Design-selected verifier for obligations 2, 7, 8, 10 and 11.
// Reads the verifier files as text only; never imports or executes them or src/hello.mjs.
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
  return reasons.length === 0;
}

function read(rel) {
  try {
    const bytes = fs.readFileSync(path.join(root, rel));
    const digest = crypto.createHash("sha256").update(bytes).digest("hex");
    console.log(`digest ${rel} sha256:${digest}`);
    return { text: bytes.toString("utf8"), digest };
  } catch {
    return null;
  }
}

const ALLOWED_SPECIFIERS = new Set(["node:test", "node:assert/strict", "../../src/hello.mjs"]);
const SUITES = [
  { suite: "component", rel: "test/component/hello.test.mjs", prefix: "component:" },
  { suite: "uat", rel: "test/uat/hello.uat.test.mjs", prefix: "uat:" },
];

const singleTest = {};
const testCounts = {};
const digests = {};

for (const { suite, rel, prefix } of SUITES) {
  const file = read(rel);
  const text = file ? file.text : null;
  const absent = [`${rel} missing or unreadable`];
  const has = (needle) => (text !== null && text.includes(needle) ? [] : text === null ? absent : [`lacks '${needle}'`]);
  digests[suite] = file ? file.digest : null;

  check(`${suite}-node-test`, has('import { test } from "node:test"'));
  check(`${suite}-assert-strict`, has('import assert from "node:assert/strict"'));
  check(`${suite}-exact-import`, has('import { helloWorld } from "../../src/hello.mjs"'));

  {
    const reasons = [];
    if (text === null) {
      reasons.push(...absent);
    } else {
      const specifiers = [
        ...[...text.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]),
        ...[...text.matchAll(/import\(\s*["']([^"']+)["']/g)].map((m) => m[1]),
      ];
      for (const specifier of specifiers) {
        if (!ALLOWED_SPECIFIERS.has(specifier)) reasons.push(`unexpected specifier ${specifier}`);
      }
    }
    check(`${suite}-import-set`, reasons);
  }

  {
    const resolved = path.resolve(path.dirname(path.join(root, rel)), "../../src/hello.mjs");
    const subject = path.join(root, "src/hello.mjs");
    const reasons = [];
    if (resolved !== subject) reasons.push(`specifier resolves to ${resolved}`);
    if (!fs.existsSync(subject)) reasons.push("src/hello.mjs missing");
    check(`${suite}-resolves-to-subject`, reasons);
  }

  check(`${suite}-strict-assertion`, has('assert.strictEqual(helloWorld(), "Hello, world!")'));
  check(`${suite}-name-prefix`, has(`test("${prefix}`));

  {
    const count = text === null ? 0 : (text.match(/\btest\(/g) || []).length;
    testCounts[suite] = count;
    singleTest[suite] = check(`${suite}-single-test`, text === null ? absent : count === 1 ? [] : [`test( occurs ${count} times`]);
  }

  {
    const reasons = [];
    if (text === null) reasons.push(...absent);
    else {
      if (text.includes("describe(")) reasons.push("contains describe(");
      if (text.includes("suite(")) reasons.push("contains suite(");
      if (/\bit\(/.test(text)) reasons.push("contains it(");
    }
    check(`${suite}-no-other-test-forms`, reasons);
  }

  {
    const reasons = [];
    if (text === null) reasons.push(...absent);
    else {
      const lower = text.toLowerCase();
      for (const token of ["skip", "todo", ".only"]) {
        if (lower.includes(token)) reasons.push(`contains ${token}`);
      }
    }
    check(`${suite}-no-skip-or-focus`, reasons);
  }

  {
    const reasons = [];
    if (text === null) reasons.push(...absent);
    else {
      for (const token of ["console.", "process.", "stdout", "child_process", "mock"]) {
        if (text.includes(token)) reasons.push(`contains ${token}`);
      }
    }
    check(`${suite}-no-doubles-or-output`, reasons);
  }
}

{
  const reasons = [];
  if (!digests.component || !digests.uat) reasons.push("a verifier file is missing");
  else if (digests.component === digests.uat) reasons.push("verifier files are identical");
  check("verifiers-distinct", reasons);
}

{
  const total = (testCounts.component || 0) + (testCounts.uat || 0);
  check("verifiers-total-tests", total === 2 ? [] : [`test( occurs ${total} times across both files`]);
}

// Static basis of rule D-suite; not an observation of any run.
if (singleTest.component && singleTest.uat) {
  console.log("note suite-attribution-basis component=1 uat=1");
}

console.log(`check-verifier-structure: ${checks} checks, ${failures} failures`);
if (failures > 0) process.exitCode = 1;
