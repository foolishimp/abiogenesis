// Implements: T-113

import { existsSync, readFileSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  parseClosedRecord,
  parseOptionalArray as parseArray,
  parseNonEmptyString,
  parseNullableNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import {
  admitExactContractEnum,
  admitExactProtocolString,
  admitExactProtocolVersion
} from "../shared/fd_admission.js";
import type {
  SdlcComponentDepthRegister,
  SdlcComponentDepthRegisterAdmission,
  SdlcComponentExecutionFailureRegister,
  SdlcComponentExecutionFailureRow,
  SdlcComponentRepairSchedule,
  SdlcComponentRepairScheduleRow,
  SdlcComponentRealizationRow,
  SdlcComponentTestQualificationRow,
  SdlcComponentTestRealizationRow,
  SdlcComponentTopologyRow,
  SdlcReleaseDepthParityAssessment,
  SdlcTestComponentTopologyRow
} from "./carriers.js";
import {
  SDLC_COMPONENT_CONCERN_ROLES
  , SDLC_COMPONENT_ATTRIBUTION_CONFIDENCE,
  SDLC_COMPONENT_EXECUTION_FAILURE_KINDS,
  SDLC_COMPONENT_REPAIR_SCHEDULE_STATUSES,
  SDLC_COMPONENT_REPAIR_TARGETS
} from "./carriers.js";
import {
  sdlcTargetCarrierContractRef,
  sdlcTargetCarrierOutputKind
} from "../graph/target_carrier_contracts.js";

const COMPONENT_DEPTH_TARGETS = Object.freeze([
  "component_code_surface",
  "component_realization_qualification_surface",
  "component_test_surface",
  "uat_test_source_surface",
  "component_test_qualification_surface",
  "component_repair_schedule_surface",
  "release_depth_parity_surface"
] as const);

type ComponentDepthTarget = (typeof COMPONENT_DEPTH_TARGETS)[number];

const INVALID_COMPONENT_DEPTH_CANDIDATE_KIND =
  "invalid_component_depth_candidate" as const;

interface InvalidComponentDepthCandidate {
  readonly kind: typeof INVALID_COMPONENT_DEPTH_CANDIDATE_KIND;
  readonly reason: string;
}

export const SDLC_COMPONENT_DEPTH_REGISTER_CONTRACT_TRACE = Object.freeze({
  kind: "sdlc_component_depth_register_contract_trace",
  owner: "downstream_product_read_model",
  registerVersion: "ts-component-depth-v1",
  targetAssetTypes: COMPONENT_DEPTH_TARGETS,
  gtlRequirementRefs: Object.freeze([
    "REQ-L-GTL3-CONTRACT-LAW-API",
    "REQ-L-GTL3-GRAPHVECTOR"
  ]),
  gtlTargetCarrierFamilyRef: "gtl://target-carrier-family/odd-sdlc/sdlc-output",
  gtlTargetCarrierEnvelopeRef: "gtl://target-carrier-envelope/odd-sdlc/sdlc-output-v1",
  abgAdmissionSurfaceRef: "admitComponentDepthRegisterFromArtifact"
} as const);

function isComponentDepthTarget(
  targetAssetType: string
): targetAssetType is ComponentDepthTarget {
  return COMPONENT_DEPTH_TARGETS.some((target) => target === targetAssetType);
}

function componentDepthTargetCarrierEnvelope(input: {
  readonly record: Readonly<Record<string, unknown>>;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly label: string;
}): void {
  const targetAssetType = parseNonEmptyString(
    input.record["targetAssetType"],
    `${input.label}.targetAssetType`
  );
  if (!isComponentDepthTarget(targetAssetType)) {
    throw new TypeError(`${input.label}.targetAssetType: unsupported component-depth target`);
  }
  const payloadTargetAssetType = parseNonEmptyString(
    input.payload["targetAssetType"],
    `${input.label}.payload.targetAssetType`
  );
  if (payloadTargetAssetType !== targetAssetType) {
    throw new TypeError(
      `${input.label}.targetAssetType: envelope target ${targetAssetType} does not match payload target ${payloadTargetAssetType}`
    );
  }
  const edgeRef = parseNonEmptyString(input.record["edgeRef"], `${input.label}.edgeRef`);
  admitExactProtocolString({
    value: input.record["kind"],
    label: `${input.label}.kind`,
    expected: sdlcTargetCarrierOutputKind(targetAssetType)
  });
  admitExactProtocolString({
    value: input.record["contractRef"],
    label: `${input.label}.contractRef`,
    expected: sdlcTargetCarrierContractRef({ edgeRef, targetAssetType })
  });
  const contractDigest = parseNonEmptyString(
    input.record["contractDigest"],
    `${input.label}.contractDigest`
  );
  if (!contractDigest.startsWith("sha256:")) {
    throw new TypeError(`${input.label}.contractDigest: expected sha256 digest`);
  }
}

function invalidComponentDepthCandidate(reason: string): InvalidComponentDepthCandidate {
  return Object.freeze({
    kind: INVALID_COMPONENT_DEPTH_CANDIDATE_KIND,
    reason
  });
}

function isInvalidComponentDepthCandidate(
  input: unknown
): input is InvalidComponentDepthCandidate {
  const record = recordValue(input);
  return (
    record?.["kind"] === INVALID_COMPONENT_DEPTH_CANDIDATE_KIND &&
    typeof record["reason"] === "string"
  );
}

export function parseComponentTopologyRow(
  input: unknown,
  label: string
): SdlcComponentTopologyRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "componentId",
    "moduleName",
    "relativePath",
    "publicBoundary",
    "concernRole",
    "requirementIds",
    "sourceAssetRefs"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_component_topology_row"
  });
  return Object.freeze({
    kind: "sdlc_component_topology_row" as const,
    componentId: parseNonEmptyString(record["componentId"], `${label}.componentId`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    relativePath: parseNonEmptyString(record["relativePath"], `${label}.relativePath`),
    publicBoundary: parseNonEmptyString(record["publicBoundary"], `${label}.publicBoundary`),
    concernRole: admitExactContractEnum({
      value: record["concernRole"],
      label: `${label}.concernRole`,
      values: SDLC_COMPONENT_CONCERN_ROLES
    }),
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    sourceAssetRefs: parseStringList(record["sourceAssetRefs"], `${label}.sourceAssetRefs`)
  });
}

function parseNullableTrancheId(input: unknown, label: string): string | null {
  if (input === null) {
    return null;
  }
  if (typeof input === "number" && Number.isSafeInteger(input) && input >= 0) {
    return String(input);
  }
  return parseNonEmptyString(input, label);
}

export function parseComponentRealizationRow(
  input: unknown,
  label: string
): SdlcComponentRealizationRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "componentId",
    "moduleName",
    "relativePath",
    "publicBoundary",
    "trancheId",
    "firstProductFileToChange",
    "upstreamComponentIds",
    "requirementIds",
    "sourceAssetRefs"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_component_realization_row"
  });
  const relativePath = parseNonEmptyString(record["relativePath"], `${label}.relativePath`);
  const firstProductFileToChange =
    record["firstProductFileToChange"] === undefined
      ? null
      : parseNullableNonEmptyString(
          record["firstProductFileToChange"],
          `${label}.firstProductFileToChange`
        );
  const publicBoundary =
    record["publicBoundary"] === undefined
      ? firstProductFileToChange ?? relativePath
      : parseNonEmptyString(record["publicBoundary"], `${label}.publicBoundary`);
  return Object.freeze({
    kind: "sdlc_component_realization_row" as const,
    componentId: parseNonEmptyString(record["componentId"], `${label}.componentId`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    relativePath,
    publicBoundary,
    trancheId:
      record["trancheId"] === undefined
        ? null
        : parseNullableTrancheId(record["trancheId"], `${label}.trancheId`),
    firstProductFileToChange,
    upstreamComponentIds:
      record["upstreamComponentIds"] === undefined
        ? Object.freeze([])
        : parseStringList(record["upstreamComponentIds"], `${label}.upstreamComponentIds`),
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    sourceAssetRefs: parseStringList(record["sourceAssetRefs"], `${label}.sourceAssetRefs`)
  });
}

export function parseTestComponentTopologyRow(
  input: unknown,
  label: string
): SdlcTestComponentTopologyRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "testClassId",
    "relativePath",
    "testcaseIds",
    "componentIds",
    "requirementIds",
    "shardId"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_test_component_topology_row"
  });
  return Object.freeze({
    kind: "sdlc_test_component_topology_row" as const,
    testClassId: parseNonEmptyString(record["testClassId"], `${label}.testClassId`),
    relativePath: parseNonEmptyString(record["relativePath"], `${label}.relativePath`),
    testcaseIds: parseStringList(record["testcaseIds"], `${label}.testcaseIds`),
    componentIds: parseStringList(record["componentIds"], `${label}.componentIds`),
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    shardId: parseNullableNonEmptyString(record["shardId"], `${label}.shardId`)
  });
}

function parseComponentTestRealizationRow(
  input: unknown,
  label: string
): SdlcComponentTestRealizationRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "testClassId",
    "relativePath",
    "testcaseIds",
    "componentIds",
    "requirementIds",
    "shardId"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_component_test_realization_row"
  });
  return Object.freeze({
    kind: "sdlc_component_test_realization_row" as const,
    testClassId: parseNonEmptyString(record["testClassId"], `${label}.testClassId`),
    relativePath: parseNonEmptyString(record["relativePath"], `${label}.relativePath`),
    testcaseIds: parseStringList(record["testcaseIds"], `${label}.testcaseIds`),
    componentIds: parseStringList(record["componentIds"], `${label}.componentIds`),
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    shardId: parseNullableNonEmptyString(record["shardId"], `${label}.shardId`)
  });
}

function parseComponentTestQualificationRow(
  input: unknown,
  label: string
): SdlcComponentTestQualificationRow {
  const record = parseClosedRecord(
    input,
    label,
    [
    "kind",
    "testClassId",
    "testcaseIds",
    "componentIds",
    "requirementIds",
    "status",
    "evidenceRefs"
    ]
  );
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_component_test_qualification_row"
  });
  return Object.freeze({
    kind: "sdlc_component_test_qualification_row" as const,
    testClassId: parseNonEmptyString(record["testClassId"], `${label}.testClassId`),
    testcaseIds: parseStringList(record["testcaseIds"], `${label}.testcaseIds`),
    componentIds: parseStringList(record["componentIds"], `${label}.componentIds`),
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    status: admitExactContractEnum({
      value: record["status"],
      label: `${label}.status`,
      values: [
        "passed",
        "failed",
        "blocked",
        "pending",
        "unproven"
      ] as const
    }),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseComponentExecutionFailureRow(
  input: unknown,
  label: string
): SdlcComponentExecutionFailureRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "failureId",
    "shardId",
    "moduleName",
    "testClassId",
    "testcaseIds",
    "componentIds",
    "requirementIds",
    "failureKind",
    "repairTarget",
    "lawfulReentryPoint",
    "attributionConfidence",
    "sourceRefs",
    "testRefs",
    "evidenceRefs"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_component_execution_failure_row"
  });
  return Object.freeze({
    kind: "sdlc_component_execution_failure_row" as const,
    failureId: parseNonEmptyString(record["failureId"], `${label}.failureId`),
    shardId: parseNonEmptyString(record["shardId"], `${label}.shardId`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    testClassId: parseNonEmptyString(record["testClassId"], `${label}.testClassId`),
    testcaseIds: parseStringList(record["testcaseIds"], `${label}.testcaseIds`),
    componentIds: parseStringList(record["componentIds"], `${label}.componentIds`),
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    failureKind: admitExactContractEnum({
      value: record["failureKind"],
      label: `${label}.failureKind`,
      values: SDLC_COMPONENT_EXECUTION_FAILURE_KINDS
    }),
    repairTarget: admitExactContractEnum({
      value: record["repairTarget"],
      label: `${label}.repairTarget`,
      values: SDLC_COMPONENT_REPAIR_TARGETS
    }),
    lawfulReentryPoint: parseNonEmptyString(
      record["lawfulReentryPoint"],
      `${label}.lawfulReentryPoint`
    ),
    attributionConfidence: admitExactContractEnum({
      value: record["attributionConfidence"],
      label: `${label}.attributionConfidence`,
      values: SDLC_COMPONENT_ATTRIBUTION_CONFIDENCE
    }),
    sourceRefs: parseStringList(record["sourceRefs"], `${label}.sourceRefs`),
    testRefs: parseStringList(record["testRefs"], `${label}.testRefs`),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseComponentExecutionFailureRegister(
  input: unknown,
  label: string
): SdlcComponentExecutionFailureRegister | null {
  if (input === null || input === undefined) {
    return null;
  }
  const record = parseClosedRecord(input, label, [
    "kind",
    "registerVersion",
    "failureRows"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "component_execution_failure_register"
  });
  admitExactProtocolVersion({
    value: record["registerVersion"],
    label: `${label}.registerVersion`,
    expected: "ts-component-depth-v1"
  });
  return Object.freeze({
    kind: "component_execution_failure_register" as const,
    registerVersion: "ts-component-depth-v1" as const,
    failureRows: parseArray(
      record["failureRows"],
      `${label}.failureRows`,
      parseComponentExecutionFailureRow
    )
  });
}

function parseComponentRepairScheduleRow(
  input: unknown,
  label: string
): SdlcComponentRepairScheduleRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "scheduleId",
    "failureId",
    "repairTarget",
    "lawfulReentryPoint",
    "attributionConfidence",
    "testcaseIds",
    "componentIds",
    "requirementIds",
    "sourceRefs",
    "testRefs",
    "evidenceRefs"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_component_repair_schedule_row"
  });
  return Object.freeze({
    kind: "sdlc_component_repair_schedule_row" as const,
    scheduleId: parseNonEmptyString(record["scheduleId"], `${label}.scheduleId`),
    failureId: parseNonEmptyString(record["failureId"], `${label}.failureId`),
    repairTarget: admitExactContractEnum({
      value: record["repairTarget"],
      label: `${label}.repairTarget`,
      values: SDLC_COMPONENT_REPAIR_TARGETS
    }),
    lawfulReentryPoint: parseNonEmptyString(
      record["lawfulReentryPoint"],
      `${label}.lawfulReentryPoint`
    ),
    attributionConfidence: admitExactContractEnum({
      value: record["attributionConfidence"],
      label: `${label}.attributionConfidence`,
      values: SDLC_COMPONENT_ATTRIBUTION_CONFIDENCE
    }),
    testcaseIds: parseStringList(record["testcaseIds"], `${label}.testcaseIds`),
    componentIds: parseStringList(record["componentIds"], `${label}.componentIds`),
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    sourceRefs: parseStringList(record["sourceRefs"], `${label}.sourceRefs`),
    testRefs: parseStringList(record["testRefs"], `${label}.testRefs`),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseComponentRepairSchedule(
  input: unknown,
  label: string
): SdlcComponentRepairSchedule | null {
  if (input === null || input === undefined) {
    return null;
  }
  const record = parseClosedRecord(input, label, [
    "kind",
    "registerVersion",
    "scheduleStatus",
    "repairRows",
    "evidenceRefs"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_component_repair_schedule"
  });
  admitExactProtocolVersion({
    value: record["registerVersion"],
    label: `${label}.registerVersion`,
    expected: "ts-component-depth-v1"
  });
  return Object.freeze({
    kind: "sdlc_component_repair_schedule" as const,
    registerVersion: "ts-component-depth-v1" as const,
    scheduleStatus: admitExactContractEnum({
      value: record["scheduleStatus"],
      label: `${label}.scheduleStatus`,
      values: SDLC_COMPONENT_REPAIR_SCHEDULE_STATUSES
    }),
    repairRows: parseArray(
      record["repairRows"],
      `${label}.repairRows`,
      parseComponentRepairScheduleRow
    ),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseReleaseDepthParity(
  input: unknown,
  label: string
): SdlcReleaseDepthParityAssessment | null {
  if (input === null || input === undefined) {
    return null;
  }
  const record = parseClosedRecord(input, label, [
    "kind",
    "status",
    "summary",
    "blockingReasons",
    "evidenceRefs"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_release_depth_parity_assessment"
  });
  return Object.freeze({
    kind: "sdlc_release_depth_parity_assessment" as const,
    status: admitExactContractEnum({
      value: record["status"],
      label: `${label}.status`,
      values: ["met", "blocked", "repriced"] as const
    }),
    summary: parseNonEmptyString(record["summary"], `${label}.summary`),
    blockingReasons: parseStringList(record["blockingReasons"], `${label}.blockingReasons`),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseRegister(input: unknown, label: string): SdlcComponentDepthRegister {
  const record = parseClosedRecord(input, label, [
    "kind",
    "registerVersion",
    "targetAssetType",
    "componentTopologyRows",
    "componentRealizationRows",
    "testComponentTopologyRows",
    "componentTestRows",
    "componentTestQualificationRows",
    "componentExecutionFailureRegister",
    "componentRepairSchedule",
    "releaseDepthParity"
  ]);
  admitExactProtocolString({
    value: record["kind"],
    label: `${label}.kind`,
    expected: "sdlc_component_depth_register"
  });
  const targetAssetType = parseNonEmptyString(record["targetAssetType"], `${label}.targetAssetType`);
  const registerVersion = parseNonEmptyString(record["registerVersion"], `${label}.registerVersion`);
  admitExactProtocolVersion({
    value: registerVersion,
    label: `${label}.registerVersion`,
    expected: "ts-component-depth-v1"
  });
  const repairSchedule =
    targetAssetType === "component_repair_schedule_surface" ||
    targetAssetType === "release_depth_parity_surface"
      ? parseComponentRepairSchedule(
          record["componentRepairSchedule"],
          `${label}.componentRepairSchedule`
        )
      : null;
  return Object.freeze({
    kind: "sdlc_component_depth_register" as const,
    registerVersion: "ts-component-depth-v1" as const,
    targetAssetType,
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
    testComponentTopologyRows: parseArray(
      record["testComponentTopologyRows"],
      `${label}.testComponentTopologyRows`,
      parseTestComponentTopologyRow
    ),
    componentTestRows: parseArray(
      record["componentTestRows"],
      `${label}.componentTestRows`,
      parseComponentTestRealizationRow
    ),
    componentTestQualificationRows: parseArray(
      record["componentTestQualificationRows"],
      `${label}.componentTestQualificationRows`,
      parseComponentTestQualificationRow
    ),
    componentExecutionFailureRegister: parseComponentExecutionFailureRegister(
      record["componentExecutionFailureRegister"],
      `${label}.componentExecutionFailureRegister`
    ),
    componentRepairSchedule: repairSchedule,
    releaseDepthParity: parseReleaseDepthParity(
      record["releaseDepthParity"],
      `${label}.releaseDepthParity`
    )
  });
}

// F_D component-depth admission is exact; semantic aliases belong to selected evaluate.C/F_P content registers.

function recordValue(input: unknown): Readonly<Record<string, unknown>> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return Object.freeze(Object.fromEntries(Object.entries(input)));
}

function parsedComponentDepthCandidates(input: unknown, label: string): readonly unknown[] {
  const candidates: unknown[] = [input];
  const record = recordValue(input);
  if (record !== null) {
    const payloadCandidate = recordValue(record["payload"]);
    if (payloadCandidate?.["kind"] === "sdlc_component_depth_register") {
      const payload = payloadCandidate;
      try {
        componentDepthTargetCarrierEnvelope({ record, payload, label });
        return Object.freeze([payload]);
      } catch (error) {
        return Object.freeze([
          invalidComponentDepthCandidate(
            error instanceof Error ? error.message : String(error)
          )
        ]);
      }
    }
  }
  return Object.freeze(candidates);
}

function parseJsonCandidates(input: string, label: string): readonly unknown[] {
  try {
    return parsedComponentDepthCandidates(JSON.parse(input), label);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Object.freeze([]);
    }
    throw error;
  }
}

function firstJsonObjectText(input: string): string | null {
  const start = input.search(/\S/u);
  if (start < 0 || input[start] !== "{") {
    return null;
  }
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < input.length; index += 1) {
    const char = input[index];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }
    if (char === "\"") {
      inString = true;
      continue;
    }
    if (char === "{") {
      depth += 1;
      continue;
    }
    if (char !== "}") {
      continue;
    }
    depth -= 1;
    if (depth === 0) {
      return input.slice(start, index + 1);
    }
  }
  return null;
}

function targetCarrierSectionText(content: string): string | null {
  const heading = /^## Target Carrier\s*$/mu.exec(content);
  if (heading === null || heading.index === undefined) {
    return null;
  }
  const start = heading.index + heading[0].length;
  const rest = content.slice(start);
  const nextHeading = /^## /mu.exec(rest);
  return nextHeading === null || nextHeading.index === undefined
    ? rest
    : rest.slice(0, nextHeading.index);
}

function targetCarrierSectionCandidates(content: string): readonly unknown[] {
  const section = targetCarrierSectionText(content);
  if (section === null) {
    return Object.freeze([]);
  }
  const jsonText = firstJsonObjectText(section);
  if (jsonText === null) {
    return Object.freeze([]);
  }
  return parseJsonCandidates(jsonText, "component_depth_register.target_carrier");
}

function embeddedJsonObjectCandidates(content: string): readonly unknown[] {
  let offset = 0;
  let inCodeBlock = false;
  for (const line of content.split("\n")) {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      offset += line.length + 1;
      continue;
    }
    if (!inCodeBlock && trimmed.startsWith("{")) {
      const objectStart = offset + line.length - trimmed.length;
      const jsonText = firstJsonObjectText(content.slice(objectStart));
      return jsonText === null
        ? Object.freeze([])
        : parseJsonCandidates(
            jsonText,
            "component_depth_register.embedded_target_carrier"
          );
    }
    offset += line.length + 1;
  }
  return Object.freeze([]);
}

function jsonCandidates(content: string): readonly unknown[] {
  const wholeFileCandidates = parseJsonCandidates(content, "component_depth_register");
  if (wholeFileCandidates.length > 0) {
    return wholeFileCandidates;
  }
  const sectionCandidates = targetCarrierSectionCandidates(content);
  return sectionCandidates.length > 0
    ? sectionCandidates
    : embeddedJsonObjectCandidates(content);
}

function requiredRowsPresent(input: {
  readonly targetAssetType: ComponentDepthTarget;
  readonly register: SdlcComponentDepthRegister;
}): readonly string[] {
  switch (input.targetAssetType) {
    case "component_code_surface":
    case "component_realization_qualification_surface":
      return input.register.componentRealizationRows.length > 0
        ? Object.freeze([])
        : Object.freeze(["component_depth_register_component_realization_rows_missing"]);
    case "component_test_surface":
    case "uat_test_source_surface":
      return input.register.componentTestRows.length > 0
        ? Object.freeze([])
        : Object.freeze(["component_depth_register_component_test_rows_missing"]);
    case "component_test_qualification_surface":
      return input.register.componentTestQualificationRows.length > 0 ||
        (input.register.componentExecutionFailureRegister?.failureRows.length ?? 0) > 0
        ? Object.freeze([])
        : Object.freeze(["component_depth_register_component_test_qualification_rows_missing"]);
    case "component_repair_schedule_surface":
      return input.register.componentRepairSchedule !== null
        ? Object.freeze([])
        : Object.freeze(["component_depth_register_component_repair_schedule_missing"]);
    case "release_depth_parity_surface":
      return input.register.releaseDepthParity !== null
        ? Object.freeze([])
        : Object.freeze(["component_depth_register_release_depth_parity_missing"]);
    default: {
      const exhaustive: never = input.targetAssetType;
      throw new TypeError(`Unsupported component-depth target ${exhaustive}`);
    }
  }
}

function uatTestcaseLaneReasons(
  register: SdlcComponentDepthRegister
): readonly string[] {
  const reasons: string[] = [];
  for (const row of register.componentTestRows) {
    for (const testcaseId of row.testcaseIds) {
      const normalized = testcaseId.trim().toLowerCase();
      if (
        /^tc:\/\/[^/]+\/(?!uat(?:\/|$))/u.test(normalized) ||
        /^test-case:\/\/[^/]+\/(?!uat(?:\/|$))/u.test(normalized)
      ) {
        reasons.push(`component_depth_register_uat_test_source_non_uat_testcase:${testcaseId}`);
      }
    }
  }
  return Object.freeze(reasons);
}

function rawArrayLength(input: Readonly<Record<string, unknown>>, field: string): number {
  const value = input[field];
  return Array.isArray(value) ? value.length : 0;
}

function targetStageOccupancyReasons(input: {
  readonly targetAssetType: ComponentDepthTarget;
  readonly candidate: unknown;
}): readonly string[] {
  const record = recordValue(input.candidate);
  if (record === null) {
    return Object.freeze([]);
  }
  switch (input.targetAssetType) {
    case "component_code_surface":
      return Object.freeze([
        ...(rawArrayLength(record, "testComponentTopologyRows") > 0
          ? ["component_depth_register_component_code_test_topology_rows_wrong_stage"]
          : []),
        ...(rawArrayLength(record, "componentTestRows") > 0
          ? ["component_depth_register_component_code_test_rows_wrong_stage"]
          : []),
        ...(rawArrayLength(record, "componentTestQualificationRows") > 0
          ? ["component_depth_register_component_code_test_qualification_rows_wrong_stage"]
          : [])
      ]);
    case "component_realization_qualification_surface":
    case "component_test_surface":
    case "uat_test_source_surface":
    case "component_test_qualification_surface":
    case "component_repair_schedule_surface":
    case "release_depth_parity_surface":
      return Object.freeze([]);
    default: {
      const exhaustive: never = input.targetAssetType;
      throw new TypeError(`Unsupported component-depth target ${exhaustive}`);
    }
  }
}

export function admitComponentDepthRegisterFromArtifact(input: {
  readonly targetAssetType: string;
  readonly outputFile: string;
}): SdlcComponentDepthRegisterAdmission {
  const evidenceRefs = Object.freeze([pathToFileURL(input.outputFile).href]);
  if (!isComponentDepthTarget(input.targetAssetType)) {
    return Object.freeze({
      kind: "sdlc_component_depth_register_admission" as const,
      status: "not_required" as const,
      targetAssetType: input.targetAssetType,
      register: null,
      blockingReasons: Object.freeze([]),
      evidenceRefs
    });
  }
  if (!existsSync(input.outputFile) || !statSync(input.outputFile).isFile()) {
    return Object.freeze({
      kind: "sdlc_component_depth_register_admission" as const,
      status: "rejected" as const,
      targetAssetType: input.targetAssetType,
      register: null,
      blockingReasons: Object.freeze(["component_depth_output_missing"]),
      evidenceRefs
    });
  }
  const content = readFileSync(input.outputFile, "utf8");
  const errors: string[] = [];
  for (const candidate of jsonCandidates(content)) {
    if (isInvalidComponentDepthCandidate(candidate)) {
      errors.push(candidate.reason);
      continue;
    }
    try {
      const targetStageReasons = targetStageOccupancyReasons({
        targetAssetType: input.targetAssetType,
        candidate
      });
      if (targetStageReasons.length > 0) {
        return Object.freeze({
          kind: "sdlc_component_depth_register_admission" as const,
          status: "rejected" as const,
          targetAssetType: input.targetAssetType,
          register: null,
          blockingReasons: targetStageReasons,
          evidenceRefs
        });
      }
      const register = parseRegister(candidate, "component_depth_register");
      if (register.targetAssetType !== input.targetAssetType) {
        errors.push(
          `component_depth_register_target_mismatch:${register.targetAssetType}`
        );
        continue;
      }
      const rowReasons = requiredRowsPresent({
        targetAssetType: input.targetAssetType,
        register
      });
      if (rowReasons.length > 0) {
        return Object.freeze({
          kind: "sdlc_component_depth_register_admission" as const,
          status: "rejected" as const,
          targetAssetType: input.targetAssetType,
          register,
          blockingReasons: rowReasons,
          evidenceRefs
        });
      }
      const targetCarrierReasons =
        input.targetAssetType === "uat_test_source_surface"
          ? uatTestcaseLaneReasons(register)
          : Object.freeze([]);
      if (targetCarrierReasons.length > 0) {
        return Object.freeze({
          kind: "sdlc_component_depth_register_admission" as const,
          status: "rejected" as const,
          targetAssetType: input.targetAssetType,
          register,
          blockingReasons: targetCarrierReasons,
          evidenceRefs
        });
      }
      return Object.freeze({
        kind: "sdlc_component_depth_register_admission" as const,
        status: "admitted" as const,
        targetAssetType: input.targetAssetType,
        register,
        blockingReasons: Object.freeze([]),
        evidenceRefs
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : String(error));
    }
  }
  return Object.freeze({
    kind: "sdlc_component_depth_register_admission" as const,
    status: "rejected" as const,
    targetAssetType: input.targetAssetType,
    register: null,
    blockingReasons: Object.freeze(
      errors.length === 0
        ? ["component_depth_register_missing"]
        : [`component_depth_register_invalid:${errors.join("; ")}`]
    ),
    evidenceRefs
  });
}

function uniqueSortedStrings(input: readonly string[]): readonly string[] {
  return Object.freeze(Array.from(new Set(input)).sort());
}

function componentDepthPressureRef(input: {
  readonly runRef: string;
  readonly reason: string;
}): string {
  return `pressure://odd-sdlc/component-depth/${input.runRef}/${encodeURIComponent(input.reason)}`;
}

export function componentDepthResidualPressureRefs(input: {
  readonly runRef: string;
  readonly admission: SdlcComponentDepthRegisterAdmission;
}): readonly string[] {
  if (input.admission.status === "not_required") {
    return Object.freeze([]);
  }
  if (
    input.admission.status !== "admitted" ||
    input.admission.register === null
  ) {
    const reasons =
      input.admission.blockingReasons.length === 0
        ? [`component_depth_admission_${input.admission.status}`]
        : input.admission.blockingReasons;
    return uniqueSortedStrings(
      reasons.map((reason) =>
        componentDepthPressureRef({
          runRef: input.runRef,
          reason
        })
      )
    );
  }

  const register = input.admission.register;
  const refs: string[] = [];
  if (input.admission.targetAssetType === "component_repair_schedule_surface") {
    const schedule = register.componentRepairSchedule;
    if (schedule === null) {
      refs.push("component_repair_schedule_missing");
    } else {
      if (schedule.scheduleStatus === "repair_required") {
        refs.push("component_repair_schedule_repair_required");
      }
      if (schedule.scheduleStatus === "triage_gap") {
        refs.push("component_repair_schedule_triage_gap");
      }
      for (const row of schedule.repairRows) {
        refs.push(`component_repair_schedule_row:${row.failureId}`);
      }
    }
  }
  if (input.admission.targetAssetType === "release_depth_parity_surface") {
    const parity = register.releaseDepthParity;
    if (parity === null) {
      refs.push("release_depth_parity_missing");
    } else if (parity.status === "blocked") {
      if (parity.blockingReasons.length === 0) {
        refs.push("release_depth_parity_blocked");
      } else {
        refs.push(
          ...parity.blockingReasons.map(
            (reason) => `release_depth_parity_blocked:${reason}`
          )
        );
      }
    } else if (parity.status === "repriced") {
      refs.push("release_depth_parity_repriced");
    }
  }
  return uniqueSortedStrings(
    refs.map((reason) =>
      componentDepthPressureRef({
        runRef: input.runRef,
        reason
      })
    )
  );
}
