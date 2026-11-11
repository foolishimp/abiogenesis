import { selectRuntimeEventPrefixFromStore } from "./event_prefix.js";
import { projectRuntimeReplayGuard, materializeRuntimeReplayGuard, type RuntimeReplayGuard } from "./replay.js";
import type {
  GraphFunction,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { ProductInstall, WorkspaceBinding } from "../product/environment.js";
import type { GraphFunctionCatalogView } from "../product/catalog.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { type ReplayState } from "./replay.js";
import type { GraphValidation } from "../validator/graph.js";
import type { ProgramValidation } from "../validator/validation.js";
import type { ExactPrefixArtifactTruthProjection } from "./artifact_truth.js";
import {
  isAdmittedCCallJudgment,
  isAdmittedCCallResult,
  admitOwnedPlannedPendingInteraction, type OwnedPendingInteractionAdmissionPlan,
  type PendingInteractionAdmission,
  type PendingInteractionAdmissionPlan,
} from "./c_call.js";
import { canonicalEquals } from "../shared/value/index.js";

function graphFunctionCatalogViewRef(view: GraphFunctionCatalogView): string {
  return `graph-function-catalog-view://abiogenesis/${view.viewDigest.slice("sha256:".length)}`;
}
import {
  hasAdmittedExecutionBasisAtPrefix,
  hasAdmittedInteractionSetAtPrefix,
  isAdmittedConstructionInteractionLocus,
  type AdmittedInteractionSet,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  hasAdmittedProductInstall,
  hasAdmittedWorkspaceBinding,
} from "./environment_admission.js";
import {
  AbgEventStore,
  admitNonEmptyRuntimeEventTransactionAtDurablePrefix,
  assertHeldEventStoreAtDurablePrefix,
  admitRuntimeEvent,
  type DurablePrefixCoordinate,
} from "./event_store.js";
import { runtimeEventPrefixDigest,
  selectRuntimeEventPrefixFromAuthority,
} from "./event_prefix.js";
import {
  hasOpenedTraversalScopeAtPrefix,
  type OpenedTraversalScope,
} from "./open_call.js";
import {
  isAdmittedRoute,
  admitTraversalTransitionInActiveTransaction,
  rehydrateConstructionIntentForCursorAtPrefix,
  type AdmittedRoute,
  type ConstructionIntentAdmission,
} from "./traversal_route.js";
import type { TraversalTransitionCandidate } from "./traversal_transition.js";
import {
  hasAdmittedTraversalCursorAtPrefix,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export {
  projectFhContinuations,
  type ReplayContinuationState,
} from "./fh_continuation_projection.js";

export interface ContinuationProductBasis {
  readonly install: ProductInstall;
  readonly workspaceBinding: WorkspaceBinding;
  readonly artifactTruth: ExactPrefixArtifactTruthProjection;
  readonly catalogView: GraphFunctionCatalogView;
  readonly programValidation: ProgramValidation;
  readonly graphValidation: GraphValidation;
}

export interface FhInteractionContinuation {
  readonly kind: "fh_interaction_continuation";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "open";
  readonly continuationRef: string;
  readonly continuationDigest: Sha256Digest;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly cCallRef: string;
  readonly actorCapabilityRef: string;
  readonly requestContractRef: string;
  readonly responseContractRef: string;
  readonly requestRef: string;
  readonly requestDigest: Sha256Digest;
  readonly heldCursorRef: string;
  readonly heldCursorDigest: Sha256Digest;
  readonly constructionIntentRef: string | null;
  readonly constructionIntentDigest: Sha256Digest | null;
  readonly openedEventRef: string;
}

export type FhInteractionResumeAdmission = {
  readonly kind: "fh_interaction_resume_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "resolved";
  readonly continuationRef: string;
  readonly actorRef: string;
  readonly capabilityRef: string;
  readonly responseRef: string;
  readonly responseDigest: Sha256Digest;
  readonly responseValue: Readonly<Record<string, JsonValue>>;
  readonly successorInputRef: string;
  readonly successorInputDigest: Sha256Digest;
  readonly successorInputValue: Readonly<Record<string, JsonValue>>;
  readonly successorInputContractRef: string | null;
  readonly successorInputValueKind: string | null;
  readonly successorCursorRef: string;
  readonly successorCursorDigest: Sha256Digest;
  readonly admissionEventRef: string;
};

export function admitFhInteractionOpen(
  store: AbgEventStore,
  executionBasis: ExecutionBasis,
  scope: OpenedTraversalScope,
  program: Readonly<GtlProgram>,
  graph: Readonly<GtlGraph>,
  interactionSet: AdmittedInteractionSet,
  cursor: TraversalCursorCandidate,
  pending: PendingInteractionAdmission,
  route: AdmittedRoute,
  productBasis: ContinuationProductBasis,
  inputValue: Readonly<Record<string, JsonValue>>,
  basis: RuntimeAdmissionBasis,
): FhInteractionContinuation {
  const prefix = selectRuntimeEventPrefixFromStore(store);
  const cCall = pending.cCall;
  const constructionIntent: ConstructionIntentAdmission | null =
    rehydrateConstructionIntentForCursorAtPrefix(prefix, cursor);
  const requiresConstructionIntent =
    isAdmittedConstructionInteractionLocus(
      executionBasis,
      cCall.programLocusRef,
      cCall.compositionRef,
    );
  if (
    !hasAdmittedExecutionBasisAtPrefix(prefix, executionBasis) ||
    !hasOpenedTraversalScopeAtPrefix(prefix, scope) ||
    !hasAdmittedInteractionSetAtPrefix(prefix, interactionSet) ||
    !hasAdmittedTraversalCursorAtPrefix(prefix, cursor) ||
    !isAdmittedCCallResult(pending.result) ||
    !isAdmittedCCallJudgment(pending.judgment) ||
    !isAdmittedRoute(
      selectRuntimeEventPrefixFromAuthority(prefix, { runId: scope.runId }),
      route,
      prefix,
    ) ||
    !hasAdmittedProductInstall(productBasis.artifactTruth, productBasis.install) ||
    !hasAdmittedWorkspaceBinding(
      productBasis.artifactTruth,
      productBasis.workspaceBinding,
    ) ||
    productBasis.catalogView.kind !== "graph_function_catalog_view" ||
    cCall.regime !== "F_H" ||
    cCall.actorCapabilityRef === null ||
    cCall.responseContractRef === null ||
    route.routeKind !== "hold" ||
    route.cCallRef !== cCall.cCallRef ||
    route.judgmentRef !== pending.judgment.judgmentRef ||
    route.sourceCursorRef !== cursor.cursorRef ||
    executionBasis.basisRef !== cCall.basisId ||
    scope.scopeRef !== cursor.traversalScopeRef ||
    graph.materializationRef !== executionBasis.graphRef ||
    program.programRef !== executionBasis.programRef ||
    sha256Canonical(inputValue) !== cursor.inputDigest ||
    productBasis.workspaceBinding.bindingId !== executionBasis.workspaceBindingId ||
    productBasis.workspaceBinding.bindingDigest !==
      executionBasis.workspaceBindingDigest ||
    graphFunctionCatalogViewRef(productBasis.catalogView) !== executionBasis.catalogViewId ||
    productBasis.catalogView.viewDigest !== executionBasis.catalogViewDigest ||
    productBasis.programValidation.validationRef !==
      executionBasis.programValidationRef ||
    productBasis.graphValidation.validationRef !==
      executionBasis.graphValidationRef ||
    (
      requiresConstructionIntent &&
      (
        constructionIntent === null ||
        constructionIntent.executionBasisRef !== executionBasis.basisRef ||
        constructionIntent.executionBasisDigest !== executionBasis.basisDigest ||
        constructionIntent.programRef !== executionBasis.programRef ||
        constructionIntent.graphFunctionRef !== executionBasis.graphFunctionRef ||
        constructionIntent.workspaceBindingId !==
          executionBasis.workspaceBindingId ||
        constructionIntent.workspaceBindingDigest !==
          executionBasis.workspaceBindingDigest ||
        constructionIntent.runId !== scope.runId ||
        constructionIntent.graphCallId !== scope.graphCallId ||
        constructionIntent.frameId !== scope.frameId ||
        constructionIntent.targetCursorRef !== cursor.cursorRef ||
        constructionIntent.targetCursorDigest !== cursor.cursorDigest ||
        constructionIntent.targetProgramLocusRef !== cCall.programLocusRef
      )
    )
  ) {
    throw new TypeError(
      "F_H continuation requires one exact admitted pending interaction basis",
    );
  }
  const identity = {
    continuationKind: "fh_interaction" as const,
    runId: scope.runId,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    cCallRef: cCall.cCallRef,
    heldCursorRef: cursor.cursorRef,
    heldCursorDigest: cursor.cursorDigest,
    requestRef: pending.requestRef,
    requestDigest: pending.requestDigest,
    actorCapabilityRef: cCall.actorCapabilityRef,
    responseContractRef: cCall.responseContractRef,
    executionBasisRef: executionBasis.basisRef,
    constructionIntentRef:
      constructionIntent?.constructionIntentRef ?? null,
  };
  const continuationDigest = sha256Canonical(identity);
  const continuationRef =
    `continuation://abiogenesis/${continuationDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "fh_interaction_opened",
    eventTime: basis.eventTime,
    aggregateType: "continuation",
    aggregateId: continuationRef,
    parentAggregateId: scope.frameId,
    causationEventRefs: [
      route.admissionEventRef,
      ...(constructionIntent === null
        ? []
        : [constructionIntent.admissionEventRef]),
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: executionBasis.basisRef,
    runId: scope.runId,
    graphFunctionRef: executionBasis.graphFunctionRef,
    materializationRef: graph.materializationRef,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    payload: {
      continuationRef,
      continuationDigest,
      continuationKind: "fh_interaction",
      causedByEventRef: pending.judgment.admissionEventRef,
      holdRouteRef: route.routeRef,
      cCallRef: cCall.cCallRef,
      requestContractRef: cCall.inputContractRef,
      requestRef: pending.requestRef,
      requestDigest: pending.requestDigest,
      responseContractRef: cCall.responseContractRef,
      actorCapabilityRef: cCall.actorCapabilityRef,
      heldCursorRef: cursor.cursorRef,
      heldCursorDigest: cursor.cursorDigest,
      inputRef: cursor.inputRef,
      inputDigest: cursor.inputDigest,
      inputValue,
      implementationSetRef: executionBasis.implementationSetRef,
      implementationSetDigest: executionBasis.implementationSetDigest,
      interactionSetRef: interactionSet.interactionSetRef,
      interactionSetDigest: interactionSet.interactionSetDigest,
      executionBasisRef: executionBasis.basisRef,
      executionBasisDigest: executionBasis.basisDigest,
      scopeRef: scope.scopeRef,
      scopeDigest: scope.scopeDigest,
      programRef: program.programRef,
      programDigest: executionBasis.programDigest,
      graphFunctionRef: executionBasis.graphFunctionRef,
      graphFunctionDigest: executionBasis.graphFunctionDigest,
      graphRef: graph.materializationRef,
      graphDigest: graph.materializationDigest,
      programValidationRef: productBasis.programValidation.validationRef,
      graphValidationRef: productBasis.graphValidation.validationRef,
      openedTraversalScope: scope,
      heldCursor: cursor,
      cCall: cCall,
      pendingResult: pending.result,
      pendingJudgment: pending.judgment,
      productId: productBasis.install.productId,
      productContentDigest: productBasis.install.productContentDigest,
      manifestDigest: productBasis.install.manifestDigest,
      installId: productBasis.install.installId,
      workspaceBindingId: productBasis.workspaceBinding.bindingId,
      workspaceBindingDigest: productBasis.workspaceBinding.bindingDigest,
      catalogViewId: graphFunctionCatalogViewRef(productBasis.catalogView),
      catalogViewDigest: productBasis.catalogView.viewDigest,
      ...(constructionIntent === null
        ? {}
        : {
            constructionIntentRef:
              constructionIntent.constructionIntentRef,
            constructionIntentDigest:
              constructionIntent.constructionIntentDigest,
          }),
    },
  });
  return deepFreeze({
    kind: "fh_interaction_continuation" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "open" as const,
    continuationRef,
    continuationDigest,
    runId: scope.runId,
    graphCallId: scope.graphCallId,
    frameId: scope.frameId,
    cCallRef: cCall.cCallRef,
    actorCapabilityRef: cCall.actorCapabilityRef,
    requestContractRef: cCall.inputContractRef,
    responseContractRef: cCall.responseContractRef,
    requestRef: pending.requestRef,
    requestDigest: pending.requestDigest,
    heldCursorRef: cursor.cursorRef,
    heldCursorDigest: cursor.cursorDigest,
    constructionIntentRef:
      constructionIntent?.constructionIntentRef ?? null,
    constructionIntentDigest:
      constructionIntent?.constructionIntentDigest ?? null,
    openedEventRef: event.eventId,
  });
}

export interface AdmitFhInteractionHoldInput {
  readonly predecessorPrefix: DurablePrefixCoordinate;
  readonly store: AbgEventStore;
  readonly executionBasis: ExecutionBasis;
  readonly scope: OpenedTraversalScope;
  readonly program: Readonly<GtlProgram>;
  readonly graphFunction: Readonly<GraphFunction>;
  readonly graph: Readonly<GtlGraph>;
  readonly interactionSet: AdmittedInteractionSet;
  readonly cursor: TraversalCursorCandidate;
  readonly request: Readonly<Record<string, JsonValue>>;
  readonly expectedInputDigest: Sha256Digest;
  readonly pendingPlan: PendingInteractionAdmissionPlan;
  readonly routeCandidate: TraversalTransitionCandidate;
  /** @internal Synchronous pure HoG selection at the actual staged prefix. */
  readonly selectRouteCandidate?: (replay: ReplayState) => TraversalTransitionCandidate;
  readonly productBasis: ContinuationProductBasis;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
  readonly pendingBasis: RuntimeAdmissionBasis;
  readonly routeBasis: RuntimeAdmissionBasis;
  readonly continuationBasis: RuntimeAdmissionBasis;
}

/** @internal Same F_H owner, operational plan and staged guard without full output. */
export type OwnedAdmitFhInteractionHoldInput = Omit<AdmitFhInteractionHoldInput,"pendingPlan"|"selectRouteCandidate"> & {
  readonly pendingPlan: OwnedPendingInteractionAdmissionPlan | PendingInteractionAdmissionPlan;
  readonly selectRouteCandidate?: (replay: RuntimeReplayGuard) => TraversalTransitionCandidate;
};

export interface FhInteractionHoldAdmission {
  readonly kind: "fh_interaction_hold_admission";
  readonly schemaVersion: "5.0.0";
  readonly pending: PendingInteractionAdmission;
  readonly route: AdmittedRoute;
  readonly continuation: FhInteractionContinuation;
  readonly successorPrefix: DurablePrefixCoordinate;
}

/**
 * Owns the complete pending-result, hold-route, continuation-open transaction.
 * HoG supplies the selected route candidate; ABG revalidates every event owner
 * relation and commits the conjunction at one exact durable predecessor.
 */
/** @internal The existing owner transaction with selected private carriers. */
export function admitOwnedFhInteractionHold(
  input: Readonly<OwnedAdmitFhInteractionHoldInput>,
): FhInteractionHoldAdmission {
  assertHeldEventStoreAtDurablePrefix(input.store,input.predecessorPrefix);
  const predecessorPrefix = selectRuntimeEventPrefixFromStore(input.store);
  const cCall = input.pendingPlan.pending.cCall;
  const evidence = input.routeCandidate.transitionClass === "route"
    ? input.routeCandidate.evidence
    : null;
  if (
    input.pendingPlan.expectedPrefixDigest !==
      runtimeEventPrefixDigest(predecessorPrefix) ||
    evidence?.evidenceClass !== "hold" ||
    evidence.cCall.cCallRef !== cCall.cCallRef ||
    !canonicalEquals(
      evidence.result,
      input.pendingPlan.pending.result,
    ) ||
    !canonicalEquals(
      evidence.judgment,
      input.pendingPlan.pending.judgment,
    )
  ) {
    throw new TypeError(
      "F_H hold candidate differs from its exact pending interaction plan",
    );
  }
  assertHeldEventStoreAtDurablePrefix(input.store, input.predecessorPrefix);
  const committed = admitNonEmptyRuntimeEventTransactionAtDurablePrefix(
    input.store,
    input.predecessorPrefix,
    () => {
      const pending = admitOwnedPlannedPendingInteraction(
        input.store,
        input.graph,
        input.graphFunction,
        input.cursor,
        cCall,
        input.request,
        input.expectedInputDigest,
        input.pendingPlan,
        input.pendingBasis,
      );
      const stagedPrefix = selectRuntimeEventPrefixFromStore(input.store);
      const routeCandidate = input.selectRouteCandidate?.(
        projectRuntimeReplayGuard(selectRuntimeEventPrefixFromAuthority(stagedPrefix,{runId:input.cursor.runId}),stagedPrefix),
      ) ?? input.routeCandidate;
      if (routeCandidate.transitionClass !== "route" ||
          !canonicalEquals(
            routeCandidate.evidence,
            input.routeCandidate.evidence,
          )) {
        throw new TypeError("F_H staged selection changed its planned owner evidence");
      }
      const transition = admitTraversalTransitionInActiveTransaction({
        durablePredecessorPrefix: input.predecessorPrefix,
        stagedPrefix,
        store: input.store,
        executionBasis: input.executionBasis,
        graph: input.graph,
        graphFunction: input.graphFunction,
        source: input.cursor,
        target: null,
        candidate: routeCandidate,
        basis: input.routeBasis,
      });
      if (transition.kind !== "staged_route_transition_admission") {
        throw new TypeError(
          `F_H hold route refused: ${transition.code}`,
        );
      }
      const continuation = admitFhInteractionOpen(
        input.store,
        input.executionBasis,
        input.scope,
        input.program,
        input.graph,
        input.interactionSet,
        input.cursor,
        pending,
        transition.route,
        input.productBasis,
        input.inputValue,
        input.continuationBasis,
      );
      return deepFreeze({
        kind: "fh_interaction_hold_admission" as const,
        schemaVersion: "5.0.0" as const,
        pending,
        route: transition.route,
        continuation,
      });
    },
  );
  return deepFreeze({
    ...committed.value,
    successorPrefix: committed.successorPrefix,
  });
}

export function admitFhInteractionHold(input: Readonly<AdmitFhInteractionHoldInput>): FhInteractionHoldAdmission {
  const {selectRouteCandidate,...rest}=input;
  return admitOwnedFhInteractionHold({...rest,...(selectRouteCandidate === undefined ? {} : {
    selectRouteCandidate: (guard: RuntimeReplayGuard)=>selectRouteCandidate(materializeRuntimeReplayGuard(guard))})});
}
