// Validates: T-162

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

import {
  admitSdlcProjectConstraints,
  constructSdlcGtlModule,
  deriveSdlcWorkspaceIngressReport,
  projectSdlcQueryDomain,
  projectSdlcTicketWorkflow,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF
} from "../../build/semantic/code/src/index.js";

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "odd-sdlc-t162-projection-"));
  for (const directory of ["backlog", "active", "completed"]) {
    mkdirSync(join(root, ".ai-workspace", "tickets", directory), {
      recursive: true
    });
  }
  mkdirSync(join(root, ".ai-workspace", "comments", "codex"), {
    recursive: true
  });
  return root;
}

function ticket(frontMatter) {
  return `---\n${frontMatter.trim()}\n---\n\n# Ticket\n`;
}

const VALID_BASE = `
title: Governed ticket
type: feature
ticket_category: implementation
goal: governed-work
change_intent: prove ticket workflow
change_class: design_reframe
re_entry_point: design
triaged_at: 2026-06-14
created_at: 2026-06-14
updated_at: 2026-06-14
target_truth: ticket truth
closure_law: ticket closure law
evaluation_criteria:
  - deterministic proof
non_closure_conditions:
  - comment-only closure
source_documents:
  - specification/PRODUCT.md
`;

test("T-162 ticket workflow projection validates ticket directories and ignores comments", () => {
  const root = workspace();
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-162-valid.md"),
    ticket(`id: T-162\nstatus: active\n${VALID_BASE}`),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "backlog", "T-201-valid.md"),
    ticket(`id: T-201\nstatus: backlog\n${VALID_BASE}`),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "completed", "T-200-valid.md"),
    ticket(`id: T-200\nstatus: completed\n${VALID_BASE}`),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-300-malformed.md"),
    ticket("id: T-300\nstatus: active\ntype: bug"),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-301-stale.md"),
    ticket(`id: T-301\nstatus: completed\n${VALID_BASE}`),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-302-blocked.md"),
    ticket(`id: T-302\nstatus: blocked\n${VALID_BASE}`),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "comments", "codex", "fake-ticket.md"),
    "- id: T-999\n- status: completed\n",
    "utf8"
  );

  const projection = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const byId = new Map(projection.rows.map((row) => [row.ticketId, row]));

  assert.equal(projection.kind, "sdlc_ticket_workflow_projection");
  assert.equal(projection.readOnly, true);
  assert.equal(projection.choosesNextTraversal, false);
  assert.equal(byId.get("T-162")?.workflowStatus, "valid");
  assert.equal(byId.get("T-201")?.nextLawfulAction, "promote_or_reopen_before_execution");
  assert.equal(byId.get("T-200")?.nextLawfulAction, "closed_read_only");
  assert.equal(byId.get("T-300")?.workflowStatus, "malformed");
  assert(byId.get("T-300")?.missingRequiredFields.includes("title"));
  assert.equal(byId.get("T-301")?.workflowStatus, "stale");
  assert.equal(byId.get("T-302")?.workflowStatus, "blocked");
  assert.equal(byId.has("T-999"), false);
  assert.equal(projection.counts.malformed, 1);
  assert.equal(projection.counts.stale, 1);
  assert.equal(projection.counts.blocked, 1);
});

test("T-162 query-domain exposes the same read-only ticket workflow projection", () => {
  const root = workspace();
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-162-valid.md"),
    ticket(`id: T-162\nstatus: active\n${VALID_BASE}`),
    "utf8"
  );

  const ingressReport = deriveSdlcWorkspaceIngressReport({
    workspaceRootUri: pathToFileURL(root).href,
    projectConstraints: admitSdlcProjectConstraints({
      projectSlug: "t162",
      activeTenant: "typescript",
      selectedOutputRoot: "build_tenants/typescript",
      ambiguityRiskAppetite: "medium",
      capabilityContracts: ["transport_contract"]
    }),
    sourceInputs: []
  });
  const queryDomain = projectSdlcQueryDomain({
    module: constructSdlcGtlModule(),
    ingressReport
  });

  assert.equal(queryDomain.ticketWorkflow.rows.length, 1);
  assert.equal(queryDomain.ticketWorkflow.rows[0].ticketId, "T-162");
  assert(
    queryDomain.traversalOverlays.overlays.some(
      (overlay) =>
        overlay.overlayRef === SDLC_TICKET_WORKFLOW_OVERLAY_REF &&
        overlay.graphFunctionRefs.includes("route_ticket_work_item")
    )
  );
  assert(
    queryDomain.startTargets.some(
      (target) =>
        target.name === "route_ticket_work_item" &&
        target.defaultForOverlayRefs.includes(SDLC_TICKET_WORKFLOW_OVERLAY_REF)
    )
  );
  assert.deepStrictEqual(queryDomain.ticketWorkflow.emittedRuntimeEventKinds, []);
});
