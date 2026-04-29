import type { RuntimeEvent } from "../../../abg/m03/contracts/carriers.js";
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
  request: PublicResultAssessmentRequest
): readonly RuntimeEvent[] {
  if (request.artifact.artifactPayload === null) {
    return Object.freeze([]);
  }
  const payload = request.artifact.artifactPayload;
  const authorityRefs = payload.fulfillmentAssessments.map(
    (assessment) => assessment.id
  );
  const authorityDigest = `authority:result_assessment:${JSON.stringify({
    graphFunctionId: request.dispatchRequest.graphFunctionId,
    edge: payload.edge,
    authorityRefs
  })}`;
  const inputDigest = `input:result_assessment:${JSON.stringify({
    basisId: request.dispatchRequest.basisId,
    dispatchRef: request.dispatchRequest.dispatchRef,
    resultRef: request.dispatchRequest.resultRef
  })}`;
  const providerRefs = Object.freeze([
    request.manifestProvenance.selectedWorkerId ?? request.dispatchRequest.workerId,
    request.manifestProvenance.selectedBackend ?? request.dispatchRequest.backendId
  ]);
  const policyRefs = Object.freeze([request.manifestProvenance.workflowVersion]);
  const events: RuntimeEvent[] = [
    Object.freeze({
      kind: "authority_snapshot_admitted",
      basisId: request.dispatchRequest.basisId,
      graphCallId: request.dispatchRequest.graphCallId,
      frameId: request.dispatchRequest.frameId,
      vectorIndex: request.dispatchRequest.vectorIndex,
      edge: payload.edge,
      authoritySnapshotRef: `authority-snapshot:result_assessment:${request.dispatchRequest.resultRef}`,
      authorityRefs,
      inputRefs: [request.dispatchRequest.resultRef],
      authorityDigest,
      inputDigest,
      closureCapable: true,
      contradictoryAuthority: false,
      deferredAuthorityRefs: [],
      providerRefs,
      policyRefs
    } satisfies RuntimeEvent)
  ];

  for (const assessment of payload.fulfillmentAssessments) {
    const evidenceRefs =
      assessment.evidenceRefs.length === 0
        ? [`evidence:result_assessment:${assessment.id}`]
        : assessment.evidenceRefs;
    for (const evidenceRef of evidenceRefs) {
      const payloadRef = `payload:result_assessment:${JSON.stringify({
        basisId: request.dispatchRequest.basisId,
        dispatchRef: request.dispatchRequest.dispatchRef,
        resultRef: request.dispatchRequest.resultRef,
        assessmentId: assessment.id,
        evidenceRef
      })}`;
      const digest = `digest:result_assessment:${JSON.stringify({
        resultRef: request.dispatchRequest.resultRef,
        assessmentId: assessment.id,
        evidenceRef
      })}`;
      events.push(
        Object.freeze({
          kind: "payload_observed",
          basisId: request.dispatchRequest.basisId,
          graphCallId: request.dispatchRequest.graphCallId,
          frameId: request.dispatchRequest.frameId,
          vectorIndex: request.dispatchRequest.vectorIndex,
          edge: payload.edge,
          payloadRef,
          payloadClass: "evidence",
          schemaRef: null,
          contractRef: "contract://abg/fp-result-evidence",
          digest,
          producerRef: payload.actor,
          sourceEventRef: request.dispatchRequest.resultRef,
          actorInvocationId: null,
          authorityRef: assessment.id,
          inputDigest,
          policyRefs
        } satisfies RuntimeEvent),
        Object.freeze({
          kind: "payload_validated",
          basisId: request.dispatchRequest.basisId,
          graphCallId: request.dispatchRequest.graphCallId,
          frameId: request.dispatchRequest.frameId,
          vectorIndex: request.dispatchRequest.vectorIndex,
          edge: payload.edge,
          payloadRef,
          schemaRef: null,
          contractRef: "contract://abg/fp-result-evidence",
          digest,
          validationRef: `validation:result_assessment:${payloadRef}`,
          evidenceRef,
          policyRefs
        } satisfies RuntimeEvent),
        Object.freeze({
          kind: "evidence_admitted",
          basisId: request.dispatchRequest.basisId,
          graphCallId: request.dispatchRequest.graphCallId,
          frameId: request.dispatchRequest.frameId,
          vectorIndex: request.dispatchRequest.vectorIndex,
          edge: payload.edge,
          evidenceRef,
          payloadRef,
          authorityRef: assessment.id,
          authorityDigest,
          inputDigest,
          providerRefs,
          policyRefs,
          complete: true,
          shallow: false,
          contradictsAuthority: false,
          deferred: false
        } satisfies RuntimeEvent)
      );
    }
  }

  events.push(
    ...payload.fulfillmentAssessments.map((assessment) =>
      Object.freeze({
        kind: "assessed",
        assessmentKind: "fp" as const,
        edge: payload.edge,
        obligationId: assessment.id,
        publishedLedgerRef: request.publishedLedgerRef.ref,
        actor: payload.actor,
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
      } satisfies RuntimeEvent)
    )
  );

  return Object.freeze(events);
}

export function constructPublicResultAssessmentOutcome(input: {
  readonly request: PublicResultAssessmentRequest;
  readonly emitted: readonly RuntimeEvent[];
}): PublicResultAssessmentOutcome {
  return constructAcceptedPublicResultAssessmentOutcome(input);
}
