import type {
  AssessedRuntimeEvent,
  CanonicalRuntimeEvent
} from "../../../abg/m03/contracts/carriers.js";
import type {
  ResultArtifact,
  RuntimeFailureClass
} from "../../../abg/m03/transport/index.js";
import type {
  AssessmentManifestProvenance,
  AssessmentTraceRef,
  FulfillmentAssessmentRef,
  PublicResultAssessmentAccepted,
  PublicResultAssessmentOutcome,
  PublicResultAssessmentRejected,
  PublicResultAssessmentRequest,
  ReplayBoundPublicResultAssessmentRequest,
  PublishedLedgerRef
} from "./carriers.js";
import {
  admitIJsonValue,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import {
  assertReplayResultAssessmentEvidenceAuthority,
  type ReplayAdmittedResultAssessmentEvidenceAuthority
} from "./evidence_authority.js";

function freezeRuntimeEventKinds(
  values: readonly AssessedRuntimeEvent["kind"][]
): readonly AssessedRuntimeEvent["kind"][] {
  return Object.freeze([...values]);
}

export function constructAssessmentManifestProvenance(input: {
  readonly specHash: string;
  readonly manifestId: string;
  readonly workflowVersion: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly authorityRef: string | null;
  readonly selectedWorkerId: string | null;
  readonly selectedBackend: string | null;
  readonly roleId: string | null;
  readonly assignmentSource: string | null;
  readonly resolvedRuntimeRef: string | null;
}): AssessmentManifestProvenance {
  return Object.freeze({
    specHash: input.specHash,
    manifestId: input.manifestId,
    workflowVersion: input.workflowVersion,
    runId: input.runId,
    workKey: input.workKey,
    authorityRef: input.authorityRef,
    selectedWorkerId: input.selectedWorkerId,
    selectedBackend: input.selectedBackend,
    roleId: input.roleId,
    assignmentSource: input.assignmentSource,
    resolvedRuntimeRef: input.resolvedRuntimeRef
  });
}

export function constructPublishedLedgerRef(ref: string): PublishedLedgerRef {
  return Object.freeze({
    ref
  });
}

function constructFulfillmentAssessmentRef(
  obligationId: string
): FulfillmentAssessmentRef {
  return Object.freeze({
    obligationId
  });
}

export function deriveFulfillmentAssessmentRefs(
  artifact: ResultArtifact
): readonly FulfillmentAssessmentRef[] {
  if (artifact.artifactPayload === null) {
    return Object.freeze([]);
  }
  return Object.freeze(
    artifact.artifactPayload.fulfillmentAssessments.map((assessment) =>
      constructFulfillmentAssessmentRef(assessment.id)
    )
  );
}

export function constructPublicResultAssessmentRequest(input: {
  readonly dispatchRequest: PublicResultAssessmentRequest["dispatchRequest"];
  readonly artifact: PublicResultAssessmentRequest["artifact"];
  readonly assessmentContract: PublicResultAssessmentRequest["assessmentContract"];
  readonly manifestProvenance: AssessmentManifestProvenance;
  readonly publishedLedgerRef: PublishedLedgerRef;
  readonly fulfillmentRefs: readonly FulfillmentAssessmentRef[];
}): PublicResultAssessmentRequest {
  return Object.freeze({
    kind: "fp_assessed",
    dispatchRequest: input.dispatchRequest,
    artifact: input.artifact,
    assessmentContract: Object.freeze({ ...input.assessmentContract }),
    manifestProvenance: input.manifestProvenance,
    publishedLedgerRef: input.publishedLedgerRef,
    fulfillmentRefs: Object.freeze([...input.fulfillmentRefs])
  });
}

export function bindReplayBoundPublicResultAssessmentRequest(input: {
  readonly assessmentValue: unknown;
  readonly assessmentContract: ReplayBoundPublicResultAssessmentRequest["assessmentContract"];
  readonly runtimeResultRelation: ReplayBoundPublicResultAssessmentRequest["runtimeResultRelation"];
  readonly invocationAuthority: ReplayBoundPublicResultAssessmentRequest["invocationAuthority"];
}): ReplayBoundPublicResultAssessmentRequest {
  const attribution = input.invocationAuthority;
  if (input.runtimeResultRelation.cCall.regime !== "F_P") {
    throw new TypeError(
      "result assessment requires one replay-admitted F_P runtime result"
    );
  }
  if (
    input.assessmentContract.ref !==
      input.runtimeResultRelation.targetContract.ref ||
    input.assessmentContract.digest !==
      input.runtimeResultRelation.targetContract.digest
  ) {
    throw new TypeError(
      "result assessment contract differs from the replay-admitted target contract"
    );
  }
  if (
    attribution.capabilityGrantRefs.length === 0 ||
    new Set(attribution.capabilityGrantRefs).size !==
      attribution.capabilityGrantRefs.length
  ) {
    throw new TypeError(
      "result assessment invocation authority lacks exact capability grants"
    );
  }
  return Object.freeze({
    kind: "replay_bound_fp_assessment" as const,
    assessmentValue: admitIJsonValue(
      input.assessmentValue,
      "ReplayBoundPublicResultAssessmentRequest.assessmentValue"
    ),
    assessmentContract: Object.freeze({ ...input.assessmentContract }),
    runtimeResultRelation: input.runtimeResultRelation,
    invocationAuthority: Object.freeze({
      ...attribution,
      capabilityGrantRefs: Object.freeze([...attribution.capabilityGrantRefs])
    })
  });
}

function assertReplayBoundAssessmentRequest(
  request: ReplayBoundPublicResultAssessmentRequest
): void {
  if (
    request === null ||
    typeof request !== "object" ||
    request.kind !== "replay_bound_fp_assessment" ||
    request.assessmentValue === undefined ||
    request.assessmentContract === undefined ||
    request.runtimeResultRelation === undefined ||
    request.invocationAuthority === undefined
  ) {
    throw new TypeError(
      "result assessment requires one replay-bound semantic request"
    );
  }
}

export function resultAssessmentRef(
  request: ReplayBoundPublicResultAssessmentRequest,
  evidenceAuthority: ReplayAdmittedResultAssessmentEvidenceAuthority
): string {
  const digest = stableSha256Digest({
    kind: "result_assessment_identity",
    assessmentKind: request.kind,
    runtimeSubject: request.runtimeResultRelation.subject,
    assessmentContract: request.assessmentContract,
    assessmentValue: request.assessmentValue,
    actor: request.invocationAuthority.actorRef,
    invocationAuthorityRef: request.invocationAuthority.authoritySetRef,
    authorityBasisRef: request.invocationAuthority.authorityBasisRef,
    capabilityGrantRefs: request.invocationAuthority.capabilityGrantRefs,
    artifactEventRef: evidenceAuthority.artifactEventRef,
    responseAdmissionEventRef: evidenceAuthority.responseAdmissionEventRef,
    publishedLedgerRef: evidenceAuthority.publishedLedgerRef,
    obligationIds: evidenceAuthority.rows.map((entry) => entry.obligationId),
    evidenceEventRefs: evidenceAuthority.evidenceEventRefs
  });
  return `assessment:${digest.slice("sha256:".length)}`;
}

/** @internal */
export function resultAssessmentEvidenceGap(
  evidenceAuthority: ReplayAdmittedResultAssessmentEvidenceAuthority
): string | null {
  const payload = evidenceAuthority.artifact.artifactPayload;
  if (payload === null) {
    return null;
  }
  const missingObligationIds = payload.fulfillmentAssessments
    .filter((assessment) => assessment.evidenceRefs.length === 0)
    .map((assessment) => assessment.id);
  return missingObligationIds.length === 0
    ? null
    : `F_P result assessment requires admitted evidence refs for obligations: ${missingObligationIds.join(",")}`;
}

function constructAssessmentTraceRef(input: {
  readonly evidenceAuthority: ReplayAdmittedResultAssessmentEvidenceAuthority;
  readonly emitted: readonly AssessedRuntimeEvent[];
}): AssessmentTraceRef {
  return Object.freeze({
    workflowVersion: input.evidenceAuthority.programRef,
    runId: input.evidenceAuthority.runId,
    workKey: input.evidenceAuthority.workKey,
    emittedKinds: freezeRuntimeEventKinds(
      input.emitted.map((event) => event.kind)
    )
  });
}

export function constructAcceptedPublicResultAssessmentOutcome(input: {
  readonly request: ReplayBoundPublicResultAssessmentRequest;
  readonly evidenceAuthority: ReplayAdmittedResultAssessmentEvidenceAuthority;
  readonly emitted: readonly (CanonicalRuntimeEvent & AssessedRuntimeEvent)[];
}): PublicResultAssessmentAccepted {
  return Object.freeze({
    kind: "accepted",
    assessedCount: input.emitted.filter((event) => event.kind === "assessed").length,
    trace: constructAssessmentTraceRef(input)
  });
}

export function constructRejectedPublicResultAssessmentOutcome(input: {
  readonly ingestKind: "rejected" | "runtime_failure";
  readonly failureClass?: RuntimeFailureClass | null;
  readonly reason: string;
  readonly trace?: AssessmentTraceRef | null;
}): PublicResultAssessmentRejected {
  if (
    input.ingestKind === "runtime_failure" &&
    (input.failureClass === null || input.failureClass === undefined)
  ) {
    throw new TypeError(
      "runtime_failure result assessment requires failureClass"
    );
  }
  if (
    input.ingestKind === "rejected" &&
    input.failureClass !== undefined &&
    input.failureClass !== null
  ) {
    throw new TypeError("rejected result assessment must not carry failureClass");
  }
  return Object.freeze({
    kind: "rejected",
    ingestKind: input.ingestKind,
    failureClass: input.failureClass ?? null,
    reason: input.reason,
    trace: input.trace ?? null
  });
}

export function constructRuntimeEventsForResultAssessment(
  request: ReplayBoundPublicResultAssessmentRequest,
  evidenceAuthority: ReplayAdmittedResultAssessmentEvidenceAuthority
): readonly AssessedRuntimeEvent[] {
  assertReplayBoundAssessmentRequest(request);
  if (evidenceAuthority.artifact.artifactPayload === null) {
    return Object.freeze([]);
  }
  const payload = evidenceAuthority.artifact.artifactPayload;
  assertReplayResultAssessmentEvidenceAuthority({
    request,
    authority: evidenceAuthority
  });
  const evidenceGap = resultAssessmentEvidenceGap(evidenceAuthority);
  if (evidenceGap !== null) {
    throw new TypeError(evidenceGap);
  }
  const assessmentRef = resultAssessmentRef(request, evidenceAuthority);
  const subject = request.runtimeResultRelation.subject;
  return Object.freeze(
    payload.fulfillmentAssessments.map((assessment) => {
      const evidenceEventRefs = evidenceAuthority.rows
        .filter((row) => row.obligationId === assessment.id)
        .flatMap((row) => row.evidenceEventRefs);
      return Object.freeze({
        kind: "assessed",
        assessmentKind: "fp" as const,
        assessmentRef,
        basisId: subject.basisId,
        graphCallId: subject.graphCallId,
        frameId: subject.frameId,
        vectorIndex: subject.vectorIndex,
        runtimeResultRef: subject.runtimeResult.ref,
        runtimeResultDigest: subject.runtimeResult.digest,
        assessmentContractRef: request.assessmentContract.ref,
        assessmentContractDigest: request.assessmentContract.digest,
        edge: subject.edge,
        obligationId: assessment.id,
        evidenceEventRefs: Object.freeze(evidenceEventRefs),
        publishedLedgerRef: evidenceAuthority.publishedLedgerRef,
        actor: request.invocationAuthority.actorRef,
        specHash: evidenceAuthority.promptDigest,
        manifestId: evidenceAuthority.manifestRef,
        workflowVersion: evidenceAuthority.programRef,
        runId: evidenceAuthority.runId,
        workKey: evidenceAuthority.workKey,
        selectedWorkerId: evidenceAuthority.workerId,
        selectedBackend: evidenceAuthority.backendId,
        roleId: null,
        authorityRef: request.invocationAuthority.authoritySetRef,
        assignmentSource: null,
        resolvedRuntimeRef: evidenceAuthority.resolvedRuntimeRef
      } satisfies AssessedRuntimeEvent);
    })
  );
}

export function constructPublicResultAssessmentOutcome(input: {
  readonly request: ReplayBoundPublicResultAssessmentRequest;
  readonly evidenceAuthority: ReplayAdmittedResultAssessmentEvidenceAuthority;
  readonly emitted: readonly (CanonicalRuntimeEvent & AssessedRuntimeEvent)[];
}): PublicResultAssessmentOutcome {
  return constructAcceptedPublicResultAssessmentOutcome(input);
}
