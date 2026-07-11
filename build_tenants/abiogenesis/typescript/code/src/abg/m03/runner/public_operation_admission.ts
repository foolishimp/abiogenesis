// Implements: T-223 DS-1 durable public-operation attribution
// Implements: REQ-P-PUBLIC-CONTRACTS-008

import type {
  CanonicalRuntimeEvent,
  PublicOperationAdmittedRuntimeEvent
} from "../contracts/carriers.js";
import {
  createSeededLiveEmitterContext,
  emitWithContext,
  type RuntimeEventSink
} from "../events/emit.js";

export interface PublicOperationAttributionInput {
  readonly operationId: PublicOperationAdmittedRuntimeEvent["operationId"];
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

export function admitPublicOperationAttribution(
  input: PublicOperationAttributionInput
): CanonicalRuntimeEvent & PublicOperationAdmittedRuntimeEvent {
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
  if (emitted?.kind !== "public_operation_admitted") {
    throw new TypeError("public operation admission emitted no canonical event");
  }
  return emitted;
}
