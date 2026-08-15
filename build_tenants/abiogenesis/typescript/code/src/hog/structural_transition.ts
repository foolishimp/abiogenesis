import * as Abg from "../abg/index.js";
import {
  isTraversalCursorCandidate,
  traversalCursorAdmissionEventRefAtPrefix,
  type AbgEventStore,
  type ExecutionBasis,
  type OpenedTraversalScope,
} from "../abg/index.js";
import type { DurablePrefixCoordinate } from "../abg/event_store.js";
import * as AbgRetry from "../abg/retry.js";
import type { CProgramNode } from "../gtl/c_algebra.js";
import type { GraphFunction, GtlGraph } from "../gtl/contracts.js";
import type { LeafInvocationPort } from "../implementation/contracts.js";
import { isAdmittedLeafInvocationPort } from
  "../implementation/leaf_invocation_port.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import {
  admissionBasis,
  materializedInputAtCursor,
  replayAtDurable,
  runtimePrefixAtDurable,
} from "./operator_support.js";
import * as Routes from "./route_proposal.js";
import {
  applyAdmittedRoute,
  deriveStructuralTargetCursor,
  type TraversalCursor,
} from "./traversal.js";
import { failTraversal } from "./traversal_failure.js";

export type StructuralTerm = Exclude<
  Readonly<CProgramNode>,
  Readonly<{ kind: "c_of" | "c_workflow" }>
>;

export interface StructuralTransitionInput {
  readonly store: AbgEventStore;
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly graph: Readonly<GtlGraph>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly leafPort: LeafInvocationPort;
  readonly cursor: TraversalCursor;
  readonly input: Readonly<Record<string, JsonValue>>;
  readonly term: StructuralTerm;
  readonly ordinal: number;
  readonly structuralOrdinal: number;
  readonly eventTime: string;
  readonly correlationId: string;
}

export interface StructuralTransitionAdvance {
  readonly kind: "structural_advance";
  readonly cursor: TraversalCursor;
  readonly successorPrefix: DurablePrefixCoordinate;
}

export function advanceStructuralTransition(
  input: StructuralTransitionInput,
): StructuralTransitionAdvance {
  const fail = (
    predecessorPrefix: DurablePrefixCoordinate,
    stage: string,
    diagnosticRef: string,
    candidate: JsonValue,
  ): never => failTraversal({
    store: input.store,
    predecessorPrefix,
    executionBasis: input.executionBasis,
    openedTraversalScope: input.openedTraversalScope,
    eventTime: input.eventTime,
    correlationId: input.correlationId,
    stage,
    diagnosticRef,
    candidate,
  });
  if (
    !isAdmittedLeafInvocationPort(input.leafPort) ||
    input.leafPort.implementationSetRef !==
      input.executionBasis.implementationSetRef ||
    input.leafPort.implementationSetDigest !==
      input.executionBasis.implementationSetDigest
  ) {
    return fail(
      input.predecessorPrefix,
      `structural-step-${input.ordinal}`,
      "diagnostic://abiogenesis/hog/structural-step-refused@5",
      input.term as unknown as JsonValue,
    );
  }
  const target = deriveStructuralTargetCursor(
    input.graph,
    input.cursor,
    input.term,
  );
  if (target === null || target.kind === "traversal_refusal") {
    return fail(
      input.predecessorPrefix,
      `structural-step-${input.ordinal}`,
      "diagnostic://abiogenesis/hog/structural-step-refused@5",
      (target ?? input.term) as unknown as JsonValue,
    );
  }
  const retryInput = input.term.kind === "c_retry"
    ? materializedInputAtCursor(input.graph, target)?.value ?? input.input
    : null;
  if (
    input.term.kind === "c_retry" &&
    (retryInput === null ||
      target.inputDigest !== sha256Canonical(retryInput) ||
      !input.leafPort.validateContractValueByRef(
        input.term.inputCarrierRef,
        retryInput,
      ))
  ) {
    return fail(
      input.predecessorPrefix,
      `structural-step-${input.ordinal}`,
      "diagnostic://abiogenesis/hog/structural-step-refused@5",
      input.term as unknown as JsonValue,
    );
  }
  const exitsRetry = input.term.kind === "c_identity" &&
    target.retryPath.length < input.cursor.retryPath.length;
  const predecessorRunPrefix = runtimePrefixAtDurable(
    input.predecessorPrefix,
    input.cursor.runId,
  );
  const completionWitnessEventRef = exitsRetry
    ? traversalCursorAdmissionEventRefAtPrefix(
        predecessorRunPrefix,
        input.cursor,
      )
    : null;
  if (exitsRetry && completionWitnessEventRef === null) {
    return fail(
      input.predecessorPrefix,
      `structural-step-${input.ordinal}`,
      "diagnostic://abiogenesis/hog/structural-step-refused@5",
      input.term as unknown as JsonValue,
    );
  }
  const clock = {
    eventTime: input.eventTime,
    correlationId: `${input.correlationId}/structural/${input.ordinal}`,
  };
  const progressBasis = admissionBasis(
    clock,
    `progress/${input.structuralOrdinal}`,
  );
  const completion = {
    completionClass: "structural_identity_success" as const,
    completionWitnessEventRef: completionWitnessEventRef!,
  };
  const progressPlan = exitsRetry
    ? AbgRetry.planCompletedRetryProgress(
        input.predecessorPrefix,
        input.graph,
        input.graphFunction,
        input.cursor,
        target,
        completion,
        progressBasis,
      )
    : null;
  if (
    progressPlan !== null &&
    progressPlan.kind !== "completed_retry_progress_plan"
  ) {
    return fail(
      input.predecessorPrefix,
      `structural-progress-${input.ordinal}`,
      `diagnostic://abiogenesis/hog/${progressPlan.code}@5`,
      progressPlan as unknown as JsonValue,
    );
  }
  const replayState = progressPlan?.replayState ??
    replayAtDurable(input.predecessorPrefix, input.cursor.runId);
  const progresses = progressPlan?.progresses ?? [];
  const routeKind = input.term.kind === "c_retry"
    ? "retry" as const
    : "advance" as const;
  const proposal = Routes.proposeStructuralRoute(
    input.graph,
    input.cursor,
    target,
    routeKind,
    replayState,
    progresses,
  );
  if (proposal.kind !== "traversal_route_candidate") {
    return fail(
      input.predecessorPrefix,
      `structural-route-${input.ordinal}`,
      `diagnostic://abiogenesis/hog/${proposal.code}@5`,
      proposal as unknown as JsonValue,
    );
  }
  const candidate = routeKind === "retry"
    ? Abg.completeTraversalTransitionCandidate({
        kind: "traversal_transition_candidate",
        schemaVersion: "5.0.0",
        transitionClass: "retry",
        route: proposal,
        evidence: null,
        retryInput: retryInput!,
        terminalizeRun: false,
      })
    : Abg.completeTraversalTransitionCandidate({
        kind: "traversal_transition_candidate",
        schemaVersion: "5.0.0",
        transitionClass: "route",
        route: proposal,
        evidence: exitsRetry
          ? {
              evidenceClass: "structural_identity",
              graphFunction: input.graphFunction,
              completionClass: "structural_identity_success",
              completionWitnessEventRef: completionWitnessEventRef!,
              completedProgresses: progresses,
            }
          : null,
        terminalizeRun: false,
      });
  const routeBasis = admissionBasis(clock, `route/${input.structuralOrdinal}`);
  const committed = progressPlan === null
    ? Abg.admitTraversalTransition({
        predecessorPrefix: input.predecessorPrefix,
        store: input.store,
        executionBasis: input.executionBasis,
        graph: input.graph,
        graphFunction: input.graphFunction,
        source: input.cursor,
        target,
        candidate,
        basis: routeBasis,
      })
    : Abg.admitCompletedRetryTraversalTransition({
        predecessorPrefix: input.predecessorPrefix,
        store: input.store,
        executionBasis: input.executionBasis,
        graph: input.graph,
        graphFunction: input.graphFunction,
        source: input.cursor,
        target,
        candidate,
        basis: routeBasis,
        progressPlan,
        completion,
        progressBasis,
      });
  if (committed.kind !== "route_transition_admission") {
    return fail(
      input.predecessorPrefix,
      `structural-transition-${input.ordinal}`,
      `diagnostic://abiogenesis/hog/${committed.code}@5`,
      committed as unknown as JsonValue,
    );
  }
  const structural = applyAdmittedRoute(
    runtimePrefixAtDurable(committed.successorPrefix, input.cursor.runId),
    input.cursor,
    target,
    input.term.kind === "c_retry" ? "retry" : "advance",
    committed.route,
  );
  if (
    structural.kind !== "traversal_cursor" ||
    !isTraversalCursorCandidate(structural) ||
    structural.cursorRef === input.cursor.cursorRef
  ) {
    return fail(
      committed.successorPrefix,
      `structural-step-${input.ordinal}`,
      "diagnostic://abiogenesis/hog/structural-step-refused@5",
      structural as unknown as JsonValue,
    );
  }
  return {
    kind: "structural_advance",
    cursor: structural,
    successorPrefix: committed.successorPrefix,
  };
}
