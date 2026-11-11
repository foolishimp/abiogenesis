// The Event Calculus law: carriers, the axiom table ROOT_EVENT_CALCULUS and
// the axiom effect of one event. Moved from abg/event_calculus.ts, which
// re-exports every public name; the rule table and the pure fold are in
// rules.ts and fold.ts.
import { isRecord } from "../../shared/admit/index.js";
import { sha256Canonical } from "../../shared/digests.js";
import { deepFreeze } from "../../shared/immutable.js";
import {
  isWorksiteEffectAuthorization,
  isWorksiteFileReplaceReceipt,
  isWorksiteFileReplaceRequest,
  isWorksiteObservation,
  type WorksiteObservation,
  type WorksiteFileReplaceRequest,
} from "../../product/worksite_effect.js";
import {
  indexedRuntimeEvents,
  runtimeEventAtPrefix,
  validatedRuntimeEventPrefixBeforeEvent,
  type RuntimeEventPrefix,
} from "../event_prefix.js";
import type { RootEventKind, RuntimeEvent } from "../event_store.js";
import { runtimeEventProfile } from "../event_store.js";
import { isRuntimeProbeObservation, isRuntimeSystemProbeContract,
  type RuntimeInvocationScope } from "../runtime_liveness_contracts.js";
import { projectWorksiteBasisObservation, projectWorksiteSelectedOccurrence, projectWorksiteFailureResultRequest } from "../c_call_outcome.js";
import { NATIVE_WORKSPACE_WORK_IDS as nativeIds, isNativeWorkspaceWorkObservation,
  isNativeWorkspaceWorkFailure, isNativeWorkspaceWorkTask, nativeWorkspaceWorkResultInputDigest } from "../../product/native_workspace_work.js";
import { nativeWorkImpact, nativeWorkImpactOverlaps, projectNativeWorkUnknownEffectTask,
  type NativeWorkImpact } from "../native_work_effect.js";

interface EventCalculusEffectRefs {
  readonly initiates: readonly string[];
  readonly terminates: readonly string[];
  readonly clips: readonly string[];
  readonly declips: readonly string[];
  readonly conditionalTerminates?: readonly {
    readonly name: string;
    readonly identityPayloadKey: string;
    readonly unlessPayload: Readonly<Record<string, string>>;
  }[];
}

export interface RuntimeFluent {
  readonly kind: "runtime_fluent";
  readonly name: string;
  readonly identity: string | null;
  readonly fluentRef: string;
}

export interface RuntimeFluentPattern {
  readonly kind: "runtime_fluent_pattern";
  readonly name: string | null;
  readonly identity: string | null;
}

export interface RuntimeFluentInput {
  readonly name: string;
  readonly identity?: string | null;
}

export type RetryFluentName =
  | "retry_attempt_active"
  | "retry_progress_available";

export interface RetryFluentIdentityCoordinates {
  readonly runId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly retryBoundaryRef: string;
  readonly authorityRef: string;
}

export function constructRetryFluentIdentity(
  name: RetryFluentName,
  coordinates: RetryFluentIdentityCoordinates,
): string {
  if (
    coordinates.runId.length === 0 ||
    coordinates.graphCallId.length === 0 ||
    coordinates.frameId.length === 0 ||
    coordinates.retryBoundaryRef.length === 0 ||
    coordinates.authorityRef.length === 0
  ) {
    throw new TypeError("retry fluent identity requires one exact closed scope");
  }
  const digest = sha256Canonical({
    kind: "retry_fluent_identity",
    schemaVersion: "5.0.0",
    name,
    ...coordinates,
  });
  return `retry-fluent://abiogenesis/${digest.slice("sha256:".length)}`;
}

export function constructScopedRetryFluent(
  name: RetryFluentName,
  coordinates: RetryFluentIdentityCoordinates,
): RuntimeFluent {
  return constructRuntimeFluent({
    name,
    identity: constructRetryFluentIdentity(name, coordinates),
  });
}

export interface RuntimeFluentPatternInput {
  readonly name?: string | null;
  readonly identity?: string | null;
}

export interface EventCalculusEffect {
  readonly initiates: readonly RuntimeFluent[];
  readonly terminates: readonly RuntimeFluent[];
  readonly clips: readonly RuntimeFluentPattern[];
  readonly declips: readonly RuntimeFluentPattern[];
}

export interface RuntimeEventCalculusEffectRow extends EventCalculusEffect {
  readonly kind: "event_calculus_effect_row";
  readonly eventKind: RootEventKind;
  readonly sourceEvent: RuntimeEvent;
}

export interface RuntimeEventCalculusProjection {
  readonly kind: "event_calculus_projection";
  readonly holds: readonly RuntimeFluent[];
  readonly effectRows: readonly RuntimeEventCalculusEffectRow[];
  readonly clippedFluentRefs: readonly string[];
  readonly declippedPatternRefs: readonly string[];
}

export const ROOT_EVENT_CALCULUS = Object.freeze({
  public_operation_artifact_admitted: {
    initiates: ["public_operation_artifact_available"],
    terminates: [], clips: [], declips: [],
  },
  public_operation_admitted: {
    initiates: ["public_operation_ingress_admitted"],
    terminates: [], clips: [], declips: [],
  },
  invocation_admitted: {
    initiates: ["invocation_admitted"],
    terminates: [], clips: [], declips: [],
  },
  invocation_refused: {
    initiates: ["invocation_refused"],
    terminates: ["invocation_admitted"], clips: [], declips: [],
  },
  implementation_admitted: {
    initiates: ["implementation_admitted"],
    terminates: [], clips: [], declips: [],
  },
  basis_admitted: {
    initiates: ["basis_admitted"],
    terminates: [], clips: [], declips: [],
  },
  declaration_reprice_admitted: {
    initiates: ["declaration_reprice_admitted"],
    terminates: [], clips: [], declips: [],
  },
  replay_log_attested: {
    initiates: ["replay_log_attested"],
    terminates: [], clips: [], declips: [],
  },
  workspace_hygiene_stamped: {
    initiates: ["workspace_hygiene_stamped"],
    terminates: [], clips: [], declips: [],
  },
  defect_intake_admitted: {
    initiates: ["defect_intake_admitted"],
    terminates: [], clips: [], declips: [],
  },
  run_resumed: {
    initiates: ["run_active"],
    terminates: ["operator_run_stopped"], clips: [], declips: [],
  },
  run_segment_opened: {
    initiates: ["run_active"],
    terminates: [], clips: [], declips: [],
  },
  graph_call_opened: {
    initiates: ["graph_call_active"],
    terminates: [], clips: [], declips: [],
  },
  frame_opened: {
    initiates: ["frame_active"],
    terminates: [], clips: [], declips: [],
  },
  traversal_cursor_entered: {
    initiates: ["locus_active"],
    terminates: [], clips: [], declips: [],
  },
  c_call_opened: {
    initiates: ["c_call_active"],
    terminates: [], clips: [], declips: [],
  },
  c_call_fibre_selected: {
    initiates: ["c_call_fibre_admitted"],
    terminates: [], clips: [], declips: [],
  },
  actor_transport_binding_admitted: {
    initiates: ["actor_transport_binding_admitted"],
    terminates: [], clips: [], declips: [],
  },
  actor_invocation_started: {
    initiates: ["actor_invocation_active"],
    terminates: [], clips: [], declips: [],
  },
  // actor_process_live, actor_process_terminated,
  // actor_process_termination_unconfirmed and actor_cleanup_pending have one
  // producer: the actor_process_lifecycle rule of ROOT_DERIVED_RULES.
  actor_process_started: {
    initiates: ["actor_process_active"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_spawn_failed: {
    initiates: ["actor_process_spawn_failed"],
    terminates: ["actor_process_active"], clips: [], declips: [],
  },
  actor_process_stdout_observed: {
    initiates: ["actor_stdout_available"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_stderr_observed: {
    initiates: ["actor_stderr_available"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_timeout_observed: {
    initiates: ["actor_process_timed_out"],
    terminates: [], clips: [], declips: [],
  },
  runtime_activity_probe_observed: {
    initiates: ["runtime_activity_recent", "runtime_invocation_active"],
    terminates: ["runtime_invocation_active"], clips: ["runtime_inactivity_asserted"], declips: [],
  },
  runtime_external_interruption_observed: {
    initiates: ["runtime_externally_interrupted", "runtime_invocation_blocked"],
    terminates: ["runtime_invocation_active"], clips: [], declips: [],
  },
  actor_process_signal_requested: {
    initiates: ["actor_process_signal_requested"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_exited: {
    initiates: ["actor_process_exited"],
    terminates: ["actor_process_active"], clips: [], declips: [],
  },
  actor_process_termination_unconfirmed: {
    initiates: ["actor_cleanup_live"],
    terminates: [], clips: [], declips: [],
  },
  actor_result_artifact_observed: {
    initiates: ["actor_result_artifact_available"],
    terminates: [], clips: [], declips: [],
  },
  actor_invocation_closed: {
    initiates: ["actor_invocation_closed"],
    terminates: ["actor_invocation_active", "actor_transport_binding_admitted", "actor_stdout_available", "actor_stderr_available", "actor_result_artifact_available"], clips: [], declips: [],
  },
  actor_invocation_failed: {
    initiates: ["actor_invocation_failed"],
    terminates: ["actor_invocation_active", "actor_process_active", "actor_transport_binding_admitted", "actor_stdout_available", "actor_stderr_available", "actor_result_artifact_available"], clips: [], declips: [],
  },
  c_call_evidenced: {
    initiates: ["c_call_evidence_available"],
    terminates: ["c_call_fibre_admitted"], clips: [], declips: [],
  },
  c_call_result_admitted: {
    initiates: ["c_call_result_available"],
    terminates: ["c_call_evidence_available"], clips: [], declips: [],
  },
  c_call_judged: {
    initiates: ["c_call_judgment_available"],
    terminates: ["c_call_active", "c_call_result_available"],
    clips: [], declips: [],
  },
  assessed: {
    initiates: ["result_assessment_admitted"],
    terminates: [], clips: [], declips: [],
  },
  retry_attempt_opened: {
    initiates: ["retry_attempt_active"],
    terminates: [], clips: [], declips: [],
  },
  retry_progress_recorded: {
    initiates: ["retry_progress_available"],
    terminates: ["retry_attempt_active"], clips: [], declips: [],
  },
  child_foldback_admitted: {
    initiates: ["child_foldback_available"],
    terminates: ["parent_waiting_on_child"], clips: [], declips: [],
  },
  child_preparation_refused: {
    initiates: ["child_preparation_refused"],
    terminates: ["parent_waiting_on_child"], clips: [], declips: [],
  },
  fan_out_completion_admitted: {
    initiates: ["fan_out_completion_available"],
    terminates: [], clips: [], declips: [],
  },
  traversal_route_admitted: {
    initiates: [],
    terminates: ["locus_active"], clips: [], declips: [],
  },
  construction_continuation_opened: {
    initiates: ["continuation_open"], terminates: [], clips: [], declips: [],
  },
  construction_intent_selected: {
    initiates: ["construction_intent_available"],
    terminates: [], clips: [], declips: [],
  },
  construction_delta_observed: {
    initiates: [],
    terminates: [], clips: [], declips: [],
  },
  fh_interaction_opened: {
    initiates: ["continuation_open", "interaction_pending", "frame_held"],
    terminates: ["hold_route_admitted"], clips: [], declips: [],
  },
  fh_interaction_responded: {
    initiates: ["continuation_response_available"],
    terminates: [], clips: [], declips: [],
  },
  fh_interaction_resume_admitted: {
    initiates: ["continuation_terminated", "frame_active", "locus_active"],
    terminates: [
      "continuation_open",
      "interaction_pending",
      "continuation_response_available",
      "frame_held",
    ], clips: [], declips: [],
  },
  continuation_abandoned: {
    initiates: ["continuation_abandoned"],
    terminates: ["continuation_open", "interaction_pending", "continuation_response_available"], clips: [], declips: [],
  },
  continuation_superseded: {
    initiates: ["continuation_superseded"],
    terminates: ["continuation_open", "interaction_pending", "continuation_response_available", "construction_intent_available"], clips: [], declips: [],
  },
  continuation_reentry_link_admitted: {
    initiates: ["continuation_reentry_link_available"],
    terminates: [], clips: [], declips: [],
  },
  runtime_failure_observed: {
    initiates: ["runtime_failure"],
    terminates: ["locus_active", "frame_active", "runtime_invocation_active"], clips: [], declips: [],
  },
  run_stopped: {
    initiates: ["run_terminal"],
    terminates: [
      "locus_active",
      "frame_active",
      "frame_blocked",
      "frame_failed",
      "graph_call_active",
      "run_active",
      "retry_attempt_active",
      "retry_progress_available",
    ], clips: [], declips: [],
  },
  terminal_reached: {
    initiates: ["terminal_admitted"],
    terminates: ["terminal_route_available"], clips: [], declips: [],
  },
  frame_closed: {
    initiates: ["frame_closed"],
    terminates: ["frame_active", "runtime_invocation_active"], clips: [], declips: [],
  },
  graph_call_closed: {
    initiates: ["graph_call_closed"],
    terminates: ["graph_call_active"], clips: [], declips: [],
  },
  run_closed: {
    initiates: ["run_closed"],
    terminates: ["locus_active", "run_active"], clips: [], declips: [],
  },
} as const satisfies Readonly<Record<RootEventKind, EventCalculusEffectRefs>>);

/** @internal */
export function stringField(
  event: Pick<RuntimeEvent, "payload">,
  name: string,
): string | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[name];
  return typeof value === "string" ? value : null;
}

/** @internal */
export function stringArrayField(
  event: Pick<RuntimeEvent, "payload">,
  name: string,
): readonly string[] {
  if (!isRecord(event.payload)) return [];
  const value = event.payload[name];
  return Array.isArray(value) &&
      value.every((entry) => typeof entry === "string")
    ? value as readonly string[]
    : [];
}

function fluent(name: string, identity: string): string {
  return `${name}(${identity})`;
}

/** @internal */
export function frameProbeScopeKey(scope: Pick<RuntimeInvocationScope, "frameId" | "runId" | "graphCallId" | "basisRef" | "graphFunctionRef">): string {
  return JSON.stringify([scope.frameId, scope.runId, scope.graphCallId, scope.basisRef, scope.graphFunctionRef]);
}

function observedFrameRuntimeFluents(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[], history?: RuntimeEffectHistory): readonly string[] {
  if (runtimeEventProfile(event)?.nativeLiveness !== true || event.frameId === undefined) return [];
  if (history !== undefined) return [...(history.frameProbeScopes.get(frameProbeScopeKey({
    frameId: event.frameId, runId: event.runId!, graphCallId: event.graphCallId!,
    basisRef: event.basisId, graphFunctionRef: event.graphFunctionRef!,
  })) ?? [])].map(scope => fluent("runtime_invocation_active", scope));
  return [...new Set(priorEvents.flatMap(row => {
    if (row.kind !== "runtime_activity_probe_observed" || !isRecord(row.payload) ||
        !isRuntimeSystemProbeContract(row.payload.probeContract) || !isRuntimeProbeObservation(row.payload.observation)) return [];
    const scope = row.payload.probeContract.scope;
    return scope.cCallRef === null && scope.actorInvocationRef === null && scope.frameId === event.frameId &&
      scope.runId === event.runId && scope.graphCallId === event.graphCallId && scope.basisRef === event.basisId && scope.graphFunctionRef === event.graphFunctionRef
      ? [fluent("runtime_invocation_active", row.payload.observation.scopeDigest)] : [];
  }))];
}

/** The C0 mutable-worksite currentness fluent has one observation identity. */
export function constructWorksiteObservationCurrentFluent(
  observationRef: string,
): RuntimeFluent {
  return constructRuntimeFluent({
    name: "worksite_observation_current",
    identity: observationRef,
  });
}


export function projectWorksiteTransitionForResult(
  event: RuntimeEvent,
  priorEvents: readonly RuntimeEvent[],
): Readonly<{
  before: string;
  after: string | null;
  successorObservation: WorksiteObservation | null;
}> | null {
  const transition = worksiteTransitionForResult(event, priorEvents);
  if (transition === null) return null;
  const { request: _request, ...projected } = transition;
  return projected;
}

function worksiteTransitionForResult(
  event: RuntimeEvent,
  priorEvents: readonly RuntimeEvent[],
): Readonly<{
  request: WorksiteFileReplaceRequest;
  before: string;
  after: string | null;
  successorObservation: WorksiteObservation | null;
}> | null {
  if (!isRecord(event.payload)) return null;
  const evidenceRefs = stringArrayField(event, "evidenceRefs");
  if (event.payload.resultClass === "failure") {
    const request = projectWorksiteFailureResultRequest(event, priorEvents);
    return request === null ? null : { request, before: request.predecessorObservation.observationRef,
      after: null, successorObservation: null };
  }
  const evidence = priorEvents.filter((row) =>
    row.kind === "c_call_evidenced" &&
    row.aggregateId === event.aggregateId &&
    isRecord(row.payload) &&
    row.payload.evidenceClass === "worksite_file_replace" &&
    typeof row.payload.evidenceRef === "string" &&
    evidenceRefs.includes(row.payload.evidenceRef)
  );
  if (evidence.length !== 1 || !isRecord(evidence[0]!.payload)) return null;
  const payload = evidence[0]!.payload;
  const request = payload.request;
  const authorization = payload.authorization;
  const receipt = payload.receipt;
  const successor = payload.successorObservation;
  if (
    !isWorksiteFileReplaceRequest(request) ||
    !isWorksiteEffectAuthorization(authorization) ||
    !isWorksiteFileReplaceReceipt(receipt) ||
    !isWorksiteObservation(successor) ||
    authorization.cCallRef !== event.aggregateId ||
    receipt.authorizationRef !== authorization.authorizationRef ||
    receipt.authorizationDigest !== authorization.authorizationDigest ||
    receipt.beforeObservationRef !== request.predecessorObservation.observationRef ||
    receipt.beforeObservationDigest !== request.predecessorObservation.observationDigest ||
    receipt.afterObservationRef !== successor.observationRef ||
    receipt.afterObservationDigest !== successor.observationDigest
  ) return null;
  return {
    request,
    before: request.predecessorObservation.observationRef,
    after: successor.observationRef,
    successorObservation: successor,
  };
}

/** The shared native impact (observed changes ∪ W\R; unknown after-state: all
 * W) retires affected facts. Neither case manufactures C0 provenance or successors. */
export function projectNativeWorkRetiredObservations(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[]): readonly string[];
/** @internal */
export function projectNativeWorkRetiredObservations(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[], ownedPrefix?: RuntimeEventPrefix): readonly string[];
export function projectNativeWorkRetiredObservations(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[], ownedPrefix?: RuntimeEventPrefix): readonly string[] {
  const scope = nativeWorkPhysicalScope(event, priorEvents, ownedPrefix);
  return scope === null ? [] : retiredWorksiteObservations(scope.canonicalRoot, scope.affectsPath, priorEvents);
}
function nativeWorkPhysicalScope(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[], ownedPrefix?: RuntimeEventPrefix):
  { canonicalRoot: string; affectsPath: (path: string) => boolean } | null {
  const scope = (impact: NativeWorkImpact) => ({ canonicalRoot: impact.canonicalRoot,
    affectsPath: (path: string) => nativeWorkImpactOverlaps(impact, path) });
  if (event.kind === "actor_invocation_failed" || event.kind === "actor_process_termination_unconfirmed") {
    const task = projectNativeWorkUnknownEffectTask(event, priorEvents, ownedPrefix);
    return task === null ? null : scope(nativeWorkImpact(task, null));
  }
  if (event.kind !== "c_call_result_admitted" || !isRecord(event.payload)) return null;
  const value = event.payload.value;
  if (!(isNativeWorkspaceWorkObservation(value) || isNativeWorkspaceWorkFailure(value)) ||
    value.provenance.cCallRef !== event.aggregateId ||
    event.payload.contractRef !== (value.kind === "native_workspace_work_observation" ? nativeIds.observationContractRef : nativeIds.failureContractRef)) return null;
  const evidenceRefs = stringArrayField(event, "evidenceRefs");
  // Existing retry failure admission adds signal/source coordinates while
  // preserving the original owner candidate digest cited by transport evidence.
  const valueDigest = isRecord(event.payload.value!) && typeof event.payload.value.failureCandidateDigest === "string"
    ? event.payload.value.failureCandidateDigest : event.payload.valueDigest;
  if (!priorEvents.some(row => row.kind === "c_call_evidenced" && row.aggregateId === event.aggregateId && isRecord(row.payload) &&
    evidenceRefs.includes(row.payload.evidenceRef as string) && row.payload.evidenceClass === "probabilistic_transport" &&
    row.payload.implementationRef === nativeIds.implementationRef && row.payload.transportDigest === value.provenance.transportDigest &&
    row.payload.outputDigest === valueDigest)) return null;
  // The Result's task is its own admitted basis input, bound by the Result's input digest.
  // A retained Result keeps its original task and owner interpretation.
  const retained = (value as unknown as { readonly task?: unknown }).task;
  const basisRows = retained !== undefined ? [] : ownedPrefix === undefined ? priorEvents : indexedRuntimeEvents(ownedPrefix, "basis:" + event.basisId);
  const basis = basisRows.filter(row => row.kind === "basis_admitted" && row.basisId === event.basisId && isRecord(row.payload) &&
    row.payload.basisRef === event.basisId);
  const task = retained !== undefined ? retained : basis.length === 1 && isRecord(basis[0]!.payload) ? basis[0]!.payload.rawInputValue : undefined;
  if (!isNativeWorkspaceWorkTask(task) || sha256Canonical(task) !== nativeWorkspaceWorkResultInputDigest(value)) return null;
  return scope(nativeWorkImpact(task, value.after === null ? null : value.changedPaths));
}

/** One worksite cause as the support pass read it. */
interface WorksiteCause {
  readonly position: number;
  readonly kind: RuntimeEvent["kind"];
  readonly eventId: string;
  readonly admissionOrdinal: number;
  readonly basisId: unknown;
  readonly aggregateId: unknown;
  readonly failure: boolean;
  readonly nativeRoot: unknown;
}

const supportObject = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === "object" && value !== null;

/** The causal support of one basis admission, acquired in one pass over the
 * caller's dependency list and read per cause; it lives for the call. Every
 * row a C0 join can select (`worksiteTransitionForResult`,
 * `projectWorksiteSelectedOccurrence` and their joins in c_call_outcome.ts) is
 * a row of one kind whose one field equals one value, so `joins` keeps each
 * such row under that kind, field and value, and a cause's support is the rows
 * its own joins can select, before it, in list order. `subjectBases` and
 * `subjectCalls` hold the bases and calls whose C0 request can be the
 * subject's; no other C0 cause can name the subject. */
function worksiteCauseSupport(priorEvents: readonly RuntimeEvent[], canonicalRoot: string, relativePath: string) {
  const joins = new Map<string, Map<unknown, number[]>>(), ordinals: number[] = [];
  const basisLinks = new Map<number, readonly unknown[]>(), fibreBases = new Map<number, unknown>();
  const causes: WorksiteCause[] = [], subjectBases = new Set<unknown>(), subjectCalls = new Set<unknown>();
  const basisInputs = new Map<unknown, unknown>(), nativeBasisCauses: number[] = [];
  const nativeRootOf = (task: unknown) => supportObject(task) && supportObject(task.workspaceAuthorityBasis) ? task.workspaceAuthorityBasis.canonicalRoot : undefined;
  const join = (selector: string, value: unknown, position: number) => {
    let values = joins.get(selector);
    if (values === undefined) joins.set(selector, values = new Map());
    const positions = values.get(value);
    if (positions === undefined) values.set(value, [position]); else positions.push(position);
  };
  const namesSubject = (value: unknown) => supportObject(value) && supportObject(value.workspaceAuthorityBasis) &&
    value.workspaceAuthorityBasis.canonicalRoot === canonicalRoot && supportObject(value.subject) &&
    value.subject.relativePath === relativePath;
  for (let position = 0; position < priorEvents.length; position++) {
    const row = priorEvents[position]!, kind = row.kind, payload = supportObject(row.payload) ? row.payload : null;
    ordinals.push(row.admissionOrdinal);
    if (kind === "basis_admitted") {
      join("basis_admitted:basisId", row.basisId, position);
      if (payload !== null) {
        join("basis_admitted:payload.basisRef", payload.basisRef, position);
        const raw = payload.rawInputValue;
        if (row.basisId === payload.basisRef) basisInputs.set(row.basisId, raw);
        basisLinks.set(position, [payload.invocationAdmissionRef, payload.implementationSetRef, payload.parentExecutionBasisRef,
          supportObject(raw) ? raw.workspaceBindingIdentity : undefined]);
        if (namesSubject(raw)) subjectBases.add(row.basisId);
      }
    } else if (kind === "c_call_opened") {
      join("c_call_opened:aggregateId", row.aggregateId, position);
      join("c_call_opened:basisId", row.basisId, position);
    } else if (kind === "c_call_evidenced") {
      join("c_call_evidenced:aggregateId", row.aggregateId, position);
      if (payload !== null && namesSubject(payload.request)) subjectCalls.add(row.aggregateId);
    } else if (kind === "public_operation_artifact_admitted") {
      if (payload !== null) join("public_operation_artifact_admitted:payload.artifactRef", payload.artifactRef, position);
    } else if (kind === "implementation_admitted") {
      if (payload !== null) join("implementation_admitted:payload.implementationSetRef", payload.implementationSetRef, position);
    } else if (kind === "invocation_admitted") {
      if (payload !== null) join("invocation_admitted:payload.invocationAdmissionRef", payload.invocationAdmissionRef, position);
    }
    if (kind === "c_call_fibre_selected") {
      join("c_call_fibre_selected:aggregateId", row.aggregateId, position);
      fibreBases.set(position, row.basisId);
    }
    if (kind === "c_call_result_admitted" || kind === "c_call_fibre_selected" ||
      kind === "actor_invocation_failed" || kind === "actor_process_termination_unconfirmed") {
      const value = payload?.value;
      const task = supportObject(value) ? value.task : undefined;
      if (task === undefined && kind === "c_call_result_admitted" && supportObject(value) &&
        (value.kind === "native_workspace_work_observation" || value.kind === "native_workspace_work_failure")) nativeBasisCauses.push(causes.length);
      causes.push({ position, kind, eventId: row.eventId, admissionOrdinal: row.admissionOrdinal, basisId: row.basisId,
        aggregateId: row.aggregateId, failure: payload?.resultClass === "failure", nativeRoot: nativeRootOf(task) });
    }
  }
  // A prospective native Result's task is its basis's admitted raw input, in any list order.
  for (const index of nativeBasisCauses) causes[index] = { ...causes[index]!, nativeRoot: nativeRootOf(basisInputs.get(causes[index]!.basisId)) };
  // A C0 failure Result's request is its fibre's basis request (c_call_outcome.ts:331-333).
  for (const cause of causes)
    if (cause.kind === "c_call_fibre_selected" && subjectBases.has(cause.basisId)) subjectCalls.add(cause.aggregateId);
  const selected = (selector: string, value: unknown): readonly number[] => joins.get(selector)?.get(value) ?? [];
  const before = (cause: WorksiteCause): readonly RuntimeEvent[] => {
    const rows = new Set<number>();
    const take = (selector: string, value: unknown) => {
      for (const position of selected(selector, value)) if (ordinals[position]! < cause.admissionOrdinal) rows.add(position);
    };
    const fibreSupport = (basisId: unknown, cCallRef: unknown) => {
      take("basis_admitted:basisId", basisId);
      take("c_call_opened:aggregateId", cCallRef);
      take("c_call_fibre_selected:aggregateId", cCallRef);
      for (const position of selected("basis_admitted:basisId", basisId)) {
        const links = basisLinks.get(position);
        if (links === undefined || ordinals[position]! >= cause.admissionOrdinal) continue;
        const [invocationAdmissionRef, implementationSetRef, parentExecutionBasisRef, workspaceBindingIdentity] = links;
        take("invocation_admitted:payload.invocationAdmissionRef", invocationAdmissionRef);
        take("implementation_admitted:payload.implementationSetRef", implementationSetRef);
        take("basis_admitted:payload.basisRef", parentExecutionBasisRef);
        take("c_call_opened:basisId", parentExecutionBasisRef);
        take("public_operation_artifact_admitted:payload.artifactRef", workspaceBindingIdentity);
      }
    };
    if (cause.kind === "c_call_fibre_selected") fibreSupport(cause.basisId, cause.aggregateId);
    if (cause.kind === "c_call_result_admitted") {
      take("c_call_evidenced:aggregateId", cause.aggregateId);
      // A prospective native Result's physical scope reads its own basis input.
      if (cause.nativeRoot !== undefined) take("basis_admitted:basisId", cause.basisId);
      if (cause.failure) for (const position of selected("c_call_fibre_selected:aggregateId", cause.aggregateId))
        if (ordinals[position]! < cause.admissionOrdinal) fibreSupport(fibreBases.get(position), cause.aggregateId);
    }
    return [...rows].sort((left, right) => left - right).map(position => priorEvents[position]!);
  };
  return { causes, subjectBases, subjectCalls, before };
}

/** The last cause and the last establishment of the basis subject among the
 * causes in `priorEvents`. Each cause is joined over its own support only; a
 * C0 cause whose basis or call cannot name the subject is not joined, since
 * its request cannot match below. */
function worksiteBasisCauseOrdinals(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[], ownedPrefix?: RuntimeEventPrefix):
  Readonly<{ lastCause: number; lastEstablishment: number }> | null {
  if (!isRecord(event.payload) || !isWorksiteFileReplaceRequest(event.payload.rawInputValue)) return null;
  const request = event.payload.rawInputValue;
  const canonicalRoot = request.workspaceAuthorityBasis.canonicalRoot, relativePath = request.subject.relativePath;
  const support = worksiteCauseSupport(priorEvents, canonicalRoot, relativePath);
  let lastCause = 0, lastEstablishment = 0;
  for (const cause of support.causes) {
    const row = priorEvents[cause.position]!;
    const transition = cause.kind === "c_call_result_admitted" && support.subjectCalls.has(cause.aggregateId)
      ? worksiteTransitionForResult(row, support.before(cause)) : null;
    const selected = cause.kind === "c_call_fibre_selected" && support.subjectBases.has(cause.basisId)
      ? projectWorksiteSelectedOccurrence(row, support.before(cause)) : null;
    const causeRequest = transition?.request ?? selected?.request;
    if (causeRequest !== undefined && causeRequest.workspaceAuthorityBasis.canonicalRoot === canonicalRoot &&
      causeRequest.subject.relativePath === relativePath) {
      lastCause = Math.max(lastCause, cause.admissionOrdinal);
      if (transition?.after === request.predecessorObservation.observationRef && transition.successorObservation !== null)
        lastEstablishment = Math.max(lastEstablishment, cause.admissionOrdinal);
    }
    const unknown = cause.kind === "actor_invocation_failed" || cause.kind === "actor_process_termination_unconfirmed";
    // The cut before a cause refuses a cause absent from ownedPrefix. Only an
    // unknown-effect cause reads the cut; another cause keeps the refusal.
    const ownedBefore = ownedPrefix === undefined ? undefined
      : unknown || ownedPrefix.kind !== "validated_runtime_event_prefix" || runtimeEventAtPrefix(ownedPrefix, cause.eventId) === undefined
        ? validatedRuntimeEventPrefixBeforeEvent(ownedPrefix, cause.eventId) : undefined;
    // With ownedPrefix the unknown-effect task reads that cut, not the list.
    const native = unknown ? nativeWorkPhysicalScope(row, ownedPrefix === undefined
      ? priorEvents.filter(prior => prior.admissionOrdinal < cause.admissionOrdinal) : [], ownedBefore)
      : cause.kind === "c_call_result_admitted" && cause.nativeRoot === canonicalRoot ? nativeWorkPhysicalScope(row, support.before(cause)) : null;
    if (native?.canonicalRoot === canonicalRoot && native.affectsPath(relativePath))
      lastCause = Math.max(lastCause, cause.admissionOrdinal);
  }
  return { lastCause, lastEstablishment };
}

/** A raw basis carries a value, not a new physical observation occurrence. */
function worksiteBasisMayEstablish(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[], ownedPrefix?: RuntimeEventPrefix): boolean {
  const ordinals = worksiteBasisCauseOrdinals(event, priorEvents, ownedPrefix);
  return ordinals !== null && (ordinals.lastCause === 0 || ordinals.lastEstablishment >= ordinals.lastCause);
}

/** Physical target selection is shared; each caller retains its authenticated
 * cause and exact affected scope. Immutable bindings do not partition a file. */
function retiredWorksiteObservations(canonicalRoot: string, affectsPath: (path: string) => boolean,
  priorEvents: readonly RuntimeEvent[]): readonly string[] {
  const retired = new Set<string>();
  for (const row of priorEvents) {
    if (!isRecord(row.payload)) continue;
    const request = row.kind === "basis_admitted" ? row.payload.rawInputValue :
      row.kind === "c_call_evidenced" && row.payload.evidenceClass === "worksite_file_replace" ? row.payload.request : null;
    if (!isWorksiteFileReplaceRequest(request) ||
      request.workspaceAuthorityBasis.canonicalRoot !== canonicalRoot ||
      !affectsPath(request.subject.relativePath)) continue;
    retired.add(request.predecessorObservation.observationRef);
    if (row.kind === "c_call_evidenced" && isWorksiteObservation(row.payload.successorObservation))
      retired.add(row.payload.successorObservation.observationRef);
  }
  return [...retired];
}

function retryFluentIdentityForEvent(
  event: RuntimeEvent,
  name: RetryFluentName,
  authorityRef: string,
): string | null {
  const retryBoundaryRef = stringField(event, "retryBoundaryRef");
  return event.runId === undefined || event.graphCallId === undefined ||
      event.frameId === undefined || retryBoundaryRef === null
    ? null
    : constructRetryFluentIdentity(name, {
        runId: event.runId,
        graphCallId: event.graphCallId,
        frameId: event.frameId,
        retryBoundaryRef,
        authorityRef,
      });
}

function consumedAvailabilityFluents(
  ref: string,
  event: RuntimeEvent,
  priorEvents: readonly RuntimeEvent[],
): readonly string[] {
  if (ref.startsWith("judgment://")) {
    return [fluent("c_call_judgment_available", ref)];
  }
  if (ref.startsWith("child-foldback://")) {
    return [fluent("child_foldback_available", ref)];
  }
  if (ref.startsWith("child-preparation-refusal://")) {
    return [fluent("child_preparation_refused", ref)];
  }
  if (ref.startsWith("retry-progress://")) {
    const cited = priorEvents.filter((candidate) =>
      candidate.kind === "retry_progress_recorded" &&
      candidate.runId === event.runId &&
      candidate.graphCallId === event.graphCallId &&
      candidate.frameId === event.frameId &&
      stringField(candidate, "progressRef") === ref &&
      event.causationEventRefs.includes(candidate.eventId)
    );
    if (cited.length !== 1) return [];
    const identity = retryFluentIdentityForEvent(
      cited[0]!,
      "retry_progress_available",
      ref,
    );
    return identity === null
      ? []
      : [fluent("retry_progress_available", identity)];
  }
  if (ref.startsWith("graph-function-application://")) {
    return [
      fluent("fan_out_vector_available", ref),
      fluent("fan_out_partial_stop_available", ref),
    ];
  }
  return [];
}

interface RuntimeEffectHistory {
  readonly byId: Pick<Map<string, RuntimeEvent>, "get">;
  readonly prefix?: RuntimeEventPrefix;
  readonly interruptedScopes: ReadonlySet<string>;
  readonly frameProbeScopes: ReadonlyMap<string, ReadonlySet<string>>;
  readonly cCallProbeScopes: ReadonlyMap<string, ReadonlySet<string>>;
}

function eventCalculusEffectRefs(
  eventOrKind: RootEventKind | Pick<RuntimeEvent, "kind" | "payload">,
  priorEvents: readonly RuntimeEvent[] = [],
  history?: RuntimeEffectHistory,
): EventCalculusEffectRefs {
  if (typeof eventOrKind === "string") return ROOT_EVENT_CALCULUS[eventOrKind];
  const event = eventOrKind as RuntimeEvent;
  switch (event.kind) {
    case "basis_admitted": {
      const observationRef = worksiteBasisMayEstablish(event, priorEvents, history?.prefix)
        ? projectWorksiteBasisObservation(event, priorEvents) : null;
      return {
        initiates: [
          fluent("basis_admitted", event.basisId ?? event.eventId),
          ...(observationRef === null
            ? []
            : [fluent("worksite_observation_current", observationRef)]),
        ],
        terminates: [], clips: [], declips: [],
      };
    }
    case "public_operation_artifact_admitted": {
      const authorityScopeRef = stringField(event, "authorityScopeRef");
      if (authorityScopeRef === null) {
        throw new TypeError(
          "artifact admission requires one authority-scope fluent identity",
        );
      }
      return {
        initiates: [
          fluent("public_operation_artifact_available", authorityScopeRef),
        ],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "declaration_reprice_admitted": {
      const repriceRef = stringField(event, "repriceRef");
      return {
        initiates: repriceRef === null
          ? []
          : [fluent("declaration_reprice_admitted", repriceRef)],
        terminates: [], clips: [], declips: [],
      };
    }
    case "replay_log_attested": {
      const attestationRef = stringField(event, "attestationRef");
      return {
        initiates: attestationRef === null
          ? []
          : [fluent("replay_log_attested", attestationRef)],
        terminates: [], clips: [], declips: [],
      };
    }
    case "workspace_hygiene_stamped": {
      const hygieneRef = stringField(event, "hygieneRef");
      return {
        initiates: hygieneRef === null
          ? []
          : [fluent("workspace_hygiene_stamped", hygieneRef)],
        terminates: [], clips: [], declips: [],
      };
    }
    case "defect_intake_admitted": {
      const intakeRef = stringField(event, "intakeRef");
      return {
        initiates: intakeRef === null
          ? []
          : [fluent("defect_intake_admitted", intakeRef)],
        terminates: [], clips: [], declips: [],
      };
    }
    case "run_resumed":
      return {
        initiates: event.runId === undefined
          ? []
          : [fluent("run_active", event.runId)],
        terminates: event.runId === undefined
          ? []
          : [fluent("operator_run_stopped", event.runId)],
        clips: [], declips: [],
      };
    case "run_segment_opened":
      return {
        initiates: [fluent("run_active", event.runId ?? event.aggregateId)],
        terminates: [],
        clips: [],
        declips: [],
      };
    case "graph_call_opened": {
      const graphCallId = event.graphCallId ?? event.aggregateId;
      const parentFrameId = stringField(event, "parentFrameId");
      return {
        initiates: [
          fluent("graph_call_active", graphCallId),
          ...(parentFrameId === null
            ? []
            : [fluent("parent_waiting_on_child", graphCallId)]),
        ],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "frame_opened":
      return {
        initiates: [
          fluent("frame_active", event.frameId ?? event.aggregateId),
        ],
        terminates: [],
        clips: [],
        declips: [],
      };
    case "traversal_cursor_entered": {
      const cursorRef = stringField(event, "cursorRef");
      return {
        initiates: cursorRef === null
          ? []
          : [fluent("locus_active", cursorRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "c_call_opened":
      return {
        initiates: [fluent("c_call_active", event.aggregateId)],
        terminates: [],
        clips: [],
        declips: [],
      };
    case "c_call_fibre_selected": {
      const selected = projectWorksiteSelectedOccurrence(event, priorEvents);
      return {
        initiates: [fluent("c_call_fibre_admitted", event.aggregateId)],
        terminates: selected === null ? [] : retiredWorksiteObservations(
          selected.request.workspaceAuthorityBasis.canonicalRoot,
          path => path === selected.request.subject.relativePath, priorEvents)
          .map(ref => fluent("worksite_observation_current", ref)),
        clips: [], declips: [],
      };
    }
    case "actor_transport_binding_admitted":
      return {
        initiates: [fluent("actor_transport_binding_admitted", event.aggregateId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_result_artifact_observed":
      return {
        initiates: [fluent("actor_result_artifact_available", event.eventId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_invocation_started":
      return {
        initiates: [fluent("actor_invocation_active", event.aggregateId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_started":
      return {
        initiates: [fluent("actor_process_active", event.aggregateId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_stdout_observed":
    case "actor_process_stderr_observed":
      return {
        initiates: [fluent(
          event.kind === "actor_process_stdout_observed"
            ? "actor_stdout_available"
            : "actor_stderr_available",
          event.eventId,
        )],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_timeout_observed":
      return {
        initiates: [fluent("actor_process_timed_out", event.aggregateId)],
        terminates: [], clips: [], declips: [],
      };
    case "runtime_activity_probe_observed":
    case "runtime_external_interruption_observed": {
      const observation = isRecord(event.payload) ? event.payload.observation : null;
      if (!isRuntimeProbeObservation(observation)) throw new TypeError("invalid native runtime probe");
      const identity = observation.scopeDigest;
      if (event.kind === "runtime_external_interruption_observed") return {
        initiates: [fluent("runtime_externally_interrupted", identity), fluent("runtime_invocation_blocked", identity)],
        terminates: [fluent("runtime_invocation_active", identity)], clips: [], declips: [],
      };
      if (observation.coverage !== "observed" || observation.signal === "coverage") return {
        initiates: [], terminates: [], clips: [], declips: [],
      };
      const contract = isRecord(event.payload) ? event.payload.probeContract : null;
      const frameOccurrence = isRuntimeSystemProbeContract(contract) && contract.scope.actorInvocationRef === null && contract.scope.cCallRef === null;
      const producer = observation.underlyingEventRef === null ? undefined : history?.byId.get(observation.underlyingEventRef);
      const ended = history === undefined
        ? priorEvents.some(row => row.eventId === observation.underlyingEventRef &&
            (frameOccurrence ? row.kind === "frame_closed" : row.kind === "c_call_judged")) ||
          priorEvents.some(row => row.kind === "runtime_external_interruption_observed" && isRecord(row.payload) &&
            isRuntimeProbeObservation(row.payload.observation) && row.payload.observation.scopeDigest === identity)
        : (frameOccurrence ? producer?.kind === "frame_closed" : producer?.kind === "c_call_judged") ||
          history.interruptedScopes.has(identity);
      return {
        initiates: [fluent("runtime_activity_recent", identity), ...(ended ? [] : [fluent("runtime_invocation_active", identity)])],
        terminates: ended ? [fluent("runtime_invocation_active", identity)] : [], clips: [fluent("runtime_inactivity_asserted", identity)], declips: [],
      };
    }
    case "actor_process_signal_requested":
      return {
        initiates: [fluent("actor_process_signal_requested", event.eventId)],
        terminates: [], clips: [], declips: [],
      };
    case "actor_process_termination_unconfirmed":
      return {
        initiates: [fluent("actor_cleanup_live", event.aggregateId)],
        terminates: projectNativeWorkRetiredObservations(event, priorEvents, history?.prefix)
          .map(ref => fluent("worksite_observation_current", ref)), clips: [], declips: [],
      };
    case "actor_process_spawn_failed":
    case "actor_process_exited":
      return {
        initiates: [fluent(
          event.kind === "actor_process_exited"
            ? "actor_process_exited"
            : "actor_process_spawn_failed",
          event.aggregateId,
        )],
        terminates: [fluent("actor_process_active", event.aggregateId)],
        clips: [], declips: [],
      };
    case "actor_invocation_closed":
    case "actor_invocation_failed":
      {
      const transportBindingRef = stringField(event, "consumedTransportBindingRef");
      const stdoutEventRefs = stringArrayField(event, "consumedStdoutEventRefs");
      const stderrEventRefs = stringArrayField(event, "consumedStderrEventRefs");
      const artifactEventRef = stringField(event, "consumedArtifactEventRef");
      return {
        initiates: [fluent(
          event.kind === "actor_invocation_closed"
            ? "actor_invocation_closed"
            : "actor_invocation_failed",
          event.aggregateId,
        )],
        terminates: [
          fluent("actor_invocation_active", event.aggregateId),
          ...projectNativeWorkRetiredObservations(event, priorEvents, history?.prefix).map(ref => fluent("worksite_observation_current", ref)),
          ...(transportBindingRef === null
            ? []
            : [fluent("actor_transport_binding_admitted", transportBindingRef)]),
          ...stdoutEventRefs.map((ref) => fluent("actor_stdout_available", ref)),
          ...stderrEventRefs.map((ref) => fluent("actor_stderr_available", ref)),
          ...(artifactEventRef === null
            ? []
            : [fluent("actor_result_artifact_available", artifactEventRef)]),
        ],
        clips: [], declips: [],
      };
      }
    case "c_call_evidenced": {
      const evidenceRef = stringField(event, "evidenceRef");
      return {
        initiates: evidenceRef === null
          ? []
          : [fluent("c_call_evidence_available", evidenceRef)],
        terminates: [fluent("c_call_fibre_admitted", event.aggregateId)],
        clips: [],
        declips: [],
      };
    }
    case "c_call_result_admitted": {
      const resultRef = stringField(event, "resultRef");
      const evidenceRefs = stringArrayField(event, "evidenceRefs");
      const worksite = worksiteTransitionForResult(event, priorEvents);
      const retiredWorksite = worksite === null ? [] : retiredWorksiteObservations(
        worksite.request.workspaceAuthorityBasis.canonicalRoot,
        path => path === worksite.request.subject.relativePath, priorEvents);
      // The successful after observation is already carried by the preceding
      // evidence, but this Result establishes it as current rather than stale.
      return {
        initiates: [
          ...(resultRef === null
            ? []
            : [fluent("c_call_result_available", resultRef)]),
          ...(worksite === null || worksite.after === null
            ? []
            : [fluent("worksite_observation_current", worksite.after)]),
        ],
        terminates: [
          ...evidenceRefs.map((evidenceRef) =>
            fluent("c_call_evidence_available", evidenceRef)
          ),
          ...(worksite === null ? [] : [...new Set([worksite.before, ...retiredWorksite])]
            .filter(ref => ref !== worksite.after).map(ref => fluent("worksite_observation_current", ref))),
          ...projectNativeWorkRetiredObservations(event, priorEvents, history?.prefix).map(ref => fluent("worksite_observation_current", ref)),
        ],
        clips: [],
        declips: [],
      };
    }
    case "c_call_judged": {
      const judgmentRef = stringField(event, "judgmentRef");
      const resultRef = stringField(event, "resultRef");
      return {
        initiates: judgmentRef === null
          ? []
          : [fluent("c_call_judgment_available", judgmentRef)],
        terminates: [
          fluent("c_call_active", event.aggregateId),
          ...(runtimeEventProfile(event)?.nativeLiveness === true ? history !== undefined
            ? [...(history.cCallProbeScopes.get(event.aggregateId) ?? [])].map(scope => fluent("runtime_invocation_active", scope))
            : [...new Set(priorEvents.flatMap(row => {
            if (row.kind !== "runtime_activity_probe_observed" || !isRecord(row.payload) ||
                !isRuntimeSystemProbeContract(row.payload.probeContract) || !isRuntimeProbeObservation(row.payload.observation) ||
                row.payload.probeContract.scope.cCallRef !== event.aggregateId) return [];
            return [fluent("runtime_invocation_active", row.payload.observation.scopeDigest)];
          }))] : []),
          ...(resultRef === null
            ? []
            : [fluent("c_call_result_available", resultRef)]),
        ],
        clips: [],
        declips: [],
      };
    }
    case "assessed": {
      const assessmentRef = stringField(event, "assessmentRef");
      return {
        initiates: assessmentRef === null
          ? []
          : [fluent("result_assessment_admitted", assessmentRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "retry_attempt_opened": {
      const attemptRef = stringField(event, "attemptRef");
      const identity = attemptRef === null
        ? null
        : retryFluentIdentityForEvent(
            event,
            "retry_attempt_active",
            attemptRef,
          );
      return {
        initiates: identity === null
          ? []
          : [fluent("retry_attempt_active", identity)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "retry_progress_recorded": {
      const attemptRef = stringField(event, "attemptRef");
      const progressRef = stringField(event, "progressRef");
      const attemptIdentity = attemptRef === null
        ? null
        : retryFluentIdentityForEvent(
            event,
            "retry_attempt_active",
            attemptRef,
          );
      const progressIdentity = progressRef === null
        ? null
        : retryFluentIdentityForEvent(
            event,
            "retry_progress_available",
            progressRef,
          );
      return {
        initiates: progressIdentity === null
          ? []
          : [fluent("retry_progress_available", progressIdentity)],
        terminates: attemptIdentity === null
          ? []
          : [fluent("retry_attempt_active", attemptIdentity)],
        clips: [],
        declips: [],
      };
    }
    case "child_foldback_admitted": {
      const foldbackRef = stringField(event, "foldbackRef");
      const childGraphCallId = stringField(event, "childGraphCallId");
      const childFrameId = stringField(event, "childFrameId");
      const childDisposition = stringField(event, "childDisposition");
      const applicationRef = stringField(event, "applicationRef");
      const childStopped =
        childDisposition === "blocked" || childDisposition === "failed";
      return {
        initiates:
          applicationRef !== null && foldbackRef !== null
            ? [fluent("child_foldback_available", foldbackRef)]
            : [],
        terminates: [
          ...(childGraphCallId === null
            ? []
            : [fluent("parent_waiting_on_child", childGraphCallId)]),
          ...(childStopped && childFrameId !== null
            ? [
              fluent("frame_active", childFrameId),
              fluent("frame_blocked", childFrameId),
              fluent("frame_failed", childFrameId),
            ]
            : []),
          ...(childStopped && childGraphCallId !== null
            ? [fluent("graph_call_active", childGraphCallId)]
            : []),
        ],
        clips: [],
        declips: [],
      };
    }
    case "child_preparation_refused": {
      const refusalRef = stringField(event, "refusalRef");
      return {
        initiates: refusalRef === null
          ? []
          : [fluent("child_preparation_refused", refusalRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "fan_out_completion_admitted": {
      const applicationRef = stringField(event, "applicationRef");
      const completionKind = stringField(event, "completionKind");
      return {
        initiates: applicationRef === null
          ? []
          : completionKind === "complete_vector"
            ? [fluent("fan_out_vector_available", applicationRef)]
            : completionKind === "partial_stop"
              ? [fluent("fan_out_partial_stop_available", applicationRef)]
              : [],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "fh_interaction_opened": {
      const continuationRef = stringField(event, "continuationRef");
      const holdRouteRef = stringField(event, "holdRouteRef");
      const constructionIntentRef = stringField(
        event,
        "constructionIntentRef",
      );
      return {
        initiates: continuationRef === null
          ? []
          : [
              fluent("continuation_open", continuationRef),
              fluent("interaction_pending", continuationRef),
              fluent("frame_held", event.frameId ?? ""),
            ],
        terminates: [
          ...(holdRouteRef === null
            ? []
            : [fluent("hold_route_admitted", holdRouteRef)]),
          ...(constructionIntentRef === null
            ? []
            : [
                fluent(
                  "construction_intent_available",
                  constructionIntentRef,
                ),
              ]),
        ],
        clips: [],
        declips: [],
      };
    }
    case "construction_continuation_opened": {
      const continuationRef = stringField(event, "continuationRef");
      return { initiates: continuationRef === null ? [] : [fluent("continuation_open", continuationRef)],
        terminates: [], clips: [], declips: [] };
    }
    case "construction_intent_selected": {
      const constructionIntentRef = stringField(
        event,
        "constructionIntentRef",
      );
      return {
        initiates: constructionIntentRef === null
          ? []
          : [
              fluent(
                "construction_intent_available",
                constructionIntentRef,
              ),
            ],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "construction_delta_observed": {
      const constructionIntentRef = stringField(
        event,
        "constructionIntentRef",
      );
      return {
        initiates: [],
        terminates: constructionIntentRef === null
          ? []
          : [
              fluent(
                "construction_intent_available",
                constructionIntentRef,
              ),
              ...(stringField(event, "continuationRef") === null ? []
                : [fluent("continuation_open", stringField(event, "continuationRef")!)]),
            ],
        clips: [],
        declips: [],
      };
    }
    case "fh_interaction_responded":
    case "fh_interaction_resume_admitted":
    case "continuation_abandoned":
    case "continuation_superseded": {
      // Human response and same-Run resumption are reserved to 5.1. These kinds
      // stay declared for it and have no 5.0 reader, and neither has an F_H
      // supersession: a log that carries one is refused here, never folded as
      // if the event were absent. Construction supersession is live.
      const continuationKind = stringField(event, "continuationKind");
      if (
        event.kind !== "continuation_superseded" ||
        (continuationKind !== "construction_intent" &&
          continuationKind !== "selected_action" &&
          continuationKind !== "pending_execution")
      ) {
        throw new TypeError(
          `continuation ${event.aggregateId} has an invalid event lifecycle`,
        );
      }
      const continuationRef = stringField(event, "continuationRef");
      return {
        initiates: continuationRef === null
          ? []
          : [fluent("continuation_superseded", continuationRef)],
        terminates: continuationRef === null
          ? []
          : [
              fluent("continuation_open", continuationRef),
              fluent("interaction_pending", continuationRef),
              fluent("continuation_response_available", continuationRef),
              ...(continuationKind === "selected_action" && stringField(event, "constructionIntentRef") !== null
                ? [fluent("construction_intent_available", stringField(event, "constructionIntentRef")!)] : []),
            ],
        clips: [], declips: [],
      };
    }
    case "continuation_reentry_link_admitted": {
      const linkRef = stringField(event, "linkRef");
      return {
        initiates: linkRef === null
          ? []
          : [fluent("continuation_reentry_link_available", linkRef)],
        terminates: [], clips: [], declips: [],
      };
    }
    case "traversal_route_admitted":
      break;
    case "runtime_failure_observed":
      return {
        initiates: [fluent("runtime_failure", event.eventId)],
        terminates: [
          ...(event.frameId === undefined
            ? []
            : [
                fluent("frame_active", event.frameId),
                ...observedFrameRuntimeFluents(event, priorEvents, history),
              ]),
          ...(event.aggregateType !== "run" || event.graphCallId === undefined
            ? []
            : [fluent("graph_call_active", event.graphCallId)]),
          ...(event.aggregateType !== "run" || event.runId === undefined
            ? []
            : [fluent("run_active", event.runId)]),
        ],
        clips: [],
        declips: [],
      };
    case "run_stopped":
      if (stringField(event, "reasonKind") !== null) {
        return {
          initiates: event.runId === undefined
            ? []
            : [fluent("operator_run_stopped", event.runId)],
          terminates: event.runId === undefined
            ? []
            : [fluent("run_active", event.runId)],
          clips: [],
          declips: [],
        };
      }
      return {
        initiates: event.runId === undefined
          ? []
          : [fluent("run_terminal", event.runId)],
        terminates: [
          ...(event.frameId === undefined
            ? []
            : [
                fluent("frame_active", event.frameId),
                fluent("frame_blocked", event.frameId),
                fluent("frame_failed", event.frameId),
              ]),
          ...(event.graphCallId === undefined
            ? []
            : [fluent("graph_call_active", event.graphCallId)]),
          ...(event.runId === undefined
            ? []
            : [fluent("run_active", event.runId)]),
        ],
        clips: [],
        declips: [],
      };
    case "terminal_reached": {
      const routeRef = stringField(event, "routeRef");
      return {
        initiates: event.frameId === undefined
          ? []
          : [fluent("terminal_admitted", event.frameId)],
        terminates: routeRef === null
          ? []
          : [fluent("terminal_route_available", routeRef)],
        clips: [],
        declips: [],
      };
    }
    case "frame_closed":
      return {
        initiates: event.frameId === undefined
          ? []
          : [fluent("frame_closed", event.frameId)],
        terminates: event.frameId === undefined
          ? []
          : [fluent("frame_active", event.frameId), ...observedFrameRuntimeFluents(event, priorEvents, history)],
        clips: [],
        declips: [],
      };
    case "graph_call_closed":
      return {
        initiates: event.graphCallId === undefined
          ? []
          : [fluent("graph_call_closed", event.graphCallId)],
        terminates: event.graphCallId === undefined
          ? []
          : [fluent("graph_call_active", event.graphCallId)],
        clips: [],
        declips: [],
      };
    case "run_closed":
      return {
        initiates: event.runId === undefined
          ? []
          : [fluent("run_closed", event.runId)],
        terminates: event.runId === undefined
          ? []
          : [fluent("run_active", event.runId)],
        clips: [],
        declips: [],
      };
    default:
      return ROOT_EVENT_CALCULUS[event.kind];
  }
  if (!isRecord(eventOrKind.payload)) {
    throw new TypeError("traversal route event requires a closed payload");
  }
  const sourceCursorRef = stringField(event, "sourceCursorRef");
  const targetCursorRef = stringField(event, "targetCursorRef");
  const routeRef = stringField(event, "routeRef");
  const judgmentRef = stringField(event, "judgmentRef");
  const constructionIntentRef = stringField(
    event,
    "constructionIntentRef",
  );
  const consumedFluents = stringArrayField(
    event,
    "consumedAvailabilityRefs",
  ).flatMap((ref) => consumedAvailabilityFluents(ref, event, priorEvents));
  switch (eventOrKind.payload.routeKind) {
    case "advance":
    case "re_enter":
      return {
        initiates: [
          ...(targetCursorRef === null
            ? []
            : [fluent("locus_active", targetCursorRef)]),
          ...(constructionIntentRef === null
            ? []
            : [
                fluent(
                  "construction_intent_available",
                  constructionIntentRef,
                ),
              ]),
        ],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "retry":
      return {
        initiates: targetCursorRef === null
          ? []
          : [fluent("locus_active", targetCursorRef)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "terminal":
      return {
        initiates: routeRef === null
          ? []
          : [fluent("terminal_route_available", routeRef)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(judgmentRef === null
            ? []
            : [fluent("c_call_judgment_available", judgmentRef)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "hold":
      return {
        initiates: routeRef === null
          ? []
          : [fluent("hold_route_admitted", routeRef)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "gap_stop":
      return {
        initiates: [],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...(judgmentRef === null
            ? []
            : [fluent("c_call_judgment_available", judgmentRef)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "blocked":
      return {
        initiates: event.frameId === undefined
          ? []
          : [fluent("frame_blocked", event.frameId)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    case "failed":
      return {
        initiates: event.frameId === undefined
          ? []
          : [fluent("frame_failed", event.frameId)],
        terminates: [
          ...(sourceCursorRef === null
            ? []
            : [fluent("locus_active", sourceCursorRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...consumedFluents,
        ],
        clips: [],
        declips: [],
      };
    default:
      throw new TypeError("traversal route event carries an unknown route kind");
  }
}

export function declaredRuntimeEventCalculusTerminationNames(
  event: Pick<RuntimeEvent, "kind" | "payload">,
): readonly string[] {
  const declaration = ROOT_EVENT_CALCULUS[event.kind] as EventCalculusEffectRefs & {
    readonly conditionalTerminates?: readonly {
      readonly name: string;
      readonly identityPayloadKey: string;
      readonly unlessPayload: Readonly<Record<string, string>>;
    }[];
  };
  const payload = isRecord(event.payload) ? event.payload : {};
  return Object.freeze([
    ...declaration.terminates,
    ...(declaration.conditionalTerminates ?? []).flatMap((conditional) =>
      typeof payload[conditional.identityPayloadKey] === "string" &&
          !Object.entries(conditional.unlessPayload).every(([key, value]) =>
            payload[key] === value
          )
        ? [conditional.name]
        : []
    ),
  ]);
}

function assertFluentName(name: string): void {
  if (name.length === 0 || name.includes("(") || name.includes(")")) {
    throw new TypeError("Runtime fluent name must be non-empty and cannot contain parentheses");
  }
}

export function constructRuntimeFluent(
  input: RuntimeFluentInput,
): RuntimeFluent {
  assertFluentName(input.name);
  const identity = input.identity ?? null;
  if (identity !== null && identity.length === 0) {
    throw new TypeError("Runtime fluent identity must be non-empty when present");
  }
  return deepFreeze({
    kind: "runtime_fluent" as const,
    name: input.name,
    identity,
    fluentRef: identity === null ? input.name : `${input.name}(${identity})`,
  }) as RuntimeFluent;
}

export function constructRuntimeFluentPattern(
  input: RuntimeFluentPatternInput,
): RuntimeFluentPattern {
  const name = input.name ?? null;
  const identity = input.identity ?? null;
  if (name !== null) assertFluentName(name);
  if (identity !== null && identity.length === 0) {
    throw new TypeError("Runtime fluent-pattern identity must be non-empty when present");
  }
  if (name === null && identity === null) {
    throw new TypeError("Runtime fluent pattern must constrain name or identity");
  }
  return deepFreeze({
    kind: "runtime_fluent_pattern" as const,
    name,
    identity,
  }) as RuntimeFluentPattern;
}

function validateRuntimeFluent(fluent: RuntimeFluent): void {
  if (fluent.kind !== "runtime_fluent") {
    throw new TypeError("Runtime fluent must carry runtime_fluent kind");
  }
  const constructed = constructRuntimeFluent({
    name: fluent.name,
    identity: fluent.identity,
  });
  if (constructed.fluentRef !== fluent.fluentRef) {
    throw new TypeError("Runtime fluent reference is not canonical");
  }
}

function validateRuntimeFluentPattern(pattern: RuntimeFluentPattern): void {
  if (pattern.kind !== "runtime_fluent_pattern") {
    throw new TypeError("Runtime fluent pattern must carry runtime_fluent_pattern kind");
  }
  constructRuntimeFluentPattern({
    name: pattern.name,
    identity: pattern.identity,
  });
}

export function runtimeFluentKey(fluent: RuntimeFluent): string {
  validateRuntimeFluent(fluent);
  return fluent.fluentRef;
}

export function runtimeFluentPatternKey(
  pattern: RuntimeFluentPattern,
): string {
  validateRuntimeFluentPattern(pattern);
  return ownedRuntimeFluentPatternKey(pattern);
}

/** @internal */
export function ownedRuntimeFluentPatternKey(pattern: RuntimeFluentPattern): string {
  return JSON.stringify([pattern.name, pattern.identity]);
}

/** @internal The ref of the one fluent an exact pattern (name and identity
 * both set) can match, the key `holds` keeps it under; null for a wildcard. */
export function ownedExactRuntimeFluentPatternRef(pattern: RuntimeFluentPattern): string | null {
  return pattern.name === null || pattern.identity === null ? null : fluent(pattern.name, pattern.identity);
}

export function runtimeFluentMatchesPattern(
  fluent: RuntimeFluent,
  pattern: RuntimeFluentPattern,
): boolean {
  validateRuntimeFluent(fluent);
  validateRuntimeFluentPattern(pattern);
  return ownedRuntimeFluentMatchesPattern(fluent, pattern);
}

/** @internal */
export function ownedRuntimeFluentMatchesPattern(fluent: RuntimeFluent, pattern: RuntimeFluentPattern): boolean {
  return (pattern.name === null || pattern.name === fluent.name) &&
    (pattern.identity === null || pattern.identity === fluent.identity);
}

function runtimeFluentFromRef(fluentRef: string): RuntimeFluent {
  const separator = fluentRef.indexOf("(");
  if (separator === -1) {
    return constructRuntimeFluent({ name: fluentRef });
  }
  if (!fluentRef.endsWith(")")) {
    throw new TypeError("Runtime fluent reference is malformed");
  }
  return constructRuntimeFluent({
    name: fluentRef.slice(0, separator),
    identity: fluentRef.slice(separator + 1, -1),
  });
}

function runtimeFluentPatternFromRef(
  fluentRef: string,
): RuntimeFluentPattern {
  const fluent = runtimeFluentFromRef(fluentRef);
  return constructRuntimeFluentPattern({
    name: fluent.name,
    identity: fluent.identity,
  });
}

/** All internal inputs were constructed here or retained by this fold. Raw
 * exported helpers validate before consuming these same completion rules. */
/** @internal */
export function completeEffect(effect: EventCalculusEffect): EventCalculusEffect {
  const initiated = new Map(
    effect.initiates.map((fluent) => [fluent.fluentRef, fluent]),
  );
  const terminated = new Map(
    effect.terminates.map((fluent) => [fluent.fluentRef, fluent]),
  );
  if ([...initiated.keys()].some((key) => terminated.has(key))) {
    throw new TypeError("Event Calculus effect cannot both initiate and terminate one fluent");
  }
  return deepFreeze({
    initiates: [...initiated.values()],
    terminates: [...terminated.values()],
    clips: [...effect.clips],
    declips: [...effect.declips],
  }) as EventCalculusEffect;
}

export function validateRuntimeEventCalculusEffectForModuleTest(
  effect: EventCalculusEffect,
): EventCalculusEffect {
  for (const fluent of [...effect.initiates, ...effect.terminates]) validateRuntimeFluent(fluent);
  for (const pattern of [...effect.clips, ...effect.declips]) validateRuntimeFluentPattern(pattern);
  return completeEffect(effect);
}

export function validateRuntimeEventCalculusAxiomKindsForModuleTest(
  eventKinds: readonly RootEventKind[],
): void {
  const unique = new Set<RootEventKind>();
  for (const eventKind of eventKinds) {
    if (!Object.hasOwn(ROOT_EVENT_CALCULUS, eventKind)) {
      throw new TypeError(`Unknown Event Calculus event kind ${String(eventKind)}`);
    }
    if (unique.has(eventKind)) {
      throw new TypeError(`Duplicate Event Calculus axiom for ${eventKind}`);
    }
    unique.add(eventKind);
  }
  const missing = (Object.keys(ROOT_EVENT_CALCULUS) as RootEventKind[])
    .filter((eventKind) => !unique.has(eventKind));
  if (missing.length !== 0) {
    throw new TypeError(`Missing Event Calculus axiom for ${missing.join(",")}`);
  }
}

validateRuntimeEventCalculusAxiomKindsForModuleTest(
  Object.freeze(Object.keys(ROOT_EVENT_CALCULUS) as RootEventKind[]),
);

export function eventCalculusEffect(
  eventOrKind: RootEventKind | Pick<RuntimeEvent, "kind" | "payload">,
  priorEvents: readonly RuntimeEvent[] = [],
): EventCalculusEffect {
  return completeEventCalculusEffect(eventCalculusEffectRefs(eventOrKind, priorEvents));
}

function completeEventCalculusEffect(effect: EventCalculusEffectRefs): EventCalculusEffect {
  return completeEffect({
    initiates: effect.initiates.map(runtimeFluentFromRef),
    terminates: effect.terminates.map(runtimeFluentFromRef),
    clips: effect.clips.map(runtimeFluentPatternFromRef),
    declips: effect.declips.map(runtimeFluentPatternFromRef),
  });
}

export function constructRunActiveFluent(runId: string): RuntimeFluent {
  return constructRuntimeFluent({ name: "run_active", identity: runId });
}

export function constructRunClosedFluent(runId: string): RuntimeFluent {
  return constructRuntimeFluent({ name: "run_closed", identity: runId });
}

export function constructRunTerminalFluent(runId: string): RuntimeFluent {
  return constructRuntimeFluent({ name: "run_terminal", identity: runId });
}

/** @internal The fold's own facts the axiom effect reads: the admitted source
 * cut and the probe and interruption scopes recorded by earlier steps. */
export interface AxiomFoldContext {
  readonly source: RuntimeEventPrefix;
  readonly interruptedScopes: ReadonlySet<string>;
  readonly frameProbeScopes: ReadonlyMap<string, ReadonlySet<string>>;
  readonly cCallProbeScopes: ReadonlyMap<string, ReadonlySet<string>>;
}

/** @internal The axiom effect of one event: the kind-indexed law over the
 * event, its declared dependencies and the fold's own facts. No rule effect. */
export function axiomEffectOf(event: RuntimeEvent, dependencies: readonly RuntimeEvent[],
  context?: AxiomFoldContext): EventCalculusEffect {
  const history: RuntimeEffectHistory | undefined = context === undefined ? undefined : {
    byId: { get: (ref: string) => runtimeEventAtPrefix(context.source, ref) },
    prefix: validatedRuntimeEventPrefixBeforeEvent(context.source, event.eventId),
    interruptedScopes: context.interruptedScopes,
    frameProbeScopes: context.frameProbeScopes,
    cCallProbeScopes: context.cCallProbeScopes,
  };
  return completeEventCalculusEffect(eventCalculusEffectRefs(event, dependencies, history));
}
