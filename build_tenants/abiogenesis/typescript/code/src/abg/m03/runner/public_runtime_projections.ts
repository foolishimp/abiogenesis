// Implements: T-223 DS-1 M03 public result and replay projections
// Implements: REQ-P-PUBLIC-CONTRACTS-006, REQ-P-PUBLIC-CONTRACTS-008

import * as v from "valibot";

import {
  admitIJsonText,
  admitIJsonValue,
  stableSha256Digest,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import {
  sortReplayByAdmissionOrdinalFailClosed
} from "../contracts/admission_hygiene.js";
import type {
  CanonicalRuntimeEvent,
  ExecutionBasis,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  assertCanonicalRuntimeEventSequence,
  assertRuntimeEvent
} from "../contracts/event_admission.js";
import {
  projectFhInteractionForGraphCall,
  type FhInteractionProjection
} from "./fh_interaction.js";
import {
  RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES,
  type RuntimeProjectionProjectReadResult
} from "../contracts/runtime_projection_operation_contracts.js";
import {
  deriveRuntimeEventCalculusProjection,
  type RuntimeEventCalculusProjection
} from "../contracts/event_calculus.js";
import {
  deriveConstructionEventCalculusProjection
} from "../contracts/construction_progress.js";
import {
  deriveReplayAdmittedRuntimeResultRelation,
  ReplayAdmittedRuntimeResultRelationError,
  type ReplayAdmittedRuntimeResultRelation
} from "../contracts/replay_admitted_runtime_result.js";

type Sha256Digest = `sha256:${string}`;

export type RuntimeProjectionPublicReadCase =
  | "run_status"
  | "run_result"
  | "result_evidence"
  | "run_replay";

export type RuntimeProjectionPublicReadRefusalCode =
  | "source_digest_mismatch"
  | "projection_unsupported"
  | "not_found"
  | "not_ready";

export class RuntimeProjectionPublicReadError extends TypeError {
  public readonly code: RuntimeProjectionPublicReadRefusalCode;

  public constructor(
    code: RuntimeProjectionPublicReadRefusalCode,
    message: string
  ) {
    super(message);
    this.name = "RuntimeProjectionPublicReadError";
    this.code = code;
  }
}

export interface RuntimeProjectionPublicReadSource<
  Kind extends "Run" | "RuntimeResult"
> {
  readonly kind: Kind;
  readonly sourceRef: string;
  readonly sourceDigest: string;
}

interface RefDigest {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

export interface RuntimeRunStatusAuthority {
  readonly executionBasis: ExecutionBasis;
  readonly program: RefDigest;
  readonly workspaceBinding: RefDigest;
}

export interface AdmittedWorkspaceReplay {
  readonly kind: "admitted_workspace_replay";
  readonly orderedEvents: readonly CanonicalRuntimeEvent[];
}

export type RuntimeReplaySubject =
  | { readonly kind: "workspace"; readonly workspaceId: string }
  | { readonly kind: "run"; readonly runId: string }
  | { readonly kind: "graph_call"; readonly graphCallId: string }
  | { readonly kind: "subordinate"; readonly subjectId: string };

export interface RuntimePublicResultProjection {
  readonly resultId: string;
  readonly graphCallId: string;
  readonly disposition:
    | "converged"
    | "stopped"
    | "yielded"
    | "blocked"
    | "human_gate_required";
  readonly result: IJsonValue;
  readonly interaction: FhInteractionProjection | null;
  readonly evidenceRefs: readonly string[];
  readonly replayRefs: readonly string[];
}

export interface RuntimePublicReplayProjection {
  readonly subject: RuntimeReplaySubject;
  readonly fromOrdinal: number;
  readonly returnedThroughOrdinal: number | null;
  readonly nextOrdinal: number | null;
  readonly events: readonly IJsonValue[];
}

function eventRecord(event: RuntimeEvent): Readonly<Record<string, unknown>> {
  return Object.fromEntries(Object.entries(event));
}

function eventRef(event: CanonicalRuntimeEvent): string {
  return event.eventId;
}

export function admitWorkspaceRuntimeEventBytes(
  bytes: Uint8Array
): AdmittedWorkspaceReplay {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    throw new TypeError("workspace runtime event log is not valid UTF-8");
  }
  const values = text
    .split(/\r?\n/u)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      const value = admitIJsonText(line, `WorkspaceRuntimeEvent[${String(index)}]`);
      assertRuntimeEvent(value);
      return value;
    });
  assertCanonicalRuntimeEventSequence(values, "WorkspaceRuntimeEventLog");
  return Object.freeze({
    kind: "admitted_workspace_replay",
    orderedEvents: Object.freeze(
      sortReplayByAdmissionOrdinalFailClosed<CanonicalRuntimeEvent>(
        values,
        "WorkspaceRuntimeEventLog"
      )
    )
  });
}

function graphCallRows(replay: AdmittedWorkspaceReplay): readonly {
  readonly graphCallId: string;
  readonly basisId: string;
  readonly runId: string | null;
}[] {
  return Object.freeze(
    replay.orderedEvents.flatMap((event) =>
      event.kind === "graph_call_opened"
        ? [Object.freeze({
            graphCallId: event.graphCallId,
            basisId: event.basisId,
            runId: event.runId
          })]
        : []
    )
  );
}

function eventResultRefs(event: RuntimeEvent): readonly string[] {
  const record = eventRecord(event);
  const refs: string[] = [];
  for (const field of ["resultRef", "payloadRef", "outputPayloadRef"] as const) {
    const value = record[field];
    if (typeof value === "string" && value.length > 0) {
      refs.push(value);
    }
  }
  return Object.freeze(refs);
}

function eventPrimaryResultRefs(event: RuntimeEvent): readonly string[] {
  const resultRef = eventRecord(event)["resultRef"];
  return typeof resultRef === "string" && resultRef.length > 0
    ? Object.freeze([resultRef])
    : Object.freeze([]);
}

function eventsForGraphCall(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly graphCallId: string;
  readonly basisId: string;
}): readonly CanonicalRuntimeEvent[] {
  const graphCall = input.replay.orderedEvents.find(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.graphCallId === input.graphCallId
  );
  const selection = graphCall === undefined
    ? undefined
    : [...input.replay.orderedEvents]
        .reverse()
        .find(
          (event) =>
            event.eventAdmissionOrdinal < graphCall.eventAdmissionOrdinal &&
            event.kind === "graph_function_selected"
        );
  const causalEventRefs = new Set(
    selection?.kind === "graph_function_selected"
      ? selection.causationEventRefs
      : []
  );
  return Object.freeze(
    input.replay.orderedEvents.filter((event) => {
      if (event === selection || causalEventRefs.has(event.eventId)) {
        return true;
      }
      const record = eventRecord(event);
      if (typeof record["graphCallId"] === "string") {
        return record["graphCallId"] === input.graphCallId;
      }
      return record["basisId"] === input.basisId;
    })
  );
}

function resultDisposition(
  events: readonly CanonicalRuntimeEvent[]
): RuntimePublicResultProjection["disposition"] {
  const terminal = [...events]
    .reverse()
    .find((event) => event.kind === "terminal_reached");
  if (terminal?.kind === "terminal_reached") {
    switch (terminal.terminalKind) {
      case "converged":
      case "nothing_to_do":
        return "converged";
      case "yielded":
        return "yielded";
      case "human_gate_required":
        return "human_gate_required";
      case "gap_stop":
      case "dispatch_required":
        return "blocked";
      case "traversal_applied":
        return "stopped";
    }
  }
  if (
    events.some(
      (event) =>
        event.kind === "fh_escalated" ||
        event.kind === "fh_interaction_opened"
    )
  ) {
    return "human_gate_required";
  }
  if (
    events.some(
      (event) =>
        event.kind === "fp_dispatch_requested" ||
        (event.kind === "actor_invocation_closed" &&
          event.closureStatus !== "completed")
    )
  ) {
    return "blocked";
  }
  return "stopped";
}

export function projectRuntimePublicResult(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly resultId?: string | undefined;
  readonly graphCallId?: string | undefined;
}): RuntimePublicResultProjection | null {
  const calls = graphCallRows(input.replay);
  const candidates = calls.filter((call) => {
    if (input.graphCallId !== undefined) {
      return call.graphCallId === input.graphCallId;
    }
    if (input.resultId === undefined) {
      return false;
    }
    if (`result:${call.graphCallId}` === input.resultId) {
      return true;
    }
    return eventsForGraphCall({
      replay: input.replay,
      graphCallId: call.graphCallId,
      basisId: call.basisId
    }).some((event) => eventResultRefs(event).includes(input.resultId ?? ""));
  });
  if (candidates.length === 0) {
    return null;
  }
  if (candidates.length > 1) {
    throw new TypeError("public result identity is ambiguous");
  }
  const call = candidates[0];
  if (call === undefined) {
    return null;
  }
  const events = eventsForGraphCall({
    replay: input.replay,
    graphCallId: call.graphCallId,
    basisId: call.basisId
  });
  const resultRefs = Object.freeze([
    ...new Set(events.flatMap(eventResultRefs))
  ]);
  const terminal = [...events]
    .reverse()
    .find((event) => event.kind === "terminal_reached");
  const resultId =
    events.flatMap(eventPrimaryResultRefs).at(-1) ??
    `result:${call.graphCallId}`;
  const result = admitIJsonValue(Object.freeze({
    kind: "runtime_result_projection",
    basisId: call.basisId,
    graphCallId: call.graphCallId,
    terminalKind:
      terminal?.kind === "terminal_reached" ? terminal.terminalKind : null,
    terminalReason:
      terminal?.kind === "terminal_reached" ? terminal.reason : null,
    resultRefs
  }));
  const replayRefs = Object.freeze(events.map(eventRef));
  const interaction = projectFhInteractionForGraphCall(
    input.replay.orderedEvents,
    call.graphCallId
  );
  const evidenceRefs = Object.freeze(
    events
      .filter((event) =>
        event.kind === "terminal_reached" ||
        event.kind === "actor_result_artifact_observed" ||
        event.kind === "actor_invocation_closed" ||
        event.kind === "fh_interaction_responded" ||
        event.kind === "fh_interaction_resume_admitted" ||
        event.kind === "leaf_task_completed" ||
        event.kind === "leaf_task_failed"
      )
      .map(eventRef)
  );
  return Object.freeze({
    resultId,
    graphCallId: call.graphCallId,
    disposition: resultDisposition(events),
    result,
    interaction,
    evidenceRefs,
    replayRefs
  });
}

const SUBORDINATE_ID_FIELDS = Object.freeze([
  "actorInvocationId",
  "approvalSubjectRef",
  "artifactRef",
  "cCallRef",
  "dispatchRef",
  "eventId",
  "frameId",
  "interactionRef",
  "leafTaskId",
  "continuationRef",
  "responseRef",
  "resumeRef",
  "resultRef",
  "selectionRef",
  "subjectId"
] as const);

function eventsForSubject(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly subject: RuntimeReplaySubject;
}): readonly CanonicalRuntimeEvent[] {
  const subject = input.subject;
  if (subject.kind === "workspace") {
    return input.replay.orderedEvents;
  }
  const calls = graphCallRows(input.replay);
  if (subject.kind === "run") {
    const basisIds = new Set(
      calls
        .filter((call) => call.runId === subject.runId)
        .map((call) => call.basisId)
    );
    return Object.freeze(
      input.replay.orderedEvents.filter((event) => {
        const record = eventRecord(event);
        return (
          record["runId"] === subject.runId ||
          (typeof record["basisId"] === "string" && basisIds.has(record["basisId"]))
        );
      })
    );
  }
  if (subject.kind === "graph_call") {
    const call = calls.find(
      (candidate) => candidate.graphCallId === subject.graphCallId
    );
    if (call === undefined) {
      return Object.freeze([]);
    }
    return eventsForGraphCall({
      replay: input.replay,
      graphCallId: call.graphCallId,
      basisId: call.basisId
    });
  }
  return Object.freeze(
    input.replay.orderedEvents.filter((event) => {
      const record = eventRecord(event);
      return SUBORDINATE_ID_FIELDS.some(
        (field) => record[field] === subject.subjectId
      );
    })
  );
}

export function projectRuntimePublicReplay(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly subject: RuntimeReplaySubject;
  readonly fromOrdinal: number;
  readonly limit: number;
}): RuntimePublicReplayProjection | null {
  const subjectEvents = eventsForSubject(input);
  if (input.subject.kind !== "workspace" && subjectEvents.length === 0) {
    return null;
  }
  const eligible = subjectEvents.filter(
    (event) => event.eventAdmissionOrdinal >= input.fromOrdinal
  );
  const selected = eligible.slice(0, input.limit);
  const returnedThroughOrdinal = selected.at(-1)?.eventAdmissionOrdinal ?? null;
  const nextOrdinal =
    eligible.length > selected.length && returnedThroughOrdinal !== null
      ? returnedThroughOrdinal + 1
      : null;
  return Object.freeze({
    subject: input.subject,
    fromOrdinal: input.fromOrdinal,
    returnedThroughOrdinal,
    nextOrdinal,
    events: Object.freeze(selected.map((event) => admitIJsonValue(event)))
  });
}

function exactCoordinate(prefix: string, value: unknown): RefDigest {
  const digest = stableSha256Digest(value);
  return Object.freeze({
    ref: `${prefix}/${digest.slice("sha256:".length)}`,
    digest
  });
}

function eventCoordinate(event: CanonicalRuntimeEvent): RefDigest {
  return Object.freeze({
    ref: event.eventId,
    digest: stableSha256Digest(event)
  });
}

function isSha256Digest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && /^sha256:[0-9a-f]{64}$/u.test(value);
}

type ExactPublicOperationAdmission = CanonicalRuntimeEvent & Readonly<{
  kind: "public_operation_admitted";
  definitionKey: Readonly<{
    operationId: string;
    memberKind: "variant" | "project_read_case";
    variant?: string;
    caseKey?: string;
  }>;
  invocationRef: string;
  invocationDigest: string;
}>;

function isExactPublicOperationAdmission(
  event: CanonicalRuntimeEvent
): event is ExactPublicOperationAdmission {
  return event.kind === "public_operation_admitted" &&
    "definitionKey" in event &&
    "invocationRef" in event &&
    "invocationDigest" in event;
}

function exactRunAdmission(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly source: RuntimeProjectionPublicReadSource<"Run">;
}): ExactPublicOperationAdmission {
  const identityRows = input.replay.orderedEvents.filter(
    (event): event is ExactPublicOperationAdmission =>
      isExactPublicOperationAdmission(event) &&
      event.definitionKey.operationId === "abg.operation.run.invoke" &&
      event.definitionKey.memberKind === "variant" &&
      event.definitionKey.variant === "invoke" &&
      event.invocationRef === input.source.sourceRef
  );
  if (identityRows.length === 0) {
    throw new RuntimeProjectionPublicReadError(
      "not_found",
      "runtime project.read requires one replay-admitted run.invoke identity"
    );
  }
  const exactRows = identityRows.filter(
    (event) => event.invocationDigest === input.source.sourceDigest
  );
  if (exactRows.length === 0) {
    throw new RuntimeProjectionPublicReadError(
      "source_digest_mismatch",
      "runtime project.read Run digest differs from replay-admitted invocation truth"
    );
  }
  const exact = exactRows[0];
  if (identityRows.length !== 1 || exactRows.length !== 1 || exact === undefined) {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "runtime project.read Run identity is ambiguous in replay"
    );
  }
  return exact;
}

function runEvents(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly source: RuntimeProjectionPublicReadSource<"Run">;
  readonly admission: ExactPublicOperationAdmission;
}): readonly CanonicalRuntimeEvent[] {
  const selected = eventsForSubject({
    replay: input.replay,
    subject: { kind: "run", runId: input.source.sourceRef }
  });
  const byId = new Map<string, CanonicalRuntimeEvent>();
  for (const event of [input.admission, ...selected]) {
    byId.set(event.eventId, event);
  }
  return Object.freeze(
    [...byId.values()].sort(
      (left, right) =>
        left.eventAdmissionOrdinal - right.eventAdmissionOrdinal
    )
  );
}

export function selectCanonicalRunReplayEvents(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly source: RuntimeProjectionPublicReadSource<"Run">;
}): readonly CanonicalRuntimeEvent[] {
  const admission = exactRunAdmission(input);
  return runEvents({ ...input, admission });
}

function exactRunGraphCalls(input: {
  readonly events: readonly CanonicalRuntimeEvent[];
  readonly runRef: string;
}): readonly Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "graph_call_opened" }
>[] {
  const rows = input.events.filter(
    (event): event is Extract<
      CanonicalRuntimeEvent,
      { readonly kind: "graph_call_opened" }
    > => event.kind === "graph_call_opened" && event.runId === input.runRef
  );
  if (rows.length === 0) {
    throw new RuntimeProjectionPublicReadError(
      "not_ready",
      "runtime project.read Run has no replay-admitted GraphCall"
    );
  }
  if (new Set(rows.map((row) => row.graphCallId)).size !== rows.length) {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "runtime project.read Run contains duplicate GraphCall identity"
    );
  }
  return Object.freeze(rows);
}

type ConstructionDeltaObservedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "construction_delta_observed" }
>;
type PayloadObservedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "payload_observed" }
>;
type ConstructionTerminalDispositionProjectedEvent = Extract<
  CanonicalRuntimeEvent,
  { readonly kind: "construction_terminal_disposition_projected" }
>;

function replayCoordinate(
  prefix: string,
  events: readonly CanonicalRuntimeEvent[]
): RefDigest {
  return exactCoordinate(prefix, events);
}

function optionalCoordinate(
  value: RefDigest | null
): Readonly<
  { readonly kind: "absent" } |
  { readonly kind: "present"; readonly value: RefDigest }
> {
  return value === null
    ? Object.freeze({ kind: "absent" as const })
    : Object.freeze({ kind: "present" as const, value });
}

interface ReplayDerivedResultClosure {
  readonly closureEligible: boolean;
  readonly residualRefs: readonly string[];
  readonly provenanceRefs: readonly string[];
}

function exactReplayDerivedResultClosure(input: {
  readonly replayEvents: readonly CanonicalRuntimeEvent[];
  readonly callEvents: readonly CanonicalRuntimeEvent[];
  readonly chain: ReplayAdmittedRuntimeResultRelation;
}): ReplayDerivedResultClosure {
  const observed = input.callEvents.find(
    (event) => event.eventId === input.chain.targetAdmission.observedEventRef
  );
  if (observed?.kind !== "payload_observed") {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "runtime result relation lost its admitted target observation"
    );
  }
  const deltas = input.callEvents.filter(
    (event): event is ConstructionDeltaObservedEvent =>
      event.kind === "construction_delta_observed" &&
      event.eventAdmissionOrdinal > observed.eventAdmissionOrdinal &&
      event.graphCallId === input.chain.subject.graphCallId &&
      event.frameId === input.chain.subject.frameId &&
      event.runtimeEventRefs.includes(
        input.chain.targetAdmission.observedEventRef
      )
  );
  const delta = deltas[0];
  if (deltas.length === 0 || delta === undefined) {
    throw new RuntimeProjectionPublicReadError(
      "not_ready",
      "runtime project.read result has no replay-admitted AF-16 action disposition"
    );
  }
  if (deltas.length !== 1) {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "runtime project.read result has ambiguous AF-16 action dispositions"
    );
  }

  const causalTerminals = input.replayEvents.filter(
    (event): event is ConstructionTerminalDispositionProjectedEvent =>
      event.kind === "construction_terminal_disposition_projected" &&
      event.eventAdmissionOrdinal > delta.eventAdmissionOrdinal &&
      event.episodeId === delta.episodeId &&
      event.selectedIntentId === delta.intentId &&
      event.eventSequence === delta.eventSequence + 1 &&
      event.causationEventRefs.includes(delta.constructionEventRef)
  );
  if (!delta.closed) {
    if (causalTerminals.length !== 0) {
      throw new RuntimeProjectionPublicReadError(
        "projection_unsupported",
        "non-closing AF-16 action disposition has a terminal construction projection"
      );
    }
    return Object.freeze({
      closureEligible: false,
      residualRefs: Object.freeze([
        ...new Set([
          delta.afterProjectionRef,
          ...delta.remainingObligationRefs
        ])
      ]),
      provenanceRefs: Object.freeze([delta.eventId])
    });
  }

  const terminal = causalTerminals[0];
  if (causalTerminals.length === 0 || terminal === undefined) {
    throw new RuntimeProjectionPublicReadError(
      "not_ready",
      "closing AF-16 action disposition has no causal terminal construction projection"
    );
  }
  if (
    causalTerminals.length !== 1 ||
    terminal.publicState !== "construction_closed"
  ) {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "closing AF-16 action disposition has no singular construction_closed projection"
    );
  }
  return Object.freeze({
    closureEligible: true,
    residualRefs: Object.freeze([]),
    provenanceRefs: Object.freeze([delta.eventId, terminal.eventId])
  });
}

function projectionHolds(
  projection: RuntimeEventCalculusProjection,
  name: RuntimeEventCalculusProjection["holds"][number]["name"]
): boolean {
  return projection.holds.some((fluent) => fluent.name === name);
}

function exactRunStatusBasisAdmission(input: {
  readonly events: readonly CanonicalRuntimeEvent[];
  readonly source: RuntimeProjectionPublicReadSource<"Run">;
  readonly authority: RuntimeRunStatusAuthority;
}): Extract<CanonicalRuntimeEvent, { readonly kind: "basis_admitted" }> {
  const rows = input.events.filter(
    (event): event is Extract<
      CanonicalRuntimeEvent,
      { readonly kind: "basis_admitted" }
    > => event.kind === "basis_admitted" && event.runId === input.source.sourceRef
  );
  const event = rows[0];
  const basis = input.authority.executionBasis;
  if (rows.length === 0 || event === undefined) {
    throw new RuntimeProjectionPublicReadError(
      "not_ready",
      "run_status requires one replay-admitted ExecutionBasis"
    );
  }
  if (rows.length !== 1) {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "run_status cannot select one ExecutionBasis from replay"
    );
  }
  if (
    event.basisId !== basis.id ||
    event.graphFunctionId !== basis.graphFunction.id ||
    event.jobId !== basis.job.id ||
    event.resolvedRuntimeRef !== basis.runtimeIdentity.resolvedRuntimeRef ||
    event.resolvedPolicyBundleRef !==
      basis.resolvedPolicy.resolvedPolicyBundleRef ||
    event.runId !== basis.runId ||
    event.workKey !== basis.workKey ||
    event.startAdmissionWitnessDigest !== basis.startAdmissionWitnessDigest
  ) {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "run_status reconstructed ExecutionBasis differs from replay truth"
    );
  }
  return event;
}

function runStatusRuntimeCalculus(input: {
  readonly events: readonly CanonicalRuntimeEvent[];
  readonly basis: ExecutionBasis;
}): RuntimeEventCalculusProjection {
  const basisEvents = input.events.filter((event) => {
    if (!("basisId" in event)) {
      return event.kind === "public_operation_admitted";
    }
    return event.basisId === input.basis.id;
  });
  return deriveRuntimeEventCalculusProjection({
    basis: input.basis,
    events: basisEvents,
    undeclaredEventBehavior: "ignore"
  });
}

function runStatusConstructionCalculus(input: {
  readonly runEvents: readonly CanonicalRuntimeEvent[];
  readonly replayEvents: readonly CanonicalRuntimeEvent[];
  readonly runRef: string;
}): Readonly<{
  readonly projection: RuntimeEventCalculusProjection;
  readonly terminalEvent:
    | Extract<
        CanonicalRuntimeEvent,
        { readonly kind: "construction_terminal_disposition_projected" }
      >
    | null;
}> | null {
  if (!input.runEvents.some(
    (event) =>
      event.kind === "graph_call_opened" &&
      event.runId === input.runRef
  )) {
    return null;
  }
  const graphCallIds = new Set(exactRunGraphCalls({
    events: input.runEvents,
    runRef: input.runRef
  }).map((call) => call.graphCallId));
  const anchors = input.replayEvents.filter(
    (event) =>
      event.kind.startsWith("construction_") &&
      "graphCallId" in event &&
      typeof event.graphCallId === "string" &&
      graphCallIds.has(event.graphCallId)
  );
  if (anchors.length === 0) {
    return null;
  }
  const episodeIds = [...new Set(anchors.flatMap((event) =>
    "episodeId" in event && typeof event.episodeId === "string"
      ? [event.episodeId]
      : []
  ))];
  const episodeId = episodeIds[0];
  if (episodeIds.length !== 1 || episodeId === undefined) {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "run_status requires one construction episode per admitted run"
    );
  }
  const constructionEvents = input.replayEvents.filter(
    (event) =>
      event.kind.startsWith("construction_") &&
      "episodeId" in event &&
      event.episodeId === episodeId
  );
  const projection = deriveConstructionEventCalculusProjection({
    episodeId,
    events: constructionEvents
  });
  const terminalRows = constructionEvents.filter(
    (event): event is Extract<
      CanonicalRuntimeEvent,
      { readonly kind: "construction_terminal_disposition_projected" }
    > => event.kind === "construction_terminal_disposition_projected"
  );
  if (terminalRows.length > 1) {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "run_status construction episode has ambiguous terminal truth"
    );
  }
  return Object.freeze({
    projection,
    terminalEvent: terminalRows[0] ?? null
  });
}

function exactCompletedRunStatusLifecycle(input: {
  readonly runtime: RuntimeEventCalculusProjection;
  readonly construction: NonNullable<
    ReturnType<typeof runStatusConstructionCalculus>
  >;
}): Readonly<{
  readonly kind: "terminal";
  readonly disposition: "completed";
  readonly stop: null;
  readonly terminal: RefDigest;
  readonly pendingInteraction: null;
}> | null {
  if (!projectionHolds(input.construction.projection, "construction_closed")) {
    return null;
  }
  const terminal = input.construction.terminalEvent;
  if (
    terminal === null ||
    terminal.publicState !== "construction_closed"
  ) {
    throw new RuntimeProjectionPublicReadError(
      "not_ready",
      "run_status closing fluent has no causal construction terminal"
    );
  }
  for (const expected of [
    "basis_admitted",
    "graph_call_open",
    "frame_open",
    "vector_traversal_planned",
    "vector_evaluated",
    "vector_closed"
  ] as const) {
    if (!projectionHolds(input.runtime, expected)) {
      throw new RuntimeProjectionPublicReadError(
        "not_ready",
        `run_status completed lifecycle lacks ${expected} HoldsAt truth`
      );
    }
  }
  return Object.freeze({
    kind: "terminal" as const,
    disposition: "completed" as const,
    stop: null,
    terminal: eventCoordinate(terminal),
    pendingInteraction: null
  });
}

export function projectRunStatusForPublicRead(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly source: RuntimeProjectionPublicReadSource<"Run">;
  readonly authority: RuntimeRunStatusAuthority;
}): RuntimeProjectionProjectReadResult<"run_status"> {
  const subject = Object.freeze({
    kind: "Run" as const,
    ref: input.source.sourceRef,
    digest: input.source.sourceDigest
  });
  const events = selectCanonicalRunReplayEvents(input);
  const basisAdmission = exactRunStatusBasisAdmission({
    events,
    source: input.source,
    authority: input.authority
  });
  const runtime = runStatusRuntimeCalculus({
    events,
    basis: input.authority.executionBasis
  });
  if (!projectionHolds(runtime, "basis_admitted")) {
    throw new RuntimeProjectionPublicReadError(
      "not_ready",
      "run_status Event Calculus does not derive admitted basis truth"
    );
  }
  const construction = runStatusConstructionCalculus({
    runEvents: events,
    replayEvents: input.replay.orderedEvents,
    runRef: input.source.sourceRef
  });
  const completed = construction === null
    ? null
    : exactCompletedRunStatusLifecycle({ runtime, construction });
  if (
    completed === null &&
    construction !== null &&
    ([
      "construction_blocked",
      "construction_stalled",
      "construction_review_required",
      "construction_escalated",
      "fh_input_required"
    ] as const).some((name) => projectionHolds(
      construction.projection,
      name
    ))
  ) {
    throw new RuntimeProjectionPublicReadError(
      "projection_unsupported",
      "run_status terminal or held construction truth awaits its typed lifecycle projection"
    );
  }
  const lifecycle = completed ?? Object.freeze({
    kind: "nonterminal" as const,
    disposition: projectionHolds(runtime, "graph_call_open")
      ? "running" as const
      : "pending" as const,
    stop: null,
    terminal: null,
    pendingInteraction: null
  });
  const replay = replayCoordinate(
    "replay://abg/project.read/run-status",
    events
  );
  const basis = input.authority.executionBasis;
  const projectionBasis = Object.freeze({
    kind: "runtime_status_projection" as const,
    subject,
    substrate: Object.freeze({
      program: input.authority.program,
      workspaceBinding: input.authority.workspaceBinding,
      executionBasis: Object.freeze({
        ref: basis.id,
        digest: stableSha256Digest(basis)
      })
    }),
    lifecycle,
    resultRefs: Object.freeze([
      ...new Set(events.flatMap((event) => eventResultRefs(event)))
    ]),
    gapRefs: Object.freeze([
      ...new Set(events.flatMap((event) =>
        event.kind === "construction_delta_observed"
          ? event.remainingObligationRefs
          : []
      ))
    ]),
    evidenceRefs: Object.freeze([
      ...new Set(events.flatMap((event) =>
        event.kind === "evidence_admitted" ? [event.evidenceRef] : []
      ))
    ]),
    replayRefs: Object.freeze([replay.ref]),
    provenanceRefs: Object.freeze([
      ...new Set([
        basisAdmission.eventId,
        ...runtime.effectRows.flatMap((row) =>
          "eventId" in row.sourceEvent &&
            typeof row.sourceEvent.eventId === "string"
            ? [row.sourceEvent.eventId]
            : []
        ),
        ...(construction?.projection.effectRows.flatMap((row) =>
          "eventId" in row.sourceEvent &&
            typeof row.sourceEvent.eventId === "string"
            ? [row.sourceEvent.eventId]
            : []
        ) ?? [])
      ])
    ])
  });
  return v.parse(
    RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_status.result.schema,
    Object.freeze({
      ...projectionBasis,
      projection: exactCoordinate(
        "projection://abg/project.read/run-status",
        projectionBasis
      )
    })
  );
}

export function projectRunResultForPublicRead(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly source: RuntimeProjectionPublicReadSource<"Run">;
}): RuntimeProjectionProjectReadResult<"run_result"> {
  const subject = Object.freeze({
    kind: "Run" as const,
    ref: input.source.sourceRef,
    digest: input.source.sourceDigest
  });
  const events = selectCanonicalRunReplayEvents(input);
  const calls = exactRunGraphCalls({
    events,
    runRef: input.source.sourceRef
  });
  const results = calls.map((call) => {
    const callEvents = eventsForGraphCall({
      replay: input.replay,
      graphCallId: call.graphCallId,
      basisId: call.basisId
    });
    let chain: ReplayAdmittedRuntimeResultRelation;
    try {
      chain = deriveReplayAdmittedRuntimeResultRelation({
        events: callEvents,
        graphCallId: call.graphCallId
      });
    } catch (error) {
      if (error instanceof ReplayAdmittedRuntimeResultRelationError) {
        throw new RuntimeProjectionPublicReadError(
          error.code === "ambiguous" ? "projection_unsupported" : "not_ready",
          error.message
        );
      }
      throw error;
    }
    const disposition = resultDisposition(callEvents);
    const closure = exactReplayDerivedResultClosure({
      replayEvents: input.replay.orderedEvents,
      callEvents,
      chain
    });
    const targetObserved = callEvents.find(
      (event) => event.eventId === chain.targetAdmission.observedEventRef
    );
    const artifactEvents = targetObserved?.kind === "payload_observed" &&
      targetObserved.actorInvocationId !== null
      ? callEvents.filter(
          (event) =>
            event.kind === "actor_result_artifact_observed" &&
            event.actorInvocationId === targetObserved.actorInvocationId &&
            event.basisId === chain.subject.basisId &&
            event.graphCallId === chain.subject.graphCallId &&
            event.frameId === chain.subject.frameId &&
            event.vectorIndex === chain.subject.vectorIndex &&
            event.edge === chain.subject.edge &&
            event.causationEventRefs.includes(chain.cCall.ref) &&
            isSha256Digest(event.artifactContentDigest)
        )
      : [];
    if (artifactEvents.length > 1) {
      throw new RuntimeProjectionPublicReadError(
        "projection_unsupported",
        "runtime project.read result has ambiguous same-C-call artifact evidence"
      );
    }
    const artifactEvent = artifactEvents[0];
    const assessed = [...callEvents].reverse().find(
      (event) =>
        event.kind === "assessed" &&
        event.runtimeResultRef === chain.subject.runtimeResult.ref &&
        event.runtimeResultDigest === chain.subject.runtimeResult.digest &&
        /^assessment:[0-9a-f]{64}$/u.test(event.assessmentRef)
    );
    const result = Object.freeze({
      ref: chain.subject.runtimeResult.ref,
      digest: chain.subject.runtimeResult.digest
    });
    const replay = replayCoordinate(
      "replay://abg/project.read/graph-call-result",
      callEvents
    );
    const common = {
      result,
      subject,
      graphCall: Object.freeze({
        ref: call.graphCallId,
        digest: stableSha256Digest(call)
      }),
      declaredContract: Object.freeze({
        ref: chain.targetContract.ref,
        digest: chain.targetContract.digest
      }),
      disposition,
      payload: optionalCoordinate(result),
      artifact: optionalCoordinate(
        artifactEvent?.kind === "actor_result_artifact_observed" &&
          isSha256Digest(artifactEvent.artifactContentDigest)
          ? Object.freeze({
              ref: artifactEvent.artifactRef,
              digest: artifactEvent.artifactContentDigest
            })
          : null
      ),
      assessment: optionalCoordinate(
        assessed?.kind === "assessed"
          ? Object.freeze({
              ref: assessed.assessmentRef,
              digest: `sha256:${assessed.assessmentRef.slice("assessment:".length)}`
            })
          : null
      ),
      evidenceRefs: Object.freeze(
        [...new Set(chain.targetAdmission.evidenceEventRefs.flatMap((eventRef) => {
          const event = callEvents.find((row) => row.eventId === eventRef);
          return event?.kind === "evidence_admitted" ? [event.evidenceRef] : [];
        }))]
      ),
      provenanceRefs: Object.freeze([
        call.eventId,
        chain.cCall.openedEventRef,
        chain.cCall.fibreSelectedEventRef,
        chain.targetAdmission.observedEventRef,
        chain.targetAdmission.validatedEventRef,
        ...chain.targetAdmission.evidenceEventRefs,
        chain.cCall.evidencedEventRef,
        chain.cCall.resultAdmittedEventRef,
        chain.cCall.judgedEventRef,
        chain.targetAdmission.vectorClosedEventRef,
        ...closure.provenanceRefs
      ]),
      replay
    };
    return closure.closureEligible
      ? Object.freeze({
          ...common,
          closureEligible: true as const,
          residualRefs: Object.freeze([])
        })
      : Object.freeze({
          ...common,
          closureEligible: false as const,
          residualRefs: closure.residualRefs
        });
  });
  const projectionBasis = Object.freeze({
    kind: "run_result_projection" as const,
    subject,
    results
  });
  return v.parse(
    RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_result.result.schema,
    Object.freeze({
      ...projectionBasis,
      projection: exactCoordinate(
        "projection://abg/project.read/run-result",
        projectionBasis
      )
    })
  );
}

export function projectRunReplayForPublicRead(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly source: RuntimeProjectionPublicReadSource<"Run">;
  readonly fromOrdinal: number;
  readonly limit: number;
}): RuntimeProjectionProjectReadResult<"run_replay"> {
  const admission = exactRunAdmission(input);
  const events = selectCanonicalRunReplayEvents(input);
  const eligible = events.filter(
    (event) => event.eventAdmissionOrdinal >= input.fromOrdinal
  );
  const selected = eligible.slice(0, input.limit);
  const returnedThroughOrdinal =
    selected.at(-1)?.eventAdmissionOrdinal ?? null;
  const nextOrdinal = eligible[selected.length]?.eventAdmissionOrdinal ?? null;
  const subject = Object.freeze({
    kind: "Run" as const,
    ref: input.source.sourceRef,
    digest: input.source.sourceDigest
  });
  const rows = selected.map((event) => Object.freeze({
    ordinal: event.eventAdmissionOrdinal,
    event: eventCoordinate(event),
    sourceRefs: Object.freeze([input.source.sourceRef]),
    admittedEvent: admitIJsonValue(event)
  }));
  const projectionBasis = Object.freeze({
    kind: "replay_projection" as const,
    subject,
    basis: Object.freeze({
      ref: admission.invocationRef,
      digest: input.source.sourceDigest
    }),
    fromOrdinal: input.fromOrdinal,
    limit: input.limit,
    returnedThroughOrdinal,
    nextOrdinal,
    rows: Object.freeze(rows)
  });
  return v.parse(
    RUNTIME_PROJECTION_NATIVE_CONTRACT_SOURCES.project_read.run_replay.result.schema,
    Object.freeze({
      ...projectionBasis,
      projection: exactCoordinate(
        "projection://abg/project.read/run-replay",
        projectionBasis
      )
    })
  );
}

export function projectRuntimeResultEvidenceForPublicRead(input: {
  readonly replay: AdmittedWorkspaceReplay;
  readonly source: RuntimeProjectionPublicReadSource<"RuntimeResult">;
}): RuntimeProjectionProjectReadResult<"result_evidence"> {
  const identityRows = input.replay.orderedEvents.filter(
    (event): event is PayloadObservedEvent =>
      event.kind === "payload_observed" &&
      event.payloadRef === input.source.sourceRef
  );
  if (identityRows.length === 0) {
    throw new RuntimeProjectionPublicReadError(
      "not_found",
      "result_evidence requires replay-admitted RuntimeResult identity"
    );
  }
  if (
    identityRows.every(
      (event) => event.digest !== input.source.sourceDigest
    )
  ) {
    throw new RuntimeProjectionPublicReadError(
      "source_digest_mismatch",
      "result_evidence RuntimeResult digest differs from replay truth"
    );
  }
  throw new RuntimeProjectionPublicReadError(
    "projection_unsupported",
    "result_evidence requires an admitted evidence value and evidence-contract coordinate; replay currently carries only their refs and payload digest"
  );
}
