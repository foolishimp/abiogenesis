import {
  parseArray,
  parseBoolean,
  parseClosedRecord,
  parseEnumValue,
  parseNonEmptyString,
  parseNullableNonEmptyString,
  parseStringList
} from "../shared/validation.js";
import type {
  SdlcComputeSubworkstreamManifest,
  SdlcComputeSubworkstreamMergeResult,
  SdlcComputeSubworkstreamRow,
  SdlcComputeSubworkstreamStageRef,
  SdlcWorkerHandoffManifest
} from "./carriers.js";

export const SDLC_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE =
  "compute_subworkstream_manifest.json" as const;

export const SDLC_EVALUATE_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE =
  "evaluate_compute_subworkstream_manifest.json" as const;

export const SDLC_COMPUTE_SUBWORKSTREAM_ROW_FIELDS = Object.freeze([
  "kind",
  "workstreamRef",
  "stageRef",
  "selectedEdgeRef",
  "targetCarrierRef",
  "targetModuleRef",
  "targetInterfaceRef",
  "predecessorWorkstreamRefs",
  "dependencyInputRefs",
  "authorityInputRefs",
  "evidenceRefs",
  "readRefs",
  "writeTerritoryRefs",
  "outputAllocationRefs",
  "idempotencyKey",
  "fanInScopeRef",
  "changedFileRefs",
  "proposedFileRefs",
  "status",
  "blockingReasonRefs",
  "residualGapRefs",
  "mergeDisposition"
] as const);

const SDLC_COMPUTE_SUBWORKSTREAM_STATUSES = Object.freeze([
  "not_started",
  "running",
  "done",
  "blocked",
  "failed",
  "discarded"
] as const);

const SDLC_COMPUTE_SUBWORKSTREAM_MERGE_DISPOSITIONS = Object.freeze([
  "not_started",
  "merged",
  "merged_with_conflicts",
  "blocked",
  "failed",
  "discarded",
  "not_applicable"
] as const);

const SDLC_COMPUTE_SUBWORKSTREAM_SOURCES = Object.freeze([
  "system_default",
  "parent_transform_report",
  "parent_evaluate_report",
  "parent_checkpoint"
] as const);

export function computeSubworkstreamSelectedEdgeRef(
  manifest: Pick<SdlcWorkerHandoffManifest, "graphFunctionName" | "edgeName"> &
    Partial<Pick<SdlcWorkerHandoffManifest, "vectorIndex">>
): string {
  return [
    "edge://odd-sdlc",
    encodeURIComponent(manifest.graphFunctionName),
    encodeURIComponent(manifest.edgeName),
    String(manifest.vectorIndex ?? 0)
  ].join("/");
}

export function computeSubworkstreamTargetCarrierRef(
  manifest: Partial<
    Pick<SdlcWorkerHandoffManifest, "targetAssetType" | "targetCarrierProjection">
  >
): string {
  return (
    manifest.targetCarrierProjection?.targetCarrierContractRef ??
    `target-carrier://odd-sdlc/${manifest.targetAssetType ?? "unknown"}`
  );
}

function defaultMergeResult(
  parentResultRef: string | null
): SdlcComputeSubworkstreamMergeResult {
  return Object.freeze({
    kind: "sdlc_compute_subworkstream_merge_result" as const,
    mergedOutputRefs: Object.freeze([]),
    conflictRefs: Object.freeze([]),
    discardedOutputRefs: Object.freeze([]),
    carryForwardGapRefs: Object.freeze([]),
    parentResultRef
  });
}

export function defaultComputeSubworkstreamManifest(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly stageRef: SdlcComputeSubworkstreamStageRef;
  readonly source?: SdlcComputeSubworkstreamManifest["source"] | undefined;
  readonly parentResultRef?: string | null | undefined;
}): SdlcComputeSubworkstreamManifest {
  return Object.freeze({
    kind: "sdlc_compute_subworkstream_manifest" as const,
    manifestVersion: "ts-compute-subworkstream-v1" as const,
    phase: "phase_1_parent_agent_internal" as const,
    authority: "observation_only_parent_plugin_result" as const,
    stageRef: input.stageRef,
    selectedEdgeRef: computeSubworkstreamSelectedEdgeRef(input.manifest),
    targetCarrierRef: computeSubworkstreamTargetCarrierRef(input.manifest),
    source: input.source ?? "system_default",
    subworkstreams: Object.freeze([]),
    mergeResult: defaultMergeResult(input.parentResultRef ?? null),
    nonAuthority: true as const,
    abgDistributedExecutionClaim: false as const
  });
}

function admitSubworkstreamRow(input: {
  readonly value: unknown;
  readonly label: string;
  readonly stageRef: SdlcComputeSubworkstreamStageRef;
  readonly selectedEdgeRef: string;
  readonly targetCarrierRef: string;
}): SdlcComputeSubworkstreamRow {
  const record = parseClosedRecord(
    input.value,
    input.label,
    SDLC_COMPUTE_SUBWORKSTREAM_ROW_FIELDS
  );
  const kind = parseNonEmptyString(record["kind"], `${input.label}.kind`);
  if (kind !== "sdlc_compute_subworkstream_row") {
    throw new TypeError(`${input.label}.kind: unexpected subworkstream row kind`);
  }
  const stageRef = parseEnumValue(
    record["stageRef"],
    `${input.label}.stageRef`,
    ["transform.C", "evaluate.C"] as const
  );
  if (stageRef !== input.stageRef) {
    throw new TypeError(`${input.label}.stageRef: parent stage mismatch`);
  }
  const selectedEdgeRef = parseNonEmptyString(
    record["selectedEdgeRef"],
    `${input.label}.selectedEdgeRef`
  );
  if (selectedEdgeRef !== input.selectedEdgeRef) {
    throw new TypeError(`${input.label}.selectedEdgeRef: parent edge mismatch`);
  }
  const targetCarrierRef = parseNonEmptyString(
    record["targetCarrierRef"],
    `${input.label}.targetCarrierRef`
  );
  if (targetCarrierRef !== input.targetCarrierRef) {
    throw new TypeError(`${input.label}.targetCarrierRef: parent target mismatch`);
  }
  const dependencyInputRefs = parseStringList(
    record["dependencyInputRefs"],
    `${input.label}.dependencyInputRefs`
  );
  const authorityInputRefs = parseStringList(
    record["authorityInputRefs"],
    `${input.label}.authorityInputRefs`
  );
  if (dependencyInputRefs.length === 0 && authorityInputRefs.length === 0) {
    throw new TypeError(
      `${input.label}: expected dependencyInputRefs or authorityInputRefs`
    );
  }
  const writeTerritoryRefs = parseStringList(
    record["writeTerritoryRefs"],
    `${input.label}.writeTerritoryRefs`
  );
  const outputAllocationRefs = parseStringList(
    record["outputAllocationRefs"],
    `${input.label}.outputAllocationRefs`
  );
  const changedFileRefs = parseStringList(
    record["changedFileRefs"],
    `${input.label}.changedFileRefs`
  );
  const proposedFileRefs = parseStringList(
    record["proposedFileRefs"],
    `${input.label}.proposedFileRefs`
  );
  if (
    input.stageRef === "evaluate.C" &&
    (writeTerritoryRefs.length > 0 ||
      outputAllocationRefs.length > 0 ||
      changedFileRefs.length > 0 ||
      proposedFileRefs.length > 0)
  ) {
    throw new TypeError(`${input.label}: evaluate.C subworkstreams are read-only`);
  }
  return Object.freeze({
    kind: "sdlc_compute_subworkstream_row" as const,
    workstreamRef: parseNonEmptyString(
      record["workstreamRef"],
      `${input.label}.workstreamRef`
    ),
    stageRef,
    selectedEdgeRef,
    targetCarrierRef,
    targetModuleRef: parseNullableNonEmptyString(
      record["targetModuleRef"],
      `${input.label}.targetModuleRef`
    ),
    targetInterfaceRef: parseNullableNonEmptyString(
      record["targetInterfaceRef"],
      `${input.label}.targetInterfaceRef`
    ),
    predecessorWorkstreamRefs: parseStringList(
      record["predecessorWorkstreamRefs"],
      `${input.label}.predecessorWorkstreamRefs`
    ),
    dependencyInputRefs,
    authorityInputRefs,
    evidenceRefs: parseStringList(record["evidenceRefs"], `${input.label}.evidenceRefs`),
    readRefs: parseStringList(record["readRefs"], `${input.label}.readRefs`),
    writeTerritoryRefs,
    outputAllocationRefs,
    idempotencyKey: parseNonEmptyString(
      record["idempotencyKey"],
      `${input.label}.idempotencyKey`
    ),
    fanInScopeRef: parseNullableNonEmptyString(
      record["fanInScopeRef"],
      `${input.label}.fanInScopeRef`
    ),
    changedFileRefs,
    proposedFileRefs,
    status: parseEnumValue(
      record["status"],
      `${input.label}.status`,
      SDLC_COMPUTE_SUBWORKSTREAM_STATUSES
    ),
    blockingReasonRefs: parseStringList(
      record["blockingReasonRefs"],
      `${input.label}.blockingReasonRefs`
    ),
    residualGapRefs: parseStringList(
      record["residualGapRefs"],
      `${input.label}.residualGapRefs`
    ),
    mergeDisposition: parseEnumValue(
      record["mergeDisposition"],
      `${input.label}.mergeDisposition`,
      SDLC_COMPUTE_SUBWORKSTREAM_MERGE_DISPOSITIONS
    )
  });
}

function admitMergeResult(
  input: unknown,
  label: string,
  parentResultRef: string | null
): SdlcComputeSubworkstreamMergeResult {
  const record = parseClosedRecord(input, label, [
    "kind",
    "mergedOutputRefs",
    "conflictRefs",
    "discardedOutputRefs",
    "carryForwardGapRefs",
    "parentResultRef"
  ]);
  const kind = parseNonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "sdlc_compute_subworkstream_merge_result") {
    throw new TypeError(`${label}.kind: unexpected subworkstream merge result kind`);
  }
  const parsedParentResultRef = parseNullableNonEmptyString(
    record["parentResultRef"],
    `${label}.parentResultRef`
  );
  if (
    parentResultRef !== null &&
    parsedParentResultRef !== null &&
    parsedParentResultRef !== parentResultRef
  ) {
    throw new TypeError(`${label}.parentResultRef: parent result mismatch`);
  }
  return Object.freeze({
    kind: "sdlc_compute_subworkstream_merge_result" as const,
    mergedOutputRefs: parseStringList(
      record["mergedOutputRefs"],
      `${label}.mergedOutputRefs`
    ),
    conflictRefs: parseStringList(record["conflictRefs"], `${label}.conflictRefs`),
    discardedOutputRefs: parseStringList(
      record["discardedOutputRefs"],
      `${label}.discardedOutputRefs`
    ),
    carryForwardGapRefs: parseStringList(
      record["carryForwardGapRefs"],
      `${label}.carryForwardGapRefs`
    ),
    parentResultRef: parsedParentResultRef ?? parentResultRef
  });
}

export function admitComputeSubworkstreamManifest(input: {
  readonly value: unknown;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly stageRef: SdlcComputeSubworkstreamStageRef;
  readonly source?: SdlcComputeSubworkstreamManifest["source"] | undefined;
  readonly parentResultRef?: string | null | undefined;
}): SdlcComputeSubworkstreamManifest {
  if (input.value === undefined || input.value === null) {
    return defaultComputeSubworkstreamManifest({
      manifest: input.manifest,
      stageRef: input.stageRef,
      source: input.source,
      parentResultRef: input.parentResultRef
    });
  }
  const record = parseClosedRecord(input.value, "SdlcComputeSubworkstreamManifest", [
    "kind",
    "manifestVersion",
    "phase",
    "authority",
    "stageRef",
    "selectedEdgeRef",
    "targetCarrierRef",
    "source",
    "subworkstreams",
    "mergeResult",
    "nonAuthority",
    "abgDistributedExecutionClaim"
  ]);
  const kind = parseNonEmptyString(
    record["kind"],
    "SdlcComputeSubworkstreamManifest.kind"
  );
  if (kind !== "sdlc_compute_subworkstream_manifest") {
    throw new TypeError(
      "SdlcComputeSubworkstreamManifest.kind: unexpected manifest kind"
    );
  }
  const manifestVersion = parseNonEmptyString(
    record["manifestVersion"],
    "SdlcComputeSubworkstreamManifest.manifestVersion"
  );
  if (manifestVersion !== "ts-compute-subworkstream-v1") {
    throw new TypeError(
      "SdlcComputeSubworkstreamManifest.manifestVersion: unsupported version"
    );
  }
  const phase = parseNonEmptyString(
    record["phase"],
    "SdlcComputeSubworkstreamManifest.phase"
  );
  if (phase !== "phase_1_parent_agent_internal") {
    throw new TypeError("SdlcComputeSubworkstreamManifest.phase: unexpected phase");
  }
  const authority = parseNonEmptyString(
    record["authority"],
    "SdlcComputeSubworkstreamManifest.authority"
  );
  if (authority !== "observation_only_parent_plugin_result") {
    throw new TypeError(
      "SdlcComputeSubworkstreamManifest.authority: unexpected authority"
    );
  }
  const stageRef = parseEnumValue(
    record["stageRef"],
    "SdlcComputeSubworkstreamManifest.stageRef",
    ["transform.C", "evaluate.C"] as const
  );
  if (stageRef !== input.stageRef) {
    throw new TypeError(
      "SdlcComputeSubworkstreamManifest.stageRef: parent stage mismatch"
    );
  }
  const selectedEdgeRef = parseNonEmptyString(
    record["selectedEdgeRef"],
    "SdlcComputeSubworkstreamManifest.selectedEdgeRef"
  );
  const expectedSelectedEdgeRef = computeSubworkstreamSelectedEdgeRef(input.manifest);
  if (selectedEdgeRef !== expectedSelectedEdgeRef) {
    throw new TypeError(
      "SdlcComputeSubworkstreamManifest.selectedEdgeRef: parent edge mismatch"
    );
  }
  const targetCarrierRef = parseNonEmptyString(
    record["targetCarrierRef"],
    "SdlcComputeSubworkstreamManifest.targetCarrierRef"
  );
  const expectedTargetCarrierRef = computeSubworkstreamTargetCarrierRef(input.manifest);
  if (targetCarrierRef !== expectedTargetCarrierRef) {
    throw new TypeError(
      "SdlcComputeSubworkstreamManifest.targetCarrierRef: parent target mismatch"
    );
  }
  const nonAuthority = parseBoolean(
    record["nonAuthority"],
    "SdlcComputeSubworkstreamManifest.nonAuthority"
  );
  if (!nonAuthority) {
    throw new TypeError(
      "SdlcComputeSubworkstreamManifest.nonAuthority: expected true"
    );
  }
  const abgDistributedExecutionClaim = parseBoolean(
    record["abgDistributedExecutionClaim"],
    "SdlcComputeSubworkstreamManifest.abgDistributedExecutionClaim"
  );
  if (abgDistributedExecutionClaim) {
    throw new TypeError(
      "SdlcComputeSubworkstreamManifest.abgDistributedExecutionClaim: expected false"
    );
  }
  const source = parseEnumValue(
    record["source"],
    "SdlcComputeSubworkstreamManifest.source",
    SDLC_COMPUTE_SUBWORKSTREAM_SOURCES
  );
  const subworkstreams = parseArray(
    record["subworkstreams"],
    "SdlcComputeSubworkstreamManifest.subworkstreams",
    (value, label) =>
      admitSubworkstreamRow({
        value,
        label,
        stageRef,
        selectedEdgeRef,
        targetCarrierRef
      })
  );
  return Object.freeze({
    kind: "sdlc_compute_subworkstream_manifest" as const,
    manifestVersion: "ts-compute-subworkstream-v1" as const,
    phase: "phase_1_parent_agent_internal" as const,
    authority: "observation_only_parent_plugin_result" as const,
    stageRef,
    selectedEdgeRef,
    targetCarrierRef,
    source,
    subworkstreams,
    mergeResult: admitMergeResult(
      record["mergeResult"],
      "SdlcComputeSubworkstreamManifest.mergeResult",
      input.parentResultRef ?? null
    ),
    nonAuthority: true as const,
    abgDistributedExecutionClaim: false as const
  });
}

export function computeSubworkstreamCounts(
  manifest: SdlcComputeSubworkstreamManifest
): {
  readonly total: number;
  readonly done: number;
  readonly blocked: number;
  readonly failed: number;
  readonly discarded: number;
} {
  return Object.freeze({
    total: manifest.subworkstreams.length,
    done: manifest.subworkstreams.filter((row) => row.status === "done").length,
    blocked: manifest.subworkstreams.filter((row) => row.status === "blocked")
      .length,
    failed: manifest.subworkstreams.filter((row) => row.status === "failed")
      .length,
    discarded: manifest.subworkstreams.filter((row) => row.status === "discarded")
      .length
  });
}
