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
  type AdmittedImplementationSet,
  type AdmittedInteractionSet,
  type ContinuationProductBasis,
  type ExecutionBasis,
  type OpenedTraversalScope,
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
import { lookupGraphFunctionDefinition } from "../product/catalog.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { GraphValidation } from "../validator/graph.js";
import {
  advanceDeferredRecursion,
  completeWorkflowTraversal,
  restoreDeferredRecursion,
  type CompleteInteractionResumeInput,
  type ExecutableTraversalCompletion,
  type CompleteExecutableTraversalInput,
  type HeldRecursionSuspension,
  type HeldWorkflowSuspension,
  type RestoreDeferredRecursionInput,
} from "./execute.js";
import { resumeInteractionOwner } from "./interaction_resume.js";
import {
  deriveDirectCStepFromGraph,
  type DirectCTraversalStep,
} from "./direct_fold.js";
import { evaluateWorkflowLocus } from "./workflow_locus.js";
import { evaluateInteractionLocus } from "./interaction_locus.js";
import { evaluateExecutableLocus } from "./executable_locus.js";
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

export interface ResumeHeldTraversalInput {
  readonly parent: InitialOrNonRetryExecuteGraphTraversalInput;
  readonly suspension: HeldRecursionSuspension | HeldWorkflowSuspension;
  readonly parentCCall: import("../abg/index.js").CCall | null;
  readonly sourceCursor: TraversalCursor;
  readonly childExecutionBasis: ExecutionBasis;
  readonly childTraversalScope: OpenedTraversalScope;
  readonly childCompletion: ExecutableTraversalCompletion;
}

export interface ResumeHeldInteractionInput {
  readonly parent: InitialOrNonRetryExecuteGraphTraversalInput;
  readonly interaction: CompleteInteractionResumeInput;
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

interface ActiveTraversalFoldState {
  readonly stateKind: "active";
  readonly cursor: TraversalCursor;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly ordinal: number;
  readonly structuralOrdinal: number;
}

interface CompletedTraversalFoldState {
  readonly stateKind: "completed";
  readonly completion: ExecutableTraversalCompletion;
}

type TraversalFoldState =
  | ActiveTraversalFoldState
  | CompletedTraversalFoldState;

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

function graphTraversalEffect(
  input: ExecuteGraphTraversalInput,
): Effect.Effect<ExecutableTraversalCompletion> {
  return Effect.suspend(() => Effect.gen(function* () {
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
  if (input.continuationProductBasis !== undefined) {
    const selected = lookupGraphFunctionDefinition(
      input.continuationProductBasis.catalogView,
      input.graphFunction.name,
      input.program.programRef,
    );
    if (
      selected.kind !== "graph_function_definition_lookup_exact" ||
      selected.entry.definitionRef !== input.graphFunction.name ||
      selected.entry.definitionDigest !==
        sha256Canonical(input.graphFunction as unknown as JsonValue) ||
      !selected.entry.programMembershipRefs.includes(input.program.programRef)
    ) {
      return fail(
        input,
        "catalog-selection",
        "diagnostic://abiogenesis/hog/catalog-selection-mismatch@5",
        {
          graphFunctionRef: input.graphFunction.name,
          lookupDisposition: selected.kind,
        },
      );
    }
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

  const evaluateLocusOnce = (
    cursor: TraversalCursor,
    directStep: DirectCTraversalStep,
    currentValue: Readonly<Record<string, JsonValue>>,
    leafOrdinal: number,
  ): Effect.Effect<TraversalLocusEvaluation> => Effect.suspend(() => {
    const failLocus = (
      stage: string,
      diagnosticRef: string,
      candidate: JsonValue,
    ): never => fail(input, stage, diagnosticRef, candidate);
    if (directStep.stepKind === "enter_child") {
      if (!isExactLocusStep(cursor, directStep)) {
        return failLocus(
          `workflow-step-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
          cursor as unknown as JsonValue,
        );
      }
      return evaluateWorkflowLocus({
        runtime: input,
        cursor,
        value: currentValue,
        graphEntryInput,
        graphEntryInputDigest,
        ordinal: leafOrdinal,
        evaluateChild: (prepared, correlationId, deferFailedRunStop) =>
          graphTraversalEffect(preparedChildTraversalInput(
            input,
            prepared,
            correlationId,
            deferFailedRunStop,
          )),
        fail: failLocus,
      });
    }
    if (directStep.stepKind !== "open_leaf") {
      return failLocus(
        `direct-step-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/direct-c-step-mismatch@5",
        cursor as unknown as JsonValue,
      );
    }
    const currentStop = traversalAtCursor(input, cursor, directStep);
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
      return Effect.sync(() => evaluateInteractionLocus({
        runtime: input,
        stop: currentStop,
        value: currentValue,
        ordinal: leafOrdinal,
        fail: failLocus,
      }));
    }
    if (currentStop.stopClass !== "executable") {
      return failLocus(
        `executable-step-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/executable-step-mismatch@5",
        currentStop as unknown as JsonValue,
      );
    }
    return evaluateExecutableLocus({
      runtime: input,
      stop: currentStop,
      value: currentValue,
      graphEntryInput,
      graphEntryInputDigest,
      ordinal: leafOrdinal,
      evaluateRetry: (resume, correlationId) =>
        graphTraversalEffect(projectedRetryTraversalInput(
          input,
          resume,
          correlationId,
        )),
      evaluateChild: (prepared, correlationId) =>
        graphTraversalEffect(preparedChildTraversalInput(
          input,
          prepared,
          correlationId,
          input.deferFailedRunStop === true,
        )),
      fail: failLocus,
    });
  });
  const initialFoldState: TraversalFoldState = {
    stateKind: "active",
    cursor: initialCursor,
    input: currentInput,
    ordinal: 0,
    structuralOrdinal: 0,
  };
  const folded = yield* Effect.iterate<
    TraversalFoldState,
    ActiveTraversalFoldState,
    never,
    never
  >(
    initialFoldState,
    {
      while: (state): state is ActiveTraversalFoldState =>
        state.stateKind === "active",
      body: (state): Effect.Effect<TraversalFoldState> =>
        Effect.suspend(() => Effect.gen(function* () {
        const directStep = deriveDirectCStepFromGraph(input.graph.template, {
          nodeRef: state.cursor.currentNodeRef,
          termPath: state.cursor.termPath,
          taskOrdinal: state.cursor.taskOrdinal,
          attempt: state.cursor.attempt,
          retryPath: state.cursor.retryPath,
        });
        if (directStep.kind === "direct_c_traversal_refusal") {
          return fail(
            input,
            `direct-step-${state.ordinal}`,
            `diagnostic://abiogenesis/hog/${directStep.code}@5`,
            directStep as unknown as JsonValue,
          );
        }
        if (
          directStep.stepKind !== "open_leaf" &&
          directStep.stepKind !== "enter_child"
        ) {
          const structural = yield* advanceStructuralTraversal({
            store: input.store,
            program: input.program,
            graphFunction: input.graphFunction,
            graph: input.graph,
            graphValidation: input.graphValidation,
            executionBasis: input.executionBasis,
            openedTraversalScope: input.openedTraversalScope,
            initial: state.cursor,
            step: directStep,
            inputValue: state.input,
            inputAuthority: input.leafPort,
            routeOrdinal: state.structuralOrdinal,
            clock: {
              eventTime: input.eventTime,
              correlationId:
                `${input.correlationId}/structural/${state.ordinal}`,
            },
          });
          if (
            structural.kind !== "traversal_cursor" ||
            structural.cursorRef === state.cursor.cursorRef
          ) {
            return fail(
              input,
              `structural-step-${state.ordinal}`,
              "diagnostic://abiogenesis/hog/structural-step-refused@5",
              structural as unknown as JsonValue,
            );
          }
          return {
            stateKind: "active" as const,
            cursor: structural,
            input: materializedInputAtCursor(input.graph, structural)?.value ??
              state.input,
            ordinal: state.ordinal,
            structuralOrdinal: state.structuralOrdinal + 1,
          };
        }
        const evaluated = yield* evaluateLocusOnce(
          state.cursor,
          directStep,
          state.input,
          state.ordinal,
        );
        const completion = evaluated.completion;
        if (completion.disposition !== "advanced") {
          return {
            stateKind: "completed" as const,
            completion,
          };
        }
        const nextMaterializedInput = materializedInputAtCursor(
          input.graph,
          completion.nextCursor,
        );
        if (
          completion.nextCursor === null ||
          completion.continuationKind === null ||
          completion.nextInputContractRef === null ||
          evaluated.outputValueKind === null ||
          evaluated.outputContractRef === null ||
          (nextMaterializedInput === null &&
            (typeof completion.resultValue !== "object" ||
              completion.resultValue === null ||
              Array.isArray(completion.resultValue))) ||
          (nextMaterializedInput === null &&
            (completion.continuationKind === "retry"
              ? completion.nextCursor.inputRef.length === 0 ||
                completion.nextCursor.inputDigest !==
                  sha256Canonical(completion.resultValue)
              : !input.leafPort.validateContractValue(
                  completion.nextInputContractRef,
                  "output",
                  completion.resultValue,
                )))
        ) {
          return fail(
            input,
            `advanced-result-${state.ordinal}`,
            "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
            {
              leafOrdinal: state.ordinal,
              completionDisposition: completion.disposition,
            },
          );
        }
        const nextInput = nextMaterializedInput?.value ??
          completion.resultValue as Readonly<Record<string, JsonValue>>;
        return {
          stateKind: "active" as const,
          cursor: completion.nextCursor,
          input: nextInput,
          ordinal: state.ordinal + 1,
          structuralOrdinal: 0,
        };
        })),
    },
  );
  if (folded.stateKind !== "completed") {
    return fail(
      input,
      "fold-incomplete",
      "diagnostic://abiogenesis/hog/effect-fold-incomplete@5",
      { stateKind: folded.stateKind },
    );
  }
  return folded.completion;
  }));
}

async function runGraphTraversalProgram(
  program: Effect.Effect<ExecutableTraversalCompletion>,
): Promise<ExecutableTraversalCompletion> {
  const exit = await runEffectProgram(program);
  if (Exit.isSuccess(exit)) return exit.value;
  throw Cause.squash(exit.cause);
}

function resumeParentAfterChild(
  parent: InitialOrNonRetryExecuteGraphTraversalInput,
  parentGraphInput: Readonly<Record<string, JsonValue>>,
  parentGraphInputDigest: `sha256:${string}`,
  completion: ExecutableTraversalCompletion,
  stage: "interaction-resume" | "workflow-resume" | "recursion-resume",
): Effect.Effect<ExecutableTraversalCompletion> {
  if (completion.disposition !== "advanced") {
    return Effect.succeed(completion);
  }
  return Effect.suspend(() => {
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
    return graphTraversalEffect({
      ...parent,
      input: parentGraphInput,
      inputDigest: parentGraphInputDigest,
      correlationId: `${parent.correlationId}/parent`,
      resume: {
        cursor: completion.nextCursor,
        input: nextInput,
        inputDigest: nextInputDigest,
      },
    });
  });
}

export type ExecuteGraphTraversalRequest =
  | ExecuteGraphTraversalInput
  | ResumeHeldInteractionInput
  | ResumeHeldTraversalInput;

function traversalProgram(
  input: ExecuteGraphTraversalRequest,
): Effect.Effect<ExecutableTraversalCompletion> {
  if ("interaction" in input) {
    return Effect.flatMap(
      Effect.sync(() => resumeInteractionOwner(input.interaction)),
      (completion) => resumeParentAfterChild(
        input.parent,
        input.parent.input,
        input.parent.inputDigest,
        completion,
        "interaction-resume",
      ),
    );
  }
  if (!("suspension" in input)) return graphTraversalEffect(input);
  if (input.suspension.kind === "held_workflow_suspension") {
    if (input.parentCCall === null) {
      return Effect.die(
        new TypeError(
          "diagnostic://abiogenesis/hog/workflow-resume-parent-call-absent@5",
        ),
      );
    }
    return resumeHeldWorkflowEffect({
      ...input,
      suspension: input.suspension,
      parentCCall: input.parentCCall,
    });
  }
  return resumeHeldRecursionEffect({
    ...input,
    suspension: input.suspension,
  });
}

export function executeGraphTraversal(
  input: ExecuteGraphTraversalRequest,
): Promise<ExecutableTraversalCompletion> {
  return runGraphTraversalProgram(traversalProgram(input));
}

function resumeHeldWorkflowEffect(
  input: ResumeHeldTraversalInput & Readonly<{
    suspension: HeldWorkflowSuspension;
    parentCCall: import("../abg/index.js").CCall;
  }>,
): Effect.Effect<ExecutableTraversalCompletion> {
  return Effect.suspend(() => Effect.gen(function* () {
  const parent = input.parent;
  if (
    input.suspension.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.suspension.parentTraversalScope.scopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.suspension.parentGraph.materializationRef !==
      parent.graph.materializationRef ||
    input.suspension.parentCCall.cCallRef !==
      input.parentCCall.cCallRef ||
    input.suspension.sourceCursor.cursorRef !==
      input.sourceCursor.cursorRef ||
    input.suspension.childExecutionBasisRef !==
      input.childExecutionBasis.basisRef ||
    input.suspension.childTraversalScopeRef !==
      input.childTraversalScope.scopeRef ||
    input.suspension.terminalMode !==
      (parent.terminalMode ?? "close_run") ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    sha256Canonical(
      input.suspension.parentGraphInput as unknown as JsonValue,
    ) !== input.suspension.parentGraphInputDigest ||
    sha256Canonical(parent.input as unknown as JsonValue) !==
      parent.inputDigest ||
    parent.inputDigest !== input.suspension.parentGraphInputDigest ||
    sha256Canonical(
      input.suspension.parentInput as unknown as JsonValue,
    ) !== input.suspension.parentInputDigest ||
    sha256Canonical(
      input.suspension.childInput as unknown as JsonValue,
    ) !== input.suspension.childInputDigest
  ) {
    return fail(
      parent,
      "workflow-resume-lineage",
      "diagnostic://abiogenesis/hog/workflow-resume-lineage-mismatch@5",
      input.suspension as unknown as JsonValue,
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
  const workflowCursor = traversal;
  const workflowTerm = resolveTraversalTerm(parent.graph, workflowCursor);
  if (
    workflowTerm.kind !== "c_workflow" ||
    workflowTerm.graphFunctionRef !==
      input.childExecutionBasis.graphFunctionRef
  ) {
    return fail(
      parent,
      "workflow-resume-child",
      "diagnostic://abiogenesis/hog/workflow-resume-child-mismatch@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  const constructionIntent = rehydrateConstructionIntentForCursor(
    parent.store,
    workflowCursor,
  );
  const selectedActionEvaluationBasis =
    constructionIntent?.actionKind === "invoke_graph_function" &&
      input.childCompletion.disposition === "closed" &&
      input.childCompletion.resultRef !== null &&
      input.childCompletion.judgmentRef !== null &&
      input.childCompletion.closureRef !== null &&
      typeof input.childCompletion.resultValue === "object" &&
      input.childCompletion.resultValue !== null &&
      !Array.isArray(input.childCompletion.resultValue)
      ? deriveGraphFunctionActionEvaluationBasis(
          parent.store,
          parent.executionBasis,
          workflowCursor,
          {
            childGraphFunctionRef: workflowTerm.graphFunctionRef,
            childResultRef: input.childCompletion.resultRef,
            childResultValue:
              input.childCompletion.resultValue as Readonly<
                Record<string, JsonValue>
              >,
            childJudgmentRef: input.childCompletion.judgmentRef,
            childClosureRef: input.childCompletion.closureRef,
          },
        )
      : null;
  if (
    constructionIntent?.actionKind === "invoke_graph_function" &&
    input.childCompletion.disposition === "closed" &&
    selectedActionEvaluationBasis === null
  ) {
    return fail(
      parent,
      "workflow-resume-action-evaluation",
      "diagnostic://abiogenesis/hog/workflow-action-evaluation-basis-absent@5",
      workflowTerm as unknown as JsonValue,
    );
  }
  const outputValueKind = parent.leafPort.contractValueKind(
    workflowTerm.outputCarrierRef,
    "output",
  );
  const failureValueKind = parent.leafPort.contractValueKind(
    input.parentCCall.failureContractRef,
    "failure",
  );
  const judgmentRelation = parent.leafPort.resolveJudgmentRelation(
    input.parentCCall.judgmentPredicateRef,
  );
  if (
    outputValueKind === null ||
    failureValueKind === null ||
    judgmentRelation === null
  ) {
    return fail(
      parent,
      "workflow-resume-contract",
      "diagnostic://abiogenesis/hog/workflow-result-contract-absent@5",
      {
        outputContractRef: workflowTerm.outputCarrierRef,
        failureContractRef: input.parentCCall.failureContractRef,
        predicateRef: input.parentCCall.judgmentPredicateRef,
      },
    );
  }
  const fanOutApplication = fanOutApplicationForBatch(
    parent.graph,
    input.parentCCall.batchRef,
  );
  const completion = completeWorkflowTraversal({
    store: parent.store,
    executionBasis: parent.executionBasis,
    openedTraversalScope: parent.openedTraversalScope,
    program: parent.program,
    graphFunction: parent.graphFunction,
    graph: parent.graph,
    workflowCursor,
    workflowTerm,
    parentCCall: input.parentCCall,
    childExecutionBasis: input.childExecutionBasis,
    childTraversalScope: input.childTraversalScope,
    childCompletion: input.childCompletion,
    input: input.suspension.parentInput,
    inputDigest: input.suspension.parentInputDigest,
    resultValueKind: outputValueKind,
    failureValueKind,
    validateSuccessResult: (
      value,
    ): value is Readonly<Record<string, JsonValue>> =>
      parent.leafPort.validateContractValue(
        workflowTerm.outputCarrierRef,
        "output",
        value,
      ) &&
      judgmentRelation.evaluate(input.suspension.parentInput, value),
    ...(selectedActionEvaluationBasis === null
      ? {}
      : { successResultValue: selectedActionEvaluationBasis }),
    closureContract: parent.closureContract,
    ...(parent.terminalMode === undefined
      ? {}
      : { terminalMode: parent.terminalMode }),
    judgmentRelation,
    ...(fanOutApplication === null
      ? {}
      : {
          fanOutApplication,
          validateFanOutVector: (
            value: unknown,
          ): value is Readonly<Record<string, JsonValue>> =>
            parent.leafPort.validateContractValue(
              fanOutApplication.outputVectorRef,
              "output",
              value,
            ),
        }),
    clock: {
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/workflow/resume-foldback`,
    },
  });
  return yield* resumeParentAfterChild(
    parent,
    input.suspension.parentGraphInput,
    input.suspension.parentGraphInputDigest,
    completion,
    "workflow-resume",
  );
  }));
}

function resumeHeldRecursionEffect(
  input: ResumeHeldTraversalInput & Readonly<{
    suspension: HeldRecursionSuspension;
  }>,
): Effect.Effect<ExecutableTraversalCompletion> {
  return Effect.suspend(() => Effect.gen(function* () {
  const parent = input.parent;
  const application = parent.graph.template.applications.find(
    (candidate): candidate is RecurseApplication =>
      candidate.relationKind === "recurse" &&
      candidate.applicationRef === input.suspension.application.applicationRef,
  );
  if (
    application === undefined ||
    sha256Canonical(application as unknown as JsonValue) !==
      sha256Canonical(
        input.suspension.application as unknown as JsonValue,
      ) ||
    input.suspension.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.suspension.parentTraversalScope.scopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.suspension.parentGraph.materializationRef !==
      parent.graph.materializationRef ||
    input.suspension.sourceCursor.cursorRef !==
      input.sourceCursor.cursorRef ||
    input.suspension.childExecutionBasisRef !==
      input.childExecutionBasis.basisRef ||
    input.suspension.childTraversalScopeRef !==
      input.childTraversalScope.scopeRef ||
    input.suspension.terminalMode !==
      (parent.terminalMode ?? "close_run") ||
    input.childExecutionBasis.parentExecutionBasisRef !==
      parent.executionBasis.basisRef ||
    input.childExecutionBasis.parentTraversalScopeRef !==
      parent.openedTraversalScope.scopeRef ||
    input.childTraversalScope.executionBasisRef !==
      input.childExecutionBasis.basisRef ||
    sha256Canonical(
      input.suspension.parentGraphInput as unknown as JsonValue,
    ) !== input.suspension.parentGraphInputDigest ||
    parent.inputDigest !== input.suspension.parentGraphInputDigest ||
    sha256Canonical(parent.input as unknown as JsonValue) !==
      parent.inputDigest ||
    sha256Canonical(
      input.suspension.evaluatorInput as unknown as JsonValue,
    ) !== input.suspension.evaluatorInputDigest ||
    sha256Canonical(
      input.suspension.childInput as unknown as JsonValue,
    ) !== input.suspension.childInputDigest
  ) {
    return fail(
      parent,
      "recursion-resume-lineage",
      "diagnostic://abiogenesis/hog/recursion-resume-lineage-mismatch@5",
      input.suspension as unknown as JsonValue,
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
  if (resolution === null) {
    return fail(
      parent,
      "recursion-resume-resolution",
      "diagnostic://abiogenesis/hog/recursion-resume-resolution-absent@5",
      traversalStop as unknown as JsonValue,
    );
  }
  const restoration: RestoreDeferredRecursionInput = {
    traversalInput: {
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
      input: input.suspension.evaluatorInput,
      inputDigest: input.suspension.evaluatorInputDigest,
      closureContract: parent.closureContract,
      actorRuntimeBinding: parent.actorRuntimeBinding,
      ...(parent.deferFailedRunStop === true
        ? { deferFailedRunStop: true }
        : {}),
      terminalMode: "return_to_application",
      applicationCompletionMode: input.suspension.terminalMode,
      clock: {
        eventTime: parent.eventTime,
        correlationId: `${parent.correlationId}/recursion/restore`,
      },
    },
    application,
    cCallRef: input.suspension.evaluatorCCall.cCallRef,
    resultRef: input.suspension.evaluatorResult.resultRef,
    judgmentRef: input.suspension.evaluatorJudgment.judgmentRef,
  };
  const deferred = restoreDeferredRecursion(restoration);
  if (
    deferred === null ||
    deferred.cCallRef !== input.suspension.evaluatorCCall.cCallRef ||
    deferred.resultRef !== input.suspension.evaluatorResult.resultRef ||
    deferred.judgmentRef !==
      input.suspension.evaluatorJudgment.judgmentRef ||
    sha256Canonical(deferred.resultValue as JsonValue) !==
      input.suspension.evaluatorResult.valueDigest
  ) {
    return fail(
      parent,
      "recursion-resume-deferred",
      "diagnostic://abiogenesis/hog/recursion-resume-deferred-mismatch@5",
      input.suspension as unknown as JsonValue,
    );
  }
  const completion = advanceDeferredRecursion({
    completion: deferred,
    restoration,
    application,
    childExecutionBasis: input.childExecutionBasis,
    childTraversalScope: input.childTraversalScope,
    childCompletion: input.childCompletion,
    clock: {
      eventTime: parent.eventTime,
      correlationId: `${parent.correlationId}/recursion/foldback`,
    },
  });
  return yield* resumeParentAfterChild(
    parent,
    input.suspension.parentGraphInput,
    input.suspension.parentGraphInputDigest,
    completion,
    "recursion-resume",
  );
  }));
}
