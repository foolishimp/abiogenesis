// Independently authored minimal GTL language test. Never part of the ABG package.
export const LANGUAGE_TEST_IDS = Object.freeze({
  moduleRef: "module://abi5-tests/language-smoke@5",
  programRef: "program://abi5-tests/language-smoke@5",
  startRef: "start://abi5-tests/language-smoke@5",
  graphFunctionRef: "graph-function://abi5-tests/language-smoke@5",
  graphRef: "graph://abi5-tests/language-smoke@5",
  nodeRef: "node://abi5-tests/language-smoke/render@5",
  inputContractRef: "contract://abi5-tests/language-smoke/input@5",
  outputContractRef: "contract://abi5-tests/language-smoke/output@5",
  failureContractRef: "contract://abi5-tests/language-smoke/failure@5",
  refusalContractRef: "contract://abi5-tests/language-smoke/refusal@5",
  evidenceContractRef: "contract://abi5-tests/language-smoke/evidence@5",
  judgmentContractRef: "contract://abi5-tests/language-smoke/judgment@5",
  transitionContractRef: "contract://abi5-tests/language-smoke/transition@5",
  closureContractRef: "contract://abi5-tests/language-smoke/closure@5",
  childClosureContractRef: "contract://abi5-tests/language-smoke/child-closure@5",
  implementationBindingRef: "implementation-binding://abi5-tests/language-smoke/render@5",
  implementationRef: "implementation://abi5-tests/language-smoke/render@5",
  armId: "arm://abi5-tests/language-smoke/render@5",
  judgmentPredicateRef: "predicate://abi5-tests/language-smoke/render@5",
});

export const LANGUAGE_TEST_DIRECT_IDS = Object.freeze({
  programRef: "program://abi5-tests/language-smoke/direct@5",
  handle: "gtl://abi5-tests/language-smoke/direct@5",
});
export const LANGUAGE_FIXTURE_OWNER = Object.freeze({
  productId: "product://abi5-tests/language-fixtures@5.0.0",
  packageName: "@abi5-tests/language-fixtures",
  packageVersion: "5.0.0",
});

export function constructLanguageTestInput(subject = "World") {
  if (typeof subject !== "string" || subject.length === 0) throw new TypeError("test subject required");
  return Object.freeze({ kind: "hello_world_input", schemaVersion: "5.0.0", subject });
}

export function evaluateLanguageTestResult(input, output) {
  return input?.kind === "hello_world_input" && output?.kind === "hello_world_output" &&
    output.schemaVersion === "5.0.0" && output.message === `Hello ${input.subject}`;
}

export function constructLanguageTestPublication(gtl, artifact) {
  const ids = LANGUAGE_TEST_IDS;
  const binding = gtl.implementationBinding({
    kind: "implementation_binding", bindingRef: ids.implementationBindingRef,
    implementationRef: ids.implementationRef, packageName: artifact.packageName,
    packageVersion: artifact.packageVersion, modulePath: "build/leaf.mjs", namedSymbol: "render",
    computeRegime: "F_D", inputContractRef: ids.inputContractRef,
    outputContractRef: ids.outputContractRef, failureContractRef: ids.failureContractRef,
    refusalContractRef: ids.refusalContractRef,
  });
  const contracts = [
    [ids.inputContractRef, "input", "hello_world_input"],
    [ids.outputContractRef, "output", "hello_world_output"],
    [ids.failureContractRef, "failure", "language_test_failure"],
    [ids.refusalContractRef, "refusal", "language_test_refusal"],
    [ids.evidenceContractRef, "evidence", "deterministic_evidence_candidate"],
    [ids.judgmentContractRef, "judgment", "language_test_judgment"],
    [ids.transitionContractRef, "transition", "language_test_transition"],
    [ids.closureContractRef, "closure", "language_test_closure"],
    [ids.childClosureContractRef, "closure", "language_test_child_closure"],
  ].map(([contractRef, contractKind, valueKind]) => gtl.contractDeclaration({
    contractRef, contractVersion: "5.0.0", contractKind, valueKind,
  }));
  const closure = (closureContractRef, closureScope) => gtl.closureContract({
    kind: "closure_contract", closureContractRef, closureScope,
    predicateRef: ids.judgmentPredicateRef, evidenceContractRef: ids.evidenceContractRef,
    resultContractRef: ids.outputContractRef, refusalContractRef: ids.refusalContractRef,
    refusalValueKind: "language_test_refusal", judgmentContractRef: ids.judgmentContractRef,
    rejectionContractRef: ids.refusalContractRef, transitionContractRef: ids.transitionContractRef,
    replayProjectionRef: "projection://abi5-tests/language-smoke@5", terminalKind: "completed",
    eventKindRefs: ["terminal_reached", "frame_closed", "graph_call_closed",
      ...(closureScope === "run" ? ["run_closed"] : [])],
  });
  const graphFunction = Object.freeze({
    kind: "graph_function", name: ids.graphFunctionRef, version: "5.0.0",
    environment: { requires: [ids.inputContractRef], provides: [ids.outputContractRef],
      carries: [ids.inputContractRef, ids.outputContractRef] },
    inputs: [ids.inputContractRef], outputs: [ids.outputContractRef],
    template: { kind: "inline_graph", graphRef: ids.graphRef, startNodeRef: ids.nodeRef,
      terminalNodeRefs: [ids.nodeRef], nodes: [{ nodeRef: ids.nodeRef, nodeKind: "c_locus",
        term: gtl.C.of({ input: gtl.cCarrier(ids.inputContractRef), output: gtl.cCarrier(ids.outputContractRef),
          programLocusRef: ids.nodeRef, stageRole: "result", fibre: "F_D", armId: ids.armId,
          compositionRef: null, vectorIndex: 0, judgmentPredicateRef: ids.judgmentPredicateRef,
          resultBearing: true, requirement: { kind: "executable_leaf_requirement",
            implementationBindingRef: ids.implementationBindingRef, inputContractRef: ids.inputContractRef,
            outputContractRef: ids.outputContractRef, evidenceContractRef: ids.evidenceContractRef,
            failureContractRef: ids.failureContractRef, refusalContractRef: ids.refusalContractRef,
            judgmentContractRef: ids.judgmentContractRef } }) }], edges: [], applications: [] },
    effects: [], declarations: { "abg.compute_regime": "F_D", "abg.closure_contract": ids.closureContractRef,
      "abg.child_closure_contract": ids.childClosureContractRef, "abg.evidence_contract": ids.evidenceContractRef,
      "abg.judgment_contract": ids.judgmentContractRef, "abg.judgment_predicate": ids.judgmentPredicateRef,
      "abg.transition_contract": ids.transitionContractRef }, tags: ["language-test"],
  });
  const programs = [
    { programRef: ids.programRef, starts: [{ startRef: ids.startRef, graphFunctionRef: ids.graphFunctionRef }] },
    { programRef: LANGUAGE_TEST_DIRECT_IDS.programRef, starts: [] },
  ].map(({ programRef, starts }) => Object.freeze({ kind: "gtl_program", programRef,
    version: "5.0.0", moduleRef: ids.moduleRef, starts, callableMembership: [ids.graphFunctionRef],
    closureContractRef: ids.closureContractRef, policies: { "abg.root_mode": "direct", "abg.compute_regime": "F_D",
      ...(starts.length === 0 ? {} : { "abg.default_start_ref": ids.startRef }) } }));
  const contributions = [[ids.graphFunctionRef, ids.programRef], [LANGUAGE_TEST_DIRECT_IDS.handle, LANGUAGE_TEST_DIRECT_IDS.programRef]]
    .map(([handle, programRef]) => gtl.catalogContribution({ handle, kind: "graph_function",
      declarationOrContractRef: ids.graphFunctionRef, owningProductId: artifact.productId,
      programMembershipRefs: [programRef], readinessPrerequisiteRefs: [programRef],
      compatibilityRefs: ["compatibility://abiogenesis/major/5"],
      provenanceRefs: [artifact.artifactDigest, artifact.productManifestDigest] }));
  return gtl.modulePublication({ kind: "module_publication", moduleRef: ids.moduleRef,
    moduleVersion: "5.0.0", owningProductId: artifact.productId, artifactDigest: artifact.artifactDigest,
    productContentDigest: artifact.productContentDigest, productManifestDigest: artifact.productManifestDigest,
    descriptorRef: "descriptor://abi5-tests/language-fixtures@5",
    contributionManifestRef: "contribution-manifest://abi5-tests/language-fixtures@5",
    productSemanticsBinding: gtl.productSemanticsBinding({ kind: "product_semantics_binding",
      bindingRef: "product-semantics://abi5-tests/language-fixtures@5", packageName: artifact.packageName,
      packageVersion: artifact.packageVersion, modulePath: "build/leaf.mjs", namedSymbol: "semantics" }),
    contracts, evaluators: [], rules: [], implementationBindings: [binding],
    closureContracts: [closure(ids.closureContractRef, "run"), closure(ids.childClosureContractRef, "graph_call")],
    programs, graphFunctions: [graphFunction], contributions });
}
