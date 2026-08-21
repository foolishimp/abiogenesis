import {
  mkdir,
  readFile,
  readdir,
  realpath,
  rename,
  rmdir,
  stat,
  writeFile,
} from "node:fs/promises";
import { basename, isAbsolute, join, resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import {
  createPhysicalArtifactStagingRoot,
  observePhysicalArtifact,
  physicalArtifactEffectEvidence,
  preserveOwnedPhysicalResidue,
  type PhysicalArtifactEffectEvidence,
} from "./physical_artifact_effect.js";

const WORKSPACE_MANIFEST_FILE = "workspace-manifest.json";

export type WorkspaceCreationMember = "clean" | "imported";

export interface CleanWorkspaceCreatePacket {
  readonly kind: "workspace_create_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "clean";
  readonly targetRoot: string;
  readonly scaffoldPolicy: "none";
}

export interface ImportedWorkspaceCreatePacket {
  readonly kind: "workspace_create_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "imported";
  readonly targetRoot: string;
  readonly importAuthority: Readonly<{
    authorityRef: string;
    authorityDigest: Sha256Digest;
  }>;
  readonly preservationPolicy: "preserve_existing_project_truth";
}

export type WorkspaceCreatePacket =
  | CleanWorkspaceCreatePacket
  | ImportedWorkspaceCreatePacket;

export interface WorkspaceOpenPacket {
  readonly kind: "workspace_open_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "open";
  readonly targetRoot: string;
  readonly expectedWorkspaceAuthorityRef: string;
  readonly expectedWorkspaceAuthorityDigest: Sha256Digest;
}

export interface WorkspaceManifestAuthorityBasis {
  readonly kind: "workspace_authority_basis";
  readonly schemaVersion: "5.0.0";
  readonly authorityRef: string;
  readonly authorityDigest: Sha256Digest;
  readonly source: "clean_creation" | "admitted_import";
  readonly importAuthorityRef: string | null;
  readonly importAuthorityDigest: Sha256Digest | null;
}

export interface WorkspaceProvenanceCoordinate {
  readonly provenanceRef: string;
  readonly provenanceDigest: Sha256Digest;
}

export interface WorkspaceManifest {
  readonly kind: "workspace_manifest";
  readonly schemaVersion: "5.0.0";
  readonly workspaceRef: string;
  readonly workspaceDigest: Sha256Digest;
  readonly canonicalRoot: string;
  readonly authorityMode: WorkspaceCreationMember;
  readonly authorityBasis: WorkspaceManifestAuthorityBasis;
  readonly scaffoldPolicy: "none" | "not_applicable";
  readonly scaffoldState: "no_project_authority" | "preserved_project_authority";
  readonly preservationPolicy:
    | "not_applicable"
    | "preserve_existing_project_truth";
  readonly preservationState: "not_applicable" | "preserved";
  readonly creationManifestRef: string;
  readonly creationManifestDigest: Sha256Digest;
  readonly provenance: readonly WorkspaceProvenanceCoordinate[];
  readonly bindingRef: string | null;
  readonly bindingDigest: Sha256Digest | null;
  readonly configurationRef: string | null;
  readonly configurationDigest: Sha256Digest | null;
}

export interface WorkspaceCreateResult {
  readonly kind: "workspace_create_result";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "created";
  readonly manifestPath: string;
  readonly workspaceRef: string;
  readonly workspaceDigest: Sha256Digest;
  readonly workspaceAuthorityRef: string;
  readonly workspaceAuthorityDigest: Sha256Digest;
  readonly creationManifestRef: string;
  readonly creationManifestDigest: Sha256Digest;
  readonly provenance: readonly WorkspaceProvenanceCoordinate[];
  readonly manifest: WorkspaceManifest;
}

export type WorkspaceOpenDisposition =
  | "ready"
  | "unbound"
  | "stale"
  | "malformed"
  | "incompatible";

export type WorkspaceOpenResidualCode =
  | "binding_absent"
  | "manifest_json_malformed"
  | "manifest_shape_malformed"
  | "manifest_version_incompatible"
  | "workspace_authority_incompatible"
  | "workspace_state_stale";

export interface WorkspaceOpenResidual {
  readonly code: WorkspaceOpenResidualCode;
  readonly message: string;
}

export interface WorkspaceOpenProjection {
  readonly kind: "workspace_open_projection";
  readonly schemaVersion: "5.0.0";
  readonly disposition: WorkspaceOpenDisposition;
  readonly manifestPath: string;
  readonly workspaceRef: string | null;
  readonly workspaceDigest: Sha256Digest | null;
  readonly workspaceAuthorityRef: string | null;
  readonly workspaceAuthorityDigest: Sha256Digest | null;
  readonly authorityMode: WorkspaceCreationMember | null;
  readonly authorityBasis: WorkspaceManifestAuthorityBasis | null;
  readonly bindingRef: string | null;
  readonly bindingDigest: Sha256Digest | null;
  readonly configurationRef: string | null;
  readonly configurationDigest: Sha256Digest | null;
  readonly creationManifestRef: string | null;
  readonly creationManifestDigest: Sha256Digest | null;
  readonly provenance: readonly WorkspaceProvenanceCoordinate[];
  readonly residuals: readonly WorkspaceOpenResidual[];
  readonly manifest: WorkspaceManifest | null;
}

export type WorkspaceOperationRefusalCode =
  | "invalid_packet"
  | "target_missing"
  | "target_not_clean"
  | "target_not_directory"
  | "workspace_already_exists"
  | "workspace_manifest_missing"
  | "workspace_io_refusal";

export interface WorkspaceOperationRefusal {
  readonly kind: "workspace_operation_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly code: WorkspaceOperationRefusalCode;
  readonly message: string;
  readonly physicalEffect: PhysicalArtifactEffectEvidence | null;
}

export type WorkspaceCreateOperationResult =
  | WorkspaceCreateResult
  | WorkspaceOperationRefusal;

export type WorkspaceOpenOperationResult =
  | WorkspaceOpenProjection
  | WorkspaceOperationRefusal;

class WorkspaceCreatePhysicalRefusal extends TypeError {
  constructor(
    readonly code: Extract<WorkspaceOperationRefusalCode, "target_not_clean">,
    message: string,
  ) {
    super(message);
    this.name = "WorkspaceCreatePhysicalRefusal";
  }
}

function refusal(
  code: WorkspaceOperationRefusalCode,
  message: string,
  physicalEffect: PhysicalArtifactEffectEvidence | null = null,
): WorkspaceOperationRefusal {
  return deepFreeze({
    kind: "workspace_operation_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
    physicalEffect,
  });
}

function hasExactKeys(
  value: object,
  keys: readonly string[],
): boolean {
  return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isCleanCreatePacket(
  packet: WorkspaceCreatePacket,
): packet is CleanWorkspaceCreatePacket {
  return packet.memberKey === "clean" &&
    hasExactKeys(packet, [
      "kind",
      "memberKey",
      "scaffoldPolicy",
      "schemaVersion",
      "targetRoot",
    ]) && packet.scaffoldPolicy === "none";
}

function isImportedCreatePacket(
  packet: WorkspaceCreatePacket,
): packet is ImportedWorkspaceCreatePacket {
  return packet.memberKey === "imported" &&
    hasExactKeys(packet, [
      "importAuthority",
      "kind",
      "memberKey",
      "preservationPolicy",
      "schemaVersion",
      "targetRoot",
    ]) && packet.preservationPolicy === "preserve_existing_project_truth" &&
    isRecord(packet.importAuthority) &&
    hasExactKeys(packet.importAuthority, ["authorityDigest", "authorityRef"]) &&
    typeof packet.importAuthority.authorityRef === "string" &&
    packet.importAuthority.authorityRef.length > 0 &&
    isSha256Digest(packet.importAuthority.authorityDigest);
}

function constructAuthorityBasis(
  canonicalRoot: string,
  packet: WorkspaceCreatePacket,
): WorkspaceManifestAuthorityBasis {
  const body = packet.memberKey === "clean"
    ? {
        canonicalRoot,
        authorityMode: "clean" as const,
        scaffoldPolicy: packet.scaffoldPolicy,
      }
    : {
        canonicalRoot,
        authorityMode: "imported" as const,
        importAuthorityRef: packet.importAuthority.authorityRef,
        importAuthorityDigest: packet.importAuthority.authorityDigest,
        preservationPolicy: packet.preservationPolicy,
      };
  const authorityDigest = sha256Canonical(body as unknown as JsonValue);
  return deepFreeze({
    kind: "workspace_authority_basis" as const,
    schemaVersion: "5.0.0" as const,
    authorityRef:
      `workspace-authority://abiogenesis/${authorityDigest.slice("sha256:".length)}`,
    authorityDigest,
    source: packet.memberKey === "clean"
      ? "clean_creation" as const
      : "admitted_import" as const,
    importAuthorityRef: packet.memberKey === "clean"
      ? null
      : packet.importAuthority.authorityRef,
    importAuthorityDigest: packet.memberKey === "clean"
      ? null
      : packet.importAuthority.authorityDigest,
  });
}

function constructManifest(
  canonicalRoot: string,
  packet: WorkspaceCreatePacket,
): WorkspaceManifest {
  const authorityBasis = constructAuthorityBasis(canonicalRoot, packet);
  const workspaceDigest = sha256Canonical({
    canonicalRoot,
    authorityMode: packet.memberKey,
    authorityRef: authorityBasis.authorityRef,
    authorityDigest: authorityBasis.authorityDigest,
  });
  const workspaceRef =
    `workspace://abiogenesis/${workspaceDigest.slice("sha256:".length)}`;
  const scaffoldPolicy = packet.memberKey === "clean"
    ? packet.scaffoldPolicy
    : "not_applicable" as const;
  const scaffoldState = packet.memberKey === "clean"
    ? "no_project_authority" as const
    : "preserved_project_authority" as const;
  const preservationPolicy = packet.memberKey === "clean"
    ? "not_applicable" as const
    : packet.preservationPolicy;
  const preservationState = packet.memberKey === "clean"
    ? "not_applicable" as const
    : "preserved" as const;
  const creationBody = {
    workspaceRef,
    workspaceDigest,
    canonicalRoot,
    authorityMode: packet.memberKey,
    authorityRef: authorityBasis.authorityRef,
    authorityDigest: authorityBasis.authorityDigest,
    scaffoldPolicy,
    scaffoldState,
    preservationPolicy,
    preservationState,
  };
  const creationManifestDigest = sha256Canonical(
    creationBody as unknown as JsonValue,
  );
  const creationManifestRef =
    `workspace-creation://abiogenesis/${creationManifestDigest.slice("sha256:".length)}`;
  const provenance = [
    ...(packet.memberKey === "clean"
      ? []
      : [{
          provenanceRef: packet.importAuthority.authorityRef,
          provenanceDigest: packet.importAuthority.authorityDigest,
        }]),
    {
      provenanceRef: creationManifestRef,
      provenanceDigest: creationManifestDigest,
    },
  ].sort((left, right) =>
    left.provenanceRef < right.provenanceRef
      ? -1
      : left.provenanceRef > right.provenanceRef ? 1 : 0
  );
  return deepFreeze({
    kind: "workspace_manifest" as const,
    schemaVersion: "5.0.0" as const,
    workspaceRef,
    workspaceDigest,
    canonicalRoot,
    authorityMode: packet.memberKey,
    authorityBasis,
    scaffoldPolicy,
    scaffoldState,
    preservationPolicy,
    preservationState,
    creationManifestRef,
    creationManifestDigest,
    provenance,
    bindingRef: null,
    bindingDigest: null,
    configurationRef: null,
    configurationDigest: null,
  });
}

/** Pure Product owner reconstruction shared by open and read projections. */
export function reconstructWorkspaceManifest(
  value: unknown,
): WorkspaceManifest | null {
  if (!isRecord(value) || !hasExactKeys(value, [
    "authorityBasis",
    "authorityMode",
    "bindingDigest",
    "bindingRef",
    "canonicalRoot",
    "configurationDigest",
    "configurationRef",
    "creationManifestDigest",
    "creationManifestRef",
    "kind",
    "preservationPolicy",
    "preservationState",
    "provenance",
    "scaffoldPolicy",
    "scaffoldState",
    "schemaVersion",
    "workspaceDigest",
    "workspaceRef",
  ])) return null;
  if (
    value.kind !== "workspace_manifest" ||
    value.schemaVersion !== "5.0.0" ||
    typeof value.canonicalRoot !== "string" ||
    !isAbsolute(value.canonicalRoot) ||
    (value.authorityMode !== "clean" && value.authorityMode !== "imported") ||
    !isRecord(value.authorityBasis)
  ) return null;
  const authority = value.authorityBasis;
  if (
    !hasExactKeys(authority, [
      "authorityDigest",
      "authorityRef",
      "importAuthorityDigest",
      "importAuthorityRef",
      "kind",
      "schemaVersion",
      "source",
    ]) ||
    authority.kind !== "workspace_authority_basis" ||
    authority.schemaVersion !== "5.0.0" ||
    typeof authority.authorityRef !== "string" ||
    !isSha256Digest(authority.authorityDigest)
  ) return null;
  const packet: WorkspaceCreatePacket | null = value.authorityMode === "clean"
    ? {
        kind: "workspace_create_packet",
        schemaVersion: "5.0.0",
        memberKey: "clean",
        targetRoot: value.canonicalRoot,
        scaffoldPolicy: "none",
      }
    : typeof authority.importAuthorityRef === "string" &&
        isSha256Digest(authority.importAuthorityDigest)
      ? {
          kind: "workspace_create_packet",
          schemaVersion: "5.0.0",
          memberKey: "imported",
          targetRoot: value.canonicalRoot,
          importAuthority: {
            authorityRef: authority.importAuthorityRef,
            authorityDigest: authority.importAuthorityDigest,
          },
          preservationPolicy: "preserve_existing_project_truth",
        }
      : null;
  if (packet === null) return null;
  const expected = constructManifest(value.canonicalRoot, packet);
  const suppliedBindingPair =
    (typeof value.bindingRef === "string" &&
      isSha256Digest(value.bindingDigest)) ||
    (value.bindingRef === null && value.bindingDigest === null);
  const suppliedConfigurationPair =
    (typeof value.configurationRef === "string" &&
      isSha256Digest(value.configurationDigest)) ||
    (value.configurationRef === null && value.configurationDigest === null);
  if (!suppliedBindingPair || !suppliedConfigurationPair) return null;
  const comparable = {
    ...value,
    bindingRef: null,
    bindingDigest: null,
    configurationRef: null,
    configurationDigest: null,
  };
  return canonicalJson(comparable as JsonValue) ===
      canonicalJson(expected as unknown as JsonValue)
    ? deepFreeze(value as unknown as WorkspaceManifest)
    : null;
}

function openProjection(
  manifestPath: string,
  disposition: WorkspaceOpenDisposition,
  manifest: WorkspaceManifest | null,
  residuals: readonly WorkspaceOpenResidual[],
): WorkspaceOpenProjection {
  return deepFreeze({
    kind: "workspace_open_projection" as const,
    schemaVersion: "5.0.0" as const,
    disposition,
    manifestPath,
    workspaceRef: manifest?.workspaceRef ?? null,
    workspaceDigest: manifest?.workspaceDigest ?? null,
    workspaceAuthorityRef: manifest?.authorityBasis.authorityRef ?? null,
    workspaceAuthorityDigest: manifest?.authorityBasis.authorityDigest ?? null,
    authorityMode: manifest?.authorityMode ?? null,
    authorityBasis: manifest?.authorityBasis ?? null,
    bindingRef: manifest?.bindingRef ?? null,
    bindingDigest: manifest?.bindingDigest ?? null,
    configurationRef: manifest?.configurationRef ?? null,
    configurationDigest: manifest?.configurationDigest ?? null,
    creationManifestRef: manifest?.creationManifestRef ?? null,
    creationManifestDigest: manifest?.creationManifestDigest ?? null,
    provenance: manifest?.provenance ?? [],
    residuals,
    manifest,
  });
}

function hasPartialCoordinatePair(
  value: Readonly<Record<string, unknown>>,
  refName: string,
  digestName: string,
): boolean {
  if (!Object.hasOwn(value, refName) || !Object.hasOwn(value, digestName)) {
    return false;
  }
  const ref = value[refName];
  const digest = value[digestName];
  return !(
    (ref === null && digest === null) ||
    (typeof ref === "string" && ref.length > 0 && isSha256Digest(digest))
  );
}

async function pathDisposition(
  targetRoot: string,
): Promise<"absent" | "directory" | "other"> {
  try {
    return (await stat(targetRoot)).isDirectory() ? "directory" : "other";
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "ENOENT"
      ? "absent"
      : "other";
  }
}

export async function createWorkspace(
  packet: WorkspaceCreatePacket,
): Promise<WorkspaceCreateOperationResult> {
  if (
    !isRecord(packet) ||
    packet.kind !== "workspace_create_packet" ||
    packet.schemaVersion !== "5.0.0" ||
    typeof packet.targetRoot !== "string" ||
    packet.targetRoot.trim().length === 0 ||
    (!isCleanCreatePacket(packet) && !isImportedCreatePacket(packet))
  ) {
    return refusal(
      "invalid_packet",
      "workspace create requires one closed explicit authority and preservation policy packet",
    );
  }
  const targetRoot = resolve(packet.targetRoot);
  const disposition = await pathDisposition(targetRoot);
  if (disposition === "other") {
    return refusal("target_not_directory", "workspace target must be a directory");
  }
  if (packet.memberKey === "imported" && disposition === "absent") {
    return refusal("target_missing", "an imported workspace target must already exist");
  }
  const targetBefore = await observePhysicalArtifact(targetRoot);
  if (targetBefore.disposition === "observation_refused") {
    return refusal(
      "workspace_io_refusal",
      `workspace target could not be observed: ${targetBefore.observationFailure}`,
    );
  }
  if (
    targetBefore.disposition === "observed" &&
    targetBefore.inventory[0]?.artifactKind !== "directory"
  ) {
    return refusal(
      "target_not_directory",
      "workspace target must be one exact physical directory",
    );
  }
  let stagingRoot: string | null = null;
  let substrateRoot: string | null = null;
  let commitDisposition: "refused" | "committed" = "refused";
  let committedManifest: WorkspaceManifest | null = null;
  let committedManifestPath: string | null = null;
  const directEntriesBefore = targetBefore.disposition === "observed"
    ? targetBefore.inventory.flatMap((entry) =>
      entry.relativeLocator !== "." &&
        !entry.relativeLocator.includes("/")
        ? [entry.relativeLocator]
        : []
    ).sort()
    : [];
  if (directEntriesBefore.includes(".abiogenesis")) {
    return refusal(
      "workspace_already_exists",
      "workspace target already contains an ABIogenesis substrate",
    );
  }
  const physicalRefusal = async (
    error: unknown,
  ): Promise<WorkspaceOperationRefusal> => {
    const code = (error as NodeJS.ErrnoException).code;
    const ownedResidue = [
      ...(substrateRoot === null || commitDisposition !== "committed"
        ? []
        : [substrateRoot]),
      ...(stagingRoot === null ? [] : [stagingRoot]),
    ];
    const targetAtFailure = await observePhysicalArtifact(targetRoot);
    const stagingAtFailure = stagingRoot === null
      ? null
      : await observePhysicalArtifact(stagingRoot);
    const compensation = await preserveOwnedPhysicalResidue({
      owner: "workspace_create",
      targetRoot,
      stagingRoot,
      targetBefore,
      targetAtFailure,
      stagingAtFailure,
      ownedLocators: ownedResidue,
    });
    const targetAfter = await observePhysicalArtifact(targetRoot);
    const stagingAfter = stagingRoot === null
      ? null
      : await observePhysicalArtifact(stagingRoot);
    return refusal(
      error instanceof WorkspaceCreatePhysicalRefusal
        ? error.code
        : code === "EEXIST"
        ? "workspace_already_exists"
        : "workspace_io_refusal",
      error instanceof WorkspaceCreatePhysicalRefusal
        ? error.message
        : `workspace manifest construction failed: ${String(error)}`,
      physicalArtifactEffectEvidence(
        "workspace_create",
        targetRoot,
        stagingRoot,
        targetBefore,
        targetAtFailure,
        stagingAtFailure,
        compensation,
        targetAfter,
        stagingAfter,
      ),
    );
  };
  let canonicalRoot: string | null = null;
  try {
    if (
      packet.memberKey === "clean" &&
      disposition === "directory" &&
      (await readdir(targetRoot)).length !== 0
    ) {
      throw new WorkspaceCreatePhysicalRefusal(
        "target_not_clean",
        "a clean workspace target must be absent or empty",
      );
    }
    if (targetBefore.disposition === "absent") {
      await mkdir(targetRoot, { recursive: false });
    }
    canonicalRoot = await realpath(targetRoot);
    substrateRoot = join(targetRoot, ".abiogenesis");
    stagingRoot = await createPhysicalArtifactStagingRoot(
      targetRoot,
      "workspace_create",
    );
    const stagedSubstrateRoot = join(stagingRoot, ".abiogenesis");
    await mkdir(stagedSubstrateRoot, { recursive: false });
  } catch (error) {
    return await physicalRefusal(error);
  }
  if (canonicalRoot === null || stagingRoot === null || substrateRoot === null) {
    throw new TypeError("workspace staging completed without its exact projection basis");
  }

  const manifest = constructManifest(canonicalRoot, packet);
  const stagedSubstrateRoot = join(stagingRoot, ".abiogenesis");
  const stagedManifestPath = join(stagedSubstrateRoot, WORKSPACE_MANIFEST_FILE);
  const manifestPath = join(
    canonicalRoot,
    ".abiogenesis",
    WORKSPACE_MANIFEST_FILE,
  );
  const manifestBytes = `${canonicalJson(manifest as unknown as JsonValue)}\n`;
  try {
    await writeFile(
      stagedManifestPath,
      manifestBytes,
      { encoding: "utf8", flag: "wx" },
    );
    const currentTargetEntries = (await readdir(targetRoot)).sort();
    const expectedTargetEntries = [
      ...directEntriesBefore,
      basename(stagingRoot),
    ].sort();
    const currentStageEntries = (await readdir(stagingRoot)).sort();
    const currentSubstrateEntries = (await readdir(stagedSubstrateRoot)).sort();
    if (
      currentTargetEntries.join("\0") !== expectedTargetEntries.join("\0") ||
      currentStageEntries.join("\0") !== ".abiogenesis" ||
      currentSubstrateEntries.join("\0") !== WORKSPACE_MANIFEST_FILE ||
      await realpath(targetRoot) !== canonicalRoot
    ) {
      throw new WorkspaceCreatePhysicalRefusal(
        "target_not_clean",
        "workspace target or staging content changed before commit",
      );
    }
    await rename(stagedSubstrateRoot, substrateRoot);
    commitDisposition = "committed";
    await rmdir(stagingRoot);
    const committedEntries = (await readdir(targetRoot)).sort();
    const expectedCommittedEntries = [
      ...directEntriesBefore,
      ".abiogenesis",
    ].sort();
    if (
      committedEntries.join("\0") !== expectedCommittedEntries.join("\0") ||
      (await readdir(substrateRoot)).join("\0") !== WORKSPACE_MANIFEST_FILE
    ) {
      throw new WorkspaceCreatePhysicalRefusal(
        "target_not_clean",
        "workspace target changed during commit",
      );
    }
    committedManifest = manifest;
    committedManifestPath = manifestPath;
  } catch (error) {
    return await physicalRefusal(error);
  }
  if (committedManifest === null || committedManifestPath === null) {
    throw new TypeError("workspace commit completed without its Product result basis");
  }
  return deepFreeze({
    kind: "workspace_create_result" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "created" as const,
    manifestPath: committedManifestPath,
    workspaceRef: committedManifest.workspaceRef,
    workspaceDigest: committedManifest.workspaceDigest,
    workspaceAuthorityRef: committedManifest.authorityBasis.authorityRef,
    workspaceAuthorityDigest: committedManifest.authorityBasis.authorityDigest,
    creationManifestRef: committedManifest.creationManifestRef,
    creationManifestDigest: committedManifest.creationManifestDigest,
    provenance: committedManifest.provenance,
    manifest: committedManifest,
  });
}

export async function openWorkspace(
  packet: WorkspaceOpenPacket,
): Promise<WorkspaceOpenOperationResult> {
  if (
    !isRecord(packet) ||
    !hasExactKeys(packet, [
      "expectedWorkspaceAuthorityDigest",
      "expectedWorkspaceAuthorityRef",
      "kind",
      "memberKey",
      "schemaVersion",
      "targetRoot",
    ]) ||
    packet.kind !== "workspace_open_packet" ||
    packet.schemaVersion !== "5.0.0" ||
    packet.memberKey !== "open" ||
    typeof packet.targetRoot !== "string" ||
    packet.targetRoot.trim().length === 0 ||
    typeof packet.expectedWorkspaceAuthorityRef !== "string" ||
    packet.expectedWorkspaceAuthorityRef.length === 0 ||
    !isSha256Digest(packet.expectedWorkspaceAuthorityDigest)
  ) {
    return refusal(
      "invalid_packet",
      "workspace open requires one exact expected workspace authority",
    );
  }
  const targetRoot = resolve(packet.targetRoot);
  if (await pathDisposition(targetRoot) !== "directory") {
    return refusal("target_missing", "workspace open target is absent or not a directory");
  }
  const canonicalRoot = await realpath(targetRoot);
  const manifestPath = join(
    canonicalRoot,
    ".abiogenesis",
    WORKSPACE_MANIFEST_FILE,
  );
  let source: string;
  try {
    source = await readFile(manifestPath, "utf8");
  } catch (error) {
    return refusal(
      (error as NodeJS.ErrnoException).code === "ENOENT"
        ? "workspace_manifest_missing"
        : "workspace_io_refusal",
      `workspace manifest read failed: ${String(error)}`,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch {
    return openProjection(manifestPath, "malformed", null, [{
      code: "manifest_json_malformed",
      message: "workspace manifest is not JSON",
    }]);
  }
  if (
    isRecord(parsed) &&
    parsed.kind === "workspace_manifest" &&
    parsed.schemaVersion !== "5.0.0"
  ) {
    return openProjection(manifestPath, "incompatible", null, [{
      code: "manifest_version_incompatible",
      message: "workspace manifest belongs to an incompatible schema version",
    }]);
  }
  if (
    isRecord(parsed) &&
    (
      hasPartialCoordinatePair(parsed, "bindingRef", "bindingDigest") ||
      hasPartialCoordinatePair(
        parsed,
        "configurationRef",
        "configurationDigest",
      )
    )
  ) {
    return openProjection(manifestPath, "stale", null, [{
      code: "workspace_state_stale",
      message: "workspace binding or configuration coordinate is incomplete",
    }]);
  }
  const manifest = reconstructWorkspaceManifest(parsed);
  if (manifest === null) {
    return openProjection(manifestPath, "malformed", null, [{
      code: "manifest_shape_malformed",
      message: "workspace manifest is not one exact Product carrier",
    }]);
  }
  if (manifest.canonicalRoot !== canonicalRoot) {
    return openProjection(manifestPath, "stale", manifest, [{
      code: "workspace_state_stale",
      message: "workspace manifest canonical root differs from its opened location",
    }]);
  }
  if (
    manifest.authorityBasis.authorityRef !==
      packet.expectedWorkspaceAuthorityRef ||
    manifest.authorityBasis.authorityDigest !==
      packet.expectedWorkspaceAuthorityDigest
  ) {
    return openProjection(manifestPath, "incompatible", manifest, [{
      code: "workspace_authority_incompatible",
      message: "workspace manifest differs from the exact expected authority",
    }]);
  }
  if (manifest.bindingRef === null) {
    return openProjection(manifestPath, "unbound", manifest, [{
      code: "binding_absent",
      message: "workspace has no selected Product binding",
    }]);
  }
  return openProjection(manifestPath, "ready", manifest, []);
}

export const WorkspaceOperationPort = Object.freeze({
  create: createWorkspace,
  open: openWorkspace,
});

export const WORKSPACE_OPERATION_CONTRACTS = Object.freeze({
  create: Object.freeze({
    clean: WorkspaceOperationPort.create,
    imported: WorkspaceOperationPort.create,
  }),
  open: Object.freeze({
    open: WorkspaceOperationPort.open,
  }),
});
