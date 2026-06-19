// Implements: T-175

import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import {
  requireOperatorRunArtifactRowForArtifactRef,
  type SdlcOperatorRunArtifactRow
} from "../contracts/operator_run_artifact_catalog.js";

export interface SdlcArchiveWritePlan {
  readonly kind: "sdlc_archive_write_plan";
  readonly archiveRoot: string;
  readonly relativePath: string;
  readonly content: string;
  readonly artifactRef: string | null;
  readonly sourceOwner: string | null;
  readonly authoritative: boolean;
}

export function constructSdlcArchiveWritePlan(input: {
  readonly archiveRoot: string;
  readonly relativePath: string;
  readonly content: string;
}): SdlcArchiveWritePlan {
  return Object.freeze({
    kind: "sdlc_archive_write_plan" as const,
    archiveRoot: input.archiveRoot,
    relativePath: input.relativePath,
    content: input.content,
    artifactRef: null,
    sourceOwner: null,
    authoritative: false
  });
}

export function constructSdlcOperatorRunArtifactArchiveWritePlan(input: {
  readonly archiveRoot: string;
  readonly artifactRef: string;
  readonly content: string;
  readonly artifactRow?: SdlcOperatorRunArtifactRow | undefined;
}): SdlcArchiveWritePlan {
  const artifact =
    input.artifactRow ?? requireOperatorRunArtifactRowForArtifactRef(input.artifactRef);
  if (artifact.artifactRef !== input.artifactRef) {
    throw new TypeError(
      `${input.artifactRef}: archive write artifact row ref mismatch: ${artifact.artifactRef}`
    );
  }
  return Object.freeze({
    kind: "sdlc_archive_write_plan" as const,
    archiveRoot: input.archiveRoot,
    relativePath: artifact.relativePath,
    content: input.content,
    artifactRef: artifact.artifactRef,
    sourceOwner: artifact.sourceOwner,
    authoritative: artifact.admissionRef !== null
  });
}

export function executeSdlcArchiveWritePlan(plan: SdlcArchiveWritePlan): string {
  const targetPath = join(plan.archiveRoot, plan.relativePath);
  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, plan.content, "utf8");
  return targetPath;
}

export function writeUtf8FileAtomically(input: {
  readonly targetPath: string;
  readonly content: string;
}): string {
  const targetDirectory = dirname(input.targetPath);
  const tempPath = join(
    targetDirectory,
    `.${basename(input.targetPath)}.${process.pid}.tmp`
  );
  mkdirSync(targetDirectory, { recursive: true });
  writeFileSync(tempPath, input.content, "utf8");
  renameSync(tempPath, input.targetPath);
  return input.targetPath;
}
