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
  validateProgram,
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
  type ReadyGraphFunctionCatalogResult,
} from "./catalog.js";

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

function isRawAdmissionRefusal(
  value: ProgramValidationInput | RawAdmissionRefusal,
): value is RawAdmissionRefusal {
  return "kind" in value && value.kind === "raw_admission_refusal";
}

export function constructCatalogProgramValidationInput(
  publicationAdmission: RawAdmittedValue<ModulePublication>,
  program: Readonly<GtlProgram>,
): ProgramValidationInput | RawAdmissionRefusal {
  const publication = publicationAdmission.value;
  const programAdmission = rawAdmitValue<GtlProgram>(
    program,
    "gtl_program",
    "contract://abiogenesis/gtl/program@5",
  );
  if (programAdmission.kind !== "raw_admitted_value") return programAdmission;

  const graphFunctions = publication.graphFunctions
    .filter((value) => program.callableMembership.includes(value.name))
    .map((value) => rawAdmitValue<GraphFunction>(
      value,
      "graph_function",
      "contract://abiogenesis/gtl/graph-function@5",
    ));
  const contracts = publication.contracts.map((value) =>
    rawAdmitValue<ContractDeclaration>(
      value,
      "contract_declaration",
      "contract://abiogenesis/gtl/contract-declaration@5",
    ));
  const implementationBindings = publication.implementationBindings.map(
    (value) => rawAdmitValue<ImplementationBinding>(
      value,
      "implementation_binding",
      "contract://abiogenesis/gtl/implementation-binding@5",
    ),
  );
  const closureContracts = publication.closureContracts.map((value) =>
    rawAdmitValue<ClosureContract>(
      value,
      "closure_contract",
      "contract://abiogenesis/gtl/closure-contract@5",
    ));
  const refusal = [
    ...graphFunctions,
    ...contracts,
    ...implementationBindings,
    ...closureContracts,
  ].find((value): value is RawAdmissionRefusal =>
    value.kind === "raw_admission_refusal");
  if (refusal !== undefined) return refusal;
  return {
    publication: publicationAdmission,
    program: programAdmission,
    graphFunctions: graphFunctions as readonly RawAdmittedValue<GraphFunction>[],
    contracts: contracts as readonly RawAdmittedValue<ContractDeclaration>[],
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
    for (const program of publication.programs) {
      const input = constructCatalogProgramValidationInput(
        publicationAdmission,
        program,
      );
      if (isRawAdmissionRefusal(input)) {
        return catalogValidationRefusal(input);
      }
      const validation = validateProgram(input);
      if (validation.kind !== "program_validation") {
        return catalogValidationRefusal(validation);
      }
    }
  }
  return admitGraphFunctionCatalog(packet.readinessBasis);
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
