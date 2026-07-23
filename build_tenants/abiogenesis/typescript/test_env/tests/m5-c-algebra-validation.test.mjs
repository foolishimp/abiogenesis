import assert from "node:assert/strict";
import test from "node:test";

import * as gtl from "../../build/code/src/gtl/index.js";
import * as product from "../../build/code/src/product/index.js";
import * as validator from "../../build/code/src/validator/index.js";

const DIGEST = `sha256:${"1".repeat(64)}`;

function artifactBasis() {
  return {
    productId: "product://abiogenesis/m5-c-algebra-test@5",
    artifactDigest: DIGEST,
    productContentDigest: DIGEST,
    productManifestDigest: DIGEST,
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0-dev.286",
  };
}

function executableRequirement(ref, inputContractRef, outputContractRef) {
  return {
    kind: "executable_leaf_requirement",
    implementationBindingRef: ref,
    inputContractRef,
    outputContractRef,
    evidenceContractRef: "contract://m5/evidence",
    failureContractRef: "contract://m5/failure",
    refusalContractRef: "contract://m5/refusal",
    judgmentContractRef: "contract://m5/judgment",
  };
}

function leaf({
  input,
  output,
  role,
  locus,
  bindingRef,
  resultBearing,
}) {
  return gtl.C.of({
    input,
    output,
    programLocusRef: locus,
    stageRole: role,
    fibre: "F_D",
    armId: `arm://${role}`,
    compositionRef: null,
    vectorIndex: 0,
    judgmentPredicateRef: `predicate://${role}`,
    resultBearing,
    requirement: executableRequirement(bindingRef, input.ref, output.ref),
  });
}

function raw(value, kind) {
  const result = validator.rawAdmitValue(value, kind, `contract://raw/${kind}`);
  assert.equal(result.kind, "raw_admitted_value", JSON.stringify(result));
  return result;
}

function programValidationResult(publication, program = publication.programs[0]) {
  return validator.validateProgram({
    publication: raw(publication, "module_publication"),
    program: raw(program, "gtl_program"),
    graphFunctions: publication.graphFunctions
      .filter((value) => program.callableMembership.includes(value.name))
      .map((value) => raw(value, "graph_function")),
    contracts: publication.contracts.map((value) => raw(value, "contract_declaration")),
    implementationBindings: publication.implementationBindings.map((value) =>
      raw(value, "implementation_binding")),
    closureContracts: publication.closureContracts.map((value) => raw(value, "closure_contract")),
  });
}

function validatePublishedProgram(publication) {
  const result = programValidationResult(publication);
  assert.equal(result.kind, "program_validation", JSON.stringify(result));
  return result;
}

function catalogViewFor(publication) {
  const program = publication.programs[0];
  const contribution = publication.contributions.find((row) => row.kind === "graph_function");
  assert.notEqual(contribution, undefined);
  const rowBody = {
    handle: contribution.handle,
    kind: contribution.kind,
    declarationOrContractRef: contribution.declarationOrContractRef,
    owningProductId: contribution.owningProductId,
    moduleRef: publication.moduleRef,
    programMembershipRefs: contribution.programMembershipRefs,
    readiness: "ready",
    eligibility: "eligible",
    callability: "callable",
    sessionVisibility: "workspace",
    compatibilityDisposition: "compatible",
    compatibilityRefs: contribution.compatibilityRefs,
    provenanceRefs: contribution.provenanceRefs,
  };
  const selectedRow = {
    ...rowBody,
    rowDigest: product.sha256Canonical(rowBody),
    disposition: "admitted",
    admissionEventRef: "event://m5/catalog-admitted/1",
  };
  assert.equal(selectedRow.programMembershipRefs.includes(program.programRef), true);
  const viewBody = {
    catalogId: "catalog://m5/root",
    catalogDigest: DIGEST,
    allowlist: [selectedRow.handle],
    selectedRows: [selectedRow],
  };
  const viewDigest = product.sha256Canonical(viewBody);
  return {
    kind: "catalog_view",
    schemaVersion: "5.0.0",
    disposition: "admitted",
    viewId: `catalog-view://m5/${viewDigest.slice("sha256:".length)}`,
    viewDigest,
    admissionCandidateRef: "catalog-view-candidate://m5/root",
    admissionEventRef: "event://m5/catalog-view-admitted/1",
    ...viewBody,
  };
}

function descriptorFor(binding) {
  const body = {
    implementationRef: binding.implementationRef,
    packageName: binding.packageName,
    packageVersion: binding.packageVersion,
    modulePath: binding.modulePath,
    namedSymbol: binding.namedSymbol,
    computeRegime: binding.computeRegime,
    inputContractRef: binding.inputContractRef,
    outputContractRef: binding.outputContractRef,
    failureContractRef: binding.failureContractRef,
    refusalContractRef: binding.refusalContractRef,
  };
  return {
    kind: "packaged_leaf_implementation_descriptor",
    schemaVersion: "5.0.0",
    descriptorDigest: product.sha256Canonical(body),
    ...body,
  };
}

function interactionOnlyPublication() {
  const publication = structuredClone(
    gtl.constructHelloWorldModulePublication(artifactBasis()),
  );
  const graphFunction = publication.graphFunctions[0];
  graphFunction.template.nodes[0].term.fibre = "F_H";
  graphFunction.template.nodes[0].term.requirement = {
    kind: "interaction_leaf_requirement",
    interactionKind: "human_assurance",
    actorCapabilityRef: "capability://m5/human-assurance",
    requestContractRef: gtl.HELLO_WORLD_IDS.inputContractRef,
    responseContractRef: gtl.HELLO_WORLD_IDS.outputContractRef,
    continuationContractRef: gtl.HELLO_WORLD_IDS.transitionContractRef,
  };
  graphFunction.declarations["abg.compute_regime"] = "F_H";
  publication.implementationBindings = [];
  return publication;
}

test("M5 GTL exposes exactly seven direct C constructors", () => {
  const request = gtl.cCarrier("contract://m5/request");
  const candidate = gtl.cCarrier("contract://m5/candidate");
  const assessment = gtl.cCarrier("contract://m5/assessment");
  const result = gtl.cCarrier("contract://m5/result");
  const transform = leaf({
    input: request,
    output: candidate,
    role: "transform",
    locus: "locus://m5/transform",
    bindingRef: "binding://m5/transform",
    resultBearing: false,
  });
  const evaluate = leaf({
    input: candidate,
    output: assessment,
    role: "evaluate",
    locus: "locus://m5/evaluate",
    bindingRef: "binding://m5/evaluate",
    resultBearing: false,
  });
  const consequence = leaf({
    input: assessment,
    output: result,
    role: "consequence",
    locus: "locus://m5/consequence",
    bindingRef: "binding://m5/consequence",
    resultBearing: true,
  });
  const workflowRef = gtl.cGraphFunctionRef({
    graphFunctionRef: "graph-function://m5/child",
    input: request,
    output: result,
  });

  assert.deepEqual(
    [
      transform.kind,
      gtl.C.id(request).kind,
      gtl.C.compose(transform, evaluate).kind,
      gtl.C.edge({ transform, evaluate, consequence }).kind,
      gtl.workflow.C(workflowRef).kind,
      gtl.C.batch([consequence, consequence], "batch://m5/result").kind,
      gtl.C.retry(consequence, 2).kind,
    ],
    [
      "c_of",
      "c_identity",
      "c_compose",
      "c_edge",
      "c_workflow",
      "c_batch",
      "c_retry",
    ],
  );
});

test("M5 C.compose is canonical, flat, and identity-eliding", () => {
  const request = gtl.cCarrier("contract://m5/request");
  const candidate = gtl.cCarrier("contract://m5/candidate");
  const result = gtl.cCarrier("contract://m5/result");
  const transform = leaf({
    input: request,
    output: candidate,
    role: "transform",
    locus: "locus://m5/flat-transform",
    bindingRef: "binding://m5/flat-transform",
    resultBearing: false,
  });
  const consequence = leaf({
    input: candidate,
    output: result,
    role: "consequence",
    locus: "locus://m5/flat-consequence",
    bindingRef: "binding://m5/flat-consequence",
    resultBearing: true,
  });
  const nested = gtl.C.compose(
    gtl.C.compose(gtl.C.id(request), transform),
    gtl.C.compose(gtl.C.id(candidate), consequence),
  );

  assert.equal(nested.kind, "c_compose");
  assert.deepEqual(nested.terms.map((term) => term.kind), ["c_of", "c_of"]);
  assert.equal(nested.terms.some((term) => term.kind === "c_compose"), false);
  assert.equal(Object.isFrozen(nested), true);
  assert.equal(Object.isFrozen(nested.terms), true);
});

test("M5 native constructors refuse invalid batch, retry, and F_H realization", () => {
  const request = gtl.cCarrier("contract://m5/request");
  const result = gtl.cCarrier("contract://m5/result");
  const term = leaf({
    input: request,
    output: result,
    role: "result",
    locus: "locus://m5/result",
    bindingRef: "binding://m5/result",
    resultBearing: true,
  });

  assert.throws(() => gtl.C.batch([], "batch://m5/empty"), /non-empty/u);
  assert.throws(() => gtl.C.retry(term, 0), /positive/u);
  assert.throws(() => gtl.C.of({
    input: request,
    output: result,
    programLocusRef: "locus://m5/fh",
    stageRole: "assurance",
    fibre: "F_H",
    armId: "arm://m5/fh",
    compositionRef: null,
    vectorIndex: 0,
    judgmentPredicateRef: "predicate://m5/fh",
    resultBearing: true,
    requirement: executableRequirement("binding://m5/illegal-fh", request.ref, result.ref),
  }), /requirement kind/u);
});

test("M5 native GTL constructs all ten graph relations with derived identities", () => {
  const inputContractRef = "contract://m5/application/input";
  const outputContractRef = "contract://m5/application/output";
  const base = { inputContractRef, outputContractRef };
  const applications = [
    gtl.composeApplication({
      ...base,
      leftGraphFunctionRef: "graph-function://m5/left",
      rightGraphFunctionRef: "graph-function://m5/right",
    }),
    gtl.substituteApplication({
      ...base,
      outerGraphFunctionRef: "graph-function://m5/outer",
      targetVectorRef: "graph-vector://m5/target",
      innerGraphFunctionRef: "graph-function://m5/inner",
    }),
    gtl.recurseApplication({
      ...base,
      graphFunctionRef: "graph-function://m5/recursive",
      terminationRuleRef: "rule://m5/termination",
      foldback: {
        mode: "rebind",
        binding: "$.child.result -> $.parent.input",
        requiresParentEvaluation: true,
      },
      bound: 3,
    }),
    gtl.fanOutApplication({
      ...base,
      elementGraphFunctionRef: "graph-function://m5/element",
      inputVectorRef: "graph-vector://m5/input",
      outputVectorRef: "graph-vector://m5/output",
      inputMemberContractRef: inputContractRef,
      outputMemberContractRef: outputContractRef,
    }),
    gtl.fanInApplication({
      ...base,
      reducerGraphFunctionRef: "graph-function://m5/reducer",
      inputVectorRef: "graph-vector://m5/input",
    }),
    gtl.gateApplication({
      ...base,
      targetRef: "graph-function://m5/target",
      ruleRef: "rule://m5/gate",
      evaluatorRefs: ["evaluator://m5/gate"],
    }),
    gtl.promoteApplication({
      ...base,
      sourceRef: inputContractRef,
      targetRef: outputContractRef,
    }),
    gtl.identityApplication({
      inputContractRef,
      outputContractRef: inputContractRef,
      targetRef: inputContractRef,
    }),
    gtl.sameObjectApplication({
      ...base,
      leftRef: "object://m5/left",
      rightRef: "object://m5/right",
      witnessRef: "identity-witness://m5/same",
    }),
  ];
  const edge = gtl.graphEdge({
    fromNodeRef: "node://m5/source",
    toNodeRef: "node://m5/target",
  });

  assert.deepEqual(
    ["edge", ...applications.map((application) => application.relationKind)],
    [
      "edge",
      "compose",
      "substitute",
      "recurse",
      "fan_out",
      "fan_in",
      "gate",
      "promote",
      "identity",
      "same_object",
    ],
  );
  assert.equal(applications.length, 9);
  assert.match(edge.edgeRef, /^graph-vector:\/\/abiogenesis\//u);
  assert.equal(edge.edgeRef, gtl.graphEdgeRef(edge));
  assert.equal(Object.isFrozen(edge), true);
  assert.equal(
    applications.every(
      (application) =>
        application.applicationRef === gtl.graphFunctionApplicationRef(application) &&
        Object.isFrozen(application),
    ),
    true,
  );
  assert.equal(
    applications.find((application) => application.relationKind === "recurse").foldbackRef,
    gtl.foldbackRef(
      applications.find((application) => application.relationKind === "recurse").foldback,
    ),
  );
  assert.throws(
    () => gtl.recurseApplication({
      ...base,
      graphFunctionRef: "graph-function://m5/recursive",
      terminationRuleRef: "rule://m5/termination",
      foldback: {
        mode: "rebind",
        binding: "",
        requiresParentEvaluation: true,
      },
      bound: 3,
    }),
    /foldback/u,
  );
  assert.throws(
    () => gtl.identityApplication({
      ...base,
      targetRef: inputContractRef,
    }),
    /exact interface/u,
  );
});

test("M5 whole-program validation admits exact recursion law and refuses its substitutes", () => {
  const publication = structuredClone(
    gtl.constructHelloWorldModulePublication(artifactBasis()),
  );
  const program = publication.programs[0];
  const graphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === program.starts[0].graphFunctionRef,
  );
  assert.notEqual(graphFunction, undefined);
  const application = gtl.recurseApplication({
    inputContractRef: graphFunction.inputs[0],
    outputContractRef: graphFunction.outputs[0],
    graphFunctionRef: graphFunction.name,
    terminationRuleRef: "rule://abiogenesis/conformance/hello-recursion-terminal@5",
    foldback: {
      mode: "rebind",
      binding: "$.child.message -> $.parent.subject",
      requiresParentEvaluation: true,
    },
    bound: 2,
  });
  graphFunction.template.applications = [application];

  const admitted = validatePublishedProgram(publication);
  assert.equal(admitted.diagnostics.length, 0);

  for (const mutate of [
    (candidate) => {
      candidate.foldback.binding = "";
    },
    (candidate) => {
      candidate.foldback.requiresParentEvaluation = false;
    },
    (candidate) => {
      candidate.graphFunctionRef = "graph-function://m5/ambient-child";
    },
    (candidate) => {
      candidate.applicationRef = "graph-function-application://m5/forged";
    },
    (candidate) => {
      candidate.undeclaredControllerRef = "controller://m5/rival";
      candidate.applicationRef = gtl.graphFunctionApplicationRef(candidate);
    },
  ]) {
    const invalidPublication = structuredClone(publication);
    mutate(invalidPublication.graphFunctions[0].template.applications[0]);
    const result = programValidationResult(invalidPublication);
    assert.equal(result.kind, "static_validation_refusal", JSON.stringify(result));
    assert.equal(
      result.diagnostics.some((row) => row.code === "invalid_application"),
      true,
      JSON.stringify(result),
    );
  }
});

test("M5 whole-program validation refuses forged or widened graph-edge declarations", () => {
  const publication = structuredClone(
    gtl.constructHelloWorldModulePublication(artifactBasis()),
  );
  const program = publication.programs.find(
    (candidate) => candidate.programRef === gtl.GRAPH_EDGE_HELLO_IDS.programRef,
  );
  const graphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
  );
  assert.notEqual(program, undefined);
  assert.notEqual(graphFunction, undefined);
  assert.equal(programValidationResult(publication, program).kind, "program_validation");

  const forged = structuredClone(publication);
  forged.graphFunctions.find(
    (candidate) => candidate.name === gtl.GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
  ).template.edges[0].edgeRef = "graph-vector://m5/forged";
  const forgedResult = programValidationResult(
    forged,
    forged.programs.find(
      (candidate) => candidate.programRef === gtl.GRAPH_EDGE_HELLO_IDS.programRef,
    ),
  );
  assert.equal(forgedResult.kind, "static_validation_refusal");
  assert.equal(
    forgedResult.diagnostics.some((row) => row.code === "identity_mismatch"),
    true,
  );

  const widened = structuredClone(publication);
  const widenedEdge = widened.graphFunctions.find(
    (candidate) => candidate.name === gtl.GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
  ).template.edges[0];
  widenedEdge.controllerRef = "controller://m5/rival";
  const widenedResult = programValidationResult(
    widened,
    widened.programs.find(
      (candidate) => candidate.programRef === gtl.GRAPH_EDGE_HELLO_IDS.programRef,
    ),
  );
  assert.equal(widenedResult.kind, "static_validation_refusal");
  assert.equal(
    widenedResult.diagnostics.some((row) => row.code === "identity_mismatch"),
    true,
  );
});

test("M5 raw admission and validator reject invented or contradictory C data", () => {
  const unknown = validator.rawAdmitValue(
    { kind: "c_controller", inputCarrierRef: "contract://m5/request" },
    "c_program_term",
    "contract://raw/c-program-term",
  );
  assert.equal(unknown.kind, "raw_admission_refusal");
  assert.equal(unknown.code, "invalid_kind");

  const publication = gtl.constructHelloWorldModulePublication(artifactBasis());
  const graphFunction = publication.graphFunctions[0];
  const term = structuredClone(graphFunction.template.nodes[0].term);
  term.fibre = "F_H";
  const inspection = validator.inspectCProgramTerm(term, {
    path: "$.term",
    availableGraphFunctionRefs: new Set(publication.graphFunctions.map((value) => value.name)),
    callableGraphFunctionRefs: new Set(publication.programs[0].callableMembership),
    contractRefs: new Set(publication.contracts.map((value) => value.contractRef)),
    bindingByRef: new Map(publication.implementationBindings.map((value) => [value.bindingRef, value])),
  });
  assert.equal(inspection.term, null);
  assert.equal(
    inspection.diagnostics.some((row) => row.code === "invalid_leaf_requirement"),
    true,
  );
});

test("M4 Hello World remains one valid direct C.of Program", () => {
  const publication = gtl.constructHelloWorldModulePublication(artifactBasis());
  const program = publication.programs[0];
  const graphFunction = publication.graphFunctions[0];
  const result = validator.validateProgram({
    publication: raw(publication, "module_publication"),
    program: raw(program, "gtl_program"),
    graphFunctions: [raw(graphFunction, "graph_function")],
    contracts: publication.contracts.map((value) => raw(value, "contract_declaration")),
    implementationBindings: publication.implementationBindings.map((value) =>
      raw(value, "implementation_binding")),
    closureContracts: publication.closureContracts.map((value) => raw(value, "closure_contract")),
  });

  assert.equal(result.kind, "program_validation", JSON.stringify(result));
  assert.equal(result.executableLeafRows.length, 1);
  assert.equal(result.interactionLeafRows.length, 0);
  assert.match(result.executableLeafRows[0].requirementKey, /^executable-leaf:\/\/abiogenesis\//u);
  assert.deepEqual(
    result.transitiveReachableExecutableLeafKeys,
    result.executableLeafRows.map((row) => row.requirementKey),
  );
  assert.equal(graphFunction.template.nodes[0].term.kind, "c_of");
  assert.equal(graphFunction.template.applications.length, 0);
});

test("M5 whole-root validation keeps F_H interaction keys out of executable resolution", () => {
  const result = validatePublishedProgram(interactionOnlyPublication());
  assert.equal(result.executableLeafRows.length, 0);
  assert.equal(result.interactionLeafRows.length, 1);
  assert.match(result.interactionLeafRows[0].requirementKey, /^interaction-leaf:\/\/abiogenesis\//u);
  assert.deepEqual(
    result.transitiveReachableInteractionLeafKeys,
    result.interactionLeafRows.map((row) => row.requirementKey),
  );
});

test("M5 resolves and independently validates the complete executable root set", () => {
  const publication = gtl.constructHelloWorldModulePublication(artifactBasis());
  const programValidation = validatePublishedProgram(publication);
  const catalogView = catalogViewFor(publication);
  const descriptor = descriptorFor(publication.implementationBindings[0]);
  const candidate = product.resolveImplementationSet(
    catalogView,
    publication,
    programValidation,
    [descriptor],
  );

  assert.equal(candidate.kind, "implementation_resolution_set_candidate", JSON.stringify(candidate));
  assert.deepEqual(candidate.executableLeafKeys, programValidation.transitiveReachableExecutableLeafKeys);
  assert.equal(candidate.rows.length, 1);
  assert.equal(candidate.rows[0].requirementKey, programValidation.executableLeafRows[0].requirementKey);
  assert.equal(Object.isFrozen(candidate), true);
  assert.equal(Object.isFrozen(candidate.rows), true);

  const validation = validator.validateImplementationResolutionSet(
    candidate,
    catalogView,
    publication,
    programValidation,
    [descriptor],
  );
  assert.equal(validation.kind, "implementation_resolution_set_validation", JSON.stringify(validation));
  assert.deepEqual(validation.executableLeafKeys, candidate.executableLeafKeys);
  assert.deepEqual(
    validation.leafResolutionCandidateDigests,
    candidate.rows.map((row) => row.leafResolutionCandidateDigest),
  );
  assert.equal(Object.isFrozen(validation), true);
});

test("M5 complete resolution refuses missing, ambiguous, forged, and mismatched bases", () => {
  const publication = gtl.constructHelloWorldModulePublication(artifactBasis());
  const programValidation = validatePublishedProgram(publication);
  const catalogView = catalogViewFor(publication);
  const descriptor = descriptorFor(publication.implementationBindings[0]);

  const missing = product.resolveImplementationSet(
    catalogView,
    publication,
    programValidation,
    [],
  );
  assert.equal(missing.kind, "implementation_resolution_set_refusal");
  assert.equal(missing.code, "implementation_absent");
  assert.equal(missing.requirementKey, programValidation.executableLeafRows[0].requirementKey);

  const ambiguous = product.resolveImplementationSet(
    catalogView,
    publication,
    programValidation,
    [descriptor, descriptor],
  );
  assert.equal(ambiguous.kind, "implementation_resolution_set_refusal");
  assert.equal(ambiguous.code, "ambiguous_implementation");

  const candidate = product.resolveImplementationSet(
    catalogView,
    publication,
    programValidation,
    [descriptor],
  );
  assert.equal(candidate.kind, "implementation_resolution_set_candidate", JSON.stringify(candidate));
  const forged = validator.validateImplementationResolutionSet(
    structuredClone(candidate),
    catalogView,
    publication,
    programValidation,
    [descriptor],
  );
  assert.equal(forged.kind, "static_validation_refusal");
  assert.equal(forged.diagnostics[0].code, "raw_subject_mismatch");

  const interactionPublication = interactionOnlyPublication();
  const interactionValidation = validatePublishedProgram(interactionPublication);
  const mismatched = validator.validateImplementationResolutionSet(
    candidate,
    catalogViewFor(interactionPublication),
    interactionPublication,
    interactionValidation,
    [],
  );
  assert.equal(mismatched.kind, "static_validation_refusal");
  assert.equal(mismatched.diagnostics[0].code, "invalid_reference");
});

test("M5 F_H-only roots produce one valid empty executable-resolution set", () => {
  const publication = interactionOnlyPublication();
  const programValidation = validatePublishedProgram(publication);
  const catalogView = catalogViewFor(publication);
  const candidate = product.resolveImplementationSet(
    catalogView,
    publication,
    programValidation,
    [],
  );

  assert.equal(candidate.kind, "implementation_resolution_set_candidate", JSON.stringify(candidate));
  assert.deepEqual(candidate.executableLeafKeys, []);
  assert.deepEqual(candidate.rows, []);
  assert.equal(programValidation.interactionLeafRows.length, 1);
  const validation = validator.validateImplementationResolutionSet(
    candidate,
    catalogView,
    publication,
    programValidation,
    [],
  );
  assert.equal(validation.kind, "implementation_resolution_set_validation", JSON.stringify(validation));
});
