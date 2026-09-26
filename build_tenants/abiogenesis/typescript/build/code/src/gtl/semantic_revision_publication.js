import { SEMANTIC_REVISION_IDS as ids } from "./semantic_revision_identity.js";
import { SEMANTIC_STAGE_IDS as old } from "./semantic_stage_identity.js";
import { constructSemanticClosureContract } from "./semantic_stage_publication.js";
import { C, cCarrier, cGraphFunctionRef, workflow } from "./c_algebra.js";
import { modulePublication } from "./declarations.js";
import { graphEdge } from "./graph_applications.js";
import { WORKSITE_REVISION_IDS } from "../product/worksite_revision.js";
import { WORKSITE_COMMAND_EXECUTION_IDS } from "../product/worksite_command_execution.js";
import { deepFreeze } from "../shared/immutable.js";
import { NATIVE_WORKSPACE_WORK_IDS as native } from "../product/native_workspace_work_identity.js";
import { RETAINED_GRAPH_INPUT_CONTRACT, graphInputRetentionBinding } from "../product/worksite_preparation_contracts.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { canonicalizeAuthoredGtlCarrier } from "./canonicalization.js";
const inputs = (role) => role === "selection" ? ids.selectionInputContractRef : role === "projection" ? ids.requestContractRef : role === "evidenceInput" ? WORKSITE_REVISION_IDS.observationContractRef :
    role === "nativeIntake" ? ids.nativeIntakeContractRef : role === "nativeRequest" ? ids.selectionContractRef :
        role === "nativeExecution" || role === "nativeEvidence" ? RETAINED_GRAPH_INPUT_CONTRACT.contractRef : ids.envelopeContractRef;
const outputs = (role) => role === "selection" ? ids.selectionContractRef : role === "bridge" ? WORKSITE_REVISION_IDS.inputContractRef : role === "terminal" ? ids.outputContractRef :
    role === "nativeIntake" ? ids.selectionInputContractRef : role === "nativeRequest" ? ids.requestContractRef :
        role === "nativeConstruction" ? native.taskContractRef : role === "nativeExecution" ? WORKSITE_COMMAND_EXECUTION_IDS.taskContractRef : ids.envelopeContractRef;
export function semanticRevisionImplementationBindings(artifact) {
    return ["selection", "projection", "author", "assessor", "bridge", "evidenceInput", "terminal", "nativeIntake", "nativeRequest", "nativeConstruction", "nativeExecution", "nativeEvidence"].map(role => ({
        kind: "implementation_binding", bindingRef: ids[`${role}BindingRef`], implementationRef: ids[`${role}ImplementationRef`],
        namedSymbol: `realizeSemanticRevision${role[0].toUpperCase()}${role.slice(1)}`,
        computeRegime: role === "selection" || role === "author" || role === "assessor" ? "F_P" : "F_D",
        inputContractRef: inputs(role),
        outputContractRef: outputs(role),
        packageName: artifact.packageName, packageVersion: artifact.packageVersion,
        modulePath: "build/code/src/implementation/semantic_revision.js", failureContractRef: old.failureContractRef, refusalContractRef: old.refusalContractRef,
    }));
}
function leaf(locus, role) {
    const inputRef = inputs(role), outputRef = outputs(role);
    return C.of({ input: cCarrier(inputRef), output: cCarrier(outputRef), programLocusRef: locus, stageRole: `semantic-revision-${role}`,
        fibre: role === "selection" || role === "author" || role === "assessor" ? "F_P" : "F_D", armId: `${locus}/arm`, compositionRef: null, vectorIndex: 0,
        judgmentPredicateRef: ids[`${role}PredicateRef`], resultBearing: role !== "author",
        requirement: { kind: "executable_leaf_requirement", implementationBindingRef: ids[`${role}BindingRef`], inputContractRef: inputRef,
            outputContractRef: outputRef, evidenceContractRef: old.evidenceContractRef, failureContractRef: old.failureContractRef,
            refusalContractRef: old.refusalContractRef, judgmentContractRef: old.judgmentContractRef } });
}
export function constructSemanticRevisionGraphFunction(input) {
    if (input.role === "nativeConstruction")
        return nativeConstructionGraph(input);
    const stage = input.stage, nodeRef = `${input.graphFunctionRef}/node`, role = stage === undefined ? input.role : "assessor";
    const inputRef = inputs(role), outputRef = input.rootOutput === true ? ids.outputContractRef : outputs(role);
    const computation = stage === undefined ? leaf(nodeRef, input.role) : input.stageEntryRole === "assessor" ? leaf(stage.assessorLocusRef, "assessor") : C.compose(leaf(stage.authorLocusRef, "author"), leaf(stage.assessorLocusRef, "assessor"));
    return deepFreeze({ kind: "graph_function", name: input.graphFunctionRef, version: "5.0.0", effects: [], tags: ["semantic-revision"],
        environment: { requires: [inputRef], provides: [outputRef], carries: stage === undefined ? [] : [old.workerContractRef] }, inputs: [inputRef], outputs: [outputRef],
        declarations: { "abg.compute_regime": stage === undefined ? "F_D" : "F_P", "abg.closure_contract": input.closureContractRef,
            ...(role === "nativeIntake" ? {} : { "abg.semantic_revision_history": ids.historicalOwnerDependencyRef }),
            ...(input.nativeEntry === undefined ? {} : { "abg.semantic_native_revision_entry": input.nativeEntry }),
            ...(input.nativeEntryRole === undefined ? {} : { "abg.semantic_native_revision_entry_role": input.nativeEntryRole }),
            ...(input.childClosureContractRef === undefined ? {} : { "abg.child_closure_contract": input.childClosureContractRef }), "abg.failure_contract": old.failureContractRef,
            "abg.evidence_contract": old.evidenceContractRef, "abg.judgment_contract": old.judgmentContractRef,
            "abg.judgment_predicate": ids[`${role}PredicateRef`], "abg.transition_contract": old.transitionContractRef,
            ...(stage === undefined ? {} : { "abg.semantic_revision_stage": stage.declarationRef, "abg.raw_result_contract": old.workerContractRef }) },
        template: { kind: "inline_graph", graphRef: `${input.graphFunctionRef}/graph`, startNodeRef: nodeRef, terminalNodeRefs: [nodeRef],
            edges: [], applications: [], nodes: [{ nodeRef, nodeKind: "c_locus", term: input.rootOutput === true ? C.compose(computation, leaf(`${nodeRef}/output`, "terminal")) : computation }] } });
}
export function constructSemanticRevisionModulePublication(artifact) {
    const nodeRef = `${ids.graphFunctionRef}/node`;
    const base = constructSemanticRevisionGraphFunction({ graphFunctionRef: ids.graphFunctionRef, closureContractRef: ids.closureContractRef, role: "projection" });
    const graph = { ...base, outputs: [ids.outputContractRef],
        environment: { requires: [ids.requestContractRef], provides: [ids.outputContractRef], carries: [] },
        template: { kind: "inline_graph", graphRef: `${ids.graphFunctionRef}/graph`, startNodeRef: nodeRef, terminalNodeRefs: [nodeRef],
            edges: [], applications: [], nodes: [{ nodeRef, nodeKind: "c_locus", term: C.compose(leaf(`${nodeRef}/project`, "projection"), leaf(`${nodeRef}/output`, "terminal")) }] } };
    const contract = (contractRef, contractKind, valueKind) => ({ contractRef, contractKind, valueKind, contractVersion: "5.0.0" });
    return modulePublication({ kind: "module_publication", moduleRef: ids.moduleRef, moduleVersion: "5.0.0", owningProductId: artifact.productId,
        artifactDigest: artifact.artifactDigest, productContentDigest: artifact.productContentDigest, productManifestDigest: artifact.productManifestDigest,
        descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice(7)}`,
        contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice(7)}`,
        productSemanticsBinding: { kind: "product_semantics_binding", bindingRef: ids.semanticsBindingRef, packageName: artifact.packageName,
            packageVersion: artifact.packageVersion, modulePath: "build/code/src/product/builtin_semantics.js", namedSymbol: "ABI5_SEMANTIC_REVISION_PRODUCT_SEMANTICS" },
        contracts: [contract(ids.nativeIntakeContractRef, "input", "native_semantic_revision_intake"), contract(ids.selectionInputContractRef, "input", "semantic_revision_selection_input"), contract(ids.requestContractRef, "input", "semantic_revision_request"), contract(ids.envelopeContractRef, "input", "semantic_revision_envelope"),
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
export function constructSemanticRevisionSelectionGraphFunction(input) {
    const base = constructSemanticRevisionGraphFunction({ ...input, role: "projection" }), nodeRef = `${input.graphFunctionRef}/node`;
    return deepFreeze({ ...base, inputs: [ids.selectionInputContractRef], outputs: [input.sealRequest ? ids.requestContractRef : ids.selectionContractRef],
        environment: { requires: [ids.selectionInputContractRef], provides: [input.sealRequest ? ids.requestContractRef : ids.selectionContractRef], carries: [ids.selectionRawContractRef] },
        declarations: { ...base.declarations, "abg.compute_regime": input.sealRequest ? "mixed" : "F_P", "abg.raw_result_contract": ids.selectionRawContractRef,
            "abg.semantic_revision_selection": input.lifecycleRef, "abg.judgment_predicate": input.sealRequest ? ids.stepPredicateRef : ids.selectionPredicateRef },
        template: { kind: "inline_graph", graphRef: `${input.graphFunctionRef}/graph`, startNodeRef: nodeRef, terminalNodeRefs: [input.sealRequest ? nodeRef + "/request" : nodeRef],
            edges: input.sealRequest ? [graphEdge({ fromNodeRef: nodeRef, toNodeRef: nodeRef + "/request" })] : [], applications: [],
            nodes: [{ nodeRef, nodeKind: "c_locus", term: leaf(nodeRef, "selection") }, ...(input.sealRequest ? [{ nodeRef: nodeRef + "/request", nodeKind: "c_locus", term: leaf(nodeRef + "/request", "nativeRequest") }] : [])] } });
}
function nativeConstructionGraph(input) {
    const n = input.graphFunctionRef, bound = RETAINED_GRAPH_INPUT_CONTRACT.contractRef, c2 = WORKSITE_COMMAND_EXECUTION_IDS;
    const node = (suffix, role) => ({ nodeRef: n + suffix, nodeKind: "c_locus", term: leaf(n + suffix, role) });
    const call = (suffix, ref, i, o) => ({ nodeRef: n + suffix, nodeKind: "c_locus", term: workflow.C(cGraphFunctionRef({ graphFunctionRef: ref, input: cCarrier(i), output: cCarrier(o) })) });
    const nodes = [node("/prepare", "nativeConstruction"), call("/construct", native.graphFunctionRef, native.taskContractRef, native.observationContractRef),
        node("/prepare-execution", "nativeExecution"), call("/execute", c2.graphFunctionRef, c2.taskContractRef, c2.observationContractRef), node("/evidence", "nativeEvidence")];
    return deepFreeze({ kind: "graph_function", name: n, version: "5.0.0", inputs: [ids.envelopeContractRef], outputs: [ids.envelopeContractRef],
        environment: { requires: [ids.envelopeContractRef], provides: [ids.envelopeContractRef], carries: [...new Set([ids.envelopeContractRef, bound, ...nodes.map(node => node.term.outputCarrierRef)])] },
        effects: [native.effectUri], tags: ["semantic-revision", "native-work"], declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": input.closureContractRef,
            "abg.child_closure_contract": input.closureContractRef, "abg.evidence_contract": old.evidenceContractRef, "abg.judgment_contract": old.judgmentContractRef,
            "abg.judgment_predicate": ids.stepPredicateRef, "abg.transition_contract": old.transitionContractRef, "abg.semantic_native_revision_construction": "5.0.0" },
        template: { kind: "inline_graph", graphRef: n + "/graph", startNodeRef: nodes[0].nodeRef, terminalNodeRefs: [nodes.at(-1).nodeRef], nodes, applications: [],
            edges: nodes.slice(1).map((node, i) => graphEdge({ fromNodeRef: nodes[i].nodeRef, toNodeRef: node.nodeRef,
                ...([n + "/construct", n + "/execute"].includes(nodes[i].nodeRef) ? { inputBinding: graphInputRetentionBinding(ids.envelopeContractRef, nodes[i].term.outputCarrierRef) } : {}) })) } });
}
/** Retention has this exact factory as owner, never a free-form marker. */
export function isNativeSemanticRevisionGraphFunction(publication, graph) {
    try {
        return publication.semanticJobLifecycle !== undefined && graph.declarations["abg.semantic_native_revision_construction"] === "5.0.0" &&
            canonicalJson(canonicalizeAuthoredGtlCarrier(nativeConstructionGraph({ graphFunctionRef: graph.name, closureContractRef: graph.declarations["abg.closure_contract"] }), "graph_function")) === canonicalJson(graph);
    }
    catch {
        return false;
    }
}
