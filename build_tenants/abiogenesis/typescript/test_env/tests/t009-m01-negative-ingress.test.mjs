import test from "node:test";
import assert from "node:assert/strict";

import {
  admitGraphFunction,
  admitGraphVector,
  admitNode
} from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";

test("T-009 negative proof: open-object declaration payload fails closed at canonical ingress", () => {
  assert.throws(
    () =>
      admitGraphFunction({
        name: "repair-intent",
        environment: {
          requires: [],
          provides: [],
          carries: []
        },
        inputs: [],
        outputs: [],
        template: {
          kind: "symbolic",
          ref: "repair-intent",
          version: null
        },
        declarations: {
          entries: [
            {
              key: "dispatch",
              value: {
                kind: "hook_ref",
                value: {
                  ref: "dispatch-hook",
                  config: {
                    rogue: true
                  }
                }
              }
            }
          ]
        }
      }),
    /entries|plain object|validation/i
  );
});

test("T-009 negative proof: node without required declaration surfaces fails closed at canonical ingress", () => {
  assert.throws(
    () =>
      admitNode({
        name: "Intent",
        markov: ["incoming"],
        tags: ["entry"]
      }),
    /schema|assetSurface|plain object/i
  );
});

test("T-009 negative proof: graph vector source singular convenience ingress fails closed", () => {
  assert.throws(
    () =>
      admitGraphVector({
        name: "plan-repair",
        source: {
          name: "Intent",
          schema: { kind: "symbolic", ref: "Vector[intent]" },
          markov: ["incoming"],
          assetSurface: {
            kind: "intent",
            requiredContexts: ["workspace"],
            standardsRefs: [],
            outputContractRefs: []
          },
          tags: ["entry"]
        },
        target: {
          name: "RepairPlan",
          schema: { kind: "symbolic", ref: "Vector[repair_plan]" },
          markov: ["planned"],
          assetSurface: {
            kind: "repair_plan",
            requiredContexts: [],
            standardsRefs: ["plan-standard"],
            outputContractRefs: ["repair-plan-contract"]
          },
          tags: ["exit"]
        },
        operators: [],
        evaluators: [],
        contexts: [],
        rule: null,
        allowsSubwork: false,
        declarations: { entries: [] },
        tags: []
      }),
    /source|array/i
  );
});

test("T-009 negative proof: raw callable templates fail closed at canonical ingress", () => {
  assert.throws(
    () =>
      admitGraphFunction({
        name: "repair-intent",
        environment: {
          requires: [],
          provides: [],
          carries: []
        },
        inputs: [],
        outputs: [],
        template() {
          return {
            id: "graph-repair-intent",
            name: "repair-intent-graph",
            inputs: [],
            outputs: [],
            nodes: [],
            vectors: [],
            contexts: [],
            rules: [],
            effects: [],
            tags: []
          };
        },
        declarations: { entries: [] },
        tags: []
      }),
    /template|plain object/i
  );
});
