import { NATIVE_WORKSPACE_WORK_IDS as ids } from "../product/native_workspace_work_identity.js";
import { C, cCarrier } from "./c_algebra.js";
import { modulePublication } from "./declarations.js";
import type { ContractDeclaration, ModulePublication, RootModuleArtifactBasis, ClosureContract } from "./contracts.js";
export { NATIVE_WORKSPACE_WORK_IDS } from "../product/native_workspace_work_identity.js";

/** Ordinary callable publication; domain work and evaluation stay in consumers. */
export function constructNativeWorkspaceWorkModulePublication(artifact: RootModuleArtifactBasis): Readonly<ModulePublication> {
  const contract = (contractRef: string, contractKind: ContractDeclaration["contractKind"], valueKind: string): ContractDeclaration =>
    ({ contractRef, contractVersion: "5.0.0", contractKind, valueKind });
  const binding = { kind: "implementation_binding" as const, bindingRef: ids.implementationBindingRef,
    implementationRef: ids.implementationRef, packageName: artifact.packageName, packageVersion: artifact.packageVersion,
    modulePath: "build/code/src/implementation/native_workspace_work.js", namedSymbol: "realizeNativeWorkspaceWork", computeRegime: "F_P" as const,
    inputContractRef: ids.taskContractRef, outputContractRef: ids.observationContractRef,
    failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef };
  const closure = (child: boolean): ClosureContract => ({ kind: "closure_contract", closureContractRef: child ? ids.childClosureContractRef : ids.closureContractRef,
    predicateRef: ids.judgmentPredicateRef, evidenceContractRef: ids.evidenceContractRef, resultContractRef: ids.observationContractRef,
    refusalContractRef: ids.refusalContractRef, refusalValueKind: "native_workspace_work_refusal", judgmentContractRef: ids.judgmentContractRef,
    rejectionContractRef: ids.failureContractRef, transitionContractRef: ids.transitionContractRef,
    replayProjectionRef: "projection://abiogenesis/worksite/native-work@5", terminalKind: "completed",
    ...(child ? { closureScope: "graph_call" as const, eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] as const }
      : { closureScope: "run" as const, eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"] as const }) });
  const publication = modulePublication({ kind: "module_publication", moduleRef: ids.moduleRef, moduleVersion: "5.0.0", owningProductId: artifact.productId,
    artifactDigest: artifact.artifactDigest, productContentDigest: artifact.productContentDigest, productManifestDigest: artifact.productManifestDigest,
    descriptorRef: `descriptor://abiogenesis/typescript-tenant/${artifact.productContentDigest.slice(7)}`,
    contributionManifestRef: `contribution-manifest://abiogenesis/conformance/${artifact.productContentDigest.slice(7)}`,
    productSemanticsBinding: { kind: "product_semantics_binding", bindingRef: ids.semanticsBindingRef,
      packageName: artifact.packageName, packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/product/builtin_semantics.js", namedSymbol: "ABI5_NATIVE_WORKSPACE_WORK_PRODUCT_SEMANTICS" },
    contracts: [contract(ids.taskContractRef, "input", "native_workspace_work_task"),
      contract(ids.observationContractRef, "output", "native_workspace_work_observation"),
      contract(ids.workerReportContractRef, "output", "native_workspace_work_report"),
      contract(ids.failureContractRef, "failure", "native_workspace_work_failure"), contract(ids.refusalContractRef, "refusal", "native_workspace_work_refusal"),
      contract(ids.evidenceContractRef, "evidence", "probabilistic_transport_evidence_candidate"), contract(ids.judgmentContractRef, "judgment", "native_workspace_work_judgment"),
      contract(ids.transitionContractRef, "transition", "native_workspace_work_transition"), contract(ids.closureContractRef, "closure", "native_workspace_work_closure"),
      contract(ids.childClosureContractRef, "closure", "native_workspace_work_child_closure")],
    evaluators: [], rules: [], implementationBindings: [binding], closureContracts: [closure(false), closure(true)],
    programs: [{ kind: "gtl_program", programRef: ids.programRef, version: "5.0.0", moduleRef: ids.moduleRef,
      starts: [{ startRef: ids.startRef, graphFunctionRef: ids.graphFunctionRef }], callableMembership: [ids.graphFunctionRef], closureContractRef: ids.closureContractRef,
      policies: { "abg.root_mode": "direct", "abg.compute_regime": "F_P", "abg.default_start_ref": ids.startRef } }],
    graphFunctions: [{ kind: "graph_function", name: ids.graphFunctionRef, version: "5.0.0",
      environment: { requires: [ids.taskContractRef], provides: [ids.observationContractRef], carries: [] },
      inputs: [ids.taskContractRef], outputs: [ids.observationContractRef], effects: [ids.effectUri], tags: ["native-work", "workspace"],
      declarations: { "abg.compute_regime": "F_P", "abg.closure_contract": ids.closureContractRef,
        "abg.child_closure_contract": ids.childClosureContractRef, "abg.evidence_contract": ids.evidenceContractRef,
        "abg.judgment_contract": ids.judgmentContractRef, "abg.judgment_predicate": ids.judgmentPredicateRef,
        "abg.raw_result_contract": ids.workerReportContractRef,
        "abg.transition_contract": ids.transitionContractRef },
      template: { kind: "inline_graph", graphRef: ids.graphRef, startNodeRef: ids.nodeRef, terminalNodeRefs: [ids.nodeRef], edges: [], applications: [],
        nodes: [{ nodeRef: ids.nodeRef, nodeKind: "c_locus", term: C.of({ input: cCarrier(ids.taskContractRef), output: cCarrier(ids.observationContractRef),
          programLocusRef: ids.nodeRef, stageRole: "native-work", fibre: "F_P", armId: ids.armId, compositionRef: null, vectorIndex: 0,
          judgmentPredicateRef: ids.judgmentPredicateRef, resultBearing: true, requirement: { kind: "executable_leaf_requirement",
            implementationBindingRef: binding.bindingRef, inputContractRef: ids.taskContractRef, outputContractRef: ids.observationContractRef,
            evidenceContractRef: ids.evidenceContractRef, failureContractRef: ids.failureContractRef,
            refusalContractRef: ids.refusalContractRef, judgmentContractRef: ids.judgmentContractRef } }) }] } }],
    contributions: [{ handle: ids.graphFunctionRef, kind: "graph_function", declarationOrContractRef: ids.graphFunctionRef, owningProductId: artifact.productId,
      programMembershipRefs: [ids.programRef], readinessPrerequisiteRefs: [ids.programRef], compatibilityRefs: ["compatibility://abiogenesis/major/5"],
      provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] }],
  });
  const original = publication.graphFunctions[0]!;
  const assessment = { ...original, name: ids.assessmentGraphFunctionRef,
    declarations: Object.fromEntries(Object.entries(original.declarations).filter(([key]) => key !== "abg.raw_result_contract")),
    tags: [...original.tags, "read-only-assessment"],
    template: { ...original.template, graphRef: ids.assessmentGraphRef, startNodeRef: ids.assessmentNodeRef,
      terminalNodeRefs: [ids.assessmentNodeRef], nodes: [{ nodeRef: ids.assessmentNodeRef, nodeKind: "c_locus" as const,
        term: C.of({ input: cCarrier(ids.taskContractRef), output: cCarrier(ids.observationContractRef),
          programLocusRef: ids.assessmentNodeRef, stageRole: "native-assessment", fibre: "F_P", armId: ids.armId + "/assessment",
          compositionRef: null, vectorIndex: 0, judgmentPredicateRef: ids.judgmentPredicateRef, resultBearing: true,
          requirement: { kind: "executable_leaf_requirement", implementationBindingRef: binding.bindingRef,
            inputContractRef: ids.taskContractRef, outputContractRef: ids.observationContractRef, evidenceContractRef: ids.evidenceContractRef,
            failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef, judgmentContractRef: ids.judgmentContractRef } }) }] } };
  return modulePublication({ ...publication, graphFunctions: [...publication.graphFunctions, assessment],
    programs: [...publication.programs, { ...publication.programs[0]!, programRef: ids.assessmentProgramRef,
      starts: [{ startRef: ids.assessmentStartRef, graphFunctionRef: assessment.name }],
      callableMembership: [assessment.name], policies: { ...publication.programs[0]!.policies, "abg.default_start_ref": ids.assessmentStartRef } }],
    contributions: [...publication.contributions, { ...publication.contributions[0]!, handle: assessment.name, declarationOrContractRef: assessment.name,
      programMembershipRefs: [ids.assessmentProgramRef], readinessPrerequisiteRefs: [ids.assessmentProgramRef] }] });
}
