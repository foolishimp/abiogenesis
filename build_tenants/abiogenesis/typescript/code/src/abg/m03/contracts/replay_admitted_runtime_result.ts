// Implements: REQ-P-POLICY-034
// Implements: REQ-R-ABG3-CCALL-001..008, REQ-R-ABG3-PAYLOAD-001..008

import type { CanonicalRuntimeEvent } from "./carriers.js";
import { assertCanonicalRuntimeEventSequence } from "./event_admission.js";

type Sha256Digest = `sha256:${string}`;
type PayloadObservedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "payload_observed" }
>;
type PayloadValidatedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "payload_validated" }
>;
type EvidenceAdmittedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "evidence_admitted" }
>;
type AuthoritySnapshotAdmittedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "authority_snapshot_admitted" }
>;
type CCallOpenedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "c_call_opened" }
>;
type CCallFibreSelectedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "c_call_fibre_selected" }
>;
type CCallEvidencedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "c_call_evidenced" }
>;
type CCallResultAdmittedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "c_call_result_admitted" }
>;
type CCallJudgedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "c_call_judged" }
>;
type VectorTraversalPlannedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "vector_traversal_planned" }
>;
type VectorClosedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "vector_closed" }
>;

export type ReplayAdmittedRuntimeResultRelationFailureCode =
  | "not_ready"
  | "ambiguous";

export class ReplayAdmittedRuntimeResultRelationError extends TypeError {
  public readonly code: ReplayAdmittedRuntimeResultRelationFailureCode;

  public constructor(
    code: ReplayAdmittedRuntimeResultRelationFailureCode,
    message: string
  ) {
    super(message);
    this.name = "ReplayAdmittedRuntimeResultRelationError";
    this.code = code;
  }
}

export interface ReplayAdmittedRuntimeResultSubject {
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly runtimeResult: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }>;
}

export interface ReplayAdmittedRuntimeResultRelation {
  readonly kind: "replay_admitted_runtime_result_relation";
  readonly subject: ReplayAdmittedRuntimeResultSubject;
  readonly targetContract: Readonly<{
    readonly ref: string;
    readonly digest: Sha256Digest;
  }>;
  readonly cCall: Readonly<{
    readonly ref: string;
    readonly openedEventRef: string;
    readonly fibreSelectedEventRef: string;
    readonly regime: "F_D" | "F_P" | "F_H";
    readonly evidencedEventRef: string;
    readonly resultAdmittedEventRef: string;
    readonly judgedEventRef: string;
  }>;
  readonly targetAdmission: Readonly<{
    readonly observedEventRef: string;
    readonly validatedEventRef: string;
    readonly evidenceEventRefs: readonly string[];
    readonly vectorPlannedEventRef: string;
    readonly vectorClosedEventRef: string;
  }>;
}

interface CandidateEvents {
  readonly observed: PayloadObservedEvent & Readonly<{
    readonly digest: Sha256Digest;
    readonly contractRef: string;
  }>;
  readonly validated: PayloadValidatedEvent & Readonly<{
    readonly contractRef: string;
    readonly contractDigest: Sha256Digest;
  }>;
  readonly authoritySnapshot: AuthoritySnapshotAdmittedEvent;
  readonly evidence: readonly EvidenceAdmittedEvent[];
  readonly cCallOpened: CCallOpenedEvent;
  readonly cCallFibreSelected: CCallFibreSelectedEvent;
  readonly cCallEvidenced: CCallEvidencedEvent;
  readonly cCallResult: CCallResultAdmittedEvent;
  readonly cCallJudged: CCallJudgedEvent;
  readonly vectorPlanned: VectorTraversalPlannedEvent;
  readonly vectorClosed: VectorClosedEvent;
}

function isSha256Digest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/u.test(value);
}

function hasPublishedObservedCoordinate(
  event: PayloadObservedEvent
): event is CandidateEvents["observed"] {
  return event.contractRef !== null && isSha256Digest(event.digest);
}

function hasPublishedValidationCoordinate(
  event: PayloadValidatedEvent
): event is CandidateEvents["validated"] {
  return event.contractRef !== null && isSha256Digest(event.contractDigest);
}

function exactOne<T>(rows: readonly T[]): T | null {
  return rows.length === 1 ? rows[0] ?? null : null;
}

function relationCandidate(
  events: readonly CanonicalRuntimeEvent[],
  observed: CandidateEvents["observed"]
): CandidateEvents | null {
  const cCallOpened = exactOne(events.filter(
    (event): event is CCallOpenedEvent =>
      event.kind === "c_call_opened" &&
      event.cCallRef === observed.sourceEventRef &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === observed.edge &&
      event.eventAdmissionOrdinal < observed.eventAdmissionOrdinal
  ));
  if (cCallOpened === null) return null;

  const cCallFibreSelected = exactOne(events.filter(
    (event): event is CCallFibreSelectedEvent =>
      event.kind === "c_call_fibre_selected" &&
      event.cCallRef === cCallOpened.cCallRef &&
      event.basisId === cCallOpened.basisId &&
      event.eventAdmissionOrdinal > cCallOpened.eventAdmissionOrdinal &&
      event.eventAdmissionOrdinal < observed.eventAdmissionOrdinal
  ));
  if (cCallFibreSelected === null) return null;

  const vectorPlanned = exactOne(events.filter(
    (event): event is VectorTraversalPlannedEvent =>
      event.kind === "vector_traversal_planned" &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === observed.edge &&
      event.eventAdmissionOrdinal < cCallOpened.eventAdmissionOrdinal
  ));
  if (vectorPlanned === null) return null;

  const cCallResult = exactOne(events.filter(
    (event): event is CCallResultAdmittedEvent =>
      event.kind === "c_call_result_admitted" &&
      event.cCallRef === cCallOpened.cCallRef &&
      event.basisId === cCallOpened.basisId &&
      event.eventAdmissionOrdinal > observed.eventAdmissionOrdinal &&
      event.outcomeStatus === "completed" &&
      event.payloadRef === observed.payloadRef &&
      event.responseContractRef === observed.contractRef
  ));
  if (cCallResult === null) return null;

  const cCallEvidenced = exactOne(events.filter(
    (event): event is CCallEvidencedEvent =>
      event.kind === "c_call_evidenced" &&
      event.cCallRef === cCallOpened.cCallRef &&
      event.basisId === cCallOpened.basisId &&
      event.eventAdmissionOrdinal > observed.eventAdmissionOrdinal &&
      event.eventAdmissionOrdinal < cCallResult.eventAdmissionOrdinal &&
      event.evidenceRefs.length > 0 &&
      new Set(event.evidenceRefs).size === event.evidenceRefs.length
  ));
  if (cCallEvidenced === null) return null;

  const validated = exactOne(events.filter(
    (event): event is CandidateEvents["validated"] =>
      event.kind === "payload_validated" &&
      hasPublishedValidationCoordinate(event) &&
      event.eventAdmissionOrdinal > observed.eventAdmissionOrdinal &&
      event.eventAdmissionOrdinal < cCallEvidenced.eventAdmissionOrdinal &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === observed.edge &&
      event.payloadRef === observed.payloadRef &&
      event.digest === observed.digest &&
      event.contractRef === observed.contractRef &&
      cCallEvidenced.evidenceRefs.includes(event.validationRef)
  ));
  if (validated === null) return null;

  const authoritySnapshot = exactOne(events.filter(
    (event): event is AuthoritySnapshotAdmittedEvent =>
      event.kind === "authority_snapshot_admitted" &&
      event.eventAdmissionOrdinal < observed.eventAdmissionOrdinal &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === observed.edge &&
      event.authoritySnapshotRef === observed.authorityRef &&
      event.closureCapable &&
      !event.contradictoryAuthority &&
      event.deferredAuthorityRefs.length === 0 &&
      event.providerRefs.length > 0 &&
      event.inputDigest === observed.inputDigest
  ));
  if (authoritySnapshot === null) return null;

  const evidence = events.filter(
    (event): event is EvidenceAdmittedEvent =>
      event.kind === "evidence_admitted" &&
      event.eventAdmissionOrdinal > validated.eventAdmissionOrdinal &&
      event.eventAdmissionOrdinal < cCallEvidenced.eventAdmissionOrdinal &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === observed.edge &&
      event.payloadRef === observed.payloadRef &&
      cCallEvidenced.evidenceRefs.includes(event.evidenceRef) &&
      event.authorityRef === authoritySnapshot.authoritySnapshotRef &&
      event.authorityDigest === authoritySnapshot.authorityDigest &&
      event.inputDigest === authoritySnapshot.inputDigest &&
      event.providerRefs.length > 0 &&
      event.providerRefs.every((providerRef) =>
        authoritySnapshot.providerRefs.includes(providerRef)
      ) &&
      event.complete &&
      !event.shallow &&
      !event.contradictsAuthority &&
      !event.deferred
  );
  if (
    evidence.length === 0 ||
    new Set(evidence.map((event) => event.evidenceRef)).size !== evidence.length
  ) {
    return null;
  }
  const boundEvidenceRefs = new Set([
    authoritySnapshot.authoritySnapshotRef,
    validated.validationRef,
    ...evidence.map((event) => event.evidenceRef)
  ]);
  if (
    boundEvidenceRefs.size !== cCallEvidenced.evidenceRefs.length ||
    cCallEvidenced.evidenceRefs.some((evidenceRef) =>
      !boundEvidenceRefs.has(evidenceRef)
    )
  ) {
    return null;
  }

  const cCallJudged = exactOne(events.filter(
    (event): event is CCallJudgedEvent =>
      event.kind === "c_call_judged" &&
      event.cCallRef === cCallOpened.cCallRef &&
      event.basisId === cCallOpened.basisId &&
      event.eventAdmissionOrdinal > cCallResult.eventAdmissionOrdinal &&
      event.judgment === "advance"
  ));
  if (cCallJudged === null) return null;

  const vectorClosed = exactOne(events.filter(
    (event): event is VectorClosedEvent =>
      event.kind === "vector_closed" &&
      event.eventAdmissionOrdinal > cCallJudged.eventAdmissionOrdinal &&
      event.basisId === observed.basisId &&
      event.graphCallId === observed.graphCallId &&
      event.frameId === observed.frameId &&
      event.vectorIndex === observed.vectorIndex &&
      event.edge === observed.edge
  ));
  if (vectorClosed === null) return null;

  return Object.freeze({
    observed,
    validated,
    authoritySnapshot,
    evidence: Object.freeze(evidence),
    cCallOpened,
    cCallFibreSelected,
    cCallEvidenced,
    cCallResult,
    cCallJudged,
    vectorPlanned,
    vectorClosed
  });
}

/**
 * Derives the one replay-owned runtime result identity admitted by T-271.
 * Callers may narrow the relation, but may not author or remint its subject.
 */
export function deriveReplayAdmittedRuntimeResultRelation(input: {
  readonly events: readonly CanonicalRuntimeEvent[];
  readonly graphCallId?: string;
  readonly runtimeResultRef?: string;
  readonly runtimeResultDigest?: string;
}): ReplayAdmittedRuntimeResultRelation {
  assertCanonicalRuntimeEventSequence(
    input.events,
    "ReplayAdmittedRuntimeResultRelation.events"
  );
  if (
    input.graphCallId === undefined &&
    (input.runtimeResultRef === undefined ||
      input.runtimeResultDigest === undefined)
  ) {
    throw new TypeError(
      "runtime result relation requires a graph call or exact result coordinate"
    );
  }

  const candidates = input.events.flatMap((event): CandidateEvents[] => {
    if (
      event.kind !== "payload_observed" ||
      !hasPublishedObservedCoordinate(event) ||
      (input.graphCallId !== undefined &&
        event.graphCallId !== input.graphCallId) ||
      (input.runtimeResultRef !== undefined &&
        event.payloadRef !== input.runtimeResultRef) ||
      (input.runtimeResultDigest !== undefined &&
        event.digest !== input.runtimeResultDigest)
    ) {
      return [];
    }
    const candidate = relationCandidate(input.events, event);
    return candidate === null ? [] : [candidate];
  });
  const candidate = candidates[0];
  if (candidates.length === 0 || candidate === undefined) {
    throw new ReplayAdmittedRuntimeResultRelationError(
      "not_ready",
      "runtime result is not fully admitted through the T-271 C-call relation"
    );
  }
  if (candidates.length !== 1) {
    throw new ReplayAdmittedRuntimeResultRelationError(
      "ambiguous",
      "replay contains multiple admitted runtime results for the requested coordinate"
    );
  }

  return Object.freeze({
    kind: "replay_admitted_runtime_result_relation" as const,
    subject: Object.freeze({
      basisId: candidate.observed.basisId,
      graphCallId: candidate.observed.graphCallId,
      frameId: candidate.observed.frameId,
      vectorIndex: candidate.observed.vectorIndex,
      edge: candidate.observed.edge,
      runtimeResult: Object.freeze({
        ref: candidate.observed.payloadRef,
        digest: candidate.observed.digest
      })
    }),
    targetContract: Object.freeze({
      ref: candidate.observed.contractRef,
      digest: candidate.validated.contractDigest
    }),
    cCall: Object.freeze({
      ref: candidate.cCallOpened.cCallRef,
      openedEventRef: candidate.cCallOpened.eventId,
      fibreSelectedEventRef: candidate.cCallFibreSelected.eventId,
      regime: candidate.cCallFibreSelected.regime,
      evidencedEventRef: candidate.cCallEvidenced.eventId,
      resultAdmittedEventRef: candidate.cCallResult.eventId,
      judgedEventRef: candidate.cCallJudged.eventId
    }),
    targetAdmission: Object.freeze({
      observedEventRef: candidate.observed.eventId,
      validatedEventRef: candidate.validated.eventId,
      evidenceEventRefs: Object.freeze(
        candidate.evidence.map((event) => event.eventId)
      ),
      vectorPlannedEventRef: candidate.vectorPlanned.eventId,
      vectorClosedEventRef: candidate.vectorClosed.eventId
    })
  });
}
