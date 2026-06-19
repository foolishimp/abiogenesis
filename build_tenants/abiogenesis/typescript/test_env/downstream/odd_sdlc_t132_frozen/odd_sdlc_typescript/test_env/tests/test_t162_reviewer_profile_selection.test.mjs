// Validates: T-162

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  admitSdlcTicketExecutionContract,
  projectSdlcTicketWorkflow
} from "../../build/semantic/code/src/index.js";

function workspace() {
  const root = mkdtempSync(join(tmpdir(), "odd-sdlc-t162-reviewers-"));
  for (const directory of ["backlog", "active", "completed"]) {
    mkdirSync(join(root, ".ai-workspace", "tickets", directory), {
      recursive: true
    });
  }
  return root;
}

function writeReviewerRegistry(root, profiles) {
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "reviewer_profiles.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_reviewer_profile_registry",
        profiles
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function ticket(id, body) {
  return `---
id: ${id}
title: Reviewer profile proof ${id}
type: feature
ticket_category: code_review
status: active
goal: reviewer-profile-proof
change_intent: prove reviewer selection is configured ticket workflow truth
change_class: design_reframe
re_entry_point: design
triaged_at: 2026-06-14
created_at: 2026-06-14
updated_at: 2026-06-14
target_truth: reviewer profiles are selected from configured ticket workflow truth
superseded_truth: reviewer identity comes from chat or current agent identity
closure_law: reviewer workflow closes only when configured profiles are admitted or rejected deterministically
evaluation_criteria:
  - reviewer profile is configured
non_closure_conditions:
  - reviewer inferred from prompt text
source_documents:
  - specification/PRODUCT.md
${body.trim()}
---

# ${id}
`;
}

function writeTicket(root, id, body) {
  writeFileSync(
    join(root, ".ai-workspace", "tickets", "active", `${id}.md`),
    ticket(id, body),
    "utf8"
  );
}

function rowById(workflow, ticketId) {
  const row = workflow.rows.find((candidate) => candidate.ticketId === ticketId);
  assert(row, `expected ${ticketId} in ticket workflow projection`);
  return row;
}

test("T-162 configured codex and claude reviewers admit with profile refs and digests", () => {
  const root = workspace();
  writeTicket(
    root,
    "T-162",
    `
required_reviewer_profile_ids:
  - codex
optional_reviewer_profile_ids:
  - claude
review_finding_refs:
  - finding://odd-sdlc/t162/reviewer/accepted
review_finding_rulings:
  - accepted
reviewer_profile_id: codex
reviewer_invocation_ref: reviewer-invocation://odd-sdlc/t162/codex
reviewer_output_digest: sha256:t162-reviewer-output
review_evidence_refs:
  - workspace://.ai-workspace/comments/codex/t162-review.md
accepted_change_scopes:
  - build_tenants/typescript/code/src/tickets/workflow.ts
`
  );

  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const row = rowById(workflow, "T-162");
  assert.equal(row.reviewPanelBinding?.diagnostics.length, 0);
  assert.deepStrictEqual(row.reviewPanelBinding?.requiredReviewerProfileIds, [
    "codex"
  ]);
  assert.deepStrictEqual(row.reviewPanelBinding?.optionalReviewerProfileIds, [
    "claude"
  ]);
  assert.deepStrictEqual(row.reviewPanelBinding?.reviewerProfileRefs, [
    "reviewer-profile://odd-sdlc/codex",
    "reviewer-profile://odd-sdlc/claude"
  ]);

  const contract = admitSdlcTicketExecutionContract({
    workflow,
    ticketId: "T-162"
  });
  assert.deepStrictEqual(contract.reviewerProfileIds, ["codex"]);
  assert.equal(contract.reviewerProfileConfigDigests.length, 2);
  assert(
    contract.reviewPanelBinding?.reviewerProfileConfigDigests.every((digest) =>
      digest.startsWith("sha256:")
    )
  );
});

test("T-162 unknown reviewer profile blocks admission with a typed diagnostic", () => {
  const root = workspace();
  writeTicket(
    root,
    "T-300",
    `
required_reviewer_profile_ids:
  - codex
  - unknown-reviewer
`
  );

  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const row = rowById(workflow, "T-300");
  assert(
    row.diagnostics.some((entry) => entry.code === "unknown_reviewer_profile")
  );
  assert.throws(
    () => admitSdlcTicketExecutionContract({ workflow, ticketId: "T-300" }),
    /reviewer profile admission failed|unadmitted/
  );
});

test("T-162 unavailable reviewer profile blocks admission with a typed diagnostic", () => {
  const root = workspace();
  writeReviewerRegistry(root, [
    {
      profileId: "claude",
      displayName: "Claude",
      available: false,
      outputSchemaRef: "schema://odd-sdlc/reviewer-output/ticket-review-v1",
      evidenceContractRefs: [
        "evidence-contract://odd-sdlc/reviewer/findings"
      ]
    }
  ]);
  writeTicket(
    root,
    "T-301",
    `
required_reviewer_profile_ids:
  - claude
`
  );

  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const row = rowById(workflow, "T-301");
  assert(
    row.diagnostics.some(
      (entry) => entry.code === "unavailable_reviewer_profile"
    )
  );
  assert.throws(
    () => admitSdlcTicketExecutionContract({ workflow, ticketId: "T-301" }),
    /reviewer profile admission failed|unadmitted/
  );
});

test("T-162 schema-incompatible reviewer profile blocks admission with a typed diagnostic", () => {
  const root = workspace();
  writeReviewerRegistry(root, [
    {
      profileId: "codex",
      displayName: "Codex",
      available: true,
      evidenceContractRefs: [
        "evidence-contract://odd-sdlc/reviewer/findings"
      ]
    }
  ]);
  writeTicket(
    root,
    "T-302",
    `
required_reviewer_profile_ids:
  - codex
`
  );

  const workflow = projectSdlcTicketWorkflow({ workspaceRoot: root });
  const row = rowById(workflow, "T-302");
  assert(
    row.diagnostics.some(
      (entry) => entry.code === "schema_incompatible_reviewer_profile"
    )
  );
  assert.throws(
    () => admitSdlcTicketExecutionContract({ workflow, ticketId: "T-302" }),
    /reviewer profile admission failed|unadmitted/
  );
});
