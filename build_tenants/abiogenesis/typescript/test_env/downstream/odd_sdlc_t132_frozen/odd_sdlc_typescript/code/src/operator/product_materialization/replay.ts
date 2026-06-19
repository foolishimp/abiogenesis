import {
  closeSync,
  existsSync,
  openSync,
  readdirSync,
  readFileSync,
  readSync,
  statSync
} from "node:fs";
import path, { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  parseArray,
  parseNonEmptyString,
  parseStringList
} from "../../shared/validation.js";
import type { SdlcBlockingReasonCode } from "../../shared/blocking_reason.js";
import type {
  SdlcMaterializedProductFile,
  SdlcWorkerHandoffManifest,
  SdlcWorkerResultReport
} from "../carriers.js";

const HANDOFF_REPLAY_INDEX_FILE = "handoff_replay_index.json";
const HANDOFF_REPLAY_INDEX_VERSION = "ts-handoff-replay-index-v1";
const HANDOFF_REPLAY_MANIFEST_PREFIX_BYTES = 128 * 1024;

interface SdlcHandoffReplayIndex {
  readonly kind: "sdlc_handoff_replay_index";
  readonly indexVersion: typeof HANDOFF_REPLAY_INDEX_VERSION;
  readonly workspaceRoot: string;
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly targetAssetType: string;
}

export type ProductMaterializationReplayManifestRead =
  | {
      readonly kind: "manifest";
      readonly manifestFile: string;
      readonly files: readonly SdlcMaterializedProductFile[];
    }
  | {
      readonly kind: "absent";
    }
  | {
      readonly kind: "diagnostic";
      readonly code: SdlcBlockingReasonCode;
      readonly detail: string;
      readonly evidenceRefs: readonly string[];
    };

export interface ProductMaterializationReplayDeps {
  readonly uniqueSorted: (values: readonly string[]) => readonly string[];
  readonly workerReportWithMaterializedRequirementLineage: (input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly report: SdlcWorkerResultReport;
  }) => SdlcWorkerResultReport;
  readonly materializationReplayIsNeeded: (input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly report: SdlcWorkerResultReport;
  }) => boolean;
  readonly currentAttemptMaterializedFile: (input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly file: SdlcMaterializedProductFile;
    readonly overwritesMaterializationRef?: string | null | undefined;
  }) => SdlcMaterializedProductFile;
  readonly replayMaterializedFile: (input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly file: SdlcMaterializedProductFile;
    readonly sourceManifestRef: string;
    readonly sourceHandoffManifestRef: string;
    readonly sourceAttemptRef: string;
  }) => SdlcMaterializedProductFile;
  readonly admitReplayManifestMaterializedProductFile: (
    input: unknown,
    label: string
  ) => SdlcMaterializedProductFile;
  readonly isTenantDeclaredToolByproductRelativePath: (input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly normalizedRelativePath: string;
  }) => boolean;
  readonly materializedFileLineageRef: (input: {
    readonly manifestRef: string;
    readonly relativePath: string;
    readonly digest: string;
  }) => string;
}

function parseNonNegativeInteger(input: unknown, label: string): number {
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label}: expected non-negative integer`);
  }
  return input;
}

function isOpenRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function parseOpenRecord(input: unknown, label: string): Record<string, unknown> {
  if (!isOpenRecord(input)) {
    throw new TypeError(`${label}: expected object`);
  }
  return input;
}

function sameSortedStrings(
  left: readonly string[],
  right: readonly string[]
): boolean {
  return [...left].sort().join("\n") === [...right].sort().join("\n");
}

function priorMaterializationContractMatchesCurrent(input: {
  readonly priorContract: unknown;
  readonly currentContract: SdlcWorkerHandoffManifest["productMaterialization"];
}): boolean {
  try {
    const prior = parseOpenRecord(
      input.priorContract,
      "productMaterializationReplay.contract"
    );
    const current = input.currentContract;
    return (
      prior["kind"] === current.kind &&
      prior["required"] === current.required &&
      prior["activeTenant"] === current.activeTenant &&
      prior["selectedOutputRoot"] === current.selectedOutputRoot &&
      resolve(
        parseNonEmptyString(
          prior["tenantRoot"],
          "productMaterializationReplay.contract.tenantRoot"
        )
      ) === resolve(current.tenantRoot) &&
      prior["relativePathBasis"] === current.relativePathBasis &&
      sameSortedStrings(
        parseStringList(
          prior["declaredModuleNames"],
          "productMaterializationReplay.contract.declaredModuleNames"
        ),
        current.declaredModuleNames
      ) &&
      parseNonEmptyString(
        prior["buildExecutionContract"],
        "productMaterializationReplay.contract.buildExecutionContract"
      ) === current.buildExecutionContract &&
      parseNonEmptyString(
        prior["testExecutionContract"],
        "productMaterializationReplay.contract.testExecutionContract"
      ) === current.testExecutionContract &&
      sameSortedStrings(
        parseStringList(
          prior["requiredRoles"],
          "productMaterializationReplay.contract.requiredRoles"
        ),
        current.requiredRoles
      )
    );
  } catch {
    return false;
  }
}

function handoffReplayIndexPath(archiveRoot: string): string {
  return join(archiveRoot, HANDOFF_REPLAY_INDEX_FILE);
}

function readFilePrefix(filePath: string, maxBytes: number): string {
  const fd = openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(maxBytes);
    const bytesRead = readSync(fd, buffer, 0, maxBytes, 0);
    return buffer.subarray(0, bytesRead).toString("utf8");
  } finally {
    closeSync(fd);
  }
}

function topLevelJsonString(prefix: string, field: string): string | null {
  const match = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, "u").exec(prefix);
  return match?.[1] ?? null;
}

function topLevelJsonNumber(prefix: string, field: string): number | null {
  const match = new RegExp(`"${field}"\\s*:\\s*(-?\\d+)`, "u").exec(prefix);
  if (match === null) {
    return null;
  }
  const raw = match[1];
  if (raw === undefined) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function readHandoffReplayIndexFromManifestPrefix(
  manifestFile: string
): SdlcHandoffReplayIndex | null {
  if (!existsSync(manifestFile) || !statSync(manifestFile).isFile()) {
    return null;
  }
  const prefix = readFilePrefix(
    manifestFile,
    HANDOFF_REPLAY_MANIFEST_PREFIX_BYTES
  );
  if (topLevelJsonString(prefix, "kind") !== "sdlc_worker_handoff_manifest") {
    return null;
  }
  const workspaceRoot = topLevelJsonString(prefix, "workspaceRoot");
  const graphFunctionName = topLevelJsonString(prefix, "graphFunctionName");
  const edgeName = topLevelJsonString(prefix, "edgeName");
  const vectorIndex = topLevelJsonNumber(prefix, "vectorIndex");
  const targetAssetType = topLevelJsonString(prefix, "targetAssetType");
  if (
    workspaceRoot === null ||
    graphFunctionName === null ||
    edgeName === null ||
    vectorIndex === null ||
    targetAssetType === null
  ) {
    return null;
  }
  return Object.freeze({
    kind: "sdlc_handoff_replay_index" as const,
    indexVersion: HANDOFF_REPLAY_INDEX_VERSION,
    workspaceRoot,
    graphFunctionName,
    edgeName,
    vectorIndex,
    targetAssetType
  });
}

function readHandoffReplayIndex(
  archiveRoot: string
): SdlcHandoffReplayIndex | null {
  const indexPath = handoffReplayIndexPath(archiveRoot);
  if (existsSync(indexPath) && statSync(indexPath).isFile()) {
    try {
      const record = parseOpenRecord(
        JSON.parse(readFileSync(indexPath, "utf8")),
        "productMaterializationReplay.handoffReplayIndex"
      );
      if (
        record["kind"] === "sdlc_handoff_replay_index" &&
        record["indexVersion"] === HANDOFF_REPLAY_INDEX_VERSION
      ) {
        return Object.freeze({
          kind: "sdlc_handoff_replay_index" as const,
          indexVersion: HANDOFF_REPLAY_INDEX_VERSION,
          workspaceRoot: parseNonEmptyString(
            record["workspaceRoot"],
            "productMaterializationReplay.handoffReplayIndex.workspaceRoot"
          ),
          graphFunctionName: parseNonEmptyString(
            record["graphFunctionName"],
            "productMaterializationReplay.handoffReplayIndex.graphFunctionName"
          ),
          edgeName: parseNonEmptyString(
            record["edgeName"],
            "productMaterializationReplay.handoffReplayIndex.edgeName"
          ),
          vectorIndex: parseNonNegativeInteger(
            record["vectorIndex"],
            "productMaterializationReplay.handoffReplayIndex.vectorIndex"
          ),
          targetAssetType: parseNonEmptyString(
            record["targetAssetType"],
            "productMaterializationReplay.handoffReplayIndex.targetAssetType"
          )
        });
      }
    } catch {
      return null;
    }
  }
  return readHandoffReplayIndexFromManifestPrefix(
    join(archiveRoot, "handoff_manifest.json")
  );
}

export function priorHandoffManifestMatchesCurrent(input: {
  readonly archiveRoot: string;
  readonly currentManifest: SdlcWorkerHandoffManifest;
}): boolean {
  const replayIndex = readHandoffReplayIndex(input.archiveRoot);
  if (replayIndex === null) {
    return false;
  }
  return (
    resolve(replayIndex.workspaceRoot) === resolve(input.currentManifest.workspaceRoot) &&
    replayIndex.graphFunctionName === input.currentManifest.graphFunctionName &&
    replayIndex.edgeName === input.currentManifest.edgeName &&
    replayIndex.vectorIndex === input.currentManifest.vectorIndex &&
    replayIndex.targetAssetType === input.currentManifest.targetAssetType
  );
}

function candidateArchivePrecedesCurrent(input: {
  readonly archiveRoot: string;
  readonly currentArchiveRoot: string;
}): boolean {
  const archiveName = path.basename(input.archiveRoot);
  const currentName = path.basename(input.currentArchiveRoot);
  if (archiveName < currentName) {
    return true;
  }
  try {
    return (
      statSync(input.archiveRoot).mtimeMs <=
      statSync(input.currentArchiveRoot).mtimeMs
    );
  } catch {
    return false;
  }
}

export function productMaterializationReplayArchives(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const currentArchiveRoot = resolve(manifest.archiveRoot);
  const parent = dirname(currentArchiveRoot);
  if (!existsSync(parent) || !statSync(parent).isDirectory()) {
    return Object.freeze([]);
  }
  return Object.freeze(
    readdirSync(parent)
      .map((entry) => join(parent, entry))
      .filter((archiveRoot) => resolve(archiveRoot) !== currentArchiveRoot)
      .filter((archiveRoot) => {
        try {
          return statSync(archiveRoot).isDirectory();
        } catch {
          return false;
        }
      })
      .filter((archiveRoot) =>
        candidateArchivePrecedesCurrent({ archiveRoot, currentArchiveRoot })
      )
      .sort()
  );
}

export function replayArchivePostflightStatus(
  archiveRoot: string
): "absent" | "blocked" | "invalid" | "passed" {
  const postflightFile = join(archiveRoot, "postflight.json");
  if (!existsSync(postflightFile) || !statSync(postflightFile).isFile()) {
    return "absent";
  }
  try {
    const postflight = parseOpenRecord(
      JSON.parse(readFileSync(postflightFile, "utf8")),
      "productMaterializationReplay.postflight"
    );
    return postflight["status"] === "passed"
      ? "passed"
      : postflight["status"] === "blocked"
        ? "blocked"
        : "invalid";
  } catch {
    return "invalid";
  }
}

function replayArchivePostflightPassedOrAbsent(archiveRoot: string): boolean {
  const status = replayArchivePostflightStatus(archiveRoot);
  return status === "absent" || status === "passed";
}

function normalizedRelativePath(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

export function readProductMaterializationReplayManifest(
  input: {
    readonly archiveRoot: string;
    readonly currentManifest: SdlcWorkerHandoffManifest;
  },
  deps: Pick<
    ProductMaterializationReplayDeps,
    | "admitReplayManifestMaterializedProductFile"
    | "isTenantDeclaredToolByproductRelativePath"
  >
): ProductMaterializationReplayManifestRead {
  const manifestFile = join(input.archiveRoot, "product_materialization_manifest.json");
  if (!existsSync(manifestFile) || !statSync(manifestFile).isFile()) {
    return Object.freeze({ kind: "absent" as const });
  }
  if (!replayArchivePostflightPassedOrAbsent(input.archiveRoot)) {
    return Object.freeze({ kind: "absent" as const });
  }
  const manifestRef = pathToFileURL(manifestFile).href;
  try {
    const manifest = parseOpenRecord(
      JSON.parse(readFileSync(manifestFile, "utf8")),
      "productMaterializationReplay.manifest"
    );
    if (manifest["kind"] !== "sdlc_product_materialization_manifest") {
      return Object.freeze({
        kind: "diagnostic" as const,
        code: "materialized_product_manifest_replay_kind_mismatch",
        detail: "product materialization replay manifest has an unexpected kind",
        evidenceRefs: Object.freeze([manifestRef])
      });
    }
    if (
      !priorMaterializationContractMatchesCurrent({
        priorContract: manifest["contract"],
        currentContract: input.currentManifest.productMaterialization
      })
    ) {
      return Object.freeze({
        kind: "diagnostic" as const,
        code: "materialized_product_manifest_replay_target_mismatch",
        detail: "product materialization replay contract does not match the current materialization contract",
        evidenceRefs: Object.freeze([manifestRef])
      });
    }
    const files = parseArray(
      manifest["files"],
      "productMaterializationReplay.manifest.files",
      deps.admitReplayManifestMaterializedProductFile
    ).filter(
      (file) =>
        !deps.isTenantDeclaredToolByproductRelativePath({
          manifest: input.currentManifest,
          normalizedRelativePath: normalizedRelativePath(file.relativePath)
        })
    );
    if (files.length === 0) {
      return Object.freeze({
        kind: "diagnostic" as const,
        code: "materialized_product_manifest_replay_empty",
        detail: "product materialization replay manifest has no admitted file rows",
        evidenceRefs: Object.freeze([manifestRef])
      });
    }
    return Object.freeze({
      kind: "manifest" as const,
      manifestFile,
      files
    });
  } catch (error) {
    return Object.freeze({
      kind: "diagnostic" as const,
      code: "materialized_product_manifest_replay_parse_failed",
      detail: error instanceof Error ? error.message : "failed to parse replay manifest",
      evidenceRefs: Object.freeze([manifestRef])
    });
  }
}

function mergeMaterializedProductFiles(
  input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly replayedFiles: readonly SdlcMaterializedProductFile[];
    readonly currentFiles: readonly SdlcMaterializedProductFile[];
  },
  deps: ProductMaterializationReplayDeps
): readonly SdlcMaterializedProductFile[] {
  const byAbsolutePath = new Map<string, SdlcMaterializedProductFile>();
  for (const file of input.replayedFiles) {
    byAbsolutePath.set(resolve(file.absolutePath), file);
  }
  for (const file of input.currentFiles) {
    const replayed = byAbsolutePath.get(resolve(file.absolutePath));
    const replayedRef =
      replayed?.sourceManifestRef === undefined
        ? null
        : deps.materializedFileLineageRef({
            manifestRef: replayed.sourceManifestRef,
            relativePath: replayed.relativePath,
            digest: replayed.digest
          });
    byAbsolutePath.set(
      resolve(file.absolutePath),
      deps.currentAttemptMaterializedFile({
        manifest: input.manifest,
        file,
        overwritesMaterializationRef: replayedRef
      })
    );
  }
  return Object.freeze(
    [...byAbsolutePath.values()].sort((left, right) => {
      const relativeOrder = left.relativePath.localeCompare(right.relativePath);
      if (relativeOrder !== 0) {
        return relativeOrder;
      }
      return resolve(left.absolutePath).localeCompare(resolve(right.absolutePath));
    })
  );
}

export function resolveProductMaterializationReplay(
  input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly report: SdlcWorkerResultReport;
  },
  deps: ProductMaterializationReplayDeps
): {
  readonly report: SdlcWorkerResultReport;
  readonly diagnostics: readonly {
    readonly code: SdlcBlockingReasonCode;
    readonly detail: string;
    readonly evidenceRefs: readonly string[];
  }[];
  readonly replay: {
    readonly currentAttemptMaterializedFileCount: number;
    readonly replayedMaterializedFileCount: number;
    readonly effectiveMaterializedFileCount: number;
    readonly lineageRefs: readonly string[];
  } | null;
} {
  const reportWithLineage =
    deps.workerReportWithMaterializedRequirementLineage(input);
  const currentFiles = reportWithLineage.materializedFiles.map((file) =>
    file.materializationSource === "replay"
      ? file
      : deps.currentAttemptMaterializedFile({
          manifest: input.manifest,
          file
        })
  );
  if (!deps.materializationReplayIsNeeded(input)) {
    return Object.freeze({
      report: Object.freeze({
        ...reportWithLineage,
        materializedFiles: Object.freeze(currentFiles)
      }),
      diagnostics: Object.freeze([]),
      replay: null
    });
  }
  const replayedFiles: SdlcMaterializedProductFile[] = [];
  const lineageRefs: string[] = [];
  const diagnostics: {
    code: SdlcBlockingReasonCode;
    detail: string;
    evidenceRefs: readonly string[];
  }[] = [];
  for (const archiveRoot of productMaterializationReplayArchives(input.manifest)) {
    if (
      !priorHandoffManifestMatchesCurrent({
        archiveRoot,
        currentManifest: input.manifest
      })
    ) {
      continue;
    }
    const replayManifest = readProductMaterializationReplayManifest(
      {
        archiveRoot,
        currentManifest: input.manifest
      },
      deps
    );
    if (replayManifest.kind === "absent") {
      continue;
    }
    if (replayManifest.kind === "diagnostic") {
      diagnostics.push({
        code: replayManifest.code,
        detail: replayManifest.detail,
        evidenceRefs: replayManifest.evidenceRefs
      });
      continue;
    }
    const manifestRef = pathToFileURL(replayManifest.manifestFile).href;
    const handoffManifestRef = pathToFileURL(join(archiveRoot, "handoff_manifest.json")).href;
    const attemptRef = pathToFileURL(archiveRoot).href;
    replayedFiles.push(
      ...replayManifest.files.map((file) =>
        deps.replayMaterializedFile({
          manifest: input.manifest,
          file,
          sourceManifestRef: manifestRef,
          sourceHandoffManifestRef: handoffManifestRef,
          sourceAttemptRef: attemptRef
        })
      )
    );
    lineageRefs.push(manifestRef);
    lineageRefs.push(handoffManifestRef);
  }
  if (replayedFiles.length === 0) {
    const supersededDiagnostics = new Set<SdlcBlockingReasonCode>(
      currentFiles.length > 0
        ? ["materialized_product_manifest_replay_empty"]
        : []
    );
    return Object.freeze({
      report: Object.freeze({
        ...reportWithLineage,
        materializedFiles: Object.freeze(currentFiles)
      }),
      diagnostics: Object.freeze(
        diagnostics.filter((diagnostic) => !supersededDiagnostics.has(diagnostic.code))
      ),
      replay: null
    });
  }
  const materializedFiles = mergeMaterializedProductFiles(
    {
      manifest: input.manifest,
      replayedFiles,
      currentFiles
    },
    deps
  );
  const supersededDiagnostics = new Set<SdlcBlockingReasonCode>([
    "materialized_product_manifest_replay_empty"
  ]);
  const report = Object.freeze({
    ...reportWithLineage,
    materializedFiles
  });
  return Object.freeze({
    report,
    diagnostics: Object.freeze(
      diagnostics.filter((diagnostic) => !supersededDiagnostics.has(diagnostic.code))
    ),
    replay: Object.freeze({
      currentAttemptMaterializedFileCount:
        reportWithLineage.materializedFiles.length,
      replayedMaterializedFileCount: replayedFiles.length,
      effectiveMaterializedFileCount: materializedFiles.length,
      lineageRefs: Object.freeze(deps.uniqueSorted(lineageRefs))
    })
  });
}

export function workerResultReportWithReplayedProductMaterialization(
  input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly report: SdlcWorkerResultReport;
  },
  deps: ProductMaterializationReplayDeps
): SdlcWorkerResultReport {
  return resolveProductMaterializationReplay(input, deps).report;
}
