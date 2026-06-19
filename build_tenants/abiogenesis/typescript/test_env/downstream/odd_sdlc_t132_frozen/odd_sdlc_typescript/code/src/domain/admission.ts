import {
  parseBoolean,
  parseClosedRecord,
  parseEnumValue,
  parseKind,
  parseNonEmptyString,
  parseNullableNonEmptyString,
  parseOptionalField,
  parseStringList
} from "../shared/validation.js";
import {
  SDLC_ASSET_MUTABILITY_VALUES,
  SDLC_ASSET_PROVENANCE_MODEL_VALUES,
  SDLC_CAPABILITY_FAMILY_VALUES,
  SDLC_OPERATIONAL_LANE_VALUES,
  SDLC_OPERATIONAL_RESULT_STATUS_VALUES,
  SDLC_WORKSITE_ASSET_REF_ROLE_VALUES,
  SDLC_WORKSITE_STATE_VALUES,
  type SdlcAsset,
  type SdlcAssetBinding,
  type SdlcAssetCheckpoint,
  type SdlcAssetFamily,
  type SdlcAssetProvenance,
  type SdlcAssetType,
  type SdlcCapability,
  type SdlcConstructionEvidenceCycle,
  type SdlcInstalledRunArchive,
  type SdlcLawfulActionMenuEntry,
  type SdlcOperationalResult,
  type SdlcOperationalTransitionCommand,
  type SdlcWorkAct,
  type SdlcWorkActDescriptor,
  type SdlcWorksite,
  type SdlcWorksiteAssetRef,
  type SdlcWorksiteObservation
} from "./carriers.js";

function parseNullableNumber(input: unknown, label: string): number | null {
  if (input === null) {
    return null;
  }
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label}: expected non-negative integer or null`);
  }
  return input;
}

function parseOptionalStringList(
  record: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): readonly string[] {
  const input = parseOptionalField(record, key);
  return input === undefined ? Object.freeze([]) : parseStringList(input, label);
}

function parseOptionalNullableNonEmptyString(
  record: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): string | null {
  const input = parseOptionalField(record, key);
  return input === undefined ? null : parseNullableNonEmptyString(input, label);
}

export function admitSdlcAssetType(
  input: unknown,
  label = "SdlcAssetType"
): SdlcAssetType {
  const record = parseClosedRecord(input, label, [
    "name",
    "description",
    "semanticFacets",
    "libraryLevel",
    "mutableDefault",
    "proofHints",
    "closureHints"
  ]);
  return Object.freeze({
    kind: "sdlc_asset_type",
    name: parseNonEmptyString(record["name"], `${label}.name`),
    description: parseNonEmptyString(record["description"], `${label}.description`),
    semanticFacets: parseStringList(record["semanticFacets"], `${label}.semanticFacets`),
    libraryLevel: parseNonEmptyString(record["libraryLevel"], `${label}.libraryLevel`),
    mutableDefault: parseBoolean(record["mutableDefault"], `${label}.mutableDefault`),
    proofHints: parseStringList(record["proofHints"], `${label}.proofHints`),
    closureHints: parseStringList(record["closureHints"], `${label}.closureHints`)
  });
}

export function admitSdlcAssetFamily(
  input: unknown,
  label = "SdlcAssetFamily"
): SdlcAssetFamily {
  const record = parseClosedRecord(input, label, [
    "name",
    "description",
    "lifecycleRole",
    "representativeAssetTypes",
    "realizationStatus"
  ]);
  return Object.freeze({
    kind: "sdlc_asset_family",
    name: parseNonEmptyString(record["name"], `${label}.name`),
    description: parseNonEmptyString(record["description"], `${label}.description`),
    lifecycleRole: parseNonEmptyString(record["lifecycleRole"], `${label}.lifecycleRole`),
    representativeAssetTypes: parseStringList(
      record["representativeAssetTypes"],
      `${label}.representativeAssetTypes`
    ),
    realizationStatus: parseNonEmptyString(
      record["realizationStatus"],
      `${label}.realizationStatus`
    )
  });
}

export function admitSdlcAssetProvenance(
  input: unknown,
  label = "SdlcAssetProvenance"
): SdlcAssetProvenance {
  const record = parseClosedRecord(input, label, [
    "model",
    "source",
    "mutable",
    "historyBasis"
  ]);
  return Object.freeze({
    kind: "sdlc_asset_provenance",
    model: parseEnumValue(
      record["model"],
      `${label}.model`,
      SDLC_ASSET_PROVENANCE_MODEL_VALUES
    ),
    source: parseNonEmptyString(record["source"], `${label}.source`),
    mutable: parseBoolean(record["mutable"], `${label}.mutable`),
    historyBasis: parseNonEmptyString(record["historyBasis"], `${label}.historyBasis`)
  });
}

export function admitSdlcAssetCheckpoint(
  input: unknown,
  label = "SdlcAssetCheckpoint"
): SdlcAssetCheckpoint {
  const record = parseClosedRecord(input, label, [
    "exists",
    "pathKind",
    "contentDigest",
    "byteCount"
  ]);
  return Object.freeze({
    kind: "sdlc_asset_checkpoint",
    exists: parseBoolean(record["exists"], `${label}.exists`),
    pathKind: parseNonEmptyString(record["pathKind"], `${label}.pathKind`),
    contentDigest: parseNullableNonEmptyString(
      record["contentDigest"],
      `${label}.contentDigest`
    ),
    byteCount: parseNullableNumber(record["byteCount"], `${label}.byteCount`)
  });
}

export function admitSdlcAsset(
  input: unknown,
  label = "SdlcAsset"
): SdlcAsset {
  const record = parseClosedRecord(input, label, [
    "assetId",
    "uri",
    "declaredType",
    "family",
    "mutability",
    "provenance",
    "checkpoint"
  ]);
  const checkpointInput = parseOptionalField(record, "checkpoint");
  return Object.freeze({
    kind: "sdlc_asset",
    assetId: parseNonEmptyString(record["assetId"], `${label}.assetId`),
    uri: parseNonEmptyString(record["uri"], `${label}.uri`),
    declaredType: parseNonEmptyString(record["declaredType"], `${label}.declaredType`),
    family: parseNonEmptyString(record["family"], `${label}.family`),
    mutability: parseEnumValue(
      record["mutability"],
      `${label}.mutability`,
      SDLC_ASSET_MUTABILITY_VALUES
    ),
    provenance: admitSdlcAssetProvenance(
      record["provenance"],
      `${label}.provenance`
    ),
    checkpoint:
      checkpointInput === null
        ? null
        : admitSdlcAssetCheckpoint(checkpointInput, `${label}.checkpoint`)
  });
}

export function admitSdlcAssetBinding(
  input: unknown,
  label = "SdlcAssetBinding"
): SdlcAssetBinding {
  const record = parseClosedRecord(input, label, ["nodeName", "assetIds"]);
  return Object.freeze({
    kind: "sdlc_asset_binding",
    nodeName: parseNonEmptyString(record["nodeName"], `${label}.nodeName`),
    assetIds: parseStringList(record["assetIds"], `${label}.assetIds`)
  });
}

export function admitSdlcWorksite(
  input: unknown,
  label = "SdlcWorksite"
): SdlcWorksite {
  const record = parseClosedRecord(input, label, [
    "worksiteId",
    "rootUri",
    "lifecycleState",
    "activeAssetIds",
    "systemAssetRefs",
    "workspaceAssetRefs",
    "runtimeEvidenceRefs",
    "selectedGraphFunctionRef",
    "selectedActionRef"
  ]);
  return Object.freeze({
    kind: "sdlc_worksite",
    worksiteId: parseNonEmptyString(record["worksiteId"], `${label}.worksiteId`),
    rootUri: parseNonEmptyString(record["rootUri"], `${label}.rootUri`),
    lifecycleState: parseEnumValue(
      record["lifecycleState"],
      `${label}.lifecycleState`,
      SDLC_WORKSITE_STATE_VALUES
    ),
    activeAssetIds: parseStringList(record["activeAssetIds"], `${label}.activeAssetIds`),
    systemAssetRefs: parseOptionalStringList(
      record,
      "systemAssetRefs",
      `${label}.systemAssetRefs`
    ),
    workspaceAssetRefs: parseOptionalStringList(
      record,
      "workspaceAssetRefs",
      `${label}.workspaceAssetRefs`
    ),
    runtimeEvidenceRefs: parseOptionalStringList(
      record,
      "runtimeEvidenceRefs",
      `${label}.runtimeEvidenceRefs`
    ),
    selectedGraphFunctionRef: parseOptionalNullableNonEmptyString(
      record,
      "selectedGraphFunctionRef",
      `${label}.selectedGraphFunctionRef`
    ),
    selectedActionRef: parseOptionalNullableNonEmptyString(
      record,
      "selectedActionRef",
      `${label}.selectedActionRef`
    )
  });
}

export function admitSdlcWorksiteAssetRef(
  input: unknown,
  label = "SdlcWorksiteAssetRef"
): SdlcWorksiteAssetRef {
  const record = parseClosedRecord(input, label, ["ref", "role", "description"]);
  return Object.freeze({
    kind: "sdlc_worksite_asset_ref",
    ref: parseNonEmptyString(record["ref"], `${label}.ref`),
    role: parseEnumValue(
      record["role"],
      `${label}.role`,
      SDLC_WORKSITE_ASSET_REF_ROLE_VALUES
    ),
    description: parseNonEmptyString(record["description"], `${label}.description`)
  });
}

export function admitSdlcWorksiteObservation(
  input: unknown,
  label = "SdlcWorksiteObservation"
): SdlcWorksiteObservation {
  const record = parseClosedRecord(input, label, [
    "observationRef",
    "worksiteId",
    "systemAssetRefs",
    "workspaceAssetRefs",
    "runtimeEvidenceRefs",
    "selectedGraphFunctionRef",
    "selectedActionRef",
    "targetBindingRefs",
    "predecessorRefs"
  ]);
  return Object.freeze({
    kind: "sdlc_worksite_observation",
    observationRef: parseNonEmptyString(
      record["observationRef"],
      `${label}.observationRef`
    ),
    worksiteId: parseNonEmptyString(record["worksiteId"], `${label}.worksiteId`),
    systemAssetRefs: parseStringList(
      record["systemAssetRefs"],
      `${label}.systemAssetRefs`
    ),
    workspaceAssetRefs: parseStringList(
      record["workspaceAssetRefs"],
      `${label}.workspaceAssetRefs`
    ),
    runtimeEvidenceRefs: parseStringList(
      record["runtimeEvidenceRefs"],
      `${label}.runtimeEvidenceRefs`
    ),
    selectedGraphFunctionRef: parseNullableNonEmptyString(
      record["selectedGraphFunctionRef"],
      `${label}.selectedGraphFunctionRef`
    ),
    selectedActionRef: parseNullableNonEmptyString(
      record["selectedActionRef"],
      `${label}.selectedActionRef`
    ),
    targetBindingRefs: parseStringList(
      record["targetBindingRefs"],
      `${label}.targetBindingRefs`
    ),
    predecessorRefs: parseStringList(
      record["predecessorRefs"],
      `${label}.predecessorRefs`
    )
  });
}

export function admitSdlcLawfulActionMenuEntry(
  input: unknown,
  label = "SdlcLawfulActionMenuEntry"
): SdlcLawfulActionMenuEntry {
  const record = parseClosedRecord(input, label, [
    "actionId",
    "graphFunctionRef",
    "sourceAssetRefs",
    "targetAssetRef",
    "expectedCarrierRef",
    "humanDecision",
    "retryActionRef",
    "donePredicate"
  ]);
  return Object.freeze({
    kind: "sdlc_lawful_action_menu_entry",
    actionId: parseNonEmptyString(record["actionId"], `${label}.actionId`),
    graphFunctionRef: parseNonEmptyString(
      record["graphFunctionRef"],
      `${label}.graphFunctionRef`
    ),
    sourceAssetRefs: parseStringList(
      record["sourceAssetRefs"],
      `${label}.sourceAssetRefs`
    ),
    targetAssetRef: parseNonEmptyString(
      record["targetAssetRef"],
      `${label}.targetAssetRef`
    ),
    expectedCarrierRef: parseNonEmptyString(
      record["expectedCarrierRef"],
      `${label}.expectedCarrierRef`
    ),
    humanDecision: parseNonEmptyString(record["humanDecision"], `${label}.humanDecision`),
    retryActionRef: parseNullableNonEmptyString(
      record["retryActionRef"],
      `${label}.retryActionRef`
    ),
    donePredicate: parseNonEmptyString(record["donePredicate"], `${label}.donePredicate`)
  });
}

export function admitSdlcInstalledRunArchive(
  input: unknown,
  label = "SdlcInstalledRunArchive"
): SdlcInstalledRunArchive {
  const record = parseClosedRecord(input, label, [
    "archiveRoot",
    "workspaceRoot",
    "runtimeRoot",
    "operatorRunRefs",
    "processTraceRefs",
    "productEvidenceRefs",
    "executionProofRefs"
  ]);
  return Object.freeze({
    kind: "sdlc_installed_run_archive",
    archiveRoot: parseNonEmptyString(record["archiveRoot"], `${label}.archiveRoot`),
    workspaceRoot: parseNonEmptyString(record["workspaceRoot"], `${label}.workspaceRoot`),
    runtimeRoot: parseNonEmptyString(record["runtimeRoot"], `${label}.runtimeRoot`),
    operatorRunRefs: parseStringList(
      record["operatorRunRefs"],
      `${label}.operatorRunRefs`
    ),
    processTraceRefs: parseStringList(
      record["processTraceRefs"],
      `${label}.processTraceRefs`
    ),
    productEvidenceRefs: parseStringList(
      record["productEvidenceRefs"],
      `${label}.productEvidenceRefs`
    ),
    executionProofRefs: parseStringList(
      record["executionProofRefs"],
      `${label}.executionProofRefs`
    )
  });
}

export function admitSdlcConstructionEvidenceCycle(
  input: unknown,
  label = "SdlcConstructionEvidenceCycle"
): SdlcConstructionEvidenceCycle {
  const record = parseClosedRecord(input, label, [
    "cycleRef",
    "worksiteObservationRef",
    "constructionIntentRef",
    "workerProcessRef",
    "edgeFulfillmentLedgerRef",
    "closureDecisionRef",
    "nextActionProjectionRef",
    "materializationManifestRef",
    "executionProofRefs",
    "predecessorRefs"
  ]);
  return Object.freeze({
    kind: "sdlc_construction_evidence_cycle",
    cycleRef: parseNonEmptyString(record["cycleRef"], `${label}.cycleRef`),
    worksiteObservationRef: parseNonEmptyString(
      record["worksiteObservationRef"],
      `${label}.worksiteObservationRef`
    ),
    constructionIntentRef: parseNonEmptyString(
      record["constructionIntentRef"],
      `${label}.constructionIntentRef`
    ),
    workerProcessRef: parseNonEmptyString(
      record["workerProcessRef"],
      `${label}.workerProcessRef`
    ),
    edgeFulfillmentLedgerRef: parseNonEmptyString(
      record["edgeFulfillmentLedgerRef"],
      `${label}.edgeFulfillmentLedgerRef`
    ),
    closureDecisionRef: parseNonEmptyString(
      record["closureDecisionRef"],
      `${label}.closureDecisionRef`
    ),
    nextActionProjectionRef: parseNonEmptyString(
      record["nextActionProjectionRef"],
      `${label}.nextActionProjectionRef`
    ),
    materializationManifestRef: parseNullableNonEmptyString(
      record["materializationManifestRef"],
      `${label}.materializationManifestRef`
    ),
    executionProofRefs: parseStringList(
      record["executionProofRefs"],
      `${label}.executionProofRefs`
    ),
    predecessorRefs: parseStringList(
      record["predecessorRefs"],
      `${label}.predecessorRefs`
    )
  });
}

export function admitSdlcWorkActDescriptor(
  input: unknown,
  label = "SdlcWorkActDescriptor"
): SdlcWorkActDescriptor {
  const record = parseClosedRecord(input, label, [
    "name",
    "description",
    "mutatesWorkspace",
    "producesGovernedEvidence",
    "typicalAssetFamilies",
    "realizationStatus"
  ]);
  return Object.freeze({
    kind: "sdlc_work_act_descriptor",
    name: parseNonEmptyString(record["name"], `${label}.name`),
    description: parseNonEmptyString(record["description"], `${label}.description`),
    mutatesWorkspace: parseBoolean(
      record["mutatesWorkspace"],
      `${label}.mutatesWorkspace`
    ),
    producesGovernedEvidence: parseBoolean(
      record["producesGovernedEvidence"],
      `${label}.producesGovernedEvidence`
    ),
    typicalAssetFamilies: parseStringList(
      record["typicalAssetFamilies"],
      `${label}.typicalAssetFamilies`
    ),
    realizationStatus: parseNonEmptyString(
      record["realizationStatus"],
      `${label}.realizationStatus`
    )
  });
}

export function admitSdlcWorkAct(
  input: unknown,
  label = "SdlcWorkAct"
): SdlcWorkAct {
  const record = parseClosedRecord(input, label, [
    "workActId",
    "descriptorName",
    "inputAssetIds",
    "outputAssetIds",
    "evidenceAssetIds",
    "provenance"
  ]);
  return Object.freeze({
    kind: "sdlc_work_act",
    workActId: parseNonEmptyString(record["workActId"], `${label}.workActId`),
    descriptorName: parseNonEmptyString(
      record["descriptorName"],
      `${label}.descriptorName`
    ),
    inputAssetIds: parseStringList(record["inputAssetIds"], `${label}.inputAssetIds`),
    outputAssetIds: parseStringList(record["outputAssetIds"], `${label}.outputAssetIds`),
    evidenceAssetIds: parseStringList(
      record["evidenceAssetIds"],
      `${label}.evidenceAssetIds`
    ),
    provenance: admitSdlcAssetProvenance(
      record["provenance"],
      `${label}.provenance`
    )
  });
}

export function admitSdlcCapability(
  input: unknown,
  label = "SdlcCapability"
): SdlcCapability {
  const record = parseClosedRecord(input, label, [
    "capabilityId",
    "family",
    "binding",
    "supportsAssetFamilies",
    "evidenceExpectation"
  ]);
  return Object.freeze({
    kind: "sdlc_capability",
    capabilityId: parseNonEmptyString(record["capabilityId"], `${label}.capabilityId`),
    family: parseEnumValue(record["family"], `${label}.family`, SDLC_CAPABILITY_FAMILY_VALUES),
    binding: parseNonEmptyString(record["binding"], `${label}.binding`),
    supportsAssetFamilies: parseStringList(
      record["supportsAssetFamilies"],
      `${label}.supportsAssetFamilies`
    ),
    evidenceExpectation: parseNonEmptyString(
      record["evidenceExpectation"],
      `${label}.evidenceExpectation`
    )
  });
}

export function admitSdlcOperationalTransitionCommand(
  input: unknown,
  label = "SdlcOperationalTransitionCommand"
): SdlcOperationalTransitionCommand {
  const record = parseClosedRecord(input, label, [
    "commandId",
    "lane",
    "requiredSubstrateBinding",
    "capabilityContract",
    "returnedEvidenceExpectation",
    "targetAssetIds"
  ]);
  return Object.freeze({
    kind: "sdlc_operational_transition_command",
    commandId: parseNonEmptyString(record["commandId"], `${label}.commandId`),
    lane: parseEnumValue(record["lane"], `${label}.lane`, SDLC_OPERATIONAL_LANE_VALUES),
    requiredSubstrateBinding: parseNonEmptyString(
      record["requiredSubstrateBinding"],
      `${label}.requiredSubstrateBinding`
    ),
    capabilityContract: parseNonEmptyString(
      record["capabilityContract"],
      `${label}.capabilityContract`
    ),
    returnedEvidenceExpectation: parseNonEmptyString(
      record["returnedEvidenceExpectation"],
      `${label}.returnedEvidenceExpectation`
    ),
    targetAssetIds: parseStringList(record["targetAssetIds"], `${label}.targetAssetIds`)
  });
}

export function admitSdlcOperationalResult(
  input: unknown,
  label = "SdlcOperationalResult"
): SdlcOperationalResult {
  const record = parseClosedRecord(input, label, [
    "kind",
    "resultId",
    "commandId",
    "status",
    "evidenceAssetIds",
    "returnedAt"
  ]);
  parseKind(record["kind"], "sdlc_operational_result", `${label}.kind`);
  return Object.freeze({
    kind: "sdlc_operational_result",
    resultId: parseNonEmptyString(record["resultId"], `${label}.resultId`),
    commandId: parseNonEmptyString(record["commandId"], `${label}.commandId`),
    status: parseEnumValue(
      record["status"],
      `${label}.status`,
      SDLC_OPERATIONAL_RESULT_STATUS_VALUES
    ),
    evidenceAssetIds: parseStringList(
      record["evidenceAssetIds"],
      `${label}.evidenceAssetIds`
    ),
    returnedAt: parseNullableNonEmptyString(record["returnedAt"], `${label}.returnedAt`)
  });
}
