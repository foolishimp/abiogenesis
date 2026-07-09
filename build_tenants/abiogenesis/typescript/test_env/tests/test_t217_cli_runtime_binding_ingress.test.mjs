// T-211 (P1-12 residue) — the CLI runtime-binding ingress admitters,
// pinned directly (the diff-execution witness caught this change shipped
// unwitnessed by the approving suite — exactly the Review B class the
// T-214 gate exists for). Accept path plus every admitter's typed
// rejection.
import test from "node:test";
import assert from "node:assert/strict";

import { coerceRuntimeBinding } from "../../build/semantic/code/src/cli/command.js";

function validBinding(overrides = {}) {
  return {
    module: { name: "m03_iteration_module" },
    runtimeIdentity: {
      workerId: "worker://t211",
      backendId: "backend://node",
      buildId: "build://typescript",
      resolvedRuntimeRef: "runtime://typescript/node"
    },
    resolvedPolicy: {
      resolvedPolicyBundleRef: "policy://t211",
      defaultRegime: "F_D",
      dispatchRef: null,
      approvalSubjectRef: null
    },
    ...overrides
  };
}

test("T-211 CLI ingress: a lawful binding admits with all three required shapes", () => {
  const binding = coerceRuntimeBinding(validBinding(), "binding://t211");
  assert.equal(binding.module.name, "m03_iteration_module");
  assert.equal(binding.runtimeIdentity.workerId, "worker://t211");
  assert.equal(binding.resolvedPolicy.defaultRegime, "F_D");
});

test("T-211 CLI ingress: each admitted shape rejects AS AUTHORED", () => {
  assert.throws(
    () => coerceRuntimeBinding("not-an-object", "b"),
    /must export an object runtime binding/u
  );
  assert.throws(
    () => coerceRuntimeBinding(validBinding({ module: { name: "" } }), "b"),
    /module.name must be a non-empty string/u
  );
  assert.throws(
    () =>
      coerceRuntimeBinding(
        validBinding({
          runtimeIdentity: {
            workerId: "worker://t211",
            backendId: "backend://node",
            buildId: "",
            resolvedRuntimeRef: "runtime://typescript/node"
          }
        }),
        "b"
      ),
    /runtimeIdentity.buildId must be a non-empty string/u
  );
  assert.throws(
    () =>
      coerceRuntimeBinding(
        validBinding({
          resolvedPolicy: {
            resolvedPolicyBundleRef: "",
            defaultRegime: "F_D",
            dispatchRef: null,
            approvalSubjectRef: null
          }
        }),
        "b"
      ),
    /resolvedPolicyBundleRef must be a non-empty string/u
  );
  assert.throws(
    () =>
      coerceRuntimeBinding(
        validBinding({
          resolvedPolicy: {
            resolvedPolicyBundleRef: "policy://t211",
            defaultRegime: "F_X",
            dispatchRef: null,
            approvalSubjectRef: null
          }
        }),
        "b"
      ),
    /defaultRegime must be one of F_D, F_P, F_H/u
  );
  assert.throws(
    () =>
      coerceRuntimeBinding(
        validBinding({
          resolvedPolicy: {
            resolvedPolicyBundleRef: "policy://t211",
            defaultRegime: "F_D",
            dispatchRef: 7,
            approvalSubjectRef: null
          }
        }),
        "b"
      ),
    /dispatchRef must be a string or null/u
  );
});

test("T-211 CLI ingress: assurance provider and plugin set admit through their shapes", () => {
  const provider = {
    authoritySnapshot: () => null,
    evidenceRows: () => []
  };
  const accepted = coerceRuntimeBinding(
    validBinding({ assuranceProvider: provider, plugins: { fpDispatch: {} } }),
    "b"
  );
  assert.equal(accepted.assuranceProvider, provider);
  assert.ok(accepted.plugins);

  assert.throws(
    () => coerceRuntimeBinding(validBinding({ assuranceProvider: "nope" }), "b"),
    /assuranceProvider must be an object/u
  );
  assert.throws(
    () =>
      coerceRuntimeBinding(validBinding({ assuranceProvider: {} }), "b"),
    /authoritySnapshot must be a function/u
  );
  assert.throws(
    () =>
      coerceRuntimeBinding(
        validBinding({
          assuranceProvider: {
            authoritySnapshot: () => null,
            eventLedgerValid: "yes"
          }
        }),
        "b"
      ),
    /eventLedgerValid must be a function/u
  );
  assert.throws(
    () => coerceRuntimeBinding(validBinding({ plugins: "nope" }), "b"),
    /plugins must be an object/u
  );
  assert.throws(
    () => coerceRuntimeBinding(validBinding({ plugins: { fpDispatch: 7 } }), "b"),
    /plugins.fpDispatch must be a plugin object or factory/u
  );
});
