// Implements: T-223 DS-1 durable public-operation attribution
// Implements: REQ-P-PUBLIC-CONTRACTS-008

import type {
  CanonicalRuntimeEvent,
  LegacyPublicOperationAdmittedRuntimeEvent,
  PublicOperationAdmittedRuntimeEvent,
  RuntimeEvent
} from "../contracts/carriers.js";
import { sortReplayByAdmissionOrdinalFailClosed } from
  "../contracts/admission_hygiene.js";
import { assertCanonicalRuntimeEventSequence } from
  "../contracts/event_admission.js";
import {
  constructPublicOperationArtifactAdmittedEvent
} from "../contracts/public_operation_artifact_boundary.js";
import {
  assertPrivatePublicOperationIngressAdmissionWitness,
  type PrivatePublicOperationActorAttributionWitness,
  type PrivatePublicOperationIngressAdmissionWitness,
  type PrivatePublicOperationWorkspaceBindingWitness
} from "../contracts/private_public_operation_ingress.js";
import {
  admitOwnerNativeDefinitionKey,
  type OwnerNativeDefinitionKey
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import {
  createSeededLiveEmitterContext,
  emitWithContext,
  type RuntimeEventEmitterContext,
  type RuntimeEventSink
} from "../events/emit.js";

export interface PublicOperationAttributionInput {
  readonly operationId: LegacyPublicOperationAdmittedRuntimeEvent["operationId"];
  readonly invocationId: string;
  readonly requestId: string;
  readonly actorRef: string;
  readonly workspaceId: string;
  readonly bindingId: string;
  readonly catalogId: string;
  readonly capabilityProvenanceRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
  readonly eventSink: RuntimeEventSink;
}

function isLegacyPublicOperationAttributionEvent(
  event: CanonicalRuntimeEvent | undefined
): event is CanonicalRuntimeEvent & LegacyPublicOperationAdmittedRuntimeEvent {
  return event?.kind === "public_operation_admitted" &&
    Object.hasOwn(event, "operationId");
}

export function admitPublicOperationAttribution(
  input: PublicOperationAttributionInput
): CanonicalRuntimeEvent & LegacyPublicOperationAdmittedRuntimeEvent {
  const priorEventIds = new Set(input.priorEvents.map((event) => event.eventId));
  const unknownCausationRefs = input.causationEventRefs.filter(
    (eventRef) => !priorEventIds.has(eventRef)
  );
  if (unknownCausationRefs.length > 0) {
    throw new TypeError(
      `public operation causation refs are absent from replay: ${unknownCausationRefs.join(",")}`
    );
  }
  const [emitted] = emitWithContext(
    createSeededLiveEmitterContext(input.priorEvents),
    Object.freeze({
      kind: "public_operation_admitted",
      operationId: input.operationId,
      invocationId: input.invocationId,
      requestId: input.requestId,
      actorRef: input.actorRef,
      workspaceId: input.workspaceId,
      bindingId: input.bindingId,
      catalogId: input.catalogId,
      capabilityProvenanceRefs: Object.freeze([
        ...input.capabilityProvenanceRefs
      ]),
      causationEventRefs: Object.freeze([...input.causationEventRefs]),
      correlationId: input.correlationId
    }),
    input.eventSink
  );
  if (!isLegacyPublicOperationAttributionEvent(emitted)) {
    throw new TypeError("public operation admission emitted no canonical event");
  }
  return emitted;
}

export interface PublicOperationAdmissionReceipt {
  readonly kind: "public_operation_admission_receipt";
  readonly event: CanonicalRuntimeEvent & PublicOperationAdmittedRuntimeEvent;
}

interface PublicOperationAdmissionReceiptState {
  readonly emitterContext: RuntimeEventEmitterContext;
  readonly eventSink: RuntimeEventSink;
  readonly eventAdmission:
    PrivatePublicOperationIngressAdmissionWitness["eventAdmission"];
}

const PUBLIC_OPERATION_ADMISSION_RECEIPT_STATE = new WeakMap<
  object,
  PublicOperationAdmissionReceiptState
>();
const PUBLIC_OPERATION_ARTIFACT_BOUNDARY_EMITTED = new WeakSet<object>();

/** @internal */
export function assertPrivatePublicOperationAdmissionReceipt(
  input: unknown
): asserts input is PublicOperationAdmissionReceipt {
  if (
    typeof input !== "object" ||
    input === null ||
    !PUBLIC_OPERATION_ADMISSION_RECEIPT_STATE.has(input)
  ) {
    throw new TypeError(
      "public operation owner events require an emitted admission receipt"
    );
  }
}

function assertCanonicalReplayBasis(
  events: readonly CanonicalRuntimeEvent[]
): readonly CanonicalRuntimeEvent[] {
  assertCanonicalRuntimeEventSequence(events, "public operation prior replay");
  return sortReplayByAdmissionOrdinalFailClosed(
    events,
    "public operation prior replay"
  );
}

function genericPublicOperationEvent(
  witness: PrivatePublicOperationIngressAdmissionWitness
): PublicOperationAdmittedRuntimeEvent {
  const definitionKey = admitOwnerNativeDefinitionKey(witness.definitionKey);
  const actor = witness.actorAttribution.state === "admitted_actor"
    ? witness.actorAttribution
    : null;
  const scope = witness.workspaceBindingWitness.state === "admitted_workspace"
    ? witness.workspaceBindingWitness
    : null;
  return Object.freeze({
    kind: "public_operation_admitted",
    definitionKey,
    definitionDigest: witness.definitionDigest,
    invocationRef: witness.invocationRef,
    invocationDigest: witness.invocationDigest,
    invocationAuthorityRef: witness.invocationAuthorityRef,
    invocationAuthorityDigest: witness.invocationAuthorityDigest,
    authorityBasisRef: witness.authorityBasisRef,
    authorityBasisDigest: witness.authorityBasisDigest,
    actorRef: actor?.actorRef ?? null,
    actorAttributionRef: actor?.attributionRef ?? null,
    actorAttributionDigest: actor?.attributionDigest ?? null,
    workspaceBindingRequirement: witness.workspaceBindingRequirement,
    scopeRef: scope?.bindingRef ?? null,
    scopeDigest: scope?.bindingDigest ?? null,
    causationEventRefs: Object.freeze([...witness.causationEventRefs]),
    correlationId: witness.correlationId
  });
}

function isGenericPublicOperationAdmissionEvent(
  event: CanonicalRuntimeEvent | undefined
): event is CanonicalRuntimeEvent & PublicOperationAdmittedRuntimeEvent {
  return event?.kind === "public_operation_admitted" &&
    Object.hasOwn(event, "definitionKey");
}

/**
 * Emits typed public ingress truth without claiming ownership of the selected
 * operation's semantic effect. The returned receipt retains the one seeded
 * live emitter for a later artifact-boundary event.
 *
 * @internal
 */
export function admitPrivatePublicOperationEvent<
  const K extends OwnerNativeDefinitionKey
>(input: {
  readonly witness: PrivatePublicOperationIngressAdmissionWitness<K>;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
  readonly eventSink: RuntimeEventSink;
}): PublicOperationAdmissionReceipt {
  assertPrivatePublicOperationIngressAdmissionWitness(input.witness);
  if (input.witness.eventAdmission === "none") {
    throw new TypeError(
      "public operation definition declares no runtime event admission"
    );
  }
  const replay = assertCanonicalReplayBasis(input.priorEvents);
  const priorEventIds = new Set(replay.map((event) => event.eventId));
  const unknownCausationRefs = input.witness.causationEventRefs.filter(
    (eventRef) => !priorEventIds.has(eventRef)
  );
  if (unknownCausationRefs.length > 0) {
    throw new TypeError(
      `public operation causation refs are absent from replay: ${unknownCausationRefs.join(",")}`
    );
  }
  const emitterContext = createSeededLiveEmitterContext(replay);
  const [event] = emitWithContext(
    emitterContext,
    genericPublicOperationEvent(input.witness),
    input.eventSink
  );
  if (!isGenericPublicOperationAdmissionEvent(event)) {
    throw new TypeError("public operation admission emitted no canonical event");
  }
  const receipt = Object.freeze({
    kind: "public_operation_admission_receipt" as const,
    event
  });
  PUBLIC_OPERATION_ADMISSION_RECEIPT_STATE.set(receipt, Object.freeze({
    emitterContext,
    eventSink: input.eventSink,
    eventAdmission: input.witness.eventAdmission
  }));
  return receipt;
}

function receiptState(
  admission: PublicOperationAdmissionReceipt
): PublicOperationAdmissionReceiptState {
  assertPrivatePublicOperationAdmissionReceipt(admission);
  const state = PUBLIC_OPERATION_ADMISSION_RECEIPT_STATE.get(admission);
  if (state === undefined) {
    throw new TypeError(
      "public operation owner events require an emitted admission receipt"
    );
  }
  return state;
}

function emitFromReceipt(input: {
  readonly state: PublicOperationAdmissionReceiptState;
  readonly events: RuntimeEvent | readonly RuntimeEvent[];
}): readonly CanonicalRuntimeEvent[] {
  return emitWithContext(
    input.state.emitterContext,
    input.events,
    input.state.eventSink
  );
}

/** @internal */
export function emitPrivatePublicOperationOwnerEvents(input: {
  readonly admission: PublicOperationAdmissionReceipt;
  readonly events: RuntimeEvent | readonly RuntimeEvent[];
}): readonly CanonicalRuntimeEvent[] {
  const state = receiptState(input.admission);
  if (state.eventAdmission !== "owning_semantic_authority") {
    throw new TypeError(
      "public operation owner events require owning_semantic_authority admission"
    );
  }
  return emitFromReceipt({ state, events: input.events });
}

/** @internal */
export function emitPrivatePublicOperationArtifactBoundary(input: {
  readonly admission: PublicOperationAdmissionReceipt;
  readonly scopeRef: string;
  readonly scopeDigest: string;
  readonly disposition: string;
  readonly artifactRef: string;
  readonly artifactDigest: string;
}): CanonicalRuntimeEvent {
  const state = receiptState(input.admission);
  if (state.eventAdmission !== "immutable_artifact_boundary") {
    throw new TypeError(
      "public operation artifact boundary requires immutable_artifact_boundary admission"
    );
  }
  if (PUBLIC_OPERATION_ARTIFACT_BOUNDARY_EMITTED.has(input.admission)) {
    throw new TypeError(
      "public operation artifact boundary admits exactly one event per invocation"
    );
  }
  const admission = input.admission.event;
  const [event] = emitFromReceipt({
    state,
    events: constructPublicOperationArtifactAdmittedEvent({
      operationId: admission.definitionKey.operationId,
      definitionKey: admission.definitionKey,
      definitionDigest: admission.definitionDigest,
      scopeRef: input.scopeRef,
      scopeDigest: input.scopeDigest,
      invocationRef: admission.invocationRef,
      invocationDigest: admission.invocationDigest,
      disposition: input.disposition,
      artifactRef: input.artifactRef,
      artifactDigest: input.artifactDigest,
      causationEventRefs: Object.freeze([admission.eventId]),
      correlationId: admission.correlationId
    })
  });
  if (event?.kind !== "public_operation_artifact_admitted") {
    throw new TypeError(
      "public operation artifact admission emitted no canonical event"
    );
  }
  PUBLIC_OPERATION_ARTIFACT_BOUNDARY_EMITTED.add(input.admission);
  return event;
}

/** @internal */
export interface PrivatePublicOperationIngressWitnessInput<
  K extends OwnerNativeDefinitionKey
> {
  readonly definitionKey: K;
  readonly definitionDigest: string;
  readonly eventAdmission:
    | "none"
    | "owning_semantic_authority"
    | "immutable_artifact_boundary";
  readonly invocationRef: string;
  readonly invocationDigest: string;
  readonly invocationAuthorityRef: string;
  readonly invocationAuthorityDigest: string;
  readonly authorityBasisRef: string;
  readonly authorityBasisDigest: string;
  readonly actorAttribution: PrivatePublicOperationActorAttributionWitness;
  readonly workspaceBindingRequirement: "forbidden" | "exactly_one";
  readonly workspaceBindingWitness:
    PrivatePublicOperationWorkspaceBindingWitness;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
}

/** @internal */
export function admitPrivatePublicOperationIngressWitness<
  const K extends OwnerNativeDefinitionKey
>(
  input: PrivatePublicOperationIngressWitnessInput<K>
): PrivatePublicOperationIngressAdmissionWitness<K> {
  const priorEventIds = new Set(input.priorEvents.map((event) => event.eventId));
  const unknownCausationRefs = input.causationEventRefs.filter(
    (eventRef) => !priorEventIds.has(eventRef)
  );
  if (unknownCausationRefs.length > 0) {
    throw new TypeError(
      `public operation causation refs are absent from replay: ${unknownCausationRefs.join(",")}`
    );
  }
  const witness: PrivatePublicOperationIngressAdmissionWitness<K> =
    Object.freeze({
      kind: "private_public_operation_ingress_admitted",
      definitionKey: input.definitionKey,
      definitionDigest: input.definitionDigest,
      eventAdmission: input.eventAdmission,
      invocationRef: input.invocationRef,
      invocationDigest: input.invocationDigest,
      invocationAuthorityRef: input.invocationAuthorityRef,
      invocationAuthorityDigest: input.invocationAuthorityDigest,
      authorityBasisRef: input.authorityBasisRef,
      authorityBasisDigest: input.authorityBasisDigest,
      actorAttribution: Object.freeze({ ...input.actorAttribution }),
      workspaceBindingRequirement: input.workspaceBindingRequirement,
      workspaceBindingWitness: Object.freeze({
        ...input.workspaceBindingWitness
      }),
      causationEventRefs: Object.freeze([...input.causationEventRefs]),
      correlationId: input.correlationId
    });
  assertPrivatePublicOperationIngressAdmissionWitness(witness);
  return witness;
}
