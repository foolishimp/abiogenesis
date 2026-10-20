import { isRecord, hasNulJoinedKeys as hasExactKeys, isNonblankString as nonEmptyString } from "../shared/admission_predicates.js";
import { isAbsolute } from "node:path";
import { canonicalJson } from "../shared/canonical_json.js";
import { serializeCapabilityDefinitionGraph, capabilityRefsForContract, isCapabilityDefinitionGraph, } from "../shared/capability_contracts.js";
import { ABI5_PRODUCT_ID } from "./contracts.js";
import { isSha256Digest, sha256Bytes, sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isVerifiedProductArtifact, isProductContributionManifest, nativeDeclarationEvidenceForVerifiedArtifact, parseProductPublicContract, } from "./verify_product.js";
import { linkNativeContractSet, } from "./declaration_exports.js";
export const ENVIRONMENT_REFUSAL_CODES = [
    "empty_product_set",
    "invalid_dependency",
    "unresolved_dependency",
    "incompatible_dependency",
    "ambiguous_dependency",
    "cyclic_dependency",
    "duplicate_install",
    "lock_mismatch",
    "invalid_workspace_authority",
    "invalid_declared_root",
];
function refusal(code, message) {
    return {
        kind: "environment_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    };
}
function identity(prefix, digest) {
    return `${prefix}/${digest.slice("sha256:".length)}`;
}
function isUniqueStringArray(value) {
    return Array.isArray(value) &&
        value.every(nonEmptyString) &&
        new Set(value).size === value.length;
}
function isDeclaredDependency(value) {
    return isRecord(value) &&
        hasExactKeys(value, [
            "compatibilityRef",
            "kind",
            "packageVersion",
            "productId",
            "requiredCapabilityRefs",
            "requiredContractRefs",
        ]) &&
        value.kind === "requires" &&
        nonEmptyString(value.productId) &&
        nonEmptyString(value.packageVersion) &&
        nonEmptyString(value.compatibilityRef) &&
        isUniqueStringArray(value.requiredContractRefs) &&
        isUniqueStringArray(value.requiredCapabilityRefs);
}
function copyDependency(dependency) {
    return {
        ...dependency,
        requiredContractRefs: [...dependency.requiredContractRefs],
        requiredCapabilityRefs: [...dependency.requiredCapabilityRefs],
    };
}
function copyContributionManifest(manifest) {
    return {
        ...manifest,
        publicationBindings: manifest.publicationBindings.map((binding) => ({
            ...binding,
        })),
        rows: manifest.rows.map((row) => ({
            ...row,
            programMembershipRefs: [...row.programMembershipRefs],
            compatibilityRefs: [...row.compatibilityRefs],
            readinessPrerequisiteRefs: [...row.readinessPrerequisiteRefs],
        })),
    };
}
function copyPublicContract(contract) {
    return {
        ...contract,
        requirementAuthorityRefs: [...contract.requirementAuthorityRefs],
        capabilityIdentities: [...contract.capabilityIdentities],
        ...(contract.nativeTypedLocator === undefined
            ? {}
            : {
                nativeTypedLocator: {
                    ...contract.nativeTypedLocator,
                    declarationInventory: contract.nativeTypedLocator.declarationInventory.map((entry) => ({
                        ...entry,
                    })),
                },
            }),
        ...(contract.assetLocator === undefined
            ? {}
            : { assetLocator: { ...contract.assetLocator } }),
    };
}
function lockRowFor(artifact) {
    return {
        productId: artifact.productId,
        packageName: artifact.packageName,
        packageVersion: artifact.packageVersion,
        artifactDigest: artifact.artifactDigest,
        productContentDigest: artifact.productContentDigest,
        manifestDigest: artifact.manifestDigest,
        descriptorRef: artifact.descriptorRef,
        publisherNamespace: artifact.publisherNamespace,
        catalogId: artifact.catalogId,
        catalogDigest: artifact.catalogDigest,
        capabilityDefinitionGraph: artifact.capabilityDefinitionGraph,
        capabilityDefinitionGraphAsset: { ...artifact.capabilityDefinitionGraphAsset },
        contributionManifestRef: artifact.contributionManifestRef,
        contributionManifestDigest: artifact.contributionManifestDigest,
        contributionManifest: copyContributionManifest(artifact.contributionManifest),
        compatibilityRefs: [...artifact.compatibilityRefs],
        declaredDependencies: artifact.declaredDependencies.map(copyDependency),
        provenanceRef: artifact.provenanceRef,
        declaredCapabilityRefs: [...artifact.declaredCapabilityRefs],
        publicContracts: artifact.publicContracts.map(copyPublicContract),
        publicContractRefs: [...artifact.publicContractRefs],
        publicCapabilityRefs: [...artifact.publicCapabilityRefs],
    };
}
function lockRowsFor(artifacts) {
    return artifacts.map(lockRowFor);
}
function deriveDeclaredDependencyEdges(rows) {
    const edges = [];
    for (const source of rows) {
        if (source.declaredDependencies.some((dependency) => !isDeclaredDependency(dependency)) ||
            new Set(source.declaredDependencies.map((dependency) => dependency.productId)).size !== source.declaredDependencies.length) {
            return refusal("invalid_dependency", "Product descriptors must carry unique, well-formed dependencies");
        }
        for (const dependency of source.declaredDependencies) {
            const targets = rows.filter((candidate) => candidate.productId === dependency.productId);
            if (targets.length === 0) {
                return refusal("unresolved_dependency", `declared dependency ${dependency.productId} is unresolved`);
            }
            if (targets.length > 1) {
                return refusal("ambiguous_dependency", `declared dependency ${dependency.productId} is ambiguous`);
            }
            const target = targets[0];
            if (target.packageVersion !== dependency.packageVersion ||
                !target.compatibilityRefs.includes(dependency.compatibilityRef)) {
                return refusal("incompatible_dependency", `declared dependency ${dependency.productId} is incompatible`);
            }
            if (dependency.requiredContractRefs.some((contractRef) => !target.publicContractRefs.includes(contractRef)) ||
                dependency.requiredCapabilityRefs.some((capabilityRef) => !target.publicCapabilityRefs.includes(capabilityRef))) {
                return refusal("unresolved_dependency", `declared dependency ${dependency.productId} lacks a required public contract or capability`);
            }
            edges.push({
                kind: "requires",
                fromProductId: source.productId,
                toProductId: target.productId,
                packageVersion: dependency.packageVersion,
                compatibilityRef: dependency.compatibilityRef,
                compatibilityDisposition: "compatible",
                requiredContractRefs: [...dependency.requiredContractRefs],
                requiredCapabilityRefs: [...dependency.requiredCapabilityRefs],
            });
        }
    }
    return edges.sort((left, right) => {
        const leftKey = `${left.fromProductId}\0${left.toProductId}`;
        const rightKey = `${right.fromProductId}\0${right.toProductId}`;
        return leftKey < rightKey ? -1 : leftKey > rightKey ? 1 : 0;
    });
}
function hasProductDependencyCycle(productIds, dependencyEdges) {
    const outgoing = new Map();
    for (const edge of dependencyEdges) {
        const targets = outgoing.get(edge.fromProductId) ?? [];
        targets.push(edge.toProductId);
        outgoing.set(edge.fromProductId, targets);
    }
    const visiting = new Set();
    const visited = new Set();
    const visit = (productId) => {
        if (visiting.has(productId))
            return true;
        if (visited.has(productId))
            return false;
        visiting.add(productId);
        if ((outgoing.get(productId) ?? []).some(visit))
            return true;
        visiting.delete(productId);
        visited.add(productId);
        return false;
    };
    return [...productIds].some(visit);
}
/** Internal owner result: preserve the link already established for this lock.
 * It is not a new serialized lock or runtime admission. */
export function resolveProductArtifacts(artifacts) {
    if (artifacts.length === 0) {
        return refusal("empty_product_set", "a resolved lock requires at least one verified Product artifact");
    }
    if (artifacts.some((artifact) => !isVerifiedProductArtifact(artifact))) {
        return refusal("lock_mismatch", "a resolved lock accepts verified Product artifacts only");
    }
    const artifactDigests = artifacts.map((artifact) => artifact.artifactDigest);
    if (new Set(artifactDigests).size !== artifactDigests.length) {
        return refusal("duplicate_install", "a resolved lock cannot contain duplicate artifact identities");
    }
    const rows = lockRowsFor(artifacts);
    const productIds = rows.map((row) => row.productId);
    if (new Set(productIds).size !== productIds.length) {
        return refusal("ambiguous_dependency", "a resolved lock cannot contain ambiguous Product identities");
    }
    const dependencyEdges = deriveDeclaredDependencyEdges(rows);
    if (!Array.isArray(dependencyEdges))
        return dependencyEdges;
    const productIdSet = new Set(productIds);
    if (hasProductDependencyCycle(productIdSet, dependencyEdges)) {
        return refusal("cyclic_dependency", "resolved Product dependencies must be acyclic");
    }
    const toolchainArtifacts = artifacts.filter((artifact) => artifact.productId === ABI5_PRODUCT_ID);
    if (toolchainArtifacts.length !== 1) {
        return refusal(toolchainArtifacts.length === 0
            ? "unresolved_dependency"
            : "ambiguous_dependency", "resolved native meaning requires one exact ABIogenesis toolchain Product");
    }
    const linkProducts = [];
    for (const artifact of artifacts) {
        const evidence = nativeDeclarationEvidenceForVerifiedArtifact(artifact);
        if (evidence === null) {
            return refusal("lock_mismatch", `verified native declaration evidence is absent for ${artifact.productId}`);
        }
        linkProducts.push({
            productId: artifact.productId,
            productContentDigest: artifact.productContentDigest,
            packageName: artifact.packageName,
            declaredDependencies: artifact.declaredDependencies,
            publicContracts: artifact.publicContracts,
            evidence,
        });
    }
    const linked = linkNativeContractSet(linkProducts, toolchainArtifacts[0].productContentDigest);
    if (linked.kind === "refused") {
        return refusal(linked.code, linked.message);
    }
    const nativeContractClosureDigest = linked.nativeContractClosureDigest;
    const lockDigest = sha256Canonical({
        rows,
        dependencyEdges,
        nativeContractClosureDigest,
    });
    const lock = deepFreeze({
        kind: "resolved_product_lock",
        schemaVersion: "5.0.0",
        lockId: identity("product-lock://abiogenesis", lockDigest),
        lockDigest,
        nativeContractClosureDigest,
        rows,
        dependencyEdges,
    });
    return Object.freeze({ kind: "resolved_product_environment", lock, linked });
}
export function constructResolvedProductLock(artifacts) {
    const resolved = resolveProductArtifacts(artifacts);
    return resolved.kind === "environment_refusal" ? resolved : resolved.lock;
}
export function isResolvedProductLock(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "dependencyEdges",
            "kind",
            "lockDigest",
            "lockId",
            "nativeContractClosureDigest",
            "rows",
            "schemaVersion",
        ]) ||
        value.kind !== "resolved_product_lock" ||
        value.schemaVersion !== "5.0.0" ||
        !nonEmptyString(value.lockId) ||
        !isSha256Digest(value.lockDigest) ||
        !isSha256Digest(value.nativeContractClosureDigest) ||
        !Array.isArray(value.rows) ||
        value.rows.length === 0 ||
        !Array.isArray(value.dependencyEdges)) {
        return false;
    }
    const rows = value.rows;
    if (rows.some((row) => !isRecord(row) ||
        !hasExactKeys(row, [
            "artifactDigest",
            "catalogDigest",
            "catalogId",
            "capabilityDefinitionGraph",
            "capabilityDefinitionGraphAsset",
            "compatibilityRefs",
            "contributionManifest",
            "contributionManifestDigest",
            "contributionManifestRef",
            "declaredCapabilityRefs",
            "declaredDependencies",
            "descriptorRef",
            "manifestDigest",
            "packageName",
            "packageVersion",
            "provenanceRef",
            "productContentDigest",
            "productId",
            "publicCapabilityRefs",
            "publicContracts",
            "publicContractRefs",
            "publisherNamespace",
        ]) ||
        !nonEmptyString(row.productId) ||
        !nonEmptyString(row.packageName) ||
        !nonEmptyString(row.packageVersion) ||
        !isSha256Digest(row.artifactDigest) ||
        !isSha256Digest(row.productContentDigest) ||
        !isSha256Digest(row.manifestDigest) ||
        !nonEmptyString(row.descriptorRef) ||
        !nonEmptyString(row.publisherNamespace) ||
        !nonEmptyString(row.catalogId) ||
        !isSha256Digest(row.catalogDigest) ||
        !isCapabilityDefinitionGraph(row.capabilityDefinitionGraph) ||
        !isRecord(row.capabilityDefinitionGraphAsset) ||
        !nonEmptyString(row.capabilityDefinitionGraphAsset.path) ||
        !nonEmptyString(row.capabilityDefinitionGraphAsset.mediaType) ||
        row.capabilityDefinitionGraphAsset.schemaVersion !== "5.0.0" ||
        !isSha256Digest(row.capabilityDefinitionGraphAsset.contentDigest) ||
        !nonEmptyString(row.contributionManifestRef) ||
        !isSha256Digest(row.contributionManifestDigest) ||
        !isProductContributionManifest(row.contributionManifest) ||
        sha256Canonical(row.contributionManifest) !==
            row.contributionManifestDigest ||
        row.contributionManifest.contributionManifestRef !==
            row.contributionManifestRef ||
        row.contributionManifest.productId !== row.productId ||
        row.contributionManifest.productVersion !== row.packageVersion ||
        row.contributionManifest.descriptorRef !== row.descriptorRef ||
        row.contributionManifest.productContentDigest !==
            row.productContentDigest ||
        row.contributionManifest.publicContractCatalogId !== row.catalogId ||
        row.contributionManifest.publicContractCatalogDigest !==
            row.catalogDigest ||
        canonicalJson(row.contributionManifest.capabilityDefinitionGraph) !== canonicalJson({
            graphId: row.capabilityDefinitionGraph.graphId,
            graphVersion: row.capabilityDefinitionGraph.graphVersion,
            graphDigest: row.capabilityDefinitionGraph.graphDigest,
        }) ||
        row.capabilityDefinitionGraphAsset.path !==
            "contracts/capabilities/capability-definition-graph.json" ||
        row.capabilityDefinitionGraphAsset.mediaType !== "application/json" ||
        row.capabilityDefinitionGraphAsset.contentDigest !== sha256Bytes(serializeCapabilityDefinitionGraph(row.capabilityDefinitionGraph)) ||
        !isUniqueStringArray(row.compatibilityRefs) ||
        !Array.isArray(row.declaredDependencies) ||
        !row.declaredDependencies.every(isDeclaredDependency) ||
        !nonEmptyString(row.provenanceRef) ||
        !isUniqueStringArray(row.declaredCapabilityRefs) ||
        !Array.isArray(row.publicContracts) ||
        !row.publicContracts.every((contract) => parseProductPublicContract(contract, row.productId) !==
            null) ||
        !isUniqueStringArray(row.publicContractRefs) ||
        !isUniqueStringArray(row.publicCapabilityRefs) ||
        row.publicContractRefs.join("\0") !==
            row.publicContracts
                .map((contract) => contract.contractId)
                .sort()
                .join("\0") ||
        row.publicCapabilityRefs.join("\0") !==
            [...new Set(row.publicContracts
                    .flatMap((contract) => contract.capabilityIdentities))].sort().join("\0") ||
        row.declaredCapabilityRefs.join("\0") !==
            row.capabilityDefinitionGraph.rows
                .map(({ capabilityId }) => capabilityId)
                .join("\0") ||
        row.publicContracts.some((contract) => contract.capabilityIdentities.join("\0") !==
            capabilityRefsForContract(contract.contractId).join("\0")) ||
        !lockRowGraphMatchesCatalog(row))) {
        return false;
    }
    const productIds = rows.map((row) => row.productId);
    if (new Set(productIds).size !== productIds.length) {
        return false;
    }
    const productIdSet = new Set(productIds);
    const edges = value.dependencyEdges;
    if (edges.some((edge) => !isRecord(edge) ||
        !hasExactKeys(edge, [
            "compatibilityRef",
            "compatibilityDisposition",
            "fromProductId",
            "kind",
            "packageVersion",
            "requiredCapabilityRefs",
            "requiredContractRefs",
            "toProductId",
        ]) ||
        edge.kind !== "requires" ||
        !nonEmptyString(edge.fromProductId) ||
        !nonEmptyString(edge.toProductId) ||
        !nonEmptyString(edge.packageVersion) ||
        !nonEmptyString(edge.compatibilityRef) ||
        edge.compatibilityDisposition !== "compatible" ||
        !isUniqueStringArray(edge.requiredContractRefs) ||
        !isUniqueStringArray(edge.requiredCapabilityRefs) ||
        edge.fromProductId === edge.toProductId ||
        !productIdSet.has(edge.fromProductId) ||
        !productIdSet.has(edge.toProductId))) {
        return false;
    }
    const edgeKeys = edges.map((edge) => `${edge.fromProductId}\0${edge.toProductId}`);
    if (new Set(edgeKeys).size !== edgeKeys.length ||
        [...edgeKeys].sort().join("\0") !== edgeKeys.join("\0")) {
        return false;
    }
    const expectedEdges = deriveDeclaredDependencyEdges(rows);
    if (!Array.isArray(expectedEdges) ||
        canonicalJson(expectedEdges) !==
            canonicalJson(edges)) {
        return false;
    }
    if (hasProductDependencyCycle(productIdSet, edges)) {
        return false;
    }
    const expectedDigest = sha256Canonical({
        rows,
        dependencyEdges: edges,
        nativeContractClosureDigest: value.nativeContractClosureDigest,
    });
    return value.lockDigest === expectedDigest &&
        value.lockId === identity("product-lock://abiogenesis", expectedDigest);
}
/** The graph guard already established the register, rows and dependency graph.
 * Catalog correspondence only adds the exact flat-owner coordinates. */
function lockRowGraphMatchesCatalog(row) {
    if (row.capabilityDefinitionGraph.rows.length === 0) {
        return row.publicContracts.every((contract) => capabilityRefsForContract(contract.contractId).length === 0);
    }
    const contracts = new Map(row.publicContracts.map((contract) => [contract.contractId, contract]));
    const contractCatalog = {
        productId: row.productId,
        productContentDigest: row.productContentDigest,
        catalogId: row.catalogId,
        catalogVersion: "5.0.0",
        catalogDigest: row.catalogDigest,
    };
    return row.capabilityDefinitionGraph.rows.every(({ owningPublicContracts }) => owningPublicContracts.every((coordinate) => {
        if (coordinate.nestedSelector.selectorKind !== "flat_contract")
            return true;
        const contract = contracts.get(coordinate.flatRow.contractId);
        return contract !== undefined &&
            canonicalJson(coordinate.contractCatalog) ===
                canonicalJson(contractCatalog) &&
            coordinate.flatRow.contractVersion === contract.contractVersion &&
            coordinate.flatRow.contractDigest === contract.contractDigest;
    }));
}
export function verifiedArtifactMatchesResolvedLock(artifact, lock) {
    if (!isVerifiedProductArtifact(artifact) || !isResolvedProductLock(lock)) {
        return false;
    }
    return verifiedArtifactMatchesEstablishedLock(artifact, lock);
}
/** @internal Artifact and lock validity are established by their ingress owners. */
export function verifiedArtifactMatchesEstablishedLock(artifact, lock) {
    const matches = lock.rows.filter((row) => row.productId === artifact.productId);
    return matches.length === 1 &&
        canonicalJson(matches[0]) ===
            canonicalJson(lockRowFor(artifact));
}
export function isProductInstallCandidate(value, lock) {
    return isProductInstallCandidateWithLockCheck(value, lock, isResolvedProductLock);
}
/** @internal The enclosing owner has established this exact resolved lock. */
export function isProductInstallCandidateInResolvedLock(value, lock) {
    return isProductInstallCandidateWithLockCheck(value, lock, () => true);
}
function isProductInstallCandidateWithLockCheck(value, lock, checkLock) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "artifactDigest",
            "catalogDigest",
            "catalogId",
            "capabilityDefinitionGraph",
            "capabilityDefinitionGraphAsset",
            "compatibilityRefs",
            "contributionManifest",
            "contributionManifestDigest",
            "contributionManifestRef",
            "declaredCapabilityRefs",
            "declaredDependencies",
            "descriptorRef",
            "disposition",
            "installId",
            "installedRoot",
            "kind",
            "manifestDigest",
            "packageName",
            "packageVersion",
            "productContentDigest",
            "productId",
            "provenanceRef",
            "publicCapabilityRefs",
            "publicContractRefs",
            "publicContracts",
            "publisherNamespace",
            "resolvedLockDigest",
            "resolvedLockId",
            "schemaVersion",
        ]) ||
        value.kind !== "product_install_candidate" ||
        value.schemaVersion !== "5.0.0" ||
        value.disposition !== "materialized" ||
        !nonEmptyString(value.installId) ||
        !nonEmptyString(value.installedRoot) ||
        !isAbsolute(value.installedRoot) ||
        !checkLock(lock) ||
        value.resolvedLockId !== lock.lockId ||
        value.resolvedLockDigest !== lock.lockDigest) {
        return false;
    }
    const rows = lock.rows.filter((row) => row.productId === value.productId);
    if (rows.length !== 1)
        return false;
    const candidate = value;
    const expectedInstallId = `product-install://${candidate.packageName}/${candidate.packageVersion}/${candidate.productContentDigest.slice("sha256:".length)}/${lock.lockDigest.slice("sha256:".length)}`;
    return candidate.installId === expectedInstallId &&
        canonicalJson(lockRowFor(candidate)) === canonicalJson(rows[0]);
}
function productInstallCandidateProjection(install) {
    const { admissionEventRef: _admissionEventRef, kind: _kind, disposition: _disposition, ...body } = install;
    return {
        ...body,
        kind: "product_install_candidate",
        disposition: "materialized",
    };
}
/** Structural carrier guard only; ABG admission/currentness is not inferred. */
export function isProductInstall(value, lock) {
    if (!isRecord(value) ||
        value.kind !== "product_install" ||
        value.disposition !== "admitted" ||
        !nonEmptyString(value.admissionEventRef)) {
        return false;
    }
    return isProductInstallCandidate(productInstallCandidateProjection(value), lock);
}
export function productInstallCoordinate(install) {
    const candidate = productInstallCandidateProjection(install);
    return deepFreeze({
        ref: install.installId,
        digest: sha256Canonical(candidate),
    });
}
export function constructProductSet(installs, lock) {
    if (installs.length === 0) {
        return refusal("empty_product_set", "a ProductSet requires at least one admitted install");
    }
    const orderedInstallRefs = installs.map((install) => install.installId);
    if (new Set(orderedInstallRefs).size !== orderedInstallRefs.length) {
        return refusal("duplicate_install", "a ProductSet cannot contain duplicate install identities");
    }
    if (installs.some((install) => install.resolvedLockId !== lock.lockId ||
        install.resolvedLockDigest !== lock.lockDigest) ||
        canonicalJson(installs.map(lockRowFor)) !== canonicalJson(lock.rows)) {
        return refusal("lock_mismatch", "ProductSet installs and resolved lock rows disagree");
    }
    const productSetDigest = sha256Canonical({
        orderedInstallRefs,
        lockId: lock.lockId,
        lockDigest: lock.lockDigest,
    });
    return {
        kind: "product_set",
        schemaVersion: "5.0.0",
        productSetId: identity("product-set://abiogenesis", productSetDigest),
        productSetDigest,
        orderedInstallRefs,
        lockId: lock.lockId,
        lockDigest: lock.lockDigest,
    };
}
export function isProductSet(value, lock) {
    return isProductSetWithLockCheck(value, lock, isResolvedProductLock);
}
/** @internal The enclosing owner has established this exact resolved lock. */
export function isProductSetInResolvedLock(value, lock) {
    return isProductSetWithLockCheck(value, lock, () => true);
}
function isProductSetWithLockCheck(value, lock, checkLock) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "kind",
            "lockDigest",
            "lockId",
            "orderedInstallRefs",
            "productSetDigest",
            "productSetId",
            "schemaVersion",
        ]) ||
        value.kind !== "product_set" ||
        value.schemaVersion !== "5.0.0" ||
        !nonEmptyString(value.productSetId) ||
        !isSha256Digest(value.productSetDigest) ||
        !nonEmptyString(value.lockId) ||
        !isSha256Digest(value.lockDigest) ||
        !Array.isArray(value.orderedInstallRefs) ||
        value.orderedInstallRefs.length === 0 ||
        value.orderedInstallRefs.some((entry) => !nonEmptyString(entry)) ||
        new Set(value.orderedInstallRefs).size !== value.orderedInstallRefs.length ||
        !checkLock(lock) ||
        value.lockId !== lock.lockId ||
        value.lockDigest !== lock.lockDigest ||
        value.orderedInstallRefs.length !== lock.rows.length) {
        return false;
    }
    const expectedDigest = sha256Canonical({
        orderedInstallRefs: value.orderedInstallRefs,
        lockId: value.lockId,
        lockDigest: value.lockDigest,
    });
    return value.productSetDigest === expectedDigest &&
        value.productSetId ===
            identity("product-set://abiogenesis", expectedDigest);
}
export function constructWorkspaceAuthorityBasis(input) {
    const authorityManifest = {
        workspaceId: input.workspaceId,
        canonicalRoot: input.canonicalRoot,
        authorityMode: input.authorityMode,
        authorizedActorRef: input.authorizedActorRef,
    };
    if (input.workspaceId.length === 0 ||
        !isAbsolute(input.canonicalRoot) ||
        input.authorizedActorRef.length === 0 ||
        input.authorityManifestRef.length === 0 ||
        !isSha256Digest(input.authorityManifestDigest) ||
        input.authorityManifestDigest !==
            sha256Canonical(authorityManifest)) {
        return refusal("invalid_workspace_authority", "workspace authority fields must be explicit");
    }
    const authorityBasisDigest = sha256Canonical(input);
    return {
        kind: "workspace_authority_basis",
        schemaVersion: "5.0.0",
        ...input,
        authorityBasisId: identity("workspace-authority://abiogenesis", authorityBasisDigest),
        authorityBasisDigest,
    };
}
export function isWorkspaceAuthorityBasis(value) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "authorityBasisDigest",
            "authorityBasisId",
            "authorityManifestDigest",
            "authorityManifestRef",
            "authorityMode",
            "authorizedActorRef",
            "canonicalRoot",
            "kind",
            "schemaVersion",
            "workspaceId",
        ]) ||
        value.kind !== "workspace_authority_basis" ||
        value.schemaVersion !== "5.0.0" ||
        value.authorityMode !== "trusted_developer" ||
        !nonEmptyString(value.workspaceId) ||
        !nonEmptyString(value.canonicalRoot) ||
        !isAbsolute(value.canonicalRoot) ||
        !nonEmptyString(value.authorizedActorRef) ||
        !nonEmptyString(value.authorityManifestRef) ||
        !isSha256Digest(value.authorityManifestDigest) ||
        !nonEmptyString(value.authorityBasisId) ||
        !isSha256Digest(value.authorityBasisDigest))
        return false;
    const reconstructed = constructWorkspaceAuthorityBasis({
        workspaceId: value.workspaceId,
        canonicalRoot: value.canonicalRoot,
        authorityMode: value.authorityMode,
        authorizedActorRef: value.authorizedActorRef,
        authorityManifestRef: value.authorityManifestRef,
        authorityManifestDigest: value.authorityManifestDigest,
    });
    return reconstructed.kind === "workspace_authority_basis" &&
        canonicalJson(reconstructed) ===
            canonicalJson(value);
}
export function constructWorkspaceBinding(authority, productSet, lock, roots) {
    return constructWorkspaceBindingWithSetCheck(authority, productSet, lock, roots, isProductSet);
}
/** @internal Preserve ProductSet, authority and root relations over an established lock. */
export function constructWorkspaceBindingInResolvedLock(authority, productSet, lock, roots) {
    return constructWorkspaceBindingWithSetCheck(authority, productSet, lock, roots, isProductSetInResolvedLock);
}
function constructWorkspaceBindingWithSetCheck(authority, productSet, lock, roots, checkSet) {
    if (!isWorkspaceAuthorityBasis(authority) ||
        !checkSet(productSet, lock) ||
        !isRecord(roots) ||
        !hasExactKeys(roots, [
            "archiveRoot",
            "eventLogRoot",
            "productRoot",
            "projectionRoot",
            "runtimeStateRoot",
            "toolchainRoot",
        ]) ||
        Object.values(roots).some((root) => typeof root !== "string" || !isAbsolute(root))) {
        return refusal("invalid_declared_root", "workspace authority, ProductSet, and every declared root must be exact");
    }
    if (productSet.lockId !== lock.lockId || productSet.lockDigest !== lock.lockDigest) {
        return refusal("lock_mismatch", "workspace ProductSet and lock disagree");
    }
    const bindingBody = {
        workspaceId: authority.workspaceId,
        authorityBasisId: authority.authorityBasisId,
        authorityBasisDigest: authority.authorityBasisDigest,
        authorizedActorRef: authority.authorizedActorRef,
        productSetId: productSet.productSetId,
        productSetDigest: productSet.productSetDigest,
        lockId: lock.lockId,
        lockDigest: lock.lockDigest,
        roots,
    };
    const bindingDigest = sha256Canonical(bindingBody);
    return {
        kind: "workspace_binding_candidate",
        schemaVersion: "5.0.0",
        bindingId: identity("workspace-binding://abiogenesis", bindingDigest),
        bindingDigest,
        ...bindingBody,
    };
}
export function isWorkspaceBindingCandidate(value, lock, productSet, authority) {
    return workspaceBindingCandidateMatches(value, lock, productSet, authority, isResolvedProductLock);
}
/** @internal Only the lock premise is reused; candidate, set and authority remain checked. */
export function isWorkspaceBindingCandidateInResolvedLock(value, lock, productSet, authority) {
    return workspaceBindingCandidateMatches(value, lock, productSet, authority, () => true);
}
function workspaceBindingCandidateMatches(value, lock, productSet, authority, checkLock) {
    if (!isRecord(value) ||
        !hasExactKeys(value, [
            "authorityBasisDigest",
            "authorityBasisId",
            "authorizedActorRef",
            "bindingDigest",
            "bindingId",
            "kind",
            "lockDigest",
            "lockId",
            "productSetDigest",
            "productSetId",
            "roots",
            "schemaVersion",
            "workspaceId",
        ]) ||
        value.kind !== "workspace_binding_candidate" ||
        value.schemaVersion !== "5.0.0" ||
        !nonEmptyString(value.bindingId) ||
        !isSha256Digest(value.bindingDigest) ||
        !nonEmptyString(value.workspaceId) ||
        !nonEmptyString(value.authorityBasisId) ||
        !isSha256Digest(value.authorityBasisDigest) ||
        !nonEmptyString(value.authorizedActorRef) ||
        !nonEmptyString(value.productSetId) ||
        !isSha256Digest(value.productSetDigest) ||
        !(productSet === undefined
            ? checkLock(lock)
            : isProductSetWithLockCheck(productSet, lock, checkLock)) ||
        value.lockId !== lock.lockId ||
        value.lockDigest !== lock.lockDigest ||
        !isRecord(value.roots) ||
        !hasExactKeys(value.roots, [
            "archiveRoot",
            "eventLogRoot",
            "productRoot",
            "projectionRoot",
            "runtimeStateRoot",
            "toolchainRoot",
        ]) ||
        Object.values(value.roots).some((root) => !nonEmptyString(root) || !isAbsolute(root)) ||
        (productSet !== undefined &&
            (value.productSetId !== productSet.productSetId ||
                value.productSetDigest !== productSet.productSetDigest)) ||
        (authority !== undefined &&
            (!isWorkspaceAuthorityBasis(authority) ||
                value.workspaceId !== authority.workspaceId ||
                value.authorityBasisId !== authority.authorityBasisId ||
                value.authorityBasisDigest !== authority.authorityBasisDigest ||
                value.authorizedActorRef !== authority.authorizedActorRef))) {
        return false;
    }
    const body = {
        workspaceId: value.workspaceId,
        authorityBasisId: value.authorityBasisId,
        authorityBasisDigest: value.authorityBasisDigest,
        authorizedActorRef: value.authorizedActorRef,
        productSetId: value.productSetId,
        productSetDigest: value.productSetDigest,
        lockId: value.lockId,
        lockDigest: value.lockDigest,
        roots: value.roots,
    };
    const digest = sha256Canonical(body);
    // Exact keys and the checked authority/ProductSet coordinates reproduce the
    // constructor body; compare its digest/identity without constructing it again.
    return value.bindingDigest === digest &&
        value.bindingId === identity("workspace-binding://abiogenesis", digest);
}
