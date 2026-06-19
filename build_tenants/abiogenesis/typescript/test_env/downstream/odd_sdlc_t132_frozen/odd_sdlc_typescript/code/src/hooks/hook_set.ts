// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-014
// Implements: REQ-F-ODDSDLC-015
// Implements: REQ-F-ODDSDLC-017

import {
  EMPTY_RUNTIME_EVENT_KINDS,
  type SdlcConstructorResult,
  type SdlcHookContract,
  type SdlcHookInvocation,
  type SdlcHookTurnOutcome
} from "./carriers.js";
import {
  evaluateSdlcHookPostflight,
  evaluateSdlcHookPreflight
} from "./evaluators.js";
import { constructSdlcWorkReport } from "./work_report.js";

export function runSdlcHookTurn(input: {
  readonly contract: SdlcHookContract;
  readonly invocation: SdlcHookInvocation;
  readonly constructorResult: SdlcConstructorResult;
}): SdlcHookTurnOutcome {
  const preflight = evaluateSdlcHookPreflight({
    contract: input.contract,
    invocation: input.invocation
  });
  if (preflight.status === "blocked") {
    return Object.freeze({
      kind: "sdlc_hook_turn_outcome",
      contract: input.contract,
      preflight,
      workReport: null,
      postflight: null,
      emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
    });
  }
  const workReport = constructSdlcWorkReport(input);
  const postflight = evaluateSdlcHookPostflight({
    contract: input.contract,
    report: workReport
  });
  return Object.freeze({
    kind: "sdlc_hook_turn_outcome",
    contract: input.contract,
    preflight,
    workReport,
    postflight,
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}
