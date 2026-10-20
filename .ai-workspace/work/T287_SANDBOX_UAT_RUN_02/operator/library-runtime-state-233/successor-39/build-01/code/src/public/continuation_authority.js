import { isRecord, hasNulJoinedKeys as hasExactKeys } from "../shared/admission_predicates.js";
import { validateEventStoreCloseHandoff, } from "../abg/event_store.js";
import { canonicalJson, } from "../shared/canonical_json.js";
import { isSha256Digest, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
const AUTHORITY_KEYS = Object.freeze([
    "authorityDigest",
    "catalog",
    "catalogView",
    "closureContract",
    "continuationRef",
    "graph",
    "heldClosureContract",
    "heldGraph",
    "install",
    "invocationInput",
    "invocationAdmissionRef",
    "kind",
    "outputContractRef",
    "program",
    "publications",
    "reopenAuthority",
    "runId",
    "runtimeInvocationRef",
    "schemaVersion",
    "workspaceBinding",
    "parentSuspensions",
    "prefix",
]);
function authorityBody(input) {
    return {
        kind: "public_continuation_authority",
        schemaVersion: "5.0.0",
        ...input,
    };
}
export function constructPublicContinuationAuthority(input) {
    if (!validateEventStoreCloseHandoff({
        prefix: input.prefix,
        reopenAuthority: input.reopenAuthority,
    })) {
        throw new TypeError("continuation authority requires one exact durable close pair");
    }
    const body = authorityBody(input);
    return deepFreeze(JSON.parse(canonicalJson({
        ...body,
        authorityDigest: sha256Canonical(body),
    })));
}
export function updatePublicContinuationAuthority(authority, handoff) {
    const { authorityDigest: _authorityDigest, kind: _kind, schemaVersion: _schemaVersion, ...input } = authority;
    return constructPublicContinuationAuthority({
        ...input,
        ...handoff,
    });
}
export function parsePublicContinuationAuthority(value, expectedContinuationRef) {
    if (!isRecord(value) ||
        !hasExactKeys(value, AUTHORITY_KEYS) ||
        value.kind !== "public_continuation_authority" ||
        value.schemaVersion !== "5.0.0" ||
        value.continuationRef !== expectedContinuationRef ||
        typeof value.runtimeInvocationRef !== "string" ||
        value.runtimeInvocationRef.length === 0 ||
        typeof value.outputContractRef !== "string" ||
        value.outputContractRef.length === 0 ||
        typeof value.invocationAdmissionRef !== "string" ||
        value.invocationAdmissionRef.length === 0 ||
        typeof value.runId !== "string" ||
        value.runId.length === 0 ||
        !isRecord(value.reopenAuthority) ||
        value.reopenAuthority.kind !== "event_store_reopen_authority" ||
        !validateEventStoreCloseHandoff({
            prefix: value.prefix,
            reopenAuthority: value.reopenAuthority,
        }) ||
        !isRecord(value.install) ||
        value.install.kind !== "product_install" ||
        !isRecord(value.workspaceBinding) ||
        value.workspaceBinding.kind !== "workspace_binding" ||
        !isRecord(value.catalog) ||
        value.catalog.kind !== "graph_function_catalog" ||
        !isRecord(value.catalogView) ||
        value.catalogView.kind !== "graph_function_catalog_view" ||
        !Array.isArray(value.publications) ||
        value.publications.length === 0 ||
        !value.publications.every((publication) => isRecord(publication) && publication.kind === "module_publication") ||
        !isRecord(value.program) ||
        value.program.kind !== "gtl_program" ||
        !isRecord(value.graph) ||
        value.graph.kind !== "gtl_graph" ||
        !isRecord(value.heldGraph) ||
        value.heldGraph.kind !== "gtl_graph" ||
        !isRecord(value.heldClosureContract) ||
        value.heldClosureContract.kind !== "closure_contract" ||
        !Array.isArray(value.parentSuspensions) ||
        !value.parentSuspensions.every((suspension) => isRecord(suspension) &&
            [
                "held_recursion_suspension",
                "held_workflow_suspension",
            ].includes(String(suspension.kind)) &&
            suspension.schemaVersion === "5.0.0") ||
        !isRecord(value.invocationInput) ||
        !isRecord(value.closureContract) ||
        value.closureContract.kind !== "closure_contract" ||
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
