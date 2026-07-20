import { canonicalJson, type JsonValue } from "../product/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../product/digests.js";
import { deepFreeze } from "../product/immutable.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  GraphFunction,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
} from "../gtl/index.js";
import { isRawAdmittedValue, type RawAdmittedValue } from "./raw_admission.js";

export const STATIC_DIAGNOSTIC_CODE_VALUES = [
  "duplicate_identity",
  "identity_mismatch",
  "invalid_contribution",
  "invalid_reference",
  "missing_binding",
  "missing_contract",
  "missing_membership",
  "raw_subject_mismatch",
  "topology_mismatch",
] as const;

export type StaticDiagnosticCode = (typeof STATIC_DIAGNOSTIC_CODE_VALUES)[number];

export interface StaticDiagnostic {
  readonly code: StaticDiagnosticCode;
  readonly path: string;
  readonly message: string;
}

export interface StaticValidationRefusal {
  readonly kind: "static_validation_refusal";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "invalid";
  readonly stage: "graph" | "implementation_resolution" | "publication" | "program";
  readonly subjectDigest: Sha256Digest;
  readonly diagnostics: readonly StaticDiagnostic[];
}

export interface ContributionValidationDisposition {
  readonly handle: string;
  readonly kind: CatalogContribution["kind"];
  readonly disposition: "valid";
  readonly contributionDigest: Sha256Digest;
}

export interface PublicationValidation {
  readonly kind: "publication_validation";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "valid";
  readonly validationRef: string;
  readonly publicationDigest: Sha256Digest;
  readonly moduleRef: string;
  readonly rawAdmissionRef: string;
  readonly contributionDispositions: readonly ContributionValidationDisposition[];
  readonly diagnostics: readonly [];
}

export interface ProgramValidation {
  readonly kind: "program_validation";
  readonly schemaVersion: "5.0.0";
  readonly disposition: "valid";
  readonly validationRef: string;
  readonly sourceDigest: Sha256Digest;
  readonly publicationDigest: Sha256Digest;
  readonly programRef: string;
  readonly programDigest: Sha256Digest;
  readonly graphFunctionDigests: readonly Sha256Digest[];
  readonly contractDigests: readonly Sha256Digest[];
  readonly implementationBindingDigests: readonly Sha256Digest[];
  readonly closureContractDigests: readonly Sha256Digest[];
  readonly diagnostics: readonly [];
}

export interface ProgramValidationInput {
  readonly publication: RawAdmittedValue<ModulePublication>;
  readonly program: RawAdmittedValue<GtlProgram>;
  readonly graphFunctions: readonly RawAdmittedValue<GraphFunction>[];
  readonly contracts: readonly RawAdmittedValue<ContractDeclaration>[];
  readonly implementationBindings: readonly RawAdmittedValue<ImplementationBinding>[];
  readonly closureContracts: readonly RawAdmittedValue<ClosureContract>[];
}

export type PublicationValidationResult = PublicationValidation | StaticValidationRefusal;
export type ProgramValidationResult = ProgramValidation | StaticValidationRefusal;

const publicationValidations = new WeakSet<object>();
const programValidations = new WeakSet<object>();

export function isPublicationValidation(value: object): boolean {
  return publicationValidations.has(value);
}

export function isProgramValidation(value: object): boolean {
  return programValidations.has(value);
}

function sameValue(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicateValues = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicateValues.add(value);
    seen.add(value);
  }
  return [...duplicateValues].sort();
}

function invalid(
  stage: StaticValidationRefusal["stage"],
  subjectDigest: Sha256Digest,
  diagnostics: readonly StaticDiagnostic[],
): StaticValidationRefusal {
  return {
    kind: "static_validation_refusal",
    schemaVersion: "5.0.0",
    disposition: "invalid",
    stage,
    subjectDigest,
    diagnostics,
  };
}

function validatePublicationSubject(
  publication: RawAdmittedValue<ModulePublication>,
  contributions: readonly RawAdmittedValue<CatalogContribution>[],
): PublicationValidationResult {
  const diagnostics: StaticDiagnostic[] = [];
  const value = publication.value;
  if (!isRawAdmittedValue(publication) || publication.subjectKind !== "module_publication") {
    diagnostics.push({ code: "raw_subject_mismatch", path: "$", message: "expected raw-admitted ModulePublication" });
  }
  if (value.contributions.length === 0) {
    diagnostics.push({ code: "invalid_contribution", path: "$.contributions", message: "publication requires at least one contribution" });
  }
  for (const handle of duplicates(value.contributions.map((row) => row.handle))) {
    diagnostics.push({ code: "duplicate_identity", path: "$.contributions", message: `duplicate contribution handle ${handle}` });
  }
  if (contributions.length !== value.contributions.length) {
    diagnostics.push({ code: "raw_subject_mismatch", path: "$.contributions", message: "raw contribution set differs from publication" });
  }
  const rawByHandle = new Map(contributions.map((row) => [row.value.handle, row]));
  const graphFunctionRefs = new Set(value.graphFunctions.map((graphFunction) => graphFunction.name));
  const programByRef = new Map(value.programs.map((program) => [program.programRef, program]));
  for (const row of value.contributions) {
    const raw = rawByHandle.get(row.handle);
    if (raw === undefined || !isRawAdmittedValue(raw) || raw.subjectKind !== "catalog_contribution" || !sameValue(raw.value, row)) {
      diagnostics.push({ code: "raw_subject_mismatch", path: `$.contributions[${row.handle}]`, message: "contribution lacks an exact raw admission" });
    }
    if (row.owningProductId !== value.owningProductId) {
      diagnostics.push({ code: "identity_mismatch", path: `$.contributions[${row.handle}].owningProductId`, message: "contribution owner differs from publication owner" });
    }
    if (row.kind === "graph_function") {
      if (!graphFunctionRefs.has(row.declarationOrContractRef)) {
        diagnostics.push({ code: "invalid_reference", path: `$.contributions[${row.handle}]`, message: "graph_function contribution does not reference a published GraphFunction" });
      }
      if (
        row.handle !== row.declarationOrContractRef ||
        row.programMembershipRefs.length === 0 ||
        row.programMembershipRefs.some((ref) => {
          const program = programByRef.get(ref);
          return program === undefined || !program.callableMembership.includes(row.declarationOrContractRef);
        })
      ) {
        diagnostics.push({ code: "missing_membership", path: `$.contributions[${row.handle}].programMembershipRefs`, message: "graph_function contribution requires exact Program membership" });
      }
    } else if (row.programMembershipRefs.length !== 0) {
      diagnostics.push({ code: "invalid_contribution", path: `$.contributions[${row.handle}].programMembershipRefs`, message: "non-callable contributions cannot carry callable Program membership" });
    }
  }
  if (diagnostics.length !== 0) return invalid("publication", publication.subjectDigest, diagnostics);
  const contributionDispositions = contributions.map((row) => ({
    handle: row.value.handle,
    kind: row.value.kind,
    disposition: "valid" as const,
    contributionDigest: row.subjectDigest,
  }));
  const validationDigest = sha256Canonical({
    publicationDigest: publication.subjectDigest,
    contributionDispositions,
  } as unknown as JsonValue);
  const validation = deepFreeze({
    kind: "publication_validation",
    schemaVersion: "5.0.0",
    disposition: "valid",
    validationRef: `publication-validation://abiogenesis/${validationDigest.slice("sha256:".length)}`,
    publicationDigest: publication.subjectDigest,
    moduleRef: value.moduleRef,
    rawAdmissionRef: publication.admissionRef,
    contributionDispositions,
    diagnostics: [],
  }) as PublicationValidation;
  publicationValidations.add(validation);
  return validation;
}

export function validatePublication(
  publication: RawAdmittedValue<ModulePublication>,
  contributions: readonly RawAdmittedValue<CatalogContribution>[],
): PublicationValidationResult {
  try {
    return validatePublicationSubject(publication, contributions);
  } catch {
    return invalid("publication", publication.subjectDigest, [{
      code: "invalid_reference",
      path: "$",
      message: "ModulePublication does not satisfy the declared static contract",
    }]);
  }
}

function validateProgramSubject(input: ProgramValidationInput): ProgramValidationResult {
  const diagnostics: StaticDiagnostic[] = [];
  if (
    !isRawAdmittedValue(input.publication) ||
    input.publication.subjectKind !== "module_publication" ||
    !isRawAdmittedValue(input.program) ||
    input.program.subjectKind !== "gtl_program" ||
    input.graphFunctions.some((value) => !isRawAdmittedValue(value) || value.subjectKind !== "graph_function") ||
    input.contracts.some((value) => !isRawAdmittedValue(value) || value.subjectKind !== "contract_declaration") ||
    input.implementationBindings.some((value) => !isRawAdmittedValue(value) || value.subjectKind !== "implementation_binding") ||
    input.closureContracts.some((value) => !isRawAdmittedValue(value) || value.subjectKind !== "closure_contract")
  ) {
    diagnostics.push({ code: "raw_subject_mismatch", path: "$", message: "Program validation accepts package-admitted raw values only" });
    return invalid("program", input.program.subjectDigest, diagnostics);
  }
  const publication = input.publication.value;
  const program = input.program.value;
  const graphFunctions = input.graphFunctions.map((raw) => raw.value);
  const contracts = input.contracts.map((raw) => raw.value);
  const bindings = input.implementationBindings.map((raw) => raw.value);
  const closureContracts = input.closureContracts.map((raw) => raw.value);

  const publishedProgram = publication.programs.find((candidate) => candidate.programRef === program.programRef);
  if (publishedProgram === undefined || !sameValue(publishedProgram, program)) {
    diagnostics.push({ code: "raw_subject_mismatch", path: "$.program", message: "Program is not the exact published declaration" });
  }
  if (program.moduleRef !== publication.moduleRef) {
    diagnostics.push({ code: "identity_mismatch", path: "$.program.moduleRef", message: "Program module differs from publication" });
  }
  const publishedGraphByRef = new Map(publication.graphFunctions.map((value) => [value.name, value]));
  const rawGraphByRef = new Map(graphFunctions.map((value) => [value.name, value]));
  for (const graphFunctionRef of program.callableMembership) {
    const published = publishedGraphByRef.get(graphFunctionRef);
    const raw = rawGraphByRef.get(graphFunctionRef);
    if (published === undefined || raw === undefined || !sameValue(published, raw)) {
      diagnostics.push({ code: "missing_membership", path: "$.program.callableMembership", message: `missing exact GraphFunction ${graphFunctionRef}` });
    }
  }
  for (const start of program.starts) {
    if (!program.callableMembership.includes(start.graphFunctionRef)) {
      diagnostics.push({ code: "missing_membership", path: `$.program.starts[${start.startRef}]`, message: "Program start is not in callable membership" });
    }
  }
  for (const ref of duplicates(program.callableMembership)) {
    diagnostics.push({ code: "duplicate_identity", path: "$.program.callableMembership", message: `duplicate GraphFunction membership ${ref}` });
  }
  const contractRefs = new Set(contracts.map((contract) => contract.contractRef));
  const bindingByRef = new Map(bindings.map((binding) => [binding.bindingRef, binding]));
  for (const graphFunction of graphFunctions) {
    const nodes = new Map(graphFunction.template.nodes.map((node) => [node.nodeRef, node]));
    if (!nodes.has(graphFunction.template.startNodeRef) || graphFunction.template.terminalNodeRefs.some((ref) => !nodes.has(ref))) {
      diagnostics.push({ code: "topology_mismatch", path: `$.graphFunctions[${graphFunction.name}].template`, message: "start and terminal nodes must belong to the original graph template" });
    }
    if (graphFunction.template.edges.some((edge) => !nodes.has(edge.fromNodeRef) || !nodes.has(edge.toNodeRef))) {
      diagnostics.push({ code: "topology_mismatch", path: `$.graphFunctions[${graphFunction.name}].template.edges`, message: "edge endpoint is absent from graph template" });
    }
    for (const contractRef of [...graphFunction.inputs, ...graphFunction.outputs]) {
      if (!contractRefs.has(contractRef)) diagnostics.push({ code: "missing_contract", path: `$.graphFunctions[${graphFunction.name}]`, message: `missing contract ${contractRef}` });
    }
    for (const node of graphFunction.template.nodes) {
      const binding = bindingByRef.get(node.implementationBindingRef);
      if (
        node.stageRole.length === 0 ||
        node.armId.length === 0 ||
        node.judgmentPredicateRef.length === 0 ||
        !Number.isSafeInteger(node.vectorIndex) ||
        node.vectorIndex < 0
      ) {
        diagnostics.push({
          code: "invalid_reference",
          path: `$.graphFunctions[${graphFunction.name}].template.nodes[${node.nodeRef}]`,
          message: "C locus requires declared stage, arm, judgment predicate, and non-negative vector index",
        });
      }
      if (binding === undefined) {
        diagnostics.push({ code: "missing_binding", path: `$.graphFunctions[${graphFunction.name}].template.nodes[${node.nodeRef}]`, message: `missing implementation binding ${node.implementationBindingRef}` });
      } else if (
        binding.computeRegime !== node.computeRegime ||
        binding.inputContractRef !== node.inputContractRef ||
        binding.outputContractRef !== node.outputContractRef
      ) {
        diagnostics.push({ code: "invalid_reference", path: `$.graphFunctions[${graphFunction.name}].template.nodes[${node.nodeRef}]`, message: "node and implementation binding contracts disagree" });
      }
    }
  }
  if (!closureContracts.some((contract) => contract.closureContractRef === program.closureContractRef)) {
    diagnostics.push({ code: "missing_contract", path: "$.program.closureContractRef", message: "Program closure contract is absent" });
  }
  for (const closureContract of closureContracts) {
    const requiredContractRefs = [
      closureContract.evidenceContractRef,
      closureContract.resultContractRef,
      closureContract.refusalContractRef,
      closureContract.judgmentContractRef,
      closureContract.rejectionContractRef,
      closureContract.transitionContractRef,
    ];
    if (requiredContractRefs.some((contractRef) => !contractRefs.has(contractRef))) {
      diagnostics.push({
        code: "missing_contract",
        path: `$.closureContracts[${closureContract.closureContractRef}]`,
        message: "ClosureContract references an unpublished evidence, result, refusal, judgment, rejection, or transition contract",
      });
    }
    if (
      closureContract.predicateRef.length === 0 ||
      closureContract.refusalValueKind.length === 0 ||
      closureContract.replayProjectionRef.length === 0
    ) {
      diagnostics.push({
        code: "invalid_reference",
        path: `$.closureContracts[${closureContract.closureContractRef}]`,
        message: "ClosureContract requires terminal predicate, refusal value kind, and replay projection",
      });
    }
    if (
      closureContract.eventKindRefs.join("\0") !==
      ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"].join("\0")
    ) {
      diagnostics.push({
        code: "invalid_reference",
        path: `$.closureContracts[${closureContract.closureContractRef}].eventKindRefs`,
        message: "ClosureContract must declare the exact ordered root closure event family",
      });
    }
  }
  const expectedRawValues: readonly [readonly unknown[], readonly unknown[], string][] = [
    [publication.contracts, contracts, "contracts"],
    [publication.implementationBindings, bindings, "implementationBindings"],
    [publication.closureContracts, closureContracts, "closureContracts"],
  ];
  for (const [published, raw, path] of expectedRawValues) {
    if (published.length !== raw.length || published.some((value, index) => !sameValue(value, raw[index]))) {
      diagnostics.push({ code: "raw_subject_mismatch", path: `$.${path}`, message: `raw ${path} differ from publication` });
    }
  }
  if (diagnostics.length !== 0) return invalid("program", input.program.subjectDigest, diagnostics);

  const graphFunctionDigests = input.graphFunctions.map((value) => value.subjectDigest);
  const contractDigests = input.contracts.map((value) => value.subjectDigest);
  const implementationBindingDigests = input.implementationBindings.map((value) => value.subjectDigest);
  const closureContractDigests = input.closureContracts.map((value) => value.subjectDigest);
  const sourceDigest = sha256Canonical({
    publicationDigest: input.publication.subjectDigest,
    programDigest: input.program.subjectDigest,
    graphFunctionDigests,
    contractDigests,
    implementationBindingDigests,
    closureContractDigests,
  } as unknown as JsonValue);
  const validation = deepFreeze({
    kind: "program_validation",
    schemaVersion: "5.0.0",
    disposition: "valid",
    validationRef: `program-validation://abiogenesis/${sourceDigest.slice("sha256:".length)}`,
    sourceDigest,
    publicationDigest: input.publication.subjectDigest,
    programRef: program.programRef,
    programDigest: input.program.subjectDigest,
    graphFunctionDigests,
    contractDigests,
    implementationBindingDigests,
    closureContractDigests,
    diagnostics: [],
  }) as ProgramValidation;
  programValidations.add(validation);
  return validation;
}

export function validateProgram(input: ProgramValidationInput): ProgramValidationResult {
  try {
    return validateProgramSubject(input);
  } catch {
    return invalid("program", input.program.subjectDigest, [{
      code: "invalid_reference",
      path: "$",
      message: "GTL Program declarations do not satisfy the declared static contracts",
    }]);
  }
}
