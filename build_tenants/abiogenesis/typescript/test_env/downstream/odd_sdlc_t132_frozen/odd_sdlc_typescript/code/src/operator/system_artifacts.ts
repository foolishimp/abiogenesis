// Implements: T-183

import { relative, resolve } from "node:path";
import {
  constructSdlcArchiveWritePlan,
  constructSdlcOperatorRunArtifactArchiveWritePlan,
  executeSdlcArchiveWritePlan
} from "../effects/archive_store.js";
import {
  operatorRunArtifactRowForRelativePath,
  requireOperatorRunArtifactRowForArtifactRef
} from "../contracts/operator_run_artifact_catalog.js";

export function stableSdlcSystemArtifactJson(payload: unknown): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function relativePathWithinRoot(input: {
  readonly root: string;
  readonly absolutePath: string;
}): string | null {
  const root = resolve(input.root);
  const absolutePath = resolve(input.absolutePath);
  const relativePath = relative(root, absolutePath).split("\\").join("/");
  if (
    relativePath.length === 0 ||
    relativePath.startsWith("../") ||
    relativePath === ".."
  ) {
    return null;
  }
  return relativePath;
}

function normalizedSystemArtifactTarget(input: {
  readonly archiveRoot: string;
  readonly absolutePath: string;
}): {
  readonly root: string;
  readonly relativePath: string;
} {
  const archiveRoot = resolve(input.archiveRoot);
  const archiveRelativePath = relativePathWithinRoot({
    root: archiveRoot,
    absolutePath: input.absolutePath
  });
  if (archiveRelativePath !== null) {
    return Object.freeze({
      root: archiveRoot,
      relativePath: archiveRelativePath
    });
  }
  const runtimeRoot = resolve(archiveRoot, "../..");
  const runtimeRelativePath = relativePathWithinRoot({
    root: runtimeRoot,
    absolutePath: input.absolutePath
  });
  if (runtimeRelativePath === null) {
    throw new TypeError(
      `${input.absolutePath}: system artifact path is outside archive root ${input.archiveRoot}`
    );
  }
  return Object.freeze({
    root: runtimeRoot,
    relativePath: runtimeRelativePath
  });
}

function isUncatalogedSystemArtifactPath(relativePath: string): boolean {
  return (
    relativePath.startsWith("installed_operator_execution/") ||
    relativePath.startsWith("transform-assets/")
  );
}

function assertCatalogedAuthorityPayload(input: {
  readonly relativePath: string;
  readonly payload: unknown;
}): void {
  if (
    !isUncatalogedSystemArtifactPath(input.relativePath) &&
    typeof input.payload === "object" &&
    input.payload !== null &&
    !Array.isArray(input.payload) &&
    "kind" in input.payload &&
    typeof input.payload.kind === "string" &&
    (input.payload.kind.startsWith("sdlc_") ||
      input.payload.kind.startsWith("odd_sdlc.") ||
      input.payload.kind.startsWith("fp_"))
  ) {
    throw new TypeError(
      `${input.relativePath}: authoritative operator archive payload has no catalog row`
    );
  }
}

export function writeSdlcSystemArtifact(input: {
  readonly archiveRoot: string;
  readonly relativePath?: string | undefined;
  readonly absolutePath?: string | undefined;
  readonly artifactRef?: string | undefined;
  readonly payload: unknown;
}): string {
  const content =
    typeof input.payload === "string"
      ? input.payload
      : stableSdlcSystemArtifactJson(input.payload);
  const target =
    input.relativePath !== undefined
      ? Object.freeze({
          root: input.archiveRoot,
          relativePath: input.relativePath
        })
      : input.absolutePath === undefined
        ? null
        : normalizedSystemArtifactTarget({
            archiveRoot: input.archiveRoot,
            absolutePath: input.absolutePath
          });
  const relativePath = target?.relativePath;
  const artifact =
    input.artifactRef !== undefined
      ? requireOperatorRunArtifactRowForArtifactRef(input.artifactRef)
      : relativePath === undefined
        ? null
        : operatorRunArtifactRowForRelativePath(relativePath);
  if (artifact !== null) {
    if (
      artifact.carrierKind !== null &&
      typeof input.payload === "object" &&
      input.payload !== null &&
      !Array.isArray(input.payload) &&
      "kind" in input.payload &&
      input.payload.kind !== artifact.carrierKind
    ) {
      throw new TypeError(
        `${artifact.artifactRef}: payload kind ${String(input.payload.kind)} does not match catalog carrier kind ${artifact.carrierKind}`
      );
    }
    return executeSdlcArchiveWritePlan(
      constructSdlcOperatorRunArtifactArchiveWritePlan({
        archiveRoot: input.archiveRoot,
        artifactRef: artifact.artifactRef,
        artifactRow: artifact,
        content
      })
    );
  }
  if (target === null || relativePath === undefined) {
    throw new TypeError(
      "system artifact write requires artifactRef, relativePath, or absolutePath"
    );
  }
  assertCatalogedAuthorityPayload({
    relativePath,
    payload: input.payload
  });
  return executeSdlcArchiveWritePlan(
    constructSdlcArchiveWritePlan({
      archiveRoot: target.root,
      relativePath,
      content
    })
  );
}
