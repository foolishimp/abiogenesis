import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

import { setupInstalledRootExecutionBasis } from
  "../support/root-installed-environment.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const PROGRAM_REF = "program://abiogenesis/conformance/fp-hello@5";
const GRAPH_FUNCTION_REF =
  "graph-function://abiogenesis/conformance/fp-hello@5";
const INPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-instruction@5";
const OUTPUT_CONTRACT_REF =
  "contract://abiogenesis/conformance/fp-hello-output@5";
const ACTOR_REF = "actor://abiogenesis/conformance/claude-worker@5";
const WORKER_BINDING_REF =
  "worker-binding://abiogenesis/conformance/claude-worker@5";
const PLAN_REF = "prompt-plan://abiogenesis/conformance/fp-hello@5";
const RENDERER_REF = "renderer://abiogenesis/conformance/fp-hello@5";

function fpInput() {
  return {
    kind: "fp_hello_instruction",
    schemaVersion: "5.0.0",
    materializationPlanRef: PLAN_REF,
    rendererRef: RENDERER_REF,
    instructionContractRef: INPUT_CONTRACT_REF,
    resultContractRef: OUTPUT_CONTRACT_REF,
    workerActorRef: ACTOR_REF,
    workerBindingRef: WORKER_BINDING_REF,
    transportLane: "closed_prompt_proof",
    subject: "World",
    instruction: "Produce one concise greeting for the declared subject.",
  };
}

function validResult(overrides = {}) {
  return {
    kind: "fp_hello_output",
    schemaVersion: "5.0.0",
    resultContractRef: OUTPUT_CONTRACT_REF,
    actorRef: ACTOR_REF,
    message: "Hello World",
    ...overrides,
  };
}

function outputDigest(product, text) {
  try {
    return product.sha256Canonical(JSON.parse(text));
  } catch {
    return product.sha256Canonical(text);
  }
}

function constructBasis(environment, rawResultText) {
  const { product, implementationRow } = environment;
  const input = fpInput();
  const prompt = "Return one exact declared F_P result object.";
  const inputDigest = product.sha256Canonical(input);
  const request = {
    actorRef: ACTOR_REF,
    workerBindingRef: WORKER_BINDING_REF,
    implementationRef: implementationRow.implementationRef,
    inputDigest,
    materializationPlanRef: PLAN_REF,
    rendererRef: RENDERER_REF,
    instructionContractRef: INPUT_CONTRACT_REF,
    resultContractRef: OUTPUT_CONTRACT_REF,
    transportLane: "closed_prompt_proof",
    prompt,
    responseJsonSchema: {
      type: "object",
      additionalProperties: false,
      required: [
        "kind",
        "schemaVersion",
        "resultContractRef",
        "actorRef",
        "message",
      ],
    },
  };
  const transportBindingDigest = product.sha256Canonical({
    actorRef: ACTOR_REF,
    workerBindingRef: WORKER_BINDING_REF,
    implementationRef: implementationRow.implementationRef,
    inputDigest,
    promptDigest: product.sha256Canonical(prompt),
  });
  const transportDigest = product.sha256Canonical({
    transportBindingDigest,
    rawResultText,
  });
  const observation = {
    actorInvocationRef: "actor-invocation://t287/f04a/one",
    actorRef: ACTOR_REF,
    workerBindingRef: WORKER_BINDING_REF,
    implementationRef: implementationRow.implementationRef,
    inputDigest,
    materializationPlanRef: PLAN_REF,
    rendererRef: RENDERER_REF,
    instructionContractRef: INPUT_CONTRACT_REF,
    resultContractRef: OUTPUT_CONTRACT_REF,
    processRef: "process://t287/f04a/one",
    transportBindingRef: "transport-binding://t287/f04a/one",
    transportBindingDigest,
    disposition: "success",
    failureClass: null,
    finalOutput: rawResultText,
    observedOutputDigest: outputDigest(product, rawResultText),
    promptDigest: product.sha256Canonical(prompt),
    transportDigest,
    transportLane: "closed_prompt_proof",
    processStatus: 0,
    processSignal: null,
    timedOut: false,
    exitObserved: true,
    terminationConfirmed: true,
    signalSequence: [],
    structuredEventCount: 1,
    progressEventCount: 1,
    toolCallCount: 0,
    apiRetryCount: 0,
    stdoutByteLength: Buffer.byteLength(rawResultText),
    stderrByteLength: 0,
    artifactDigests: {
      output: product.sha256Bytes(rawResultText),
      prompt: product.sha256Bytes(prompt),
      stderr: product.sha256Bytes(""),
      stdout: product.sha256Bytes(rawResultText),
      transport: transportDigest,
    },
  };
  return {
    leafPort: environment.leafPort,
    occurrence: {
      cCallRef: "c-call://t287/f04a/one",
      runId: "run://t287/f04a/one",
      graphCallId: "graph-call://t287/f04a/one",
      frameId: "frame://t287/f04a/one",
      programLocusRef: implementationRow.programLocusRef,
      taskOrdinal: null,
      attempt: 1,
    },
    resolution: implementationRow,
    input,
    request,
    observation,
  };
}

function withInput(environment, basis, input) {
  const inputDigest = environment.product.sha256Canonical(input);
  return {
    ...basis,
    input,
    request: { ...basis.request, inputDigest },
    observation: { ...basis.observation, inputDigest },
  };
}

function withRawResult(environment, basis, rawResultText) {
  return {
    ...constructBasis(environment, rawResultText),
    occurrence: basis.occurrence,
    resolution: basis.resolution,
  };
}

function assertRefusal(result, code) {
  assert.equal(result.kind, "probabilistic_result_admission_refusal");
  assert.equal(result.code, code, JSON.stringify(result));
  assert.equal(Object.isFrozen(result), true);
}

function assertPureRefusal(environment, admit, candidate, code) {
  const before = environment.store.readAll();
  let result;
  assert.doesNotThrow(() => {
    result = admit(candidate);
  });
  assertRefusal(result, code);
  assert.deepEqual(environment.store.readAll(), before);
  return result;
}

function actorObservation(basis, overrides) {
  return {
    ...basis.observation,
    ...overrides,
    artifactDigests: {
      ...basis.observation.artifactDigests,
      ...(overrides.artifactDigests ?? {}),
    },
  };
}

test("F04-A exact request-bound raw result admission is pure and decision-exact", async (context) => {
  const environment = await setupInstalledRootExecutionBasis(context, root, {
    programRef: PROGRAM_REF,
    graphFunctionRef: GRAPH_FUNCTION_REF,
    inputContractRef: INPUT_CONTRACT_REF,
    input: fpInput(),
  });
  assert.equal(environment.implementationRow.computeRegime, "F_P");

  const installedPackage = JSON.parse(
    await readFile(join(environment.installedRoot, "package.json"), "utf8"),
  );
  const bundledParser = JSON.parse(
    await readFile(
      join(
        environment.installedRoot,
        "node_modules/jsonc-parser/package.json",
      ),
      "utf8",
    ),
  );
  assert.equal(installedPackage.dependencies["jsonc-parser"], "3.3.1");
  assert.equal(installedPackage.bundleDependencies.includes("jsonc-parser"), true);
  assert.equal(bundledParser.version, "3.3.1");

  const admit = environment.hog.admitProbabilisticResultCandidate;
  assert.equal(typeof admit, "function");
  const basis = constructBasis(environment, JSON.stringify(validResult()));
  assert.equal(Object.hasOwn(basis, "resultPredicateRef"), false);
  const beforeEvents = environment.store.readAll();
  const validateActorCarriers =
    environment.abg.validateActorProcessCarrierPair;
  assert.equal(typeof validateActorCarriers, "function");
  const validObservationShapes = [
    basis.observation,
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      finalOutput: "",
      processStatus: 7,
      processSignal: null,
      timedOut: false,
      exitObserved: true,
      terminationConfirmed: true,
      signalSequence: [],
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      processStatus: 0,
      processSignal: null,
      timedOut: true,
      exitObserved: true,
      terminationConfirmed: true,
      signalSequence: ["SIGTERM"],
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      finalOutput: "",
      processStatus: null,
      processSignal: "SIGTERM",
      timedOut: false,
      exitObserved: true,
      terminationConfirmed: true,
      signalSequence: [],
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      finalOutput: "",
      processStatus: null,
      processSignal: "SIGTERM",
      timedOut: true,
      exitObserved: true,
      terminationConfirmed: true,
      signalSequence: ["SIGTERM"],
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      finalOutput: "",
      processStatus: null,
      processSignal: null,
      timedOut: true,
      exitObserved: false,
      terminationConfirmed: false,
      signalSequence: ["SIGTERM", "SIGKILL"],
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      finalOutput: "",
      processStatus: -2,
      processSignal: null,
      timedOut: false,
      exitObserved: false,
      terminationConfirmed: false,
      signalSequence: [],
      structuredEventCount: 0,
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      apiRetryCount: 1,
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      structuredEventCount: 0,
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "no_output",
      finalOutput: "",
      processStatus: 0,
      processSignal: null,
      timedOut: false,
      exitObserved: true,
      terminationConfirmed: true,
      signalSequence: [],
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "contract_failure",
      processStatus: 0,
      processSignal: null,
      timedOut: false,
      exitObserved: true,
      terminationConfirmed: true,
      signalSequence: [],
      toolCallCount: 1,
    }),
  ];
  const validCarrierPairs = validObservationShapes.map(
    (observation) => [basis.request, observation],
  );
  validCarrierPairs.push([
    { ...basis.request, transportLane: "worker_executes" },
    actorObservation(basis, {
      transportLane: "worker_executes",
      toolCallCount: 2,
    }),
  ]);
  for (const [request, observation] of validCarrierPairs) {
    const validation = validateActorCarriers(request, observation);
    assert.equal(
      validation.kind,
      "actor_process_carrier_validation",
      JSON.stringify(validation),
    );
    assert.equal(Object.isFrozen(validation), true);
  }
  const coldTransportCounterexamples = [
    actorObservation(basis, {
      apiRetryCount: 1,
    }),
    actorObservation(basis, {
      toolCallCount: 1,
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      processStatus: null,
      processSignal: "SIG_NOT_A_NODE_SIGNAL",
      exitObserved: true,
      terminationConfirmed: true,
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      processStatus: 0,
      processSignal: null,
      timedOut: true,
      exitObserved: true,
      terminationConfirmed: true,
      signalSequence: ["SIGUSR1"],
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "no_output",
      finalOutput: "",
      processStatus: 7,
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      processStatus: null,
      processSignal: null,
      timedOut: true,
      exitObserved: false,
      terminationConfirmed: false,
      signalSequence: ["SIGTERM"],
    }),
    actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
      processStatus: 7,
      processSignal: "SIGTERM",
      exitObserved: true,
      terminationConfirmed: true,
    }),
  ];
  for (const observation of coldTransportCounterexamples) {
    const validation = validateActorCarriers(basis.request, observation);
    assert.equal(
      validation.kind,
      "actor_process_carrier_validation_refusal",
      JSON.stringify(validation),
    );
    assert.equal(Object.isFrozen(validation), true);
  }
  for (const [request, observation] of [
    [basis.request, actorObservation(basis, {
      disposition: "failure",
      failureClass: "arbitrary_failure",
    })],
    [basis.request, actorObservation(basis, {
      disposition: "failure",
      failureClass: "no_output",
      finalOutput: "not blank",
      processStatus: 0,
    })],
    [basis.request, actorObservation(basis, {
      disposition: "failure",
      failureClass: "contract_failure",
      transportLane: "worker_executes",
      toolCallCount: 1,
    })],
    [basis.request, actorObservation(basis, {
      disposition: "failure",
      failureClass: "contract_failure",
      toolCallCount: 0,
    })],
    [{ ...basis.request, prompt: "" }, basis.observation],
    [{ ...basis.request, prompt: "" }, actorObservation(basis, {
      disposition: "failure",
      failureClass: "transport_failure",
    })],
    [basis.request, actorObservation(basis, {
      disposition: "failure",
      failureClass: null,
    })],
    [basis.request, actorObservation(basis, {
      processStatus: null,
      processSignal: null,
      exitObserved: true,
      terminationConfirmed: true,
    })],
    [basis.request, actorObservation(basis, {
      structuredEventCount: -1,
    })],
  ]) {
    const validation = validateActorCarriers(request, observation);
    assert.equal(
      validation.kind,
      "actor_process_carrier_validation_refusal",
      JSON.stringify(validation),
    );
    assert.equal(Object.isFrozen(validation), true);
  }
  let requestGetterCalls = 0;
  const accessorRequest = { ...basis.request };
  Object.defineProperty(accessorRequest, "actorRef", {
    configurable: true,
    enumerable: true,
    get() {
      requestGetterCalls += 1;
      return basis.request.actorRef;
    },
  });
  assert.equal(
    validateActorCarriers(accessorRequest, basis.observation).kind,
    "actor_process_carrier_validation_refusal",
  );
  assert.equal(requestGetterCalls, 0);
  const accepted = admit(basis);
  assert.equal(
    accepted.kind,
    "contract_admitted_probabilistic_result_candidate",
    JSON.stringify(accepted),
  );
  assert.equal(accepted.rawResultContractRef, OUTPUT_CONTRACT_REF);
  assert.equal(
    accepted.targetOutputContractRef,
    environment.implementationRow.outputContractRef,
  );
  assert.equal(Object.hasOwn(accepted, "resultContractRef"), false);
  assert.equal(Object.hasOwn(accepted, "resultPredicateRef"), false);
  assert.equal(accepted.actorRef, ACTOR_REF);
  assert.equal(accepted.workerBindingRef, WORKER_BINDING_REF);
  assert.equal(accepted.occurrence.cCallRef, basis.occurrence.cCallRef);
  assert.equal(accepted.occurrence.attempt, 1);
  assert.equal(
    accepted.implementationResolutionDigest,
    environment.product.sha256Canonical(environment.implementationRow),
  );
  assert.deepEqual(accepted.value, validResult());
  assert.equal(Object.isFrozen(accepted), true);
  assert.equal(Object.isFrozen(accepted.value), true);
  assert.equal(Object.isFrozen(accepted.occurrence), true);
  assert.equal(Object.isFrozen(accepted.contractCapabilityBasis), true);
  assert.deepEqual(environment.store.readAll(), beforeEvents);

  const copiedPort = admit({ ...basis, leafPort: { ...basis.leafPort } });
  assertRefusal(copiedPort, "unadmitted_contract_capability");
  const repeated = admit(basis);
  assert.deepEqual(repeated, accepted);
  assert.deepEqual(environment.store.readAll(), beforeEvents);
  assert.equal(
    Object.hasOwn(
      environment.hog,
      "isContractAdmittedProbabilisticResultCandidate",
    ),
    false,
  );

  const semanticallyDifferent = admit(withRawResult(
    environment,
    basis,
    JSON.stringify(validResult({ message: "Goodbye World" })),
  ));
  assert.equal(
    semanticallyDifferent.kind,
    "contract_admitted_probabilistic_result_candidate",
    JSON.stringify(semanticallyDifferent),
  );
  assert.equal(semanticallyDifferent.value.message, "Goodbye World");
  assert.equal(Object.hasOwn(semanticallyDifferent, "resultPredicateRef"), false);
  assert.deepEqual(environment.store.readAll(), beforeEvents);

  const cCallCoordinates = {
    callClass: "leaf",
    regime: "F_P",
    cCallRef: basis.occurrence.cCallRef,
    runId: basis.occurrence.runId,
    graphCallId: basis.occurrence.graphCallId,
    frameId: basis.occurrence.frameId,
    programLocusRef: basis.occurrence.programLocusRef,
    taskOrdinal: basis.occurrence.taskOrdinal,
    attempt: basis.occurrence.attempt,
    implementationRef: basis.resolution.implementationRef,
    implementationSetRef: accepted.contractCapabilityBasis.implementationSetRef,
    outputContractRef: accepted.targetOutputContractRef,
  };
  const abgEvidence = environment.abg.deriveProbabilisticTransportEvidence(
    cCallCoordinates,
    basis.request,
    basis.observation,
    accepted,
    accepted.value,
    accepted.instructionContractRef,
    accepted.rawResultContractRef,
  );
  assert.equal(abgEvidence.candidateRef, accepted.candidateRef);
  assert.equal(abgEvidence.candidateDigest, accepted.candidateDigest);
  assert.equal(abgEvidence.requestRef, accepted.requestRef);
  assert.equal(abgEvidence.requestDigest, accepted.requestDigest);
  assert.equal(abgEvidence.rawOutputDigest, accepted.rawOutputDigest);
  const substitutedPrompt =
    "Return one substituted but structurally valid F_P result object.";
  const substitutedRequest = {
    ...basis.request,
    prompt: substitutedPrompt,
  };
  const substitutedPromptDigest = environment.product.sha256Canonical(
    substitutedPrompt,
  );
  const substitutedTransportBindingDigest =
    environment.product.sha256Canonical({
      actorRef: substitutedRequest.actorRef,
      workerBindingRef: substitutedRequest.workerBindingRef,
      implementationRef: substitutedRequest.implementationRef,
      inputDigest: substitutedRequest.inputDigest,
      promptDigest: substitutedPromptDigest,
    });
  const substitutedTransportDigest = environment.product.sha256Canonical({
    transportBindingDigest: substitutedTransportBindingDigest,
    rawResultText: basis.observation.finalOutput,
  });
  const substitutedObservation = {
    ...basis.observation,
    promptDigest: substitutedPromptDigest,
    transportBindingDigest: substitutedTransportBindingDigest,
    transportDigest: substitutedTransportDigest,
    artifactDigests: {
      ...basis.observation.artifactDigests,
      prompt: environment.product.sha256Bytes(substitutedPrompt),
      transport: substitutedTransportDigest,
    },
  };
  const substitutedRequestDigest = environment.product.sha256Canonical(
    substitutedRequest,
  );
  const substitutedRequestRef =
    `probabilistic-request://abiogenesis/${
      substitutedRequestDigest.slice("sha256:".length)
    }`;
  assert.notEqual(substitutedRequestDigest, accepted.requestDigest);
  assert.notEqual(substitutedRequestRef, accepted.requestRef);
  const beforeSubstitutedEvidence = structuredClone(
    environment.store.readAll(),
  );
  assert.throws(
    () => environment.abg.deriveProbabilisticTransportEvidence(
      cCallCoordinates,
      substitutedRequest,
      substitutedObservation,
      accepted,
      accepted.value,
      accepted.instructionContractRef,
      accepted.rawResultContractRef,
    ),
    /exact ABG-revalidated F04-A result carrier/u,
  );
  assert.deepEqual(
    environment.store.readAll(),
    beforeSubstitutedEvidence,
    "substituted request lineage is refused before evidence admission",
  );
  assert.throws(
    () => environment.abg.deriveProbabilisticTransportEvidence(
      cCallCoordinates,
      basis.request,
      basis.observation,
      semanticallyDifferent,
      accepted.value,
      accepted.instructionContractRef,
      accepted.rawResultContractRef,
    ),
    /exact ABG-revalidated F04-A result carrier/u,
  );

  const permutedText = JSON.stringify({
    message: "Hello World",
    actorRef: ACTOR_REF,
    resultContractRef: OUTPUT_CONTRACT_REF,
    schemaVersion: "5.0.0",
    kind: "fp_hello_output",
  });
  const permuted = admit(withRawResult(environment, basis, permutedText));
  assert.equal(permuted.kind, "contract_admitted_probabilistic_result_candidate");
  assert.equal(permuted.valueDigest, accepted.valueDigest);
  assert.notEqual(
    permuted.candidateDigest,
    accepted.candidateDigest,
    "exact transport evidence remains part of candidate identity",
  );

  const duplicate =
    `{"kind":"fp_hello_output","kind":"fp_hello_output",` +
    `"schemaVersion":"5.0.0","resultContractRef":${JSON.stringify(OUTPUT_CONTRACT_REF)},` +
    `"actorRef":${JSON.stringify(ACTOR_REF)},"message":"Hello World"}`;
  const validText = JSON.stringify(validResult());
  for (const [text, code] of [
    ["{", "malformed_json"],
    [`${validText} trailing`, "invalid_json_framing"],
    [`${validText}\n${validText}`, "invalid_json_framing"],
    [duplicate, "duplicate_object_key"],
    [
      validText.replace(
        '"message":"Hello World"',
        '"unsafe":9007199254740993,"message":"Hello World"',
      ),
      "unsafe_integral_number",
    ],
    ["[]", "non_object_result"],
  ]) {
    assertRefusal(admit(withRawResult(environment, basis, text)), code);
  }

  assertRefusal(
    admit(withRawResult(
      environment,
      basis,
      JSON.stringify({
        kind: "fp_hello_output",
        schemaVersion: "5.0.0",
        resultContractRef: OUTPUT_CONTRACT_REF,
        actorRef: ACTOR_REF,
      }),
    )),
    "declared_contract_refused",
  );
  for (const [mutation, code] of [
    [{ resultPredicateRef: "predicate://t287/f04a/forbidden@5" }, "request_basis_mismatch"],
    [{ request: { ...basis.request, undeclared: true } }, "request_basis_mismatch"],
    [{ occurrence: { ...basis.occurrence, undeclared: true } }, "request_basis_mismatch"],
    [{ resolution: { ...basis.resolution } }, "unadmitted_contract_capability"],
    [{
      request: {
        ...basis.request,
        resultContractRef: "contract://t287/f04a/wrong@5",
      },
    }, "contract_identity_mismatch"],
    [{
      observation: {
        ...basis.observation,
        actorRef: "actor://t287/f04a/wrong",
      },
    }, "actor_identity_mismatch"],
    [{
      observation: {
        ...basis.observation,
        workerBindingRef: "worker-binding://t287/f04a/wrong",
      },
    }, "worker_identity_mismatch"],
    [{
      request: {
        ...basis.request,
        inputDigest: environment.product.sha256Canonical({ wrong: true }),
      },
    }, "input_identity_mismatch"],
    [{
      observation: {
        ...basis.observation,
        implementationRef: "implementation://t287/f04a/wrong",
      },
    }, "request_basis_mismatch"],
    [{
      observation: {
        ...basis.observation,
        artifactDigests: {
          ...basis.observation.artifactDigests,
          transport: environment.product.sha256Canonical({ wrong: true }),
        },
      },
    }, "transport_basis_mismatch"],
  ]) {
    assertPureRefusal(
      environment,
      admit,
      { ...basis, ...mutation },
      code,
    );
  }

  assertPureRefusal(
    environment,
    admit,
    withInput(environment, basis, {
      ...basis.input,
      kind: "wrong_fp_input",
    }),
    "input_identity_mismatch",
  );
  assertPureRefusal(
    environment,
    admit,
    {
      ...basis,
      occurrence: {
        ...basis.occurrence,
        programLocusRef: "locus://t287/f04a/wrong@5",
      },
    },
    "request_basis_mismatch",
  );
  for (const [mutation, code] of [
    [{ request: { ...basis.request, actorRef: "" } }, "request_basis_mismatch"],
    [{ request: { ...basis.request, workerBindingRef: 17 } }, "request_basis_mismatch"],
    [{ request: { ...basis.request, prompt: null } }, "request_basis_mismatch"],
    [{ observation: { ...basis.observation, processRef: "" } }, "transport_basis_mismatch"],
    [{ observation: { ...basis.observation, finalOutput: 42 } }, "transport_basis_mismatch"],
    [{ observation: { ...basis.observation, apiRetryCount: -1 } }, "transport_basis_mismatch"],
    [{ observation: { ...basis.observation, stdoutByteLength: 1.5 } }, "transport_basis_mismatch"],
    [{
      observation: {
        ...basis.observation,
        exitObserved: false,
        terminationConfirmed: false,
        processStatus: 0,
      },
    }, "transport_basis_mismatch"],
    [{
      observation: {
        ...basis.observation,
        disposition: "failure",
        failureClass: "no_output",
        finalOutput: "not blank",
      },
    }, "transport_basis_mismatch"],
    [{
      observation: {
        ...basis.observation,
        disposition: "failure",
        failureClass: "contract_failure",
        transportLane: "worker_executes",
        toolCallCount: 1,
      },
    }, "transport_basis_mismatch"],
  ]) {
    assertPureRefusal(
      environment,
      admit,
      { ...basis, ...mutation },
      code,
    );
  }

  for (const observation of coldTransportCounterexamples) {
    assertPureRefusal(
      environment,
      admit,
      { ...basis, observation },
      "transport_basis_mismatch",
    );
  }

  const hiddenOuter = { ...basis };
  Object.defineProperty(hiddenOuter, "hidden", {
    configurable: true,
    enumerable: false,
    value: true,
  });
  assertPureRefusal(
    environment,
    admit,
    hiddenOuter,
    "request_basis_mismatch",
  );
  const symbolOuter = { ...basis, [Symbol("hidden")]: true };
  assertPureRefusal(
    environment,
    admit,
    symbolOuter,
    "request_basis_mismatch",
  );
  let outerGetterCalls = 0;
  const accessorOuter = { ...basis };
  Object.defineProperty(accessorOuter, "request", {
    configurable: true,
    enumerable: true,
    get() {
      outerGetterCalls += 1;
      return basis.request;
    },
  });
  assertPureRefusal(
    environment,
    admit,
    accessorOuter,
    "request_basis_mismatch",
  );
  assert.equal(outerGetterCalls, 0);
  assertPureRefusal(
    environment,
    admit,
    Object.assign(Object.create({ inherited: true }), basis),
    "request_basis_mismatch",
  );
  assertPureRefusal(
    environment,
    admit,
    Object.values(basis),
    "request_basis_mismatch",
  );

  const hiddenRequest = { ...basis.request };
  Object.defineProperty(hiddenRequest, "hidden", {
    configurable: true,
    enumerable: false,
    value: true,
  });
  assertPureRefusal(
    environment,
    admit,
    { ...basis, request: hiddenRequest },
    "request_basis_mismatch",
  );

  const installedIJson = await import(
    `${pathToFileURL(join(
      environment.installedRoot,
      "build/code/src/shared/i_json.js",
    )).href}?f04a=${Date.now()}`
  );
  for (const [value, code] of [
    [{ value: Number.POSITIVE_INFINITY }, "non_finite_number"],
    [{ value: Number.MAX_SAFE_INTEGER + 1 }, "unsafe_integral_number"],
  ]) {
    assert.throws(
      () => installedIJson.admitIJsonValue(value),
      (error) => error instanceof installedIJson.IJsonAdmissionError &&
        error.code === code,
    );
  }
  assert.deepEqual(environment.store.readAll(), beforeEvents);
});
