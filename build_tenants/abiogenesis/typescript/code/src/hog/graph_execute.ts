import {
  admitInitialTraversalCursor,
  admitRuntimeFailure,
  deriveGraphFunctionActionEvaluationBasis,
  hasAdmittedTraversalCursor,
  isExecutionBasis,
  isTraversalCursorCandidate,
  rehydrateExecutionBasisAtPrefix,
  rehydrateConstructionIntentForCursor,
  selectAdmittedImplementationResolution,
  traversalCursorAdmissionEventRef,
  type AbgEventStore,
  type ActorRuntimeBinding,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type AdmittedImplementationSet,
  type AdmittedImplementationResolutionRow,
  type AdmittedInteractionContractRow,
  type AdmittedInteractionSet,
  type CCall,
  type ContinuationProductBasis,
  type ExecutionBasis,
  type FhInteractionResumeAdmission,
  type OpenedTraversalScope,
  type ReplayState,
  type RuntimeAdmissionBasis,
} from "../abg/index.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import { validatedRuntimeEventPrefixThroughEvent } from "../abg/event_prefix.js";
import {
  projectDeclaredCRetryFrontier,
} from "../abg/retry.js";
import type { CCallRuntimeFailureSource } from "../abg/c_call.js";
import {
  admitRuntimeEventTransactionAtExpectedPrefix,
  assertHeldEventStoreAtDurablePrefix,
  assertHeldEventStoreAtRuntimeEventPrefix,
  isRuntimeEventTransactionActive,
  readRuntimeEventsAtDurablePrefix,
  selectHeldEventStoreDurablePrefix,
  validateDurablePrefixCoordinate,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import { projectAdmittedRetryRouteAtPrefix } from "../abg/traversal_route.js";
import type {
  ClosureContract,
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import { deriveCSourceContinuation } from "../gtl/source_path.js";
import { isAdmittedLeafInvocationPort } from "../implementation/leaf_invocation_port.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type {
  ClosedLeafOwnerReceipt,
  LeafRealizationCandidate,
} from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { GraphValidation } from "../validator/graph.js";
import {
  deriveDirectCStepFromGraph,
  type DirectCTraversalStep,
} from "./direct_fold.js";
import {
  isChildTraversalPreparationPort,
  type ChildTraversalPreparationPort,
  type ChildTraversalPreparationRefusal,
  type PreparedChildTraversal,
} from "./child_traversal.js";
import {
  applyAdmittedRoute,
  deriveCompletedTraversalCursor,
  deriveGraphSpanReentryCursor,
  deriveRecursionReentryCursor,
  deriveInteractionSuccessorInputCarrierRef,
  deriveStructuralTargetCursor,
  deriveRetryTraversalCursor,
  rehydrateHeldInteractionCursor,
  applyRecursionRoute,
  resolveTraversalTerm,
  traverse,
  traverseFromDirectStep,
  traverseFromCursor,
  type TraversalCursor,
  type TraversalStopRef,
  type TraverseResult,
} from "./traversal.js";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { runEffectProgram } from "../shared/effect_definition.js";
import * as Abg from "../abg/index.js";
import * as AbgRetry from "../abg/retry.js";
import * as Routes from "./traversal_route.js";
import { proposeFailureJudgment, proposeJudgment } from "./judgment.js";

export interface ProjectedRetryResumeSuccess {
  readonly kind: "projected_retry_resume";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "resumed";
  readonly executableRetryInputRef: string;
  readonly executableRetryInputDigest: `sha256:${string}`;
  readonly retryFrontierRef: string;
  readonly retryFrontierDigest: `sha256:${string}`;
  readonly selectedFrontierRowRef: string;
  readonly progressEventRef: string;
  readonly routeAdmissionEventRef: string;
  readonly routeRef: string;
  readonly routeDigest: `sha256:${string}`;
  readonly nextCursor: TraversalCursor;
  readonly retryAttemptAdmissionEventRef: string;
  readonly retryAttemptRef: string;
  readonly retryAttemptDigest: `sha256:${string}`;
  readonly nextAttempt: number;
  readonly inputContractRef: string;
  readonly inputRef: string;
  readonly inputDigest: `sha256:${string}`;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
  readonly successorPrefix: DurablePrefixCoordinate;
}

function sameCanonical(left: unknown, right: unknown): boolean {
  try {
    return sha256Canonical(left as JsonValue) ===
      sha256Canonical(right as JsonValue);
  } catch {
    return false;
  }
}

function canonicalDigest(value: unknown): `sha256:${string}` | null {
  try {
    return sha256Canonical(value as JsonValue);
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export interface ExecuteGraphTraversalCommonInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly implementationSet: AdmittedImplementationSet;
  readonly interactionSet: AdmittedInteractionSet;
  readonly continuationProductBasis?: ContinuationProductBasis;
  readonly leafPort: LeafInvocationPort;
  readonly childTraversalPreparationPort?: ChildTraversalPreparationPort;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding: ActorRuntimeBinding;
  readonly deferFailedRunStop?: boolean;
  readonly eventTime: string;
  readonly correlationId: string;
  readonly terminalMode?: "close_run" | "return_to_parent";
}

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
  readonly nextCursor: TraversalCursor | null;
  readonly resultValue: JsonValue | null;
  readonly continuationKind: "advance" | "re_enter" | "retry" | null;
  readonly nextInputContractRef: string | null;
  readonly replayState: ReplayState;
  readonly diagnosticRef: string | null;
  readonly continuationRef: string | null;
  readonly heldCursor: TraversalCursor | null;
  readonly heldInteraction: HeldInteractionTraversal | null;
  readonly heldGraph: Readonly<GtlGraph> | null;
  readonly heldClosureContract: Readonly<ClosureContract> | null;
  readonly parentSuspensions: readonly HeldParentTraversalSuspension[];
}

interface ExecutableTraversalClock {
  readonly eventTime: string;
  readonly correlationId: string;
}

interface CompleteExecutableTraversalInput<Input> {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly traversalStop: Extract<TraversalStopRef, { readonly stopClass: "executable" }>;
  readonly implementationSet: AdmittedImplementationSet;
  readonly implementationResolution: AdmittedImplementationResolutionRow;
  readonly leafPort: LeafInvocationPort;
  readonly input: Readonly<Input>;
  readonly inputDigest: `sha256:${string}`;
  readonly closureContract: Readonly<ClosureContract>;
  readonly actorRuntimeBinding?: ActorRuntimeBinding;
  readonly deferFailedRunStop?: boolean;
  readonly terminalMode?: "close_run" | "return_to_application" | "return_to_parent";
  readonly applicationCompletionMode?: "close_run" | "return_to_parent";
  readonly clock: ExecutableTraversalClock;
}

interface CompleteInteractionResumeInput {
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly interactionSet: AdmittedInteractionSet;
  readonly heldInteraction: HeldInteractionTraversal;
  readonly successorCursor: TraversalCursor;
  readonly resume: FhInteractionResumeAdmission;
  readonly closureContract: Readonly<ClosureContract>;
  readonly clock: ExecutableTraversalClock;
}

interface RestoreDeferredRecursionInput {
  readonly traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  readonly application: Readonly<RecurseApplication>;
  readonly cCallRef: string;
  readonly resultRef: string;
  readonly judgmentRef: string;
}

export interface HeldInteractionTraversal {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly cursor: TraversalCursor;
}

export interface HeldWorkflowSuspension {
  readonly kind: "held_workflow_suspension";
  readonly schemaVersion: "5.0.0";
  readonly parentExecutionBasisRef: string;
  readonly parentTraversalScope: OpenedTraversalScope;
  readonly parentGraph: Readonly<GtlGraph>;
  readonly parentClosureContract: Readonly<ClosureContract>;
  readonly parentCCall: CCall;
  readonly sourceCursor: TraversalCursor;
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
  readonly sourceCursor: TraversalCursor;
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

export interface InitialOrNonRetryResumeEntry {
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly inputDigest: `sha256:${string}`;
  readonly resume?: {
    readonly cursor: TraversalCursor;
    readonly input: Readonly<Record<string, JsonValue>>;
    readonly inputDigest: `sha256:${string}`;
  };
  readonly projectedRetryResume?: never;
}

export interface ProjectedRetryResumeEntry {
  readonly projectedRetryResume: ProjectedRetryResumeSuccess;
  readonly input?: never;
  readonly inputDigest?: never;
  readonly resume?: never;
}

export type InitialOrNonRetryExecuteGraphTraversalInput =
  ExecuteGraphTraversalCommonInput & InitialOrNonRetryResumeEntry;

export type ExecuteGraphTraversalInput = ExecuteGraphTraversalCommonInput &
  (InitialOrNonRetryResumeEntry | ProjectedRetryResumeEntry);

export interface ResumeHeldParentFrameInput {
  readonly parent: InitialOrNonRetryExecuteGraphTraversalInput;
  readonly suspension: HeldRecursionSuspension | HeldWorkflowSuspension;
  readonly parentCCall: import("../abg/index.js").CCall | null;
  readonly sourceCursor: TraversalCursor;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
}

export interface ResumeHeldInteractionInput {
  readonly parent: InitialOrNonRetryExecuteGraphTraversalInput;
  readonly interaction: CompleteInteractionResumeInput;
  readonly parents: readonly ResumeHeldParentFrameInput[];
}

function fail(
  input: ExecuteGraphTraversalCommonInput,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): never {
  admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "hog_traversal",
    { stage, candidate },
    diagnosticRef,
    {
      eventTime: input.eventTime,
      correlationId: `${input.correlationId}/${stage}`,
      causationEventRefs: [],
    },
  );
  throw new TypeError(diagnosticRef);
}

function admissionBasis(
  clock: ExecutableTraversalClock,
  stage: string,
): RuntimeAdmissionBasis {
  return {
    eventTime: clock.eventTime,
    correlationId: `${clock.correlationId}/${stage}`,
    causationEventRefs: [],
  };
}

function completion(
  disposition: ExecutableTraversalCompletion["disposition"],
  replayState: ReplayState,
  values: Partial<Readonly<{
    cCallRef: string;
    resultRef: string;
    judgmentRef: string;
    closureRef: string;
    nextCursor: TraversalCursor;
    resultValue: JsonValue;
    continuationKind: "advance" | "re_enter" | "retry";
    nextInputContractRef: string;
    diagnosticRef: string;
    continuationRef: string;
    heldCursor: TraversalCursor;
    heldInteraction: HeldInteractionTraversal;
    heldGraph: Readonly<GtlGraph>;
    heldClosureContract: Readonly<ClosureContract>;
    parentSuspensions: readonly HeldParentTraversalSuspension[];
  }>> = {},
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
    diagnosticRef: values.diagnosticRef ?? null,
    continuationRef: values.continuationRef ?? null,
    heldCursor: values.heldCursor ?? null,
    heldInteraction: values.heldInteraction ?? null,
    heldGraph: values.heldGraph ?? null,
    heldClosureContract: values.heldClosureContract ?? null,
    parentSuspensions: values.parentSuspensions ?? [],
  }) as ExecutableTraversalCompletion;
}

type StructuralTraversalResult = Readonly<{ kind: string }>;

type SuccessfulRetryExitVariant =
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
      completion: Abg.CompleteFanOutAdmission;
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
        heldCursor: TraversalCursor;
      }>;
    }>
  | Readonly<{
      completionClass: "structural_identity_success";
      completionWitnessEventRef: string;
    }>;

class RetryExitRefusal extends TypeError {
  constructor(readonly code: string, readonly candidate: JsonValue) {
    super(`successful retry-exit route refusal: ${code}`);
  }
}

function admitSuccessfulRetryExitRoute(input: Readonly<{
  store: AbgEventStore;
  executionBasis: ExecutionBasis;
  graphFunction: Readonly<GraphFunction>;
  graph: Readonly<GtlGraph>;
  sourceCursor: TraversalCursor;
  targetCursor: TraversalCursor | null;
  variant: SuccessfulRetryExitVariant;
  basis: RuntimeAdmissionBasis;
}>) {
  const snapshot = input.store.readAll();
  const expectedPrefixDigest = sha256Canonical(snapshot as unknown as JsonValue);
  const entryPrefix = selectValidatedRuntimeEventPrefix(snapshot);
  try {
    const admit = () => {
      let variant = input.variant;
      if (variant.completionClass === "fh_resume_success") {
        const projected = Abg.projectHeldInteractionCCallOutcomeAtPrefix(
          entryPrefix,
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
          !sameCanonical(projected.cCall, variant.cCall) ||
          !sameCanonical(projected.result, variant.result) ||
          !sameCanonical(projected.judgment, variant.judgment)
        ) {
          throw new RetryExitRefusal(
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
      const retryEvidence: AbgRetry.RetrySuccessfulExitEvidence =
        variant.completionClass === "structural_identity_success"
          ? variant
          : variant.completionClass === "fan_out_success"
            ? {
                completionClass: variant.completionClass,
                cCall: variant.cCall,
                result: variant.result,
                judgment: variant.judgment,
                completion: variant.completion,
              }
            : variant.completionClass === "fh_resume_success"
              ? {
                  completionClass: variant.completionClass,
                  cCall: variant.cCall,
                  result: variant.result,
                  judgment: variant.judgment,
                  resume: variant.resume,
                }
              : {
                  completionClass: variant.completionClass,
                  cCall: variant.cCall,
                  result: variant.result,
                  judgment: variant.judgment,
                };
      const progresses = AbgRetry.admitCompletedRetryProgress(
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
      if ("kind" in progresses) {
        throw new RetryExitRefusal(
          progresses.code,
          progresses as unknown as JsonValue,
        );
      }
      const replayState = Abg.replay(input.store, {
        runId: input.sourceCursor.runId,
      });
      const proposal = variant.completionClass === "structural_identity_success"
        ? Routes.proposeStructuralRoute(
            input.graph,
            input.sourceCursor,
            input.targetCursor!,
            "advance",
            replayState,
            progresses,
          )
        : variant.completionClass === "fan_out_success"
          ? Routes.proposeFanOutRoute(
              input.graph,
              variant.application,
              input.sourceCursor,
              input.targetCursor,
              variant.cCall,
              variant.completion,
              replayState,
              variant.transitionContractRef,
              progresses,
            )
          : variant.completionClass === "fh_resume_success"
            ? Routes.proposeInteractionResumeRoute(
                input.graph,
                input.sourceCursor,
                input.targetCursor,
                variant.cCall,
                variant.judgment,
                variant.resume,
                replayState,
                variant.transitionContractRef,
                progresses,
              )
            : Routes.proposeJudgedRoute(
                input.graph,
                input.sourceCursor,
                input.targetCursor,
                variant.cCall,
                variant.result,
                variant.judgment,
                replayState,
                variant.transitionContractRef,
                progresses,
              );
      if (proposal.kind !== "traversal_route_candidate") {
        throw new RetryExitRefusal(
          proposal.code,
          proposal as unknown as JsonValue,
        );
      }
      const evidence = variant.completionClass === "structural_identity_success"
        ? {
            graphFunction: input.graphFunction,
            completionClass: variant.completionClass,
            completionWitnessEventRef: variant.completionWitnessEventRef,
            completedProgresses: progresses,
          }
        : variant.completionClass === "fan_out_success"
          ? {
              graphFunction: input.graphFunction,
              cCall: variant.cCall,
              result: variant.result,
              judgment: variant.judgment,
              application: variant.application,
              completion: variant.completion,
              completedProgresses: progresses,
            }
          : variant.completionClass === "fh_resume_success"
            ? {
                graphFunction: input.graphFunction,
                cCall: variant.cCall,
                result: variant.result,
                judgment: variant.judgment,
                resume: variant.resume,
                completedProgresses: progresses,
              }
            : {
                graphFunction: input.graphFunction,
                cCall: variant.cCall,
                result: variant.result,
                judgment: variant.judgment,
                completedProgresses: progresses,
              };
      const route = Abg.admitRoute(
        input.store,
        input.executionBasis,
        input.graph,
        input.sourceCursor,
        input.targetCursor,
        replayState,
        proposal,
        {
          ...input.basis,
          correlationId: `${input.basis.correlationId}/route`,
        },
        evidence,
      );
      if (route.kind !== "admitted_traversal_route") {
        throw new RetryExitRefusal(route.code, route as unknown as JsonValue);
      }
      return deepFreeze({
        kind: "successful_retry_exit_route_admission" as const,
        completedProgresses: progresses,
        route,
      });
    };
    return isRuntimeEventTransactionActive(input.store)
      ? admit()
      : admitRuntimeEventTransactionAtExpectedPrefix(
          input.store,
          expectedPrefixDigest,
          admit,
        ).value;
  } catch (error) {
    if (!(error instanceof RetryExitRefusal)) throw error;
    return deepFreeze({
      kind: "successful_retry_exit_route_refusal" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "refused" as const,
      code: error.code,
      candidate: error.candidate,
    });
  }
}

function activeCursor(
  value: StructuralTraversalResult | TraverseResult,
): TraversalCursor | null {
  if (value.kind === "traversal_stop_ref") {
    return (value as TraversalStopRef).cursor;
  }
  return value.kind === "traversal_cursor" &&
      isTraversalCursorCandidate(value as TraversalCursor)
    ? value as TraversalCursor
    : null;
}

function structuralRefusal(
  code: string,
  message: string,
): Readonly<{ kind: "structural_traversal_refusal"; code: string; message: string }> {
  return { kind: "structural_traversal_refusal", code, message };
}

function advanceStructuralTraversal(input: Readonly<{
  store: AbgEventStore;
  program: Readonly<GtlProgram>;
  graphFunction: Readonly<GraphFunction>;
  graph: Readonly<GtlGraph>;
  graphValidation: GraphValidation;
  executionBasis: ExecutionBasis;
  openedTraversalScope: OpenedTraversalScope;
  initial: TraversalCursor;
  step: DirectCTraversalStep;
  inputValue: Readonly<Record<string, JsonValue>>;
  inputAuthority: LeafInvocationPort;
  routeOrdinal: number;
  clock: ExecutableTraversalClock;
}>): Effect.Effect<StructuralTraversalResult> {
  return Effect.sync(() => {
    if (
      !isAdmittedLeafInvocationPort(input.inputAuthority) ||
      input.inputAuthority.implementationSetRef !==
        input.executionBasis.implementationSetRef ||
      input.inputAuthority.implementationSetDigest !==
        input.executionBasis.implementationSetDigest ||
      input.inputAuthority.publicationDigest !==
        sha256Canonical(input.inputAuthority.publication as unknown as JsonValue)
    ) {
      return structuralRefusal(
        "basis_mismatch",
        "structural traversal requires the exact admitted leaf port",
      );
    }
    const { initial: source, step } = input;
    if (
      step.stepKind === "open_leaf" ||
      step.stepKind === "enter_child" ||
      step.stepKind === "complete_term" ||
      step.stepKind === "continue_term"
    ) {
      return structuralRefusal(
        "basis_mismatch",
        "structural traversal received a non-structural C step",
      );
    }
    const target = deriveStructuralTargetCursor(input.graph, source, step);
    if (target === null || target.kind === "traversal_refusal") {
      return target ?? source;
    }
    const exitsRetry = step.stepKind === "pass_identity" &&
      target.retryPath.length < source.retryPath.length;
    const witness = exitsRetry
      ? traversalCursorAdmissionEventRef(input.store, source)
      : null;
    if (exitsRetry && witness === null) {
      return structuralRefusal(
        "cursor_mismatch",
        "structural retry exit lacks its admitted source cursor",
      );
    }
    const targetValue = step.stepKind === "retry"
      ? materializedInputAtCursor(input.graph, target)?.value ?? input.inputValue
      : null;
    if (
      step.stepKind === "retry" &&
      (
        targetValue === null ||
        input.inputAuthority.contractValueKindByRef(step.inputCarrierRef) === null ||
        target.inputDigest !== sha256Canonical(targetValue) ||
        !input.inputAuthority.validateContractValueByRef(
          step.inputCarrierRef,
          targetValue,
        )
      )
    ) {
      return structuralRefusal(
        "basis_mismatch",
        "structural retry input lacks its exact typed preimage",
      );
    }
    const replayState = Abg.replay(input.store, {
      runId: input.openedTraversalScope.runId,
    });
    const routeBasis = (suffix: string): RuntimeAdmissionBasis => ({
      eventTime: input.clock.eventTime,
      correlationId:
        `${input.clock.correlationId}/route/${input.routeOrdinal}${suffix}`,
      causationEventRefs: [],
    });
    const admitted = exitsRetry
      ? admitSuccessfulRetryExitRoute({
          store: input.store,
          executionBasis: input.executionBasis,
          graphFunction: input.graphFunction,
          graph: input.graph,
          sourceCursor: source,
          targetCursor: target,
          variant: {
            completionClass: "structural_identity_success",
            completionWitnessEventRef: witness!,
          },
          basis: routeBasis("/successful-retry-exit"),
        })
      : (() => {
          const proposal = Routes.proposeStructuralRoute(
            input.graph,
            source,
            target,
            step.stepKind === "retry" ? "retry" : "advance",
            replayState,
          );
          return proposal.kind !== "traversal_route_candidate"
            ? proposal
            : Abg.admitRoute(
                input.store,
                input.executionBasis,
                input.graph,
                source,
                target,
                replayState,
                proposal,
                routeBasis(""),
              );
        })();
    const route = "route" in admitted ? admitted.route : admitted;
    if (route.kind !== "admitted_traversal_route") return route;
    if (step.stepKind === "retry") {
      const attempt = AbgRetry.admitRetryAttempt(
        input.store,
        input.executionBasis,
        input.graph,
        input.graphFunction,
        target,
        targetValue!,
        route.admissionEventRef,
        routeBasis("/retry-attempt"),
      );
      if (attempt.kind !== "retry_attempt_admission") return attempt;
    }
    return applyAdmittedRoute(
      source,
      target,
      step.stepKind === "retry" ? "retry" : "advance",
      route,
    );
  });
}

function evaluateInteractionLocus(input: Readonly<{
  store: AbgEventStore;
  executionBasis: ExecutionBasis;
  openedTraversalScope: OpenedTraversalScope;
  program: Readonly<GtlProgram>;
  graphFunction: Readonly<GraphFunction>;
  graph: Readonly<GtlGraph>;
  interactionSet: AdmittedInteractionSet;
  productBasis: ContinuationProductBasis | undefined;
  stop: Extract<TraversalStopRef, { readonly stopClass: "interaction" }>;
  value: Readonly<Record<string, JsonValue>>;
  closureContract: Readonly<ClosureContract>;
  clock: ExecutableTraversalClock;
  fail: TraversalLocusFailure;
}>): TraversalLocusEvaluation {
  if (input.productBasis === undefined) {
    return input.fail(
      "interaction-basis",
      "diagnostic://abiogenesis/interaction/product-basis-absent@5",
      input.stop as unknown as JsonValue,
    );
  }
  const interaction = Abg.selectAdmittedInteractionContract(
    input.interactionSet,
    {
      graphFunctionRef: input.graph.graphFunctionRef,
      nodeRef: input.stop.nodeRef,
      programLocusRef: input.stop.programLocusRef,
      interactionKind: input.stop.interactionKind,
      actorCapabilityRef: input.stop.actorCapabilityRef,
      requestContractRef: input.stop.requestContractRef,
      responseContractRef: input.stop.responseContractRef,
      continuationContractRef: input.stop.continuationContractRef,
    },
  );
  if (interaction === null) {
    return input.fail(
      "interaction-row",
      "diagnostic://abiogenesis/interaction/admitted-row-absent@5",
      input.stop as unknown as JsonValue,
    );
  }
  if (
    sha256Canonical(input.value) !== input.stop.cursor.inputDigest
  ) {
    throw new TypeError(
      "F_H interaction input differs from the admitted traversal cursor",
    );
  }
  const opened = Abg.openInteractionCCall(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    input.program,
    input.graphFunction,
    input.graph,
    input.stop,
    input.interactionSet,
    interaction,
    admissionBasis(input.clock, "fh-c-call-open"),
  );
  if (opened.kind !== "c_call_admission") {
    throw new TypeError(`F_H CCall admission refused: ${opened.code}`);
  }
  const pendingBasis = admissionBasis(input.clock, "fh-pending");
  const plan = Abg.planPendingInteractionAdmission(
    input.store,
    input.graph,
    input.graphFunction,
    input.stop.cursor,
    opened.cCall,
    input.value,
    input.stop.cursor.inputDigest,
    pendingBasis,
  );
  const { value: admitted } = admitRuntimeEventTransactionAtExpectedPrefix(
    input.store,
    plan.expectedPrefixDigest,
    () => {
      const pending = Abg.admitPlannedPendingInteraction(
        input.store,
        input.graph,
        input.graphFunction,
        input.stop.cursor,
        opened.cCall,
        input.value,
        input.stop.cursor.inputDigest,
        plan,
        pendingBasis,
      );
      const replayState = Abg.replay(input.store, {
        runId: input.openedTraversalScope.runId,
      });
      const proposal = Routes.proposeHoldRoute(
        input.graph,
        input.stop,
        opened.cCall,
        pending.judgment,
        replayState,
        input.stop.continuationContractRef,
      );
      if (proposal.kind !== "traversal_route_candidate") {
        throw new TypeError(`F_H hold route refused: ${proposal.code}`);
      }
      const route = Abg.admitRoute(
        input.store,
        input.executionBasis,
        input.graph,
        input.stop.cursor,
        null,
        replayState,
        proposal,
        admissionBasis(input.clock, "fh-hold-route"),
        {
          graphFunction: input.graphFunction,
          cCall: opened.cCall,
          result: pending.result,
          judgment: pending.judgment,
        },
      );
      if (route.kind !== "admitted_traversal_route") {
        throw new TypeError(`F_H hold route admission refused: ${route.code}`);
      }
      const continuation = Abg.admitFhInteractionOpen(
        input.store,
        input.executionBasis,
        input.openedTraversalScope,
        input.program,
        input.graph,
        input.interactionSet,
        input.stop.cursor,
        pending,
        route,
        input.productBasis!,
        input.value,
        admissionBasis(input.clock, "fh-continuation-open"),
      );
      return { pending, continuation };
    },
  );
  return {
    completion: completion(
      "held",
      Abg.replay(input.store, { runId: input.openedTraversalScope.runId }),
      {
        cCallRef: opened.cCall.cCallRef,
        resultRef: admitted.pending.result.resultRef,
        judgmentRef: admitted.pending.judgment.judgmentRef,
        resultValue: admitted.pending.result.value,
        continuationRef: admitted.continuation.continuationRef,
        heldCursor: input.stop.cursor,
        heldGraph: input.graph,
        heldClosureContract: input.closureContract,
        heldInteraction: deepFreeze({
          cCall: opened.cCall,
          result: admitted.pending.result,
          judgment: admitted.pending.judgment,
          cursor: input.stop.cursor,
        }),
      },
    ),
    outputValueKind: null,
    outputContractRef: null,
  };
}

function resumeInteractionOwner(
  input: CompleteInteractionResumeInput,
): ExecutableTraversalCompletion {
  const { cCall, result, judgment } = input.heldInteraction;
  const successorContract = deriveInteractionSuccessorInputCarrierRef(
    input.graph,
    input.heldInteraction.cursor,
  );
  if (
    successorContract !== input.resume.successorInputContractRef ||
    (successorContract === null) !==
      (input.resume.successorInputValueKind === null)
  ) {
    throw new TypeError(
      "F_H resume successor differs from direct GTL continuation",
    );
  }
  const target = deriveCompletedTraversalCursor(
    input.graph,
    input.successorCursor,
    {
      inputRef: input.resume.successorInputRef,
      inputDigest: input.resume.successorInputDigest,
    },
  );
  if (target?.kind === "traversal_refusal") {
    throw new TypeError(`F_H resume continuation refused: ${target.code}`);
  }
  const admitted = admitSuccessfulRetryExitRoute({
    store: input.store,
    executionBasis: input.executionBasis,
    graphFunction: input.graphFunction,
    graph: input.graph,
    sourceCursor: input.successorCursor,
    targetCursor: target,
    variant: {
      completionClass: "fh_resume_success",
      cCall,
      result,
      judgment,
      resume: input.resume,
      transitionContractRef: cCall.transitionContractRef,
      authority: {
        openedTraversalScope: input.openedTraversalScope,
        program: input.program,
        interactionSet: input.interactionSet,
        heldCursor: input.heldInteraction.cursor,
      },
    },
    basis: admissionBasis(input.clock, "fh-resume-successful-retry-exit"),
  });
  if (admitted.kind !== "successful_retry_exit_route_admission") {
    throw new TypeError(`F_H resume route refused: ${admitted.code}`);
  }
  if (admitted.route.routeKind === "advance") {
    if (successorContract === null || target === null) {
      throw new TypeError("F_H advance has no successor input or cursor");
    }
    const nextCursor = applyAdmittedRoute(
      input.successorCursor,
      target,
      "advance",
      admitted.route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      throw new TypeError(`F_H route application refused: ${nextCursor.code}`);
    }
    return completion("advanced", Abg.replay(input.store, { runId: cCall.runId }), {
      cCallRef: cCall.cCallRef,
      resultRef: input.resume.successorInputRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue: input.resume.successorInputValue,
      continuationKind: "advance",
      nextInputContractRef: successorContract,
    });
  }
  if (admitted.route.routeKind !== "terminal") {
    throw new TypeError(`F_H resume admitted ${admitted.route.routeKind}`);
  }
  const closure = Abg.admitInteractionClosure(
    input.store,
    selectHeldEventStoreDurablePrefix(input.store),
    cCall,
    result,
    judgment,
    input.resume,
    admitted.route,
    input.closureContract,
    admissionBasis(input.clock, "fh-closure"),
  );
  if (closure.kind !== "closure_admission") {
    throw new TypeError(`F_H closure refused: ${closure.code}`);
  }
  return completion("closed", Abg.replay(input.store, { runId: cCall.runId }), {
    cCallRef: cCall.cCallRef,
    resultRef: input.resume.responseRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: input.resume.responseValue,
  });
}

function replayRun(
  input: Pick<CompleteExecutableTraversalInput<unknown>, "store" | "openedTraversalScope">,
): ReplayState {
  return Abg.replay(input.store, { runId: input.openedTraversalScope.runId });
}

function transitionFailure(
  input: CompleteExecutableTraversalInput<unknown>,
  cCall: CCall,
  resultRef: string,
  judgmentRef: string,
  diagnosticRef: string,
  stage: string,
  candidate: JsonValue,
  causationEventRef: string,
): ExecutableTraversalCompletion {
  Abg.admitRuntimeFailure(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    "route",
    candidate,
    diagnosticRef,
    {
      ...admissionBasis(input.clock, stage),
      causationEventRefs: [causationEventRef],
    },
  );
  return completion("failed", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef,
    judgmentRef,
    diagnosticRef,
  });
}

function completeBlockedTraversal<Input>(
  input: CompleteExecutableTraversalInput<Input>,
  cCall: CCall,
  values: Readonly<{
    judgmentRef: string;
    judgmentEventRef: string;
    reasonRef: string;
    resultRef: string;
    stoppedProgresses?: readonly AbgRetry.RetryStoppedProgressAdmission[];
  }>,
): ExecutableTraversalCompletion {
  const replayState = replayRun(input);
  const proposal = Routes.proposeBlockedRoute(
    input.graph,
    input.traversalStop,
    cCall,
    values.judgmentRef,
    replayState,
    cCall.transitionContractRef,
    values.stoppedProgresses?.map((row) => row.progressRef) ?? [],
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return transitionFailure(
      input,
      cCall,
      values.resultRef,
      values.judgmentRef,
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      "blocked-route-proposal-refusal",
      proposal as unknown as JsonValue,
      values.stoppedProgresses?.at(-1)?.admissionEventRef ??
        values.judgmentEventRef,
    );
  }
  const route = Abg.admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    null,
    replayState,
    proposal,
    admissionBasis(input.clock, "blocked-route"),
    {
      graphFunction: input.graphFunction,
      cCall,
      resultRef: values.resultRef,
      judgmentRef: values.judgmentRef,
      judgmentEventRef: values.judgmentEventRef,
      reasonRef: values.reasonRef,
      ...(values.stoppedProgresses === undefined
        ? {}
        : { stoppedProgresses: values.stoppedProgresses }),
    },
    { terminalizeRun: input.terminalMode !== "return_to_parent" },
  );
  const prefix = route.kind === "admitted_traversal_route"
    ? validatedRuntimeEventPrefixThroughEvent(
        selectValidatedRuntimeEventPrefix(input.store.readAll()),
        route.admissionEventRef,
      )
    : null;
  const progressConsumed = values.stoppedProgresses === undefined ||
    prefix !== null && values.stoppedProgresses.every((progress) => {
      const frontier = projectDeclaredCRetryFrontier(
        prefix,
        input.graph,
        input.traversalStop.cursor,
        input.graphFunction,
        progress.retryPath.length,
      );
      return frontier?.state === "progress_consumed" &&
        sameCanonical(frontier.consumed.progress, progress);
    });
  if (
    route.kind !== "admitted_traversal_route" ||
    !progressConsumed ||
    (input.terminalMode !== "return_to_parent" &&
      route.runStoppedEventRef === null)
  ) {
    const diagnostic = route.kind === "admitted_traversal_route"
      ? "diagnostic://abiogenesis/hog/run-stop-absent@5"
      : `diagnostic://abiogenesis/hog/${route.code}@5`;
    return transitionFailure(
      input,
      cCall,
      values.resultRef,
      values.judgmentRef,
      diagnostic,
      "blocked-route-admission-refusal",
      route as unknown as JsonValue,
      values.stoppedProgresses?.at(-1)?.admissionEventRef ??
        values.judgmentEventRef,
    );
  }
  return completion("blocked", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: values.resultRef,
    judgmentRef: values.judgmentRef,
    resultValue: Abg.projectedCCallResultValue(input.store, {
      runId: cCall.runId,
      cCallRef: cCall.cCallRef,
      resultRef: values.resultRef,
    }),
    diagnosticRef: values.reasonRef,
  });
}

function completeFailedTraversal<Input>(
  input: CompleteExecutableTraversalInput<Input>,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  reasonRef: string,
): ExecutableTraversalCompletion {
  const deferStop = input.deferFailedRunStop === true &&
    input.traversalStop.computeRegime === "F_D" &&
    isRecord(result.value) &&
    result.value.failureClass === "implementation_exception";
  const replayState = replayRun(input);
  const proposal = Routes.proposeFailedRoute(
    input.graph,
    input.traversalStop,
    cCall,
    result,
    judgment,
    replayState,
    cCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return transitionFailure(
      input,
      cCall,
      result.resultRef,
      judgment.judgmentRef,
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      "failed-route-proposal-refusal",
      proposal as unknown as JsonValue,
      judgment.admissionEventRef,
    );
  }
  const route = Abg.admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    null,
    replayState,
    proposal,
    admissionBasis(input.clock, "failed-route"),
    { graphFunction: input.graphFunction, cCall, result, judgment },
    { terminalizeRun: !deferStop },
  );
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "failed" ||
    (!deferStop && route.runStoppedEventRef === null)
  ) {
    const diagnostic = route.kind === "admitted_traversal_route"
      ? "diagnostic://abiogenesis/hog/failed-run-stop-absent@5"
      : `diagnostic://abiogenesis/hog/${route.code}@5`;
    return transitionFailure(
      input,
      cCall,
      result.resultRef,
      judgment.judgmentRef,
      diagnostic,
      "failed-route-admission-refusal",
      route as unknown as JsonValue,
      judgment.admissionEventRef,
    );
  }
  return completion("failed", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    resultValue: result.value,
    diagnosticRef: reasonRef,
  });
}

class ExecutableTransitionRefusal extends TypeError {
  constructor(readonly diagnosticRef: string, readonly candidate: JsonValue) {
    super(`executable transition refused: ${diagnosticRef}`);
  }
}

function completeRuntimeFailureTransition<Input>(
  input: CompleteExecutableTraversalInput<Input>,
  cCall: CCall,
  source: CCallRuntimeFailureSource,
  failureCandidate: JsonValue,
  failureValueKind: string,
) {
  if (
    source.kind === "c_call_admission_rejection" &&
    input.leafPort.validateContractValue(
      cCall.outputContractRef,
      "output",
      failureCandidate,
    )
  ) {
    throw new ExecutableTransitionRefusal(
      "diagnostic://abiogenesis/hog/result-contract-rejection-not-reproduced@5",
      { cCallRef: cCall.cCallRef, contractRef: cCall.outputContractRef },
    );
  }
  const transition = AbgRetry.admitRetryRuntimeFailureTransitionInActiveTransaction(
    input.store,
    selectValidatedRuntimeEventPrefix(input.store.readAll()),
    input.executionBasis,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    source,
    failureCandidate,
    failureValueKind,
    admissionBasis(input.clock, "retry-runtime-failure-transition"),
  );
  if (transition.kind !== "retry_runtime_failure_transition_admission") {
    throw new ExecutableTransitionRefusal(
      `diagnostic://abiogenesis/hog/${transition.code}@5`,
      transition as unknown as JsonValue,
    );
  }
  if (transition.disposition === "retry") {
    if (
      transition.progress.progressClass !== "retry" ||
      transition.stoppedProgresses.length !== 0
    ) throw new TypeError("retry transition frontier is inconsistent");
    return deepFreeze({
      kind: "staged_retry_runtime_failure_transition" as const,
      transition,
    });
  }
  if (transition.progress.progressClass !== "stopped") {
    throw new TypeError("blocked transition has non-stopped progress");
  }
  const blocked = completeBlockedTraversal(input, cCall, {
    resultRef: transition.close.result.resultRef,
    judgmentRef: transition.close.judgment.judgmentRef,
    judgmentEventRef: transition.close.judgment.admissionEventRef,
    reasonRef: transition.close.judgment.reasonRef,
    stoppedProgresses: transition.stoppedProgresses,
  });
  if (blocked.disposition !== "blocked") {
    throw new ExecutableTransitionRefusal(
      blocked.diagnosticRef ??
        "diagnostic://abiogenesis/hog/blocked-route-refusal@5",
      blocked as unknown as JsonValue,
    );
  }
  return blocked;
}

interface AdmittedLeafOutcome {
  readonly kind: "admitted_leaf_outcome";
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
}

function rejectedLeafOutcome(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  cCall: CCall,
  rejection: Abg.CCallAdmissionRejection,
  stage: string,
): ExecutableTraversalCompletion {
  const rejected = Abg.completeRejectedCCall(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    rejection,
    admissionBasis(input.clock, stage),
  );
  return completeBlockedTraversal(input, cCall, {
    resultRef: rejected.refusalResultRef,
    judgmentRef: rejected.rejectionJudgmentRef,
    judgmentEventRef: rejected.judgmentEventRef,
    reasonRef: rejection.diagnosticRef,
  });
}

function admitLeafOutcome(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  cCall: CCall,
  invocation: ClosedLeafOwnerReceipt,
  failureValueKind: string,
  resultValueKind: string,
) {
  const regime = input.traversalStop.computeRegime;
  const candidate = invocation.candidate;
  const exchange = invocation.receipt?.computeRegime === "F_P"
    ? invocation.receipt.actorProcessExchange
    : null;
  const request = exchange?.request ?? null;
  const observation = exchange?.observation ?? null;
  const probabilistic = regime === "F_P" &&
      request !== null &&
      observation !== null &&
      input.actorRuntimeBinding !== undefined
    ? Abg.admitProbabilisticResultCandidate({
        artifactTruth: input.actorRuntimeBinding.artifactTruth,
        executionBasis: input.executionBasis,
        implementationSet: input.implementationSet,
        leafPort: input.leafPort,
        occurrence: {
          cCallRef: cCall.cCallRef,
          runId: cCall.runId,
          graphCallId: cCall.graphCallId,
          frameId: cCall.frameId,
          programLocusRef: cCall.programLocusRef,
          taskOrdinal: cCall.taskOrdinal,
          attempt: cCall.attempt,
        },
        prefix: selectValidatedRuntimeEventPrefix(input.store.readAll()),
        resolution: input.implementationResolution,
        input: input.input,
        request,
        observation,
      })
    : null;
  const evidenceCandidates: readonly Abg.CCallEvidenceCandidate[] =
    regime === "F_P"
      ? request === null || observation === null ||
          (observation.disposition === "success" &&
            probabilistic?.kind !==
              "contract_admitted_probabilistic_result_candidate")
        ? []
        : [Abg.deriveProbabilisticTransportEvidence(
            cCall,
            request,
            observation,
            probabilistic?.kind ===
                "contract_admitted_probabilistic_result_candidate"
              ? probabilistic
              : null,
            candidate.resultCandidate,
            invocation.workerContracts!.instructionContractRef,
            invocation.workerContracts!.resultContractRef,
          )]
      : candidate.evidenceCandidates;
  const evidence: Abg.AdmittedCCallEvidence[] = [];
  for (const row of evidenceCandidates) {
    const admitted = Abg.admitEvidence(
      input.store,
      input.graph,
      input.graphFunction,
      input.traversalStop.cursor,
      cCall,
      row,
      cCall.evidenceContractRef,
      input.inputDigest,
      admissionBasis(input.clock, "evidence"),
      invocation.workerContracts?.instructionContractRef,
      invocation.workerContracts?.resultContractRef,
      regime === "F_P" && request !== null && observation !== null
        ? {
            request,
            observation,
            admittedResultCarrier:
              probabilistic?.kind ===
                  "contract_admitted_probabilistic_result_candidate"
                ? probabilistic
                : null,
          }
        : null,
    );
    if (admitted.kind === "c_call_admission_rejection") {
      return rejectedLeafOutcome(input, cCall, admitted, "evidence-rejection");
    }
    evidence.push(admitted);
  }
  const retrySource = evidence.length === 1 &&
      evidence[0]!.evidenceClass === "probabilistic_transport" &&
      evidence[0]!.transportDisposition === "failure" &&
      typeof evidence[0]!.transportFailureClass === "string" &&
      Abg.WORKER_TRANSPORT_FAILURE_CLASS_VALUES.includes(
        evidence[0]!.transportFailureClass as
          (typeof Abg.WORKER_TRANSPORT_FAILURE_CLASS_VALUES)[number],
      )
    ? evidence[0]!
    : null;
  if (
    candidate.disposition === "failure" &&
    cCall.retryPath.length > 0 &&
    retrySource !== null
  ) {
    return completeRuntimeFailureTransition(
      input,
      cCall,
      retrySource,
      candidate.resultCandidate,
      failureValueKind,
    );
  }
  const result = Abg.admitResult(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    candidate.resultCandidate,
    candidate.disposition,
    candidate.disposition === "success"
      ? cCall.outputContractRef
      : cCall.failureContractRef,
    candidate.disposition === "success" ? resultValueKind : failureValueKind,
    candidate.disposition === "success"
      ? (value) =>
          (regime !== "F_P" ||
            probabilistic?.kind ===
              "contract_admitted_probabilistic_result_candidate") &&
          input.leafPort.validateContractValue(
            cCall.outputContractRef,
            "output",
            value,
          ) &&
          input.leafPort.validateResultEvidenceLineage(
            cCall.outputContractRef,
            value as Readonly<Record<string, JsonValue>>,
            evidence.map((row) => deepFreeze({
              cCallRef: cCall.cCallRef,
              cCallAttempt: cCall.attempt,
              evidenceRef: row.evidenceRef,
              evidenceDigest: row.evidenceDigest,
              evidenceClass: row.evidenceClass,
              outputDigest: row.outputDigest,
              transportDigest: row.evidenceClass === "probabilistic_transport" &&
                  "transportDigest" in row &&
                  typeof row.transportDigest === "string"
                ? row.transportDigest
                : null,
            })),
          )
      : (value) => isRecord(value) &&
          value.kind === failureValueKind &&
          value.schemaVersion === "5.0.0" &&
          value.diagnosticRef === candidate.diagnosticRef,
    evidence,
    admissionBasis(input.clock, "result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    if (
      candidate.disposition === "success" &&
      cCall.retryPath.length > 0 &&
      !input.leafPort.validateContractValue(
        cCall.outputContractRef,
        "output",
        candidate.resultCandidate,
      )
    ) {
      return completeRuntimeFailureTransition(
        input,
        cCall,
        result,
        candidate.resultCandidate,
        failureValueKind,
      );
    }
    return rejectedLeafOutcome(input, cCall, result, "result-rejection");
  }
  const relation = input.leafPort.resolveJudgmentRelation(
    cCall.judgmentPredicateRef,
  )!;
  const replayState = Abg.replay(input.store, { runId: cCall.runId });
  const proposal = candidate.disposition === "success"
    ? proposeJudgment(
        cCall,
        result,
        replayState,
        input.input,
        relation,
        cCall.judgmentContractRef,
      )
    : proposeFailureJudgment(
        cCall,
        result,
        replayState,
        candidate.diagnosticRef,
        cCall.judgmentContractRef,
      );
  const judgment = Abg.admitJudgment(
    input.store,
    input.graph,
    input.graphFunction,
    input.traversalStop.cursor,
    cCall,
    result,
    proposal,
    replayState,
    admissionBasis(input.clock, "judgment"),
  );
  return judgment.kind === "c_call_admission_rejection"
    ? rejectedLeafOutcome(input, cCall, judgment, "judgment-rejection")
    : deepFreeze({
        kind: "admitted_leaf_outcome" as const,
        cCall,
        result,
        judgment,
      });
}

function leafRouteFailure(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  outcome: AdmittedLeafOutcome,
  stage: string,
  code: string,
  candidate: JsonValue,
  causationEventRef = outcome.judgment.admissionEventRef,
): ExecutableTraversalCompletion {
  const diagnosticRef = `diagnostic://abiogenesis/hog/${code}@5`;
  return transitionFailure(
    input,
    outcome.cCall,
    outcome.result.resultRef,
    outcome.judgment.judgmentRef,
    diagnosticRef,
    stage,
    candidate,
    causationEventRef,
  );
}

function completeSpecialAdmittedLeaf(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  outcome: AdmittedLeafOutcome,
): ExecutableTraversalCompletion | null {
  const { cCall, result, judgment } = outcome;
  const replayState = Abg.replay(input.store, { runId: cCall.runId });
  if (
    isRecord(result.value) &&
    result.value.kind === "next_action_projection" &&
    result.value.disposition === "no_action" &&
    [
      "gap_stop",
      "reprice_required",
      "repair",
      "inspect_runtime_archive",
      "reprice",
      "escalate",
    ].includes(String(result.value.noActionDisposition))
  ) {
    const proposal = Routes.proposeGapStopRoute(
      input.graph,
      input.traversalStop,
      cCall,
      result,
      judgment,
      replayState,
      input.closureContract.transitionContractRef,
    );
    if (proposal.kind !== "traversal_route_candidate") {
      return leafRouteFailure(
        input,
        outcome,
        "gap-stop-proposal-refusal",
        proposal.code,
        proposal as unknown as JsonValue,
      );
    }
    const route = Abg.admitRoute(
      input.store,
      input.executionBasis,
      input.graph,
      input.traversalStop.cursor,
      null,
      replayState,
      proposal,
      admissionBasis(input.clock, "gap-stop-route"),
      { graphFunction: input.graphFunction, cCall, result, judgment },
    );
    if (
      route.kind !== "admitted_traversal_route" ||
      route.routeKind !== "gap_stop" ||
      route.runStoppedEventRef === null
    ) {
      return leafRouteFailure(
        input,
        outcome,
        "gap-stop-admission-refusal",
        route.kind === "admitted_traversal_route"
          ? "gap-stop-not-terminalized"
          : route.code,
        route as unknown as JsonValue,
      );
    }
    return completion("gap_stop", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
    });
  }
  const value = result.value;
  const projection = isRecord(value) &&
      value.kind === "graph_span_selection" &&
      value.schemaVersion === "5.0.0" &&
      value.disposition === "re_enter" &&
      typeof value.projectionRef === "string" &&
      typeof value.projectionDigest === "string" &&
      typeof value.applicationRef === "string" &&
      typeof value.targetInputRef === "string" &&
      typeof value.targetInputDigest === "string" &&
      isRecord(value.targetInput)
    ? value as unknown as Abg.GraphSpanReentryProjection
    : null;
  if (projection === null) return null;
  const application = input.graph.template.applications.find(
    (candidate) => candidate.relationKind === "re_enter" &&
      candidate.applicationRef === projection.applicationRef,
  );
  if (application?.relationKind !== "re_enter") {
    return leafRouteFailure(
      input,
      outcome,
      "graph-span-reentry-derivation-refusal",
      "graph_span_reentry_not_declared",
      value,
    );
  }
  const target = deriveGraphSpanReentryCursor(
    input.graph,
    input.traversalStop.cursor,
    application,
    {
      inputRef: projection.targetInputRef,
      inputDigest: projection.targetInputDigest,
    },
  );
  if (target.kind === "traversal_refusal") {
    return leafRouteFailure(
      input,
      outcome,
      "graph-span-reentry-derivation-refusal",
      target.code,
      value,
    );
  }
  const proposal = Routes.proposeGraphSpanReentryRoute(
    input.graph,
    input.traversalStop.cursor,
    target,
    cCall,
    result,
    judgment,
    replayState,
    input.closureContract.transitionContractRef,
    projection,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return leafRouteFailure(
      input,
      outcome,
      "graph-span-reentry-proposal-refusal",
      proposal.code,
      proposal as unknown as JsonValue,
    );
  }
  const route = Abg.admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.traversalStop.cursor,
    target,
    replayState,
    proposal,
    admissionBasis(input.clock, "graph-span-reentry-route"),
    { graphFunction: input.graphFunction, cCall, result, judgment },
  );
  if (route.kind !== "admitted_traversal_route") {
    return leafRouteFailure(
      input,
      outcome,
      "graph-span-reentry-admission-refusal",
      route.code,
      route as unknown as JsonValue,
    );
  }
  const nextCursor = applyAdmittedRoute(
    input.traversalStop.cursor,
    target,
    "re_enter",
    route,
  );
  if (nextCursor.kind === "traversal_refusal") {
    return leafRouteFailure(
      input,
      outcome,
      "graph-span-reentry-application-refusal",
      nextCursor.code,
      nextCursor as unknown as JsonValue,
      route.admissionEventRef,
    );
  }
  return completion("advanced", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    nextCursor,
    resultValue: projection.targetInput,
    continuationKind: "re_enter",
    nextInputContractRef: application.outputContractRef,
  });
}

function completeAdmittedLeaf(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  outcome: AdmittedLeafOutcome,
  candidate: Readonly<LeafRealizationCandidate>,
): ExecutableTraversalCompletion {
  const { cCall, result, judgment } = outcome;
  if (candidate.disposition === "failure") {
    return completeFailedTraversal(
      input,
      cCall,
      result,
      judgment,
      candidate.diagnosticRef,
    );
  }
  if (judgment.judgment !== "advance") {
    return completeBlockedTraversal(input, cCall, {
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      judgmentEventRef: judgment.admissionEventRef,
      reasonRef: judgment.reasonRef,
    });
  }
  const special = completeSpecialAdmittedLeaf(input, outcome);
  if (special !== null) return special;
  const target = deriveCompletedTraversalCursor(
    input.graph,
    input.traversalStop.cursor,
    { inputRef: result.resultRef, inputDigest: result.valueDigest },
  );
  if (target?.kind === "traversal_refusal") {
    return leafRouteFailure(
      input,
      outcome,
      "continuation-refusal",
      target.code,
      target as unknown as JsonValue,
    );
  }
  if (input.terminalMode === "return_to_application") {
    return completion("application_ready", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      resultValue: result.value,
    });
  }
  const admitted = admitSuccessfulRetryExitRoute({
    store: input.store,
    executionBasis: input.executionBasis,
    graphFunction: input.graphFunction,
    graph: input.graph,
    sourceCursor: input.traversalStop.cursor,
    targetCursor: target,
    variant: {
      completionClass: "judged_success",
      cCall,
      result,
      judgment,
      transitionContractRef: input.closureContract.transitionContractRef,
    },
    basis: admissionBasis(input.clock, "successful-retry-exit"),
  });
  if (admitted.kind !== "successful_retry_exit_route_admission") {
    return leafRouteFailure(
      input,
      outcome,
      "successful-route-refusal",
      admitted.code,
      admitted.candidate,
    );
  }
  const route = admitted.route;
  if (route.routeKind === "advance") {
    if (target === null) {
      return leafRouteFailure(
        input,
        outcome,
        "advance-target-absent",
        "advance-target-absent",
        route as unknown as JsonValue,
      );
    }
    const nextCursor = applyAdmittedRoute(
      input.traversalStop.cursor,
      target,
      "advance",
      route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      return leafRouteFailure(
        input,
        outcome,
        "route-application-refusal",
        nextCursor.code,
        nextCursor as unknown as JsonValue,
      );
    }
    return completion("advanced", replayRun(input), {
      cCallRef: cCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue: result.value,
      continuationKind: "advance",
      nextInputContractRef: cCall.outputContractRef,
    });
  }
  if (route.routeKind !== "terminal") {
    return leafRouteFailure(
      input,
      outcome,
      "unexpected-route",
      "unexpected-judged-route",
      route as unknown as JsonValue,
    );
  }
  const closureBasis = admissionBasis(
    input.clock,
    input.terminalMode === "return_to_parent" ? "child-closure" : "closure",
  );
  const closure = input.terminalMode === "return_to_parent"
    ? Abg.admitChildClosure(
        input.store,
        selectHeldEventStoreDurablePrefix(input.store),
        input.openedTraversalScope,
        cCall,
        result,
        judgment,
        route,
        input.closureContract,
        closureBasis,
      )
    : Abg.admitClosure(
        input.store,
        selectHeldEventStoreDurablePrefix(input.store),
        cCall,
        result,
        judgment,
        route,
        input.closureContract,
        closureBasis,
      );
  if (
    closure.kind !== "closure_admission" &&
    closure.kind !== "child_closure_admission"
  ) {
    return leafRouteFailure(
      input,
      outcome,
      "closure-refusal",
      closure.code,
      closure as unknown as JsonValue,
    );
  }
  return completion("closed", replayRun(input), {
    cCallRef: cCall.cCallRef,
    resultRef: result.resultRef,
    judgmentRef: judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: result.value,
  });
}

function admitProjectedRetryResume(input: Readonly<{
  store: AbgEventStore;
  predecessorPrefix: DurablePrefixCoordinate;
  retry: AbgRetry.ExecutableRetryInput;
  executionBasis: ExecutionBasis;
  openedTraversalScope: OpenedTraversalScope;
  program: Readonly<GtlProgram>;
  graphFunction: Readonly<GraphFunction>;
  graph: Readonly<GtlGraph>;
  graphValidation: GraphValidation;
  clock: ExecutableTraversalClock;
}>): ProjectedRetryResumeSuccess {
  const fresh = AbgRetry.projectExecutableRetryInput({
    prefix: input.predecessorPrefix,
    selector: input.retry.selector,
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
  });
  if (fresh.kind !== "executable_retry_input" || !sameCanonical(fresh, input.retry)) {
    throw new TypeError("retry input differs from its exact ABG projection");
  }
  AbgRetry.assertFullRetryAttemptFrontier(fresh.retryFrontier);
  const events = readRuntimeEventsAtDurablePrefix(input.predecessorPrefix);
  const authorityPrefix = selectValidatedRuntimeEventPrefix(events);
  const prefix = selectValidatedRuntimeEventPrefix(events, {
    runId: fresh.selector.runId,
  });
  const basis = rehydrateExecutionBasisAtPrefix(prefix, fresh.executionBasisRef);
  const scope = Abg.rehydrateOpenedTraversalScopeAtPrefix(
    prefix,
    input.openedTraversalScope as unknown as Readonly<Record<string, JsonValue>>,
  );
  if (
    basis === null ||
    scope === null ||
    !sameCanonical(basis, input.executionBasis) ||
    !sameCanonical(scope, input.openedTraversalScope) ||
    input.program.programRef !== fresh.programRef ||
    canonicalDigest(input.program) !== fresh.programDigest ||
    input.graphFunction.name !== fresh.graphFunctionRef ||
    canonicalDigest(input.graphFunction) !== fresh.graphFunctionDigest ||
    input.graph.materializationRef !== fresh.graphRef ||
    input.graph.materializationDigest !== fresh.graphDigest ||
    input.graphValidation.validationRef !== basis.graphValidationRef
  ) throw new TypeError("retry runtime differs from its admitted basis");
  const source = rehydrateHeldInteractionCursor(prefix, fresh.sourceCursor);
  if (source === null) throw new TypeError("retry source cursor is not admitted");
  const target = deriveRetryTraversalCursor(input.graph, source, {
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
  });
  if (
    target.kind !== "traversal_cursor" ||
    target.attempt !== fresh.nextAttempt ||
    !sameCanonical(target.retryPath, fresh.nextRetryPath)
  ) throw new TypeError("HoG could not derive the exact retry successor");
  const replayState = Abg.replayValidatedRuntimeEventPrefix(
    prefix,
    authorityPrefix,
  );
  const proposal = Routes.proposeRetryRoute(
    input.graph,
    source,
    target,
    fresh.cCall,
    fresh.progress,
    replayState,
    fresh.cCall.transitionContractRef,
  );
  const declaration = AbgRetry.projectDeclaredRetryAttemptCoordinates(
    input.graph,
    target,
  );
  if (
    proposal.kind !== "traversal_route_candidate" ||
    declaration === null ||
    declaration.inputCarrierRef !== fresh.inputContractRef
  ) throw new TypeError("retry route or attempt coordinate was refused");
  const attemptBody = {
    attemptManifestRef: AbgRetry.deriveRetryAttemptManifestRef({
      retryBoundaryRef: declaration.retryBoundaryRef,
      executionBasisRef: target.executionBasisRef,
      inputContractRef: declaration.inputCarrierRef,
      inputRef: target.inputRef,
      inputDigest: target.inputDigest,
      attempt: target.attempt,
      retryPath: target.retryPath,
    }),
    retryBoundaryRef: declaration.retryBoundaryRef,
    retryTermPath: declaration.retryTermPath,
    wrappedTermPath: declaration.wrappedTermPath,
    taskOrdinal: declaration.taskOrdinal,
    attempt: target.attempt,
    retryPath: target.retryPath,
    budget: declaration.budget,
    retryableFailureClasses: Abg.WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
    priorJudgmentRef: proposal.judgmentRef,
    priorRouteRef: proposal.candidateRef,
    inputRef: target.inputRef,
    inputDigest: target.inputDigest,
    inputContractRef: declaration.inputCarrierRef,
    inputValue: fresh.inputValue,
  };
  const attemptDigest = sha256Canonical(attemptBody as unknown as JsonValue);
  const attemptRef =
    `retry-attempt://abiogenesis/${attemptDigest.slice("sha256:".length)}`;
  assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
  const transaction = admitRuntimeEventTransactionAtExpectedPrefix(
    input.store,
    input.store.digest(),
    () => {
      const route = Abg.admitRoute(
        input.store,
        input.executionBasis,
        input.graph,
        source,
        target,
        replayState,
        proposal,
        admissionBasis(input.clock, "route"),
        {
          graphFunction: input.graphFunction,
          cCall: fresh.cCall,
          progress: fresh.progress,
        },
      );
      if (
        route.kind !== "admitted_traversal_route" ||
        route.routeRef !== proposal.candidateRef ||
        route.routeDigest !== proposal.candidateDigest
      ) throw new TypeError("retry route admission differs from proposal");
      const cursor = applyAdmittedRoute(source, target, "retry", route);
      if (cursor.kind !== "traversal_cursor" || !sameCanonical(cursor, target)) {
        throw new TypeError("retry route application differs from target");
      }
      const attempt = AbgRetry.admitRetryAttempt(
        input.store,
        input.executionBasis,
        input.graph,
        input.graphFunction,
        cursor,
        fresh.inputValue,
        route.admissionEventRef,
        admissionBasis(input.clock, "attempt"),
      );
      if (
        attempt.kind !== "retry_attempt_admission" ||
        attempt.attemptRef !== attemptRef ||
        attempt.attemptDigest !== attemptDigest
      ) throw new TypeError("retry attempt differs from declared GTL");
      const projected = AbgRetry.projectRetryAttempt(
        selectValidatedRuntimeEventPrefix(input.store.readAll(), {
          runId: fresh.selector.runId,
        }),
        input.graph,
        attempt.admissionEventRef,
      );
      if (!sameCanonical(projected, attempt)) {
        throw new TypeError("retry attempt cannot be reprojected exactly");
      }
      return { route, cursor, attempt };
    },
  );
  if (transaction.successorPrefix === null) {
    throw new TypeError("retry admission produced no successor prefix");
  }
  return deepFreeze({
    kind: "projected_retry_resume" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "resumed" as const,
    executableRetryInputRef: fresh.projectionRef,
    executableRetryInputDigest: fresh.projectionDigest,
    retryFrontierRef: fresh.retryFrontier.frontierRef,
    retryFrontierDigest: fresh.retryFrontier.frontierDigest,
    selectedFrontierRowRef: fresh.selectedFrontierRowRef,
    progressEventRef: fresh.progressEventRef,
    routeAdmissionEventRef: transaction.value.route.admissionEventRef,
    routeRef: transaction.value.route.routeRef,
    routeDigest: transaction.value.route.routeDigest,
    nextCursor: transaction.value.cursor,
    retryAttemptAdmissionEventRef: transaction.value.attempt.admissionEventRef,
    retryAttemptRef: transaction.value.attempt.attemptRef,
    retryAttemptDigest: transaction.value.attempt.attemptDigest,
    nextAttempt: fresh.nextAttempt,
    inputContractRef: fresh.inputContractRef,
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
    inputValue: fresh.inputValue,
    successorPrefix: transaction.successorPrefix,
  });
}

function leafConsequenceComplete(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
  staged: ExecutableTraversalCompletion,
): boolean {
  const replayState = replayRun(input);
  const call = replayState.cCalls.find((row) => row.cCallRef === staged.cCallRef);
  const route = replayState.routes.find((row) =>
    row.cCallRef === staged.cCallRef && row.judgmentRef === staged.judgmentRef
  );
  const judged = call?.status === "judged" &&
    call.resultRef === staged.resultRef &&
    call.judgmentRef === staged.judgmentRef;
  switch (staged.disposition) {
    case "application_ready": return judged && route === undefined;
    case "advanced": return judged && route?.routeKind === "advance";
    case "closed": return judged && route?.routeKind === "terminal" &&
      staged.closureRef !== null &&
      (input.terminalMode === "return_to_parent" ||
        replayState.runClosedEventRef !== null);
    case "blocked": return judged && route?.routeKind === "blocked" &&
      (input.terminalMode === "return_to_parent" ||
        replayState.runStoppedEventRef !== null);
    case "failed": return judged && route?.routeKind === "failed" &&
      (input.deferFailedRunStop === true || replayState.runStoppedEventRef !== null);
    case "gap_stop": return judged && route?.routeKind === "gap_stop" &&
      replayState.runStoppedEventRef !== null;
    default: return false;
  }
}

async function executeLeafAtLocus(
  input: CompleteExecutableTraversalInput<Readonly<Record<string, JsonValue>>>,
) {
  const leafFailure = (
    stage: string,
    diagnosticRef: string,
    candidate: JsonValue,
  ) => {
    Abg.admitRuntimeFailure(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      "c_call_open",
      candidate,
      diagnosticRef,
      admissionBasis(input.clock, stage),
    );
    return completion("failed", replayRun(input), { diagnosticRef });
  };
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !==
      input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !==
      input.implementationSet.implementationSetDigest ||
    input.leafPort.publicationDigest !== input.implementationSet.publicationDigest
  ) {
    return leafFailure(
      "leaf-port-refusal",
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
      { implementationSetRef: input.implementationSet.implementationSetRef },
    );
  }
  const failureKind = input.leafPort.contractValueKind(
    input.traversalStop.failureContractRef,
    "failure",
  );
  const outputKind = input.leafPort.contractValueKind(
    input.traversalStop.outputContractRef,
    "output",
  );
  const relation = input.leafPort.resolveJudgmentRelation(
    input.traversalStop.judgmentPredicateRef,
  );
  if (failureKind === null || outputKind === null || relation === null) {
    return leafFailure(
      "leaf-contract-refusal",
      "diagnostic://abiogenesis/implementation/result-contract-absent@5",
      input.traversalStop as unknown as JsonValue,
    );
  }
  if (
    sha256Canonical(input.input) !== input.inputDigest ||
    input.inputDigest !== input.traversalStop.cursor.inputDigest
  ) {
    return leafFailure(
      "input-basis-refusal",
      "diagnostic://abiogenesis/hog/input-basis-mismatch@5",
      { suppliedInputDigest: input.inputDigest },
    );
  }
  const opened = Abg.openCCall(
    input.store,
    input.executionBasis,
    input.openedTraversalScope,
    input.program,
    input.graphFunction,
    input.graph,
    input.traversalStop,
    input.implementationSet,
    input.implementationResolution,
    admissionBasis(input.clock, "c-call-open"),
  );
  if (opened.kind !== "c_call_admission") {
    return leafFailure(
      "c-call-open-refusal",
      `diagnostic://abiogenesis/hog/${opened.code}@5`,
      opened as unknown as JsonValue,
    );
  }
  const bindProbabilisticEffects =
    input.traversalStop.computeRegime === "F_P" &&
      input.actorRuntimeBinding !== undefined
      ? (workerContracts: Readonly<{
          instructionContractRef: string;
          resultContractRef: string;
        }>) => Abg.bindActorProcessLeafEffectPort({
          store: input.store,
          executionBasis: input.executionBasis,
          scope: input.openedTraversalScope,
          cCall: opened.cCall,
          inputDigest: input.inputDigest,
          workerContracts,
          runtime: input.actorRuntimeBinding!,
          basis: admissionBasis(input.clock, "actor-process"),
        })
      : null;
  const invocation = await input.leafPort.invoke({
    resolution: input.implementationResolution,
    input: input.input,
    inputDigest: input.inputDigest,
    failureContractRef: input.traversalStop.failureContractRef,
    bindProbabilisticEffects,
  });
  if (invocation.kind === "leaf_invocation_owner_refusal") {
    return leafFailure(
      "leaf-owner-refusal",
      invocation.diagnosticRef,
      invocation as unknown as JsonValue,
    );
  }
  const prefix = selectValidatedRuntimeEventPrefix(input.store.readAll());
  if (input.store.configuredDurableLogPath() !== null) {
    assertHeldEventStoreAtRuntimeEventPrefix(input.store, prefix.events);
  }
  const transaction = admitRuntimeEventTransactionAtExpectedPrefix(
    input.store,
    sha256Canonical(prefix.events as unknown as JsonValue),
    () => {
      const admitted = admitLeafOutcome(
        input,
        opened.cCall,
        invocation,
        failureKind,
        outputKind,
      );
      if (admitted.kind === "staged_retry_runtime_failure_transition") {
        return admitted;
      }
      const staged = admitted.kind === "admitted_leaf_outcome"
        ? completeAdmittedLeaf(input, admitted, invocation.candidate)
        : admitted;
      if (!leafConsequenceComplete(input, staged)) {
        throw new TypeError("executable transition consequence is incomplete");
      }
      return staged;
    },
  );
  if (transaction.value.kind !== "staged_retry_runtime_failure_transition") {
    return transaction.value;
  }
  const transition = transaction.value.transition;
  if (
    transaction.successorPrefix === null ||
    transition.disposition !== "retry" ||
    transition.progress.progressClass !== "retry" ||
    transition.stoppedProgresses.length !== 0
  ) throw new TypeError("retry transition has no exact successor prefix");
  return deepFreeze({
    kind: transition.kind,
    schemaVersion: transition.schemaVersion,
    disposition: "retry" as const,
    close: transition.close,
    progress: transition.progress,
    stoppedProgresses: Object.freeze([]) as readonly [],
    eligibility: transition.eligibility,
    successorPrefix: transaction.successorPrefix,
  });
}

function recursionApplication(
  graph: Readonly<GtlGraph>,
  compositionRef: string | null,
): Readonly<RecurseApplication> | null {
  if (compositionRef === null) return null;
  const application = graph.template.applications.find(
    (candidate) => candidate.applicationRef === compositionRef,
  );
  return application?.relationKind === "recurse" ? application : null;
}

function beginExecutableLocus(input: Readonly<{
  runtime: ExecuteGraphTraversalCommonInput;
  stop: Extract<TraversalStopRef, { readonly stopClass: "executable" }>;
  value: Readonly<Record<string, JsonValue>>;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  ordinal: number;
  fail: TraversalLocusFailure;
}>): Effect.Effect<ExecutableLocusStep> {
  return Effect.gen(function* () {
    const { runtime, stop, ordinal } = input;
    const resolution = selectAdmittedImplementationResolution(
      runtime.implementationSet,
      {
        graphFunctionRef: runtime.graph.graphFunctionRef,
        nodeRef: stop.nodeRef,
        programLocusRef: stop.programLocusRef,
        implementationBindingRef: stop.implementationBindingRef,
      },
    );
    const outputKind = runtime.leafPort.contractValueKind(
      stop.outputContractRef,
      "output",
    );
    if (resolution === null || outputKind === null) {
      return input.fail(
        `resolution-${ordinal}`,
        "diagnostic://abiogenesis/implementation-resolution/admitted-row-absent@5",
        stop as unknown as JsonValue,
      );
    }
    const application = recursionApplication(runtime.graph, stop.compositionRef);
    const traversalInput: CompleteExecutableTraversalInput<
      Readonly<Record<string, JsonValue>>
    > = {
      store: runtime.store,
      executionBasis: runtime.executionBasis,
      openedTraversalScope: runtime.openedTraversalScope,
      program: runtime.program,
      graphFunction: runtime.graphFunction,
      graph: runtime.graph,
      traversalStop: stop,
      implementationSet: runtime.implementationSet,
      implementationResolution: resolution,
      leafPort: runtime.leafPort,
      input: input.value,
      inputDigest: stop.cursor.inputDigest,
      closureContract: runtime.closureContract,
      actorRuntimeBinding: runtime.actorRuntimeBinding,
      ...(runtime.deferFailedRunStop === true
        ? { deferFailedRunStop: true }
        : {}),
      terminalMode: application === null
        ? runtime.terminalMode ?? "close_run"
        : "return_to_application",
      ...(application === null
        ? {}
        : { applicationCompletionMode: runtime.terminalMode ?? "close_run" }),
      clock: {
        eventTime: runtime.eventTime,
        correlationId: `${runtime.correlationId}/leaf/${ordinal}`,
      },
    };
    const leafResult = yield* Effect.promise(() => executeLeafAtLocus(traversalInput));
    if (leafResult.kind === "retry_runtime_failure_transition_admission") {
      const retry = AbgRetry.projectExecutableRetryInput({
        prefix: leafResult.successorPrefix,
        selector: {
          kind: "retry_frontier_selector",
          schemaVersion: "5.0.0",
          runId: runtime.openedTraversalScope.runId,
          graphCallId: runtime.openedTraversalScope.graphCallId,
          frameId: runtime.openedTraversalScope.frameId,
          retryBoundaryRef: leafResult.progress.retryBoundaryRef,
          retryProgressRef: leafResult.progress.progressRef,
        },
        program: runtime.program,
        graphFunction: runtime.graphFunction,
        graph: runtime.graph,
      });
      if (retry.kind !== "executable_retry_input") {
        throw new TypeError(`projected retry refused: ${retry.code}`);
      }
      const resumed = admitProjectedRetryResume({
        store: runtime.store,
        predecessorPrefix: leafResult.successorPrefix,
        retry,
        executionBasis: runtime.executionBasis,
        openedTraversalScope: runtime.openedTraversalScope,
        program: runtime.program,
        graphFunction: runtime.graphFunction,
        graph: runtime.graph,
        graphValidation: runtime.graphValidation,
        clock: {
          eventTime: runtime.eventTime,
          correlationId: `${runtime.correlationId}/retry/${retry.nextAttempt}`,
        },
      });
      return {
        kind: "retry_request" as const,
        resume: resumed,
        correlationId:
          `${runtime.correlationId}/retry/${retry.nextAttempt}/execute`,
      };
    }
    let completed = leafResult;
    if (application !== null && completed.disposition === "application_ready") {
      const recursion = yield* beginRecursionApplication({
        parent: runtime,
        traversalInput,
        application,
        completion: completed,
        graphEntryInput: input.graphEntryInput,
        graphEntryInputDigest: input.graphEntryInputDigest,
        leafOrdinal: ordinal,
        fail: input.fail,
      });
      if (recursion.kind === "recursion_child_request") {
        return {
          ...recursion,
          outputValueKind: outputKind,
          outputContractRef: stop.outputContractRef,
        };
      }
      completed = recursion.completion;
    }
    return {
      kind: "locus_evaluation" as const,
      evaluation: {
        completion: completed,
        outputValueKind: outputKind,
        outputContractRef: stop.outputContractRef,
      },
    };
  });
}

interface DeferredApplicationState {
  readonly input: CompleteExecutableTraversalInput<unknown>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly targetCursor: TraversalCursor | null;
}

function reconstructDeferredApplicationState(
  input: RestoreDeferredRecursionInput,
): DeferredApplicationState | null {
  const traversal = input.traversalInput;
  const outcome = Abg.projectAdmittedLeafCCallOutcome(traversal.store, {
    executionBasis: traversal.executionBasis,
    implementationSet: traversal.implementationSet,
    openedTraversalScope: traversal.openedTraversalScope,
    graph: traversal.graph,
    traversalStop: traversal.traversalStop,
    implementationResolution: traversal.implementationResolution,
    cCallRef: input.cCallRef,
    resultRef: input.resultRef,
    judgmentRef: input.judgmentRef,
  });
  if (outcome === null) return null;
  const targetCursor = deriveCompletedTraversalCursor(
    traversal.graph,
    traversal.traversalStop.cursor,
    {
      inputRef: outcome.result.resultRef,
      inputDigest: outcome.result.valueDigest,
    },
  );
  if (
    targetCursor?.kind === "traversal_refusal" ||
    traversal.terminalMode !== "return_to_application" ||
    traversal.graph.template.applications.find((candidate) =>
      candidate.applicationRef === input.application.applicationRef
    ) !== input.application ||
    outcome.cCall.compositionRef !== input.application.applicationRef ||
    outcome.cCall.basisId !== traversal.executionBasis.basisRef ||
    outcome.cCall.graphCallId !== traversal.openedTraversalScope.graphCallId ||
    outcome.cCall.frameId !== traversal.openedTraversalScope.frameId ||
    outcome.cCall.programLocusRef !== traversal.traversalStop.programLocusRef ||
    sha256Canonical(traversal.input as unknown as JsonValue) !==
      traversal.inputDigest ||
    traversal.inputDigest !== traversal.traversalStop.cursor.inputDigest
  ) return null;
  return {
    input: traversal,
    cCall: outcome.cCall,
    result: outcome.result,
    judgment: outcome.judgment,
    targetCursor,
  };
}

function applicationReadyCompletion(
  state: DeferredApplicationState,
): ExecutableTraversalCompletion | null {
  if (!Abg.hasCurrentDeferredApplicationAuthority(state.input.store, {
    runId: state.cCall.runId,
    frameId: state.cCall.frameId,
    sourceCursorRef: state.input.traversalStop.cursor.cursorRef,
    judgmentRef: state.judgment.judgmentRef,
  })) return null;
  const projected = Abg.projectCurrentDeferredApplication(state.input.store, {
    runId: state.cCall.runId,
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
  });
  return projected === null ? null : completion(
    "application_ready",
    projected.replayState,
    {
      cCallRef: projected.cCallRef,
      resultRef: projected.resultRef,
      judgmentRef: projected.judgmentRef,
      resultValue: projected.resultValue,
    },
  );
}

function restoreDeferredRecursion(
  input: RestoreDeferredRecursionInput,
): ExecutableTraversalCompletion | null {
  const state = reconstructDeferredApplicationState(input);
  return state === null ? null : applicationReadyCompletion(state);
}

function requireDeferredApplicationState(
  value: ExecutableTraversalCompletion,
  restoration: RestoreDeferredRecursionInput,
): DeferredApplicationState {
  const state = reconstructDeferredApplicationState(restoration);
  const projected = state === null ? null : applicationReadyCompletion(state);
  if (
    value.disposition !== "application_ready" ||
    state === null ||
    projected === null ||
    !sameCanonical(value, projected)
  ) throw new TypeError("deferred application differs from replay truth");
  return state;
}

function deferredFailure(
  state: DeferredApplicationState,
  clock: ExecutableTraversalClock,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  Abg.admitRuntimeFailure(
    state.input.store,
    state.input.executionBasis,
    state.input.openedTraversalScope,
    "route",
    { stage, candidate },
    diagnosticRef,
    {
      ...admissionBasis(clock, stage),
      causationEventRefs: [state.judgment.admissionEventRef],
    },
  );
  return completion("failed", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef,
  });
}

function isExactDeferredApplication(
  state: DeferredApplicationState,
  application: Readonly<RecurseApplication>,
): boolean {
  return state.input.graph.template.applications.find((candidate) =>
    candidate.applicationRef === application.applicationRef
  ) === application && state.cCall.compositionRef === application.applicationRef;
}

function completeDeferredApplicationTerminal(input: Readonly<{
  completion: ExecutableTraversalCompletion;
  restoration: RestoreDeferredRecursionInput;
  application: Readonly<RecurseApplication>;
  clock: ExecutableTraversalClock;
}>): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion, input.restoration);
  if (
    !isExactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== true
  ) {
    return deferredFailure(
      state,
      input.clock,
      "application-terminal-refusal",
      "diagnostic://abiogenesis/hog/application-terminal-not-declared@5",
      input.application as unknown as JsonValue,
    );
  }
  const admitted = admitSuccessfulRetryExitRoute({
    store: state.input.store,
    executionBasis: state.input.executionBasis,
    graphFunction: state.input.graphFunction,
    graph: state.input.graph,
    sourceCursor: state.input.traversalStop.cursor,
    targetCursor: state.targetCursor,
    variant: {
      completionClass: "judged_success",
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      transitionContractRef: state.input.closureContract.transitionContractRef,
    },
    basis: admissionBasis(input.clock, "application-successful-retry-exit"),
  });
  if (admitted.kind !== "successful_retry_exit_route_admission") {
    return deferredFailure(
      state,
      input.clock,
      "application-successful-retry-exit",
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted.candidate,
    );
  }
  if (admitted.route.routeKind === "advance") {
    if (state.targetCursor === null) {
      return deferredFailure(
        state,
        input.clock,
        "application-advance-target",
        "diagnostic://abiogenesis/hog/application-advance-target-absent@5",
        admitted.route as unknown as JsonValue,
      );
    }
    const nextCursor = applyAdmittedRoute(
      state.input.traversalStop.cursor,
      state.targetCursor,
      "advance",
      admitted.route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      return deferredFailure(
        state,
        input.clock,
        "application-advance",
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        nextCursor as unknown as JsonValue,
      );
    }
    return completion("advanced", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: state.result.resultRef,
      judgmentRef: state.judgment.judgmentRef,
      nextCursor,
      resultValue: state.result.value,
      continuationKind: "advance",
      nextInputContractRef: input.application.outputContractRef,
    });
  }
  if (admitted.route.routeKind !== "terminal") {
    return deferredFailure(
      state,
      input.clock,
      "application-terminal-route",
      "diagnostic://abiogenesis/hog/application-terminal-route-mismatch@5",
      admitted.route as unknown as JsonValue,
    );
  }
  const basis = admissionBasis(
    input.clock,
    state.input.applicationCompletionMode === "return_to_parent"
      ? "application-child-closure"
      : "application-closure",
  );
  const closure = state.input.applicationCompletionMode === "return_to_parent"
    ? Abg.admitChildClosure(
        state.input.store,
        selectHeldEventStoreDurablePrefix(state.input.store),
        state.input.openedTraversalScope,
        state.cCall,
        state.result,
        state.judgment,
        admitted.route,
        state.input.closureContract,
        basis,
      )
    : Abg.admitClosure(
        state.input.store,
        selectHeldEventStoreDurablePrefix(state.input.store),
        state.cCall,
        state.result,
        state.judgment,
        admitted.route,
        state.input.closureContract,
        basis,
      );
  if (
    closure.kind !== "closure_admission" &&
    closure.kind !== "child_closure_admission"
  ) {
    return deferredFailure(
      state,
      input.clock,
      "application-closure",
      `diagnostic://abiogenesis/hog/${closure.code}@5`,
      closure as unknown as JsonValue,
    );
  }
  return completion("closed", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    closureRef: closure.closureRef,
    resultValue: state.result.value,
  });
}

function advanceDeferredRecursion(input: Readonly<{
  completion: ExecutableTraversalCompletion;
  restoration: RestoreDeferredRecursionInput;
  application: Readonly<RecurseApplication>;
  childExecutionBasis: ExecutionBasis;
  childTraversalScope: OpenedTraversalScope;
  childCompletion: ExecutableTraversalCompletion;
  clock: ExecutableTraversalClock;
}>): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion, input.restoration);
  const childValue = input.childCompletion.resultValue;
  if (
    !isExactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== false ||
    input.application.foldback.binding !== "$" ||
    !["closed", "blocked"].includes(input.childCompletion.disposition) ||
    (input.childCompletion.disposition === "closed") !==
      (input.childCompletion.closureRef !== null) ||
    input.childCompletion.resultRef === null ||
    input.childCompletion.judgmentRef === null ||
    !isRecord(childValue)
  ) {
    return deferredFailure(
      state,
      input.clock,
      "application-foldback-refusal",
      "diagnostic://abiogenesis/hog/application-foldback-mismatch@5",
      input.application as unknown as JsonValue,
    );
  }
  const foldback = Abg.admitApplicationChildFoldback(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.cCall,
    state.judgment.judgmentRef,
    state.input.traversalStop.cursor,
    input.childExecutionBasis,
    input.childTraversalScope,
    {
      resultRef: input.childCompletion.resultRef,
      judgmentRef: input.childCompletion.judgmentRef,
      closureRef: input.childCompletion.closureRef,
    },
    admissionBasis(input.clock, "application-foldback"),
  );
  if (foldback.kind !== "application_child_foldback_admission") {
    return deferredFailure(
      state,
      input.clock,
      "application-foldback-admission",
      `diagnostic://abiogenesis/hog/${foldback.code}@5`,
      foldback as unknown as JsonValue,
    );
  }
  const replayState = replayRun(state.input);
  if (foldback.childDisposition === "blocked") {
    const proposal = Routes.proposeRecursionRoute(
      state.input.graph,
      input.application,
      state.input.traversalStop.cursor,
      null,
      state.cCall,
      state.judgment,
      foldback,
      replayState,
      state.cCall.transitionContractRef,
      "blocked",
    );
    if (proposal.kind !== "traversal_route_candidate") {
      return deferredFailure(
        state,
        input.clock,
        "application-child-stop-proposal",
        `diagnostic://abiogenesis/hog/${proposal.code}@5`,
        proposal as unknown as JsonValue,
      );
    }
    const route = Abg.admitRecursionRoute(
      state.input.store,
      state.input.executionBasis,
      state.input.graph,
      input.application,
      state.input.traversalStop.cursor,
      null,
      replayState,
      proposal,
      admissionBasis(input.clock, "application-child-stop-route"),
      {
        cCall: state.cCall,
        result: state.result,
        judgment: state.judgment,
        foldback,
      },
    );
    if (
      route.kind !== "admitted_traversal_route" ||
      route.routeKind !== "blocked" ||
      route.runStoppedEventRef === null
    ) {
      return deferredFailure(
        state,
        input.clock,
        "application-child-stop-route",
        route.kind === "admitted_traversal_route"
          ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
          : `diagnostic://abiogenesis/hog/${route.code}@5`,
        route as unknown as JsonValue,
      );
    }
    return completion("blocked", replayRun(state.input), {
      cCallRef: state.cCall.cCallRef,
      resultRef: foldback.childResultRef,
      judgmentRef: state.judgment.judgmentRef,
      resultValue: childValue as JsonValue,
      diagnosticRef: foldback.childReasonRef ??
        "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
    });
  }
  const target = deriveRecursionReentryCursor(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    {
      inputRef: foldback.childResultRef,
      inputDigest: foldback.outputDigest,
    },
  );
  if (target.kind === "traversal_refusal") {
    return deferredFailure(
      state,
      input.clock,
      "application-reentry-derivation",
      `diagnostic://abiogenesis/hog/${target.code}@5`,
      target as unknown as JsonValue,
    );
  }
  const proposal = Routes.proposeRecursionRoute(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    target,
    state.cCall,
    state.judgment,
    foldback,
    replayState,
    state.cCall.transitionContractRef,
    "advance",
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return deferredFailure(
      state,
      input.clock,
      "application-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = Abg.admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    target,
    replayState,
    proposal,
    admissionBasis(input.clock, "application-route"),
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback,
    },
  );
  if (route.kind !== "admitted_traversal_route") {
    return deferredFailure(
      state,
      input.clock,
      "application-route-admission",
      `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  const nextCursor = applyRecursionRoute(
    state.input.store,
    state.input.traversalStop.cursor,
    target,
    route,
  );
  if (nextCursor.kind === "traversal_refusal") {
    return deferredFailure(
      state,
      input.clock,
      "application-route-application",
      `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      nextCursor as unknown as JsonValue,
    );
  }
  return completion("advanced", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: foldback.childResultRef,
    judgmentRef: state.judgment.judgmentRef,
    nextCursor,
    resultValue: childValue as JsonValue,
    continuationKind: "advance",
    nextInputContractRef: input.application.outputContractRef,
  });
}

function blockDeferredRecursion(input: Readonly<{
  completion: ExecutableTraversalCompletion;
  restoration: RestoreDeferredRecursionInput;
  application: Readonly<RecurseApplication>;
  preparationRefusal?: Readonly<{
    stage: "basis_admission" | "graph_materialization" | "graph_validation" |
      "membership" | "scope_open";
    diagnosticRef: string;
    message: string;
  }>;
  clock: ExecutableTraversalClock;
}>): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(input.completion, input.restoration);
  if (
    !isExactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== false
  ) {
    return deferredFailure(
      state,
      input.clock,
      "application-block-refusal",
      "diagnostic://abiogenesis/hog/application-bound-mismatch@5",
      input.application as unknown as JsonValue,
    );
  }
  const preparation = input.preparationRefusal === undefined
    ? null
    : Abg.admitApplicationChildPreparationRefusal(
        state.input.store,
        state.input.executionBasis,
        state.input.graph,
        input.application,
        state.cCall,
        state.result,
        state.judgment,
        state.input.traversalStop.cursor,
        {
          childGraphFunctionRef: input.application.graphFunctionRef,
          inputRef: state.result.resultRef,
          inputDigest: state.result.valueDigest,
          ...input.preparationRefusal,
        },
        admissionBasis(input.clock, "preparation-refusal"),
      );
  if (
    preparation !== null &&
    preparation.kind !== "application_child_preparation_refusal_admission"
  ) {
    return deferredFailure(
      state,
      input.clock,
      "application-preparation-admission",
      `diagnostic://abiogenesis/hog/${preparation.code}@5`,
      preparation as unknown as JsonValue,
    );
  }
  const replayState = replayRun(state.input);
  const proposal = Routes.proposeRecursionRoute(
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    state.cCall,
    state.judgment,
    null,
    replayState,
    state.cCall.transitionContractRef,
    "blocked",
    preparation ?? undefined,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return deferredFailure(
      state,
      input.clock,
      "application-block-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = Abg.admitRecursionRoute(
    state.input.store,
    state.input.executionBasis,
    state.input.graph,
    input.application,
    state.input.traversalStop.cursor,
    null,
    replayState,
    proposal,
    admissionBasis(input.clock, "application-blocked-route"),
    {
      cCall: state.cCall,
      result: state.result,
      judgment: state.judgment,
      foldback: null,
      ...(preparation === null ? {} : { preparationRefusal: preparation }),
    },
  );
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "blocked" ||
    route.runStoppedEventRef === null
  ) {
    return deferredFailure(
      state,
      input.clock,
      "application-blocked-route",
      route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/application-run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  return completion("blocked", replayRun(state.input), {
    cCallRef: state.cCall.cCallRef,
    resultRef: state.result.resultRef,
    judgmentRef: state.judgment.judgmentRef,
    resultValue: state.result.value,
    diagnosticRef: input.preparationRefusal?.diagnosticRef ??
      "reason://abiogenesis/recursion/bound-exhausted@5",
  });
}

function suspendHeldRecursionTraversal(input: Readonly<{
  parentGraphInput: Readonly<Record<string, JsonValue>>;
  parentGraphInputDigest: `sha256:${string}`;
  application: Readonly<RecurseApplication>;
  deferredCompletion: ExecutableTraversalCompletion;
  restoration: RestoreDeferredRecursionInput;
  childExecutionBasis: ExecutionBasis;
  childTraversalScope: OpenedTraversalScope;
  childInput: Readonly<Record<string, JsonValue>>;
  childInputDigest: `sha256:${string}`;
  childCompletion: ExecutableTraversalCompletion;
  terminalMode: "close_run" | "return_to_parent";
}>): ExecutableTraversalCompletion {
  const state = requireDeferredApplicationState(
    input.deferredCompletion,
    input.restoration,
  );
  if (
    input.childCompletion.disposition !== "held" ||
    input.childCompletion.continuationRef === null ||
    input.childCompletion.heldInteraction === null ||
    input.childCompletion.heldGraph === null ||
    input.childCompletion.heldClosureContract === null ||
    !isExactDeferredApplication(state, input.application) ||
    recursionTerminationDecision(input.application, state.result.value) !== false ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      state.input.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      state.input.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !== input.childExecutionBasis.basisRef ||
    state.input.applicationCompletionMode !== input.terminalMode ||
    canonicalDigest(input.parentGraphInput) !== input.parentGraphInputDigest ||
    state.input.graph.admittedInputDigest !== input.parentGraphInputDigest ||
    canonicalDigest(input.childInput) !== input.childInputDigest ||
    canonicalDigest(state.input.input) !== state.input.inputDigest
  ) throw new TypeError("held recursion has inconsistent parent/child lineage");
  const suspension: HeldRecursionSuspension = deepFreeze({
    kind: "held_recursion_suspension" as const,
    schemaVersion: "5.0.0" as const,
    parentExecutionBasisRef: state.input.executionBasis.basisRef,
    parentTraversalScope: state.input.openedTraversalScope,
    parentGraph: state.input.graph,
    parentClosureContract: state.input.closureContract,
    parentGraphInput: input.parentGraphInput,
    parentGraphInputDigest: input.parentGraphInputDigest,
    application: input.application,
    evaluatorCCall: state.cCall,
    evaluatorResult: state.result,
    evaluatorJudgment: state.judgment,
    sourceCursor: state.input.traversalStop.cursor,
    evaluatorInput: state.input.input,
    evaluatorInputDigest: state.input.inputDigest,
    childExecutionBasisRef: input.childExecutionBasis.basisRef,
    childTraversalScopeRef: input.childTraversalScope.scopeRef,
    childInput: input.childInput,
    childInputDigest: input.childInputDigest,
    terminalMode: input.terminalMode,
  });
  return deepFreeze({
    ...input.childCompletion,
    parentSuspensions: [
      ...input.childCompletion.parentSuspensions,
      suspension,
    ],
  });
}

type RecursionApplicationStep =
  | Readonly<{
      kind: "recursion_completion";
      completion: ExecutableTraversalCompletion;
    }>
  | Readonly<{
      kind: "recursion_child_request";
      frame: RecursionChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
    }>;

function beginRecursionApplication(input: Readonly<{
  parent: ExecuteGraphTraversalCommonInput;
  traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  application: Readonly<RecurseApplication>;
  completion: ExecutableTraversalCompletion;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  leafOrdinal: number;
  fail: TraversalLocusFailure;
}>): Effect.Effect<RecursionApplicationStep> {
  return Effect.gen(function* () {
    const { parent, application, traversalInput, leafOrdinal } = input;
    const coordinates = input.completion;
    if (
      coordinates.cCallRef === null ||
      coordinates.resultRef === null ||
      coordinates.judgmentRef === null
    ) {
      return input.fail(
        `recursion-restoration-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-restoration-coordinates-absent@5",
        coordinates as unknown as JsonValue,
      );
    }
    const restoration: RestoreDeferredRecursionInput = {
      traversalInput,
      application,
      cCallRef: coordinates.cCallRef,
      resultRef: coordinates.resultRef,
      judgmentRef: coordinates.judgmentRef,
    };
    const restored = restoreDeferredRecursion(restoration);
    if (restored === null || !sameCanonical(restored, coordinates)) {
      return input.fail(
        `recursion-restoration-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-restoration-mismatch@5",
        coordinates as unknown as JsonValue,
      );
    }
    const termination = restored.resultValue === null
      ? null
      : recursionTerminationDecision(application, restored.resultValue);
    if (termination === null) {
      return input.fail(
        `recursion-termination-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-termination-value-invalid@5",
        { applicationRef: application.applicationRef },
      );
    }
    const clock = (stage: string): ExecutableTraversalClock => ({
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/recursion/${leafOrdinal}/${stage}`,
    });
    if (termination) {
      return {
        kind: "recursion_completion" as const,
        completion: completeDeferredApplicationTerminal({
          completion: restored,
          restoration,
          application,
          clock: clock("terminal"),
        }),
      };
    }
    if (traversalInput.traversalStop.cursor.attempt >= application.bound) {
      return {
        kind: "recursion_completion" as const,
        completion: blockDeferredRecursion({
          completion: restored,
          restoration,
          application,
          clock: clock("bound"),
        }),
      };
    }
    if (
      parent.childTraversalPreparationPort === undefined ||
      !isChildTraversalPreparationPort(parent.childTraversalPreparationPort) ||
      restored.cCallRef === null ||
      restored.resultRef === null ||
      !isRecord(restored.resultValue)
    ) {
      return input.fail(
        `recursion-child-port-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/recursion-child-preparation-absent@5",
        { applicationRef: application.applicationRef },
      );
    }
    const childInput = restored.resultValue as Readonly<
      Record<string, JsonValue>
    >;
    const prepared = yield* Effect.promise(() => Promise.resolve(
      parent.childTraversalPreparationPort!.prepare({
        parentExecutionBasis: parent.executionBasis,
        parentTraversalScope: parent.openedTraversalScope,
        parentCCallRef: restored.cCallRef!,
        childGraphFunctionRef: application.graphFunctionRef,
        inputRef: restored.resultRef!,
        inputDigest: sha256Canonical(childInput),
        input: childInput,
        eventTime: parent.eventTime,
        correlationId: clock("prepare").correlationId,
      }),
    ));
    if (prepared.kind !== "prepared_child_traversal") {
      return {
        kind: "recursion_completion" as const,
        completion: blockDeferredRecursion({
          completion: restored,
          restoration,
          application,
          preparationRefusal: prepared,
          clock: clock("prepare-refusal"),
        }),
      };
    }
    return {
      kind: "recursion_child_request" as const,
      frame: {
        kind: "recursion_child_fold_frame" as const,
        parent,
        traversalInput,
        application,
        restored,
        restoration,
        graphEntryInput: input.graphEntryInput,
        graphEntryInputDigest: input.graphEntryInputDigest,
        leafOrdinal,
        childExecutionBasis: prepared.executionBasis,
        childTraversalScope: prepared.openedTraversalScope,
        childInput: prepared.input,
        childInputDigest: prepared.inputDigest,
      },
      prepared,
      correlationId: clock("child").correlationId,
    };
  });
}

function completeRecursionChild(
  frame: RecursionChildFoldFrame,
  childCompletion: ExecutableTraversalCompletion,
): ExecutableTraversalCompletion {
  const clock: ExecutableTraversalClock = {
    eventTime: frame.parent.eventTime,
    correlationId:
      `${frame.parent.correlationId}/recursion/${frame.leafOrdinal}/foldback`,
  };
  if (childCompletion.disposition === "held") {
    return suspendHeldRecursionTraversal({
      parentGraphInput: frame.graphEntryInput,
      parentGraphInputDigest: frame.graphEntryInputDigest,
      application: frame.application,
      deferredCompletion: frame.restored,
      restoration: frame.restoration,
      childExecutionBasis: frame.childExecutionBasis,
      childTraversalScope: frame.childTraversalScope,
      childInput: frame.childInput,
      childInputDigest: frame.childInputDigest,
      childCompletion,
      terminalMode: frame.parent.terminalMode ?? "close_run",
    });
  }
  if (
    childCompletion.disposition === "failed" &&
    childCompletion.replayState.runtimeStatus === "failed"
  ) return childCompletion;
  return advanceDeferredRecursion({
    completion: frame.restored,
    restoration: frame.restoration,
    application: frame.application,
    childExecutionBasis: frame.childExecutionBasis,
    childTraversalScope: frame.childTraversalScope,
    childCompletion,
    clock,
  });
}

function traversalAtCursor(
  input: ExecuteGraphTraversalCommonInput,
  cursor: TraversalCursor,
  directStep?: DirectCTraversalStep,
): ReturnType<typeof traverseFromCursor> {
  const traversalInput = {
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    graphValidation: input.graphValidation,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
  };
  return directStep === undefined
    ? traverseFromCursor(traversalInput, cursor)
    : traverseFromDirectStep(traversalInput, cursor, directStep);
}

function isExactLocusStep(
  stop: TraversalStopRef | TraversalCursor,
  step: DirectCTraversalStep,
): boolean {
  if (stop.kind === "traversal_cursor") {
    return step.stepKind === "enter_child";
  }
  return step.stepKind === "open_leaf" &&
    step.fibre === stop.computeRegime &&
    step.programLocusRef === stop.programLocusRef &&
    step.armId === stop.armId &&
    step.compositionRef === stop.compositionRef &&
    step.inputCarrierRef === (stop.stopClass === "executable"
      ? stop.inputContractRef
      : stop.requestContractRef) &&
    step.outputCarrierRef === (stop.stopClass === "executable"
      ? stop.outputContractRef
      : stop.responseContractRef);
}

function preparedChildTraversalInput(
  parent: ExecuteGraphTraversalCommonInput,
  prepared: PreparedChildTraversal,
  correlationId: string,
  deferFailedRunStop: boolean,
): InitialOrNonRetryExecuteGraphTraversalInput {
  return {
    store: parent.store,
    executionBasis: prepared.executionBasis,
    openedTraversalScope: prepared.openedTraversalScope,
    program: prepared.program,
    graphFunction: prepared.graphFunction,
    graph: prepared.graph,
    graphValidation: prepared.graphValidation,
    implementationSet: prepared.implementationSet,
    interactionSet: prepared.interactionSet,
    ...(parent.continuationProductBasis === undefined
      ? {}
      : {
          continuationProductBasis: {
            ...parent.continuationProductBasis,
            programValidation: prepared.programValidation,
            graphValidation: prepared.graphValidation,
          },
        }),
    leafPort: parent.leafPort,
    ...(parent.childTraversalPreparationPort === undefined
      ? {}
      : {
          childTraversalPreparationPort:
            parent.childTraversalPreparationPort,
        }),
    closureContract: prepared.closureContract,
    actorRuntimeBinding: parent.actorRuntimeBinding,
    ...(deferFailedRunStop ? { deferFailedRunStop: true } : {}),
    input: prepared.input,
    inputDigest: prepared.inputDigest,
    eventTime: parent.eventTime,
    correlationId,
    terminalMode: "return_to_parent",
  };
}

function projectedRetryTraversalInput(
  parent: ExecuteGraphTraversalCommonInput,
  projectedRetryResume: ProjectedRetryResumeSuccess,
  correlationId: string,
): ExecuteGraphTraversalInput {
  return {
    store: parent.store,
    executionBasis: parent.executionBasis,
    openedTraversalScope: parent.openedTraversalScope,
    program: parent.program,
    graphFunction: parent.graphFunction,
    graph: parent.graph,
    graphValidation: parent.graphValidation,
    implementationSet: parent.implementationSet,
    interactionSet: parent.interactionSet,
    ...(parent.continuationProductBasis === undefined
      ? {}
      : { continuationProductBasis: parent.continuationProductBasis }),
    leafPort: parent.leafPort,
    ...(parent.childTraversalPreparationPort === undefined
      ? {}
      : { childTraversalPreparationPort: parent.childTraversalPreparationPort }),
    closureContract: parent.closureContract,
    actorRuntimeBinding: parent.actorRuntimeBinding,
    ...(parent.deferFailedRunStop === true ? { deferFailedRunStop: true } : {}),
    eventTime: parent.eventTime,
    correlationId,
    ...(parent.terminalMode === undefined
      ? {}
      : { terminalMode: parent.terminalMode }),
    projectedRetryResume,
  };
}

function fanOutApplicationForBatch(
  graph: Readonly<GtlGraph>,
  batchRef: string | null,
): Readonly<FanOutApplication> | null {
  if (batchRef === null) return null;
  const application = graph.template.applications.find(
    (candidate) =>
      candidate.relationKind === "fan_out" &&
      candidate.batchRef === batchRef,
  );
  return application?.relationKind === "fan_out" ? application : null;
}

function materializedInputAtCursor(
  graph: Readonly<GtlGraph>,
  cursor: TraversalCursor | null,
): {
  readonly inputContractRef: string;
  readonly value: Readonly<Record<string, JsonValue>>;
} | null {
  if (cursor === null) return null;
  for (const materialization of graph.fanOutMaterializations) {
    const member = materialization.members.find(
      (candidate) =>
        candidate.ordinal === cursor.taskOrdinal &&
        candidate.memberRef === cursor.inputRef &&
        candidate.memberDigest === cursor.inputDigest,
    );
    if (member !== undefined) {
      return {
        inputContractRef: materialization.inputMemberContractRef,
        value: member.value,
      };
    }
  }
  return null;
}

const PROJECTED_RETRY_RESUME_KEYS = Object.freeze([
  "disposition",
  "executableRetryInputDigest",
  "executableRetryInputRef",
  "inputContractRef",
  "inputDigest",
  "inputRef",
  "inputValue",
  "kind",
  "nextAttempt",
  "nextCursor",
  "progressEventRef",
  "retryAttemptAdmissionEventRef",
  "retryAttemptDigest",
  "retryAttemptRef",
  "retryFrontierDigest",
  "retryFrontierRef",
  "routeAdmissionEventRef",
  "routeDigest",
  "routeRef",
  "schemaVersion",
  "selectedFrontierRowRef",
  "successorPrefix",
].sort());

function isJsonRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSha256Digest(value: unknown): value is `sha256:${string}` {
  return typeof value === "string" && /^sha256:[a-f0-9]{64}$/u.test(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isProjectedRetryResumeCarrier(
  value: unknown,
): value is ProjectedRetryResumeSuccess {
  try {
    if (!isJsonRecord(value)) return false;
    const keys = Object.keys(value).sort();
    const nextCursor = value.nextCursor as unknown as TraversalCursor;
    if (
      keys.length !== PROJECTED_RETRY_RESUME_KEYS.length ||
      keys.some((key, index) => key !== PROJECTED_RETRY_RESUME_KEYS[index]) ||
      value.kind !== "projected_retry_resume" ||
      value.schemaVersion !== "5.0.0" ||
      value.disposition !== "resumed" ||
      !isSha256Digest(value.executableRetryInputDigest) ||
      value.executableRetryInputRef !==
        `executable-retry-input://abiogenesis/${value.executableRetryInputDigest.slice("sha256:".length)}` ||
      !isSha256Digest(value.retryFrontierDigest) ||
      value.retryFrontierRef !==
        `retry-attempt-frontier://abiogenesis/${value.retryFrontierDigest.slice("sha256:".length)}` ||
      !isNonEmptyString(value.selectedFrontierRowRef) ||
      !isNonEmptyString(value.progressEventRef) ||
      !isNonEmptyString(value.routeAdmissionEventRef) ||
      !isSha256Digest(value.routeDigest) ||
      value.routeRef !==
        `traversal-route://abiogenesis/${value.routeDigest.slice("sha256:".length)}` ||
      !isNonEmptyString(value.retryAttemptAdmissionEventRef) ||
      !isSha256Digest(value.retryAttemptDigest) ||
      value.retryAttemptRef !==
        `retry-attempt://abiogenesis/${value.retryAttemptDigest.slice("sha256:".length)}` ||
      !Number.isSafeInteger(value.nextAttempt) || Number(value.nextAttempt) < 2 ||
      !isNonEmptyString(value.inputContractRef) ||
      !isNonEmptyString(value.inputRef) ||
      !isSha256Digest(value.inputDigest) ||
      !isJsonRecord(value.inputValue) ||
      sha256Canonical(value.inputValue) !== value.inputDigest ||
      typeof value.nextCursor !== "object" || value.nextCursor === null ||
      !isTraversalCursorCandidate(nextCursor) ||
      nextCursor.attempt !== value.nextAttempt ||
      nextCursor.retryPath.at(-1) !== value.nextAttempt ||
      nextCursor.inputRef !== value.inputRef ||
      nextCursor.inputDigest !== value.inputDigest ||
      !validateDurablePrefixCoordinate(value.successorPrefix)
    ) return false;
    return true;
  } catch {
    return false;
  }
}

interface ReprojectedProjectedRetryResume {
  readonly cursor: TraversalCursor;
  readonly executionBasis: ExecutionBasis;
}

interface TraversalEvaluationFrame {
  readonly runtime: ExecuteGraphTraversalInput;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly cursor: TraversalCursor;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly ordinal: number;
  readonly structuralOrdinal: number;
}

interface TraversalLocusEvaluation {
  readonly completion: ExecutableTraversalCompletion;
  readonly outputValueKind: string | null;
  readonly outputContractRef: string | null;
}

type TraversalLocusFailure = (
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
) => never;

type WorkflowTerm = Extract<
  ReturnType<typeof resolveTraversalTerm>,
  Readonly<{ kind: "c_workflow" }>
>;

interface WorkflowParentContext {
  readonly kind: "workflow_child_fold_frame";
  readonly runtime: ExecuteGraphTraversalCommonInput;
  readonly cursor: TraversalCursor;
  readonly value: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly ordinal: number;
  readonly workflowTerm: WorkflowTerm;
  readonly parentCCall: CCall;
  readonly application: Readonly<FanOutApplication> | null;
}

interface WorkflowChildFoldFrame extends WorkflowParentContext {
  readonly childExecutionBasis: PreparedChildTraversal["executionBasis"];
  readonly childTraversalScope: PreparedChildTraversal["openedTraversalScope"];
  readonly childInput: PreparedChildTraversal["input"];
  readonly childInputDigest: PreparedChildTraversal["inputDigest"];
  readonly foldbackCorrelationId: string;
}

interface RecursionChildFoldFrame {
  readonly kind: "recursion_child_fold_frame";
  readonly parent: ExecuteGraphTraversalCommonInput;
  readonly traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  >;
  readonly application: Readonly<RecurseApplication>;
  readonly restored: ExecutableTraversalCompletion;
  readonly restoration: RestoreDeferredRecursionInput;
  readonly graphEntryInput: Readonly<Record<string, JsonValue>>;
  readonly graphEntryInputDigest: `sha256:${string}`;
  readonly leafOrdinal: number;
  readonly childExecutionBasis: PreparedChildTraversal["executionBasis"];
  readonly childTraversalScope: PreparedChildTraversal["openedTraversalScope"];
  readonly childInput: PreparedChildTraversal["input"];
  readonly childInputDigest: PreparedChildTraversal["inputDigest"];
}

type WorkflowLocusStep =
  | Readonly<{ kind: "locus_evaluation"; evaluation: TraversalLocusEvaluation }>
  | Readonly<{
      kind: "workflow_child_request";
      frame: WorkflowChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
      deferFailedRunStop: boolean;
    }>;

function workflowFailure(
  context: WorkflowParentContext,
  stage: string,
  diagnosticRef: string,
  candidate: JsonValue,
): ExecutableTraversalCompletion {
  const { runtime } = context;
  Abg.admitRuntimeFailure(
    runtime.store,
    runtime.executionBasis,
    runtime.openedTraversalScope,
    "hog_traversal",
    { stage, candidate },
    diagnosticRef,
    admissionBasis(
      {
        eventTime: runtime.eventTime,
        correlationId: `${runtime.correlationId}/workflow/${context.ordinal}`,
      },
      stage,
    ),
  );
  return completion(
    "failed",
    Abg.replay(runtime.store, { runId: runtime.openedTraversalScope.runId }),
    { cCallRef: context.parentCCall.cCallRef, diagnosticRef },
  );
}

function suspendHeldWorkflowTraversal(
  frame: WorkflowChildFoldFrame,
  child: ExecutableTraversalCompletion,
): ExecutableTraversalCompletion {
  const runtime = frame.runtime;
  if (
    child.disposition !== "held" ||
    child.continuationRef === null ||
    child.heldInteraction === null ||
    child.heldGraph === null ||
    child.heldClosureContract === null ||
    runtime.openedTraversalScope.executionBasisRef !==
      runtime.executionBasis.basisRef ||
    frame.childExecutionBasis.parentExecutionBasisRef !==
      runtime.executionBasis.basisRef ||
    frame.childExecutionBasis.parentTraversalScopeRef !==
      runtime.openedTraversalScope.scopeRef ||
    frame.childTraversalScope.executionBasisRef !==
      frame.childExecutionBasis.basisRef ||
    sha256Canonical(frame.childInput) !== frame.childInputDigest ||
    frame.parentCCall.callClass !== "workflow" ||
    frame.parentCCall.basisId !== runtime.executionBasis.basisRef ||
    frame.cursor.executionBasisRef !== runtime.executionBasis.basisRef ||
    frame.cursor.traversalScopeRef !== runtime.openedTraversalScope.scopeRef ||
    sha256Canonical(frame.graphEntryInput) !== frame.graphEntryInputDigest ||
    runtime.graph.admittedInputDigest !== frame.graphEntryInputDigest ||
    sha256Canonical(frame.value) !== frame.cursor.inputDigest
  ) {
    throw new TypeError(
      "held workflow suspension requires one exact admitted parent and child lineage",
    );
  }
  const suspension: HeldWorkflowSuspension = deepFreeze({
    kind: "held_workflow_suspension",
    schemaVersion: "5.0.0",
    parentExecutionBasisRef: runtime.executionBasis.basisRef,
    parentTraversalScope: runtime.openedTraversalScope,
    parentGraph: runtime.graph,
    parentClosureContract: runtime.closureContract,
    parentCCall: frame.parentCCall,
    sourceCursor: frame.cursor,
    parentGraphInput: frame.graphEntryInput,
    parentGraphInputDigest: frame.graphEntryInputDigest,
    parentInput: frame.value,
    parentInputDigest: frame.cursor.inputDigest,
    childExecutionBasisRef: frame.childExecutionBasis.basisRef,
    childTraversalScopeRef: frame.childTraversalScope.scopeRef,
    childInput: frame.childInput,
    childInputDigest: frame.childInputDigest,
    terminalMode: runtime.terminalMode ?? "close_run",
  });
  return deepFreeze({
    ...child,
    parentSuspensions: [...child.parentSuspensions, suspension],
  });
}

function completeBlockedWorkflowTraversal(
  context: WorkflowParentContext,
  resultRef: string,
  judgmentRef: string,
  judgmentEventRef: string,
  reasonRef: string,
): ExecutableTraversalCompletion {
  const { runtime } = context;
  const terminalizesRun = runtime.terminalMode !== "return_to_parent";
  const replayState = Abg.replay(runtime.store, {
    runId: runtime.openedTraversalScope.runId,
  });
  const proposal = Routes.proposeWorkflowBlockedRoute(
    runtime.graph,
    context.cursor,
    context.workflowTerm,
    context.parentCCall,
    judgmentRef,
    replayState,
    context.parentCCall.transitionContractRef,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return workflowFailure(
      context,
      "workflow-blocked-route-proposal",
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const route = Abg.admitRoute(
    runtime.store,
    runtime.executionBasis,
    runtime.graph,
    context.cursor,
    null,
    replayState,
    proposal,
    admissionBasis({
      eventTime: runtime.eventTime,
      correlationId: `${runtime.correlationId}/workflow/${context.ordinal}`,
    }, "workflow-blocked-route"),
    {
      graphFunction: runtime.graphFunction,
      cCall: context.parentCCall,
      resultRef,
      judgmentRef,
      judgmentEventRef,
      reasonRef,
    },
    { terminalizeRun: terminalizesRun },
  );
  if (
    route.kind !== "admitted_traversal_route" ||
    route.routeKind !== "blocked" ||
    (route.runStoppedEventRef !== null) !== terminalizesRun
  ) {
    return workflowFailure(
      context,
      "workflow-blocked-route-admission",
      route.kind === "admitted_traversal_route"
        ? "diagnostic://abiogenesis/hog/run-stop-absent@5"
        : `diagnostic://abiogenesis/hog/${route.code}@5`,
      route as unknown as JsonValue,
    );
  }
  return completion(
    "blocked",
    Abg.replay(runtime.store, { runId: runtime.openedTraversalScope.runId }),
    {
      cCallRef: context.parentCCall.cCallRef,
      resultRef,
      judgmentRef,
      diagnosticRef: reasonRef,
    },
  );
}

function completeWorkflowPreparationRefusal(
  context: WorkflowParentContext,
  refusal: ChildTraversalPreparationRefusal,
): ExecutableTraversalCompletion {
  const { runtime } = context;
  const admitted = Abg.admitChildPreparationRefusal(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    context.cursor,
    context.parentCCall,
    {
      kind: "child_preparation_refusal_candidate",
      schemaVersion: "5.0.0",
      childGraphFunctionRef: context.workflowTerm.graphFunctionRef,
      inputRef: context.cursor.inputRef,
      inputDigest: context.cursor.inputDigest,
      stage: refusal.stage,
      diagnosticRef: refusal.diagnosticRef,
      message: refusal.message,
    },
    admissionBasis({
      eventTime: runtime.eventTime,
      correlationId: `${runtime.correlationId}/workflow/${context.ordinal}`,
    }, "child-preparation-refusal"),
  );
  if (admitted.kind !== "child_preparation_refusal_admission") {
    return workflowFailure(
      context,
      "workflow-preparation-refusal-admission",
      `diagnostic://abiogenesis/hog/${admitted.code}@5`,
      admitted as unknown as JsonValue,
    );
  }
  const rejected = Abg.completeRejectedCCall(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    context.cursor,
    context.parentCCall,
    admitted.admissionRejection,
    {
      ...admissionBasis({
        eventTime: runtime.eventTime,
        correlationId: `${runtime.correlationId}/workflow/${context.ordinal}`,
      }, "child-preparation-rejection"),
      causationEventRefs: [admitted.admissionEventRef],
    },
  );
  return completeBlockedWorkflowTraversal(
    context,
    rejected.refusalResultRef,
    rejected.rejectionJudgmentRef,
    rejected.judgmentEventRef,
    refusal.diagnosticRef,
  );
}

function beginWorkflowLocus(input: Readonly<{
  runtime: ExecuteGraphTraversalCommonInput;
  cursor: TraversalCursor;
  value: Readonly<Record<string, JsonValue>>;
  graphEntryInput: Readonly<Record<string, JsonValue>>;
  graphEntryInputDigest: `sha256:${string}`;
  ordinal: number;
  fail: TraversalLocusFailure;
}>): Effect.Effect<WorkflowLocusStep> {
  return Effect.gen(function* () {
    const { runtime, cursor, ordinal } = input;
    const term = resolveTraversalTerm(runtime.graph, cursor);
    if (term.kind !== "c_workflow") {
      return input.fail(
        `workflow-step-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
        term as unknown as JsonValue,
      );
    }
    const childPort = runtime.childTraversalPreparationPort;
    if (childPort === undefined || !isChildTraversalPreparationPort(childPort)) {
      return input.fail(
        `child-port-${ordinal}`,
        "diagnostic://abiogenesis/hog/child-preparation-port-absent@5",
        term as unknown as JsonValue,
      );
    }
    const failureContracts = new Set(
      runtime.implementationSet.rows
        .filter((row) => row.graphFunctionRef === term.graphFunctionRef)
        .map((row) => row.failureContractRef),
    );
    const failureContractRef = [...failureContracts][0];
    if (failureContracts.size !== 1 || failureContractRef === undefined) {
      return input.fail(
        `workflow-failure-contract-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-failure-contract-ambiguous@5",
        {
          childGraphFunctionRef: term.graphFunctionRef,
          failureContractRefs: [...failureContracts].sort(),
        },
      );
    }
    const opened = Abg.openWorkflowCCall(
      runtime.store,
      runtime.executionBasis,
      runtime.implementationSet,
      runtime.openedTraversalScope,
      runtime.program,
      runtime.graphFunction,
      runtime.graph,
      {
        kind: "workflow_c_call_proposal",
        schemaVersion: "5.0.0",
        cursor,
        traversalScopeRef: runtime.openedTraversalScope.scopeRef,
        runId: runtime.openedTraversalScope.runId,
        graphCallId: runtime.openedTraversalScope.graphCallId,
        frameId: runtime.openedTraversalScope.frameId,
        childGraphFunctionRef: term.graphFunctionRef,
        inputContractRef: term.inputCarrierRef,
        outputContractRef: term.outputCarrierRef,
        failureContractRef,
        judgmentPredicateRef:
          runtime.graphFunction.declarations["abg.judgment_predicate"] ?? "",
      },
      admissionBasis({
        eventTime: runtime.eventTime,
        correlationId: `${runtime.correlationId}/workflow/${ordinal}`,
      }, "parent"),
    );
    if (opened.kind !== "c_call_admission") {
      return input.fail(
        `workflow-parent-${ordinal}`,
        `diagnostic://abiogenesis/hog/${opened.code}@5`,
        opened as unknown as JsonValue,
      );
    }
    const context: WorkflowParentContext = {
      kind: "workflow_child_fold_frame",
      runtime,
      cursor,
      value: input.value,
      graphEntryInput: input.graphEntryInput,
      graphEntryInputDigest: input.graphEntryInputDigest,
      ordinal,
      workflowTerm: term,
      parentCCall: opened.cCall,
      application: fanOutApplicationForBatch(runtime.graph, opened.cCall.batchRef),
    };
    const intent = rehydrateConstructionIntentForCursor(runtime.store, cursor);
    const selectedInput = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInput
      : input.value;
    const selectedInputRef = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInputRef
      : cursor.inputRef;
    const selectedInputDigest = intent?.actionKind === "invoke_graph_function"
      ? intent.targetInputDigest
      : cursor.inputDigest;
    if (
      selectedInput === null ||
      selectedInputRef === null ||
      selectedInputDigest === null ||
      (intent?.actionKind === "invoke_graph_function" &&
        (intent.selectedGraphFunctionRef !== term.graphFunctionRef ||
          intent.targetProgramLocusRef !== term.graphFunctionRef ||
          sha256Canonical(selectedInput) !== selectedInputDigest))
    ) {
      return input.fail(
        `workflow-selected-input-${ordinal}`,
        "diagnostic://abiogenesis/hog/workflow-selected-input-mismatch@5",
        term as unknown as JsonValue,
      );
    }
    const prepared = yield* Effect.promise(() => Promise.resolve(childPort.prepare({
      parentExecutionBasis: runtime.executionBasis,
      parentTraversalScope: runtime.openedTraversalScope,
      parentCCallRef: opened.cCall.cCallRef,
      childGraphFunctionRef: term.graphFunctionRef,
      inputRef: selectedInputRef,
      inputDigest: selectedInputDigest,
      input: selectedInput,
      eventTime: runtime.eventTime,
      correlationId: `${runtime.correlationId}/workflow/${ordinal}/prepare`,
    })));
    if (prepared.kind !== "prepared_child_traversal") {
      return {
        kind: "locus_evaluation" as const,
        evaluation: {
          completion: completeWorkflowPreparationRefusal(context, prepared),
          outputValueKind: null,
          outputContractRef: null,
        },
      };
    }
    return {
      kind: "workflow_child_request" as const,
      frame: {
        ...context,
        childExecutionBasis: prepared.executionBasis,
        childTraversalScope: prepared.openedTraversalScope,
        childInput: prepared.input,
        childInputDigest: prepared.inputDigest,
        foldbackCorrelationId:
          `${runtime.correlationId}/workflow/${ordinal}/foldback`,
      },
      prepared,
      correlationId: `${runtime.correlationId}/workflow/${ordinal}/child`,
      deferFailedRunStop: runtime.deferFailedRunStop === true ||
        context.application?.elementGraphFunctionRef === term.graphFunctionRef,
    };
  });
}

function completeFanOutWorkflowRoute(
  frame: WorkflowChildFoldFrame,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
  fanOutCompletion: Abg.FanOutCompletionAdmission,
  targetCursor: TraversalCursor | null,
): ExecutableTraversalCompletion {
  const { runtime, application, cursor, parentCCall } = frame;
  if (application === null) {
    return workflowFailure(
      frame,
      "fan-out-application",
      "diagnostic://abiogenesis/hog/fan-out-application-absent@5",
      fanOutCompletion as unknown as JsonValue,
    );
  }
  const replayState = Abg.replay(runtime.store, {
    runId: runtime.openedTraversalScope.runId,
  });
  const replayed = replayState.fanOutCompletions.find(
    (candidate) =>
      candidate.completionRef === fanOutCompletion.completionRef &&
      candidate.admissionEventRef === fanOutCompletion.admissionEventRef,
  );
  if (replayed === undefined) {
    return workflowFailure(
      frame,
      "fan-out-completion-replay",
      "diagnostic://abiogenesis/hog/fan-out-completion-replay-absent@5",
      fanOutCompletion as unknown as JsonValue,
    );
  }
  const admitted = replayed.completionKind === "complete_vector"
    ? admitSuccessfulRetryExitRoute({
        store: runtime.store,
        executionBasis: runtime.executionBasis,
        graphFunction: runtime.graphFunction,
        graph: runtime.graph,
        sourceCursor: cursor,
        targetCursor,
        variant: {
          completionClass: "fan_out_success",
          cCall: parentCCall,
          result,
          judgment,
          application,
          completion: replayed,
          transitionContractRef: runtime.closureContract.transitionContractRef,
        },
        basis: admissionBasis({
          eventTime: runtime.eventTime,
          correlationId: frame.foldbackCorrelationId,
        }, "fan-out-successful-retry-exit"),
      })
    : (() => {
        const proposal = Routes.proposeFanOutRoute(
          runtime.graph,
          application,
          cursor,
          targetCursor,
          parentCCall,
          replayed,
          replayState,
          runtime.closureContract.transitionContractRef,
        );
        return proposal.kind !== "traversal_route_candidate"
          ? proposal
          : Abg.admitRoute(
              runtime.store,
              runtime.executionBasis,
              runtime.graph,
              cursor,
              targetCursor,
              replayState,
              proposal,
              admissionBasis({
                eventTime: runtime.eventTime,
                correlationId: frame.foldbackCorrelationId,
              }, "fan-out-route"),
              {
                graphFunction: runtime.graphFunction,
                cCall: parentCCall,
                result,
                judgment,
                application,
                completion: replayed,
              },
              { terminalizeRun: runtime.terminalMode !== "return_to_parent" },
            );
      })();
  const route = "route" in admitted ? admitted.route : admitted;
  if (route.kind !== "admitted_traversal_route") {
    return workflowFailure(
      frame,
      "fan-out-route-admission",
      `diagnostic://abiogenesis/hog/${"code" in route ? route.code : "route_refused"}@5`,
      route as unknown as JsonValue,
    );
  }
  if (replayed.completionKind === "partial_stop") {
    const terminalizesRun = runtime.terminalMode !== "return_to_parent";
    if (
      route.routeKind !== "blocked" ||
      (route.runStoppedEventRef !== null) !== terminalizesRun
    ) {
      return workflowFailure(
        frame,
        "fan-out-partial-stop",
        "diagnostic://abiogenesis/hog/fan-out-run-stop-absent@5",
        route as unknown as JsonValue,
      );
    }
    return completion(
      "blocked",
      Abg.replay(runtime.store, { runId: runtime.openedTraversalScope.runId }),
      {
        cCallRef: parentCCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        resultValue: result.value,
        diagnosticRef: judgment.reasonRef,
      },
    );
  }
  if (route.routeKind !== "advance" || targetCursor === null) {
    return workflowFailure(
      frame,
      "fan-out-complete-route",
      "diagnostic://abiogenesis/hog/fan-out-advance-absent@5",
      route as unknown as JsonValue,
    );
  }
  const nextCursor = applyAdmittedRoute(cursor, targetCursor, "advance", route);
  if (nextCursor.kind === "traversal_refusal") {
    return workflowFailure(
      frame,
      "fan-out-route-application",
      `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
      nextCursor as unknown as JsonValue,
    );
  }
  return completion(
    "advanced",
    Abg.replay(runtime.store, { runId: runtime.openedTraversalScope.runId }),
    {
      cCallRef: parentCCall.cCallRef,
      resultRef: replayed.outputVectorRef,
      judgmentRef: judgment.judgmentRef,
      nextCursor,
      resultValue: replayed.outputVector,
      continuationKind: "advance",
      nextInputContractRef: replayed.outputVectorContractRef,
    },
  );
}

function completeWorkflowTraversal(
  frame: WorkflowChildFoldFrame,
  child: ExecutableTraversalCompletion,
  resultValueKind: string,
  failureValueKind: string,
  judgmentRelation: NonNullable<
    ReturnType<LeafInvocationPort["resolveJudgmentRelation"]>
  >,
  successResultValue: Readonly<Record<string, JsonValue>> | null,
): ExecutableTraversalCompletion {
  const { runtime, cursor, workflowTerm, parentCCall } = frame;
  const failedFanOutTask = child.disposition === "failed" &&
    frame.application !== null;
  if (
    parentCCall.callClass !== "workflow" ||
    workflowTerm.graphFunctionRef !== parentCCall.childGraphFunctionRef ||
    child.resultRef === null ||
    child.judgmentRef === null ||
    child.resultValue === null ||
    (child.disposition !== "closed" &&
      child.disposition !== "blocked" &&
      !failedFanOutTask)
  ) {
    return workflowFailure(
      frame,
      "workflow-child-completion",
      "diagnostic://abiogenesis/hog/child-completion-incomplete@5",
      child as unknown as JsonValue,
    );
  }
  const foldback = Abg.admitChildFoldback(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    cursor,
    parentCCall,
    frame.childExecutionBasis,
    frame.childTraversalScope,
    {
      childResultRef: child.resultRef,
      childJudgmentRef: child.judgmentRef,
      childClosureRef: child.closureRef,
    },
    admissionBasis({
      eventTime: runtime.eventTime,
      correlationId: frame.foldbackCorrelationId,
    }, "child-foldback"),
  );
  if (foldback.kind !== "child_foldback_admission") {
    return workflowFailure(
      frame,
      "workflow-child-foldback",
      `diagnostic://abiogenesis/hog/${foldback.code}@5`,
      foldback as unknown as JsonValue,
    );
  }
  const childSucceeded = child.disposition === "closed";
  const childValue = childSucceeded
    ? successResultValue ?? child.resultValue
    : child.resultValue;
  const evidence = Abg.admitEvidence(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    cursor,
    parentCCall,
    Abg.deriveSubTraversalEvidence(
      parentCCall,
      foldback,
      cursor.inputDigest,
      sha256Canonical(childValue),
    ),
    parentCCall.evidenceContractRef,
    cursor.inputDigest,
    admissionBasis({
      eventTime: runtime.eventTime,
      correlationId: frame.foldbackCorrelationId,
    }, "sub-traversal-evidence"),
  );
  if (evidence.kind === "c_call_admission_rejection") {
    const rejected = Abg.completeRejectedCCall(
      runtime.store,
      runtime.graph,
      runtime.graphFunction,
      cursor,
      parentCCall,
      evidence,
      admissionBasis({
        eventTime: runtime.eventTime,
        correlationId: frame.foldbackCorrelationId,
      }, "sub-traversal-evidence-rejection"),
    );
    return completeBlockedWorkflowTraversal(
      frame,
      rejected.refusalResultRef,
      rejected.rejectionJudgmentRef,
      rejected.judgmentEventRef,
      evidence.diagnosticRef,
    );
  }
  const result = Abg.admitResult(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    cursor,
    parentCCall,
    childValue,
    childSucceeded ? "success" : "failure",
    childSucceeded
      ? parentCCall.outputContractRef
      : parentCCall.failureContractRef,
    childSucceeded ? resultValueKind : failureValueKind,
    childSucceeded
      ? (value) => runtime.leafPort.validateContractValue(
          workflowTerm.outputCarrierRef,
          "output",
          value,
        ) && judgmentRelation.evaluate(frame.value, value)
      : (value) => isRecord(value) &&
          value.kind === failureValueKind &&
          value.schemaVersion === "5.0.0",
    [evidence],
    admissionBasis({
      eventTime: runtime.eventTime,
      correlationId: frame.foldbackCorrelationId,
    }, "workflow-result"),
  );
  if (result.kind === "c_call_admission_rejection") {
    const rejected = Abg.completeRejectedCCall(
      runtime.store,
      runtime.graph,
      runtime.graphFunction,
      cursor,
      parentCCall,
      result,
      admissionBasis({
        eventTime: runtime.eventTime,
        correlationId: frame.foldbackCorrelationId,
      }, "workflow-result-rejection"),
    );
    return completeBlockedWorkflowTraversal(
      frame,
      rejected.refusalResultRef,
      rejected.rejectionJudgmentRef,
      rejected.judgmentEventRef,
      result.diagnosticRef,
    );
  }
  const resultReplay = Abg.replay(runtime.store, {
    runId: runtime.openedTraversalScope.runId,
  });
  const judgmentCandidate = childSucceeded
    ? proposeJudgment(
        parentCCall,
        result,
        resultReplay,
        frame.value,
        judgmentRelation,
        parentCCall.judgmentContractRef,
      )
    : proposeFailureJudgment(
        parentCCall,
        result,
        resultReplay,
        child.diagnosticRef ??
          "diagnostic://abiogenesis/hog/child-traversal-blocked@5",
        parentCCall.judgmentContractRef,
      );
  const judgment = Abg.admitJudgment(
    runtime.store,
    runtime.graph,
    runtime.graphFunction,
    cursor,
    parentCCall,
    result,
    judgmentCandidate,
    resultReplay,
    admissionBasis({
      eventTime: runtime.eventTime,
      correlationId: frame.foldbackCorrelationId,
    }, "workflow-judgment"),
  );
  if (judgment.kind === "c_call_admission_rejection") {
    const rejected = Abg.completeRejectedCCall(
      runtime.store,
      runtime.graph,
      runtime.graphFunction,
      cursor,
      parentCCall,
      judgment,
      admissionBasis({
        eventTime: runtime.eventTime,
        correlationId: frame.foldbackCorrelationId,
      }, "workflow-judgment-rejection"),
    );
    return completeBlockedWorkflowTraversal(
      frame,
      rejected.refusalResultRef,
      rejected.rejectionJudgmentRef,
      rejected.judgmentEventRef,
      judgment.diagnosticRef,
    );
  }
  const fanOut = frame.application;
  const validateVector = (value: unknown): value is Readonly<
    Record<string, JsonValue>
  > => fanOut !== null && runtime.leafPort.validateContractValue(
    fanOut.outputVectorRef,
    "output",
    value,
  );
  if (judgment.judgment !== "advance") {
    if (fanOut !== null) {
      const fanOutCompletion = Abg.admitFanOutCompletion({
        store: runtime.store,
        executionBasis: runtime.executionBasis,
        graph: runtime.graph,
        application: fanOut,
        sourceCursor: cursor,
        replayState: Abg.replay(runtime.store, {
          runId: runtime.openedTraversalScope.runId,
        }),
        completionKind: "partial_stop",
        validateOutputVector: validateVector,
        basis: admissionBasis({
          eventTime: runtime.eventTime,
          correlationId: frame.foldbackCorrelationId,
        }, "fan-out-partial-stop"),
      });
      if (fanOutCompletion.kind !== "fan_out_completion_admission") {
        return workflowFailure(
          frame,
          "fan-out-partial-stop-admission",
          `diagnostic://abiogenesis/hog/${fanOutCompletion.code}@5`,
          fanOutCompletion as unknown as JsonValue,
        );
      }
      return completeFanOutWorkflowRoute(
        frame,
        result,
        judgment,
        fanOutCompletion,
        null,
      );
    }
    return completeBlockedWorkflowTraversal(
      frame,
      result.resultRef,
      judgment.judgmentRef,
      judgment.admissionEventRef,
      judgment.reasonRef,
    );
  }
  const continuationCursor = deriveCompletedTraversalCursor(
    runtime.graph,
    cursor,
    { inputRef: result.resultRef, inputDigest: result.valueDigest },
  );
  if (continuationCursor?.kind === "traversal_refusal") {
    return workflowFailure(
      frame,
      "workflow-continuation",
      `diagnostic://abiogenesis/hog/${continuationCursor.code}@5`,
      continuationCursor as unknown as JsonValue,
    );
  }
  const sourceContinuation = deriveCSourceContinuation(
    runtime.graph.template,
    cursor.currentNodeRef,
    cursor.termPath,
  );
  if (
    fanOut !== null &&
    sourceContinuation.kind === "c_source_continuation" &&
    sourceContinuation.disposition === "advance" &&
    sourceContinuation.relation === "compose_next"
  ) {
    const fanOutCompletion = Abg.admitFanOutCompletion({
      store: runtime.store,
      executionBasis: runtime.executionBasis,
      graph: runtime.graph,
      application: fanOut,
      sourceCursor: cursor,
      replayState: Abg.replay(runtime.store, {
        runId: runtime.openedTraversalScope.runId,
      }),
      completionKind: "complete_vector",
      validateOutputVector: validateVector,
      basis: admissionBasis({
        eventTime: runtime.eventTime,
        correlationId: frame.foldbackCorrelationId,
      }, "fan-out-complete-vector"),
    });
    if (
      fanOutCompletion.kind !== "fan_out_completion_admission" ||
      fanOutCompletion.completionKind !== "complete_vector"
    ) {
      return workflowFailure(
        frame,
        "fan-out-complete-vector-admission",
        fanOutCompletion.kind === "fan_out_completion_admission"
          ? "diagnostic://abiogenesis/hog/fan-out-completion-kind-mismatch@5"
          : `diagnostic://abiogenesis/hog/${fanOutCompletion.code}@5`,
        fanOutCompletion as unknown as JsonValue,
      );
    }
    const fanInCursor = deriveCompletedTraversalCursor(
      runtime.graph,
      cursor,
      {
        inputRef: fanOutCompletion.outputVectorRef,
        inputDigest: fanOutCompletion.outputVectorDigest,
      },
    );
    if (fanInCursor?.kind === "traversal_refusal") {
      return workflowFailure(
        frame,
        "fan-in-continuation",
        `diagnostic://abiogenesis/hog/${fanInCursor.code}@5`,
        fanInCursor as unknown as JsonValue,
      );
    }
    return completeFanOutWorkflowRoute(
      frame,
      result,
      judgment,
      fanOutCompletion,
      fanInCursor,
    );
  }
  const successful = admitSuccessfulRetryExitRoute({
    store: runtime.store,
    executionBasis: runtime.executionBasis,
    graphFunction: runtime.graphFunction,
    graph: runtime.graph,
    sourceCursor: cursor,
    targetCursor: continuationCursor,
    variant: {
      completionClass: "judged_success",
      cCall: parentCCall,
      result,
      judgment,
      transitionContractRef: runtime.closureContract.transitionContractRef,
    },
    basis: admissionBasis({
      eventTime: runtime.eventTime,
      correlationId: frame.foldbackCorrelationId,
    }, "workflow-successful-retry-exit"),
  });
  if (successful.kind !== "successful_retry_exit_route_admission") {
    return workflowFailure(
      frame,
      "workflow-successful-retry-exit",
      `diagnostic://abiogenesis/hog/${successful.code}@5`,
      successful.candidate,
    );
  }
  const route = successful.route;
  if (route.routeKind === "advance") {
    if (continuationCursor === null) {
      return workflowFailure(
        frame,
        "workflow-route-application",
        "diagnostic://abiogenesis/hog/workflow-advance-target-absent@5",
        route as unknown as JsonValue,
      );
    }
    const nextCursor = applyAdmittedRoute(
      cursor,
      continuationCursor,
      "advance",
      route,
    );
    if (nextCursor.kind === "traversal_refusal") {
      return workflowFailure(
        frame,
        "workflow-route-application",
        `diagnostic://abiogenesis/hog/${nextCursor.code}@5`,
        nextCursor as unknown as JsonValue,
      );
    }
    return completion(
      "advanced",
      Abg.replay(runtime.store, { runId: runtime.openedTraversalScope.runId }),
      {
        cCallRef: parentCCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
        nextCursor,
        resultValue: result.value,
        continuationKind: "advance",
        nextInputContractRef: parentCCall.outputContractRef,
      },
    );
  }
  if (route.routeKind !== "terminal") {
    return workflowFailure(
      frame,
      "workflow-route-kind",
      "diagnostic://abiogenesis/hog/unexpected-workflow-route@5",
      route as unknown as JsonValue,
    );
  }
  const closure = runtime.terminalMode === "return_to_parent"
    ? Abg.admitChildClosure(
        runtime.store,
        selectHeldEventStoreDurablePrefix(runtime.store),
        runtime.openedTraversalScope,
        parentCCall,
        result,
        judgment,
        route,
        runtime.closureContract,
        admissionBasis({
          eventTime: runtime.eventTime,
          correlationId: frame.foldbackCorrelationId,
        }, "workflow-child-closure"),
      )
    : Abg.admitClosure(
        runtime.store,
        selectHeldEventStoreDurablePrefix(runtime.store),
        parentCCall,
        result,
        judgment,
        route,
        runtime.closureContract,
        admissionBasis({
          eventTime: runtime.eventTime,
          correlationId: frame.foldbackCorrelationId,
        }, "workflow-closure"),
      );
  if (
    closure.kind !== "child_closure_admission" &&
    closure.kind !== "closure_admission"
  ) {
    return workflowFailure(
      frame,
      "workflow-closure",
      `diagnostic://abiogenesis/hog/${closure.code}@5`,
      closure as unknown as JsonValue,
    );
  }
  return completion(
    "closed",
    Abg.replay(runtime.store, { runId: runtime.openedTraversalScope.runId }),
    {
      cCallRef: parentCCall.cCallRef,
      resultRef: result.resultRef,
      judgmentRef: judgment.judgmentRef,
      closureRef: closure.closureRef,
      resultValue: result.value,
    },
  );
}

function completeWorkflowLocus(
  frame: WorkflowChildFoldFrame,
  child: ExecutableTraversalCompletion,
  failLocus: TraversalLocusFailure,
): TraversalLocusEvaluation {
  const { runtime, workflowTerm, parentCCall, ordinal } = frame;
  if (child.disposition === "held") {
    return {
      completion: suspendHeldWorkflowTraversal(frame, child),
      outputValueKind: null,
      outputContractRef: null,
    };
  }
  if (child.disposition === "failed" && child.replayState.runtimeStatus === "failed") {
    return { completion: child, outputValueKind: null, outputContractRef: null };
  }
  const intent = rehydrateConstructionIntentForCursor(runtime.store, frame.cursor);
  const actionBasis = intent?.actionKind === "invoke_graph_function" &&
      child.disposition === "closed" &&
      child.resultRef !== null &&
      child.judgmentRef !== null &&
      child.closureRef !== null &&
      isRecord(child.resultValue)
    ? deriveGraphFunctionActionEvaluationBasis(
        runtime.store,
        runtime.executionBasis,
        frame.cursor,
        {
          childGraphFunctionRef: workflowTerm.graphFunctionRef,
          childResultRef: child.resultRef,
          childResultValue: child.resultValue as Readonly<Record<string, JsonValue>>,
          childJudgmentRef: child.judgmentRef,
          childClosureRef: child.closureRef,
        },
      )
    : null;
  if (
    intent?.actionKind === "invoke_graph_function" &&
    child.disposition === "closed" &&
    actionBasis === null
  ) {
    return failLocus(
      `workflow-action-evaluation-basis-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-action-evaluation-basis-absent@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  const outputKind = runtime.leafPort.contractValueKind(
    workflowTerm.outputCarrierRef,
    "output",
  );
  const failureKind = runtime.leafPort.contractValueKind(
    parentCCall.failureContractRef,
    "failure",
  );
  const judgment = runtime.leafPort.resolveJudgmentRelation(
    parentCCall.judgmentPredicateRef,
  );
  if (outputKind === null || failureKind === null || judgment === null) {
    return failLocus(
      `workflow-contract-${ordinal}`,
      "diagnostic://abiogenesis/hog/workflow-result-contract-absent@5",
      {
        outputContractRef: workflowTerm.outputCarrierRef,
        predicateRef: parentCCall.judgmentPredicateRef,
      },
    );
  }
  return {
    completion: completeWorkflowTraversal(
      frame,
      child,
      outputKind,
      failureKind,
      judgment,
      actionBasis,
    ),
    outputValueKind: outputKind,
    outputContractRef: workflowTerm.outputCarrierRef,
  };
}

type ExecutableLocusStep =
  | Readonly<{ kind: "locus_evaluation"; evaluation: TraversalLocusEvaluation }>
  | Readonly<{
      kind: "retry_request";
      resume: ProjectedRetryResumeSuccess;
      correlationId: string;
    }>
  | Readonly<{
      kind: "recursion_child_request";
      frame: RecursionChildFoldFrame;
      prepared: PreparedChildTraversal;
      correlationId: string;
      outputValueKind: string;
      outputContractRef: string;
    }>;

interface WorkflowReturnFoldFrame {
  readonly kind: "workflow_return";
  readonly parent: TraversalEvaluationFrame;
  readonly workflow: WorkflowChildFoldFrame;
}

interface RecursionReturnFoldFrame {
  readonly kind: "recursion_return";
  readonly parent: TraversalEvaluationFrame;
  readonly recursion: RecursionChildFoldFrame;
  readonly outputValueKind: string;
  readonly outputContractRef: string;
}

type TraversalReturnFoldFrame =
  | WorkflowReturnFoldFrame
  | RecursionReturnFoldFrame;

interface EvaluateTraversalFoldState {
  readonly stateKind: "evaluate";
  readonly frame: TraversalEvaluationFrame;
  readonly returns: readonly TraversalReturnFoldFrame[];
}

interface ReturnTraversalFoldState {
  readonly stateKind: "return";
  readonly completion: ExecutableTraversalCompletion;
  readonly returns: readonly TraversalReturnFoldFrame[];
}

interface DoneTraversalFoldState {
  readonly stateKind: "done";
  readonly completion: ExecutableTraversalCompletion;
}

type TraversalFoldState =
  | EvaluateTraversalFoldState
  | ReturnTraversalFoldState
  | DoneTraversalFoldState;

type OpenTraversalFoldState =
  | EvaluateTraversalFoldState
  | ReturnTraversalFoldState;

type TraversalLocusStep = WorkflowLocusStep | ExecutableLocusStep;

function reprojectProjectedRetryResume(
  input: ExecuteGraphTraversalCommonInput,
  carrier: ProjectedRetryResumeSuccess,
): ReprojectedProjectedRetryResume | null {
  try {
    const durableEvents = readRuntimeEventsAtDurablePrefix(
      carrier.successorPrefix,
    );
    const routeEvent = durableEvents.at(-2);
    const attemptEvent = durableEvents.at(-1);
    if (
      routeEvent?.kind !== "traversal_route_admitted" ||
      routeEvent.eventId !== carrier.routeAdmissionEventRef ||
      attemptEvent?.kind !== "retry_attempt_opened" ||
      attemptEvent.eventId !== carrier.retryAttemptAdmissionEventRef ||
      routeEvent.admissionOrdinal + 1 !== attemptEvent.admissionOrdinal
    ) return null;
    const authorityPrefix = selectValidatedRuntimeEventPrefix(durableEvents);
    const prefix = selectValidatedRuntimeEventPrefix(
      durableEvents,
      { runId: carrier.nextCursor.runId },
    );
    const executionBasis = rehydrateExecutionBasisAtPrefix(
      prefix,
      carrier.nextCursor.executionBasisRef,
    );
    if (
      executionBasis === null ||
      !sameCanonical(executionBasis, input.executionBasis) ||
      executionBasis.graphRef !== input.graph.materializationRef ||
      executionBasis.graphDigest !== input.graph.materializationDigest ||
      executionBasis.rawInputAdmissionRef !== input.graph.admittedInputRef ||
      executionBasis.rawInputDigest !== input.graph.admittedInputDigest ||
      canonicalDigest(executionBasis.rawInputValue) !==
        executionBasis.rawInputDigest
    ) return null;
    const frontier = projectDeclaredCRetryFrontier(
      prefix,
      input.graph,
      carrier.nextCursor,
      input.graphFunction,
      carrier.nextCursor.retryPath.length,
      authorityPrefix,
    );
    const active = frontier?.state === "attempt_active"
      ? frontier.active
      : null;
    const prior = frontier?.rows.at(-2);
    if (
      active === null ||
      prior?.kind !== "declared_c_retry_retry_progress" ||
      prior.consumption.kind !== "progress_consumed_by_retry"
    ) return null;
    const progress = prior.progress;
    const ownedRoute = prior.consumption.route;
    const route = projectAdmittedRetryRouteAtPrefix(
      prefix,
      ownedRoute.admissionEventRef,
      authorityPrefix,
    );
    const sourceCursor = rehydrateHeldInteractionCursor(
      prefix,
      prior.failureCCall.sourceCursor,
    );
    if (route === null || sourceCursor === null) {
      return null;
    }
    const targetCursor = deriveRetryTraversalCursor(input.graph, sourceCursor, {
      inputRef: carrier.inputRef,
      inputDigest: carrier.inputDigest,
    });
    if (targetCursor.kind !== "traversal_cursor") return null;
    const applied = applyAdmittedRoute(
      sourceCursor,
      targetCursor,
      "retry",
      route,
    );
    if (
      applied.kind === "traversal_refusal" ||
      !sameCanonical(applied, carrier.nextCursor) ||
      route.admissionEventRef !== carrier.routeAdmissionEventRef ||
      route.routeRef !== carrier.routeRef ||
      route.routeDigest !== carrier.routeDigest ||
      route.sourceCursorRef !== sourceCursor.cursorRef ||
      route.sourceCursorDigest !== sourceCursor.cursorDigest ||
      route.targetCursorRef !== carrier.nextCursor.cursorRef ||
      route.targetCursorDigest !== carrier.nextCursor.cursorDigest ||
      route.cCallRef !== progress.cCallRef ||
      route.judgmentRef !== progress.judgmentRef ||
      !sameCanonical(route.consumedAvailabilityRefs, [
        progress.judgmentRef,
        progress.progressRef,
      ])
    ) return null;
    const attempt = active.attempt;
    if (
      attempt.admissionEventRef !== carrier.retryAttemptAdmissionEventRef ||
      attempt.attemptRef !== carrier.retryAttemptRef ||
      attempt.attemptDigest !== carrier.retryAttemptDigest ||
      attempt.attempt !== carrier.nextAttempt ||
      attempt.retryBoundaryRef !== progress.retryBoundaryRef ||
      attempt.priorJudgmentRef !== progress.judgmentRef ||
      attempt.priorRouteRef !== route.routeRef ||
      attempt.inputContractRef !== carrier.inputContractRef ||
      attempt.inputRef !== carrier.inputRef ||
      attempt.inputDigest !== carrier.inputDigest ||
      !sameCanonical(attempt.inputValue, carrier.inputValue) ||
      !sameCanonical(attempt.retryPath, carrier.nextCursor.retryPath) ||
      !sameCanonical(active.cursor, carrier.nextCursor) ||
      !sameCanonical(active.currentCursor, carrier.nextCursor) ||
      progress.admissionEventRef !== carrier.progressEventRef
    ) return null;
    return { cursor: applied, executionBasis };
  } catch {
    return null;
  }
}

function initializeTraversalEvaluationFrame(
  input: ExecuteGraphTraversalInput,
): TraversalEvaluationFrame {
  const projectedBranch = Object.hasOwn(input, "projectedRetryResume");
  const initialInput = projectedBranch
    ? null
    : input as InitialOrNonRetryExecuteGraphTraversalInput;
  if (
    initialInput !== null &&
    (
      !isExecutionBasis(input.executionBasis) ||
      input.graph.admittedInputRef !==
        input.executionBasis.rawInputAdmissionRef ||
      input.graph.admittedInputDigest !== input.executionBasis.rawInputDigest ||
      input.graphValidation.admittedInputRef !==
        input.executionBasis.rawInputAdmissionRef ||
      input.graphValidation.admittedInputDigest !==
        input.executionBasis.rawInputDigest ||
      initialInput.inputDigest !== input.executionBasis.rawInputDigest ||
      canonicalDigest(initialInput.input) !== initialInput.inputDigest ||
      canonicalDigest(input.executionBasis.rawInputValue) !==
        input.executionBasis.rawInputDigest ||
      !sameCanonical(
        initialInput.input,
        input.executionBasis.rawInputValue,
      )
    )
  ) {
    throw new TypeError(
      "diagnostic://abiogenesis/hog/execution-basis-input-mismatch@5",
    );
  }
  let projectedStop: TraverseResult | null = null;
  let projectedInput: Readonly<Record<string, JsonValue>> | null = null;
  let projectedCursor: TraversalCursor | null = null;
  let projectedExecutionBasis: ExecutionBasis | null = null;
  if (projectedBranch) {
    const candidate = (input as unknown as Readonly<Record<string, unknown>>)
      .projectedRetryResume;
    if (
      Object.hasOwn(input, "input") ||
      Object.hasOwn(input, "inputDigest") ||
      Object.hasOwn(input, "resume") ||
      !isProjectedRetryResumeCarrier(candidate)
    ) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
      );
    }
    try {
      assertHeldEventStoreAtDurablePrefix(input.store, candidate.successorPrefix);
    } catch {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-prefix-mismatch@5",
      );
    }
    const reprojected = reprojectProjectedRetryResume(input, candidate);
    if (reprojected === null) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-projection-mismatch@5",
      );
    }
    let traversal;
    try {
      traversal = traversalAtCursor(input, candidate.nextCursor);
    } catch {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-traversal-mismatch@5",
      );
    }
    if (
      traversal.kind !== "traversal_stop_ref" ||
      traversal.stopClass !== "executable" ||
      !sameCanonical(traversal.cursor, candidate.nextCursor) ||
      !sameCanonical(reprojected.cursor, candidate.nextCursor) ||
      traversal.cursor.inputRef !== candidate.inputRef ||
      traversal.cursor.inputDigest !== candidate.inputDigest ||
      traversal.inputContractRef !== candidate.inputContractRef ||
      sha256Canonical(candidate.inputValue as unknown as JsonValue) !==
        candidate.inputDigest
    ) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-traversal-mismatch@5",
      );
    }
    projectedStop = traversal;
    projectedInput = candidate.inputValue;
    projectedCursor = candidate.nextCursor;
    projectedExecutionBasis = reprojected.executionBasis;
  }
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !== input.implementationSet.implementationSetRef ||
    input.leafPort.implementationSetDigest !== input.implementationSet.implementationSetDigest
  ) {
    return fail(
      input,
      "leaf-port",
      "diagnostic://abiogenesis/implementation/admitted-leaf-port-mismatch@5",
      { implementationSetRef: input.implementationSet.implementationSetRef },
    );
  }
  let stop: TraverseResult;
  let resumedCursor: TraversalCursor | undefined = projectedCursor ?? undefined;
  let currentInput: Readonly<Record<string, JsonValue>>;
  if (projectedStop !== null && projectedInput !== null) {
    stop = projectedStop;
    currentInput = projectedInput;
  } else if (initialInput?.resume !== undefined) {
    resumedCursor = initialInput.resume.cursor;
    if (
      !hasAdmittedTraversalCursor(input.store, initialInput.resume.cursor) ||
      initialInput.resume.cursor.executionBasisRef !== input.executionBasis.basisRef ||
      initialInput.resume.cursor.traversalScopeRef !==
        input.openedTraversalScope.scopeRef ||
      initialInput.resume.cursor.graphRef !== input.graph.materializationRef ||
      initialInput.resume.cursor.inputDigest !== initialInput.resume.inputDigest ||
      initialInput.resume.cursor.retryPath.length !== 0 ||
      sha256Canonical(initialInput.resume.input as unknown as JsonValue) !==
        initialInput.resume.inputDigest
    ) {
      return fail(
        input,
        "resume-basis",
        "diagnostic://abiogenesis/hog/resume-basis-mismatch@5",
        {
          cursorRef: initialInput.resume.cursor.cursorRef,
          inputDigest: initialInput.resume.inputDigest,
        },
      );
    }
    stop = traversalAtCursor(input, initialInput.resume.cursor);
    currentInput =
      materializedInputAtCursor(input.graph, activeCursor(stop))?.value ??
        initialInput.resume.input;
  } else {
    if (initialInput === null) {
      throw new TypeError(
        "diagnostic://abiogenesis/hog/projected-retry-carrier-mismatch@5",
      );
    }
    try {
      stop = traverse({
        program: input.program,
        graphFunction: input.graphFunction,
        graph: input.graph,
        graphValidation: input.graphValidation,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
      });
    } catch {
      return fail(
        input,
        "initial-traversal",
        "diagnostic://abiogenesis/hog/traversal-exception@5",
        { errorClass: "traversal_exception" },
      );
    }
    currentInput =
      materializedInputAtCursor(input.graph, activeCursor(stop))?.value ??
        initialInput.input;
  }
  const graphEntryBasis = projectedExecutionBasis ?? input.executionBasis;
  const graphEntryInput = graphEntryBasis.rawInputValue;
  const graphEntryInputDigest = graphEntryBasis.rawInputDigest;
  if (stop.kind === "traversal_refusal") {
    return fail(
      input,
      "initial-traversal-refusal",
      `diagnostic://abiogenesis/hog/${stop.code}@5`,
      stop as unknown as JsonValue,
    );
  }
  const initialCursor = stop.kind === "traversal_stop_ref" ? stop.cursor : stop;
  if (resumedCursor === undefined) {
    const cursorAdmission = admitInitialTraversalCursor(
      input.store,
      input.executionBasis,
      input.openedTraversalScope,
      input.graph,
      input.graphValidation,
      initialCursor,
      {
        eventTime: input.eventTime,
        correlationId: `${input.correlationId}/cursor`,
        causationEventRefs: [],
      },
    );
    if (cursorAdmission.kind !== "traversal_cursor_admission") {
      return fail(
        input,
        "cursor-refusal",
        `diagnostic://abiogenesis/hog/${cursorAdmission.code}@5`,
        cursorAdmission as unknown as JsonValue,
      );
    }
  }

  return {
    runtime: input,
    graphEntryInput,
    graphEntryInputDigest,
    cursor: initialCursor,
    input: currentInput,
    ordinal: 0,
    structuralOrdinal: 0,
  };
}

function continueTraversalFold(
  frame: TraversalEvaluationFrame,
  evaluation: TraversalLocusEvaluation,
  returns: readonly TraversalReturnFoldFrame[],
): TraversalFoldState {
  const runtime = frame.runtime;
  const completion = evaluation.completion;
  if (completion.disposition !== "advanced") {
    return {
      stateKind: "return",
      completion,
      returns,
    };
  }
  const nextMaterializedInput = materializedInputAtCursor(
    runtime.graph,
    completion.nextCursor,
  );
  if (
    completion.nextCursor === null ||
    completion.continuationKind === null ||
    completion.nextInputContractRef === null ||
    evaluation.outputValueKind === null ||
    evaluation.outputContractRef === null ||
    (nextMaterializedInput === null &&
      (typeof completion.resultValue !== "object" ||
        completion.resultValue === null ||
        Array.isArray(completion.resultValue))) ||
    (nextMaterializedInput === null &&
      (completion.continuationKind === "retry"
        ? completion.nextCursor.inputRef.length === 0 ||
          completion.nextCursor.inputDigest !==
            sha256Canonical(completion.resultValue)
        : !runtime.leafPort.validateContractValue(
            completion.nextInputContractRef,
            "output",
            completion.resultValue,
          )))
  ) {
    return fail(
      runtime,
      `advanced-result-${frame.ordinal}`,
      "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
      {
        leafOrdinal: frame.ordinal,
        completionDisposition: completion.disposition,
      },
    );
  }
  const nextInput = nextMaterializedInput?.value ??
    completion.resultValue as Readonly<Record<string, JsonValue>>;
  return {
    stateKind: "evaluate",
    frame: {
      ...frame,
      cursor: completion.nextCursor,
      input: nextInput,
      ordinal: frame.ordinal + 1,
      structuralOrdinal: 0,
    },
    returns,
  };
}

function traversalFoldProgram(
  initialFoldState: TraversalFoldState,
  failureRuntime: ExecuteGraphTraversalCommonInput,
): Effect.Effect<ExecutableTraversalCompletion> {
  return Effect.suspend(() => Effect.gen(function* () {
  const evaluateLocusOnce = (
    runtimeFrame: TraversalEvaluationFrame,
    cursor: TraversalCursor,
    directStep: DirectCTraversalStep,
    currentValue: Readonly<Record<string, JsonValue>>,
    leafOrdinal: number,
  ): Effect.Effect<TraversalLocusStep> => Effect.suspend(() => {
    const runtime = runtimeFrame.runtime;
    const failLocus = (
      stage: string,
      diagnosticRef: string,
      candidate: JsonValue,
    ): never => fail(runtime, stage, diagnosticRef, candidate);
    if (directStep.stepKind === "enter_child") {
      if (!isExactLocusStep(cursor, directStep)) {
        return failLocus(
          `workflow-step-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
          cursor as unknown as JsonValue,
        );
      }
      return beginWorkflowLocus({
        runtime,
        cursor,
        value: currentValue,
        graphEntryInput: runtimeFrame.graphEntryInput,
        graphEntryInputDigest: runtimeFrame.graphEntryInputDigest,
        ordinal: leafOrdinal,
        fail: failLocus,
      }) as Effect.Effect<TraversalLocusStep>;
    }
    if (directStep.stepKind !== "open_leaf") {
      return failLocus(
        `direct-step-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5",
        cursor as unknown as JsonValue,
      );
    }
    const currentStop = traversalAtCursor(runtime, cursor, directStep);
    if (
      currentStop.kind !== "traversal_stop_ref" ||
      !isExactLocusStep(currentStop, directStep)
    ) {
      return failLocus(
        `direct-step-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5",
        currentStop as unknown as JsonValue,
      );
    }
    if (directStep.leafKind === "interaction") {
      if (currentStop.stopClass !== "interaction") {
        return failLocus(
          `interaction-step-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/interaction-step-mismatch@5",
          currentStop as unknown as JsonValue,
        );
      }
      return Effect.sync(() => ({
        kind: "locus_evaluation" as const,
        evaluation: evaluateInteractionLocus({
          store: runtime.store,
          executionBasis: runtime.executionBasis,
          openedTraversalScope: runtime.openedTraversalScope,
          program: runtime.program,
          graphFunction: runtime.graphFunction,
          graph: runtime.graph,
          interactionSet: runtime.interactionSet,
          productBasis: runtime.continuationProductBasis,
          stop: currentStop,
          value: currentValue,
          closureContract: runtime.closureContract,
          clock: {
            eventTime: runtime.eventTime,
            correlationId:
              `${runtime.correlationId}/interaction/${leafOrdinal}`,
          },
          fail: failLocus,
        }),
      })) as Effect.Effect<TraversalLocusStep>;
    }
    if (currentStop.stopClass !== "executable") {
      return failLocus(
        `executable-step-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/executable-step-mismatch@5",
        currentStop as unknown as JsonValue,
      );
    }
    return beginExecutableLocus({
      runtime,
      stop: currentStop,
      value: currentValue,
      graphEntryInput: runtimeFrame.graphEntryInput,
      graphEntryInputDigest: runtimeFrame.graphEntryInputDigest,
      ordinal: leafOrdinal,
      fail: failLocus,
    }) as Effect.Effect<TraversalLocusStep>;
  });
  const folded = yield* Effect.iterate<
    TraversalFoldState,
    OpenTraversalFoldState,
    never,
    never
  >(
    initialFoldState,
    {
      while: (state): state is OpenTraversalFoldState =>
        state.stateKind !== "done",
      body: (state): Effect.Effect<TraversalFoldState> =>
        Effect.suspend(() => Effect.gen(function* () {
          if (state.stateKind === "return") {
            const continuation = state.returns.at(-1);
            if (continuation === undefined) {
              return {
                stateKind: "done" as const,
                completion: state.completion,
              };
            }
            const remaining = state.returns.slice(0, -1);
            const parentRuntime = continuation.parent.runtime;
            const failLocus = (
              stage: string,
              diagnosticRef: string,
              candidate: JsonValue,
            ): never => fail(parentRuntime, stage, diagnosticRef, candidate);
            if (continuation.kind === "workflow_return") {
              return continueTraversalFold(
                continuation.parent,
                completeWorkflowLocus(
                  continuation.workflow,
                  state.completion,
                  failLocus,
                ),
                remaining,
              );
            }
            const completion = completeRecursionChild(
              continuation.recursion,
              state.completion,
            );
            return continueTraversalFold(
              continuation.parent,
              {
                completion,
                outputValueKind: continuation.outputValueKind,
                outputContractRef: continuation.outputContractRef,
              },
              remaining,
            );
          }

          const frame = state.frame;
          const runtime = frame.runtime;
          const directStep = deriveDirectCStepFromGraph(runtime.graph.template, {
            nodeRef: frame.cursor.currentNodeRef,
            termPath: frame.cursor.termPath,
            taskOrdinal: frame.cursor.taskOrdinal,
            attempt: frame.cursor.attempt,
            retryPath: frame.cursor.retryPath,
          });
          if (directStep.kind === "direct_c_traversal_refusal") {
            return fail(
              runtime,
              `direct-step-${frame.ordinal}`,
              `diagnostic://abiogenesis/hog/${directStep.code}@5`,
              directStep as unknown as JsonValue,
            );
          }
          if (
            directStep.stepKind !== "open_leaf" &&
            directStep.stepKind !== "enter_child"
          ) {
            const structural = yield* advanceStructuralTraversal({
              store: runtime.store,
              program: runtime.program,
              graphFunction: runtime.graphFunction,
              graph: runtime.graph,
              graphValidation: runtime.graphValidation,
              executionBasis: runtime.executionBasis,
              openedTraversalScope: runtime.openedTraversalScope,
              initial: frame.cursor,
              step: directStep,
              inputValue: frame.input,
              inputAuthority: runtime.leafPort,
              routeOrdinal: frame.structuralOrdinal,
              clock: {
                eventTime: runtime.eventTime,
                correlationId:
                  `${runtime.correlationId}/structural/${frame.ordinal}`,
              },
            });
            if (
              structural.kind !== "traversal_cursor" ||
              !isTraversalCursorCandidate(structural as TraversalCursor) ||
              (structural as TraversalCursor).cursorRef === frame.cursor.cursorRef
            ) {
              return fail(
                runtime,
                `structural-step-${frame.ordinal}`,
                "diagnostic://abiogenesis/hog/structural-step-refused@5",
                structural as unknown as JsonValue,
              );
            }
            const structuralCursor = structural as TraversalCursor;
            return {
              stateKind: "evaluate" as const,
              frame: {
                ...frame,
                cursor: structuralCursor,
                input: materializedInputAtCursor(
                  runtime.graph,
                  structuralCursor,
                )?.value ?? frame.input,
                structuralOrdinal: frame.structuralOrdinal + 1,
              },
              returns: state.returns,
            };
          }
          const locus = yield* evaluateLocusOnce(
            frame,
            frame.cursor,
            directStep,
            frame.input,
            frame.ordinal,
          );
          if (locus.kind === "locus_evaluation") {
            return continueTraversalFold(
              frame,
              locus.evaluation,
              state.returns,
            );
          }
          if (locus.kind === "retry_request") {
            return {
              stateKind: "evaluate" as const,
              frame: initializeTraversalEvaluationFrame(
                projectedRetryTraversalInput(
                  runtime,
                  locus.resume,
                  locus.correlationId,
                ),
              ),
              returns: state.returns,
            };
          }
          if (locus.kind === "workflow_child_request") {
            return {
              stateKind: "evaluate" as const,
              frame: initializeTraversalEvaluationFrame(
                preparedChildTraversalInput(
                  runtime,
                  locus.prepared,
                  locus.correlationId,
                  locus.deferFailedRunStop,
                ),
              ),
              returns: [
                ...state.returns,
                {
                  kind: "workflow_return" as const,
                  parent: frame,
                  workflow: locus.frame,
                },
              ],
            };
          }
          return {
            stateKind: "evaluate" as const,
            frame: initializeTraversalEvaluationFrame(
              preparedChildTraversalInput(
                runtime,
                locus.prepared,
                locus.correlationId,
                runtime.deferFailedRunStop === true,
              ),
            ),
            returns: [
              ...state.returns,
              {
                kind: "recursion_return" as const,
                parent: frame,
                recursion: locus.frame,
                outputValueKind: locus.outputValueKind,
                outputContractRef: locus.outputContractRef,
              },
            ],
          };
        })),
    },
  );
  if (folded.stateKind !== "done") {
    return fail(
      failureRuntime,
      "fold-incomplete",
      "diagnostic://abiogenesis/hog/effect-fold-incomplete@5",
      { stateKind: folded.stateKind },
    );
  }
  return folded.completion;
  }));
}

function graphTraversalEffect(
  input: ExecuteGraphTraversalInput,
): Effect.Effect<ExecutableTraversalCompletion> {
  return traversalFoldProgram(
    {
      stateKind: "evaluate",
      frame: initializeTraversalEvaluationFrame(input),
      returns: [],
    },
    input,
  );
}

async function runGraphTraversalProgram(
  program: Effect.Effect<ExecutableTraversalCompletion>,
): Promise<ExecutableTraversalCompletion> {
  const exit = await runEffectProgram(program);
  if (Exit.isSuccess(exit)) return exit.value;
  throw Cause.squash(exit.cause);
}

function seedParentContinuation(
  parent: InitialOrNonRetryExecuteGraphTraversalInput,
  parentGraphInput: Readonly<Record<string, JsonValue>>,
  parentGraphInputDigest: `sha256:${string}`,
  completion: ExecutableTraversalCompletion,
  returns: readonly TraversalReturnFoldFrame[],
  stage: "interaction-resume" | "workflow-resume" | "recursion-resume",
): TraversalFoldState {
  if (completion.disposition !== "advanced") {
    return { stateKind: "return", completion, returns };
  }
  if (
      completion.nextCursor === null ||
      completion.resultValue === null ||
      typeof completion.resultValue !== "object" ||
      Array.isArray(completion.resultValue)
  ) {
    return fail(
        parent,
        `${stage}-advance`,
        `diagnostic://abiogenesis/hog/${stage}-advance-incomplete@5`,
        completion as unknown as JsonValue,
    );
  }
  const nextInput = completion.resultValue as Readonly<
    Record<string, JsonValue>
  >;
  const nextInputDigest = sha256Canonical(nextInput);
  if (completion.nextCursor.inputDigest !== nextInputDigest) {
    return fail(
        parent,
        `${stage}-advance-digest`,
        `diagnostic://abiogenesis/hog/${stage}-advance-digest-mismatch@5`,
        completion as unknown as JsonValue,
    );
  }
  return {
    stateKind: "evaluate",
    frame: initializeTraversalEvaluationFrame({
      ...parent,
      input: parentGraphInput,
      inputDigest: parentGraphInputDigest,
      resume: {
        cursor: completion.nextCursor,
        input: nextInput,
        inputDigest: nextInputDigest,
      },
    }),
    returns,
  };
}

export type ExecuteGraphTraversalRequest =
  | ExecuteGraphTraversalInput
  | ResumeHeldInteractionInput;

function rehydrateWorkflowReturnFrame(
  input: ResumeHeldParentFrameInput & Readonly<{
    suspension: HeldWorkflowSuspension;
    parentCCall: CCall;
  }>,
): WorkflowReturnFoldFrame {
  const parent = input.parent;
  const suspension = input.suspension;
  if (
    suspension.parentExecutionBasisRef !== parent.executionBasis.basisRef ||
    suspension.parentTraversalScope.scopeRef !==
      parent.openedTraversalScope.scopeRef ||
    suspension.parentGraph.materializationRef !==
      parent.graph.materializationRef ||
    suspension.parentCCall.cCallRef !== input.parentCCall.cCallRef ||
    suspension.sourceCursor.cursorRef !== input.sourceCursor.cursorRef ||
    suspension.childExecutionBasisRef !== input.childExecutionBasis.basisRef ||
    suspension.childTraversalScopeRef !== input.childTraversalScope.scopeRef ||
    suspension.terminalMode !== (parent.terminalMode ?? "close_run") ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    sha256Canonical(suspension.parentGraphInput as unknown as JsonValue) !==
      suspension.parentGraphInputDigest ||
    sha256Canonical(parent.input as unknown as JsonValue) !==
      parent.inputDigest ||
    parent.inputDigest !== suspension.parentGraphInputDigest ||
    sha256Canonical(suspension.parentInput as unknown as JsonValue) !==
      suspension.parentInputDigest ||
    sha256Canonical(suspension.childInput as unknown as JsonValue) !==
      suspension.childInputDigest
  ) {
    return fail(
      parent,
      "workflow-resume-lineage",
      "diagnostic://abiogenesis/hog/workflow-resume-lineage-mismatch@5",
      suspension as unknown as JsonValue,
    );
  }
  const traversal = traversalAtCursor(parent, input.sourceCursor);
  if (traversal.kind !== "traversal_cursor") {
    return fail(
      parent,
      "workflow-resume-step",
      "diagnostic://abiogenesis/hog/workflow-resume-step-mismatch@5",
      traversal as unknown as JsonValue,
    );
  }
  const workflowTerm = resolveTraversalTerm(parent.graph, traversal);
  if (
    workflowTerm.kind !== "c_workflow" ||
    workflowTerm.graphFunctionRef !== input.childExecutionBasis.graphFunctionRef
  ) {
    return fail(
      parent,
      "workflow-resume-child",
      "diagnostic://abiogenesis/hog/workflow-resume-child-mismatch@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  return {
    kind: "workflow_return",
    parent: {
      runtime: parent,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      cursor: input.sourceCursor,
      input: suspension.parentInput,
      ordinal: input.sourceCursor.taskOrdinal ?? 0,
      structuralOrdinal: 0,
    },
    workflow: {
      kind: "workflow_child_fold_frame",
      runtime: parent,
      cursor: input.sourceCursor,
      value: suspension.parentInput,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      ordinal: input.sourceCursor.taskOrdinal ?? 0,
      workflowTerm,
      parentCCall: input.parentCCall,
      application: fanOutApplicationForBatch(
        parent.graph,
        input.parentCCall.batchRef,
      ),
      childExecutionBasis: input.childExecutionBasis,
      childTraversalScope: input.childTraversalScope,
      childInput: suspension.childInput,
      childInputDigest: suspension.childInputDigest,
      foldbackCorrelationId:
        `${parent.correlationId}/workflow/resume-foldback`,
    },
  };
}

function rehydrateRecursionReturnFrame(
  input: ResumeHeldParentFrameInput & Readonly<{
    suspension: HeldRecursionSuspension;
  }>,
): RecursionReturnFoldFrame {
  const parent = input.parent;
  const suspension = input.suspension;
  const application = parent.graph.template.applications.find(
    (candidate): candidate is RecurseApplication =>
      candidate.relationKind === "recurse" &&
      candidate.applicationRef === suspension.application.applicationRef,
  );
  if (
    application === undefined ||
    sha256Canonical(application as unknown as JsonValue) !==
      sha256Canonical(suspension.application as unknown as JsonValue) ||
    suspension.parentExecutionBasisRef !== parent.executionBasis.basisRef ||
    suspension.parentTraversalScope.scopeRef !==
      parent.openedTraversalScope.scopeRef ||
    suspension.parentGraph.materializationRef !==
      parent.graph.materializationRef ||
    suspension.sourceCursor.cursorRef !== input.sourceCursor.cursorRef ||
    suspension.childExecutionBasisRef !== input.childExecutionBasis.basisRef ||
    suspension.childTraversalScopeRef !== input.childTraversalScope.scopeRef ||
    suspension.terminalMode !== (parent.terminalMode ?? "close_run") ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    sha256Canonical(suspension.parentGraphInput as unknown as JsonValue) !==
      suspension.parentGraphInputDigest ||
    parent.inputDigest !== suspension.parentGraphInputDigest ||
    sha256Canonical(parent.input as unknown as JsonValue) !==
      parent.inputDigest ||
    sha256Canonical(suspension.evaluatorInput as unknown as JsonValue) !==
      suspension.evaluatorInputDigest ||
    sha256Canonical(suspension.childInput as unknown as JsonValue) !==
      suspension.childInputDigest
  ) {
    return fail(
      parent,
      "recursion-resume-lineage",
      "diagnostic://abiogenesis/hog/recursion-resume-lineage-mismatch@5",
      suspension as unknown as JsonValue,
    );
  }
  const traversalStop = traversalAtCursor(parent, input.sourceCursor);
  if (
    traversalStop.kind !== "traversal_stop_ref" ||
    traversalStop.stopClass !== "executable"
  ) {
    return fail(
      parent,
      "recursion-resume-stop",
      "diagnostic://abiogenesis/hog/recursion-resume-stop-mismatch@5",
      traversalStop as unknown as JsonValue,
    );
  }
  const resolution = selectAdmittedImplementationResolution(
    parent.implementationSet,
    {
      graphFunctionRef: parent.graph.graphFunctionRef,
      nodeRef: traversalStop.nodeRef,
      programLocusRef: traversalStop.programLocusRef,
      implementationBindingRef: traversalStop.implementationBindingRef,
    },
  );
  const outputValueKind = parent.leafPort.contractValueKind(
    traversalStop.outputContractRef,
    "output",
  );
  if (resolution === null || outputValueKind === null) {
    return fail(
      parent,
      "recursion-resume-resolution",
      "diagnostic://abiogenesis/hog/recursion-resume-resolution-absent@5",
      traversalStop as unknown as JsonValue,
    );
  }
  const traversalInput: CompleteExecutableTraversalInput<
    Readonly<Record<string, JsonValue>>
  > = {
    store: parent.store,
    executionBasis: parent.executionBasis,
    openedTraversalScope: parent.openedTraversalScope,
    program: parent.program,
    graphFunction: parent.graphFunction,
    graph: parent.graph,
    traversalStop,
    implementationSet: parent.implementationSet,
    implementationResolution: resolution,
    leafPort: parent.leafPort,
    input: suspension.evaluatorInput,
    inputDigest: suspension.evaluatorInputDigest,
    closureContract: parent.closureContract,
    actorRuntimeBinding: parent.actorRuntimeBinding,
    ...(parent.deferFailedRunStop === true ? { deferFailedRunStop: true } : {}),
    terminalMode: "return_to_application",
    applicationCompletionMode: suspension.terminalMode,
    clock: {
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/recursion/restore`,
    },
  };
  const restoration: RestoreDeferredRecursionInput = {
    traversalInput,
    application,
    cCallRef: suspension.evaluatorCCall.cCallRef,
    resultRef: suspension.evaluatorResult.resultRef,
    judgmentRef: suspension.evaluatorJudgment.judgmentRef,
  };
  const deferred = restoreDeferredRecursion(restoration);
  if (
    deferred === null ||
    deferred.cCallRef !== suspension.evaluatorCCall.cCallRef ||
    deferred.resultRef !== suspension.evaluatorResult.resultRef ||
    deferred.judgmentRef !== suspension.evaluatorJudgment.judgmentRef ||
    sha256Canonical(deferred.resultValue as JsonValue) !==
      suspension.evaluatorResult.valueDigest
  ) {
    return fail(
      parent,
      "recursion-resume-deferred",
      "diagnostic://abiogenesis/hog/recursion-resume-deferred-mismatch@5",
      suspension as unknown as JsonValue,
    );
  }
  return {
    kind: "recursion_return",
    parent: {
      runtime: parent,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      cursor: input.sourceCursor,
      input: suspension.evaluatorInput,
      ordinal: input.sourceCursor.taskOrdinal ?? 0,
      structuralOrdinal: 0,
    },
    recursion: {
      kind: "recursion_child_fold_frame",
      parent,
      traversalInput,
      application,
      restored: deferred,
      restoration,
      graphEntryInput: suspension.parentGraphInput,
      graphEntryInputDigest: suspension.parentGraphInputDigest,
      leafOrdinal: input.sourceCursor.taskOrdinal ?? 0,
      childExecutionBasis: input.childExecutionBasis,
      childTraversalScope: input.childTraversalScope,
      childInput: suspension.childInput,
      childInputDigest: suspension.childInputDigest,
    },
    outputValueKind,
    outputContractRef: traversalStop.outputContractRef,
  };
}

function rehydrateParentReturnFrames(
  inputs: readonly ResumeHeldParentFrameInput[],
): readonly TraversalReturnFoldFrame[] {
  return Object.freeze(inputs.map((input) => {
    if (input.suspension.kind === "held_workflow_suspension") {
      if (input.parentCCall === null) {
        return fail(
          input.parent,
          "workflow-resume-parent-call",
          "diagnostic://abiogenesis/hog/workflow-resume-parent-call-absent@5",
          input.suspension as unknown as JsonValue,
        );
      }
      return rehydrateWorkflowReturnFrame({
        ...input,
        suspension: input.suspension,
        parentCCall: input.parentCCall,
      });
    }
    return rehydrateRecursionReturnFrame({
      ...input,
      suspension: input.suspension,
    });
  }).reverse());
}

function traversalProgram(
  input: ExecuteGraphTraversalRequest,
): Effect.Effect<ExecutableTraversalCompletion> {
  if ("interaction" in input) {
    return traversalFoldProgram(
      seedParentContinuation(
        input.parent,
        input.parent.input,
        input.parent.inputDigest,
        resumeInteractionOwner(input.interaction),
        rehydrateParentReturnFrames(input.parents),
        "interaction-resume",
      ),
      input.parent,
    );
  }
  return graphTraversalEffect(input);
}

export function executeGraphTraversal(
  input: ExecuteGraphTraversalRequest,
): Promise<ExecutableTraversalCompletion> {
  return runGraphTraversalProgram(traversalProgram(input));
}
