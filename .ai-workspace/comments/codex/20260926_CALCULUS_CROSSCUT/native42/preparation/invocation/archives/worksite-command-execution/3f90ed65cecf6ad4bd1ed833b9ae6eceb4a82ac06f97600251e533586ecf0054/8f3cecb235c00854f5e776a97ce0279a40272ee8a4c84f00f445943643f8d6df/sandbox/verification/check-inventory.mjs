// Design-selected verifier for obligations 2, 3, 10 and 13.
// Read-only: never imports or executes subject code, spawns nothing, writes nothing.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let checks = 0;
let failures = 0;
const cache = new Map();

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
  if (cache.has(rel)) return cache.get(rel);
  let text = null;
  try {
    const bytes = fs.readFileSync(path.join(root, rel));
    console.log(`digest ${rel} sha256:${crypto.createHash("sha256").update(bytes).digest("hex")}`);
    text = bytes.toString("utf8");
  } catch {
    text = null;
  }
  cache.set(rel, text);
  return text;
}

function listFiles(relDir) {
  const out = [];
  const walk = (rel) => {
    for (const entry of fs.readdirSync(path.join(root, relDir, rel), { withFileTypes: true })) {
      const child = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(child);
      else out.push(child);
    }
  };
  walk("");
  return out.sort();
}

const SURFACES = [
  "specification/project-conformance.md",
  "design/implementation-design.md",
  "package.json",
  "src/hello.mjs",
  "design/test-design.md",
  "test/component/hello.test.mjs",
  "test/uat/hello.uat.test.mjs",
  "test-execution-plan.json",
];

const EXACT_SETS = {
  specification: ["project-conformance.md"],
  design: ["implementation-design.md", "test-design.md"],
  src: ["hello.mjs"],
  test: ["component/hello.test.mjs", "uat/hello.uat.test.mjs"],
  verification: [
    "check-derivation.mjs",
    "check-documents.mjs",
    "check-inventory.mjs",
    "check-package.mjs",
    "check-plan.mjs",
    "check-verifier-structure.mjs",
  ],
};

const ALLOWED_ROOT = new Set([
  ".abiogenesis",
  "semantic-assets",
  "execution-evidence",
  "original-js-sdlc-bootstrap-declaration.txt",
  "package.json",
  "test-execution-plan.json",
  "specification",
  "design",
  "src",
  "test",
  "verification",
]);
const NOT_DESCENDED = new Set([".abiogenesis", "semantic-assets", "execution-evidence"]);
const SUSPECT_ROOT = /\.(m?js|cjs|sh)$|result|ledger|registry|controller|scheduler/i;
const RESULT_NAME = /execution[-_ ]?result/i;
const MACHINERY = ["odd_sdlc", "abiogenesis", "ledger", "registry", "controller", "scheduler", "child_process", "node:net", "node:http"];

// (a) Each governed surface is a non-empty regular file.
for (const rel of SURFACES) {
  const reasons = [];
  try {
    const stat = fs.lstatSync(path.join(root, rel));
    if (!stat.isFile()) reasons.push("not a regular file");
    else if (stat.size === 0) reasons.push("empty file");
    else read(rel);
  } catch {
    reasons.push("missing");
  }
  check(`surface:${rel}`, reasons);
}

// (b) Subject directories hold exactly the designed files.
const listed = {};
for (const [dir, expected] of Object.entries(EXACT_SETS)) {
  const reasons = [];
  try {
    listed[dir] = listFiles(dir);
    const actual = listed[dir];
    const extra = actual.filter((f) => !expected.includes(f));
    const missing = expected.filter((f) => !actual.includes(f));
    if (extra.length) reasons.push(`unexpected ${extra.join(", ")}`);
    if (missing.length) reasons.push(`missing ${missing.join(", ")}`);
  } catch {
    listed[dir] = [];
    reasons.push("directory missing or unreadable");
  }
  check(`exact-set:${dir}`, reasons);
}

// (c) No authored execution-result file in subject directories or at the root.
let rootEntries = [];
try {
  rootEntries = fs.readdirSync(root, { withFileTypes: true });
} catch {
  rootEntries = [];
}
{
  const reasons = [];
  for (const [dir, files] of Object.entries(listed)) {
    for (const f of files) {
      if (RESULT_NAME.test(path.basename(f))) reasons.push(`${dir}/${f}`);
    }
  }
  for (const entry of rootEntries) {
    if (!entry.isDirectory() && RESULT_NAME.test(entry.name)) reasons.push(entry.name);
  }
  check("no-authored-result", reasons.map((r) => `authored result file ${r}`));
}

// (d) Root entries: no node_modules or bin; unknown entries must not look like machinery.
{
  const reasons = [];
  if (rootEntries.length === 0) reasons.push("root unreadable");
  for (const entry of rootEntries) {
    const name = entry.name;
    if (name === "node_modules" || name === "bin") {
      reasons.push(`forbidden root entry ${name}`);
      continue;
    }
    if (ALLOWED_ROOT.has(name) || NOT_DESCENDED.has(name)) continue;
    if (SUSPECT_ROOT.test(name)) reasons.push(`suspect root entry ${name}`);
    else console.log(`note ${name}`);
  }
  check("root-entries", reasons);
}

// (e) No copied machinery in package, source, verifiers or plan. Documents are exempt.
for (const rel of ["package.json", "src/hello.mjs", "test/component/hello.test.mjs", "test/uat/hello.uat.test.mjs", "test-execution-plan.json"]) {
  const reasons = [];
  const text = read(rel);
  if (text === null) {
    reasons.push("missing or unreadable");
  } else {
    if (rel === "src/hello.mjs") {
      if (/\bimport\b/.test(text)) reasons.push("import token");
      if (text.includes("require(")) reasons.push("require( token");
    }
    const lower = text.toLowerCase();
    for (const token of MACHINERY) {
      if (lower.includes(token)) reasons.push(`contains ${token}`);
    }
  }
  check(`no-copied-machinery:${rel}`, reasons);
}

console.log(`check-inventory: ${checks} checks, ${failures} failures`);
if (failures > 0) process.exitCode = 1;
