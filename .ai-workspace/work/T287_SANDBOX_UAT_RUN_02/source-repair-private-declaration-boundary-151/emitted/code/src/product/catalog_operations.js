import { semanticLifecycleRefForProgram } from "../gtl/semantic_stage.js";
import { rawAdmitValue, validatePublication, } from "../validator/index.js";
import { admitGraphFunctionCatalog, applyCatalogDeclaration, narrowGraphFunctionCatalog, } from "./catalog.js";
import { isResolvedProgramDeclarationClosure, validateResolvedProgramDeclarationClosure, } from "./declaration_closure.js";
function catalogValidationRefusal(validation) {
    return {
        kind: "catalog_validation_refusal",
        schemaVersion: "5.0.0",
        disposition: "refused",
        validation,
    };
}
export function constructCatalogProgramValidationInput(catalog, catalogView, declarationClosure, program) {
    if (!isResolvedProgramDeclarationClosure(declarationClosure) ||
        !validateResolvedProgramDeclarationClosure(declarationClosure, catalog, catalogView)) {
        return {
            kind: "raw_admission_refusal",
            schemaVersion: "5.0.0",
            disposition: "refused",
            code: "invalid_kind",
            message: "Program validation input requires one Product-resolved declaration closure",
        };
    }
    return constructProgramValidationInputFromResolvedClosure(declarationClosure, program);
}
/** Internal continuation of the Product closure owner. Raw callers use the
 * catalog wrapper above; this consumes its actual resolved value and retains
 * declaration admission and subsequent Program validation. */
export function constructProgramValidationInputFromResolvedClosure(declarationClosure, program) {
    const declarationPublications = declarationClosure.publications;
    const graphFunctionRefs = new Set(declarationClosure.graphFunctionOwners.map((owner) => owner.declarationRef));
    const contractRefs = new Set(declarationClosure.contractOwners.map((owner) => owner.declarationRef));
    const implementationBindingRefs = new Set(declarationClosure.implementationBindingOwners.map((owner) => owner.declarationRef));
    const closureContractRefs = new Set(declarationClosure.closureContractOwners.map((owner) => owner.declarationRef));
    const programAdmission = rawAdmitValue(program, "gtl_program", "contract://abiogenesis/gtl/program@5");
    if (programAdmission.kind !== "raw_admitted_value")
        return programAdmission;
    const programPublicationAdmission = rawAdmitValue(declarationClosure.programPublication, "module_publication", "contract://abiogenesis/gtl/module-publication@5");
    if (programPublicationAdmission.kind !== "raw_admitted_value") {
        return programPublicationAdmission;
    }
    const graphFunctions = declarationPublications
        .flatMap((publication) => publication.graphFunctions)
        .filter((value) => graphFunctionRefs.has(value.name))
        .map((value) => rawAdmitValue(value, "graph_function", "contract://abiogenesis/gtl/graph-function@5"));
    const contracts = declarationPublications.flatMap((publication) => publication.contracts.filter((value) => contractRefs.has(value.contractRef)).map((value) => rawAdmitValue(value, "contract_declaration", "contract://abiogenesis/gtl/contract-declaration@5")));
    const implementationBindings = declarationPublications.flatMap((publication) => publication.implementationBindings.filter((value) => implementationBindingRefs.has(value.bindingRef)).map((value) => rawAdmitValue(value, "implementation_binding", "contract://abiogenesis/gtl/implementation-binding@5")));
    const closureContracts = declarationPublications.flatMap((publication) => publication.closureContracts.filter((value) => closureContractRefs.has(value.closureContractRef)).map((value) => rawAdmitValue(value, "closure_contract", "contract://abiogenesis/gtl/closure-contract@5")));
    const refusal = [
        ...graphFunctions,
        ...contracts,
        ...implementationBindings,
        ...closureContracts,
    ].find((value) => value.kind === "raw_admission_refusal");
    if (refusal !== undefined)
        return refusal;
    const lifecycleRef = semanticLifecycleRefForProgram(declarationClosure.programPublication, programAdmission.value);
    const lifecycleOwners = lifecycleRef === undefined ? [] : declarationPublications.filter(p => (p.semanticLifecycle ?? p.semanticJobLifecycle)?.declarationRef === lifecycleRef);
    const lifecycleAdmission = lifecycleOwners.length === 1 ? rawAdmitValue(lifecycleOwners[0], "module_publication", "contract://abiogenesis/gtl/module-publication@5") : null;
    if (lifecycleRef !== undefined && lifecycleAdmission?.kind !== "raw_admitted_value") {
        return { kind: "raw_admission_refusal", schemaVersion: "5.0.0", disposition: "refused", code: "invalid_kind", message: "semantic lifecycle has no unique raw admitted owner" };
    }
    const sourceRef = lifecycleOwners[0]?.semanticLifecycle?.sourceDeclarationRef;
    const sourceOwners = lifecycleOwners[0]?.semanticJobLifecycle !== undefined ? lifecycleOwners : sourceRef === undefined ? [] : declarationPublications.filter(p => p.requirementHandoffs?.some(d => d.declarationRef === sourceRef));
    const sourceAdmission = sourceOwners.length === 1 ? rawAdmitValue(sourceOwners[0], "module_publication", "contract://abiogenesis/gtl/module-publication@5") : null;
    if (sourceRef !== undefined && sourceAdmission?.kind !== "raw_admitted_value") {
        return { kind: "raw_admission_refusal", schemaVersion: "5.0.0", disposition: "refused", code: "invalid_kind", message: "semantic source has no unique raw admitted owner" };
    }
    return {
        ...(lifecycleAdmission?.kind === "raw_admitted_value" ? { semanticLifecyclePublication: lifecycleAdmission } : {}),
        ...(sourceAdmission?.kind === "raw_admitted_value" ? { semanticSourcePublication: sourceAdmission } : {}),
        declarationBasisDigest: declarationClosure.closureDigest,
        programPublication: programPublicationAdmission,
        program: programAdmission,
        graphFunctions: graphFunctions,
        contracts: contracts,
        evaluators: declarationPublications.flatMap((publication) => publication.evaluators.filter((value) => declarationClosure.evaluatorOwners.some((owner) => owner.declarationRef === value.name &&
            owner.productId === publication.owningProductId &&
            owner.moduleRef === publication.moduleRef))),
        rules: declarationPublications.flatMap((publication) => publication.rules.filter((value) => declarationClosure.ruleOwners.some((owner) => owner.declarationRef === value.name &&
            owner.productId === publication.owningProductId &&
            owner.moduleRef === publication.moduleRef))),
        implementationBindings: implementationBindings,
        closureContracts: closureContracts,
    };
}
export function constructReadyCatalog(packet) {
    for (const publication of packet.readinessBasis.publications) {
        const publicationAdmission = rawAdmitValue(publication, "module_publication", "contract://abiogenesis/gtl/module-publication@5");
        if (publicationAdmission.kind !== "raw_admitted_value") {
            return catalogValidationRefusal(publicationAdmission);
        }
        const contributions = publication.contributions.map((value) => rawAdmitValue(value, "catalog_contribution", "contract://abiogenesis/gtl/catalog-contribution@5"));
        const contributionRefusal = contributions.find((value) => value.kind === "raw_admission_refusal");
        if (contributionRefusal !== undefined) {
            return catalogValidationRefusal(contributionRefusal);
        }
        const publicationValidation = validatePublication(publicationAdmission, contributions);
        if (publicationValidation.kind !== "publication_validation") {
            return catalogValidationRefusal(publicationValidation);
        }
    }
    const catalog = admitGraphFunctionCatalog(packet.readinessBasis);
    return catalog;
}
export function constructCatalogView(packet) {
    return narrowGraphFunctionCatalog(packet.catalog, packet.allowlist);
}
export function constructCatalogApplication(packet) {
    if (packet.memberKey !== packet.application.applicationKind) {
        return {
            kind: "declaration_application_refusal",
            code: "kind_mismatch",
            message: "catalog application member and declaration kind differ",
        };
    }
    return applyCatalogDeclaration(packet.catalogView, packet.application);
}
export const CatalogOperationPort = Object.freeze({
    admit: constructReadyCatalog,
    constructView: constructCatalogView,
    apply: constructCatalogApplication,
});
export const CATALOG_OPERATION_CONTRACTS = Object.freeze({
    admit: CatalogOperationPort.admit,
    view: Object.freeze({ allowlist: CatalogOperationPort.constructView }),
    apply: Object.freeze({
        node_type: CatalogOperationPort.apply,
        overlay: CatalogOperationPort.apply,
    }),
});
