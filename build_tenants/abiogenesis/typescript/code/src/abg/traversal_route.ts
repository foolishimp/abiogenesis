import type { RuntimeEventScan } from "./runtime_history.js";
import { runtimeEventPrefixLastEnvelope, indexedRuntimeEvents, selectOwnedRuntimeEventPrefix, selectRuntimeEventPrefixFromStore, runtimeEventPrefixExtent } from "./event_prefix.js";
import type { RuntimeEventPrefix } from "./event_prefix.js";
import { resolveRegisteredSelection } from "../gtl/registered_selection.js";
import { RETAINED_GRAPH_INPUT_CONTRACT, constructRetainedGraphInput } from "../product/worksite_preparation_contracts.js";
import { hasExactKeys, isRecord } from "../shared/admission_predicates.js";
import { constructRetainedWorksiteInput } from "../product/worksite_preparation.js";
import { rawAdmitValue, type RawAdmittedValue } from "../validator/raw_admission.js";
import type {
  FanOutApplication,
  GraphFunction,
  GtlGraph,
  ReenterApplication,
  RecurseApplication,
} from "../gtl/contracts.js";
import { observeNativeFrameLiveness, captureNativeFrameBoundary } from "./runtime_liveness.js";
import {
  graphFunctionApplicationRef,
  recursionTerminationDecision,
} from "../gtl/graph_applications.js";
import {
  deriveCRetryTarget,
  deriveCSourceContinuation,
  resolveCProgramLocus,
  resolveCProgramTermAtSourcePath,
} from "../gtl/source_path.js";
import { isInteractionCLeaf } from "../gtl/c_algebra.js";
import { isMaterializedGtlGraph } from "../gtl/materialize.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import type { Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  projectAdmittedCCallOutcomeAtPrefix,
  projectCCallCarrierPhaseAtPrefix,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type CCall,
  type CCallRuntimeFailureSource,
} from "./c_call.js";
import type { FanOutCompletionAdmission } from "./fan_out.js";
import { projectExactFanOutCompletion } from "./fan_out_projection.js";
import {
  declaresFailedChildFoldback,
  isAdmittedApplicationChildFoldbackAtPrefix,
  isAdmittedApplicationChildPreparationRefusalAtPrefix,
  type ApplicationChildFoldbackAdmission,
  type ApplicationChildPreparationRefusalAdmission,
} from "./graph_application.js";
import {
  hasAdmittedExecutionBasisAtPrefix,
  rehydrateExecutionBasisAtPrefix,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  admitRuntimeEventTransactionAtDurablePrefix,
  projectRuntimeEventsAtDurablePrefix,
  assertHeldEventStoreAtDurablePrefix,
  readActiveRuntimeTransactionAtDurablePrefix,
  selectActiveRuntimeTransactionHistoryAtDurablePrefix,
  assertRuntimeEventTransactionActive,
  isRuntimeEventTransactionActive,
  type DurablePrefixCoordinate,
  type RuntimeEvent,
  type RuntimeEventCandidateFactory,
} from "./event_store.js";
import { indexedRuntimeEventEnvelopes, runtimeEventPrefixDigest, isOwnedRuntimeEventPrefix,
  projectOwnedRuntimeEventPrefixAtDurablePrefix,
  runtimeEventBodiesAtPrefix,
  runtimePrefixComputation,
  isImmutableRuntimeValue,
  selectValidatedRuntimeEventPrefix,
  selectRuntimeEventPrefixFromAuthority,
  unscopedRuntimeEventPrefix,
  validatedRuntimeEventPrefixThroughEvent,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  constructRuntimeFluent,
  runtimeFluentHoldsAtPrefix,
} from "./event_calculus.js";
import {
  replayValidatedRuntimeEventPrefix,
  projectValidatedReplayRouteAtPrefix,
  type ReplayState,
  type RuntimeReplayGuard,
  projectRuntimeReplayGuard, projectReplayCCallGuardAtPrefix,
} from "./replay.js";
import {
  admitPlannedRetryRuntimeFailureTransitionInActiveTransaction,
  admitPlannedCompletedRetryProgressInActiveTransaction,
  admitOwnedPlannedCompletedRetryProgressInActiveTransaction,
  admitRetryAttempt,
  projectDeclaredCRetryExitProgress,
  projectDeclaredCRetryFrontier,
  type CompletedRetryProgressPlan,
  type OwnedCompletedRetryProgressPlan,
  type OwnedRetryRuntimeFailureTransitionPlan,
  type RetryAttemptAdmission,
  type RetryAdmissionRefusal,
  type RetryCompletedProgressAdmission,
  type RetryProgressAdmission,
  type RetryRuntimeFailureTransitionPlan,
  type RetryStoppedProgressAdmission,
  type RetrySuccessfulExitEvidence,
} from "./retry.js";
import {
  isRouteCandidate,
  isTraversalTransitionCandidate,
  projectTraversalRouteBody,
  routeCandidateBody,
  type TraversalTransitionCandidate,
  type TraversalTransitionEvidence,
} from "./traversal_transition.js";
import {
  constructTraversalCursorCandidate,
  deriveAdmittedCContinuationTarget,
  deriveAdmittedCStructuralTarget,
  hasAdmittedTraversalCursorAtPrefix,
  isTraversalCursorCandidate,
  traversalCursorAdmissionEventRefAtPrefix,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";
import { canonicalEquals } from "../shared/value/index.js";
import { onlyExactMatch, type ExactMatch } from "../shared/select/index.js";
/** Owner boundary: `absent` and `many` map to `null`. */
const exactOrNull = <T>(match: ExactMatch<T>): T | null => match.kind === "one" ? match.value : null;
/** Owner boundary: `absent` and `many` map to `undefined`. */
const exactOrUndefined = <T>(match: ExactMatch<T>): T | undefined => match.kind === "one" ? match.value : undefined;

export type TraversalRouteKind =
  | "advance"
  | "re_enter"
  | "retry"
  | "hold"
  | "gap_stop"
  | "blocked"
  | "failed"
  | "terminal";

export type RouteCandidate = {
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
  readonly boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
  readonly registeredSelectionApplicationRef?: string;
  readonly nextActionProjectionRef?: string;
  readonly nextActionProjectionDigest?: Sha256Digest;
  readonly nextActionProjection?: Readonly<Record<string, JsonValue>>;
  readonly graphSpanReentryProjectionRef?: string;
  readonly graphSpanReentryProjectionDigest?: Sha256Digest;
  readonly graphSpanReentryProjection?: Readonly<Record<string, JsonValue>>;
};

export type AdmittedRoute = {
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
  readonly boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
  readonly registeredSelectionApplicationRef?: string;
  readonly nextActionProjectionRef?: string;
  readonly nextActionProjectionDigest?: Sha256Digest;
  readonly nextActionProjection?: NextActionProjection;
  readonly graphSpanReentryProjectionRef?: string;
  readonly graphSpanReentryProjectionDigest?: Sha256Digest;
  readonly graphSpanReentryProjection?: GraphSpanReentryProjection;
};

export type GraphSpanReentryProjection = {
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
};

export type SelectedNextActionProjection = {
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
};

export type NoActionNextActionProjection = {
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
};

export type NoActionDisposition =
  | "gap_stop"
  | "reprice_required"
  | "repair"
  | "inspect_runtime_archive"
  | "reprice"
  | "escalate";

export type NextActionProjection =
  | NoActionNextActionProjection
  | SelectedNextActionProjection;

export type ConstructionIntent = {
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
};

export type ConstructionIntentAdmission = ConstructionIntent & {
  readonly admissionEventRef: string;
};

export type RouteAdmissionRefusal = {
  readonly kind: "traversal_route_admission_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code:
    | "basis_mismatch"
    | "candidate_mismatch"
    | "cursor_mismatch"
    | "graph_span_reentry_mismatch"
    | "judgment_mismatch"
    | "replay_mismatch"
    | "route_already_admitted"
    | "route_kind_not_supported"
    | "terminal_not_declared";
  readonly message: string;
};

export type RouteAdmissionResult = AdmittedRoute | RouteAdmissionRefusal;

export type RouteAdmissionEvidence = {
  readonly evidenceClass: "judged";
  readonly graphFunction: Readonly<GraphFunction>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly completedProgresses: readonly RetryCompletedProgressAdmission[];
};

export type BlockedRouteAdmissionEvidence = {
  readonly evidenceClass: "blocked";
  readonly graphFunction: Readonly<GraphFunction>;
  readonly cCall: CCall;
  readonly resultRef: string;
  readonly judgmentRef: string;
  readonly judgmentEventRef: string;
  readonly reasonRef: string;
  readonly stoppedProgresses: readonly RetryStoppedProgressAdmission[];
};

export type HoldRouteAdmissionEvidence = {
  readonly evidenceClass: "hold";
  readonly graphFunction: Readonly<GraphFunction>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
};

export type RetryRouteAdmissionEvidence = {
  readonly evidenceClass: "retry";
  readonly graphFunction: Readonly<GraphFunction>;
  readonly cCall: CCall;
  readonly progress: RetryProgressAdmission;
};

export type FanOutRouteAdmissionEvidence = {
  readonly evidenceClass: "fan_out";
  readonly graphFunction: Readonly<GraphFunction>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly application: Readonly<FanOutApplication>;
  readonly completion: FanOutCompletionAdmission;
  readonly completedProgresses: readonly RetryCompletedProgressAdmission[];
};

export type StructuralIdentityRouteAdmissionEvidence = {
  readonly evidenceClass: "structural_identity";
  readonly graphFunction: Readonly<GraphFunction>;
  readonly completionClass: "structural_identity_success";
  readonly completionWitnessEventRef: string;
  readonly completedProgresses: readonly RetryCompletedProgressAdmission[];
};

export interface RouteAdmissionOptions {
  readonly terminalizeRun?: boolean;
}

export type RecursionRouteAdmissionEvidence = {
  readonly evidenceClass: "recursion";
  readonly application: Readonly<RecurseApplication>;
  readonly cCall: CCall;
  readonly result: AdmittedCCallResult;
  readonly judgment: AdmittedCCallJudgment;
  readonly foldback: ApplicationChildFoldbackAdmission | null;
  readonly preparationRefusal:
    | ApplicationChildPreparationRefusalAdmission
    | null;
};

export type HistoricalTraversalRouteProjection = {
  readonly kind: "historical_traversal_route_projection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "projected";
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
  readonly admissionEventRef: string;
  readonly admissionOrdinal: number;
  readonly causationEventRefs: readonly string[];
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly executionBasisRef: string;
  readonly materializationRef: string;
  readonly boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
  readonly registeredSelectionApplicationRef?: string;
  readonly nextActionProjectionRef?: string;
  readonly nextActionProjectionDigest?: Sha256Digest;
  readonly nextActionProjection?: NextActionProjection;
  readonly graphSpanReentryProjectionRef?: string;
  readonly graphSpanReentryProjectionDigest?: Sha256Digest;
  readonly graphSpanReentryProjection?: GraphSpanReentryProjection;
};

export type DeclaredStructuralAdvanceRoute =
  HistoricalTraversalRouteProjection & Readonly<{
    readonly routeKind: "advance";
    readonly targetCursorRef: string;
    readonly targetCursorDigest: Sha256Digest;
    readonly cCallRef: null;
    readonly judgmentRef: null;
    readonly consumedAvailabilityRefs: readonly [];
    readonly contractRef: null;
  }>;

export type DeclaredStructuralAdvanceProjection = {
  readonly kind: "declared_structural_advance_projection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "projected";
  readonly route: DeclaredStructuralAdvanceRoute;
  readonly sourceCursor: TraversalCursorCandidate;
  readonly targetCursor: TraversalCursorCandidate;
};

export function projectHistoricalTraversalRouteAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix?: ValidatedRuntimeEventPrefix ,
): HistoricalTraversalRouteProjection | null;
/** @internal */
export function projectHistoricalTraversalRouteAtPrefix(
  prefix: RuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix?: RuntimeEventPrefix ,
): HistoricalTraversalRouteProjection | null;
export function projectHistoricalTraversalRouteAtPrefix(
  prefix: RuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix: RuntimeEventPrefix = prefix,
): HistoricalTraversalRouteProjection | null {
  return projectHistoricalTraversalRoute(prefix, admissionEventRef, authorityPrefix, false);
}

/** @internal The same reader rethrowing its replay failure: the retry
 * frontier's cause capture over the staged prefix it already holds. */
export function projectReplayPropagatingHistoricalTraversalRouteAtPrefix(
  prefix: RuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix: RuntimeEventPrefix,
): HistoricalTraversalRouteProjection | null {
  return projectHistoricalTraversalRoute(prefix, admissionEventRef, authorityPrefix, true);
}

function projectHistoricalTraversalRoute(
  prefix: RuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix: RuntimeEventPrefix,
  propagateReplayFailure: boolean,
): HistoricalTraversalRouteProjection | null {
  if (admissionEventRef.length === 0) return null;
  runtimeEventBodiesAtPrefix(prefix);
  const matches = indexedRuntimeEvents(prefix, "id:" + admissionEventRef).filter((event) =>
    event.eventId === admissionEventRef &&
    event.kind === "traversal_route_admitted" &&
    event.aggregateType === "frame" &&
    event.scopeClass === "run" &&
    event.workflowVersion === "5.0.0" &&
    event.runId !== undefined &&
    event.graphCallId !== undefined &&
    event.frameId !== undefined &&
    event.basisId !== undefined &&
    event.materializationRef !== undefined &&
    event.aggregateId === event.frameId &&
    event.parentAggregateId === event.graphCallId &&
    isRecord(event.payload)
  );
  if (matches.length !== 1) return null;
  const event = matches[0]!;
  if (!isRecord(event.payload)) return null;
  const { routeRef, routeDigest, ...body } = event.payload;
  let replayRoutes: ReplayState["routes"];
  try {
    const historicalPrefix = validatedRuntimeEventPrefixThroughEvent(
      prefix,
      event.eventId,
    );
    const historicalAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(
      authorityPrefix,
      event.eventId,
    );
    const route = projectValidatedReplayRouteAtPrefix(historicalPrefix, event.eventId, historicalAuthorityPrefix);
    replayRoutes = route === undefined ? [] : [route];
  } catch (cause) {
    if (propagateReplayFailure) throw cause;
    return null;
  }
  const replayMatches = replayRoutes.filter((route) =>
    route.admissionEventRef === event.eventId
  );
  const projected = exactOrNull(onlyExactMatch(replayMatches));
  const projectedBody = projected === null
    ? null
    : projectTraversalRouteBody(projected);
  if (
    typeof routeRef !== "string" ||
    typeof routeDigest !== "string" ||
    projected === null ||
    projectedBody === null ||
    routeDigest !== sha256Canonical(body) ||
    routeRef !==
      `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}` ||
    projected.routeRef !== routeRef ||
    projected.routeDigest !== routeDigest ||
    !canonicalEquals(
      projectedBody,
      body,
    )
  ) return null;
  return deepFreeze({
    kind: "historical_traversal_route_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "projected" as const,
    routeRef,
    routeDigest: routeDigest as Sha256Digest,
    ...(projected.boundInput === undefined ? {} : { boundInput: projected.boundInput }),
    ...(projected.registeredSelectionApplicationRef === undefined ? {} : { registeredSelectionApplicationRef: projected.registeredSelectionApplicationRef }),
    routeKind: projected.routeKind,
    declarationRef: projected.declarationRef,
    declarationDigest: projected.declarationDigest,
    sourceCursorRef: projected.sourceCursorRef,
    sourceCursorDigest: projected.sourceCursorDigest,
    targetCursorRef: projected.targetCursorRef,
    targetCursorDigest: projected.targetCursorDigest,
    cCallRef: projected.cCallRef,
    judgmentRef: projected.judgmentRef,
    consumedAvailabilityRefs: projected.consumedAvailabilityRefs!,
    contractRef: projected.contractRef,
    replayStateDigest: projected.replayStateDigest!,
    admissionEventRef: event.eventId,
    admissionOrdinal: event.admissionOrdinal,
    causationEventRefs: event.causationEventRefs,
    runId: event.runId!,
    graphCallId: event.graphCallId!,
    frameId: event.frameId!,
    executionBasisRef: event.basisId!,
    materializationRef: event.materializationRef!,
    ...(projected.nextActionProjectionRef === undefined
      ? {}
      : {
          nextActionProjectionRef: projected.nextActionProjectionRef,
          nextActionProjectionDigest: projected.nextActionProjectionDigest!,
          nextActionProjection: projected.nextActionProjection!,
        }),
    ...(projected.graphSpanReentryProjectionRef === undefined
      ? {}
      : {
          graphSpanReentryProjectionRef:
            projected.graphSpanReentryProjectionRef,
          graphSpanReentryProjectionDigest:
            projected.graphSpanReentryProjectionDigest!,
          graphSpanReentryProjection:
            projected.graphSpanReentryProjection!,
        }),
  });
}

export function projectHistoricalTraversalRoutesAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  authorityPrefix?: ValidatedRuntimeEventPrefix ,
): readonly HistoricalTraversalRouteProjection[] | null;
/** @internal */
export function projectHistoricalTraversalRoutesAtPrefix(
  prefix: RuntimeEventPrefix,
  authorityPrefix?: RuntimeEventPrefix ,
): readonly HistoricalTraversalRouteProjection[] | null;
export function projectHistoricalTraversalRoutesAtPrefix(
  prefix: RuntimeEventPrefix,
  authorityPrefix: RuntimeEventPrefix = prefix,
): readonly HistoricalTraversalRouteProjection[] | null {
  const routeEvents = indexedRuntimeEvents(prefix, "kind:" + "traversal_route_admitted").filter(
    (event) => event.kind === "traversal_route_admitted",
  );
  const projected = routeEvents.map((event) =>
    projectHistoricalTraversalRouteAtPrefix(
      prefix,
      event.eventId,
      authorityPrefix,
    )
  );
  return projected.some((route) => route === null)
    ? null
    : deepFreeze(projected as HistoricalTraversalRouteProjection[]);
}

export function projectAdmittedRouteAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix?: ValidatedRuntimeEventPrefix ,
): AdmittedRoute | null;
/** @internal */
export function projectAdmittedRouteAtPrefix(
  prefix: RuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix?: RuntimeEventPrefix ,
): AdmittedRoute | null;
export function projectAdmittedRouteAtPrefix(
  prefix: RuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix: RuntimeEventPrefix = prefix,
): AdmittedRoute | null {
  return projectAdmittedRoute(prefix, admissionEventRef, authorityPrefix, false);
}

function projectAdmittedRoute(
  prefix: RuntimeEventPrefix,
  admissionEventRef: string,
  authorityPrefix: RuntimeEventPrefix,
  propagateReplayFailure: boolean,
): AdmittedRoute | null {
  const projected = projectHistoricalTraversalRoute(
    prefix,
    admissionEventRef,
    authorityPrefix,
    propagateReplayFailure,
  );
  if (projected === null) return null;
  runtimeEventBodiesAtPrefix(prefix);
  const constructionIntentEvent = indexedRuntimeEvents(prefix, "payload:routeRef:" + projected.routeRef).find((event) =>
    event.kind === "construction_intent_selected" &&
    event.causationEventRefs.includes(projected.admissionEventRef) &&
    isRecord(event.payload) &&
    event.payload.routeRef === projected.routeRef
  );
  const runStoppedEvent = indexedRuntimeEvents(prefix, "payload:routeRef:" + projected.routeRef).find((event) =>
    event.kind === "run_stopped" &&
    event.causationEventRefs.includes(projected.admissionEventRef) &&
    isRecord(event.payload) &&
    event.payload.routeRef === projected.routeRef
  );
  return deepFreeze({
    kind: "admitted_traversal_route" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    routeRef: projected.routeRef,
    routeDigest: projected.routeDigest,
    ...(projected.boundInput === undefined ? {} : { boundInput: projected.boundInput }),
    ...(projected.registeredSelectionApplicationRef === undefined ? {} : { registeredSelectionApplicationRef: projected.registeredSelectionApplicationRef }),
    routeKind: projected.routeKind,
    declarationRef: projected.declarationRef,
    declarationDigest: projected.declarationDigest,
    sourceCursorRef: projected.sourceCursorRef,
    sourceCursorDigest: projected.sourceCursorDigest,
    targetCursorRef: projected.targetCursorRef,
    targetCursorDigest: projected.targetCursorDigest,
    cCallRef: projected.cCallRef,
    judgmentRef: projected.judgmentRef,
    consumedAvailabilityRefs: projected.consumedAvailabilityRefs,
    contractRef: projected.contractRef,
    replayStateDigest: projected.replayStateDigest,
    constructionIntentRef:
      constructionIntentEvent !== undefined &&
        isRecord(constructionIntentEvent.payload) &&
        typeof constructionIntentEvent.payload.constructionIntentRef ===
          "string"
        ? constructionIntentEvent.payload.constructionIntentRef
        : null,
    constructionIntentDigest:
      constructionIntentEvent !== undefined &&
        isRecord(constructionIntentEvent.payload) &&
        typeof constructionIntentEvent.payload.constructionIntentDigest ===
          "string"
        ? constructionIntentEvent.payload.constructionIntentDigest as Sha256Digest
        : null,
    constructionIntentAdmissionEventRef:
      constructionIntentEvent?.eventId ?? null,
    admissionEventRef: projected.admissionEventRef,
    runStoppedEventRef: runStoppedEvent?.eventId ?? null,
    ...(projected.nextActionProjectionRef === undefined
      ? {}
      : {
          nextActionProjectionRef: projected.nextActionProjectionRef,
          nextActionProjectionDigest: projected.nextActionProjectionDigest!,
          nextActionProjection: projected.nextActionProjection!,
        }),
    ...(projected.graphSpanReentryProjectionRef === undefined
      ? {}
      : {
          graphSpanReentryProjectionRef:
            projected.graphSpanReentryProjectionRef,
          graphSpanReentryProjectionDigest:
            projected.graphSpanReentryProjectionDigest!,
          graphSpanReentryProjection:
            projected.graphSpanReentryProjection!,
        }),
  }) as unknown as AdmittedRoute;
}

export function isAdmittedRoute(
  prefix: ValidatedRuntimeEventPrefix,
  route: AdmittedRoute,
  authorityPrefix?: ValidatedRuntimeEventPrefix ,
): boolean;
/** @internal */
export function isAdmittedRoute(
  prefix: RuntimeEventPrefix,
  route: AdmittedRoute,
  authorityPrefix?: RuntimeEventPrefix ,
): boolean;
export function isAdmittedRoute(
  prefix: RuntimeEventPrefix,
  route: AdmittedRoute,
  authorityPrefix: RuntimeEventPrefix = prefix,
): boolean {
  const projected = projectAdmittedRouteAtPrefix(
    prefix,
    route.admissionEventRef,
    authorityPrefix,
  );
  return projected !== null &&
    canonicalEquals(
      projected,
      route,
    );
}

export function isCurrentRecursionRouteSourceAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  coordinates: Readonly<{
    runId: string;
    frameId: string;
    sourceCursorRef: string;
  }>,
): boolean;
/** @internal */
export function isCurrentRecursionRouteSourceAtPrefix(
  prefix: RuntimeEventPrefix,
  coordinates: Readonly<{
    runId: string;
    frameId: string;
    sourceCursorRef: string;
  }>,
): boolean;
export function isCurrentRecursionRouteSourceAtPrefix(
  prefix: RuntimeEventPrefix,
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
  return runtimeFluentHoldsAtPrefix(
    prefix,
    constructRuntimeFluent({
      name: "run_active",
      identity: coordinates.runId,
    }),
  ) && runtimeFluentHoldsAtPrefix(
    prefix,
    constructRuntimeFluent({
      name: "frame_active",
      identity: coordinates.frameId,
    }),
  ) && runtimeFluentHoldsAtPrefix(
    prefix,
    constructRuntimeFluent({
      name: "locus_active",
      identity: coordinates.sourceCursorRef,
    }),
  );
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

function graphSpanReentryProjection(
  value: JsonValue,
): GraphSpanReentryProjection | null {
  if (
    !isRecord(value) ||
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
    !isRecord(value.targetInput)
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
  prefix: RuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate,
  routeKind: TraversalRouteKind,
): boolean {
  const declared = declaredStructuralTargetCursor(prefix, graph, source, routeKind);
  return declared !== null &&
    isTraversalCursorCandidate(target) &&
    target.cursorRef === declared.cursorRef &&
    target.cursorDigest === declared.cursorDigest;
}

function declaredStructuralTargetCursor(
  prefix: RuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  routeKind: TraversalRouteKind,
): TraversalCursorCandidate | null {
  if (routeKind !== "advance" && routeKind !== "retry") return null;
  const target = deriveAdmittedCStructuralTarget(prefix, graph, source, routeKind);
  if (target === null || target.kind === "c_source_path_refusal") return null;
  return constructTraversalCursorCandidate({
    programRef: source.programRef,
    executionBasisRef: source.executionBasisRef,
    traversalScopeRef: source.traversalScopeRef,
    runId: source.runId,
    graphCallId: source.graphCallId,
    frameId: source.frameId,
    graphRef: source.graphRef,
    inputRef: target.inputRef,
    inputDigest: target.inputDigest,
    currentNodeRef: target.nodeRef,
    position: "at_term" as const,
    termPath: target.termPath,
    taskOrdinal: target.taskOrdinal,
    attempt: target.attempt,
    retryPath: target.retryPath,
  });
}

export function projectDeclaredStructuralAdvanceAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  sourceCursor: TraversalCursorCandidate,
  admissionEventRef: string,
  authorityPrefix?: ValidatedRuntimeEventPrefix ,
): DeclaredStructuralAdvanceProjection | null;
/** @internal */
export function projectDeclaredStructuralAdvanceAtPrefix(
  prefix: RuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  sourceCursor: TraversalCursorCandidate,
  admissionEventRef: string,
  authorityPrefix?: RuntimeEventPrefix ,
): DeclaredStructuralAdvanceProjection | null;
export function projectDeclaredStructuralAdvanceAtPrefix(
  prefix: RuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  sourceCursor: TraversalCursorCandidate,
  admissionEventRef: string,
  authorityPrefix: RuntimeEventPrefix = prefix,
): DeclaredStructuralAdvanceProjection | null {
  if (
    !isMaterializedGtlGraph(graph) ||
    !isTraversalCursorCandidate(sourceCursor) ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, sourceCursor) ||
    sourceCursor.graphRef !== graph.materializationRef ||
    graphFunction.name !== graph.graphFunctionRef ||
    sha256Canonical(graphFunction) !==
      graph.graphFunctionDigest
  ) return null;
  // Structural replay belongs to the source Run; declaration authority may
  // still span the workspace's other Runs at this same admitted cut.
  const runPrefix = selectRuntimeEventPrefixFromAuthority(
    unscopedRuntimeEventPrefix(prefix),
    { runId: sourceCursor.runId },
  );
  const route = projectHistoricalTraversalRouteAtPrefix(
    runPrefix,
    admissionEventRef,
    authorityPrefix,
  );
  const sourceAdmissionEventRef = traversalCursorAdmissionEventRefAtPrefix(
    prefix,
    sourceCursor,
  );
  const sourceAdmission = sourceAdmissionEventRef === null
    ? undefined
    : indexedRuntimeEvents(prefix, "id:" + sourceAdmissionEventRef).find((event) =>
      event.eventId === sourceAdmissionEventRef
    );
  const targetCursor = declaredStructuralTargetCursor(
    authorityPrefix,
    graph,
    sourceCursor,
    "advance",
  );
  if (
    route === null || sourceAdmission === undefined || targetCursor === null ||
    route.routeKind !== "advance" ||
    route.declarationRef !== graph.materializationRef ||
    route.declarationDigest !== graph.materializationDigest ||
    route.sourceCursorRef !== sourceCursor.cursorRef ||
    route.sourceCursorDigest !== sourceCursor.cursorDigest ||
    route.targetCursorRef !== targetCursor.cursorRef ||
    route.targetCursorDigest !== targetCursor.cursorDigest ||
    route.cCallRef !== null || route.judgmentRef !== null ||
    route.contractRef !== null ||
    route.consumedAvailabilityRefs.length !== 0 ||
    route.runId !== sourceCursor.runId ||
    route.graphCallId !== sourceCursor.graphCallId ||
    route.frameId !== sourceCursor.frameId ||
    route.executionBasisRef !== sourceCursor.executionBasisRef ||
    route.materializationRef !== graph.materializationRef ||
    route.admissionOrdinal <= sourceAdmission.admissionOrdinal ||
    route.causationEventRefs[0] !== sourceAdmission.eventId ||
    traversalCursorAdmissionEventRefAtPrefix(prefix, targetCursor) !==
      route.admissionEventRef ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, targetCursor) ||
    !isDeclaredStructuralTarget(authorityPrefix, graph, sourceCursor, targetCursor, "advance")
  ) return null;
  return deepFreeze({
    kind: "declared_structural_advance_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "projected" as const,
    route: route as DeclaredStructuralAdvanceRoute,
    sourceCursor,
    targetCursor,
  });
}

type CompletedRetryProgressExpectation =
  | Readonly<{
    completionClass: "judged_success" | "fan_out_success";
    completionWitnessEventRef: string;
    cCallRef: string;
    resultRef: string;
    judgmentRef: string;
  }>
  | Readonly<{
    completionClass: "structural_identity_success";
    completionWitnessEventRef: string;
  }>;

function deriveCompletedProgressRouteCausation(
  completedProgresses: readonly RetryCompletedProgressAdmission[],
  completionWitnessEventRef: string,
): Readonly<{
  causationEventRef: string;
  additionalCausationEventRefs: readonly string[];
}> {
  const progressEventRefs = completedProgresses.map(
    (progress) => progress.admissionEventRef,
  );
  return deepFreeze({
    causationEventRef: progressEventRefs.at(-1) ?? completionWitnessEventRef,
    additionalCausationEventRefs: progressEventRefs.slice(0, -1).reverse(),
  });
}

function hasCompletedRetryProgressChain(
  prefix: RuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  graphFunction: Readonly<GraphFunction>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  completedProgresses: readonly RetryCompletedProgressAdmission[],
  expected: CompletedRetryProgressExpectation,
  authorityPrefix: RuntimeEventPrefix = prefix,
): boolean {
  const projection = projectDeclaredCRetryExitProgress(
    prefix,
    graph,
    graphFunction,
    sourceCursor,
    targetCursor,
    authorityPrefix,
  );
  if (projection === null) return false;
  if (projection.progressClass === "none") {
    return projection.exitedRetryDepths.length === 0 &&
      completedProgresses.length === 0;
  }
  if (projection.progressClass !== "completed") return false;
  return completedProgresses.length === projection.progresses.length &&
    completedProgresses.every((progress, index) => {
      const retryDepth = projection.exitedRetryDepths[index];
      const ownerProgress = projection.progresses[index];
      return retryDepth !== undefined && ownerProgress !== undefined &&
      canonicalEquals(
        ownerProgress,
        progress,
      ) &&
      progress.progressClass === "completed" &&
      progress.completionClass === expected.completionClass &&
      progress.completionWitnessEventRef ===
        expected.completionWitnessEventRef &&
      progress.completedRetryDepth === retryDepth &&
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
      canonicalEquals(
        progress.retryPath.map(String),
        sourceCursor.retryPath.slice(0, retryDepth).map(String),
      );
    });
}

function hasStructuralIdentityRouteEvidence(
  prefix: RuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: StructuralIdentityRouteAdmissionEvidence | null,
  authorityPrefix: RuntimeEventPrefix = prefix,
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
      traversalCursorAdmissionEventRefAtPrefix(prefix, sourceCursor) &&
    hasCompletedRetryProgressChain(
      prefix,
      graph,
      evidence.graphFunction,
      sourceCursor,
      targetCursor,
      evidence.completedProgresses,
      {
        completionClass: "structural_identity_success",
        completionWitnessEventRef: evidence.completionWitnessEventRef,
      },
      authorityPrefix,
    ) &&
    candidate.cCallRef === null && candidate.judgmentRef === null &&
    candidate.contractRef === null &&
    canonicalEquals(
      candidate.consumedAvailabilityRefs,
      evidence.completedProgresses.map((progress) => progress.progressRef),
    ) &&
    isDeclaredStructuralTarget(
      authorityPrefix,
      graph,
      sourceCursor,
      targetCursor,
      candidate.routeKind,
    );
}

function hasJudgedRouteEvidence(
  prefix: RuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  candidate: RouteCandidate,
  evidence: RouteAdmissionEvidence | null,
  authorityPrefix: RuntimeEventPrefix = prefix,
): evidence is RouteAdmissionEvidence {
  const cCall = evidence?.cCall;
  const result = evidence?.result;
  const judgment = evidence?.judgment;
  const graphFunction = evidence?.graphFunction;
  const completedProgresses = evidence?.completedProgresses ?? [];
  const completedProgressMatches = cCall !== undefined &&
    result !== undefined && judgment !== undefined &&
    graphFunction !== undefined &&
    hasCompletedRetryProgressChain(
      prefix,
      graph,
      graphFunction,
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
      authorityPrefix,
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
  const outcome = cCall !== undefined && result !== undefined &&
      judgment !== undefined && locusMatches
    ? projectAdmittedCCallOutcomeAtPrefix(prefix, cCall, result, judgment) : null;
  return outcome !== null &&
    outcome.judgment.judgment === "advance" &&
    completedProgressMatches &&
    outcome.cCall.basisId === executionBasis.basisRef &&
    outcome.cCall.frameId === sourceCursor.frameId &&
    outcome.cCall.graphCallId === sourceCursor.graphCallId &&
    outcome.cCall.taskOrdinal === sourceCursor.taskOrdinal &&
    outcome.cCall.attempt === sourceCursor.attempt &&
    canonicalEquals(outcome.cCall.retryPath.map(String), sourceCursor.retryPath.map(String)) &&
    candidate.cCallRef === outcome.cCall.cCallRef &&
    candidate.judgmentRef === outcome.judgment.judgmentRef &&
    canonicalEquals(
      candidate.consumedAvailabilityRefs,
      [
        outcome.judgment.judgmentRef,
        ...completedProgresses.map((progress) => progress.progressRef),
      ],
    ) &&
    candidate.contractRef === outcome.cCall.transitionContractRef;
}

function hasBlockedRouteEvidence(
  prefix: RuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: BlockedRouteAdmissionEvidence | null,
  authorityPrefix: RuntimeEventPrefix = prefix,
): evidence is BlockedRouteAdmissionEvidence {
  const stoppedProgresses = evidence?.stoppedProgresses ?? [];
  if (evidence === null) return false;
  const graphFunctionDigest = sha256Canonical(
    evidence.graphFunction,
  );
  if (
    evidence.graphFunction.kind !== "graph_function" ||
    evidence.graphFunction.name !== graph.graphFunctionRef ||
    graphFunctionDigest !== graph.graphFunctionDigest ||
    evidence.graphFunction.name !== executionBasis.graphFunctionRef ||
    graphFunctionDigest !== executionBasis.graphFunctionDigest
  ) return false;
  const exitProgress = projectDeclaredCRetryExitProgress(
    prefix,
    graph,
    evidence.graphFunction,
    sourceCursor,
    null,
    authorityPrefix,
  );
  if (
    exitProgress === null ||
    exitProgress.progressClass === "completed"
  ) return false;
  const stoppedSuffixRequired = exitProgress.progressClass === "stopped";
  const ownerProgresses = stoppedSuffixRequired
    ? exitProgress.progresses
    : Object.freeze([]) as readonly RetryStoppedProgressAdmission[];
  const exactOpenedCarrier = projectCCallCarrierPhaseAtPrefix(
    prefix,
    evidence.cCall,
  ) !== null;
  if (
    !exactOpenedCarrier ||
    evidence.cCall.basisId !== executionBasis.basisRef ||
    evidence.cCall.frameId !== sourceCursor.frameId ||
    evidence.cCall.graphCallId !== sourceCursor.graphCallId ||
    candidate.cCallRef !== evidence.cCall.cCallRef ||
    candidate.judgmentRef !== evidence.judgmentRef ||
    candidate.targetCursorRef !== null ||
    candidate.targetCursorDigest !== null ||
    !canonicalEquals(
      candidate.consumedAvailabilityRefs,
      [
        evidence.judgmentRef,
        ...stoppedProgresses.map((progress) => progress.progressRef),
      ],
    ) ||
    candidate.contractRef !== evidence.cCall.transitionContractRef
  ) return false;
  const projected = projectReplayCCallGuardAtPrefix(prefix,evidence.cCall.cCallRef);
  const judgmentEvent = indexedRuntimeEvents(prefix, "id:" + evidence.judgmentEventRef).find(
    (event) => event.eventId === evidence.judgmentEventRef,
  );
  if (
    stoppedProgresses.length !==
      (stoppedSuffixRequired ? exitProgress.exitedRetryDepths.length : 0) ||
    evidence.cCall.taskOrdinal !== sourceCursor.taskOrdinal ||
    evidence.cCall.attempt !== sourceCursor.attempt ||
    !canonicalEquals(
      evidence.cCall.retryPath.map(String),
      sourceCursor.retryPath.map(String),
    )
  ) return false;
  const stoppedSuffixMatches = stoppedProgresses.every(
    (progress, index) => {
      const ownerProgress = ownerProgresses[index];
      const retryDepth = exitProgress.exitedRetryDepths[index];
      if (ownerProgress === undefined || retryDepth === undefined) return false;
      const expectedRetryPath = sourceCursor.retryPath.slice(
        0,
        retryDepth,
      );
      return canonicalEquals(
        ownerProgress,
        progress,
      ) &&
        progress.cCallRef === evidence.cCall.cCallRef &&
        progress.resultRef === evidence.resultRef &&
        progress.judgmentRef === evidence.judgmentRef &&
        progress.failureSignalRef === evidence.reasonRef &&
        progress.attempt === expectedRetryPath.at(-1) &&
        canonicalEquals(
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
  return projected?.status === "judged" &&
    projected.resultRef === evidence.resultRef &&
    projected.judgmentRef === evidence.judgmentRef &&
    projected.judgment === "blocked" &&
    judgmentEvent?.kind === "c_call_judged" &&
    judgmentEvent.aggregateId === evidence.cCall.cCallRef &&
    isRecord(judgmentEvent.payload) &&
    judgmentEvent.payload.judgmentRef === evidence.judgmentRef &&
    judgmentEvent.payload.resultRef === evidence.resultRef &&
    judgmentEvent.payload.judgment === "blocked" &&
    judgmentEvent.payload.reasonRef === evidence.reasonRef;
}

function hasFailedRouteEvidence(
  prefix: RuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  sourceCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: RouteAdmissionEvidence | null,
): evidence is RouteAdmissionEvidence {
  const outcome = evidence === null ? null : projectAdmittedCCallOutcomeAtPrefix(
    prefix, evidence.cCall, evidence.result, evidence.judgment,
  );
  if (
    outcome === null ||
    outcome.cCall.basisId !== executionBasis.basisRef ||
    outcome.cCall.frameId !== sourceCursor.frameId ||
    outcome.cCall.graphCallId !== sourceCursor.graphCallId ||
    outcome.cCall.taskOrdinal !== sourceCursor.taskOrdinal ||
    outcome.cCall.attempt !== sourceCursor.attempt ||
    outcome.result.resultClass !== "failure" ||
    outcome.judgment.judgment !== "blocked" ||
    candidate.cCallRef !== outcome.cCall.cCallRef ||
    candidate.judgmentRef !== outcome.judgment.judgmentRef ||
    candidate.targetCursorRef !== null ||
    candidate.targetCursorDigest !== null ||
    candidate.consumedAvailabilityRefs.length !== 1 ||
    candidate.consumedAvailabilityRefs[0] !== outcome.judgment.judgmentRef ||
    candidate.contractRef !== outcome.cCall.transitionContractRef
  ) return false;
  return true;
}

function hasHoldRouteEvidence(
  prefix: RuntimeEventPrefix,
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
  if (term.kind === "c_source_path_refusal" || !isInteractionCLeaf(term)) return false;
  const outcome = projectAdmittedCCallOutcomeAtPrefix(
    prefix, evidence.cCall, evidence.result, evidence.judgment,
  );
  return outcome !== null &&
    outcome.cCall.basisId === executionBasis.basisRef &&
    outcome.cCall.regime === "F_H" &&
    outcome.cCall.frameId === sourceCursor.frameId &&
    outcome.cCall.graphCallId === sourceCursor.graphCallId &&
    outcome.cCall.programLocusRef === term.programLocusRef &&
    outcome.result.resultClass === "pending" &&
    outcome.judgment.judgment === "pending" &&
    candidate.cCallRef === outcome.cCall.cCallRef &&
    candidate.judgmentRef === outcome.judgment.judgmentRef &&
    candidate.targetCursorRef === null &&
    candidate.targetCursorDigest === null &&
    candidate.consumedAvailabilityRefs.length === 1 &&
    candidate.consumedAvailabilityRefs[0] ===
      outcome.judgment.judgmentRef &&
    candidate.contractRef === outcome.cCall.continuationContractRef;
}

function hasRetryRouteEvidence(
  prefix: RuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate,
  candidate: RouteCandidate,
  evidence: RetryRouteAdmissionEvidence | null,
  authorityPrefix: RuntimeEventPrefix = prefix,
): evidence is RetryRouteAdmissionEvidence {
  const frontier = evidence === null ? null : projectDeclaredCRetryFrontier(
    prefix,
    graph,
    sourceCursor,
    evidence.graphFunction,
    sourceCursor.retryPath.length,
    authorityPrefix,
  );
  const available = frontier?.state === "progress_available" &&
      frontier.available.kind === "declared_c_retry_retry_progress"
    ? frontier.available
    : null;
  if (
    evidence === null ||
    evidence.progress.progressClass !== "retry" ||
    available === null ||
    !canonicalEquals(
      available.failureCCall.cCall,
      evidence.cCall,
    ) ||
    !canonicalEquals(
      available.progress,
      evidence.progress,
    ) ||
    evidence.cCall.basisId !== executionBasis.basisRef ||
    evidence.cCall.frameId !== sourceCursor.frameId ||
    evidence.cCall.graphCallId !== sourceCursor.graphCallId ||
    evidence.cCall.attempt !== sourceCursor.attempt ||
    !canonicalEquals(
      evidence.cCall.retryPath.map(String),
      sourceCursor.retryPath.map(String),
    ) ||
    evidence.progress.cCallRef !== evidence.cCall.cCallRef ||
    evidence.progress.attempt !== sourceCursor.attempt ||
    evidence.progress.remainingBudget < 1 ||
    candidate.routeKind !== "retry" ||
    candidate.cCallRef !== evidence.cCall.cCallRef ||
    candidate.judgmentRef !== evidence.progress.judgmentRef ||
    !canonicalEquals(
      candidate.consumedAvailabilityRefs,
      [
        evidence.progress.judgmentRef,
        evidence.progress.progressRef,
      ],
    ) ||
    candidate.contractRef !== evidence.cCall.transitionContractRef
  ) return false;
  const declared = deriveCRetryTarget(
    graph,
    {
      nodeRef: sourceCursor.currentNodeRef,
      termPath: sourceCursor.termPath,
      taskOrdinal: sourceCursor.taskOrdinal,
      attempt: sourceCursor.attempt,
      retryPath: sourceCursor.retryPath,
      inputRef: sourceCursor.inputRef,
      inputDigest: sourceCursor.inputDigest,
    },
    {
      inputRef: evidence.progress.inputRef,
      inputDigest: evidence.progress.inputDigest,
    },
  );
  if (
    declared.kind === "c_source_path_refusal" ||
    evidence.progress.retryBoundaryRef.length === 0
  ) return false;
  return hasSameCursorLineage(sourceCursor, targetCursor) &&
    targetCursor.currentNodeRef === declared.nodeRef &&
    canonicalEquals(targetCursor.termPath, declared.termPath) &&
    targetCursor.taskOrdinal === declared.taskOrdinal &&
    targetCursor.attempt === declared.attempt &&
    canonicalEquals(
      targetCursor.retryPath.map(String),
      declared.retryPath.map(String),
    ) &&
    targetCursor.inputRef === declared.inputRef &&
    targetCursor.inputDigest === declared.inputDigest;
}

function hasFanOutRouteEvidence(
  prefix: RuntimeEventPrefix,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  candidate: RouteCandidate,
  evidence: FanOutRouteAdmissionEvidence | null,
  authorityPrefix: RuntimeEventPrefix = prefix,
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
  const outcome = projectAdmittedCCallOutcomeAtPrefix(
    prefix, evidence.cCall, evidence.result, evidence.judgment,
  );
  if (
    outcome === null ||
    projectedCompletion?.kind !== "fan_out_completion_admission" ||
    !canonicalEquals(
      evidence.completion,
      projectedCompletion,
    ) ||
    graph.template.applications.find(
      (application) =>
        application.applicationRef === evidence.application.applicationRef,
    ) !== evidence.application ||
    evidence.application.relationKind !== "fan_out" ||
    evidence.application.applicationRef !==
      graphFunctionApplicationRef(evidence.application) ||
    outcome.cCall.basisId !== executionBasis.basisRef ||
    outcome.cCall.frameId !== sourceCursor.frameId ||
    outcome.cCall.graphCallId !== sourceCursor.graphCallId ||
    outcome.cCall.batchRef !== evidence.application.batchRef ||
    outcome.cCall.taskOrdinal !== sourceCursor.taskOrdinal ||
    evidence.completion.applicationRef !== evidence.application.applicationRef ||
    evidence.completion.batchRef !== evidence.application.batchRef ||
    candidate.cCallRef !== outcome.cCall.cCallRef ||
    !canonicalEquals(
      candidate.consumedAvailabilityRefs,
      [
        evidence.completion.completionKind === "complete_vector"
          ? evidence.completion.taskRows.at(-1)?.judgmentRef ?? ""
          : evidence.completion.stoppingRow.judgmentRef,
        evidence.application.applicationRef,
        ...completedProgresses.map((progress) => progress.progressRef),
      ],
    ) ||
    candidate.contractRef !== outcome.cCall.transitionContractRef
  ) return false;
  if (evidence.completion.completionKind === "partial_stop") {
    return completedProgresses.length === 0 &&
      candidate.routeKind === "blocked" &&
      targetCursor === null &&
      candidate.targetCursorRef === null &&
      candidate.targetCursorDigest === null &&
      candidate.judgmentRef === evidence.completion.stoppingRow.judgmentRef &&
      outcome.result.resultRef === evidence.completion.stoppingRow.resultRef &&
      outcome.judgment.judgmentRef ===
        evidence.completion.stoppingRow.judgmentRef &&
      evidence.completion.stoppingRow.cCallRef === outcome.cCall.cCallRef &&
      evidence.completion.stoppingRow.ordinal === sourceCursor.taskOrdinal;
  }
  const lastRow = evidence.completion.taskRows.at(-1);
  if (
    candidate.routeKind !== "advance" ||
    targetCursor === null ||
    lastRow === undefined ||
    lastRow.cCallRef !== outcome.cCall.cCallRef ||
    lastRow.resultRef !== outcome.result.resultRef ||
    lastRow.judgmentRef !== outcome.judgment.judgmentRef ||
    outcome.result.resultClass !== "success" ||
    outcome.judgment.judgment !== "advance" ||
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
    graph,
    evidence.graphFunction,
    sourceCursor,
    targetCursor,
    completedProgresses,
    {
      completionClass: "fan_out_success",
      completionWitnessEventRef: evidence.completion.admissionEventRef,
      cCallRef: outcome.cCall.cCallRef,
      resultRef: outcome.result.resultRef,
      judgmentRef: outcome.judgment.judgmentRef,
    },
    authorityPrefix,
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
    !canonicalEquals(targetCursor.termPath, continuation.targetPath)
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

function registeredSelectionContinuationMatches(basis: ExecutionBasis, graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate, target: TraversalCursorCandidate | null,
  evidence: RouteAdmissionEvidence, boundInput?: RawAdmittedValue<Readonly<Record<string, JsonValue>>>): boolean | null {
  const selected = resolveRegisteredSelection(graph.template, source, evidence.cCall.outputContractRef,
    evidence.result.value, basis.registeredSelectionDefinitionDigests ?? {});
  if (selected === null) return null;
  return selected.disposition === "selected" && target !== null && boundInput !== undefined &&
    hasSameCursorLineage(source, target) && target.currentNodeRef === selected.nodeRef &&
    canonicalEquals(target.termPath, selected.termPath) && target.taskOrdinal === null && target.retryPath.length === 0 && target.attempt === 1 &&
    target.inputRef === boundInput.admissionRef && target.inputDigest === boundInput.subjectDigest &&
    boundInput.contractRef === selected.contractRef && sha256Canonical(selected.value) === boundInput.subjectDigest;
}

function isDeclaredContinuationTarget(
  prefix: RuntimeEventPrefix,
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  target: TraversalCursorCandidate | null,
  candidate: Readonly<{
    routeKind: TraversalRouteKind;
    targetCursorRef: string | null;
    targetCursorDigest: Sha256Digest | null;
  }>,
  completed: Readonly<{
    inputRef: string;
    inputDigest: Sha256Digest;
  }>,
): boolean {
  const continuation = deriveAdmittedCContinuationTarget(prefix, graph, source, completed);
  if (continuation.kind === "c_source_path_refusal") return false;
  if (continuation.disposition === "terminal") {
    return candidate.routeKind === "terminal" &&
      target === null &&
      candidate.targetCursorRef === null &&
      candidate.targetCursorDigest === null;
  }
  if (
    candidate.routeKind !== "advance" ||
    continuation.disposition !== "advance" ||
    continuation.nodeRef === null ||
    continuation.termPath === null ||
    target === null ||
    !hasSameCursorLineage(source, target) ||
    candidate.targetCursorRef !== target.cursorRef ||
    candidate.targetCursorDigest !== target.cursorDigest
  ) {
    return false;
  }
  return target.currentNodeRef === continuation.nodeRef &&
    canonicalEquals(target.termPath, continuation.termPath) &&
    target.inputRef === continuation.inputRef &&
    target.inputDigest === continuation.inputDigest &&
    target.taskOrdinal === continuation.taskOrdinal &&
    target.attempt === continuation.attempt &&
    canonicalEquals(target.retryPath.map(String), continuation.retryPath.map(String));
}

function hasGraphSpanReentryRouteEvidence(
  prefix: RuntimeEventPrefix,
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
    candidate.graphSpanReentryProjection,
  );
  if (
    projection === null ||
    projection.projectionRef !==
      candidate.graphSpanReentryProjectionRef ||
    projection.projectionDigest !==
      candidate.graphSpanReentryProjectionDigest ||
    !canonicalEquals(
      evidence.result.value,
      projection,
    )
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
    !canonicalEquals(target.termPath, targetLocus.termPath) ||
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
  const priorApplications = indexedRuntimeEvents(prefix, "run:" + source.runId).filter(
    (event) =>
      event.kind === "traversal_route_admitted" &&
      event.runId === source.runId &&
      isRecord(event.payload) &&
      event.payload.routeKind === "re_enter" &&
      isRecord(event.payload.graphSpanReentryProjection) &&
      event.payload.graphSpanReentryProjection.applicationRef ===
        application.applicationRef,
  ).length;
  return priorApplications < application.maxApplications;
}

function recursionRouteCausation(input: Readonly<{
  executionBasis: ExecutionBasis;
  graph: Readonly<GtlGraph>;
  source: TraversalCursorCandidate;
  target: TraversalCursorCandidate | null;
  candidate: RouteCandidate;
  evidence: RecursionRouteAdmissionEvidence;
  prefix: RuntimeEventPrefix;
}>): string | RouteAdmissionRefusal {
  const { application, cCall, result, judgment, foldback } = input.evidence;
  const preparationRefusal = input.evidence.preparationRefusal ?? null;
  const sourceTerm = resolveCProgramTermAtSourcePath(
    input.graph.template,
    input.source.currentNodeRef,
    input.source.termPath,
  );
  if (
    input.graph.template.applications.find(
      (row) => row.applicationRef === application.applicationRef,
    ) !== application ||
    application.relationKind !== "recurse" ||
    application.applicationRef !== graphFunctionApplicationRef(application) ||
    !isCurrentRecursionRouteSourceAtPrefix(input.prefix, {
      runId: input.source.runId,
      frameId: input.source.frameId,
      sourceCursorRef: input.source.cursorRef,
    }) ||
    sourceTerm.kind === "c_source_path_refusal" ||
    sourceTerm.kind !== "c_of" ||
    sourceTerm.compositionRef !== application.applicationRef
  ) {
    return refusal(
      "judgment_mismatch",
      "recursion route requires one admitted non-terminal evaluator judgment",
    );
  }
  const outcome = projectAdmittedCCallOutcomeAtPrefix(input.prefix, cCall, result, judgment);
  if (
    outcome === null ||
    outcome.cCall.basisId !== input.executionBasis.basisRef ||
    outcome.cCall.frameId !== input.source.frameId ||
    outcome.cCall.graphCallId !== input.source.graphCallId ||
    outcome.cCall.attempt !== input.source.attempt ||
    outcome.cCall.compositionRef !== application.applicationRef ||
    outcome.judgment.judgment !== "advance" ||
    input.candidate.cCallRef !== outcome.cCall.cCallRef ||
    input.candidate.judgmentRef !== outcome.judgment.judgmentRef ||
    input.candidate.contractRef !== outcome.cCall.transitionContractRef ||
    recursionTerminationDecision(application, outcome.result.value) !== false
  ) {
    return refusal(
      "judgment_mismatch",
      "recursion route requires one admitted non-terminal evaluator judgment",
    );
  }
  if (input.candidate.routeKind === "advance") {
    // A declared failed child re-enters the parent over its prior admitted input.
    const folded = foldback?.childDisposition === "failed"
      ? { inputRef: input.source.inputRef, inputDigest: input.source.inputDigest }
      : { inputRef: foldback?.childResultRef, inputDigest: foldback?.outputDigest };
    if (
      input.target === null ||
      !isTraversalCursorCandidate(input.target) ||
      hasAdmittedTraversalCursorAtPrefix(input.prefix, input.target) ||
      foldback === null ||
      preparationRefusal !== null ||
      !isAdmittedApplicationChildFoldbackAtPrefix(input.prefix, foldback) ||
      foldback.applicationRef !== application.applicationRef ||
      foldback.parentCCallRef !== outcome.cCall.cCallRef ||
      foldback.parentJudgmentRef !== outcome.judgment.judgmentRef ||
      foldback.sourceCursorRef !== input.source.cursorRef ||
      (foldback.childDisposition !== "closed" &&
        !(foldback.childDisposition === "failed" &&
          declaresFailedChildFoldback(application, foldback.childReasonRef))) ||
      input.source.attempt >= application.bound ||
      !hasSameCursorLineage(input.source, input.target) ||
      input.target.currentNodeRef !== input.source.currentNodeRef ||
      !canonicalEquals(input.target.termPath, input.source.termPath) ||
      input.target.taskOrdinal !== input.source.taskOrdinal ||
      input.target.attempt !== input.source.attempt + 1 ||
      !canonicalEquals(
        input.target.retryPath.map(String),
        input.source.retryPath.map(String),
      ) ||
      input.target.inputRef !== folded.inputRef ||
      input.target.inputDigest !== folded.inputDigest ||
      input.candidate.targetCursorRef !== input.target.cursorRef ||
      input.candidate.targetCursorDigest !== input.target.cursorDigest ||
      !canonicalEquals(
        input.candidate.consumedAvailabilityRefs,
        [
          outcome.judgment.judgmentRef,
          foldback.foldbackRef,
        ],
      )
    ) {
      return refusal(
        "candidate_mismatch",
        "recursion advance must consume one admitted child foldback into the next bounded parent attempt",
      );
    }
    return foldback.admissionEventRef;
  }
  if (input.candidate.routeKind !== "blocked") {
    return refusal(
      "route_kind_not_supported",
      "recursion application admits only advance or bounded blocked routes",
    );
  }
  const blockedByPreparation = preparationRefusal !== null &&
    isAdmittedApplicationChildPreparationRefusalAtPrefix(
      input.prefix,
      preparationRefusal,
    ) &&
    preparationRefusal.applicationRef === application.applicationRef &&
    preparationRefusal.parentCCallRef === outcome.cCall.cCallRef &&
    preparationRefusal.parentJudgmentRef === outcome.judgment.judgmentRef &&
    preparationRefusal.sourceCursorRef === input.source.cursorRef;
  const blockedByChild = foldback !== null &&
    isAdmittedApplicationChildFoldbackAtPrefix(input.prefix, foldback) &&
    foldback.applicationRef === application.applicationRef &&
    foldback.parentCCallRef === outcome.cCall.cCallRef &&
    foldback.parentJudgmentRef === outcome.judgment.judgmentRef &&
    foldback.sourceCursorRef === input.source.cursorRef &&
    foldback.childDisposition === "blocked";
  if (
    input.target !== null ||
    input.candidate.targetCursorRef !== null ||
    input.candidate.targetCursorDigest !== null ||
    (
      blockedByChild
        ? preparationRefusal !== null ||
          !canonicalEquals(
            input.candidate.consumedAvailabilityRefs,
            [
              outcome.judgment.judgmentRef,
              foldback.foldbackRef,
            ],
          )
        : blockedByPreparation
          ? !canonicalEquals(
            input.candidate.consumedAvailabilityRefs,
            [
              outcome.judgment.judgmentRef,
              preparationRefusal.refusalRef,
            ],
          )
          : foldback !== null ||
            input.source.attempt < application.bound ||
            !canonicalEquals(
              input.candidate.consumedAvailabilityRefs,
              [
                outcome.judgment.judgmentRef,
              ],
            )
    )
  ) {
    return refusal(
      "candidate_mismatch",
      "recursion bound refusal must stop at the exact declared positive bound",
    );
  }
  return blockedByChild
    ? foldback.admissionEventRef
    : blockedByPreparation
      ? preparationRefusal.admissionEventRef
      : outcome.judgment.admissionEventRef;
}

const RETAINED_CCALL_INPUT = Symbol("retained_c_call_input");
type RetainedCCallInput = Readonly<{
  registeredSelectionApplicationRef?: string;
  input: RawAdmittedValue<Readonly<Record<string, JsonValue>>>;
  causationEventRefs: readonly string[];
}>;
interface RetainedCCallDerivation {
  last?: Readonly<{
    end: string | undefined;
    length: number;
    executionBasis: ExecutionBasis;
    inputs: readonly object[];
    retained: RetainedCCallInput;
  }>;
}

/** Pure owner derivation. The existing prefix computation territory retains
 * only this exact immutable relation. A new cut or changed/raw input must
 * discharge every admission and child-foldback premise again. Nothing here
 * admits an input, authorizes an effect, or replaces current route admission. */
export function deriveRetainedCCallInputAtPrefix(
  prefix: ValidatedRuntimeEventPrefix,
  basis: ExecutionBasis | string,
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
): RetainedCCallInput | null;
/** @internal */
export function deriveRetainedCCallInputAtPrefix(
  prefix: RuntimeEventPrefix,
  basis: ExecutionBasis | string,
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
): RetainedCCallInput | null;
export function deriveRetainedCCallInputAtPrefix(
  prefix: RuntimeEventPrefix,
  basis: ExecutionBasis | string,
  graph: Readonly<GtlGraph>,
  source: TraversalCursorCandidate,
  cCall: CCall,
  result: AdmittedCCallResult,
  judgment: AdmittedCCallJudgment,
): RetainedCCallInput | null {
  const events = runtimeEventBodiesAtPrefix(prefix);
  const facts = runtimePrefixComputation<RetainedCCallDerivation>(prefix, RETAINED_CCALL_INPUT, () => ({}));
  const inputs = [graph, source, cCall, result, judgment];
  const previous = facts.last;
  if (previous !== undefined && previous.end === runtimeEventPrefixLastEnvelope(prefix)?.eventId && previous.length === events.length &&
    (typeof basis === "string" ? previous.executionBasis.basisRef === basis : previous.executionBasis === basis) &&
    inputs.every((value, index) => value === previous.inputs[index])) return previous.retained;
  const executionBasis = typeof basis === "string" ? rehydrateExecutionBasisAtPrefix(prefix, basis) : basis;
  if (executionBasis === null) throw new TypeError("retention lacks the exact admitted ExecutionBasis");
  const selection = resolveRegisteredSelection(graph.template, source, cCall.outputContractRef, result.value,
    executionBasis.registeredSelectionDefinitionDigests ?? {});
  if (selection !== null) {
    if (selection.disposition !== "selected" || !hasAdmittedExecutionBasisAtPrefix(prefix, executionBasis) ||
      !hasAdmittedTraversalCursorAtPrefix(prefix, source) || executionBasis.basisRef !== source.executionBasisRef ||
      executionBasis.graphRef !== graph.materializationRef || executionBasis.graphDigest !== graph.materializationDigest ||
      cCall.basisId !== executionBasis.basisRef || cCall.graphCallId !== source.graphCallId || cCall.frameId !== source.frameId ||
      cCall.runId !== source.runId || result.resultClass !== "success" || judgment.judgment !== "advance" ||
      projectAdmittedCCallOutcomeAtPrefix(prefix, cCall, result, judgment) === null) {
      throw new TypeError("registered selection lacks the exact admitted successful source");
    }
    const input = rawAdmitValue<Readonly<Record<string, JsonValue>>>(selection.value, "invocation_input", selection.contractRef);
    if (input.kind !== "raw_admitted_value") throw new TypeError(input.message);
    return Object.freeze({ input, registeredSelectionApplicationRef: selection.applicationRef, causationEventRefs: Object.freeze([executionBasis.admissionEventRef, result.admissionEventRef, judgment.admissionEventRef]) });
  }
  const continuation = deriveCSourceContinuation(graph.template, source.currentNodeRef, source.termPath);
  if (continuation.kind === "c_source_path_refusal" || continuation.relation !== "graph_edge") return null;
  const edges = graph.template.edges.filter((edge) => edge.fromNodeRef === source.currentNodeRef);
  const edge = onlyExactMatch(edges);
  const binding = edge.kind === "one" ? edge.value.inputBinding : undefined;
  if (binding === undefined) return null;
  if (!hasAdmittedExecutionBasisAtPrefix(prefix, executionBasis) || !hasAdmittedTraversalCursorAtPrefix(prefix, source) ||
    executionBasis.basisRef !== source.executionBasisRef || executionBasis.graphRef !== graph.materializationRef ||
    executionBasis.graphDigest !== graph.materializationDigest || cCall.basisId !== executionBasis.basisRef ||
    cCall.graphCallId !== source.graphCallId || cCall.frameId !== source.frameId || cCall.runId !== source.runId ||
    cCall.outputContractRef !== binding.sourceContractRef || result.resultClass !== "success" || judgment.judgment !== "advance" ||
    projectAdmittedCCallOutcomeAtPrefix(prefix, cCall, result, judgment) === null) {
    throw new TypeError("retention lacks the exact admitted entry and successful source CCall");
  }
  const term = graph.template.nodes.find((node) => node.nodeRef === source.currentNodeRef)?.term;
  const causes = [executionBasis.admissionEventRef, result.admissionEventRef, judgment.admissionEventRef];
  if (term?.kind === "c_workflow") {
    runtimeEventBodiesAtPrefix(prefix);
    const folds = indexedRuntimeEvents(prefix, "payload:parentCCallRef:" + cCall.cCallRef).filter((event) => event.kind === "child_foldback_admitted" && event.runId === source.runId &&
      event.graphCallId === source.graphCallId && isRecord(event.payload) && event.payload.parentCCallRef === cCall.cCallRef);
    const fold = exactOrUndefined(onlyExactMatch(folds));
    const childGraphCallId = fold !== undefined && isRecord(fold.payload) ? fold.payload.childGraphCallId : null;
    const child = fold !== undefined && isRecord(fold.payload) && typeof fold.payload.childExecutionBasisRef === "string"
      ? rehydrateExecutionBasisAtPrefix(prefix, fold.payload.childExecutionBasisRef) : null;
    if (fold === undefined || !isRecord(fold.payload) || child === null ||
      child.graphFunctionRef !== term.graphFunctionRef || child.parentCCallRef !== cCall.cCallRef ||
      child.parentExecutionBasisRef !== executionBasis.basisRef || fold.payload.childDisposition !== "closed" ||
      fold.payload.outputDigest !== result.valueDigest || typeof fold.payload.childClosureRef !== "string" ||
      indexedRuntimeEvents(prefix, "basis:" + child.basisRef).filter((event) => event.kind === "graph_call_closed" && event.graphCallId === childGraphCallId &&
        event.runId === source.runId && event.basisId === child.basisRef).length !== 1) {
      throw new TypeError("retention source workflow lacks its exact completed child foldback");
    }
    causes.push(fold.eventId);
  }
  const value = binding.targetContractRef === RETAINED_GRAPH_INPUT_CONTRACT.contractRef
    ? constructRetainedGraphInput(executionBasis.rawInputValue, result.value)
    : constructRetainedWorksiteInput(binding, executionBasis.rawInputValue, result.value);
  const input = rawAdmitValue<Readonly<Record<string, JsonValue>>>(value, "invocation_input", binding.targetContractRef);
  if (input.kind !== "raw_admitted_value") throw new TypeError(input.message);
  const retained = Object.freeze({ input, causationEventRefs: Object.freeze([...new Set(causes)]) });
  if ([executionBasis, ...inputs].every((value) => isImmutableRuntimeValue(value))) {
    facts.last = Object.freeze({ end: runtimeEventPrefixLastEnvelope(prefix)?.eventId, length: events.length, executionBasis,
      inputs: Object.freeze(inputs), retained });
  }
  return retained;
}

interface ExactRouteAdmissionPrefix {
  readonly authorityPrefix: RuntimeEventPrefix;
  readonly runPrefix: RuntimeEventPrefix;
}

function admitRoute(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  graph: Readonly<GtlGraph>,
  sourceCursor: TraversalCursorCandidate,
  targetCursor: TraversalCursorCandidate | null,
  replayState: RuntimeReplayGuard,
  candidate: RouteCandidate,
  basis: RuntimeAdmissionBasis,
  evidence: TraversalTransitionEvidence,
  exactPrefix: ExactRouteAdmissionPrefix,
  options: RouteAdmissionOptions = {},
): RouteAdmissionResult {
  const authorityPrefix = exactPrefix.authorityPrefix;
  const prefix = exactPrefix.runPrefix;
  if (
    !hasAdmittedExecutionBasisAtPrefix(authorityPrefix, executionBasis) ||
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
    !hasAdmittedTraversalCursorAtPrefix(prefix, sourceCursor) ||
    sourceCursor.cursorRef !== candidate.sourceCursorRef ||
    sourceCursor.cursorDigest !== candidate.sourceCursorDigest
  ) {
    return refusal(
      "cursor_mismatch",
      "route source is not an admitted cursor under the exact original Graph",
    );
  }
  const evidenceClass = evidence === null ? "none" : evidence.evidenceClass;
  const recursionEvidence = evidenceClass === "recursion"
    ? evidence as RecursionRouteAdmissionEvidence
    : null;
  const blockedEvidence = evidenceClass === "blocked"
    ? evidence as BlockedRouteAdmissionEvidence
    : null;
  const fanOutEvidence = evidenceClass === "fan_out"
    ? evidence as FanOutRouteAdmissionEvidence
    : null;
  const holdEvidence = evidenceClass === "hold"
    ? evidence as HoldRouteAdmissionEvidence
    : null;
  const judgedRouteEvidence = evidenceClass === "judged"
    ? evidence as RouteAdmissionEvidence
    : null;
  let retained: ReturnType<typeof deriveRetainedCCallInputAtPrefix> = null;
  try {
    retained = candidate.routeKind === "advance" && judgedRouteEvidence !== null
      ? deriveRetainedCCallInputAtPrefix(authorityPrefix, executionBasis, graph, sourceCursor,
          judgedRouteEvidence.cCall, judgedRouteEvidence.result, judgedRouteEvidence.judgment) : null;
    if (candidate.registeredSelectionApplicationRef !== retained?.registeredSelectionApplicationRef ||
      (retained === null) !== (candidate.boundInput === undefined) ||
      retained !== null && retained.input !== candidate.boundInput &&
        (candidate.boundInput === undefined || !canonicalEquals(retained.input, candidate.boundInput))) {
      return refusal("candidate_mismatch", "route bound input is not the exact owner-derived entry/source binding");
    }
  } catch {
    return refusal("candidate_mismatch", "route retention entry/source authority or schema is invalid");
  }
  const retryEvidence = evidenceClass === "retry"
    ? evidence as RetryRouteAdmissionEvidence
    : null;
  const structuralIdentityEvidence = evidenceClass === "structural_identity"
    ? evidence as StructuralIdentityRouteAdmissionEvidence
    : null;
  const currentReplay = projectRuntimeReplayGuard(prefix, authorityPrefix);
  const frameEvents = indexedRuntimeEvents(prefix, "run:" + sourceCursor.runId).filter(
    (event) => event.runId === sourceCursor.runId && event.frameId === sourceCursor.frameId,
  );
  const latestCursorEvent = frameEvents.slice().reverse().find(
    (event) => event.kind === "traversal_route_admitted",
  );
  const initialCursorEvent = frameEvents.slice().reverse().find(
    (event) => event.kind === "traversal_cursor_entered",
  );
  const currentCursorRef = latestCursorEvent !== undefined &&
      isRecord(latestCursorEvent.payload)
    ? latestCursorEvent.payload.targetCursorRef
    : initialCursorEvent !== undefined && isRecord(initialCursorEvent.payload)
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
  const expectedDeclarationRef = recursionEvidence?.application.applicationRef ??
    graph.materializationRef;
  const expectedDeclarationDigest = recursionEvidence === null
    ? graph.materializationDigest
    : sha256Canonical(recursionEvidence.application);
  const body = routeCandidateBody(candidate);
  if (
    !isRouteCandidate(candidate) ||
    body === null ||
    candidate.declarationRef !== expectedDeclarationRef ||
    candidate.declarationDigest !== expectedDeclarationDigest ||
    candidate.kind !== "traversal_route_candidate" ||
    candidate.schemaVersion !== "5.0.0"
  ) {
    return refusal(
      "candidate_mismatch",
      "route candidate identity or transition contract differs from admitted truth",
    );
  }
  if (
    indexedRuntimeEventEnvelopes(prefix, "payload:sourceCursorRef:" + sourceCursor.cursorRef).some(
      row => row.kind === "traversal_route_admitted",
    )
  ) {
    return refusal(
      "route_already_admitted",
      "one traversal cursor cannot admit a second outgoing route",
    );
  }

  let causationEventRef = traversalCursorAdmissionEventRefAtPrefix(
    prefix,
    sourceCursor,
  );
  let additionalCausationEventRefs: readonly string[] = [];
  if (recursionEvidence !== null) {
    const recursionCausation = recursionRouteCausation({
      executionBasis,
      graph,
      source: sourceCursor,
      target: targetCursor,
      candidate,
      evidence: recursionEvidence,
      prefix,
    });
    if (typeof recursionCausation !== "string") return recursionCausation;
    causationEventRef = recursionCausation;
  } else if (candidate.routeKind === "terminal") {
    const judgedEvidence = judgedRouteEvidence;
    if (!hasJudgedRouteEvidence(
      prefix,
      executionBasis,
      graph,
      sourceCursor,
      null,
      candidate,
      judgedEvidence,
      authorityPrefix,
    )) {
      return refusal(
        "judgment_mismatch",
        "terminal route requires this cursor's admitted CCall advance judgment",
      );
    }
    const routeCausation = deriveCompletedProgressRouteCausation(
      judgedEvidence.completedProgresses ?? [],
      judgedEvidence.judgment.admissionEventRef,
    );
    causationEventRef = routeCausation.causationEventRef;
    additionalCausationEventRefs =
      routeCausation.additionalCausationEventRefs;
    const terminalCompleted = {
      inputRef: judgedEvidence.result.resultRef,
      inputDigest: judgedEvidence.result.valueDigest,
    };
    if (
      targetCursor !== null ||
      candidate.targetCursorRef !== null ||
      candidate.targetCursorDigest !== null ||
      !isDeclaredContinuationTarget(
        authorityPrefix,
        graph,
        sourceCursor,
        null,
        candidate,
        terminalCompleted,
      )
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
      hasAdmittedTraversalCursorAtPrefix(prefix, targetCursor) ||
      candidate.targetCursorRef !== targetCursor.cursorRef ||
      candidate.targetCursorDigest !== targetCursor.cursorDigest
    ) {
      return refusal(
        "candidate_mismatch",
        "route target is not one exact new cursor under the admitted GTL Graph",
      );
    }
    if (candidate.routeKind === "re_enter") {
      const reentryEvidence = judgedRouteEvidence;
      if (
        targetCursor === null ||
        !hasGraphSpanReentryRouteEvidence(
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
    } else if (evidenceClass === "none") {
      if (
        targetCursor.retryPath.length < sourceCursor.retryPath.length ||
        candidate.cCallRef !== null ||
        candidate.judgmentRef !== null ||
        candidate.consumedAvailabilityRefs.length !== 0 ||
        candidate.contractRef !== null ||
        !isDeclaredStructuralTarget(
          authorityPrefix,
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
    } else if (structuralIdentityEvidence !== null) {
      if (!hasStructuralIdentityRouteEvidence(
        prefix,
        graph,
        sourceCursor,
        targetCursor,
        candidate,
        structuralIdentityEvidence,
        authorityPrefix,
      )) {
        return refusal(
          "candidate_mismatch",
          "structural identity retry exit requires its exact completed-progress chain",
        );
      }
      const routeCausation = deriveCompletedProgressRouteCausation(
        structuralIdentityEvidence.completedProgresses,
        structuralIdentityEvidence.completionWitnessEventRef,
      );
      causationEventRef = routeCausation.causationEventRef;
      additionalCausationEventRefs =
        routeCausation.additionalCausationEventRefs;
    } else if (fanOutEvidence !== null) {
      if (
        candidate.routeKind !== "advance" ||
        !hasFanOutRouteEvidence(
          prefix,
          executionBasis,
          graph,
          sourceCursor,
          targetCursor,
          candidate,
          fanOutEvidence,
          authorityPrefix,
        )
      ) {
        return refusal(
          "judgment_mismatch",
          "fan-out route requires exact admitted complete-vector truth",
        );
      }
      const routeCausation = deriveCompletedProgressRouteCausation(
        fanOutEvidence.completedProgresses ?? [],
        fanOutEvidence.completion.admissionEventRef,
      );
      causationEventRef = routeCausation.causationEventRef;
      additionalCausationEventRefs =
        routeCausation.additionalCausationEventRefs;
    } else if (judgedRouteEvidence !== null) {
      if (
        candidate.routeKind !== "advance" ||
        !hasJudgedRouteEvidence(
          prefix,
          executionBasis,
          graph,
          sourceCursor,
          targetCursor,
          candidate,
          judgedRouteEvidence,
          authorityPrefix,
        ) ||
        !(registeredSelectionContinuationMatches(executionBasis, graph, sourceCursor, targetCursor,
          judgedRouteEvidence, retained?.input) ?? isDeclaredContinuationTarget(
          authorityPrefix, graph, sourceCursor, targetCursor, candidate,
          { inputRef: retained?.input.admissionRef ?? judgedRouteEvidence.result.resultRef,
            inputDigest: retained?.input.subjectDigest ?? judgedRouteEvidence.result.valueDigest },
        ))
      ) {
        return refusal(
          "judgment_mismatch",
          "post-judgment route is not the exact declared GTL continuation",
        );
      }
      const routeCausation = deriveCompletedProgressRouteCausation(
        judgedRouteEvidence.completedProgresses ?? [],
        judgedRouteEvidence.judgment.admissionEventRef,
      );
      causationEventRef = routeCausation.causationEventRef;
      additionalCausationEventRefs =
        routeCausation.additionalCausationEventRefs;
    } else if (
      retryEvidence !== null &&
      candidate.routeKind === "retry" &&
      hasRetryRouteEvidence(
        prefix,
        executionBasis,
        graph,
        sourceCursor,
        targetCursor,
        candidate,
        retryEvidence,
        authorityPrefix,
      )
    ) {
      causationEventRef = retryEvidence.progress.admissionEventRef;
    } else {
      return refusal(
        "judgment_mismatch",
        "post-call route requires admitted judgment or retry-progress evidence",
      );
    }
  } else if (candidate.routeKind === "hold") {
    if (
      targetCursor !== null ||
      !hasHoldRouteEvidence(
        prefix,
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
  } else if (candidate.routeKind === "blocked") {
    if (fanOutEvidence !== null) {
      if (!hasFanOutRouteEvidence(
        prefix,
        executionBasis,
        graph,
        sourceCursor,
        null,
        candidate,
        fanOutEvidence,
        authorityPrefix,
      )) {
        return refusal(
          "judgment_mismatch",
          "fan-out blocked route requires exact admitted partial-stop truth",
        );
      }
      causationEventRef = fanOutEvidence.completion.admissionEventRef;
    } else {
      if (!hasBlockedRouteEvidence(
        prefix,
        executionBasis,
        graph,
        sourceCursor,
        candidate,
        blockedEvidence,
        authorityPrefix,
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
    const failedEvidence = judgedRouteEvidence;
    if (!hasFailedRouteEvidence(
      prefix,
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
  if (
    candidate.routeKind === "blocked" &&
    blockedEvidence !== null &&
    (blockedEvidence.stoppedProgresses?.length ?? 0) > 0
  ) {
    assertRuntimeEventTransactionActive(store);
  }

  const routeDigest = sha256Canonical(body);
  const routeRef =
    `traversal-route://abiogenesis/${routeDigest.slice("sha256:".length)}`;
  const terminalReasonRef = recursionEvidence !== null
    ? recursionEvidence.foldback?.childReasonRef ??
      recursionEvidence.preparationRefusal?.diagnosticRef ??
      "reason://abiogenesis/recursion/bound-exhausted@5"
    : judgedRouteEvidence !== null
      ? judgedRouteEvidence.judgment.reasonRef
      : blockedEvidence !== null
        ? blockedEvidence.reasonRef
        : fanOutEvidence !== null &&
            fanOutEvidence.completion.completionKind === "partial_stop"
          ? "reason://abiogenesis/fan-out-partial-stop@5"
          : "reason://abiogenesis/blocked@5";
  additionalCausationEventRefs = [...new Set([...additionalCausationEventRefs, ...(retained?.causationEventRefs ?? [])])];
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
  // Preserve the owner-only batch indexes while observations join each real
  // producer before the next dependent effect in this same transaction.
  const admitRuntimeEventBatch = (target: AbgEventStore, factories: readonly RuntimeEventCandidateFactory[]): readonly RuntimeEvent[] => {
    assertRuntimeEventTransactionActive(target);
    const events: RuntimeEvent[] = [];
    for (const factory of factories) {
      const candidate = factory(events);
      const capturedAt = captureNativeFrameBoundary(target);
      const event = admitRuntimeEvent(target, candidate);
      events.push(event);
      observeNativeFrameLiveness(target, event, capturedAt);
    }
    return events;
  };
  const admittedEvents = (
      candidate.routeKind === "blocked" ||
      candidate.routeKind === "failed"
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
            disposition: candidate.routeKind,
            routeRef,
            cCallRef: candidate.cCallRef,
            judgmentRef: candidate.judgmentRef,
            reasonRef: terminalReasonRef,
          },
        }),
      ])
    : admitRuntimeEventBatch(store, [() => routeEventCandidate(causationEventRef)]);
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
    runStoppedEventRef:
      (
        candidate.routeKind === "blocked" ||
        candidate.routeKind === "failed"
      ) &&
        options.terminalizeRun !== false
        ? admittedEvents[1]?.eventId ?? null
        : null,
  }) as unknown as AdmittedRoute;
  return admitted;
}

export interface RouteTransitionAdmission {
  readonly kind: "route_transition_admission";
  readonly route: AdmittedRoute;
  readonly retryAttempt: RetryAttemptAdmission | null;
  readonly replayState: ReplayState;
  readonly successorPrefix: DurablePrefixCoordinate;
}

/** @internal The committed ordinary route preserves its fields with a selected guard. */
export type OwnedRouteTransitionAdmission = Omit<RouteTransitionAdmission, "replayState"> & {
  readonly replayState: RuntimeReplayGuard;
};
/** @internal */
export type OwnedRouteTransitionResult = OwnedRouteTransitionAdmission | RetryAdmissionRefusal | RouteAdmissionRefusal;

export type RouteTransitionResult =
  | RouteTransitionAdmission
  | RetryAdmissionRefusal
  | RouteAdmissionRefusal;

export interface StagedRouteTransitionAdmission {
  readonly kind: "staged_route_transition_admission";
  readonly route: AdmittedRoute;
  readonly retryAttempt: RetryAttemptAdmission | null;
  readonly replayState: ReplayState;
  readonly runtimePrefix: ValidatedRuntimeEventPrefix;
}

export type StagedRouteTransitionResult =
  | StagedRouteTransitionAdmission
  | RetryAdmissionRefusal
  | RouteAdmissionRefusal;

/** @internal Ordinary completion retains the same selected truth without requesting a complete public vector. */
type OwnedStagedRouteTransitionAdmission = Omit<StagedRouteTransitionAdmission, "runtimePrefix" | "replayState"> & { readonly runtimePrefix: RuntimeEventPrefix; readonly replayState: RuntimeReplayGuard };
/** @internal */
type OwnedStagedRouteTransitionResult = OwnedStagedRouteTransitionAdmission | RetryAdmissionRefusal | RouteAdmissionRefusal;

class RouteTransitionAbort extends Error {
  constructor(
    readonly result: Exclude<
      StagedRouteTransitionResult,
      StagedRouteTransitionAdmission
    >,
  ) {
    super(result.message);
  }
}

export interface AdmitTraversalTransitionInput {
  readonly predecessorPrefix: DurablePrefixCoordinate;
  store: AbgEventStore;
  executionBasis: ExecutionBasis;
  graph: Readonly<GtlGraph>;
  graphFunction: Readonly<GraphFunction>;
  source: TraversalCursorCandidate;
  target: TraversalCursorCandidate | null;
  candidate: TraversalTransitionCandidate;
  basis: RuntimeAdmissionBasis;
}

export interface StageTraversalTransitionInput extends Omit<
  AdmitTraversalTransitionInput,
  "predecessorPrefix"
> {
  readonly durablePredecessorPrefix: DurablePrefixCoordinate;
  readonly stagedPrefix: ValidatedRuntimeEventPrefix;
}

/** @internal */
type OwnedStageTraversalTransitionInput = Omit<StageTraversalTransitionInput, "stagedPrefix"> & { readonly stagedPrefix: RuntimeEventPrefix };

function transactionPrefixExtends(before: RuntimeEventPrefix, after: RuntimeEventPrefix): boolean {
  if (isOwnedRuntimeEventPrefix(before) && isOwnedRuntimeEventPrefix(after)) {
    return before.selection.length === before.selection.through &&
      after.selection.length === after.selection.through &&
      after.selection.sharesSource(before.selection) && after.selection.extends(before.selection);
  }
  const count = runtimeEventPrefixExtent(before).count;
  return runtimeEventPrefixDigest(count === 0
    ? selectValidatedRuntimeEventPrefix(Object.freeze([]))
    : validatedRuntimeEventPrefixThroughEvent(after, runtimeEventPrefixLastEnvelope(before)!.eventId)) ===
    runtimeEventPrefixDigest(before);
}

function transitionTransactionPrefix(store: AbgEventStore, predecessor: DurablePrefixCoordinate,
  complete: boolean): RuntimeEventPrefix {
  return complete
    ? selectValidatedRuntimeEventPrefix(readActiveRuntimeTransactionAtDurablePrefix(store, predecessor, { durableOnly: true }))
    : selectOwnedRuntimeEventPrefix(selectActiveRuntimeTransactionHistoryAtDurablePrefix(store, predecessor, { durableOnly: true }));
}

function committedRouteTransition(input: Readonly<AdmitTraversalTransitionInput>,
  staged: OwnedStagedRouteTransitionAdmission, successor: DurablePrefixCoordinate,
  complete: true): RouteTransitionAdmission;
function committedRouteTransition(input: Readonly<AdmitTraversalTransitionInput>,
  staged: OwnedStagedRouteTransitionAdmission, successor: DurablePrefixCoordinate,
  complete: false): OwnedRouteTransitionAdmission;
function committedRouteTransition(input: Readonly<AdmitTraversalTransitionInput>,
  staged: OwnedStagedRouteTransitionAdmission, successor: DurablePrefixCoordinate,
  complete: boolean): OwnedRouteTransitionAdmission;
function committedRouteTransition(input: Readonly<AdmitTraversalTransitionInput>,
  staged: OwnedStagedRouteTransitionAdmission, successor: DurablePrefixCoordinate,
  complete: boolean): OwnedRouteTransitionAdmission {
  const authority = complete
    ? selectValidatedRuntimeEventPrefix(projectRuntimeEventsAtDurablePrefix(successor))
    : projectOwnedRuntimeEventPrefixAtDurablePrefix(successor);
  const run = selectRuntimeEventPrefixFromAuthority(authority, { runId: input.source.runId });
  return deepFreeze({
    kind: "route_transition_admission" as const,
    route: staged.route,
    retryAttempt: staged.retryAttempt,
    replayState: complete ? replayValidatedRuntimeEventPrefix(run, authority) : projectRuntimeReplayGuard(run, authority),
    successorPrefix: successor,
  });
}

function selectOwnedTransactionStagedPrefix(
  store: AbgEventStore,
  predecessorEvents: RuntimeEventScan,
): RuntimeEventPrefix {
  assertRuntimeEventTransactionActive(store);
  const stagedPrefix = selectRuntimeEventPrefixFromStore(store);
  const stagedEvents = runtimeEventBodiesAtPrefix(stagedPrefix);
  const predecessorPrefix = selectValidatedRuntimeEventPrefix(predecessorEvents);
  const predecessorExtent = runtimeEventPrefixExtent(predecessorPrefix);
  if (
    stagedEvents.length <= predecessorExtent.count ||
    !transactionPrefixExtends(predecessorPrefix, stagedPrefix) ||
    store.digest() !== runtimeEventPrefixDigest(stagedPrefix)
  ) {
    throw new TypeError("traversal transition staged prefix does not extend its exact predecessor");
  }
  return stagedPrefix;
}

/**
 * Stages one completed HoG transition inside the caller-owned ABG transaction.
 * The caller supplies both the exact durable transaction base and the exact
 * transaction-local predecessor. ABG validates but never selects the route.
 */
export function admitTraversalTransitionInActiveTransaction(input: Readonly<StageTraversalTransitionInput>): StagedRouteTransitionResult;
/** @internal */
export function admitTraversalTransitionInActiveTransaction(input: Readonly<OwnedStageTraversalTransitionInput>): OwnedStagedRouteTransitionResult;
export function admitTraversalTransitionInActiveTransaction(
  input: Readonly<OwnedStageTraversalTransitionInput>,
): OwnedStagedRouteTransitionResult {
  if (!isRuntimeEventTransactionActive(input.store)) {
    throw new TypeError(
      "staged traversal transition requires one active ABG transaction",
    );
  }

  let events: RuntimeEventScan;
  try {
    events = runtimeEventBodiesAtPrefix(selectOwnedRuntimeEventPrefix(selectActiveRuntimeTransactionHistoryAtDurablePrefix(
      input.store, input.durablePredecessorPrefix, { durableOnly: true },
    )));
  } catch {
    return refusal(
      "replay_mismatch",
      "traversal transition requires the exact selected durable predecessor prefix",
    );
  }
  const stagedEvents = runtimeEventBodiesAtPrefix(input.stagedPrefix);
  if (
    stagedEvents.length < events.length ||
    !transactionPrefixExtends(selectValidatedRuntimeEventPrefix(events), input.stagedPrefix) ||
    input.store.digest() !==
      runtimeEventPrefixDigest(input.stagedPrefix)
  ) {
    return refusal(
      "replay_mismatch",
      "traversal transition requires the exact transaction-local predecessor extending its durable base",
    );
  }

  const authorityPrefix = input.stagedPrefix;
  const runPrefix = selectRuntimeEventPrefixFromAuthority(authorityPrefix, {
    runId: input.source.runId,
  });
  const predecessorReplay = projectRuntimeReplayGuard(runPrefix,authorityPrefix);
  const transition = input.candidate;
  if (
    !isTraversalTransitionCandidate(transition) ||
    transition.route.sourceCursorRef !== input.source.cursorRef ||
    transition.route.sourceCursorDigest !== input.source.cursorDigest ||
    transition.route.targetCursorRef !== (input.target?.cursorRef ?? null) ||
    transition.route.targetCursorDigest !== (input.target?.cursorDigest ?? null) ||
    transition.route.replayStateDigest !== predecessorReplay.replayDigest ||
    (
      transition.transitionClass === "retry" &&
      (input.target === null || transition.route.routeKind !== "retry")
    )
  ) {
    return refusal(
      "candidate_mismatch",
      "traversal transition differs from its exact source, target, or predecessor truth",
    );
  }
  const route = admitRoute(
    input.store,
    input.executionBasis,
    input.graph,
    input.source,
    input.target,
    predecessorReplay,
    transition.route,
    { ...input.basis, correlationId: `${input.basis.correlationId}/route` },
    transition.evidence,
    { authorityPrefix, runPrefix },
    { terminalizeRun: transition.terminalizeRun },
  );
  if (route.kind !== "admitted_traversal_route") return route;
  let retryAttempt: RetryAttemptAdmission | null = null;
  if (transition.transitionClass === "retry") {
    const routeSuccessorPrefix = selectOwnedTransactionStagedPrefix(
      input.store,
      stagedEvents,
    );
    const attempt = admitRetryAttempt(
      input.store,
      routeSuccessorPrefix,
      input.executionBasis,
      input.graph,
      input.graphFunction,
      input.target!,
      transition.retryInput,
      route.admissionEventRef,
      {
        ...input.basis,
        correlationId: `${input.basis.correlationId}/attempt`,
      },
    );
    if (attempt.kind !== "retry_attempt_admission") return attempt;
    retryAttempt = attempt;
  }
  const stagedAuthorityPrefix = selectOwnedTransactionStagedPrefix(
    input.store,
    stagedEvents,
  );
  const stagedRunPrefix = selectRuntimeEventPrefixFromAuthority(
    stagedAuthorityPrefix,
    { runId: input.source.runId },
  );
  let admittedRoute: AdmittedRoute | null;
  try {
    admittedRoute = projectAdmittedRoute(
      stagedRunPrefix,
      route.admissionEventRef,
      stagedAuthorityPrefix,
      true,
    );
  } catch (cause) {
    throw new TypeError(
      "traversal transition differs from its staged successor projection",
      { cause },
    );
  }
  if (
    admittedRoute === null ||
    !canonicalEquals(
      admittedRoute,
      route,
    )
  ) {
    throw new TypeError(
      "traversal transition differs from its staged successor projection",
    );
  }
  return deepFreeze({
    kind: "staged_route_transition_admission" as const,
    route: admittedRoute,
    retryAttempt,
    replayState: input.stagedPrefix.kind === "validated_runtime_event_prefix"
      ? replayValidatedRuntimeEventPrefix(stagedRunPrefix, stagedAuthorityPrefix)
      : projectRuntimeReplayGuard(stagedRunPrefix, stagedAuthorityPrefix),
    runtimePrefix: input.stagedPrefix.kind === "validated_runtime_event_prefix"
      ? selectValidatedRuntimeEventPrefix(input.store.readAll(), { runId: input.source.runId }) : stagedRunPrefix,
  });
}

/**
 * Atomically admits one transition already derived by HoG from the exact GTL
 * topology. ABG validates the completed candidate against admitted runtime
 * truth at the caller-selected immutable prefix; it never selects a route
 * variant or derives a successor.
 */
export function admitTraversalTransition(
  input: Readonly<AdmitTraversalTransitionInput>,
): RouteTransitionResult {
  return admitTraversalTransitionUsing({ complete: true, input });
}

/** @internal Same atomic route computation without complete historical output. */
export function admitOwnedTraversalTransition(
  input: Readonly<AdmitTraversalTransitionInput>,
): OwnedRouteTransitionResult {
  return admitTraversalTransitionUsing({ complete: false, input });
}

function admitTraversalTransitionUsing(mode: Readonly<{ complete: true; input: Readonly<AdmitTraversalTransitionInput> }>): RouteTransitionResult;
function admitTraversalTransitionUsing(mode: Readonly<{ complete: false; input: Readonly<AdmitTraversalTransitionInput> }>): OwnedRouteTransitionResult;
function admitTraversalTransitionUsing(
  mode: Readonly<{ complete: true; input: Readonly<AdmitTraversalTransitionInput> }> | Readonly<{ complete: false; input: Readonly<AdmitTraversalTransitionInput> }>,
): OwnedRouteTransitionResult {
  const input = mode.input;
  if (isRuntimeEventTransactionActive(input.store)) {
    throw new TypeError(
      "traversal transition admission owns its complete ABG transaction",
    );
  }
  let entered = false;
  try {
    const committed = admitRuntimeEventTransactionAtDurablePrefix(
      input.store,
      input.predecessorPrefix,
      () => {
        entered = true;
        const predecessor = transitionTransactionPrefix(input.store, input.predecessorPrefix, mode.complete);
        const staged = admitTraversalTransitionInActiveTransaction({
          ...input,
          durablePredecessorPrefix: input.predecessorPrefix,
          stagedPrefix: predecessor,
        });
        if (staged.kind !== "staged_route_transition_admission") {
          throw new RouteTransitionAbort(staged);
        }
        return staged;
      },
    );
    if (committed.successorPrefix === null) {
      throw new TypeError(
        "traversal transition admission produced no durable successor prefix",
      );
    }
    return committedRouteTransition(input, committed.value, committed.successorPrefix, mode.complete);
  } catch (error) {
    if (!entered) {
      return refusal(
        "replay_mismatch",
        "traversal transition requires the exact selected durable predecessor prefix",
      );
    }
    if (error instanceof RouteTransitionAbort) return error.result;
    try {
      assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
    } catch {
      return refusal(
        "replay_mismatch",
        "traversal transition predecessor changed before admission",
      );
    }
    throw error;
  }
}

export interface AdmitCompletedRetryTraversalTransitionInput
  extends AdmitTraversalTransitionInput {
  readonly progressPlan: CompletedRetryProgressPlan;
  readonly completion: RetrySuccessfulExitEvidence;
  readonly progressBasis: RuntimeAdmissionBasis;
}

/** @internal */
export type OwnedAdmitCompletedRetryTraversalTransitionInput = Omit<AdmitCompletedRetryTraversalTransitionInput, "progressPlan"> & {
  readonly progressPlan: OwnedCompletedRetryProgressPlan;
};

/**
 * Atomically admits the pre-effect completed-retry progress plan and its one
 * HoG-selected consuming route. HoG supplies candidates; ABG alone owns the
 * combined expected-prefix commit and revalidates both relations.
 */
export function admitCompletedRetryTraversalTransition(
  input: Readonly<AdmitCompletedRetryTraversalTransitionInput>,
): RouteTransitionResult {
  return admitCompletedRetryTraversalTransitionUsing({ complete: true, input });
}

/** @internal Same atomic route computation without complete historical output. */
export function admitOwnedCompletedRetryTraversalTransition(
  input: Readonly<OwnedAdmitCompletedRetryTraversalTransitionInput>,
): OwnedRouteTransitionResult {
  return admitCompletedRetryTraversalTransitionUsing({ complete: false, input });
}

function admitCompletedRetryTraversalTransitionUsing(mode: Readonly<{ complete: true; input: Readonly<AdmitCompletedRetryTraversalTransitionInput> }>): RouteTransitionResult;
function admitCompletedRetryTraversalTransitionUsing(mode: Readonly<{ complete: false; input: Readonly<OwnedAdmitCompletedRetryTraversalTransitionInput> }>): OwnedRouteTransitionResult;
function admitCompletedRetryTraversalTransitionUsing(
  mode: Readonly<{ complete: true; input: Readonly<AdmitCompletedRetryTraversalTransitionInput> }> | Readonly<{ complete: false; input: Readonly<OwnedAdmitCompletedRetryTraversalTransitionInput> }>,
): OwnedRouteTransitionResult {
  const input = mode.input;
  if (isRuntimeEventTransactionActive(input.store)) {
    throw new TypeError(
      "completed retry transition owns its complete ABG transaction",
    );
  }
  let entered = false;
  try {
    const committed = admitRuntimeEventTransactionAtDurablePrefix(
      input.store,
      input.predecessorPrefix,
      () => {
        entered = true;
        const predecessor = transitionTransactionPrefix(input.store, input.predecessorPrefix, mode.complete);
        if (
          input.progressPlan.progresses.length === 0 ||
          input.progressPlan.predecessorEventDigest !==
            runtimeEventPrefixDigest(predecessor)
        ) {
          throw new RouteTransitionAbort(refusal(
            "candidate_mismatch",
            "completed retry transition requires one non-empty exact progress plan",
          ));
        }
        const progresses = mode.complete
          ? admitPlannedCompletedRetryProgressInActiveTransaction(
              input.store, input.predecessorPrefix, input.graph, input.graphFunction,
              input.source, input.target, input.completion, input.progressBasis, mode.input.progressPlan)
          : admitOwnedPlannedCompletedRetryProgressInActiveTransaction(
              input.store, input.predecessorPrefix, input.graph, input.graphFunction,
              input.source, input.target, input.completion, input.progressBasis, mode.input.progressPlan);
        if ("kind" in progresses) {
          throw new RouteTransitionAbort(progresses);
        }
        if (
          !canonicalEquals(
            progresses,
            input.progressPlan.progresses,
          )
        ) {
          throw new TypeError(
            "completed retry progress differs from its planned admission",
          );
        }
        const staged = admitTraversalTransitionInActiveTransaction({
          ...input,
          durablePredecessorPrefix: input.predecessorPrefix,
          stagedPrefix: mode.complete ? selectValidatedRuntimeEventPrefix(input.store.readAll()) : selectRuntimeEventPrefixFromStore(input.store),
        });
        if (staged.kind !== "staged_route_transition_admission") {
          throw new RouteTransitionAbort(staged);
        }
        return staged;
      },
    );
    if (committed.successorPrefix === null) {
      throw new TypeError(
        "completed retry transition produced no durable successor prefix",
      );
    }
    return committedRouteTransition(input, committed.value, committed.successorPrefix, mode.complete);
  } catch (error) {
    if (!entered) {
      return refusal(
        "replay_mismatch",
        "completed retry transition requires its exact durable predecessor",
      );
    }
    if (error instanceof RouteTransitionAbort) return error.result;
    try {
      assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
    } catch {
      return refusal(
        "replay_mismatch",
        "completed retry transition predecessor changed before admission",
      );
    }
    throw error;
  }
}

export interface AdmitBlockedRetryTraversalTransitionInput
  extends AdmitTraversalTransitionInput {
  /** @internal Synchronous pure HoG selection at the actual staged prefix. */
  readonly selectRouteCandidate?: (replay: ReplayState) => TraversalTransitionCandidate;
  readonly failureSource: CCallRuntimeFailureSource;
  readonly failureCandidate: JsonValue;
  readonly failureValueKind: string;
  readonly failureBasis: RuntimeAdmissionBasis;
  readonly failurePlan: RetryRuntimeFailureTransitionPlan;
}

/** @internal */
export type OwnedAdmitBlockedRetryTraversalTransitionInput = Omit<AdmitBlockedRetryTraversalTransitionInput, "failurePlan" | "selectRouteCandidate"> & {
  readonly failurePlan: OwnedRetryRuntimeFailureTransitionPlan;
  readonly selectRouteCandidate?: (replay: RuntimeReplayGuard) => TraversalTransitionCandidate;
};

/**
 * Atomically admits one planned blocked runtime-failure closure and its one
 * HoG-selected consuming route. The caller supplies selection; ABG rederives
 * and commits the complete event relation at the exact predecessor.
 */
export function admitBlockedRetryTraversalTransition(
  input: Readonly<AdmitBlockedRetryTraversalTransitionInput>,
): RouteTransitionResult {
  return admitBlockedRetryTraversalTransitionUsing({ complete: true, input });
}

/** @internal Same atomic route computation without complete historical output. */
export function admitOwnedBlockedRetryTraversalTransition(
  input: Readonly<OwnedAdmitBlockedRetryTraversalTransitionInput>,
): OwnedRouteTransitionResult {
  return admitBlockedRetryTraversalTransitionUsing({ complete: false, input });
}

function admitBlockedRetryTraversalTransitionUsing(mode: Readonly<{ complete: true; input: Readonly<AdmitBlockedRetryTraversalTransitionInput> }>): RouteTransitionResult;
function admitBlockedRetryTraversalTransitionUsing(mode: Readonly<{ complete: false; input: Readonly<OwnedAdmitBlockedRetryTraversalTransitionInput> }>): OwnedRouteTransitionResult;
function admitBlockedRetryTraversalTransitionUsing(
  mode: Readonly<{ complete: true; input: Readonly<AdmitBlockedRetryTraversalTransitionInput> }> | Readonly<{ complete: false; input: Readonly<OwnedAdmitBlockedRetryTraversalTransitionInput> }>,
): OwnedRouteTransitionResult {
  const input = mode.input;
  if (isRuntimeEventTransactionActive(input.store)) {
    throw new TypeError(
      "blocked retry transition owns its complete ABG transaction",
    );
  }
  let entered = false;
  try {
    assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
    const committed = admitRuntimeEventTransactionAtDurablePrefix(
      input.store,
      input.predecessorPrefix,
      () => {
        entered = true;
        const predecessor = transitionTransactionPrefix(input.store, input.predecessorPrefix, mode.complete);
        const evidence = input.candidate.transitionClass === "route"
          ? input.candidate.evidence
          : null;
        if (
          input.target !== null ||
          evidence?.evidenceClass !== "blocked" ||
          input.failurePlan.transition.disposition !== "blocked" ||
          input.failurePlan.predecessorEventDigest !==
            runtimeEventPrefixDigest(predecessor) ||
          !canonicalEquals(
            evidence.stoppedProgresses,
            input.failurePlan.transition.stoppedProgresses,
          ) ||
          evidence.cCall.cCallRef !== input.failurePlan.transition.close.cCallRef ||
          evidence.resultRef !==
            input.failurePlan.transition.close.result.resultRef ||
          evidence.judgmentRef !==
            input.failurePlan.transition.close.judgment.judgmentRef
        ) {
          throw new RouteTransitionAbort(refusal(
            "candidate_mismatch",
            "blocked retry route differs from its exact planned failure transition",
          ));
        }
        const transition =
          admitPlannedRetryRuntimeFailureTransitionInActiveTransaction(
            input.store,
            predecessor,
            input.executionBasis,
            input.graph,
            input.graphFunction,
            input.source,
            evidence.cCall,
            input.failureSource,
            input.failureCandidate,
            input.failureValueKind,
            input.failureBasis,
            input.failurePlan,
          );
        if (
          transition.kind !== "retry_runtime_failure_transition_admission"
        ) {
          throw new RouteTransitionAbort(transition);
        }
        if (transition.disposition !== "blocked") {
          throw new TypeError(
            "blocked retry plan admitted a non-blocked transition",
          );
        }
        const stagedPrefix = mode.complete ? selectValidatedRuntimeEventPrefix(input.store.readAll()) : selectRuntimeEventPrefixFromStore(input.store);
        const stagedRun = selectRuntimeEventPrefixFromAuthority(stagedPrefix, { runId: input.source.runId });
        const candidate = mode.complete
          ? mode.input.selectRouteCandidate?.(replayValidatedRuntimeEventPrefix(stagedRun, stagedPrefix)) ?? input.candidate
          : mode.input.selectRouteCandidate?.(projectRuntimeReplayGuard(stagedRun, stagedPrefix)) ?? input.candidate;
        if (candidate.transitionClass !== "route" ||
            !canonicalEquals(
              candidate.evidence,
              input.candidate.evidence,
            )) {
          throw new RouteTransitionAbort(refusal(
            "candidate_mismatch", "blocked staged selection changed its planned owner evidence",
          ));
        }
        const staged = admitTraversalTransitionInActiveTransaction({
          ...input,
          candidate,
          durablePredecessorPrefix: input.predecessorPrefix,
          stagedPrefix,
        });
        if (staged.kind !== "staged_route_transition_admission") {
          throw new RouteTransitionAbort(staged);
        }
        return staged;
      },
    );
    if (committed.successorPrefix === null) {
      throw new TypeError(
        "blocked retry transition produced no durable successor prefix",
      );
    }
    return committedRouteTransition(input, committed.value, committed.successorPrefix, mode.complete);
  } catch (error) {
    if (!entered) {
      return refusal(
        "replay_mismatch",
        "blocked retry transition requires its exact durable predecessor",
      );
    }
    if (error instanceof RouteTransitionAbort) return error.result;
    try {
      assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
    } catch {
      return refusal(
        "replay_mismatch",
        "blocked retry transition predecessor changed before admission",
      );
    }
    throw error;
  }
}
