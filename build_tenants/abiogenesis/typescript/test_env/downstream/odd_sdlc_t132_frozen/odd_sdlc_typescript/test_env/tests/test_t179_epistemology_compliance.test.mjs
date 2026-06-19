// Validates: T-179
// Proves odd_sdlc states and preserves ABIogenesis compute notation as
// epistemology over existing GTL/ABG carriers, not as a new runtime carrier.

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  constructSdlcFpEvaluateResult,
  constructSdlcEdgeFulfillmentLedger,
  constructSdlcNextActionProjection,
  deriveSdlcEdgeClosureDecision,
  deriveSdlcSelectedAbgFnCompositionIdentity
} from "../../build/semantic/code/src/index.js";

const PACKAGE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../..");

function readRepoFile(relativePath) {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

function readPackageFile(relativePath) {
  return readFileSync(path.join(PACKAGE_ROOT, relativePath), "utf8");
}

function assertIncludesAll(text, needles) {
  const normalizedText = normalizeWhitespace(text);
  for (const needle of needles) {
    assert.match(
      normalizedText,
      new RegExp(escapeRegExp(normalizeWhitespace(needle)), "u")
    );
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/gu, " ").trim();
}

function extractTransformPromptSource(handoffSource) {
  const start = handoffSource.indexOf("function promptForHandoffSections");
  assert.notEqual(start, -1);
  const end = handoffSource.indexOf("export function promptForHandoffProjection", start);
  assert.notEqual(end, -1);
  return handoffSource.slice(start, end);
}

function compositionIdentity() {
  return deriveSdlcSelectedAbgFnCompositionIdentity({
    graphFunctionRef: "Fg_t179_runtime_alignment",
    graphVectorRef: "derive_t179_surface",
    compositionSelectionScopeRef: "test://t179/selected-composition",
    carrierContextRefs: ["carrier://t179/source", "carrier://t179/target"],
    assuranceContextRefs: ["assurance://t179/edge"]
  });
}

function assertSelectedCompositionFields(carrier, selected) {
  assert.equal(carrier.selectedComposition.compositionRef, selected.compositionRef);
  assert.equal(carrier.compositionRef, selected.compositionRef);
  assert.equal(carrier.compositionDigest, selected.compositionDigest);
  assert.equal(carrier.compositionSelectionRef, selected.compositionSelectionRef);
}

test("T-179 product surface declares SDLC epistemology over ABG ontology", () => {
  const product = readRepoFile("specification/PRODUCT.md");

  assertIncludesAll(product, [
    "## Ontology And Epistemology",
    "selected `abg.fn_composition`",
    "ABG runtime ontology owns the interpreter truth",
    "`odd_sdlc` product ontology owns the software-domain meaning",
    "`C` is selected composition notation",
    "`C` is not `ComputeUnit`, not `ReliableCompute`",
    "transform.C",
    "evaluate.C",
    "ABG admission",
    "payload ledgers",
    "assurance projection",
    "closure fold",
    "traversal transition",
    "consequence.C",
    "odd_sdlc pressure/query/read-model interpretation",
    "product-owned projections over ABG-admitted facts"
  ]);
});

test("T-179 requirements make the notation non-authoritative and ABG-owned", () => {
  const runtime = readRepoFile("specification/requirements/03-runtime-governance.md");
  const algebra = readRepoFile(
    "specification/requirements/18-typed-construction-algebra.md"
  );

  assertIncludesAll(runtime, [
    "REQ-F-RUNTIME-006",
    "selected `abg.fn_composition`",
    "not a product-local `ComputeUnit`",
    "`transform.C` may produce candidates",
    "shall not emit runtime events, write ledgers, publish projections, select traversal, or",
    "`evaluate.C` produces findings",
    "ABG admission is the boundary",
    "`consequence.C` is a projection reference",
    "product-owned projections over ABG-admitted facts"
  ]);

  assertIncludesAll(algebra, [
    "REQ-F-ODDSDLC-084",
    "GTL edge / selected composition C",
    "transform.C",
    "candidate/evidence refs",
    "evaluate.C",
    "evaluation finding refs",
    "ABG.events / payload ledgers / assurance projection / closure fold",
    "consequence.C",
    "odd_sdlc pressure/query/read-model interpretation",
    "ledger-writing, event-emission",
    "evaluator-publication",
    "closure authority"
  ]);
});

test("T-179 operator guide teaches C notation without hiding ledgers in plugins", () => {
  const gettingStarted = readRepoFile("getting_started.md");

  assertIncludesAll(gettingStarted, [
    "The W / L / E / Ev / C algebra",
    "C / selected composition",
    "`abg.fn_composition`",
    "transform.C",
    "evaluate.C",
    "consequence.C",
    "ABG-owned event and ledger truth",
    "Product pressure views are read models",
    "does not write runtime truth",
    "does not write ledgers, emit events, publish projections",
    "ABG admission and deterministic fold decide runtime truth"
  ]);
});

test("T-179 F_P.transform prompt stays inside transform.C authority", () => {
  const handoffSource = readPackageFile("code/src/operator/plugins/transform/launch_contract.ts");
  const promptSource = extractTransformPromptSource(handoffSource);

  assertIncludesAll(promptSource, [
    "odd_sdlc F_P.transform launch contract.",
    "Primary transform intent:",
    "Apply worker_construction_brief.json as the single prompt source carrier.",
    "Archive package files and manifests are replay/audit projections.",
    "Write only the contracted output/product artifacts, then exit; the framework evaluates the artifact after this process exits.",
    "The framework writes reports, evidence carriers, ledgers, and closure after this process exits."
  ]);

  assert.doesNotMatch(promptSource, /fp_evaluate_result\.json/u);
  assert.doesNotMatch(promptSource, /sdlc_edge_fulfillment_ledger\.json/u);
  assert.doesNotMatch(promptSource, /assurance_ledgers\.json/u);
  assert.doesNotMatch(promptSource, /SdlcEdgeClosureDecision/u);
  assert.doesNotMatch(promptSource, /SdlcNextActionProjection/u);
});

test("T-179 evaluate.C result preserves selected abg.fn_composition identity", () => {
  const archiveRoot = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t179-eval-"));
  const selectedComposition = compositionIdentity();
  const result = constructSdlcFpEvaluateResult({
    manifest: {
      archiveRoot,
      graphFunctionName: "Fg_t179_runtime_alignment",
      edgeName: "derive_t179_surface",
      reportFile: path.join(archiveRoot, "worker_result_report.json"),
      fpTransformRequest: null,
      fpTransformResultFile: path.join(archiveRoot, "fp_transform_result.json")
    },
    selectedComposition,
    report: {
      obligationAssessments: [
        {
          fulfillmentStatus: "fulfilled"
        }
      ],
      executionEvidence: {
        status: "passed"
      }
    },
    postflight: {
      status: "passed",
      blockingReasons: [],
      blockingReasonCarriers: [],
      evidenceRefs: ["evidence://t179/output"]
    },
    postflightRef: "postflight://t179"
  });

  assert.equal(result.computeNotationStage, "evaluate.C");
  assert.equal(result.stage, "F_P.evaluate");
  assert.equal(result.selectedComposition.graphFunctionRef, "Fg_t179_runtime_alignment");
  assert.equal(result.selectedComposition.graphVectorRef, "derive_t179_surface");
  assert.equal(result.compositionRef, result.selectedComposition.compositionRef);
  assert.equal(result.compositionDigest, result.selectedComposition.compositionDigest);
  assert.equal(
    result.compositionSelectionRef,
    result.selectedComposition.compositionSelectionRef
  );
  assert.equal(result.evaluation.kind, "gtl_evaluation");
  assert.equal(result.evaluation.findings.length, 1);
  const finding = result.findings[0];
  assert.equal(finding.compositionRef, result.compositionRef);
  assert.equal(finding.compositionDigest, result.compositionDigest);
  assert.equal(finding.closeDisposition, "close_proposed");
  assert.deepEqual(finding.evidenceRefs, ["evidence://t179/output"]);
  assert.match(finding.compositionContributionRef, /^composition-contribution:/u);
});

test("T-179 consequence carriers preserve selected composition through ledgers and projection", () => {
  const selected = compositionIdentity();
  const ledger = constructSdlcEdgeFulfillmentLedger({
    selectedComposition: selected,
    ledgerRef: "ledger://t179/edge-fulfillment",
    ledgerVersionRef: "ledger-version://t179/edge-fulfillment/1",
    edgeRef: "edge://t179/Fg_t179_runtime_alignment/0",
    attemptRef: "attempt://t179/0",
    targetBindingRefs: ["target-binding://t179/output"],
    evidenceBundleRefs: ["evidence://t179/worksite"],
    counts: {
      expected: 1,
      fulfilled: 1,
      partial: 0,
      blocked: 0,
      unfulfilled: 0,
      missing: 0,
      extra: 0
    }
  });
  const decision = deriveSdlcEdgeClosureDecision({
    decisionRef: "closure-decision://t179/1",
    ledger,
    currentEdgeLawful: true
  });
  const projection = constructSdlcNextActionProjection({
    selectedComposition: selected,
    nextActionProjectionRef: "next-action://t179/post-close",
    intentEventRefs: ["event://t179/intent"],
    productAssetModelRef: "asset-model://t179/product",
    gapPressureRefs: ["pressure://t179/closed"],
    targetBindingRefs: ledger.targetBindingRefs,
    closureDecision: decision,
    observationRef: "observation://t179/post-close",
    policyRefs: ["policy://t179/evaluate-next"],
    actionCatalogRefs: ["catalog://t179/actions"]
  });

  assertSelectedCompositionFields(ledger, selected);
  assertSelectedCompositionFields(decision, selected);
  assertSelectedCompositionFields(projection, selected);
  assert(projection.predecessorRefs.includes(selected.compositionRef));
  assert(projection.predecessorRefs.includes(selected.compositionDigest));
  assert(projection.predecessorRefs.includes(selected.compositionSelectionRef));
});
