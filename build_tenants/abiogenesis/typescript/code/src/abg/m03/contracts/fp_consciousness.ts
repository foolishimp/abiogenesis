// Implements: T-127
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS
// Implements: REQ-R-ABG3-PROJECTION

import { createHash } from "node:crypto";
import type {
  ConstructionDeltaObservedEvent,
  ConstructionGraphActionInvokedEvent,
  ExecutionBasis,
  RuntimeAggregateProjection,
  RuntimeEvent
} from "./carriers.js";
import type {
  GraphFunction,
  GraphVector,
  SerializedAttrs,
  SerializedAttrValue,
  SerializedJsonValue
} from "../../../gtl/m01/contracts/carriers.js";
import type {
  Job,
  Module,
  Role
} from "../../../gtl/m02/contracts/carriers.js";
import { assertRuntimeEvent } from "./event_admission.js";
import {
  CONSTRUCTION_PROGRESS_DERIVED_FLUENT_RULE,
  deriveRuntimeEventCalculusProjection,
  type RuntimeEventCalculusProjection
} from "./event_calculus.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger,
  freezeStringArray
} from "./runtime_support.js";

export const CONSTRUCTION_HOOK_KEY = "abg.fp_consciousness";

export const CONSTRUCTION_PRESSURE_KIND_VALUES = Object.freeze([
  "open_obligation",
  "admitted_error",
  "gap_row",
  "retry_frontier",
  "reentry_frontier",
  "workspace_delta",
  "temporal_pressure",
  "fh_feedback",
  "affect_signal"
] as const);

export type ConstructionPressureKind =
  (typeof CONSTRUCTION_PRESSURE_KIND_VALUES)[number];

export const CONSTRUCTION_AMBIGUITY_CLASS_VALUES = Object.freeze([
  "none",
  "source_undisambiguated",
  "authority_missing",
  "contradictory_authority",
  "semantic_identity_ambiguous",
  "requires_fp_judgment"
] as const);

export type ConstructionAmbiguityClass =
  (typeof CONSTRUCTION_AMBIGUITY_CLASS_VALUES)[number];

export const CONSTRUCTION_ACTION_KIND_VALUES = Object.freeze([
  "invoke_graph_function",
  "continue_graph_call",
  "repair_same_edge",
  "reenter_graph_span",
  "invoke_prior_vector",
  "invoke_later_vector",
  "open_fh_gate",
  "create_ticket",
  "propose_reprice",
  "yield_progress",
  "close_episode",
  "block_episode"
] as const);

export type ConstructionActionKind =
  (typeof CONSTRUCTION_ACTION_KIND_VALUES)[number];

export const CONSTRUCTIVE_CONSTRUCTION_ACTION_KIND_VALUES = Object.freeze([
  "invoke_graph_function",
  "continue_graph_call",
  "repair_same_edge",
  "reenter_graph_span",
  "invoke_prior_vector",
  "invoke_later_vector"
] as const);

export type ConstructiveConstructionActionKind =
  (typeof CONSTRUCTIVE_CONSTRUCTION_ACTION_KIND_VALUES)[number];

export const CONSTRUCTION_PRIORITY_AXIS_VALUES = Object.freeze([
  "steel_thread",
  "full_breadth",
  "gap_repair",
  "danger_first",
  "operator_requested",
  "release_blocking",
  "deadline_sensitive",
  "workspace_risk",
  "highest_expected_delta",
  "lowest_missing_binding",
  "least_recently_attempted"
] as const);

export type ConstructionPriorityAxis =
  (typeof CONSTRUCTION_PRIORITY_AXIS_VALUES)[number];

export const CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES = Object.freeze([
  "concern",
  "urgency",
  "danger",
  "fear",
  "operator_distress",
  "risk",
  "confidence"
] as const);

export type ConstructionAffectSignalKind =
  (typeof CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES)[number];

export const AFFECT_PRIORITY_ADJUSTMENT_VALUES = Object.freeze([
  "boost",
  "attenuate",
  "force_review",
  "request_fh_input",
  "escalate"
] as const);

export type AffectPriorityAdjustmentKind =
  (typeof AFFECT_PRIORITY_ADJUSTMENT_VALUES)[number];

export const CONSTRUCTION_TERMINAL_DISPOSITION_VALUES = Object.freeze([
  "none",
  "force_review",
  "request_fh_input",
  "escalate"
] as const);

export type ConstructionTerminalDisposition =
  (typeof CONSTRUCTION_TERMINAL_DISPOSITION_VALUES)[number];

export const CONSTRUCTION_PROJECTION_STATE_VALUES = Object.freeze([
  "construction_closed",
  "construction_progressing_yield",
  "construction_blocked",
  "construction_stalled",
  "construction_review_required",
  "construction_escalated",
  "fh_input_required",
  "ticket_created",
  "reprice_required"
] as const);

export type ConstructionProjectionState =
  (typeof CONSTRUCTION_PROJECTION_STATE_VALUES)[number];

export const CONSTRUCTION_PROGRESS_KIND_VALUES = Object.freeze([
  "new_artifact_digest",
  "new_admitted_progress_row",
  "narrowed_blocker",
  "fulfilled_obligation",
  "accepted_fh_decision",
  "lawful_reentry_moved",
  "closed",
  "no_material_progress"
] as const);

export type ConstructionProgressKind =
  (typeof CONSTRUCTION_PROGRESS_KIND_VALUES)[number];

export type ConstructionRuntimeEvent = Extract<
  RuntimeEvent,
  {
    readonly constructionEventRef: string;
    readonly episodeId: string;
    readonly iterationOrdinal: number;
    readonly eventSequence: number;
  }
>;

export const CONSTRUCTION_INTENT_ADMISSION_DECISION_VALUES = Object.freeze([
  "admitted",
  "rejected"
] as const);

export type ConstructionIntentAdmissionDecision =
  (typeof CONSTRUCTION_INTENT_ADMISSION_DECISION_VALUES)[number];

export const CONSTRUCTION_HOOK_SOURCE_VALUES = Object.freeze([
  "graph_vector",
  "graph_function",
  "job_policy",
  "role_policy",
  "module_policy",
  "installed_fallback"
] as const);

export type ConstructionHookSource =
  (typeof CONSTRUCTION_HOOK_SOURCE_VALUES)[number];

export interface ConstructionObservationSnapshot {
  readonly kind: "construction_observation_snapshot";
  readonly episodeId: string;
  readonly observationId: string;
  readonly basisRef: string;
  readonly currentProjectionRef: string;
  readonly iterationOrdinal: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly runtimeAggregateRefs: readonly string[];
  readonly linkedAssetRefs: readonly string[];
  readonly passedInputRefs: readonly string[];
  readonly gapProjectionRefs: readonly string[];
  readonly foldbackRefs: readonly string[];
  readonly retryFrontierRefs: readonly string[];
  readonly reentryFrontierRefs: readonly string[];
  readonly assuranceRefs: readonly string[];
  readonly fhInputRefs: readonly string[];
  readonly priorIntentRefs: readonly string[];
  readonly priorProgressRefs: readonly string[];
  readonly actionCatalogRef: string;
  readonly authorityDigest: string;
  readonly pressureRows: readonly ObservationPressureRow[];
}

export interface ConstructionObservationAssetRefs {
  readonly linkedAssetRefs: readonly string[];
  readonly passedInputRefs: readonly string[];
}

export interface ObservationPressureRow {
  readonly kind: "observation_pressure_row";
  readonly pressureRef: string;
  readonly pressureKind: ConstructionPressureKind;
  readonly sourceRef: string;
  readonly affectedAssetRefs: readonly string[];
  readonly targetOutcomeRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly severity: number;
  readonly ambiguityClass: ConstructionAmbiguityClass;
  readonly authorityRefs: readonly string[];
  readonly affectSignalKind: ConstructionAffectSignalKind | null;
}

export interface ConstructionActionCatalogProjection {
  readonly kind: "construction_action_catalog_projection";
  readonly catalogRef: string;
  readonly episodeId: string;
  readonly hookResolutionRef: string;
  readonly fallbackConfigDigest: string;
  readonly rows: readonly ConstructionActionRow[];
}

export interface ConstructionActionRow {
  readonly kind: "construction_action_row";
  readonly actionRef: string;
  readonly actionKind: ConstructionActionKind;
  readonly graphFunctionRef: string | null;
  readonly graphVectorRef: string | null;
  readonly refinementBoundaryRef: string | null;
  readonly candidateFamilyRef: string | null;
  readonly publishedTraversalTargetRef: string | null;
  readonly targetOutcomeRef: string;
  readonly inputAssetRefs: readonly string[];
  readonly expectedOutputAssetRefs: readonly string[];
  readonly requiredAuthorityRefs: readonly string[];
  readonly eligibleReasonRefs: readonly string[];
  readonly ineligibleReasonRefs: readonly string[];
  readonly hookSourceRefs: readonly string[];
  readonly defaultPolicyRefs: readonly string[];
}

export interface ObservationToActionBindingProjection {
  readonly kind: "observation_to_action_binding_projection";
  readonly projectionRef: string;
  readonly episodeId: string;
  readonly observationId: string;
  readonly catalogRef: string;
  readonly rows: readonly ObservationToActionBindingRow[];
}

export interface ObservationToActionBindingRow {
  readonly kind: "observation_to_action_binding_row";
  readonly bindingRef: string;
  readonly pressureRef: string;
  readonly actionRef: string;
  readonly targetOutcomeRef: string;
  readonly providedOutputRefs: readonly string[];
  readonly requiredInputRefs: readonly string[];
  readonly availableInputRefs: readonly string[];
  readonly missingInputRefs: readonly string[];
  readonly matchReasonRefs: readonly string[];
  readonly ineligibleReasonRefs: readonly string[];
  readonly bindingScore: number;
}

export interface ConstructionPriorityScheme {
  readonly kind: "construction_priority_scheme";
  readonly schemeRef: string;
  readonly sourcePolicyRef: string;
  readonly rules: readonly ConstructionPriorityRule[];
}

export interface ConstructionPriorityRule {
  readonly kind: "construction_priority_rule";
  readonly priorityRuleRef: string;
  readonly axis: ConstructionPriorityAxis;
  readonly weight: number;
  readonly appliesToActionKinds: readonly ConstructionActionKind[];
  readonly appliesToOutcomeRefs: readonly string[];
  readonly sourcePolicyRef: string;
  readonly strategyLabel: string;
}

export interface AffectPriorityPolicy {
  readonly kind: "affect_priority_policy";
  readonly policyRef: string;
  readonly signalKind: ConstructionAffectSignalKind;
  readonly appliesToOutcomeRefs: readonly string[];
  readonly appliesToActionKinds: readonly ConstructionActionKind[];
  readonly boostWeight: number;
  readonly attenuationWeight: number;
  readonly forceReviewThreshold: number | null;
  readonly fhInputThreshold: number | null;
  readonly escalationThreshold: number | null;
  readonly terminalRouteRefs: readonly string[];
  readonly sourcePolicyRef: string;
}

export interface AffectPriorityAdjustment {
  readonly kind: "affect_priority_adjustment";
  readonly affectRef: string;
  readonly bindingRef: string;
  readonly signalKind: ConstructionAffectSignalKind;
  readonly sourceRef: string;
  readonly targetOutcomeRefs: readonly string[];
  readonly affectedActionRefs: readonly string[];
  readonly intensity: number;
  readonly adjustment: AffectPriorityAdjustmentKind;
  readonly weightDelta: number;
  readonly policyRef: string;
  readonly reviewReasonRefs: readonly string[];
  readonly terminalRouteRef: string | null;
  readonly escalationRequired: boolean;
  readonly evidenceRefs: readonly string[];
}

export interface ConstructionPriorityProjection {
  readonly kind: "construction_priority_projection";
  readonly projectionRef: string;
  readonly episodeId: string;
  readonly bindingProjectionRef: string;
  readonly prioritySchemeRef: string;
  readonly affectPolicyRefs: readonly string[];
  readonly affectAdjustments: readonly AffectPriorityAdjustment[];
  readonly rows: readonly ConstructionPriorityRow[];
}

export interface ConstructionPriorityRow {
  readonly kind: "construction_priority_row";
  readonly rankInputRef: string;
  readonly bindingRef: string;
  readonly pressureRef: string;
  readonly actionRef: string;
  readonly targetOutcomeRef: string;
  readonly sourcePolicyRef: string;
  readonly rankOrdinal: number;
  readonly baseScore: number;
  readonly priorityScore: number;
  readonly affectAdjustmentRefs: readonly string[];
  readonly finalScore: number;
  readonly rankReasonRefs: readonly string[];
  readonly forcedReview: boolean;
  readonly fhInputRequired: boolean;
  readonly escalationRequired: boolean;
  readonly terminalRouteRef: string | null;
  readonly reviewReasonRefs: readonly string[];
  readonly terminalDisposition: ConstructionTerminalDisposition;
  readonly tieBreakKey: string;
}

export interface ConstructionIntentCandidate {
  readonly kind: "construction_intent_candidate";
  readonly candidateId: string;
  readonly episodeId: string;
  readonly rank: number;
  readonly valueScore: number;
  readonly priorityScore: number;
  readonly affectAdjustmentRefs: readonly string[];
  readonly selectedActionRef: string;
  readonly selectedBindingRef: string;
  readonly selectedOutcomeRef: string;
  readonly targetGraphFunctionRef: string | null;
  readonly targetVectorRef: string | null;
  readonly targetReentryRef: string | null;
  readonly inputAssetRefs: readonly string[];
  readonly expectedOutputAssetRefs: readonly string[];
  readonly gapRefs: readonly string[];
  readonly obligationRefs: readonly string[];
  readonly lawfulBasisRefs: readonly string[];
  readonly expectedDelta: string;
  readonly progressCondition: string;
  readonly stopCondition: string;
  readonly escalationCondition: string;
  readonly rejectedAlternativeRefs: readonly string[];
  readonly rationale: string;
  readonly hiddenConfigRefs: readonly string[];
  readonly runtimeEventPayloadRefs: readonly string[];
  readonly fdSemanticCanonicalizationRequired: boolean;
}

export interface ConstructionIntentAdmission {
  readonly kind: "construction_intent_admission";
  readonly admissionRef: string;
  readonly candidateId: string;
  readonly episodeId: string;
  readonly selectedBindingRef: string;
  readonly selectedOutcomeRef: string;
  readonly candidateRank: number;
  readonly iterationOrdinal: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly decision: ConstructionIntentAdmissionDecision;
  readonly rejectionReasonRefs: readonly string[];
  readonly admittedIntent: AdmittedConstructionIntent | null;
}

export interface AdmittedConstructionIntent {
  readonly kind: "admitted_construction_intent";
  readonly intentId: string;
  readonly candidateId: string;
  readonly episodeId: string;
  readonly selectedActionRef: string;
  readonly selectedBindingRef: string;
  readonly selectedOutcomeRef: string;
  readonly iterationOrdinal: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly selectedGraphFunctionRef: string | null;
  readonly selectedVectorRef: string | null;
  readonly selectedReentryRef: string | null;
  readonly runtimeInvocationPlanRef: string | null;
  readonly lineageRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly admissionDecisionRef: string;
  readonly correlationId: string;
}

export interface ConstructionProgressInputRow {
  readonly iterationOrdinal: number;
  readonly attemptOrdinal: number;
  readonly eventSequence: number;
  readonly intentId: string;
  readonly attemptRef: string;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly beforeProjectionRef: string;
  readonly afterProjectionRef: string;
  readonly assetDeltaRefs: readonly string[];
  readonly artifactDigestBefore: string | null;
  readonly artifactDigestAfter: string | null;
  readonly blockerBefore: string | null;
  readonly blockerAfter: string | null;
  readonly fulfilledObligationRefs: readonly string[];
  readonly remainingObligationRefs: readonly string[];
  readonly newEvidenceRefs: readonly string[];
  readonly fhDecisionAccepted: boolean;
  readonly reentryMoved: boolean;
  readonly closed: boolean;
}

export interface ConstructionProgressLedger {
  readonly kind: "construction_progress_ledger";
  readonly episodeId: string;
  readonly rows: readonly ConstructionProgressRow[];
}

export interface ConstructionProgressRow {
  readonly kind: "construction_progress_row";
  readonly episodeId: string;
  readonly progressRowId: string;
  readonly iterationOrdinal: number;
  readonly attemptOrdinal: number;
  readonly eventSequence: number;
  readonly intentId: string;
  readonly attemptRef: string;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly beforeProjectionRef: string;
  readonly afterProjectionRef: string;
  readonly assetDeltaRefs: readonly string[];
  readonly artifactDigestBefore: string | null;
  readonly artifactDigestAfter: string | null;
  readonly blockerBefore: string | null;
  readonly blockerAfter: string | null;
  readonly fulfilledObligationRefs: readonly string[];
  readonly remainingObligationRefs: readonly string[];
  readonly newEvidenceRefs: readonly string[];
  readonly progressKind: ConstructionProgressKind;
  readonly stagnationReason: string | null;
}

export interface ConstructionProjection {
  readonly kind: "construction_projection";
  readonly projectionRef: string;
  readonly episodeId: string;
  readonly publicState: ConstructionProjectionState;
  readonly nextActionRef: string | null;
  readonly selectedIntentId: string | null;
  readonly terminalRouteRefs: readonly string[];
  readonly reviewReasonRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}

export interface ConstructionProjectionSummary {
  readonly kind: "construction_projection_summary";
  readonly projectionRef: string;
  readonly episodeId: string;
  readonly publicState: ConstructionProjectionState;
  readonly nextActionRef: string | null;
  readonly selectedIntentId: string | null;
  readonly terminalRouteRefs: readonly string[];
  readonly reviewReasonRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}

export interface ConstructionHookDeclaration {
  readonly hookRef: string;
  readonly sourceRef: string;
  readonly concerns: readonly string[];
  readonly config: Readonly<Record<string, unknown>>;
}

export interface ConstructionHookResolution {
  readonly kind: "construction_hook_resolution";
  readonly resolutionRef: string;
  readonly hookKey: typeof CONSTRUCTION_HOOK_KEY;
  readonly source: ConstructionHookSource;
  readonly sourceRef: string;
  readonly hookRef: string;
  readonly concerns: readonly string[];
  readonly config: Readonly<Record<string, unknown>>;
  readonly configDigest: string;
  readonly fallbackUsed: boolean;
}

export function isConstructionRuntimeEvent(
  event: RuntimeEvent
): event is ConstructionRuntimeEvent {
  return (
    "constructionEventRef" in event &&
    "episodeId" in event &&
    "iterationOrdinal" in event &&
    "eventSequence" in event
  );
}

function compareConstructionRuntimeEvents(
  left: ConstructionRuntimeEvent,
  right: ConstructionRuntimeEvent
): number {
  if (left.eventSequence !== right.eventSequence) {
    return left.eventSequence - right.eventSequence;
  }
  if (left.iterationOrdinal !== right.iterationOrdinal) {
    return left.iterationOrdinal - right.iterationOrdinal;
  }
  const kindComparison = left.kind.localeCompare(right.kind);
  return kindComparison !== 0
    ? kindComparison
    : left.constructionEventRef.localeCompare(right.constructionEventRef);
}

function validateConstructionRuntimeEventCausality(
  events: readonly ConstructionRuntimeEvent[]
): void {
  let episodeStarted = false;
  let evaluatorAwaitingOutcome = false;
  const returnedCandidateRefs = new Set<string>();
  const admittedIntentRefs = new Map<string, string>();
  const selectedIntentRefs = new Map<
    string,
    {
      readonly selectedActionRef: string;
      readonly selectedBindingRef: string;
    }
  >();
  const inFlightIntentRefs = new Map<
    string,
    {
      readonly graphCallId: string;
      readonly frameId: string;
      readonly continuationId: string | null;
      readonly selectedActionRef: string;
    }
  >();

  for (const event of events) {
    switch (event.kind) {
      case "construction_episode_started":
        if (episodeStarted) {
          throw new TypeError("Construction event replay has duplicate episode start");
        }
        episodeStarted = true;
        break;
      case "construction_observation_snapshot_materialized":
      case "construction_action_catalog_projected":
        if (!episodeStarted) {
          throw new TypeError(
            `${event.kind} requires prior construction_episode_started`
          );
        }
        break;
      case "construction_evaluator_invoked":
        if (!episodeStarted) {
          throw new TypeError(
            "construction_evaluator_invoked requires prior construction_episode_started"
          );
        }
        evaluatorAwaitingOutcome = true;
        break;
      case "construction_intent_candidate_returned":
        if (!evaluatorAwaitingOutcome) {
          throw new TypeError(
            "construction_intent_candidate_returned requires prior construction_evaluator_invoked"
          );
        }
        evaluatorAwaitingOutcome = false;
        for (const candidateRef of event.candidateRefs) {
          returnedCandidateRefs.add(candidateRef);
        }
        break;
      case "construction_intent_candidate_admitted":
        if (!returnedCandidateRefs.has(event.candidateId)) {
          throw new TypeError(
            "construction_intent_candidate_admitted requires prior returned candidate"
          );
        }
        admittedIntentRefs.set(event.intentId, event.candidateId);
        break;
      case "construction_intent_candidate_rejected":
        if (!returnedCandidateRefs.has(event.candidateId)) {
          throw new TypeError(
            "construction_intent_candidate_rejected requires prior returned candidate"
          );
        }
        break;
      case "construction_intent_selected":
        if (!admittedIntentRefs.has(event.intentId)) {
          throw new TypeError(
            "construction_intent_selected requires prior admitted construction intent"
          );
        }
        selectedIntentRefs.set(event.intentId, {
          selectedActionRef: event.selectedActionRef,
          selectedBindingRef: event.selectedBindingRef
        });
        break;
      case "construction_graph_action_invoked": {
        const selection = selectedIntentRefs.get(event.intentId);
        if (selection === undefined) {
          throw new TypeError(
            "construction_graph_action_invoked requires prior selected construction intent"
          );
        }
        if (selection.selectedActionRef !== event.selectedActionRef) {
          throw new TypeError(
            "construction_graph_action_invoked selected action contradicts selected intent"
          );
        }
        inFlightIntentRefs.set(event.intentId, {
          graphCallId: event.graphCallId,
          frameId: event.frameId,
          continuationId: event.continuationId,
          selectedActionRef: event.selectedActionRef
        });
        break;
      }
      case "construction_delta_observed": {
        const inFlight = inFlightIntentRefs.get(event.intentId);
        if (inFlight === undefined) {
          throw new TypeError(
            "construction_delta_observed requires prior in-flight graph action invocation"
          );
        }
        if (
          inFlight.graphCallId !== event.graphCallId ||
          inFlight.frameId !== event.frameId ||
          inFlight.continuationId !== event.continuationId
        ) {
          throw new TypeError(
            "construction_delta_observed runtime scope contradicts in-flight graph action"
          );
        }
        inFlightIntentRefs.delete(event.intentId);
        break;
      }
      case "construction_terminal_disposition_projected": {
        if (!episodeStarted) {
          throw new TypeError(
            "construction_terminal_disposition_projected requires prior construction_episode_started"
          );
        }
        if (event.selectedIntentId !== null) {
          const selection = selectedIntentRefs.get(event.selectedIntentId);
          if (selection === undefined) {
            throw new TypeError(
              "construction_terminal_disposition_projected selected intent was not admitted and selected"
            );
          }
          if (
            event.selectedActionRef !== null &&
            selection.selectedActionRef !== event.selectedActionRef
          ) {
            throw new TypeError(
              "construction_terminal_disposition_projected selected action contradicts selected intent"
            );
          }
        }
        break;
      }
    }
  }
}

export function admitConstructionRuntimeEvents(input: {
  readonly episodeId: string;
  readonly events: readonly RuntimeEvent[];
}): readonly ConstructionRuntimeEvent[] {
  assertNonEmptyString(input.episodeId, "ConstructionRuntimeEvents.episodeId");
  const admitted: ConstructionRuntimeEvent[] = [];
  const seenRefs = new Set<string>();
  for (const event of input.events) {
    assertRuntimeEvent(event);
    if (!isConstructionRuntimeEvent(event)) {
      throw new TypeError(
        `Construction event replay received non-construction event ${JSON.stringify(event.kind)}`
      );
    }
    if (event.episodeId !== input.episodeId) {
      throw new TypeError(
        `Construction event ${JSON.stringify(event.constructionEventRef)} belongs to ${JSON.stringify(event.episodeId)}, not ${JSON.stringify(input.episodeId)}`
      );
    }
    if (seenRefs.has(event.constructionEventRef)) {
      throw new TypeError(
        `Duplicate constructionEventRef ${JSON.stringify(event.constructionEventRef)}`
      );
    }
    seenRefs.add(event.constructionEventRef);
    admitted.push(event);
  }
  const ordered = admitted.sort(compareConstructionRuntimeEvents);
  validateConstructionRuntimeEventCausality(ordered);
  return Object.freeze(ordered);
}

export function deriveConstructionEventCalculusProjection(input: {
  readonly episodeId: string;
  readonly events: readonly RuntimeEvent[];
}): RuntimeEventCalculusProjection {
  const admitted = admitConstructionRuntimeEvents(input);
  return deriveRuntimeEventCalculusProjection({
    events: admitted,
    derivedRules: [CONSTRUCTION_PROGRESS_DERIVED_FLUENT_RULE]
  });
}

export function deriveConstructionProgressLedgerFromDeltaEvents(input: {
  readonly episodeId: string;
  readonly events: readonly RuntimeEvent[];
}): ConstructionProgressLedger {
  const events = admitConstructionRuntimeEvents({
    episodeId: input.episodeId,
    events: input.events
  }).filter(
    (event): event is ConstructionDeltaObservedEvent =>
      event.kind === "construction_delta_observed"
  );
  return deriveConstructionProgressLedger({
    episodeId: input.episodeId,
    rows: events.map((event) => ({
      iterationOrdinal: event.iterationOrdinal,
      attemptOrdinal: event.attemptOrdinal,
      eventSequence: event.eventSequence,
      intentId: event.intentId,
      attemptRef: event.deltaRef,
      basisProjectionRef: event.basisProjectionRef,
      priorIntentId: event.priorIntentId,
      causationRef: event.causationEventRefs[0] ?? event.constructionEventRef,
      correlationId: event.correlationId,
      beforeProjectionRef: event.beforeProjectionRef,
      afterProjectionRef: event.afterProjectionRef,
      assetDeltaRefs: event.assetDeltaRefs,
      artifactDigestBefore: event.artifactDigestBefore,
      artifactDigestAfter: event.artifactDigestAfter,
      blockerBefore: event.blockerBefore,
      blockerAfter: event.blockerAfter,
      fulfilledObligationRefs: event.fulfilledObligationRefs,
      remainingObligationRefs: event.remainingObligationRefs,
      newEvidenceRefs: event.newEvidenceRefs,
      fhDecisionAccepted: event.fhDecisionAccepted,
      reentryMoved: event.reentryMoved,
      closed: event.closed
    }))
  });
}

function stableJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableJson(item)).join(",")}]`;
  }
  if (typeof value === "object" && value !== null) {
    const entries = Object.entries(value).sort(([left], [right]) =>
      left.localeCompare(right)
    );
    return `{${entries
      .map(([key, item]) => `${JSON.stringify(key)}:${stableJson(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function stableDigest(value: unknown): string {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function assertAllowedString<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string
): T {
  for (const candidate of allowed) {
    if (candidate === value) {
      return candidate;
    }
  }
  throw new TypeError(`${label} has unsupported value ${JSON.stringify(value)}`);
}

function assertNonNegativeFiniteNumber(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative finite number`);
  }
}

function assertNullableNonNegativeFiniteNumber(
  value: number | null,
  label: string
): void {
  if (value !== null) {
    assertNonNegativeFiniteNumber(value, label);
  }
}

function freezeNonEmptyStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    assertNonEmptyString(value, `${label}[${index}]`);
    if (seen.has(value)) {
      throw new TypeError(`${label} contains duplicate value ${JSON.stringify(value)}`);
    }
    seen.add(value);
  }
  return freezeStringArray(values);
}

function uniqueNonEmptyStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  values.forEach((value, index) =>
    assertNonEmptyString(value, `${label}[${index}]`)
  );
  return freezeStringArray([...new Set(values)].sort());
}

function nullableString(value: string | null, label: string): string | null {
  if (value === null) {
    return null;
  }
  assertNonEmptyString(value, label);
  return value;
}

function assertPlainRecord(
  value: unknown,
  label: string
): Readonly<Record<string, unknown>> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new TypeError(`${label} must be an object`);
  }
  const record: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    record[key] = item;
  }
  return Object.freeze(record);
}

function requiredStringField(
  record: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label}.${key} must be a non-empty string`);
  }
  return value;
}

function optionalStringArrayField(
  record: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): readonly string[] {
  const value = record[key];
  if (value === undefined) {
    return Object.freeze([]);
  }
  if (!Array.isArray(value)) {
    throw new TypeError(`${label}.${key} must be an array`);
  }
  return freezeNonEmptyStrings(value, `${label}.${key}`);
}

function optionalNumberField(
  record: Readonly<Record<string, unknown>>,
  key: string,
  fallback: number,
  label: string
): number {
  const value = record[key];
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label}.${key} must be a non-negative finite number`);
  }
  return value;
}

function optionalNullableNumberField(
  record: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): number | null {
  const value = record[key];
  if (value === undefined || value === null) {
    return null;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label}.${key} must be null or a non-negative finite number`);
  }
  return value;
}

function configValueByAliases(
  record: Readonly<Record<string, unknown>>,
  aliases: readonly string[]
): unknown {
  const key = aliases.find((candidate) => record[candidate] !== undefined);
  return key === undefined ? undefined : record[key];
}

function optionalStringArrayConfigByAliases(
  record: Readonly<Record<string, unknown>>,
  aliases: readonly string[],
  label: string
): readonly string[] {
  const value = configValueByAliases(record, aliases);
  if (value === undefined) {
    return Object.freeze([]);
  }
  if (!Array.isArray(value)) {
    throw new TypeError(`${label} must be an array`);
  }
  return uniqueNonEmptyStrings(
    value.map((entry, index) => {
      if (typeof entry !== "string" || entry.length === 0) {
        throw new TypeError(`${label}[${index}] must be a non-empty string`);
      }
      return entry;
    }),
    label
  );
}

function optionalStringConfigByAliases(
  record: Readonly<Record<string, unknown>>,
  aliases: readonly string[],
  fallback: string,
  label: string
): string {
  const value = configValueByAliases(record, aliases);
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function optionalNumberConfigByAliases(
  record: Readonly<Record<string, unknown>>,
  aliases: readonly string[],
  fallback: number,
  label: string
): number {
  const value = configValueByAliases(record, aliases);
  if (value === undefined) {
    return fallback;
  }
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative finite number`);
  }
  return value;
}

function intersects(left: readonly string[], right: readonly string[]): boolean {
  const rightSet = new Set(right);
  return left.some((value) => rightSet.has(value));
}

function matchesOptionalStrings(
  allowed: readonly string[],
  candidate: string
): boolean {
  return allowed.length === 0 || allowed.includes(candidate);
}

function matchesOptionalActionKinds(
  allowed: readonly ConstructionActionKind[],
  candidate: ConstructionActionKind
): boolean {
  return allowed.length === 0 || allowed.includes(candidate);
}

export function isConstructiveConstructionActionKind(
  actionKind: ConstructionActionKind
): actionKind is ConstructiveConstructionActionKind {
  return CONSTRUCTIVE_CONSTRUCTION_ACTION_KIND_VALUES.some(
    (candidate) => candidate === actionKind
  );
}

function terminalOrder(disposition: ConstructionTerminalDisposition): number {
  switch (disposition) {
    case "escalate":
      return 0;
    case "request_fh_input":
      return 1;
    case "force_review":
      return 2;
    case "none":
      return 3;
  }
}

function projectionStateForActionKind(
  actionKind: ConstructionActionKind
): ConstructionProjectionState {
  switch (actionKind) {
    case "open_fh_gate":
      return "fh_input_required";
    case "create_ticket":
      return "ticket_created";
    case "propose_reprice":
      return "reprice_required";
    case "close_episode":
      return "construction_closed";
    case "block_episode":
      return "construction_blocked";
    case "yield_progress":
    case "invoke_graph_function":
    case "continue_graph_call":
    case "repair_same_edge":
    case "reenter_graph_span":
    case "invoke_prior_vector":
    case "invoke_later_vector":
      return "construction_progressing_yield";
  }
}

export function constructObservationPressureRow(input: {
  readonly pressureRef: string;
  readonly pressureKind: ConstructionPressureKind;
  readonly sourceRef: string;
  readonly affectedAssetRefs?: readonly string[];
  readonly targetOutcomeRefs: readonly string[];
  readonly evidenceRefs?: readonly string[];
  readonly severity?: number;
  readonly ambiguityClass?: ConstructionAmbiguityClass;
  readonly authorityRefs?: readonly string[];
  readonly affectSignalKind?: ConstructionAffectSignalKind | null;
}): ObservationPressureRow {
  assertNonEmptyString(input.pressureRef, "ObservationPressureRow.pressureRef");
  assertAllowedString(
    input.pressureKind,
    CONSTRUCTION_PRESSURE_KIND_VALUES,
    "ObservationPressureRow.pressureKind"
  );
  assertNonEmptyString(input.sourceRef, "ObservationPressureRow.sourceRef");
  const severity = input.severity ?? 1;
  assertNonNegativeFiniteNumber(severity, "ObservationPressureRow.severity");
  const ambiguityClass = input.ambiguityClass ?? "none";
  assertAllowedString(
    ambiguityClass,
    CONSTRUCTION_AMBIGUITY_CLASS_VALUES,
    "ObservationPressureRow.ambiguityClass"
  );
  const affectSignalKind = input.affectSignalKind ?? null;
  if (input.pressureKind === "affect_signal") {
    if (affectSignalKind === null) {
      throw new TypeError("affect_signal pressure requires affectSignalKind");
    }
    assertAllowedString(
      affectSignalKind,
      CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES,
      "ObservationPressureRow.affectSignalKind"
    );
  } else if (affectSignalKind !== null) {
    throw new TypeError("affectSignalKind is only valid for affect_signal pressure");
  }
  return Object.freeze({
    kind: "observation_pressure_row",
    pressureRef: input.pressureRef,
    pressureKind: input.pressureKind,
    sourceRef: input.sourceRef,
    affectedAssetRefs: freezeNonEmptyStrings(
      input.affectedAssetRefs ?? [],
      "ObservationPressureRow.affectedAssetRefs"
    ),
    targetOutcomeRefs: freezeNonEmptyStrings(
      input.targetOutcomeRefs,
      "ObservationPressureRow.targetOutcomeRefs"
    ),
    evidenceRefs: freezeNonEmptyStrings(
      input.evidenceRefs ?? [],
      "ObservationPressureRow.evidenceRefs"
    ),
    severity,
    ambiguityClass,
    authorityRefs: freezeNonEmptyStrings(
      input.authorityRefs ?? [],
      "ObservationPressureRow.authorityRefs"
    ),
    affectSignalKind
  });
}

export function constructConstructionObservationSnapshot(input: {
  readonly episodeId: string;
  readonly observationId: string;
  readonly basisRef: string;
  readonly currentProjectionRef: string;
  readonly iterationOrdinal: number;
  readonly basisProjectionRef: string;
  readonly priorIntentId: string | null;
  readonly causationRef: string;
  readonly correlationId: string;
  readonly runtimeAggregateRefs?: readonly string[];
  readonly linkedAssetRefs?: readonly string[];
  readonly passedInputRefs?: readonly string[];
  readonly gapProjectionRefs?: readonly string[];
  readonly foldbackRefs?: readonly string[];
  readonly retryFrontierRefs?: readonly string[];
  readonly reentryFrontierRefs?: readonly string[];
  readonly assuranceRefs?: readonly string[];
  readonly fhInputRefs?: readonly string[];
  readonly priorIntentRefs?: readonly string[];
  readonly priorProgressRefs?: readonly string[];
  readonly actionCatalogRef: string;
  readonly authorityDigest: string;
  readonly pressureRows: readonly ObservationPressureRow[];
}): ConstructionObservationSnapshot {
  assertNonEmptyString(input.episodeId, "ConstructionObservationSnapshot.episodeId");
  assertNonEmptyString(input.observationId, "ConstructionObservationSnapshot.observationId");
  assertNonEmptyString(input.basisRef, "ConstructionObservationSnapshot.basisRef");
  assertNonEmptyString(
    input.currentProjectionRef,
    "ConstructionObservationSnapshot.currentProjectionRef"
  );
  assertNonNegativeInteger(
    input.iterationOrdinal,
    "ConstructionObservationSnapshot.iterationOrdinal"
  );
  assertNonEmptyString(
    input.basisProjectionRef,
    "ConstructionObservationSnapshot.basisProjectionRef"
  );
  nullableString(input.priorIntentId, "ConstructionObservationSnapshot.priorIntentId");
  assertNonEmptyString(
    input.causationRef,
    "ConstructionObservationSnapshot.causationRef"
  );
  assertNonEmptyString(
    input.correlationId,
    "ConstructionObservationSnapshot.correlationId"
  );
  assertNonEmptyString(
    input.actionCatalogRef,
    "ConstructionObservationSnapshot.actionCatalogRef"
  );
  assertNonEmptyString(
    input.authorityDigest,
    "ConstructionObservationSnapshot.authorityDigest"
  );
  const pressureRefs = new Set<string>();
  for (const row of input.pressureRows) {
    if (pressureRefs.has(row.pressureRef)) {
      throw new TypeError(
        `ConstructionObservationSnapshot has duplicate pressureRef ${JSON.stringify(row.pressureRef)}`
      );
    }
    pressureRefs.add(row.pressureRef);
  }
  return Object.freeze({
    kind: "construction_observation_snapshot",
    episodeId: input.episodeId,
    observationId: input.observationId,
    basisRef: input.basisRef,
    currentProjectionRef: input.currentProjectionRef,
    iterationOrdinal: input.iterationOrdinal,
    basisProjectionRef: input.basisProjectionRef,
    priorIntentId: nullableString(
      input.priorIntentId,
      "ConstructionObservationSnapshot.priorIntentId"
    ),
    causationRef: input.causationRef,
    correlationId: input.correlationId,
    runtimeAggregateRefs: freezeNonEmptyStrings(
      input.runtimeAggregateRefs ?? [],
      "ConstructionObservationSnapshot.runtimeAggregateRefs"
    ),
    linkedAssetRefs: freezeNonEmptyStrings(
      input.linkedAssetRefs ?? [],
      "ConstructionObservationSnapshot.linkedAssetRefs"
    ),
    passedInputRefs: freezeNonEmptyStrings(
      input.passedInputRefs ?? [],
      "ConstructionObservationSnapshot.passedInputRefs"
    ),
    gapProjectionRefs: freezeNonEmptyStrings(
      input.gapProjectionRefs ?? [],
      "ConstructionObservationSnapshot.gapProjectionRefs"
    ),
    foldbackRefs: freezeNonEmptyStrings(
      input.foldbackRefs ?? [],
      "ConstructionObservationSnapshot.foldbackRefs"
    ),
    retryFrontierRefs: freezeNonEmptyStrings(
      input.retryFrontierRefs ?? [],
      "ConstructionObservationSnapshot.retryFrontierRefs"
    ),
    reentryFrontierRefs: freezeNonEmptyStrings(
      input.reentryFrontierRefs ?? [],
      "ConstructionObservationSnapshot.reentryFrontierRefs"
    ),
    assuranceRefs: freezeNonEmptyStrings(
      input.assuranceRefs ?? [],
      "ConstructionObservationSnapshot.assuranceRefs"
    ),
    fhInputRefs: freezeNonEmptyStrings(
      input.fhInputRefs ?? [],
      "ConstructionObservationSnapshot.fhInputRefs"
    ),
    priorIntentRefs: freezeNonEmptyStrings(
      input.priorIntentRefs ?? [],
      "ConstructionObservationSnapshot.priorIntentRefs"
    ),
    priorProgressRefs: freezeNonEmptyStrings(
      input.priorProgressRefs ?? [],
      "ConstructionObservationSnapshot.priorProgressRefs"
    ),
    actionCatalogRef: input.actionCatalogRef,
    authorityDigest: input.authorityDigest,
    pressureRows: Object.freeze([...input.pressureRows])
  });
}

export function deriveConstructionObservationAssetRefsFromRuntimeTruth(input: {
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
}): ConstructionObservationAssetRefs {
  const passedInputRefs = uniqueNonEmptyStrings(
    input.basis.startIntent.inputBindings?.map((binding) => binding.assetRef) ?? [],
    "ConstructionObservationAssetRefs.passedInputRefs"
  );
  const passed = new Set(passedInputRefs);
  const targetRefs = new Set(
    input.basis.graph.vectors.map((vector) => vector.target.id)
  );
  const declaredInputRefs = input.basis.graph.inputs?.map((node) => node.id) ?? [];
  const derivedRootInputRefs = input.basis.graph.vectors.flatMap((vector) =>
    vector.source
      .map((node) => node.id)
      .filter((nodeRef) => !targetRefs.has(nodeRef))
  );
  const rootInputRefs =
    declaredInputRefs.length > 0 ? declaredInputRefs : derivedRootInputRefs;
  const closedTargetRefs = input.projection.closedVectorIndexes.flatMap((index) =>
    input.basis.graph.vectors[index] === undefined
      ? []
      : [input.basis.graph.vectors[index].target.id]
  );
  const linkedAssetRefs = uniqueNonEmptyStrings(
    [...rootInputRefs, ...closedTargetRefs].filter((ref) => !passed.has(ref)),
    "ConstructionObservationAssetRefs.linkedAssetRefs"
  );
  return Object.freeze({
    linkedAssetRefs,
    passedInputRefs
  });
}

export function constructConstructionActionRow(input: {
  readonly actionRef: string;
  readonly actionKind: ConstructionActionKind;
  readonly graphFunctionRef?: string | null;
  readonly graphVectorRef?: string | null;
  readonly refinementBoundaryRef?: string | null;
  readonly candidateFamilyRef?: string | null;
  readonly publishedTraversalTargetRef?: string | null;
  readonly targetOutcomeRef: string;
  readonly inputAssetRefs?: readonly string[];
  readonly expectedOutputAssetRefs?: readonly string[];
  readonly requiredAuthorityRefs?: readonly string[];
  readonly eligibleReasonRefs?: readonly string[];
  readonly ineligibleReasonRefs?: readonly string[];
  readonly hookSourceRefs?: readonly string[];
  readonly defaultPolicyRefs?: readonly string[];
}): ConstructionActionRow {
  assertNonEmptyString(input.actionRef, "ConstructionActionRow.actionRef");
  assertAllowedString(
    input.actionKind,
    CONSTRUCTION_ACTION_KIND_VALUES,
    "ConstructionActionRow.actionKind"
  );
  assertNonEmptyString(input.targetOutcomeRef, "ConstructionActionRow.targetOutcomeRef");
  const graphFunctionRef = nullableString(
    input.graphFunctionRef ?? null,
    "ConstructionActionRow.graphFunctionRef"
  );
  const graphVectorRef = nullableString(
    input.graphVectorRef ?? null,
    "ConstructionActionRow.graphVectorRef"
  );
  const refinementBoundaryRef = nullableString(
    input.refinementBoundaryRef ?? null,
    "ConstructionActionRow.refinementBoundaryRef"
  );
  const candidateFamilyRef = nullableString(
    input.candidateFamilyRef ?? null,
    "ConstructionActionRow.candidateFamilyRef"
  );
  const publishedTraversalTargetRef = nullableString(
    input.publishedTraversalTargetRef ?? null,
    "ConstructionActionRow.publishedTraversalTargetRef"
  );
  if (
    graphVectorRef !== null &&
    isConstructiveConstructionActionKind(input.actionKind) &&
    refinementBoundaryRef === null &&
    candidateFamilyRef === null &&
    publishedTraversalTargetRef === null
  ) {
    throw new TypeError(
      "ConstructionActionRow targeting an internal graph vector requires RefinementBoundary, CandidateFamily, or published traversal target authority"
    );
  }
  return Object.freeze({
    kind: "construction_action_row",
    actionRef: input.actionRef,
    actionKind: input.actionKind,
    graphFunctionRef,
    graphVectorRef,
    refinementBoundaryRef,
    candidateFamilyRef,
    publishedTraversalTargetRef,
    targetOutcomeRef: input.targetOutcomeRef,
    inputAssetRefs: freezeNonEmptyStrings(
      input.inputAssetRefs ?? [],
      "ConstructionActionRow.inputAssetRefs"
    ),
    expectedOutputAssetRefs: freezeNonEmptyStrings(
      input.expectedOutputAssetRefs ?? [],
      "ConstructionActionRow.expectedOutputAssetRefs"
    ),
    requiredAuthorityRefs: freezeNonEmptyStrings(
      input.requiredAuthorityRefs ?? [],
      "ConstructionActionRow.requiredAuthorityRefs"
    ),
    eligibleReasonRefs: freezeNonEmptyStrings(
      input.eligibleReasonRefs ?? [],
      "ConstructionActionRow.eligibleReasonRefs"
    ),
    ineligibleReasonRefs: freezeNonEmptyStrings(
      input.ineligibleReasonRefs ?? [],
      "ConstructionActionRow.ineligibleReasonRefs"
    ),
    hookSourceRefs: freezeNonEmptyStrings(
      input.hookSourceRefs ?? [],
      "ConstructionActionRow.hookSourceRefs"
    ),
    defaultPolicyRefs: freezeNonEmptyStrings(
      input.defaultPolicyRefs ?? [],
      "ConstructionActionRow.defaultPolicyRefs"
    )
  });
}

export function constructConstructionActionRefForTraversalTarget(input: {
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
}): string {
  assertNonEmptyString(
    input.graphFunctionRef,
    "ConstructionActionRef.graphFunctionRef"
  );
  assertNonEmptyString(
    input.graphVectorRef,
    "ConstructionActionRef.graphVectorRef"
  );
  return [
    "construction-action",
    input.graphFunctionRef,
    input.graphVectorRef
  ].join(":");
}

export function constructConstructionActionCatalogProjection(input: {
  readonly catalogRef: string;
  readonly episodeId: string;
  readonly hookResolutionRef: string;
  readonly fallbackConfigDigest: string;
  readonly rows: readonly ConstructionActionRow[];
}): ConstructionActionCatalogProjection {
  assertNonEmptyString(input.catalogRef, "ConstructionActionCatalogProjection.catalogRef");
  assertNonEmptyString(input.episodeId, "ConstructionActionCatalogProjection.episodeId");
  assertNonEmptyString(
    input.hookResolutionRef,
    "ConstructionActionCatalogProjection.hookResolutionRef"
  );
  assertNonEmptyString(
    input.fallbackConfigDigest,
    "ConstructionActionCatalogProjection.fallbackConfigDigest"
  );
  const actionRefs = new Set<string>();
  for (const row of input.rows) {
    if (actionRefs.has(row.actionRef)) {
      throw new TypeError(
        `ConstructionActionCatalogProjection has duplicate actionRef ${JSON.stringify(row.actionRef)}`
      );
    }
    actionRefs.add(row.actionRef);
  }
  return Object.freeze({
    kind: "construction_action_catalog_projection",
    catalogRef: input.catalogRef,
    episodeId: input.episodeId,
    hookResolutionRef: input.hookResolutionRef,
    fallbackConfigDigest: input.fallbackConfigDigest,
    rows: Object.freeze([...input.rows])
  });
}

export function deriveObservationToActionBindingProjection(input: {
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly availableInputRefs?: readonly string[];
}): ObservationToActionBindingProjection {
  if (input.observation.episodeId !== input.actionCatalog.episodeId) {
    throw new TypeError("Observation/action catalog episode mismatch");
  }
  const availableInputRefs = freezeNonEmptyStrings(
    [
      ...input.observation.passedInputRefs,
      ...input.observation.linkedAssetRefs,
      ...(input.availableInputRefs ?? [])
    ],
    "deriveObservationToActionBindingProjection.availableInputRefs"
  );
  const available = new Set(availableInputRefs);
  const rows: ObservationToActionBindingRow[] = [];
  for (const pressure of input.observation.pressureRows) {
    for (const action of input.actionCatalog.rows) {
      if (!pressure.targetOutcomeRefs.includes(action.targetOutcomeRef)) {
        continue;
      }
      if (
        pressure.pressureKind === "affect_signal" &&
        isConstructiveConstructionActionKind(action.actionKind)
      ) {
        continue;
      }
      if (
        pressure.pressureKind === "admitted_error" &&
        pressure.affectedAssetRefs.length > 0 &&
        !intersects(pressure.affectedAssetRefs, [
          ...action.inputAssetRefs,
          ...action.expectedOutputAssetRefs
        ])
      ) {
        continue;
      }
      if (
        pressure.pressureKind === "gap_row" &&
        pressure.affectedAssetRefs.length > 0 &&
        !intersects(pressure.affectedAssetRefs, action.expectedOutputAssetRefs)
      ) {
        continue;
      }
      const missingInputRefs = action.inputAssetRefs.filter((ref) => !available.has(ref));
      const ineligibleReasonRefs = [
        ...action.ineligibleReasonRefs,
        ...missingInputRefs.map((ref) => `missing_input:${ref}`)
      ];
      const matchReasonRefs = [
        `pressure:${pressure.pressureKind}`,
        `outcome:${action.targetOutcomeRef}`,
        ...pressure.evidenceRefs.map((ref) => `evidence:${ref}`)
      ];
      const bindingScore = Math.max(
        0,
        1 + pressure.severity + action.expectedOutputAssetRefs.length - missingInputRefs.length
      );
      rows.push(
        Object.freeze({
          kind: "observation_to_action_binding_row",
          bindingRef: [
            "construction-binding",
            input.observation.episodeId,
            pressure.pressureRef,
            action.actionRef
          ].join(":"),
          pressureRef: pressure.pressureRef,
          actionRef: action.actionRef,
          targetOutcomeRef: action.targetOutcomeRef,
          providedOutputRefs: freezeStringArray(action.expectedOutputAssetRefs),
          requiredInputRefs: freezeStringArray(action.inputAssetRefs),
          availableInputRefs: freezeStringArray(availableInputRefs),
          missingInputRefs: freezeStringArray(missingInputRefs),
          matchReasonRefs: freezeStringArray(matchReasonRefs),
          ineligibleReasonRefs: freezeStringArray(ineligibleReasonRefs),
          bindingScore
        })
      );
    }
  }
  return Object.freeze({
    kind: "observation_to_action_binding_projection",
    projectionRef: `construction-binding-projection:${input.observation.episodeId}:${input.observation.observationId}`,
    episodeId: input.observation.episodeId,
    observationId: input.observation.observationId,
    catalogRef: input.actionCatalog.catalogRef,
    rows: Object.freeze(rows.sort((left, right) => left.bindingRef.localeCompare(right.bindingRef)))
  });
}

export function constructConstructionPriorityScheme(input: {
  readonly schemeRef: string;
  readonly sourcePolicyRef: string;
  readonly rules: readonly ConstructionPriorityRule[];
}): ConstructionPriorityScheme {
  assertNonEmptyString(input.schemeRef, "ConstructionPriorityScheme.schemeRef");
  assertNonEmptyString(input.sourcePolicyRef, "ConstructionPriorityScheme.sourcePolicyRef");
  const ruleRefs = new Set<string>();
  for (const rule of input.rules) {
    if (ruleRefs.has(rule.priorityRuleRef)) {
      throw new TypeError(
        `ConstructionPriorityScheme has duplicate priorityRuleRef ${JSON.stringify(rule.priorityRuleRef)}`
      );
    }
    ruleRefs.add(rule.priorityRuleRef);
  }
  return Object.freeze({
    kind: "construction_priority_scheme",
    schemeRef: input.schemeRef,
    sourcePolicyRef: input.sourcePolicyRef,
    rules: Object.freeze([...input.rules])
  });
}

export function admitConstructionPriorityRule(
  input: unknown,
  label = "ConstructionPriorityRule"
): ConstructionPriorityRule {
  const record = assertPlainRecord(input, label);
  if (record["kind"] !== "construction_priority_rule") {
    throw new TypeError(`${label}.kind must be construction_priority_rule`);
  }
  return constructConstructionPriorityRule({
    priorityRuleRef: requiredStringField(record, "priorityRuleRef", label),
    axis: assertAllowedString(
      requiredStringField(record, "axis", label),
      CONSTRUCTION_PRIORITY_AXIS_VALUES,
      `${label}.axis`
    ),
    weight: optionalNumberField(record, "weight", 0, label),
    appliesToActionKinds: optionalStringArrayField(
      record,
      "appliesToActionKinds",
      label
    ).map((actionKind) =>
      assertAllowedString(
        actionKind,
        CONSTRUCTION_ACTION_KIND_VALUES,
        `${label}.appliesToActionKinds`
      )
    ),
    appliesToOutcomeRefs: optionalStringArrayField(
      record,
      "appliesToOutcomeRefs",
      label
    ),
    sourcePolicyRef: requiredStringField(record, "sourcePolicyRef", label),
    strategyLabel: requiredStringField(record, "strategyLabel", label)
  });
}

export function admitConstructionPriorityScheme(
  input: unknown,
  label = "ConstructionPriorityScheme"
): ConstructionPriorityScheme {
  const record = assertPlainRecord(input, label);
  if (record["kind"] !== "construction_priority_scheme") {
    throw new TypeError(`${label}.kind must be construction_priority_scheme`);
  }
  const rulesInput = record["rules"];
  if (!Array.isArray(rulesInput)) {
    throw new TypeError(`${label}.rules must be an array`);
  }
  return constructConstructionPriorityScheme({
    schemeRef: requiredStringField(record, "schemeRef", label),
    sourcePolicyRef: requiredStringField(record, "sourcePolicyRef", label),
    rules: Object.freeze(
      rulesInput.map((rule, index) =>
        admitConstructionPriorityRule(rule, `${label}.rules[${index}]`)
      )
    )
  });
}

export function constructConstructionPriorityRule(input: {
  readonly priorityRuleRef: string;
  readonly axis: ConstructionPriorityAxis;
  readonly weight: number;
  readonly appliesToActionKinds?: readonly ConstructionActionKind[];
  readonly appliesToOutcomeRefs?: readonly string[];
  readonly sourcePolicyRef: string;
  readonly strategyLabel: string;
}): ConstructionPriorityRule {
  assertNonEmptyString(input.priorityRuleRef, "ConstructionPriorityRule.priorityRuleRef");
  assertAllowedString(
    input.axis,
    CONSTRUCTION_PRIORITY_AXIS_VALUES,
    "ConstructionPriorityRule.axis"
  );
  assertNonNegativeFiniteNumber(input.weight, "ConstructionPriorityRule.weight");
  assertNonEmptyString(input.sourcePolicyRef, "ConstructionPriorityRule.sourcePolicyRef");
  assertNonEmptyString(input.strategyLabel, "ConstructionPriorityRule.strategyLabel");
  return Object.freeze({
    kind: "construction_priority_rule",
    priorityRuleRef: input.priorityRuleRef,
    axis: input.axis,
    weight: input.weight,
    appliesToActionKinds: Object.freeze([...(input.appliesToActionKinds ?? [])]),
    appliesToOutcomeRefs: freezeNonEmptyStrings(
      input.appliesToOutcomeRefs ?? [],
      "ConstructionPriorityRule.appliesToOutcomeRefs"
    ),
    sourcePolicyRef: input.sourcePolicyRef,
    strategyLabel: input.strategyLabel
  });
}

function priorityRuleFromHookConfig(input: {
  readonly hookResolution: ConstructionHookResolution;
  readonly entry: unknown;
  readonly index: number;
}): ConstructionPriorityRule {
  const label = `${input.hookResolution.sourceRef}.priorityRules[${input.index}]`;
  const record = assertPlainRecord(input.entry, label);
  return constructConstructionPriorityRule({
    priorityRuleRef: optionalStringConfigByAliases(
      record,
      ["priorityRuleRef", "priority_rule_ref"],
      [
        "priority-rule",
        input.hookResolution.source,
        input.hookResolution.sourceRef,
        String(input.index)
      ].join(":"),
      `${label}.priorityRuleRef`
    ),
    axis: assertAllowedString(
      optionalStringConfigByAliases(record, ["axis"], "gap_repair", `${label}.axis`),
      CONSTRUCTION_PRIORITY_AXIS_VALUES,
      `${label}.axis`
    ),
    weight: optionalNumberConfigByAliases(record, ["weight"], 1, `${label}.weight`),
    appliesToActionKinds: optionalStringArrayConfigByAliases(
      record,
      ["appliesToActionKinds", "applies_to_action_kinds"],
      `${label}.appliesToActionKinds`
    ).map((actionKind) =>
      assertAllowedString(
        actionKind,
        CONSTRUCTION_ACTION_KIND_VALUES,
        `${label}.appliesToActionKinds`
      )
    ),
    appliesToOutcomeRefs: optionalStringArrayConfigByAliases(
      record,
      ["appliesToOutcomeRefs", "applies_to_outcome_refs"],
      `${label}.appliesToOutcomeRefs`
    ),
    sourcePolicyRef: optionalStringConfigByAliases(
      record,
      ["sourcePolicyRef", "source_policy_ref"],
      input.hookResolution.sourceRef,
      `${label}.sourcePolicyRef`
    ),
    strategyLabel: optionalStringConfigByAliases(
      record,
      ["strategyLabel", "strategy_label"],
      input.hookResolution.source,
      `${label}.strategyLabel`
    )
  });
}

function priorityRulesFromConstructionHookResolution(
  hookResolution: ConstructionHookResolution
): readonly ConstructionPriorityRule[] {
  const rulesConfig =
    hookResolution.config["priorityRules"] ??
    hookResolution.config["priority_rules"];
  if (rulesConfig === undefined) {
    return Object.freeze([]);
  }
  if (!Array.isArray(rulesConfig)) {
    throw new TypeError(
      `${hookResolution.sourceRef}.priorityRules must be an array`
    );
  }
  return Object.freeze(
    rulesConfig.map((entry, index) =>
      priorityRuleFromHookConfig({ hookResolution, entry, index })
    )
  );
}

export function deriveConstructionPrioritySchemeFromHookResolutions(input: {
  readonly schemeRef: string;
  readonly sourcePolicyRef: string;
  readonly hookResolutions: readonly ConstructionHookResolution[];
}): ConstructionPriorityScheme {
  assertNonEmptyString(
    input.schemeRef,
    "deriveConstructionPrioritySchemeFromHookResolutions.schemeRef"
  );
  assertNonEmptyString(
    input.sourcePolicyRef,
    "deriveConstructionPrioritySchemeFromHookResolutions.sourcePolicyRef"
  );
  const uniqueHookResolutions = Object.freeze(
    [
      ...new Map(
        input.hookResolutions.map((resolution) => [
          `${resolution.resolutionRef}:${resolution.configDigest}`,
          resolution
        ])
      ).values()
    ].sort((left, right) =>
      `${left.resolutionRef}:${left.configDigest}`.localeCompare(
        `${right.resolutionRef}:${right.configDigest}`
      )
    )
  );
  return constructConstructionPriorityScheme({
    schemeRef: input.schemeRef,
    sourcePolicyRef: input.sourcePolicyRef,
    rules: Object.freeze(
      uniqueHookResolutions.flatMap(priorityRulesFromConstructionHookResolution)
    )
  });
}

export function admitAffectPriorityPolicy(
  input: unknown,
  label = "AffectPriorityPolicy"
): AffectPriorityPolicy {
  const record = assertPlainRecord(input, label);
  if (record["kind"] !== "affect_priority_policy") {
    throw new TypeError(`${label}.kind must be affect_priority_policy`);
  }
  return constructAffectPriorityPolicy({
    policyRef: requiredStringField(record, "policyRef", label),
    signalKind: assertAllowedString(
      requiredStringField(record, "signalKind", label),
      CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES,
      `${label}.signalKind`
    ),
    appliesToOutcomeRefs: optionalStringArrayField(
      record,
      "appliesToOutcomeRefs",
      label
    ),
    appliesToActionKinds: optionalStringArrayField(
      record,
      "appliesToActionKinds",
      label
    ).map((actionKind) =>
      assertAllowedString(
        actionKind,
        CONSTRUCTION_ACTION_KIND_VALUES,
        `${label}.appliesToActionKinds`
      )
    ),
    boostWeight: optionalNumberField(record, "boostWeight", 0, label),
    attenuationWeight: optionalNumberField(record, "attenuationWeight", 0, label),
    forceReviewThreshold: optionalNullableNumberField(
      record,
      "forceReviewThreshold",
      label
    ),
    fhInputThreshold: optionalNullableNumberField(record, "fhInputThreshold", label),
    escalationThreshold: optionalNullableNumberField(
      record,
      "escalationThreshold",
      label
    ),
    terminalRouteRefs: optionalStringArrayField(
      record,
      "terminalRouteRefs",
      label
    ),
    sourcePolicyRef: requiredStringField(record, "sourcePolicyRef", label)
  });
}

export function admitAffectPriorityPolicies(
  input: unknown,
  label = "AffectPriorityPolicies"
): readonly AffectPriorityPolicy[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array`);
  }
  return Object.freeze(
    input.map((policy, index) =>
      admitAffectPriorityPolicy(policy, `${label}[${index}]`)
    )
  );
}

export function constructAffectPriorityPolicy(input: {
  readonly policyRef: string;
  readonly signalKind: ConstructionAffectSignalKind;
  readonly appliesToOutcomeRefs?: readonly string[];
  readonly appliesToActionKinds?: readonly ConstructionActionKind[];
  readonly boostWeight?: number;
  readonly attenuationWeight?: number;
  readonly forceReviewThreshold?: number | null;
  readonly fhInputThreshold?: number | null;
  readonly escalationThreshold?: number | null;
  readonly terminalRouteRefs?: readonly string[];
  readonly sourcePolicyRef: string;
}): AffectPriorityPolicy {
  assertNonEmptyString(input.policyRef, "AffectPriorityPolicy.policyRef");
  assertAllowedString(
    input.signalKind,
    CONSTRUCTION_AFFECT_SIGNAL_KIND_VALUES,
    "AffectPriorityPolicy.signalKind"
  );
  const boostWeight = input.boostWeight ?? 0;
  const attenuationWeight = input.attenuationWeight ?? 0;
  assertNonNegativeFiniteNumber(boostWeight, "AffectPriorityPolicy.boostWeight");
  assertNonNegativeFiniteNumber(
    attenuationWeight,
    "AffectPriorityPolicy.attenuationWeight"
  );
  const forceReviewThreshold = input.forceReviewThreshold ?? null;
  const fhInputThreshold = input.fhInputThreshold ?? null;
  const escalationThreshold = input.escalationThreshold ?? null;
  assertNullableNonNegativeFiniteNumber(
    forceReviewThreshold,
    "AffectPriorityPolicy.forceReviewThreshold"
  );
  assertNullableNonNegativeFiniteNumber(
    fhInputThreshold,
    "AffectPriorityPolicy.fhInputThreshold"
  );
  assertNullableNonNegativeFiniteNumber(
    escalationThreshold,
    "AffectPriorityPolicy.escalationThreshold"
  );
  assertNonEmptyString(input.sourcePolicyRef, "AffectPriorityPolicy.sourcePolicyRef");
  return Object.freeze({
    kind: "affect_priority_policy",
    policyRef: input.policyRef,
    signalKind: input.signalKind,
    appliesToOutcomeRefs: freezeNonEmptyStrings(
      input.appliesToOutcomeRefs ?? [],
      "AffectPriorityPolicy.appliesToOutcomeRefs"
    ),
    appliesToActionKinds: Object.freeze([...(input.appliesToActionKinds ?? [])]),
    boostWeight,
    attenuationWeight,
    forceReviewThreshold,
    fhInputThreshold,
    escalationThreshold,
    terminalRouteRefs: freezeNonEmptyStrings(
      input.terminalRouteRefs ?? [],
      "AffectPriorityPolicy.terminalRouteRefs"
    ),
    sourcePolicyRef: input.sourcePolicyRef
  });
}

function adjustmentKindForAffect(
  pressure: ObservationPressureRow,
  policy: AffectPriorityPolicy
): AffectPriorityAdjustmentKind {
  if (
    policy.escalationThreshold !== null &&
    pressure.severity >= policy.escalationThreshold
  ) {
    return "escalate";
  }
  if (policy.fhInputThreshold !== null && pressure.severity >= policy.fhInputThreshold) {
    return "request_fh_input";
  }
  if (
    policy.forceReviewThreshold !== null &&
    pressure.severity >= policy.forceReviewThreshold
  ) {
    return "force_review";
  }
  if (pressure.affectSignalKind === "confidence") {
    return "attenuate";
  }
  return "boost";
}

function weightDeltaForAdjustment(
  adjustment: AffectPriorityAdjustmentKind,
  policy: AffectPriorityPolicy
): number {
  switch (adjustment) {
    case "boost":
      return policy.boostWeight;
    case "attenuate":
      return -policy.attenuationWeight;
    case "force_review":
    case "request_fh_input":
    case "escalate":
      return 0;
  }
}

function terminalDispositionForAdjustment(
  adjustment: AffectPriorityAdjustmentKind
): ConstructionTerminalDisposition {
  switch (adjustment) {
    case "force_review":
      return "force_review";
    case "request_fh_input":
      return "request_fh_input";
    case "escalate":
      return "escalate";
    case "boost":
    case "attenuate":
      return "none";
  }
}

function selectedTerminalAdjustmentFor(
  adjustments: readonly AffectPriorityAdjustment[],
  disposition: ConstructionTerminalDisposition
): AffectPriorityAdjustment | undefined {
  if (disposition === "none") {
    return undefined;
  }
  return adjustments
    .filter(
      (adjustment) =>
        terminalDispositionForAdjustment(adjustment.adjustment) === disposition &&
        adjustment.terminalRouteRef !== null
    )
    .sort((left, right) => {
      const routeComparison = (left.terminalRouteRef ?? "").localeCompare(
        right.terminalRouteRef ?? ""
      );
      return routeComparison !== 0
        ? routeComparison
        : left.affectRef.localeCompare(right.affectRef);
    })[0];
}

export function deriveConstructionPriorityProjection(input: {
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly bindingProjection: ObservationToActionBindingProjection;
  readonly priorityScheme: ConstructionPriorityScheme;
  readonly affectPolicies?: readonly AffectPriorityPolicy[];
}): ConstructionPriorityProjection {
  if (input.observation.episodeId !== input.bindingProjection.episodeId) {
    throw new TypeError("Observation/binding projection episode mismatch");
  }
  if (input.actionCatalog.catalogRef !== input.bindingProjection.catalogRef) {
    throw new TypeError("Action catalog/binding projection catalog mismatch");
  }
  const actions = new Map(input.actionCatalog.rows.map((row) => [row.actionRef, row]));
  const pressures = new Map(
    input.observation.pressureRows.map((row) => [row.pressureRef, row])
  );
  const affectPolicies = Object.freeze([...(input.affectPolicies ?? [])]);
  const adjustments: AffectPriorityAdjustment[] = [];
  for (const pressure of input.observation.pressureRows) {
    if (pressure.pressureKind !== "affect_signal" || pressure.affectSignalKind === null) {
      continue;
    }
    for (const policy of affectPolicies) {
      if (policy.signalKind !== pressure.affectSignalKind) {
        continue;
      }
      for (const binding of input.bindingProjection.rows) {
        const action = actions.get(binding.actionRef);
        if (action === undefined) {
          throw new TypeError(
            `Binding row references missing action ${JSON.stringify(binding.actionRef)}`
          );
        }
        if (!matchesOptionalStrings(policy.appliesToOutcomeRefs, binding.targetOutcomeRef)) {
          continue;
        }
        if (!matchesOptionalActionKinds(policy.appliesToActionKinds, action.actionKind)) {
          continue;
        }
        if (!pressure.targetOutcomeRefs.includes(binding.targetOutcomeRef)) {
          continue;
        }
        const adjustment = adjustmentKindForAffect(pressure, policy);
        const terminalDisposition = terminalDispositionForAdjustment(adjustment);
        adjustments.push(
          Object.freeze({
            kind: "affect_priority_adjustment",
            affectRef: [
              "affect-adjustment",
              input.observation.episodeId,
              pressure.pressureRef,
              policy.policyRef,
              binding.bindingRef
            ].join(":"),
            bindingRef: binding.bindingRef,
            signalKind: pressure.affectSignalKind,
            sourceRef: pressure.sourceRef,
            targetOutcomeRefs: freezeStringArray(pressure.targetOutcomeRefs),
            affectedActionRefs: freezeStringArray([action.actionRef]),
            intensity: pressure.severity,
            adjustment,
            weightDelta: weightDeltaForAdjustment(adjustment, policy),
            policyRef: policy.policyRef,
            reviewReasonRefs: freezeStringArray([pressure.pressureRef, policy.policyRef]),
            terminalRouteRef:
              terminalDisposition === "none"
                ? null
                : policy.terminalRouteRefs[0] ?? `${policy.policyRef}:${adjustment}`,
            escalationRequired: adjustment === "escalate",
            evidenceRefs: freezeStringArray(pressure.evidenceRefs)
          })
        );
      }
    }
  }
  const rows = input.bindingProjection.rows.map((binding): ConstructionPriorityRow => {
    const pressure = pressures.get(binding.pressureRef);
    const action = actions.get(binding.actionRef);
    if (pressure === undefined) {
      throw new TypeError(
        `Binding row references missing pressure ${JSON.stringify(binding.pressureRef)}`
      );
    }
    if (action === undefined) {
      throw new TypeError(
        `Binding row references missing action ${JSON.stringify(binding.actionRef)}`
      );
    }
    const matchedRules = input.priorityScheme.rules.filter(
      (rule) =>
        matchesOptionalStrings(rule.appliesToOutcomeRefs, binding.targetOutcomeRef) &&
        matchesOptionalActionKinds(rule.appliesToActionKinds, action.actionKind)
    );
    const priorityScore = matchedRules.reduce((score, rule) => score + rule.weight, 0);
    const rowAdjustments = adjustments.filter(
      (adjustment) => adjustment.bindingRef === binding.bindingRef
    );
    const terminalDisposition = rowAdjustments.reduce<ConstructionTerminalDisposition>(
      (selected, adjustment) => {
        const candidate = terminalDispositionForAdjustment(adjustment.adjustment);
        return terminalOrder(candidate) < terminalOrder(selected) ? candidate : selected;
      },
      "none"
    );
    const selectedTerminalAdjustment = selectedTerminalAdjustmentFor(
      rowAdjustments,
      terminalDisposition
    );
    const affectScore = rowAdjustments.reduce(
      (score, adjustment) => score + adjustment.weightDelta,
      0
    );
    const rankReasonRefs = [
      input.priorityScheme.sourcePolicyRef,
      ...matchedRules.map((rule) => rule.priorityRuleRef),
      ...binding.matchReasonRefs
    ];
    const sourcePolicyRef =
      matchedRules[0]?.sourcePolicyRef ?? input.priorityScheme.sourcePolicyRef;
    const finalScore = binding.bindingScore + priorityScore + affectScore;
    return Object.freeze({
      kind: "construction_priority_row",
      rankInputRef: `construction-rank:${input.observation.episodeId}:${binding.bindingRef}`,
      bindingRef: binding.bindingRef,
      pressureRef: pressure.pressureRef,
      actionRef: action.actionRef,
      targetOutcomeRef: binding.targetOutcomeRef,
      sourcePolicyRef,
      rankOrdinal: 0,
      baseScore: binding.bindingScore,
      priorityScore,
      affectAdjustmentRefs: freezeStringArray(
        rowAdjustments.map((adjustment) => adjustment.affectRef)
      ),
      finalScore,
      rankReasonRefs: freezeStringArray(rankReasonRefs),
      forcedReview: terminalDisposition === "force_review",
      fhInputRequired: terminalDisposition === "request_fh_input",
      escalationRequired: terminalDisposition === "escalate",
      terminalRouteRef: selectedTerminalAdjustment?.terminalRouteRef ?? null,
      reviewReasonRefs: freezeStringArray(
        (selectedTerminalAdjustment === undefined
          ? rowAdjustments
          : [selectedTerminalAdjustment]
        ).flatMap((adjustment) => adjustment.reviewReasonRefs)
      ),
      terminalDisposition,
      tieBreakKey: [
        terminalDisposition,
        binding.targetOutcomeRef,
        action.actionRef,
        binding.bindingRef,
        sourcePolicyRef
      ].join("|")
    });
  });
  const sortedRows = rows
    .sort((left, right) => {
      const terminalComparison =
        terminalOrder(left.terminalDisposition) - terminalOrder(right.terminalDisposition);
      if (terminalComparison !== 0) {
        return terminalComparison;
      }
      if (left.terminalDisposition === "none" && left.finalScore !== right.finalScore) {
        return right.finalScore - left.finalScore;
      }
      const targetComparison = left.targetOutcomeRef.localeCompare(right.targetOutcomeRef);
      if (targetComparison !== 0) {
        return targetComparison;
      }
      const actionComparison = left.actionRef.localeCompare(right.actionRef);
      if (actionComparison !== 0) {
        return actionComparison;
      }
      const bindingComparison = left.bindingRef.localeCompare(right.bindingRef);
      if (bindingComparison !== 0) {
        return bindingComparison;
      }
      return left.sourcePolicyRef.localeCompare(right.sourcePolicyRef);
    })
    .map((row, index) =>
      Object.freeze({
        ...row,
        rankOrdinal: index,
        tieBreakKey: [
          String(index),
          row.terminalDisposition,
          row.targetOutcomeRef,
          row.actionRef,
          row.bindingRef,
          row.sourcePolicyRef
        ].join("|")
      })
    );
  return Object.freeze({
    kind: "construction_priority_projection",
    projectionRef: [
      "construction-priority-projection",
      input.observation.episodeId,
      input.observation.observationId,
      input.priorityScheme.schemeRef,
      stableDigest({
        priorityScheme: input.priorityScheme,
        affectPolicyRefs: affectPolicies.map((policy) => policy.policyRef)
      })
    ].join(":"),
    episodeId: input.observation.episodeId,
    bindingProjectionRef: input.bindingProjection.projectionRef,
    prioritySchemeRef: input.priorityScheme.schemeRef,
    affectPolicyRefs: freezeStringArray(affectPolicies.map((policy) => policy.policyRef)),
    affectAdjustments: Object.freeze(
      adjustments.sort((left, right) => left.affectRef.localeCompare(right.affectRef))
    ),
    rows: Object.freeze(sortedRows)
  });
}

export function constructConstructionIntentCandidate(input: {
  readonly candidateId: string;
  readonly episodeId: string;
  readonly rank: number;
  readonly valueScore?: number;
  readonly priorityScore?: number;
  readonly affectAdjustmentRefs?: readonly string[];
  readonly selectedActionRef: string;
  readonly selectedBindingRef: string;
  readonly selectedOutcomeRef: string;
  readonly targetGraphFunctionRef?: string | null;
  readonly targetVectorRef?: string | null;
  readonly targetReentryRef?: string | null;
  readonly inputAssetRefs?: readonly string[];
  readonly expectedOutputAssetRefs?: readonly string[];
  readonly gapRefs?: readonly string[];
  readonly obligationRefs?: readonly string[];
  readonly lawfulBasisRefs?: readonly string[];
  readonly expectedDelta?: string;
  readonly progressCondition?: string;
  readonly stopCondition?: string;
  readonly escalationCondition?: string;
  readonly rejectedAlternativeRefs?: readonly string[];
  readonly rationale?: string;
  readonly hiddenConfigRefs?: readonly string[];
  readonly runtimeEventPayloadRefs?: readonly string[];
  readonly fdSemanticCanonicalizationRequired?: boolean;
}): ConstructionIntentCandidate {
  assertNonEmptyString(input.candidateId, "ConstructionIntentCandidate.candidateId");
  assertNonEmptyString(input.episodeId, "ConstructionIntentCandidate.episodeId");
  assertNonNegativeInteger(input.rank, "ConstructionIntentCandidate.rank");
  const valueScore = input.valueScore ?? 0;
  const priorityScore = input.priorityScore ?? 0;
  assertNonNegativeFiniteNumber(valueScore, "ConstructionIntentCandidate.valueScore");
  assertNonNegativeFiniteNumber(priorityScore, "ConstructionIntentCandidate.priorityScore");
  assertNonEmptyString(
    input.selectedActionRef,
    "ConstructionIntentCandidate.selectedActionRef"
  );
  assertNonEmptyString(
    input.selectedBindingRef,
    "ConstructionIntentCandidate.selectedBindingRef"
  );
  assertNonEmptyString(
    input.selectedOutcomeRef,
    "ConstructionIntentCandidate.selectedOutcomeRef"
  );
  const expectedDelta = input.expectedDelta ?? "delta_expected";
  const progressCondition = input.progressCondition ?? "progress_required";
  const stopCondition = input.stopCondition ?? "stop_when_projection_terminal";
  const escalationCondition = input.escalationCondition ?? "escalate_when_policy_blocks";
  const rationale = input.rationale ?? "selected by construction evaluator";
  assertNonEmptyString(expectedDelta, "ConstructionIntentCandidate.expectedDelta");
  assertNonEmptyString(progressCondition, "ConstructionIntentCandidate.progressCondition");
  assertNonEmptyString(stopCondition, "ConstructionIntentCandidate.stopCondition");
  assertNonEmptyString(escalationCondition, "ConstructionIntentCandidate.escalationCondition");
  assertNonEmptyString(rationale, "ConstructionIntentCandidate.rationale");
  return Object.freeze({
    kind: "construction_intent_candidate",
    candidateId: input.candidateId,
    episodeId: input.episodeId,
    rank: input.rank,
    valueScore,
    priorityScore,
    affectAdjustmentRefs: freezeNonEmptyStrings(
      input.affectAdjustmentRefs ?? [],
      "ConstructionIntentCandidate.affectAdjustmentRefs"
    ),
    selectedActionRef: input.selectedActionRef,
    selectedBindingRef: input.selectedBindingRef,
    selectedOutcomeRef: input.selectedOutcomeRef,
    targetGraphFunctionRef: nullableString(
      input.targetGraphFunctionRef ?? null,
      "ConstructionIntentCandidate.targetGraphFunctionRef"
    ),
    targetVectorRef: nullableString(
      input.targetVectorRef ?? null,
      "ConstructionIntentCandidate.targetVectorRef"
    ),
    targetReentryRef: nullableString(
      input.targetReentryRef ?? null,
      "ConstructionIntentCandidate.targetReentryRef"
    ),
    inputAssetRefs: freezeNonEmptyStrings(
      input.inputAssetRefs ?? [],
      "ConstructionIntentCandidate.inputAssetRefs"
    ),
    expectedOutputAssetRefs: freezeNonEmptyStrings(
      input.expectedOutputAssetRefs ?? [],
      "ConstructionIntentCandidate.expectedOutputAssetRefs"
    ),
    gapRefs: freezeNonEmptyStrings(input.gapRefs ?? [], "ConstructionIntentCandidate.gapRefs"),
    obligationRefs: freezeNonEmptyStrings(
      input.obligationRefs ?? [],
      "ConstructionIntentCandidate.obligationRefs"
    ),
    lawfulBasisRefs: freezeNonEmptyStrings(
      input.lawfulBasisRefs ?? [],
      "ConstructionIntentCandidate.lawfulBasisRefs"
    ),
    expectedDelta,
    progressCondition,
    stopCondition,
    escalationCondition,
    rejectedAlternativeRefs: freezeNonEmptyStrings(
      input.rejectedAlternativeRefs ?? [],
      "ConstructionIntentCandidate.rejectedAlternativeRefs"
    ),
    rationale,
    hiddenConfigRefs: freezeNonEmptyStrings(
      input.hiddenConfigRefs ?? [],
      "ConstructionIntentCandidate.hiddenConfigRefs"
    ),
    runtimeEventPayloadRefs: freezeNonEmptyStrings(
      input.runtimeEventPayloadRefs ?? [],
      "ConstructionIntentCandidate.runtimeEventPayloadRefs"
    ),
    fdSemanticCanonicalizationRequired:
      input.fdSemanticCanonicalizationRequired ?? false
  });
}

export function admitConstructionIntentCandidate(input: {
  readonly candidate: ConstructionIntentCandidate;
  readonly observation: ConstructionObservationSnapshot;
  readonly actionCatalog: ConstructionActionCatalogProjection;
  readonly bindingProjection: ObservationToActionBindingProjection;
  readonly priorityProjection: ConstructionPriorityProjection;
}): ConstructionIntentAdmission {
  const reasons: string[] = [];
  const candidate = input.candidate;
  if (candidate.episodeId !== input.observation.episodeId) {
    reasons.push("episode_mismatch");
  }
  if (candidate.selectedOutcomeRef.length === 0) {
    reasons.push("missing_target_outcome");
  }
  if (candidate.hiddenConfigRefs.length > 0) {
    reasons.push("hidden_runtime_config");
  }
  if (candidate.runtimeEventPayloadRefs.length > 0) {
    reasons.push("direct_runtime_event_payload");
  }
  if (candidate.fdSemanticCanonicalizationRequired) {
    reasons.push("fd_semantic_canonicalization_without_source_authority");
  }
  const action = input.actionCatalog.rows.find(
    (row) => row.actionRef === candidate.selectedActionRef
  );
  if (action === undefined) {
    reasons.push("action_ref_absent_from_catalog");
  } else {
    if (action.ineligibleReasonRefs.length > 0) {
      reasons.push("action_catalog_row_ineligible");
    }
    if (action.targetOutcomeRef !== candidate.selectedOutcomeRef) {
      reasons.push("selected_outcome_contradicts_action");
    }
    if (
      isConstructiveConstructionActionKind(action.actionKind) &&
      action.graphFunctionRef === null
    ) {
      reasons.push("graph_function_unavailable_from_gtl_truth");
    }
    if (
      action.graphVectorRef !== null &&
      isConstructiveConstructionActionKind(action.actionKind) &&
      action.refinementBoundaryRef === null &&
      action.candidateFamilyRef === null &&
      action.publishedTraversalTargetRef === null
    ) {
      reasons.push("internal_vector_missing_published_traversal_authority");
    }
    if (
      candidate.targetGraphFunctionRef !== null &&
      action.graphFunctionRef !== candidate.targetGraphFunctionRef
    ) {
      reasons.push("target_graph_function_contradicts_catalog");
    }
    if (candidate.targetVectorRef !== null && action.graphVectorRef !== candidate.targetVectorRef) {
      reasons.push("target_vector_contradicts_catalog");
    }
  }
  const binding = input.bindingProjection.rows.find(
    (row) => row.bindingRef === candidate.selectedBindingRef
  );
  if (binding === undefined) {
    reasons.push("candidate_without_observation_action_binding");
  } else {
    if (binding.actionRef !== candidate.selectedActionRef) {
      reasons.push("selected_binding_contradicts_action");
    }
    if (binding.targetOutcomeRef !== candidate.selectedOutcomeRef) {
      reasons.push("selected_binding_contradicts_outcome");
    }
    if (binding.missingInputRefs.length > 0) {
      reasons.push("binding_has_missing_inputs");
    }
    if (binding.ineligibleReasonRefs.length > 0) {
      reasons.push("binding_ineligible");
    }
  }
  const sourceAssets = new Set([
    ...input.observation.linkedAssetRefs,
    ...input.observation.passedInputRefs
  ]);
  for (const assetRef of candidate.inputAssetRefs) {
    if (!sourceAssets.has(assetRef)) {
      reasons.push(`source_asset_not_in_observation:${assetRef}`);
    }
  }
  const priorityRow = input.priorityProjection.rows.find(
    (row) => row.bindingRef === candidate.selectedBindingRef
  );
  if (priorityRow === undefined) {
    reasons.push("priority_row_absent_for_binding");
  } else if (
    action !== undefined &&
    isConstructiveConstructionActionKind(action.actionKind) &&
    priorityRow.terminalDisposition !== "none"
  ) {
    reasons.push("terminal_priority_projection_blocks_invocation");
  }
  const admissionRef = `construction-admission:${candidate.episodeId}:${candidate.candidateId}`;
  if (reasons.length > 0 || action === undefined) {
    return Object.freeze({
      kind: "construction_intent_admission",
      admissionRef,
      candidateId: candidate.candidateId,
      episodeId: candidate.episodeId,
      selectedBindingRef: candidate.selectedBindingRef,
      selectedOutcomeRef: candidate.selectedOutcomeRef,
      candidateRank: candidate.rank,
      iterationOrdinal: input.observation.iterationOrdinal,
      basisProjectionRef: input.observation.basisProjectionRef,
      priorIntentId: input.observation.priorIntentId,
      causationRef: input.observation.causationRef,
      correlationId: input.observation.correlationId,
      decision: "rejected",
      rejectionReasonRefs: freezeStringArray(reasons),
      admittedIntent: null
    });
  }
  const lineageRefs = [
    input.observation.observationId,
    input.actionCatalog.catalogRef,
    input.bindingProjection.projectionRef,
    input.priorityProjection.projectionRef,
    candidate.selectedBindingRef
  ];
  const authorityRefs = [
    ...candidate.lawfulBasisRefs,
    ...action.requiredAuthorityRefs,
    input.observation.authorityDigest
  ];
  return Object.freeze({
    kind: "construction_intent_admission",
    admissionRef,
    candidateId: candidate.candidateId,
    episodeId: candidate.episodeId,
    selectedBindingRef: candidate.selectedBindingRef,
    selectedOutcomeRef: candidate.selectedOutcomeRef,
    candidateRank: candidate.rank,
    iterationOrdinal: input.observation.iterationOrdinal,
    basisProjectionRef: input.observation.basisProjectionRef,
    priorIntentId: input.observation.priorIntentId,
    causationRef: input.observation.causationRef,
    correlationId: input.observation.correlationId,
    decision: "admitted",
    rejectionReasonRefs: Object.freeze([]),
    admittedIntent: Object.freeze({
      kind: "admitted_construction_intent",
      intentId: `construction-intent:${candidate.episodeId}:${candidate.candidateId}`,
      candidateId: candidate.candidateId,
      episodeId: candidate.episodeId,
      selectedActionRef: candidate.selectedActionRef,
      selectedBindingRef: candidate.selectedBindingRef,
      selectedOutcomeRef: candidate.selectedOutcomeRef,
      iterationOrdinal: input.observation.iterationOrdinal,
      basisProjectionRef: input.observation.basisProjectionRef,
      priorIntentId: input.observation.priorIntentId,
      causationRef: input.observation.causationRef,
      selectedGraphFunctionRef: action.graphFunctionRef,
      selectedVectorRef: action.graphVectorRef,
      selectedReentryRef: candidate.targetReentryRef,
      runtimeInvocationPlanRef: isConstructiveConstructionActionKind(action.actionKind)
        ? `runtime-invocation-plan:${candidate.episodeId}:${candidate.candidateId}`
        : null,
      lineageRefs: freezeStringArray(lineageRefs),
      authorityRefs: freezeStringArray(authorityRefs),
      admissionDecisionRef: admissionRef,
      correlationId: input.observation.correlationId
    })
  });
}

export function constructConstructionGraphActionInvokedEvent(input: {
  readonly constructionEventRef: string;
  readonly admittedIntent: AdmittedConstructionIntent;
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly runId: string | null;
  readonly workKey: string | null;
  readonly eventSequence: number;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly continuationId?: string | null;
  readonly causationEventRefs?: readonly string[];
}): ConstructionGraphActionInvokedEvent {
  assertNonEmptyString(
    input.constructionEventRef,
    "ConstructionGraphActionInvokedEvent.constructionEventRef"
  );
  assertNonEmptyString(input.basisId, "ConstructionGraphActionInvokedEvent.basisId");
  assertNonEmptyString(
    input.graphFunctionId,
    "ConstructionGraphActionInvokedEvent.graphFunctionId"
  );
  nullableString(input.runId, "ConstructionGraphActionInvokedEvent.runId");
  nullableString(input.workKey, "ConstructionGraphActionInvokedEvent.workKey");
  assertNonNegativeInteger(
    input.eventSequence,
    "ConstructionGraphActionInvokedEvent.eventSequence"
  );
  assertNonEmptyString(
    input.graphCallId,
    "ConstructionGraphActionInvokedEvent.graphCallId"
  );
  assertNonEmptyString(input.frameId, "ConstructionGraphActionInvokedEvent.frameId");
  const continuationId = nullableString(
    input.continuationId ?? null,
    "ConstructionGraphActionInvokedEvent.continuationId"
  );
  if (
    input.admittedIntent.runtimeInvocationPlanRef === null ||
    input.admittedIntent.selectedGraphFunctionRef === null
  ) {
    throw new TypeError(
      "Admitted construction intent is not invokable through graph action"
    );
  }
  return Object.freeze({
    kind: "construction_graph_action_invoked",
    constructionEventRef: input.constructionEventRef,
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    runId: input.runId,
    workKey: input.workKey,
    episodeId: input.admittedIntent.episodeId,
    iterationOrdinal: input.admittedIntent.iterationOrdinal,
    eventSequence: input.eventSequence,
    basisProjectionRef: input.admittedIntent.basisProjectionRef,
    priorIntentId: input.admittedIntent.priorIntentId,
    causationEventRefs: freezeNonEmptyStrings(
      input.causationEventRefs ?? [input.admittedIntent.admissionDecisionRef],
      "ConstructionGraphActionInvokedEvent.causationEventRefs"
    ),
    correlationId: input.admittedIntent.correlationId,
    intentId: input.admittedIntent.intentId,
    selectedActionRef: input.admittedIntent.selectedActionRef,
    runtimeInvocationPlanRef: input.admittedIntent.runtimeInvocationPlanRef,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    continuationId,
    selectedGraphFunctionRef: input.admittedIntent.selectedGraphFunctionRef,
    selectedVectorRef: input.admittedIntent.selectedVectorRef
  });
}

export function selectAdmittedConstructionIntentByPriority(input: {
  readonly admissions: readonly ConstructionIntentAdmission[];
  readonly priorityProjection: ConstructionPriorityProjection;
}): AdmittedConstructionIntent | null {
  const rankRows = new Map(
    input.priorityProjection.rows.map((row) => [row.bindingRef, row])
  );
  const admitted = input.admissions.filter(
    (admission): admission is ConstructionIntentAdmission & {
      readonly admittedIntent: AdmittedConstructionIntent;
    } => admission.admittedIntent !== null
  );
  if (admitted.length === 0) {
    return null;
  }
  const ranked = admitted.map((admission) => {
    const priorityRow = rankRows.get(admission.selectedBindingRef);
    if (priorityRow === undefined) {
      throw new TypeError(
        `Admitted construction intent ${JSON.stringify(admission.candidateId)} lacks a priority row`
      );
    }
    return Object.freeze({
      admission,
      priorityRow
    });
  });
  ranked.sort((left, right) => {
    if (left.priorityRow.rankOrdinal !== right.priorityRow.rankOrdinal) {
      return left.priorityRow.rankOrdinal - right.priorityRow.rankOrdinal;
    }
    if (left.admission.candidateRank !== right.admission.candidateRank) {
      return left.admission.candidateRank - right.admission.candidateRank;
    }
    const outcomeComparison = left.admission.selectedOutcomeRef.localeCompare(
      right.admission.selectedOutcomeRef
    );
    if (outcomeComparison !== 0) {
      return outcomeComparison;
    }
    const actionComparison =
      left.admission.admittedIntent.selectedActionRef.localeCompare(
        right.admission.admittedIntent.selectedActionRef
      );
    if (actionComparison !== 0) {
      return actionComparison;
    }
    return left.admission.candidateId.localeCompare(right.admission.candidateId);
  });
  return ranked[0]?.admission.admittedIntent ?? null;
}

interface ConstructionProgressOrderRow {
  readonly eventSequence: number;
  readonly iterationOrdinal: number;
  readonly attemptOrdinal: number;
  readonly intentId: string;
  readonly attemptRef: string;
}

function compareConstructionProgressOrder(
  left: ConstructionProgressOrderRow,
  right: ConstructionProgressOrderRow
): number {
  if (left.eventSequence !== right.eventSequence) {
    return left.eventSequence - right.eventSequence;
  }
  if (left.iterationOrdinal !== right.iterationOrdinal) {
    return left.iterationOrdinal - right.iterationOrdinal;
  }
  if (left.attemptOrdinal !== right.attemptOrdinal) {
    return left.attemptOrdinal - right.attemptOrdinal;
  }
  const intentComparison = left.intentId.localeCompare(right.intentId);
  return intentComparison !== 0
    ? intentComparison
    : left.attemptRef.localeCompare(right.attemptRef);
}

export function deriveConstructionProgressLedger(input: {
  readonly episodeId: string;
  readonly rows: readonly ConstructionProgressInputRow[];
}): ConstructionProgressLedger {
  assertNonEmptyString(input.episodeId, "ConstructionProgressLedger.episodeId");
  const rows = input.rows.map((row): ConstructionProgressRow => {
    assertNonNegativeInteger(
      row.iterationOrdinal,
      "ConstructionProgressInputRow.iterationOrdinal"
    );
    assertNonNegativeInteger(
      row.attemptOrdinal,
      "ConstructionProgressInputRow.attemptOrdinal"
    );
    assertNonNegativeInteger(
      row.eventSequence,
      "ConstructionProgressInputRow.eventSequence"
    );
    assertNonEmptyString(row.intentId, "ConstructionProgressInputRow.intentId");
    assertNonEmptyString(row.attemptRef, "ConstructionProgressInputRow.attemptRef");
    assertNonEmptyString(
      row.basisProjectionRef,
      "ConstructionProgressInputRow.basisProjectionRef"
    );
    nullableString(row.priorIntentId, "ConstructionProgressInputRow.priorIntentId");
    assertNonEmptyString(row.causationRef, "ConstructionProgressInputRow.causationRef");
    assertNonEmptyString(row.correlationId, "ConstructionProgressInputRow.correlationId");
    assertNonEmptyString(
      row.beforeProjectionRef,
      "ConstructionProgressInputRow.beforeProjectionRef"
    );
    assertNonEmptyString(
      row.afterProjectionRef,
      "ConstructionProgressInputRow.afterProjectionRef"
    );
    const progressKind = row.closed
      ? "closed"
      : row.artifactDigestBefore !== null &&
          row.artifactDigestAfter !== null &&
          row.artifactDigestBefore !== row.artifactDigestAfter
        ? "new_artifact_digest"
        : row.fulfilledObligationRefs.length > 0
          ? "fulfilled_obligation"
          : row.newEvidenceRefs.length > 0
            ? "new_admitted_progress_row"
            : row.blockerBefore !== null &&
                row.blockerAfter !== null &&
                row.blockerBefore !== row.blockerAfter
              ? "narrowed_blocker"
              : row.fhDecisionAccepted
                ? "accepted_fh_decision"
                : row.reentryMoved
                  ? "lawful_reentry_moved"
                  : "no_material_progress";
    const progressRowId = [
      "construction-progress",
      input.episodeId,
      String(row.eventSequence),
      String(row.iterationOrdinal),
      String(row.attemptOrdinal),
      row.intentId,
      row.attemptRef
    ].join(":");
    return Object.freeze({
      kind: "construction_progress_row",
      episodeId: input.episodeId,
      progressRowId,
      iterationOrdinal: row.iterationOrdinal,
      attemptOrdinal: row.attemptOrdinal,
      eventSequence: row.eventSequence,
      intentId: row.intentId,
      attemptRef: row.attemptRef,
      basisProjectionRef: row.basisProjectionRef,
      priorIntentId: nullableString(
        row.priorIntentId,
        "ConstructionProgressInputRow.priorIntentId"
      ),
      causationRef: row.causationRef,
      correlationId: row.correlationId,
      beforeProjectionRef: row.beforeProjectionRef,
      afterProjectionRef: row.afterProjectionRef,
      assetDeltaRefs: freezeNonEmptyStrings(
        row.assetDeltaRefs,
        "ConstructionProgressInputRow.assetDeltaRefs"
      ),
      artifactDigestBefore: nullableString(
        row.artifactDigestBefore,
        "ConstructionProgressInputRow.artifactDigestBefore"
      ),
      artifactDigestAfter: nullableString(
        row.artifactDigestAfter,
        "ConstructionProgressInputRow.artifactDigestAfter"
      ),
      blockerBefore: nullableString(
        row.blockerBefore,
        "ConstructionProgressInputRow.blockerBefore"
      ),
      blockerAfter: nullableString(
        row.blockerAfter,
        "ConstructionProgressInputRow.blockerAfter"
      ),
      fulfilledObligationRefs: freezeNonEmptyStrings(
        row.fulfilledObligationRefs,
        "ConstructionProgressInputRow.fulfilledObligationRefs"
      ),
      remainingObligationRefs: freezeNonEmptyStrings(
        row.remainingObligationRefs,
        "ConstructionProgressInputRow.remainingObligationRefs"
      ),
      newEvidenceRefs: freezeNonEmptyStrings(
        row.newEvidenceRefs,
        "ConstructionProgressInputRow.newEvidenceRefs"
      ),
      progressKind,
      stagnationReason:
        progressKind === "no_material_progress" ? "same_blocker_and_same_digest" : null
    });
  });
  return Object.freeze({
    kind: "construction_progress_ledger",
    episodeId: input.episodeId,
    rows: Object.freeze(rows.sort(compareConstructionProgressOrder))
  });
}

export function deriveConstructionProjection(input: {
  readonly episodeId: string;
  readonly priorityProjection: ConstructionPriorityProjection;
  readonly admissions?: readonly ConstructionIntentAdmission[];
  readonly actionCatalog?: ConstructionActionCatalogProjection;
  readonly progressLedger?: ConstructionProgressLedger;
  readonly sourceProjectionRefs?: readonly string[];
}): ConstructionProjection {
  assertNonEmptyString(input.episodeId, "ConstructionProjection.episodeId");
  if (input.priorityProjection.episodeId !== input.episodeId) {
    throw new TypeError("ConstructionProjection priority projection episode mismatch");
  }
  const latestProgress = input.progressLedger?.rows.at(-1);
  if (latestProgress !== undefined) {
    if (latestProgress.progressKind === "closed") {
      return constructConstructionProjection({
        episodeId: input.episodeId,
        publicState: "construction_closed",
        nextActionRef: null,
        selectedIntentId: latestProgress.intentId,
        terminalRouteRefs: [],
        reviewReasonRefs: [],
        sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
      });
    }
    if (latestProgress.progressKind === "no_material_progress") {
      return constructConstructionProjection({
        episodeId: input.episodeId,
        publicState: "construction_stalled",
        nextActionRef: null,
        selectedIntentId: latestProgress.intentId,
        terminalRouteRefs: [],
        reviewReasonRefs: [latestProgress.progressRowId],
        sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
      });
    }
  }
  const firstPriorityRow = input.priorityProjection.rows[0];
  if (firstPriorityRow !== undefined && firstPriorityRow.terminalDisposition !== "none") {
    const publicState: ConstructionProjectionState =
      firstPriorityRow.terminalDisposition === "escalate"
        ? "construction_escalated"
        : firstPriorityRow.terminalDisposition === "request_fh_input"
          ? "fh_input_required"
          : "construction_review_required";
    return constructConstructionProjection({
      episodeId: input.episodeId,
      publicState,
      nextActionRef: firstPriorityRow.actionRef,
      selectedIntentId: null,
      terminalRouteRefs:
        firstPriorityRow.terminalRouteRef === null ? [] : [firstPriorityRow.terminalRouteRef],
      reviewReasonRefs: firstPriorityRow.reviewReasonRefs,
      sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
    });
  }
  const selectedIntent = selectAdmittedConstructionIntentByPriority({
    admissions: input.admissions ?? [],
    priorityProjection: input.priorityProjection
  });
  if (selectedIntent === null) {
    return constructConstructionProjection({
      episodeId: input.episodeId,
      publicState: "construction_blocked",
      nextActionRef: null,
      selectedIntentId: null,
      terminalRouteRefs: [],
      reviewReasonRefs: [],
      sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
    });
  }
  const action = input.actionCatalog?.rows.find(
    (row) => row.actionRef === selectedIntent.selectedActionRef
  );
  const publicState =
    action === undefined
      ? "construction_progressing_yield"
      : projectionStateForActionKind(action.actionKind);
  return constructConstructionProjection({
    episodeId: input.episodeId,
    publicState,
    nextActionRef: selectedIntent.selectedActionRef,
    selectedIntentId: selectedIntent.intentId,
    terminalRouteRefs: [],
    reviewReasonRefs: [],
    sourceProjectionRefs: input.sourceProjectionRefs ?? [input.priorityProjection.projectionRef]
  });
}

function constructConstructionProjection(input: {
  readonly episodeId: string;
  readonly publicState: ConstructionProjectionState;
  readonly nextActionRef: string | null;
  readonly selectedIntentId: string | null;
  readonly terminalRouteRefs: readonly string[];
  readonly reviewReasonRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
}): ConstructionProjection {
  assertAllowedString(
    input.publicState,
    CONSTRUCTION_PROJECTION_STATE_VALUES,
    "ConstructionProjection.publicState"
  );
  return Object.freeze({
    kind: "construction_projection",
    projectionRef: `construction-projection:${input.episodeId}:${input.publicState}:${stableDigest(input)}`,
    episodeId: input.episodeId,
    publicState: input.publicState,
    nextActionRef: nullableString(input.nextActionRef, "ConstructionProjection.nextActionRef"),
    selectedIntentId: nullableString(
      input.selectedIntentId,
      "ConstructionProjection.selectedIntentId"
    ),
    terminalRouteRefs: freezeNonEmptyStrings(
      input.terminalRouteRefs,
      "ConstructionProjection.terminalRouteRefs"
    ),
    reviewReasonRefs: freezeNonEmptyStrings(
      input.reviewReasonRefs,
      "ConstructionProjection.reviewReasonRefs"
    ),
    sourceProjectionRefs: freezeNonEmptyStrings(
      input.sourceProjectionRefs,
      "ConstructionProjection.sourceProjectionRefs"
    )
  });
}

export function deriveConstructionProjectionSummary(
  projection: ConstructionProjection
): ConstructionProjectionSummary {
  return Object.freeze({
    kind: "construction_projection_summary",
    projectionRef: projection.projectionRef,
    episodeId: projection.episodeId,
    publicState: projection.publicState,
    nextActionRef: projection.nextActionRef,
    selectedIntentId: projection.selectedIntentId,
    terminalRouteRefs: freezeStringArray(projection.terminalRouteRefs),
    reviewReasonRefs: freezeStringArray(projection.reviewReasonRefs),
    sourceProjectionRefs: freezeStringArray(projection.sourceProjectionRefs)
  });
}

export function assertConstructionProjectionSummaryAgreement(input: {
  readonly projection: ConstructionProjection;
  readonly summary: ConstructionProjectionSummary;
}): void {
  if (input.projection.projectionRef !== input.summary.projectionRef) {
    throw new TypeError("Construction projection summary projectionRef mismatch");
  }
  if (input.projection.episodeId !== input.summary.episodeId) {
    throw new TypeError("Construction projection summary episodeId mismatch");
  }
  if (input.projection.publicState !== input.summary.publicState) {
    throw new TypeError("Construction projection summary publicState mismatch");
  }
  if (input.projection.nextActionRef !== input.summary.nextActionRef) {
    throw new TypeError("Construction projection summary nextActionRef mismatch");
  }
  if (input.projection.selectedIntentId !== input.summary.selectedIntentId) {
    throw new TypeError("Construction projection summary selectedIntentId mismatch");
  }
  if (
    input.projection.terminalRouteRefs.join("\n") !==
    input.summary.terminalRouteRefs.join("\n")
  ) {
    throw new TypeError("Construction projection summary terminalRouteRefs mismatch");
  }
  if (
    input.projection.reviewReasonRefs.join("\n") !==
    input.summary.reviewReasonRefs.join("\n")
  ) {
    throw new TypeError("Construction projection summary reviewReasonRefs mismatch");
  }
  if (
    input.projection.sourceProjectionRefs.join("\n") !==
    input.summary.sourceProjectionRefs.join("\n")
  ) {
    throw new TypeError("Construction projection summary sourceProjectionRefs mismatch");
  }
}

function duplicatedSerializedAttrKeys(attrs: SerializedAttrs): readonly string[] {
  const keys = attrs.entries.map((entry) => entry.key);
  return Object.freeze(
    Array.from(new Set(keys.filter((key, index) => keys.indexOf(key) !== index)))
  );
}

function serializedJsonValueToPlain(value: SerializedJsonValue): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value.kind === "array") {
    return Object.freeze(value.items.map(serializedJsonValueToPlain));
  }
  return Object.freeze(
    Object.fromEntries(
      value.entries.map((entry) => [
        entry.key,
        serializedJsonValueToPlain(entry.value)
      ])
    )
  );
}

function serializedAttrValueToPlain(value: SerializedAttrValue): unknown {
  if (value.kind === "scalar") {
    return value.value;
  }
  if (value.kind === "string_list") {
    return freezeStringArray(value.value);
  }
  if (value.kind === "json_blob") {
    return serializedJsonValueToPlain(value.value);
  }
  return Object.freeze({
    ref: value.value.ref,
    config: serializedAttrsToPlainRecord(value.value.config, "HookRef.config")
  });
}

function serializedAttrsToPlainRecord(
  attrs: SerializedAttrs,
  label: string
): Readonly<Record<string, unknown>> {
  const duplicateKeys = duplicatedSerializedAttrKeys(attrs);
  if (duplicateKeys.length > 0) {
    throw new TypeError(
      `${label} contains duplicate attr keys ${JSON.stringify(duplicateKeys)}`
    );
  }
  return Object.freeze(
    Object.fromEntries(
      attrs.entries.map((entry) => [
        entry.key,
        serializedAttrValueToPlain(entry.value)
      ])
    )
  );
}

function attrValueForConstructionHook(
  attrs: SerializedAttrs,
  label: string
): SerializedAttrValue | null {
  const matches = attrs.entries.filter((entry) => entry.key === CONSTRUCTION_HOOK_KEY);
  if (matches.length > 1) {
    throw new TypeError(
      `${label} contains duplicate ${CONSTRUCTION_HOOK_KEY} hook declarations`
    );
  }
  return matches[0]?.value ?? null;
}

function concernsFromConstructionHookConfig(
  attrs: SerializedAttrs,
  label: string
): readonly string[] {
  const matches = attrs.entries.filter((entry) => entry.key === "concerns");
  if (matches.length > 1) {
    throw new TypeError(`${label}.config contains duplicate concerns declarations`);
  }
  const concerns = matches[0]?.value;
  if (concerns === undefined) {
    return Object.freeze([CONSTRUCTION_HOOK_KEY]);
  }
  if (concerns.kind !== "string_list") {
    throw new TypeError(`${label}.config.concerns must be a string_list attr`);
  }
  return freezeNonEmptyStrings(concerns.value, `${label}.config.concerns`);
}

function constructionHookDeclarationFromAttrs(input: {
  readonly attrs: SerializedAttrs;
  readonly sourceRef: string;
  readonly label: string;
}): ConstructionHookDeclaration | null {
  const attrValue = attrValueForConstructionHook(input.attrs, input.label);
  if (attrValue === null) {
    return null;
  }
  if (attrValue.kind !== "hook_ref") {
    throw new TypeError(`${input.label}.${CONSTRUCTION_HOOK_KEY} must be a hook_ref attr`);
  }
  return Object.freeze({
    hookRef: attrValue.value.ref,
    sourceRef: input.sourceRef,
    concerns: concernsFromConstructionHookConfig(attrValue.value.config, input.label),
    config: serializedAttrsToPlainRecord(attrValue.value.config, `${input.label}.config`)
  });
}

function maybeConstructionHookDeclaration(input: {
  readonly attrs: SerializedAttrs | undefined;
  readonly sourceRef: string | undefined;
  readonly label: string;
}): readonly ConstructionHookDeclaration[] {
  if (input.attrs === undefined || input.sourceRef === undefined) {
    return Object.freeze([]);
  }
  const declaration = constructionHookDeclarationFromAttrs({
    attrs: input.attrs,
    sourceRef: input.sourceRef,
    label: input.label
  });
  return declaration === null ? Object.freeze([]) : Object.freeze([declaration]);
}

function resolveHookSlot(input: {
  readonly source: ConstructionHookSource;
  readonly declarations: readonly ConstructionHookDeclaration[];
}): ConstructionHookDeclaration | null {
  if (input.declarations.length > 1) {
    throw new TypeError(`Duplicate ${input.source} construction hook declarations`);
  }
  const declaration = input.declarations[0];
  if (declaration === undefined) {
    return null;
  }
  assertNonEmptyString(declaration.hookRef, "ConstructionHookDeclaration.hookRef");
  assertNonEmptyString(declaration.sourceRef, "ConstructionHookDeclaration.sourceRef");
  freezeNonEmptyStrings(
    declaration.concerns,
    "ConstructionHookDeclaration.concerns"
  );
  return declaration;
}

export function resolveConstructionHookDeclaration(input: {
  readonly graphVectorDeclarations?: readonly ConstructionHookDeclaration[];
  readonly graphFunctionDeclarations?: readonly ConstructionHookDeclaration[];
  readonly jobPolicyDeclarations?: readonly ConstructionHookDeclaration[];
  readonly rolePolicyDeclarations?: readonly ConstructionHookDeclaration[];
  readonly modulePolicyDeclarations?: readonly ConstructionHookDeclaration[];
  readonly installedFallback: ConstructionHookDeclaration;
}): ConstructionHookResolution {
  const slots: readonly {
    readonly source: ConstructionHookSource;
    readonly declarations: readonly ConstructionHookDeclaration[];
  }[] = Object.freeze([
    {
      source: "graph_vector",
      declarations: input.graphVectorDeclarations ?? []
    },
    {
      source: "graph_function",
      declarations: input.graphFunctionDeclarations ?? []
    },
    {
      source: "job_policy",
      declarations: input.jobPolicyDeclarations ?? []
    },
    {
      source: "role_policy",
      declarations: input.rolePolicyDeclarations ?? []
    },
    {
      source: "module_policy",
      declarations: input.modulePolicyDeclarations ?? []
    },
    {
      source: "installed_fallback",
      declarations: Object.freeze([input.installedFallback])
    }
  ]);
  const slot = slots.find((candidate) => resolveHookSlot(candidate) !== null);
  if (slot !== undefined) {
    const declaration = resolveHookSlot(slot);
    if (declaration !== null) {
      return Object.freeze({
        kind: "construction_hook_resolution",
        resolutionRef: `construction-hook-resolution:${slot.source}:${declaration.sourceRef}:${declaration.hookRef}`,
        hookKey: CONSTRUCTION_HOOK_KEY,
        source: slot.source,
        sourceRef: declaration.sourceRef,
        hookRef: declaration.hookRef,
        concerns: freezeStringArray(declaration.concerns),
        config: declaration.config,
        configDigest: stableDigest(declaration.config),
        fallbackUsed: slot.source === "installed_fallback"
      });
    }
  }
  throw new TypeError("Installed construction hook fallback is required");
}

export function resolveConstructionHookDeclarationFromGtl(input: {
  readonly graphVector?: GraphVector | null;
  readonly graphFunction?: GraphFunction | null;
  readonly job?: Job | null;
  readonly role?: Role | null;
  readonly module?: Module | null;
  readonly installedFallback: ConstructionHookDeclaration;
}): ConstructionHookResolution {
  return resolveConstructionHookDeclaration({
    graphVectorDeclarations: maybeConstructionHookDeclaration({
      attrs: input.graphVector?.declarations,
      sourceRef: input.graphVector?.id,
      label: "GraphVector.declarations"
    }),
    graphFunctionDeclarations: maybeConstructionHookDeclaration({
      attrs: input.graphFunction?.declarations,
      sourceRef: input.graphFunction?.id,
      label: "GraphFunction.declarations"
    }),
    jobPolicyDeclarations: maybeConstructionHookDeclaration({
      attrs: input.job?.policyHooks,
      sourceRef: input.job?.id,
      label: "Job.policyHooks"
    }),
    rolePolicyDeclarations: maybeConstructionHookDeclaration({
      attrs: input.role?.policyHooks,
      sourceRef: input.role?.id,
      label: "Role.policyHooks"
    }),
    modulePolicyDeclarations: maybeConstructionHookDeclaration({
      attrs: input.module?.policyHooks,
      sourceRef:
        input.module === null || input.module === undefined
          ? undefined
          : `module:${input.module.name}`,
      label: "Module.policyHooks"
    }),
    installedFallback: input.installedFallback
  });
}
