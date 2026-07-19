import type {
  CanonicalRuntimeEvent
} from "../../../abg/m03/contracts/carriers.js";
import {
  assertCanonicalRuntimeEventSequence
} from "../../../abg/m03/contracts/event_admission.js";
import {
  admitResultArtifact,
  type ResultArtifact
} from "../../../abg/m03/transport/index.js";
import {
  stableJsonEquals
} from "../../../shared/runtime_identity.js";
import type { ReplayBoundPublicResultAssessmentRequest } from "./carriers.js";

const REPLAY_ADMITTED_RESULT_ASSESSMENT_EVIDENCE: unique symbol = Symbol(
  "replay-admitted-result-assessment-evidence"
);
const ADMITTED_EVIDENCE_AUTHORITIES = new WeakSet<object>();

type ActorStartedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "actor_invocation_started" }
>;
type ActorArtifactEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "actor_result_artifact_observed" }
>;
type InstructionResponseEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "instruction_response_contract_admitted" }
>;
type BasisAdmittedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "basis_admitted" }
>;
type CCallFibreSelectedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "c_call_fibre_selected" }
>;
type CCallEvidencedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "c_call_evidenced" }
>;
type AuthoritySnapshotEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "authority_snapshot_admitted" }
>;
type EvidenceAdmittedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "evidence_admitted" }
>;

export interface ReplayAdmittedResultAssessmentEvidenceRow {
  readonly obligationId: string;
  readonly claimedEvidenceRefs: readonly string[];
  readonly evidenceEventRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
}

export interface ReplayAdmittedResultAssessmentEvidenceAuthority {
  readonly kind: "replay_admitted_result_assessment_evidence_authority";
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly runtimeResultRef: string;
  readonly runtimeResultDigest: `sha256:${string}`;
  readonly artifact: ResultArtifact;
  readonly artifactEventRef: string;
  readonly responseAdmissionEventRef: string;
  readonly publishedLedgerRef: string;
  readonly programRef: string;
  readonly manifestRef: string;
  readonly promptDigest: string;
  readonly workerId: string;
  readonly backendId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly resolvedRuntimeRef: string;
  readonly rows: readonly ReplayAdmittedResultAssessmentEvidenceRow[];
  readonly evidenceEventRefs: readonly string[];
  readonly causationEventRefs: readonly string[];
  readonly [REPLAY_ADMITTED_RESULT_ASSESSMENT_EVIDENCE]: true;
}

function sameAssessmentRuntimeLocus(
  event: {
    readonly basisId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly vectorIndex: number;
    readonly edge: string;
  },
  request: ReplayBoundPublicResultAssessmentRequest
): boolean {
  const subject = request.runtimeResultRelation.subject;
  return event.basisId === subject.basisId &&
    event.graphCallId === subject.graphCallId &&
    event.frameId === subject.frameId &&
    event.vectorIndex === subject.vectorIndex &&
    event.edge === subject.edge;
}

function sameStringSet(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return left.length === right.length &&
    new Set(left).size === left.length &&
    new Set(right).size === right.length &&
    left.every((value) => right.includes(value));
}

function exactOne<T>(rows: readonly T[], message: string): T {
  const row = rows[0];
  if (rows.length !== 1 || row === undefined) {
    throw new TypeError(message);
  }
  return row;
}

function eventByRef<K extends CanonicalRuntimeEvent["kind"]>(input: {
  readonly events: readonly CanonicalRuntimeEvent[];
  readonly eventRef: string;
  readonly kind: K;
  readonly message: string;
}): Extract<CanonicalRuntimeEvent, { readonly kind: K }> {
  const rows = input.events.filter(
    (event): event is Extract<CanonicalRuntimeEvent, { readonly kind: K }> =>
      event.eventId === input.eventRef && event.kind === input.kind
  );
  return exactOne(rows, input.message);
}

export function admitReplayResultAssessmentEvidenceAuthority(input: {
  readonly events: readonly CanonicalRuntimeEvent[];
  readonly request: ReplayBoundPublicResultAssessmentRequest;
  readonly declaredEvidenceRefs: readonly string[];
}): ReplayAdmittedResultAssessmentEvidenceAuthority {
  assertCanonicalRuntimeEventSequence(
    input.events,
    "ResultAssessmentEvidenceAuthority.events"
  );
  const relation = input.request.runtimeResultRelation;
  const subject = relation.subject;
  const observed = eventByRef({
    events: input.events,
    eventRef: relation.targetAdmission.observedEventRef,
    kind: "payload_observed",
    message: "result assessment requires one exact target observation"
  });
  if (observed.actorInvocationId === null) {
    throw new TypeError(
      "result assessment evidence requires one actor-attributed target observation"
    );
  }
  const targetAuthority = exactOne(
    input.events.filter(
      (event): event is AuthoritySnapshotEvent =>
        event.kind === "authority_snapshot_admitted" &&
        event.eventAdmissionOrdinal < observed.eventAdmissionOrdinal &&
        sameAssessmentRuntimeLocus(event, input.request) &&
        event.authoritySnapshotRef === observed.authorityRef &&
        event.inputDigest === observed.inputDigest &&
        event.closureCapable &&
        !event.contradictoryAuthority &&
        event.deferredAuthorityRefs.length === 0 &&
        event.authorityRefs.length > 0 &&
        new Set(event.authorityRefs).size === event.authorityRefs.length
    ),
    "result assessment requires one exact target authority snapshot"
  );
  const started = exactOne(
    input.events.filter(
      (event): event is ActorStartedEvent =>
        event.kind === "actor_invocation_started" &&
        event.eventAdmissionOrdinal < observed.eventAdmissionOrdinal &&
        sameAssessmentRuntimeLocus(event, input.request) &&
        event.actorInvocationId === observed.actorInvocationId
    ),
    "result assessment requires one same-C-call actor invocation start"
  );
  const artifactEvent = exactOne(
    input.events.filter(
      (event): event is ActorArtifactEvent =>
        event.kind === "actor_result_artifact_observed" &&
        event.eventAdmissionOrdinal > started.eventAdmissionOrdinal &&
        event.eventAdmissionOrdinal < observed.eventAdmissionOrdinal &&
        sameAssessmentRuntimeLocus(event, input.request) &&
        event.actorInvocationId === started.actorInvocationId &&
        event.resultRef === started.resultRef &&
        event.artifactRef === started.resultRef &&
        event.causationEventRefs.includes(relation.cCall.ref)
    ),
    "result assessment artifact does not resolve to one same-C-call replay event"
  );
  if (
    artifactEvent.artifactPayload === undefined ||
    artifactEvent.artifactPayload === null ||
    artifactEvent.artifactContentDigest === null
  ) {
    throw new TypeError(
      "result assessment requires the exact replay-carried result artifact body"
    );
  }
  if (!stableJsonEquals(input.request.assessmentValue, artifactEvent.artifactPayload)) {
    throw new TypeError(
      "result assessment value differs from the replay-carried T-257 artifact"
    );
  }
  const artifact = admitResultArtifact(
    {
      basisId: subject.basisId,
      dispatchRef: started.dispatchRef,
      resultRef: started.resultRef,
      selectedResultContractRef: input.request.assessmentContract.ref,
      expectedEdge: subject.edge,
      expectedAssessmentIds: targetAuthority.authorityRefs
    },
    artifactEvent.artifactPayload,
    "ReplayResultAssessment.artifactPayload"
  );
  if (
    artifact.runtimeFailure !== null ||
    artifact.identityIssues.length !== 0 ||
    artifact.artifactPayload === null ||
    artifact.resultContractRef !== input.request.assessmentContract.ref
  ) {
    throw new TypeError(
      "result assessment requires one admitted T-257 F_P result artifact"
    );
  }
  const response = exactOne(
    input.events.filter(
      (event): event is InstructionResponseEvent =>
        event.kind === "instruction_response_contract_admitted" &&
        event.eventAdmissionOrdinal > artifactEvent.eventAdmissionOrdinal &&
        event.eventAdmissionOrdinal < observed.eventAdmissionOrdinal &&
        sameAssessmentRuntimeLocus(event, input.request) &&
        event.actorInvocationId === artifactEvent.actorInvocationId &&
        event.resultRef === artifactEvent.resultRef &&
        event.artifactRef === artifactEvent.artifactRef &&
        event.artifactContentDigest === artifactEvent.artifactContentDigest &&
        event.outputContractRefs.includes(input.request.assessmentContract.ref)
    ),
    "result assessment artifact lacks its same-C-call instruction response admission"
  );
  exactOne(
    input.events.filter(
      (event) =>
        event.kind === "actor_invocation_closed" &&
        event.eventAdmissionOrdinal > response.eventAdmissionOrdinal &&
        event.eventAdmissionOrdinal < observed.eventAdmissionOrdinal &&
        sameAssessmentRuntimeLocus(event, input.request) &&
        event.actorInvocationId === artifactEvent.actorInvocationId &&
        event.resultRef === artifactEvent.resultRef &&
        event.closureStatus === "completed"
    ),
    "result assessment artifact lacks one completed same-C-call actor invocation"
  );
  const basis = exactOne(
    input.events.filter(
      (event): event is BasisAdmittedEvent =>
        event.kind === "basis_admitted" &&
        event.eventAdmissionOrdinal < started.eventAdmissionOrdinal &&
        event.basisId === subject.basisId &&
        event.graphFunctionId === started.graphFunctionId
    ),
    "result assessment requires one exact admitted execution basis"
  );
  const fibre = eventByRef({
    events: input.events,
    eventRef: relation.cCall.fibreSelectedEventRef,
    kind: "c_call_fibre_selected",
    message: "result assessment requires one exact selected C-call fibre"
  }) satisfies CCallFibreSelectedEvent;
  const ledger = eventByRef({
    events: input.events,
    eventRef: relation.cCall.evidencedEventRef,
    kind: "c_call_evidenced",
    message: "result assessment requires one exact C-call evidence seal"
  }) satisfies CCallEvidencedEvent;

  const targetEvidence = relation.targetAdmission.evidenceEventRefs.map(
    (eventRef) => eventByRef({
      events: input.events,
      eventRef,
      kind: "evidence_admitted",
      message: "result assessment target relation lost its admitted evidence"
    }) satisfies EvidenceAdmittedEvent
  );
  const rows: ReplayAdmittedResultAssessmentEvidenceRow[] = [];
  for (const assessment of artifact.artifactPayload.fulfillmentAssessments) {
    if (
      assessment.evidenceRefs.length === 0 ||
      new Set(assessment.evidenceRefs).size !== assessment.evidenceRefs.length ||
      !targetAuthority.authorityRefs.includes(assessment.id)
    ) {
      throw new TypeError(
        `result assessment obligation ${JSON.stringify(assessment.id)} lacks exact replay authority`
      );
    }
    const evidenceRows = targetEvidence.filter(
      (event) =>
        event.authorityRef === targetAuthority.authoritySnapshotRef &&
        event.authorityDigest === targetAuthority.authorityDigest &&
        event.inputDigest === targetAuthority.inputDigest &&
        event.complete &&
        !event.shallow &&
        !event.contradictsAuthority &&
        !event.deferred
    );
    if (evidenceRows.length === 0) {
      throw new TypeError(
        `result assessment obligation ${JSON.stringify(assessment.id)} lacks target-admission evidence`
      );
    }
    rows.push(Object.freeze({
      obligationId: assessment.id,
      claimedEvidenceRefs: Object.freeze([...assessment.evidenceRefs]),
      evidenceEventRefs: Object.freeze(evidenceRows.map((event) => event.eventId)),
      causationEventRefs: Object.freeze([
        started.eventId,
        artifactEvent.eventId,
        response.eventId,
        relation.cCall.openedEventRef,
        relation.targetAdmission.observedEventRef,
        relation.targetAdmission.validatedEventRef,
        ...evidenceRows.map((event) => event.eventId),
        relation.cCall.resultAdmittedEventRef,
        relation.cCall.judgedEventRef
      ])
    }));
  }

  const semanticEvidenceRefs = Object.freeze([
    ...new Set(rows.flatMap((row) => row.claimedEvidenceRefs))
  ]);
  if (!sameStringSet(input.declaredEvidenceRefs, semanticEvidenceRefs)) {
    throw new TypeError(
      "result assessment declared evidence refs differ from the replay-carried F_P evidence"
    );
  }
  const evidenceEventRefs = Object.freeze([
    ...new Set(rows.flatMap((row) => row.evidenceEventRefs))
  ]);
  const authority = Object.freeze({
    kind: "replay_admitted_result_assessment_evidence_authority" as const,
    basisId: subject.basisId,
    graphCallId: subject.graphCallId,
    frameId: subject.frameId,
    vectorIndex: subject.vectorIndex,
    runtimeResultRef: subject.runtimeResult.ref,
    runtimeResultDigest: subject.runtimeResult.digest,
    artifact,
    artifactEventRef: artifactEvent.eventId,
    responseAdmissionEventRef: response.eventId,
    publishedLedgerRef: ledger.eventId,
    programRef: fibre.programRef,
    manifestRef: response.manifestRef,
    promptDigest: response.promptDigest,
    workerId: artifactEvent.workerId,
    backendId: artifactEvent.backendId,
    runId: artifactEvent.runId,
    workKey: artifactEvent.workKey,
    resolvedRuntimeRef: basis.resolvedRuntimeRef,
    rows: Object.freeze(rows),
    evidenceEventRefs,
    causationEventRefs: Object.freeze([
      started.eventId,
      artifactEvent.eventId,
      response.eventId,
      ...new Set(rows.flatMap((row) => row.causationEventRefs))
    ]),
    [REPLAY_ADMITTED_RESULT_ASSESSMENT_EVIDENCE]: true as const
  });
  ADMITTED_EVIDENCE_AUTHORITIES.add(authority);
  return authority;
}

export function assertReplayResultAssessmentEvidenceAuthority(input: {
  readonly request: ReplayBoundPublicResultAssessmentRequest;
  readonly authority: ReplayAdmittedResultAssessmentEvidenceAuthority;
}): void {
  const authority = input.authority;
  const request = input.request;
  const subject = request.runtimeResultRelation.subject;
  if (!ADMITTED_EVIDENCE_AUTHORITIES.has(authority)) {
    throw new TypeError(
      "result assessment requires nominal replay-admitted evidence authority"
    );
  }
  if (
    authority.basisId !== subject.basisId ||
    authority.graphCallId !== subject.graphCallId ||
    authority.frameId !== subject.frameId ||
    authority.vectorIndex !== subject.vectorIndex ||
    authority.runtimeResultRef !== subject.runtimeResult.ref ||
    authority.runtimeResultDigest !== subject.runtimeResult.digest ||
    authority.artifact.resultContractRef !== request.assessmentContract.ref ||
    authority.artifact.artifactPayload === null
  ) {
    throw new TypeError(
      "result assessment evidence authority differs from the exact runtime result"
    );
  }
  for (const assessment of authority.artifact.artifactPayload.fulfillmentAssessments) {
    const rows = authority.rows.filter(
      (row) => row.obligationId === assessment.id
    );
    if (
      rows.length !== 1 ||
      rows[0] === undefined ||
      !sameStringSet(rows[0].claimedEvidenceRefs, assessment.evidenceRefs) ||
      rows[0].evidenceEventRefs.length === 0
    ) {
      throw new TypeError(
        `result assessment evidence authority is incomplete for obligation ${JSON.stringify(assessment.id)}`
      );
    }
  }
}
