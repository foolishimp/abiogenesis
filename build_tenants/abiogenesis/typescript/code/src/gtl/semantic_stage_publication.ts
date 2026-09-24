import { canonicalizeAuthoredGtlCarrier } from "./canonicalization.js";
import { canonicalJson, type JsonValue } from "../shared/canonical_json.js";
import { NATIVE_WORKSPACE_WORK_IDS as native } from "../product/native_workspace_work_identity.js";
import { NATIVE_SEMANTIC_ASSESSMENT_CONTRACT } from "../product/semantic_job.js";
import { RETAINED_GRAPH_INPUT_CONTRACT, graphInputRetentionBinding } from "../product/worksite_preparation_contracts.js";
import { graphEdge } from "./graph_applications.js";
import type { ContractDeclaration, ModulePublication, GraphFunction, GtlNode, RootModuleArtifactBasis, ImplementationBinding, ClosureContract } from "./contracts.js";
import { isSemanticStageDeclaration, type SemanticStageDeclaration } from "./semantic_stage.js";
import { SEMANTIC_STAGE_IDS } from "./semantic_stage_identity.js";
import { C, cCarrier, workflow, cGraphFunctionRef } from "./c_algebra.js";
import { modulePublication } from "./declarations.js";
import { WORKSITE_PREPARATION_IDS } from "../product/worksite_preparation_contracts.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
import { deepFreeze } from "../shared/immutable.js";
import { WORKSITE_FILE_PARENTS_IDS } from "./worksite_c0.js";

const ids = SEMANTIC_STAGE_IDS;
export function semanticStageImplementationBindings(artifact: RootModuleArtifactBasis): readonly ImplementationBinding[] {
  return ([
    [ids.authorBindingRef, ids.authorImplementationRef, "realizeSemanticAuthor", "F_P", ids.envelopeContractRef, ids.envelopeContractRef],
    [ids.assessorBindingRef, ids.assessorImplementationRef, "realizeSemanticAssessor", "F_P", ids.envelopeContractRef, ids.envelopeContractRef],
    [ids.bridgeBindingRef, ids.bridgeImplementationRef, "realizeSemanticWorksiteBridge", "F_D", ids.envelopeContractRef, WORKSITE_PREPARATION_IDS.inputContractRef],
    [ids.evidenceInputBindingRef, ids.evidenceInputImplementationRef, "realizeSemanticEvidenceInput", "F_D", WORKSITE_COMMAND_EXECUTION_IDS.observationContractRef, ids.envelopeContractRef],
    [ids.terminalBindingRef, ids.terminalImplementationRef, "realizeSemanticEnvelopeOutput", "F_D", ids.envelopeContractRef, ids.outputContractRef],
    [ids.jobIntakeBindingRef, ids.jobIntakeImplementationRef, "realizeSemanticJobIntake", "F_D", ids.jobInputContractRef, ids.envelopeContractRef],
    [ids.jobContextBindingRef, ids.jobContextImplementationRef, "realizeSemanticJobContext", "F_D", ids.envelopeContractRef, ids.envelopeContractRef],
    [ids.jobPlanBindingRef, ids.jobPlanImplementationRef, "realizeSemanticJobPlan", "F_D", ids.envelopeContractRef, WORKSITE_FILE_PARENTS_IDS.inputContractRef],
    [ids.jobBridgeBindingRef, ids.jobBridgeImplementationRef, "realizeSemanticJobBridge", "F_D", WORKSITE_FILE_PARENTS_IDS.outputContractRef, WORKSITE_PREPARATION_IDS.inputContractRef],
    [ids.nativeAuthorTaskBindingRef, ids.nativeAuthorTaskImplementationRef, "realizeNativeSemanticAuthorTask", "F_D", ids.envelopeContractRef, native.taskContractRef],
    [ids.nativeAuthorFoldBindingRef, ids.nativeAuthorFoldImplementationRef, "realizeNativeSemanticAuthorFold", "F_D", RETAINED_GRAPH_INPUT_CONTRACT.contractRef, ids.envelopeContractRef],
    [ids.nativeAssessorTaskBindingRef, ids.nativeAssessorTaskImplementationRef, "realizeNativeSemanticAssessorTask", "F_D", ids.envelopeContractRef, native.taskContractRef],
    [ids.nativeAssessorFoldBindingRef, ids.nativeAssessorFoldImplementationRef, "realizeNativeSemanticAssessorFold", "F_D", RETAINED_GRAPH_INPUT_CONTRACT.contractRef, ids.envelopeContractRef],
    [ids.nativeConstructionTaskBindingRef, ids.nativeConstructionTaskImplementationRef, "realizeNativeSemanticConstructionTask", "F_D", ids.envelopeContractRef, native.taskContractRef],
    [ids.nativeExecutionTaskBindingRef, ids.nativeExecutionTaskImplementationRef, "realizeNativeSemanticExecutionTask", "F_D", RETAINED_GRAPH_INPUT_CONTRACT.contractRef, WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef],
    [ids.nativeEvidenceBindingRef, ids.nativeEvidenceImplementationRef, "realizeNativeSemanticEvidence", "F_D", RETAINED_GRAPH_INPUT_CONTRACT.contractRef, ids.envelopeContractRef],
  ] as const).map(([bindingRef, implementationRef, namedSymbol, computeRegime, inputContractRef, outputContractRef]) => ({
    kind: "implementation_binding", bindingRef, implementationRef, namedSymbol, computeRegime, inputContractRef, outputContractRef,
    packageName: artifact.packageName, packageVersion: artifact.packageVersion,
    modulePath: implementationRef === ids.jobIntakeImplementationRef ? "build/code/src/implementation/requirement_handoff.js" : "build/code/src/implementation/semantic_stage.js", failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef,
  }));
}
function semanticLeaf(locus: string, role: "author" | "assessor" | "bridge" | "evidenceInput" | "terminal" | "jobIntake" | "jobContext" | "jobPlan" | "jobBridge" | NativeSemanticRole, inputRef: string, outputRef: string, resultBearing = role !== "author") {
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
  if (!isSemanticStageDeclaration(stage)) throw new TypeError("invalid semantic stage declaration or role content policy");
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
/** Finite native owners; callers declare composition, never sequence effects. */
export function constructSemanticJobGraphFunction(input: { readonly graphFunctionRef: string; readonly nodeRef: string;
  readonly closureContractRef: string; readonly lifecycleRef: string; readonly operation: "intake" | "context" | "worksite_plan" | "worksite_bridge" }): Readonly<GraphFunction> {
  const role = input.operation === "intake" ? "jobIntake" : input.operation === "context" ? "jobContext" : input.operation === "worksite_plan" ? "jobPlan" : "jobBridge";
  const inputRef = role === "jobIntake" ? ids.jobInputContractRef : role === "jobBridge" ? WORKSITE_FILE_PARENTS_IDS.outputContractRef : ids.envelopeContractRef;
  const outputRef = role === "jobPlan" ? WORKSITE_FILE_PARENTS_IDS.inputContractRef : role === "jobBridge" ? WORKSITE_PREPARATION_IDS.inputContractRef : ids.envelopeContractRef;
  return deepFreeze({ kind: "graph_function", name: input.graphFunctionRef, version: "5.0.0",
    environment: { requires: [inputRef], provides: [outputRef], carries: [] }, inputs: [inputRef], outputs: [outputRef], effects: [], tags: ["semantic-job-native-join"],
    declarations: { ...declarations(input.closureContractRef, ids[`${role}PredicateRef`], "F_D"),
      "abg.child_closure_contract": input.closureContractRef, ...(role === "jobIntake" ? { "abg.semantic_job_intake": input.lifecycleRef } : {}) },
    template: { kind: "inline_graph", graphRef: `${input.graphFunctionRef}/graph`, startNodeRef: input.nodeRef,
      terminalNodeRefs: [input.nodeRef], edges: [], applications: [], nodes: [{ nodeRef: input.nodeRef, nodeKind: "c_locus", term: semanticLeaf(input.nodeRef, role, inputRef, outputRef) }] } });
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
    contracts: [NATIVE_SEMANTIC_ASSESSMENT_CONTRACT, contract(ids.jobInputContractRef, "input", "semantic_job_input"), contract(ids.envelopeContractRef, "input", "semantic_stage_envelope"), contract(ids.outputContractRef, "output", "semantic_stage_envelope"), contract(ids.workerContractRef, "output", "semantic_stage_worker_result"),
      ...(["failure", "refusal", "evidence", "judgment", "transition", "closure"] as const).map(kind => contract(ids[`${kind}ContractRef`], kind, `semantic_stage_${kind}`))],
    evaluators: [], rules: [], implementationBindings: binding, closureContracts: [closure], graphFunctions: [graph],
    programs: [{ kind: "gtl_program", programRef: ids.programRef, version: "5.0.0", moduleRef: ids.moduleRef,
      starts: [{ startRef: `${ids.programRef}/start`, graphFunctionRef: ids.graphFunctionRef }], callableMembership: [ids.graphFunctionRef],
      closureContractRef: ids.closureContractRef, policies: { "abg.root_mode": "direct", "abg.compute_regime": "F_P", "abg.default_start_ref": `${ids.programRef}/start` } }],
    contributions: [{ handle: ids.graphFunctionRef, kind: "graph_function", declarationOrContractRef: ids.graphFunctionRef,
      owningProductId: artifact.productId, programMembershipRefs: [ids.programRef], readinessPrerequisiteRefs: [ids.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] }] });
}

type NativeSemanticRole = "nativeAuthorTask" | "nativeAuthorFold" | "nativeAssessorTask" | "nativeAssessorFold" |
  "nativeConstructionTask" | "nativeExecutionTask" | "nativeEvidence";
const nativeNode = (locus: string, role: NativeSemanticRole, input: string, output: string) =>
  ({ nodeRef: locus, nodeKind: "c_locus" as const, term: semanticLeaf(locus, role, input, output, true) });
const nativeCall = (nodeRef: string, graphFunctionRef: string, input: string, output: string) =>
  ({ nodeRef, nodeKind: "c_locus" as const, term: workflow.C(cGraphFunctionRef({ graphFunctionRef, input: cCarrier(input), output: cCarrier(output) })) });
function nativeSemanticGraph(name: string, closureContractRef: string, nodes: readonly GtlNode[],
  retainedAfter: readonly string[], extra: Readonly<Record<string, string>> = {}): Readonly<GraphFunction> {
  return deepFreeze({ kind: "graph_function", name, version: "5.0.0", inputs: [ids.envelopeContractRef], outputs: [ids.envelopeContractRef],
    environment: { requires: [ids.envelopeContractRef], provides: [ids.envelopeContractRef], carries: [...new Set([ids.envelopeContractRef, ...nodes.map(node => node.term.outputCarrierRef)])] },
    effects: [native.effectUri], tags: ["semantic-stage", "native-work"],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": closureContractRef, "abg.child_closure_contract": closureContractRef,
      "abg.evidence_contract": ids.evidenceContractRef, "abg.judgment_contract": ids.judgmentContractRef,
      "abg.judgment_predicate": ids.nativeStepPredicateRef, "abg.transition_contract": ids.transitionContractRef,
      "abg.raw_result_contract": NATIVE_SEMANTIC_ASSESSMENT_CONTRACT.contractRef, ...extra },
    template: { kind: "inline_graph", graphRef: name + "/graph", startNodeRef: nodes[0]!.nodeRef, terminalNodeRefs: [nodes.at(-1)!.nodeRef], nodes,
      edges: nodes.slice(1).map((node, i) => graphEdge({ fromNodeRef: nodes[i]!.nodeRef, toNodeRef: node.nodeRef,
        ...(retainedAfter.includes(nodes[i]!.nodeRef) ? { inputBinding: graphInputRetentionBinding(ids.envelopeContractRef, nodes[i]!.term.outputCarrierRef) } : {}) })), applications: [] } });
}
/** Ordinary graph composition; native actors never return the computed envelope. */
export function constructNativeSemanticStageGraphFunctions(stage: SemanticStageDeclaration, closureContractRef: string,
  assessmentClosureContractRef: string): readonly Readonly<GraphFunction>[] {
  if (!isSemanticStageDeclaration(stage)) throw new TypeError("exact semantic stage declaration required");
  const bound = RETAINED_GRAPH_INPUT_CONTRACT.contractRef, review = stage.graphFunctionRef + "/native-assessment";
  const author = stage.authorLocusRef + "/native", assessor = stage.assessorLocusRef + "/native";
  const declaration = { "abg.semantic_native_stage": stage.declarationRef };
  return [nativeSemanticGraph(stage.graphFunctionRef, closureContractRef, [
    nativeNode(stage.authorLocusRef + "/prepare", "nativeAuthorTask", ids.envelopeContractRef, native.taskContractRef),
    nativeCall(author, native.graphFunctionRef, native.taskContractRef, native.observationContractRef),
    nativeNode(stage.authorLocusRef, "nativeAuthorFold", bound, ids.envelopeContractRef),
    nativeCall(stage.assessorLocusRef + "/review", review, ids.envelopeContractRef, ids.envelopeContractRef),
  ], [author], declaration), nativeSemanticGraph(review, assessmentClosureContractRef, [
    nativeNode(stage.assessorLocusRef + "/prepare", "nativeAssessorTask", ids.envelopeContractRef, native.taskContractRef),
    nativeCall(assessor, native.assessmentGraphFunctionRef, native.taskContractRef, native.observationContractRef),
    nativeNode(stage.assessorLocusRef, "nativeAssessorFold", bound, ids.envelopeContractRef),
  ], [assessor], declaration)];
}
export function constructNativeSemanticConstructionGraphFunction(input: { readonly graphFunctionRef: string; readonly closureContractRef: string }): Readonly<GraphFunction> {
  const n = input.graphFunctionRef, bound = RETAINED_GRAPH_INPUT_CONTRACT.contractRef, c2 = WORKSITE_COMMAND_EXECUTION_IDS;
  return nativeSemanticGraph(n, input.closureContractRef, [
    nativeNode(n + "/prepare", "nativeConstructionTask", ids.envelopeContractRef, native.taskContractRef),
    nativeCall(n + "/construct", native.graphFunctionRef, native.taskContractRef, native.observationContractRef),
    nativeNode(n + "/prepare-execution", "nativeExecutionTask", bound, c2.taskContractRef),
    nativeCall(n + "/execute", c2.graphFunctionRef, c2.taskContractRef, c2.observationContractRef),
    nativeNode(n + "/evidence", "nativeEvidence", bound, ids.envelopeContractRef),
  ], [n + "/construct", n + "/execute"], { "abg.semantic_native_construction": "5.0.0" });
}

/** Exact constructed adapter relation; a marker alone cannot admit retention. */
export function isNativeSemanticGraphFunction(publication: Readonly<ModulePublication>, graph: Readonly<GraphFunction>): boolean {
  try {
    const lifecycle = publication.semanticJobLifecycle;
    if (lifecycle === undefined) return false;
    const stage = lifecycle.stages.find(s => graph.declarations["abg.semantic_native_stage"] === s.declarationRef);
    const candidates = stage === undefined ? graph.declarations["abg.semantic_native_construction"] === "5.0.0"
      ? [constructNativeSemanticConstructionGraphFunction({ graphFunctionRef: graph.name, closureContractRef: graph.declarations["abg.closure_contract"]! })] : []
      : constructNativeSemanticStageGraphFunctions(stage,
        publication.graphFunctions.find(g => g.name === stage.graphFunctionRef)?.declarations["abg.closure_contract"]!,
        publication.graphFunctions.find(g => g.name === stage.graphFunctionRef + "/native-assessment")?.declarations["abg.closure_contract"]!);
    return candidates.some(candidate => canonicalJson(canonicalizeAuthoredGtlCarrier(candidate, "graph_function") as unknown as JsonValue) === canonicalJson(graph as unknown as JsonValue));
  } catch { return false; }
}
