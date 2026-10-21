import { C, cCarrier, cGraphFunctionRef, workflow } from "./c_algebra.js";
import { graphEdge, recurseApplication, registeredSelectionApplication } from "./graph_applications.js";
import { modulePublication } from "./declarations.js";
import type { ClosureContract, ContractDeclaration, GraphFunction, GtlNode, ImplementationBinding, RootModuleArtifactBasis } from "./contracts.js";
import { constructRunEnvironmentDeclaration, stdoInventoryDigest, type RunEnvironmentDeclaration } from "./stdo_run_environment.js";
import { graphInputRetentionBinding, RETAINED_GRAPH_INPUT_CONTRACT } from "../product/worksite_preparation_contracts.js";
import { NATIVE_WORKSPACE_WORK_IDS as native } from "../product/native_workspace_work_identity.js";
import { WORKSITE_COMMAND_EXECUTION_IDS as c2 } from "../product/worksite_command_execution_identity.js";
import { DEFAULT_LIBRARY_POLICY, GOVERNANCE_POLICIES, GOVERNANCE_PURPOSES, GOVERNANCE_OPERATIONS, governanceRef as ref,
  governanceContract as contract, GOVERNANCE_FULFILLMENT_PROFILE, type GovernanceOperation, type GovernancePurpose } from "../product/default_library.js";
import { canonicalJson } from "../shared/canonical_json.js";
import { sha256Bytes, sha256Canonical } from "../shared/digests.js";

const state = contract("state"), task = contract("selection-task"), synthesis = contract("synthesis"), choice = contract("choice");
const signatures: Readonly<Record<GovernanceOperation, readonly [string, string, string]>> = {
  "prepare-selection": [state, task, "prepareGovernanceSelection"], select: [task, synthesis, "selectGovernanceWork"], "project-choice": [synthesis, choice, "projectGovernanceChoice"],
  "evaluate-parent": [state, state, "evaluateGovernanceParent"], "prepare-native": [state, native.taskContractRef, "prepareGovernanceNativeTask"],
  "prepare-testing": [state, c2.taskContractRef, "prepareObservedTestingTask"], fold: [RETAINED_GRAPH_INPUT_CONTRACT.contractRef, state, "foldGovernanceWork"],
};
export function defaultLibraryImplementationBindings(artifact: Pick<RootModuleArtifactBasis, "packageName" | "packageVersion">): readonly ImplementationBinding[] {
  return GOVERNANCE_OPERATIONS.map(name => ({ kind: "implementation_binding", bindingRef: ref("binding", name), implementationRef: ref("implementation", name),
    packageName: artifact.packageName, packageVersion: artifact.packageVersion, modulePath: "build/code/src/implementation/default_library.js", namedSymbol: signatures[name][2], computeRegime: name === "select" ? "F_P" : "F_D",
    inputContractRef: signatures[name][0], outputContractRef: signatures[name][1], failureContractRef: contract("failure"), refusalContractRef: contract("refusal") }));
}
const leaf = (operation: GovernanceOperation, locus: string, compositionRef: string | null = null): GtlNode => ({ nodeRef: locus, nodeKind: "c_locus",
  term: C.of({ input: cCarrier(signatures[operation][0]), output: cCarrier(signatures[operation][1]), programLocusRef: locus,
    stageRole: operation === "select" || operation === "project-choice" ? "evaluate" : operation === "evaluate-parent" ? "termination" : "result", fibre: operation === "select" ? "F_P" : "F_D",
    armId: locus + "/arm", compositionRef, vectorIndex: 0, judgmentPredicateRef: ref("predicate", operation), resultBearing: operation !== "select" && operation !== "project-choice",
    requirement: { kind: "executable_leaf_requirement", implementationBindingRef: ref("binding", operation), inputContractRef: signatures[operation][0],
      outputContractRef: signatures[operation][1], evidenceContractRef: contract("evidence"), failureContractRef: contract("failure"),
      refusalContractRef: contract("refusal"), judgmentContractRef: contract("judgment") } }) });
const call = (locus: string, graphFunctionRef: string, input: string, output: string): GtlNode => ({ nodeRef: locus, nodeKind: "c_locus",
  term: workflow.C(cGraphFunctionRef({ graphFunctionRef, input: cCarrier(input), output: cCarrier(output) })) });
const declarations = { "abg.compute_regime": "mixed", "abg.closure_contract": contract("closure-child"), "abg.child_closure_contract": contract("closure-child"),
  "abg.evidence_contract": contract("evidence"), "abg.judgment_contract": contract("judgment"), "abg.judgment_predicate": ref("predicate", "fold"),
  "abg.transition_contract": contract("transition") };
function wrapper(purpose: GovernancePurpose): GraphFunction {
  const name = ref("graph-function", purpose), testing = purpose === "testing", output = testing ? c2.observationContractRef : native.observationContractRef;
  const nodes = [leaf(testing ? "prepare-testing" : "prepare-native", name + "/prepare"),
    call(name + "/work", testing ? c2.graphFunctionRef : purpose === "uat" ? native.assessmentGraphFunctionRef : native.graphFunctionRef,
      testing ? c2.taskContractRef : native.taskContractRef, output), leaf("fold", name + "/fold")];
  return { kind: "graph_function", name, version: "5.0.0", inputs: [state], outputs: [state],
    environment: { requires: [state], provides: [state], carries: [...new Set([state, ...nodes.map(n => n.term.outputCarrierRef)])] },
    effects: testing ? [] : [native.effectUri], tags: ["default-library", purpose],
    declarations: { ...declarations, "abg.judgment_predicate": testing ? c2.judgmentPredicateRef : native.judgmentPredicateRef, "abg.default_library_purpose": purpose, "abg.functional_purpose": GOVERNANCE_POLICIES[purpose],
      "abg.conditions_for_use": testing ? "Every original selected path is an observed file and the unchanged full declared command/predicate plan is available; no author prerequisite. Missing selected files or plan remain gaps. A partial-probe contribution cannot replace the fixed declaration."
        : purpose === "uat" ? "An explicitly selected current native-work or C2 measurement Result, consumer source/rubric and installed assessment contract are available. Measurement provenance is not authorship. Read-only independent assessment."
        : "A bounded work order is available for this purpose and existing artifacts do not already suffice. Scope and missing inputs remain explicit." },
    template: { kind: "inline_graph", graphRef: name + "/graph", startNodeRef: nodes[0]!.nodeRef, terminalNodeRefs: [nodes[2]!.nodeRef], nodes,
      edges: [graphEdge({ fromNodeRef: nodes[0]!.nodeRef, toNodeRef: nodes[1]!.nodeRef }), graphEdge({ fromNodeRef: nodes[1]!.nodeRef,
        toNodeRef: nodes[2]!.nodeRef, inputBinding: graphInputRetentionBinding(state, output) })], applications: [] } };
}
export function defaultGovernanceGraphFunctions(options: { purposes?: readonly GovernancePurpose[]; recursionBound?: number } = {}): readonly GraphFunction[] {
  const purposes = options.purposes ?? GOVERNANCE_PURPOSES;
  if (!purposes.length || new Set(purposes).size !== purposes.length || purposes.some(p => !GOVERNANCE_PURPOSES.includes(p))) throw new TypeError("explicit unique registered purposes required");
  const wrappers = purposes.map(wrapper), name = ref("graph-function", "executive-step"), select = ref("node", "select"), project = ref("node", "project-choice");
  const nodes = [leaf("prepare-selection", name + "/prepare"), leaf("select", select), leaf("project-choice", project), ...wrappers.map(w => call(w.name + "/invoke", w.name, state, state))];
  const step: GraphFunction = { ...wrappers[0]!, name, tags: ["default-library", "executive"],
    environment: { requires: [state], provides: [state], carries: [state, task, synthesis, choice] },
    declarations: { ...declarations, "abg.raw_result_contract": contract("native-response"), "abg.framed_synthesis_locus": select, "abg.framed_synthesis_projection": project, "abg.functional_purpose": "Map the conserved problem to framed registered contributions, reasons, dependencies and gaps; explicitly choose the next member or gap and revise against actual observations.",
      "abg.conditions_for_use": "Unresolved original outcomes remain; the permitted domain and framed context are explicit." },
    template: { kind: "inline_graph", graphRef: name + "/graph", startNodeRef: nodes[0]!.nodeRef, terminalNodeRefs: nodes.slice(3).map(n => n.nodeRef), nodes,
      edges: [graphEdge({ fromNodeRef: nodes[0]!.nodeRef, toNodeRef: select }), graphEdge({ fromNodeRef: select, toNodeRef: project }), ...nodes.slice(3).map(n => graphEdge({ fromNodeRef: project, toNodeRef: n.nodeRef }))],
      applications: [registeredSelectionApplication({ sourceProgramLocusRef: project, inputContractRef: choice, outputContractRef: state,
        evaluatorRef: ref("evaluator", "project-choice"), ruleRef: ref("rule", "project-choice") })] } };
  const recursion = recurseApplication({ inputContractRef: state, outputContractRef: state, graphFunctionRef: name,
    terminationRuleRef: ref("rule", "parent"), terminationEvaluatorRefs: [ref("evaluator", "parent")], terminationFieldRef: "$.terminal",
    foldback: { mode: "rebind", binding: "$", requiresParentEvaluation: true }, bound: options.recursionBound ?? 12 });
  const parentNode = leaf("evaluate-parent", ref("node", "parent"), recursion.applicationRef);
  const parent: GraphFunction = { ...step, name: ref("graph-function", "executive"),
    declarations: { ...declarations, "abg.closure_contract": contract("closure-run"), "abg.judgment_predicate": ref("predicate", "evaluate-parent"),
      "abg.supported_fulfillment_profile": GOVERNANCE_FULFILLMENT_PROFILE,
      "abg.functional_purpose": "Preserve original outcomes through bounded declared recursion; reevaluate the current independent verdict before parent closure.",
      "abg.conditions_for_use": "A complete original task, criterion/authority basis and bounded permitted library are declared." },
    template: { kind: "inline_graph", graphRef: ref("graph", "executive"), startNodeRef: parentNode.nodeRef, terminalNodeRefs: [parentNode.nodeRef], nodes: [parentNode], edges: [], applications: [recursion] } };
  return [parent, step, ...wrappers];
}

// Exact source bytes are packaged at this asset path. The inventory identifies
// the selected source member; each role projects only its applicable spans.
export const DEFAULT_LIBRARY_STDO_SOURCE = {
  "basisRef": "stdo://releases/v2.5.1-rc.1/",
  "manifestDigest": "sha256:5d306da13994e69aa9f215d4c1cd2d0be96283c1e33a652b58e6e9262d036b64",
  "path": "standards/STDO_REFERENCE_FRAME_BASELINE.md",
  "assetPath": "contracts/default-library/stdo/standards/STDO_REFERENCE_FRAME_BASELINE.md",
  "byteCount": 133684,
  "digest": "sha256:29ac1367a77bf686e621a3e1b88bb39a0ba8e6c44b40e2b29904a7eb5606571d",
  "spans": {
    "Derived Executive Frame": {
      "startByte": 30700,
      "endByte": 35546,
      "spanDigest": "sha256:462f85054e7a000076051c2fc0adb7c9b6c80726057ce4112e6da192e501c485"
    },
    "Derived Worker Frame": {
      "startByte": 35546,
      "endByte": 38401,
      "spanDigest": "sha256:97fbe3a344cd77dd263495db42e334916e76d50fdf8f075452ecebe56fd58b26"
    },
    "Derived Reviewer Frame": {
      "startByte": 38401,
      "endByte": 42638,
      "spanDigest": "sha256:b5e9f2ac18af32a6586f860b9bfe23826d9b633ac844a880170652e35952791b"
    },
    "Derived Generic Specialist Frame Set": {
      "startByte": 42638,
      "endByte": 52663,
      "spanDigest": "sha256:a837522281bdfbaa533e8e9ab048b21c183465e8094a8b43c599be40e1586c2b"
    },
    "Derived Product Testing Frame Set": {
      "startByte": 52663,
      "endByte": 76400,
      "spanDigest": "sha256:89765aa681593fdcd6fece4bf88960bd8a883d7e15a32d7e7d433b3fbb53ba8b"
    }
  }
} as const;
const frameMember = { path: DEFAULT_LIBRARY_STDO_SOURCE.path, type: "file" as const, digest: DEFAULT_LIBRARY_STDO_SOURCE.digest, target: null };
export const DEFAULT_LIBRARY_CONTEXT_INVENTORY = { path: "contracts/default-library/stdo/context.inventory.json",
  content: canonicalJson({ kind: "run_environment_member_inventory", schemaVersion: "5.0.0", members: [frameMember] }) + "\n" };
export function defaultLibraryRunEnvironment(): RunEnvironmentDeclaration {
  const source = DEFAULT_LIBRARY_STDO_SOURCE, contextRef = ref("context", "stdo-frames");
  const member = { memberRef: ref("member", "stdo-frames"), path: source.path, byteCount: source.byteCount, digest: source.digest };
  const headings = { selector: ["Derived Executive Frame"], constructor: ["Derived Worker Frame", "Derived Generic Specialist Frame Set"],
    assessor: ["Derived Reviewer Frame", "Derived Product Testing Frame Set"], command_executor: ["Derived Worker Frame", "Derived Product Testing Frame Set"] } as const;
  return constructRunEnvironmentDeclaration({ kind: "run_environment_declaration", schemaVersion: "5.0.0", declarationRef: ref("environment", "default"),
    dependencies: [{ dependencyRef: ref("dependency", "stdo-frames"), basisRef: source.basisRef, recordRef: ref("record", "selected-stdo-member-inventory"),
      recordDigest: sha256Bytes(Buffer.from(DEFAULT_LIBRARY_CONTEXT_INVENTORY.content)), recordFormat: "member_inventory@1", inventoryDigest: stdoInventoryDigest([frameMember]), members: [frameMember] }],
    contexts: [{ contextRef, sourceLocator: source.basisRef, inventoryDigest: sha256Canonical([member]), members: [member] }], corpusAccess: null, accesses: [],
    roles: ([ [ref("graph-function", "executive-step"), ref("node", "select"), "selector"], [native.graphFunctionRef, native.nodeRef, "constructor"],
      [native.assessmentGraphFunctionRef, native.assessmentNodeRef, "assessor"], [c2.graphFunctionRef, c2.nodeRef, "command_executor"] ] as const).map(([graphFunctionRef, programLocusRef, role]) => ({
      graphFunctionRef, programLocusRef, role,
      frameRefs: headings[role].map(heading => source.basisRef + source.path + "#" + heading.toLowerCase().replaceAll(" ", "-")).sort(),
      policy: { policyRef: ref("policy", role), text: DEFAULT_LIBRARY_POLICY, digest: sha256Bytes(Buffer.from(DEFAULT_LIBRARY_POLICY)) },
      accessRefs: [], contextPolicy: { policyRef: ref("policy", role + "/context"), selectors: role === "selector" ? ["full_source", "active_binding_semantics"] : ["current_worksite", "admitted_execution_evidence"] },
      sourceBindings: headings[role].map(heading => ({ contextRef, memberRef: member.memberRef, memberDigest: member.digest, ...source.spans[heading] })) })) });
}
export function constructDefaultGovernanceLibraryModulePublication(artifact: RootModuleArtifactBasis) {
  const graphs = defaultGovernanceGraphFunctions(), environment = defaultLibraryRunEnvironment();
  const closure = (child: boolean): ClosureContract => ({ kind: "closure_contract", closureContractRef: contract(child ? "closure-child" : "closure-run"),
    predicateRef: ref("predicate", "evaluate-parent"), evidenceContractRef: contract("evidence"), resultContractRef: state, refusalContractRef: contract("refusal"),
    refusalValueKind: "governance_refusal", judgmentContractRef: contract("judgment"), rejectionContractRef: contract("failure"), transitionContractRef: contract("transition"),
    replayProjectionRef: ref("projection", "result"), terminalKind: "completed", ...(child ? { closureScope: "graph_call", eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] } : { closureScope: "run", eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"] }) });
  const c = (name: string, contractKind: ContractDeclaration["contractKind"], valueKind: string): ContractDeclaration => ({ contractRef: contract(name), contractVersion: "5.0.0", contractKind, valueKind });
  return modulePublication({ kind: "module_publication", moduleRef: ref("module", "default"), moduleVersion: "5.0.0", owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest, productContentDigest: artifact.productContentDigest, productManifestDigest: artifact.productManifestDigest,
    descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice(7)}`, contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice(7)}`,
    productSemanticsBinding: { kind: "product_semantics_binding", bindingRef: ref("semantics", "default"), packageName: artifact.packageName, packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/product/builtin_semantics.js", namedSymbol: "ABI5_DEFAULT_LIBRARY_PRODUCT_SEMANTICS" },
    contracts: [c("state", "input", "governance_work_state"), c("selection-task", "input", "framed_synthesis_task"), c("synthesis", "output", "framed_synthesis_result"), c("choice", "output", "registered_graph_choice"),
      c("native-response", "output", "framed_synthesis_response"),
      ...(["failure", "refusal", "evidence", "judgment", "transition"] as const).map(k => c(k, k, `governance_${k}`)),
      c("closure-run", "closure", "governance_closure"), c("closure-child", "closure", "governance_closure")],
    evaluators: [{ name: ref("evaluator", "select"), regime: "F_P", binding: ref("implementation", "select"), description: "Framed problem interpretation, contributions and explicit next choice.", consumedFieldRefs: ["$.state", "$.context"], tags: [] },
      { name: ref("evaluator", "project-choice"), regime: "F_D", binding: ref("implementation", "project-choice"), description: "Transport only the admitted explicit F_P choice.", consumedFieldRefs: ["$.judgment"], tags: [] },
      { name: ref("evaluator", "parent"), regime: "F_D", binding: ref("implementation", "evaluate-parent"), description: "Project exact admitted current independent verdict.", consumedFieldRefs: ["$.terminal"], tags: [] }],
    rules: [{ name: ref("rule", "project-choice"), kind: "explicit_member_projection", config: {}, tags: [] },
      { name: ref("rule", "parent"), kind: "boolean_field_termination", config: { fieldRef: "$.terminal", terminalValue: true }, tags: [] }],
    implementationBindings: defaultLibraryImplementationBindings(artifact), closureContracts: [closure(false), closure(true)], graphFunctions: graphs, runEnvironments: [environment],
    programs: [{ kind: "gtl_program", programRef: ref("program", "default"), version: "5.0.0", moduleRef: ref("module", "default"),
      starts: [{ startRef: ref("start", "default"), graphFunctionRef: graphs[0]!.name }], callableMembership: [...graphs.map(g => g.name), native.graphFunctionRef, native.assessmentGraphFunctionRef, c2.graphFunctionRef],
      closureContractRef: contract("closure-run"), policies: { "abg.root_mode": "direct", "abg.compute_regime": "mixed", "abg.default_start_ref": ref("start", "default"), "abg.run_environment": environment.declarationRef } }],
    contributions: graphs.filter(g => g.name !== ref("graph-function", "executive-step")).map(g => ({ handle: g.name, kind: "graph_function", declarationOrContractRef: g.name,
      owningProductId: artifact.productId, programMembershipRefs: [ref("program", "default")], readinessPrerequisiteRefs: [ref("program", "default")], compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] })) });
}
