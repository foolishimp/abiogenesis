import assert from "node:assert/strict";
import test from "node:test";

import {
  constructGraphFunction,
  gateApplication,
  identityGraphFunction,
  recurseApplication,
} from "../../build/code/src/gtl/index.js";

const contractRef = "contract://test/a5-f02/identity@5";

test("omitted GraphFunction id is minted deterministically", () => {
  const left = identityGraphFunction({
    name: "Identity label",
    contractRef,
  });
  const right = identityGraphFunction({
    name: "Identity label",
    contractRef,
  });

  assert.equal(left.id, right.id);
  assert.match(left.id, /^graph-function:\/\/abiogenesis\/canonical\/[0-9a-f]{64}$/u);
  assert.notEqual(left.id, left.name);
});

test("omitted GraphFunction id uses canonical semantic-set order", () => {
  const source = identityGraphFunction({
    id: "graph-function://test/a5-f02/canonical-basis@5",
    name: "Canonical basis donor",
    contractRef,
  });
  const { kind: _kind, id: _id, version: _version, ...basis } = source;
  const left = constructGraphFunction({
    ...basis,
    environment: {
      requires: ["contract://test/z", "contract://test/a"],
      provides: ["contract://test/y", "contract://test/b"],
      carries: ["contract://test/x", "contract://test/c"],
    },
    effects: ["effect://test/z", "effect://test/a"],
    tags: ["z", "a"],
  });
  const right = constructGraphFunction({
    ...basis,
    environment: {
      requires: ["contract://test/a", "contract://test/z"],
      provides: ["contract://test/b", "contract://test/y"],
      carries: ["contract://test/c", "contract://test/x"],
    },
    effects: ["effect://test/a", "effect://test/z"],
    tags: ["a", "z"],
  });

  assert.equal(left.id, right.id);
  assert.deepEqual(left, right);
});

test("lawful explicit GraphFunction id is preserved", () => {
  const id = "graph-function://test/a5-f02/explicit@5";
  const graphFunction = identityGraphFunction({
    id,
    name: "Explicit identity label",
    contractRef,
  });

  assert.equal(graphFunction.id, id);
  assert.equal(graphFunction.name, "Explicit identity label");
});

test("human label is never the identity-application target", () => {
  const id = "graph-function://test/a5-f02/target@5";
  const first = identityGraphFunction({
    id,
    name: "First human label",
    contractRef,
  });
  const renamed = identityGraphFunction({
    id,
    name: "Renamed human label",
    contractRef,
  });

  assert.equal(first.template.applications[0].targetRef, id);
  assert.equal(renamed.template.applications[0].targetRef, id);
  assert.notEqual(renamed.template.applications[0].targetRef, renamed.name);
});

test("equal GraphFunction labels with distinct opaque ids remain distinct", () => {
  const left = identityGraphFunction({
    id: "graph-function://test/a5-f02/left@5",
    name: "Shared human label",
    contractRef,
  });
  const right = identityGraphFunction({
    id: "graph-function://test/a5-f02/right@5",
    name: "Shared human label",
    contractRef,
  });

  assert.equal(left.name, right.name);
  assert.notEqual(left.id, right.id);
});

test("semantic evaluator sets derive one application identity", () => {
  const applicationBasis = {
    inputContractRef: "contract://test/input",
    outputContractRef: "contract://test/output",
  };
  const leftGate = gateApplication({
    ...applicationBasis,
    targetRef: "graph-function://test/target",
    ruleRef: "rule://test/gate",
    evaluatorRefs: ["evaluator://test/z", "evaluator://test/a"],
  });
  const rightGate = gateApplication({
    ...applicationBasis,
    targetRef: "graph-function://test/target",
    ruleRef: "rule://test/gate",
    evaluatorRefs: ["evaluator://test/a", "evaluator://test/z"],
  });
  assert.deepEqual(leftGate, rightGate);

  const recurseBasis = {
    ...applicationBasis,
    graphFunctionRef: "graph-function://test/recurse",
    terminationRuleRef: "rule://test/termination",
    terminationFieldRef: "$.terminal",
    foldback: {
      mode: "rebind",
      binding: "$",
      requiresParentEvaluation: true,
    },
    bound: 3,
  };
  const leftRecurse = recurseApplication({
    ...recurseBasis,
    terminationEvaluatorRefs: ["evaluator://test/z", "evaluator://test/a"],
  });
  const rightRecurse = recurseApplication({
    ...recurseBasis,
    terminationEvaluatorRefs: ["evaluator://test/a", "evaluator://test/z"],
  });
  assert.deepEqual(leftRecurse, rightRecurse);
});
