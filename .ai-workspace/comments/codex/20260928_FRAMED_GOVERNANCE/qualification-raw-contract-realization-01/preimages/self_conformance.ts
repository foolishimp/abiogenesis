import type { ModulePublication, RootModuleArtifactBasis, ContractDeclaration, GraphFunction, ClosureContract, ImplementationBinding } from "./contracts.js";
import { C, cCarrier, cGraphFunctionRef, workflow } from "./c_algebra.js";
import { modulePublication } from "./declarations.js";
import { graphEdge } from "./graph_applications.js";
import { qualificationHash, QUALIFICATION_ROLE_POLICY } from "../validator/qualification_contracts.js";
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
  const base = modulePublication({ kind: "module_publication", moduleRef: ids.moduleRef, moduleVersion: "5.0.0",
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
  return extendQualificationPublication(base, artifact);
}

export const QUALIFICATION_IDS = Object.freeze({
  assessmentInput: "contract://abiogenesis/qualification/assessment-input@5",
  assessmentRaw: "contract://abiogenesis/qualification/assessment-raw@5",
  judgment: "contract://abiogenesis/qualification/judgment@5",
  rulingRequest: "contract://abiogenesis/qualification/ruling-request@5",
  rulingResponse: "contract://abiogenesis/qualification/ruling-response@5",
  verdictInput: "contract://abiogenesis/qualification/verdict-input@5",
  verdict: "contract://abiogenesis/qualification/verdict@5",
  continuation: "contract://abiogenesis/qualification/ruling-continuation@5",
  assessGraph: "graph-function://abiogenesis/qualification/assess@5",
  rulingGraph: "graph-function://abiogenesis/qualification/ruling@5",
  rulingFinalizeGraph: "graph-function://abiogenesis/qualification/ruling-finalize@5",
  verdictGraph: "graph-function://abiogenesis/qualification/exact-candidate@5",
  assessImplementation: "implementation://abiogenesis/qualification/assess-fp@5",
  rulingImplementation: "implementation://abiogenesis/qualification/ruling-fd@5",
  verdictImplementation: "implementation://abiogenesis/qualification/exact-candidate-fd@5",
  assessPredicate: "predicate://abiogenesis/qualification/assessment@5",
  rulingPredicate: "predicate://abiogenesis/qualification/ruling@5",
  verdictPredicate: "predicate://abiogenesis/qualification/verdict@5",
  actorCapabilityRef: "actor-capability://abiogenesis/qualification/product-owner@5",
  interactionKind: "qualification_owner_ruling",
  malformedInput: "contract://abiogenesis/qualification/malformed-gtl-input@5",
  malformedAssessment: "contract://abiogenesis/qualification/malformed-gtl-assessment@5",
  malformedAssessGraph: "graph-function://abiogenesis/qualification/malformed-gtl-assess@5",
  malformedAssessImplementation: "implementation://abiogenesis/qualification/malformed-gtl-assess-fd@5",
  malformedAssessPredicate: "predicate://abiogenesis/qualification/malformed-gtl-assess@5",
  runtimeInput: "contract://abiogenesis/qualification/native-runtime-input@5",
  runtimeAssessment: "contract://abiogenesis/qualification/native-runtime-assessment@5",
  runtimeAssessGraph: "graph-function://abiogenesis/qualification/native-runtime-assess@5",
  runtimeAssessImplementation: "implementation://abiogenesis/qualification/native-runtime-assess-fd@5",
  runtimeAssessPredicate: "predicate://abiogenesis/qualification/native-runtime-assess@5",
});
function extendQualificationPublication(base: Readonly<ModulePublication>, artifact: RootModuleArtifactBasis): Readonly<ModulePublication> {
  const q = QUALIFICATION_IDS, ids = SELF_CONFORMANCE_IDS;
  const contracts: ContractDeclaration[] = [...base.contracts];
  for (const [contractRef, kind, valueKind] of [
    [q.runtimeInput, "input", "native_runtime_assessment_input"], [q.runtimeAssessment, "output", "native_runtime_assessment"],
    [q.assessmentInput, "input", "qualification_assessment_input"], [q.assessmentRaw, "output", "qualification_raw_judgment"],
    [q.judgment, "output", "qualification_judgment"], [q.rulingRequest, "input", "qualification_ruling_request"],
    [q.rulingResponse, "output", "qualification_owner_ruling"], [q.verdictInput, "input", "qualification_verdict_input"],
    [q.verdict, "output", "exact_candidate_qualification"], [q.continuation, "output", "qualification_ruling_continuation"],
    [q.malformedInput, "input", "malformed_gtl_assessment_input"], [q.malformedAssessment, "output", "malformed_gtl_assessment"],
  ] as const) contracts.push({ contractRef, contractVersion: "5.0.0", contractKind: kind, valueKind });
  const bindings: ImplementationBinding[] = [...base.implementationBindings];
  const closures: ClosureContract[] = [...base.closureContracts];
  const functions: GraphFunction[] = [...base.graphFunctions];
  const programs = [...base.programs];
  const common = (scope: string, output: string, predicate: string, child: boolean): ClosureContract => ({
    ...base.closureContracts[0]!, closureContractRef: "closure://abiogenesis/qualification/" + scope + (child ? "-child" : "-run") + "@5",
    predicateRef: predicate, resultContractRef: output,
    ...(child ? { closureScope: "graph_call" as const, eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed"] as const }
      : { closureScope: "run" as const, eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed", "run_closed"] as const }),
  });
  const selfChild = common("self-conformance", ids.outputContractRef, ids.judgmentPredicateRef, true); closures.push(selfChild);
  functions[0] = { ...functions[0]!, declarations: { ...functions[0]!.declarations, "abg.child_closure_contract": selfChild.closureContractRef } };
  function leaf(name: string, input: string, output: string, implementationRef: string, namedSymbol: string, fibre: "F_D" | "F_P", predicate: string) {
    const scope = name.slice("graph-function://abiogenesis/qualification/".length, -2);
    const binding: ImplementationBinding = { kind: "implementation_binding", bindingRef: implementationRef.replace("implementation://", "implementation-binding://"),
      implementationRef, packageName: artifact.packageName, packageVersion: artifact.packageVersion,
      modulePath: "build/code/src/implementation/qualification.js", namedSymbol, computeRegime: fibre,
      inputContractRef: input, outputContractRef: output, failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef };
    bindings.push(binding);
    const run = common(scope, output, predicate, false), child = common(scope, output, predicate, true); closures.push(run, child);
    const locus = "node://abiogenesis/qualification/" + scope + "@5";
    const gf: GraphFunction = { kind: "graph_function", name, version: "5.0.0",
      environment: { requires: [input], provides: [output], carries: fibre === "F_P" ? [q.assessmentRaw] : [] },
      inputs: [input], outputs: [output], effects: [], tags: ["qualification", scope],
      declarations: { "abg.compute_regime": fibre, "abg.closure_contract": run.closureContractRef,
        "abg.child_closure_contract": child.closureContractRef, "abg.judgment_predicate": predicate,
        "abg.evidence_contract": ids.evidenceContractRef, "abg.judgment_contract": ids.judgmentContractRef,
        "abg.transition_contract": ids.transitionContractRef, "abg.failure_contract": ids.failureContractRef,
        "abg.qualification_role_policy": qualificationHash(QUALIFICATION_ROLE_POLICY) },
      template: { kind: "inline_graph", graphRef: "graph://abiogenesis/qualification/" + scope + "@5", startNodeRef: locus,
        terminalNodeRefs: [locus], edges: [], applications: [], nodes: [{ nodeRef: locus, nodeKind: "c_locus", term: C.of({
          input: cCarrier(input), output: cCarrier(output), programLocusRef: locus, stageRole: scope === "exact-candidate" ? "AF-22" : scope,
          fibre, armId: "arm://abiogenesis/qualification/" + scope + "@5", compositionRef: null, vectorIndex: 0,
          judgmentPredicateRef: predicate, resultBearing: true, requirement: { kind: "executable_leaf_requirement",
            implementationBindingRef: binding.bindingRef, inputContractRef: input, outputContractRef: output,
            failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef,
            evidenceContractRef: ids.evidenceContractRef, judgmentContractRef: ids.judgmentContractRef } }) }] } };
    functions.push(gf);
    const programRef = "program://abiogenesis/qualification/" + scope + "@5";
    programs.push({ kind: "gtl_program", programRef, version: "5.0.0", moduleRef: base.moduleRef,
      starts: [{ startRef: "start://abiogenesis/qualification/" + scope + "@5", graphFunctionRef: name }],
      callableMembership: [name], closureContractRef: run.closureContractRef,
      policies: { "abg.root_mode": "direct", "abg.compute_regime": fibre } });
  }
  leaf(q.assessGraph, q.assessmentInput, q.judgment, q.assessImplementation, "realizeQualificationAssessment", "F_P", q.assessPredicate);
  leaf(q.rulingFinalizeGraph, q.rulingResponse, q.rulingResponse, q.rulingImplementation, "realizeQualificationRuling", "F_D", q.rulingPredicate);
  leaf(q.verdictGraph, q.verdictInput, q.verdict, q.verdictImplementation, "realizeExactCandidateQualification", "F_D", q.verdictPredicate);
  leaf(q.malformedAssessGraph, q.malformedInput, q.malformedAssessment, q.malformedAssessImplementation, "realizeMalformedGtlAssessment", "F_D", q.malformedAssessPredicate);
  leaf(q.runtimeAssessGraph, q.runtimeInput, q.runtimeAssessment, q.runtimeAssessImplementation, "realizeNativeRuntimeAssessment", "F_D", q.runtimeAssessPredicate);
  const run = common("ruling", q.rulingResponse, q.rulingPredicate, false), child = common("ruling", q.rulingResponse, q.rulingPredicate, true);
  closures.push(run, child);
  const locus = "node://abiogenesis/qualification/ruling@5";
  functions.push({ kind: "graph_function", name: q.rulingGraph, version: "5.0.0",
    environment: { requires: [q.rulingRequest], provides: [q.rulingResponse], carries: [q.continuation, q.rulingResponse] },
    inputs: [q.rulingRequest], outputs: [q.rulingResponse], effects: ["effect://abiogenesis/qualification/owner-ruling@5"],
    tags: ["qualification", "human-owner"],
    declarations: { "abg.compute_regime": "mixed", "abg.closure_contract": run.closureContractRef,
      "abg.child_closure_contract": child.closureContractRef, "abg.judgment_predicate": q.rulingPredicate,
      "abg.evidence_contract": ids.evidenceContractRef, "abg.judgment_contract": ids.judgmentContractRef,
      "abg.transition_contract": ids.transitionContractRef },
    template: { kind: "inline_graph", graphRef: "graph://abiogenesis/qualification/ruling@5", startNodeRef: locus,
      terminalNodeRefs: [locus], edges: [], applications: [], nodes: [{ nodeRef: locus, nodeKind: "c_locus",
        term: C.compose(C.of({ input: cCarrier(q.rulingRequest), output: cCarrier(q.rulingResponse), programLocusRef: locus,
          stageRole: "qualification_ruling", fibre: "F_H", armId: "arm://abiogenesis/qualification/ruling@5",
          compositionRef: null, vectorIndex: 0, judgmentPredicateRef: q.rulingPredicate, resultBearing: false,
          requirement: { kind: "interaction_leaf_requirement", interactionKind: q.interactionKind,
            actorCapabilityRef: q.actorCapabilityRef, requestContractRef: q.rulingRequest,
            responseContractRef: q.rulingResponse, continuationContractRef: q.continuation } }),
          workflow.C(cGraphFunctionRef({ graphFunctionRef: q.rulingFinalizeGraph, input: cCarrier(q.rulingResponse), output: cCarrier(q.rulingResponse) }))) }] } });
  programs.push({ kind: "gtl_program", programRef: "program://abiogenesis/qualification/ruling@5", version: "5.0.0", moduleRef: base.moduleRef,
    starts: [{ startRef: "start://abiogenesis/qualification/ruling@5", graphFunctionRef: q.rulingGraph }],
    callableMembership: [q.rulingGraph, q.rulingFinalizeGraph], closureContractRef: run.closureContractRef,
    policies: { "abg.root_mode": "direct", "abg.compute_regime": "mixed" } });
  const contributions = functions.map(g => ({ handle: g.name, kind: "graph_function" as const, declarationOrContractRef: g.name,
    owningProductId: artifact.productId, programMembershipRefs: programs.filter(p => p.callableMembership.includes(g.name)).map(p => p.programRef),
    readinessPrerequisiteRefs: programs.filter(p => p.callableMembership.includes(g.name)).map(p => p.programRef),
    compatibilityRefs: ["compatibility://abiogenesis/major/5"], provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] }));
  return modulePublication({ ...base, contracts, graphFunctions: functions, programs, implementationBindings: bindings, closureContracts: closures, contributions });
}
