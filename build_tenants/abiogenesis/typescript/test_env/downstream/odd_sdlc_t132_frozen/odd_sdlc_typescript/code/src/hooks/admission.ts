// Implements: REQ-F-ODDSDLC-013
// Implements: REQ-F-ODDSDLC-014
// Implements: REQ-F-ODDSDLC-015

import {
  parseBoolean,
  parseArray,
  parseClosedRecord,
  parseEnumValue,
  parseKind,
  parseNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import { admitSdlcAssetBinding } from "../domain/index.js";
import {
  EMPTY_RUNTIME_EVENT_KINDS,
  SDLC_HOOK_EDGE_CLASS_VALUES,
  SDLC_WORK_OPERATION_VALUES,
  type SdlcAmbiguityCandidate,
  type SdlcAssetIdentity,
  type SdlcConstructorResult,
  type SdlcEvidenceRef,
  type SdlcGeneratedAssetAuthority,
  type SdlcGeneratedAssetContractAttestation,
  type SdlcHookInvocation,
  type SdlcWorkReport
} from "./carriers.js";

function parseNullableNonEmptyStringLocal(
  input: unknown,
  label: string
): string | null {
  if (input === null) {
    return null;
  }
  return parseNonEmptyString(input, label);
}

function parseNonNegativeInteger(input: unknown, label: string): number {
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label}: expected non-negative integer`);
  }
  return input;
}

export function admitSdlcAssetIdentity(
  input: unknown,
  label = "SdlcAssetIdentity"
): SdlcAssetIdentity {
  const record = parseClosedRecord(input, label, [
    "assetId",
    "uri",
    "declaredType",
    "digest",
    "byteCount"
  ]);
  return Object.freeze({
    kind: "sdlc_asset_identity",
    assetId: parseNonEmptyString(record["assetId"], `${label}.assetId`),
    uri: parseNonEmptyString(record["uri"], `${label}.uri`),
    declaredType: parseNonEmptyString(record["declaredType"], `${label}.declaredType`),
    digest: parseNonEmptyString(record["digest"], `${label}.digest`),
    byteCount: parseNonNegativeInteger(record["byteCount"], `${label}.byteCount`)
  });
}

export function admitSdlcEvidenceRef(
  input: unknown,
  label = "SdlcEvidenceRef"
): SdlcEvidenceRef {
  const record = parseClosedRecord(input, label, ["ref", "evidenceType", "digest"]);
  return Object.freeze({
    kind: "sdlc_evidence_ref",
    ref: parseNonEmptyString(record["ref"], `${label}.ref`),
    evidenceType: parseNonEmptyString(record["evidenceType"], `${label}.evidenceType`),
    digest: parseNonEmptyString(record["digest"], `${label}.digest`)
  });
}

export function admitSdlcAmbiguityCandidate(
  input: unknown,
  label = "SdlcAmbiguityCandidate"
): SdlcAmbiguityCandidate {
  const record = parseClosedRecord(input, label, [
    "candidateId",
    "affectedAssetId",
    "relativePath",
    "reason"
  ]);
  return Object.freeze({
    kind: "sdlc_ambiguity_candidate",
    candidateId: parseNonEmptyString(record["candidateId"], `${label}.candidateId`),
    affectedAssetId: parseNonEmptyString(
      record["affectedAssetId"],
      `${label}.affectedAssetId`
    ),
    relativePath: parseNonEmptyString(record["relativePath"], `${label}.relativePath`),
    reason: parseNonEmptyString(record["reason"], `${label}.reason`)
  });
}

export function admitSdlcGeneratedAssetContractAttestation(
  input: unknown,
  label = "SdlcGeneratedAssetContractAttestation"
): SdlcGeneratedAssetContractAttestation {
  const record = parseClosedRecord(input, label, [
    "contractName",
    "targetAssetId",
    "satisfied",
    "materialized",
    "diagnostics",
    "foreignRealizationCandidates"
  ]);
  return Object.freeze({
    kind: "sdlc_generated_asset_contract_attestation",
    contractName: parseNonEmptyString(record["contractName"], `${label}.contractName`),
    targetAssetId: parseNonEmptyString(record["targetAssetId"], `${label}.targetAssetId`),
    satisfied: parseBoolean(record["satisfied"], `${label}.satisfied`),
    materialized: parseBoolean(record["materialized"], `${label}.materialized`),
    diagnostics: parseStringList(record["diagnostics"], `${label}.diagnostics`),
    foreignRealizationCandidates: parseArray(
      record["foreignRealizationCandidates"],
      `${label}.foreignRealizationCandidates`,
      admitSdlcAmbiguityCandidate
    )
  });
}

export function admitSdlcGeneratedAssetAuthority(
  input: unknown,
  label = "SdlcGeneratedAssetAuthority"
): SdlcGeneratedAssetAuthority {
  const record = parseClosedRecord(input, label, [
    "graphFunctionName",
    "selectedBy",
    "targetAssetType",
    "targetAssetId"
  ]);
  return Object.freeze({
    kind: "sdlc_generated_asset_authority",
    graphFunctionName: parseNonEmptyString(
      record["graphFunctionName"],
      `${label}.graphFunctionName`
    ),
    selectedBy: parseEnumValue(
      record["selectedBy"],
      `${label}.selectedBy`,
      ["abg_selected_edge"]
    ),
    targetAssetType: parseNonEmptyString(
      record["targetAssetType"],
      `${label}.targetAssetType`
    ),
    targetAssetId: parseNonEmptyString(
      record["targetAssetId"],
      `${label}.targetAssetId`
    )
  });
}

export function admitSdlcHookInvocation(
  input: unknown,
  label = "SdlcHookInvocation"
): SdlcHookInvocation {
  const record = parseClosedRecord(input, label, [
    "hookName",
    "edgeName",
    "edgeClass",
    "sourceBindings",
    "targetBinding",
    "inputIdentities",
    "requestedOperation",
    "fpWorkerContractRef"
  ]);
  return Object.freeze({
    kind: "sdlc_hook_invocation",
    hookName: parseNonEmptyString(record["hookName"], `${label}.hookName`),
    edgeName: parseNonEmptyString(record["edgeName"], `${label}.edgeName`),
    edgeClass: parseEnumValue(
      record["edgeClass"],
      `${label}.edgeClass`,
      SDLC_HOOK_EDGE_CLASS_VALUES
    ),
    sourceBindings: parseArray(
      record["sourceBindings"],
      `${label}.sourceBindings`,
      admitSdlcAssetBinding
    ),
    targetBinding: admitSdlcAssetBinding(
      record["targetBinding"],
      `${label}.targetBinding`
    ),
    inputIdentities: parseArray(
      record["inputIdentities"],
      `${label}.inputIdentities`,
      admitSdlcAssetIdentity
    ),
    requestedOperation: parseEnumValue(
      record["requestedOperation"],
      `${label}.requestedOperation`,
      SDLC_WORK_OPERATION_VALUES
    ),
    fpWorkerContractRef: parseNullableNonEmptyStringLocal(
      record["fpWorkerContractRef"],
      `${label}.fpWorkerContractRef`
    )
  });
}

export function admitSdlcConstructorResult(
  input: unknown,
  label = "SdlcConstructorResult"
): SdlcConstructorResult {
  const record = parseClosedRecord(input, label, [
    "operationType",
    "outputIdentity",
    "evidenceRefs",
    "generatedAssetContract",
    "ambiguityCandidates"
  ]);
  return Object.freeze({
    kind: "sdlc_constructor_result",
    operationType: parseEnumValue(
      record["operationType"],
      `${label}.operationType`,
      SDLC_WORK_OPERATION_VALUES
    ),
    outputIdentity: admitSdlcAssetIdentity(
      record["outputIdentity"],
      `${label}.outputIdentity`
    ),
    evidenceRefs: parseArray(
      record["evidenceRefs"],
      `${label}.evidenceRefs`,
      admitSdlcEvidenceRef
    ),
    generatedAssetContract: admitSdlcGeneratedAssetContractAttestation(
      record["generatedAssetContract"],
      `${label}.generatedAssetContract`
    ),
    ambiguityCandidates: parseArray(
      record["ambiguityCandidates"],
      `${label}.ambiguityCandidates`,
      admitSdlcAmbiguityCandidate
    )
  });
}

export function admitSdlcWorkReport(
  input: unknown,
  label = "SdlcWorkReport"
): SdlcWorkReport {
  const record = parseClosedRecord(input, label, [
    "kind",
    "hookName",
    "edgeName",
    "edgeClass",
    "targetBinding",
    "requestedOperation",
    "operationType",
    "inputIdentities",
    "outputIdentity",
    "evidenceRefs",
    "generatedAssetAuthority",
    "generatedAssetContract",
    "ambiguityCandidates",
    "emittedRuntimeEventKinds"
  ]);
  const emittedRuntimeEventKinds = parseStringList(
    record["emittedRuntimeEventKinds"],
    `${label}.emittedRuntimeEventKinds`
  );
  if (emittedRuntimeEventKinds.length !== 0) {
    throw new TypeError(`${label}.emittedRuntimeEventKinds: expected empty array`);
  }
  parseKind(record["kind"], "sdlc_work_report", `${label}.kind`);
  return Object.freeze({
    kind: "sdlc_work_report",
    hookName: parseNonEmptyString(record["hookName"], `${label}.hookName`),
    edgeName: parseNonEmptyString(record["edgeName"], `${label}.edgeName`),
    edgeClass: parseEnumValue(
      record["edgeClass"],
      `${label}.edgeClass`,
      SDLC_HOOK_EDGE_CLASS_VALUES
    ),
    targetBinding: admitSdlcAssetBinding(
      record["targetBinding"],
      `${label}.targetBinding`
    ),
    requestedOperation: parseEnumValue(
      record["requestedOperation"],
      `${label}.requestedOperation`,
      SDLC_WORK_OPERATION_VALUES
    ),
    operationType: parseEnumValue(
      record["operationType"],
      `${label}.operationType`,
      SDLC_WORK_OPERATION_VALUES
    ),
    inputIdentities: parseArray(
      record["inputIdentities"],
      `${label}.inputIdentities`,
      admitSdlcAssetIdentity
    ),
    outputIdentity: admitSdlcAssetIdentity(
      record["outputIdentity"],
      `${label}.outputIdentity`
    ),
    evidenceRefs: parseArray(record["evidenceRefs"], `${label}.evidenceRefs`, admitSdlcEvidenceRef),
    generatedAssetAuthority: admitSdlcGeneratedAssetAuthority(
      record["generatedAssetAuthority"],
      `${label}.generatedAssetAuthority`
    ),
    generatedAssetContract: admitSdlcGeneratedAssetContractAttestation(
      record["generatedAssetContract"],
      `${label}.generatedAssetContract`
    ),
    ambiguityCandidates: parseArray(
      record["ambiguityCandidates"],
      `${label}.ambiguityCandidates`,
      admitSdlcAmbiguityCandidate
    ),
    emittedRuntimeEventKinds: EMPTY_RUNTIME_EVENT_KINDS
  });
}
