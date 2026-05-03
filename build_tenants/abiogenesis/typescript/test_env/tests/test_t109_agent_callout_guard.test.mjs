import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TENANT_ROOT = path.resolve(TEST_DIR, "..", "..");

const SCAN_TARGETS = Object.freeze([
  "code/src/abg/m03/transport",
  "code/src/abg/m03/runner",
  "code/src/shared/abg_library",
  "test_env/live",
  "test_env/sandbox/mini_dm_redux/fp_worker.mjs"
]);

const ALLOWED_PREFIXES = Object.freeze([
  "code/src/shared/traced_process/"
]);

const VIOLATION_PATTERNS = Object.freeze([
  /from\s+["']node:child_process["']/u,
  /require\(\s*["']node:child_process["']\s*\)/u,
  /\bspawn\s*\(/u,
  /\bspawnSync\s*\(/u
]);

async function pathExists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectFiles(targetPath) {
  const absolutePath = path.join(TENANT_ROOT, targetPath);
  if (!(await pathExists(absolutePath))) {
    return [];
  }
  const stats = await stat(absolutePath);
  if (stats.isFile()) {
    return [targetPath];
  }
  const out = [];
  const entries = await readdir(absolutePath, { withFileTypes: true });
  for (const entry of entries) {
    const relativePath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectFiles(relativePath)));
    } else if (entry.isFile() && /\.(?:ts|mjs)$/u.test(entry.name)) {
      out.push(relativePath);
    }
  }
  return out;
}

function isAllowed(relativePath) {
  return ALLOWED_PREFIXES.some((prefix) => relativePath.startsWith(prefix));
}

test("T-109 guard: framework agent call-outs do not own direct child_process execution", async () => {
  const files = (
    await Promise.all(SCAN_TARGETS.map((target) => collectFiles(target)))
  ).flat();
  const violations = [];
  for (const relativePath of files) {
    if (isAllowed(relativePath)) {
      continue;
    }
    const source = await readFile(path.join(TENANT_ROOT, relativePath), "utf8");
    for (const pattern of VIOLATION_PATTERNS) {
      if (pattern.test(source)) {
        violations.push(`${relativePath}: ${pattern}`);
      }
    }
  }

  assert.deepStrictEqual(violations, []);
});
