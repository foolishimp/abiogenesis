// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-EVENTS
// Validates: REQ-R-ABG3-PROJECTION
// Validates: REQ-R-ABG3-ASSURANCE
// Validates: T-095-TS

import test from "node:test";
import assert from "node:assert/strict";

import {
  constructAmbiguityObservationAdmittedEvent,
  constructAuthoritySnapshotAdmittedEvent,
  constructEvidenceAdmittedEvent,
  constructPayloadObservedEvent,
  constructPayloadRejectedEvent,
  constructPayloadValidatedEvent,
  deriveAssuranceAuthoritySnapshotFromPayloadLedger,
  deriveAssuranceClosureDecision,
  deriveAssuranceEvidenceRowsFromPayloadLedger,
  deriveAssuranceProjection,
  deriveAssuranceScopeRef,
  derivePayloadLedgerProjection,
  deriveRuntimeAggregateProjection,
  emit
} from "../../build/semantic/code/src/abg/m03/index.js";
import { loadGtlTargetCarrierDefaultsBundle } from "../../build/semantic/code/src/index.js";
import { buildThreeStageBasis } from "./support/m03-iteration-fixtures.mjs";

const targetCarrierDefaults = loadGtlTargetCarrierDefaultsBundle();

function base(vectorIndex = 0) {
  const basis = buildThreeStageBasis();
  const runtimeProjection = deriveRuntimeAggregateProjection(basis, []);
  const scope = deriveAssuranceScopeRef({
    basis,
    projection: runtimeProjection,
    vectorIndex
  });
  return { basis, runtimeProjection, scope };
}

function project(input) {
  const emitted = [];
  emit(input.events, (event) => emitted.push(event));
  const ledger = derivePayloadLedgerProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    events: emitted,
    vectorIndex: input.scope.vectorIndex,
    targetCarrierDefaults
  });
  const authoritySnapshot = deriveAssuranceAuthoritySnapshotFromPayloadLedger({
    assuranceScope: input.scope,
    ledger
  });
  const evidenceRows = deriveAssuranceEvidenceRowsFromPayloadLedger({
    assuranceScope: input.scope,
    ledger
  });
  const assurance = deriveAssuranceProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    authoritySnapshot,
    evidenceRows
  });
  return {
    emitted,
    ledger,
    assurance,
    decision: deriveAssuranceClosureDecision(assurance)
  };
}

test("T-095 payload ledger: accepted payload evidence projects fulfilled assurance", () => {
  const context = base();
  const authorityRef = "req://t095/payload-ledger";
  const payloadRef = "payload://t095/accepted";
  const events = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      authoritySnapshotRef: "authority-snapshot://t095/accepted",
      authorityRefs: [authorityRef],
      inputRefs: ["input://t095/current"],
      authorityDigest: "authority-digest-t095",
      inputDigest: "input-digest-t095",
      providerRefs: ["provider://t095/authority"],
      policyRefs: ["policy://t095"]
    }),
    constructPayloadObservedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      payloadRef,
      payloadClass: "evidence",
      contractRef: "contract://t095/evidence",
      digest: "digest://t095/accepted",
      producerRef: "worker://t095",
      authorityRef,
      inputDigest: "input-digest-t095",
      policyRefs: ["policy://t095"]
    }),
    constructPayloadValidatedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      payloadRef,
      contractRef: "contract://t095/evidence",
      digest: "digest://t095/accepted",
      validationRef: "validation://t095/accepted",
      evidenceRef: "evidence://t095/accepted",
      policyRefs: ["policy://t095"]
    }),
    constructEvidenceAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      evidenceRef: "evidence://t095/accepted",
      payloadRef,
      authorityRef,
      authorityDigest: "authority-digest-t095",
      inputDigest: "input-digest-t095",
      providerRefs: ["provider://t095/evidence"],
      policyRefs: ["policy://t095"]
    })
  ];

  const result = project({ ...context, events });

  assert.equal(result.ledger.observedPayloads.length, 1);
  assert.equal(result.ledger.validatedPayloads.length, 1);
  assert.equal(result.ledger.evidenceRows.length, 1);
  assert.deepStrictEqual(
    result.assurance.ambiguityRows.map((row) => row.status),
    ["fulfilled"]
  );
  assert.equal(result.decision.decision, "close");
});

test("T-095 payload ledger: evidence without accepted payload stays non-closing", () => {
  const context = base();
  const authorityRef = "req://t095/shadow-ledger";
  const payloadRef = "payload://t095/unvalidated";
  const events = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      authoritySnapshotRef: "authority-snapshot://t095/shadow-ledger",
      authorityRefs: [authorityRef],
      inputRefs: ["input://t095/current"],
      authorityDigest: "authority-digest-shadow",
      inputDigest: "input-digest-shadow",
      providerRefs: ["provider://t095/authority"],
      policyRefs: ["policy://t095"]
    }),
    constructEvidenceAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      evidenceRef: "evidence://t095/shadow-ledger",
      payloadRef,
      authorityRef,
      authorityDigest: "authority-digest-shadow",
      inputDigest: "input-digest-shadow",
      providerRefs: ["provider://t095/evidence"],
      policyRefs: ["policy://t095"]
    })
  ];

  const result = project({ ...context, events });

  assert.equal(result.ledger.validatedPayloads.length, 0);
  assert.deepStrictEqual(
    result.assurance.ambiguityRows.map((row) => row.status).sort(),
    ["missing", "orphan_evidence"]
  );
  assert.equal(result.decision.decision, "block");
});

test("T-095 payload ledger: validation without observed envelope cannot satisfy evidence", () => {
  const context = base();
  const authorityRef = "req://t095/observed-envelope";
  const payloadRef = "payload://t095/validated-only";
  const events = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      authoritySnapshotRef: "authority-snapshot://t095/validated-only",
      authorityRefs: [authorityRef],
      inputRefs: ["input://t095/current"],
      authorityDigest: "authority-digest-validated-only",
      inputDigest: "input-digest-validated-only",
      providerRefs: ["provider://t095/authority"],
      policyRefs: ["policy://t095"]
    }),
    constructPayloadValidatedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      payloadRef,
      contractRef: "contract://t095/evidence",
      digest: "digest://t095/validated-only",
      validationRef: "validation://t095/validated-only",
      evidenceRef: "evidence://t095/validated-only",
      policyRefs: ["policy://t095"]
    }),
    constructEvidenceAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      evidenceRef: "evidence://t095/validated-only",
      payloadRef,
      authorityRef,
      authorityDigest: "authority-digest-validated-only",
      inputDigest: "input-digest-validated-only",
      providerRefs: ["provider://t095/evidence"],
      policyRefs: ["policy://t095"]
    })
  ];

  const result = project({ ...context, events });

  assert.equal(result.ledger.observedPayloads.length, 0);
  assert.deepStrictEqual(
    result.assurance.ambiguityRows.map((row) => row.status).sort(),
    ["missing", "orphan_evidence"]
  );
  assert.equal(result.decision.decision, "block");
});

test("T-095 payload ledger: rejected validated payload cannot satisfy evidence", () => {
  const context = base();
  const authorityRef = "req://t095/rejected-validated";
  const payloadRef = "payload://t095/rejected-validated";
  const events = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      authoritySnapshotRef: "authority-snapshot://t095/rejected-validated",
      authorityRefs: [authorityRef],
      inputRefs: ["input://t095/current"],
      authorityDigest: "authority-digest-rejected-validated",
      inputDigest: "input-digest-rejected-validated",
      providerRefs: ["provider://t095/authority"],
      policyRefs: ["policy://t095"]
    }),
    constructPayloadObservedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      payloadRef,
      payloadClass: "evidence",
      contractRef: "contract://t095/evidence",
      digest: "digest://t095/rejected-validated",
      producerRef: "worker://t095",
      authorityRef,
      inputDigest: "input-digest-rejected-validated",
      policyRefs: ["policy://t095"]
    }),
    constructPayloadValidatedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      payloadRef,
      contractRef: "contract://t095/evidence",
      digest: "digest://t095/rejected-validated",
      validationRef: "validation://t095/rejected-validated",
      evidenceRef: "evidence://t095/rejected-validated",
      policyRefs: ["policy://t095"]
    }),
    constructPayloadRejectedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      payloadRef,
      rejectionClass: "contradictory",
      contractRef: "contract://t095/evidence",
      digest: "digest://t095/rejected-validated",
      reason: "same payload ref is rejected by a later check",
      policyRefs: ["policy://t095"]
    }),
    constructEvidenceAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      evidenceRef: "evidence://t095/rejected-validated",
      payloadRef,
      authorityRef,
      authorityDigest: "authority-digest-rejected-validated",
      inputDigest: "input-digest-rejected-validated",
      providerRefs: ["provider://t095/evidence"],
      policyRefs: ["policy://t095"]
    })
  ];

  const result = project({ ...context, events });

  assert.equal(result.ledger.rejectedPayloads.length, 1);
  assert.deepStrictEqual(
    result.assurance.ambiguityRows.map((row) => row.status).sort(),
    ["missing", "orphan_evidence"]
  );
  assert.equal(result.decision.decision, "block");
});

test("T-095 payload ledger: contradictory ambiguity invalidates otherwise valid payload", () => {
  const context = base();
  const authorityRef = "req://t095/contradictory-observation";
  const payloadRef = "payload://t095/contradictory-observation";
  const events = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      authoritySnapshotRef: "authority-snapshot://t095/contradictory-observation",
      authorityRefs: [authorityRef],
      inputRefs: ["input://t095/current"],
      authorityDigest: "authority-digest-contradictory-observation",
      inputDigest: "input-digest-contradictory-observation",
      providerRefs: ["provider://t095/authority"],
      policyRefs: ["policy://t095"]
    }),
    constructPayloadObservedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      payloadRef,
      payloadClass: "evidence",
      contractRef: "contract://t095/evidence",
      digest: "digest://t095/contradictory-observation",
      producerRef: "worker://t095",
      authorityRef,
      inputDigest: "input-digest-contradictory-observation",
      policyRefs: ["policy://t095"]
    }),
    constructPayloadValidatedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      payloadRef,
      contractRef: "contract://t095/evidence",
      digest: "digest://t095/contradictory-observation",
      validationRef: "validation://t095/contradictory-observation",
      evidenceRef: "evidence://t095/contradictory-observation",
      policyRefs: ["policy://t095"]
    }),
    constructAmbiguityObservationAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      ambiguityRef: "ambiguity://t095/contradictory-observation",
      ambiguityStatus: "contradictory_evidence",
      authorityRef,
      evidenceRef: "evidence://t095/contradictory-observation",
      payloadRef,
      reason: "payload conflicts with authority digest",
      providerRefs: ["provider://t095/evidence"],
      policyRefs: ["policy://t095"]
    }),
    constructEvidenceAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      evidenceRef: "evidence://t095/contradictory-observation",
      payloadRef,
      authorityRef,
      authorityDigest: "authority-digest-contradictory-observation",
      inputDigest: "input-digest-contradictory-observation",
      providerRefs: ["provider://t095/evidence"],
      policyRefs: ["policy://t095"]
    })
  ];

  const result = project({ ...context, events });

  assert.deepStrictEqual(
    result.assurance.ambiguityRows.map((row) => row.status).sort(),
    ["missing", "orphan_evidence"]
  );
  assert.equal(result.decision.decision, "block");
});

test("T-095 payload ledger: rejected payload is projected and cannot satisfy evidence", () => {
  const context = base();
  const authorityRef = "req://t095/rejected";
  const payloadRef = "payload://t095/rejected";
  const events = [
    constructAuthoritySnapshotAdmittedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      authoritySnapshotRef: "authority-snapshot://t095/rejected",
      authorityRefs: [authorityRef],
      inputRefs: ["input://t095/current"],
      authorityDigest: "authority-digest-rejected",
      inputDigest: "input-digest-rejected",
      providerRefs: ["provider://t095/authority"],
      policyRefs: ["policy://t095"]
    }),
    constructPayloadRejectedEvent({
      basis: context.basis,
      vectorIndex: context.scope.vectorIndex,
      payloadRef,
      rejectionClass: "contract_invalid",
      contractRef: "contract://t095/evidence",
      reason: "payload violates result contract",
      policyRefs: ["policy://t095"]
    })
  ];

  const result = project({ ...context, events });

  assert.equal(result.ledger.rejectedPayloads.length, 1);
  assert.deepStrictEqual(
    result.assurance.ambiguityRows.map((row) => row.status),
    ["missing"]
  );
  assert.equal(result.decision.decision, "retry");
});

for (const rejectionClass of [
  "missing",
  "empty",
  "malformed",
  "unreadable",
  "schema_invalid",
  "contract_invalid",
  "stale",
  "orphaned",
  "contradictory"
]) {
  test(`T-095 payload ledger: ${rejectionClass} rejection is a non-closing ledger fact`, () => {
    const context = base();
    const authorityRef = `req://t095/rejection/${rejectionClass}`;
    const payloadRef = `payload://t095/rejection/${rejectionClass}`;
    const events = [
      constructAuthoritySnapshotAdmittedEvent({
        basis: context.basis,
        vectorIndex: context.scope.vectorIndex,
        authoritySnapshotRef: `authority-snapshot://t095/rejection/${rejectionClass}`,
        authorityRefs: [authorityRef],
        inputRefs: ["input://t095/current"],
        authorityDigest: `authority-digest-${rejectionClass}`,
        inputDigest: `input-digest-${rejectionClass}`,
        providerRefs: ["provider://t095/authority"],
        policyRefs: ["policy://t095"]
      }),
      constructPayloadRejectedEvent({
        basis: context.basis,
        vectorIndex: context.scope.vectorIndex,
        payloadRef,
        rejectionClass,
        contractRef: "contract://t095/evidence",
        digest:
          rejectionClass === "missing" || rejectionClass === "empty"
            ? null
            : `digest://t095/rejection/${rejectionClass}`,
        reason: `${rejectionClass} payload cannot satisfy authority`,
        policyRefs: ["policy://t095"]
      })
    ];

    const result = project({ ...context, events });

    assert.equal(result.ledger.rejectedPayloads.length, 1);
    assert.equal(result.ledger.rejectedPayloads[0].rejectionClass, rejectionClass);
    assert.deepStrictEqual(
      result.assurance.ambiguityRows.map((row) => row.status),
      ["missing"]
    );
    assert.equal(result.decision.decision, "retry");
  });
}

test("T-095 payload ledger: malformed source event is rejected at emit", () => {
  const context = base();
  assert.throws(
    () =>
      emit(
        {
          kind: "payload_observed",
          basisId: context.basis.id,
          graphCallId: context.scope.graphCallId,
          frameId: context.scope.frameId,
          vectorIndex: context.scope.vectorIndex,
          edge: context.scope.edge,
          payloadClass: "evidence",
          schemaRef: null,
          contractRef: "contract://t095/evidence",
          digest: "digest://missing-payload-ref",
          producerRef: "worker://t095",
          sourceEventRef: null,
          actorInvocationId: null,
          authorityRef: null,
          inputDigest: null,
          policyRefs: []
        },
        () => {}
      ),
    /PayloadObservedRuntimeEvent\.payloadRef/
  );
});
