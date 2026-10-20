import { withAdmissionAuthority } from "./admission_authority.js";
import { admitExactDefinitionCall, definitionFault as callAdmissionFault } from "../shared/definition_binding_mechanics.js";
import { join } from "node:path";
import * as Effect from "effect/Effect";
import { abandonAbgEventResource, acquireAbgEventResource, completeAbgEventResource, validateAbgEventResourceInput, } from "../abg/definition_event_resource.js";
import { admitProductInstallInResolvedLock, projectAdmittedProductInstall, } from "../abg/environment_admission.js";
import { sha256Canonical } from "../shared/digests.js";
import { definitionFault, hasExactKeys, isDefinitionFault, isRecord, reference, sameCoordinate, sameJson, validatedOwnerOutput, } from "../shared/definition_binding_mechanics.js";
import { deepFreeze } from "../shared/immutable.js";
import { constructExactOperationInvocationCoordinate } from "../shared/operation_definition_coordinate.js";
import { isResolvedProductLock, productInstallCoordinate, } from "./environment.js";
import { PRODUCT_INSTALL_CONTRACTS, } from "./install_operation_contracts.js";
import { ProductInstallPort, } from "./install_operation.js";
import { isVerifiedProductArtifact, productVerificationCoordinates, } from "./verify_product.js";
function installFault(call, stage, code, message) {
    return definitionFault(call.invocation.definitionKey, stage, code, message);
}
function resolvedLockCoordinate(lock) {
    return reference(lock.lockId, lock.lockDigest);
}
function candidateCoordinate(candidate) {
    return reference(candidate.installId, sha256Canonical(candidate));
}
function installManifestCoordinate(install) {
    return reference(join(install.installedRoot, "product-toolchain-manifest.json"), install.manifestDigest);
}
function validateResources(call) {
    const resources = call.resources;
    if (!isRecord(resources) ||
        !hasExactKeys(resources, [
            "eventResource",
            "kind",
            "packedArtifact",
            "resolvedLock",
            "schemaVersion",
            "verifiedArtifact",
        ]) ||
        resources.kind !== "product_install_resource_assertion" ||
        resources.schemaVersion !== "5.0.0" ||
        !validateAbgEventResourceInput(resources.eventResource) ||
        !sameJson(resources, resources) ||
        !isVerifiedProductArtifact(resources.verifiedArtifact) ||
        !isResolvedProductLock(resources.resolvedLock)) {
        return installFault(call, "resource_admission", "invalid_resource_assertion", "Product installation requires exact packed, verified, lock, target, and ABG-prefix resources");
    }
    const request = call.invocation.request;
    const artifact = resources.verifiedArtifact;
    const packed = resources.packedArtifact;
    const coordinates = productVerificationCoordinates(artifact);
    const authorityLock = call.invocation.invocationAuthority.slots.dependency_lock;
    if (!isRecord(packed) ||
        packed.kind !== "product_verification_artifact_resource" ||
        packed.schemaVersion !== "5.0.0" ||
        !sameCoordinate(request.verifiedArtifact, coordinates.verifiedArtifact) ||
        !sameCoordinate(request.descriptor, coordinates.descriptor) ||
        request.contributionManifest.ref !== artifact.contributionManifestRef ||
        request.contributionManifest.digest !== artifact.contributionManifestDigest ||
        !sameCoordinate(request.resolvedLock, resolvedLockCoordinate(resources.resolvedLock)) ||
        authorityLock === null ||
        !sameCoordinate(authorityLock, request.resolvedLock) ||
        packed.artifact.ref !== artifact.artifactRef ||
        packed.artifact.digest !== artifact.artifactDigest ||
        packed.productContent.digest !== artifact.productContentDigest ||
        !sameCoordinate(packed.descriptor, request.descriptor) ||
        !sameCoordinate(packed.contributionManifest, request.contributionManifest) ||
        packed.manifestDigest !== artifact.manifestDigest ||
        packed.productId !== artifact.productId ||
        packed.packageName !== artifact.packageName ||
        packed.packageVersion !== artifact.packageVersion) {
        return installFault(call, "resource_admission", "resource_relation_mismatch", "Product installation resources differ from the admitted request or invocation authority");
    }
    return null;
}
const REFUSAL_PROJECTION = {
    target_not_empty: ["target_failure", "/targetRoot"],
    artifact_mismatch: ["verification_failure", "/verifiedArtifact"],
    dependency_lock_mismatch: ["lock_mismatch", "/resolvedLock"],
    install_failed: ["filesystem_failure", "/targetRoot"],
    installed_identity_mismatch: ["identity_mismatch", "/verifiedArtifact"],
    installed_manifest_mismatch: ["content_mismatch", "/verifiedArtifact"],
    unexpected_source_surface: ["contract_mismatch", "/verifiedArtifact"],
};
function refusalOutput(code, issuePath, evidenceRefs = []) {
    return validatedOwnerOutput(PRODUCT_INSTALL_CONTRACTS.install, {
        outcomeKind: "refusal",
        value: { code, issuePaths: [issuePath], evidenceRefs },
    }, "Product installation");
}
function nativeRefusalOutput(refusal) {
    const [code, issuePath] = REFUSAL_PROJECTION[refusal.code];
    return refusalOutput(code, issuePath);
}
function receipt(call, eventResource, candidate, install, installerManifest) {
    return deepFreeze({
        kind: "product_install_resource_receipt",
        schemaVersion: "5.0.0",
        eventResource,
        packedArtifact: { ...call.resources.packedArtifact.artifact },
        resolvedLock: resolvedLockCoordinate(call.resources.resolvedLock),
        targetRoot: call.invocation.request.targetRoot,
        installCandidate: candidate === null ? null : candidateCoordinate(candidate),
        installedProduct: install === null ? null : productInstallCoordinate(install),
        installManifest: install === null ? null : installManifestCoordinate(install),
        installerManifest,
    });
}
const install = (call, _boundEnvironment, alreadyAcquired) => {
    if (admitExactDefinitionCall(call, PRODUCT_INSTALL_CONTRACTS.install) === null) {
        return Effect.fail(callAdmissionFault(PRODUCT_INSTALL_CONTRACTS.install.definitionKey, "call_admission", "call_identity_mismatch", "definition call differs from its fixed module-static coordinate"));
    }
    const resourceFault = validateResources(call);
    if (resourceFault !== null)
        return Effect.fail(resourceFault);
    return Effect.tryPromise({
        try: async () => {
            const acquired = alreadyAcquired === null
                ? acquireAbgEventResource(call.resources.eventResource)
                : { kind: "acquired_abg_event_resource", resource: alreadyAcquired };
            if (acquired.kind !== "acquired_abg_event_resource") {
                throw installFault(call, "resource_acquisition", acquired.code, acquired.message);
            }
            const resource = acquired.resource;
            try {
                const nativePacket = {
                    kind: "product_install_packet",
                    schemaVersion: "5.0.0",
                    memberKey: "install",
                    request: {
                        artifactPath: call.resources.packedArtifact.artifactPath,
                        targetRoot: call.invocation.request.targetRoot,
                        verifiedArtifact: call.resources.verifiedArtifact,
                        resolvedLock: call.resources.resolvedLock,
                    },
                };
                const candidate = await ProductInstallPort.installInResolvedLock(nativePacket);
                if (candidate.kind === "product_install_refusal") {
                    return deepFreeze({
                        ownerOutput: nativeRefusalOutput(candidate),
                        resources: receipt(call, completeAbgEventResource(resource, resource.entryPrefix), null, null, null),
                    });
                }
                const invocationCoordinate = constructExactOperationInvocationCoordinate({
                    operationId: "abg.operation.product.install",
                    memberKey: "install",
                    definitionDigest: call.invocation.definitionDigest,
                }, call.invocation.invocationRef, call.invocation.requestDigest);
                const basis = deepFreeze({
                    ...invocationCoordinate,
                    operationId: "abg.operation.product.install",
                    memberKey: "install",
                    authorityScopeRef: candidate.installId,
                    authorityScopeDigest: candidate.productContentDigest,
                    correlationId: call.invocation.correlationRef,
                    eventTime: call.invocation.eventTime,
                    causationEventRefs: [],
                    predecessorPrefix: resource.entryPrefix,
                });
                const admitted = admitProductInstallInResolvedLock(resource.store, candidate, basis, call.resources.resolvedLock);
                if (admitted.kind === "artifact_owner_coordinate_refusal") {
                    throw installFault(call, "abg_admission", "product_install_coordinate_refusal", JSON.stringify(admitted.refusal));
                }
                if (admitted.kind === "artifact_owner_refusal") {
                    const code = admitted.refusal.code === "scope_mismatch"
                        ? "identity_mismatch"
                        : admitted.refusal.code === "artifact_truth_conflict" ||
                            admitted.refusal.code === "duplicate_invocation"
                            ? "target_failure"
                            : null;
                    if (code === null) {
                        throw installFault(call, "abg_admission", "product_install_admission_relation_failure", admitted.refusal.message);
                    }
                    return deepFreeze({
                        ownerOutput: refusalOutput(code, "/targetRoot"),
                        resources: receipt(call, completeAbgEventResource(resource, admitted.successorPrefix), candidate, null, null),
                    });
                }
                const projected = projectAdmittedProductInstall(admitted.artifactTruth, candidate, call.invocation.invocationRef);
                if (projected === null || !sameJson(projected, admitted.value)) {
                    throw installFault(call, "abg_projection", "product_install_projection_mismatch", "admitted ProductInstall differs from exact-prefix ABG projection truth");
                }
                const installerManifest = reference(admitted.artifactTruth.projectionRef, admitted.artifactTruth.projectionDigest);
                const ownerOutput = validatedOwnerOutput(PRODUCT_INSTALL_CONTRACTS.install, {
                    outcomeKind: "result",
                    value: {
                        disposition: admitted.disposition === "idempotent"
                            ? "idempotent"
                            : "materialized",
                        installedProduct: productInstallCoordinate(projected),
                        installManifest: installManifestCoordinate(projected),
                        installerManifest,
                        resolvedLock: resolvedLockCoordinate(call.resources.resolvedLock),
                        provenance: [installerManifest],
                    },
                }, "Product installation");
                return deepFreeze({
                    ownerOutput,
                    resources: receipt(call, completeAbgEventResource(resource, admitted.successorPrefix), candidate, projected, installerManifest),
                });
            }
            catch (cause) {
                abandonAbgEventResource(resource);
                throw cause;
            }
        },
        catch: (cause) => isDefinitionFault(cause)
            ? cause
            : installFault(call, "owner_execution", "product_install_execution_failure", String(cause)),
    });
};
export const PRODUCT_INSTALL_DEFINITION_BINDINGS = Object.freeze({ install: withAdmissionAuthority(PRODUCT_INSTALL_CONTRACTS.install, install) });
