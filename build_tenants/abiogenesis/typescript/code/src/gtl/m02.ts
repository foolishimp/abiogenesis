// Addressable M02 publication entrypoint over the same direct GTL family.
export {
  admitModule,
  admitProgram,
} from "./admission.js";
export {
  catalogContribution,
  closureContract,
  contractDeclaration,
  evaluatorDeclaration,
  GTL_DECLARATION_CONSTRUCTORS,
  implementationBinding,
  modulePublication,
  productSemanticsBinding,
  ruleDeclaration,
} from "./declarations.js";
export {
  resolveProgramStart,
  type ProgramRootMode,
  type ProgramStartRefusal,
  type ProgramStartRequest,
  type ProgramStartUntil,
  type ResolvedProgramStart,
} from "./public_start.js";
export {
  serializeModule,
  serializeModuleCanonical,
  serializeProgram,
  serializeProgramCanonical,
  type Module,
} from "./serialization.js";
export type {
  CatalogContribution,
  CatalogContributionKind,
  ClosureContract,
  ContractDeclaration,
  EvaluatorDeclaration,
  GtlActionCatalog,
  GtlActionCatalogRow,
  GtlConstructionAuthorityBinding,
  GtlConstructionComposition,
  GtlConstructionPolicy,
  GtlConstructionSemanticAuthority,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  ProductSemanticsBinding,
  ProgramPublicAssetTarget,
  ProgramStart,
  RuleDeclaration,
} from "./contracts.js";
