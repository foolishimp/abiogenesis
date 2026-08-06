import type {
  FanOutApplication,
  GtlGraph,
  ReenterApplication,
  RecurseApplication,
} from "../gtl/contracts.js";
import {
  graphFunctionApplicationRef,
  recursionTerminationDecision,
} from "../gtl/graph_applications.js";
import {
  deriveCBatchTaskInput,
  deriveCContinuationTarget,
  deriveCSourceContinuation,
  resolveCProgramLocus,
  resolveEnclosingCRetryContexts,
  resolveCProgramTermAtSourcePath,
} from "../gtl/source_path.js";
import { isInteractionCLeaf } from "../gtl/c_algebra.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  hasCurrentAdmittedCCallOutcome,
  hasOpenedCCall,
  projectOpenedCCallCarrier,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type CCall,
} from "./c_call.js";
import {
  type FanOutCompletionAdmission,
} from "./fan_out.js";
import { projectExactFanOutCompletion } from "./fan_out_projection.js";
import type { FhInteractionResumeAdmission } from "./continuation.js";
import {
  isAdmittedApplicationChildFoldback,
  isAdmittedApplicationChildPreparationRefusal,
  type ApplicationChildFoldbackAdmission,
  type ApplicationChildPreparationRefusalAdmission,
} from "./graph_application.js";
import {
  admittedConstructionComposition as admittedBasisConstructionComposition,
  hasAdmittedExecutionBasis,
  selectAdmittedConstructionAuthority,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventBatch,
  type RuntimeEvent,
} from "./event_store.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
} from "./event_calculus.js";
import { replay, type ReplayState } from "./replay.js";
import {
  hasAdmittedRetryProgress,
  projectAdmittedRetryProgress,
  type RetryCompletedProgressAdmission,
  type RetryProgressAdmission,
  type RetryStoppedProgressAdmission,
} from "./retry.js";
import {
  hasAdmittedTraversalCursor,
  isTraversalCursorCandidate,
  traversalCursorAdmissionEventRef,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export type TraversalRouteKind =
  | "advance"
  | "re_enter"
  | "retry"
  | "hold"
  | "gap_stop"
  | "blocked"
  | "failed"
  | "terminal";

export interface RouteCandidate {
  readonly kind: "traversal_route_candidate";
  readonly schemaVersion: "5.0.0";
  readonly candidateRef: string;
  readonly candidateDigest: Sha256Digest;
  readonly routeKind: TraversalRouteKind;
  readonly declarationRef: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly consumedAvailabilityRefs: readonly string[];
  readonly contractRef: string | null;
  readonly replayStateDigest: Sha256Digest;
  readonly nextActionProjectionRef?: string;
  readonly nextActionProjectionDigest?: Sha256Digest;
  readonly nextActionProjection?: Readonly<Record<string, JsonValue>>;
  readonly graphSpanReentryProjectionRef?: string;
  readonly graphSpanReentryProjectionDigest?: Sha256Digest;
  readonly graphSpanReentryProjection?: Readonly<Record<string, JsonValue>>;
}

export interface AdmittedRoute {
  readonly kind: "admitted_traversal_route";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly routeRef: string;
  readonly routeDigest: Sha256Digest;
  readonly routeKind: TraversalRouteKind;
  readonly declarationRef: string;
  readonly declarationDigest: Sha256Digest;
  readonly sourceCursorRef: string;
  readonly sourceCursorDigest: Sha256Digest;
  readonly targetCursorRef: string | null;
  readonly targetCursorDigest: Sha256Digest | null;
  readonly cCallRef: string | null;
  readonly judgmentRef: string | null;
  readonly consumedAvailabilityRefs: readonly string[];
  readonly contractRef: string | null;
  readonly replayStateDigest: Sha256Digest;
  readonly constructionIntentRef: string | null;
  readonly constructionIntentDigest: Sha256Digest | null;
  readonly constructionIntentAdmissionEventRef: string | null;
  readonly admissionEventRef: string;
  readonly runStoppedEventRef: string | null;
  readonly nextActionProjectionRef?: string;
  readonly nextActionProjectionDigest?: Sha256Digest;
  readonly nextActionProjection?: NextActionProjection;
  readonly graphSpanReentryProjectionRef?: string;
  readonly graphSpanReentryProjectionDigest?: Sha256Digest;
  readonly graphSpanReentryProjection?: GraphSpanReentryProjection;
}

export interface GraphSpanReentryProjection {
  readonly kind: "graph_span_selection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "re_enter";
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly applicationRef: string;
  readonly graphFunctionRef: string;
  readonly sourceProgramLocusRef: string;
  readonly targetProgramLocusRef: string;
  readonly targetInputRef: string;
  readonly targetInputDigest: Sha256Digest;
  readonly targetInput: Readonly<Record<string, JsonValue>>;
}

export interface SelectedNextActionProjection {
  readonly kind: "next_action_projection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "selected";
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly targetOutcomeRef: string;
  readonly selectedActionRef: string;
  readonly actionKind: string;
  readonly programRef: string;
  readonly graphFunctionRef: string;
  readonly targetProgramLocusRef: string;
  readonly targetObligationRefs: readonly string[];
  readonly targetObligationBindings: readonly Readonly<
    Record<string, JsonValue>
  >[];
  readonly priorityProjection: Readonly<Record<string, JsonValue>>;
  readonly inputAssetRefs: readonly string[];
  readonly outputAssetRefs: readonly string[];
  readonly gapRef: string;
  readonly expectedDeltaRef: string;
  readonly progressConditionRef: string;
  readonly stopConditionRef: string;
  readonly lawfulBasisRefs: readonly string[];
  readonly rejectedAlternativeRefs: readonly string[];
  readonly nextActionBasisRef: string;
  readonly nextActionBasisDigest: Sha256Digest;
}

export interface NoActionNextActionProjection {
  readonly kind: "next_action_projection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "no_action";
  readonly noActionDisposition: NoActionDisposition;
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly targetOutcomeRef: string;
  readonly programRef: string;
  readonly gapRef: string;
  readonly targetObligationRefs: readonly string[];
  readonly targetObligationBindings: readonly Readonly<
    Record<string, JsonValue>
  >[];
  readonly priorityProjection: Readonly<Record<string, JsonValue>>;
  readonly missingAssetRefs: readonly string[];
  readonly reasonRef: string;
  readonly lawfulBasisRefs: readonly string[];
  readonly rejectedActionRefs: readonly string[];
  readonly nextActionBasisRef: string;
  readonly nextActionBasisDigest: Sha256Digest;
}

export type NoActionDisposition =
  | "gap_stop"
  | "reprice_required"
  | "repair"
  | "inspect_runtime_archive"
  | "reprice"
  | "escalate";

const NO_ACTION_DISPOSITIONS = Object.freeze([
  "gap_stop",
  "reprice_required",
  "repair",
  "inspect_runtime_archive",
  "reprice",
  "escalate",
] as const satisfies readonly NoActionDisposition[]);

export type NextActionProjection =
  | NoActionNextActionProjection
  | SelectedNextActionProjection;

export interface ConstructionIntent {
  readonly kind: "construction_intent";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly constructionIntentRef: string;
  readonly constructionIntentDigest: Sha256Digest;
  readonly nextActionProjectionRef: string;
  readonly nextActionProjectionDigest: Sha256Digest;
  readonly nextActionBasisRef: string;
  readonly nextActionBasisDigest: Sha256Digest;
  readonly targetOutcomeRef: string;
  readonly selectedActionRef: string;
  readonly actionKind: string;
  readonly selectedGraphFunctionRef: string;
  readonly targetProgramLocusRef: string;
  readonly targetInputRef: string | null;
  readonly targetInputDigest: Sha256Digest | null;
  readonly targetInput: Readonly<Record<string, JsonValue>> | null;
  readonly targetObligationRefs: readonly string[];
  readonly inputAssetRefs: readonly string[];
  readonly outputAssetRefs: readonly string[];
  readonly expectedDeltaRef: string;
  readonly progressConditionRef: string;
  readonly stopConditionRef: string;
  readonly actionCatalogRef: string;
  readonly actionCatalogDigest: Sha256Digest;
  readonly actionCatalogRowDigest: Sha256Digest;
  readonly constructionCompositionRef: string;
  readonly constructionCompositionDigest: Sha256Digest;
  readonly nextActionAuthorityRef: string;
  readonly workspaceBindingId: string;
  readonly workspaceBindingDigest: Sha256Digest;
  readonly invocationAdmissionRef: string;
  readonly invocationRef: string;
  readonly invocationDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly executionBasisRef: string;
  readonly executionBasisDigest: Sha256Digest;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly sourceCCallRef: string;
  readonly sourceResultRef: string;
  readonly sourceResultDigest: Sha256Digest;
  readonly sourceJudgmentRef: string;
  readonly targetCursorRef: string;
  readonly targetCursorDigest: Sha256Digest;
}

export interface ConstructionIntentAdmission extends ConstructionIntent {
  readonly admissionEventRef: string;
}

interface EdgeFulfillmentLedgerRow {
  readonly obligationRef: string;
  readonly evidenceRefs: readonly string[];
  readonly evidenceAssetRefs: readonly string[];
  readonly disposition: "fulfilled";
}

interface EdgeFulfillmentLedger {
  readonly kind: "edge_fulfillment_ledger";
  readonly schemaVersion: "5.0.0";
  readonly ledgerRef: string;
  readonly ledgerDigest: Sha256Digest;
  readonly constructionIntentRef: string;
  readonly targetOutcomeRef: string;
  readonly rows: readonly EdgeFulfillmentLedgerRow[];
}

interface EdgeClosureDecision {
  readonly kind: "edge_closure_decision";
  readonly schemaVersion: "5.0.0";
  readonly decisionRef: string;
  readonly decisionDigest: Sha256Digest;
  readonly constructionIntentRef: string;
  readonly targetOutcomeRef: string;
  readonly ledgerRef: string;
  readonly disposition: "close_candidate" | "continue_candidate";
  readonly correctionDisposition:
    | "repair"
    | "inspect_runtime_archive"
    | "reprice"
    | "escalate"
    | null;
}

interface ActionEvaluationProjection {
  readonly kind: "action_evaluation_projection";
  readonly schemaVersion: "5.0.0";
  readonly actionEvaluationRef: string;
  readonly actionEvaluationDigest: Sha256Digest;
  readonly actionEvaluationBasisRef: string;
  readonly actionEvaluationBasisDigest: Sha256Digest;
  readonly constructionIntentRef: string;
  readonly targetOutcomeRef: string;
  readonly admittedEvidenceRefs: readonly string[];
  readonly semanticEvidenceAssetRefs: readonly string[];
  readonly observationSnapshot: Readonly<Record<string, JsonValue>>;
  readonly runtimeArchiveInspection:
    | Readonly<Record<string, JsonValue>>
    | null;
  readonly edgeFulfillmentLedger: EdgeFulfillmentLedger;
  readonly edgeClosureDecision: EdgeClosureDecision;
}

interface ConvergedNextActionProjection {
  readonly kind: "next_action_projection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "converged";
  readonly projectionRef: string;
  readonly projectionDigest: Sha256Digest;
  readonly constructionIntentRef: string;
  readonly targetOutcomeRef: string;
  readonly gapRef: string;
  readonly edgeClosureDecisionRef: string;
  readonly nextActionBasisRef: string;
  readonly nextActionBasisDigest: Sha256Digest;
  readonly targetObligationBindings: readonly Readonly<
    Record<string, JsonValue>
  >[];
  readonly priorityProjection: Readonly<Record<string, JsonValue>>;
  readonly lawfulBasisRefs: readonly string[];
}

export interface RouteAdmissionRefusal {
  readonly kind: "traversal_route_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "basis_mismatch"
    | "candidate_mismatch"
    | "cursor_mismatch"
    | "gap_environment_mismatch"
    | "gap_projection_mismatch"
    | "gap_semantics_mismatch"
    | "graph_span_reentry_mismatch"
    | "judgment_mismatch"
    | "replay_mismatch"
    | "route_already_admitted"
    | "route_kind_not_supported"
    | "terminal_not_declared";
  readonly message: string;
}

export type RouteAdmissionResult = AdmittedRoute | RouteAdmissionRefusal;

export interface RouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly completedProgresses?: readonly RetryCompletedProgressAdmission[];
}

export interface BlockedRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly judgmentEventRef: string;
  readonly reasonRef: string;
  readonly stoppedProgresses?: readonly RetryStoppedProgressAdmission[];
}

export interface HoldRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
}

export interface InteractionResumeRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly resume: FhInteractionResumeAdmission;
  readonly completedProgresses?: readonly RetryCompletedProgressAdmission[];
}

export interface RetryRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly progress: RetryProgressAdmission;
}

export interface FanOutRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly application: Readonly<FanOutApplication>;
  readonly completion: FanOutCompletionAdmission;
  readonly completedProgresses?: readonly RetryCompletedProgressAdmission[];
}

export interface StructuralIdentityRouteAdmissionEvidence {
  readonly completionClass: "structural_identity_success";
  readonly completionWitnessEventRef: string;
  readonly completedProgresses: readonly RetryCompletedProgressAdmission[];
}

export interface RouteAdmissionOptions {
  readonly terminalizeRun?: boolean;
}

export interface RecursionRouteAdmissionEvidence {
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly foldback: ApplicationChildFoldbackAdmission | null;
  readonly preparationRefusal?:
    | ApplicationChildPreparationRefusalAdmission
    | null;
}

const admittedRoutes = new WeakSet<object>();

export function isAdmittedRoute(value: object): boolean {
  return admittedRoutes.has(value);
}

export function isCurrentRecursionRouteSource(
  store: AbgEventStore,
  coordinates: Readonly<{
    runId: string;
    frameId: string;
    sourceCursorRef: string;
  }>,
): boolean {
  if (
    coordinates.runId.length === 0 ||
    coordinates.frameId.length === 0 ||
    coordinates.sourceCursorRef.length === 0
  ) {
    return false;
  }
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: coordinates.runId,
  });
  const projection = deriveRuntimeEventCalculusProjection(prefix);
  return holdsAt(
    projection,
    constructRuntimeFluent({
      name: "run_active",
      identity: coordinates.runId,
    }),
  ) && holdsAt(
    projection,
    constructRuntimeFluent({
      name: "frame_active",
      identity: coordinates.frameId,
    }),
  ) && holdsAt(
    projection,
    constructRuntimeFluent({
      name: "locus_active",
      identity: coordinates.sourceCursorRef,
    }),
  );
}

export function projectAdmittedRecursionRoute(
  store: AbgEventStore,
  coordinates: Readonly<{ runId: string; routeRef: string }>,
): AdmittedRoute | null {
  if (coordinates.runId.length === 0 || coordinates.routeRef.length === 0) {
    return null;
  }
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: coordinates.runId,
  });
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const eventCalculus = deriveRuntimeEventCalculusProjection(prefix);
  const projectedReplay = replay(store, { runId: coordinates.runId });
  const projected = projectedReplay.routes.find(
    (candidate) => candidate.routeRef === coordinates.routeRef,
  );
  const event = events.find(
    (candidate) =>
      candidate.kind === "traversal_route_admitted" &&
      isJsonRecord(candidate.payload) &&
      candidate.payload.routeRef === coordinates.routeRef,
  );
  if (
    projected === undefined ||
    event === undefined ||
    !isJsonRecord(event.payload) ||
    (projected.routeKind !== "advance" && projected.routeKind !== "blocked") ||
    !projected.declarationRef.startsWith(
      "graph-function-application://abiogenesis/",
    ) ||
    projected.cCallRef === null ||
    projected.judgmentRef === null ||
    projected.contractRef === null ||
    projected.consumedAvailabilityRefs === null ||
    projected.replayStateDigest === null
  ) {
    return null;
  }
  const { routeRef, routeDigest, ...body } = event.payload;
  if (
    routeRef !== coordinates.routeRef ||
    typeof routeDigest !== "string" ||
    routeDigest !== sha256Canonical(body as unknown as JsonValue) ||
    routeRef !==
      `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}` ||
    projected.routeDigest !== routeDigest ||
    projected.routeKind !== body.routeKind ||
    projected.declarationRef !== body.declarationRef ||
    projected.declarationDigest !== body.declarationDigest ||
    projected.sourceCursorRef !== body.sourceCursorRef ||
    projected.sourceCursorDigest !== body.sourceCursorDigest ||
    projected.targetCursorRef !== body.targetCursorRef ||
    projected.targetCursorDigest !== body.targetCursorDigest ||
    projected.cCallRef !== body.cCallRef ||
    projected.judgmentRef !== body.judgmentRef ||
    sha256Canonical(
      projected.consumedAvailabilityRefs as unknown as JsonValue,
    ) !== sha256Canonical(body.consumedAvailabilityRefs ?? null) ||
    projected.contractRef !== body.contractRef ||
    projected.replayStateDigest !== body.replayStateDigest ||
    holdsAt(
      eventCalculus,
      constructRuntimeFluent({
        name: "locus_active",
        identity: projected.sourceCursorRef,
      }),
    ) ||
    (
      projected.routeKind === "advance" &&
      (
        !holdsAt(
          eventCalculus,
          constructRuntimeFluent({
            name: "run_active",
            identity: coordinates.runId,
          }),
        ) ||
        typeof event.frameId !== "string" ||
        event.frameId.length === 0 ||
        !holdsAt(
          eventCalculus,
          constructRuntimeFluent({
            name: "frame_active",
            identity: event.frameId,
          }),
        ) ||
        projected.targetCursorRef === null ||
        !holdsAt(
          eventCalculus,
          constructRuntimeFluent({
            name: "locus_active",
            identity: projected.targetCursorRef,
          }),
        )
      )
    ) ||
    (
      projected.routeKind === "blocked" &&
      (
        !holdsAt(
          eventCalculus,
          constructRuntimeFluent({
            name: "run_terminal",
            identity: coordinates.runId,
          }),
        ) ||
        holdsAt(
          eventCalculus,
          constructRuntimeFluent({
            name: "run_active",
            identity: coordinates.runId,
          }),
        )
      )
    )
  ) {
    return null;
  }
  const runStoppedEventRef = projected.routeKind === "blocked"
    ? events.find(
        (candidate) =>
          candidate.kind === "run_stopped" &&
          candidate.causationEventRefs.includes(event.eventId) &&
          isJsonRecord(candidate.payload) &&
          candidate.payload.routeRef === routeRef,
      )?.eventId ?? null
    : null;
  if (projected.routeKind === "blocked" && runStoppedEventRef === null) {
    return null;
  }
  return deepFreeze({
    kind: "admitted_traversal_route" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    routeRef,
    routeDigest,
    ...body,
    constructionIntentRef: null,
    constructionIntentDigest: null,
    constructionIntentAdmissionEventRef: null,
    admissionEventRef: event.eventId,
    runStoppedEventRef,
  }) as unknown as AdmittedRoute;
}

export function isCurrentAdmittedRecursionRoute(
  store: AbgEventStore,
  route: AdmittedRoute,
): boolean {
  const events = runtimeEventsFromValidatedPrefix(
    selectValidatedRuntimeEventPrefix(store.readAll()),
  );
  const event = events.find(
    (candidate) => candidate.eventId === route.admissionEventRef,
  );
  const projected = projectAdmittedRecursionRoute(store, {
    runId: event?.runId ?? "",
    routeRef: route.routeRef,
  });
  return projected !== null &&
    sha256Canonical(projected as unknown as JsonValue) ===
      sha256Canonical(route as unknown as JsonValue);
}

function refusal(
  code: RouteAdmissionRefusal["code"],
  message: string,
): RouteAdmissionRefusal {
  return {
    kind: "traversal_route_admission_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    code,
    message,
  };
}

function candidateBody(
  candidate: RouteCandidate,
): Readonly<Record<string, JsonValue>> {
  return {
    routeKind: candidate.routeKind,
    declarationRef: candidate.declarationRef,
    declarationDigest: candidate.declarationDigest,
    sourceCursorRef: candidate.sourceCursorRef,
    sourceCursorDigest: candidate.sourceCursorDigest,
    targetCursorRef: candidate.targetCursorRef,
    targetCursorDigest: candidate.targetCursorDigest,
    cCallRef: candidate.cCallRef,
    judgmentRef: candidate.judgmentRef,
    consumedAvailabilityRefs: candidate.consumedAvailabilityRefs,
    contractRef: candidate.contractRef,
    replayStateDigest: candidate.replayStateDigest,
    ...(candidate.nextActionProjectionRef === undefined
      ? {}
      : {
          nextActionProjectionRef: candidate.nextActionProjectionRef,
          nextActionProjectionDigest:
            candidate.nextActionProjectionDigest!,
          nextActionProjection:
            candidate.nextActionProjection as unknown as JsonValue,
        }),
    ...(candidate.graphSpanReentryProjectionRef === undefined
      ? {}
      : {
          graphSpanReentryProjectionRef:
            candidate.graphSpanReentryProjectionRef,
          graphSpanReentryProjectionDigest:
            candidate.graphSpanReentryProjectionDigest!,
          graphSpanReentryProjection:
            candidate.graphSpanReentryProjection as unknown as JsonValue,
        }),
  };
}

function isJsonRecord(
  value: JsonValue | undefined,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const NEXT_ACTION_PROJECTION_KEYS = Object.freeze([
  "actionKind",
  "disposition",
  "expectedDeltaRef",
  "gapRef",
  "graphFunctionRef",
  "inputAssetRefs",
  "kind",
  "lawfulBasisRefs",
  "nextActionBasisDigest",
  "nextActionBasisRef",
  "outputAssetRefs",
  "programRef",
  "progressConditionRef",
  "priorityProjection",
  "projectionDigest",
  "projectionRef",
  "rejectedAlternativeRefs",
  "schemaVersion",
  "selectedActionRef",
  "stopConditionRef",
  "targetObligationRefs",
  "targetObligationBindings",
  "targetOutcomeRef",
  "targetProgramLocusRef",
] as const);

const GRAPH_SPAN_REENTRY_PROJECTION_KEYS = Object.freeze([
  "applicationRef",
  "disposition",
  "graphFunctionRef",
  "kind",
  "projectionDigest",
  "projectionRef",
  "schemaVersion",
  "sourceProgramLocusRef",
  "targetInput",
  "targetInputDigest",
  "targetInputRef",
  "targetProgramLocusRef",
] as const);

function hasExactKeys(
  value: Readonly<Record<string, JsonValue>>,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function graphSpanReentryProjection(
  value: JsonValue,
): GraphSpanReentryProjection | null {
  if (
    !isJsonRecord(value) ||
    !hasExactKeys(value, GRAPH_SPAN_REENTRY_PROJECTION_KEYS) ||
    value.kind !== "graph_span_selection" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "re_enter" ||
    typeof value.projectionRef !== "string" ||
    typeof value.projectionDigest !== "string" ||
    typeof value.applicationRef !== "string" ||
    typeof value.graphFunctionRef !== "string" ||
    typeof value.sourceProgramLocusRef !== "string" ||
    typeof value.targetProgramLocusRef !== "string" ||
    typeof value.targetInputRef !== "string" ||
    typeof value.targetInputDigest !== "string" ||
    !isJsonRecord(value.targetInput)
  ) {
    return null;
  }
  const { projectionRef, projectionDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body);
  const targetInputDigest = sha256Canonical(value.targetInput);
  if (
    projectionDigest !== expectedDigest ||
    projectionRef !==
      `graph-span-reentry-projection://product/${expectedDigest.slice("sha256:".length)}` ||
    value.targetInputDigest !== targetInputDigest ||
    value.targetInputRef !==
      `graph-span-input://product/${targetInputDigest.slice("sha256:".length)}`
  ) {
    return null;
  }
  return value as unknown as GraphSpanReentryProjection;
}

function nonEmptyStringArray(
  value: JsonValue | undefined,
): value is readonly string[] {
  return Array.isArray(value) &&
    value.length > 0 &&
    value.every((entry) => typeof entry === "string" && entry.length > 0) &&
    new Set(value).size === value.length;
}

function stringArray(value: JsonValue | undefined): value is readonly string[] {
  return Array.isArray(value) &&
    value.every((entry) => typeof entry === "string" && entry.length > 0) &&
    new Set(value).size === value.length;
}

function selectedNextActionProjection(
  value: JsonValue,
): SelectedNextActionProjection | null {
  if (
    !isJsonRecord(value) ||
    !hasExactKeys(value, NEXT_ACTION_PROJECTION_KEYS) ||
    value.kind !== "next_action_projection" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "selected" ||
    typeof value.actionKind !== "string" ||
    value.actionKind.length === 0 ||
    typeof value.projectionRef !== "string" ||
    typeof value.projectionDigest !== "string" ||
    typeof value.nextActionBasisRef !== "string" ||
    typeof value.nextActionBasisDigest !== "string" ||
    typeof value.targetOutcomeRef !== "string" ||
    typeof value.selectedActionRef !== "string" ||
    typeof value.programRef !== "string" ||
    typeof value.graphFunctionRef !== "string" ||
    typeof value.targetProgramLocusRef !== "string" ||
    typeof value.gapRef !== "string" ||
    typeof value.expectedDeltaRef !== "string" ||
    typeof value.progressConditionRef !== "string" ||
    typeof value.stopConditionRef !== "string" ||
    !nonEmptyStringArray(value.targetObligationRefs) ||
    !nonEmptyStringArray(value.inputAssetRefs) ||
    !nonEmptyStringArray(value.outputAssetRefs) ||
    !Array.isArray(value.targetObligationBindings) ||
    value.targetObligationBindings.length === 0 ||
    value.targetObligationBindings.some((row) => !isJsonRecord(row)) ||
    !isJsonRecord(value.priorityProjection) ||
    !nonEmptyStringArray(value.lawfulBasisRefs) ||
    !stringArray(value.rejectedAlternativeRefs)
  ) {
    return null;
  }
  const {
    projectionRef,
    projectionDigest,
    ...body
  } = value;
  const expectedDigest = sha256Canonical(body);
  if (
    projectionDigest !== expectedDigest ||
    projectionRef !==
      `next-action-projection://product/${expectedDigest.slice("sha256:".length)}`
  ) {
    return null;
  }
  return value as unknown as SelectedNextActionProjection;
}

const GAP_STOP_PROJECTION_KEYS = Object.freeze([
  "disposition",
  "gapRef",
  "kind",
  "lawfulBasisRefs",
  "missingAssetRefs",
  "nextActionBasisDigest",
  "nextActionBasisRef",
  "noActionDisposition",
  "programRef",
  "priorityProjection",
  "projectionDigest",
  "projectionRef",
  "reasonRef",
  "rejectedActionRefs",
  "schemaVersion",
  "targetObligationRefs",
  "targetObligationBindings",
  "targetOutcomeRef",
] as const);

function noActionNextActionProjection(
  value: JsonValue,
): NoActionNextActionProjection | null {
  if (
    !isJsonRecord(value) ||
    !hasExactKeys(value, GAP_STOP_PROJECTION_KEYS) ||
    value.kind !== "next_action_projection" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "no_action" ||
    !NO_ACTION_DISPOSITIONS.includes(
      value.noActionDisposition as NoActionDisposition,
    ) ||
    typeof value.projectionRef !== "string" ||
    typeof value.projectionDigest !== "string" ||
    typeof value.nextActionBasisRef !== "string" ||
    typeof value.nextActionBasisDigest !== "string" ||
    typeof value.targetOutcomeRef !== "string" ||
    typeof value.programRef !== "string" ||
    typeof value.gapRef !== "string" ||
    typeof value.reasonRef !== "string" ||
    !nonEmptyStringArray(value.targetObligationRefs) ||
    !stringArray(value.missingAssetRefs) ||
    !Array.isArray(value.targetObligationBindings) ||
    value.targetObligationBindings.length === 0 ||
    value.targetObligationBindings.some((row) => !isJsonRecord(row)) ||
    !isJsonRecord(value.priorityProjection) ||
    !nonEmptyStringArray(value.lawfulBasisRefs) ||
    !stringArray(value.rejectedActionRefs)
  ) {
    return null;
  }
  const {
    projectionRef,
    projectionDigest,
    ...body
  } = value;
  const expectedDigest = sha256Canonical(body);
  if (
    projectionDigest !== expectedDigest ||
    projectionRef !==
      `next-action-projection://product/${expectedDigest.slice("sha256:".length)}`
  ) {
    return null;
  }
  return value as unknown as NoActionNextActionProjection;
}

function nextActionBasis(
  value: JsonValue | undefined,
): Readonly<Record<string, JsonValue>> | null {
  if (
    !isJsonRecord(value) ||
    value.kind !== "next_action_basis" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.basisRef !== "string" ||
    typeof value.basisDigest !== "string"
  ) {
    return null;
  }
  const { basisRef, basisDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body);
  return basisDigest === expectedDigest &&
      basisRef ===
        `next-action-basis://product/${expectedDigest.slice("sha256:".length)}`
    ? value
    : null;
}

function edgeFulfillmentLedger(
  value: JsonValue | undefined,
): EdgeFulfillmentLedger | null {
  if (
    !isJsonRecord(value) ||
    !hasExactKeys(value, [
      "constructionIntentRef",
      "kind",
      "ledgerDigest",
      "ledgerRef",
      "rows",
      "schemaVersion",
      "targetOutcomeRef",
    ]) ||
    value.kind !== "edge_fulfillment_ledger" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.ledgerRef !== "string" ||
    typeof value.ledgerDigest !== "string" ||
    typeof value.constructionIntentRef !== "string" ||
    typeof value.targetOutcomeRef !== "string" ||
    !Array.isArray(value.rows) ||
    value.rows.length === 0
  ) {
    return null;
  }
  for (const row of value.rows) {
    if (
      !isJsonRecord(row) ||
      !hasExactKeys(row, [
        "disposition",
        "evidenceRefs",
        "evidenceAssetRefs",
        "obligationRef",
      ]) ||
      row.disposition !== "fulfilled" ||
      typeof row.obligationRef !== "string" ||
      !nonEmptyStringArray(row.evidenceRefs) ||
      !nonEmptyStringArray(row.evidenceAssetRefs)
    ) {
      return null;
    }
  }
  const { ledgerRef, ledgerDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body);
  return ledgerDigest === expectedDigest &&
      ledgerRef ===
        `edge-fulfillment-ledger://product/${expectedDigest.slice("sha256:".length)}`
    ? value as unknown as EdgeFulfillmentLedger
    : null;
}

function edgeClosureDecision(
  value: JsonValue | undefined,
): EdgeClosureDecision | null {
  if (
    !isJsonRecord(value) ||
    !hasExactKeys(value, [
      "correctionDisposition",
      "constructionIntentRef",
      "decisionDigest",
      "decisionRef",
      "disposition",
      "kind",
      "ledgerRef",
      "schemaVersion",
      "targetOutcomeRef",
    ]) ||
    value.kind !== "edge_closure_decision" ||
    value.schemaVersion !== "5.0.0" ||
    (
      value.disposition !== "close_candidate" &&
      value.disposition !== "continue_candidate"
    ) ||
    (
      value.disposition === "close_candidate"
        ? value.correctionDisposition !== null
        : ![
            "repair",
            "inspect_runtime_archive",
            "reprice",
            "escalate",
          ].includes(String(value.correctionDisposition))
    ) ||
    typeof value.decisionRef !== "string" ||
    typeof value.decisionDigest !== "string" ||
    typeof value.constructionIntentRef !== "string" ||
    typeof value.targetOutcomeRef !== "string" ||
    typeof value.ledgerRef !== "string"
  ) {
    return null;
  }
  const { decisionRef, decisionDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body);
  return decisionDigest === expectedDigest &&
      decisionRef ===
        `edge-closure-decision://product/${expectedDigest.slice("sha256:".length)}`
    ? value as unknown as EdgeClosureDecision
    : null;
}

function actionEvaluationProjection(
  value: JsonValue,
): ActionEvaluationProjection | null {
  if (
    !isJsonRecord(value) ||
    !hasExactKeys(value, [
      "actionEvaluationDigest",
      "actionEvaluationRef",
      "actionEvaluationBasisDigest",
      "actionEvaluationBasisRef",
      "admittedEvidenceRefs",
      "constructionIntentRef",
      "edgeClosureDecision",
      "edgeFulfillmentLedger",
      "kind",
      "observationSnapshot",
      "runtimeArchiveInspection",
      "schemaVersion",
      "semanticEvidenceAssetRefs",
      "targetOutcomeRef",
    ]) ||
    value.kind !== "action_evaluation_projection" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.actionEvaluationRef !== "string" ||
    typeof value.actionEvaluationDigest !== "string" ||
    typeof value.actionEvaluationBasisRef !== "string" ||
    typeof value.actionEvaluationBasisDigest !== "string" ||
    typeof value.constructionIntentRef !== "string" ||
    typeof value.targetOutcomeRef !== "string" ||
    !nonEmptyStringArray(value.admittedEvidenceRefs) ||
    !nonEmptyStringArray(value.semanticEvidenceAssetRefs) ||
    !isJsonRecord(value.observationSnapshot)
  ) {
    return null;
  }
  const ledger = edgeFulfillmentLedger(value.edgeFulfillmentLedger);
  const decision = edgeClosureDecision(value.edgeClosureDecision);
  const archive = value.runtimeArchiveInspection;
  const { actionEvaluationRef, actionEvaluationDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body);
  if (
    ledger === null ||
    decision === null ||
    ledger.constructionIntentRef !== value.constructionIntentRef ||
    ledger.targetOutcomeRef !== value.targetOutcomeRef ||
    decision.constructionIntentRef !== value.constructionIntentRef ||
    decision.targetOutcomeRef !== value.targetOutcomeRef ||
    decision.ledgerRef !== ledger.ledgerRef ||
    (
      decision.disposition === "close_candidate"
        ? archive !== null
        : !isJsonRecord(archive) ||
          !hasExactKeys(archive, [
            "constructionIntentRef",
            "disposition",
            "inspectionDigest",
            "inspectionRef",
            "kind",
            "runtimeEvidenceEventRefs",
            "schemaVersion",
          ]) ||
          archive.kind !== "runtime_archive_inspection" ||
          archive.schemaVersion !== "5.0.0" ||
          archive.disposition !== "inspected" ||
          archive.constructionIntentRef !== value.constructionIntentRef ||
          typeof archive.inspectionRef !== "string" ||
          typeof archive.inspectionDigest !== "string" ||
          !nonEmptyStringArray(archive.runtimeEvidenceEventRefs) ||
          archive.inspectionDigest !== sha256Canonical((() => {
            const {
              inspectionRef: _inspectionRef,
              inspectionDigest: _inspectionDigest,
              ...archiveBody
            } = archive;
            return archiveBody;
          })()) ||
          archive.inspectionRef !==
            `runtime-archive-inspection://product/${String(archive.inspectionDigest).slice("sha256:".length)}`
    ) ||
    actionEvaluationDigest !== expectedDigest ||
    actionEvaluationRef !==
      `action-evaluation://product/${expectedDigest.slice("sha256:".length)}`
  ) {
    return null;
  }
  return value as unknown as ActionEvaluationProjection;
}

function actionEvaluationBasis(
  value: JsonValue | undefined,
): Readonly<Record<string, JsonValue>> | null {
  if (
    !isJsonRecord(value) ||
    value.kind !== "action_evaluation_basis" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.basisRef !== "string" ||
    typeof value.basisDigest !== "string"
  ) {
    return null;
  }
  const { basisRef, basisDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body);
  return basisDigest === expectedDigest &&
      basisRef ===
        `action-evaluation-basis://abiogenesis/${expectedDigest.slice("sha256:".length)}`
    ? value
    : null;
}

function convergedNextActionProjection(
  value: JsonValue,
): ConvergedNextActionProjection | null {
  if (
    !isJsonRecord(value) ||
    !hasExactKeys(value, [
      "constructionIntentRef",
      "disposition",
      "edgeClosureDecisionRef",
      "gapRef",
      "kind",
      "lawfulBasisRefs",
      "nextActionBasisDigest",
      "nextActionBasisRef",
      "priorityProjection",
      "projectionDigest",
      "projectionRef",
      "schemaVersion",
      "targetObligationBindings",
      "targetOutcomeRef",
    ]) ||
    value.kind !== "next_action_projection" ||
    value.schemaVersion !== "5.0.0" ||
    value.disposition !== "converged" ||
    typeof value.projectionRef !== "string" ||
    typeof value.projectionDigest !== "string" ||
    typeof value.constructionIntentRef !== "string" ||
    typeof value.targetOutcomeRef !== "string" ||
    typeof value.gapRef !== "string" ||
    typeof value.edgeClosureDecisionRef !== "string" ||
    typeof value.nextActionBasisRef !== "string" ||
    typeof value.nextActionBasisDigest !== "string" ||
    !Array.isArray(value.targetObligationBindings) ||
    value.targetObligationBindings.length !== 1 ||
    value.targetObligationBindings.some((row) => !isJsonRecord(row)) ||
    !isJsonRecord(value.priorityProjection) ||
    !nonEmptyStringArray(value.lawfulBasisRefs)
  ) {
    return null;
  }
  const { projectionRef, projectionDigest, ...body } = value;
  const expectedDigest = sha256Canonical(body);
  return projectionDigest === expectedDigest &&
      projectionRef ===
        `next-action-projection://product/${expectedDigest.slice("sha256:".length)}`
    ? value as unknown as ConvergedNextActionProjection
    : null;
}

function constructionIntentForAdvance(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  evidence: RouteAdmissionEvidence | null,
): {
  readonly projection: NextActionProjection;
  readonly basis: Readonly<Record<string, JsonValue>>;
  readonly intent: ConstructionIntent;
} | RouteAdmissionRefusal | null {
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const composition = admittedConstructionComposition(executionBasis, graph);
  const nextActionAuthority = constructionAuthority(
    executionBasis,
    graph,
    "evaluateNext",
  );
  if (
    composition === null ||
    nextActionAuthority === null ||
    sourceTerm.kind !== "c_of" ||
    sourceTerm.compositionRef !== composition.compositionRef ||
    sourceTerm.programLocusRef !==
      nextActionAuthority.initialProgramLocusRef
  ) {
    return null;
  }
  if (targetCursor === null || evidence === null) {
    return refusal(
      "candidate_mismatch",
      "evaluateNext requires one admitted selected action and exact declared target",
    );
  }
  const targetTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    targetCursor.currentNodeRef,
    targetCursor.termPath,
  );
  const projection = selectedNextActionProjection(evidence.result.value);
  const basisEvent = store.readAll().find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.runId === sourceCursor.runId &&
      event.graphCallId === sourceCursor.graphCallId &&
      event.frameId === sourceCursor.frameId &&
      isJsonRecord(event.payload) &&
      event.payload.resultRef === sourceCursor.inputRef,
  );
  const selectedBasis =
    basisEvent !== undefined && isJsonRecord(basisEvent.payload)
      ? nextActionBasis(basisEvent.payload.value)
      : null;
  const observationSnapshot =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.observationSnapshot)
      ? selectedBasis.observationSnapshot
      : null;
  const snapshotWorkspace =
    observationSnapshot !== null &&
      isJsonRecord(observationSnapshot.workspaceBinding)
      ? observationSnapshot.workspaceBinding
      : null;
  const snapshotActionCatalog =
    observationSnapshot !== null &&
      isJsonRecord(observationSnapshot.actionCatalog)
      ? observationSnapshot.actionCatalog
      : null;
  const selectedActionCatalog =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.admittedActionCatalog)
      ? selectedBasis.admittedActionCatalog
      : null;
  const selectedPolicy =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.declaredPolicy)
      ? selectedBasis.declaredPolicy
      : null;
  const targetObligationRefs =
    selectedBasis !== null &&
      Array.isArray(selectedBasis.targetObligationRefs)
      ? selectedBasis.targetObligationRefs
      : null;
  const priorityScheme =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.priorityScheme)
      ? selectedBasis.priorityScheme
      : null;
  const runtimeFrontier =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.runtimeFrontier)
      ? selectedBasis.runtimeFrontier
      : null;
  const projectionBinding = projection?.targetObligationBindings.length === 1
    ? projection.targetObligationBindings[0]
    : undefined;
  const projectionPriority = projection?.priorityProjection;
  const actionRows = executionBasis.actionCatalogRows.filter(
    (row) => row.actionRef === projection?.selectedActionRef,
  );
  const actionRow = actionRows.length === 1 ? actionRows[0] : undefined;
  const selectedTargetInput =
    selectedBasis !== null && isJsonRecord(selectedBasis.targetInput)
      ? selectedBasis.targetInput
      : null;
  const selectedTargetInputRef =
    selectedBasis !== null && typeof selectedBasis.targetInputRef === "string"
      ? selectedBasis.targetInputRef
      : null;
  const selectedTargetInputDigest =
    selectedBasis !== null &&
      typeof selectedBasis.targetInputDigest === "string"
      ? selectedBasis.targetInputDigest
      : null;
  const selectsInteraction =
    projection?.actionKind === "request_human_input" &&
    targetTerm.kind === "c_of" &&
    targetTerm.compositionRef === composition.compositionRef &&
    targetTerm.programLocusRef ===
      composition.interactionProgramLocusRef &&
    isInteractionCLeaf(targetTerm) &&
    projection.graphFunctionRef === executionBasis.graphFunctionRef &&
    projection.targetProgramLocusRef === targetTerm.programLocusRef;
  const selectsGraphFunction =
    projection?.actionKind === "invoke_graph_function" &&
    targetTerm.kind === "c_workflow" &&
    targetTerm.graphFunctionRef === projection.graphFunctionRef &&
    projection.targetProgramLocusRef === targetTerm.graphFunctionRef &&
    composition.interactionProgramLocusRef === targetTerm.graphFunctionRef &&
    selectedTargetInput !== null &&
    selectedTargetInputRef !== null &&
    selectedTargetInputDigest !== null &&
    sha256Canonical(selectedTargetInput) === selectedTargetInputDigest;
  if (
    projection === null ||
    selectedBasis === null ||
    sha256Canonical(selectedBasis) !== sourceCursor.inputDigest ||
    projection.nextActionBasisRef !== selectedBasis.basisRef ||
    projection.nextActionBasisDigest !== selectedBasis.basisDigest ||
    !projection.lawfulBasisRefs.includes(projection.nextActionBasisRef) ||
    observationSnapshot === null ||
    snapshotWorkspace === null ||
    snapshotActionCatalog === null ||
    selectedActionCatalog === null ||
    selectedPolicy === null ||
    targetObligationRefs === null ||
    priorityScheme === null ||
    runtimeFrontier === null ||
    projectionBinding === undefined ||
    projectionPriority === undefined ||
    snapshotWorkspace.workspaceBindingId !==
      executionBasis.workspaceBindingId ||
    snapshotWorkspace.workspaceBindingDigest !==
      executionBasis.workspaceBindingDigest ||
    snapshotActionCatalog.catalogRef !== executionBasis.actionCatalogRef ||
    snapshotActionCatalog.catalogDigest !==
      executionBasis.actionCatalogDigest ||
    sha256Canonical(snapshotActionCatalog) !==
      sha256Canonical(selectedActionCatalog) ||
    sha256Canonical(selectedPolicy) !==
      sha256Canonical(
        composition.closurePolicy as unknown as JsonValue,
      ) ||
    runtimeFrontier.phase !== "initial" ||
    priorityScheme.kind !== "construction_priority_scheme" ||
    projectionPriority.kind !== "deterministic_priority_projection" ||
    projectionPriority.schemeRef !== priorityScheme.schemeRef ||
    !Array.isArray(projectionPriority.orderedActionRefs) ||
    projectionPriority.orderedActionRefs.join("\0") !==
      projection.selectedActionRef ||
    projectionBinding.kind !== "target_obligation_binding" ||
    projectionBinding.disposition !== "bound" ||
    !Array.isArray(projectionBinding.eligibleActionRefs) ||
    projectionBinding.eligibleActionRefs.join("\0") !==
      projection.selectedActionRef ||
    projectionBinding.obligationRef !==
      projection.targetObligationRefs[0] ||
    !sameValues(
      projection.targetObligationRefs,
      targetObligationRefs.filter(
        (value): value is string => typeof value === "string",
      ),
    ) ||
    executionBasis.actionCatalogRef === null ||
    executionBasis.actionCatalogDigest === null ||
    actionRow === undefined ||
    (!selectsInteraction && !selectsGraphFunction) ||
    actionRow.kind !== "action_catalog_row" ||
    actionRow.actionKind !== projection.actionKind ||
    actionRow.programRef !== projection.programRef ||
    actionRow.graphFunctionRef !== projection.graphFunctionRef ||
    actionRow.targetProgramLocusRef !== projection.targetProgramLocusRef ||
    !sameValues(actionRow.targetObligationRefs, projection.targetObligationRefs) ||
    !sameValues(actionRow.inputAssetRefs, projection.inputAssetRefs) ||
    !sameValues(actionRow.outputAssetRefs, projection.outputAssetRefs) ||
    actionRow.expectedDeltaRef !== projection.expectedDeltaRef ||
    actionRow.progressConditionRef !== projection.progressConditionRef ||
    actionRow.stopConditionRef !== projection.stopConditionRef ||
    projection.programRef !== executionBasis.programRef ||
    (
      selectsInteraction &&
      projection.graphFunctionRef !== executionBasis.graphFunctionRef
    )
  ) {
    return refusal(
      "candidate_mismatch",
      "evaluateNext output does not select the exact admitted GTL interaction target",
    );
  }
  const body = {
    kind: "construction_intent" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    nextActionProjectionRef: projection.projectionRef,
    nextActionProjectionDigest: projection.projectionDigest,
    nextActionBasisRef: projection.nextActionBasisRef,
    nextActionBasisDigest: projection.nextActionBasisDigest,
    targetOutcomeRef: projection.targetOutcomeRef,
    selectedActionRef: projection.selectedActionRef,
    actionKind: projection.actionKind,
    selectedGraphFunctionRef: projection.graphFunctionRef,
    targetProgramLocusRef: projection.targetProgramLocusRef,
    targetInputRef: selectsGraphFunction ? selectedTargetInputRef : null,
    targetInputDigest:
      selectsGraphFunction ? selectedTargetInputDigest : null,
    targetInput: selectsGraphFunction ? selectedTargetInput : null,
    targetObligationRefs: projection.targetObligationRefs,
    inputAssetRefs: projection.inputAssetRefs,
    outputAssetRefs: projection.outputAssetRefs,
    expectedDeltaRef: projection.expectedDeltaRef,
    progressConditionRef: projection.progressConditionRef,
    stopConditionRef: projection.stopConditionRef,
    actionCatalogRef: executionBasis.actionCatalogRef,
    actionCatalogDigest: executionBasis.actionCatalogDigest,
    actionCatalogRowDigest: sha256Canonical(
      actionRow as unknown as JsonValue,
    ),
    constructionCompositionRef: composition.compositionRef,
    constructionCompositionDigest: composition.compositionDigest,
    nextActionAuthorityRef: nextActionAuthority.authorityRef,
    workspaceBindingId: executionBasis.workspaceBindingId,
    workspaceBindingDigest: executionBasis.workspaceBindingDigest,
    invocationAdmissionRef: executionBasis.invocationAdmissionRef,
    invocationRef: executionBasis.invocationRef,
    invocationDigest: executionBasis.invocationDigest,
    programRef: executionBasis.programRef,
    programDigest: executionBasis.programDigest,
    graphFunctionRef: executionBasis.graphFunctionRef,
    graphFunctionDigest: executionBasis.graphFunctionDigest,
    executionBasisRef: executionBasis.basisRef,
    executionBasisDigest: executionBasis.basisDigest,
    runId: sourceCursor.runId,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    sourceCCallRef: evidence.cCall.cCallRef,
    sourceResultRef: evidence.result.resultRef,
    sourceResultDigest: evidence.result.resultDigest,
    sourceJudgmentRef: evidence.judgment.judgmentRef,
    targetCursorRef: targetCursor.cursorRef,
    targetCursorDigest: targetCursor.cursorDigest,
  };
  const constructionIntentDigest = sha256Canonical(
    body as unknown as JsonValue,
  );
  return {
    projection,
    basis: selectedBasis,
    intent: deepFreeze({
      ...body,
      constructionIntentRef:
        `construction-intent://abiogenesis/${constructionIntentDigest.slice("sha256:".length)}`,
      constructionIntentDigest,
    }),
  };
}

function noActionProjectionForStopRoute(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  evidence: RouteAdmissionEvidence | null,
): {
  readonly projection: NoActionNextActionProjection;
  readonly basis: Readonly<Record<string, JsonValue>>;
} | RouteAdmissionRefusal {
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const composition = admittedConstructionComposition(executionBasis, graph);
  const nextActionAuthority = constructionAuthority(
    executionBasis,
    graph,
    "evaluateNext",
  );
  if (
    composition === null ||
    nextActionAuthority === null ||
    sourceTerm.kind !== "c_of" ||
    sourceTerm.compositionRef !== composition.compositionRef ||
    (
      sourceTerm.programLocusRef !==
        nextActionAuthority.initialProgramLocusRef &&
      sourceTerm.programLocusRef !==
        nextActionAuthority.refreshProgramLocusRef
    ) ||
    evidence === null
  ) {
    return refusal(
      "gap_projection_mismatch",
      "gap_stop requires one exact admitted evaluateNext C-call",
    );
  }
  const projection = noActionNextActionProjection(evidence.result.value);
  const basisEvent = store.readAll().find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.runId === sourceCursor.runId &&
      event.graphCallId === sourceCursor.graphCallId &&
      event.frameId === sourceCursor.frameId &&
      isJsonRecord(event.payload) &&
      event.payload.resultRef === sourceCursor.inputRef,
  );
  const selectedBasis =
    basisEvent !== undefined && isJsonRecord(basisEvent.payload)
      ? nextActionBasis(basisEvent.payload.value)
      : null;
  const observationSnapshot =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.observationSnapshot)
      ? selectedBasis.observationSnapshot
      : null;
  const snapshotWorkspace =
    observationSnapshot !== null &&
      isJsonRecord(observationSnapshot.workspaceBinding)
      ? observationSnapshot.workspaceBinding
      : null;
  const snapshotActionCatalog =
    observationSnapshot !== null &&
      isJsonRecord(observationSnapshot.actionCatalog)
      ? observationSnapshot.actionCatalog
      : null;
  const selectedActionCatalog =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.admittedActionCatalog)
      ? selectedBasis.admittedActionCatalog
      : null;
  const selectedPolicy =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.declaredPolicy)
      ? selectedBasis.declaredPolicy
      : null;
  const runtimeFrontier =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.runtimeFrontier)
      ? selectedBasis.runtimeFrontier
      : null;
  const gapProjection =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.gapProjection)
      ? selectedBasis.gapProjection
      : null;
  const targetObligationRefs =
    selectedBasis !== null &&
      Array.isArray(selectedBasis.targetObligationRefs)
      ? selectedBasis.targetObligationRefs
      : null;
  const priorityScheme =
    selectedBasis !== null &&
      isJsonRecord(selectedBasis.priorityScheme)
      ? selectedBasis.priorityScheme
      : null;
  const targetBindings = projection?.targetObligationBindings ?? null;
  const priorityProjection = projection?.priorityProjection ?? null;
  const catalogActionRefs = new Set(
    executionBasis.actionCatalogRows.map((row) => row.actionRef),
  );
  const correctionDisposition =
    projection !== null &&
      [
        "repair",
        "inspect_runtime_archive",
        "reprice",
        "escalate",
      ].includes(projection.noActionDisposition)
      ? projection.noActionDisposition
      : null;
  const constructionState =
    observationSnapshot !== null &&
      isJsonRecord(observationSnapshot.constructionState)
      ? observationSnapshot.constructionState
      : null;
  const correctionDelta = correctionDisposition === null ||
      constructionState === null
    ? undefined
    : store.readAll().find(
        (event) =>
          event.kind === "construction_delta_observed" &&
          event.runId === sourceCursor.runId &&
          event.graphCallId === sourceCursor.graphCallId &&
          event.frameId === sourceCursor.frameId &&
          isJsonRecord(event.payload) &&
          event.payload.edgeClosureDecisionRef ===
            constructionState.edgeClosureDecisionRef &&
          isJsonRecord(event.payload.edgeClosureDecision) &&
          event.payload.edgeClosureDecision.disposition ===
            "continue_candidate" &&
          event.payload.edgeClosureDecision.correctionDisposition ===
            correctionDisposition,
      );
  if (
    projection === null ||
    selectedBasis === null ||
    sha256Canonical(selectedBasis) !== sourceCursor.inputDigest ||
    projection.nextActionBasisRef !== selectedBasis.basisRef ||
    projection.nextActionBasisDigest !== selectedBasis.basisDigest ||
    projection.programRef !== executionBasis.programRef ||
    !projection.lawfulBasisRefs.includes(projection.nextActionBasisRef) ||
    !projection.lawfulBasisRefs.includes(projection.gapRef) ||
    !projection.lawfulBasisRefs.includes(projection.programRef)
  ) {
    return refusal(
      "gap_projection_mismatch",
      "gap_stop projection differs from its exact Product result or next-action basis",
    );
  }
  if (
    observationSnapshot === null ||
    snapshotWorkspace === null ||
    snapshotActionCatalog === null ||
    selectedActionCatalog === null ||
    selectedPolicy === null ||
    runtimeFrontier === null ||
    gapProjection === null ||
    targetObligationRefs === null ||
    targetBindings === null ||
    targetBindings.length !== 1 ||
    priorityProjection === null ||
    snapshotWorkspace.workspaceBindingId !==
      executionBasis.workspaceBindingId ||
    snapshotWorkspace.workspaceBindingDigest !==
      executionBasis.workspaceBindingDigest ||
    snapshotActionCatalog.catalogRef !== executionBasis.actionCatalogRef ||
    snapshotActionCatalog.catalogDigest !==
      executionBasis.actionCatalogDigest ||
    sha256Canonical(snapshotActionCatalog) !==
      sha256Canonical(selectedActionCatalog) ||
    sha256Canonical(selectedPolicy) !==
      sha256Canonical(
        composition.closurePolicy as unknown as JsonValue,
      )
  ) {
    return refusal(
      "gap_environment_mismatch",
      "gap_stop basis differs from its exact admitted workspace, catalog, or policy",
    );
  }
  const commonSemanticsInvalid =
    priorityScheme === null ||
    priorityScheme.kind !== "construction_priority_scheme" ||
    gapProjection.gapRef !== projection.gapRef ||
    gapProjection.targetOutcomeRef !== projection.targetOutcomeRef ||
    !sameValues(
      projection.targetObligationRefs,
      targetObligationRefs.filter(
        (value): value is string => typeof value === "string",
      ),
    ) ||
    !isJsonRecord(targetBindings[0]) ||
    targetBindings[0].kind !== "target_obligation_binding" ||
    targetBindings[0].obligationRef !==
      projection.targetObligationRefs[0] ||
    !Array.isArray(targetBindings[0].eligibleActionRefs) ||
    targetBindings[0].eligibleActionRefs.length !== 0 ||
    !sameValues(
      projection.missingAssetRefs,
      Array.isArray(gapProjection.missingAssetRefs)
        ? gapProjection.missingAssetRefs.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    ) ||
    !Array.isArray(priorityProjection.orderedActionRefs) ||
    priorityProjection.kind !== "deterministic_priority_projection" ||
    priorityProjection.schemeRef !== priorityScheme.schemeRef ||
    priorityProjection.orderedActionRefs.length !== 0;
  const initialSemanticsInvalid =
    correctionDisposition === null &&
    (
      runtimeFrontier.phase !== "initial" ||
      sourceTerm.programLocusRef !==
        nextActionAuthority.initialProgramLocusRef ||
      targetBindings[0]!.disposition !== "unbound" ||
      !sameValues(
        projection.missingAssetRefs,
        Array.isArray(gapProjection.missingAssetRefs)
          ? gapProjection.missingAssetRefs.filter(
              (value): value is string => typeof value === "string",
            )
          : [],
      ) ||
      projection.rejectedActionRefs.some(
        (actionRef) => !catalogActionRefs.has(actionRef),
      )
    );
  const correctionSemanticsInvalid =
    correctionDisposition !== null &&
    (
      runtimeFrontier.phase !== "post_evidence" ||
      sourceTerm.programLocusRef !==
        nextActionAuthority.refreshProgramLocusRef ||
      targetBindings[0]!.disposition !== "fulfilled" ||
      projection.missingAssetRefs.length !== 0 ||
      projection.rejectedActionRefs.length !== 0 ||
      gapProjection.pressure !== "governed_correction" ||
      gapProjection.correctionDisposition !== correctionDisposition ||
      constructionState === null ||
      constructionState.correctionDisposition !== correctionDisposition ||
      correctionDelta === undefined
    );
  if (
    commonSemanticsInvalid ||
    initialSemanticsInvalid ||
    correctionSemanticsInvalid
  ) {
    return refusal(
      "gap_semantics_mismatch",
      "gap_stop projection differs from its Product gap, obligations, missing assets, priority, or rejected actions",
    );
  }
  return { projection, basis: selectedBasis };
}

export function rehydrateConstructionIntentForCursor(
  store: AbgEventStore,
  cursor: TraversalCursorCandidate,
): ConstructionIntentAdmission | null {
  const event = store.readAll().find(
    (candidate) =>
      candidate.kind === "construction_intent_selected" &&
      candidate.runId === cursor.runId &&
      candidate.graphCallId === cursor.graphCallId &&
      candidate.frameId === cursor.frameId &&
      isJsonRecord(candidate.payload) &&
      candidate.payload.targetCursorRef === cursor.cursorRef,
  );
  if (event === undefined || !isJsonRecord(event.payload)) return null;
  const intentValue = event.payload.constructionIntent;
  const projectionValue = event.payload.nextActionProjection;
  const basisValue = event.payload.nextActionBasis;
  const projection = selectedNextActionProjection(projectionValue ?? null);
  const selectedBasis = nextActionBasis(basisValue);
  if (
    !isJsonRecord(intentValue) ||
    projection === null ||
    selectedBasis === null ||
    typeof intentValue.constructionIntentRef !== "string" ||
    typeof intentValue.constructionIntentDigest !== "string"
  ) {
    return null;
  }
  const {
    constructionIntentRef,
    constructionIntentDigest,
    ...body
  } = intentValue;
  if (
    sha256Canonical(body) !== constructionIntentDigest ||
    constructionIntentRef !==
      `construction-intent://abiogenesis/${constructionIntentDigest.slice("sha256:".length)}` ||
    event.payload.constructionIntentRef !== constructionIntentRef ||
    event.payload.constructionIntentDigest !== constructionIntentDigest ||
    event.payload.nextActionProjectionRef !== projection.projectionRef ||
    event.payload.nextActionProjectionDigest !== projection.projectionDigest ||
    event.payload.nextActionBasisRef !== selectedBasis.basisRef ||
    event.payload.nextActionBasisDigest !== selectedBasis.basisDigest ||
    intentValue.nextActionProjectionRef !== projection.projectionRef ||
    intentValue.nextActionProjectionDigest !== projection.projectionDigest ||
    intentValue.nextActionBasisRef !== selectedBasis.basisRef ||
    intentValue.nextActionBasisDigest !== selectedBasis.basisDigest ||
    intentValue.targetCursorRef !== cursor.cursorRef ||
    intentValue.targetCursorDigest !== cursor.cursorDigest ||
    typeof intentValue.selectedGraphFunctionRef !== "string" ||
    (
      intentValue.actionKind === "invoke_graph_function"
        ? !isJsonRecord(intentValue.targetInput) ||
          typeof intentValue.targetInputRef !== "string" ||
          typeof intentValue.targetInputDigest !== "string" ||
          sha256Canonical(intentValue.targetInput) !==
            intentValue.targetInputDigest ||
          intentValue.selectedGraphFunctionRef !==
            projection.graphFunctionRef
        : intentValue.targetInput !== null ||
          intentValue.targetInputRef !== null ||
          intentValue.targetInputDigest !== null
    ) ||
    event.payload.actionCatalogRef !== intentValue.actionCatalogRef ||
    event.payload.actionCatalogDigest !== intentValue.actionCatalogDigest ||
    event.payload.actionCatalogRowDigest !==
      intentValue.actionCatalogRowDigest ||
    sha256Canonical(projectionValue ?? null) !== cursor.inputDigest
  ) {
    return null;
  }
  return deepFreeze({
    ...intentValue,
    admissionEventRef: event.eventId,
  }) as unknown as ConstructionIntentAdmission;
}

export function deriveGraphFunctionActionEvaluationBasis(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  cursor: TraversalCursorCandidate,
  input: Readonly<{
    childGraphFunctionRef: string;
    childResultRef: string;
    childResultValue: Readonly<Record<string, JsonValue>>;
    childJudgmentRef: string;
    childClosureRef: string;
  }>,
): Readonly<Record<string, JsonValue>> | null {
  const intent = rehydrateConstructionIntentForCursor(store, cursor);
  const composition = admittedBasisConstructionComposition(executionBasis);
  if (
    intent === null ||
    intent.actionKind !== "invoke_graph_function" ||
    intent.selectedGraphFunctionRef !== input.childGraphFunctionRef ||
    intent.targetInput === null ||
    intent.targetInputRef === null ||
    intent.targetInputDigest === null ||
    composition === null
  ) {
    return null;
  }
  const events = store.readAll();
  const intentEvent = events.find(
    (event) => event.eventId === intent.admissionEventRef,
  );
  const selectedNextActionBasis =
    intentEvent !== undefined &&
      isJsonRecord(intentEvent.payload) &&
      isJsonRecord(intentEvent.payload.nextActionBasis)
      ? nextActionBasis(intentEvent.payload.nextActionBasis)
      : null;
  const resultEvent = events.find(
    (event) =>
      event.kind === "c_call_result_admitted" &&
      event.runId === intent.runId &&
      event.graphFunctionRef === input.childGraphFunctionRef &&
      isJsonRecord(event.payload) &&
      event.payload.resultRef === input.childResultRef,
  );
  const judgmentEvent = events.find(
    (event) =>
      event.kind === "c_call_judged" &&
      event.runId === intent.runId &&
      event.graphFunctionRef === input.childGraphFunctionRef &&
      isJsonRecord(event.payload) &&
      event.payload.judgmentRef === input.childJudgmentRef &&
      event.payload.resultRef === input.childResultRef,
  );
  const terminalEvent = events.find(
    (event) =>
      event.kind === "terminal_reached" &&
      event.runId === intent.runId &&
      event.graphFunctionRef === input.childGraphFunctionRef &&
      isJsonRecord(event.payload) &&
      event.payload.closureRef === input.childClosureRef,
  );
  const graphClosedEvent = events.find(
    (event) =>
      terminalEvent !== undefined &&
      event.kind === "graph_call_closed" &&
      event.runId === intent.runId &&
      event.graphFunctionRef === input.childGraphFunctionRef &&
      event.graphCallId === terminalEvent.graphCallId &&
      event.admissionOrdinal > terminalEvent.admissionOrdinal,
  );
  const resultValueDigest = sha256Canonical(
    input.childResultValue as unknown as JsonValue,
  );
  const resultPayload =
    resultEvent !== undefined && isJsonRecord(resultEvent.payload)
      ? resultEvent.payload
      : null;
  if (
    intentEvent === undefined ||
    selectedNextActionBasis === null ||
    selectedNextActionBasis.basisRef !== intent.nextActionBasisRef ||
    selectedNextActionBasis.basisDigest !== intent.nextActionBasisDigest ||
    resultEvent === undefined ||
    resultPayload === null ||
    judgmentEvent === undefined ||
    terminalEvent === undefined ||
    graphClosedEvent === undefined ||
    resultPayload.valueDigest !== resultValueDigest ||
    typeof resultPayload.contractRef !== "string" ||
    sha256Canonical(intent.targetInput) !== intent.targetInputDigest
  ) {
    return null;
  }
  const body = {
    kind: "action_evaluation_basis" as const,
    schemaVersion: "5.0.0" as const,
    constructionIntent: intent as unknown as JsonValue,
    nextActionBasis: selectedNextActionBasis,
    admittedEvidence: [{
      kind: "admitted_semantic_evidence" as const,
      schemaVersion: "5.0.0" as const,
      responseContractRef: resultPayload.contractRef,
      responseRef: input.childResultRef,
      responseDigest: resultValueDigest,
      responseValue: input.childResultValue,
      semanticEvidenceAssetRefs: intent.outputAssetRefs,
      admissionEventRef: resultEvent.eventId,
    }],
    workspaceBinding: {
      workspaceBindingId: executionBasis.workspaceBindingId,
      workspaceBindingDigest: executionBasis.workspaceBindingDigest,
    },
    actionCatalog: {
      actionCatalogRef: intent.actionCatalogRef,
      actionCatalogDigest: intent.actionCatalogDigest,
      actionCatalogRowDigest: intent.actionCatalogRowDigest,
      selectedActionRef: intent.selectedActionRef,
    },
    closurePolicy: composition.closurePolicy as unknown as JsonValue,
    runtimeEvidenceEventRefs: [
      intent.admissionEventRef,
      resultEvent.eventId,
      judgmentEvent.eventId,
      terminalEvent.eventId,
      graphClosedEvent.eventId,
    ],
  };
  const basisDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    ...body,
    basisRef:
      `action-evaluation-basis://abiogenesis/${basisDigest.slice("sha256:".length)}`,
    basisDigest,
  });
}

interface ConstructionDeltaAdmissionCandidate {
  readonly payload: Readonly<Record<string, JsonValue>>;
  readonly causationEventRefs: readonly string[];
}

function admittedConstructionComposition(
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
) {
  const composition = admittedBasisConstructionComposition(executionBasis);
  return composition?.graphFunctionRef === graph.graphFunctionRef
    ? composition
    : null;
}

function constructionAuthority(
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  semanticAuthority:
    | "synthesizeModel"
    | "evalGap"
    | "evaluateNext"
    | "evaluateAction",
) {
  const composition = admittedConstructionComposition(executionBasis, graph);
  const binding = selectAdmittedConstructionAuthority(
    executionBasis,
    semanticAuthority,
  );
  return composition !== null ? binding : null;
}

function constructionIntentFromEvent(
  event: ReturnType<AbgEventStore["readAll"]>[number],
): ConstructionIntentAdmission | null {
  if (
    event.kind !== "construction_intent_selected" ||
    !isJsonRecord(event.payload) ||
    !isJsonRecord(event.payload.constructionIntent)
  ) {
    return null;
  }
  const value = event.payload.constructionIntent;
  const constructionIntentRef = value.constructionIntentRef;
  const constructionIntentDigest = value.constructionIntentDigest;
  if (
    typeof constructionIntentRef !== "string" ||
    typeof constructionIntentDigest !== "string"
  ) {
    return null;
  }
  const {
    constructionIntentRef: _ref,
    constructionIntentDigest: _digest,
    ...body
  } = value;
  if (
    sha256Canonical(body) !== constructionIntentDigest ||
    constructionIntentRef !==
      `construction-intent://abiogenesis/${constructionIntentDigest.slice("sha256:".length)}`
  ) {
    return null;
  }
  return deepFreeze({
    ...value,
    admissionEventRef: event.eventId,
  }) as unknown as ConstructionIntentAdmission;
}

function constructionDeltaForAdvance(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  evidence: RouteAdmissionEvidence | null,
): ConstructionDeltaAdmissionCandidate | RouteAdmissionRefusal | null {
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const composition = admittedConstructionComposition(executionBasis, graph);
  const actionEvaluationAuthority = constructionAuthority(
    executionBasis,
    graph,
    "evaluateAction",
  );
  if (
    composition === null ||
    actionEvaluationAuthority === null ||
    sourceTerm.kind !== "c_of" ||
    sourceTerm.compositionRef !== composition.compositionRef ||
    sourceTerm.programLocusRef !==
      actionEvaluationAuthority.initialProgramLocusRef
  ) {
    return null;
  }
  if (targetCursor === null || evidence === null) {
    return refusal(
      "candidate_mismatch",
      "evaluateAction requires one admitted action fold and refresh target",
    );
  }
  const evaluation = actionEvaluationProjection(evidence.result.value);
  if (evaluation === null) {
    return refusal(
      "candidate_mismatch",
      "evaluateAction did not emit one canonical evidence ledger and closure candidate",
    );
  }
  const events = store.readAll();
  const intentEvent = events.find(
    (event) =>
      event.kind === "construction_intent_selected" &&
      isJsonRecord(event.payload) &&
      event.payload.constructionIntentRef ===
        evaluation.constructionIntentRef,
  );
  const intent = intentEvent === undefined
    ? null
    : constructionIntentFromEvent(intentEvent);
  const actionRow = intent === null
    ? undefined
    : executionBasis.actionCatalogRows.find(
        (row) => row.actionRef === intent.selectedActionRef,
      );
  const ledger = evaluation.edgeFulfillmentLedger;
  const decision = evaluation.edgeClosureDecision;
  const ledgerObligations = ledger.rows.map((row) => row.obligationRef);
  const ledgerEvidenceRefs = [
    ...new Set(ledger.rows.flatMap((row) => row.evidenceRefs)),
  ];
  const semanticEvidenceAssetRefs = [
    ...new Set(ledger.rows.flatMap((row) => row.evidenceAssetRefs)),
  ];
  const opened = events.find(
    (event) =>
      event.kind === "fh_interaction_opened" &&
      isJsonRecord(event.payload) &&
      event.payload.constructionIntentRef ===
        evaluation.constructionIntentRef,
  );
  const continuationRef = opened !== undefined && isJsonRecord(opened.payload)
    ? opened.payload.continuationRef
    : null;
  const responded = typeof continuationRef === "string"
    ? events.find(
        (event) =>
          event.kind === "fh_interaction_responded" &&
          isJsonRecord(event.payload) &&
          event.payload.continuationRef === continuationRef,
      )
    : undefined;
  const resumed = typeof continuationRef === "string"
    ? events.find(
        (event) =>
          event.kind === "fh_interaction_resume_admitted" &&
          isJsonRecord(event.payload) &&
          event.payload.continuationRef === continuationRef,
      )
    : undefined;
  const interactionEvaluationBasis =
    resumed !== undefined && isJsonRecord(resumed.payload)
      ? actionEvaluationBasis(resumed.payload.successorInputValue)
      : null;
  const graphFunctionEvaluationBasisEvent = events.find(
    (event) =>
      intent?.actionKind === "invoke_graph_function" &&
      event.kind === "c_call_result_admitted" &&
      event.runId === sourceCursor.runId &&
      event.graphCallId === sourceCursor.graphCallId &&
      event.frameId === sourceCursor.frameId &&
      isJsonRecord(event.payload) &&
      event.payload.resultRef === sourceCursor.inputRef &&
      actionEvaluationBasis(event.payload.value) !== null,
  );
  const graphFunctionEvaluationBasis =
    graphFunctionEvaluationBasisEvent !== undefined &&
      isJsonRecord(graphFunctionEvaluationBasisEvent.payload)
      ? actionEvaluationBasis(
          graphFunctionEvaluationBasisEvent.payload.value,
        )
      : null;
  const evaluationBasis = intent?.actionKind === "invoke_graph_function"
    ? graphFunctionEvaluationBasis
    : interactionEvaluationBasis;
  const basisEvidenceRefs =
    evaluationBasis !== null &&
      Array.isArray(evaluationBasis.admittedEvidence)
      ? evaluationBasis.admittedEvidence.flatMap((row) =>
        isJsonRecord(row) && typeof row.responseRef === "string"
          ? [row.responseRef]
          : []
      )
      : [];
  const basisEvidenceAssetRefs =
    evaluationBasis !== null &&
      Array.isArray(evaluationBasis.admittedEvidence)
      ? [
          ...new Set(
            evaluationBasis.admittedEvidence.flatMap((row) =>
              isJsonRecord(row) &&
                Array.isArray(row.semanticEvidenceAssetRefs)
                ? row.semanticEvidenceAssetRefs.filter(
                    (entry): entry is string =>
                      typeof entry === "string",
                  )
                : []
            ),
          ),
        ]
      : [];
  const basisRuntimeEventRefs =
    evaluationBasis !== null &&
      Array.isArray(evaluationBasis.runtimeEvidenceEventRefs)
      ? evaluationBasis.runtimeEvidenceEventRefs.filter(
        (entry): entry is string => typeof entry === "string",
      )
      : [];
  const interactionResponseValue =
    responded !== undefined &&
      isJsonRecord(responded.payload) &&
      isJsonRecord(responded.payload.responseValue)
      ? responded.payload.responseValue
      : null;
  const graphFunctionResponseValue =
    evaluationBasis !== null &&
      Array.isArray(evaluationBasis.admittedEvidence) &&
      evaluationBasis.admittedEvidence.length === 1 &&
      isJsonRecord(evaluationBasis.admittedEvidence[0]) &&
      isJsonRecord(evaluationBasis.admittedEvidence[0].responseValue)
      ? evaluationBasis.admittedEvidence[0].responseValue
      : null;
  const responseValue = intent?.actionKind === "invoke_graph_function"
    ? graphFunctionResponseValue
    : interactionResponseValue;
  const responseCorrectionDisposition =
    responseValue !== null &&
      [
        "repair",
        "inspect_runtime_archive",
        "reprice",
        "escalate",
      ].includes(String(responseValue.correctionDisposition))
      ? responseValue.correctionDisposition
      : null;
  const runtimeArchiveInspection = evaluation.runtimeArchiveInspection;
  const evaluationNextActionBasis =
    evaluationBasis !== null
      ? nextActionBasis(evaluationBasis.nextActionBasis)
      : null;
  const evaluationObservation =
    evaluationNextActionBasis !== null &&
      isJsonRecord(evaluationNextActionBasis.observationSnapshot)
      ? evaluationNextActionBasis.observationSnapshot
      : null;
  const evaluationWorkspace =
    evaluationObservation !== null &&
      isJsonRecord(evaluationObservation.workspaceBinding)
      ? evaluationObservation.workspaceBinding
      : null;
  const evaluationActionCatalog =
    evaluationNextActionBasis !== null &&
      isJsonRecord(evaluationNextActionBasis.admittedActionCatalog)
      ? evaluationNextActionBasis.admittedActionCatalog
      : null;
  const evaluationPolicy =
    evaluationBasis !== null &&
      isJsonRecord(evaluationBasis.closurePolicy)
      ? evaluationBasis.closurePolicy
      : null;
  const evidenced = events.find(
    (event) =>
      event.kind === "c_call_evidenced" &&
      isJsonRecord(event.payload) &&
      event.payload.cCallRef === evidence.cCall.cCallRef,
  );
  const graphFunctionRuntimeEvents = basisRuntimeEventRefs.map(
    (eventRef) => events.find((event) => event.eventId === eventRef),
  );
  const graphFunctionRuntimeBasisValid =
    intent?.actionKind === "invoke_graph_function" &&
    graphFunctionEvaluationBasisEvent !== undefined &&
    basisRuntimeEventRefs.length === 5 &&
    graphFunctionRuntimeEvents.every((event) => event !== undefined) &&
    graphFunctionRuntimeEvents[0]?.eventId === intent.admissionEventRef &&
    graphFunctionRuntimeEvents[1]?.kind === "c_call_result_admitted" &&
    graphFunctionRuntimeEvents[1]?.graphFunctionRef ===
      intent.selectedGraphFunctionRef &&
    graphFunctionRuntimeEvents[2]?.kind === "c_call_judged" &&
    graphFunctionRuntimeEvents[2]?.graphFunctionRef ===
      intent.selectedGraphFunctionRef &&
    graphFunctionRuntimeEvents[3]?.kind === "terminal_reached" &&
    graphFunctionRuntimeEvents[3]?.graphFunctionRef ===
      intent.selectedGraphFunctionRef &&
    graphFunctionRuntimeEvents[4]?.kind === "graph_call_closed" &&
    graphFunctionRuntimeEvents[4]?.graphFunctionRef ===
      intent.selectedGraphFunctionRef;
  const interactionRuntimeBasisValid =
    intent?.actionKind !== "invoke_graph_function" &&
    opened !== undefined &&
    responded !== undefined &&
    resumed !== undefined &&
    sameValues(basisRuntimeEventRefs, [
      intent?.admissionEventRef ?? "",
      opened?.eventId ?? "",
      responded?.eventId ?? "",
      String(
        resumed !== undefined && isJsonRecord(resumed.payload)
          ? resumed.payload.publicOperationEventRef
          : "",
      ),
    ]);
  if (
    intent === null ||
    actionRow === undefined ||
    (!graphFunctionRuntimeBasisValid && !interactionRuntimeBasisValid) ||
    responseValue === null ||
    evaluationBasis === null ||
    basisEvidenceRefs.length === 0 ||
    basisEvidenceAssetRefs.length === 0 ||
    evidenced === undefined ||
    intent.constructionCompositionRef !== composition.compositionRef ||
    intent.constructionCompositionDigest !==
      composition.compositionDigest ||
    intent.executionBasisRef !== executionBasis.basisRef ||
    intent.runId !== sourceCursor.runId ||
    intent.graphCallId !== sourceCursor.graphCallId ||
    intent.frameId !== sourceCursor.frameId ||
    (
      intent.actionKind !== "invoke_graph_function" &&
      sourceCursor.inputRef !== evaluationBasis.basisRef
    ) ||
    sourceCursor.inputDigest !==
      sha256Canonical(evaluationBasis as unknown as JsonValue) ||
    evaluation.actionEvaluationBasisRef !== evaluationBasis.basisRef ||
    evaluation.actionEvaluationBasisDigest !==
      evaluationBasis.basisDigest ||
    evaluationNextActionBasis === null ||
    evaluationNextActionBasis.basisRef !== intent.nextActionBasisRef ||
    evaluationNextActionBasis.basisDigest !==
      intent.nextActionBasisDigest ||
    evaluationObservation === null ||
    evaluationWorkspace === null ||
    evaluationActionCatalog === null ||
    evaluationPolicy === null ||
    sha256Canonical(
      evaluation.observationSnapshot as unknown as JsonValue,
    ) !== sha256Canonical(evaluationObservation) ||
    evaluationWorkspace.workspaceBindingId !==
      executionBasis.workspaceBindingId ||
    evaluationWorkspace.workspaceBindingDigest !==
      executionBasis.workspaceBindingDigest ||
    evaluationActionCatalog.catalogRef !==
      executionBasis.actionCatalogRef ||
    evaluationActionCatalog.catalogDigest !==
      executionBasis.actionCatalogDigest ||
    !isJsonRecord(evaluationBasis.actionCatalog) ||
    evaluationBasis.actionCatalog.actionCatalogRef !==
      intent.actionCatalogRef ||
    evaluationBasis.actionCatalog.actionCatalogDigest !==
      intent.actionCatalogDigest ||
    evaluationBasis.actionCatalog.actionCatalogRowDigest !==
      intent.actionCatalogRowDigest ||
    evaluationBasis.actionCatalog.selectedActionRef !==
      intent.selectedActionRef ||
    sha256Canonical(evaluationPolicy) !==
      sha256Canonical(
        composition.closurePolicy as unknown as JsonValue,
      ) ||
    !isJsonRecord(evaluationBasis.constructionIntent) ||
    evaluationBasis.constructionIntent.constructionIntentRef !==
      intent.constructionIntentRef ||
    !isJsonRecord(evaluationBasis.workspaceBinding) ||
    evaluationBasis.workspaceBinding.workspaceBindingId !==
      executionBasis.workspaceBindingId ||
    evaluationBasis.workspaceBinding.workspaceBindingDigest !==
      executionBasis.workspaceBindingDigest ||
    evaluation.targetOutcomeRef !== intent.targetOutcomeRef ||
    ledger.constructionIntentRef !== intent.constructionIntentRef ||
    decision.constructionIntentRef !== intent.constructionIntentRef ||
    (
      responseCorrectionDisposition === null
        ? decision.disposition !== "close_candidate" ||
          decision.correctionDisposition !== null ||
          runtimeArchiveInspection !== null
        : decision.disposition !== "continue_candidate" ||
          decision.correctionDisposition !==
            responseCorrectionDisposition ||
          runtimeArchiveInspection === null ||
          !sameValues(
            runtimeArchiveInspection.runtimeEvidenceEventRefs as
              readonly string[],
            basisRuntimeEventRefs,
          )
    ) ||
    !sameValues(ledgerObligations, actionRow.targetObligationRefs) ||
    !sameValues(evaluation.admittedEvidenceRefs, basisEvidenceRefs) ||
    !sameValues(
      evaluation.semanticEvidenceAssetRefs,
      basisEvidenceAssetRefs,
    ) ||
    !sameValues(ledgerEvidenceRefs, evaluation.admittedEvidenceRefs) ||
    !sameValues(semanticEvidenceAssetRefs, basisEvidenceAssetRefs) ||
    !sameValues(semanticEvidenceAssetRefs, actionRow.outputAssetRefs)
  ) {
    return refusal(
      "candidate_mismatch",
      "action fold does not cover the admitted intent, Product obligations, and complete runtime evidence",
    );
  }
  const runtimeEvidenceEventRefs = [
    ...basisRuntimeEventRefs,
    evidence.cCall.openedEventRef,
    evidence.cCall.fibreSelectedEventRef,
    evidenced.eventId,
    evidence.result.admissionEventRef,
    evidence.judgment.admissionEventRef,
  ];
  const actionEvaluationDigest = evaluation.actionEvaluationDigest;
  const actionEvaluationAdmissionBody = {
    constructionCompositionRef: composition.compositionRef,
    constructionCompositionDigest: composition.compositionDigest,
    actionEvaluationAuthorityRef: actionEvaluationAuthority.authorityRef,
    constructionIntentRef: intent.constructionIntentRef,
    constructionIntentDigest: intent.constructionIntentDigest,
    actionEvaluationRef: evaluation.actionEvaluationRef,
    actionEvaluationDigest,
    edgeFulfillmentLedgerRef: ledger.ledgerRef,
    edgeFulfillmentLedgerDigest: ledger.ledgerDigest,
    edgeClosureDecisionRef: decision.decisionRef,
    edgeClosureDecisionDigest: decision.decisionDigest,
    observationSnapshotDigest: sha256Canonical(
      evaluationObservation as unknown as JsonValue,
    ),
    workspaceBindingId: executionBasis.workspaceBindingId,
    workspaceBindingDigest: executionBasis.workspaceBindingDigest,
    semanticEvidenceAssetRefs,
    runtimeEvidenceEventRefs,
  };
  const actionEvaluationAdmissionDigest = sha256Canonical(
    actionEvaluationAdmissionBody as unknown as JsonValue,
  );
  const actionEvaluationAdmissionRef =
    `action-evaluation-admission://abiogenesis/${actionEvaluationAdmissionDigest.slice("sha256:".length)}`;
  const actionEvaluationAdmission = {
    kind: "admitted_action_evaluation",
    schemaVersion: "5.0.0",
    actionEvaluationAdmissionRef,
    actionEvaluationAdmissionDigest,
    ...actionEvaluationAdmissionBody,
  };
  const deltaBody = {
    actionEvaluationAdmissionRef,
    actionEvaluationAdmissionDigest,
    constructionCompositionRef: composition.compositionRef,
    constructionCompositionDigest: composition.compositionDigest,
    constructionIntentRef: intent.constructionIntentRef,
    constructionIntentDigest: intent.constructionIntentDigest,
    targetOutcomeRef: intent.targetOutcomeRef,
    workspaceBindingId: executionBasis.workspaceBindingId,
    workspaceBindingDigest: executionBasis.workspaceBindingDigest,
    actionEvaluationRef: evaluation.actionEvaluationRef,
    actionEvaluationDigest,
    edgeFulfillmentLedgerRef: ledger.ledgerRef,
    edgeFulfillmentLedgerDigest: ledger.ledgerDigest,
    edgeClosureDecisionRef: decision.decisionRef,
    edgeClosureDecisionDigest: decision.decisionDigest,
    semanticEvidenceAssetRefs,
    runtimeEvidenceEventRefs,
    sourceCCallRef: evidence.cCall.cCallRef,
    sourceResultRef: evidence.result.resultRef,
    sourceResultDigest: evidence.result.resultDigest,
    sourceJudgmentRef: evidence.judgment.judgmentRef,
    targetCursorRef: targetCursor.cursorRef,
    targetCursorDigest: targetCursor.cursorDigest,
  };
  const deltaDigest = sha256Canonical(deltaBody as unknown as JsonValue);
  return {
    causationEventRefs: runtimeEvidenceEventRefs,
    payload: {
      deltaRef:
        `construction-delta://abiogenesis/${deltaDigest.slice("sha256:".length)}`,
      deltaDigest,
      ...deltaBody,
      actionEvaluation: evaluation as unknown as JsonValue,
      actionEvaluationAdmission:
        actionEvaluationAdmission as unknown as JsonValue,
      edgeFulfillmentLedger: ledger as unknown as JsonValue,
      edgeClosureDecision: decision as unknown as JsonValue,
    } as unknown as Readonly<Record<string, JsonValue>>,
  };
}

export function hasResolvedRunConstructionIntentLineage(
  events: readonly RuntimeEvent[],
  runId: string,
  constructionCompositionRef: string,
  constructionCompositionDigest: string,
): boolean {
  const intentEvents = events.filter(
    (event) =>
      event.kind === "construction_intent_selected" &&
      event.runId === runId &&
      isJsonRecord(event.payload),
  );
  return intentEvents.every((event) => {
    if (!isJsonRecord(event.payload)) return false;
    const eventIntentRef = event.payload.constructionIntentRef;
    const eventIntentDigest = event.payload.constructionIntentDigest;
    return typeof eventIntentRef === "string" &&
      typeof eventIntentDigest === "string" &&
      events.some(
        (candidate) =>
          candidate.kind === "construction_delta_observed" &&
          candidate.runId === runId &&
          candidate.graphCallId === event.graphCallId &&
          candidate.frameId === event.frameId &&
          candidate.admissionOrdinal > event.admissionOrdinal &&
          isJsonRecord(candidate.payload) &&
          candidate.payload.constructionIntentRef === eventIntentRef &&
          candidate.payload.constructionIntentDigest === eventIntentDigest &&
          candidate.payload.constructionCompositionRef ===
            constructionCompositionRef &&
          candidate.payload.constructionCompositionDigest ===
            constructionCompositionDigest &&
          typeof candidate.payload.actionEvaluationAdmissionRef ===
            "string" &&
          typeof candidate.payload.actionEvaluationAdmissionDigest ===
            "string",
      );
  });
}

function hasGovernedConstructionClosure(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  evidence:
    | InteractionResumeRouteAdmissionEvidence
    | RouteAdmissionEvidence,
): boolean {
  const events = store.readAll();
  const composition = admittedConstructionComposition(executionBasis, graph);
  const nextActionAuthority = constructionAuthority(
    executionBasis,
    graph,
    "evaluateNext",
  );
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if (
    composition === null ||
    nextActionAuthority === null ||
    sourceTerm.kind !== "c_of" ||
    sourceTerm.compositionRef !== composition.compositionRef ||
    sourceTerm.programLocusRef !==
      nextActionAuthority.refreshProgramLocusRef
  ) {
    return composition === null;
  }
  const intentEvents = events.filter(
    (event) =>
      event.kind === "construction_intent_selected" &&
      event.runId === sourceCursor.runId &&
      isJsonRecord(event.payload),
  );
  if (intentEvents.length === 0) return true;
  if ("resume" in evidence) return false;
  const projection = convergedNextActionProjection(evidence.result.value);
  if (projection === null) return false;
  const intentEvent = intentEvents.find(
    (event) =>
      isJsonRecord(event.payload) &&
      event.payload.constructionIntentRef ===
        projection.constructionIntentRef,
  );
  const intentRef =
    intentEvent !== undefined && isJsonRecord(intentEvent.payload)
      ? intentEvent.payload.constructionIntentRef
      : undefined;
  if (typeof intentRef !== "string") return false;
  const everyRunIntentResolved = hasResolvedRunConstructionIntentLineage(
    events,
    sourceCursor.runId,
    composition.compositionRef,
    composition.compositionDigest,
  );
  if (!everyRunIntentResolved) return false;
  const deltaEvent = events.find(
    (event) =>
      event.kind === "construction_delta_observed" &&
      event.runId === sourceCursor.runId &&
      event.graphCallId === intentEvent?.graphCallId &&
      event.frameId === intentEvent?.frameId &&
      isJsonRecord(event.payload) &&
      event.payload.constructionIntentRef === intentRef &&
      event.payload.constructionCompositionRef ===
        composition.compositionRef &&
      event.payload.constructionCompositionDigest ===
        composition.compositionDigest &&
      event.payload.edgeClosureDecisionRef ===
        projection.edgeClosureDecisionRef &&
      event.payload.targetOutcomeRef === projection.targetOutcomeRef,
  );
  const refreshedBasisEvent = events.find(
    (event) =>
      deltaEvent !== undefined &&
      event.kind === "c_call_result_admitted" &&
      event.runId === sourceCursor.runId &&
      event.graphCallId === sourceCursor.graphCallId &&
      event.frameId === sourceCursor.frameId &&
      event.admissionOrdinal > deltaEvent.admissionOrdinal &&
      isJsonRecord(event.payload) &&
      event.payload.resultRef === sourceCursor.inputRef &&
      isJsonRecord(event.payload.value) &&
      nextActionBasis(event.payload.value) !== null &&
      isJsonRecord(event.payload.value.runtimeFrontier) &&
      event.payload.value.runtimeFrontier.phase === "post_evidence" &&
      isJsonRecord(event.payload.value.gapProjection) &&
      event.payload.value.gapProjection.gapRef === projection.gapRef,
  );
  const resultEvent = events.find(
    (event) => event.eventId === evidence.result.admissionEventRef,
  );
  const refreshedBasis =
    refreshedBasisEvent !== undefined &&
      isJsonRecord(refreshedBasisEvent.payload) &&
      isJsonRecord(refreshedBasisEvent.payload.value)
      ? nextActionBasis(refreshedBasisEvent.payload.value)
      : null;
  const refreshedObservation =
    refreshedBasis !== null &&
      isJsonRecord(refreshedBasis.observationSnapshot)
      ? refreshedBasis.observationSnapshot
      : null;
  const refreshedWorkspace =
    refreshedObservation !== null &&
      isJsonRecord(refreshedObservation.workspaceBinding)
      ? refreshedObservation.workspaceBinding
      : null;
  const refreshedPolicy =
    refreshedBasis !== null &&
      isJsonRecord(refreshedBasis.declaredPolicy)
      ? refreshedBasis.declaredPolicy
      : null;
  return deltaEvent !== undefined &&
    refreshedBasisEvent !== undefined &&
    refreshedBasis !== null &&
    refreshedObservation !== null &&
    refreshedWorkspace !== null &&
    refreshedPolicy !== null &&
    refreshedWorkspace.workspaceBindingId ===
      executionBasis.workspaceBindingId &&
    refreshedWorkspace.workspaceBindingDigest ===
      executionBasis.workspaceBindingDigest &&
    sha256Canonical(refreshedPolicy) ===
      sha256Canonical(
        composition.closurePolicy as unknown as JsonValue,
      ) &&
    projection.nextActionBasisRef === refreshedBasis.basisRef &&
    projection.nextActionBasisDigest === refreshedBasis.basisDigest &&
    projection.targetObligationBindings.length === 1 &&
    projection.targetObligationBindings[0]?.disposition === "fulfilled" &&
    Array.isArray(projection.priorityProjection.orderedActionRefs) &&
    projection.priorityProjection.orderedActionRefs.length === 0 &&
    resultEvent !== undefined &&
    deltaEvent.admissionOrdinal < refreshedBasisEvent.admissionOrdinal &&
    refreshedBasisEvent.admissionOrdinal < resultEvent.admissionOrdinal &&
    projection.constructionIntentRef === intentRef &&
    projection.lawfulBasisRefs.includes(projection.constructionIntentRef) &&
    projection.lawfulBasisRefs.includes(
      projection.edgeClosureDecisionRef,
    ) &&
    projection.lawfulBasisRefs.includes(projection.gapRef);
}

function sameValues(
  left: readonly string[],
  right: readonly string[],
): boolean {
  return left.join("\0") === right.join("\0");
}

function hasSameCursorLineage(
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
): boolean {
  return target.programRef === source.programRef &&
    target.executionBasisRef === source.executionBasisRef &&
    target.traversalScopeRef === source.traversalScopeRef &&
    target.runId === source.runId &&
    target.graphCallId === source.graphCallId &&
    target.frameId === source.frameId &&
    target.graphRef === source.graphRef &&
    target.position === "at_term";
}

function isDeclaredStructuralTarget(
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  routeKind: TraversalRouteKind,
): boolean {
  if (!hasSameCursorLineage(source, target)) return false;
  const term = resolveCProgramTermAtSourcePath(
    graph.template,
    source.currentNodeRef,
    source.termPath,
  );
  if (term.kind === "c_source_path_refusal") return false;
  let structuralInput: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
  }> = source;
  if (term.kind === "c_batch") {
    const batchInput = deriveCBatchTaskInput(
      graph,
      {
        nodeRef: source.currentNodeRef,
        termPath: source.termPath,
        taskOrdinal: source.taskOrdinal,
        inputRef: source.inputRef,
        inputDigest: source.inputDigest,
      },
      "enter_batch",
      term.batchRef,
      target.taskOrdinal ?? -1,
    );
    if (batchInput.kind === "c_source_path_refusal") return false;
    structuralInput = batchInput;
  }
  if (
    target.inputRef !== structuralInput.inputRef ||
    target.inputDigest !== structuralInput.inputDigest
  ) return false;
  const unchangedAttempt = target.attempt === source.attempt &&
    sameValues(target.retryPath.map(String), source.retryPath.map(String));
  switch (term.kind) {
    case "c_compose":
      return routeKind === "advance" &&
        target.currentNodeRef === source.currentNodeRef &&
        sameValues(target.termPath, [...source.termPath, "terms", "0"]) &&
        target.taskOrdinal === source.taskOrdinal &&
        unchangedAttempt;
    case "c_edge":
      return routeKind === "advance" &&
        target.currentNodeRef === source.currentNodeRef &&
        sameValues(target.termPath, [...source.termPath, "transform"]) &&
        target.taskOrdinal === source.taskOrdinal &&
        unchangedAttempt;
    case "c_batch":
      return routeKind === "advance" &&
        target.currentNodeRef === source.currentNodeRef &&
        sameValues(target.termPath, [...source.termPath, "tasks", "0"]) &&
        target.taskOrdinal === 0 &&
        unchangedAttempt;
    case "c_retry":
      return routeKind === "retry" &&
        target.currentNodeRef === source.currentNodeRef &&
        sameValues(target.termPath, [...source.termPath, "term"]) &&
        target.taskOrdinal === source.taskOrdinal &&
        target.attempt === 1 &&
        sameValues(
          target.retryPath.map(String),
          [...source.retryPath, 1].map(String),
        );
    case "c_identity": {
      const continuation = deriveCSourceContinuation(
        graph.template,
        source.currentNodeRef,
        source.termPath,
      );
      if (
        routeKind !== "advance" ||
        continuation.kind === "c_source_path_refusal" ||
        continuation.disposition !== "advance" ||
        continuation.targetPath === null ||
        continuation.targetRetryDepth > source.retryPath.length
      ) {
        return false;
      }
      const targetNodeRef = continuation.targetPath[0] === "node"
        ? continuation.targetPath[1]
        : null;
      const targetRetryPath = source.retryPath.slice(
        0,
        continuation.targetRetryDepth,
      );
      return targetNodeRef !== null &&
        target.currentNodeRef === targetNodeRef &&
        sameValues(target.termPath, continuation.targetPath) &&
        target.taskOrdinal === continuation.targetTaskOrdinal &&
        target.attempt === (targetRetryPath.at(-1) ?? 1) &&
        sameValues(
          target.retryPath.map(String),
          targetRetryPath.map(String),
        );
    }
    case "c_of":
    case "c_workflow":
      return false;
  }
}

type CompletedRetryProgressExpectation =
  | Readonly<{
    completionClass: "judged_success" | "fan_out_success" | "fh_resume_success";
    completionWitnessEventRef: string;
    cCallRef: string;
    resultRef: string;
    judgmentRef: string;
  }>
  | Readonly<{
    completionClass: "structural_identity_success";
    completionWitnessEventRef: string;
  }>;

function hasCompletedRetryProgressChain(
  prefix: ValidatedRuntimeEventPrefix,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  completedProgresses: readonly RetryCompletedProgressAdmission[],
  expected: CompletedRetryProgressExpectation,
): boolean {
  const targetRetryDepth = targetCursor?.retryPath.length ?? 0;
  const exitedRetryDepths = Array.from(
    { length: Math.max(0, sourceCursor.retryPath.length - targetRetryDepth) },
    (_, index) => sourceCursor.retryPath.length - index,
  );
  return completedProgresses.length === exitedRetryDepths.length &&
    completedProgresses.every((progress, index) =>
      progress.progressClass === "completed" &&
      progress.completionClass === expected.completionClass &&
      progress.completionWitnessEventRef ===
        expected.completionWitnessEventRef &&
      hasAdmittedRetryProgress(prefix, progress) &&
      progress.completedRetryDepth === exitedRetryDepths[index] &&
      (expected.completionClass === "structural_identity_success"
        ? !("cCallRef" in progress)
        : "cCallRef" in progress &&
          progress.cCallRef === expected.cCallRef &&
          progress.resultRef === expected.resultRef &&
          progress.judgmentRef === expected.judgmentRef) &&
      progress.sourceCursorRef === sourceCursor.cursorRef &&
      progress.sourceCursorDigest === sourceCursor.cursorDigest &&
      progress.targetCursorRef === (targetCursor?.cursorRef ?? null) &&
      progress.targetCursorDigest === (targetCursor?.cursorDigest ?? null) &&
      progress.predecessorProgressRef ===
        (index === 0 ? null : completedProgresses[index - 1]!.progressRef) &&
      sameValues(
        progress.retryPath.map(String),
        sourceCursor.retryPath.slice(0, exitedRetryDepths[index]).map(String),
      )
    );
}

function hasStructuralIdentityRouteEvidence(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: StructuralIdentityRouteAdmissionEvidence | null,
): evidence is StructuralIdentityRouteAdmissionEvidence {
  if (evidence === null) return false;
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  return sourceTerm.kind === "c_identity" &&
    candidate.routeKind === "advance" &&
    evidence.completionWitnessEventRef ===
      traversalCursorAdmissionEventRef(store, sourceCursor) &&
    hasCompletedRetryProgressChain(
      prefix,
      sourceCursor,
      targetCursor,
      evidence.completedProgresses,
      {
        completionClass: "structural_identity_success",
        completionWitnessEventRef: evidence.completionWitnessEventRef,
      },
    ) &&
    candidate.cCallRef === null && candidate.judgmentRef === null &&
    candidate.contractRef === null &&
    sameValues(
      candidate.consumedAvailabilityRefs,
      evidence.completedProgresses.map((progress) => progress.progressRef),
    ) &&
    isDeclaredStructuralTarget(
      graph,
      sourceCursor,
      targetCursor,
      candidate.routeKind,
    );
}

function hasJudgedRouteEvidence(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  candidate: RouteCandidate,
  evidence: RouteAdmissionEvidence | null,
): evidence is RouteAdmissionEvidence {
  const cCall = evidence?.cCall;
  const result = evidence?.result;
  const judgment = evidence?.judgment;
  const completedProgresses = evidence?.completedProgresses ?? [];
  const completedProgressMatches = cCall !== undefined &&
    result !== undefined && judgment !== undefined &&
    hasCompletedRetryProgressChain(
      prefix,
      sourceCursor,
      targetCursor,
      completedProgresses,
      {
        completionClass: "judged_success",
        completionWitnessEventRef: judgment.admissionEventRef,
        cCallRef: cCall.cCallRef,
        resultRef: result.resultRef,
        judgmentRef: judgment.judgmentRef,
      },
    );
  const term = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const locusMatches = term.kind === "c_of"
    ? cCall?.callClass === "leaf" && cCall.programLocusRef === term.programLocusRef
    : term.kind === "c_workflow"
      ? cCall?.callClass === "workflow" &&
        cCall.childGraphFunctionRef === term.graphFunctionRef &&
        cCall.inputContractRef === term.inputCarrierRef &&
        cCall.outputContractRef === term.outputCarrierRef
      : false;
  return cCall !== undefined &&
    result !== undefined &&
    judgment !== undefined &&
    locusMatches &&
    hasOpenedCCall(store, cCall) &&
    hasCurrentAdmittedCCallOutcome(store, cCall, result, judgment) &&
    result.cCallRef === cCall.cCallRef &&
    judgment.cCallRef === cCall.cCallRef &&
    judgment.resultRef === result.resultRef &&
    judgment.resultDigest === result.resultDigest &&
    judgment.judgment === "advance" &&
    completedProgressMatches &&
    cCall.basisId === executionBasis.basisRef &&
    cCall.frameId === sourceCursor.frameId &&
    cCall.graphCallId === sourceCursor.graphCallId &&
    cCall.taskOrdinal === sourceCursor.taskOrdinal &&
    cCall.attempt === sourceCursor.attempt &&
    sameValues(cCall.retryPath.map(String), sourceCursor.retryPath.map(String)) &&
    candidate.cCallRef === cCall.cCallRef &&
    candidate.judgmentRef === judgment.judgmentRef &&
    sameValues(candidate.consumedAvailabilityRefs, [
      judgment.judgmentRef,
      ...completedProgresses.map((progress) => progress.progressRef),
    ]) &&
    candidate.contractRef === cCall.transitionContractRef;
}

function hasBlockedRouteEvidence(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: BlockedRouteAdmissionEvidence | null,
): evidence is BlockedRouteAdmissionEvidence {
  const stoppedProgresses = evidence?.stoppedProgresses ?? [];
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll());
  const projectedRetryCCall = evidence === null || stoppedProgresses.length === 0
    ? null
    : projectOpenedCCallCarrier(
        store,
        prefix,
        graph,
        evidence.cCall.cCallRef,
      );
  const exactOpenedCarrier = evidence !== null &&
    (stoppedProgresses.length === 0
      ? hasOpenedCCall(store, evidence.cCall)
      : projectedRetryCCall !== null &&
        sha256Canonical(projectedRetryCCall as unknown as JsonValue) ===
          sha256Canonical(evidence.cCall as unknown as JsonValue));
  if (
    evidence === null ||
    !exactOpenedCarrier ||
    evidence.cCall.basisId !== executionBasis.basisRef ||
    evidence.cCall.frameId !== sourceCursor.frameId ||
    evidence.cCall.graphCallId !== sourceCursor.graphCallId ||
    candidate.cCallRef !== evidence.cCall.cCallRef ||
    candidate.judgmentRef !== evidence.judgmentRef ||
    candidate.targetCursorRef !== null ||
    candidate.targetCursorDigest !== null ||
    !sameValues(candidate.consumedAvailabilityRefs, [
      evidence.judgmentRef,
      ...stoppedProgresses.map((progress) => progress.progressRef),
    ]) ||
    candidate.contractRef !== evidence.cCall.transitionContractRef
  ) return false;
  const projected = replay(store, { runId: sourceCursor.runId }).cCalls.find(
    (row) => row.cCallRef === evidence.cCall.cCallRef,
  );
  const judgmentEvent = runtimeEventsFromValidatedPrefix(prefix).find(
    (event) => event.eventId === evidence.judgmentEventRef,
  );
  const contexts = resolveEnclosingCRetryContexts(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if ("kind" in contexts) return false;
  const exitedContexts = [...contexts].reverse();
  if (
    (stoppedProgresses.length > 0 &&
      stoppedProgresses.length !== exitedContexts.length) ||
    evidence.cCall.taskOrdinal !== sourceCursor.taskOrdinal ||
    evidence.cCall.attempt !== sourceCursor.attempt ||
    !sameValues(
      evidence.cCall.retryPath.map(String),
      sourceCursor.retryPath.map(String),
    )
  ) return false;
  const projectedStoppedProgresses = stoppedProgresses.map((progress) =>
    projectAdmittedRetryProgress(prefix, progress.admissionEventRef)
  );
  const stoppedSuffixMatches = projectedStoppedProgresses.every(
    (projectedProgress, index) => {
      const progress = stoppedProgresses[index]!;
      const context = exitedContexts[index]!;
      const expectedRetryPath = sourceCursor.retryPath.slice(
        0,
        context.retryDepth,
      );
      const expectedBoundaryRef =
        `retry-boundary://abiogenesis/${sha256Canonical({
          graphRef: graph.materializationRef,
          frameId: sourceCursor.frameId,
          nodeRef: sourceCursor.currentNodeRef,
          retryTermPath: context.retryTermPath,
        }).slice("sha256:".length)}`;
      return projectedProgress?.progressClass === "stopped" &&
        sha256Canonical(projectedProgress as unknown as JsonValue) ===
          sha256Canonical(progress as unknown as JsonValue) &&
        hasAdmittedRetryProgress(prefix, progress) &&
        progress.retryBoundaryRef === expectedBoundaryRef &&
        progress.cCallRef === evidence.cCall.cCallRef &&
        progress.resultRef === evidence.resultRef &&
        progress.judgmentRef === evidence.judgmentRef &&
        progress.failureSignalRef === evidence.reasonRef &&
        progress.attempt === expectedRetryPath.at(-1) &&
        sameValues(
          progress.retryPath.map(String),
          expectedRetryPath.map(String),
        ) &&
        (index === 0
          ? progress.stopReason === "boundary_terminal" &&
            progress.predecessorProgressRef === null &&
            progress.inputRef === sourceCursor.inputRef &&
            progress.inputDigest === sourceCursor.inputDigest
          : progress.stopReason === "propagated_inner_stop" &&
            progress.predecessorProgressRef ===
              stoppedProgresses[index - 1]!.progressRef);
    },
  );
  if (!stoppedSuffixMatches) return false;
  const exactStoppedProgresses = runtimeEventsFromValidatedPrefix(prefix)
    .filter((event) =>
      event.kind === "retry_progress_recorded" &&
      event.runId === sourceCursor.runId &&
      event.graphCallId === sourceCursor.graphCallId &&
      event.frameId === sourceCursor.frameId &&
      isJsonRecord(event.payload) &&
      event.payload.progressClass === "stopped"
    )
    .map((event) => projectAdmittedRetryProgress(prefix, event.eventId))
    .filter((progress): progress is RetryStoppedProgressAdmission =>
      progress !== null &&
      progress.progressClass === "stopped" &&
      progress.cCallRef === evidence.cCall.cCallRef &&
      progress.resultRef === evidence.resultRef &&
      progress.judgmentRef === evidence.judgmentRef &&
      progress.failureSignalRef === evidence.reasonRef &&
      hasAdmittedRetryProgress(prefix, progress)
    );
  const completeSuffixMatches =
    exactStoppedProgresses.length === stoppedProgresses.length &&
    exactStoppedProgresses.every((progress, index) =>
      sha256Canonical(progress as unknown as JsonValue) ===
        sha256Canonical(stoppedProgresses[index] as unknown as JsonValue)
    );
  return completeSuffixMatches && projected?.status === "judged" &&
    projected.resultRef === evidence.resultRef &&
    projected.judgmentRef === evidence.judgmentRef &&
    projected.judgment === "blocked" &&
    judgmentEvent?.kind === "c_call_judged" &&
    judgmentEvent.aggregateId === evidence.cCall.cCallRef &&
    isJsonRecord(judgmentEvent.payload) &&
    judgmentEvent.payload.judgmentRef === evidence.judgmentRef &&
    judgmentEvent.payload.resultRef === evidence.resultRef &&
    judgmentEvent.payload.judgment === "blocked" &&
    judgmentEvent.payload.reasonRef === evidence.reasonRef;
}

function hasFailedRouteEvidence(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  sourceCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: RouteAdmissionEvidence | null,
): evidence is RouteAdmissionEvidence {
  if (
    evidence === null ||
    !hasOpenedCCall(store, evidence.cCall) ||
    !hasCurrentAdmittedCCallOutcome(
      store,
      evidence.cCall,
      evidence.result,
      evidence.judgment,
    ) ||
    evidence.cCall.basisId !== executionBasis.basisRef ||
    evidence.cCall.frameId !== sourceCursor.frameId ||
    evidence.cCall.graphCallId !== sourceCursor.graphCallId ||
    evidence.cCall.taskOrdinal !== sourceCursor.taskOrdinal ||
    evidence.cCall.attempt !== sourceCursor.attempt ||
    evidence.result.cCallRef !== evidence.cCall.cCallRef ||
    evidence.result.resultClass !== "failure" ||
    evidence.judgment.cCallRef !== evidence.cCall.cCallRef ||
    evidence.judgment.resultRef !== evidence.result.resultRef ||
    evidence.judgment.resultDigest !== evidence.result.resultDigest ||
    evidence.judgment.judgment !== "blocked" ||
    candidate.cCallRef !== evidence.cCall.cCallRef ||
    candidate.judgmentRef !== evidence.judgment.judgmentRef ||
    candidate.targetCursorRef !== null ||
    candidate.targetCursorDigest !== null ||
    candidate.consumedAvailabilityRefs.length !== 1 ||
    candidate.consumedAvailabilityRefs[0] !== evidence.judgment.judgmentRef ||
    candidate.contractRef !== evidence.cCall.transitionContractRef
  ) return false;
  return true;
}

function hasHoldRouteEvidence(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: HoldRouteAdmissionEvidence | null,
): evidence is HoldRouteAdmissionEvidence {
  if (evidence === null) return false;
  const term = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  return term.kind !== "c_source_path_refusal" &&
    isInteractionCLeaf(term) &&
    hasOpenedCCall(store, evidence.cCall) &&
    hasCurrentAdmittedCCallOutcome(
      store,
      evidence.cCall,
      evidence.result,
      evidence.judgment,
    ) &&
    evidence.cCall.basisId === executionBasis.basisRef &&
    evidence.cCall.regime === "F_H" &&
    evidence.cCall.frameId === sourceCursor.frameId &&
    evidence.cCall.graphCallId === sourceCursor.graphCallId &&
    evidence.cCall.programLocusRef === term.programLocusRef &&
    evidence.result.cCallRef === evidence.cCall.cCallRef &&
    evidence.result.resultClass === "pending" &&
    evidence.judgment.cCallRef === evidence.cCall.cCallRef &&
    evidence.judgment.resultRef === evidence.result.resultRef &&
    evidence.judgment.resultDigest === evidence.result.resultDigest &&
    evidence.judgment.judgment === "pending" &&
    candidate.cCallRef === evidence.cCall.cCallRef &&
    candidate.judgmentRef === evidence.judgment.judgmentRef &&
    candidate.targetCursorRef === null &&
    candidate.targetCursorDigest === null &&
    candidate.consumedAvailabilityRefs.length === 1 &&
    candidate.consumedAvailabilityRefs[0] ===
      evidence.judgment.judgmentRef &&
    candidate.contractRef === evidence.cCall.continuationContractRef;
}

function hasInteractionResumeRouteEvidence(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  candidate: RouteCandidate,
  evidence: InteractionResumeRouteAdmissionEvidence | null,
): evidence is InteractionResumeRouteAdmissionEvidence {
  if (evidence === null) return false;
  const completedProgresses = evidence.completedProgresses ?? [];
  const term = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  const continuation = replay(store, {
    runId: sourceCursor.runId,
  }).continuations.find(
    (row) => row.continuationRef === evidence.resume.continuationRef,
  );
  const resumeEvent = store.readAll().find(
    (event) => event.eventId === evidence.resume.admissionEventRef,
  );
  return term.kind !== "c_source_path_refusal" &&
    isInteractionCLeaf(term) &&
    hasOpenedCCall(store, evidence.cCall) &&
    hasCurrentAdmittedCCallOutcome(
      store,
      evidence.cCall,
      evidence.result,
      evidence.judgment,
    ) &&
    evidence.cCall.basisId === executionBasis.basisRef &&
    evidence.cCall.regime === "F_H" &&
    evidence.cCall.frameId === sourceCursor.frameId &&
    evidence.cCall.graphCallId === sourceCursor.graphCallId &&
    evidence.cCall.programLocusRef === term.programLocusRef &&
    evidence.result.cCallRef === evidence.cCall.cCallRef &&
    evidence.result.resultClass === "pending" &&
    evidence.judgment.cCallRef === evidence.cCall.cCallRef &&
    evidence.judgment.resultRef === evidence.result.resultRef &&
    evidence.judgment.resultDigest === evidence.result.resultDigest &&
    evidence.judgment.judgment === "pending" &&
    continuation?.status === "resolved" &&
    continuation.cCallRef === evidence.cCall.cCallRef &&
    continuation.responseRef === evidence.resume.responseRef &&
    continuation.responseDigest === evidence.resume.responseDigest &&
    continuation.successorCursorRef === sourceCursor.cursorRef &&
    continuation.successorCursorDigest === sourceCursor.cursorDigest &&
    resumeEvent?.kind === "fh_interaction_resume_admitted" &&
    resumeEvent.runId === sourceCursor.runId &&
    resumeEvent.graphCallId === sourceCursor.graphCallId &&
    resumeEvent.frameId === sourceCursor.frameId &&
    sourceCursor.cursorRef === evidence.resume.successorCursorRef &&
    sourceCursor.cursorDigest === evidence.resume.successorCursorDigest &&
    sourceCursor.inputRef === evidence.resume.successorInputRef &&
    sourceCursor.inputDigest === evidence.resume.successorInputDigest &&
    hasCompletedRetryProgressChain(
      prefix,
      sourceCursor,
      targetCursor,
      completedProgresses,
      {
        completionClass: "fh_resume_success",
        completionWitnessEventRef: evidence.resume.admissionEventRef,
        cCallRef: evidence.cCall.cCallRef,
        resultRef: evidence.result.resultRef,
        judgmentRef: evidence.judgment.judgmentRef,
      },
    ) &&
    candidate.cCallRef === evidence.cCall.cCallRef &&
    candidate.judgmentRef === evidence.judgment.judgmentRef &&
    sameValues(candidate.consumedAvailabilityRefs, [
      evidence.judgment.judgmentRef,
      evidence.resume.admissionEventRef,
      ...completedProgresses.map((progress) => progress.progressRef),
    ]) &&
    candidate.contractRef === evidence.cCall.transitionContractRef &&
    isDeclaredInteractionResumeTarget(
      graph,
      sourceCursor,
      targetCursor,
      candidate,
      evidence.resume,
    );
}

function hasRetryRouteEvidence(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: RetryRouteAdmissionEvidence | null,
): evidence is RetryRouteAdmissionEvidence {
  if (
    evidence === null ||
    evidence.progress.progressClass !== "retry" ||
    !hasOpenedCCall(store, evidence.cCall) ||
    !hasAdmittedRetryProgress(prefix, evidence.progress) ||
    evidence.cCall.basisId !== executionBasis.basisRef ||
    evidence.cCall.frameId !== sourceCursor.frameId ||
    evidence.cCall.graphCallId !== sourceCursor.graphCallId ||
    evidence.cCall.attempt !== sourceCursor.attempt ||
    !sameValues(
      evidence.cCall.retryPath.map(String),
      sourceCursor.retryPath.map(String),
    ) ||
    evidence.progress.cCallRef !== evidence.cCall.cCallRef ||
    evidence.progress.attempt !== sourceCursor.attempt ||
    evidence.progress.remainingBudget < 1 ||
    candidate.routeKind !== "retry" ||
    candidate.cCallRef !== evidence.cCall.cCallRef ||
    candidate.judgmentRef !== evidence.progress.judgmentRef ||
    !sameValues(candidate.consumedAvailabilityRefs, [
      evidence.progress.judgmentRef,
      evidence.progress.progressRef,
    ]) ||
    candidate.contractRef !== evidence.cCall.transitionContractRef
  ) return false;
  const contexts = resolveEnclosingCRetryContexts(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if ("kind" in contexts) return false;
  const context = contexts.at(-1);
  if (
    context === undefined ||
    context.retryDepth !== sourceCursor.retryPath.length ||
    context.retryDepth !== targetCursor.retryPath.length ||
    evidence.progress.retryBoundaryRef.length === 0
  ) return false;
  const nextAttempt = sourceCursor.attempt + 1;
  return hasSameCursorLineage(sourceCursor, targetCursor) &&
    targetCursor.currentNodeRef === sourceCursor.currentNodeRef &&
    sameValues(targetCursor.termPath, context.wrappedTermPath) &&
    targetCursor.taskOrdinal === context.taskOrdinal &&
    targetCursor.attempt === nextAttempt &&
    sameValues(
      targetCursor.retryPath.map(String),
      [...sourceCursor.retryPath.slice(0, -1), nextAttempt].map(String),
    ) &&
    targetCursor.inputRef === evidence.progress.inputRef &&
    targetCursor.inputDigest === evidence.progress.inputDigest;
}

function hasFanOutRouteEvidence(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  candidate: RouteCandidate,
  evidence: FanOutRouteAdmissionEvidence | null,
): evidence is FanOutRouteAdmissionEvidence {
  if (evidence === null) return false;
  const completedProgresses = evidence?.completedProgresses ?? [];
  const projectedCompletion = projectExactFanOutCompletion(prefix, {
    mode: "graph_bound",
    admissionEventRef: evidence.completion.admissionEventRef,
    authority: {
      graph,
      application: evidence.application,
      basisId: executionBasis.basisRef,
      runId: sourceCursor.runId,
      graphCallId: sourceCursor.graphCallId,
      frameId: sourceCursor.frameId,
    },
  });
  if (
    !hasOpenedCCall(store, evidence.cCall) ||
    !hasCurrentAdmittedCCallOutcome(
      store,
      evidence.cCall,
      evidence.result,
      evidence.judgment,
    ) ||
    projectedCompletion?.kind !== "fan_out_completion_admission" ||
    sha256Canonical(evidence.completion as unknown as JsonValue) !==
      sha256Canonical(projectedCompletion as unknown as JsonValue) ||
    graph.template.applications.find(
      (application) =>
        application.applicationRef === evidence.application.applicationRef,
    ) !== evidence.application ||
    evidence.application.relationKind !== "fan_out" ||
    evidence.application.applicationRef !==
      graphFunctionApplicationRef(evidence.application) ||
    evidence.cCall.basisId !== executionBasis.basisRef ||
    evidence.cCall.frameId !== sourceCursor.frameId ||
    evidence.cCall.graphCallId !== sourceCursor.graphCallId ||
    evidence.cCall.batchRef !== evidence.application.batchRef ||
    evidence.cCall.taskOrdinal !== sourceCursor.taskOrdinal ||
    evidence.result.cCallRef !== evidence.cCall.cCallRef ||
    evidence.judgment.cCallRef !== evidence.cCall.cCallRef ||
    evidence.judgment.resultRef !== evidence.result.resultRef ||
    evidence.judgment.resultDigest !== evidence.result.resultDigest ||
    evidence.completion.applicationRef !== evidence.application.applicationRef ||
    evidence.completion.batchRef !== evidence.application.batchRef ||
    candidate.cCallRef !== evidence.cCall.cCallRef ||
    !sameValues(candidate.consumedAvailabilityRefs, [
      evidence.completion.completionKind === "complete_vector"
        ? evidence.completion.taskRows.at(-1)?.judgmentRef ?? ""
        : evidence.completion.stoppingRow.judgmentRef,
      evidence.application.applicationRef,
      ...completedProgresses.map((progress) => progress.progressRef),
    ]) ||
    candidate.contractRef !== evidence.cCall.transitionContractRef
  ) return false;
  if (evidence.completion.completionKind === "partial_stop") {
    return completedProgresses.length === 0 &&
      candidate.routeKind === "blocked" &&
      targetCursor === null &&
      candidate.targetCursorRef === null &&
      candidate.targetCursorDigest === null &&
      candidate.judgmentRef === evidence.completion.stoppingRow.judgmentRef &&
      evidence.result.resultRef === evidence.completion.stoppingRow.resultRef &&
      evidence.judgment.judgmentRef ===
        evidence.completion.stoppingRow.judgmentRef &&
      evidence.completion.stoppingRow.cCallRef === evidence.cCall.cCallRef &&
      evidence.completion.stoppingRow.ordinal === sourceCursor.taskOrdinal;
  }
  const lastRow = evidence.completion.taskRows.at(-1);
  if (
    candidate.routeKind !== "advance" ||
    targetCursor === null ||
    lastRow === undefined ||
    lastRow.cCallRef !== evidence.cCall.cCallRef ||
    lastRow.resultRef !== evidence.result.resultRef ||
    lastRow.judgmentRef !== evidence.judgment.judgmentRef ||
    evidence.result.resultClass !== "success" ||
    evidence.judgment.judgment !== "advance" ||
    lastRow.ordinal !== sourceCursor.taskOrdinal ||
    candidate.judgmentRef !== lastRow.judgmentRef ||
    candidate.targetCursorRef !== targetCursor.cursorRef ||
    candidate.targetCursorDigest !== targetCursor.cursorDigest ||
    !hasSameCursorLineage(sourceCursor, targetCursor) ||
    targetCursor.inputRef !== evidence.completion.outputVectorRef ||
    targetCursor.inputDigest !== evidence.completion.outputVectorDigest
  ) return false;
  if (!hasCompletedRetryProgressChain(
    prefix,
    sourceCursor,
    targetCursor,
    completedProgresses,
    {
      completionClass: "fan_out_success",
      completionWitnessEventRef: evidence.completion.admissionEventRef,
      cCallRef: evidence.cCall.cCallRef,
      resultRef: evidence.result.resultRef,
      judgmentRef: evidence.judgment.judgmentRef,
    },
  )) return false;
  const continuation = deriveCSourceContinuation(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if (
    continuation.kind === "c_source_path_refusal" ||
    continuation.disposition !== "advance" ||
    continuation.relation !== "compose_next" ||
    continuation.targetPath === null ||
    !sameValues(targetCursor.termPath, continuation.targetPath)
  ) return false;
  const targetTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    targetCursor.currentNodeRef,
    targetCursor.termPath,
  );
  const fanInApplication = graph.template.applications.find(
    (application) =>
      application.relationKind === "fan_in" &&
      application.inputVectorRef === evidence.application.outputVectorRef,
  );
  return targetTerm.kind === "c_workflow" &&
    fanInApplication?.relationKind === "fan_in" &&
    targetTerm.graphFunctionRef === fanInApplication.reducerGraphFunctionRef;
}

function isDeclaredJudgedTarget(
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  result: AdmittedCCallResult,
): boolean {
  if (!hasSameCursorLineage(source, target)) return false;
  const continuation = deriveCContinuationTarget(graph, {
    nodeRef: source.currentNodeRef,
    termPath: source.termPath,
    taskOrdinal: source.taskOrdinal,
    attempt: source.attempt,
    retryPath: source.retryPath,
    inputRef: source.inputRef,
    inputDigest: source.inputDigest,
  }, { inputRef: result.resultRef, inputDigest: result.valueDigest });
  if (
    continuation.kind === "c_source_path_refusal" ||
    continuation.disposition !== "advance" ||
    continuation.termPath === null
  ) {
    return false;
  }
  return target.currentNodeRef === continuation.nodeRef &&
    sameValues(target.termPath, continuation.termPath) &&
    target.inputRef === continuation.inputRef &&
    target.inputDigest === continuation.inputDigest &&
    target.taskOrdinal === continuation.taskOrdinal &&
    target.attempt === continuation.attempt &&
    sameValues(target.retryPath.map(String), continuation.retryPath.map(String));
}

function hasGraphSpanReentryRouteEvidence(
  store: AbgEventStore,
  prefix: ValidatedRuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: RouteAdmissionEvidence | null,
): evidence is RouteAdmissionEvidence {
  if (
    evidence === null ||
    candidate.routeKind !== "re_enter" ||
    !hasJudgedRouteEvidence(
      store,
      prefix,
      executionBasis,
      graph,
      source,
      target,
      candidate,
      evidence,
    ) ||
    candidate.graphSpanReentryProjection === undefined ||
    candidate.graphSpanReentryProjectionRef === undefined ||
    candidate.graphSpanReentryProjectionDigest === undefined
  ) {
    return false;
  }
  const projection = graphSpanReentryProjection(
    candidate.graphSpanReentryProjection as unknown as JsonValue,
  );
  if (
    projection === null ||
    projection.projectionRef !==
      candidate.graphSpanReentryProjectionRef ||
    projection.projectionDigest !==
      candidate.graphSpanReentryProjectionDigest ||
    sha256Canonical(evidence.result.value) !==
      sha256Canonical(projection as unknown as JsonValue)
  ) {
    return false;
  }
  const application = graph.template.applications.find(
    (row): row is ReenterApplication =>
      row.relationKind === "re_enter" &&
      row.applicationRef === projection.applicationRef,
  );
  const sourceLocus = resolveCProgramLocus(
    graph.template,
    projection.sourceProgramLocusRef,
  );
  const targetLocus = resolveCProgramLocus(
    graph.template,
    projection.targetProgramLocusRef,
  );
  if (
    application === undefined ||
    application.applicationRef !== graphFunctionApplicationRef(application) ||
    projection.graphFunctionRef !== graph.graphFunctionRef ||
    projection.graphFunctionRef !== executionBasis.graphFunctionRef ||
    application.graphFunctionRef !== projection.graphFunctionRef ||
    application.sourceProgramLocusRef !==
      projection.sourceProgramLocusRef ||
    application.targetProgramLocusRef !==
      projection.targetProgramLocusRef ||
    sourceLocus.kind !== "c_program_locus" ||
    targetLocus.kind !== "c_program_locus" ||
    sourceLocus.nodeRef !== targetLocus.nodeRef ||
    sourceLocus.leaf.outputCarrierRef !== application.inputContractRef ||
    targetLocus.leaf.inputCarrierRef !== application.outputContractRef ||
    evidence.cCall.programLocusRef !==
      application.sourceProgramLocusRef ||
    evidence.cCall.outputContractRef !== application.inputContractRef ||
    !hasSameCursorLineage(source, target) ||
    target.currentNodeRef !== targetLocus.nodeRef ||
    !sameValues(target.termPath, targetLocus.termPath) ||
    target.inputRef !== projection.targetInputRef ||
    target.inputDigest !== projection.targetInputDigest ||
    target.taskOrdinal !== null ||
    target.attempt !== source.attempt + 1 ||
    target.retryPath.length !== 0 ||
    candidate.targetCursorRef !== target.cursorRef ||
    candidate.targetCursorDigest !== target.cursorDigest
  ) {
    return false;
  }
  const priorApplications = store.readAll().filter(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.runId === source.runId &&
      isJsonRecord(event.payload) &&
      event.payload.routeKind === "re_enter" &&
      isJsonRecord(event.payload.graphSpanReentryProjection) &&
      event.payload.graphSpanReentryProjection.applicationRef ===
        application.applicationRef,
  ).length;
  return priorApplications < application.maxApplications;
}

function isDeclaredTerminalSource(
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
): boolean {
  const continuation = deriveCSourceContinuation(
    graph.template,
    source.currentNodeRef,
    source.termPath,
  );
  return continuation.kind === "c_source_continuation" &&
    continuation.disposition === "terminal" &&
    continuation.targetPath === null &&
    graph.template.terminalNodeRefs.includes(source.currentNodeRef);
}

function isDeclaredInteractionResumeTarget(
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate | null,
  candidate: RouteCandidate,
  resume: FhInteractionResumeAdmission,
): boolean {
  const continuation = deriveCContinuationTarget(graph, {
    nodeRef: source.currentNodeRef,
    termPath: source.termPath,
    taskOrdinal: source.taskOrdinal,
    attempt: source.attempt,
    retryPath: source.retryPath,
    inputRef: source.inputRef,
    inputDigest: source.inputDigest,
  }, {
    inputRef: resume.successorInputRef,
    inputDigest: resume.successorInputDigest,
  });
  if (continuation.kind === "c_source_path_refusal") return false;
  if (continuation.disposition === "terminal") {
    return candidate.routeKind === "terminal" &&
      target === null &&
      candidate.targetCursorRef === null &&
      candidate.targetCursorDigest === null &&
      isDeclaredTerminalSource(graph, source);
  }
  if (
    candidate.routeKind !== "advance" ||
    continuation.disposition !== "advance" ||
    continuation.termPath === null ||
    target === null ||
    !hasSameCursorLineage(source, target) ||
    candidate.targetCursorRef !== target.cursorRef ||
    candidate.targetCursorDigest !== target.cursorDigest ||
    continuation.nodeRef === null
  ) {
    return false;
  }
  return target.currentNodeRef === continuation.nodeRef &&
    sameValues(target.termPath, continuation.termPath) &&
    target.inputRef === continuation.inputRef &&
    target.inputDigest === continuation.inputDigest &&
    target.taskOrdinal === continuation.taskOrdinal &&
    target.attempt === continuation.attempt &&
    sameValues(
      target.retryPath.map(String),
      continuation.retryPath.map(String),
    );
}

export function admitRoute(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  replayState: ReplayState,
  candidate: RouteCandidate,
  basis: RuntimeAdmissionBasis,
  evidence:
    | RouteAdmissionEvidence
    | BlockedRouteAdmissionEvidence
    | FanOutRouteAdmissionEvidence
    | HoldRouteAdmissionEvidence
    | InteractionResumeRouteAdmissionEvidence
    | RetryRouteAdmissionEvidence
    | StructuralIdentityRouteAdmissionEvidence
    | null = null,
  options: RouteAdmissionOptions = {},
): RouteAdmissionResult {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    executionBasis.basisRef !== sourceCursor.executionBasisRef ||
    executionBasis.programRef !== sourceCursor.programRef ||
    executionBasis.graphRef !== sourceCursor.graphRef ||
    executionBasis.graphRef !== graph.materializationRef ||
    executionBasis.graphDigest !== graph.materializationDigest
  ) {
    return refusal(
      "basis_mismatch",
      "route admission requires the exact admitted ExecutionBasis and original Graph",
    );
  }
  if (
    !isMaterializedGtlGraph(graph) ||
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
    sourceCursor.cursorRef !== candidate.sourceCursorRef ||
    sourceCursor.cursorDigest !== candidate.sourceCursorDigest
  ) {
    return refusal(
      "cursor_mismatch",
      "route source is not an admitted cursor under the exact original Graph",
    );
  }
  const currentReplay = replay(store, { runId: sourceCursor.runId });
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll(), {
    runId: sourceCursor.runId,
  });
  const frameEvents = runtimeEventsFromValidatedPrefix(prefix).filter(
    (event) => event.runId === sourceCursor.runId && event.frameId === sourceCursor.frameId,
  );
  const latestCursorEvent = frameEvents.slice().reverse().find(
    (event) =>
      event.kind === "fh_interaction_resume_admitted" ||
      event.kind === "traversal_route_admitted",
  );
  const initialCursorEvent = frameEvents.slice().reverse().find(
    (event) => event.kind === "traversal_cursor_entered",
  );
  const currentCursorRef = latestCursorEvent !== undefined &&
      isJsonRecord(latestCursorEvent.payload)
    ? latestCursorEvent.kind === "fh_interaction_resume_admitted"
      ? latestCursorEvent.payload.successorCursorRef
      : latestCursorEvent.payload.targetCursorRef
    : initialCursorEvent !== undefined && isJsonRecord(initialCursorEvent.payload)
      ? initialCursorEvent.payload.cursorRef
      : null;
  if (
    currentReplay.replayDigest !== replayState.replayDigest ||
    candidate.replayStateDigest !== replayState.replayDigest ||
    currentCursorRef !== sourceCursor.cursorRef
  ) {
    return refusal(
      "replay_mismatch",
      "route candidate is not based on the current replay cursor and truth",
    );
  }
  const body = candidateBody(candidate);
  const expectedDigest = sha256Canonical(body);
  if (
    candidate.declarationRef !== graph.materializationRef ||
    candidate.declarationDigest !== graph.materializationDigest ||
    candidate.kind !== "traversal_route_candidate" ||
    candidate.schemaVersion !== "5.0.0" ||
    candidate.candidateDigest !== expectedDigest ||
    candidate.candidateRef !==
      `route-candidate://abiogenesis/${expectedDigest.slice("sha256:".length)}`
  ) {
    return refusal(
      "candidate_mismatch",
      "route candidate identity or transition contract differs from admitted truth",
    );
  }
  if (
    currentReplay.routes.some(
      (route) => route.sourceCursorRef === sourceCursor.cursorRef,
    )
  ) {
    return refusal(
      "route_already_admitted",
      "one traversal cursor cannot admit a second outgoing route",
    );
  }

  let causationEventRef = traversalCursorAdmissionEventRef(store, sourceCursor);
  let additionalCausationEventRefs: readonly string[] = [];
  let admittedNoActionStop: {
    readonly projection: NoActionNextActionProjection;
    readonly basis: Readonly<Record<string, JsonValue>>;
  } | null = null;
  if (candidate.routeKind === "terminal") {
    const resumeEvidence = evidence !== null && "resume" in evidence
      ? evidence
      : null;
    const judgedEvidence =
      resumeEvidence === null && evidence !== null && "result" in evidence
        ? evidence
        : null;
    if (resumeEvidence !== null) {
      if (!hasInteractionResumeRouteEvidence(
        store,
        prefix,
        executionBasis,
        graph,
        sourceCursor,
        null,
        candidate,
        resumeEvidence,
      )) {
        return refusal(
          "judgment_mismatch",
          "terminal F_H route requires the exact admitted response and resume cursor",
        );
      }
      if (
        !hasGovernedConstructionClosure(
          store,
          executionBasis,
          graph,
          sourceCursor,
          resumeEvidence,
        )
      ) {
        return refusal(
          "judgment_mismatch",
          "terminal construction closure requires an admitted evidence fold and refreshed convergence projection",
        );
      }
      causationEventRef = resumeEvidence.completedProgresses?.at(-1)
        ?.admissionEventRef ?? resumeEvidence.resume.admissionEventRef;
      additionalCausationEventRefs = (resumeEvidence.completedProgresses ?? [])
        .slice(0, -1)
        .map((progress) => progress.admissionEventRef);
    } else {
      if (!hasJudgedRouteEvidence(
        store,
        prefix,
        executionBasis,
        graph,
        sourceCursor,
        null,
        candidate,
        judgedEvidence,
      )) {
        return refusal(
          "judgment_mismatch",
          "terminal route requires this cursor's admitted CCall advance judgment",
        );
      }
      if (
        !hasGovernedConstructionClosure(
          store,
          executionBasis,
          graph,
          sourceCursor,
          judgedEvidence,
        )
      ) {
        return refusal(
          "judgment_mismatch",
          "terminal construction closure requires an admitted evidence fold and refreshed convergence projection",
        );
      }
      causationEventRef = judgedEvidence.completedProgresses?.at(-1)?.admissionEventRef ??
        judgedEvidence.judgment.admissionEventRef;
    }
    if (
      targetCursor !== null ||
      candidate.targetCursorRef !== null ||
      candidate.targetCursorDigest !== null ||
      !isDeclaredTerminalSource(graph, sourceCursor)
    ) {
      return refusal(
        "terminal_not_declared",
        "terminal route differs from the exact GTL declaration or carries a target cursor",
      );
    }
  } else if (
    candidate.routeKind === "advance" ||
    candidate.routeKind === "re_enter" ||
    candidate.routeKind === "retry"
  ) {
    if (
      targetCursor === null ||
      !isTraversalCursorCandidate(targetCursor) ||
      hasAdmittedTraversalCursor(store, targetCursor) ||
      candidate.targetCursorRef !== targetCursor.cursorRef ||
      candidate.targetCursorDigest !== targetCursor.cursorDigest
    ) {
      return refusal(
        "candidate_mismatch",
        "route target is not one exact new cursor under the admitted GTL Graph",
      );
    }
    if (candidate.routeKind === "re_enter") {
      const reentryEvidence =
        evidence !== null && "result" in evidence && !("resume" in evidence)
          ? evidence
          : null;
      if (
        targetCursor === null ||
        !hasGraphSpanReentryRouteEvidence(
          store,
          prefix,
          executionBasis,
          graph,
          sourceCursor,
          targetCursor,
          candidate,
          reentryEvidence,
        )
      ) {
        return refusal(
          "graph_span_reentry_mismatch",
          "graph-span re-entry requires the exact Product projection, bounded GTL application, judged C-call, and target cursor",
        );
      }
      causationEventRef = reentryEvidence.judgment.admissionEventRef;
    } else if (evidence === null) {
      if (
        targetCursor.retryPath.length < sourceCursor.retryPath.length ||
        candidate.cCallRef !== null ||
        candidate.judgmentRef !== null ||
        candidate.consumedAvailabilityRefs.length !== 0 ||
        candidate.contractRef !== null ||
        !isDeclaredStructuralTarget(
          graph,
          sourceCursor,
          targetCursor,
          candidate.routeKind,
        )
      ) {
        return refusal(
          "candidate_mismatch",
          "structural route is not the exact next cursor declared by the original GTL term",
        );
      }
    } else if ("completionClass" in evidence) {
      if (!hasStructuralIdentityRouteEvidence(
        store,
        prefix,
        graph,
        sourceCursor,
        targetCursor,
        candidate,
        evidence,
      )) {
        return refusal(
          "candidate_mismatch",
          "structural identity retry exit requires its exact completed-progress chain",
        );
      }
      causationEventRef = evidence.completedProgresses.at(-1)?.admissionEventRef ??
        evidence.completionWitnessEventRef;
      additionalCausationEventRefs = evidence.completedProgresses
        .slice(0, -1)
        .map((progress) => progress.admissionEventRef);
    } else if ("resume" in evidence) {
      if (
        candidate.routeKind !== "advance" ||
        !hasInteractionResumeRouteEvidence(
          store,
          prefix,
          executionBasis,
          graph,
          sourceCursor,
          targetCursor,
          candidate,
          evidence,
        )
      ) {
        return refusal(
          "judgment_mismatch",
          "F_H advance route requires the exact admitted response and declared target",
        );
      }
      causationEventRef = evidence.completedProgresses?.at(-1)?.admissionEventRef ??
        evidence.resume.admissionEventRef;
      additionalCausationEventRefs = (evidence.completedProgresses ?? [])
        .slice(0, -1)
        .map((progress) => progress.admissionEventRef);
    } else if ("completion" in evidence) {
      if (
        candidate.routeKind !== "advance" ||
        !hasFanOutRouteEvidence(
          store,
          prefix,
          executionBasis,
          graph,
          sourceCursor,
          targetCursor,
          candidate,
          evidence,
        )
      ) {
        return refusal(
          "judgment_mismatch",
          "fan-out route requires exact admitted complete-vector truth",
        );
      }
      causationEventRef = evidence.completedProgresses?.at(-1)?.admissionEventRef ??
        evidence.completion.admissionEventRef;
      additionalCausationEventRefs = (evidence.completedProgresses ?? [])
        .slice(0, -1)
        .map((progress) => progress.admissionEventRef);
    } else if ("result" in evidence) {
      if (
        candidate.routeKind !== "advance" ||
        !hasJudgedRouteEvidence(
          store,
          prefix,
          executionBasis,
          graph,
          sourceCursor,
          targetCursor,
          candidate,
          evidence,
        ) ||
        !isDeclaredJudgedTarget(graph, sourceCursor, targetCursor, evidence.result)
      ) {
        return refusal(
          "judgment_mismatch",
          "post-judgment route is not the exact declared GTL continuation",
        );
      }
      causationEventRef = evidence.completedProgresses?.at(-1)?.admissionEventRef ??
        evidence.judgment.admissionEventRef;
    } else if (
      "progress" in evidence &&
      candidate.routeKind === "retry" &&
      hasRetryRouteEvidence(
        store,
        prefix,
        executionBasis,
        graph,
        sourceCursor,
        targetCursor,
        candidate,
        evidence,
      )
    ) {
      causationEventRef = evidence.progress.admissionEventRef;
    } else {
      return refusal(
        "judgment_mismatch",
        "post-call route requires admitted judgment or retry-progress evidence",
      );
    }
  } else if (candidate.routeKind === "hold") {
    const holdEvidence = evidence !== null && "result" in evidence
      ? evidence
      : null;
    if (
      targetCursor !== null ||
      !hasHoldRouteEvidence(
        store,
        executionBasis,
        graph,
        sourceCursor,
        candidate,
        holdEvidence,
      )
    ) {
      return refusal(
        "judgment_mismatch",
        "hold route requires this F_H cursor's admitted pending judgment",
      );
    }
    causationEventRef = holdEvidence.judgment.admissionEventRef;
  } else if (candidate.routeKind === "gap_stop") {
    const gapEvidence = evidence !== null && "result" in evidence
      ? evidence
      : null;
    if (
      targetCursor !== null ||
      candidate.targetCursorRef !== null ||
      candidate.targetCursorDigest !== null ||
      !hasJudgedRouteEvidence(
        store,
        prefix,
        executionBasis,
        graph,
        sourceCursor,
        targetCursor,
        candidate,
        gapEvidence,
      )
    ) {
      return refusal(
        "judgment_mismatch",
        "gap_stop requires the exact evaluated no-action C-call judgment",
      );
    }
    const noActionStop = noActionProjectionForStopRoute(
      store,
      executionBasis,
      graph,
      sourceCursor,
      gapEvidence,
    );
    if ("kind" in noActionStop) return noActionStop;
    if (
      candidate.nextActionProjectionRef !==
        noActionStop.projection.projectionRef ||
      candidate.nextActionProjectionDigest !==
        noActionStop.projection.projectionDigest ||
      candidate.nextActionProjection === undefined ||
      sha256Canonical(
        candidate.nextActionProjection as unknown as JsonValue,
      ) !==
        sha256Canonical(noActionStop.projection as unknown as JsonValue)
    ) {
      return refusal(
        "gap_projection_mismatch",
        "gap_stop route does not carry the exact Product no-action projection",
      );
    }
    admittedNoActionStop = noActionStop;
    causationEventRef = gapEvidence.judgment.admissionEventRef;
  } else if (candidate.routeKind === "blocked") {
    if (evidence !== null && "completion" in evidence) {
      if (!hasFanOutRouteEvidence(
        store,
        prefix,
        executionBasis,
        graph,
        sourceCursor,
        null,
        candidate,
        evidence,
      )) {
        return refusal(
          "judgment_mismatch",
          "fan-out blocked route requires exact admitted partial-stop truth",
        );
      }
      causationEventRef = evidence.completion.admissionEventRef;
    } else {
      const blockedEvidence = evidence !== null && "judgmentEventRef" in evidence
        ? evidence
        : null;
      if (!hasBlockedRouteEvidence(
        store,
        executionBasis,
        graph,
        sourceCursor,
        candidate,
        blockedEvidence,
      )) {
        return refusal(
          "judgment_mismatch",
          "blocked route requires this cursor's admitted blocked CCall judgment",
        );
      }
      const stoppedSuffix = blockedEvidence.stoppedProgresses ?? [];
      causationEventRef = stoppedSuffix.at(-1)?.admissionEventRef ??
        blockedEvidence.judgmentEventRef;
      additionalCausationEventRefs = stoppedSuffix
        .slice(0, -1)
        .map((progress) => progress.admissionEventRef)
        .reverse();
    }
  } else if (candidate.routeKind === "failed") {
    const failedEvidence = evidence !== null && "result" in evidence
      ? evidence
      : null;
    if (!hasFailedRouteEvidence(
      store,
      executionBasis,
      sourceCursor,
      candidate,
      failedEvidence,
    )) {
      return refusal(
        "judgment_mismatch",
        "failed route requires this cursor's admitted failure result and judgment",
      );
    }
    causationEventRef = failedEvidence.judgment.admissionEventRef;
  } else {
    return refusal(
      "route_kind_not_supported",
      "failed routes require their declared runtime evidence",
    );
  }
  if (causationEventRef === null) {
    return refusal(
      "cursor_mismatch",
      "route source has no admitted cursor event",
    );
  }

  const judgedEvidence =
    candidate.routeKind === "advance" &&
      evidence !== null &&
      "result" in evidence &&
      !("resume" in evidence) &&
      !("completion" in evidence)
      ? evidence
      : null;
  const constructionIntent = judgedEvidence === null
    ? null
    : constructionIntentForAdvance(
        store,
        executionBasis,
        graph,
        sourceCursor,
        targetCursor,
        judgedEvidence,
      );
  if (
    constructionIntent !== null &&
    "kind" in constructionIntent &&
    constructionIntent.kind === "traversal_route_admission_refusal"
  ) {
    return constructionIntent;
  }
  const admittedConstruction =
    constructionIntent !== null && !("kind" in constructionIntent)
      ? constructionIntent
      : null;
  const constructionDelta = constructionDeltaForAdvance(
    store,
    executionBasis,
    graph,
    sourceCursor,
    targetCursor,
    judgedEvidence,
  );
  if (
    constructionDelta !== null &&
    "kind" in constructionDelta &&
    constructionDelta.kind === "traversal_route_admission_refusal"
  ) {
    return constructionDelta;
  }
  const admittedConstructionDelta =
    constructionDelta !== null && !("kind" in constructionDelta)
      ? constructionDelta
      : null;
  const routeDigest = sha256Canonical(body);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  const routeEventCandidate = (primaryCausationEventRef: string) => ({
    kind: "traversal_route_admitted",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: sourceCursor.frameId,
    parentAggregateId: sourceCursor.graphCallId,
    causationEventRefs: [
      primaryCausationEventRef,
      ...additionalCausationEventRefs.filter((eventRef) =>
        eventRef !== primaryCausationEventRef &&
        !basis.causationEventRefs.includes(eventRef)
      ),
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: sourceCursor.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    payload: { routeRef, routeDigest, ...body },
  } as const);
  const admittedEvents = admittedConstruction !== null
    ? admitRuntimeEventBatch(store, [
        () => routeEventCandidate(causationEventRef),
        (batch) => ({
          kind: "construction_intent_selected",
          eventTime: basis.eventTime,
          aggregateType: "frame",
          aggregateId: sourceCursor.frameId,
          parentAggregateId: sourceCursor.graphCallId,
          causationEventRefs: [batch[0]!.eventId],
          correlationId: `${basis.correlationId}/construction-intent`,
          workflowVersion: "5.0.0",
          scopeClass: "run",
          basisId: executionBasis.basisRef,
          runId: sourceCursor.runId,
          graphFunctionRef: executionBasis.graphFunctionRef,
          materializationRef: graph.materializationRef,
          graphCallId: sourceCursor.graphCallId,
          frameId: sourceCursor.frameId,
          payload: {
            routeRef,
            targetCursorRef: targetCursor!.cursorRef,
            targetCursorDigest: targetCursor!.cursorDigest,
            actionCatalogRef: executionBasis.actionCatalogRef!,
            actionCatalogDigest: executionBasis.actionCatalogDigest!,
            actionCatalogRowDigest:
              admittedConstruction.intent.actionCatalogRowDigest,
            nextActionProjectionRef:
              admittedConstruction.projection.projectionRef,
            nextActionProjectionDigest:
              admittedConstruction.projection.projectionDigest,
            nextActionProjection:
              admittedConstruction.projection as unknown as JsonValue,
            nextActionBasisRef:
              admittedConstruction.intent.nextActionBasisRef,
            nextActionBasisDigest:
              admittedConstruction.intent.nextActionBasisDigest,
            nextActionBasis:
              admittedConstruction.basis as unknown as JsonValue,
            constructionIntentRef:
              admittedConstruction.intent.constructionIntentRef,
            constructionIntentDigest:
              admittedConstruction.intent.constructionIntentDigest,
            constructionIntent:
              admittedConstruction.intent as unknown as JsonValue,
          },
        }),
      ])
    : admittedConstructionDelta !== null
    ? admitRuntimeEventBatch(store, [
        () => ({
          kind: "construction_delta_observed",
          eventTime: basis.eventTime,
          aggregateType: "frame",
          aggregateId: sourceCursor.frameId,
          parentAggregateId: sourceCursor.graphCallId,
          causationEventRefs: [
            ...admittedConstructionDelta.causationEventRefs,
            ...basis.causationEventRefs,
          ],
          correlationId: `${basis.correlationId}/construction-delta`,
          workflowVersion: "5.0.0",
          scopeClass: "run",
          basisId: executionBasis.basisRef,
          runId: sourceCursor.runId,
          graphFunctionRef: executionBasis.graphFunctionRef,
          materializationRef: graph.materializationRef,
          graphCallId: sourceCursor.graphCallId,
          frameId: sourceCursor.frameId,
          payload: admittedConstructionDelta.payload,
        }),
        (batch) => routeEventCandidate(batch[0]!.eventId),
      ])
    : (
        candidate.routeKind === "blocked" ||
        candidate.routeKind === "failed" ||
        candidate.routeKind === "gap_stop"
      ) && options.terminalizeRun !== false
    ? admitRuntimeEventBatch(store, [
        () => routeEventCandidate(causationEventRef),
        (batch) => ({
          kind: "run_stopped",
          eventTime: basis.eventTime,
          aggregateType: "run",
          aggregateId: sourceCursor.runId,
          parentAggregateId: null,
          causationEventRefs: [batch[0]!.eventId],
          correlationId: `${basis.correlationId}/run-stopped`,
          workflowVersion: "5.0.0",
          scopeClass: "run",
          basisId: executionBasis.basisRef,
          runId: sourceCursor.runId,
          graphFunctionRef: executionBasis.graphFunctionRef,
          materializationRef: graph.materializationRef,
          graphCallId: sourceCursor.graphCallId,
          frameId: sourceCursor.frameId,
          payload: {
            disposition:
              admittedNoActionStop?.projection.noActionDisposition ??
              candidate.routeKind,
            routeRef,
            cCallRef: candidate.cCallRef,
            judgmentRef: candidate.judgmentRef,
            reasonRef: admittedNoActionStop?.projection.reasonRef ??
              (
                evidence !== null && "judgment" in evidence
                  ? evidence.judgment.reasonRef
                  : evidence !== null && "reasonRef" in evidence
                  ? evidence.reasonRef
                  : evidence !== null && "application" in evidence &&
                      (evidence as unknown as FanOutRouteAdmissionEvidence).completion
                          .completionKind === "partial_stop"
                    ? "reason://abiogenesis/fan-out-partial-stop@5"
                    : "reason://abiogenesis/blocked@5"
              ),
          },
        }),
      ])
    : [admitRuntimeEvent(store, routeEventCandidate(causationEventRef))];
  const routeEventIndex = admittedConstructionDelta === null ? 0 : 1;
  const event = admittedEvents[routeEventIndex]!;
  const admitted = deepFreeze({
    kind: "admitted_traversal_route" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    routeRef,
    routeDigest,
    ...body,
    constructionIntentRef:
      admittedConstruction?.intent.constructionIntentRef ?? null,
    constructionIntentDigest:
      admittedConstruction?.intent.constructionIntentDigest ?? null,
    constructionIntentAdmissionEventRef:
      admittedConstruction === null ? null : admittedEvents[1]!.eventId,
    admissionEventRef: event.eventId,
    runStoppedEventRef:
      (
        candidate.routeKind === "blocked" ||
        candidate.routeKind === "failed" ||
        candidate.routeKind === "gap_stop"
      ) &&
        options.terminalizeRun !== false
        ? admittedEvents[1]?.eventId ?? null
        : null,
    ...(admittedNoActionStop === null
      ? {}
      : {
          nextActionProjectionRef:
            admittedNoActionStop.projection.projectionRef,
          nextActionProjectionDigest:
            admittedNoActionStop.projection.projectionDigest,
          nextActionProjection: admittedNoActionStop.projection,
        }),
  }) as AdmittedRoute;
  admittedRoutes.add(admitted);
  return admitted;
}

export function admitRecursionRoute(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  application: Readonly<RecurseApplication>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  replayState: ReplayState,
  candidate: RouteCandidate,
  basis: RuntimeAdmissionBasis,
  evidence: RecursionRouteAdmissionEvidence,
): RouteAdmissionResult {
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    executionBasis.basisRef !== sourceCursor.executionBasisRef ||
    executionBasis.graphRef !== graph.materializationRef ||
    !isMaterializedGtlGraph(graph) ||
    graph.template.applications.find(
      (row) => row.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "recurse" ||
    application.applicationRef !== graphFunctionApplicationRef(application)
  ) {
    return refusal(
      "basis_mismatch",
      "recursion route requires one exact admitted Graph and recurse application",
    );
  }
  if (
    !hasAdmittedTraversalCursor(store, sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    sourceCursor.executionBasisRef !== executionBasis.basisRef ||
    !isCurrentRecursionRouteSource(store, {
      runId: sourceCursor.runId,
      frameId: sourceCursor.frameId,
      sourceCursorRef: sourceCursor.cursorRef,
    })
  ) {
    return refusal(
      "cursor_mismatch",
      "recursion route source is not the active admitted application cursor in one active Run and frame",
    );
  }
  const currentReplay = replay(store, { runId: sourceCursor.runId });
  if (
    currentReplay.replayDigest !== replayState.replayDigest ||
    candidate.replayStateDigest !== replayState.replayDigest ||
    currentReplay.routes.some(
      (route) => route.sourceCursorRef === sourceCursor.cursorRef,
    )
  ) {
    return refusal(
      "replay_mismatch",
      "recursion route does not extend the current parent cursor exactly once",
    );
  }
  const applicationDigest = sha256Canonical(application as unknown as JsonValue);
  const body = candidateBody(candidate);
  const expectedDigest = sha256Canonical(body);
  if (
    candidate.kind !== "traversal_route_candidate" ||
    candidate.schemaVersion !== "5.0.0" ||
    candidate.declarationRef !== application.applicationRef ||
    candidate.declarationDigest !== applicationDigest ||
    candidate.candidateDigest !== expectedDigest ||
    candidate.candidateRef !==
      `route-candidate://abiogenesis/${expectedDigest.slice("sha256:".length)}`
  ) {
    return refusal(
      "candidate_mismatch",
      "recursion route candidate differs from the exact GTL application",
    );
  }
  const {
    cCall,
    result,
    judgment,
    foldback,
    preparationRefusal = null,
  } = evidence;
  const sourceTerm = resolveCProgramTermAtSourcePath(
    graph.template,
    sourceCursor.currentNodeRef,
    sourceCursor.termPath,
  );
  if (
    sourceTerm.kind === "c_source_path_refusal" ||
    sourceTerm.kind !== "c_of" ||
    sourceTerm.compositionRef !== application.applicationRef ||
    !hasOpenedCCall(store, cCall) ||
    !hasCurrentAdmittedCCallOutcome(store, cCall, result, judgment) ||
    cCall.basisId !== executionBasis.basisRef ||
    cCall.frameId !== sourceCursor.frameId ||
    cCall.graphCallId !== sourceCursor.graphCallId ||
    cCall.attempt !== sourceCursor.attempt ||
    cCall.compositionRef !== application.applicationRef ||
    result.cCallRef !== cCall.cCallRef ||
    judgment.cCallRef !== cCall.cCallRef ||
    judgment.resultRef !== result.resultRef ||
    judgment.judgment !== "advance" ||
    candidate.cCallRef !== cCall.cCallRef ||
    candidate.judgmentRef !== judgment.judgmentRef ||
    candidate.contractRef !== cCall.transitionContractRef ||
    recursionTerminationDecision(application, result.value) !== false
  ) {
    return refusal(
      "judgment_mismatch",
      "recursion route requires one admitted non-terminal evaluator judgment",
    );
  }
  let causationEventRef: string;
  if (candidate.routeKind === "advance") {
    if (
      targetCursor === null ||
      !isTraversalCursorCandidate(targetCursor) ||
      hasAdmittedTraversalCursor(store, targetCursor) ||
      foldback === null ||
      preparationRefusal !== null ||
      !isAdmittedApplicationChildFoldback(store, foldback) ||
      foldback.applicationRef !== application.applicationRef ||
      foldback.parentCCallRef !== cCall.cCallRef ||
      foldback.parentJudgmentRef !== judgment.judgmentRef ||
      foldback.sourceCursorRef !== sourceCursor.cursorRef ||
      foldback.childDisposition !== "closed" ||
      sourceCursor.attempt >= application.bound ||
      !hasSameCursorLineage(sourceCursor, targetCursor) ||
      targetCursor.currentNodeRef !== sourceCursor.currentNodeRef ||
      !sameValues(targetCursor.termPath, sourceCursor.termPath) ||
      targetCursor.taskOrdinal !== sourceCursor.taskOrdinal ||
      targetCursor.attempt !== sourceCursor.attempt + 1 ||
      !sameValues(
        targetCursor.retryPath.map(String),
        sourceCursor.retryPath.map(String),
      ) ||
      targetCursor.inputRef !== foldback.childResultRef ||
      targetCursor.inputDigest !== foldback.outputDigest ||
      candidate.targetCursorRef !== targetCursor.cursorRef ||
      candidate.targetCursorDigest !== targetCursor.cursorDigest ||
      !sameValues(candidate.consumedAvailabilityRefs, [
        judgment.judgmentRef,
        foldback.foldbackRef,
      ])
    ) {
      return refusal(
        "candidate_mismatch",
        "recursion advance must consume one admitted child foldback into the next bounded parent attempt",
      );
    }
    causationEventRef = foldback.admissionEventRef;
  } else if (candidate.routeKind === "blocked") {
    const blockedByPreparation =
      preparationRefusal !== null &&
      isAdmittedApplicationChildPreparationRefusal(store, preparationRefusal) &&
      preparationRefusal.applicationRef === application.applicationRef &&
      preparationRefusal.parentCCallRef === cCall.cCallRef &&
      preparationRefusal.parentJudgmentRef === judgment.judgmentRef &&
      preparationRefusal.sourceCursorRef === sourceCursor.cursorRef;
    const blockedByChild =
      foldback !== null &&
      isAdmittedApplicationChildFoldback(store, foldback) &&
      foldback.applicationRef === application.applicationRef &&
      foldback.parentCCallRef === cCall.cCallRef &&
      foldback.parentJudgmentRef === judgment.judgmentRef &&
      foldback.sourceCursorRef === sourceCursor.cursorRef &&
      foldback.childDisposition === "blocked";
    if (
      targetCursor !== null ||
      candidate.targetCursorRef !== null ||
      candidate.targetCursorDigest !== null ||
      (
        blockedByChild
          ? preparationRefusal !== null ||
            !sameValues(candidate.consumedAvailabilityRefs, [
              judgment.judgmentRef,
              foldback.foldbackRef,
            ])
          : blockedByPreparation
          ? !sameValues(candidate.consumedAvailabilityRefs, [
              judgment.judgmentRef,
              preparationRefusal.refusalRef,
            ])
          : foldback !== null ||
            sourceCursor.attempt < application.bound ||
            !sameValues(candidate.consumedAvailabilityRefs, [
              judgment.judgmentRef,
            ])
      )
    ) {
      return refusal(
        "candidate_mismatch",
        "recursion bound refusal must stop at the exact declared positive bound",
      );
    }
    causationEventRef = blockedByChild
      ? foldback.admissionEventRef
      : blockedByPreparation
        ? preparationRefusal.admissionEventRef
        : judgment.admissionEventRef;
  } else {
    return refusal(
      "route_kind_not_supported",
      "recursion application admits only advance or bounded blocked routes",
    );
  }
  const routeDigest = sha256Canonical(body);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  const routeEventCandidate = {
    kind: "traversal_route_admitted",
    eventTime: basis.eventTime,
    aggregateType: "frame",
    aggregateId: sourceCursor.frameId,
    parentAggregateId: sourceCursor.graphCallId,
    causationEventRefs: [
      causationEventRef,
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: sourceCursor.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: sourceCursor.graphCallId,
    frameId: sourceCursor.frameId,
    payload: { routeRef, routeDigest, ...body },
  } as const;
  const admittedEvents = candidate.routeKind === "blocked"
    ? admitRuntimeEventBatch(store, [
        () => routeEventCandidate,
        (batch) => ({
          kind: "run_stopped",
          eventTime: basis.eventTime,
          aggregateType: "run",
          aggregateId: sourceCursor.runId,
          parentAggregateId: null,
          causationEventRefs: [batch[0]!.eventId],
          correlationId: `${basis.correlationId}/run-stopped`,
          workflowVersion: "5.0.0",
          scopeClass: "run",
          basisId: executionBasis.basisRef,
          runId: sourceCursor.runId,
          graphFunctionRef: executionBasis.graphFunctionRef,
          materializationRef: graph.materializationRef,
          graphCallId: sourceCursor.graphCallId,
          frameId: sourceCursor.frameId,
          payload: {
            disposition: "blocked",
            routeRef,
            cCallRef: cCall.cCallRef,
            judgmentRef: judgment.judgmentRef,
            reasonRef: foldback?.childReasonRef ??
              preparationRefusal?.diagnosticRef ??
              "reason://abiogenesis/recursion/bound-exhausted@5",
          },
        }),
      ])
    : [admitRuntimeEvent(store, routeEventCandidate)];
  const event = admittedEvents[0]!;
  const admitted = deepFreeze({
    kind: "admitted_traversal_route" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    routeRef,
    routeDigest,
    ...body,
    constructionIntentRef: null,
    constructionIntentDigest: null,
    constructionIntentAdmissionEventRef: null,
    admissionEventRef: event.eventId,
    runStoppedEventRef: admittedEvents[1]?.eventId ?? null,
  }) as AdmittedRoute;
  const projected = projectAdmittedRecursionRoute(store, {
    runId: sourceCursor.runId,
    routeRef,
  });
  if (
    projected === null ||
    sha256Canonical(projected as unknown as JsonValue) !==
      sha256Canonical(admitted as unknown as JsonValue)
  ) {
    throw new TypeError(
      "recursion route admission must equal its validated replay projection",
    );
  }
  return projected;
}
