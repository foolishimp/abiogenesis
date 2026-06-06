// Validates: T-150
// Validates: REQ-L-GTL3-ASSET-SURFACE

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  admitAssetSurface,
  admitGraphFunction,
  admitNode
} from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  materializeGraphFunction
} from "../../build/semantic/code/src/gtl/m01/contracts/carriers.js";
import {
  serializeGraphFunction,
  serializeNode
} from "../../build/semantic/code/src/gtl/m01/serialization/carriers.js";
import {
  admitModule
} from "../../build/semantic/code/src/gtl/m02/admission/carriers.js";
import {
  serializeModule
} from "../../build/semantic/code/src/gtl/m02/serialization/carriers.js";

function repoSource(relativePath) {
  return readFileSync(
    fileURLToPath(new URL(`../../${relativePath}`, import.meta.url)),
    "utf8"
  );
}

const gtlCarrierSource = repoSource("code/src/gtl/m01/contracts/carriers.ts");
const gtlConstructorSource = repoSource(
  "code/src/gtl/m01/contracts/constructors.ts"
);
const gtlAdmissionSource = repoSource("code/src/gtl/m01/admission/carriers.ts");
const gtlSerializationSource = repoSource(
  "code/src/gtl/m01/serialization/carriers.ts"
);
const m02CarrierSource = repoSource("code/src/gtl/m02/contracts/carriers.ts");
const gtlProductionSource = [
  gtlCarrierSource,
  gtlConstructorSource,
  gtlAdmissionSource,
  gtlSerializationSource
].join("\n");

const forbiddenDownstreamAuthorityTokens = [
  "bootstrap_provenance",
  "intent_fallback",
  "runtime_forensics",
  "sibling_workspace_history",
  "tenant_stack_authority",
  "raw_bootstrap",
  "odd_sdlc",
  "data_mapper"
];
const forbiddenMarkdownParserTokens = [
  "sectionAssetsForRenderedPrompt",
  "rendered Markdown parser",
  "parseMarkdown"
];
const forbiddenPromptTopologyTokens = [
  "interface PromptAsset",
  "interface PromptInvocation",
  "interface PromptClause",
  "interface PromptSection",
  "type PromptAsset",
  "type PromptInvocation",
  "type PromptClause",
  "type PromptSection",
  "constructPromptAsset",
  "admitPromptAsset",
  "serializePromptAsset"
];

function emptyAttrs() {
  return { entries: [] };
}

function promptInputSurface() {
  return {
    kind: "prompt_authority_packet",
    requiredContexts: ["standards-compression"],
    standardsRefs: ["standard://stdo/compressed"],
    outputContractRefs: ["contract://prompt/input-authority"]
  };
}

function promptInvocationSurface() {
  return {
    kind: "prompt_invocation_asset",
    requiredContexts: ["standards-compression"],
    standardsRefs: ["standard://stdo/compressed"],
    outputContractRefs: ["contract://prompt/invocation"],
    constructorRefs: ["constructor://prompt/invocation/v1"],
    constructorInputAssetKinds: ["prompt_authority_packet", "obligation_set"],
    rendererRefs: ["renderer://prompt/markdown/v1"],
    renderedViewDigestPolicyRef: "digest-policy://prompt/rendered-view/sha256",
    sectionKindRefs: [
      "section-kind://prompt/purpose",
      "section-kind://prompt/authority",
      "section-kind://prompt/output"
    ],
    clauseKindRefs: [
      "clause-kind://prompt/declarative",
      "clause-kind://prompt/fallback",
      "clause-kind://prompt/schema"
    ],
    authoritySlots: [
      {
        authorityKindRef: "authority-kind://downstream/product-definition",
        disposition: "normal"
      },
      {
        authorityKindRef: "authority-kind://downstream/provenance-fallback",
        disposition: "bounded_fallback",
        fallbackPreconditionRefs: [
          "fallback-precondition://prompt/named-unresolved-provenance-gap"
        ]
      },
      {
        authorityKindRef: "authority-kind://downstream/sibling-history",
        disposition: "forbidden_routine"
      }
    ],
    proofObligationRefs: [
      "proof://prompt/rendered-line-provenance",
      "proof://prompt/no-routine-fallback"
    ]
  };
}

function promptAssessmentSurface() {
  return {
    kind: "prompt_assessment_asset",
    requiredContexts: ["standards-compression"],
    standardsRefs: ["standard://stdo/compressed"],
    outputContractRefs: ["contract://prompt/assessment"],
    constructorRefs: ["constructor://prompt/assessment/v1"],
    constructorInputAssetKinds: ["prompt_invocation_asset"],
    rendererRefs: [],
    renderedViewDigestPolicyRef: null,
    sectionKindRefs: [],
    clauseKindRefs: [],
    authoritySlots: [
      {
        authorityKindRef: "authority-kind://downstream/evaluation-evidence",
        disposition: "normal"
      }
    ],
    proofObligationRefs: ["proof://prompt/assessment-schema"]
  };
}

function node(name, schemaRef, assetSurface) {
  return {
    id: `node:${name}`,
    name,
    schema: { kind: "symbolic", ref: schemaRef },
    markov: [`${name}:declared`],
    assetSurface,
    tags: ["t150"]
  };
}

function operator(name) {
  return {
    name,
    regime: "F_P",
    binding: `binding://${name}`,
    tags: ["prompt-chain"]
  };
}

function evaluator(name) {
  return {
    name,
    regime: "F_D",
    description: "shape validation over typed asset surface",
    binding: `binding://${name}`,
    consumedFieldRefs: [],
    tags: ["prompt-chain"]
  };
}

function vector(name, source, target) {
  return {
    id: `vector:${name}`,
    name,
    source,
    target,
    operators: [operator(name)],
    evaluators: [evaluator(`${name}-shape`)],
    contexts: [
      {
        name: "standards-compression",
        locator: "workspace://.abiogenesis/docs/standards/authority_compressions/stdo_compressed.md",
        digest: "sha256:standards"
      }
    ],
    rule: null,
    allowsSubwork: false,
    declarations: emptyAttrs(),
    tags: ["t150", "prompt-chain"]
  };
}

function promptChainGraphFunction() {
  const authorityPacket = node(
    "PromptAuthorityPacket",
    "schema://gtl/prompt_authority_packet",
    promptInputSurface()
  );
  const promptInvocation = node(
    "PromptInvocation",
    "schema://gtl/prompt_invocation_asset",
    promptInvocationSurface()
  );
  const promptAssessment = node(
    "PromptAssessment",
    "schema://gtl/prompt_assessment_asset",
    promptAssessmentSurface()
  );
  const constructPrompt = vector(
    "construct-prompt-invocation",
    [authorityPacket],
    promptInvocation
  );
  const evaluatePrompt = vector(
    "evaluate-prompt-invocation",
    [promptInvocation],
    promptAssessment
  );
  const graph = {
    id: "graph:t150-prompt-chain",
    name: "t150-prompt-chain",
    inputs: [authorityPacket],
    outputs: [promptAssessment],
    nodes: [authorityPacket, promptInvocation, promptAssessment],
    vectors: [constructPrompt, evaluatePrompt],
    contexts: constructPrompt.contexts,
    rules: [],
    effects: ["prompt-rendered-view", "prompt-assessment"],
    tags: ["t150", "prompt-chain"]
  };
  return {
    id: "graph-function:t150-prompt-chain",
    name: "t150-prompt-chain",
    environment: {
      requires: [authorityPacket],
      provides: [promptAssessment],
      carries: [authorityPacket, promptInvocation, promptAssessment]
    },
    inputs: [authorityPacket],
    outputs: [promptAssessment],
    template: {
      kind: "inline_graph",
      ref: "inline:t150-prompt-chain",
      version: null,
      graph
    },
    effects: ["prompt-rendered-view", "prompt-assessment"],
    declarations: emptyAttrs(),
    tags: ["t150", "prompt-chain"]
  };
}

test("T-150 defaults preserve existing minimal asset surfaces", () => {
  const admitted = admitNode(
    node("MinimalAsset", "schema://gtl/minimal", {
      kind: "minimal",
      requiredContexts: [],
      standardsRefs: [],
      outputContractRefs: []
    })
  );
  assert.deepEqual(admitted.assetSurface.constructorRefs, []);
  assert.deepEqual(admitted.assetSurface.rendererRefs, []);
  assert.deepEqual(admitted.assetSurface.authoritySlots, []);
  assert.equal(admitted.assetSurface.renderedViewDigestPolicyRef, null);
  assert.deepEqual(admitNode(serializeNode(admitted)), admitted);
});

test("T-150 admits renderer-backed prompt asset surface declaration shape", () => {
  const admitted = admitAssetSurface(promptInvocationSurface());
  assert.equal(admitted.kind, "prompt_invocation_asset");
  assert.deepEqual(admitted.constructorRefs, [
    "constructor://prompt/invocation/v1"
  ]);
  assert.deepEqual(admitted.rendererRefs, ["renderer://prompt/markdown/v1"]);
  assert.equal(admitted.authoritySlots.length, 3);
  assert.equal(admitted.authoritySlots[1].disposition, "bounded_fallback");
  assert.deepEqual(admitted.authoritySlots[1].fallbackPreconditionRefs, [
    "fallback-precondition://prompt/named-unresolved-provenance-gap"
  ]);
});

test("T-150 rejects malformed authority-slot declaration shape", () => {
  assert.throws(
    () =>
      admitAssetSurface({
        ...promptInvocationSurface(),
        authoritySlots: [
          {
            authorityKindRef: "authority-kind://downstream/fallback",
            disposition: "bounded_fallback"
          }
        ]
      }),
    /bounded_fallback authority slots require/u
  );

  assert.throws(
    () =>
      admitAssetSurface({
        ...promptInvocationSurface(),
        authoritySlots: [
          {
            authorityKindRef: "authority-kind://downstream/normal",
            disposition: "normal",
            fallbackPreconditionRefs: ["fallback-precondition://invalid"]
          }
        ]
      }),
    /only valid on bounded_fallback/u
  );

  assert.throws(
    () =>
      admitAssetSurface({
        ...promptInvocationSurface(),
        authoritySlots: [
          {
            authorityKindRef: "authority-kind://downstream/normal",
            disposition: "bootstrap_provenance"
          }
        ]
      }),
    /unsupported asset-surface authority slot disposition/u
  );
});

test("T-150 GTL source carries shape only, not SDLC authority values or Markdown parsing", () => {
  for (const token of forbiddenDownstreamAuthorityTokens) {
    assert.equal(
      gtlProductionSource.includes(token),
      false,
      `GTL production source must not embed downstream authority token ${token}`
    );
  }
  for (const token of forbiddenMarkdownParserTokens) {
    assert.equal(
      gtlProductionSource.includes(token),
      false,
      `GTL production source must not infer prompt semantics through ${token}`
    );
  }
});

test("T-150 prompt asset surface remains subordinate, not a new GTL topology object", () => {
  for (const token of forbiddenPromptTopologyTokens) {
    assert.equal(
      gtlProductionSource.includes(token),
      false,
      `GTL production source must not add prompt topology token ${token}`
    );
  }
  assert.equal(
    m02CarrierSource.includes("AssetSurface"),
    false,
    "M02 public work publication carriers must not promote AssetSurface as topology"
  );
});

test("T-150 prompt asset surfaces survive a graph-function chain and module publication", () => {
  const admittedGraphFunction = admitGraphFunction(promptChainGraphFunction());
  const materialized = materializeGraphFunction(admittedGraphFunction);
  assert.ok(materialized, "inline graph materializes");
  assert.equal(materialized.vectors.length, 2);

  const promptInvocationNode = materialized.nodes.find(
    (candidate) => candidate.name === "PromptInvocation"
  );
  assert.ok(promptInvocationNode, "prompt invocation node is present");
  assert.equal(
    promptInvocationNode.assetSurface.renderedViewDigestPolicyRef,
    "digest-policy://prompt/rendered-view/sha256"
  );
  assert.equal(promptInvocationNode.assetSurface.authoritySlots.length, 3);

  const serializedGraphFunction = serializeGraphFunction(admittedGraphFunction);
  assert.deepEqual(admitGraphFunction(serializedGraphFunction), admittedGraphFunction);

  const moduleValue = admitModule({
    name: "t150_prompt_module",
    graphs: [materialized],
    graphFunctions: [admittedGraphFunction],
    refinementBoundaries: [],
    candidateFamilies: [],
    jobs: [],
    roles: [],
    operators: [],
    evaluators: [],
    rules: [],
    imports: [],
    policyHooks: emptyAttrs(),
    metadata: emptyAttrs()
  });
  const replayedModule = admitModule(serializeModule(moduleValue));
  assert.deepEqual(replayedModule, moduleValue);
  assert.equal(
    replayedModule.graphFunctions[0].outputs[0].assetSurface.proofObligationRefs[0],
    "proof://prompt/assessment-schema"
  );
});
