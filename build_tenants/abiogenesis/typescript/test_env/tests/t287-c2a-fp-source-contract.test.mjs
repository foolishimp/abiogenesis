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

test("C2A F_P call capability refuses a second dispatch before another effect", async () => {
  const { bindActorProcessLeafEffectPort } = await import(
    `${pathToFileURL(code("abg", "actor_process.js")).href}?guard=${Date.now()}`
  );
  const failures = [];
  let storeAccesses = 0;
  const store = new Proxy({}, {
    get() {
      storeAccesses += 1;
      throw new TypeError("actor process touched the store");
    },
  });
  const invalidRequest = deepFreeze({
    implementationRef: "implementation://wrong/fp@5",
  });
  const effects = bindActorProcessLeafEffectPort({
    store,
    executionBasis: {},
    scope: {},
    cCall: {
      cCallRef: "c-call://test/fp/one",
      runId: "run://test/fp/one",
      graphCallId: "graph-call://test/fp/one",
      frameId: "frame://test/fp/one",
      programLocusRef: "locus://test/fp/one",
      taskOrdinal: null,
      attempt: 1,
    },
    inputDigest: DIGEST,
    workerContracts: {
      instructionContractRef: "contract://test/fp/input@5",
      resultContractRef: "contract://test/fp/output@5",
    },
    runtime: {},
    basis: {
      eventTime: "2026-08-15T00:00:00.000Z",
      correlationId: "correlation://test/fp/one",
      causationEventRefs: [],
    },
  });
  for (let ordinal = 0; ordinal < 2; ordinal += 1) {
    try {
      await effects.invokeWorker(invalidRequest);
    } catch (error) {
      failures.push(error);
    }
  }

  assert.equal(failures.length, 2);
  assert.match(
    failures[0].message,
    /actor process request or workspace differs from the admitted execution basis/u,
  );
  assert.equal(
    failures[1].message,
    "one F_P C-call may dispatch exactly one actor invocation",
  );
  assert.equal(storeAccesses, 0);

  const source = await readFile(code("abg", "actor_process.js"), "utf8");
  assert.match(
    source,
    /dispatchClaimed = true;\s*const observation = await invokeActorProcess\(\{[\s\S]*dispatchOrdinal: 1,/u,
  );
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

  const hogSource = await readFile(code("hog", "leaf_execute.js"), "utf8");
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
  const validRawReceipt = deepFreeze({
    kind: "leaf_invocation_receipt",
    schemaVersion: "5.0.0",
    computeRegime: "F_P",
    candidate: invalidRawCandidate,
    actorProcessExchange: exchange,
  });
  const base = {
    resolution,
    value,
    inputDigest,
    failureValueKind: "test_failure",
    verifyAuthority: () => true,
    validateSuccess: (candidate) => candidate?.kind === "expected_success",
    resolveWorkerContracts: () => workerContracts,
    bindProbabilisticEffects: () => deepFreeze({
      occurrence: {
        cCallRef: "c-call://test/fp-owner/1",
        runId: "run://test/fp-owner/1",
        graphCallId: "graph-call://test/fp-owner/1",
        frameId: "frame://test/fp-owner/1",
        programLocusRef: "locus://test/fp-owner/1",
        taskOrdinal: null,
        attempt: 1,
      },
      invokeWorker: async () => exchange,
    }),
  };

  const invalidSuccess = await invokeLeafOwnerBoundary({
    ...base,
    loadImplementation: async () => async () => validRawReceipt,
  });
  assert.equal(invalidSuccess.kind, "closed_leaf_owner_receipt");
  assert.equal(invalidSuccess.candidate.disposition, "failure");
  assert.equal(invalidSuccess.candidate.resultCandidate.failureClass, "malformed_return");
  assert.equal(invalidSuccess.candidate.evidenceCandidates.length, 0);
  assert.equal(invalidSuccess.receipt.candidate, invalidSuccess.candidate);
  assert.doesNotMatch(JSON.stringify(invalidSuccess), /must-not-escape/u);
  assert.equal(Object.isFrozen(invalidSuccess), true);
  assert.equal(Object.isFrozen(invalidSuccess.receipt), true);
  assert.equal(Object.isFrozen(invalidSuccess.candidate), true);

  const thrown = await invokeLeafOwnerBoundary({
    ...base,
    loadImplementation: async () => async () => {
      throw new Error("raw F_P exception");
    },
  });
  assert.equal(thrown.kind, "closed_leaf_owner_receipt");
  assert.equal(thrown.candidate.resultCandidate.failureClass, "implementation_exception");
  assert.equal(thrown.candidate.evidenceCandidates.length, 0);
  assert.equal(thrown.receipt, null);

  const malformed = await invokeLeafOwnerBoundary({
    ...base,
    loadImplementation: async () => async () => ({ raw: "unclosed" }),
  });
  assert.equal(malformed.kind, "closed_leaf_owner_receipt");
  assert.equal(malformed.candidate.resultCandidate.failureClass, "malformed_return");
  assert.equal(malformed.receipt, null);

  let implementationLoaded = false;
  const resolverThrown = await invokeLeafOwnerBoundary({
    ...base,
    resolveWorkerContracts: () => {
      throw new Error("resolver exception");
    },
    loadImplementation: async () => {
      implementationLoaded = true;
      return async () => validRawReceipt;
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
    loadImplementation: async () => async () => validRawReceipt,
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

  const validatorThrown = await invokeLeafOwnerBoundary({
    ...base,
    validateSuccess: () => {
      throw new Error("output validator exception");
    },
    loadImplementation: async () => async () => validRawReceipt,
  });
  assert.equal(validatorThrown.kind, "closed_leaf_owner_receipt");
  assert.equal(
    validatorThrown.candidate.resultCandidate.failureClass,
    "malformed_return",
  );
  assert.equal(validatorThrown.receipt.candidate, validatorThrown.candidate);
  assert.doesNotMatch(JSON.stringify(validatorThrown), /must-not-escape/u);

  const hogSource = await readFile(code("hog", "leaf_execute.js"), "utf8");
  assert.doesNotMatch(hogSource, /resolveProbabilisticWorkerContracts/u);
});
