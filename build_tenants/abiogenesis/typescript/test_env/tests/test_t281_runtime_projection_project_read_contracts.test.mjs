import assert from "node:assert/strict";
import test from "node:test";

import * as v from "valibot";

import {
  RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES,
  RUNTIME_PROJECTION_NATIVE_CHECK_REGISTRY
} from "../../build/semantic/code/src/abg/m03/contracts/runtime_projection_operation_contracts.js";
import {
  createRuntimeEventEmitterContext,
  emitWithContext
} from "../../build/semantic/code/src/abg/m03/events/index.js";
import {
  deriveCanonicalNativeSchemaProjection,
  resolveSemanticBuildNativeSchemaSource
} from "../../build/semantic/code/src/shared/validation/canonical_native_schema_projector.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";

const D = "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const RUN = "run://t281/runtime-projection";

function coordinate(ref) {
  return { ref, digest: D };
}

function subject(kind, ref) {
  return { kind, ref, digest: D };
}

function absent() {
  return { kind: "absent" };
}

function resultRow(subjectValue, graphCallRef, resultRef) {
  return {
    result: coordinate(resultRef),
    subject: subjectValue,
    graphCall: coordinate(graphCallRef),
    declaredContract: coordinate("contract://result"),
    disposition: "converged",
    closureEligible: true,
    residualRefs: [],
    payload: absent(),
    artifact: absent(),
    assessment: absent(),
    evidenceRefs: ["evidence://result"],
    provenanceRefs: ["provenance://result"],
    replay: coordinate("replay://result")
  };
}

function evidenceRow(subjectValue, evidenceRef) {
  return {
    evidence: coordinate(evidenceRef),
    evidenceContract: coordinate("contract://evidence"),
    admittedValue: { kind: "typed_evidence", satisfied: true },
    subject: subjectValue,
    material: {
      kind: "content",
      content: coordinate(`content://${evidenceRef}`)
    },
    producer: coordinate("actor://producer"),
    basis: coordinate("basis://evidence"),
    provenanceRefs: ["provenance://evidence"],
    replay: coordinate("replay://evidence")
  };
}

function canonicalRunEvents() {
  const context = createRuntimeEventEmitterContext({ source: "live" });
  return emitWithContext(context, [
    {
      kind: "basis_admitted",
      basisId: "basis://t281/one",
      graphFunctionId: "graph-function://t281/runtime-projection",
      jobId: "job://t281/runtime-projection",
      resolvedRuntimeRef: "runtime://typescript/node",
      resolvedPolicyBundleRef: "policy://t281/runtime-projection",
      runId: RUN,
      workKey: "work://t281/runtime-projection",
      startAdmissionWitnessDigest: null
    },
    {
      kind: "basis_admitted",
      basisId: "basis://t281/two",
      graphFunctionId: "graph-function://t281/runtime-projection",
      jobId: "job://t281/runtime-projection",
      resolvedRuntimeRef: "runtime://typescript/node",
      resolvedPolicyBundleRef: "policy://t281/runtime-projection",
      runId: RUN,
      workKey: "work://t281/runtime-projection",
      startAdmissionWitnessDigest: null
    }
  ], () => {});
}

function replayRow(event) {
  return {
    ordinal: event.eventAdmissionOrdinal,
    event: {
      ref: event.eventId,
      digest: stableSha256Digest(event)
    },
    sourceRefs: [RUN],
    admittedEvent: event
  };
}

const projectRead = RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read;
const sources = Object.values(projectRead).map((entry) => entry.result);
const semanticOwnerClauseByCase = Object.freeze({
  run_status: "REQ-P-POLICY-026",
  graph_call_status: "REQ-P-POLICY-026",
  run_result: "REQ-P-POLICY-027",
  graph_call_result: "REQ-P-POLICY-027",
  run_evidence: "REQ-P-POLICY-055",
  graph_call_evidence: "REQ-P-POLICY-055",
  result_evidence: "REQ-P-POLICY-055",
  workspace_replay: "REQ-P-POLICY-028",
  run_replay: "REQ-P-POLICY-028",
  graph_call_replay: "REQ-P-POLICY-028",
  interaction_replay: "REQ-P-POLICY-028",
  continuation_replay: "REQ-P-POLICY-028",
  c_call_replay: "REQ-P-POLICY-028"
});

test("T-281 runtime projection owner sources cover 13 exact result coordinates", () => {
  assert.deepEqual(Object.keys(projectRead), [
    "run_status",
    "graph_call_status",
    "run_result",
    "graph_call_result",
    "run_evidence",
    "graph_call_evidence",
    "result_evidence",
    "workspace_replay",
    "run_replay",
    "graph_call_replay",
    "interaction_replay",
    "continuation_replay",
    "c_call_replay"
  ]);
  assert.equal(sources.length, 13);
  assert.equal(RUNTIME_PROJECTION_NATIVE_CHECK_REGISTRY.checks.length, 11);
  for (const [caseKey, entry] of Object.entries(projectRead)) {
    const source = entry.result;
    assert.equal(source.authority.subject.operationId, "abg.operation.project.read");
    assert.equal(source.authority.subject.memberKind, "project_read_case");
    assert.equal(source.authority.subject.caseKey, caseKey);
    assert.equal(source.authority.subject.slot, "result");
    assert.equal(
      source.authority.semanticOwnerBasis.ref,
      `specification/requirements/product/REQ-P-POLICY.md#${semanticOwnerClauseByCase[caseKey]}`
    );
    assert.deepEqual(source.sourceLocator.memberPath, [
      "project_read",
      caseKey,
      "result",
      "schema"
    ]);
    assert.deepEqual(source.namedChecks, {
      kind: "family_registry",
      exportName: "RUNTIME_PROJECTION_NATIVE_CHECK_REGISTRY",
      memberPath: []
    });
    assert.equal(Object.isFrozen(source), true);
  }
});

test("T-281 runtime projection sources resolve and project from their owner module", async () => {
  for (const source of sources) {
    const resolved = await resolveSemanticBuildNativeSchemaSource(source);
    const projection = deriveCanonicalNativeSchemaProjection({
      source: resolved,
      schemaRef: source.identity.schemaId,
      schemaVersion: source.identity.schemaVersion
    });
    assert.deepEqual(projection.witness.sourceLocator, source.sourceLocator);
    assert.deepEqual(projection.witness.namedCheckSource, source.namedChecks);
    assert.match(projection.witness.projectionDigest, /^sha256:[0-9a-f]{64}$/u);
    const caseKey = source.authority.subject.caseKey;
    assert.equal(
      projection.witness.namedChecks.length,
      caseKey.endsWith("_status") ? 0 : 1
    );
  }
});

test("T-281 status projections encode lifecycle and F_H interaction structurally", () => {
  const schema = projectRead.run_status.result.schema;
  const base = {
    kind: "runtime_status_projection",
    projection: coordinate("projection://run-status"),
    subject: subject("Run", RUN),
    substrate: {
      program: coordinate("program://one"),
      workspaceBinding: coordinate("binding://one"),
      executionBasis: coordinate("basis://one")
    },
    resultRefs: [],
    gapRefs: [],
    evidenceRefs: [],
    replayRefs: ["replay://run"],
    provenanceRefs: []
  };
  assert.equal(v.parse(schema, {
    ...base,
    lifecycle: {
      kind: "nonterminal",
      disposition: "held",
      stop: coordinate("stop://held"),
      terminal: null,
      pendingInteraction: coordinate("interaction://pending")
    }
  }).lifecycle.disposition, "held");
  assert.equal(v.parse(schema, {
    ...base,
    lifecycle: {
      kind: "terminal",
      disposition: "completed",
      stop: null,
      terminal: coordinate("terminal://completed"),
      pendingInteraction: null
    }
  }).lifecycle.kind, "terminal");
  assert.throws(() => v.parse(schema, {
    ...base,
    lifecycle: {
      kind: "nonterminal",
      disposition: "held",
      stop: coordinate("stop://held"),
      terminal: null,
      pendingInteraction: null
    }
  }));
  assert.throws(() => v.parse(schema, {
    ...base,
    lifecycle: {
      kind: "terminal",
      disposition: "completed",
      stop: coordinate("stop://forbidden"),
      terminal: coordinate("terminal://completed"),
      pendingInteraction: null
    }
  }));
});

test("T-281 result projections conserve subjects, result identity, and cardinality", () => {
  const runSchema = projectRead.run_result.result.schema;
  const runSubject = subject("Run", RUN);
  const first = resultRow(runSubject, "graph-call://one", "result://one");
  const second = resultRow(runSubject, "graph-call://two", "result://two");
  const runProjection = {
    kind: "run_result_projection",
    projection: coordinate("projection://run-result"),
    subject: runSubject,
    results: [first, second]
  };
  assert.equal(v.parse(runSchema, runProjection).results.length, 2);
  assert.throws(() => v.parse(runSchema, {
    ...runProjection,
    results: [first, { ...second, result: first.result }]
  }), /conserve subject and result identity/u);
  assert.throws(() => v.parse(runSchema, {
    ...runProjection,
    results: [first, { ...second, graphCall: first.graphCall }]
  }), /conserve subject and result identity/u);
  assert.throws(() => v.parse(runSchema, {
    ...runProjection,
    results: [
      first,
      { ...second, subject: subject("Run", "run://other") }
    ]
  }), /conserve subject and result identity/u);
  assert.throws(() => v.parse(runSchema, { ...runProjection, results: [] }));

  const graphCallSchema = projectRead.graph_call_result.result.schema;
  const graphCallSubject = subject("GraphCall", "graph-call://one");
  const graphProjection = {
    kind: "graph_call_result_projection",
    projection: coordinate("projection://graph-call-result"),
    subject: graphCallSubject,
    result: resultRow(graphCallSubject, graphCallSubject.ref, "result://one")
  };
  assert.equal(v.parse(graphCallSchema, graphProjection).result.result.ref, "result://one");
  assert.throws(() => v.parse(graphCallSchema, {
    ...graphProjection,
    result: {
      ...graphProjection.result,
      graphCall: coordinate("graph-call://other")
    }
  }), /conserve subject and result identity/u);
});

test("T-281 evidence projections conserve exact subject and evidence identities", () => {
  const schema = projectRead.run_evidence.result.schema;
  const runSubject = subject("Run", RUN);
  const first = evidenceRow(runSubject, "evidence://one");
  const second = evidenceRow(runSubject, "evidence://two");
  const projection = {
    kind: "evidence_projection",
    projection: coordinate("projection://run-evidence"),
    subject: runSubject,
    rows: [first, second]
  };
  assert.equal(v.parse(schema, projection).rows.length, 2);
  assert.throws(() => v.parse(schema, {
    ...projection,
    rows: [first, { ...second, evidence: first.evidence }]
  }), /conserve subject and evidence identity/u);
  assert.throws(() => v.parse(schema, {
    ...projection,
    rows: [first, { ...second, subject: subject("Run", "run://other") }]
  }), /conserve subject and evidence identity/u);
  assert.throws(() => v.parse(schema, { ...projection, rows: [] }));
});

test("T-281 replay projections admit canonical events and exact ordinal pages", () => {
  const schema = projectRead.run_replay.result.schema;
  const rows = canonicalRunEvents().map(replayRow);
  const projection = {
    kind: "replay_projection",
    projection: coordinate("projection://run-replay"),
    subject: subject("Run", RUN),
    basis: coordinate("basis://replay"),
    fromOrdinal: rows[0].ordinal,
    limit: 2,
    returnedThroughOrdinal: rows[1].ordinal,
    nextOrdinal: null,
    rows
  };
  assert.equal(v.parse(schema, projection).rows.length, 2);
  assert.throws(() => v.parse(schema, {
    ...projection,
    rows: [rows[1], rows[0]],
    returnedThroughOrdinal: rows[0].ordinal
  }), /canonical, subject-bound, and ordinal-consistent/u);
  assert.throws(() => v.parse(schema, {
    ...projection,
    rows: [{ ...rows[0], event: coordinate("runtime-event://wrong") }],
    returnedThroughOrdinal: rows[0].ordinal,
    limit: 1
  }), /canonical, subject-bound, and ordinal-consistent/u);
  assert.throws(() => v.parse(schema, {
    ...projection,
    rows: [{ ...rows[0], sourceRefs: ["run://other"] }],
    returnedThroughOrdinal: rows[0].ordinal,
    limit: 1
  }), /canonical, subject-bound, and ordinal-consistent/u);
  const duplicateEventIdentity = {
    ...rows[1],
    admittedEvent: {
      ...rows[1].admittedEvent,
      eventId: rows[0].admittedEvent.eventId
    }
  };
  duplicateEventIdentity.event = {
    ref: duplicateEventIdentity.admittedEvent.eventId,
    digest: stableSha256Digest(duplicateEventIdentity.admittedEvent)
  };
  assert.throws(() => v.parse(schema, {
    ...projection,
    rows: [rows[0], duplicateEventIdentity]
  }), /canonical, subject-bound, and ordinal-consistent/u);
  assert.throws(() => v.parse(schema, {
    ...projection,
    rows: [rows[0]],
    returnedThroughOrdinal: rows[0].ordinal,
    limit: 2,
    nextOrdinal: rows[1].ordinal
  }), /canonical, subject-bound, and ordinal-consistent/u);
  assert.throws(() => v.parse(schema, {
    ...projection,
    subject: subject("subordinate", RUN)
  }));
  assert.throws(() => v.parse(schema, {
    ...projection,
    rows: [{
      ...rows[0],
      admittedEvent: { ...rows[0].admittedEvent, eventAdmissionOrdinal: -1 }
    }],
    returnedThroughOrdinal: rows[0].ordinal,
    limit: 1
  }), /canonical, subject-bound, and ordinal-consistent/u);
});
