import type { ModulePublication, RootModuleArtifactBasis, ContractDeclaration } from "./contracts.js";
import { C, cCarrier } from "./c_algebra.js";
import { modulePublication } from "./declarations.js";
const scope = "abiogenesis/qualification/self-conformance";
export const SELF_CONFORMANCE_IDS = Object.freeze({
  moduleRef: `module://${scope}@5`, programRef: `program://${scope}@5`,
  graphFunctionRef: `graph-function://${scope}@5`, graphRef: `graph://${scope}@5`,
  nodeRef: `node://${scope}@5`, startRef: `start://${scope}@5`, armId: `arm://${scope}@5`,
  implementationRef: `implementation://${scope}-fd@5`, implementationBindingRef: `implementation-binding://${scope}-fd@5`,
  inputContractRef: `contract://${scope}/input@5`, outputContractRef: `contract://${scope}/output@5`,
  failureContractRef: `contract://${scope}/failure@5`, refusalContractRef: `contract://${scope}/refusal@5`,
  evidenceContractRef: `contract://${scope}/evidence@5`, judgmentContractRef: `contract://${scope}/judgment@5`,
  transitionContractRef: `contract://${scope}/transition@5`, closureContractRef: `contract://${scope}/closure@5`,
  judgmentPredicateRef: `predicate://${scope}/transfer@5`,
});
export function constructSelfConformanceModulePublication(
  artifact: RootModuleArtifactBasis,
): Readonly<ModulePublication> {
  const ids = SELF_CONFORMANCE_IDS;
  const contract = (contractRef: string, kind: ContractDeclaration["contractKind"], valueKind: string): ContractDeclaration =>
    ({ contractRef, contractVersion: "5.0.0", contractKind: kind, valueKind });
  const binding = { kind: "implementation_binding" as const, bindingRef: ids.implementationBindingRef,
    implementationRef: ids.implementationRef, packageName: artifact.packageName, packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/self_conformance.js", namedSymbol: "realizeSelfConformance",
    computeRegime: "F_D" as const, inputContractRef: ids.inputContractRef, outputContractRef: ids.outputContractRef,
    failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef };
  const closure = { kind: "closure_contract" as const, closureContractRef: ids.closureContractRef,
    predicateRef: ids.judgmentPredicateRef, evidenceContractRef: ids.evidenceContractRef, resultContractRef: ids.outputContractRef,
    refusalContractRef: ids.refusalContractRef, refusalValueKind: "self_conformance_refusal",
    judgmentContractRef: ids.judgmentContractRef, rejectionContractRef: ids.failureContractRef,
    transitionContractRef: ids.transitionContractRef, replayProjectionRef: `projection://${scope}@5`,
    terminalKind: "completed" as const, closureScope: "run" as const,
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"] as const };
  const contracts = [contract(ids.inputContractRef, "input", "self_conformance_input"),
    contract(ids.outputContractRef, "output", "self_conformance_result"),
    ...(["failure", "refusal", "evidence", "judgment", "transition", "closure"] as const).map(kind =>
      contract(ids[`${kind}ContractRef`], kind, `self_conformance_${kind}`)),
];
  return modulePublication({ kind: "module_publication", moduleRef: ids.moduleRef, moduleVersion: "5.0.0",
    owningProductId: artifact.productId, artifactDigest: artifact.artifactDigest, productContentDigest: artifact.productContentDigest,
    productManifestDigest: artifact.productManifestDigest,
    descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice(7)}`,
    contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice(7)}`,
    productSemanticsBinding: { kind: "product_semantics_binding", bindingRef: `product-semantics://${scope}@5`,
      packageName: artifact.packageName, packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/validator/self_conformance_semantics.js", namedSymbol: "ABI5_SELF_CONFORMANCE_PRODUCT_SEMANTICS" },
    contracts, evaluators: [], rules: [], implementationBindings: [binding], closureContracts: [closure],
    programs: [{ kind: "gtl_program", programRef: ids.programRef, version: "5.0.0", moduleRef: ids.moduleRef,
      starts: [{ startRef: ids.startRef, graphFunctionRef: ids.graphFunctionRef }], callableMembership: [ids.graphFunctionRef],
      closureContractRef: ids.closureContractRef, policies: { "abg.root_mode": "direct", "abg.compute_regime": "F_D", "abg.default_start_ref": ids.startRef } }],
    graphFunctions: [{ kind: "graph_function", name: ids.graphFunctionRef, version: "5.0.0",
      environment: { requires: [ids.inputContractRef], provides: [ids.outputContractRef], carries: [] },
      inputs: [ids.inputContractRef], outputs: [ids.outputContractRef], effects: [], tags: ["self-conformance", "non-closing"],
      declarations: { "abg.compute_regime": "F_D", "abg.closure_contract": ids.closureContractRef,
        "abg.evidence_contract": ids.evidenceContractRef, "abg.judgment_contract": ids.judgmentContractRef,
        "abg.judgment_predicate": ids.judgmentPredicateRef, "abg.transition_contract": ids.transitionContractRef },
      template: { kind: "inline_graph", graphRef: ids.graphRef, startNodeRef: ids.nodeRef, terminalNodeRefs: [ids.nodeRef],
        edges: [], applications: [], nodes: [{ nodeRef: ids.nodeRef, nodeKind: "c_locus", term: C.of({
          input: cCarrier(ids.inputContractRef), output: cCarrier(ids.outputContractRef), programLocusRef: ids.nodeRef,
          stageRole: "self-conformance", fibre: "F_D", armId: ids.armId, compositionRef: null, vectorIndex: 0,
          judgmentPredicateRef: ids.judgmentPredicateRef, resultBearing: true,
          requirement: { kind: "executable_leaf_requirement", implementationBindingRef: binding.bindingRef,
            inputContractRef: ids.inputContractRef, outputContractRef: ids.outputContractRef,
            evidenceContractRef: ids.evidenceContractRef, failureContractRef: ids.failureContractRef,
            refusalContractRef: ids.refusalContractRef, judgmentContractRef: ids.judgmentContractRef } }) }] } }],
    contributions: [{ handle: ids.graphFunctionRef, kind: "graph_function", declarationOrContractRef: ids.graphFunctionRef,
      owningProductId: artifact.productId, programMembershipRefs: [ids.programRef], readinessPrerequisiteRefs: [ids.programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] }],
  });
}

