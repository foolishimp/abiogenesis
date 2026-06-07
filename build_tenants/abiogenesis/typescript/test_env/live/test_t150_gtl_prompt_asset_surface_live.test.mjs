// Live-style local scenario for T-150.
// Validates: REQ-L-GTL3-ASSET-SURFACE

import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  admitNode
} from "../../build/semantic/code/src/gtl/m01/admission/carriers.js";
import {
  serializeNode
} from "../../build/semantic/code/src/gtl/m01/serialization/carriers.js";
import {
  admitGtlContractFulfillmentBinding,
  constructGtlContractFulfillmentBinding
} from "../../build/semantic/code/src/gtl/m02/index.js";

function sha256Text(value) {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function renderPromptViewFromAssetSurface(node, bodyLines) {
  const surface = node.assetSurface;
  assert.equal(surface.rendererRefs.length, 1);
  assert.equal(surface.renderedViewDigestPolicyRef, "digest-policy://prompt/rendered-view/sha256");
  return [
    `asset-kind: ${surface.kind}`,
    `renderer: ${surface.rendererRefs[0]}`,
    `sections: ${surface.sectionKindRefs.join(", ")}`,
    `clauses: ${surface.clauseKindRefs.join(", ")}`,
    "",
    ...bodyLines
  ].join("\n");
}

function fulfillmentBinding(overrides = {}) {
  return constructGtlContractFulfillmentBinding({
    obligationRef: "requirement://t150/live",
    requirementRef: "requirement://t150/live",
    productRequirementRef: "requirement://t150/live",
    designObligationRef: "design://t150/live",
    componentRef: "component://t150/live-prompt-surface",
    productTargetRef: "workspace://live/prompt_surface",
    outputSurfaceRef: "workspace://live/prompt_surface#asset",
    functionOrEntrypointRef: "workspace://live/prompt_surface#render",
    realizationEvidenceRefs: ["workspace://live/prompt_surface"],
    testOrExecutionEvidenceRefs: [
      "workspace://test_env/live/test_t150_gtl_prompt_asset_surface_live.test.mjs"
    ],
    evaluatorFindingRef: "evaluation-finding://t150/live",
    authorityRefs: ["requirement://REQ-L-GTL3-ASSET-SURFACE"],
    evidenceRefs: ["proof://t150/live"],
    ...overrides
  });
}

test("T-150 live-style prompt asset view renders from admitted GTL asset surface", () => {
  const promptNode = admitNode({
    id: "node:live-prompt-invocation",
    name: "LivePromptInvocation",
    schema: { kind: "symbolic", ref: "schema://gtl/prompt_invocation_asset" },
    markov: ["prompt-invocation:declared"],
    assetSurface: {
      kind: "prompt_invocation_asset",
      requiredContexts: ["standards-compression"],
      standardsRefs: ["standard://stdo/compressed"],
      outputContractRefs: ["contract://prompt/invocation"],
      constructorRefs: ["constructor://prompt/live/v1"],
      constructorInputAssetKinds: ["prompt_authority_packet"],
      rendererRefs: ["renderer://prompt/markdown/v1"],
      renderedViewDigestPolicyRef: "digest-policy://prompt/rendered-view/sha256",
      sectionKindRefs: ["section-kind://prompt/purpose", "section-kind://prompt/output"],
      clauseKindRefs: ["clause-kind://prompt/declarative", "clause-kind://prompt/schema"],
      authoritySlots: [
        {
          authorityKindRef: "authority-kind://product/requirements",
          disposition: "normal"
        },
        {
          authorityKindRef: "authority-kind://product/import-fallback",
          disposition: "bounded_fallback",
          fallbackPreconditionRefs: ["fallback-precondition://named-import-gap"]
        }
      ],
      proofObligationRefs: ["proof://prompt/rendered-view-digest"]
    },
    tags: ["t150", "live-style"]
  });

  const rendered = renderPromptViewFromAssetSurface(promptNode, [
    "Purpose:",
    "- Render from typed GTL asset surface truth.",
    "",
    "Output:",
    "- Produce the declared prompt invocation asset view."
  ]);
  const digest = sha256Text(rendered);

  assert.match(rendered, /asset-kind: prompt_invocation_asset/u);
  assert.match(rendered, /renderer:\/\/prompt\/markdown\/v1/u);
  assert.match(digest, /^sha256:[a-f0-9]{64}$/u);
  assert.deepEqual(admitNode(serializeNode(promptNode)), promptNode);
});

test("T-150 live-style m02 binding API is importable and guard-parity enforced", () => {
  const admitted = admitGtlContractFulfillmentBinding(fulfillmentBinding());

  assert.equal(admitted.kind, "gtl_contract_fulfillment_binding");
  assert.equal(admitted.componentRef, "component://t150/live-prompt-surface");
  assert.throws(
    () => fulfillmentBinding({ closureDecision: "close" }),
    /cannot own engine authority/u
  );
  assert.throws(
    () =>
      admitGtlContractFulfillmentBinding({
        ...admitted,
        terminalKind: "converged"
      }),
    /cannot own engine authority/u
  );
});
