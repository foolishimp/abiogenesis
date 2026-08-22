import {
  mkdir,
  readFile,
  readdir,
  realpath,
  stat,
  writeFile,
} from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";

import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import {
  isSha256Digest,
  sha256Canonical,
  type Sha256Digest,
} from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";

const WORKSPACE_MANIFEST_FILE = "workspace-manifest.json";

export type WorkspaceCreationMember = "clean" | "imported";

/**
 * The actor is deliberately a coordinate, not a new workspace identity
 * authority.  The Product-created attribution carries the predecessor
 * development context that selected it.
 */
export interface WorkspaceManifestActor {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

export interface WorkspaceManifestActorAttribution {
  readonly ref: string;
  readonly digest: Sha256Digest;
}

export interface CleanWorkspaceCreatePacket {
  readonly kind: "workspace_create_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "clean";
  readonly targetRoot: string;
  readonly scaffoldPolicy: "none";
  readonly actor: WorkspaceManifestActor;
  readonly actorAttribution: WorkspaceManifestActorAttribution;
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
  readonly authorizedActorRef: string | null;
  readonly actorAttributionRef: string | null;
  readonly actorAttributionDigest: Sha256Digest | null;
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
  readonly actor: WorkspaceManifestActor | null;
  readonly actorAttribution: WorkspaceManifestActorAttribution | null;
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
}

export type WorkspaceCreateOperationResult =
  | WorkspaceCreateResult
  | WorkspaceOperationRefusal;

export type WorkspaceOpenOperationResult =
  | WorkspaceOpenProjection
  | WorkspaceOperationRefusal;

function refusal(
  code: WorkspaceOperationRefusalCode,
  message: string,
): WorkspaceOperationRefusal {
  return deepFreeze({
    kind: "workspace_operation_refusal" as const,
    schemaVersion: "5.0.0" as const,
    disposition: "refused" as const,
    code,
    message,
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

function isCoordinate(value: unknown): value is WorkspaceManifestActor {
  return isRecord(value) &&
    hasExactKeys(value, ["digest", "ref"]) &&
    typeof value.ref === "string" && value.ref.length > 0 &&
    isSha256Digest(value.digest);
}

function isCanonicalActor(value: unknown): value is WorkspaceManifestActor {
  return isCoordinate(value) && value.digest === sha256Canonical({
    actorRef: value.ref,
  });
}

function isCleanCreatePacket(
  packet: WorkspaceCreatePacket,
): packet is CleanWorkspaceCreatePacket {
  return packet.memberKey === "clean" &&
    hasExactKeys(packet, [
        "kind",
        "memberKey",
        "actor",
        "actorAttribution",
        "scaffoldPolicy",
        "schemaVersion",
        "targetRoot",
    ]) && packet.scaffoldPolicy === "none" &&
    isCanonicalActor(packet.actor) && isCoordinate(packet.actorAttribution);
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
        authorizedActorRef: packet.actor.ref,
        actorAttributionRef: packet.actorAttribution.ref,
        actorAttributionDigest: packet.actorAttribution.digest,
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
    authorizedActorRef: packet.memberKey === "clean" ? packet.actor.ref : null,
    actorAttributionRef: packet.memberKey === "clean"
      ? packet.actorAttribution.ref
      : null,
    actorAttributionDigest: packet.memberKey === "clean"
      ? packet.actorAttribution.digest
      : null,
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
    actor: packet.memberKey === "clean" ? packet.actor : null,
    actorAttribution: packet.memberKey === "clean" ? packet.actorAttribution : null,
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
    actor: packet.memberKey === "clean" ? packet.actor : null,
    actorAttribution: packet.memberKey === "clean" ? packet.actorAttribution : null,
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
    "actor",
    "actorAttribution",
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
      "actorAttributionDigest",
      "actorAttributionRef",
      "authorizedActorRef",
      "importAuthorityDigest",
      "importAuthorityRef",
      "kind",
      "schemaVersion",
      "source",
    ]) ||
    authority.kind !== "workspace_authority_basis" ||
    authority.schemaVersion !== "5.0.0" ||
    typeof authority.authorityRef !== "string" ||
    !isSha256Digest(authority.authorityDigest) ||
    !(
      (authority.authorizedActorRef === null &&
        authority.actorAttributionRef === null &&
        authority.actorAttributionDigest === null) ||
      (typeof authority.authorizedActorRef === "string" &&
        authority.authorizedActorRef.length > 0 &&
        typeof authority.actorAttributionRef === "string" &&
        authority.actorAttributionRef.length > 0 &&
        isSha256Digest(authority.actorAttributionDigest))
    )
  ) return null;
  const packet: WorkspaceCreatePacket | null = value.authorityMode === "clean"
    ? isCanonicalActor(value.actor) && isCoordinate(value.actorAttribution) &&
        authority.authorizedActorRef === value.actor.ref &&
        authority.actorAttributionRef === value.actorAttribution.ref &&
        authority.actorAttributionDigest === value.actorAttribution.digest
      ? {
        kind: "workspace_create_packet",
        schemaVersion: "5.0.0",
        memberKey: "clean",
        targetRoot: value.canonicalRoot,
        scaffoldPolicy: "none",
        actor: value.actor,
        actorAttribution: value.actorAttribution,
      }
      : null
    : typeof authority.importAuthorityRef === "string" &&
        isSha256Digest(authority.importAuthorityDigest) &&
        value.actor === null && value.actorAttribution === null &&
        authority.authorizedActorRef === null &&
        authority.actorAttributionRef === null &&
        authority.actorAttributionDigest === null
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
  if (
    packet.memberKey === "clean" &&
    disposition === "directory" &&
    (await readdir(targetRoot)).length !== 0
  ) {
    return refusal("target_not_clean", "a clean workspace target must be absent or empty");
  }
  try {
    await mkdir(targetRoot, { recursive: true });
    const canonicalRoot = await realpath(targetRoot);
    const substrateRoot = join(canonicalRoot, ".abiogenesis");
    await mkdir(substrateRoot, { recursive: false });
    const manifest = constructManifest(canonicalRoot, packet);
    const manifestPath = join(substrateRoot, WORKSPACE_MANIFEST_FILE);
    await writeFile(
      manifestPath,
      `${canonicalJson(manifest as unknown as JsonValue)}\n`,
      { encoding: "utf8", flag: "wx" },
    );
    return deepFreeze({
      kind: "workspace_create_result" as const,
      schemaVersion: "5.0.0" as const,
      disposition: "created" as const,
      manifestPath,
      workspaceRef: manifest.workspaceRef,
      workspaceDigest: manifest.workspaceDigest,
      workspaceAuthorityRef: manifest.authorityBasis.authorityRef,
      workspaceAuthorityDigest: manifest.authorityBasis.authorityDigest,
      creationManifestRef: manifest.creationManifestRef,
      creationManifestDigest: manifest.creationManifestDigest,
      provenance: manifest.provenance,
      manifest,
    });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return refusal(
      code === "EEXIST" ? "workspace_already_exists" : "workspace_io_refusal",
      `workspace manifest construction failed: ${String(error)}`,
    );
  }
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
