import type { AdvancementTransition } from "../contracts/carriers.js";
import {
  contractForKnownAgent,
  deriveDispatchExpectation,
  projectDispatchAssessmentIds,
  projectDispatchExpectedEdge,
  selectKnownTransportAgentKey
} from "../../../shared/abg_library/index.js";
import type {
  DispatchDerivableTransition,
  DispatchRequest,
  DispatchRequestInit,
  ResultArtifact,
  ResultArtifactInit,
  ResultIngestOutcome
} from "./carriers.js";

function freezeStringArray(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

export function constructDispatchRequest(
  input: DispatchRequestInit
): DispatchRequest {
  return Object.freeze({
    kind: "fp_dispatch_request",
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    jobId: input.jobId,
    dispatchRef: input.dispatchRef,
    workerId: input.workerId,
    backendId: input.backendId,
    resultRef: input.resultRef,
    expectedEdge: input.expectedEdge,
    expectedAssessmentIds: freezeStringArray(input.expectedAssessmentIds),
    transportContract: Object.freeze({
      agentKey: input.transportContract.agentKey,
      command: input.transportContract.command,
      argsTemplate: freezeStringArray(input.transportContract.argsTemplate),
      sanitizedEnvironmentPolicy: Object.freeze({
        prefixes: freezeStringArray(
          input.transportContract.sanitizedEnvironmentPolicy.prefixes
        )
      })
    })
  });
}

export function constructResultArtifact(
  input: ResultArtifactInit
): ResultArtifact {
  return Object.freeze({
    kind: "result_artifact",
    basisId: input.basisId,
    dispatchRef: input.dispatchRef,
    resultRef: input.resultRef,
    artifactPayload:
      input.artifactPayload === null
        ? null
        : Object.freeze({
            edge: input.artifactPayload.edge,
            actor: input.artifactPayload.actor,
            fulfillmentAssessments: Object.freeze(
              input.artifactPayload.fulfillmentAssessments.map((assessment) =>
                Object.freeze({
                  id: assessment.id,
                  evaluator: assessment.evaluator,
                  fulfillmentStatus: assessment.fulfillmentStatus,
                  fulfillmentDetail: assessment.fulfillmentDetail,
                  blockingReasons: freezeStringArray(assessment.blockingReasons),
                  evidenceRefs: freezeStringArray(assessment.evidenceRefs)
                })
              )
            ),
            workerId: input.artifactPayload.workerId,
            backendId: input.artifactPayload.backendId,
            roleId: input.artifactPayload.roleId,
            assignmentSource: input.artifactPayload.assignmentSource,
            resolvedRuntimeRef: input.artifactPayload.resolvedRuntimeRef
          }),
    identityIssues: freezeStringArray(input.identityIssues),
    runtimeFailure:
      input.runtimeFailure === null
        ? null
        : Object.freeze({
            failureClass: input.runtimeFailure.failureClass,
            detail: input.runtimeFailure.detail
          })
  });
}

function deriveDispatchExpectationForTransition(
  transition: DispatchDerivableTransition
) {
  const vector = transition.basis.graph.vectors[transition.vectorIndex];
  return deriveDispatchExpectation({
    sourceKinds: vector?.source.map((node) => node.assetSurface.kind) ?? Object.freeze([]),
    targetKind: vector?.target.assetSurface.kind ?? null,
    assessmentIds: vector?.evaluators.map((evaluator) => evaluator.name) ?? Object.freeze([])
  });
}

function deriveDispatchResultRef(
  basisId: string,
  dispatchRef: string
): string {
  return `result:fp_dispatch:${JSON.stringify({ basisId, dispatchRef })}`;
}

function deriveTransportContract(
  transition: DispatchDerivableTransition
): DispatchRequestInit["transportContract"] {
  return contractForKnownAgent(
    selectKnownTransportAgentKey([
      transition.dispatchRef,
      transition.basis.runtimeIdentity.backendId,
      transition.basis.runtimeIdentity.workerId
    ])
  );
}

export function dispatchRequestsForTransition(
  transition: AdvancementTransition
): readonly DispatchRequest[] {
  if (transition.kind !== "fp_dispatch") {
    return Object.freeze([]);
  }
  const basis = transition.basis;
  const expectation = deriveDispatchExpectationForTransition(transition);
  return Object.freeze([
    constructDispatchRequest({
      basisId: basis.id,
      graphFunctionId: basis.graphFunction.id,
      jobId: basis.job.id,
      dispatchRef: transition.dispatchRef,
      workerId: basis.runtimeIdentity.workerId,
      backendId: basis.runtimeIdentity.backendId,
      resultRef: deriveDispatchResultRef(basis.id, transition.dispatchRef),
      expectedEdge: projectDispatchExpectedEdge(expectation),
      expectedAssessmentIds: projectDispatchAssessmentIds(expectation),
      transportContract: deriveTransportContract(transition)
    })
  ]);
}

export function ingestResultArtifact(
  request: DispatchRequest,
  artifact: ResultArtifact
): ResultIngestOutcome {
  if (artifact.runtimeFailure !== null) {
    return Object.freeze({
      kind: "runtime_failure",
      request,
      artifact,
      failureClass: artifact.runtimeFailure.failureClass,
      detail: artifact.runtimeFailure.detail
    });
  }

  if (artifact.identityIssues.length > 0) {
    return Object.freeze({
      kind: "rejected",
      request,
      artifact,
      detail: artifact.identityIssues.join("; ")
    });
  }

  return Object.freeze({
    kind: "accepted",
    request,
    artifact
  });
}
