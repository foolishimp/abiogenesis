import { isRecord, hasNulJoinedKeys as hasExactKeys, isNonEmptyString as nonEmptyString } from "../shared/admission_predicates.js";
import { validateEventStoreCloseHandoff, } from "../abg/event_store.js";
import { isProductSet, isResolvedProductLock, } from "../product/index.js";
import { canonicalJson, } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const AUTHORITY_KEYS = Object.freeze([
    "authorityDigest",
    "catalog",
    "catalogView",
    "install",
    "installInvocationRef",
    "kind",
    "productSet",
    "prefix",
    "publications",
    "publicStart",
    "reopenAuthority",
    "resolvedProductLock",
    "schemaVersion",
    "source",
    "workspaceBinding",
    "workspaceBindingInvocationRef",
]);
const PUBLIC_START_KEYS = Object.freeze([
    "graphFunctionRef",
    "kind",
    "programRef",
    "rootMode",
    "schemaVersion",
    "scope",
    "startRef",
    "target",
    "until",
]);
const SOURCE_KEYS = Object.freeze([
    "gapRef",
    "nextActionProjection",
    "nextActionProjectionDigest",
    "nextActionProjectionRef",
    "sourceInvocationAdmissionRef",
    "sourceInvocationRef",
    "sourceRouteDigest",
    "sourceRouteEventRef",
    "sourceRouteRef",
    "sourceRunId",
    "sourceRunStoppedEventRef",
]);
function authorityBody(input) {
    return {
        kind: "public_gap_authority",
        schemaVersion: "5.0.0",
        ...input,
    };
}
export function constructPublicGapAuthority(input) {
    if (!validateEventStoreCloseHandoff({
        prefix: input.prefix,
        reopenAuthority: input.reopenAuthority,
    })) {
        throw new TypeError("gap authority requires one exact durable close pair");
    }
    const body = authorityBody(input);
    return deepFreeze(JSON.parse(canonicalJson({
        ...body,
        authorityDigest: sha256Canonical(body),
    })));
}
export function updatePublicGapAuthority(authority, handoff) {
    const { authorityDigest: _authorityDigest, kind: _kind, schemaVersion: _schemaVersion, ...input } = authority;
    return constructPublicGapAuthority({
        ...input,
        ...handoff,
    });
}
export function parsePublicGapAuthority(value, expectedGapRef) {
    if (!isRecord(value) ||
        !hasExactKeys(value, AUTHORITY_KEYS) ||
        value.kind !== "public_gap_authority" ||
        value.schemaVersion !== "5.0.0" ||
        !isRecord(value.reopenAuthority) ||
        value.reopenAuthority.kind !== "event_store_reopen_authority" ||
        !validateEventStoreCloseHandoff({
            prefix: value.prefix,
            reopenAuthority: value.reopenAuthority,
        }) ||
        !nonEmptyString(value.installInvocationRef) ||
        !nonEmptyString(value.workspaceBindingInvocationRef) ||
        !isRecord(value.install) ||
        value.install.kind !== "product_install" ||
        !isResolvedProductLock(value.resolvedProductLock) ||
        !isProductSet(value.productSet, value.resolvedProductLock) ||
        !isRecord(value.workspaceBinding) ||
        value.workspaceBinding.kind !== "workspace_binding" ||
        !isRecord(value.catalog) ||
        value.catalog.kind !== "graph_function_catalog" ||
        !isRecord(value.catalogView) ||
        value.catalogView.kind !== "graph_function_catalog_view" ||
        !Array.isArray(value.publications) ||
        value.publications.length === 0 ||
        !value.publications.every((publication) => isRecord(publication) && publication.kind === "module_publication") ||
        !isRecord(value.publicStart) ||
        !hasExactKeys(value.publicStart, PUBLIC_START_KEYS) ||
        value.publicStart.kind !== "public_start_identity" ||
        value.publicStart.schemaVersion !== "5.0.0" ||
        !nonEmptyString(value.publicStart.programRef) ||
        !nonEmptyString(value.publicStart.graphFunctionRef) ||
        !nonEmptyString(value.publicStart.startRef) ||
        value.publicStart.scope !== "program" ||
        value.publicStart.target !== value.publicStart.startRef ||
        value.publicStart.until !== "converged" ||
        value.publicStart.rootMode !== "supervised" ||
        !isRecord(value.source) ||
        !hasExactKeys(value.source, SOURCE_KEYS) ||
        !nonEmptyString(value.source.sourceInvocationRef) ||
        !nonEmptyString(value.source.sourceInvocationAdmissionRef) ||
        !nonEmptyString(value.source.sourceRunId) ||
        !nonEmptyString(value.source.sourceRouteRef) ||
        !isSha256Digest(value.source.sourceRouteDigest) ||
        !nonEmptyString(value.source.sourceRouteEventRef) ||
        !nonEmptyString(value.source.sourceRunStoppedEventRef) ||
        !nonEmptyString(value.source.gapRef) ||
        (expectedGapRef !== undefined &&
            value.source.gapRef !== expectedGapRef) ||
        !nonEmptyString(value.source.nextActionProjectionRef) ||
        !isSha256Digest(value.source.nextActionProjectionDigest) ||
        !isRecord(value.source.nextActionProjection) ||
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
