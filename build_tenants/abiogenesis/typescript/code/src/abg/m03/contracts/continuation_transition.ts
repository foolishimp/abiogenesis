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
import {
  deriveIterationOutcomeProjection,
  type IterationOutcomeProjection,
  type IterationRedispatchTargetRow,
  type IterationRuntimeRow,
  type IterationSatisfactionRow
} from "./iteration_state_action.js";

export const RUNTIME_CONTINUATION_TRANSITION_DISPOSITION_VALUES = Object.freeze([
  "advance_vector",
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
  "default_iteration_advance",
  "graph_reentry",
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
    case "advance_vector":
      return null;
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
  return (
    disposition !== "advance_vector" &&
    disposition !== "retry_same_edge" &&
    disposition !== "yield_continuation"
  );
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

export function deriveRuntimeContinuationTransitionProjectionFromDisposition(input: {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
  readonly disposition: RuntimeContinuationTransitionDisposition;
  readonly reason: RuntimeContinuationTransitionReason;
  readonly reasonRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
}): RuntimeContinuationTransitionProjection {
  assertProjectionBasis(
    input.basis,
    input.runtimeProjection,
    "RuntimeContinuationTransitionProjection"
  );
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  return transition(input);
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

function satisfactionRow(input: {
  readonly authorityRef: string;
  readonly status: IterationSatisfactionRow["status"];
  readonly reason: IterationSatisfactionRow["reason"];
  readonly evidenceRefs: readonly string[];
  readonly sourceProjectionRefs?: readonly string[] | undefined;
  readonly reEntryPoint?: IterationSatisfactionRow["reEntryPoint"] | undefined;
}): IterationSatisfactionRow {
  return Object.freeze({
    authorityRef: input.authorityRef,
    status: input.status,
    reason: input.reason,
    lifecycle: "active" as const,
    evidenceRefs: uniqueStrings(input.evidenceRefs),
    sourceProjectionRefs: uniqueStrings(input.sourceProjectionRefs ?? Object.freeze([])),
    reEntryPoint: input.reEntryPoint ?? null
  });
}

function runtimeRow(input: {
  readonly boundary: IterationRuntimeRow["boundary"];
  readonly status: IterationRuntimeRow["status"];
  readonly reason: IterationRuntimeRow["reason"];
  readonly retryable: boolean;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
}): IterationRuntimeRow {
  return Object.freeze({
    boundary: input.boundary,
    status: input.status,
    reason: input.reason,
    retryable: input.retryable,
    evidenceRefs: uniqueStrings(input.evidenceRefs ?? Object.freeze([])),
    sourceProjectionRefs: uniqueStrings(input.sourceProjectionRefs ?? Object.freeze([]))
  });
}

function redispatchTargetRow(input: {
  readonly vectorIndex: number;
  readonly reason: IterationRedispatchTargetRow["reason"];
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly sourceProjectionRefs?: readonly string[] | undefined;
}): IterationRedispatchTargetRow {
  return Object.freeze({
    target: Object.freeze({
      reEntryPoint: "realization" as const,
      targetVectorIndex: input.vectorIndex
    }),
    reason: input.reason,
    retryable: true,
    provenanceChangeClass: "realization_refactor" as const,
    evidenceRefs: uniqueStrings(input.evidenceRefs ?? Object.freeze([])),
    sourceProjectionRefs: uniqueStrings(input.sourceProjectionRefs ?? Object.freeze([]))
  });
}

function rowsForAssuranceDecision(
  decision: AssuranceClosureDecision | null | undefined
): readonly IterationSatisfactionRow[] {
  if (decision === undefined || decision === null) {
    return Object.freeze([]);
  }
  const refs = assuranceRefs(decision);
  switch (decision.decision) {
    case "block":
      return Object.freeze([
        satisfactionRow({
          authorityRef: decision.projectionRef,
          status: "unsatisfied",
          reason: "unsupported_state",
          evidenceRefs: [decision.reason, ...refs],
          sourceProjectionRefs: [decision.projectionRef]
        })
      ]);
    case "reprice":
      return Object.freeze([
        satisfactionRow({
          authorityRef: decision.projectionRef,
          status: "unsatisfied",
          reason: "missing_authority",
          evidenceRefs: [decision.reason, ...refs],
          sourceProjectionRefs: [decision.projectionRef],
          reEntryPoint: "requirements"
        })
      ]);
    case "qualified_defer":
      return Object.freeze([
        satisfactionRow({
          authorityRef: decision.projectionRef,
          status: "deferred",
          reason: null,
          evidenceRefs: [decision.reason, ...refs],
          sourceProjectionRefs: [decision.projectionRef]
        })
      ]);
    case "retry":
      return Object.freeze([
        satisfactionRow({
          authorityRef: decision.projectionRef,
          status: "unsatisfied",
          reason: "missing_evidence",
          evidenceRefs: [decision.reason, ...refs],
          sourceProjectionRefs: [decision.projectionRef]
        })
      ]);
    case "close":
      return Object.freeze([
        satisfactionRow({
          authorityRef: decision.projectionRef,
          status: "satisfied",
          reason: null,
          evidenceRefs: [decision.reason, ...refs],
          sourceProjectionRefs: [decision.projectionRef]
        })
      ]);
    default: {
      const exhaustive: never = decision.decision;
      throw new TypeError(
        `Unsupported assurance closure decision ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function rowsForTraversalAction(input: {
  readonly vectorIndex: number;
  readonly action: TraversalContinuationActionProjection | null | undefined;
}): {
  readonly runtimeRows: readonly IterationRuntimeRow[];
  readonly redispatchTargetRows: readonly IterationRedispatchTargetRow[];
} {
  const action = input.action;
  if (action === undefined || action === null) {
    return Object.freeze({
      runtimeRows: Object.freeze([]),
      redispatchTargetRows: Object.freeze([])
    });
  }
  const refs = traversalActionRefs(action);
  switch (action.action) {
    case "inspect_runtime_archive":
      return Object.freeze({
        runtimeRows: Object.freeze([
          runtimeRow({
            boundary: "worker",
            status: "failed",
            reason: "runtime_failure",
            retryable: false,
            evidenceRefs: [action.reason, ...action.evidenceRefs, ...refs],
            sourceProjectionRefs: [action.projectionRef]
          })
        ]),
        redispatchTargetRows: Object.freeze([])
      });
    case "retry_exhausted":
      return Object.freeze({
        runtimeRows: Object.freeze([
          runtimeRow({
            boundary: "worker",
            status: "failed",
            reason: "retry_exhausted",
            retryable: false,
            evidenceRefs: [action.reason, ...action.evidenceRefs, ...refs],
            sourceProjectionRefs: [action.projectionRef]
          })
        ]),
        redispatchTargetRows: Object.freeze([])
      });
    case "blocked":
      return Object.freeze({
        runtimeRows: Object.freeze([
          runtimeRow({
            boundary: "worker",
            status: "failed",
            reason: "runtime_failure",
            retryable: false,
            evidenceRefs: [action.reason, ...action.evidenceRefs, ...refs],
            sourceProjectionRefs: [action.projectionRef]
          })
        ]),
        redispatchTargetRows: Object.freeze([])
      });
    case "reprice_runtime_policy":
      return Object.freeze({
        runtimeRows: Object.freeze([]),
        redispatchTargetRows: Object.freeze([])
      });
    case "yield_same_edge_continuation":
      return Object.freeze({
        runtimeRows: Object.freeze([
          runtimeRow({
            boundary: "worker",
            status: "handoff",
            reason: null,
            retryable: false,
            evidenceRefs: [action.reason, ...action.evidenceRefs, ...refs],
            sourceProjectionRefs: [action.projectionRef]
          })
        ]),
        redispatchTargetRows: Object.freeze([])
      });
    case "retry_same_edge":
      return Object.freeze({
        runtimeRows: Object.freeze([]),
        redispatchTargetRows: Object.freeze([
          redispatchTargetRow({
            vectorIndex: input.vectorIndex,
            reason: "missing_evidence",
            evidenceRefs: [action.reason, ...action.evidenceRefs, ...refs],
            sourceProjectionRefs: [action.projectionRef]
          })
        ])
      });
    default: {
      const exhaustive: never = action.action;
      throw new TypeError(
        `Unsupported traversal continuation action ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function continuationRows(input: RuntimeContinuationTransitionInput): {
  readonly satisfactionRows: readonly IterationSatisfactionRow[];
  readonly runtimeRows: readonly IterationRuntimeRow[];
  readonly redispatchTargetRows: readonly IterationRedispatchTargetRow[];
} {
  const typedBlockRefs = uniqueStrings(input.typedBlockRefs ?? Object.freeze([]));
  const typedRepriceRefs = uniqueStrings(input.typedRepriceRefs ?? Object.freeze([]));
  const typedYieldRefs = uniqueStrings(input.typedYieldRefs ?? Object.freeze([]));
  const typedRetryRefs = uniqueStrings(input.typedRetryRefs ?? Object.freeze([]));
  const actionRows = rowsForTraversalAction({
    vectorIndex: input.vectorIndex,
    action: input.traversalContinuationAction
  });
  const action = input.traversalContinuationAction ?? null;
  const repricePolicyRows =
    action?.action === "reprice_runtime_policy"
      ? [
          satisfactionRow({
            authorityRef: action.projectionRef,
            status: "unsatisfied",
            reason: "missing_authority",
            evidenceRefs: [action.reason, ...action.evidenceRefs],
            sourceProjectionRefs: [action.projectionRef],
            reEntryPoint: "requirements"
          })
        ]
      : [];

  return Object.freeze({
    satisfactionRows: Object.freeze([
      ...rowsForAssuranceDecision(input.assuranceClosureDecision),
      ...typedRepriceRefs.map((ref) =>
        satisfactionRow({
          authorityRef: ref,
          status: "unsatisfied",
          reason: "missing_authority",
          evidenceRefs: [ref],
          reEntryPoint: "requirements"
        })
      ),
      ...repricePolicyRows
    ]),
    runtimeRows: Object.freeze([
      ...typedBlockRefs.map((ref) =>
        runtimeRow({
          boundary: "worker",
          status: "failed",
          reason: "runtime_failure",
          retryable: false,
          evidenceRefs: [ref]
        })
      ),
      ...typedYieldRefs.map((ref) =>
        runtimeRow({
          boundary: "worker",
          status: "handoff",
          reason: null,
          retryable: false,
          evidenceRefs: [ref]
        })
      ),
      ...actionRows.runtimeRows
    ]),
    redispatchTargetRows: Object.freeze([
      ...typedRetryRefs.map((ref) =>
        redispatchTargetRow({
          vectorIndex: input.vectorIndex,
          reason: "missing_evidence",
          evidenceRefs: [ref]
        })
      ),
      ...actionRows.redispatchTargetRows
    ])
  });
}

function transitionForIterationOutcome(input: {
  readonly continuationInput: RuntimeContinuationTransitionInput;
  readonly outcomeProjection: IterationOutcomeProjection;
}): RuntimeContinuationTransitionProjection {
  const continuationInput = input.continuationInput;
  const outcome = input.outcomeProjection.outcome;
  const action = continuationInput.traversalContinuationAction ?? null;
  const common = {
    basis: continuationInput.basis,
    runtimeProjection: continuationInput.runtimeProjection,
    vectorIndex: continuationInput.vectorIndex,
    reasonRefs: input.outcomeProjection.reasonRefs,
    evidenceRefs: input.outcomeProjection.evidenceRefs,
    sourceProjectionRefs: input.outcomeProjection.sourceProjectionRefs
  };

  if (outcome.kind === "redispatch") {
    const terminalRetryRefs = uniqueStrings(
      continuationInput.terminalRetryRefs ?? Object.freeze([])
    );
    const typedRetryRefs = uniqueStrings(
      continuationInput.typedRetryRefs ?? Object.freeze([])
    );
    return transition({
      ...common,
      disposition: "retry_same_edge",
      reason:
        outcome.reason === "terminal_retry_fallback" && terminalRetryRefs.length > 0
          ? "terminal_retry_fallback"
          : action?.action === "retry_same_edge"
            ? "traversal_retry"
            : typedRetryRefs.length > 0
              ? "typed_retry"
              : continuationInput.assuranceClosureDecision?.decision === "retry"
                ? "assurance_retry"
                : "typed_retry"
    });
  }

  if (outcome.kind === "suspend") {
    const typedYieldRefs = uniqueStrings(
      continuationInput.typedYieldRefs ?? Object.freeze([])
    );
    return transition({
      ...common,
      disposition: "yield_continuation",
      reason:
        typedYieldRefs.length > 0
          ? "typed_yield"
          : action?.action === "yield_same_edge_continuation"
            ? "traversal_yield"
            : "typed_yield"
    });
  }

  if (outcome.disposition === "converged") {
    return transition({
      ...common,
      disposition: "close",
      reason:
        continuationInput.assuranceClosureDecision?.decision === "close"
          ? "assurance_close"
          : "edge_close"
    });
  }

  if (outcome.disposition === "deferred") {
    return transition({
      ...common,
      disposition: "yield_continuation",
      reason: "assurance_qualified_defer"
    });
  }

  if (outcome.reEntryPoint !== null) {
    const typedRepriceRefs = uniqueStrings(
      continuationInput.typedRepriceRefs ?? Object.freeze([])
    );
    return transition({
      ...common,
      disposition: "reprice",
      reason:
        typedRepriceRefs.length > 0
          ? "typed_reprice"
          : action?.action === "reprice_runtime_policy"
            ? "runtime_policy_reprice"
            : "assurance_reprice"
    });
  }

  if (action?.action === "inspect_runtime_archive") {
    return transition({
      ...common,
      disposition: "inspect_runtime_archive",
      reason: "inspect_runtime_archive"
    });
  }

  const typedBlockRefs = uniqueStrings(
    continuationInput.typedBlockRefs ?? Object.freeze([])
  );
  return transition({
    ...common,
    disposition: "block",
    reason:
      typedBlockRefs.length > 0
        ? "typed_block"
        : continuationInput.assuranceClosureDecision?.decision === "block"
          ? "assurance_block"
          : action?.action === "retry_exhausted"
            ? "retry_exhausted"
            : action?.action === "blocked"
              ? "runtime_blocked"
              : "unsupported_state"
  });
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

  const rows = continuationRows(input);
  const outcomeProjection = deriveIterationOutcomeProjection({
    basis: input.basis,
    runtimeProjection: input.runtimeProjection,
    vectorIndex: input.vectorIndex,
    satisfactionRows: rows.satisfactionRows,
    runtimeRows: rows.runtimeRows,
    redispatchTargetRows: rows.redispatchTargetRows,
    terminalFallbackRefs: input.terminalRetryRefs
  });
  return transitionForIterationOutcome({
    continuationInput: input,
    outcomeProjection
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
