import type { FpEvaluationOutcome } from "../contracts/plugins.js";
import {
  projectExecutiveContinuationInput,
  projectExecutiveObservationView,
  projectExecutivePressureFacts,
  type ExecutiveContinuationInputProjection,
  type ExecutiveObservationView,
  type ExecutivePressureFactProjection,
  type ProjectExecutiveObservationViewInput
} from "../contracts/executive_observer.js";

export interface ExecutiveObserverRunnerRequest {
  readonly observation: ProjectExecutiveObservationViewInput;
  readonly fpEvaluationOutcome: FpEvaluationOutcome;
  readonly priorResidualPressureRefs?: readonly string[] | undefined;
}

export interface ExecutiveObserverRunnerResult {
  readonly kind: "abg_executive_observer_runner_result";
  readonly observation: ExecutiveObservationView;
  readonly pressureFacts: readonly ExecutivePressureFactProjection[];
  readonly continuationInput: ExecutiveContinuationInputProjection;
}

export function runExecutiveObserverProjection(
  input: ExecutiveObserverRunnerRequest
): ExecutiveObserverRunnerResult {
  const observation = projectExecutiveObservationView(input.observation);
  const pressureFacts = projectExecutivePressureFacts({
    observation,
    outcome: input.fpEvaluationOutcome,
    priorResidualPressureRefs: input.priorResidualPressureRefs
  });
  const continuationInput = projectExecutiveContinuationInput({
    observation,
    pressureFacts
  });
  return Object.freeze({
    kind: "abg_executive_observer_runner_result" as const,
    observation,
    pressureFacts,
    continuationInput
  });
}
