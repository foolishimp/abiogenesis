// Implements: T-140
// Implements: REQ-R-ABG3-FP-CONSCIOUSNESS

import type {
  ConstructionDeltaObservedEvent,
  ConstructionGraphActionInvokedEvent,
  RuntimeEvent
} from "./carriers.js";
import type { AdmittedConstructionIntent } from "./construction_intent.js";
import {
  assertNonEmptyString,
  assertNonNegativeInteger
} from "./runtime_support.js";
import {
  freezeNonEmptyStrings,
  nullableString
} from "./construction_validation.js";

export type ConstructionRuntimeEvent = Extract<
  RuntimeEvent,
  {
    readonly constructionEventRef: string;
    readonly episodeId: string;
    readonly iterationOrdinal: number;
    readonly eventSequence: number;
  }
>;

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

export function constructConstructionDeltaObservedEvent(input: {
  readonly constructionEventRef: string;
  readonly invokedEvent: ConstructionGraphActionInvokedEvent;
  readonly eventSequence: number;
  readonly attemptOrdinal: number;
  readonly deltaRef: string;
  readonly assetDeltaRefs?: readonly string[] | undefined;
  readonly runtimeEventRefs?: readonly string[] | undefined;
  readonly beforeProjectionRef: string;
  readonly afterProjectionRef: string;
  readonly artifactDigestBefore?: string | null | undefined;
  readonly artifactDigestAfter?: string | null | undefined;
  readonly blockerBefore?: string | null | undefined;
  readonly blockerAfter?: string | null | undefined;
  readonly fulfilledObligationRefs?: readonly string[] | undefined;
  readonly remainingObligationRefs?: readonly string[] | undefined;
  readonly newEvidenceRefs?: readonly string[] | undefined;
  readonly fhDecisionAccepted?: boolean | undefined;
  readonly reentryMoved?: boolean | undefined;
  readonly closed?: boolean | undefined;
  readonly causationEventRefs?: readonly string[] | undefined;
}): ConstructionDeltaObservedEvent {
  assertNonEmptyString(
    input.constructionEventRef,
    "ConstructionDeltaObservedEvent.constructionEventRef"
  );
  assertNonNegativeInteger(input.eventSequence, "ConstructionDeltaObservedEvent.eventSequence");
  assertNonNegativeInteger(input.attemptOrdinal, "ConstructionDeltaObservedEvent.attemptOrdinal");
  assertNonEmptyString(input.deltaRef, "ConstructionDeltaObservedEvent.deltaRef");
  assertNonEmptyString(
    input.beforeProjectionRef,
    "ConstructionDeltaObservedEvent.beforeProjectionRef"
  );
  assertNonEmptyString(
    input.afterProjectionRef,
    "ConstructionDeltaObservedEvent.afterProjectionRef"
  );
  return Object.freeze({
    kind: "construction_delta_observed",
    constructionEventRef: input.constructionEventRef,
    basisId: input.invokedEvent.basisId,
    graphFunctionId: input.invokedEvent.graphFunctionId,
    runId: input.invokedEvent.runId,
    workKey: input.invokedEvent.workKey,
    episodeId: input.invokedEvent.episodeId,
    iterationOrdinal: input.invokedEvent.iterationOrdinal,
    eventSequence: input.eventSequence,
    basisProjectionRef: input.invokedEvent.basisProjectionRef,
    priorIntentId: input.invokedEvent.priorIntentId,
    causationEventRefs: freezeNonEmptyStrings(
      input.causationEventRefs ?? [input.invokedEvent.constructionEventRef],
      "ConstructionDeltaObservedEvent.causationEventRefs"
    ),
    correlationId: input.invokedEvent.correlationId,
    intentId: input.invokedEvent.intentId,
    attemptOrdinal: input.attemptOrdinal,
    graphCallId: input.invokedEvent.graphCallId,
    frameId: input.invokedEvent.frameId,
    continuationId: input.invokedEvent.continuationId,
    deltaRef: input.deltaRef,
    assetDeltaRefs: freezeNonEmptyStrings(
      input.assetDeltaRefs ?? [],
      "ConstructionDeltaObservedEvent.assetDeltaRefs"
    ),
    runtimeEventRefs: freezeNonEmptyStrings(
      input.runtimeEventRefs ?? [],
      "ConstructionDeltaObservedEvent.runtimeEventRefs"
    ),
    beforeProjectionRef: input.beforeProjectionRef,
    afterProjectionRef: input.afterProjectionRef,
    artifactDigestBefore: nullableString(
      input.artifactDigestBefore ?? null,
      "ConstructionDeltaObservedEvent.artifactDigestBefore"
    ),
    artifactDigestAfter: nullableString(
      input.artifactDigestAfter ?? null,
      "ConstructionDeltaObservedEvent.artifactDigestAfter"
    ),
    blockerBefore: nullableString(
      input.blockerBefore ?? null,
      "ConstructionDeltaObservedEvent.blockerBefore"
    ),
    blockerAfter: nullableString(
      input.blockerAfter ?? null,
      "ConstructionDeltaObservedEvent.blockerAfter"
    ),
    fulfilledObligationRefs: freezeNonEmptyStrings(
      input.fulfilledObligationRefs ?? [],
      "ConstructionDeltaObservedEvent.fulfilledObligationRefs"
    ),
    remainingObligationRefs: freezeNonEmptyStrings(
      input.remainingObligationRefs ?? [],
      "ConstructionDeltaObservedEvent.remainingObligationRefs"
    ),
    newEvidenceRefs: freezeNonEmptyStrings(
      input.newEvidenceRefs ?? [],
      "ConstructionDeltaObservedEvent.newEvidenceRefs"
    ),
    fhDecisionAccepted: input.fhDecisionAccepted ?? false,
    reentryMoved: input.reentryMoved ?? false,
    closed: input.closed ?? false
  });
}
