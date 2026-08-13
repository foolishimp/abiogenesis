import type { ClosureContract } from "../gtl/contracts.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import { projectPendingInteractionCarrier } from "./c_call.js";
import {
  constructRuntimeFluent,
  deriveRuntimeEventCalculusProjection,
  holdsAt,
  type RuntimeEventCalculusProjection,
} from "./event_calculus.js";
import {
  runtimeEventsFromValidatedPrefix,
  selectValidatedRuntimeEventPrefix,
  validatedRuntimeEventPrefixThroughEvent,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import { rehydrateExecutionBasisAtPrefix } from "./execution_basis.js";
import {
  durableRuntimeEventPrefixDigest,
  type RuntimeEvent,
} from "./event_store.js";
import {
  deriveFhResumeSuccessorInputAtPrefix,
  type FhResumeSuccessorInput,
} from "./fh_resume_relation.js";
import {
  hasExactInvocationRunBindingAtPrefix,
  projectExactExecutionBasisAtPrefix,
  projectExactInvocationAdmissionAtPrefix,
} from "./invocation_execution_truth.js";
import {
  isInteractionResumeCursorSuccessorAtPrefix,
  isTraversalCursorCandidate,
  type TraversalCursorCandidate,
} from "./traversal_cursor.js";

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
}

export interface FhEffectfulPublicInvocationFact {
  readonly operationId:
    | "abg.operation.interaction.respond"
    | "abg.operation.run.continue";
  readonly publicInvocationRef: string;
  readonly ownerInvocationRef: string;
  readonly ownerInvocationDigest: Sha256Digest;
  readonly publicOperationEventRef: string;
  readonly admissionEventRef: string;
}

export type FhEffectfulPublicInvocationFactProjection =
  | Readonly<{
      readonly disposition: "valid";
      readonly facts: readonly FhEffectfulPublicInvocationFact[];
    }>
  | Readonly<{
      readonly disposition: "invalid_history";
      readonly eventRefs: readonly string[];
    }>;

function isRecord(
  value: JsonValue | undefined,
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

function exactPublicOperation(
  events: readonly RuntimeEvent[],
  continuationRef: string,
  operationEventRef: JsonValue | undefined,
  operationId:
    | "abg.operation.interaction.respond"
    | "abg.operation.run.continue",
  actorRef: JsonValue | undefined,
  capabilityRef: JsonValue | undefined,
  predecessor: RuntimeEvent,
  successor: RuntimeEvent,
): RuntimeEvent | null {
  if (typeof operationEventRef !== "string") return null;
  const event = events.find((candidate) =>
    candidate.eventId === operationEventRef &&
    candidate.kind === "public_operation_admitted"
  );
  if (event === undefined || !isRecord(event.payload)) return null;
  const grants = event.payload.capabilityGrantRefs;
  return event.payload.operationId === operationId &&
      event.payload.continuationRef === continuationRef &&
      event.payload.actorRef === actorRef &&
      event.payload.capabilityRef === capabilityRef &&
      Array.isArray(grants) && grants.length === 1 &&
      typeof grants[0] === "string" && grants[0].length > 0 &&
      event.admissionOrdinal > predecessor.admissionOrdinal &&
      event.admissionOrdinal < successor.admissionOrdinal &&
      event.admissionOrdinal + 1 === successor.admissionOrdinal &&
      successor.causationEventRefs.length === 2 &&
      successor.causationEventRefs[0] === predecessor.eventId &&
      successor.causationEventRefs[1] === event.eventId
    ? event
    : null;
}

function exactOpenedBasis(
  prefix: ValidatedRuntimeEventPrefix,
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
    openedPayload.cCall as Readonly<Record<string, JsonValue>>,
    openedPayload.pendingResult as Readonly<Record<string, JsonValue>>,
    openedPayload.pendingJudgment as Readonly<Record<string, JsonValue>>,
  );
  if (pending === null) return null;
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const holdRoutes = events.filter((event) =>
    event.kind === "traversal_route_admitted" &&
    isRecord(event.payload) &&
    event.payload.routeRef === openedPayload.holdRouteRef
  );
  const holdRoute = holdRoutes[0];
  const heldCursor = openedPayload.heldCursor as unknown as TraversalCursorCandidate;
  const openedScope = openedPayload.openedTraversalScope as Readonly<
    Record<string, JsonValue>
  >;
  const constructionIntentRef = stringField(opened, "constructionIntentRef");
  const constructionIntentDigest = digestField(
    opened,
    "constructionIntentDigest",
  );
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
  const continuationDigest = sha256Canonical(
    identity as unknown as JsonValue,
  );
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

function exactLifecycleEnvelope(
  event: RuntimeEvent,
  opened: RuntimeEvent,
  basisId: string,
): boolean {
  return event.aggregateType === "continuation" &&
    event.aggregateId === opened.aggregateId &&
    event.parentAggregateId === opened.frameId &&
    event.workflowVersion === "5.0.0" && event.scopeClass === "run" &&
    event.basisId === basisId && event.runId === opened.runId &&
    event.graphCallId === opened.graphCallId && event.frameId === opened.frameId;
}

function exactClosureContract(
  value: JsonValue | undefined,
  executionBasis: NonNullable<ReturnType<
    typeof projectExactExecutionBasisAtPrefix
  >>,
): Readonly<ClosureContract> | null {
  if (!isRecord(value)) return null;
  const keys = Object.keys(value).sort();
  const expectedKeys = [
    "closureContractRef",
    "closureScope",
    "eventKindRefs",
    "evidenceContractRef",
    "judgmentContractRef",
    "kind",
    "predicateRef",
    "refusalContractRef",
    "refusalValueKind",
    "rejectionContractRef",
    "replayProjectionRef",
    "resultContractRef",
    "terminalKind",
    "transitionContractRef",
  ].sort();
  if (
    keys.length !== expectedKeys.length ||
    keys.some((key, index) => key !== expectedKeys[index]) ||
    value.kind !== "closure_contract" ||
    (value.closureScope !== "run" && value.closureScope !== "graph_call") ||
    value.terminalKind !== "completed" ||
    !Array.isArray(value.eventKindRefs)
  ) return null;
  const expectedKinds = value.closureScope === "run"
    ? ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"]
    : ["terminal_reached", "frame_closed", "graph_call_closed"];
  const stringKeys = expectedKeys.filter((key) =>
    key !== "eventKindRefs" && key !== "closureScope"
  );
  if (
    stringKeys.some((key) =>
      typeof value[key] !== "string" || (value[key] as string).length === 0
    ) ||
    canonicalJson(value.eventKindRefs) !== canonicalJson(expectedKinds) ||
    value.closureContractRef !== executionBasis.closureContractRef ||
    value.predicateRef !== executionBasis.terminalPredicateRef ||
    value.evidenceContractRef !== executionBasis.evidenceContractRef ||
    value.resultContractRef !== executionBasis.resultContractRef ||
    value.refusalContractRef !== executionBasis.refusalContractRef ||
    value.refusalValueKind !== executionBasis.refusalValueKind ||
    value.judgmentContractRef !== executionBasis.judgmentContractRef ||
    value.rejectionContractRef !== executionBasis.rejectionContractRef ||
    value.transitionContractRef !== executionBasis.transitionContractRef ||
    value.replayProjectionRef !== executionBasis.replayProjectionRef ||
    sha256Canonical(value) !== executionBasis.closureContractDigest
  ) return null;
  return value as unknown as Readonly<ClosureContract>;
}

export function validateExactFhResumeOwnerRelationAtPrefix(
  authorityPrefix: ValidatedRuntimeEventPrefix,
  resumeEvent: RuntimeEvent,
): boolean {
  try {
    const ownerAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(
      authorityPrefix,
      resumeEvent.eventId,
    );
    const authorityEvents = runtimeEventsFromValidatedPrefix(
      ownerAuthorityPrefix,
    );
    if (
      authorityEvents.some(
        (event, index) => event.admissionOrdinal !== index + 1
      ) ||
      resumeEvent.kind !== "fh_interaction_resume_admitted" ||
      resumeEvent.runId === undefined ||
      !isRecord(resumeEvent.payload)
    ) return false;
    const ownerRunPrefix = selectValidatedRuntimeEventPrefix(
      authorityEvents,
      { runId: resumeEvent.runId },
    );
    const runEvents = runtimeEventsFromValidatedPrefix(ownerRunPrefix);
    const exactResume = runEvents.find((event) =>
      event.eventId === resumeEvent.eventId
    );
    if (
      exactResume === undefined ||
      canonicalJson(exactResume as unknown as JsonValue) !==
        canonicalJson(resumeEvent as unknown as JsonValue)
    ) return false;
    const payload = resumeEvent.payload;
    const continuationRef = stringField(resumeEvent, "continuationRef");
    const openedEventRef = stringField(resumeEvent, "openedEventRef");
    const respondedEventRef = stringField(resumeEvent, "respondedEventRef");
    const publicOperationEventRef = stringField(
      resumeEvent,
      "publicOperationEventRef",
    );
    const opened = runEvents.find((event) => event.eventId === openedEventRef);
    const responded = runEvents.find((event) =>
      event.eventId === respondedEventRef
    );
    const publicOperation = authorityEvents.find(
      (event) => event.eventId === publicOperationEventRef,
    );
    if (
      continuationRef === null ||
      opened?.kind !== "fh_interaction_opened" ||
      responded?.kind !== "fh_interaction_responded" ||
      publicOperation?.kind !== "public_operation_admitted" ||
      !isRecord(opened.payload) ||
      !isRecord(publicOperation.payload) ||
      publicOperation.payload.operationId !== "abg.operation.run.continue" ||
      publicOperation.payload.continuationRef !== continuationRef ||
      publicOperation.admissionOrdinal + 1 !== resumeEvent.admissionOrdinal ||
      resumeEvent.causationEventRefs.length !== 2 ||
      resumeEvent.causationEventRefs[0] !== responded.eventId ||
      resumeEvent.causationEventRefs[1] !== publicOperation.eventId ||
      resumeEvent.eventTime !== publicOperation.eventTime ||
      resumeEvent.correlationId !== publicOperation.correlationId
    ) return false;
    const predecessorEvents = authorityEvents.slice(
      0,
      publicOperation.admissionOrdinal - 1,
    );
    const durablePrefixDigest = digestField(resumeEvent, "durablePrefixDigest");
    if (
      durablePrefixDigest === null ||
      durableRuntimeEventPrefixDigest(predecessorEvents) !== durablePrefixDigest
    ) return false;
    const respondedAuthorityPrefix = validatedRuntimeEventPrefixThroughEvent(
      ownerAuthorityPrefix,
      responded.eventId,
    );
    const respondedRunPrefix = selectValidatedRuntimeEventPrefix(
      runtimeEventsFromValidatedPrefix(respondedAuthorityPrefix),
      { runId: resumeEvent.runId },
    );
    const respondedContinuation = projectFhContinuations(
      respondedRunPrefix,
      deriveRuntimeEventCalculusProjection(respondedRunPrefix),
      respondedAuthorityPrefix,
    ).find((candidate) => candidate.continuationRef === continuationRef);
    if (
      respondedContinuation === undefined ||
      respondedContinuation.status !== "responded"
    ) return false;
    const prefixThroughOperation = validatedRuntimeEventPrefixThroughEvent(
      ownerAuthorityPrefix,
      publicOperation.eventId,
    );
    const executionBasisRef = stringField(opened, "executionBasisRef");
    const executionBasis = executionBasisRef === null
      ? null
      : rehydrateExecutionBasisAtPrefix(
          prefixThroughOperation,
          executionBasisRef,
        );
    if (executionBasis === null) return false;
    const closureContract = exactClosureContract(
      payload.closureContract,
      executionBasis,
    );
    const successorInputRef = stringField(resumeEvent, "successorInputRef");
    const successorInputDigest = digestField(
      resumeEvent,
      "successorInputDigest",
    );
    const successorInputValue = isRecord(payload.successorInputValue)
      ? payload.successorInputValue
      : null;
    const successorInputContractRef = payload.successorInputContractRef;
    const successorInputValueKind = payload.successorInputValueKind;
    const successorCursor = isRecord(payload.successorCursor)
      ? payload.successorCursor as unknown as TraversalCursorCandidate
      : null;
    if (
      closureContract === null ||
      successorInputRef === null ||
      successorInputDigest === null ||
      successorInputValue === null ||
      !(
        (successorInputContractRef === null && successorInputValueKind === null) ||
        (typeof successorInputContractRef === "string" &&
          successorInputContractRef.length > 0 &&
          typeof successorInputValueKind === "string" &&
          successorInputValueKind.length > 0)
      ) ||
      successorCursor === null ||
      !isTraversalCursorCandidate(successorCursor) ||
      payload.successorCursorRef !== successorCursor.cursorRef ||
      payload.successorCursorDigest !== successorCursor.cursorDigest
    ) return false;
    const suppliedInput: FhResumeSuccessorInput = deepFreeze({
      kind: "fh_resume_successor_input" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "admitted" as const,
      inputRef: successorInputRef,
      inputDigest: successorInputDigest,
      inputValue: successorInputValue,
      inputContractRef: successorInputContractRef as string | null,
      inputValueKind: successorInputValueKind as string | null,
    });
    const expectedInput = deriveFhResumeSuccessorInputAtPrefix(
      prefixThroughOperation,
      respondedContinuation,
      { admissionEventRef: publicOperation.eventId },
      executionBasis,
      closureContract,
      {
        inputContractRef: suppliedInput.inputContractRef,
        inputValueKind: suppliedInput.inputValueKind,
      },
    );
    const heldCursor = isRecord(opened.payload.heldCursor)
      ? opened.payload.heldCursor as unknown as TraversalCursorCandidate
      : null;
    return canonicalJson(suppliedInput as unknown as JsonValue) ===
        canonicalJson(expectedInput as unknown as JsonValue) &&
      heldCursor !== null &&
      isTraversalCursorCandidate(heldCursor) &&
      isInteractionResumeCursorSuccessorAtPrefix(
        prefixThroughOperation,
        heldCursor,
        expectedInput,
        successorCursor,
      );
  } catch {
    return false;
  }
}

export function projectFhContinuations(
  prefix: ValidatedRuntimeEventPrefix,
  eventCalculus: RuntimeEventCalculusProjection,
  authorityPrefix: ValidatedRuntimeEventPrefix = prefix,
): readonly ReplayContinuationState[] {
  const allEvents = runtimeEventsFromValidatedPrefix(prefix);
  const events = allEvents.filter((event) =>
    event.aggregateType === "continuation"
  );
  const refs = [...new Set(events.map((event) => event.aggregateId))];
  return refs.map((continuationRef) => {
    const rows = events.filter((event) => event.aggregateId === continuationRef);
    const openedRows = rows.filter((event) => event.kind === "fh_interaction_opened");
    const respondedRows = rows.filter((event) =>
      event.kind === "fh_interaction_responded"
    );
    const resumedRows = rows.filter((event) =>
      event.kind === "fh_interaction_resume_admitted"
    );
    const opened = openedRows[0];
    const responded = respondedRows[0];
    const resumed = resumedRows[0];
    const abandoned = rows.find((event) => event.kind === "continuation_abandoned");
    const superseded = rows.find((event) => event.kind === "continuation_superseded");
    const dispositionRows = rows.filter((event) =>
      event.kind === "continuation_abandoned" ||
      event.kind === "continuation_superseded"
    );
    if (
      opened === undefined || openedRows.length !== 1 ||
      respondedRows.length > 1 || resumedRows.length > 1 ||
      dispositionRows.length > 1 ||
      (resumed !== undefined && dispositionRows.length !== 0) ||
      (resumed !== undefined && responded === undefined) ||
      (responded !== undefined &&
        responded.admissionOrdinal <= opened.admissionOrdinal) ||
      (resumed !== undefined &&
        resumed.admissionOrdinal <= (responded?.admissionOrdinal ?? 0))
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
    const respondedPayload = responded !== undefined && isRecord(responded.payload)
      ? responded.payload
      : null;
    const resumedPayload = resumed !== undefined && isRecord(resumed.payload)
      ? resumed.payload
      : null;
    const respondedPublicOperation = responded === undefined ||
        respondedPayload === null
      ? null
      : exactPublicOperation(
          allEvents,
          continuationRef,
          respondedPayload.publicOperationEventRef,
          "abg.operation.interaction.respond",
          respondedPayload.actorRef,
          respondedPayload.capabilityRef,
          opened,
          responded,
        );
    if (responded !== undefined && (
      respondedPayload === null ||
      !exactLifecycleEnvelope(responded, opened, continuationRef) ||
      respondedPayload.continuationRef !== continuationRef ||
      respondedPayload.actorRef === undefined ||
      respondedPayload.capabilityRef !== actorCapabilityRef ||
      respondedPayload.responseContractRef !== responseContractRef ||
      !isRecord(respondedPayload.responseValue) ||
      sha256Canonical(respondedPayload.responseValue) !==
        respondedPayload.responseDigest ||
      respondedPayload.responseRef !==
        `interaction-response://abiogenesis/${
          String(respondedPayload.responseDigest).slice("sha256:".length)
        }` ||
      responded.causationEventRefs[0] !== opened.eventId ||
      respondedPublicOperation === null
    )) throw new TypeError(`continuation ${continuationRef} has invalid response truth`);
    const resumedPublicOperation = resumed === undefined ||
        resumedPayload === null || responded === undefined
      ? null
      : exactPublicOperation(
          allEvents,
          continuationRef,
          resumedPayload.publicOperationEventRef,
          "abg.operation.run.continue",
          resumedPayload.actorRef,
          resumedPayload.capabilityRef,
          responded,
          resumed,
        );
    const successorInputContractRef = resumedPayload?.successorInputContractRef;
    const successorInputValueKind = resumedPayload?.successorInputValueKind;
    if (resumed !== undefined && (
      resumedPayload === null || responded === undefined ||
      respondedPayload === null ||
      !exactLifecycleEnvelope(resumed, opened, continuationRef) ||
      resumedPayload.continuationRef !== continuationRef ||
      resumedPayload.actorRef === undefined ||
      resumedPayload.capabilityRef !== actorCapabilityRef ||
      resumedPayload.openedEventRef !== opened.eventId ||
      resumedPayload.respondedEventRef !== responded.eventId ||
      resumedPayload.responseRef !== respondedPayload.responseRef ||
      resumedPayload.responseDigest !== respondedPayload.responseDigest ||
      !isRecord(resumedPayload.responseValue) ||
      sha256Canonical(resumedPayload.responseValue) !==
        resumedPayload.responseDigest ||
      !isRecord(resumedPayload.successorInputValue) ||
      sha256Canonical(resumedPayload.successorInputValue) !==
        resumedPayload.successorInputDigest ||
      typeof resumedPayload.successorInputRef !== "string" ||
      typeof resumedPayload.successorCursorRef !== "string" ||
      typeof resumedPayload.successorCursorDigest !== "string" ||
      !(
        (successorInputContractRef === null &&
          successorInputValueKind === null) ||
        (typeof successorInputContractRef === "string" &&
          successorInputContractRef.length > 0 &&
          typeof successorInputValueKind === "string" &&
          successorInputValueKind.length > 0)
      ) ||
      (openedBasis.constructionIntentRef !== null &&
        successorInputValueKind !== "action_evaluation_basis") ||
      typeof resumedPayload.durablePrefixDigest !== "string" ||
      !resumedPayload.durablePrefixDigest.startsWith("sha256:") ||
      resumed.causationEventRefs[0] !== responded.eventId ||
      resumedPublicOperation === null ||
      !validateExactFhResumeOwnerRelationAtPrefix(authorityPrefix, resumed)
    )) throw new TypeError(`continuation ${continuationRef} has invalid resume truth`);
    const disposition = dispositionRows[0];
    const dispositionPayload = disposition !== undefined &&
        isRecord(disposition.payload)
      ? disposition.payload
      : null;
    const dispositionPredecessor = responded ?? opened;
    if (disposition !== undefined && (
      dispositionPayload === null ||
      !exactLifecycleEnvelope(
        disposition,
        opened,
        dispositionPredecessor.basisId,
      ) ||
      disposition.graphFunctionRef !== dispositionPredecessor.graphFunctionRef ||
      disposition.materializationRef !==
        dispositionPredecessor.materializationRef ||
      dispositionPayload.continuationRef !== continuationRef ||
      dispositionPayload.continuationDigest !== continuationDigest ||
      dispositionPayload.continuationKind !== "fh_interaction" ||
      dispositionPayload.terminalDisposition !==
        (disposition.kind === "continuation_abandoned"
          ? "abandoned"
          : "superseded") ||
      dispositionPayload.causedByEventRef !== dispositionPredecessor.eventId ||
      disposition.causationEventRefs.length !== 1 ||
      disposition.causationEventRefs[0] !== dispositionPredecessor.eventId ||
      disposition.admissionOrdinal <= dispositionPredecessor.admissionOrdinal
    )) throw new TypeError(
      `continuation ${continuationRef} has invalid terminal disposition truth`,
    );
    const open = holdsAt(eventCalculus, constructRuntimeFluent({
      name: "continuation_open",
      identity: continuationRef,
    }));
    const responseAvailable = holdsAt(eventCalculus, constructRuntimeFluent({
      name: "continuation_response_available",
      identity: continuationRef,
    }));
    const terminated = holdsAt(eventCalculus, constructRuntimeFluent({
      name: "continuation_terminated",
      identity: continuationRef,
    }));
    const disposed = abandoned !== undefined || superseded !== undefined;
    if (
      (terminated && (open || responseAvailable || resumed === undefined)) ||
      (disposed && (open || responseAvailable)) ||
      (!terminated && !disposed && responded !== undefined &&
        (!open || !responseAvailable || resumed !== undefined)) ||
      (!terminated && !disposed && responded === undefined &&
        (!open || responseAvailable))
    ) throw new TypeError(
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
      responseRef: responded === undefined
        ? null
        : stringField(responded, "responseRef"),
      responseDigest: responded === undefined
        ? null
        : digestField(responded, "responseDigest"),
      responseValue: respondedPayload?.responseValue ?? null,
      successorInputRef: resumed === undefined
        ? null
        : stringField(resumed, "successorInputRef"),
      successorInputDigest: resumed === undefined
        ? null
        : digestField(resumed, "successorInputDigest"),
      successorInputValue: resumedPayload?.successorInputValue ?? null,
      successorInputContractRef: resumed === undefined
        ? null
        : successorInputContractRef as string | null,
      successorInputValueKind: resumed === undefined
        ? null
        : successorInputValueKind as string | null,
      successorCursorRef: resumed === undefined
        ? null
        : stringField(resumed, "successorCursorRef"),
      successorCursorDigest: resumed === undefined
        ? null
        : digestField(resumed, "successorCursorDigest"),
      openedEventRef: opened.eventId,
      respondedEventRef: responded?.eventId ?? null,
      respondedPublicOperationEventRef:
        respondedPublicOperation?.eventId ?? null,
      resumedEventRef: resumed?.eventId ?? null,
      resumedPublicOperationEventRef: resumedPublicOperation?.eventId ?? null,
      terminalEventRef: dispositionRows[0]?.eventId ?? resumed?.eventId ?? null,
      status: abandoned !== undefined
        ? "abandoned" as const
        : superseded !== undefined
          ? "superseded" as const
          : terminated
            ? "resolved" as const
            : responseAvailable
              ? "responded" as const
              : "open" as const,
    });
  });
}

export function projectFhEffectfulPublicInvocationFacts(
  prefix: ValidatedRuntimeEventPrefix,
): FhEffectfulPublicInvocationFactProjection {
  const events = runtimeEventsFromValidatedPrefix(prefix);
  const publicEvents = events.filter((event) =>
    event.kind === "public_operation_admitted" &&
    isRecord(event.payload) &&
    (
      event.payload.operationId === "abg.operation.interaction.respond" ||
      event.payload.operationId === "abg.operation.run.continue"
    )
  );
  const ownerEvents = events.filter((event) =>
    event.kind === "fh_interaction_responded" ||
    event.kind === "fh_interaction_resume_admitted"
  );
  const relevantEventRefs = [...publicEvents, ...ownerEvents]
    .map((event) => event.eventId)
    .sort();
  let continuationHistories: readonly Readonly<{
    authorityPrefix: ValidatedRuntimeEventPrefix;
    events: readonly RuntimeEvent[];
    continuation: ReplayContinuationState;
  }>[];
  try {
    const continuationEvents = events.filter((event) =>
      event.aggregateType === "continuation"
    );
    const continuationRefs = [
      ...new Set(continuationEvents.map((event) => event.aggregateId)),
    ];
    continuationHistories = continuationRefs.map((continuationRef) => {
      const rows = continuationEvents.filter((event) =>
        event.aggregateId === continuationRef
      );
      const ownerRows = rows.filter((event) =>
        event.kind === "fh_interaction_responded" ||
        event.kind === "fh_interaction_resume_admitted"
      );
      const boundary = ownerRows.at(-1) ?? rows.at(-1);
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
      const ownerEvents = runtimeEventsFromValidatedPrefix(
        ownerAuthorityPrefix,
      );
      const ownerRunPrefix = selectValidatedRuntimeEventPrefix(
        ownerEvents,
        { runId: boundary.runId },
      );
      const continuation = projectFhContinuations(
        ownerRunPrefix,
        deriveRuntimeEventCalculusProjection(ownerRunPrefix),
        ownerAuthorityPrefix,
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
        events: ownerEvents,
        continuation,
      };
    });
  } catch {
    return deepFreeze({
      disposition: "invalid_history" as const,
      eventRefs: relevantEventRefs,
    });
  }
  const facts: FhEffectfulPublicInvocationFact[] = [];
  for (const history of continuationHistories) {
    const { continuation } = history;
    const opened = history.events.find((event) =>
      event.eventId === continuation.openedEventRef &&
      event.kind === "fh_interaction_opened"
    );
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
    const coordinates = [
      continuation.respondedEventRef === null ||
          continuation.respondedPublicOperationEventRef === null
        ? null
        : {
            operationId: "abg.operation.interaction.respond" as const,
            ownerKind: "fh_interaction_responded" as const,
            publicOperationEventRef:
              continuation.respondedPublicOperationEventRef,
            admissionEventRef: continuation.respondedEventRef,
          },
      continuation.resumedEventRef === null ||
          continuation.resumedPublicOperationEventRef === null
        ? null
        : {
            operationId: "abg.operation.run.continue" as const,
            ownerKind: "fh_interaction_resume_admitted" as const,
            publicOperationEventRef:
              continuation.resumedPublicOperationEventRef,
            admissionEventRef: continuation.resumedEventRef,
          },
    ].filter((coordinate) => coordinate !== null);
    for (const coordinate of coordinates) {
      const publicEvent = history.events.find((event) =>
        event.eventId === coordinate.publicOperationEventRef
      );
      const ownerEvent = history.events.find((event) =>
        event.eventId === coordinate.admissionEventRef
      );
      const publicPayload = publicEvent !== undefined &&
          isRecord(publicEvent.payload)
        ? publicEvent.payload
        : null;
      const ownerPayload = ownerEvent !== undefined && isRecord(ownerEvent.payload)
        ? ownerEvent.payload
        : null;
      const invocationRef = publicPayload?.invocationRef;
      const invocationPayloadDigest = publicPayload?.invocationPayloadDigest;
      const invocationDigest = publicPayload?.invocationDigest;
      const capabilityGrantRefs = publicPayload?.capabilityGrantRefs;
      const capabilityGrantRef = Array.isArray(capabilityGrantRefs) &&
          capabilityGrantRefs.length === 1
        ? capabilityGrantRefs[0]
        : null;
      const capabilityGrant = typeof capabilityGrantRef === "string"
        ? rootInvocation.capabilityGrants.filter((grant) =>
            grant.grantRef === capabilityGrantRef
          )
        : [];
      const expectedVariant = coordinate.operationId ===
          "abg.operation.interaction.respond"
        ? new Set(["select", "approve", "reject", "assess", "answer_escalation"])
        : new Set(["current_intent", "selected_action"]);
      if (
        publicEvent?.kind !== "public_operation_admitted" ||
        publicEvent.aggregateType !== "workspace" ||
        publicEvent.aggregateId !== rootInvocation.workspaceBindingId ||
        publicEvent.basisId !== rootInvocation.authorityRef ||
        publicEvent.workflowVersion !== "5.0.0" ||
        publicEvent.scopeClass !== "workspace" ||
        publicPayload === null ||
        publicPayload.operationId !== coordinate.operationId ||
        typeof publicPayload.variant !== "string" ||
        !expectedVariant.has(publicPayload.variant) ||
        publicPayload.memberKey !== publicPayload.variant ||
        publicPayload.continuationRef !== continuation.continuationRef ||
        typeof invocationRef !== "string" ||
        invocationRef.length === 0 ||
        publicEvent.parentAggregateId !== invocationRef ||
        typeof invocationPayloadDigest !== "string" ||
        !/^sha256:[a-f0-9]{64}$/u.test(invocationPayloadDigest) ||
        !isExactOperationInvocationCoordinate({
          operationId: coordinate.operationId,
          memberKey: publicPayload.memberKey,
          definitionDigest: publicPayload.definitionDigest,
          invocationRef,
          invocationPayloadDigest,
          invocationDigest,
        }) ||
        publicPayload.actorRef !== rootInvocation.actorRef ||
        publicPayload.authorityRef !== rootInvocation.authorityRef ||
        publicPayload.authorityDigest !== rootInvocation.authorityDigest ||
        publicPayload.workspaceBindingId !==
          rootInvocation.workspaceBindingId ||
        publicPayload.workspaceBindingDigest !==
          rootInvocation.workspaceBindingDigest ||
        publicPayload.catalogBasisRef !== rootInvocation.catalogBasisRef ||
        publicPayload.catalogBasisDigest !== rootInvocation.catalogBasisDigest ||
        publicPayload.catalogViewId !== rootInvocation.catalogViewId ||
        publicPayload.catalogViewDigest !== rootInvocation.catalogViewDigest ||
        publicPayload.programRef !== rootInvocation.programRef ||
        publicPayload.programDigest !== rootInvocation.programDigest ||
        publicPayload.graphFunctionRef !== rootInvocation.graphFunctionRef ||
        publicPayload.graphFunctionDigest !==
          rootInvocation.graphFunctionDigest ||
        publicPayload.policyRef !== rootInvocation.policyRef ||
        publicPayload.policyDigest !== rootInvocation.policyDigest ||
        typeof publicPayload.capabilityRef !== "string" ||
        capabilityGrant.length !== 1 ||
        capabilityGrant[0]!.actorRef !== publicPayload.actorRef ||
        capabilityGrant[0]!.operationId !== coordinate.operationId ||
        capabilityGrant[0]!.capabilityRef !== publicPayload.capabilityRef ||
        capabilityGrant[0]!.policyRef !== rootInvocation.policyRef ||
        capabilityGrant[0]!.policyDigest !== rootInvocation.policyDigest ||
        !rootInvocation.capabilityGrantRefs.includes(
          capabilityGrant[0]!.grantRef,
        ) ||
        ownerEvent?.kind !== coordinate.ownerKind ||
        ownerPayload === null ||
        ownerPayload.continuationRef !== continuation.continuationRef ||
        ownerPayload.publicOperationEventRef !== publicEvent.eventId ||
        ownerEvent.eventTime !== publicEvent.eventTime ||
        ownerEvent.correlationId !== publicEvent.correlationId
      ) {
        return deepFreeze({
          disposition: "invalid_history" as const,
          eventRefs: relevantEventRefs,
        });
      }
      facts.push(deepFreeze({
        operationId: coordinate.operationId,
        publicInvocationRef: invocationRef,
        ownerInvocationRef: invocationRef,
        ownerInvocationDigest: invocationDigest as Sha256Digest,
        publicOperationEventRef: publicEvent.eventId,
        admissionEventRef: ownerEvent.eventId,
      }));
    }
  }
  const factPublicRefs = new Set(
    facts.map((fact) => fact.publicOperationEventRef),
  );
  const factOwnerRefs = new Set(facts.map((fact) => fact.admissionEventRef));
  if (
    factPublicRefs.size !== facts.length ||
    factOwnerRefs.size !== facts.length ||
    publicEvents.length !== facts.length ||
    ownerEvents.length !== facts.length ||
    publicEvents.some((event) => !factPublicRefs.has(event.eventId)) ||
    ownerEvents.some((event) => !factOwnerRefs.has(event.eventId))
  ) {
    return deepFreeze({
      disposition: "invalid_history" as const,
      eventRefs: relevantEventRefs,
    });
  }
  return deepFreeze({
    disposition: "valid" as const,
    facts,
  });
}
