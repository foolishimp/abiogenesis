// Implements: T-161

import path from "node:path";
import { existsSync, statSync } from "node:fs";

import { operatorRunRef } from "./archive_reader.js";
import type { OperatorRunCarriers } from "./carrier_loaders.js";
import type { DiagnosticDraft } from "./diagnostics.js";
import type { SdlcFdRunAnalysisRuntimeArtifactGap } from "./types.js";
import {
  isSdlcOperatorRunArtifactRequiredForContext,
  operatorRunArtifactRows,
  type SdlcOperatorRunArtifactRow
} from "../contracts/operator_run_artifact_catalog.js";
import {
  constructSdlcProductGraphContractCatalog,
  type SdlcProductGraphContractRow
} from "../contracts/product_graph_contract_catalog.js";
import {
  constructSdlcGtlModule,
  constructSdlcTargetCarrierRegistry,
  constructSdlcTraversalOverlayCatalog,
  SDLC_EDGE_GAIN_CLOSURE_CONTRACTS
} from "../graph/index.js";

type RuntimeCarrierLoadState =
  | { readonly status: "present" | "missing" }
  | { readonly status: "malformed"; readonly detail: string };

const DEFAULT_PRODUCT_GRAPH_CONTRACT_CATALOG = (() => {
  const module = constructSdlcGtlModule();
  const targetCarrierRegistry = constructSdlcTargetCarrierRegistry({ module });
  const overlayCatalog = constructSdlcTraversalOverlayCatalog({ module });
  return constructSdlcProductGraphContractCatalog({
    module,
    edgeContracts: SDLC_EDGE_GAIN_CLOSURE_CONTRACTS,
    targetCarrierRows: targetCarrierRegistry.rows,
    overlays: overlayCatalog.overlays
  });
})();

function artifactMissingGap(input: {
  readonly operatorRunRefValue: string;
  readonly artifact: SdlcOperatorRunArtifactRow;
  readonly detail: string | null;
}): SdlcFdRunAnalysisRuntimeArtifactGap {
  return Object.freeze({
    operatorRunRef: input.operatorRunRefValue,
    artifact: input.artifact.relativePath,
    status: "missing" as const,
    detail: input.detail
  });
}

function missingArtifactDiagnostic(input: {
  readonly operatorRunRefValue: string;
  readonly artifact: SdlcOperatorRunArtifactRow;
  readonly detail: string;
}): DiagnosticDraft {
  return {
    code: "runtime_artifact_missing",
    severity: "warn",
    detail: input.detail,
    evidenceRefs: Object.freeze([input.operatorRunRefValue]),
    operatorRunRef: input.operatorRunRefValue,
    edgeName: null
  };
}

function fileExists(filePath: string): boolean {
  if (!existsSync(filePath)) {
    return false;
  }
  try {
    return statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function observedEdgeName(carriers: OperatorRunCarriers): string | null {
  if (
    carriers.handoffManifest.status === "present" &&
    typeof carriers.handoffManifest.data.edgeName === "string"
  ) {
    return carriers.handoffManifest.data.edgeName;
  }
  if (
    carriers.operatorSummary.status === "present" &&
    typeof carriers.operatorSummary.data.currentEdge === "string"
  ) {
    return carriers.operatorSummary.data.currentEdge;
  }
  return null;
}

function selectedDependencyTraversalMethods(
  carriers: OperatorRunCarriers
): readonly string[] {
  return Object.freeze([
    ...(carriers.moduleDependencyTraversalSelection.status === "present"
      ? [carriers.moduleDependencyTraversalSelection.data.selectedMethod]
      : []),
    ...(carriers.testDependencyTraversalSelection.status === "present"
      ? [carriers.testDependencyTraversalSelection.data.selectedMethod]
      : []),
    ...(carriers.uatTestDependencyTraversalSelection.status === "present"
      ? [carriers.uatTestDependencyTraversalSelection.data.selectedMethod]
      : [])
  ]);
}

function productGraphRowForCarriers(
  carriers: OperatorRunCarriers
): SdlcProductGraphContractRow | null {
  const edgeName = observedEdgeName(carriers);
  if (edgeName === null) {
    return null;
  }
  return DEFAULT_PRODUCT_GRAPH_CONTRACT_CATALOG.rowByEdgeRef[edgeName] ?? null;
}

function requirednessContextForCarriers(carriers: OperatorRunCarriers) {
  const productGraphRow = productGraphRowForCarriers(carriers);
  return Object.freeze({
    edgeRef: productGraphRow?.edgeRef ?? observedEdgeName(carriers),
    targetAssetType:
      productGraphRow?.targetAssetType ??
      (carriers.handoffManifest.status === "present" &&
      typeof carriers.handoffManifest.data.targetAssetType === "string"
        ? carriers.handoffManifest.data.targetAssetType
        : null),
    closureDisposition:
      carriers.edgeClosure.status === "present"
        ? carriers.edgeClosure.data.disposition ?? null
        : null,
    selectedDependencyTraversalMethods: selectedDependencyTraversalMethods(carriers),
    productGraphRequiredArtifactRefs:
      productGraphRow?.requiredArtifactRefs ?? Object.freeze([])
  });
}

function runtimeCarrierLoadStateForArtifact(input: {
  readonly carriers: OperatorRunCarriers;
  readonly artifact: SdlcOperatorRunArtifactRow;
}): RuntimeCarrierLoadState | undefined {
  const loaded = input.carriers.artifactStateByRef[input.artifact.artifactRef];
  if (loaded === undefined) {
    return undefined;
  }
  if (loaded.status === "malformed") {
    return Object.freeze({
      status: "malformed" as const,
      detail: loaded.detail
    });
  }
  return Object.freeze({ status: loaded.status });
}

export function deriveRuntimeArtifactGaps(input: {
  readonly carriers: readonly OperatorRunCarriers[];
}): {
  readonly gaps: readonly SdlcFdRunAnalysisRuntimeArtifactGap[];
  readonly diagnostics: readonly DiagnosticDraft[];
} {
  const gaps: SdlcFdRunAnalysisRuntimeArtifactGap[] = [];
  const diagnostics: DiagnosticDraft[] = [];
  for (let index = 0; index < input.carriers.length; index += 1) {
    const carriers = input.carriers[index];
    if (carriers === undefined) {
      continue;
    }
    const operatorRunRefValue = operatorRunRef(carriers.operatorRunRoot);
    const requirednessContext = requirednessContextForCarriers(carriers);
    for (const artifact of operatorRunArtifactRows()) {
      if (
        !isSdlcOperatorRunArtifactRequiredForContext({
          artifact,
          context: requirednessContext
        })
      ) {
        continue;
      }
      const filePath = path.join(carriers.operatorRunRoot, artifact.relativePath);
      if (!fileExists(filePath)) {
        const detail = artifact.requiredWhen === undefined
          ? null
          : `${artifact.requiredWhen}: ${artifact.relativePath} missing in ${operatorRunRefValue}`;
        gaps.push(artifactMissingGap({
          operatorRunRefValue,
          artifact,
          detail
        }));
        diagnostics.push(missingArtifactDiagnostic({
          operatorRunRefValue,
          artifact,
          detail: detail ?? `${artifact.relativePath} missing in ${operatorRunRefValue}`
        }));
      }
    }
    const malformedCarrierEntries = operatorRunArtifactRows({
      malformedGapTracked: true
    }).flatMap(
      (artifact) => {
        const loaded = runtimeCarrierLoadStateForArtifact({ carriers, artifact });
        if (loaded === undefined) {
          const filePath = path.join(carriers.operatorRunRoot, artifact.relativePath);
          return fileExists(filePath)
            ? [Object.freeze({
                artifact: artifact.relativePath,
                detail: "artifact catalog row has no runtime carrier loader"
              })]
            : [];
        }
        return loaded?.status === "malformed"
          ? [Object.freeze({
              artifact: artifact.relativePath,
              detail: loaded.detail
            })]
          : [];
      }
    );
    for (const entry of malformedCarrierEntries) {
      gaps.push(Object.freeze({
        operatorRunRef: operatorRunRefValue,
        artifact: entry.artifact,
        status: "malformed" as const,
        detail: entry.detail
      }));
      diagnostics.push({
        code: "runtime_artifact_malformed",
        severity: "warn",
        detail: `${entry.artifact} malformed in ${operatorRunRefValue}: ${entry.detail}`,
        evidenceRefs: Object.freeze([operatorRunRefValue]),
        operatorRunRef: operatorRunRefValue,
        edgeName: null
      });
    }
  }
  return Object.freeze({
    gaps: Object.freeze(gaps),
    diagnostics: Object.freeze(diagnostics)
  });
}
