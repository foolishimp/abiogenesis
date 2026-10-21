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

// Exact released bytes are packaged as a generic source subset. The original
// manifest proves provenance; only the two selected members supply role context.
export const DEFAULT_LIBRARY_STDO_SOURCE = {
  "basisRef": "stdo://releases/v3.0.0-rc.1/",
  "manifestDigest": "sha256:069285ad5a79d59ca2dd835e34a54b3e537b0eeef99c29994b18c339dbe62232",
  "manifest": {
    "path": "manifest.json",
    "assetPath": "contracts/default-library/stdo/manifest.json",
    "byteCount": 13478
  },
  "members": {
    "executive": {
      "path": "standards/EXECUTIVE_BASELINE.md",
      "assetPath": "contracts/default-library/stdo/standards/EXECUTIVE_BASELINE.md",
      "byteCount": 156797,
      "digest": "sha256:fcef434630e270d216f494de97ee727ad46690db89a4b73edac4b88ff921c62e"
    },
    "assurance": {
      "path": "standards/ASSURANCE.md",
      "assetPath": "contracts/default-library/stdo/standards/ASSURANCE.md",
      "byteCount": 87324,
      "digest": "sha256:5f6740a39355314ea2a9227a8795ea68cdafb2c4c3e9b25e1d9e626eb43f27ca"
    }
  },
  "spans": {
    "executive": {
      "member": "executive",
      "anchors": [
        "8-derived-executive-frame"
      ],
      "startByte": 83537,
      "endByte": 89094,
      "spanDigest": "sha256:beac5c3e7dd7bb8ed27914271b1953bce37e8d83e9f8e082cc30b4f57e190545"
    },
    "worker": {
      "member": "executive",
      "anchors": [
        "9-derived-worker-frame"
      ],
      "startByte": 89094,
      "endByte": 92075,
      "spanDigest": "sha256:41c60108a27d41f3f5dc0f533207973f1d58bfed75e99b4b9016bd7d23f00453"
    },
    "reviewer": {
      "member": "executive",
      "anchors": [
        "10-derived-reviewer-frame"
      ],
      "startByte": 92075,
      "endByte": 96708,
      "spanDigest": "sha256:fc549bf2e55ffaabad86b4fd3b9290d9043f8716f2ed21b28c0410c643c3911c"
    },
    "specialists": {
      "member": "executive",
      "anchors": [
        "11-derived-generic-specialist-frame-set"
      ],
      "startByte": 96708,
      "endByte": 109201,
      "spanDigest": "sha256:6498d934efff03cc742689e12295555928f4f0d975077744b12120f119f53189"
    },
    "testing": {
      "member": "assurance",
      "anchors": [
        "7-product-testing-frame-set",
        "8-combinatorial-coverage-and-testing-value",
        "9-legitimate-path-and-technical-debt-erasure",
        "10-testing-evidence-composition",
        "11-assurance-subject-acquisition-and-evaluation",
        "12-counterexample-localisation"
      ],
      "startByte": 34042,
      "endByte": 63245,
      "spanDigest": "sha256:4abfd834bf7bac3273899d417c571bac0795966b0ec41084e6e37a86eaf6d981"
    }
  }
} as const;
const frameMembers = [
  { path: DEFAULT_LIBRARY_STDO_SOURCE.manifest.path, type: "file" as const, digest: DEFAULT_LIBRARY_STDO_SOURCE.manifestDigest, target: null },
  ...Object.values(DEFAULT_LIBRARY_STDO_SOURCE.members).map(member => ({ path: member.path, type: "file" as const, digest: member.digest, target: null })),
].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
export const DEFAULT_LIBRARY_CONTEXT_INVENTORY = { path: "contracts/default-library/stdo/context.inventory.json",
  content: canonicalJson({ kind: "run_environment_member_inventory", schemaVersion: "5.0.0", members: frameMembers }) + "\n" };
export function defaultLibraryRunEnvironment(): RunEnvironmentDeclaration {
  const source = DEFAULT_LIBRARY_STDO_SOURCE, contextRef = ref("context", "stdo-frames");
  const members = Object.values(source.members).map(member => ({ memberRef: ref("member", member.path), path: member.path,
    byteCount: member.byteCount, digest: member.digest })).sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  const selections = { selector: ["executive"], constructor: ["worker", "specialists"],
    assessor: ["reviewer", "testing"], command_executor: ["worker", "testing"] } as const;
  return constructRunEnvironmentDeclaration({ kind: "run_environment_declaration", schemaVersion: "5.0.0", declarationRef: ref("environment", "default"),
    dependencies: [{ dependencyRef: ref("dependency", "stdo-frames"), basisRef: source.basisRef, recordRef: ref("record", "selected-stdo-member-inventory"),
      recordDigest: sha256Bytes(Buffer.from(DEFAULT_LIBRARY_CONTEXT_INVENTORY.content)), recordFormat: "member_inventory@1", inventoryDigest: stdoInventoryDigest(frameMembers), members: frameMembers }],
    contexts: [{ contextRef, sourceLocator: source.basisRef, inventoryDigest: sha256Canonical(members), members }], corpusAccess: null, accesses: [],
    roles: ([ [ref("graph-function", "executive-step"), ref("node", "select"), "selector"], [native.graphFunctionRef, native.nodeRef, "constructor"],
      [native.assessmentGraphFunctionRef, native.assessmentNodeRef, "assessor"], [c2.graphFunctionRef, c2.nodeRef, "command_executor"] ] as const).map(([graphFunctionRef, programLocusRef, role]) => ({
      graphFunctionRef, programLocusRef, role,
      frameRefs: selections[role].flatMap(key => { const span = source.spans[key];
        return span.anchors.map(anchor => source.basisRef + source.members[span.member].path + "#" + anchor); }).sort(),
      policy: { policyRef: ref("policy", role), text: DEFAULT_LIBRARY_POLICY, digest: sha256Bytes(Buffer.from(DEFAULT_LIBRARY_POLICY)) },
      accessRefs: [], contextPolicy: { policyRef: ref("policy", role + "/context"), selectors: role === "selector" ? ["full_source", "active_binding_semantics"] : ["current_worksite", "admitted_execution_evidence"] },
      sourceBindings: selections[role].map(key => { const span = source.spans[key], member = source.members[span.member];
        return { contextRef, memberRef: ref("member", member.path), memberDigest: member.digest,
          startByte: span.startByte, endByte: span.endByte, spanDigest: span.spanDigest }; }) })) });
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
