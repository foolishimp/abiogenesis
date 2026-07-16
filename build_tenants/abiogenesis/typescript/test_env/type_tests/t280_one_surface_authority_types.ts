// Validates: T-280 nominal authority and non-runtime application boundaries.

import {
  admitOneSurfaceResultForClose,
  buildOneSurfaceAuthorityCloseEvents,
  type AdmittedOneSurfaceResultValue,
  type OneSurfaceArtifactResultPair,
  type OneSurfaceAuthorityProgramBinding,
  type OneSurfaceStageAuthority,
  type OneSurfaceResultValueByKind,
  type OneSurfaceTypedRefusal
} from "../../code/src/index.js";

declare const program: OneSurfaceAuthorityProgramBinding;
declare const modelStage: OneSurfaceStageAuthority<"synthesize_model">;
declare const modelResultPair: OneSurfaceArtifactResultPair<"synthesize_model">;

const runtimeAddressable: false = program.runtimeAddressable;
const effectsPermitted: false = program.effectsPermitted;
const runtimeOwner: "T-270" = program.runtimeAdmissionOwner;

const noAction: OneSurfaceResultValueByKind["evaluate_next"] = {
  selectedActionRef: null,
  intentCandidate: null
};
const systemAction: OneSurfaceResultValueByKind["evaluate_next"] = {
  selectedActionRef: "action://t280/open-fh",
  intentCandidate: null
};
const admittedModel = admitOneSurfaceResultForClose("synthesize_model", {
  desiredAssetRefs: ["asset://t280/desired"],
  knownAssetRefs: ["asset://t280/known"]
});
const typedModelAdmission: AdmittedOneSurfaceResultValue<"synthesize_model"> =
  admittedModel;
buildOneSurfaceAuthorityCloseEvents({
  stageAuthority: modelStage,
  resultPair: modelResultPair,
  cCallRef: "c-call://t280/model",
  basisId: "basis://t280/model",
  evidenceRefs: ["evidence://t280/model"]
});

declare const gapRefusal: OneSurfaceTypedRefusal<"eval_gap">;
const gapKind: "eval_gap" = gapRefusal.functionKind;

// @ts-expect-error T-280 output cannot become runtime authority.
const invalidRuntime: true = program.runtimeAddressable;
// @ts-expect-error function-specific refusal identity cannot be widened by value.
const invalidRefusal: OneSurfaceTypedRefusal<"evaluate_next"> = gapRefusal;
buildOneSurfaceAuthorityCloseEvents({
  stageAuthority: modelStage,
  // @ts-expect-error raw result values cannot cross the C-call close boundary.
  resultPair: noAction,
  cCallRef: "c-call://t280/invalid",
  basisId: "basis://t280/invalid",
  evidenceRefs: ["evidence://t280/invalid"]
});

void runtimeAddressable;
void effectsPermitted;
void runtimeOwner;
void noAction;
void systemAction;
void typedModelAdmission;
void gapKind;
void invalidRuntime;
void invalidRefusal;
