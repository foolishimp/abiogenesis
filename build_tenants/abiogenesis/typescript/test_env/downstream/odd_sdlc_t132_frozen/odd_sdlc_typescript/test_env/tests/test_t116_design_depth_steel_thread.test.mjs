// Validates: T-116
// Validates: T-121

import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  BOOTSTRAP_RELEASE_FUNCTION_CATALOG,
  admitDesignDepthRegisterFromArtifact,
  deriveDesignCompletenessAssuranceLedger,
  hookContractByEdgeName
} from "../../build/semantic/code/src/index.js";
import {
  designDepthRegisterPayloadFromEvaluateContentRegister
} from "../../build/semantic/code/src/operator/plugins/evaluate/content_register.js";

const attribute = Object.freeze({
  kind: "sdlc_domain_attribute",
  attributeId: "attr:MappingPlan.planId",
  name: "planId",
  valueType: "String",
  cardinality: "one",
  invariantRefs: ["REQ-T116-001"]
});

const entity = Object.freeze({
  kind: "sdlc_domain_entity",
  entityId: "entity:MappingPlan",
  moduleName: "cdme-compiler",
  ownership: "owned",
  attributes: [attribute],
  invariants: ["planId is stable for one compiled mapping"],
  sourceAssetRefs: ["fixture://t116/module-schema"]
});

const operation = Object.freeze({
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
    evidenceRefs: ["fixture://t116/verdict"]
  };
}

function satisfiedVerdict() {
  return {
    kind: "sdlc_design_completeness_verdict",
    verdictVersion: "ts-design-depth-v1",
    entity: axis("entity"),
    attribute: axis("attribute"),
    flow: axis("flow")
  };
}

function aggregateDomainModel(entities = [
  {
    kind: "sdlc_aggregate_domain_entity",
    entityId: entity.entityId,
    ownerModuleName: entity.moduleName,
    attributes: entity.attributes,
    sourceModuleNames: [entity.moduleName]
  }
]) {
  return {
    kind: "sdlc_aggregate_domain_model",
    modelVersion: "ts-design-depth-v1",
    entities,
    operations: [operation],
    crossModuleReferences: [],
    evidenceRefs: ["fixture://t116/aggregate-domain-model"]
  };
}

function sunnyDaySequence() {
  return {
    kind: "sdlc_aggregate_sunny_day_sequence",
    sequenceVersion: "ts-design-depth-v1",
    steps: [
      {
        kind: "sdlc_sunny_day_sequence_step",
        stepId: "step:compileMappingPlan",
        moduleName: "cdme-compiler",
        operationId: operation.operationId,
        inputEntityIds: [entity.entityId],
        outputEntityIds: [entity.entityId],
        stateTransitionIds: ["transition:MappingPlan.draft.compiled"]
      }
    ],
    evidenceRefs: ["fixture://t116/sunny-day-sequence"]
  };
}

function implementationDesignRegister(overrides = {}) {
  return {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface",
    stackProfileRows: [
      {
        kind: "sdlc_stack_profile_row",
        stackRef: "stack://t116/scala-sbt",
        language: "scala",
        buildTool: "sbt"
      }
    ],
    implementationModuleRows: [
      {
        kind: "sdlc_implementation_module_row",
        moduleName: "cdme-compiler",
        moduleRef: "module://t116/cdme-compiler"
      }
    ],
    aggregateDomainModelRows: [
      {
        kind: "sdlc_aggregate_domain_model_row",
        modelRef: "model://t116/aggregate"
      }
    ],
    moduleSchemaFragments: overrides.moduleSchemaFragments ?? [
      {
        kind: "sdlc_module_schema_fragment",
        moduleName: "cdme-compiler",
        entities: [entity],
        operations: [operation],
        requirementIds: ["REQ-T116-001"],
        sourceAssetRefs: ["fixture://t116/module-schema"]
      }
    ],
    moduleStateDiagramFragments: overrides.moduleStateDiagramFragments ?? [
      {
        kind: "sdlc_module_state_diagram_fragment",
        moduleName: "cdme-compiler",
        entityId: entity.entityId,
        stateless: false,
        states: ["draft", "compiled"],
        transitions: [
          {
            kind: "sdlc_entity_state_transition",
            transitionId: "transition:MappingPlan.draft.compiled",
            fromState: "draft",
            toState: "compiled",
            operationId: operation.operationId,
            entityId: entity.entityId
          }
        ],
        requirementIds: ["REQ-T116-001"],
        sourceAssetRefs: ["fixture://t116/state-diagram"]
      }
    ],
    aggregateDomainModel: overrides.aggregateDomainModel ?? aggregateDomainModel(),
    sunnyDaySequenceRows: [
      {
        kind: "sdlc_sunny_day_sequence_row",
        sequenceRef: "sequence://t116/sunny-day"
      }
    ],
    aggregateSunnyDaySequence: overrides.aggregateSunnyDaySequence ?? sunnyDaySequence(),
    componentTopologyRows: overrides.componentTopologyRows ?? [
      {
        kind: "sdlc_component_topology_row",
        componentId: "cmp.cdme.compiler",
        moduleName: "cdme-compiler",
        relativePath: "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        concernRole: "parser",
        publicBoundary: "package_internal",
        requirementIds: ["REQ-T116-001"],
        sourceAssetRefs: ["fixture://t116/component-topology"]
      }
    ],
    componentRealizationRows: overrides.componentRealizationRows ?? [
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
        requirementIds: ["REQ-T116-001"],
        sourceAssetRefs: ["fixture://t116/component-realization"]
      }
    ],
    fileTargetRows: overrides.fileTargetRows ?? [
      {
        kind: "sdlc_file_target_row",
        relativePath: "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        role: "source"
      }
    ],
    designCompletenessVerdict: overrides.designCompletenessVerdict ?? satisfiedVerdict()
  };
}

function moduleRegister() {
  return implementationDesignRegister();
}

function aggregateDomainRegister(model = aggregateDomainModel(), verdict = satisfiedVerdict()) {
  return implementationDesignRegister({
    aggregateDomainModel: model,
    designCompletenessVerdict: verdict
  });
}

function sunnyDayRegister(sequence = sunnyDaySequence(), verdict = satisfiedVerdict()) {
  return implementationDesignRegister({
    aggregateDomainModel: aggregateDomainModel(),
    aggregateSunnyDaySequence: sequence,
    designCompletenessVerdict: verdict
  });
}

function writeArtifact(targetAssetType, register) {
  const root = mkdtempSync(path.join(tmpdir(), "odd-sdlc-t116-"));
  const outputFile = path.join(root, `${targetAssetType}.json`);
  const content = `${JSON.stringify(register, null, 2)}\n`;
  mkdirSync(path.dirname(outputFile), { recursive: true });
  writeFileSync(outputFile, content, "utf8");
  return outputFile;
}

function contentRegisterFromDesignDepthRegister(register) {
  const sections = [
    "stackProfileRows",
    "implementationModuleRows",
    "aggregateDomainModelRows",
    "moduleSchemaFragments",
    "moduleStateDiagramFragments",
    "aggregateDomainModel",
    "sunnyDaySequenceRows",
    "aggregateSunnyDaySequence",
    "componentTopologyRows",
    "componentRealizationRows",
    "fileTargetRows",
    "designCompletenessVerdict"
  ];
  return {
    contentRows: sections.map((section, index) => ({
      kind: "sdlc_evaluate_content_register_row",
      rowRef: `content-register-row://t116/${section}`,
      authorityFunction: "synthesize_model",
      carrierFamily: "ProductAssetModel",
      contentKind: "sdlc_design_depth_register_fragment",
      payload: {
        kind: "sdlc_design_depth_register_fragment",
        fragmentVersion: "ts-design-depth-fragment-v1",
        targetAssetType: register.targetAssetType,
        section,
        sequence: index + 1,
        mergeMode: "replace",
        value: register[section]
      },
      sourceBasisRefs: ["fixture://t116/source"],
      evidenceRefs: ["fixture://t116/evidence"]
    }))
  };
}

function ledgerFor(targetAssetType, register) {
  const outputFile = writeArtifact(targetAssetType, register);
  const admission = admitDesignDepthRegisterFromArtifact({
    targetAssetType,
    outputFile
  });
  const ledger = deriveDesignCompletenessAssuranceLedger({
    manifest: { targetAssetType },
    report: { outputFile }
  });
  return { admission, ledger };
}

test("T-116 publishes the consolidated implementation-design edge before realization", () => {
  const names = BOOTSTRAP_RELEASE_FUNCTION_CATALOG.map((entry) => entry.name);
  assert(
    names.indexOf("derive_implementation_design_surface") <
      names.indexOf("derive_component_code_surface")
  );
  assert(
    names.indexOf("derive_implementation_design_surface") <
      names.indexOf("derive_test_design_surface")
  );
  assert(
    hookContractByEdgeName("derive_component_code_surface")
      .sourceAssetTypes.includes("implementation_design_surface")
  );
  assert(
    hookContractByEdgeName("derive_test_design_surface")
      .sourceAssetTypes.includes("implementation_design_surface")
  );
  assert.equal(
    names.filter((name) => name === "derive_implementation_design_surface").length,
    1
  );
});

test("T-116 design-depth fragments canonicalize source implementation roles", () => {
  const register = implementationDesignRegister({
    fileTargetRows: [
      {
        kind: "sdlc_file_target_row",
        relativePath: "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        role: "source/implementation"
      }
    ]
  });
  const projected = designDepthRegisterPayloadFromEvaluateContentRegister(
    contentRegisterFromDesignDepthRegister(register)
  );

  assert.equal(projected.fileTargetRows[0].role, "source");
  assert.equal(projected.componentTopologyRows.length, 1);
  assert.equal(projected.componentRealizationRows.length, 1);
});

test("T-116 design-depth source-target admission rejects empty component source rows", () => {
  const register = implementationDesignRegister({
    componentTopologyRows: [],
    componentRealizationRows: [],
    fileTargetRows: [
      {
        kind: "sdlc_file_target_row",
        relativePath: "cdme-compiler/src/main/scala/cdme/compiler/Compiler.scala",
        role: "source/implementation"
      }
    ]
  });
  const outputFile = writeArtifact("implementation_design_surface", register);
  const admission = admitDesignDepthRegisterFromArtifact({
    targetAssetType: "implementation_design_surface",
    outputFile,
    requireSourceFileTargets: true
  });

  assert.equal(admission.status, "rejected");
  assert.match(
    admission.blockingReasons.join("\n"),
    /design_depth_register_component_topology_source_rows_missing/u
  );
  assert.match(
    admission.blockingReasons.join("\n"),
    /design_depth_register_component_realization_source_rows_missing/u
  );
});

test("T-116 admits the steel-thread module schema and state diagram", () => {
  const { admission, ledger } = ledgerFor(
    "implementation_design_surface",
    moduleRegister()
  );
  assert.equal(admission.status, "admitted");
  assert.equal(admission.register.moduleSchemaFragments.length, 1);
  assert.equal(admission.register.moduleStateDiagramFragments.length, 1);
  assert(ledger);
  assert.equal(ledger.verdict, "satisfied");
});

test("T-169 design-depth admission is structural while content gaps stay in assurance", () => {
  const minimalCarrier = {
    kind: "sdlc_design_depth_register",
    registerVersion: "ts-design-depth-v1",
    targetAssetType: "implementation_design_surface"
  };
  const { admission, ledger } = ledgerFor(
    "implementation_design_surface",
    minimalCarrier
  );

  assert.equal(admission.status, "admitted");
  assert.deepEqual(admission.blockingReasons, []);
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert(
    ledger.reasons.some(
      (reason) => reason.code === "design_depth_module_schema_fragments_missing"
    )
  );
  assert(
    ledger.reasons.some(
      (reason) => reason.code === "design_depth_component_topology_rows_missing"
    )
  );
  assert(
    !ledger.reasons.some((reason) =>
      reason.code.startsWith("design_depth_register_invalid:")
    )
  );
});

test("T-183 rejects design-depth selected target-carrier envelopes as duplicate authority", () => {
  const register = moduleRegister();
  const envelopedCarrier = {
    kind: "sdlc_implementation_design_surface_target_carrier",
    targetAssetType: "implementation_design_surface",
    edgeRef: "derive_lite_design_adr_surface",
    contractRef:
      "gtl://target-carrier-contract/odd-sdlc/derive_lite_design_adr_surface/implementation_design_surface",
    contractDigest: "sha256:fixture",
    payload: register
  };
  const { admission, ledger } = ledgerFor(
    "implementation_design_surface",
    envelopedCarrier
  );

  assert.equal(admission.status, "rejected");
  assert.deepEqual(admission.blockingReasons, [
    "design_depth_register_top_level_kind_required"
  ]);
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
});

test("T-116 admits aggregate domain model and sunny-day sequence steel thread", () => {
  const aggregate = ledgerFor(
    "implementation_design_surface",
    aggregateDomainRegister()
  );
  assert.equal(aggregate.admission.status, "admitted");
  assert(aggregate.ledger);
  assert.equal(aggregate.ledger.verdict, "satisfied");

  const sequence = ledgerFor(
    "implementation_design_surface",
    sunnyDayRegister()
  );
  assert.equal(sequence.admission.status, "admitted");
  assert(sequence.ledger);
  assert.equal(sequence.ledger.verdict, "satisfied");
});

test("T-116 consolidated implementation design escalates incomplete flow verdicts to F_P", () => {
  const downstreamOwnedFlowVerdict = {
    ...satisfiedVerdict(),
    flow: axis("flow", "partial", [
      "Sunny-day sequence projection is incomplete inside implementation_design_surface."
    ])
  };
  const { admission, ledger } = ledgerFor(
    "implementation_design_surface",
    aggregateDomainRegister(aggregateDomainModel(), downstreamOwnedFlowVerdict)
  );

  assert.equal(admission.status, "admitted");
  assert(ledger);
  assert.equal(ledger.verdict, "fp_escalation");
  assert(
    ledger.reasons.some((reason) =>
      reason.code === "design_completeness_flow_partial"
    )
  );
});

test("T-116 blocks design completeness when an aggregate entity omits attributes", () => {
  const missingAttributeEntity = {
    kind: "sdlc_aggregate_domain_entity",
    entityId: entity.entityId,
    ownerModuleName: entity.moduleName,
    attributes: [],
    sourceModuleNames: [entity.moduleName]
  };
  const { admission, ledger } = ledgerFor(
    "implementation_design_surface",
    aggregateDomainRegister(aggregateDomainModel([missingAttributeEntity]))
  );
  assert.equal(admission.status, "admitted");
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert(
    ledger.reasons.some((reason) =>
      reason.code === `design_attribute_missing:${entity.entityId}`
    )
  );
});

test("T-116 blocks flow completeness when the sequence skips a published operation", () => {
  const badSequence = {
    ...sunnyDaySequence(),
    steps: [
      {
        ...sunnyDaySequence().steps[0],
        operationId: "operation:missing"
      }
    ]
  };
  const { admission, ledger } = ledgerFor(
    "implementation_design_surface",
    sunnyDayRegister(badSequence)
  );
  assert.equal(admission.status, "admitted");
  assert(ledger);
  assert.equal(ledger.verdict, "open_gap");
  assert(
    ledger.reasons.some((reason) =>
      reason.code === "design_flow_operation_missing:operation:missing"
    )
  );
});
