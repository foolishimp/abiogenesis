// Validates: T-273 DS ticket intake and commentary-reference governance.

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

import {
  evaluateDsGovernance,
  executeDeliveryRootOutcome,
  inspectDsGovernance
} from "../gates/ds_governance_gate.mjs";

function ticketSource(overrides = {}) {
  const fields = {
    id: "T-900",
    title: "Fixture",
    type: "chore",
    ticket_category: "ordinary",
    status: "active",
    goal: "GOAL-035",
    source_ticket: "T-276",
    delivery_phase: "DS-4",
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

test("T-273 current T-276 delivery root is governed", () => {
  const result = inspectDsGovernance();
  assert.equal(result.status, "passed", result.failures.join("\n"));
  assert.equal(result.checkedTickets, 1);
  assert.equal(result.requiredFields, 13);
  assert.deepEqual(result.deliveryRootTicketIds, ["T-276"]);
});

test("T-273 executes the exact packed T-276 root command after host build", () => {
  const calls = [];
  const result = executeDeliveryRootOutcome({
    tenantRoot: "/fixture/tenant",
    spawn(command, args, options) {
      calls.push({ command, args, cwd: options.cwd });
      return { status: 0, signal: null, stdout: "", stderr: "" };
    }
  });
  assert.equal(result.status, "passed");
  assert.equal(result.deliveryRootTicketId, "T-276");
  assert.equal(
    result.packedTest,
    "test_env/tests/test_t276_installed_consensus_steel_thread.test.mjs"
  );
  assert.deepEqual(calls, [
    {
      command: "npm",
      args: ["run", "build:host"],
      cwd: "/fixture/tenant"
    },
    {
      command: process.execPath,
      args: [
        "--test",
        "--test-concurrency=1",
        "test_env/tests/test_t276_installed_consensus_steel_thread.test.mjs"
      ],
      cwd: "/fixture/tenant"
    }
  ]);
});

test("T-273 executable governance fails and stops when the root command fails", () => {
  let calls = 0;
  const rootOutcome = executeDeliveryRootOutcome({
    spawn() {
      calls += 1;
      return {
        status: 1,
        signal: null,
        stdout: "",
        stderr: "root red"
      };
    }
  });
  const result = evaluateDsGovernance(
    { status: "passed" },
    rootOutcome
  );
  assert.equal(calls, 1);
  assert.equal(rootOutcome.status, "failed");
  assert.equal(rootOutcome.steps[0].stderr, "root red");
  assert.equal(result.status, "failed");
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

test("T-273 discovers a delivery descendant before validating its missing phase", async (t) => {
  const root = await fixtureProject(t);
  await writeFile(
    path.join(root, ".ai-workspace/tickets/active/T-900-fixture.md"),
    ticketSource({ delivery_phase: null }),
    "utf8"
  );
  const result = inspectDsGovernance({ projectRoot: root });
  assert.equal(result.checkedTickets, 1);
  assert.deepEqual(result.failures, [
    ".ai-workspace/tickets/active/T-900-fixture.md: missing delivery_phase"
  ]);
});

test("T-273 fails closed on duplicate ticket metadata", async (t) => {
  const root = await fixtureProject(t);
  const source = ticketSource().replace(
    "\n\n## Boundary",
    "\n- updated_at: 2026-07-15\n\n## Boundary"
  );
  await writeFile(
    path.join(root, ".ai-workspace/tickets/active/T-900-fixture.md"),
    source,
    "utf8"
  );
  const result = inspectDsGovernance({ projectRoot: root });
  assert.equal(result.status, "failed");
  assert.equal(
    result.failures.some((failure) => failure.endsWith("duplicate updated_at")),
    true
  );
});
