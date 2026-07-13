// Implements: T-258 public F_H hold, response, replay, and resume admission.
// Implements: REQ-P-POLICY-031..033, REQ-R-ABG3-ASSURANCE-033.

import type {
  CanonicalRuntimeEvent,
  FhInteractionOpenedEvent,
  FhInteractionRespondedEvent,
  FhInteractionResumeAdmittedEvent
} from "../contracts/carriers.js";
import type { DeclaredFhInteractionRequest } from "../contracts/declared_execution_context.js";
import {
  createSeededLiveEmitterContext,
  emitWithContext,
  type RuntimeEventSink
} from "../events/emit.js";
import {
  admitIJsonValue,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";

export const FH_PUBLIC_OPERATION_ID_VALUES = Object.freeze([
  "abg.operation.fh.select",
  "abg.operation.fh.approve",
  "abg.operation.fh.reject",
  "abg.operation.fh.assess",
  "abg.operation.fh.answer-escalation"
] as const);

export type FhPublicOperationId =
  (typeof FH_PUBLIC_OPERATION_ID_VALUES)[number];

export type FhInteractionStatus =
  | "pending"
  | "responded"
  | "held"
  | "resume_admitted";

export interface FhInteractionProjection {
  readonly kind: "fh_interaction_projection";
  readonly interactionRef: string;
  readonly interactionBasisDigest: `sha256:${string}`;
  readonly status: FhInteractionStatus;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly cCallRef: string;
  readonly interactionSubjectRef: string;
  readonly continuationRef: string;
  readonly requestRef: string;
  readonly requestDigest: `sha256:${string}`;
  readonly responseContractRef: string;
  readonly eligibleOperationIds: readonly FhPublicOperationId[];
  readonly resumeEligibleOperationIds: readonly FhPublicOperationId[];
  readonly declaredChoiceRefs: readonly string[];
  readonly requiredCapabilityRefs: readonly string[];
  readonly capabilityBasisDigest: `sha256:${string}`;
  readonly responseRef: string | null;
  readonly responseDigest: `sha256:${string}` | null;
  readonly responseOperationId: FhPublicOperationId | null;
  readonly responseActorRef: string | null;
  readonly responseValue: IJsonValue | null;
  readonly responseChoiceRef: string | null;
  readonly resumeRef: string | null;
  readonly evidenceRefs: readonly string[];
  readonly capabilityProvenanceRefs: readonly string[];
  readonly eventRefs: readonly string[];
  readonly replayRefs: readonly string[];
}

export type FhInteractionAdmissionFailureCode =
  | "unknown_interaction"
  | "ambiguous_interaction"
  | "stale_basis"
  | "interaction_not_pending"
  | "operation_not_declared"
  | "choice_not_declared"
  | "response_contract_mismatch"
  | "capability_mismatch"
  | "capability_provenance_missing"
  | "evidence_missing"
  | "response_mismatch"
  | "continuation_mismatch"
  | "response_not_resume_eligible"
  | "replay_invalid";

export class FhInteractionAdmissionError extends Error {
  public constructor(
    public readonly code: FhInteractionAdmissionFailureCode,
    message: string
  ) {
    super(message);
    this.name = "FhInteractionAdmissionError";
  }
}

export interface OpenFhInteractionInput {
  readonly request: DeclaredFhInteractionRequest;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly cCallRef: string;
  readonly causationEventRefs: readonly string[];
  readonly correlationId: string;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
  readonly eventSink: RuntimeEventSink;
}

export interface SubmitFhInteractionResponseInput {
  readonly interactionRef: string;
  readonly interactionBasisDigest: `sha256:${string}`;
  readonly operationId: FhPublicOperationId;
  readonly invocationId: string;
  readonly requestId: string;
  readonly actorRef: string;
  readonly responseContractRef: string;
  readonly choiceRef: string | null;
  readonly value: IJsonValue;
  readonly evidenceRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly capabilityProvenanceRefs: readonly string[];
  readonly correlationId: string;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
  readonly eventSink: RuntimeEventSink;
}

export interface AdmitFhInteractionResumeInput {
  readonly interactionRef: string;
  readonly interactionBasisDigest: `sha256:${string}`;
  readonly responseRef: string;
  readonly continuationRef: string;
  readonly invocationId: string;
  readonly requestId: string;
  readonly actorRef: string;
  readonly correlationId: string;
  readonly priorEvents: readonly CanonicalRuntimeEvent[];
  readonly eventSink: RuntimeEventSink;
}

export interface FhInteractionMutationResult {
  readonly projection: FhInteractionProjection;
  readonly event:
    | (CanonicalRuntimeEvent & FhInteractionRespondedEvent)
    | (CanonicalRuntimeEvent & FhInteractionResumeAdmittedEvent);
  readonly replayed: boolean;
}

function nonEmpty(value: string, label: string): string {
  if (value.length === 0) {
    throw new FhInteractionAdmissionError("replay_invalid", `${label} is empty`);
  }
  return value;
}

function isCanonicalDigest(value: string): value is `sha256:${string}` {
  return /^sha256:[0-9a-f]{64}$/u.test(value);
}

function digest(value: string, label: string): `sha256:${string}` {
  if (!isCanonicalDigest(value)) {
    throw new FhInteractionAdmissionError("replay_invalid", `${label} is not a canonical digest`);
  }
  return value;
}

function uniqueStrings(values: readonly string[], label: string): readonly string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const [index, raw] of values.entries()) {
    const value = nonEmpty(raw, `${label}[${String(index)}]`);
    if (seen.has(value)) {
      throw new FhInteractionAdmissionError("replay_invalid", `${label} contains duplicate ${value}`);
    }
    seen.add(value);
    result.push(value);
  }
  return Object.freeze(result);
}

function publicOperationIds(
  values: readonly string[],
  label: string
): readonly FhPublicOperationId[] {
  const admitted = uniqueStrings(values, label);
  const operationIds: FhPublicOperationId[] = [];
  for (const value of admitted) {
    if (!isFhPublicOperationId(value)) {
      throw new FhInteractionAdmissionError(
        "operation_not_declared",
        `${label} contains non-public F_H operation ${value}`
      );
    }
    operationIds.push(value);
  }
  return Object.freeze(operationIds);
}

function isFhPublicOperationId(value: string): value is FhPublicOperationId {
  return FH_PUBLIC_OPERATION_ID_VALUES.some((candidate) => candidate === value);
}

function publicOperationId(value: string, label: string): FhPublicOperationId {
  if (!isFhPublicOperationId(value)) {
    throw new FhInteractionAdmissionError(
      "operation_not_declared",
      `${label} contains non-public F_H operation ${value}`
    );
  }
  return value;
}

function sameStringSet(left: readonly string[], right: readonly string[]): boolean {
  const leftSorted = [...left].sort();
  const rightSorted = [...right].sort();
  return (
    leftSorted.length === rightSorted.length &&
    leftSorted.every((value, index) => value === rightSorted[index])
  );
}

function sameStringList(left: readonly string[], right: readonly string[]): boolean {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  );
}

function canonicalEventOrdinal(
  event: CanonicalRuntimeEvent,
  label: string
): number {
  if (
    !Number.isSafeInteger(event.eventAdmissionOrdinal) ||
    event.eventAdmissionOrdinal < 0
  ) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      `${label} has an invalid admission ordinal`
    );
  }
  return event.eventAdmissionOrdinal;
}

function requireKnownCausation(
  priorEvents: readonly CanonicalRuntimeEvent[],
  refs: readonly string[]
): void {
  const known = new Set(priorEvents.map((event) => event.eventId));
  const missing = refs.filter((ref) => !known.has(ref));
  if (missing.length > 0) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      `causation events are absent from replay: ${missing.join(",")}`
    );
  }
}

function openedBasis(event: FhInteractionOpenedEvent): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: "fh_interaction_basis",
    basisId: event.basisId,
    graphFunctionId: event.graphFunctionId,
    graphCallId: event.graphCallId,
    frameId: event.frameId,
    vectorIndex: event.vectorIndex,
    edge: event.edge,
    cCallRef: event.cCallRef,
    interactionSubjectRef: event.interactionSubjectRef,
    continuationRef: event.continuationRef,
    requestRef: event.requestRef,
    requestDigest: event.requestDigest,
    responseContractRef: event.responseContractRef,
    eligibleOperationIds: event.eligibleOperationIds,
    resumeEligibleOperationIds: event.resumeEligibleOperationIds,
    declaredChoiceRefs: event.declaredChoiceRefs,
    requiredCapabilityRefs: event.requiredCapabilityRefs,
    capabilityBasisDigest: event.capabilityBasisDigest,
    sourceCarrierRefs: event.sourceCarrierRefs,
    sourceCarrierDigests: event.sourceCarrierDigests
  });
}

function continuationBasis(input: {
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly requestRef: string;
  readonly requestDigest: string;
}): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: "fh_continuation",
    basisId: input.basisId,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    requestRef: input.requestRef,
    requestDigest: input.requestDigest
  });
}

function verifyDeclaredFhRequest(request: DeclaredFhInteractionRequest): void {
  const {
    requestRef,
    requestDigest,
    ...variant
  } = request;
  const expectedDigest = stableSha256Digest(variant);
  const expectedRef =
    `abg://declared-execution-request/${expectedDigest.slice("sha256:".length)}`;
  if (requestDigest !== expectedDigest || requestRef !== expectedRef) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      "declared F_H request identity is incoherent"
    );
  }
  const { blockDigest, ...startupBlockBasis } = request.startupBlock;
  const authorityRefs = uniqueStrings(
    request.startupBlock.authorityRefs,
    "DeclaredFhInteractionRequest.startupBlock.authorityRefs"
  );
  if (
    request.startupBlock.kind !== "graph_vector_traversal_startup_block" ||
    request.startupBlock.status !== "startup_blocked_awaiting_t267" ||
    request.startupBlock.gapFamily !== "traversal_execution_contracts" ||
    request.startupBlock.runtimeAddressable !== false ||
    request.startupBlock.effectsPermitted !== false ||
    authorityRefs.length === 0 ||
    !isCanonicalDigest(blockDigest) ||
    request.startupBlockDigest !== blockDigest ||
    stableSha256Digest(startupBlockBasis) !== blockDigest
  ) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      "declared F_H request does not preserve the canonical T-267 startup fence"
    );
  }
}

function responseBasis(input: {
  readonly interactionRef: string;
  readonly interactionBasisDigest: `sha256:${string}`;
  readonly continuationRef: string;
  readonly operationId: FhPublicOperationId;
  readonly invocationId: string;
  readonly requestId: string;
  readonly actorRef: string;
  readonly responseContractRef: string;
  readonly choiceRef: string | null;
  readonly value: IJsonValue;
  readonly evidenceRefs: readonly string[];
  readonly capabilityRefs: readonly string[];
  readonly capabilityProvenanceRefs: readonly string[];
}): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: "fh_interaction_response",
    interactionRef: input.interactionRef,
    interactionBasisDigest: input.interactionBasisDigest,
    continuationRef: input.continuationRef,
    operationId: input.operationId,
    invocationId: input.invocationId,
    requestId: input.requestId,
    actorRef: input.actorRef,
    responseContractRef: input.responseContractRef,
    choiceRef: input.choiceRef,
    value: input.value,
    evidenceRefs: input.evidenceRefs,
    capabilityRefs: input.capabilityRefs,
    capabilityProvenanceRefs: input.capabilityProvenanceRefs
  });
}

function resumeBasis(input: {
  readonly interactionRef: string;
  readonly interactionBasisDigest: `sha256:${string}`;
  readonly continuationRef: string;
  readonly responseDigest: `sha256:${string}`;
  readonly responseRef: string;
  readonly invocationId: string;
  readonly requestId: string;
  readonly actorRef: string;
}): Readonly<Record<string, unknown>> {
  return Object.freeze({
    kind: "fh_interaction_resume",
    interactionRef: input.interactionRef,
    interactionBasisDigest: input.interactionBasisDigest,
    continuationRef: input.continuationRef,
    responseRef: input.responseRef,
    responseDigest: input.responseDigest,
    invocationId: input.invocationId,
    requestId: input.requestId,
    actorRef: input.actorRef
  });
}

function emittedOne(events: readonly CanonicalRuntimeEvent[]): CanonicalRuntimeEvent {
  const event = events[0];
  if (events.length !== 1 || event === undefined) {
    throw new FhInteractionAdmissionError("replay_invalid", "runtime did not emit exactly one event");
  }
  return event;
}

export function openFhInteraction(
  input: OpenFhInteractionInput
): CanonicalRuntimeEvent & FhInteractionOpenedEvent {
  const priorEvents = Object.freeze([...input.priorEvents]);
  if (input.request.regime !== "F_H") {
    throw new FhInteractionAdmissionError("replay_invalid", "F_H interaction requires an F_H request");
  }
  verifyDeclaredFhRequest(input.request);
  requireKnownCausation(priorEvents, input.causationEventRefs);
  const eligibleOperationIds = publicOperationIds(
    input.request.eligibleOperationIds,
    "DeclaredFhInteractionRequest.eligibleOperationIds"
  );
  if (eligibleOperationIds.length === 0) {
    throw new FhInteractionAdmissionError("operation_not_declared", "F_H interaction has no eligible operation");
  }
  const resumeEligibleOperationIds = publicOperationIds(
    input.request.resumeEligibleOperationIds,
    "DeclaredFhInteractionRequest.resumeEligibleOperationIds"
  );
  if (!resumeEligibleOperationIds.every((value) => eligibleOperationIds.includes(value))) {
    throw new FhInteractionAdmissionError("operation_not_declared", "resume operation is not interaction-eligible");
  }
  const sourceCarrierRefs = uniqueStrings(
    input.request.sourceCarrierRefs,
    "sourceCarrierRefs"
  );
  const sourceCarrierDigests = Object.freeze(
    input.request.sourceCarrierDigests.map((value, index) =>
      digest(value, `sourceCarrierDigests[${String(index)}]`)
    )
  );
  if (sourceCarrierRefs.length !== sourceCarrierDigests.length) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      "source carrier refs and digests do not have equal cardinality"
    );
  }
  if (!Number.isSafeInteger(input.vectorIndex) || input.vectorIndex < 0) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      "vectorIndex is not a non-negative safe integer"
    );
  }
  const continuationDigest = stableSha256Digest(continuationBasis({
    basisId: input.basisId,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    requestRef: input.request.requestRef,
    requestDigest: input.request.requestDigest
  }));
  const continuationRef = `abg://fh-continuation/${continuationDigest.slice("sha256:".length)}`;
  const basisSeed: FhInteractionOpenedEvent = Object.freeze({
    kind: "fh_interaction_opened",
    basisId: nonEmpty(input.basisId, "basisId"),
    graphFunctionId: nonEmpty(input.graphFunctionId, "graphFunctionId"),
    graphCallId: nonEmpty(input.graphCallId, "graphCallId"),
    frameId: nonEmpty(input.frameId, "frameId"),
    vectorIndex: input.vectorIndex,
    edge: nonEmpty(input.edge, "edge"),
    cCallRef: nonEmpty(input.cCallRef, "cCallRef"),
    interactionRef: "pending",
    interactionBasisDigest: "pending",
    interactionSubjectRef: nonEmpty(input.request.interactionSubjectRef, "interactionSubjectRef"),
    continuationRef,
    requestRef: nonEmpty(input.request.requestRef, "requestRef"),
    requestDigest: digest(input.request.requestDigest, "requestDigest"),
    responseContractRef: nonEmpty(input.request.resultContractRef, "responseContractRef"),
    eligibleOperationIds,
    resumeEligibleOperationIds,
    declaredChoiceRefs: uniqueStrings(input.request.declaredChoiceRefs, "declaredChoiceRefs"),
    requiredCapabilityRefs: uniqueStrings(input.request.capabilityRefs, "requiredCapabilityRefs"),
    capabilityBasisDigest: digest(input.request.capabilityBasisDigest, "capabilityBasisDigest"),
    sourceCarrierRefs,
    sourceCarrierDigests,
    causationEventRefs: uniqueStrings(input.causationEventRefs, "causationEventRefs"),
    correlationId: nonEmpty(input.correlationId, "correlationId")
  });
  const interactionBasisDigest = stableSha256Digest(openedBasis(basisSeed));
  const interactionRef = `abg://fh-interaction/${interactionBasisDigest.slice("sha256:".length)}`;
  const existing = priorEvents.filter(
    (event): event is CanonicalRuntimeEvent & FhInteractionOpenedEvent =>
      event.kind === "fh_interaction_opened" && event.interactionRef === interactionRef
  );
  if (existing.length > 0) {
    const current = projectFhInteraction(priorEvents, interactionRef);
    const existingEvent = existing[0];
    if (
      existing.length === 1 &&
      existingEvent !== undefined &&
      current !== null &&
      current.interactionBasisDigest === interactionBasisDigest
    ) {
      return existingEvent;
    }
    throw new FhInteractionAdmissionError("ambiguous_interaction", "interaction identity already exists with different truth");
  }
  const emitted = emitWithContext(
    createSeededLiveEmitterContext(priorEvents),
    Object.freeze({
      ...basisSeed,
      interactionRef,
      interactionBasisDigest
    }),
    input.eventSink
  );
  const event = emittedOne(emitted);
  if (event.kind !== "fh_interaction_opened") {
    throw new FhInteractionAdmissionError("replay_invalid", "runtime emitted the wrong interaction event");
  }
  return event;
}

function verifyOpened(
  event: CanonicalRuntimeEvent & FhInteractionOpenedEvent,
  events: readonly CanonicalRuntimeEvent[]
): void {
  const eligible = publicOperationIds(event.eligibleOperationIds, "FhInteractionOpenedEvent.eligibleOperationIds");
  const resume = publicOperationIds(event.resumeEligibleOperationIds, "FhInteractionOpenedEvent.resumeEligibleOperationIds");
  const requestDigest = digest(event.requestDigest, "FhInteractionOpenedEvent.requestDigest");
  const sourceCarrierRefs = uniqueStrings(
    event.sourceCarrierRefs,
    "FhInteractionOpenedEvent.sourceCarrierRefs"
  );
  const sourceCarrierDigests = event.sourceCarrierDigests.map((value, index) =>
    digest(value, `FhInteractionOpenedEvent.sourceCarrierDigests[${String(index)}]`)
  );
  uniqueStrings(event.declaredChoiceRefs, "FhInteractionOpenedEvent.declaredChoiceRefs");
  uniqueStrings(event.requiredCapabilityRefs, "FhInteractionOpenedEvent.requiredCapabilityRefs");
  const causationEventRefs = uniqueStrings(
    event.causationEventRefs,
    "FhInteractionOpenedEvent.causationEventRefs"
  );
  if (!resume.every((value) => eligible.includes(value))) {
    throw new FhInteractionAdmissionError("replay_invalid", "opened interaction resume set widens eligible operations");
  }
  if (sourceCarrierRefs.length !== sourceCarrierDigests.length) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      "opened interaction source carrier refs and digests differ in cardinality"
    );
  }
  if (
    event.requestRef !==
    `abg://declared-execution-request/${requestDigest.slice("sha256:".length)}`
  ) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      "opened interaction does not preserve declared request identity"
    );
  }
  const continuationDigest = stableSha256Digest(continuationBasis(event));
  if (
    event.continuationRef !==
    `abg://fh-continuation/${continuationDigest.slice("sha256:".length)}`
  ) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      "opened interaction continuation identity is incoherent"
    );
  }
  requireKnownCausation(events, causationEventRefs);
  const openedOrdinal = canonicalEventOrdinal(event, "FhInteractionOpenedEvent");
  const eventByRef = new Map(events.map((candidate) => [candidate.eventId, candidate]));
  if (
    causationEventRefs.some((ref) => {
      const cause = eventByRef.get(ref);
      return (
        cause === undefined ||
        canonicalEventOrdinal(cause, "FhInteractionOpenedEvent.cause") >=
          openedOrdinal
      );
    })
  ) {
    throw new FhInteractionAdmissionError(
      "replay_invalid",
      "opened interaction causation does not precede the interaction"
    );
  }
  const expectedDigest = stableSha256Digest(openedBasis(event));
  if (
    event.interactionBasisDigest !== expectedDigest ||
    event.interactionRef !== `abg://fh-interaction/${expectedDigest.slice("sha256:".length)}`
  ) {
    throw new FhInteractionAdmissionError("replay_invalid", "opened interaction identity is incoherent");
  }
}

export function projectFhInteraction(
  events: readonly CanonicalRuntimeEvent[],
  interactionRef: string
): FhInteractionProjection | null {
  const opened = events.filter(
    (event): event is CanonicalRuntimeEvent & FhInteractionOpenedEvent =>
      event.kind === "fh_interaction_opened" && event.interactionRef === interactionRef
  );
  if (opened.length === 0) {
    return null;
  }
  if (opened.length !== 1 || opened[0] === undefined) {
    throw new FhInteractionAdmissionError("ambiguous_interaction", "interaction opened more than once");
  }
  const source = opened[0];
  verifyOpened(source, events);
  const responses = events.filter(
    (event): event is CanonicalRuntimeEvent & FhInteractionRespondedEvent =>
      event.kind === "fh_interaction_responded" && event.interactionRef === interactionRef
  );
  if (responses.length > 1) {
    throw new FhInteractionAdmissionError("replay_invalid", "interaction has multiple admitted responses");
  }
  const response = responses[0] ?? null;
  if (
    response !== null &&
    (response.basisId !== source.basisId ||
      response.graphCallId !== source.graphCallId ||
      response.interactionBasisDigest !== source.interactionBasisDigest ||
      response.continuationRef !== source.continuationRef ||
      response.responseContractRef !== source.responseContractRef)
  ) {
    throw new FhInteractionAdmissionError("replay_invalid", "response does not preserve interaction identity");
  }
  if (response !== null) {
    const responseOperationId = publicOperationId(
      response.operationId,
      "FhInteractionRespondedEvent.operationId"
    );
    const responseEvidenceRefs = uniqueStrings(
      response.evidenceRefs,
      "FhInteractionRespondedEvent.evidenceRefs"
    );
    const responseCapabilityRefs = uniqueStrings(
      response.capabilityRefs,
      "FhInteractionRespondedEvent.capabilityRefs"
    );
    const responseCapabilityProvenanceRefs = uniqueStrings(
      response.capabilityProvenanceRefs,
      "FhInteractionRespondedEvent.capabilityProvenanceRefs"
    );
    const responseCausationRefs = uniqueStrings(
      response.causationEventRefs,
      "FhInteractionRespondedEvent.causationEventRefs"
    );
    if (!source.eligibleOperationIds.includes(responseOperationId)) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "response operation is absent from the opened interaction"
      );
    }
    if (
      response.choiceRef !== null &&
      !source.declaredChoiceRefs.includes(response.choiceRef)
    ) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "response choice is absent from the opened interaction"
      );
    }
    if (responseOperationId === "abg.operation.fh.select" && response.choiceRef === null) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "selection response omits its declared choice"
      );
    }
    if (!sameStringSet(source.requiredCapabilityRefs, responseCapabilityRefs)) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "response capability set differs from the opened interaction"
      );
    }
    if (
      responseCapabilityRefs.length > 0 &&
      responseCapabilityProvenanceRefs.length === 0
    ) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "response capability provenance is absent"
      );
    }
    if (responseEvidenceRefs.length === 0) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "response evidence is absent"
      );
    }
    if (!sameStringList(responseCausationRefs, [source.eventId])) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "response causation does not cite exactly the opened interaction"
      );
    }
    if (
      canonicalEventOrdinal(response, "FhInteractionRespondedEvent") <=
      canonicalEventOrdinal(source, "FhInteractionOpenedEvent")
    ) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "response does not follow the opened interaction"
      );
    }
    const expectedResponseDigest = stableSha256Digest(responseBasis({
      interactionRef: source.interactionRef,
      interactionBasisDigest: digest(source.interactionBasisDigest, "interactionBasisDigest"),
      continuationRef: source.continuationRef,
      operationId: responseOperationId,
      invocationId: nonEmpty(response.invocationId, "FhInteractionRespondedEvent.invocationId"),
      requestId: nonEmpty(response.requestId, "FhInteractionRespondedEvent.requestId"),
      actorRef: nonEmpty(response.actorRef, "FhInteractionRespondedEvent.actorRef"),
      responseContractRef: response.responseContractRef,
      choiceRef: response.choiceRef,
      value: admitIJsonValue(response.value, "FhInteractionRespondedEvent.value"),
      evidenceRefs: responseEvidenceRefs,
      capabilityRefs: responseCapabilityRefs,
      capabilityProvenanceRefs: responseCapabilityProvenanceRefs
    }));
    if (
      response.responseDigest !== expectedResponseDigest ||
      response.responseRef !== `abg://fh-response/${expectedResponseDigest.slice("sha256:".length)}`
    ) {
      throw new FhInteractionAdmissionError("replay_invalid", "response identity is incoherent");
    }
  }
  const resumes = events.filter(
    (event): event is CanonicalRuntimeEvent & FhInteractionResumeAdmittedEvent =>
      event.kind === "fh_interaction_resume_admitted" && event.interactionRef === interactionRef
  );
  if (resumes.length > 1) {
    throw new FhInteractionAdmissionError("replay_invalid", "interaction has multiple resume admissions");
  }
  const resume = resumes[0] ?? null;
  if (
    resume !== null &&
    (response === null ||
      resume.basisId !== source.basisId ||
      resume.graphCallId !== source.graphCallId ||
      resume.responseRef !== response.responseRef ||
      resume.responseDigest !== response.responseDigest ||
      resume.continuationRef !== source.continuationRef ||
      resume.interactionBasisDigest !== source.interactionBasisDigest)
  ) {
    throw new FhInteractionAdmissionError("replay_invalid", "resume does not preserve response and continuation identity");
  }
  if (resume !== null) {
    if (
      response === null ||
      !source.resumeEligibleOperationIds.includes(response.operationId)
    ) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "resume follows a response that is not resume-eligible"
      );
    }
    const resumeCausationRefs = uniqueStrings(
      resume.causationEventRefs,
      "FhInteractionResumeAdmittedEvent.causationEventRefs"
    );
    if (!sameStringList(resumeCausationRefs, [response.eventId])) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "resume causation does not cite exactly the admitted response"
      );
    }
    if (
      canonicalEventOrdinal(resume, "FhInteractionResumeAdmittedEvent") <=
      canonicalEventOrdinal(response, "FhInteractionRespondedEvent")
    ) {
      throw new FhInteractionAdmissionError(
        "replay_invalid",
        "resume does not follow the admitted response"
      );
    }
    const expectedResumeDigest = stableSha256Digest(resumeBasis({
      interactionRef: source.interactionRef,
      interactionBasisDigest: digest(source.interactionBasisDigest, "interactionBasisDigest"),
      continuationRef: source.continuationRef,
      responseDigest: digest(response?.responseDigest ?? "", "responseDigest"),
      responseRef: resume.responseRef,
      invocationId: nonEmpty(resume.invocationId, "FhInteractionResumeAdmittedEvent.invocationId"),
      requestId: nonEmpty(resume.requestId, "FhInteractionResumeAdmittedEvent.requestId"),
      actorRef: nonEmpty(resume.actorRef, "FhInteractionResumeAdmittedEvent.actorRef")
    }));
    if (
      resume.resumeDigest !== expectedResumeDigest ||
      resume.resumeRef !== `abg://fh-resume/${expectedResumeDigest.slice("sha256:".length)}`
    ) {
      throw new FhInteractionAdmissionError("replay_invalid", "resume identity is incoherent");
    }
  }
  const eligibleOperationIds = publicOperationIds(source.eligibleOperationIds, "eligibleOperationIds");
  const resumeEligibleOperationIds = publicOperationIds(source.resumeEligibleOperationIds, "resumeEligibleOperationIds");
  const responseOperationId =
    response === null
      ? null
      : publicOperationId(
          response.operationId,
          "FhInteractionRespondedEvent.operationId"
        );
  const status: FhInteractionStatus =
    resume !== null
      ? "resume_admitted"
      : response === null
        ? "pending"
        : responseOperationId !== null && resumeEligibleOperationIds.includes(responseOperationId)
          ? "responded"
          : "held";
  const relevantEvents = Object.freeze([
    source,
    ...(response === null ? [] : [response]),
    ...(resume === null ? [] : [resume])
  ]);
  return Object.freeze({
    kind: "fh_interaction_projection",
    interactionRef: source.interactionRef,
    interactionBasisDigest: digest(source.interactionBasisDigest, "interactionBasisDigest"),
    status,
    basisId: source.basisId,
    graphFunctionId: source.graphFunctionId,
    graphCallId: source.graphCallId,
    frameId: source.frameId,
    vectorIndex: source.vectorIndex,
    edge: source.edge,
    cCallRef: source.cCallRef,
    interactionSubjectRef: source.interactionSubjectRef,
    continuationRef: source.continuationRef,
    requestRef: source.requestRef,
    requestDigest: digest(source.requestDigest, "requestDigest"),
    responseContractRef: source.responseContractRef,
    eligibleOperationIds,
    resumeEligibleOperationIds,
    declaredChoiceRefs: Object.freeze([...source.declaredChoiceRefs]),
    requiredCapabilityRefs: Object.freeze([...source.requiredCapabilityRefs]),
    capabilityBasisDigest: digest(source.capabilityBasisDigest, "capabilityBasisDigest"),
    responseRef: response?.responseRef ?? null,
    responseDigest: response === null ? null : digest(response.responseDigest, "responseDigest"),
    responseOperationId,
    responseActorRef: response?.actorRef ?? null,
    responseValue: response?.value ?? null,
    responseChoiceRef: response?.choiceRef ?? null,
    resumeRef: resume?.resumeRef ?? null,
    evidenceRefs: Object.freeze([...(response?.evidenceRefs ?? [])]),
    capabilityProvenanceRefs: Object.freeze([...(response?.capabilityProvenanceRefs ?? [])]),
    eventRefs: Object.freeze(relevantEvents.map((event) => event.eventId)),
    replayRefs: Object.freeze(relevantEvents.map((event) => event.eventId))
  });
}

export function projectFhInteractionForGraphCall(
  events: readonly CanonicalRuntimeEvent[],
  graphCallId: string
): FhInteractionProjection | null {
  const refs = [
    ...new Set(
      events.flatMap((event) =>
        event.kind === "fh_interaction_opened" && event.graphCallId === graphCallId
          ? [event.interactionRef]
          : []
      )
    )
  ];
  if (refs.length === 0) {
    return null;
  }
  if (refs.length !== 1 || refs[0] === undefined) {
    throw new FhInteractionAdmissionError("ambiguous_interaction", "GraphCall has multiple F_H interactions");
  }
  return projectFhInteraction(events, refs[0]);
}

export function submitFhInteractionResponse(
  input: SubmitFhInteractionResponseInput
): FhInteractionMutationResult {
  const priorEvents = Object.freeze([...input.priorEvents]);
  const projection = projectFhInteraction(priorEvents, input.interactionRef);
  if (projection === null) {
    throw new FhInteractionAdmissionError("unknown_interaction", "pending F_H interaction is unknown");
  }
  if (projection.interactionBasisDigest !== input.interactionBasisDigest) {
    throw new FhInteractionAdmissionError("stale_basis", "F_H interaction basis is stale");
  }
  if (!projection.eligibleOperationIds.includes(input.operationId)) {
    throw new FhInteractionAdmissionError("operation_not_declared", "F_H operation is not declared for this interaction");
  }
  if (projection.responseContractRef !== input.responseContractRef) {
    throw new FhInteractionAdmissionError("response_contract_mismatch", "F_H response contract differs from pending truth");
  }
  if (
    input.choiceRef !== null &&
    !projection.declaredChoiceRefs.includes(input.choiceRef)
  ) {
    throw new FhInteractionAdmissionError("choice_not_declared", "F_H choice is not declared for this interaction");
  }
  if (input.operationId === "abg.operation.fh.select" && input.choiceRef === null) {
    throw new FhInteractionAdmissionError("choice_not_declared", "F_H selection requires a declared choice ref");
  }
  if (!sameStringSet(projection.requiredCapabilityRefs, input.capabilityRefs)) {
    throw new FhInteractionAdmissionError("capability_mismatch", "F_H capability set differs from pending truth");
  }
  if (input.capabilityRefs.length > 0 && input.capabilityProvenanceRefs.length === 0) {
    throw new FhInteractionAdmissionError("capability_provenance_missing", "F_H capability provenance is required");
  }
  if (input.evidenceRefs.length === 0) {
    throw new FhInteractionAdmissionError("evidence_missing", "F_H response evidence is required");
  }
  const value = admitIJsonValue(input.value, "FhInteractionResponse.value");
  const basis = responseBasis({
    interactionRef: projection.interactionRef,
    interactionBasisDigest: projection.interactionBasisDigest,
    continuationRef: projection.continuationRef,
    operationId: input.operationId,
    invocationId: nonEmpty(input.invocationId, "invocationId"),
    requestId: nonEmpty(input.requestId, "requestId"),
    actorRef: nonEmpty(input.actorRef, "actorRef"),
    responseContractRef: input.responseContractRef,
    choiceRef: input.choiceRef,
    value,
    evidenceRefs: uniqueStrings(input.evidenceRefs, "evidenceRefs"),
    capabilityRefs: uniqueStrings(input.capabilityRefs, "capabilityRefs"),
    capabilityProvenanceRefs: uniqueStrings(input.capabilityProvenanceRefs, "capabilityProvenanceRefs")
  });
  const responseDigest = stableSha256Digest(basis);
  const responseRef = `abg://fh-response/${responseDigest.slice("sha256:".length)}`;
  if (projection.responseRef !== null) {
    const existing = priorEvents.find(
      (event): event is CanonicalRuntimeEvent & FhInteractionRespondedEvent =>
        event.kind === "fh_interaction_responded" && event.responseRef === projection.responseRef
    );
    if (existing !== undefined && existing.responseDigest === responseDigest) {
      return Object.freeze({ projection, event: existing, replayed: true });
    }
    throw new FhInteractionAdmissionError("interaction_not_pending", "F_H interaction already has a different response");
  }
  const openedEventRef = projection.eventRefs[0];
  if (openedEventRef === undefined) {
    throw new FhInteractionAdmissionError("replay_invalid", "pending interaction has no opened event");
  }
  const eventInput: FhInteractionRespondedEvent = Object.freeze({
    kind: "fh_interaction_responded",
    basisId: projection.basisId,
    graphCallId: projection.graphCallId,
    interactionRef: projection.interactionRef,
    interactionBasisDigest: projection.interactionBasisDigest,
    continuationRef: projection.continuationRef,
    responseRef,
    responseDigest,
    operationId: input.operationId,
    invocationId: input.invocationId,
    requestId: input.requestId,
    actorRef: input.actorRef,
    responseContractRef: input.responseContractRef,
    choiceRef: input.choiceRef,
    value,
    evidenceRefs: Object.freeze([...input.evidenceRefs]),
    capabilityRefs: Object.freeze([...input.capabilityRefs]),
    capabilityProvenanceRefs: Object.freeze([...input.capabilityProvenanceRefs]),
    causationEventRefs: Object.freeze([openedEventRef]),
    correlationId: nonEmpty(input.correlationId, "correlationId")
  });
  requireKnownCausation(priorEvents, eventInput.causationEventRefs);
  const event = emittedOne(
    emitWithContext(
      createSeededLiveEmitterContext(priorEvents),
      eventInput,
      input.eventSink
    )
  );
  if (event.kind !== "fh_interaction_responded") {
    throw new FhInteractionAdmissionError("replay_invalid", "runtime emitted the wrong response event");
  }
  const combined = Object.freeze([...priorEvents, event]);
  const next = projectFhInteraction(combined, input.interactionRef);
  if (next === null) {
    throw new FhInteractionAdmissionError("replay_invalid", "admitted response did not project");
  }
  return Object.freeze({ projection: next, event, replayed: false });
}

export function admitFhInteractionResume(
  input: AdmitFhInteractionResumeInput
): FhInteractionMutationResult {
  const priorEvents = Object.freeze([...input.priorEvents]);
  const projection = projectFhInteraction(priorEvents, input.interactionRef);
  if (projection === null) {
    throw new FhInteractionAdmissionError("unknown_interaction", "F_H interaction is unknown");
  }
  if (projection.interactionBasisDigest !== input.interactionBasisDigest) {
    throw new FhInteractionAdmissionError("stale_basis", "F_H interaction basis is stale");
  }
  if (projection.responseRef === null || projection.responseDigest === null || projection.responseOperationId === null) {
    throw new FhInteractionAdmissionError("response_mismatch", "F_H interaction has no admitted response");
  }
  if (projection.responseRef !== input.responseRef) {
    throw new FhInteractionAdmissionError("response_mismatch", "F_H response identity differs from replay truth");
  }
  if (projection.continuationRef !== input.continuationRef) {
    throw new FhInteractionAdmissionError("continuation_mismatch", "F_H continuation identity differs from replay truth");
  }
  if (!projection.resumeEligibleOperationIds.includes(projection.responseOperationId)) {
    throw new FhInteractionAdmissionError("response_not_resume_eligible", "F_H response operation is not resume-eligible");
  }
  const basis = resumeBasis({
    interactionRef: projection.interactionRef,
    interactionBasisDigest: projection.interactionBasisDigest,
    continuationRef: projection.continuationRef,
    responseDigest: projection.responseDigest,
    responseRef: input.responseRef,
    invocationId: nonEmpty(input.invocationId, "invocationId"),
    requestId: nonEmpty(input.requestId, "requestId"),
    actorRef: nonEmpty(input.actorRef, "actorRef")
  });
  const resumeDigest = stableSha256Digest(basis);
  const resumeRef = `abg://fh-resume/${resumeDigest.slice("sha256:".length)}`;
  if (projection.resumeRef !== null) {
    const existing = priorEvents.find(
      (event): event is CanonicalRuntimeEvent & FhInteractionResumeAdmittedEvent =>
        event.kind === "fh_interaction_resume_admitted" && event.resumeRef === projection.resumeRef
    );
    if (existing !== undefined && existing.resumeDigest === resumeDigest) {
      return Object.freeze({ projection, event: existing, replayed: true });
    }
    throw new FhInteractionAdmissionError("interaction_not_pending", "F_H continuation already has a different resume admission");
  }
  const responseEventRef = projection.eventRefs.at(-1);
  if (responseEventRef === undefined) {
    throw new FhInteractionAdmissionError("replay_invalid", "responded interaction has no response event");
  }
  const eventInput: FhInteractionResumeAdmittedEvent = Object.freeze({
    kind: "fh_interaction_resume_admitted",
    basisId: projection.basisId,
    graphCallId: projection.graphCallId,
    interactionRef: projection.interactionRef,
    interactionBasisDigest: projection.interactionBasisDigest,
    continuationRef: projection.continuationRef,
    responseRef: projection.responseRef,
    responseDigest: projection.responseDigest,
    resumeRef,
    resumeDigest,
    invocationId: input.invocationId,
    requestId: input.requestId,
    actorRef: input.actorRef,
    causationEventRefs: Object.freeze([responseEventRef]),
    correlationId: nonEmpty(input.correlationId, "correlationId")
  });
  requireKnownCausation(priorEvents, eventInput.causationEventRefs);
  const event = emittedOne(
    emitWithContext(
      createSeededLiveEmitterContext(priorEvents),
      eventInput,
      input.eventSink
    )
  );
  if (event.kind !== "fh_interaction_resume_admitted") {
    throw new FhInteractionAdmissionError("replay_invalid", "runtime emitted the wrong resume event");
  }
  const combined = Object.freeze([...priorEvents, event]);
  const next = projectFhInteraction(combined, input.interactionRef);
  if (next === null) {
    throw new FhInteractionAdmissionError("replay_invalid", "admitted resume did not project");
  }
  return Object.freeze({ projection: next, event, replayed: false });
}
