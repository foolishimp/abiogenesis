import { isRecord } from "../shared/admission_predicates.js";
import { sha256Canonical, } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { installedProductContentMatches } from "./install_product.js";
import { prepareInstalledProductModules } from "./installed_module.js";
const loadedProductSemantics = new WeakMap();
const projectedLeafSemantics = new WeakMap();
function projectionBody(value) {
    return value;
}
function mintInstalledLeafSemanticsProjection(basis, runtime) {
    const projectionDigest = sha256Canonical(projectionBody(basis));
    const projection = Object.freeze({
        kind: "installed_leaf_semantics_projection",
        schemaVersion: "5.0.0",
        projectionRef: `leaf-semantics://abiogenesis/${projectionDigest.slice("sha256:".length)}`,
        projectionDigest,
        ...basis,
    });
    projectedLeafSemantics.set(projection, runtime);
    return projection;
}
export function inspectProductLeafSemanticsProjection(value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return null;
    }
    const projection = value;
    const runtime = projectedLeafSemantics.get(value);
    if (runtime === undefined ||
        projection.kind !== "installed_leaf_semantics_projection" ||
        projection.schemaVersion !== "5.0.0" ||
        typeof projection.projectionRef !== "string" ||
        typeof projection.projectionDigest !== "string" ||
        typeof projection.installId !== "string" ||
        typeof projection.productContentDigest !== "string" ||
        typeof projection.manifestDigest !== "string" ||
        typeof projection.publicationDigest !== "string" ||
        typeof projection.bindingRef !== "string" ||
        typeof projection.packageName !== "string" ||
        typeof projection.packageVersion !== "string") {
        return null;
    }
    const expectedDigest = sha256Canonical(projectionBody({
        installId: projection.installId,
        productContentDigest: projection.productContentDigest,
        manifestDigest: projection.manifestDigest,
        publicationDigest: projection.publicationDigest,
        bindingRef: projection.bindingRef,
        packageName: projection.packageName,
        packageVersion: projection.packageVersion,
    }));
    if (projection.projectionDigest !== expectedDigest ||
        projection.projectionRef !==
            `leaf-semantics://abiogenesis/${expectedDigest.slice("sha256:".length)}`) {
        return null;
    }
    return {
        projection: projection,
        runtime,
    };
}
export async function loadInstalledProductSemantics(basis) {
    return loadProductSemantics(basis, () => prepareInstalledProductModules(basis.install));
}
/** Same-owner composition; the caller supplies this resolution's physical result. */
export async function productSemanticsFromModules(basis, prepared) {
    return loadProductSemantics(basis, async () => prepared);
}
async function loadProductSemantics(basis, prepare) {
    const binding = "publication" in basis
        ? basis.publication.productSemanticsBinding
        : basis.productSemanticsBinding;
    const publicationDigest = "publication" in basis
        ? sha256Canonical(basis.publication)
        : basis.publicationDigest;
    if (!basis.verifyInstallAdmission(basis.install) ||
        binding.packageName !== basis.install.packageName ||
        binding.packageVersion !== basis.install.packageVersion) {
        throw new TypeError("Product semantics requires one exact admitted install and publication binding");
    }
    const prepared = await prepare();
    if (prepared.kind !== "refused" && prepared.install !== basis.install) {
        throw new TypeError("Product semantics requires exact installed Product content");
    }
    const moduleResult = prepared.kind === "refused" ? prepared : await prepared.load(binding.modulePath);
    if (moduleResult.kind === "refused") {
        throw new TypeError(moduleResult.code === "path_escape"
            ? "Product semantics module escapes the admitted Product install"
            : moduleResult.code === "content_mismatch"
                ? "Product semantics requires exact installed Product content"
                : "Product semantics module cannot be loaded from the admitted Product install");
    }
    const loaded = moduleResult.module;
    const value = loaded[binding.namedSymbol];
    if (!isRecord(value) ||
        value.kind !== "product_semantics_provider" ||
        value.schemaVersion !== "5.0.0" ||
        value.bindingRef !== binding.bindingRef ||
        value.packageName !== binding.packageName ||
        value.packageVersion !== binding.packageVersion ||
        typeof value.admitInput !== "function" ||
        typeof value.evaluateInteractionResponse !== "function" ||
        typeof value.validateContractValue !== "function" ||
        typeof value.resolveJudgmentRelation !== "function" ||
        (value.resolveCatalogApplicationValue !== undefined &&
            typeof value.resolveCatalogApplicationValue !== "function") ||
        (value.resolveProbabilisticWorkerContracts !== undefined &&
            typeof value.resolveProbabilisticWorkerContracts !== "function") ||
        (value.validateResultEvidenceLineage !== undefined &&
            typeof value.validateResultEvidenceLineage !== "function") ||
        (value.validateInvocationBasis !== undefined &&
            typeof value.validateInvocationBasis !== "function") ||
        (value.projectPublicResult !== undefined &&
            typeof value.projectPublicResult !== "function") ||
        (value.publicResultProjectionKinds !== undefined &&
            (!Array.isArray(value.publicResultProjectionKinds) ||
                value.publicResultProjectionKinds.some((kind) => typeof kind !== "string" ||
                    kind.trim().length === 0) ||
                new Set(value.publicResultProjectionKinds).size !==
                    value.publicResultProjectionKinds.length))) {
        throw new TypeError("installed Product semantics provider differs from its published binding");
    }
    const provider = value;
    loadedProductSemantics.set(provider, {
        install: basis.install,
        publicationDigest,
        publication: "publication" in basis ? basis.publication : null,
    });
    return provider;
}
export function admitInstalledProductInput(semantics, contractRef, value) {
    if (!loadedProductSemantics.has(semantics)) {
        throw new TypeError("Product input admission requires the exact loaded Product semantics provider");
    }
    return semantics.admitInput(contractRef, value);
}
export function evaluateInstalledInteractionResponse(semantics, basis, responseCandidate) {
    if (!loadedProductSemantics.has(semantics)) {
        throw new TypeError("Product response evaluation requires the exact loaded Product semantics provider");
    }
    return semantics.evaluateInteractionResponse(basis, responseCandidate);
}
export function validateInstalledInvocationBasis(semantics, basis) {
    if (!loadedProductSemantics.has(semantics)) {
        throw new TypeError("Product invocation-basis validation requires the exact loaded Product semantics provider");
    }
    if (semantics.validateInvocationBasis === undefined &&
        basis.sourceResultBasis !== null) {
        return false;
    }
    return semantics.validateInvocationBasis?.(basis) ?? true;
}
export function hasInstalledPublicResultProjection(semantics) {
    if (!loadedProductSemantics.has(semantics)) {
        throw new TypeError("Product public-result capability requires the exact loaded Product semantics provider");
    }
    return (semantics.publicResultProjectionKinds ?? ["result"]).includes("result");
}
export function supportsInstalledPublicResultProjection(semantics, projectionKind) {
    if (!loadedProductSemantics.has(semantics)) {
        throw new TypeError("Product public-result roster requires the exact loaded Product semantics provider");
    }
    const roster = semantics.publicResultProjectionKinds ?? ["result"];
    return roster.includes(projectionKind);
}
export function projectInstalledPublicResult(semantics, basis) {
    if (!loadedProductSemantics.has(semantics)) {
        throw new TypeError("Product public-result projection requires the exact loaded Product semantics provider");
    }
    const projector = semantics.projectPublicResult;
    return projector === undefined && basis.projectionKind === "result"
        ? {
            kind: "product_public_result_projection",
            schemaVersion: "5.0.0",
            contractRef: basis.admittedResultContractRef,
            value: basis.value,
        }
        : projector?.(basis) ?? null;
}
export function projectInstalledLeafSemantics(semantics) {
    const basis = loadedProductSemantics.get(semantics);
    if (basis === undefined) {
        throw new TypeError("leaf semantics projection requires the exact loaded Product semantics provider");
    }
    const install = basis.install;
    const validateContractValue = semantics.validateContractValue.bind(semantics);
    const resolveJudgmentRelation = semantics.resolveJudgmentRelation.bind(semantics);
    const validateResultEvidenceLineage = semantics.validateResultEvidenceLineage?.bind(semantics) ??
        (() => true);
    const resolveProbabilisticWorkerContracts = semantics.resolveProbabilisticWorkerContracts?.bind(semantics) ??
        ((basis) => Object.freeze({
            instructionContractRef: basis.inputContractRef,
            resultContractRef: basis.outputContractRef,
        }));
    return mintInstalledLeafSemanticsProjection({
        installId: install.installId,
        productContentDigest: install.productContentDigest,
        manifestDigest: install.manifestDigest,
        publicationDigest: basis.publicationDigest,
        bindingRef: semantics.bindingRef,
        packageName: semantics.packageName,
        packageVersion: semantics.packageVersion,
    }, {
        verifyInstalledContent: () => installedProductContentMatches(install),
        validateContractValue,
        resolveJudgmentRelation,
        validateResultEvidenceLineage,
        resolveProbabilisticWorkerContracts,
    });
}
