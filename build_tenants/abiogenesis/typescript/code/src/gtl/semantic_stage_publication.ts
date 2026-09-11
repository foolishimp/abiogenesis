import type { ContractDeclaration, ModulePublication, GraphFunction, RootModuleArtifactBasis, ImplementationBinding, ClosureContract } from "./contracts.js";
import type { SemanticStageDeclaration } from "./semantic_stage.js";
import { SEMANTIC_STAGE_IDS } from "./semantic_stage_identity.js";
import { C, cCarrier } from "./c_algebra.js";
import { modulePublication } from "./declarations.js";
import { WORKSITE_PREPARATION_IDS } from "../product/worksite_preparation_contracts.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
import { deepFreeze } from "../shared/immutable.js";

const ids = SEMANTIC_STAGE_IDS;
export function semanticStageImplementationBindings(artifact: RootModuleArtifactBasis): readonly ImplementationBinding[] {
  return ([
    [ids.authorBindingRef, ids.authorImplementationRef, "realizeSemanticAuthor", "F_P", ids.envelopeContractRef, ids.envelopeContractRef],
    [ids.assessorBindingRef, ids.assessorImplementationRef, "realizeSemanticAssessor", "F_P", ids.envelopeContractRef, ids.envelopeContractRef],
    [ids.bridgeBindingRef, ids.bridgeImplementationRef, "realizeSemanticWorksiteBridge", "F_D", ids.envelopeContractRef, WORKSITE_PREPARATION_IDS.inputContractRef],
    [ids.evidenceInputBindingRef, ids.evidenceInputImplementationRef, "realizeSemanticEvidenceInput", "F_D", WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef, ids.envelopeContractRef],
    [ids.terminalBindingRef, ids.terminalImplementationRef, "realizeSemanticEnvelopeOutput", "F_D", ids.envelopeContractRef, ids.outputContractRef],
  ] as const).map(([bindingRef, implementationRef, namedSymbol, computeRegime, inputContractRef, outputContractRef]) => ({
    kind: "implementation_binding", bindingRef, implementationRef, namedSymbol, computeRegime, inputContractRef, outputContractRef,
    packageName: artifact.packageName, packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/semantic_stage.js", failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef,
  }));
}
function semanticLeaf(locus: string, role: "author" | "assessor" | "bridge" | "evidenceInput" | "terminal", inputRef: string, outputRef: string, resultBearing = role !== "author") {
  return C.of({ input: cCarrier(inputRef), output: cCarrier(outputRef), programLocusRef: locus,
    stageRole: `semantic-${role}`, fibre: role === "author" || role === "assessor" ? "F_P" : "F_D", armId: `${locus}/arm`,
    compositionRef: null, vectorIndex: 0, judgmentPredicateRef: ids[`${role}PredicateRef`], resultBearing,
    requirement: { kind: "executable_leaf_requirement", implementationBindingRef: ids[`${role}BindingRef`],
      inputContractRef: inputRef, outputContractRef: outputRef, evidenceContractRef: ids.evidenceContractRef,
      failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef, judgmentContractRef: ids.judgmentContractRef } });
}
function declarations(closureContractRef: string, predicateRef: string, computeRegime: "F_D" | "F_P") {
  return { "abg.compute_regime": computeRegime, "abg.closure_contract": closureContractRef,
    ...(computeRegime === "F_P" ? { "abg.raw_result_contract": ids.workerContractRef } : {}),
    "abg.failure_contract": ids.failureContractRef,
    "abg.evidence_contract": ids.evidenceContractRef, "abg.judgment_contract": ids.judgmentContractRef,
    "abg.judgment_predicate": predicateRef, "abg.transition_contract": ids.transitionContractRef };
}
export function constructSemanticStageGraphFunction(stage: SemanticStageDeclaration, closureContractRef: string): Readonly<GraphFunction> {
  const nodeRef = `${stage.graphFunctionRef}/node`;
  return deepFreeze({ kind: "graph_function", name: stage.graphFunctionRef, version: "5.0.0",
    environment: { requires: [ids.envelopeContractRef], provides: [ids.envelopeContractRef], carries: [ids.workerContractRef] },
    inputs: [ids.envelopeContractRef], outputs: [ids.envelopeContractRef], effects: [], tags: ["semantic-stage"],
    declarations: { ...declarations(closureContractRef, ids.assessorPredicateRef, "F_P"),
      "abg.child_closure_contract": closureContractRef, "abg.semantic_stage": stage.declarationRef },
    template: { kind: "inline_graph", graphRef: `${stage.graphFunctionRef}/graph`, startNodeRef: nodeRef, terminalNodeRefs: [nodeRef],
      edges: [], applications: [], nodes: [{ nodeRef, nodeKind: "c_locus", term: C.compose(
        semanticLeaf(stage.authorLocusRef, "author", ids.envelopeContractRef, ids.envelopeContractRef),
        semanticLeaf(stage.assessorLocusRef, "assessor", ids.envelopeContractRef, ids.envelopeContractRef)) }] } });
}
export function constructSemanticBridgeGraphFunction(input: { readonly graphFunctionRef: string; readonly nodeRef: string;
  readonly closureContractRef: string; readonly operation: "design_worksite" | "evidence_input" | "envelope_output" }): Readonly<GraphFunction> {
  const role = input.operation === "design_worksite" ? "bridge" : input.operation === "evidence_input" ? "evidenceInput" : "terminal";
  const inputRef = role === "evidenceInput" ? WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef : ids.envelopeContractRef;
  const outputRef = role === "bridge" ? WORKSITE_PREPARATION_IDS.inputContractRef : role === "terminal" ? ids.outputContractRef : ids.envelopeContractRef;
  return deepFreeze({ kind: "graph_function", name: input.graphFunctionRef, version: "5.0.0",
    environment: { requires: [inputRef], provides: [outputRef], carries: [] }, inputs: [inputRef], outputs: [outputRef], effects: [], tags: ["semantic-worksite-join"],
    declarations: { ...declarations(input.closureContractRef, ids[`${role}PredicateRef`], "F_D"),
      "abg.child_closure_contract": input.closureContractRef },
    template: { kind: "inline_graph", graphRef: `${input.graphFunctionRef}/graph`, startNodeRef: input.nodeRef,
      terminalNodeRefs: [input.nodeRef], edges: [], applications: [], nodes: [{ nodeRef: input.nodeRef, nodeKind: "c_locus",
        term: semanticLeaf(input.nodeRef, role, inputRef, outputRef) }] } });
}
export function constructSemanticClosureContract(input: { readonly closureContractRef: string; readonly predicateRef: string;
  readonly resultContractRef: string; readonly closureScope: "run" | "graph_call" }): Readonly<ClosureContract> {
  const common = { kind: "closure_contract" as const, closureContractRef: input.closureContractRef, predicateRef: input.predicateRef,
    evidenceContractRef: ids.evidenceContractRef, resultContractRef: input.resultContractRef,
    refusalContractRef: ids.refusalContractRef, refusalValueKind: "semantic_stage_refusal", judgmentContractRef: ids.judgmentContractRef,
    rejectionContractRef: ids.failureContractRef, transitionContractRef: ids.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/semantic-stage@5", terminalKind: "completed" as const };
  return deepFreeze(input.closureScope === "run" ? { ...common, closureScope: "run", eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"] }
    : { ...common, closureScope: "graph_call", eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] }) as Readonly<ClosureContract>;
}
export function constructSemanticStageModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication> {
  const contract = (contractRef: string, contractKind: ContractDeclaration["contractKind"], valueKind: string): ContractDeclaration =>
    ({ contractRef, contractKind, valueKind, contractVersion: "5.0.0" });
  const binding = semanticStageImplementationBindings(artifact);
  const closure = constructSemanticClosureContract({ closureContractRef: ids.closureContractRef, predicateRef: ids.authorPredicateRef,
    resultContractRef: ids.envelopeContractRef, closureScope: "run" });
  const nodeRef = `${ids.graphFunctionRef}/node`;
  const graph: GraphFunction = { kind: "graph_function", name: ids.graphFunctionRef, version: "5.0.0",
    environment: { requires: [ids.envelopeContractRef], provides: [ids.envelopeContractRef], carries: [ids.workerContractRef] },
    inputs: [ids.envelopeContractRef], outputs: [ids.envelopeContractRef], effects: [], tags: ["semantic-stage-native-binding"],
    declarations: declarations(ids.closureContractRef, ids.authorPredicateRef, "F_P"),
    template: { kind: "inline_graph", graphRef: `${ids.graphFunctionRef}/graph`, startNodeRef: nodeRef, terminalNodeRefs: [nodeRef],
      edges: [], applications: [], nodes: [{ nodeRef, nodeKind: "c_locus", term: semanticLeaf(nodeRef, "author", ids.envelopeContractRef, ids.envelopeContractRef, true) }] } };
  return modulePublication({ kind: "module_publication", moduleVersion: "5.0.0", moduleRef: ids.moduleRef,
    owningProductId: artifact.productId, artifactDigest: artifact.artifactDigest, productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest, descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice(7)}`,
    contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice(7)}`,
    productSemanticsBinding: { kind: "product_semantics_binding", bindingRef: ids.semanticsBindingRef,
      packageName: artifact.packageName, packageVersion: artifact.packageVersion, modulePath: "build/code/src/product/builtin_semantics.js",
      namedSymbol: "ABI5_SEMANTIC_STAGE_PRODUCT_SEMANTICS" },
    contracts: [contract(ids.envelopeContractRef, "input", "semantic_stage_envelope"), contract(ids.outputContractRef, "output", "semantic_stage_envelope"), contract(ids.workerContractRef, "output", "semantic_stage_worker_result"),
      ...(["failure", "refusal", "evidence", "judgment", "transition", "closure"] as const).map(kind => contract(ids[`${kind}ContractRef`], kind, `semantic_stage_${kind}`))],
    evaluators: [], rules: [], implementationBindings: binding, closureContracts: [closure], graphFunctions: [graph],
    programs: [{ kind: "gtl_program", programRef: ids.programRef, version: "5.0.0", moduleRef: ids.moduleRef,
      starts: [{ startRef: `${ids.programRef}/start`, graphFunctionRef: ids.graphFunctionRef }], callableMembership: [ids.graphFunctionRef],
      closureContractRef: ids.closureContractRef, policies: { "abg.root_mode": "direct", "abg.compute_regime": "F_P", "abg.default_start_ref": `${ids.programRef}/start` } }],
    contributions: [{ handle: ids.graphFunctionRef, kind: "graph_function", declarationOrContractRef: ids.graphFunctionRef,
      owningProductId: artifact.productId, programMembershipRefs: [ids.programRef], readinessPrerequisiteRefs: [ids.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] }] });
}
