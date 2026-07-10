import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  LivePluginArchiveError,
  openLivePluginArchive
} from "../../build/semantic/code/src/abg/m03/runner/live_plugin_archive.js";

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((key) => value[key] !== undefined)
        .map((key) => [key, canonicalize(value[key])])
    );
  }
  return value;
}

function digest(value) {
  const text = `${JSON.stringify(canonicalize(value), null, 2)}\n`;
  return createHash("sha256").update(text).digest("hex");
}

function inputFor(archiveRoot, suffix = "default", overrides = {}) {
  return {
    archiveRoot,
    cCallRef: `c-call://t217/archive-integrity/${suffix}`,
    seam: "dispatch",
    pluginRef: "plugin://t217/archive-integrity",
    capability: { agent: "generic", timeoutMs: 30000 },
    manifest: { manifestRef: `manifest://t217/${suffix}`, renderedPrompt: "run" },
    effectInput: { basisId: "basis://t217/archive-integrity", vectorIndex: 0 },
    ...overrides
  };
}

function fixture(label, options = {}) {
  const root = mkdtempSync(path.join(tmpdir(), `t217-archive-${label}-`));
  const input = inputFor(path.join(root, "archive"), label, options.input ?? {});
  const archive = openLivePluginArchive(input);
  assert.equal(archive.state, "fresh");
  if (options.artifact === true) {
    archive.writeText("artifact.txt", "before\n");
  }
  archive.complete({ status: "dispatched", evidenceRefs: ["evidence://t217/archive"] });
  return {
    root,
    input,
    bundleRoot: archive.bundleRoot,
    requestPath: path.join(archive.bundleRoot, "request.json"),
    completionPath: path.join(archive.bundleRoot, "completion.json")
  };
}

function rewriteJson(filePath, mutate) {
  const row = JSON.parse(readFileSync(filePath, "utf8"));
  mutate(row);
  writeFileSync(filePath, `${JSON.stringify(row, null, 2)}\n`, "utf8");
}

function assertArchiveCode(operation, code) {
  assert.throws(operation, (error) => {
    assert.equal(error instanceof LivePluginArchiveError, true);
    assert.equal(error.code, code);
    return true;
  });
}

test("R5 archive canonical JSON rejects non-finite and non-JSON effect truth", () => {
  const firstRoot = mkdtempSync(path.join(tmpdir(), "t217-archive-json-number-"));
  assert.throws(
    () =>
      openLivePluginArchive(
        inputFor(path.join(firstRoot, "archive"), "number", {
          capability: { timeoutMs: Number.POSITIVE_INFINITY }
        })
      ),
    /non-finite number/u
  );

  const secondRoot = mkdtempSync(path.join(tmpdir(), "t217-archive-json-value-"));
  assert.throws(
    () =>
      openLivePluginArchive(
        inputFor(path.join(secondRoot, "archive"), "value", {
          effectInput: { callback: () => undefined }
        })
      ),
    /non-JSON value/u
  );

  const thirdRoot = mkdtempSync(path.join(tmpdir(), "t217-archive-empty-call-"));
  assert.throws(
    () =>
      openLivePluginArchive(
        inputFor(path.join(thirdRoot, "archive"), "empty", { cCallRef: "" })
      ),
    /non-empty cCallRef/u
  );
});

test("R5 archive rejects lexical escapes, symlinks, and non-regular artifacts", () => {
  const root = mkdtempSync(path.join(tmpdir(), "t217-archive-paths-"));
  const archive = openLivePluginArchive(inputFor(path.join(root, "archive"), "paths"));
  assert.equal(archive.state, "fresh");
  assertArchiveCode(() => archive.path(""), "archive_unconfined");
  assertArchiveCode(() => archive.path("../outside"), "archive_unconfined");
  assertArchiveCode(() => archive.path(path.join(root, "outside")), "archive_unconfined");

  const outside = path.join(root, "outside-target");
  mkdirSync(outside);
  symlinkSync(outside, path.join(archive.bundleRoot, "linked"));
  assertArchiveCode(() => archive.path("linked/file.txt"), "archive_unconfined");
  unlinkSync(path.join(archive.bundleRoot, "linked"));

  symlinkSync(path.join(root, "missing-target"), path.join(archive.bundleRoot, "artifact-link"));
  assertArchiveCode(() => archive.complete({ ok: true }), "archive_unconfined");
  unlinkSync(path.join(archive.bundleRoot, "artifact-link"));

  const fifoPath = path.join(archive.bundleRoot, "artifact-fifo");
  execFileSync("mkfifo", [fifoPath]);
  assertArchiveCode(() => archive.complete({ ok: true }), "archive_tampered");
});

test("R5 archive directory admission refuses unwritable and non-directory structure", () => {
  const lockedRoot = mkdtempSync(path.join(tmpdir(), "t217-archive-locked-root-"));
  chmodSync(lockedRoot, 0o500);
  try {
    assert.throws(
      () => openLivePluginArchive(inputFor(lockedRoot, "locked-root")),
      /EACCES|EPERM/u
    );
  } finally {
    chmodSync(lockedRoot, 0o700);
  }

  const callsFileRoot = mkdtempSync(path.join(tmpdir(), "t217-archive-calls-file-"));
  writeFileSync(path.join(callsFileRoot, "by-c-call"), "not a directory\n", "utf8");
  assertArchiveCode(
    () => openLivePluginArchive(inputFor(callsFileRoot, "calls-file")),
    "archive_unconfined"
  );

  const bundleFileRoot = mkdtempSync(path.join(tmpdir(), "t217-archive-bundle-file-"));
  const bundleFileInput = inputFor(bundleFileRoot, "bundle-file");
  const callsRoot = path.join(bundleFileRoot, "by-c-call");
  mkdirSync(callsRoot);
  const bundleId = createHash("sha256").update(bundleFileInput.cCallRef).digest("hex");
  writeFileSync(path.join(callsRoot, bundleId), "not a directory\n", "utf8");
  assertArchiveCode(
    () => openLivePluginArchive(bundleFileInput),
    "archive_unconfined"
  );

  const missingRequestRoot = mkdtempSync(path.join(tmpdir(), "t217-archive-no-request-"));
  const missingRequestInput = inputFor(missingRequestRoot, "no-request");
  const missingCallsRoot = path.join(missingRequestRoot, "by-c-call");
  mkdirSync(missingCallsRoot);
  mkdirSync(
    path.join(
      missingCallsRoot,
      createHash("sha256").update(missingRequestInput.cCallRef).digest("hex")
    )
  );
  assertArchiveCode(
    () => openLivePluginArchive(missingRequestInput),
    "archive_incomplete"
  );

  const lockedCallsRoot = mkdtempSync(path.join(tmpdir(), "t217-archive-locked-calls-"));
  const lockedCalls = path.join(lockedCallsRoot, "by-c-call");
  mkdirSync(lockedCalls);
  chmodSync(lockedCalls, 0o500);
  try {
    assert.throws(
      () => openLivePluginArchive(inputFor(lockedCallsRoot, "locked-calls")),
      /EACCES|EPERM/u
    );
  } finally {
    chmodSync(lockedCalls, 0o700);
  }
});

test("R5 archive request admission rejects malformed shape, values, and digest", async (t) => {
  const cases = [
    {
      label: "invalid-json",
      mutate(filePath) {
        writeFileSync(filePath, "{", "utf8");
      }
    },
    {
      label: "non-object",
      mutate(filePath) {
        writeFileSync(filePath, "[]\n", "utf8");
      }
    },
    {
      label: "unknown-field",
      mutate(filePath) {
        rewriteJson(filePath, (row) => {
          row.unknown = true;
        });
      }
    },
    {
      label: "invalid-value",
      mutate(filePath) {
        rewriteJson(filePath, (row) => {
          row.kind = "wrong";
        });
      }
    },
    {
      label: "bad-digest",
      mutate(filePath) {
        rewriteJson(filePath, (row) => {
          row.requestDigest = "sha256:wrong";
        });
      }
    }
  ];

  for (const row of cases) {
    await t.test(row.label, () => {
      const state = fixture(`request-${row.label}`);
      row.mutate(state.requestPath);
      assertArchiveCode(() => openLivePluginArchive(state.input), "archive_tampered");
    });
  }

  await t.test("request-path-is-directory", () => {
    const state = fixture("request-directory");
    rmSync(state.requestPath);
    mkdirSync(state.requestPath);
    assertArchiveCode(() => openLivePluginArchive(state.input), "archive_tampered");
  });
});

test("R5 archive primitive reuses the admitted request for engine-authorized manifest drift", () => {
  const state = fixture("engine-resume");
  const resumed = openLivePluginArchive({
    ...state.input,
    manifest: { manifestRef: "manifest://t217/engine-resume/reprojected", renderedPrompt: "run again" },
    resumeExisting: true
  });
  assert.equal(resumed.state, "reused");
  assert.deepEqual(resumed.outcome, {
    evidenceRefs: ["evidence://t217/archive"],
    status: "dispatched"
  });
});

test("R5 archive completion admission rejects every tamper class", async (t) => {
  const cases = [
    {
      label: "invalid-json",
      mutate(state) {
        writeFileSync(state.completionPath, "{", "utf8");
      }
    },
    {
      label: "non-object",
      mutate(state) {
        writeFileSync(state.completionPath, "null\n", "utf8");
      }
    },
    {
      label: "identity",
      mutate(state) {
        rewriteJson(state.completionPath, (row) => {
          row.pluginRef = "plugin://forged";
        });
      }
    },
    {
      label: "outcome-digest",
      mutate(state) {
        rewriteJson(state.completionPath, (row) => {
          row.outcome = { status: "forged" };
        });
      }
    },
    {
      label: "completion-digest",
      mutate(state) {
        rewriteJson(state.completionPath, (row) => {
          row.completionDigest = "sha256:wrong";
        });
      }
    },
    {
      label: "artifact-record-shape",
      mutate(state) {
        rewriteJson(state.completionPath, (row) => {
          row.artifactDigests = null;
          const { completionDigest: _ignored, ...body } = row;
          row.completionDigest = digest(body);
        });
      }
    }
  ];

  for (const row of cases) {
    await t.test(row.label, () => {
      const state = fixture(`completion-${row.label}`);
      row.mutate(state);
      assertArchiveCode(() => openLivePluginArchive(state.input), "archive_tampered");
    });
  }

  await t.test("completion-path-is-directory", () => {
    const state = fixture("completion-directory");
    rmSync(state.completionPath);
    mkdirSync(state.completionPath);
    assertArchiveCode(() => openLivePluginArchive(state.input), "archive_tampered");
  });

  await t.test("artifact-content-drift", () => {
    const state = fixture("artifact-drift", { artifact: true });
    writeFileSync(path.join(state.bundleRoot, "artifact.txt"), "after\n", "utf8");
    assertArchiveCode(() => openLivePluginArchive(state.input), "archive_tampered");
  });
});
