import type {
  SdlcWorkerHandoffManifest,
  SdlcWorkerResultReport
} from "../carriers.js";
import { resolveProductMaterializationReplay } from "../plugins/transform/result_projection.js";
import { writeSdlcSystemArtifact } from "../system_artifacts.js";

interface ProductMaterializationManifestDeps {
  readonly resolveProductMaterializationReplay: (input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly report: SdlcWorkerResultReport;
  }) => {
    readonly report: SdlcWorkerResultReport;
    readonly replay: {
      readonly currentAttemptMaterializedFileCount: number;
      readonly replayedMaterializedFileCount: number;
      readonly effectiveMaterializedFileCount: number;
      readonly lineageRefs: readonly string[];
    } | null;
  };
  readonly writeSdlcSystemArtifact: (input: {
    readonly archiveRoot: string;
    readonly absolutePath: string;
    readonly payload: unknown;
  }) => string;
}

function writeProductMaterializationManifestWithDeps(
  input: {
    readonly manifest: SdlcWorkerHandoffManifest;
    readonly report: SdlcWorkerResultReport;
  },
  deps: ProductMaterializationManifestDeps
): string {
  const replayResolution = deps.resolveProductMaterializationReplay(input);
  const payload: Record<string, unknown> = {
    kind: "sdlc_product_materialization_manifest",
    contract: input.manifest.productMaterialization,
    files: replayResolution.report.materializedFiles
  };
  if (replayResolution.replay !== null) {
    payload["replay"] = {
      kind: "sdlc_product_materialization_manifest_replay",
      ...replayResolution.replay
    };
  }
  deps.writeSdlcSystemArtifact({
    archiveRoot: input.manifest.archiveRoot,
    absolutePath: input.manifest.productMaterialization.manifestFile,
    payload
  });
  return input.manifest.productMaterialization.manifestFile;
}

export function writeProductMaterializationManifest(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly report: SdlcWorkerResultReport;
}): string {
  return writeProductMaterializationManifestWithDeps(input, {
    resolveProductMaterializationReplay,
    writeSdlcSystemArtifact
  });
}
