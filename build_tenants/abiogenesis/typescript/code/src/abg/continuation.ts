import type {
  ClosureContract,
  GtlGraph,
  GtlProgram,
} from "../gtl/contracts.js";
import type { ProductInstall, WorkspaceBinding } from "../product/environment.js";
import type { CatalogView } from "../product/catalog.js";
import {
  isCapabilityGrantValue,
  type CapabilityGrant,
} from "../product/invocation.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type { GraphValidation } from "../validator/graph.js";
import type { ProgramValidation } from "../validator/validation.js";
import {
  isAdmittedCCallJudgment,
  isAdmittedCCallResult,
  rehydratePendingInteraction,
  type AdmittedCCallJudgment,
  type AdmittedCCallResult,
  type CCall,
  type PendingInteractionAdmission,
} from "./c_call.js";
import { hasAdmittedCatalogView } from "./catalog_admission.js";
import {
  admittedConstructionComposition,
  hasAdmittedExecutionBasis,
  hasAdmittedInteractionSet,
  isAdmittedConstructionInteractionLocus,
  rehydrateExecutionBasis,
  type AdmittedInteractionSet,
  type ExecutionBasis,
  type RuntimeAdmissionBasis,
} from "./execution_basis.js";
import {
  hasAdmittedProductInstall,
  hasAdmittedWorkspaceBinding,
  validatePublicOperationBasis,
  type PublicOperationAdmissionBasis,
} from "./environment_admission.js";
import {
  AbgEventStore,
  admitRuntimeEvent,
  type RuntimeEvent,
} from "./event_store.js";
import {
  constructRuntimeFluent,
  holdsAt,
  type RuntimeEventCalculusProjection,
} from "./event_calculus.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import {
  hasAdmittedInvocation,
  rehydrateInvocationAdmission,
  type InvocationAdmission,
} from "./invocation_admission.js";
import {
  hasOpenedTraversalScope,
  rehydrateOpenedTraversalScope,
  type OpenedTraversalScope,
} from "./open_call.js";
import {
  isAdmittedRoute,
  rehydrateConstructionIntentForCursor,
  type AdmittedRoute,
  type ConstructionIntentAdmission,
} from "./traversal_route.js";
import {
  hasAdmittedTraversalCursor,
  isTraversalCursorCandidate,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

export interface ContinuationProductBasis {
  readonly install: ProductInstall;
  readonly workspaceBinding: WorkspaceBinding;
  readonly catalogView: CatalogView;
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

export interface ContinuationPublicOperationAdmission {
  readonly kind: "continuation_public_operation_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly operationId:
    | "abg.operation.interaction.respond"
    | "abg.operation.run.continue";
  readonly continuationRef: string;
  readonly invocationRef: string;
  readonly actorRef: string;
  readonly capabilityRef: string;
  readonly capabilityGrantRef: string;
  readonly admissionEventRef: string;
}

export interface FhInteractionResponseAdmission {
  readonly kind: "fh_interaction_response_admission";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "responded";
  readonly continuationRef: string;
  readonly actorRef: string;
  readonly capabilityRef: string;
  readonly responseContractRef: string;
  readonly responseRef: string;
  readonly responseDigest: Sha256Digest;
  readonly responseValue: Readonly<Record<string, JsonValue>>;
  readonly admissionEventRef: string;
}

export interface FhInteractionResumeAdmission {
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
  readonly successorCursorRef: string;
  readonly successorCursorDigest: Sha256Digest;
  readonly admissionEventRef: string;
}

export interface FhResumeSuccessorInput {
  readonly kind: "fh_resume_successor_input";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "admitted";
  readonly inputRef: string;
  readonly inputDigest: Sha256Digest;
  readonly inputValue: Readonly<Record<string, JsonValue>>;
}

export interface ReplayContinuationState {
  readonly continuationRef: string;
  readonly continuationDigest: Sha256Digest;
  readonly continuationKind: "fh_interaction";
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
  readonly responseRef: string | null;
  readonly responseDigest: Sha256Digest | null;
  readonly responseValue: JsonValue | null;
  readonly successorInputRef: string | null;
  readonly successorInputDigest: Sha256Digest | null;
  readonly successorInputValue: JsonValue | null;
  readonly successorCursorRef: string | null;
  readonly successorCursorDigest: Sha256Digest | null;
  readonly openedEventRef: string;
  readonly respondedEventRef: string | null;
  readonly resumedEventRef: string | null;
  readonly status: "open" | "responded" | "resolved";
}

export interface FhContinuationRehydrationBasis {
  readonly install: ProductInstall;
  readonly workspaceBinding: WorkspaceBinding;
  readonly catalogView: CatalogView;
  readonly program: Readonly<GtlProgram>;
  readonly graph: Readonly<GtlGraph>;
  readonly closureContract: Readonly<ClosureContract>;
}

export interface RehydratedFhContinuationScope {
  readonly continuation: ReplayContinuationState;
  readonly rootInvocation: InvocationAdmission;
  readonly executionBasis: ExecutionBasis;
  readonly openedTraversalScope: OpenedTraversalScope;
  readonly heldInteraction: {
    readonly cCall: CCall;
    readonly result: AdmittedCCallResult;
    readonly judgment: AdmittedCCallJudgment;
    readonly cursor: TraversalCursorCandidate;
  };
}

function executionBasisDescendsFromRootInvocation(
  store: AbgEventStore,
  leafBasis: ExecutionBasis,
  rootInvocation: InvocationAdmission,
): boolean {
  const seen = new Set<string>();
  let current: ExecutionBasis | null = leafBasis;
  while (current !== null) {
    if (
      seen.has(current.basisRef) ||
      current.invocationAdmissionRef !==
        rootInvocation.invocationAdmissionRef ||
      current.invocationRef !== rootInvocation.invocationRef ||
      current.programRef !== rootInvocation.programRef
    ) {
      return false;
    }
    seen.add(current.basisRef);
    if (current.parentExecutionBasisRef === null) {
      return current.basisClass === "root" &&
        current.parentTraversalScopeRef === null &&
        current.graphFunctionRef === rootInvocation.graphFunctionRef;
    }
    if (
      current.basisClass !== "child" ||
      current.parentTraversalScopeRef === null
    ) {
      return false;
    }
    current = rehydrateExecutionBasis(
      store,
      current.parentExecutionBasisRef,
    );
  }
  return false;
}

function isRecord(
  value: unknown,
): value is Readonly<Record<string, JsonValue>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(event: RuntimeEvent, key: string): string | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function digestField(event: RuntimeEvent, key: string): Sha256Digest | null {
  const value = stringField(event, key);
  return value?.startsWith("sha256:") ? value as Sha256Digest : null;
}

function resolveCurrentContinuationOperationCoordinate(
  store: AbgEventStore,
  continuationRef: string,
  operation: ContinuationPublicOperationAdmission,
  predecessor: Readonly<{
    readonly eventRef: string | null;
    readonly kind: "fh_interaction_opened" | "fh_interaction_responded";
  }>,
): Readonly<{
  readonly event: RuntimeEvent;
  readonly payload: Readonly<Record<string, JsonValue>>;
}> | null {
  if (predecessor.eventRef === null) return null;
  const prefix = selectValidatedRuntimeEventPrefix(store.readAll());
  const applicable = runtimeEventsFromValidatedPrefix(prefix).filter(
    (event) =>
      (
        event.aggregateType === "continuation" &&
        event.aggregateId === continuationRef
      ) ||
      (
        event.kind === "public_operation_admitted" &&
        isRecord(event.payload) &&
        event.payload.continuationRef === continuationRef &&
        event.payload.operationId === operation.operationId
      ),
  );
  const operationEvent = applicable.at(-1);
  const predecessorEvent = [...applicable].reverse().find(
    (event) => event.aggregateType === "continuation",
  );
  const operationPayload =
    operationEvent !== undefined && isRecord(operationEvent.payload)
      ? operationEvent.payload
      : null;
  if (
    operationEvent?.eventId !== operation.admissionEventRef ||
    operationEvent.kind !== "public_operation_admitted" ||
    operationEvent.parentAggregateId !== operation.invocationRef ||
    operationPayload === null ||
    operationPayload.operationId !== operation.operationId ||
    operationPayload.continuationRef !== continuationRef ||
    operationPayload.invocationRef !== operation.invocationRef ||
    predecessorEvent?.eventId !== predecessor.eventRef ||
    predecessorEvent.kind !== predecessor.kind ||
    predecessorEvent.aggregateType !== "continuation" ||
    predecessorEvent.aggregateId !== continuationRef ||
    predecessorEvent.admissionOrdinal >= operationEvent.admissionOrdinal
  ) {
    return null;
  }
  return { event: operationEvent, payload: operationPayload };
}

export function projectFhContinuations(
  prefix: ValidatedRuntimeEventPrefix,
  eventCalculus: RuntimeEventCalculusProjection,
): readonly ReplayContinuationState[] {
  const events = runtimeEventsFromValidatedPrefix(prefix).filter(
    (event) => event.aggregateType === "continuation",
  );
  const refs = [...new Set(events.map((event) => event.aggregateId))];
  return refs.map((continuationRef) => {
    const rows = events.filter((event) => event.aggregateId === continuationRef);
    const opened = rows.find((event) => event.kind === "fh_interaction_opened");
    const responded = rows.find(
      (event) => event.kind === "fh_interaction_responded",
    );
    const resumed = rows.find(
      (event) => event.kind === "fh_interaction_resume_admitted",
    );
    if (
      opened === undefined ||
      rows.filter((event) => event.kind === "fh_interaction_opened").length !== 1 ||
      rows.filter((event) => event.kind === "fh_interaction_responded").length > 1 ||
      rows.filter(
        (event) => event.kind === "fh_interaction_resume_admitted",
      ).length > 1 ||
      (resumed !== undefined && responded === undefined) ||
      (responded !== undefined &&
        responded.admissionOrdinal <= opened.admissionOrdinal) ||
      (resumed !== undefined &&
        resumed.admissionOrdinal <= (responded?.admissionOrdinal ?? 0))
    ) {
      throw new TypeError(
        `continuation ${continuationRef} has an invalid event lifecycle`,
      );
    }
    const continuationDigest = digestField(opened, "continuationDigest");
    const cCallRef = stringField(opened, "cCallRef");
    const actorCapabilityRef = stringField(opened, "actorCapabilityRef");
    const requestContractRef = stringField(opened, "requestContractRef");
    const responseContractRef = stringField(opened, "responseContractRef");
    const requestRef = stringField(opened, "requestRef");
    const requestDigest = digestField(opened, "requestDigest");
    const heldCursorRef = stringField(opened, "heldCursorRef");
    const heldCursorDigest = digestField(opened, "heldCursorDigest");
    if (
      continuationDigest === null ||
      opened.runId === undefined ||
      opened.graphCallId === undefined ||
      opened.frameId === undefined ||
      cCallRef === null ||
      actorCapabilityRef === null ||
      requestContractRef === null ||
      responseContractRef === null ||
      requestRef === null ||
      requestDigest === null ||
      heldCursorRef === null ||
      heldCursorDigest === null
    ) {
      throw new TypeError(
        `continuation ${continuationRef} has incomplete opening truth`,
      );
    }
    const responseValue = responded !== undefined && isRecord(responded.payload)
      ? responded.payload.responseValue ?? null
      : null;
    const successorInputValue =
      resumed !== undefined && isRecord(resumed.payload)
        ? resumed.payload.successorInputValue ?? null
        : null;
    const open = holdsAt(
      eventCalculus,
      constructRuntimeFluent({
        name: "continuation_open",
        identity: continuationRef,
      }),
    );
    const responseAvailable = holdsAt(
      eventCalculus,
      constructRuntimeFluent({
        name: "continuation_response_available",
        identity: continuationRef,
      }),
    );
    const terminated = holdsAt(
      eventCalculus,
      constructRuntimeFluent({
        name: "continuation_terminated",
        identity: continuationRef,
      }),
    );
    if (
      (terminated && (open || responseAvailable || resumed === undefined)) ||
      (
        !terminated && responded !== undefined &&
        (!open || !responseAvailable || resumed !== undefined)
      ) ||
      (!terminated && responded === undefined && (!open || responseAvailable))
    ) {
      throw new TypeError(
        `continuation ${continuationRef} differs from Event Calculus lifecycle truth`,
      );
    }
    return deepFreeze({
      continuationRef,
      continuationDigest,
      continuationKind: "fh_interaction" as const,
      runId: opened.runId,
      graphCallId: opened.graphCallId,
      frameId: opened.frameId,
      cCallRef,
      actorCapabilityRef,
      requestContractRef,
      responseContractRef,
      requestRef,
      requestDigest,
      heldCursorRef,
      heldCursorDigest,
      constructionIntentRef: stringField(opened, "constructionIntentRef"),
      constructionIntentDigest: digestField(
        opened,
        "constructionIntentDigest",
      ),
      responseRef: responded === undefined
        ? null
        : stringField(responded, "responseRef"),
      responseDigest: responded === undefined
        ? null
        : digestField(responded, "responseDigest"),
      responseValue,
      successorInputRef: resumed === undefined
        ? null
        : stringField(resumed, "successorInputRef"),
      successorInputDigest: resumed === undefined
        ? null
        : digestField(resumed, "successorInputDigest"),
      successorInputValue,
      successorCursorRef: resumed === undefined
        ? null
        : stringField(resumed, "successorCursorRef"),
      successorCursorDigest: resumed === undefined
        ? null
        : digestField(resumed, "successorCursorDigest"),
      openedEventRef: opened.eventId,
      respondedEventRef: responded?.eventId ?? null,
      resumedEventRef: resumed?.eventId ?? null,
      status: terminated
        ? "resolved" as const
        : responseAvailable
          ? "responded" as const
          : "open" as const,
    });
  });
}

export function projectFhInteractionSemanticBasis(
  store: AbgEventStore,
  continuation: ReplayContinuationState,
): Readonly<{
  readonly requestContractRef: string;
  readonly responseContractRef: string;
  readonly requestValue: Readonly<Record<string, JsonValue>>;
  readonly constructionIntent: Readonly<Record<string, JsonValue>> | null;
  readonly nextActionBasis: Readonly<Record<string, JsonValue>> | null;
}> | null {
  const continuationRef = continuation.continuationRef;
  const opened = store.readAll().find(
    (event) => event.eventId === continuation.openedEventRef,
  );
  if (
    continuation.status !== "open" ||
    opened?.kind !== "fh_interaction_opened" ||
    opened.aggregateType !== "continuation" ||
    opened.aggregateId !== continuationRef
  ) {
    return null;
  }
  if (!isRecord(opened.payload) || !isRecord(opened.payload.inputValue)) {
    return null;
  }
  const requestValue = opened.payload.inputValue;
  if (
    sha256Canonical(requestValue) !== continuation.requestDigest
  ) {
    return null;
  }
  if (continuation.constructionIntentRef === null) {
    return deepFreeze({
      requestContractRef: continuation.requestContractRef,
      responseContractRef: continuation.responseContractRef,
      requestValue,
      constructionIntent: null,
      nextActionBasis: null,
    });
  }
  const intentRows = store.readAll().filter(
    (event) =>
      event.kind === "construction_intent_selected" &&
      event.runId === continuation.runId &&
      event.graphCallId === continuation.graphCallId &&
      event.frameId === continuation.frameId &&
      event.admissionOrdinal < opened.admissionOrdinal &&
      isRecord(event.payload) &&
      event.payload.constructionIntentRef ===
        continuation.constructionIntentRef,
  );
  if (intentRows.length !== 1) {
    return null;
  }
  const intentEvent = intentRows[0]!;
  const intentPayload = intentEvent.payload;
  if (!isRecord(intentPayload)) return null;
  const constructionIntent = intentPayload.constructionIntent;
  const nextActionBasis = intentPayload.nextActionBasis;
  if (!isRecord(constructionIntent) || !isRecord(nextActionBasis)) {
    return null;
  }
  const {
    constructionIntentRef,
    constructionIntentDigest,
    ...intentBody
  } = constructionIntent;
  const {
    basisRef,
    basisDigest,
    ...basisBody
  } = nextActionBasis;
  const {
    projectionRef,
    projectionDigest,
    ...projectionBody
  } = requestValue;
  if (
    typeof constructionIntentRef !== "string" ||
    typeof constructionIntentDigest !== "string" ||
    typeof basisRef !== "string" ||
    typeof basisDigest !== "string" ||
    typeof projectionRef !== "string" ||
    typeof projectionDigest !== "string" ||
    sha256Canonical(intentBody) !== constructionIntentDigest ||
    sha256Canonical(basisBody) !== basisDigest ||
    sha256Canonical(projectionBody) !== projectionDigest ||
    constructionIntentRef !== continuation.constructionIntentRef ||
    constructionIntentDigest !== continuation.constructionIntentDigest ||
    constructionIntent.nextActionProjectionRef !== projectionRef ||
    constructionIntent.nextActionProjectionDigest !==
      projectionDigest ||
    constructionIntent.nextActionBasisRef !== basisRef ||
    constructionIntent.nextActionBasisDigest !== basisDigest ||
    constructionIntent.targetCursorRef !== continuation.heldCursorRef ||
    requestValue.nextActionBasisRef !== basisRef ||
    requestValue.nextActionBasisDigest !== basisDigest ||
    intentPayload.nextActionBasisRef !== basisRef ||
    intentPayload.nextActionBasisDigest !== basisDigest
  ) {
    return null;
  }
  return deepFreeze({
    requestContractRef: continuation.requestContractRef,
    responseContractRef: continuation.responseContractRef,
    requestValue,
    constructionIntent,
    nextActionBasis,
  });
}

export function rehydrateFhContinuation(
  store: AbgEventStore,
  continuation: ReplayContinuationState,
  expected: FhContinuationRehydrationBasis,
  operation: ContinuationPublicOperationAdmission,
): RehydratedFhContinuationScope | null {
  const continuationRef = continuation.continuationRef;
  const operationCoordinate = resolveCurrentContinuationOperationCoordinate(
    store,
    continuationRef,
    operation,
    {
      eventRef: continuation.respondedEventRef,
      kind: "fh_interaction_responded",
    },
  );
  const opened = store.readAll().find(
    (event) => event.eventId === continuation.openedEventRef,
  );
  if (
    continuation.status !== "responded" ||
    opened?.kind !== "fh_interaction_opened" ||
    opened.aggregateType !== "continuation" ||
    opened.aggregateId !== continuationRef
  ) {
    return null;
  }
  if (!isRecord(opened.payload)) return null;
  const executionBasisRef = stringField(opened, "executionBasisRef");
  if (executionBasisRef === null) return null;
  const executionBasis = rehydrateExecutionBasis(store, executionBasisRef);
  if (executionBasis === null) return null;
  const rootInvocation = rehydrateInvocationAdmission(
    store,
    executionBasis.invocationAdmissionRef,
  );
  const scopeValue = opened.payload.openedTraversalScope;
  const cursorValue = opened.payload.heldCursor;
  const cCallValue = opened.payload.cCall;
  const resultValue = opened.payload.pendingResult;
  const judgmentValue = opened.payload.pendingJudgment;
  if (
    rootInvocation === null ||
    !isRecord(scopeValue) ||
    !isRecord(cursorValue) ||
    !isRecord(cCallValue) ||
    !isRecord(resultValue) ||
    !isRecord(judgmentValue)
  ) {
    return null;
  }
  const openedTraversalScope = rehydrateOpenedTraversalScope(store, scopeValue);
  const cursor = deepFreeze(cursorValue) as unknown as TraversalCursorCandidate;
  const pending = rehydratePendingInteraction(
    store,
    cCallValue,
    resultValue,
    judgmentValue,
  );
  if (pending === null) return null;
  const constructionIntent = isTraversalCursorCandidate(cursor)
    ? rehydrateConstructionIntentForCursor(store, cursor)
    : null;
  const requiresConstructionIntent =
    isAdmittedConstructionInteractionLocus(
      executionBasis,
      pending.cCall.programLocusRef,
      pending.cCall.compositionRef,
    );
  const closureContractDigest = sha256Canonical(
    expected.closureContract as unknown as JsonValue,
  );
  const operationEvent = operationCoordinate?.event;
  const operationPayload = operationCoordinate?.payload ?? null;
  const operationCapabilityRefs =
    operationPayload !== null &&
      Array.isArray(operationPayload.capabilityGrantRefs)
      ? operationPayload.capabilityGrantRefs
      : null;
  if (
    openedTraversalScope === null ||
    !isTraversalCursorCandidate(cursor) ||
    !hasAdmittedTraversalCursor(store, cursor) ||
    stringField(opened, "continuationRef") !== continuationRef ||
    digestField(opened, "continuationDigest") !==
      continuation.continuationDigest ||
    stringField(opened, "productId") !== expected.install.productId ||
    digestField(opened, "productContentDigest") !==
      expected.install.productContentDigest ||
    digestField(opened, "manifestDigest") !== expected.install.manifestDigest ||
    stringField(opened, "installId") !== expected.install.installId ||
    stringField(opened, "workspaceBindingId") !==
      expected.workspaceBinding.bindingId ||
    digestField(opened, "workspaceBindingDigest") !==
      expected.workspaceBinding.bindingDigest ||
    stringField(opened, "catalogViewId") !== expected.catalogView.viewId ||
    digestField(opened, "catalogViewDigest") !== expected.catalogView.viewDigest ||
    stringField(opened, "programRef") !== expected.program.programRef ||
    digestField(opened, "programDigest") !==
      sha256Canonical(expected.program as unknown as JsonValue) ||
    stringField(opened, "graphRef") !== expected.graph.materializationRef ||
    digestField(opened, "graphDigest") !== expected.graph.materializationDigest ||
    stringField(opened, "graphFunctionRef") !==
      expected.graph.graphFunctionRef ||
    stringField(opened, "programValidationRef") !==
      executionBasis.programValidationRef ||
    stringField(opened, "graphValidationRef") !==
      executionBasis.graphValidationRef ||
    stringField(opened, "implementationSetRef") !==
      executionBasis.implementationSetRef ||
    digestField(opened, "implementationSetDigest") !==
      executionBasis.implementationSetDigest ||
    stringField(opened, "interactionSetRef") !==
      executionBasis.interactionSetRef ||
    digestField(opened, "interactionSetDigest") !==
      executionBasis.interactionSetDigest ||
    digestField(opened, "executionBasisDigest") !== executionBasis.basisDigest ||
    executionBasis.workspaceBindingId !== expected.workspaceBinding.bindingId ||
    executionBasis.workspaceBindingDigest !==
      expected.workspaceBinding.bindingDigest ||
    executionBasis.catalogViewId !== expected.catalogView.viewId ||
    executionBasis.catalogViewDigest !== expected.catalogView.viewDigest ||
    executionBasis.programRef !== expected.program.programRef ||
    executionBasis.programDigest !==
      sha256Canonical(expected.program as unknown as JsonValue) ||
    executionBasis.graphRef !== expected.graph.materializationRef ||
    executionBasis.graphDigest !== expected.graph.materializationDigest ||
    executionBasis.closureContractRef !==
      expected.closureContract.closureContractRef ||
    executionBasis.closureContractDigest !== closureContractDigest ||
    rootInvocation.workspaceBindingId !== expected.workspaceBinding.bindingId ||
    rootInvocation.catalogViewId !== expected.catalogView.viewId ||
    rootInvocation.programRef !== expected.program.programRef ||
    !executionBasisDescendsFromRootInvocation(
      store,
      executionBasis,
      rootInvocation,
    ) ||
    openedTraversalScope.executionBasisRef !== executionBasis.basisRef ||
    openedTraversalScope.scopeRef !== stringField(opened, "scopeRef") ||
    openedTraversalScope.scopeDigest !== digestField(opened, "scopeDigest") ||
    openedTraversalScope.runId !== continuation.runId ||
    openedTraversalScope.graphCallId !== continuation.graphCallId ||
    openedTraversalScope.frameId !== continuation.frameId ||
    pending.cCall.cCallRef !== continuation.cCallRef ||
    pending.cCall.basisId !== executionBasis.basisRef ||
    pending.cCall.runId !== continuation.runId ||
    pending.cCall.graphCallId !== continuation.graphCallId ||
    pending.cCall.frameId !== continuation.frameId ||
    pending.cCall.responseContractRef !== continuation.responseContractRef ||
    (
      requiresConstructionIntent &&
      (
        constructionIntent === null ||
        continuation.constructionIntentRef !==
          constructionIntent.constructionIntentRef ||
        continuation.constructionIntentDigest !==
          constructionIntent.constructionIntentDigest
      )
    ) ||
    pending.requestRef !== continuation.requestRef ||
    pending.requestDigest !== continuation.requestDigest ||
    cursor.cursorRef !== continuation.heldCursorRef ||
    cursor.cursorDigest !== continuation.heldCursorDigest ||
    cursor.executionBasisRef !== executionBasis.basisRef ||
    cursor.traversalScopeRef !== openedTraversalScope.scopeRef ||
    cursor.runId !== continuation.runId ||
    cursor.graphCallId !== continuation.graphCallId ||
    cursor.frameId !== continuation.frameId ||
    operation.operationId !== "abg.operation.run.continue" ||
    operation.continuationRef !== continuationRef ||
    operation.capabilityRef !== continuation.actorCapabilityRef ||
    operationPayload?.capabilityRef !== operation.capabilityRef ||
    operationEvent?.kind !== "public_operation_admitted" ||
    operationPayload === null ||
    operationPayload.continuationRef !== continuationRef ||
    operationPayload.actorRef !== operation.actorRef ||
    operationCapabilityRefs?.[0] !== operation.capabilityGrantRef
  ) {
    return null;
  }
  const inputValue = opened.payload.inputValue;
  if (
    !isRecord(inputValue) ||
    sha256Canonical(inputValue) !== cursor.inputDigest ||
    stringField(opened, "inputRef") !== cursor.inputRef ||
    digestField(opened, "inputDigest") !== cursor.inputDigest
  ) {
    return null;
  }
  return deepFreeze({
    continuation,
    rootInvocation,
    executionBasis,
    openedTraversalScope,
    heldInteraction: {
      cCall: pending.cCall,
      result: pending.result,
      judgment: pending.judgment,
      cursor,
    },
  });
}

export function admitContinuationPublicOperation(
  store: AbgEventStore,
  rootInvocation: InvocationAdmission,
  operation:
    | "abg.operation.interaction.respond"
    | "abg.operation.run.continue",
  continuation: ReplayContinuationState,
  variant: string,
  actorRef: string,
  capabilityRef: string,
  basis: PublicOperationAdmissionBasis,
): ContinuationPublicOperationAdmission {
  const continuationRef = continuation.continuationRef;
  const duplicateInvocation = store.readAll().some(
    (event) =>
      event.kind === "public_operation_admitted" &&
      isRecord(event.payload) &&
      event.payload.invocationRef === basis.invocationRef,
  );
  const grant = resolveContinuationPublicOperationGrant({
    rootInvocation,
    continuation,
    operation,
    variant,
    actorRef,
    capabilityRef,
    basis,
    duplicateInvocation,
  });
  if (
    grant === null ||
    !hasAdmittedInvocation(store, rootInvocation)
  ) {
    throw new TypeError(
      "continuation public operation requires the exact admitted run authority",
    );
  }
  const event = admitRuntimeEvent(store, {
    kind: "public_operation_admitted",
    eventTime: basis.eventTime,
    aggregateType: "workspace",
    aggregateId: rootInvocation.workspaceBindingId,
    parentAggregateId: basis.invocationRef,
    causationEventRefs: basis.causationEventRefs,
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "workspace",
    basisId: rootInvocation.authorityRef,
    payload: {
      operationId: operation,
      continuationRef,
      definitionKey: basis.definitionKey,
      definitionDigest: basis.definitionDigest,
      variant,
      invocationRef: basis.invocationRef,
      invocationDigest: basis.invocationDigest,
      actorRef,
      authorityRef: rootInvocation.authorityRef,
      authorityDigest: rootInvocation.authorityDigest,
      capabilityGrantRefs: [grant.grantRef],
      capabilityRef,
      policyRef: rootInvocation.policyRef,
      policyDigest: rootInvocation.policyDigest,
      workspaceBindingId: rootInvocation.workspaceBindingId,
      catalogViewId: rootInvocation.catalogViewId,
      programRef: rootInvocation.programRef,
      graphFunctionRef: rootInvocation.graphFunctionRef,
    },
  });
  return deepFreeze({
    kind: "continuation_public_operation_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    operationId: operation,
    continuationRef,
    invocationRef: basis.invocationRef,
    actorRef,
    capabilityRef,
    capabilityGrantRef: grant.grantRef,
    admissionEventRef: event.eventId,
  });
}

export function resolveContinuationPublicOperationGrant(input: Readonly<{
  rootInvocation: Pick<
    InvocationAdmission,
    | "actorRef"
    | "capabilityGrants"
    | "capabilityGrantRefs"
    | "workspaceBindingDigest"
    | "workspaceBindingId"
  >;
  continuation: Pick<ReplayContinuationState, "continuationRef" | "status">;
  operation:
    | "abg.operation.interaction.respond"
    | "abg.operation.run.continue";
  variant: string;
  actorRef: string;
  capabilityRef: string;
  basis: PublicOperationAdmissionBasis;
  duplicateInvocation: boolean;
}>): CapabilityGrant | null {
  const invalidBasis = validatePublicOperationBasis(
    input.basis,
    input.operation,
  );
  const requiredStatus =
    input.operation === "abg.operation.interaction.respond"
      ? "open"
      : "responded";
  const grant = input.rootInvocation.capabilityGrants.find(
    (candidate) =>
      isCapabilityGrantValue(candidate) &&
      candidate.grantRef !== "" &&
      candidate.actorRef === input.actorRef &&
      candidate.operationId === input.operation &&
      candidate.capabilityRef === input.capabilityRef,
  );
  if (
    invalidBasis !== null ||
    input.continuation.continuationRef.length === 0 ||
    input.continuation.status !== requiredStatus ||
    input.basis.authorityScopeRef !==
      input.rootInvocation.workspaceBindingId ||
    input.basis.authorityScopeDigest !==
      input.rootInvocation.workspaceBindingDigest ||
    input.actorRef !== input.rootInvocation.actorRef ||
    grant === undefined ||
    !input.rootInvocation.capabilityGrantRefs.includes(grant.grantRef) ||
    input.duplicateInvocation ||
    input.variant.length === 0
  ) {
    return null;
  }
  return grant;
}

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
  const cCall = pending.cCall;
  const constructionIntent: ConstructionIntentAdmission | null =
    rehydrateConstructionIntentForCursor(store, cursor);
  const requiresConstructionIntent =
    isAdmittedConstructionInteractionLocus(
      executionBasis,
      cCall.programLocusRef,
      cCall.compositionRef,
    );
  if (
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    !hasOpenedTraversalScope(store, scope) ||
    !hasAdmittedInteractionSet(store, interactionSet) ||
    !hasAdmittedTraversalCursor(store, cursor) ||
    !isAdmittedCCallResult(pending.result) ||
    !isAdmittedCCallJudgment(pending.judgment) ||
    !isAdmittedRoute(route) ||
    !hasAdmittedProductInstall(store, productBasis.install) ||
    !hasAdmittedWorkspaceBinding(store, productBasis.workspaceBinding) ||
    !hasAdmittedCatalogView(store, productBasis.catalogView) ||
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
    sha256Canonical(inputValue as unknown as JsonValue) !== cursor.inputDigest ||
    productBasis.workspaceBinding.bindingId !== executionBasis.workspaceBindingId ||
    productBasis.workspaceBinding.bindingDigest !==
      executionBasis.workspaceBindingDigest ||
    productBasis.catalogView.viewId !== executionBasis.catalogViewId ||
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
  const continuationDigest = sha256Canonical(identity as unknown as JsonValue);
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
      openedTraversalScope: scope as unknown as JsonValue,
      heldCursor: cursor as unknown as JsonValue,
      cCall: cCall as unknown as JsonValue,
      pendingResult: pending.result as unknown as JsonValue,
      pendingJudgment: pending.judgment as unknown as JsonValue,
      productId: productBasis.install.productId,
      productContentDigest: productBasis.install.productContentDigest,
      manifestDigest: productBasis.install.manifestDigest,
      installId: productBasis.install.installId,
      workspaceBindingId: productBasis.workspaceBinding.bindingId,
      workspaceBindingDigest: productBasis.workspaceBinding.bindingDigest,
      catalogViewId: productBasis.catalogView.viewId,
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

export function admitFhInteractionResponse(
  store: AbgEventStore,
  continuation: ReplayContinuationState,
  operation: ContinuationPublicOperationAdmission,
  responseContractRef: string,
  responseValue: Readonly<Record<string, JsonValue>>,
  basis: RuntimeAdmissionBasis,
): FhInteractionResponseAdmission {
  const continuationRef = continuation.continuationRef;
  const operationCoordinate = resolveCurrentContinuationOperationCoordinate(
    store,
    continuationRef,
    operation,
    {
      eventRef: continuation.openedEventRef,
      kind: "fh_interaction_opened",
    },
  );
  const publicEvent = operationCoordinate?.event;
  const publicPayload = operationCoordinate?.payload ?? null;
  if (
    continuation.status !== "open" ||
    operation.operationId !== "abg.operation.interaction.respond" ||
    operation.capabilityRef !== continuation.actorCapabilityRef ||
    responseContractRef !== continuation.responseContractRef ||
    (
      continuation.constructionIntentRef !== null &&
      responseValue.constructionIntentRef !==
        continuation.constructionIntentRef
    ) ||
    publicEvent?.kind !== "public_operation_admitted" ||
    publicPayload?.capabilityRef !== operation.capabilityRef ||
    !Array.isArray(publicPayload.capabilityGrantRefs) ||
    publicPayload.capabilityGrantRefs[0] !== operation.capabilityGrantRef
  ) {
    throw new TypeError(
      "F_H response requires one exact open continuation and admitted response operation",
    );
  }
  const responseDigest = sha256Canonical(responseValue as unknown as JsonValue);
  const responseRef =
    `interaction-response://abiogenesis/${responseDigest.slice("sha256:".length)}`;
  const event = admitRuntimeEvent(store, {
    kind: "fh_interaction_responded",
    eventTime: basis.eventTime,
    aggregateType: "continuation",
    aggregateId: continuationRef,
    parentAggregateId: continuation.frameId,
    causationEventRefs: [
      continuation.openedEventRef,
      operation.admissionEventRef,
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: continuation.continuationRef,
    runId: continuation.runId,
    graphCallId: continuation.graphCallId,
    frameId: continuation.frameId,
    payload: {
      continuationRef,
      actorRef: operation.actorRef,
      capabilityRef: operation.capabilityRef,
      responseContractRef,
      responseRef,
      responseDigest,
      responseValue,
      publicOperationEventRef: operation.admissionEventRef,
    },
  });
  return deepFreeze({
    kind: "fh_interaction_response_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "responded" as const,
    continuationRef,
    actorRef: operation.actorRef,
    capabilityRef: operation.capabilityRef,
    responseContractRef,
    responseRef,
    responseDigest,
    responseValue,
    admissionEventRef: event.eventId,
  });
}

export function deriveFhResumeSuccessorInput(
  store: AbgEventStore,
  continuation: ReplayContinuationState,
  operation: ContinuationPublicOperationAdmission,
  executionBasis: ExecutionBasis,
  closureContract: Readonly<ClosureContract>,
): FhResumeSuccessorInput {
  const continuationRef = continuation.continuationRef;
  if (
    continuation.status !== "responded" ||
    continuation.responseRef === null ||
    continuation.responseDigest === null ||
    !isRecord(continuation.responseValue)
  ) {
    throw new TypeError(
      "F_H successor input requires one exact responded continuation",
    );
  }
  if (continuation.constructionIntentRef === null) {
    return deepFreeze({
      kind: "fh_resume_successor_input" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      inputRef: continuation.responseRef,
      inputDigest: continuation.responseDigest,
      inputValue: continuation.responseValue,
    });
  }
  const opened = store.readAll().find(
    (event) => event.eventId === continuation.openedEventRef,
  );
  const heldCursor =
    opened !== undefined && isRecord(opened.payload) &&
      isRecord(opened.payload.heldCursor)
      ? opened.payload.heldCursor
      : null;
  if (
    heldCursor === null ||
    !isTraversalCursorCandidate(
      heldCursor as unknown as TraversalCursorCandidate,
    ) ||
    !hasAdmittedExecutionBasis(store, executionBasis) ||
    executionBasis.basisRef !== opened?.basisId ||
    closureContract.closureContractRef !==
      executionBasis.closureContractRef ||
    sha256Canonical(closureContract as unknown as JsonValue) !==
      executionBasis.closureContractDigest
  ) {
    throw new TypeError(
      "construction successor input requires its exact admitted execution basis",
    );
  }
  const heldCursorCandidate =
    heldCursor as unknown as TraversalCursorCandidate;
  const intent = rehydrateConstructionIntentForCursor(
    store,
    heldCursorCandidate,
  );
  if (
    intent === null ||
    intent.constructionIntentRef !== continuation.constructionIntentRef ||
    intent.constructionIntentDigest !==
      continuation.constructionIntentDigest ||
    intent.executionBasisRef !== executionBasis.basisRef
  ) {
    throw new TypeError(
      "construction successor input requires its exact admitted intent",
    );
  }
  const intentEvent = store.readAll().find(
    (event) => event.eventId === intent.admissionEventRef,
  );
  const nextActionBasis =
    intentEvent !== undefined && isRecord(intentEvent.payload) &&
      isRecord(intentEvent.payload.nextActionBasis)
      ? intentEvent.payload.nextActionBasis
      : null;
  const composition = admittedConstructionComposition(executionBasis);
  const declaredPolicy =
    nextActionBasis !== null && isRecord(nextActionBasis.declaredPolicy)
      ? nextActionBasis.declaredPolicy
      : null;
  const semanticEvidenceAssetRefs =
    Array.isArray(
      continuation.responseValue.semanticEvidenceAssetRefs,
    ) &&
      continuation.responseValue.semanticEvidenceAssetRefs.every(
        (value) => typeof value === "string" && value.length > 0,
      )
      ? continuation.responseValue.semanticEvidenceAssetRefs as readonly string[]
      : null;
  if (
    nextActionBasis === null ||
    nextActionBasis.kind !== "next_action_basis" ||
    nextActionBasis.basisRef !== intent.nextActionBasisRef ||
    nextActionBasis.basisDigest !== intent.nextActionBasisDigest ||
    composition === null ||
    composition.compositionRef !== intent.constructionCompositionRef ||
    composition.compositionDigest !==
      intent.constructionCompositionDigest ||
    declaredPolicy === null ||
    sha256Canonical(declaredPolicy) !==
      sha256Canonical(
        composition.closurePolicy as unknown as JsonValue,
      ) ||
    semanticEvidenceAssetRefs === null ||
    semanticEvidenceAssetRefs.join("\0") !==
      intent.outputAssetRefs.join("\0")
  ) {
    throw new TypeError(
      "construction successor input requires its exact admitted basis, Product policy, and observed evidence",
    );
  }
  const body = {
    kind: "action_evaluation_basis" as const,
    schemaVersion: "5.0.0" as const,
    constructionIntent: intent as unknown as JsonValue,
    nextActionBasis,
    admittedEvidence: [{
      kind: "admitted_semantic_evidence" as const,
      schemaVersion: "5.0.0" as const,
      responseContractRef: continuation.responseContractRef,
      responseRef: continuation.responseRef,
      responseDigest: continuation.responseDigest,
      responseValue: continuation.responseValue,
      semanticEvidenceAssetRefs,
      admissionEventRef: continuation.respondedEventRef!,
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
    closurePolicy: composition.closurePolicy,
    runtimeEvidenceEventRefs: [
      intent.admissionEventRef,
      continuation.openedEventRef,
      continuation.respondedEventRef!,
      operation.admissionEventRef,
    ],
  };
  const basisDigest = sha256Canonical(body as unknown as JsonValue);
  const inputValue = deepFreeze({
    ...body,
    basisRef:
      `action-evaluation-basis://abiogenesis/${basisDigest.slice("sha256:".length)}`,
    basisDigest,
  });
  const inputDigest = sha256Canonical(inputValue as unknown as JsonValue);
  return deepFreeze({
    kind: "fh_resume_successor_input" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "admitted" as const,
    inputRef: inputValue.basisRef,
    inputDigest,
    inputValue:
      inputValue as unknown as Readonly<Record<string, JsonValue>>,
  });
}

export function admitFhInteractionResume(
  store: AbgEventStore,
  continuation: ReplayContinuationState,
  operation: ContinuationPublicOperationAdmission,
  executionBasis: ExecutionBasis,
  closureContract: Readonly<ClosureContract>,
  successorInput: FhResumeSuccessorInput,
  successorCursor: TraversalCursorCandidate,
  durablePrefixDigest: Sha256Digest,
  basis: RuntimeAdmissionBasis,
): FhInteractionResumeAdmission {
  const continuationRef = continuation.continuationRef;
  const operationCoordinate = resolveCurrentContinuationOperationCoordinate(
    store,
    continuationRef,
    operation,
    {
      eventRef: continuation.respondedEventRef,
      kind: "fh_interaction_responded",
    },
  );
  const publicEvent = operationCoordinate?.event;
  const publicPayload = operationCoordinate?.payload ?? null;
  const expectedSuccessorInput = deriveFhResumeSuccessorInput(
    store,
    continuation,
    operation,
    executionBasis,
    closureContract,
  );
  if (
    continuation.status !== "responded" ||
    continuation.responseRef === null ||
    continuation.responseDigest === null ||
    !isRecord(continuation.responseValue) ||
    operation.operationId !== "abg.operation.run.continue" ||
    operation.capabilityRef !== continuation.actorCapabilityRef ||
    publicEvent?.kind !== "public_operation_admitted" ||
    publicPayload?.capabilityRef !== operation.capabilityRef ||
    !Array.isArray(publicPayload.capabilityGrantRefs) ||
    publicPayload.capabilityGrantRefs[0] !== operation.capabilityGrantRef ||
    successorInput.kind !== "fh_resume_successor_input" ||
    successorInput.disposition !== "admitted" ||
    successorInput.inputRef !== expectedSuccessorInput.inputRef ||
    successorInput.inputDigest !== expectedSuccessorInput.inputDigest ||
    sha256Canonical(successorInput.inputValue as unknown as JsonValue) !==
      expectedSuccessorInput.inputDigest ||
    !isTraversalCursorCandidate(successorCursor) ||
    successorCursor.runId !== continuation.runId ||
    successorCursor.graphCallId !== continuation.graphCallId ||
    successorCursor.frameId !== continuation.frameId ||
    successorCursor.inputRef !== successorInput.inputRef ||
    successorCursor.inputDigest !== successorInput.inputDigest
  ) {
    throw new TypeError(
      "F_H resume requires one exact responded continuation and successor cursor",
    );
  }
  const event = admitRuntimeEvent(store, {
    kind: "fh_interaction_resume_admitted",
    eventTime: basis.eventTime,
    aggregateType: "continuation",
    aggregateId: continuationRef,
    parentAggregateId: continuation.frameId,
    causationEventRefs: [
      continuation.respondedEventRef!,
      operation.admissionEventRef,
      ...basis.causationEventRefs,
    ],
    correlationId: basis.correlationId,
    workflowVersion: "5.0.0",
    scopeClass: "run",
    basisId: continuation.continuationRef,
    runId: continuation.runId,
    graphCallId: continuation.graphCallId,
    frameId: continuation.frameId,
    payload: {
      continuationRef,
      openedEventRef: continuation.openedEventRef,
      respondedEventRef: continuation.respondedEventRef!,
      publicOperationEventRef: operation.admissionEventRef,
      actorRef: operation.actorRef,
      capabilityRef: operation.capabilityRef,
      durablePrefixDigest,
      responseRef: continuation.responseRef,
      responseDigest: continuation.responseDigest,
      responseValue: continuation.responseValue,
      successorInputRef: successorInput.inputRef,
      successorInputDigest: successorInput.inputDigest,
      successorInputValue: successorInput.inputValue,
      successorCursorRef: successorCursor.cursorRef,
      successorCursorDigest: successorCursor.cursorDigest,
    },
  });
  return deepFreeze({
    kind: "fh_interaction_resume_admission" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "resolved" as const,
    continuationRef,
    actorRef: operation.actorRef,
    capabilityRef: operation.capabilityRef,
    responseRef: continuation.responseRef,
    responseDigest: continuation.responseDigest,
    responseValue: continuation.responseValue,
    successorInputRef: successorInput.inputRef,
    successorInputDigest: successorInput.inputDigest,
    successorInputValue: successorInput.inputValue,
    successorCursorRef: successorCursor.cursorRef,
    successorCursorDigest: successorCursor.cursorDigest,
    admissionEventRef: event.eventId,
  });
}
