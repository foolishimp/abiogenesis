// Implements: REQ-L-GTL3-GRAPHFUNCTION
// Implements: REQ-L-GTL3-JOB
// Implements: REQ-L-GTL3-COMPUTE-NOTATION
// Implements: REQ-R-ABG3-FN-COMPOSITION

import type {
  GraphFunction,
  GraphVector,
  Regime
} from "../../m01/contracts/carriers.js";
import type { Job } from "./carriers.js";

export type GtlComputeMeans = Regime;

export type GtlNonHumanComputeMeans = Exclude<GtlComputeMeans, "F_H">;

export type GtlCompositionHostSurfaceKind =
  | "graph_function"
  | "graph_vector"
  | "operator"
  | "evaluator"
  | "rule";

export type GtlCompositionDeclarationSourceKind =
  | "graph_vector_declaration"
  | "graph_function_declaration"
  | "operator_declaration"
  | "evaluator_declaration"
  | "rule_declaration"
  | "job_policy_hook"
  | "role_policy_hook"
  | "module_policy_hook"
  | "visible_defaults"
  | "published_template";

export interface GtlCompositionDeclarationSource {
  readonly kind: GtlCompositionDeclarationSourceKind;
  readonly sourceRef: string;
  readonly precedenceRank: number;
}

export interface GtlCompositionHostBinding {
  readonly surfaceKind: GtlCompositionHostSurfaceKind;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string | null;
  readonly sourceNodeRef: string | null;
  readonly targetNodeRef: string | null;
  readonly targetSchemaRef: string | null;
  readonly owningDeclarationRef: string | null;
}

export type GtlCompositionRegimeRole =
  | "construct"
  | "observe"
  | "validate"
  | "gate"
  | "diagnose"
  | "repair"
  | "rank"
  | "escalate"
  | "close"
  | "absentia";

export type GtlCompositionRegimeAuthority =
  | "candidate"
  | "evidence"
  | "judgment"
  | "closure";

export type GtlNonClosureCompositionRegimeAuthority = Exclude<
  GtlCompositionRegimeAuthority,
  "closure"
>;

export type GtlNonClosureCompositionRegimeRole = Exclude<
  GtlCompositionRegimeRole,
  "close"
>;

interface GtlCompositionRegimeBindingBase {
  readonly role: GtlCompositionRegimeRole;
  readonly order: number;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface GtlFdCompositionRegimeBinding
  extends GtlCompositionRegimeBindingBase {
  readonly regime: "F_D";
  readonly authority: GtlCompositionRegimeAuthority;
}

export interface GtlNonFdCompositionRegimeBinding
  extends Omit<GtlCompositionRegimeBindingBase, "role"> {
  readonly regime: "F_P" | "F_H";
  readonly role: GtlNonClosureCompositionRegimeRole;
  readonly authority: GtlNonClosureCompositionRegimeAuthority;
}

export type GtlCompositionRegimeBinding =
  | GtlFdCompositionRegimeBinding
  | GtlNonFdCompositionRegimeBinding;

export interface GtlSelectedCompositionNotation {
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly hostBinding: GtlCompositionHostBinding;
  readonly declarationSource: GtlCompositionDeclarationSource;
  readonly orderedRegimeBindings: readonly GtlCompositionRegimeBinding[];
  readonly standardsContextRefs: readonly string[];
  readonly policyContextRefs: readonly string[];
  readonly carrierContextRefs: readonly string[];
  readonly assuranceContextRefs: readonly string[];
  readonly closureContractRef: string;
  readonly optimizationContractRef: string | null;
}

export interface GtlFunctionCompositionNotation<A, B> {
  readonly graphFunction: GraphFunction;
  readonly job: Job;
  readonly graphVector: GraphVector | null;
  readonly composition: GtlSelectedCompositionNotation;
  readonly inputType?: A;
  readonly outputType?: B;
}

export type GtlStageRole = "transform" | "evaluate" | "consequence";

export type GtlComputePluginStageRole = GtlStageRole | "human_callout";

export type GtlComputePluginPurpose =
  | "candidate_construction"
  | "candidate_evaluation"
  | "consequence_projection"
  | "external_human_callout";

interface GtlComputePluginCategoryBindingBase<
  StageRole extends GtlComputePluginStageRole,
  ComputeMeans extends GtlComputeMeans,
  Purpose extends GtlComputePluginPurpose
> {
  readonly kind: "gtl_compute_plugin_category_binding";
  readonly stageRole: StageRole;
  readonly computeMeans: ComputeMeans;
  readonly purpose: Purpose;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly regimeBindingRef: string | null;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly mayWriteLedgers: false;
  readonly mayEmitRuntimeEvents: false;
  readonly maySelectTraversal: false;
  readonly mayCloseTraversal: false;
}

export type GtlTransformComputePluginCategoryBinding =
  GtlComputePluginCategoryBindingBase<
    "transform",
    GtlNonHumanComputeMeans,
    "candidate_construction"
  >;

export type GtlEvaluateComputePluginCategoryBinding =
  GtlComputePluginCategoryBindingBase<
    "evaluate",
    GtlNonHumanComputeMeans,
    "candidate_evaluation"
  >;

export type GtlConsequenceComputePluginCategoryBinding =
  GtlComputePluginCategoryBindingBase<
    "consequence",
    GtlNonHumanComputeMeans,
    "consequence_projection"
  >;

export interface GtlHumanCalloutComputePluginCategoryBinding
  extends GtlComputePluginCategoryBindingBase<
    "human_callout",
    "F_H",
    "external_human_callout"
  > {
  readonly humanWorkExternal: true;
  readonly responseAdmissionRequired: true;
}

export type GtlComputePluginCategoryBinding =
  | GtlTransformComputePluginCategoryBinding
  | GtlEvaluateComputePluginCategoryBinding
  | GtlConsequenceComputePluginCategoryBinding
  | GtlHumanCalloutComputePluginCategoryBinding;

export interface GtlCandidate<B> {
  readonly kind: "gtl_candidate";
  readonly value: B;
  readonly candidateRef: string;
  readonly evidenceRefs: readonly string[];
  readonly producedByRef: string;
}

export type GtlEvaluationCloseDispositionKind =
  | "close_proposed"
  | "retry_proposed"
  | "reprice_proposed"
  | "block_proposed"
  | "qualified_defer_proposed"
  | "human_required"
  | "no_close";

export const GTL_EVALUATION_SCOPE_KIND_VALUES = Object.freeze([
  "edge",
  "segment",
  "dimension_cell",
  "fold",
  "relation"
] as const);

export type GtlEvaluationScopeKind =
  (typeof GTL_EVALUATION_SCOPE_KIND_VALUES)[number];

export interface GtlEvaluationScopeRef {
  readonly kind: "gtl_evaluation_scope_ref";
  readonly scopeRef: string;
  readonly graphCallRef: string;
  readonly frameRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly vectorIndex: number;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly scopeTopologyRef: string;
  readonly scopeKind: GtlEvaluationScopeKind;
  readonly segmentRef: string | null;
  readonly dimensionRef: string | null;
  readonly relationRef: string | null;
}

export interface GtlEvaluationScopeRefInit {
  readonly scopeRef?: string | undefined;
  readonly graphCallRef: string;
  readonly frameRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly vectorIndex: number;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly scopeTopologyRef: string;
  readonly scopeKind: GtlEvaluationScopeKind;
  readonly segmentRef?: string | null | undefined;
  readonly dimensionRef?: string | null | undefined;
  readonly relationRef?: string | null | undefined;
}

export interface GtlContractFulfillmentBinding {
  readonly kind: "gtl_contract_fulfillment_binding";
  readonly bindingRef: string;
  readonly obligationRef: string;
  readonly requirementRef: string;
  readonly productRequirementRef: string;
  readonly designObligationRef: string;
  readonly componentRef: string;
  readonly productTargetRef: string;
  readonly outputSurfaceRef: string;
  readonly functionOrEntrypointRef: string;
  readonly realizationEvidenceRefs: readonly string[];
  readonly testOrExecutionEvidenceRefs: readonly string[];
  readonly evaluatorFindingRef: string;
  readonly authorityRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface GtlContractFulfillmentBindingInit {
  readonly bindingRef?: string | undefined;
  readonly obligationRef: string;
  readonly requirementRef: string;
  readonly productRequirementRef: string;
  readonly designObligationRef: string;
  readonly componentRef: string;
  readonly productTargetRef: string;
  readonly outputSurfaceRef: string;
  readonly functionOrEntrypointRef: string;
  readonly realizationEvidenceRefs: readonly string[];
  readonly testOrExecutionEvidenceRefs?: readonly string[] | undefined;
  readonly evaluatorFindingRef: string;
  readonly authorityRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}

function nonEmptyString(input: unknown, label: string): string {
  if (typeof input !== "string" || input.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return input;
}

function nullableNonEmptyString(
  input: unknown,
  label: string
): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  return nonEmptyString(input, label);
}

function nonNegativeInteger(input: unknown, label: string): number {
  if (typeof input !== "number" || !Number.isInteger(input) || input < 0) {
    throw new TypeError(`${label} must be a non-negative integer`);
  }
  return input;
}

function nonEmptyStringArray(
  input: unknown,
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  if (!Array.isArray(input)) {
    throw new TypeError(`${label} must be an array`);
  }
  if (input.length === 0 && options?.allowEmpty !== true) {
    throw new TypeError(`${label} must contain at least one ref`);
  }
  const seen = new Set<string>();
  const values: string[] = [];
  for (const [index, value] of input.entries()) {
    const ref = nonEmptyString(value, `${label}[${index}]`);
    if (seen.has(ref)) {
      throw new TypeError(`${label} contains duplicate ref ${JSON.stringify(ref)}`);
    }
    seen.add(ref);
    values.push(ref);
  }
  return Object.freeze(values);
}

function scopeKind(input: unknown, label: string): GtlEvaluationScopeKind {
  for (const value of GTL_EVALUATION_SCOPE_KIND_VALUES) {
    if (input === value) {
      return value;
    }
  }
  throw new TypeError(
    `${label}: expected evaluation scope kind, got ${JSON.stringify(input)}`
  );
}

function isPlainRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function assertNoForbiddenEngineAuthorityFields(
  record: Readonly<Record<string, unknown>>,
  label: string
): void {
  for (const field of [
    "runtimeEvents",
    "events",
    "ledger",
    "projection",
    "closureDecision",
    "closureKind",
    "transition",
    "nextVectorIndex",
    "closedVectorIndexes",
    "mayCloseTraversal",
    "mayEmitRuntimeEvents",
    "mayWriteLedger",
    "maySelectNextVector"
  ] as const) {
    if (Object.hasOwn(record, field)) {
      throw new TypeError(
        `${label}.${field}: GTL contract fulfillment binding cannot own engine authority`
      );
    }
  }
}

function assertNoValue(value: string | null, label: string): void {
  if (value !== null) {
    throw new TypeError(`${label} must be null for this evaluation scope kind`);
  }
}

function assertHasValue(value: string | null, label: string): void {
  if (value === null) {
    throw new TypeError(`${label} is required for this evaluation scope kind`);
  }
}

function assertEvaluationScopeShape(input: {
  readonly scopeKind: GtlEvaluationScopeKind;
  readonly segmentRef: string | null;
  readonly dimensionRef: string | null;
  readonly relationRef: string | null;
}): void {
  switch (input.scopeKind) {
    case "edge":
      assertNoValue(input.segmentRef, "GtlEvaluationScopeRef.segmentRef");
      assertNoValue(input.dimensionRef, "GtlEvaluationScopeRef.dimensionRef");
      assertNoValue(input.relationRef, "GtlEvaluationScopeRef.relationRef");
      return;
    case "segment":
      assertHasValue(input.segmentRef, "GtlEvaluationScopeRef.segmentRef");
      assertNoValue(input.dimensionRef, "GtlEvaluationScopeRef.dimensionRef");
      assertNoValue(input.relationRef, "GtlEvaluationScopeRef.relationRef");
      return;
    case "dimension_cell":
      assertHasValue(input.segmentRef, "GtlEvaluationScopeRef.segmentRef");
      assertHasValue(input.dimensionRef, "GtlEvaluationScopeRef.dimensionRef");
      assertNoValue(input.relationRef, "GtlEvaluationScopeRef.relationRef");
      return;
    case "fold":
      assertNoValue(input.segmentRef, "GtlEvaluationScopeRef.segmentRef");
      assertHasValue(input.dimensionRef, "GtlEvaluationScopeRef.dimensionRef");
      assertNoValue(input.relationRef, "GtlEvaluationScopeRef.relationRef");
      return;
    case "relation":
      assertNoValue(input.segmentRef, "GtlEvaluationScopeRef.segmentRef");
      assertNoValue(input.dimensionRef, "GtlEvaluationScopeRef.dimensionRef");
      assertHasValue(input.relationRef, "GtlEvaluationScopeRef.relationRef");
      return;
    default: {
      const exhaustive: never = input.scopeKind;
      throw new TypeError(
        `Unsupported evaluation scope kind ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function derivedEvaluationScopeRef(input: {
  readonly graphCallRef: string;
  readonly frameRef: string;
  readonly graphFunctionRef: string;
  readonly graphVectorRef: string;
  readonly vectorIndex: number;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly scopeTopologyRef: string;
  readonly scopeKind: GtlEvaluationScopeKind;
  readonly segmentRef: string | null;
  readonly dimensionRef: string | null;
  readonly relationRef: string | null;
}): string {
  return `gtl-evaluation-scope:${JSON.stringify(input)}`;
}

function derivedContractFulfillmentBindingRef(input: {
  readonly obligationRef: string;
  readonly requirementRef: string;
  readonly productRequirementRef: string;
  readonly designObligationRef: string;
  readonly componentRef: string;
  readonly productTargetRef: string;
  readonly outputSurfaceRef: string;
  readonly functionOrEntrypointRef: string;
  readonly evaluatorFindingRef: string;
}): string {
  return `gtl-contract-fulfillment-binding:${JSON.stringify(input)}`;
}

export function constructGtlEvaluationScopeRef(
  input: GtlEvaluationScopeRefInit
): GtlEvaluationScopeRef {
  const normalized = {
    graphCallRef: nonEmptyString(
      input.graphCallRef,
      "GtlEvaluationScopeRef.graphCallRef"
    ),
    frameRef: nonEmptyString(input.frameRef, "GtlEvaluationScopeRef.frameRef"),
    graphFunctionRef: nonEmptyString(
      input.graphFunctionRef,
      "GtlEvaluationScopeRef.graphFunctionRef"
    ),
    graphVectorRef: nonEmptyString(
      input.graphVectorRef,
      "GtlEvaluationScopeRef.graphVectorRef"
    ),
    vectorIndex: nonNegativeInteger(
      input.vectorIndex,
      "GtlEvaluationScopeRef.vectorIndex"
    ),
    compositionRef: nonEmptyString(
      input.compositionRef,
      "GtlEvaluationScopeRef.compositionRef"
    ),
    compositionDigest: nonEmptyString(
      input.compositionDigest,
      "GtlEvaluationScopeRef.compositionDigest"
    ),
    scopeTopologyRef: nonEmptyString(
      input.scopeTopologyRef,
      "GtlEvaluationScopeRef.scopeTopologyRef"
    ),
    scopeKind: scopeKind(input.scopeKind, "GtlEvaluationScopeRef.scopeKind"),
    segmentRef: nullableNonEmptyString(
      input.segmentRef,
      "GtlEvaluationScopeRef.segmentRef"
    ),
    dimensionRef: nullableNonEmptyString(
      input.dimensionRef,
      "GtlEvaluationScopeRef.dimensionRef"
    ),
    relationRef: nullableNonEmptyString(
      input.relationRef,
      "GtlEvaluationScopeRef.relationRef"
    )
  } satisfies Omit<GtlEvaluationScopeRef, "kind" | "scopeRef">;
  assertEvaluationScopeShape(normalized);
  return Object.freeze({
    kind: "gtl_evaluation_scope_ref" as const,
    scopeRef:
      input.scopeRef ??
      derivedEvaluationScopeRef({
        ...normalized
      }),
    ...normalized
  });
}

export function constructGtlContractFulfillmentBinding(
  input: GtlContractFulfillmentBindingInit
): GtlContractFulfillmentBinding {
  const normalized = {
    obligationRef: nonEmptyString(
      input.obligationRef,
      "GtlContractFulfillmentBinding.obligationRef"
    ),
    requirementRef: nonEmptyString(
      input.requirementRef,
      "GtlContractFulfillmentBinding.requirementRef"
    ),
    productRequirementRef: nonEmptyString(
      input.productRequirementRef,
      "GtlContractFulfillmentBinding.productRequirementRef"
    ),
    designObligationRef: nonEmptyString(
      input.designObligationRef,
      "GtlContractFulfillmentBinding.designObligationRef"
    ),
    componentRef: nonEmptyString(
      input.componentRef,
      "GtlContractFulfillmentBinding.componentRef"
    ),
    productTargetRef: nonEmptyString(
      input.productTargetRef,
      "GtlContractFulfillmentBinding.productTargetRef"
    ),
    outputSurfaceRef: nonEmptyString(
      input.outputSurfaceRef,
      "GtlContractFulfillmentBinding.outputSurfaceRef"
    ),
    functionOrEntrypointRef: nonEmptyString(
      input.functionOrEntrypointRef,
      "GtlContractFulfillmentBinding.functionOrEntrypointRef"
    ),
    realizationEvidenceRefs: nonEmptyStringArray(
      input.realizationEvidenceRefs,
      "GtlContractFulfillmentBinding.realizationEvidenceRefs"
    ),
    testOrExecutionEvidenceRefs: nonEmptyStringArray(
      input.testOrExecutionEvidenceRefs ?? Object.freeze([]),
      "GtlContractFulfillmentBinding.testOrExecutionEvidenceRefs",
      { allowEmpty: true }
    ),
    evaluatorFindingRef: nonEmptyString(
      input.evaluatorFindingRef,
      "GtlContractFulfillmentBinding.evaluatorFindingRef"
    ),
    authorityRefs: nonEmptyStringArray(
      input.authorityRefs ?? Object.freeze([]),
      "GtlContractFulfillmentBinding.authorityRefs",
      { allowEmpty: true }
    ),
    evidenceRefs: nonEmptyStringArray(
      input.evidenceRefs ?? Object.freeze([]),
      "GtlContractFulfillmentBinding.evidenceRefs",
      { allowEmpty: true }
    )
  } satisfies Omit<GtlContractFulfillmentBinding, "kind" | "bindingRef">;
  return Object.freeze({
    kind: "gtl_contract_fulfillment_binding" as const,
    bindingRef:
      input.bindingRef ??
      derivedContractFulfillmentBindingRef({
        obligationRef: normalized.obligationRef,
        requirementRef: normalized.requirementRef,
        productRequirementRef: normalized.productRequirementRef,
        designObligationRef: normalized.designObligationRef,
        componentRef: normalized.componentRef,
        productTargetRef: normalized.productTargetRef,
        outputSurfaceRef: normalized.outputSurfaceRef,
        functionOrEntrypointRef: normalized.functionOrEntrypointRef,
        evaluatorFindingRef: normalized.evaluatorFindingRef
      }),
    ...normalized
  });
}

export function admitGtlContractFulfillmentBinding(
  input: unknown,
  label = "GtlContractFulfillmentBinding"
): GtlContractFulfillmentBinding {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  const record = input;
  assertNoForbiddenEngineAuthorityFields(record, label);
  const kind = nonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "gtl_contract_fulfillment_binding") {
    throw new TypeError(
      `${label}.kind: expected "gtl_contract_fulfillment_binding", got ${JSON.stringify(kind)}`
    );
  }
  return constructGtlContractFulfillmentBinding({
    bindingRef: nonEmptyString(record["bindingRef"], `${label}.bindingRef`),
    obligationRef: nonEmptyString(record["obligationRef"], `${label}.obligationRef`),
    requirementRef: nonEmptyString(
      record["requirementRef"],
      `${label}.requirementRef`
    ),
    productRequirementRef: nonEmptyString(
      record["productRequirementRef"],
      `${label}.productRequirementRef`
    ),
    designObligationRef: nonEmptyString(
      record["designObligationRef"],
      `${label}.designObligationRef`
    ),
    componentRef: nonEmptyString(record["componentRef"], `${label}.componentRef`),
    productTargetRef: nonEmptyString(
      record["productTargetRef"],
      `${label}.productTargetRef`
    ),
    outputSurfaceRef: nonEmptyString(
      record["outputSurfaceRef"],
      `${label}.outputSurfaceRef`
    ),
    functionOrEntrypointRef: nonEmptyString(
      record["functionOrEntrypointRef"],
      `${label}.functionOrEntrypointRef`
    ),
    realizationEvidenceRefs: nonEmptyStringArray(
      record["realizationEvidenceRefs"],
      `${label}.realizationEvidenceRefs`
    ),
    testOrExecutionEvidenceRefs: nonEmptyStringArray(
      record["testOrExecutionEvidenceRefs"],
      `${label}.testOrExecutionEvidenceRefs`,
      { allowEmpty: true }
    ),
    evaluatorFindingRef: nonEmptyString(
      record["evaluatorFindingRef"],
      `${label}.evaluatorFindingRef`
    ),
    authorityRefs: nonEmptyStringArray(
      record["authorityRefs"],
      `${label}.authorityRefs`,
      { allowEmpty: true }
    ),
    evidenceRefs: nonEmptyStringArray(
      record["evidenceRefs"],
      `${label}.evidenceRefs`,
      { allowEmpty: true }
    )
  });
}

export function admitGtlEvaluationScopeRef(
  input: unknown,
  label = "GtlEvaluationScopeRef"
): GtlEvaluationScopeRef {
  if (!isPlainRecord(input)) {
    throw new TypeError(`${label}: expected a plain object`);
  }
  const record = input;
  const kind = nonEmptyString(record["kind"], `${label}.kind`);
  if (kind !== "gtl_evaluation_scope_ref") {
    throw new TypeError(
      `${label}.kind: expected "gtl_evaluation_scope_ref", got ${JSON.stringify(kind)}`
    );
  }
  return constructGtlEvaluationScopeRef({
    scopeRef: nonEmptyString(record["scopeRef"], `${label}.scopeRef`),
    graphCallRef: nonEmptyString(record["graphCallRef"], `${label}.graphCallRef`),
    frameRef: nonEmptyString(record["frameRef"], `${label}.frameRef`),
    graphFunctionRef: nonEmptyString(
      record["graphFunctionRef"],
      `${label}.graphFunctionRef`
    ),
    graphVectorRef: nonEmptyString(
      record["graphVectorRef"],
      `${label}.graphVectorRef`
    ),
    vectorIndex: nonNegativeInteger(record["vectorIndex"], `${label}.vectorIndex`),
    compositionRef: nonEmptyString(
      record["compositionRef"],
      `${label}.compositionRef`
    ),
    compositionDigest: nonEmptyString(
      record["compositionDigest"],
      `${label}.compositionDigest`
    ),
    scopeTopologyRef: nonEmptyString(
      record["scopeTopologyRef"],
      `${label}.scopeTopologyRef`
    ),
    scopeKind: scopeKind(record["scopeKind"], `${label}.scopeKind`),
    segmentRef: nullableNonEmptyString(record["segmentRef"], `${label}.segmentRef`),
    dimensionRef: nullableNonEmptyString(
      record["dimensionRef"],
      `${label}.dimensionRef`
    ),
    relationRef: nullableNonEmptyString(
      record["relationRef"],
      `${label}.relationRef`
    )
  });
}

export interface GtlEvaluationFindingRef {
  readonly kind: "gtl_evaluation_finding_ref";
  readonly findingRef: string;
  readonly evaluatorRef: string;
  readonly hookActionRef: string | null;
  readonly gainReportRef: string | null;
  readonly metricsRef: string | null;
  readonly closeDisposition: GtlEvaluationCloseDispositionKind;
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly compositionContributionRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly diagnosticRefs: readonly string[];
  readonly evaluationScopeRef?: GtlEvaluationScopeRef | null | undefined;
}

export interface GtlEvaluation {
  readonly kind: "gtl_evaluation";
  readonly subjectRef: string;
  readonly candidateRef: string;
  readonly evaluationRef: string;
  readonly findings: readonly GtlEvaluationFindingRef[];
  readonly diagnosticRefs: readonly string[];
}

export interface GtlAdmittedStateRef {
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly graphCallRef: string;
  readonly frameRef: string;
  readonly eventRefs: readonly string[];
  readonly ledgerRefs: readonly string[];
  readonly projectionRefs: readonly string[];
}

export interface GtlConsequenceProjectionRef {
  readonly consequenceRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly compositionSelectionRef: string;
  readonly assuranceDecisionRef: string | null;
  readonly traversalTransitionRef: string | null;
  readonly domainReadModelRefs: readonly string[];
}

export type GtlTransformStage<A, B> = (
  subject: GtlFunctionCompositionNotation<A, B>,
  input: A
) => GtlCandidate<B>;

export type GtlEvaluateStage<A, B> = (
  subject: GtlFunctionCompositionNotation<A, B>,
  input: A,
  candidate: GtlCandidate<B>,
  evidenceRefs: readonly string[]
) => readonly GtlEvaluation[];

export type GtlConsequenceStage<A, B> = (
  subject: GtlFunctionCompositionNotation<A, B>,
  admitted: GtlAdmittedStateRef
) => GtlConsequenceProjectionRef;

export interface GtlEpistemicStageSet<A, B> {
  readonly subject: GtlFunctionCompositionNotation<A, B>;
  readonly transform: GtlTransformStage<A, B>;
  readonly evaluate: GtlEvaluateStage<A, B>;
  readonly consequence: GtlConsequenceStage<A, B>;
}
