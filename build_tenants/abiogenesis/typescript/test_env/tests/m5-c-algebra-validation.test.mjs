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

function validatePublishedProgram(publication) {
  const program = publication.programs[0];
  const result = validator.validateProgram({
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
