import type {
  SdlcWorkerHandoffManifest,
  SdlcWorkerResultReport
} from "../../carriers.js";import {
  admitSdlcConstructorResult,
  type SdlcConstructorResult,
  type SdlcWorkOperation
} from "../../../hooks/index.js";import {
  existsSync,
  readFileSync
} from "node:fs";import {
  pathToFileURL
} from "node:url";import {
  sha256Text
} from "../../../shared/digest.js";import {
  workerResultReportWithReplayedProductMaterialization
} from "../transform/result_projection.js";

export function sha256File(filePath: string): string {
  return sha256Text(readFileSync(filePath, "utf8"));
}

export function constructorResultFromWorkerOutput(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
  readonly operationType?: SdlcWorkOperation;
}): SdlcConstructorResult {
  const report = workerResultReportWithReplayedProductMaterialization(input);
  if (!existsSync(input.manifest.productMaterialization.manifestFile)) {
    throw new TypeError(
      "constructor result requires product materialization manifest from post-transform diagnostic flow"
    );
  }
  const content = readFileSync(report.outputFile, "utf8");
  const digest = sha256Text(content);
  return admitSdlcConstructorResult({
    operationType: input.operationType ?? "generate",
    outputIdentity: {
      assetId: `asset://odd_sdlc/operator/${input.manifest.edgeName}/${input.manifest.targetAssetType}`,
      uri: pathToFileURL(report.outputFile).href,
      declaredType: input.manifest.targetAssetType,
      digest,
      byteCount: Buffer.byteLength(content, "utf8")
    },
    evidenceRefs: [
      {
        ref: pathToFileURL(report.outputFile).href,
        evidenceType: "installed_operator_generated_asset",
        digest
      },
      {
        ref: pathToFileURL(input.manifest.reportFile).href,
        evidenceType: "installed_operator_worker_report",
        digest: sha256File(input.manifest.reportFile)
      },
      {
        ref: pathToFileURL(input.manifest.productMaterialization.manifestFile).href,
        evidenceType: "installed_operator_product_materialization_manifest",
        digest: sha256File(input.manifest.productMaterialization.manifestFile)
      }
    ].concat(
      report.materializedFiles.map((file) => ({
        ref: pathToFileURL(file.absolutePath).href,
        evidenceType: `installed_operator_materialized_product_${file.role}`,
        digest: file.digest
      })),
      report.executionEvidence?.reportRefs.map((ref) => ({
        ref,
        evidenceType: "installed_operator_execution_report",
        digest: "sha256:external"
      })) ?? []
    ),
    generatedAssetContract: {
      contractName: `installed-operator-${input.manifest.targetAssetType}-contract`,
      targetAssetId: `asset://odd_sdlc/operator/${input.manifest.edgeName}/${input.manifest.targetAssetType}`,
      satisfied: true,
      materialized: true,
      diagnostics: [
        `materialized_product_file_count:${report.materializedFiles.length}`
      ],
      foreignRealizationCandidates: []
    },
    ambiguityCandidates: []
  });
}
