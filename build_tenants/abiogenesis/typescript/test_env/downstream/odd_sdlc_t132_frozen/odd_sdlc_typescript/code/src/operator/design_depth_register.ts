// Implements: T-116
// Implements: T-121
// Implements: B-084

import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import {
  parseBoolean,
  parseClosedRecord,
  parseEnumValue,
  parseOptionalArray as parseArray,
  parseNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import {
  parseComponentRealizationRow,
  parseComponentTopologyRow
} from "./component_depth_register.js";
import { writeSdlcSystemArtifact } from "./system_artifacts.js";
import type {
  SdlcAggregateDomainEntity,
  SdlcAggregateDomainModel,
  SdlcAggregateDomainModelRow,
  SdlcAggregateSunnyDaySequence,
  SdlcDesignCompletenessAxisVerdict,
  SdlcDesignCompletenessVerdict,
  SdlcDesignDepthRegister,
  SdlcDesignDepthRegisterAdmission,
  SdlcDomainAttribute,
  SdlcDomainEntity,
  SdlcDomainOperation,
  SdlcEntityStateTransition,
  SdlcFileTargetRow,
  SdlcImplementationModuleRow,
  SdlcImplementationStackProfileRow,
  SdlcModuleSchemaFragment,
  SdlcModuleStateDiagramFragment,
  SdlcSunnyDaySequenceRow,
  SdlcSunnyDaySequenceStep
} from "./carriers.js";
import {
  SDLC_DESIGN_COMPLETENESS_AXES,
  SDLC_DESIGN_COMPLETENESS_STATUSES,
  SDLC_DOMAIN_ATTRIBUTE_CARDINALITIES,
  SDLC_DOMAIN_ENTITY_OWNERSHIP
} from "./carriers.js";

const DESIGN_DEPTH_TARGETS = Object.freeze([
  "implementation_design_surface"
] as const);

type DesignDepthTarget = (typeof DESIGN_DEPTH_TARGETS)[number];

function isDesignDepthTarget(
  targetAssetType: string
): targetAssetType is DesignDepthTarget {
  return DESIGN_DEPTH_TARGETS.some((target) => target === targetAssetType);
}

function mutableRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return Object.fromEntries(Object.entries(input));
}

// F_D admission is exact; semantic normalization belongs to selected evaluate.C/F_P content registers.

function parseStackProfileRow(
  input: unknown,
  label: string
): SdlcImplementationStackProfileRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "stackRef",
    "language",
    "buildTool"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_stack_profile_row") {
    throw new TypeError(`${label}.kind: unexpected stack profile row kind`);
  }
  return Object.freeze({
    kind: "sdlc_stack_profile_row" as const,
    stackRef: parseNonEmptyString(record["stackRef"], `${label}.stackRef`),
    language: parseNonEmptyString(record["language"], `${label}.language`),
    buildTool: parseNonEmptyString(record["buildTool"], `${label}.buildTool`)
  });
}

function parseImplementationModuleRow(
  input: unknown,
  label: string
): SdlcImplementationModuleRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "moduleName",
    "moduleRef"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_implementation_module_row") {
    throw new TypeError(`${label}.kind: unexpected implementation module row kind`);
  }
  return Object.freeze({
    kind: "sdlc_implementation_module_row" as const,
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    moduleRef: parseNonEmptyString(record["moduleRef"], `${label}.moduleRef`)
  });
}

function parseAggregateDomainModelRow(
  input: unknown,
  label: string
): SdlcAggregateDomainModelRow {
  const record = parseClosedRecord(input, label, ["kind", "modelRef"]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_aggregate_domain_model_row") {
    throw new TypeError(`${label}.kind: unexpected aggregate domain model row kind`);
  }
  return Object.freeze({
    kind: "sdlc_aggregate_domain_model_row" as const,
    modelRef: parseNonEmptyString(record["modelRef"], `${label}.modelRef`)
  });
}

function parseSunnyDaySequenceRow(
  input: unknown,
  label: string
): SdlcSunnyDaySequenceRow {
  const record = parseClosedRecord(input, label, ["kind", "sequenceRef"]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_sunny_day_sequence_row") {
    throw new TypeError(`${label}.kind: unexpected sunny-day sequence row kind`);
  }
  return Object.freeze({
    kind: "sdlc_sunny_day_sequence_row" as const,
    sequenceRef: parseNonEmptyString(record["sequenceRef"], `${label}.sequenceRef`)
  });
}

function parseFileTargetRow(input: unknown, label: string): SdlcFileTargetRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "relativePath",
    "role"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_file_target_row") {
    throw new TypeError(`${label}.kind: unexpected file target row kind`);
  }
  return Object.freeze({
    kind: "sdlc_file_target_row" as const,
    relativePath: parseNonEmptyString(record["relativePath"], `${label}.relativePath`),
    role: parseNonEmptyString(record["role"], `${label}.role`)
  });
}

function parseAttribute(input: unknown, label: string): SdlcDomainAttribute {
  const record = parseClosedRecord(input, label, [
    "kind",
    "attributeId",
    "name",
    "valueType",
    "cardinality",
    "invariantRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_domain_attribute") {
    throw new TypeError(`${label}.kind: unexpected attribute kind`);
  }
  return Object.freeze({
    kind: "sdlc_domain_attribute" as const,
    attributeId: parseNonEmptyString(record["attributeId"], `${label}.attributeId`),
    name: parseNonEmptyString(record["name"], `${label}.name`),
    valueType: parseNonEmptyString(record["valueType"], `${label}.valueType`),
    cardinality: parseEnumValue(
      record["cardinality"],
      `${label}.cardinality`,
      SDLC_DOMAIN_ATTRIBUTE_CARDINALITIES
    ),
    invariantRefs: parseStringList(record["invariantRefs"], `${label}.invariantRefs`)
  });
}

function parseEntity(input: unknown, label: string): SdlcDomainEntity {
  const record = parseClosedRecord(input, label, [
    "kind",
    "entityId",
    "moduleName",
    "ownership",
    "attributes",
    "invariants",
    "sourceAssetRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_domain_entity") {
    throw new TypeError(`${label}.kind: unexpected entity kind`);
  }
  return Object.freeze({
    kind: "sdlc_domain_entity" as const,
    entityId: parseNonEmptyString(record["entityId"], `${label}.entityId`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    ownership: parseEnumValue(
      record["ownership"],
      `${label}.ownership`,
      SDLC_DOMAIN_ENTITY_OWNERSHIP
    ),
    attributes: parseArray(record["attributes"], `${label}.attributes`, parseAttribute),
    invariants: parseStringList(record["invariants"], `${label}.invariants`),
    sourceAssetRefs: parseStringList(record["sourceAssetRefs"], `${label}.sourceAssetRefs`)
  });
}

function parseOperation(input: unknown, label: string): SdlcDomainOperation {
  const record = parseClosedRecord(input, label, [
    "kind",
    "operationId",
    "moduleName",
    "inputEntityIds",
    "outputEntityIds",
    "requiredAttributeIds"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_domain_operation") {
    throw new TypeError(`${label}.kind: unexpected operation kind`);
  }
  return Object.freeze({
    kind: "sdlc_domain_operation" as const,
    operationId: parseNonEmptyString(record["operationId"], `${label}.operationId`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    inputEntityIds: parseStringList(record["inputEntityIds"], `${label}.inputEntityIds`),
    outputEntityIds: parseStringList(record["outputEntityIds"], `${label}.outputEntityIds`),
    requiredAttributeIds: parseStringList(
      record["requiredAttributeIds"],
      `${label}.requiredAttributeIds`
    )
  });
}

function parseModuleSchemaFragment(
  input: unknown,
  label: string
): SdlcModuleSchemaFragment {
  const record = parseClosedRecord(input, label, [
    "kind",
    "moduleName",
    "entities",
    "operations",
    "requirementIds",
    "sourceAssetRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_module_schema_fragment") {
    throw new TypeError(`${label}.kind: unexpected schema fragment kind`);
  }
  const moduleName = parseNonEmptyString(record["moduleName"], `${label}.moduleName`);
  const entities = parseArray(record["entities"], `${label}.entities`, parseEntity);
  const operations = parseArray(record["operations"], `${label}.operations`, parseOperation);
  const contradictoryEntity = entities.find(
    (entity) => entity.moduleName !== moduleName
  );
  if (contradictoryEntity !== undefined) {
    throw new TypeError(
      `${label}.entities: entity ${contradictoryEntity.entityId} moduleName ${contradictoryEntity.moduleName} contradicts schema moduleName ${moduleName}`
    );
  }
  const contradictoryOperation = operations.find(
    (operation) => operation.moduleName !== moduleName
  );
  if (contradictoryOperation !== undefined) {
    throw new TypeError(
      `${label}.operations: operation ${contradictoryOperation.operationId} moduleName ${contradictoryOperation.moduleName} contradicts schema moduleName ${moduleName}`
    );
  }
  return Object.freeze({
    kind: "sdlc_module_schema_fragment" as const,
    moduleName,
    entities,
    operations,
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    sourceAssetRefs: parseStringList(record["sourceAssetRefs"], `${label}.sourceAssetRefs`)
  });
}

function parseTransition(input: unknown, label: string): SdlcEntityStateTransition {
  const record = parseClosedRecord(input, label, [
    "kind",
    "transitionId",
    "fromState",
    "toState",
    "operationId",
    "entityId"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_entity_state_transition") {
    throw new TypeError(`${label}.kind: unexpected transition kind`);
  }
  return Object.freeze({
    kind: "sdlc_entity_state_transition" as const,
    transitionId: parseNonEmptyString(record["transitionId"], `${label}.transitionId`),
    fromState: parseNonEmptyString(record["fromState"], `${label}.fromState`),
    toState: parseNonEmptyString(record["toState"], `${label}.toState`),
    operationId: parseNonEmptyString(record["operationId"], `${label}.operationId`),
    entityId: parseNonEmptyString(record["entityId"], `${label}.entityId`)
  });
}

function parseStateDiagramFragment(
  input: unknown,
  label: string
): SdlcModuleStateDiagramFragment {
  const record = parseClosedRecord(input, label, [
    "kind",
    "moduleName",
    "entityId",
    "stateless",
    "states",
    "transitions",
    "requirementIds",
    "sourceAssetRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_module_state_diagram_fragment") {
    throw new TypeError(`${label}.kind: unexpected state diagram fragment kind`);
  }
  return Object.freeze({
    kind: "sdlc_module_state_diagram_fragment" as const,
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    entityId: parseNonEmptyString(record["entityId"], `${label}.entityId`),
    stateless: parseBoolean(record["stateless"], `${label}.stateless`),
    states: parseStringList(record["states"], `${label}.states`),
    transitions: parseArray(record["transitions"], `${label}.transitions`, parseTransition),
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    sourceAssetRefs: parseStringList(record["sourceAssetRefs"], `${label}.sourceAssetRefs`)
  });
}

function parseAggregateEntity(
  input: unknown,
  label: string
): SdlcAggregateDomainEntity {
  const record = parseClosedRecord(input, label, [
    "kind",
    "entityId",
    "ownerModuleName",
    "attributes",
    "sourceModuleNames"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_aggregate_domain_entity") {
    throw new TypeError(`${label}.kind: unexpected aggregate entity kind`);
  }
  return Object.freeze({
    kind: "sdlc_aggregate_domain_entity" as const,
    entityId: parseNonEmptyString(record["entityId"], `${label}.entityId`),
    ownerModuleName: parseNonEmptyString(
      record["ownerModuleName"],
      `${label}.ownerModuleName`
    ),
    attributes: parseArray(record["attributes"], `${label}.attributes`, parseAttribute),
    sourceModuleNames: parseStringList(
      record["sourceModuleNames"],
      `${label}.sourceModuleNames`
    )
  });
}

function parseCrossModuleReference(
  input: unknown,
  label: string
): SdlcAggregateDomainModel["crossModuleReferences"][number] {
  const record = parseClosedRecord(input, label, [
    "fromModuleName",
    "toModuleName",
    "entityId"
  ]);
  return Object.freeze({
    fromModuleName: parseNonEmptyString(record["fromModuleName"], `${label}.fromModuleName`),
    toModuleName: parseNonEmptyString(record["toModuleName"], `${label}.toModuleName`),
    entityId: parseNonEmptyString(record["entityId"], `${label}.entityId`)
  });
}

function parseAggregateDomainModel(
  input: unknown,
  label: string
): SdlcAggregateDomainModel | null {
  if (input === null || input === undefined) {
    return null;
  }
  const record = parseClosedRecord(input, label, [
    "kind",
    "modelVersion",
    "entities",
    "operations",
    "crossModuleReferences",
    "evidenceRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_aggregate_domain_model") {
    throw new TypeError(`${label}.kind: unexpected aggregate model kind`);
  }
  const modelVersion = parseNonEmptyString(record["modelVersion"], `${label}.modelVersion`);
  if (modelVersion !== "ts-design-depth-v1") {
    throw new TypeError(`${label}.modelVersion: unsupported version`);
  }
  return Object.freeze({
    kind: "sdlc_aggregate_domain_model" as const,
    modelVersion: "ts-design-depth-v1" as const,
    entities: parseArray(record["entities"], `${label}.entities`, parseAggregateEntity),
    operations: parseArray(record["operations"], `${label}.operations`, parseOperation),
    crossModuleReferences: parseArray(
      record["crossModuleReferences"],
      `${label}.crossModuleReferences`,
      parseCrossModuleReference
    ),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseSequenceStep(input: unknown, label: string): SdlcSunnyDaySequenceStep {
  const record = parseClosedRecord(input, label, [
    "kind",
    "stepId",
    "moduleName",
    "operationId",
    "inputEntityIds",
    "outputEntityIds",
    "stateTransitionIds"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_sunny_day_sequence_step") {
    throw new TypeError(`${label}.kind: unexpected sequence step kind`);
  }
  return Object.freeze({
    kind: "sdlc_sunny_day_sequence_step" as const,
    stepId: parseNonEmptyString(record["stepId"], `${label}.stepId`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    operationId: parseNonEmptyString(record["operationId"], `${label}.operationId`),
    inputEntityIds: parseStringList(record["inputEntityIds"], `${label}.inputEntityIds`),
    outputEntityIds: parseStringList(record["outputEntityIds"], `${label}.outputEntityIds`),
    stateTransitionIds: parseStringList(
      record["stateTransitionIds"],
      `${label}.stateTransitionIds`
    )
  });
}

function parseSunnyDaySequence(
  input: unknown,
  label: string
): SdlcAggregateSunnyDaySequence | null {
  if (input === null || input === undefined) {
    return null;
  }
  const record = parseClosedRecord(input, label, [
    "kind",
    "sequenceVersion",
    "steps",
    "evidenceRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_aggregate_sunny_day_sequence") {
    throw new TypeError(`${label}.kind: unexpected sunny-day sequence kind`);
  }
  const sequenceVersion = parseNonEmptyString(
    record["sequenceVersion"],
    `${label}.sequenceVersion`
  );
  if (sequenceVersion !== "ts-design-depth-v1") {
    throw new TypeError(`${label}.sequenceVersion: unsupported version`);
  }
  return Object.freeze({
    kind: "sdlc_aggregate_sunny_day_sequence" as const,
    sequenceVersion: "ts-design-depth-v1" as const,
    steps: parseArray(record["steps"], `${label}.steps`, parseSequenceStep),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseAxisVerdict(
  input: unknown,
  label: string
): SdlcDesignCompletenessAxisVerdict {
  const record = parseClosedRecord(input, label, [
    "kind",
    "axis",
    "status",
    "reasons",
    "evidenceRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_design_completeness_axis_verdict") {
    throw new TypeError(`${label}.kind: unexpected axis verdict kind`);
  }
  return Object.freeze({
    kind: "sdlc_design_completeness_axis_verdict" as const,
    axis: parseEnumValue(record["axis"], `${label}.axis`, SDLC_DESIGN_COMPLETENESS_AXES),
    status: parseEnumValue(
      record["status"],
      `${label}.status`,
      SDLC_DESIGN_COMPLETENESS_STATUSES
    ),
    reasons: parseStringList(record["reasons"], `${label}.reasons`),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseCompletenessVerdict(
  input: unknown,
  label: string
): SdlcDesignCompletenessVerdict | null {
  if (input === null || input === undefined) {
    return null;
  }
  const record = parseClosedRecord(input, label, [
    "kind",
    "verdictVersion",
    "entity",
    "attribute",
    "flow"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_design_completeness_verdict") {
    throw new TypeError(`${label}.kind: unexpected completeness verdict kind`);
  }
  const verdictVersion = parseNonEmptyString(
    record["verdictVersion"],
    `${label}.verdictVersion`
  );
  if (verdictVersion !== "ts-design-depth-v1") {
    throw new TypeError(`${label}.verdictVersion: unsupported version`);
  }
  return Object.freeze({
    kind: "sdlc_design_completeness_verdict" as const,
    verdictVersion: "ts-design-depth-v1" as const,
    entity: parseAxisVerdict(record["entity"], `${label}.entity`),
    attribute: parseAxisVerdict(record["attribute"], `${label}.attribute`),
    flow: parseAxisVerdict(record["flow"], `${label}.flow`)
  });
}

function parseRegister(input: unknown, label: string): SdlcDesignDepthRegister {
  const record = parseClosedRecord(input, label, [
    "kind",
    "registerVersion",
    "targetAssetType",
    "stackProfileRows",
    "implementationModuleRows",
    "aggregateDomainModelRows",
    "moduleSchemaFragments",
    "moduleStateDiagramFragments",
    "aggregateDomainModel",
    "sunnyDaySequenceRows",
    "aggregateSunnyDaySequence",
    "componentTopologyRows",
    "componentRealizationRows",
    "fileTargetRows",
    "designCompletenessVerdict"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_design_depth_register") {
    throw new TypeError(`${label}.kind: unexpected register kind`);
  }
  const registerVersion = parseNonEmptyString(
    record["registerVersion"],
    `${label}.registerVersion`
  );
  if (registerVersion !== "ts-design-depth-v1") {
    throw new TypeError(`${label}.registerVersion: unsupported version`);
  }
  return Object.freeze({
    kind: "sdlc_design_depth_register" as const,
    registerVersion: "ts-design-depth-v1" as const,
    targetAssetType: parseNonEmptyString(record["targetAssetType"], `${label}.targetAssetType`),
    stackProfileRows: parseArray(
      record["stackProfileRows"],
      `${label}.stackProfileRows`,
      parseStackProfileRow
    ),
    implementationModuleRows: parseArray(
      record["implementationModuleRows"],
      `${label}.implementationModuleRows`,
      parseImplementationModuleRow
    ),
    aggregateDomainModelRows: parseArray(
      record["aggregateDomainModelRows"],
      `${label}.aggregateDomainModelRows`,
      parseAggregateDomainModelRow
    ),
    moduleSchemaFragments: parseArray(
      record["moduleSchemaFragments"],
      `${label}.moduleSchemaFragments`,
      parseModuleSchemaFragment
    ),
    moduleStateDiagramFragments: parseArray(
      record["moduleStateDiagramFragments"],
      `${label}.moduleStateDiagramFragments`,
      parseStateDiagramFragment
    ),
    aggregateDomainModel: parseAggregateDomainModel(
      record["aggregateDomainModel"],
      `${label}.aggregateDomainModel`
    ),
    sunnyDaySequenceRows: parseArray(
      record["sunnyDaySequenceRows"],
      `${label}.sunnyDaySequenceRows`,
      parseSunnyDaySequenceRow
    ),
    aggregateSunnyDaySequence: parseSunnyDaySequence(
      record["aggregateSunnyDaySequence"],
      `${label}.aggregateSunnyDaySequence`
    ),
    componentTopologyRows: parseArray(
      record["componentTopologyRows"],
      `${label}.componentTopologyRows`,
      parseComponentTopologyRow
    ),
    componentRealizationRows: parseArray(
      record["componentRealizationRows"],
      `${label}.componentRealizationRows`,
      parseComponentRealizationRow
    ),
    fileTargetRows: parseArray(
      record["fileTargetRows"],
      `${label}.fileTargetRows`,
      parseFileTargetRow
    ),
    designCompletenessVerdict: parseCompletenessVerdict(
      record["designCompletenessVerdict"],
      `${label}.designCompletenessVerdict`
    )
  });
}

export function parseDesignDepthRegisterPayload(
  input: unknown
): SdlcDesignDepthRegister {
  return parseRegister(input, "design_depth_register");
}

function designDepthFileTargetRoleIsSource(role: string): boolean {
  const normalized = role.trim().toLowerCase().replace(/[-\s/]+/gu, "_");
  return (
    normalized === "source" ||
    normalized === "source_implementation" ||
    normalized === "implementation_source" ||
    normalized === "source_code" ||
    normalized === "runtime_source"
  );
}

function sourceFileTargetValidationErrors(
  register: SdlcDesignDepthRegister
): readonly string[] {
  const sourcePaths = new Set(
    register.fileTargetRows
      .filter((row) => designDepthFileTargetRoleIsSource(row.role))
      .map((row) => row.relativePath)
  );
  const errors: string[] = [];
  if (sourcePaths.size === 0) {
    errors.push("design_depth_register_source_file_target_missing");
  }
  if (register.componentTopologyRows.length === 0) {
    errors.push("design_depth_register_component_topology_source_rows_missing");
  }
  if (register.componentRealizationRows.length === 0) {
    errors.push("design_depth_register_component_realization_source_rows_missing");
  }
  for (const row of register.componentTopologyRows) {
    if (!sourcePaths.has(row.relativePath)) {
      errors.push(
        `design_depth_register_component_topology_source_target_missing:${row.relativePath}`
      );
    }
  }
  for (const row of register.componentRealizationRows) {
    if (!sourcePaths.has(row.relativePath)) {
      errors.push(
        `design_depth_register_component_realization_source_target_missing:${row.relativePath}`
      );
    }
  }
  return Object.freeze(errors);
}

function objectRecord(input: unknown): Record<string, unknown> | null {
  return mutableRecord(input);
}

function jsonCandidate(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    return undefined;
  }
}

function containsFencedDesignDepthRegister(content: string): boolean {
  const fencedBlockExpression =
    /^```([^\r\n`]*)\r?\n([\s\S]*?)^```[^\S\r\n]*$/gmu;
  for (const match of content.matchAll(fencedBlockExpression)) {
    const infoString = match[1]?.trim() ?? "";
    const infoParts = infoString.split(/\s+/u).filter((part) => part.length > 0);
    const isJsonDesignDepthRegister =
      infoParts.includes("json") &&
      (infoParts.includes("design_depth_register") ||
        infoParts.includes("designDepthRegister"));
    if (isJsonDesignDepthRegister) {
      return true;
    }
  }
  return false;
}

function writeDesignDepthCandidateEvidence(input: {
  readonly archiveRoot: string | null | undefined;
  readonly candidateIndex: number;
  readonly rawCandidate: unknown;
  readonly admittedCandidate: unknown;
}): readonly string[] {
  if (input.archiveRoot === null || input.archiveRoot === undefined) {
    return Object.freeze([]);
  }
  const rawPath = join(
    input.archiveRoot,
    `design_depth_candidate_${input.candidateIndex}_raw.json`
  );
  const admittedPath = join(
    input.archiveRoot,
    `design_depth_candidate_${input.candidateIndex}_admitted.json`
  );
  writeSdlcSystemArtifact({
    archiveRoot: input.archiveRoot,
    absolutePath: rawPath,
    payload: `${JSON.stringify(input.rawCandidate, null, 2)}\n`
  });
  writeSdlcSystemArtifact({
    archiveRoot: input.archiveRoot,
    absolutePath: admittedPath,
    payload: `${JSON.stringify(input.admittedCandidate, null, 2)}\n`
  });
  return Object.freeze([pathToFileURL(rawPath).href, pathToFileURL(admittedPath).href]);
}

export function admitDesignDepthRegisterFromArtifact(input: {
  readonly targetAssetType: string;
  readonly outputFile: string;
  readonly archiveRoot?: string | null;
  readonly requireSourceFileTargets?: boolean | undefined;
}): SdlcDesignDepthRegisterAdmission {
  const evidenceRefs = Object.freeze([pathToFileURL(input.outputFile).href]);
  if (!isDesignDepthTarget(input.targetAssetType)) {
    return Object.freeze({
      kind: "sdlc_design_depth_register_admission" as const,
      status: "not_required" as const,
      targetAssetType: input.targetAssetType,
      register: null,
      blockingReasons: Object.freeze([]),
      evidenceRefs
    });
  }
  if (!existsSync(input.outputFile) || !statSync(input.outputFile).isFile()) {
    return Object.freeze({
      kind: "sdlc_design_depth_register_admission" as const,
      status: "rejected" as const,
      targetAssetType: input.targetAssetType,
      register: null,
      blockingReasons: Object.freeze(["design_depth_output_missing"]),
      evidenceRefs
    });
  }
  const content = readFileSync(input.outputFile, "utf8");
  if (containsFencedDesignDepthRegister(content)) {
    return Object.freeze({
      kind: "sdlc_design_depth_register_admission" as const,
      status: "rejected" as const,
      targetAssetType: input.targetAssetType,
      register: null,
      blockingReasons: Object.freeze([
        "design_depth_worker_emitted_register_forbidden"
      ]),
      evidenceRefs
    });
  }
  const parsedCandidate = jsonCandidate(content);
  if (parsedCandidate === undefined) {
    return Object.freeze({
      kind: "sdlc_design_depth_register_admission" as const,
      status: "rejected" as const,
      targetAssetType: input.targetAssetType,
      register: null,
      blockingReasons: Object.freeze(
        input.requireSourceFileTargets === true
          ? ["design_depth_register_json_required"]
          : ["design_depth_register_missing"]
      ),
      evidenceRefs
    });
  }
  const topLevelRecord = objectRecord(parsedCandidate);
  if (topLevelRecord?.["kind"] !== "sdlc_design_depth_register") {
    return Object.freeze({
      kind: "sdlc_design_depth_register_admission" as const,
      status: "rejected" as const,
      targetAssetType: input.targetAssetType,
      register: null,
      blockingReasons: Object.freeze([
        "design_depth_register_top_level_kind_required"
      ]),
      evidenceRefs
    });
  }
  const errors: string[] = [];
  const candidateEvidenceRefs: string[] = [];
  for (const [candidateIndex, candidate] of [parsedCandidate].entries()) {
    candidateEvidenceRefs.push(
      ...writeDesignDepthCandidateEvidence({
        archiveRoot: input.archiveRoot,
        candidateIndex,
        rawCandidate: candidate,
        admittedCandidate: candidate
      })
    );
    const currentEvidenceRefs = Object.freeze([
      ...evidenceRefs,
      ...candidateEvidenceRefs
    ]);
    try {
      const register = parseRegister(candidate, "design_depth_register");
      if (register.targetAssetType !== input.targetAssetType) {
        errors.push(`design_depth_register_target_mismatch:${register.targetAssetType}`);
        continue;
      }
      if (input.requireSourceFileTargets === true) {
        const sourceTargetErrors = sourceFileTargetValidationErrors(register);
        if (sourceTargetErrors.length > 0) {
          errors.push(...sourceTargetErrors);
          continue;
        }
      }
      return Object.freeze({
        kind: "sdlc_design_depth_register_admission" as const,
        status: "admitted" as const,
        targetAssetType: input.targetAssetType,
        register,
        blockingReasons: Object.freeze([]),
        evidenceRefs: currentEvidenceRefs
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return Object.freeze({
    kind: "sdlc_design_depth_register_admission" as const,
    status: "rejected" as const,
    targetAssetType: input.targetAssetType,
    register: null,
    blockingReasons: Object.freeze(
      errors.length === 0
        ? ["design_depth_register_missing"]
        : [`design_depth_register_invalid:${errors.join("; ")}`]
    ),
    evidenceRefs: Object.freeze([...evidenceRefs, ...candidateEvidenceRefs])
  });
}
