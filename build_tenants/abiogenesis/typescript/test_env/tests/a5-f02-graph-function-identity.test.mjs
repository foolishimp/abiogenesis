import assert from "node:assert/strict";
import test from "node:test";

import {
  GRAPH_EDGE_HELLO_IDS,
  HELLO_WORLD_IDS,
  SUBSTITUTED_HELLO_IDS,
  admitGraphFunction,
  composeGraphFunctions,
  constructGraphFunction,
  constructHelloWorldModulePublication,
  gateApplication,
  identityApplication,
  identityGraphFunction,
  promoteGraphFunction,
  recurseApplication,
  serializeGraphFunction,
  substituteGraphFunction,
} from "../../build/code/src/gtl/index.js";

const contractRef = "contract://test/a5-f02/identity@5";
const DIGEST = `sha256:${"3".repeat(64)}`;

function publication() {
  return constructHelloWorldModulePublication({
    productId: "product://abiogenesis/a5-f02-identity-proof@5",
    artifactDigest: DIGEST,
    productContentDigest: DIGEST,
    productManifestDigest: DIGEST,
    packageName: "@abiogenesis/typescript-tenant",
    packageVersion: "5.0.0-dev.286",
  });
}

function graphFunctionFor(module, id) {
  const graphFunction = module.graphFunctions.find((candidate) => candidate.id === id);
  assert.notEqual(graphFunction, undefined, id);
  return graphFunction;
}

function generatedVariants() {
  const module = publication();
  const hello = graphFunctionFor(module, HELLO_WORLD_IDS.graphFunctionRef);
  const ordinaryBasis = structuredClone(hello);
  ordinaryBasis.name = "Generated ordinary GraphFunction";
  delete ordinaryBasis.id;
  delete ordinaryBasis.kind;
  delete ordinaryBasis.version;
  const leftIdentity = identityGraphFunction({
    name: "Generated compose left identity",
    contractRef,
  });
  const rightIdentity = identityGraphFunction({
    name: "Generated compose right identity",
    contractRef,
  });
  const outer = graphFunctionFor(module, GRAPH_EDGE_HELLO_IDS.graphFunctionRef);
  const inner = graphFunctionFor(
    module,
    SUBSTITUTED_HELLO_IDS.innerGraphFunctionRef,
  );
  return {
    generic: constructGraphFunction(ordinaryBasis),
    identity: identityGraphFunction({
      name: "Generated identity mutation target",
      contractRef,
    }),
    compose: composeGraphFunctions({
      name: "Generated composed identity",
      left: leftIdentity,
      right: rightIdentity,
    }),
    substitute: substituteGraphFunction({
      name: "Generated substituted GraphFunction",
      outer,
      targetVectorRef: outer.template.edges[0].edgeRef,
      inner,
    }),
    promote: promoteGraphFunction({
      name: "Generated promoted GraphFunction",
      source: hello,
      sourceRef: hello.inputs[0],
      targetRef: hello.outputs[0],
    }),
  };
}

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

test("reserved generated ids cover the complete normalized GraphFunction body", () => {
  const mutations = [
    ["name", (value) => { value.name = `${value.name} changed`; }],
    ["environment", (value) => {
      value.environment.carries.push("contract://test/a5-f02/mutated-carry@5");
    }],
    ["inputs", (value) => {
      value.inputs[0] = "contract://test/a5-f02/mutated-input@5";
    }],
    ["outputs", (value) => {
      value.outputs[0] = "contract://test/a5-f02/mutated-output@5";
    }],
    ["template", (value) => {
      value.template.graphRef = `${value.template.graphRef}/mutated`;
    }],
    ["node term", (value) => {
      value.template.nodes[0].term.inputCarrierRef =
        "contract://test/a5-f02/mutated-node-input@5";
    }],
    ["effects", (value) => {
      value.effects.push("effect://test/a5-f02/mutated@5");
    }],
    ["declarations", (value) => {
      value.declarations["test.a5_f02.mutated"] = "true";
    }],
    ["tags", (value) => { value.tags.push("mutated"); }],
  ];

  for (const [variant, graphFunction] of Object.entries(generatedVariants())) {
    assert.match(
      graphFunction.id,
      /^graph-function:\/\/abiogenesis\/canonical\/[0-9a-f]{64}$/u,
      variant,
    );
    assert.deepEqual(admitGraphFunction(graphFunction), graphFunction, variant);
    for (const [surface, mutate] of mutations) {
      const changed = structuredClone(serializeGraphFunction(graphFunction));
      mutate(changed);
      assert.throws(
        () => admitGraphFunction(changed),
        /canonical authoring identity/u,
        `${variant}/${surface}/object`,
      );
      assert.throws(
        () => admitGraphFunction(JSON.stringify(changed)),
        /canonical authoring identity/u,
        `${variant}/${surface}/text`,
      );
    }
  }
});

test("an authored ref string cannot impersonate the generated self equation", () => {
  const graphFunction = structuredClone(identityGraphFunction({
    name: "Generated self-equation collision target",
    contractRef,
  }));
  graphFunction.template.applications[0] = identityApplication({
    inputContractRef: contractRef,
    outputContractRef: contractRef,
    targetRef: "graph-function://abiogenesis/canonical/self",
  });

  assert.throws(
    () => admitGraphFunction(graphFunction),
    /canonical authoring identity/u,
  );
  assert.throws(
    () => admitGraphFunction(JSON.stringify(graphFunction)),
    /canonical authoring identity/u,
  );
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
