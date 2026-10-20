import { isRecord } from "../shared/admission_predicates.js";
import { mkdir, readFile, readdir, realpath, stat, writeFile, } from "node:fs/promises";
import { isAbsolute, join, resolve } from "node:path";
import { canonicalJson } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const WORKSPACE_MANIFEST_FILE = "workspace-manifest.json";
function refusal(code, message) {
    return deepFreeze({
        kind: "workspace_operation_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    });
}
function hasExactKeys(value, keys) {
    return Object.keys(value).sort().join("\0") === [...keys].sort().join("\0");
}
function isCleanCreatePacket(packet) {
    return packet.memberKey === "clean" &&
        hasExactKeys(packet, [
            "kind",
            "memberKey",
            "scaffoldPolicy",
            "schemaVersion",
            "targetRoot",
        ]) && packet.scaffoldPolicy === "none";
}
function isImportedCreatePacket(packet) {
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
function constructAuthorityBasis(canonicalRoot, packet) {
    const body = packet.memberKey === "clean"
        ? {
            canonicalRoot,
            authorityMode: "clean",
            scaffoldPolicy: packet.scaffoldPolicy,
        }
        : {
            canonicalRoot,
            authorityMode: "imported",
            importAuthorityRef: packet.importAuthority.authorityRef,
            importAuthorityDigest: packet.importAuthority.authorityDigest,
            preservationPolicy: packet.preservationPolicy,
        };
    const authorityDigest = sha256Canonical(body);
    return deepFreeze({
        kind: "workspace_authority_basis",
        schemaVersion: "5.0.0",
        authorityRef: `workspace-authority://abiogenesis/${authorityDigest.slice("sha256:".length)}`,
        authorityDigest,
        source: packet.memberKey === "clean"
            ? "clean_creation"
            : "admitted_import",
        importAuthorityRef: packet.memberKey === "clean"
            ? null
            : packet.importAuthority.authorityRef,
        importAuthorityDigest: packet.memberKey === "clean"
            ? null
            : packet.importAuthority.authorityDigest,
    });
}
function constructManifest(canonicalRoot, packet) {
    const authorityBasis = constructAuthorityBasis(canonicalRoot, packet);
    const workspaceDigest = sha256Canonical({
        canonicalRoot,
        authorityMode: packet.memberKey,
        authorityRef: authorityBasis.authorityRef,
        authorityDigest: authorityBasis.authorityDigest,
    });
    const workspaceRef = `workspace://abiogenesis/${workspaceDigest.slice("sha256:".length)}`;
    const scaffoldPolicy = packet.memberKey === "clean"
        ? packet.scaffoldPolicy
        : "not_applicable";
    const scaffoldState = packet.memberKey === "clean"
        ? "no_project_authority"
        : "preserved_project_authority";
    const preservationPolicy = packet.memberKey === "clean"
        ? "not_applicable"
        : packet.preservationPolicy;
    const preservationState = packet.memberKey === "clean"
        ? "not_applicable"
        : "preserved";
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
    const creationManifestDigest = sha256Canonical(creationBody);
    const creationManifestRef = `workspace-creation://abiogenesis/${creationManifestDigest.slice("sha256:".length)}`;
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
    ].sort((left, right) => left.provenanceRef < right.provenanceRef
        ? -1
        : left.provenanceRef > right.provenanceRef ? 1 : 0);
    return deepFreeze({
        kind: "workspace_manifest",
        schemaVersion: "5.0.0",
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
export function reconstructWorkspaceManifest(value) {
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
    ]))
        return null;
    if (value.kind !== "workspace_manifest" ||
        value.schemaVersion !== "5.0.0" ||
        typeof value.canonicalRoot !== "string" ||
        !isAbsolute(value.canonicalRoot) ||
        (value.authorityMode !== "clean" && value.authorityMode !== "imported") ||
        !isRecord(value.authorityBasis))
        return null;
    const authority = value.authorityBasis;
    if (!hasExactKeys(authority, [
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
        !isSha256Digest(authority.authorityDigest))
        return null;
    const packet = value.authorityMode === "clean"
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
    if (packet === null)
        return null;
    const expected = constructManifest(value.canonicalRoot, packet);
    const suppliedBindingPair = (typeof value.bindingRef === "string" &&
        isSha256Digest(value.bindingDigest)) ||
        (value.bindingRef === null && value.bindingDigest === null);
    const suppliedConfigurationPair = (typeof value.configurationRef === "string" &&
        isSha256Digest(value.configurationDigest)) ||
        (value.configurationRef === null && value.configurationDigest === null);
    if (!suppliedBindingPair || !suppliedConfigurationPair)
        return null;
    const comparable = {
        ...value,
        bindingRef: null,
        bindingDigest: null,
        configurationRef: null,
        configurationDigest: null,
    };
    return canonicalJson(comparable) ===
        canonicalJson(expected)
        ? deepFreeze(value)
        : null;
}
function openProjection(manifestPath, disposition, manifest, residuals) {
    return deepFreeze({
        kind: "workspace_open_projection",
        schemaVersion: "5.0.0",
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
function hasPartialCoordinatePair(value, refName, digestName) {
    if (!Object.hasOwn(value, refName) || !Object.hasOwn(value, digestName)) {
        return false;
    }
    const ref = value[refName];
    const digest = value[digestName];
    return !((ref === null && digest === null) ||
        (typeof ref === "string" && ref.length > 0 && isSha256Digest(digest)));
}
async function pathDisposition(targetRoot) {
    try {
        return (await stat(targetRoot)).isDirectory() ? "directory" : "other";
    }
    catch (error) {
        return error.code === "ENOENT"
            ? "absent"
            : "other";
    }
}
export async function createWorkspace(packet) {
    if (!isRecord(packet) ||
        packet.kind !== "workspace_create_packet" ||
        packet.schemaVersion !== "5.0.0" ||
        typeof packet.targetRoot !== "string" ||
        packet.targetRoot.trim().length === 0 ||
        (!isCleanCreatePacket(packet) && !isImportedCreatePacket(packet))) {
        return refusal("invalid_packet", "workspace create requires one closed explicit authority and preservation policy packet");
    }
    const targetRoot = resolve(packet.targetRoot);
    const disposition = await pathDisposition(targetRoot);
    if (disposition === "other") {
        return refusal("target_not_directory", "workspace target must be a directory");
    }
    if (packet.memberKey === "imported" && disposition === "absent") {
        return refusal("target_missing", "an imported workspace target must already exist");
    }
    if (packet.memberKey === "clean" &&
        disposition === "directory" &&
        (await readdir(targetRoot)).length !== 0) {
        return refusal("target_not_clean", "a clean workspace target must be absent or empty");
    }
    try {
        await mkdir(targetRoot, { recursive: true });
        const canonicalRoot = await realpath(targetRoot);
        const substrateRoot = join(canonicalRoot, ".abiogenesis");
        await mkdir(substrateRoot, { recursive: false });
        const manifest = constructManifest(canonicalRoot, packet);
        const manifestPath = join(substrateRoot, WORKSPACE_MANIFEST_FILE);
        await writeFile(manifestPath, `${canonicalJson(manifest)}\n`, { encoding: "utf8", flag: "wx" });
        return deepFreeze({
            kind: "workspace_create_result",
            schemaVersion: "5.0.0",
            disposition: "created",
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
    }
    catch (error) {
        const code = error.code;
        return refusal(code === "EEXIST" ? "workspace_already_exists" : "workspace_io_refusal", `workspace manifest construction failed: ${String(error)}`);
    }
}
export async function openWorkspace(packet) {
    if (!isRecord(packet) ||
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
        !isSha256Digest(packet.expectedWorkspaceAuthorityDigest)) {
        return refusal("invalid_packet", "workspace open requires one exact expected workspace authority");
    }
    const targetRoot = resolve(packet.targetRoot);
    if (await pathDisposition(targetRoot) !== "directory") {
        return refusal("target_missing", "workspace open target is absent or not a directory");
    }
    const canonicalRoot = await realpath(targetRoot);
    const manifestPath = join(canonicalRoot, ".abiogenesis", WORKSPACE_MANIFEST_FILE);
    let source;
    try {
        source = await readFile(manifestPath, "utf8");
    }
    catch (error) {
        return refusal(error.code === "ENOENT"
            ? "workspace_manifest_missing"
            : "workspace_io_refusal", `workspace manifest read failed: ${String(error)}`);
    }
    let parsed;
    try {
        parsed = JSON.parse(source);
    }
    catch {
        return openProjection(manifestPath, "malformed", null, [{
                code: "manifest_json_malformed",
                message: "workspace manifest is not JSON",
            }]);
    }
    if (isRecord(parsed) &&
        parsed.kind === "workspace_manifest" &&
        parsed.schemaVersion !== "5.0.0") {
        return openProjection(manifestPath, "incompatible", null, [{
                code: "manifest_version_incompatible",
                message: "workspace manifest belongs to an incompatible schema version",
            }]);
    }
    if (isRecord(parsed) &&
        (hasPartialCoordinatePair(parsed, "bindingRef", "bindingDigest") ||
            hasPartialCoordinatePair(parsed, "configurationRef", "configurationDigest"))) {
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
    if (manifest.authorityBasis.authorityRef !==
        packet.expectedWorkspaceAuthorityRef ||
        manifest.authorityBasis.authorityDigest !==
            packet.expectedWorkspaceAuthorityDigest) {
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
