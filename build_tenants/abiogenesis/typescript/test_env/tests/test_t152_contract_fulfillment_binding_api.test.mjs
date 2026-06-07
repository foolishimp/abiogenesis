// Validates: REQ-L-GTL3-INTERFACE
// Validates: REQ-L-GTL3-EVALUATOR
// Validates: REQ-R-ABG3-PAYLOAD
// Validates: REQ-R-ABG3-ASSURANCE

import test from "node:test";
import assert from "node:assert/strict";

import {
  admitGtlContractFulfillmentBinding,
  constructGtlContractFulfillmentBinding
} from "../../build/semantic/code/src/gtl/m02/index.js";

function binding(overrides = {}) {
  return constructGtlContractFulfillmentBinding({
    obligationRef: "requirement://t152/hello",
    requirementRef: "requirement://t152/hello",
    productRequirementRef: "requirement://t152/hello",
    designObligationRef: "design://t152/hello",
    componentRef: "component://t152/hello-program",
    productTargetRef: "workspace://src/hello.js",
    outputSurfaceRef: "workspace://design/component_code_surface.md",
    functionOrEntrypointRef: "workspace://src/hello.js#entrypoint",
    realizationEvidenceRefs: ["workspace://src/hello.js"],
    testOrExecutionEvidenceRefs: ["workspace://test/hello.test.js"],
    evaluatorFindingRef: "evaluation-finding://t152/review-grade/hello",
    authorityRefs: ["gtl://target-carrier-contract/t152/component-code"],
    evidenceRefs: ["workspace://design/component_code_surface.md"],
    ...overrides
  });
}

test("T-152 GTL contract fulfillment binding is a frozen deterministic API carrier", () => {
  const first = binding();
  const second = binding();

  assert.equal(first.kind, "gtl_contract_fulfillment_binding");
  assert.equal(Object.isFrozen(first), true);
  assert.equal(first.bindingRef, second.bindingRef);
  assert.equal(first.obligationRef, "requirement://t152/hello");
  assert.deepEqual(first.realizationEvidenceRefs, ["workspace://src/hello.js"]);
});

test("T-152 GTL contract fulfillment binding admits serialized API payloads", () => {
  const admitted = admitGtlContractFulfillmentBinding(binding());

  assert.equal(admitted.kind, "gtl_contract_fulfillment_binding");
  assert.equal(admitted.componentRef, "component://t152/hello-program");
  assert.equal(admitted.outputSurfaceRef, "workspace://design/component_code_surface.md");
});

test("T-152 negative: fulfillment binding rejects missing realization evidence", () => {
  assert.throws(
    () => binding({ realizationEvidenceRefs: [] }),
    /realizationEvidenceRefs must contain at least one ref/u
  );
});

test("T-152 negative: fulfillment binding rejects engine authority fields", () => {
  assert.throws(
    () => binding({ closureDecision: "close" }),
    /cannot own engine authority/u
  );
  assert.throws(
    () =>
      admitGtlContractFulfillmentBinding({
        ...binding(),
        closureDecision: "close"
      }),
    /cannot own engine authority/u
  );
});
