// Validates: T-122
// Validates: B-084
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

import {
  deriveDesignCompletenessAssuranceLedger,
  deriveSdlcFeatureScope,
  deriveWorkerHandoffManifest,
  foldSdlcAssuranceLedgers,
  hookContractByEdgeName,
  sdlcTraversalObligationInFeatureScope
} from "../../build/semantic/code/src/index.js";

const compilerAttribute = Object.freeze({
  kind: "sdlc_domain_attribute",
  attributeId: "attr:MappingPlan.planId",
  name: "planId",
  valueType: "String",
  cardinality: "one",
  invariantRefs: ["REQ-T122-001"]
});

const compilerEntity = Object.freeze({
  kind: "sdlc_domain_entity",
  entityId: "entity:MappingPlan",
  moduleName: "cdme-compiler",
  ownership: "owned",
  attributes: [compilerAttribute],
  invariants: ["planId is stable"],
  sourceAssetRefs: ["fixture://t122/compiler"]
});

const deferredEntityWithoutAttributes = Object.freeze({
  kind: "sdlc_domain_entity",
  entityId: "entity:DeferredJournal",
  moduleName: "cdme-accounting",
  ownership: "owned",
  attributes: [],
  invariants: [],
  sourceAssetRefs: ["fixture://t122/accounting"]
});

const compilerOperation = Object.freeze({
  kind: "sdlc_domain_operation",
  operationId: "operation:compileMappingPlan",
  moduleName: "cdme-compiler",
  inputEntityIds: ["entity:MappingPlan"],
  outputEntityIds: ["entity:MappingPlan"],
  requiredAttributeIds: ["attr:MappingPlan.planId"]
});

function axis(axisName, status = "satisfied", reasons = []) {
  return {
    kind: "sdlc_design_completeness_axis_verdict",
    axis: axisName,
    status,
    reasons,
    evidenceRefs: ["fixture://t122/verdict"]
  };
}

function verdict(overrides = {}) {
  return {
    kind: "sdlc_design_completeness_verdict",
    verdictVersion: "ts-design-depth-v1",
    entity: overrides.entity ?? axis("entity"),
    attribute: overrides.attribute ?? axis("attribute"),
    flow: overrides.flow ?? axis("flow")
  };
}

function steelThreadScope() {
  return {
    kind: "sdlc_feature_scope",
    scopeVersion: "ts-scope-v1",
    mode: "steel_thread",
    scopeRef: "scope://odd_sdlc/aggregate-domain-model-surface/steel-thread/cdme-compiler",
    basisRefs: ["strategy://odd_sdlc/derive_implementation_design_surface/single_vertical_slice"],
    includedModuleNames: ["cdme-compiler"],
    includedEntityIds: [],
    includedOperationIds: [],
    deferredModuleNames: ["cdme-accounting"]
  };
}

function fullBreadthScope() {
  return {
    ...steelThreadScope(),
    mode: "full_breadth",
    scopeRef: "scope://odd_sdlc/aggregate-domain-model-surface/full-breadth",
    includedModuleNames: ["cdme-accounting", "cdme-compiler"],
    deferredModuleNames: []
  };
}

function completeDesignDepthRegister(register) {
  const defaultModuleRegister = moduleRegister({ includeCompilerDiagram: true });
  return {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    stackProfileRows: register.stackProfileRows ?? [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://t122/scala-sbt",
        language: "scala",
        buildTool: "sbt"
      }
    ],
    implementationModuleRows: register.implementationModuleRows ?? [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "cdme-compiler",
        moduleRef: "module://t122/cdme-compiler"
      }
    ],
    aggregateDomainModelRows: register.aggregateDomainModelRows ?? [
      {
        kind: "sdlc_aggregate_domain_model_row",
        modelRef: "model://t122/aggregate"
      }
    ],
    moduleSchemaFragments:
      register.moduleSchemaFragments ?? defaultModuleRegister.moduleSchemaFragments,
    moduleStateDiagramFragments:
      register.moduleStateDiagramFragments ?? defaultModuleRegister.moduleStateDiagramFragments,
    aggregateDomainModel:
      register.aggregateDomainModel ?? aggregateRegister().aggregateDomainModel,
    sunnyDaySequenceRows: register.sunnyDaySequenceRows ?? [
      {
        kind: "sdlc_sunny_day_sequence_row",
        sequenceRef: "sequence://t122/compile"
      }
    ],
    aggregateSunnyDaySequence: register.aggregateSunnyDaySequence ?? {
      kind: "sdlc_aggregate_sunny_day_sequence",
      sequenceVersion: "ts-design-depth-v1",
      steps: [
        {
          kind: "sdlc_sunny_day_sequence_step",
          stepId: "step:compileMappingPlan",
          moduleName: "cdme-compiler",
          operationId: "operation:compileMappingPlan",
          inputEntityIds: ["entity:MappingPlan"],
          outputEntityIds: ["entity:MappingPlan"],
          stateTransitionIds: ["transition:MappingPlan.draft.compiled"]
        }
      ],
      evidenceRefs: ["fixture://t122/sunny-day"]
    },
    componentTopologyRows: register.componentTopologyRows ?? [
      {
        kind: "sdlc_component_topology_row",
        componentId: "cmp.cdme.compiler",
        moduleName: "cdme-compiler",
        relativePath: "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        concernRole: "parser",
        publicBoundary: "package_internal",
        requirementIds: ["REQ-T122-001"],
        sourceAssetRefs: ["fixture://t122/component-topology"]
      }
    ],
    componentRealizationRows: register.componentRealizationRows ?? [
      {
        kind: "sdlc_component_realization_row",
        componentId: "cmp.cdme.compiler",
        moduleName: "cdme-compiler",
        relativePath: "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        publicBoundary: "package_internal",
        trancheId: "tranche:compiler",
        firstProductFileToChange:
          "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        upstreamComponentIds: [],
        requirementIds: ["REQ-T122-001"],
        sourceAssetRefs: ["fixture://t122/component-realization"]
      }
    ],
    fileTargetRows: register.fileTargetRows ?? [
      {
        kind: "sdlc_file_target_row",
        relativePath: "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        role: "source"
      }
    ],
    designCompletenessVerdict: register.designCompletenessVerdict ?? verdict()
  };
}

function designDepthArtifact(register) {
  const normalizedRegister = completeDesignDepthRegister(register);
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t122-"));
  const outputFile = path.join(root, `${normalizedRegister.targetAssetType}.json`);
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(
    outputFile,
    `${JSON.stringify(normalizedRegister, null, 2)}\n`,
    "utf8"
  );
  return outputFile;
}

function workspaceWithModules() {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t122-workspace-"));
  mkdirSync(path.join(root, ".ai-workspace/context"), { recursive: true });
  writeFileSync(
    path.join(root, ".ai-workspace/context/project_constraints.yml"),
    [
      "project:",
      "  name: t122_execution_scope",
      "active_tenant: scala_spark",
      "build_tenants:",
      "  scala_spark:",
      "    output_dir: build_tenants/scala_spark",
      "    language: scala",
      "    build_tool: sbt",
      "    test_runner: sbt test",
      "    test_execution_contract: sbt test",
      "    module_structure:",
      "      - cdme-compiler",
      "      - cdme-assurance",
      "      - cdme-executor"
    ].join("\n"),
    "utf8"
  );
  mkdirSync(path.join(root, "specification"), { recursive: true });
  writeFileSync(path.join(root, "specification/INTENT.md"), "# Intent\n", "utf8");
  return root;
}

function moduleRegister({ includeCompilerDiagram }) {
  return {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    moduleSchemaFragments: [
      {
        kind: "sdlc_module_schema_fragment",
        moduleName: "cdme-compiler",
        entities: [compilerEntity],
        operations: [compilerOperation],
        requirementIds: ["REQ-T122-001"],
        sourceAssetRefs: ["fixture://t122/compiler"]
      },
      {
        kind: "sdlc_module_schema_fragment",
        moduleName: "cdme-accounting",
        entities: [deferredEntityWithoutAttributes],
        operations: [],
        requirementIds: ["REQ-T122-002"],
        sourceAssetRefs: ["fixture://t122/accounting"]
      }
    ],
    moduleStateDiagramFragments: includeCompilerDiagram
      ? [
          {
            kind: "sdlc_module_state_diagram_fragment",
            moduleName: "cdme-compiler",
            entityId: "entity:MappingPlan",
            stateless: false,
            states: ["draft", "compiled"],
            transitions: [
              {
                kind: "sdlc_entity_state_transition",
                transitionId: "transition:MappingPlan.draft.compiled",
                fromState: "draft",
                toState: "compiled",
                operationId: "operation:compileMappingPlan",
                entityId: "entity:MappingPlan"
              }
            ],
            requirementIds: ["REQ-T122-001"],
            sourceAssetRefs: ["fixture://t122/compiler-state"]
          }
        ]
      : [],
    aggregateDomainModel: null,
    aggregateSunnyDaySequence: null,
    designCompletenessVerdict: null
  };
}

function aggregateRegister({ compilerAttributes = [compilerAttribute] } = {}) {
  return {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    moduleSchemaFragments: moduleRegister({ includeCompilerDiagram: true }).moduleSchemaFragments,
    moduleStateDiagramFragments:
      moduleRegister({ includeCompilerDiagram: true }).moduleStateDiagramFragments,
    aggregateDomainModel: {
      kind: "sdlc_aggregate_domain_model",
      modelVersion: "ts-design-depth-v1",
      entities: [
        {
          kind: "sdlc_aggregate_domain_entity",
          entityId: "entity:MappingPlan",
          ownerModuleName: "cdme-compiler",
          attributes: compilerAttributes,
          sourceModuleNames: ["cdme-compiler"]
        },
        {
          kind: "sdlc_aggregate_domain_entity",
          entityId: "entity:DeferredJournal",
          ownerModuleName: "cdme-accounting",
          attributes: [],
          sourceModuleNames: ["cdme-accounting"]
        }
      ],
      operations: [compilerOperation],
      crossModuleReferences: [],
      evidenceRefs: ["fixture://t122/aggregate"]
    },
    aggregateSunnyDaySequence: null,
    designCompletenessVerdict: verdict({
      attribute: axis("attribute", "partial", [
        "cdme-accounting deferred module attributes incomplete"
      ])
    })
  };
}

function ledgerFor(register, featureScope) {
  const normalizedRegister = completeDesignDepthRegister(register);
  const outputFile = designDepthArtifact(normalizedRegister);
  return deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: normalizedRegister.targetAssetType,
      featureScope
    },
    report: { outputFile }
  });
}

test("T-122 derives a small steel-thread scope from strategy and declared modules", () => {
  const scope = deriveSdlcFeatureScope({
    targetAssetType: "implementation_design_surface",
    strategyDirectiveRef:
      "strategy://odd_sdlc/derive_implementation_design_surface/single_vertical_slice",
    selectedScheduleItemRefs: ["schedule://odd_sdlc/aggregate/cdme-compiler"],
    requiredProgressArtifactRefs: [],
    declaredModuleNames: ["cdme-compiler", "cdme-accounting"],
    materializedEntityIds: ["entity:MappingPlan"],
    materializedOperationIds: ["operation:compileMappingPlan"]
  });
  assert.equal(scope.mode, "steel_thread");
  assert.deepStrictEqual(scope.includedModuleNames, ["cdme-compiler"]);
  assert.deepStrictEqual(scope.deferredModuleNames, ["cdme-accounting"]);
  assert.deepStrictEqual(scope.includedEntityIds, []);
  assert.deepStrictEqual(scope.includedOperationIds, []);
});

test("T-122 steel-thread scope falls back to full breadth when refs do not bind a module", () => {
  const scope = deriveSdlcFeatureScope({
    targetAssetType: "implementation_design_surface",
    strategyDirectiveRef:
      "strategy://odd_sdlc/derive_implementation_design_surface/single_vertical_slice",
    selectedScheduleItemRefs: ["schedule://odd_sdlc/aggregate/primary"],
    requiredProgressArtifactRefs: [],
    declaredModuleNames: ["cdme-compiler", "cdme-accounting"],
    materializedEntityIds: ["entity:MappingPlan"],
    materializedOperationIds: ["operation:compileMappingPlan"]
  });
  assert.equal(scope.mode, "full_breadth");
  assert.deepStrictEqual(scope.includedModuleNames, [
    "cdme-compiler",
    "cdme-accounting"
  ]);
  assert.deepStrictEqual(scope.deferredModuleNames, []);
  assert.deepStrictEqual(scope.includedEntityIds, ["entity:MappingPlan"]);
  assert.deepStrictEqual(scope.includedOperationIds, [
    "operation:compileMappingPlan"
  ]);
});

test("T-160 steel-thread scope preserves single declared module without full-breadth promotion", () => {
  const scope = deriveSdlcFeatureScope({
    targetAssetType: "component_code_surface",
    selectedStrategy: "steel_thread",
    strategyDirectiveRef: null,
    selectedScheduleItemRefs: [
      "schedule://odd_sdlc/derive_lite_component_code_surface/cdme-compiler"
    ],
    requiredProgressArtifactRefs: [],
    declaredModuleNames: ["hello_world_javascript"],
    materializedEntityIds: [],
    materializedOperationIds: []
  });

  assert.equal(scope.mode, "steel_thread");
  assert.deepStrictEqual(scope.includedModuleNames, ["hello_world_javascript"]);
  assert.deepStrictEqual(scope.deferredModuleNames, []);
});

test("T-122 targeted repair scope falls back to full breadth when refs do not bind a module", () => {
  const scope = deriveSdlcFeatureScope({
    targetAssetType: "component_test_surface",
    selectedStrategy: "targeted_repair",
    strategyDirectiveRef: null,
    selectedScheduleItemRefs: ["repair://odd_sdlc/component-test/unbound"],
    requiredProgressArtifactRefs: [],
    declaredModuleNames: ["cdme-compiler", "cdme-accounting"],
    materializedEntityIds: ["entity:MappingPlan"],
    materializedOperationIds: ["operation:compileMappingPlan"]
  });
  assert.equal(scope.mode, "full_breadth");
  assert.deepStrictEqual(scope.includedModuleNames, [
    "cdme-compiler",
    "cdme-accounting"
  ]);
  assert.deepStrictEqual(scope.deferredModuleNames, []);
});

test("T-122 steel-thread scope does not block on deferred module diagrams", () => {
  const ledger = ledgerFor(
    moduleRegister({ includeCompilerDiagram: true }),
    steelThreadScope()
  );
  assert(ledger);
  assert.equal(ledger.verdict, "satisfied");
  assert.deepStrictEqual(ledger.carryForwardObligationRefs, [
    "module:cdme-accounting"
  ]);
});

test("T-122 steel-thread test execution shards are scoped to included modules", () => {
  const contract = hookContractByEdgeName("derive_test_execution_result_surface");
  const manifest = deriveWorkerHandoffManifest({
    workspaceRoot: workspaceWithModules(),
    graphFunctionName: "bootstrap_release_self_test",
    edgeName: contract.edgeName,
    vectorIndex: 26,
    contract,
    traversalAttemptEnvelope: {
      kind: "traversal_attempt_envelope",
      envelopeVersion: "ts-traversal-attempt-v1",
      envelopeRef:
        "envelope://odd_sdlc/derive_test_execution_result_surface/t122",
      profileRef: "profile://odd_sdlc/t122",
      strategyDirectiveRef:
        "strategy://odd_sdlc/derive_test_execution_result_surface/single_vertical_slice/cdme-compiler",
      selectedScheduleItemRefs: [
        "schedule://odd_sdlc/test-execution/cdme-compiler"
      ],
      phaseGateRefs: [],
      requiredProgressArtifactRefs: [],
      retryBudgetRemaining: 1,
      mustExitAfterBoundedAttempt: true
    }
  });

  assert.equal(manifest.featureScope.mode, "steel_thread");
  assert.deepStrictEqual(manifest.featureScope.includedModuleNames, [
    "cdme-compiler"
  ]);
  assert.deepStrictEqual(
    manifest.productMaterialization.executionShards.map(
      (shard) => shard.moduleName
    ),
    ["cdme-compiler"]
  );
});

test("T-122 steel-thread scope blocks on missing in-scope module diagram", () => {
  const ledger = ledgerFor(
    moduleRegister({ includeCompilerDiagram: false }),
    steelThreadScope()
  );
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert(
    ledger.reasons.some(
      (reason) =>
        reason.code === "design_state_diagram_missing_for_module:cdme-compiler"
    )
  );
});

test("T-122 steel-thread scope blocks on missing in-scope aggregate attributes", () => {
  const ledger = ledgerFor(
    aggregateRegister({ compilerAttributes: [] }),
    steelThreadScope()
  );
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert(
    ledger.reasons.some(
      (reason) => reason.code === "design_attribute_missing:entity:MappingPlan"
    )
  );
});

test("T-122 full-breadth scope still blocks on deferred breadth", () => {
  const ledger = ledgerFor(
    moduleRegister({ includeCompilerDiagram: true }),
    fullBreadthScope()
  );
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert(
    ledger.reasons.some(
      (reason) =>
        reason.code === "design_state_diagram_missing_for_module:cdme-accounting"
    )
  );
});

test("T-122 worker-authored verdict cannot force deferred breadth to block steel-thread closure", () => {
  const ledger = ledgerFor(aggregateRegister(), steelThreadScope());
  assert(ledger);
  assert.equal(ledger.verdict, "satisfied");
  assert(
    !ledger.reasons.some((reason) => reason.code.includes("cdme-accounting"))
  );
});

test("B-086 generic worker-authored design verdict escalates to F_P instead of F_D failure", () => {
  const register = aggregateRegister();
  const ledger = ledgerFor(
    {
      ...register,
      designCompletenessVerdict: verdict({
        attribute: axis("attribute", "partial", [
          "attribute coverage incomplete"
        ])
      })
    },
    steelThreadScope()
  );
  assert(ledger);
  assert.equal(ledger.verdict, "fp_escalation");
  assert.equal(ledger.required, false);
  const reason = ledger.reasons.find(
    (item) => item.code === "design_completeness_attribute_partial"
  );
  assert(reason);
  assert.equal(reason.lawfulReentryPoint, "escalate_to_fp");
  const satisfaction = foldSdlcAssuranceLedgers({
    requiredDimensions: ["design_completeness"],
    ledgers: [ledger]
  });
  assert.equal(satisfaction.status, "not_applicable");
  assert.deepStrictEqual(satisfaction.fpEscalationReasons, []);
});

function obligation(obligationId, obligationKind, text) {
  return {
    kind: "sdlc_traversal_obligation",
    obligationId,
    obligationKind,
    summary: text,
    evidenceRefs: [`fixture://${obligationId}`],
    payload: {
      kind: "sdlc_traversal_obligation_payload",
      status: "concrete",
      sourceRefs: [`fixture://${obligationId}`],
      sourceDigests: ["sha256:t122"],
      sourceSnippets: [text],
      coverageExpectation: text
    }
  };
}

test("T-122 steel-thread pressure excludes deferred-module requirement obligations", () => {
  const scope = steelThreadScope();
  assert.equal(
    sdlcTraversalObligationInFeatureScope({
      featureScope: scope,
      obligation: obligation(
        "requirement:REQ-TYP-001",
        "requirement",
        "The compiler must compile a typed mapping plan from source declarations."
      )
    }),
    true
  );
  assert.equal(
    sdlcTraversalObligationInFeatureScope({
      featureScope: scope,
      obligation: obligation(
        "requirement:REQ-ADJ-001",
        "requirement",
        "The adjoint module must support reverse traversal reconciliation."
      )
    }),
    false
  );
  assert.equal(
    sdlcTraversalObligationInFeatureScope({
      featureScope: scope,
      obligation: obligation(
        "module:cdme-accounting",
        "design_or_module",
        "Preserve accounting module breadth."
      )
    }),
    false
  );
  assert.equal(
    sdlcTraversalObligationInFeatureScope({
      featureScope: scope,
      obligation: obligation(
        "target_asset:feature_decomp_surface",
        "target_asset",
        "Produce the current feature decomposition artifact."
      )
    }),
    true
  );
});

test("T-122 design-depth admission rejects relational alias candidates", () => {
  const outputFile = designDepthArtifact({
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    runId: "worker-authored-metadata-is-not-register-law",
    includedModuleNames: ["cdme-compiler"],
    moduleSchemaFragments: [
      {
        moduleName: "cdme-compiler",
        entities: ["MappingSpec", "TypedAttributeDescriptor"],
        attributes: [
          {
            entity: "MappingSpec",
            attribute: "specId",
            type: "SpecId"
          },
          {
            entity: "TypedAttributeDescriptor",
            attribute: "attributeName",
            type: "AttributeName"
          }
        ],
        operations: [
          {
            operationId: "compileMappingSpec",
            inputEntityIds: ["entity:cdme-compiler.mappingspec"],
            outputEntityIds: ["entity:cdme-compiler.typedattributedescriptor"],
            requiredAttributeIds: ["attr:cdme-compiler.mappingspec.specid"]
          }
        ],
        requirementIds: ["REQ-TYP-001"],
        sourceAssetRefs: ["fixture://t122/relational"]
      }
    ],
    moduleStateDiagramFragments: []
  });
  const ledger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: "implementation_design_surface",
      featureScope: steelThreadScope()
    },
    report: { outputFile }
  });
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert(
    ledger.reasons.some((reason) =>
      reason.code.startsWith("design_depth_register_invalid:")
    )
  );
});

test("B-084 design-depth admission rejects state diagram fragments without carrier kinds", () => {
  const outputFile = designDepthArtifact({
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    moduleSchemaFragments: [
      {
        moduleName: "cdme-compiler",
        entities: [
          {
            entityId: "compiler.entity.CompilationJob",
            stateless: false,
            attributes: [
              {
                name: "jobId",
                type: "String"
              }
            ]
          }
        ],
        operations: [
          {
            operationId: "compiler.op.ingest_requirements",
            inputEntityIds: ["compiler.entity.CompilationJob"],
            outputEntityIds: ["compiler.entity.CompilationJob"],
            requiredAttributeIds: [
              "attr:cdme-compiler.compiler-entity-compilationjob.jobid"
            ]
          }
        ],
        requirementIds: ["REQ-TYP-001"],
        sourceAssetRefs: ["fixture://t122/state-kind"]
      }
    ],
    moduleStateDiagramFragments: [
      {
        entityId: "compiler.entity.CompilationJob",
        stateless: false,
        states: ["received", "ingested"],
        transitions: [
          {
            from: "received",
            to: "ingested",
            trigger: "compiler.op.ingest_requirements",
            guard: "success"
          }
        ],
        requirementIds: ["REQ-TYP-001"],
        sourceAssetRefs: ["fixture://t122/state-kind"]
      }
    ]
  });
  const ledger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: "implementation_design_surface",
      featureScope: steelThreadScope()
    },
    report: { outputFile }
  });
  assert(ledger);
  assert(
    ledger.reasons.some((reason) =>
      reason.code.startsWith("design_depth_register_invalid:")
    )
  );
});

test("B-084 design-depth admission rejects implementation module aliases and stack extras", () => {
  const ledger = ledgerFor(
    {
      kind: "sdlc_design_depth_register",
      registerVersion: "ts-design-depth-v1",
      targetAssetType: "implementation_design_surface",
      stackProfileRows: [
        {
          kind: "sdlc_stack_profile_row",
          stackRef: "stack://scala_spark/cdme",
          language: "Scala 2.13",
          buildTool: "sbt 1.x",
          runtimePlatform: "Apache Spark 3.5",
          testFramework: "ScalaTest 3.2",
          buildCommand: "sbt clean assembly",
          testCommand: "sbt test"
        }
      ],
      implementationModuleRows: [
        {
          kind: "sdlc_implementation_module_row",
          moduleName: "cdme-compiler",
          moduleRef: "module://cdme/compiler"
        }
      ],
      moduleSchemaFragments: [
        {
          kind: "sdlc_module_schema_fragment",
          moduleRef: "module://cdme/compiler",
          fragmentVersion: "v1",
          entities: [
            "MappingPlan"
          ],
          operations: [
            {
              operationId: "compileMappingPlan"
            }
          ],
          requirementIds: ["REQ-TYP-001"],
          sourceAssetRefs: ["fixture://t122/module-ref-schema"]
        }
      ],
      moduleStateDiagramFragments: [
        {
          moduleRef: "module://cdme/compiler",
          stateless: false,
          note: "Compiler module state is carried by immutable run records.",
          states: ["Pending", "Compiled"],
          transitions: [
            {
              from: "Pending",
              to: "Compiled",
              trigger: "compileMappingPlan"
            }
          ],
          requirementIds: ["REQ-TYP-001"],
          sourceAssetRefs: ["fixture://t122/module-ref-schema"]
        }
      ],
      aggregateDomainModelRows: [
        {
          kind: "sdlc_aggregate_domain_model_row",
          modelRef: "model://cdme/aggregate",
          description: "Aggregate CDME domain model"
        }
      ],
      sunnyDaySequenceRows: [
        {
          kind: "sdlc_sunny_day_sequence_row",
          sequenceRef: "seq://cdme/nominal-run",
          description: "Nominal compile and execute flow",
          scenarioRef: "SS-01"
        }
      ],
      aggregateSunnyDaySequence: {
        sequenceRef: "seq://cdme/nominal-run",
        steps: [
          {
            step: 1,
            actor: "cdme-compiler",
            action: "compile mapping plan"
          }
        ]
      },
      fileTargetRows: [
        {
          kind: "sdlc_file_target_row",
          relativePath: "build_tenants/scala_spark/build.sbt",
          role: "source",
          moduleName: "root",
          generatedBy: "worker"
        }
      ],
      componentTopologyRows: [
        {
          kind: "sdlc_component_topology_row",
          componentId: "comp://cdme/compiler/Compiler",
          moduleName: "cdme-compiler",
          relativePath:
            "build_tenants/scala_spark/cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
          publicBoundary: true,
          concernRole: "domain_model",
          requirementIds: ["REQ-TYP-001"],
          sourceAssetRefs: ["fixture://t122/module-ref-schema"]
        }
      ],
      componentRealizationRows: [
        {
          kind: "sdlc_component_realization_row",
          componentId: "comp://cdme/compiler/Compiler",
          moduleName: "cdme-compiler",
          relativePath:
            "build_tenants/scala_spark/cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
          realizationRole: "source",
          generatesArtifacts: true
        }
      ],
      designCompletenessVerdict: {
        kind: "sdlc_design_completeness_verdict",
        entityCoverage: "satisfied",
        attributeCoverage: "satisfied",
        flowCoverage: "satisfied",
        notes: "All module-level implementation design rows are represented."
      }
    },
    fullBreadthScope()
  );
  assert(ledger);
  assert(
    ledger.reasons.some((reason) =>
      reason.code.startsWith("design_depth_register_invalid:")
    )
  );
});

test("B-084 design-depth admission rejects missing module identity", () => {
  const ledger = ledgerFor(
    {
      kind: "sdlc_design_depth_register",
      registerVersion: "ts-design-depth-v1",
      targetAssetType: "implementation_design_surface",
      moduleSchemaFragments: [
        {
          entities: [
            {
              entityId: "entity:MissingModuleThing",
              attributes: [
                {
                  name: "thingId",
                  valueType: "String"
                }
              ]
            }
          ],
          operations: [],
          requirementIds: ["REQ-TYP-001"],
          sourceAssetRefs: ["fixture://t122/missing-module"]
        }
      ],
      moduleStateDiagramFragments: []
    },
    fullBreadthScope()
  );
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert(
    ledger.reasons.some((reason) =>
      reason.code.startsWith("design_depth_register_invalid:")
    )
  );
  assert(
    !ledger.reasons.some(
      (reason) => reason.code === "design_depth_module_state_diagram_fragments_missing"
    )
  );
});

test("B-084 design-depth admission rejects contradictory schema and entity module ownership", () => {
  const ledger = ledgerFor(
    {
      kind: "sdlc_design_depth_register",
      registerVersion: "ts-design-depth-v1",
      targetAssetType: "implementation_design_surface",
      moduleSchemaFragments: [
        {
          moduleName: "cdme-compiler",
          entities: [
            {
              kind: "sdlc_domain_entity",
              entityId: "entity:MappingPlan",
              moduleName: "cdme-accounting",
              ownership: "owned",
              attributes: [],
              invariants: [],
              sourceAssetRefs: ["fixture://t122/contradictory-module"]
            }
          ],
          operations: [],
          requirementIds: ["REQ-TYP-001"],
          sourceAssetRefs: ["fixture://t122/contradictory-module"]
        }
      ],
      moduleStateDiagramFragments: []
    },
    fullBreadthScope()
  );
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert(
    ledger.reasons.some((reason) =>
      reason.code.startsWith("design_depth_register_invalid:")
    )
  );
});

test("B-084 design-depth generic core does not invent module identity", () => {
  const source = readFileSync(
    path.join(process.cwd(), "code/src/operator/design_depth_register.ts"),
    "utf8"
  );
  assert(!source.includes('"unnamed-module"'));
  assert(!source.includes('firstPart === "compiler"'));
});

test("B-084 design-depth admission rejects attributeId/type shorthand", () => {
  const outputFile = designDepthArtifact({
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    moduleSchemaFragments: [
      {
        moduleName: "cdme-compiler",
        entities: [
          {
            entityId: "compiler.entity.SourceAsset",
            attributes: [
              {
                attributeId: "sourceId",
                type: "String",
                cardinality: "1..1"
              },
              {
                attributeId: "sourceLabel",
                type: "String",
                cardinality: "0..1"
              },
              {
                attributeId: "sourceAliases",
                type: "String",
                cardinality: "0..*"
              }
            ]
          }
        ],
        operations: [
          {
            operationId: "compiler.op.bind_source",
            inputEntityIds: ["entity:cdme-compiler.compiler-entity-sourceasset"],
            outputEntityIds: ["entity:cdme-compiler.compiler-entity-sourceasset"],
            requiredAttributeIds: ["sourceId"]
          }
        ],
        requirementIds: ["REQ-TYP-001"],
        sourceAssetRefs: ["fixture://t122/attribute-shorthand"]
      }
    ],
    moduleStateDiagramFragments: [
      {
        entityId: "compiler.entity.SourceAsset",
        stateless: true,
        states: [],
        transitions: [],
        requirementIds: ["REQ-TYP-001"],
        sourceAssetRefs: ["fixture://t122/attribute-shorthand"]
      }
    ]
  });
  const ledger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: "implementation_design_surface",
      featureScope: steelThreadScope()
    },
    report: { outputFile }
  });
  assert(ledger);
  assert(
    ledger.reasons.some((reason) =>
      reason.code.startsWith("design_depth_register_invalid:")
    )
  );
});

test("B-084 design-depth admission rejects aggregate model metadata aliases", () => {
  const outputFile = designDepthArtifact({
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    aggregateDomainModel: {
      compositionRule: "merge_module_schema_fragments_for_included_modules",
      includedModuleNames: ["cdme-compiler"],
      entities: [
        {
          entityId: "cdme.compiler.ir.MappingDefinition",
          ownerModuleName: "cdme-compiler",
          attributes: [
            {
              name: "objects",
              type: "List<ObjectDecl>"
            }
          ]
        },
        {
          entityId: "cdme.compiler.ir.CompiledMapping",
          ownerModuleName: "cdme-compiler",
          attributes: [
            {
              name: "topology",
              type: "CompiledTopology"
            }
          ]
        }
      ],
      operations: [
        {
          operationId: "cdme.compiler.api.compile",
          ownerModuleName: "cdme-compiler",
          signature: "MappingDefinition -> Result<CompiledMapping, NonEmpty<CompileDiagnostic>>"
        }
      ],
      crossModuleReferences: [
        {
          surfaceName: "compiled_mapping_surface",
          ownerModuleName: "cdme-compiler",
          ownerEntityIds: ["cdme.compiler.ir.CompiledMapping"],
          consumerModuleNames: ["cdme-executor"],
          direction: "published_out"
        }
      ],
      sourceAssetRefs: ["fixture://t122/aggregate-extra"]
    },
    designCompletenessVerdict: {
      entityAxis: {
        verdict: "satisfied",
        rationale: "in-scope entities are present"
      },
      attributeAxis: {
        verdict: "satisfied",
        rationale: "in-scope attributes are present"
      },
      flowAxis: {
        verdict: "satisfied_for_steel_thread",
        rationale: "in-scope flow is present for the selected steel thread"
      }
    }
  });
  const ledger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: "implementation_design_surface",
      featureScope: steelThreadScope()
    },
    report: { outputFile }
  });
  assert(ledger);
  assert(
    ledger.reasons.some((reason) =>
      reason.code.startsWith("design_depth_register_invalid:")
    )
  );
});

test("B-084 design-depth admission rejects sunny-day sequence metadata aliases", () => {
  const outputFile = designDepthArtifact({
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    aggregateDomainModel: {
      compositionRule: "merge_module_schema_fragments_for_included_modules",
      includedModuleNames: ["cdme-compiler"],
      entities: [
        {
          entityId: "cdme.compiler.ir.MappingDefinition",
          ownerModuleName: "cdme-compiler",
          attributes: [
            {
              name: "objects",
              type: "List<ObjectDecl>"
            }
          ]
        },
        {
          entityId: "cdme.compiler.ir.CompiledMapping",
          ownerModuleName: "cdme-compiler",
          attributes: [
            {
              name: "topology",
              type: "CompiledTopology"
            }
          ]
        }
      ],
      operations: [
        {
          operationId: "cdme.compiler.api.compile",
          ownerModuleName: "cdme-compiler",
          signature: "MappingDefinition -> Result<CompiledMapping, NonEmpty<CompileDiagnostic>>"
        }
      ],
      sourceAssetRefs: ["fixture://t122/sunny-day-extra"]
    },
    aggregateSunnyDaySequence: {
      sequenceVersion: "ts-sunny-day-sequence-v1",
      compositionRule: "linear_phase_pipeline_under_compile_session_lawful_state_machine",
      includedModuleNames: ["cdme-compiler"],
      stateMachineRef: "entity://cdme.compiler.api.CompileSession",
      errorPathsExcludedReason: "sunny_day_only_ribbon_steel_thread",
      steps: [
        {
          stepId: "step.09.diagnostics.finalize",
          moduleName: "cdme-compiler",
          operationId: "cdme.compiler.api.compile",
          inputEntityIds: ["cdme.compiler.ir.MappingDefinition"],
          outputEntityIds: ["cdme.compiler.ir.CompiledMapping"],
          stateTransitionIds: ["compile_session.phase_8_ok"],
          summary: "Compile a single in-scope mapping definition."
        }
      ],
      stateMachineRibbon: {
        stateOrder: ["phase_8_finalizing", "succeeded"],
        transitionOrder: ["compile_session.phase_8_ok"]
      }
    },
    designCompletenessVerdict: {
      entityAxis: {
        verdict: "satisfied",
        rationale: "sequence entities are present"
      },
      attributeAxis: {
        verdict: "satisfied",
        rationale: "sequence attributes are present"
      },
      flowAxis: {
        verdict: "satisfied",
        rationale: "sequence flow is present"
      }
    }
  });
  const ledger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: "implementation_design_surface",
      featureScope: steelThreadScope()
    },
    report: { outputFile }
  });
  assert(ledger);
  assert(
    ledger.reasons.some((reason) =>
      reason.code.startsWith("design_depth_register_invalid:")
    )
  );
});

test("B-084 design-depth assurance admits exact carrier-id rows when identity is explicit", () => {
  const outputFile = designDepthArtifact({
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    aggregateDomainModel: {
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
              invariantRefs: ["requirement:REQ-LDM-001"]
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
      evidenceRefs: ["fixture://t122/live-normalization-regression"]
    },
    aggregateSunnyDaySequence: {
      kind: "sdlc_aggregate_sunny_day_sequence",
      sequenceVersion: "ts-design-depth-v1",
      steps: [
        {
          kind: "sdlc_sunny_day_sequence_step",
          stepId: "step-01-load",
          moduleName: "cdme-compiler",
          operationId: "operation:bindtypes",
          inputEntityIds: [],
          outputEntityIds: ["mapping-source"],
          stateTransitionIds: []
        }
      ],
      evidenceRefs: ["fixture://t122/live-normalization-regression"]
    },
    designCompletenessVerdict: verdict()
  });
  const ledger = deriveDesignCompletenessAssuranceLedger({
    manifest: {
      targetAssetType: "implementation_design_surface",
      featureScope: steelThreadScope()
    },
    report: { outputFile }
  });
  assert(ledger);
  assert.equal(ledger.verdict, "satisfied");
  assert(
    !ledger.reasons.some((reason) =>
      reason.code.startsWith("design_flow_operation_missing:")
    )
  );
  assert(
    !ledger.reasons.some((reason) =>
      reason.code.startsWith("design_flow_entity_missing:")
    )
  );
  assert(
    !ledger.reasons.some((reason) =>
      reason.code.startsWith("design_cross_module_entity_missing:")
    )
  );
});
