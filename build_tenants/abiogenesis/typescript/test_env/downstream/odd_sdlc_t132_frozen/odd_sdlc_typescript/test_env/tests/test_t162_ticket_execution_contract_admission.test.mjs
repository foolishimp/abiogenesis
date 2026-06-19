// Validates: T-162

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";

import {
  admitSdlcProjectConstraints,
  admitSdlcPublicStartRequest,
  admitSdlcTicketExecutionContract,
  conformProjectProfileFromConstraintsText,
  constructSdlcGtlModule,
  deriveSdlcWorkspaceIngressReport,
  projectSdlcQueryDomain,
  projectSdlcWorkerAttachment,
  SDLC_TICKET_WORKFLOW_OVERLAY_REF
} from "../../build/semantic/code/src/index.js";
import { publicStartOnce } from "../../build/semantic/code/src/index.js";

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "odd-sdlc-t162-admit-"));
  for (const directory of ["backlog", "active", "completed"]) {
    mkdirSync(join(root, ".ai-workspace", "tickets", directory), {
      recursive: true
    });
  }
  return root;
}

function validTicket(id, status) {
  return `---
id: ${id}
title: Governed ticket ${id}
type: feature
ticket_category: implementation
status: ${status}
goal: governed-work
change_intent: prove ticket workflow execution
change_class: design_reframe
re_entry_point: design
triaged_at: 2026-06-14
created_at: 2026-06-14
updated_at: 2026-06-14
target_truth: ticket ${id} target truth
superseded_truth: prompt-only work
closure_law: ticket ${id} closure law
evaluation_criteria:
  - deterministic proof
non_closure_conditions:
  - comment-only closure
source_documents:
  - specification/PRODUCT.md
---

# ${id}
`;
}

function context(root) {
  const module = constructSdlcGtlModule();
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
  const queryDomain = projectSdlcQueryDomain({ module, ingressReport });
  const conformedProject = conformProjectProfileFromConstraintsText({
    workspaceRoot: root,
    constraintsText: [
      "project:",
      "  name: t162",
      "  selected_output_root: build_tenants/typescript",
      "  ambiguity_risk_appetite: medium",
      "build_tenants:",
      "  typescript:",
      "    output_dir: build_tenants/typescript",
      "    capability_contracts:",
      "      - transport_contract"
    ].join("\n")
  });
  return { module, queryDomain, conformedProject };
}

function startTicket(root, ticketId) {
  const { module, queryDomain, conformedProject } = context(root);
  return publicStartOnce({
    request: admitSdlcPublicStartRequest({
      workspaceRoot: root,
      target: { kind: "asset", handle: `ticket/${ticketId}` },
      until: "blocked",
      defaultRegime: "F_P"
    }),
    module,
    queryDomain,
    conformedProject,
    workerAttachment: projectSdlcWorkerAttachment({
      transportContract: "transport://test-worker"
    })
  });
}

test("T-162 active valid ticket admits to an execution contract and public start route", () => {
  const root = workspace();
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-162.md"),
    validTicket("T-162", "active"),
    "utf8"
  );
  const { queryDomain } = context(root);

  const contract = admitSdlcTicketExecutionContract({
    workflow: queryDomain.ticketWorkflow,
    ticketId: "T-162"
  });
  assert.equal(contract.ticketId, "T-162");
  assert.match(contract.executionContractRef, /^ticket-execution-contract:\/\/odd-sdlc\/T-162\//);
  assert.equal(contract.ticketRef, "asset:ticket/T-162");
  assert.equal(contract.targetTruth, "ticket T-162 target truth");
  assert.equal(contract.supersededTruth, "prompt-only work");
  assert.equal(contract.closureLaw, "ticket T-162 closure law");
  assert.deepStrictEqual(contract.evaluationCriteria, ["deterministic proof"]);
  assert.deepStrictEqual(contract.nonClosureConditions, ["comment-only closure"]);
  assert.deepStrictEqual(contract.sourceDocuments, ["specification/PRODUCT.md"]);

  const outcome = startTicket(root, "T-162");
  assert.equal(outcome.kind, "sdlc_public_start_projected");
  assert.equal(outcome.executionContract.targetGraphFunction, "route_ticket_work_item");
  assert.equal(outcome.executionContract.overlayRef, SDLC_TICKET_WORKFLOW_OVERLAY_REF);
  assert.equal(outcome.executionContract.ticketExecutionContract?.ticketId, "T-162");
  assert.equal(outcome.executionContract.ticketExecutionContract?.ticketDigest, contract.ticketDigest);
  assert(
    outcome.executionContract.nextActionProjection.policyRefs.includes(
      contract.executionContractRef
    )
  );
  assert(
    outcome.executionContract.constructionIntent.basisRefs.includes(
      contract.executionContractRef
    )
  );
});

test("T-162 public start rejects missing, malformed, backlog, completed, and stale ticket handles", () => {
  const root = workspace();
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "backlog", "T-201.md"),
    validTicket("T-201", "backlog"),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "completed", "T-200.md"),
    validTicket("T-200", "completed"),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-300.md"),
    "---\nid: T-300\nstatus: active\ntype: bug\n---\n",
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-301.md"),
    validTicket("T-301", "completed"),
    "utf8"
  );

  assert.equal(startTicket(root, "T-404").blockingReason, "ticket_missing");
  assert.equal(startTicket(root, "T-300").blockingReason, "ticket_malformed");
  assert.equal(startTicket(root, "T-201").blockingReason, "ticket_not_active");
  assert.equal(startTicket(root, "T-200").blockingReason, "ticket_not_active");
  assert.equal(startTicket(root, "T-301").blockingReason, "ticket_stale");
});
