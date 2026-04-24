import {
  constructFakeLaneQualificationOutcome,
  constructFakeLaneStepRef,
  constructPassedFakeLaneQualificationOutcome,
  constructRejectedFakeLaneQualificationOutcome
} from "./constructors.js";
import type {
  FakeLaneQualificationOutcome,
  FakeLaneQualificationRequest,
  FakeLaneStepRef
} from "./carriers.js";

const REQUIRED_EVENT_KINDS: readonly string[] = Object.freeze([
  "basis_admitted",
  "fp_dispatch_requested",
  "assessed"
]);

function hasRequiredEvents(values: readonly string[]): boolean {
  return REQUIRED_EVENT_KINDS.every((kind) => values.includes(kind));
}

function evaluateScenarioAuthority(
  request: FakeLaneQualificationRequest
): FakeLaneStepRef {
  return constructFakeLaneStepRef(
    "scenario_authority",
    request.scenarioAuthorityRefs.length > 0,
    request.scenarioAuthorityRefs.length > 0
      ? "scenario authority refs present"
      : "scenario authority refs missing"
  );
}

function evaluateAssetAddressing(
  request: FakeLaneQualificationRequest
): FakeLaneStepRef {
  const valid =
    request.assetAddressingKind === "resolved" &&
    request.resolvedTargetKind === "graph_function" &&
    request.resolvedTargetHandle !== null &&
    request.resolvedTargetHandle.length > 0;

  return constructFakeLaneStepRef(
    "asset_addressing",
    valid,
    valid
      ? `resolved ${request.resolvedTargetHandle}`
      : "asset-addressing did not resolve one graph-function target"
  );
}

function evaluatePublicStart(
  request: FakeLaneQualificationRequest
): FakeLaneStepRef {
  const valid =
    request.startOutcomeKind === "blocked" &&
    request.startStopPredicate === "dispatch_required";

  return constructFakeLaneStepRef(
    "public_start",
    valid,
    valid
      ? "public start reached canonical dispatch_required stop"
      : "public start did not preserve dispatch_required blocking truth"
  );
}

function evaluateDispatchRequest(
  request: FakeLaneQualificationRequest
): FakeLaneStepRef {
  const valid =
    request.dispatchExpectedEdge !== null &&
    request.dispatchExpectedEdge.length > 0 &&
    request.emittedEventKinds.includes("fp_dispatch_requested");

  return constructFakeLaneStepRef(
    "dispatch_request",
    valid,
    valid
      ? `dispatch request preserved ${request.dispatchExpectedEdge}`
      : "dispatch request expectation truth missing"
  );
}

function evaluateResultAssessment(
  request: FakeLaneQualificationRequest
): FakeLaneStepRef {
  const valid =
    request.resultAssessmentKind === "accepted" &&
    hasRequiredEvents(request.emittedEventKinds);

  return constructFakeLaneStepRef(
    "result_assessment",
    valid,
    valid
      ? "result assessment accepted and emitted assessed runtime truth"
      : "result assessment did not preserve accepted assessed truth"
  );
}

function evaluateLiveStatus(
  request: FakeLaneQualificationRequest
): FakeLaneStepRef {
  const valid =
    request.liveStatusKind === "ready" &&
    request.liveRunStatus === "assessed";

  return constructFakeLaneStepRef(
    "live_status",
    valid,
    valid
      ? "live status projected assessed ready truth"
      : "live status did not project assessed ready truth"
  );
}

export function qualifyFakeLaneScenario(
  request: FakeLaneQualificationRequest
): FakeLaneQualificationOutcome {
  const trace = Object.freeze([
    evaluateScenarioAuthority(request),
    evaluateAssetAddressing(request),
    evaluatePublicStart(request),
    evaluateDispatchRequest(request),
    evaluateResultAssessment(request),
    evaluateLiveStatus(request)
  ]);

  const firstFailed = trace.find((step) => !step.valid);
  if (firstFailed !== undefined) {
    return constructFakeLaneQualificationOutcome(
      constructRejectedFakeLaneQualificationOutcome({
        scenarioName: request.scenarioName,
        reason: firstFailed.detail,
        trace
      })
    );
  }

  return constructFakeLaneQualificationOutcome(
    constructPassedFakeLaneQualificationOutcome({
      scenarioName: request.scenarioName,
      scenarioAuthorityRefs: request.scenarioAuthorityRefs,
      trace
    })
  );
}
