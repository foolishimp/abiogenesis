import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const code = (...segments) => join(root, "build/code/src", ...segments);
const DIGEST = `sha256:${"a".repeat(64)}`;

function deepFreeze(value) {
  if (typeof value !== "object" || value === null || Object.isFrozen(value)) {
    return value;
  }
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

test("C2A F_P effect handoff is one direct exact-prefix ABG invocation", async () => {
  const actorSource = await readFile(code("abg", "actor_process.js"), "utf8");
  const hogSource = await readFile(code("hog", "ccall_lifecycle.js"), "utf8");
  assert.doesNotMatch(actorSource, /bindActorProcessLeafEffectPort|dispatchClaimed|already_dispatched/u);
  assert.match(
    actorSource,
    /admitNonEmptyRuntimeEventTransactionAtDurablePrefix\(\s*input\.store,\s*successorPrefix,/u,
  );
  const intentAdmission = actorSource.match(
    /const intentAdmission = admitNonEmptyRuntimeEventTransactionAtDurablePrefix\([\s\S]*?const \{ startedEvent \} = intentAdmission\.value;/u,
  )?.[0];
  assert.ok(intentAdmission, "actor intent has one exact-prefix transaction segment");
  assert.match(
    intentAdmission,
    /const bindingEvent = admitRuntimeEvent\([\s\S]*?kind: "actor_transport_binding_admitted"[\s\S]*?const startedEvent = admitRuntimeEvent\([\s\S]*?kind: "actor_invocation_started"/u,
  );
  assert.match(
    hogSource,
    /predecessorPrefix: opened\.successorPrefix,[\s\S]*workerContracts: invocation\.workerContracts,[\s\S]*request: invocation\.workerRequest,/u,
  );
  assert.match(
    hogSource,
    /effectResult\.kind === "actor_process_effect_refusal"[\s\S]*effectResult\.successorPrefix/u,
  );
  assert.doesNotMatch(hogSource, /bindProbabilisticEffects|effectAuthority/u);
});

test("C2A F_P receipt rejects missing and forged carrier pairs", async () => {
  const { isClosedProbabilisticLeafInvocation } = await import(
    `${pathToFileURL(code("implementation", "leaf_invocation_port.js")).href}?receipt=${Date.now()}`
  );
  const candidate = deepFreeze({ kind: "test_candidate", schemaVersion: "5.0.0" });
  const receipt = {
    kind: "leaf_invocation_receipt",
    schemaVersion: "5.0.0",
    computeRegime: "F_P",
    candidate,
  };

  assert.equal(isClosedProbabilisticLeafInvocation(deepFreeze({
    ...receipt,
    actorProcessExchange: {
      kind: "actor_process_carrier_validation",
      schemaVersion: "5.0.0",
      disposition: "valid",
      observation: {},
    },
  })), false);

  const forgedPair = {
    kind: "actor_process_carrier_validation",
    schemaVersion: "5.0.0",
    disposition: "valid",
    request: {},
    observation: {},
  };
  assert.equal(isClosedProbabilisticLeafInvocation(deepFreeze({
    ...receipt,
    actorProcessExchange: forgedPair,
  })), false);

  assert.equal(isClosedProbabilisticLeafInvocation({
    ...receipt,
    actorProcessExchange: deepFreeze(forgedPair),
  }), false);
});

test("C2A implementation owner preserves exact exception and malformed-return failures", async () => {
  const { totalizeLeafImplementationFailure } = await import(
    `${pathToFileURL(code("implementation", "leaf_invocation_port.js")).href}?totalization=${Date.now()}`
  );
  const { sha256Canonical } = await import(
    `${pathToFileURL(code("shared", "digests.js")).href}?totalization=${Date.now()}`
  );
  const resolution = {
    computeRegime: "F_D",
    implementationRef: "implementation://test/owner-boundary@5",
    inputContractRef: "contract://test/input@5",
    outputContractRef: "contract://test/output@5",
    modulePath: "build/code/src/implementation/test.js",
    namedSymbol: "execute",
  };
  for (const failureClass of ["implementation_exception", "malformed_return"]) {
    const candidate = totalizeLeafImplementationFailure({
      resolution,
      inputDigest: DIGEST,
      failureValueKind: "test_failure",
      failureClass,
    });
    const suffix = failureClass.replaceAll("_", "-");
    assert.equal(candidate.kind, "leaf_realization_candidate");
    assert.equal(candidate.disposition, "failure");
    assert.equal(
      candidate.diagnosticRef,
      `diagnostic://abiogenesis/implementation/${suffix}@5`,
    );
    assert.deepEqual(candidate.resultCandidate, {
      kind: "test_failure",
      schemaVersion: "5.0.0",
      failureClass,
      diagnosticRef: candidate.diagnosticRef,
    });
    assert.equal(candidate.evidenceCandidates.length, 1);
    assert.deepEqual(candidate.evidenceCandidates[0], {
      kind: "deterministic_evidence_candidate",
      schemaVersion: "5.0.0",
      implementationRef: resolution.implementationRef,
      inputDigest: DIGEST,
      outputDigest: sha256Canonical(candidate.resultCandidate),
    });
    assert.equal(Object.isFrozen(candidate), true);
    assert.equal(Object.isFrozen(candidate.resultCandidate), true);
    assert.equal(Object.isFrozen(candidate.evidenceCandidates), true);
  }

  const hogSource = await readFile(code("hog", "ccall_lifecycle.js"), "utf8");
  assert.doesNotMatch(hogSource, /leaf_realization_candidate/u);
  assert.doesNotMatch(hogSource, /implementation_exception|malformed_return/u);
});

test("C2A owner boundary totalizes F_P resolution and invocation without raw escape", async () => {
  const { invokeLeafOwnerBoundary } = await import(
    `${pathToFileURL(code("implementation", "leaf_invocation_port.js")).href}?owner=${Date.now()}`
  );
  const { validateActorProcessCarrierPair } = await import(
    `${pathToFileURL(code("abg", "actor_process.js")).href}?owner=${Date.now()}`
  );
  const { sha256Canonical } = await import(
    `${pathToFileURL(code("shared", "digests.js")).href}?owner=${Date.now()}`
  );
  const value = deepFreeze({ kind: "test_input", schemaVersion: "5.0.0" });
  const inputDigest = sha256Canonical(value);
  const resolution = deepFreeze({
    computeRegime: "F_P",
    implementationRef: "implementation://test/fp-owner-boundary@5",
    inputContractRef: "contract://test/fp-input@5",
    outputContractRef: "contract://test/fp-output@5",
    modulePath: "implementation/test-fp.js",
    namedSymbol: "realizeTestFp",
  });
  const workerContracts = deepFreeze({
    instructionContractRef: "contract://test/fp-instruction@5",
    resultContractRef: "contract://test/fp-raw-result@5",
  });
  const rawOutput = JSON.stringify({ kind: "raw_output", schemaVersion: "5.0.0" });
  const prompt = "Return one test result.";
  const bytes = (text) =>
    `sha256:${createHash("sha256").update(text).digest("hex")}`;
  const request = {
    actorRef: "actor://test/fp-owner@5",
    workerBindingRef: "worker-binding://test/fp-owner@5",
    implementationRef: resolution.implementationRef,
    inputDigest,
    materializationPlanRef: "materialization-plan://test/fp-owner@5",
    rendererRef: "renderer://test/fp-owner@5",
    instructionContractRef: workerContracts.instructionContractRef,
    resultContractRef: workerContracts.resultContractRef,
    transportLane: "closed_prompt_proof",
    prompt,
    responseJsonSchema: {},
  };
  const observation = {
    actorInvocationRef: "actor-invocation://test/fp-owner/1",
    actorRef: request.actorRef,
    workerBindingRef: request.workerBindingRef,
    implementationRef: request.implementationRef,
    inputDigest,
    materializationPlanRef: request.materializationPlanRef,
    rendererRef: request.rendererRef,
    instructionContractRef: request.instructionContractRef,
    resultContractRef: request.resultContractRef,
    processRef: "process://test/fp-owner/1",
    transportBindingRef: "transport-binding://test/fp-owner/1",
    transportBindingDigest: DIGEST,
    observedOutputDigest: sha256Canonical(JSON.parse(rawOutput)),
    promptDigest: sha256Canonical(prompt),
    transportDigest: DIGEST,
    transportLane: request.transportLane,
    disposition: "success",
    failureClass: null,
    finalOutput: rawOutput,
    processStatus: 0,
    processSignal: null,
    timedOut: false,
    exitObserved: true,
    terminationConfirmed: true,
    signalSequence: [],
    structuredEventCount: 1,
    progressEventCount: 0,
    toolCallCount: 0,
    apiRetryCount: 0,
    stdoutByteLength: 0,
    stderrByteLength: 0,
    artifactDigests: {
      output: bytes(rawOutput),
      prompt: bytes(prompt),
      stderr: bytes(""),
      stdout: bytes(""),
      transport: DIGEST,
    },
  };
  const exchange = validateActorProcessCarrierPair(request, observation);
  assert.equal(exchange.kind, "actor_process_carrier_validation");
  const invalidRawCandidate = deepFreeze({
    kind: "leaf_realization_candidate",
    schemaVersion: "5.0.0",
    disposition: "success",
    evidenceCandidates: [],
    resultCandidate: {
      kind: "invalid_success",
      schemaVersion: "5.0.0",
      secretRawValue: "must-not-escape",
    },
  });
  const occurrence = deepFreeze({
    cCallRef: "c-call://test/fp-owner/1",
    runId: "run://test/fp-owner/1",
    graphCallId: "graph-call://test/fp-owner/1",
    frameId: "frame://test/fp-owner/1",
    programLocusRef: "locus://test/fp-owner/1",
    taskOrdinal: null,
    attempt: 1,
  });
  const prepared = (complete) => deepFreeze({
    kind: "prepared_probabilistic_leaf_invocation",
    schemaVersion: "5.0.0",
    workerRequest: request,
    complete,
  });
  const base = {
    resolution,
    value,
    inputDigest,
    failureValueKind: "test_failure",
    verifyAuthority: () => true,
    validateSuccess: (candidate) => candidate?.kind === "expected_success",
    resolveWorkerContracts: () => workerContracts,
    occurrence,
  };

  const invalidPrepared = await invokeLeafOwnerBoundary({
    ...base,
    loadImplementation: async () => () => prepared(() => invalidRawCandidate),
  });
  assert.equal(
    invalidPrepared.kind,
    "prepared_probabilistic_leaf_owner_invocation",
  );
  const invalidSuccess = invalidPrepared.complete(exchange);
  assert.equal(invalidSuccess.kind, "closed_leaf_owner_receipt");
  assert.equal(invalidSuccess.candidate.disposition, "failure");
  assert.equal(invalidSuccess.candidate.resultCandidate.failureClass, "malformed_return");
  assert.equal(invalidSuccess.candidate.evidenceCandidates.length, 0);
  assert.equal(invalidSuccess.receipt.candidate, invalidSuccess.candidate);
  assert.doesNotMatch(JSON.stringify(invalidSuccess), /must-not-escape/u);
  assert.equal(Object.isFrozen(invalidSuccess), true);
  assert.equal(Object.isFrozen(invalidSuccess.receipt), true);
  assert.equal(Object.isFrozen(invalidSuccess.candidate), true);

  const completionPrepared = await invokeLeafOwnerBoundary({
    ...base,
    loadImplementation: async () => () => prepared(() => {
      throw new Error("completion failed after the effect");
    }),
  });
  assert.equal(
    completionPrepared.kind,
    "prepared_probabilistic_leaf_owner_invocation",
  );
  const completionThrown = completionPrepared.complete(exchange);
  assert.equal(completionThrown.kind, "closed_leaf_owner_receipt");
  assert.equal(completionThrown.effectDisposition, "completed");
  assert.equal(
    completionThrown.candidate.resultCandidate.failureClass,
    "implementation_exception",
  );
  assert.equal(
    completionThrown.receipt.actorProcessExchange,
    exchange,
  );

  const thrown = await invokeLeafOwnerBoundary({
    ...base,
    loadImplementation: async () => () => {
      throw new Error("raw F_P exception");
    },
  });
  assert.equal(thrown.kind, "closed_leaf_owner_receipt");
  assert.equal(thrown.candidate.resultCandidate.failureClass, "implementation_exception");
  assert.equal(thrown.candidate.evidenceCandidates.length, 0);
  assert.equal(thrown.receipt, null);

  const malformed = await invokeLeafOwnerBoundary({
    ...base,
    loadImplementation: async () => () => ({ raw: "unclosed" }),
  });
  assert.equal(malformed.kind, "closed_leaf_owner_receipt");
  assert.equal(malformed.candidate.resultCandidate.failureClass, "malformed_return");
  assert.equal(malformed.receipt, null);

  const openCandidate = {
    kind: "leaf_realization_candidate",
    schemaVersion: "5.0.0",
    disposition: "success",
    evidenceCandidates: [],
    resultCandidate: {
      kind: "expected_success",
      schemaVersion: "5.0.0",
    },
    mutableExtension() {
      return "must-not-escape";
    },
  };
  assert.equal(Object.isFrozen(openCandidate.mutableExtension), false);
  const openPrepared = await invokeLeafOwnerBoundary({
    ...base,
    loadImplementation: async () => () => prepared(() => openCandidate),
  });
  assert.equal(openPrepared.kind, "prepared_probabilistic_leaf_owner_invocation");
  const openOutput = openPrepared.complete(exchange);
  assert.equal(openOutput.kind, "closed_leaf_owner_receipt");
  assert.equal(
    openOutput.candidate.resultCandidate.failureClass,
    "malformed_return",
  );
  assert.equal(openOutput.effectDisposition, "completed");
  assert.equal(openOutput.receipt.candidate, openOutput.candidate);
  assert.equal(Object.hasOwn(openOutput.candidate, "mutableExtension"), false);
  assert.doesNotMatch(JSON.stringify(openOutput), /must-not-escape/u);

  let implementationLoaded = false;
  const resolverThrown = await invokeLeafOwnerBoundary({
    ...base,
    resolveWorkerContracts: () => {
      throw new Error("resolver exception");
    },
    loadImplementation: async () => {
      implementationLoaded = true;
      return () => prepared(() => invalidRawCandidate);
    },
  });
  assert.equal(resolverThrown.kind, "closed_leaf_owner_receipt");
  assert.equal(
    resolverThrown.candidate.resultCandidate.failureClass,
    "implementation_exception",
  );
  assert.equal(resolverThrown.receipt, null);
  assert.equal(implementationLoaded, false);

  const canonicalThrown = await invokeLeafOwnerBoundary({
    ...base,
    value: deepFreeze({ invalidIJson: 1n }),
    inputDigest: DIGEST,
    loadImplementation: async () => () => prepared(() => invalidRawCandidate),
  });
  assert.equal(canonicalThrown.kind, "closed_leaf_owner_receipt");
  assert.equal(
    canonicalThrown.candidate.resultCandidate.failureClass,
    "implementation_exception",
  );
  assert.equal(canonicalThrown.receipt, null);

  const loadThrown = await invokeLeafOwnerBoundary({
    ...base,
    loadImplementation: async () => {
      throw new Error("module load exception");
    },
  });
  assert.equal(loadThrown.kind, "closed_leaf_owner_receipt");
  assert.equal(
    loadThrown.candidate.resultCandidate.failureClass,
    "implementation_exception",
  );
  assert.equal(loadThrown.receipt, null);

  const validatorPrepared = await invokeLeafOwnerBoundary({
    ...base,
    validateSuccess: () => {
      throw new Error("output validator exception");
    },
    loadImplementation: async () => () => prepared(() => invalidRawCandidate),
  });
  assert.equal(
    validatorPrepared.kind,
    "prepared_probabilistic_leaf_owner_invocation",
  );
  const validatorThrown = validatorPrepared.complete(exchange);
  assert.equal(validatorThrown.kind, "closed_leaf_owner_receipt");
  assert.equal(
    validatorThrown.candidate.resultCandidate.failureClass,
    "malformed_return",
  );
  assert.equal(validatorThrown.receipt.candidate, validatorThrown.candidate);
  assert.doesNotMatch(JSON.stringify(validatorThrown), /must-not-escape/u);

  const hogSource = await readFile(code("hog", "ccall_lifecycle.js"), "utf8");
  assert.doesNotMatch(hogSource, /resolveProbabilisticWorkerContracts/u);
});
