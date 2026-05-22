// Validates: T-130
// Validates: REQ-L-GTL3-HOOKS
// Validates: REQ-R-ABG3-ASSURANCE
// Validates: REQ-R-ABG3-PAYLOAD

import test from "node:test";
import assert from "node:assert/strict";

import {
  HOOK_ACTION_CLASS_VALUES,
  admitHookActionRecord,
  admitHookFindingAdmission,
  assertHookFindingAdmissionMatchesAction,
  constructHookActionRecord,
  constructHookFindingAdmission
} from "../../build/semantic/code/src/abg/m03/index.js";

function hookAction(overrides = {}) {
  return constructHookActionRecord({
    hookActionRef: "hook-action://t130/evaluate/1",
    hookClass: "evaluate",
    hookContractRef: "contract://t130/evaluate",
    pluginRef: "plugin://t130/evaluator",
    inputBasisRefs: ["basis://t130/edge-state"],
    policyRefs: ["policy://t130/evaluate"],
    configRefs: ["config://t130/evaluate"],
    returnedFindingRefs: ["finding://t130/evaluate/1"],
    admissionRefs: ["admission://t130/evaluate/1"],
    predecessorRefs: ["event://t130/predecessor"],
    outputSurfaceRef: "assurance://t130/edge",
    ...overrides
  });
}

function admission(overrides = {}) {
  return constructHookFindingAdmission({
    admissionRef: "admission://t130/evaluate/1",
    hookActionRef: "hook-action://t130/evaluate/1",
    findingRef: "finding://t130/evaluate/1",
    status: "admitted",
    owningSurfaceRef: "assurance://t130/edge",
    evidenceRefs: ["evidence://t130/edge"],
    policyRefs: ["policy://t130/evaluate"],
    predecessorRefs: ["hook-action://t130/evaluate/1"],
    ...overrides
  });
}

test("T-130 hook actions are typed replay-visible records", () => {
  for (const hookClass of HOOK_ACTION_CLASS_VALUES) {
    const record = hookAction({
      hookActionRef: `hook-action://t130/${hookClass}`,
      hookClass,
      returnedFindingRefs: [`finding://t130/${hookClass}`],
      admissionRefs: [`admission://t130/${hookClass}`],
      outputSurfaceRef: `surface://t130/${hookClass}`
    });

    assert.equal(record.kind, "hook_action_record");
    assert.equal(record.hookClass, hookClass);
    assert.equal(Object.isFrozen(record), true);
  }
});

test("T-130 hook action, returned finding, and admission refs form a replay chain", () => {
  const record = hookAction();
  const admitted = admission();

  assertHookFindingAdmissionMatchesAction({
    hookAction: record,
    admission: admitted
  });
  assert.deepEqual(admitted.predecessorRefs, [record.hookActionRef]);
  assert.equal(admitted.status, "admitted");
});

test("T-130 admission parser preserves admitted and rejected findings", () => {
  const admitted = admitHookFindingAdmission({
    kind: "hook_finding_admission",
    admissionRef: "admission://t130/rejected",
    hookActionRef: "hook-action://t130/evaluate/1",
    findingRef: "finding://t130/rejected",
    status: "rejected",
    owningSurfaceRef: "assurance://t130/edge",
    policyRefs: ["policy://t130/evaluate"],
    predecessorRefs: ["hook-action://t130/evaluate/1"],
    reason: "finding attempted to exceed hook contract"
  });

  assert.equal(admitted.status, "rejected");
  assert.equal(admitted.reason, "finding attempted to exceed hook contract");
});

test("T-130 negative: hook action records reject direct engine authority", () => {
  const record = hookAction();

  for (const forbidden of [
    "runtimeEvents",
    "ledger",
    "selectedIntentRef",
    "actorInvocationEvent"
  ]) {
    assert.throws(
      () =>
        admitHookActionRecord({
          ...record,
          [forbidden]: []
        }),
      /cannot own engine authority/i
    );
  }
  assert.throws(
    () =>
      admitHookActionRecord({
        ...record,
        hookClass: "eval_and_close"
      }),
    /expected hook action class/i
  );
  assert.throws(
    () =>
      constructHookActionRecord({
        ...record,
        hookClass: "eval_and_close",
        inputBasisRefs: ["basis://t130/edge-state"]
      }),
    /expected hook action class/i
  );
  assert.throws(
    () =>
      constructHookActionRecord({
        ...record,
        inputBasisRefs: []
      }),
    /expected at least one ref/i
  );
});

test("T-130 negative: hook finding admissions reject projection and closure authority", () => {
  const admitted = admission();

  assert.throws(
    () =>
      admitHookFindingAdmission({
        ...admitted,
        projection: { closed: true }
      }),
    /cannot own engine authority/i
  );
  assert.throws(
    () =>
      admitHookFindingAdmission({
        ...admitted,
        closureDecision: "close"
      }),
    /cannot own engine authority/i
  );
  assert.throws(
    () =>
      constructHookFindingAdmission({
        ...admitted,
        status: "closed"
      }),
    /expected hook finding admission status/i
  );
});

test("T-130 negative: admission must refer to a finding returned by the hook action", () => {
  assert.throws(
    () =>
      assertHookFindingAdmissionMatchesAction({
        hookAction: hookAction(),
        admission: admission({ findingRef: "finding://t130/not-returned" })
      }),
    /not returned by hookactionrecord/i
  );
});
