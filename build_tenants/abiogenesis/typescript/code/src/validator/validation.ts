import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import { sha256Canonical, type Sha256Digest } from "../shared/digests.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  EvaluatorDeclaration,
  GraphFunction,
  GraphFunctionApplication,
  GtlActionCatalogRow,
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
  cTermResultCardinality,
  isExecutableCLeaf,
  isInteractionCLeaf,
  type CProgramNode,
  type ExecutableLeafRequirement,
  type InteractionLeafRequirement,
} from "../gtl/c_algebra.js";
import { resolveCProgramLocus } from "../gtl/source_path.js";
import { isRawAdmittedValue, type RawAdmittedValue } from "./raw_admission.js";
import { inspectCProgramTerm } from "./c_algebra.js";

export const STATIC_DIAGNOSTIC_CODE_VALUES = [
  "duplicate_identity",
  "carrier_mismatch",
  "enclosing_carrier_mismatch",
  "environment_input_mismatch",
  "environment_output_mismatch",
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
  "outer_interface_mismatch",
  "workflow_interface_mismatch",
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

function workflowGraphFunctionRefs(term: Readonly<CProgramNode>): readonly string[] {
  switch (term.kind) {
    case "c_workflow":
      return [term.graphFunctionRef];
    case "c_compose":
      return term.terms.flatMap((child) => workflowGraphFunctionRefs(child));
    case "c_edge":
      return [
        ...workflowGraphFunctionRefs(term.transform),
        ...workflowGraphFunctionRefs(term.evaluate),
        ...workflowGraphFunctionRefs(term.consequence),
      ];
    case "c_batch":
      return term.tasks.flatMap((child) => workflowGraphFunctionRefs(child));
    case "c_retry":
      return workflowGraphFunctionRefs(term.term);
    case "c_identity":
    case "c_of":
      return [];
  }
}

function compositionTerms(
  graphFunction: Readonly<GraphFunction> | undefined,
): readonly Readonly<CProgramNode>[] {
  if (
    graphFunction === undefined ||
    graphFunction.template.nodes.length !== 1
  ) {
    return [];
  }
  const term = graphFunction.template.nodes[0]!.term;
  return term.kind === "c_compose" ? term.terms : [term];
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
  const semantics = publication.productSemanticsBinding;
  if (
    semantics.kind !== "product_semantics_binding" ||
    semantics.bindingRef.length === 0 ||
    semantics.packageName.length === 0 ||
    semantics.packageVersion.length === 0 ||
    semantics.modulePath.length === 0 ||
    semantics.namedSymbol.length === 0 ||
    publication.implementationBindings.some(
      (binding) =>
        binding.packageName !== semantics.packageName ||
        binding.packageVersion !== semantics.packageVersion,
    )
  ) {
    diagnostics.push({
      code: "invalid_reference",
      path: "$.productSemanticsBinding",
      message:
        "publication requires one exact Product-owned semantics binding carried by its implementation package",
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
        "terminationFieldRef",
        "terminationRuleRef",
      ]) && hasExactKeys(application.foldback, [
        "binding",
        "mode",
        "requiresParentEvaluation",
      ]);
    case "fan_out":
      return hasExactKeys(application, [
        ...base,
        "batchRef",
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
    case "re_enter":
      return hasExactKeys(application, [
        ...base,
        "graphFunctionRef",
        "maxApplications",
        "sourceProgramLocusRef",
        "targetProgramLocusRef",
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

const PUBLICATION_VALIDATION: unique symbol = Symbol(
  "abiogenesis.validator.publication-validation",
);
const PROGRAM_VALIDATION: unique symbol = Symbol(
  "abiogenesis.validator.program-validation",
);

export function isPublicationValidation(value: object): boolean {
  return Object.hasOwn(value, PUBLICATION_VALIDATION);
}

export function isProgramValidation(value: object): boolean {
  return Object.hasOwn(value, PROGRAM_VALIDATION);
}

function sameValue(left: unknown, right: unknown): boolean {
  return canonicalJson(left as JsonValue) === canonicalJson(right as JsonValue);
}

function sameCanonicalMembers(
  left: readonly unknown[],
  right: readonly unknown[],
): boolean {
  if (left.length !== right.length) return false;
  const canonical = (values: readonly unknown[]): readonly string[] =>
    values.map((value) => canonicalJson(value as JsonValue)).sort(compareUnicodeCodeUnits);
  const leftMembers = canonical(left);
  const rightMembers = canonical(right);
  return leftMembers.every((value, index) => value === rightMembers[index]);
}

function duplicates(values: readonly string[]): readonly string[] {
  const seen = new Set<string>();
  const duplicateValues = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicateValues.add(value);
    seen.add(value);
  }
  return [...duplicateValues].sort(compareUnicodeCodeUnits);
}

function identityFamilyDiagnostics<Value>(
  values: readonly Value[],
  identityOf: (value: Value) => string,
  path: string,
  label: string,
): readonly StaticDiagnostic[] {
  return duplicates(values.map(identityOf)).map((identity) => {
    const carriers = values.filter((value) => identityOf(value) === identity);
    const distinctCarriers = new Set(
      carriers.map((value) => canonicalJson(value as unknown as JsonValue)),
    );
    const equal = distinctCarriers.size === 1;
    return {
      code: equal ? "duplicate_identity" : "identity_mismatch",
      path,
      message: equal
        ? `duplicate ${label} identity ${identity}`
        : `${label} identity ${identity} is claimed by different carriers`,
    };
  });
}

function validateModuleIdentityClosure(
  publication: Readonly<ModulePublication>,
): readonly StaticDiagnostic[] {
  const diagnostics: StaticDiagnostic[] = [
    ...identityFamilyDiagnostics(
      publication.contracts,
      (value) => value.contractRef,
      "$.contracts",
      "Contract",
    ),
    ...identityFamilyDiagnostics(
      publication.evaluators,
      (value) => value.name,
      "$.evaluators",
      "Evaluator",
    ),
    ...identityFamilyDiagnostics(
      publication.rules,
      (value) => value.name,
      "$.rules",
      "Rule",
    ),
    ...identityFamilyDiagnostics(
      publication.implementationBindings,
      (value) => value.bindingRef,
      "$.implementationBindings",
      "ImplementationBinding",
    ),
    ...identityFamilyDiagnostics(
      publication.closureContracts,
      (value) => value.closureContractRef,
      "$.closureContracts",
      "ClosureContract",
    ),
    ...identityFamilyDiagnostics(
      publication.programs,
      (value) => value.programRef,
      "$.programs",
      "Program",
    ),
    ...identityFamilyDiagnostics(
      publication.graphFunctions,
      (value) => value.id,
      "$.graphFunctions",
      "GraphFunction",
    ),
    ...identityFamilyDiagnostics(
      publication.contributions,
      (value) => value.handle,
      "$.contributions",
      "contribution",
    ),
  ];

  for (const program of publication.programs) {
    const path = `$.programs[${program.programRef}]`;
    diagnostics.push(
      ...identityFamilyDiagnostics(
        program.starts,
        (value) => value.startRef,
        `${path}.starts`,
        "Program start",
      ),
    );
    if (program.publicAssetTargets !== undefined) {
      diagnostics.push(
        ...identityFamilyDiagnostics(
          program.publicAssetTargets,
          (value) => value.handle,
          `${path}.publicAssetTargets`,
          "public asset handle",
        ),
        ...identityFamilyDiagnostics(
          program.publicAssetTargets,
          (value) => value.assetRef,
          `${path}.publicAssetTargets`,
          "public asset ownership",
        ),
      );
    }
    if (program.actionCatalog !== undefined) {
      diagnostics.push(
        ...identityFamilyDiagnostics(
          program.actionCatalog.rows,
          (value) => value.actionRef,
          `${path}.actionCatalog.rows`,
          "action",
        ),
      );
    }
  }

  for (const graphFunction of publication.graphFunctions) {
    const path = `$.graphFunctions[${graphFunction.id}].template`;
    diagnostics.push(
      ...identityFamilyDiagnostics(
        graphFunction.template.nodes,
        (value) => value.nodeRef,
        `${path}.nodes`,
        "graph node",
      ),
      ...identityFamilyDiagnostics(
        graphFunction.template.edges,
        (value) => value.edgeRef,
        `${path}.edges`,
        "graph edge",
      ),
      ...identityFamilyDiagnostics(
        graphFunction.template.applications,
        (value) => value.applicationRef,
        `${path}.applications`,
        "GraphFunction application",
      ),
    );
  }

  return diagnostics;
}

function validateGraphTopology(
  graphFunction: Readonly<GraphFunction>,
): readonly StaticDiagnostic[] {
  const path = `$.graphFunctions[${graphFunction.id}].template`;
  const { nodes, edges, startNodeRef, terminalNodeRefs } = graphFunction.template;
  const diagnostics: StaticDiagnostic[] = [];
  const nodeRefs = nodes.map((node) => node.nodeRef);
  for (const ref of duplicates(nodeRefs)) {
    diagnostics.push({
      code: "duplicate_identity",
      path: `${path}.nodes`,
      message: `duplicate graph node identity ${ref}`,
    });
  }
  for (const ref of duplicates(edges.map((edge) => edge.edgeRef))) {
    diagnostics.push({
      code: "duplicate_identity",
      path: `${path}.edges`,
      message: `duplicate graph edge identity ${ref}`,
    });
  }
  const declared = new Set(nodeRefs);
  const terminals = new Set(terminalNodeRefs);
  if (
    startNodeRef.length === 0 ||
    !declared.has(startNodeRef) ||
    terminalNodeRefs.length === 0 ||
    terminals.size !== terminalNodeRefs.length ||
    terminalNodeRefs.some((ref) => !declared.has(ref))
  ) {
    diagnostics.push({
      code: "topology_mismatch",
      path,
      message: "graph requires one exact declared start and a non-empty unique declared terminal set",
    });
  }
  if (edges.some((edge) => !declared.has(edge.fromNodeRef) || !declared.has(edge.toNodeRef))) {
    diagnostics.push({
      code: "topology_mismatch",
      path: `${path}.edges`,
      message: "edge endpoint is absent from graph template",
    });
  }

  const outgoing = new Map<string, string[]>();
  for (const ref of declared) outgoing.set(ref, []);
  for (const edge of edges) outgoing.get(edge.fromNodeRef)?.push(edge.toNodeRef);
  for (const node of nodes) {
    const outdegree = outgoing.get(node.nodeRef)?.length ?? 0;
    const cardinality = cTermResultCardinality(node.term);
    const expectedOutdegree = cardinality === "zero" ? 1 : cardinality === "one" ? 0 : null;
    if (
      expectedOutdegree === null ||
      outdegree !== expectedOutdegree ||
      terminals.has(node.nodeRef) !== (expectedOutdegree === 0)
    ) {
      diagnostics.push({
        code: "topology_mismatch",
        path: `${path}.nodes[${node.nodeRef}]`,
        message: expectedOutdegree === null
          ? "graph node term has non-finite result cardinality"
          : `${node.term.kind} requires graph outdegree ${expectedOutdegree}`,
      });
    }
  }

  const reached = new Set<string>();
  const active = new Set<string>();
  let hasGraphEdgeCycle = false;
  const visit = (ref: string): void => {
    if (active.has(ref)) {
      hasGraphEdgeCycle = true;
      return;
    }
    if (reached.has(ref)) return;
    reached.add(ref);
    active.add(ref);
    for (const next of outgoing.get(ref) ?? []) visit(next);
    active.delete(ref);
  };
  if (declared.has(startNodeRef)) visit(startNodeRef);
  if (
    nodeRefs.some((ref) => !reached.has(ref)) ||
    terminalNodeRefs.some((ref) => !reached.has(ref))
  ) {
    diagnostics.push({
      code: "topology_mismatch",
      path,
      message: "every executable node and terminal must be reachable from the exact start",
    });
  }
  if (hasGraphEdgeCycle) {
    diagnostics.push({
      code: "topology_mismatch",
      path: `${path}.edges`,
      message: "graph-vector cycles cannot substitute for a declared GraphFunction recursion constructor",
    });
  }
  return diagnostics;
}

interface GraphFunctionCallEdge {
  readonly from: string;
  readonly to: string;
  readonly governedRecursion: boolean;
}

function isGovernedRecursionApplication(
  application: Readonly<GraphFunctionApplication>,
  graphFunctionByRef: ReadonlyMap<string, Readonly<GraphFunction>>,
  publishedRuleRefs: ReadonlySet<string>,
  publishedEvaluatorByRef: ReadonlyMap<string, Readonly<EvaluatorDeclaration>>,
): boolean {
  if (application.relationKind !== "recurse") return false;
  const target = graphFunctionByRef.get(application.graphFunctionRef);
  return hasExactApplicationShape(application) &&
    application.applicationRef === graphFunctionApplicationRef(application) &&
    Number.isSafeInteger(application.bound) &&
    application.bound > 0 &&
    application.foldback.mode === "rebind" &&
    application.foldback.binding.length > 0 &&
    application.foldback.requiresParentEvaluation === true &&
    application.foldbackRef === foldbackRef(application.foldback) &&
    /^\$\.[A-Za-z_][A-Za-z0-9_.]*$/u.test(application.terminationFieldRef) &&
    publishedRuleRefs.has(application.terminationRuleRef) &&
    application.terminationEvaluatorRefs.length > 0 &&
    new Set(application.terminationEvaluatorRefs).size ===
      application.terminationEvaluatorRefs.length &&
    application.terminationEvaluatorRefs.every((ref) =>
      publishedEvaluatorByRef.get(ref)?.consumedFieldRefs.includes(
        application.terminationFieldRef,
      ) === true
    ) &&
    target !== undefined &&
    target.inputs.includes(application.inputContractRef) &&
    target.outputs.includes(application.outputContractRef);
}

function graphFunctionCallEdges(
  graphFunctions: readonly Readonly<GraphFunction>[],
  publishedRuleRefs: ReadonlySet<string>,
  publishedEvaluatorByRef: ReadonlyMap<string, Readonly<EvaluatorDeclaration>>,
): readonly GraphFunctionCallEdge[] {
  const graphFunctionByRef = new Map(
    graphFunctions.map((graphFunction) => [graphFunction.id, graphFunction]),
  );
  return graphFunctions.flatMap((graphFunction) => {
    const edges: GraphFunctionCallEdge[] = [];
    for (const node of graphFunction.template.nodes) {
      for (const ref of workflowGraphFunctionRefs(node.term)) {
        edges.push({ from: graphFunction.id, to: ref, governedRecursion: false });
      }
    }
    for (const application of graphFunction.template.applications) {
      switch (application.relationKind) {
        case "compose":
          edges.push(
            { from: graphFunction.id, to: application.leftGraphFunctionRef, governedRecursion: false },
            { from: graphFunction.id, to: application.rightGraphFunctionRef, governedRecursion: false },
          );
          break;
        case "substitute":
          edges.push(
            { from: graphFunction.id, to: application.outerGraphFunctionRef, governedRecursion: false },
            { from: graphFunction.id, to: application.innerGraphFunctionRef, governedRecursion: false },
          );
          break;
        case "recurse":
          edges.push({
            from: graphFunction.id,
            to: application.graphFunctionRef,
            governedRecursion: isGovernedRecursionApplication(
              application,
              graphFunctionByRef,
              publishedRuleRefs,
              publishedEvaluatorByRef,
            ),
          });
          break;
        case "fan_out":
          edges.push({ from: graphFunction.id, to: application.elementGraphFunctionRef, governedRecursion: false });
          break;
        case "fan_in":
          edges.push({ from: graphFunction.id, to: application.reducerGraphFunctionRef, governedRecursion: false });
          break;
        case "re_enter":
        case "gate":
        case "promote":
        case "identity":
        case "same_object":
          break;
      }
    }
    return edges;
  });
}

function validateGraphFunctionCallTopology(
  graphFunctions: readonly Readonly<GraphFunction>[],
  publishedRuleRefs: ReadonlySet<string>,
  publishedEvaluatorByRef: ReadonlyMap<string, Readonly<EvaluatorDeclaration>>,
): readonly StaticDiagnostic[] {
  const diagnostics: StaticDiagnostic[] = [];
  const declared = new Set(graphFunctions.map((graphFunction) => graphFunction.id));
  // A governed recurse edge is the only edge allowed to close a cycle. Remove
  // each independently validated recurse edge and require the residual graph
  // to be acyclic. Merely sharing an SCC with one recurse edge is insufficient:
  // every possible cycle must cross governed recursion law.
  const edges = graphFunctionCallEdges(
    graphFunctions,
    publishedRuleRefs,
    publishedEvaluatorByRef,
  )
    .filter((edge) => declared.has(edge.to) && !edge.governedRecursion);
  const adjacency = new Map<string, GraphFunctionCallEdge[]>();
  for (const id of declared) adjacency.set(id, []);
  for (const edge of edges) adjacency.get(edge.from)?.push(edge);

  let nextIndex = 0;
  const indices = new Map<string, number>();
  const lowLinks = new Map<string, number>();
  const stack: string[] = [];
  const onStack = new Set<string>();
  const visit = (id: string): void => {
    const index = nextIndex;
    nextIndex += 1;
    indices.set(id, index);
    lowLinks.set(id, index);
    stack.push(id);
    onStack.add(id);
    for (const edge of adjacency.get(id) ?? []) {
      if (!indices.has(edge.to)) {
        visit(edge.to);
        lowLinks.set(id, Math.min(lowLinks.get(id)!, lowLinks.get(edge.to)!));
      } else if (onStack.has(edge.to)) {
        lowLinks.set(id, Math.min(lowLinks.get(id)!, indices.get(edge.to)!));
      }
    }
    if (lowLinks.get(id) !== indices.get(id)) return;
    const component: string[] = [];
    while (stack.length !== 0) {
      const member = stack.pop()!;
      onStack.delete(member);
      component.push(member);
      if (member === id) break;
    }
    const members = new Set(component);
    const internalEdges = edges.filter((edge) => members.has(edge.from) && members.has(edge.to));
    const cyclic = component.length > 1 || internalEdges.some((edge) => edge.from === edge.to);
    if (cyclic) {
      diagnostics.push({
        code: "topology_mismatch",
        path: "$.graphFunctions",
        message: `GraphFunction call cycle ${component.sort().join(" -> ")} remains after exact bounded recurse/foldback edges are removed`,
      });
    }
  };
  for (const id of declared) if (!indices.has(id)) visit(id);
  return diagnostics;
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
    return invalid("publication", publication.subjectDigest, diagnostics);
  }
  if (
    contributions.some(
      (row) =>
        !isRawAdmittedValue(row) || row.subjectKind !== "catalog_contribution",
    )
  ) {
    diagnostics.push({
      code: "raw_subject_mismatch",
      path: "$.contributions",
      message: "expected raw-admitted catalog contributions",
    });
    return invalid("publication", publication.subjectDigest, diagnostics);
  }
  const identityDiagnostics = validateModuleIdentityClosure(value);
  const rawContributionIdentityDiagnostics = identityFamilyDiagnostics(
    contributions.map((row) => row.value),
    (row) => row.handle,
    "$.contributions",
    "raw contribution",
  );
  if (
    identityDiagnostics.length !== 0 ||
    rawContributionIdentityDiagnostics.length !== 0
  ) {
    return invalid("publication", publication.subjectDigest, [
      ...identityDiagnostics,
      ...rawContributionIdentityDiagnostics,
    ]);
  }
  if (!sameCanonicalMembers(value.contributions, contributions.map((row) => row.value))) {
    diagnostics.push({
      code: "raw_subject_mismatch",
      path: "$.contributions",
      message: "raw contribution set differs from publication",
    });
    return invalid("publication", publication.subjectDigest, diagnostics);
  }
  if (value.contributions.length === 0) {
    diagnostics.push({ code: "invalid_contribution", path: "$.contributions", message: "publication requires at least one contribution" });
  }
  diagnostics.push(...validatePublishedDeclarations(value));
  const rawByHandle = new Map(contributions.map((row) => [row.value.handle, row]));
  const graphFunctionRefs = new Set(value.graphFunctions.map((graphFunction) => graphFunction.id));
  const contractRefs = new Set(value.contracts.map((contract) => contract.contractRef));
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
      const hasExactPublicHandleBinding = row.programMembershipRefs.every(
        (ref) => {
          const program = programByRef.get(ref);
          return program?.publicAssetTargets?.some(
            (target) => {
              const start = program.starts.find(
                (candidate) => candidate.startRef === target.startRef,
              );
              const directStart =
                start?.graphFunctionRef === row.declarationOrContractRef;
              const supervisedSelection =
                program.policies["abg.root_mode"] === "supervised" &&
                start?.graphFunctionRef ===
                  program.constructionComposition?.graphFunctionRef &&
                program.actionCatalog?.rows.some(
                  (action) =>
                    action.programRef === program.programRef &&
                    action.graphFunctionRef === row.declarationOrContractRef &&
                    action.targetProgramLocusRef ===
                      row.declarationOrContractRef,
                ) === true;
              return target.handle === row.handle &&
                target.assetRef === row.declarationOrContractRef &&
                (directStart || supervisedSelection);
            },
          ) === true;
        },
      );
      if (
        (
          row.handle !== row.declarationOrContractRef &&
          !hasExactPublicHandleBinding
        ) ||
        row.programMembershipRefs.length === 0 ||
        row.programMembershipRefs.some((ref) => {
          const program = programByRef.get(ref);
          return program === undefined || !program.callableMembership.includes(row.declarationOrContractRef);
        })
      ) {
        diagnostics.push({ code: "missing_membership", path: `$.contributions[${row.handle}].programMembershipRefs`, message: "graph_function contribution requires exact Program membership" });
      }
    } else {
      if (!contractRefs.has(row.declarationOrContractRef)) {
        diagnostics.push({ code: "invalid_reference", path: `$.contributions[${row.handle}].declarationOrContractRef`, message: "non-callable contribution does not reference a published contract" });
      }
      if (
        row.kind === "node_type" &&
        row.programMembershipRefs.length !== 0
      ) {
        diagnostics.push({ code: "invalid_contribution", path: `$.contributions[${row.handle}].programMembershipRefs`, message: "node_type contributions cannot carry callable Program membership" });
      }
      if (
        row.kind === "overlay" &&
        (
          row.programMembershipRefs.length === 0 ||
          row.programMembershipRefs.some((ref) => !programByRef.has(ref))
        )
      ) {
        diagnostics.push({ code: "missing_membership", path: `$.contributions[${row.handle}].programMembershipRefs`, message: "overlay contributions require exact published Program composition membership" });
      }
    }
  }
  if (diagnostics.length !== 0) return invalid("publication", publication.subjectDigest, diagnostics);
  const contributionDispositions = contributions.map((row) => ({
    handle: row.value.handle,
    kind: row.value.kind,
    disposition: "valid" as const,
    contributionDigest: row.subjectDigest,
  })).sort((left, right) => compareUnicodeCodeUnits(left.handle, right.handle));
  const validationDigest = sha256Canonical({
    publicationDigest: publication.subjectDigest,
    contributionDispositions,
  } as unknown as JsonValue);
  const validation = {
    kind: "publication_validation",
    schemaVersion: "5.0.0",
    disposition: "valid",
    validationRef: `publication-validation://abiogenesis/${validationDigest.slice("sha256:".length)}`,
    publicationDigest: publication.subjectDigest,
    moduleRef: value.moduleRef,
    rawAdmissionRef: publication.admissionRef,
    contributionDispositions,
    diagnostics: [],
  } as PublicationValidation;
  Object.defineProperty(validation, PUBLICATION_VALIDATION, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  });
  return deepFreeze(validation) as PublicationValidation;
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
  const identityDiagnostics = [
    ...validateModuleIdentityClosure(publication),
    ...identityFamilyDiagnostics(
      graphFunctions,
      (value) => value.id,
      "$.graphFunctions",
      "raw GraphFunction",
    ),
    ...identityFamilyDiagnostics(
      contracts,
      (value) => value.contractRef,
      "$.contracts",
      "raw Contract",
    ),
    ...identityFamilyDiagnostics(
      bindings,
      (value) => value.bindingRef,
      "$.implementationBindings",
      "raw ImplementationBinding",
    ),
    ...identityFamilyDiagnostics(
      closureContracts,
      (value) => value.closureContractRef,
      "$.closureContracts",
      "raw ClosureContract",
    ),
  ];
  if (identityDiagnostics.length !== 0) {
    return invalid("program", input.program.subjectDigest, identityDiagnostics);
  }

  const publishedPrograms = publication.programs.filter(
    (candidate) => candidate.programRef === program.programRef,
  );
  if (publishedPrograms.length !== 1 || !sameValue(publishedPrograms[0], program)) {
    diagnostics.push({ code: "raw_subject_mismatch", path: "$.program", message: "Program is not the exact published declaration" });
    return invalid("program", input.program.subjectDigest, diagnostics);
  }
  const expectedGraphFunctions = publication.graphFunctions.filter(
    (value) => program.callableMembership.includes(value.id),
  );
  const expectedRawValues: readonly [readonly unknown[], readonly unknown[], string][] = [
    [expectedGraphFunctions, graphFunctions, "graphFunctions"],
    [publication.contracts, contracts, "contracts"],
    [publication.implementationBindings, bindings, "implementationBindings"],
    [publication.closureContracts, closureContracts, "closureContracts"],
  ];
  for (const [published, raw, path] of expectedRawValues) {
    if (!sameCanonicalMembers(published, raw)) {
      diagnostics.push({ code: "raw_subject_mismatch", path: `$.${path}`, message: `raw ${path} differ from publication` });
    }
  }
  if (diagnostics.length !== 0) {
    return invalid("program", input.program.subjectDigest, diagnostics);
  }

  diagnostics.push(...validatePublishedDeclarations(publication));
  if (program.moduleRef !== publication.moduleRef) {
    diagnostics.push({ code: "identity_mismatch", path: "$.program.moduleRef", message: "Program module differs from publication" });
  }
  const publishedGraphByRef = new Map(publication.graphFunctions.map((value) => [value.id, value]));
  const rawGraphByRef = new Map(graphFunctions.map((value) => [value.id, value]));
  for (const graphFunctionRef of program.callableMembership) {
    const published = publishedGraphByRef.get(graphFunctionRef);
    const raw = rawGraphByRef.get(graphFunctionRef);
    if (published === undefined || raw === undefined || !sameValue(published, raw)) {
      diagnostics.push({ code: "missing_membership", path: "$.program.callableMembership", message: `missing exact GraphFunction ${graphFunctionRef}` });
    }
  }
  if (
    graphFunctions.length !== program.callableMembership.length ||
    graphFunctions.some((graphFunction) => !program.callableMembership.includes(graphFunction.id))
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
  for (const ref of duplicates(program.starts.map((start) => start.startRef))) {
    diagnostics.push({
      code: "duplicate_identity",
      path: "$.program.starts",
      message: `duplicate Program start ${ref}`,
    });
  }
  if (program.publicAssetTargets !== undefined) {
    for (const handle of duplicates(
      program.publicAssetTargets.map((target) => target.handle),
    )) {
      diagnostics.push({
        code: "duplicate_identity",
        path: "$.program.publicAssetTargets",
        message: `duplicate public asset handle ${handle}`,
      });
    }
    for (const assetRef of duplicates(
      program.publicAssetTargets.map((target) => target.assetRef),
    )) {
      diagnostics.push({
        code: "duplicate_identity",
        path: "$.program.publicAssetTargets",
        message: `ambiguous public asset ownership ${assetRef}`,
      });
    }
    for (
      const [index, target] of program.publicAssetTargets.entries()
    ) {
      const start = program.starts.find(
        (candidate) => candidate.startRef === target.startRef,
      );
      if (
        !hasExactKeys(target, [
          "assetRef",
          "handle",
          "kind",
          "startRef",
        ]) ||
        target.kind !== "program_public_asset_target" ||
        typeof target.handle !== "string" ||
        target.handle.length === 0 ||
        typeof target.assetRef !== "string" ||
        target.assetRef.length === 0 ||
        typeof target.startRef !== "string" ||
        start === undefined
      ) {
        diagnostics.push({
          code: "missing_membership",
          path: `$.program.publicAssetTargets[${index}]`,
          message:
            "public asset target must bind one non-empty Product handle and asset to one declared Program start",
        });
      }
    }
  }
  const defaultStartRef = program.policies["abg.default_start_ref"];
  if (
    defaultStartRef !== undefined &&
    program.starts.filter((start) => start.startRef === defaultStartRef)
        .length !== 1
  ) {
    diagnostics.push({
      code: "missing_membership",
      path: "$.program.policies.abg.default_start_ref",
      message: "default public start must resolve exactly once",
    });
  }
  for (const ref of duplicates(program.callableMembership)) {
    diagnostics.push({ code: "duplicate_identity", path: "$.program.callableMembership", message: `duplicate GraphFunction membership ${ref}` });
  }
  const contractRefs = new Set(contracts.map((contract) => contract.contractRef));
  const bindingByRef = new Map(bindings.map((binding) => [binding.bindingRef, binding]));
  const availableGraphFunctionRefs = new Set(graphFunctions.map((value) => value.id));
  const graphFunctionByRef = new Map(
    graphFunctions.map((value) => [value.id, value]),
  );
  const publishedEvaluatorByRef = new Map(
    publication.evaluators.map((value) => [value.name, value]),
  );
  const publishedEvaluatorRefs = new Set(publication.evaluators.map((value) => value.name));
  const publishedRuleRefs = new Set(publication.rules.map((value) => value.name));
  const callableGraphFunctionRefs = new Set(program.callableMembership);
  const programLocusRefs: string[] = [];
  const executableLeafRows: ValidatedExecutableLeaf[] = [];
  const interactionLeafRows: ValidatedInteractionLeaf[] = [];
  for (const graphFunction of graphFunctions) {
    const graphFunctionDigest = sha256Canonical(graphFunction as unknown as JsonValue);
    diagnostics.push(...validateGraphTopology(graphFunction));
    const nodes = new Map(graphFunction.template.nodes.map((node) => [node.nodeRef, node]));
    for (const [surface, values] of [
      ["requires", graphFunction.environment.requires],
      ["provides", graphFunction.environment.provides],
      ["carries", graphFunction.environment.carries],
    ] as const) {
      for (const ref of duplicates(values)) {
        diagnostics.push({
          code: "duplicate_identity",
          path: `$.graphFunctions[${graphFunction.id}].environment.${surface}`,
          message: `environment ${surface} contains duplicate binding ${ref}`,
        });
      }
    }
    if (!sameCanonicalMembers(
      graphFunction.inputs,
      graphFunction.environment.requires,
    )) {
      diagnostics.push({
        code: "environment_input_mismatch",
        path: `$.graphFunctions[${graphFunction.id}].environment.requires`,
        message: "GraphFunction inputs must exactly equal environment requires",
      });
    }
    if (graphFunction.outputs.some(
      (ref) => !graphFunction.environment.provides.includes(ref),
    )) {
      diagnostics.push({
        code: "environment_output_mismatch",
        path: `$.graphFunctions[${graphFunction.id}].environment.provides`,
        message: "GraphFunction outputs must be present in environment provides",
      });
    }
    const cumulativeBindings = new Set(graphFunction.environment.carries);
    if ([
      ...graphFunction.environment.requires,
      ...graphFunction.environment.provides,
    ].some((ref) => !cumulativeBindings.has(ref))) {
      diagnostics.push({
        code: "environment_output_mismatch",
        path: `$.graphFunctions[${graphFunction.id}].environment.carries`,
        message:
          "GraphFunction environment carries must contain every required and provided binding",
      });
    }
    const startNode = nodes.get(graphFunction.template.startNodeRef);
    if (
      graphFunction.inputs.length !== 1 ||
      startNode === undefined ||
      startNode.term.inputCarrierRef !== graphFunction.inputs[0]
    ) {
      diagnostics.push({
        code: "outer_interface_mismatch",
        path: `$.graphFunctions[${graphFunction.id}].template.startNodeRef`,
        message:
          "GraphFunction start term input must equal the GraphFunction input",
      });
    }
    const terminalNodes = graphFunction.template.terminalNodeRefs
      .map((ref) => nodes.get(ref));
    if (
      graphFunction.outputs.length !== 1 ||
      terminalNodes.length === 0 ||
      terminalNodes.some(
        (node) =>
          node === undefined ||
          node.term.outputCarrierRef !== graphFunction.outputs[0],
      )
    ) {
      diagnostics.push({
        code: "outer_interface_mismatch",
        path: `$.graphFunctions[${graphFunction.id}].template.terminalNodeRefs`,
        message:
          "GraphFunction terminal term output must equal the GraphFunction output",
      });
    }
    if (graphFunction.template.edges.some((edge) => !hasExactGraphEdgeShape(edge))) {
      diagnostics.push({
        code: "identity_mismatch",
        path: `$.graphFunctions[${graphFunction.id}].template.edges`,
        message: "graph edge must have one exact derived identity and no undeclared fields",
      });
    }
    for (const contractRef of [...graphFunction.inputs, ...graphFunction.outputs]) {
      if (!contractRefs.has(contractRef)) diagnostics.push({ code: "missing_contract", path: `$.graphFunctions[${graphFunction.id}]`, message: `missing contract ${contractRef}` });
    }
    for (const node of graphFunction.template.nodes) {
      if (node.nodeRef.length === 0 || node.nodeKind !== "c_locus") {
        diagnostics.push({
          code: "invalid_reference",
          path: `$.graphFunctions[${graphFunction.id}].template.nodes`,
          message: "Graph node requires one non-empty c_locus identity",
        });
      }
      const inspection = inspectCProgramTerm(node.term, {
        path: `$.graphFunctions[${graphFunction.id}].template.nodes[${node.nodeRef}].term`,
        availableGraphFunctionRefs,
        callableGraphFunctionRefs,
        graphFunctionByRef,
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
            graphFunctionRef: graphFunction.id,
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
              graphFunctionRef: graphFunction.id,
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
              graphFunctionRef: graphFunction.id,
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
        path: `$.graphFunctions[${graphFunction.id}].template.applications`,
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
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
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
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}].applicationRef`,
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
          case "re_enter":
            return [application.graphFunctionRef];
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
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
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
          !/^\$\.[A-Za-z_][A-Za-z0-9_.]*$/u.test(
            application.terminationFieldRef,
          ) ||
          application.foldbackRef !== foldbackRef(application.foldback)
        )) {
        diagnostics.push({
          code: "invalid_application",
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}].foldback`,
          message: "recurse application requires a positive bound and exact rebind foldback with parent re-evaluation",
        });
      }
      if (
        application.relationKind === "recurse" &&
        (
          !publishedRuleRefs.has(application.terminationRuleRef) ||
          application.terminationEvaluatorRefs.length === 0 ||
          new Set(application.terminationEvaluatorRefs).size !==
            application.terminationEvaluatorRefs.length ||
          application.terminationEvaluatorRefs.some(
            (ref) => !publishedEvaluatorRefs.has(ref),
          ) ||
          application.terminationEvaluatorRefs.some(
            (ref) =>
              !publishedEvaluatorByRef.get(ref)?.consumedFieldRefs.includes(
                application.terminationFieldRef,
              ),
          )
        )
      ) {
        diagnostics.push({
          code: "invalid_application",
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
          message: "recurse application requires published termination Rule and Evaluator declarations over its exact decision field",
        });
      }
      if (
        application.relationKind === "gate" &&
        (
          !publishedRuleRefs.has(application.ruleRef) ||
          application.evaluatorRefs.length === 0 ||
          new Set(application.evaluatorRefs).size !==
            application.evaluatorRefs.length ||
          application.evaluatorRefs.some((ref) => !publishedEvaluatorRefs.has(ref))
        )
      ) {
        diagnostics.push({
          code: "invalid_application",
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}].evaluatorRefs`,
          message: "gate application requires published Rule and Evaluator declarations",
        });
      }
      if (application.relationKind === "gate") {
        const attachedLeaves = graphFunction.template.nodes
          .flatMap((node) => cLeafTerms(node.term))
          .filter((leaf) => leaf.compositionRef === application.applicationRef);
        const workflowTargets = graphFunction.template.nodes
          .flatMap((node) => workflowGraphFunctionRefs(node.term));
        const expectedExecutableBindings = application.evaluatorRefs
          .flatMap((ref) => {
            const evaluator = publishedEvaluatorByRef.get(ref);
            return evaluator === undefined || evaluator.regime === "F_H"
              ? []
              : [evaluator.binding];
          })
          .sort();
        const attachedExecutableBindings = attachedLeaves
          .filter(isExecutableCLeaf)
          .map((leaf) =>
            bindingByRef.get(leaf.requirement.implementationBindingRef)
              ?.implementationRef ?? ""
          )
          .sort();
        const expectedRegimes = application.evaluatorRefs
          .map((ref) => publishedEvaluatorByRef.get(ref)?.regime ?? "")
          .sort();
        const attachedRegimes = attachedLeaves
          .map((leaf) => leaf.fibre)
          .sort();
        if (
          attachedLeaves.length === 0 ||
          workflowTargets.length !== 1 ||
          workflowTargets[0] !== application.targetRef ||
          attachedLeaves.some(
            (leaf) =>
              leaf.stageRole !== "evaluate" ||
              leaf.outputCarrierRef !== application.inputContractRef,
          ) ||
          canonicalJson(expectedExecutableBindings) !==
            canonicalJson(attachedExecutableBindings) ||
          canonicalJson(expectedRegimes) !== canonicalJson(attachedRegimes)
        ) {
          diagnostics.push({
            code: "invalid_application",
            path:
              `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
            message:
              "gate application requires exact evaluator loci and one matching workflow target",
          });
        }
      }
      if (application.relationKind === "re_enter") {
        const source = resolveCProgramLocus(
          graphFunction.template,
          application.sourceProgramLocusRef,
        );
        const target = resolveCProgramLocus(
          graphFunction.template,
          application.targetProgramLocusRef,
        );
        const sourceLeaves = source.kind === "c_program_locus"
          ? graphFunction.template.nodes
            .find((node) => node.nodeRef === source.nodeRef)
            ?.term
          : undefined;
        const orderedLeaves = sourceLeaves === undefined
          ? []
          : cLeafTerms(sourceLeaves);
        const sourceIndex = source.kind === "c_program_locus"
          ? orderedLeaves.findIndex(
              (leaf) => leaf.programLocusRef === source.leaf.programLocusRef,
            )
          : -1;
        const targetIndex = target.kind === "c_program_locus"
          ? orderedLeaves.findIndex(
              (leaf) => leaf.programLocusRef === target.leaf.programLocusRef,
            )
          : -1;
        if (
          application.graphFunctionRef !== graphFunction.id ||
          !Number.isSafeInteger(application.maxApplications) ||
          application.maxApplications < 1 ||
          source.kind !== "c_program_locus" ||
          target.kind !== "c_program_locus" ||
          source.nodeRef !== target.nodeRef ||
          sourceIndex < 1 ||
          targetIndex < 0 ||
          targetIndex >= sourceIndex ||
          source.termPath.includes("tasks") ||
          source.termPath.includes("term") ||
          target.termPath.includes("tasks") ||
          target.termPath.includes("term") ||
          source.leaf.resultBearing ||
          source.leaf.outputCarrierRef !== application.inputContractRef ||
          target.leaf.inputCarrierRef !== application.outputContractRef
        ) {
          diagnostics.push({
            code: "invalid_application",
            path:
              `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
            message:
              "re-enter application requires one bounded earlier locus in the same static graph span with exact source-output and target-input contracts",
          });
        }
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
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
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
            path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
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
            path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
            message:
              "substitute application requires one exact target vector and a visible typed inner graph replacement",
          });
        }
      }
      if (application.relationKind === "fan_out") {
        const element = referencedByRef.get(application.elementGraphFunctionRef);
        const batches = graphFunction.template.nodes.flatMap((node) => {
          const found: CProgramNode[] = [];
          const visit = (term: Readonly<CProgramNode>): void => {
            if (term.kind === "c_batch") found.push(term);
            if (term.kind === "c_compose") term.terms.forEach(visit);
            if (term.kind === "c_edge") {
              visit(term.transform);
              visit(term.evaluate);
              visit(term.consequence);
            }
            if (term.kind === "c_batch") term.tasks.forEach(visit);
            if (term.kind === "c_retry") visit(term.term);
          };
          visit(node.term);
          return found.filter((term) =>
            term.kind === "c_batch" && term.batchRef === application.batchRef);
        });
        const batch = batches.length === 1 && batches[0]?.kind === "c_batch"
          ? batches[0]
          : undefined;
        if (
          element === undefined ||
          application.inputContractRef !== application.inputVectorRef ||
          application.outputContractRef !== application.outputVectorRef ||
          !element.inputs.includes(application.inputMemberContractRef) ||
          !element.outputs.includes(application.outputMemberContractRef) ||
          batch === undefined ||
          batch.inputCarrierRef !== application.inputVectorRef ||
          batch.outputCarrierRef !== application.outputVectorRef ||
          batch.taskInputCarrierRef !== application.inputMemberContractRef ||
          batch.taskOutputCarrierRef !== application.outputMemberContractRef ||
          batch.tasks.length !== 1 ||
          batch.tasks[0]?.kind !== "c_workflow" ||
          batch.tasks[0].graphFunctionRef !==
            application.elementGraphFunctionRef
        ) {
          diagnostics.push({
            code: "carrier_mismatch",
            path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
            message:
              "fan-out must bind one exact vector/member C.batch seed and declared element GraphFunction",
          });
        }
      }
      if (application.relationKind === "fan_in") {
        const reducer = referencedByRef.get(application.reducerGraphFunctionRef);
        if (
          reducer === undefined ||
          application.inputContractRef !== application.inputVectorRef ||
          !reducer.inputs.includes(application.inputVectorRef) ||
          !reducer.outputs.includes(application.outputContractRef)
        ) {
          diagnostics.push({
            code: "carrier_mismatch",
            path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
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
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
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
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
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
          path: `$.graphFunctions[${graphFunction.id}].template.applications[${application.applicationRef}]`,
          message: "same-object application requires one canonical witness over one exact opaque identity",
        });
      }
    }
  }
  diagnostics.push(...validateGraphFunctionCallTopology(
    graphFunctions,
    publishedRuleRefs,
    publishedEvaluatorByRef,
  ));
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
  if (program.constructionComposition !== undefined) {
    const composition = program.constructionComposition;
    const { compositionDigest, ...compositionBody } = composition;
    const expectedSemanticAuthorities = [
      "synthesizeModel",
      "evalGap",
      "evaluateNext",
      "evaluateAction",
    ] as const;
    const expectedLocusOrder = [
      composition.authorities[0]?.initialProgramLocusRef,
      composition.authorities[1]?.initialProgramLocusRef,
      composition.authorities[2]?.initialProgramLocusRef,
      composition.interactionProgramLocusRef,
      composition.authorities[3]?.initialProgramLocusRef,
      composition.authorities[0]?.refreshProgramLocusRef,
      composition.authorities[1]?.refreshProgramLocusRef,
      composition.authorities[2]?.refreshProgramLocusRef,
    ];
    const boundLocusRefs = expectedLocusOrder.filter(
      (value): value is string => typeof value === "string",
    );
    const orderedTerms = compositionTerms(
      graphFunctions.find(
        (graphFunction) =>
          graphFunction.id === composition.graphFunctionRef,
      ),
    );
    const authorityShapeIsExact =
      composition.authorities.length === 4 &&
      composition.authorities.every((binding, index) =>
        hasExactKeys(binding, [
          "authorityRef",
          "initialProgramLocusRef",
          "kind",
          "refreshProgramLocusRef",
          "semanticAuthority",
        ]) &&
        binding.kind === "construction_authority_binding" &&
        binding.semanticAuthority === expectedSemanticAuthorities[index] &&
        binding.authorityRef.length > 0 &&
        binding.initialProgramLocusRef.length > 0 &&
        (
          binding.refreshProgramLocusRef === null ||
          binding.refreshProgramLocusRef.length > 0
        ) &&
        (
          binding.semanticAuthority === "evaluateAction"
            ? binding.refreshProgramLocusRef === null
            : binding.refreshProgramLocusRef !== null
        )
      );
    const compositionShapeIsExact =
      hasExactKeys(composition, [
        "authorities",
        "closurePolicy",
        "compositionDigest",
        "compositionRef",
        "graphFunctionRef",
        "interactionProgramLocusRef",
        "kind",
        "schemaVersion",
      ]) &&
      composition.kind === "construction_composition" &&
      composition.schemaVersion === "5.0.0" &&
      composition.compositionRef.length > 0 &&
      composition.graphFunctionRef.length > 0 &&
      composition.interactionProgramLocusRef.length > 0 &&
      compositionDigest === sha256Canonical(
        compositionBody as unknown as JsonValue,
      ) &&
      hasExactKeys(composition.closurePolicy, [
        "kind",
        "policyRef",
        "requireCompleteEvidence",
        "requirePostEvidenceRefresh",
      ]) &&
      composition.closurePolicy.kind === "construction_policy" &&
      composition.closurePolicy.policyRef.length > 0 &&
      composition.closurePolicy.requireCompleteEvidence === true &&
      composition.closurePolicy.requirePostEvidenceRefresh === true;
    const compositionMembershipIsExact =
      program.callableMembership.includes(composition.graphFunctionRef) &&
      boundLocusRefs.length === 8 &&
      new Set(boundLocusRefs).size === 8 &&
      orderedTerms.length === 8 &&
      orderedTerms.every((term, index) => {
        const expectedLocusRef = boundLocusRefs[index];
        if (index === 3 && term.kind === "c_workflow") {
          return term.graphFunctionRef === expectedLocusRef;
        }
        return term.kind === "c_of" &&
          term.compositionRef === composition.compositionRef &&
          term.vectorIndex === index &&
          term.programLocusRef === expectedLocusRef;
      }) &&
      (
        orderedTerms[3]?.kind === "c_workflow" ||
        (
          orderedTerms[3]?.kind === "c_of" &&
          isInteractionCLeaf(orderedTerms[3])
        )
      ) &&
      orderedTerms.filter(
        (term) => term.kind === "c_of" && isInteractionCLeaf(term),
      ).length === (orderedTerms[3]?.kind === "c_workflow" ? 0 : 1);
    if (
      !authorityShapeIsExact ||
      !compositionShapeIsExact ||
      !compositionMembershipIsExact
    ) {
      diagnostics.push({
        code: "missing_membership",
        path: "$.program.constructionComposition",
        message:
          "construction composition must bind the exact four semantic authorities, one interaction boundary, one Product policy, and the declared initial/refresh locus order",
      });
    }
  }
  if (program.actionCatalog !== undefined) {
    const { catalogRef, catalogDigest, ...catalogBody } = program.actionCatalog;
    const expectedCatalogDigest = sha256Canonical(
      catalogBody as unknown as JsonValue,
    );
    if (
      program.actionCatalog.kind !== "action_catalog" ||
      program.actionCatalog.schemaVersion !== "5.0.0" ||
      catalogDigest !== expectedCatalogDigest ||
      catalogRef !==
        `action-catalog://product/${expectedCatalogDigest.slice("sha256:".length)}` ||
      program.actionCatalog.rows.length === 0
    ) {
      diagnostics.push({
        code: "identity_mismatch",
        path: "$.program.actionCatalog",
        message: "ActionCatalog requires one canonical non-empty Product publication",
      });
    }
    for (const actionRef of duplicates(
      program.actionCatalog.rows.map((row) => row.actionRef),
    )) {
      diagnostics.push({
        code: "duplicate_identity",
        path: "$.program.actionCatalog.rows",
        message: `duplicate action membership ${actionRef}`,
      });
    }
    for (
      const [index, row] of program.actionCatalog.rows.entries()
    ) {
      const exactKeys: readonly string[] = [
        "actionKind",
        "actionRef",
        "expectedDeltaRef",
        "graphFunctionRef",
        "inputAssetRefs",
        "kind",
        "outputAssetRefs",
        "programRef",
        "progressConditionRef",
        "stopConditionRef",
        "targetObligationRefs",
        "targetProgramLocusRef",
      ];
      const graphFunction = graphFunctions.find(
        (candidate) => candidate.id === row.graphFunctionRef,
      );
      const targetExists = row.actionKind === "invoke_graph_function"
        ? graphFunction !== undefined &&
          row.targetProgramLocusRef === graphFunction.id
        : graphFunction?.template.nodes.some((node) =>
          cLeafTerms(node.term).some(
            (leaf) => leaf.programLocusRef === row.targetProgramLocusRef,
          )
        ) ?? false;
      if (
        row.kind !== "action_catalog_row" ||
        !hasExactKeys(row, exactKeys) ||
        row.actionRef.length === 0 ||
        row.actionKind.length === 0 ||
        row.programRef !== program.programRef ||
        !program.callableMembership.includes(row.graphFunctionRef) ||
        !targetExists ||
        row.targetObligationRefs.length === 0 ||
        row.targetObligationRefs.some((ref) => ref.length === 0) ||
        row.inputAssetRefs.length === 0 ||
        row.inputAssetRefs.some((ref) => ref.length === 0) ||
        row.outputAssetRefs.length === 0 ||
        row.outputAssetRefs.some((ref) => ref.length === 0) ||
        row.expectedDeltaRef.length === 0 ||
        row.progressConditionRef.length === 0 ||
        row.stopConditionRef.length === 0
      ) {
        diagnostics.push({
          code: "missing_membership",
          path: `$.program.actionCatalog.rows[${index}]`,
          message:
            "ActionCatalog row must bind one exact Program action to a published callable locus and semantic obligations",
        });
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
    const expectedEventKinds = closureContract.closureScope === "run"
      ? ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"]
      : closureContract.closureScope === "graph_call"
        ? ["terminal_reached", "frame_closed", "graph_call_closed"]
        : null;
    if (
      expectedEventKinds === null ||
      closureContract.eventKindRefs.join("\0") !== expectedEventKinds.join("\0")
    ) {
      diagnostics.push({
        code: "invalid_reference",
        path: `$.closureContracts[${closureContract.closureContractRef}].eventKindRefs`,
        message: "ClosureContract scope must match its exact ordered closure event family",
      });
    }
  }
  for (const graphFunction of graphFunctions) {
    const childClosureContractRef =
      graphFunction.declarations["abg.child_closure_contract"];
    if (childClosureContractRef === undefined) continue;
    const childClosureContract = closureContracts.find(
      (candidate) =>
        candidate.closureContractRef === childClosureContractRef,
    );
    if (
      childClosureContract === undefined ||
      childClosureContract.closureScope !== "graph_call" ||
      childClosureContract.resultContractRef !== graphFunction.outputs[0]
    ) {
      diagnostics.push({
        code: "missing_contract",
        path: `$.graphFunctions[${graphFunction.id}].declarations[abg.child_closure_contract]`,
        message:
          "child GraphFunction closure must name one published GraphCall-scope contract over its output",
      });
    }
  }
  if (diagnostics.length !== 0) return invalid("program", input.program.subjectDigest, diagnostics);

  const graphFunctionDigests = input.graphFunctions
    .map((value) => value.subjectDigest)
    .sort(compareUnicodeCodeUnits);
  const contractDigests = input.contracts
    .map((value) => value.subjectDigest)
    .sort(compareUnicodeCodeUnits);
  const implementationBindingDigests = input.implementationBindings
    .map((value) => value.subjectDigest)
    .sort(compareUnicodeCodeUnits);
  const closureContractDigests = input.closureContracts
    .map((value) => value.subjectDigest)
    .sort(compareUnicodeCodeUnits);
  executableLeafRows.sort((left, right) =>
    compareUnicodeCodeUnits(left.requirementKey, right.requirementKey));
  interactionLeafRows.sort((left, right) =>
    compareUnicodeCodeUnits(left.requirementKey, right.requirementKey));
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
  const validation = {
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
  } as ProgramValidation;
  Object.defineProperty(validation, PROGRAM_VALIDATION, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  });
  return deepFreeze(validation) as ProgramValidation;
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
