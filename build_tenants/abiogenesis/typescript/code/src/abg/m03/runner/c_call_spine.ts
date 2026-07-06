// Implements: REQ-R-ABG3-CCALL-001/-002/-003 as ONE construction
// authority (T-200 Phase A1, ruling (a)). Every spine event the engine
// mints is built here — the eight per-arm bracket bodies collapse into
// calls. Builders are PURE (no emission): generator-compatible, and the
// online gate can judge the selection candidate before anything enters
// truth. Emission stays with the engine's emitRunnerEvents choke point.

import type {
  CCallJudgment,
  CCallOpenedEvent,
  CCallFibreSelectedEvent,
  CCallRegime,
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
    events: Object.freeze([opened, selected]) as readonly [
      CCallOpenedEvent,
      CCallFibreSelectedEvent
    ]
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
): readonly RuntimeEvent[] {
  return Object.freeze([
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
