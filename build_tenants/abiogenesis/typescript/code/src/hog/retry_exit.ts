import type {
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  CCall,
} from "../abg/c_call.js";
import {
  projectHeldInteractionCCallOutcomeAtPrefix,
  type FhInteractionResumeAdmission,
} from "../abg/continuation.js";
import type {
  AdmittedInteractionSet,
  ExecutionBasis,
  RuntimeAdmissionBasis,
} from "../abg/execution_basis.js";
import type { CompleteFanOutAdmission } from "../abg/fan_out.js";
import {
  admitRuntimeEventTransactionAtExpectedPrefix,
  isRuntimeEventTransactionActive,
  type AbgEventStore,
} from "../abg/event_store.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import type { OpenedTraversalScope } from "../abg/open_call.js";
import {
  admitCompletedRetryProgress,
  type RetrySuccessfulExitEvidence,
} from "../abg/retry.js";
import { replay } from "../abg/replay.js";
import { admitRoute } from "../abg/traversal_route.js";
import type { TraversalCursorCandidate } from "../abg/traversal_cursor.js";
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
    authority: Readonly<{
      openedTraversalScope: OpenedTraversalScope;
      program: Readonly<GtlProgram>;
      interactionSet: AdmittedInteractionSet;
      heldCursor: TraversalCursorCandidate;
    }>;
  }>
  | Readonly<{
    completionClass: "structural_identity_success";
    completionWitnessEventRef: string;
  }>;

export interface AdmitSuccessfulRetryExitInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly sourceCursor: TraversalCursorCandidate;
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
  const transactionEntrySnapshot = input.store.readAll();
  const transactionEntryDigest = sha256Canonical(
    transactionEntrySnapshot as unknown as JsonValue,
  );
  const transactionEntryPrefix = selectValidatedRuntimeEventPrefix(
    transactionEntrySnapshot,
  );
  try {
    const admit = () => {
        let variant = input.variant;
        if (variant.completionClass === "fh_resume_success") {
          const projected = projectHeldInteractionCCallOutcomeAtPrefix(
            transactionEntryPrefix,
            {
              executionBasis: input.executionBasis,
              openedTraversalScope: variant.authority.openedTraversalScope,
              program: variant.authority.program,
              graph: input.graph,
              interactionSet: variant.authority.interactionSet,
              cursor: variant.authority.heldCursor,
            },
          );
          if (
            projected === null ||
            sha256Canonical(projected.cCall as unknown as JsonValue) !==
              sha256Canonical(variant.cCall as unknown as JsonValue) ||
            sha256Canonical(projected.result as unknown as JsonValue) !==
              sha256Canonical(variant.result as unknown as JsonValue) ||
            sha256Canonical(projected.judgment as unknown as JsonValue) !==
              sha256Canonical(variant.judgment as unknown as JsonValue)
          ) {
            throw new SuccessfulRetryExitRouteError(
              "fh_outcome_mismatch",
              variant as unknown as JsonValue,
            );
          }
          variant = deepFreeze({
            ...variant,
            cCall: projected.cCall,
            result: projected.result,
            judgment: projected.judgment,
          });
        }
        const retryEvidence: RetrySuccessfulExitEvidence =
        variant.completionClass === "structural_identity_success"
          ? variant
          : variant.completionClass === "fan_out_success"
            ? {
                completionClass: "fan_out_success",
                cCall: variant.cCall,
                result: variant.result,
                judgment: variant.judgment,
                completion: variant.completion,
              }
            : variant.completionClass === "fh_resume_success"
              ? {
                  completionClass: "fh_resume_success",
                  cCall: variant.cCall,
                  result: variant.result,
                  judgment: variant.judgment,
                  resume: variant.resume,
                }
              : {
                  completionClass: "judged_success",
                  cCall: variant.cCall,
                  result: variant.result,
                  judgment: variant.judgment,
                };
      const completedProgresses = admitCompletedRetryProgress(
        input.store,
        input.graph,
        input.graphFunction,
        input.sourceCursor,
        input.targetCursor,
        retryEvidence,
        {
          ...input.basis,
          correlationId: `${input.basis.correlationId}/progress`,
        },
      );
      if ("kind" in completedProgresses) {
        throw new SuccessfulRetryExitRouteError(
          completedProgresses.code,
          completedProgresses as unknown as JsonValue,
        );
      }
      const routeReplay = replay(input.store, {
        runId: input.sourceCursor.runId,
      });
      const proposal = variant.completionClass ===
          "structural_identity_success"
          ? proposeStructuralRoute(
            input.graph,
            input.sourceCursor,
            input.targetCursor!,
            "advance",
            routeReplay,
            completedProgresses,
          )
        : variant.completionClass === "fan_out_success"
          ? proposeFanOutRoute(
              input.graph,
              variant.application,
              input.sourceCursor,
              input.targetCursor,
              variant.cCall,
              variant.completion,
              routeReplay,
              variant.transitionContractRef,
              completedProgresses,
            )
          : variant.completionClass === "fh_resume_success"
            ? proposeInteractionResumeRoute(
                input.graph,
                input.sourceCursor,
                input.targetCursor,
                variant.cCall,
                variant.judgment,
                variant.resume,
                routeReplay,
                variant.transitionContractRef,
                completedProgresses,
              )
            : proposeJudgedRoute(
                input.graph,
                input.sourceCursor,
                input.targetCursor,
                variant.cCall,
                variant.result,
                variant.judgment,
                routeReplay,
                variant.transitionContractRef,
                completedProgresses,
              );
      if (proposal.kind !== "traversal_route_candidate") {
        throw new SuccessfulRetryExitRouteError(
          proposal.code,
          proposal as unknown as JsonValue,
        );
      }
      const evidence = variant.completionClass ===
          "structural_identity_success"
        ? {
            graphFunction: input.graphFunction,
            completionClass: "structural_identity_success" as const,
            completionWitnessEventRef:
              variant.completionWitnessEventRef,
            completedProgresses,
          }
        : variant.completionClass === "fan_out_success"
          ? {
              graphFunction: input.graphFunction,
              cCall: variant.cCall,
              result: variant.result,
              judgment: variant.judgment,
              application: variant.application,
              completion: variant.completion,
              completedProgresses,
            }
          : variant.completionClass === "fh_resume_success"
            ? {
                graphFunction: input.graphFunction,
                cCall: variant.cCall,
                result: variant.result,
                judgment: variant.judgment,
                resume: variant.resume,
                completedProgresses,
              }
            : {
                graphFunction: input.graphFunction,
                cCall: variant.cCall,
                result: variant.result,
                judgment: variant.judgment,
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
    };
    return isRuntimeEventTransactionActive(input.store)
      ? admit()
      : admitRuntimeEventTransactionAtExpectedPrefix(
          input.store,
          transactionEntryDigest,
          admit,
        ).value;
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
