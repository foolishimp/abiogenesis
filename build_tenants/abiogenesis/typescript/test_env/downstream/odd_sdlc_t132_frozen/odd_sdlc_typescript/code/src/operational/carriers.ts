// Implements: REQ-F-ODDSDLC-016
// Implements: REQ-F-ODDSDLC-026
// Implements: REQ-F-ODDSDLC-038
// Implements: REQ-F-ODDSDLC-039

import type {
  SdlcOperationalLane,
  SdlcOperationalResult,
  SdlcOperationalStateProjection,
  SdlcOperationalTransitionCommand
} from "../domain/index.js";

export interface SdlcOperationalTransitionPlan {
  readonly kind: "sdlc_operational_transition_plan";
  readonly status: "prepared" | "blocked";
  readonly lane: SdlcOperationalLane;
  readonly command: SdlcOperationalTransitionCommand | null;
  readonly blockingReason: "missing_capability" | null;
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcOperationalAdvance {
  readonly kind: "sdlc_operational_advance";
  readonly commandId: string;
  readonly stage: "prepared" | "result_admitted" | "pending_external_evidence";
  readonly result: SdlcOperationalResult | null;
  readonly projection: SdlcOperationalStateProjection;
  readonly shouldContinueInTenant: false;
  readonly nextControlOwner: "abg_public_start";
  readonly emittedRuntimeEventKinds: readonly [];
}

export interface SdlcRuntimeReturnObservation {
  readonly kind: "sdlc_runtime_return_observation";
  readonly commandId: string;
  readonly resultId: string;
  readonly status: "returned" | "pending" | "failed";
  readonly evidenceAssetIds: readonly string[];
  readonly runtimeFactRefs: readonly string[];
  readonly feedsGraphFunctions: readonly [
    "derive_runtime_observation_surface",
    "derive_retrofit_plan_surface"
  ];
  readonly emittedRuntimeEventKinds: readonly [];
}

