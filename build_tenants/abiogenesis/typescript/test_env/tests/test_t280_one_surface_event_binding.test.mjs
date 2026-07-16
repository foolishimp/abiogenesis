// Validates: T-280 exact One Surface replay/result binding.

import assert from "node:assert/strict";
import test from "node:test";

import {
  admitOneSurfaceResultForClose,
  buildOneSurfaceAuthorityCloseEvents,
  compileOneSurfaceGtlProgramApplication,
  constructOneSurfaceAuthorityResultRule,
  constructOneSurfaceTypedRefusal,
  deriveOneSurfaceAuthorityReplayProjection,
  deriveRuntimeEventCalculusProjection,
  loadGtlTargetCarrierDefaultsBundle,
  projectOneSurfaceAuthorityResult,
  resolveTargetCarrierContractBinding
} from "../../build/semantic/code/src/index.js";
import {
  mintTargetCarrierPayloadIdentity
} from "../../build/semantic/code/src/abg/m03/contracts/payload_ledger.js";
import {
  oneSurfaceAuthoritySnapshotBasis
} from "../../build/semantic/code/src/abg/m03/runner/one_surface_result_projection.js";
import {
  stableSha256Digest
} from "../../build/semantic/code/src/shared/runtime_identity.js";
import {
  scenario09OneSurfaceProgramFixture
} from "../fixtures/t280_scenario09_one_surface_fixture.mjs";

function stageAuthorities(fixture) {
  return Object.freeze(fixture.compiled.map((row) => Object.freeze({
    functionKind: row.member.stageRole,
    stage: row.bundle.computeStageBindings[0],
    plan: row.source.completeProgramPlan,
    resultAuthority: row.authorities[0],
    traversalContracts: row.bundle
  })));
}

function firstLeaf(node) {
  if (node.kind === "compiled_c_stage_leaf") return node;
  if (node.kind === "compiled_c_sequence") return firstLeaf(node.children[0]);
  if (node.kind === "compiled_c_complete_batch") return firstLeaf(node.tasks[0].child);
  return firstLeaf(node.child);
}

async function replayFixture() {
  const source = scenario09OneSurfaceProgramFixture();
  const compilation = await compileOneSurfaceGtlProgramApplication({
    gtlProgram: source.gtlProgram,
    stageAuthorities: stageAuthorities(source),
    recursePlan: source.recursePlan
  });
  assert.notEqual(compilation.authorityProgram, null);
  const application = compilation.authorityProgram;
  const stage = application.stages[0];
  const contract = resolveTargetCarrierContractBinding({
    vector: source.members[0].finalVector,
    defaults: loadGtlTargetCarrierDefaultsBundle()
  });
  assert.equal(
    contract.contractRef,
    stage.resultAuthority.selectedResultContractRef
  );
  assert.equal(
    contract.configDigest,
    stage.targetCarrierContract.targetCarrierContractDigest
  );
  return Object.freeze({ application, contract, stage });
}

function artifact(contract, stage, value) {
  return Object.freeze({
    kind: contract.outputCarrierKind,
    targetAssetType: contract.outputCarrierKind,
    edgeRef: stage.targetCarrierContract.edgeRef,
    contractRef: contract.contractRef,
    contractDigest: contract.configDigest,
    payload: value
  });
}

function attempt(input) {
  const {
    application,
    artifactValue,
    closeValue = artifactValue,
    contract,
    inputDigest,
    ordinal,
    stage
  } = input;
  const basisId = "basis://t280/exact-event-binding";
  const graphCallId = "graph-call://t280/exact-event-binding";
  const frameId = "frame://t280/exact-event-binding";
  const vectorIndex = 0;
  const edge = stage.targetCarrierContract.edgeRef;
  const cCallRef = `c-call://t280/exact-event-binding/${String(ordinal)}`;
  const authoritySnapshotRef =
    `authority-snapshot://t280/exact-event-binding/${String(ordinal)}`;
  const validationRef = `validation://t280/exact-event-binding/${String(ordinal)}`;
  const ordinaryEvidenceRef = `evidence://t280/exact-event-binding/${String(ordinal)}`;
  const sourceEventRef = `event://t280/exact-event-binding/${String(ordinal)}`;
  const closeAdmission = admitOneSurfaceResultForClose(
    stage.functionKind,
    closeValue
  );
  const artifactPayload = artifact(contract, stage, artifactValue);
  const payloadIdentity = mintTargetCarrierPayloadIdentity({
    resultRef: sourceEventRef,
    artifactPayload,
    targetCarrierContractRef: contract.contractRef,
    targetCarrierContractDigest: contract.configDigest
  });
  const authorityBasis = oneSurfaceAuthoritySnapshotBasis({ application, stage });
  const scope = Object.freeze({
    basisId,
    graphCallId,
    frameId,
    vectorIndex,
    edge
  });
  const authority = Object.freeze({
    kind: "authority_snapshot_admitted",
    ...scope,
    authoritySnapshotRef,
    authorityRefs: authorityBasis.authorityRefs,
    inputRefs: Object.freeze([`input://t280/exact-event-binding/${String(ordinal)}`]),
    authorityDigest: authorityBasis.authorityDigest,
    inputDigest,
    closureCapable: true,
    contradictoryAuthority: false,
    deferredAuthorityRefs: Object.freeze([]),
    providerRefs: Object.freeze(["provider://t280/exact-event-binding"]),
    policyRefs: Object.freeze(["policy://t280/exact-event-binding"])
  });
  const observed = Object.freeze({
    kind: "payload_observed",
    ...scope,
    payloadRef: payloadIdentity.payloadRef,
    payloadClass: contract.outputCarrierKind,
    schemaRef: stage.nativeResultSchema.schemaRef,
    contractRef: contract.contractRef,
    digest: payloadIdentity.digest,
    producerRef: "producer://t280/exact-event-binding",
    sourceEventRef,
    actorInvocationId: null,
    authorityRef: authoritySnapshotRef,
    inputDigest,
    policyRefs: Object.freeze(["policy://t280/exact-event-binding"])
  });
  const validated = Object.freeze({
    kind: "payload_validated",
    ...scope,
    payloadRef: payloadIdentity.payloadRef,
    schemaRef: stage.nativeResultSchema.schemaRef,
    contractRef: contract.contractRef,
    contractDigest: contract.configDigest,
    digest: payloadIdentity.digest,
    validationRef,
    evidenceRef: ordinaryEvidenceRef,
    policyRefs: Object.freeze(["policy://t280/exact-event-binding"])
  });
  const refusal = closeValue.kind === "one_surface_typed_refusal"
    ? closeValue
    : null;
  const admittedEvidenceRefs = Object.freeze([
    ordinaryEvidenceRef,
    closeAdmission.admissionRef,
    ...(refusal === null ? [] : [refusal.refusalRef, ...refusal.reasonRefs])
  ]);
  const evidence = Object.freeze(admittedEvidenceRefs.map((evidenceRef) =>
    Object.freeze({
      kind: "evidence_admitted",
      ...scope,
      evidenceRef,
      payloadRef: payloadIdentity.payloadRef,
      authorityRef: authoritySnapshotRef,
      authorityDigest: authorityBasis.authorityDigest,
      inputDigest,
      providerRefs: Object.freeze(["provider://t280/exact-event-binding"]),
      policyRefs: Object.freeze(["policy://t280/exact-event-binding"]),
      complete: true,
      shallow: false,
      contradictsAuthority: false,
      deferred: false
    })
  ));
  const close = buildOneSurfaceAuthorityCloseEvents({
    stageAuthority: stage,
    admittedResult: closeAdmission,
    cCallRef,
    basisId,
    payloadRef: payloadIdentity.payloadRef,
    evidenceRefs: Object.freeze([
      authoritySnapshotRef,
      validationRef,
      ordinaryEvidenceRef
    ])
  });
  const leaf = firstLeaf(stage.plan.root);
  const events = Object.freeze([
    Object.freeze({
      kind: "c_call_opened",
      cCallRef,
      basisId,
      graphFunctionId: stage.plan.executionGraphFunctionRef,
      graphCallId,
      frameId,
      edge,
      vectorIndex,
      stageRole: stage.functionKind,
      taskOrdinal: null,
      attempt: ordinal,
      batchRef: null,
      programLocusRef: stage.resultAuthority.programLocusRef,
      retryPath: Object.freeze([])
    }),
    Object.freeze({
      kind: "c_call_fibre_selected",
      cCallRef,
      basisId,
      regime: stage.resultAuthority.regime,
      armId: leaf.armId,
      programRef: stage.plan.programRef,
      compositionRef: stage.plan.compositionRef
    }),
    authority,
    observed,
    validated,
    ...evidence,
    ...close.events
  ]);
  return Object.freeze({
    artifactPayload,
    authority,
    cCallRef,
    closeAdmission,
    events,
    evidence,
    inputDigest,
    observed,
    validated
  });
}

function payloadLedger(contract, stage, attempts) {
  const first = attempts[0];
  return Object.freeze({
    kind: "payload_ledger_projection",
    scope: Object.freeze({
      kind: "payload_ledger_scope",
      basisId: first.observed.basisId,
      graphFunctionId: stage.plan.executionGraphFunctionRef,
      graphCallId: first.observed.graphCallId,
      frameId: first.observed.frameId,
      vectorIndex: first.observed.vectorIndex,
      edge: first.observed.edge
    }),
    targetCarrierContract: contract,
    observedPayloads: Object.freeze(attempts.map((row) => row.observed)),
    validatedPayloads: Object.freeze(attempts.map((row) => row.validated)),
    rejectedPayloads: Object.freeze([]),
    actorResultArtifacts: Object.freeze([]),
    authoritySnapshots: Object.freeze(attempts.map((row) => row.authority)),
    evidenceRows: Object.freeze(attempts.flatMap((row) => row.evidence)),
    ambiguityObservations: Object.freeze([]),
    closureInputs: Object.freeze([]),
    projectionRef: "projection://t280/exact-event-binding"
  });
}

function eventCalculus(application, events) {
  return deriveRuntimeEventCalculusProjection({
    events,
    derivedRules: Object.freeze([
      constructOneSurfaceAuthorityResultRule(application)
    ])
  });
}

test("T-280 selects the exact successful attempt after a retry", async () => {
  const fixture = await replayFixture();
  const inputDigest = stableSha256Digest({ input: "same-function-input" });
  const retryValue = constructOneSurfaceTypedRefusal({
    functionKind: "synthesize_model",
    judgment: "retry",
    reasonRefs: ["reason://t280/retry-model"]
  });
  const successValue = Object.freeze({
    desiredAssetRefs: Object.freeze(["asset://t280/desired"]),
    knownAssetRefs: Object.freeze(["asset://t280/known"])
  });
  const retry = attempt({ ...fixture, inputDigest, ordinal: 1, artifactValue: retryValue });
  const success = attempt({ ...fixture, inputDigest, ordinal: 2, artifactValue: successValue });
  const events = Object.freeze([...retry.events, ...success.events]);
  const calculus = eventCalculus(fixture.application, events);
  const replay = deriveOneSurfaceAuthorityReplayProjection({
    application: fixture.application,
    effectRows: calculus.effectRows
  });
  assert.equal(replay.bindings.length, 2, JSON.stringify(replay.diagnostics, null, 2));

  const projected = projectOneSurfaceAuthorityResult({
    application: fixture.application,
    stageAuthority: fixture.stage,
    eventCalculus: calculus,
    payloadLedger: payloadLedger(fixture.contract, fixture.stage, [retry, success]),
    artifactPayloadDigestBasis: success.artifactPayload,
    expectedCCallRef: success.cCallRef,
    expectedFunctionInputDigest: inputDigest
  });
  assert.equal(projected.status, "admitted", projected.diagnostic?.reason);
  assert.deepEqual(projected.result.decodedValue, successValue);

  const wrongInput = projectOneSurfaceAuthorityResult({
    application: fixture.application,
    stageAuthority: fixture.stage,
    eventCalculus: calculus,
    payloadLedger: payloadLedger(fixture.contract, fixture.stage, [retry, success]),
    artifactPayloadDigestBasis: success.artifactPayload,
    expectedCCallRef: success.cCallRef,
    expectedFunctionInputDigest: stableSha256Digest({ input: "other" })
  });
  assert.equal(wrongInput.status, "semantic_not_realized");
});

test("T-280 refuses malformed or competing replay enclosure relations", async () => {
  const fixture = await replayFixture();
  const inputDigest = stableSha256Digest({ input: "malformed-enclosure" });
  const value = Object.freeze({
    desiredAssetRefs: Object.freeze(["asset://t280/desired"]),
    knownAssetRefs: Object.freeze(["asset://t280/known"])
  });
  const row = attempt({ ...fixture, inputDigest, ordinal: 1, artifactValue: value });

  const bindingCount = (events) => deriveOneSurfaceAuthorityReplayProjection({
    application: fixture.application,
    effectRows: eventCalculus(fixture.application, events).effectRows
  }).bindings.length;
  const replaceEvent = (kind, mutate) => row.events.map((event) =>
    event.kind === kind ? Object.freeze(mutate(event)) : event
  );

  assert.equal(bindingCount(row.events), 1);
  assert.equal(bindingCount(replaceEvent("c_call_opened", (event) => ({
    ...event,
    stageRole: "eval_gap"
  }))), 0);
  assert.equal(bindingCount(replaceEvent("c_call_evidenced", (event) => ({
    ...event,
    evidenceClass: "other_result"
  }))), 0);
  assert.equal(bindingCount(replaceEvent("authority_snapshot_admitted", (event) => ({
    ...event,
    authorityRefs: Object.freeze([...event.authorityRefs].reverse())
  }))), 0);

  const evidenceOrdinal = row.events.findIndex(
    (event) => event.kind === "c_call_evidenced"
  );
  const duplicateEvidence = Object.freeze([
    ...row.events.slice(0, evidenceOrdinal),
    row.evidence[0],
    ...row.events.slice(evidenceOrdinal)
  ]);
  assert.equal(bindingCount(duplicateEvidence), 0);

  const duplicateEnclosure = Object.freeze([
    ...row.events.slice(0, evidenceOrdinal + 1),
    row.events[evidenceOrdinal],
    ...row.events.slice(evidenceOrdinal + 1)
  ]);
  assert.equal(bindingCount(duplicateEnclosure), 0);
});

test("T-280 cannot project artifact B under admitted-result A", async () => {
  const fixture = await replayFixture();
  const inputDigest = stableSha256Digest({ input: "cross-pair" });
  const valueA = Object.freeze({
    desiredAssetRefs: Object.freeze(["asset://t280/a"]),
    knownAssetRefs: Object.freeze(["asset://t280/shared"])
  });
  const valueB = Object.freeze({
    desiredAssetRefs: Object.freeze(["asset://t280/b"]),
    knownAssetRefs: Object.freeze(["asset://t280/shared"])
  });
  const crossed = attempt({
    ...fixture,
    inputDigest,
    ordinal: 1,
    artifactValue: valueB,
    closeValue: valueA
  });
  const calculus = eventCalculus(fixture.application, crossed.events);
  const projected = projectOneSurfaceAuthorityResult({
    application: fixture.application,
    stageAuthority: fixture.stage,
    eventCalculus: calculus,
    payloadLedger: payloadLedger(fixture.contract, fixture.stage, [crossed]),
    artifactPayloadDigestBasis: crossed.artifactPayload,
    expectedCCallRef: crossed.cCallRef,
    expectedFunctionInputDigest: inputDigest
  });
  assert.equal(projected.status, "refused");
  assert.match(projected.diagnostic.reason, /admission is absent/u);
});
