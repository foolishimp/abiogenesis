import type {
  FanOutApplication,
  GtlGraph,
} from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  CCall,
} from "../abg/c_call.js";
import type { FhInteractionResumeAdmission } from "../abg/continuation.js";
import type { ExecutionBasis, RuntimeAdmissionBasis } from "../abg/execution_basis.js";
import type { CompleteFanOutAdmission } from "../abg/fan_out.js";
import {
  admitRuntimeEventTransaction,
  type AbgEventStore,
} from "../abg/event_store.js";
import {
  admitCompletedRetryProgress,
  type RetrySuccessfulExitEvidence,
} from "../abg/retry.js";
import { replay } from "../abg/replay.js";
import { admitRoute } from "../abg/traversal_route.js";
import type { TraversalCursorCandidate } from "../abg/traversal_cursor.js";
import type { TraversalStep } from "./traversal.js";
import {
  proposeFanOutRoute,
  proposeInteractionResumeRoute,
  proposeJudgedRoute,
  proposeStructuralRoute,
} from "./traversal_route.js";

export type SuccessfulRetryExitVariant =
  | Readonly<{
    completionClass: "judged_success";
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
    transitionContractRef: string;
  }>
  | Readonly<{
    completionClass: "fan_out_success";
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
    application: Readonly<FanOutApplication>;
    completion: CompleteFanOutAdmission;
    transitionContractRef: string;
  }>
  | Readonly<{
    completionClass: "fh_resume_success";
    cCall: CCall;
    result: AdmittedCCallResult;
    judgment: AdmittedCCallJudgment;
    resume: FhInteractionResumeAdmission;
    transitionContractRef: string;
  }>
  | Readonly<{
    completionClass: "structural_identity_success";
    completionWitnessEventRef: string;
  }>;

export interface AdmitSuccessfulRetryExitInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly graph: Readonly<GtlGraph>;
  readonly sourceCursor: TraversalCursorCandidate;
  readonly continuationStep: TraversalStep;
  readonly targetCursor: TraversalCursorCandidate | null;
  readonly variant: SuccessfulRetryExitVariant;
  readonly basis: RuntimeAdmissionBasis;
}

class SuccessfulRetryExitRouteError extends TypeError {
  constructor(
    readonly code: string,
    readonly candidate: JsonValue,
  ) {
    super(`successful retry-exit route refusal: ${code}`);
  }
}

export function admitSuccessfulRetryExitRoute(
  input: AdmitSuccessfulRetryExitInput,
) {
  try {
    return admitRuntimeEventTransaction(input.store, () => {
      const retryEvidence: RetrySuccessfulExitEvidence =
        input.variant.completionClass === "structural_identity_success"
          ? input.variant
          : input.variant.completionClass === "fan_out_success"
            ? {
                completionClass: "fan_out_success",
                cCall: input.variant.cCall,
                result: input.variant.result,
                judgment: input.variant.judgment,
                completion: input.variant.completion,
              }
            : input.variant.completionClass === "fh_resume_success"
              ? {
                  completionClass: "fh_resume_success",
                  cCall: input.variant.cCall,
                  result: input.variant.result,
                  judgment: input.variant.judgment,
                  resume: input.variant.resume,
                }
              : {
                  completionClass: "judged_success",
                  cCall: input.variant.cCall,
                  result: input.variant.result,
                  judgment: input.variant.judgment,
                };
      const completedProgresses =
        (input.targetCursor?.retryPath.length ?? 0) <
            input.sourceCursor.retryPath.length
          ? admitCompletedRetryProgress(
              input.store,
              input.graph,
              input.sourceCursor,
              input.targetCursor,
              retryEvidence,
              {
                ...input.basis,
                correlationId: `${input.basis.correlationId}/progress`,
              },
            )
          : [];
      if ("kind" in completedProgresses) {
        throw new SuccessfulRetryExitRouteError(
          completedProgresses.code,
          completedProgresses as unknown as JsonValue,
        );
      }
      const routeReplay = replay(input.store, {
        runId: input.sourceCursor.runId,
      });
      const proposal = input.variant.completionClass ===
          "structural_identity_success"
        ? proposeStructuralRoute(
            input.graph,
            input.continuationStep,
            routeReplay,
            completedProgresses,
          )
        : input.variant.completionClass === "fan_out_success"
          ? proposeFanOutRoute(
              input.graph,
              input.variant.application,
              input.continuationStep,
              input.variant.cCall,
              input.variant.completion,
              routeReplay,
              input.variant.transitionContractRef,
              completedProgresses,
            )
          : input.variant.completionClass === "fh_resume_success"
            ? proposeInteractionResumeRoute(
                input.graph,
                input.continuationStep,
                input.variant.cCall,
                input.variant.judgment,
                input.variant.resume,
                routeReplay,
                input.variant.transitionContractRef,
                completedProgresses,
              )
            : proposeJudgedRoute(
                input.graph,
                input.continuationStep,
                input.variant.cCall,
                input.variant.result,
                input.variant.judgment,
                routeReplay,
                input.variant.transitionContractRef,
                completedProgresses,
              );
      if (proposal.kind !== "traversal_route_candidate") {
        throw new SuccessfulRetryExitRouteError(
          proposal.code,
          proposal as unknown as JsonValue,
        );
      }
      const evidence = input.variant.completionClass ===
          "structural_identity_success"
        ? {
            completionClass: "structural_identity_success" as const,
            completionWitnessEventRef:
              input.variant.completionWitnessEventRef,
            completedProgresses,
          }
        : input.variant.completionClass === "fan_out_success"
          ? {
              cCall: input.variant.cCall,
              result: input.variant.result,
              judgment: input.variant.judgment,
              application: input.variant.application,
              completion: input.variant.completion,
              completedProgresses,
            }
          : input.variant.completionClass === "fh_resume_success"
            ? {
                cCall: input.variant.cCall,
                result: input.variant.result,
                judgment: input.variant.judgment,
                resume: input.variant.resume,
                completedProgresses,
              }
            : {
                cCall: input.variant.cCall,
                result: input.variant.result,
                judgment: input.variant.judgment,
                completedProgresses,
              };
      const route = admitRoute(
        input.store,
        input.executionBasis,
        input.graph,
        input.sourceCursor,
        input.targetCursor,
        routeReplay,
        proposal,
        {
          ...input.basis,
          correlationId: `${input.basis.correlationId}/route`,
          causationEventRefs: [
            ...completedProgresses.slice(0, -1).map((progress) =>
              progress.admissionEventRef
            ),
            ...input.basis.causationEventRefs,
          ],
        },
        evidence,
      );
      if (route.kind !== "admitted_traversal_route") {
        throw new SuccessfulRetryExitRouteError(
          route.code,
          route as unknown as JsonValue,
        );
      }
      return deepFreeze({
        kind: "successful_retry_exit_route_admission" as const,
        completedProgresses,
        route,
      });
    });
  } catch (error) {
    if (!(error instanceof SuccessfulRetryExitRouteError)) throw error;
    return deepFreeze({
      kind: "successful_retry_exit_route_refusal" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "refused" as const,
      code: error.code,
      candidate: error.candidate,
    });
  }
}
