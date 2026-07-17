import assert from "node:assert/strict";
import test from "node:test";

import * as v from "valibot";

import {
  admitPublicOutcome,
  constructPublicOutcome,
  definitionKeySchemaFor
} from "../../build/semantic/code/src/app/m04/public_contracts/native_contract_phase_a.js";
import {
  PROJECT_READ_CASE_FAMILY,
  assertProjectReadCaseFamily,
  resolveProjectReadCaseRow
} from "../../build/semantic/code/src/app/m04/public_contracts/project_read_case_family.js";
import {
  PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES
} from "../../build/semantic/code/src/app/m04/public_contracts/project_read_operation_contracts.js";
import {
  CONSENSUS_PUBLIC_CONTRACT_SOURCES
} from "../../build/semantic/code/src/abg/m03/contracts/consensus_contract_family.js";
import { stableSha256Digest } from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  applyResolvedOwnerProjectionRelation,
  resolveSemanticBuildNativeSchemaSource,
  resolveSemanticBuildOwnerProjectionRelation
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";
import { freezeNativeValue } from "../../build/semantic/code/src/shared/validation/immutable_native_value.js";

const D1 = `sha256:${"1".repeat(64)}`;
const D2 = `sha256:${"2".repeat(64)}`;
const coordinate = (ref, digest = D1) => Object.freeze({ ref, digest });

function assertDeepFrozen(value, seen = new Set()) {
  if (
    typeof value !== "object" ||
    value === null ||
    seen.has(value)
  ) {
    return;
  }
  seen.add(value);
  assert.equal(Object.isFrozen(value), true);
  for (const member of Reflect.ownKeys(value)) {
    const descriptor = Object.getOwnPropertyDescriptor(value, member);
    if (descriptor !== undefined && "value" in descriptor) {
      assertDeepFrozen(descriptor.value, seen);
    }
  }
}

function runStatusRequest(projectionBasis = coordinate(`project-read-basis:${D1}`)) {
  return {
    kind: "project_read_request",
    caseKey: "run_status",
    source: {
      kind: "Run",
      sourceRef: "run:one",
      sourceDigest: D1
    },
    projectionBasis,
    selector: {}
  };
}

function runStatusProjection(runRef = "run:one", runDigest = D1) {
  return {
    kind: "runtime_status_projection",
    projection: coordinate("projection:run-status"),
    subject: { kind: "Run", ref: runRef, digest: runDigest },
    substrate: {
      program: coordinate("program:one"),
      workspaceBinding: coordinate("workspace-binding:one"),
      executionBasis: coordinate("execution-basis:one")
    },
    lifecycle: {
      kind: "nonterminal",
      disposition: "pending",
      stop: null,
      terminal: null,
      pendingInteraction: null
    },
    resultRefs: [],
    gapRefs: [],
    evidenceRefs: [],
    replayRefs: [],
    provenanceRefs: []
  };
}

function runStatusResult(
  projection = runStatusProjection(),
  projectionBasis = coordinate(`project-read-basis:${D1}`)
) {
  return {
    kind: "project_read_result",
    caseKey: "run_status",
    projectionBasis,
    projection
  };
}

async function runStatusOutcomeFixture() {
  const row = PROJECT_READ_CASE_FAMILY.run_status;
  const resolved = await resolveProjectReadCaseRow(row);
  const definitionKeySchema = definitionKeySchemaFor(row.definitionKey);
  const definitionDigest = stableSha256Digest({
    definitionKey: row.definitionKey,
    contract: resolved.result.contract.schemaCoordinate
  });
  const request = runStatusRequest();
  const invocation = Object.freeze({
    invocationRef: "invocation:project-read-run-status",
    invocationDigest: D2,
    definitionKey: row.definitionKey,
    definitionDigest,
    correlationRef: "correlation:project-read-run-status",
    request
  });
  const contracts = Object.freeze({
    result: resolved.result.contract.schemaCoordinate,
    refusal: resolved.refusal.contract.schemaCoordinate,
    nonTerminal: null
  });
  const candidateFor = (value) =>
    constructPublicOutcome({
      definitionKeySchema,
      outcomeKind: "result",
      outcomeRef: "outcome:project-read-run-status",
      invocationRef: invocation.invocationRef,
      invocationDigest: invocation.invocationDigest,
      definitionKey: row.definitionKey,
      definitionDigest,
      payloadRef: "payload:project-read-run-status",
      payloadContract: contracts.result,
      value,
      evidenceRefs: ["evidence:project-read-run-status"],
      correlationRef: invocation.correlationRef,
      provenanceRefs: ["provenance:project-read-run-status"]
    });
  const admit = (raw, resultBinding = {
    kind: "request_related_projection",
    relation: resolved.result.projectionRelation
  }) =>
    admitPublicOutcome({
      definitionKeySchema,
      resultSchema: resolved.result.contract.schema,
      refusalSchema: resolved.refusal.contract.schema,
      nonTerminalSchema: null,
      resultBinding,
      invocation,
      contracts,
      raw
    });
  return { row, resolved, definitionKeySchema, definitionDigest, invocation,
    contracts, candidateFor, admit };
}

test("T-281 central project.read family has 27 cases and 135 unique P1 coordinates", () => {
  const caseKeys = Object.keys(PROJECT_READ_CASE_FAMILY);
  assert.deepEqual(
    caseKeys,
    Object.keys(PROJECT_READ_OPERATION_NATIVE_CONTRACT_SOURCES)
  );
  assert.equal(caseKeys.length, 27);

  const locators = new Set();
  for (const [caseKey, row] of Object.entries(PROJECT_READ_CASE_FAMILY)) {
    assert.deepEqual(Reflect.ownKeys(row), [
      "definitionKey",
      "request",
      "result",
      "refusal",
      "nonterminal"
    ]);
    assert.deepEqual(row.definitionKey, {
      operationId: "abg.operation.project.read",
      memberKind: "project_read_case",
      caseKey
    });
    assert.equal(row.request.coordinate.slot, "request");
    assert.equal(row.result.coordinate.slot, "result");
    assert.equal(row.result.kind, "project_read_wrapped_result_source");
    assert.equal(row.refusal.coordinate.slot, "refusal");
    assert.deepEqual(row.nonterminal, {
      kind: "nonterminal_not_declared",
      coordinate: { definitionKey: row.definitionKey, slot: "nonterminal" }
    });
    assert.equal(
      row.result.projection.relationSource.kind,
      "owner_projection_relation_source"
    );

    for (const locator of [
      row.request.source.sourceLocator,
      row.result.projection.source.sourceLocator,
      row.result.projection.relationSource.sourceLocator,
      row.result.source.sourceLocator,
      row.refusal.source.sourceLocator
    ]) {
      locators.add(JSON.stringify(locator));
    }
  }
  assert.equal(locators.size, 135);
  assert.doesNotThrow(() => assertProjectReadCaseFamily(PROJECT_READ_CASE_FAMILY));
  assertDeepFrozen(PROJECT_READ_CASE_FAMILY);
});

test("T-281 central family resolves all 27 wrapped result contracts and relation witnesses", async () => {
  const resolvedRows = await Promise.all(
    Object.values(PROJECT_READ_CASE_FAMILY).map(resolveProjectReadCaseRow)
  );
  assert.equal(resolvedRows.length, 27);

  for (const [index, resolved] of resolvedRows.entries()) {
    const row = Object.values(PROJECT_READ_CASE_FAMILY)[index];
    assert.equal(resolved.kind, "project_read_contract_resolved");
    assert.equal(resolved.result.kind, "project_read_wrapped_result_contract");
    assert.equal(resolved.request.contract.schema, row.request.source.schema);
    assert.equal(
      resolved.result.projectionContract.schema,
      row.result.projection.source.schema
    );
    assert.equal(resolved.result.contract.schema, row.result.source.schema);
    assert.notEqual(
      resolved.result.contract.schema,
      resolved.result.projectionContract.schema
    );
    assert.equal(resolved.refusal.contract.schema, row.refusal.source.schema);
    assert.match(
      resolved.result.projectionWitnessDigest,
      /^sha256:[0-9a-f]{64}$/u
    );
    assert.match(
      resolved.result.projectionRelationWitnessDigest,
      /^sha256:[0-9a-f]{64}$/u
    );
    assert.equal(
      resolved.result.projectionRelation.witness.relationWitnessDigest,
      resolved.result.projectionRelationWitnessDigest
    );
    assert.equal(
      resolved.result.projectionRelation.witness.sourceLocator.modulePath,
      row.result.projection.source.sourceLocator.modulePath
    );
  }
});

test("T-281 result contract admits the wrapper and rejects the raw projection", async () => {
  const { resolved } = await runStatusOutcomeFixture();
  const projection = runStatusProjection();
  const wrapper = runStatusResult(projection);
  assert.equal(v.safeParse(resolved.result.projectionContract.schema, projection).success, true);
  assert.equal(v.safeParse(resolved.result.contract.schema, wrapper).success, true);
  assert.equal(v.safeParse(resolved.result.contract.schema, projection).success, false);
});

test("T-281 central outcome admission rejects run identity drift as relation_mismatch", async () => {
  const { candidateFor, admit } = await runStatusOutcomeFixture();
  const admitted = admit(candidateFor(runStatusResult()));
  assert.equal(admitted.kind, "public_outcome");

  const mismatch = admit(
    candidateFor(runStatusResult(runStatusProjection("run:other", D2)))
  );
  assert.equal(mismatch.kind, "outcome_admission_failure");
  assert.equal(mismatch.failureClass, "relation_mismatch");
  assert.deepEqual(mismatch.definitionKey, {
    operationId: "abg.operation.project.read",
    memberKind: "project_read_case",
    caseKey: "run_status"
  });
});

test("T-281 central outcome admission conserves the admitted request basis", async () => {
  const { candidateFor, admit } = await runStatusOutcomeFixture();
  const differentBasis = coordinate(`project-read-basis:${D2}`, D2);
  const mismatch = admit(
    candidateFor(runStatusResult(runStatusProjection(), differentBasis))
  );
  assert.equal(mismatch.kind, "outcome_admission_failure");
  assert.equal(mismatch.failureClass, "relation_mismatch");
  assert.ok(
    mismatch.issuePaths.some((path) => path.includes("projectionBasis"))
  );
});

test("T-281 relation resolution refuses wrong owner module and semantic basis", async () => {
  const row = PROJECT_READ_CASE_FAMILY.run_status;
  const projectionSource = await resolveSemanticBuildNativeSchemaSource(
    row.result.projection.source
  );
  const relationSource = row.result.projection.relationSource;
  const wrongModule = freezeNativeValue({
    ...relationSource,
    sourceLocator: {
      ...relationSource.sourceLocator,
      modulePath:
        "code/src/abg/m03/contracts/catalog_operation_contracts.js"
    }
  });
  assert.throws(
    () => resolveSemanticBuildOwnerProjectionRelation({
      source: wrongModule,
      projectionSource,
      expectedDefinitionKey: row.definitionKey,
      expectedSemanticOwnerBasis: {
        ref: row.result.projection.ownerAuthorityRef,
        digest: row.result.projection.ownerAuthorityDigest
      }
    }),
    /projection module mismatch/u
  );
  assert.throws(
    () => resolveSemanticBuildOwnerProjectionRelation({
      source: relationSource,
      projectionSource,
      expectedDefinitionKey: row.definitionKey,
      expectedSemanticOwnerBasis: {
        ref: row.result.projection.ownerAuthorityRef,
        digest: D2
      }
    }),
    /semantic owner mismatch/u
  );
});

test("T-281 catalog relation refuses selector drift", async () => {
  const row = PROJECT_READ_CASE_FAMILY.catalog_describe;
  const resolved = await resolveProjectReadCaseRow(row);
  const request = {
    kind: "project_read_request",
    caseKey: "catalog_describe",
    source: {
      kind: "Catalog",
      sourceRef: "catalog:one",
      sourceDigest: D1
    },
    projectionBasis: coordinate(`project-read-basis:${D1}`),
    selector: {
      visibilityBasis: "workspace_catalog",
      canonicalHandle: "graph-function:consensus"
    }
  };
  const result = applyResolvedOwnerProjectionRelation({
    relation: resolved.result.projectionRelation,
    definitionKey: row.definitionKey,
    admittedRequest: request,
    candidateProjection: {
      catalog: coordinate("catalog:one"),
      visibilityBasis: "workspace_catalog",
      canonicalHandle: "graph-function:other"
    }
  });
  assert.equal(result.kind, "projection_relation_mismatch");
  assert.ok(result.issuePaths.some((path) => path.includes("canonicalHandle")));
});

test("T-281 exact-key census rejects symbol and non-enumerable additions", () => {
  const symbolExtended = { ...PROJECT_READ_CASE_FAMILY };
  Object.defineProperty(symbolExtended, Symbol("hidden-case"), {
    value: PROJECT_READ_CASE_FAMILY.run_status,
    enumerable: false
  });
  assert.throws(
    () => assertProjectReadCaseFamily(symbolExtended),
    /expected exact keys/u
  );

  const hiddenRow = { ...PROJECT_READ_CASE_FAMILY.run_status };
  Object.defineProperty(hiddenRow, "hiddenAuthority", {
    value: "forbidden",
    enumerable: false
  });
  assert.throws(
    () => assertProjectReadCaseFamily({
      ...PROJECT_READ_CASE_FAMILY,
      run_status: hiddenRow
    }),
    /expected exact keys/u
  );
});

test("T-281 every project.read outcome requires a relation and non-read forbids it", async () => {
  const fixture = await runStatusOutcomeFixture();
  const candidate = fixture.candidateFor(runStatusResult());
  const missingRelation = fixture.admit(candidate, { kind: "schema_only" });
  assert.equal(missingRelation.failureClass, "relation_mismatch");
  assert.deepEqual(missingRelation.issuePaths, ["resultBinding"]);

  const workspaceKey = Object.freeze({
    operationId: "abg.operation.workspace.create",
    memberKind: "variant",
    variant: "clean"
  });
  const forbiddenRelation = admitPublicOutcome({
    definitionKeySchema: definitionKeySchemaFor(workspaceKey),
    resultSchema: fixture.resolved.result.contract.schema,
    refusalSchema: fixture.resolved.refusal.contract.schema,
    nonTerminalSchema: null,
    resultBinding: {
      kind: "request_related_projection",
      relation: fixture.resolved.result.projectionRelation
    },
    invocation: {
      ...fixture.invocation,
      definitionKey: workspaceKey
    },
    contracts: fixture.contracts,
    raw: constructPublicOutcome({
      definitionKeySchema: definitionKeySchemaFor(workspaceKey),
      outcomeKind: "result",
      outcomeRef: "outcome:non-read-relation-forbidden",
      invocationRef: fixture.invocation.invocationRef,
      invocationDigest: fixture.invocation.invocationDigest,
      definitionKey: workspaceKey,
      definitionDigest: fixture.definitionDigest,
      payloadRef: "payload:non-read-relation-forbidden",
      payloadContract: fixture.contracts.result,
      value: runStatusResult(),
      evidenceRefs: [],
      correlationRef: fixture.invocation.correlationRef,
      provenanceRefs: []
    })
  });
  assert.equal(forbiddenRelation.failureClass, "relation_mismatch");
  assert.deepEqual(forbiddenRelation.issuePaths, ["resultBinding"]);
});

test("T-281 ticket_consensus retains the unchanged T-274A projection source", () => {
  const projection = PROJECT_READ_CASE_FAMILY.ticket_consensus.result.projection;
  assert.equal(
    projection.source,
    CONSENSUS_PUBLIC_CONTRACT_SOURCES.ticket_consensus_projection
  );
  assert.deepEqual(projection.source.sourceLocator.memberPath, [
    "ticket_consensus_projection",
    "schema"
  ]);
});
