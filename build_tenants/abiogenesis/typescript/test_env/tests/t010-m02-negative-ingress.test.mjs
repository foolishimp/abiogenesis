import test from "node:test";
import assert from "node:assert/strict";

import { edge, graphFunctionForVector } from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import { admitNode } from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  admitContractRef,
  admitModule
} from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";

function designNode(overrides = {}) {
  return {
    id: "node-m02-negative-design",
    name: "Design",
    schema: { kind: "symbolic", ref: "Vector[design]" },
    markov: ["derived"],
    assetSurface: {
      kind: "design",
      requiredContexts: ["workspace"],
      standardsRefs: ["design-standard"],
      outputContractRefs: ["design-contract"]
    },
    tags: ["input"],
    ...overrides
  };
}

function codeNode(overrides = {}) {
  return {
    id: "node-m02-negative-code",
    name: "Code",
    schema: { kind: "symbolic", ref: "Vector[code]" },
    markov: ["implemented"],
    assetSurface: {
      kind: "code",
      requiredContexts: ["workspace"],
      standardsRefs: ["code-standard"],
      outputContractRefs: ["code-contract"]
    },
    tags: ["output"],
    ...overrides
  };
}

function publishedCarrier() {
  const design = admitNode(designNode());
  const code = admitNode(codeNode());
  return graphFunctionForVector(
    edge([design], code, {
      id: "graph-m02-negative",
      name: "design→code:negative",
      declarations: { entries: [] }
    }).vectors[0],
    {
      id: "graph-function-negative-profile",
      name: "negative_profile",
      declarations: { entries: [] }
    }
  );
}

function reviewerRolePayload(overrides = {}) {
  return {
    id: "role-reviewer-negative",
    name: "reviewer",
    tags: ["approval"],
    policyHooks: {
      entries: [
        {
          key: "authority",
          value: {
            kind: "hook_ref",
            value: {
              ref: "hook://authority/reviewer",
              config: {
                entries: [
                  {
                    key: "scope",
                    value: {
                      kind: "scalar",
                      value: "design_review"
                    }
                  }
                ]
              }
            }
          }
        }
      ]
    },
    ...overrides
  };
}

test("T-010 negative proof: semantic work ingress rejects non-graph_function contract refs", () => {
  assert.throws(
    () =>
      admitContractRef({
        kind: "graph_vector",
        targetId: "graph-function-negative-profile"
      }),
    /graph_function/i
  );
});

test("T-010 negative proof: module publication rejects unpublished graph-function targets", () => {
  const published = publishedCarrier();

  assert.throws(
    () =>
      admitModule({
        name: "abiogenesis.invalid_module",
        graphs: [published.template.graph],
        graphFunctions: [published],
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [
          {
            id: "job-invalid-target",
            name: "invalid_target",
            contracts: [
              {
                kind: "graph_function",
                targetId: "graph-function-missing"
              }
            ],
            roles: [reviewerRolePayload()],
            tags: ["semantic_work"]
          }
        ],
        roles: [reviewerRolePayload()],
        operators: [],
        evaluators: [],
        rules: [],
        imports: [],
        metadata: { entries: [] }
      }),
    /unpublished graph function id/i
  );
});

test("T-010 negative proof: module publication rejects open-object hook config bypass", () => {
  const published = publishedCarrier();

  assert.throws(
    () =>
      admitModule({
        name: "abiogenesis.invalid_policy_hooks",
        graphs: [published.template.graph],
        graphFunctions: [published],
        refinementBoundaries: [],
        candidateFamilies: [],
        jobs: [
          {
            id: "job-negative-policy",
            name: "negative_policy",
            contracts: [
              {
                kind: "graph_function",
                targetId: published.id
              }
            ],
            roles: [
              reviewerRolePayload({
                policyHooks: {
                  entries: [
                    {
                      key: "authority",
                      value: {
                        kind: "hook_ref",
                        value: {
                          ref: "hook://authority/reviewer",
                          config: {
                            rogue: true
                          }
                        }
                      }
                    }
                  ]
                }
              })
            ],
            tags: ["semantic_work"]
          }
        ],
        roles: [reviewerRolePayload()],
        operators: [],
        evaluators: [],
        rules: [],
        imports: [],
        metadata: { entries: [] }
      }),
    /entries|plain object|validation/i
  );
});
