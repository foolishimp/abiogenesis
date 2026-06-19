import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync
} from "node:fs";import path, {
  dirname,
  isAbsolute,
  join,
  relative,
  resolve
} from "node:path";import {
  fileURLToPath,
  pathToFileURL
} from "node:url";import {
  type FpTransformRequest
} from "@abiogenesis/typescript-tenant";import type {
  AdmittedOutputAuthorityProjection
} from "@abiogenesis/typescript-tenant/abg/m03";import {
  type SdlcHookContract
} from "../../../hooks/index.js";import {
  constructSdlcTargetCarrierRegistry,
  constructSdlcGtlModule,
  FG_DERIVE_LITE_COMPONENT_CODE_SURFACE,
  FG_CONFORM_PROJECT_AUTHORITY,
  FG_MATERIALIZE_DECLARED_PRODUCT_ASSET,
  requireSdlcTargetCarrierRow,
  type SdlcTargetCarrierContractRow
} from "../../../graph/index.js";import {
  stableSdlcSystemArtifactJson,
  writeSdlcSystemArtifact
} from "../../system_artifacts.js";import {
  parseClosedRecord,
  parseNonEmptyString
} from "../../../shared/validation.js";import {
  uniqueSorted
} from "../../../shared/collections.js";import {
  sha256Text
} from "../../../shared/digest.js";import {
  pathIsInside
} from "../../../shared/path.js";import {
  selectSdlcWorkCategoryGovernance
} from "../../work_category_governance.js";import {
  constructSdlcPromptInvocationProjection,
  sdlcPromptSectionFromLines,
  type SdlcPromptSectionConstructionInput,
  type SdlcRenderedPromptProjection
} from "../../prompt_assets.js";import {
  sdlcOperatorRuntimePolicy
} from "../../runtime_policy.js";import {
  sdlcEdgeOutputPolicyForTargetAssetType,
  sdlcInstalledOperatorProjectsOutput
} from "../../edge_output_policy.js";import {
  sdlcWorkerTargetUsesShellToolProfile
} from "../../worker_tool_profile.js";import {
  outcomeDirectivesForWorker
} from "./prompt_edge_policy.js";import {
  assertSdlcProductMaterializationLaunchable,
  reconcileSdlcProductMaterializationAuthority
} from "../../product_materialization/authority.js";import {
  MATERIALIZED_PRODUCT_FILE_ROLES,
  TENANT_LOCAL_SDLC_SURFACE_OUTPUT_PATHS,
  tenantLocalSdlcSurfaceRelativePath,
  workspaceLocalSdlcSurfaceRelativePath
} from "../../product_materialization/surface_paths.js";import {
  acceptedCarrierSchemaForReason,
  componentRepairReentryPlanForReason,
  componentRepairReentryPlansForGapDossier,
  existingEvidencePaths
} from "../consequence/repair_reentry.js";import {
  computeSubworkstreamSelectedEdgeRef,
  computeSubworkstreamTargetCarrierRef,
  defaultComputeSubworkstreamManifest,
  SDLC_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE,
  SDLC_COMPUTE_SUBWORKSTREAM_ROW_FIELDS
} from "../../compute_subworkstreams.js";

export { sha256Text } from "../../../shared/digest.js";
export { pathIsInside } from "../../../shared/path.js";import {
  admittedDesignDepthFpEvaluatorRegisterEvidenceRefs,
  designDepthFpEvaluatorRegisterPath
} from "../evaluate/design_depth_register.js";import {
  canonicalSdlcPriorGapReasonCode,
  makeSdlcBlockingReason
} from "../../../shared/blocking_reason.js";import {
  deriveSdlcFeatureScope,
  sdlcTraversalObligationInFeatureScope
} from "../../feature_scope.js";import {
  digestSdlcEdgeGainClosureContract,
  resolveSdlcEdgeGainClosureContract,
  sdlcEdgeAssuranceContractRef
} from "../../edge_gain_closure.js";import {
  deriveSdlcTraversalStrategyDecision
} from "../../traversal_strategy.js";import {
  defaultSdlcTraversalScopeRefsForName
} from "../../../shared/traversal_strategy_plan.js";import type {
  SdlcProjectConstraints
} from "../../../workspace/index.js";import {
  deriveSdlcConformProjectProfileFromWorkspace,
  standardSdlcRuntimeLayout,
  type SdlcConformProjectProfile
} from "../../../workspace/index.js";import {
  isPlaceholderRequirementMarker,
  localRequirementMarker,
  requirementAuthorityIdentityForMarker
} from "../../../workspace/source_input.js";import {
  SDLC_COMPONENT_CONCERN_ROLES,
  SDLC_DESIGN_COMPLETENESS_AXES,
  SDLC_DESIGN_COMPLETENESS_STATUSES,
  SDLC_DOMAIN_ATTRIBUTE_CARDINALITIES,
  SDLC_DOMAIN_ENTITY_OWNERSHIP
} from "../../carriers.js";import type {
  SdlcMaterializedProductFileRole,
  SdlcPostflightGapDossier,
  SdlcPostflightGapReason,
  SdlcComponentRepairReentryPlan,
  SdlcProductMaterializationContract,
  SdlcAuthorityIndexCategory,
  SdlcAuthorityIndexEntry,
  SdlcTraversalIntentPackage,
  SdlcTraversalObligation,
  SdlcTraversalObligationPayload,
  SdlcTraversalObligationContext,
  SdlcTraversalStrategyDecision,
  SdlcRetrievalHint,
  SdlcProductMaterializationAuthorityReconciliation,
  SdlcProductMaterializationAuthorityTarget,
  SdlcWorkerBrief,
  SdlcWorkerTargetCarrierConstructionTemplate,
  SdlcWorkerTargetCarrierObjectTemplate,
  SdlcWorkerInvocationObligation,
  SdlcWorkerInvocationPackage,
  SdlcTenantToolEnvironmentProjection,
  SdlcWorkerTargetCarrierProjection,
  SdlcWorkerTargetCarrierPromptProjection,
  SdlcWorkerConstructionBrief,
  SdlcWorkerRetryRepairInstruction,
  SdlcWorkerRetryRepairScope,
  SdlcWorkerHandoffManifest,
  SdlcWorkerRetryContext,
  SdlcComputeSubworkstreamPolicy,
  SdlcComputeSubworkstreamStageRef,
  SdlcComputeProportionalityProfile,
  SdlcTraversalHopSelection
} from "../../carriers.js";

const REPORT_FIELDS = Object.freeze([
  "kind",
  "projectionRole",
  "authoritativeStageResultRef",
  "graphFunctionName",
  "edgeName",
  "targetAssetType",
  "outputFile",
  "digest",
  "summary",
  "unresolvedReasons",
  "materializedFiles",
  "materializationDiagnostics",
  "executionEvidence",
  "executionEvidenceErrors",
  "obligationAssessments",
  "subworkstreamManifest",
  "fpTransformRequestRef",
  "fpTransformResultRef",
  "fpTransformStatusSnapshot",
  "fpEvaluateResultRef"
] as const);

const REQUIREMENT_MARKER_TOKEN_EXPRESSION =
  /\b(?:RF-[A-Z0-9]+(?:-[A-Z0-9]+)*|REQ-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b(?!-)/;
const REQUIREMENT_MARKER_EXPRESSION =
  /\b(?:RF-[A-Z0-9]+(?:-[A-Z0-9]+)*|REQ-[A-Z0-9]+(?:-[A-Z0-9]+)*)\b(?!-)/g;
const LOCAL_REQUIREMENT_HEADING_EXPRESSION =
  /^[ \t]{0,3}(?:#{1,6}\s+|[-*]\s+)?(R-\d{1,4})(?:\s*[:.-]\s*|\s+)([^\n]+?)\s*$/gimu;
const MAX_INVOCATION_PACKAGE_REQUIREMENT_TRACE_IDS = 80;
const MAX_PROMPT_VISIBLE_AUTHORITY_REF_LENGTH = 300;

const TRAVERSAL_AUTHORITY_PATHS = Object.freeze([
  "specification/INTENT.md",
  "specification/PRODUCT.md",
  "specification/GOALS.md",
  "specification/REQUIREMENTS.md",
  "bootstrap.md",
  ".ai-workspace/context/project_bootstrap.md",
  ".ai-workspace/context/project_constraints.yml"
] as const);

const PROJECT_BOOTSTRAP_RELATIVE_PATH =
  ".ai-workspace/context/project_bootstrap.md" as const;

const TRAVERSAL_RUNTIME_CONTEXT_PATHS = Object.freeze([
  ".ai-workspace/runtime/odd_sdlc-requirement-closure.json",
  ".ai-workspace/runtime/odd_sdlc-ambiguity-register.json",
  ".ai-workspace/runtime/odd_sdlc-analysis-manifest.json",
  ".ai-workspace/runtime/odd_sdlc-workspace-normalization.json"
] as const);

export function stableOperatorJson(payload: unknown): string {
  return stableSdlcSystemArtifactJson(payload);
}

export function sha256File(filePath: string): string {
  return sha256Text(readFileSync(filePath, "utf8"));
}

export function operatorRunId(): string {
  return `${new Date()
    .toISOString()
    .replaceAll("-", "")
    .replaceAll(":", "")
    .replace(".", "")}_pid${process.pid}`;
}

function deriveOutputFileForTarget(input: {
  readonly defaultOutputRoot: string;
  readonly workspaceRoot: string;
  readonly targetAssetType: string;
  readonly materialization: SdlcProductMaterializationContract;
}): string {
  const workspaceRelativePath = workspaceLocalSdlcSurfaceRelativePath(
    input.targetAssetType
  );
  if (workspaceRelativePath !== null) {
    return join(input.workspaceRoot, workspaceRelativePath);
  }
  const tenantRelativePath = tenantLocalSdlcSurfaceRelativePath(
    input.targetAssetType
  );
  if (tenantRelativePath === null) {
    return join(input.defaultOutputRoot, `${input.targetAssetType}.md`);
  }
  return join(input.materialization.tenantRoot, tenantRelativePath);
}

function materializationRolesForTarget(
  targetAssetType: string
): readonly SdlcMaterializedProductFileRole[] {
  return sdlcEdgeOutputPolicyForTargetAssetType(targetAssetType).materializationRoles;
}

function targetAdmitsTestExecutionEvidence(targetAssetType: string): boolean {
  return sdlcEdgeOutputPolicyForTargetAssetType(targetAssetType)
    .admitsTestExecutionEvidence;
}

function edgeOutputPolicyProjectsOutput(targetAssetType: string): boolean {
  return sdlcInstalledOperatorProjectsOutput(targetAssetType);
}

function workerAuthoredTargetCarrierProtocolRequired(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return sdlcEdgeOutputPolicyForTargetAssetType(manifest.targetAssetType)
    .workerAuthoredTargetCarrierProtocolRequired;
}

function declaredExecutionContract(input: string): boolean {
  const contract = input.trim().toLowerCase();
  return (
    contract.length > 0 &&
    contract !== "undeclared" &&
    contract !== "none" &&
    contract !== "n/a" &&
    contract !== "not_applicable"
  );
}

function productMaterializationRequiresTestExecutionEvidence(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return productMaterializationHasExecutionRepairScope({
    edgeName: manifest.edgeName,
    targetAssetType: manifest.targetAssetType,
    productMaterialization: manifest.productMaterialization
  });
}

function productMaterializationHasExecutionRepairScope(input: {
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly productMaterialization: SdlcProductMaterializationContract;
}): boolean {
  if (
    input.targetAssetType === "test_execution_result_surface" &&
    declaredExecutionContract(input.productMaterialization.testExecutionContract)
  ) {
    return true;
  }
  return (
    input.edgeName === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET &&
    input.targetAssetType === "component_code_surface" &&
    input.productMaterialization.required &&
    declaredExecutionContract(input.productMaterialization.testExecutionContract)
  );
}

function transformWorkerIoDisciplineLines(
  manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">
): readonly string[] {
  if (sdlcWorkerTargetUsesShellToolProfile(manifest)) {
    return Object.freeze([
      "- Tool-profile contract: this execution-capable SDLC profile may use shell only when the active tool list exposes it; keep shell commands bounded, workspace-relative, foreground-only, and never launch framework, traversal, or background workers.",
      "- Read cap: every Read tool call over JSON, Markdown, report, manifest, or source artifacts must set limit <=80 and inspect only the slice needed for the current checklist row.",
      "- Shell IO cap: command output reads <=80 lines. jq/rg/cat/git diff/status end `| head -80`; no bare jq/rg/cat. sed is inclusive: end-start+1<=80; `200,299p` invalid (100), use `200,279p`."
    ]);
  }
  return Object.freeze([
    "- Tool-profile contract: no-execution SDLC profile. Obey active tools; if command execution is visible, use only bounded workspace-relative read-only inspection; never run product, build/test, framework/traversal, background, or artifact-write commands.",
    "- Read cap: every Read tool call or read-only command over JSON, Markdown, report, manifest, or source artifacts must inspect <=80 lines and only the lines needed for the current checklist row. Do not run unbounded recursive scans."
  ]);
}

function targetRequiresSourceAssetObligations(input: {
  readonly targetAssetType: string;
  readonly materializationRequired: boolean;
}): boolean {
  return (
    input.materializationRequired ||
    input.targetAssetType === "test_run_archive_surface" ||
    input.targetAssetType === "component_repair_schedule_surface" ||
    input.targetAssetType === "release_depth_parity_surface"
  );
}

function targetCarrierRowForEdge(edgeName: string): SdlcTargetCarrierContractRow {
  return requireSdlcTargetCarrierRow({
    registry: constructSdlcTargetCarrierRegistry({
      module: constructSdlcGtlModule()
    }),
    edgeRef: edgeName
  });
}

function targetCarrierObjectTemplate(input: {
  readonly templateRef: string;
  readonly requiredFields: readonly string[];
  readonly fieldTypes: Readonly<Record<string, string>>;
  readonly enumDomains?: Readonly<Record<string, readonly string[]>>;
  readonly example: Readonly<Record<string, unknown>>;
}): SdlcWorkerTargetCarrierObjectTemplate {
  return Object.freeze({
    kind: "sdlc_worker_target_carrier_object_template" as const,
    templateRef: input.templateRef,
    closed: true as const,
    requiredFields: Object.freeze([...input.requiredFields]),
    fieldTypes: Object.freeze({ ...input.fieldTypes }),
    enumDomains: Object.freeze({ ...(input.enumDomains ?? {}) }),
    example: Object.freeze({ ...input.example })
  });
}

function implementationDesignConstructionTemplate(
  row: SdlcTargetCarrierContractRow
): SdlcWorkerTargetCarrierConstructionTemplate {
  const modulePlaceholder = "<module>";
  const entityPlaceholder = "<entity>";
  const attributePlaceholder = `attr:${modulePlaceholder}.${entityPlaceholder}.runtime`;
  const attributeExample = Object.freeze({
    kind: "sdlc_domain_attribute",
    attributeId: attributePlaceholder,
    name: "runtime",
    valueType: "string",
    cardinality: "one",
    invariantRefs: ["<requirement-or-invariant-ref>"]
  });
  const operationExample = Object.freeze({
    kind: "sdlc_domain_operation",
    operationId: "<operation>",
    moduleName: modulePlaceholder,
    inputEntityIds: [],
    outputEntityIds: [entityPlaceholder],
    requiredAttributeIds: [attributePlaceholder]
  });
  return Object.freeze({
    kind: "sdlc_worker_target_carrier_construction_template" as const,
    templateRef: row.constructionTemplateRef,
    targetAssetType: row.targetAssetType,
    carrierKind: row.outputCarrierKind,
    nestedPayloadPath: row.nestedPayloadPath,
    carrierEnvelope: targetCarrierObjectTemplate({
      templateRef: `${row.constructionTemplateRef}/carrier-envelope`,
      requiredFields: row.requiredFieldRefs,
      fieldTypes: Object.freeze({
        kind: "literal",
        targetAssetType: "literal",
        edgeRef: "literal",
        contractRef: "literal",
        contractDigest: "sha256",
        payload: "sdlc_design_depth_register"
      }),
      enumDomains: Object.freeze({
        kind: Object.freeze([row.outputCarrierKind]),
        targetAssetType: Object.freeze([row.targetAssetType]),
        edgeRef: Object.freeze([row.edgeRef]),
        contractRef: Object.freeze([row.targetCarrierContractRef])
      }),
      example: Object.freeze({
        kind: row.outputCarrierKind,
        targetAssetType: row.targetAssetType,
        edgeRef: row.edgeRef,
        contractRef: row.targetCarrierContractRef,
        contractDigest: row.targetCarrierContractDigest,
        payload: "<design_depth_register>"
      })
    }),
    payloadTemplate: targetCarrierObjectTemplate({
      templateRef: `${row.constructionTemplateRef}/payload/design-depth-register`,
      requiredFields: Object.freeze([
        "kind",
        "registerVersion",
        "targetAssetType",
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
      ]),
      fieldTypes: Object.freeze({
        kind: "literal:sdlc_design_depth_register",
        registerVersion: "literal:ts-design-depth-v1",
        targetAssetType: "literal:implementation_design_surface",
        stackProfileRows: "sdlc_stack_profile_row[]",
        implementationModuleRows: "sdlc_implementation_module_row[]",
        aggregateDomainModelRows: "sdlc_aggregate_domain_model_row[]",
        moduleSchemaFragments: "sdlc_module_schema_fragment[]",
        moduleStateDiagramFragments: "sdlc_module_state_diagram_fragment[]",
        aggregateDomainModel: "sdlc_aggregate_domain_model",
        sunnyDaySequenceRows: "sdlc_sunny_day_sequence_row[]",
        aggregateSunnyDaySequence: "sdlc_aggregate_sunny_day_sequence",
        componentTopologyRows: "sdlc_component_topology_row[]",
        componentRealizationRows: "sdlc_component_realization_row[]",
        fileTargetRows: "sdlc_file_target_row[]",
        designCompletenessVerdict: "sdlc_design_completeness_verdict"
      }),
      enumDomains: Object.freeze({
        kind: Object.freeze(["sdlc_design_depth_register"]),
        registerVersion: Object.freeze(["ts-design-depth-v1"]),
        targetAssetType: Object.freeze(["implementation_design_surface"])
      }),
      example: Object.freeze({
        kind: "sdlc_design_depth_register",
        registerVersion: "ts-design-depth-v1",
        targetAssetType: "implementation_design_surface",
        stackProfileRows: ["<sdlc_stack_profile_row>"],
        implementationModuleRows: ["<sdlc_implementation_module_row>"],
        aggregateDomainModelRows: ["<sdlc_aggregate_domain_model_row>"],
        moduleSchemaFragments: ["<sdlc_module_schema_fragment>"],
        moduleStateDiagramFragments: ["<sdlc_module_state_diagram_fragment>"],
        aggregateDomainModel: "<sdlc_aggregate_domain_model>",
        sunnyDaySequenceRows: ["<sdlc_sunny_day_sequence_row>"],
        aggregateSunnyDaySequence: "<sdlc_aggregate_sunny_day_sequence>",
        componentTopologyRows: ["<sdlc_component_topology_row>"],
        componentRealizationRows: ["<sdlc_component_realization_row>"],
        fileTargetRows: ["<sdlc_file_target_row>"],
        designCompletenessVerdict: "<sdlc_design_completeness_verdict>"
      })
    }),
    rowTemplates: Object.freeze([
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/stack-profile`,
        requiredFields: Object.freeze([
          "kind",
          "stackRef",
          "language",
          "buildTool"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_stack_profile_row",
          stackRef: "uri",
          language: "string",
          buildTool: "string"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_stack_profile_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_stack_profile_row",
          stackRef: "<stack-ref>",
          language: "<language>",
          buildTool: "<tool>"
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/implementation-module`,
        requiredFields: Object.freeze([
          "kind",
          "moduleName",
          "moduleRef"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_implementation_module_row",
          moduleName: "string",
          moduleRef: "uri"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_implementation_module_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_implementation_module_row",
          moduleName: modulePlaceholder,
          moduleRef: `module://${modulePlaceholder}`
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/aggregate-domain-model-row`,
        requiredFields: Object.freeze([
          "kind",
          "modelRef"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_aggregate_domain_model_row",
          modelRef: "uri"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_aggregate_domain_model_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_aggregate_domain_model_row",
          modelRef: `<model-ref>`
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/domain-attribute`,
        requiredFields: Object.freeze([
          "kind",
          "attributeId",
          "name",
          "valueType",
          "cardinality",
          "invariantRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_domain_attribute",
          attributeId: "string",
          name: "string",
          valueType: "string",
          cardinality: "enum",
          invariantRefs: "string[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_domain_attribute"]),
          cardinality: SDLC_DOMAIN_ATTRIBUTE_CARDINALITIES
        }),
        example: attributeExample
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/module-schema-fragment`,
        requiredFields: Object.freeze([
          "kind",
          "moduleName",
          "entities",
          "operations",
          "requirementIds",
          "sourceAssetRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_module_schema_fragment",
          moduleName: "string",
          entities: "sdlc_domain_entity[]",
          operations: "sdlc_domain_operation[]",
          requirementIds: "string[]",
          sourceAssetRefs: "workspace-ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_module_schema_fragment"])
        }),
        example: Object.freeze({
          kind: "sdlc_module_schema_fragment",
          moduleName: modulePlaceholder,
          entities: [
            {
              kind: "sdlc_domain_entity",
              entityId: entityPlaceholder,
              moduleName: modulePlaceholder,
              ownership: "owned",
              attributes: [attributeExample],
              invariants: [],
              sourceAssetRefs: ["workspace://..."]
            }
          ],
          operations: [operationExample],
          requirementIds: ["<requirement-id>"],
          sourceAssetRefs: ["workspace://..."]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/domain-entity`,
        requiredFields: Object.freeze([
          "kind",
          "entityId",
          "moduleName",
          "ownership",
          "attributes",
          "invariants",
          "sourceAssetRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_domain_entity",
          entityId: "string",
          moduleName: "string",
          ownership: "enum",
          attributes: "sdlc_domain_attribute[]",
          invariants: "string[]",
          sourceAssetRefs: "workspace-ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_domain_entity"]),
          ownership: SDLC_DOMAIN_ENTITY_OWNERSHIP
        }),
        example: Object.freeze({
          kind: "sdlc_domain_entity",
          entityId: entityPlaceholder,
          moduleName: modulePlaceholder,
          ownership: "owned",
          attributes: [attributeExample],
          invariants: [],
          sourceAssetRefs: ["workspace://..."]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/domain-operation`,
        requiredFields: Object.freeze([
          "kind",
          "operationId",
          "moduleName",
          "inputEntityIds",
          "outputEntityIds",
          "requiredAttributeIds"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_domain_operation",
          operationId: "string",
          moduleName: "string",
          inputEntityIds: "string[]",
          outputEntityIds: "string[]",
          requiredAttributeIds: "attributeId[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_domain_operation"])
        }),
        example: operationExample
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/aggregate-domain-model`,
        requiredFields: Object.freeze([
          "kind",
          "modelVersion",
          "entities",
          "operations",
          "crossModuleReferences",
          "evidenceRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_aggregate_domain_model",
          modelVersion: "literal:ts-design-depth-v1",
          entities: "sdlc_aggregate_domain_entity[]",
          operations: "sdlc_domain_operation[]",
          crossModuleReferences: "sdlc_cross_module_reference[]",
          evidenceRefs: "workspace-ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_aggregate_domain_model"]),
          modelVersion: Object.freeze(["ts-design-depth-v1"])
        }),
        example: Object.freeze({
          kind: "sdlc_aggregate_domain_model",
          modelVersion: "ts-design-depth-v1",
          entities: [
            {
              kind: "sdlc_aggregate_domain_entity",
              entityId: entityPlaceholder,
              ownerModuleName: modulePlaceholder,
              attributes: [attributeExample],
              sourceModuleNames: [modulePlaceholder]
            }
          ],
          operations: [operationExample],
          crossModuleReferences: [],
          evidenceRefs: ["workspace://..."]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/aggregate-domain-entity`,
        requiredFields: Object.freeze([
          "kind",
          "entityId",
          "ownerModuleName",
          "attributes",
          "sourceModuleNames"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_aggregate_domain_entity",
          entityId: "string",
          ownerModuleName: "string",
          attributes: "sdlc_domain_attribute[]",
          sourceModuleNames: "string[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_aggregate_domain_entity"])
        }),
        example: Object.freeze({
          kind: "sdlc_aggregate_domain_entity",
          entityId: entityPlaceholder,
          ownerModuleName: modulePlaceholder,
          attributes: [attributeExample],
          sourceModuleNames: [modulePlaceholder]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/cross-module-reference`,
        requiredFields: Object.freeze([
          "fromModuleName",
          "toModuleName",
          "entityId"
        ]),
        fieldTypes: Object.freeze({
          fromModuleName: "string",
          toModuleName: "string",
          entityId: "string"
        }),
        enumDomains: Object.freeze({}),
        example: Object.freeze({
          fromModuleName: "<from-module>",
          toModuleName: "<to-module>",
          entityId: entityPlaceholder
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/state-transition`,
        requiredFields: Object.freeze([
          "kind",
          "transitionId",
          "fromState",
          "toState",
          "operationId",
          "entityId"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_entity_state_transition",
          transitionId: "string",
          fromState: "string",
          toState: "string",
          operationId: "string",
          entityId: "string"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_entity_state_transition"])
        }),
        example: Object.freeze({
          kind: "sdlc_entity_state_transition",
          transitionId: "<transition>",
          fromState: "<from>",
          toState: "<to>",
          operationId: operationExample.operationId,
          entityId: entityPlaceholder
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/module-state-diagram-fragment`,
        requiredFields: Object.freeze([
          "kind",
          "moduleName",
          "entityId",
          "stateless",
          "states",
          "transitions",
          "requirementIds",
          "sourceAssetRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_module_state_diagram_fragment",
          moduleName: "string",
          entityId: "string",
          stateless: "boolean",
          states: "string[]",
          transitions: "sdlc_entity_state_transition[]",
          requirementIds: "string[]",
          sourceAssetRefs: "workspace-ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_module_state_diagram_fragment"])
        }),
        example: Object.freeze({
          kind: "sdlc_module_state_diagram_fragment",
          moduleName: modulePlaceholder,
          entityId: entityPlaceholder,
          stateless: true,
          states: [],
          transitions: [],
          requirementIds: ["<requirement-id>"],
          sourceAssetRefs: ["workspace://..."]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/sunny-day-sequence-row`,
        requiredFields: Object.freeze([
          "kind",
          "sequenceRef"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_sunny_day_sequence_row",
          sequenceRef: "uri"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_sunny_day_sequence_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_sunny_day_sequence_row",
          sequenceRef: "<sequence-ref>"
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/sunny-day-sequence-step`,
        requiredFields: Object.freeze([
          "kind",
          "stepId",
          "moduleName",
          "operationId",
          "inputEntityIds",
          "outputEntityIds",
          "stateTransitionIds"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_sunny_day_sequence_step",
          stepId: "string",
          moduleName: "string",
          operationId: "string",
          inputEntityIds: "string[]",
          outputEntityIds: "string[]",
          stateTransitionIds: "string[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_sunny_day_sequence_step"])
        }),
        example: Object.freeze({
          kind: "sdlc_sunny_day_sequence_step",
          stepId: "<step>",
          moduleName: modulePlaceholder,
          operationId: operationExample.operationId,
          inputEntityIds: [],
          outputEntityIds: [entityPlaceholder],
          stateTransitionIds: []
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/aggregate-sunny-day-sequence`,
        requiredFields: Object.freeze([
          "kind",
          "sequenceVersion",
          "steps",
          "evidenceRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_aggregate_sunny_day_sequence",
          sequenceVersion: "literal:ts-design-depth-v1",
          steps: "sdlc_sunny_day_sequence_step[]",
          evidenceRefs: "workspace-ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_aggregate_sunny_day_sequence"]),
          sequenceVersion: Object.freeze(["ts-design-depth-v1"])
        }),
        example: Object.freeze({
          kind: "sdlc_aggregate_sunny_day_sequence",
          sequenceVersion: "ts-design-depth-v1",
          steps: [
            {
              kind: "sdlc_sunny_day_sequence_step",
              stepId: "<step>",
              moduleName: modulePlaceholder,
              operationId: operationExample.operationId,
              inputEntityIds: [],
              outputEntityIds: [entityPlaceholder],
              stateTransitionIds: []
            }
          ],
          evidenceRefs: ["workspace://..."]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/component-topology`,
        requiredFields: Object.freeze([
          "kind",
          "componentId",
          "moduleName",
          "relativePath",
          "publicBoundary",
          "concernRole",
          "requirementIds",
          "sourceAssetRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_component_topology_row",
          componentId: "string",
          moduleName: "string",
          relativePath: "workspace-relative-path",
          publicBoundary: "string",
          concernRole: "enum",
          requirementIds: "string[]",
          sourceAssetRefs: "workspace-ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_component_topology_row"]),
          concernRole: SDLC_COMPONENT_CONCERN_ROLES
        }),
        example: Object.freeze({
          kind: "sdlc_component_topology_row",
          componentId: "<component>",
          moduleName: modulePlaceholder,
          relativePath: "<source-file>",
          publicBoundary: "<boundary>",
          concernRole: "io_adapter",
          requirementIds: ["<requirement-id>"],
          sourceAssetRefs: ["workspace://..."]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/component-realization`,
        requiredFields: Object.freeze([
          "kind",
          "componentId",
          "moduleName",
          "relativePath",
          "publicBoundary",
          "trancheId",
          "firstProductFileToChange",
          "upstreamComponentIds",
          "requirementIds",
          "sourceAssetRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_component_realization_row",
          componentId: "string",
          moduleName: "string",
          relativePath: "workspace-relative-path",
          publicBoundary: "string",
          trancheId: "string|null",
          firstProductFileToChange: "workspace-relative-path|null",
          upstreamComponentIds: "string[]",
          requirementIds: "string[]",
          sourceAssetRefs: "workspace-ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_component_realization_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_component_realization_row",
          componentId: "<component>",
          moduleName: modulePlaceholder,
          relativePath: "<source-file>",
          publicBoundary: "<boundary>",
          trancheId: null,
          firstProductFileToChange: "<source-file>",
          upstreamComponentIds: [],
          requirementIds: ["<requirement-id>"],
          sourceAssetRefs: ["workspace://..."]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/file-target`,
        requiredFields: Object.freeze([
          "kind",
          "relativePath",
          "role"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_file_target_row",
          relativePath: "workspace-relative-path",
          role: "string"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_file_target_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_file_target_row",
          relativePath: "<source-file>",
          role: "source"
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/design-completeness-axis-verdict`,
        requiredFields: Object.freeze([
          "kind",
          "axis",
          "status",
          "reasons",
          "evidenceRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_design_completeness_axis_verdict",
          axis: "enum",
          status: "enum",
          reasons: "string[]",
          evidenceRefs: "workspace-ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_design_completeness_axis_verdict"]),
          axis: SDLC_DESIGN_COMPLETENESS_AXES,
          status: SDLC_DESIGN_COMPLETENESS_STATUSES
        }),
        example: Object.freeze({
          kind: "sdlc_design_completeness_axis_verdict",
          axis: "entity",
          status: "satisfied",
          reasons: [],
          evidenceRefs: ["workspace://..."]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/design-completeness-verdict`,
        requiredFields: Object.freeze([
          "kind",
          "verdictVersion",
          "entity",
          "attribute",
          "flow"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_design_completeness_verdict",
          verdictVersion: "literal:ts-design-depth-v1",
          entity: "sdlc_design_completeness_axis_verdict",
          attribute: "sdlc_design_completeness_axis_verdict",
          flow: "sdlc_design_completeness_axis_verdict"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_design_completeness_verdict"]),
          verdictVersion: Object.freeze(["ts-design-depth-v1"])
        }),
        example: Object.freeze({
          kind: "sdlc_design_completeness_verdict",
          verdictVersion: "ts-design-depth-v1",
          entity: {
            kind: "sdlc_design_completeness_axis_verdict",
            axis: "entity",
            status: "satisfied",
            reasons: [],
            evidenceRefs: ["workspace://..."]
          },
          attribute: {
            kind: "sdlc_design_completeness_axis_verdict",
            axis: "attribute",
            status: "satisfied",
            reasons: [],
            evidenceRefs: ["workspace://..."]
          },
          flow: {
            kind: "sdlc_design_completeness_axis_verdict",
            axis: "flow",
            status: "satisfied",
            reasons: [],
            evidenceRefs: ["workspace://..."]
          }
        })
      })
    ])
  });
}

function testDesignConstructionTemplate(
  row: SdlcTargetCarrierContractRow
): SdlcWorkerTargetCarrierConstructionTemplate {
  const testCaseRef = "<test-case-ref>";
  const obligationRef = "<source-design-obligation-ref>";
  const authorityRef = "<testcase-authority-ref>";
  const frameworkRef = "<framework-ref>";
  const shardId = "<shard-id>";
  return Object.freeze({
    kind: "sdlc_worker_target_carrier_construction_template" as const,
    templateRef: row.constructionTemplateRef,
    targetAssetType: row.targetAssetType,
    carrierKind: row.outputCarrierKind,
    nestedPayloadPath: row.nestedPayloadPath,
    carrierEnvelope: targetCarrierObjectTemplate({
      templateRef: `${row.constructionTemplateRef}/carrier-envelope`,
      requiredFields: row.requiredFieldRefs,
      fieldTypes: Object.freeze({
        kind: "literal",
        targetAssetType: "literal",
        edgeRef: "literal",
        contractRef: "literal",
        contractDigest: "sha256",
        payload: "sdlc_test_design_register"
      }),
      enumDomains: Object.freeze({
        kind: Object.freeze([row.outputCarrierKind]),
        targetAssetType: Object.freeze([row.targetAssetType]),
        edgeRef: Object.freeze([row.edgeRef]),
        contractRef: Object.freeze([row.targetCarrierContractRef])
      }),
      example: Object.freeze({
        kind: row.outputCarrierKind,
        targetAssetType: row.targetAssetType,
        edgeRef: row.edgeRef,
        contractRef: row.targetCarrierContractRef,
        contractDigest: row.targetCarrierContractDigest,
        payload: "<test_design_register>"
      })
    }),
    payloadTemplate: targetCarrierObjectTemplate({
      templateRef: `${row.constructionTemplateRef}/payload/test-design-register`,
      requiredFields: Object.freeze([
        "kind",
        "registerVersion",
        "targetAssetType",
        "designConsumptionRows",
        "uatTestcaseRows",
        "testcaseAuthorityRows",
        "testStackProfileRows",
        "testModuleRows",
        "testComponentTopologyRows",
        "testDataBindings",
        "expectedResultBindings",
        "uatIntegrationBindings",
        "testExecutionScheduleRows"
      ]),
      fieldTypes: Object.freeze({
        kind: "literal:sdlc_test_design_register",
        registerVersion: "literal:ts-test-design-v1",
        targetAssetType: "literal:test_design_surface",
        designConsumptionRows: "sdlc_design_consumption_contract[]",
        uatTestcaseRows: "sdlc_test_case_row[]",
        testcaseAuthorityRows: "sdlc_test_case_row[]",
        testStackProfileRows: "sdlc_test_stack_profile_row[]",
        testModuleRows: "sdlc_test_module_row[]",
        testComponentTopologyRows: "sdlc_test_component_topology_row[]",
        testDataBindings: "sdlc_test_data_binding[]",
        expectedResultBindings: "sdlc_expected_result_binding[]",
        uatIntegrationBindings: "sdlc_uat_integration_binding[]",
        testExecutionScheduleRows: "sdlc_test_execution_schedule_row[]"
      }),
      enumDomains: Object.freeze({
        kind: Object.freeze(["sdlc_test_design_register"]),
        registerVersion: Object.freeze(["ts-test-design-v1"]),
        targetAssetType: Object.freeze(["test_design_surface"])
      }),
      example: Object.freeze({
        kind: "sdlc_test_design_register",
        registerVersion: "ts-test-design-v1",
        targetAssetType: "test_design_surface",
        designConsumptionRows: ["<sdlc_design_consumption_contract>"],
        uatTestcaseRows: ["<sdlc_test_case_row>"],
        testcaseAuthorityRows: ["<sdlc_test_case_row>"],
        testStackProfileRows: ["<sdlc_test_stack_profile_row>"],
        testModuleRows: ["<sdlc_test_module_row>"],
        testComponentTopologyRows: ["<sdlc_test_component_topology_row>"],
        testDataBindings: ["<sdlc_test_data_binding>"],
        expectedResultBindings: ["<sdlc_expected_result_binding>"],
        uatIntegrationBindings: ["<sdlc_uat_integration_binding>"],
        testExecutionScheduleRows: ["<sdlc_test_execution_schedule_row>"]
      })
    }),
    rowTemplates: Object.freeze([
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/design-consumption`,
        requiredFields: Object.freeze([
          "kind",
          "contractRef",
          "sourceDesignObligationRefs",
          "authorityBasisRefs",
          "consumerGraphFunctionRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_design_consumption_contract",
          contractRef: "uri",
          sourceDesignObligationRefs: "ref[]",
          authorityBasisRefs: "ref[]",
          consumerGraphFunctionRefs: "graph-function-ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_design_consumption_contract"])
        }),
        example: Object.freeze({
          kind: "sdlc_design_consumption_contract",
          contractRef: "design-consumption://<tenant>/test-design",
          sourceDesignObligationRefs: [obligationRef],
          authorityBasisRefs: ["workspace://<design-asset>"],
          consumerGraphFunctionRefs: [
            "derive_component_test_surface",
            "prepare_test_execution_surface",
            "derive_test_execution_result_surface",
            "qualify_component_test_execution_surface"
          ]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/test-case`,
        requiredFields: Object.freeze([
          "kind",
          "testCaseRef",
          "caseKind",
          "executionLane",
          "sourceDesignObligationRefs",
          "testcaseAuthorityRefs",
          "expectedBehavior"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_test_case_row",
          testCaseRef: "uri",
          caseKind: "positive|negative|boundary|integration|uat|regression",
          executionLane: "unit|integration|uat",
          sourceDesignObligationRefs: "ref[]",
          testcaseAuthorityRefs: "ref[]",
          expectedBehavior: "string"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_test_case_row"]),
          caseKind: Object.freeze([
            "positive",
            "negative",
            "boundary",
            "integration",
            "uat",
            "regression"
          ]),
          executionLane: Object.freeze(["unit", "integration", "uat"])
        }),
        example: Object.freeze({
          kind: "sdlc_test_case_row",
          testCaseRef,
          caseKind: "uat",
          executionLane: "integration",
          sourceDesignObligationRefs: [obligationRef],
          testcaseAuthorityRefs: [authorityRef],
          expectedBehavior: "<observable behavior>"
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/test-stack-profile`,
        requiredFields: Object.freeze([
          "kind",
          "stackRef",
          "frameworkRef",
          "buildTool"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_test_stack_profile_row",
          stackRef: "uri",
          frameworkRef: "uri",
          buildTool: "string"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_test_stack_profile_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_test_stack_profile_row",
          stackRef: "stack://<tenant>/tests",
          frameworkRef,
          buildTool: "<declared-tool>"
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/test-module`,
        requiredFields: Object.freeze([
          "kind",
          "moduleName",
          "moduleRef",
          "testRoot"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_test_module_row",
          moduleName: "string",
          moduleRef: "uri",
          testRoot: "relative-path"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_test_module_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_test_module_row",
          moduleName: "<module-tests>",
          moduleRef: "module://<module-tests>",
          testRoot: "<tenant-test-root>"
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/test-component-topology`,
        requiredFields: Object.freeze([
          "kind",
          "testClassId",
          "relativePath",
          "testcaseIds",
          "componentIds",
          "requirementIds",
          "shardId"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_test_component_topology_row",
          testClassId: "string",
          relativePath: "relative-path",
          testcaseIds: "ref[]",
          componentIds: "ref[]",
          requirementIds: "ref[]",
          shardId: "string|null"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_test_component_topology_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_test_component_topology_row",
          testClassId: "<test-class-id>",
          relativePath: "<tenant-test-root>/<test-file>",
          testcaseIds: [testCaseRef],
          componentIds: ["<component-id>"],
          requirementIds: ["<requirement-id>"],
          shardId
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/test-data-binding`,
        requiredFields: Object.freeze([
          "kind",
          "testDataRef",
          "testCaseRef",
          "inputFixtureRefs",
          "generationPolicyRef",
          "expectedResultRef",
          "sourceDesignObligationRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_test_data_binding",
          testDataRef: "uri",
          testCaseRef: "uri",
          inputFixtureRefs: "ref[]",
          generationPolicyRef: "uri",
          expectedResultRef: "uri",
          sourceDesignObligationRefs: "ref[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_test_data_binding"])
        }),
        example: Object.freeze({
          kind: "sdlc_test_data_binding",
          testDataRef: "test-data://<tenant>/<case>",
          testCaseRef,
          inputFixtureRefs: ["fixture://<tenant>/<case>"],
          generationPolicyRef: "generation-policy://<tenant>/test-data",
          expectedResultRef: "expected-result://<tenant>/<case>",
          sourceDesignObligationRefs: [obligationRef]
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/expected-result`,
        requiredFields: Object.freeze([
          "kind",
          "expectedResultRef",
          "testCaseRef",
          "assertionRefs",
          "expectedResultSummary",
          "verificationPolicyRef"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_expected_result_binding",
          expectedResultRef: "uri",
          testCaseRef: "uri",
          assertionRefs: "ref[]",
          expectedResultSummary: "string",
          verificationPolicyRef: "uri"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_expected_result_binding"])
        }),
        example: Object.freeze({
          kind: "sdlc_expected_result_binding",
          expectedResultRef: "expected-result://<tenant>/<case>",
          testCaseRef,
          assertionRefs: ["assertion://<tenant>/<case>"],
          expectedResultSummary: "<expected result>",
          verificationPolicyRef: "verification-policy://<tenant>/<framework>"
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/uat-integration`,
        requiredFields: Object.freeze([
          "kind",
          "uatTestCaseRef",
          "integrationTestCaseRef",
          "executionLane"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_uat_integration_binding",
          uatTestCaseRef: "uri",
          integrationTestCaseRef: "uri",
          executionLane: "unit|integration|uat"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_uat_integration_binding"]),
          executionLane: Object.freeze(["unit", "integration", "uat"])
        }),
        example: Object.freeze({
          kind: "sdlc_uat_integration_binding",
          uatTestCaseRef: testCaseRef,
          integrationTestCaseRef: testCaseRef,
          executionLane: "integration"
        })
      }),
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/test-execution-schedule`,
        requiredFields: Object.freeze([
          "kind",
          "scheduleRef",
          "testCaseRefs",
          "command",
          "frameworkRef",
          "shardId"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_test_execution_schedule_row",
          scheduleRef: "uri",
          testCaseRefs: "ref[]",
          command: "string",
          frameworkRef: "uri",
          shardId: "string|null"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_test_execution_schedule_row"])
        }),
        example: Object.freeze({
          kind: "sdlc_test_execution_schedule_row",
          scheduleRef: "test-schedule://<tenant>/<framework>",
          testCaseRefs: [testCaseRef],
          command: "<declared test command>",
          frameworkRef,
          shardId
        })
      })
    ])
  });
}

function testExecutionSurfaceConstructionTemplate(
  row: SdlcTargetCarrierContractRow
): SdlcWorkerTargetCarrierConstructionTemplate {
  return Object.freeze({
    kind: "sdlc_worker_target_carrier_construction_template" as const,
    templateRef: row.constructionTemplateRef,
    targetAssetType: row.targetAssetType,
    carrierKind: row.outputCarrierKind,
    nestedPayloadPath: row.nestedPayloadPath,
    carrierEnvelope: targetCarrierObjectTemplate({
      templateRef: `${row.constructionTemplateRef}/carrier-envelope`,
      requiredFields: row.requiredFieldRefs,
      fieldTypes: Object.freeze({
        kind: "literal",
        targetAssetType: "literal",
        edgeRef: "literal",
        contractRef: "literal",
        contractDigest: "sha256",
        payload: "sdlc_test_execution_surface_register"
      }),
      enumDomains: Object.freeze({
        kind: Object.freeze([row.outputCarrierKind]),
        targetAssetType: Object.freeze([row.targetAssetType]),
        edgeRef: Object.freeze([row.edgeRef]),
        contractRef: Object.freeze([row.targetCarrierContractRef])
      }),
      example: Object.freeze({
        kind: row.outputCarrierKind,
        targetAssetType: row.targetAssetType,
        edgeRef: row.edgeRef,
        contractRef: row.targetCarrierContractRef,
        contractDigest: row.targetCarrierContractDigest,
        payload: "<test_execution_surface_register>"
      })
    }),
    payloadTemplate: targetCarrierObjectTemplate({
      templateRef: `${row.constructionTemplateRef}/payload/test-execution-surface-register`,
      requiredFields: Object.freeze([
        "kind",
        "registerVersion",
        "targetAssetType",
        "testExecutionPreparationRows",
        "evidenceRefs"
      ]),
      fieldTypes: Object.freeze({
        kind: "literal:sdlc_test_execution_surface_register",
        registerVersion: "literal:ts-test-execution-v1",
        targetAssetType: "literal:test_execution_surface",
        testExecutionPreparationRows: "sdlc_test_execution_preparation_row[]",
        evidenceRefs: "uri[]",
        summary: "string"
      }),
      enumDomains: Object.freeze({
        kind: Object.freeze(["sdlc_test_execution_surface_register"]),
        registerVersion: Object.freeze(["ts-test-execution-v1"]),
        targetAssetType: Object.freeze(["test_execution_surface"])
      }),
      example: Object.freeze({
        kind: "sdlc_test_execution_surface_register",
        registerVersion: "ts-test-execution-v1",
        targetAssetType: "test_execution_surface",
        testExecutionPreparationRows: [],
        evidenceRefs: ["workspace://build_tenants/<tenant>/test/<file>"],
        summary: "<test execution preparation summary>"
      })
    }),
    rowTemplates: Object.freeze([
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/test-execution-preparation`,
        requiredFields: Object.freeze([
          "kind",
          "scheduleRef",
          "moduleName",
          "testClassId",
          "testcaseIds",
          "command",
          "workingDirectory",
          "frameworkRef",
          "shardId",
          "sourceTestFileRefs",
          "requirementIds",
          "status",
          "evidenceRefs"
        ]),
        fieldTypes: Object.freeze({
          kind: "literal:sdlc_test_execution_preparation_row",
          scheduleRef: "uri",
          moduleName: "string",
          testClassId: "uri",
          testcaseIds: "uri[]",
          command: "string",
          workingDirectory: "workspace-relative-path",
          frameworkRef: "uri",
          shardId: "string|null",
          sourceTestFileRefs: "workspace-uri[]",
          requirementIds: "ref[]",
          status: "prepared|blocked|pending",
          evidenceRefs: "uri[]"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze(["sdlc_test_execution_preparation_row"]),
          status: Object.freeze(["prepared", "blocked", "pending"])
        }),
        example: Object.freeze({
          kind: "sdlc_test_execution_preparation_row",
          scheduleRef: "test-schedule://<tenant>/<runner>",
          moduleName: "<module>",
          testClassId: "test-class://<tenant>/<class>",
          testcaseIds: ["test-case://<tenant>/<case>"],
          command: "<declared test command>",
          workingDirectory: "build_tenants/<tenant>",
          frameworkRef: "framework://declared-test-runner",
          shardId: "<shard-id>",
          sourceTestFileRefs: ["workspace://build_tenants/<tenant>/test/<file>"],
          requirementIds: ["REQ-..."],
          status: "prepared",
          evidenceRefs: ["workspace://build_tenants/<tenant>/test/<file>"]
        })
      })
    ])
  });
}

function workspaceSpecSurfaceConstructionTemplate(
  row: SdlcTargetCarrierContractRow
): SdlcWorkerTargetCarrierConstructionTemplate {
  const payloadKindByTarget: Readonly<Record<string, string>> = Object.freeze({
    intent_surface: "sdlc_intent_surface_register",
    product_surface: "sdlc_product_surface_register",
    goal_surface: "sdlc_goal_surface_register",
    requirement_surface: "sdlc_requirement_surface_register",
    uat_testcases_surface: "sdlc_uat_testcase_register",
    testcase_authority_surface: "sdlc_testcase_authority_register"
  });
  const rowKindByTarget: Readonly<Record<string, string>> = Object.freeze({
    intent_surface: "sdlc_intent_row",
    product_surface: "sdlc_product_definition_row",
    goal_surface: "sdlc_goal_row",
    requirement_surface: "sdlc_requirement_row",
    uat_testcases_surface: "sdlc_test_case_row",
    testcase_authority_surface: "sdlc_testcase_authority_row"
  });
  const payloadKind =
    payloadKindByTarget[row.targetAssetType] ?? "sdlc_workspace_spec_surface_register";
  const rowKind =
    rowKindByTarget[row.targetAssetType] ?? "sdlc_workspace_spec_surface_row";
  return Object.freeze({
    kind: "sdlc_worker_target_carrier_construction_template" as const,
    templateRef: row.constructionTemplateRef,
    targetAssetType: row.targetAssetType,
    carrierKind: row.outputCarrierKind,
    nestedPayloadPath: row.nestedPayloadPath,
    carrierEnvelope: targetCarrierObjectTemplate({
      templateRef: `${row.constructionTemplateRef}/carrier-envelope`,
      requiredFields: row.requiredFieldRefs,
      fieldTypes: Object.freeze({
        kind: "literal",
        targetAssetType: "literal",
        edgeRef: "literal",
        contractRef: "literal",
        contractDigest: "sha256",
        payload: payloadKind
      }),
      enumDomains: Object.freeze({
        kind: Object.freeze([row.outputCarrierKind]),
        targetAssetType: Object.freeze([row.targetAssetType]),
        edgeRef: Object.freeze([row.edgeRef]),
        contractRef: Object.freeze([row.targetCarrierContractRef])
      }),
      example: Object.freeze({
        kind: row.outputCarrierKind,
        targetAssetType: row.targetAssetType,
        edgeRef: row.edgeRef,
        contractRef: row.targetCarrierContractRef,
        contractDigest: row.targetCarrierContractDigest,
        payload: {
          kind: payloadKind,
          registerVersion: "ts-workspace-spec-surface-v1",
          targetAssetType: row.targetAssetType,
          authorityRefs: ["workspace://specification/..."],
          rows: []
        }
      })
    }),
    payloadTemplate: targetCarrierObjectTemplate({
      templateRef: `${row.constructionTemplateRef}/payload`,
      requiredFields: Object.freeze([
        "kind",
        "registerVersion",
        "targetAssetType",
        "authorityRefs",
        "rows"
      ]),
      fieldTypes: Object.freeze({
        kind: `literal:${payloadKind}`,
        registerVersion: "literal:ts-workspace-spec-surface-v1",
        targetAssetType: "literal",
        authorityRefs: "uri[]",
        rows: `${rowKind}[]`,
        summary: "string"
      }),
      enumDomains: Object.freeze({
        kind: Object.freeze([payloadKind]),
        registerVersion: Object.freeze(["ts-workspace-spec-surface-v1"]),
        targetAssetType: Object.freeze([row.targetAssetType])
      }),
      example: Object.freeze({
        kind: payloadKind,
        registerVersion: "ts-workspace-spec-surface-v1",
        targetAssetType: row.targetAssetType,
        authorityRefs: ["workspace://specification/..."],
        rows: [],
        summary: "<content summary>"
      })
    }),
    rowTemplates: Object.freeze([
      targetCarrierObjectTemplate({
        templateRef: `${row.constructionTemplateRef}/row/${rowKind}`,
        requiredFields: Object.freeze([
          "kind",
          "rowRef",
          "title",
          "sourceRefs",
          "content"
        ]),
        fieldTypes: Object.freeze({
          kind: `literal:${rowKind}`,
          rowRef: "uri",
          title: "string",
          sourceRefs: "uri[]",
          content: "string",
          requirementRefs: "ref[]",
          expectedBehavior: "string",
          verificationPolicyRef: "uri"
        }),
        enumDomains: Object.freeze({
          kind: Object.freeze([rowKind])
        }),
        example: Object.freeze({
          kind: rowKind,
          rowRef: `workspace-spec-row://${row.targetAssetType}/<id>`,
          title: "<row title>",
          sourceRefs: ["workspace://specification/..."],
          content: "<row content>",
          requirementRefs: ["REQ-..."]
        })
      })
    ])
  });
}

function targetCarrierConstructionTemplateForRow(
  row: SdlcTargetCarrierContractRow
): SdlcWorkerTargetCarrierConstructionTemplate {
  if (row.targetAssetType === "implementation_design_surface") {
    return implementationDesignConstructionTemplate(row);
  }
  if (row.targetAssetType === "test_design_surface") {
    return testDesignConstructionTemplate(row);
  }
  if (row.targetAssetType === "test_execution_surface") {
    return testExecutionSurfaceConstructionTemplate(row);
  }
  if (workspaceLocalSdlcSurfaceRelativePath(row.targetAssetType) !== null) {
    return workspaceSpecSurfaceConstructionTemplate(row);
  }
  return Object.freeze({
    kind: "sdlc_worker_target_carrier_construction_template" as const,
    templateRef: row.constructionTemplateRef,
    targetAssetType: row.targetAssetType,
    carrierKind: row.outputCarrierKind,
    nestedPayloadPath: row.nestedPayloadPath,
    carrierEnvelope: targetCarrierObjectTemplate({
      templateRef: `${row.constructionTemplateRef}/carrier-envelope`,
      requiredFields: row.requiredFieldRefs,
      fieldTypes: Object.freeze({
        kind: "literal",
        targetAssetType: "literal",
        edgeRef: "literal",
        contractRef: "literal",
        contractDigest: "sha256",
        payload: "object"
      }),
      enumDomains: Object.freeze({
        kind: Object.freeze([row.outputCarrierKind]),
        targetAssetType: Object.freeze([row.targetAssetType]),
        edgeRef: Object.freeze([row.edgeRef]),
        contractRef: Object.freeze([row.targetCarrierContractRef])
      }),
      example: Object.freeze({
        kind: row.outputCarrierKind,
        targetAssetType: row.targetAssetType,
        edgeRef: row.edgeRef,
        contractRef: row.targetCarrierContractRef,
        contractDigest: row.targetCarrierContractDigest,
        payload: {}
      })
    }),
    payloadTemplate: null,
    rowTemplates: Object.freeze([])
  });
}

function targetCarrierProjectionForRow(
  row: SdlcTargetCarrierContractRow
): SdlcWorkerTargetCarrierProjection {
  return Object.freeze({
    kind: "sdlc_worker_target_carrier_projection" as const,
    targetCarrierContractRef: row.targetCarrierContractRef,
    targetCarrierContractDigest: row.targetCarrierContractDigest,
    targetCarrierTemplateRef: row.targetCarrierTemplateRef,
    constructionDepthRole: row.constructionDepthRole,
    producedStagedAuthorityRefs: row.producedStagedAuthorityRefs,
    requiredStagedAuthorityRefs: row.requiredStagedAuthorityRefs,
    outputCarrierKind: row.outputCarrierKind,
    nestedPayloadPath: row.nestedPayloadPath,
    requiredFieldRefs: row.requiredFieldRefs,
    fixedProtocolFieldRefs: row.fixedProtocolFieldRefs,
    workerFillableFieldRefs: row.workerFillableFieldRefs,
    literalDomainRefs: row.literalDomainRefs,
    schemaRef: row.schemaRef,
    handoffProjectionRef: row.handoffProjectionRef,
    constructionTemplateRef: row.constructionTemplateRef,
    constructionTemplate: targetCarrierConstructionTemplateForRow(row),
    closurePreconditionRef: row.closurePreconditionRef,
    testCaseGenerationRef: row.testCaseGenerationRef
  });
}

function targetCarrierPromptProjectionFor(
  projection: SdlcWorkerTargetCarrierProjection
): SdlcWorkerTargetCarrierPromptProjection {
  return Object.freeze({
    kind: "sdlc_worker_target_carrier_prompt_projection" as const,
    targetCarrierContractRef: projection.targetCarrierContractRef,
    targetCarrierContractDigest: projection.targetCarrierContractDigest,
    targetCarrierTemplateRef: projection.targetCarrierTemplateRef,
    constructionDepthRole: projection.constructionDepthRole,
    producedStagedAuthorityRefs: projection.producedStagedAuthorityRefs,
    requiredStagedAuthorityRefs: projection.requiredStagedAuthorityRefs,
    outputCarrierKind: projection.outputCarrierKind,
    nestedPayloadPath: projection.nestedPayloadPath,
    requiredFieldRefs: projection.requiredFieldRefs,
    fixedProtocolFieldRefs: projection.fixedProtocolFieldRefs,
    workerFillableFieldRefs: projection.workerFillableFieldRefs,
    literalDomainRefs: projection.literalDomainRefs,
    schemaRef: projection.schemaRef,
    handoffProjectionRef: projection.handoffProjectionRef,
    constructionTemplateRef: projection.constructionTemplateRef,
    closurePreconditionRef: projection.closurePreconditionRef,
    testCaseGenerationRef: projection.testCaseGenerationRef
  });
}

function productMaterializationContract(input: {
  readonly workspaceRoot: string;
  readonly archiveRoot: string;
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly conformedProject?: SdlcConformProjectProfile | undefined;
  readonly projectConstraints?: Pick<
    SdlcProjectConstraints,
    "activeTenant" | "selectedOutputRoot"
  > | undefined;
}): SdlcProductMaterializationContract {
  const activeTenant =
    input.conformedProject?.activeTenant ??
    input.projectConstraints?.activeTenant ??
    "typescript";
  const selectedOutputRoot =
    input.conformedProject?.selectedOutputRoot ??
    input.projectConstraints?.selectedOutputRoot ??
    `build_tenants/${activeTenant}`;
  const requiredRoles = materializationRolesForTarget(input.targetAssetType);
  const declaredModuleNames = Object.freeze([
    ...(input.conformedProject?.declaredModuleNames ?? [])
  ]);
  const buildExecutionContract =
    input.conformedProject?.buildExecutionContract ?? "undeclared";
  const testExecutionContract =
    input.conformedProject?.testExecutionContract ?? "undeclared";
  const tenantRoot = resolve(input.workspaceRoot, selectedOutputRoot);
  const allowedByproductGlobs =
    declaredTenantToolByproductGlobsForProductMaterialization({
      workspaceRoot: input.workspaceRoot,
      selectedOutputRoot,
      tenantRoot
    });
  return Object.freeze({
    kind: "sdlc_product_materialization_contract",
    required: requiredRoles.length > 0,
    activeTenant,
    selectedOutputRoot,
    tenantRoot,
    relativePathBasis: "tenant_root",
    declaredModuleNames,
    buildExecutionContract,
    testExecutionContract,
    manifestFile: join(input.archiveRoot, "product_materialization_manifest.json"),
    requiredRoles,
    executionShards: executionShardsFor({
      edgeName: input.edgeName,
      targetAssetType: input.targetAssetType,
      tenantRoot,
      declaredModuleNames,
      testExecutionContract,
      allowedByproductGlobs
    })
  });
}

function productMaterializationForFeatureScope(input: {
  readonly materialization: SdlcProductMaterializationContract;
  readonly featureScope: SdlcWorkerHandoffManifest["featureScope"];
}): SdlcProductMaterializationContract {
  if (
    (input.featureScope.mode !== "steel_thread" &&
      input.featureScope.mode !== "targeted_repair") ||
    input.materialization.executionShards.length === 0 ||
    input.featureScope.includedModuleNames.length === 0
  ) {
    return input.materialization;
  }
  const includedModules = new Set(input.featureScope.includedModuleNames);
  return Object.freeze({
    ...input.materialization,
    executionShards: Object.freeze(
      input.materialization.executionShards.filter((shard) =>
        includedModules.has(shard.moduleName)
      )
    )
  });
}

function tenantStackSpecRoot(manifest: SdlcWorkerHandoffManifest): string {
  return join(
    manifest.workspaceRoot,
    manifest.productMaterialization.selectedOutputRoot,
    "spec"
  );
}

function tenantStackSpecFilesForSelectedOutputRoot(input: {
  readonly workspaceRoot: string;
  readonly selectedOutputRoot: string;
}): readonly string[] {
  const specRoot = join(input.workspaceRoot, input.selectedOutputRoot, "spec");
  if (!existsSync(specRoot)) {
    return Object.freeze([]);
  }
  return Object.freeze(
    readdirSync(specRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => join(specRoot, entry.name))
      .filter((filePath) =>
        /(?:^|\/)(?:TECH_STACK|tech_stack|TESTING_TECH_STACK|testing_tech_stack|PRODUCT_TARGETS|product_targets|EXECUTION_CONTRACT|execution_contract)\.(?:json|md|markdown)$/u.test(
          filePath.split(path.sep).join("/")
        )
      )
      .sort()
  );
}

function materializationAuthorityNeedsTenantStackRepair(
  authority: Pick<SdlcProductMaterializationAuthorityReconciliation, "reasonRefs">
): boolean {
  return (
    authority.reasonRefs.includes("tenant_stack_authority_missing") ||
    authority.reasonRefs.includes("tenant_stack_authority_invalid")
  );
}

function tenantStackSpecFiles(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  return tenantStackSpecFilesForSelectedOutputRoot({
    workspaceRoot: manifest.workspaceRoot,
    selectedOutputRoot: manifest.productMaterialization.selectedOutputRoot
  });
}

function tenantStackSpecRelativePaths(input: {
  readonly workspaceRoot: string;
  readonly activeTenant: string;
}): readonly string[] {
  const specRoot = join(
    input.workspaceRoot,
    `build_tenants/${input.activeTenant}`,
    "spec"
  );
  if (!existsSync(specRoot)) {
    return Object.freeze([]);
  }
  return Object.freeze(
    readdirSync(specRoot, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => join(specRoot, entry.name))
      .filter((filePath) =>
        /(?:^|\/)(?:TECH_STACK|tech_stack|TESTING_TECH_STACK|testing_tech_stack|PRODUCT_TARGETS|product_targets|EXECUTION_CONTRACT|execution_contract)\.(?:json|md|markdown)$/u.test(
          filePath.split(path.sep).join("/")
        )
      )
      .map((filePath) => relative(input.workspaceRoot, filePath).split(path.sep).join("/"))
      .sort()
  );
}

function stringListFromUnknown(value: unknown): readonly string[] {
  if (Array.isArray(value)) {
    return Object.freeze(
      value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    );
  }
  if (typeof value !== "string") {
    return Object.freeze([]);
  }
  return Object.freeze(
    value
      .split(/[,\n]/u)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
  );
}

function objectFieldsStringList(
  record: Record<string, unknown>,
  keys: readonly string[]
): readonly string[] {
  return Object.freeze(keys.flatMap((key) => stringListFromUnknown(record[key])));
}

function environmentVariableNamesFromUnknown(value: unknown): readonly string[] {
  const record = objectRecord(value);
  if (record === null) {
    return Object.freeze([]);
  }
  return uniqueSorted(
    Object.keys(record).filter((name) => /^[A-Za-z_][A-Za-z0-9_]*$/u.test(name))
  );
}

function tenantToolEnvironmentFromUnknown(
  value: unknown
): Omit<SdlcTenantToolEnvironmentProjection, "kind" | "sourceRefs"> {
  const record = objectRecord(value);
  if (record === null) {
    return Object.freeze({
      disabledTools: Object.freeze([]),
      allowedTools: Object.freeze([]),
      workspaceLocalDirectories: Object.freeze([]),
      environmentVariableNames: Object.freeze([])
    });
  }
  const nestedKeys = [
    "executionEnvironment",
    "execution_environment",
    "toolEnvironment",
    "tool_environment",
    "testingTechStack",
    "testing_tech_stack",
    "testTechStack",
    "test_tech_stack"
  ];
  const nested = nestedKeys.map((key) =>
    tenantToolEnvironmentFromUnknown(record[key])
  );
  return Object.freeze({
    disabledTools: uniqueSorted([
      ...objectFieldsStringList(record, [
        "disabledTools",
        "disabled_tools",
        "disallowedTools",
        "disallowed_tools",
        "prohibitedTools",
        "prohibited_tools",
        "unavailableTools",
        "unavailable_tools"
      ]),
      ...nested.flatMap((entry) => entry.disabledTools)
    ]),
    allowedTools: uniqueSorted([
      ...objectFieldsStringList(record, [
        "allowedTools",
        "allowed_tools",
        "enabledTools",
        "enabled_tools"
      ]),
      ...nested.flatMap((entry) => entry.allowedTools)
    ]),
    workspaceLocalDirectories: uniqueSorted([
      ...objectFieldsStringList(record, [
        "workspaceLocalDirectories",
        "workspace_local_directories",
        "localDirectories",
        "local_directories",
        "cacheDirectories",
        "cache_directories"
      ]),
      ...nested.flatMap((entry) => entry.workspaceLocalDirectories)
    ]),
    environmentVariableNames: uniqueSorted([
      ...environmentVariableNamesFromUnknown(record["environmentVariables"]),
      ...environmentVariableNamesFromUnknown(record["environment_variables"]),
      ...environmentVariableNamesFromUnknown(record["environment"]),
      ...environmentVariableNamesFromUnknown(record["env"]),
      ...nested.flatMap((entry) => entry.environmentVariableNames)
    ])
  });
}

export function tenantToolEnvironmentProjectionFor(
  manifest: SdlcWorkerHandoffManifest
): SdlcTenantToolEnvironmentProjection {
  const sourceRefs = tenantStackSpecFiles(manifest).map((filePath) =>
    pathToFileURL(filePath).href
  );
  const projections = sourceRefs.map((ref) => {
    const source = readableFileRef(ref);
    if (source === null) {
      return tenantToolEnvironmentFromUnknown(null);
    }
    try {
      return tenantToolEnvironmentFromUnknown(JSON.parse(source.content));
    } catch {
      return tenantToolEnvironmentFromUnknown(null);
    }
  });
  return Object.freeze({
    kind: "sdlc_tenant_tool_environment_projection" as const,
    sourceRefs: Object.freeze(workerFacingRefs(manifest, sourceRefs)),
    disabledTools: uniqueSorted(projections.flatMap((entry) => entry.disabledTools)),
    allowedTools: uniqueSorted(projections.flatMap((entry) => entry.allowedTools)),
    workspaceLocalDirectories: uniqueSorted(
      projections.flatMap((entry) => entry.workspaceLocalDirectories)
    ),
    environmentVariableNames: uniqueSorted(
      projections.flatMap((entry) => entry.environmentVariableNames)
    )
  });
}

function tenantToolByproductRulesFromUnknown(value: unknown): readonly string[] {
  const record = objectRecord(value);
  if (record === null) {
    return Object.freeze([]);
  }
  const nestedKeys = [
    "executionEnvironment",
    "execution_environment",
    "toolEnvironment",
    "tool_environment",
    "testingTechStack",
    "testing_tech_stack",
    "testTechStack",
    "test_tech_stack"
  ];
  const nested = nestedKeys.flatMap((key) =>
    tenantToolByproductRulesFromUnknown(record[key])
  );
  return uniqueSorted([
    ...objectFieldsStringList(record, [
      "cleanupRules",
      "cleanup_rules",
      "byproductRules",
      "byproduct_rules",
      "workspaceLocalDirectories",
      "workspace_local_directories",
      "localDirectories",
      "local_directories",
      "cacheDirectories",
      "cache_directories",
      "createdDirectories",
      "created_directories"
    ]),
    ...nested
  ]);
}

function declaredTenantToolByproductRulesFromSpecFiles(
  specFiles: readonly string[]
): readonly string[] {
  return uniqueSorted(
    specFiles.flatMap((filePath) => {
      const source = textIfFile(filePath);
      if (source === null) {
        return [];
      }
      try {
        return tenantToolByproductRulesFromUnknown(JSON.parse(source));
      } catch {
        return [];
      }
    })
  );
}

function normalizeTenantToolByproductRuleForRoot(input: {
  readonly rule: string;
  readonly workspaceRoot: string;
  readonly selectedOutputRoot: string;
  readonly tenantRoot: string;
}): string | null {
  const expanded = input.rule
    .replaceAll("${workspaceRoot}", input.workspaceRoot)
    .replaceAll("{{workspaceRoot}}", input.workspaceRoot)
    .replaceAll("${selectedOutputRoot}", input.selectedOutputRoot)
    .replaceAll("{{selectedOutputRoot}}", input.selectedOutputRoot)
    .replaceAll("${tenantRoot}", input.tenantRoot)
    .replaceAll("{{tenantRoot}}", input.tenantRoot)
    .trim();
  if (expanded.length === 0) {
    return null;
  }
  let normalized = expanded.split(path.sep).join("/");
  const tenantRoot = resolve(input.tenantRoot);
  if (isAbsolute(expanded)) {
    const relativeToTenant = relative(tenantRoot, resolve(expanded));
    if (
      relativeToTenant === "" ||
      relativeToTenant.startsWith("..") ||
      isAbsolute(relativeToTenant)
    ) {
      return null;
    }
    normalized = relativeToTenant.split(path.sep).join("/");
  }
  const selectedOutputRoot = normalizedRelativePath(input.selectedOutputRoot).replace(/\/+$/u, "");
  normalized = normalized
    .replace(/^\.\//u, "")
    .replace(/\/\*\*\/\*$/u, "")
    .replace(/\/\*\*$/u, "")
    .replace(/\/\*$/u, "")
    .replace(/\/+$/u, "");
  if (selectedOutputRoot.length > 0) {
    if (normalized === selectedOutputRoot) {
      return null;
    }
    if (normalized.startsWith(`${selectedOutputRoot}/`)) {
      normalized = normalized.slice(selectedOutputRoot.length + 1);
    }
  }
  return normalized.length > 0 ? normalized : null;
}

function executionByproductGlobForNormalizedRule(rule: string): string {
  const normalized = rule
    .replace(/\\/gu, "/")
    .replace(/^\.\//u, "")
    .replace(/\/+$/u, "");
  return normalized.endsWith("/**") ? normalized : `${normalized}/**`;
}

function declaredTenantToolByproductGlobsForProductMaterialization(input: {
  readonly workspaceRoot: string;
  readonly selectedOutputRoot: string;
  readonly tenantRoot: string;
}): readonly string[] {
  const specFiles = tenantStackSpecFilesForSelectedOutputRoot({
    workspaceRoot: input.workspaceRoot,
    selectedOutputRoot: input.selectedOutputRoot
  });
  const declaredGlobs = declaredTenantToolByproductRulesFromSpecFiles(specFiles)
    .map((rule) =>
      normalizeTenantToolByproductRuleForRoot({
        rule,
        workspaceRoot: input.workspaceRoot,
        selectedOutputRoot: input.selectedOutputRoot,
        tenantRoot: input.tenantRoot
      })
    )
    .filter((rule): rule is string => rule !== null)
    .map(executionByproductGlobForNormalizedRule);
  return uniqueSorted(declaredGlobs);
}

function effectiveProductMaterializationRequiredRoles(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcMaterializedProductFileRole[] {
  const roles = new Set<SdlcMaterializedProductFileRole>(
    manifest.productMaterialization.requiredRoles
  );
  for (const target of reconcileSdlcProductMaterializationAuthority(manifest)
    .declaredProductTargetContracts) {
    roles.add(target.requiredRole);
  }
  return Object.freeze(
    MATERIALIZED_PRODUCT_FILE_ROLES.filter((role) => roles.has(role))
  );
}

function featureScopeNarrowsMaterialization(
  manifest: Pick<
    SdlcWorkerHandoffManifest,
    "featureScope" | "productMaterialization"
  >
): boolean {
  return (
    manifest.productMaterialization.required &&
    (manifest.featureScope.mode === "steel_thread" ||
      manifest.featureScope.mode === "targeted_repair") &&
    manifest.featureScope.includedModuleNames.length > 0
  );
}

function scopedMaterializationWriteRoots(
  manifest: SdlcWorkerHandoffManifest,
  fallbackRoots: readonly string[]
): readonly string[] {
  if (!featureScopeNarrowsMaterialization(manifest)) {
    return fallbackRoots;
  }
  const authority = reconcileSdlcProductMaterializationAuthority(manifest);
  const roots = new Set<string>([
    manifest.archiveRoot,
    dirname(manifest.outputFile)
  ]);
  for (const target of authority.declaredProductTargetContracts) {
    const absoluteTarget = resolve(manifest.workspaceRoot, target.path);
    roots.add(target.targetKind === "directory" ? absoluteTarget : absoluteTarget);
  }
  return Object.freeze([...roots].sort());
}

function materializationAuthorityRepairWriteRoots(
  manifest: SdlcWorkerHandoffManifest,
  roots: readonly string[]
): readonly string[] {
  const authority = reconcileSdlcProductMaterializationAuthority(manifest);
  if (!materializationAuthorityNeedsTenantStackRepair(authority)) {
    return roots;
  }
  return Object.freeze(
    uniqueSorted([...roots, tenantStackSpecRoot(manifest)])
  );
}

function materializationFileTargetRoots(
  manifest: SdlcWorkerHandoffManifest
): ReadonlySet<string> {
  if (!manifest.productMaterialization.required) {
    return new Set<string>();
  }
  const roots = new Set(
    reconcileSdlcProductMaterializationAuthority(manifest)
      .declaredProductTargetContracts
      .filter((target) => target.targetKind === "file")
      .map((target) => resolve(manifest.workspaceRoot, target.path))
  );
  return roots;
}

function directoryToPrepareForWriteRoot(
  writeRoot: string,
  fileTargetRoots: ReadonlySet<string>
): string {
  const resolved = resolve(writeRoot);
  if (fileTargetRoots.has(resolved)) {
    return dirname(writeRoot);
  }
  if (existsSync(resolved) && statSync(resolved).isFile()) {
    return dirname(writeRoot);
  }
  return writeRoot;
}

function shardIdPart(input: string): string {
  const normalized = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
  return normalized.length === 0 ? "unnamed" : normalized;
}

function executionShardsFor(input: {
  readonly edgeName: string;
  readonly targetAssetType: string;
  readonly tenantRoot: string;
  readonly declaredModuleNames: readonly string[];
  readonly testExecutionContract: string;
  readonly allowedByproductGlobs: readonly string[];
}): SdlcProductMaterializationContract["executionShards"] {
  if (
    input.targetAssetType !== "component_test_surface" &&
    !(
      input.edgeName === FG_DERIVE_LITE_COMPONENT_CODE_SURFACE &&
      input.targetAssetType === "component_code_surface" &&
      declaredExecutionContract(input.testExecutionContract)
    ) &&
    input.targetAssetType !== "test_execution_surface" &&
    input.targetAssetType !== "test_execution_result_surface" &&
    input.targetAssetType !== "test_run_archive_surface"
  ) {
    return Object.freeze([]);
  }
  const modules = declaredExecutionContract(input.testExecutionContract)
    ? input.declaredModuleNames.length > 0
      ? input.declaredModuleNames
      : Object.freeze(["full-suite"])
    : Object.freeze([]);
  const runtimePolicy = sdlcOperatorRuntimePolicy();
  return Object.freeze(
    modules.map((moduleName, index) =>
      Object.freeze({
        kind: "sdlc_execution_shard" as const,
        shardId: `test-shard-${String(index + 1).padStart(2, "0")}-${shardIdPart(
          moduleName
        )}`,
        lane: "test" as const,
        moduleName,
        command: input.testExecutionContract.trim(),
        workingDirectory: input.tenantRoot,
        timeoutMs: runtimePolicy.executionShardTimeoutMs,
        inactivityTimeoutMs: runtimePolicy.executionShardInactivityTimeoutMs,
        expectedReportRefs: Object.freeze([
          `artifact://odd-sdlc/test-execution/${shardIdPart(moduleName)}`
        ]),
        allowedByproductGlobs: Object.freeze([...input.allowedByproductGlobs]),
        requiredEvidenceKind: "sdlc_worker_execution_evidence" as const,
        retryPolicy: "same_shard_then_triage" as const
      })
    )
  );
}

function assertEdgeAssuranceSourceAssetPolicy(input: {
  readonly edgeName: string;
  readonly sourceAssetPolicy: "strict" | "subset_allowed";
  readonly edgeSourceAssetTypes: readonly string[];
  readonly hookSourceAssetTypes: readonly string[];
}): void {
  const edgeSources = uniqueSorted(input.edgeSourceAssetTypes);
  const hookSources = uniqueSorted(input.hookSourceAssetTypes);
  const hookSourceSet = new Set(hookSources);
  const strictMatch =
    edgeSources.length === hookSources.length &&
    edgeSources.every((sourceAssetType) => hookSourceSet.has(sourceAssetType));
  if (input.sourceAssetPolicy === "strict") {
    if (!strictMatch) {
      throw new TypeError(
        [
          "edge assurance contract source set does not match hook contract",
          input.edgeName,
          input.sourceAssetPolicy,
          edgeSources.join(","),
          hookSources.join(",")
        ].join(":")
      );
    }
    return;
  }
  const edgeSourcesCovered = edgeSources.every((sourceAssetType) =>
    hookSourceSet.has(sourceAssetType)
  );
  if (!edgeSourcesCovered) {
    throw new TypeError(
      [
        "edge assurance contract source set is not covered by hook contract",
        input.edgeName,
        input.sourceAssetPolicy,
        edgeSources.join(","),
        hookSources.join(",")
      ].join(":")
    );
  }
}

function normalizeRequirementId(requirementId: string): string {
  const parts = requirementId.toUpperCase().split("-");
  const head = parts[0] === "RF" ? "REQ" : parts[0];
  const tail = parts.slice(1).map((part) =>
    /^\d+$/.test(part) && part.length < 3 ? part.padStart(3, "0") : part
  );
  return [head, ...tail].join("-");
}

function fileRef(workspaceRoot: string, relativePath: string): string | null {
  const absolutePath = join(workspaceRoot, relativePath);
  if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
    return null;
  }
  return pathToFileURL(absolutePath).href;
}

function structuralObligationPayload(input: {
  readonly status?: "structural" | "reference_only";
  readonly sourceRefs: readonly string[];
  readonly coverageExpectation: string;
}): SdlcTraversalObligationPayload {
  return Object.freeze({
    kind: "sdlc_traversal_obligation_payload" as const,
    status: input.status ?? "structural",
    sourceRefs: Object.freeze([...input.sourceRefs]),
    sourceDigests: Object.freeze([]),
    sourceSnippets: Object.freeze([]),
    coverageExpectation: input.coverageExpectation
  });
}

function markdownFilesIn(workspaceRoot: string, relativeDir: string): readonly string[] {
  const absoluteDir = join(workspaceRoot, relativeDir);
  if (!existsSync(absoluteDir) || !statSync(absoluteDir).isDirectory()) {
    return Object.freeze([]);
  }
  const collect = (currentRelativeDir: string, currentAbsoluteDir: string): string[] =>
    readdirSync(currentAbsoluteDir).flatMap((entryName) => {
      const entryPath = join(currentAbsoluteDir, entryName);
      const entryRelativePath = `${currentRelativeDir}/${entryName}`;
      let entryStat: ReturnType<typeof statSync>;
      try {
        entryStat = statSync(entryPath);
      } catch {
        return [];
      }
      if (entryStat.isDirectory()) {
        return collect(entryRelativePath, entryPath);
      }
      if (entryStat.isFile() && entryName.endsWith(".md")) {
        return [entryRelativePath];
      }
      return [];
    });
  return Object.freeze(collect(relativeDir, absoluteDir).sort());
}

function readableFileRef(ref: string): { readonly ref: string; readonly filePath: string; readonly content: string } | null {
  if (!ref.startsWith("file://")) {
    return null;
  }
  const filePath = fileURLToPath(ref);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }
  return Object.freeze({
    ref,
    filePath,
    content: readFileSync(filePath, "utf8")
  });
}

function workspaceRootForImportedSourceRef(sourceFilePath: string): string | null {
  const normalizedPath = sourceFilePath.split(path.sep).join("/");
  for (const suffix of [
    "/specification/requirements/00-imported-sources.md",
    `/${PROJECT_BOOTSTRAP_RELATIVE_PATH}`
  ]) {
    if (normalizedPath.endsWith(suffix)) {
      return sourceFilePath.slice(0, sourceFilePath.length - suffix.length);
    }
  }
  return null;
}

function importedSourceRefsFromMarkdownRef(ref: string): readonly string[] {
  const source = readableFileRef(ref);
  if (source === null) {
    return Object.freeze([]);
  }
  const workspaceRoot = workspaceRootForImportedSourceRef(source.filePath);
  const refs: string[] = [];
  for (const line of source.content.split("\n")) {
    const trimmed = line.trim();
    const bulletMatch = /^-\s+`?([^`]+?)`?\s*$/u.exec(trimmed);
    const bulletRef = bulletMatch?.[1]?.trim();
    if (bulletRef === undefined) {
      continue;
    }
    if (bulletRef.startsWith("file://")) {
      refs.push(bulletRef);
      continue;
    }
    if (workspaceRoot !== null && bulletRef.startsWith("workspace://")) {
      const relativeRef = bulletRef
        .slice("workspace://".length)
        .trim()
        .replace(/^\/+/u, "");
      const absoluteRefPath = join(workspaceRoot, relativeRef);
      if (existsSync(absoluteRefPath) && statSync(absoluteRefPath).isFile()) {
        refs.push(pathToFileURL(absoluteRefPath).href);
      }
    }
  }
  return uniqueSorted(refs);
}

function importedSourceRefsFromLedger(ref: string): readonly string[] {
  return importedSourceRefsFromMarkdownRef(ref);
}

function sourceContainsRequirementAuthority(ref: string): boolean {
  const source = readableFileRef(ref);
  if (source === null) {
    return false;
  }
  return (
    REQUIREMENT_MARKER_TOKEN_EXPRESSION.test(source.content) ||
    [...source.content.matchAll(LOCAL_REQUIREMENT_HEADING_EXPRESSION)].length > 0
  );
}

function expandedRequirementAuthorityRefs(
  authorityRefs: readonly string[]
): readonly string[] {
  const expanded: string[] = [];
  for (const ref of authorityRefs) {
    if (!ref.startsWith("file://")) {
      continue;
    }
    const filePath = fileURLToPath(ref);
    const isIntentOrGoalSurface =
      filePath.endsWith("/specification/INTENT.md") ||
      filePath.endsWith("/specification/GOALS.md");
    const isRequirementSurface =
      filePath.includes("/specification/requirements/") ||
      filePath.endsWith("/specification/REQUIREMENTS.md") ||
      filePath.endsWith(`/${PROJECT_BOOTSTRAP_RELATIVE_PATH}`);
    const lowerFilePath = filePath.toLowerCase();
    const isTestOrProofDesignSurface =
      lowerFilePath.includes("/design/") &&
      /(?:test|proof|execution)[-_]?design|adr-003-test-design-surface/u.test(
        lowerFilePath
      );
    const isDesignOrModuleSurface =
      filePath.includes("/specification/design/") ||
      filePath.includes("/specification/modules/") ||
      filePath.includes("/build_tenants/") &&
        (filePath.includes("/design/") || filePath.includes("/modules/")) &&
        !isTestOrProofDesignSurface;
    if (
      isIntentOrGoalSurface ||
      !isRequirementSurface &&
        (isDesignOrModuleSurface || !sourceContainsRequirementAuthority(ref))
    ) {
      continue;
    }
    if (filePath.endsWith(`/${PROJECT_BOOTSTRAP_RELATIVE_PATH}`)) {
      expanded.push(...importedSourceRefsFromMarkdownRef(ref));
      continue;
    }
    if (filePath.endsWith("/specification/requirements/00-imported-sources.md")) {
      const importedRefs = importedSourceRefsFromLedger(ref);
      if (importedRefs.length > 0) {
        expanded.push(...importedRefs);
        continue;
      }
    }
    expanded.push(ref);
  }
  return uniqueSorted(expanded);
}

function lineSnippetForOffset(content: string, offset: number): string {
  const lineStart = content.lastIndexOf("\n", offset) + 1;
  const nextNewline = content.indexOf("\n", offset);
  const lineEnd = nextNewline < 0 ? content.length : nextNewline;
  return content
    .slice(lineStart, lineEnd)
    .replace(/\s+/gu, " ")
    .trim()
    .slice(0, 320);
}

function concreteRequirementBodySnippet(input: {
  readonly content: string;
  readonly offset: number;
  readonly marker: string;
}): string | null {
  const nextNewline = input.content.indexOf("\n", input.offset);
  const bodyStart = nextNewline < 0 ? input.content.length : nextNewline + 1;
  const requirementId = normalizeRequirementId(input.marker);
  for (const rawLine of input.content.slice(bodyStart).split("\n")) {
    const line = rawLine.replace(/\s+/gu, " ").trim();
    if (line.length === 0) {
      continue;
    }
    if (/^---+$/u.test(line) || /^#{1,6}\s+/u.test(line)) {
      return null;
    }
    if (
      /^\*\*(?:Priority|Type|Traces To|Design Component|Status)\*\*:/iu.test(line)
    ) {
      continue;
    }
    const descriptionMatch = /^\*\*Description\*\*:\s*(.+)$/iu.exec(line);
    if (descriptionMatch?.[1] !== undefined) {
      return `${requirementId}: ${descriptionMatch[1]}`.slice(0, 320);
    }
    if (/^\*\*Acceptance Criteria\*\*:/iu.test(line)) {
      continue;
    }
    const nextMarker = REQUIREMENT_MARKER_TOKEN_EXPRESSION.exec(line)?.[0];
    if (
      nextMarker !== undefined &&
      normalizeRequirementId(nextMarker) !== requirementId
    ) {
      return null;
    }
    if (
      nextMarker !== undefined &&
      markerOnlySnippet(line, nextMarker)
    ) {
      return null;
    }
    const bulletMatch = /^[-*]\s+(.+)$/u.exec(line);
    return `${requirementId}: ${bulletMatch?.[1] ?? line}`.slice(0, 320);
  }
  return null;
}

function requirementMarkerSnippet(input: {
  readonly content: string;
  readonly offset: number;
  readonly marker: string;
}): string {
  const snippet = lineSnippetForOffset(input.content, input.offset);
  if (
    !markerOnlySnippet(snippet, input.marker) &&
    !markerHeadingSnippet(snippet, input.marker)
  ) {
    return snippet;
  }
  return concreteRequirementBodySnippet(input) ?? snippet;
}

function localRequirementHeadingSnippet(input: {
  readonly content: string;
  readonly offset: number;
  readonly requirementId: string;
}): string {
  const heading = lineSnippetForOffset(input.content, input.offset);
  const nextNewline = input.content.indexOf("\n", input.offset);
  const bodyStart = nextNewline < 0 ? input.content.length : nextNewline + 1;
  for (const rawLine of input.content.slice(bodyStart).split("\n")) {
    const line = rawLine.replace(/\s+/gu, " ").trim();
    if (line.length === 0) {
      continue;
    }
    if (/^---+$/u.test(line) || /^#{1,6}\s+/u.test(line)) {
      break;
    }
    return `${normalizeRequirementId(input.requirementId)}: ${heading} ${line}`.slice(
      0,
      320
    );
  }
  return heading;
}

function markerOnlySnippet(snippet: string, marker: string): boolean {
  const normalized = snippet
    .replace(/^#+\s*/u, "")
    .replace(/^[-*]\s*/u, "")
    .replaceAll("`", "")
    .trim();
  return normalized === marker || normalized === normalizeRequirementId(marker);
}

function markerHeadingSnippet(snippet: string, marker: string): boolean {
  const normalized = snippet
    .replace(/^#+\s*/u, "")
    .replace(/^[-*]\s*/u, "")
    .replaceAll("`", "")
    .trim();
  const requirementId = normalizeRequirementId(marker);
  return (
    normalized.startsWith(`${marker}:`) ||
    normalized.startsWith(`${marker} -`) ||
    normalized.startsWith(`${marker} `) ||
    normalized.startsWith(`${requirementId}:`) ||
    normalized.startsWith(`${requirementId} -`) ||
    normalized.startsWith(`${requirementId} `)
  );
}

function authorityRefsFor(input: {
  readonly workspaceRoot: string;
  readonly activeTenant: string;
}): readonly string[] {
  const candidatePaths = uniqueSorted([
    ...TRAVERSAL_AUTHORITY_PATHS,
    ...markdownFilesIn(input.workspaceRoot, "specification/requirements"),
    ...markdownFilesIn(input.workspaceRoot, "specification/design"),
    ...markdownFilesIn(input.workspaceRoot, "specification/modules"),
    ...tenantStackSpecRelativePaths(input),
    ...markdownFilesIn(input.workspaceRoot, `build_tenants/${input.activeTenant}/design`),
    ...markdownFilesIn(input.workspaceRoot, `build_tenants/${input.activeTenant}/modules`)
  ]);
  const directRefs = uniqueSorted(
    candidatePaths.flatMap((relativePath) => {
      const ref = fileRef(input.workspaceRoot, relativePath);
      return ref === null ? [] : [ref];
    })
  );
  return uniqueSorted([
    ...directRefs,
    ...directRefs.flatMap((ref) => {
      const source = readableFileRef(ref);
      if (
        source === null ||
        !source.filePath.endsWith(`/${PROJECT_BOOTSTRAP_RELATIVE_PATH}`)
      ) {
        return [];
      }
      return importedSourceRefsFromMarkdownRef(ref);
    })
  ]);
}

function authorityCategoryFor(filePath: string): SdlcAuthorityIndexCategory {
  if (filePath.endsWith("/specification/INTENT.md")) {
    return "intent";
  }
  if (filePath.endsWith("/specification/PRODUCT.md")) {
    return "product";
  }
  if (filePath.endsWith("/specification/GOALS.md")) {
    return "goals";
  }
  if (filePath.includes("/specification/requirements/")) {
    return "requirements";
  }
  if (
    filePath.includes("/specification/design/") ||
    filePath.includes("/build_tenants/") && filePath.includes("/design/") ||
    filePath.includes("/build_tenants/") && filePath.includes("/spec/")
  ) {
    return "design";
  }
  if (
    filePath.includes("/specification/modules/") ||
    filePath.includes("/build_tenants/") && filePath.includes("/modules/")
  ) {
    return "modules";
  }
  if (filePath.includes("/.ai-workspace/context/")) {
    return "context";
  }
  if (filePath.includes("/.ai-workspace/runtime/")) {
    return "runtime";
  }
  return "other";
}

function titleForAuthorityFile(content: string, filePath: string): string {
  const heading = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith("#"));
  if (heading !== undefined) {
    return heading.replace(/^#+\s*/u, "").trim().slice(0, 160);
  }
  return path.basename(filePath);
}

function tenantLocalSdlcSurfaceAssetTypeForAuthorityPath(
  filePath: string
): string | null {
  const normalized = filePath.split(path.sep).join("/");
  for (const [assetType, relativePath] of Object.entries(
    TENANT_LOCAL_SDLC_SURFACE_OUTPUT_PATHS
  )) {
    if (normalized.endsWith(`/${relativePath}`)) {
      return assetType;
    }
  }
  return null;
}

function authorityIndexFor(
  authorityRefs: readonly string[]
): readonly SdlcAuthorityIndexEntry[] {
  return Object.freeze(
    authorityRefs.flatMap((ref) => {
      const source = readableFileRef(ref);
      if (source === null) {
        return [];
      }
      const category = authorityCategoryFor(source.filePath);
      const surfaceAssetType =
        tenantLocalSdlcSurfaceAssetTypeForAuthorityPath(source.filePath);
      const digest = sha256Text(source.content);
      const key = `${category}:${path.basename(source.filePath)}`;
      return [
        Object.freeze({
          kind: "sdlc_authority_index_entry" as const,
          key,
          ref,
          category,
          title: titleForAuthorityFile(source.content, source.filePath),
          digest,
          tags: Object.freeze(
            surfaceAssetType === null ? [category] : [category, surfaceAssetType]
          )
        })
      ];
    })
  );
}

function trancheKeysFor(input: {
  readonly contract: SdlcHookContract;
  readonly materialization: SdlcProductMaterializationContract;
}): readonly string[] {
  const keys: string[] = [];
  if (input.materialization.declaredModuleNames.length > 0) {
    keys.push(
      ...input.materialization.declaredModuleNames.map(
        (moduleName) => `module:${moduleName}`
      )
    );
  }
  keys.push(
    ...input.contract.sourceAssetTypes.map((assetType) => `source_asset:${assetType}`),
    `target_asset:${input.contract.targetAssetType}`
  );
  if (input.contract.targetAssetType.endsWith("_schedule_surface")) {
    keys.push("schedule:dependency_graph", "schedule:tranche_plan");
  }
  if (input.contract.targetAssetType === "code_surface") {
    keys.push("realization:tranche_execution");
  }
  if (
    input.contract.targetAssetType === "test_design_surface" ||
    targetAdmitsTestExecutionEvidence(input.contract.targetAssetType) ||
    (input.contract.edgeName === FG_MATERIALIZE_DECLARED_PRODUCT_ASSET &&
      input.contract.targetAssetType === "component_code_surface" &&
      input.materialization.required &&
      declaredExecutionContract(input.materialization.testExecutionContract))
  ) {
    keys.push("qualification:tranche_execution");
  }
  if (input.materialization.executionShards.length > 0) {
    keys.push(
      ...input.materialization.executionShards.map(
        (shard) => `execution_shard:${shard.shardId}`
      )
    );
  }
  return uniqueSorted(keys);
}

function scopeTrancheKeys(input: {
  readonly trancheKeys: readonly string[];
  readonly featureScope: SdlcWorkerHandoffManifest["featureScope"];
}): readonly string[] {
  if (input.featureScope.mode === "full_breadth") {
    return input.trancheKeys;
  }
  return Object.freeze(
    input.trancheKeys.filter((key) => {
      if (!key.startsWith("module:")) {
        return true;
      }
      return input.featureScope.includedModuleNames.includes(
        key.slice("module:".length)
      );
    })
  );
}

function retrievalHintsFor(input: {
  readonly authorityIndex: readonly SdlcAuthorityIndexEntry[];
  readonly obligations: readonly SdlcTraversalObligation[];
  readonly trancheKeys: readonly string[];
}): readonly SdlcRetrievalHint[] {
  return Object.freeze(
    input.authorityIndex.map((entry) => {
      const obligationIds = input.obligations
        .filter((obligation) => obligation.evidenceRefs.includes(entry.ref))
        .map((obligation) => obligation.obligationId);
      const trancheMatch = input.trancheKeys.some((key) => {
        const categoryMatch = key === entry.category || key.startsWith(`${entry.category}:`);
        const keySegments = key.split(":").filter((segment) => segment.length > 0);
        const assetTagMatch = entry.tags
          .filter((tag) => tag !== entry.category)
          .some((tag) => keySegments.includes(tag));
        return categoryMatch || assetTagMatch;
      });
      return Object.freeze({
        kind: "sdlc_retrieval_hint" as const,
        key: entry.key,
        ref: entry.ref,
        reason:
          obligationIds.length > 0 || trancheMatch
            ? "targeted_authority_for_current_traversal"
            : "available_authority_by_reference",
        obligationIds: Object.freeze(uniqueSorted(obligationIds))
      });
    })
  );
}

function runtimeContextRefsFor(workspaceRoot: string): readonly string[] {
  return uniqueSorted(
    TRAVERSAL_RUNTIME_CONTEXT_PATHS.flatMap((relativePath) => {
      const ref = fileRef(workspaceRoot, relativePath);
      return ref === null ? [] : [ref];
    })
  );
}

function scopedAuthorityRefsForFeatureScope(input: {
  readonly authorityRefs: readonly string[];
  readonly obligations: readonly SdlcTraversalObligation[];
  readonly featureScope: SdlcWorkerHandoffManifest["featureScope"];
}): readonly string[] {
  if (input.featureScope.mode === "full_breadth") {
    return input.authorityRefs;
  }
  const usedRefs = new Set<string>();
  for (const obligation of input.obligations) {
    for (const ref of obligation.evidenceRefs) {
      usedRefs.add(ref);
    }
    for (const ref of obligation.payload.sourceRefs) {
      usedRefs.add(ref);
    }
  }
  return Object.freeze(
    input.authorityRefs.filter(
      (ref) =>
        !ref.includes("/specification/requirements/") ||
        !ref.includes("/specification/requirements/00-imported-sources.md") ||
        usedRefs.has(ref)
    )
  );
}

function requirementObligations(input: {
  readonly workspaceRoot: string;
  readonly authorityRefs: readonly string[];
}): readonly SdlcTraversalObligation[] {
  const projectSlug = deriveSdlcConformProjectProfileFromWorkspace(
    input.workspaceRoot
  ).projectSlug;
  const byAuthorityRef = new Map<
    string,
    {
      readonly displayId: string;
      readonly refs: Set<string>;
      readonly digests: Set<string>;
      readonly snippets: Set<string>;
      readonly concreteSnippets: Set<string>;
      readonly derivationRefs: Set<string>;
    }
  >();
  const recordRequirement = (input: {
    readonly marker: string;
    readonly sourceRef: string;
    readonly sourceRelativePath: string;
    readonly sourceDigest: string;
    readonly snippet: string;
  }): void => {
    if (isPlaceholderRequirementMarker(input.marker)) {
      return;
    }
    const identity = requirementAuthorityIdentityForMarker({
      marker: input.marker,
      projectSlug,
      sourceRelativePath: input.sourceRelativePath,
      sourceUri: input.sourceRef,
      sourceDigest: input.sourceDigest
    });
    if (identity === null) {
      return;
    }
    const entry = byAuthorityRef.get(identity.requirementAuthorityRef) ?? {
      displayId: identity.requirementDisplayId,
      refs: new Set<string>(),
      digests: new Set<string>(),
      snippets: new Set<string>(),
      concreteSnippets: new Set<string>(),
      derivationRefs: new Set<string>()
    };
    entry.refs.add(input.sourceRef);
    entry.digests.add(input.sourceDigest);
    for (const ref of identity.authorityDerivationRefs) {
      entry.derivationRefs.add(ref);
    }
    if (input.snippet.length > 0) {
      entry.snippets.add(input.snippet);
      if (!markerOnlySnippet(input.snippet, input.marker)) {
        entry.concreteSnippets.add(input.snippet);
      }
    }
    byAuthorityRef.set(identity.requirementAuthorityRef, entry);
  };
  for (const ref of expandedRequirementAuthorityRefs(input.authorityRefs)) {
    const source = readableFileRef(ref);
    if (source === null) {
      continue;
    }
    const sourceRelativePath = relative(input.workspaceRoot, source.filePath)
      .split(path.sep)
      .join("/");
    const digest = sha256Text(source.content);
    for (const match of source.content.matchAll(REQUIREMENT_MARKER_EXPRESSION)) {
      const marker = match[0] ?? "";
      if (isPlaceholderRequirementMarker(marker)) {
        continue;
      }
      const snippet = requirementMarkerSnippet({
        content: source.content,
        offset: match.index ?? 0,
        marker
      });
      recordRequirement({
        marker,
        sourceRef: ref,
        sourceRelativePath,
        sourceDigest: digest,
        snippet
      });
    }
    for (const match of source.content.matchAll(LOCAL_REQUIREMENT_HEADING_EXPRESSION)) {
      const requirementId = match[1] ?? "R-000";
      const marker = localRequirementMarker({
        requirementId,
        title: match[2] ?? "requirement"
      });
      const snippet = localRequirementHeadingSnippet({
        content: source.content,
        offset: match.index ?? 0,
        requirementId
      });
      recordRequirement({
        marker,
        sourceRef: ref,
        sourceRelativePath,
        sourceDigest: digest,
        snippet
      });
    }
  }
  return Object.freeze(
    [...byAuthorityRef.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([requirementAuthorityRef, entry]) => {
        const concreteSnippets = [...entry.concreteSnippets].sort();
        const snippets = concreteSnippets.length > 0
          ? concreteSnippets
          : [...entry.snippets].sort();
        const status = concreteSnippets.length > 0 ? "concrete" : "reference_only";
        const summary = concreteSnippets.length > 0
          ? `Fulfill ${entry.displayId}: ${concreteSnippets[0]}`
          : `Fulfill live requirement ${entry.displayId}.`;
        return Object.freeze({
          kind: "sdlc_traversal_obligation" as const,
          obligationId: `requirement:${requirementAuthorityRef}`,
          obligationKind: "requirement" as const,
          summary,
          evidenceRefs: Object.freeze(
            [...new Set([...entry.refs, ...entry.derivationRefs])].sort()
          ),
          payload: Object.freeze({
            kind: "sdlc_traversal_obligation_payload" as const,
            status,
            sourceRefs: Object.freeze([...entry.refs].sort()),
            sourceDigests: Object.freeze([...entry.digests].sort()),
            sourceSnippets: Object.freeze(snippets),
            coverageExpectation:
              status === "concrete"
                ? "Worker output must cover this requirement text and cite output evidence or carry a typed gap."
                : "Requirement marker must be expanded into concrete authority before this edge can close."
          })
        });
      })
  );
}

function tenantScopeForRequirementObligation(
  obligation: SdlcTraversalObligation
): string | null {
  if (
    obligation.obligationKind !== "requirement" &&
    !obligation.obligationId.startsWith("requirement:")
  ) {
    return null;
  }
  const text = [
    obligation.obligationId,
    obligation.summary,
    ...obligation.payload.sourceSnippets
  ].join("\n");
  const match =
    /active\s+tenant\s+is\s+`?([a-z0-9][a-z0-9_-]*)`?/iu.exec(text);
  return match?.[1]?.toLowerCase() ?? null;
}

function obligationInActiveTenantScope(input: {
  readonly activeTenant: string;
  readonly obligation: SdlcTraversalObligation;
}): boolean {
  const tenantScope = tenantScopeForRequirementObligation(input.obligation);
  return tenantScope === null || tenantScope === input.activeTenant.toLowerCase();
}

function priorGapReasonCodes(
  retryContext: SdlcWorkerRetryContext
): readonly string[] {
  return uniqueSorted(
    retryContext.priorGapDossiers.flatMap((dossier) =>
      dossier.reasons.map((reason) =>
        canonicalSdlcPriorGapReasonCode(reason.reason)
      )
    )
  );
}

function priorGapDossierRefs(
  retryContext: SdlcWorkerRetryContext
): readonly string[] {
  return uniqueSorted(
    retryContext.priorGapDossiers.flatMap((dossier) => [
      dossier.currentGapDossierRef,
      ...dossier.evidenceRefs.filter(
        (ref) => ref.endsWith("/gap_dossier.json") || ref.startsWith("proof://gap")
      )
    ])
  );
}

function retryContextScopeRefs(
  retryContext: SdlcWorkerRetryContext
): readonly string[] {
  return uniqueSorted(
    [
      ...retryContext.retryAttemptRefs.flatMap((attempt) => [
        attempt.sourceProjectionRef,
        attempt.priorAuthorityRef
      ]),
      ...retryContext.priorGapDossiers.flatMap((dossier) => [
        dossier.currentGapDossierRef,
        dossier.edgeName,
        dossier.targetAssetType,
        ...dossier.reasons.flatMap((reason) => [
          reason.reason,
          reason.blockingReason.detail ?? ""
        ])
      ])
    ]
  );
}

function decodedScopeRef(input: string): string {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function refContainsDeclaredModule(input: {
  readonly ref: string;
  readonly moduleName: string;
}): boolean {
  const decoded = decodedScopeRef(input.ref);
  const moduleName = input.moduleName.trim();
  return (
    decoded === moduleName ||
    decoded.includes(`/${moduleName}`) ||
    decoded.includes(`${moduleName}/`) ||
    decoded.includes(`:${moduleName}`) ||
    decoded.includes(`${moduleName}:`) ||
    decoded.includes(`=${moduleName}`) ||
    decoded.includes(`${moduleName}?`) ||
    decoded.includes(`${moduleName}#`)
  );
}

function retryContextScopedScheduleRefs(input: {
  readonly retryContext: SdlcWorkerRetryContext;
  readonly declaredModuleNames: readonly string[];
}): readonly string[] {
  const scopeRefs = retryContextScopeRefs(input.retryContext);
  if (input.declaredModuleNames.length === 0) {
    return scopeRefs;
  }
  return uniqueSorted(
    scopeRefs.filter((ref) =>
      input.declaredModuleNames.some((moduleName) =>
        refContainsDeclaredModule({ ref, moduleName })
      )
    )
  );
}

function traversalEnvelopeForcesFullBreadth(
  envelope: SdlcWorkerHandoffManifest["traversalAttemptEnvelope"] | null
): boolean {
  return /(?:full[-_]?breadth|broad[-_]?induction|complete[-_]?breadth)/iu.test(
    envelope?.strategyDirectiveRef ?? ""
  );
}

function priorSourceAssetAuthorityRefsForSourceAsset(input: {
  readonly workspaceRoot: string;
  readonly assetType: string;
  readonly outputAuthorityProjections: readonly AdmittedOutputAuthorityProjection[];
}): readonly string[] {
  const admittedOutputAuthorityRefs =
    sourceAssetAuthorityRefsFromAbgOutputAuthorityProjections({
      assetType: input.assetType,
      projections: input.outputAuthorityProjections
    });
  const operatorRunsRoot = join(
    input.workspaceRoot,
    deriveSdlcConformProjectProfileFromWorkspace(input.workspaceRoot).runtimeLayout
      .operatorRunRoot
  );
  if (!existsSync(operatorRunsRoot) || !statSync(operatorRunsRoot).isDirectory()) {
    return admittedOutputAuthorityRefs;
  }
  const refs: string[] = [...admittedOutputAuthorityRefs];
  for (const runId of readdirSync(operatorRunsRoot)) {
    const reportPath = join(operatorRunsRoot, runId, "worker_result_report.json");
    if (!existsSync(reportPath) || !statSync(reportPath).isFile()) {
      continue;
    }
    try {
      const record = readArchivedWorkerResultReportRecord({
        filePath: reportPath,
        label: "PriorWorkerResultReport"
      });
      if (
        record["targetAssetType"] === input.assetType
      ) {
        refs.push(pathToFileURL(reportPath).href);
        const outputFile = parseNonEmptyString(
          record["outputFile"],
          "PriorWorkerResultReport.outputFile"
        );
        const outputPath = resolve(input.workspaceRoot, outputFile);
        if (existsSync(outputPath) && statSync(outputPath).isFile()) {
          refs.push(pathToFileURL(outputPath).href);
        }
      }
    } catch {
      continue;
    }
  }
  return Object.freeze(uniqueSorted(refs));
}

function outputAuthorityProjectionMatchesSourceAsset(input: {
  readonly assetType: string;
  readonly projection: AdmittedOutputAuthorityProjection;
}): boolean {
  const refs = [
    input.projection.payloadClass,
    input.projection.targetCarrierContractRef,
    input.projection.payloadRef,
    input.projection.payloadContractRef,
    input.projection.producerRef,
    input.projection.sourceEventRef,
    input.projection.authorityRef,
    input.projection.projectionRef,
    ...input.projection.evidenceRefs,
    ...input.projection.relatedPayloadRefs
  ].filter((ref): ref is string => typeof ref === "string" && ref.length > 0);
  return refs.some((ref) => ref.includes(input.assetType));
}

function promptVisibleAuthorityRef(ref: string): string {
  return ref.length <= MAX_PROMPT_VISIBLE_AUTHORITY_REF_LENGTH &&
    !/[{}]/u.test(ref)
    ? ref
    : `authority-ref-digest://sha256:${sha256Text(ref)}`;
}

export function sourceAssetAuthorityRefsFromAbgOutputAuthorityProjections(input: {
  readonly assetType: string;
  readonly projections: readonly AdmittedOutputAuthorityProjection[];
}): readonly string[] {
  return uniqueSorted(
    input.projections.flatMap((projection) => {
      if (
        projection.status !== "admitted" ||
        !outputAuthorityProjectionMatchesSourceAsset({
          assetType: input.assetType,
          projection
        })
      ) {
        return [];
      }
      return [
        projection.payloadRef,
        projection.payloadContractRef,
        projection.payloadDigest,
        projection.targetCarrierContractRef,
        projection.targetCarrierContractDigest,
        projection.producerRef,
        projection.sourceEventRef,
        projection.authorityRef,
        projection.inputDigest,
        projection.projectionRef,
        ...projection.validationRefs
      ]
        .filter((ref): ref is string => typeof ref === "string" && ref.length > 0)
        .map(promptVisibleAuthorityRef);
    })
  );
}

function readableObligationFileRefs(
  obligations: readonly SdlcTraversalObligation[]
): readonly string[] {
  return uniqueSorted(
    obligations
      .flatMap((obligation) => [
        ...obligation.evidenceRefs,
        ...obligation.payload.sourceRefs
      ])
      .filter((ref) => readableFileRef(ref) !== null)
  );
}

function obligationAuthorityRefs(
  obligations: readonly SdlcTraversalObligation[]
): readonly string[] {
  return uniqueSorted(
    obligations.flatMap((obligation) => [
      ...obligation.evidenceRefs,
      ...obligation.payload.sourceRefs
    ])
  );
}

function deriveTraversalObligationContext(input: {
  readonly workspaceRoot: string;
  readonly contract: SdlcHookContract;
  readonly edgeAssuranceContractRef: string;
  readonly edgeAssuranceContractDigest: string;
  readonly targetCarrierProjection: SdlcWorkerTargetCarrierProjection;
  readonly materialization: SdlcProductMaterializationContract;
  readonly featureScope: SdlcWorkerHandoffManifest["featureScope"];
  readonly retryContext: SdlcWorkerRetryContext;
  readonly outputAuthorityProjections: readonly AdmittedOutputAuthorityProjection[];
}): SdlcTraversalObligationContext {
  const authorityRefs = authorityRefsFor({
    workspaceRoot: input.workspaceRoot,
    activeTenant: input.materialization.activeTenant
  });
  const runtimeContextRefs = runtimeContextRefsFor(input.workspaceRoot);
  const priorEdgeRefs = uniqueSorted([
    ...input.retryContext.retryAttemptRefs.map((ref) => ref.manifestId),
    ...priorGapDossierRefs(input.retryContext)
  ]);
  const priorGapCount = priorGapReasonCodes(input.retryContext).length;
  const obligations: SdlcTraversalObligation[] = [];
  obligations.push(
    Object.freeze({
      kind: "sdlc_traversal_obligation" as const,
      obligationId: `target_asset:${input.contract.targetAssetType}`,
      obligationKind: "target_asset" as const,
      summary: `Produce target asset type ${input.contract.targetAssetType}.`,
      evidenceRefs: Object.freeze([`asset-type://${input.contract.targetAssetType}`]),
      payload: structuralObligationPayload({
        sourceRefs: Object.freeze([`asset-type://${input.contract.targetAssetType}`]),
        coverageExpectation:
          "Worker output identity must materialize or reference the declared target asset type."
      })
    }),
    ...requirementObligations({
      workspaceRoot: input.workspaceRoot,
      authorityRefs
    })
  );
  if (
    targetRequiresSourceAssetObligations({
      targetAssetType: input.contract.targetAssetType,
      materializationRequired: input.materialization.required
    })
  ) {
    obligations.push(
      ...input.contract.sourceAssetTypes.map((assetType) => {
        const sourceRefs = uniqueSorted([
          `asset-type://${assetType}`,
          ...priorSourceAssetAuthorityRefsForSourceAsset({
            workspaceRoot: input.workspaceRoot,
            assetType,
            outputAuthorityProjections: input.outputAuthorityProjections
          })
        ]);
        return Object.freeze({
          kind: "sdlc_traversal_obligation" as const,
          obligationId: `source_asset:${assetType}`,
          obligationKind: "source_asset" as const,
          summary: `Use admitted source asset type ${assetType}.`,
          evidenceRefs: Object.freeze(sourceRefs),
          payload: structuralObligationPayload({
            sourceRefs: Object.freeze(sourceRefs),
            coverageExpectation:
              "Worker output must preserve the declared source asset contribution."
          })
        });
      })
    );
  }
  if (input.materialization.required) {
    const requiredRoles = new Set(input.materialization.requiredRoles);
    const declaredModuleNames =
      requiredRoles.size === 0
        ? input.materialization.declaredModuleNames
        : input.materialization.declaredModuleNames.filter((moduleName) => {
            const moduleRole = productMaterializationRoleForModuleObligation(
              `module:${moduleName}`
            );
            return moduleRole === null || requiredRoles.has(moduleRole);
          });
    obligations.push(
      ...declaredModuleNames.map((moduleName) =>
        Object.freeze({
          kind: "sdlc_traversal_obligation" as const,
          obligationId: `module:${moduleName}`,
          obligationKind: "design_or_module" as const,
          summary: `Preserve and realize declared module ${moduleName}.`,
          evidenceRefs: Object.freeze([`module://${moduleName}`]),
          payload: structuralObligationPayload({
            sourceRefs: Object.freeze([`module://${moduleName}`]),
            coverageExpectation:
              "Worker output must include or lawfully carry forward this declared module."
          })
        })
      )
    );
  }
  const scopedObligations = Object.freeze(
    obligations.filter(
      (obligation) =>
        obligationInActiveTenantScope({
          activeTenant: input.materialization.activeTenant,
          obligation
        }) &&
        sdlcTraversalObligationInFeatureScope({
          featureScope: input.featureScope,
          obligation
        })
    )
  );
  const scopedAuthorityRefs = scopedAuthorityRefsForFeatureScope({
    authorityRefs: uniqueSorted([
      ...authorityRefs,
      ...obligationAuthorityRefs(scopedObligations),
      ...readableObligationFileRefs(scopedObligations)
    ]),
    obligations: scopedObligations,
    featureScope: input.featureScope
  });
  const requirementCount = scopedObligations.filter(
    (obligation) => obligation.obligationKind === "requirement"
  ).length;
  const authorityIndex = authorityIndexFor(scopedAuthorityRefs);
  const trancheKeys = scopeTrancheKeys({
    trancheKeys: trancheKeysFor({
      contract: input.contract,
      materialization: input.materialization
    }),
    featureScope: input.featureScope
  });
  const retrievalHints = retrievalHintsFor({
    authorityIndex,
    obligations: scopedObligations,
    trancheKeys
  });
  return Object.freeze({
    kind: "sdlc_traversal_obligation_context" as const,
    edgeAssuranceContractRef: input.edgeAssuranceContractRef,
    edgeAssuranceContractDigest: input.edgeAssuranceContractDigest,
    targetCarrierContractRef:
      input.targetCarrierProjection.targetCarrierContractRef,
    targetCarrierContractDigest:
      input.targetCarrierProjection.targetCarrierContractDigest,
    requiredSourceAssetTypes: Object.freeze([...input.contract.sourceAssetTypes]),
    targetAssetType: input.contract.targetAssetType,
    obligations: scopedObligations,
    authorityRefs: scopedAuthorityRefs,
    authorityIndex,
    trancheKeys,
    retrievalHints,
    runtimeContextRefs,
    priorEdgeRefs,
    deltaSummary: Object.freeze({
      kind: "sdlc_traversal_obligation_delta_summary" as const,
      obligationCount: scopedObligations.length,
      requirementCount,
      priorGapCount,
      authorityRefCount: scopedAuthorityRefs.length
    })
  });
}

function emptyRetryContext(): SdlcWorkerRetryContext {
  return Object.freeze({
    kind: "sdlc_worker_retry_context",
    retryAttemptRefs: Object.freeze([]),
    priorGapDossiers: Object.freeze([])
  });
}

function constructTraversalIntentPackage(input: {
  readonly ticketExecutionContract?:
    | SdlcWorkerHandoffManifest["ticketExecutionContract"]
    | undefined;
  readonly overlayRef?: string | null | undefined;
  readonly overlayBindingRef?: string | null | undefined;
  readonly graphCatalogDigestRef?: string | null | undefined;
  readonly overlayAnnotationRefs?: readonly string[] | undefined;
  readonly overlayZoomGraphFunctionRefs?: readonly string[] | undefined;
  readonly overlayZoomTargetGraphFunctionRefs?: readonly string[] | undefined;
  readonly edgeAssuranceContractRef: string;
  readonly edgeAssuranceContractDigest: string;
  readonly targetCarrierProjection: SdlcWorkerTargetCarrierProjection;
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly outputFile: string;
  readonly reportFile: string;
  readonly methodRefs: readonly string[];
  readonly resultReportSchema: readonly string[];
  readonly contract: SdlcHookContract;
  readonly materialization: SdlcProductMaterializationContract;
  readonly traversalStrategyDecision: SdlcTraversalStrategyDecision;
  readonly featureScope: SdlcWorkerHandoffManifest["featureScope"];
  readonly obligationContext: SdlcTraversalObligationContext;
  readonly retryContext: SdlcWorkerRetryContext;
}): SdlcTraversalIntentPackage {
  const base = Object.freeze({
    kind: "sdlc_traversal_intent_package" as const,
    packageVersion: "ts-intent-v1" as const,
    ticketExecutionContract: input.ticketExecutionContract ?? null,
    overlayRef: input.overlayRef ?? null,
    overlayBindingRef: input.overlayBindingRef ?? null,
    graphCatalogDigestRef: input.graphCatalogDigestRef ?? null,
    overlayAnnotationRefs: Object.freeze([
      ...(input.overlayAnnotationRefs ?? [])
    ]),
    overlayZoomGraphFunctionRefs: Object.freeze([
      ...(input.overlayZoomGraphFunctionRefs ?? [])
    ]),
    overlayZoomTargetGraphFunctionRefs: Object.freeze([
      ...(input.overlayZoomTargetGraphFunctionRefs ?? [])
    ]),
    edgeAssuranceContractRef: input.edgeAssuranceContractRef,
    edgeAssuranceContractDigest: input.edgeAssuranceContractDigest,
    targetCarrierContractRef:
      input.targetCarrierProjection.targetCarrierContractRef,
    targetCarrierContractDigest:
      input.targetCarrierProjection.targetCarrierContractDigest,
    targetCarrierProjection: input.targetCarrierProjection,
    graphFunctionName: input.graphFunctionName,
    edgeName: input.edgeName,
    vectorIndex: input.vectorIndex,
    sourceAssetTypes: Object.freeze([...input.contract.sourceAssetTypes]),
    targetAssetType: input.contract.targetAssetType,
    methodRefs: Object.freeze([...input.methodRefs]),
    authorityRefs: input.obligationContext.authorityRefs,
    runtimeContextRefs: input.obligationContext.runtimeContextRefs,
    priorEdgeRefs: input.obligationContext.priorEdgeRefs,
    retryAttemptRefs: Object.freeze(
      input.retryContext.retryAttemptRefs.map((ref) => ref.manifestId)
    ),
    priorGapDossierRefs: priorGapDossierRefs(input.retryContext),
    obligationIds: Object.freeze(
      input.obligationContext.obligations.map((obligation) => obligation.obligationId)
    ),
    obligationDeltaSummary: input.obligationContext.deltaSummary,
    traversalStrategyDecision: input.traversalStrategyDecision,
    featureScope: input.featureScope,
    productMaterialization: input.materialization,
    resultReportSchema: Object.freeze([...input.resultReportSchema]),
    evaluatorExpectations: input.contract.transformProfile,
    outputFile: input.outputFile,
    reportFile: input.reportFile
  });
  return Object.freeze({
    ...base,
    packageDigest: sha256Text(stableOperatorJson(base))
  });
}

export function assertTraversalIntentPackagePressure(
  manifest: SdlcWorkerHandoffManifest
): void {
  const pkg = manifest.traversalIntentPackage;
  const { packageDigest, ...digestBasis } = pkg;
  if (packageDigest !== sha256Text(stableOperatorJson(digestBasis))) {
    throw new TypeError("traversal intent package digest mismatch");
  }
  if (
    pkg.graphFunctionName !== manifest.graphFunctionName ||
    pkg.edgeName !== manifest.edgeName ||
    pkg.vectorIndex !== manifest.vectorIndex ||
    pkg.overlayRef !== manifest.overlayRef ||
    pkg.overlayBindingRef !== manifest.overlayBindingRef ||
    pkg.graphCatalogDigestRef !== manifest.graphCatalogDigestRef ||
    pkg.edgeAssuranceContractRef !== manifest.edgeAssuranceContractRef ||
    pkg.edgeAssuranceContractDigest !== manifest.edgeAssuranceContractDigest ||
    pkg.targetCarrierContractRef !== manifest.targetCarrierContractRef ||
    pkg.targetCarrierContractDigest !== manifest.targetCarrierContractDigest ||
    pkg.targetAssetType !== manifest.targetAssetType ||
    pkg.outputFile !== manifest.outputFile ||
    pkg.reportFile !== manifest.reportFile
  ) {
    throw new TypeError("traversal intent package identity does not match manifest");
  }
  if (
    JSON.stringify(pkg.targetCarrierProjection) !==
    JSON.stringify(manifest.targetCarrierProjection)
  ) {
    throw new TypeError("traversal intent package target carrier projection drift");
  }
  if (
    JSON.stringify(pkg.traversalStrategyDecision) !==
    JSON.stringify(manifest.traversalStrategyDecision)
  ) {
    throw new TypeError("traversal intent package strategy decision drift");
  }
  if (
    JSON.stringify(pkg.featureScope) !== JSON.stringify(manifest.featureScope)
  ) {
    throw new TypeError("traversal intent package feature scope drift");
  }
  if (
    JSON.stringify(pkg.ticketExecutionContract ?? null) !==
    JSON.stringify(manifest.ticketExecutionContract ?? null)
  ) {
    throw new TypeError("traversal intent package ticket context drift");
  }
  if (pkg.authorityRefs.length === 0) {
    throw new TypeError("traversal intent package missing source authority refs");
  }
  const concreteRequirementObligations =
    manifest.traversalObligationContext.obligations.filter(
      (obligation) =>
        obligation.obligationKind === "requirement" &&
        obligation.payload.status === "concrete"
    );
  if (
    manifest.productMaterialization.required &&
    concreteRequirementObligations.length === 0
  ) {
    throw new TypeError(
      `traversal intent package missing concrete requirement lineage: edge=${manifest.edgeName}; target=${manifest.targetAssetType}; scope=${manifest.featureScope.mode}; obligations=${manifest.traversalObligationContext.obligations.length}`
    );
  }
  if (
    manifest.productMaterialization.required &&
    !concreteRequirementObligations.every((obligation) =>
      pkg.obligationIds.includes(obligation.obligationId)
    )
  ) {
    throw new TypeError("traversal intent package missing concrete requirement obligation");
  }
  if (
    manifest.productMaterialization.required &&
    pkg.obligationIds.length === 0
  ) {
    throw new TypeError("traversal intent package missing obligation pressure");
  }
  if (
    pkg.obligationIds.length !==
    manifest.traversalObligationContext.obligations.length
  ) {
    throw new TypeError("traversal intent package obligation count drift");
  }
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (
      obligation.obligationKind === "requirement" &&
      obligation.payload.status !== "concrete"
    ) {
      throw new TypeError(
        `traversal obligation payload insufficient: ${obligation.obligationId}`
      );
    }
  }
  if (
    manifest.retryContext.priorGapDossiers.length > 0 &&
    pkg.priorGapDossierRefs.length === 0
  ) {
    throw new TypeError("traversal intent package missing prior gap refs");
  }
}

export function proportionalityProfileFromHopSelection(
  selection: SdlcTraversalHopSelection | null
): SdlcComputeProportionalityProfile {
  if (selection === null) {
    // No admitted Min(F_P) front-door reduction (the front door returns null
    // for domain_product / data-mapper-scale edges; the full decomposition is
    // produced downstream). The admitted budget is therefore the unreduced
    // broad ceiling, not a degenerate one. This is the honest projection of the
    // null/unreduced state, not an invented reduction.
    return Object.freeze({
      kind: "sdlc_compute_proportionality_profile" as const,
      hopClass: "staged",
      outcomeClass: "domain_product",
      pressureMechanism: "none",
      selectedGraphVariantRef: "graph-variant://odd-sdlc/unreduced-full",
      inputObligationCount: 0,
      outputRowCount: 0,
      profileClass: "broad",
      maxModules: null,
      maxComponents: 32
    });
  }
  const profileClass =
    selection.hopClass === "single_hop"
      ? "degenerate"
      : selection.hopClass === "dual_hop"
        ? "compact"
        : "broad";
  const maxComponents =
    profileClass === "degenerate" ? 1 : profileClass === "compact" ? 2 : 32;
  const maxModules =
    profileClass === "degenerate" ? 1 : profileClass === "compact" ? 2 : null;
  return Object.freeze({
    kind: "sdlc_compute_proportionality_profile" as const,
    hopClass: selection.hopClass,
    outcomeClass: selection.outcomeClass,
    pressureMechanism: selection.pressurePreservation.mechanism,
    selectedGraphVariantRef: selection.selectedGraphVariantRef,
    inputObligationCount: selection.complexityAssessment.inputObligationCount,
    outputRowCount: selection.complexityAssessment.outputRowCount,
    profileClass,
    maxModules,
    maxComponents
  });
}

export function deriveWorkerHandoffManifest(input: {
  readonly workspaceRoot: string;
  readonly ticketExecutionContract?:
    | SdlcWorkerHandoffManifest["ticketExecutionContract"]
    | undefined;
  readonly overlayRef?: string | null | undefined;
  readonly overlayBindingRef?: string | null | undefined;
  readonly graphCatalogDigestRef?: string | null | undefined;
  readonly overlayAnnotationRefs?: readonly string[] | undefined;
  readonly overlayZoomGraphFunctionRefs?: readonly string[] | undefined;
  readonly overlayZoomTargetGraphFunctionRefs?: readonly string[] | undefined;
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly contract: SdlcHookContract;
  readonly fpTransformRequest?: FpTransformRequest | null | undefined;
  readonly traversalAttemptEnvelope?:
    | SdlcWorkerHandoffManifest["traversalAttemptEnvelope"]
    | undefined;
  readonly conformedProject?: SdlcConformProjectProfile | undefined;
  readonly retryContext?: SdlcWorkerRetryContext | undefined;
  readonly outputAuthorityProjections?:
    | readonly AdmittedOutputAuthorityProjection[]
    | undefined;
  readonly projectConstraints?: Pick<
    SdlcProjectConstraints,
    "activeTenant" | "selectedOutputRoot"
  > | undefined;
  readonly traversalHopSelection?: SdlcTraversalHopSelection | null | undefined;
  readonly runId?: string;
}): SdlcWorkerHandoffManifest {
  const runId = input.runId ?? operatorRunId();
  const conformedProject =
    normalizeConformedProjectRuntimeLayout(input.conformedProject) ??
    deriveSdlcConformProjectProfileFromWorkspace(input.workspaceRoot);
  const archiveRoot = join(
    input.workspaceRoot,
    conformedProject.runtimeLayout.operatorRunRoot,
    runId
  );
  const outputRoot = join(
    input.workspaceRoot,
    conformedProject.runtimeLayout.transformAssetRoot,
    runId
  );
  const baseMaterialization = productMaterializationContract({
    workspaceRoot: input.workspaceRoot,
    archiveRoot,
    edgeName: input.edgeName,
    targetAssetType: input.contract.targetAssetType,
    conformedProject,
    projectConstraints: input.projectConstraints
  });
  const edgeAssuranceContract = resolveSdlcEdgeGainClosureContract(input.edgeName);
  if (edgeAssuranceContract.targetAssetType !== input.contract.targetAssetType) {
    throw new TypeError(
      [
        "edge assurance contract target does not match hook contract",
        input.edgeName,
        edgeAssuranceContract.targetAssetType,
        input.contract.targetAssetType
      ].join(":")
    );
  }
  assertEdgeAssuranceSourceAssetPolicy({
    edgeName: input.edgeName,
    sourceAssetPolicy: edgeAssuranceContract.sourceAssetPolicy,
    edgeSourceAssetTypes: edgeAssuranceContract.sourceAssetTypes,
    hookSourceAssetTypes: input.contract.sourceAssetTypes
  });
  const edgeAssuranceContractRef =
    sdlcEdgeAssuranceContractRef(edgeAssuranceContract);
  const edgeAssuranceContractDigest =
    digestSdlcEdgeGainClosureContract(edgeAssuranceContract);
  const targetCarrierProjection = targetCarrierProjectionForRow(
    targetCarrierRowForEdge(input.edgeName)
  );
  const retryContext = input.retryContext ?? emptyRetryContext();
  const outputAuthorityProjections = input.outputAuthorityProjections ?? Object.freeze([]);
  const methodRefs = Object.freeze([
    "workspace://.abiogenesis/docs/standards/SPEC_METHOD.md",
    "workspace://.abiogenesis/docs/standards/TICKET_METHOD.md",
    "workspace://.abiogenesis/docs/standards/DESIGN_MODULE_METHOD.md",
    "workspace://.abiogenesis/docs/standards/ODD_METHOD.md"
  ]);
  const resultReportSchema = REPORT_FIELDS;
  const reportFile = join(archiveRoot, "worker_result_report.json");
  const subworkstreamManifestFile = join(
    archiveRoot,
    SDLC_COMPUTE_SUBWORKSTREAM_MANIFEST_FILE
  );
  const fpTransformRequestFile = join(archiveRoot, "fp_transform_request.json");
  const fpTransformResultFile = join(archiveRoot, "fp_transform_result.json");
  const fpEvaluateResultFile = join(archiveRoot, "fp_evaluate_result.json");
  const traversalAttemptEnvelope = input.traversalAttemptEnvelope ?? null;
  const retrySelectedScheduleItemRefs = retryContextScopedScheduleRefs({
    retryContext,
    declaredModuleNames: baseMaterialization.declaredModuleNames
  });
  const selectedScheduleItemRefs =
    retrySelectedScheduleItemRefs.length > 0 &&
    !traversalEnvelopeForcesFullBreadth(traversalAttemptEnvelope)
      ? retrySelectedScheduleItemRefs
      : traversalAttemptEnvelope?.selectedScheduleItemRefs ??
        defaultSdlcTraversalScopeRefsForName(input.edgeName);
  const traversalStrategyDecision = deriveSdlcTraversalStrategyDecision({
    edgeName: input.edgeName,
    targetAssetType: input.contract.targetAssetType,
    strategyDirectiveRef: traversalAttemptEnvelope?.strategyDirectiveRef ?? null,
    selectedScheduleItemRefs,
    requiredProgressArtifactRefs:
      traversalAttemptEnvelope?.requiredProgressArtifactRefs ?? Object.freeze([]),
    traversalHopSelection: input.traversalHopSelection ?? null,
    retryContext
  });
  const featureScope = deriveSdlcFeatureScope({
    targetAssetType: input.contract.targetAssetType,
    selectedStrategy: traversalStrategyDecision.selectedStrategy,
    strategyDirectiveRef: traversalAttemptEnvelope?.strategyDirectiveRef ?? null,
    selectedScheduleItemRefs,
    requiredProgressArtifactRefs:
      traversalAttemptEnvelope?.requiredProgressArtifactRefs ?? Object.freeze([]),
    declaredModuleNames: baseMaterialization.declaredModuleNames,
    materializedEntityIds: Object.freeze([]),
    materializedOperationIds: Object.freeze([])
  });
  const materialization = productMaterializationForFeatureScope({
    materialization: baseMaterialization,
    featureScope
  });
  const outputFile = deriveOutputFileForTarget({
    defaultOutputRoot: outputRoot,
    workspaceRoot: input.workspaceRoot,
    targetAssetType: input.contract.targetAssetType,
    materialization
  });
  const outputFileIsTenantLocal = pathIsInside(
    resolve(outputFile),
    resolve(materialization.tenantRoot)
  );
  const outputFileIsWorkspaceLocal =
    workspaceLocalSdlcSurfaceRelativePath(input.contract.targetAssetType) !== null;
  const baseAllowedWriteRoots = (() => {
    if (
      productMaterializationHasExecutionRepairScope({
        edgeName: input.edgeName,
        targetAssetType: input.contract.targetAssetType,
        productMaterialization: materialization
      })
    ) {
      return Object.freeze([outputRoot, archiveRoot, materialization.tenantRoot]);
    }
    if (edgeOutputPolicyProjectsOutput(input.contract.targetAssetType)) {
      return Object.freeze([outputRoot, archiveRoot]);
    }
    if (materialization.required || outputFileIsTenantLocal) {
      return Object.freeze([outputRoot, archiveRoot, materialization.tenantRoot]);
    }
    if (outputFileIsWorkspaceLocal) {
      return Object.freeze([outputRoot, archiveRoot, dirname(outputFile)]);
    }
    if (input.graphFunctionName === FG_CONFORM_PROJECT_AUTHORITY) {
      return Object.freeze([
        outputRoot,
        archiveRoot,
        join(input.workspaceRoot, ".ai-workspace", "context"),
        join(input.workspaceRoot, "specification")
      ]);
    }
    return Object.freeze([outputRoot, archiveRoot]);
  })();
  const traversalObligationContext = deriveTraversalObligationContext({
    workspaceRoot: input.workspaceRoot,
    contract: input.contract,
    edgeAssuranceContractRef,
    edgeAssuranceContractDigest,
    targetCarrierProjection,
    materialization,
    featureScope,
    retryContext,
    outputAuthorityProjections
  });
  const traversalIntentPackage = constructTraversalIntentPackage({
    ticketExecutionContract: input.ticketExecutionContract ?? null,
    overlayRef: input.overlayRef ?? null,
    overlayBindingRef: input.overlayBindingRef ?? null,
    graphCatalogDigestRef: input.graphCatalogDigestRef ?? null,
    overlayAnnotationRefs: Object.freeze([
      ...(input.overlayAnnotationRefs ?? [])
    ]),
    overlayZoomGraphFunctionRefs: Object.freeze([
      ...(input.overlayZoomGraphFunctionRefs ?? [])
    ]),
    overlayZoomTargetGraphFunctionRefs: Object.freeze([
      ...(input.overlayZoomTargetGraphFunctionRefs ?? [])
    ]),
    edgeAssuranceContractRef,
    edgeAssuranceContractDigest,
    targetCarrierProjection,
    graphFunctionName: input.graphFunctionName,
    edgeName: input.edgeName,
    vectorIndex: input.vectorIndex,
    outputFile,
    reportFile,
    methodRefs,
    resultReportSchema,
    contract: input.contract,
    materialization,
    traversalStrategyDecision,
    featureScope,
    obligationContext: traversalObligationContext,
    retryContext
  });
  const manifest = Object.freeze({
    kind: "sdlc_worker_handoff_manifest",
    contractVersion: "ts-operator-v1",
    ticketExecutionContract: input.ticketExecutionContract ?? null,
    overlayRef: input.overlayRef ?? null,
    overlayBindingRef: input.overlayBindingRef ?? null,
    graphCatalogDigestRef: input.graphCatalogDigestRef ?? null,
    overlayAnnotationRefs: input.overlayAnnotationRefs ?? Object.freeze([]),
    overlayZoomGraphFunctionRefs:
      input.overlayZoomGraphFunctionRefs ?? Object.freeze([]),
    overlayZoomTargetGraphFunctionRefs:
      input.overlayZoomTargetGraphFunctionRefs ?? Object.freeze([]),
    edgeAssuranceContractRef,
    edgeAssuranceContractDigest,
    targetCarrierContractRef:
      targetCarrierProjection.targetCarrierContractRef,
    targetCarrierContractDigest:
      targetCarrierProjection.targetCarrierContractDigest,
    targetCarrierProjection,
    proportionalityProfile: proportionalityProfileFromHopSelection(
      input.traversalHopSelection ?? null
    ),
    workspaceRoot: input.workspaceRoot,
    archiveRoot,
    graphFunctionName: input.graphFunctionName,
    edgeName: input.edgeName,
    vectorIndex: input.vectorIndex,
    inputAssetTypes: Object.freeze([...input.contract.sourceAssetTypes]),
    targetAssetType: input.contract.targetAssetType,
    outputFile,
    reportFile,
    subworkstreamManifestFile,
    fpTransformRequest: input.fpTransformRequest ?? null,
    fpTransformRequestFile,
    fpTransformResultFile,
    fpEvaluateResultFile,
    allowedWriteRoots: baseAllowedWriteRoots,
    conformedProject,
    productMaterialization: materialization,
    traversalStrategyDecision,
    featureScope,
    traversalObligationContext,
    traversalIntentPackage,
    traversalAttemptEnvelope,
    retryContext,
    methodRefs,
    resultReportSchema
  });
  return Object.freeze({
    ...manifest,
    allowedWriteRoots: materializationAuthorityRepairWriteRoots(
      manifest,
      scopedMaterializationWriteRoots(
        manifest,
        baseAllowedWriteRoots
      )
    )
  });
}

function normalizeConformedProjectRuntimeLayout(
  project: SdlcConformProjectProfile | undefined
): SdlcConformProjectProfile | undefined {
  if (project === undefined) {
    return undefined;
  }
  if ("runtimeLayout" in project && project.runtimeLayout !== undefined) {
    return project;
  }
  return Object.freeze({
    ...project,
    runtimeLayout: standardSdlcRuntimeLayout()
  });
}

function listForPrompt(values: readonly string[]): string {
  return values.length === 0 ? "(none declared)" : values.join(", ");
}

function textIfFile(filePath: string): string | null {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }
  return readFileSync(filePath, "utf8");
}

function compactObligation(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  obligation: SdlcTraversalObligation
): SdlcWorkerInvocationObligation {
  return Object.freeze({
    kind: "sdlc_worker_invocation_obligation" as const,
    obligationId: obligation.obligationId,
    obligationKind: obligation.obligationKind,
    summary: compactPromptText(obligation.summary, 180),
    evidenceRefs: workerFacingRefs(manifest, obligation.evidenceRefs.slice(0, 1)),
    sourceRefs: workerFacingRefs(manifest, obligation.payload.sourceRefs.slice(0, 1)),
    sourceSnippetCount: obligation.payload.sourceSnippets.length,
    coverageExpectation: compactPromptText(
      obligation.payload.coverageExpectation,
      120
    )
  });
}

function compactPromptText(input: string, maxLength: number): string {
  const normalized = input.replace(/\s+/gu, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function inlineObligationsForPrompt(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcTraversalObligation[] {
  const structural = edgeLocalStructuralObligationsForPrompt(manifest);
  const requirementSlice = canonicalRequirementTraceObligationsForPrompt(manifest).slice(
    0,
    12
  );
  return Object.freeze([...structural, ...requirementSlice]);
}

function edgeLocalStructuralObligationsForPrompt(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcTraversalObligation[] {
  const requiredRoles = new Set(effectiveProductMaterializationRequiredRoles(manifest));
  return Object.freeze(
    manifest.traversalObligationContext.obligations.filter((obligation) => {
      if (obligation.obligationKind === "requirement") {
        return false;
      }
      if (!manifest.productMaterialization.required || requiredRoles.size === 0) {
        return true;
      }
      const moduleRole = productMaterializationRoleForModuleObligation(
        obligation.obligationId
      );
      return moduleRole === null || requiredRoles.has(moduleRole);
    })
  );
}

function productMaterializationRoleForModuleObligation(
  obligationId: string
): "source" | "test" | null {
  if (!obligationId.startsWith("module:")) {
    return null;
  }
  const moduleName = obligationId.slice("module:".length).toLowerCase();
  if (moduleName === "src" || moduleName === "source" || moduleName === "sources") {
    return "source";
  }
  if (moduleName === "test" || moduleName === "tests" || moduleName === "spec" || moduleName === "specs") {
    return "test";
  }
  return null;
}

function requirementTraceObligationIdsForPrompt(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const ids = new Set<string>();
  const latestDossier =
    manifest.retryContext.priorGapDossiers[manifest.retryContext.priorGapDossiers.length - 1];
  if (latestDossier !== undefined) {
    for (const id of currentEvaluatedGapRequirementIds(manifest, latestDossier)) {
      ids.add(id);
    }
  }
  for (const obligation of canonicalRequirementTraceObligationsForPrompt(manifest)) {
    ids.add(obligation.obligationId);
  }
  return Object.freeze([...ids].slice(0, MAX_INVOCATION_PACKAGE_REQUIREMENT_TRACE_IDS));
}

function compactConstructionBriefObligation(
  obligation: SdlcWorkerInvocationObligation
): SdlcWorkerInvocationObligation {
  return Object.freeze({
    ...obligation,
    summary: compactPromptText(obligation.summary, 120),
    evidenceRefs: Object.freeze([]),
    sourceRefs: Object.freeze([]),
    coverageExpectation: compactPromptText(obligation.coverageExpectation, 80)
  });
}

function omittedRequirementTraceObligationCount(
  manifest: SdlcWorkerHandoffManifest
): number {
  return Math.max(
    0,
    canonicalRequirementTraceObligationsForPrompt(manifest).length -
      MAX_INVOCATION_PACKAGE_REQUIREMENT_TRACE_IDS
  );
}

function compactRetrievalHints(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  hints: readonly SdlcRetrievalHint[]
): readonly SdlcRetrievalHint[] {
  const rankedHints = hints
    .map((hint, index) => ({ hint, index }))
    .sort((left, right) => {
      const leftTargeted =
        left.hint.reason === "targeted_authority_for_current_traversal" ? 1 : 0;
      const rightTargeted =
        right.hint.reason === "targeted_authority_for_current_traversal" ? 1 : 0;
      return rightTargeted - leftTargeted || left.index - right.index;
    })
    .map((entry) => entry.hint);
  return Object.freeze(
    rankedHints.slice(0, 12).map((hint) =>
      Object.freeze({
        kind: "sdlc_retrieval_hint" as const,
        key: hint.key,
        ref: workerFacingRef(manifest, hint.ref),
        reason: hint.reason,
        obligationIds: hint.obligationIds.slice(0, 12)
      })
    )
  );
}

function retryRepairScopeForReason(
  reason: string,
  reasonClass: SdlcPostflightGapReason["reasonClass"]
): SdlcWorkerRetryRepairScope {
  if (
    reason.includes("_register_invalid:") ||
    reason.includes("_register_missing") ||
    reason.startsWith("test_execution_evidence_invalid") ||
    reason.startsWith("test_execution_evidence_missing")
  ) {
    return "schema_local";
  }
  if (
    reasonClass === "assurance" ||
    reasonClass === "topology" ||
    reasonClass === "authority_to_code" ||
    reasonClass === "code_to_test"
  ) {
    return "semantic_local";
  }
  return "broad_regeneration";
}

function repairReentryPlansForContext(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcComponentRepairReentryPlan[] {
  const plans = new Map<string, SdlcComponentRepairReentryPlan>();
  for (const dossier of manifest.retryContext.priorGapDossiers) {
    for (const plan of componentRepairReentryPlansForGapDossier({
      manifest,
      dossier
    })) {
      plans.set(plan.planId, plan);
    }
  }
  return Object.freeze([...plans.values()]);
}

const RETRY_RESIDUAL_PRESSURE_REASON_SAMPLE_LIMIT = 240;

function retryGapReasonDiagnosticText(reason: SdlcPostflightGapReason): string {
  return reason.blockingReason.detail ?? reason.reason;
}

function isCurrentEdgeDownstreamTestPressure(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly text: string;
}): boolean {
  const text = decodedScopeRef(input.text).toLowerCase();
  if (input.manifest.targetAssetType === "component_code_surface") {
    return (
      text.includes("test_overlap_missing") &&
      (text.includes("component_test_surface") ||
        text.includes("test-execution") ||
        text.includes("test execution") ||
        text.includes("npm test") ||
        text.includes("generated test"))
    );
  }
  if (
    input.manifest.targetAssetType === "component_test_surface" ||
    input.manifest.targetAssetType === "uat_test_source_surface"
  ) {
    return (
      text.includes("execution_environment") &&
      (text.includes("execution evidence") ||
        text.includes("execution_result_surface") ||
        text.includes("runtime_execution_surface") ||
        text.includes("test-execution") ||
        text.includes("test execution") ||
        text.includes("npm test"))
    );
  }
  return false;
}

function downstreamStagePressurePromptBoundaryLine(
  manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">
): string {
  if (manifest.targetAssetType === "component_code_surface") {
    return "- Continue with this edge's declared product targets only. Do not materialize downstream test or execution artifacts on component_code_surface.";
  }
  if (
    manifest.targetAssetType === "component_test_surface" ||
    manifest.targetAssetType === "uat_test_source_surface"
  ) {
    return `- Continue with this edge's declared product targets only. Do not materialize downstream execution-result or runtime-execution artifacts on ${manifest.targetAssetType}.`;
  }
  return "- Continue with this edge's declared product targets only. Do not materialize downstream-stage artifacts on this edge.";
}

function isComponentCodeDownstreamTestPressure(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly text: string;
}): boolean {
  return (
    input.manifest.targetAssetType === "component_code_surface" &&
    isCurrentEdgeDownstreamTestPressure(input)
  );
}

function isComponentCodeDownstreamTestGapReason(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly reason: SdlcPostflightGapReason;
}): boolean {
  return (
    input.manifest.targetAssetType === "component_code_surface" &&
    isComponentCodeDownstreamTestPressure({
      manifest: input.manifest,
      text: [
        input.reason.reason,
        input.reason.blockingReason.message,
        input.reason.blockingReason.detail ?? ""
      ].join(" ")
    })
  );
}

function isComponentTestDownstreamExecutionPressure(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly text: string;
}): boolean {
  return (
    (input.manifest.targetAssetType === "component_test_surface" ||
      input.manifest.targetAssetType === "uat_test_source_surface") &&
    isCurrentEdgeDownstreamTestPressure(input)
  );
}

function isComponentTestDownstreamExecutionGapReason(input: {
  readonly manifest: Pick<SdlcWorkerHandoffManifest, "targetAssetType">;
  readonly reason: SdlcPostflightGapReason;
}): boolean {
  return (
    (input.manifest.targetAssetType === "component_test_surface" ||
      input.manifest.targetAssetType === "uat_test_source_surface") &&
    isComponentTestDownstreamExecutionPressure({
      manifest: input.manifest,
      text: [
        input.reason.reason,
        input.reason.blockingReason.message,
        input.reason.blockingReason.detail ?? ""
      ].join(" ")
    })
  );
}

function shouldConsolidateRetryGapReason(reason: SdlcPostflightGapReason): boolean {
  return (
    reason.reasonClass === "assurance" &&
    reason.blockingReason.code === "edge_closure_residual_pressure" &&
    reason.blockingReason.lawfulReentryPoint === "same_edge_retry"
  );
}

function consolidatedResidualPressureReason(
  dossier: SdlcPostflightGapDossier,
  reasons: readonly SdlcPostflightGapReason[]
): SdlcPostflightGapReason {
  const samples = uniqueSorted(reasons.map(retryGapReasonDiagnosticText)).slice(
    0,
    RETRY_RESIDUAL_PRESSURE_REASON_SAMPLE_LIMIT
  );
  const omittedCount = Math.max(0, reasons.length - samples.length);
  const detail = [
    `requiredResidualPressureRefCount=${reasons.length}`,
    ...(samples.length === 0
      ? []
      : [`sampleRequiredPressureRefs=${samples.join(" | ")}`]),
    ...(omittedCount === 0
      ? []
      : [`omittedRequiredPressureRefCount=${omittedCount}`])
  ].join("; ");
  const evidenceRefs = uniqueSorted([
    dossier.currentGapDossierRef,
    ...reasons
      .flatMap((reason) => reason.blockingReason.evidenceRefs)
      .slice(0, RETRY_RESIDUAL_PRESSURE_REASON_SAMPLE_LIMIT)
  ]);
  return Object.freeze({
    kind: "sdlc_postflight_gap_reason" as const,
    reason: `edge_closure_residual_pressure:${dossier.currentGapDossierRef}`,
    reasonClass: "assurance" as const,
    blockingReason: makeSdlcBlockingReason({
      code: "edge_closure_residual_pressure",
      reasonClass: "assurance",
      lawfulReentryPoint: "same_edge_retry",
      message: "Edge closure residual pressure requires same-edge repair.",
      detail,
      evidenceRefs
    })
  });
}

function retryPromptGapReasonsForDossier(
  manifest: SdlcWorkerHandoffManifest,
  dossier: SdlcPostflightGapDossier
): readonly SdlcPostflightGapReason[] {
  if (dossier.retryEligible !== true) {
    return Object.freeze([]);
  }
  const residualPressureReasons: SdlcPostflightGapReason[] = [];
  const passthroughReasons: SdlcPostflightGapReason[] = [];
  for (const reason of dossier.reasons) {
    if (
      isComponentCodeDownstreamTestGapReason({
        manifest,
        reason
      }) ||
      isComponentTestDownstreamExecutionGapReason({
        manifest,
        reason
      })
    ) {
      continue;
    }
    if (shouldConsolidateRetryGapReason(reason)) {
      residualPressureReasons.push(reason);
    } else {
      passthroughReasons.push(reason);
    }
  }
  if (residualPressureReasons.length <= 1) {
    return Object.freeze([
      ...residualPressureReasons,
      ...passthroughReasons
    ]);
  }
  return Object.freeze([
    consolidatedResidualPressureReason(dossier, residualPressureReasons),
    ...passthroughReasons
  ]);
}

function retryRepairInstructionsForContext(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcWorkerRetryRepairInstruction[] {
  const instructions: SdlcWorkerRetryRepairInstruction[] = [];
  for (const dossier of manifest.retryContext.priorGapDossiers) {
    for (const reason of retryPromptGapReasonsForDossier(manifest, dossier)) {
      const repairReentryPlan = componentRepairReentryPlanForReason({
        manifest,
        dossier,
        reason
      });
      const acceptedCarrier = acceptedCarrierSchemaForReason({
        reason: reason.reason,
        targetAssetType: repairReentryPlan?.targetAssetType ?? dossier.targetAssetType
      });
      const repairScope = retryRepairScopeForReason(
        reason.reason,
        reason.reasonClass
      );
      const evidenceRefs = retryRepairInstructionEvidenceRefs({
        reason
      });
      instructions.push(
        Object.freeze({
          kind: "sdlc_worker_retry_repair_instruction" as const,
          repairScope,
          gapDossierRef: dossier.currentGapDossierRef,
          reason: reason.reason,
          reasonClass: reason.reasonClass,
          blockingReasonCode: reason.blockingReason.code,
          blockingReasonDetail: reason.blockingReason.detail ?? "",
          rejectedArtifactRefs: evidenceRefs,
          acceptedCarrierSchemaRef: acceptedCarrier?.schemaRef ?? null,
          acceptedCarrierFieldSet: acceptedCarrier?.fieldSet ?? Object.freeze([]),
          repairReentryPlanId: repairReentryPlan?.planId ?? null,
          nonClosureRules:
            repairReentryPlan !== null
              ? Object.freeze([
                  `Re-enter ${repairReentryPlan.targetEdgeName} for target ${repairReentryPlan.targetAssetType}.`,
                  `Repair only the scheduled ${repairReentryPlan.repairTarget} row ${repairReentryPlan.scheduleId}.`,
                  "Read diagnosticEvidenceRefs and copy the exact diagnostic lines into the execution plan before editing.",
                  "Do not broadly regenerate tests, source, schedules, or release surfaces.",
                  "Do not bypass postflight; the framework will re-admit and re-evaluate the carrier."
                ])
              : repairScope === "schema_local" || acceptedCarrier !== null
              ? Object.freeze([
                  "Repair the same rejected edge artifact.",
                  "Add, remove, rename, or map rejected fields into the accepted carrier field set.",
                  "Do not regenerate unrelated surfaces or change authority scope unless the gap dossier widens the repair.",
                  "Do not bypass postflight; the framework will re-admit and re-evaluate the carrier."
                ])
              : Object.freeze([
                  "Use the gap dossier as bounded repair pressure.",
                  "Do not treat process success or worker prose as semantic closure.",
                  "Do not bypass postflight; the framework will re-evaluate the result."
                ])
        })
      );
    }
  }
  return Object.freeze(instructions);
}

function retryRepairInstructionEvidenceRefs(input: {
  readonly reason: SdlcPostflightGapReason;
}): readonly string[] {
  return uniqueSorted(input.reason.blockingReason.evidenceRefs);
}

function transformAxiomsForWorker(): readonly string[] {
  return Object.freeze([
    "F_P.transform only: produce bounded candidate transform evidence.",
    "Do not write ledgers, runtime events, closure decisions, evaluator projections, or framework result carriers.",
    "Do not run odd_sdlc, abiogenesis, genesis, start, gaps, analyze-run, install, traversal, or resume commands; the framework controls traversal after this worker exits.",
    "Do not spawn an odd_sdlc/ABG worker, start another traversal, or leave child processes running; parent-agent subworkstreams remain subordinate to this worker.",
    "worker_construction_brief.json is the single prompt-source carrier. Archive package files are replay/audit projections for evaluator and analyzer surfaces.",
    "Do not inspect odd_sdlc framework source code or installed runtime source to infer carrier schemas; evaluator-owned carrier contracts stay in framework archives unless this prompt explicitly asks for a structured register carrier.",
    "Do not render target-carrier protocol fields such as kind, contractRef, contractDigest, payload path, construction template refs, targetCarrierProjection, or selected-target-carrier metadata in Markdown product/design surfaces unless an outcome directive explicitly asks for a structured carrier block.",
    "Read boundary: use only workspace-relative paths; do not read/cite/copy sibling sandboxes, historical test_runs, home memory, /tmp, or outside-workspace absolute paths.",
    "Temporary execution logs are workspace evidence: do not create, read, or write outside-workspace temporary files such as /tmp; write transient logs only under allowed write roots.",
    "Allowed write roots are workspace-root-relative unless already absolute; if a command changes cwd, resolve allowed write roots to workspace-root absolute paths before writing evidence logs.",
    "Do not use PTY transcripts, runtime logs, or worker archives as product authority unless a package ref names them.",
    "Start the output artifact with ## Execution Plan naming read authority, bounded steps, and first materialization target.",
    "Large artifact rule: never emit one monolithic tool payload for a generated register or ADR. Keep each write/edit payload bounded; use compact rows and stable references to source authority instead of duplicating entire upstream surfaces.",
    "When requirementTraceObligationIds is non-empty, preserve exact ids as lineage/evidence refs only; do not turn them into worker_result_report.obligationAssessments unless the same id is also present in inlineObligationIds. Emit every exact id only when the target artifact is a traceability/register surface or an outcome directive explicitly requires exact id rows. Use traversal_intent_package as audit context, not as extra product-file tag pressure."
  ]);
}

export function constructWorkerInvocationPackage(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly manifestPath?: string | undefined;
  readonly traversalIntentPath?: string | undefined;
}): SdlcWorkerInvocationPackage {
  const manifestPath =
    input.manifestPath ?? join(input.manifest.archiveRoot, "handoff_manifest.json");
  const traversalIntentPath =
    input.traversalIntentPath ??
    join(input.manifest.archiveRoot, "traversal_intent_package.json");
  const inlineObligations = inlineObligationsForPrompt(input.manifest).map(
    (obligation) => compactObligation(input.manifest, obligation)
  );
  const priorGapReasons = priorGapReasonCodes(input.manifest.retryContext);
  const repairReentryPlans = repairReentryPlansForContext(input.manifest);
  const retryRepairInstructions = retryRepairInstructionsForContext(input.manifest);
  const productMaterializationAuthority =
    reconcileSdlcProductMaterializationAuthority(input.manifest);
  assertSdlcProductMaterializationLaunchable({
    manifest: input.manifest,
    authority: productMaterializationAuthority
  });
  const productFileTargets =
    productMaterializationAuthority.declaredProductFileTargets;
  const workCategoryGovernance = selectSdlcWorkCategoryGovernance(input.manifest);
  const computeSubworkstreamPolicy = constructComputeSubworkstreamPolicy({
    manifest: input.manifest,
    stageRef: "transform.C",
    subworkstreamManifestPath: input.manifest.subworkstreamManifestFile
  });
  const base = Object.freeze({
    kind: "sdlc_worker_invocation_package" as const,
    packageVersion: "ts-invocation-v1" as const,
    ...(input.manifest.edgeAssuranceContractRef === undefined
      ? {}
      : { edgeAssuranceContractRef: input.manifest.edgeAssuranceContractRef }),
    ...(input.manifest.edgeAssuranceContractDigest === undefined
      ? {}
      : { edgeAssuranceContractDigest: input.manifest.edgeAssuranceContractDigest }),
    ...(input.manifest.targetCarrierContractRef === undefined
      ? {}
      : { targetCarrierContractRef: input.manifest.targetCarrierContractRef }),
    ...(input.manifest.targetCarrierContractDigest === undefined
      ? {}
      : { targetCarrierContractDigest: input.manifest.targetCarrierContractDigest }),
    targetCarrierProjection: targetCarrierPromptProjectionFor(
      input.manifest.targetCarrierProjection
    ),
    graphFunctionName: input.manifest.graphFunctionName,
    edgeName: input.manifest.edgeName,
    vectorIndex: input.manifest.vectorIndex,
    sourceAssetTypes: input.manifest.inputAssetTypes,
    targetAssetType: input.manifest.targetAssetType,
    workCategoryGovernance,
    manifestPath: workerFacingPath(input.manifest, manifestPath),
    manifestRef: workerFacingRef(input.manifest, pathToFileURL(manifestPath).href),
    manifestDigest: sha256Text(stableOperatorJson(input.manifest)),
    traversalIntentPackagePath: workerFacingPath(input.manifest, traversalIntentPath),
    traversalIntentPackageRef: workerFacingRef(
      input.manifest,
      pathToFileURL(traversalIntentPath).href
    ),
    traversalIntentPackageDigest:
      input.manifest.traversalIntentPackage.packageDigest,
    transformAxioms: transformAxiomsForWorker(),
    outcomeDirectives: outcomeDirectivesForWorker(input.manifest),
    computeSubworkstreamPolicy,
    outputContract: Object.freeze({
      kind: "sdlc_worker_invocation_output_contract" as const,
      outputFile: workerFacingPath(input.manifest, input.manifest.outputFile),
      reportFile: workerFacingPath(input.manifest, input.manifest.reportFile),
      subworkstreamManifestFile: workerFacingPath(
        input.manifest,
        input.manifest.subworkstreamManifestFile
      ),
      fpTransformRequestFile: workerFacingPath(
        input.manifest,
        input.manifest.fpTransformRequestFile
      ),
      fpTransformResultFile: workerFacingPath(
        input.manifest,
        input.manifest.fpTransformResultFile
      ),
      fpEvaluateResultFile: workerFacingPath(
        input.manifest,
        input.manifest.fpEvaluateResultFile
      ),
      materializationRequired: input.manifest.productMaterialization.required,
      tenantRoot: workerFacingPath(
        input.manifest,
        input.manifest.productMaterialization.tenantRoot
      ),
      selectedOutputRoot: input.manifest.productMaterialization.selectedOutputRoot,
      declaredProductFileTargets: productFileTargets,
      declaredProductTargetContracts: workerFacingTargetContracts(
        input.manifest,
        productMaterializationAuthority.declaredProductTargetContracts
      ),
      requiredRoles: effectiveProductMaterializationRequiredRoles(input.manifest),
      buildExecutionContract:
        input.manifest.productMaterialization.buildExecutionContract,
      testExecutionContract:
        input.manifest.productMaterialization.testExecutionContract
    }),
    productMaterializationAuthority: workerFacingProductMaterializationAuthority(
      input.manifest,
      productMaterializationAuthority
    ),
    allowedWriteRoots: input.manifest.allowedWriteRoots.map((root) =>
      workerFacingPath(input.manifest, root)
    ),
    traversalStrategyDecision: workerFacingTraversalStrategyDecision(
      input.manifest,
      input.manifest.traversalStrategyDecision
    ),
    featureScope: workerFacingFeatureScope(
      input.manifest,
      input.manifest.featureScope
    ),
    retryFrontier: Object.freeze({
      kind: "sdlc_worker_invocation_retry_frontier" as const,
      retryAttemptRefs: input.manifest.retryContext.retryAttemptRefs.map((ref) =>
        workerFacingRef(input.manifest, ref.manifestId)
      ),
      dossierRefs: workerFacingRefs(
        input.manifest,
        priorGapDossierRefs(input.manifest.retryContext)
      ),
      reasonCount: priorGapReasons.length,
      sampleReasonCodes: priorGapReasons.slice(0, 20),
      omittedReasonCount: Math.max(0, priorGapReasons.length - 20)
    }),
    repairReentryPlans: workerFacingRepairReentryPlans(
      input.manifest,
      repairReentryPlans
    ),
    retryRepairInstructions: workerFacingRetryRepairInstructions(
      input.manifest,
      retryRepairInstructions
    ),
    inlineObligations,
    inlineObligationIds: inlineObligations.map(
      (obligation) => obligation.obligationId
    ),
    requirementTraceObligationIds:
      requirementTraceObligationIdsForPrompt(input.manifest),
    omittedRequirementTraceObligationCount:
      omittedRequirementTraceObligationCount(input.manifest),
    trancheKeys: input.manifest.traversalObligationContext.trancheKeys,
    omittedObligationCount:
      input.manifest.traversalObligationContext.obligations.length -
      inlineObligations.length,
    retrievalHints: compactRetrievalHints(
      input.manifest,
      input.manifest.traversalObligationContext.retrievalHints
    ),
    obligationDeltaSummary:
      input.manifest.traversalObligationContext.deltaSummary,
    authorityRefCount:
      input.manifest.traversalObligationContext.authorityRefs.length,
    runtimeContextRefs: workerFacingRefs(
      input.manifest,
      input.manifest.traversalObligationContext.runtimeContextRefs
    ),
    priorEdgeRefs: workerFacingRefs(
      input.manifest,
      input.manifest.traversalObligationContext.priorEdgeRefs
    ),
    resultReportSchema: input.manifest.resultReportSchema
  });
  return Object.freeze({
    ...base,
    packageDigest: sha256Text(stableOperatorJson(base))
  });
}

export function constructWorkerBrief(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly manifestPath: string;
  readonly workerInvocationPackagePath: string;
  readonly traversalIntentPath: string;
  readonly conformedProjectPath: string;
  readonly invocationPackage: SdlcWorkerInvocationPackage;
}): SdlcWorkerBrief {
  return Object.freeze({
    kind: "sdlc_worker_brief" as const,
    briefVersion: "ts-worker-brief-v1" as const,
    ...(input.manifest.edgeAssuranceContractRef === undefined
      ? {}
      : { edgeAssuranceContractRef: input.manifest.edgeAssuranceContractRef }),
    ...(input.manifest.edgeAssuranceContractDigest === undefined
      ? {}
      : { edgeAssuranceContractDigest: input.manifest.edgeAssuranceContractDigest }),
    ...(input.manifest.targetCarrierContractRef === undefined
      ? {}
      : { targetCarrierContractRef: input.manifest.targetCarrierContractRef }),
    ...(input.manifest.targetCarrierContractDigest === undefined
      ? {}
      : { targetCarrierContractDigest: input.manifest.targetCarrierContractDigest }),
    graphFunctionName: input.manifest.graphFunctionName,
    edgeName: input.manifest.edgeName,
    vectorIndex: input.manifest.vectorIndex,
    sourceAssetTypes: input.manifest.inputAssetTypes,
    targetAssetType: input.manifest.targetAssetType,
    outputFile: workerFacingPath(input.manifest, input.manifest.outputFile),
    reportFile: workerFacingPath(input.manifest, input.manifest.reportFile),
    subworkstreamManifestFile: workerFacingPath(
      input.manifest,
      input.manifest.subworkstreamManifestFile
    ),
    materializationRequired: input.manifest.productMaterialization.required,
    allowedWriteRoots: input.manifest.allowedWriteRoots.map((root) =>
      workerFacingPath(input.manifest, root)
    ),
    requiredSchema: input.manifest.resultReportSchema,
    refs: Object.freeze({
      workerInvocationPackagePath: workerFacingPath(
        input.manifest,
        input.workerInvocationPackagePath
      ),
      traversalIntentPackagePath: workerFacingPath(
        input.manifest,
        input.traversalIntentPath
      ),
      handoffManifestPath: workerFacingPath(input.manifest, input.manifestPath),
      conformedProjectPath: workerFacingPath(input.manifest, input.conformedProjectPath),
      fpTransformRequestFile: workerFacingPath(
        input.manifest,
        input.manifest.fpTransformRequestFile
      ),
      fpTransformResultFile: workerFacingPath(
        input.manifest,
        input.manifest.fpTransformResultFile
      ),
      fpEvaluateResultFile: workerFacingPath(
        input.manifest,
        input.manifest.fpEvaluateResultFile
      )
    }),
    digests: Object.freeze({
      workerInvocationPackageDigest: input.invocationPackage.packageDigest,
      traversalIntentPackageDigest:
        input.manifest.traversalIntentPackage.packageDigest,
      handoffManifestDigest: input.invocationPackage.manifestDigest
    }),
    retryInstructionCount: input.invocationPackage.retryRepairInstructions.length,
    repairReentryPlanCount: input.invocationPackage.repairReentryPlans.length
  });
}

export function constructWorkerConstructionBrief(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly constructionBriefPath: string;
  readonly invocationPackage: SdlcWorkerInvocationPackage;
}): SdlcWorkerConstructionBrief {
  const constructionBriefInlineObligations = Object.freeze(
    [
      ...input.invocationPackage.inlineObligations
        .filter((obligation) => obligation.obligationKind !== "requirement")
        .slice(0, 4),
      ...input.invocationPackage.inlineObligations
        .filter((obligation) => obligation.obligationKind === "requirement")
        .slice(0, 4)
    ].map(compactConstructionBriefObligation)
  );
  const authorityRefs =
    input.manifest.traversalObligationContext.authorityRefs ??
    input.manifest.traversalIntentPackage.authorityRefs;
  const authorityIndex =
    input.manifest.traversalObligationContext.authorityIndex ??
    authorityIndexFor(authorityRefs);
  const tenantToolEnvironment = tenantToolEnvironmentProjectionFor(input.manifest);
  const packageDispositions = Object.freeze([
    Object.freeze({
      kind: "sdlc_worker_construction_brief_package_disposition" as const,
      packageName: "worker_construction_brief.json",
      path: workerFacingPath(input.manifest, input.constructionBriefPath),
      digest: "<self>",
      disposition: "canonical" as const,
      role: "single prompt source carrier"
    })
  ]);
  const designDepthEvaluatorRegisterRefs = promptSourceRefs(
    workerFacingRefs(
      input.manifest,
      admittedDesignDepthFpEvaluatorRegisterEvidenceRefs(input.manifest)
    )
  );
  const base = Object.freeze({
    kind: "sdlc_worker_construction_brief" as const,
    briefVersion: "ts-worker-construction-brief-v1" as const,
    graphFunctionName: input.manifest.graphFunctionName,
    edgeName: input.manifest.edgeName,
    vectorIndex: input.manifest.vectorIndex,
    sourceAssetTypes: input.manifest.inputAssetTypes,
    targetAssetType: input.manifest.targetAssetType,
    workCategoryGovernance: input.invocationPackage.workCategoryGovernance,
    targetCarrierProjection: targetCarrierPromptProjectionFor(
      input.manifest.targetCarrierProjection
    ),
    canonicalPromptCarrierPath: workerFacingPath(
      input.manifest,
      input.constructionBriefPath
    ),
    promptSourcePolicyRef:
      "policy://odd-sdlc/worker-prompt-source/worker-construction-brief/v1",
    packageDispositions,
    currentState: Object.freeze({
      workspaceRoot: workerFacingPath(input.manifest, input.manifest.workspaceRoot),
      archiveRoot: workerFacingPath(input.manifest, input.manifest.archiveRoot),
      authorityRefs: promptSourceRefs(authorityRefs),
      omittedAuthorityRefCount: omittedPromptSourceRefCount(authorityRefs),
      authorityIndex,
      tenantStackAuthorityRefs: tenantToolEnvironment.sourceRefs,
      tenantToolEnvironment,
      priorEdgeRefs: promptSourceRefs(input.invocationPackage.priorEdgeRefs),
      omittedPriorEdgeRefCount: omittedPromptSourceRefCount(
        input.invocationPackage.priorEdgeRefs
      ),
      runtimeContextRefs: promptSourceRefs(input.invocationPackage.runtimeContextRefs),
      omittedRuntimeContextRefCount: omittedPromptSourceRefCount(
        input.invocationPackage.runtimeContextRefs
      )
    }),
    stagePressure: Object.freeze({
      producedStagedAuthorityRefs:
        input.manifest.targetCarrierProjection.producedStagedAuthorityRefs,
      requiredStagedAuthorityRefs:
        input.manifest.targetCarrierProjection.requiredStagedAuthorityRefs,
      designDepthEvaluatorRegisterRefs,
      expectedDesignDepthEvaluatorRegisterPath:
        input.manifest.targetAssetType === "implementation_design_surface"
          ? workerFacingPath(
              input.manifest,
              designDepthFpEvaluatorRegisterPath(input.manifest)
            )
          : null,
      proportionalityProfile: input.manifest.proportionalityProfile ?? null
    }),
    computeSubworkstreamPolicy: input.invocationPackage.computeSubworkstreamPolicy,
    targetState: Object.freeze({
      outputFile: workerFacingPath(input.manifest, input.manifest.outputFile),
      reportFile: workerFacingPath(input.manifest, input.manifest.reportFile),
      subworkstreamManifestFile: workerFacingPath(
        input.manifest,
        input.manifest.subworkstreamManifestFile
      ),
      materializationRequired: input.manifest.productMaterialization.required,
      tenantRoot: workerFacingPath(
        input.manifest,
        input.manifest.productMaterialization.tenantRoot
      ),
      selectedOutputRoot: input.manifest.productMaterialization.selectedOutputRoot,
      declaredProductFileTargets:
        input.invocationPackage.outputContract.declaredProductFileTargets,
      requiredRoles: input.invocationPackage.outputContract.requiredRoles,
      buildExecutionContract:
        input.manifest.productMaterialization.buildExecutionContract,
      testExecutionContract:
        input.manifest.productMaterialization.testExecutionContract
    }),
    authority: Object.freeze({
      edgeAssuranceContractRef:
        input.manifest.edgeAssuranceContractRef ?? null,
      edgeAssuranceContractDigest:
        input.manifest.edgeAssuranceContractDigest ?? null,
      targetCarrierContractRef:
        input.manifest.targetCarrierContractRef ?? null,
      targetCarrierContractDigest:
        input.manifest.targetCarrierContractDigest ?? null,
      targetCarrierProjectionRef:
        input.manifest.targetCarrierProjection.handoffProjectionRef,
      traversalStrategyDecisionRef:
        input.manifest.traversalStrategyDecision.strategyPlanRef,
      featureScopeRef: input.manifest.featureScope.scopeRef
    }),
    obligations: Object.freeze({
      inlineObligations: constructionBriefInlineObligations,
      inlineRequirementPressureRows: Object.freeze(
        constructionBriefInlineObligations.filter(
          (obligation) => obligation.obligationKind === "requirement"
        )
      ),
      inlineObligationIds: input.invocationPackage.inlineObligationIds,
      requirementTraceObligationIds:
        input.invocationPackage.requirementTraceObligationIds,
      omittedObligationCount: input.invocationPackage.omittedObligationCount,
      omittedRequirementTraceObligationCount:
        input.invocationPackage.omittedRequirementTraceObligationCount,
      obligationDeltaSummary: input.invocationPackage.obligationDeltaSummary
    }),
    retryAndRepair: Object.freeze({
      retryAttemptRefs: input.invocationPackage.retryFrontier.retryAttemptRefs,
      gapDossierRefs: input.invocationPackage.retryFrontier.dossierRefs,
      retryInstructionCount:
        input.invocationPackage.retryRepairInstructions.length,
      repairReentryPlanCount:
        input.invocationPackage.repairReentryPlans.length
    })
  });
  const packageDigest = sha256Text(stableOperatorJson(base));
  return Object.freeze({
    ...base,
    packageDispositions: Object.freeze(
      base.packageDispositions.map((disposition) =>
        disposition.packageName === "worker_construction_brief.json"
          ? Object.freeze({ ...disposition, digest: packageDigest })
          : disposition
      )
    ),
    packageDigest
  });
}

function workerFacingPath(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  filePath: string
): string {
  const workspaceRoot = resolve(manifest.workspaceRoot);
  const resolvedPath = resolve(filePath);
  const relativePath = relative(workspaceRoot, resolvedPath);
  if (
    relativePath === "" ||
    (!relativePath.startsWith("..") && !isAbsolute(relativePath))
  ) {
    return relativePath === "" ? "." : relativePath;
  }
  return filePath;
}

function workerFacingDiagnosticPath(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  rawPath: string
): string {
  const relativePath = workerFacingPath(manifest, rawPath);
  if (relativePath !== rawPath) {
    return relativePath;
  }
  return `[outside-workspace-path:${path.basename(rawPath)}]`;
}

function workerFacingDiagnosticText(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  text: string
): string {
  return text
    .replace(/file:\/\/\/[^\s;),"]+/gu, (candidate) => {
      try {
        const filePath = fileURLToPath(candidate);
        const relativePath = workerFacingPath(manifest, filePath);
        if (relativePath !== filePath) {
          return `workspace://${relativePath}`;
        }
        return `[outside-workspace-file:${path.basename(filePath)}]`;
      } catch {
        return "[outside-workspace-file]";
      }
    })
    .replace(
      /(^|[\s;,(="'])\/(?!\/)[A-Za-z0-9._~!$&'*+=:@%/-]+/gu,
      (match, prefix: string) =>
        `${prefix}${workerFacingDiagnosticPath(
          manifest,
          match.slice(prefix.length)
        )}`
    );
}

function workerFacingRef(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  ref: string
): string {
  const workspaceRoot = resolve(manifest.workspaceRoot);
  const workspaceUrl = pathToFileURL(workspaceRoot).href;
  const workspaceUrlPrefix = `${workspaceUrl}/`;
  if (ref === workspaceUrl) {
    return "workspace://.";
  }
  if (ref.startsWith(workspaceUrlPrefix)) {
    return `workspace://${ref.slice(workspaceUrlPrefix.length)}`;
  }
  if (ref.startsWith("file://")) {
    try {
      const filePath = fileURLToPath(ref);
      const relativePath = workerFacingPath(manifest, filePath);
      if (relativePath !== filePath) {
        return `workspace://${relativePath}`;
      }
    } catch {
      return ref;
    }
  }
  if (isAbsolute(ref)) {
    const relativePath = workerFacingPath(manifest, ref);
    if (relativePath !== ref) {
      return `workspace://${relativePath}`;
    }
  }
  if (ref.includes(workspaceUrlPrefix)) {
    return ref.split(workspaceUrlPrefix).join("workspace://");
  }
  if (ref.includes(workspaceRoot)) {
    return ref.split(workspaceRoot).join(".");
  }
  return ref;
}

function workerFacingRefs(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  refs: readonly string[]
): readonly string[] {
  return Object.freeze(refs.map((ref) => workerFacingRef(manifest, ref)));
}

const WORKER_CONSTRUCTION_BRIEF_REF_LIMIT = 12;
const WORKER_CONSTRUCTION_BRIEF_REF_MAX_BYTES = 240;

function isPromptSourceRef(ref: string): boolean {
  const trimmed = ref.trim();
  if (
    trimmed.length === 0 ||
    Buffer.byteLength(trimmed, "utf8") >
      WORKER_CONSTRUCTION_BRIEF_REF_MAX_BYTES ||
    trimmed.includes("{") ||
    trimmed.includes("\\\"")
  ) {
    return false;
  }
  return (
    trimmed.startsWith("workspace://") ||
    trimmed.startsWith("file://") ||
    trimmed.startsWith("asset://") ||
    trimmed.startsWith("requirement:") ||
    trimmed.startsWith("surface://") ||
    trimmed.startsWith("decomposition-summary://")
  );
}

function promptSourceRefs(refs: readonly string[]): readonly string[] {
  return Object.freeze(
    uniqueSorted(refs.filter(isPromptSourceRef)).slice(
      0,
      WORKER_CONSTRUCTION_BRIEF_REF_LIMIT
    )
  );
}

const COMPUTE_SUBWORKSTREAM_POLICY_REF_LIMIT = 32;
const COMPUTE_SUBWORKSTREAM_POLICY_REF_MAX_BYTES = 240;

function isComputeSubworkstreamPolicyRef(ref: string): boolean {
  const trimmed = ref.trim();
  if (
    trimmed.length === 0 ||
    Buffer.byteLength(trimmed, "utf8") >
      COMPUTE_SUBWORKSTREAM_POLICY_REF_MAX_BYTES ||
    trimmed.includes("{") ||
    trimmed.includes("\\\"")
  ) {
    return false;
  }
  return [
    "workspace://",
    "asset://",
    "requirement:",
    "surface://",
    "decomposition-summary://",
    "edge-assurance-contract://",
    "gtl://",
    "strategy-plan://",
    "scope://",
    "module:",
    "source_asset:",
    "target_asset:",
    "sha256:"
  ].some((prefix) => trimmed.startsWith(prefix));
}

function computeSubworkstreamPolicyRefs(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  refs: readonly string[]
): readonly string[] {
  return Object.freeze(
    uniqueSorted(workerFacingRefs(manifest, refs).filter(isComputeSubworkstreamPolicyRef))
      .slice(0, COMPUTE_SUBWORKSTREAM_POLICY_REF_LIMIT)
  );
}

function constructComputeSubworkstreamPolicy(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly stageRef: SdlcComputeSubworkstreamStageRef;
  readonly subworkstreamManifestPath: string;
}): SdlcComputeSubworkstreamPolicy {
  const dependencyInputRefs = computeSubworkstreamPolicyRefs(input.manifest, [
    ...input.manifest.targetCarrierProjection.requiredStagedAuthorityRefs,
    ...input.manifest.targetCarrierProjection.producedStagedAuthorityRefs,
    ...input.manifest.traversalObligationContext.priorEdgeRefs,
    ...input.manifest.traversalIntentPackage.priorEdgeRefs,
    input.manifest.traversalStrategyDecision.strategyPlanRef,
    input.manifest.featureScope.scopeRef
  ]);
  const authorityInputRefs = computeSubworkstreamPolicyRefs(input.manifest, [
    ...(input.manifest.edgeAssuranceContractRef === undefined
      ? []
      : [input.manifest.edgeAssuranceContractRef]),
    input.manifest.targetCarrierProjection.targetCarrierContractRef,
    ...input.manifest.traversalObligationContext.authorityRefs
  ]);
  const derivationBasisRefs = computeSubworkstreamPolicyRefs(input.manifest, [
    input.manifest.traversalIntentPackage.packageDigest,
    input.manifest.traversalStrategyDecision.strategyPlanRef,
    input.manifest.featureScope.scopeRef,
    ...input.manifest.traversalObligationContext.trancheKeys
  ]);
  return Object.freeze({
    kind: "sdlc_compute_subworkstream_policy" as const,
    policyVersion: "ts-compute-subworkstream-policy-v1" as const,
    phase: "phase_1_parent_agent_internal" as const,
    stageRef: input.stageRef,
    permission:
      "agent_internal_subworkstreams_permitted_with_parent_merge" as const,
    selectedEdgeRef: computeSubworkstreamSelectedEdgeRef(input.manifest),
    targetCarrierRef: computeSubworkstreamTargetCarrierRef(input.manifest),
    manifestPath: workerFacingPath(input.manifest, input.subworkstreamManifestPath),
    manifestRef: workerFacingRef(
      input.manifest,
      pathToFileURL(input.subworkstreamManifestPath).href
    ),
    derivationBasisRefs,
    authorityInputRefs,
    dependencyInputRefs,
    allowedWriteRoots:
      input.stageRef === "transform.C"
        ? input.manifest.allowedWriteRoots.map((root) =>
            workerFacingPath(input.manifest, root)
          )
        : Object.freeze([]),
    requiredRowFields: SDLC_COMPUTE_SUBWORKSTREAM_ROW_FIELDS,
    nonAuthorityRules: Object.freeze([
      "Subworkstreams are parent-agent compute strategy only.",
      "Subworkstreams do not emit ABG runtime events, write ledgers, close edges, select traversal, publish consequence projections, or create ABG branch leases.",
      "The parent stage owns merge, conflict reporting, typed return, and normal admission through transform.C/evaluate.C/consequence.C.",
      input.stageRef === "evaluate.C"
        ? "evaluate.C subworkstreams are read-only over workspace/product files and may only write evaluator-owned sidecar artifacts named by the prompt."
        : "transform.C subworkstreams may write only inside the active edge permission and allowed write roots."
    ])
  });
}

function omittedPromptSourceRefCount(refs: readonly string[]): number {
  const retained = promptSourceRefs(refs);
  return Math.max(0, refs.length - retained.length);
}

function workerFacingTargetContracts(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  targets: readonly SdlcProductMaterializationAuthorityTarget[]
): readonly SdlcProductMaterializationAuthorityTarget[] {
  return Object.freeze(
    targets.map((target) =>
      Object.freeze({
        ...target,
        sourceRef: workerFacingRef(manifest, target.sourceRef)
      })
    )
  );
}

function workerFacingProductMaterializationAuthority(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  reconciliation: SdlcProductMaterializationAuthorityReconciliation
): SdlcProductMaterializationAuthorityReconciliation {
  return Object.freeze({
    ...reconciliation,
    contextExpectedTargetContracts: workerFacingTargetContracts(
      manifest,
      reconciliation.contextExpectedTargetContracts
    ),
    designAssetAuthorityTargetContracts: workerFacingTargetContracts(
      manifest,
      reconciliation.designAssetAuthorityTargetContracts
    ),
    tenantStackAuthorityTargetContracts: workerFacingTargetContracts(
      manifest,
      reconciliation.tenantStackAuthorityTargetContracts
    ),
    requirementAuthorityTargetContracts: workerFacingTargetContracts(
      manifest,
      reconciliation.requirementAuthorityTargetContracts
    ),
    productAuthorityTargetContracts: workerFacingTargetContracts(
      manifest,
      reconciliation.productAuthorityTargetContracts
    ),
    declaredProductTargetContracts: workerFacingTargetContracts(
      manifest,
      reconciliation.declaredProductTargetContracts
    ),
    sourceRefs: workerFacingRefs(manifest, reconciliation.sourceRefs)
  });
}

function workerFacingTraversalStrategyDecision(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  decision: SdlcTraversalStrategyDecision
): SdlcTraversalStrategyDecision {
  return Object.freeze({
    ...decision,
    basisRefs: workerFacingRefs(manifest, decision.basisRefs)
  });
}

function workerFacingFeatureScope(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  scope: SdlcWorkerHandoffManifest["featureScope"]
): SdlcWorkerHandoffManifest["featureScope"] {
  return Object.freeze({
    ...scope,
    basisRefs: workerFacingRefs(manifest, scope.basisRefs)
  });
}

function workerFacingRetryRepairInstructions(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  instructions: readonly SdlcWorkerRetryRepairInstruction[]
): readonly SdlcWorkerRetryRepairInstruction[] {
  return Object.freeze(
    instructions.map((instruction) =>
      Object.freeze({
        ...instruction,
        reason: workerFacingDiagnosticText(manifest, instruction.reason),
        blockingReasonDetail: workerFacingDiagnosticText(
          manifest,
          instruction.blockingReasonDetail
        ),
        gapDossierRef: workerFacingRef(manifest, instruction.gapDossierRef),
        rejectedArtifactRefs: workerFacingRefs(
          manifest,
          instruction.rejectedArtifactRefs
        )
      })
    )
  );
}

function workerFacingRepairReentryPlans(
  manifest: Pick<SdlcWorkerHandoffManifest, "workspaceRoot">,
  plans: readonly SdlcComponentRepairReentryPlan[]
): readonly SdlcComponentRepairReentryPlan[] {
  return Object.freeze(
    plans.map((plan) =>
      Object.freeze({
        ...plan,
        sourceGapDossierRef: workerFacingRef(manifest, plan.sourceGapDossierRef),
        sourceRefs: workerFacingRefs(manifest, plan.sourceRefs),
        testRefs: workerFacingRefs(manifest, plan.testRefs),
        repairRowEvidenceRefs: workerFacingRefs(
          manifest,
          plan.repairRowEvidenceRefs
        ),
        diagnosticEvidenceRefs: workerFacingRefs(
          manifest,
          plan.diagnosticEvidenceRefs
        )
      })
    )
  );
}

const CURRENT_EVALUATED_GAP_PROMPT_REASON_LIMIT = 1280;
const CURRENT_EVALUATED_GAP_PROMPT_EVIDENCE_LIMIT = 120;

function currentEvaluatedGapAssessmentRequirementIds(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly dossier: SdlcPostflightGapDossier;
}): readonly string[] {
  const evidencePaths = existingEvidencePaths({
    workspaceRoot: input.manifest.workspaceRoot,
    refs: uniqueSorted([
      ...input.dossier.evidenceRefs,
      ...input.dossier.reasons.flatMap((reason) => reason.blockingReason.evidenceRefs)
    ])
  }).filter((filePath) => path.basename(filePath) === "review_grade_edge_fulfillment_assessment.json");
  const ids = new Set<string>();
  for (const filePath of evidencePaths) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(readFileSync(filePath, "utf8"));
    } catch {
      continue;
    }
    const record = objectRecord(parsed);
    if (
      record === null ||
      record["kind"] !== "sdlc_review_grade_edge_fulfillment_assessment" ||
      !Array.isArray(record["findings"])
    ) {
      continue;
    }
    for (const candidateFinding of record["findings"]) {
      const finding = objectRecord(candidateFinding);
      if (
        finding === null ||
        typeof finding["obligationId"] !== "string" ||
        !finding["obligationId"].startsWith("requirement:") ||
        (finding["fulfillmentStatus"] !== "blocked" &&
          finding["fulfillmentStatus"] !== "unassessed")
      ) {
        continue;
      }
      ids.add(finding["obligationId"]);
    }
  }
  return uniqueSorted([...ids]);
}

function currentEvaluatedGapRequirementIds(
  manifest: SdlcWorkerHandoffManifest,
  dossier: SdlcPostflightGapDossier
): readonly string[] {
  const activeRequirementObligationIds = new Set(
    manifest.traversalObligationContext.obligations
      .filter((obligation) => obligation.obligationKind === "requirement")
      .map((obligation) => obligation.obligationId)
  );
  const assessmentIds = currentEvaluatedGapAssessmentRequirementIds({
    manifest,
    dossier
  }).filter((obligationId) =>
    currentEvaluatedGapRequirementIdIsAdmissible({
      activeRequirementObligationIds,
      obligationId
    })
  );
  if (assessmentIds.length > 0) {
    return assessmentIds;
  }
  const ids = new Set<string>();
  const candidateTexts = uniqueSorted(
    dossier.reasons
      .flatMap((reason) => [
        reason.reason,
        reason.blockingReason.message,
        reason.blockingReason.detail ?? ""
      ])
      .map((candidate) => decodedScopeRef(candidate))
  );
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const authorityRef = requirementIdForObligation(obligation.obligationId);
    const displayId = displayIdForRequirementObligation(obligation);
    const variants = uniqueSorted([
      obligation.obligationId,
      ...(authorityRef === null ? [] : [authorityRef]),
      ...(displayId === null ? [] : [displayId])
    ]).filter((variant) => variant.length > 0);
    if (
      variants.some((variant) =>
        candidateTexts.some((candidate) => candidate.includes(variant))
      )
    ) {
      ids.add(obligation.obligationId);
    }
  }
  const fallbackPattern =
    /(?:requirement:)?[A-Za-z][A-Za-z0-9_-]*(?:\.[A-Za-z0-9_-]+){2,}/gu;
  for (const candidate of candidateTexts) {
    for (const match of candidate.matchAll(fallbackPattern)) {
      const raw = match[0];
      const obligationId = raw.startsWith("requirement:")
        ? raw
        : `requirement:${raw}`;
      if (
        currentEvaluatedGapRequirementIdIsAdmissible({
          activeRequirementObligationIds,
          obligationId
        })
      ) {
        ids.add(obligationId);
      }
    }
  }
  return uniqueSorted([...ids]);
}

function currentEvaluatedGapRequirementIdIsAdmissible(input: {
  readonly activeRequirementObligationIds: ReadonlySet<string>;
  readonly obligationId: string;
}): boolean {
  if (input.activeRequirementObligationIds.has(input.obligationId)) {
    return true;
  }
  if (!input.obligationId.startsWith("requirement:")) {
    return false;
  }
  const raw = input.obligationId.slice("requirement:".length).toLowerCase();
  if (
    raw.includes("/") ||
    raw.includes("://") ||
    raw.includes(".json") ||
    raw.includes(".jsonl") ||
    raw.endsWith(".trace") ||
    raw.includes(".trace.")
  ) {
    return false;
  }
  return raw.includes("requirement") || /(?:^|[._-])req[._-]/u.test(raw);
}

function currentEvaluatedGapPromptLines(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  const priorGapDossiers = manifest.retryContext.priorGapDossiers;
  if (priorGapDossiers.length === 0) {
    return Object.freeze([]);
  }
  const dossier = priorGapDossiers[priorGapDossiers.length - 1];
  if (dossier === undefined) {
    return Object.freeze([]);
  }
  const promptReasons = retryPromptGapReasonsForDossier(manifest, dossier);
  if (promptReasons.length === 0 && dossier.reasons.length > 0) {
    const reasonLabel =
      dossier.retryEligible === true
        ? "downstream-stage pressure for a later graph edge"
        : "non-retryable control-plane or operator-triage pressure";
    return Object.freeze([
      "",
      "Current evaluated gaps:",
      `- Prior gap reasons are ${reasonLabel}; no current-edge repair work items are assigned from that dossier.`,
      `- gapDossierRef: ${workerFacingRef(manifest, dossier.currentGapDossierRef)}`,
      `- evaluated edge=${dossier.edgeName}; target=${dossier.targetAssetType}; retryEligible=${dossier.retryEligible}; reasonCount=0; rawReasonCount=${dossier.reasons.length}`,
      downstreamStagePressurePromptBoundaryLine(manifest)
    ]);
  }
  const promptDossier = Object.freeze({
    ...dossier,
    reasons: promptReasons
  });
  const requirementIds = currentEvaluatedGapRequirementIds(manifest, promptDossier);
  const evidenceRefs = workerFacingRefs(
    manifest,
    uniqueSorted([
      ...dossier.evidenceRefs,
      ...promptReasons.flatMap((reason) => reason.blockingReason.evidenceRefs)
    ])
  );
  const reasonLines = promptReasons
    .slice(0, CURRENT_EVALUATED_GAP_PROMPT_REASON_LIMIT)
    .map((reason, index) => {
      const detail = reason.blockingReason.detail ?? "";
      const diagnostic =
        detail.length > 0 && detail !== reason.reason
          ? `${reason.reason} detail=${detail}`
          : reason.reason;
      return [
        `${index + 1}. ${workerFacingDiagnosticText(manifest, diagnostic)}`,
        `[class=${reason.reasonClass}; code=${reason.blockingReason.code}; reentry=${reason.blockingReason.lawfulReentryPoint}]`
      ].join(" ");
    });
  const hasExecutionEnvironmentGap = promptReasons.some((reason) =>
    reason.reason.includes("execution_environment") ||
    reason.blockingReason.detail?.includes("execution_environment") === true
  );
  return Object.freeze([
    "",
    "Current evaluated gaps:",
    "- These are your current evaluated gaps for this retry. This is your work queue: work through it until the queue is empty or every remaining row is explicitly blocked with evidence.",
    "- Use the listed blocker rows as the retry authority packet; repair the contracted artifact surface before inspecting broader SDLC context.",
    "- Repair these concrete evaluator blockers before adding new scope.",
    `- gapDossierRef: ${workerFacingRef(manifest, dossier.currentGapDossierRef)}`,
    `- evaluated edge=${dossier.edgeName}; target=${dossier.targetAssetType}; retryEligible=${dossier.retryEligible}; reasonCount=${promptReasons.length}; rawReasonCount=${dossier.reasons.length}`,
    ...(requirementIds.length > 0
      ? [
          "- blocked requirement obligations:",
          ...requirementIds.map((id) => `  - ${workerFacingDiagnosticText(manifest, id)}`),
          "- retry coverage contract:",
          "  - Treat the blocked requirement obligations as your agentic repair ledger and work queue, not a one-shot answer prompt.",
          "  - Build a Current Gap Repair Checklist from every blocked requirement obligation above before editing.",
          "  - Work through the checklist in bounded batches: choose rows, repair artifacts, update trace evidence, run the local coverage check, then continue with remaining rows.",
          "  - For each blocked requirement obligation, assign an owning componentId, source file path, source requirement tag, and componentRealizationRows entry.",
          "  - Do not return while any blocked requirement obligation is unmapped. If an obligation cannot lawfully be mapped on this edge, report it as explicit blocked residual pressure with evidence refs.",
          "  - Before final response, run a local check over the changed source files and target carrier proving every blocked requirement obligation is present in source tags and component trace entries.",
          "  - Final response must give counts only: gapObligations=<n> mapped=<n> blocked=<n> sourceFilesTouched=<n>."
        ]
      : []),
    ...(evidenceRefs.length > 0
      ? [
          `- evidence refs: ${evidenceRefs
            .slice(0, CURRENT_EVALUATED_GAP_PROMPT_EVIDENCE_LIMIT)
            .join(", ")}`
        ]
      : []),
    ...(hasExecutionEnvironmentGap
      ? [
          "- execution-environment repair rule:",
          "  - Repair executable environment blockers through tenant stack authority, build/test config, wrappers, or runner invocation evidence.",
          "  - Do not remove tests, testcase ids, requirement ids, source-overlap rows, or lineage tags to make an execution-environment blocker disappear.",
          "  - Preserve the existing semantic proof surface unless the evaluator specifically cited that row as wrong_stage, trace_missing, schema_invalid, boundary_collapsed, semantic_not_realized, or test_overlap_missing."
        ]
      : []),
    "- evaluator reasons:",
    ...reasonLines.map((reason) => `  - ${reason}`),
    ...(promptReasons.length > CURRENT_EVALUATED_GAP_PROMPT_REASON_LIMIT
      ? [
          `  - omitted reason count: ${
            promptReasons.length - CURRENT_EVALUATED_GAP_PROMPT_REASON_LIMIT
          }`
        ]
      : [])
  ]);
}

function promptForHandoffSections(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcPromptSectionConstructionInput[] {
  const manifestPath = join(manifest.archiveRoot, "handoff_manifest.json");
  const constructionBriefPath = join(
    manifest.archiveRoot,
    "worker_construction_brief.json"
  );
  const invocationPackagePath = join(
    manifest.archiveRoot,
    "worker_invocation_package.json"
  );
  const workerBriefPath = join(manifest.archiveRoot, "worker_brief.json");
  const workCategoryGovernance = selectSdlcWorkCategoryGovernance(manifest);
  const governancePath = workCategoryGovernance.workerPath;
  const traversalIntentPath = join(
    manifest.archiveRoot,
    "traversal_intent_package.json"
  );
  const productMaterializationAuthority =
    reconcileSdlcProductMaterializationAuthority(manifest);
  assertSdlcProductMaterializationLaunchable({
    manifest,
    authority: productMaterializationAuthority
  });
  const tenantToolEnvironment = tenantToolEnvironmentProjectionFor(manifest);
  const tenantToolBoundaryLines =
    tenantToolEnvironment.disabledTools.length === 0
      ? []
      : [
          `- tenant disabled tools: ${listForPrompt(
            tenantToolEnvironment.disabledTools
          )}.`
        ];
  const ioDisciplineLines = transformWorkerIoDisciplineLines(manifest);
  const currentEdgeMaterializationRequired =
    manifest.productMaterialization.required ||
    productMaterializationRequiresTestExecutionEvidence(manifest);
  const declaredProductFileTargetLine =
    !currentEdgeMaterializationRequired
      ? productMaterializationAuthority.declaredProductFileTargets.length === 0
        ? "current-edge materialized product file targets: none"
        : [
            "current-edge materialized product file targets: none",
            `declared downstream product file targets: ${listForPrompt(
              productMaterializationAuthority.declaredProductFileTargets
            )}`
          ].join("\n- ")
      : productMaterializationAuthority.declaredProductFileTargets.length === 0
        ? "current-edge materialized product file targets: none"
        : `current-edge materialized product file targets: ${listForPrompt(
            productMaterializationAuthority.declaredProductFileTargets
          )}`;
  const outcomeSummary = [
    `edge=${manifest.edgeName}`,
    `target=${manifest.targetAssetType}`,
    `materialization=${
      manifest.productMaterialization.required
        ? "required"
        : currentEdgeMaterializationRequired
          ? "execution_repair_scoped"
          : "not_required"
    }`,
    `output=${workerFacingPath(manifest, manifest.outputFile)}`
  ].join("; ");
  const outcomeDirectives = outcomeDirectivesForWorker(manifest).map(
    (directive) => `- ${directive}`
  );
  const currentEvaluatedGaps = currentEvaluatedGapPromptLines(manifest);
  const workerAuthoredTargetCarrierProtocol =
    workerAuthoredTargetCarrierProtocolRequired(manifest);
  const targetCarrierIntentLine = workerAuthoredTargetCarrierProtocol
    ? `- selected target carrier: kind=${manifest.targetCarrierProjection.outputCarrierKind}; contract=${manifest.targetCarrierProjection.targetCarrierContractRef}; digest=${manifest.targetCarrierProjection.targetCarrierContractDigest}; payload path=${manifest.targetCarrierProjection.nestedPayloadPath}`
    : "- target carrier protocol: evaluator-owned; do not copy carrier metadata into the output artifact";
  const constructionBriefFieldLines = [
    "- targetState",
    "- stagePressure refs / designDepthEvaluatorRegisterRefs.",
    ...(workerAuthoredTargetCarrierProtocol
      ? ["- targetCarrierProjection"]
      : [
          "- targetCarrierProjection: evaluator-owned protocol; do not render fields."
        ]),
    "- currentState.authorityIndex",
    "- currentState.tenantToolEnvironment",
    "- obligations.inlineObligations typed pressure rows.",
    "- obligations.inlineRequirementPressureRows typed requirement work queue.",
    "- obligations.requirementTraceObligationIds are lineage/evidence context only; active report scope is obligations.inlineObligationIds.",
    "- retry/gap/repair rows when present.",
    "- computeSubworkstreamPolicy permission and non-authority rules.",
    "- traversalIntentPackage ref."
  ];
  const workerPackageFieldLines = [
    "- worker_invocation_package.outcomeDirectives if omitted.",
    "- worker_invocation_package.computeSubworkstreamPolicy if omitted.",
    "- retryRepairInstructions and repairReentryPlans when present; read only if named.",
    "- acceptedCarrierSchemaRef / acceptedCarrierFieldSet only for structured carriers.",
    "- traversalIntentPackageRef for citation; do not inline JSON."
  ];
  const requirementSurfaceTraceAxiomLines =
    manifest.targetAssetType === "requirement_surface"
      ? [
          "- Requirement-surface trace closure exception: include a compact Trace Index with every active obligation id from inlineObligations, requirementTraceObligationIds, retryRepairInstructions, repairReentryPlans, and prior review gaps. Grouped domain rows are not enough; each id must appear verbatim or the edge will retry."
        ]
      : [];
  return Object.freeze([
    sdlcPromptSectionFromLines({
      role: "purpose",
      title: "transform launch contract",
      textLines: Object.freeze([
        "odd_sdlc F_P.transform launch contract.",
        `Outcome: ${outcomeSummary}`,
        "",
        "Primary transform intent:",
        `- graph function: ${manifest.graphFunctionName}`,
        `- edge: ${manifest.edgeName} (${manifest.inputAssetTypes.join(", ")} -> ${manifest.targetAssetType})`,
        targetCarrierIntentLine,
        `- output surface: ${workerFacingPath(manifest, manifest.outputFile)}`,
        `- materialization: ${
          manifest.productMaterialization.required
            ? `required; tenant=${workerFacingPath(
                manifest,
                manifest.productMaterialization.tenantRoot
              )}; outputRoot=${manifest.productMaterialization.selectedOutputRoot}; roles=${listForPrompt(
                effectiveProductMaterializationRequiredRoles(manifest)
              )}`
            : productMaterializationRequiresTestExecutionEvidence(manifest)
              ? `execution-repair scoped; tenant=${workerFacingPath(
                  manifest,
                  manifest.productMaterialization.tenantRoot
                )}`
              : "not required"
        }`,
        `- ${declaredProductFileTargetLine}`,
        `- execution contracts: build=${manifest.productMaterialization.buildExecutionContract}; test=${manifest.productMaterialization.testExecutionContract}`,
        ...tenantToolBoundaryLines,
        `- obligations in scope: ${manifest.traversalObligationContext.obligations.length}; feature scope=${manifest.featureScope.mode}; included modules=${listForPrompt(manifest.featureScope.includedModuleNames)}`,
        "This section is the core F_P transform. The construction brief carries structured facts."
      ]),
      intent:
        "Render the admitted transform.C edge, target, materialization scope, and local work surface.",
      expectedOutcome:
        "Transformer receives the current edge contract without evaluator, ledger, closure, or runtime authority.",
      failureModeAddressed:
        "untyped transform prompt prose or hidden deterministic semantic recipe",
      appliesWhen: "transform.C worker launch purpose"
    }),
    sdlcPromptSectionFromLines({
      role: "read_order",
      title: "transform read order",
      textLines: Object.freeze([
        "Read in order:",
        `1. compressed work-category governance: ${governancePath}`,
        `2. construction brief: ${workerFacingPath(manifest, constructionBriefPath)}`,
        `3. worker brief projection: locator only; ${workerFacingPath(manifest, workerBriefPath)}`,
        "4. needed construction brief authority refs.",
        `5. invocation package projection: only missing fields; ${workerFacingPath(manifest, invocationPackagePath)}`,
        `6. traversal intent projection: stable refs only; ${workerFacingPath(manifest, traversalIntentPath)}`,
        `7. forensic manifest only when a package ref requires it: ${workerFacingPath(manifest, manifestPath)}`
      ]),
      intent:
        "Project the bounded authority-read order for a transform worker.",
      expectedOutcome:
        "Worker reads compact prompt-source carriers before any fallback archive inspection.",
      failureModeAddressed:
        "raw manifest over-read or replay dump used as routine worker context",
      appliesWhen: "transform.C worker authority inspection"
    }),
    sdlcPromptSectionFromLines({
      role: "tool_boundary",
      title: "transform tool and control boundary",
      textLines: Object.freeze([
        "Terse axioms:",
        "- Apply worker_construction_brief.json as the single prompt source carrier.",
        "- Archive package files and manifests are replay/audit projections.",
        "- Build a Requirement/Authority/Asset Checklist from requirements, target rows, expected artifacts, and evaluated gaps.",
        "- worker_result_report.obligationAssessments must cover exactly the active report scope from obligations.inlineObligationIds; do not add omitted requirements, requirementTraceObligationIds, traversalIntentPackage.obligationIds, retrieval hint obligation ids, or full manifest obligations as assessment rows.",
        "- Do not return success while required checklist rows are unmapped. Keep Markdown proportional: use grouped counts plus high-signal samples, and do not list every id unless the target is a requirement-surface Trace Index or admitted traceability/register surface requiring exact rows.",
        ...requirementSurfaceTraceAxiomLines,
        ...ioDisciplineLines,
        "- For existing output, use targeted Edit operations; do not use the Claude Write tool for whole-file replacement.",
        "- Apply tenantToolEnvironment; do not run tools the tenant disables.",
        "- You may use agent-internal subagents or parallel workstreams from admitted work-plan, dependency, target-carrier, tranche, authority, and obligation refs.",
        `- If used, update ${workerFacingPath(manifest, manifest.subworkstreamManifestFile)}; otherwise leave the default not-started manifest honest.`,
        "- Subworkstreams are not ABG branches; observation only; parent merges.",
        "- Do not inspect odd_sdlc framework source code to infer carrier schemas.",
        "- Do not render target-carrier protocol fields unless asked for a structured carrier.",
        "- Read boundary: use only workspace-relative paths; no sibling sandboxes, historical test_runs, home memory, /tmp, or outside-workspace absolute paths.",
        "- Control boundary: do not run odd-sdlc-ts, abiogenesis-ts, genesis-ts, start, gaps, analyze-run, install, traversal, or resume.",
        "- Do not spawn an odd_sdlc/ABG worker, start another traversal, or leave child processes running; stay under this parent transform turn.",
        "- Write only the contracted output/product artifacts, then exit; the framework evaluates the artifact after this process exits.",
        "- Do not inspect sibling operator-run dirs or add local axiom variants."
      ]),
      intent:
        "Constrain worker-side tools, control flow, and side effects to the admitted transform boundary.",
      expectedOutcome:
        "Worker edits only the contracted output/product artifacts and leaves runtime/evaluation authority to the framework.",
      failureModeAddressed:
        "worker creating a rival runtime, spawned traversal, or evaluator/closure side effect",
      appliesWhen: "transform.C worker tool and side-effect boundary"
    }),
    sdlcPromptSectionFromLines({
      role: "output_contract",
      title: "transform output contract and support carriers",
      textLines: Object.freeze([
        "Outcome directives:",
        ...outcomeDirectives,
        "",
        "Construction brief fields to apply:",
        ...constructionBriefFieldLines,
        "",
        "Worker package fields to apply only on demand:",
        ...workerPackageFieldLines,
        ...currentEvaluatedGaps,
        "",
        ...(manifest.productMaterialization.required
          ? ["Product materialization is REQUIRED for this edge."]
          : productMaterializationRequiresTestExecutionEvidence(manifest)
            ? ["Product materialization is execution-repair scoped for this edge."]
            : []),
        "The framework writes reports, evidence carriers, ledgers, and closure after this process exits."
      ]),
      intent:
        "Declare the worker output directives and referenced support carriers for this transform turn.",
      expectedOutcome:
        "Worker returns the declared artifact/product deltas while reports, evidence, ledgers, and closure stay framework-owned.",
      failureModeAddressed:
        "worker result report, evidence ledger, or closure projection treated as transform-owned output",
      appliesWhen: "transform.C worker output construction"
    })
  ]);
}

export function promptForHandoffProjection(
  manifest: SdlcWorkerHandoffManifest
): SdlcRenderedPromptProjection {
  const constructionBriefPath = join(
    manifest.archiveRoot,
    "worker_construction_brief.json"
  );
  const invocationPackagePath = join(
    manifest.archiveRoot,
    "worker_invocation_package.json"
  );
  const traversalIntentPath = join(
    manifest.archiveRoot,
    "traversal_intent_package.json"
  );
  const workCategoryGovernance = selectSdlcWorkCategoryGovernance(manifest);
  return constructSdlcPromptInvocationProjection({
    promptFamily: "transform",
    stage: "transform.C",
    recipient: "transformer",
    targetAssetType: manifest.targetAssetType,
    workCategory: manifest.edgeName,
    edgePolicyRef: manifest.traversalObligationContext.edgeAssuranceContractRef ?? null,
    constructorRef: "prompt-constructor://odd-sdlc/transform/v1",
    authorityPacketRefs: [
      workCategoryGovernance.configRef,
      workCategoryGovernance.workerPath,
      constructionBriefPath,
      invocationPackagePath,
      traversalIntentPath,
      ...manifest.traversalObligationContext.authorityRefs,
      ...manifest.methodRefs
    ],
    obligationRefs: manifest.traversalObligationContext.obligations.map(
      (obligation) => obligation.obligationId
    ),
    toolEffectPolicyRefs: [
      "tool-policy://odd-sdlc/transform/edge-permission-class",
      "tenant-tool-environment://current-state",
      `materialization-policy://${manifest.productMaterialization.required ? "required" : "not-required"}`
    ],
    outputCarrierRefs: [
      manifest.outputFile,
      manifest.targetCarrierProjection.targetCarrierContractRef,
      manifest.targetCarrierProjection.outputCarrierKind
    ],
    proofObligationRefs: [
      "REQ-F-ODDSDLC-083",
      "REQ-F-ODDSDLC-087",
      manifest.traversalObligationContext.edgeAssuranceContractRef ??
        "assurance-contract://odd-sdlc/current-edge"
    ],
    promptSections: promptForHandoffSections(manifest)
  });
}

export function promptForHandoff(manifest: SdlcWorkerHandoffManifest): string {
  return promptForHandoffProjection(manifest).promptText;
}

export function writeHandoffFiles(manifest: SdlcWorkerHandoffManifest): {
  readonly manifestPath: string;
  readonly promptPath: string;
  readonly constructionBriefPath: string;
  readonly invocationPackagePath: string;
  readonly workerBriefPath: string;
} {
  assertTraversalIntentPackagePressure(manifest);
  mkdirSync(manifest.archiveRoot, { recursive: true });
  const fileTargetRoots = materializationFileTargetRoots(manifest);
  for (const writeRoot of manifest.allowedWriteRoots) {
    mkdirSync(directoryToPrepareForWriteRoot(writeRoot, fileTargetRoots), {
      recursive: true
    });
  }
  const manifestPath = join(manifest.archiveRoot, "handoff_manifest.json");
  const invocationPackagePath = join(
    manifest.archiveRoot,
    "worker_invocation_package.json"
  );
  const workerBriefPath = join(manifest.archiveRoot, "worker_brief.json");
  const constructionBriefPath = join(
    manifest.archiveRoot,
    "worker_construction_brief.json"
  );
  const promptPath = join(manifest.archiveRoot, "worker_prompt.md");
  const promptAssetPath = join(manifest.archiveRoot, "worker_prompt_asset.json");
  const conformedProjectPath = join(manifest.archiveRoot, "conformed_project.json");
  const traversalIntentPath = join(manifest.archiveRoot, "traversal_intent_package.json");
  const handoffReplayIndexPathForRun = handoffReplayIndexPath(manifest.archiveRoot);
  const invocationPackage = constructWorkerInvocationPackage({
    manifest,
    manifestPath,
    traversalIntentPath
  });
  const workerBrief = constructWorkerBrief({
    manifest,
    manifestPath,
    workerInvocationPackagePath: invocationPackagePath,
    traversalIntentPath,
    conformedProjectPath,
    invocationPackage
  });
  const constructionBrief = constructWorkerConstructionBrief({
    manifest,
    constructionBriefPath,
    invocationPackage
  });
  writeHandoffFile(manifest, manifestPath, stableOperatorJson(manifest));
  writeHandoffFile(
    manifest,
    handoffReplayIndexPathForRun,
    stableOperatorJson(handoffReplayIndexForManifest(manifest))
  );
  writeHandoffFile(
    manifest,
    invocationPackagePath,
    stableOperatorJson(invocationPackage)
  );
  writeHandoffFile(manifest, workerBriefPath, stableOperatorJson(workerBrief));
  writeHandoffFile(
    manifest,
    constructionBriefPath,
    stableOperatorJson(constructionBrief)
  );
  writeHandoffFile(
    manifest,
    manifest.subworkstreamManifestFile,
    stableOperatorJson(
      defaultComputeSubworkstreamManifest({
        manifest,
        stageRef: "transform.C",
        source: "parent_checkpoint"
      })
    )
  );
  const promptProjection = promptForHandoffProjection(manifest);
  writeHandoffFile(manifest, promptPath, promptProjection.promptText);
  writeHandoffFile(
    manifest,
    promptAssetPath,
    stableOperatorJson(promptProjection.invocationAsset)
  );
  writeHandoffFile(
    manifest,
    conformedProjectPath,
    stableOperatorJson(manifest.conformedProject)
  );
  writeHandoffFile(
    manifest,
    traversalIntentPath,
    stableOperatorJson(manifest.traversalIntentPackage)
  );
  if (manifest.fpTransformRequest !== null) {
    writeHandoffFile(
      manifest,
      manifest.fpTransformRequestFile,
      stableOperatorJson(manifest.fpTransformRequest)
    );
  }
  return Object.freeze({
    manifestPath,
    promptPath,
    constructionBriefPath,
    invocationPackagePath,
    workerBriefPath
  });
}

function writeHandoffFile(
  manifest: SdlcWorkerHandoffManifest,
  absolutePath: string,
  content: string
): void {
  writeSdlcSystemArtifact({
    archiveRoot: manifest.archiveRoot,
    absolutePath,
    payload: content
  });
}

function expectedArchivedFpEvaluateResultRef(reportFile: string): string {
  return pathToFileURL(join(dirname(reportFile), "fp_evaluate_result.json")).href;
}

function readArchivedWorkerResultReportRecord(input: {
  readonly filePath: string;
  readonly label: string;
}): Record<string, unknown> {
  const record = parseClosedRecord(
    JSON.parse(readFileSync(input.filePath, "utf8")),
    input.label,
    REPORT_FIELDS
  );
  const kind = parseNonEmptyString(record["kind"], `${input.label}.kind`);
  if (kind !== "odd_sdlc.worker_result_report") {
    throw new TypeError(`${input.label}.kind: unexpected report kind`);
  }
  const projectionRole = parseNonEmptyString(
    record["projectionRole"],
    `${input.label}.projectionRole`
  );
  if (projectionRole !== "typed_fp_stage_projection") {
    throw new TypeError(
      `${input.label}.projectionRole: expected typed_fp_stage_projection`
    );
  }
  const authoritativeStageResultRef = parseNonEmptyString(
    record["authoritativeStageResultRef"],
    `${input.label}.authoritativeStageResultRef`
  );
  if (authoritativeStageResultRef !== expectedArchivedFpEvaluateResultRef(input.filePath)) {
    throw new TypeError(
      `${input.label}.authoritativeStageResultRef: expected same-archive fp_evaluate_result.json`
    );
  }
  return record;
}

function normalizedRelativePath(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

function objectRecord(input: unknown): Record<string, unknown> | null {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return null;
  }
  return Object.fromEntries(Object.entries(input));
}

function requirementIdForObligation(obligationId: string): string | null {
  if (!obligationId.startsWith("requirement:")) {
    return null;
  }
  const rawRef = obligationId.slice("requirement:".length);
  return /^(?:REQ|RF|R)-/iu.test(rawRef) ? normalizeRequirementId(rawRef) : rawRef;
}

function displayIdForRequirementObligation(
  obligation: SdlcTraversalObligation
): string | null {
  const concreteMatch = /^Fulfill ([^:]+):/u.exec(obligation.summary);
  if (concreteMatch?.[1] !== undefined) {
    return normalizeRequirementId(concreteMatch[1]);
  }
  const referenceMatch = /^Fulfill live requirement ([^.]+)\./u.exec(
    obligation.summary
  );
  if (referenceMatch?.[1] !== undefined) {
    return normalizeRequirementId(referenceMatch[1]);
  }
  return null;
}

function requirementLineageAuthorityRank(obligation: SdlcTraversalObligation): number {
  const refs = obligation.payload.sourceRefs;
  if (
    refs.some(
      (ref) =>
        ref.includes("/specification/requirements/") &&
        !ref.endsWith("/specification/requirements/README.md") &&
        !ref.endsWith("/specification/requirements/00-imported-sources.md")
    )
  ) {
    return 0;
  }
  if (
    refs.some(
      (ref) =>
        ref.endsWith("/specification/REQUIREMENTS.md")
    )
  ) {
    return 1;
  }
  if (
    refs.some((ref) =>
      ref.endsWith("/specification/requirements/00-imported-sources.md")
    )
  ) {
    return 2;
  }
  if (refs.some((ref) => ref.endsWith("/README.md"))) {
    return 4;
  }
  return 3;
}

function canonicalRequirementTraceObligationsForPrompt(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcTraversalObligation[] {
  const byDisplayId = new Map<string, SdlcTraversalObligation>();
  for (const obligation of manifest.traversalObligationContext.obligations) {
    if (obligation.obligationKind !== "requirement") {
      continue;
    }
    const displayId =
      displayIdForRequirementObligation(obligation) ?? obligation.obligationId;
    const existing = byDisplayId.get(displayId);
    if (
      existing === undefined ||
      requirementLineageAuthorityRank(obligation) <
        requirementLineageAuthorityRank(existing) ||
      (requirementLineageAuthorityRank(obligation) ===
        requirementLineageAuthorityRank(existing) &&
        obligation.obligationId.localeCompare(existing.obligationId) < 0)
    ) {
      byDisplayId.set(displayId, obligation);
    }
  }
  return Object.freeze([...byDisplayId.values()]);
}

const HANDOFF_REPLAY_INDEX_FILE = "handoff_replay_index.json";
const HANDOFF_REPLAY_INDEX_VERSION = "ts-handoff-replay-index-v1";

interface SdlcHandoffReplayIndex {
  readonly kind: "sdlc_handoff_replay_index";
  readonly indexVersion: typeof HANDOFF_REPLAY_INDEX_VERSION;
  readonly workspaceRoot: string;
  readonly graphFunctionName: string;
  readonly edgeName: string;
  readonly vectorIndex: number;
  readonly targetAssetType: string;
}

function handoffReplayIndexPath(archiveRoot: string): string {
  return join(archiveRoot, HANDOFF_REPLAY_INDEX_FILE);
}

function handoffReplayIndexForManifest(
  manifest: SdlcWorkerHandoffManifest
): SdlcHandoffReplayIndex {
  return Object.freeze({
    kind: "sdlc_handoff_replay_index" as const,
    indexVersion: HANDOFF_REPLAY_INDEX_VERSION,
    workspaceRoot: manifest.workspaceRoot,
    graphFunctionName: manifest.graphFunctionName,
    edgeName: manifest.edgeName,
    vectorIndex: manifest.vectorIndex,
    targetAssetType: manifest.targetAssetType
  });
}


export function relativeToWorkspace(workspaceRoot: string, filePath: string): string {
  return path.relative(workspaceRoot, filePath);
}
