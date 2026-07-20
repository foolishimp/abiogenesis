// Validates: T-276
// Validates: REQ-R-ABG3-EVENTS-032

import test from "node:test";
import assert from "node:assert/strict";

import {
  RUNTIME_EVENT_KIND_VALUES,
  RUN_INDEPENDENT_EVENT_SCOPE_CLASSES,
  assertPublicOperationArtifactAvailableInReplay,
  assertRuntimeEvent,
  constructPublicOperationArtifactAdmittedEvent,
  constructRuntimeFluent,
  derivePublicOperationArtifactReplayProjection,
  deriveRuntimeEventCalculusProjection,
  holdsAt
} from "../../build/semantic/code/src/abg/m03/index.js";
import {
  METADATA_BASIS_BY_OPERATION
} from "../../build/semantic/code/src/app/m04/public_contracts/public_operation_definition_family.js";

const DIGEST_A = `sha256:${"a".repeat(64)}`;
const DIGEST_B = `sha256:${"b".repeat(64)}`;
const DIGEST_C = `sha256:${"c".repeat(64)}`;

function workspaceBindingBoundary(overrides = {}) {
  return constructPublicOperationArtifactAdmittedEvent({
    operationId: "abg.operation.workspace.bind",
    definitionKey: {
      operationId: "abg.operation.workspace.bind",
      memberKind: "variant",
      variant: "bind"
    },
    definitionDigest: DIGEST_A,
    scopeRef: "workspace://scope/example",
    scopeDigest: DIGEST_A,
    invocationRef: "public-invocation://workspace-bind/1",
    invocationDigest: DIGEST_B,
    disposition: "bound",
    artifactRef: "workspace-binding://workspace/example",
    artifactDigest: DIGEST_C,
    causationEventRefs: ["event://public-operation-admitted/1"],
    correlationId: "correlation://workspace-bind/1",
    ...overrides
  });
}

function canonical(event, ordinal) {
  const eventTimeUnixMs = ordinal * 1000;
  return Object.freeze({
    ...event,
    eventId: `event://public-operation-artifact/${ordinal}`,
    eventTime: new Date(eventTimeUnixMs).toISOString(),
    eventTimeUnixMs,
    eventAdmissionOrdinal: ordinal
  });
}

function publicAdmission(boundary, ordinal) {
  return canonical({
    kind: "public_operation_admitted",
    definitionKey: boundary.definitionKey,
    definitionDigest: boundary.definitionDigest,
    invocationRef: boundary.invocationRef,
    invocationDigest: boundary.invocationDigest,
    invocationAuthorityRef: "invocation-authority://t276/exact",
    invocationAuthorityDigest: DIGEST_A,
    authorityBasisRef: "authority-basis://t276/exact",
    authorityBasisDigest: DIGEST_B,
    actorRef: "actor://t276/exact",
    actorAttributionRef: "attribution://t276/exact",
    actorAttributionDigest: DIGEST_C,
    workspaceBindingRequirement: "exactly_one",
    scopeRef: boundary.scopeRef,
    scopeDigest: boundary.scopeDigest,
    causationEventRefs: [],
    correlationId: boundary.correlationId
  }, ordinal);
}

test("T-276 classifies the complete Rule-B set and admits one generic workspace.bind boundary event", () => {
  assert.equal(
    RUNTIME_EVENT_KIND_VALUES.includes("public_operation_artifact_admitted"),
    true
  );
  assert.equal(
    RUN_INDEPENDENT_EVENT_SCOPE_CLASSES.public_operation_artifact_admitted,
    "authority"
  );
  const event = workspaceBindingBoundary();
  assert.doesNotThrow(() => assertRuntimeEvent(event));
  assert.equal(event.operationId, "abg.operation.workspace.bind");
  assert.equal(event.disposition, "bound");
  assert.deepEqual(
    Object.entries(METADATA_BASIS_BY_OPERATION)
      .filter(([, metadata]) =>
        metadata.eventAdmission === "immutable_artifact_boundary"
      )
      .map(([operationId]) => operationId),
    [
      "abg.operation.workspace.create",
      "abg.operation.product.install",
      "abg.operation.workspace.bind",
      "abg.operation.catalog.apply",
      "abg.operation.product.materialize",
      "abg.operation.release.snapshot"
    ]
  );
});

test("T-276 keeps public commands distinct from their Event Calculus transition route", () => {
  const rows = Object.entries(METADATA_BASIS_BY_OPERATION);
  assert.equal(rows.length, 19);
  assert.equal(
    rows.some(([operationId]) => RUNTIME_EVENT_KIND_VALUES.includes(operationId)),
    false
  );
  assert.deepEqual(
    rows
      .filter(([, metadata]) => metadata.eventAdmission === "none")
      .map(([operationId]) => operationId),
    [
      "abg.operation.workspace.open",
      "abg.operation.project.read",
      "abg.operation.product.verify",
      "abg.operation.product.resolve",
      "abg.operation.catalog.view",
      "abg.operation.conformance.evaluate"
    ]
  );
  assert.deepEqual(
    rows
      .filter(([, metadata]) =>
        metadata.eventAdmission === "owning_semantic_authority"
      )
      .map(([operationId]) => operationId),
    [
      "abg.operation.catalog.admit",
      "abg.operation.run.invoke",
      "abg.operation.run.continue",
      "abg.operation.interaction.respond",
      "abg.operation.result.assess",
      "abg.operation.witness.admit",
      "abg.operation.tuning.transition"
    ]
  );

  const commandAdmission = canonical({
    kind: "public_operation_admitted",
    definitionKey: {
      operationId: "abg.operation.run.invoke",
      memberKind: "variant",
      variant: "invoke"
    },
    definitionDigest: DIGEST_A,
    invocationRef: "public-invocation://run-invoke/1",
    invocationDigest: DIGEST_B,
    invocationAuthorityRef: "invocation-authority://run-invoke/1",
    invocationAuthorityDigest: DIGEST_C,
    authorityBasisRef: "authority-basis://run-invoke/1",
    authorityBasisDigest: DIGEST_A,
    actorRef: "actor://run-invoke/1",
    actorAttributionRef: "attribution://run-invoke/1",
    actorAttributionDigest: DIGEST_B,
    workspaceBindingRequirement: "exactly_one",
    scopeRef: "workspace-binding://run-invoke/1",
    scopeDigest: DIGEST_C,
    causationEventRefs: [],
    correlationId: "correlation://run-invoke/1"
  }, 20);
  const commandProjection = deriveRuntimeEventCalculusProjection({
    events: [commandAdmission]
  });
  assert.deepEqual(commandProjection.holds, []);
  assert.equal(commandProjection.effectRows.length, 1);
  assert.deepEqual(commandProjection.effectRows[0].initiates, []);
  assert.deepEqual(commandProjection.effectRows[0].terminates, []);
  assert.deepEqual(commandProjection.effectRows[0].clips, []);
  assert.deepEqual(commandProjection.effectRows[0].declips, []);
});

test("T-276 rejects malformed boundary digests before runtime truth", () => {
  assert.throws(
    () => workspaceBindingBoundary({ artifactDigest: "sha256:not-a-digest" }),
    /artifactDigest/
  );
  assert.throws(
    () => workspaceBindingBoundary({ invocationRef: "" }),
    /invocationRef/
  );
  assert.throws(
    () => workspaceBindingBoundary({ scopeRef: "" }),
    /scopeRef/
  );
  assert.throws(
    () => workspaceBindingBoundary({ scopeDigest: "sha256:not-a-digest" }),
    /scopeDigest/
  );
  assert.throws(
    () => workspaceBindingBoundary({ causationEventRefs: [] }),
    /causationEventRefs/
  );
  assert.throws(
    () => assertRuntimeEvent({
      ...workspaceBindingBoundary(),
      definitionKeyRef: "legacy-definition-key-ref://forbidden"
    }),
    /unexpected field "definitionKeyRef"/
  );
  assert.throws(
    () => workspaceBindingBoundary({
      definitionKey: {
        operationId: "abg.operation.catalog.apply",
        memberKind: "variant",
        variant: "overlay"
      }
    }),
    /definitionKey\.operationId must equal operationId/
  );
});

test("T-276 replay deterministically projects the Rule-B artifact availability delta", () => {
  const first = canonical(workspaceBindingBoundary(), 3);
  const second = canonical(
    workspaceBindingBoundary({
      invocationRef: "public-invocation://workspace-bind/2",
      invocationDigest: DIGEST_C,
      artifactRef: "workspace-binding://workspace/alternate",
      artifactDigest: DIGEST_B,
      correlationId: "correlation://workspace-bind/2"
    }),
    4
  );
  const scope = {
    scopeRef: first.scopeRef,
    scopeDigest: first.scopeDigest
  };
  const forward = derivePublicOperationArtifactReplayProjection({
    events: [first, second],
    ...scope
  });
  const reverse = derivePublicOperationArtifactReplayProjection({
    events: [second, first],
    ...scope
  });

  assert.deepEqual(reverse, forward);
  assert.deepEqual(
    forward.effectRows.map((row) => row.sourceEvent.eventAdmissionOrdinal),
    [3, 4]
  );
  assert.equal(forward.holds.length, 2);
  assert.equal(
    holdsAt(
      forward,
      constructRuntimeFluent({
        name: "public_operation_artifact_available",
        scope: "public_operation",
        constraintRef: first.scopeRef,
        ref: first.artifactRef
      })
    ),
    true
  );
  const admission = publicAdmission(first, 1);
  const admittedFirst = canonical(workspaceBindingBoundary({
    causationEventRefs: [admission.eventId]
  }), 3);
  assert.doesNotThrow(() => assertPublicOperationArtifactAvailableInReplay({
    events: [admittedFirst, admission],
    operationId: admittedFirst.operationId,
    scopeRef: admittedFirst.scopeRef,
    scopeDigest: admittedFirst.scopeDigest,
    artifactRef: admittedFirst.artifactRef,
    artifactDigest: admittedFirst.artifactDigest
  }));
  assert.throws(
    () => assertPublicOperationArtifactAvailableInReplay({
      events: [first, second],
      operationId: "abg.operation.product.install",
      scopeRef: first.scopeRef,
      scopeDigest: first.scopeDigest,
      artifactRef: first.artifactRef,
      artifactDigest: first.artifactDigest
    }),
    /artifact is not available in admitted replay truth/u
  );
});

test("T-276 replay rejects colliding admission ordinals", () => {
  const first = canonical(workspaceBindingBoundary(), 7);
  const collision = Object.freeze({
    ...canonical(
      workspaceBindingBoundary({
        invocationRef: "public-invocation://workspace-bind/collision",
        invocationDigest: DIGEST_C,
        artifactRef: "workspace-binding://workspace/collision",
        artifactDigest: DIGEST_B,
        correlationId: "correlation://workspace-bind/collision"
      }),
      7
    ),
    eventId: "event://public-operation-artifact/collision"
  });
  assert.throws(
    () => derivePublicOperationArtifactReplayProjection({
      events: [collision, first],
      scopeRef: first.scopeRef,
      scopeDigest: first.scopeDigest
    }),
    /ordinal collision/
  );
});

test("T-276 replay isolates one stable authority scope and rejects scope forks", () => {
  const first = canonical(workspaceBindingBoundary(), 11);
  const alternate = canonical(
    workspaceBindingBoundary({
      scopeRef: "workspace://scope/alternate",
      scopeDigest: DIGEST_B,
      invocationRef: "public-invocation://workspace-bind/alternate",
      invocationDigest: DIGEST_C,
      artifactRef: "workspace-binding://workspace/alternate",
      artifactDigest: DIGEST_B,
      correlationId: "correlation://workspace-bind/alternate"
    }),
    12
  );
  const projection = derivePublicOperationArtifactReplayProjection({
    events: [alternate, first],
    scopeRef: first.scopeRef,
    scopeDigest: first.scopeDigest
  });
  assert.equal(projection.effectRows.length, 1);
  assert.equal(projection.effectRows[0].sourceEvent.scopeRef, first.scopeRef);
  assert.throws(
    () => derivePublicOperationArtifactReplayProjection({
      events: [
        first,
        canonical(workspaceBindingBoundary({ scopeDigest: DIGEST_C }), 13)
      ],
      scopeRef: first.scopeRef,
      scopeDigest: first.scopeDigest
    }),
    /scope digest mismatch/
  );
});
