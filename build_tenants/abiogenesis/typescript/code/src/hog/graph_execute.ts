import {
  admitInitialTraversalCursor,
  admitRoute,
  admitRuntimeFailure,
  deriveGraphFunctionActionEvaluationBasis,
  hasAdmittedTraversalCursor,
  isExecutionBasis,
  isOpenedTraversalScope,
  isTraversalCursorCandidate,
  openWorkflowCCall,
  rehydrateExecutionBasisAtPrefix,
  rehydrateOpenedTraversalScopeAtPrefix,
  rehydrateConstructionIntentForCursor,
  selectAdmittedInteractionContract,
  selectAdmittedImplementationResolution,
  traversalCursorAdmissionEventRef,
  WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
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
  admitRetryAttempt,
  assertFullRetryAttemptFrontier,
  deriveRetryAttemptManifestRef,
  projectDeclaredCRetryFrontier,
  projectDeclaredRetryAttemptCoordinates,
  projectExecutableRetryInput,
  projectRetryAttempt,
  type ExecutableRetryInput,
} from "../abg/retry.js";
import {
  admitRuntimeEventTransactionAtExpectedPrefix,
  assertHeldEventStoreAtDurablePrefix,
  readRuntimeEventsAtDurablePrefix,
  validateDurablePrefixCoordinate,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import { projectAdmittedRetryRouteAtPrefix } from "../abg/traversal_route.js";
import { replayValidatedRuntimeEventPrefix } from "../abg/replay.js";
import type {
  ClosureContract,
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  GtlProgram,
  RecurseApplication,
} from "../gtl/contracts.js";
import { recursionTerminationDecision } from "../gtl/graph_applications.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import { isAdmittedLeafInvocationPort } from "./leaf_invocation_port.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import { lookupGraphFunctionDefinition } from "../product/catalog.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isGraphValidation,
  type GraphValidation,
} from "../validator/graph.js";
import {
  advanceDeferredRecursion,
  blockDeferredRecursion,
  blockDeferredRecursionPreparation,
  completeDeferredApplicationTerminal,
  completeExecutableTraversal,
  completeInteractionTraversal,
  completeWorkflowPreparationRefusal,
  completeWorkflowTraversal,
  restoreDeferredRecursion,
  suspendHeldRecursionTraversal,
  suspendHeldWorkflowTraversal,
  type ExecutableTraversalCompletion,
  type CompleteExecutableTraversalResult,
  type CompleteExecutableTraversalInput,
  type HeldRecursionSuspension,
  type HeldWorkflowSuspension,
  type RestoreDeferredRecursionInput,
} from "./execute.js";
import {
  isChildTraversalPreparationPort,
  type ChildTraversalPreparationPort,
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
  traverseFromCursor,
  type TraversalCursor,
} from "./traversal.js";
import { proposeRetryRoute } from "./traversal_route.js";
import { Cause, Effect, Exit } from "effect";
import { runEffectProgram } from "../shared/effect_definition.js";

export interface ResumeProjectedRetryRuntime {
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly graphValidation: GraphValidation;
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface ResumeProjectedRetryRequest {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly retry: ExecutableRetryInput;
  readonly runtime: ResumeProjectedRetryRuntime;
}

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

export type ProjectedRetryResumeRefusalCode =
  | "projection_mismatch"
  | "prefix_mismatch"
  | "runtime_basis_mismatch"
  | "retry_step_refused"
  | "retry_route_refused"
  | "retry_attempt_refused";

export interface ProjectedRetryResumeRefusal {
  readonly kind: "projected_retry_resume_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: ProjectedRetryResumeRefusalCode;
  readonly message: string;
  readonly executableRetryInputRef: string | null;
  readonly executableRetryInputDigest: `sha256:${string}` | null;
  readonly lowerCause: JsonValue;
}

export type ProjectedRetryResumeResult =
  | ProjectedRetryResumeSuccess
  | ProjectedRetryResumeRefusal;

function projectedRetryRefusal(
  request: ResumeProjectedRetryRequest,
  code: ProjectedRetryResumeRefusalCode,
  message: string,
  lowerCause: JsonValue,
): ProjectedRetryResumeRefusal {
  const ref = typeof request.retry?.projectionRef === "string" &&
      request.retry.projectionRef.length > 0
    ? request.retry.projectionRef
    : null;
  const digest = typeof request.retry?.projectionDigest === "string" &&
      request.retry.projectionDigest.startsWith("sha256:")
    ? request.retry.projectionDigest
    : null;
  return deepFreeze({
    kind: "projected_retry_resume_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
    executableRetryInputRef: ref,
    executableRetryInputDigest: digest,
    lowerCause,
  });
}

class ProjectedRetryTransactionAbort extends TypeError {
  constructor(
    readonly code: Extract<
      ProjectedRetryResumeRefusalCode,
      "retry_step_refused" | "retry_route_refused" | "retry_attempt_refused"
    >,
    readonly lowerCause: JsonValue,
  ) {
    super(`projected retry transaction aborted: ${code}`);
  }
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

function retryRuntimeDeclarationsMatch(
  fresh: ExecutableRetryInput,
  runtime: ResumeProjectedRetryRuntime,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
): boolean {
  try {
    return isExecutionBasis(runtime.executionBasis) &&
      isOpenedTraversalScope(runtime.openedTraversalScope) &&
      isMaterializedGtlGraph(runtime.graph) &&
      isGraphValidation(runtime.graphValidation) &&
      sameCanonical(runtime.executionBasis, executionBasis) &&
      sameCanonical(runtime.openedTraversalScope, scope) &&
      runtime.program.programRef === fresh.programRef &&
      runtime.program.programRef === executionBasis.programRef &&
      sha256Canonical(runtime.program as unknown as JsonValue) ===
        fresh.programDigest &&
      fresh.programDigest === executionBasis.programDigest &&
      runtime.program.callableMembership.includes(
        executionBasis.graphFunctionRef,
      ) &&
      runtime.graphFunction.name === fresh.graphFunctionRef &&
      runtime.graphFunction.name === executionBasis.graphFunctionRef &&
      sha256Canonical(runtime.graphFunction as unknown as JsonValue) ===
        fresh.graphFunctionDigest &&
      fresh.graphFunctionDigest === executionBasis.graphFunctionDigest &&
      runtime.graph.materializationRef === fresh.graphRef &&
      runtime.graph.materializationRef === executionBasis.graphRef &&
      runtime.graph.materializationDigest === fresh.graphDigest &&
      runtime.graph.materializationDigest === executionBasis.graphDigest &&
      runtime.graph.graphFunctionRef === fresh.graphFunctionRef &&
      runtime.graph.graphFunctionRef === executionBasis.graphFunctionRef &&
      runtime.graph.graphFunctionDigest === fresh.graphFunctionDigest &&
      runtime.graph.graphFunctionDigest === executionBasis.graphFunctionDigest &&
      runtime.graph.invocationAdmissionRef ===
        executionBasis.invocationAdmissionRef &&
      runtime.graph.admittedInputRef === executionBasis.rawInputAdmissionRef &&
      runtime.graph.admittedInputDigest === executionBasis.rawInputDigest &&
      runtime.graphValidation.disposition === "valid" &&
      runtime.graphValidation.validationRef ===
        executionBasis.graphValidationRef &&
      runtime.graphValidation.graphRef === fresh.graphRef &&
      runtime.graphValidation.graphRef === runtime.graph.materializationRef &&
      runtime.graphValidation.graphDigest === fresh.graphDigest &&
      runtime.graphValidation.graphDigest ===
        runtime.graph.materializationDigest &&
      runtime.graphValidation.graphFunctionRef === fresh.graphFunctionRef &&
      runtime.graphValidation.graphFunctionRef ===
        executionBasis.graphFunctionRef &&
      runtime.graphValidation.graphFunctionDigest ===
        fresh.graphFunctionDigest &&
      runtime.graphValidation.graphFunctionDigest ===
        executionBasis.graphFunctionDigest &&
      runtime.graphValidation.programValidationRef ===
        executionBasis.programValidationRef &&
      runtime.graphValidation.invocationAdmissionRef ===
        executionBasis.invocationAdmissionRef &&
      runtime.graphValidation.admittedInputRef ===
        executionBasis.rawInputAdmissionRef &&
      runtime.graphValidation.admittedInputDigest ===
        executionBasis.rawInputDigest &&
      executionBasis.basisRef === fresh.executionBasisRef &&
      executionBasis.basisDigest === fresh.executionBasisDigest &&
      scope.scopeRef === fresh.traversalScopeRef &&
      scope.scopeDigest === fresh.traversalScopeDigest &&
      scope.executionBasisRef === executionBasis.basisRef &&
      scope.executionBasisDigest === executionBasis.basisDigest &&
      scope.invocationAdmissionRef === executionBasis.invocationAdmissionRef &&
      scope.invocationRef === executionBasis.invocationRef &&
      scope.programRef === executionBasis.programRef &&
      scope.graphFunctionRef === executionBasis.graphFunctionRef &&
      scope.graphRef === executionBasis.graphRef &&
      scope.runId === fresh.selector.runId &&
      scope.graphCallId === fresh.selector.graphCallId &&
      scope.frameId === fresh.selector.frameId &&
      typeof runtime.eventTime === "string" &&
      !Number.isNaN(Date.parse(runtime.eventTime)) &&
      typeof runtime.correlationId === "string" &&
      runtime.correlationId.length > 0;
  } catch {
    return false;
  }
}

function resumeProjectedRetry(
  request: ResumeProjectedRetryRequest,
): ProjectedRetryResumeResult {
  let fresh;
  try {
    fresh = projectExecutableRetryInput({
      prefix: request.predecessorPrefix,
      selector: request.retry.selector,
      program: request.runtime.program,
      graphFunction: request.runtime.graphFunction,
      graph: request.runtime.graph,
    });
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "projection_mismatch",
      "projected retry input could not be independently reconstructed",
      { error: String(error) },
    );
  }
  if (
    fresh.kind !== "executable_retry_input" ||
    !sameCanonical(fresh, request.retry)
  ) {
    return projectedRetryRefusal(
      request,
      "projection_mismatch",
      "supplied retry input differs from fresh D17 projection",
      fresh as unknown as JsonValue,
    );
  }
  try {
    assertFullRetryAttemptFrontier(fresh.retryFrontier);
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "projection_mismatch",
      "fresh retry projection does not carry one full frontier",
      { error: String(error) },
    );
  }

  let prefix;
  let authorityPrefix;
  try {
    const durableEvents = readRuntimeEventsAtDurablePrefix(
      request.predecessorPrefix,
    );
    authorityPrefix = selectValidatedRuntimeEventPrefix(durableEvents);
    prefix = selectValidatedRuntimeEventPrefix(
      durableEvents,
      { runId: fresh.selector.runId },
    );
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "prefix_mismatch",
      "D17 predecessor prefix cannot be read as one immutable runtime basis",
      { error: String(error) },
    );
  }

  const executionBasis = rehydrateExecutionBasisAtPrefix(
    prefix,
    fresh.executionBasisRef,
  );
  const scope = rehydrateOpenedTraversalScopeAtPrefix(
    prefix,
    request.runtime.openedTraversalScope as unknown as Readonly<
      Record<string, JsonValue>
    >,
  );
  if (
    executionBasis === null || scope === null ||
    !retryRuntimeDeclarationsMatch(
      fresh,
      request.runtime,
      executionBasis,
      scope,
    )
  ) {
    return projectedRetryRefusal(
      request,
      "runtime_basis_mismatch",
      "retry runtime declarations differ from the D17 execution basis",
      {
        executionBasisRef: fresh.executionBasisRef,
        traversalScopeRef: fresh.traversalScopeRef,
      },
    );
  }

  const sourceCursor = rehydrateHeldInteractionCursor(
    prefix,
    fresh.sourceCursor,
  );
  if (sourceCursor === null) {
    return projectedRetryRefusal(
      request,
      "runtime_basis_mismatch",
      "D17 source cursor does not rehydrate at the predecessor prefix",
      { sourceCursorRef: fresh.sourceCursor.cursorRef },
    );
  }
  const targetCursor = deriveRetryTraversalCursor(request.runtime.graph, sourceCursor, {
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
  });
  if (
    targetCursor.kind !== "traversal_cursor" ||
    targetCursor.attempt !== fresh.nextAttempt ||
    !sameCanonical(targetCursor.retryPath, fresh.nextRetryPath) ||
    targetCursor.inputRef !== fresh.inputRef ||
    targetCursor.inputDigest !== fresh.inputDigest
  ) {
    return projectedRetryRefusal(
      request,
      "retry_step_refused",
      "HoG could not derive the exact D17 retry successor step",
      targetCursor as unknown as JsonValue,
    );
  }
  const replayState = replayValidatedRuntimeEventPrefix(
    prefix,
    authorityPrefix,
  );
  const candidate = proposeRetryRoute(
    request.runtime.graph,
    sourceCursor,
    targetCursor,
    fresh.cCall,
    fresh.progress,
    replayState,
    fresh.cCall.transitionContractRef,
  );
  if (candidate.kind !== "traversal_route_candidate") {
    return projectedRetryRefusal(
      request,
      "retry_route_refused",
      "HoG could not propose the exact D17 retry route",
      candidate as unknown as JsonValue,
    );
  }
  const declaration = projectDeclaredRetryAttemptCoordinates(
    request.runtime.graph,
    targetCursor,
  );
  const expectedRouteDigest = candidate.candidateDigest;
  const expectedRouteRef =
    `traversal-route://abiogenesis/${expectedRouteDigest.slice("sha256:".length)}`;
  if (
    declaration === null ||
    declaration.retryBoundaryRef !== fresh.selector.retryBoundaryRef ||
    declaration.inputCarrierRef !== fresh.inputContractRef ||
    declaration.retryDepth !== fresh.nextRetryPath.length ||
    declaration.budget < fresh.nextAttempt ||
    !sameCanonical(targetCursor.retryPath, fresh.nextRetryPath) ||
    candidate.declarationRef !== request.runtime.graph.materializationRef ||
    candidate.declarationDigest !== request.runtime.graph.materializationDigest ||
    candidate.sourceCursorRef !== sourceCursor.cursorRef ||
    candidate.sourceCursorDigest !== sourceCursor.cursorDigest ||
    candidate.targetCursorRef !== targetCursor.cursorRef ||
    candidate.targetCursorDigest !== targetCursor.cursorDigest ||
    candidate.cCallRef !== fresh.cCall.cCallRef ||
    candidate.judgmentRef !== fresh.progress.judgmentRef ||
    !sameCanonical(candidate.consumedAvailabilityRefs, [
      fresh.progress.judgmentRef,
      fresh.progress.progressRef,
    ]) ||
    candidate.contractRef !== fresh.cCall.transitionContractRef ||
    candidate.replayStateDigest !== replayState.replayDigest ||
    targetCursor.inputRef !== fresh.inputRef ||
    targetCursor.inputDigest !== fresh.inputDigest ||
    sha256Canonical(fresh.inputValue as unknown as JsonValue) !==
      fresh.inputDigest
  ) {
    return projectedRetryRefusal(
      request,
      "retry_step_refused",
      "HoG retry route and attempt preflight differ from the exact D17 successor",
      {
        sourceCursorRef: sourceCursor.cursorRef,
        targetCursorRef: targetCursor.cursorRef,
      },
    );
  }
  const expectedAttemptBody = {
    attemptManifestRef: deriveRetryAttemptManifestRef({
      retryBoundaryRef: declaration.retryBoundaryRef,
      executionBasisRef: targetCursor.executionBasisRef,
      inputContractRef: declaration.inputCarrierRef,
      inputRef: targetCursor.inputRef,
      inputDigest: targetCursor.inputDigest,
      attempt: targetCursor.attempt,
      retryPath: targetCursor.retryPath,
    }),
    retryBoundaryRef: declaration.retryBoundaryRef,
    retryTermPath: declaration.retryTermPath,
    wrappedTermPath: declaration.wrappedTermPath,
    taskOrdinal: declaration.taskOrdinal,
    attempt: targetCursor.attempt,
    retryPath: targetCursor.retryPath,
    budget: declaration.budget,
    retryableFailureClasses: WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
    priorJudgmentRef: candidate.judgmentRef,
    priorRouteRef: expectedRouteRef,
    inputRef: targetCursor.inputRef,
    inputDigest: targetCursor.inputDigest,
    inputContractRef: declaration.inputCarrierRef,
    inputValue: fresh.inputValue,
  };
  const expectedAttemptDigest = sha256Canonical(
    expectedAttemptBody as unknown as JsonValue,
  );
  const expectedAttemptRef =
    `retry-attempt://abiogenesis/${expectedAttemptDigest.slice("sha256:".length)}`;

  let expectedPrefixDigest;
  try {
    assertHeldEventStoreAtDurablePrefix(
      request.store,
      request.predecessorPrefix,
    );
    expectedPrefixDigest = request.store.digest();
  } catch (error) {
    return projectedRetryRefusal(
      request,
      "prefix_mismatch",
      "retry predecessor prefix changed before atomic admission",
      { error: String(error) },
    );
  }

  try {
    const transaction = admitRuntimeEventTransactionAtExpectedPrefix(
      request.store,
      expectedPrefixDigest,
      () => {
        const route = admitRoute(
          request.store,
          executionBasis,
          request.runtime.graph,
          sourceCursor,
          targetCursor,
          replayState,
          candidate,
          {
            eventTime: request.runtime.eventTime,
            correlationId: `${request.runtime.correlationId}/retry-route`,
            causationEventRefs: [],
          },
          {
            graphFunction: request.runtime.graphFunction,
            cCall: fresh.cCall,
            progress: fresh.progress,
          },
        );
        if (
          route.kind !== "admitted_traversal_route" ||
          route.routeRef !== expectedRouteRef ||
          route.routeDigest !== expectedRouteDigest
        ) {
          throw new ProjectedRetryTransactionAbort(
            "retry_route_refused",
            route as unknown as JsonValue,
          );
        }
        const nextCursor = applyAdmittedRoute(
          sourceCursor,
          targetCursor,
          "retry",
          route,
        );
        if (
          nextCursor.kind === "traversal_refusal" ||
          !sameCanonical(nextCursor, targetCursor)
        ) {
          throw new ProjectedRetryTransactionAbort(
            "retry_step_refused",
            nextCursor as unknown as JsonValue,
          );
        }
        const attempt = admitRetryAttempt(
          request.store,
          executionBasis,
          request.runtime.graph,
          request.runtime.graphFunction,
          nextCursor,
          fresh.inputValue,
          route.admissionEventRef,
          {
            eventTime: request.runtime.eventTime,
            correlationId: `${request.runtime.correlationId}/retry-attempt`,
            causationEventRefs: [],
          },
        );
        if (attempt.kind !== "retry_attempt_admission") {
          throw new ProjectedRetryTransactionAbort(
            "retry_attempt_refused",
            attempt as unknown as JsonValue,
          );
        }
        const {
          kind: _attemptKind,
          schemaVersion: _attemptSchemaVersion,
          disposition: _attemptDisposition,
          attemptRef: _attemptRef,
          attemptDigest: _attemptDigest,
          admissionEventRef: _attemptAdmissionEventRef,
          ...admittedAttemptBody
        } = attempt;
        if (
          attempt.attemptRef !== expectedAttemptRef ||
          attempt.attemptDigest !== expectedAttemptDigest ||
          !sameCanonical(admittedAttemptBody, expectedAttemptBody)
        ) {
          throw new ProjectedRetryTransactionAbort(
            "retry_attempt_refused",
            {
              expectedAttemptRef,
              admittedAttemptRef: attempt.attemptRef,
            },
          );
        }
        const successorEvents = request.store.readAll().filter((event) =>
          event.admissionOrdinal > fresh.lastAdmissionOrdinal
        );
        if (
          successorEvents.length !== 2 ||
          successorEvents[0]?.kind !== "traversal_route_admitted" ||
          successorEvents[0]?.eventId !== route.admissionEventRef ||
          successorEvents[1]?.kind !== "retry_attempt_opened" ||
          successorEvents[1]?.eventId !== attempt.admissionEventRef
        ) {
          throw new ProjectedRetryTransactionAbort(
            "retry_attempt_refused",
            { successorEventRefs: successorEvents.map((event) => event.eventId) },
          );
        }
        const admittedPrefix = selectValidatedRuntimeEventPrefix(
          request.store.readAll(),
          { runId: fresh.selector.runId },
        );
        const projectedAttempt = projectRetryAttempt(
          admittedPrefix,
          request.runtime.graph,
          attempt.admissionEventRef,
        );
        if (!sameCanonical(projectedAttempt, attempt)) {
          throw new ProjectedRetryTransactionAbort(
            "retry_attempt_refused",
            { retryAttemptAdmissionEventRef: attempt.admissionEventRef },
          );
        }
        return { route, nextCursor, attempt };
      },
    );
    if (transaction.successorPrefix === null) {
      return projectedRetryRefusal(
        request,
        "prefix_mismatch",
        "atomic retry admission produced no durable successor prefix",
        { predecessorPrefixDigest: request.predecessorPrefix.prefixDigest },
      );
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
      nextCursor: transaction.value.nextCursor,
      retryAttemptAdmissionEventRef:
        transaction.value.attempt.admissionEventRef,
      retryAttemptRef: transaction.value.attempt.attemptRef,
      retryAttemptDigest: transaction.value.attempt.attemptDigest,
      nextAttempt: fresh.nextAttempt,
      inputContractRef: fresh.inputContractRef,
      inputRef: fresh.inputRef,
      inputDigest: fresh.inputDigest,
      inputValue: fresh.inputValue,
      successorPrefix: transaction.successorPrefix,
    });
  } catch (error) {
    if (error instanceof ProjectedRetryTransactionAbort) {
      return projectedRetryRefusal(
        request,
        error.code,
        error.message,
        error.lowerCause,
      );
    }
    return projectedRetryRefusal(
      request,
      "prefix_mismatch",
      "atomic retry admission lost its expected predecessor prefix",
      { error: String(error) },
    );
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

function advanceStructural(
  input: ExecuteGraphTraversalCommonInput,
  value: StructuralTraversalResult,
  ordinal: number,
  inputValue: Readonly<Record<string, JsonValue>>,
): Effect.Effect<StructuralTraversalResult> {
  if (value.kind !== "traversal_cursor") return Effect.succeed(value);
  return advanceStructuralTraversal({
    store: input.store,
    program: input.program,
    graphFunction: input.graphFunction,
    graph: input.graph,
    graphValidation: input.graphValidation,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    initial: value,
    inputValue,
    inputAuthority: input.leafPort,
    clock: {
      eventTime: input.eventTime,
      correlationId: `${input.correlationId}/structural/${ordinal}`,
    },
  });
}

function activeCursor(
  value: StructuralTraversalResult,
): TraversalCursor | null {
  if (value.kind === "traversal_stop_ref") return value.cursor;
  return value.kind === "traversal_cursor" ? value : null;
}

function recurseApplicationAtStop(
  graph: Readonly<GtlGraph>,
  compositionRef: string | null,
): Readonly<RecurseApplication> | null {
  if (compositionRef === null) return null;
  const application = graph.template.applications.find(
    (candidate) => candidate.applicationRef === compositionRef,
  );
  return application?.relationKind === "recurse" ? application : null;
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
  let projectedStop: StructuralTraversalResult | null = null;
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
      traversal = traverseFromCursor(
        {
          program: input.program,
          graphFunction: input.graphFunction,
          graph: input.graph,
          graphValidation: input.graphValidation,
          executionBasis: input.executionBasis,
          openedTraversalScope: input.openedTraversalScope,
        },
        candidate.nextCursor,
      );
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
  let stop: StructuralTraversalResult;
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
    stop = traverseFromCursor(
      {
        program: input.program,
        graphFunction: input.graphFunction,
        graph: input.graph,
        graphValidation: input.graphValidation,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
      },
      initialInput.resume.cursor,
    );
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

  if (!projectedBranch) {
    stop = yield* advanceStructural(
      input,
      stop,
      0,
      currentInput,
    );
    currentInput = materializedInputAtCursor(
      input.graph,
      activeCursor(stop),
    )?.value ?? currentInput;
  }
  if (
    stop.kind !== "traversal_stop_ref" &&
    !(
      stop.kind === "traversal_cursor" &&
      resolveTraversalTerm(input.graph, stop).kind === "c_workflow"
    )
  ) {
    return fail(
      input,
      "structural-step",
      "diagnostic://abiogenesis/hog/structural-step-not-yet-executable@5",
      stop as unknown as JsonValue,
    );
  }

  const evaluateLocus = (
    currentStop: StructuralTraversalResult,
    currentValue: Readonly<Record<string, JsonValue>>,
    leafOrdinal: number,
  ): Effect.Effect<ExecutableTraversalCompletion> =>
    Effect.suspend(() => Effect.gen(function* () {
    const stop = currentStop;
    const currentInput = currentValue;
    if (
      stop.kind !== "traversal_stop_ref" &&
      !(
        stop.kind === "traversal_cursor" &&
        resolveTraversalTerm(input.graph, stop).kind === "c_workflow"
      )
    ) {
      return fail(
        input,
        `locus-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/continuation-not-executable@5",
        stop as unknown as JsonValue,
      );
    }
    let completion: ExecutableTraversalCompletion | null = null;
    let completionValueKind: string | null = null;
    let completionContractRef: string | null = null;
    if (stop.kind === "traversal_cursor") {
      const workflowTerm = resolveTraversalTerm(input.graph, stop);
      if (workflowTerm.kind !== "c_workflow") {
        return fail(
          input,
          `workflow-step-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/workflow-step-mismatch@5",
          workflowTerm as unknown as JsonValue,
        );
      }
      if (
        input.childTraversalPreparationPort === undefined ||
        !isChildTraversalPreparationPort(input.childTraversalPreparationPort)
      ) {
        return fail(
          input,
          `child-port-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/child-preparation-port-absent@5",
          workflowTerm as unknown as JsonValue,
        );
      }
      const childFailureContractRefs = new Set(
        input.implementationSet.rows
          .filter((row) => row.graphFunctionRef === workflowTerm.graphFunctionRef)
          .map((row) => row.failureContractRef),
      );
      const childFailureContractRef = [...childFailureContractRefs][0];
      if (
        childFailureContractRefs.size !== 1 ||
        childFailureContractRef === undefined
      ) {
        return fail(
          input,
          `workflow-failure-contract-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/workflow-failure-contract-ambiguous@5",
          {
            childGraphFunctionRef: workflowTerm.graphFunctionRef,
            failureContractRefs: [...childFailureContractRefs].sort(),
          },
        );
      }
      const openedParent = openWorkflowCCall(
        input.store,
        input.executionBasis,
        input.implementationSet,
        input.openedTraversalScope,
        input.program,
        input.graphFunction,
        input.graph,
        {
          kind: "workflow_c_call_proposal",
          schemaVersion: "5.0.0",
          cursor: stop,
          traversalScopeRef: input.openedTraversalScope.scopeRef,
          runId: input.openedTraversalScope.runId,
          graphCallId: input.openedTraversalScope.graphCallId,
          frameId: input.openedTraversalScope.frameId,
          childGraphFunctionRef: workflowTerm.graphFunctionRef,
          inputContractRef: workflowTerm.inputCarrierRef,
          outputContractRef: workflowTerm.outputCarrierRef,
          failureContractRef: childFailureContractRef,
          judgmentPredicateRef:
            input.graphFunction.declarations["abg.judgment_predicate"] ?? "",
        },
        {
          eventTime: input.eventTime,
          correlationId: `${input.correlationId}/workflow/${leafOrdinal}/parent`,
          causationEventRefs: [],
        },
      );
      if (openedParent.kind !== "c_call_admission") {
        return fail(
          input,
          `workflow-parent-${leafOrdinal}`,
          `diagnostic://abiogenesis/hog/${openedParent.code}@5`,
          openedParent as unknown as JsonValue,
        );
      }
      const fanOutApplication = fanOutApplicationForBatch(
        input.graph,
        openedParent.cCall.batchRef,
      );
      const constructionIntent = rehydrateConstructionIntentForCursor(
        input.store,
        stop,
      );
      const selectedChildInput =
        constructionIntent?.actionKind === "invoke_graph_function"
          ? constructionIntent.targetInput
          : currentInput;
      const selectedChildInputRef =
        constructionIntent?.actionKind === "invoke_graph_function"
          ? constructionIntent.targetInputRef
          : stop.inputRef;
      const selectedChildInputDigest =
        constructionIntent?.actionKind === "invoke_graph_function"
          ? constructionIntent.targetInputDigest
          : stop.inputDigest;
      if (
        selectedChildInput === null ||
        selectedChildInputRef === null ||
        selectedChildInputDigest === null ||
        (
          constructionIntent?.actionKind === "invoke_graph_function" &&
          (
            constructionIntent.selectedGraphFunctionRef !==
              workflowTerm.graphFunctionRef ||
            constructionIntent.targetProgramLocusRef !==
              workflowTerm.graphFunctionRef ||
            sha256Canonical(selectedChildInput) !==
              selectedChildInputDigest
          )
        )
      ) {
        return fail(
          input,
          `workflow-selected-input-${leafOrdinal}`,
          "diagnostic://abiogenesis/hog/workflow-selected-input-mismatch@5",
          workflowTerm as unknown as JsonValue,
        );
      }
      const prepared = yield* Effect.promise(() => Promise.resolve(
        input.childTraversalPreparationPort!.prepare({
        parentExecutionBasis: input.executionBasis,
        parentTraversalScope: input.openedTraversalScope,
        parentCCallRef: openedParent.cCall.cCallRef,
        childGraphFunctionRef: workflowTerm.graphFunctionRef,
        inputRef: selectedChildInputRef,
        inputDigest: selectedChildInputDigest,
        input: selectedChildInput,
        eventTime: input.eventTime,
        correlationId: `${input.correlationId}/workflow/${leafOrdinal}/prepare`,
        }),
      ));
      if (prepared.kind !== "prepared_child_traversal") {
        completion = completeWorkflowPreparationRefusal({
          store: input.store,
          executionBasis: input.executionBasis,
          openedTraversalScope: input.openedTraversalScope,
          graphFunction: input.graphFunction,
          graph: input.graph,
          workflowCursor: stop,
          workflowTerm,
          parentCCall: openedParent.cCall,
          preparationRefusal: prepared,
          clock: {
            eventTime: input.eventTime,
            correlationId: `${input.correlationId}/workflow/${leafOrdinal}/prepare-refusal`,
          },
        });
      } else {
        const childCompletion = yield* graphTraversalEffect({
          store: input.store,
          executionBasis: prepared.executionBasis,
          openedTraversalScope: prepared.openedTraversalScope,
          program: prepared.program,
          graphFunction: prepared.graphFunction,
          graph: prepared.graph,
          graphValidation: prepared.graphValidation,
          implementationSet: prepared.implementationSet,
          interactionSet: prepared.interactionSet,
          ...(input.continuationProductBasis === undefined
            ? {}
            : {
                continuationProductBasis: {
                  ...input.continuationProductBasis,
                  programValidation: prepared.programValidation,
                  graphValidation: prepared.graphValidation,
                },
              }),
          leafPort: input.leafPort,
          childTraversalPreparationPort: input.childTraversalPreparationPort,
          closureContract: prepared.closureContract,
          actorRuntimeBinding: input.actorRuntimeBinding,
          deferFailedRunStop:
            input.deferFailedRunStop === true ||
            fanOutApplication?.elementGraphFunctionRef ===
              workflowTerm.graphFunctionRef,
          input: prepared.input,
          inputDigest: prepared.inputDigest,
          eventTime: input.eventTime,
          correlationId: `${input.correlationId}/workflow/${leafOrdinal}/child`,
          terminalMode: "return_to_parent",
        });
        if (childCompletion.disposition === "held") {
          return suspendHeldWorkflowTraversal({
            parentExecutionBasis: input.executionBasis,
            parentTraversalScope: input.openedTraversalScope,
            parentGraph: input.graph,
            parentClosureContract: input.closureContract,
            parentCCall: openedParent.cCall,
            sourceCursor: stop,
            parentGraphInput: graphEntryInput!,
            parentGraphInputDigest: graphEntryInputDigest,
            parentInput: currentInput,
            parentInputDigest: stop.inputDigest,
            childExecutionBasis: prepared.executionBasis,
            childTraversalScope: prepared.openedTraversalScope,
            childInput: prepared.input,
            childInputDigest: prepared.inputDigest,
            childCompletion,
            terminalMode: input.terminalMode ?? "close_run",
          });
        }
        if (
          childCompletion.disposition === "failed" &&
          childCompletion.replayState.runtimeStatus === "failed"
        ) {
          return childCompletion;
        }
        const selectedActionEvaluationBasis =
          constructionIntent?.actionKind === "invoke_graph_function" &&
            childCompletion.disposition === "closed" &&
            childCompletion.resultRef !== null &&
            childCompletion.judgmentRef !== null &&
            childCompletion.closureRef !== null &&
            typeof childCompletion.resultValue === "object" &&
            childCompletion.resultValue !== null &&
            !Array.isArray(childCompletion.resultValue)
            ? deriveGraphFunctionActionEvaluationBasis(
                input.store,
                input.executionBasis,
                stop,
                {
                  childGraphFunctionRef: workflowTerm.graphFunctionRef,
                  childResultRef: childCompletion.resultRef,
                  childResultValue:
                    childCompletion.resultValue as Readonly<
                      Record<string, JsonValue>
                    >,
                  childJudgmentRef: childCompletion.judgmentRef,
                  childClosureRef: childCompletion.closureRef,
                },
              )
            : null;
        if (
          constructionIntent?.actionKind === "invoke_graph_function" &&
          childCompletion.disposition === "closed" &&
          selectedActionEvaluationBasis === null
        ) {
          return fail(
            input,
            `workflow-action-evaluation-basis-${leafOrdinal}`,
            "diagnostic://abiogenesis/hog/workflow-action-evaluation-basis-absent@5",
            workflowTerm as unknown as JsonValue,
          );
        }
        const outputValueKind = input.leafPort.contractValueKind(
          workflowTerm.outputCarrierRef,
          "output",
        );
        const failureValueKind = input.leafPort.contractValueKind(
          openedParent.cCall.failureContractRef,
          "failure",
        );
        const judgmentRelation = input.leafPort.resolveJudgmentRelation(
          openedParent.cCall.judgmentPredicateRef,
        );
        if (
          outputValueKind === null ||
          failureValueKind === null ||
          judgmentRelation === null
        ) {
          return fail(
            input,
            `workflow-contract-${leafOrdinal}`,
            "diagnostic://abiogenesis/hog/workflow-result-contract-absent@5",
            {
              outputContractRef: workflowTerm.outputCarrierRef,
              predicateRef: openedParent.cCall.judgmentPredicateRef,
            },
          );
        }
        completionValueKind = outputValueKind;
        completionContractRef = workflowTerm.outputCarrierRef;
        completion = completeWorkflowTraversal({
          store: input.store,
          executionBasis: input.executionBasis,
          openedTraversalScope: input.openedTraversalScope,
          program: input.program,
          graphFunction: input.graphFunction,
          graph: input.graph,
          workflowCursor: stop,
          workflowTerm,
          parentCCall: openedParent.cCall,
          childExecutionBasis: prepared.executionBasis,
          childTraversalScope: prepared.openedTraversalScope,
          childCompletion,
          input: currentInput,
          inputDigest: stop.inputDigest,
          resultValueKind: outputValueKind,
          failureValueKind,
          validateSuccessResult: (value): value is Readonly<Record<string, JsonValue>> =>
            input.leafPort.validateContractValue(
              workflowTerm.outputCarrierRef,
              "output",
              value,
            ) && judgmentRelation.evaluate(currentInput, value),
          ...(selectedActionEvaluationBasis === null
            ? {}
            : { successResultValue: selectedActionEvaluationBasis }),
          closureContract: input.closureContract,
          ...(input.terminalMode === undefined
            ? {}
            : { terminalMode: input.terminalMode }),
          judgmentRelation,
          ...(fanOutApplication === null
            ? {}
            : {
                fanOutApplication,
                validateFanOutVector: (
                  value: unknown,
                ): value is Readonly<Record<string, JsonValue>> =>
                  input.leafPort.validateContractValue(
                    fanOutApplication.outputVectorRef,
                    "output",
                    value,
                  ),
              }),
          clock: {
            eventTime: input.eventTime,
            correlationId: `${input.correlationId}/workflow/${leafOrdinal}/foldback`,
          },
        });
      }
    } else {
      if (stop.stopClass === "interaction") {
        if (input.continuationProductBasis === undefined) {
          return fail(
            input,
            `interaction-basis-${leafOrdinal}`,
            "diagnostic://abiogenesis/interaction/product-basis-absent@5",
            stop as unknown as JsonValue,
          );
        }
        const interaction = selectAdmittedInteractionContract(
          input.interactionSet,
          {
            graphFunctionRef: input.graph.graphFunctionRef,
            nodeRef: stop.nodeRef,
            programLocusRef: stop.programLocusRef,
            interactionKind: stop.interactionKind,
            actorCapabilityRef: stop.actorCapabilityRef,
            requestContractRef: stop.requestContractRef,
            responseContractRef: stop.responseContractRef,
            continuationContractRef: stop.continuationContractRef,
          },
        );
        if (interaction === null) {
          return fail(
            input,
            `interaction-${leafOrdinal}`,
            "diagnostic://abiogenesis/interaction/admitted-row-absent@5",
            stop as unknown as JsonValue,
          );
        }
        return completeInteractionTraversal({
          store: input.store,
          executionBasis: input.executionBasis,
          openedTraversalScope: input.openedTraversalScope,
          program: input.program,
          graphFunction: input.graphFunction,
          graph: input.graph,
          traversalStop: stop,
          interactionSet: input.interactionSet,
          interaction,
          productBasis: input.continuationProductBasis,
          input: currentInput,
          inputDigest: stop.cursor.inputDigest,
          closureContract: input.closureContract,
          clock: {
            eventTime: input.eventTime,
            correlationId: `${input.correlationId}/interaction/${leafOrdinal}`,
          },
        });
      }
      const exactStop = stop;
      const resolution = selectAdmittedImplementationResolution(
        input.implementationSet,
        {
          graphFunctionRef: input.graph.graphFunctionRef,
          nodeRef: exactStop.nodeRef,
          programLocusRef: exactStop.programLocusRef,
          implementationBindingRef: exactStop.implementationBindingRef,
        },
      );
      if (resolution === null) {
        return fail(
          input,
          `resolution-${leafOrdinal}`,
          "diagnostic://abiogenesis/implementation-resolution/admitted-row-absent@5",
          {
            nodeRef: exactStop.nodeRef,
            programLocusRef: exactStop.programLocusRef,
            implementationBindingRef: exactStop.implementationBindingRef,
          },
        );
      }
      const outputValueKind = input.leafPort.contractValueKind(
        exactStop.outputContractRef,
        "output",
      );
      if (outputValueKind === null) {
        return fail(
          input,
          `contract-${leafOrdinal}`,
          "diagnostic://abiogenesis/implementation/result-contract-absent@5",
          {
            failureContractRef: exactStop.failureContractRef,
            judgmentPredicateRef: exactStop.judgmentPredicateRef,
            outputContractRef: exactStop.outputContractRef,
          },
        );
      }
      completionValueKind = outputValueKind;
      completionContractRef = exactStop.outputContractRef;
      const recursionApplication = recurseApplicationAtStop(
        input.graph,
        exactStop.compositionRef,
      );
      const traversalInput: CompleteExecutableTraversalInput<
        Readonly<Record<string, JsonValue>>,
        Readonly<Record<string, JsonValue>>
      > = {
        store: input.store,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
        program: input.program,
        graphFunction: input.graphFunction,
        graph: input.graph,
        traversalStop: exactStop,
        implementationSet: input.implementationSet,
        implementationResolution: resolution,
        leafPort: input.leafPort,
        input: currentInput,
        inputDigest: exactStop.cursor.inputDigest,
        closureContract: input.closureContract,
        actorRuntimeBinding: input.actorRuntimeBinding,
        ...(input.deferFailedRunStop === true
          ? { deferFailedRunStop: true }
          : {}),
        terminalMode: recursionApplication === null
          ? input.terminalMode ?? "close_run"
          : "return_to_application",
        ...(recursionApplication === null
          ? {}
          : {
              applicationCompletionMode:
                input.terminalMode ?? "close_run",
            }),
        clock: {
          eventTime: input.eventTime,
          correlationId: `${input.correlationId}/leaf/${leafOrdinal}`,
        },
      };
      const leafResult: CompleteExecutableTraversalResult =
        yield* Effect.promise(() => completeExecutableTraversal(traversalInput));
      if (leafResult.kind === "retry_runtime_failure_transition_admission") {
        if (
          leafResult.disposition !== "retry" ||
          leafResult.progress.progressClass !== "retry"
        ) {
          throw new TypeError(
            "retry transition entered projected execution without retry progress",
          );
        }
        const retry = projectExecutableRetryInput({
          prefix: leafResult.successorPrefix,
          selector: {
            kind: "retry_frontier_selector",
            schemaVersion: "5.0.0",
            runId: input.openedTraversalScope.runId,
            graphCallId: input.openedTraversalScope.graphCallId,
            frameId: input.openedTraversalScope.frameId,
            retryBoundaryRef: leafResult.progress.retryBoundaryRef,
            retryProgressRef: leafResult.progress.progressRef,
          },
          program: input.program,
          graphFunction: input.graphFunction,
          graph: input.graph,
        });
        if (retry.kind !== "executable_retry_input") {
          throw new TypeError(
            `projected retry input refused: ${retry.code}`,
          );
        }
        const resumed = resumeProjectedRetry({
          store: input.store,
          predecessorPrefix: leafResult.successorPrefix,
          retry,
          runtime: {
            executionBasis: input.executionBasis,
            openedTraversalScope: input.openedTraversalScope,
            program: input.program,
            graphFunction: input.graphFunction,
            graph: input.graph,
            graphValidation: input.graphValidation,
            eventTime: input.eventTime,
            correlationId:
              `${input.correlationId}/retry/${retry.nextAttempt}`,
          },
        });
        if (resumed.kind !== "projected_retry_resume") {
          throw new TypeError(
            `projected retry resume refused: ${resumed.code}`,
          );
        }
        return yield* graphTraversalEffect({
          store: input.store,
          executionBasis: input.executionBasis,
          openedTraversalScope: input.openedTraversalScope,
          program: input.program,
          graphFunction: input.graphFunction,
          graph: input.graph,
          graphValidation: input.graphValidation,
          implementationSet: input.implementationSet,
          interactionSet: input.interactionSet,
          ...(input.continuationProductBasis === undefined
            ? {}
            : { continuationProductBasis: input.continuationProductBasis }),
          leafPort: input.leafPort,
          ...(input.childTraversalPreparationPort === undefined
            ? {}
            : {
                childTraversalPreparationPort:
                  input.childTraversalPreparationPort,
              }),
          closureContract: input.closureContract,
          actorRuntimeBinding: input.actorRuntimeBinding,
          ...(input.deferFailedRunStop === true
            ? { deferFailedRunStop: true }
            : {}),
          eventTime: input.eventTime,
          correlationId:
            `${input.correlationId}/retry/${retry.nextAttempt}/execute`,
          ...(input.terminalMode === undefined
            ? {}
            : { terminalMode: input.terminalMode }),
          projectedRetryResume: resumed,
        });
      }
      completion = leafResult;
      if (
        recursionApplication !== null &&
        completion.disposition === "application_ready"
      ) {
        if (
          completion.cCallRef === null ||
          completion.resultRef === null ||
          completion.judgmentRef === null
        ) {
          return fail(
            input,
            `recursion-restoration-coordinates-${leafOrdinal}`,
            "diagnostic://abiogenesis/hog/recursion-restoration-coordinates-absent@5",
            completion as unknown as JsonValue,
          );
        }
        const restoration: RestoreDeferredRecursionInput = {
          traversalInput,
          application: recursionApplication,
          cCallRef: completion.cCallRef,
          resultRef: completion.resultRef,
          judgmentRef: completion.judgmentRef,
        };
        const reconstructed = restoreDeferredRecursion(restoration);
        if (
          reconstructed === null ||
          sha256Canonical(reconstructed as unknown as JsonValue) !==
            sha256Canonical(completion as unknown as JsonValue)
        ) {
          return fail(
            input,
            `recursion-restoration-${leafOrdinal}`,
            "diagnostic://abiogenesis/hog/recursion-restoration-mismatch@5",
            completion as unknown as JsonValue,
          );
        }
        completion = reconstructed;
        const termination = completion.resultValue === null
          ? null
          : recursionTerminationDecision(
            recursionApplication,
            completion.resultValue,
          );
        if (termination === null) {
          return fail(
            input,
            `recursion-termination-${leafOrdinal}`,
            "diagnostic://abiogenesis/hog/recursion-termination-value-invalid@5",
            {
              applicationRef: recursionApplication.applicationRef,
              resultRef: completion.resultRef,
            },
          );
        }
        if (termination) {
          completion = completeDeferredApplicationTerminal({
            completion,
            restoration,
            application: recursionApplication,
            clock: {
              eventTime: input.eventTime,
              correlationId:
                `${input.correlationId}/recursion/${leafOrdinal}/terminal`,
            },
          });
        } else if (exactStop.cursor.attempt >= recursionApplication.bound) {
          completion = blockDeferredRecursion({
            completion,
            restoration,
            application: recursionApplication,
            clock: {
              eventTime: input.eventTime,
              correlationId:
                `${input.correlationId}/recursion/${leafOrdinal}/bound`,
            },
          });
        } else {
          if (
            input.childTraversalPreparationPort === undefined ||
            !isChildTraversalPreparationPort(input.childTraversalPreparationPort) ||
            completion.cCallRef === null ||
            completion.resultRef === null ||
            typeof completion.resultValue !== "object" ||
            completion.resultValue === null ||
            Array.isArray(completion.resultValue)
          ) {
            return fail(
              input,
              `recursion-child-port-${leafOrdinal}`,
              "diagnostic://abiogenesis/hog/recursion-child-preparation-absent@5",
              { applicationRef: recursionApplication.applicationRef },
            );
          }
          const recursionInput = completion.resultValue as Readonly<
            Record<string, JsonValue>
          >;
          const recursionInputDigest = sha256Canonical(recursionInput);
          const parentCCallRef = completion.cCallRef;
          const parentResultRef = completion.resultRef;
          const prepared = yield* Effect.promise(() => Promise.resolve(
            input.childTraversalPreparationPort!.prepare({
            parentExecutionBasis: input.executionBasis,
            parentTraversalScope: input.openedTraversalScope,
            parentCCallRef,
            childGraphFunctionRef: recursionApplication.graphFunctionRef,
            inputRef: parentResultRef,
            inputDigest: recursionInputDigest,
            input: recursionInput,
            eventTime: input.eventTime,
            correlationId:
              `${input.correlationId}/recursion/${leafOrdinal}/prepare`,
            }),
          ));
          if (prepared.kind !== "prepared_child_traversal") {
            completion = blockDeferredRecursionPreparation({
              completion,
              restoration,
              application: recursionApplication,
              preparationRefusal: prepared,
              clock: {
                eventTime: input.eventTime,
                correlationId:
                  `${input.correlationId}/recursion/${leafOrdinal}/prepare-refusal`,
              },
            });
          } else {
            const childCompletion = yield* graphTraversalEffect({
              store: input.store,
              executionBasis: prepared.executionBasis,
              openedTraversalScope: prepared.openedTraversalScope,
              program: prepared.program,
              graphFunction: prepared.graphFunction,
              graph: prepared.graph,
              graphValidation: prepared.graphValidation,
              implementationSet: prepared.implementationSet,
              interactionSet: prepared.interactionSet,
              ...(input.continuationProductBasis === undefined
                ? {}
                : {
                    continuationProductBasis: {
                      ...input.continuationProductBasis,
                      programValidation: prepared.programValidation,
                      graphValidation: prepared.graphValidation,
                    },
                  }),
              leafPort: input.leafPort,
              childTraversalPreparationPort:
                input.childTraversalPreparationPort,
              closureContract: prepared.closureContract,
              actorRuntimeBinding: input.actorRuntimeBinding,
              ...(input.deferFailedRunStop === true
                ? { deferFailedRunStop: true }
                : {}),
              input: prepared.input,
              inputDigest: prepared.inputDigest,
              eventTime: input.eventTime,
              correlationId:
                `${input.correlationId}/recursion/${leafOrdinal}/child`,
              terminalMode: "return_to_parent",
            });
            if (childCompletion.disposition === "held") {
              return suspendHeldRecursionTraversal({
                parentGraphInput: graphEntryInput!,
                parentGraphInputDigest: graphEntryInputDigest,
                application: recursionApplication,
                deferredCompletion: completion,
                restoration,
                childExecutionBasis: prepared.executionBasis,
                childTraversalScope: prepared.openedTraversalScope,
                childInput: prepared.input,
                childInputDigest: prepared.inputDigest,
                childCompletion,
                terminalMode: input.terminalMode ?? "close_run",
              });
            }
            if (
              childCompletion.disposition === "failed" &&
              childCompletion.replayState.runtimeStatus === "failed"
            ) {
              return childCompletion;
            }
            completion = advanceDeferredRecursion({
              completion,
              restoration,
              application: recursionApplication,
              childExecutionBasis: prepared.executionBasis,
              childTraversalScope: prepared.openedTraversalScope,
              childCompletion,
              clock: {
                eventTime: input.eventTime,
                correlationId:
                  `${input.correlationId}/recursion/${leafOrdinal}/foldback`,
              },
            });
          }
        }
      }
    }
    if (completion === null) {
      return fail(
        input,
        "empty-traversal",
        "diagnostic://abiogenesis/hog/no-executable-completion@5",
        { cursorAdmissionEventRef: traversalCursorAdmissionEventRef(input.store, initialCursor) },
      );
    }
    if (completion.disposition !== "advanced") return completion;
    const nextMaterializedInput = materializedInputAtCursor(
      input.graph,
      completion.nextCursor,
    );
    if (
      completion.nextCursor === null ||
      completion.continuationKind === null ||
      completion.nextInputContractRef === null ||
      completionValueKind === null ||
      completionContractRef === null ||
      (
        nextMaterializedInput === null &&
        (
          typeof completion.resultValue !== "object" ||
          completion.resultValue === null ||
          Array.isArray(completion.resultValue)
        )
      ) ||
      (
        nextMaterializedInput !== null
          ? false
          : completion.continuationKind === "retry"
          ? completion.nextCursor.inputRef.length === 0 ||
            completion.nextCursor.inputDigest !==
              sha256Canonical(completion.resultValue)
          : !input.leafPort.validateContractValue(
            completion.nextInputContractRef,
            "output",
            completion.resultValue,
          )
      )
    ) {
      return fail(
        input,
        `advanced-result-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/advanced-result-basis-absent@5",
        { leafOrdinal, completionDisposition: completion.disposition },
      );
    }
    const nextInput = nextMaterializedInput?.value ??
      completion.resultValue as Readonly<Record<string, JsonValue>>;
    let nextStop: StructuralTraversalResult = traverseFromCursor(
      {
        program: input.program,
        graphFunction: input.graphFunction,
        graph: input.graph,
        graphValidation: input.graphValidation,
        executionBasis: input.executionBasis,
        openedTraversalScope: input.openedTraversalScope,
      },
      completion.nextCursor,
    );
    nextStop = yield* advanceStructural(
      input,
      nextStop,
      leafOrdinal + 1,
      nextInput,
    );
    const materializedNextInput = materializedInputAtCursor(
      input.graph,
      activeCursor(nextStop),
    )?.value ?? nextInput;
    if (
      nextStop.kind !== "traversal_stop_ref" &&
      !(
        nextStop.kind === "traversal_cursor" &&
        resolveTraversalTerm(input.graph, nextStop).kind === "c_workflow"
      )
    ) {
      return fail(
        input,
        `continuation-${leafOrdinal}`,
        "diagnostic://abiogenesis/hog/continuation-not-executable@5",
        nextStop as unknown as JsonValue,
      );
    }
    return yield* evaluateLocus(
      nextStop,
      materializedNextInput,
      leafOrdinal + 1,
    );
  }));
  return yield* evaluateLocus(stop, currentInput, 0);
  }));
}

async function runGraphTraversalProgram(
  program: Effect.Effect<ExecutableTraversalCompletion>,
): Promise<ExecutableTraversalCompletion> {
  const exit = await runEffectProgram(program);
  if (Exit.isSuccess(exit)) return exit.value;
  throw Cause.squash(exit.cause);
}

export type ExecuteGraphTraversalRequest =
  | ExecuteGraphTraversalInput
  | ResumeHeldTraversalInput;

function traversalProgram(
  input: ExecuteGraphTraversalRequest,
): Effect.Effect<ExecutableTraversalCompletion> {
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
  const traversal = traverseFromCursor(
    {
      program: parent.program,
      graphFunction: parent.graphFunction,
      graph: parent.graph,
      graphValidation: parent.graphValidation,
      executionBasis: parent.executionBasis,
      openedTraversalScope: parent.openedTraversalScope,
    },
    input.sourceCursor,
  );
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
  let completion = completeWorkflowTraversal({
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
  if (completion.disposition !== "advanced") {
    return completion;
  }
  if (
    completion.nextCursor === null ||
    completion.resultValue === null ||
    typeof completion.resultValue !== "object" ||
    Array.isArray(completion.resultValue)
  ) {
    return fail(
      parent,
      "workflow-resume-advance",
      "diagnostic://abiogenesis/hog/workflow-resume-advance-incomplete@5",
      completion as unknown as JsonValue,
    );
  }
  const nextInput =
    completion.resultValue as Readonly<Record<string, JsonValue>>;
  const nextInputDigest = sha256Canonical(nextInput as unknown as JsonValue);
  if (completion.nextCursor.inputDigest !== nextInputDigest) {
    return fail(
      parent,
      "workflow-resume-advance-digest",
      "diagnostic://abiogenesis/hog/workflow-resume-advance-digest-mismatch@5",
      completion as unknown as JsonValue,
    );
  }
  completion = yield* graphTraversalEffect({
    ...parent,
    input: input.suspension.parentGraphInput,
    inputDigest: input.suspension.parentGraphInputDigest,
    correlationId: `${parent.correlationId}/parent`,
    resume: {
      cursor: completion.nextCursor,
      input: nextInput,
      inputDigest: nextInputDigest,
    },
  });
  return completion;
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
  const traversalStop = traverseFromCursor(
    {
      program: parent.program,
      graphFunction: parent.graphFunction,
      graph: parent.graph,
      graphValidation: parent.graphValidation,
      executionBasis: parent.executionBasis,
      openedTraversalScope: parent.openedTraversalScope,
    },
    input.sourceCursor,
  );
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
  let completion = advanceDeferredRecursion({
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
  if (completion.disposition !== "advanced") {
    return completion;
  }
  if (
    completion.nextCursor === null ||
    completion.resultValue === null ||
    typeof completion.resultValue !== "object" ||
    Array.isArray(completion.resultValue)
  ) {
    return fail(
      parent,
      "recursion-resume-advance",
      "diagnostic://abiogenesis/hog/recursion-resume-advance-incomplete@5",
      completion as unknown as JsonValue,
    );
  }
  const nextInput =
    completion.resultValue as Readonly<Record<string, JsonValue>>;
  const nextInputDigest = sha256Canonical(nextInput as unknown as JsonValue);
  if (completion.nextCursor.inputDigest !== nextInputDigest) {
    return fail(
      parent,
      "recursion-resume-advance-digest",
      "diagnostic://abiogenesis/hog/recursion-resume-advance-digest-mismatch@5",
      completion as unknown as JsonValue,
    );
  }
  completion = yield* graphTraversalEffect({
    ...parent,
    input: input.suspension.parentGraphInput,
    inputDigest: input.suspension.parentGraphInputDigest,
    correlationId: `${parent.correlationId}/parent`,
    resume: {
      cursor: completion.nextCursor,
      input: nextInput,
      inputDigest: nextInputDigest,
    },
  });
  return completion;
  }));
}
