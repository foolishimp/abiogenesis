// Validates: B-083
// Validates: sandbox-source-root-hygiene

import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { liveTestArchiveRoot } from "../live/archive_root.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");

function collectFiles(root, predicate) {
  const files = [];
  const stack = [root];
  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const child = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(child);
      } else if (predicate(child)) {
        files.push(path.relative(REPO_ROOT, child));
      }
    }
  }
  return files.sort();
}

test("B-083 keeps Python replay Scala sources out of source-root fixture trees", () => {
  const pythonFixtures = path.join(REPO_ROOT, "build_tenants/python/test_env/fixtures");
  const scalaFiles = collectFiles(pythonFixtures, (candidate) => candidate.endsWith(".scala"));
  assert.deepEqual(scalaFiles, []);
});

test("B-083 live run archives default outside the odd_sdlc source root", () => {
  const priorLiveRoot = process.env["ODD_SDLC_TS_LIVE_TEST_RUN_ROOT"];
  const priorTestRoot = process.env["ODD_SDLC_TS_TEST_RUN_ROOT"];
  delete process.env["ODD_SDLC_TS_LIVE_TEST_RUN_ROOT"];
  delete process.env["ODD_SDLC_TS_TEST_RUN_ROOT"];
  try {
    const archiveRoot = resolve(
      liveTestArchiveRoot("b083-hygiene", "20260507T000000000Z", 83083)
    );
    assert(
      archiveRoot !== REPO_ROOT && !archiveRoot.startsWith(`${REPO_ROOT}${path.sep}`),
      `live archive root must not be under source root: ${archiveRoot}`
    );
  } finally {
    if (priorLiveRoot === undefined) {
      delete process.env["ODD_SDLC_TS_LIVE_TEST_RUN_ROOT"];
    } else {
      process.env["ODD_SDLC_TS_LIVE_TEST_RUN_ROOT"] = priorLiveRoot;
    }
    if (priorTestRoot === undefined) {
      delete process.env["ODD_SDLC_TS_TEST_RUN_ROOT"];
    } else {
      process.env["ODD_SDLC_TS_TEST_RUN_ROOT"] = priorTestRoot;
    }
  }
});
