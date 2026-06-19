// Implements: REQ-F-ODDSDLC-087

import {
  admitAssetSurface,
  constructAssetSurface,
  constructNode,
  type AssetSurface,
  type AssetSurfaceAuthoritySlot,
  type AssetSurfaceAuthoritySlotDisposition,
  type Node
} from "@abiogenesis/typescript-tenant";
import { sha256Text } from "../shared/digest.js";

export const SDLC_PROMPT_INVOCATION_ASSET_VERSION =
  "ts-prompt-invocation-gtl-v1" as const;

export const SDLC_PROMPT_CLAUSE_ROW_VERSION =
  "ts-prompt-clause-row-v1" as const;

export const SDLC_METHOD_AUTHORITY_COMPRESSION_REFS = Object.freeze([
  "workspace://.abiogenesis/docs/standards/authority_compressions/stdo_compressed.md",
  "workspace://.abiogenesis/docs/standards/authority_compressions/spec_method.compressed.md",
  "workspace://.abiogenesis/docs/standards/authority_compressions/design_module_method.compressed.md",
  "workspace://.abiogenesis/docs/standards/authority_compressions/odd_method.compressed.md",
  "workspace://.abiogenesis/docs/standards/authority_compressions/ticket_method.compressed.md",
  "workspace://.abiogenesis/docs/standards/authority_compressions/ux_method.compressed.md"
] as const);

const SPEC_METHOD_PROMPT_OPENING_LINE =
  "Use the smallest governing authority packet that can decide this prompt, then produce the contracted artifact without extra planning or global SDLC reconstruction.";

export const SDLC_PROMPT_FAMILIES = Object.freeze([
  "transform",
  "evaluate_design_depth",
  "evaluate_review_grade"
] as const);

export type SdlcPromptFamily = (typeof SDLC_PROMPT_FAMILIES)[number];

export const SDLC_PROMPT_STAGES = Object.freeze([
  "transform.C",
  "evaluate.C"
] as const);

export type SdlcPromptStage = (typeof SDLC_PROMPT_STAGES)[number];

export const SDLC_PROMPT_RECIPIENTS = Object.freeze([
  "transformer",
  "evaluator",
  "evaluator_subworkstream",
  "worker_subworkstream"
] as const);

export type SdlcPromptRecipient = (typeof SDLC_PROMPT_RECIPIENTS)[number];

export const SDLC_PROMPT_SECTION_ROLES = Object.freeze([
  "purpose",
  "authority_packet",
  "tool_boundary",
  "read_order",
  "carried_context",
  "evidence_payload",
  "output_contract",
  "self_check",
  "fallback",
  "prohibition",
  "prompt_body"
] as const);

export type SdlcPromptSectionRole =
  (typeof SDLC_PROMPT_SECTION_ROLES)[number];

export const SDLC_PROMPT_CLAUSE_MODES = Object.freeze([
  "declarative_axiom",
  "imperative_guardrail",
  "optimization",
  "fallback",
  "prohibition",
  "output_schema"
] as const);

export type SdlcPromptClauseMode =
  (typeof SDLC_PROMPT_CLAUSE_MODES)[number];

export const SDLC_PROMPT_AUTHORITY_KINDS = Object.freeze([
  "product_definition",
  "requirements",
  "admitted_design",
  "typed_obligations",
  "target_carrier",
  "tenant_stack_authority",
  "worker_report_evidence",
  "materialization_evidence",
  "execution_evidence",
  "tool_effect_policy",
  "method_compression",
  "bootstrap_provenance",
  "intent_fallback",
  "runtime_forensics",
  "sibling_workspace_history"
] as const);

export type SdlcPromptAuthorityKind =
  (typeof SDLC_PROMPT_AUTHORITY_KINDS)[number];

export const SDLC_EVALUATION_DIMENSION_SCOPES = Object.freeze([
  "cell",
  "fold",
  "relation"
] as const);

export type SdlcEvaluationDimensionScope =
  (typeof SDLC_EVALUATION_DIMENSION_SCOPES)[number];

export const SDLC_EVALUATION_GRID_PHYSICAL_EXECUTIONS = Object.freeze([
  "fused_prompt",
  "bounded_cells"
] as const);

export type SdlcEvaluationGridPhysicalExecution =
  (typeof SDLC_EVALUATION_GRID_PHYSICAL_EXECUTIONS)[number];

export const SDLC_EVALUATION_GRID_CONTRACT_VERSION =
  "ts-evaluation-grid-contract-v1" as const;

export interface SdlcTransformUnitRef {
  readonly kind: "sdlc_transform_unit_ref";
  readonly unitRef: string;
  readonly segmentKey: string;
  readonly sourceAssetRefs: readonly string[];
  readonly targetAssetRefs: readonly string[];
  readonly obligationRefs: readonly string[];
}

export interface SdlcEvaluationDimensionRef {
  readonly kind: "sdlc_evaluation_dimension_ref";
  readonly dimensionRef: string;
  readonly scope: SdlcEvaluationDimensionScope;
  readonly expectedFindingRef: string;
}

export interface SdlcDisambiguationCarrierRef {
  readonly kind: "sdlc_disambiguation_carrier_ref";
  readonly carrierRef: string;
  readonly scopeRef: string;
  readonly authoritySnapshotRefs: readonly string[];
  readonly priorFindingRefs: readonly string[];
  readonly lineageRefs: readonly string[];
}

export interface SdlcEvaluationGridContract {
  readonly kind: "sdlc_evaluation_grid_contract";
  readonly gridVersion: typeof SDLC_EVALUATION_GRID_CONTRACT_VERSION;
  readonly logicalGridRef: string;
  readonly physicalExecution: SdlcEvaluationGridPhysicalExecution;
  readonly transformUnits: readonly SdlcTransformUnitRef[];
  readonly evaluationDimensions: readonly SdlcEvaluationDimensionRef[];
  readonly disambiguationCarriers: readonly SdlcDisambiguationCarrierRef[];
  readonly expectedFindingRefs: readonly string[];
  readonly abgOutcomeFoldRef: string;
  readonly provenanceRefs: readonly string[];
}

export interface SdlcEvaluationGridContractConstructionInput {
  readonly logicalGridRef: string;
  readonly physicalExecution: SdlcEvaluationGridPhysicalExecution;
  readonly transformUnits: readonly SdlcTransformUnitRef[];
  readonly evaluationDimensions: readonly SdlcEvaluationDimensionRef[];
  readonly disambiguationCarriers: readonly SdlcDisambiguationCarrierRef[];
  readonly expectedFindingRefs: readonly string[];
  readonly abgOutcomeFoldRef: string;
  readonly provenanceRefs: readonly string[];
}

export const SDLC_PROMPT_NORMAL_AUTHORITY_KIND_REFS = Object.freeze([
  "product_definition",
  "requirements",
  "admitted_design",
  "typed_obligations",
  "target_carrier",
  "tenant_stack_authority",
  "worker_report_evidence",
  "materialization_evidence",
  "execution_evidence",
  "tool_effect_policy",
  "method_compression"
] as const satisfies readonly SdlcPromptAuthorityKind[]);

export const SDLC_PROMPT_BOUNDED_FALLBACK_AUTHORITY_KIND_REFS = Object.freeze([
  "bootstrap_provenance",
  "intent_fallback",
  "runtime_forensics"
] as const satisfies readonly SdlcPromptAuthorityKind[]);

export interface SdlcPromptAuthorityPolicyRow {
  readonly kind: "sdlc_prompt_authority_policy_row";
  readonly rowRef: string;
  readonly promptFamily: SdlcPromptFamily;
  readonly normalAuthorityKinds: readonly SdlcPromptAuthorityKind[];
  readonly boundedFallbackAuthorityKinds: readonly SdlcPromptAuthorityKind[];
  readonly forbiddenRoutineAuthorityKinds: readonly SdlcPromptAuthorityKind[];
  readonly fallbackPrecondition: string;
}

export interface SdlcPromptClauseRow {
  readonly kind: "sdlc_prompt_clause_row";
  readonly clauseVersion: typeof SDLC_PROMPT_CLAUSE_ROW_VERSION;
  readonly clauseId: string;
  readonly textLines: readonly string[];
  readonly intent: string;
  readonly provenanceRefs: readonly string[];
  readonly authorityBasisRefs: readonly string[];
  readonly authorityKindRefs: readonly SdlcPromptAuthorityKind[];
  readonly fallbackPreconditionRefs: readonly string[];
  readonly recipient: SdlcPromptRecipient;
  readonly mode: SdlcPromptClauseMode;
  readonly expectedOutcome: string;
  readonly failureModeAddressed: string;
  readonly appliesWhen: string;
  readonly supersedesClauseRefs: readonly string[];
}

export interface SdlcPromptSectionRow {
  readonly kind: "sdlc_prompt_section_row";
  readonly sectionId: string;
  readonly role: SdlcPromptSectionRole;
  readonly title: string;
  readonly clauseRefs: readonly string[];
  readonly clauses: readonly SdlcPromptClauseRow[];
}

export interface SdlcPromptInvocationAsset {
  readonly kind: "sdlc_prompt_invocation_asset";
  readonly invocationVersion: typeof SDLC_PROMPT_INVOCATION_ASSET_VERSION;
  readonly promptFamily: SdlcPromptFamily;
  readonly stage: SdlcPromptStage;
  readonly targetAssetType: string;
  readonly workCategory: string | null;
  readonly edgePolicyRef: string | null;
  readonly constructorRef: string;
  readonly authorityPacketRefs: readonly string[];
  readonly obligationRefs: readonly string[];
  readonly toolEffectPolicyRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly proofObligationRefs: readonly string[];
  readonly methodCompressionRefs: readonly string[];
  readonly evaluationGridContract: SdlcEvaluationGridContract | null;
  readonly gtlNode: Node;
  readonly promptSections: readonly SdlcPromptSectionRow[];
  readonly renderedPromptDigest: string;
}

export interface SdlcRenderedPromptProjection {
  readonly promptText: string;
  readonly invocationAsset: SdlcPromptInvocationAsset;
}

export interface SdlcPromptClauseConstructionInput {
  readonly clauseId?: string | undefined;
  readonly textLines: readonly string[];
  readonly intent: string;
  readonly provenanceRefs?: readonly string[] | undefined;
  readonly authorityBasisRefs?: readonly string[] | undefined;
  readonly authorityKindRefs: readonly SdlcPromptAuthorityKind[];
  readonly fallbackPreconditionRefs?: readonly string[] | undefined;
  readonly mode: SdlcPromptClauseMode;
  readonly expectedOutcome: string;
  readonly failureModeAddressed: string;
  readonly appliesWhen: string;
  readonly supersedesClauseRefs?: readonly string[] | undefined;
}

export interface SdlcPromptSectionConstructionInput {
  readonly sectionId?: string | undefined;
  readonly role: SdlcPromptSectionRole;
  readonly title: string;
  readonly clauses: readonly SdlcPromptClauseConstructionInput[];
}

export interface SdlcPromptInvocationProjectionInput {
  readonly promptFamily: SdlcPromptFamily;
  readonly stage: SdlcPromptStage;
  readonly recipient: SdlcPromptRecipient;
  readonly targetAssetType: string;
  readonly workCategory?: string | null | undefined;
  readonly edgePolicyRef?: string | null | undefined;
  readonly constructorRef: string;
  readonly authorityPacketRefs: readonly string[];
  readonly obligationRefs: readonly string[];
  readonly toolEffectPolicyRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly proofObligationRefs: readonly string[];
  readonly evaluationGridContract?: SdlcEvaluationGridContract | null | undefined;
  readonly promptSections: readonly SdlcPromptSectionConstructionInput[];
}

function freezeStrings(values: readonly string[]): readonly string[] {
  return Object.freeze(values.map((value) => value));
}

function nonEmptyString(value: string, label: string): string {
  if (value.trim().length === 0) {
    throw new TypeError(`${label}: non-empty string required`);
  }
  return value;
}

function freezeNonEmptyStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  return Object.freeze(
    values.map((value, index) => nonEmptyString(value, `${label}[${index}]`))
  );
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function assertNoRawHistoryCarrierRef(ref: string, label: string): void {
  if (/raw[-_]?replay|raw[-_]?history|history[-_]?dump/u.test(ref)) {
    throw new TypeError(`${label}: disambiguation carrier must be scoped`);
  }
}

function authorityPolicyRow(
  promptFamily: SdlcPromptFamily
): SdlcPromptAuthorityPolicyRow {
  return Object.freeze({
    kind: "sdlc_prompt_authority_policy_row",
    rowRef: `prompt-authority-compression://odd-sdlc/${promptFamily}`,
    promptFamily,
    normalAuthorityKinds: SDLC_PROMPT_NORMAL_AUTHORITY_KIND_REFS,
    boundedFallbackAuthorityKinds: SDLC_PROMPT_BOUNDED_FALLBACK_AUTHORITY_KIND_REFS,
    forbiddenRoutineAuthorityKinds: Object.freeze([
      "sibling_workspace_history"
    ] as const),
    fallbackPrecondition:
      "Only inspect fallback authority for a named unresolved provenance, import, intent, or forensic discrepancy that cannot be resolved from normal authority refs."
  });
}

export const SDLC_PROMPT_AUTHORITY_POLICY_ROWS = Object.freeze([
  authorityPolicyRow("transform"),
  authorityPolicyRow("evaluate_design_depth"),
  authorityPolicyRow("evaluate_review_grade")
] as const);

function promptAuthorityPolicyFor(
  promptFamily: SdlcPromptFamily
): SdlcPromptAuthorityPolicyRow {
  const row = SDLC_PROMPT_AUTHORITY_POLICY_ROWS.find(
    (candidate) => candidate.promptFamily === promptFamily
  );
  if (row === undefined) {
    throw new TypeError(`${promptFamily}: prompt authority policy row missing`);
  }
  return row;
}

function promptHeaderLines(input: {
  readonly promptFamily: SdlcPromptFamily;
  readonly constructorRef: string;
  readonly methodCompressionRefs: readonly string[];
}): readonly string[] {
  return Object.freeze([
    SPEC_METHOD_PROMPT_OPENING_LINE,
    "Typed prompt asset:",
    "- kind: sdlc_prompt_invocation_asset",
    `- promptFamily: ${input.promptFamily}`,
    `- constructorRef: ${input.constructorRef}`,
    "- rendered Markdown is a view over a GTL Node/AssetSurface and SDLC prompt clause rows.",
    "- F_D constructs authority packets, refs, section provenance, and renderer views only; F_P owns semantic construction/evaluation judgment.",
    "- Shared method input uses installed authority-compression refs before raw standards documents:",
    ...input.methodCompressionRefs.map((ref) => `  - ${ref}`)
  ]);
}

function promptTextWithHeader(input: {
  readonly bodyText: string;
  readonly headerLines: readonly string[];
}): string {
  const lines = input.bodyText.split(/\r?\n/u);
  return [
    ...input.headerLines,
    "",
    ...lines
  ].join("\n");
}

function renderPromptBodyFromSections(
  sections: readonly SdlcPromptSectionConstructionInput[]
): string {
  const lines: string[] = [];
  for (const section of sections) {
    for (const clause of section.clauses) {
      lines.push(...clause.textLines);
    }
  }
  return lines.join("\n");
}

function defaultModeForSectionRole(
  role: SdlcPromptSectionRole
): SdlcPromptClauseMode {
  switch (role) {
    case "fallback":
      return "fallback";
    case "prohibition":
      return "prohibition";
    case "output_contract":
    case "self_check":
      return "output_schema";
    case "read_order":
    case "tool_boundary":
      return "imperative_guardrail";
    case "purpose":
    case "authority_packet":
    case "carried_context":
    case "evidence_payload":
    case "prompt_body":
      return "declarative_axiom";
  }
}

export function sdlcPromptAuthorityCompressionFallbackPreconditionRef(
  promptFamily: SdlcPromptFamily
): string {
  return `prompt-authority-compression://odd-sdlc/${promptFamily}#fallback-precondition`;
}

export function sdlcPromptSectionFromLines(input: {
  readonly sectionId?: string | undefined;
  readonly role: SdlcPromptSectionRole;
  readonly title: string;
  readonly textLines: readonly string[];
  readonly intent: string;
  readonly authorityKindRefs?: readonly SdlcPromptAuthorityKind[] | undefined;
  readonly fallbackPreconditionRefs?: readonly string[] | undefined;
  readonly mode?: SdlcPromptClauseMode | undefined;
  readonly expectedOutcome: string;
  readonly failureModeAddressed: string;
  readonly appliesWhen: string;
  readonly provenanceRefs?: readonly string[] | undefined;
  readonly authorityBasisRefs?: readonly string[] | undefined;
}): SdlcPromptSectionConstructionInput {
  return Object.freeze({
    sectionId: input.sectionId,
    role: input.role,
    title: input.title,
    clauses: Object.freeze([
      Object.freeze({
        textLines: freezeStrings(input.textLines),
        intent: input.intent,
        provenanceRefs: input.provenanceRefs,
        authorityBasisRefs: input.authorityBasisRefs,
        authorityKindRefs: Object.freeze([
          ...(input.authorityKindRefs ?? SDLC_PROMPT_NORMAL_AUTHORITY_KIND_REFS)
        ]),
        fallbackPreconditionRefs: input.fallbackPreconditionRefs,
        mode: input.mode ?? defaultModeForSectionRole(input.role),
        expectedOutcome: input.expectedOutcome,
        failureModeAddressed: input.failureModeAddressed,
        appliesWhen: input.appliesWhen
      })
    ])
  });
}

function admittedEvaluationDimension(
  dimension: SdlcEvaluationDimensionRef,
  index: number
): SdlcEvaluationDimensionRef {
  nonEmptyString(dimension.dimensionRef, `evaluationDimensions[${index}].dimensionRef`);
  nonEmptyString(
    dimension.expectedFindingRef,
    `evaluationDimensions[${index}].expectedFindingRef`
  );
  if (!SDLC_EVALUATION_DIMENSION_SCOPES.includes(dimension.scope)) {
    throw new TypeError(
      `${dimension.dimensionRef}: evaluation dimension scope is not admitted`
    );
  }
  if (
    dimension.scope === "cell" &&
    /coverage|closure|global/u.test(dimension.dimensionRef.toLowerCase())
  ) {
    throw new TypeError(
      `${dimension.dimensionRef}: coverage/closure/global dimensions are not cell dimensions`
    );
  }
  return Object.freeze({
    kind: "sdlc_evaluation_dimension_ref" as const,
    dimensionRef: dimension.dimensionRef,
    scope: dimension.scope,
    expectedFindingRef: dimension.expectedFindingRef
  });
}

function admittedTransformUnit(
  unit: SdlcTransformUnitRef,
  index: number
): SdlcTransformUnitRef {
  nonEmptyString(unit.unitRef, `transformUnits[${index}].unitRef`);
  nonEmptyString(unit.segmentKey, `transformUnits[${index}].segmentKey`);
  return Object.freeze({
    kind: "sdlc_transform_unit_ref" as const,
    unitRef: unit.unitRef,
    segmentKey: unit.segmentKey,
    sourceAssetRefs: freezeNonEmptyStrings(
      unit.sourceAssetRefs,
      `transformUnits[${index}].sourceAssetRefs`
    ),
    targetAssetRefs: freezeNonEmptyStrings(
      unit.targetAssetRefs,
      `transformUnits[${index}].targetAssetRefs`
    ),
    obligationRefs: freezeStrings(unit.obligationRefs)
  });
}

function admittedDisambiguationCarrier(
  carrier: SdlcDisambiguationCarrierRef,
  index: number
): SdlcDisambiguationCarrierRef {
  nonEmptyString(
    carrier.carrierRef,
    `disambiguationCarriers[${index}].carrierRef`
  );
  nonEmptyString(
    carrier.scopeRef,
    `disambiguationCarriers[${index}].scopeRef`
  );
  assertNoRawHistoryCarrierRef(
    carrier.carrierRef,
    `disambiguationCarriers[${index}].carrierRef`
  );
  assertNoRawHistoryCarrierRef(
    carrier.scopeRef,
    `disambiguationCarriers[${index}].scopeRef`
  );
  const authoritySnapshotRefs = freezeStrings(carrier.authoritySnapshotRefs);
  const priorFindingRefs = freezeStrings(carrier.priorFindingRefs);
  const lineageRefs = freezeStrings(carrier.lineageRefs);
  if (
    authoritySnapshotRefs.length === 0 &&
    priorFindingRefs.length === 0 &&
    lineageRefs.length === 0
  ) {
    throw new TypeError(
      `${carrier.carrierRef}: disambiguation carrier needs scoped authority, prior finding, or lineage refs`
    );
  }
  return Object.freeze({
    kind: "sdlc_disambiguation_carrier_ref" as const,
    carrierRef: carrier.carrierRef,
    scopeRef: carrier.scopeRef,
    authoritySnapshotRefs,
    priorFindingRefs,
    lineageRefs
  });
}

export function constructSdlcEvaluationGridContract(
  input: SdlcEvaluationGridContractConstructionInput
): SdlcEvaluationGridContract {
  nonEmptyString(input.logicalGridRef, "logicalGridRef");
  nonEmptyString(input.abgOutcomeFoldRef, "abgOutcomeFoldRef");
  if (!SDLC_EVALUATION_GRID_PHYSICAL_EXECUTIONS.includes(input.physicalExecution)) {
    throw new TypeError(
      `${input.physicalExecution}: evaluation-grid physical execution is not admitted`
    );
  }
  if (input.transformUnits.length === 0) {
    throw new TypeError("evaluation grid requires at least one transform unit");
  }
  if (input.evaluationDimensions.length === 0) {
    throw new TypeError("evaluation grid requires at least one dimension");
  }
  const transformUnits = Object.freeze(
    input.transformUnits.map((unit, index) =>
      admittedTransformUnit(unit, index)
    )
  );
  const evaluationDimensions = Object.freeze(
    input.evaluationDimensions.map((dimension, index) =>
      admittedEvaluationDimension(dimension, index)
    )
  );
  const expectedFindingRefs = freezeNonEmptyStrings(
    input.expectedFindingRefs,
    "expectedFindingRefs"
  );
  const expectedFindingRefSet = new Set(expectedFindingRefs);
  for (const dimension of evaluationDimensions) {
    if (!expectedFindingRefSet.has(dimension.expectedFindingRef)) {
      throw new TypeError(
        `${dimension.dimensionRef}: expected finding ref missing from grid`
      );
    }
  }
  const semanticDimensionCount = evaluationDimensions.filter(
    (dimension) => dimension.scope !== "fold"
  ).length;
  const minimumCarrierCount =
    (semanticDimensionCount * transformUnits.length) +
    evaluationDimensions.filter((dimension) => dimension.scope === "fold").length;
  if (input.disambiguationCarriers.length < minimumCarrierCount) {
    throw new TypeError(
      "evaluation grid requires scoped carriers for every cell/relation plus fold inputs"
    );
  }
  const disambiguationCarriers = Object.freeze(
    input.disambiguationCarriers.map((carrier, index) =>
      admittedDisambiguationCarrier(carrier, index)
    )
  );
  return Object.freeze({
    kind: "sdlc_evaluation_grid_contract" as const,
    gridVersion: SDLC_EVALUATION_GRID_CONTRACT_VERSION,
    logicalGridRef: input.logicalGridRef,
    physicalExecution: input.physicalExecution,
    transformUnits,
    evaluationDimensions,
    disambiguationCarriers,
    expectedFindingRefs,
    abgOutcomeFoldRef: input.abgOutcomeFoldRef,
    provenanceRefs: freezeNonEmptyStrings(input.provenanceRefs, "provenanceRefs")
  });
}

export function sdlcPromptSectionForEvaluationGridContract(input: {
  readonly evaluationGridContract: SdlcEvaluationGridContract;
}): SdlcPromptSectionConstructionInput {
  const grid = input.evaluationGridContract;
  const unitLines = grid.transformUnits.flatMap((unit) => [
    `- unitRef=${unit.unitRef}; segmentKey=${unit.segmentKey}`,
    `  sourceAssetRefs=${unit.sourceAssetRefs.join(", ") || "none"}`,
    `  targetAssetRefs=${unit.targetAssetRefs.join(", ") || "none"}`,
    `  obligationRefs=${unit.obligationRefs.join(", ") || "none"}`
  ]);
  const dimensionLines = grid.evaluationDimensions.map(
    (dimension) =>
      `- dimensionRef=${dimension.dimensionRef}; scope=${dimension.scope}; expectedFindingRef=${dimension.expectedFindingRef}`
  );
  const carrierLines = grid.disambiguationCarriers.map(
    (carrier) =>
      `- carrierRef=${carrier.carrierRef}; scopeRef=${carrier.scopeRef}; authoritySnapshots=${carrier.authoritySnapshotRefs.length}; priorFindings=${carrier.priorFindingRefs.length}; lineageRefs=${carrier.lineageRefs.length}`
  );
  return sdlcPromptSectionFromLines({
    role: "carried_context",
    title: "evaluation grid contract",
    textLines: Object.freeze([
      "Evaluation grid contract:",
      `- kind: ${grid.kind}`,
      `- logicalGridRef: ${grid.logicalGridRef}`,
      `- physicalExecution: ${grid.physicalExecution}`,
      `- abgOutcomeFoldRef: ${grid.abgOutcomeFoldRef}`,
      "Transform units:",
      ...unitLines,
      "Evaluation dimensions:",
      ...dimensionLines,
      "Scoped disambiguation carriers:",
      ...carrierLines,
      `Expected finding refs: ${grid.expectedFindingRefs.join(", ")}`,
      "Local F_P cells decide only declared semantic dimensions. Coverage is a structural fold over refs; closure and continuation remain ABG fold outputs."
    ]),
    intent:
      "Expose the logical segment-by-dimension evaluation contract before rendering a fused or bounded evaluator prompt.",
    authorityKindRefs: Object.freeze([
      "requirements",
      "admitted_design",
      "typed_obligations",
      "target_carrier",
      "worker_report_evidence",
      "materialization_evidence",
      "execution_evidence",
      "method_compression"
    ] as const),
    expectedOutcome:
      "Evaluator work remains bounded by typed segment, dimension, carrier, expected-finding, and ABG fold refs.",
    failureModeAddressed:
      "one evaluator turn reconstructing global coverage, closure pressure, trace binding, and local semantic judgment as an untyped mini-SDLC",
    appliesWhen: "evaluate.C prompt construction for a prompt-bearing evaluator"
  });
}

function typedPromptHeaderSection(input: {
  readonly promptFamily: SdlcPromptFamily;
  readonly recipient: SdlcPromptRecipient;
  readonly constructorRef: string;
  readonly methodCompressionRefs: readonly string[];
  readonly headerLines: readonly string[];
}): SdlcPromptSectionRow {
  const policy = promptAuthorityPolicyFor(input.promptFamily);
  const sectionId = `prompt-section://odd-sdlc/${input.promptFamily}/typed-header`;
  const clauseId = `prompt-clause://odd-sdlc/${input.promptFamily}/typed-header`;
  const clause = Object.freeze({
    kind: "sdlc_prompt_clause_row" as const,
    clauseVersion: SDLC_PROMPT_CLAUSE_ROW_VERSION,
    clauseId,
    textLines: freezeStrings(input.headerLines),
    intent:
      "Bind the rendered Markdown view to the GTL AssetSurface and installed method-compression refs.",
    provenanceRefs: Object.freeze([
      "REQ-F-ODDSDLC-087",
      "REQ-L-GTL3-ASSET-SURFACE",
      "specification/PRODUCT.md#prompt-bearing-generic-edges"
    ]),
    authorityBasisRefs: Object.freeze([
      input.constructorRef,
      policy.rowRef,
      ...input.methodCompressionRefs
    ]),
    authorityKindRefs: Object.freeze(["method_compression"] as const),
    fallbackPreconditionRefs: Object.freeze([] as const),
    recipient: input.recipient,
    mode: "declarative_axiom",
    expectedOutcome:
      "Rendered prompt provenance is inspectable without replacing F_P semantic judgment.",
    failureModeAddressed:
      "orphan prompt prose or unversioned method text embedded as an untyped prompt blob",
    appliesWhen: "production prompt rendering for an F_P transform/evaluate invocation",
    supersedesClauseRefs: Object.freeze([] as const)
  }) satisfies SdlcPromptClauseRow;
  return Object.freeze({
    kind: "sdlc_prompt_section_row" as const,
    sectionId,
    role: "authority_packet",
    title: "typed prompt asset",
    clauseRefs: Object.freeze([clauseId]),
    clauses: Object.freeze([clause])
  });
}

function sectionRowsForConstructionInput(input: {
  readonly promptFamily: SdlcPromptFamily;
  readonly recipient: SdlcPromptRecipient;
  readonly sections: readonly SdlcPromptSectionConstructionInput[];
  readonly constructorRef: string;
  readonly methodCompressionRefs: readonly string[];
}): readonly SdlcPromptSectionRow[] {
  const policy = promptAuthorityPolicyFor(input.promptFamily);
  return Object.freeze(
    input.sections.map((section, sectionIndex): SdlcPromptSectionRow => {
      if (section.clauses.length === 0) {
        throw new TypeError(`${section.title}: prompt section has no clauses`);
      }
      const sectionId =
        section.sectionId ??
        `prompt-section://odd-sdlc/${input.promptFamily}/${sectionIndex + 1}`;
      const clauses = Object.freeze(
        section.clauses.map((clauseInput, clauseIndex): SdlcPromptClauseRow => {
          const clauseId =
            clauseInput.clauseId ??
            `${sectionId}/clause-${clauseIndex + 1}`;
          return Object.freeze({
            kind: "sdlc_prompt_clause_row" as const,
            clauseVersion: SDLC_PROMPT_CLAUSE_ROW_VERSION,
            clauseId,
            textLines: freezeStrings(clauseInput.textLines),
            intent: clauseInput.intent,
            provenanceRefs: freezeStrings(
              clauseInput.provenanceRefs ?? [
                "REQ-F-ODDSDLC-083",
                "REQ-F-ODDSDLC-087",
                "REQ-L-GTL3-ASSET-SURFACE",
                "specification/PRODUCT.md#prompt-bearing-generic-edges"
              ]
            ),
            authorityBasisRefs: freezeStrings([
              input.constructorRef,
              policy.rowRef,
              ...input.methodCompressionRefs,
              ...(clauseInput.authorityBasisRefs ?? [])
            ]),
            authorityKindRefs: Object.freeze([...clauseInput.authorityKindRefs]),
            fallbackPreconditionRefs: freezeStrings(
              clauseInput.fallbackPreconditionRefs ?? []
            ),
            recipient: input.recipient,
            mode: clauseInput.mode,
            expectedOutcome: clauseInput.expectedOutcome,
            failureModeAddressed: clauseInput.failureModeAddressed,
            appliesWhen: clauseInput.appliesWhen,
            supersedesClauseRefs: freezeStrings(
              clauseInput.supersedesClauseRefs ?? []
            )
          });
        })
      );
      return Object.freeze({
        kind: "sdlc_prompt_section_row" as const,
        sectionId,
        role: section.role,
        title: section.title,
        clauseRefs: Object.freeze(clauses.map((clause) => clause.clauseId)),
        clauses
      });
    })
  );
}

function authorityDispositionFor(input: {
  readonly policy: SdlcPromptAuthorityPolicyRow;
  readonly authorityKind: SdlcPromptAuthorityKind;
}): AssetSurfaceAuthoritySlotDisposition {
  if (input.policy.normalAuthorityKinds.includes(input.authorityKind)) {
    return "normal";
  }
  if (input.policy.boundedFallbackAuthorityKinds.includes(input.authorityKind)) {
    return "bounded_fallback";
  }
  if (input.policy.forbiddenRoutineAuthorityKinds.includes(input.authorityKind)) {
    return "forbidden_routine";
  }
  throw new TypeError(
    `${input.authorityKind}: authority kind is not registered for ${input.policy.promptFamily}`
  );
}

function gtlAuthoritySlotsForPolicy(
  policy: SdlcPromptAuthorityPolicyRow
): readonly AssetSurfaceAuthoritySlot[] {
  return Object.freeze(
    SDLC_PROMPT_AUTHORITY_KINDS.map((authorityKind): AssetSurfaceAuthoritySlot => {
      const disposition = authorityDispositionFor({ policy, authorityKind });
      return Object.freeze({
        authorityKindRef: authorityKind,
        disposition,
        fallbackPreconditionRefs:
          disposition === "bounded_fallback"
            ? Object.freeze([
              sdlcPromptAuthorityCompressionFallbackPreconditionRef(
                policy.promptFamily
              )
            ])
            : Object.freeze([])
      });
    })
  );
}

function assertSdlcPromptAuthorityOverlay(input: {
  readonly promptFamily: SdlcPromptFamily;
  readonly sections: readonly SdlcPromptSectionRow[];
}): void {
  const policy = promptAuthorityPolicyFor(input.promptFamily);
  const normal = new Set(policy.normalAuthorityKinds);
  const bounded = new Set(policy.boundedFallbackAuthorityKinds);
  const forbidden = new Set(policy.forbiddenRoutineAuthorityKinds);
  for (const section of input.sections) {
    if (!SDLC_PROMPT_SECTION_ROLES.includes(section.role)) {
      throw new TypeError(`${section.sectionId}: unregistered prompt section role`);
    }
    for (const clause of section.clauses) {
      if (!SDLC_PROMPT_CLAUSE_MODES.includes(clause.mode)) {
        throw new TypeError(`${clause.clauseId}: unregistered prompt clause mode`);
      }
      if (clause.textLines.length === 0) {
        throw new TypeError(`${clause.clauseId}: prompt clause has no rendered lines`);
      }
      const hasBoundedAuthority = clause.authorityKindRefs.some((authorityKind) =>
        bounded.has(authorityKind)
      );
      if (!hasBoundedAuthority && clause.fallbackPreconditionRefs.length > 0) {
        throw new TypeError(
          `${clause.clauseId}: fallback precondition refs require bounded fallback authority`
        );
      }
      for (const authorityKind of clause.authorityKindRefs) {
        if (forbidden.has(authorityKind)) {
          throw new TypeError(
            `${clause.clauseId}: forbidden routine prompt authority ${authorityKind}`
          );
        }
        if (
          !normal.has(authorityKind) &&
          !bounded.has(authorityKind)
        ) {
          throw new TypeError(
            `${clause.clauseId}: authority kind ${authorityKind} is not registered for ${input.promptFamily}`
          );
        }
        if (
          bounded.has(authorityKind) &&
          clause.fallbackPreconditionRefs.length === 0
        ) {
          throw new TypeError(
            `${clause.clauseId}: bounded fallback prompt authority requires fallback precondition`
          );
        }
        if (
          bounded.has(authorityKind) &&
          section.role !== "authority_packet" &&
          section.role !== "fallback"
        ) {
          throw new TypeError(
            `${clause.clauseId}: bounded fallback prompt authority is not routine authority for ${section.role}`
          );
        }
      }
    }
  }
}

function constructorInputAssetKindsFor(
  promptFamily: SdlcPromptFamily
): readonly string[] {
  switch (promptFamily) {
    case "transform":
      return Object.freeze([
        "edge_contract",
        "construction_brief",
        "invocation_package",
        "obligation_set",
        "target_carrier",
        "tenant_tool_policy",
        "output_carrier",
        "proof_obligations",
        "method_compression"
      ]);
    case "evaluate_design_depth":
      return Object.freeze([
        "edge_contract",
        "construction_brief",
        "draft_content_register",
        "worker_report_summary",
        "selected_composition",
        "tenant_tool_policy",
        "output_carrier",
        "method_compression"
      ]);
    case "evaluate_review_grade":
      return Object.freeze([
        "edge_contract",
        "construction_brief",
        "invocation_package",
        "worker_report",
        "materialization_evidence",
        "design_depth_refs",
        "tenant_tool_policy",
        "output_carrier",
        "method_compression"
      ]);
  }
}

function constructPromptAssetSurface(input: {
  readonly promptFamily: SdlcPromptFamily;
  readonly stage: SdlcPromptStage;
  readonly constructorRef: string;
  readonly authorityPacketRefs: readonly string[];
  readonly obligationRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly proofObligationRefs: readonly string[];
  readonly methodCompressionRefs: readonly string[];
  readonly promptSections: readonly SdlcPromptSectionRow[];
}): AssetSurface {
  const policy = promptAuthorityPolicyFor(input.promptFamily);
  return admitAssetSurface(
    constructAssetSurface({
      kind: `gtl.asset_surface/odd_sdlc.prompt/${input.promptFamily}/v1`,
      requiredContexts: uniqueStrings([
        ...input.authorityPacketRefs,
        ...input.obligationRefs
      ]),
      standardsRefs: input.methodCompressionRefs,
      outputContractRefs: input.outputCarrierRefs,
      constructorRefs: Object.freeze([input.constructorRef]),
      constructorInputAssetKinds: constructorInputAssetKindsFor(input.promptFamily),
      rendererRefs: Object.freeze([
        `prompt-renderer://odd-sdlc/${input.stage}/markdown/v1`
      ]),
      renderedViewDigestPolicyRef:
        "digest-policy://odd-sdlc/prompt-rendered-view/sha256",
      sectionKindRefs: uniqueStrings(
        input.promptSections.map(
          (section) => `prompt-section-role://odd-sdlc/${section.role}`
        )
      ),
      clauseKindRefs: uniqueStrings(
        input.promptSections.flatMap((section) =>
          section.clauses.map(
            (clause) => `prompt-clause-mode://odd-sdlc/${clause.mode}`
          )
        )
      ),
      authoritySlots: gtlAuthoritySlotsForPolicy(policy),
      proofObligationRefs: input.proofObligationRefs
    }),
    `odd_sdlc prompt AssetSurface ${input.promptFamily}`
  );
}

function constructPromptGtlNode(input: {
  readonly promptFamily: SdlcPromptFamily;
  readonly stage: SdlcPromptStage;
  readonly targetAssetType: string;
  readonly renderedPromptDigest: string;
  readonly assetSurface: AssetSurface;
}): Node {
  const digestId = input.renderedPromptDigest.replace(/^sha256:/u, "");
  return constructNode({
    name: `odd_sdlc ${input.promptFamily} prompt`,
    schema: {
      kind: "symbolic",
      ref: `schema://odd-sdlc/prompt/${input.promptFamily}/gtl-node/v1`
    },
    markov: Object.freeze([
      input.stage,
      input.promptFamily,
      input.targetAssetType,
      input.renderedPromptDigest
    ]),
    assetSurface: input.assetSurface,
    tags: Object.freeze([
      "odd_sdlc",
      "prompt",
      input.promptFamily,
      input.stage,
      input.targetAssetType
    ]),
    id: `node://odd-sdlc/prompt/${input.promptFamily}/${digestId}`
  });
}

export function constructSdlcPromptInvocationProjection(
  input: SdlcPromptInvocationProjectionInput
): SdlcRenderedPromptProjection {
  const methodCompressionRefs = freezeStrings(SDLC_METHOD_AUTHORITY_COMPRESSION_REFS);
  const declaredSections =
    input.evaluationGridContract === null ||
    input.evaluationGridContract === undefined
      ? input.promptSections
      : Object.freeze([
          ...input.promptSections.slice(0, 1),
          sdlcPromptSectionForEvaluationGridContract({
            evaluationGridContract: input.evaluationGridContract
          }),
          ...input.promptSections.slice(1)
        ]);
  const headerLines = promptHeaderLines({
    promptFamily: input.promptFamily,
    constructorRef: input.constructorRef,
    methodCompressionRefs
  });
  const bodyText = renderPromptBodyFromSections(declaredSections);
  const promptText = promptTextWithHeader({
    bodyText,
    headerLines
  });
  const bodySectionRows = sectionRowsForConstructionInput({
    promptFamily: input.promptFamily,
    recipient: input.recipient,
    sections: declaredSections,
    constructorRef: input.constructorRef,
    methodCompressionRefs
  });
  const headerSectionRow = typedPromptHeaderSection({
    promptFamily: input.promptFamily,
    recipient: input.recipient,
    constructorRef: input.constructorRef,
    methodCompressionRefs,
    headerLines
  });
  const promptSections = Object.freeze([
    ...bodySectionRows.slice(0, 1),
    headerSectionRow,
    ...bodySectionRows.slice(1)
  ]);
  assertSdlcPromptAuthorityOverlay({
    promptFamily: input.promptFamily,
    sections: promptSections
  });
  const renderedPromptDigest = sha256Text(promptText);
  const assetSurface = constructPromptAssetSurface({
    promptFamily: input.promptFamily,
    stage: input.stage,
    constructorRef: input.constructorRef,
    authorityPacketRefs: input.authorityPacketRefs,
    obligationRefs: input.obligationRefs,
    outputCarrierRefs: input.outputCarrierRefs,
    proofObligationRefs: input.proofObligationRefs,
    methodCompressionRefs,
    promptSections
  });
  const gtlNode = constructPromptGtlNode({
    promptFamily: input.promptFamily,
    stage: input.stage,
    targetAssetType: input.targetAssetType,
    renderedPromptDigest,
    assetSurface
  });
  const invocationAsset = Object.freeze({
    kind: "sdlc_prompt_invocation_asset" as const,
    invocationVersion: SDLC_PROMPT_INVOCATION_ASSET_VERSION,
    promptFamily: input.promptFamily,
    stage: input.stage,
    targetAssetType: input.targetAssetType,
    workCategory: input.workCategory ?? null,
    edgePolicyRef: input.edgePolicyRef ?? null,
    constructorRef: input.constructorRef,
    authorityPacketRefs: freezeStrings(input.authorityPacketRefs),
    obligationRefs: freezeStrings(input.obligationRefs),
    toolEffectPolicyRefs: freezeStrings(input.toolEffectPolicyRefs),
    outputCarrierRefs: freezeStrings(input.outputCarrierRefs),
    proofObligationRefs: freezeStrings(input.proofObligationRefs),
    methodCompressionRefs,
    evaluationGridContract: input.evaluationGridContract ?? null,
    gtlNode,
    promptSections,
    renderedPromptDigest
  }) satisfies SdlcPromptInvocationAsset;
  return Object.freeze({
    promptText,
    invocationAsset
  });
}
