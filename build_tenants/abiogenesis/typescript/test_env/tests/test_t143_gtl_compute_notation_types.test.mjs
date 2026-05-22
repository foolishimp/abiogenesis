// Validates: T-143
// Validates: REQ-L-GTL3-COMPUTE-NOTATION
// Validates: REQ-R-ABG3-FN-COMPOSITION
// Validates: REQ-L-GTL3-EVALUATOR
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-ASSURANCE

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(testDir, "..", "..");
const tscBin = join(packageRoot, "node_modules", "typescript", "bin", "tsc");
const tsconfigPath = join(
  packageRoot,
  "test_env",
  "type_tests",
  "tsconfig.t143.json"
);

test("T-143 GTL compute notation rejects impossible authority states", () => {
  try {
    execFileSync(process.execPath, [tscBin, "-p", tsconfigPath], {
      cwd: packageRoot,
      encoding: "utf8",
      stdio: "pipe"
    });
  } catch (error) {
    const stdout =
      error && typeof error === "object" && "stdout" in error
        ? String(error.stdout)
        : "";
    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? String(error.stderr)
        : "";

    assert.fail(`${stdout}\n${stderr}`);
  }
});
