// Validates: T-162

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  acceptedSdlcReviewDecisionRows,
  admitSdlcTicketExecutionContract,
  projectSdlcTicketWorkflow,
  sdlcTicketExecutionContractRefs
} from "../../build/semantic/code/src/index.js";

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "odd-sdlc-t162-review-comment-"));
  for (const directory of ["backlog", "active", "completed"]) {
    mkdirSync(join(root, ".ai-workspace", "tickets", directory), {
      recursive: true
    });
  }
  mkdirSync(join(root, ".ai-workspace", "comments", "grok"), {
    recursive: true
  });
  return root;
}

test("T-162 review comment becomes evidence for ticket rulings, not status authority", () => {
  const root = workspace();
  const commentRef = "workspace://.ai-workspace/comments/grok/t162-review.md";
  writeFileSync(
    join(root, ".ai-workspace", "comments", "grok", "t162-review.md"),
    [
      "# Review",
      "",
      "status: completed",
      "finding://odd-sdlc/t162/comment/accepted should be implemented.",
      "finding://odd-sdlc/t162/comment/deferred should remain visible."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-162.md"),
    `---
id: T-162
title: Review comment ruling scenario
type: feature
ticket_category: code_review
status: active
goal: review-comment-to-ticket-rulings
change_intent: prove review comments become evidence for ticket rulings before implementation
change_class: design_reframe
re_entry_point: design
triaged_at: 2026-06-14
created_at: 2026-06-14
updated_at: 2026-06-14
target_truth: accepted review findings are executable only after ticket ruling admission
superseded_truth: review comments directly authorize implementation or closure
closure_law: the scenario closes only when accepted, rejected, deferred, and split rulings remain visible in ticket execution truth
evaluation_criteria:
  - accepted findings are executable
  - deferred findings remain visible
  - review comment is evidence only
non_closure_conditions:
  - comment status changes ticket state
  - deferred findings disappear
source_documents:
  - specification/PRODUCT.md
required_reviewer_profile_ids:
  - codex
review_finding_refs:
  - finding://odd-sdlc/t162/comment/accepted
  - finding://odd-sdlc/t162/comment/rejected
  - finding://odd-sdlc/t162/comment/deferred
  - finding://odd-sdlc/t162/comment/split
review_finding_rulings:
  - accepted
  - rejected
  - deferred
  - split_ticket
review_finding_severities:
  - high
  - medium
  - low
  - medium
review_evidence_refs:
  - ${commentRef}
reviewer_profile_id: codex
reviewer_profile_config_digest: sha256:t162-comment-codex-profile
review_panel_binding_ref: review-panel-binding://odd-sdlc/T-162
reviewer_invocation_ref: reviewer-invocation://odd-sdlc/T-162/codex/comment-review
reviewer_output_digest: sha256:t162-comment-review-output
accepted_change_scopes:
  - build_tenants/typescript/code/src/tickets/workflow.ts
review_proof_required:
  - accepted finding proof
  - rejected finding remains visible
  - deferred finding remains visible
  - split ticket remains visible
split_ticket_refs:
  - asset:ticket/T-900
---

# T-162
`,
    "utf8"
  );

  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const row = workflow.rows.find((candidate) => candidate.ticketId === "T-162");
  assert(row, "ticket workflow projection must include T-162");
  assert.equal(row.workflowStatus, "valid");
  assert.equal(row.declaredStatus, "active");
  assert.equal(row.reviewDecisionRows.length, 4);

  const contract = admitSdlcTicketExecutionContract({
    workflow,
    ticketId: "T-162"
  });
  const executable = acceptedSdlcReviewDecisionRows({ contract });
  assert.deepStrictEqual(
    executable.map((decision) => decision.findingRef),
    ["finding://odd-sdlc/t162/comment/accepted"]
  );
  assert.deepStrictEqual(
    contract.reviewDecisionRows.map((decision) => decision.ruling),
    ["accepted", "rejected", "deferred", "split_ticket"]
  );
  assert(
    contract.reviewDecisionRows
      .filter((decision) => decision.ruling !== "accepted")
      .every((decision) => decision.evidenceRefs.includes(commentRef))
  );
  assert.equal(
    contract.reviewDecisionRows[2].findingRef,
    "finding://odd-sdlc/t162/comment/deferred"
  );
  assert.equal(contract.reviewDecisionRows[3].splitTicketRef, "asset:ticket/T-900");
  assert(sdlcTicketExecutionContractRefs(contract).includes(commentRef));
  assert(
    !workflow.rows.some((candidate) => candidate.directory === "completed"),
    "comment text must not move ticket status to completed"
  );
});
