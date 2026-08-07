import {
  canonicalJson,
  compareUnicodeCodeUnits,
  type JsonValue,
} from "../shared/canonical_json.js";
import { deepFreeze } from "../shared/immutable.js";
import type {
  CatalogContribution,
  ClosureContract,
  ContractDeclaration,
  EvaluatorDeclaration,
  GraphFunction,
  GraphFunctionApplication,
  GraphTemplate,
  GtlActionCatalog,
  GtlConstructionComposition,
  GtlProgram,
  ImplementationBinding,
  ModulePublication,
  ProductSemanticsBinding,
  RuleDeclaration,
} from "./contracts.js";
import type {
  CLeafRequirement,
  CProgramNode,
} from "./c_algebra.js";

function compareCanonicalMembers(left: JsonValue, right: JsonValue): number {
  return compareUnicodeCodeUnits(canonicalJson(left), canonicalJson(right));
}

function sortedStrings(values: readonly string[]): readonly string[] {
  return [...values].sort(compareUnicodeCodeUnits);
}

function sortedBy<T>(
  values: readonly T[],
  identity: (value: T) => string,
  serialize: (value: T) => JsonValue,
): readonly T[] {
  return [...values].sort((left, right) => {
    const identityOrder = compareUnicodeCodeUnits(identity(left), identity(right));
    return identityOrder === 0
      ? compareCanonicalMembers(serialize(left), serialize(right))
      : identityOrder;
  });
}

function serializeStringRecord(
  value: Readonly<Record<string, string>>,
): Readonly<Record<string, string>> {
  return Object.freeze(Object.fromEntries(
    Object.entries(value).sort(([left], [right]) =>
      compareUnicodeCodeUnits(left, right)),
  ));
}

function serializeJsonRecord(
  value: Readonly<Record<string, JsonValue>>,
): Readonly<Record<string, JsonValue>> {
  return deepFreeze(JSON.parse(canonicalJson(value)) as Record<string, JsonValue>);
}

function serializeLeafRequirement(
  requirement: Readonly<CLeafRequirement>,
): CLeafRequirement {
  if (requirement.kind === "executable_leaf_requirement") {
    return {
      kind: "executable_leaf_requirement",
      implementationBindingRef: requirement.implementationBindingRef,
      inputContractRef: requirement.inputContractRef,
      outputContractRef: requirement.outputContractRef,
      evidenceContractRef: requirement.evidenceContractRef,
      failureContractRef: requirement.failureContractRef,
      refusalContractRef: requirement.refusalContractRef,
      judgmentContractRef: requirement.judgmentContractRef,
    };
  }
  return {
    kind: "interaction_leaf_requirement",
    interactionKind: requirement.interactionKind,
    actorCapabilityRef: requirement.actorCapabilityRef,
    requestContractRef: requirement.requestContractRef,
    responseContractRef: requirement.responseContractRef,
    continuationContractRef: requirement.continuationContractRef,
  };
}

export function serializeCProgramNode(
  term: Readonly<CProgramNode>,
): Readonly<CProgramNode> {
  const interfaceBasis = {
    inputCarrierRef: term.inputCarrierRef,
    outputCarrierRef: term.outputCarrierRef,
  };
  switch (term.kind) {
    case "c_of":
      return deepFreeze({
        kind: "c_of",
        ...interfaceBasis,
        programLocusRef: term.programLocusRef,
        stageRole: term.stageRole,
        fibre: term.fibre,
        armId: term.armId,
        compositionRef: term.compositionRef,
        vectorIndex: term.vectorIndex,
        judgmentPredicateRef: term.judgmentPredicateRef,
        resultBearing: term.resultBearing,
        requirement: serializeLeafRequirement(term.requirement),
      });
    case "c_identity":
      return Object.freeze({ kind: "c_identity", ...interfaceBasis });
    case "c_compose":
      return deepFreeze({
        kind: "c_compose",
        ...interfaceBasis,
        terms: term.terms.map(serializeCProgramNode),
      });
    case "c_edge":
      return deepFreeze({
        kind: "c_edge",
        ...interfaceBasis,
        transform: serializeCProgramNode(term.transform),
        evaluate: serializeCProgramNode(term.evaluate),
        consequence: serializeCProgramNode(term.consequence),
      }) as Readonly<CProgramNode>;
    case "c_workflow":
      return Object.freeze({
        kind: "c_workflow",
        ...interfaceBasis,
        graphFunctionRef: term.graphFunctionRef,
      });
    case "c_batch":
      return deepFreeze({
        kind: "c_batch",
        ...interfaceBasis,
        taskInputCarrierRef: term.taskInputCarrierRef,
        taskOutputCarrierRef: term.taskOutputCarrierRef,
        batchRef: term.batchRef,
        tasks: term.tasks.map(serializeCProgramNode),
      });
    case "c_retry":
      return deepFreeze({
        kind: "c_retry",
        ...interfaceBasis,
        budget: term.budget,
        term: serializeCProgramNode(term.term),
      });
  }
}

export function serializeCProgramCanonical(term: Readonly<CProgramNode>): string {
  return canonicalJson(serializeCProgramNode(term) as unknown as JsonValue);
}

function serializeApplication(
  application: Readonly<GraphFunctionApplication>,
): GraphFunctionApplication {
  const basis = {
    kind: "graph_function_application" as const,
    applicationRef: application.applicationRef,
    inputContractRef: application.inputContractRef,
    outputContractRef: application.outputContractRef,
  };
  switch (application.relationKind) {
    case "compose":
      return { ...basis, relationKind: "compose", leftGraphFunctionRef: application.leftGraphFunctionRef, rightGraphFunctionRef: application.rightGraphFunctionRef };
    case "substitute":
      return { ...basis, relationKind: "substitute", outerGraphFunctionRef: application.outerGraphFunctionRef, targetVectorRef: application.targetVectorRef, innerGraphFunctionRef: application.innerGraphFunctionRef };
    case "recurse":
      return { ...basis, relationKind: "recurse", graphFunctionRef: application.graphFunctionRef, terminationRuleRef: application.terminationRuleRef, terminationEvaluatorRefs: sortedStrings(application.terminationEvaluatorRefs), terminationFieldRef: application.terminationFieldRef, foldbackRef: application.foldbackRef, foldback: { mode: "rebind", binding: application.foldback.binding, requiresParentEvaluation: true }, bound: application.bound };
    case "fan_out":
      return { ...basis, relationKind: "fan_out", batchRef: application.batchRef, elementGraphFunctionRef: application.elementGraphFunctionRef, inputVectorRef: application.inputVectorRef, outputVectorRef: application.outputVectorRef, inputMemberContractRef: application.inputMemberContractRef, outputMemberContractRef: application.outputMemberContractRef };
    case "fan_in":
      return { ...basis, relationKind: "fan_in", reducerGraphFunctionRef: application.reducerGraphFunctionRef, inputVectorRef: application.inputVectorRef };
    case "gate":
      return { ...basis, relationKind: "gate", targetRef: application.targetRef, ruleRef: application.ruleRef, evaluatorRefs: sortedStrings(application.evaluatorRefs) };
    case "re_enter":
      return { ...basis, relationKind: "re_enter", graphFunctionRef: application.graphFunctionRef, sourceProgramLocusRef: application.sourceProgramLocusRef, targetProgramLocusRef: application.targetProgramLocusRef, maxApplications: application.maxApplications };
    case "promote":
      return { ...basis, relationKind: "promote", sourceRef: application.sourceRef, targetRef: application.targetRef };
    case "identity":
      return { ...basis, relationKind: "identity", targetRef: application.targetRef };
    case "same_object":
      return { ...basis, relationKind: "same_object", leftRef: application.leftRef, rightRef: application.rightRef, witnessRef: application.witnessRef };
  }
}

export function serializeGraphTemplate(
  template: Readonly<GraphTemplate>,
): Readonly<GraphTemplate> {
  const nodes = template.nodes.map((node) => ({
    nodeRef: node.nodeRef,
    nodeKind: "c_locus" as const,
    term: serializeCProgramNode(node.term),
  }));
  const edges = template.edges.map((edge) => ({
    edgeRef: edge.edgeRef,
    fromNodeRef: edge.fromNodeRef,
    toNodeRef: edge.toNodeRef,
  }));
  const applications = template.applications.map(serializeApplication);
  return deepFreeze({
    kind: "inline_graph",
    graphRef: template.graphRef,
    startNodeRef: template.startNodeRef,
    terminalNodeRefs: sortedStrings(template.terminalNodeRefs),
    nodes: sortedBy(nodes, (node) => node.nodeRef, (node) => node as unknown as JsonValue),
    edges: sortedBy(edges, (edge) => edge.edgeRef, (edge) => edge as unknown as JsonValue),
    applications: sortedBy(
      applications,
      (application) => application.applicationRef,
      (application) => application as unknown as JsonValue,
    ),
  });
}

export function serializeGraphFunction(
  graphFunction: Readonly<GraphFunction>,
): Readonly<GraphFunction> {
  return deepFreeze({
    kind: "graph_function",
    id: graphFunction.id,
    name: graphFunction.name,
    version: "5.0.0",
    environment: {
      requires: sortedStrings(graphFunction.environment.requires),
      provides: sortedStrings(graphFunction.environment.provides),
      carries: sortedStrings(graphFunction.environment.carries),
    },
    inputs: [...graphFunction.inputs],
    outputs: [...graphFunction.outputs],
    template: serializeGraphTemplate(graphFunction.template),
    effects: sortedStrings(graphFunction.effects),
    declarations: serializeStringRecord(graphFunction.declarations),
    tags: sortedStrings(graphFunction.tags),
  });
}

function serializeActionCatalog(catalog: Readonly<GtlActionCatalog>): GtlActionCatalog {
  const rows = catalog.rows.map((row) => ({
    kind: "action_catalog_row" as const,
    actionRef: row.actionRef,
    actionKind: row.actionKind,
    programRef: row.programRef,
    graphFunctionRef: row.graphFunctionRef,
    targetProgramLocusRef: row.targetProgramLocusRef,
    targetObligationRefs: sortedStrings(row.targetObligationRefs),
    inputAssetRefs: sortedStrings(row.inputAssetRefs),
    outputAssetRefs: sortedStrings(row.outputAssetRefs),
    expectedDeltaRef: row.expectedDeltaRef,
    progressConditionRef: row.progressConditionRef,
    stopConditionRef: row.stopConditionRef,
  }));
  return deepFreeze({
    kind: "action_catalog",
    schemaVersion: "5.0.0",
    catalogRef: catalog.catalogRef,
    catalogDigest: catalog.catalogDigest,
    rows: sortedBy(rows, (row) => row.actionRef, (row) => row as unknown as JsonValue),
  });
}

function serializeConstructionComposition(
  composition: Readonly<GtlConstructionComposition>,
): GtlConstructionComposition {
  return deepFreeze({
    kind: "construction_composition",
    schemaVersion: "5.0.0",
    compositionRef: composition.compositionRef,
    compositionDigest: composition.compositionDigest,
    graphFunctionRef: composition.graphFunctionRef,
    authorities: composition.authorities.map((authority) => ({
      kind: "construction_authority_binding",
      semanticAuthority: authority.semanticAuthority,
      authorityRef: authority.authorityRef,
      initialProgramLocusRef: authority.initialProgramLocusRef,
      refreshProgramLocusRef: authority.refreshProgramLocusRef,
    })) as unknown as GtlConstructionComposition["authorities"],
    interactionProgramLocusRef: composition.interactionProgramLocusRef,
    closurePolicy: {
      kind: "construction_policy",
      policyRef: composition.closurePolicy.policyRef,
      requireCompleteEvidence: composition.closurePolicy.requireCompleteEvidence,
      requirePostEvidenceRefresh: composition.closurePolicy.requirePostEvidenceRefresh,
    },
  });
}

export function serializeProgram(program: Readonly<GtlProgram>): Readonly<GtlProgram> {
  const starts = program.starts.map((start) => ({
    startRef: start.startRef,
    graphFunctionRef: start.graphFunctionRef,
  }));
  const targets = program.publicAssetTargets?.map((target) => ({
    kind: "program_public_asset_target" as const,
    handle: target.handle,
    assetRef: target.assetRef,
    startRef: target.startRef,
  }));
  return deepFreeze({
    kind: "gtl_program",
    programRef: program.programRef,
    version: "5.0.0",
    moduleRef: program.moduleRef,
    starts: sortedBy(starts, (start) => start.startRef, (start) => start as JsonValue),
    callableMembership: sortedStrings(program.callableMembership),
    closureContractRef: program.closureContractRef,
    policies: serializeStringRecord(program.policies),
    ...(targets === undefined
      ? {}
      : {
        publicAssetTargets: sortedBy(
          targets,
          (target) => target.handle,
          (target) => target as unknown as JsonValue,
        ),
      }),
    ...(program.actionCatalog === undefined
      ? {}
      : { actionCatalog: serializeActionCatalog(program.actionCatalog) }),
    ...(program.constructionComposition === undefined
      ? {}
      : {
        constructionComposition: serializeConstructionComposition(
          program.constructionComposition,
        ),
      }),
  });
}

export function serializeProgramCanonical(program: Readonly<GtlProgram>): string {
  return canonicalJson(serializeProgram(program) as unknown as JsonValue);
}

function serializeContract(contract: Readonly<ContractDeclaration>): ContractDeclaration {
  return { contractRef: contract.contractRef, contractVersion: "5.0.0", contractKind: contract.contractKind, valueKind: contract.valueKind };
}

function serializeEvaluator(evaluator: Readonly<EvaluatorDeclaration>): EvaluatorDeclaration {
  return { name: evaluator.name, regime: evaluator.regime, description: evaluator.description, binding: evaluator.binding, consumedFieldRefs: sortedStrings(evaluator.consumedFieldRefs), tags: sortedStrings(evaluator.tags) };
}

function serializeRule(rule: Readonly<RuleDeclaration>): RuleDeclaration {
  return { name: rule.name, kind: rule.kind, config: serializeJsonRecord(rule.config), tags: sortedStrings(rule.tags) };
}

function serializeImplementationBinding(binding: Readonly<ImplementationBinding>): ImplementationBinding {
  return { kind: "implementation_binding", bindingRef: binding.bindingRef, implementationRef: binding.implementationRef, packageName: binding.packageName, packageVersion: binding.packageVersion, modulePath: binding.modulePath, namedSymbol: binding.namedSymbol, computeRegime: binding.computeRegime, inputContractRef: binding.inputContractRef, outputContractRef: binding.outputContractRef, failureContractRef: binding.failureContractRef, refusalContractRef: binding.refusalContractRef };
}

function serializeClosureContract(contract: Readonly<ClosureContract>): ClosureContract {
  const basis = { kind: "closure_contract" as const, closureContractRef: contract.closureContractRef, predicateRef: contract.predicateRef, evidenceContractRef: contract.evidenceContractRef, resultContractRef: contract.resultContractRef, refusalContractRef: contract.refusalContractRef, refusalValueKind: contract.refusalValueKind, judgmentContractRef: contract.judgmentContractRef, rejectionContractRef: contract.rejectionContractRef, transitionContractRef: contract.transitionContractRef, replayProjectionRef: contract.replayProjectionRef, terminalKind: "completed" as const };
  return contract.closureScope === "run"
    ? { ...basis, closureScope: "run", eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"] }
    : { ...basis, closureScope: "graph_call", eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] };
}

function serializeContribution(contribution: Readonly<CatalogContribution>): CatalogContribution {
  return { handle: contribution.handle, kind: contribution.kind, declarationOrContractRef: contribution.declarationOrContractRef, owningProductId: contribution.owningProductId, programMembershipRefs: sortedStrings(contribution.programMembershipRefs), readinessPrerequisiteRefs: sortedStrings(contribution.readinessPrerequisiteRefs), compatibilityRefs: sortedStrings(contribution.compatibilityRefs), provenanceRefs: sortedStrings(contribution.provenanceRefs) };
}

function serializeProductSemanticsBinding(binding: Readonly<ProductSemanticsBinding>): ProductSemanticsBinding {
  return { kind: "product_semantics_binding", bindingRef: binding.bindingRef, packageName: binding.packageName, packageVersion: binding.packageVersion, modulePath: binding.modulePath, namedSymbol: binding.namedSymbol };
}

export type Module = ModulePublication;

export function serializeModule(moduleValue: Readonly<Module>): Readonly<Module> {
  const contracts = moduleValue.contracts.map(serializeContract);
  const evaluators = moduleValue.evaluators.map(serializeEvaluator);
  const rules = moduleValue.rules.map(serializeRule);
  const bindings = moduleValue.implementationBindings.map(serializeImplementationBinding);
  const closures = moduleValue.closureContracts.map(serializeClosureContract);
  const programs = moduleValue.programs.map(serializeProgram);
  const graphFunctions = moduleValue.graphFunctions.map(serializeGraphFunction);
  const contributions = moduleValue.contributions.map(serializeContribution);
  return deepFreeze({
    kind: "module_publication",
    moduleRef: moduleValue.moduleRef,
    moduleVersion: "5.0.0",
    owningProductId: moduleValue.owningProductId,
    artifactDigest: moduleValue.artifactDigest,
    productContentDigest: moduleValue.productContentDigest,
    productManifestDigest: moduleValue.productManifestDigest,
    descriptorRef: moduleValue.descriptorRef,
    contributionManifestRef: moduleValue.contributionManifestRef,
    productSemanticsBinding: serializeProductSemanticsBinding(moduleValue.productSemanticsBinding),
    contracts: sortedBy(contracts, (value) => value.contractRef, (value) => value as unknown as JsonValue),
    evaluators: sortedBy(evaluators, (value) => value.name, (value) => value as unknown as JsonValue),
    rules: sortedBy(rules, (value) => value.name, (value) => value as unknown as JsonValue),
    implementationBindings: sortedBy(bindings, (value) => value.bindingRef, (value) => value as unknown as JsonValue),
    closureContracts: sortedBy(closures, (value) => value.closureContractRef, (value) => value as unknown as JsonValue),
    programs: sortedBy(programs, (value) => value.programRef, (value) => value as unknown as JsonValue),
    graphFunctions: sortedBy(graphFunctions, (value) => value.id, (value) => value as unknown as JsonValue),
    contributions: sortedBy(contributions, (value) => value.handle, (value) => value as unknown as JsonValue),
  });
}

export function serializeModuleCanonical(moduleValue: Readonly<Module>): string {
  return canonicalJson(serializeModule(moduleValue) as unknown as JsonValue);
}
