import { isRecord, hasNulJoinedKeys as hasExactKeys } from "../shared/admission_predicates.js";
import { validateEventStoreCloseHandoff, } from "../abg/event_store.js";
import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const AUTHORITY_KEYS = Object.freeze([
    "authorityDigest",
    "catalogBasisDigest",
    "catalogReadinessBasis",
    "catalogViewAllowlist",
    "catalogViewDigest",
    "graphCallId",
    "install",
    "invocationAdmissionRef",
    "kind",
    "outputContractRef",
    "publicationDigests",
    "publications",
    "prefix",
    "reopenAuthority",
    "resultRef",
    "runId",
    "runtimeInvocationRef",
    "schemaVersion",
    "workspaceId",
    "workspaceBindingDigest",
    "workspaceBindingId",
]);
function isCanonicalCatalogViewAllowlist(value) {
    return Array.isArray(value) &&
        value.length > 0 &&
        value.every((entry) => typeof entry === "string" && entry.length > 0) &&
        value.every((entry, index) => index === 0 || compareUnicodeCodeUnits(value[index - 1], entry) < 0);
}
function authorityBody(input) {
    return {
        kind: "public_run_projection_authority",
        schemaVersion: "5.0.0",
        ...input,
    };
}
export function constructPublicRunProjectionAuthority(input) {
    if (!validateEventStoreCloseHandoff({
        prefix: input.prefix,
        reopenAuthority: input.reopenAuthority,
    })) {
        throw new TypeError("run projection authority requires one exact durable close pair");
    }
    if (!isCanonicalCatalogViewAllowlist(input.catalogViewAllowlist)) {
        throw new TypeError("run projection authority requires one canonical non-empty CatalogView allowlist");
    }
    const body = authorityBody(input);
    return deepFreeze(JSON.parse(canonicalJson({
        ...body,
        authorityDigest: sha256Canonical(body),
    })));
}
export function updatePublicRunProjectionAuthority(authority, handoff) {
    const { authorityDigest: _authorityDigest, kind: _kind, schemaVersion: _schemaVersion, ...input } = authority;
    return constructPublicRunProjectionAuthority({
        ...input,
        ...handoff,
    });
}
export function parsePublicRunProjectionAuthority(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, AUTHORITY_KEYS) ||
        value.kind !== "public_run_projection_authority" ||
        value.schemaVersion !== "5.0.0" ||
        typeof value.runtimeInvocationRef !== "string" ||
        value.runtimeInvocationRef.length === 0 ||
        typeof value.invocationAdmissionRef !== "string" ||
        value.invocationAdmissionRef.length === 0 ||
        typeof value.runId !== "string" ||
        value.runId.length === 0 ||
        !(value.graphCallId === null ||
            (typeof value.graphCallId === "string" &&
                value.graphCallId.length > 0)) ||
        !(value.resultRef === null ||
            (typeof value.resultRef === "string" && value.resultRef.length > 0)) ||
        typeof value.outputContractRef !== "string" ||
        value.outputContractRef.length === 0 ||
        !isRecord(value.install) ||
        value.install.kind !== "product_install" ||
        typeof value.workspaceId !== "string" ||
        value.workspaceId.length === 0 ||
        typeof value.workspaceBindingId !== "string" ||
        value.workspaceBindingId.length === 0 ||
        !isSha256Digest(value.workspaceBindingDigest) ||
        !isSha256Digest(value.catalogBasisDigest) ||
        !isRecord(value.catalogReadinessBasis) ||
        !isCanonicalCatalogViewAllowlist(value.catalogViewAllowlist) ||
        !isSha256Digest(value.catalogViewDigest) ||
        !Array.isArray(value.publicationDigests) ||
        value.publicationDigests.length === 0 ||
        !value.publicationDigests.every(isSha256Digest) ||
        !Array.isArray(value.publications) ||
        value.publications.length === 0 ||
        !value.publications.every((publication) => isRecord(publication) && publication.kind === "module_publication") ||
        !isRecord(value.reopenAuthority) ||
        value.reopenAuthority.kind !== "event_store_reopen_authority" ||
        !validateEventStoreCloseHandoff({
            prefix: value.prefix,
            reopenAuthority: value.reopenAuthority,
        }) ||
        !isSha256Digest(value.authorityDigest)) {
        return null;
    }
    const { authorityDigest, ...body } = value;
    try {
        if (sha256Canonical(body) !== authorityDigest) {
            return null;
        }
        return deepFreeze(JSON.parse(canonicalJson(value)));
    }
    catch {
        return null;
    }
}
