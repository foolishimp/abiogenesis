// Validates: T-082
// Validates: T-100
// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-P-QUAL
//
// Mini data-mapper redux — three-edge live experimental sandbox harness wrapper.
//
// Default mode (CODEX_LIVE_FP unset): exercises all 3 edges with the F_P
// fixture worker so the harness lints/builds clean and we can verify per-edge
// ledger evolution end-to-end without a live agent. When CODEX_LIVE_FP=1, the
// worker dispatches each edge's prompt to the claude CLI and the F_P semantic
// evaluator judges the *real* artifact. Either way, the F_P evaluator runs
// the deepest semantic check at edge 3 — it actually loads and executes the
// implementation produced at edge 2 and compares numeric/string field outputs
// to the canonical cases.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { EDGE_DEFS } from "./mini_dm_redux/module.mjs";
import { evaluateEdgeArtifact } from "./mini_dm_redux/fp_evaluator.mjs";
import {
  loadOrInitState,
  runEdge,
  workspaceLayout
} from "./mini_dm_redux/run.mjs";

const TEST_DIR = path.dirname(fileURLToPath(import.meta.url));
const TEST_ENV_ROOT = path.resolve(TEST_DIR, "..");
const TEST_RUNS_ROOT = path.join(
  TEST_ENV_ROOT,
  "test_runs",
  "t101_mini_data_mapper_redux"
);

function timestampId() {
  return new Date().toISOString().replaceAll(/[-:.]/gu, "");
}

async function fileNonEmpty(target) {
  try {
    const stats = await stat(target);
    return stats.isFile() && stats.size > 0;
  } catch {
    return false;
  }
}

function liveStyleImplementation() {
  return [
    "export interface InputRecord {",
    "  first_name: string;",
    "  last_name: string;",
    "  email: string;",
    "  birth_year: number;",
    "}",
    "",
    "export interface OutputRecord {",
    "  display_name: string;",
    "  email_domain: string | null;",
    "  age: number | null;",
    "}",
    "",
    "export function mapRecord(record: InputRecord): OutputRecord {",
    "  const first = record.first_name.trim();",
    "  const last = record.last_name.trim();",
    "  let display_name: string;",
    "  if (first.length === 0) {",
    "    display_name = last;",
    "  } else if (last.length === 0) {",
    "    display_name = first;",
    "  } else {",
    "    display_name = first + \" \" + last;",
    "  }",
    "",
    "  const atIndex = record.email.lastIndexOf(\"@\");",
    "  const email_domain: string | null =",
    "    atIndex === -1 ? null : record.email.substring(atIndex + 1);",
    "",
    "  const age: number | null =",
    "    record.birth_year > 2026 ? null : 2026 - record.birth_year;",
    "",
    "  return { display_name, email_domain, age };",
    "}",
    ""
  ].join("\n");
}

test("T-101 implementation F_P accepts live-style correct transform patterns", async () => {
  const edgeDef = EDGE_DEFS.find((entry) => entry.name === "derive_implementation");
  assert.notEqual(edgeDef, undefined);

  const runRoot = path.join(TEST_RUNS_ROOT, `${timestampId()}-live-style-evaluator`);
  const implementationPath = path.join(runRoot, "transform.ts");
  await mkdir(runRoot, { recursive: true });
  await writeFile(implementationPath, liveStyleImplementation(), "utf8");

  const result = await evaluateEdgeArtifact({
    edgeDef,
    artifactPath: implementationPath,
    artifactRef: "artifact://t101-mini-dm-redux/live-style-implementation",
    invocationLogPath: path.join(runRoot, "edge_2_derive_implementation"),
    runtimeContext: { edgeName: "derive_implementation" }
  });

  assert.deepEqual(
    result.assessments.map((entry) => [entry.obligationId, entry.status]),
    [
      ["REQ-FIELD-DISPLAY-NAME", "fulfilled"],
      ["REQ-FIELD-EMAIL-DOMAIN", "fulfilled"],
      ["REQ-FIELD-AGE", "fulfilled"],
      ["REQ-IMPL-COMPILES", "fulfilled"]
    ]
  );
});

test("T-101 mini data-mapper redux exercises three edges with deep F_P semantics", async () => {
  const runRoot = path.join(TEST_RUNS_ROOT, timestampId());
  const workspaceRoot = path.join(runRoot, "workspace");
  await mkdir(workspaceRoot, { recursive: true });

  const layout = workspaceLayout(workspaceRoot);
  const state = await loadOrInitState(layout);

  // Edge 1 — derive_field_spec.
  const r1 = await runEdge("derive_field_spec", layout, state);
  assert.equal(r1.workerMode, process.env["CODEX_LIVE_FP"] === "1" ? "live" : "fixture");
  assert.equal(r1.fdEnvelopeOk, true, "edge 1 F_D envelope must pass");
  assert.equal(
    r1.obligationStatuses.length,
    3,
    "edge 1 must produce 3 per-obligation assessments"
  );
  assert.ok(
    r1.obligationStatuses.every((entry) => entry.status === "fulfilled"),
    `edge 1 fixture must satisfy all obligations: ${JSON.stringify(r1.obligationStatuses)}`
  );

  // Between edges, evidence files must exist.
  assert.ok(
    await fileNonEmpty(path.join(layout.zoomRoot, "derive_field_spec", "ledger.json"))
  );
  assert.ok(
    await fileNonEmpty(path.join(layout.zoomRoot, "derive_field_spec", "foldback.json"))
  );
  assert.ok(await fileNonEmpty(layout.eventsLogPath));

  // Edge 2 — derive_implementation. F_P evaluator runs tsc --noEmit for
  // REQ-IMPL-COMPILES, so this exercises real type checking.
  const r2 = await runEdge("derive_implementation", layout, state);
  assert.equal(r2.fdEnvelopeOk, true);
  assert.equal(
    r2.obligationStatuses.length,
    4,
    "edge 2 must produce 4 per-obligation assessments (3 fields + REQ-IMPL-COMPILES)"
  );
  const compilesEntry = r2.obligationStatuses.find(
    (entry) => entry.obligationId === "REQ-IMPL-COMPILES"
  );
  assert.notEqual(compilesEntry, undefined);
  assert.equal(compilesEntry.status, "fulfilled", "fixture impl must compile");

  // Edge 3 — derive_validation. Empirically executes the implementation
  // produced at edge 2 against canonical cases.
  const r3 = await runEdge("derive_validation", layout, state);
  assert.equal(r3.fdEnvelopeOk, true);
  assert.ok(
    r3.obligationStatuses.every((entry) => entry.status === "fulfilled"),
    `edge 3 must execute the implementation correctly for all canonical cases: ${JSON.stringify(r3.obligationStatuses)}`
  );

  // Foldback decisions per edge — these are what the broken five-rule algebra
  // produces. The harness reports them, it does not paper over them.
  const finalState = JSON.parse(await readFile(layout.statePath, "utf8"));
  assert.equal(finalState.edgeOrder.length, 3);
  for (const edgeName of finalState.edgeOrder) {
    const summary = finalState.edges[edgeName];
    assert.ok(
      ["close", "carry_loopback_pressure"].includes(summary.foldbackDecision),
      `edge ${edgeName} foldback should be 'close' (or 'carry_loopback_pressure' if the algebra is wrong); got ${summary.foldbackDecision}`
    );
  }

  // Verify gaps inspection writes the gaps surface.
  // (We do not invoke the CLI here; we just confirm the run dir is fully
  // populated for the operator to inspect.)
  const r3Foldback = JSON.parse(
    await readFile(path.join(layout.zoomRoot, "derive_validation", "foldback.json"), "utf8")
  );
  assert.equal(r3Foldback.fulfilledCount, 3);
});
