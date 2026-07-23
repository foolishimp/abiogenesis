import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  EvaluatorDeclaration,
  GraphFunction,
  GraphFunctionApplication,
  GtlEdge,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  RuleDeclaration,
} from "../gtl/index.js";
import {
  foldbackRef,
  graphEdgeRef,
  graphFunctionApplicationRef,
  sameObjectWitnessRef,
} from "../gtl/graph_applications.js";
import {
  cLeafTerms,
  isExecutableCLeaf,
  isInteractionCLeaf,
  type ExecutableLeafRequirement,
  type InteractionLeafRequirement,
} from "../gtl/c_algebra.js";
import { isRawAdmittedValue, type RawAdmittedValue } from "./raw_admission.js";
import { inspectCProgramTerm } from "./c_algebra.js";

export const STATIC_DIAGNOSTIC_CODE_VALUES = [
  "duplicate_identity",
  "carrier_mismatch",
  "identity_mismatch",
  "invalid_application",
  "invalid_constructor",
  "invalid_contribution",
  "invalid_fibre",
  "invalid_leaf_requirement",
  "invalid_reference",
  "invalid_result_cardinality",
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

function hasExactKeys(value: object, expected: readonly string[]): boolean {
  return Object.keys(value).sort().join("\0") === [...expected].sort().join("\0");
}

function hasExactGraphEdgeShape(edge: Readonly<GtlEdge>): boolean {
  return hasExactKeys(edge, ["edgeRef", "fromNodeRef", "toNodeRef"]) &&
    edge.edgeRef === graphEdgeRef(edge);
}

function hasExactEvaluatorShape(
  evaluator: Readonly<EvaluatorDeclaration>,
): boolean {
  return hasExactKeys(evaluator, [
    "binding",
    "consumedFieldRefs",
    "description",
    "name",
    "regime",
    "tags",
  ]) &&
    typeof evaluator.name === "string" &&
    evaluator.name.trim().length > 0 &&
    typeof evaluator.description === "string" &&
    typeof evaluator.binding === "string" &&
    evaluator.binding.trim().length > 0 &&
    ["F_D", "F_P", "F_H"].includes(evaluator.regime) &&
    Array.isArray(evaluator.consumedFieldRefs) &&
    evaluator.consumedFieldRefs.every(
      (ref) => typeof ref === "string" && ref.trim().length > 0,
    ) &&
    Array.isArray(evaluator.tags) &&
    evaluator.tags.every((tag) => typeof tag === "string" && tag.trim().length > 0);
}

function hasExactRuleShape(rule: Readonly<RuleDeclaration>): boolean {
  if (
    !hasExactKeys(rule, ["config", "kind", "name", "tags"]) ||
    typeof rule.name !== "string" ||
    rule.name.trim().length === 0 ||
    typeof rule.kind !== "string" ||
    rule.kind.trim().length === 0 ||
    rule.config === null ||
    Array.isArray(rule.config) ||
    typeof rule.config !== "object" ||
    !Array.isArray(rule.tags) ||
    !rule.tags.every((tag) => typeof tag === "string" && tag.trim().length > 0)
  ) {
    return false;
  }
  try {
    canonicalJson(rule.config);
    return true;
  } catch {
    return false;
  }
}

function validatePublishedDeclarations(
  publication: Readonly<ModulePublication>,
): readonly StaticDiagnostic[] {
  const diagnostics: StaticDiagnostic[] = [];
  for (const name of duplicates(publication.evaluators.map((row) => row.name))) {
    diagnostics.push({
      code: "duplicate_identity",
      path: "$.evaluators",
      message: `duplicate Evaluator declaration ${name}`,
    });
  }
  for (const name of duplicates(publication.rules.map((row) => row.name))) {
    diagnostics.push({
      code: "duplicate_identity",
      path: "$.rules",
      message: `duplicate Rule declaration ${name}`,
    });
  }
  publication.evaluators.forEach((evaluator, index) => {
    if (!hasExactEvaluatorShape(evaluator)) {
      diagnostics.push({
        code: "invalid_reference",
        path: `$.evaluators[${index}]`,
        message: "Evaluator requires one exact immutable declaration shape",
      });
    }
  });
  publication.rules.forEach((rule, index) => {
    if (!hasExactRuleShape(rule)) {
      diagnostics.push({
        code: "invalid_reference",
        path: `$.rules[${index}]`,
        message: "Rule requires one exact immutable declaration shape",
      });
    }
  });
  return diagnostics;
}

function hasExactApplicationShape(
  application: Readonly<GraphFunctionApplication>,
): boolean {
  const base = [
    "applicationRef",
    "inputContractRef",
    "kind",
    "outputContractRef",
    "relationKind",
  ];
  switch (application.relationKind) {
    case "compose":
      return hasExactKeys(application, [
        ...base,
        "leftGraphFunctionRef",
        "rightGraphFunctionRef",
      ]);
    case "substitute":
      return hasExactKeys(application, [
        ...base,
        "innerGraphFunctionRef",
        "outerGraphFunctionRef",
        "targetVectorRef",
      ]);
    case "recurse":
      return hasExactKeys(application, [
        ...base,
        "bound",
        "foldback",
        "foldbackRef",
        "graphFunctionRef",
        "terminationEvaluatorRefs",
        "terminationRuleRef",
      ]) && hasExactKeys(application.foldback, [
        "binding",
        "mode",
        "requiresParentEvaluation",
      ]);
    case "fan_out":
      return hasExactKeys(application, [
        ...base,
        "elementGraphFunctionRef",
        "inputMemberContractRef",
        "inputVectorRef",
        "outputMemberContractRef",
        "outputVectorRef",
      ]);
    case "fan_in":
      return hasExactKeys(application, [
        ...base,
        "inputVectorRef",
        "reducerGraphFunctionRef",
      ]);
    case "gate":
      return hasExactKeys(application, [
        ...base,
        "evaluatorRefs",
        "ruleRef",
        "targetRef",
      ]);
    case "promote":
      return hasExactKeys(application, [...base, "sourceRef", "targetRef"]);
    case "identity":
      return hasExactKeys(application, [...base, "targetRef"]);
    case "same_object":
      return hasExactKeys(application, [
        ...base,
        "leftRef",
        "rightRef",
        "witnessRef",
      ]);
  }
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
  readonly executableLeafRows: readonly ValidatedExecutableLeaf[];
  readonly interactionLeafRows: readonly ValidatedInteractionLeaf[];
  readonly transitiveReachableExecutableLeafKeys: readonly string[];
  readonly transitiveReachableInteractionLeafKeys: readonly string[];
  readonly diagnostics: readonly [];
}

interface ValidatedLeafBase {
  readonly requirementKey: string;
  readonly requirementKeyDigest: Sha256Digest;
  readonly graphFunctionRef: string;
  readonly graphFunctionDigest: Sha256Digest;
  readonly nodeRef: string;
  readonly programLocusRef: string;
  readonly stageRole: string;
  readonly armId: string;
  readonly compositionRef: string | null;
  readonly vectorIndex: number;
  readonly judgmentPredicateRef: string;
  readonly inputCarrierRef: string;
  readonly outputCarrierRef: string;
}

export interface ValidatedExecutableLeaf extends ValidatedLeafBase {
  readonly kind: "validated_executable_leaf";
  readonly fibre: "F_D" | "F_P";
  readonly requirement: ExecutableLeafRequirement;
}

export interface ValidatedInteractionLeaf extends ValidatedLeafBase {
  readonly kind: "validated_interaction_leaf";
  readonly fibre: "F_H";
  readonly requirement: InteractionLeafRequirement;
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
  diagnostics.push(...validatePublishedDeclarations(value));
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
  diagnostics.push(...validatePublishedDeclarations(publication));

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
  if (
    graphFunctions.length !== program.callableMembership.length ||
    graphFunctions.some((graphFunction) => !program.callableMembership.includes(graphFunction.name))
  ) {
    diagnostics.push({
      code: "missing_membership",
      path: "$.graphFunctions",
      message: "raw GraphFunction set must equal the complete Program callable membership",
    });
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
  const availableGraphFunctionRefs = new Set(graphFunctions.map((value) => value.name));
  const publishedEvaluatorRefs = new Set(publication.evaluators.map((value) => value.name));
  const publishedRuleRefs = new Set(publication.rules.map((value) => value.name));
  const callableGraphFunctionRefs = new Set(program.callableMembership);
  const programLocusRefs: string[] = [];
  const executableLeafRows: ValidatedExecutableLeaf[] = [];
  const interactionLeafRows: ValidatedInteractionLeaf[] = [];
  for (const graphFunction of graphFunctions) {
    const graphFunctionDigest = sha256Canonical(graphFunction as unknown as JsonValue);
    const nodes = new Map(graphFunction.template.nodes.map((node) => [node.nodeRef, node]));
    if (!nodes.has(graphFunction.template.startNodeRef) || graphFunction.template.terminalNodeRefs.some((ref) => !nodes.has(ref))) {
      diagnostics.push({ code: "topology_mismatch", path: `$.graphFunctions[${graphFunction.name}].template`, message: "start and terminal nodes must belong to the original graph template" });
    }
    if (graphFunction.template.edges.some((edge) => !nodes.has(edge.fromNodeRef) || !nodes.has(edge.toNodeRef))) {
      diagnostics.push({ code: "topology_mismatch", path: `$.graphFunctions[${graphFunction.name}].template.edges`, message: "edge endpoint is absent from graph template" });
    }
    if (graphFunction.template.edges.some((edge) => !hasExactGraphEdgeShape(edge))) {
      diagnostics.push({
        code: "identity_mismatch",
        path: `$.graphFunctions[${graphFunction.name}].template.edges`,
        message: "graph edge must have one exact derived identity and no undeclared fields",
      });
    }
    for (const contractRef of [...graphFunction.inputs, ...graphFunction.outputs]) {
      if (!contractRefs.has(contractRef)) diagnostics.push({ code: "missing_contract", path: `$.graphFunctions[${graphFunction.name}]`, message: `missing contract ${contractRef}` });
    }
    for (const node of graphFunction.template.nodes) {
      if (node.nodeRef.length === 0 || node.nodeKind !== "c_locus") {
        diagnostics.push({
          code: "invalid_reference",
          path: `$.graphFunctions[${graphFunction.name}].template.nodes`,
          message: "Graph node requires one non-empty c_locus identity",
        });
      }
      const inspection = inspectCProgramTerm(node.term, {
        path: `$.graphFunctions[${graphFunction.name}].template.nodes[${node.nodeRef}].term`,
        availableGraphFunctionRefs,
        callableGraphFunctionRefs,
        contractRefs,
        bindingByRef,
        expectedRootResultCardinality:
          graphFunction.template.terminalNodeRefs.includes(node.nodeRef)
            ? "one"
            : "zero",
      });
      diagnostics.push(...inspection.diagnostics);
      if (inspection.term !== null) {
        for (const leaf of cLeafTerms(inspection.term)) {
          programLocusRefs.push(leaf.programLocusRef);
          const commonKeyBody = {
            programRef: program.programRef,
            graphFunctionRef: graphFunction.name,
            graphFunctionDigest,
            programLocusRef: leaf.programLocusRef,
            stageRole: leaf.stageRole,
            fibre: leaf.fibre,
            armId: leaf.armId,
          };
          if (isExecutableCLeaf(leaf)) {
            const requirementKeyDigest = sha256Canonical({
              ...commonKeyBody,
              implementationBindingRef: leaf.requirement.implementationBindingRef,
              inputContractRef: leaf.requirement.inputContractRef,
              outputContractRef: leaf.requirement.outputContractRef,
              evidenceContractRef: leaf.requirement.evidenceContractRef,
              failureContractRef: leaf.requirement.failureContractRef,
              refusalContractRef: leaf.requirement.refusalContractRef,
              judgmentContractRef: leaf.requirement.judgmentContractRef,
            } as unknown as JsonValue);
            executableLeafRows.push({
              kind: "validated_executable_leaf",
              requirementKey: `executable-leaf://abiogenesis/${requirementKeyDigest.slice("sha256:".length)}`,
              requirementKeyDigest,
              graphFunctionRef: graphFunction.name,
              graphFunctionDigest,
              nodeRef: node.nodeRef,
              programLocusRef: leaf.programLocusRef,
              stageRole: leaf.stageRole,
              fibre: leaf.fibre,
              armId: leaf.armId,
              compositionRef: leaf.compositionRef,
              vectorIndex: leaf.vectorIndex,
              judgmentPredicateRef: leaf.judgmentPredicateRef,
              inputCarrierRef: leaf.inputCarrierRef,
              outputCarrierRef: leaf.outputCarrierRef,
              requirement: leaf.requirement,
            });
          } else if (isInteractionCLeaf(leaf)) {
            const requirementKeyDigest = sha256Canonical({
              ...commonKeyBody,
              interactionKind: leaf.requirement.interactionKind,
              actorCapabilityRef: leaf.requirement.actorCapabilityRef,
              requestContractRef: leaf.requirement.requestContractRef,
              responseContractRef: leaf.requirement.responseContractRef,
              continuationContractRef: leaf.requirement.continuationContractRef,
            } as unknown as JsonValue);
            interactionLeafRows.push({
              kind: "validated_interaction_leaf",
              requirementKey: `interaction-leaf://abiogenesis/${requirementKeyDigest.slice("sha256:".length)}`,
              requirementKeyDigest,
              graphFunctionRef: graphFunction.name,
              graphFunctionDigest,
              nodeRef: node.nodeRef,
              programLocusRef: leaf.programLocusRef,
              stageRole: leaf.stageRole,
              fibre: "F_H",
              armId: leaf.armId,
              compositionRef: leaf.compositionRef,
              vectorIndex: leaf.vectorIndex,
              judgmentPredicateRef: leaf.judgmentPredicateRef,
              inputCarrierRef: leaf.inputCarrierRef,
              outputCarrierRef: leaf.outputCarrierRef,
              requirement: leaf.requirement,
            });
          }
        }
      }
    }
    for (const applicationRef of duplicates(
      graphFunction.template.applications.map((application) => application.applicationRef),
    )) {
      diagnostics.push({
        code: "duplicate_identity",
        path: `$.graphFunctions[${graphFunction.name}].template.applications`,
        message: `duplicate GraphFunction application ${applicationRef}`,
      });
    }
    for (const application of graphFunction.template.applications) {
      const refs = Object.entries(application)
        .filter(([key]) => key.endsWith("Ref") || key.endsWith("Refs"))
        .flatMap(([, value]) => Array.isArray(value) ? value : [value]);
      if (
        application.kind !== "graph_function_application" ||
        !hasExactApplicationShape(application) ||
        application.applicationRef.length === 0 ||
        application.inputContractRef.length === 0 ||
        application.outputContractRef.length === 0 ||
        refs.some((ref) => typeof ref !== "string" || ref.length === 0) ||
        !contractRefs.has(application.inputContractRef) ||
        !contractRefs.has(application.outputContractRef)
      ) {
        diagnostics.push({
          code: "invalid_application",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
          message: "GraphFunction application has an empty reference or unpublished outer contract",
        });
      }
      let canonicalIdentity = false;
      try {
        canonicalIdentity =
          application.applicationRef === graphFunctionApplicationRef(application);
      } catch {
        canonicalIdentity = false;
      }
      if (!canonicalIdentity) {
        diagnostics.push({
          code: "invalid_application",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}].applicationRef`,
          message: "GraphFunction application identity must derive from its complete declaration",
        });
      }
      const referencedGraphFunctions: readonly string[] = (() => {
        switch (application.relationKind) {
          case "compose":
            return [application.leftGraphFunctionRef, application.rightGraphFunctionRef];
          case "substitute":
            return [application.outerGraphFunctionRef, application.innerGraphFunctionRef];
          case "recurse":
            return [application.graphFunctionRef];
          case "fan_out":
            return [application.elementGraphFunctionRef];
          case "fan_in":
            return [application.reducerGraphFunctionRef];
          case "gate":
            return [application.targetRef];
          case "identity":
          case "promote":
          case "same_object":
            return [];
        }
      })();
      const staticallyResolvedApplication =
        application.relationKind === "compose" ||
        application.relationKind === "substitute";
      const applicationGraphByRef = staticallyResolvedApplication
        ? publishedGraphByRef
        : rawGraphByRef;
      if (referencedGraphFunctions.some((ref) => !applicationGraphByRef.has(ref))) {
        diagnostics.push({
          code: "invalid_application",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
          message: staticallyResolvedApplication
            ? "statically resolved GraphFunction application references an unpublished function"
            : "runtime-visible GraphFunction application references a function outside complete Program membership",
        });
      }
      if (application.relationKind === "recurse" &&
        (
          !Number.isSafeInteger(application.bound) ||
          application.bound < 1 ||
          application.foldback.mode !== "rebind" ||
          application.foldback.binding.trim().length === 0 ||
          application.foldback.requiresParentEvaluation !== true ||
          application.foldbackRef !== foldbackRef(application.foldback)
        )) {
        diagnostics.push({
          code: "invalid_application",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}].foldback`,
          message: "recurse application requires a positive bound and exact rebind foldback with parent re-evaluation",
        });
      }
      if (
        application.relationKind === "recurse" &&
        (
          !publishedRuleRefs.has(application.terminationRuleRef) ||
          application.terminationEvaluatorRefs.length === 0 ||
          application.terminationEvaluatorRefs.some(
            (ref) => !publishedEvaluatorRefs.has(ref),
          )
        )
      ) {
        diagnostics.push({
          code: "invalid_application",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
          message: "recurse application requires published termination Rule and Evaluator declarations",
        });
      }
      if (
        application.relationKind === "gate" &&
        (
          !publishedRuleRefs.has(application.ruleRef) ||
          application.evaluatorRefs.length === 0 ||
          application.evaluatorRefs.some((ref) => !publishedEvaluatorRefs.has(ref))
        )
      ) {
        diagnostics.push({
          code: "invalid_application",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}].evaluatorRefs`,
          message: "gate application requires published Rule and Evaluator declarations",
        });
      }
      const referencedByRef = new Map(
        referencedGraphFunctions.flatMap((ref) => {
          const value = applicationGraphByRef.get(ref);
          return value === undefined ? [] : [[ref, value] as const];
        }),
      );
      const preservesOuterInterface = (ref: string): boolean => {
        const operand = referencedByRef.get(ref);
        return operand !== undefined &&
          operand.inputs.includes(application.inputContractRef) &&
          operand.outputs.includes(application.outputContractRef);
      };
      if (
        (application.relationKind === "recurse" &&
          !preservesOuterInterface(application.graphFunctionRef)) ||
        (application.relationKind === "gate" &&
          !preservesOuterInterface(application.targetRef)) ||
        (application.relationKind === "substitute" &&
          !preservesOuterInterface(application.outerGraphFunctionRef))
      ) {
        diagnostics.push({
          code: "carrier_mismatch",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
          message: "GraphFunction application does not preserve its declared outer interface",
        });
      }
      if (application.relationKind === "compose") {
        const left = referencedByRef.get(application.leftGraphFunctionRef);
        const right = referencedByRef.get(application.rightGraphFunctionRef);
        if (
          left === undefined ||
          right === undefined ||
          !left.inputs.includes(application.inputContractRef) ||
          !right.outputs.includes(application.outputContractRef) ||
          !left.outputs.some((contractRef) => right.inputs.includes(contractRef))
        ) {
          diagnostics.push({
            code: "carrier_mismatch",
            path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
            message: "compose application requires one typed left-to-right interface join",
          });
        }
      }
      if (application.relationKind === "substitute") {
        const outer = referencedByRef.get(application.outerGraphFunctionRef);
        const inner = referencedByRef.get(application.innerGraphFunctionRef);
        const targetEdges = outer?.template.edges.filter(
          (edge) => edge.edgeRef === application.targetVectorRef,
        ) ?? [];
        const targetEdge = targetEdges.length === 1 ? targetEdges[0] : undefined;
        const sourceNode = targetEdge === undefined
          ? undefined
          : outer?.template.nodes.find(
            (node) => node.nodeRef === targetEdge.fromNodeRef,
          );
        const targetNode = targetEdge === undefined
          ? undefined
          : outer?.template.nodes.find(
            (node) => node.nodeRef === targetEdge.toNodeRef,
          );
        const replacementEdgeRefs =
          targetEdge === undefined || inner === undefined
            ? []
            : [
              graphEdgeRef({
                fromNodeRef: targetEdge.fromNodeRef,
                toNodeRef: inner.template.startNodeRef,
              }),
              ...inner.template.terminalNodeRefs.map((fromNodeRef) =>
                graphEdgeRef({
                  fromNodeRef,
                  toNodeRef: targetEdge.toNodeRef,
                })),
            ];
        const materializedEdgeRefs = new Set(
          graphFunction.template.edges.map((edge) => edge.edgeRef),
        );
        const availableAtTarget = new Set([
          ...(outer?.environment.requires ?? []),
          ...(outer?.environment.provides ?? []),
          ...(outer?.environment.carries ?? []),
          ...(sourceNode === undefined ? [] : [sourceNode.term.outputCarrierRef]),
        ]);
        if (
          outer === undefined ||
          inner === undefined ||
          targetEdge === undefined ||
          sourceNode === undefined ||
          targetNode === undefined ||
          targetEdge.edgeRef !== graphEdgeRef(targetEdge) ||
          inner.inputs.length !== 1 ||
          inner.outputs.length !== 1 ||
          sourceNode.term.outputCarrierRef !== inner.inputs[0] ||
          inner.outputs[0] !== targetNode.term.inputCarrierRef ||
          inner.environment.requires.some((ref) => !availableAtTarget.has(ref)) ||
          graphFunction.template.edges.some(
            (edge) => edge.edgeRef === application.targetVectorRef,
          ) ||
          replacementEdgeRefs.some((ref) => !materializedEdgeRefs.has(ref)) ||
          inner.template.nodes.some((node) => !nodes.has(node.nodeRef))
        ) {
          diagnostics.push({
            code: "carrier_mismatch",
            path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
            message:
              "substitute application requires one exact target vector and a visible typed inner graph replacement",
          });
        }
      }
      if (application.relationKind === "fan_out") {
        const element = referencedByRef.get(application.elementGraphFunctionRef);
        if (
          element === undefined ||
          !element.inputs.includes(application.inputMemberContractRef) ||
          !element.outputs.includes(application.outputMemberContractRef)
        ) {
          diagnostics.push({
            code: "carrier_mismatch",
            path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
            message: "fan-out member contracts must match the declared element GraphFunction",
          });
        }
      }
      if (application.relationKind === "fan_in") {
        const reducer = referencedByRef.get(application.reducerGraphFunctionRef);
        if (reducer === undefined || !reducer.outputs.includes(application.outputContractRef)) {
          diagnostics.push({
            code: "carrier_mismatch",
            path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
            message: "fan-in output contract must match the declared reducer GraphFunction",
          });
        }
      }
      if (
        application.relationKind === "identity" &&
        application.inputContractRef !== application.outputContractRef
      ) {
        diagnostics.push({
          code: "carrier_mismatch",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
          message: "identity application must preserve one exact interface",
        });
      }
      if (
        application.relationKind === "promote" &&
        (
          application.sourceRef !== application.inputContractRef ||
          application.targetRef !== application.outputContractRef
        )
      ) {
        diagnostics.push({
          code: "carrier_mismatch",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
          message: "promote application must bind its declared source and target contracts",
        });
      }
      if (
        application.relationKind === "same_object" &&
        (
          application.leftRef !== application.rightRef ||
          application.witnessRef !== sameObjectWitnessRef(application.leftRef)
        )
      ) {
        diagnostics.push({
          code: "identity_mismatch",
          path: `$.graphFunctions[${graphFunction.name}].template.applications[${application.applicationRef}]`,
          message: "same-object application requires one canonical witness over one exact opaque identity",
        });
      }
    }
  }
  for (const programLocusRef of duplicates(programLocusRefs)) {
    diagnostics.push({
      code: "duplicate_identity",
      path: "$.graphFunctions[*].template.nodes[*].term",
      message: `duplicate C leaf program locus ${programLocusRef}`,
    });
  }
  for (const requirementKey of duplicates([
    ...executableLeafRows.map((row) => row.requirementKey),
    ...interactionLeafRows.map((row) => row.requirementKey),
  ])) {
    diagnostics.push({
      code: "duplicate_identity",
      path: "$.graphFunctions[*].template.nodes[*].term",
      message: `duplicate validated leaf requirement ${requirementKey}`,
    });
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
  executableLeafRows.sort((left, right) => left.requirementKey.localeCompare(right.requirementKey));
  interactionLeafRows.sort((left, right) => left.requirementKey.localeCompare(right.requirementKey));
  const transitiveReachableExecutableLeafKeys = executableLeafRows.map((row) => row.requirementKey);
  const transitiveReachableInteractionLeafKeys = interactionLeafRows.map((row) => row.requirementKey);
  const sourceDigest = sha256Canonical({
    publicationDigest: input.publication.subjectDigest,
    programDigest: input.program.subjectDigest,
    graphFunctionDigests,
    contractDigests,
    implementationBindingDigests,
    closureContractDigests,
    executableLeafRows,
    interactionLeafRows,
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
    executableLeafRows,
    interactionLeafRows,
    transitiveReachableExecutableLeafKeys,
    transitiveReachableInteractionLeafKeys,
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
