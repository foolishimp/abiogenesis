import type { JsonValue } from "../shared/canonical_json.js";
import { isRecord } from "../shared/admission_predicates.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isUndispatchedOwnerObservation } from "./event_contract_profiles.js";
import { indexedRuntimeEvents, selectValidatedRuntimeEventPrefix, validatedRuntimeEventPrefixBeforeEvent, type ValidatedRuntimeEventPrefix } from "./event_prefix.js";
import { admitRuntimeEvent, admitRuntimeEventTransactionAtDurablePrefix, readRuntimeEventsAtDurablePrefix, type AbgEventStore, type DurablePrefixCoordinate, type RuntimeEvent } from "./event_store.js";
import { projectExactExecutionBasisAtPrefix, projectExactInvocationAdmissionAtPrefix } from "./invocation_execution_truth.js";

/** A projection of an actual selected but undispatched consumer. It grants no
 * execution. Declaration, support, input and current-operation admission remain
 * required before any replacement scope can be opened. */
export interface ConstructionIntentContinuation {
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
}
const hash = (value: unknown) => sha256Canonical(value as JsonValue);
const one = (rows: readonly RuntimeEvent[]) => rows.length === 1 ? rows[0]! : null;

/** Indexed cold projection; arbitrary failure text and F_D failure do not apply. */
function deriveConstructionIntentContinuations(
  prefix: ValidatedRuntimeEventPrefix, runId: string,
): readonly ConstructionIntentContinuation[] {
  const rows = indexedRuntimeEvents(prefix, "run:" + runId);
  const openedRun = one(rows.filter(e => e.kind === "run_segment_opened"));
  if (openedRun === null || openedRun.basisId === undefined ||
    projectExactExecutionBasisAtPrefix(prefix, openedRun.basisId)?.constructionComposition == null) return [];
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
    const opened = one(callRows.filter(e => e.kind === "c_call_opened"));
    const fibre = one(callRows.filter(e => e.kind === "c_call_fibre_selected"));
    const result = one(callRows.filter(e => e.kind === "c_call_result_admitted"));
    const judgment = one(callRows.filter(e => e.kind === "c_call_judged"));
    if (opened === null || fibre === null || result === null || judgment === null ||
      !isRecord(opened.payload) || !isRecord(fibre.payload) || !isRecord(result.payload) || !isRecord(judgment.payload) ||
      opened.payload.callClass !== "leaf" || fibre.payload.regime !== "F_P" ||
      fibre.payload.implementationRef !== observation.implementationRef ||
      result.payload.resultClass !== "failure" || judgment.payload.judgment !== "blocked" ||
      result.payload.valueDigest !== hash(p.failureValue) || result.payload.valueDigest !== p.outputDigest ||
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
    const parentOpen = one(indexedRuntimeEvents(prefix, "aggregate:c_call:" + basis.parentCCallRef)
      .filter(e => e.kind === "c_call_opened"));
    if (invocation === null || parentOpen === null || !isRecord(parentOpen.payload) ||
      parentOpen.runId !== runId || parentOpen.payload.callClass !== "workflow" ||
      parentOpen.payload.childGraphFunctionRef !== basis.graphFunctionRef) continue;
    const parentCursorRef = parentOpen.payload.cursorRef;
    const intentEvent = one(indexedRuntimeEvents(prefix, "kind:construction_intent_selected").filter(e =>
      e.runId === runId && e.basisId === parent.basisRef && isRecord(e.payload) &&
      e.payload.targetCursorRef === parentCursorRef));
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


/** The existing failure is the cause; this event admits unresolved obligation,
 * not a retry decision. It can be opened after Run activity has terminated. */
export function admitPendingConstructionIntentContinuation(store: AbgEventStore,
  predecessorPrefix: DurablePrefixCoordinate, runId: string, eventTime: string, correlationId: string): DurablePrefixCoordinate {
  const prefix = selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(predecessorPrefix));
  const candidate = deriveConstructionIntentContinuations(prefix, runId)[0];
  if (candidate === undefined || indexedRuntimeEvents(prefix, "kind:construction_continuation_opened")
    .some(e => e.aggregateId === candidate.continuationRef)) return predecessorPrefix;
  const { terminalEventRef: _terminal, status: _status, openedEventRef: _opened, ...body } = candidate;
  return admitRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => admitRuntimeEvent(store, {
    kind: "construction_continuation_opened", eventTime, aggregateType: "continuation", aggregateId: candidate.continuationRef,
    parentAggregateId: candidate.frameId, causationEventRefs: [candidate.openedEventRef], correlationId,
    workflowVersion: "5.0.0", scopeClass: "run", basisId: candidate.executionBasisRef,
    runId, graphCallId: candidate.graphCallId, frameId: candidate.frameId, payload: body as unknown as JsonValue,
  })).successorPrefix!;
}

export function projectConstructionIntentContinuations(prefix: ValidatedRuntimeEventPrefix,
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
      if (event.aggregateId !== candidate.continuationRef || hash(body) !== hash(event.payload) ||
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

import type { LoadedProductExecutionResolution } from "../product/execution_resolution.js";
import { materializeGraph } from "../gtl/materialize.js";
import { resolveCProgramTermAtSourcePath } from "../gtl/source_path.js";
import { validateGraph } from "../validator/graph.js";
import { projectOpenedCCallCarrierAtPrefix } from "./c_call.js";
import { projectOpenedCCallTraversalInputAtPrefix } from "./traversal_cursor.js";
import { projectOpenedTraversalScopeForFrameAtPrefix } from "./open_call.js";
import { rehydrateExecutionBasisAtPrefix, rehydrateAdmittedImplementationSetAtPrefix,
  rehydrateAdmittedInteractionSetAtPrefix } from "./execution_basis.js";
import { rehydrateConstructionIntentForCursorAtPrefix } from "./traversal_route.js";

const preparedRelations = new WeakSet<object>();
/** Exact declaration/application preflight. Only immutable pure producer
 * support is selected here; mutable/opaque dependency claims need their owning
 * validity relation and are outside this bounded entry. */
export function prepareConstructionIntentContinuation(
  prefix: ValidatedRuntimeEventPrefix, selected: ConstructionIntentContinuation,
  resolution: LoadedProductExecutionResolution,
) {
  const current = projectConstructionIntentContinuations(prefix, selected.runId)
    .find(c => c.continuationRef === selected.continuationRef && c.continuationDigest === selected.continuationDigest);
  if (current?.status !== "open" || hash(current) !== hash(selected)) return null;
  const root = rehydrateExecutionBasisAtPrefix(prefix, current.parentExecutionBasisRef);
  const child = rehydrateExecutionBasisAtPrefix(prefix, current.executionBasisRef);
  if (root === null || child === null || root.basisClass !== "root" || root.constructionContinuationUse !== undefined ||
    child.parentExecutionBasisRef !== root.basisRef || child.parentCCallRef !== current.parentCCallRef ||
    root.programRef !== resolution.program.programRef || root.programDigest !== hash(resolution.program) ||
    root.programValidationRef !== resolution.programValidation.validationRef ||
    root.graphFunctionRef !== resolution.graphFunction.name) return null;
  const childFunctions = resolution.declarationPublications.flatMap(p => p.graphFunctions).filter(g =>
    g.name === child.graphFunctionRef && hash(g) === child.graphFunctionDigest);
  if (childFunctions.length !== 1) return null;
  const childFunction = childFunctions[0]!;
  // The first boundary is a scalar sequence with no effectful producer or
  // hidden composite allowances. F_P means judgment, not native effect authority.
  if (childFunction.effects.length !== 0 || childFunction.template.applications.length !== 0 ||
    childFunction.template.nodes.length !== 1) return null;
  const rootGraph = materializeGraph(resolution.graphFunction, { invocationAdmissionRef: root.invocationAdmissionRef,
    admittedInputRef: root.rawInputAdmissionRef, admittedInputDigest: root.rawInputDigest, admittedInput: root.rawInputValue });
  const childGraph = materializeGraph(childFunction, { invocationAdmissionRef: child.invocationAdmissionRef,
    admittedInputRef: child.rawInputAdmissionRef, admittedInputDigest: child.rawInputDigest, admittedInput: child.rawInputValue });
  const validate = (graph: typeof rootGraph, fn: typeof childFunction, basis: typeof child) => {
    const validation = validateGraph(graph, resolution.programValidation, fn, { invocationAdmissionRef: basis.invocationAdmissionRef,
      admittedInputRef: basis.rawInputAdmissionRef, admittedInputDigest: basis.rawInputDigest, admittedInput: basis.rawInputValue });
    return validation.kind === "graph_validation" && validation.validationRef === basis.graphValidationRef &&
      graph.materializationRef === basis.graphRef && graph.materializationDigest === basis.graphDigest ? validation : null;
  };
  const rootValidation = validate(rootGraph, resolution.graphFunction, root), childValidation = validate(childGraph, childFunction, child);
  if (rootValidation === null || childValidation === null) return null;
  const pending = projectOpenedCCallTraversalInputAtPrefix(prefix, childGraph, current.cCallRef);
  const parent = projectOpenedCCallTraversalInputAtPrefix(prefix, rootGraph, current.parentCCallRef);
  if (pending === null || parent === null || pending.execution.basisRef !== child.basisRef ||
    parent.execution.basisRef !== root.basisRef || pending.cursor.cursorRef !== current.heldCursorRef ||
    pending.cursor.cursorDigest !== current.heldCursorDigest || pending.cursor.attempt !== 1 || parent.cursor.attempt !== 1 ||
    pending.cursor.retryPath.length !== 0 || parent.cursor.retryPath.length !== 0 ||
    pending.cursor.taskOrdinal !== null || parent.cursor.taskOrdinal !== null) return null;
  const intent = rehydrateConstructionIntentForCursorAtPrefix(prefix, parent.cursor);
  const parentTerm = resolveCProgramTermAtSourcePath(rootGraph.template, parent.cursor.currentNodeRef, parent.cursor.termPath);
  const pendingTerm = resolveCProgramTermAtSourcePath(childGraph.template, pending.cursor.currentNodeRef, pending.cursor.termPath);
  if (intent === null || intent.constructionIntentRef !== current.constructionIntentRef ||
    intent.constructionIntentDigest !== current.constructionIntentDigest || intent.actionKind !== "invoke_graph_function" ||
    intent.selectedGraphFunctionRef !== child.graphFunctionRef || parentTerm.kind !== "c_workflow" ||
    parentTerm.graphFunctionRef !== child.graphFunctionRef || pendingTerm.kind !== "c_of" || pendingTerm.fibre !== "F_P") return null;
  const parentCall = projectOpenedCCallCarrierAtPrefix(prefix, rootGraph, current.parentCCallRef,
    parent.cursor, resolution.graphFunction, childFunction, resolution.programValidation);
  const failedCall = projectOpenedCCallCarrierAtPrefix(prefix, childGraph, current.cCallRef);
  const producer = pending.input.event;
  if (parentCall === null || failedCall === null || producer?.kind !== "c_call_result_admitted" || producer.basisId !== child.basisRef ||
    producer.runId !== selected.runId || !isRecord(producer.payload) || producer.payload.resultClass !== "success" ||
    producer.payload.resultRef !== pending.input.inputRef || producer.payload.valueDigest !== pending.input.inputDigest ||
    pending.input.retained === true || !isRecord(pending.input.value) || !isRecord(parent.input.value)) return null;
  const producerCall = projectOpenedCCallCarrierAtPrefix(prefix, childGraph, producer.aggregateId);
  const supportRows = indexedRuntimeEvents(prefix, "aggregate:c_call:" + producer.aggregateId);
  const supportJudgment = one(supportRows.filter(e => e.kind === "c_call_judged"));
  const supportEvidence = supportRows.filter(e => e.kind === "c_call_evidenced");
  if (producerCall?.regime !== "F_D" || supportJudgment === null || !isRecord(supportJudgment.payload) ||
    supportJudgment.payload.judgment !== "advance" || supportJudgment.payload.resultRef !== producer.payload.resultRef ||
    supportEvidence.length === 0 || supportEvidence.some(e => !isRecord(e.payload) || e.payload.evidenceClass !== "deterministic")) return null;
  const rootScope = projectOpenedTraversalScopeForFrameAtPrefix(prefix, parent.cursor.frameId);
  const childScope = projectOpenedTraversalScopeForFrameAtPrefix(prefix, pending.cursor.frameId);
  const implementationSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, root.rootImplementationSetRef);
  const interactionSet = rehydrateAdmittedInteractionSetAtPrefix(prefix, root.rootInteractionSetRef);
  const invocation = projectExactInvocationAdmissionAtPrefix(prefix, root.invocationAdmissionRef);
  if (rootScope === null || childScope === null || implementationSet === null || interactionSet === null || invocation === null) return null;
  const prepared = Object.freeze({ continuation: current, root, child, rootGraph, childGraph, rootValidation, childValidation,
    childFunction, rootScope, childScope, parent, pending, parentTerm, pendingTerm, failedCall, producerCall, producer,
    intent, invocation, implementationSet, interactionSet, resolution, parentCall,
    parentInput: parent.input.value, pendingInput: pending.input.value });
  preparedRelations.add(prepared);
  return prepared;
}
export type PreparedConstructionIntentContinuation = NonNullable<ReturnType<typeof prepareConstructionIntentContinuation>>;

import { isCapabilityGrantValue, type CapabilityGrant } from "../product/invocation.js";
import { validatePublicOperationBasis, type PublicOperationAdmissionBasis } from "./environment_admission.js";
import { projectEffectfulPublicInvocationTruthAtPrefix } from "./effectful_invocation_truth.js";
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
      capabilityGrantRefs: [grant.grantRef], capabilityGrant: grant as unknown as JsonValue, capabilityRef: grant.capabilityRef,
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

const preparedOperations = new WeakSet<object>();
export function prepareConstructionContinuationOperation(prefix: ValidatedRuntimeEventPrefix,
  prepared: PreparedConstructionIntentContinuation, grant: CapabilityGrant, basis: PublicOperationAdmissionBasis) {
  const { invocation, continuation } = prepared;
  const truth = projectEffectfulPublicInvocationTruthAtPrefix(prefix, basis.invocationRef);
  if (truth.disposition !== "available") return truth;
  if (!preparedRelations.has(prepared) || validatePublicOperationBasis(basis, "abg.operation.run.continue", "current_intent") !== null ||
    !isCapabilityGrantValue(grant) || grant.operationId !== "abg.operation.run.continue" ||
    grant.actorRef !== invocation.actorRef || grant.policyRef !== invocation.policyRef ||
    basis.authorityScopeRef !== invocation.workspaceBindingId || basis.authorityScopeDigest !== invocation.workspaceBindingDigest ||
    projectConstructionIntentContinuations(prefix, continuation.runId).find(c => c.continuationRef === continuation.continuationRef)?.status !== "open" ||
    indexedRuntimeEvents(prefix, "kind:basis_admitted").some(e => isRecord(e.payload) &&
      isRecord(e.payload.constructionContinuationUse) && e.payload.constructionContinuationUse.continuationRef === continuation.continuationRef))
    throw new TypeError("current-intent admission requires unused exact pending work and a new admitted-operation grant");
  const candidate = constructionContinuationOperationCandidate(invocation, grant, basis, {
    operationId: "abg.operation.run.continue", memberKey: "current_intent", variant: "current_intent",
    continuationKind: "construction_intent", continuationRef: continuation.continuationRef,
    continuationDigest: continuation.continuationDigest, currentIntentRef: continuation.constructionIntentRef,
    currentIntentDigest: continuation.constructionIntentDigest,
  });
  const plan = Object.freeze({ kind: "prepared_construction_continuation_operation" as const,
    prepared, candidate, predecessorDigest: runtimeEventPrefixDigest(prefix) });
  preparedOperations.add(plan);
  return plan;
}
export type PreparedConstructionContinuationOperation = Extract<ReturnType<typeof prepareConstructionContinuationOperation>,
  { kind: "prepared_construction_continuation_operation" }>;
export function isPreparedConstructionContinuationOperation(value: object): value is PreparedConstructionContinuationOperation {
  return preparedOperations.has(value);
}

import type { ExecutionBasis, RuntimeAdmissionBasis } from "./execution_basis.js";
import type { OpenedTraversalScope } from "./open_call.js";
import { hasAdmittedTraversalCursorAtPrefix, traversalCursorAdmissionEventRefAtPrefix, type TraversalCursorCandidate } from "./traversal_cursor.js";
import type { CCall } from "./c_call.js";

export function admitConstructionContinuationReentry(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate,
  operation: PreparedConstructionContinuationOperation, root: ExecutionBasis, rootScope: OpenedTraversalScope,
  child: ExecutionBasis, childScope: OpenedTraversalScope, parentCall: CCall, cursor: TraversalCursorCandidate, basis: RuntimeAdmissionBasis) {
  const prefix = selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(predecessorPrefix));
  const old = projectConstructionIntentContinuations(prefix, operation.prepared.continuation.runId)
    .find(c => c.continuationRef === operation.prepared.continuation.continuationRef);
  const cursorEventRef = traversalCursorAdmissionEventRefAtPrefix(prefix, cursor);
  if (!preparedOperations.has(operation) || old?.status !== "open" || root.constructionContinuationUse?.continuationRef !== old.continuationRef ||
    child.parentExecutionBasisRef !== root.basisRef || child.parentCCallRef !== parentCall.cCallRef ||
    rootScope.runId !== childScope.runId || cursorEventRef === null || !hasAdmittedTraversalCursorAtPrefix(prefix, cursor) ||
    cursor.executionBasisRef !== child.basisRef || cursor.frameId !== childScope.frameId || cursor.inputDigest !== operation.prepared.pending.input.inputDigest)
    throw new TypeError("continued obligation requires the actual current parent, progressed input and unused predecessor");
  const { continuationRef: _oldRef, continuationDigest: _oldDigest, openedEventRef: _open, status: _status, terminalEventRef: _terminal, ...prior } = old;
  const body = { ...prior, predecessorContinuationRef: old.continuationRef,
    runId: childScope.runId, graphCallId: childScope.graphCallId, frameId: childScope.frameId,
    executionBasisRef: child.basisRef, executionBasisDigest: child.basisDigest,
    parentExecutionBasisRef: root.basisRef, parentCCallRef: parentCall.cCallRef,
    heldCursorRef: cursor.cursorRef, heldCursorDigest: cursor.cursorDigest, causedByEventRef: cursorEventRef };
  const continuationDigest = hash(body), continuationRef = `continuation://abiogenesis/${continuationDigest.slice(7)}`;
  const linkBody = { predecessorContinuationId: old.continuationRef, predecessorDisposition: "superseded",
    predecessorRunId: old.runId, successorKind: "some", successorRunId: childScope.runId,
    continuationKind: "construction_intent", plannedContinuationId: continuationRef,
    plannedOpeningBasisRef: child.basisRef, plannedOpeningBasisDigest: child.basisDigest,
    workspaceBindingId: root.workspaceBindingId, workspaceBindingDigest: root.workspaceBindingDigest };
  const linkDigest = hash(linkBody), linkRef = `continuation-reentry-link://abiogenesis/${linkDigest.slice(7)}`;
  const admitted = admitRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => {
    admitRuntimeEvent(store, {
      kind: "continuation_superseded", eventTime: basis.eventTime, aggregateType: "continuation", aggregateId: old.continuationRef,
      parentAggregateId: old.frameId, causationEventRefs: [old.openedEventRef, root.admissionEventRef], correlationId: basis.correlationId,
      workflowVersion: "5.0.0", scopeClass: "run", basisId: old.executionBasisRef,
      runId: old.runId, graphCallId: old.graphCallId, frameId: old.frameId,
      payload: { continuationRef: old.continuationRef, continuationDigest: old.continuationDigest,
        continuationKind: "construction_intent", terminalDisposition: "superseded", candidateRef: linkRef,
        candidateDigest: linkDigest, causedByEventRef: old.openedEventRef },
    });
    const link = admitRuntimeEvent(store, {
      kind: "continuation_reentry_link_admitted", eventTime: basis.eventTime, aggregateType: "workspace", aggregateId: root.workspaceBindingId,
      parentAggregateId: root.invocationRef, causationEventRefs: [root.admissionEventRef], correlationId: basis.correlationId,
      workflowVersion: "5.0.0", scopeClass: "workspace", basisId: root.basisRef,
      payload: { linkRef, linkDigest, ...linkBody },
    });
    const opened = admitRuntimeEvent(store, {
      kind: "construction_continuation_opened", eventTime: basis.eventTime, aggregateType: "continuation", aggregateId: continuationRef,
      parentAggregateId: childScope.frameId, causationEventRefs: [cursorEventRef, link.eventId], correlationId: basis.correlationId,
      workflowVersion: "5.0.0", scopeClass: "run", basisId: child.basisRef, runId: childScope.runId,
      graphCallId: childScope.graphCallId, frameId: childScope.frameId,
      payload: { continuationRef, continuationDigest, ...body },
    });
    return deepFreeze({ ...body, continuationRef, continuationDigest, openedEventRef: opened.eventId,
      terminalEventRef: null, status: "open" as const });
  });
  return Object.freeze({ continuation: admitted.value, successorPrefix: admitted.successorPrefix! });
}

import { projectAdmittedTraversalCursorAtPrefix, projectTraversalInputAtPrefix } from "./traversal_cursor.js";
import { projectAdmittedWorkspaceBindingAtCoordinate, projectWitnessedWorkspaceBindingCover } from "./worksite_revision.js";

/** A selected route is the occurrence. This projection neither opens another
 * intent nor grants permission to run it. */
export interface SelectedActionContinuation {
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
}

export function projectSelectedActionContinuations(prefix: ValidatedRuntimeEventPrefix,
  runId: string): readonly SelectedActionContinuation[] {
  const events = indexedRuntimeEvents(prefix, "run:" + runId);
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
    const route = one(events.filter(e => e.kind === "traversal_route_admitted" && selected.causationEventRefs.includes(e.eventId)));
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
    const superseded = one(indexedRuntimeEvents(prefix, "aggregate:continuation:" + continuationRef)
      .filter(e => e.kind === "continuation_superseded"));
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

/** Same owner predicate for new admission and cold operation correspondence. A
 * covering witness never substitutes for a fresh current semantic selection. */
export function selectPendingActionUse(prefix: ValidatedRuntimeEventPrefix, request: SelectedActionUseRequest) {
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
  const current = candidates.length === 1 ? candidates[0] : undefined;
  if (current === undefined || current.status !== "open") return { kind: "refused" as const, code: "stale_action" as const };
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
    const witness = one(indexedRuntimeEvents(prefix, "kind:declaration_reprice_admitted").filter(e =>
      covers?.includes(e.eventId) && isRecord(e.payload) && e.payload.witnessedActRef === coordinate.ref && e.payload.witnessedActDigest === coordinate.digest));
    const sourceEvent = indexedRuntimeEvents(prefix, "kind:construction_intent_selected").find(e => e.eventId === source.intentAdmissionEventRef);
    const currentEvent = selectedRows[0];
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

const selectedPreparations = new WeakSet<object>();
export function prepareSelectedActionContinuation(prefix: ValidatedRuntimeEventPrefix,
  use: Extract<ReturnType<typeof selectPendingActionUse>, { kind: "selected_action_use" }>, resolution: LoadedProductExecutionResolution) {
  const root = rehydrateExecutionBasisAtPrefix(prefix, use.currentBasis.basisRef);
  if (root === null || root.basisClass !== "root" || root.constructionContinuationUse !== undefined ||
    root.programRef !== resolution.program.programRef || root.programDigest !== hash(resolution.program) ||
    root.programValidationRef !== resolution.programValidation.validationRef || root.graphFunctionRef !== resolution.graphFunction.name) return null;
  const graph = materializeGraph(resolution.graphFunction, { invocationAdmissionRef: root.invocationAdmissionRef,
    admittedInputRef: root.rawInputAdmissionRef, admittedInputDigest: root.rawInputDigest, admittedInput: root.rawInputValue });
  const graphValidation = validateGraph(graph, resolution.programValidation, resolution.graphFunction, {
    invocationAdmissionRef: root.invocationAdmissionRef, admittedInputRef: root.rawInputAdmissionRef,
    admittedInputDigest: root.rawInputDigest, admittedInput: root.rawInputValue });
  if (graphValidation.kind !== "graph_validation" || graphValidation.validationRef !== root.graphValidationRef ||
    graph.materializationRef !== root.graphRef || graph.materializationDigest !== root.graphDigest) return null;
  const selected = use.current;
  const cursor = projectAdmittedTraversalCursorAtPrefix(prefix, graph, { cursorRef: selected.heldCursorRef,
    cursorDigest: selected.heldCursorDigest, executionBasisRef: root.basisRef, runId: selected.runId,
    graphCallId: selected.graphCallId, frameId: selected.frameId });
  const input = cursor === null ? null : projectTraversalInputAtPrefix(prefix, graph, root, cursor);
  const intent = cursor === null ? null : rehydrateConstructionIntentForCursorAtPrefix(prefix, cursor);
  const term = cursor === null ? null : resolveCProgramTermAtSourcePath(graph.template, cursor.currentNodeRef, cursor.termPath);
  const scope = projectOpenedTraversalScopeForFrameAtPrefix(prefix, selected.frameId);
  const implementationSet = rehydrateAdmittedImplementationSetAtPrefix(prefix, root.rootImplementationSetRef);
  const interactionSet = rehydrateAdmittedInteractionSetAtPrefix(prefix, root.rootInteractionSetRef);
  if (cursor === null || input === null || intent === null || term?.kind !== "c_workflow" || scope === null ||
    implementationSet === null || interactionSet === null || !isRecord(input.value) ||
    intent.constructionIntentRef !== selected.constructionIntentRef || intent.selectedGraphFunctionRef !== term.graphFunctionRef) return null;
  const result = Object.freeze({ use, root, graph, graphValidation, cursor, input, inputValue: input.value, intent, term, scope, implementationSet, interactionSet, resolution, predecessorDigest: runtimeEventPrefixDigest(prefix) });
  selectedPreparations.add(result);
  return result;
}
export type PreparedSelectedActionContinuation = NonNullable<ReturnType<typeof prepareSelectedActionContinuation>>;

export function admitSelectedActionContinuationOperation(store: AbgEventStore, predecessorPrefix: DurablePrefixCoordinate,
  prepared: PreparedSelectedActionContinuation, grant: CapabilityGrant, basis: PublicOperationAdmissionBasis) {
  const { use } = prepared, { invocation, source, current } = use;
  if (!selectedPreparations.has(prepared) || runtimeEventPrefixDigest(selectValidatedRuntimeEventPrefix(readRuntimeEventsAtDurablePrefix(predecessorPrefix))) !== prepared.predecessorDigest || validatePublicOperationBasis(basis, "abg.operation.run.continue", "selected_action") !== null ||
    !isCapabilityGrantValue(grant) || grant.operationId !== "abg.operation.run.continue" || grant.actorRef !== invocation.actorRef ||
    grant.policyRef !== invocation.policyRef || basis.authorityScopeRef !== invocation.workspaceBindingId ||
    basis.authorityScopeDigest !== invocation.workspaceBindingDigest)
    throw new TypeError("selected-action use requires exact current work and separate operation authority");
  return admitRuntimeEventTransactionAtDurablePrefix(store, predecessorPrefix, () => {
    const operation = admitRuntimeEvent(store, constructionContinuationOperationCandidate(invocation, grant,
      { ...basis, causationEventRefs: [...(use.coveringEventRef === null ? [] : [use.coveringEventRef]), ...basis.causationEventRefs] }, {
        operationId: "abg.operation.run.continue", memberKey: "selected_action", variant: "selected_action", continuationKind: "selected_action",
        continuationRef: source.continuationRef, continuationDigest: source.continuationDigest,
        currentContinuationRef: current.continuationRef, currentContinuationDigest: current.continuationDigest,
        sourceRunId: source.runId, sourceRunDigest: use.request.run.digest, currentRunId: current.runId,
        selectedActionRef: current.selectedActionRef, selectedActionDigest: current.selectedActionDigest,
        currentIntentRef: current.constructionIntentRef, currentIntentDigest: current.constructionIntentDigest,
        executionBasisRef: prepared.root.basisRef, executionBasisDigest: prepared.root.basisDigest,
        basisRelation: use.request.basisRelation as unknown as JsonValue,
      }));
    if (source.continuationRef !== current.continuationRef) admitRuntimeEvent(store, {
      kind: "continuation_superseded", eventTime: basis.eventTime, aggregateType: "continuation", aggregateId: source.continuationRef,
      parentAggregateId: source.frameId, causationEventRefs: [source.openedEventRef, operation.eventId], correlationId: basis.correlationId,
      workflowVersion: "5.0.0", scopeClass: "run", basisId: source.executionBasisRef,
      runId: source.runId, graphCallId: source.graphCallId, frameId: source.frameId,
      payload: { continuationRef: source.continuationRef, continuationDigest: source.continuationDigest,
        continuationKind: "selected_action", constructionIntentRef: source.constructionIntentRef, terminalDisposition: "superseded",
        candidateRef: basis.invocationRef, candidateDigest: basis.invocationDigest, causedByEventRef: source.openedEventRef },
    });
    return operation;
  });
}

/** Cold validation consumes the same admission relation at its actual predecessor. */
export function projectSelectedActionOperation(prefix: ValidatedRuntimeEventPrefix, operation: RuntimeEvent) {
  const p = operation.payload;
  if (operation.kind !== "public_operation_admitted" || !isRecord(p) || p.continuationKind !== "selected_action" ||
    p.operationId !== "abg.operation.run.continue" || p.memberKey !== "selected_action" ||
    typeof p.sourceRunId !== "string" || typeof p.sourceRunDigest !== "string" ||
    typeof p.continuationRef !== "string" || typeof p.continuationDigest !== "string" ||
    typeof p.selectedActionRef !== "string" || typeof p.selectedActionDigest !== "string" ||
    !isRecord(p.basisRelation) || (p.basisRelation.kind !== "same_basis" &&
      (p.basisRelation.kind !== "authority_changed" || !isRecord(p.basisRelation.coveringReprice))) ||
    !isCapabilityGrantValue(p.capabilityGrant) || typeof p.invocationRef !== "string" || typeof p.invocationDigest !== "string") return null;
  const before = validatedRuntimeEventPrefixBeforeEvent(prefix, operation.eventId);
  const use = selectPendingActionUse(before, { run: { ref: p.sourceRunId, digest: p.sourceRunDigest },
    continuation: { ref: p.continuationRef, digest: p.continuationDigest }, selectedAction: { ref: p.selectedActionRef, digest: p.selectedActionDigest },
    basisRelation: p.basisRelation as unknown as SelectedActionUseRequest["basisRelation"] });
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
