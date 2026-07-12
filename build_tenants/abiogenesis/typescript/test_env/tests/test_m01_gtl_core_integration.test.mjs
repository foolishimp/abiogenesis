// Validates: REQ-L-GTL3-ATTRS
// Validates: REQ-L-GTL3-CONTEXT
// Validates: REQ-L-GTL3-GRAPH
// Validates: REQ-L-GTL3-NODE
// Validates: REQ-L-GTL3-GRAPHVECTOR
// Validates: REQ-L-GTL3-GRAPHFUNCTION
// Validates: REQ-L-GTL3-HOOKS
// Validates: REQ-L-GTL3-INTERFACE
// Validates: REQ-L-GTL3-IDENTITY
// Validates: REQ-L-GTL3-LAWS
// Validates: REQ-L-GTL3-SUBSTITUTE

import test from "node:test";
import assert from "node:assert/strict";

import {
  compose,
  edge,
  gate,
  graphFunctionForVector,
  identity,
  recurse,
  sameObject,
  substitute
} from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import {
  fan_in,
  fan_out,
  hofContract,
  hofUnaryRef,
  hofVector
} from "../../build/semantic/code/src/gtl/m01/algebra/hof.js";
import {
  typedNode,
  typedVectorNode
} from "../../build/semantic/code/src/gtl/m01/algebra/native_node_witness.js";
import {
  interfaceContract,
  materializeGraphFunction,
  materializeTemplateRef,
  nodeContractKey
} from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import {
  admitGraphFunction,
  admitGraphVector,
  admitNode
} from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  serializeGraphFunction,
  serializeGraphVector,
  serializeNode
} from "../../build/semantic/code/src/gtl/m01/serialization/carriers.js";
import {
  graphFunctionApplicationDeclarationFromDeclarations
} from "../../build/semantic/code/src/gtl/m01/contracts/graph_function_application.js";

function intentNode(overrides = {}) {
  return {
    id: "node-intent",
    name: "Intent",
    schema: { kind: "symbolic", ref: "Vector[intent]" },
    markov: ["incoming"],
    assetSurface: {
      kind: "intent",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["entry"],
    ...overrides
  };
}

function repairPlanNode(overrides = {}) {
  return {
    id: "node-repair-plan",
    name: "RepairPlan",
    schema: { kind: "symbolic", ref: "Vector[repair_plan]" },
    markov: ["planned"],
    assetSurface: {
      kind: "repair_plan",
      requiredContexts: [],
      standardsRefs: ["plan-standard"],
      outputContractRefs: ["repair-plan-contract"]
    },
    tags: ["exit"],
    ...overrides
  };
}

function workspaceContext() {
  return {
    name: "workspace",
    locator: "workspace://repo",
    digest: "sha256:workspace"
  };
}

function plannerOperator() {
  return {
    name: "plan-repair",
    regime: "F_P",
    binding: "binding://planner",
    tags: ["planner"]
  };
}

function planEvaluator() {
  return {
    name: "attest-plan",
    regime: "F_D",
    description: "plan satisfies declared repair contract",
    binding: "binding://attest-plan",
    consumedFieldRefs: [],
    tags: ["proof"]
  };
}

function repairRule() {
  return {
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
  };
}

function graphVectorPayload(overrides = {}) {
  return {
    id: "vector-plan-repair",
    name: "plan-repair",
    source: [intentNode()],
    target: repairPlanNode(),
    operators: [plannerOperator()],
    evaluators: [planEvaluator()],
    contexts: [workspaceContext()],
    rule: repairRule(),
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
    tags: ["core"],
    ...overrides
  };
}

function graphFunctionPayload(overrides = {}) {
  return {
    id: "graph-function-repair-intent",
    name: "repair-intent",
    environment: {
      requires: [intentNode()],
      provides: [repairPlanNode()],
      carries: [intentNode(), repairPlanNode()]
    },
    inputs: [intentNode()],
    outputs: [repairPlanNode()],
    template: {
      kind: "inline_graph",
      ref: "inline:repair-intent",
      version: null,
      graph: {
        id: "graph-repair-intent",
        name: "repair-intent-graph",
        inputs: [intentNode()],
        outputs: [repairPlanNode()],
        nodes: [intentNode(), repairPlanNode()],
        vectors: [graphVectorPayload()],
        contexts: [workspaceContext()],
        rules: [repairRule()],
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
    ...overrides
  };
}

function omitId(payload) {
  const { id: _ignored, ...rest } = payload;
  return rest;
}

function declarationEntry(attrs, key) {
  return attrs.entries.find((entry) => entry.key === key);
}

function jsonObjectValueField(value, key) {
  assert.equal(value.kind, "object");
  const field = value.entries.find((candidate) => candidate.key === key);
  assert.ok(field);
  return field;
}

function jsonObjectField(entry, key) {
  assert.equal(entry.value.kind, "json_blob");
  return jsonObjectValueField(entry.value.value, key);
}

function scalarFieldValue(entry, key) {
  const field = jsonObjectField(entry, key);
  assert.notEqual(typeof field.value, "object");
  return field.value;
}

function scalarObjectValueField(value, key) {
  const field = jsonObjectValueField(value, key);
  assert.notEqual(typeof field.value, "object");
  return field.value;
}

function assertFrozen(value, label) {
  assert.ok(Object.isFrozen(value), `${label} must be frozen`);
}

test("M01 integration: node asset surface remains part of the visible interface contract", () => {
  const withSchemaContext = admitNode(
    intentNode({
      assetSurface: {
        kind: "intent",
        requiredContexts: ["workspace", "schema"],
        standardsRefs: [],
        outputContractRefs: []
      }
    })
  );
  const withoutSchemaContext = admitNode(intentNode());

  assert.notStrictEqual(
    nodeContractKey(withSchemaContext),
    nodeContractKey(withoutSchemaContext)
  );
  assert.notStrictEqual(
    interfaceContract([withSchemaContext])[0],
    interfaceContract([withoutSchemaContext])[0]
  );

  const replayed = admitNode(serializeNode(withSchemaContext));
  assert.deepStrictEqual(replayed.assetSurface.requiredContexts, [
    "workspace",
    "schema"
  ]);
});

test("M01 integration: omitted ids derive deterministically from admitted carrier truth", () => {
  const firstSource = admitNode(omitId(intentNode()));
  const secondSource = admitNode(omitId(intentNode()));
  const target = admitNode(omitId(repairPlanNode()));

  assert.equal(firstSource.id, secondSource.id);

  const firstEdge = edge([firstSource], target);
  const secondEdge = edge([secondSource], target);

  assert.equal(firstEdge.id, secondEdge.id);
  assert.equal(firstEdge.vectors[0].id, secondEdge.vectors[0].id);

  const firstCarrier = graphFunctionForVector(firstEdge.vectors[0]);
  const secondCarrier = graphFunctionForVector(secondEdge.vectors[0]);

  assert.equal(firstCarrier.id, secondCarrier.id);
  assert.equal(firstCarrier.template.kind, "inline_graph");
  assert.equal(secondCarrier.template.kind, "inline_graph");
  assert.equal(firstCarrier.template.graph.id, secondCarrier.template.graph.id);
});

test("M01 integration: separate admission of equal declaration truth preserves stable equality", () => {
  const first = admitGraphFunction(omitId(graphFunctionPayload()));
  const second = admitGraphFunction(omitId(graphFunctionPayload()));

  assert.notStrictEqual(first, second);
  assert.notStrictEqual(first.template, second.template);
  assert.equal(first.id, second.id);
  assert.ok(sameObject(first, second));
  assert.deepStrictEqual(
    serializeGraphFunction(first),
    serializeGraphFunction(second)
  );
});

test("M01 integration: graph vector preserves contexts and declarations through publication and replay", () => {
  const admitted = admitGraphVector(graphVectorPayload());
  const replayed = admitGraphVector(serializeGraphVector(admitted));

  assert.deepStrictEqual(replayed, admitted);
  assert.deepStrictEqual(replayed.contexts, [workspaceContext()]);
  assert.deepStrictEqual(replayed.declarations.entries, [
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
  ]);
  assert.deepStrictEqual(replayed.operators, [plannerOperator()]);
  assert.deepStrictEqual(replayed.evaluators, [planEvaluator()]);
  assert.deepStrictEqual(replayed.rule, repairRule());
});

test("M01 integration: graph function inline template preserves outer contract through admission and replay", () => {
  const admitted = admitGraphFunction(graphFunctionPayload());
  const replayed = admitGraphFunction(serializeGraphFunction(admitted));

  assert.deepStrictEqual(replayed, admitted);
  assert.deepStrictEqual(
    replayed.environment.requires.map((node) => node.name),
    ["Intent"]
  );
  assert.deepStrictEqual(
    replayed.environment.provides.map((node) => node.name),
    ["RepairPlan"]
  );
  assert.equal(replayed.template.kind, "inline_graph");
});

test("M01 integration: graph function materialization is explicit and preserves outer contract", () => {
  const admitted = admitGraphFunction(graphFunctionPayload());
  const materialized = materializeGraphFunction(admitted);

  assert.deepStrictEqual(materialized.inputs, admitted.inputs);
  assert.deepStrictEqual(materialized.outputs, admitted.outputs);
  assert.deepStrictEqual(
    materialized.vectors.map((vector) => vector.name),
    ["plan-repair"]
  );

  assert.throws(
    () =>
      materializeTemplateRef({
        kind: "symbolic",
        ref: "symbolic:repair-intent",
        graph: null,
        version: null
      }),
    /not directly materializable/i
  );
});

test("M01 integration: package-first tenant entrypoints expose the bounded M01 surface", async () => {
  const root = await import("@abiogenesis/typescript-tenant");
  const m01 = await import("@abiogenesis/typescript-tenant/gtl/m01");

  assert.equal(typeof root.edge, "function");
  assert.equal(typeof root.admitGraphFunction, "function");
  assert.equal(typeof root.materializeGraphFunction, "function");
  assert.equal(typeof root.serializeGraphFunction, "function");
  assert.equal(root.edge, m01.edge);
  assert.equal(root.admitGraphFunction, m01.admitGraphFunction);
  assert.equal(root.materializeGraphFunction, m01.materializeGraphFunction);
  assert.equal(root.serializeGraphFunction, m01.serializeGraphFunction);
});

test("M01 integration: graph function governance hook surfaces remain visible across publication and replay", () => {
  const admitted = admitGraphFunction(
    graphFunctionPayload({
      declarations: {
        entries: [
          {
            key: "evaluation_hook",
            value: {
              kind: "hook_ref",
              value: {
                ref: "hook://evaluation/default",
                config: {
                  entries: [
                    {
                      key: "policy_bundle",
                      value: {
                        kind: "scalar",
                        value: "broad_fp_first_bundle"
                      }
                    }
                  ]
                }
              }
            }
          },
          {
            key: "closure_hook",
            value: {
              kind: "hook_ref",
              value: {
                ref: "hook://closure/default",
                config: {
                  entries: [
                    {
                      key: "requires_review",
                      value: {
                        kind: "scalar",
                        value: true
                      }
                    }
                  ]
                }
              }
            }
          }
        ]
      }
    })
  );
  const replayed = admitGraphFunction(serializeGraphFunction(admitted));

  assert.deepStrictEqual(replayed, admitted);

  const evaluationHook = declarationEntry(replayed.declarations, "evaluation_hook");
  const closureHook = declarationEntry(replayed.declarations, "closure_hook");

  assert.ok(evaluationHook);
  assert.ok(closureHook);
  assert.equal(evaluationHook.value.kind, "hook_ref");
  assert.equal(closureHook.value.kind, "hook_ref");
  assert.equal(evaluationHook.value.value.ref, "hook://evaluation/default");
  assert.equal(closureHook.value.value.ref, "hook://closure/default");
  assert.deepStrictEqual(evaluationHook.value.value.config.entries, [
    {
      key: "policy_bundle",
      value: {
        kind: "scalar",
        value: "broad_fp_first_bundle"
      }
    }
  ]);
  assert.deepStrictEqual(closureHook.value.value.config.entries, [
    {
      key: "requires_review",
      value: {
        kind: "scalar",
        value: true
      }
    }
  ]);
});

test("M01 integration: graph function rejects inline template drift from the declared outer contract", () => {
  assert.throws(
    () =>
      admitGraphFunction(
        graphFunctionPayload({
          template: {
            kind: "inline_graph",
            ref: "inline:repair-intent",
            version: null,
            graph: {
              id: "graph-repair-intent",
              name: "repair-intent-graph",
              inputs: [intentNode()],
              outputs: [
                repairPlanNode({
                  id: "node-review-plan",
                  name: "ReviewPlan",
                  schema: { kind: "symbolic", ref: "Vector[review_plan]" },
                  assetSurface: {
                    kind: "review_plan",
                    requiredContexts: [],
                    standardsRefs: ["review-standard"],
                    outputContractRefs: ["review-plan-contract"]
                  }
                })
              ],
              nodes: [intentNode(), repairPlanNode()],
              vectors: [graphVectorPayload()],
              contexts: [workspaceContext()],
              rules: [repairRule()],
              effects: ["plan-output"],
              tags: ["published"]
            }
          }
        })
      ),
    /preserve outer contract/i
  );
});

test("M01 integration: edge and graphFunctionForVector publish one vector as a public carrier", () => {
  const admittedEdge = edge([intentNode()], repairPlanNode(), {
    contexts: [workspaceContext()],
    rule: repairRule(),
    declarations: {
      entries: [
        {
          key: "dispatch",
          value: {
            kind: "scalar",
            value: "planner"
          }
        }
      ]
    }
  });
  const vector = admittedEdge.vectors[0];
  const carrier = graphFunctionForVector(vector, {
    tags: ["public-carrier"]
  });

  assert.equal(carrier.name, vector.name);
  assert.deepStrictEqual(
    carrier.inputs.map((node) => node.name),
    ["Intent"]
  );
  assert.deepStrictEqual(
    carrier.outputs.map((node) => node.name),
    ["RepairPlan"]
  );
  assert.deepStrictEqual(carrier.tags, ["public-carrier"]);
  assert.equal(carrier.template.kind, "inline_graph");
  assert.deepStrictEqual(carrier.template.graph.vectors, [vector]);
});

test("M01 integration: compose materializes one merged graph program and identity remains neutral", () => {
  const requirements = admitNode({
    id: "node-requirements",
    name: "Requirements",
    schema: { kind: "symbolic", ref: "Vector[requirements]" },
    markov: ["captured"],
    assetSurface: {
      kind: "requirements",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["intermediate"]
  });
  const design = admitNode({
    id: "node-design",
    name: "Design",
    schema: { kind: "symbolic", ref: "Vector[design]" },
    markov: ["derived"],
    assetSurface: {
      kind: "design",
      requiredContexts: ["workspace"],
      standardsRefs: ["design-standard"],
      outputContractRefs: ["design-output-contract"]
    },
    tags: ["intermediate"]
  });
  const designContext = {
    name: "design_surface",
    locator: "workspace://design",
    digest: "sha256:design"
  };

  const captureRequirements = graphFunctionForVector(
    edge([intentNode()], requirements, {
      contexts: [workspaceContext()],
      declarations: { entries: [] }
    }).vectors[0],
    { tags: ["m01"] }
  );
  const synthesizeDesign = graphFunctionForVector(
    edge([intentNode(), requirements], design, {
      name: "requirements→design",
      contexts: [designContext],
      declarations: { entries: [] }
    }).vectors[0],
    {
      name: "requirements_to_design",
      tags: ["m01", "design"]
    }
  );
  const implementCode = graphFunctionForVector(
    edge([requirements, design], repairPlanNode(), {
      name: "design→code",
      declarations: { entries: [] }
    }).vectors[0],
    {
      name: "design_to_code",
      tags: ["m01", "implementation"]
    }
  );

  const executive = compose(captureRequirements, synthesizeDesign, implementCode);
  const neutral = compose(executive, identity(executive.outputs));

  assert.deepStrictEqual(
    executive.inputs.map((node) => node.name),
    ["Intent"]
  );
  assert.deepStrictEqual(
    executive.outputs.map((node) => node.name),
    ["RepairPlan"]
  );
  assert.deepStrictEqual(
    executive.environment.carries.map((node) => node.name),
    ["Intent", "Requirements", "Design", "RepairPlan"]
  );
  assert.equal(executive.template.kind, "inline_graph");
  assert.deepStrictEqual(
    new Set(executive.template.graph.contexts.map((context) => context.name)),
    new Set(["workspace", "design_surface"])
  );
  assert.deepStrictEqual(
    new Set(executive.template.graph.vectors.map((vector) => vector.name)),
    new Set(["Intent→Requirements", "requirements→design", "design→code"])
  );
  assert.ok(sameObject(executive, executive));
  assert.deepStrictEqual(neutral.inputs, executive.inputs);
  assert.deepStrictEqual(neutral.outputs, executive.outputs);
});

test("M01 integration: composition regrouping preserves contract and canonical identity", () => {
  const requirements = admitNode({
    id: "node-requirements-law",
    name: "Requirements",
    schema: { kind: "symbolic", ref: "Vector[requirements]" },
    markov: ["captured"],
    assetSurface: {
      kind: "requirements",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["intermediate"]
  });
  const design = admitNode({
    id: "node-design-law",
    name: "Design",
    schema: { kind: "symbolic", ref: "Vector[design]" },
    markov: ["derived"],
    assetSurface: {
      kind: "design",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["intermediate"]
  });
  const code = admitNode({
    id: "node-code-law",
    name: "Code",
    schema: { kind: "symbolic", ref: "Vector[code]" },
    markov: ["implemented"],
    assetSurface: {
      kind: "code",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["exit"]
  });

  const captureRequirements = graphFunctionForVector(
    edge([intentNode()], requirements, {
      name: "intent→requirements",
      declarations: { entries: [] }
    }).vectors[0]
  );
  const synthesizeDesign = graphFunctionForVector(
    edge([requirements], design, {
      name: "requirements→design",
      declarations: { entries: [] }
    }).vectors[0]
  );
  const implementCode = graphFunctionForVector(
    edge([design], code, {
      name: "design→code",
      declarations: { entries: [] }
    }).vectors[0]
  );

  const leftGrouped = compose(
    compose(captureRequirements, synthesizeDesign),
    implementCode
  );
  const rightGrouped = compose(
    captureRequirements,
    compose(synthesizeDesign, implementCode)
  );

  assert.deepStrictEqual(
    serializeGraphFunction(leftGrouped),
    serializeGraphFunction(rightGrouped)
  );
  assert.ok(sameObject(leftGrouped, rightGrouped));
  assert.deepStrictEqual(
    leftGrouped.environment.carries.map((node) => node.name),
    ["Intent", "Requirements", "Design", "Code"]
  );
});

test("M01 integration: higher-order graph operators preserve explicit vector boundaries and inspectable gate declarations", () => {
  const candidateBranch = admitNode({
    id: "node-candidate-branch",
    name: "CandidateBranch",
    schema: { kind: "symbolic", ref: "CandidateBranch" },
    markov: ["proposed"],
    assetSurface: {
      kind: "candidate_branch",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["member"]
  });
  const candidateBranches = admitNode({
    id: "node-candidate-branches",
    name: "candidate_branches",
    schema: { kind: "symbolic", ref: "Vector[CandidateBranch]" },
    markov: ["harvested"],
    assetSurface: {
      kind: "candidate_branches",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["vector"]
  });
  const judgment = admitNode({
    id: "node-judgment",
    name: "Judgment",
    schema: { kind: "symbolic", ref: "Judgment" },
    markov: ["judged"],
    assetSurface: {
      kind: "judgment",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["member"]
  });
  const judgmentVector = admitNode({
    id: "node-judgment-vector",
    name: "judgment_vector",
    schema: { kind: "symbolic", ref: "Vector[Judgment]" },
    markov: ["judged"],
    assetSurface: {
      kind: "judgment_vector",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["vector"]
  });
  const selectedCandidate = admitNode({
    id: "node-selected-candidate",
    name: "selected_candidate",
    schema: { kind: "symbolic", ref: "Candidate" },
    markov: ["selected"],
    assetSurface: {
      kind: "selected_candidate",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["result"]
  });

  const workerBranch = admitGraphFunction({
    id: "graph-function-worker-branch",
    name: "worker_branch",
    environment: {
      requires: [candidateBranch],
      provides: [judgment],
      carries: [candidateBranch, judgment]
    },
    inputs: [candidateBranch],
    outputs: [judgment],
    template: {
      kind: "symbolic",
      ref: "worker_branch_template",
      version: null
    },
    effects: ["worker_pass"],
    declarations: { entries: [] },
    tags: ["worker"]
  });
  const harvestReducer = admitGraphFunction({
    id: "graph-function-harvest-reducer",
    name: "harvest_reducer",
    environment: {
      requires: [judgmentVector],
      provides: [selectedCandidate],
      carries: [judgmentVector, selectedCandidate]
    },
    inputs: [judgmentVector],
    outputs: [selectedCandidate],
    template: {
      kind: "symbolic",
      ref: "harvest_reducer_template",
      version: null
    },
    effects: ["reduce"],
    declarations: { entries: [] },
    tags: ["reducer"]
  });
  const harvestAcceptance = planEvaluator();
  const harvestGate = admitGraphVector(
    graphVectorPayload({
      id: "vector-harvest-gate",
      name: "harvest-gate",
      source: [judgmentVector],
      target: selectedCandidate,
      declarations: { entries: [] },
      evaluators: [harvestAcceptance],
      operators: [],
      rule: {
        name: "harvest_gate",
        kind: "consensus",
        config: {
          entries: [
            {
              key: "quorum",
              value: {
                kind: "scalar",
                value: 1
              }
            }
          ]
        },
        tags: ["gate"]
      }
    })
  ).rule;

  const candidateBranchWitness = typedNode({
    node: candidateBranch,
    decode: (raw) => raw
  });
  const judgmentWitness = typedNode({ node: judgment, decode: (raw) => raw });
  const selectedCandidateWitness = typedNode({
    node: selectedCandidate,
    decode: (raw) => raw
  });
  const candidateBranchContract = hofContract(candidateBranchWitness);
  const judgmentContract = hofContract(judgmentWitness);
  const candidateBranchesBoundary = hofVector(
    typedVectorNode({
      node: candidateBranches,
      member: candidateBranchWitness,
      decode: (raw) => raw
    })
  );
  const judgmentVectorBoundary = hofVector(
    typedVectorNode({
      node: judgmentVector,
      member: judgmentWitness,
      decode: (raw) => raw
    })
  );
  const workerFanOut = fan_out(
    hofUnaryRef({
      graphFunction: workerBranch,
      input: candidateBranchContract,
      output: judgmentContract
    }),
    {
      over: candidateBranchesBoundary,
      into: judgmentVectorBoundary
    }
  ).graphFunction;

  const harvestFanIn = fan_in(
    hofUnaryRef({
      graphFunction: harvestReducer,
      input: judgmentVectorBoundary,
      output: hofContract(selectedCandidateWitness)
    }),
    judgmentVectorBoundary
  );
  const harvestGated = gate(harvestFanIn, harvestGate, [harvestAcceptance]);
  const harvestProgram = compose(workerFanOut, harvestGated);

  assert.deepStrictEqual(harvestProgram.inputs, [candidateBranches]);
  assert.deepStrictEqual(harvestProgram.outputs, [selectedCandidate]);
  assert.ok(harvestProgram.tags.includes("operator:fan_out"));
  assert.ok(harvestProgram.tags.includes("over:judgment_vector"));
  assert.ok(harvestProgram.tags.includes("rule:harvest_gate"));
  assert.ok(harvestProgram.effects.includes("worker_pass"));
  assert.ok(harvestProgram.effects.includes("reduce"));

  assert.ok(declarationEntry(harvestProgram.declarations, "gtl.hof_application"));

  assert.equal(
    graphFunctionApplicationDeclarationFromDeclarations(harvestProgram.declarations),
    null
  );
  const fanInApplication = graphFunctionApplicationDeclarationFromDeclarations(
    harvestFanIn.declarations
  );
  assert.equal(fanInApplication?.operatorKind, "fan_in");
  assert.equal(fanInApplication?.operandGraphFunctionRef, harvestReducer.id);
  assert.equal(fanInApplication?.overVectorNodeRef, judgmentVector.id);
  const gateApplication = graphFunctionApplicationDeclarationFromDeclarations(
    harvestGated.declarations
  );
  assert.equal(gateApplication?.operatorKind, "gate");
  assert.equal(gateApplication?.operandGraphFunctionRef, harvestFanIn.id);
  assert.equal(gateApplication?.rule.name, "harvest_gate");
});

test("M01 integration: recurse preserves outer contract and exposes inspectable recursion truth", () => {
  const design = admitNode({
    id: "node-design",
    name: "design",
    schema: { kind: "symbolic", ref: "Design" },
    markov: ["derived"],
    assetSurface: {
      kind: "design",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["intermediate"]
  });
  const code = admitNode({
    id: "node-code",
    name: "code",
    schema: { kind: "symbolic", ref: "Code" },
    markov: ["implemented"],
    assetSurface: {
      kind: "code",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["exit"]
  });
  const recurseDone = admitGraphVector(
    graphVectorPayload({
      id: "vector-recurse-termination",
      name: "recurse-termination",
      source: [design],
      target: code,
      declarations: { entries: [] },
      operators: [],
      evaluators: [
        {
          name: "done",
          regime: "F_D",
          description: "recursive work converged",
          binding: "binding://done",
          tags: ["termination"]
        }
      ],
      rule: null
    })
  ).evaluators[0];
  const direct = graphFunctionForVector(
    edge([design], code, {
      name: "design_to_code",
      declarations: { entries: [] }
    }).vectors[0]
  );

  const recursive = recurse(direct, recurseDone, {
    binding: "outer_contract",
    mode: "rebind",
    requiresParentEvaluation: true
  });

  assert.deepStrictEqual(recursive.inputs, direct.inputs);
  assert.deepStrictEqual(recursive.outputs, direct.outputs);
  assert.ok(recursive.tags.includes("termination:done"));
  assert.ok(recursive.tags.includes("foldback:outer_contract"));

  const recursion = graphFunctionApplicationDeclarationFromDeclarations(
    recursive.declarations
  );
  assert.equal(recursion?.operatorKind, "recurse");
  assert.equal(recursion?.operandGraphFunctionRef, direct.id);
  assert.equal(recursion?.terminationEvaluator.name, "done");
  assert.equal(recursion?.foldback.binding, "outer_contract");
  assert.equal(recursion?.foldback.requiresParentEvaluation, true);

  assert.throws(
    () =>
      recurse(direct, recurseDone, {
        binding: "outer_contract",
        mode: "rebind",
        requiresParentEvaluation: false
      }),
    /requiresParentEvaluation|requires_parent_evaluation/i
  );
});

test("M01 integration: recurse preserves cumulative environment for a composed chain", () => {
  const requirements = admitNode({
    id: "node-requirements-recurse",
    name: "Requirements",
    schema: { kind: "symbolic", ref: "Vector[requirements]" },
    markov: ["captured"],
    assetSurface: {
      kind: "requirements",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["intermediate"]
  });
  const design = admitNode({
    id: "node-design-recurse",
    name: "Design",
    schema: { kind: "symbolic", ref: "Vector[design]" },
    markov: ["derived"],
    assetSurface: {
      kind: "design",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["intermediate"]
  });
  const code = admitNode({
    id: "node-code-recurse",
    name: "Code",
    schema: { kind: "symbolic", ref: "Vector[code]" },
    markov: ["implemented"],
    assetSurface: {
      kind: "code",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["exit"]
  });
  const recurseDone = admitGraphVector(
    graphVectorPayload({
      id: "vector-recurse-composed-termination",
      name: "recurse-composed-termination",
      source: [design],
      target: code,
      declarations: { entries: [] },
      operators: [],
      evaluators: [
        {
          name: "done",
          regime: "F_D",
          description: "recursive composed work converged",
          binding: "binding://done",
          tags: ["termination"]
        }
      ],
      rule: null
    })
  ).evaluators[0];

  const captureRequirements = graphFunctionForVector(
    edge([intentNode()], requirements, {
      name: "intent→requirements",
      declarations: { entries: [] }
    }).vectors[0]
  );
  const synthesizeDesign = graphFunctionForVector(
    edge([intentNode(), requirements], design, {
      name: "requirements→design",
      declarations: { entries: [] }
    }).vectors[0],
    {
      name: "requirements_to_design"
    }
  );
  const implementCode = graphFunctionForVector(
    edge([intentNode(), requirements, design], code, {
      name: "design→code",
      declarations: { entries: [] }
    }).vectors[0],
    {
      name: "design_to_code"
    }
  );

  const recursive = recurse(
    compose(captureRequirements, synthesizeDesign, implementCode),
    recurseDone,
    {
      binding: "outer_contract",
      mode: "rebind",
      requiresParentEvaluation: true
    }
  );

  assert.deepStrictEqual(
    recursive.inputs.map((node) => node.name),
    ["Intent"]
  );
  assert.deepStrictEqual(
    recursive.outputs.map((node) => node.name),
    ["Code"]
  );
  assert.deepStrictEqual(
    recursive.environment.requires.map((node) => node.name),
    ["Intent"]
  );
  assert.deepStrictEqual(
    recursive.environment.carries.map((node) => node.name),
    ["Intent", "Requirements", "Design", "Code"]
  );

  const recursion = graphFunctionApplicationDeclarationFromDeclarations(
    recursive.declarations
  );
  assert.equal(recursion?.operatorKind, "recurse");
  assert.equal(recursion?.terminationEvaluator.name, "done");
  assert.equal(recursion?.foldback.binding, "outer_contract");
});

test("M01 integration: public GTL carrier surfaces are frozen immutable values", () => {
  const admitted = admitGraphFunction(omitId(graphFunctionPayload()));

  assertFrozen(admitted, "graph function");
  assertFrozen(admitted.environment, "graph function environment");
  assertFrozen(admitted.environment.requires, "environment.requires");
  assertFrozen(admitted.environment.provides, "environment.provides");
  assertFrozen(admitted.environment.carries, "environment.carries");
  assertFrozen(admitted.inputs, "graph function inputs");
  assertFrozen(admitted.outputs, "graph function outputs");
  assertFrozen(admitted.declarations, "graph function declarations");
  assertFrozen(admitted.declarations.entries, "graph function declaration entries");
  assertFrozen(admitted.tags, "graph function tags");

  assert.throws(() => {
    admitted.tags.push("mutated");
  }, /object is not extensible|read only|frozen/i);
  assert.throws(() => {
    admitted.declarations.entries.push({
      key: "mutation",
      value: {
        kind: "scalar",
        value: "forbidden"
      }
    });
  }, /object is not extensible|read only|frozen/i);

  assert.equal(admitted.template.kind, "inline_graph");
  assertFrozen(admitted.template, "graph function template");
  assertFrozen(admitted.template.graph, "inline graph");
  assertFrozen(admitted.template.graph.inputs, "inline graph inputs");
  assertFrozen(admitted.template.graph.outputs, "inline graph outputs");
  assertFrozen(admitted.template.graph.nodes, "inline graph nodes");
  assertFrozen(admitted.template.graph.vectors, "inline graph vectors");
  assertFrozen(admitted.template.graph.effects, "inline graph effects");
  assertFrozen(admitted.template.graph.tags, "inline graph tags");

  assert.throws(() => {
    admitted.template.graph.vectors.push(admitted.template.graph.vectors[0]);
  }, /object is not extensible|read only|frozen/i);
});

test("M01 integration: first-class operator, evaluator, and rule declarations remain inspectable GTL truth", () => {
  const admitted = admitGraphVector(graphVectorPayload());
  const replayed = admitGraphVector(serializeGraphVector(admitted));

  assert.deepStrictEqual(replayed.operators[0], plannerOperator());
  assert.deepStrictEqual(replayed.evaluators[0], planEvaluator());
  assert.deepStrictEqual(replayed.rule, repairRule());
  assert.equal(replayed.operators[0].binding, "binding://planner");
  assert.equal(
    replayed.evaluators[0].description,
    "plan satisfies declared repair contract"
  );
  assert.equal(replayed.rule?.kind, "gate");
});

test("M01 integration: substitute rewrites by vector identity and derives new graph identity", () => {
  const requirements = admitNode({
    id: "node-requirements",
    name: "Requirements",
    schema: { kind: "symbolic", ref: "Vector[requirements]" },
    markov: ["captured"],
    assetSurface: {
      kind: "requirements",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["intermediate"]
  });
  const featureDecomp = admitNode({
    id: "node-feature-decomp",
    name: "FeatureDecomp",
    schema: { kind: "symbolic", ref: "Vector[feature_decomp]" },
    markov: ["decomposed"],
    assetSurface: {
      kind: "feature_decomp",
      requiredContexts: ["workspace"],
      standardsRefs: ["feature-standard"],
      outputContractRefs: ["feature-output-contract"]
    },
    tags: ["intermediate"]
  });
  const design = admitNode({
    id: "node-design",
    name: "Design",
    schema: { kind: "symbolic", ref: "Vector[design]" },
    markov: ["derived"],
    assetSurface: {
      kind: "design",
      requiredContexts: ["workspace"],
      standardsRefs: ["design-standard"],
      outputContractRefs: ["design-output-contract"]
    },
    tags: ["exit"]
  });

  const coarse = graphVectorPayload({
    id: "vector-requirements-design",
    name: "requirements→design",
    source: [requirements],
    target: design,
    declarations: { entries: [] }
  });
  const passthrough = graphVectorPayload({
    id: "vector-intent-requirements",
    name: "intent→requirements",
    source: [intentNode()],
    target: requirements,
    declarations: { entries: [] }
  });
  const outer = admitGraphFunction({
    name: "delivery",
    environment: {
      requires: [intentNode()],
      provides: [design],
      carries: [intentNode(), requirements, design]
    },
    inputs: [intentNode()],
    outputs: [design],
    template: {
      kind: "inline_graph",
      ref: "inline:delivery",
      version: null,
      graph: {
        id: "graph-delivery",
        name: "delivery",
        inputs: [intentNode()],
        outputs: [design],
        nodes: [intentNode(), requirements, design],
        vectors: [passthrough, coarse],
        contexts: [workspaceContext()],
        rules: [],
        effects: [],
        tags: ["delivery"]
      }
    },
    effects: [],
    declarations: { entries: [] },
    tags: ["delivery"]
  }).template.graph;

  const inner = admitGraphFunction({
    name: "requirements_refined",
    environment: {
      requires: [requirements],
      provides: [design],
      carries: [requirements, featureDecomp, design]
    },
    inputs: [requirements],
    outputs: [design],
    template: {
      kind: "inline_graph",
      ref: "inline:requirements_refined",
      version: null,
      graph: {
        id: "graph-requirements-refined",
        name: "requirements_refined",
        inputs: [requirements],
        outputs: [design],
        nodes: [requirements, featureDecomp, design],
        vectors: [
          graphVectorPayload({
            id: "vector-requirements-feature-decomp",
            name: "requirements→feature_decomp",
            source: [requirements],
            target: featureDecomp,
            declarations: { entries: [] }
          }),
          graphVectorPayload({
            id: "vector-feature-decomp-design",
            name: "feature_decomp→design",
            source: [featureDecomp],
            target: design,
            declarations: { entries: [] }
          })
        ],
        contexts: [workspaceContext()],
        rules: [],
        effects: [],
        tags: ["refined"]
      }
    },
    effects: [],
    declarations: { entries: [] },
    tags: ["refined"]
  }).template.graph;

  const substituted = substitute(outer, coarse.id, inner);

  assert.notEqual(substituted.id, outer.id);
  assert.equal(substituted.name, outer.name);
  assert.deepStrictEqual(
    new Set(substituted.vectors.map((vector) => vector.name)),
    new Set([
      "intent→requirements",
      "requirements→feature_decomp",
      "feature_decomp→design"
    ])
  );
  const surviving = substituted.vectors.filter(
    (vector) => vector.name === "intent→requirements"
  );
  assert.equal(surviving.length, 1);
  assert.equal(surviving[0].id, passthrough.id);
  assert.ok(substituted.tags.includes("substituted:requirements→design"));
});

test("M01 integration: substitute rejects incompatible inner graphs and preserves unrelated vectors", () => {
  const requirements = admitNode({
    id: "node-requirements",
    name: "Requirements",
    schema: { kind: "symbolic", ref: "Vector[requirements]" },
    markov: ["captured"],
    assetSurface: {
      kind: "requirements",
      requiredContexts: ["workspace"],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["intermediate"]
  });
  const design = admitNode({
    id: "node-design",
    name: "Design",
    schema: { kind: "symbolic", ref: "Vector[design]" },
    markov: ["derived"],
    assetSurface: {
      kind: "design",
      requiredContexts: ["workspace"],
      standardsRefs: ["design-standard"],
      outputContractRefs: ["design-output-contract"]
    },
    tags: ["exit"]
  });
  const implementation = admitNode({
    id: "node-implementation",
    name: "Implementation",
    schema: { kind: "symbolic", ref: "Vector[implementation]" },
    markov: ["implemented"],
    assetSurface: {
      kind: "implementation",
      requiredContexts: ["workspace"],
      standardsRefs: ["implementation-standard"],
      outputContractRefs: ["implementation-output-contract"]
    },
    tags: ["intermediate"]
  });
  const review = admitNode({
    id: "node-review",
    name: "Review",
    schema: { kind: "symbolic", ref: "Vector[review]" },
    markov: ["reviewed"],
    assetSurface: {
      kind: "review",
      requiredContexts: ["workspace"],
      standardsRefs: ["review-standard"],
      outputContractRefs: ["review-output-contract"]
    },
    tags: ["exit"]
  });

  const contract = graphVectorPayload({
    id: "vector-requirements-design",
    name: "requirements→design",
    source: [requirements],
    target: design,
    declarations: { entries: [] }
  });
  const passthrough = graphVectorPayload({
    id: "vector-intent-requirements",
    name: "intent→requirements",
    source: [intentNode()],
    target: requirements,
    declarations: { entries: [] }
  });
  const outer = admitGraphFunction({
    name: "delivery",
    environment: {
      requires: [intentNode()],
      provides: [design],
      carries: [intentNode(), requirements, design]
    },
    inputs: [intentNode()],
    outputs: [design],
    template: {
      kind: "inline_graph",
      ref: "inline:delivery",
      version: null,
      graph: {
        name: "delivery",
        inputs: [intentNode()],
        outputs: [design],
        nodes: [intentNode(), requirements, design],
        vectors: [passthrough, contract],
        contexts: [workspaceContext()],
        rules: [],
        effects: [],
        tags: ["delivery"]
      }
    },
    effects: [],
    declarations: { entries: [] },
    tags: ["delivery"]
  }).template.graph;

  const incompatible = admitGraphFunction({
    name: "wrong_detail",
    environment: {
      requires: [requirements],
      provides: [review],
      carries: [requirements, review]
    },
    inputs: [requirements],
    outputs: [review],
    template: {
      kind: "inline_graph",
      ref: "inline:wrong_detail",
      version: null,
      graph: {
        name: "wrong_detail",
        inputs: [requirements],
        outputs: [review],
        nodes: [requirements, review],
        vectors: [],
        contexts: [],
        rules: [],
        effects: [],
        tags: ["wrong"]
      }
    },
    effects: [],
    declarations: { entries: [] },
    tags: ["wrong"]
  }).template.graph;

  assert.throws(
    () => substitute(outer, contract.id, incompatible),
    /not in inner\.outputs/i
  );

  const inner = admitGraphFunction({
    name: "detailed_delivery",
    environment: {
      requires: [requirements],
      provides: [design],
      carries: [requirements, implementation, design]
    },
    inputs: [requirements],
    outputs: [design],
    template: {
      kind: "inline_graph",
      ref: "inline:detailed_delivery",
      version: null,
      graph: {
        name: "detailed_delivery",
        inputs: [requirements],
        outputs: [design],
        nodes: [requirements, implementation, design],
        vectors: [
          graphVectorPayload({
            id: "vector-requirements-implementation",
            name: "requirements→implementation",
            source: [requirements],
            target: implementation,
            declarations: { entries: [] }
          }),
          graphVectorPayload({
            id: "vector-implementation-design",
            name: "implementation→design",
            source: [implementation],
            target: design,
            declarations: { entries: [] }
          })
        ],
        contexts: [],
        rules: [],
        effects: [],
        tags: ["detail"]
      }
    },
    effects: [],
    declarations: { entries: [] },
    tags: ["detail"]
  }).template.graph;

  const substituted = substitute(outer, contract.id, inner);

  assert.deepStrictEqual(
    new Set(substituted.vectors.map((vector) => vector.name)),
    new Set([
      "intent→requirements",
      "requirements→implementation",
      "implementation→design"
    ])
  );
  const surviving = substituted.vectors.find(
    (vector) => vector.name === "intent→requirements"
  );
  assert.equal(surviving?.id, passthrough.id);
});

test("M01 integration: compose rejects structurally incompatible interfaces", () => {
  const reviewNode = admitNode({
    id: "node-review",
    name: "Requirements",
    schema: { kind: "symbolic", ref: "Vector[review]" },
    markov: ["reviewed"],
    assetSurface: {
      kind: "review",
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: []
    },
    tags: ["review"]
  });

  const captureRequirements = graphFunctionForVector(
    edge([intentNode()], repairPlanNode(), {
      name: "intent→repair",
      declarations: { entries: [] }
    }).vectors[0]
  );
  const reviewGate = graphFunctionForVector(
    edge([reviewNode], repairPlanNode(), {
      name: "review→repair",
      declarations: { entries: [] }
    }).vectors[0],
    {
      name: "review_gate"
    }
  );

  assert.throws(
    () => compose(captureRequirements, reviewGate),
    /structurally satisfied|required environment bindings/i
  );
});
