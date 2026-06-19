// Implements: REQ-F-ODDSDLC-014
// Implements: REQ-F-ODDSDLC-015

import type { SdlcAssetBinding } from "../domain/index.js";
import { admitSdlcWorkReport } from "./admission.js";
import type {
  SdlcAmbiguityCandidate,
  SdlcAssetIdentity,
  SdlcConstructorResult,
  SdlcEvidenceRef,
  SdlcGeneratedAssetContractAttestation,
  SdlcHookContract,
  SdlcHookInvocation,
  SdlcWorkReport
} from "./carriers.js";

function assetBindingPayload(binding: SdlcAssetBinding): {
  readonly nodeName: string;
  readonly assetIds: readonly string[];
} {
  return Object.freeze({
    nodeName: binding.nodeName,
    assetIds: Object.freeze([...binding.assetIds])
  });
}

function assetIdentityPayload(identity: SdlcAssetIdentity): {
  readonly assetId: string;
  readonly uri: string;
  readonly declaredType: string;
  readonly digest: string;
  readonly byteCount: number;
} {
  return Object.freeze({
    assetId: identity.assetId,
    uri: identity.uri,
    declaredType: identity.declaredType,
    digest: identity.digest,
    byteCount: identity.byteCount
  });
}

function evidenceRefPayload(evidence: SdlcEvidenceRef): {
  readonly ref: string;
  readonly evidenceType: string;
  readonly digest: string;
} {
  return Object.freeze({
    ref: evidence.ref,
    evidenceType: evidence.evidenceType,
    digest: evidence.digest
  });
}

function ambiguityCandidatePayload(candidate: SdlcAmbiguityCandidate): {
  readonly candidateId: string;
  readonly affectedAssetId: string;
  readonly relativePath: string;
  readonly reason: string;
} {
  return Object.freeze({
    candidateId: candidate.candidateId,
    affectedAssetId: candidate.affectedAssetId,
    relativePath: candidate.relativePath,
    reason: candidate.reason
  });
}

function generatedAssetContractPayload(
  attestation: SdlcGeneratedAssetContractAttestation
): {
  readonly contractName: string;
  readonly targetAssetId: string;
  readonly satisfied: boolean;
  readonly materialized: boolean;
  readonly diagnostics: readonly string[];
  readonly foreignRealizationCandidates: readonly ReturnType<
    typeof ambiguityCandidatePayload
  >[];
} {
  return Object.freeze({
    contractName: attestation.contractName,
    targetAssetId: attestation.targetAssetId,
    satisfied: attestation.satisfied,
    materialized: attestation.materialized,
    diagnostics: Object.freeze([...attestation.diagnostics]),
    foreignRealizationCandidates: Object.freeze(
      attestation.foreignRealizationCandidates.map(ambiguityCandidatePayload)
    )
  });
}

function generatedAssetAuthorityPayload(input: {
  readonly contract: SdlcHookContract;
  readonly outputIdentity: SdlcAssetIdentity;
}): {
  readonly graphFunctionName: string;
  readonly selectedBy: "abg_selected_edge";
  readonly targetAssetType: string;
  readonly targetAssetId: string;
} {
  return Object.freeze({
    graphFunctionName: input.contract.edgeName,
    selectedBy: "abg_selected_edge",
    targetAssetType: input.contract.targetAssetType,
    targetAssetId: input.outputIdentity.assetId
  });
}

export function constructSdlcWorkReport(input: {
  readonly contract: SdlcHookContract;
  readonly invocation: SdlcHookInvocation;
  readonly constructorResult: SdlcConstructorResult;
}): SdlcWorkReport {
  return admitSdlcWorkReport({
    kind: "sdlc_work_report",
    hookName: input.invocation.hookName,
    edgeName: input.contract.edgeName,
    edgeClass: input.contract.edgeClass,
    targetBinding: assetBindingPayload(input.invocation.targetBinding),
    requestedOperation: input.invocation.requestedOperation,
    operationType: input.constructorResult.operationType,
    inputIdentities: input.invocation.inputIdentities.map(assetIdentityPayload),
    outputIdentity: assetIdentityPayload(input.constructorResult.outputIdentity),
    evidenceRefs: input.constructorResult.evidenceRefs.map(evidenceRefPayload),
    generatedAssetAuthority: generatedAssetAuthorityPayload({
      contract: input.contract,
      outputIdentity: input.constructorResult.outputIdentity
    }),
    generatedAssetContract: generatedAssetContractPayload(
      input.constructorResult.generatedAssetContract
    ),
    ambiguityCandidates: input.constructorResult.ambiguityCandidates.map(
      ambiguityCandidatePayload
    ),
    emittedRuntimeEventKinds: []
  });
}
