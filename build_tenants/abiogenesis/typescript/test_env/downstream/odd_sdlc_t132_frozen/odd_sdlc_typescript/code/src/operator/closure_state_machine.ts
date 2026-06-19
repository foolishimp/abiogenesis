// Implements: REQ-F-ODDSDLC-086
// SDLC policy adapter over an ABG-shaped invariant: ABG owns generic runtime
// transition/replay law; this module owns SDLC's typed continuation mapping.

import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  deriveIterationOutcomeProjection,
  type ExecutionBasis,
  type IterationOutcomeProjection,
  type IterationReason,
  type IterationRedispatchTargetRow,
  type IterationRuntimeRow,
  type IterationSatisfactionRow,
  type RuntimeAggregateProjection
} from "@abiogenesis/typescript-tenant";
import { uniqueSorted } from "../shared/collections.js";
import {
  makeSdlcBlockingReason,
  type SdlcBlockingReason,
  type SdlcBlockingReasonLawfulReentryPoint
} from "../shared/blocking_reason.js";
import {
  deriveSdlcPostflightGapActions,
  sdlcPostflightGapRetryEligible
} from "../postflight/gap_dossier_plan.js";
import type {
  SdlcPostflightGapDossier,
  SdlcPostflightGapReason,
  SdlcRepairSurfaceTriageCarrier,
  SdlcWorkerHandoffManifest
} from "./carriers.js";
import type {
  SdlcEdgeClosureDecision,
  SdlcEdgeClosureDisposition,
  SdlcEdgeClosurePolicy,
  SdlcYieldResumeBasis
} from "./traversal_consequence.js";

export type SdlcClosureStateTransitionExplanation =
  | "closed"
  | "yield_progress"
  | "typed_reprice"
  | "typed_repair"
  | "typed_reenter"
  | "typed_retry"
  | "typed_block_or_triage"
  | "residual_triage"
  | "residual_repair"
  | "edge_assurance_retry"
  | "abg_terminal_retry"
  | "edge_assurance_block"
  | "unsupported_state_block";

export type SdlcClosureStateMachineBucket =
  | "retry"
  | "repair"
  | "re-enter"
  | "reprice"
  | "block";

type SdlcClosureRedispatchDisposition = Extract<
  SdlcEdgeClosureDisposition,
  "retry" | "repair" | "re-enter"
>;

interface SdlcClosureRedispatchCandidate {
  readonly disposition: SdlcClosureRedispatchDisposition;
  readonly explanationCode: SdlcClosureStateTransitionExplanation;
  readonly row: IterationRedispatchTargetRow;
}

export interface SdlcClosureStateTransition {
  readonly kind: "sdlc_closure_state_transition";
  readonly abgIterationOutcomeProjection: IterationOutcomeProjection;
  readonly disposition: SdlcEdgeClosureDisposition;
  readonly closurePolicy: SdlcEdgeClosurePolicy;
  readonly retryReasonRefs: readonly string[];
  readonly repairReasonRefs: readonly string[];
  readonly reenterReasonRefs: readonly string[];
  readonly repriceReasonRefs: readonly string[];
  readonly blockReasonRefs: readonly string[];
  readonly yieldResumeBasis: Omit<SdlcYieldResumeBasis, "kind"> | null;
  readonly evidenceRefs: readonly string[];
  readonly explanationCode: SdlcClosureStateTransitionExplanation;
}

export interface SdlcClosureResidualPressureCarrier {
  readonly kind: "sdlc_closure_residual_pressure";
  readonly pressureRef: string;
  readonly lawfulReentryPoint: SdlcBlockingReasonLawfulReentryPoint;
  readonly reasonClass: SdlcBlockingReason["reasonClass"];
  readonly message: string;
  readonly detail: string;
  readonly evidenceRefs: readonly string[];
  readonly repairSurfaceTriage: SdlcRepairSurfaceTriageCarrier | null;
}

export interface SdlcClosureAbgRuntimeTransitionContext {
  readonly basis: ExecutionBasis;
  readonly runtimeProjection: RuntimeAggregateProjection;
  readonly vectorIndex: number;
}

export function makeSdlcClosureResidualPressureCarrier(input: {
  readonly pressureRef: string;
  readonly lawfulReentryPoint: SdlcBlockingReasonLawfulReentryPoint;
  readonly reasonClass?: SdlcBlockingReason["reasonClass"] | undefined;
  readonly message?: string | undefined;
  readonly detail?: string | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
  readonly repairSurfaceTriage?: SdlcRepairSurfaceTriageCarrier | null | undefined;
}): SdlcClosureResidualPressureCarrier {
  const pressureRef = input.pressureRef.trim();
  if (pressureRef.length === 0) {
    throw new TypeError("sdlc_closure_residual_pressure.pressureRef is required");
  }
  return Object.freeze({
    kind: "sdlc_closure_residual_pressure" as const,
    pressureRef,
    lawfulReentryPoint: input.lawfulReentryPoint,
    reasonClass: input.reasonClass ?? "assurance",
    message:
      input.message ??
      "Closure residual pressure requires typed re-entry routing.",
    detail: input.detail ?? pressureRef,
    evidenceRefs: uniqueSorted([
      pressureRef,
      ...(input.evidenceRefs ?? []),
      ...(input.repairSurfaceTriage?.evidenceRefs ?? [])
    ]),
    repairSurfaceTriage: input.repairSurfaceTriage ?? null
  });
}

export function sdlcClosureStateBucketForLawfulReentryPoint(
  reentryPoint: SdlcBlockingReasonLawfulReentryPoint
): SdlcClosureStateMachineBucket {
  switch (reentryPoint) {
    case "same_edge_retry":
      return "retry";
    case "repair_worker_output":
      return "repair";
    case "escalate_to_fp":
      return "re-enter";
    case "reprice_requirement_or_design":
      return "reprice";
    case "attach_worker":
    case "fix_target_or_run_gaps":
    case "inspect_worker_archive":
    case "operator_blocked":
    case "repair_install":
    case "repair_installed_topology":
    case "repair_project_conformance":
    case "reprice_runtime_policy":
    case "rerun_start":
    case "triage_gap":
      return "block";
  }
}

export function sdlcClosureBlockingReasonRefsForReentry(input: {
  readonly runRef: string;
  readonly scope: string;
  readonly blockingReasonCarriers: readonly SdlcBlockingReason[];
  readonly reentryPoint: SdlcBlockingReasonLawfulReentryPoint;
}): readonly string[] {
  return uniqueSorted(
    input.blockingReasonCarriers.flatMap((reason, index) =>
      reason.lawfulReentryPoint === input.reentryPoint
        ? [
            blockingReasonRef({
              runRef: input.runRef,
              scope: input.scope,
              index,
              reason
            }),
            ...reason.evidenceRefs
          ]
        : []
    )
  );
}

function blockingReasonRef(input: {
  readonly runRef: string;
  readonly scope: string;
  readonly index: number;
  readonly reason: SdlcBlockingReason;
}): string {
  return `blocking-reason://odd-sdlc/${input.runRef}/${input.scope}/${String(input.index)}/${input.reason.code}`;
}

function blockingReasonRefMap(input: {
  readonly runRef: string;
  readonly scope: string;
  readonly blockingReasonCarriers: readonly SdlcBlockingReason[];
}): ReadonlyMap<string, SdlcBlockingReason> {
  return new Map(
    input.blockingReasonCarriers.map((reason, index) => [
      blockingReasonRef({
        runRef: input.runRef,
        scope: input.scope,
        index,
        reason
      }),
      reason
    ])
  );
}

function refsForBucket(input: {
  readonly runRef: string;
  readonly scope: string;
  readonly blockingReasonCarriers: readonly SdlcBlockingReason[];
  readonly bucket: SdlcClosureStateMachineBucket;
}): readonly string[] {
  return uniqueSorted(
    input.blockingReasonCarriers.flatMap((reason, index) =>
      sdlcClosureStateBucketForLawfulReentryPoint(reason.lawfulReentryPoint) ===
      input.bucket
        ? [
            blockingReasonRef({
              runRef: input.runRef,
              scope: input.scope,
              index,
              reason
            }),
            ...reason.evidenceRefs
          ]
        : []
    )
  );
}

function residualPressureCarrierRefsForBucket(input: {
  readonly residualPressureCarriers: readonly SdlcClosureResidualPressureCarrier[];
  readonly bucket: SdlcClosureStateMachineBucket;
}): readonly string[] {
  return uniqueSorted(
    input.residualPressureCarriers.flatMap((carrier) =>
      sdlcClosureStateBucketForLawfulReentryPoint(carrier.lawfulReentryPoint) ===
      input.bucket
        ? carrier.evidenceRefs
        : []
    )
  );
}

function residualPressureCarrierByRef(
  carriers: readonly SdlcClosureResidualPressureCarrier[]
): ReadonlyMap<string, SdlcClosureResidualPressureCarrier> {
  return new Map(carriers.map((carrier) => [carrier.pressureRef, carrier]));
}

function transitionPolicy(
  disposition: SdlcEdgeClosureDisposition
): SdlcEdgeClosurePolicy {
  return Object.freeze({
    kind: "sdlc_edge_closure_policy" as const,
    policyRef: `closure-policy://odd-sdlc/typed-state-machine/${disposition}`,
    dispositionPrecedence:
      disposition === "block"
        ? Object.freeze(["block"] as const)
        : Object.freeze([disposition, "block"] as const)
  });
}

function transition(input: {
  readonly abgIterationOutcomeProjection: IterationOutcomeProjection;
  readonly disposition: SdlcEdgeClosureDisposition;
  readonly explanationCode: SdlcClosureStateTransitionExplanation;
  readonly retryReasonRefs?: readonly string[];
  readonly repairReasonRefs?: readonly string[];
  readonly reenterReasonRefs?: readonly string[];
  readonly repriceReasonRefs?: readonly string[];
  readonly blockReasonRefs?: readonly string[];
  readonly yieldResumeBasis?: Omit<SdlcYieldResumeBasis, "kind"> | null;
}): SdlcClosureStateTransition {
  assertSdlcDispositionAllowedByAbg({
    disposition: input.disposition,
    projection: input.abgIterationOutcomeProjection
  });
  const retryReasonRefs = uniqueSorted(input.retryReasonRefs ?? Object.freeze([]));
  const repairReasonRefs = uniqueSorted(input.repairReasonRefs ?? Object.freeze([]));
  const reenterReasonRefs = uniqueSorted(
    input.reenterReasonRefs ?? Object.freeze([])
  );
  const repriceReasonRefs = uniqueSorted(
    input.repriceReasonRefs ?? Object.freeze([])
  );
  const blockReasonRefs = uniqueSorted(input.blockReasonRefs ?? Object.freeze([]));
  const yieldResumeBasis = input.yieldResumeBasis ?? null;
  return Object.freeze({
    kind: "sdlc_closure_state_transition" as const,
    abgIterationOutcomeProjection: input.abgIterationOutcomeProjection,
    disposition: input.disposition,
    closurePolicy: transitionPolicy(input.disposition),
    retryReasonRefs,
    repairReasonRefs,
    reenterReasonRefs,
    repriceReasonRefs,
    blockReasonRefs,
    yieldResumeBasis,
    evidenceRefs: uniqueSorted([
      input.abgIterationOutcomeProjection.projectionRef,
      input.abgIterationOutcomeProjection.rowProjectionRef,
      ...input.abgIterationOutcomeProjection.evidenceRefs,
      ...retryReasonRefs,
      ...repairReasonRefs,
      ...reenterReasonRefs,
      ...repriceReasonRefs,
      ...blockReasonRefs,
      ...(yieldResumeBasis?.admittedProgressRefs ?? Object.freeze([]))
    ]),
    explanationCode: input.explanationCode
  });
}

function assertSdlcDispositionAllowedByAbg(input: {
  readonly disposition: SdlcEdgeClosureDisposition;
  readonly projection: IterationOutcomeProjection;
}): void {
  const allowedByAbg = sdlcDispositionsAllowedByAbgOutcome(input.projection);
  if (!allowedByAbg.has(input.disposition)) {
    throw new TypeError(
      `SDLC closure transition ${input.disposition} contradicts ABG iteration outcome ${JSON.stringify(input.projection.outcome)}`
    );
  }
}

function sdlcDispositionsAllowedByAbgOutcome(
  projection: IterationOutcomeProjection
): ReadonlySet<SdlcEdgeClosureDisposition> {
  const outcome = projection.outcome;
  if (outcome.kind === "redispatch") {
    return new Set<SdlcEdgeClosureDisposition>(["retry", "repair", "re-enter"]);
  }
  if (outcome.kind === "suspend") {
    return new Set<SdlcEdgeClosureDisposition>(["yield"]);
  }
  if (outcome.disposition === "converged") {
    return new Set<SdlcEdgeClosureDisposition>(["close"]);
  }
  if (outcome.disposition === "deferred") {
    return new Set<SdlcEdgeClosureDisposition>(["yield"]);
  }
  if (outcome.reEntryPoint !== null) {
    return new Set<SdlcEdgeClosureDisposition>(["reprice"]);
  }
  return new Set<SdlcEdgeClosureDisposition>(["block"]);
}

function iterationRuntimeRow(input: {
  readonly boundary: IterationRuntimeRow["boundary"];
  readonly status: IterationRuntimeRow["status"];
  readonly reason: IterationRuntimeRow["reason"];
  readonly retryable: boolean;
  readonly evidenceRefs: readonly string[];
}): IterationRuntimeRow {
  return Object.freeze({
    boundary: input.boundary,
    status: input.status,
    reason: input.reason,
    retryable: input.retryable,
    evidenceRefs: uniqueSorted(input.evidenceRefs),
    sourceProjectionRefs: Object.freeze([])
  });
}

function iterationSatisfactionRow(input: {
  readonly authorityRef: string;
  readonly status?: IterationSatisfactionRow["status"] | undefined;
  readonly reason: IterationReason;
  readonly evidenceRefs: readonly string[];
  readonly reEntryPoint: IterationSatisfactionRow["reEntryPoint"];
}): IterationSatisfactionRow {
  return Object.freeze({
    authorityRef: input.authorityRef,
    status: input.status ?? "unsatisfied",
    reason: input.status === "satisfied" ? null : input.reason,
    lifecycle: "active" as const,
    evidenceRefs: uniqueSorted(input.evidenceRefs),
    sourceProjectionRefs: Object.freeze([]),
    reEntryPoint: input.reEntryPoint
  });
}

function iterationRedispatchCandidate(input: {
  readonly disposition: SdlcClosureRedispatchDisposition;
  readonly explanationCode: SdlcClosureStateTransitionExplanation;
  readonly vectorIndex: number;
  readonly reEntryPoint: IterationRedispatchTargetRow["target"]["reEntryPoint"];
  readonly reason: IterationReason;
  readonly evidenceRefs: readonly string[];
}): SdlcClosureRedispatchCandidate {
  return Object.freeze({
    disposition: input.disposition,
    explanationCode: input.explanationCode,
    row: Object.freeze({
      target: Object.freeze({
        reEntryPoint: input.reEntryPoint,
        targetVectorIndex: input.vectorIndex
      }),
      reason: input.reason,
      retryable: true,
      provenanceChangeClass: "realization_refactor" as const,
      evidenceRefs: uniqueSorted(input.evidenceRefs),
      sourceProjectionRefs: Object.freeze([])
    })
  });
}

function rowsForRuntimeBlockRefs(
  refs: readonly string[]
): readonly IterationRuntimeRow[] {
  return refs.map((ref) =>
    iterationRuntimeRow({
      boundary: "worker",
      status: "failed",
      reason: "runtime_failure",
      retryable: false,
      evidenceRefs: [ref]
    })
  );
}

function rowsForRepriceRefs(
  refs: readonly string[]
): readonly IterationSatisfactionRow[] {
  return refs.map((ref) =>
    iterationSatisfactionRow({
      authorityRef: ref,
      reason: "missing_authority",
      evidenceRefs: [ref],
      reEntryPoint: "requirements"
    })
  );
}

function rowsForEdgeAssuranceCloseRefs(
  refs: readonly string[]
): readonly IterationSatisfactionRow[] {
  return refs.map((ref) =>
    iterationSatisfactionRow({
      authorityRef: ref,
      status: "satisfied",
      reason: "missing_evidence",
      evidenceRefs: [ref],
      reEntryPoint: null
    })
  );
}

function selectedRedispatchCandidate(input: {
  readonly projection: IterationOutcomeProjection;
  readonly candidates: readonly SdlcClosureRedispatchCandidate[];
}): SdlcClosureRedispatchCandidate | null {
  const outcome = input.projection.outcome;
  if (outcome.kind !== "redispatch") {
    return null;
  }
  return (
    input.candidates.find(
      (candidate) =>
        candidate.row.retryable &&
        candidate.row.reason === outcome.reason &&
        candidate.row.target.reEntryPoint === outcome.target.reEntryPoint &&
        candidate.row.target.targetVectorIndex === outcome.target.targetVectorIndex
    ) ??
    (outcome.reason === "terminal_retry_fallback"
      ? iterationRedispatchCandidate({
          disposition: "retry",
          explanationCode: "abg_terminal_retry",
          vectorIndex: outcome.target.targetVectorIndex ?? input.projection.vectorIndex,
          reEntryPoint: outcome.target.reEntryPoint,
          reason: outcome.reason,
          evidenceRefs: input.projection.reasonRefs
        })
      : null)
  );
}

function decodedRef(input: string): string {
  let decoded = input;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) {
        return decoded;
      }
      decoded = next;
    } catch {
      return decoded;
    }
  }
  return decoded;
}

function sdlcClosurePressureRefRequiresTriage(reasonRef: string): boolean {
  const decoded = decodedRef(reasonRef);
  return (
    decoded.includes("triage_gap") ||
    decoded.includes("design_depth_fp_evaluator_process_failed") ||
    decoded.includes("design_depth_fp_evaluator_rule_blocked") ||
    decoded.includes("review_grade_assessment_invalid") ||
    decoded.includes("review_grade_assessment_missing") ||
    decoded.includes("review_grade_evaluator_mutated_input") ||
    decoded.includes("review_grade_evaluator_process_failed") ||
    decoded.includes("review_grade_evaluator_process_timeout")
  );
}

function sdlcClosurePressureRefRequiresRepair(reasonRef: string): boolean {
  const decoded = decodedRef(reasonRef);
  return (
    decoded.includes("component_repair_schedule_repair_required") ||
    decoded.includes("component_repair_schedule_row:") ||
    decoded.includes("test_execution_result_failed")
  );
}

function repairReasonFromClosurePressureRef(reasonRef: string): string {
  const decoded = decodedRef(reasonRef);
  const repairRowPrefix = "component_repair_schedule_row:";
  const repairRowIndex = decoded.lastIndexOf(repairRowPrefix);
  if (repairRowIndex >= 0) {
    return `component_repair_row_open:${decoded.slice(
      repairRowIndex + repairRowPrefix.length
    )}`;
  }
  if (decoded.includes("component_repair_schedule_repair_required")) {
    return "component_repair_schedule_repair_required";
  }
  if (decoded.includes("component_repair_schedule_triage_gap")) {
    return "component_repair_schedule_triage_gap";
  }
  if (decoded.includes("test_execution_result_failed")) {
    return "test_execution_result_failed";
  }
  const componentDepthIndex = decoded.indexOf("/component_depth_register_invalid:");
  if (componentDepthIndex >= 0) {
    return decoded.slice(componentDepthIndex + 1);
  }
  return `edge_closure_residual_pressure:${reasonRef}`;
}

function closurePressureRefLawfulReentryPoint(
  reasonRef: string
): SdlcBlockingReasonLawfulReentryPoint {
  if (sdlcClosurePressureRefRequiresTriage(reasonRef)) {
    return "triage_gap";
  }
  if (sdlcClosurePressureRefRequiresRepair(reasonRef)) {
    return "repair_worker_output";
  }
  return "same_edge_retry";
}

function closurePressureRefMessage(reasonRef: string): string {
  if (sdlcClosurePressureRefRequiresTriage(reasonRef)) {
    return "Edge closure residual pressure requires triage rather than same-edge retry.";
  }
  if (sdlcClosurePressureRefRequiresRepair(reasonRef)) {
    return "Closure residual pressure requires repair re-entry.";
  }
  return "Edge closure residual pressure requires same-edge repair.";
}

export function deriveSdlcClosureStateTransition(input: {
  readonly abgRuntimeTransitionContext: SdlcClosureAbgRuntimeTransitionContext;
  readonly runRef: string;
  readonly blockingReasonCarriers: readonly SdlcBlockingReason[];
  readonly residualPressureRefs: readonly string[];
  readonly residualPressureCarriers?:
    | readonly SdlcClosureResidualPressureCarrier[]
    | undefined;
  readonly abgTerminalRetryRefs: readonly string[];
  readonly structuralBlockReasonRefs: readonly string[];
  readonly postActionBlockReasonRefs: readonly string[];
  readonly yieldResumeBasis: Omit<SdlcYieldResumeBasis, "kind"> | null;
  readonly edgeAssuranceDisposition: SdlcEdgeClosureDisposition | null;
}): SdlcClosureStateTransition {
  const residualPressureCarriers =
    input.residualPressureCarriers ?? Object.freeze([]);
  const fallbackResidualPressureRefs =
    residualPressureCarriers.length === 0
      ? input.residualPressureRefs
      : Object.freeze([]);
  const typedBlockReasonRefs = uniqueSorted([
    ...refsForBucket({
      runRef: input.runRef,
      scope: "state",
      blockingReasonCarriers: input.blockingReasonCarriers,
      bucket: "block"
    }),
    ...input.structuralBlockReasonRefs,
    ...input.postActionBlockReasonRefs
  ]);
  const residualTriageReasonRefs = fallbackResidualPressureRefs.filter(
    sdlcClosurePressureRefRequiresTriage
  );
  const residualTypedBlockReasonRefs = residualPressureCarrierRefsForBucket({
    residualPressureCarriers,
    bucket: "block"
  });
  const blockReasonRefs = uniqueSorted([
    ...typedBlockReasonRefs,
    ...residualTypedBlockReasonRefs,
    ...residualTriageReasonRefs
  ]);
  const repriceReasonRefs = uniqueSorted([
    ...refsForBucket({
      runRef: input.runRef,
      scope: "state",
      blockingReasonCarriers: input.blockingReasonCarriers,
      bucket: "reprice"
    }),
    ...residualPressureCarrierRefsForBucket({
      residualPressureCarriers,
      bucket: "reprice"
    })
  ]);

  const typedRepairReasonRefs = refsForBucket({
    runRef: input.runRef,
    scope: "state",
    blockingReasonCarriers: input.blockingReasonCarriers,
    bucket: "repair"
  });
  const residualRepairReasonRefs = fallbackResidualPressureRefs.filter(
    sdlcClosurePressureRefRequiresRepair
  );
  const repairReasonRefs = uniqueSorted([
    ...typedRepairReasonRefs,
    ...residualPressureCarrierRefsForBucket({
      residualPressureCarriers,
      bucket: "repair"
    }),
    ...residualRepairReasonRefs
  ]);
  const reenterReasonRefs = uniqueSorted([
    ...refsForBucket({
      runRef: input.runRef,
      scope: "state",
      blockingReasonCarriers: input.blockingReasonCarriers,
      bucket: "re-enter"
    }),
    ...residualPressureCarrierRefsForBucket({
      residualPressureCarriers,
      bucket: "re-enter"
    })
  ]);
  const retryReasonRefs = uniqueSorted([
    ...refsForBucket({
      runRef: input.runRef,
      scope: "state",
      blockingReasonCarriers: input.blockingReasonCarriers,
      bucket: "retry"
    }),
    ...residualPressureCarrierRefsForBucket({
      residualPressureCarriers,
      bucket: "retry"
    })
  ]);
  const hasRedispatchReasonRefs =
    repairReasonRefs.length > 0 ||
    reenterReasonRefs.length > 0 ||
    retryReasonRefs.length > 0;
  const edgeAssuranceRef =
    input.edgeAssuranceDisposition === null
      ? []
      : [
          `edge-assurance-disposition://odd-sdlc/${input.runRef}/${input.edgeAssuranceDisposition}`
        ];
  const vectorIndex = input.abgRuntimeTransitionContext.vectorIndex;
  const yieldRefs: readonly string[] =
    input.yieldResumeBasis === null
      ? Object.freeze([])
      : uniqueSorted([
          input.yieldResumeBasis.resumeBasisRef,
          ...input.yieldResumeBasis.admittedProgressRefs
        ]);
  const redispatchCandidates = Object.freeze([
    ...repairReasonRefs.map((ref) =>
      iterationRedispatchCandidate({
        disposition: "repair",
        explanationCode:
          typedRepairReasonRefs.includes(ref) ? "typed_repair" : "residual_repair",
        vectorIndex,
        reEntryPoint: "realization",
        reason: "missing_evidence",
        evidenceRefs: [ref]
      })
    ),
    ...reenterReasonRefs.map((ref) =>
      iterationRedispatchCandidate({
        disposition: "re-enter",
        explanationCode: "typed_reenter",
        vectorIndex,
        reEntryPoint: "proof",
        reason: "evaluator_failure",
        evidenceRefs: [ref]
      })
    ),
    ...retryReasonRefs.map((ref) =>
      iterationRedispatchCandidate({
        disposition: "retry",
        explanationCode: "typed_retry",
        vectorIndex,
        reEntryPoint: "realization",
        reason: "missing_evidence",
        evidenceRefs: [ref]
      })
    ),
    ...(input.edgeAssuranceDisposition === "retry"
      ? edgeAssuranceRef.map((ref) =>
          iterationRedispatchCandidate({
            disposition: "retry",
            explanationCode: "edge_assurance_retry",
            vectorIndex,
            reEntryPoint: "realization",
            reason: "missing_evidence",
            evidenceRefs: [ref]
          })
        )
      : [])
  ]);
  const abgIterationOutcomeProjection = deriveIterationOutcomeProjection({
    basis: input.abgRuntimeTransitionContext.basis,
    runtimeProjection: input.abgRuntimeTransitionContext.runtimeProjection,
    vectorIndex,
    satisfactionRows: Object.freeze([
      ...rowsForRepriceRefs(repriceReasonRefs),
      ...(input.edgeAssuranceDisposition === "close"
        ? rowsForEdgeAssuranceCloseRefs(edgeAssuranceRef)
        : [])
    ]),
    runtimeRows: Object.freeze([
      ...rowsForRuntimeBlockRefs(blockReasonRefs),
      ...(input.edgeAssuranceDisposition === "block" && !hasRedispatchReasonRefs
        ? rowsForRuntimeBlockRefs(edgeAssuranceRef)
        : []),
      ...yieldRefs.map((ref) =>
        iterationRuntimeRow({
          boundary: "worker",
          status: "handoff",
          reason: null,
          retryable: false,
          evidenceRefs: [ref]
        })
      )
    ]),
    redispatchTargetRows: redispatchCandidates.map((candidate) => candidate.row),
    terminalFallbackRefs: input.abgTerminalRetryRefs
  });
  const outcome = abgIterationOutcomeProjection.outcome;

  if (outcome.kind === "redispatch") {
    const selected = selectedRedispatchCandidate({
      projection: abgIterationOutcomeProjection,
      candidates: redispatchCandidates
    });
    if (selected === null) {
      throw new TypeError(
        `SDLC closure state transition cannot adapt ABG redispatch outcome ${JSON.stringify(outcome)}`
      );
    }
    return transition({
      abgIterationOutcomeProjection,
      disposition: selected.disposition,
      explanationCode: selected.explanationCode,
      retryReasonRefs: uniqueSorted([
        ...retryReasonRefs,
        ...(input.edgeAssuranceDisposition === "retry" ? edgeAssuranceRef : []),
        ...(selected.explanationCode === "abg_terminal_retry"
          ? input.abgTerminalRetryRefs
          : [])
      ]),
      repairReasonRefs,
      reenterReasonRefs,
      repriceReasonRefs
    });
  }

  if (outcome.kind === "suspend" || outcome.disposition === "deferred") {
    return transition({
      abgIterationOutcomeProjection,
      disposition: "yield",
      explanationCode: "yield_progress",
      retryReasonRefs,
      repairReasonRefs,
      reenterReasonRefs,
      repriceReasonRefs,
      blockReasonRefs,
      yieldResumeBasis: input.yieldResumeBasis
    });
  }

  if (outcome.disposition === "converged") {
    return transition({
      abgIterationOutcomeProjection,
      disposition: "close",
      explanationCode: "closed"
    });
  }

  if (outcome.reEntryPoint !== null) {
    return transition({
      abgIterationOutcomeProjection,
      disposition: "reprice",
      explanationCode: "typed_reprice",
      retryReasonRefs,
      repairReasonRefs,
      reenterReasonRefs,
      repriceReasonRefs: uniqueSorted([
        ...repriceReasonRefs,
        ...(input.edgeAssuranceDisposition === "reprice" ? edgeAssuranceRef : [])
      ])
    });
  }

  return transition({
    abgIterationOutcomeProjection,
    disposition: "block",
    explanationCode:
      typedBlockReasonRefs.length > 0
        ? "typed_block_or_triage"
        : residualTriageReasonRefs.length > 0
          ? "residual_triage"
          : input.edgeAssuranceDisposition === "block"
            ? "edge_assurance_block"
            : "unsupported_state_block",
    retryReasonRefs,
    repairReasonRefs,
    reenterReasonRefs,
    repriceReasonRefs,
    blockReasonRefs: uniqueSorted([
      ...blockReasonRefs,
      ...(input.edgeAssuranceDisposition === "block" ? edgeAssuranceRef : []),
      ...(blockReasonRefs.length === 0 && input.edgeAssuranceDisposition !== "block"
        ? fallbackResidualPressureRefs
        : [])
    ])
  });
}

export function syntheticGapDossierFromClosureRefs(input: {
  readonly manifest: Pick<
    SdlcWorkerHandoffManifest,
    "archiveRoot" | "edgeName" | "graphFunctionName" | "targetAssetType" | "vectorIndex"
  >;
  readonly decisionRef: string;
  readonly reasonRefs: readonly string[];
  readonly sourceProjectionRef: string;
  readonly residualPressureCarriers?:
    | readonly SdlcClosureResidualPressureCarrier[]
    | undefined;
  readonly blockingReasonCarriers?: readonly SdlcBlockingReason[];
  readonly runRef?: string;
  readonly scope?: string;
}): SdlcPostflightGapDossier | null {
  if (input.reasonRefs.length === 0) {
    return null;
  }
  if (
    input.manifest.archiveRoot.length === 0 ||
    input.manifest.edgeName.length === 0 ||
    input.manifest.graphFunctionName.length === 0 ||
    input.manifest.targetAssetType.length === 0
  ) {
    return null;
  }
  const currentGapDossierRef = `closure-gap-dossier://odd-sdlc/${encodeURIComponent(
    input.decisionRef
  )}`;
  const carrierRefMap =
    input.blockingReasonCarriers !== undefined &&
    input.runRef !== undefined &&
    input.scope !== undefined
      ? blockingReasonRefMap({
          runRef: input.runRef,
          scope: input.scope,
          blockingReasonCarriers: input.blockingReasonCarriers
        })
      : new Map<string, SdlcBlockingReason>();
  const residualCarrierRefMap = residualPressureCarrierByRef(
    input.residualPressureCarriers ?? Object.freeze([])
  );
  const carrierReasons = input.reasonRefs.flatMap((reasonRef) => {
    const carrier = carrierRefMap.get(reasonRef);
    if (carrier === undefined) {
      return [];
    }
    return [
      Object.freeze({
        kind: "sdlc_postflight_gap_reason" as const,
        reason: carrier.detail ?? carrier.code,
        reasonClass: carrier.reasonClass,
        blockingReason: carrier
      })
    ];
  });
  const residualCarrierReasons = input.reasonRefs.flatMap((reasonRef) => {
    const carrier = residualCarrierRefMap.get(reasonRef);
    if (carrier === undefined) {
      return [];
    }
    return [
      Object.freeze({
        kind: "sdlc_postflight_gap_reason" as const,
        reason: carrier.detail,
        reasonClass: carrier.reasonClass,
        blockingReason: makeSdlcBlockingReason({
          code: "edge_closure_residual_pressure",
          reasonClass: carrier.reasonClass,
          lawfulReentryPoint: carrier.lawfulReentryPoint,
          message: carrier.message,
          detail: carrier.detail,
          evidenceRefs: uniqueSorted([
            input.decisionRef,
            input.sourceProjectionRef,
            ...carrier.evidenceRefs
          ])
        })
      })
    ];
  });
  const fallbackReasonRefs =
    carrierRefMap.size === 0 && residualCarrierRefMap.size === 0
      ? input.reasonRefs
      : input.reasonRefs.filter(
          (reasonRef) =>
            !carrierRefMap.has(reasonRef) &&
            !residualCarrierRefMap.has(reasonRef) &&
            (sdlcClosurePressureRefRequiresTriage(reasonRef) ||
              sdlcClosurePressureRefRequiresRepair(reasonRef))
        );
  const fallbackReasons = fallbackReasonRefs.map(
    (reasonRef): SdlcPostflightGapReason => {
      const lawfulReentryPoint = closurePressureRefLawfulReentryPoint(reasonRef);
      return Object.freeze({
        kind: "sdlc_postflight_gap_reason" as const,
        reason: repairReasonFromClosurePressureRef(reasonRef),
        reasonClass: "assurance" as const,
        blockingReason: makeSdlcBlockingReason({
          code: "edge_closure_residual_pressure",
          reasonClass: "assurance",
          lawfulReentryPoint,
          message: closurePressureRefMessage(reasonRef),
          detail: reasonRef,
          evidenceRefs: [input.decisionRef, input.sourceProjectionRef, reasonRef]
        })
      });
    }
  );
  const reasons = Object.freeze([
    ...carrierReasons,
    ...residualCarrierReasons,
    ...fallbackReasons
  ]);
  const blockingReasons = reasons.map((reason) => reason.blockingReason);
  const retryEligible = sdlcPostflightGapRetryEligible(blockingReasons);
  return Object.freeze({
    kind: "sdlc_postflight_gap_dossier" as const,
    status: "open" as const,
    graphFunctionName: input.manifest.graphFunctionName,
    edgeName: input.manifest.edgeName,
    vectorIndex: input.manifest.vectorIndex,
    targetAssetType: input.manifest.targetAssetType,
    reasons: Object.freeze(reasons),
    evidenceRefs: uniqueSorted([
      input.decisionRef,
      input.sourceProjectionRef,
      ...input.reasonRefs
    ]),
    priorManifestId: pathToFileURL(
      join(input.manifest.archiveRoot, "handoff_manifest.json")
    ).href,
    currentGapDossierRef,
    retryEligible,
    nextLawfulActions: deriveSdlcPostflightGapActions(blockingReasons)
  });
}

export function syntheticGapDossiersFromClosureDecision(input: {
  readonly manifest: SdlcWorkerHandoffManifest | null;
  readonly edgeClosureDecision: SdlcEdgeClosureDecision | null;
  readonly sourceProjectionRef: string;
}): readonly SdlcPostflightGapDossier[] {
  if (
    input.manifest === null ||
    input.edgeClosureDecision === null ||
    input.edgeClosureDecision.disposition === "close"
  ) {
    return Object.freeze([]);
  }
  const dossier = syntheticGapDossierFromClosureRefs({
    manifest: input.manifest,
    decisionRef: input.edgeClosureDecision.decisionRef,
    reasonRefs: input.edgeClosureDecision.reasonRefs,
    sourceProjectionRef: input.sourceProjectionRef
  });
  return dossier === null ? Object.freeze([]) : Object.freeze([dossier]);
}
