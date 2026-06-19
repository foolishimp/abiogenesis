// Implements: T-184

import type {
  SdlcTenantToolEnvironmentProjection,
  SdlcWorkerHandoffManifest,
  SdlcWorkerInvocationPackage
} from "../../carriers.js";
import {
  SDLC_COMPONENT_CONCERN_ROLES,
  SDLC_DESIGN_COMPLETENESS_STATUSES,
  SDLC_DOMAIN_ATTRIBUTE_CARDINALITIES,
  SDLC_DOMAIN_ENTITY_OWNERSHIP
} from "../../carriers.js";
import {
  DESIGN_DEPTH_DRAFT_FRAGMENT_UPDATE_HELPER_CONTRACT_PATH,
  DESIGN_DEPTH_DRAFT_FRAGMENT_UPDATE_HELPER_CONTRACT_REF,
  SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND,
  SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_DRAFT_CONTENT_KIND,
  SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS
} from "./content_register.js";
import {
  DESIGN_DEPTH_FP_EVALUATOR_RULE_REF
} from "./design_depth_register.js";
import {
  SDLC_PROMPT_BOUNDED_FALLBACK_AUTHORITY_KIND_REFS,
  SDLC_PROMPT_NORMAL_AUTHORITY_KIND_REFS,
  constructSdlcEvaluationGridContract,
  constructSdlcPromptInvocationProjection,
  sdlcPromptAuthorityCompressionFallbackPreconditionRef,
  sdlcPromptSectionFromLines,
  type SdlcDisambiguationCarrierRef,
  type SdlcEvaluationDimensionRef,
  type SdlcEvaluationDimensionScope,
  type SdlcEvaluationGridContract,
  type SdlcPromptFamily,
  type SdlcPromptSectionConstructionInput,
  type SdlcRenderedPromptProjection,
  type SdlcTransformUnitRef
} from "../../prompt_assets.js";

function listForPrompt(values: readonly string[]): string {
  return values.length === 0 ? "none" : values.join(", ");
}

function tenantToolBoundaryPromptLines(
  tenantToolEnvironment: SdlcTenantToolEnvironmentProjection | null | undefined
): readonly string[] {
  if (
    tenantToolEnvironment === null ||
    tenantToolEnvironment === undefined
  ) {
    return Object.freeze([
      "- Tenant disabled tools from currentState.tenantToolEnvironment: none.",
      "- Tenant workspace-local directories from currentState.tenantToolEnvironment: none.",
      "- Tenant environment variables from currentState.tenantToolEnvironment: none."
    ]);
  }
  return Object.freeze([
    `- Tenant disabled tools from currentState.tenantToolEnvironment: ${listForPrompt(
      tenantToolEnvironment.disabledTools
    )}.`,
    `- Tenant workspace-local directories from currentState.tenantToolEnvironment: ${listForPrompt(
      tenantToolEnvironment.workspaceLocalDirectories
    )}.`,
    `- Tenant environment variables from currentState.tenantToolEnvironment: ${listForPrompt(
      tenantToolEnvironment.environmentVariableNames
    )}.`,
    "- Apply currentState.tenantToolEnvironment before choosing any evaluator tool, local helper, evidence probe, or evaluator subworkstream.",
    "- Tenant-declared environment variables are authority metadata for this evaluation. Preserve their names and do not synthesize, recompute, or overwrite their values.",
    "- If an active execution-capable tool profile explicitly permits local commands, inherit the process environment unchanged and do not assign any name listed in currentState.tenantToolEnvironment.environmentVariableNames.",
    "- When the active evaluator profile is read/write-only, treat tenant environment variables as declared context only; if command execution is visible, use it only under the explicit execution-capable rules in this prompt.",
    "- When a probe needs tool homes, dependency caches, boot directories, or global bases, use the already-expanded tenant-declared process.env values and tenant stack specs; do not derive them from process.cwd(), /tmp, /private/tmp, user-home, workspace-root fallback directories, or global-cache fallbacks.",
    "- Do not run tenant-disabled tools for assessment JSON writing, summarization, validation, execution probes, or convenience inspection."
  ]);
}

function edgeAuthorityCompressionPromptLines(): readonly string[] {
  return Object.freeze([
    "- STDO authority compression: evaluate the current edge from the smallest admitted authority packet that can decide the obligation.",
    "- Normal evaluation authority is specification/PRODUCT.md, specification/requirements/*, admitted design/depth refs, typed obligation rows, target-carrier refs, tenant stack authority, worker report evidence, and product materialization evidence.",
    "- Raw bootstrap surfaces such as bootstrap.md and .ai-workspace/context/project_bootstrap.md are provenance/import sources, not routine evaluator inputs; do not read them unless a named provenance/import discrepancy cannot be resolved from the compressed packet.",
    "- specification/INTENT.md is only a bounded fallback for missing scope/intent context; inspect at most the lines needed for the named unresolved obligation and never use raw intent text as a substitute for admitted requirement rows.",
    "- Prefer specification/PRODUCT.md and specification/requirements/* over bootstrap or raw intent when judging product behavior, obligations, lineage, or accepted authority.",
    "- Requirement lineage is carried by admitted obligation ids, requirement rows, target-carrier refs, and worker/materialization evidence. Do not rediscover lineage by rereading seed bootstrap text.",
    "- If raw bootstrap or intent fallback is necessary, cite the unresolved obligation id or finding reason first, read with limit <=80, and keep that sourceBasis/evidence use local to that finding."
  ]);
}

const ABG_ITERATION_OUTCOME_FOLD_REF =
  "package:@abiogenesis/typescript-tenant@4.1.0-rc.2#abg/m03/iteration_state_action/deriveIterationOutcomeFromRows";

interface EvaluatePromptLineGroups {
  readonly preAuthorityLines: readonly string[];
  readonly postAuthorityLines: readonly string[];
}

function stableRefSegment(value: string | null | undefined, fallback: string): string {
  const basis = value === null || value === undefined || value.trim().length === 0
    ? fallback
    : value;
  return basis.replace(/[^A-Za-z0-9._:-]+/gu, "-");
}

function manifestObligationRefs(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  return Object.freeze(
    (manifest.traversalObligationContext?.obligations ?? []).map(
      (obligation) => obligation.obligationId
    )
  );
}

function uniquePromptRefs(values: readonly string[]): readonly string[] {
  return Object.freeze(
    [...new Set(values.filter((value) => value.trim().length > 0))].sort(
      (left, right) => left.localeCompare(right)
    )
  );
}

type SdlcReviewGradeInvocationScope = Pick<
  SdlcWorkerInvocationPackage,
  "kind" | "featureScope" | "inlineObligationIds"
>;

function reviewGradePromptObligationRefs(
  manifest: SdlcWorkerHandoffManifest,
  invocationScope?: SdlcReviewGradeInvocationScope | null | undefined
): readonly string[] {
  const fallback = manifestObligationRefs(manifest);
  if (manifest.featureScope?.mode === "full_breadth") {
    return fallback;
  }
  if (
    invocationScope === null ||
    invocationScope === undefined ||
    invocationScope.kind !== "sdlc_worker_invocation_package" ||
    invocationScope.featureScope.mode === "full_breadth"
  ) {
    return Object.freeze([]);
  }
  return uniquePromptRefs(invocationScope.inlineObligationIds);
}

function evaluationDimension(input: {
  readonly promptFamily: Extract<
    SdlcPromptFamily,
    "evaluate_design_depth" | "evaluate_review_grade"
  >;
  readonly dimensionKey: string;
  readonly scope: SdlcEvaluationDimensionScope;
}): SdlcEvaluationDimensionRef {
  return Object.freeze({
    kind: "sdlc_evaluation_dimension_ref" as const,
    dimensionRef: `evaluation-dimension://odd-sdlc/${input.promptFamily}/${input.dimensionKey}`,
    scope: input.scope,
    expectedFindingRef: `evaluation-finding://odd-sdlc/${input.promptFamily}/${input.dimensionKey}`
  });
}

function evaluationGridContractForPrompt(input: {
  readonly promptFamily: Extract<
    SdlcPromptFamily,
    "evaluate_design_depth" | "evaluate_review_grade"
  >;
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly invocationScope?: SdlcReviewGradeInvocationScope | null | undefined;
  readonly sourceAssetRefs: readonly string[];
  readonly targetAssetRefs: readonly string[];
  readonly dimensions: readonly SdlcEvaluationDimensionRef[];
  readonly provenanceRefs: readonly string[];
}): SdlcEvaluationGridContract {
  const graphRef = stableRefSegment(
    input.manifest.graphFunctionName,
    "unknown-graph-function"
  );
  const edgeRef = stableRefSegment(input.manifest.edgeName, "unknown-edge");
  const targetRef = stableRefSegment(
    input.manifest.targetAssetType,
    "unknown-target"
  );
  const unitRef =
    `transform-unit://odd-sdlc/${graphRef}/${edgeRef}/${targetRef}`;
  const obligationRefs =
    input.promptFamily === "evaluate_review_grade"
      ? reviewGradePromptObligationRefs(input.manifest, input.invocationScope)
      : manifestObligationRefs(input.manifest);
  const transformUnit: SdlcTransformUnitRef = Object.freeze({
    kind: "sdlc_transform_unit_ref" as const,
    unitRef,
    segmentKey: edgeRef,
    sourceAssetRefs: input.sourceAssetRefs,
    targetAssetRefs: input.targetAssetRefs,
    obligationRefs
  });
  const semanticDimensions = input.dimensions.filter(
    (dimension) => dimension.scope !== "fold"
  );
  const foldDimensions = input.dimensions.filter(
    (dimension) => dimension.scope === "fold"
  );
  const authoritySnapshotRefs = Object.freeze([
    ...input.sourceAssetRefs,
    ...input.targetAssetRefs
  ]);
  const disambiguationCarriers = Object.freeze([
    ...semanticDimensions.map((dimension): SdlcDisambiguationCarrierRef =>
      Object.freeze({
        kind: "sdlc_disambiguation_carrier_ref" as const,
        carrierRef:
          `disambiguation-carrier://odd-sdlc/${input.promptFamily}/${edgeRef}/${stableRefSegment(dimension.scope, "scope")}/${stableRefSegment(dimension.dimensionRef, "dimension")}`,
        scopeRef: `${unitRef}#${dimension.dimensionRef}`,
        authoritySnapshotRefs,
        priorFindingRefs: Object.freeze([] as const),
        lineageRefs: obligationRefs
      })
    ),
    ...foldDimensions.map((dimension): SdlcDisambiguationCarrierRef =>
      Object.freeze({
        kind: "sdlc_disambiguation_carrier_ref" as const,
        carrierRef:
          `disambiguation-carrier://odd-sdlc/${input.promptFamily}/${edgeRef}/fold/${stableRefSegment(dimension.dimensionRef, "dimension")}`,
        scopeRef:
          `evaluation-grid-fold://odd-sdlc/${input.promptFamily}/${edgeRef}#${dimension.dimensionRef}`,
        authoritySnapshotRefs,
        priorFindingRefs: input.dimensions.map(
          (candidate) => candidate.expectedFindingRef
        ),
        lineageRefs: obligationRefs
      })
    )
  ]);
  return constructSdlcEvaluationGridContract({
    logicalGridRef:
      `evaluation-grid://odd-sdlc/${input.promptFamily}/${graphRef}/${edgeRef}/${targetRef}`,
    physicalExecution: "fused_prompt",
    transformUnits: Object.freeze([transformUnit]),
    evaluationDimensions: input.dimensions,
    disambiguationCarriers,
    expectedFindingRefs: input.dimensions.map(
      (dimension) => dimension.expectedFindingRef
    ),
    abgOutcomeFoldRef: ABG_ITERATION_OUTCOME_FOLD_REF,
    provenanceRefs: input.provenanceRefs
  });
}

function useCompactFusedEvaluationPrompt(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  const profile = manifest.proportionalityProfile ?? null;
  const obligationCount =
    manifest.traversalObligationContext?.obligations?.length ?? 0;
  return profile !== null && obligationCount > 0 && obligationCount <= 8;
}

function isComponentCodeReviewGradeEdge(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return manifest.targetAssetType === "component_code_surface";
}

function materializationBindingDimensionApplies(
  manifest: SdlcWorkerHandoffManifest
): boolean {
  return manifest.productMaterialization?.required === true;
}

function reviewGradePreAuthoritySpecializationLines(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  if (!isComponentCodeReviewGradeEdge(manifest)) {
    return Object.freeze([] as const);
  }
  return Object.freeze([
    "- Bind fulfilled component_code_surface findings to concrete product targets and entrypoints. Treat materialization binding as a narrow relation check."
  ]);
}

function reviewGradeGeneratedArtifactReadLine(
  manifest: SdlcWorkerHandoffManifest
): string {
  if (materializationBindingDimensionApplies(manifest)) {
    return "5. generated product files named by worker_result_report.materializedFiles or product_materialization_manifest.files.";
  }
  return "5. generated asset artifact named by worker_result_report.outputFile or the handoff manifest outputFile; materializedFiles may be empty on planning surfaces.";
}

function reviewGradeOptionalObservationFieldLine(
  manifest: SdlcWorkerHandoffManifest
): string {
  const fields = [
    "stageBoundaryConformance { dimension, status, rationale }",
    ...(materializationBindingDimensionApplies(manifest)
      ? ["materializationBindingRelation { dimension, status, rationale }"]
      : []),
    "obligationCoverageFold { dimension, coveredCount, totalCount, status, rationale }"
  ];
  return `- Optional top-level observation fields, when useful: ${fields.join(", ")}. No other top-level keys are allowed.`;
}

function reviewGradeFindingFulfillmentBindingLine(
  manifest: SdlcWorkerHandoffManifest
): string {
  if (isComponentCodeReviewGradeEdge(manifest)) {
    return "- fulfillmentBinding: every fulfilled component_code_surface finding must include it; non-fulfilled findings set it to null";
  }
  return `- fulfillmentBinding: null for every finding on this ${manifest.targetAssetType} edge`;
}

function reviewGradeFulfillmentBindingShapeLines(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  if (!isComponentCodeReviewGradeEdge(manifest)) {
    return Object.freeze([] as const);
  }
  return Object.freeze([
    "",
    "fulfillmentBinding shape for fulfilled component_code_surface findings:",
    "- kind: \"gtl_contract_fulfillment_binding\"",
    "- obligationRef: exact obligation id for this finding",
    "- requirementRef: exact obligation id; for non-requirement scoped obligations such as target_asset, source_asset, module, source_set, inline, or aggregate, this may instead be a declared product requirement id carried by that scope",
    "- productRequirementRef: accepted product requirement ref or exact obligation id when no narrower product-requirement ref exists; when requirementRef uses a carried product requirement for a scoped non-requirement obligation, productRequirementRef must match it",
    "- designObligationRef: accepted design/depth/component row ref that assigned the obligation",
    "- componentRef: accepted component/module ref",
    "- productTargetRef: target carrier or declared product-file target ref",
    "- outputSurfaceRef: generated source file/API/route/CLI/service ref",
    "- functionOrEntrypointRef: concrete function, exported API, route, CLI command, service entrypoint, executable script, or equivalent public behavior ref",
    "- realizationEvidenceRefs: source/runtime evidence refs proving the binding",
    "- testOrExecutionEvidenceRefs: test, execution, or evaluator evidence refs that hold the binding to account; when downstream test execution has not run on this edge, use evaluator and worker-report evidence refs instead of null",
    "- evaluatorFindingRef: stable finding ref inside this fulfillmentBinding only; never add evaluatorFindingRef as a root finding key",
    "- authorityRefs: accepted authority refs used to admit this binding",
    "- evidenceRefs: evidence refs used to admit this binding",
    "- bindingRef may be omitted; ABG derives and admits the final bindingRef.",
    "- Do not emit JSON null inside fulfillmentBinding. For non-requirement scoped obligations with no narrower product requirement, use the exact obligationId for requirementRef and productRequirementRef. For file-target-only requirements with no function/API, use productTargetRef as functionOrEntrypointRef."
  ]);
}

function reviewGradeComponentCodeRuleLines(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  if (!isComponentCodeReviewGradeEdge(manifest)) {
    return Object.freeze([] as const);
  }
  return Object.freeze([
    "- On component_code_surface, mark semantic_not_realized when source-role files are only row-count arithmetic, print-only runners, requirement-comment shells, or other scaffolds that do not implement the admitted module responsibility through a public behavior boundary.",
    "- For behavior-bearing component_code_surface findings, do not pass fulfillment from component_depth_register rows, manifests, or worker obligation assessments unless the finding is bound to a public source boundary and scenario/build-test/evaluator evidence. If source behavior is absent use semantic_not_realized; if only later test/runtime proof is missing after source behavior is otherwise present, use wrong_stage.",
    "- Mark wrong_stage for lawful downstream carryover only. Test execution or runtime proof absent on component_code_surface is wrong_stage when source/build_config obligations are otherwise fulfilled and no test/execution product target is declared on this edge.",
    "- On component_code_surface, inspect every role=source materialized file and declared build/config support before deciding executable or public-boundary evidence is absent.",
    "- For every component_code_surface fulfilled finding, bind finding.obligationId plus product requirement when available -> design/depth obligation -> component/product target -> function/API/route/CLI/entrypoint -> evidence in fulfillmentBinding.",
    "- For component_code_surface source_asset, module, target_asset, source_set, inline, or aggregate findings, use the carried product requirement id as requirementRef and productRequirementRef when one is declared for the scope; use the exact obligationId only when no narrower product requirement exists. Still bind the finding to the concrete generated entrypoint/public behavior and evidence.",
    "- A fulfilled component_code_surface finding with fulfillmentBinding:null is invalid and will be retried, even when the obligation is module-level or source-asset-level carryover.",
    "- For component_code_surface, compare source files to accepted design-depth componentRealizationRows and fileTargetRows."
  ]);
}

function reviewGradePublicBoundaryInspectionLines(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  if (!isComponentCodeReviewGradeEdge(manifest)) {
    return Object.freeze([] as const);
  }
  return Object.freeze([
    "- For component_code_surface, inspect every role=source materialized file and every declared support/build configuration file before deciding that executable or public-boundary evidence is absent. Never filter public-boundary inspection to one extension family."
  ]);
}

function reviewGradeSelfCheckBindingLine(
  manifest: SdlcWorkerHandoffManifest
): string {
  if (isComponentCodeReviewGradeEdge(manifest)) {
    return "- Re-open the assessment JSON with bounded Read and verify the exact top-level/finding key sets, one finding per reviewed id, no extra obligation ids, non-empty evidence/authority refs, and component_code_surface fulfillment bindings.";
  }
  return `- Re-open the assessment JSON with bounded Read and verify the exact top-level/finding key sets, one finding per reviewed id, no extra obligation ids, non-empty evidence/authority refs, and fulfillmentBinding:null on every ${manifest.targetAssetType} finding.`;
}

function reviewGradeMaterializationRuleLines(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  if (!materializationBindingDimensionApplies(manifest)) {
    return Object.freeze([] as const);
  }
  return Object.freeze([
    "- Compare worker_result_report.materializedFiles and product_materialization_manifest files to declared product-file targets.",
    "- Materialized product file rows use relativePath and absolutePath. When inspecting worker_result_report.materializedFiles or product_materialization_manifest.files, treat absolutePath as the filesystem path and relativePath as the workspace/tenant product path; do not require path, file, or outputFile fields on those rows before counting the generated asset as present.",
    "- If product_materialization_manifest.files[] or worker_result_report.materializedFiles[] contains an existing product-role file with matching obligation lineage, do not mark target_asset, source_asset, module, source_set, inline, aggregate, or requirement findings trace_missing for 'no generated asset named by report or manifest'. Continue evaluating semantic realization and public-boundary binding instead.",
    "- Mark boundary_collapsed or wrong_stage when worker_result_report.materializedFiles or product_materialization_manifest files list undeclared build/test byproducts or extra product files as materialized product truth.",
    "- Build outputs, dependency caches, lockfiles, target/, coverage, and transient byproducts are not product fulfillment unless declared product targets."
  ]);
}

function reviewGradeTargetAssetRuleLines(
  manifest: SdlcWorkerHandoffManifest
): readonly string[] {
  if (manifest.targetAssetType === "component_test_surface") {
    return Object.freeze([
      "- On component_test_surface, do not make admitted test-execution evidence a same-edge blocker when generated tests, lineage, and component-test carrier rows are present. If the only missing evidence is admitted execution_result/runtime_execution proof, mark those requirement findings partial with failureClass wrong_stage, repairSurfaceTriage.disposition=downstream_deferred, and requiredAction naming the later test-execution edge; when all open findings are this lawful downstream-deferred class, top-level status remains passed.",
      "- For component_test_surface, compare generated tests to accepted testcase/test-design authority and source responsibilities."
    ]);
  }
  return Object.freeze([] as const);
}

function reviewGradeEvaluationDimensions(
  manifest: SdlcWorkerHandoffManifest
): readonly SdlcEvaluationDimensionRef[] {
  return Object.freeze([
    evaluationDimension({
      promptFamily: "evaluate_review_grade",
      dimensionKey: "local-obligation-fulfillment",
      scope: "cell"
    }),
    evaluationDimension({
      promptFamily: "evaluate_review_grade",
      dimensionKey: "local-stage-boundary-conformance",
      scope: "cell"
    }),
    ...(materializationBindingDimensionApplies(manifest)
      ? [
          evaluationDimension({
            promptFamily: "evaluate_review_grade",
            dimensionKey: "materialization-binding-relation",
            scope: "relation"
          })
        ]
      : []),
    evaluationDimension({
      promptFamily: "evaluate_review_grade",
      dimensionKey: "obligation-coverage-fold",
      scope: "fold"
    })
  ]);
}

function compactObligationPromptLines(
  manifest: SdlcWorkerHandoffManifest,
  coverageTarget: "content_register" | "review_grade_assessment" =
    "review_grade_assessment",
  invocationScope?: SdlcReviewGradeInvocationScope | null | undefined
): readonly string[] {
  const obligationRefs =
    coverageTarget === "content_register"
      ? manifestObligationRefs(manifest)
      : reviewGradePromptObligationRefs(manifest, invocationScope);
  const coverageLaw =
    coverageTarget === "content_register"
      ? "- Coverage law: obligationRefs above are fold context only for this content register. Do not add reviewedObligationIds, findings, summary, status, or other assessment fields to sdlc_evaluate_content_register; represent semantic judgment only through permitted contentRows/evidenceRefs, and ABG folds coverage/closure from refs."
      : "- Review coverage law: reviewedObligationIds and findings must cover exactly every obligationRef above and no other obligation ids. Worker-report obligation IDs not listed above are evidence/carryover aliases only.";
  return Object.freeze([
    `- graphFunctionName: ${manifest.graphFunctionName}`,
    `- edgeName: ${manifest.edgeName}`,
    `- targetAssetType: ${manifest.targetAssetType}`,
    `- obligationCount: ${obligationRefs.length}`,
    `- obligationRefs: ${listForPrompt(obligationRefs)}`,
    coverageLaw
  ]);
}

function compactDesignDepthPromptLineGroups(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly manifestPath: string;
  readonly governanceRef: string;
  readonly governancePath: string;
  readonly constructionBriefPath: string;
  readonly invocationPackagePath: string;
  readonly workerReportPath: string;
  readonly workerReportSummaryLines: readonly string[];
  readonly contentRegisterPath: string;
  readonly registerProjectionPath: string;
  readonly subworkstreamManifestPath: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly tenantToolEnvironment?: SdlcTenantToolEnvironmentProjection;
}): EvaluatePromptLineGroups {
  return Object.freeze({
    preAuthorityLines: Object.freeze([
      "odd_sdlc evaluate.C/F_P design-depth register rule.",
      "",
      "Small fused evaluation grid mode:",
      "- Use the typed Evaluation grid contract below as the logical work boundary.",
      "- Decide only local design-depth and stage-conformance semantics for this transform unit.",
      "- Do not reconstruct global coverage, closure, continuation, or trace policy as a second SDLC. Coverage is a structural fold over refs; ABG owns close/block/redispatch.",
      "- This is evaluation work. Do not rewrite the ADR, source files, tests, package files, reports, ledgers, or product materialization outputs.",
      `- Durable evaluation artifact to create and validate: ${input.contentRegisterPath}`,
      `- Optional observation-only subworkstream manifest: ${input.subworkstreamManifestPath}`,
      "",
      "Admitted edge packet:",
      ...compactObligationPromptLines(input.manifest, "content_register"),
      "",
      "Tenant tool boundary:",
      ...tenantToolBoundaryPromptLines(input.tenantToolEnvironment),
      "- Tool-profile contract: obey the active tool list. If command execution is not exposed, inspect with bounded file reads/writes only. If command execution is exposed by the worker runtime, use it only for bounded workspace-relative read-only inspection or the named content-register update helper when this prompt permits it; do not run product, build, test, framework, traversal, or background commands.",
      "- Read boundary: use only workspace-relative paths or explicit workspace/run-archive paths named in this prompt; do not read/cite/copy sibling sandboxes, historical test_runs, home memory, /tmp, or outside-workspace absolute paths.",
      "- Read cap: every Read tool call over JSON, Markdown, report, manifest, or source artifacts must set limit <=80; inspect only the lines needed for the current register section."
    ]),
    postAuthorityLines: Object.freeze([
      "",
      "Read in order:",
      `1. compressed work-category governance (${input.governanceRef}): ${input.governancePath}`,
      `2. construction brief: ${input.constructionBriefPath}`,
      `3. pre-created draft content register: ${input.contentRegisterPath}`,
      "4. worker result summary below; inspect the worker report only for a named missing detail.",
      `5. bounded inspection of the ADR/output artifact: ${input.manifest.outputFile}; the framework has already written the draft register, so this read is allowed before the first semantic update.`,
      "",
      "Precomputed worker result report summary:",
      ...input.workerReportSummaryLines.map((line) => `- ${line}`),
      "",
      "Hard bounds:",
      `- Do not use the Read tool on the handoff manifest (${input.manifestPath}); selected edge facts are in this prompt.`,
      `- Do not inspect ${input.workerReportPath} or ${input.invocationPackagePath} before the first semantic update unless a named missing detail requires it.`,
      "- The first evaluator update after reading the draft register and ADR must write semantic rows; do not spend the first pass gathering exhaustive context.",
      "- Prefer one compact complete write for a small fused grid. If uncertain, write partial/blocked verdict axes with reasons instead of hidden synthesis.",
      "- Do not print full files, full JSON objects, full ADR tables, requirement tables, or source files to stdout.",
      "- Do not write EvaluationFinding rows into the content register. The grid's expected finding refs are prompt-sidecar and ABG-fold refs, not contentRows[].",
      "",
      "Required content-register envelope:",
      "- kind: \"sdlc_evaluate_content_register\"",
      "- registerVersion: \"ts-evaluate-content-register-v1\"",
      "- stage: \"evaluate.C\"",
      `- ruleRef: "${DESIGN_DEPTH_FP_EVALUATOR_RULE_REF}"`,
      "- ruleRole: \"semantic_judgment\"",
      "- computeMeans: \"F_P\"",
      "- authorityFunction: \"synthesize_model\"",
      `- selectedCompositionRef: "${input.selectedCompositionRef}"`,
      `- selectedCompositionDigest: "${input.selectedCompositionDigest}"`,
      `- selectedCompositionSelectionRef: "${input.selectedCompositionSelectionRef}"`,
      `- selectedRegimeBindingRef: ${input.selectedRegimeBindingRef === null ? "null" : JSON.stringify(input.selectedRegimeBindingRef)}`,
      `- compositionContributionRef: "${input.selectedRegimeBindingRef ?? input.selectedCompositionRef}"`,
      "- sourceBasisRefs[], candidateArtifactRefs[], evidenceRefs[], contentRows[].",
      "- Top-level key set is exactly kind, registerVersion, stage, ruleRef, ruleRole, computeMeans, authorityFunction, selectedCompositionRef, selectedCompositionDigest, selectedCompositionSelectionRef, selectedRegimeBindingRef, compositionContributionRef, sourceBasisRefs, candidateArtifactRefs, evidenceRefs, contentRows. Do not add reviewedObligationIds, findings, summary, status, or assessment fields to this register.",
      "- contentRows[] entries have exactly kind, rowRef, authorityFunction, carrierFamily, contentKind, payload, sourceBasisRefs, evidenceRefs.",
      `- Preferred contentKind: "${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND}". Optional final contentKind: "sdlc_design_depth_register".`,
      "- Forbidden contentKind values in this register include \"sdlc_evaluation_finding\" and any grid/fold finding row. Do not use carrierFamily values outside ProductAssetModel, ObservationSnapshot, GapPressureRow, EdgeFulfillment, EdgeClosureDecision, or NextActionProjection.",
      "",
      "Fragment row contract:",
      "- payload.kind: \"sdlc_design_depth_register_fragment\"",
      "- payload.fragmentVersion: \"ts-design-depth-fragment-v1\"",
      "- payload.targetAssetType: \"implementation_design_surface\"",
      `- payload.section is one of ${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS.join(", ")}`,
      "- payload.sequence is positive; payload.mergeMode is \"replace\"; payload.value is the section value.",
      "- For the small fused grid, produce one semantic row for every listed section, or one full sdlc_design_depth_register row if the complete register is already available.",
      "",
      "Design-depth register minimum:",
      "- registerVersion/modelVersion/sequenceVersion/verdictVersion: \"ts-design-depth-v1\" where applicable.",
      "- Include stackProfileRows, implementationModuleRows, aggregateDomainModelRows, moduleSchemaFragments, moduleStateDiagramFragments, aggregateDomainModel, sunnyDaySequenceRows, aggregateSunnyDaySequence, componentTopologyRows, componentRealizationRows, fileTargetRows, designCompletenessVerdict.",
      "- stackProfileRows[] rows are closed objects with exactly kind, stackRef, language, buildTool. Never emit field, value, sourceRef, packageManager, runtime, dependencyPolicy, or note fields in stackProfileRows.",
      "- implementationModuleRows[]: kind, moduleName, moduleRef. aggregateDomainModelRows[]: kind, modelRef. sunnyDaySequenceRows[]: kind, sequenceRef. fileTargetRows[]: kind, relativePath, role.",
      "- aggregateDomainModelRows[].kind must be exactly \"sdlc_aggregate_domain_model_row\"; never emit \"sdlc_aggregate_domain_model_ref_row\" or any other ref-row alias.",
      "- moduleSchemaFragments[]: kind \"sdlc_module_schema_fragment\", moduleName, entities, operations, requirementIds, sourceAssetRefs.",
      "- moduleSchemaFragments[].entities[]: kind \"sdlc_domain_entity\", entityId, moduleName, ownership, attributes, invariants, sourceAssetRefs. Never emit kind \"sdlc_entity_row\".",
      "- A trivial executable still needs one minimal owned entity when a module state diagram is emitted; use accepted observable product vocabulary such as entity:<module>.observable_output with one scalar attribute for stdout/message/output rather than an empty entity list plus a null state entity.",
      "- sdlc_domain_entity.attributes[]: kind \"sdlc_domain_attribute\", attributeId, name, valueType, cardinality, invariantRefs. Never emit kind \"sdlc_attribute_row\".",
      "- moduleSchemaFragments[].operations[] and aggregateDomainModel.operations[]: kind \"sdlc_domain_operation\", operationId, moduleName, inputEntityIds, outputEntityIds, requiredAttributeIds. Never emit kind \"sdlc_operation_row\".",
      `- Entity ownership values are exactly ${SDLC_DOMAIN_ENTITY_OWNERSHIP.join(", ")}; never emit primary, internal, external, local, or source. Attribute cardinality values are exactly ${SDLC_DOMAIN_ATTRIBUTE_CARDINALITIES.join(", ")}.`,
      "- Attribute cardinality is SDLC schema multiplicity only. Do not use product-domain morphism values such as 1:1, N:1, 1:N, M:N, 0..1, 1..1, or 0..* in sdlc_domain_attribute.cardinality; encode those product cardinality concepts in valueType, name, invariantRefs, operations, or verdict reasons.",
      "- moduleStateDiagramFragments[]: kind \"sdlc_module_state_diagram_fragment\", moduleName, entityId, stateless, states, transitions, requirementIds, sourceAssetRefs. entityId is a required non-empty string, never null, and must reference a moduleSchemaFragments[].entities[].entityId for that module. For a stateless trivial executable, set stateless:true and states/transitions:[] while still referencing the minimal observable-output entity.",
      "- moduleStateDiagramFragments[].transitions[] has exactly kind, transitionId, fromState, toState, operationId, entityId. Never emit trigger, event, condition, action, summary, or description on a transition; encode the cause as an operationId that references moduleSchemaFragments[].operations[].operationId.",
      "- aggregateDomainModel: kind \"sdlc_aggregate_domain_model\", modelVersion, entities, operations, crossModuleReferences, evidenceRefs. Aggregate entities: kind \"sdlc_aggregate_domain_entity\", entityId, ownerModuleName, attributes, sourceModuleNames. crossModuleReferences rows have fromModuleName, toModuleName, entityId.",
      "- aggregateSunnyDaySequence: kind \"sdlc_aggregate_sunny_day_sequence\", sequenceVersion \"ts-design-depth-v1\", steps, evidenceRefs.",
      "- aggregateSunnyDaySequence.steps[]: kind \"sdlc_sunny_day_sequence_step\", stepId, moduleName, operationId, inputEntityIds, outputEntityIds, stateTransitionIds. Never emit kind \"sdlc_sunny_day_step\".",
      "- componentTopologyRows[]: kind, componentId, moduleName, relativePath, publicBoundary, concernRole, requirementIds, sourceAssetRefs.",
      `- componentTopologyRows[].concernRole values are exactly ${SDLC_COMPONENT_CONCERN_ROLES.join(", ")}.`,
      "- componentRealizationRows[]: kind, componentId, moduleName, relativePath, publicBoundary, trancheId, firstProductFileToChange, upstreamComponentIds, requirementIds, sourceAssetRefs. trancheId is string or null; if using an ordinal tranche emit \"1\", never numeric 1.",
      "- For a trivial product, keep one module and one source component unless accepted authority names separate source files or a hard boundary.",
      "- componentTopologyRows[] and componentRealizationRows[] must use source-role product paths only; every component relativePath must match a source-role fileTargetRows entry.",
      "- Keep fileTargetRows to declared product targets. Do not add authority, spec, ADR, cache, target/, build output, or proof byproduct paths as product targets.",
      "- Preserve executable/script/service entrypoint obligations in publicBoundary and verdict reasons.",
      "- Use accepted product vocabulary for entity, operation, attribute, component, and sequence ids; do not substitute generic input/output/result names.",
      "- designCompletenessVerdict has exactly kind, verdictVersion, entity, attribute, flow. Each axis object has exactly kind \"sdlc_design_completeness_axis_verdict\", axis, status, reasons, evidenceRefs; status is satisfied, partial, or blocked.",
      "- Closed nested rows must be objects, not strings. Use kind-bearing objects for entities, attributes, operations, transitions, aggregate entities, and sunny-day steps.",
      "- For a small product, keep schema/domain/sequence compact: no more than two entities and two operations per module unless authority requires more.",
      "",
      "Self-check before final response:",
      "- Re-open the content register with bounded Read and verify valid JSON, exact top-level key set, selected identity preservation, row key sets, all required sections, matching component/file paths, and compact size.",
      "- Reject and rewrite if any design-depth row contains field/value/sourceRef summary triples or any key outside the exact row contracts above.",
      "- Reject and rewrite if aggregateDomainModelRows[].kind is sdlc_aggregate_domain_model_ref_row; the only admitted row kind there is sdlc_aggregate_domain_model_row.",
      "- Reject and rewrite if any designCompletenessVerdict axis object has kind sdlc_design_completeness_axis, sdlc_verdict_axis, or any value other than sdlc_design_completeness_axis_verdict.",
      "- Reject and rewrite if any nested row kind is sdlc_entity_row, sdlc_attribute_row, sdlc_operation_row, or sdlc_sunny_day_step; the accepted nested kinds are sdlc_domain_entity, sdlc_domain_attribute, sdlc_domain_operation, sdlc_entity_state_transition, sdlc_aggregate_domain_entity, and sdlc_sunny_day_sequence_step.",
      "- Rewrite until valid. Final response is one compact line; the content register file is the evaluation truth."
    ])
  });
}

function compactReviewGradePromptLineGroups(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly invocationScope?: SdlcReviewGradeInvocationScope | null | undefined;
  readonly governanceRef: string;
  readonly governancePath: string;
  readonly constructionBriefPath: string;
  readonly invocationPackagePath: string;
  readonly workerReportPath: string;
  readonly assessmentPath: string;
  readonly subworkstreamManifestPath: string;
  readonly tenantToolEnvironment?: SdlcTenantToolEnvironmentProjection;
}): EvaluatePromptLineGroups {
  return Object.freeze({
    preAuthorityLines: Object.freeze([
      "odd_sdlc evaluate.C/F_P review-grade edge fulfillment rule.",
      "",
      "Small fused evaluation grid mode:",
      "- Use the typed Evaluation grid contract below as the logical work boundary.",
      "- Decide local obligation fulfillment and local stage-boundary conformance for this transform unit.",
      ...reviewGradePreAuthoritySpecializationLines(input.manifest),
      "- Do not reconstruct global coverage, closure, continuation, or trace policy as a second SDLC. Coverage is a structural fold over refs; ABG owns close/block/redispatch.",
      "- This is semantic evaluation work. Do not rewrite source, tests, design artifacts, reports, ledgers, package files, or framework files.",
      `- The only durable JSON output you may create or modify is the assessment artifact at ${input.assessmentPath}.`,
      `- Optional observation-only subworkstream manifest: ${input.subworkstreamManifestPath}.`,
      "",
      "Admitted edge packet:",
      ...compactObligationPromptLines(
        input.manifest,
        "review_grade_assessment",
        input.invocationScope
      ),
      "",
      "Tenant tool boundary:",
      ...tenantToolBoundaryPromptLines(input.tenantToolEnvironment),
      "- Tool-profile contract: obey the active tool list. If command execution is not exposed, inspect with bounded file reads/writes only. If command execution is exposed by the worker runtime, use it only for bounded workspace-relative read-only inspection unless this prompt explicitly names an execution probe; do not run product, build, test, framework, traversal, background, or mutation commands.",
      "- Read cap: every Read tool call over JSON, Markdown, report, manifest, or source artifacts must set limit <=80; inspect only the lines needed for the current finding."
    ]),
    postAuthorityLines: Object.freeze([
      "",
      "Read in order:",
      `1. compressed work-category governance (${input.governanceRef}): ${input.governancePath}`,
      `2. construction brief: ${input.constructionBriefPath}`,
      `3. invocation package: ${input.invocationPackagePath}`,
      `4. worker result report: ${input.workerReportPath}`,
      reviewGradeGeneratedArtifactReadLine(input.manifest),
      "6. accepted design-depth/component refs named by the construction brief when present.",
      "",
      "Reading discipline:",
      "- Do not print full files, full JSON objects, full requirement tables, or full source files to stdout.",
      "- Terminal output is a work trace. The assessment JSON is the evaluation truth.",
      "- Do not issue parallel tool calls, helper-output debugging, background jobs, product execution, build, test, framework, or traversal commands.",
      "- If command execution is unavailable, evaluate execution requirements only from admitted execution evidence. Missing later test/runtime proof is wrong_stage when the current edge declared no test/execution target.",
      "",
      "Required assessment envelope:",
      "- kind: \"sdlc_review_grade_edge_fulfillment_assessment\"",
      "- assessmentVersion: \"ts-review-grade-v1\"",
      `- graphFunctionName: ${JSON.stringify(input.manifest.graphFunctionName)}`,
      `- edgeName: ${JSON.stringify(input.manifest.edgeName)}`,
      `- targetAssetType: ${JSON.stringify(input.manifest.targetAssetType)}`,
      "- status: \"passed\" or \"blocked\"",
      "- reviewedObligationIds: exactly the obligationRefs in the admitted edge packet above. For scoped runs, reviewedObligationIds are exactly invocationPackage.inlineObligationIds and no worker aliases.",
      "- worker_result_report.obligationAssessments may support evidence and rationale, but it cannot enlarge review scope or create findings for generated-artifact requirement aliases.",
      "- findings[]: one finding per reviewed obligation id.",
      "- evidenceRefs: refs for assessment, generated assets, accepted authority, and review evidence.",
      "- summary: one compact sentence.",
      reviewGradeOptionalObservationFieldLine(input.manifest),
      "",
      "Finding shape:",
      "- kind: \"sdlc_review_grade_obligation_finding\"",
      "- obligationId: exact obligation id",
      "- fulfillmentStatus: fulfilled, partial, blocked, or unassessed",
      "- failureClass: null when fulfilled, otherwise trace_missing, semantic_not_realized, boundary_collapsed, wrong_stage, schema_invalid, execution_environment, or test_overlap_missing",
      "- requiredAction: null when fulfilled, otherwise the next concrete work item",
      "- evidenceRefs and acceptedAuthorityRefs: non-empty arrays",
      reviewGradeFindingFulfillmentBindingLine(input.manifest),
      "- repairSurfaceTriage: null when fulfilled; otherwise a sdlc_repair_surface_triage object classifying the lawful repair surface as current_edge_repair, upstream_reentry, downstream_deferred, or external_blocked",
      "- repairSurfaceTriage for upstream_reentry must name repairGraphFunctionRef, repairGraphVectorRef, and repairAssetRef; other dispositions may set those refs to null.",
      "- rationale: compact reason with three clauses: obligation intent paraphrase, artifact semantic review, and verdict. No extra finding keys.",
      "",
      "repairSurfaceTriage shape for non-fulfilled findings:",
      "- kind: \"sdlc_repair_surface_triage\"",
      "- disposition: current_edge_repair, upstream_reentry, downstream_deferred, or external_blocked",
      "- repairGraphFunctionRef, repairGraphVectorRef, repairAssetRef: non-null only when the lawful repair surface is an upstream graph/vector/asset re-entry",
      "- evidenceRefs: non-empty refs proving this triage",
      "- rationale: compact reason for this repair-surface classification",
      ...reviewGradeFulfillmentBindingShapeLines(input.manifest),
      "",
      "Review rules:",
      "- File existence, tags, digests, or smoke output are evidence, not proof by themselves.",
      "- For every finding, first paraphrase the accepted obligation intent from the admitted requirement/design/test/target-carrier authority, then compare the generated artifact's actual semantics against that intent, then state why the artifact fulfills or fails it.",
      "- A fulfilled finding is invalid when the rationale only cites existence, schema validity, digest, lineage, worker status, or manifest rows without saying what the artifact is supposed to do and how the artifact's content realizes that purpose.",
      "- For planning surfaces, review the plan as an artifact: decide whether its decisions, rows, cases, schedules, or bindings are sufficient to carry the obligation into the next lawful edge. Do not pass a planning artifact just because it names the next file or requirement.",
      "- SDLC depth is scenario/build-test driven: UAT/scenario authority and build/test observations are primary behavior proof; obligation mapping, carrier rows, lineage tags, and worker fulfilled counts are trace evidence only.",
      "- Mark trace_missing when a generated product file has no lineage in the asset, selected target carrier, worker report, or product materialization manifest.",
      "- Mark semantic_not_realized when behavior is absent, stubbed, placeholder, disconnected from the public boundary, or contradicts tenant stack authority.",
      ...reviewGradeComponentCodeRuleLines(input.manifest),
      "- Mark boundary_collapsed when generated source collapses accepted components back into a coarse facade.",
      ...reviewGradeTargetAssetRuleLines(input.manifest),
      ...reviewGradeMaterializationRuleLines(input.manifest),
      "- If all reviewed obligations are fulfilled, status must be passed and every finding failureClass/requiredAction must be null.",
      "- If every non-fulfilled finding is lawful downstream-deferred wrong_stage carryover with repairSurfaceTriage.disposition=downstream_deferred, status must be passed; ABG records that carryover and closes the current edge.",
      "- If any non-fulfilled finding is not lawful downstream-deferred carryover, status must be blocked and every non-fulfilled finding must include failureClass and requiredAction.",
      "",
      "Self-check before final response:",
      reviewGradeSelfCheckBindingLine(input.manifest),
      "- Rewrite until valid. Final response: reviewStatus=<passed|blocked> reviewed=<n> blocked=<n>."
    ])
  });
}

function declaredEvaluatePromptSections(input: {
  readonly promptFamily: Extract<
    SdlcPromptFamily,
    "evaluate_design_depth" | "evaluate_review_grade"
  >;
  readonly lineGroups: EvaluatePromptLineGroups;
  readonly fallbackPreconditionRef: string;
}): readonly SdlcPromptSectionConstructionInput[] {
  const authorityCompressionLines = [
    "Authority compression:",
    ...edgeAuthorityCompressionPromptLines()
  ];
  return Object.freeze([
    sdlcPromptSectionFromLines({
      role: "purpose",
      title: "evaluate purpose and local semantic boundary",
      textLines: Object.freeze(input.lineGroups.preAuthorityLines),
      intent:
        "State the evaluate.C purpose, read-only boundary, tool profile, and concrete output obligation for this edge.",
      authorityKindRefs: SDLC_PROMPT_NORMAL_AUTHORITY_KIND_REFS,
      expectedOutcome:
        "Evaluator receives the edge task without raw-bootstrap or runtime-forensic fallback as routine authority.",
      failureModeAddressed:
        "untyped evaluator prose, F_D semantic prescription, or routine fallback-authority over-read",
      appliesWhen: "evaluate.C prompt construction before authority compression"
    }),
    sdlcPromptSectionFromLines({
      role: "authority_packet",
      title: "authority compression",
      textLines: authorityCompressionLines,
      intent:
        "Declare normal authority order and bounded fallback conditions for unresolved provenance, import, intent, or forensic discrepancies.",
      authorityKindRefs: Object.freeze([
        ...SDLC_PROMPT_NORMAL_AUTHORITY_KIND_REFS,
        ...SDLC_PROMPT_BOUNDED_FALLBACK_AUTHORITY_KIND_REFS
      ]),
      fallbackPreconditionRefs: Object.freeze([input.fallbackPreconditionRef]),
      mode: "fallback",
      expectedOutcome:
        "Evaluator prefers compressed admitted authority and only inspects fallback surfaces for named unresolved discrepancies.",
      failureModeAddressed:
        "raw bootstrap over-read, intent-as-authority drift, or fallback authority used as routine prompt input",
      appliesWhen: "evaluate.C authority reconciliation"
    }),
    sdlcPromptSectionFromLines({
      role: "output_contract",
      title: "evaluate output contract and review rules",
      textLines: Object.freeze(input.lineGroups.postAuthorityLines),
      intent:
        "Render the ordered evidence packet, output schema, self-checks, and review rules for the admitted evaluate.C artifact.",
      authorityKindRefs: SDLC_PROMPT_NORMAL_AUTHORITY_KIND_REFS,
      expectedOutcome:
        "Evaluator writes only the contracted evaluation artifact with schema-valid findings and compact status output.",
      failureModeAddressed:
        "missing evaluation artifact, schema drift, stdout truth drift, or evaluator mutation of product/runtime authority",
      appliesWhen: "evaluate.C prompt construction after authority compression"
    })
  ]);
}

function designDepthFpEvaluatorPromptLineGroups(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly manifestPath: string;
  readonly governanceRef: string;
  readonly governancePath: string;
  readonly constructionBriefPath: string;
  readonly invocationPackagePath: string;
  readonly workerReportPath: string;
  readonly workerReportSummaryLines: readonly string[];
  readonly contentRegisterPath: string;
  readonly registerProjectionPath: string;
  readonly subworkstreamManifestPath: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly tenantToolEnvironment?: SdlcTenantToolEnvironmentProjection;
}): EvaluatePromptLineGroups {
  if (useCompactFusedEvaluationPrompt(input.manifest)) {
    return compactDesignDepthPromptLineGroups(input);
  }
  return Object.freeze({
    preAuthorityLines: Object.freeze([
      "odd_sdlc evaluate.C/F_P design-depth register rule.",
      "",
      "Purpose:",
      "- Populate the implementation design-depth content register as the highest semantic design-depth truth for downstream transforms.",
      "- Evaluate the workspace, admitted transform evidence, worker report, construction brief, invocation package, ADR artifact, and residual pressure together.",
      "- Treat depth as the priority F_P judgment: decide whether the component/module decomposition, source ownership, public boundaries, and residual pressure are proportionate to the requirements.",
      "- For each requirement or requirement group, decide whether it requires separable_public_boundary, shared_component, test_boundary, data_contract_boundary, runtime_or_persistence_boundary, human_review, or blocked handling. Encode that decision in component row publicBoundary/rationale text and designCompletenessVerdict reasons.",
      "- Domain vocabulary is authority-bound. Derive moduleSchemaFragments, aggregateDomainModel, aggregateSunnyDaySequence, component publicBoundary text, and operation/entity ids from product/ADR/scenario/requirement terms, not from the project slug, package name, file path, examples, or generic words such as input, output, mapping, result, parser, mapper, or validator.",
      "- If accepted authority names domain concepts such as entities, morphisms, cardinality, dot paths, routes, orders, ledgers, or other product nouns, the register must preserve those nouns in entity ids, operation ids, attributes, sequence steps, and verdict reasons. Generic substitute nouns are semantic underproduction.",
      "- If you cannot ground a register section in accepted product vocabulary, mark the relevant designCompletenessVerdict axis partial or blocked and cite the missing authority instead of filling a plausible generic model.",
      "- This is evaluation work. Do not rewrite the ADR, source files, tests, package files, or product materialization outputs.",
      "- You may use agent-internal subagents or parallel workstreams as read-only compute strategy for independent modules, interfaces, obligation slices, or evidence packets.",
      `- If you use evaluator subworkstreams, record them in ${input.subworkstreamManifestPath}. Rows must cite authority/dependency inputs, stay read-only over workspace/product files, and remain observation only.`,
      "- Evaluator subworkstreams do not emit ABG events, write ledgers, close edges, select traversal, publish consequence projections, or create ABG branch leases. The parent evaluate.C result owns the final content-register merge.",
      "- The content register path is the durable evaluation artifact; the task is not a single-shot JSON response.",
      `- The system pre-creates that path as a non-admitted draft with selected composition identity and one "${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_DRAFT_CONTENT_KIND}" row per register section. Your job is to convert draft rows into semantic "${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND}" rows incrementally.`,
      "",
      "Tenant tool boundary:",
      ...tenantToolBoundaryPromptLines(input.tenantToolEnvironment),
      "- Read boundary: use only workspace-relative paths or explicit workspace/run-archive paths named in this prompt; do not read/cite/copy sibling sandboxes, historical test_runs, home memory, /tmp, or outside-workspace absolute paths.",
      "- Tool-profile contract: obey the active tool list. If command execution is not exposed, inspect with bounded file reads/writes only. If command execution is exposed by the worker runtime, use it only for bounded workspace-relative read-only inspection or the named content-register update helper when this prompt permits it; do not run product, build, test, framework, traversal, or background commands.",
      "- Read cap: every Read tool call over JSON, Markdown, report, manifest, or source artifacts must set limit <=80; use offset/limit for bounded inspection and inspect only the lines needed for the current section."
    ]),
    postAuthorityLines: Object.freeze([
      "",
      "Read in order:",
    `1. compressed work-category governance (${input.governanceRef}): ${input.governancePath}`,
    `2. bounded inspection of construction brief: ${input.constructionBriefPath}`,
    `3. bounded inspection of the pre-created draft content register at ${input.contentRegisterPath}; preserve its top-level selected composition identity from the embedded selected identity values in this prompt if the file is large.`,
    `4. bounded inspection of the ADR/output artifact: ${input.manifest.outputFile}; the framework has already written the draft register, so this read is allowed before the first semantic update.`,
    "5. convert each draft row into a semantic design-depth fragment row from the construction brief, admitted transform evidence, the ADR/output artifact, and selected authority refs.",
    "",
    "Precomputed worker result report summary:",
    ...input.workerReportSummaryLines.map((line) => `- ${line}`),
    "",
    "Hard pre-register limits:",
    `- Do not use the Read tool on the handoff manifest (${input.manifestPath}). It is too large; selected manifest facts needed for this evaluation are projected into the prompt, construction brief, and worker summary.`,
    `- Do not inspect the worker result report (${input.workerReportPath}) before the first evaluator update. Its compact summary is already in this prompt.`,
    `- Do not use the Read tool on the worker invocation package (${input.invocationPackagePath}) before the first evaluator update. Selected invocation pressure is already in the construction brief and worker summary.`,
    "- Before the first evaluator update, do not inspect extra authority files beyond the governance doc, construction brief, draft content register, and ADR/output artifact named above.",
    "- The first evaluator content-register update must be your selected evaluate.C/F_P judgment from the draft register plus ADR/output artifact. Do not spend the first pass gathering exhaustive context.",
    "- Do not run a worker-result-report discovery script before the first evaluator update.",
    "- Do not run any bounded-summary action before the first evaluator update. After reading the governance doc, construction brief, and draft content register, the next tool action must publish the content register update.",
    "- Do not say you are writing the register until that file write has succeeded.",
    `- First-update carrier helper contract: ${DESIGN_DEPTH_DRAFT_FRAGMENT_UPDATE_HELPER_CONTRACT_REF} (${DESIGN_DEPTH_DRAFT_FRAGMENT_UPDATE_HELPER_CONTRACT_PATH}).`,
    "- The helper contract is authority-neutral carrier mechanics: same-path temp-then-rename publication, selected composition preservation, non-draft fragment envelope construction, and compact row counts only. It emits no semantic section values.",
    "- Bounded local automation may support summarization, JSON validation, and that named carrier-helper contract only. Do not deterministically construct later semantic register rows from framework rules.",
    "",
    "First register materialization rule:",
    "- After reading the governance doc and construction brief, update the pre-created content register file directly as the selected evaluate.C/F_P semantic pressure map.",
    "- Use admitted upstream design surfaces, dependency pressure, product file targets, tenant stack authority, worker report summary, and specific authority refs as the basis.",
    "- Do not copy a framework-generated register skeleton as semantic truth. If a section is uncertain, emit a partial or blocked axis with explicit reasons and evidence refs instead of inventing rows.",
    `- The content register carries ProductAssetModel rows. Use contentKind "${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND}" rows for incremental section writes while you build the register.`,
    "- F_D assembles admitted fragment rows, sorted by payload.sequence, into the legacy register projection. A final full contentKind \"sdlc_design_depth_register\" row is also valid when the complete register is already available.",
    `- Do not write the legacy projection path directly: ${input.registerProjectionPath}`,
    "- The first register can be compact; after it exists, iterate only if validation fails or a specific axis is partial/blocked.",
    "- After the first register exists, perform a mandatory bounded target-path reconciliation pass against the transform artifact and any source authority refs that explicitly name product files.",
    "- In that reconciliation pass, compare fileTargetRows[].relativePath, componentTopologyRows[].relativePath, componentRealizationRows[].relativePath, and firstProductFileToChange against the transform artifact Product File Targets / Component rows and explicit source-authority file paths.",
    "- During target-path reconciliation, read only the Product File Targets table's file/path cells or explicit declared product-target rows for fileTargetRows. Do not scrape source refs, authority refs, tech-stack/spec docs, ADR/design refs, or scenario refs into fileTargetRows merely because their paths appear near the table.",
    "- If those sources name exact product paths, the final register must preserve those exact paths unless an admitted later authority supersedes them; do not shorten, normalize away source directories, or invent sibling paths.",
    "- If the transform artifact and source authority disagree on a target path, cite both refs and choose the path required by the highest source authority. If the conflict cannot be resolved, emit a blocked designCompletenessVerdict axis instead of guessing.",
    "Reading discipline:",
    "- Do not print, cat, tail, grep, or paste full authority files into stdout.",
    "- Do not print full ADR sections, markdown tables, requirement-lineage tables, product-file tables, or component-topology tables into stdout.",
    "- Do not display worker_invocation_package.json, requirement tables, authority ref arrays, evidence arrays, or full JSON objects in the terminal.",
    "- Do not use command helpers to display the five primary inputs unless the active tool list explicitly exposes command execution.",
    "- If JSON or Markdown inspection is needed when command execution is unavailable, use Read offset/limit and inspect only bounded line ranges.",
    "- Keep terminal output bounded and purposeful. Stdout is an agent work trace, not evaluation truth.",
    "- The content register file is the evaluation surface. Prefer file writes and bounded self-check reads over terminal narration.",
    "",
    "Agentic F_P work loop:",
    "- After the first evaluator update exists, write a short plan and checklist for the required register sections.",
    "- Execute the plan incrementally: each iteration should complete one register section or one small cluster of related sections, then overwrite the same content register with accumulated rows.",
    "- Do not announce, plan, or attempt a full semantic register write in one action after the first update. A hidden full-register synthesis pass violates the content-register visibility contract.",
    "- After the first update, every exploratory read must be paired with the next tool action that writes at least one named non-empty or explicitly blocked register section back to the same content register file.",
    "- The preferred order is stackProfileRows, implementationModuleRows, componentTopologyRows, fileTargetRows, componentRealizationRows, moduleSchemaFragments, moduleStateDiagramFragments, aggregateDomainModelRows, aggregateDomainModel, sunnyDaySequenceRows, aggregateSunnyDaySequence, designCompletenessVerdict.",
    "- When reading the transform ADR after the first update, read only the authority a given section needs and do not print it; then write that section to the register file. How you inspect the authority is your choice; the framework prescribes the carrier schema and the visibility contract, not the extraction method.",
    "- Time budget is part of correctness: update the draft content register before doing deep exploratory review.",
    "- After the governance doc, construction brief, and draft content register are read, write the first evaluator update before any ADR summary, worker-report inspection, source-authority lookup, or deep exploratory action.",
    `- First evaluator update: publish one semantic "${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND}" row for each pre-seeded draft section. The named carrier helper may build the envelope, but the row values are your evaluation and must be your selected evaluate.C/F_P judgment. Emit null or [] only for whole intentionally empty sections and partial/blocked verdict axes where authority is not yet sufficient; do not emit null inside required scalar fields.`,
    "- There is no framework-authored recipe for deriving register rows from authority: do not parse ADR tables by a fixed procedure, read the authority a section needs and decide that section content yourself.",
    "- The first update must satisfy the named helper contract or an equivalent implementation. F_D seeds the draft scaffolding and admits/projects fragment rows; F_D does not construct semantic register rows for you.",
    "- Then iterate by editing the content register file in place: inspect only the authority needed for a specific missing/partial section, add or replace the corresponding section row, then validate the file.",
    "- The next tool action after any post-first-update ADR or authority inspection must write the corresponding section row. Do not collect multiple large sections before writing.",
    "- A valid progress write may be intentionally partial or blocked, but it must replace the target section row with explicit value, evidenceRefs, and reasons instead of leaving the run in hidden synthesis.",
    "- Do not spend the run enumerating every requirement id before writing the register. Use worker_result_report counts and high-signal samples for pressure; full trace remains in admitted evidence refs and source authority surfaces.",
    "- If time or authority is insufficient, still write a structurally valid content register with partial or blocked designCompletenessVerdict axes and explicit reasons. Draft-row timeout is worse than an admitted pressure map with honest residual pressure.",
    "- It is acceptable to rewrite the content register multiple times while converging. Do not treat this as a single-shot generation task.",
    "- Use only the active tool profile. When command execution is not available, summarize authority by bounded Read ranges and validate shape by bounded self-check reads; do not paste large source or register bodies into stdout.",
    "- Command-helper output budget before first evaluator update: if the active tool profile exposes command helpers, the only pre-update helper allowed is the named carrier-helper update or equivalent same-path temp-then-rename implementation, and it may print only compact row counts.",
    "- If the component/module set is uncertain, encode the uncertainty in partial or blocked designCompletenessVerdict axes and continue with the smallest truthful pressure map.",
    "- If a referenced authority corpus is large, sample the headings/tables needed for module boundaries and requirement ids; do not dump the corpus into the terminal.",
    "- Final response is irrelevant unless the content register exists and validates. Prioritize writing and validating the file over narrative.",
    "",
    `Durable evaluation artifact to create and validate: ${input.contentRegisterPath}`,
    "",
    "Required content register shape:",
    "- kind: \"sdlc_evaluate_content_register\"",
    "- registerVersion: \"ts-evaluate-content-register-v1\"",
    "- stage: \"evaluate.C\"",
    `- ruleRef: "${DESIGN_DEPTH_FP_EVALUATOR_RULE_REF}"`,
    "- ruleRole: \"semantic_judgment\"",
    "- computeMeans: \"F_P\"",
    "- authorityFunction: \"synthesize_model\"",
    `- selectedCompositionRef: "${input.selectedCompositionRef}"`,
    `- selectedCompositionDigest: "${input.selectedCompositionDigest}"`,
    `- selectedCompositionSelectionRef: "${input.selectedCompositionSelectionRef}"`,
    `- selectedRegimeBindingRef: ${input.selectedRegimeBindingRef === null ? "null" : JSON.stringify(input.selectedRegimeBindingRef)}`,
    `- compositionContributionRef: "${input.selectedRegimeBindingRef ?? input.selectedCompositionRef}"`,
    "- sourceBasisRefs[], candidateArtifactRefs[], evidenceRefs[], contentRows[].",
    "- contentRows[] are the incremental register rows. Each row must be a closed carrier with exactly kind, rowRef, authorityFunction, carrierFamily, contentKind, payload, sourceBasisRefs, evidenceRefs.",
    "- contentRows[].kind: \"sdlc_evaluate_content_register_row\"",
    "- contentRows[].rowRef: a stable non-empty ref such as \"content-register-row://odd-sdlc/design-depth/<edgeName>/<section>/<sequence>\"",
    "- contentRows[].authorityFunction: \"synthesize_model\"",
    "- contentRows[].carrierFamily: \"ProductAssetModel\"",
    `- Preferred incremental contentRows[].contentKind: "${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND}"`,
    "- Optional final contentRows[].contentKind: \"sdlc_design_depth_register\" when payload is the full design-depth register object below.",
    "- contentRows[].sourceBasisRefs[] must cite the construction brief, governance doc, and any bounded authority inspected for this row.",
    "- contentRows[].evidenceRefs[] must cite the ADR/transform artifact or other admitted evidence supporting this row.",
    "",
    "Incremental fragment payload shape:",
    "- kind: \"sdlc_design_depth_register_fragment\"",
    "- fragmentVersion: \"ts-design-depth-fragment-v1\"",
    "- targetAssetType: \"implementation_design_surface\"",
    `- section: one of ${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS.join(", ")}`,
    "- sequence: positive integer; use increasing numbers so F_D can project the register deterministically.",
    "- mergeMode: \"replace\"",
    "- value: the exact value for that register section, for example the array for componentTopologyRows or null/object for aggregateDomainModel.",
    "- Multiple writes should preserve prior rows and replace or append the section row being advanced. The final admitted register may contain many fragment rows.",
    "- F_D projects fragment rows only after the register contains at least one fragment for every listed register section; emit null or an empty array explicitly for intentionally empty sections.",
    `- F_D ignores "${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_DRAFT_CONTENT_KIND}" rows and ignores rowRefs beginning "content-register-row-draft://"; draft rows are scaffolding only, not projectable semantic truth.`,
    "",
    "Embedded ProductAssetModel payload shape:",
    "- kind: \"sdlc_design_depth_register\"",
    "- registerVersion: \"ts-design-depth-v1\"",
    "- targetAssetType: \"implementation_design_surface\"",
    "- stackProfileRows[] with kind \"sdlc_stack_profile_row\", stackRef, language, buildTool",
    "- stackProfileRows[].language and stackProfileRows[].buildTool are required scalar strings when a stack row is emitted. Derive them from tenant stack authority such as TECH_STACK/TESTING_TECH_STACK, construction brief authority refs, or admitted ADR stack-profile facts, not from hidden evaluator defaults.",
    "- Do not emit null or objects for required scalar fields. If stack authority is not yet sufficient in an incremental update, emit an empty stackProfileRows section or a partial/blocked designCompletenessVerdict axis with explicit reasons, then repair the section after reading the bounded authority. Never publish a schema-invalid stack row such as buildTool:null.",
    "- implementationModuleRows[] with kind \"sdlc_implementation_module_row\", moduleName, moduleRef",
    "- aggregateDomainModelRows[] with kind \"sdlc_aggregate_domain_model_row\", modelRef",
    "- aggregateDomainModelRows[].kind must be exactly \"sdlc_aggregate_domain_model_row\"; never emit \"sdlc_aggregate_domain_model_ref_row\" or any other ref-row alias.",
    "- moduleSchemaFragments[] with kind \"sdlc_module_schema_fragment\", moduleName, entities, operations, requirementIds, sourceAssetRefs",
    "- moduleSchemaFragments[].entities[] is empty only when no moduleStateDiagramFragments[] row is emitted for that module; if a diagram row is present, it must point at a concrete entity.",
    "- moduleStateDiagramFragments[] with kind \"sdlc_module_state_diagram_fragment\", moduleName, entityId, stateless, states, transitions, requirementIds, sourceAssetRefs",
    "- moduleStateDiagramFragments[].entityId is required scalar string, never null. For stateless trivial executables, reference a minimal owned observable-output entity and set stateless:true with empty states/transitions.",
    "- aggregateDomainModel with kind \"sdlc_aggregate_domain_model\", modelVersion, entities, operations, crossModuleReferences, evidenceRefs",
    `- aggregateDomainModel.modelVersion must be exactly "ts-design-depth-v1".`,
    "- sunnyDaySequenceRows[] with kind \"sdlc_sunny_day_sequence_row\", sequenceRef",
    "- aggregateSunnyDaySequence with kind \"sdlc_aggregate_sunny_day_sequence\", sequenceVersion, steps, evidenceRefs",
    `- aggregateSunnyDaySequence.sequenceVersion must be exactly "ts-design-depth-v1".`,
    "- componentTopologyRows[] with kind \"sdlc_component_topology_row\", componentId, moduleName, relativePath, publicBoundary, concernRole, requirementIds, sourceAssetRefs",
    "- componentRealizationRows[] with kind \"sdlc_component_realization_row\", componentId, moduleName, relativePath, publicBoundary, trancheId, firstProductFileToChange, upstreamComponentIds, requirementIds, sourceAssetRefs. trancheId is string or null; if using an ordinal tranche emit \"1\", never numeric 1.",
    "- fileTargetRows[] with kind \"sdlc_file_target_row\", relativePath, role",
    "- designCompletenessVerdict with kind \"sdlc_design_completeness_verdict\", verdictVersion, entity, attribute, and flow axis verdicts.",
    "- designCompletenessVerdict is a closed object with exactly kind, verdictVersion, entity, attribute, flow. Do not emit entityAxis, attributeAxis, flowAxis, axisVerdicts, or any extra designCompletenessVerdict fields.",
    "- Each designCompletenessVerdict axis object is closed with exactly kind \"sdlc_design_completeness_axis_verdict\", axis, status, reasons, evidenceRefs. Do not add summaries, scores, counts, confidence, coverage, missingItems, or nested axis-specific objects.",
    "- Reject and rewrite before final output if any designCompletenessVerdict axis object has kind \"sdlc_verdict_axis\"; that alias is invalid and blocks admission.",
    `- Allowed componentTopologyRows[].concernRole values: ${SDLC_COMPONENT_CONCERN_ROLES.join(", ")}`,
    `- Allowed designCompletenessVerdict.*.status values: ${SDLC_DESIGN_COMPLETENESS_STATUSES.join(", ")}. Use "satisfied" for a complete axis; never use "complete".`,
    "",
    "Nested closed-object contract:",
    "- Do not use string shorthand for typed rows. An array of strings is only valid for fields whose name ends in Ids, Refs, Names, states, reasons, evidenceRefs, sourceAssetRefs, inputEntityIds, outputEntityIds, requiredAttributeIds, invariantRefs, or stateTransitionIds, or the exact sdlc_domain_entity.invariants field.",
    "- moduleSchemaFragments[].entities[] must contain closed sdlc_domain_entity objects with kind, entityId, moduleName, ownership, attributes, invariants, sourceAssetRefs.",
    "- sdlc_domain_entity.invariants must be a string array of compact invariant statements or invariant refs. Structured invariant objects are invalid; put detailed support in evidenceRefs, invariantRefs, or designCompletenessVerdict.reasons instead.",
    "- sdlc_domain_entity.attributes[] must contain closed sdlc_domain_attribute objects with kind, attributeId, name, valueType, cardinality, invariantRefs.",
    "- sdlc_domain_attribute.cardinality is SDLC schema multiplicity only: exactly one, optional, or many. Product-domain morphism cardinalities such as 1:1, N:1, 1:N, M:N, 0..1, 1..1, and 0..* are invalid in this field; preserve those domain concepts in valueType, name, invariantRefs, operations, or designCompletenessVerdict.reasons.",
    "- moduleSchemaFragments[].operations[] and aggregateDomainModel.operations[] must contain closed sdlc_domain_operation objects with kind, operationId, moduleName, inputEntityIds, outputEntityIds, requiredAttributeIds.",
    "- If moduleStateDiagramFragments[] is non-empty, every diagram entityId must be a non-null string matching an emitted module entity id; never write entityId:null for stateless diagrams.",
    "- moduleStateDiagramFragments[].transitions[] must contain closed sdlc_entity_state_transition objects with kind, transitionId, fromState, toState, operationId, entityId.",
    "- moduleStateDiagramFragments[].transitions[] must never contain trigger, event, condition, action, summary, or description; transition cause belongs in operationId only.",
    "- aggregateDomainModel.entities[] must contain closed sdlc_aggregate_domain_entity objects with kind, entityId, ownerModuleName, attributes, sourceModuleNames.",
    "- aggregateDomainModel.entities[].attributes[] must contain full closed sdlc_domain_attribute objects. Copy or adapt the owning module schema attribute objects; never emit attribute id strings, names, or summaries in this array. If no valid aggregate attributes are needed, use an empty array.",
    "- aggregateDomainModel.crossModuleReferences[] must contain closed objects with fromModuleName, toModuleName, entityId.",
    "- aggregateSunnyDaySequence.steps[] must contain closed sdlc_sunny_day_sequence_step objects with kind, stepId, moduleName, operationId, inputEntityIds, outputEntityIds, stateTransitionIds.",
    `- designCompletenessVerdict must include exactly kind, verdictVersion, entity, attribute, flow. The entity/attribute/flow values must be closed axis verdict objects with exactly kind, axis, status, reasons, evidenceRefs. verdictVersion must be exactly "ts-design-depth-v1". Axis status must be satisfied, partial, or blocked.`,
    "",
    "Minimal nested examples:",
    "- entity: {\"kind\":\"sdlc_domain_entity\",\"entityId\":\"entity:<module>.<name>\",\"moduleName\":\"<module>\",\"ownership\":\"owned\",\"attributes\":[{\"kind\":\"sdlc_domain_attribute\",\"attributeId\":\"attr:<module>.<name>.<field>\",\"name\":\"<field>\",\"valueType\":\"string\",\"cardinality\":\"one\",\"invariantRefs\":[]}],\"invariants\":[],\"sourceAssetRefs\":[\"file://...\"]}",
    "- operation: {\"kind\":\"sdlc_domain_operation\",\"operationId\":\"operation:<module>.<verb>\",\"moduleName\":\"<module>\",\"inputEntityIds\":[],\"outputEntityIds\":[\"entity:<module>.<name>\"],\"requiredAttributeIds\":[]}",
    "- aggregate entity: {\"kind\":\"sdlc_aggregate_domain_entity\",\"entityId\":\"entity:<module>.<name>\",\"ownerModuleName\":\"<module>\",\"attributes\":[{\"kind\":\"sdlc_domain_attribute\",\"attributeId\":\"attr:<module>.<name>.<field>\",\"name\":\"<field>\",\"valueType\":\"string\",\"cardinality\":\"one\",\"invariantRefs\":[]}],\"sourceModuleNames\":[\"<module>\"]}",
    "- transition: {\"kind\":\"sdlc_entity_state_transition\",\"transitionId\":\"transition:<module>.<from>.<to>\",\"fromState\":\"<from>\",\"toState\":\"<to>\",\"operationId\":\"operation:<module>.<verb>\",\"entityId\":\"entity:<module>.<name>\"}",
    "- sequence step: {\"kind\":\"sdlc_sunny_day_sequence_step\",\"stepId\":\"step:<module>.<verb>\",\"moduleName\":\"<module>\",\"operationId\":\"operation:<module>.<verb>\",\"inputEntityIds\":[],\"outputEntityIds\":[\"entity:<module>.<name>\"],\"stateTransitionIds\":[]}",
    "- axis verdict: {\"kind\":\"sdlc_design_completeness_axis_verdict\",\"axis\":\"entity\",\"status\":\"satisfied\",\"reasons\":[\"implementation-design register declares owned entities\"],\"evidenceRefs\":[\"file://...\"]}",
    "",
    "Rules:",
    "- The register is the compact pressure map from design state A to implementation state B; downstream transform.C consumes it as implementation-design truth.",
    "- Prefer a small truthful register over a broad invented architecture, but do not omit source targets, module boundaries, requirement lineage, or stack facts needed to keep pressure on the transformer.",
    "- Register size budget is part of correctness: this evaluator must produce a bounded pressure map, not an exhaustive copy of every requirement table or design paragraph.",
    "- Bounded first-pass register target: one stack profile row, one implementation module row per module, one compact schema fragment per module, at most two entities and two operations per module, one state diagram fragment per module, no more than 18 sunny-day steps, 18 to 32 component rows only when the ADR requires them, and file targets copied from the ADR materialization targets.",
    "- Use feature decomposition rows, ADR component rows, and module/source-root boundaries as the primary component decomposition. Do not derive one component per requirement.",
    "- For a dense full-breadth product, emit 20 to 32 componentTopologyRows/componentRealizationRows when needed; do not exceed 32 component rows without a hard requirement in the ADR.",
    "- Keep moduleSchemaFragments compact: one fragment per implementation module, with representative entities and operations sufficient to preserve transformer pressure. Do not model every possible field, proof artifact, or test case as a separate entity.",
    "- Keep aggregateDomainModel compact: summarize cross-module domain shape with no more than 16 aggregate entities and no more than 24 aggregate operations.",
    "- Keep aggregateSunnyDaySequence compact: use no more than 18 steps that show the main public happy path and proof-output flow.",
    "- Requirement ids on component rows are pressure samples for that component, not a full trace surface. Carry 3 to 8 local/high-signal requirementIds per component row and leave full global trace coverage in the ADR, feature decomposition, and requirement surfaces.",
    "- Do not repeat the same large requirement id list across many rows.",
    "- Use the construction brief stagePressure and target carrier refs to decide which staged authority this register must satisfy.",
    "- Treat construction_brief.stagePressure.proportionalityProfile as the admitted size budget for this edge: respect its profileClass, maxModules, and maxComponents. A degenerate profile means one module / one component / one function; do not expand the register beyond the admitted budget without a hard ADR requirement. A broad profile permits the full component range.",
    "- Treat the ADR as candidate transform evidence, not the full truth; correct underspecified ADR rows by evaluating the workspace and admitted evidence.",
    "- Use the ADR Product File Targets table for fileTargetRows, but keep fileTargetRows to materialized product file roles.",
    "- fileTargetRows must exclude authority/support paths such as specification/, build_tenants/<tenant>/spec/, design/adrs/, design/*_surface.md, and current ADR/scenario/feature surfaces unless a higher accepted product authority explicitly declares that exact path as a materialized product target.",
    "- Canonical fileTargetRows[].role values are source, test, build_config, design, documentation, or other.",
    "- A source row marked deferred is still a materialized product target; emit it with role source.",
    "- For a trivial product, fileTargetRows must name only downstream materialized product targets declared by authority. Include build_config files only when the ADR Product File Targets table, tenant stack authority, or another higher accepted product authority explicitly declares that exact build/config target; do not infer package/build files from ecosystem convention.",
    "- componentTopologyRows and componentRealizationRows must not be empty for implementation-design registers.",
    "- Do not collapse the register to manifest-only when source/runtime requirements are present in the ADR requirement lineage, construction brief, invocation package, or worker stderr.",
    "- Requirements that imply separable public/runtime/data/test boundaries must become separate component-level realization rows unless the register gives a specific shared-component rationale in publicBoundary and designCompletenessVerdict.reasons.",
    "- Trivial product override: when the workspace/constraints/ADR identify a trivial product or one tiny executable/script target, keep one componentTopologyRows row and one componentRealizationRows row for the shared source target unless there are separate source files or a hard accepted authority requiring separate product components. Carry runtime, route, response, and proof requirement ids as facets of that one component with an explicit shared-component rationale.",
    "- If accepted authority says a source target is an executable, script, program, CLI, service entrypoint, or must print/emit/respond when run, preserve that executable-entrypoint obligation in publicBoundary and designCompletenessVerdict reasons. Do not downgrade it to an import-only helper boundary unless an admitted authority explicitly says the product is library-only.",
    "- Do not split a trivial single-file service into runtime_binding, response, and proof-support components when all behavior is intentionally implemented in the same source file.",
    "- Fail your own self-check and rewrite if the register assigns unrelated source/runtime/data/test obligations to one coarse component without a specific cohesion rationale.",
    "- When a requirement lineage row says a source obligation is deferred to a downstream source-materialization edge, create the implementation component topology/realization row for that source target now and carry the deferred requirement id on that component.",
    "- Staged decomposition admission is mandatory: each componentTopologyRows[] or componentRealizationRows[] row must own no more than 8 requirementIds.",
    "- If one module or source root owns more than 8 requirement ids, split it into multiple component rows under the same module/source root with distinct componentIds and publicBoundary values.",
    "- Keep upstreamComponentIds as component ids only; never use requirement ids as upstream component ids.",
    "- Target enough componentRealizationRows so component-row pressure density remains 8 or less without copying the full global requirement surface into every row.",
    "- Before final response, reject and rewrite the register if any component row has more than 8 requirementIds or repeats a global requirement list.",
    "- Before final response, reject and rewrite the register if schema/entity/operation/sequence names are generic substitutes not grounded in the accepted product vocabulary. A product about Object/Morphism/cardinality/dot-path behavior must not become a generic mapping-result model.",
    "- Every componentTopologyRows[].relativePath and componentRealizationRows[].relativePath must have a matching fileTargetRows entry with role source.",
    "- If the ADR repeats the same file path for behavioral roles such as runtime_binding, route, response, smoke proof, execution proof, or deferred implementation behavior, emit one fileTargetRows entry with the materialization role and carry those behavioral requirement ids on componentTopologyRows/componentRealizationRows instead.",
    "- Use only source/application implementation targets for componentTopologyRows and componentRealizationRows.",
    "- If a path is a package, build config, runtime config, documentation, or test/proof target, it must not appear in componentTopologyRows or componentRealizationRows merely to satisfy the source-row rule.",
    "- Do not turn test, proof-test, package, runtime-config, documentation, or build-context targets into implementation components; keep those only in fileTargetRows.",
    "- componentId and moduleName must be stable identifier tokens without spaces; prefer lowercase words joined by '-' or '_'.",
    "- publicBoundary must be a meaningful product behavior or module contract from the ADR; do not use placeholders such as implementation-core, module-root, component, or target.",
    "- concernRole must be one of the allowed values exactly; use \"other\" for simple executable entrypoints or glue unless admitted source authority clearly maps the component to parser, validator, mapper, error_model, io_adapter, reporting, or domain_model.",
    "- Preserve requirement ids exactly as written in the ADR or construction brief.",
    "- Use file:// evidence refs for the ADR transform artifact.",
    "- If the product is trivial, keep the register trivial; do not invent modules, entities, APIs, persistence, or multiple same-file components.",
    "- designCompletenessVerdict evaluates the implementation-design surface only. Do not mark an axis partial or blocked merely because source materialization, test design, execution, or runtime proof happens on a downstream edge.",
    "- Before the final response, re-open the JSON you wrote and verify that every typed nested item above is an object with exactly the declared fields, not a string, Markdown paragraph, or partial object.",
    "- Before the final response, run a bounded path-integrity self-check: every source-role fileTargetRows[].relativePath and every component source relativePath must either appear in the transform artifact target/component tables or be justified by a higher source authority ref cited in sourceBasisRefs/evidenceRefs.",
    "- The path-integrity self-check is mandatory even when the first register was structurally valid; structural validity alone is not enough if exact product file paths drift from the admitted design/source authority.",
    "- Self-check the size budget before final response: component rows are between 1 and 32, every component row has 8 or fewer requirementIds, aggregate entities are 16 or fewer, aggregate operations are 24 or fewer, and sunny-day steps are 18 or fewer.",
    "- Required self-check before final response: re-open the content register with bounded Read, verify JSON shape against this contract, and rewrite until it passes.",
    "- Self-check contentRows[] entries: exactly kind, rowRef, authorityFunction, carrierFamily, contentKind, payload, sourceBasisRefs, evidenceRefs.",
    `- Self-check ${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_CONTENT_KIND} payloads: exactly kind, fragmentVersion, targetAssetType, section, sequence, mergeMode, value.`,
    `- Self-check fragment sections: only ${SDLC_DESIGN_DEPTH_REGISTER_FRAGMENT_SECTIONS.join(", ")}.`,
    "- Self-check final sdlc_design_depth_register payload: registerVersion exactly ts-design-depth-v1.",
    "- Self-check aggregateDomainModelRows[].kind is exactly \"sdlc_aggregate_domain_model_row\"; reject and rewrite any \"sdlc_aggregate_domain_model_ref_row\" alias.",
    "- Self-check non-null aggregateDomainModel.modelVersion, aggregateSunnyDaySequence.sequenceVersion, and designCompletenessVerdict.verdictVersion: exactly ts-design-depth-v1.",
    "- Self-check every moduleSchemaFragments[] item: exactly kind, moduleName, entities, operations, requirementIds, sourceAssetRefs; kind must be exactly \"sdlc_module_schema_fragment\".",
    "- Self-check every moduleStateDiagramFragments[].entityId is a non-null string and, for that module, exists in moduleSchemaFragments[].entities[].entityId.",
    "- Self-check non-null designCompletenessVerdict keys: exactly attribute, entity, flow, kind, verdictVersion.",
    "- Self-check each designCompletenessVerdict axis object: exactly axis, evidenceRefs, kind, reasons, status.",
    "- Self-check each designCompletenessVerdict axis object kind is exactly \"sdlc_design_completeness_axis_verdict\" and never \"sdlc_verdict_axis\".",
    "- Self-check moduleSchemaFragments[].entities[].invariants: array of strings.",
    "- Self-check every sdlc_domain_attribute.cardinality value is one, optional, or many; reject and rewrite if any product-domain morphism value such as 1:1, N:1, 1:N, M:N, 0..1, 1..1, or 0..* appears.",
    "- Self-check register arrays contain objects, not strings: stackProfileRows, implementationModuleRows, aggregateDomainModelRows, moduleSchemaFragments, moduleStateDiagramFragments, aggregateDomainModel.entities, aggregateDomainModel.operations, aggregateDomainModel.crossModuleReferences, aggregateSunnyDaySequence.steps, componentTopologyRows, componentRealizationRows, fileTargetRows.",
    "- Self-check nested register arrays contain objects, not strings: moduleSchemaFragments[].entities, moduleSchemaFragments[].entities[].attributes, moduleSchemaFragments[].operations, moduleStateDiagramFragments[].transitions, aggregateDomainModel.entities[].attributes.",
    "- Self-check every moduleStateDiagramFragments[].transitions[] object has exactly kind, transitionId, fromState, toState, operationId, entityId; rewrite if trigger/event/condition/action/summary/description appears.",
    "- Do not run another exploratory command after deciding the component/module set; write the content register file first, then validate that file.",
    `- Self-check target file: ${input.contentRegisterPath}`,
    "- Do not include Markdown fences, explanation, comments, or trailing prose in the content register file.",
    "- After writing the content register, respond with a one-line summary only."
    ])
  });
}

export function designDepthFpEvaluatorPromptProjection(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly manifestPath: string;
  readonly governanceRef: string;
  readonly governancePath: string;
  readonly constructionBriefPath: string;
  readonly invocationPackagePath: string;
  readonly workerReportPath: string;
  readonly workerReportSummaryLines: readonly string[];
  readonly contentRegisterPath: string;
  readonly registerProjectionPath: string;
  readonly subworkstreamManifestPath: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly tenantToolEnvironment?: SdlcTenantToolEnvironmentProjection;
}): SdlcRenderedPromptProjection {
  const lineGroups = designDepthFpEvaluatorPromptLineGroups(input);
  const evaluationGridContract = evaluationGridContractForPrompt({
    promptFamily: "evaluate_design_depth",
    manifest: input.manifest,
    sourceAssetRefs: [
      input.governanceRef,
      input.governancePath,
      input.constructionBriefPath,
      input.invocationPackagePath,
      input.workerReportPath,
      input.manifestPath
    ],
    targetAssetRefs: [
      input.contentRegisterPath,
      input.registerProjectionPath,
      input.subworkstreamManifestPath
    ],
    dimensions: [
      evaluationDimension({
        promptFamily: "evaluate_design_depth",
        dimensionKey: "local-depth-sufficiency",
        scope: "cell"
      }),
      evaluationDimension({
        promptFamily: "evaluate_design_depth",
        dimensionKey: "local-authority-stage-conformance",
        scope: "cell"
      }),
      evaluationDimension({
        promptFamily: "evaluate_design_depth",
        dimensionKey: "register-output-contract",
        scope: "relation"
      }),
      evaluationDimension({
        promptFamily: "evaluate_design_depth",
        dimensionKey: "obligation-coverage-fold",
        scope: "fold"
      })
    ],
    provenanceRefs: [
      "REQ-F-ODDSDLC-088",
      "build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_EVALUATION_GRID_CONTRACT.md",
      DESIGN_DEPTH_FP_EVALUATOR_RULE_REF
    ]
  });
  return constructSdlcPromptInvocationProjection({
    promptFamily: "evaluate_design_depth",
    stage: "evaluate.C",
    recipient: "evaluator",
    targetAssetType: input.manifest.targetAssetType ?? "implementation_design_surface",
    workCategory: input.manifest.edgeName ?? null,
    edgePolicyRef: DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
    constructorRef: "prompt-constructor://odd-sdlc/evaluate_design_depth/v1",
    authorityPacketRefs: [
      input.governanceRef,
      input.governancePath,
      input.constructionBriefPath,
      input.invocationPackagePath,
      input.workerReportPath,
      input.manifestPath
    ],
    obligationRefs: [
      input.selectedCompositionRef,
      input.selectedCompositionSelectionRef,
      ...(input.selectedRegimeBindingRef === null
        ? []
        : [input.selectedRegimeBindingRef])
    ],
    toolEffectPolicyRefs: [
      "tool-policy://odd-sdlc/evaluate/read-write-only",
      "tenant-tool-environment://current-state"
    ],
    outputCarrierRefs: [
      input.contentRegisterPath,
      input.registerProjectionPath,
      input.subworkstreamManifestPath
    ],
    proofObligationRefs: [
      DESIGN_DEPTH_FP_EVALUATOR_RULE_REF,
      "REQ-F-ODDSDLC-083",
      "REQ-F-ODDSDLC-087",
      "REQ-F-ODDSDLC-088"
    ],
    evaluationGridContract,
    promptSections: declaredEvaluatePromptSections({
      promptFamily: "evaluate_design_depth",
      lineGroups,
      fallbackPreconditionRef:
        sdlcPromptAuthorityCompressionFallbackPreconditionRef(
          "evaluate_design_depth"
        )
    })
  });
}

export function designDepthFpEvaluatorPrompt(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly manifestPath: string;
  readonly governanceRef: string;
  readonly governancePath: string;
  readonly constructionBriefPath: string;
  readonly invocationPackagePath: string;
  readonly workerReportPath: string;
  readonly workerReportSummaryLines: readonly string[];
  readonly contentRegisterPath: string;
  readonly registerProjectionPath: string;
  readonly subworkstreamManifestPath: string;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly tenantToolEnvironment?: SdlcTenantToolEnvironmentProjection;
}): string {
  return designDepthFpEvaluatorPromptProjection(input).promptText;
}

function reviewGradeEdgeFulfillmentPromptLineGroups(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly invocationScope?: SdlcReviewGradeInvocationScope | null | undefined;
  readonly governanceRef: string;
  readonly governancePath: string;
  readonly constructionBriefPath: string;
  readonly invocationPackagePath: string;
  readonly workerReportPath: string;
  readonly assessmentPath: string;
  readonly subworkstreamManifestPath: string;
  readonly tenantToolEnvironment?: SdlcTenantToolEnvironmentProjection;
}): EvaluatePromptLineGroups {
  if (useCompactFusedEvaluationPrompt(input.manifest)) {
    return compactReviewGradePromptLineGroups(input);
  }
  return Object.freeze({
    preAuthorityLines: Object.freeze([
      "odd_sdlc evaluate.C/F_P review-grade edge fulfillment rule.",
      "",
      "Purpose:",
      "- Review the generated asset against incoming requirements, accepted upstream authority, stage boundary, evidence, and likely failure modes.",
      ...reviewGradePreAuthoritySpecializationLines(input.manifest),
      "- This is semantic evaluation work. Do not rewrite source, tests, design artifacts, reports, ledgers, or framework files.",
      "- The evaluator is read-only over workspace and product files. Do not use apply_patch, shell redirection, scripts, formatters, build tools, or editor commands to modify any generated asset, source file, test file, design surface, report, ledger, package file, or framework file.",
      `- The only durable JSON output you may create or modify is the assessment artifact at ${input.assessmentPath}.`,
      `- The only optional sidecar you may create or modify is the observation-only subworkstream manifest at ${input.subworkstreamManifestPath}.`,
      "- You may use agent-internal subagents or parallel workstreams as read-only compute strategy for independent modules, obligation slices, or evidence packets.",
      `- If you use evaluator subworkstreams, record them in ${input.subworkstreamManifestPath}. Rows must cite authority/dependency inputs, leave write/output-allocation fields empty, and remain observation only.`,
      "- Evaluator subworkstreams do not emit ABG events, write ledgers, close edges, select traversal, publish consequence projections, or create ABG branch leases. The parent evaluate.C result owns the final assessment merge.",
      "- The assessment file is an evaluation sidecar consumed by the existing SdlcWorkerObligationAssessment -> SdlcEdgeFulfillmentLedger path. It is not a new closure ledger.",
      "",
      "Tenant tool boundary:",
      ...tenantToolBoundaryPromptLines(input.tenantToolEnvironment),
      "- Tool-profile contract: obey the active tool list. If command execution is not exposed, inspect with bounded file reads/writes only. If command execution is exposed by the worker runtime, use it only for bounded workspace-relative read-only inspection unless this prompt explicitly names an execution probe; do not run product, build, test, framework, traversal, background, or mutation commands.",
      "- Read cap: every Read tool call over JSON, Markdown, report, manifest, or source artifacts must set limit <=80; use offset/limit for bounded inspection and inspect only the lines needed for the current finding or assessment section."
    ]),
    postAuthorityLines: Object.freeze([
      "",
      "Read in order:",
    `1. compressed work-category governance (${input.governanceRef}): ${input.governancePath}`,
    `2. bounded inspection of construction brief: ${input.constructionBriefPath}`,
    `3. bounded inspection of invocation package: ${input.invocationPackagePath}`,
    `4. bounded inspection of worker result report: ${input.workerReportPath}`,
    reviewGradeGeneratedArtifactReadLine(input.manifest),
    "6. product_materialization_manifest.json in the same archive when present.",
    "7. accepted design-depth register refs from construction_brief.stagePressure.designDepthEvaluatorRegisterRefs when present.",
    "",
    "Reading discipline:",
    "- Do not print full files, full JSON objects, full requirement tables, or full source files to stdout.",
    "- Use only the active tool profile. When command execution is not available, inspect with bounded Read ranges and write the durable assessment JSON directly.",
    "- For non-executable planning/design/review surfaces, use bounded file inspection and assessment writing tools. Do not run convenience grep/count loops, command probes, helper scripts, or payload-printing commands unless the active tool list explicitly exposes command execution.",
    "- Do not issue parallel tool calls.",
    "- Do not convert evaluator-side tool-profile, quoting, type-shape, key-shape, or schema-inspection failures into requirement/product obligation findings.",
    "- If the active tool profile cannot produce the assessment safely, stop with the final one-line blocked response and leave the assessment absent so the framework can classify evaluator failure.",
    "- Terminal output is a work trace. The JSON assessment file is the evaluation truth.",
    "- If reviewedObligationIds is large, still write the assessment file directly and keep stdout to compact status counts; do not stream a large findings array through stdout.",
    "- Treat JSON collections defensively when reading evidence: worker_construction_brief.obligations may be an object map rather than an array; do not assume array shape when selecting obligation ids.",
    "- Prefer exact string equality, startsWith, includes, endsWith, and split-style reasoning for ref/path classification. Regex quoting mistakes are evaluator failures, not product evidence.",
    "- If pattern matching is unavoidable, validate the pattern against one sample mentally before writing the assessment JSON; do not add helper-output keys or regex debug fields.",
    "- Do not manually type or stream a large findings array through stdout. Write the durable JSON file and print only compact status counts.",
    "- Do not start background jobs. Do not execute a generated product, service, test, or script unless the active tool list explicitly exposes command execution and the prompt names a workspace/run-archive path for transient evidence.",
    "- Do not use shell job-control cleanup such as `kill %1` or Claude background tasks. A passed assessment is invalid if a spawned process remains live after evaluation.",
    "- Do not use /tmp, /private/tmp, $TMPDIR, or outside-workspace paths for temporary probe output. If a future execution-capable profile needs transient stdout/stderr capture, write it under the current operator-run archive or another explicit workspace/run-archive path named in this prompt, then clean it before exit.",
    "- If the executor advertises /tmp as sandbox-writable, ignore that capability for evaluation evidence. Writable does not mean authoritative.",
    "- Derive source inspection from tenant-declared stack authority, materialized file roles, publicBoundary fields, and declared build/run configuration. Do not assume a single source language, file extension family, export syntax, package shape, script field, or function naming convention.",
    ...reviewGradePublicBoundaryInspectionLines(input.manifest),
    "- Public behavior may be a CLI, module main function, route, service class, binary entrypoint, declared framework target, or another tenant-declared runnable boundary. Assess the boundary from admitted product and tenant authority, not from hard-coded sample product helper names.",
    "",
    `Durable assessment artifact to create and validate: ${input.assessmentPath}`,
    "- The assessment path is output-only and is expected to be absent before evaluation; do not include it in missing-input checks. Create its parent directory if needed, write it, then re-open it with bounded Read for self-check.",
    "",
    "Required JSON shape:",
    "- kind: \"sdlc_review_grade_edge_fulfillment_assessment\"",
    "- assessmentVersion: \"ts-review-grade-v1\"",
    `- graphFunctionName: ${JSON.stringify(input.manifest.graphFunctionName)}`,
    `- edgeName: ${JSON.stringify(input.manifest.edgeName)}`,
    `- targetAssetType: ${JSON.stringify(input.manifest.targetAssetType)}`,
    "- status: \"passed\" or \"blocked\"",
    "- reviewedObligationIds: exactly the obligationRefs in the admitted edge packet above. For scoped runs, reviewedObligationIds are exactly invocationPackage.inlineObligationIds and no worker aliases.",
    "- worker_result_report.obligationAssessments may support evidence and rationale, but it cannot enlarge review scope or create findings for generated-artifact requirement aliases.",
    "- reviewedObligationIds must contain only admitted obligation ids from the admitted edge packet obligationRefs, invocationPackage.inlineObligationIds[], invocationPackage.obligationIds[], or invocationPackage.inlineObligations[].obligationId.",
    "- For scoped runs where invocationPackage.featureScope.mode is steel_thread or targeted_repair, the active review scope is invocationPackage.inlineObligationIds. Treat invocationPackage.requirementTraceObligationIds, traversalIntentPackage.obligationIds, retrieval hint obligation ids, and omitted obligation ids as lineage/evidence context only unless the id is also present in invocationPackage.inlineObligationIds.",
    "- Do not build reviewedObligationIds by recursively collecting every string in JSON. Authority and evidence refs such as workspace://..., file://..., config://..., schema://..., gtl://..., handoff-projection://..., source-digest://..., and review-evidence://... are evidenceRefs or acceptedAuthorityRefs, not obligations and must not become findings.",
    "- findings[]: one sdlc_review_grade_obligation_finding per reviewed obligation id",
    "- evidenceRefs: refs for the assessment, generated assets, accepted authority, and review evidence",
    "- summary: one compact sentence",
    reviewGradeOptionalObservationFieldLine(input.manifest),
    "- No other top-level keys are allowed.",
    "",
    "Finding shape:",
    "- kind: \"sdlc_review_grade_obligation_finding\"",
    "- obligationId: exact obligation id",
    "- fulfillmentStatus: fulfilled, partial, blocked, or unassessed",
    "- failureClass: null when fulfilled, otherwise one of trace_missing, semantic_not_realized, boundary_collapsed, wrong_stage, schema_invalid, execution_environment, test_overlap_missing",
    "- requiredAction: null when fulfilled, otherwise the concrete work item the next transform must complete",
      "- evidenceRefs: generated asset refs and diagnostic refs used for this judgment",
      "- acceptedAuthorityRefs: non-empty requirement/design/depth/test/target-carrier authority refs used for this judgment",
      reviewGradeFindingFulfillmentBindingLine(input.manifest),
      "- repairSurfaceTriage: null when fulfilled; otherwise a sdlc_repair_surface_triage object classifying the lawful repair surface as current_edge_repair, upstream_reentry, downstream_deferred, or external_blocked.",
      "- repairSurfaceTriage for upstream_reentry must name repairGraphFunctionRef, repairGraphVectorRef, and repairAssetRef; other dispositions may set those refs to null.",
      "- rationale: compact reason with three clauses: obligation intent paraphrase, artifact semantic review, and verdict",
    "- No other finding keys are allowed. Do not add helper booleans, carryover flags, scores, sourceAssetCarryover, sourceAssetStatus, confidence, or notes fields.",
    "",
    "repairSurfaceTriage shape for non-fulfilled findings:",
    "- kind: \"sdlc_repair_surface_triage\"",
    "- disposition: current_edge_repair, upstream_reentry, downstream_deferred, or external_blocked",
    "- repairGraphFunctionRef, repairGraphVectorRef, repairAssetRef: non-null only when the lawful repair surface is an upstream graph/vector/asset re-entry",
    "- evidenceRefs: non-empty refs proving this triage",
    "- rationale: compact reason for this repair-surface classification",
    ...reviewGradeFulfillmentBindingShapeLines(input.manifest),
    "",
      "Review rules:",
      "- A requirement tag, file path, schema-valid report, or passing smoke output is evidence, not proof by itself.",
      "- For every finding, first paraphrase the accepted obligation intent from the admitted requirement/design/test/target-carrier authority, then compare the generated artifact's actual semantics against that intent, then state why the artifact fulfills or fails it.",
      "- A fulfilled finding is invalid when the rationale only cites existence, schema validity, digest, lineage, worker status, or manifest rows without saying what the artifact is supposed to do and how the artifact's content realizes that purpose.",
      "- For planning surfaces, review the plan as an artifact: decide whether its decisions, rows, cases, schedules, or bindings are sufficient to carry the obligation into the next lawful edge. Do not pass a planning artifact just because it names the next file or requirement.",
      "- SDLC depth is scenario/build-test driven: UAT/scenario authority and build/test observations are primary behavior proof; obligation mapping, carrier rows, lineage tags, and worker fulfilled counts are trace evidence only.",
    "- Every finding must include at least one acceptedAuthorityRef. Do not emit an empty acceptedAuthorityRefs array for target_asset, source_set, inline, or aggregate findings.",
    "- For target_asset findings, use the construction brief targetCarrierProjection target carrier refs plus the accepted authority files that governed the generated asset.",
    "- Before marking missing public-boundary fulfillment, compare the admitted tenant/worksite authority to all generated source-role files and declared run/build entrypoints. A review helper that only recognizes one implementation language is evaluator failure, not product evidence.",
    "- Mark partial or blocked when an asset exists but does not plausibly implement the accepted responsibility.",
    "- Mark boundary_collapsed when generated source collapses multiple accepted component rows back into a coarse facade.",
    "- Mark semantic_not_realized when requirement tags are present but the behavior is absent, stubbed, placeholder, or not connected to the exported/public boundary.",
    "- Mark semantic_not_realized when accepted authority requires executable/script/program behavior but the source only exports a helper or function and has no entrypoint path that runs the product behavior when the file is invoked. A test calling a helper is overlap evidence, not executable-product proof.",
    "- For non-materialized planning surfaces such as intent, requirement, design, schedule, or test-design surfaces, do not mark downstream implementation/runtime obligations semantic_not_realized merely because implementation behavior is absent on the current edge.",
    "- For non-materialized planning surfaces, the declared output file is the generated asset under review. If worker_result_report.materializedFiles is empty, inspect worker_result_report.outputFile or the manifest outputFile before marking trace_missing or semantic_not_realized; materializedFiles=[] is not by itself a missing-asset blocker on these edges.",
    "- When worker_result_report.obligationAssessments already carries a requirement with blockingReasons starting requirement_carried_for_downstream_closure: or requirement_recorded_for_future_closure: and the generated asset, selected target carrier, worker report, or materialization manifest maps that requirement to downstream component/source/realization pressure, mark that finding partial with failureClass wrong_stage and requiredAction naming the downstream materialization/design edge.",
    "- For requirement_surface and other non-materialized planning surfaces, an exact worker_result_report obligation assessment with requirement_recorded_for_future_closure: is accepted lineage for downstream transformation-set carryover; do not require the native markdown asset to repeat every exact requirement id when the report/carrier already preserves the id and accepted authority refs.",
    "- wrong_stage is only for lawful downstream carryover. If the current asset omits the requirement mapping, loses accepted authority, invents an owner, or claims executable fulfillment on the wrong edge, use trace_missing, semantic_not_realized, boundary_collapsed, or schema_invalid instead.",
    "- Requirement lineage is transformer-owned semantic evidence, not a postflight closure shortcut. Inspect worker_result_report.materializedFiles, product_materialization_manifest.files, selected target-carrier materializedFiles, and native file tags/comments where the file format permits them.",
    "- Mark trace_missing when a generated product file is used as fulfillment evidence but carries no lineage in the asset itself, selected target carrier, worker report, or materialization manifest. Do not pass by file existence, digest, or test success alone.",
    ...reviewGradeComponentCodeRuleLines(input.manifest),
    "- If tenant stack ambiguity was present, verify that the generated artifact or evidence contains a compact stack reconciliation decision before passing stack-dependent product materialization.",
    "- Verify consistency among tenant stack authority, emitted product syntax/files, declared product targets, declared execution commands, and returned execution evidence. This is evaluation only: do not repair generated product files or mutate tenant-stack authority.",
    "- Mark semantic_not_realized or schema_invalid when tenant stack authority contradicts emitted product files, for example declaring one module system while generated source/test syntax requires another. The worker must repair the authority surface or the product files; documenting an override in prose is not enough.",
    "- Do not execute commands unless the active tool list explicitly exposes command execution. When command execution is not available, evaluate declared executable or test execution contracts from admitted execution evidence; if required execution evidence is absent, mark the relevant obligation partial or blocked with execution_environment or semantic_not_realized instead of passing by inspection.",
    "- Mark test_overlap_missing when accepted depth requires test overlap and the generated tests do not exercise the responsibility.",
    ...reviewGradeTargetAssetRuleLines(input.manifest),
    ...reviewGradeMaterializationRuleLines(input.manifest),
    "- For every other target asset type, compare the generated asset to incoming obligations, accepted upstream authority, target carrier expectations, stage boundary, and evidence overlap.",
    "- If all reviewed obligations are fulfilled, status must be passed and every finding failureClass/requiredAction must be null.",
    "- If every non-fulfilled finding is lawful downstream-deferred wrong_stage carryover with repairSurfaceTriage.disposition=downstream_deferred, status must be passed; ABG records that carryover and closes the current edge.",
    "- If any non-fulfilled finding is not lawful downstream-deferred carryover, status must be blocked and every non-fulfilled finding must include failureClass, requiredAction, and repairSurfaceTriage.",
    "- Before final response, re-open the assessment JSON with bounded Read and self-check it. Verify the top-level key set is exactly kind, assessmentVersion, graphFunctionName, edgeName, targetAssetType, status, reviewedObligationIds, findings, evidenceRefs, summary.",
    "- Verify every finding key set is exactly kind, obligationId, fulfillmentStatus, failureClass, requiredAction, evidenceRefs, acceptedAuthorityRefs, fulfillmentBinding, repairSurfaceTriage, rationale.",
    "- Verify every finding.obligationId is present in reviewedObligationIds and every reviewedObligationId came from an admitted obligation-id field, not from an authority/evidence ref string.",
    reviewGradeSelfCheckBindingLine(input.manifest),
    "- Rewrite until it is valid whole-file JSON with no Markdown fences, comments, trailing prose, or extra keys.",
    "- Final response must be one line: reviewStatus=<passed|blocked> reviewed=<n> blocked=<n>."
    ])
  });
}

export function reviewGradeEdgeFulfillmentPromptProjection(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly invocationScope?: SdlcReviewGradeInvocationScope | null | undefined;
  readonly governanceRef: string;
  readonly governancePath: string;
  readonly constructionBriefPath: string;
  readonly invocationPackagePath: string;
  readonly workerReportPath: string;
  readonly assessmentPath: string;
  readonly subworkstreamManifestPath: string;
  readonly tenantToolEnvironment?: SdlcTenantToolEnvironmentProjection;
}): SdlcRenderedPromptProjection {
  const lineGroups = reviewGradeEdgeFulfillmentPromptLineGroups(input);
  const evaluationGridContract = evaluationGridContractForPrompt({
    promptFamily: "evaluate_review_grade",
    manifest: input.manifest,
    invocationScope: input.invocationScope,
    sourceAssetRefs: [
      input.governanceRef,
      input.governancePath,
      input.constructionBriefPath,
      input.invocationPackagePath,
      input.workerReportPath
    ],
    targetAssetRefs: [
      input.assessmentPath,
      input.subworkstreamManifestPath
    ],
    dimensions: reviewGradeEvaluationDimensions(input.manifest),
    provenanceRefs: [
      "REQ-F-ODDSDLC-088",
      "build_tenants/typescript/design/ODD_SDLC_TYPESCRIPT_EVALUATION_GRID_CONTRACT.md",
      "evaluation-rule://odd-sdlc/review-grade-edge-fulfillment/fp"
    ]
  });
  return constructSdlcPromptInvocationProjection({
    promptFamily: "evaluate_review_grade",
    stage: "evaluate.C",
    recipient: "evaluator",
    targetAssetType: input.manifest.targetAssetType ?? "unknown_target_asset",
    workCategory: input.manifest.edgeName ?? null,
    edgePolicyRef: "evaluation-rule://odd-sdlc/review-grade-edge-fulfillment/fp",
    constructorRef: "prompt-constructor://odd-sdlc/evaluate_review_grade/v1",
    authorityPacketRefs: [
      input.governanceRef,
      input.governancePath,
      input.constructionBriefPath,
      input.invocationPackagePath,
      input.workerReportPath
    ],
    obligationRefs: [
      input.manifest.graphFunctionName ?? "graph-function://unknown",
      input.manifest.edgeName ?? "graph-edge://unknown"
    ],
    toolEffectPolicyRefs: [
      "tool-policy://odd-sdlc/evaluate/read-write-only",
      "tenant-tool-environment://current-state"
    ],
    outputCarrierRefs: [
      input.assessmentPath,
      input.subworkstreamManifestPath
    ],
    proofObligationRefs: [
      "REQ-F-ODDSDLC-083",
      "REQ-F-ODDSDLC-087",
      "REQ-F-ODDSDLC-088",
      "proof://odd-sdlc/review-grade-edge-fulfillment-assessment"
    ],
    evaluationGridContract,
    promptSections: declaredEvaluatePromptSections({
      promptFamily: "evaluate_review_grade",
      lineGroups,
      fallbackPreconditionRef:
        sdlcPromptAuthorityCompressionFallbackPreconditionRef(
          "evaluate_review_grade"
        )
    })
  });
}

export function reviewGradeEdgeFulfillmentPrompt(input: {
  readonly manifest: SdlcWorkerHandoffManifest;
  readonly invocationScope?: SdlcReviewGradeInvocationScope | null | undefined;
  readonly governanceRef: string;
  readonly governancePath: string;
  readonly constructionBriefPath: string;
  readonly invocationPackagePath: string;
  readonly workerReportPath: string;
  readonly assessmentPath: string;
  readonly subworkstreamManifestPath: string;
  readonly tenantToolEnvironment?: SdlcTenantToolEnvironmentProjection;
}): string {
  return reviewGradeEdgeFulfillmentPromptProjection(input).promptText;
}
