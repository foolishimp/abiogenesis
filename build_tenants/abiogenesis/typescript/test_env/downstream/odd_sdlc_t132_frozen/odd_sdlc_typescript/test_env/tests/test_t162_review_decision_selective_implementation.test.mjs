// Validates: T-162

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  acceptedSdlcReviewDecisionRows,
  admitSdlcTicketExecutionContract,
  projectSdlcTicketWorkflow
} from "../../build/semantic/code/src/index.js";

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "odd-sdlc-t162-review-"));
  for (const directory of ["backlog", "active", "completed"]) {
    mkdirSync(join(root, ".ai-workspace", "tickets", directory), {
      recursive: true
    });
  }
  return root;
}

function ticket(id, body) {
  return `---
id: ${id}
title: Governed review ticket ${id}
type: feature
ticket_category: implementation
status: active
goal: governed-work
change_intent: prove review ticket workflow
change_class: design_reframe
re_entry_point: design
triaged_at: 2026-06-14
created_at: 2026-06-14
updated_at: 2026-06-14
target_truth: ticket target truth
closure_law: ticket closure law
evaluation_criteria:
  - deterministic proof
non_closure_conditions:
  - comment-only closure
source_documents:
  - specification/PRODUCT.md
${body.trim()}
---

# ${id}
`;
}

test("T-162 review decision rows preserve rulings and expose only accepted findings as executable", () => {
  const root = workspace();
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-162.md"),
    ticket(
      "T-162",
      `
required_reviewer_profile_ids:
  - codex
  - claude
review_finding_refs:
  - finding://one
  - finding://two
  - finding://three
  - finding://four
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
  - comment://review/source
accepted_change_scopes:
  - code/src/tickets
split_ticket_refs:
  - ticket://odd-sdlc/T-999
`
    ),
    "utf8"
  );

  const contract = admitSdlcTicketExecutionContract({
    workflow: projectSdlcTicketWorkflow({ workspaceRoot: root }),
    ticketId: "T-162"
  });
  const rulings = contract.reviewDecisionRows.map((row) => row.ruling);
  const executable = acceptedSdlcReviewDecisionRows({ contract });

  assert.deepStrictEqual(rulings, [
    "accepted",
    "rejected",
    "deferred",
    "split_ticket"
  ]);
  assert.equal(executable.length, 1);
  assert.equal(executable[0].findingRef, "finding://one");
  assert.equal(contract.reviewDecisionRows[3].splitTicketRef, "ticket://odd-sdlc/T-999");
  assert.deepStrictEqual(contract.reviewerProfileIds, ["codex", "claude"]);
  assert.equal(contract.reviewerProfileConfigDigests.length, 2);
});

test("T-162 unknown reviewer and incomplete bug/spec rows block ticket admission", () => {
  const root = workspace();
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-300.md"),
    ticket(
      "T-300",
      `
required_reviewer_profile_ids:
  - codex
  - unknown-reviewer
`
    ),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-301.md"),
    ticket(
      "T-301",
      `
expected_behavior: tests should pass
actual_behavior: tests fail
reproduction_refs:
  - run://failure
first_missing_layer: realization
change_class: realization_refactor
`
    ),
    "utf8"
  );
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", "T-302.md"),
    ticket(
      "T-302",
      `
target_spec_surface: specification/PRODUCT.md
current_truth: old truth
`
    ),
    "utf8"
  );
  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });

  assert.throws(
    () => admitSdlcTicketExecutionContract({ workflow, ticketId: "T-300" }),
    /reviewer profile admission failed|unadmitted/
  );
  assert.throws(
    () => admitSdlcTicketExecutionContract({ workflow, ticketId: "T-301" }),
    /unadmitted/
  );
  assert.throws(
    () => admitSdlcTicketExecutionContract({ workflow, ticketId: "T-302" }),
    /unadmitted/
  );
});
