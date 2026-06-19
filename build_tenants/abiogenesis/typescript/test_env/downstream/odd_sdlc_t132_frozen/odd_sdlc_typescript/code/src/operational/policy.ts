// Implements: REQ-F-ODDSDLC-026
// Implements: REQ-F-ODDSDLC-038

import type { SdlcOperationalLane } from "../domain/index.js";

export interface SdlcOperationalLanePolicyEntry {
  readonly kind: "sdlc_operational_lane_policy_entry";
  readonly lane: SdlcOperationalLane;
  readonly requiredSubstrateBinding: string;
  readonly returnedEvidenceExpectation: string;
}

export const SDLC_OPERATIONAL_LANE_POLICY = Object.freeze([
  Object.freeze({
    kind: "sdlc_operational_lane_policy_entry",
    lane: "build",
    requiredSubstrateBinding: "runtime://build",
    returnedEvidenceExpectation: "build result evidence or explicit pending state"
  }),
  Object.freeze({
    kind: "sdlc_operational_lane_policy_entry",
    lane: "test_execution",
    requiredSubstrateBinding: "runtime://test",
    returnedEvidenceExpectation:
      "test_execution result evidence or explicit pending state"
  }),
  Object.freeze({
    kind: "sdlc_operational_lane_policy_entry",
    lane: "deployment",
    requiredSubstrateBinding: "runtime://deployment",
    returnedEvidenceExpectation: "deployment result evidence or explicit pending state"
  }),
  Object.freeze({
    kind: "sdlc_operational_lane_policy_entry",
    lane: "runtime_return",
    requiredSubstrateBinding: "runtime://runtime-return",
    returnedEvidenceExpectation:
      "runtime observation evidence or explicit pending state"
  })
] as const satisfies readonly SdlcOperationalLanePolicyEntry[]);

export function operationalLanePolicyFor(
  lane: SdlcOperationalLane
): SdlcOperationalLanePolicyEntry {
  const matched = SDLC_OPERATIONAL_LANE_POLICY.find((entry) => entry.lane === lane);
  if (matched === undefined) {
    throw new TypeError(`SdlcOperationalLanePolicy: missing policy for ${lane}`);
  }
  return matched;
}
