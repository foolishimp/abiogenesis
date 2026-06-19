// Validates: B-086

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
import { pathToFileURL } from "node:url";

import {
  admitComponentDepthRegisterFromArtifact,
  admitDesignDepthRegisterFromArtifact,
  admitPostflightGapDossier,
  admitSdlcConstructorResult,
  admitSdlcProjectConstraints,
  constructPostflightGapDossier,
  deriveAmbiguityAssuranceLedger,
  deriveCapabilityAssuranceLedger,
  deriveComponentDepthAssuranceLedger,
  deriveDesignCompletenessAssuranceLedger,
  deriveMaterializationAssuranceLedger,
  deriveObligationCarryAssuranceLedger,
  deriveRequirementFulfillmentAssuranceLedger,
  deriveSemanticConvergenceAssuranceLedger,
  deriveShallowRealizationAssuranceLedger,
  deriveSdlcConformProjectProfileFromWorkspace,
  deriveSdlcFeatureScope,
  deriveSdlcOperatorAssuranceGate,
  deriveSdlcTraversalStrategyDecision,
  deriveWorkerHandoffManifest,
  evaluateSdlcHookPostflight,
  evaluateSdlcHookPreflight,
  evaluateSdlcComputeStage,
  hookContractByEdgeName,
  minimalSdlcHookInvocationForContract,
  projectConstraintsFromConformProjectProfile,
  runSdlcHookTurn,
  readWorkerResultReport,
  sdlcBlockingReasonFromLegacy,
  sha256Text,
  writeHandoffFiles
} from "../../build/semantic/code/src/index.js";

function workspace(input = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-b086-"));
  mkdirSync(path.join(root, "specification/requirements"), { recursive: true });
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  mkdirSync(path.join(root, "build_tenants"), { recursive: true });
  writeFileSync(path.join(root, "README.md"), "# B-086\n", "utf8");
  writeFileSync(path.join(root, "specification/INTENT.md"), "# Intent\n", "utf8");
  writeFileSync(path.join(root, "specification/GOALS.md"), "# Goals\n", "utf8");
  writeFileSync(path.join(root, "specification/PRODUCT.md"), "# Product\n", "utf8");
  if (input.includeRequirements !== false) {
    writeFileSync(
      path.join(root, "specification/requirements/01-b086.md"),
      "REQ-B086-001: F_D admits only hard-source exactness and lawful aliases.\n",
      "utf8"
    );
  }
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: b086_fd_sweep",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark/",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    test_execution_contract: sbt test"
    ].join("\n"),
    "utf8"
  );
  writeFileSync(
    path.join(root, "build_tenants/TENANT_REGISTRY.md"),
    "# Tenant Registry\n\n- scala_spark\n",
    "utf8"
  );
  return root;
}

function manifest(root, edgeName, vectorIndex = 0) {
  const contract = hookContractByEdgeName(edgeName);
  return deriveWorkerHandoffManifest({
    workspaceRoot: root,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName,
    vectorIndex,
    contract
  });
}

function writeOutput(manifest, content) {
  mkdirSync(path.dirname(manifest.outputFile), { recursive: true });
  writeFileSync(manifest.outputFile, content, "utf8");
  return content;
}

function writeComponentRegister(manifest, register) {
  return writeOutput(manifest, `${JSON.stringify(register, null, 2)}\n`);
}

function writeDesignRegister(manifest, register) {
  return writeOutput(manifest, `${JSON.stringify(register, null, 2)}\n`);
}

function workerReport(manifest, output, overrides = {}) {
  return {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: pathToFileURL(
      manifest.fpEvaluateResultFile
    ).href,
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: sha256Text(output),
    summary: "B-086 F_D sweep fixture",
    unresolvedReasons: [],
    materializedFiles: [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: [],
    ...overrides
  };
}

function writeReport(manifest, output, overrides = {}) {
  writeReportPayload(manifest, workerReport(manifest, output, overrides));
}

function writeReportPayload(manifest, payload) {
  mkdirSync(path.dirname(manifest.reportFile), { recursive: true });
  writeFileSync(manifest.reportFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function fulfilledAssessments(manifest, evidenceRefs) {
  return manifest.traversalObligationContext.obligations.map((obligation) => ({
    kind: "sdlc_worker_obligation_assessment",
    obligationId: obligation.obligationId,
    fulfillmentStatus: "fulfilled",
    evidenceRefs,
    blockingReasons: []
  }));
}

function repairScheduleRegister(overrides = {}) {
  const { componentRepairSchedule = {}, ...registerOverrides } = overrides;
  return {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_repair_schedule_surface",
    componentRepairSchedule: {
      kind: "sdlc_component_repair_schedule",
      registerVersion: "ts-component-depth-v1",
      scheduleStatus: "no_repair_required",
      repairRows: [],
      evidenceRefs: ["proof://b086/repair-schedule"],
      ...componentRepairSchedule
    },
    ...registerOverrides
  };
}

function failedQualificationRegister(failureOverrides = {}) {
  return {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_qualification_surface",
    componentTestQualificationRows: [
      {
        kind: "sdlc_component_test_qualification_row",
        testClassId: "DiagnosticsFinalizeSpec",
        testcaseIds: ["TC-B086-001"],
        componentIds: ["cdme-diagnostics"],
        requirementIds: ["REQ-B086-001"],
        status: "failed",
        evidenceRefs: ["proof://b086/test-execution"]
      }
    ],
    componentExecutionFailureRegister: {
      kind: "component_execution_failure_register",
      registerVersion: "ts-component-depth-v1",
      failureRows: [
        {
          kind: "sdlc_component_execution_failure_row",
          failureId: "failure://b086/diagnostics",
          shardId: "test-shard-01-cdme-compiler",
          moduleName: "cdme-compiler",
          testClassId: "DiagnosticsFinalizeSpec",
          testcaseIds: ["TC-B086-001"],
          componentIds: ["cdme-diagnostics"],
          requirementIds: ["REQ-B086-001"],
          failureKind: "test_compile_error",
          repairTarget:
            "build_tenants/scala_spark/cdme-compiler/src/test/scala/cdme/compiler/diagnostics/DiagnosticsFinalizeSpec.scala",
          lawfulReentryPoint: "realization_refactor",
          attributionConfidence: "high",
          sourceRefs: ["proof://b086/source"],
          testRefs: ["proof://b086/test"],
          evidenceRefs: ["proof://b086/test-execution"],
          ...failureOverrides
        }
      ]
    }
  };
}

function releaseDepthRegister(overrides = {}) {
  const { releaseDepthParity = {}, ...registerOverrides } = overrides;
  return {
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "release_depth_parity_surface",
    releaseDepthParity: {
      kind: "sdlc_release_depth_parity_assessment",
      status: "blocked",
      summary: "test shard failed before pass evidence was admitted",
      blockingReasons: ["blocked_test_classes_have_no_pass_evidence"],
      evidenceRefs: ["proof://b086/release-depth"],
      ...releaseDepthParity
    },
    ...registerOverrides
  };
}

function executionReportPayload(manifest, output, executionEvidence) {
  return {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: pathToFileURL(
      manifest.fpEvaluateResultFile
    ).href,
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    outputFile: manifest.outputFile,
    digest: sha256Text(output),
    summary: "B-086 execution evidence fixture",
    unresolvedReasons: [],
    materializedFiles: [],
    executionEvidence,
    obligationAssessments: fulfilledAssessments(manifest, [`file://${manifest.outputFile}`])
  };
}

function executionEvidence(manifest, overrides = {}) {
  const shard = manifest.productMaterialization.executionShards[0];
  const status = overrides.status ?? "succeeded";
  return {
    kind: "sdlc_worker_execution_evidence",
    lane: overrides.lane ?? "test",
    command: overrides.command ?? manifest.productMaterialization.testExecutionContract,
    status,
    reportRefs: overrides.reportRefs ?? [`file://${manifest.outputFile}`],
    testsObserved: overrides.testsObserved ?? 1,
    passedCount: overrides.passedCount ?? (status === "succeeded" ? 1 : 0),
    failedCount: overrides.failedCount ?? (status === "failed" ? 1 : 0),
    shardEvidence: overrides.shardEvidence ?? [
      {
        kind: "sdlc_worker_execution_shard_evidence",
        shardId: shard.shardId,
        moduleName: shard.moduleName,
        lane: "test",
        command: shard.command,
        status,
        reportRefs: overrides.reportRefs ?? [`file://${manifest.outputFile}`],
        testsObserved: overrides.testsObserved ?? 1,
        passedCount: overrides.passedCount ?? (status === "succeeded" ? 1 : 0),
        failedCount: overrides.failedCount ?? (status === "failed" ? 1 : 0)
      }
    ]
  };
}

function assuranceWorkerReport(input = {}) {
  return {
    kind: "odd_sdlc.worker_result_report",
    projectionRole: "typed_fp_stage_projection",
    authoritativeStageResultRef: "file:///tmp/b086/fp_evaluate_result.json",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "derive_code_surface",
    targetAssetType: "code_surface",
    outputFile: "proof://b086/code-surface",
    digest: "sha256:code",
    summary: "B-086 assurance fixture",
    unresolvedReasons: [],
    materializedFiles: input.materializedFiles ?? [],
    executionEvidence: null,
    executionEvidenceErrors: [],
    obligationAssessments: []
  };
}

function designAxis(axisName, status = "satisfied", reasons = []) {
  return {
    kind: "sdlc_design_completeness_axis_verdict",
    axis: axisName,
    status,
    reasons,
    evidenceRefs: [`fixture://b086/${axisName}`]
  };
}

function designVerdict(overrides = {}) {
  return {
    kind: "sdlc_design_completeness_verdict",
    verdictVersion: "ts-design-depth-v1",
    entity: overrides.entity ?? designAxis("entity"),
    attribute: overrides.attribute ?? designAxis("attribute"),
    flow: overrides.flow ?? designAxis("flow")
  };
}

function implementationDesignRows(overrides = {}) {
  return {
    stackProfileRows: [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://b086/scala",
        language: "scala",
        buildTool: "sbt"
      }
    ],
    implementationModuleRows: [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "cdme-compiler",
        moduleRef: "module://cdme-compiler"
      }
    ],
    aggregateDomainModelRows: [
      {
        kind: "sdlc_aggregate_domain_model_row",
        modelRef: "model://b086/aggregate"
      }
    ],
    sunnyDaySequenceRows: [
      {
        kind: "sdlc_sunny_day_sequence_row",
        sequenceRef: "sequence://b086/sunny-day"
      }
    ],
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId: "component://compiler",
        moduleName: "cdme-compiler",
        relativePath: "src/main/scala/example/Compiler.scala",
        publicBoundary: "public",
        concernRole: "parser",
        requirementIds: ["REQ-B086-001"],
        sourceAssetRefs: ["fixture://b086/component-topology"]
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "component://compiler",
        moduleName: "cdme-compiler",
        relativePath: "src/main/scala/example/Compiler.scala",
        publicBoundary: "public",
        trancheId: "tranche://b086/1",
        firstProductFileToChange: "src/main/scala/example/Compiler.scala",
        upstreamComponentIds: [],
        requirementIds: ["REQ-B086-001"],
        sourceAssetRefs: ["fixture://b086/component-realization"]
      }
    ],
    fileTargetRows: [
      {
        kind: "sdlc_file_target_row",
        relativePath: "src/main/scala/example/Compiler.scala",
        role: "source"
      }
    ],
    ...overrides
  };
}

function aggregateDomainModelFixture(overrides = {}) {
  return {
    kind: "sdlc_aggregate_domain_model",
    modelVersion: "ts-design-depth-v1",
    entities: [
      {
        kind: "sdlc_aggregate_domain_entity",
        entityId: "entity:MappingSource",
        ownerModuleName: "cdme-compiler",
        attributes: [
          {
            kind: "sdlc_domain_attribute",
            attributeId: "attr:MappingSource.designSurfaceRef",
            name: "designSurfaceRef",
            valueType: "ref:design_surface",
            cardinality: "one",
            invariantRefs: ["REQ-B086-001"]
          }
        ],
        sourceModuleNames: ["cdme-compiler"]
      }
    ],
    operations: [
      {
        kind: "sdlc_domain_operation",
        operationId: "bindTypes",
        moduleName: "cdme-compiler",
        inputEntityIds: [],
        outputEntityIds: ["entity:MappingSource"],
        requiredAttributeIds: ["attr:MappingSource.designSurfaceRef"]
      }
    ],
    crossModuleReferences: [
      {
        fromModuleName: "cdme-compiler",
        toModuleName: "cdme-assurance",
        entityId: "mapping-source"
      }
    ],
    evidenceRefs: ["fixture://b086/aggregate"],
    ...overrides
  };
}

function sunnyDaySequenceFixture(overrides = {}) {
  return {
    kind: "sdlc_aggregate_sunny_day_sequence",
    sequenceVersion: "ts-design-depth-v1",
    steps: [
      {
        kind: "sdlc_sunny_day_sequence_step",
        stepId: "step-01-bind-types",
        moduleName: "cdme-compiler",
        operationId: "operation:bindtypes",
        inputEntityIds: [],
        outputEntityIds: ["mapping-source"],
        stateTransitionIds: []
      }
    ],
    evidenceRefs: ["fixture://b086/sequence"],
    ...overrides
  };
}

function moduleSchemaRegister(overrides = {}) {
  return {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    ...implementationDesignRows(),
    moduleSchemaFragments: [
      {
        kind: "sdlc_module_schema_fragment",
        moduleName: "cdme-compiler",
        entities: [
          {
            kind: "sdlc_domain_entity",
            entityId: "entity:MappingSource",
            moduleName: "cdme-compiler",
            ownership: "owned",
            attributes: [
              {
                kind: "sdlc_domain_attribute",
                attributeId: "attr:MappingSource.designSurfaceRef",
                name: "designSurfaceRef",
                valueType: "ref:design_surface",
                cardinality: "one",
                invariantRefs: ["REQ-B086-001"]
              }
            ],
            invariants: ["designSurfaceRef is stable"],
            sourceAssetRefs: ["fixture://b086/module"]
          }
        ],
        operations: [
          {
            kind: "sdlc_domain_operation",
            operationId: "operation:cdme-compiler.bind-types",
            moduleName: "cdme-compiler",
            inputEntityIds: ["entity:MappingSource"],
            outputEntityIds: ["entity:MappingSource"],
            requiredAttributeIds: ["attr:MappingSource.designSurfaceRef"]
          }
        ],
        requirementIds: ["REQ-B086-001"],
        sourceAssetRefs: ["fixture://b086/module"]
      }
    ],
    moduleStateDiagramFragments: [
      {
        kind: "sdlc_module_state_diagram_fragment",
        moduleName: "cdme-compiler",
        entityId: "entity:MappingSource",
        stateless: false,
        states: ["draft", "bound"],
        transitions: [
          {
            kind: "sdlc_entity_state_transition",
            transitionId: "transition:MappingSource.draft.bound",
            fromState: "draft",
            toState: "bound",
            operationId: "operation:cdme-compiler.bind-types",
            entityId: "entity:MappingSource"
          }
        ],
        requirementIds: ["REQ-B086-001"],
        sourceAssetRefs: ["fixture://b086/state"]
      }
    ],
    aggregateDomainModel: aggregateDomainModelFixture(),
    aggregateSunnyDaySequence: sunnyDaySequenceFixture(),
    designCompletenessVerdict: designVerdict(),
    ...overrides
  };
}

function sunnyDayRegister(overrides = {}) {
  return {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    ...implementationDesignRows(),
    moduleSchemaFragments: moduleSchemaRegister().moduleSchemaFragments,
    moduleStateDiagramFragments: moduleSchemaRegister().moduleStateDiagramFragments,
    aggregateDomainModel: aggregateDomainModelFixture(),
    aggregateSunnyDaySequence: sunnyDaySequenceFixture(),
    designCompletenessVerdict: designVerdict(),
    ...overrides
  };
}

function featureScope(overrides = {}) {
  return {
    kind: "sdlc_feature_scope",
    scopeVersion: "ts-scope-v1",
    mode: "steel_thread",
    scopeRef:
      "scope://odd_sdlc/implementation-design-surface/steel-thread/cdme-compiler",
    basisRefs: [
      "strategy://odd_sdlc/derive_implementation_design_surface/full_breadth"
    ],
    includedModuleNames: ["cdme-compiler"],
    includedEntityIds: [],
    includedOperationIds: [],
    deferredModuleNames: ["cdme-assurance"],
    ...overrides
  };
}

function successfulConstructorResult(contract, targetAssetId, overrides = {}) {
  return admitSdlcConstructorResult({
    operationType: overrides.operationType ??
      (contract.targetAssetType === "release_surface" ? "release" : "generate"),
    outputIdentity: {
      assetId: overrides.outputAssetId ?? targetAssetId,
      uri: `file:///workspace/${contract.targetAssetType}`,
      declaredType: overrides.declaredType ?? contract.targetAssetType,
      digest: `sha256:${contract.targetAssetType}`,
      byteCount: 128
    },
    evidenceRefs: [
      {
        ref: `file:///workspace/${contract.targetAssetType}`,
        evidenceType: "materialized_asset",
        digest: `sha256:evidence-${contract.targetAssetType}`
      }
    ],
    generatedAssetContract: {
      contractName: "generated-asset-contract",
      targetAssetId: overrides.outputAssetId ?? targetAssetId,
      satisfied: overrides.satisfied ?? true,
      materialized: overrides.materialized ?? true,
      diagnostics: overrides.diagnostics ?? [],
      foreignRealizationCandidates: overrides.foreignRealizationCandidates ?? []
    },
    ambiguityCandidates: overrides.ambiguityCandidates ?? []
  });
}

function assuranceManifest(input = {}) {
  return {
    kind: "sdlc_worker_handoff_manifest",
    reportFile: "proof://b086/worker-report",
    productMaterialization: {
      kind: "sdlc_product_materialization_contract",
      required: input.materializationRequired ?? true,
      activeTenant: "scala_spark",
      selectedOutputRoot: "build_tenants/scala_spark",
      tenantRoot: "/workspace/build_tenants/scala_spark",
      relativePathBasis: "tenant_root",
      declaredModuleNames: ["cdme-compiler"],
      buildExecutionContract: "sbt compile",
      testExecutionContract: "sbt test",
      manifestFile: "proof://b086/materialization-manifest",
      requiredRoles: ["source"]
    },
    retryContext: input.retryContext ?? {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: []
    }
  };
}

function assurancePostflight(blockingReasons) {
  return {
    kind: "sdlc_operator_postflight_result",
    status: blockingReasons.length === 0 ? "passed" : "blocked",
    blockingReasons,
    blockingReasonCarriers: [],
    evidenceRefs: ["proof://b086/postflight"]
  };
}

function closureEntry(input = {}) {
  return {
    kind: "sdlc_requirement_closure_entry",
    requirementId: input.requirementId ?? "REQ-B086-001",
    sourceInputUris: input.sourceInputUris ?? ["fixture://b086/requirements"],
    assetIds: input.assetIds ?? ["asset://code_surface"],
    producedByGraphFunctions: input.producedByGraphFunctions ?? [
      "derive_code_surface"
    ],
    proofKinds: input.proofKinds ?? ["behavioral_test"],
    authorityVerbs: input.authorityVerbs ?? ["validates"],
    evidenceRefs: input.evidenceRefs ?? ["proof://b086/requirement"],
    traceabilityStatus: input.traceabilityStatus ?? "behavioral_evidence",
    fulfillmentStatus: input.fulfillmentStatus ?? "fulfilled",
    carryStatus: input.carryStatus ?? "fulfilled",
    openReasons: input.openReasons ?? []
  };
}

function closureRegister(entries) {
  return {
    kind: "sdlc_requirement_closure_register",
    entries,
    fulfilledRequirementIds: entries
      .filter((entry) => entry.fulfillmentStatus === "fulfilled")
      .map((entry) => entry.requirementId),
    carriedForwardRequirementIds: entries
      .filter((entry) => entry.carryStatus === "carried_forward")
      .map((entry) => entry.requirementId),
    unresolvedRequirementIds: entries
      .filter((entry) => entry.fulfillmentStatus !== "fulfilled")
      .map((entry) => entry.requirementId),
    emittedRuntimeEventKinds: []
  };
}

function gapDossier(reason) {
  return {
    kind: "sdlc_postflight_gap_dossier",
    status: "open",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: "derive_code_surface",
    vectorIndex: 11,
    targetAssetType: "code_surface",
    reasons: [
      {
        kind: "sdlc_postflight_gap_reason",
        reason,
        reasonClass: "contract_violation"
      }
    ],
    evidenceRefs: ["proof://b086/gap"],
    priorManifestId: "proof://b086/manifest",
    currentGapDossierRef: `proof://b086/gap/${reason}`,
    retryEligible: true,
    nextLawfulActions: ["retry_same_edge"]
  };
}

test("B-086 component-depth exact protocol accepts canonical carrier and rejects wrong kind/version", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_component_repair_schedule_surface");
  const positive = writeComponentRegister(handoff, repairScheduleRegister());

  const admitted = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(admitted.status, "admitted");

  writeComponentRegister(handoff, {
    ...repairScheduleRegister(),
    kind: "not_component_depth_register"
  });
  const badKind = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(badKind.status, "rejected");
  assert.match(badKind.blockingReasons.join(","), /unexpected protocol value/u);

  writeComponentRegister(handoff, {
    ...repairScheduleRegister(),
    registerVersion: "ts-component-depth-v2"
  });
  const badVersion = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(badVersion.status, "rejected");
  assert.match(badVersion.blockingReasons.join(","), /unsupported version/u);

  writeComponentRegister(handoff, {
    ...repairScheduleRegister({
      componentRepairSchedule: {
        kind: undefined
      }
    })
  });
  const missingNestedKind = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(missingNestedKind.status, "rejected");
  assert.match(missingNestedKind.blockingReasons.join(","), /kind/u);

  writeComponentRegister(handoff, repairScheduleRegister());
  assert.equal(
    sha256Text(readFileSync(handoff.outputFile, "utf8")),
    sha256Text(positive)
  );
});

test("B-086 component topology rejects aliases and admits exact role rows", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_implementation_design_surface");
  writeDesignRegister(handoff, moduleSchemaRegister({
    componentTopologyRows: [
      {
        componentId: "component://parser",
        moduleName: "example-module",
        relativePath: "src/main/scala/example/Parser.scala",
        publicBoundary: false,
        concern: "parsing",
        requirementIds: ["REQ-B086-001"],
        sourceAssetRefs: ["fixture://b086/component-topology"]
      },
      {
        kind: "sdlc_component_topology_row",
        componentId: "component://boundary",
        moduleName: "example-module",
        relativePath: "src/main/scala/example/PublicApi.scala",
        publicBoundary: true,
        concern: "public_boundary",
        requirementIds: ["REQ-B086-002"],
        sourceAssetRefs: ["fixture://b086/component-topology"]
      },
      {
        kind: "sdlc_component_topology_row",
        componentId: "component://diagnostics",
        moduleName: "example-module",
        relativePath: "src/main/scala/example/Diagnostics.scala",
        publicBoundary: "internal",
        concernRole: "error_reporting",
        requirementIds: ["REQ-B086-003"],
        sourceAssetRefs: ["fixture://b086/component-topology"]
      }
    ]
  }));

  const aliasAdmission = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(aliasAdmission.status, "rejected");

  writeDesignRegister(handoff, moduleSchemaRegister({
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId: "component://parser",
        moduleName: "example-module",
        relativePath: "src/main/scala/example/Parser.scala",
        publicBoundary: "internal",
        concernRole: "parser",
        requirementIds: ["REQ-B086-001"],
        sourceAssetRefs: ["fixture://b086/component-topology"]
      },
      {
        kind: "sdlc_component_topology_row",
        componentId: "component://boundary",
        moduleName: "example-module",
        relativePath: "src/main/scala/example/PublicApi.scala",
        publicBoundary: "public",
        concernRole: "other",
        requirementIds: ["REQ-B086-002"],
        sourceAssetRefs: ["fixture://b086/component-topology"]
      },
      {
        kind: "sdlc_component_topology_row",
        componentId: "component://diagnostics",
        moduleName: "example-module",
        relativePath: "src/main/scala/example/Diagnostics.scala",
        publicBoundary: "internal",
        concernRole: "reporting",
        requirementIds: ["REQ-B086-003"],
        sourceAssetRefs: ["fixture://b086/component-topology"]
      }
    ]
  }));

  const admitted = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(admitted.status, "admitted");
  assert.deepEqual(
    admitted.register.componentTopologyRows.map((row) => row.publicBoundary),
    ["internal", "public", "internal"]
  );
  assert.deepEqual(
    admitted.register.componentTopologyRows.map((row) => row.concernRole),
    ["parser", "other", "reporting"]
  );

  writeDesignRegister(handoff, moduleSchemaRegister({
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId: "component://tenant-vocab",
        moduleName: "example-module",
        relativePath: "src/main/scala/example/TenantVocab.scala",
        publicBoundary: "internal",
        concernRole: "lineage",
        requirementIds: ["REQ-B086-004"],
        sourceAssetRefs: ["fixture://b086/component-topology"]
      }
    ]
  }));
  const rejected = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(rejected.status, "rejected");
  assert.match(rejected.blockingReasons.join(","), /concernRole/u);
});

test("B-086 component failure F_D admits declared targets and rejects path aliases", () => {
  const root = workspace();
  const handoff = manifest(root, "qualify_component_test_execution_surface");
  const output = writeComponentRegister(
    handoff,
    failedQualificationRegister({ repairTarget: "component_test" })
  );

  const admitted = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(admitted.status, "admitted");
  assert.equal(
    admitted.register.componentExecutionFailureRegister.failureRows[0].failureKind,
    "test_compile_error"
  );
  assert.equal(
    admitted.register.componentExecutionFailureRegister.failureRows[0].repairTarget,
    "component_test"
  );

  const ledger = deriveComponentDepthAssuranceLedger({
    manifest: handoff,
    report: workerReport(handoff, output)
  });
  assert(ledger);
  assert.equal(ledger.reasons.length, 0);

  writeComponentRegister(
    handoff,
    failedQualificationRegister({
      repairTarget: "component_test",
      failureKind: "scalac_test_compile_error"
    })
  );
  const tenantSpecific = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(tenantSpecific.status, "rejected");
  assert.match(tenantSpecific.blockingReasons.join(","), /failureKind/u);

  writeComponentRegister(
    handoff,
    failedQualificationRegister({
      repairTarget: "somewhere in tests"
    })
  );
  const unboundRepairTarget = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(unboundRepairTarget.status, "rejected");
  assert.match(unboundRepairTarget.blockingReasons.join(","), /repairTarget/u);

  writeComponentRegister(handoff, {
    ...failedQualificationRegister({ repairTarget: "component_test" }),
    kind: "sdlc_component_test_qualification_register"
  });
  const alternateRegisterKind = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(alternateRegisterKind.status, "rejected");
  assert.match(alternateRegisterKind.blockingReasons.join(","), /kind/u);
});

test("B-086 component repair schedule statuses admit declared triage and reject parser-local guesses", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_component_repair_schedule_surface");
  const output = writeComponentRegister(
    handoff,
    repairScheduleRegister({
      componentRepairSchedule: {
        scheduleStatus: "triage_gap",
        repairRows: []
      }
    })
  );

  const admitted = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(admitted.status, "admitted");
  const ledger = deriveComponentDepthAssuranceLedger({
    manifest: handoff,
    report: workerReport(handoff, output)
  });
  assert(ledger);
  assert(
    ledger.reasons.some(
      (reason) => reason.code === "component_repair_schedule_triage_gap"
    )
  );

  writeComponentRegister(
    handoff,
    repairScheduleRegister({
      componentRepairSchedule: {
        scheduleStatus: "maybe_later",
        repairRows: []
      }
    })
  );
  const rejected = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(rejected.status, "rejected");
  assert.match(rejected.blockingReasons.join(","), /scheduleStatus/u);
});

test("B-086 release-depth parity admits exact blockers and rejects non-contract statuses", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_release_depth_parity_surface");
  writeComponentRegister(handoff, releaseDepthRegister());

  const admitted = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(admitted.status, "admitted");
  assert.equal(admitted.register.releaseDepthParity.status, "blocked");
  assert.deepEqual(admitted.register.releaseDepthParity.blockingReasons, [
    "blocked_test_classes_have_no_pass_evidence"
  ]);

  writeComponentRegister(
    handoff,
    releaseDepthRegister({
      releaseDepthParity: {
        status: "complete"
      }
    })
  );
  const rejected = admitComponentDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(rejected.status, "rejected");
  assert.match(rejected.blockingReasons.join(","), /releaseDepthParity.status/u);
});

test("B-086 execution evidence admits declared pending and rejects non-contract status vocabulary", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_test_execution_result_surface");
  const output = writeOutput(handoff, "# test_execution_result_surface\n");

  writeReportPayload(
    handoff,
    executionReportPayload(handoff, output, executionEvidence(handoff, {
        status: "pending",
        testsObserved: 0,
        passedCount: 0,
        failedCount: 0
      }))
  );
  const report = readWorkerResultReport(handoff);
  assert.equal(report.executionEvidence.status, "pending");
  const postflight = evaluateSdlcComputeStage({ manifest: handoff, report });
  assert.equal(postflight.status, "passed");
  assert.equal(
    postflight.blockingReasonCarriers.find(
      (reason) => reason.code === "test_execution_not_succeeded"
    )?.lawfulReentryPoint,
    "triage_gap"
  );

  writeReportPayload(
    handoff,
    executionReportPayload(handoff, output, executionEvidence(handoff, {
        status: "not_run",
        testsObserved: 0,
        passedCount: 0,
        failedCount: 0
      }))
  );
  assert.throws(() => readWorkerResultReport(handoff), /status/u);

  writeReportPayload(
    handoff,
    executionReportPayload(handoff, output, executionEvidence(handoff, {
        status: "skipped"
      }))
  );
  assert.throws(() => readWorkerResultReport(handoff), /status/u);
});

test("B-086 failed execution evidence is repair input unless counts contradict it", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_test_execution_result_surface");
  const output = writeOutput(handoff, "# test_execution_result_surface\n");

  writeReportPayload(
    handoff,
    executionReportPayload(handoff, output, executionEvidence(handoff, {
        status: "failed",
        testsObserved: 0,
        passedCount: 0,
        failedCount: 0
      }))
  );
  const failedReport = readWorkerResultReport(handoff);
  const admittedFailure = evaluateSdlcComputeStage({
    manifest: handoff,
    report: failedReport
  });
  assert.equal(admittedFailure.status, "passed");

  writeReportPayload(
    handoff,
    executionReportPayload(handoff, output, executionEvidence(handoff, {
        status: "failed",
        testsObserved: 2,
        passedCount: 2,
        failedCount: 0
      }))
  );
  const contradictoryReport = readWorkerResultReport(handoff);
  const contradiction = evaluateSdlcComputeStage({
    manifest: handoff,
    report: contradictoryReport
  });
  assert.equal(contradiction.status, "passed");
  assert.equal(
    contradiction.blockingReasonCarriers.find(
      (reason) => reason.code === "test_execution_evidence_contradiction"
    )?.lawfulReentryPoint,
    "triage_gap"
  );
});

test("B-086 archive F_D accepts admitted execution-result refs and rejects prose-only dependency claims", () => {
  const root = workspace({ includeRequirements: false });
  const executionManifest = manifest(root, "derive_test_execution_result_surface", 17);
  const executionOutput = writeOutput(
    executionManifest,
    "# test_execution_result_surface\n"
  );
  writeHandoffFiles(executionManifest);
  writeReportPayload(
    executionManifest,
    executionReportPayload(
        executionManifest,
        executionOutput,
        executionEvidence(executionManifest)
      )
  );
  assert.equal(
    evaluateSdlcComputeStage({
      manifest: executionManifest,
      report: readWorkerResultReport(executionManifest)
    }).status,
    "passed"
  );

  const archiveManifest = manifest(root, "derive_test_run_archive_surface", 18);
  writeHandoffFiles(archiveManifest);
  const archiveOutput = writeOutput(
    archiveManifest,
    [
      "# test_run_archive_surface",
      "",
      "Archived dependencies:",
      ...archiveManifest.inputAssetTypes.map((assetType) => `- ${assetType}`),
      ""
    ].join("\n")
  );
  const archiveOutputRef = `file://${archiveManifest.outputFile}`;
  const proseOnly = executionReportPayload(archiveManifest, archiveOutput, null);
  writeReportPayload(
    archiveManifest,
    {
      ...proseOnly,
      obligationAssessments: fulfilledAssessments(archiveManifest, [
        archiveOutputRef
      ])
    }
  );
  const proseOnlyPostflight = evaluateSdlcComputeStage({
    manifest: archiveManifest,
    report: readWorkerResultReport(archiveManifest)
  });
  assert.equal(proseOnlyPostflight.status, "passed");
  assert(
    proseOnlyPostflight.blockingReasonCarriers.some(
      (reason) =>
        reason.code === "source_asset_dependency_missing" &&
        reason.detail.includes("admitted execution-result report missing")
    )
  );

  writeReportPayload(
    archiveManifest,
    {
      ...proseOnly,
      obligationAssessments: archiveManifest.traversalObligationContext.obligations.map(
        (obligation) => ({
          kind: "sdlc_worker_obligation_assessment",
          obligationId: obligation.obligationId,
          fulfillmentStatus: "fulfilled",
          evidenceRefs: obligation.obligationId ===
            "source_asset:test_execution_result_surface"
            ? [archiveOutputRef, `file://${executionManifest.reportFile}`]
            : [archiveOutputRef],
          blockingReasons: []
        })
      )
    }
  );
  const archivePostflight = evaluateSdlcComputeStage({
    manifest: archiveManifest,
    report: readWorkerResultReport(archiveManifest)
  });
  assert.equal(archivePostflight.status, "passed");
});

test("B-086 accepted-carrier retry law is explicit and rejects unknown next actions", () => {
  const root = workspace();
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const reason = "test_execution_evidence_missing";
  const blockingReason = sdlcBlockingReasonFromLegacy({ reason });
  const dossier = {
    kind: "sdlc_postflight_gap_dossier",
    status: "open",
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 26,
    targetAssetType: "test_execution_result_surface",
    reasons: [
      {
        kind: "sdlc_postflight_gap_reason",
        reason,
        reasonClass: "code_to_test",
        blockingReason
      }
    ],
    evidenceRefs: ["file:///tmp/b086/test_execution_result_surface.md"],
    priorManifestId: "file:///tmp/b086/handoff_manifest.json",
    currentGapDossierRef: "file:///tmp/b086/gap_dossier.json",
    retryEligible: true,
    nextLawfulActions: ["retry_same_edge", "repair_worker_output"]
  };
  const handoff = deriveWorkerHandoffManifest({
    workspaceRoot: root,
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 26,
    contract,
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [dossier]
    },
    runId: "b086-accepted-carrier"
  });
  const files = writeHandoffFiles(handoff);
  const invocationPackage = JSON.parse(
    readFileSync(files.invocationPackagePath, "utf8")
  );
  const [instruction] = invocationPackage.retryRepairInstructions;

  assert.equal(
    instruction.acceptedCarrierSchemaRef,
    "schema://odd_sdlc/test_execution_evidence"
  );
  assert(
    instruction.acceptedCarrierFieldSet.includes("shardEvidence[].status")
  );
  assert(
    !instruction.acceptedCarrierFieldSet.includes(
      "designCompletenessVerdict.axisVerdicts"
    )
  );

  assert.throws(
    () =>
      admitPostflightGapDossier({
        ...dossier,
        nextLawfulActions: ["retry_broadly"]
      }),
    /nextLawfulActions/u
  );

  const postflightDossier = constructPostflightGapDossier({
    manifest: handoff,
    postflight: {
      kind: "sdlc_operator_postflight_result",
      status: "blocked",
      blockingReasons: [reason],
      blockingReasonCarriers: [blockingReason],
      evidenceRefs: dossier.evidenceRefs
    }
  });
  assert.deepEqual(postflightDossier.nextLawfulActions, ["retry_same_edge"]);
});

test("B-086 design-depth admission rejects aliases and admits exact selected payloads", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_implementation_design_surface");
  writeDesignRegister(
    handoff,
    moduleSchemaRegister({
      moduleSchemaFragments: [
        {
          moduleName: "cdme-compiler",
          entities: [
            {
              name: "MappingSource",
              moduleName: "cdme-compiler",
              ownership: "cdme-compiler",
              attributes: [
                {
                  name: "designSurfaceRef",
                  valueType: "ref:design_surface",
                  cardinality: "1..1"
                },
                {
                  name: "sourceRows",
                  valueType: "List<SourceRow>",
                  cardinality: "one_to_many"
                },
                {
                  name: "optionalProjection",
                  valueType: "ProjectionRef",
                  cardinality: "zero_to_one"
                },
                {
                  entityId: "MappingSource",
                  attributeId: "compilerState",
                  typeRef: "CompilerState",
                  requirementIds: ["REQ-B086-001"]
                }
              ]
            }
          ],
          operations: [
            {
              operation: "bindTypes",
              inputEntityIds: ["entity:cdme-compiler.mapping-source"],
              outputEntityIds: ["entity:cdme-compiler.mapping-source"],
              requiredAttributeIds: [
                "attr:cdme-compiler.mapping-source.design-surface-ref"
              ]
            }
          ],
          requirementIds: ["REQ-B086-001"],
          sourceAssetRefs: ["fixture://b086/module-alias"]
        }
      ],
      moduleStateDiagramFragments: [
        {
          moduleName: "cdme-compiler",
          entityId: "entity:cdme-compiler.mapping-source",
          stateless: false,
          states: [{ stateId: "draft" }, { stateId: "bound" }],
          transitions: [
            {
              kind: "sdlc_module_state_transition",
              transitionId: "transition:mapping-source.draft.bound",
              fromState: "draft",
              toState: "bound",
              operationId: "bindTypes",
              entityId: "entity:cdme-compiler.mapping-source"
            }
          ],
          requirementIds: ["REQ-B086-001"],
          sourceAssetRefs: ["fixture://b086/state-alias"]
        }
      ]
    })
  );
  const aliasAdmission = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(aliasAdmission.status, "rejected");
  assert.match(aliasAdmission.blockingReasons.join(","), /kind|cardinality|ownership/u);

  writeDesignRegister(handoff, moduleSchemaRegister());
  const admitted = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(admitted.status, "admitted");
  assert.equal(
    admitted.register.moduleSchemaFragments[0].entities[0].attributes[0]
      .cardinality,
    "one"
  );
  assert.equal(
    admitted.register.moduleSchemaFragments[0].entities[0].ownership,
    "owned"
  );
  assert.deepEqual(admitted.register.moduleStateDiagramFragments[0].states, [
    "draft",
    "bound"
  ]);
  assert.equal(
    admitted.register.moduleStateDiagramFragments[0].transitions[0].kind,
    "sdlc_entity_state_transition"
  );
  assert.equal(
    admitted.register.moduleSchemaFragments[0].operations[0].operationId,
    "operation:cdme-compiler.bind-types"
  );

  writeDesignRegister(
    handoff,
    moduleSchemaRegister({
      moduleSchemaFragments: [
        {
          kind: "sdlc_module_schema_fragment",
          entities: [],
          operations: [],
          requirementIds: ["REQ-B086-001"],
          sourceAssetRefs: ["fixture://b086/missing-module"]
        }
      ]
    })
  );
  const missingIdentity = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(missingIdentity.status, "rejected");
  assert.match(missingIdentity.blockingReasons.join(","), /moduleName/u);
});

test("B-086 aggregate-domain admission rejects aliases and admits exact payloads", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_implementation_design_surface");
  writeDesignRegister(handoff, moduleSchemaRegister({
    aggregateDomainModel: {
      kind: "sdlc_aggregate_domain_model",
      ownerModuleNames: ["cdme-compiler"],
      entities: [
        {
          kind: "sdlc_aggregate_entity",
          entityId: "entity:MappingSource",
          ownerModuleName: "cdme-compiler",
          ownership: "owned",
          attributes: [
            {
              kind: "sdlc_aggregate_attribute",
              attributeId: "attr:MappingSource.sourceRows",
              ownerModuleName: "cdme-compiler",
              name: "sourceRows",
              valueType: "List<SourceRow>",
              cardinality: "one_to_many",
              invariantRefs: ["REQ-B086-001"]
            }
          ],
          sourceModuleFragmentRefs: ["module-fragment://cdme-compiler/source"]
        },
        {
          entityId: "AggregateReference",
          ownerModuleName: "cdme-compiler"
        }
      ],
      attributes: [
        {
          entityId: "AggregateReference",
          name: "referenceDigest",
          type: "string"
        }
      ],
      operations: [
        {
          kind: "sdlc_aggregate_operation",
          operationId: "cdme-compiler.bindTypes",
          ownerModuleName: "cdme-compiler",
          inputEntityIds: ["entity:MappingSource"],
          outputEntityIds: ["entity:MappingSource"],
          requiredAttributeIds: ["attr:MappingSource.sourceRows"]
        },
        {
          operationId: "cdme-compiler.linkReference",
          ownerModuleName: "cdme-compiler",
          inputs: ["AggregateReference"],
          outputs: ["AggregateReference"]
        }
      ],
      stateFlows: [
        {
          entityId: "entity:MappingSource",
          states: ["draft", "bound"]
        }
      ],
      crossModuleReferences: [],
      evidenceRefs: ["fixture://b086/aggregate-alias"]
    },
    designCompletenessVerdict: {
      kind: "sdlc_design_completeness_verdict",
      verdictVersion: "ts-design-completeness-v1",
      scopeMode: "steel_thread",
      scopedModuleNames: ["cdme-compiler"],
      deferredModuleNames: ["cdme-assurance"],
      entity: {
        kind: "sdlc_design_completeness_axis_verdict",
        axis: "entity",
        verdict: "satisfied",
        rationale: "entity surface complete",
        scope: "steel_thread:cdme-compiler"
      },
      attribute: {
        kind: "sdlc_design_completeness_axis_verdict",
        axis: "attribute",
        verdict: "satisfied",
        rationale: "attribute surface complete",
        scope: "steel_thread:cdme-compiler"
      },
      axisVerdicts: {
        flow: {
          verdict: "satisfied_for_included_lifecycles",
          evidence: "scoped flow complete"
        }
      }
    }
  }));

  const aliasAdmission = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(aliasAdmission.status, "rejected");
  assert.match(
    aliasAdmission.blockingReasons.join(","),
    /unexpected field|kind|cardinality|verdict/u
  );

  writeDesignRegister(handoff, moduleSchemaRegister());
  const admitted = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(admitted.status, "admitted");
  assert.equal(admitted.register.aggregateDomainModel.modelVersion, "ts-design-depth-v1");
  assert.equal(
    admitted.register.aggregateDomainModel.entities[0].kind,
    "sdlc_aggregate_domain_entity"
  );
  assert.equal(
    admitted.register.aggregateDomainModel.entities[0].attributes[0].cardinality,
    "one"
  );
  assert.equal(
    admitted.register.aggregateDomainModel.operations[0].kind,
    "sdlc_domain_operation"
  );
  assert.equal(admitted.register.designCompletenessVerdict.entity.status, "satisfied");
  assert.equal(
    admitted.register.designCompletenessVerdict.flow.status,
    "satisfied"
  );
});

test("B-086 design completeness accepts allowed operation/entity aliases and rejects disambiguated mismatch", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_implementation_design_surface");
  writeDesignRegister(handoff, sunnyDayRegister());
  const admittedAlias = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(admittedAlias.status, "admitted");

  const aliasLedger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: handoff.targetAssetType,
      featureScope: featureScope()
    },
    report: { outputFile: handoff.outputFile }
  });
  assert(aliasLedger);
  assert.equal(aliasLedger.verdict, "satisfied");
  assert(
    !aliasLedger.reasons.some((reason) =>
      reason.code.startsWith("design_flow_operation_missing:")
    )
  );
  assert(
    !aliasLedger.reasons.some((reason) =>
      reason.code.startsWith("design_flow_entity_missing:")
    )
  );

  writeDesignRegister(
    handoff,
    sunnyDayRegister({
      aggregateSunnyDaySequence: {
        kind: "sdlc_aggregate_sunny_day_sequence",
        sequenceVersion: "ts-design-depth-v1",
        steps: [
          {
            kind: "sdlc_sunny_day_sequence_step",
            stepId: "step-01-bind-types",
            moduleName: "cdme-compiler",
            operationId: "operation:compileinvoice",
            inputEntityIds: [],
            outputEntityIds: ["entity:Invoice"],
            stateTransitionIds: []
          }
        ],
        evidenceRefs: ["fixture://b086/sequence-mismatch"]
      }
    })
  );
  const mismatchLedger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: handoff.targetAssetType,
      featureScope: featureScope()
    },
    report: { outputFile: handoff.outputFile }
  });
  assert(mismatchLedger);
  assert.equal(mismatchLedger.verdict, "open_gap");
  assert(
    mismatchLedger.reasons.some((reason) =>
      reason.code.startsWith("design_flow_operation_missing:")
    )
  );
  assert(
    mismatchLedger.reasons.some((reason) =>
      reason.code.startsWith("design_flow_entity_missing:")
    )
  );
});

test("B-086 aggregate sunny-day flow accepts graph-wide cross-module entity exchange", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_implementation_design_surface");
  const crossModuleRegister = (inputEntityIds) =>
    sunnyDayRegister({
      aggregateDomainModel: {
        kind: "sdlc_aggregate_domain_model",
        modelVersion: "ts-design-depth-v1",
        entities: [
          {
            kind: "sdlc_aggregate_domain_entity",
            entityId: "entity:RunResult",
            ownerModuleName: "cdme-executor",
            attributes: [
              {
                kind: "sdlc_domain_attribute",
                attributeId: "attr:RunResult.status",
                name: "status",
                valueType: "string",
                cardinality: "one",
                invariantRefs: ["REQ-B086-001"]
              }
            ],
            sourceModuleNames: ["cdme-executor"]
          },
          {
            kind: "sdlc_aggregate_domain_entity",
            entityId: "entity:Ledger",
            ownerModuleName: "cdme-accounting",
            attributes: [
              {
                kind: "sdlc_domain_attribute",
                attributeId: "attr:Ledger.recordsIn",
                name: "recordsIn",
                valueType: "List<RunResult>",
                cardinality: "many",
                invariantRefs: ["REQ-B086-001"]
              }
            ],
            sourceModuleNames: ["cdme-accounting"]
          }
        ],
        operations: [
          {
            kind: "sdlc_domain_operation",
            operationId: "operation:AccountingVerifier.verify",
            moduleName: "cdme-accounting",
            inputEntityIds: ["entity:RunResult"],
            outputEntityIds: ["entity:Ledger"],
            requiredAttributeIds: [
              "attr:RunResult.status",
              "attr:Ledger.recordsIn"
            ]
          }
        ],
        crossModuleReferences: [],
        evidenceRefs: ["fixture://b086/cross-module-aggregate"]
      },
      aggregateSunnyDaySequence: {
        kind: "sdlc_aggregate_sunny_day_sequence",
        sequenceVersion: "ts-design-depth-v1",
        steps: [
          {
            kind: "sdlc_sunny_day_sequence_step",
            stepId: "step-01-verify-run",
            moduleName: "cdme-accounting",
            operationId: "operation:AccountingVerifier.verify",
            inputEntityIds,
            outputEntityIds: ["ledger"],
            stateTransitionIds: []
          }
        ],
        evidenceRefs: ["fixture://b086/cross-module-sequence"]
      }
    });
  const fullBreadthScope = featureScope({
    mode: "full_breadth",
    scopeRef:
      "scope://odd_sdlc/aggregate-sunny-day-sequence-surface/full-breadth",
    includedModuleNames: ["cdme-executor", "cdme-accounting"],
    deferredModuleNames: []
  });

  writeDesignRegister(handoff, crossModuleRegister(["run-result"]));
  const satisfiedLedger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: handoff.targetAssetType,
      featureScope: fullBreadthScope
    },
    report: { outputFile: handoff.outputFile }
  });
  assert(satisfiedLedger);
  assert.equal(satisfiedLedger.verdict, "satisfied");
  assert(
    !satisfiedLedger.reasons.some((reason) =>
      reason.code.startsWith("design_flow_entity_missing:")
    )
  );

  writeDesignRegister(handoff, crossModuleRegister(["missing-foreign-entity"]));
  const missingLedger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: handoff.targetAssetType,
      featureScope: fullBreadthScope
    },
    report: { outputFile: handoff.outputFile }
  });
  assert(missingLedger);
  assert.equal(missingLedger.verdict, "open_gap");
  assert(
    missingLedger.reasons.some(
      (reason) =>
        reason.code === "design_flow_entity_missing:missing-foreign-entity"
    )
  );
});

test("B-086 worker-authored design completeness partial escalates to F_P instead of F_D failure", () => {
  const root = workspace();
  const handoff = manifest(root, "derive_implementation_design_surface");
  writeDesignRegister(
    handoff,
    sunnyDayRegister({
      designCompletenessVerdict: designVerdict({
        attribute: designAxis("attribute", "partial", [
          "attribute selection remains underdisambiguated"
        ])
      })
    })
  );
  const ledger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: handoff.targetAssetType,
      featureScope: featureScope()
    },
    report: { outputFile: handoff.outputFile }
  });
  assert(ledger);
  assert.equal(ledger.verdict, "fp_escalation");
  assert.equal(
    ledger.reasons.find(
      (reason) => reason.code === "design_completeness_attribute_partial"
    )?.lawfulReentryPoint,
    "escalate_to_fp"
  );

  writeDesignRegister(
    handoff,
    sunnyDayRegister({
      designCompletenessVerdict: {
        kind: "sdlc_design_completeness_verdict",
        verdictVersion: "ts-design-depth-v1",
        axisVerdicts: {
          entity: { verdict: "satisfied", evidence: "entity bound" }
        }
      }
    })
  );
  const malformed = admitDesignDepthRegisterFromArtifact({
    targetAssetType: handoff.targetAssetType,
    outputFile: handoff.outputFile
  });
  assert.equal(malformed.status, "rejected");
  assert.match(malformed.blockingReasons.join(","), /unexpected field|attribute|flow/u);
});

test("B-086 assurance dimensions expose positive and negative F_D outcomes", () => {
  const materialized = deriveMaterializationAssuranceLedger({
    manifest: assuranceManifest(),
    report: assuranceWorkerReport({
      materializedFiles: [
        {
          kind: "sdlc_materialized_product_file",
          role: "source",
          relativePath: "src/main/scala/Mapper.scala",
          absolutePath:
            "/workspace/build_tenants/scala_spark/src/main/scala/Mapper.scala",
          digest: "sha256:mapper",
          byteCount: 64
        }
      ]
    }),
    postflight: assurancePostflight([])
  });
  const materializationDrift = deriveMaterializationAssuranceLedger({
    manifest: assuranceManifest(),
    report: assuranceWorkerReport(),
    postflight: assurancePostflight(["output_file_manifest_mismatch"])
  });
  assert.equal(materialized.verdict, "satisfied");
  assert.equal(materializationDrift.verdict, "blocked");
  assert.equal(
    materializationDrift.reasons[0].lawfulReentryPoint,
    "repair_worker_output"
  );

  const semanticCovered = deriveSemanticConvergenceAssuranceLedger({
    targetRefs: ["target://lineage"],
    claims: [
      {
        kind: "sdlc_semantic_convergence_claim",
        targetRef: "target://lineage",
        status: "covered",
        evidenceRefs: ["proof://semantic"]
      }
    ]
  });
  const semanticContradiction = deriveSemanticConvergenceAssuranceLedger({
    targetRefs: ["target://lineage"],
    claims: [
      {
        kind: "sdlc_semantic_convergence_claim",
        targetRef: "target://lineage",
        status: "contradicted",
        evidenceRefs: ["proof://semantic-contradiction"]
      }
    ]
  });
  assert.equal(semanticCovered.verdict, "satisfied");
  assert.equal(semanticContradiction.verdict, "reprice_required");
  assert.equal(semanticContradiction.reasons[0].lawfulReentryPoint, "design_reframe");

  const prior = gapDossier("materialized_product_relative_path_mismatch");
  const carried = deriveObligationCarryAssuranceLedger({
    manifest: assuranceManifest({
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [],
        priorGapDossiers: [prior]
      }
    }),
    currentGapDossier: prior
  });
  const dropped = deriveObligationCarryAssuranceLedger({
    manifest: assuranceManifest({
      retryContext: {
        kind: "sdlc_worker_retry_context",
        retryAttemptRefs: [],
        priorGapDossiers: [prior]
      }
    }),
    currentGapDossier: null
  });
  assert.equal(carried.verdict, "satisfied");
  assert.equal(dropped.verdict, "open_gap");

  const fulfilled = deriveRequirementFulfillmentAssuranceLedger({
    closureRegister: closureRegister([closureEntry()])
  });
  const ambiguousRequirement = deriveRequirementFulfillmentAssuranceLedger({
    closureRegister: closureRegister([closureEntry()]),
    requiredRequirementIds: ["REQ-B086-001"],
    ambiguousRequirementIds: ["REQ-B086-001"]
  });
  assert.equal(fulfilled.verdict, "satisfied");
  assert.equal(ambiguousRequirement.verdict, "reprice_required");
  assert.equal(
    ambiguousRequirement.reasons[0].lawfulReentryPoint,
    "requirement_reprice"
  );

  const noAmbiguity = deriveAmbiguityAssuranceLedger({ findings: [] });
  const authorityAmbiguity = deriveAmbiguityAssuranceLedger({
    findings: [
      {
        kind: "sdlc_ambiguity_finding",
        ambiguityKind: "authority_layer",
        code: "authority_layer_ambiguous",
        message: "Authority layer is ambiguous.",
        evidenceRefs: ["proof://authority"]
      }
    ]
  });
  assert.equal(noAmbiguity.verdict, "satisfied");
  assert.equal(authorityAmbiguity.verdict, "reprice_required");

  const requiredCapability = {
    kind: "sdlc_required_capability",
    capabilityId: "lineage_preservation",
    evidenceContract: "lineage links source and target fields",
    requirementRefs: ["REQ-B086-001"]
  };
  const capabilityMet = deriveCapabilityAssuranceLedger({
    requiredCapabilities: [requiredCapability],
    observedCapabilities: [
      {
        kind: "sdlc_observed_capability",
        capabilityId: "lineage_preservation",
        evidenceRefs: ["file://Lineage.scala"],
        substantive: true
      }
    ]
  });
  const capabilityPlaceholder = deriveCapabilityAssuranceLedger({
    requiredCapabilities: [requiredCapability],
    observedCapabilities: [
      {
        kind: "sdlc_observed_capability",
        capabilityId: "lineage_preservation",
        evidenceRefs: ["file://Lineage.scala"],
        substantive: false,
        evidenceQuality: "placeholder"
      }
    ]
  });
  assert.equal(capabilityMet.verdict, "satisfied");
  assert.equal(capabilityPlaceholder.verdict, "open_gap");

  const substantiveRealization = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: true,
    executableProofRequired: true,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "source",
        ref: "file://Mapper.scala",
        content: "object Mapper { def map(input: String) = input.reverse }"
      },
      {
        kind: "sdlc_realization_text_surface",
        role: "test",
        ref: "file://MapperSpec.scala",
        content: "test(\"mapper\") { assert(Mapper.map(\"ab\") == \"ba\") }"
      }
    ]
  });
  const traceOnlyRealization = deriveShallowRealizationAssuranceLedger({
    synthesisRequired: true,
    executableProofRequired: true,
    surfaces: [
      {
        kind: "sdlc_realization_text_surface",
        role: "source",
        ref: "file://Mapper.scala",
        content: "object Mapper { def map(input: String) = input }"
      },
      {
        kind: "sdlc_realization_text_surface",
        role: "test",
        ref: "file://MapperSpec.scala",
        content: "// Validates: REQ-B086-001"
      }
    ]
  });
  assert.equal(substantiveRealization.verdict, "satisfied");
  assert.equal(traceOnlyRealization.verdict, "open_gap");
});

test("B-086 project conformance F_D defaults underdisambiguated source and rejects invalid typed carriers", () => {
  const root = workspace();
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: b086_fd_sweep",
      "ambiguity_risk_appetite: canonical_or_bust",
      "active_tenant: scala_spark",
      "selected_output_root: build_tenants/scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: Scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    test_execution_contract: sbt test"
    ].join("\n"),
    "utf8"
  );
  const profile = deriveSdlcConformProjectProfileFromWorkspace(root);
  const constraints = projectConstraintsFromConformProjectProfile(profile);
  assert.equal(profile.ambiguityRiskAppetite, "medium");
  assert.equal(admitSdlcProjectConstraints(constraints).ambiguityRiskAppetite, "medium");

  assert.throws(
    () =>
      admitSdlcProjectConstraints({
        ...constraints,
        selectedOutputRoot: "src/generated",
        ambiguityRiskAppetite: "canonical_or_bust"
      }),
    /selectedOutputRoot|ambiguityRiskAppetite/u
  );
});

test("B-086 traversal strategy and scope use ABG directives and do not invent module scope", () => {
  const fullBreadthDecision = deriveSdlcTraversalStrategyDecision({
    edgeName: "derive_test_execution_result_surface",
    targetAssetType: "test_execution_result_surface",
    strategyDirectiveRef: "strategy://abg/selected/full_breadth",
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: [gapDossier("test_execution_not_succeeded")]
    }
  });
  assert.equal(fullBreadthDecision.decisionSource, "retry_backoff");
  assert.equal(fullBreadthDecision.selectedStrategy, "targeted_repair");

  const boundScope = deriveSdlcFeatureScope({
    targetAssetType: "implementation_design_surface",
    selectedStrategy: "steel_thread",
    strategyDirectiveRef: "strategy://odd_sdlc/steel-thread/cdme-compiler",
    selectedScheduleItemRefs: [],
    requiredProgressArtifactRefs: [],
    declaredModuleNames: ["cdme-compiler", "cdme-assurance"],
    materializedEntityIds: [],
    materializedOperationIds: []
  });
  const unboundScope = deriveSdlcFeatureScope({
    targetAssetType: "implementation_design_surface",
    selectedStrategy: "steel_thread",
    strategyDirectiveRef: "strategy://odd_sdlc/steel-thread/primary",
    selectedScheduleItemRefs: [],
    requiredProgressArtifactRefs: [],
    declaredModuleNames: ["cdme-compiler", "cdme-assurance"],
    materializedEntityIds: [],
    materializedOperationIds: []
  });
  assert.equal(boundScope.mode, "steel_thread");
  assert.deepEqual(boundScope.includedModuleNames, ["cdme-compiler"]);
  assert.equal(unboundScope.mode, "full_breadth");
  assert.deepEqual(unboundScope.includedModuleNames, [
    "cdme-compiler",
    "cdme-assurance"
  ]);
});

test("B-086 hook F_D admits declared surface aliases and rejects contract mismatches", () => {
  const contract = hookContractByEdgeName("derive_code_surface");
  const targetAssetId = "asset://code_surface";
  const invocation = minimalSdlcHookInvocationForContract({
    contract,
    targetAssetId,
    fpWorkerContractRef: "worker://fp/local"
  });
  const aliasedInvocation = {
    ...invocation,
    targetBinding: {
      nodeName: "Code Surface",
      assetIds: [targetAssetId]
    }
  };
  const preflight = evaluateSdlcHookPreflight({
    contract,
    invocation: aliasedInvocation
  });
  assert.equal(preflight.status, "passed");

  const missingSource = evaluateSdlcHookPreflight({
    contract,
    invocation: {
      ...invocation,
      sourceBindings: [],
      inputIdentities: []
    }
  });
  assert.equal(missingSource.status, "blocked");
  assert(missingSource.blockingReasons.includes("source_binding_missing"));

  const successful = runSdlcHookTurn({
    contract,
    invocation,
    constructorResult: successfulConstructorResult(contract, targetAssetId, {
      declaredType: "Code Surface"
    })
  });
  assert.equal(successful.postflight?.status, "passed");

  const wrongOperation = runSdlcHookTurn({
    contract,
    invocation,
    constructorResult: successfulConstructorResult(contract, targetAssetId, {
      operationType: "release"
    })
  });
  assert.equal(wrongOperation.postflight?.status, "blocked");
  assert(
    wrongOperation.postflight?.blockingReasons.includes(
      "requested_operation_mismatch"
    )
  );

  const unboundOutput = successful.workReport === null ? null : {
    ...successful.workReport,
    outputIdentity: {
      ...successful.workReport.outputIdentity,
      assetId: "asset://foreign_code_surface"
    }
  };
  assert(unboundOutput);
  const postflight = evaluateSdlcHookPostflight({
    contract,
    report: unboundOutput
  });
  assert.equal(postflight.status, "blocked");
  assert(postflight.blockingReasons.includes("output_identity_not_bound_to_target"));
});
