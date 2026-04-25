import type {
  AdmittedLeafTaskPayload,
  ExecutionBasis,
  LeafTaskCompletedEvent,
  LeafTaskEnvelope,
  LeafTaskFailedEvent,
  LeafTaskFailure,
  LeafTaskOpenedEvent,
  RuntimeAggregateProjection,
  RuntimeFailureClass
} from "./carriers.js";
import {
  assertNonEmptyString,
  assertProjectionBasis,
  assertRuntimeFailureClass,
  assertVectorIndexInRange,
  frameIdForParentProjection,
  freezePlainPayload,
  freezeStringArray,
  graphCallIdForParentProjection,
  vectorEdge
} from "./runtime_support.js";

export function admitLeafTaskPayload(input: {
  readonly schemaRef: string;
  readonly value: Readonly<Record<string, unknown>>;
  readonly payloadRef?: string | null;
  readonly requiredKeys?: readonly string[];
}): AdmittedLeafTaskPayload {
  assertNonEmptyString(input.schemaRef, "LeafTaskPayload.schemaRef");
  const value = freezePlainPayload(input.value, "LeafTaskPayload.value");
  for (const [index, requiredKey] of (input.requiredKeys ?? []).entries()) {
    assertNonEmptyString(requiredKey, `LeafTaskPayload.requiredKeys[${index}]`);
    if (!Object.hasOwn(value, requiredKey)) {
      throw new TypeError(
        `LeafTaskPayload.value missing schema-required key ${JSON.stringify(requiredKey)}`
      );
    }
  }
  const payloadRef =
    input.payloadRef ??
    `leaf-task-payload:${input.schemaRef}:${JSON.stringify(value)}`;
  assertNonEmptyString(payloadRef, "LeafTaskPayload.payloadRef");

  return Object.freeze({
    kind: "admitted_leaf_task_payload",
    schemaRef: input.schemaRef,
    payloadRef,
    value
  });
}

function assertAdmittedLeafTaskPayload(
  value: AdmittedLeafTaskPayload,
  schemaRef: string,
  label: string
): void {
  if (value.kind !== "admitted_leaf_task_payload") {
    throw new TypeError(`${label} must be admitted before leaf-task use`);
  }
  if (value.schemaRef !== schemaRef) {
    throw new TypeError(`${label}.schemaRef must match ${schemaRef}`);
  }
  assertNonEmptyString(value.payloadRef, `${label}.payloadRef`);
  freezePlainPayload(value.value, `${label}.value`);
}

export function constructLeafTaskEnvelope(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly leafTaskId: string;
  readonly vectorIndex: number;
  readonly inputSchemaRef: string;
  readonly outputSchemaRef: string;
  readonly input: AdmittedLeafTaskPayload;
  readonly workerRef: string;
}): LeafTaskEnvelope {
  assertProjectionBasis(input.basis, input.projection, "LeafTaskEnvelope");
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  assertNonEmptyString(input.leafTaskId, "leafTaskId");
  assertNonEmptyString(input.inputSchemaRef, "inputSchemaRef");
  assertNonEmptyString(input.outputSchemaRef, "outputSchemaRef");
  assertNonEmptyString(input.workerRef, "workerRef");
  assertAdmittedLeafTaskPayload(
    input.input,
    input.inputSchemaRef,
    "LeafTaskEnvelope.input"
  );
  if (input.basis.runId === null) {
    throw new TypeError("LeafTaskEnvelope requires parent runId");
  }
  const graphCallId = graphCallIdForParentProjection(
    input.projection,
    "LeafTaskEnvelope"
  );
  const frameId = frameIdForParentProjection(input.projection, "LeafTaskEnvelope");

  return Object.freeze({
    kind: "leaf_task_envelope",
    leafTaskId: input.leafTaskId,
    parent: Object.freeze({
      basisId: input.basis.id,
      runId: input.basis.runId,
      graphCallId,
      frameId,
      vectorIndex: input.vectorIndex,
      edge: vectorEdge(input.basis, input.vectorIndex)
    }),
    inputSchemaRef: input.inputSchemaRef,
    outputSchemaRef: input.outputSchemaRef,
    input: input.input,
    workerRef: input.workerRef
  });
}

export function constructLeafTaskOpenedEvent(
  envelope: LeafTaskEnvelope
): LeafTaskOpenedEvent {
  return Object.freeze({
    kind: "leaf_task_opened",
    basisId: envelope.parent.basisId,
    leafTaskId: envelope.leafTaskId,
    runId: envelope.parent.runId,
    graphCallId: envelope.parent.graphCallId,
    frameId: envelope.parent.frameId,
    vectorIndex: envelope.parent.vectorIndex,
    edge: envelope.parent.edge,
    inputSchemaRef: envelope.inputSchemaRef,
    outputSchemaRef: envelope.outputSchemaRef,
    workerRef: envelope.workerRef
  });
}

export function constructLeafTaskCompletedEvent(input: {
  readonly envelope: LeafTaskEnvelope;
  readonly output: AdmittedLeafTaskPayload;
  readonly resultRef: string;
}): LeafTaskCompletedEvent {
  assertNonEmptyString(input.resultRef, "resultRef");
  assertAdmittedLeafTaskPayload(
    input.output,
    input.envelope.outputSchemaRef,
    "LeafTaskCompletedEvent.output"
  );
  return Object.freeze({
    kind: "leaf_task_completed",
    basisId: input.envelope.parent.basisId,
    leafTaskId: input.envelope.leafTaskId,
    runId: input.envelope.parent.runId,
    graphCallId: input.envelope.parent.graphCallId,
    frameId: input.envelope.parent.frameId,
    vectorIndex: input.envelope.parent.vectorIndex,
    edge: input.envelope.parent.edge,
    outputSchemaRef: input.envelope.outputSchemaRef,
    resultRef: input.resultRef,
    outputPayloadRef: input.output.payloadRef
  });
}

export function constructLeafTaskFailure(input: {
  readonly failureClass: RuntimeFailureClass;
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
}): LeafTaskFailure {
  assertRuntimeFailureClass(input.failureClass);
  assertNonEmptyString(input.detail, "LeafTaskFailure.detail");
  for (const [index, evidenceRef] of input.evidenceRefs.entries()) {
    assertNonEmptyString(evidenceRef, `LeafTaskFailure.evidenceRefs[${index}]`);
  }
  return Object.freeze({
    failureClass: input.failureClass,
    detail: input.detail,
    evidenceRefs: freezeStringArray(input.evidenceRefs)
  });
}

export function constructLeafTaskFailedEvent(input: {
  readonly envelope: LeafTaskEnvelope;
  readonly failure: LeafTaskFailure;
}): LeafTaskFailedEvent {
  const failure = constructLeafTaskFailure(input.failure);
  return Object.freeze({
    kind: "leaf_task_failed",
    basisId: input.envelope.parent.basisId,
    leafTaskId: input.envelope.leafTaskId,
    runId: input.envelope.parent.runId,
    graphCallId: input.envelope.parent.graphCallId,
    frameId: input.envelope.parent.frameId,
    vectorIndex: input.envelope.parent.vectorIndex,
    edge: input.envelope.parent.edge,
    failureClass: failure.failureClass,
    detail: failure.detail,
    evidenceRefs: failure.evidenceRefs
  });
}
