// Implements: REQ-R-ABG3-PROJECTION
// Implements: REQ-R-ABG3-CONTINUATION
// Implements: REQ-R-ABG3-ASSURANCE
// Implements: REQ-R-ABG3-RETRY

import type { AssuranceClosureDecision } from "./assurance.js";
import type {
  ExecutionBasis,
  RuntimeAggregateProjection,
  TerminalKind,
  TerminalTransition
} from "./carriers.js";
import type { TraversalContinuationActionProjection } from "./traversal_non_progress.js";
import {
  assertNonEmptyString,
  assertProjectionBasis,
  assertVectorIndexInRange,
  frameIdForBasis,
  graphCallIdForBasis,
  vectorEdge
} from "./runtime_support.js";

export const RUNTIME_CONTINUATION_TRANSITION_DISPOSITION_VALUES = Object.freeze([
  "close",
  "retry_same_edge",
  "yield_continuation",
  "inspect_runtime_archive",
  "reprice",
  "block"
] as const);

export type RuntimeContinuationTransitionDisposition =
  (typeof RUNTIME_CONTINUATION_TRANSITION_DISPOSITION_VALUES)[number];

export const RUNTIME_CONTINUATION_TRANSITION_REASON_VALUES = Object.freeze([
  "typed_block",
  "assurance_block",
  "typed_reprice",
  "assurance_reprice",
  "inspect_runtime_archive",
  "retry_exhausted",
  "runtime_blocked",
  "runtime_policy_reprice",
  "typed_yield",
  "traversal_yield",
  "traversal_retry",
  "assurance_qualified_defer",
  "typed_retry",
  "assurance_retry",
  "terminal_retry_fallback",
  "assurance_close",
  "edge_close",
  "unsupported_state"
] as const);

export type RuntimeContinuationTransitionReason =
  (typeof RUNTIME_CONTINUATION_TRANSITION_REASON_VALUES)[number];

export interface RuntimeContinuationTransitionProjection {
  readonly kind: "runtime_continuation_transition_projection";
  readonly projectionRef: string;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly disposition: RuntimeContinuationTransitionDisposition;
  readonly terminalKind: TerminalKind | null;
  readonly retryEligible: boolean;
  readonly terminal: boolean;
  readonly reason: RuntimeContinuationTransitionReason;
  readonly reasonRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}

export interface RuntimeContinuationTransitionInput {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly assuranceClosureDecision?: AssuranceClosureDecision | null | undefined;
  readonly traversalContinuationAction?:
    | TraversalContinuationActionProjection
    | null
    | undefined;
  readonly typedBlockRefs?: readonly string[] | undefined;
  readonly typedRepriceRefs?: readonly string[] | undefined;
  readonly typedYieldRefs?: readonly string[] | undefined;
  readonly typedRetryRefs?: readonly string[] | undefined;
  readonly terminalRetryRefs?: readonly string[] | undefined;
  readonly edgeCanClose?: boolean | undefined;
}

function uniqueStrings(values: readonly (string | null | undefined)[]): readonly string[] {
  return Object.freeze(
    [
      ...new Set(
        values.filter(
          (value): value is string =>
            value !== null && value !== undefined && value.length > 0
        )
      )
    ]
  );
}

function projectionRef(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly disposition: RuntimeContinuationTransitionDisposition;
  readonly reason: RuntimeContinuationTransitionReason;
  readonly reasonRefs: readonly string[];
}): string {
  return `runtime-continuation-transition:${JSON.stringify({
    basisId: input.basis.id,
    vectorIndex: input.vectorIndex,
    disposition: input.disposition,
    reason: input.reason,
    reasonRefs: input.reasonRefs
  })}`;
}

function terminalKindForDisposition(
  disposition: RuntimeContinuationTransitionDisposition
): TerminalKind | null {
  switch (disposition) {
    case "close":
      return "converged";
    case "yield_continuation":
      return "yielded";
    case "inspect_runtime_archive":
    case "reprice":
    case "block":
      return "gap_stop";
    case "retry_same_edge":
      return null;
    default: {
      const exhaustive: never = disposition;
      throw new TypeError(
        `Unsupported runtime continuation disposition ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function terminalityForDisposition(
  disposition: RuntimeContinuationTransitionDisposition
): boolean {
  return disposition !== "retry_same_edge" && disposition !== "yield_continuation";
}

function transition(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly disposition: RuntimeContinuationTransitionDisposition;
  readonly reason: RuntimeContinuationTransitionReason;
  readonly reasonRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
}): RuntimeContinuationTransitionProjection {
  const edge = vectorEdge(input.basis, input.vectorIndex);
  const reasonRefs = uniqueStrings(input.reasonRefs ?? Object.freeze([]));
  const evidenceRefs = uniqueStrings([
    ...(input.evidenceRefs ?? Object.freeze([])),
    ...reasonRefs
  ]);
  const sourceProjectionRefs = uniqueStrings([
    sourceProjectionRefForRuntime(input.runtimeProjection),
    ...(input.sourceProjectionRefs ?? Object.freeze([]))
  ]);
  return Object.freeze({
    kind: "runtime_continuation_transition_projection" as const,
    projectionRef: projectionRef({
      basis: input.basis,
      vectorIndex: input.vectorIndex,
      disposition: input.disposition,
      reason: input.reason,
      reasonRefs
    }),
    basisId: input.basis.id,
    graphFunctionId: input.basis.graphFunction.id,
    runId: input.basis.runId,
    workKey: input.basis.workKey,
    graphCallId: input.runtimeProjection.graphCallId ?? graphCallIdForBasis(input.basis),
    frameId: input.runtimeProjection.frameId ?? frameIdForBasis(input.basis),
    vectorIndex: input.vectorIndex,
    edge,
    disposition: input.disposition,
    terminalKind: terminalKindForDisposition(input.disposition),
    retryEligible: input.disposition === "retry_same_edge",
    terminal: terminalityForDisposition(input.disposition),
    reason: input.reason,
    reasonRefs,
    evidenceRefs,
    sourceProjectionRefs
  } satisfies RuntimeContinuationTransitionProjection);
}

function sourceProjectionRefForRuntime(
  projection: RuntimeAggregateProjection
): string {
  return `runtime-projection:${JSON.stringify({
    basisId: projection.basisId,
    graphFunctionId: projection.graphFunctionId,
    graphCallId: projection.graphCallId,
    frameId: projection.frameId,
    nextVectorIndex: projection.nextVectorIndex
  })}`;
}

function assuranceRefs(
  decision: AssuranceClosureDecision | null | undefined
): readonly string[] {
  if (decision === undefined || decision === null) {
    return Object.freeze([]);
  }
  return uniqueStrings([
    decision.projectionRef,
    ...decision.rowIds,
    ...decision.blockingStatuses
  ]);
}

function traversalActionRefs(
  action: TraversalContinuationActionProjection | null | undefined
): readonly string[] {
  if (action === undefined || action === null) {
    return Object.freeze([]);
  }
  return uniqueStrings([
    action.projectionRef,
    action.sourceCarrierRef,
    ...action.reasonRefs
  ]);
}

function assertAssuranceScope(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly assuranceClosureDecision: AssuranceClosureDecision | null | undefined;
}): void {
  const decision = input.assuranceClosureDecision;
  if (decision === undefined || decision === null) {
    return;
  }
  if (decision.scope.basisId !== input.basis.id) {
    throw new TypeError("RuntimeContinuationTransition rejects assurance basis drift");
  }
  if (decision.scope.graphFunctionId !== input.basis.graphFunction.id) {
    throw new TypeError(
      "RuntimeContinuationTransition rejects assurance graph function drift"
    );
  }
  if (decision.scope.vectorIndex !== input.vectorIndex) {
    throw new TypeError("RuntimeContinuationTransition rejects assurance vector drift");
  }
}

function assertTraversalActionScope(input: {
  readonly basis: ExecutionBasis;
  readonly vectorIndex: number;
  readonly traversalContinuationAction:
    | TraversalContinuationActionProjection
    | null
    | undefined;
}): void {
  const action = input.traversalContinuationAction;
  if (action === undefined || action === null) {
    return;
  }
  if (action.basisId !== input.basis.id) {
    throw new TypeError("RuntimeContinuationTransition rejects action basis drift");
  }
  if (action.graphFunctionId !== input.basis.graphFunction.id) {
    throw new TypeError(
      "RuntimeContinuationTransition rejects action graph function drift"
    );
  }
  if (action.vectorIndex !== input.vectorIndex) {
    throw new TypeError("RuntimeContinuationTransition rejects action vector drift");
  }
}

export function deriveRuntimeContinuationTransitionProjection(
  input: RuntimeContinuationTransitionInput
): RuntimeContinuationTransitionProjection {
  assertProjectionBasis(
    input.basis,
    input.runtimeProjection,
    "RuntimeContinuationTransitionProjection"
  );
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  assertAssuranceScope({
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    assuranceClosureDecision: input.assuranceClosureDecision
  });
  assertTraversalActionScope({
    basis: input.basis,
    vectorIndex: input.vectorIndex,
    traversalContinuationAction: input.traversalContinuationAction
  });

  const typedBlockRefs = uniqueStrings(input.typedBlockRefs ?? Object.freeze([]));
  if (typedBlockRefs.length > 0) {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "block",
      reason: "typed_block",
      reasonRefs: typedBlockRefs
    });
  }

  if (input.assuranceClosureDecision?.decision === "block") {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "block",
      reason: "assurance_block",
      reasonRefs: assuranceRefs(input.assuranceClosureDecision),
      evidenceRefs: [input.assuranceClosureDecision.reason],
      sourceProjectionRefs: [input.assuranceClosureDecision.projectionRef]
    });
  }

  const typedRepriceRefs = uniqueStrings(input.typedRepriceRefs ?? Object.freeze([]));
  if (typedRepriceRefs.length > 0) {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "reprice",
      reason: "typed_reprice",
      reasonRefs: typedRepriceRefs
    });
  }

  if (input.assuranceClosureDecision?.decision === "reprice") {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "reprice",
      reason: "assurance_reprice",
      reasonRefs: assuranceRefs(input.assuranceClosureDecision),
      evidenceRefs: [input.assuranceClosureDecision.reason],
      sourceProjectionRefs: [input.assuranceClosureDecision.projectionRef]
    });
  }

  const action = input.traversalContinuationAction ?? null;
  if (action !== null) {
    switch (action.action) {
      case "inspect_runtime_archive":
        return transition({
          basis: input.basis,
          runtimeProjection: input.runtimeProjection,
          vectorIndex: input.vectorIndex,
          disposition: "inspect_runtime_archive",
          reason: "inspect_runtime_archive",
          reasonRefs: traversalActionRefs(action),
          evidenceRefs: [action.reason, ...action.evidenceRefs],
          sourceProjectionRefs: [action.projectionRef]
        });
      case "retry_exhausted":
        return transition({
          basis: input.basis,
          runtimeProjection: input.runtimeProjection,
          vectorIndex: input.vectorIndex,
          disposition: "block",
          reason: "retry_exhausted",
          reasonRefs: traversalActionRefs(action),
          evidenceRefs: [action.reason, ...action.evidenceRefs],
          sourceProjectionRefs: [action.projectionRef]
        });
      case "blocked":
        return transition({
          basis: input.basis,
          runtimeProjection: input.runtimeProjection,
          vectorIndex: input.vectorIndex,
          disposition: "block",
          reason: "runtime_blocked",
          reasonRefs: traversalActionRefs(action),
          evidenceRefs: [action.reason, ...action.evidenceRefs],
          sourceProjectionRefs: [action.projectionRef]
        });
      case "reprice_runtime_policy":
        return transition({
          basis: input.basis,
          runtimeProjection: input.runtimeProjection,
          vectorIndex: input.vectorIndex,
          disposition: "reprice",
          reason: "runtime_policy_reprice",
          reasonRefs: traversalActionRefs(action),
          evidenceRefs: [action.reason, ...action.evidenceRefs],
          sourceProjectionRefs: [action.projectionRef]
        });
      case "yield_same_edge_continuation":
        return transition({
          basis: input.basis,
          runtimeProjection: input.runtimeProjection,
          vectorIndex: input.vectorIndex,
          disposition: "yield_continuation",
          reason: "traversal_yield",
          reasonRefs: traversalActionRefs(action),
          evidenceRefs: [action.reason, ...action.evidenceRefs],
          sourceProjectionRefs: [action.projectionRef]
        });
      case "retry_same_edge":
        break;
      default: {
        const exhaustive: never = action.action;
        throw new TypeError(
          `Unsupported traversal continuation action ${JSON.stringify(exhaustive)}`
        );
      }
    }
  }

  const typedYieldRefs = uniqueStrings(input.typedYieldRefs ?? Object.freeze([]));
  if (typedYieldRefs.length > 0) {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "yield_continuation",
      reason: "typed_yield",
      reasonRefs: typedYieldRefs
    });
  }

  if (action?.action === "retry_same_edge") {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "retry_same_edge",
      reason: "traversal_retry",
      reasonRefs: traversalActionRefs(action),
      evidenceRefs: [action.reason, ...action.evidenceRefs],
      sourceProjectionRefs: [action.projectionRef]
    });
  }

  if (input.assuranceClosureDecision?.decision === "qualified_defer") {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "yield_continuation",
      reason: "assurance_qualified_defer",
      reasonRefs: assuranceRefs(input.assuranceClosureDecision),
      evidenceRefs: [input.assuranceClosureDecision.reason],
      sourceProjectionRefs: [input.assuranceClosureDecision.projectionRef]
    });
  }

  const typedRetryRefs = uniqueStrings(input.typedRetryRefs ?? Object.freeze([]));
  if (typedRetryRefs.length > 0) {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "retry_same_edge",
      reason: "typed_retry",
      reasonRefs: typedRetryRefs
    });
  }

  if (input.assuranceClosureDecision?.decision === "retry") {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "retry_same_edge",
      reason: "assurance_retry",
      reasonRefs: assuranceRefs(input.assuranceClosureDecision),
      evidenceRefs: [input.assuranceClosureDecision.reason],
      sourceProjectionRefs: [input.assuranceClosureDecision.projectionRef]
    });
  }

  const terminalRetryRefs = uniqueStrings(
    input.terminalRetryRefs ?? Object.freeze([])
  );
  if (terminalRetryRefs.length > 0) {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "retry_same_edge",
      reason: "terminal_retry_fallback",
      reasonRefs: terminalRetryRefs
    });
  }

  if (input.assuranceClosureDecision?.decision === "close") {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "close",
      reason: "assurance_close",
      reasonRefs: assuranceRefs(input.assuranceClosureDecision),
      evidenceRefs: [input.assuranceClosureDecision.reason],
      sourceProjectionRefs: [input.assuranceClosureDecision.projectionRef]
    });
  }

  if (input.edgeCanClose === true) {
    return transition({
      basis: input.basis,
      runtimeProjection: input.runtimeProjection,
      vectorIndex: input.vectorIndex,
      disposition: "close",
      reason: "edge_close"
    });
  }

  return transition({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    vectorIndex: input.vectorIndex,
    disposition: "block",
    reason: "unsupported_state"
  });
}

export function terminalTransitionForRuntimeContinuationProjection(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeContinuationTransitionProjection;
}): TerminalTransition | null {
  if (input.projection.basisId !== input.basis.id) {
    throw new TypeError("TerminalTransition rejects continuation projection basis drift");
  }
  if (input.projection.terminalKind === null) {
    return null;
  }
  assertNonEmptyString(input.projection.reason, "RuntimeContinuationTransition.reason");
  const terminalReasonDetail =
    input.projection.reason === "inspect_runtime_archive"
      ? input.projection.evidenceRefs.find((ref) => !ref.includes("://")) ?? null
      : null;
  return Object.freeze({
    kind: "terminal" as const,
    basis: input.basis,
    terminalKind: input.projection.terminalKind,
    reason:
      `runtime_continuation_transition:${input.projection.disposition}:${input.projection.reason}` +
      (terminalReasonDetail === null ? "" : `:${terminalReasonDetail}`)
  } satisfies TerminalTransition);
}
