import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import {
  setupInstalledRootInvocation,
  setupInstalledRootResolution,
} from "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function runtimeBasis(correlationId) {
  return {
    eventTime: "2026-07-21T00:00:00.000Z",
    correlationId,
    causationEventRefs: [],
  };
}

test("R7 validates the original materialized GTL and admits one ExecutionBasis", async (context) => {
  const environment = await setupInstalledRootResolution(context, root);
  const {
    gtl,
    validator,
    abg,
    store,
    verified,
    program,
    graphFunction,
    rawInput,
    invocationAdmission,
    publication,
    programValidation,
    resolutionCandidate,
    resolutionValidation,
  } = environment;
  const eventCountBeforeMaterialization = store.readAll().length;
  const graph = gtl.materializeGraph(graphFunction, {
    invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
    admittedInputRef: rawInput.admissionRef,
    admittedInputDigest: rawInput.subjectDigest,
  });
  const graphValidation = validator.validateGraph(
    graph,
    programValidation,
    graphFunction,
    {
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rawInput.admissionRef,
      admittedInputDigest: rawInput.subjectDigest,
    },
  );
  assert.equal(graphValidation.kind, "graph_validation", JSON.stringify(graphValidation));
  assert.equal(store.readAll().length, eventCountBeforeMaterialization);
  assert.deepEqual(graph.template, graphFunction.template);
  assert.equal("steps" in graph, false);
  assert.equal("plan" in graph, false);

  const closureContract = publication.closureContracts.find(
    (value) => value.closureContractRef === program.closureContractRef,
  );
  const basisAdmission = abg.admitExecutionBasis(
    store,
    {
      invocationAdmission,
      program,
      graph,
      graphValidation,
      resolutionCandidate,
      resolutionValidation,
      closureContract,
    },
    runtimeBasis("correlation://t286/r7/positive"),
  );
  assert.equal(basisAdmission.kind, "execution_basis_admission", JSON.stringify(basisAdmission));
  assert.equal(basisAdmission.implementationResolution.disposition, "admitted");
  assert.equal(
    basisAdmission.implementationResolution.resolutionCandidateDigest,
    resolutionCandidate.resolutionCandidateDigest,
  );
  assert.equal(
    basisAdmission.implementationResolution.resolutionValidationRef,
    resolutionValidation.validationRef,
  );
  assert.equal(
    basisAdmission.implementationResolution.resolutionValidationDigest,
    resolutionValidation.validationDigest,
  );
  assert.equal(basisAdmission.implementationResolution.packageName, resolutionCandidate.packageName);
  assert.equal(basisAdmission.implementationResolution.packageVersion, resolutionCandidate.packageVersion);
  assert.equal(basisAdmission.implementationResolution.modulePath, resolutionCandidate.modulePath);
  assert.equal(basisAdmission.implementationResolution.namedSymbol, resolutionCandidate.namedSymbol);
  assert.equal(basisAdmission.executionBasis.disposition, "admitted");
  assert.equal(basisAdmission.executionBasis.invocationAdmissionRef, invocationAdmission.invocationAdmissionRef);
  assert.equal(basisAdmission.executionBasis.graphRef, graph.materializationRef);
  assert.equal(basisAdmission.executionBasis.graphDigest, graph.materializationDigest);
  assert.equal(basisAdmission.executionBasis.graphValidationRef, graphValidation.validationRef);
  assert.equal(basisAdmission.executionBasis.implementationResolutionRef, basisAdmission.implementationResolution.resolutionRef);
  assert.equal(basisAdmission.executionBasis.closureContractRef, closureContract.closureContractRef);
  assert.equal(Object.isFrozen(basisAdmission.executionBasis), true);
  assert.equal("runId" in basisAdmission.executionBasis, false);
  assert.equal("cursor" in basisAdmission.executionBasis, false);

  const events = store.readAll();
  assert.deepEqual(events.slice(-2).map((event) => event.kind), [
    "implementation_admitted",
    "basis_admitted",
  ]);
  assert.equal(events.at(-1).causationEventRefs[0], events.at(-2).eventId);

  const rejectedEnvironment = await setupInstalledRootInvocation(context, root);
  const alteredGraphFunction = structuredClone(rejectedEnvironment.graphFunction);
  alteredGraphFunction.template.graphRef = "graph://abiogenesis/conformance/altered@5";
  const alteredGraph = rejectedEnvironment.gtl.materializeGraph(
    alteredGraphFunction,
    {
      invocationAdmissionRef: rejectedEnvironment.invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rejectedEnvironment.rawInput.admissionRef,
      admittedInputDigest: rejectedEnvironment.rawInput.subjectDigest,
    },
  );
  const alteredGraphValidation = rejectedEnvironment.validator.validateGraph(
    alteredGraph,
    rejectedEnvironment.programValidation,
    rejectedEnvironment.graphFunction,
    {
      invocationAdmissionRef: rejectedEnvironment.invocationAdmission.invocationAdmissionRef,
      admittedInputRef: rejectedEnvironment.rawInput.admissionRef,
      admittedInputDigest: rejectedEnvironment.rawInput.subjectDigest,
    },
  );
  assert.equal(alteredGraphValidation.kind, "static_validation_refusal");
  const refusal = rejectedEnvironment.abg.admitInvocationRefusal(
    rejectedEnvironment.store,
    rejectedEnvironment.invocationAdmission,
    "graph_validation",
    alteredGraph.materializationDigest,
    alteredGraphValidation.diagnostics.map((diagnostic) =>
      `diagnostic://abiogenesis/graph-validation/${diagnostic.code}@5`),
    runtimeBasis("correlation://t286/r7/rejected"),
  );
  assert.equal(refusal.kind, "invocation_refusal_admission");
  assert.equal(rejectedEnvironment.store.readAll().at(-1).kind, "invocation_refused");
  assert.equal(rejectedEnvironment.store.readAll().some((event) => event.kind === "implementation_admitted"), false);
  assert.equal(rejectedEnvironment.store.readAll().some((event) => event.kind === "basis_admitted"), false);

  const forgedBasisEnvironment = await setupInstalledRootResolution(context, root);
  const forgedGraph = forgedBasisEnvironment.gtl.materializeGraph(
    forgedBasisEnvironment.graphFunction,
    {
      invocationAdmissionRef: forgedBasisEnvironment.invocationAdmission.invocationAdmissionRef,
      admittedInputRef: forgedBasisEnvironment.rawInput.admissionRef,
      admittedInputDigest: forgedBasisEnvironment.rawInput.subjectDigest,
    },
  );
  const forgedGraphValidation = forgedBasisEnvironment.validator.validateGraph(
    forgedGraph,
    forgedBasisEnvironment.programValidation,
    forgedBasisEnvironment.graphFunction,
    {
      invocationAdmissionRef: forgedBasisEnvironment.invocationAdmission.invocationAdmissionRef,
      admittedInputRef: forgedBasisEnvironment.rawInput.admissionRef,
      admittedInputDigest: forgedBasisEnvironment.rawInput.subjectDigest,
    },
  );
  assert.equal(forgedGraphValidation.kind, "graph_validation");
  const forgedClosureContract = forgedBasisEnvironment.publication.closureContracts.find(
    (value) => value.closureContractRef === forgedBasisEnvironment.program.closureContractRef,
  );
  const forgedResolutionValidation = structuredClone(forgedBasisEnvironment.resolutionValidation);
  const forgedBasisAdmission = forgedBasisEnvironment.abg.admitExecutionBasis(
    forgedBasisEnvironment.store,
    {
      invocationAdmission: forgedBasisEnvironment.invocationAdmission,
      program: forgedBasisEnvironment.program,
      graph: forgedGraph,
      graphValidation: forgedGraphValidation,
      resolutionCandidate: forgedBasisEnvironment.resolutionCandidate,
      resolutionValidation: forgedResolutionValidation,
      closureContract: forgedClosureContract,
    },
    runtimeBasis("correlation://t286/r7/forged-basis"),
  );
  assert.equal(forgedBasisAdmission.kind, "invocation_refusal_admission");
  assert.equal(forgedBasisAdmission.stage, "execution_basis");
  assert.equal(forgedBasisEnvironment.store.readAll().at(-1).kind, "invocation_refused");
  assert.equal(forgedBasisEnvironment.store.readAll().some((event) => event.kind === "implementation_admitted"), false);
  assert.equal(forgedBasisEnvironment.store.readAll().some((event) => event.kind === "basis_admitted"), false);

  const evidenceDirectory = join(root, "test_env/evidence");
  await mkdir(evidenceDirectory, { recursive: true });
  await writeFile(
    join(evidenceDirectory, "abi5-root-r7.json"),
    `${JSON.stringify({
      kind: "abi5_root_obligation_evidence",
      schemaVersion: "5.0.0",
      bindingId: "ABI5-ROOT-001",
      obligation: "R7_materialized_gtl_graph_validated",
      result: "satisfied",
      sourceImportUsed: false,
      artifactDigest: verified.artifactDigest,
      invocationAdmissionRef: invocationAdmission.invocationAdmissionRef,
      graphRef: graph.materializationRef,
      graphDigest: graph.materializationDigest,
      graphFunctionRef: graph.graphFunctionRef,
      graphFunctionDigest: graph.graphFunctionDigest,
      graphValidationRef: graphValidation.validationRef,
      graphValidationDigest: graphValidation.validationDigest,
      implementationResolutionRef: basisAdmission.implementationResolution.resolutionRef,
      implementationResolutionDigest: basisAdmission.implementationResolution.resolutionDigest,
      implementationResolutionValidationRef: basisAdmission.implementationResolution.resolutionValidationRef,
      implementationResolutionValidationDigest: basisAdmission.implementationResolution.resolutionValidationDigest,
      executionBasisRef: basisAdmission.executionBasis.basisRef,
      executionBasisDigest: basisAdmission.executionBasis.basisDigest,
      closureContractRef: basisAdmission.executionBasis.closureContractRef,
      eventStoreDigest: store.digest(),
      eventKinds: events.map((event) => event.kind),
      mutation: {
        changedGraphValidation: alteredGraphValidation.diagnostics.map((diagnostic) => diagnostic.code),
        admittedRefusalRef: refusal.refusalRef,
        admittedRefusalEventRef: refusal.admissionEventRef,
        forgedResolutionValidationRefused: forgedBasisAdmission.kind === "invocation_refusal_admission",
        implementationNotAdmitted: true,
        basisNotAdmitted: true,
      },
      authorityBoundary: {
        originalGtlPreserved: true,
        compiledRepresentationCreated: false,
        implementationExecuted: false,
        runOpened: false,
        hogEntered: false,
      },
    }, null, 2)}\n`,
    "utf8",
  );
});
