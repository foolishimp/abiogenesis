// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-015

import type { SdlcAssetBinding } from "../domain/index.js";
import type {
  SdlcAssetIdentity,
  SdlcEvaluatorPhase,
  SdlcEvaluatorResult,
  SdlcEvaluatorStatus,
  SdlcHookContract,
  SdlcHookInvocation,
  SdlcWorkReport
} from "./carriers.js";

function normalizeSurfaceName(value: string): string {
  return value.toLowerCase().replaceAll(/[^a-z0-9]/g, "");
}

function surfaceNamesMatch(left: string, right: string): boolean {
  return normalizeSurfaceName(left) === normalizeSurfaceName(right);
}

function evaluatorResult(input: {
  readonly phase: SdlcEvaluatorPhase;
  readonly status: SdlcEvaluatorStatus;
  readonly checkedEvaluatorNames: readonly string[];
  readonly blockingReasons: readonly string[];
  readonly evidenceRefs: readonly string[];
}): SdlcEvaluatorResult {
  return Object.freeze({
    kind: "sdlc_evaluator_result",
    phase: input.phase,
    status: input.status,
    checkedEvaluatorNames: Object.freeze([...input.checkedEvaluatorNames]),
    blockingReasons: Object.freeze([...input.blockingReasons]),
    evidenceRefs: Object.freeze([...input.evidenceRefs])
  });
}

function bindingCoversAssetType(
  binding: SdlcAssetBinding,
  assetType: string
): boolean {
  return surfaceNamesMatch(binding.nodeName, assetType);
}

function targetBindingContainsOutputAsset(input: {
  readonly targetBinding: SdlcAssetBinding;
  readonly outputIdentity: SdlcAssetIdentity;
}): boolean {
  return input.targetBinding.assetIds.includes(input.outputIdentity.assetId);
}

function missingSourceAssetTypes(input: {
  readonly contract: SdlcHookContract;
  readonly invocation: SdlcHookInvocation;
}): readonly string[] {
  return Object.freeze(
    input.contract.sourceAssetTypes.filter(
      (assetType) =>
        !input.invocation.sourceBindings.some((binding) =>
          bindingCoversAssetType(binding, assetType)
        )
    )
  );
}

export function evaluateSdlcHookPreflight(input: {
  readonly contract: SdlcHookContract;
  readonly invocation: SdlcHookInvocation;
}): SdlcEvaluatorResult {
  const blockingReasons: string[] = [];
  if (input.contract.edgeName !== input.invocation.edgeName) {
    blockingReasons.push("edge_contract_mismatch");
  }
  if (input.contract.edgeClass !== input.invocation.edgeClass) {
    blockingReasons.push("edge_class_mismatch");
  }
  if (
    !bindingCoversAssetType(
      input.invocation.targetBinding,
      input.contract.targetAssetType
    )
  ) {
    blockingReasons.push("target_binding_not_declared_for_contract_output");
  }
  const missingSources = missingSourceAssetTypes(input);
  if (missingSources.length > 0) {
    blockingReasons.push("source_binding_missing");
  }
  if (input.invocation.fpWorkerContractRef === null) {
    blockingReasons.push("fp_worker_contract_missing");
  }
  return evaluatorResult({
    phase: "preflight_fd",
    status: blockingReasons.length === 0 ? "passed" : "blocked",
    checkedEvaluatorNames: input.contract.transformProfile.preflightFd,
    blockingReasons,
    evidenceRefs: input.invocation.inputIdentities.map((identity) => identity.uri)
  });
}

export function evaluateSdlcHookPostflight(input: {
  readonly contract: SdlcHookContract;
  readonly report: SdlcWorkReport;
}): SdlcEvaluatorResult {
  const blockingReasons: string[] = [];
  if (input.contract.edgeName !== input.report.edgeName) {
    blockingReasons.push("edge_contract_mismatch");
  }
  if (input.contract.edgeClass !== input.report.edgeClass) {
    blockingReasons.push("edge_class_mismatch");
  }
  if (
    !bindingCoversAssetType(input.report.targetBinding, input.contract.targetAssetType)
  ) {
    blockingReasons.push("target_binding_not_declared_for_contract_output");
  }
  if (
    !surfaceNamesMatch(
      input.report.outputIdentity.declaredType,
      input.contract.targetAssetType
    )
  ) {
    blockingReasons.push("output_identity_type_mismatch");
  }
  if (
    !targetBindingContainsOutputAsset({
      targetBinding: input.report.targetBinding,
      outputIdentity: input.report.outputIdentity
    })
  ) {
    blockingReasons.push("output_identity_not_bound_to_target");
  }
  if (input.report.evidenceRefs.length === 0) {
    blockingReasons.push("evidence_refs_missing");
  }
  if (input.report.requestedOperation !== input.report.operationType) {
    blockingReasons.push("requested_operation_mismatch");
  }
  if (input.report.generatedAssetAuthority.graphFunctionName !== input.contract.edgeName) {
    blockingReasons.push("generated_asset_not_bound_to_graph_function");
  }
  if (
    !surfaceNamesMatch(
      input.report.generatedAssetAuthority.targetAssetType,
      input.contract.targetAssetType
    )
  ) {
    blockingReasons.push("generated_asset_authority_type_mismatch");
  }
  if (
    input.report.generatedAssetAuthority.targetAssetId !==
    input.report.outputIdentity.assetId
  ) {
    blockingReasons.push("generated_asset_authority_target_mismatch");
  }
  if (input.report.generatedAssetContract.targetAssetId !== input.report.outputIdentity.assetId) {
    blockingReasons.push("generated_contract_target_mismatch");
  }
  if (!input.report.generatedAssetContract.materialized) {
    blockingReasons.push("generated_asset_not_materialized");
  }
  if (!input.report.generatedAssetContract.satisfied) {
    blockingReasons.push("generated_asset_contract_failed");
  }
  if (
    input.report.generatedAssetContract.foreignRealizationCandidates.length > 0 ||
    input.report.ambiguityCandidates.length > 0
  ) {
    blockingReasons.push("ambiguity_candidates_preserved");
  }
  return evaluatorResult({
    phase: "postflight_fd",
    status: blockingReasons.length === 0 ? "passed" : "blocked",
    checkedEvaluatorNames: input.contract.transformProfile.postflightFd,
    blockingReasons,
    evidenceRefs: input.report.evidenceRefs.map((evidence) => evidence.ref)
  });
}
