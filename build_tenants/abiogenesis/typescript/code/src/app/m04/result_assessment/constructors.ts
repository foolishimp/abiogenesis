import type { RuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
import type { ResultArtifact } from "../../../abg/m03/transport/index.js";
import type {
  AssessmentManifestProvenance,
  AssessmentTraceRef,
  FulfillmentAssessmentRef,
  PublicResultAssessmentAccepted,
  PublicResultAssessmentOutcome,
  PublicResultAssessmentRejected,
  PublicResultAssessmentRequest,
  PublishedLedgerRef
} from "./carriers.js";

function freezeRuntimeEventKinds(
  values: readonly RuntimeEvent["kind"][]
): readonly RuntimeEvent["kind"][] {
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
  readonly manifestProvenance: AssessmentManifestProvenance;
  readonly publishedLedgerRef: PublishedLedgerRef;
  readonly fulfillmentRefs: readonly FulfillmentAssessmentRef[];
}): PublicResultAssessmentRequest {
  return Object.freeze({
    kind: "fp_assessed",
    dispatchRequest: input.dispatchRequest,
    artifact: input.artifact,
    manifestProvenance: input.manifestProvenance,
    publishedLedgerRef: input.publishedLedgerRef,
    fulfillmentRefs: Object.freeze([...input.fulfillmentRefs])
  });
}

function constructAssessmentTraceRef(input: {
  readonly request: PublicResultAssessmentRequest;
  readonly emitted: readonly RuntimeEvent[];
}): AssessmentTraceRef {
  return Object.freeze({
    workflowVersion: input.request.manifestProvenance.workflowVersion,
    runId: input.request.manifestProvenance.runId,
    workKey: input.request.manifestProvenance.workKey,
    emittedKinds: freezeRuntimeEventKinds(
      input.emitted.map((event) => event.kind)
    )
  });
}

export function constructAcceptedPublicResultAssessmentOutcome(input: {
  readonly request: PublicResultAssessmentRequest;
  readonly emitted: readonly RuntimeEvent[];
}): PublicResultAssessmentAccepted {
  return Object.freeze({
    kind: "accepted",
    assessedCount: input.emitted.length,
    trace: constructAssessmentTraceRef(input)
  });
}

export function constructRejectedPublicResultAssessmentOutcome(input: {
  readonly ingestKind: "rejected" | "transport_failure";
  readonly reason: string;
  readonly trace?: AssessmentTraceRef | null;
}): PublicResultAssessmentRejected {
  return Object.freeze({
    kind: "rejected",
    ingestKind: input.ingestKind,
    reason: input.reason,
    trace: input.trace ?? null
  });
}

export function constructRuntimeEventsForResultAssessment(
  request: PublicResultAssessmentRequest
): readonly RuntimeEvent[] {
  if (request.artifact.artifactPayload === null) {
    return Object.freeze([]);
  }
  return Object.freeze(
    request.artifact.artifactPayload.fulfillmentAssessments.map((assessment) =>
      Object.freeze({
        kind: "assessed",
        assessmentKind: "fp" as const,
        edge: request.artifact.artifactPayload?.edge ?? "",
        obligationId: assessment.id,
        publishedLedgerRef: request.publishedLedgerRef.ref,
        actor: request.artifact.artifactPayload?.actor ?? "",
        specHash: request.manifestProvenance.specHash,
        manifestId: request.manifestProvenance.manifestId,
        workflowVersion: request.manifestProvenance.workflowVersion,
        runId: request.manifestProvenance.runId,
        workKey: request.manifestProvenance.workKey,
        selectedWorkerId: request.manifestProvenance.selectedWorkerId,
        selectedBackend: request.manifestProvenance.selectedBackend,
        roleId: request.manifestProvenance.roleId,
        authorityRef: request.manifestProvenance.authorityRef,
        assignmentSource: request.manifestProvenance.assignmentSource,
        resolvedRuntimeRef: request.manifestProvenance.resolvedRuntimeRef
      })
    )
  );
}

export function constructPublicResultAssessmentOutcome(input: {
  readonly request: PublicResultAssessmentRequest;
  readonly emitted: readonly RuntimeEvent[];
}): PublicResultAssessmentOutcome {
  return constructAcceptedPublicResultAssessmentOutcome(input);
}
