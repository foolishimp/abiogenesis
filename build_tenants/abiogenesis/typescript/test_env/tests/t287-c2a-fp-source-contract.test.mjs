import assert from "node:assert/strict";
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
  const { invokeLeafOwner } = await import(
    `${pathToFileURL(code("hog", "leaf_owner.js")).href}?guard=${Date.now()}`
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
  const leafPort = {
    resolveProbabilisticWorkerContracts() {
      return {
        instructionContractRef: "contract://test/fp/input@5",
        resultContractRef: "contract://test/fp/output@5",
      };
    },
    async invoke(_resolution, _input, effects) {
      assert.notEqual(effects, null);
      for (let ordinal = 0; ordinal < 2; ordinal += 1) {
        try {
          await effects.invokeWorker(invalidRequest);
        } catch (error) {
          failures.push(error);
        }
      }
      return deepFreeze({
        kind: "leaf_invocation_receipt",
        schemaVersion: "5.0.0",
        computeRegime: "F_P",
        candidate: {
          kind: "leaf_realization_candidate",
          schemaVersion: "5.0.0",
          disposition: "success",
          evidenceCandidates: [],
          resultCandidate: { kind: "test_output", schemaVersion: "5.0.0" },
        },
        actorProcessExchange: null,
      });
    },
  };

  await invokeLeafOwner({
    store,
    executionBasis: {},
    openedTraversalScope: {},
    cCall: {
      cCallRef: "c-call://test/fp/one",
      runId: "run://test/fp/one",
      graphCallId: "graph-call://test/fp/one",
      frameId: "frame://test/fp/one",
      programLocusRef: "locus://test/fp/one",
      taskOrdinal: null,
      attempt: 1,
      implementationRef: "implementation://test/fp@5",
    },
    traversalStop: { computeRegime: "F_P" },
    leafPort,
    implementationResolution: {
      implementationRef: "implementation://test/fp@5",
    },
    input: {},
    inputDigest: DIGEST,
    actorRuntimeBinding: {},
    failureValueKind: "test_failure",
    validateSuccessCandidate: () => true,
    clock: {
      eventTime: "2026-08-15T00:00:00.000Z",
      correlationId: "correlation://test/fp/one",
    },
  });

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

  const source = await readFile(code("hog", "leaf_owner.js"), "utf8");
  assert.match(
    source,
    /dispatchClaimed = true;\s*const observation = await invokeActorProcess\(\{[\s\S]*dispatchOrdinal: 1,/u,
  );
});

test("C2A F_P receipt rejects missing and forged carrier pairs", async () => {
  const { isClosedProbabilisticLeafInvocation } = await import(
    `${pathToFileURL(code("hog", "leaf_invocation_port.js")).href}?receipt=${Date.now()}`
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
