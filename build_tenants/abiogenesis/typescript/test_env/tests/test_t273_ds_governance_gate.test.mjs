// Validates: T-273 DS ticket intake and commentary-reference governance.

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import { inspectDsGovernance } from "../gates/ds_governance_gate.mjs";

function ticketSource(overrides = {}) {
  const fields = {
    id: "T-900",
    title: "Fixture",
    type: "chore",
    ticket_category: "ordinary",
    status: "active",
    goal: "GOAL-035",
    delivery_phase: "DS-2",
    change_intent: "Exercise the governance fixture.",
    change_class: "realization_refactor",
    re_entry_point: "test fixture",
    triaged_at: "2026-07-14",
    created_at: "2026-07-14",
    updated_at: "2026-07-14",
    ...overrides
  };
  return `# Fixture\n\n${Object.entries(fields)
    .filter(([, fieldValue]) => fieldValue !== null)
    .map(([key, fieldValue]) => `- ${key}: ${fieldValue}`)
    .join("\n")}\n\n## Boundary\n\nFixture.\n`;
}

async function fixtureProject(t) {
  const root = await mkdtemp(path.join(tmpdir(), "abg-t273-governance-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, ".ai-workspace/tickets/active"), { recursive: true });
  await mkdir(path.join(root, ".ai-workspace/tickets/completed"), { recursive: true });
  return root;
}

test("T-273 current DS-1 through DS-3 ticket inventory is governed", () => {
  const result = inspectDsGovernance();
  assert.equal(result.status, "passed", result.failures.join("\n"));
  assert.equal(result.checkedTickets, 16);
  assert.equal(result.requiredFields, 13);
});

test("T-273 fails closed on a missing intake field", async (t) => {
  const root = await fixtureProject(t);
  await writeFile(
    path.join(root, ".ai-workspace/tickets/active/T-900-fixture.md"),
    ticketSource({ re_entry_point: null }),
    "utf8"
  );
  const result = inspectDsGovernance({ projectRoot: root });
  assert.equal(result.status, "failed");
  assert.deepEqual(result.failures, [
    ".ai-workspace/tickets/active/T-900-fixture.md: missing re_entry_point"
  ]);
});

test("T-273 fails closed on a missing local commentary reference", async (t) => {
  const root = await fixtureProject(t);
  await writeFile(
    path.join(root, ".ai-workspace/tickets/active/T-900-fixture.md"),
    `${ticketSource()}\n- review_ref: .ai-workspace/comments/codex/missing.md\n`,
    "utf8"
  );
  const result = inspectDsGovernance({ projectRoot: root });
  assert.equal(result.status, "failed");
  assert.match(result.failures[0], /missing commentary reference/u);
});
