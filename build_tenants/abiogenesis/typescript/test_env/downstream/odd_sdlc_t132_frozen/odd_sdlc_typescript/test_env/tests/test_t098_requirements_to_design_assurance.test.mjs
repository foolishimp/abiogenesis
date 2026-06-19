// Validates: REQ-F-ODDSDLC-013
// Validates: REQ-F-ODDSDLC-051
// Validates: REQ-F-ODDSDLC-053
// Validates: T-098

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
import path, { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  installOddSdlcTypescript,
  invokeOddSdlcSpecMethodCommand
} from "../../build/semantic/code/src/index.js";

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(TEST_DIR, "../..");
const REPO_ROOT = resolve(PACKAGE_ROOT, "../..");
const ABG_TYPESCRIPT_ROOT = resolve(
  REPO_ROOT,
  "../abiogenesis/build_tenants/abiogenesis/typescript"
);

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t098-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(
    path.join(root, "specification/INTENT.md"),
    "# Intent\n\nBuild a governed design surface from requirement authority.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    "# Product\n\nT-098 requirements-to-design fixture.\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/GOALS.md"),
    "# Goals\n\n- prove requirements-to-design assurance fold\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/00-imported-sources.md"),
    "# Imported Sources\n\n- fixture://t098\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/01-design.md"),
    [
      "# Design Requirements",
      "",
      "REQ-T098-001: Derive an app-core design surface from admitted requirements.",
      "REQ-T098-002: Preserve app-core feature decomposition pressure in the design traversal."
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_bootstrap.md"),
    "# Project Bootstrap\n\nproject_slug: t098_fixture\n",
    "utf8"
  );
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t098_fixture",
      "active_tenant: typescript",
      "selected_output_root: build_tenants/typescript",
      "ambiguity_risk_appetite: medium"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    "# Tenant Registry\n\n- tenant: typescript\n",
    "utf8"
  );
  return root;
}

function reviewGradeEvaluatorBranch(summary) {
  return [
    "if (process.env.ODD_SDLC_EVALUATE_STAGE === 'review_grade_edge_fulfillment') {",
    "  const assessmentPath = process.env.ODD_SDLC_EVALUATOR_ASSESSMENT ?? path.join(manifest.archiveRoot, 'review_grade_edge_fulfillment_assessment.json');",
    "  const reportPath = process.env.ODD_SDLC_EVALUATOR_WORKER_REPORT ?? manifest.reportFile;",
    "  const report = JSON.parse(readFileSync(reportPath, 'utf8'));",
    "  const reviewedObligationIds = report.obligationAssessments.map((assessment) => assessment.obligationId);",
    "  const outputRef = pathToFileURL(manifest.outputFile).href;",
    "  const reportRef = pathToFileURL(reportPath).href;",
    "  const findings = reviewedObligationIds.map((obligationId) => ({ kind: 'sdlc_review_grade_obligation_finding', obligationId, fulfillmentStatus: 'fulfilled', failureClass: null, requiredAction: null, evidenceRefs: [outputRef, reportRef], acceptedAuthorityRefs: [outputRef, reportRef], rationale: 'synthetic evaluator accepts generated design asset for requirements-to-design assurance regression' }));",
    `  const assessment = { kind: 'sdlc_review_grade_edge_fulfillment_assessment', assessmentVersion: 'ts-review-grade-v1', graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, status: 'passed', reviewedObligationIds, findings, evidenceRefs: [outputRef, reportRef], summary: ${JSON.stringify(summary)} };`,
    "  writeFileSync(assessmentPath, `${JSON.stringify(assessment, null, 2)}\\n`, 'utf8');",
    "  process.stdout.write(`reviewStatus=passed reviewed=${reviewedObligationIds.length} blocked=0\\n`);",
    "  process.exit(0);",
    "}"
  ].join("\n");
}

function writeWorkerScript(workspaceRoot) {
  const workerPath = path.join(workspaceRoot, "t098_worker.mjs");
  writeFileSync(
    workerPath,
    [
      "import { createHash } from 'node:crypto';",
      "import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';",
      "import path, { dirname } from 'node:path';",
      "import { pathToFileURL } from 'node:url';",
      "const manifest = JSON.parse(readFileSync(process.argv[2], 'utf8'));",
      reviewGradeEvaluatorBranch(
        "synthetic review-grade evaluator accepted requirements-to-design output"
      ),
      "const obligationLines = manifest.traversalObligationContext.obligations.flatMap((obligation) => [`- ${obligation.obligationId}: ${obligation.summary}`, ...obligation.payload.sourceSnippets.map((snippet) => `  - ${snippet}`)]);",
      "const content = [`# ${manifest.targetAssetType}`, '', `graph_function: ${manifest.graphFunctionName}`, `edge: ${manifest.edgeName}`, `target: ${manifest.targetAssetType}`, '', '## Inputs', ...manifest.inputAssetTypes.map((assetType) => `- ${assetType}`), '', '## Obligations', ...(obligationLines.length > 0 ? obligationLines : ['- none']), '', '## Design Body', 'The design surface satisfies admitted requirement and feature decomposition pressure through the current graph edge.'].join('\\n');",
      "mkdirSync(dirname(manifest.outputFile), { recursive: true });",
      "writeFileSync(manifest.outputFile, `${content}\\n`, 'utf8');",
      "const digest = `sha256:${createHash('sha256').update(`${content}\\n`, 'utf8').digest('hex')}`;",
      "const obligationAssessments = manifest.traversalObligationContext.obligations.map((obligation) => ({ kind: 'sdlc_worker_obligation_assessment', obligationId: obligation.obligationId, fulfillmentStatus: 'fulfilled', evidenceRefs: [manifest.outputFile, ...obligation.evidenceRefs], blockingReasons: [] }));",
      "writeFileSync(manifest.reportFile, `${JSON.stringify({ kind: 'odd_sdlc.worker_result_report', projectionRole: 'typed_fp_stage_projection', authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href, graphFunctionName: manifest.graphFunctionName, edgeName: manifest.edgeName, targetAssetType: manifest.targetAssetType, outputFile: manifest.outputFile, digest, summary: `generated ${manifest.targetAssetType} for ${manifest.edgeName}`, unresolvedReasons: [], materializedFiles: [], executionEvidence: null, obligationAssessments }, null, 2)}\\n`, 'utf8');"
    ].join("\n"),
    "utf8"
  );
  return workerPath;
}

async function startOne(workspace, workerScript) {
  return invokeOddSdlcSpecMethodCommand([
    "start",
    "--workspace",
    workspace,
    "--target",
    "graph_function:derive_design_surface",
    "--until",
    "first_traversal",
    "--worker",
    `process://node?script=${encodeURIComponent(workerScript)}`
  ]);
}