import {
  admitOneSurfaceArtifactResultPair,
  admitOneSurfaceResultForClose,
  buildOneSurfaceAuthorityCloseEvents,
  constructOneSurfaceAuthorityResultRule,
  deriveRuntimeEventCalculusProjection,
  projectOneSurfaceAuthorityResult
} from "../../../build/semantic/code/src/index.js";
import {
  oneSurfaceAuthoritySnapshotBasis
} from "../../../build/semantic/code/src/abg/m03/runner/one_surface_result_projection.js";
import {
  payloadLedgerProjectionRef
} from "../../../build/semantic/code/src/abg/m03/contracts/payload_ledger.js";

function firstLeaf(node) {
  if (node.kind === "compiled_c_stage_leaf") return node;
  if (node.kind === "compiled_c_sequence") return firstLeaf(node.children[0]);
  if (node.kind === "compiled_c_complete_batch") return firstLeaf(node.tasks[0].child);
  return firstLeaf(node.child);
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

function canonicalEnvelope(fixtureRef, suffix, eventAdmissionOrdinal) {
  const eventTimeUnixMs =
    Date.parse("2026-07-18T00:00:00.000Z") + eventAdmissionOrdinal;
  return Object.freeze({
    eventId: `event://${fixtureRef}/${suffix}`,
    eventTime: new Date(eventTimeUnixMs).toISOString(),
    eventTimeUnixMs,
    eventAdmissionOrdinal
  });
}

export function buildOneSurfaceReplayAttempt(input) {
  const {
    application,
    artifactValue,
    closeValue = artifactValue,
    contract,
    inputBasis,
    ordinal,
    stage,
    fixtureRef = "t280/exact-event-binding"
  } = input;
  const basisId = `basis://${fixtureRef}`;
  const graphCallId = `graph-call://${fixtureRef}`;
  const frameId = `frame://${fixtureRef}`;
  const vectorIndex = 0;
  const edge = stage.targetCarrierContract.edgeRef;
  const cCallRef = `c-call://${fixtureRef}/${String(ordinal)}`;
  const authoritySnapshotRef =
    `authority-snapshot://${fixtureRef}/${String(ordinal)}`;
  const validationRef = `validation://${fixtureRef}/${String(ordinal)}`;
  const ordinaryEvidenceRef = `evidence://${fixtureRef}/${String(ordinal)}`;
  const sourceEventRef = `event://${fixtureRef}/${String(ordinal)}`;
  const closeAdmission = admitOneSurfaceResultForClose(
    stage.functionKind,
    closeValue
  );
  const artifactPayload = artifact(contract, stage, artifactValue);
  const resultPair = admitOneSurfaceArtifactResultPair({
    stageAuthority: stage,
    inputBasis,
    admittedResult: closeAdmission,
    targetCarrierContract: contract,
    sourceEventRef,
    artifactPayloadDigestBasis: artifactPayload
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
    inputRefs: inputBasis.inputRefs,
    authorityDigest: authorityBasis.authorityDigest,
    inputDigest: inputBasis.inputDigest,
    closureCapable: true,
    contradictoryAuthority: false,
    deferredAuthorityRefs: Object.freeze([]),
    providerRefs: Object.freeze([`provider://${fixtureRef}`]),
    policyRefs: Object.freeze([`policy://${fixtureRef}`])
  });
  const observed = Object.freeze({
    kind: "payload_observed",
    ...canonicalEnvelope(fixtureRef, `payload-observed/${String(ordinal)}`, ordinal * 2),
    ...scope,
    payloadRef: resultPair.payloadRef,
    payloadClass: contract.outputCarrierKind,
    schemaRef: stage.nativeResultSchema.schemaRef,
    contractRef: contract.contractRef,
    digest: resultPair.payloadDigest,
    producerRef: `producer://${fixtureRef}`,
    sourceEventRef,
    actorInvocationId: null,
    authorityRef: authoritySnapshotRef,
    inputDigest: inputBasis.inputDigest,
    policyRefs: Object.freeze([`policy://${fixtureRef}`])
  });
  const validated = Object.freeze({
    kind: "payload_validated",
    ...canonicalEnvelope(
      fixtureRef,
      `payload-validated/${String(ordinal)}`,
      ordinal * 2 + 1
    ),
    ...scope,
    payloadRef: resultPair.payloadRef,
    schemaRef: stage.nativeResultSchema.schemaRef,
    contractRef: contract.contractRef,
    contractDigest: contract.configDigest,
    digest: resultPair.payloadDigest,
    validationRef,
    evidenceRef: ordinaryEvidenceRef,
    policyRefs: Object.freeze([`policy://${fixtureRef}`])
  });
  const refusal = closeValue.kind === "one_surface_typed_refusal"
    ? closeValue
    : null;
  const admittedEvidenceRefs = Object.freeze([
    ordinaryEvidenceRef,
    resultPair.pairRef,
    closeAdmission.admissionRef,
    ...(refusal === null ? [] : [refusal.refusalRef, ...refusal.reasonRefs])
  ]);
  const evidence = Object.freeze(admittedEvidenceRefs.map((evidenceRef) =>
    Object.freeze({
      kind: "evidence_admitted",
      ...scope,
      evidenceRef,
      payloadRef: resultPair.payloadRef,
      authorityRef: authoritySnapshotRef,
      authorityDigest: authorityBasis.authorityDigest,
      inputDigest: inputBasis.inputDigest,
      providerRefs: Object.freeze([`provider://${fixtureRef}`]),
      policyRefs: Object.freeze([`policy://${fixtureRef}`]),
      complete: true,
      shallow: false,
      contradictsAuthority: false,
      deferred: false
    })
  ));
  const close = buildOneSurfaceAuthorityCloseEvents({
    stageAuthority: stage,
    resultPair,
    cCallRef,
    basisId,
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
    inputBasis,
    observed,
    resultPair,
    validated
  });
}

export function buildOneSurfacePayloadLedger(
  contract,
  stage,
  attempts
) {
  const first = attempts[0];
  const partial = Object.freeze({
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
    closureInputs: Object.freeze([])
  });
  return Object.freeze({
    ...partial,
    projectionRef: payloadLedgerProjectionRef({
      ...partial,
      projectionRef: "pending"
    })
  });
}

export function deriveOneSurfaceTestEventCalculus(application, events) {
  return deriveRuntimeEventCalculusProjection({
    events,
    derivedRules: Object.freeze([
      constructOneSurfaceAuthorityResultRule(application)
    ])
  });
}

export function deriveOneSurfaceTestEffectRows(events) {
  return deriveRuntimeEventCalculusProjection({ events }).effectRows;
}

export function projectOneSurfaceReplayAttempt(input) {
  const row = buildOneSurfaceReplayAttempt(input);
  const eventCalculus = deriveOneSurfaceTestEventCalculus(
    input.application,
    row.events
  );
  const projection = projectOneSurfaceAuthorityResult({
    application: input.application,
    stageAuthority: input.stage,
    eventCalculus,
    payloadLedger: buildOneSurfacePayloadLedger(
      input.contract,
      input.stage,
      [row]
    ),
    artifactPayloadDigestBasis: row.artifactPayload,
    expectedCCallRef: row.cCallRef,
    expectedFunctionInputBasis: input.inputBasis
  });
  return Object.freeze({ eventCalculus, projection, row });
}
