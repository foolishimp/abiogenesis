// Implements: T-223 DS-1 durable public-operation attribution
// Implements: REQ-P-PUBLIC-CONTRACTS-008

import type {
  CanonicalRuntimeEvent,
  LegacyPublicOperationAdmittedRuntimeEvent
} from "../contracts/carriers.js";
import {
  assertPrivatePublicOperationIngressAdmissionWitness,
  type PrivatePublicOperationActorAttributionWitness,
  type PrivatePublicOperationIngressAdmissionWitness,
  type PrivatePublicOperationWorkspaceBindingWitness
} from "../contracts/private_public_operation_ingress.js";
import type {
  OwnerNativeDefinitionKey
} from "../../../shared/validation/owner_native_operation_contract_source.js";
import {
  createSeededLiveEmitterContext,
  emitWithContext,
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

/** @internal */
export interface PrivatePublicOperationIngressWitnessInput<
  K extends OwnerNativeDefinitionKey
> {
  readonly definitionKey: K;
  readonly definitionDigest: string;
  readonly eventAdmission: "owning_semantic_authority";
  readonly invocationRef: string;
  readonly invocationDigest: string;
  readonly invocationAuthorityRef: string;
  readonly invocationAuthorityDigest: string;
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
