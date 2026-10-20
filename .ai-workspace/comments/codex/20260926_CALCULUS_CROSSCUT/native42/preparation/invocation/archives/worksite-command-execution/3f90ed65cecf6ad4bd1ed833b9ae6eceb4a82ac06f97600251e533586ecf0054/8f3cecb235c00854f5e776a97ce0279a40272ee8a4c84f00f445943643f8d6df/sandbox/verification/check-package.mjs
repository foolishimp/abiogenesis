// Design-selected verifier for obligations 1 and 2.
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

let text = null;
try {
  const bytes = fs.readFileSync(path.join(root, "package.json"));
  console.log(`digest package.json sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`);
  text = bytes.toString("utf8");
} catch {
  text = null;
}

let pkg = null;
let parseReason = null;
if (text === null) {
  parseReason = "package.json missing or unreadable";
} else {
  try {
    pkg = JSON.parse(text);
    if (pkg === null || typeof pkg !== "object" || Array.isArray(pkg)) {
      parseReason = "package.json is not a JSON object";
      pkg = null;
    }
  } catch (error) {
    parseReason = `package.json does not parse: ${error.message}`;
  }
}

check("package-parses", parseReason ? [parseReason] : []);
check("private-true", pkg === null ? [parseReason] : pkg.private === true ? [] : [`private is ${JSON.stringify(pkg.private)}`]);
check("type-module", pkg === null ? [parseReason] : pkg.type === "module" ? [] : [`type is ${JSON.stringify(pkg.type)}`]);
{
  const keys = pkg === null ? null : Object.keys(pkg).sort();
  check(
    "keys-exact",
    keys === null ? [parseReason] : JSON.stringify(keys) === JSON.stringify(["private", "type"]) ? [] : [`keys are ${JSON.stringify(keys)}`],
  );
}

console.log(`check-package: ${checks} checks, ${failures} failures`);
if (failures > 0) process.exitCode = 1;
