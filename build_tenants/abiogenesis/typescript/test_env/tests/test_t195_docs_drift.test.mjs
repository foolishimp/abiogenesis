// Validates: T-195 (codex finding) — docs surfaces are drift-witnessed:
// README/guide version lines move with the package version or the suite
// is red (the 4.1.0-rc.12 staleness class).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const TENANT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);
const REPO_ROOT = path.resolve(TENANT_ROOT, "..", "..", "..");

test("T-195 docs surfaces carry only the current version line", () => {
  const pkg = JSON.parse(
    readFileSync(path.join(TENANT_ROOT, "package.json"), "utf8")
  );
  for (const rel of [
    "docs/README.md",
    "docs/USER_GUIDE.md",
    "docs/LLM_GTL_APP_BUILDER_GUIDE.md"
  ]) {
    const text = readFileSync(path.join(REPO_ROOT, rel), "utf8");
    const versions = [...text.matchAll(/\b4\.\d+\.\d+-rc\.\d+\b/g)].map(
      (m) => m[0]
    );
    for (const version of versions) {
      assert.equal(
        version,
        pkg.version,
        `${rel} advertises ${version} while the package is ${pkg.version}`
      );
    }
  }
});
