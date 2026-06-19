// Implements: REQ-F-ODDSDLC-016
// Implements: REQ-F-ODDSDLC-026
// Implements: REQ-F-ODDSDLC-038
// Implements: REQ-F-ODDSDLC-039

import {
  admitSdlcOperationalTransitionCommand,
  projectSdlcOperationalState,
  type SdlcOperationalLane,
  type SdlcOperationalResult,
  type SdlcOperationalTransitionCommand
} from "../domain/index.js";
import type { SdlcProjectConstraints } from "../workspace/index.js";
import type {
  SdlcOperationalAdvance,
  SdlcOperationalTransitionPlan,
  SdlcRuntimeReturnObservation
} from "./carriers.js";
import { operationalLanePolicyFor } from "./policy.js";

const EMPTY_RUNTIME_EVENT_KINDS: readonly [] = Object.freeze([]);
const RUNTIME_RETURN_FEEDS = Object.freeze([
  "derive_runtime_observation_surface",
  "derive_retrofit_plan_surface"
] as const);

export function prepareSdlcOperationalTransition(input: {
  readonly projectConstraints: SdlcProjectConstraints;
  readonly lane: SdlcOperationalLane;
  readonly commandId: string;
  readonly capabilityContract: string;
  readonly targetAssetIds: readonly string[];
}): SdlcOperationalTransitionPlan {
  if (!input.projectConstraints.capabilityContracts.includes(input.capabilityContract)) {
    return Object.freeze({
      kind: "sdlc_operational_transition_plan",
      status: "blocked",
      lane: input.lane,
      command: null,
      blockingReason: "missing_capability",
      emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
    });
  }
  const lanePolicy = operationalLanePolicyFor(input.lane);
  return Object.freeze({
    kind: "sdlc_operational_transition_plan",
    status: "prepared",
    lane: input.lane,
    command: admitSdlcOperationalTransitionCommand({
      commandId: input.commandId,
      lane: input.lane,
      requiredSubstrateBinding: lanePolicy.requiredSubstrateBinding,
      capabilityContract: input.capabilityContract,
      returnedEvidenceExpectation: lanePolicy.returnedEvidenceExpectation,
      targetAssetIds: input.targetAssetIds
    }),
    blockingReason: null,
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}

export function advanceSdlcOperationalTransitionOnce(input: {
  readonly command: SdlcOperationalTransitionCommand;
  readonly result?: SdlcOperationalResult;
  readonly runtimeFactRefs: readonly string[];
}): SdlcOperationalAdvance {
  const results = input.result === undefined ? [] : [input.result];
  const projection = projectSdlcOperationalState({
    command: input.command,
    results,
    runtimeFactRefs: input.runtimeFactRefs
  });
  const stage =
    input.result === undefined
      ? "pending_external_evidence"
      : "result_admitted";
  return Object.freeze({
    kind: "sdlc_operational_advance",
    commandId: input.command.commandId,
    stage,
    result: input.result ?? null,
    projection,
    shouldContinueInTenant: false,
    nextControlOwner: "abg_public_start",
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}

export function observeSdlcRuntimeReturn(input: {
  readonly command: SdlcOperationalTransitionCommand;
  readonly result: SdlcOperationalResult;
  readonly runtimeFactRefs: readonly string[];
}): SdlcRuntimeReturnObservation {
  if (input.command.lane !== "runtime_return") {
    throw new TypeError(
      "SdlcRuntimeReturnObservation.command: expected runtime_return lane"
    );
  }
  if (input.result.commandId !== input.command.commandId) {
    throw new TypeError(
      "SdlcRuntimeReturnObservation.result: result belongs to another command"
    );
  }
  const status =
    input.result.status === "succeeded"
      ? "returned"
      : input.result.status === "failed"
        ? "failed"
        : "pending";
  return Object.freeze({
    kind: "sdlc_runtime_return_observation",
    commandId: input.command.commandId,
    resultId: input.result.resultId,
    status,
    evidenceAssetIds: Object.freeze([...input.result.evidenceAssetIds]),
    runtimeFactRefs: Object.freeze([...input.runtimeFactRefs]),
    feedsGraphFunctions: RUNTIME_RETURN_FEEDS,
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}
