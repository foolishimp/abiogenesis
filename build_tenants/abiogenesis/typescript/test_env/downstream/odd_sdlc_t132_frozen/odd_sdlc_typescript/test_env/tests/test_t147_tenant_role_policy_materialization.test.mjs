// Validates: T-147

import test from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  constructWorkerInvocationPackage,
  deriveWorkerHandoffManifest,
  evaluateSdlcComputeStage,
  hookContractByEdgeName,
  promptForHandoff,
  readWorkerResultReport,
  reconcileSdlcProductMaterializationAuthority,
  sha256Text
} from "../../build/semantic/code/src/index.js";

function writeConstraints(workspaceRoot, input = {}) {
  mkdirSync(path.join(workspaceRoot, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(workspaceRoot, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t147_materialization_policy",
      `active_tenant: ${input.activeTenant ?? "custom_runtime"}`,
      `selected_output_root: build_tenants/${input.activeTenant ?? "custom_runtime"}`,
      "build_tenants:",
      `  ${input.activeTenant ?? "custom_runtime"}:`,
      `    output_dir: build_tenants/${input.activeTenant ?? "custom_runtime"}`,
      `    language: ${input.language ?? "custom"}`,
      `    build_tool: ${input.buildTool ?? "custom"}`
    ].join("\n"),
    "utf8"
  );
}

function makeWorkspace(input = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t147-"));
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeConstraints(root, input);
  const activeTenant = input.activeTenant ?? "custom_runtime";
  mkdirSync(path.join(root, "build_tenants", activeTenant, "spec"), {
    recursive: true
  });
  writeFileSync(
    path.join(root, "build_tenants", activeTenant, "spec/TECH_STACK.json"),
    `${JSON.stringify(
      {
        kind: "sdlc_tenant_technology_stack_description",
        language: input.language ?? "custom",
        buildTool: input.buildTool ?? "custom",
        executionEnvironment: {
          host: "workspace-local"
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  if (input.productTargets !== undefined) {
    writeFileSync(
      path.join(root, "specification/PRODUCT.md"),
      [
        "# Product",
        "",
        "## Expected Product Files",
        "",
        ...input.productTargets.map((target) => `- ${target}`)
      ].join("\n"),
      "utf8"
    );
  }
  return root;
}

function materializationManifest(workspaceRoot) {
  const contract = hookContractByEdgeName("derive_component_code_surface");
  return deriveWorkerHandoffManifest({
    workspaceRoot,
    graphFunctionName: FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
    edgeName: contract.edgeName,
    vectorIndex: 0,
    contract,
    runId: "t147-materialization-policy"
  });
}

function writeOutputSurface(manifest) {
  const content = "# component_code_surface\n\nedge: derive_component_code_surface\n";
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, content, "utf8");
  return {
    digest: sha256Text(content),
    ref: `file://${manifest.outputFile}`
  };
}

function writeProductFile(manifest, relativePath, content = "declared product file\n") {
  const absolutePath = path.join(manifest.productMaterialization.tenantRoot, relativePath);
  mkdirSync(path.dirname(absolutePath), { recursive: true });
  writeFileSync(absolutePath, content, "utf8");
  return {
    absolutePath,
    digest: sha256Text(content),
    byteCount: Buffer.byteLength(content, "utf8")
  };
}

function writeImplementationDesignAuthority(manifest, input) {
  const outputFile = path.join(
    manifest.productMaterialization.tenantRoot,
    "design/adrs/ADR-002-implementation-design-surface.md"
  );
  const requirementIds = input.requirementIds.length > 0
    ? input.requirementIds
    : ["requirement:t147/declared-source"];
  const axis = (name) => ({
    kind: "sdlc_design_completeness_axis_verdict",
    axis: name,
    status: "satisfied",
    reasons: [],
    evidenceRefs: [`file://${outputFile}`]
  });
  const attribute = {
    kind: "sdlc_domain_attribute",
    attributeId: "attr:t147.widget.content",
    name: "content",
    valueType: "string",
    cardinality: "one",
    invariantRefs: requirementIds
  };
  const entity = {
    kind: "sdlc_domain_entity",
    entityId: "entity:t147.widget",
    moduleName: "custom-runtime",
    ownership: "owned",
    attributes: [attribute],
    invariants: ["declared source is materialized"],
    sourceAssetRefs: ["fixture://t147"]
  };
  const operation = {
    kind: "sdlc_domain_operation",
    operationId: "operation:t147.publishWidget",
    moduleName: "custom-runtime",
    inputEntityIds: [entity.entityId],
    outputEntityIds: [entity.entityId],
    requiredAttributeIds: [attribute.attributeId]
  };
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(
    outputFile,
    `${JSON.stringify(
      {
        kind: "sdlc_design_depth_register",
        registerVersion: "ts-design-depth-v1",
        targetAssetType: "implementation_design_surface",
        stackProfileRows: [
          {
            kind: "sdlc_stack_profile_row",
            stackRef: "stack://t147/custom-runtime",
            language: "custom",
            buildTool: "custom"
          }
        ],
        implementationModuleRows: [
          {
            kind: "sdlc_implementation_module_row",
            moduleName: "custom-runtime",
            moduleRef: "module://t147/custom-runtime"
          }
        ],
        aggregateDomainModelRows: [
          {
            kind: "sdlc_aggregate_domain_model_row",
            modelRef: "model://t147/custom-runtime"
          }
        ],
        moduleSchemaFragments: [
          {
            kind: "sdlc_module_schema_fragment",
            moduleName: "custom-runtime",
            entities: [entity],
            operations: [operation],
            requirementIds,
            sourceAssetRefs: ["fixture://t147"]
          }
        ],
        moduleStateDiagramFragments: [],
        aggregateDomainModel: {
          kind: "sdlc_aggregate_domain_model",
          modelVersion: "ts-design-depth-v1",
          entities: [
            {
              kind: "sdlc_aggregate_domain_entity",
              entityId: entity.entityId,
              ownerModuleName: "custom-runtime",
              attributes: [attribute],
              sourceModuleNames: ["custom-runtime"]
            }
          ],
          operations: [operation],
          crossModuleReferences: [],
          evidenceRefs: [`file://${outputFile}`]
        },
        sunnyDaySequenceRows: [],
        aggregateSunnyDaySequence: null,
        componentTopologyRows: [
          {
            kind: "sdlc_component_topology_row",
            componentId: "custom-runtime-widget",
            moduleName: "custom-runtime",
            relativePath: "app.widget",
            publicBoundary: "app.widget",
            concernRole: "other",
            requirementIds,
            sourceAssetRefs: ["fixture://t147"]
          }
        ],
        componentRealizationRows: [],
        fileTargetRows: [],
        designCompletenessVerdict: {
          kind: "sdlc_design_completeness_verdict",
          verdictVersion: "ts-design-depth-v1",
          entity: axis("entity"),
          attribute: axis("attribute"),
          flow: axis("flow")
        }
      },
      null,
      2
    )}\n`,
    "utf8"
  );
}

function writeReport(input) {
  const output = writeOutputSurface(input.manifest);
  const materializedRefs = input.materializedFiles.map(
    (file) => `file://${file.absolutePath}`
  );
  mkdirSync(path.dirname(input.manifest.reportFile), { recursive: true });
  writeFileSync(
    input.manifest.reportFile,
    `${JSON.stringify(
      {
        kind: "odd_sdlc.worker_result_report",
        projectionRole: "typed_fp_stage_projection",
        authoritativeStageResultRef: pathToFileURL(
          input.manifest.fpEvaluateResultFile
        ).href,
        graphFunctionName: input.manifest.graphFunctionName,
        edgeName: input.manifest.edgeName,
        targetAssetType: input.manifest.targetAssetType,
        outputFile: input.manifest.outputFile,
        digest: output.digest,
        summary: "materialized policy-bound product files",
        unresolvedReasons: [],
        materializedFiles: input.materializedFiles,
        executionEvidence: null,
        executionEvidenceErrors: [],
        obligationAssessments:
          input.manifest.traversalObligationContext.obligations.map(
            (obligation) => ({
              kind: "sdlc_worker_obligation_assessment",
              obligationId: obligation.obligationId,
              fulfillmentStatus: "fulfilled",
              evidenceRefs: [output.ref, ...materializedRefs],
              blockingReasons: []
            })
          )
      },
      null,
      2
    )}\n`,
    "utf8"
  );
  return readWorkerResultReport(input.manifest);
}

test("T-147 declared unknown file family satisfies product source role by policy", () => {
  const workspace = makeWorkspace({
    productTargets: ["build_tenants/custom_runtime/app.widget role=source"]
  });
  mkdirSync(path.join(workspace, "specification/requirements"), {
    recursive: true
  });
  writeFileSync(
    path.join(workspace, "specification/requirements/01-runtime-widget.md"),
    [
      "# Runtime Widget Requirements",
      "",
      "REQ-T147-001: The custom runtime product publishes app.widget as its declared source."
    ].join("\n"),
    "utf8"
  );
  const manifest = materializationManifest(workspace);
  const requirementTraceObligationIds =
    manifest.traversalObligationContext.obligations
      .filter((obligation) => obligation.obligationId.startsWith("requirement:"))
      .map((obligation) => obligation.obligationId);
  assert.notEqual(requirementTraceObligationIds.length, 0);
  writeImplementationDesignAuthority(manifest, {
    requirementIds: requirementTraceObligationIds
  });
  const reconciliation = reconcileSdlcProductMaterializationAuthority(manifest);
  const invocationPackage = constructWorkerInvocationPackage({ manifest });
  const prompt = promptForHandoff(manifest);
  const productFile = writeProductFile(
    manifest,
    "app.widget",
    [
      ...requirementTraceObligationIds.map(
        (obligationId) => `// requirement-trace: ${obligationId}`
      ),
      "custom runtime product source"
    ].join("\n") + "\n"
  );
  const report = writeReport({
    manifest,
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "app.widget",
        absolutePath: productFile.absolutePath,
        digest: productFile.digest,
        byteCount: productFile.byteCount,
        requirementTraceObligationIds
      }
    ]
  });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(reconciliation.status, "passed");
  assert.equal(
    reconciliation.declaredProductTargetContracts[0]?.requiredRole,
    "source"
  );
  assert.match(
    reconciliation.declaredProductTargetContracts[0]?.policyRef ?? "",
    /explicit\/source/u
  );
  assert.deepEqual(
    invocationPackage.outputContract.declaredProductTargetContracts.map(
      (target) => ({
        path: target.path,
        targetKind: target.targetKind,
        requiredRole: target.requiredRole,
        policyRef: target.policyRef
      })
    ),
    [
      {
        path: "build_tenants/custom_runtime/app.widget",
        targetKind: "file",
        requiredRole: "source",
        policyRef: "target-role-policy://odd-sdlc/explicit/source"
      }
    ]
  );
  assert.match(prompt, /app\.widget \(file, role=source, policy=target-role-policy/u);
  assert.equal(
    postflight.blockingReasonCarriers.some((reason) =>
      [
        "materialized_product_file_unbound_to_declared_target",
        "materialized_product_role_policy_mismatch",
        "materialized_product_role_policy_ref_mismatch"
      ].includes(reason.code)
    ),
    false,
    JSON.stringify(postflight.blockingReasonCarriers, null, 2)
  );
});

test("T-147 known ecosystem file is evaluate.C pressure beside F_D admission", () => {
  const workspace = makeWorkspace({
    activeTenant: "scala_spark",
    language: "scala",
    buildTool: "sbt",
    productTargets: ["build_tenants/scala_spark/app.widget role=source"]
  });
  const manifest = materializationManifest(workspace);
  const productFile = writeProductFile(
    manifest,
    "build.sbt",
    "ThisBuild / scalaVersion := \"2.13.12\"\n"
  );
  const report = writeReport({
    manifest,
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "build.sbt",
        absolutePath: productFile.absolutePath,
        digest: productFile.digest,
        byteCount: productFile.byteCount
      }
    ]
  });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasonCarriers.some(
      (reason) => reason.code === "materialized_product_file_unbound_to_declared_target"
    ),
    false,
    JSON.stringify(postflight.blockingReasonCarriers, null, 2)
  );
});

test("T-147 context expected files remain observation without owning materialization authority", () => {
  const workspace = makeWorkspace({
    activeTenant: "scala_spark",
    language: "scala",
    buildTool: "sbt",
    productTargets: undefined
  });
  writeFileSync(
    path.join(workspace, ".ai-workspace/context/expected_files.json"),
    JSON.stringify(
      {
        expectedFiles: ["build_tenants/scala_spark/src/main/scala/App.scala"]
      },
      null,
      2
    ),
    "utf8"
  );
  writeFileSync(
    path.join(workspace, "specification/PRODUCT.md"),
    "# Product\n\nNo declared product file topology has been conformed.\n",
    "utf8"
  );
  const manifest = materializationManifest(workspace);
  const reconciliation = reconcileSdlcProductMaterializationAuthority(manifest);
  const productFile = writeProductFile(
    manifest,
    "src/main/scala/App.scala",
    "object App\n"
  );
  const report = writeReport({
    manifest,
    materializedFiles: [
      {
        kind: "sdlc_materialized_product_file",
        role: "source",
        relativePath: "src/main/scala/App.scala",
        absolutePath: productFile.absolutePath,
        digest: productFile.digest,
        byteCount: productFile.byteCount
      }
    ]
  });
  const postflight = evaluateSdlcComputeStage({ manifest, report });

  assert.equal(reconciliation.status, "missing");
  assert.deepEqual(reconciliation.declaredProductTargetContracts, []);
  assert.deepEqual(reconciliation.contextExpectedFileTargets, [
    "build_tenants/scala_spark/src/main/scala/App.scala"
  ]);
  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasonCarriers.some(
      (reason) =>
        reason.code === "context_expected_files_not_materialization_authority"
    ),
    true,
    JSON.stringify(postflight.blockingReasonCarriers, null, 2)
  );
});
