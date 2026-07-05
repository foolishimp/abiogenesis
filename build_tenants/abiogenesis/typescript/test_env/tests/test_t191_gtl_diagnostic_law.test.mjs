// Implements: T-191
// Implements: REQ-L-GTL3-LAWS-019
// Implements: REQ-L-GTL3-LAWS-020
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GTL_PROGRAM_DIAGNOSTIC_ID_VALUES,
  GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES,
  GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS,
  assertRatifiedGtlProgramDiagnosticId,
  typecheckGtlProgram
} from "../../build/semantic/code/src/abg/m03/contracts/index.js";

test("T-191 diagnostic vocabulary is closed, frozen, unique, and non-trivial", () => {
  assert.equal(Object.isFrozen(GTL_PROGRAM_DIAGNOSTIC_ID_VALUES), true);
  assert.equal(
    new Set(GTL_PROGRAM_DIAGNOSTIC_ID_VALUES).size,
    GTL_PROGRAM_DIAGNOSTIC_ID_VALUES.length
  );
  assert.equal(GTL_PROGRAM_DIAGNOSTIC_ID_VALUES.length >= 300, true);
  for (const id of GTL_PROGRAM_DIAGNOSTIC_ID_VALUES) {
    assert.match(id, /^abg:\/\/gtl-program\/[A-Za-z0-9/_-]+$/u);
  }
});

test("T-191 unratified diagnostic identity is rejected differentially", () => {
  assert.throws(
    () =>
      assertRatifiedGtlProgramDiagnosticId(
        "abg://gtl-program/traversal-unit/invented-by-caller"
      ),
    /unratified gtl program diagnostic identity/u
  );
  // Every ratified identity is accepted — the assert is total over the
  // published vocabulary.
  for (const id of GTL_PROGRAM_DIAGNOSTIC_ID_VALUES) {
    assert.equal(assertRatifiedGtlProgramDiagnosticId(id), id);
  }
});

test("T-191 declaration-carried source-authority identities are accepted by declaration", () => {
  assert.equal(
    assertRatifiedGtlProgramDiagnosticId(
      "abg://gtl-program/source-authority/no-archive-status-as-acceptance"
    ),
    "abg://gtl-program/source-authority/no-archive-status-as-acceptance"
  );
});

test("T-191 live conformance issues carry ratified identities and the repair field", () => {
  const report = typecheckGtlProgram({});
  assert.equal(report.issues.length > 0, true);
  for (const row of report.issues) {
    assertRatifiedGtlProgramDiagnosticId(row.ruleRef);
    assert.equal(Array.isArray(row.admissibleRepairs), true);
  }
});

test("T-191 mapped diagnostics carry populated default repair affordances", () => {
  const report = typecheckGtlProgram({});
  const mapped = report.issues.filter(
    (row) => GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS[row.ruleRef] !== undefined
  );
  assert.equal(mapped.length > 0, true);
  for (const row of mapped) {
    assert.equal(row.admissibleRepairs.length, 1);
    const repair = row.admissibleRepairs[0];
    assert.equal(repair.kind, "gtl_program_admissible_repair");
    assert.equal(
      GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES.includes(repair.editClass),
      true
    );
    assert.equal(repair.repairSurfaceRef, row.surfaceRef);
    assert.equal(repair.changeClassRef, null);
  }
  // Differential: the default-repair table only names ratified identities —
  // a table entry outside the vocabulary would be unreachable dead law.
  for (const id of Object.keys(GTL_PROGRAM_DEFAULT_ADMISSIBLE_REPAIRS)) {
    assert.equal(assertRatifiedGtlProgramDiagnosticId(id), id);
  }
});

test("T-191 canonical program identity is order-invariant and mutation-sensitive (LAWS-021)", async () => {
  const { stableSha256Digest } = await import(
    "../../build/semantic/code/src/shared/runtime_identity.js"
  );
  const a = { alpha: 1, nested: { c: 2, d: [1, 2, 3] }, zed: "x" };
  const b = { zed: "x", nested: { d: [1, 2, 3], c: 2 }, alpha: 1 };
  // Canonical: key insertion order does not change identity.
  assert.equal(stableSha256Digest(a), stableSha256Digest(b));
  // Differential: any content mutation changes identity.
  assert.notEqual(
    stableSha256Digest(a),
    stableSha256Digest({ ...a, alpha: 2 })
  );
  assert.notEqual(
    stableSha256Digest(a),
    stableSha256Digest({ ...a, nested: { c: 2, d: [1, 2, 4] } })
  );
});

test("T-191 conformance report digest identity is derived, not stored authority (LAWS-021)", async () => {
  const { stableSha256Digest } = await import(
    "../../build/semantic/code/src/shared/runtime_identity.js"
  );
  const report = typecheckGtlProgram({});
  // One truth surface: the rolled-up identity must recompute from the
  // per-family digests — a stored-but-divergent rollup would be two_truth.
  assert.equal(
    report.inventoryDigest,
    stableSha256Digest(report.inventoryDigests)
  );
  // Determinism: same input, same identity.
  assert.equal(typecheckGtlProgram({}).inventoryDigest, report.inventoryDigest);
});

test("T-191 repair edit-class vocabulary is closed and frozen", () => {
  assert.equal(Object.isFrozen(GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES), true);
  assert.equal(
    GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES.includes("constitutional_reprice"),
    true
  );
});
