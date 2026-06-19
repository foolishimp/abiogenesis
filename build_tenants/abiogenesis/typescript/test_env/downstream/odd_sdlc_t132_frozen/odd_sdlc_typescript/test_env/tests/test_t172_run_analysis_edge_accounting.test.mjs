// Validates: T-172
// Validates: REQ-F-ODDSDLC-081

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  analyzeSdlcFdRunArchive,
  renderSdlcFdRunAnalysisMarkdown
} from "../../build/semantic/code/src/analysis/index.js";
import {
  deriveSdlcExecutiveEdgeAccountingAudit
} from "../../build/semantic/code/src/index.js";

function makeTempWorkspace() {
  return mkdtempSync(path.join(tmpdir(), "odd-sdlc-ts-t172-analysis-"));
}

test("T-172 analyze-run JSON includes selected full-graph edge accounting", () => {
  const workspaceRoot = makeTempWorkspace();
  try {
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "generic",
      nowMs: Date.parse("2026-05-19T00:00:00.000Z")
    });

    assert.equal(result.edgeAccounting.kind, "sdlc_executive_edge_accounting_audit");
    assert.equal(result.edgeAccounting.admissionDecision, "admit");
    assert.equal(result.edgeAccounting.selectedEdgeNames.length, 23);
    assert.deepEqual(result.edgeAccounting.missingEdgeNames, []);
    assert.deepEqual(result.edgeAccounting.extraEdgeNames, []);
    assert.deepEqual(result.edgeAccounting.projectionNoCloseEdgeNames, [
      "derive_code_surface",
      "derive_test_run_archive_surface",
      "prepare_test_execution_surface"
    ]);
    assert.deepEqual(result.edgeAccounting.conditionalEdgeNames, [
      "derive_component_repair_schedule_surface"
    ]);
    assert.deepEqual(result.edgeAccounting.observedWorkerDispatchViolationEdgeNames, []);
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 analyze-run markdown reports edge accounting disposition", () => {
  const workspaceRoot = makeTempWorkspace();
  try {
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "generic",
      nowMs: Date.parse("2026-05-19T00:00:00.000Z")
    });
    const markdown = renderSdlcFdRunAnalysisMarkdown(result);

    assert.ok(markdown.includes("## Edge Accounting"));
    assert.ok(markdown.includes("- admission: admit"));
    assert.ok(markdown.includes("- selected edges: 23"));
    assert.ok(
      markdown.includes(
        "- projection/no-close edges: derive_code_surface, derive_test_run_archive_surface, prepare_test_execution_surface"
      )
    );
    assert.ok(
      markdown.includes(
        "- conditional edges: derive_component_repair_schedule_surface"
      )
    );
    assert.ok(markdown.includes("- observed no-dispatch worker runs: none"));
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});

test("T-172 analyze-run markdown renders rejected edge accounting rows", () => {
  const workspaceRoot = makeTempWorkspace();
  try {
    const result = analyzeSdlcFdRunArchive({
      inspectedRoot: workspaceRoot,
      profile: "generic",
      nowMs: Date.parse("2026-05-19T00:00:00.000Z")
    });
    const markdown = renderSdlcFdRunAnalysisMarkdown({
      ...result,
      edgeAccounting: deriveSdlcExecutiveEdgeAccountingAudit({
        observedDispatchedEdgeNames: ["prepare_release_surface"]
      })
    });

    assert.ok(markdown.includes("| blocking edge | disposition | worker dispatch | rationale | reasons |"));
    assert.ok(markdown.includes("| prepare_release_surface | required | false |"));
    assert.ok(
      markdown.includes(
        "observed_worker_dispatch_disallowed:prepare_release_surface"
      )
    );
  } finally {
    rmSync(workspaceRoot, { recursive: true, force: true });
  }
});
