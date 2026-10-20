import { isRecord } from "../shared/admission_predicates.js";
import { isGraphValidation, } from "../validator/graph.js";
import { isProgramValidation, } from "../validator/validation.js";
import { lookupGraphFunctionDefinition, } from "./catalog.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { resolveExactMatch } from "./exact_match.js";
import { prepareInstalledProductModules } from "./installed_module.js";
import { isResolvedExecutionDeclarationClosure, } from "./declaration_closure.js";
import { modulePublicationSemanticDigest } from "./publication.js";
export async function loadInstalledImplementationDescriptors(install, publication) {
    if (publication.implementationBindings.some((binding) => binding.packageName !== install.packageName ||
        binding.packageVersion !== install.packageVersion)) {
        return setRefusal("implementation_absent", null, "published implementation bindings are not carried by the exact admitted Product install");
    }
    return implementationDescriptorsFromProduct(install, publication, await prepareInstalledProductModules(install));
}
/** Internal composition consumes the physical result of this resolution. */
export async function implementationDescriptorsFromProduct(install, publication, prepared) {
    if (publication.implementationBindings.some((binding) => binding.packageName !== install.packageName ||
        binding.packageVersion !== install.packageVersion)) {
        return setRefusal("implementation_absent", null, "published implementation bindings are not carried by the exact admitted Product install");
    }
    if (prepared.kind === "refused" || prepared.install !== install) {
        return setRefusal("implementation_absent", null, publication.implementationBindings.length === 0
            ? "published implementation bindings are not carried by the exact admitted Product install"
            : "published implementation module differs from the admitted Product install");
    }
    const descriptors = [];
    const modulePaths = [...new Set(publication.implementationBindings.map((binding) => binding.modulePath))];
    for (const modulePath of modulePaths) {
        const moduleResult = await prepared.load(modulePath);
        if (moduleResult.kind === "refused") {
            return setRefusal("implementation_absent", null, moduleResult.code === "path_escape"
                ? "published implementation module escapes the admitted Product install"
                : moduleResult.code === "content_mismatch"
                    ? "published implementation module differs from the admitted Product install"
                    : "published implementation module cannot be loaded from the admitted Product install");
        }
        descriptors.push(...Object.values(moduleResult.module).filter(isPackagedLeafImplementationDescriptor));
    }
    return Object.freeze(descriptors);
}
const candidates = new WeakSet();
const setCandidates = new WeakSet();
const leafCandidates = new WeakSet();
export function isPackagedLeafImplementationDescriptor(value) {
    if (!isRecord(value))
        return false;
    const body = {
        implementationRef: value.implementationRef,
        packageName: value.packageName,
        packageVersion: value.packageVersion,
        modulePath: value.modulePath,
        namedSymbol: value.namedSymbol,
        computeRegime: value.computeRegime,
        inputContractRef: value.inputContractRef,
        outputContractRef: value.outputContractRef,
        failureContractRef: value.failureContractRef,
        refusalContractRef: value.refusalContractRef,
    };
    return value.kind === "packaged_leaf_implementation_descriptor" &&
        value.schemaVersion === "5.0.0" &&
        typeof value.descriptorDigest === "string" &&
        /^sha256:[a-f0-9]{64}$/u.test(value.descriptorDigest) &&
        Object.values(body).every((field) => typeof field === "string" && field.length > 0) &&
        (value.computeRegime === "F_D" || value.computeRegime === "F_P") &&
        value.descriptorDigest === sha256Canonical(body);
}
export function isImplementationResolutionCandidate(value) {
    return candidates.has(value);
}
export function isImplementationResolutionSetCandidate(value) {
    return setCandidates.has(value);
}
export function isLeafImplementationResolutionCandidate(value) {
    return leafCandidates.has(value);
}
function refusal(code, message) {
    return {
        kind: "implementation_resolution_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        message,
    };
}
function setRefusal(code, requirementKey, message) {
    return {
        kind: "implementation_resolution_set_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        code,
        requirementKey,
        message,
    };
}
function resolveValidatedLeaf(catalogView, declarationClosure, programValidation, declaration, packagedImplementations) {
    const publications = declarationClosure.publications;
    const requiresCallerSelection = declaration.graphFunctionRef ===
        declarationClosure.selectedGraphFunctionRef;
    const selectedRowLookup = requiresCallerSelection
        ? lookupGraphFunctionDefinition(catalogView, declaration.graphFunctionRef, programValidation.programRef)
        : null;
    const selectedRow = selectedRowLookup?.kind ===
        "graph_function_definition_lookup_exact"
        ? selectedRowLookup.entry
        : null;
    const graphFunctionMatch = resolveExactMatch(publications.flatMap((publication) => publication.graphFunctions), (value) => value.name === declaration.graphFunctionRef);
    if ((requiresCallerSelection && selectedRow === null) ||
        graphFunctionMatch.kind !== "one" ||
        (selectedRow !== null &&
            (selectedRow.kind !== "graph_function_catalog_entry" ||
                selectedRow.definitionRef !== declaration.graphFunctionRef)) ||
        sha256Canonical(graphFunctionMatch.value) !==
            declaration.graphFunctionDigest) {
        return setRefusal("selection_mismatch", declaration.requirementKey, "validated executable leaf is not selected under the exact catalog and Program basis");
    }
    const graphFunctionOwnerMatches = publications.filter((publication) => publication.graphFunctions.some((value) => value.name === declaration.graphFunctionRef &&
        sha256Canonical(value) ===
            declaration.graphFunctionDigest));
    if (graphFunctionOwnerMatches.length !== 1 ||
        (selectedRow !== null &&
            (selectedRow.owningProductId !==
                graphFunctionOwnerMatches[0].owningProductId ||
                selectedRow.publicationDigest !==
                    modulePublicationSemanticDigest(graphFunctionOwnerMatches[0]))) ||
        declarationClosure.graphFunctionOwners.filter((owner) => owner.declarationRef === declaration.graphFunctionRef &&
            owner.productId === graphFunctionOwnerMatches[0].owningProductId &&
            owner.moduleRef === graphFunctionOwnerMatches[0].moduleRef &&
            owner.publicationDigest ===
                modulePublicationSemanticDigest(graphFunctionOwnerMatches[0])).length !== 1) {
        return setRefusal("selection_mismatch", declaration.requirementKey, "catalog selection and GraphFunction publication owner disagree");
    }
    const matchingBindings = publications.flatMap((publication) => publication.implementationBindings).filter((binding) => binding.bindingRef === declaration.requirement.implementationBindingRef);
    if (matchingBindings.length === 0) {
        return setRefusal("implementation_absent", declaration.requirementKey, "validated executable leaf lacks one published ImplementationBinding");
    }
    if (matchingBindings.length !== 1) {
        return setRefusal("ambiguous_implementation", declaration.requirementKey, "validated executable leaf resolves more than one published ImplementationBinding");
    }
    const binding = matchingBindings[0];
    const implementationOwnerMatches = publications.filter((publication) => publication.implementationBindings.some((candidate) => candidate.bindingRef === binding.bindingRef &&
        sha256Canonical(candidate) ===
            sha256Canonical(binding)));
    if (implementationOwnerMatches.length !== 1) {
        return setRefusal("ambiguous_implementation", declaration.requirementKey, "ImplementationBinding does not resolve to one exact publication owner");
    }
    const graphFunctionOwner = graphFunctionOwnerMatches[0];
    const implementationOwner = implementationOwnerMatches[0];
    if (declarationClosure.implementationBindingOwners.filter((owner) => owner.declarationRef === binding.bindingRef &&
        owner.productId === implementationOwner.owningProductId &&
        owner.moduleRef === implementationOwner.moduleRef &&
        owner.publicationDigest ===
            modulePublicationSemanticDigest(implementationOwner)).length !== 1 ||
        binding.computeRegime !== declaration.fibre ||
        binding.inputContractRef !== declaration.requirement.inputContractRef ||
        binding.outputContractRef !== declaration.requirement.outputContractRef ||
        binding.failureContractRef !== declaration.requirement.failureContractRef ||
        binding.refusalContractRef !== declaration.requirement.refusalContractRef) {
        return setRefusal("contract_mismatch", declaration.requirementKey, "validated executable leaf and ImplementationBinding contracts disagree");
    }
    const descriptors = packagedImplementations.filter((descriptor) => isPackagedLeafImplementationDescriptor(descriptor) &&
        descriptor.implementationRef === binding.implementationRef &&
        descriptor.packageName === binding.packageName &&
        descriptor.packageVersion === binding.packageVersion &&
        descriptor.modulePath === binding.modulePath &&
        descriptor.namedSymbol === binding.namedSymbol &&
        descriptor.computeRegime === binding.computeRegime &&
        descriptor.inputContractRef === binding.inputContractRef &&
        descriptor.outputContractRef === binding.outputContractRef &&
        descriptor.failureContractRef === binding.failureContractRef &&
        descriptor.refusalContractRef === binding.refusalContractRef);
    if (descriptors.length === 0) {
        return setRefusal("implementation_absent", declaration.requirementKey, "no packaged LeafImplementation matches the validated executable requirement");
    }
    if (descriptors.length !== 1) {
        return setRefusal("ambiguous_implementation", declaration.requirementKey, "more than one packaged LeafImplementation matches the validated executable requirement");
    }
    const descriptor = descriptors[0];
    const allContracts = publications.flatMap((publication) => publication.contracts.filter((contract) => declarationClosure.contractOwners.some((owner) => owner.declarationRef === contract.contractRef &&
        owner.productId === publication.owningProductId &&
        owner.moduleRef === publication.moduleRef &&
        owner.publicationDigest ===
            modulePublicationSemanticDigest(publication))));
    if ([
        declaration.requirement.inputContractRef,
        declaration.requirement.outputContractRef,
        declaration.requirement.evidenceContractRef,
        declaration.requirement.failureContractRef,
        declaration.requirement.refusalContractRef,
        declaration.requirement.judgmentContractRef,
    ].some((contractRef) => allContracts.filter((contract) => contract.contractRef === contractRef)
        .length !== 1)) {
        return setRefusal("contract_mismatch", declaration.requirementKey, "validated executable requirement references an unpublished contract");
    }
    const body = {
        requirementKey: declaration.requirementKey,
        requirementKeyDigest: declaration.requirementKeyDigest,
        catalogBasisDigest: catalogView.catalogBasisDigest,
        catalogViewDigest: catalogView.viewDigest,
        publicationDigest: programValidation.publicationDigest,
        programValidationRef: programValidation.validationRef,
        graphFunctionRef: declaration.graphFunctionRef,
        graphFunctionDigest: declaration.graphFunctionDigest,
        graphFunctionOwnerProductId: graphFunctionOwner.owningProductId,
        graphFunctionPublicationDigest: modulePublicationSemanticDigest(graphFunctionOwner),
        nodeRef: declaration.nodeRef,
        programLocusRef: declaration.programLocusRef,
        implementationBindingRef: binding.bindingRef,
        implementationRef: binding.implementationRef,
        packageName: binding.packageName,
        packageVersion: binding.packageVersion,
        modulePath: binding.modulePath,
        namedSymbol: binding.namedSymbol,
        computeRegime: binding.computeRegime,
        inputContractRef: binding.inputContractRef,
        outputContractRef: binding.outputContractRef,
        failureContractRef: binding.failureContractRef,
        refusalContractRef: binding.refusalContractRef,
        implementationBindingDigest: sha256Canonical(binding),
        implementationDescriptorDigest: descriptor.descriptorDigest,
        implementationOwnerProductId: implementationOwner.owningProductId,
        implementationPublicationDigest: modulePublicationSemanticDigest(implementationOwner),
    };
    const leafResolutionCandidateDigest = sha256Canonical(body);
    const candidate = deepFreeze({
        kind: "leaf_implementation_resolution_candidate",
        schemaVersion: "5.0.0",
        disposition: "candidate",
        leafResolutionCandidateRef: `leaf-resolution-candidate://abiogenesis/${leafResolutionCandidateDigest.slice("sha256:".length)}`,
        leafResolutionCandidateDigest,
        ...body,
    });
    leafCandidates.add(candidate);
    return candidate;
}
export function resolveImplementationSet(catalogView, declarationClosure, programValidation, packagedImplementations) {
    const publications = declarationClosure.publications;
    const rootPublicationMatches = publications.filter((publication) => sha256Canonical(publication) ===
        programValidation.publicationDigest);
    const selectedGraphFunctionRefs = new Set(declarationClosure.graphFunctionOwners.map((owner) => owner.declarationRef));
    const selectedExecutableRows = programValidation.executableLeafRows.filter((row) => selectedGraphFunctionRefs.has(row.graphFunctionRef));
    if (!isProgramValidation(programValidation) ||
        !isResolvedExecutionDeclarationClosure(declarationClosure) ||
        declarationClosure.catalogViewDigest !== catalogView.viewDigest ||
        declarationClosure.programRef !== programValidation.programRef ||
        rootPublicationMatches.length !== 1) {
        return setRefusal("invalid_program_validation", null, "implementation-set resolution requires exact ProgramValidation and publication");
    }
    const rows = [];
    for (const declaration of selectedExecutableRows) {
        const resolved = resolveValidatedLeaf(catalogView, declarationClosure, programValidation, declaration, packagedImplementations);
        if (resolved.kind === "implementation_resolution_set_refusal")
            return resolved;
        rows.push(resolved);
    }
    const body = {
        catalogBasisDigest: catalogView.catalogBasisDigest,
        catalogViewDigest: catalogView.viewDigest,
        publicationDigest: programValidation.publicationDigest,
        programValidationRef: programValidation.validationRef,
        executableLeafKeys: selectedExecutableRows.map((row) => row.requirementKey),
        rows,
    };
    const setCandidateDigest = sha256Canonical(body);
    const candidate = deepFreeze({
        kind: "implementation_resolution_set_candidate",
        schemaVersion: "5.0.0",
        disposition: "candidate",
        setCandidateRef: `implementation-resolution-set-candidate://abiogenesis/${setCandidateDigest.slice("sha256:".length)}`,
        setCandidateDigest,
        ...body,
    });
    setCandidates.add(candidate);
    return candidate;
}
export function resolveImplementation(catalogView, declarationClosure, programValidation, graphValidation, graphFunctionRef, nodeRef, packagedImplementations) {
    const publications = declarationClosure.publications;
    if (!isProgramValidation(programValidation) ||
        !isResolvedExecutionDeclarationClosure(declarationClosure) ||
        declarationClosure.catalogViewDigest !== catalogView.viewDigest ||
        publications.filter((publication) => programValidation.publicationDigest ===
            sha256Canonical(publication)).length !== 1 ||
        !isGraphValidation(graphValidation) ||
        graphValidation.programValidationRef !== programValidation.validationRef ||
        graphValidation.graphFunctionRef !== graphFunctionRef) {
        return refusal("invalid_program_validation", "implementation resolution requires exact ProgramValidation");
    }
    const graphFunctionMatch = resolveExactMatch(publications.flatMap((publication) => publication.graphFunctions), (value) => value.name === graphFunctionRef);
    if (graphFunctionMatch.kind !== "one" ||
        graphValidation.graphFunctionDigest !==
            sha256Canonical(graphFunctionMatch.value)) {
        return refusal("invalid_program_validation", "GraphValidation does not bind the exact GraphFunction");
    }
    const set = resolveImplementationSet(catalogView, declarationClosure, programValidation, packagedImplementations);
    if (set.kind === "implementation_resolution_set_refusal") {
        return refusal(set.code === "set_mismatch" ? "invalid_program_validation" : set.code, set.message);
    }
    const match = resolveExactMatch(set.rows, (row) => row.graphFunctionRef === graphFunctionRef && row.nodeRef === nodeRef);
    if (match.kind === "absent") {
        return refusal("implementation_absent", "declared graph node has no executable resolution row");
    }
    if (match.kind === "many") {
        return refusal("ambiguous_implementation", "declared graph node has more than one executable resolution row");
    }
    const leaf = match.value;
    const body = {
        catalogBasisDigest: leaf.catalogBasisDigest,
        catalogViewDigest: leaf.catalogViewDigest,
        publicationDigest: leaf.publicationDigest,
        programValidationRef: leaf.programValidationRef,
        graphValidationRef: graphValidation.validationRef,
        graphValidationDigest: graphValidation.validationDigest,
        graphFunctionRef: leaf.graphFunctionRef,
        graphFunctionDigest: leaf.graphFunctionDigest,
        graphFunctionOwnerProductId: leaf.graphFunctionOwnerProductId,
        graphFunctionPublicationDigest: leaf.graphFunctionPublicationDigest,
        nodeRef: leaf.nodeRef,
        implementationBindingRef: leaf.implementationBindingRef,
        implementationRef: leaf.implementationRef,
        packageName: leaf.packageName,
        packageVersion: leaf.packageVersion,
        modulePath: leaf.modulePath,
        namedSymbol: leaf.namedSymbol,
        computeRegime: leaf.computeRegime,
        inputContractRef: leaf.inputContractRef,
        outputContractRef: leaf.outputContractRef,
        failureContractRef: leaf.failureContractRef,
        refusalContractRef: leaf.refusalContractRef,
        implementationBindingDigest: leaf.implementationBindingDigest,
        implementationDescriptorDigest: leaf.implementationDescriptorDigest,
        implementationOwnerProductId: leaf.implementationOwnerProductId,
        implementationPublicationDigest: leaf.implementationPublicationDigest,
    };
    const resolutionCandidateDigest = sha256Canonical(body);
    const candidate = deepFreeze({
        kind: "implementation_resolution_candidate",
        schemaVersion: "5.0.0",
        disposition: "candidate",
        resolutionCandidateRef: `implementation-resolution-candidate://abiogenesis/${resolutionCandidateDigest.slice("sha256:".length)}`,
        resolutionCandidateDigest,
        ...body,
    });
    candidates.add(candidate);
    return candidate;
}
