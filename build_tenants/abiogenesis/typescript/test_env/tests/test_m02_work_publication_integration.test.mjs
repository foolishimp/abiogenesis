// Validates: REQ-L-GTL3-MODULE
// Validates: REQ-L-GTL3-JOB
// Validates: REQ-L-GTL3-ROLE
// Validates: REQ-L-GTL3-IDENTITY
// Validates: REQ-L-GTL3-SELECTION-BOUNDARY
// Validates: REQ-L-GTL3-GRAPHFUNCTION

import test from "node:test";
import assert from "node:assert/strict";

import { edge, graphFunctionForVector } from "../../build/semantic/code/src/gtl/m01/algebra/core.js";
import { admitNode } from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  admitModule,
  admitRole
} from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import { serializeModule } from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";

function designNode(overrides = {}) {
  return {
    id: "node-m02-design",
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
    id: "node-m02-code",
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

function reviewerRolePayload(overrides = {}) {
  return {
    id: "role-reviewer",
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

function moduleImportPayload(overrides = {}) {
  return {
    source: "abiogenesis.core",
    names: ["design_profile"],
    version: "1.0.0",
    ...overrides
  };
}

test("M02 integration: module publication preserves graph-function-first work truth across replay", async () => {
  const design = admitNode(designNode());
  const code = admitNode(codeNode());
  const publishedCarrier = graphFunctionForVector(
    edge([design], code, {
      id: "graph-m02-design-code",
      name: "design→code",
      declarations: {
        entries: [
          {
            key: "visibility",
            value: {
              kind: "scalar",
              value: "published"
            }
          }
        ]
      }
    }).vectors[0],
    {
      id: "graph-function-design-profile",
      name: "design_profile",
      declarations: {
        entries: [
          {
            key: "publication",
            value: {
              kind: "scalar",
              value: "module"
            }
          }
        ]
      }
    }
  );
  const reviewerRole = reviewerRolePayload();

  const admitted = admitModule({
    name: "abiogenesis.design_library",
    graphs: [publishedCarrier.template.graph],
    graphFunctions: [publishedCarrier],
    refinementBoundaries: [
      {
        id: "boundary-design-code",
        name: "design→code",
        inputs: [designNode()],
        outputs: [codeNode()],
        hints: {
          entries: [
            {
              key: "family",
              value: {
                kind: "scalar",
                value: "design_profiles"
              }
            }
          ]
        },
        tags: ["selection"]
      }
    ],
    candidateFamilies: [
      {
        id: "family-design-profiles",
        name: "design_profiles",
        inputs: [designNode()],
        outputs: [codeNode()],
        candidates: [publishedCarrier],
        policyHints: {
          entries: [
            {
              key: "default",
              value: {
                kind: "scalar",
                value: "design_profile"
              }
            }
          ]
        },
        tags: ["selection"]
      }
    ],
    jobs: [
      {
        id: "job-design-code",
        name: "design→code",
        contracts: [
          {
            kind: "graph_function",
            targetId: publishedCarrier.id
          }
        ],
        roles: [reviewerRole],
        tags: ["semantic_work"]
      }
    ],
    roles: [reviewerRole],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [moduleImportPayload()],
    metadata: {
      entries: [
        {
          key: "visibility",
          value: {
            kind: "scalar",
            value: "public"
          }
        }
      ]
    }
  });
  const replayed = admitModule(serializeModule(admitted));

  assert.deepStrictEqual(replayed, admitted);
  assert.equal(replayed.graphFunctions[0].id, publishedCarrier.id);
  assert.equal(replayed.jobs[0].contracts[0].kind, "graph_function");
  assert.equal(replayed.jobs[0].contracts[0].targetId, publishedCarrier.id);
  assert.equal(replayed.roles[0].policyHooks.entries[0].key, "authority");
  assert.equal(replayed.candidateFamilies[0].candidates[0].id, publishedCarrier.id);
  assert.equal(replayed.refinementBoundaries[0].name, "design→code");
  assert.equal(replayed.imports[0].source, "abiogenesis.core");

  const root = await import("@abiogenesis/typescript-tenant");
  const m02 = await import("@abiogenesis/typescript-tenant/gtl/m02");

  assert.equal(typeof root.admitModule, "function");
  assert.equal(typeof root.serializeModule, "function");
  assert.equal(root.admitModule, m02.admitModule);
  assert.equal(root.serializeModule, m02.serializeModule);
});

test("M02 integration: semantic jobs bind published graph functions and not hidden selection alternatives", () => {
  const design = admitNode(designNode());
  const code = admitNode(codeNode());
  const directProfile = graphFunctionForVector(
    edge([design], code, {
      id: "graph-m02-direct",
      name: "design→code:direct",
      declarations: { entries: [] }
    }).vectors[0],
    {
      id: "graph-function-direct-profile",
      name: "direct_profile"
    }
  );
  const alternateProfile = graphFunctionForVector(
    edge([design], code, {
      id: "graph-m02-alt",
      name: "design→code:alternate",
      declarations: { entries: [] }
    }).vectors[0],
    {
      id: "graph-function-alternate-profile",
      name: "alternate_profile"
    }
  );

  const admitted = admitModule({
    name: "abiogenesis.selection_library",
    graphs: [directProfile.template.graph, alternateProfile.template.graph],
    graphFunctions: [directProfile, alternateProfile],
    refinementBoundaries: [],
    candidateFamilies: [
      {
        id: "family-selection",
        name: "design_profiles",
        inputs: [designNode()],
        outputs: [codeNode()],
        candidates: [directProfile, alternateProfile],
        policyHints: {
          entries: [
            {
              key: "selection_visible",
              value: {
                kind: "scalar",
                value: true
              }
            }
          ]
        },
        tags: ["selection"]
      }
    ],
    jobs: [
      {
        id: "job-direct-profile",
        name: "direct_profile_job",
        contracts: [
          {
            kind: "graph_function",
            targetId: directProfile.id
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
  });

  assert.equal(admitted.jobs[0].contracts[0].targetId, directProfile.id);
  assert.notEqual(admitted.jobs[0].contracts[0].targetId, admitted.candidateFamilies[0].id);
  assert.deepStrictEqual(
    admitted.candidateFamilies[0].candidates.map((candidate) => candidate.id),
    [directProfile.id, alternateProfile.id]
  );
});
