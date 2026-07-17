import assert from "node:assert/strict";
import test from "node:test";

import {
  assertNonProjectReadOwnerContractFamily,
  constructNonProjectReadOwnerContractFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/non_project_read_owner_contract_family.js";

const EXPECTED_VARIANTS = Object.freeze({
  "abg.operation.workspace.create": ["clean", "imported"],
  "abg.operation.workspace.open": ["open"],
  "abg.operation.product.verify": ["verify"],
  "abg.operation.product.resolve": ["resolve"],
  "abg.operation.product.install": ["install"],
  "abg.operation.workspace.bind": ["bind"],
  "abg.operation.catalog.admit": ["admit"],
  "abg.operation.catalog.view": ["allowlist"],
  "abg.operation.catalog.apply": ["node_type", "overlay"],
  "abg.operation.run.invoke": ["invoke", "start"],
  "abg.operation.run.continue": ["current_intent", "selected_action"],
  "abg.operation.interaction.respond": [
    "select",
    "approve",
    "reject",
    "assess",
    "answer_escalation"
  ],
  "abg.operation.result.assess": ["assess"],
  "abg.operation.witness.admit": [
    "reprice",
    "attest",
    "hygiene-stamp",
    "intake",
    "run-resumed",
    "run-stopped"
  ],
  "abg.operation.tuning.transition": ["propose", "ratify", "reject"],
  "abg.operation.conformance.evaluate": ["gtl_program"],
  "abg.operation.product.materialize": [
    "context_bootstrap",
    "configuration"
  ],
  "abg.operation.release.snapshot": ["published_rc", "tapped_release"]
});

function replaceVariant(family, operationId, variant, replacement) {
  return {
    ...family,
    [operationId]: {
      ...family[operationId],
      [variant]: replacement
    }
  };
}

test("T-281 composes the exact 18-operation and 35-key non-read family", async () => {
  const family = await constructNonProjectReadOwnerContractFamily();
  assert.deepEqual(Object.keys(family), Object.keys(EXPECTED_VARIANTS));
  for (const [operationId, variants] of Object.entries(EXPECTED_VARIANTS)) {
    assert.deepEqual(Object.keys(family[operationId]), variants);
  }
  assert.doesNotThrow(() => assertNonProjectReadOwnerContractFamily(family));
});

test("T-281 conserves 115 declared slots and 25 explicit nonterminal absences", async () => {
  const family = await constructNonProjectReadOwnerContractFamily();
  let definitions = 0;
  let declared = 0;
  let absent = 0;
  for (const variants of Object.values(family)) {
    for (const row of Object.values(variants)) {
      definitions += 1;
      declared += 3;
      if (row.nonterminal.kind === "nonterminal_not_declared") {
        absent += 1;
      } else {
        declared += 1;
      }
    }
  }
  assert.deepEqual(
    { definitions, declared, absent, total: declared + absent },
    { definitions: 35, declared: 115, absent: 25, total: 140 }
  );
});

test("T-281 subordinate slots retain owner authority without central contract-shape authority", async () => {
  const family = await constructNonProjectReadOwnerContractFamily();
  for (const variants of Object.values(family)) {
    for (const row of Object.values(variants)) {
      for (const slot of ["request", "result", "refusal", "nonterminal"]) {
        const contractSlot = row[slot];
        if (contractSlot.kind === "nonterminal_not_declared") {
          continue;
        }
        assert.equal(typeof contractSlot.ownerAuthorityRef, "string");
        assert.match(contractSlot.ownerAuthorityDigest, /^sha256:[0-9a-f]{64}$/u);
        assert.equal(Object.hasOwn(contractSlot, "contractShapeBasisRef"), false);
        assert.equal(Object.hasOwn(contractSlot, "contractShapeBasisDigest"), false);
      }
    }
  }
});

test("T-281 refuses missing and extra operations or slots", async () => {
  const family = await constructNonProjectReadOwnerContractFamily();
  const missing = { ...family };
  delete missing["abg.operation.workspace.open"];
  assert.throws(
    () => assertNonProjectReadOwnerContractFamily(missing),
    /expected 18 operations/u
  );
  assert.throws(
    () =>
      assertNonProjectReadOwnerContractFamily({
        ...family,
        "abg.operation.extra": family["abg.operation.workspace.open"]
      }),
    /expected 18 operations/u
  );
  assert.throws(
    () =>
      assertNonProjectReadOwnerContractFamily({
        ...family,
        [Symbol("hidden-extra")]: family["abg.operation.workspace.open"]
      }),
    /expected 18 operations/u
  );
  const withoutImported = {
    ...family,
    "abg.operation.workspace.create": {
      clean: family["abg.operation.workspace.create"].clean
    }
  };
  assert.throws(
    () => assertNonProjectReadOwnerContractFamily(withoutImported),
    /expected 35 keys and 140 exact coordinates/u
  );
  const clean = family["abg.operation.workspace.create"].clean;
  assert.throws(
    () =>
      assertNonProjectReadOwnerContractFamily(
        replaceVariant(
          family,
          "abg.operation.workspace.create",
          "clean",
          { ...clean, unexpected: true }
        )
      ),
    /expected exact keys/u
  );
  const { refusal: _removed, ...withoutRefusal } = clean;
  assert.throws(
    () =>
      assertNonProjectReadOwnerContractFamily(
        replaceVariant(
          family,
          "abg.operation.workspace.create",
          "clean",
          withoutRefusal
        )
      ),
    /expected exact keys/u
  );
});

test("T-281 refuses duplicate, cross-key, and slot substitution", async () => {
  const family = await constructNonProjectReadOwnerContractFamily();
  const clean = family["abg.operation.workspace.create"].clean;
  assert.throws(
    () =>
      assertNonProjectReadOwnerContractFamily({
        ...family,
        "abg.operation.workspace.open": {
          ...family["abg.operation.workspace.open"],
          clean
        }
      }),
    /cross-key definition/u
  );
  assert.throws(
    () =>
      assertNonProjectReadOwnerContractFamily(
        replaceVariant(
          family,
          "abg.operation.workspace.create",
          "clean",
          { ...clean, result: { ...clean.result, contract: clean.request.contract } }
        )
      ),
    /duplicate source locator/u
  );
  assert.throws(
    () =>
      assertNonProjectReadOwnerContractFamily(
        replaceVariant(
          family,
          "abg.operation.workspace.create",
          "clean",
          { ...clean, nonterminal: clean.request }
        )
      ),
    /slot mismatch/u
  );
});

test("T-281 refuses a contract whose locator and witness disagree", async () => {
  const family = await constructNonProjectReadOwnerContractFamily();
  const clean = family["abg.operation.workspace.create"].clean;
  const forgedContract = {
    ...clean.request.contract,
    schemaCoordinate: {
      ...clean.request.contract.schemaCoordinate,
      nativeLocator: clean.result.contract.schemaCoordinate.nativeLocator
    }
  };
  assert.throws(
    () =>
      assertNonProjectReadOwnerContractFamily(
        replaceVariant(
          family,
          "abg.operation.workspace.create",
          "clean",
          {
            ...clean,
            request: { ...clean.request, contract: forgedContract }
          }
        )
      ),
    /locator mismatch/u
  );
});

test("T-281 refuses owner-authority mutation after opaque resolution", async () => {
  const family = await constructNonProjectReadOwnerContractFamily();
  const clean = family["abg.operation.workspace.create"].clean;
  assert.throws(
    () =>
      assertNonProjectReadOwnerContractFamily(
        replaceVariant(
          family,
          "abg.operation.workspace.create",
          "clean",
          {
            ...clean,
            request: {
              ...clean.request,
              ownerAuthorityRef: "design://forged-owner"
            }
          }
        )
      ),
    /owner authority mismatch/u
  );
});
