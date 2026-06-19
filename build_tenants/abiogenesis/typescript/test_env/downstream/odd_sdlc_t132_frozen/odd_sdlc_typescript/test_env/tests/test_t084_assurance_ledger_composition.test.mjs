// Validates: REQ-F-ODDSDLC-013
// Validates: REQ-F-ODDSDLC-051
// Validates: REQ-F-ODDSDLC-055
// Validates: T-084

import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  SDLC_ASSURANCE_LEDGER_DIMENSIONS,
  deriveAmbiguityAssuranceLedger,
  deriveCapabilityAssuranceLedger,
  deriveComponentDepthAssuranceLedger,
  deriveDesignCompletenessAssuranceLedger,
  deriveMaterializationAssuranceLedger,
  deriveObligationCarryAssuranceLedger,
  deriveRequirementFulfillmentAssuranceLedger,
  deriveSemanticConvergenceAssuranceLedger,
  deriveShallowRealizationAssuranceLedger,
  foldSdlcAssuranceLedgers,
  makeSdlcAssuranceLedger,
  makeSdlcAssuranceLedgerReason
} from "../../build/semantic/code/src/index.js";

function reason(code, lawfulReentryPoint = "same_edge_retry") {
  return makeSdlcAssuranceLedgerReason({
    code,
    message: code,
    evidenceRefs: [`proof://${code}`],
    lawfulReentryPoint
  });
}

function ledger(dimension, verdict, input = {}) {
  return makeSdlcAssuranceLedger({
    dimension,
    verdict,
    reasons: input.reasons ?? [],
    evidenceRefs: input.evidenceRefs ?? [],
    predecessorRefs: input.predecessorRefs ?? [`proof://${dimension}/${verdict}`],
    carryForwardObligationRefs: input.carryForwardObligationRefs ?? []
  });
}

function componentDepthArtifact(register) {
  const root = mkdtempSync(join(tmpdir(), "odd-sdlc-component-depth-"));
  const filePath = join(root, `${register.targetAssetType}.md`);
  writeFileSync(
    filePath,
    `${JSON.stringify(register, null, 2)}\n`,
    "utf8"
  );
  return filePath;
}

function designDepthArtifact(register) {
  const root = mkdtempSync(join(tmpdir(), "odd-sdlc-design-depth-"));
  const filePath = join(root, `${register.targetAssetType}.json`);
  writeFileSync(
    filePath,
    `${JSON.stringify(register, null, 2)}\n`,
    "utf8"
  );
  return filePath;
}

function allSatisfied(overrides = []) {
  const overrideByDimension = new Map(
    overrides.map((override) => [override.dimension, override])
  );
  return SDLC_ASSURANCE_LEDGER_DIMENSIONS.map((dimension) =>
    overrideByDimension.get(dimension) ?? ledger(dimension, "satisfied")
  );
}

function manifest() {
  return {
    kind: "sdlc_worker_handoff_manifest",
    reportFile: "proof://worker-report",
    productMaterialization: {
      kind: "sdlc_product_materialization_contract",
      required: true,
      activeTenant: "scala_spark",
      selectedOutputRoot: "build_tenants/scala_spark",
      tenantRoot: "/workspace/build_tenants/scala_spark",
      relativePathBasis: "tenant_root",
      declaredModuleNames: [],
      buildExecutionContract: "sbt clean assembly",
      testExecutionContract: "sbt test",
      manifestFile: "proof://materialization-manifest",
      requiredRoles: ["source"]
    },
    retryContext: {
      kind: "sdlc_worker_retry_context",
      retryAttemptRefs: [],
      priorGapDossiers: []
    }
  };
}

function passedPostflight() {
  return {
    kind: "sdlc_operator_postflight_result",
    status: "passed",
    blockingReasons: [],
    blockingReasonCarriers: [],
    evidenceRefs: ["proof://postflight"]
  };
}

function fulfilledClosureRegister() {
  return {
    kind: "sdlc_requirement_closure_register",
    entries: [
      {
        kind: "sdlc_requirement_closure_entry",
        requirementId: "REQ-DM-001",
        sourceInputUris: ["fixture://requirements"],
        assetIds: ["asset://code"],
        producedByGraphFunctions: ["derive_code_surface"],
        proofKinds: ["behavioral_test"],
        authorityVerbs: ["validates"],
        evidenceRefs: ["proof://requirement"],
        traceabilityStatus: "behavioral_evidence",
        fulfillmentStatus: "fulfilled",
        carryStatus: "fulfilled",
        openReasons: []
      }
    ],
    fulfilledRequirementIds: ["REQ-DM-001"],
    carriedForwardRequirementIds: [],
    unresolvedRequirementIds: [],
    emittedRuntimeEventKinds: []
  };
}

test("T-084 fold admits every ledger verdict kind", () => {
  for (const verdict of [
    "satisfied",
    "open_gap",
    "fp_escalation",
    "blocked",
    "reprice_required",
    "not_applicable"
  ]) {
    const satisfaction = foldSdlcAssuranceLedgers({
      requiredDimensions: ["materialization"],
      ledgers: [ledger("materialization", verdict)]
    });
    assert.equal(satisfaction.ledgers[0].verdict, verdict);
  }
});

test("T-084 blocked ledger prevents closure", () => {
  const blocked = ledger("materialization", "blocked", {
    reasons: [reason("materialization_report_missing", "operator_blocked")]
  });
  const satisfaction = foldSdlcAssuranceLedgers({
    ledgers: allSatisfied([blocked])
  });

  assert.equal(satisfaction.status, "blocked");
  assert.deepStrictEqual(
    satisfaction.blockingReasons.map((item) => item.code),
    ["materialization_report_missing"]
  );
});

test("T-084 reprice dominates retry gaps", () => {
  const reprice = ledger("ambiguity", "reprice_required", {
    reasons: [reason("target_asset_identity_ambiguous", "requirement_reprice")]
  });
  const gap = ledger("capability", "open_gap", {
    reasons: [reason("capability_inventory_missing")]
  });
  const satisfaction = foldSdlcAssuranceLedgers({
    ledgers: allSatisfied([reprice, gap])
  });

  assert.equal(satisfaction.status, "reprice_required");
  assert.deepStrictEqual(
    satisfaction.repriceReasons.map((item) => item.code),
    ["target_asset_identity_ambiguous"]
  );
  assert.deepStrictEqual(
    satisfaction.gapReasons.map((item) => item.code),
    ["capability_inventory_missing"]
  );
});

test("T-084 open gap produces same-edge retry pressure", () => {
  const openGap = ledger("semantic_convergence", "open_gap", {
    reasons: [reason("candidate_restates_target_only")],
    carryForwardObligationRefs: ["gap://semantic/candidate_restates_target_only"]
  });
  const satisfaction = foldSdlcAssuranceLedgers({
    ledgers: allSatisfied([openGap])
  });

  assert.equal(satisfaction.status, "retry_same_edge");
  assert.deepStrictEqual(satisfaction.retryHandoff.obligationRefs, [
    "gap://semantic/candidate_restates_target_only"
  ]);
  assert.deepStrictEqual(satisfaction.retryHandoff.reasonCodes, [
    "candidate_restates_target_only"
  ]);
});

test("B-086 F_D ambiguity escalation folds to F_P reentry instead of same-edge retry", () => {
  const escalation = ledger("design_completeness", "fp_escalation", {
    reasons: [
      reason("design_completeness_attribute_partial", "escalate_to_fp")
    ]
  });
  const openGap = ledger("semantic_convergence", "open_gap", {
    reasons: [reason("semantic_claim_missing:REQ-B086-001")]
  });
  const satisfaction = foldSdlcAssuranceLedgers({
    ledgers: allSatisfied([escalation, openGap])
  });

  assert.equal(satisfaction.status, "fp_escalation");
  assert.deepStrictEqual(
    satisfaction.gapReasons.map((item) => item.code),
    ["semantic_claim_missing:REQ-B086-001"]
  );
  assert.deepStrictEqual(
    satisfaction.fpEscalationReasons.map((item) => item.code),
    ["design_completeness_attribute_partial"]
  );
  assert.deepStrictEqual(satisfaction.retryHandoff.reasonCodes, [
    "design_completeness_attribute_partial",
    "semantic_claim_missing:REQ-B086-001"
  ]);
});

test("T-084 all satisfied ledgers allow closure", () => {
  const satisfaction = foldSdlcAssuranceLedgers({
    ledgers: allSatisfied()
  });

  assert.equal(satisfaction.status, "close_allowed");
  assert.equal(satisfaction.missingRequiredDimensions.length, 0);
  assert.equal(satisfaction.satisfiedDimensions.length, 9);
});

test("T-084 not-applicable ledger does not hide required failure", () => {
  const notApplicable = ledger("semantic_convergence", "not_applicable");
  const blocked = ledger("requirement_fulfillment", "blocked", {
    reasons: [reason("requirement_trace_basis_missing", "operator_blocked")]
  });
  const satisfaction = foldSdlcAssuranceLedgers({
    ledgers: allSatisfied([notApplicable, blocked])
  });

  assert.equal(satisfaction.status, "blocked");
  assert.deepStrictEqual(satisfaction.notApplicableDimensions, [
    "semantic_convergence"
  ]);
  assert.deepStrictEqual(
    satisfaction.blockingReasons.map((item) => item.code),
    ["requirement_trace_basis_missing"]
  );
});

test("T-084 missing required ledger blocks closure deterministically", () => {
  const satisfaction = foldSdlcAssuranceLedgers({
    requiredDimensions: ["materialization", "capability"],
    ledgers: [ledger("materialization", "satisfied")]
  });

  assert.equal(satisfaction.status, "blocked");
  assert.deepStrictEqual(satisfaction.missingRequiredDimensions, ["capability"]);
  assert.deepStrictEqual(
    satisfaction.blockingReasons.map((item) => item.code),
    ["missing_required_ledger:capability"]
  );
});

test("T-113 component-depth assurance blocks collapsed component test materialization", () => {
  const outputFile = componentDepthArtifact({
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_surface",
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "MapperComponentSpec",
        relativePath: "src/test/scala/MapperComponentSpec.scala",
        testcaseIds: ["TC-DM-001"],
        componentIds: ["mapper"],
        requirementIds: ["REQ-DM-001"],
        shardId: null
      }
    ]
  });
  const componentDepth = deriveComponentDepthAssuranceLedger({
    manifest: {
      ...manifest(),
      targetAssetType: "component_test_surface"
    },
    report: {
      kind: "odd_sdlc.worker_result_report",
      graphFunctionName: "bootstrap_release_self_test",
      edgeName: "derive_component_test_surface",
      targetAssetType: "component_test_surface",
      outputFile,
      digest: "sha256:component-test",
      summary: "framework-generated post-transform report from observed artifacts",
      unresolvedReasons: [],
      materializedFiles: [],
      executionEvidence: null,
      executionEvidenceErrors: [],
      obligationAssessments: [],
      fpTransformRequestRef: null,
      fpTransformResultRef: null,
      fpTransformStatusSnapshot: null,
      fpEvaluateResultRef: null
    }
  });

  assert(componentDepth);
  assert.equal(componentDepth.verdict, "open_gap");
  assert.deepStrictEqual(componentDepth.reasons.map((item) => item.code), [
    "test_class_missing_file:MapperComponentSpec",
    "component_depth_materialized_file_missing:component_test_surface:test"
  ].sort());
});

test("T-168 component-depth assurance normalizes selected-output-root test paths", () => {
  const outputFile = componentDepthArtifact({
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_test_surface",
    componentTestRows: [
      {
        kind: "sdlc_component_test_realization_row",
        testClassId: "MapperComponentSpec",
        relativePath: "build_tenants/scala_spark/src/test/scala/MapperComponentSpec.scala",
        testcaseIds: ["TC-DM-001"],
        componentIds: ["mapper"],
        requirementIds: ["REQ-DM-001"],
        shardId: null
      }
    ]
  });
  const componentDepth = deriveComponentDepthAssuranceLedger({
    manifest: {
      ...manifest(),
      targetAssetType: "component_test_surface"
    },
    report: {
      kind: "odd_sdlc.worker_result_report",
      graphFunctionName: "bootstrap_release_self_test",
      edgeName: "derive_component_test_surface",
      targetAssetType: "component_test_surface",
      outputFile,
      digest: "sha256:component-test",
      summary: "framework-generated post-transform report from observed artifacts",
      unresolvedReasons: [],
      materializedFiles: [
        {
          kind: "sdlc_materialized_product_file",
          role: "test",
          relativePath: "src/test/scala/MapperComponentSpec.scala",
          absolutePath: "/workspace/build_tenants/scala_spark/src/test/scala/MapperComponentSpec.scala",
          digest: "sha256:test",
          byteCount: 42
        }
      ],
      executionEvidence: null,
      executionEvidenceErrors: [],
      obligationAssessments: [],
      fpTransformRequestRef: null,
      fpTransformResultRef: null,
      fpTransformStatusSnapshot: null,
      fpEvaluateResultRef: null
    }
  });

  assert(componentDepth);
  assert.equal(componentDepth.verdict, "satisfied");
  assert.equal(
    componentDepth.reasons.some((item) =>
      item.code.startsWith("test_class_missing_file:")
    ),
    false
  );
});

test("T-084 folds real outputs from every assurance dimension", () => {
  const materialization = deriveMaterializationAssuranceLedger({
    manifest: manifest(),
    report: {
      kind: "odd_sdlc.worker_result_report",
      graphFunctionName: "bootstrap_release_self_test",
      edgeName: "derive_code_surface",
      targetAssetType: "code_surface",
      outputFile: "proof://code-surface",
      digest: "sha256:code",
      summary: "result",
      unresolvedReasons: [],
      materializedFiles: [
        {
          kind: "sdlc_materialized_product_file",
          role: "source",
          relativePath: "src/main/scala/Mapper.scala",
          absolutePath: "/workspace/build_tenants/scala_spark/src/main/scala/Mapper.scala",
          digest: "sha256:mapper",
          byteCount: 32
        }
      ]
    },
    postflight: passedPostflight()
  });
  const semantic = deriveSemanticConvergenceAssuranceLedger({
    targetRefs: ["target://mapper/lineage"],
    claims: [
      {
        kind: "sdlc_semantic_convergence_claim",
        targetRef: "target://mapper/lineage",
        status: "covered",
        evidenceRefs: ["proof://semantic"]
      }
    ]
  });
  const obligation = deriveObligationCarryAssuranceLedger({
    manifest: manifest(),
    currentGapDossier: null
  });
  const requirement = deriveRequirementFulfillmentAssuranceLedger({
    closureRegister: fulfilledClosureRegister()
  });
  const ambiguity = deriveAmbiguityAssuranceLedger({
    findings: [],
    predecessorRefs: ["proof://ambiguity/no-findings"]
  });
  const capability = deriveCapabilityAssuranceLedger({
    requiredCapabilities: [
      {
        kind: "sdlc_required_capability",
        capabilityId: "lineage_preservation",
        evidenceContract: "lineage links source and target fields",
        requirementRefs: ["REQ-DM-001"]
      }
    ],
    observedCapabilities: [
      {
        kind: "sdlc_observed_capability",
        capabilityId: "lineage_preservation",
        evidenceRefs: ["file://Mapper.scala"],
        substantive: true
      }
    ]
  });
  const shallow = deriveShallowRealizationAssuranceLedger({
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
  const componentDepthOutputFile = componentDepthArtifact({
    kind: "sdlc_component_depth_register",
    registerVersion: "ts-component-depth-v1",
    targetAssetType: "component_code_surface",
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "mapper",
        moduleName: "mapper",
        relativePath: "src/main/scala/Mapper.scala",
        publicBoundary: "Mapper.map",
        requirementIds: ["REQ-DM-001"],
        sourceAssetRefs: ["fixture://requirements"]
      }
    ]
  });
  const componentDepth = deriveComponentDepthAssuranceLedger({
    manifest: {
      ...manifest(),
      targetAssetType: "component_code_surface"
    },
    report: {
      kind: "odd_sdlc.worker_result_report",
      graphFunctionName: "bootstrap_release_self_test",
      edgeName: "derive_component_code_surface",
      targetAssetType: "component_code_surface",
      outputFile: componentDepthOutputFile,
      digest: "sha256:component-code",
      summary: "framework-generated post-transform report from observed artifacts",
      unresolvedReasons: [],
      materializedFiles: [
        {
          kind: "sdlc_materialized_product_file",
          role: "source",
          relativePath: "src/main/scala/Mapper.scala",
          absolutePath: "/workspace/build_tenants/scala_spark/src/main/scala/Mapper.scala",
          digest: "sha256:mapper",
          byteCount: 32
        }
      ],
      executionEvidence: null,
      executionEvidenceErrors: [],
      obligationAssessments: [],
      fpTransformRequestRef: null,
      fpTransformResultRef: null,
      fpTransformStatusSnapshot: null,
      fpEvaluateResultRef: null
    }
  });
  assert(componentDepth);
  const designDepthOutputFile = designDepthArtifact({
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    stackProfileRows: [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://t084/scala-sbt",
        language: "scala",
        buildTool: "sbt"
      }
    ],
    implementationModuleRows: [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "mapper",
        moduleRef: "module://t084/mapper"
      }
    ],
    aggregateDomainModelRows: [
      {
        kind: "sdlc_aggregate_domain_model_row",
        modelRef: "model://t084/aggregate"
      }
    ],
    moduleSchemaFragments: [
      {
        kind: "sdlc_module_schema_fragment",
        moduleName: "mapper",
        entities: [
          {
            kind: "sdlc_domain_entity",
            entityId: "entity:MapperInput",
            moduleName: "mapper",
            ownership: "owned",
            attributes: [
              {
                kind: "sdlc_domain_attribute",
                attributeId: "attr:MapperInput.value",
                name: "value",
                valueType: "String",
                cardinality: "one",
                invariantRefs: ["REQ-DM-001"]
              }
            ],
            invariants: ["mapper input value is present"],
            sourceAssetRefs: ["fixture://requirements"]
          }
        ],
        operations: [
          {
            kind: "sdlc_domain_operation",
            operationId: "operation:Mapper.map",
            moduleName: "mapper",
            inputEntityIds: ["entity:MapperInput"],
            outputEntityIds: ["entity:MapperInput"],
            requiredAttributeIds: ["attr:MapperInput.value"]
          }
        ],
        requirementIds: ["REQ-DM-001"],
        sourceAssetRefs: ["fixture://requirements"]
      }
    ],
    moduleStateDiagramFragments: [
      {
        kind: "sdlc_module_state_diagram_fragment",
        moduleName: "mapper",
        entityId: "entity:MapperInput",
        stateless: true,
        states: [],
        transitions: [],
        requirementIds: ["REQ-DM-001"],
        sourceAssetRefs: ["fixture://requirements"]
      }
    ],
    aggregateDomainModel: {
      kind: "sdlc_aggregate_domain_model",
      modelVersion: "ts-design-depth-v1",
      entities: [
        {
          kind: "sdlc_aggregate_domain_entity",
          entityId: "entity:MapperInput",
          ownerModuleName: "mapper",
          attributes: [
            {
              kind: "sdlc_domain_attribute",
              attributeId: "attr:MapperInput.value",
              name: "value",
              valueType: "String",
              cardinality: "one",
              invariantRefs: ["REQ-DM-001"]
            }
          ],
          sourceModuleNames: ["mapper"]
        }
      ],
      operations: [
        {
          kind: "sdlc_domain_operation",
          operationId: "operation:Mapper.map",
          moduleName: "mapper",
          inputEntityIds: ["entity:MapperInput"],
          outputEntityIds: ["entity:MapperInput"],
          requiredAttributeIds: ["attr:MapperInput.value"]
        }
      ],
      crossModuleReferences: [],
      evidenceRefs: ["fixture://design-depth"]
    },
    sunnyDaySequenceRows: [
      {
        kind: "sdlc_sunny_day_sequence_row",
        sequenceRef: "sequence://t084/mapper-map"
      }
    ],
    aggregateSunnyDaySequence: {
      kind: "sdlc_aggregate_sunny_day_sequence",
      sequenceVersion: "ts-design-depth-v1",
      steps: [
        {
          kind: "sdlc_sunny_day_sequence_step",
          stepId: "step:Mapper.map",
          moduleName: "mapper",
          operationId: "operation:Mapper.map",
          inputEntityIds: ["entity:MapperInput"],
          outputEntityIds: ["entity:MapperInput"],
          stateTransitionIds: []
        }
      ],
      evidenceRefs: ["fixture://design-depth"]
    },
    componentTopologyRows: [
      {
        kind: "sdlc_component_topology_row",
        componentId: "mapper",
        moduleName: "mapper",
        relativePath: "src/main/scala/Mapper.scala",
        publicBoundary: "Mapper.map",
        concernRole: "mapper",
        requirementIds: ["REQ-DM-001"],
        sourceAssetRefs: ["fixture://requirements"]
      }
    ],
    componentRealizationRows: [
      {
        kind: "sdlc_component_realization_row",
        componentId: "mapper",
        moduleName: "mapper",
        relativePath: "src/main/scala/Mapper.scala",
        publicBoundary: "Mapper.map",
        trancheId: "tranche:mapper",
        firstProductFileToChange: "src/main/scala/Mapper.scala",
        upstreamComponentIds: [],
        requirementIds: ["REQ-DM-001"],
        sourceAssetRefs: ["fixture://requirements"]
      }
    ],
    fileTargetRows: [
      {
        kind: "sdlc_file_target_row",
        relativePath: "src/main/scala/Mapper.scala",
        role: "source"
      }
    ],
    designCompletenessVerdict: {
      kind: "sdlc_design_completeness_verdict",
      verdictVersion: "ts-design-depth-v1",
      entity: {
        kind: "sdlc_design_completeness_axis_verdict",
        axis: "entity",
        status: "satisfied",
        reasons: [],
        evidenceRefs: ["fixture://design-depth"]
      },
      attribute: {
        kind: "sdlc_design_completeness_axis_verdict",
        axis: "attribute",
        status: "satisfied",
        reasons: [],
        evidenceRefs: ["fixture://design-depth"]
      },
      flow: {
        kind: "sdlc_design_completeness_axis_verdict",
        axis: "flow",
        status: "satisfied",
        reasons: [],
        evidenceRefs: ["fixture://design-depth"]
      }
    }
  });
  const designCompleteness = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      ...manifest(),
      targetAssetType: "implementation_design_surface"
    },
    report: {
      outputFile: designDepthOutputFile
    }
  });
  assert(designCompleteness);
  const satisfaction = foldSdlcAssuranceLedgers({
    ledgers: [
      materialization,
      semantic,
      obligation,
      requirement,
      ambiguity,
      capability,
      shallow,
      componentDepth,
      designCompleteness
    ]
  });

  assert.equal(satisfaction.status, "close_allowed");
  assert.deepStrictEqual(
    satisfaction.ledgers.map((item) => item.dimension),
    SDLC_ASSURANCE_LEDGER_DIMENSIONS
  );
});
