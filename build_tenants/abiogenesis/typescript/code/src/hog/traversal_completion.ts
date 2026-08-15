import type {
  AdmittedCCallJudgment,
  AdmittedCCallResult,
  CCall,
} from "../abg/c_call.js";
import type { FhInteractionHoldAdmission } from "../abg/continuation.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import type { ReplayState } from "../abg/replay.js";
import type { RetryRuntimeFailureTransitionPlan } from "../abg/retry.js";
import type { RouteTransitionAdmission } from "../abg/traversal_route.js";
import type { TraversalCursorCandidate } from "../abg/traversal_cursor.js";
import type {
  ClosureContract,
  GtlGraph,
  RecurseApplication,
} from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type { OpenedTraversalScope } from "../abg/open_call.js";

export interface HeldInteractionTraversal {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly cursor: TraversalCursorCandidate;
}

export interface HeldWorkflowSuspension {
  readonly kind: "held_workflow_suspension";
  readonly schemaVersion: "5.0.0";
  readonly parentExecutionBasisRef: string;
  readonly parentTraversalScope: OpenedTraversalScope;
  readonly parentGraph: Readonly<GtlGraph>;
  readonly parentClosureContract: Readonly<ClosureContract>;
  readonly parentCCall: CCall;
  readonly sourceCursor: TraversalCursorCandidate;
  readonly parentGraphInput: Readonly<Record<string, JsonValue>>;
  readonly parentGraphInputDigest: `sha256:${string}`;
  readonly parentInput: Readonly<Record<string, JsonValue>>;
  readonly parentInputDigest: `sha256:${string}`;
  readonly childExecutionBasisRef: string;
  readonly childTraversalScopeRef: string;
  readonly childInput: Readonly<Record<string, JsonValue>>;
  readonly childInputDigest: `sha256:${string}`;
  readonly terminalMode: "close_run" | "return_to_parent";
}

export interface HeldRecursionSuspension {
  readonly kind: "held_recursion_suspension";
  readonly schemaVersion: "5.0.0";
  readonly parentExecutionBasisRef: string;
  readonly parentTraversalScope: OpenedTraversalScope;
  readonly parentGraph: Readonly<GtlGraph>;
  readonly parentClosureContract: Readonly<ClosureContract>;
  readonly parentGraphInput: Readonly<Record<string, JsonValue>>;
  readonly parentGraphInputDigest: `sha256:${string}`;
  readonly application: Readonly<RecurseApplication>;
  readonly evaluatorCCall: CCall;
  readonly evaluatorResult: AdmittedCCallResult;
  readonly evaluatorJudgment: AdmittedCCallJudgment;
  readonly sourceCursor: TraversalCursorCandidate;
  readonly evaluatorInput: Readonly<Record<string, JsonValue>>;
  readonly evaluatorInputDigest: `sha256:${string}`;
  readonly childExecutionBasisRef: string;
  readonly childTraversalScopeRef: string;
  readonly childInput: Readonly<Record<string, JsonValue>>;
  readonly childInputDigest: `sha256:${string}`;
  readonly terminalMode: "close_run" | "return_to_parent";
}

export type HeldParentTraversalSuspension =
  | HeldRecursionSuspension
  | HeldWorkflowSuspension;

export interface ExecutableTraversalCompletion {
  readonly kind: "executable_traversal_completion";
  readonly schemaVersion: "5.0.0";
  readonly disposition:
    | "advanced"
    | "application_ready"
    | "blocked"
    | "closed"
    | "failed"
    | "gap_stop"
    | "held"
    | "refused";
  readonly cCallRef: string | null;
  readonly resultRef: string | null;
  readonly judgmentRef: string | null;
  readonly closureRef: string | null;
  readonly nextCursor: TraversalCursorCandidate | null;
  readonly resultValue: JsonValue | null;
  readonly continuationKind: "advance" | "re_enter" | "retry" | null;
  readonly nextInputContractRef: string | null;
  readonly replayState: ReplayState;
  readonly successorPrefix: DurablePrefixCoordinate;
  readonly diagnosticRef: string | null;
  readonly continuationRef: string | null;
  readonly heldCursor: TraversalCursorCandidate | null;
  readonly heldInteraction: HeldInteractionTraversal | null;
  readonly heldGraph: Readonly<GtlGraph> | null;
  readonly heldClosureContract: Readonly<ClosureContract> | null;
  readonly parentSuspensions: readonly HeldParentTraversalSuspension[];
}

type CompletionValues = Partial<Readonly<{
  cCallRef: string;
  resultRef: string;
  judgmentRef: string;
  closureRef: string;
  nextCursor: TraversalCursorCandidate;
  resultValue: JsonValue;
  continuationKind: "advance" | "re_enter" | "retry";
  nextInputContractRef: string;
  diagnosticRef: string;
  continuationRef: string;
  heldCursor: TraversalCursorCandidate;
  heldInteraction: HeldInteractionTraversal;
  heldGraph: Readonly<GtlGraph>;
  heldClosureContract: Readonly<ClosureContract>;
  parentSuspensions: readonly HeldParentTraversalSuspension[];
}>>;

export function projectExecutableTraversalCompletion(
  disposition: ExecutableTraversalCompletion["disposition"],
  replayState: ReplayState,
  successorPrefix: DurablePrefixCoordinate,
  values: CompletionValues = {},
): ExecutableTraversalCompletion {
  return deepFreeze({
    kind: "executable_traversal_completion" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    cCallRef: values.cCallRef ?? null,
    resultRef: values.resultRef ?? null,
    judgmentRef: values.judgmentRef ?? null,
    closureRef: values.closureRef ?? null,
    nextCursor: values.nextCursor ?? null,
    resultValue: values.resultValue ?? null,
    continuationKind: values.continuationKind ?? null,
    nextInputContractRef: values.nextInputContractRef ?? null,
    replayState,
    successorPrefix,
    diagnosticRef: values.diagnosticRef ?? null,
    continuationRef: values.continuationRef ?? null,
    heldCursor: values.heldCursor ?? null,
    heldInteraction: values.heldInteraction ?? null,
    heldGraph: values.heldGraph ?? null,
    heldClosureContract: values.heldClosureContract ?? null,
    parentSuspensions: values.parentSuspensions ?? [],
  });
}

export function projectHeldTraversalCompletion(input: Readonly<{
  hold: FhInteractionHoldAdmission;
  cursor: TraversalCursorCandidate;
  graph: Readonly<GtlGraph>;
  closureContract: Readonly<ClosureContract>;
  replayState: ReplayState;
  parentSuspensions: readonly HeldParentTraversalSuspension[];
}>): ExecutableTraversalCompletion {
  return projectExecutableTraversalCompletion(
    "held",
    input.replayState,
    input.hold.successorPrefix,
    {
      cCallRef: input.hold.pending.cCall.cCallRef,
      resultRef: input.hold.pending.result.resultRef,
      judgmentRef: input.hold.pending.judgment.judgmentRef,
      resultValue: input.hold.pending.result.value,
      continuationRef: input.hold.continuation.continuationRef,
      heldCursor: input.cursor,
      heldGraph: input.graph,
      heldClosureContract: input.closureContract,
      heldInteraction: {
        cCall: input.hold.pending.cCall,
        result: input.hold.pending.result,
        judgment: input.hold.pending.judgment,
        cursor: input.cursor,
      },
      parentSuspensions: input.parentSuspensions,
    },
  );
}

export function projectBlockedRetryTraversalCompletion(input: Readonly<{
  plan: RetryRuntimeFailureTransitionPlan;
  route: RouteTransitionAdmission;
}>): ExecutableTraversalCompletion {
  const transition = input.plan.transition;
  if (transition.disposition !== "blocked") {
    throw new TypeError(
      "blocked retry completion requires one exact blocked transition plan",
    );
  }
  return projectExecutableTraversalCompletion(
    "blocked",
    input.route.replayState,
    input.route.successorPrefix,
    {
      cCallRef: transition.close.cCallRef,
      resultRef: transition.close.result.resultRef,
      judgmentRef: transition.close.judgment.judgmentRef,
      resultValue: transition.close.result.value,
      diagnosticRef: transition.close.judgment.reasonRef,
    },
  );
}
