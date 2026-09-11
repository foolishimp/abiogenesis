import type { ContractDeclaration, ModulePublication, GraphFunction, RootModuleArtifactBasis, ImplementationBinding } from "./contracts.js";
import type { SemanticStageDeclaration } from "./semantic_stage.js";
import { SEMANTIC_REVISION_IDS as ids } from "./semantic_revision_identity.js";
import { SEMANTIC_STAGE_IDS as old } from "./semantic_stage_identity.js";
import { constructSemanticClosureContract } from "./semantic_stage_publication.js";
import { C, cCarrier } from "./c_algebra.js";
import { modulePublication } from "./declarations.js";
import { WORKSITE_REVISION_IDS } from "../product/worksite_revision.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
import { deepFreeze } from "../shared/immutable.js";
export type SemanticRevisionRole = "selection" | "projection" | "author" | "assessor" | "bridge" | "evidenceInput" | "terminal";
export function semanticRevisionImplementationBindings(artifact: RootModuleArtifactBasis): readonly ImplementationBinding[] {
  return ( ["selection", "projection", "author", "assessor", "bridge", "evidenceInput", "terminal"] as const).map(role => ({
    kind: "implementation_binding", bindingRef: ids[`${role}BindingRef`], implementationRef: ids[`${role}ImplementationRef`],
    namedSymbol: `realizeSemanticRevision${role[0]!.toUpperCase()}${role.slice(1)}`,
    computeRegime: role === "selection" || role === "author" || role === "assessor" ? "F_P" : "F_D",
    inputContractRef: role === "selection" ? ids.selectionInputContractRef : role === "projection" ? ids.requestContractRef : role === "evidenceInput" ? WORKSITE_REVISION_IDS.observationContractRef : ids.envelopeContractRef,
    outputContractRef: role === "selection" ? ids.selectionContractRef : role === "bridge" ? WORKSITE_REVISION_IDS.inputContractRef : role === "terminal" ? ids.outputContractRef : ids.envelopeContractRef,
    packageName: artifact.packageName, packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/semantic_revision.js", failureContractRef: old.failureContractRef, refusalContractRef: old.refusalContractRef,
  }));
}
function leaf(locus: string, role: SemanticRevisionRole) {
  const inputRef = role === "selection" ? ids.selectionInputContractRef : role === "projection" ? ids.requestContractRef : role === "evidenceInput" ? WORKSITE_REVISION_IDS.observationContractRef : ids.envelopeContractRef;
  const outputRef = role === "selection" ? ids.selectionContractRef : role === "bridge" ? WORKSITE_REVISION_IDS.inputContractRef : role === "terminal" ? ids.outputContractRef : ids.envelopeContractRef;
  return C.of({ input: cCarrier(inputRef), output: cCarrier(outputRef), programLocusRef: locus, stageRole: `semantic-revision-${role}`,
    fibre: role === "selection" || role === "author" || role === "assessor" ? "F_P" : "F_D", armId: `${locus}/arm`, compositionRef: null, vectorIndex: 0,
    judgmentPredicateRef: ids[`${role}PredicateRef`], resultBearing: role !== "author",
    requirement: { kind: "executable_leaf_requirement", implementationBindingRef: ids[`${role}BindingRef`], inputContractRef: inputRef,
      outputContractRef: outputRef, evidenceContractRef: old.evidenceContractRef, failureContractRef: old.failureContractRef,
      refusalContractRef: old.refusalContractRef, judgmentContractRef: old.judgmentContractRef } });
}
export function constructSemanticRevisionGraphFunction(input: { readonly graphFunctionRef: string; readonly closureContractRef: string;
  readonly childClosureContractRef?: string; readonly role: "projection" | "bridge" | "evidenceInput" | "terminal"; readonly stage?: SemanticStageDeclaration; readonly rootOutput?: boolean }): Readonly<GraphFunction> {
  const stage = input.stage, nodeRef = `${input.graphFunctionRef}/node`, role = stage === undefined ? input.role : "assessor";
  const inputRef = role === "projection" ? ids.requestContractRef : role === "evidenceInput" ? WORKSITE_REVISION_IDS.observationContractRef : ids.envelopeContractRef;
  const outputRef = input.rootOutput === true ? ids.outputContractRef : role === "bridge" ? WORKSITE_REVISION_IDS.inputContractRef : role === "terminal" ? ids.outputContractRef : ids.envelopeContractRef;
  const computation = stage === undefined ? leaf(nodeRef, input.role) : C.compose(leaf(stage.authorLocusRef, "author"), leaf(stage.assessorLocusRef, "assessor"));
  return deepFreeze({ kind: "graph_function", name: input.graphFunctionRef, version: "5.0.0", effects: [], tags: ["semantic-revision"],
    environment: { requires: [inputRef], provides: [outputRef], carries: stage === undefined ? [] : [old.workerContractRef] }, inputs: [inputRef], outputs: [outputRef],
    declarations: { "abg.compute_regime": stage === undefined ? "F_D" : "F_P", "abg.closure_contract": input.closureContractRef,
      "abg.semantic_revision_history": ids.historicalOwnerDependencyRef,
      ...(input.childClosureContractRef === undefined ? {} : { "abg.child_closure_contract": input.childClosureContractRef }), "abg.failure_contract": old.failureContractRef,
      "abg.evidence_contract": old.evidenceContractRef, "abg.judgment_contract": old.judgmentContractRef,
      "abg.judgment_predicate": ids[`${role}PredicateRef`], "abg.transition_contract": old.transitionContractRef,
      ...(stage === undefined ? {} : { "abg.semantic_revision_stage": stage.declarationRef, "abg.raw_result_contract": old.workerContractRef }) },
    template: { kind: "inline_graph", graphRef: `${input.graphFunctionRef}/graph`, startNodeRef: nodeRef, terminalNodeRefs: [nodeRef],
      edges: [], applications: [], nodes: [{ nodeRef, nodeKind: "c_locus", term: input.rootOutput === true ? C.compose(computation, leaf(`${nodeRef}/output`, "terminal")) : computation }] } });
}
export function constructSemanticRevisionModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication> {
  const nodeRef = `${ids.graphFunctionRef}/node`;
  const base = constructSemanticRevisionGraphFunction({ graphFunctionRef: ids.graphFunctionRef, closureContractRef: ids.closureContractRef, role: "projection" });
  const graph: GraphFunction = { ...base, outputs: [ids.outputContractRef],
    environment: { requires: [ids.requestContractRef], provides: [ids.outputContractRef], carries: [] },
    template: { kind: "inline_graph", graphRef: `${ids.graphFunctionRef}/graph`, startNodeRef: nodeRef, terminalNodeRefs: [nodeRef],
      edges: [], applications: [], nodes: [{ nodeRef, nodeKind: "c_locus", term: C.compose(leaf(`${nodeRef}/project`, "projection"), leaf(`${nodeRef}/output`, "terminal")) }] } };
  const contract = (contractRef: string, contractKind: ContractDeclaration["contractKind"], valueKind: string): ContractDeclaration => ({ contractRef, contractKind, valueKind, contractVersion: "5.0.0" });
  return modulePublication({ kind: "module_publication", moduleRef: ids.moduleRef, moduleVersion: "5.0.0", owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest, productContentDigest: artifact.productContentDigest, productManifestDigest: artifact.productManifestDigest,
    descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice(7)}`,
    contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice(7)}`,
    productSemanticsBinding: { kind: "product_semantics_binding", bindingRef: ids.semanticsBindingRef, packageName: artifact.packageName,
      packageVersion: artifact.packageVersion, modulePath: "build/code/src/product/builtin_semantics.js", namedSymbol: "ABI5_SEMANTIC_REVISION_PRODUCT_SEMANTICS" },
    contracts: [contract(ids.selectionInputContractRef, "input", "semantic_revision_selection_input"), contract(ids.requestContractRef, "input", "semantic_revision_request"), contract(ids.envelopeContractRef, "input", "semantic_revision_envelope"),
      contract(ids.outputContractRef, "output", "semantic_revision_envelope"), contract(ids.selectionContractRef, "output", "semantic_revision_selection"),
      contract(ids.selectionRawContractRef, "output", "semantic_revision_selection")],
    graphFunctions: [graph], implementationBindings: semanticRevisionImplementationBindings(artifact), evaluators: [], rules: [],
    closureContracts: [constructSemanticClosureContract({ closureContractRef: ids.closureContractRef, predicateRef: ids.projectionPredicateRef,
      resultContractRef: ids.outputContractRef, closureScope: "run" })],
    programs: [{ kind: "gtl_program", programRef: ids.programRef, version: "5.0.0", moduleRef: ids.moduleRef,
      starts: [{ startRef: `${ids.programRef}/start`, graphFunctionRef: ids.graphFunctionRef }], callableMembership: [ids.graphFunctionRef],
      closureContractRef: ids.closureContractRef, policies: { "abg.root_mode": "direct", "abg.compute_regime": "F_D", "abg.default_start_ref": `${ids.programRef}/start` } }],
    contributions: [{ handle: ids.graphFunctionRef, kind: "graph_function", declarationOrContractRef: ids.graphFunctionRef,
      owningProductId: artifact.productId, programMembershipRefs: [ids.programRef], readinessPrerequisiteRefs: [ids.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] }] });
}

export function constructSemanticRevisionSelectionGraphFunction(input: { readonly graphFunctionRef: string; readonly closureContractRef: string; readonly childClosureContractRef?: string; readonly lifecycleRef: string }): Readonly<GraphFunction> {
  const base = constructSemanticRevisionGraphFunction({ ...input, role: "projection" }), nodeRef = `${input.graphFunctionRef}/node`;
  return deepFreeze({ ...base, inputs: [ids.selectionInputContractRef], outputs: [ids.selectionContractRef],
    environment: { requires: [ids.selectionInputContractRef], provides: [ids.selectionContractRef], carries: [ids.selectionRawContractRef] },
    declarations: { ...base.declarations, "abg.compute_regime": "F_P", "abg.raw_result_contract": ids.selectionRawContractRef,
      "abg.semantic_revision_selection": input.lifecycleRef, "abg.judgment_predicate": ids.selectionPredicateRef },
    template: { kind: "inline_graph", graphRef: `${input.graphFunctionRef}/graph`, startNodeRef: nodeRef, terminalNodeRefs: [nodeRef], edges: [], applications: [],
      nodes: [{ nodeRef, nodeKind: "c_locus", term: leaf(nodeRef, "selection") }] } });
}
