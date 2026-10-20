import { semanticLifecycleRefForProgram } from "../gtl/semantic_stage.js";
import { isDeeplyFrozen, deepFreeze } from "../shared/immutable.js";
import type { RawSubjectKind } from "../validator/raw_admission.js";
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
  return constructProgramValidationInputFromResolvedClosure(declarationClosure, program);
}

const admittedDeclarations = new WeakMap<object, Map<string, RawAdmittedValue<unknown>>>();
const programValidationInputs = new WeakMap<object, WeakMap<object, ProgramValidationInput>>();

function admitDeclaration<S>(
  value: object, kind: RawSubjectKind, contractRef: string,
): RawAdmittedValue<S> | RawAdmissionRefusal {
  const key = `${kind}\0${contractRef}`;
  const retained = admittedDeclarations.get(value)?.get(key);
  if (retained !== undefined) return retained as RawAdmittedValue<S>;
  const admitted = rawAdmitValue<S>(value, kind, contractRef);
  if (admitted.kind === "raw_admitted_value" && isDeeplyFrozen(value)) {
    let admissions = admittedDeclarations.get(value);
    if (admissions === undefined) { admissions = new Map(); admittedDeclarations.set(value, admissions); }
    admissions.set(key, admitted);
  }
  return admitted;
}

/** Internal continuation of the Product closure owner. Raw callers use the
 * catalog wrapper above; this consumes its actual resolved value and retains
 * declaration admission and subsequent Program validation. */
export function constructProgramValidationInputFromResolvedClosure(
  declarationClosure: ResolvedProgramDeclarationClosure,
  program: Readonly<GtlProgram>,
): ProgramValidationInput | RawAdmissionRefusal {
  const retained = programValidationInputs.get(declarationClosure)?.get(program);
  if (retained !== undefined) return retained;
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
  const programAdmission = admitDeclaration<GtlProgram>(
    program,
    "gtl_program",
    "contract://abiogenesis/gtl/program@5",
  );
  if (programAdmission.kind !== "raw_admitted_value") return programAdmission;
  const programPublicationAdmission = admitDeclaration<ModulePublication>(
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
    .map((value) => admitDeclaration<GraphFunction>(
      value,
      "graph_function",
      "contract://abiogenesis/gtl/graph-function@5",
    ));
  const contracts = declarationPublications.flatMap((publication) =>
    publication.contracts.filter((value) =>
      contractRefs.has(value.contractRef)
    ).map((value) =>
    admitDeclaration<ContractDeclaration>(
      value,
      "contract_declaration",
      "contract://abiogenesis/gtl/contract-declaration@5",
    )),
  );
  const implementationBindings = declarationPublications.flatMap(
    (publication) => publication.implementationBindings.filter((value) =>
      implementationBindingRefs.has(value.bindingRef)
    ).map(
      (value) => admitDeclaration<ImplementationBinding>(
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
    admitDeclaration<ClosureContract>(
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
  const lifecycleRef = semanticLifecycleRefForProgram(declarationClosure.programPublication, programAdmission.value);
  const lifecycleOwners = lifecycleRef === undefined ? [] : declarationPublications.filter(p => (p.semanticLifecycle ?? p.semanticJobLifecycle)?.declarationRef === lifecycleRef);
  const lifecycleAdmission = lifecycleOwners.length === 1 ? admitDeclaration<ModulePublication>(lifecycleOwners[0]!, "module_publication", "contract://abiogenesis/gtl/module-publication@5") : null;
  if (lifecycleRef !== undefined && lifecycleAdmission?.kind !== "raw_admitted_value") {
    return { kind: "raw_admission_refusal", schemaVersion: "5.0.0", disposition: "refused", code: "invalid_kind", message: "semantic lifecycle has no unique raw admitted owner" } as RawAdmissionRefusal;
  }
  const sourceRef = lifecycleOwners[0]?.semanticLifecycle?.sourceDeclarationRef;
  const sourceOwners = lifecycleOwners[0]?.semanticJobLifecycle !== undefined ? lifecycleOwners : sourceRef === undefined ? [] : declarationPublications.filter(p => p.requirementHandoffs?.some(d => d.declarationRef === sourceRef));
  const sourceAdmission = sourceOwners.length === 1 ? admitDeclaration<ModulePublication>(sourceOwners[0]!, "module_publication", "contract://abiogenesis/gtl/module-publication@5") : null;
  if (sourceRef !== undefined && sourceAdmission?.kind !== "raw_admitted_value") {
    return { kind: "raw_admission_refusal", schemaVersion: "5.0.0", disposition: "refused", code: "invalid_kind", message: "semantic source has no unique raw admitted owner" } as RawAdmissionRefusal;
  }
  const input: ProgramValidationInput = {
    ...(lifecycleAdmission?.kind === "raw_admitted_value" ? { semanticLifecyclePublication: lifecycleAdmission } : {}),
    ...(sourceAdmission?.kind === "raw_admitted_value" ? { semanticSourcePublication: sourceAdmission } : {}),
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
  if (isDeeplyFrozen(declarationClosure) && isDeeplyFrozen(program)) {
    deepFreeze(input);
    let programs = programValidationInputs.get(declarationClosure);
    if (programs === undefined) { programs = new WeakMap(); programValidationInputs.set(declarationClosure, programs); }
    programs.set(program, input);
  }
  return input;
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
