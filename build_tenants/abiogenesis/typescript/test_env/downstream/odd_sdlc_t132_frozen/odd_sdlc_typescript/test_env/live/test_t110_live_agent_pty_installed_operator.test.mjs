// Validates: T-110
// Validates: ABG-4-live-agent-PTY-installed-operator

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { fileURLToPath } from "node:url";
import path, { dirname, resolve } from "node:path";

import {
  installOddSdlcTypescript,
  invokeOddSdlcSpecMethodCommand
} from "../../build/semantic/code/src/index.js";
import { liveTestArchiveRoot } from "./archive_root.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);
const EXPECTED_ABG_VERSION = "4.0.0-rc.5";
const EXPECTED_ABG_CONFIG_DIGEST =
  "sha256:8e95750c8a848086aa4d900cd660000543d8ac4855ed31cdaa557a15de833df4";
const LIVE_ENABLED = process.env["ODD_SDLC_TS_T110_LIVE"] === "1";
const WORKER_TRANSPORT =
  process.env["ODD_SDLC_TS_T110_LIVE_WORKER"] ??
  "process://codex?model=gpt-5.3-codex-spark";

function archiveTimestamp() {
  return new Date().toISOString().replaceAll("-", "").replaceAll(":", "").replace(".", "");
}

function writeJson(filePath, payload) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

function sha256File(filePath) {
  return `sha256:${createHash("sha256").update(readFileSync(filePath)).digest("hex")}`;
}

function makeWorkspace(root) {
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(
    path.join(root, "README.md"),
    [
      "# T-110 Live Agent PTY Fixture",
      "",
      "This workspace proves the installed odd_sdlc TypeScript operator can invoke an admitted live worker through the ABG 4 PTY callout substrate."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    [
      "# Intent",
      "",
      "Create a minimal governed intent surface for the T-110 live agent PTY proof."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "T-110 live fixture product for installed-operator live worker callout proof."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    [
      "# Goals",
      "",
      "- prove ABG 4 pty-terminal execution through an admitted worker binding",
      "- preserve trace evidence without requiring provider-specific prose or stream shape"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    ["# Imported Sources", "", "- fixture://t110-live-agent-pty"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-live-pty-proof.md"),
    [
      "# Live PTY Proof Requirements",
      "",
      "REQ-T110-001: The installed TypeScript operator invokes the admitted worker binding using the ABG `pty-terminal` executor profile.",
      "",
      "REQ-T110-002: The worker output materializes the requested intent surface and leaves ABG trace, terminal-session, and liveness projection evidence."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    ["# Project Bootstrap", "", "project_slug: t110_live_agent_pty"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t110_live_agent_pty",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "ambiguity_risk_appetite: low"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    ["# Tenant Registry", "", "- tenant: typescript"].join("\n"),
    "utf8"
  );
}

function pathFromFileRef(fileRef) {
  assert.equal(typeof fileRef, "string");
  assert.equal(fileRef.startsWith("file://"), true, `expected file ref, got ${fileRef}`);
  return fileURLToPath(fileRef);
}

function isClaudeWorkerBinding(workerTransport) {
  return /^process:\/\/claude(?:[/?#]|$)/u.test(workerTransport);
}

test(
  "T-110 live installed operator invokes an admitted worker through ABG pty-terminal trace substrate",
  { skip: LIVE_ENABLED ? false : "ODD_SDLC_TS_T110_LIVE=1 not set" },
  async () => {
    const archiveRoot = liveTestArchiveRoot(
      "t110_live_agent_pty_installed_operator",
      archiveTimestamp(),
      process.pid
    );
    const workspace = path.join(archiveRoot, "workspace");
    makeWorkspace(workspace);

    const install = await installOddSdlcTypescript({
      targetRoot: workspace,
      packageSourceRoot: PACKAGE_ROOT,
      abgPackageSourceRoot: ABG_TYPESCRIPT_ROOT,
      installedPackageName: "odd-sdlc-t110-live"
    });
    assert.equal(install.kind, "installed");

    const installedAbgPackageJsonPath = path.join(
      workspace,
      "node_modules/@abiogenesis/typescript-tenant/package.json"
    );
    const installedAbgConfigPath = path.join(
      workspace,
      ".abiogenesis/config/abg.config.json"
    );
    assert.equal(existsSync(installedAbgPackageJsonPath), true);
    assert.equal(existsSync(installedAbgConfigPath), true);
    const installedAbgPackageJson = readJson(installedAbgPackageJsonPath);
    const abgConfigDigest = sha256File(installedAbgConfigPath);
    assert.equal(installedAbgPackageJson.version, EXPECTED_ABG_VERSION);
    assert.equal(abgConfigDigest, EXPECTED_ABG_CONFIG_DIGEST);
    writeJson(path.join(archiveRoot, "installed_abg_substrate_snapshot.json"), {
      packageJsonPath: installedAbgPackageJsonPath,
      version: installedAbgPackageJson.version,
      abgConfigPath: installedAbgConfigPath,
      abgConfigDigest
    });

    const previousOddProfile = process.env["ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE"];
    const previousAbgProfile = process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"];
    process.env["ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE"] = "pty-terminal";
    process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"] = "pty-terminal";
    try {
      const gaps = await invokeOddSdlcSpecMethodCommand(["gaps", "--workspace", workspace]);
      writeJson(path.join(archiveRoot, "gaps_result.json"), gaps);
      assert.equal(gaps.status, "ok");

      const start = await invokeOddSdlcSpecMethodCommand([
        "start",
        "--workspace",
        workspace,
        "--target",
        "graph_function:bootstrap_release_self_test",
        "--until",
        "first_traversal",
        "--worker",
        WORKER_TRANSPORT
      ]);
      writeJson(path.join(archiveRoot, "start_result.json"), start);

      assert.equal(start.status, "ok");
      assert.equal(start.payload.kind, "sdlc_installed_operator_start_outcome");
      assert.equal(start.payload.status, "worker_invoked");
      assert.equal(start.payload.workerRun.executorProfile, "pty-terminal");
      assert.equal(start.payload.workerRun.streamModel, "terminal-transcript");
      assert.equal(typeof start.payload.workerRun.terminalSessionId, "string");
      assert.equal(start.payload.workerRun.terminalSessionId.length > 0, true);
      assert.equal(start.payload.workerRun.outcome.kind, "exited");
      assert.equal(start.payload.workerRun.outcome.status, 0);
      assert.equal(start.payload.workerRun.status, 0);
      assert.ok(start.payload.workerRun.traceRoot.includes(".trace"));
      assert.equal(start.payload.workerRun.terminalTranscriptRef !== undefined, true);
      assert.equal(start.payload.workerRun.traceResultRef !== undefined, true);
      if (isClaudeWorkerBinding(WORKER_TRANSPORT)) {
        assert.ok(
          start.payload.workerRun.structuredEventCount > 0,
          "Claude stream-json events should be observed through the PTY transcript"
        );
      }

      const traceResultPath = pathFromFileRef(start.payload.workerRun.traceResultRef);
      assert.equal(existsSync(traceResultPath), true);
      const traceResult = readJson(traceResultPath);
      writeJson(path.join(archiveRoot, "trace_result_snapshot.json"), traceResult);
      assert.equal(traceResult.executorProfile, "pty-terminal");
      assert.equal(traceResult.streamModel, "terminal-transcript");
      assert.equal(traceResult.terminalSessionId, start.payload.workerRun.terminalSessionId);
      assert.equal(traceResult.outcome.kind, "exited");
      assert.equal(traceResult.outcome.status, 0);

      const startedContextPath = path.join(
        start.payload.archiveRoot,
        "worker_process_started_context.json"
      );
      assert.equal(existsSync(startedContextPath), true);
      const startedContext = readJson(startedContextPath);
      assert.equal(
        startedContext.terminalSessionId,
        start.payload.workerRun.terminalSessionId
      );

      const processSummaryPath = path.join(
        start.payload.archiveRoot,
        "worker_process_summary.json"
      );
      assert.equal(existsSync(processSummaryPath), true);
      const processSummary = readJson(processSummaryPath);
      assert.equal(processSummary.kind, "sdlc_worker_process_summary");
      assert.equal(
        processSummary.terminalSessionId,
        start.payload.workerRun.terminalSessionId
      );
      assert.equal(
        processSummary.runtimeLivenessAuthority,
        "abiogenesis_runtime_liveness_observer_projection"
      );
      assert.equal(processSummary.runtimeLivenessLeaseState, "active");
      assert.equal(processSummary.runtimeLivenessDispositionAction, "continue_waiting");
      assert.equal(processSummary.runtimeLivenessDispositionReason, "activity_recent");

      const livenessProjectionPath = path.join(
        start.payload.archiveRoot,
        "runtime_liveness_observer_projection.json"
      );
      assert.equal(existsSync(livenessProjectionPath), true);
      const livenessProjection = readJson(livenessProjectionPath);
      assert.equal(livenessProjection.kind, "runtime_liveness_observer_projection");
      assert.equal(livenessProjection.leaseState, "active");
      assert.equal(livenessProjection.disposition.action, "continue_waiting");
      assert.equal(livenessProjection.disposition.reason, "activity_recent");
    } finally {
      if (previousOddProfile === undefined) {
        delete process.env["ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE"];
      } else {
        process.env["ODD_SDLC_TS_AGENT_EXECUTOR_PROFILE"] = previousOddProfile;
      }
      if (previousAbgProfile === undefined) {
        delete process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"];
      } else {
        process.env["ABG_TS_AGENT_EXECUTOR_PROFILE"] = previousAbgProfile;
      }
    }
  }
);
