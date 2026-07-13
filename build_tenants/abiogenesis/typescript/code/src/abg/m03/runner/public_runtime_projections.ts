// Implements: T-223 DS-1 M03 public result and replay projections
// Implements: REQ-P-PUBLIC-CONTRACTS-006, REQ-P-PUBLIC-CONTRACTS-008

import {
  admitIJsonText,
  admitIJsonValue,
  type IJsonValue
} from "../../../shared/runtime_identity.js";
import {
  sortReplayByAdmissionOrdinalFailClosed
} from "../contracts/admission_hygiene.js";
import type {
  CanonicalRuntimeEvent,
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
