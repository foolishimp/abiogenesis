// Implements: T-171

import { existsSync, readFileSync, statSync } from "node:fs";
import { pathToFileURL } from "node:url";
import {
  parseClosedRecord,
  parseEnumValue,
  parseOptionalArray as parseArray,
  parseNonEmptyString,
  parseNullableNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import type {
  SdlcTestExecutionPreparationRow,
  SdlcTestExecutionSurfaceRegister,
  SdlcTestExecutionSurfaceRegisterAdmission
} from "./carriers.js";

const TEST_EXECUTION_SURFACE_TARGETS = Object.freeze([
  "test_execution_surface"
] as const);

type TestExecutionSurfaceTarget = (typeof TEST_EXECUTION_SURFACE_TARGETS)[number];

function isTestExecutionSurfaceTarget(
  targetAssetType: string
): targetAssetType is TestExecutionSurfaceTarget {
  return TEST_EXECUTION_SURFACE_TARGETS.some((target) => target === targetAssetType);
}

function parsePreparationRow(
  input: unknown,
  label: string
): SdlcTestExecutionPreparationRow {
  const record = parseClosedRecord(input, label, [
    "kind",
    "scheduleRef",
    "moduleName",
    "testClassId",
    "testcaseIds",
    "command",
    "workingDirectory",
    "frameworkRef",
    "shardId",
    "sourceTestFileRefs",
    "requirementIds",
    "status",
    "evidenceRefs"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_test_execution_preparation_row") {
    throw new TypeError(`${label}.kind: expected sdlc_test_execution_preparation_row`);
  }
  return Object.freeze({
    kind,
    scheduleRef: parseNonEmptyString(record["scheduleRef"], `${label}.scheduleRef`),
    moduleName: parseNonEmptyString(record["moduleName"], `${label}.moduleName`),
    testClassId: parseNonEmptyString(record["testClassId"], `${label}.testClassId`),
    testcaseIds: parseStringList(record["testcaseIds"], `${label}.testcaseIds`),
    command: parseNonEmptyString(record["command"], `${label}.command`),
    workingDirectory: parseNonEmptyString(
      record["workingDirectory"],
      `${label}.workingDirectory`
    ),
    frameworkRef: parseNonEmptyString(record["frameworkRef"], `${label}.frameworkRef`),
    shardId: parseNullableNonEmptyString(record["shardId"], `${label}.shardId`),
    sourceTestFileRefs: parseStringList(
      record["sourceTestFileRefs"],
      `${label}.sourceTestFileRefs`
    ),
    requirementIds: parseStringList(record["requirementIds"], `${label}.requirementIds`),
    status: parseEnumValue(record["status"], `${label}.status`, [
      "prepared",
      "blocked",
      "pending"
    ]),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`)
  });
}

function parseRegister(
  input: unknown,
  label: string
): SdlcTestExecutionSurfaceRegister {
  const record = parseClosedRecord(input, label, [
    "kind",
    "registerVersion",
    "targetAssetType",
    "testExecutionPreparationRows",
    "evidenceRefs",
    "summary"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_test_execution_surface_register") {
    throw new TypeError(`${label}.kind: expected sdlc_test_execution_surface_register`);
  }
  const registerVersion = parseNonEmptyString(
    record["registerVersion"],
    `${label}.registerVersion`
  );
  if (registerVersion !== "ts-test-execution-v1") {
    throw new TypeError(`${label}.registerVersion: expected ts-test-execution-v1`);
  }
  const targetAssetType = parseNonEmptyString(
    record["targetAssetType"],
    `${label}.targetAssetType`
  );
  if (targetAssetType !== "test_execution_surface") {
    throw new TypeError(`${label}.targetAssetType: expected test_execution_surface`);
  }
  return Object.freeze({
    kind,
    registerVersion,
    targetAssetType,
    testExecutionPreparationRows: parseArray(
      record["testExecutionPreparationRows"],
      `${label}.testExecutionPreparationRows`,
      parsePreparationRow
    ),
    evidenceRefs: parseStringList(record["evidenceRefs"], `${label}.evidenceRefs`),
    summary:
      record["summary"] === undefined
        ? null
        : parseNullableNonEmptyString(record["summary"], `${label}.summary`)
  });
}

function pushParsedJsonCandidate(
  candidates: unknown[],
  content: string
): void {
  try {
    candidates.push(JSON.parse(content));
  } catch {
    // Not every markdown fence is JSON. The admission error below reports
    // whether no parseable register candidate was present.
  }
}

function jsonCandidates(content: string): readonly unknown[] {
  const candidates: unknown[] = [];
  pushParsedJsonCandidate(candidates, content);
  const fencePattern = /```[^\n]*\n([\s\S]*?)```/gu;
  for (const match of content.matchAll(fencePattern)) {
    const block = match[1];
    if (block !== undefined) {
      pushParsedJsonCandidate(candidates, block.trim());
    }
  }
  return Object.freeze(candidates);
}

function requiredRowsPresent(
  register: SdlcTestExecutionSurfaceRegister
): readonly string[] {
  return Object.freeze([
    ...(register.testExecutionPreparationRows.length > 0
      ? []
      : ["test_execution_surface_register_preparation_rows_missing"])
  ]);
}

export function admitTestExecutionSurfaceRegisterFromArtifact(input: {
  readonly targetAssetType: string;
  readonly outputFile: string;
}): SdlcTestExecutionSurfaceRegisterAdmission {
  const evidenceRefs = Object.freeze([pathToFileURL(input.outputFile).href]);
  if (!isTestExecutionSurfaceTarget(input.targetAssetType)) {
    return Object.freeze({
      kind: "sdlc_test_execution_surface_register_admission" as const,
      status: "not_required" as const,
      targetAssetType: input.targetAssetType,
      register: null,
      blockingReasons: Object.freeze([]),
      evidenceRefs
    });
  }
  if (!existsSync(input.outputFile) || !statSync(input.outputFile).isFile()) {
    return Object.freeze({
      kind: "sdlc_test_execution_surface_register_admission" as const,
      status: "rejected" as const,
      targetAssetType: input.targetAssetType,
      register: null,
      blockingReasons: Object.freeze(["test_execution_surface_output_missing"]),
      evidenceRefs
    });
  }
  const content = readFileSync(input.outputFile, "utf8");
  const errors: string[] = [];
  for (const candidate of jsonCandidates(content)) {
    try {
      const register = parseRegister(candidate, "test_execution_surface_register");
      const rowReasons = requiredRowsPresent(register);
      if (rowReasons.length > 0) {
        return Object.freeze({
          kind: "sdlc_test_execution_surface_register_admission" as const,
          status: "rejected" as const,
          targetAssetType: input.targetAssetType,
          register,
          blockingReasons: rowReasons,
          evidenceRefs
        });
      }
      return Object.freeze({
        kind: "sdlc_test_execution_surface_register_admission" as const,
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
    kind: "sdlc_test_execution_surface_register_admission" as const,
    status: "rejected" as const,
    targetAssetType: input.targetAssetType,
    register: null,
    blockingReasons: Object.freeze(
      errors.length === 0
        ? ["test_execution_surface_register_missing"]
        : [`test_execution_surface_register_invalid:${errors.join("; ")}`]
    ),
    evidenceRefs
  });
}
