// Validates: REQ-F-ODDSDLC-033
// Validates: REQ-F-ODDSDLC-053
// Validates: T-091

import test from "node:test";
import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  assertTraversalIntentPackagePressure,
  deriveWorkerHandoffManifest,
  evaluateSdlcComputeStage,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  sha256Text,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

function writeConstraints(root) {
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t091_payload",
      "active_tenant: scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt",
      "    module_structure:",
      "      - payload-core"
    ].join("\n"),
    "utf8"
  );
}

function workspaceWithImportedRequirement() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t091-rich-"));
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeConstraints(root);
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nINT-091: Preserve concrete traversal pressure.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/REQUIREMENTS.md"),
    [
      "# Requirements",
      "",
      "REQ-T091-001: Preserve the concrete source requirement text in every prompt-bearing traversal.",
      "REQ-T091-002: Reject a fulfilled requirement assessment when output coverage is absent."
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function workspaceWithMarkerOnlyRequirement() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t091-lossy-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeConstraints(root);
  writeFileSync(path.join(root, "specification/INTENT.md"), "# Intent\n", "utf8");
  writeFileSync(
    path.join(root, "specification/requirements/01-lossy.md"),
    ["# Lossy Requirements", "", "- REQ-T091-999"].join("\n"),
    "utf8"
  );
  return root;
}

function workspaceWithConsecutiveMarkerOnlyRequirements() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t091-lossy-list-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeConstraints(root);
  writeFileSync(path.join(root, "specification/INTENT.md"), "# Intent\n", "utf8");
  writeFileSync(
    path.join(root, "specification/requirements/01-lossy.md"),
    [
      "# Lossy Requirements",
      "",
      "## Imported Requirement Markers",
      "",
      "- REQ-T091-998",
      "- REQ-T091-999"
    ].join("\n"),
    "utf8"
  );
  return root;
}

function workspaceWithBacktickedImportedLedgerRefs() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t091-ledger-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeConstraints(root);
  writeFileSync(path.join(root, "specification/INTENT.md"), "# Intent\n", "utf8");
  writeFileSync(
    path.join(root, "bootstrap.md"),
    [
      "# Bootstrap",
      "",
      "REQ-T091-010: Parse backticked workspace source refs before treating imported markers as requirement authority."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    [
      "# Imported Sources",
      "",
      "## Source Refs",
      "",
      "- `workspace://bootstrap.md`",
      "",
      "## Imported Requirement Markers",
      "",
      "- REQ-T091-010"
    ].join("\n"),
    "utf8"
  );
  return root;
}

function workspaceWithCanonicalRequirementSection() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t091-section-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeConstraints(root);
  writeFileSync(path.join(root, "specification/INTENT.md"), "# Intent\n", "utf8");
  writeFileSync(
    path.join(root, "specification/requirements/01-acc-requirements.md"),
    [
      "# ACC Requirements",
      "",
      "## REQ-ACC-004",
      "",
      "**Priority**: Critical",
      "**Type**: Functional",
      "**Status**: Pending",
      "",
      "**Description**: A run CANNOT be marked COMPLETE unless accounting verification passes.",
      "",
      "**Acceptance Criteria**:",
      "- Verification runs automatically before completion."
    ].join("\n"),
    "utf8"
  );
  return root;
}

function workspaceWithLocalHeadingRequirement() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t091-local-heading-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeConstraints(root);
  writeFileSync(path.join(root, "specification/INTENT.md"), "# Intent\n", "utf8");
  writeFileSync(
    path.join(root, "specification/requirements/10-product-identity.md"),
    [
      "# Product Identity Requirements",
      "",
      "## R-10.1 Project Identity",
      "",
      "- `project_slug` MUST equal `t091_payload`."
    ].join("\n"),
    "utf8"
  );
  return root;
}

function manifestFor(workspaceRoot) {
  const contract = hookContractByEdgeName("derive_intent_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t091-obligation-payload"
  });
}

function writeOutput(manifest) {
  const content = "# Intent Surface\n\nConcrete requirement pressure was consumed.\n";
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, content, "utf8");
  return sha256Text(content);
}

function reportFor(manifest, obligationAssessments) {
  return {
    kind: "odd_sdlc.worker_result_report",
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: writeOutput(manifest),
    summary: "Generated intent surface.",
    unresolvedReasons: [],
    materializedFiles: [],
    executionEvidence: null,
    obligationAssessments
  };
}

function requirementObligation(manifest, displayId) {
  return manifest.traversalObligationContext.obligations.find(
    (item) =>
      item.obligationKind === "requirement" &&
      item.summary.includes(displayId)
  );
}

test("T-091 derives concrete requirement payload from imported source refs, not only marker ledger IDs", () => {
  const manifest = manifestFor(workspaceWithImportedRequirement());
  const familyPath = path.join(
    manifest.workspaceRoot,
    "specification/requirements/01-t091-requirements.md"
  );
  assert.equal(existsSync(familyPath), false);
  const obligation = requirementObligation(manifest, "REQ-T091-001");

  assert(obligation);
  assert.equal(obligation.payload.status, "concrete");
  assert.match(
    obligation.summary,
    /Preserve the concrete source requirement text/u
  );
  assert(
    obligation.payload.sourceRefs.some((ref) =>
      ref.endsWith("specification/REQUIREMENTS.md")
    )
  );
  assert(
    obligation.payload.sourceDigests.every((digest) =>
      digest.startsWith("sha256:")
    )
  );
  assert(
    obligation.payload.sourceSnippets.some((snippet) =>
      snippet.includes("REQ-T091-001: Preserve")
    )
  );
  assert.doesNotThrow(() => assertTraversalIntentPackagePressure(manifest));
});

test("T-091 rejects marker-only requirement pressure before worker handoff is admitted", () => {
  const manifest = manifestFor(workspaceWithMarkerOnlyRequirement());
  const obligation = requirementObligation(manifest, "REQ-T091-999");

  assert(obligation);
  assert.equal(obligation.payload.status, "reference_only");
  assert.throws(
    () => writeHandoffFiles(manifest),
    new RegExp(
      `traversal obligation payload insufficient: ${obligation.obligationId.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")}`,
      "u"
    )
  );
});

test("T-091 keeps adjacent marker bullets reference-only instead of inventing body text", () => {
  const manifest = manifestFor(workspaceWithConsecutiveMarkerOnlyRequirements());
  const obligations = manifest.traversalObligationContext.obligations.filter(
    (item) => item.obligationKind === "requirement"
  );

  assert.equal(obligations.length, 2);
  assert.deepEqual(
    obligations.map((obligation) => obligation.payload.status),
    ["reference_only", "reference_only"]
  );
  assert.throws(
    () => writeHandoffFiles(manifest),
    /traversal obligation payload insufficient/u
  );
});

test("T-091 expands backticked imported-source workspace refs before requirement obligation derivation", () => {
  const manifest = manifestFor(workspaceWithBacktickedImportedLedgerRefs());
  const obligations = manifest.traversalObligationContext.obligations.filter(
    (item) => item.obligationKind === "requirement"
  );

  assert.equal(obligations.length, 1);
  const obligation = obligations[0];
  assert.match(obligation.summary, /REQ-T091-010/u);
  assert.equal(obligation.payload.status, "concrete");
  assert(
    obligation.payload.sourceRefs.some((ref) => ref.endsWith("/bootstrap.md"))
  );
  assert.equal(
    obligations.some((item) =>
      item.obligationId.includes("stage_00_imported_sources")
    ),
    false
  );
  assert.doesNotThrow(() => writeHandoffFiles(manifest));
});

test("T-091 treats canonical requirement sections with body text as concrete traversal pressure", () => {
  const manifest = manifestFor(workspaceWithCanonicalRequirementSection());
  const obligation = requirementObligation(manifest, "REQ-ACC-004");

  assert(obligation);
  assert.equal(obligation.payload.status, "concrete");
  assert(
    obligation.payload.sourceSnippets.some((snippet) =>
      snippet.includes("A run CANNOT be marked COMPLETE")
    )
  );
  assert.doesNotThrow(() => writeHandoffFiles(manifest));
});

test("T-091 derives concrete payload from local requirement headings after blank lines", () => {
  const manifest = manifestFor(workspaceWithLocalHeadingRequirement());
  const obligation = manifest.traversalObligationContext.obligations.find(
    (item) =>
      item.obligationKind === "requirement" &&
      item.summary.includes("R-010")
  );

  assert(obligation);
  assert.equal(obligation.payload.status, "concrete");
  assert(
    obligation.payload.sourceSnippets.some((snippet) =>
      snippet.includes("R-10.1 Project Identity")
    )
  );
  assert.doesNotThrow(() => writeHandoffFiles(manifest));
});
test("T-091 postflight admits anchored output evidence for requirement coverage", () => {
  const manifest = manifestFor(workspaceWithImportedRequirement());
  const outputRef = `${pathToFileURL(manifest.outputFile).href}#requirement-req-t091-001`;
  const report = reportFor(
    manifest,
    manifest.traversalObligationContext.obligations.map((obligation) => ({
      kind: "sdlc_worker_obligation_assessment",
      obligationId: obligation.obligationId,
      fulfillmentStatus: "fulfilled",
      evidenceRefs:
        obligation.obligationKind === "requirement"
          ? [outputRef]
          : [manifest.outputFile],
      blockingReasons: []
    }))
  );

  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
});

test("T-091 postflight admits generated asset ref as output coverage evidence", () => {
  const manifest = manifestFor(workspaceWithImportedRequirement());
  const outputRef = `asset://${manifest.targetAssetType}@${path
    .relative(manifest.workspaceRoot, manifest.outputFile)
    .split(path.sep)
    .join("/")}#requirement-req-t091-001`;
  const report = reportFor(
    manifest,
    manifest.traversalObligationContext.obligations.map((obligation) => ({
      kind: "sdlc_worker_obligation_assessment",
      obligationId: obligation.obligationId,
      fulfillmentStatus: "fulfilled",
      evidenceRefs:
        obligation.obligationKind === "requirement"
          ? [outputRef]
          : [manifest.outputFile],
      blockingReasons: []
    }))
  );

  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
});
