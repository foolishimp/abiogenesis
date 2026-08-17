import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
} from "../gtl/contracts.js";
import {
  rawAdmitValue,
  validatePublication,
  type ProgramValidationInput,
  type RawAdmissionRefusal,
  type RawAdmittedValue,
  type StaticValidationRefusal,
} from "../validator/index.js";
import {
  admitGraphFunctionCatalog,
  applyCatalogDeclaration,
  narrowGraphFunctionCatalog,
  type CatalogReadinessBasis,
  type DeclarationApplicationInput,
  type DeclarationApplicationResult,
  type GraphFunctionCatalog,
  type GraphFunctionCatalogView,
  type GraphFunctionCatalogViewResult,
  type ReadyGraphFunctionCatalog,
  type ReadyGraphFunctionCatalogResult,
} from "./catalog.js";
import {
  isResolvedProgramDeclarationClosure,
  validateResolvedProgramDeclarationClosure,
  type ResolvedProgramDeclarationClosure,
} from "./declaration_closure.js";

export interface CatalogAdmitPacket {
  readonly kind: "catalog_admit_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "admit";
  readonly readinessBasis: CatalogReadinessBasis;
}

export interface CatalogViewPacket {
  readonly kind: "catalog_view_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "allowlist";
  readonly catalog: GraphFunctionCatalog;
  readonly allowlist: readonly string[];
}

export interface CatalogApplyPacket {
  readonly kind: "catalog_apply_packet";
  readonly schemaVersion: "5.0.0";
  readonly memberKey: "node_type" | "overlay";
  readonly catalogView: GraphFunctionCatalogView;
  readonly application: DeclarationApplicationInput;
}

export interface CatalogValidationRefusal {
  readonly kind: "catalog_validation_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "refused";
  readonly validation: RawAdmissionRefusal | StaticValidationRefusal;
}

export type CatalogAdmissionOperationResult =
  | ReadyGraphFunctionCatalogResult
  | CatalogValidationRefusal;

function catalogValidationRefusal(
  validation: RawAdmissionRefusal | StaticValidationRefusal,
): CatalogValidationRefusal {
  return {
    kind: "catalog_validation_refusal",
    schemaVersion: "5.0.0",
    disposition: "refused",
    validation,
  };
}

export function constructCatalogProgramValidationInput(
  catalog: ReadyGraphFunctionCatalog,
  catalogView: GraphFunctionCatalogView,
  declarationClosure: ResolvedProgramDeclarationClosure,
  program: Readonly<GtlProgram>,
): ProgramValidationInput | RawAdmissionRefusal {
  if (
    !isResolvedProgramDeclarationClosure(declarationClosure) ||
    !validateResolvedProgramDeclarationClosure(
      declarationClosure,
      catalog,
      catalogView,
    )
  ) {
    return {
      kind: "raw_admission_refusal",
      schemaVersion: "5.0.0",
      disposition: "refused",
      code: "invalid_kind",
      message: "Program validation input requires one Product-resolved declaration closure",
    } as RawAdmissionRefusal;
  }
  const declarationPublications = declarationClosure.publications;
  const graphFunctionRefs = new Set(
    declarationClosure.graphFunctionOwners.map((owner) => owner.declarationRef),
  );
  const contractRefs = new Set(
    declarationClosure.contractOwners.map((owner) => owner.declarationRef),
  );
  const implementationBindingRefs = new Set(
    declarationClosure.implementationBindingOwners.map(
      (owner) => owner.declarationRef,
    ),
  );
  const closureContractRefs = new Set(
    declarationClosure.closureContractOwners.map(
      (owner) => owner.declarationRef,
    ),
  );
  const programAdmission = rawAdmitValue<GtlProgram>(
    program,
    "gtl_program",
    "contract://abiogenesis/gtl/program@5",
  );
  if (programAdmission.kind !== "raw_admitted_value") return programAdmission;
  const programPublicationAdmission = rawAdmitValue<ModulePublication>(
    declarationClosure.programPublication,
    "module_publication",
    "contract://abiogenesis/gtl/module-publication@5",
  );
  if (programPublicationAdmission.kind !== "raw_admitted_value") {
    return programPublicationAdmission;
  }

  const graphFunctions = declarationPublications
    .flatMap((publication) => publication.graphFunctions)
    .filter((value) => graphFunctionRefs.has(value.name))
    .map((value) => rawAdmitValue<GraphFunction>(
      value,
      "graph_function",
      "contract://abiogenesis/gtl/graph-function@5",
    ));
  const contracts = declarationPublications.flatMap((publication) =>
    publication.contracts.filter((value) =>
      contractRefs.has(value.contractRef)
    ).map((value) =>
    rawAdmitValue<ContractDeclaration>(
      value,
      "contract_declaration",
      "contract://abiogenesis/gtl/contract-declaration@5",
    )),
  );
  const implementationBindings = declarationPublications.flatMap(
    (publication) => publication.implementationBindings.filter((value) =>
      implementationBindingRefs.has(value.bindingRef)
    ).map(
      (value) => rawAdmitValue<ImplementationBinding>(
      value,
      "implementation_binding",
      "contract://abiogenesis/gtl/implementation-binding@5",
      ),
    ),
  );
  const closureContracts = declarationPublications.flatMap((publication) =>
    publication.closureContracts.filter((value) =>
      closureContractRefs.has(value.closureContractRef)
    ).map((value) =>
    rawAdmitValue<ClosureContract>(
      value,
      "closure_contract",
      "contract://abiogenesis/gtl/closure-contract@5",
    )),
  );
  const refusal = [
    ...graphFunctions,
    ...contracts,
    ...implementationBindings,
    ...closureContracts,
  ].find((value): value is RawAdmissionRefusal =>
    value.kind === "raw_admission_refusal");
  if (refusal !== undefined) return refusal;
  return {
    declarationBasisDigest: declarationClosure.closureDigest,
    programPublication: programPublicationAdmission,
    program: programAdmission,
    graphFunctions: graphFunctions as readonly RawAdmittedValue<GraphFunction>[],
    contracts: contracts as readonly RawAdmittedValue<ContractDeclaration>[],
    evaluators: declarationPublications.flatMap((publication) =>
      publication.evaluators.filter((value) =>
        declarationClosure.evaluatorOwners.some((owner) =>
          owner.declarationRef === value.name &&
          owner.productId === publication.owningProductId &&
          owner.moduleRef === publication.moduleRef
        )
      )
    ),
    rules: declarationPublications.flatMap((publication) =>
      publication.rules.filter((value) =>
        declarationClosure.ruleOwners.some((owner) =>
          owner.declarationRef === value.name &&
          owner.productId === publication.owningProductId &&
          owner.moduleRef === publication.moduleRef
        )
      )
    ),
    implementationBindings:
      implementationBindings as readonly RawAdmittedValue<ImplementationBinding>[],
    closureContracts:
      closureContracts as readonly RawAdmittedValue<ClosureContract>[],
  };
}

export function constructReadyCatalog(
  packet: CatalogAdmitPacket,
): CatalogAdmissionOperationResult {
  for (const publication of packet.readinessBasis.publications) {
    const publicationAdmission = rawAdmitValue<ModulePublication>(
      publication,
      "module_publication",
      "contract://abiogenesis/gtl/module-publication@5",
    );
    if (publicationAdmission.kind !== "raw_admitted_value") {
      return catalogValidationRefusal(publicationAdmission);
    }
    const contributions = publication.contributions.map((value) =>
      rawAdmitValue<CatalogContribution>(
        value,
        "catalog_contribution",
        "contract://abiogenesis/gtl/catalog-contribution@5",
      ));
    const contributionRefusal = contributions.find(
      (value): value is RawAdmissionRefusal =>
        value.kind === "raw_admission_refusal",
    );
    if (contributionRefusal !== undefined) {
      return catalogValidationRefusal(contributionRefusal);
    }
    const publicationValidation = validatePublication(
      publicationAdmission,
      contributions as readonly RawAdmittedValue<CatalogContribution>[],
    );
    if (publicationValidation.kind !== "publication_validation") {
      return catalogValidationRefusal(publicationValidation);
    }
  }
  const catalog = admitGraphFunctionCatalog(packet.readinessBasis);
  return catalog;
}

export function constructCatalogView(
  packet: CatalogViewPacket,
): GraphFunctionCatalogViewResult {
  return narrowGraphFunctionCatalog(packet.catalog, packet.allowlist);
}

export function constructCatalogApplication(
  packet: CatalogApplyPacket,
): DeclarationApplicationResult {
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
