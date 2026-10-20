import { isRecord, hasUnicodeNulJoinedKeys as hasExactKeys } from "../shared/admission_predicates.js";
import { withAdmissionAuthority } from "./admission_authority.js";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { reconstructWorkspaceManifest } from "./workspace_operations.js";
import { admitExactDefinitionCall, definitionFault as callAdmissionFault } from "../shared/definition_binding_mechanics.js";
import * as Effect from "effect/Effect";
import { abandonAbgEventResource, acquireAbgEventResource, completeAbgEventResource, validateReopenedAbgEventResourceInput, } from "../abg/definition_event_resource.js";
import { admitWorkspaceBinding, projectAdmittedWorkspaceBinding, } from "../abg/environment_admission.js";
import { canonicalJson, compareUnicodeCodeUnits, } from "../shared/canonical_json.js";
import {} from "../shared/effect_definition.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import { admitRuntimeContract, } from "../shared/public_function_contracts.js";
import { isProductInstall, resolveProductArtifacts, isResolvedProductLock, isWorkspaceAuthorityBasis, productInstallCoordinate, } from "./environment.js";
import { admitResolvedNativeContractClosure, PRODUCT_ENVIRONMENT_CONTRACTS, } from "./environment_operation_contracts.js";
import { ProductEnvironmentPort, } from "./environment_operations.js";
import { PRODUCT_VERIFICATION_CONTRACTS } from "./verification_operation_contracts.js";
import { isVerifiedProductArtifact, productVerificationCoordinates } from "./verify_product.js";
function sameJson(left, right) {
    try {
        return canonicalJson(left) === canonicalJson(right);
    }
    catch {
        return false;
    }
}
function sameCoordinate(left, right) {
    return left.ref === right.ref && left.digest === right.digest;
}
function fault(definitionKey, stage, code, message) {
    return deepFreeze({
        kind: "definition_execution_fault",
        schemaVersion: "5.0.0",
        definitionKey,
        stage,
        code,
        message,
        evidence: {},
    });
}
function isExecutionFault(value) {
    return isRecord(value) && value.kind === "definition_execution_fault";
}
function verifiedArtifactCoordinate(artifact) {
    return productVerificationCoordinates(artifact).verifiedArtifact;
}
function resolvedLockCoordinate(lock) {
    return deepFreeze({ ref: lock.lockId, digest: lock.lockDigest });
}
function workspaceAuthorityCoordinate(authority) {
    return deepFreeze({
        ref: authority.authorityBasisId,
        digest: authority.authorityBasisDigest,
    });
}
function workspaceBindingCoordinate(binding) {
    return deepFreeze({ ref: binding.bindingId, digest: binding.bindingDigest });
}
function uniqueCoordinates(values) {
    return deepFreeze([...new Map(values.map((value) => [`${value.ref}\0${value.digest}`, value])).values()].sort((left, right) => compareUnicodeCodeUnits(left.ref, right.ref) ||
        compareUnicodeCodeUnits(left.digest, right.digest)));
}
function resolveFault(call, code, message) {
    return fault(call.invocation.definitionKey, "resource_admission", code, message);
}
function invalidVerifiedPreimage(preimage) {
    const record = preimage;
    if (!isRecord(record) ||
        !hasExactKeys(record, [
            "verification",
            "verificationOutput",
            "verifiedArtifact",
        ]) ||
        !isVerifiedProductArtifact(preimage.verifiedArtifact))
        return true;
    const output = preimage.verificationOutput;
    if (!isRecord(output) ||
        !hasExactKeys(output, ["outcomeKind", "value"]) ||
        output.outcomeKind !== "result" ||
        admitRuntimeContract(PRODUCT_VERIFICATION_CONTRACTS.verify.resultSchema, output.value).disposition !== "admitted" ||
        output.value.targetKind !== "packed_artifact")
        return true;
    return output.value.disposition !== "locally_verified" ||
        !sameCoordinate(output.value.verifiedArtifact, verifiedArtifactCoordinate(preimage.verifiedArtifact));
}
function validateResolveResources(call) {
    const resources = call.resources;
    if (!isRecord(resources) ||
        !hasExactKeys(resources, [
            "kind",
            "nativeContractClosure",
            "schemaVersion",
            "verifiedPreimages",
        ]) ||
        resources.kind !== "product_resolution_resource_assertion" ||
        resources.schemaVersion !== "5.0.0" ||
        !Array.isArray(resources.verifiedPreimages) ||
        resources.verifiedPreimages.length === 0 ||
        !sameJson(resources, resources)) {
        return resolveFault(call, "invalid_resource_assertion", "Product resolution requires one exact I-JSON verified-preimage assertion");
    }
    const request = call.invocation.request;
    if (resources.verifiedPreimages.length !== request.verifiedCandidates.length ||
        resources.verifiedPreimages.some(invalidVerifiedPreimage) ||
        !sameJson(resources.verifiedPreimages.map(({ verification }) => verification), request.verifiedCandidates)) {
        return resolveFault(call, "verified_preimage_mismatch", "verified Product preimages differ from the admitted successful verification set");
    }
    return null;
}
function resolveRefusalCode(refusal) {
    switch (refusal.code) {
        case "empty_product_set":
        case "invalid_dependency":
            return "invalid";
        case "lock_mismatch":
            return "unverified";
        case "unresolved_dependency":
            return "unresolved";
        case "incompatible_dependency":
            return "incompatible";
        case "ambiguous_dependency":
        case "duplicate_install":
            return "ambiguous";
        case "cyclic_dependency":
            return "cyclic";
        case "invalid_workspace_authority":
        case "invalid_declared_root":
            throw new TypeError(`resolution returned impossible refusal ${refusal.code}`);
    }
}
function validateResolveOutput(output) {
    const schema = output.outcomeKind === "result"
        ? PRODUCT_ENVIRONMENT_CONTRACTS.resolve.resultSchema
        : PRODUCT_ENVIRONMENT_CONTRACTS.resolve.refusalSchema;
    if (admitRuntimeContract(schema, output.value).disposition !== "admitted") {
        throw new TypeError("Product resolution output differs from its exact contract");
    }
    return output;
}
function resolveReceipt(resources, lock) {
    return deepFreeze({
        kind: "product_resolution_resource_receipt",
        schemaVersion: "5.0.0",
        disposition: "read_only_unchanged",
        verifiedArtifacts: resources.verifiedPreimages.map(({ verifiedArtifact }) => verifiedArtifactCoordinate(verifiedArtifact)),
        resolvedLock: lock === null ? null : resolvedLockCoordinate(lock),
        nativeContractClosureDigest: sha256Canonical(resources.nativeContractClosure),
    });
}
function projectResolutionSuccess(call, resolved) {
    const { lock, linked } = resolved;
    const resources = call.resources;
    const request = call.invocation.request;
    for (const requirement of request.requirements) {
        const productMatches = resources.verifiedPreimages.filter(({ verifiedArtifact }) => verifiedArtifact.productId === requirement.productId);
        if (productMatches.length === 0) {
            return validateResolveOutput({
                outcomeKind: "refusal",
                value: {
                    code: "unresolved",
                    issuePaths: ["/requirements"],
                    evidenceRefs: [],
                },
            });
        }
        const versionMatches = productMatches.filter(({ verifiedArtifact }) => verifiedArtifact.packageVersion === requirement.packageVersion);
        if (versionMatches.length !== 1) {
            return validateResolveOutput({
                outcomeKind: "refusal",
                value: {
                    code: versionMatches.length === 0 ? "incompatible" : "ambiguous",
                    issuePaths: ["/requirements"],
                    evidenceRefs: productMatches.map(({ verifiedArtifact }) => verifiedArtifact.artifactRef),
                },
            });
        }
        const artifact = versionMatches[0].verifiedArtifact;
        if (requirement.requiredContractRefs.some((ref) => !artifact.publicContractRefs.includes(ref)) ||
            requirement.requiredCapabilityRefs.some((ref) => !artifact.publicCapabilityRefs.includes(ref))) {
            return validateResolveOutput({
                outcomeKind: "refusal",
                value: {
                    code: "incompatible",
                    issuePaths: ["/requirements"],
                    evidenceRefs: [artifact.artifactRef],
                },
            });
        }
    }
    const selectedProductIds = new Set(request.requirements.map(({ productId }) => productId));
    const unselected = resources.verifiedPreimages.filter(({ verifiedArtifact }) => !selectedProductIds.has(verifiedArtifact.productId));
    if (unselected.length !== 0) {
        return validateResolveOutput({
            outcomeKind: "refusal",
            value: {
                code: "invalid",
                issuePaths: ["/verifiedCandidates"],
                evidenceRefs: unselected.map(({ verifiedArtifact }) => verifiedArtifact.artifactRef),
            },
        });
    }
    const selectorRefs = resources.verifiedPreimages.flatMap(({ verificationOutput }) => verificationOutput.value.targetKind === "packed_artifact"
        ? verificationOutput.value.pendingExternalSelectors.map(({ selectorRef }) => selectorRef)
        : []);
    const closure = admitResolvedNativeContractClosure(selectorRefs, resources.nativeContractClosure);
    if (closure.disposition !== "admitted" ||
        lock.nativeContractClosureDigest !== linked.nativeContractClosureDigest ||
        !sameJson(closure.value, {
            selectorDispositions: linked.selectorDispositions,
            occurrences: linked.occurrences,
            nativeBindings: linked.bindings.filter(({ kind }) => kind === "external_binding"),
        })) {
        throw new TypeError("resolved native closure differs from the verified Product preimages");
    }
    const selections = request.requirements.map((requirement) => {
        const preimage = resources.verifiedPreimages.find(({ verifiedArtifact }) => verifiedArtifact.productId === requirement.productId &&
            verifiedArtifact.packageVersion === requirement.packageVersion);
        return {
            requirement,
            product: {
                ref: preimage.verifiedArtifact.productId,
                digest: preimage.verifiedArtifact.productContentDigest,
            },
            verification: preimage.verification,
        };
    });
    const provenance = uniqueCoordinates(resources.verifiedPreimages.flatMap(({ verificationOutput }) => verificationOutput.value.provenance));
    return validateResolveOutput({
        outcomeKind: "result",
        value: {
            resolvedLock: resolvedLockCoordinate(lock),
            selections,
            dependencyEdges: lock.dependencyEdges,
            selectorDispositions: closure.value.selectorDispositions,
            occurrences: closure.value.occurrences,
            nativeBindings: closure.value.nativeBindings,
            residuals: [],
            provenance,
        },
    });
}
const resolve = (call) => {
    if (admitExactDefinitionCall(call, PRODUCT_ENVIRONMENT_CONTRACTS.resolve) === null) {
        return Effect.fail(callAdmissionFault(PRODUCT_ENVIRONMENT_CONTRACTS.resolve.definitionKey, "call_admission", "call_identity_mismatch", "definition call differs from its fixed module-static coordinate"));
    }
    const resourceFault = validateResolveResources(call);
    if (resourceFault !== null)
        return Effect.fail(resourceFault);
    return Effect.try({
        try: () => {
            const native = resolveProductArtifacts(call.resources.verifiedPreimages.map(({ verifiedArtifact }) => verifiedArtifact));
            if (native.kind === "environment_refusal") {
                return deepFreeze({
                    ownerOutput: validateResolveOutput({
                        outcomeKind: "refusal",
                        value: {
                            code: resolveRefusalCode(native),
                            issuePaths: [],
                            evidenceRefs: [],
                        },
                    }),
                    resources: resolveReceipt(call.resources, null),
                });
            }
            return deepFreeze({
                ownerOutput: projectResolutionSuccess(call, native),
                resources: resolveReceipt(call.resources, native.lock),
            });
        },
        catch: (cause) => isExecutionFault(cause)
            ? cause
            : fault(call.invocation.definitionKey, "owner_projection", "product_resolution_execution_failure", String(cause)),
    });
};
const ROOT_FIELDS = Object.freeze([
    ["toolchain", "toolchainRoot"],
    ["product", "productRoot"],
    ["event_log", "eventLogRoot"],
    ["runtime_state", "runtimeStateRoot"],
    ["projection", "projectionRoot"],
    ["archive", "archiveRoot"],
]);
function declaredRootRows(roots) {
    return ROOT_FIELDS.map(([rootKind, field]) => ({ rootKind, path: roots[field] }));
}
function bindFault(call, stage, code, message) {
    return fault(call.invocation.definitionKey, stage, code, message);
}
function validateBindResources(call) {
    const resources = call.resources;
    if (!isRecord(resources) ||
        !hasExactKeys(resources, [
            "admittedInstalls",
            "declaredRoots",
            "eventResource",
            "kind",
            "resolvedLock",
            "schemaVersion",
            "workspaceAuthority",
            "workspaceManifest",
        ]) ||
        resources.kind !== "product_workspace_binding_resource_assertion" ||
        resources.schemaVersion !== "5.0.0" ||
        !validateReopenedAbgEventResourceInput(resources.eventResource) ||
        !sameJson(resources, resources) ||
        !isResolvedProductLock(resources.resolvedLock) ||
        !isWorkspaceAuthorityBasis(resources.workspaceAuthority) ||
        !Array.isArray(resources.admittedInstalls) ||
        resources.admittedInstalls.length === 0 ||
        resources.admittedInstalls.some((install) => !isProductInstall(install, resources.resolvedLock))) {
        return bindFault(call, "resource_admission", "invalid_resource_assertion", "workspace binding requires exact authority, admitted installs, lock, roots, and ABG prefix");
    }
    const request = call.invocation.request;
    const installCoordinates = resources.admittedInstalls.map(productInstallCoordinate);
    let manifest = null;
    try {
        manifest = reconstructWorkspaceManifest(JSON.parse(readFileSync(join(resources.workspaceAuthority.canonicalRoot, ".abiogenesis", "workspace-manifest.json"), "utf8")));
    }
    catch { /* A missing or unreadable workspace manifest is a resource refusal. */ }
    if (manifest === null || !sameJson(manifest, resources.workspaceManifest) ||
        manifest.canonicalRoot !== resources.workspaceAuthority.canonicalRoot ||
        manifest.workspaceRef !== resources.workspaceAuthority.workspaceId ||
        !sameCoordinate(request.workspaceAuthority, workspaceAuthorityCoordinate(resources.workspaceAuthority)) ||
        !sameJson(request.installedSet, installCoordinates) ||
        !sameCoordinate(request.resolvedLock, resolvedLockCoordinate(resources.resolvedLock)) ||
        !sameJson([...request.declaredRoots].sort((left, right) => compareUnicodeCodeUnits(left.rootKind, right.rootKind)), declaredRootRows(resources.declaredRoots).sort((left, right) => compareUnicodeCodeUnits(left.rootKind, right.rootKind)))) {
        return bindFault(call, "resource_admission", "resource_relation_mismatch", "workspace binding resources differ from the admitted request or invocation basis");
    }
    return null;
}
function bindRefusalCode(refusal) {
    switch (refusal.code) {
        case "empty_product_set":
        case "duplicate_install":
            return "product_mismatch";
        case "lock_mismatch":
            return "lock_mismatch";
        case "invalid_workspace_authority":
            return "workspace_mismatch";
        case "invalid_declared_root":
            return "root_mismatch";
        case "incompatible_dependency":
            return "incompatible";
        case "invalid_dependency":
        case "unresolved_dependency":
        case "ambiguous_dependency":
        case "cyclic_dependency":
            throw new TypeError(`workspace binding returned impossible refusal ${refusal.code}`);
    }
}
function validateBindOutput(output) {
    const schema = output.outcomeKind === "result"
        ? PRODUCT_ENVIRONMENT_CONTRACTS.bind.resultSchema
        : PRODUCT_ENVIRONMENT_CONTRACTS.bind.refusalSchema;
    if (admitRuntimeContract(schema, output.value).disposition !== "admitted") {
        throw new TypeError("workspace binding output differs from its exact contract");
    }
    return output;
}
function bindingRefusal(code, issuePath, evidenceRefs = []) {
    return validateBindOutput({
        outcomeKind: "refusal",
        value: { code, issuePaths: [issuePath], evidenceRefs },
    });
}
function bindReceipt(resources, eventResource, binding) {
    return deepFreeze({
        kind: "product_workspace_binding_resource_receipt",
        schemaVersion: "5.0.0",
        eventResource,
        workspaceAuthority: workspaceAuthorityCoordinate(resources.workspaceAuthority),
        admittedInstalls: resources.admittedInstalls.map(productInstallCoordinate),
        resolvedLock: resolvedLockCoordinate(resources.resolvedLock),
        binding: binding === null ? null : workspaceBindingCoordinate(binding),
    });
}
const bind = (call, _environment, heldResource) => {
    if (admitExactDefinitionCall(call, PRODUCT_ENVIRONMENT_CONTRACTS.bind) === null) {
        return Effect.fail(callAdmissionFault(PRODUCT_ENVIRONMENT_CONTRACTS.bind.definitionKey, "call_admission", "call_identity_mismatch", "definition call differs from its fixed module-static coordinate"));
    }
    const resourceFault = validateBindResources(call);
    if (resourceFault !== null)
        return Effect.fail(resourceFault);
    return Effect.try({
        try: () => {
            const acquired = heldResource === null ? acquireAbgEventResource(call.resources.eventResource) :
                { kind: "acquired_abg_event_resource", resource: heldResource };
            if (acquired.kind !== "acquired_abg_event_resource") {
                throw bindFault(call, "resource_acquisition", acquired.code, acquired.message);
            }
            const resource = acquired.resource;
            try {
                const nativePacket = {
                    kind: "workspace_binding_packet",
                    schemaVersion: "5.0.0",
                    memberKey: "bind",
                    admittedInstalls: call.resources.admittedInstalls,
                    resolvedLock: call.resources.resolvedLock,
                    authority: {
                        workspaceId: call.resources.workspaceAuthority.workspaceId,
                        canonicalRoot: call.resources.workspaceAuthority.canonicalRoot,
                        authorityMode: call.resources.workspaceAuthority.authorityMode,
                        authorizedActorRef: call.resources.workspaceAuthority.authorizedActorRef,
                        authorityManifestRef: call.resources.workspaceAuthority.authorityManifestRef,
                        authorityManifestDigest: call.resources.workspaceAuthority.authorityManifestDigest,
                    },
                    roots: call.resources.declaredRoots,
                };
                const candidate = ProductEnvironmentPort.bindWorkspace(nativePacket);
                if (candidate.kind === "environment_refusal") {
                    return deepFreeze({
                        ownerOutput: bindingRefusal(bindRefusalCode(candidate), "/request"),
                        resources: bindReceipt(call.resources, completeAbgEventResource(resource, resource.entryPrefix), null),
                    });
                }
                const invocationCoordinate = constructExactOperationInvocationCoordinate({
                    operationId: "abg.operation.workspace.bind",
                    memberKey: "bind",
                    definitionDigest: call.invocation.definitionDigest,
                }, call.invocation.invocationRef, call.invocation.requestDigest);
                const admissionBasis = deepFreeze({
                    ...invocationCoordinate,
                    operationId: "abg.operation.workspace.bind",
                    memberKey: "bind",
                    authorityScopeRef: candidate.bindingId,
                    authorityScopeDigest: candidate.bindingDigest,
                    correlationId: call.invocation.correlationRef,
                    eventTime: call.invocation.eventTime,
                    causationEventRefs: call.resources.admittedInstalls.map(({ admissionEventRef }) => admissionEventRef),
                    predecessorPrefix: resource.entryPrefix,
                });
                const admitted = admitWorkspaceBinding(resource.store, candidate, admissionBasis, call.resources.workspaceAuthority);
                if (admitted.kind === "artifact_owner_coordinate_refusal") {
                    throw bindFault(call, "abg_admission", "workspace_binding_coordinate_refusal", canonicalJson(admitted.refusal));
                }
                if (admitted.kind === "artifact_owner_refusal") {
                    const code = admitted.refusal.code === "artifact_truth_conflict" ||
                        admitted.refusal.code === "duplicate_invocation"
                        ? "binding_conflict"
                        : admitted.refusal.code === "scope_mismatch"
                            ? "product_mismatch"
                            : null;
                    if (code === null) {
                        throw bindFault(call, "abg_admission", "workspace_binding_admission_relation_failure", admitted.refusal.message);
                    }
                    return deepFreeze({
                        ownerOutput: bindingRefusal(code, code === "binding_conflict" ? "/binding" : "/installedSet"),
                        resources: bindReceipt(call.resources, completeAbgEventResource(resource, admitted.successorPrefix), null),
                    });
                }
                const binding = projectAdmittedWorkspaceBinding(admitted.artifactTruth, candidate, call.invocation.invocationRef);
                if (binding === null || !sameJson(binding, admitted.value)) {
                    throw bindFault(call, "abg_projection", "workspace_binding_projection_mismatch", "admitted workspace binding differs from exact-prefix ABG projection truth");
                }
                const ownerOutput = validateBindOutput({
                    outcomeKind: "result",
                    value: {
                        binding: workspaceBindingCoordinate(binding),
                        installedSet: call.invocation.request.installedSet,
                        resolvedLock: call.invocation.request.resolvedLock,
                        declaredRoots: call.invocation.request.declaredRoots,
                        provenance: [{
                                ref: admitted.artifactTruth.projectionRef,
                                digest: admitted.artifactTruth.projectionDigest,
                            }],
                    },
                });
                return deepFreeze({
                    ownerOutput,
                    resources: bindReceipt(call.resources, completeAbgEventResource(resource, admitted.successorPrefix), binding),
                });
            }
            catch (cause) {
                abandonAbgEventResource(resource);
                throw cause;
            }
        },
        catch: (cause) => isExecutionFault(cause)
            ? cause
            : bindFault(call, "owner_execution", "workspace_binding_execution_failure", String(cause)),
    });
};
export const PRODUCT_ENVIRONMENT_DEFINITION_BINDINGS = Object.freeze({
    resolve: withAdmissionAuthority(PRODUCT_ENVIRONMENT_CONTRACTS.resolve, resolve),
    bind: withAdmissionAuthority(PRODUCT_ENVIRONMENT_CONTRACTS.bind, bind),
});
