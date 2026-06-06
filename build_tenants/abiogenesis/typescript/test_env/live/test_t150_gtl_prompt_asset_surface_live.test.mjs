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
