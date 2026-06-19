// Validates: T-180
// Proves the ABG 4 release substrate uses an immutable release snapshot tarball and
// consumes selected composition identity from ABG plugin input.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";

import {
  constructFrameOpenedEvent,
  constructGraphCallOpenedEvent,
  constructGtlEvaluationScopeRef,
  constructVectorTraversalPlannedEvent,
  deriveIterationOutcomeFromRows,
  deriveRuntimeAggregateProjection,
  GTL_EVALUATION_SCOPE_KIND_VALUES
} from "@abiogenesis/typescript-tenant";

import {
  ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT,
  constructOddSdlcAbiogenesisExecutionBasis,
  sdlcSelectedAbgFnCompositionIdentityFromEnginePluginInput
} from "../../build/semantic/code/src/index.js";

const ABG_RC_VERSION = "4.1.0-rc.2";
const ABG_RELEASE_SNAPSHOT_REF = ABG_RC_VERSION;
const ABG_DEPENDENCY_REF = `file:../../../abiogenesis/release_snapshots/abiogenesis-typescript-tenant/${ABG_RELEASE_SNAPSHOT_REF}/abiogenesis-typescript-tenant-${ABG_RC_VERSION}.tgz`;

const PACKAGE_ROOT = process.cwd();
const REPO_ROOT = path.resolve(PACKAGE_ROOT, "../..");

function readPackageJson(relativePath) {
  return JSON.parse(readFileSync(path.join(PACKAGE_ROOT, relativePath), "utf8"));
}

function readRepoFile(relativePath) {
  return readFileSync(path.join(REPO_ROOT, relativePath), "utf8");
}

function readJsonAbsolute(filePath) {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

test(`T-180 pins the TypeScript tenant to ABG ${ABG_RC_VERSION}`, () => {
  const packageJson = readPackageJson("package.json");
  const packageLock = readPackageJson("package-lock.json");
  const latestManifest = readJsonAbsolute(
    path.resolve(
      REPO_ROOT,
      "../abiogenesis/release_snapshots/abiogenesis-typescript-tenant/latest/release-snapshot-manifest.json"
    )
  );

  assert.equal(
    packageJson.dependencies["@abiogenesis/typescript-tenant"],
    ABG_DEPENDENCY_REF
  );
  assert.equal(
    packageLock.packages[""].dependencies["@abiogenesis/typescript-tenant"],
    ABG_DEPENDENCY_REF
  );
  assert.equal(
    packageLock.packages["node_modules/@abiogenesis/typescript-tenant"].version,
    ABG_RC_VERSION
  );
  assert.equal(
    ODD_SDLC_ABIOGENESIS_SUBSTRATE_CONTRACT.packageVersion,
    ABG_RC_VERSION
  );
  assert.equal(latestManifest.releaseIdentity, ABG_RC_VERSION);
  assert.equal(latestManifest.package.packageVersion, ABG_RC_VERSION);
  assert.equal(latestManifest.sourceDirty, false);
});

test("T-180 selected composition identity is consumed from ABG plugin input", () => {
  const selected =
    sdlcSelectedAbgFnCompositionIdentityFromEnginePluginInput({
      selectedCompositionRef: "abg.fn_composition://contract/t180",
      selectedCompositionDigest: "digest://t180/selected",
      selectedCompositionSelectionRef: "abg.fn_composition_selection://t180",
      selectedRegimeBindingRef:
        "abg.fn_composition.regime_binding://t180/evaluate/fp",
      graphFunctionId: "graph_function://odd-sdlc/t180",
      jobId: "job://odd-sdlc/t180",
      vectorIndex: 2,
      edge: "derive_component_code_surface"
    });

  assert.equal(selected.compositionRef, "abg.fn_composition://contract/t180");
  assert.equal(selected.compositionDigest, "digest://t180/selected");
  assert.equal(
    selected.compositionSelectionRef,
    "abg.fn_composition_selection://t180"
  );
  assert.equal(
    selected.selectedRegimeBindingRef,
    "abg.fn_composition.regime_binding://t180/evaluate/fp"
  );
  assert.equal(selected.graphFunctionRef, "graph_function://odd-sdlc/t180");
  assert.match(selected.graphVectorRef, /job%3A%2F%2Fodd-sdlc%2Ft180/u);
  assert.match(selected.graphVectorRef, /vector-2/u);
  assert.match(selected.graphVectorRef, /derive_component_code_surface/u);
});

test("T-180 selected composition helper fails closed on missing ABG identity", () => {
  assert.throws(
    () =>
      sdlcSelectedAbgFnCompositionIdentityFromEnginePluginInput({
        selectedCompositionRef: "",
        selectedCompositionDigest: "digest://t180/selected",
        selectedCompositionSelectionRef: "abg.fn_composition_selection://t180",
        graphFunctionId: "graph_function://odd-sdlc/t180",
        jobId: "job://odd-sdlc/t180",
        vectorIndex: 2,
        edge: "derive_component_code_surface"
      }),
    /selectedCompositionRef/u
  );
});

test("T-180 installed operator uses ABG plugin input for traversal consequence composition", () => {
  const source = readRepoFile("build_tenants/typescript/code/src/operator/installed_operator.ts");

  assert.match(
    source,
    /sdlcSelectedAbgFnCompositionIdentityFromEnginePluginInput\(pluginInput\)/u
  );
  assert.doesNotMatch(source, /function selectedCompositionForManifest/u);
});

test("T-180 installed operator binds distinct transform, evaluate, and consequence plugins", () => {
  const installedOperator = readRepoFile("build_tenants/typescript/code/src/operator/installed_operator.ts");
  const pluginContracts = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/plugin_contracts.ts"
  );
  const pluginSet = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/plugin_set.ts"
  );

  assert.match(pluginContracts, /function fpDispatchPluginContract\(\)/u);
  assert.match(pluginContracts, /computeStageRole: "transform"/u);
  assert.match(pluginContracts, /computeStagePurpose: "candidate_construction"/u);
  assert.match(pluginContracts, /function fpEvaluatorPluginContract\(\)/u);
  assert.match(pluginContracts, /pluginKind: "fp_evaluator"/u);
  assert.match(pluginContracts, /computeStageRole: "evaluate"/u);
  assert.match(pluginContracts, /computeStagePurpose: "candidate_evaluation"/u);
  assert.match(pluginContracts, /function consequenceProjectionPluginContract\(\)/u);
  assert.match(pluginContracts, /pluginKind: "consequence_projection"/u);
  assert.match(pluginContracts, /computeStageRole: "consequence"/u);
  assert.match(pluginContracts, /computeStagePurpose: "consequence_projection"/u);
  assert.match(pluginSet, /function createSdlcAbgPluginSet\(/u);
  assert.match(pluginSet, /fpDispatch:\s+Object\.freeze/u);
  assert.match(pluginSet, /fpEvaluator:\s+Object\.freeze/u);
  assert.match(pluginSet, /consequenceProjection:\s+Object\.freeze/u);
  assert.match(installedOperator, /createSdlcAbgPluginSet\(/u);
  assert.doesNotMatch(installedOperator, /function fpDispatchPluginContract\(\)/u);
  assert.doesNotMatch(installedOperator, /plugins: \{ fpDispatch \}/u);
});

test("T-180 live evaluate and consequence paths do not synthesize selected composition", () => {
  const handoff = readRepoFile("build_tenants/typescript/code/src/operator/plugins/transform/launch_contract.ts");
  const evaluatePostflight = readRepoFile(
    "build_tenants/typescript/code/src/operator/plugins/evaluate/postflight.ts"
  );
  const publicStart = readRepoFile("build_tenants/typescript/code/src/start/public_start.ts");
  const traversal = readRepoFile(
    "build_tenants/typescript/code/src/operator/traversal_consequence.ts"
  );

  assert.match(
    evaluatePostflight,
    /readonly selectedComposition: SdlcSelectedAbgFnCompositionIdentity/u
  );
  assert.doesNotMatch(handoff, /deriveSdlcSelectedAbgFnCompositionIdentity/u);
  assert.match(publicStart, /deriveSdlcPreRuntimePlanningCompositionIdentity/u);
  assert.doesNotMatch(traversal, /legacyReplayOnlyCompositionIdentityForInput/u);
  assert.doesNotMatch(traversal, /Migration-only support for historical tests\/replay fixtures/u);
});

test("T-180 analyzer admits and renders staged compute truth", () => {
  const catalog = readRepoFile(
    "build_tenants/typescript/code/src/contracts/operator_run_artifact_catalog.ts"
  );
  const loaders = readRepoFile("build_tenants/typescript/code/src/analysis/carrier_loaders.ts");
  const attempts = readRepoFile("build_tenants/typescript/code/src/analysis/edge_attempts.ts");
  const markdown = readRepoFile("build_tenants/typescript/code/src/analysis/render_markdown.ts");

  assert.match(catalog, /operator-run-artifact:\/\/gtl-admitted-state-ref/u);
  assert.match(catalog, /operator-run-artifact:\/\/gtl-consequence-projection-ref/u);
  assert.match(loaders, /GTL_ADMITTED_STATE_REF_GUARD/u);
  assert.match(loaders, /GTL_CONSEQUENCE_PROJECTION_REF_GUARD/u);
  assert.match(loaders, /compositionSelectionRef: isTrimmedNonEmptyString/u);
  assert.match(attempts, /stagedComputeTruthFromCarriers/u);
  assert.match(attempts, /Selected composition drift/u);
  assert.match(markdown, /## Staged Compute Truth/u);
});

test("T-180 ABG release substrate exposes the staged evaluate.C rule path", () => {
  const runner = readFileSync(
    path.join(
      PACKAGE_ROOT,
      "node_modules/@abiogenesis/typescript-tenant/build/semantic/code/src/abg/m03/runner/engine_runner.js"
    ),
    "utf8"
  );

  assert.match(
    runner,
    /const plannedEvaluationRules = plugins\.evaluationRules\.map/u
  );
  assert.match(
    runner,
    /plugins\.evaluationRules/u
  );
});

test("T-180 ABG release substrate preserves segment-scoped redispatch rows", () => {
  assert(GTL_EVALUATION_SCOPE_KIND_VALUES.includes("segment"));
  assert(GTL_EVALUATION_SCOPE_KIND_VALUES.includes("dimension_cell"));

  const basis = constructOddSdlcAbiogenesisExecutionBasis();
  const vectorIndex = 0;
  const projection = deriveRuntimeAggregateProjection(basis, [
    constructGraphCallOpenedEvent(basis),
    constructFrameOpenedEvent(basis),
    constructVectorTraversalPlannedEvent({ basis, vectorIndex })
  ]);
  const graphVector = basis.graph.vectors[vectorIndex];
  assert.notEqual(graphVector, undefined);

  const scope = constructGtlEvaluationScopeRef({
    scopeRef: "gtl.evaluation_scope://odd-sdlc/t180/deep-coverage/segment-2",
    graphCallRef: projection.graphCallId,
    frameRef: projection.frameId,
    graphFunctionRef: basis.graphFunction.id,
    graphVectorRef: graphVector.name,
    vectorIndex,
    compositionRef: "abg.fn_composition://odd-sdlc/t180/deep-coverage",
    compositionDigest: "sha256:t180-deep-coverage",
    scopeTopologyRef: "gtl.evaluation_scope_topology://odd-sdlc/t180/deep-coverage",
    scopeKind: "segment",
    segmentRef: "gtl.segment://odd-sdlc/t180/deep-coverage/segment-2"
  });

  const outcome = deriveIterationOutcomeFromRows({
    basis,
    runtimeProjection: projection,
    vectorIndex,
    runtimeRows: [
      {
        boundary: "evaluator",
        status: "failed",
        reason: "partial_evidence",
        retryable: true,
        evidenceRefs: ["evidence://odd-sdlc/t180/deep-coverage/segment-2"],
        evaluationScopeRef: scope
      }
    ]
  });

  assert.equal(outcome.kind, "redispatch");
  assert.equal(outcome.target.targetVectorIndex, vectorIndex);
  assert.deepEqual(outcome.target.evaluationScopeRef, scope);
});
