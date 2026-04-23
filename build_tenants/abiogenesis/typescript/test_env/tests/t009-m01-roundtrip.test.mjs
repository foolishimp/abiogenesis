import test from "node:test";
import assert from "node:assert/strict";

import { admitGraphFunction } from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import { serializeGraphFunction } from "../../build/semantic/code/src/gtl/m01/serialization/carriers.js";

test("T-009 roundtrip: admitted graph function preserves declaration truth across publication and replay", () => {
  const admitted = admitGraphFunction({
    name: "repair-intent",
    environment: {
      requires: [
        {
          id: "node-input",
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
        }
      ],
      provides: [
        {
          id: "node-output",
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
        }
      ],
      carries: [
        {
          id: "node-input",
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
        {
          id: "node-output",
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
        }
      ]
    },
    inputs: [
      {
        id: "node-input",
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
      }
    ],
    outputs: [
      {
        id: "node-output",
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
      }
    ],
    template: {
      kind: "inline_graph",
      ref: "inline:repair-intent",
      version: null,
      graph: {
        id: "graph-repair-intent",
        name: "repair-intent-graph",
        inputs: [
          {
            id: "node-input",
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
          }
        ],
        outputs: [
          {
            id: "node-output",
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
          }
        ],
        nodes: [
          {
            id: "node-input",
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
          {
            id: "node-output",
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
          }
        ],
        vectors: [
          {
            id: "vector-repair",
            name: "plan-repair",
            source: [
              {
                id: "node-input",
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
              }
            ],
            target: {
              id: "node-output",
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
            operators: [
              {
                name: "plan-repair",
                regime: "F_P",
                binding: "binding://planner",
                tags: ["planner"]
              }
            ],
            evaluators: [
              {
                name: "attest-plan",
                regime: "F_D",
                description: "plan satisfies declared repair contract",
                binding: "binding://attest-plan",
                tags: ["proof"]
              }
            ],
            contexts: [
              {
                name: "workspace",
                locator: "workspace://repo",
                digest: "sha256:workspace"
              }
            ],
            rule: {
              name: "repair-rule",
              kind: "gate",
              config: {
                entries: [
                  {
                    key: "protocol",
                    value: {
                      kind: "scalar",
                      value: "consensus"
                    }
                  }
                ]
              },
              tags: ["gate"]
            },
            allowsSubwork: false,
            declarations: {
              entries: [
                {
                  key: "dispatch",
                  value: {
                    kind: "hook_ref",
                    value: {
                      ref: "dispatch-hook",
                      config: {
                        entries: [
                          {
                            key: "worker",
                            value: {
                              kind: "scalar",
                              value: "planner"
                            }
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            },
            tags: ["core"]
          }
        ],
        contexts: [
          {
            name: "workspace",
            locator: "workspace://repo",
            digest: "sha256:workspace"
          }
        ],
        rules: [
          {
            name: "repair-rule",
            kind: "gate",
            config: {
              entries: [
                {
                  key: "protocol",
                  value: {
                    kind: "scalar",
                    value: "consensus"
                  }
                }
              ]
            },
            tags: ["gate"]
          }
        ],
        effects: ["plan-output"],
        tags: ["published"]
      }
    },
    effects: ["plan-output"],
    declarations: {
      entries: [
        {
          key: "publication",
          value: {
            kind: "json_blob",
            value: {
              kind: "object",
              entries: [
                {
                  key: "visibility",
                  value: "module"
                }
              ]
            }
          }
        }
      ]
    },
    tags: ["published"],
    id: "graph-function-repair-intent"
  });

  const serialized = serializeGraphFunction(admitted);
  const replayed = admitGraphFunction(serialized);

  assert.deepStrictEqual(replayed, admitted);
  assert.deepStrictEqual(serializeGraphFunction(replayed), serialized);
});
