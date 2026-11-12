
import assert from "node:assert/strict";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import test from "node:test";
const packageRoot = process.env.ABI5_D1_BUILD_ROOT ?? resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaVersion = "5.0.0";
test("D1 literal source quotes preserve BOM and non-BMP byte coordinates", async () => {
  const load = name => import(pathToFileURL(join(packageRoot, "build/code/src", name + ".js")).href);
  const [semantic, handoffs, declarations, digests] = await Promise.all([
    "product/semantic_stage", "product/requirement_handoff", "gtl/requirement_handoff", "shared/digests"].map(load));
  const text = "\uFEFFOriginal Ω😀 criterion.\n", bytes = Buffer.from(text), memberRef = "member:literal-source";
  const contextRef = "context:literal-source", member = { memberRef, path: "source/original.txt", byteCount: bytes.length, digest: digests.sha256Bytes(bytes) };
  const declaration = declarations.constructRequirementHandoffDeclaration({ declarationRef: "declaration:literal-source", graphFunctionRef: "graph:literal-source", sourceRoleRef: "role:source",
    context: { contextRef, sourceLocator: "source:fixed", inventoryDigest: digests.sha256Canonical([member]), members: [member] },
    terms: [{ requirementRef: "requirement:original", sourceBindings: [{ contextRef, memberRef, memberDigest: member.digest, startByte: 0, endByte: bytes.length, spanDigest: member.digest }] }],
    fulfillmentBindings: [{ obligationRef: "obligation:original", requirementRef: "requirement:original", realizationContractRef: null, proofContractRef: null, proofPolicyRef: null, proofShapeRef: null }] });
  const input = handoffs.constructRequirementHandoffInput({ kind: "requirement_handoff_input", schemaVersion, declarationRef: declaration.declarationRef, sourceRoleRef: declaration.sourceRoleRef,
    members: [{ memberRef, base64: bytes.toString("base64") }] });
  // Actual immutable declaration/input/candidate constructors. These supplied
  // coordinates are structural unit premises, never authenticated Run credit.
  const hash = digests.sha256Canonical("controlled-coordinate"), basis = { publicationDigest: hash, declarationDigest: digests.sha256Canonical(declaration),
    executionBasisRef: "basis:controlled", executionBasisDigest: hash, programRef: "program:controlled", programDigest: hash,
    graphFunctionRef: declaration.graphFunctionRef, graphFunctionDigest: hash, cCallRef: "call:controlled", cCallDigest: hash,
    implementationResolutionRef: "resolution:controlled", implementationResolutionDigest: hash, predecessorPrefixDigest: hash, predecessorEventCount: 1, inputDigest: digests.sha256Canonical(input) };
  const handoff = handoffs.deriveRequirementHandoffCandidate(input, declaration, basis);assert.ok(handoff);
  const before = digests.sha256Canonical(handoff), displayed = semantic.semanticSourceText(handoff)[0];
  assert.equal(displayed.text, text);assert.equal(Buffer.from(displayed.text).equals(bytes), true);
  for (const quote of [text, "Ω😀", "criterion."]) {
    const span = semantic.groundSemanticSourceQuote(handoff, { memberRef, quote });assert.ok(span);
    assert.equal(span.startByte, bytes.indexOf(Buffer.from(quote)));assert.equal(span.endByte, span.startByte + Buffer.byteLength(quote));
    assert.equal(span.memberDigest, member.digest);assert.equal(span.spanDigest, digests.sha256Bytes(bytes.subarray(span.startByte, span.endByte)));
    assert.equal(bytes.subarray(span.startByte, span.endByte).toString(), quote);
  }
  assert.equal(semantic.groundSemanticSourceQuote(handoff, { memberRef, quote: "absent" }), null);
  assert.equal(semantic.groundSemanticSourceQuote(handoff, { memberRef: "member:foreign", quote: text }), null);
  assert.equal(semantic.groundSemanticSourceQuote(handoff, { memberRef, quote: "\ud800" }), null);
  assert.equal(digests.sha256Canonical(handoff), before, "literal projections do not rewrite bound source bytes or identities");
});

// Retired (T-292 TD-60): the D1 operating-basis projection over 2026-09-16 closed observations; holds only against the event contract of those observations

// Retired (T-292 TD-60): the D1 assessor domain matches its predecessor package over closed observations; input the predecessor package recorded value gone
