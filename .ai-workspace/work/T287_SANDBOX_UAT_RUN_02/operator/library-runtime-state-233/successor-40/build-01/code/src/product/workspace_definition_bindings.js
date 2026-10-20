import { withAdmissionAuthority } from "./admission_authority.js";
import * as Effect from "effect/Effect";
import { canonicalJson } from "../shared/canonical_json.js";
import {} from "../shared/effect_definition.js";
import { admitRuntimeContract, } from "../shared/public_function_contracts.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { WORKSPACE_OPERATION_CONTRACTS } from "./workspace_operation_contracts.js";
import { WorkspaceOperationPort, } from "./workspace_operations.js";
function targetRootDigest(targetRoot) {
    return sha256Canonical({ kind: "workspace_target", targetRoot });
}
function fault(definitionKey, code, message) {
    return deepFreeze({
        kind: "definition_execution_fault",
        schemaVersion: "5.0.0",
        definitionKey,
        stage: "resource_admission",
        code,
        message,
        evidence: {},
    });
}
function validateResources(call) {
    let encoded;
    try {
        encoded = canonicalJson(call.resources);
    }
    catch {
        return fault(call.invocation.definitionKey, "invalid_resource_assertion", "workspace resources must be one exact I-JSON assertion");
    }
    const expected = {
        kind: "workspace_resource_assertion",
        schemaVersion: "5.0.0",
        targetRoot: call.invocation.request.targetRoot,
        targetRootDigest: targetRootDigest(call.invocation.request.targetRoot),
    };
    return encoded === canonicalJson(expected)
        ? null
        : fault(call.invocation.definitionKey, "resource_relation_mismatch", "workspace resource assertion differs from the admitted semantic target");
}
function createRefusalCode(result) {
    if (result.kind !== "workspace_operation_refusal") {
        throw new TypeError("workspace refusal projection requires an owner refusal");
    }
    switch (result.code) {
        case "invalid_packet":
            return "invalid_target";
        case "target_missing":
            return "invalid_target";
        case "target_not_clean":
            return "workspace_exists";
        case "target_not_directory":
            return "invalid_target";
        case "workspace_already_exists":
            return "workspace_exists";
        case "workspace_manifest_missing":
            return "invalid_target";
        case "workspace_io_refusal":
            return "filesystem_failure";
    }
}
function openRefusalCode(result) {
    if (result.kind !== "workspace_operation_refusal") {
        throw new TypeError("workspace refusal projection requires an owner refusal");
    }
    return result.code === "workspace_manifest_missing"
        ? "missing_workspace"
        : "invalid_target";
}
function validatedOutput(packet, output) {
    const schema = output.outcomeKind === "result"
        ? packet.resultSchema
        : output.outcomeKind === "refusal"
            ? packet.refusalSchema
            : packet.nonTerminalSchema;
    if (schema === null || admitRuntimeContract(schema, output.value).disposition !== "admitted") {
        throw new TypeError("workspace owner output differs from its exact contract");
    }
    return output;
}
function receipt(resources, result) {
    const manifest = result.kind === "workspace_create_result"
        ? {
            locator: result.manifestPath,
            valueDigest: sha256Canonical(result.manifest),
        }
        : result.kind === "workspace_open_projection" && result.manifest !== null
            ? {
                locator: result.manifestPath,
                valueDigest: sha256Canonical(result.manifest),
            }
            : null;
    return deepFreeze({
        kind: "workspace_resource_receipt",
        schemaVersion: "5.0.0",
        targetRoot: resources.targetRoot,
        targetRootDigest: resources.targetRootDigest,
        manifest,
    });
}
function reference(ref, digest) {
    return { ref, digest };
}
function createBinding(packet) {
    return (call) => {
        const resourceFault = validateResources(call);
        if (resourceFault !== null)
            return Effect.fail(resourceFault);
        const request = call.invocation.request;
        if (request.createPolicy === "clean" && request.scaffoldPolicy === "root_layout") {
            const ownerOutput = validatedOutput(packet, {
                outcomeKind: "refusal",
                value: {
                    code: "invalid_scaffold",
                    issuePaths: ["/scaffoldPolicy"],
                    evidenceRefs: [],
                },
            });
            return Effect.succeed(deepFreeze({
                ownerOutput,
                resources: receipt(call.resources, {
                    kind: "workspace_operation_refusal",
                    schemaVersion: "5.0.0",
                    disposition: "refused",
                    code: "invalid_packet",
                    message: "root-layout scaffolding is not available in this owner",
                }),
            }));
        }
        const nativePacket = request.createPolicy === "clean"
            ? {
                kind: "workspace_create_packet",
                schemaVersion: "5.0.0",
                memberKey: "clean",
                targetRoot: request.targetRoot,
                scaffoldPolicy: "none",
            }
            : {
                kind: "workspace_create_packet",
                schemaVersion: "5.0.0",
                memberKey: "imported",
                targetRoot: request.targetRoot,
                importAuthority: {
                    authorityRef: request.importAuthority.ref,
                    authorityDigest: request.importAuthority.digest,
                },
                preservationPolicy: "preserve_existing_project_truth",
            };
        return Effect.tryPromise({
            try: () => WorkspaceOperationPort.create(nativePacket),
            catch: (cause) => fault(call.invocation.definitionKey, "workspace_execution_failure", String(cause)),
        }).pipe(Effect.map((nativeResult) => {
            const ownerOutput = nativeResult.kind === "workspace_create_result"
                ? validatedOutput(packet, {
                    outcomeKind: "result",
                    value: {
                        createPolicy: request.createPolicy,
                        workspace: reference(nativeResult.workspaceRef, nativeResult.workspaceDigest),
                        authorityMode: request.createPolicy,
                        scaffoldState: request.createPolicy === "clean" ? "none" : "preserved",
                        creationManifest: reference(nativeResult.creationManifestRef, nativeResult.creationManifestDigest),
                        provenance: nativeResult.provenance.map((row) => reference(row.provenanceRef, row.provenanceDigest)),
                    },
                })
                : validatedOutput(packet, {
                    outcomeKind: "refusal",
                    value: {
                        code: createRefusalCode(nativeResult),
                        issuePaths: [],
                        evidenceRefs: [],
                    },
                });
            return deepFreeze({
                ownerOutput,
                resources: receipt(call.resources, nativeResult),
            });
        }));
    };
}
const clean = createBinding(WORKSPACE_OPERATION_CONTRACTS.create.clean);
const imported = createBinding(WORKSPACE_OPERATION_CONTRACTS.create.imported);
const open = (call) => {
    const resourceFault = validateResources(call);
    if (resourceFault !== null)
        return Effect.fail(resourceFault);
    const request = call.invocation.request;
    const nativePacket = {
        kind: "workspace_open_packet",
        schemaVersion: "5.0.0",
        memberKey: "open",
        targetRoot: request.targetRoot,
        expectedWorkspaceAuthorityRef: request.expectedAuthority.ref,
        expectedWorkspaceAuthorityDigest: request.expectedAuthority.digest,
    };
    return Effect.tryPromise({
        try: () => WorkspaceOperationPort.open(nativePacket),
        catch: (cause) => fault(call.invocation.definitionKey, "workspace_execution_failure", String(cause)),
    }).pipe(Effect.map((nativeResult) => {
        const ownerOutput = nativeResult.kind === "workspace_open_projection"
            ? validatedOutput(WORKSPACE_OPERATION_CONTRACTS.open.open, {
                outcomeKind: "result",
                value: {
                    disposition: nativeResult.disposition,
                    workspace: reference(nativeResult.workspaceRef ?? request.expectedAuthority.ref, nativeResult.workspaceDigest ?? request.expectedAuthority.digest),
                    authority: reference(nativeResult.workspaceAuthorityRef ?? request.expectedAuthority.ref, nativeResult.workspaceAuthorityDigest ?? request.expectedAuthority.digest),
                    binding: nativeResult.bindingRef === null || nativeResult.bindingDigest === null
                        ? null
                        : reference(nativeResult.bindingRef, nativeResult.bindingDigest),
                    residuals: nativeResult.residuals.map((row) => row.code),
                },
            })
            : validatedOutput(WORKSPACE_OPERATION_CONTRACTS.open.open, {
                outcomeKind: "refusal",
                value: {
                    code: openRefusalCode(nativeResult),
                    issuePaths: [],
                    evidenceRefs: [],
                },
            });
        return deepFreeze({
            ownerOutput,
            resources: receipt(call.resources, nativeResult),
        });
    }));
};
export const WORKSPACE_DEFINITION_BINDINGS = Object.freeze({
    create: Object.freeze({ clean: withAdmissionAuthority(WORKSPACE_OPERATION_CONTRACTS.create.clean, clean), imported: withAdmissionAuthority(WORKSPACE_OPERATION_CONTRACTS.create.imported, imported) }),
    open: Object.freeze({ open: withAdmissionAuthority(WORKSPACE_OPERATION_CONTRACTS.open.open, open) }),
});
