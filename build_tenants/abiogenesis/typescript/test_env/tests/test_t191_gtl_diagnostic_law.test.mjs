// Implements: T-191
// Implements: REQ-L-GTL3-LAWS-019
// Implements: REQ-L-GTL3-LAWS-020
import assert from "node:assert/strict";
import { test } from "node:test";

import {
  GTL_PROGRAM_DIAGNOSTIC_ID_VALUES,
  GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES,
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

test("T-191 repair edit-class vocabulary is closed and frozen", () => {
  assert.equal(Object.isFrozen(GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES), true);
  assert.equal(
    GTL_PROGRAM_REPAIR_EDIT_CLASS_VALUES.includes("constitutional_reprice"),
    true
  );
});
