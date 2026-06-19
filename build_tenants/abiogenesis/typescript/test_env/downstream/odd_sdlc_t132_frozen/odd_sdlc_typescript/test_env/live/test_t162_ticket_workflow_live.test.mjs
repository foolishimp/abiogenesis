// Validates: T-162 live ticket workflow entrypoint

import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF
} from "../../build/semantic/code/src/index.js";
import { liveTestArchiveRoot } from "./archive_root.mjs";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const CLI_MAIN = resolve(PACKAGE_ROOT, "build/semantic/code/src/cli/main.js");

function archiveTimestamp() {
  return new Date().toISOString().replace(/[-:.TZ]/gu, "");
}

function runCli(args) {
  const result = spawnSync(process.execPath, [CLI_MAIN, ...args], {
    cwd: PACKAGE_ROOT,
    encoding: "utf8",
    env: {
      ...process.env,
      ODD_SDLC_TS_OUTPUT: "json",
      ODD_SDLC_TEST_ONLY_MINIMUM_OPERATOR_TIMEOUT_MS: "60000",
      ODD_SDLC_WORKER_TIMEOUT_MS: "900000",
      ODD_SDLC_WORKER_INACTIVITY_TIMEOUT_MS: "180000"
    }
  });
  const output = result.status === 0 ? result.stdout : result.stderr;
  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch (error) {
    assert.fail(
      [
        `CLI emitted non-JSON output: ${error instanceof Error ? error.message : String(error)}`,
        `status: ${String(result.status)}`,
        `stdout: ${result.stdout}`,
        `stderr: ${result.stderr}`
      ].join("\n")
    );
  }
  return Object.freeze({ process: result, result: parsed });
}

function writeWorkspace(workspace) {
  mkdirSync(path.join(workspace, "specification", "requirements"), {
    recursive: true
  });
  mkdirSync(path.join(workspace, ".ai-workspace", "context"), {
    recursive: true
  });
  mkdirSync(path.join(workspace, ".ai-workspace", "tickets", "active"), {
    recursive: true
  });
  mkdirSync(path.join(workspace, ".ai-workspace", "comments", "grok"), {
    recursive: true
  });
  mkdirSync(path.join(workspace, "build_tenants"), { recursive: true });
  writeFileSync(
    path.join(workspace, "README.md"),
    ["# T-162 Live Fixture", "", "REQ-T162-LIVE-001: Route governed ticket work."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification", "GOALS.md"),
    ["# Goals", "", "GOAL-T162-LIVE-001: Exercise ticket workflow start."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification", "INTENT.md"),
    ["# Intent", "", "**Project**: T-162 live fixture", "", "INT-T162-LIVE-001: Keep tickets as governed work authority."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification", "PRODUCT.md"),
    ["# Product", "", "PRODUCT-T162-LIVE-001: Ticket workflow live fixture."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification", "requirements", "00-imported-sources.md"),
    ["# Imported Sources", "", "- README.md", "- specification/INTENT.md"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification", "requirements", "01-ticket-workflow.md"),
    ["# Ticket Workflow", "", "REQ-T162-LIVE-002: Active tickets must admit before traversal."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace", "context", "project_bootstrap.md"),
    ["# Project Bootstrap", "", "Source package: T-162 live fixture."].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace", "context", "project_constraints.yml"),
    [
      "project:",
      "  name: t162_live_ticket",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "build_tenants", "TENANT_REGISTRY.md"),
    ["# Tenant Registry", "", "- typescript: build_tenants/typescript"].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace", "comments", "grok", "review.md"),
    [
      "# Review",
      "",
      "finding://odd-sdlc/t162/live/review/accepted: exercise ticket workflow live route."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, ".ai-workspace", "tickets", "active", "T-162.md"),
    `---
id: T-162
title: Live ticket workflow route
type: feature
ticket_category: implementation
status: active
goal: ticket-workflow-live-start
change_intent: prove ticket workflow through built CLI
change_class: design_reframe
re_entry_point: design
triaged_at: 2026-06-14
created_at: 2026-06-14
updated_at: 2026-06-14
target_truth: active ticket authority admits before graph traversal
superseded_truth: prompt-only ticket execution
closure_law: ticket workflow live test must project, admit, and start through asset:ticket/T-162
evaluation_criteria:
  - built CLI projects ticket workflow
  - built CLI admits the ticket execution contract
  - built CLI starts asset:ticket/T-162 through route_ticket_work_item
non_closure_conditions:
  - comments set ticket status
  - asset:ticket start bypasses admission
source_documents:
  - specification/PRODUCT.md
required_reviewer_profile_ids:
  - codex
optional_reviewer_profile_ids:
  - claude
review_finding_refs:
  - finding://odd-sdlc/t162/live/review/accepted
review_finding_rulings:
  - accepted
review_finding_severities:
  - medium
review_evidence_refs:
  - workspace://.ai-workspace/comments/grok/review.md
reviewer_profile_id: codex
reviewer_profile_config_digest: sha256:t162-live-codex-profile
review_panel_binding_ref: review-panel://odd-sdlc/t162/live
reviewer_invocation_ref: reviewer-invocation://odd-sdlc/t162/live/codex
reviewer_output_digest: sha256:t162-live-review-output
accepted_change_scopes:
  - route ticket through admitted CLI start
review_proof_required:
  - test:t162:ticket-workflow-live
source_overlay_segment_completion_ref: sdlc-overlay-segment-completion://t162/live/final
terminal_graph_function_refs:
  - graph-function://odd-sdlc/final_code_review
terminal_asset_refs:
  - asset://odd-sdlc/t162/live/review
remaining_graph_pressure_refs:
  - pressure://odd-sdlc/t162/live/current-full
remaining_requirement_pressure_refs:
  - requirement://odd-sdlc/t162/live/REQ-T162-LIVE-002
remaining_asset_pressure_refs:
  - asset://odd-sdlc/t162/live/review
next_eligible_overlay_refs:
  - overlay://odd-sdlc/current-full-traversal
overlay_continuation_ruling: depth_traversal
overlay_continuation_proof_expectation: start through admitted ticket authority
---

# T-162 Live Ticket
`,
    "utf8"
  );
}

test("T-162 live CLI projects, admits, and starts an active ticket", () => {
  const archiveRoot = liveTestArchiveRoot(
    "t162_ticket_workflow_live",
    archiveTimestamp(),
    process.pid
  );
  const workspace = path.join(archiveRoot, "workspace");
  mkdirSync(workspace, { recursive: true });
  writeWorkspace(workspace);

  const tickets = runCli(["tickets", "--workspace", workspace]);
  assert.equal(tickets.process.status, 0, tickets.process.stderr);
  assert.equal(tickets.result.status, "ok");
  assert.equal(tickets.result.payload.kind, "sdlc_ticket_workflow_projection");
  const row = tickets.result.payload.rows.find(
    (candidate) => candidate.ticketId === "T-162"
  );
  assert(row, "ticket workflow projection must include T-162");
  assert.equal(row.workflowStatus, "valid");
  assert.equal(row.reviewDecisionRows.length, 1);
  assert.equal(row.reviewDecisionRows[0].ruling, "accepted");
  assert.equal(row.overlayContinuationRows.length, 1);
  assert.equal(row.overlayContinuationRows[0].ruling, "depth_traversal");

  const admitted = runCli([
    "ticket-admit",
    "--workspace",
    workspace,
    "--target",
    "asset:ticket/T-162"
  ]);
  assert.equal(admitted.process.status, 0, admitted.process.stderr);
  assert.equal(admitted.result.status, "ok");
  assert.equal(admitted.result.payload.kind, "sdlc_ticket_execution_contract");
  assert.equal(admitted.result.payload.ticketId, "T-162");
  assert.equal(admitted.result.payload.reviewDecisionRows.length, 1);
  assert.equal(admitted.result.payload.overlayContinuationRefs.length, 1);
  assert(
    admitted.result.payload.reviewerProfileIds.includes("codex"),
    "ticket admission must preserve selected reviewer profile"
  );

  const started = runCli([
    "start",
    "--workspace",
    workspace,
    "--target",
    "asset:ticket/T-162",
    "--until",
    "blocked",
    "--worker",
    "process://codex"
  ]);
  assert.equal(started.process.status, 0, started.process.stderr);
  assert.equal(started.result.status, "ok");
  assert.equal(
    started.result.payload.kind,
    "sdlc_installed_operator_start_cli_projection"
  );
  assert.equal(started.result.payload.status, "blocked");
  assert.equal(
    started.result.payload.summary.blockingReason,
    "installed_topology_invalid"
  );
  assert.equal(
    started.result.payload.summary.graphFunctionName,
    "derive_intent_surface"
  );
  assert.equal(
    started.result.payload.summary.nextLawfulAction,
    "run_install_or_repair_installed_topology"
  );

  writeFileSync(
    path.join(archiveRoot, "t162_ticket_workflow_live_summary.json"),
    `${JSON.stringify(
      {
        kind: "t162_ticket_workflow_live_summary",
        workspace,
        ticketRowRef: row.rowRef,
        executionContractRef: admitted.result.payload.executionContractRef,
        ticketWorkflowOverlayRef: SDLC_TICKET_WORKFLOW_OVERLAY_REF,
        selectedOverlayRef: SDLC_CURRENT_FULL_TRAVERSAL_OVERLAY_REF,
        selectedGraphFunction: started.result.payload.summary.graphFunctionName,
        startBlockingReason: started.result.payload.summary.blockingReason,
        ticketDigest: admitted.result.payload.ticketDigest
      },
      null,
      2
    )}\n`,
    "utf8"
  );
});
