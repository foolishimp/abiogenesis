import {
  admitRoute,
  rehydrateExecutionBasisAtPrefix,
  rehydrateOpenedTraversalScopeAtPrefix,
  replayValidatedRuntimeEventPrefix,
  WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
  type AbgEventStore,
  type ExecutionBasis,
  type OpenedTraversalScope,
} from "../abg/index.js";
import {
  admitRetryAttempt,
  assertFullRetryAttemptFrontier,
  deriveRetryAttemptManifestRef,
  projectDeclaredRetryAttemptCoordinates,
  projectExecutableRetryInput,
  projectRetryAttempt,
  type ExecutableRetryInput,
} from "../abg/retry.js";
import {
  admitRuntimeEventTransactionAtExpectedPrefix,
  assertHeldEventStoreAtDurablePrefix,
  readRuntimeEventsAtDurablePrefix,
  type DurablePrefixCoordinate,
} from "../abg/event_store.js";
import { selectValidatedRuntimeEventPrefix } from "../abg/event_prefix.js";
import type { GraphFunction, GtlGraph, GtlProgram } from "../gtl/contracts.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { GraphValidation } from "../validator/graph.js";
import { applyAdmittedRoute, deriveRetryTraversalCursor, rehydrateHeldInteractionCursor } from "./traversal.js";
import { proposeRetryRoute } from "./traversal_route.js";
import type { ProjectedRetryResumeSuccess } from "./graph_execute.js";
export interface AdmitProjectedRetryResumeInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly retry: ExecutableRetryInput;
  readonly runtime: Readonly<{
    executionBasis: ExecutionBasis;
    openedTraversalScope: OpenedTraversalScope;
    program: Readonly<GtlProgram>;
    graphFunction: Readonly<GraphFunction>;
    graph: Readonly<GtlGraph>;
    graphValidation: GraphValidation;
    eventTime: string;
    correlationId: string;
  }>;
}
function same(left: unknown, right: unknown): boolean {
  return sha256Canonical(left as JsonValue) === sha256Canonical(right as JsonValue);
}

export function admitProjectedRetryResume(
  input: AdmitProjectedRetryResumeInput,
): ProjectedRetryResumeSuccess {
  const fresh = projectExecutableRetryInput({
    prefix: input.predecessorPrefix,
    selector: input.retry.selector,
    program: input.runtime.program,
    graphFunction: input.runtime.graphFunction,
    graph: input.runtime.graph,
  });
  if (fresh.kind !== "executable_retry_input" || !same(fresh, input.retry)) {
    throw new TypeError("retry input differs from its exact ABG projection");
  }
  assertFullRetryAttemptFrontier(fresh.retryFrontier);
  const durableEvents = readRuntimeEventsAtDurablePrefix(input.predecessorPrefix);
  const authorityPrefix = selectValidatedRuntimeEventPrefix(durableEvents);
  const prefix = selectValidatedRuntimeEventPrefix(durableEvents, {
    runId: fresh.selector.runId,
  });
  const basis = rehydrateExecutionBasisAtPrefix(prefix, fresh.executionBasisRef);
  const scope = rehydrateOpenedTraversalScopeAtPrefix(
    prefix,
    input.runtime.openedTraversalScope as unknown as Readonly<Record<string, JsonValue>>,
  );
  if (basis === null || scope === null ||
      !same(basis, input.runtime.executionBasis) ||
      !same(scope, input.runtime.openedTraversalScope) ||
      input.runtime.program.programRef !== fresh.programRef ||
      sha256Canonical(input.runtime.program as unknown as JsonValue) !== fresh.programDigest ||
      input.runtime.graphFunction.name !== fresh.graphFunctionRef ||
      sha256Canonical(input.runtime.graphFunction as unknown as JsonValue) !==
        fresh.graphFunctionDigest ||
      input.runtime.graph.materializationRef !== fresh.graphRef ||
      input.runtime.graph.materializationDigest !== fresh.graphDigest ||
      input.runtime.graphValidation.validationRef !== basis.graphValidationRef) {
    throw new TypeError("retry runtime differs from its admitted execution basis");
  }
  const source = rehydrateHeldInteractionCursor(prefix, fresh.sourceCursor);
  if (source === null) throw new TypeError("retry source cursor is not admitted");
  const target = deriveRetryTraversalCursor(input.runtime.graph, source, {
    inputRef: fresh.inputRef,
    inputDigest: fresh.inputDigest,
  });
  if (target.kind !== "traversal_cursor" || target.attempt !== fresh.nextAttempt ||
      !same(target.retryPath, fresh.nextRetryPath)) {
    throw new TypeError("HoG could not derive the exact retry successor");
  }
  const replay = replayValidatedRuntimeEventPrefix(prefix, authorityPrefix);
  const proposal = proposeRetryRoute(
    input.runtime.graph,
    source,
    target,
    fresh.cCall,
    fresh.progress,
    replay,
    fresh.cCall.transitionContractRef,
  );
  const declaration = projectDeclaredRetryAttemptCoordinates(
    input.runtime.graph,
    target,
  );
  if (proposal.kind !== "traversal_route_candidate" || declaration === null ||
      declaration.inputCarrierRef !== fresh.inputContractRef) {
    throw new TypeError("retry route or declared attempt coordinate was refused");
  }
  const expectedAttemptBody = {
    attemptManifestRef: deriveRetryAttemptManifestRef({
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
    retryableFailureClasses: WORKER_TRANSPORT_FAILURE_CLASS_VALUES,
    priorJudgmentRef: proposal.judgmentRef,
    priorRouteRef: proposal.candidateRef,
    inputRef: target.inputRef,
    inputDigest: target.inputDigest,
    inputContractRef: declaration.inputCarrierRef,
    inputValue: fresh.inputValue,
  };
  const expectedAttemptDigest = sha256Canonical(expectedAttemptBody as unknown as JsonValue);
  const expectedAttemptRef =
    `retry-attempt://abiogenesis/${expectedAttemptDigest.slice("sha256:".length)}`;
  assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
  const transaction = admitRuntimeEventTransactionAtExpectedPrefix(
    input.store,
    input.store.digest(),
    () => {
      const route = admitRoute(
        input.store,
        input.runtime.executionBasis,
        input.runtime.graph,
        source,
        target,
        replay,
        proposal,
        {
          eventTime: input.runtime.eventTime,
          correlationId: `${input.runtime.correlationId}/route`,
          causationEventRefs: [],
        },
        {
          graphFunction: input.runtime.graphFunction,
          cCall: fresh.cCall,
          progress: fresh.progress,
        },
      );
      if (route.kind !== "admitted_traversal_route" ||
          route.routeRef !== proposal.candidateRef ||
          route.routeDigest !== proposal.candidateDigest) {
        throw new TypeError("retry route admission differs from proposal");
      }
      const cursor = applyAdmittedRoute(source, target, "retry", route);
      if (cursor.kind !== "traversal_cursor" || !same(cursor, target)) {
        throw new TypeError("retry route application differs from target");
      }
      const attempt = admitRetryAttempt(
        input.store,
        input.runtime.executionBasis,
        input.runtime.graph,
        input.runtime.graphFunction,
        cursor,
        fresh.inputValue,
        route.admissionEventRef,
        {
          eventTime: input.runtime.eventTime,
          correlationId: `${input.runtime.correlationId}/attempt`,
          causationEventRefs: [],
        },
      );
      if (attempt.kind !== "retry_attempt_admission" ||
          attempt.attemptRef !== expectedAttemptRef ||
          attempt.attemptDigest !== expectedAttemptDigest) {
        throw new TypeError("retry attempt admission differs from declared GTL");
      }
      const { kind: _kind, schemaVersion: _schema, disposition: _disposition,
        attemptRef: _ref, attemptDigest: _digest, admissionEventRef: _event,
        ...attemptBody } = attempt;
      const successor = input.store.readAll().filter((event) =>
        event.admissionOrdinal > fresh.lastAdmissionOrdinal
      );
      if (!same(attemptBody, expectedAttemptBody) || successor.length !== 2 ||
          successor[0]?.eventId !== route.admissionEventRef ||
          successor[1]?.eventId !== attempt.admissionEventRef) {
        throw new TypeError("retry admission order or body differs from declaration");
      }
      const projected = projectRetryAttempt(
        selectValidatedRuntimeEventPrefix(input.store.readAll(), {
          runId: fresh.selector.runId,
        }),
        input.runtime.graph,
        attempt.admissionEventRef,
      );
      if (!same(projected, attempt)) {
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
