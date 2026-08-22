import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const invocationSource = await readFile(
  new URL("../../code/src/product/invocation.ts", import.meta.url),
  "utf8",
);

test("S02-B2 prebinding grant and actor attribution stay singular and bound", () => {
  assert.match(
    invocationSource,
    /projectDevelopmentSuccessorActorAttribution[\s\S]*sha256Canonical\(\{ actorRef: authorizedActorRef \}\)/u,
  );
  assert.match(
    invocationSource,
    /predecessorWorkspaceBinding:[\s\S]*predecessorWorkspaceAuthority:/u,
  );
  const attributionSource = invocationSource.slice(
    invocationSource.indexOf(
      "export function projectDevelopmentSuccessorActorAttribution",
    ),
  );
  const attributionBody = attributionSource.match(
    /const body = \{[\s\S]*?const attributionDigest =/u,
  );
  assert.ok(attributionBody);
  assert.doesNotMatch(
    attributionBody[0],
    /artifactTruth/u,
  );
  assert.match(
    invocationSource,
    /successorDevelopmentPrebindingAuthority === "eligible"[\s\S]*workspaceBindingRequirement === "forbidden"/u,
  );
  assert.match(
    invocationSource,
    /canonicalJson\(reconstructedProductSet[\s\S]*isExactPrefixArtifactTruthProjection/u,
  );
  assert.match(
    invocationSource,
    /actorAttribution\.actor\.ref !== actorRef/u,
  );
  assert.match(
    invocationSource,
    /approvalRef: prebindingBasis[\s\S]*workspaceBinding\.authorityBasisId/u,
  );
  assert.match(
    invocationSource,
    /authorityBasisRef: prebindingBasis[\s\S]*artifactTruth\.projectionRef/u,
  );
});
