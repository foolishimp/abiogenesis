// Implements: REQ-R-ABG3-CCALL-001/-003/-006 (T-200 P2b).
// The ONE resolver: mints the spine around a fibre interior. Spine
// minting is ENGINE authority — fibre resolvers (plugins,
// engine-internal F_D) return interiors and NEVER mint spine truth.
// This module knows no fibre names beyond the census data it is handed
// and no program syntax (normalized declarations only).

import type {
  CCallJudgment,
  CCallRegime,
  RuntimeEvent
} from "../contracts/carriers.js";
import type { HogProgramStage } from "../contracts/hog_program.js";
import { buildCCallSpineOpen, buildCCallSpineClose } from "./c_call_spine.js";
import {
  constructCCallEvidencedEvent,
  constructCCallJudgedEvent,
  constructCCallResultAdmittedEvent,
  mintCCallRef
} from "../contracts/event_factories.js";

export interface CCallLocus {
  readonly basisId: string;
  readonly graphFunctionId: string;
  readonly graphCallId: string;
  readonly frameId: string;
  readonly edge: string;
  readonly vectorIndex: number;
  readonly taskOrdinal: number | null;
  readonly attempt: number;
  readonly batchRef: string | null;
}

export interface CCallEvidenceRow {
  readonly evidenceClass: string;
  readonly evidenceRefs: readonly string[];
}

export interface CCallInteriorResult {
  readonly outcomeStatus: string;
  readonly payloadRef: string | null;
  readonly responseContractRef: string | null;
  readonly evidence: readonly CCallEvidenceRow[];
  readonly judgment: CCallJudgment;
  readonly reasonRef: string | null;
}

export interface ResolveCCallInput {
  readonly stage: HogProgramStage;
  readonly programRef?: string | undefined;
  readonly locus: CCallLocus;
  readonly regimeOverride?: CCallRegime | undefined;
  readonly compositionRef?: string | null | undefined;
  readonly emit: (events: readonly RuntimeEvent[]) => void;
  readonly resolveFibre: (selection: {
    readonly cCallRef: string;
    readonly stageRole: string;
    readonly regime: CCallRegime;
    readonly armId: string;
  }) => Promise<CCallInteriorResult>;
}

export interface ResolveCCallResult {
  readonly cCallRef: string;
  readonly judgment: CCallJudgment;
  readonly reasonRef: string | null;
  readonly emittedKinds: readonly string[];
}

export async function resolveCCall(
  input: ResolveCCallInput
): Promise<ResolveCCallResult> {
  const { stage, locus } = input;
  const regime = input.regimeOverride ?? stage.defaultRegime;
  const spine = buildCCallSpineOpen({
    basisId: locus.basisId,
    graphFunctionId: locus.graphFunctionId,
    graphCallId: locus.graphCallId,
    frameId: locus.frameId,
    edge: locus.edge,
    vectorIndex: locus.vectorIndex,
    stageRole: stage.stageRole,
    taskOrdinal: locus.taskOrdinal,
    attempt: locus.attempt,
    batchRef: locus.batchRef,
    regime,
    armId: stage.armId,
    programRef: input.programRef,
    compositionRef: input.compositionRef ?? null
  });
  const cCallRef = spine.cCallRef;
  input.emit([...spine.events]);
  let interior: CCallInteriorResult;
  try {
    interior = await input.resolveFibre({
      cCallRef,
      stageRole: stage.stageRole,
      regime,
      armId: stage.armId
    });
  } catch (error) {
    // No orphan partial spines (codex round 4): a throwing fibre still
    // closes its spine as blocked truth before the error propagates.
    input.emit([
      ...buildCCallSpineClose({
        cCallRef,
        basisId: locus.basisId,
        evidenceClass: "fibre_failure",
        evidenceRefs: [
          `error:${String(error instanceof Error ? error.message : error).slice(0, 200)}`
        ],
        outcomeStatus: "blocked",
        payloadRef: null,
        responseContractRef: null,
        judgment: "blocked",
        reasonRef: null
      })
    ]);
    throw error;
  }
  const tail: RuntimeEvent[] = [];
  for (const row of interior.evidence) {
    tail.push(
      constructCCallEvidencedEvent({
        cCallRef,
        basisId: locus.basisId,
        evidenceClass: row.evidenceClass,
        evidenceRefs: row.evidenceRefs
      })
    );
  }
  tail.push(
    constructCCallResultAdmittedEvent({
      cCallRef,
      basisId: locus.basisId,
      outcomeStatus: interior.outcomeStatus,
      payloadRef: interior.payloadRef,
      responseContractRef: interior.responseContractRef
    })
  );
  tail.push(
    constructCCallJudgedEvent({
      cCallRef,
      basisId: locus.basisId,
      judgment: interior.judgment,
      reasonRef: interior.reasonRef
    })
  );
  input.emit(tail);
  return Object.freeze({
    cCallRef,
    judgment: interior.judgment,
    reasonRef: interior.reasonRef,
    emittedKinds: Object.freeze([
      "c_call_opened",
      "c_call_fibre_selected",
      ...interior.evidence.map(() => "c_call_evidenced"),
      "c_call_result_admitted",
      "c_call_judged"
    ])
  });
}

export function mintCCallRefForStage(
  stage: HogProgramStage,
  locus: CCallLocus
): string {
  return mintCCallRef({
    basisId: locus.basisId,
    graphCallId: locus.graphCallId,
    frameId: locus.frameId,
    vectorIndex: locus.vectorIndex,
    stageRole: stage.stageRole,
    taskOrdinal: locus.taskOrdinal,
    attempt: locus.attempt
  });
}
