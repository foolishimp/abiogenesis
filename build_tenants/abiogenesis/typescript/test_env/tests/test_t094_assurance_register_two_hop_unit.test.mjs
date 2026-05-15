// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-LINEAGE
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-CONVERGENCE
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: T-094

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructAuthoritySnapshotAdmittedEvent,
  constructEvidenceAdmittedEvent,
  constructPayloadObservedEvent,
  constructPayloadValidatedEvent,
  constructAssuranceRegisterHop,
  deriveAssuranceAuthoritySnapshotFromPayloadLedger,
  deriveAssuranceClosureDecision,
  deriveAssuranceEvidenceRowsFromPayloadLedger,
  deriveAssuranceLifecycleRegister,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef,
  derivePayloadLedgerProjection,
  deriveRuntimeAggregateProjection,
  emit
} from "../../build/semantic/code/src/abg/m03/index.js";
import { loadGtlTargetCarrierDefaultsBundle } from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

const targetCarrierDefaults = loadGtlTargetCarrierDefaultsBundle();

function baseScope(vectorIndex = 0) {
  const basis = buildThreeStageBasis();
  const runtimeProjection = deriveRuntimeAggregateProjection(basis, []);
  const scope = deriveAssuranceScopeRef({
    basis,
    projection: runtimeProjection,
    vectorIndex
  });
  return { basis, runtimeProjection, scope };
}

function projectionFor(input) {
  const sourceEvents = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: input.basis,
      vectorIndex: input.scope.vectorIndex,
      authoritySnapshotRef: `authority-snapshot://${input.authorityDigest}`,
      authorityRefs: input.authorityRefs,
      inputRefs: input.inputRefs ?? ["input://current"],
      authorityDigest: input.authorityDigest,
      inputDigest: input.inputDigest,
      providerRefs: ["provider://t094/authority"],
      policyRefs: ["policy://t094/register"]
    })
  ];
  for (const evidenceRef of input.evidenceRefs ?? []) {
    const payloadRef = `payload://${evidenceRef}`;
    const digest = `digest://${evidenceRef}`;
    sourceEvents.push(
      constructPayloadObservedEvent({
        basis: input.basis,
        vectorIndex: input.scope.vectorIndex,
        payloadRef,
        payloadClass: "evidence",
        contractRef: "contract://t094/evidence",
        digest,
        producerRef: "worker://t094/unit",
        authorityRef: input.evidenceAuthorityRef ?? input.authorityRefs[0],
        inputDigest: input.inputDigest,
        policyRefs: ["policy://t094/register"]
      }),
      constructPayloadValidatedEvent({
        basis: input.basis,
        vectorIndex: input.scope.vectorIndex,
        payloadRef,
        contractRef: "contract://t094/evidence",
        digest,
        validationRef: `validation://${evidenceRef}`,
        evidenceRef,
        policyRefs: ["policy://t094/register"]
      }),
      constructEvidenceAdmittedEvent({
        basis: input.basis,
        vectorIndex: input.scope.vectorIndex,
        evidenceRef,
        payloadRef,
        authorityRef: input.evidenceAuthorityRef ?? input.authorityRefs[0],
        authorityDigest: input.authorityDigest,
        inputDigest: input.inputDigest,
        providerRefs: ["provider://t094/evidence"],
        policyRefs: ["policy://t094/register"],
        complete: input.complete ?? true,
        shallow: input.shallow ?? false
      })
    );
  }
  const emittedEvents = [];
  emit(sourceEvents, (event) => emittedEvents.push(event));
  const payloadLedger = derivePayloadLedgerProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    events: emittedEvents,
    vectorIndex: input.scope.vectorIndex,
    targetCarrierDefaults
  });
  const authoritySnapshot = deriveAssuranceAuthoritySnapshotFromPayloadLedger({
    assuranceScope: input.scope,
    ledger: payloadLedger
  });
  const evidenceRows = deriveAssuranceEvidenceRowsFromPayloadLedger({
    assuranceScope: input.scope,
    ledger: payloadLedger
  });
  const projection = deriveAssuranceProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    authoritySnapshot,
    evidenceRows
  });
  return {
    emittedEvents,
    payloadLedger,
    projection,
    decision: deriveAssuranceClosureDecision(projection)
  };
}

test("T-094 assurance register: one closing hop may converge", () => {
  const base = baseScope();
  const first = projectionFor({
    ...base,
    authorityRefs: ["req://assurance/source-authority"],
    authorityDigest: "authority-digest-hop-1",
    inputDigest: "input-digest-hop-1",
    evidenceRefs: ["evidence://uat-derived-from-requirement"]
  });
  const hop1 = constructAssuranceRegisterHop({
    hopId: "hop://requirements-to-uat",
    ordinal: 0,
    sourceRefs: ["req://assurance/source-authority"],
    targetRefs: ["uat://assurance/two-hop-proof"],
    projection: first.projection,
    decision: first.decision
  });
  const register = deriveAssuranceLifecycleRegister({
    registerId: "register://t094/one-hop",
    scope: base.scope,
    hops: [hop1]
  });

  assert.equal(first.decision.decision, "close");
  assert.equal(first.payloadLedger.observedPayloads.length, 1);
  assert.equal(first.payloadLedger.validatedPayloads.length, 1);
  assert.equal(first.payloadLedger.evidenceRows.length, 1);
  assert.equal(register.decision, "close");
  assert.equal(register.mayConverge, true);
  assert.equal(register.deepeningRequired, false);
});

test("T-094 assurance register: second-hop missing evidence causes deepening and stops convergence", () => {
  const base = baseScope();
  const first = projectionFor({
    ...base,
    authorityRefs: ["req://assurance/source-authority"],
    authorityDigest: "authority-digest-hop-1",
    inputDigest: "input-digest-hop-1",
    evidenceRefs: ["evidence://uat-derived-from-requirement"]
  });
  const second = projectionFor({
    ...base,
    authorityRefs: ["req://assurance/downstream-execution"],
    authorityDigest: "authority-digest-hop-2",
    inputDigest: "input-digest-hop-2",
    evidenceRefs: []
  });

  const hop1 = constructAssuranceRegisterHop({
    hopId: "hop://requirements-to-uat",
    ordinal: 0,
    sourceRefs: ["req://assurance/source-authority"],
    targetRefs: ["uat://assurance/two-hop-proof"],
    projection: first.projection,
    decision: first.decision,
    downstreamHopIds: ["hop://uat-to-execution"]
  });
  const hop2 = constructAssuranceRegisterHop({
    hopId: "hop://uat-to-execution",
    ordinal: 1,
    sourceRefs: ["uat://assurance/two-hop-proof"],
    targetRefs: ["evidence://execution/archive"],
    projection: second.projection,
    decision: second.decision,
    upstreamHopIds: ["hop://requirements-to-uat"]
  });

  const register = deriveAssuranceLifecycleRegister({
    registerId: "register://t094/two-hop",
    scope: base.scope,
    hops: [hop1, hop2]
  });

  assert.equal(first.decision.decision, "close");
  assert.equal(first.payloadLedger.evidenceRows.length, 1);
  assert.equal(second.decision.decision, "retry");
  assert.equal(second.payloadLedger.evidenceRows.length, 0);
  assert.deepStrictEqual(hop2.rowStatuses, ["missing"]);
  assert.equal(register.decision, "deepen");
  assert.equal(register.mayConverge, false);
  assert.equal(register.deepeningRequired, true);
  assert.deepStrictEqual(register.blockingHopIds, ["hop://uat-to-execution"]);
  assert.equal(register.blockingRowIds.length > 0, true);
});
