// Validates: T-185

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  admitComputeSubworkstreamManifest,
  admitWorkerResultReport,
  computeSubworkstreamSelectedEdgeRef,
  computeSubworkstreamTargetCarrierRef,
  constructSdlcFpEvaluateResult,
  constructWorkerInvocationPackage,
  deriveSdlcSelectedAbgFnCompositionIdentity,
  deriveWorkerHandoffManifest,
  evaluateSdlcComputeStage,
  hookContractByEdgeName,
  materializeSdlcProjectConformance,
  promptForHandoff,
  SDLC_EVALUATE_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE,
  sha256Text,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";
import {
  reviewGradeEdgeFulfillmentPrompt
} from "../../build/semantic/code/src/operator/plugins/evaluate/prompts.js";

const TENANT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

function tenantFile(...segments) {
  return path.join(TENANT_ROOT, ...segments);
}

function writeConstraints(root) {
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t185_subworkstreams",
      "active_tenant: scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt",
      "    module_structure:",
      "      - ingestion",
      "      - mapping"
    ].join("\n"),
    "utf8"
  );
}

function makeWorkspace() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t185-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  writeConstraints(root);
  writeFileSync(
    path.join(root, "specification/PRODUCT.md"),
    [
      "# Product",
      "",
      "## Expected Product Files",
      "",
      "- build_tenants/scala_spark/src/main/scala/generated/Ingestion.scala role=source",
      "- build_tenants/scala_spark/src/main/scala/generated/Mapping.scala role=source"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "specification/requirements/REQS.md"),
    [
      "# Requirements",
      "",
      "REQ-T185-001: Map source rows into normalized target rows.",
      "REQ-T185-002: Keep ingestion and mapping responsibilities separately traceable.",
      "REQ-T185-003: Preserve ingestion parser errors as typed diagnostics.",
      "REQ-T185-004: Materialize mapping transforms behind a stable module boundary.",
      "REQ-T185-005: Keep generated source paths under the tenant output root.",
      "REQ-T185-006: Cite requirement lineage for every generated component.",
      "REQ-T185-007: Carry unresolved evidence gaps without closing the edge."
    ].join("\n"),
    "utf8"
  );
  materializeSdlcProjectConformance({ workspaceRoot: root });
  return root;
}

function manifestForComponentCode() {
  const contract = hookContractByEdgeName("derive_component_code_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot: makeWorkspace(),
    graphFunctionName: "derive_component_code_surface",
    edgeName: contract.edgeName,
    vectorIndex: 4,
    contract,
    runId: "t185-agent-internal-subworkstreams"
  });
}

function selectedComposition() {
  return deriveSdlcSelectedAbgFnCompositionIdentity({
    graphFunctionRef: "derive_component_code_surface",
    graphVectorRef: "derive_component_code_surface",
    compositionSelectionScopeRef: "test://t185/selected-composition",
    carrierContextRefs: ["carrier://t185/source", "carrier://t185/target"],
    assuranceContextRefs: ["assurance://t185/edge"]
  });
}

function subworkstreamRow(manifest, input = {}) {
  const selectedEdgeRef = computeSubworkstreamSelectedEdgeRef(manifest);
  const targetCarrierRef = computeSubworkstreamTargetCarrierRef(manifest);
  return {
    kind: "sdlc_compute_subworkstream_row",
    workstreamRef: input.workstreamRef ?? "subworkstream://t185/ingestion",
    stageRef: input.stageRef ?? "transform.C",
    selectedEdgeRef,
    targetCarrierRef,
    targetModuleRef: input.targetModuleRef ?? "module://scala_spark/ingestion",
    targetInterfaceRef: input.targetInterfaceRef ?? null,
    predecessorWorkstreamRefs: input.predecessorWorkstreamRefs ?? [],
    dependencyInputRefs: input.dependencyInputRefs ?? [
      "surface://module-dependency-map"
    ],
    authorityInputRefs: input.authorityInputRefs ?? [
      manifest.edgeAssuranceContractRef,
      manifest.targetCarrierProjection.targetCarrierContractRef
    ],
    evidenceRefs: input.evidenceRefs ?? ["evidence://t185/brief"],
    readRefs: input.readRefs ?? ["workspace://specification/requirements/REQS.md"],
    writeTerritoryRefs: input.writeTerritoryRefs ?? [
      "workspace://build_tenants/scala_spark/src/main/scala/generated"
    ],
    outputAllocationRefs: input.outputAllocationRefs ?? [
      "workspace://build_tenants/scala_spark/src/main/scala/generated/Ingestion.scala"
    ],
    idempotencyKey: input.idempotencyKey ?? "t185-ingestion-v1",
    fanInScopeRef: input.fanInScopeRef ?? "fan-in://t185/component-code",
    changedFileRefs: input.changedFileRefs ?? [
      "workspace://build_tenants/scala_spark/src/main/scala/generated/Ingestion.scala"
    ],
    proposedFileRefs: input.proposedFileRefs ?? [],
    status: input.status ?? "done",
    blockingReasonRefs: input.blockingReasonRefs ?? [],
    residualGapRefs: input.residualGapRefs ?? [],
    mergeDisposition: input.mergeDisposition ?? "merged"
  };
}

function subworkstreamManifest(manifest, input = {}) {
  return {
    kind: "sdlc_compute_subworkstream_manifest",
    manifestVersion: "ts-compute-subworkstream-v1",
    phase: "phase_1_parent_agent_internal",
    authority: "observation_only_parent_plugin_result",
    stageRef: input.stageRef ?? "transform.C",
    selectedEdgeRef: computeSubworkstreamSelectedEdgeRef(manifest),
    targetCarrierRef: computeSubworkstreamTargetCarrierRef(manifest),
    source: input.source ?? "parent_transform_report",
    subworkstreams: input.subworkstreams ?? [subworkstreamRow(manifest, input.row)],
    mergeResult: input.mergeResult ?? {
      kind: "sdlc_compute_subworkstream_merge_result",
      mergedOutputRefs: [
        "workspace://build_tenants/scala_spark/src/main/scala/generated/Ingestion.scala"
      ],
      conflictRefs: [],
      discardedOutputRefs: [],
      carryForwardGapRefs: [],
      parentResultRef: input.parentResultRef ?? pathToFileURL(manifest.reportFile).href
    },
    nonAuthority: true,
    abgDistributedExecutionClaim: false
  };
}

function workerReport(manifest, input = {}) {
  return {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href,
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: input.outputFile ?? manifest.outputFile,
    digest: input.digest ?? sha256Text("t185-output"),
    summary: "generated component code with parent-agent subworkstream evidence",
    unresolvedReasons: [],
    materializedFiles: [],
    materializationDiagnostics: [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: [],
    subworkstreamManifest: input.subworkstreamManifest ?? subworkstreamManifest(manifest),
    fpTransformRequestRef: null,
    fpTransformResultRef: null,
    fpTransformStatusSnapshot: null,
    fpEvaluateResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href
  };
}

test("T-185 transform prompt and construction package grant bounded parent-agent subworkstreams", () => {
  const manifest = manifestForComponentCode();
  const files = writeHandoffFiles(manifest);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const constructionBrief = JSON.parse(
    readFileSync(files.constructionBriefPath, "utf8")
  );
  const prompt = promptForHandoff(manifest);
  const defaultSubworkstreamManifest = JSON.parse(
    readFileSync(manifest.subworkstreamManifestFile, "utf8")
  );

  assert.equal(
    invocationPackage.computeSubworkstreamPolicy.permission,
    "agent_internal_subworkstreams_permitted_with_parent_merge"
  );
  assert.equal(invocationPackage.computeSubworkstreamPolicy.stageRef, "transform.C");
  assert(
    invocationPackage.computeSubworkstreamPolicy.dependencyInputRefs.includes(
      "surface://module-dependency-map"
    )
  );
  assert.deepEqual(
    constructionBrief.computeSubworkstreamPolicy,
    invocationPackage.computeSubworkstreamPolicy
  );
  assert.match(prompt, /You may use agent-internal subagents or parallel workstreams/u);
  assert.match(prompt, /admitted work-plan, dependency, target-carrier, tranche, authority, and obligation refs/u);
  assert.match(prompt, /Subworkstreams are not ABG branches/u);
  assert.doesNotMatch(prompt, /Do not spawn another worker or resume traversal/u);
  assert.equal(defaultSubworkstreamManifest.kind, "sdlc_compute_subworkstream_manifest");
  assert.equal(defaultSubworkstreamManifest.stageRef, "transform.C");
  assert.equal(defaultSubworkstreamManifest.source, "parent_checkpoint");
  assert.equal(defaultSubworkstreamManifest.nonAuthority, true);
  assert.equal(defaultSubworkstreamManifest.abgDistributedExecutionClaim, false);
});

test("T-185 returned transform subworkstream manifest admits only as parent report evidence", () => {
  const manifest = manifestForComponentCode();
  writeHandoffFiles(manifest);
  const admitted = admitWorkerResultReport(workerReport(manifest), manifest);

  assert.equal(
    admitted.subworkstreamManifest.kind,
    "sdlc_compute_subworkstream_manifest"
  );
  assert.equal(admitted.subworkstreamManifest.subworkstreams.length, 1);
  assert.equal(
    admitted.subworkstreamManifest.subworkstreams[0].dependencyInputRefs[0],
    "surface://module-dependency-map"
  );

  const postflight = evaluateSdlcComputeStage({
    manifest,
    report: admitted
  });
  assert(
    postflight.blockingReasonCarriers.some(
      (reason) => reason.code === "output_file_missing"
    ),
    "subworkstream success must not close a missing parent output"
  );
});

test("T-185 subworkstream admission rejects source-tree-only and evaluate-write rows", () => {
  const manifest = manifestForComponentCode();
  const transformManifest = subworkstreamManifest(manifest, {
    subworkstreams: [
      subworkstreamRow(manifest, {
        dependencyInputRefs: [],
        authorityInputRefs: []
      })
    ]
  });
  assert.throws(
    () =>
      admitComputeSubworkstreamManifest({
        value: transformManifest,
        manifest,
        stageRef: "transform.C",
        parentResultRef: pathToFileURL(manifest.reportFile).href
      }),
    /dependencyInputRefs or authorityInputRefs/u
  );

  const evaluateManifest = subworkstreamManifest(manifest, {
    stageRef: "evaluate.C",
    source: "parent_evaluate_report",
    subworkstreams: [
      subworkstreamRow(manifest, {
        stageRef: "evaluate.C",
        changedFileRefs: ["workspace://build_tenants/scala_spark/src/Bad.scala"]
      })
    ],
    mergeResult: {
      kind: "sdlc_compute_subworkstream_merge_result",
      mergedOutputRefs: [],
      conflictRefs: [],
      discardedOutputRefs: [],
      carryForwardGapRefs: [],
      parentResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href
    }
  });
  assert.throws(
    () =>
      admitComputeSubworkstreamManifest({
        value: evaluateManifest,
        manifest,
        stageRef: "evaluate.C",
        parentResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href
      }),
    /evaluate\.C subworkstreams are read-only/u
  );
});

test("T-185 evaluate.C prompt and result carry read-only subworkstream observation", () => {
  const manifest = manifestForComponentCode();
  writeHandoffFiles(manifest);
  const evaluateManifestPath = path.join(
    manifest.archiveRoot,
    SDLC_EVALUATE_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE
  );
  const evaluateManifest = subworkstreamManifest(manifest, {
    stageRef: "evaluate.C",
    source: "parent_evaluate_report",
    subworkstreams: [
      subworkstreamRow(manifest, {
        stageRef: "evaluate.C",
        targetModuleRef: "module://scala_spark/mapping",
        writeTerritoryRefs: [],
        outputAllocationRefs: [],
        changedFileRefs: [],
        proposedFileRefs: [],
        dependencyInputRefs: ["surface://module-dependency-map"],
        authorityInputRefs: [manifest.targetCarrierProjection.targetCarrierContractRef]
      })
    ],
    mergeResult: {
      kind: "sdlc_compute_subworkstream_merge_result",
      mergedOutputRefs: ["assessment://t185/review-grade"],
      conflictRefs: [],
      discardedOutputRefs: [],
      carryForwardGapRefs: [],
      parentResultRef: pathToFileURL(manifest.fpEvaluateResultFile).href
    }
  });
  writeFileSync(evaluateManifestPath, `${JSON.stringify(evaluateManifest, null, 2)}\n`);

  const prompt = reviewGradeEdgeFulfillmentPrompt({
    manifest,
    governanceRef: "governance://t185",
    governancePath: "config/work-category-governance/component_code.md",
    constructionBriefPath: "worker_construction_brief.json",
    invocationPackagePath: "worker_invocation_package.json",
    workerReportPath: "worker_result_report.json",
    assessmentPath: "review_grade_edge_fulfillment_assessment.json",
    subworkstreamManifestPath: evaluateManifestPath
  });
  assert.match(prompt, /read-only compute strategy/u);
  assert.match(prompt, /leave write\/output-allocation fields empty/u);
  assert.match(prompt, /do not emit ABG events, write ledgers, close edges/u);

  const result = constructSdlcFpEvaluateResult({
    manifest,
    selectedComposition: selectedComposition(),
    report: admitWorkerResultReport(workerReport(manifest), manifest),
    postflight: {
      kind: "sdlc_operator_postflight_result",
      status: "passed",
      blockingReasons: [],
      blockingReasonCarriers: [],
      evidenceRefs: ["evidence://t185/postflight"]
    }
  });
  assert.equal(result.subworkstreamManifest.stageRef, "evaluate.C");
  assert.equal(result.subworkstreamCounts.total, 1);
  assert.equal(result.subworkstreamCounts.done, 1);
  assert.equal(result.subworkstreamManifest.abgDistributedExecutionClaim, false);
});

test("T-185 design proof records execution authority, IACS, and DAG reconciliation", () => {
  const computeStageDesign = readFileSync(
    tenantFile(
      "design",
      "ODD_SDLC_TYPESCRIPT_STAGED_COMPUTE_BOUNDARY.md"
    ),
    "utf8"
  );
  const schedulingDesign = readFileSync(
    tenantFile("design", "ODD_SDLC_TYPESCRIPT_SCHEDULING_PHASE.md"),
    "utf8"
  );

  assert.match(computeStageDesign, /11\.5B Execution Authority Audit/u);
  assert.match(computeStageDesign, /exactly one execution authority/u);
  assert.match(computeStageDesign, /No SDLC subagent `spawn`/u);
  assert.match(computeStageDesign, /invokeWorkerThroughAbgProcessActor/u);
  assert.match(computeStageDesign, /### SdlcComputeSubworkstreamManifest/u);
  assert.match(computeStageDesign, /classDiagram/u);
  assert.match(
    computeStageDesign,
    /SdlcComputeSubworkstreamManifest "1" --> "\*" SdlcComputeSubworkstreamRow/u
  );
  assert.match(computeStageDesign, /SdlcFeatureDependencyDag/u);
  assert.match(computeStageDesign, /cannot back-author the DAG/u);
  assert.match(schedulingDesign, /does not replace `SdlcFeatureDependencyDag`/u);
  assert.match(schedulingDesign, /cannot back-author schedule/u);
});
