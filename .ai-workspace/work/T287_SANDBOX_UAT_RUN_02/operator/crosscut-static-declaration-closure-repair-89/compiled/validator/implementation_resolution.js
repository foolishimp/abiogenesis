import { isExecutableCLeaf } from "../gtl/c_algebra.js";
import { isImplementationResolutionCandidate, isImplementationResolutionSetCandidate, isLeafImplementationResolutionCandidate, isPackagedLeafImplementationDescriptor, } from "../product/implementation_resolution.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Canonical } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import { isResolvedExecutionDeclarationClosure, } from "../product/declaration_closure.js";
import { modulePublicationSemanticDigest } from "../product/publication.js";
import { isGraphValidation, } from "./graph.js";
import { isProgramValidation, } from "./validation.js";
const validations = new WeakSet();
const setValidations = new WeakSet();
export function isImplementationResolutionValidation(value) {
    return validations.has(value);
}
export function isImplementationResolutionSetValidation(value) {
    return setValidations.has(value);
}
function invalid(subjectDigest, diagnostic) {
    return {
        kind: "static_validation_refusal",
        schemaVersion: "5.0.0",
        disposition: "invalid",
        stage: "implementation_resolution",
        subjectDigest,
        diagnostics: [diagnostic],
    };
}
export function validateImplementationResolution(candidate, publication, programValidation, graphValidation, graphFunction, descriptor) {
    if (!isImplementationResolutionCandidate(candidate)) {
        return invalid(candidate.resolutionCandidateDigest, {
            code: "raw_subject_mismatch",
            path: "$",
            message: "resolution candidate was not constructed by the Product boundary",
        });
    }
    const binding = publication.implementationBindings.find((value) => value.bindingRef === candidate.implementationBindingRef);
    const node = graphFunction.template.nodes.find((value) => value.nodeRef === candidate.nodeRef);
    const term = node?.term;
    const candidateBody = {
        catalogBasisDigest: candidate.catalogBasisDigest,
        catalogViewDigest: candidate.catalogViewDigest,
        publicationDigest: candidate.publicationDigest,
        programValidationRef: candidate.programValidationRef,
        graphValidationRef: candidate.graphValidationRef,
        graphValidationDigest: candidate.graphValidationDigest,
        graphFunctionRef: candidate.graphFunctionRef,
        graphFunctionDigest: candidate.graphFunctionDigest,
        graphFunctionOwnerProductId: candidate.graphFunctionOwnerProductId,
        graphFunctionPublicationDigest: candidate.graphFunctionPublicationDigest,
        nodeRef: candidate.nodeRef,
        implementationBindingRef: candidate.implementationBindingRef,
        implementationRef: candidate.implementationRef,
        packageName: candidate.packageName,
        packageVersion: candidate.packageVersion,
        modulePath: candidate.modulePath,
        namedSymbol: candidate.namedSymbol,
        computeRegime: candidate.computeRegime,
        inputContractRef: candidate.inputContractRef,
        outputContractRef: candidate.outputContractRef,
        failureContractRef: candidate.failureContractRef,
        refusalContractRef: candidate.refusalContractRef,
        implementationBindingDigest: candidate.implementationBindingDigest,
        implementationDescriptorDigest: candidate.implementationDescriptorDigest,
        implementationOwnerProductId: candidate.implementationOwnerProductId,
        implementationPublicationDigest: candidate.implementationPublicationDigest,
    };
    if (!isProgramValidation(programValidation) ||
        !isGraphValidation(graphValidation) ||
        !isPackagedLeafImplementationDescriptor(descriptor) ||
        candidate.resolutionCandidateDigest !== sha256Canonical(candidateBody) ||
        candidate.publicationDigest !== sha256Canonical(publication) ||
        candidate.programValidationRef !== programValidation.validationRef ||
        candidate.graphValidationRef !== graphValidation.validationRef ||
        candidate.graphValidationDigest !== graphValidation.validationDigest ||
        candidate.graphFunctionRef !== graphFunction.name ||
        candidate.graphFunctionDigest !== sha256Canonical(graphFunction) ||
        graphValidation.graphFunctionRef !== graphFunction.name ||
        graphValidation.graphFunctionDigest !== candidate.graphFunctionDigest ||
        binding === undefined ||
        term === undefined ||
        !isExecutableCLeaf(term) ||
        term.requirement.implementationBindingRef !== binding.bindingRef ||
        binding.implementationRef !== candidate.implementationRef ||
        candidate.implementationBindingDigest !== sha256Canonical(binding) ||
        binding.implementationRef !== candidate.implementationRef ||
        binding.packageName !== candidate.packageName ||
        binding.packageVersion !== candidate.packageVersion ||
        binding.modulePath !== candidate.modulePath ||
        binding.namedSymbol !== candidate.namedSymbol ||
        binding.computeRegime !== candidate.computeRegime ||
        binding.inputContractRef !== candidate.inputContractRef ||
        binding.outputContractRef !== candidate.outputContractRef ||
        binding.failureContractRef !== candidate.failureContractRef ||
        binding.refusalContractRef !== candidate.refusalContractRef ||
        descriptor.descriptorDigest !== candidate.implementationDescriptorDigest ||
        descriptor.implementationRef !== candidate.implementationRef ||
        descriptor.packageName !== candidate.packageName ||
        descriptor.packageVersion !== candidate.packageVersion ||
        descriptor.modulePath !== candidate.modulePath ||
        descriptor.namedSymbol !== candidate.namedSymbol ||
        descriptor.computeRegime !== candidate.computeRegime ||
        descriptor.inputContractRef !== candidate.inputContractRef ||
        descriptor.outputContractRef !== candidate.outputContractRef ||
        descriptor.failureContractRef !== candidate.failureContractRef ||
        descriptor.refusalContractRef !== candidate.refusalContractRef) {
        return invalid(candidate.resolutionCandidateDigest, {
            code: "invalid_reference",
            path: "$",
            message: "implementation resolution does not preserve exact declaration, package, and contract identity",
        });
    }
    const body = {
        resolutionCandidateRef: candidate.resolutionCandidateRef,
        resolutionCandidateDigest: candidate.resolutionCandidateDigest,
        programValidationRef: programValidation.validationRef,
        graphValidationRef: graphValidation.validationRef,
        graphFunctionRef: graphFunction.name,
        implementationBindingRef: candidate.implementationBindingRef,
        implementationRef: candidate.implementationRef,
    };
    const validationDigest = sha256Canonical(body);
    const validation = deepFreeze({
        kind: "implementation_resolution_validation",
        schemaVersion: "5.0.0",
        disposition: "valid",
        validationRef: `implementation-resolution-validation://abiogenesis/${validationDigest.slice("sha256:".length)}`,
        validationDigest,
        ...body,
        diagnostics: [],
    });
    validations.add(validation);
    return validation;
}
function leafCandidateBody(candidate) {
    return {
        requirementKey: candidate.requirementKey,
        requirementKeyDigest: candidate.requirementKeyDigest,
        catalogBasisDigest: candidate.catalogBasisDigest,
        catalogViewDigest: candidate.catalogViewDigest,
        publicationDigest: candidate.publicationDigest,
        programValidationRef: candidate.programValidationRef,
        graphFunctionRef: candidate.graphFunctionRef,
        graphFunctionDigest: candidate.graphFunctionDigest,
        graphFunctionOwnerProductId: candidate.graphFunctionOwnerProductId,
        graphFunctionPublicationDigest: candidate.graphFunctionPublicationDigest,
        nodeRef: candidate.nodeRef,
        programLocusRef: candidate.programLocusRef,
        implementationBindingRef: candidate.implementationBindingRef,
        implementationRef: candidate.implementationRef,
        packageName: candidate.packageName,
        packageVersion: candidate.packageVersion,
        modulePath: candidate.modulePath,
        namedSymbol: candidate.namedSymbol,
        computeRegime: candidate.computeRegime,
        inputContractRef: candidate.inputContractRef,
        outputContractRef: candidate.outputContractRef,
        failureContractRef: candidate.failureContractRef,
        refusalContractRef: candidate.refusalContractRef,
        implementationBindingDigest: candidate.implementationBindingDigest,
        implementationDescriptorDigest: candidate.implementationDescriptorDigest,
        implementationOwnerProductId: candidate.implementationOwnerProductId,
        implementationPublicationDigest: candidate.implementationPublicationDigest,
    };
}
export function validateImplementationResolutionSet(candidate, catalogView, declarationClosure, programValidation, descriptors) {
    const publications = declarationClosure.publications;
    const selectedGraphFunctionRefs = new Set(declarationClosure.graphFunctionOwners.map((owner) => owner.declarationRef));
    const selectedExecutableRows = programValidation.executableLeafRows.filter((row) => selectedGraphFunctionRefs.has(row.graphFunctionRef));
    const subjectDigest = candidate.setCandidateDigest;
    if (!isImplementationResolutionSetCandidate(candidate) ||
        candidate.rows.some((row) => !isLeafImplementationResolutionCandidate(row))) {
        return invalid(subjectDigest, {
            code: "raw_subject_mismatch",
            path: "$",
            message: "resolution set was not constructed by the Product boundary",
        });
    }
    const setBody = {
        catalogBasisDigest: candidate.catalogBasisDigest,
        catalogViewDigest: candidate.catalogViewDigest,
        publicationDigest: candidate.publicationDigest,
        programValidationRef: candidate.programValidationRef,
        executableLeafKeys: candidate.executableLeafKeys,
        rows: candidate.rows,
    };
    const catalogViewDigest = sha256Canonical({
        catalogBasisDigest: catalogView.catalogBasisDigest,
        allowlist: catalogView.allowlist,
        entries: catalogView.entries.map((entry) => entry.entryDigest),
        declarationEntries: catalogView.declarationEntries.map((entry) => entry.entryDigest),
    });
    if (!isProgramValidation(programValidation) ||
        !isResolvedExecutionDeclarationClosure(declarationClosure) ||
        declarationClosure.catalogViewDigest !== catalogView.viewDigest ||
        declarationClosure.programRef !== programValidation.programRef ||
        candidate.setCandidateDigest !== sha256Canonical(setBody) ||
        publications.filter((publication) => candidate.publicationDigest ===
            sha256Canonical(publication)).length !== 1 ||
        candidate.publicationDigest !== programValidation.publicationDigest ||
        candidate.programValidationRef !== programValidation.validationRef ||
        candidate.catalogBasisDigest !== catalogView.catalogBasisDigest ||
        candidate.catalogViewDigest !== catalogView.viewDigest ||
        catalogViewDigest !== catalogView.viewDigest ||
        canonicalJson(candidate.executableLeafKeys) !==
            canonicalJson(selectedExecutableRows.map((row) => row.requirementKey)) ||
        candidate.rows.length !== selectedExecutableRows.length) {
        return invalid(subjectDigest, {
            code: "invalid_reference",
            path: "$",
            message: "resolution set does not preserve the exact catalog, publication, Program, and executable-key basis",
        });
    }
    const contracts = publications.flatMap((publication) => publication.contracts.filter((contract) => declarationClosure.contractOwners.some((owner) => owner.declarationRef === contract.contractRef &&
        owner.productId === publication.owningProductId &&
        owner.moduleRef === publication.moduleRef &&
        owner.publicationDigest ===
            modulePublicationSemanticDigest(publication))));
    for (const [index, row] of candidate.rows.entries()) {
        const declaration = selectedExecutableRows[index];
        const graphFunctions = publications.flatMap((publication) => publication.graphFunctions).filter((value) => value.name === row.graphFunctionRef);
        const graphFunction = graphFunctions[0];
        const graphFunctionOwners = publications.filter((publication) => publication.graphFunctions.some((value) => value.name === row.graphFunctionRef &&
            sha256Canonical(value) ===
                row.graphFunctionDigest));
        const bindings = publications.flatMap((publication) => publication.implementationBindings).filter((value) => value.bindingRef === row.implementationBindingRef);
        const binding = bindings[0];
        const implementationOwners = binding === undefined
            ? []
            : publications.filter((publication) => publication.implementationBindings.some((value) => value.bindingRef === binding.bindingRef &&
                sha256Canonical(value) ===
                    sha256Canonical(binding)));
        const matchingDescriptors = descriptors.filter((descriptor) => isPackagedLeafImplementationDescriptor(descriptor) &&
            descriptor.descriptorDigest === row.implementationDescriptorDigest &&
            descriptor.implementationRef === row.implementationRef &&
            descriptor.packageName === row.packageName &&
            descriptor.packageVersion === row.packageVersion &&
            descriptor.modulePath === row.modulePath &&
            descriptor.namedSymbol === row.namedSymbol &&
            descriptor.computeRegime === row.computeRegime &&
            descriptor.inputContractRef === row.inputContractRef &&
            descriptor.outputContractRef === row.outputContractRef &&
            descriptor.failureContractRef === row.failureContractRef &&
            descriptor.refusalContractRef === row.refusalContractRef);
        if (declaration === undefined ||
            row.requirementKey !== candidate.executableLeafKeys[index] ||
            row.requirementKey !== declaration.requirementKey ||
            row.requirementKeyDigest !== declaration.requirementKeyDigest ||
            row.programValidationRef !== programValidation.validationRef ||
            row.catalogBasisDigest !== catalogView.catalogBasisDigest ||
            row.catalogViewDigest !== catalogView.viewDigest ||
            row.publicationDigest !== candidate.publicationDigest ||
            row.leafResolutionCandidateDigest !==
                sha256Canonical(leafCandidateBody(row)) ||
            graphFunctions.length !== 1 ||
            graphFunction === undefined ||
            row.graphFunctionRef !== declaration.graphFunctionRef ||
            row.graphFunctionDigest !== declaration.graphFunctionDigest ||
            row.graphFunctionDigest !== sha256Canonical(graphFunction) ||
            graphFunctionOwners.length !== 1 ||
            row.graphFunctionOwnerProductId !==
                graphFunctionOwners[0].owningProductId ||
            row.graphFunctionPublicationDigest !==
                modulePublicationSemanticDigest(graphFunctionOwners[0]) ||
            declarationClosure.graphFunctionOwners.filter((owner) => owner.declarationRef === row.graphFunctionRef &&
                owner.productId === graphFunctionOwners[0].owningProductId &&
                owner.moduleRef === graphFunctionOwners[0].moduleRef &&
                owner.publicationDigest === row.graphFunctionPublicationDigest).length !== 1 ||
            row.nodeRef !== declaration.nodeRef ||
            row.programLocusRef !== declaration.programLocusRef ||
            bindings.length !== 1 ||
            binding === undefined ||
            row.implementationBindingDigest !== sha256Canonical(binding) ||
            binding.bindingRef !== declaration.requirement.implementationBindingRef ||
            binding.implementationRef !== row.implementationRef ||
            binding.packageName !== row.packageName ||
            binding.packageVersion !== row.packageVersion ||
            binding.modulePath !== row.modulePath ||
            binding.namedSymbol !== row.namedSymbol ||
            binding.computeRegime !== declaration.fibre ||
            binding.computeRegime !== row.computeRegime ||
            binding.inputContractRef !== declaration.requirement.inputContractRef ||
            binding.inputContractRef !== row.inputContractRef ||
            binding.outputContractRef !== declaration.requirement.outputContractRef ||
            binding.outputContractRef !== row.outputContractRef ||
            binding.failureContractRef !== declaration.requirement.failureContractRef ||
            binding.failureContractRef !== row.failureContractRef ||
            binding.refusalContractRef !== declaration.requirement.refusalContractRef ||
            binding.refusalContractRef !== row.refusalContractRef ||
            implementationOwners.length !== 1 ||
            row.implementationOwnerProductId !==
                implementationOwners[0].owningProductId ||
            row.implementationPublicationDigest !==
                modulePublicationSemanticDigest(implementationOwners[0]) ||
            declarationClosure.implementationBindingOwners.filter((owner) => owner.declarationRef === row.implementationBindingRef &&
                owner.productId === implementationOwners[0].owningProductId &&
                owner.moduleRef === implementationOwners[0].moduleRef &&
                owner.publicationDigest === row.implementationPublicationDigest).length !== 1 ||
            matchingDescriptors.length !== 1 ||
            [
                declaration.requirement.inputContractRef,
                declaration.requirement.outputContractRef,
                declaration.requirement.evidenceContractRef,
                declaration.requirement.failureContractRef,
                declaration.requirement.refusalContractRef,
                declaration.requirement.judgmentContractRef,
            ].some((contractRef) => contracts.filter((contract) => contract.contractRef === contractRef)
                .length !== 1) ||
            (declaration.graphFunctionRef ===
                declarationClosure.selectedGraphFunctionRef &&
                catalogView.entries.filter((selected) => selected.kind === "graph_function_catalog_entry" &&
                    selected.definitionRef === declaration.graphFunctionRef &&
                    selected.programMembershipRefs.includes(programValidation.programRef) &&
                    selected.owningProductId === row.graphFunctionOwnerProductId &&
                    selected.publicationDigest === row.graphFunctionPublicationDigest)
                    .length !== 1)) {
            return invalid(subjectDigest, {
                code: "invalid_reference",
                path: `$.rows[${index}]`,
                message: "resolution row does not preserve one exact executable declaration, binding, package descriptor, and catalog selection",
            });
        }
    }
    const body = {
        setCandidateRef: candidate.setCandidateRef,
        setCandidateDigest: candidate.setCandidateDigest,
        programValidationRef: programValidation.validationRef,
        executableLeafKeys: candidate.executableLeafKeys,
        leafResolutionCandidateDigests: candidate.rows.map((row) => row.leafResolutionCandidateDigest),
    };
    const validationDigest = sha256Canonical(body);
    const validation = deepFreeze({
        kind: "implementation_resolution_set_validation",
        schemaVersion: "5.0.0",
        disposition: "valid",
        validationRef: `implementation-resolution-set-validation://abiogenesis/${validationDigest.slice("sha256:".length)}`,
        validationDigest,
        ...body,
        diagnostics: [],
    });
    setValidations.add(validation);
    return validation;
}
