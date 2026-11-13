import type { RuntimeEventPrefix } from "./event_prefix.js";
import { onlyExactMatch, type ExactMatch } from "../shared/select/index.js";
import type { JsonValue } from "../shared/canonical_json.js";
import { isRecord } from "../shared/admission_predicates.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isUndispatchedOwnerObservation } from "./event_contract_profiles.js";
import { indexedRuntimeEvents, indexedRuntimeEventEnvelopes, readOwnedRuntimeEventPrefixAtDurablePrefix, runtimeEventAtPrefix, validatedRuntimeEventPrefixBeforeEvent, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { admitRuntimeEvent, admitRuntimeEventTransactionAtDurablePrefix, type AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";
import { canonicalEquals, presentMember } from "../shared/value/index.js";

/** The closed continuation kinds this owner validates. F_H classifies every
 * other continuation row and run.continue operation, and refuses a malformed or
 * unknown kind itself; a kind here is never an F_H arm. */
export function isConstructionContinuationKind(value: unknown): value is "construction_intent" | "selected_action" | "pending_execution" {
  return value === "construction_intent" || value === "selected_action" || value === "pending_execution";
}

/** A projection of an actual selected but undispatched consumer. It grants no
 * execution. Declaration, support, input and current-operation admission remain
 * required before any replacement scope can be opened. */
export type ConstructionIntentContinuation = {
  readonly continuationKind: "construction_intent";
  readonly continuationRef: string;
  readonly continuationDigest: Sha256Digest;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly cCallRef: string;
  readonly heldCursorRef: string;
  readonly heldCursorDigest: Sha256Digest;
  readonly executionBasisRef: string;
  readonly executionBasisDigest: Sha256Digest;
  readonly parentExecutionBasisRef: string;
  readonly parentCCallRef: string;
  readonly constructionIntentRef: string;
  readonly constructionIntentDigest: Sha256Digest;
  readonly intentAdmissionEventRef: string;
  readonly preparationEvidenceEventRef: string;
  readonly preparationResultRef: string;
  readonly preparationJudgmentRef: string;
  readonly causedByEventRef: string;
  readonly openedEventRef: string;
  readonly terminalEventRef: string | null;
  readonly status: "open" | "superseded" | "resolved";
  readonly predecessorContinuationRef?: string;
};
const hash = (value: JsonValue) => sha256Canonical(value);
/** Owner boundary: `absent` and `many` map to `null`. */
const exactOrNull = <T>(match: ExactMatch<T>): T | null => match.kind === "one" ? match.value : null;

/** Indexed cold projection; arbitrary failure text and F_D failure do not apply. */
function deriveConstructionIntentContinuations(
  prefix: RuntimeEventPrefix, runId: string,
): readonly ConstructionIntentContinuation[] {
  // The Run-open envelope selects the composition before any Run body is decoded.
  const openedRun = exactOrNull(onlyExactMatch(indexedRuntimeEventEnvelopes(prefix, "run:" + runId)
    .filter(e => e.kind === "run_segment_opened")));
  if (openedRun === null || openedRun.basisId === undefined ||
    projectExactExecutionBasisAtPrefix(prefix, openedRun.basisId)?.constructionComposition == null) return [];
  const rows = indexedRuntimeEvents(prefix, "run:" + runId);
  const terminal = rows.filter(e => e.kind === "runtime_failure_observed")
    .filter(e => e.runId === runId && e.aggregateType === "run").at(-1) ??
    rows.filter(e => e.kind === "run_stopped").filter(e => e.runId === runId).at(-1);
  if (terminal === undefined || indexedRuntimeEvents(prefix, "kind:run_closed").some(e => e.runId === runId)) return [];
  const candidates: ConstructionIntentContinuation[] = [];
  for (const evidence of rows.filter(e => e.kind === "c_call_evidenced")) {
    const p = evidence.payload;
    if (evidence.runId !== runId || evidence.admissionOrdinal >= terminal.admissionOrdinal || !isRecord(p) ||
      p.evidenceClass !== "undispatched_owner_refusal" || !isUndispatchedOwnerObservation(p.ownerObservation)) continue;
    const observation = p.ownerObservation;
    if (observation.stage !== "preparation" || observation.cCallRef !== evidence.aggregateId ||
      observation.runId !== runId || observation.graphCallId !== evidence.graphCallId || observation.frameId !== evidence.frameId) continue;
    const callRows = indexedRuntimeEvents(prefix, "aggregate:c_call:" + evidence.aggregateId);
    const opened = exactOrNull(onlyExactMatch(callRows.filter(e => e.kind === "c_call_opened")));
    const fibre = exactOrNull(onlyExactMatch(callRows.filter(e => e.kind === "c_call_fibre_selected")));
    const result = exactOrNull(onlyExactMatch(callRows.filter(e => e.kind === "c_call_result_admitted")));
    const judgment = exactOrNull(onlyExactMatch(callRows.filter(e => e.kind === "c_call_judged")));
    if (opened === null || fibre === null || result === null || judgment === null ||
      !isRecord(opened.payload) || !isRecord(fibre.payload) || !isRecord(result.payload) || !isRecord(judgment.payload) ||
      opened.payload.callClass !== "leaf" || fibre.payload.regime !== "F_P" ||
      fibre.payload.implementationRef !== observation.implementationRef ||
      result.payload.resultClass !== "failure" || judgment.payload.judgment !== "blocked" ||
      result.payload.valueDigest !== hash(presentMember(p.failureValue)) || result.payload.valueDigest !== p.outputDigest ||
      judgment.payload.resultRef !== result.payload.resultRef ||
      !Array.isArray(result.payload.evidenceRefs) || !result.payload.evidenceRefs.includes(p.evidenceRef) ||
      !result.causationEventRefs.includes(evidence.eventId) || !judgment.causationEventRefs.includes(result.eventId) ||
      typeof opened.payload.cursorRef !== "string" || typeof opened.payload.cursorDigest !== "string" ||
      typeof result.payload.resultRef !== "string" || typeof judgment.payload.judgmentRef !== "string" ||
      typeof opened.basisId !== "string" || typeof opened.graphCallId !== "string" || typeof opened.frameId !== "string") continue;
    // Any actual native dispatch, even failed/unknown, is another phase.
    if (rows.filter(e => e.kind === "actor_invocation_started").some(e =>
      isRecord(e.payload) && e.payload.cCallRef === evidence.aggregateId)) continue;
    const basis = projectExactExecutionBasisAtPrefix(prefix, opened.basisId);
    if (basis?.basisClass !== "child" || basis.parentExecutionBasisRef === null || basis.parentCCallRef === null) continue;
    const parent = projectExactExecutionBasisAtPrefix(prefix, basis.parentExecutionBasisRef);
    if (parent?.basisClass !== "root" || parent.constructionComposition === null ||
      basis.invocationAdmissionRef !== parent.invocationAdmissionRef) continue;
    const invocation = projectExactInvocationAdmissionAtPrefix(prefix, parent.invocationAdmissionRef);
    const parentOpen = exactOrNull(onlyExactMatch(indexedRuntimeEvents(prefix, "aggregate:c_call:" + basis.parentCCallRef)
      .filter(e => e.kind === "c_call_opened")));
    if (invocation === null || parentOpen === null || !isRecord(parentOpen.payload) ||
      parentOpen.runId !== runId || parentOpen.payload.callClass !== "workflow" ||
      parentOpen.payload.childGraphFunctionRef !== basis.graphFunctionRef) continue;
    const parentCursorRef = parentOpen.payload.cursorRef;
    const intentEvent = exactOrNull(onlyExactMatch(indexedRuntimeEvents(prefix, "kind:construction_intent_selected").filter(e =>
      e.runId === runId && e.basisId === parent.basisRef && isRecord(e.payload) &&
      e.payload.targetCursorRef === parentCursorRef)));
    if (intentEvent === null || !isRecord(intentEvent.payload) || !isRecord(intentEvent.payload.constructionIntent)) continue;
    const intent = intentEvent.payload.constructionIntent;
    if (intent.actionKind !== "invoke_graph_function" || intent.selectedGraphFunctionRef !== basis.graphFunctionRef ||
      intent.executionBasisRef !== parent.basisRef || intent.runId !== runId ||
      typeof intent.constructionIntentRef !== "string" || typeof intent.constructionIntentDigest !== "string") continue;
    const body = {
      continuationKind: "construction_intent" as const, runId, graphCallId: opened.graphCallId, frameId: opened.frameId,
      cCallRef: evidence.aggregateId, heldCursorRef: opened.payload.cursorRef,
      heldCursorDigest: opened.payload.cursorDigest as Sha256Digest,
      executionBasisRef: basis.basisRef, executionBasisDigest: basis.basisDigest,
      parentExecutionBasisRef: parent.basisRef, parentCCallRef: basis.parentCCallRef,
      constructionIntentRef: intent.constructionIntentRef, constructionIntentDigest: intent.constructionIntentDigest as Sha256Digest,
      intentAdmissionEventRef: intentEvent.eventId, preparationEvidenceEventRef: evidence.eventId,
      preparationResultRef: result.payload.resultRef, preparationJudgmentRef: judgment.payload.judgmentRef,
      causedByEventRef: terminal.eventId,
    };
    const continuationDigest = hash(body), continuationRef = `continuation://abiogenesis/${continuationDigest.slice(7)}`;
    const consumed = indexedRuntimeEvents(prefix, "kind:continuation_reentry_link_admitted").filter(e =>
      isRecord(e.payload) && e.payload.continuationKind === "construction_intent" && e.payload.predecessorContinuationId === continuationRef);
    if (consumed.length > 1) throw new TypeError("construction continuation has duplicate reentry admissions");
    candidates.push(deepFreeze({ ...body, continuationRef, continuationDigest, openedEventRef: terminal.eventId,
      terminalEventRef: consumed[0]?.eventId ?? null, status: consumed.length === 0 ? "open" as const : "superseded" as const }));
  }
  // An ambiguous failed consumer is not an eligible instruction to select work.
  return candidates.length === 1 ? Object.freeze(candidates) : Object.freeze([]);
}



export function projectConstructionIntentContinuations(prefix: ValidatedRuntimeEventPrefix,
  runId: string): readonly ConstructionIntentContinuation[];
/** @internal */
export function projectConstructionIntentContinuations(prefix: RuntimeEventPrefix,
  runId: string): readonly ConstructionIntentContinuation[];
export function projectConstructionIntentContinuations(prefix: RuntimeEventPrefix,
  runId: string): readonly ConstructionIntentContinuation[] {
  return Object.freeze(indexedRuntimeEvents(prefix, "kind:construction_continuation_opened")
    .filter(e => e.runId === runId).map(event => {
      if (isRecord(event.payload) && typeof event.payload.predecessorContinuationRef === "string") {
        const p = event.payload;
        const { continuationRef, continuationDigest, ...body } = p;
        const root = typeof p.parentExecutionBasisRef === "string" ? projectExactExecutionBasisAtPrefix(prefix, p.parentExecutionBasisRef) : null;
        const use = root?.constructionContinuationUse;
        const before = validatedRuntimeEventPrefixBeforeEvent(prefix, event.eventId);
        const old = use === undefined ? undefined : projectConstructionIntentContinuations(before, use.sourceRunId)
          .find(c => c.continuationRef === p.predecessorContinuationRef);
        const link = indexedRuntimeEvents(before, "kind:continuation_reentry_link_admitted").find(e =>
          isRecord(e.payload) && e.payload.plannedContinuationId === continuationRef && e.payload.predecessorContinuationId === old?.continuationRef);
        const child = typeof p.executionBasisRef === "string" ? projectExactExecutionBasisAtPrefix(before, p.executionBasisRef) : null;
        if (old?.status !== "superseded" || use?.continuationRef !== old.continuationRef || link === undefined ||
          child?.parentExecutionBasisRef !== root?.basisRef || child?.parentCCallRef !== p.parentCCallRef ||
          p.constructionIntentRef !== old.constructionIntentRef || p.constructionIntentDigest !== old.constructionIntentDigest ||
          p.intentAdmissionEventRef !== old.intentAdmissionEventRef ||
          p.preparationEvidenceEventRef !== old.preparationEvidenceEventRef || p.preparationResultRef !== old.preparationResultRef ||
          p.cCallRef !== old.cCallRef || p.preparationJudgmentRef !== old.preparationJudgmentRef ||
          hash(body) !== continuationDigest || continuationRef !== `continuation://abiogenesis/${String(continuationDigest).slice(7)}` ||
          event.aggregateId !== continuationRef || !event.causationEventRefs.includes(link.eventId))
          throw new TypeError("continued obligation lacks exact source/use/current-parent correspondence");
        const closed = indexedRuntimeEvents(prefix, "kind:construction_delta_observed").find(e => e.runId === runId &&
          e.basisId === root?.basisRef && e.admissionOrdinal > event.admissionOrdinal && isRecord(e.payload) &&
          e.payload.continuationRef === continuationRef && e.payload.constructionIntentRef === old.constructionIntentRef);
        return deepFreeze({ ...p, openedEventRef: event.eventId, terminalEventRef: closed?.eventId ?? null,
          status: closed === undefined ? "open" : "resolved" }) as unknown as ConstructionIntentContinuation;
      }
      const candidate = deriveConstructionIntentContinuations(validatedRuntimeEventPrefixBeforeEvent(prefix, event.eventId), runId)[0];
      if (candidate === undefined || !isRecord(event.payload)) throw new TypeError("construction continuation lacks its admitted failure relation");
      const { terminalEventRef: _terminal, status: _status, openedEventRef: _opened, ...body } = candidate;
      if (event.aggregateId !== candidate.continuationRef || !canonicalEquals(body, event.payload) ||
        event.causationEventRefs.length !== 1 || event.causationEventRefs[0] !== candidate.openedEventRef)
        throw new TypeError("construction continuation differs from its exact failure/input/intent identity");
      const links = indexedRuntimeEvents(prefix, "kind:continuation_reentry_link_admitted").filter(e =>
        isRecord(e.payload) && e.payload.continuationKind === "construction_intent" &&
        e.payload.predecessorContinuationId === candidate.continuationRef);
      if (links.length > 1) throw new TypeError("construction continuation has duplicate consumption");
      return deepFreeze({ ...candidate, openedEventRef: event.eventId, terminalEventRef: links[0]?.eventId ?? null,
        status: links.length === 0 ? "open" as const : "superseded" as const });
    }));
}

/** One unfinished return obligation of a pending execution, root-first. A
 * `recursion` level is an open child of an admitted non-terminal termination
 * leaf; a `workflow` level is an open child of an unreturned workflow call. */
export type PendingExecutionReturn = Readonly<{
  relation: "root" | "workflow" | "recursion";
  basisRef: string;
  basisDigest: Sha256Digest;
  frameId: string;
  graphCallId: string;
  parentCCallRef: string | null;
  entryRouteRef: string | null;
}>;
/** Replay-derived pending execution of a Run without construction composition
 * (registered selection/recursion). It grants no execution. Only an admitted
 * cursor without an opened call is `undispatched`; an opened call has no
 * attested absence of dispatch, so its effect stays `effect_unknown`. */
export type PendingExecutionContinuation = Readonly<{
  continuationKind: "pending_execution";
  continuationRef: string;
  continuationDigest: Sha256Digest;
  runId: string;
  chain: readonly PendingExecutionReturn[];
  pendingCCallRef: string | null;
  pendingCursorRef: string;
  pendingCursorDigest: Sha256Digest;
  progressedInputRef: string | null;
  progressedInputDigest: Sha256Digest | null;
  phase: "undispatched" | "effect_unknown";
  causedByEventRef: string;
  openedEventRef: string;
  terminalEventRef: string | null;
  status: "open" | "consumed";
}>;

/** Indexed cold projection over existing basis, frame, cursor, CCall, route and
 * foldback facts. Closed, failed, composed, fanned-out, ambiguous or
 * between-phase Runs (closed child without foldback, terminal without closure)
 * yield no candidate. */
function derivePendingExecutionContinuations(prefix: RuntimeEventPrefix, runId: string): readonly PendingExecutionContinuation[] {
  const rows = indexedRuntimeEvents(prefix, "run:" + runId);
  const openedRun = exactOrNull(onlyExactMatch(rows.filter(e => e.kind === "run_segment_opened")));
  if (openedRun === null || openedRun.basisId === undefined) return [];
  const root = projectExactExecutionBasisAtPrefix(prefix, openedRun.basisId);
  if (root?.basisClass !== "root" || root.constructionComposition != null ||
    indexedRuntimeEvents(prefix, "kind:run_closed").some(e => e.runId === runId) ||
    rows.some(e => e.kind === "runtime_failure_observed" && e.aggregateType === "run")) return [];
  const payload = (e: RuntimeEvent) => isRecord(e.payload) ? e.payload : {};
  const closedFrames = new Set(rows.filter(e => e.kind === "frame_closed").map(e => e.aggregateId));
  const terminalFrames = new Set(rows.filter(e => e.kind === "terminal_reached").map(e => e.aggregateId));
  const frameOf = (basisRef: string) => exactOrNull(onlyExactMatch(rows.filter(e => e.kind === "frame_opened" && e.basisId === basisRef)));
  const returned = new Set(rows.filter(e => e.kind === "c_call_result_admitted").map(e => e.aggregateId));
  const folded = new Set(rows.filter(e => e.kind === "child_foldback_admitted").map(e => payload(e).childExecutionBasisRef));
  const routeTo = (cursorRef: unknown) => rows.filter(e => e.kind === "traversal_route_admitted" && payload(e).targetCursorRef === cursorRef);
  const chain: PendingExecutionReturn[] = [];
  let basis: NonNullable<typeof root> = root, relation: PendingExecutionReturn["relation"] = "root";
  let parentCCallRef: string | null = null, entryRouteRef: string | null = null;
  for (let depth = 0; depth <= rows.length; depth++) {
    const frame = frameOf(basis.basisRef);
    if (frame === null || closedFrames.has(frame.aggregateId) || terminalFrames.has(frame.aggregateId) ||
      typeof frame.graphCallId !== "string") return [];
    chain.push(Object.freeze({ relation, basisRef: basis.basisRef, basisDigest: basis.basisDigest, frameId: frame.aggregateId,
      graphCallId: frame.graphCallId, parentCCallRef, entryRouteRef }));
    const calls = rows.filter(e => e.kind === "c_call_opened" && e.frameId === frame.aggregateId);
    const children = rows.filter(e => e.kind === "basis_admitted" && e.aggregateId === frame.aggregateId &&
      payload(e).basisClass === "child" && !folded.has(payload(e).basisRef));
    if (children.length > 1) return [];
    if (children.length === 1) {
      const child = projectExactExecutionBasisAtPrefix(prefix, String(payload(children[0]!).basisRef));
      const parentCall = child === null ? null : exactOrNull(onlyExactMatch(calls.filter(c => c.aggregateId === child.parentCCallRef)));
      if (child === null || child.basisClass !== "child" || parentCall === null) return [];
      const p = payload(parentCall);
      relation = p.callClass === "workflow" && !returned.has(parentCall.aggregateId) ? "workflow"
        : p.callClass === "leaf" && p.stageRole === "termination" && returned.has(parentCall.aggregateId) ? "recursion" : "root";
      const entry = routeTo(p.cursorRef);
      if (relation === "root" || entry.length > 1) return [];
      parentCCallRef = parentCall.aggregateId; entryRouteRef = entry[0]?.eventId ?? null; basis = child;
      continue;
    }
    const open = calls.filter(c => !returned.has(c.aggregateId));
    if (open.length > 1) return [];
    const consumed = new Set(calls.map(c => payload(c).cursorRef));
    const positions = open.length === 1 ? open : [
      ...rows.filter(e => e.kind === "traversal_cursor_entered" && e.aggregateId === frame.aggregateId && !consumed.has(payload(e).cursorRef)),
      ...rows.filter(e => e.kind === "traversal_route_admitted" && e.aggregateId === frame.aggregateId &&
        typeof payload(e).targetCursorRef === "string" && !consumed.has(payload(e).targetCursorRef))];
    const position = exactOrNull(onlyExactMatch(positions));
    if (position === null) return [];
    const pp = payload(position), pendingCCallRef = open.length === 1 ? position.aggregateId : null;
    // A returned (folded) child under the pending call is the later Result phase, not a pending dispatch.
    if (pendingCCallRef !== null && rows.some(e => e.kind === "basis_admitted" && payload(e).parentCCallRef === pendingCCallRef)) return [];
    const cursorRef = position.kind === "traversal_route_admitted" ? pp.targetCursorRef : pp.cursorRef;
    const cursorDigest = position.kind === "traversal_route_admitted" ? pp.targetCursorDigest : pp.cursorDigest;
    if (typeof cursorRef !== "string" || typeof cursorDigest !== "string") return [];
    const entered = exactOrNull(onlyExactMatch(rows.filter(e => e.kind === "traversal_cursor_entered" && payload(e).cursorRef === cursorRef)));
    const ep = entered === null ? null : payload(entered);
    const progressedInputRef = typeof ep?.inputRef === "string" ? ep.inputRef : null;
    const progressedInputDigest = typeof ep?.inputDigest === "string" ? ep.inputDigest as Sha256Digest : null;
    // An opened call may have dispatched, evidenced or started an actor without a
    // durable Result; no owner attests its absence, so its effect stays unknown.
    const phase = pendingCCallRef === null ? "undispatched" as const : "effect_unknown" as const;
    const body = { continuationKind: "pending_execution" as const, runId, chain: Object.freeze(chain), pendingCCallRef,
      pendingCursorRef: cursorRef, pendingCursorDigest: cursorDigest as Sha256Digest, progressedInputRef, progressedInputDigest,
      phase, causedByEventRef: position.eventId };
    const continuationDigest = hash(body as unknown as JsonValue), continuationRef = `continuation://abiogenesis/${continuationDigest.slice(7)}`;
    const uses = pendingExecutionOperations(prefix, continuationRef);
    if (uses.length > 1) throw new TypeError("pending execution continuation has duplicate use admissions");
    return Object.freeze([deepFreeze({ ...body, continuationRef, continuationDigest, openedEventRef: position.eventId,
      terminalEventRef: uses[0]?.eventId ?? null, status: uses.length === 0 ? "open" as const : "consumed" as const })]);
  }
  return [];
}

/** The one admitted same-Run use of an occurrence is its Public operation. */
function pendingExecutionOperations(prefix: RuntimeEventPrefix, continuationRef: string): readonly RuntimeEvent[] {
  return indexedRuntimeEvents(prefix, "kind:public_operation_admitted").filter(e => isRecord(e.payload) &&
    e.payload.continuationKind === "pending_execution" && e.payload.continuationRef === continuationRef);
}

export function projectPendingExecutionContinuations(prefix: ValidatedRuntimeEventPrefix,
  runId: string): readonly PendingExecutionContinuation[];
/** @internal */
export function projectPendingExecutionContinuations(prefix: RuntimeEventPrefix,
  runId: string): readonly PendingExecutionContinuation[];
export function projectPendingExecutionContinuations(prefix: RuntimeEventPrefix,
  runId: string): readonly PendingExecutionContinuation[] {
  return derivePendingExecutionContinuations(prefix, runId);
}

import type { LoadedProductExecutionResolution } from "../product/execution_resolution.js";
import { materializeGraph } from "../gtl/materialize.js";
import { resolveCProgramTermAtSourcePath } from "../gtl/source_path.js";
import { validateGraph } from "../validator/graph.js";
import { projectOpenedTraversalScopeForFrameAtPrefix } from "./open_call.js";
import { rehydrateExecutionBasisAtPrefix, rehydrateAdmittedImplementationSetAtPrefix,
  rehydrateAdmittedInteractionSetAtPrefix } from "./execution_basis.js";

/** @internal One admitted basis's graph, rematerialized from its own admitted
 * input coordinates and checked against its admitted graph and validation refs.
 * The one rule for every continuation preparation and HoG restoration. */
export function rematerializeAdmittedBasisGraph(basis: ExecutionBasis, graphFunction: Readonly<import("../gtl/contracts.js").GraphFunction>,
  programValidation: import("../validator/validation.js").ProgramValidation): Readonly<{ graph: ReturnType<typeof materializeGraph>;
    graphValidation: import("../validator/graph.js").GraphValidation }> | null {
  const coordinates = { invocationAdmissionRef: basis.invocationAdmissionRef, admittedInputRef: basis.rawInputAdmissionRef,
    admittedInputDigest: basis.rawInputDigest, admittedInput: basis.rawInputValue };
  const graph = materializeGraph(graphFunction, coordinates);
  const graphValidation = validateGraph(graph, programValidation, graphFunction, coordinates);
  return graphValidation.kind !== "graph_validation" || graphValidation.validationRef !== basis.graphValidationRef ||
    graph.materializationRef !== basis.graphRef || graph.materializationDigest !== basis.graphDigest ? null
    : Object.freeze({ graph, graphValidation });
}

/** @internal The occurrence's admitted pending cursor at its deepest level and
 * the input that cursor entered, which must be the projected progressed input.
 * Shared by the Public input join and HoG restoration. */
export function projectPendingCursorInputAtPrefix(prefix: RuntimeEventPrefix, pending: PendingExecutionContinuation,
  graph: ReturnType<typeof materializeGraph>, basis: ExecutionBasis, scope: Pick<OpenedTraversalScope, "graphCallId" | "frameId">) {
  const cursor = projectAdmittedTraversalCursorAtPrefix(prefix, graph, { cursorRef: pending.pendingCursorRef,
    cursorDigest: pending.pendingCursorDigest, executionBasisRef: basis.basisRef, runId: pending.runId,
    graphCallId: scope.graphCallId, frameId: scope.frameId });
  const input = cursor === null ? null : projectTraversalInputAtPrefix(prefix, graph, basis, cursor);
  return cursor === null || input === null || !isRecord(input.value) || input.inputRef !== pending.progressedInputRef ||
    input.inputDigest !== pending.progressedInputDigest ? null
    : Object.freeze({ cursor, input: input as typeof input & { readonly value: Readonly<Record<string, JsonValue>> } });
}


import { isCapabilityGrantValue, type CapabilityGrant } from "../product/invocation.js";
import { validatePublicOperationBasis, type PublicOperationAdmissionBasis } from "./environment_admission.js";
import { runtimeEventPrefixDigest } from "./event_prefix.js";
import type { RuntimeEventCandidate } from "./event_store.js";

/** Both continuation variants are workspace operations. Run-scoped sources
 * remain authenticated payload coordinates; they are never envelope causes.
 * Extra causes are passed to the unchanged event owner, never filtered/repaired. */
function constructionContinuationOperationCandidate(
  invocation: NonNullable<ReturnType<typeof projectExactInvocationAdmissionAtPrefix>>,
  grant: CapabilityGrant, basis: PublicOperationAdmissionBasis,
  selection: Readonly<Record<string, JsonValue>>,
): RuntimeEventCandidate {
  return {
    kind: "public_operation_admitted", eventTime: basis.eventTime, aggregateType: "workspace",
    aggregateId: invocation.workspaceBindingId, parentAggregateId: basis.invocationRef,
    causationEventRefs: [invocation.admissionEventRef, ...basis.causationEventRefs], correlationId: basis.correlationId,
    workflowVersion: "5.0.0", scopeClass: "workspace", basisId: invocation.authorityRef,
    payload: {
      ...selection,
      definitionDigest: basis.definitionDigest, invocationRef: basis.invocationRef,
      invocationPayloadDigest: basis.invocationPayloadDigest, invocationDigest: basis.invocationDigest,
      actorRef: grant.actorRef, authorityRef: invocation.authorityRef, authorityDigest: invocation.authorityDigest,
      capabilityGrantRefs: [grant.grantRef], capabilityGrant: grant, capabilityRef: grant.capabilityRef,
      policyRef: invocation.policyRef, policyDigest: invocation.policyDigest,
      workspaceBindingId: invocation.workspaceBindingId, workspaceBindingDigest: invocation.workspaceBindingDigest,
      catalogBasisRef: invocation.catalogBasisRef, catalogBasisDigest: invocation.catalogBasisDigest,
      catalogViewId: invocation.catalogViewId, catalogViewDigest: invocation.catalogViewDigest,
      programRef: invocation.programRef, programDigest: invocation.programDigest,
      graphFunctionRef: invocation.graphFunctionRef, graphFunctionDigest: invocation.graphFunctionDigest,
    },
  };
}

/** The shared cold envelope join consumes the already reconstructed work grant.
 * Variant owners separately authenticate their exact pending source/use facts. */
export function continuationOperationWorkspaceCorresponds(operation: RuntimeEvent,
  invocation: NonNullable<ReturnType<typeof projectExactInvocationAdmissionAtPrefix>>): boolean {
  const p = operation.payload;
  return operation.kind === "public_operation_admitted" && operation.scopeClass === "workspace" &&
    operation.runId === undefined && operation.aggregateType === "workspace" &&
    operation.aggregateId === invocation.workspaceBindingId && operation.basisId === invocation.authorityRef &&
    isRecord(p) && operation.parentAggregateId === p.invocationRef &&
    operation.causationEventRefs.includes(invocation.admissionEventRef) &&
    p.authorityRef === invocation.authorityRef && p.authorityDigest === invocation.authorityDigest;
}


import type { ExecutionBasis } from "./execution_basis.js";
import type { OpenedTraversalScope } from "./open_call.js";


import { projectAdmittedTraversalCursorAtPrefix, projectTraversalInputAtPrefix } from "./traversal_cursor.js";
import { projectAdmittedWorkspaceBindingAtCoordinate, projectWitnessedWorkspaceBindingCover } from "./worksite_revision.js";
import { boundWorkspaceMatchesExecutingToolchain } from "./environment_admission.js";

/** A selected route is the occurrence. This projection neither opens another
 * intent nor grants permission to run it. */
export type SelectedActionContinuation = {
  readonly continuationKind: "selected_action";
  readonly continuationRef: string;
  readonly continuationDigest: Sha256Digest;
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly cCallRef: string;
  readonly heldCursorRef: string;
  readonly heldCursorDigest: Sha256Digest;
  readonly executionBasisRef: string;
  readonly executionBasisDigest: Sha256Digest;
  readonly constructionIntentRef: string;
  readonly constructionIntentDigest: Sha256Digest;
  readonly selectedActionRef: string;
  readonly selectedActionDigest: Sha256Digest;
  readonly intentAdmissionEventRef: string;
  readonly causedByEventRef: string;
  readonly openedEventRef: string;
  readonly terminalEventRef: string | null;
  readonly status: "open" | "consumed" | "resolved" | "superseded" | "abandoned";
};

export function projectSelectedActionContinuations(prefix: ValidatedRuntimeEventPrefix,
  runId: string): readonly SelectedActionContinuation[];
/** @internal */
export function projectSelectedActionContinuations(prefix: RuntimeEventPrefix,
  runId: string): readonly SelectedActionContinuation[];
export function projectSelectedActionContinuations(prefix: RuntimeEventPrefix,
  runId: string): readonly SelectedActionContinuation[] {
  const selected = indexedRuntimeEventEnvelopes(prefix, "kind:construction_intent_selected")
    .filter(event => event.runId === runId);
  if (selected.length === 0) return Object.freeze([]);
  // Every later Run-local predicate consumes exactly this kind population.
  // Keep its original order, cardinality and bodies; Run membership alone does
  // not justify decoding other historical inputs or Results.
  const events = ["construction_intent_selected", "traversal_route_admitted",
    "construction_delta_observed", "c_call_opened", "run_closed", "run_stopped",
    "runtime_failure_observed"].flatMap(kind => indexedRuntimeEventEnvelopes(prefix, "kind:" + kind))
    .filter(event => event.runId === runId)
    .sort((left, right) => left.admissionOrdinal - right.admissionOrdinal)
    .map(event => runtimeEventAtPrefix(prefix, event.eventId)!);
  const operations = indexedRuntimeEvents(prefix, "kind:public_operation_admitted").filter(e =>
    isRecord(e.payload) && e.payload.continuationKind === "selected_action");
  return Object.freeze(events.filter(e => e.kind === "construction_intent_selected").flatMap(selected => {
    const p = selected.payload;
    if (!isRecord(p) || !isRecord(p.constructionIntent) || !isRecord(p.nextActionProjection) ||
      typeof selected.basisId !== "string" || typeof selected.graphCallId !== "string" || typeof selected.frameId !== "string" ||
      typeof p.targetCursorRef !== "string" || typeof p.targetCursorDigest !== "string" ||
      typeof p.constructionIntentRef !== "string" || typeof p.constructionIntentDigest !== "string" ||
      typeof p.nextActionProjectionRef !== "string" || typeof p.nextActionProjectionDigest !== "string") return [];
    const basis = projectExactExecutionBasisAtPrefix(prefix, selected.basisId);
    const route = exactOrNull(onlyExactMatch(events.filter(e => e.kind === "traversal_route_admitted" && selected.causationEventRefs.includes(e.eventId))));
    if (basis === null || basis.constructionComposition === null || route === null || !isRecord(route.payload) ||
      route.basisId !== basis.basisRef || route.frameId !== selected.frameId || route.graphCallId !== selected.graphCallId ||
      route.admissionOrdinal >= selected.admissionOrdinal || route.payload.routeRef !== p.routeRef ||
      route.payload.targetCursorRef !== p.targetCursorRef || route.payload.targetCursorDigest !== p.targetCursorDigest ||
      typeof route.payload.cCallRef !== "string" || p.constructionIntent.actionKind !== "invoke_graph_function" ||
      p.constructionIntent.runId !== runId || p.constructionIntent.executionBasisRef !== basis.basisRef ||
      p.constructionIntent.targetCursorRef !== p.targetCursorRef || p.constructionIntent.targetCursorDigest !== p.targetCursorDigest ||
      p.constructionIntent.nextActionProjectionRef !== p.nextActionProjectionRef ||
      p.constructionIntent.nextActionProjectionDigest !== p.nextActionProjectionDigest) return [];
    const { constructionIntentRef, constructionIntentDigest, ...intentBody } = p.constructionIntent;
    const { projectionRef, projectionDigest, ...selectionBody } = p.nextActionProjection;
    if (constructionIntentRef !== p.constructionIntentRef || constructionIntentDigest !== p.constructionIntentDigest ||
      hash(intentBody) !== constructionIntentDigest || projectionRef !== p.nextActionProjectionRef ||
      projectionDigest !== p.nextActionProjectionDigest || hash(selectionBody) !== projectionDigest) return [];
    const body = { continuationKind: "selected_action" as const, runId, graphCallId: selected.graphCallId,
      frameId: selected.frameId, cCallRef: route.payload.cCallRef, heldCursorRef: p.targetCursorRef,
      heldCursorDigest: p.targetCursorDigest as Sha256Digest, executionBasisRef: basis.basisRef,
      executionBasisDigest: basis.basisDigest, constructionIntentRef: p.constructionIntentRef,
      constructionIntentDigest: p.constructionIntentDigest as Sha256Digest,
      selectedActionRef: p.nextActionProjectionRef, selectedActionDigest: p.nextActionProjectionDigest as Sha256Digest,
      intentAdmissionEventRef: selected.eventId, causedByEventRef: route.eventId };
    const continuationDigest = hash(body), continuationRef = `continuation://abiogenesis/${continuationDigest.slice(7)}`;
    const superseded = exactOrNull(onlyExactMatch(indexedRuntimeEvents(prefix, "aggregate:continuation:" + continuationRef)
      .filter(e => e.kind === "continuation_superseded")));
    const delta = events.find(e => e.kind === "construction_delta_observed" && isRecord(e.payload) &&
      e.payload.constructionIntentRef === constructionIntentRef && e.payload.constructionIntentDigest === constructionIntentDigest);
    const consumption = operations.find(e => isRecord(e.payload) &&
      (e.payload.continuationRef === continuationRef || e.payload.currentContinuationRef === continuationRef));
    const call = events.find(e => e.kind === "c_call_opened" && e.frameId === selected.frameId && isRecord(e.payload) &&
      e.payload.cursorRef === p.targetCursorRef && e.payload.cursorDigest === p.targetCursorDigest);
    const departed = events.find(e => e.kind === "traversal_route_admitted" && e.frameId === selected.frameId &&
      e.admissionOrdinal > selected.admissionOrdinal);
    const terminal = events.find(e => ["run_closed", "run_stopped", "runtime_failure_observed"].includes(e.kind) && e.aggregateType === "run");
    const status: SelectedActionContinuation["status"] = superseded !== null ? "superseded" : delta !== undefined ? "resolved" :
      call !== undefined || consumption !== undefined ? "consumed" : terminal !== undefined || departed !== undefined ? "abandoned" : "open";
    return [deepFreeze({ ...body, continuationRef, continuationDigest, openedEventRef: selected.eventId,
      terminalEventRef: superseded?.eventId ?? delta?.eventId ?? consumption?.eventId ?? call?.eventId ?? terminal?.eventId ?? departed?.eventId ?? null, status })];
  }));
}

type SelectedCoordinate = Readonly<{ ref: string; digest: string }>;
export type SelectedActionUseRequest = Readonly<{ run: SelectedCoordinate; continuation: SelectedCoordinate;
  selectedAction: SelectedCoordinate; basisRelation: Readonly<{ kind: "same_basis" }> |
    Readonly<{ kind: "authority_changed"; coveringReprice: SelectedCoordinate }> }>;

export type SelectedActionUse = Readonly<{ kind: "selected_action_use"; source: SelectedActionContinuation; current: SelectedActionContinuation;
  sourceBasis: ExecutionBasis; currentBasis: ExecutionBasis; invocation: import("./invocation_admission.js").InvocationAdmission;
  coveringEventRef: string | null; request: SelectedActionUseRequest }>;
export type SelectedActionUseRefusal = { kind: "refused"; code: "missing_continuation" } | { kind: "refused"; code: "resolved_continuation" }
  | { kind: "refused"; code: "basis_mismatch" } | { kind: "refused"; code: "stale_action" }
  | { kind: "refused"; code: "action_mismatch" } | { kind: "refused"; code: "reprice_mismatch" };

function pendingSelectedOccurrence(candidates: readonly SelectedActionContinuation[], currentBasis: SelectedCoordinate): SelectedActionContinuation | null {
  const pending = candidates.filter(candidate => candidate.status === "open" &&
    candidate.executionBasisRef === currentBasis.ref && candidate.executionBasisDigest === currentBasis.digest);
  return exactOrNull(onlyExactMatch(pending));
}

/** Same owner predicate for new admission and cold operation correspondence. A
 * covering witness never substitutes for a fresh current semantic selection. */
export function selectPendingActionUse(prefix: ValidatedRuntimeEventPrefix, request: SelectedActionUseRequest, currentExecutionBasis: SelectedCoordinate | null | undefined): SelectedActionUse | SelectedActionUseRefusal;
/** @internal */
export function selectPendingActionUse(prefix: RuntimeEventPrefix, request: SelectedActionUseRequest, currentExecutionBasis: SelectedCoordinate | null | undefined): SelectedActionUse | SelectedActionUseRefusal;
export function selectPendingActionUse(prefix: RuntimeEventPrefix, request: SelectedActionUseRequest, currentExecutionBasis: SelectedCoordinate | null | undefined): SelectedActionUse | SelectedActionUseRefusal {
  const source = projectSelectedActionContinuations(prefix, request.run.ref).find(c =>
    c.continuationRef === request.continuation.ref && c.continuationDigest === request.continuation.digest);
  if (source === undefined) return { kind: "refused" as const, code: "missing_continuation" as const };
  if (source.status !== "open") return { kind: "refused" as const, code: "resolved_continuation" as const };
  const sourceScope = projectOpenedTraversalScopeForFrameAtPrefix(prefix, source.frameId);
  if (sourceScope?.runDigest !== request.run.digest) return { kind: "refused" as const, code: "basis_mismatch" as const };
  const sourceBasis = projectExactExecutionBasisAtPrefix(prefix, source.executionBasisRef);
  const selectedRows = indexedRuntimeEvents(prefix, "kind:construction_intent_selected").filter(e => isRecord(e.payload) &&
    e.payload.nextActionProjectionRef === request.selectedAction.ref && e.payload.nextActionProjectionDigest === request.selectedAction.digest);
  const candidates = selectedRows.flatMap(e => typeof e.runId === "string" ? projectSelectedActionContinuations(prefix, e.runId)
    .filter(c => c.intentAdmissionEventRef === e.eventId) : []);
  if (currentExecutionBasis == null) return { kind: "refused" as const, code: "basis_mismatch" as const };
  const current = pendingSelectedOccurrence(candidates, currentExecutionBasis);
  if (current === null) return { kind: "refused" as const, code: "stale_action" as const };
  const currentBasis = projectExactExecutionBasisAtPrefix(prefix, current.executionBasisRef);
  if (sourceBasis === null || currentBasis === null) return { kind: "refused" as const, code: "basis_mismatch" as const };
  let coveringEventRef: string | null = null;
  if (request.basisRelation.kind === "same_basis") {
    if (source.continuationRef !== current.continuationRef || sourceBasis.basisRef !== currentBasis.basisRef)
      return { kind: "refused" as const, code: "action_mismatch" as const };
  } else {
    const before = projectAdmittedWorkspaceBindingAtCoordinate(prefix, sourceBasis.workspaceBindingId, sourceBasis.workspaceBindingDigest);
    const after = projectAdmittedWorkspaceBindingAtCoordinate(prefix, currentBasis.workspaceBindingId, currentBasis.workspaceBindingDigest);
    const covers = before === null || after === null ? null : projectWitnessedWorkspaceBindingCover(prefix, before, after, [sourceBasis]);
    // The witness result coordinate is the admitted act, not a caller's assertion.
    const coordinate = request.basisRelation.coveringReprice;
    const witness = exactOrNull(onlyExactMatch(indexedRuntimeEvents(prefix, "kind:declaration_reprice_admitted").filter(e =>
      covers?.includes(e.eventId) && isRecord(e.payload) && e.payload.witnessedActRef === coordinate.ref && e.payload.witnessedActDigest === coordinate.digest)));
    const sourceEvent = indexedRuntimeEvents(prefix, "kind:construction_intent_selected").find(e => e.eventId === source.intentAdmissionEventRef);
    const currentEvent = selectedRows.find(e => e.eventId === current.intentAdmissionEventRef);
    const oldSelection = isRecord(sourceEvent?.payload) ? sourceEvent.payload.nextActionProjection : null;
    const selection = isRecord(currentEvent?.payload) ? currentEvent.payload.nextActionProjection : null;
    if (source.continuationRef === current.continuationRef || witness === null || currentEvent === undefined ||
      witness.admissionOrdinal <= (sourceEvent?.admissionOrdinal ?? Infinity) || currentEvent.admissionOrdinal <= witness.admissionOrdinal ||
      !isRecord(oldSelection) || !isRecord(selection) || !Array.isArray(selection.lawfulBasisRefs) ||
      !selection.lawfulBasisRefs.includes(source.continuationRef) || !selection.lawfulBasisRefs.includes(coordinate.ref) ||
      selection.targetOutcomeRef !== oldSelection.targetOutcomeRef || !Array.isArray(oldSelection.targetObligationRefs) ||
      !Array.isArray(selection.targetObligationRefs) || !oldSelection.targetObligationRefs.every(r => (selection.targetObligationRefs as JsonValue[]).includes(r)))
      return { kind: "refused" as const, code: "reprice_mismatch" as const };
    coveringEventRef = witness.eventId;
  }
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, currentBasis.invocationAdmissionRef);
  if (invocation === null) return { kind: "refused" as const, code: "basis_mismatch" as const };
  return Object.freeze({ kind: "selected_action_use" as const, source, current, sourceBasis, currentBasis, invocation, coveringEventRef, request });
}


/** A continuation operation's prior admission as its projector returns it: the
 * owner's fields, mutable, with `operationId` narrowed to `abg.operation.run.continue`. */
export type ContinuationOperationPriorAdmission = {
  -readonly [K in keyof import("./effectful_invocation_truth.js").EffectfulPublicInvocationPriorAdmission]: K extends "operationId"
    ? "abg.operation.run.continue" : import("./effectful_invocation_truth.js").EffectfulPublicInvocationPriorAdmission[K] };

/** Cold validation consumes the same admission relation at its actual predecessor. */
export function projectSelectedActionOperation(prefix: ValidatedRuntimeEventPrefix, operation: RuntimeEvent): ContinuationOperationPriorAdmission | null;
/** @internal */
export function projectSelectedActionOperation(prefix: RuntimeEventPrefix, operation: RuntimeEvent): ContinuationOperationPriorAdmission | null;
export function projectSelectedActionOperation(prefix: RuntimeEventPrefix, operation: RuntimeEvent): ContinuationOperationPriorAdmission | null {
  const p = operation.payload;
  if (operation.kind !== "public_operation_admitted" || !isRecord(p) || p.continuationKind !== "selected_action" ||
    p.operationId !== "abg.operation.run.continue" || p.memberKey !== "selected_action" ||
    typeof p.sourceRunId !== "string" || typeof p.sourceRunDigest !== "string" ||
    typeof p.continuationRef !== "string" || typeof p.continuationDigest !== "string" ||
    typeof p.selectedActionRef !== "string" || typeof p.selectedActionDigest !== "string" ||
    typeof p.executionBasisRef !== "string" || typeof p.executionBasisDigest !== "string" ||
    !isRecord(p.basisRelation) || (p.basisRelation.kind !== "same_basis" &&
      (p.basisRelation.kind !== "authority_changed" || !isRecord(p.basisRelation.coveringReprice))) ||
    !isCapabilityGrantValue(p.capabilityGrant) || typeof p.invocationRef !== "string" || typeof p.invocationDigest !== "string") return null;
  const before = validatedRuntimeEventPrefixBeforeEvent(prefix, operation.eventId);
  const use = selectPendingActionUse(before, { run: { ref: p.sourceRunId, digest: p.sourceRunDigest },
    continuation: { ref: p.continuationRef, digest: p.continuationDigest }, selectedAction: { ref: p.selectedActionRef, digest: p.selectedActionDigest },
    basisRelation: p.basisRelation as unknown as SelectedActionUseRequest["basisRelation"] },
    { ref: p.executionBasisRef, digest: p.executionBasisDigest });
  if (use.kind !== "selected_action_use" || p.currentContinuationRef !== use.current.continuationRef ||
    p.currentContinuationDigest !== use.current.continuationDigest || p.currentRunId !== use.current.runId ||
    p.currentIntentRef !== use.current.constructionIntentRef || p.currentIntentDigest !== use.current.constructionIntentDigest ||
    p.executionBasisRef !== use.currentBasis.basisRef || p.executionBasisDigest !== use.currentBasis.basisDigest ||
    p.authorityRef !== use.invocation.authorityRef || p.authorityDigest !== use.invocation.authorityDigest ||
    p.policyRef !== use.invocation.policyRef || p.policyDigest !== use.invocation.policyDigest ||
    p.actorRef !== use.invocation.actorRef || p.capabilityGrant.actorRef !== use.invocation.actorRef ||
    p.capabilityGrant.policyRef !== use.invocation.policyRef || p.capabilityGrant.operationId !== "abg.operation.run.continue" ||
    !continuationOperationWorkspaceCorresponds(operation, use.invocation) ||
    (use.coveringEventRef !== null && !operation.causationEventRefs.includes(use.coveringEventRef))) return null;
  return { operationId: "abg.operation.run.continue" as const, publicInvocationRef: p.invocationRef,
    ownerInvocationRef: p.invocationRef, ownerInvocationDigest: p.invocationDigest as Sha256Digest,
    publicOperationEventRef: operation.eventId, admissionEventRef: operation.eventId };
}

/** A same-Run use of one replay-derived pending execution. The request names
 * the exact occurrence, its pending cursor, its progressed input and the root
 * basis; it supplies no frame, cursor, input or return obligation. */
export type PendingExecutionUseRequest = Readonly<{ run: SelectedCoordinate; continuation: SelectedCoordinate;
  pendingCursor: SelectedCoordinate; continuationInput: SelectedCoordinate; expectedBasis: SelectedCoordinate }>;
export type PendingExecutionUseRefusal = Readonly<{ kind: "refused";
  code: "missing_continuation" | "resolved_continuation" | "response_mismatch" | "basis_mismatch" | "replay_mismatch"; path: string }>;
export type PendingExecutionUse = Readonly<{ kind: "pending_execution_use"; source: PendingExecutionContinuation;
  rootBasis: ExecutionBasis; rootScope: OpenedTraversalScope; invocation: import("./invocation_admission.js").InvocationAdmission;
  request: PendingExecutionUseRequest; predecessorDigest: Sha256Digest }>;

/** The use request naming one projected pending position: its Run with the
 * opened root scope's digest, its cursor, its progressed input and its root
 * basis. A position without progressed input (an effect_unknown cut) names the
 * literal `none` coordinate; the use refuses that position on its effect first. */
export function projectPendingExecutionUseRequest(prefix: ValidatedRuntimeEventPrefix,
  pending: PendingExecutionContinuation): PendingExecutionUseRequest | null;
/** @internal */
export function projectPendingExecutionUseRequest(prefix: RuntimeEventPrefix,
  pending: PendingExecutionContinuation): PendingExecutionUseRequest | null;
export function projectPendingExecutionUseRequest(prefix: RuntimeEventPrefix,
  pending: PendingExecutionContinuation): PendingExecutionUseRequest | null {
  const root = pending.chain[0];
  const scope = root === undefined ? null : projectOpenedTraversalScopeForFrameAtPrefix(prefix, root.frameId);
  if (root === undefined || scope === null) return null;
  const coordinate = (ref: string, digest: string) => Object.freeze({ ref, digest });
  return Object.freeze({
    run: coordinate(pending.runId, scope.runDigest),
    continuation: coordinate(pending.continuationRef, pending.continuationDigest),
    pendingCursor: coordinate(pending.pendingCursorRef, pending.pendingCursorDigest),
    continuationInput: coordinate(pending.progressedInputRef ?? "none", pending.progressedInputDigest ?? sha256Canonical("none")),
    expectedBasis: coordinate(root.basisRef, root.basisDigest),
  });
}

const pendingExecutionUses = new WeakSet<object>();
/** Same owner predicate for new admission and cold operation correspondence.
 * The occurrence stays in its own Run: no replacement basis, scope, cursor or
 * cross-Run holder relation is constructed. */
export function selectPendingExecutionUse(prefix: ValidatedRuntimeEventPrefix,
  request: PendingExecutionUseRequest): PendingExecutionUse | PendingExecutionUseRefusal;
/** @internal */
export function selectPendingExecutionUse(prefix: RuntimeEventPrefix,
  request: PendingExecutionUseRequest): PendingExecutionUse | PendingExecutionUseRefusal;
export function selectPendingExecutionUse(prefix: RuntimeEventPrefix,
  request: PendingExecutionUseRequest): PendingExecutionUse | PendingExecutionUseRefusal {
  const refuse = (code: PendingExecutionUseRefusal["code"], path: string): PendingExecutionUseRefusal =>
    Object.freeze({ kind: "refused" as const, code, path });
  if (pendingExecutionOperations(prefix, request.continuation.ref).length !== 0) return refuse("resolved_continuation", "/continuation");
  const source = projectPendingExecutionContinuations(prefix, request.run.ref).find(c =>
    c.continuationRef === request.continuation.ref && c.continuationDigest === request.continuation.digest);
  if (source === undefined) return refuse("missing_continuation", "/continuation");
  const root = source.chain[0]!, rootScope = projectOpenedTraversalScopeForFrameAtPrefix(prefix, root.frameId);
  if (rootScope === null || rootScope.runId !== source.runId || rootScope.runDigest !== request.run.digest) return refuse("basis_mismatch", "/run");
  if (request.expectedBasis.ref !== root.basisRef || request.expectedBasis.digest !== root.basisDigest) return refuse("basis_mismatch", "/expectedBasis");
  // An opened call's dispatch is not attested absent; its unknown effect is kept.
  if (source.phase !== "undispatched") return refuse("replay_mismatch", "/continuation/effect");
  if (request.pendingCursor.ref !== source.pendingCursorRef || request.pendingCursor.digest !== source.pendingCursorDigest)
    return refuse("response_mismatch", "/pendingCursor");
  if (source.progressedInputRef === null || request.continuationInput.ref !== source.progressedInputRef ||
    request.continuationInput.digest !== source.progressedInputDigest) return refuse("response_mismatch", "/continuationInput");
  const rootBasis = rehydrateExecutionBasisAtPrefix(prefix, root.basisRef);
  const invocation = rootBasis === null ? null : projectExactInvocationAdmissionAtPrefix(prefix, rootBasis.invocationAdmissionRef);
  if (rootBasis === null || rootBasis.basisClass !== "root" || rootBasis.basisDigest !== root.basisDigest ||
    rootBasis.constructionContinuationUse !== undefined || invocation === null) return refuse("basis_mismatch", "/invocationAuthority");
  const use: PendingExecutionUse = Object.freeze({ kind: "pending_execution_use" as const, source, rootBasis, rootScope, invocation,
    request: Object.freeze({ ...request }), predecessorDigest: runtimeEventPrefixDigest(prefix) });
  pendingExecutionUses.add(use);
  return use;
}

/** Admit the one workspace use. Its payload binds the occurrence, pending
 * cursor, progressed input and root basis; Run truth stays with HoG/ABG owners. */
export function admitPendingExecutionContinuationOperation(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate,
  use: PendingExecutionUse, grant: CapabilityGrant, basis: PublicOperationAdmissionBasis) {
  const { invocation, source, rootBasis, request } = use;
  if (!pendingExecutionUses.has(use) || runtimeEventPrefixDigest(readOwnedRuntimeEventPrefixAtDurablePrefix(predecessorPrefix)) !== use.predecessorDigest ||
    !boundWorkspaceMatchesExecutingToolchain(predecessorPrefix, {ref: invocation.workspaceBindingId, digest: invocation.workspaceBindingDigest}) ||
    validatePublicOperationBasis(basis, "abg.operation.run.continue", "current_intent") !== null ||
    !isCapabilityGrantValue(grant) || grant.operationId !== "abg.operation.run.continue" || grant.actorRef !== invocation.actorRef ||
    grant.policyRef !== invocation.policyRef || basis.authorityScopeRef !== invocation.workspaceBindingId ||
    basis.authorityScopeDigest !== invocation.workspaceBindingDigest)
    throw new TypeError("pending-execution use requires its exact occurrence and separate operation authority");
  return admitRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => admitRuntimeEvent(store,
    constructionContinuationOperationCandidate(invocation, grant, basis, {
      operationId: "abg.operation.run.continue", memberKey: "current_intent", variant: "pending_execution",
      continuationKind: "pending_execution", continuationRef: source.continuationRef, continuationDigest: source.continuationDigest,
      sourceRunId: source.runId, sourceRunDigest: request.run.digest,
      pendingCursorRef: source.pendingCursorRef, pendingCursorDigest: source.pendingCursorDigest,
      continuationInputRef: request.continuationInput.ref, continuationInputDigest: request.continuationInput.digest,
      executionBasisRef: rootBasis.basisRef, executionBasisDigest: rootBasis.basisDigest,
    })));
}

/** Cold validation consumes the same use predicate at the operation's actual predecessor. */
export function projectPendingExecutionOperation(prefix: ValidatedRuntimeEventPrefix, operation: RuntimeEvent): ContinuationOperationPriorAdmission | null;
/** @internal */
export function projectPendingExecutionOperation(prefix: RuntimeEventPrefix, operation: RuntimeEvent): ContinuationOperationPriorAdmission | null;
export function projectPendingExecutionOperation(prefix: RuntimeEventPrefix, operation: RuntimeEvent): ContinuationOperationPriorAdmission | null {
  const p = operation.payload;
  const text = (key: string) => isRecord(p) && typeof p[key] === "string" ? p[key] as string : null;
  if (operation.kind !== "public_operation_admitted" || !isRecord(p) || p.continuationKind !== "pending_execution" ||
    p.operationId !== "abg.operation.run.continue" || p.memberKey !== "current_intent" || p.variant !== "pending_execution" ||
    ["sourceRunId", "sourceRunDigest", "continuationRef", "continuationDigest", "pendingCursorRef", "pendingCursorDigest",
      "continuationInputRef", "continuationInputDigest", "executionBasisRef", "executionBasisDigest", "invocationRef", "invocationDigest"]
      .some(key => text(key) === null) || !isCapabilityGrantValue(p.capabilityGrant)) return null;
  const before = validatedRuntimeEventPrefixBeforeEvent(prefix, operation.eventId);
  const use = selectPendingExecutionUse(before, { run: { ref: text("sourceRunId")!, digest: text("sourceRunDigest")! },
    continuation: { ref: text("continuationRef")!, digest: text("continuationDigest")! },
    pendingCursor: { ref: text("pendingCursorRef")!, digest: text("pendingCursorDigest")! },
    continuationInput: { ref: text("continuationInputRef")!, digest: text("continuationInputDigest")! },
    expectedBasis: { ref: text("executionBasisRef")!, digest: text("executionBasisDigest")! } });
  if (use.kind !== "pending_execution_use" ||
    p.authorityRef !== use.invocation.authorityRef || p.authorityDigest !== use.invocation.authorityDigest ||
    p.policyRef !== use.invocation.policyRef || p.policyDigest !== use.invocation.policyDigest ||
    p.actorRef !== use.invocation.actorRef || p.capabilityGrant.actorRef !== use.invocation.actorRef ||
    p.capabilityGrant.policyRef !== use.invocation.policyRef || p.capabilityGrant.operationId !== "abg.operation.run.continue" ||
    !continuationOperationWorkspaceCorresponds(operation, use.invocation)) return null;
  return { operationId: "abg.operation.run.continue" as const, publicInvocationRef: text("invocationRef")!,
    ownerInvocationRef: text("invocationRef")!, ownerInvocationDigest: text("invocationDigest") as Sha256Digest,
    publicOperationEventRef: operation.eventId, admissionEventRef: operation.eventId };
}

/** Root runtime truth for one selected use: the admitted root basis, scope and
 * root sets, with the root graph rematerialized against the loaded Product
 * resolution. Child levels stay admitted truth restored by HoG. */
export function preparePendingExecutionContinuation(prefix: ValidatedRuntimeEventPrefix,
  use: PendingExecutionUse, resolution: LoadedProductExecutionResolution): Readonly<{
    use: PendingExecutionUse;
    root: ExecutionBasis;
    graph: Readonly<import("../index.js").GtlGraph>;
    graphValidation: import("../validator/graph.js").GraphValidation;
    scope: OpenedTraversalScope;
    implementationSet: import("./execution_basis.js").AdmittedImplementationSet;
    interactionSet: import("./execution_basis.js").AdmittedInteractionSet;
    resolution: LoadedProductExecutionResolution;
  }> | null;
/** @internal */
export function preparePendingExecutionContinuation(prefix: RuntimeEventPrefix,
  use: PendingExecutionUse, resolution: LoadedProductExecutionResolution): Readonly<{
    use: PendingExecutionUse;
    root: ExecutionBasis;
    graph: Readonly<import("../index.js").GtlGraph>;
    graphValidation: import("../validator/graph.js").GraphValidation;
    scope: OpenedTraversalScope;
    implementationSet: import("./execution_basis.js").AdmittedImplementationSet;
    interactionSet: import("./execution_basis.js").AdmittedInteractionSet;
    resolution: LoadedProductExecutionResolution;
  }> | null;
export function preparePendingExecutionContinuation(prefix: RuntimeEventPrefix,
  use: PendingExecutionUse, resolution: LoadedProductExecutionResolution): Readonly<{
    use: PendingExecutionUse;
    root: ExecutionBasis;
    graph: Readonly<import("../index.js").GtlGraph>;
    graphValidation: import("../validator/graph.js").GraphValidation;
    scope: OpenedTraversalScope;
    implementationSet: import("./execution_basis.js").AdmittedImplementationSet;
    interactionSet: import("./execution_basis.js").AdmittedInteractionSet;
    resolution: LoadedProductExecutionResolution;
  }> | null {
  const root = use.rootBasis;
  if (!pendingExecutionUses.has(use) || root.programRef !== resolution.program.programRef || root.programDigest !== hash(resolution.program) ||
    root.programValidationRef !== resolution.programValidation.validationRef || root.graphFunctionRef !== resolution.graphFunction.name) return null;
  const rematerialized = rematerializeAdmittedBasisGraph(root, resolution.graphFunction, resolution.programValidation);
  const implementationSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, root.rootImplementationSetRef);
  const interactionSet = rehydrateAdmittedInteractionSetAtPrefix(prefix, root.rootInteractionSetRef);
  if (rematerialized === null || implementationSet === null || interactionSet === null) return null;
  return Object.freeze({ use, root, graph: rematerialized.graph, graphValidation: rematerialized.graphValidation, scope: use.rootScope,
    implementationSet, interactionSet, resolution });
}

/** The deepest pending level's actual input carrier and progressed input, for
 * joining exact Public input authority before admission. */
export function projectPendingExecutionInputAtPrefix(prefix: ValidatedRuntimeEventPrefix, use: PendingExecutionUse,
  graphFunctionByRef: (graphFunctionRef: string) => Readonly<import("../gtl/contracts.js").GraphFunction> | null,
  programValidation: import("../validator/validation.js").ProgramValidation): Readonly<{
    inputCarrierRef: string; input: import("./traversal_cursor.js").TraversalInputOrigin }> | null;
/** @internal */
export function projectPendingExecutionInputAtPrefix(prefix: RuntimeEventPrefix, use: PendingExecutionUse,
  graphFunctionByRef: (graphFunctionRef: string) => Readonly<import("../gtl/contracts.js").GraphFunction> | null,
  programValidation: import("../validator/validation.js").ProgramValidation): Readonly<{
    inputCarrierRef: string; input: import("./traversal_cursor.js").TraversalInputOrigin }> | null;
export function projectPendingExecutionInputAtPrefix(prefix: RuntimeEventPrefix, use: PendingExecutionUse,
  graphFunctionByRef: (graphFunctionRef: string) => Readonly<import("../gtl/contracts.js").GraphFunction> | null,
  programValidation: import("../validator/validation.js").ProgramValidation): Readonly<{
    inputCarrierRef: string; input: import("./traversal_cursor.js").TraversalInputOrigin }> | null {
  const level = use.source.chain.at(-1)!;
  const basis = rehydrateExecutionBasisAtPrefix(prefix, level.basisRef);
  const graphFunction = basis === null ? null : graphFunctionByRef(basis.graphFunctionRef);
  if (!pendingExecutionUses.has(use) || basis === null || graphFunction === null || basis.basisDigest !== level.basisDigest) return null;
  const rematerialized = rematerializeAdmittedBasisGraph(basis, graphFunction, programValidation);
  const scope = projectOpenedTraversalScopeForFrameAtPrefix(prefix, level.frameId);
  const pending = rematerialized === null || scope === null ? null
    : projectPendingCursorInputAtPrefix(prefix, use.source, rematerialized.graph, basis, scope);
  const term = pending === null ? null : resolveCProgramTermAtSourcePath(rematerialized!.graph.template, pending.cursor.currentNodeRef, pending.cursor.termPath);
  if (pending === null || term === null || !("inputCarrierRef" in term) || typeof term.inputCarrierRef !== "string") return null;
  return Object.freeze({ inputCarrierRef: term.inputCarrierRef, input: pending.input });
}
