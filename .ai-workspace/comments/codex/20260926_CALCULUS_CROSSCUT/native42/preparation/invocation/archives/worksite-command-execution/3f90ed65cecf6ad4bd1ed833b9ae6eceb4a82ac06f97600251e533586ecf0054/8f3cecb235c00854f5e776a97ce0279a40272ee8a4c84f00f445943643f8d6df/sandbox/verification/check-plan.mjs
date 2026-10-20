// Design-selected verifier for obligations 9, 10, 11 and 14.
// Read-only: never imports or executes subject code, spawns nothing, writes nothing.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let checks = 0;
let failures = 0;

// The design's literal planned-verifier-run arguments.
const PLANNED_ARGS = ["--test", "test/component/hello.test.mjs", "test/uat/hello.uat.test.mjs"];
// The literal of the planned-run-pass-floor predicate.
const PASS_FLOOR_LITERAL = 2;
// The source's expectedReturnValue.
const EXPECTED_RETURN_VALUE = "Hello, world!";
const VERIFIERS = ["test/component/hello.test.mjs", "test/uat/hello.uat.test.mjs"];
const OBSERVED_RESULT_KEYS = ["executionStatus", "planSatisfied", "observedTestPassCount", "stdoutDigest", "observedReturnValue", "result", "results"];

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

const planText = read("test-execution-plan.json");
const verifierTexts = VERIFIERS.map((rel) => read(rel));

let plan = null;
let parseReason = null;
if (planText === null) {
  parseReason = "test-execution-plan.json missing or unreadable";
} else {
  try {
    plan = JSON.parse(planText);
    if (plan === null || typeof plan !== "object" || Array.isArray(plan)) {
      parseReason = "plan is not a JSON object";
      plan = null;
    }
  } catch (error) {
    parseReason = `plan does not parse: ${error.message}`;
  }
}

function planCheck(id, evaluate) {
  check(id, plan === null ? [parseReason] : evaluate(plan));
}

check("plan-parses", parseReason ? [parseReason] : []);
planCheck("plan-command", (p) => (p.command === "node" ? [] : [`command is ${JSON.stringify(p.command)}`]));
planCheck("plan-args", (p) => (JSON.stringify(p.args) === JSON.stringify(PLANNED_ARGS) ? [] : [`args are ${JSON.stringify(p.args)}`]));
planCheck("plan-args-exist", (p) => {
  if (!Array.isArray(p.args)) return ["args is not an array"];
  const listed = p.args.filter((a) => typeof a === "string" && !a.startsWith("--"));
  if (listed.length !== 2) return [`args list ${listed.length} files`];
  return listed.filter((rel) => !fs.existsSync(path.join(root, rel))).map((rel) => `${rel} does not exist`);
});
planCheck("plan-pass-floor", (p) =>
  Number.isInteger(p.expectedTestPassCount) && p.expectedTestPassCount >= 2 ? [] : [`expectedTestPassCount is ${JSON.stringify(p.expectedTestPassCount)}`],
);
planCheck("plan-pass-floor-achievable", (p) => {
  if (verifierTexts.some((t) => t === null)) return ["a verifier file is missing"];
  const declared = verifierTexts.reduce((sum, t) => sum + (t.match(/\btest\(/g) || []).length, 0);
  return typeof p.expectedTestPassCount === "number" && p.expectedTestPassCount <= declared
    ? []
    : [`expectedTestPassCount ${JSON.stringify(p.expectedTestPassCount)} exceeds ${declared} declared tests`];
});
planCheck("plan-pass-floor-matches-predicate", (p) =>
  p.expectedTestPassCount === PASS_FLOOR_LITERAL ? [] : [`expectedTestPassCount ${JSON.stringify(p.expectedTestPassCount)} differs from predicate literal ${PASS_FLOOR_LITERAL}`],
);
planCheck("plan-stdout-match", (p) =>
  typeof p.expectedStdoutMatch === "string" && p.expectedStdoutMatch.includes("fail 0") ? [] : [`expectedStdoutMatch is ${JSON.stringify(p.expectedStdoutMatch)}`],
);
planCheck("plan-no-pass-pin", (p) =>
  typeof p.expectedStdoutMatch === "string" && /pass\s*\d/i.test(p.expectedStdoutMatch) ? ["expectedStdoutMatch pins a pass count"] : [],
);
planCheck("plan-asserted-return-value", (p) =>
  p.assertedReturnValue === EXPECTED_RETURN_VALUE ? [] : [`assertedReturnValue is ${JSON.stringify(p.assertedReturnValue)}`],
);
planCheck("plan-no-observed-result", (p) => OBSERVED_RESULT_KEYS.filter((k) => Object.hasOwn(p, k)).map((k) => `contains ${k}`));

console.log(`check-plan: ${checks} checks, ${failures} failures`);
if (failures > 0) process.exitCode = 1;
