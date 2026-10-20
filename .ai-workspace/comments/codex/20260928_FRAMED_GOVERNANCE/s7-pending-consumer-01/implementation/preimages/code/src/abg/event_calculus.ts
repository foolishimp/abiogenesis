import { isJsonRecord as isRecord } from "../shared/admission_predicates.js";
import { indexedRuntimeEvents } from "./event_prefix.js";
import {
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  isWorksiteEffectAuthorization,
  isWorksiteFileReplaceReceipt,
  isWorksiteFileReplaceRequest,
  isWorksiteObservation,
  type WorksiteObservation,
} from "../product/worksite_effect.js";
import {
  runtimeEventsFromValidatedPrefix,
  runtimePrefixComputation,
  type ValidatedRuntimeEventPrefix,
} from "./event_prefix.js";
import type { RootEventKind, RuntimeEvent } from "./event_store.js";
import { ROOT_EVENT_CONTRACT_DIGEST } from "./event_store.js";
import { isRuntimeProbeObservation, isRuntimeSystemProbeContract,
  type RuntimeInvocationScope, type RuntimeProbeObservation, type RuntimeSystemProbeContract } from "./runtime_liveness_contracts.js";
import { createRuntimeLivenessEventValidator } from "./runtime_liveness.js";
import { projectWorksiteFailureBasis } from "./c_call_outcome.js";
import { WORKSITE_C0_IDS } from "../gtl/worksite_c0.js";
import { NATIVE_WORKSPACE_WORK_IDS as nativeIds, isNativeWorkspaceWorkObservation,
  isNativeWorkspaceWorkFailure, nativeWorkspacePathWithin } from "../product/native_workspace_work.js";

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
  actor_process_started: {
    initiates: ["actor_process_active", "actor_process_live"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_spawn_failed: {
    initiates: ["actor_process_spawn_failed"],
    terminates: ["actor_process_active", "actor_process_live"], clips: [], declips: [],
  },
  actor_process_stdout_observed: {
    initiates: ["actor_process_live", "actor_stdout_available"],
    terminates: [], clips: [], declips: [],
  },
  actor_process_stderr_observed: {
    initiates: ["actor_process_live", "actor_stderr_available"],
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
    terminates: ["actor_process_active", "actor_process_live"], clips: [], declips: [],
  },
  actor_process_termination_unconfirmed: {
    initiates: ["actor_process_termination_unconfirmed"],
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
    terminates: ["continuation_open", "interaction_pending", "continuation_response_available"], clips: [], declips: [],
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

function stringField(
  event: Pick<RuntimeEvent, "payload">,
  name: string,
): string | null {
  if (!isRecord(event.payload)) return null;
  const value = event.payload[name];
  return typeof value === "string" ? value : null;
}

function stringArrayField(
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

function frameProbeScopeKey(scope: Pick<RuntimeInvocationScope, "frameId" | "runId" | "graphCallId" | "basisRef" | "graphFunctionRef">): string {
  return JSON.stringify([scope.frameId, scope.runId, scope.graphCallId, scope.basisRef, scope.graphFunctionRef]);
}

function observedFrameRuntimeFluents(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[], history?: RuntimeEffectHistory): readonly string[] {
  if (event.eventContractDigest !== ROOT_EVENT_CONTRACT_DIGEST || event.frameId === undefined) return [];
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

function worksiteBasisObservation(
  event: RuntimeEvent,
  priorEvents: readonly RuntimeEvent[],
): string | null {
  const payload = isRecord(event.payload) ? event.payload : null;
  const request = payload?.rawInputValue ?? null;
  if (!isWorksiteFileReplaceRequest(request) || payload === null) {
    return null;
  }
  const invocationAdmissionRef = payload.invocationAdmissionRef;
  const admissionRows = typeof invocationAdmissionRef !== "string"
    ? []
    : priorEvents.filter((row) =>
        row.kind === "invocation_admitted" &&
        isRecord(row.payload) &&
        row.payload.invocationAdmissionRef === invocationAdmissionRef
      );
  if (admissionRows.length !== 1 || !isRecord(admissionRows[0]!.payload)) {
    return null;
  }
  const admission = admissionRows[0]!.payload;
  const grants = admission.capabilityGrants;
  const admittedGrant = Array.isArray(grants) && grants.length === 1
    ? grants[0]
    : null;
  const basisClass = payload.basisClass;
  const graphFunctionAuthorized = basisClass === "root"
    ? payload.graphFunctionRef === admission.graphFunctionRef
    : basisClass === "child" &&
      typeof payload.parentExecutionBasisRef === "string" &&
      typeof payload.parentCCallRef === "string" &&
      priorEvents.filter((row) =>
        row.kind === "basis_admitted" &&
        isRecord(row.payload) &&
        row.payload.basisRef === payload.parentExecutionBasisRef &&
        row.payload.invocationAdmissionRef === invocationAdmissionRef &&
        row.payload.programRef === payload.programRef &&
        row.payload.workspaceBindingId === payload.workspaceBindingId &&
        row.payload.workspaceBindingDigest ===
          payload.workspaceBindingDigest &&
        row.payload.actorRef === payload.actorRef
      ).length === 1 &&
      priorEvents.filter((row) =>
        row.kind === "c_call_opened" &&
        row.basisId === payload.parentExecutionBasisRef &&
        isRecord(row.payload) &&
        row.payload.cCallRef === payload.parentCCallRef &&
        row.payload.callClass === "workflow" &&
        row.payload.childGraphFunctionRef === payload.graphFunctionRef
      ).length === 1;
  return admittedGrant !== null && isRecord(admittedGrant) &&
      sha256Canonical(admittedGrant) ===
        sha256Canonical(request.capabilityGrant as unknown as JsonValue) &&
      request.capabilityGrant.grantRef ===
        admittedGrant.grantRef &&
      request.capabilityGrant.grantDigest ===
        admittedGrant.grantDigest &&
      request.workspaceBindingIdentity === payload.workspaceBindingId &&
      request.workspaceBindingDigest === payload.workspaceBindingDigest &&
      request.capabilityGrant.actorRef === payload.actorRef &&
      request.capabilityGrant.scopeRef === payload.workspaceBindingId &&
      request.capabilityGrant.scopeDigest === payload.workspaceBindingDigest &&
      payload.programRef === admission.programRef &&
      graphFunctionAuthorized
    ? request.predecessorObservation.observationRef
    : null;
}

export function projectWorksiteTransitionForResult(
  event: RuntimeEvent,
  priorEvents: readonly RuntimeEvent[],
): Readonly<{
  before: string;
  after: string | null;
  successorObservation: WorksiteObservation | null;
}> | null {
  if (!isRecord(event.payload)) return null;
  const evidenceRefs = stringArrayField(event, "evidenceRefs");
  if (event.payload.resultClass === "failure") {
    const { resultRef, resultDigest, ...resultBody } = event.payload;
    const evidenceRows = priorEvents.filter(row =>
      row.kind === "c_call_evidenced" && row.aggregateId === event.aggregateId &&
      isRecord(row.payload) && evidenceRefs.includes(row.payload.evidenceRef as string));
    const evidenceEvent = evidenceRows.length === 1 ? evidenceRows[0]! : null;
    if (event.kind !== "c_call_result_admitted" || evidenceRefs.length !== 1 ||
      event.payload.cCallRef !== event.aggregateId ||
      event.payload.contractRef !== WORKSITE_C0_IDS.failureContractRef ||
      event.payload.valueKind !== "worksite_effect_refusal" ||
      resultDigest !== sha256Canonical(resultBody) ||
      resultRef !== `result://abiogenesis/${String(resultDigest).slice("sha256:".length)}` ||
      event.payload.valueDigest !== sha256Canonical(event.payload.value!) ||
      evidenceEvent === null || !isRecord(evidenceEvent.payload) ||
      evidenceEvent.admissionOrdinal >= event.admissionOrdinal ||
      evidenceEvent.basisId !== event.basisId || evidenceEvent.runId !== event.runId ||
      evidenceEvent.graphCallId !== event.graphCallId || evidenceEvent.frameId !== event.frameId ||
      !event.causationEventRefs.includes(evidenceEvent.eventId)) return null;
    const { evidenceRef, evidenceDigest, ...evidenceBody } = evidenceEvent.payload;
    const authenticated = projectWorksiteFailureBasis(priorEvents.filter(row =>
      row.admissionOrdinal < evidenceEvent.admissionOrdinal), event.aggregateId, event.payload.value);
    if (authenticated === null ||
      authenticated.executionBasis.basisRef !== event.basisId ||
      authenticated.cCall.runId !== event.runId ||
      evidenceBody.cCallRef !== event.aggregateId || evidenceBody.evidenceClass !== "deterministic" ||
      evidenceBody.implementationRef !== authenticated.authorization.implementationRef ||
      evidenceBody.inputDigest !== sha256Canonical(authenticated.request as unknown as JsonValue) ||
      evidenceBody.outputDigest !== event.payload.valueDigest ||
      evidenceDigest !== sha256Canonical(evidenceBody) ||
      evidenceRef !== `evidence://abiogenesis/${String(evidenceDigest).slice("sha256:".length)}`) return null;
    return { before: authenticated.request.predecessorObservation.observationRef,
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
    before: request.predecessorObservation.observationRef,
    after: successor.observationRef,
    successorObservation: successor,
  };
}

/** Known native changes retire exact paths; unknown after-state retires the
 * declared writable scope. Neither case manufactures C0 provenance or successors. */
export function projectNativeWorkRetiredObservations(event: RuntimeEvent, priorEvents: readonly RuntimeEvent[]): readonly string[] {
  if (event.kind !== "c_call_result_admitted" || !isRecord(event.payload)) return [];
  const value = event.payload.value;
  if (!(isNativeWorkspaceWorkObservation(value) || isNativeWorkspaceWorkFailure(value)) ||
    value.provenance.cCallRef !== event.aggregateId ||
    event.payload.contractRef !== (value.kind === "native_workspace_work_observation" ? nativeIds.observationContractRef : nativeIds.failureContractRef)) return [];
  const evidenceRefs = stringArrayField(event, "evidenceRefs");
  // Existing retry failure admission adds signal/source coordinates while
  // preserving the original owner candidate digest cited by transport evidence.
  const valueDigest = isRecord(event.payload.value!) && typeof event.payload.value.failureCandidateDigest === "string"
    ? event.payload.value.failureCandidateDigest : event.payload.valueDigest;
  if (!priorEvents.some(row => row.kind === "c_call_evidenced" && row.aggregateId === event.aggregateId && isRecord(row.payload) &&
    evidenceRefs.includes(row.payload.evidenceRef as string) && row.payload.evidenceClass === "probabilistic_transport" &&
    row.payload.implementationRef === nativeIds.implementationRef && row.payload.transportDigest === value.provenance.transportDigest &&
    row.payload.outputDigest === valueDigest)) return [];
  const changed = value.after === null || value.changedPaths === null ? null : new Set(value.changedPaths);
  const retired = new Set<string>();
  for (const row of priorEvents) {
    if (!isRecord(row.payload)) continue;
    const request = row.kind === "basis_admitted" ? row.payload.rawInputValue :
      row.kind === "c_call_evidenced" && row.payload.evidenceClass === "worksite_file_replace" ? row.payload.request : null;
    if (!isWorksiteFileReplaceRequest(request) || request.workspaceBindingIdentity !== value.task.workspaceBinding.bindingId ||
      request.workspaceBindingDigest !== value.task.workspaceBinding.bindingDigest ||
      !(changed === null ? nativeWorkspacePathWithin(request.subject.relativePath, value.task.writeRoots) :
        changed.has(request.subject.relativePath))) continue;
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
  readonly byId: Map<string, RuntimeEvent>;
  readonly interruptedScopes: Set<string>;
  readonly frameProbeScopes: Map<string, Set<string>>;
  readonly cCallProbeScopes: Map<string, Set<string>>;
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
      const observationRef = worksiteBasisObservation(event, priorEvents);
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
    case "c_call_fibre_selected":
      return {
        initiates: [fluent("c_call_fibre_admitted", event.aggregateId)],
        terminates: [],
        clips: [],
        declips: [],
      };
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
        initiates: [
          fluent("actor_process_active", event.aggregateId),
          fluent("actor_process_live", event.aggregateId),
        ],
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
        initiates: [fluent(
          "actor_process_termination_unconfirmed",
          event.aggregateId,
        )],
        terminates: [], clips: [], declips: [],
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
        terminates: [
          fluent("actor_process_active", event.aggregateId),
          fluent("actor_process_live", event.aggregateId),
        ],
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
      const worksite = projectWorksiteTransitionForResult(event, priorEvents);
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
          ...(worksite === null
            ? []
            : [fluent("worksite_observation_current", worksite.before)]),
          ...projectNativeWorkRetiredObservations(event, priorEvents).map(ref => fluent("worksite_observation_current", ref)),
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
          ...(event.eventContractDigest === ROOT_EVENT_CONTRACT_DIGEST ? history !== undefined
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
            ],
        clips: [],
        declips: [],
      };
    }
    case "fh_interaction_responded": {
      const continuationRef = stringField(event, "continuationRef");
      return {
        initiates: continuationRef === null
          ? []
          : [fluent("continuation_response_available", continuationRef)],
        terminates: [],
        clips: [],
        declips: [],
      };
    }
    case "fh_interaction_resume_admitted": {
      const continuationRef = stringField(event, "continuationRef");
      const successorCursorRef = stringField(event, "successorCursorRef");
      return {
        initiates: [
          ...(continuationRef === null
            ? []
            : [fluent("continuation_terminated", continuationRef)]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_active", event.frameId)]),
          ...(successorCursorRef === null
            ? []
            : [fluent("locus_active", successorCursorRef)]),
        ],
        terminates: [
          ...(continuationRef === null
            ? []
            : [
                fluent("continuation_open", continuationRef),
                fluent("interaction_pending", continuationRef),
                fluent("continuation_response_available", continuationRef),
              ]),
          ...(event.frameId === undefined
            ? []
            : [fluent("frame_held", event.frameId)]),
        ],
        clips: [],
        declips: [],
      };
    }
    case "continuation_abandoned":
    case "continuation_superseded": {
      const continuationRef = stringField(event, "continuationRef");
      return {
        initiates: continuationRef === null
          ? []
          : [fluent(
              event.kind === "continuation_abandoned"
                ? "continuation_abandoned"
                : "continuation_superseded",
              continuationRef,
            )],
        terminates: continuationRef === null
          ? []
          : [
              fluent("continuation_open", continuationRef),
              fluent("interaction_pending", continuationRef),
              fluent("continuation_response_available", continuationRef),
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

function ownedRuntimeFluentPatternKey(pattern: RuntimeFluentPattern): string {
  return JSON.stringify([pattern.name, pattern.identity]);
}

export function runtimeFluentMatchesPattern(
  fluent: RuntimeFluent,
  pattern: RuntimeFluentPattern,
): boolean {
  validateRuntimeFluent(fluent);
  validateRuntimeFluentPattern(pattern);
  return ownedRuntimeFluentMatchesPattern(fluent, pattern);
}

function ownedRuntimeFluentMatchesPattern(fluent: RuntimeFluent, pattern: RuntimeFluentPattern): boolean {
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
function completeEffect(effect: EventCalculusEffect): EventCalculusEffect {
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

const EVENT_CALCULUS_DERIVATION = Symbol("ordered_event_calculus_derivation");

/** The same fold serves cold input, suffix advancement and historical facts.
 * A scope is issued only for exact immutable prefix extensions; rollback drops
 * the store's source. No materialized projection is mutable admission truth. */
class RuntimeEventCalculusDerivation {
  readonly holds = new Map<string, RuntimeFluent>();
  readonly effectRows: RuntimeEventCalculusEffectRow[] = [];
  readonly effectByEvent = new Map<string, RuntimeEventCalculusEffectRow>();
  readonly clippedFluentRefs: string[] = [];
  readonly declippedPatternRefs: string[] = [];
  readonly contextualFluentRunIds = new Map<string, string>();
  readonly priorEvents: RuntimeEvent[] = [];
  readonly history: RuntimeEffectHistory = { byId: new Map(), interruptedScopes: new Set(),
    frameProbeScopes: new Map(), cCallProbeScopes: new Map() };
  readonly clipCounts = [0];
  readonly declipCounts = [0];
  readonly transitions = new Map<string, { ordinal: number; fluent: RuntimeFluent | null }[]>();
  private materialized: { count: number; projection: RuntimeEventCalculusProjection } | undefined;
  recordFluent(fluent: RuntimeFluent, ordinal: number, held: boolean): void {
    const key = fluent.fluentRef, rows = this.transitions.get(key) ?? [];
    rows.push({ ordinal, fluent: held ? fluent : null }); this.transitions.set(key, rows);
  }
  fluentAt(key: string, ordinal: number): RuntimeFluent | null {
    const rows = this.transitions.get(key) ?? [];
    let low = 0, high = rows.length;
    while (low < high) { const middle = (low + high) >>> 1; if (rows[middle]!.ordinal <= ordinal) low = middle + 1; else high = middle; }
    return rows[low - 1]?.fluent ?? null;
  }
  advance(prefix: ValidatedRuntimeEventPrefix): void {
    const events = runtimeEventsFromValidatedPrefix(prefix);
    let validateLiveness: ((event: RuntimeEvent) => boolean) | undefined;
  for (const event of events.slice(this.effectRows.length)) {
    if (event.eventContractDigest === ROOT_EVENT_CONTRACT_DIGEST &&
        (event.kind === "runtime_activity_probe_observed" || event.kind === "runtime_external_interruption_observed" ||
          event.kind === "actor_process_timeout_observed")) {
      validateLiveness ??= createRuntimeLivenessEventValidator(prefix);
      if (!validateLiveness(event)) throw new TypeError("native liveness effect has no exact admitted source/threshold relation");
    }
    const baseEffect = completeEventCalculusEffect(eventCalculusEffectRefs(event, this.priorEvents, this.history));
    const terminalLocusEvent =
      event.kind === "runtime_failure_observed" ||
      event.kind === "run_stopped" ||
      event.kind === "run_closed";
    const cleanupTerminalEvent = event.kind === "run_stopped" ||
      (event.kind === "runtime_failure_observed" &&
        event.aggregateType === "run");
    // A preserving operator stop ends Run activity, not its unresolved F_H
    // obligation. Process cleanup and non-preserving terminal effects remain.
    const preservesHeldObligation = event.kind === "run_stopped" &&
      (stringField(event, "reasonKind") === "operator_stop" ||
        stringField(event, "reasonKind") === "external_interruption");
    const processRef = stringField(event, "processRef");
    const liveProcesses = cleanupTerminalEvent
      ? [...this.holds.values()].filter((candidate) =>
          candidate.name === "actor_process_live" && candidate.identity !== null
        )
      : [];
    const effect = terminalLocusEvent
      ? completeEffect({
          ...baseEffect,
          initiates: [
            ...baseEffect.initiates,
            ...liveProcesses.flatMap((candidate) => [
              constructRuntimeFluent({
                name: "actor_cleanup_live",
                identity: candidate.identity!,
              }),
              constructRuntimeFluent({
                name: "actor_cleanup_pending",
                identity: candidate.identity!,
              }),
            ]),
          ],
          terminates: [
            ...baseEffect.terminates,
            ...[...this.holds.values()].filter((candidate) =>
              (
                (
                  cleanupTerminalEvent &&
                  (
                    candidate.name === "actor_invocation_active" ||
                    candidate.name === "runtime_invocation_active" ||
                    candidate.name === "actor_process_active" ||
                    candidate.name === "c_call_active" ||
                    (!preservesHeldObligation && (
                      candidate.name === "continuation_open" ||
                      candidate.name === "continuation_response_available" ||
                      candidate.name === "frame_held" ||
                      candidate.name === "interaction_pending"
                    )) ||
                    candidate.name === "parent_waiting_on_child" ||
                    candidate.name === "retry_attempt_active" ||
                    candidate.name === "retry_progress_available"
                  )
                ) || candidate.name === "locus_active"
              ) &&
              this.contextualFluentRunIds.get(candidate.fluentRef) ===
                event.runId
            ),
          ],
        })
      : processRef !== null &&
          (event.kind === "actor_process_exited" ||
            event.kind === "actor_process_spawn_failed" ||
            event.kind === "actor_invocation_closed" ||
            event.kind === "actor_invocation_failed")
        ? completeEffect({
            ...baseEffect,
            terminates: [
              ...baseEffect.terminates,
              ...(event.eventContractDigest === ROOT_EVENT_CONTRACT_DIGEST &&
                  (event.kind === "actor_invocation_closed" || event.kind === "actor_invocation_failed")
                ? [...this.holds.values()].filter(fluent => fluent.name === "runtime_invocation_active" && this.priorEvents.some(row => {
                    if (row.kind !== "runtime_activity_probe_observed" || !isRecord(row.payload) || !isRuntimeProbeObservation(row.payload.observation)) return false;
                    return row.payload.actorInvocationRef === event.aggregateId && row.payload.observation.scopeDigest === fluent.identity;
                  })) : []),
              ...(event.kind === "actor_process_exited" ||
                  event.kind === "actor_process_spawn_failed"
                ? [constructRuntimeFluent({
                    name: "actor_cleanup_live",
                    identity: processRef,
                  })]
                : [constructRuntimeFluent({
                    name: "actor_cleanup_pending",
                    identity: processRef,
                  })]),
            ],
          })
        : baseEffect;
    for (const fluent of effect.terminates) {
      this.recordFluent(fluent, event.admissionOrdinal, false);
      this.holds.delete(fluent.fluentRef);
      this.contextualFluentRunIds.delete(fluent.fluentRef);
    }
    for (const pattern of effect.clips) {
      for (const [key, fluent] of [...this.holds.entries()]) {
        if (ownedRuntimeFluentMatchesPattern(fluent, pattern)) {
          this.recordFluent(fluent, event.admissionOrdinal, false);
          this.holds.delete(key);
          this.clippedFluentRefs.push(key);
        }
      }
    }
    for (const pattern of effect.declips) {
      this.declippedPatternRefs.push(ownedRuntimeFluentPatternKey(pattern));
    }
    for (const fluent of effect.initiates) {
      this.recordFluent(fluent, event.admissionOrdinal, true);
      this.holds.set(fluent.fluentRef, fluent);
      if (event.runId !== undefined) {
        this.contextualFluentRunIds.set(fluent.fluentRef, event.runId);
      }
    }
    this.effectRows.push(deepFreeze({
      kind: "event_calculus_effect_row" as const,
      eventKind: event.kind,
      sourceEvent: event,
      ...effect,
    }) as RuntimeEventCalculusEffectRow);
    this.effectByEvent.set(event.eventId, this.effectRows.at(-1)!);
    this.clipCounts.push(this.clippedFluentRefs.length);
    this.declipCounts.push(this.declippedPatternRefs.length);
    this.priorEvents.push(event);
    this.history.byId.set(event.eventId, event);
    // A native observation has just completed its exact liveness source
    // relation. Other profiles retain the raw contract guards used by the
    // exported effect helper. Later closures consume only these scoped facts.
    if (event.kind === "runtime_activity_probe_observed" && isRecord(event.payload) &&
        (event.eventContractDigest === ROOT_EVENT_CONTRACT_DIGEST ||
          isRuntimeSystemProbeContract(event.payload.probeContract) && isRuntimeProbeObservation(event.payload.observation))) {
      const contract = event.payload.probeContract as unknown as RuntimeSystemProbeContract;
      const observation = event.payload.observation as unknown as RuntimeProbeObservation;
      const { scope } = contract;
      const target = scope.cCallRef !== null ? this.history.cCallProbeScopes :
        scope.actorInvocationRef === null ? this.history.frameProbeScopes : null;
      if (target !== null) {
        const key = scope.cCallRef ?? frameProbeScopeKey(scope);
        const scopes = target.get(key) ?? new Set<string>();
        scopes.add(observation.scopeDigest); target.set(key, scopes);
      }
    }
    if (event.kind === "runtime_external_interruption_observed" && isRecord(event.payload) && isRuntimeProbeObservation(event.payload.observation)) {
      this.history.interruptedScopes.add(event.payload.observation.scopeDigest);
    }
  }
  }
  project(prefix: ValidatedRuntimeEventPrefix): RuntimeEventCalculusProjection {
    const events = runtimeEventsFromValidatedPrefix(prefix), count = events.length;
    if (this.materialized?.count === count) return this.materialized.projection;
    const ordinal = events.at(-1)?.admissionOrdinal ?? 0;
    const holds = count === this.effectRows.length ? [...this.holds.values()] :
      [...this.transitions.keys()].flatMap(key => { const fluent = this.fluentAt(key, ordinal); return fluent === null ? [] : [fluent]; });
    const projection = deepFreeze({ kind: "event_calculus_projection" as const,
      holds: holds.sort((left, right) => compareUnicodeCodeUnits(left.fluentRef, right.fluentRef)),
      effectRows: this.effectRows.slice(0, count),
      clippedFluentRefs: this.clippedFluentRefs.slice(0, this.clipCounts[count]),
      declippedPatternRefs: this.declippedPatternRefs.slice(0, this.declipCounts[count]),
    }) as RuntimeEventCalculusProjection;
    this.materialized = { count, projection }; return projection;
  }
}

function eventCalculusDerivation(prefix: ValidatedRuntimeEventPrefix): RuntimeEventCalculusDerivation {
  const derivation = runtimePrefixComputation(prefix, EVENT_CALCULUS_DERIVATION, () => new RuntimeEventCalculusDerivation());
  derivation.advance(prefix); return derivation;
}
export function deriveRuntimeEventCalculusProjection(prefix: ValidatedRuntimeEventPrefix): RuntimeEventCalculusProjection {
  return eventCalculusDerivation(prefix).project(prefix);
}
/** Select the required owner effects without materializing every effect row. */
export function runtimeEventCalculusEffectsByKind(prefix: ValidatedRuntimeEventPrefix, kind: RuntimeEvent["kind"]): readonly RuntimeEventCalculusEffectRow[] {
  const derivation = eventCalculusDerivation(prefix);
  return indexedRuntimeEvents(prefix, "kind:" + kind).map(event => derivation.effectByEvent.get(event.eventId)!);
}
/** Exact historical availability without manufacturing a historical projection. */
export function runtimeFluentHoldsAtPrefix(prefix: ValidatedRuntimeEventPrefix, fluent: RuntimeFluent,
  ordinal = runtimeEventsFromValidatedPrefix(prefix).at(-1)?.admissionOrdinal ?? 0): boolean {
  if (ordinal > (runtimeEventsFromValidatedPrefix(prefix).at(-1)?.admissionOrdinal ?? 0)) return false;
  return eventCalculusDerivation(prefix).fluentAt(runtimeFluentKey(fluent), ordinal) !== null;
}

export function holdsAt(
  projection: RuntimeEventCalculusProjection,
  fluent: RuntimeFluent,
): boolean {
  const key = runtimeFluentKey(fluent);
  return projection.holds.some((candidate) => runtimeFluentKey(candidate) === key);
}
