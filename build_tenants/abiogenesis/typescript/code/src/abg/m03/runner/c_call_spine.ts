// Implements: REQ-R-ABG3-CCALL-001/-002/-003 as ONE construction
// authority (T-200 Phase A1, ruling (a)). Every spine event the engine
// mints is built here — the eight per-arm bracket bodies collapse into
// calls. Builders are PURE (no emission): generator-compatible, and the
// online gate can judge the selection candidate before anything enters
// truth. Emission stays with the engine's emitRunnerEvents choke point.

import type {
  CCallEvidencedEvent,
  CCallJudgment,
  CCallJudgedEvent,
  CCallOpenedEvent,
  CCallFibreSelectedEvent,
  CCallRegime,
  CCallResultAdmittedEvent,
  RuntimeEvent
} from "../contracts/carriers.js";
import {
  constructCCallEvidencedEvent,
  constructCCallFibreSelectedEvent,
  constructCCallJudgedEvent,
  constructCCallOpenedEvent,
  constructCCallResultAdmittedEvent
} from "../contracts/event_factories.js";
import { HOG_BOOTSTRAP_TRIPLE } from "../contracts/hog_program.js";

// REQ-R-ABG3-CCALL-004 across resume: attempt identity is REPLAY-GLOBAL
// per locus — a fresh window continues the count, never reuses it.
// (Pinned by the T-205 B-prep differential: window-local attempt
// numbering collided cCallRefs across re-entry.)
export function nextCCallAttempt(
  replayEvents: readonly RuntimeEvent[],
  locus: {
    readonly basisId: string;
    readonly graphCallId: string;
    readonly frameId: string;
    readonly vectorIndex: number;
    readonly stageRole: string;
    readonly taskOrdinal: number | null;
  }
): number {
  let count = 0;
  for (const event of replayEvents) {
    if (event.kind !== "c_call_opened") continue;
    const opened = event;
    if (
      opened.basisId === locus.basisId &&
      opened.graphCallId === locus.graphCallId &&
      opened.frameId === locus.frameId &&
      opened.vectorIndex === locus.vectorIndex &&
      opened.stageRole === locus.stageRole &&
      opened.taskOrdinal === locus.taskOrdinal
    ) {
      count += 1;
    }
  }
  return count + 1;
}

export interface CCallSpineOpenInput {
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly edge: string;
  readonly vectorIndex: number;
  readonly stageRole: string;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly batchRef: string | null;
  readonly regime: CCallRegime;
  readonly armId: string;
  readonly programRef?: string | undefined;
  readonly compositionRef?: string | null | undefined;
}

export interface CCallSpineOpen {
  readonly cCallRef: string;
  readonly opened: CCallOpenedEvent;
  readonly selected: CCallFibreSelectedEvent;
  readonly events: readonly [CCallOpenedEvent, CCallFibreSelectedEvent];
}

export interface CCallSpineOpenResolution {
  readonly cCallRef: string;
  readonly opened: CCallOpenedEvent;
  readonly selected: CCallFibreSelectedEvent;
  readonly resumed: boolean;
  readonly selectedAlreadyAdmitted: boolean;
  readonly events: readonly (CCallOpenedEvent | CCallFibreSelectedEvent)[];
}

export interface CCallSpineOpenProjection {
  readonly cCallRef: string;
  readonly opened: CCallOpenedEvent;
  readonly selected: CCallFibreSelectedEvent | null;
}

interface CCallSpineLocus {
  readonly basisId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly vectorIndex: number;
  readonly stageRole: string;
  readonly taskOrdinal: number | null;
}

function openedMatchesLocus(
  opened: CCallOpenedEvent,
  locus: CCallSpineLocus
): boolean {
  return (
    opened.basisId === locus.basisId &&
    opened.graphCallId === locus.graphCallId &&
    opened.frameId === locus.frameId &&
    opened.vectorIndex === locus.vectorIndex &&
    opened.stageRole === locus.stageRole &&
    opened.taskOrdinal === locus.taskOrdinal
  );
}

// HANDLERS-007 crash recovery is opt-in at the live scalar effect sites. A
// dangling opened spine represents an effect whose completion is uncertain;
// it must be resumed under the same identity instead of minting attempt + 1.
export function projectResumableCCallSpine(
  replayEvents: readonly RuntimeEvent[],
  locus: CCallSpineLocus
): CCallSpineOpenProjection | null {
  const judged = new Set(
    replayEvents
      .filter((event) => event.kind === "c_call_judged")
      .map((event) => event.cCallRef)
  );
  const dangling = replayEvents.filter(
    (event): event is CCallOpenedEvent =>
      event.kind === "c_call_opened" &&
      openedMatchesLocus(event, locus) &&
      !judged.has(event.cCallRef)
  );
  if (dangling.length === 0) {
    return null;
  }
  if (dangling.length !== 1) {
    throw new TypeError(
      `c-call resume is ambiguous at ${locus.stageRole}: ${String(dangling.length)} unjudged opens`
    );
  }
  const opened = dangling[0]!;
  const selectedRows = replayEvents.filter(
    (event): event is CCallFibreSelectedEvent =>
      event.kind === "c_call_fibre_selected" && event.cCallRef === opened.cCallRef
  );
  if (selectedRows.length > 1) {
    throw new TypeError(
      `c-call resume ${opened.cCallRef} contains duplicate selected fibres`
    );
  }
  const reminted = constructCCallOpenedEvent({
    basisId: opened.basisId,
    graphFunctionId: opened.graphFunctionId,
    graphCallId: opened.graphCallId,
    frameId: opened.frameId,
    edge: opened.edge,
    vectorIndex: opened.vectorIndex,
    stageRole: opened.stageRole,
    taskOrdinal: opened.taskOrdinal,
    attempt: opened.attempt,
    batchRef: opened.batchRef
  });
  if (reminted.cCallRef !== opened.cCallRef) {
    throw new TypeError(`c-call resume identity is invalid for ${opened.cCallRef}`);
  }
  return Object.freeze({
    cCallRef: opened.cCallRef,
    opened,
    selected: selectedRows[0] ?? null
  });
}

export function buildCCallSpineOpenOrResume(
  replayEvents: readonly RuntimeEvent[],
  input: CCallSpineOpenInput
): CCallSpineOpenResolution {
  const resumed = projectResumableCCallSpine(replayEvents, input);
  if (resumed === null) {
    return Object.freeze({
      ...buildCCallSpineOpen(input),
      resumed: false,
      selectedAlreadyAdmitted: false
    });
  }
  const expected = buildCCallSpineOpen(input);
  if (
    resumed.cCallRef !== expected.cCallRef ||
    resumed.opened.graphFunctionId !== input.graphFunctionId ||
    resumed.opened.edge !== input.edge ||
    resumed.opened.attempt !== input.attempt ||
    resumed.opened.batchRef !== input.batchRef
  ) {
    throw new TypeError(
      `c-call resume ${resumed.cCallRef} does not match the opened effect locus`
    );
  }
  if (
    resumed.selected !== null &&
    (resumed.selected.basisId !== expected.selected.basisId ||
      resumed.selected.regime !== expected.selected.regime ||
      resumed.selected.armId !== expected.selected.armId ||
      resumed.selected.programRef !== expected.selected.programRef ||
      resumed.selected.compositionRef !== expected.selected.compositionRef)
  ) {
    throw new TypeError(
      `c-call resume ${resumed.cCallRef} does not match the selected effect fibre`
    );
  }
  const selectedAlreadyAdmitted = resumed.selected !== null;
  return Object.freeze({
    cCallRef: resumed.cCallRef,
    opened: resumed.opened,
    selected: resumed.selected ?? expected.selected,
    events: Object.freeze(
      selectedAlreadyAdmitted ? [] : [expected.selected]
    ),
    resumed: true,
    selectedAlreadyAdmitted
  });
}

export function buildCCallSpineOpen(input: CCallSpineOpenInput): CCallSpineOpen {
  const opened = constructCCallOpenedEvent({
    basisId: input.basisId,
    graphFunctionId: input.graphFunctionId,
    graphCallId: input.graphCallId,
    frameId: input.frameId,
    edge: input.edge,
    vectorIndex: input.vectorIndex,
    stageRole: input.stageRole,
    taskOrdinal: input.taskOrdinal,
    attempt: input.attempt,
    batchRef: input.batchRef
  });
  const selected = constructCCallFibreSelectedEvent({
    cCallRef: opened.cCallRef,
    basisId: input.basisId,
    regime: input.regime,
    armId: input.armId,
    programRef: input.programRef ?? HOG_BOOTSTRAP_TRIPLE.programRef,
    compositionRef: input.compositionRef ?? null
  });
  return Object.freeze({
    cCallRef: opened.cCallRef,
    opened,
    selected,
    events: Object.freeze<readonly [CCallOpenedEvent, CCallFibreSelectedEvent]>([
      opened,
      selected
    ])
  });
}

export interface CCallSpineCloseInput {
  readonly cCallRef: string;
  readonly basisId: string;
  readonly evidenceClass: string;
  readonly evidenceRefs: readonly string[];
  readonly outcomeStatus: string;
  readonly payloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly judgment: CCallJudgment;
  readonly reasonRef: string | null;
}

export function buildCCallSpineClose(
  input: CCallSpineCloseInput
): readonly [CCallEvidencedEvent, CCallResultAdmittedEvent, CCallJudgedEvent] {
  return Object.freeze<
    readonly [CCallEvidencedEvent, CCallResultAdmittedEvent, CCallJudgedEvent]
  >([
    constructCCallEvidencedEvent({
      cCallRef: input.cCallRef,
      basisId: input.basisId,
      evidenceClass: input.evidenceClass,
      evidenceRefs: Object.freeze([...input.evidenceRefs])
    }),
    constructCCallResultAdmittedEvent({
      cCallRef: input.cCallRef,
      basisId: input.basisId,
      outcomeStatus: input.outcomeStatus,
      payloadRef: input.payloadRef,
      responseContractRef: input.responseContractRef
    }),
    constructCCallJudgedEvent({
      cCallRef: input.cCallRef,
      basisId: input.basisId,
      judgment: input.judgment,
      reasonRef: input.reasonRef
    })
  ]);
}

// Crash recovery may observe a prefix of the three close rows. Validate rows
// already in truth and emit only the missing suffix, preserving CCALL-001's
// exactly-one result and judgment law.
export function buildCCallSpineCloseOrResume(
  replayEvents: readonly RuntimeEvent[],
  input: CCallSpineCloseInput
): readonly RuntimeEvent[] {
  const expected = buildCCallSpineClose(input);
  const existingEvidence = replayEvents.filter(
    (event): event is CCallEvidencedEvent =>
      event.kind === "c_call_evidenced" && event.cCallRef === input.cCallRef
  );
  const existingResults = replayEvents.filter(
    (event): event is CCallResultAdmittedEvent =>
      event.kind === "c_call_result_admitted" && event.cCallRef === input.cCallRef
  );
  const existingJudgments = replayEvents.filter(
    (event): event is CCallJudgedEvent =>
      event.kind === "c_call_judged" && event.cCallRef === input.cCallRef
  );
  if (
    existingEvidence.length > 1 ||
    existingResults.length > 1 ||
    existingJudgments.length > 1
  ) {
    throw new TypeError(`c-call close resume ${input.cCallRef} contains duplicate rows`);
  }
  if (existingResults.length > 0 && existingEvidence.length === 0) {
    throw new TypeError(`c-call close resume ${input.cCallRef} has result before evidence`);
  }
  if (existingJudgments.length > 0 && existingResults.length === 0) {
    throw new TypeError(`c-call close resume ${input.cCallRef} has judgment before result`);
  }
  const expectedEvidence = expected[0];
  const expectedResult = expected[1];
  const expectedJudgment = expected[2];
  const evidence = existingEvidence[0];
  // Preserve the admitted effect evidence. Resume may reconstruct incidental
  // refs such as a new actor-invocation manifest while closing the same call.
  if (
    evidence !== undefined &&
    (evidence.basisId !== expectedEvidence.basisId ||
      evidence.evidenceClass !== expectedEvidence.evidenceClass)
  ) {
    throw new TypeError(`c-call close resume ${input.cCallRef} evidence conflicts`);
  }
  const result = existingResults[0];
  if (
    result !== undefined &&
    (result.basisId !== expectedResult.basisId ||
      result.outcomeStatus !== expectedResult.outcomeStatus ||
      result.payloadRef !== expectedResult.payloadRef ||
      result.responseContractRef !== expectedResult.responseContractRef)
  ) {
    throw new TypeError(
      `c-call close resume ${input.cCallRef} result conflicts: existing=${JSON.stringify(result)} expected=${JSON.stringify(expectedResult)}`
    );
  }
  const judgment = existingJudgments[0];
  if (
    judgment !== undefined &&
    (judgment.basisId !== expectedJudgment.basisId ||
      judgment.judgment !== expectedJudgment.judgment ||
      judgment.reasonRef !== expectedJudgment.reasonRef)
  ) {
    throw new TypeError(`c-call close resume ${input.cCallRef} judgment conflicts`);
  }
  return Object.freeze([
    ...(evidence === undefined ? [expectedEvidence] : []),
    ...(result === undefined ? [expectedResult] : []),
    ...(judgment === undefined ? [expectedJudgment] : [])
  ]);
}
