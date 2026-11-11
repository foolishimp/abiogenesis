import { indexedRuntimeEvents, runtimeEventAtPrefix } from "./event_prefix.js";
import type { RuntimeEventPrefix } from "./event_prefix.js";
import { isRecord } from "../shared/admission_predicates.js";
import { type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { projectPendingInteractionCarrier } from "./c_call.js";
import {
  constructRuntimeFluent,
  deriveRuntimeHeldFluentProjection,
  holdsAt,
  type RuntimeEventCalculusProjection, type RuntimeHeldFluentProjection,
} from "./event_calculus.js";
import {
  runtimeEventBodiesAtPrefix,
  selectValidatedRuntimeEventPrefix,
  validatedRuntimeEventPrefixThroughEvent,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import { type RuntimeEvent } from "./event_store.js";
import {
  hasExactInvocationRunBindingAtPrefix,
  projectExactExecutionBasisAtPrefix,
  projectExactInvocationAdmissionAtPrefix,
} from "./invocation_execution_truth.js";
import {
  isTraversalCursorCandidate,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";
import { isConstructionContinuationKind } from "./construction_continuation.js";

// Human response and same-Run resumption are reserved to 5.1. A 5.0 F_H
// continuation is an open hold: its response, successor and terminal fields
// are null and keep their keys, so the replay digest is unchanged.
export type ReplayContinuationState = {
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
  readonly successorInputContractRef: string | null;
  readonly successorInputValueKind: string | null;
  readonly successorCursorRef: string | null;
  readonly successorCursorDigest: Sha256Digest | null;
  readonly openedEventRef: string;
  readonly respondedEventRef: string | null;
  readonly respondedPublicOperationEventRef: string | null;
  readonly resumedEventRef: string | null;
  readonly resumedPublicOperationEventRef: string | null;
  readonly terminalEventRef: string | null;
  readonly status: "abandoned" | "open" | "responded" | "resolved" | "superseded";
};

export type FhEffectfulPublicInvocationFactProjection =
  | Readonly<{
      readonly disposition: "valid";
      readonly facts: readonly [];
    }>
  | Readonly<{
      readonly disposition: "invalid_history";
      readonly eventRefs: readonly string[];
    }>;

function stringField(event: RuntimeEvent, key: string): string | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function digestField(event: RuntimeEvent, key: string): Sha256Digest | null {
  const value = stringField(event, key);
  return value?.startsWith("sha256:") ? value as Sha256Digest : null;
}

function exactOpenedBasis(
  prefix: RuntimeEventPrefix,
  opened: RuntimeEvent,
  continuationRef: string,
): Readonly<{
  cCallRef: string;
  requestRef: string;
  requestDigest: Sha256Digest;
    judgmentRef: string;
    continuationDigest: Sha256Digest;
    constructionIntentRef: string | null;
    constructionIntentDigest: Sha256Digest | null;
}> | null {
  if (
    !isRecord(opened.payload) || !isRecord(opened.payload.cCall) ||
    !isRecord(opened.payload.pendingResult) ||
    !isRecord(opened.payload.pendingJudgment) ||
    !isRecord(opened.payload.heldCursor) ||
    !isRecord(opened.payload.openedTraversalScope)
  ) return null;
  const openedPayload = opened.payload;
  const pending = projectPendingInteractionCarrier(
    prefix,
    opened.payload.cCall,
    opened.payload.pendingResult,
    opened.payload.pendingJudgment,
  );
  if (pending === null) return null;
  runtimeEventBodiesAtPrefix(prefix);
  const holdRoutes = indexedRuntimeEvents(prefix, "payload:routeRef:" + openedPayload.holdRouteRef).filter((event) =>
    event.kind === "traversal_route_admitted" &&
    isRecord(event.payload) &&
    event.payload.routeRef === openedPayload.holdRouteRef
  );
  const holdRoute = holdRoutes[0];
  const heldCursor = openedPayload.heldCursor as unknown as TraversalCursorCandidate;
  const openedScope = opened.payload.openedTraversalScope;
  const constructionIntentRef = stringField(opened, "constructionIntentRef");
  const constructionIntentDigest = digestField(
    opened,
    "constructionIntentDigest",
  );
  if (opened.runId === undefined || opened.graphCallId === undefined || opened.frameId === undefined ||
      openedPayload.executionBasisRef === undefined) return null;
  const identity = {
    continuationKind: "fh_interaction" as const,
    runId: opened.runId,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    cCallRef: pending.cCall.cCallRef,
    heldCursorRef: heldCursor.cursorRef,
    heldCursorDigest: heldCursor.cursorDigest,
    requestRef: pending.requestRef,
    requestDigest: pending.requestDigest,
    actorCapabilityRef: pending.cCall.actorCapabilityRef,
    responseContractRef: pending.cCall.responseContractRef,
    executionBasisRef: openedPayload.executionBasisRef,
    constructionIntentRef,
  };
  const continuationDigest = sha256Canonical(identity);
  const exactContinuationRef =
    `continuation://abiogenesis/${continuationDigest.slice("sha256:".length)}`;
  if (
    holdRoutes.length !== 1 || holdRoute === undefined ||
    !isRecord(holdRoute.payload) ||
    opened.aggregateType !== "continuation" ||
    opened.workflowVersion !== "5.0.0" || opened.scopeClass !== "run" ||
    opened.runId === undefined || opened.graphCallId === undefined ||
    opened.frameId === undefined || opened.parentAggregateId !== opened.frameId ||
    opened.aggregateId !== continuationRef ||
    openedPayload.continuationRef !== opened.aggregateId ||
    openedPayload.continuationKind !== "fh_interaction" ||
    openedPayload.continuationDigest !== continuationDigest ||
    continuationRef !== exactContinuationRef ||
    opened.basisId !== openedPayload.executionBasisRef ||
    opened.graphFunctionRef !== openedPayload.graphFunctionRef ||
    opened.materializationRef !== openedPayload.graphRef ||
    openedPayload.graphRef !== heldCursor.graphRef ||
    openedPayload.graphDigest === undefined ||
    openedPayload.executionBasisRef !== heldCursor.executionBasisRef ||
    openedPayload.scopeRef !== heldCursor.traversalScopeRef ||
    openedScope.scopeRef !== openedPayload.scopeRef ||
    openedScope.scopeDigest !== openedPayload.scopeDigest ||
    openedScope.executionBasisRef !== openedPayload.executionBasisRef ||
    openedScope.runId !== opened.runId ||
    openedScope.graphCallId !== opened.graphCallId ||
    openedScope.frameId !== opened.frameId ||
    !isTraversalCursorCandidate(heldCursor) ||
    heldCursor.runId !== opened.runId ||
    heldCursor.graphCallId !== opened.graphCallId ||
    heldCursor.frameId !== opened.frameId ||
    pending.cCall.basisId !== opened.basisId ||
    pending.cCall.runId !== opened.runId ||
    pending.cCall.graphCallId !== opened.graphCallId ||
    pending.cCall.frameId !== opened.frameId ||
    pending.cCall.graphFunctionRef !== opened.graphFunctionRef ||
    openedPayload.cCallRef !== pending.cCall.cCallRef ||
    openedPayload.requestContractRef !== pending.cCall.inputContractRef ||
    openedPayload.requestRef !== pending.requestRef ||
    openedPayload.requestDigest !== pending.requestDigest ||
    openedPayload.actorCapabilityRef !== pending.cCall.actorCapabilityRef ||
    openedPayload.responseContractRef !== pending.cCall.responseContractRef ||
    openedPayload.causedByEventRef !== pending.judgment.admissionEventRef ||
    openedPayload.heldCursorRef !== heldCursor.cursorRef ||
    openedPayload.heldCursorDigest !== heldCursor.cursorDigest ||
    openedPayload.inputRef !== heldCursor.inputRef ||
    openedPayload.inputDigest !== heldCursor.inputDigest ||
    !isRecord(openedPayload.inputValue) ||
    sha256Canonical(openedPayload.inputValue) !== openedPayload.inputDigest ||
    (constructionIntentRef === null) !== (constructionIntentDigest === null) ||
    holdRoute.workflowVersion !== "5.0.0" ||
    holdRoute.scopeClass !== "run" ||
    holdRoute.aggregateType !== "frame" ||
    holdRoute.aggregateId !== opened.frameId ||
    holdRoute.parentAggregateId !== opened.graphCallId ||
    holdRoute.basisId !== opened.basisId ||
    holdRoute.runId !== opened.runId ||
    holdRoute.graphFunctionRef !== opened.graphFunctionRef ||
    holdRoute.materializationRef !== opened.materializationRef ||
    holdRoute.graphCallId !== opened.graphCallId ||
    holdRoute.frameId !== opened.frameId ||
    holdRoute.admissionOrdinal >= opened.admissionOrdinal ||
    holdRoute.payload.routeKind !== "hold" ||
    holdRoute.payload.sourceCursorRef !== openedPayload.heldCursorRef ||
    holdRoute.payload.sourceCursorDigest !== openedPayload.heldCursorDigest ||
    holdRoute.payload.cCallRef !== pending.cCall.cCallRef ||
    holdRoute.payload.judgmentRef !== pending.judgment.judgmentRef ||
    !Array.isArray(holdRoute.payload.consumedAvailabilityRefs) ||
    holdRoute.payload.consumedAvailabilityRefs.length !== 1 ||
    holdRoute.payload.consumedAvailabilityRefs[0] !==
      pending.judgment.judgmentRef ||
    !holdRoute.causationEventRefs.includes(pending.judgment.admissionEventRef) ||
    opened.causationEventRefs[0] !== holdRoute.eventId
  ) return null;
  return {
    cCallRef: pending.cCall.cCallRef,
    requestRef: pending.requestRef,
    requestDigest: pending.requestDigest,
    judgmentRef: pending.judgment.judgmentRef,
    continuationDigest,
    constructionIntentRef,
    constructionIntentDigest,
  };
}

export function projectFhContinuations(
  prefix: ValidatedRuntimeEventPrefix,
  eventCalculus: RuntimeEventCalculusProjection,
): readonly ReplayContinuationState[];
/** @internal */
export function projectFhContinuations(
  prefix: RuntimeEventPrefix,
  eventCalculus: RuntimeHeldFluentProjection,
): readonly ReplayContinuationState[];
export function projectFhContinuations(
  prefix: RuntimeEventPrefix,
  eventCalculus: RuntimeHeldFluentProjection,
): readonly ReplayContinuationState[] {
  const events = indexedRuntimeEvents(prefix, "type:" + "continuation").filter((event) =>
    event.aggregateType === "continuation" && (!isRecord(event.payload) || !isConstructionContinuationKind(event.payload.continuationKind))
  );
  const refs = [...new Set(events.map((event) => event.aggregateId))];
  return refs.map((continuationRef) => {
    // A 5.0 F_H continuation has exactly one lifecycle row: its opening.
    const rows = events.filter((event) => event.aggregateId === continuationRef);
    const opened = rows[0];
    if (
      opened === undefined || rows.length !== 1 ||
      opened.kind !== "fh_interaction_opened"
    ) throw new TypeError(`continuation ${continuationRef} has an invalid event lifecycle`);
    const openedBasis = exactOpenedBasis(prefix, opened, continuationRef);
    const continuationDigest = openedBasis?.continuationDigest ?? null;
    const actorCapabilityRef = stringField(opened, "actorCapabilityRef");
    const requestContractRef = stringField(opened, "requestContractRef");
    const responseContractRef = stringField(opened, "responseContractRef");
    const heldCursorRef = stringField(opened, "heldCursorRef");
    const heldCursorDigest = digestField(opened, "heldCursorDigest");
    if (
      openedBasis === null || continuationDigest === null ||
      opened.runId === undefined || opened.graphCallId === undefined ||
      opened.frameId === undefined || actorCapabilityRef === null ||
      requestContractRef === null || responseContractRef === null ||
      heldCursorRef === null || heldCursorDigest === null
    ) throw new TypeError(`continuation ${continuationRef} has incomplete opening truth`);
    const open = holdsAt(eventCalculus, constructRuntimeFluent({
      name: "continuation_open",
      identity: continuationRef,
    }));
    if (!open) throw new TypeError(
      `continuation ${continuationRef} differs from Event Calculus lifecycle truth`,
    );
    return deepFreeze({
      continuationRef,
      continuationDigest,
      continuationKind: "fh_interaction" as const,
      runId: opened.runId,
      graphCallId: opened.graphCallId,
      frameId: opened.frameId,
      cCallRef: openedBasis.cCallRef,
      actorCapabilityRef,
      requestContractRef,
      responseContractRef,
      requestRef: openedBasis.requestRef,
      requestDigest: openedBasis.requestDigest,
      heldCursorRef,
      heldCursorDigest,
      constructionIntentRef: openedBasis.constructionIntentRef,
      constructionIntentDigest: openedBasis.constructionIntentDigest,
      responseRef: null,
      responseDigest: null,
      responseValue: null,
      successorInputRef: null,
      successorInputDigest: null,
      successorInputValue: null,
      successorInputContractRef: null,
      successorInputValueKind: null,
      successorCursorRef: null,
      successorCursorDigest: null,
      openedEventRef: opened.eventId,
      respondedEventRef: null,
      respondedPublicOperationEventRef: null,
      resumedEventRef: null,
      resumedPublicOperationEventRef: null,
      terminalEventRef: null,
      status: "open" as const,
    });
  });
}

export function projectFhEffectfulPublicInvocationFacts(
  prefix: ValidatedRuntimeEventPrefix,
): FhEffectfulPublicInvocationFactProjection;
/** @internal */
export function projectFhEffectfulPublicInvocationFacts(
  prefix: RuntimeEventPrefix,
): FhEffectfulPublicInvocationFactProjection;
export function projectFhEffectfulPublicInvocationFacts(
  prefix: RuntimeEventPrefix,
): FhEffectfulPublicInvocationFactProjection {
  // The shared public-operation classification selects both F_H operation
  // families. Human response and resumption are reserved to 5.1, so no F_H
  // operation has an owner row in 5.0: each one is an orphan.
  const publicEvents = [
    ...indexedRuntimeEvents(prefix, "public-operation:" + "abg.operation.interaction.respond"),
    ...indexedRuntimeEvents(prefix, "public-operation:" + "abg.operation.run.continue"),
  ].sort((left, right) => left.admissionOrdinal - right.admissionOrdinal).filter((event) =>
    event.kind === "public_operation_admitted" &&
    isRecord(event.payload) && !isConstructionContinuationKind(event.payload.continuationKind) &&
    (
      event.payload.operationId === "abg.operation.interaction.respond" ||
      event.payload.operationId === "abg.operation.run.continue"
    )
  );
  const relevantEventRefs = publicEvents.map((event) => event.eventId).sort();
  let continuationHistories: readonly Readonly<{
    authorityPrefix: RuntimeEventPrefix;
    continuation: ReplayContinuationState;
  }>[];
  try {
    const continuationEvents = indexedRuntimeEvents(prefix, "type:" + "continuation").filter((event) =>
      event.aggregateType === "continuation" && (!isRecord(event.payload) || !isConstructionContinuationKind(event.payload.continuationKind))
    );
    const continuationRefs = [
      ...new Set(continuationEvents.map((event) => event.aggregateId)),
    ];
    continuationHistories = continuationRefs.map((continuationRef) => {
      const rows = continuationEvents.filter((event) =>
        event.aggregateId === continuationRef
      );
      const boundary = rows.at(-1);
      if (boundary === undefined) {
        throw new TypeError(
          `continuation ${continuationRef} has no historical owner boundary`,
        );
      }
      if (boundary.runId === undefined) {
        throw new TypeError(
          `continuation ${continuationRef} has no owner Run boundary`,
        );
      }
      const ownerAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(
        prefix,
        boundary.eventId,
      );
      const ownerEvents = runtimeEventBodiesAtPrefix(
        ownerAuthorityPrefix,
      );
      const ownerRunPrefix = selectValidatedRuntimeEventPrefix(
        ownerEvents,
        { runId: boundary.runId },
      );
      const continuation = projectFhContinuations(
        ownerRunPrefix,
        deriveRuntimeHeldFluentProjection(ownerRunPrefix),
      ).find((candidate) =>
        candidate.continuationRef === continuationRef
      );
      if (continuation === undefined) {
        throw new TypeError(
          `continuation ${continuationRef} is absent at its historical owner boundary`,
        );
      }
      return {
        authorityPrefix: ownerAuthorityPrefix,
        continuation,
      };
    });
  } catch {
    return deepFreeze({
      disposition: "invalid_history" as const,
      eventRefs: relevantEventRefs,
    });
  }
  for (const history of continuationHistories) {
    const { continuation } = history;
    const openedAt = runtimeEventAtPrefix(history.authorityPrefix, continuation.openedEventRef);
    const opened = openedAt?.kind === "fh_interaction_opened" ? openedAt : undefined;
    const openedPayload = opened !== undefined && isRecord(opened.payload)
      ? opened.payload
      : null;
    const executionBasisRef = openedPayload?.executionBasisRef;
    const executionBasis = typeof executionBasisRef === "string"
      ? projectExactExecutionBasisAtPrefix(
          history.authorityPrefix,
          executionBasisRef,
        )
      : null;
    const rootInvocation = executionBasis === null
      ? null
      : projectExactInvocationAdmissionAtPrefix(
          history.authorityPrefix,
          executionBasis.invocationAdmissionRef,
        );
    if (
      opened === undefined ||
      openedPayload === null ||
      executionBasis === null ||
      rootInvocation === null ||
      opened.basisId !== executionBasis.basisRef ||
      openedPayload.executionBasisRef !== executionBasis.basisRef ||
      openedPayload.executionBasisDigest !== executionBasis.basisDigest ||
      openedPayload.workspaceBindingId !==
        executionBasis.workspaceBindingId ||
      openedPayload.workspaceBindingDigest !==
        executionBasis.workspaceBindingDigest ||
      openedPayload.catalogViewId !== executionBasis.catalogViewId ||
      openedPayload.catalogViewDigest !== executionBasis.catalogViewDigest ||
      openedPayload.programRef !== executionBasis.programRef ||
      openedPayload.programDigest !== executionBasis.programDigest ||
      openedPayload.graphFunctionRef !== executionBasis.graphFunctionRef ||
      openedPayload.graphFunctionDigest !==
        executionBasis.graphFunctionDigest ||
      openedPayload.graphRef !== executionBasis.graphRef ||
      openedPayload.graphDigest !== executionBasis.graphDigest ||
      openedPayload.implementationSetRef !==
        executionBasis.implementationSetRef ||
      openedPayload.implementationSetDigest !==
        executionBasis.implementationSetDigest ||
      openedPayload.interactionSetRef !== executionBasis.interactionSetRef ||
      openedPayload.interactionSetDigest !==
        executionBasis.interactionSetDigest ||
      executionBasis.actorRef !== rootInvocation.actorRef ||
      executionBasis.workspaceBindingId !==
        rootInvocation.workspaceBindingId ||
      executionBasis.workspaceBindingDigest !==
        rootInvocation.workspaceBindingDigest ||
      executionBasis.catalogBasisRef !== rootInvocation.catalogBasisRef ||
      executionBasis.catalogBasisDigest !== rootInvocation.catalogBasisDigest ||
      executionBasis.catalogViewId !== rootInvocation.catalogViewId ||
      executionBasis.catalogViewDigest !== rootInvocation.catalogViewDigest ||
      !hasExactInvocationRunBindingAtPrefix(
        history.authorityPrefix,
        rootInvocation,
        continuation.runId,
      )
    ) {
      return deepFreeze({
        disposition: "invalid_history" as const,
        eventRefs: relevantEventRefs,
      });
    }
  }
  if (publicEvents.length !== 0) {
    return deepFreeze({
      disposition: "invalid_history" as const,
      eventRefs: relevantEventRefs,
    });
  }
  return deepFreeze({
    disposition: "valid" as const,
    facts: [] as const,
  });
}
