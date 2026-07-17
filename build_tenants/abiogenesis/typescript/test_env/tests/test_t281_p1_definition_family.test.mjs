import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPrivatePublicOperationDefinitionFamily,
  inspectPrivatePublicOperationDefinitionFamily
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";

function assertDeepFrozen(value, seen = new Set()) {
  if (typeof value !== "object" || value === null || seen.has(value)) {
    return;
  }
  seen.add(value);
  assert.equal(Object.isFrozen(value), true);
  for (const key of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor !== undefined && "value" in descriptor) {
      assertDeepFrozen(descriptor.value, seen);
    }
  }
}

function assertGapOnly(result) {
  assert.equal(result.kind, "definition_family_gap");
  assert.ok(result.gaps.length > 0);
  assert.equal(new Set(result.gaps.map((gap) => JSON.stringify(gap))).size,
    result.gaps.length);
  assert.equal(Object.hasOwn(result, "family"), false);
  assert.equal(Object.hasOwn(result, "familyDigest"), false);
  assert.equal(Object.hasOwn(result, "privateProjections"), false);
}

test("T-281 P1 admits one exact private 19-operation family", async () => {
  const result = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(result.kind, "exact_family_admitted");
  assert.deepEqual(result.privateProjections.parityInventory, {
    operationCount: 19,
    nonProjectReadVariantCount: 35,
    projectReadCaseCount: 27,
    definitionCount: 62,
    finalSchemaCount: 196,
    absentNonterminalCount: 52,
    slotCount: 248
  });
  assert.equal(Object.keys(result.family).length, 19);
  assert.equal(
    Object.keys(result.family["abg.operation.project.read"]).length,
    27
  );
  assertDeepFrozen(result);

  const clean = result.family["abg.operation.workspace.create"].clean;
  assert.equal(clean.definitionKey.variant, "clean");
  assert.equal(clean.workspaceBindingRequirement, "forbidden");
  assert.equal(clean.authoritySlotRequirements.actor, "required");
  assert.equal(clean.adapterExitMap.acceptedNonTerminal, null);

  const start = result.family["abg.operation.run.invoke"].start;
  assert.deepEqual(start.capabilityRefs, [
    "abg.capability.catalog.invoke-graph-function@5",
    "abg.capability.runtime.execute-seven-term-c@5"
  ]);
  assert.deepEqual(start.defaults, [
    { field: "fh_mode", policy: { kind: "literal", value: "direct" } },
    { field: "root_mode", policy: { kind: "literal", value: "supervised" } }
  ]);
  assert.equal(start.adapterExitMap.acceptedNonTerminal, 3);
  assert.equal(start.authoritySlotRequirements.executionProgram, "exactly_one");

  const consensus =
    result.family["abg.operation.project.read"].ticket_consensus;
  assert.equal(consensus.definitionKey.caseKey, "ticket_consensus");
  assert.equal(consensus.resultContract.kind,
    "project_read_wrapped_result_contract");
  assert.equal(consensus.resultContract.projectionRelation.kind,
    "resolved_owner_projection_relation");
  assert.equal(consensus.nonTerminalContract, null);
});

test("T-281 P1 digest and private projections are deterministic and data-only", async () => {
  const left = await buildPrivatePublicOperationDefinitionFamily();
  const right = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(left.kind, "exact_family_admitted");
  assert.equal(right.kind, "exact_family_admitted");
  assert.equal(left.familyDigest, right.familyDigest);
  assert.deepEqual(left.definitionDigestProjection,
    right.definitionDigestProjection);
  assert.equal(left.privateProjections.operationAndVariantUnion.length, 62);
  assert.equal(left.privateProjections.jsonSchemas.length, 196);
  assert.equal(left.privateProjections.sdkCliCoordinates.length, 62);
  assert.equal(left.privateProjections.candidateCatalogRows.length, 19);
  assert.equal(
    left.privateProjections.candidateCatalogRows.reduce(
      (count, row) => count + row.definitions.length,
      0
    ),
    62
  );
  assert.ok(left.privateProjections.jsonSchemas.every(
    (row) => row.schema.$schema ===
      "https://json-schema.org/draft/2020-12/schema"
  ));
  assert.ok(left.privateProjections.candidateCatalogRows.every(
    (row) => row.definitions.every(
      (definition) => typeof definition.definitionDigest === "string"
    )
  ));

  const visit = (value) => {
    assert.notEqual(typeof value, "function");
    if (typeof value !== "object" || value === null) {
      return;
    }
    for (const child of Object.values(value)) {
      visit(child);
    }
  };
  visit(left.definitionDigestProjection);

  const reorderedRead = Object.freeze(Object.fromEntries(
    Object.entries(left.family["abg.operation.project.read"]).reverse()
  ));
  const reordered = Object.freeze({
    ...left.family,
    "abg.operation.project.read": reorderedRead
  });
  const reorderedAdmission =
    inspectPrivatePublicOperationDefinitionFamily(reordered);
  assert.equal(reorderedAdmission.kind, "exact_family_admitted");
  assert.equal(reorderedAdmission.familyDigest, left.familyDigest);
  assert.deepEqual(
    reorderedAdmission.privateProjections,
    left.privateProjections
  );

  const reconstructedClean = Object.freeze({
    ...left.family["abg.operation.workspace.create"].clean
  });
  const reconstructed = Object.freeze({
    ...left.family,
    "abg.operation.workspace.create": Object.freeze({
      ...left.family["abg.operation.workspace.create"],
      clean: reconstructedClean
    })
  });
  assert.equal(
    inspectPrivatePublicOperationDefinitionFamily(reconstructed).kind,
    "exact_family_admitted"
  );
});

test("T-281 P1 refuses missing, extra, and cross-key families all-or-nothing", async () => {
  const admitted = await buildPrivatePublicOperationDefinitionFamily();
  assert.equal(admitted.kind, "exact_family_admitted");
  const family = admitted.family;

  const missing = Object.freeze({
    ...family,
    "abg.operation.workspace.create": Object.freeze({
      imported: family["abg.operation.workspace.create"].imported
    })
  });
  assertGapOnly(inspectPrivatePublicOperationDefinitionFamily(missing));

  const extra = Object.freeze({
    ...family,
    "abg.operation.legacy.start": Object.freeze({})
  });
  assertGapOnly(inspectPrivatePublicOperationDefinitionFamily(extra));

  const crossKey = Object.freeze({
    ...family,
    "abg.operation.workspace.create": Object.freeze({
      ...family["abg.operation.workspace.create"],
      clean: family["abg.operation.workspace.open"].open
    })
  });
  assertGapOnly(inspectPrivatePublicOperationDefinitionFamily(crossKey));

  const clean = family["abg.operation.workspace.create"].clean;
  const hiddenAuthority = Object.freeze({
    ...clean,
    hiddenAuthority: "parallel"
  });
  assertGapOnly(inspectPrivatePublicOperationDefinitionFamily(Object.freeze({
    ...family,
    "abg.operation.workspace.create": Object.freeze({
      ...family["abg.operation.workspace.create"],
      clean: hiddenAuthority
    })
  })));

  const forgedContract = Object.freeze({
    ...clean.requestContract.contract,
    projectedSchema: Object.freeze({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "null"
    })
  });
  const forgedSchemaDefinition = Object.freeze({
    ...clean,
    requestContract: Object.freeze({
      ...clean.requestContract,
      contract: forgedContract
    })
  });
  assertGapOnly(inspectPrivatePublicOperationDefinitionFamily(Object.freeze({
    ...family,
    "abg.operation.workspace.create": Object.freeze({
      ...family["abg.operation.workspace.create"],
      clean: forgedSchemaDefinition
    })
  })));

  const consensus = family["abg.operation.project.read"].ticket_consensus;
  const forgedRelation = Object.freeze({
    kind: "resolved_owner_projection_relation",
    witness: consensus.resultContract.projectionRelation.witness
  });
  const forgedRelationDefinition = Object.freeze({
    ...consensus,
    resultContract: Object.freeze({
      ...consensus.resultContract,
      projectionRelation: forgedRelation
    })
  });
  assertGapOnly(inspectPrivatePublicOperationDefinitionFamily(Object.freeze({
    ...family,
    "abg.operation.project.read": Object.freeze({
      ...family["abg.operation.project.read"],
      ticket_consensus: forgedRelationDefinition
    })
  })));
});
