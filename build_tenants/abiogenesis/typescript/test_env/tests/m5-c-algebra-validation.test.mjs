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

test("M5 GraphFunction composition preserves exact left and right identity", () => {
  const publication = gtl.constructHelloWorldModulePublication(artifactBasis());
  const source = publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.notEqual(source, undefined);
  const leftIdentity = gtl.identityGraphFunction({
    name: "graph-function://m5/identity/hello-input",
    contractRef: source.inputs[0],
  });
  const rightIdentity = gtl.identityGraphFunction({
    name: "graph-function://m5/identity/hello-output",
    contractRef: source.outputs[0],
  });
  const leftComposed = gtl.composeGraphFunctions({
    name: "graph-function://m5/identity-left/hello-world",
    left: leftIdentity,
    right: source,
  });
  const rightComposed = gtl.composeGraphFunctions({
    name: "graph-function://m5/identity-right/hello-world",
    left: source,
    right: rightIdentity,
  });

  for (const composed of [leftComposed, rightComposed]) {
    assert.deepEqual(composed.inputs, source.inputs);
    assert.deepEqual(composed.outputs, source.outputs);
    assert.equal(composed.template.startNodeRef, source.template.startNodeRef);
    assert.deepEqual(composed.template.terminalNodeRefs, source.template.terminalNodeRefs);
    assert.deepEqual(
      composed.template.nodes.map((node) => node.nodeRef),
      source.template.nodes.map((node) => node.nodeRef),
    );
    assert.deepEqual(composed.template.edges, source.template.edges);
    assert.equal(
      composed.template.nodes.some((node) => node.term.kind === "c_identity"),
      false,
    );
    assert.equal(
      composed.template.applications.some((application) =>
        application.relationKind === "identity"),
      true,
    );
    assert.equal(
      composed.template.applications.some((application) =>
        application.relationKind === "compose"),
      true,
    );
    assert.equal(Object.isFrozen(composed), true);

    const candidate = structuredClone(publication);
    candidate.graphFunctions.push(
      structuredClone(
        composed === leftComposed ? leftIdentity : rightIdentity,
      ),
      structuredClone(composed),
    );
    const baseProgram = candidate.programs[0];
    const identityProgram = {
      ...structuredClone(baseProgram),
      programRef: `program://m5/${composed.name.split("/").at(-2)}`,
      starts: [{
        startRef: `start://m5/${composed.name.split("/").at(-2)}`,
        graphFunctionRef: composed.name,
      }],
      callableMembership: [composed.name],
    };
    candidate.programs.push(identityProgram);
    assert.equal(
      programValidationResult(candidate, identityProgram).kind,
      "program_validation",
    );
  }

  const forged = structuredClone(leftIdentity);
  const forgedApplication = forged.template.applications[0];
  forgedApplication.targetRef = "graph-function://m5/identity/forged";
  forgedApplication.applicationRef =
    gtl.graphFunctionApplicationRef(forgedApplication);
  assert.throws(
    () => gtl.composeGraphFunctions({
      name: "graph-function://m5/identity-forged/hello-world",
      left: forged,
      right: source,
    }),
    /must declare exactly one result/u,
  );
});

test("M5 GraphFunction promotion preserves topology and semantic truth", () => {
  const publication = gtl.constructHelloWorldModulePublication(artifactBasis());
  const source = publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.HELLO_WORLD_IDS.graphFunctionRef,
  );
  assert.notEqual(source, undefined);
  const promoted = gtl.promoteGraphFunction({
    name: "graph-function://m5/promoted/hello-world",
    source,
    sourceRef: source.inputs[0],
    targetRef: source.outputs[0],
  });

  assert.deepEqual(promoted.inputs, source.inputs);
  assert.deepEqual(promoted.outputs, source.outputs);
  assert.notEqual(promoted.template.graphRef, source.template.graphRef);
  assert.equal(promoted.template.startNodeRef, source.template.startNodeRef);
  assert.deepEqual(promoted.template.terminalNodeRefs, source.template.terminalNodeRefs);
  assert.deepEqual(promoted.template.nodes, source.template.nodes);
  assert.deepEqual(promoted.template.edges, source.template.edges);
  assert.equal(
    promoted.template.applications.some((application) =>
      application.relationKind === "promote" &&
      application.sourceRef === source.inputs[0] &&
      application.targetRef === source.outputs[0]),
    true,
  );
  assert.equal(Object.isFrozen(promoted), true);

  const candidate = structuredClone(publication);
  candidate.graphFunctions.push(structuredClone(promoted));
  const promotedProgram = {
    ...structuredClone(candidate.programs[0]),
    programRef: "program://m5/promoted/hello-world",
    starts: [{
      startRef: "start://m5/promoted/hello-world",
      graphFunctionRef: promoted.name,
    }],
    callableMembership: [promoted.name],
  };
  candidate.programs.push(promotedProgram);
  assert.equal(
    programValidationResult(candidate, promotedProgram).kind,
    "program_validation",
  );

  assert.throws(
    () => gtl.promoteGraphFunction({
      name: "graph-function://m5/promoted/mismatched",
      source,
      sourceRef: source.inputs[0],
      targetRef: source.inputs[0],
    }),
    /exact source GraphFunction input and output contracts/u,
  );

  const forged = structuredClone(candidate);
  const forgedParent = forged.graphFunctions.find(
    (graphFunction) => graphFunction.name === promoted.name,
  );
  const forgedApplication = forgedParent.template.applications.find(
    (application) => application.relationKind === "promote",
  );
  forgedApplication.targetRef = source.inputs[0];
  forgedApplication.applicationRef =
    gtl.graphFunctionApplicationRef(forgedApplication);
  const forgedResult = programValidationResult(
    forged,
    forged.programs.find((program) => program.programRef === promotedProgram.programRef),
  );
  assert.equal(forgedResult.kind, "static_validation_refusal");
  assert.equal(
    forgedResult.diagnostics.some((row) => row.code === "carrier_mismatch"),
    true,
    JSON.stringify(forgedResult),
  );
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
      terminationEvaluatorRefs: ["evaluator://m5/termination"],
      terminationFieldRef: "$.terminal",
      foldback: {
        mode: "rebind",
        binding: "$.child.result -> $.parent.input",
        requiresParentEvaluation: true,
      },
      bound: 3,
    }),
    gtl.fanOutApplication({
      ...base,
      batchRef: "c-batch://m5/application",
      elementGraphFunctionRef: "graph-function://m5/element",
      inputVectorRef: inputContractRef,
      outputVectorRef: outputContractRef,
      inputMemberContractRef: inputContractRef,
      outputMemberContractRef: outputContractRef,
    }),
    gtl.fanInApplication({
      ...base,
      reducerGraphFunctionRef: "graph-function://m5/reducer",
      inputVectorRef: inputContractRef,
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
      rightRef: "object://m5/left",
    }),
  ];
  const edge = gtl.graphEdge({
    fromNodeRef: "node://m5/source",
    toNodeRef: "node://m5/target",
  });
  const evaluator = gtl.evaluatorDeclaration({
    name: "evaluator://m5/termination",
    regime: "F_D",
    description: "Checks the declared recursion terminal condition.",
    binding: "implementation://m5/termination",
    consumedFieldRefs: ["$.terminal"],
    tags: ["termination"],
  });
  const rule = gtl.ruleDeclaration({
    name: "rule://m5/termination",
    kind: "recursion_termination",
    config: { mode: "evaluator_all" },
    tags: ["termination"],
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
  assert.equal(Object.isFrozen(evaluator), true);
  assert.equal(Object.isFrozen(evaluator.consumedFieldRefs), true);
  assert.equal(Object.isFrozen(rule), true);
  assert.equal(Object.isFrozen(rule.config), true);
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
  const sameObject = applications.find(
    (application) => application.relationKind === "same_object",
  );
  assert.equal(
    sameObject.witnessRef,
    gtl.sameObjectWitnessRef(sameObject.leftRef),
  );
  assert.throws(
    () => gtl.sameObjectApplication({
      ...base,
      leftRef: "object://m5/left",
      rightRef: "object://m5/right",
    }),
    /one exact opaque identity/u,
  );
  assert.throws(
    () => gtl.recurseApplication({
      ...base,
      graphFunctionRef: "graph-function://m5/recursive",
      terminationRuleRef: "rule://m5/termination",
      terminationEvaluatorRefs: ["evaluator://m5/termination"],
      terminationFieldRef: "$.terminal",
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

test("M5 same-object relation is one validator-owned canonical identity witness", () => {
  const publication = structuredClone(
    gtl.constructHelloWorldModulePublication(artifactBasis()),
  );
  const program = publication.programs[0];
  const graphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === program.starts[0].graphFunctionRef,
  );
  assert.notEqual(graphFunction, undefined);
  graphFunction.template.applications = [gtl.sameObjectApplication({
    inputContractRef: graphFunction.inputs[0],
    outputContractRef: graphFunction.outputs[0],
    leftRef: graphFunction.name,
    rightRef: graphFunction.name,
  })];
  assert.equal(programValidationResult(publication, program).kind, "program_validation");

  const forged = structuredClone(publication);
  const forgedGraphFunction = forged.graphFunctions.find(
    (candidate) => candidate.name === program.starts[0].graphFunctionRef,
  );
  const forgedApplication = forgedGraphFunction.template.applications[0];
  forgedApplication.rightRef = "graph-function://m5/rival";
  forgedApplication.applicationRef = gtl.graphFunctionApplicationRef(forgedApplication);
  const result = programValidationResult(forged, forged.programs[0]);
  assert.equal(result.kind, "static_validation_refusal");
  assert.equal(
    result.diagnostics.some((row) => row.code === "identity_mismatch"),
    true,
    JSON.stringify(result),
  );
});

test("M5 closure validation distinguishes run and child GraphCall scope", () => {
  const publication = structuredClone(
    gtl.constructHelloWorldModulePublication(artifactBasis()),
  );
  const program = publication.programs.find(
    (candidate) => candidate.programRef === gtl.RECURSION_HELLO_IDS.programRef,
  );
  const rootClosure = publication.closureContracts.find(
    (candidate) =>
      candidate.closureContractRef ===
        gtl.RECURSION_HELLO_IDS.closureContractRef,
  );
  const childClosure = publication.closureContracts.find(
    (candidate) =>
      candidate.closureContractRef ===
        gtl.RECURSION_HELLO_IDS.childClosureContractRef,
  );
  assert.notEqual(program, undefined);
  assert.deepEqual(
    {
      eventKindRefs: rootClosure?.eventKindRefs,
      scope: rootClosure?.closureScope,
    },
    {
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
        "run_closed",
      ],
      scope: "run",
    },
  );
  assert.deepEqual(
    {
      eventKindRefs: childClosure?.eventKindRefs,
      scope: childClosure?.closureScope,
    },
    {
      eventKindRefs: [
        "terminal_reached",
        "frame_closed",
        "graph_call_closed",
      ],
      scope: "graph_call",
    },
  );
  assert.equal(
    programValidationResult(publication, program).kind,
    "program_validation",
  );

  for (const closureContractRef of [
    gtl.RECURSION_HELLO_IDS.closureContractRef,
    gtl.RECURSION_HELLO_IDS.childClosureContractRef,
  ]) {
    const invalidPublication = structuredClone(publication);
    const invalidClosure = invalidPublication.closureContracts.find(
      (candidate) =>
        candidate.closureContractRef === closureContractRef,
    );
    assert.notEqual(invalidClosure, undefined);
    invalidClosure.closureScope =
      invalidClosure.closureScope === "run" ? "graph_call" : "run";
    const result = programValidationResult(
      invalidPublication,
      invalidPublication.programs.find(
        (candidate) =>
          candidate.programRef === gtl.RECURSION_HELLO_IDS.programRef,
      ),
    );
    assert.equal(result.kind, "static_validation_refusal");
    assert.equal(
      result.diagnostics.some(
        (row) =>
          row.code === "invalid_reference" &&
          row.path.includes(closureContractRef),
      ),
      true,
      JSON.stringify(result),
    );
  }
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
  publication.evaluators = [gtl.evaluatorDeclaration({
    name: "evaluator://abiogenesis/conformance/hello-recursion-terminal@5",
    regime: "F_D",
    description: "Checks the bounded Hello World recursion terminal condition.",
    binding: "implementation://abiogenesis/conformance/hello-recursion-terminal@5",
    consumedFieldRefs: ["$.terminal"],
    tags: ["recursion", "termination"],
  })];
  publication.rules = [gtl.ruleDeclaration({
    name: "rule://abiogenesis/conformance/hello-recursion-terminal@5",
    kind: "recursion_termination",
    config: { mode: "evaluator_all" },
    tags: ["recursion", "termination"],
  })];
  const application = gtl.recurseApplication({
    inputContractRef: graphFunction.inputs[0],
    outputContractRef: graphFunction.outputs[0],
    graphFunctionRef: graphFunction.name,
    terminationRuleRef: "rule://abiogenesis/conformance/hello-recursion-terminal@5",
    terminationEvaluatorRefs: [
      "evaluator://abiogenesis/conformance/hello-recursion-terminal@5",
    ],
    terminationFieldRef: "$.terminal",
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
      candidate.terminationRuleRef = "rule://m5/ambient";
      candidate.applicationRef = gtl.graphFunctionApplicationRef(candidate);
    },
    (candidate) => {
      candidate.terminationEvaluatorRefs = ["evaluator://m5/ambient"];
      candidate.applicationRef = gtl.graphFunctionApplicationRef(candidate);
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

test("M5 whole-program validation binds gate law to published Rule and Evaluator declarations", () => {
  const publication = structuredClone(
    gtl.constructHelloWorldModulePublication(artifactBasis()),
  );
  const program = publication.programs.find(
    (candidate) => candidate.programRef === gtl.GATE_HELLO_IDS.programRef,
  );
  assert.notEqual(program, undefined);
  const graphFunction = publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.GATE_HELLO_IDS.graphFunctionRef,
  );
  assert.notEqual(graphFunction, undefined);

  assert.equal(
    programValidationResult(publication, program).kind,
    "program_validation",
  );

  for (const collection of ["rules", "evaluators"]) {
    const missing = structuredClone(publication);
    missing[collection] = [];
    const missingProgram = missing.programs.find(
      (candidate) => candidate.programRef === gtl.GATE_HELLO_IDS.programRef,
    );
    const result = programValidationResult(missing, missingProgram);
    assert.equal(result.kind, "static_validation_refusal", JSON.stringify(result));
    assert.equal(
      result.diagnostics.some((row) => row.code === "invalid_application"),
      true,
      JSON.stringify(result),
    );
  }

  const widened = structuredClone(publication);
  widened.evaluators[0].runtimeAuthority = "event://m5/rival";
  const widenedProgram = widened.programs.find(
    (candidate) => candidate.programRef === gtl.GATE_HELLO_IDS.programRef,
  );
  const widenedResult = programValidationResult(widened, widenedProgram);
  assert.equal(widenedResult.kind, "static_validation_refusal");
  assert.equal(
    widenedResult.diagnostics.some((row) => row.code === "invalid_reference"),
    true,
  );

  const detached = structuredClone(publication);
  const detachedProgram = detached.programs.find(
    (candidate) => candidate.programRef === gtl.GATE_HELLO_IDS.programRef,
  );
  const detachedGraphFunction = detached.graphFunctions.find(
    (candidate) => candidate.name === gtl.GATE_HELLO_IDS.graphFunctionRef,
  );
  detachedGraphFunction.template.nodes[0].term.terms[0].compositionRef = null;
  const detachedResult = programValidationResult(detached, detachedProgram);
  assert.equal(detachedResult.kind, "static_validation_refusal");
  assert.equal(
    detachedResult.diagnostics.some((row) => row.code === "invalid_application"),
    true,
  );

  const divergentTarget = structuredClone(publication);
  const divergentProgram = divergentTarget.programs.find(
    (candidate) => candidate.programRef === gtl.GATE_HELLO_IDS.programRef,
  );
  const divergentGraphFunction = divergentTarget.graphFunctions.find(
    (candidate) => candidate.name === gtl.GATE_HELLO_IDS.graphFunctionRef,
  );
  divergentProgram.callableMembership.push(gtl.HELLO_WORLD_IDS.graphFunctionRef);
  divergentGraphFunction.template.nodes[0].term.terms[1].graphFunctionRef =
    gtl.HELLO_WORLD_IDS.graphFunctionRef;
  const divergentResult = programValidationResult(
    divergentTarget,
    divergentProgram,
  );
  assert.equal(divergentResult.kind, "static_validation_refusal");
  assert.equal(
    divergentResult.diagnostics.some(
      (row) =>
        row.code === "invalid_application" &&
        row.message.includes("matching workflow target"),
    ),
    true,
    JSON.stringify(divergentResult),
  );
});

test("M5 fan-out materialization derives one exact task per admitted input member", () => {
  const publication = gtl.constructHelloWorldModulePublication(artifactBasis());
  const program = publication.programs.find(
    (candidate) => candidate.programRef === gtl.FAN_OUT_HELLO_IDS.programRef,
  );
  const graphFunction = publication.graphFunctions.find(
    (candidate) =>
      candidate.name === gtl.FAN_OUT_HELLO_IDS.graphFunctionRef,
  );
  assert.notEqual(program, undefined);
  assert.notEqual(graphFunction, undefined);
  const programValidation = programValidationResult(publication, program);
  assert.equal(
    programValidation.kind,
    "program_validation",
    JSON.stringify(programValidation),
  );
  const admittedInput = gtl.constructFanOutHelloInput([
    "Alpha",
    "Beta",
    "Gamma",
  ]);
  const basis = {
    invocationAdmissionRef: "invocation-admission://m5/fan-out",
    admittedInputRef: "raw-input-admission://m5/fan-out",
    admittedInputDigest: product.sha256Canonical(admittedInput),
    admittedInput,
  };
  const graph = gtl.materializeGraph(graphFunction, basis);
  const materialization = graph.fanOutMaterializations[0];
  assert.notEqual(materialization, undefined);
  assert.equal(materialization.members.length, 3);
  assert.deepEqual(
    materialization.members.map((member) => member.ordinal),
    [0, 1, 2],
  );
  const batch = graph.template.nodes[0].term.terms[0];
  assert.equal(batch.kind, "c_batch");
  assert.equal(batch.tasks.length, 3);
  assert.equal(
    validator.validateGraph(
      graph,
      programValidation,
      graphFunction,
      basis,
    ).kind,
    "graph_validation",
  );

  const alteredInput = structuredClone(admittedInput);
  [alteredInput.members[0], alteredInput.members[1]] = [
    alteredInput.members[1],
    alteredInput.members[0],
  ];
  const refusal = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    { ...basis, admittedInput: alteredInput },
  );
  assert.equal(refusal.kind, "static_validation_refusal");
  assert.equal(refusal.diagnostics[0].code, "topology_mismatch");
});

test("M5 fan-out and fan-in outer contracts equal their declared vectors", () => {
  const mutations = [
    {
      relationKind: "fan_out",
      field: "inputContractRef",
      replacement: gtl.FAN_OUT_HELLO_IDS.inputMemberContractRef,
    },
    {
      relationKind: "fan_out",
      field: "outputContractRef",
      replacement: gtl.FAN_OUT_HELLO_IDS.outputMemberContractRef,
    },
    {
      relationKind: "fan_in",
      field: "inputContractRef",
      replacement: gtl.FAN_OUT_HELLO_IDS.inputMemberContractRef,
    },
  ];
  for (const mutation of mutations) {
    const publication = structuredClone(
      gtl.constructHelloWorldModulePublication(artifactBasis()),
    );
    const program = publication.programs.find(
      (candidate) => candidate.programRef === gtl.FAN_OUT_HELLO_IDS.programRef,
    );
    const graphFunction = publication.graphFunctions.find(
      (candidate) =>
        candidate.name === gtl.FAN_OUT_HELLO_IDS.graphFunctionRef,
    );
    const application = graphFunction.template.applications.find(
      (candidate) => candidate.relationKind === mutation.relationKind,
    );
    assert.notEqual(program, undefined);
    assert.notEqual(application, undefined);
    application[mutation.field] = mutation.replacement;
    application.applicationRef = gtl.graphFunctionApplicationRef(application);
    const result = programValidationResult(publication, program);
    assert.equal(result.kind, "static_validation_refusal", JSON.stringify(result));
    assert.equal(
      result.diagnostics.some((row) => row.code === "carrier_mismatch"),
      true,
      JSON.stringify(result),
    );
  }
});

test("M5 native GraphFunction composition materializes source GTL without a second executable carrier", () => {
  const publication = gtl.constructHelloWorldModulePublication(artifactBasis());
  const parentProgram = publication.programs.find(
    (candidate) => candidate.programRef === gtl.GRAPH_EDGE_HELLO_IDS.programRef,
  );
  const parent = publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
  );
  const left = publication.graphFunctions.find(
    (candidate) =>
      candidate.name === gtl.GRAPH_EDGE_HELLO_IDS.normalizeGraphFunctionRef,
  );
  const right = publication.graphFunctions.find(
    (candidate) =>
      candidate.name === gtl.GRAPH_EDGE_HELLO_IDS.renderGraphFunctionRef,
  );
  assert.notEqual(parentProgram, undefined);
  assert.notEqual(parent, undefined);
  assert.notEqual(left, undefined);
  assert.notEqual(right, undefined);

  const application = parent.template.applications[0];
  assert.equal(application.relationKind, "compose");
  assert.equal(application.leftGraphFunctionRef, left.name);
  assert.equal(application.rightGraphFunctionRef, right.name);
  assert.equal(application.applicationRef, gtl.graphFunctionApplicationRef(application));
  assert.deepEqual(parentProgram.callableMembership, [parent.name]);
  assert.deepEqual(parent.inputs, left.inputs);
  assert.deepEqual(parent.outputs, right.outputs);
  assert.deepEqual(parent.template.nodes.map((node) => node.nodeRef), [
    left.template.startNodeRef,
    right.template.startNodeRef,
  ]);
  assert.equal(parent.template.edges.length, 1);
  assert.equal(
    parent.template.edges[0].edgeRef,
    gtl.graphEdgeRef(parent.template.edges[0]),
  );
  assert.equal(left.template.nodes[0].term.resultBearing, true);
  assert.equal(parent.template.nodes[0].term.resultBearing, false);
  assert.equal(parent.template.nodes[1].term.resultBearing, true);
  assert.equal(parent.template.nodes[0].term.compositionRef, application.applicationRef);
  assert.equal(parent.template.nodes[1].term.compositionRef, application.applicationRef);
  assert.match(parent.template.graphRef, /^graph:\/\/abiogenesis\/composed\//u);
  assert.equal(Object.isFrozen(parent), true);
  assert.equal(Object.isFrozen(parent.template.nodes), true);
  assert.equal(programValidationResult(publication, parentProgram).kind, "program_validation");

  const missingSource = structuredClone(publication);
  const missingSourceParent = missingSource.graphFunctions.find(
    (candidate) => candidate.name === gtl.GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
  );
  missingSourceParent.template.applications[0].rightGraphFunctionRef =
    "graph-function://m5/unpublished";
  missingSourceParent.template.applications[0].applicationRef =
    gtl.graphFunctionApplicationRef(missingSourceParent.template.applications[0]);
  const missingResult = programValidationResult(
    missingSource,
    missingSource.programs.find(
      (candidate) => candidate.programRef === gtl.GRAPH_EDGE_HELLO_IDS.programRef,
    ),
  );
  assert.equal(missingResult.kind, "static_validation_refusal");
  assert.equal(
    missingResult.diagnostics.some((row) => row.code === "invalid_application"),
    true,
  );

  const mismatchedRight = structuredClone(right);
  mismatchedRight.inputs = ["contract://m5/unrelated"];
  assert.throws(
    () => gtl.composeGraphFunctions({
      name: "graph-function://m5/mismatched-compose",
      left,
      right: mismatchedRight,
    }),
    /exact left-output to right-input contract join/u,
  );
  const mixedRight = structuredClone(right);
  mixedRight.declarations["abg.compute_regime"] = "F_P";
  const mixed = gtl.composeGraphFunctions({
    name: "graph-function://m5/mixed-compose",
    left,
    right: mixedRight,
  });
  assert.equal(mixed.declarations["abg.compute_regime"], "mixed");
  const conflictingLeft = structuredClone(left);
  const conflictingRight = structuredClone(right);
  conflictingLeft.declarations["abg.semantic_policy"] = "left";
  conflictingRight.declarations["abg.semantic_policy"] = "right";
  assert.throws(
    () => gtl.composeGraphFunctions({
      name: "graph-function://m5/conflicting-compose",
      left: conflictingLeft,
      right: conflictingRight,
    }),
    /declaration conflict/u,
  );
  const duplicateRight = structuredClone(right);
  duplicateRight.template.nodes[0].nodeRef = left.template.nodes[0].nodeRef;
  duplicateRight.template.startNodeRef = left.template.nodes[0].nodeRef;
  duplicateRight.template.terminalNodeRefs = [left.template.nodes[0].nodeRef];
  assert.throws(
    () => gtl.composeGraphFunctions({
      name: "graph-function://m5/duplicate-compose",
      left,
      right: duplicateRight,
    }),
    /duplicate graph node identity/u,
  );
  const malformedLeft = structuredClone(left);
  malformedLeft.template.startNodeRef = "node://m5/missing";
  assert.throws(
    () => gtl.composeGraphFunctions({
      name: "graph-function://m5/malformed-compose",
      left: malformedLeft,
      right,
    }),
    /exact start and terminal nodes/u,
  );
});

test("M5 native GraphFunction substitution replaces one typed graph vector with visible source GTL", () => {
  const publication = gtl.constructHelloWorldModulePublication(artifactBasis());
  const parentProgram = publication.programs.find(
    (candidate) => candidate.programRef === gtl.SUBSTITUTED_HELLO_IDS.programRef,
  );
  const parent = publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.SUBSTITUTED_HELLO_IDS.graphFunctionRef,
  );
  const outer = publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.GRAPH_EDGE_HELLO_IDS.graphFunctionRef,
  );
  const inner = publication.graphFunctions.find(
    (candidate) => candidate.name === gtl.SUBSTITUTED_HELLO_IDS.innerGraphFunctionRef,
  );
  assert.notEqual(parentProgram, undefined);
  assert.notEqual(parent, undefined);
  assert.notEqual(outer, undefined);
  assert.notEqual(inner, undefined);

  const application = parent.template.applications.find(
    (candidate) => candidate.relationKind === "substitute",
  );
  assert.notEqual(application, undefined);
  assert.equal(application.outerGraphFunctionRef, outer.name);
  assert.equal(application.innerGraphFunctionRef, inner.name);
  assert.equal(application.targetVectorRef, outer.template.edges[0].edgeRef);
  assert.equal(application.applicationRef, gtl.graphFunctionApplicationRef(application));
  assert.deepEqual(parentProgram.callableMembership, [parent.name]);
  assert.deepEqual(parent.inputs, outer.inputs);
  assert.deepEqual(parent.outputs, outer.outputs);
  assert.deepEqual(parent.template.nodes.map((node) => node.nodeRef), [
    gtl.GRAPH_EDGE_HELLO_IDS.normalizeNodeRef,
    gtl.GRAPH_EDGE_HELLO_IDS.renderNodeRef,
    gtl.SUBSTITUTED_HELLO_IDS.innerNodeRef,
  ]);
  assert.equal(
    parent.template.edges.some((edge) => edge.edgeRef === application.targetVectorRef),
    false,
  );
  assert.deepEqual(
    parent.template.edges.map((edge) => [edge.fromNodeRef, edge.toNodeRef]),
    [
      [gtl.GRAPH_EDGE_HELLO_IDS.normalizeNodeRef, gtl.SUBSTITUTED_HELLO_IDS.innerNodeRef],
      [gtl.SUBSTITUTED_HELLO_IDS.innerNodeRef, gtl.GRAPH_EDGE_HELLO_IDS.renderNodeRef],
    ],
  );
  assert.equal(inner.template.nodes[0].term.resultBearing, true);
  assert.equal(parent.template.nodes[2].term.resultBearing, false);
  assert.equal(parent.template.nodes[2].term.compositionRef, application.applicationRef);
  assert.equal(outer.template.nodes[0].term.resultBearing, false);
  assert.equal(parent.template.nodes[0].term.resultBearing, false);
  assert.equal(parent.template.nodes[1].term.resultBearing, true);
  assert.match(parent.template.graphRef, /^graph:\/\/abiogenesis\/substituted\//u);
  assert.equal(Object.isFrozen(parent), true);
  assert.equal(programValidationResult(publication, parentProgram).kind, "program_validation");

  assert.throws(
    () => gtl.substituteGraphFunction({
      name: "graph-function://m5/missing-substitute",
      outer,
      targetVectorRef: "graph-vector://m5/missing",
      inner,
    }),
    /identify exactly one outer graph edge/u,
  );
  const mismatchedInner = structuredClone(inner);
  mismatchedInner.inputs = [gtl.HELLO_WORLD_IDS.inputContractRef];
  assert.throws(
    () => gtl.substituteGraphFunction({
      name: "graph-function://m5/mismatched-substitute",
      outer,
      targetVectorRef: outer.template.edges[0].edgeRef,
      inner: mismatchedInner,
    }),
    /exactly join the target vector endpoints/u,
  );
  const ungroundedInner = structuredClone(inner);
  ungroundedInner.environment.requires.push("binding://m5/ambient-substitute");
  assert.throws(
    () => gtl.substituteGraphFunction({
      name: "graph-function://m5/ungrounded-substitute",
      outer,
      targetVectorRef: outer.template.edges[0].edgeRef,
      inner: ungroundedInner,
    }),
    /environment requires a binding absent/u,
  );
  const duplicateInner = structuredClone(inner);
  duplicateInner.template.nodes[0].nodeRef = outer.template.nodes[0].nodeRef;
  duplicateInner.template.startNodeRef = outer.template.nodes[0].nodeRef;
  duplicateInner.template.terminalNodeRefs = [outer.template.nodes[0].nodeRef];
  assert.throws(
    () => gtl.substituteGraphFunction({
      name: "graph-function://m5/duplicate-substitute",
      outer,
      targetVectorRef: outer.template.edges[0].edgeRef,
      inner: duplicateInner,
    }),
    /duplicate graph node identity/u,
  );

  const forged = structuredClone(publication);
  const forgedParent = forged.graphFunctions.find(
    (candidate) => candidate.name === gtl.SUBSTITUTED_HELLO_IDS.graphFunctionRef,
  );
  const forgedApplication = forgedParent.template.applications.find(
    (candidate) => candidate.relationKind === "substitute",
  );
  forgedApplication.targetVectorRef = "graph-vector://m5/missing";
  forgedApplication.applicationRef = gtl.graphFunctionApplicationRef(forgedApplication);
  const forgedResult = programValidationResult(
    forged,
    forged.programs.find(
      (candidate) => candidate.programRef === gtl.SUBSTITUTED_HELLO_IDS.programRef,
    ),
  );
  assert.equal(forgedResult.kind, "static_validation_refusal");
  assert.equal(
    forgedResult.diagnostics.some((row) => row.code === "carrier_mismatch"),
    true,
    JSON.stringify(forgedResult),
  );
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
