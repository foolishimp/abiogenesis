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
  type AdmittedInteractionSet,
  type CCall,
  type ContinuationProductBasis,
  type ExecutionBasis,
  type OpenedTraversalScope,
  type ReplayState,
} from "../abg/index.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import {
  projectDeclaredCRetryFrontier,
} from "../abg/retry.js";
import {
  assertHeldEventStoreAtDurablePrefix,
  readRuntimeEventsAtDurablePrefix,
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
import { isAdmittedLeafInvocationPort } from "../implementation/leaf_invocation_port.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { GraphValidation } from "../validator/graph.js";
import {
  advanceDeferredRecursion,
  completeWorkflowTraversal,
  restoreDeferredRecursion,
  type CompleteInteractionResumeInput,
  type CompleteExecutableTraversalInput,
  type RestoreDeferredRecursionInput,
} from "./execute.js";
import { resumeInteractionOwner } from "./interaction_resume.js";
import {
  deriveDirectCStepFromGraph,
  type DirectCTraversalStep,
} from "./direct_fold.js";
import {
  beginWorkflowLocus,
  completeWorkflowLocus,
  type WorkflowChildFoldFrame,
  type WorkflowLocusStep,
} from "./workflow_locus.js";
import { evaluateInteractionLocus } from "./interaction_locus.js";
import {
  beginExecutableLocus,
  type ExecutableLocusStep,
} from "./executable_locus.js";
import {
  completeRecursionChild,
  type RecursionChildFoldFrame,
} from "./recursion_execute.js";
import type { TraversalLocusEvaluation } from "./locus_evaluation.js";
import {
  type ChildTraversalPreparationPort,
  type PreparedChildTraversal,
} from "./child_traversal.js";
import {
  advanceStructuralTraversal,
  type StructuralTraversalResult,
} from "./structural_execute.js";
import {
  applyAdmittedRoute,
  deriveRetryTraversalCursor,
  rehydrateHeldInteractionCursor,
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

function activeCursor(
  value: StructuralTraversalResult | TraverseResult,
): TraversalCursor | null {
  if (value.kind === "traversal_stop_ref") return value.cursor;
  return value.kind === "traversal_cursor" ? value : null;
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
          runtime,
          stop: currentStop,
          value: currentValue,
          ordinal: leafOrdinal,
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
              structural.cursorRef === frame.cursor.cursorRef
            ) {
              return fail(
                runtime,
                `structural-step-${frame.ordinal}`,
                "diagnostic://abiogenesis/hog/structural-step-refused@5",
                structural as unknown as JsonValue,
              );
            }
            return {
              stateKind: "evaluate" as const,
              frame: {
                ...frame,
                cursor: structural,
                input: materializedInputAtCursor(
                  runtime.graph,
                  structural,
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
