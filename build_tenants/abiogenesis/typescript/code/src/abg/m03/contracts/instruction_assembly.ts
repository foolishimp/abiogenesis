// Implements: T-183
// Implements: T-188
// Implements: REQ-R-ABG3-INSTRUCTION-ASSEMBLY

import {
  GTL_PROGRAM_UNDETERMINED_OWNER_ROUTE_VALUES,
  goldenInstanceBindingHasDigest,
  goldenInstanceBindingHasMaterial,
  type GtlProgramGoldenInstanceBindingRow,
  type GtlProgramUnderdeterminedDeclarationRow
} from "./gtl_program_conformance.js";
import { stableJson, stableSha256Digest } from "../../../shared/runtime_identity.js";

export const INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS = Object.freeze([
  "field_cut",
  "source_trace",
  "type_coverage",
  "output_contract_derivation",
  "authority_proof_renderer_derivation",
  "relevance",
  "compression",
  "proportionality",
  "non_tautology",
  "runtime_binding",
  "dependency_graph_projection",
  "prerequisite_closure",
  "dependency_sufficiency",
  "obligation_lineage",
  "proof_coverage",
  "proof_policy_depth_completeness",
  "depth_obligation_policy",
  "proof_strength_admission",
  "adversarial_verification",
  "coverage_strength"
] as const);

export type InstructionAssemblyKnownAlgebra =
  (typeof INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS)[number];

export const INSTRUCTION_ASSEMBLY_FORBIDDEN_RULE_FIELDS = Object.freeze([
  `sourceNode${"TypeRefs"}`,
  `targetNode${"TypeRefs"}`,
  `response${"ContractRef"}`,
  "proofObligationRefs",
  "authoritySlots",
  "rendererRefs",
  "activeRegime",
  `requiredCarrier${"Classes"}`
] as const);

export type InstructionAssemblyForbiddenRuleField =
  (typeof INSTRUCTION_ASSEMBLY_FORBIDDEN_RULE_FIELDS)[number];

export type InstructionSectionDisposition =
  | "include"
  | "ref_only"
  | "omit"
  | "gap"
  | "forbidden";

export type InstructionCompressionMode =
  | "digest"
  | "ref"
  | "excerpt"
  | "full"
  | "omitted";

export type InstructionProportionalityClass = "P0" | "P1" | "P2" | "P3";

export type InstructionWorkKind =
  | "not_applicable"
  | "target_work"
  | "dependency_disambiguation";

export type InstructionAssemblyComputeStageRole =
  | "transform"
  | "evaluate"
  | "consequence"
  | "human_callout";

export type RuntimeBindingSlotClass =
  | "graph_call"
  | "frame"
  | "vector"
  | "selected_graph_function"
  | "source_node"
  | "target_node"
  | "payload"
  | "evidence"
  | "prior_artifact"
  | "residual"
  | "continuation"
  | "reentry"
  | "policy"
  | "worker_invocation"
  | "event_log";

export type RuntimeBindingSourceTruthKind =
  | "admitted_ref"
  | "replay_event"
  | "projection"
  | "startup_projection";

export type InstructionAssemblyIssueKind =
  | "duplicate_carrier_truth"
  | "unknown_algebra"
  | "missing_known_algebra"
  | "scope_mismatch"
  | "missing_source_truth"
  | "type_coverage_gap"
  | "output_contract_gap"
  | "authority_gap"
  | "renderer_gap"
  | "proof_gap"
  | "relevance_gap"
  | "compression_gap"
  | "proportionality_gap"
  | "future_stage_bleed"
  | "answer_shaped_content"
  | "declared_latitude_invalid"
  | "golden_instance_calibration_invalid"
  | "runtime_binding_gap"
  | "startup_admission_gap"
  | "manifest_replay_mismatch"
  | "p0_dispatch_forbidden"
  | "dependency_sufficiency_gap"
  | "typed_prerequisite_gap"
  | "unresolved_requirement_node"
  | "missing_dependency_edge"
  | "depth_policy_incomplete"
  | "missing_depth_obligation_class"
  | "depth_class_not_applicable_unjustified"
  | "proof_strength_not_admitted"
  | "proof_strength_not_adversarially_verified"
  | "adversarial_counterexample_found";

export interface InstructionAssemblyIssue {
  readonly kind: "instruction_assembly_issue";
  readonly issueKind: InstructionAssemblyIssueKind;
  readonly algebraRef: InstructionAssemblyKnownAlgebra | "startup" | "manifest";
  readonly message: string;
  readonly evidenceRefs: readonly string[];
}

export interface InstructionAssemblySectionRule {
  readonly sectionRef: string;
  readonly required: boolean;
  readonly policyRefs: readonly string[];
}

export interface InstructionAssemblyRelevanceRule {
  readonly ruleRef: string;
  readonly requiredInputRefs: readonly string[];
  readonly allowFutureStageRefs: readonly string[];
}

export interface InstructionAssemblyRuleInput {
  readonly kind?: "instruction_assembly_rule" | undefined;
  readonly ruleRef: string;
  readonly appliesToGraphFunctionRefs: readonly string[];
  readonly appliesToVectorRefs: readonly string[];
  readonly sectionRules: readonly InstructionAssemblySectionRule[];
  readonly relevanceRules: readonly InstructionAssemblyRelevanceRule[];
  readonly compressionPolicyRef: string;
  readonly proportionalityPolicyRef: string;
  readonly runtimeBindingSlotClasses: readonly RuntimeBindingSlotClass[];
  readonly policyRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[] | undefined;
}

export interface InstructionAssemblyRule {
  readonly kind: "instruction_assembly_rule";
  readonly ruleRef: string;
  readonly appliesToGraphFunctionRefs: readonly string[];
  readonly appliesToVectorRefs: readonly string[];
  readonly sectionRules: readonly InstructionAssemblySectionRule[];
  readonly relevanceRules: readonly InstructionAssemblyRelevanceRule[];
  readonly compressionPolicyRef: string;
  readonly proportionalityPolicyRef: string;
  readonly runtimeBindingSlotClasses: readonly RuntimeBindingSlotClass[];
  readonly policyRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface RuntimeBindingSlot {
  readonly kind: "runtime_binding_slot";
  readonly slotRef: string;
  readonly slotClass: RuntimeBindingSlotClass;
  readonly required: boolean;
  readonly sourceTruthKind: RuntimeBindingSourceTruthKind;
  readonly evidenceRefs: readonly string[];
}

export interface DerivedInstructionCarrierTruth {
  readonly kind: "derived_instruction_carrier_truth";
  readonly sourceTypeRefs: readonly string[];
  readonly targetTypeRefs: readonly string[];
  readonly outputContractRefs: readonly string[];
  readonly proofRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly rendererRefs: readonly string[];
  readonly activeRegime: "F_D" | "F_P" | "F_H";
  readonly carrierClassRefs: readonly string[];
}

export interface DerivedDependencyInstructionTruth {
  readonly kind: "derived_dependency_instruction_truth";
  readonly truthRef: string;
  readonly truthDigest: string;
  readonly workKind: InstructionWorkKind;
  readonly dependencyGraphRef: string | null;
  readonly dependencyGraphDigest: string | null;
  readonly targetRefs: readonly string[];
  readonly prerequisiteNodeRefs: readonly string[];
  readonly prerequisiteEdgeRefs: readonly string[];
  readonly dependencyClosed: boolean;
  readonly typedPrerequisiteGapRefs: readonly string[];
  readonly noDependencyPolicyRef: string | null;
  readonly sourceProjectionRefs: readonly string[];
}

export interface DerivedProofDepthInstructionTruth {
  readonly kind: "derived_proof_depth_instruction_truth";
  readonly truthRef: string;
  readonly truthDigest: string;
  readonly depthPolicyRef: string | null;
  readonly depthPolicyDigest: string | null;
  readonly targetRefs: readonly string[];
  readonly requiredDepthClassRefs: readonly string[];
  readonly declaredDepthClassRefs: readonly string[];
  readonly declaredDepthObligationRefs: readonly string[];
  readonly notApplicableDepthClassRefs: readonly string[];
  readonly typedDepthGapRefs: readonly string[];
  readonly proofStrengthAdmissionRefs: readonly string[];
  readonly fdStrengthCriterionRefs: readonly string[];
  readonly adversarialVerificationRefs: readonly string[];
  readonly adversarialCounterexampleRefs: readonly string[];
  readonly sourceProjectionRefs: readonly string[];
  readonly depthComplete: boolean;
  readonly proofStrengthAdmitted: boolean;
}

export interface InstructionSectionDecision {
  readonly kind: "instruction_section_decision";
  readonly sectionRef: string;
  readonly disposition: InstructionSectionDisposition;
  readonly dependencyRefs: readonly string[];
  readonly carrierRefs: readonly string[];
  readonly compressionMode: InstructionCompressionMode;
  readonly text: string;
  readonly digestRef: string | null;
  readonly excerptDigest: string | null;
  readonly fullContentAdmitted: boolean;
  readonly stageRef: string;
  readonly gapRefs: readonly string[];
}

export interface CompileInstructionAssemblyPlanInput {
  readonly causalExcerptMaxChars?: number | undefined;
  readonly goldenInstanceCalibration?: readonly {
    readonly contractRef: string;
    readonly exampleInstanceRefs: readonly string[];
    readonly counterexampleInstanceRefs: readonly string[];
    readonly instanceSetDigest: string;
  }[] | undefined;
  readonly declaredLatitude?: readonly {
    readonly scopeRef: string;
    readonly ownerRoute: string;
    readonly latitudeNote: string;
  }[] | undefined;
  readonly planRef: string;
  readonly rule: InstructionAssemblyRule;
  readonly computeStageRole?: InstructionAssemblyComputeStageRole | undefined;
  readonly graphFunctionRef: string;
  readonly vectorRef: string;
  readonly registryEntryRefs: readonly string[];
  readonly sourceNodeRefs: readonly string[];
  readonly targetNodeRef: string;
  readonly derivedTruth: DerivedInstructionCarrierTruth;
  readonly knownAlgebraRefs: readonly InstructionAssemblyKnownAlgebra[];
  readonly requiredInputRefs: readonly string[];
  readonly availableInputRefs: readonly string[];
  readonly sectionDecisions: readonly InstructionSectionDecision[];
  readonly bindingSlots: readonly RuntimeBindingSlot[];
  readonly proportionalityClass: InstructionProportionalityClass;
  readonly expectedAnswerMarkers: readonly string[];
  readonly instructionWorkKind?: InstructionWorkKind | undefined;
  readonly dependencyInstructionTruth?:
    | DerivedDependencyInstructionTruth
    | null
    | undefined;
  readonly proofDepthInstructionTruth?:
    | DerivedProofDepthInstructionTruth
    | null
    | undefined;
  readonly fpValidationEvidenceRefs?: readonly string[] | undefined;
  readonly compilerEvidenceRefs?: readonly string[] | undefined;
}

// T-191 acceptance 4: declared latitude renders into instruction manifests
// as PERMISSION (ODD §5 — prompts grant permission, not prescription).
// Owner route is F_P or F_H only; F_D "latitude" is a contradiction (the
// deterministic regime has no judgment latitude) and fails compile.
// T-191 acceptance 3/4 carriers: the RATIFIED HOME is gtl_program_conformance
// (LAWS-023/-024 rows + predicates). These are consumption-role aliases —
// calibration renders into EVALUATE manifests; latitude renders as
// permission. Reprice the law in the conformance module, not here.
export type GoldenInstanceCalibrationRow = GtlProgramGoldenInstanceBindingRow;

export interface DeclaredLatitudeRow extends GtlProgramUnderdeterminedDeclarationRow {
  readonly ownerRoute: (typeof GTL_PROGRAM_UNDETERMINED_OWNER_ROUTE_VALUES)[number];
}

export interface CompiledPromptPlan {
  // T-030 root-cause (data-mapper campaign): the causal-excerpt render
  // bound is PLAN POLICY, not a constant — product-scale admitted content
  // (multi-module source surfaces) must be carryable by declaration.
  readonly causalExcerptMaxChars: number;
  readonly declaredLatitude: readonly DeclaredLatitudeRow[];
  readonly goldenInstanceCalibration: readonly GoldenInstanceCalibrationRow[];
  readonly kind: "compiled_prompt_plan";
  readonly planRef: string;
  readonly planDigest: string;
  readonly ruleRef: string;
  readonly computeStageRole: InstructionAssemblyComputeStageRole;
  readonly graphFunctionRef: string;
  readonly vectorRef: string;
  readonly registryEntryRefs: readonly string[];
  readonly sourceNodeRefs: readonly string[];
  readonly targetNodeRef: string;
  readonly derivedTruth: DerivedInstructionCarrierTruth;
  readonly knownAlgebraRefs: readonly InstructionAssemblyKnownAlgebra[];
  readonly requiredInputRefs: readonly string[];
  readonly availableInputRefs: readonly string[];
  readonly sectionDecisions: readonly InstructionSectionDecision[];
  readonly bindingSlots: readonly RuntimeBindingSlot[];
  readonly proportionalityClass: InstructionProportionalityClass;
  readonly instructionWorkKind: InstructionWorkKind;
  readonly dependencyInstructionTruth: DerivedDependencyInstructionTruth | null;
  readonly proofDepthInstructionTruth: DerivedProofDepthInstructionTruth | null;
  readonly shouldDispatchFp: boolean;
  readonly fpValidationEvidenceRefs: readonly string[];
  readonly compilerEvidenceRefs: readonly string[];
  readonly compilerDiagnostics: readonly InstructionAssemblyIssue[];
}

export interface InstructionAssemblyCompileAccepted {
  readonly kind: "instruction_assembly_compile_accepted";
  readonly accepted: true;
  readonly plan: CompiledPromptPlan;
  readonly issues: readonly InstructionAssemblyIssue[];
}

export interface InstructionAssemblyCompileRejected {
  readonly kind: "instruction_assembly_compile_rejected";
  readonly accepted: false;
  readonly plan: null;
  readonly issues: readonly InstructionAssemblyIssue[];
}

export type InstructionAssemblyCompileResult =
  | InstructionAssemblyCompileAccepted
  | InstructionAssemblyCompileRejected;

export interface CompiledPromptPlanStartupAdmission {
  readonly kind: "compiled_prompt_plan_startup_admission";
  readonly admitted: boolean;
  readonly planRef: string;
  readonly planDigest: string;
  readonly startupEventRefs: readonly string[];
  readonly registryEntryRefs: readonly string[];
  readonly issues: readonly InstructionAssemblyIssue[];
}

export interface RuntimeBindingFact {
  readonly kind: "runtime_binding_fact";
  readonly slotClass: RuntimeBindingSlotClass;
  readonly ref: string;
  readonly digest: string;
  readonly sourceEventRefs: readonly string[];
  readonly admitted: boolean;
  readonly payloadDigest?: string | null;
  readonly contentRef?: string | null;
  readonly contentDigest?: string | null;
  readonly contentExcerpt?: string | null;
}

export interface InstructionEnvelope {
  readonly kind: "instruction_envelope";
  readonly envelopeRef: string;
  readonly envelopeDigest: string;
  readonly planRef: string;
  readonly planDigest: string;
  readonly graphFunctionRef: string;
  readonly vectorRef: string;
  readonly boundRuntimeRefs: readonly RuntimeBindingFact[];
  readonly outputContractRefs: readonly string[];
  readonly shouldDispatchFp: boolean;
}

export interface InstructionEnvelopeBindAccepted {
  readonly kind: "instruction_envelope_bind_accepted";
  readonly accepted: true;
  readonly envelope: InstructionEnvelope;
  readonly issues: readonly InstructionAssemblyIssue[];
}

export interface InstructionEnvelopeBindRejected {
  readonly kind: "instruction_envelope_bind_rejected";
  readonly accepted: false;
  readonly envelope: null;
  readonly issues: readonly InstructionAssemblyIssue[];
}

export type InstructionEnvelopeBindResult =
  | InstructionEnvelopeBindAccepted
  | InstructionEnvelopeBindRejected;

export interface PromptManifest {
  readonly kind: "prompt_manifest";
  readonly manifestRef: string;
  readonly manifestDigest: string;
  readonly planRef: string;
  readonly planDigest: string;
  readonly envelopeRef: string;
  readonly envelopeDigest: string;
  readonly rendererRef: string;
  readonly promptDigest: string;
  readonly includedCarrierRefs: readonly string[];
  readonly omittedCarrierRefs: readonly string[];
  readonly refOnlyCarrierRefs: readonly string[];
  readonly gapRefs: readonly string[];
  readonly forbiddenCarrierRefs: readonly string[];
  readonly dependencyInstructionTruthRefs: readonly string[];
  readonly dependencyGraphRefs: readonly string[];
  readonly typedPrerequisiteGapRefs: readonly string[];
  readonly proofDepthInstructionTruthRefs: readonly string[];
  readonly depthPolicyRefs: readonly string[];
  readonly typedDepthGapRefs: readonly string[];
  readonly proofStrengthAdmissionRefs: readonly string[];
  readonly adversarialCounterexampleRefs: readonly string[];
  readonly outputContractRefs: readonly string[];
  readonly renderedPrompt: string;
}

export interface PromptManifestRenderAccepted {
  readonly kind: "prompt_manifest_render_accepted";
  readonly accepted: true;
  readonly manifest: PromptManifest;
  readonly issues: readonly InstructionAssemblyIssue[];
}

export interface PromptManifestRenderRejected {
  readonly kind: "prompt_manifest_render_rejected";
  readonly accepted: false;
  readonly manifest: null;
  readonly issues: readonly InstructionAssemblyIssue[];
}

export type PromptManifestRenderResult =
  | PromptManifestRenderAccepted
  | PromptManifestRenderRejected;

export interface PromptManifestReplayResult {
  readonly kind: "prompt_manifest_replay_result";
  readonly passed: boolean;
  readonly expectedPromptDigest: string;
  readonly expectedManifestDigest: string;
  readonly issues: readonly InstructionAssemblyIssue[];
}

function isRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function uniqueSorted(input: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(input)].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
}

function includesAll(actual: readonly string[], expected: readonly string[]): boolean {
  return expected.every((item) => actual.includes(item));
}

function requireNonEmptyString(input: string, label: string): void {
  if (typeof input !== "string" || input.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
}

function requireStringArray(input: readonly string[], label: string): readonly string[] {
  if (!Array.isArray(input) || input.some((value) => typeof value !== "string" || value.length === 0)) {
    throw new TypeError(`${label} must be an array of non-empty strings`);
  }
  return Object.freeze([...input]);
}

function requireNullableNonEmptyString(
  input: string | null,
  label: string
): string | null {
  if (input === null) {
    return null;
  }
  requireNonEmptyString(input, label);
  return input;
}

function normalizeInstructionAssemblyComputeStageRole(
  input: InstructionAssemblyComputeStageRole | undefined
): InstructionAssemblyComputeStageRole {
  if (input === undefined) {
    return "transform";
  }
  if (
    input === "transform" ||
    input === "evaluate" ||
    input === "consequence" ||
    input === "human_callout"
  ) {
    return input;
  }
  throw new TypeError("computeStageRole must be a known instruction assembly compute stage role");
}

function issue(input: {
  readonly issueKind: InstructionAssemblyIssueKind;
  readonly algebraRef: InstructionAssemblyIssue["algebraRef"];
  readonly message: string;
  readonly evidenceRefs?: readonly string[] | undefined;
}): InstructionAssemblyIssue {
  return Object.freeze({
    kind: "instruction_assembly_issue",
    issueKind: input.issueKind,
    algebraRef: input.algebraRef,
    message: input.message,
    evidenceRefs: uniqueSorted(input.evidenceRefs ?? [])
  });
}

function lower(input: string): string {
  return input.toLocaleLowerCase("en-US");
}

function hasForbiddenRuleField(input: InstructionAssemblyRule): readonly InstructionAssemblyForbiddenRuleField[] {
  const record = input as unknown;
  if (!isRecord(record)) {
    return Object.freeze([]);
  }
  return Object.freeze(
    INSTRUCTION_ASSEMBLY_FORBIDDEN_RULE_FIELDS.filter((field) =>
      Object.prototype.hasOwnProperty.call(record, field)
    )
  );
}

function planDigest(input: Omit<CompiledPromptPlan, "planDigest">): string {
  return stableSha256Digest(input);
}

function dependencyInstructionTruthDigest(
  input: Omit<DerivedDependencyInstructionTruth, "kind" | "truthDigest">
): string {
  return stableSha256Digest({
    kind: "derived_dependency_instruction_truth",
    ...input
  });
}

function proofDepthInstructionTruthDigest(
  input: Omit<DerivedProofDepthInstructionTruth, "kind" | "truthDigest">
): string {
  return stableSha256Digest({
    kind: "derived_proof_depth_instruction_truth",
    ...input
  });
}

function deriveDependencyClosed(input: {
  readonly workKind: InstructionWorkKind;
  readonly dependencyGraphRef: string | null;
  readonly dependencyGraphDigest: string | null;
  readonly typedPrerequisiteGapRefs: readonly string[];
  readonly noDependencyPolicyRef: string | null;
}): boolean {
  if (input.workKind === "dependency_disambiguation") {
    return false;
  }
  if (input.typedPrerequisiteGapRefs.length > 0) {
    return false;
  }
  if (input.dependencyGraphRef !== null) {
    return input.dependencyGraphDigest !== null;
  }
  return input.noDependencyPolicyRef !== null;
}

function deriveDepthComplete(input: {
  readonly depthPolicyRef: string | null;
  readonly depthPolicyDigest: string | null;
  readonly requiredDepthClassRefs: readonly string[];
  readonly declaredDepthClassRefs: readonly string[];
  readonly notApplicableDepthClassRefs: readonly string[];
  readonly typedDepthGapRefs: readonly string[];
}): boolean {
  if (input.depthPolicyRef === null || input.depthPolicyDigest === null) {
    return false;
  }
  if (input.typedDepthGapRefs.length > 0) {
    return false;
  }
  const covered = uniqueSorted([
    ...input.declaredDepthClassRefs,
    ...input.notApplicableDepthClassRefs
  ]);
  return includesAll(covered, input.requiredDepthClassRefs);
}

function deriveProofStrengthAdmitted(input: {
  readonly proofStrengthAdmissionRefs: readonly string[];
  readonly fdStrengthCriterionRefs: readonly string[];
  readonly adversarialVerificationRefs: readonly string[];
  readonly adversarialCounterexampleRefs: readonly string[];
  readonly admittedLedgerRefs?: ReadonlySet<string> | undefined;
}): boolean {
  // Implements: T-188 M3 — when the admitted ledger is supplied (runtime
  // callers), strength refs must RESOLVE against admitted truth; list
  // presence alone is compile-time behavior for startup/authoring callers.
  const resolved = (refs: readonly string[]): boolean =>
    refs.length > 0 &&
    (input.admittedLedgerRefs === undefined ||
      refs.every((ref) => input.admittedLedgerRefs?.has(ref) === true));
  return (
    resolved(input.proofStrengthAdmissionRefs) &&
    input.adversarialCounterexampleRefs.length === 0 &&
    (resolved(input.fdStrengthCriterionRefs) ||
      resolved(input.adversarialVerificationRefs))
  );
}

function envelopeDigest(input: Omit<InstructionEnvelope, "envelopeDigest">): string {
  return stableSha256Digest(input);
}

const MAX_RENDERED_REF_CHARS = 180;
const MAX_RENDERED_EXCERPT_CHARS = 12000;

function compactRenderedRef(ref: string): string {
  if (ref.length <= MAX_RENDERED_REF_CHARS) {
    return ref;
  }
  const digest = stableSha256Digest(ref);
  if (ref.startsWith("node:")) {
    try {
      const parsed: unknown = JSON.parse(ref.slice("node:".length));
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const record = parsed as Readonly<Record<string, unknown>>;
        const name = typeof record["name"] === "string" ? record["name"] : "unnamed";
        const typeRef = typeof record["typeRef"] === "string" ? record["typeRef"] : "untyped";
        return `node:${name}:${typeRef}:${digest}`;
      }
    } catch {
      // Fall through to digest-only rendering for malformed legacy refs.
    }
  }
  const prefix = ref.slice(0, 48).replace(/[\r\n\t]/gu, " ");
  return `${prefix}...${digest}`;
}

function stableCompactRefs(refs: readonly string[]): string {
  return stableJson(refs.map((ref) => compactRenderedRef(ref)));
}

function compactRenderedExcerpt(
  excerpt: string | null,
  maxChars: number = MAX_RENDERED_EXCERPT_CHARS
): string | null {
  if (excerpt === null || excerpt.length <= maxChars) {
    return excerpt;
  }
  return `${excerpt.slice(0, maxChars)}...[truncated:${excerpt.length}]`;
}

function renderedPromptFor(input: {
  readonly envelope: InstructionEnvelope;
  readonly plan: CompiledPromptPlan;
}): string {
  const sections = input.plan.sectionDecisions.filter(
    (section) => section.disposition === "include"
  );
  const sectionText = sections
    .map((section) => {
      const carrierLine = `carriers: ${stableCompactRefs(section.carrierRefs)}`;
      const dependencyLine = `dependencies: ${stableCompactRefs(section.dependencyRefs)}`;
      const digestLine = section.digestRef === null ? "digest: none" : `digest: ${section.digestRef}`;
      return [
        `## ${section.sectionRef}`,
        carrierLine,
        dependencyLine,
        digestLine,
        section.text
      ].join("\n");
    })
    .join("\n\n");
  const runtimeBindingText =
    input.envelope.boundRuntimeRefs.length === 0
      ? "none"
      : input.envelope.boundRuntimeRefs
          .map((fact) =>
            [
              `- slot: ${fact.slotClass}`,
              `  ref: ${compactRenderedRef(fact.ref)}`,
              `  digest: ${fact.digest}`,
              `  payloadDigest: ${fact.payloadDigest ?? "none"}`,
              `  contentRef: ${fact.contentRef == null ? "none" : compactRenderedRef(fact.contentRef)}`,
              `  contentDigest: ${fact.contentDigest ?? "none"}`,
              `  contentExcerpt: ${stableJson(compactRenderedExcerpt(fact.contentExcerpt ?? null, input.plan.causalExcerptMaxChars))}`,
              `  sourceEventRefs: ${stableCompactRefs(fact.sourceEventRefs)}`
            ].join("\n")
          )
          .join("\n");
  const dependencyTruth = input.plan.dependencyInstructionTruth;
  const proofDepthTruth = input.plan.proofDepthInstructionTruth;
  const dependencyText =
    dependencyTruth === null
      ? "none"
      : [
          `truthRef: ${dependencyTruth.truthRef}`,
          `truthDigest: ${dependencyTruth.truthDigest}`,
          `workKind: ${dependencyTruth.workKind}`,
          `dependencyGraphRef: ${dependencyTruth.dependencyGraphRef === null ? "none" : compactRenderedRef(dependencyTruth.dependencyGraphRef)}`,
          `dependencyGraphDigest: ${dependencyTruth.dependencyGraphDigest ?? "none"}`,
          `targetRefs: ${stableCompactRefs(dependencyTruth.targetRefs)}`,
          `prerequisiteNodeRefs: ${stableCompactRefs(dependencyTruth.prerequisiteNodeRefs)}`,
          `prerequisiteEdgeRefs: ${stableCompactRefs(dependencyTruth.prerequisiteEdgeRefs)}`,
          `dependencyClosed: ${String(dependencyTruth.dependencyClosed)}`,
          `typedPrerequisiteGapRefs: ${stableCompactRefs(dependencyTruth.typedPrerequisiteGapRefs)}`,
          `noDependencyPolicyRef: ${dependencyTruth.noDependencyPolicyRef ?? "none"}`,
          `sourceProjectionRefs: ${stableCompactRefs(dependencyTruth.sourceProjectionRefs)}`
        ].join("\n");
  const proofDepthText =
    proofDepthTruth === null
      ? "none"
      : [
          `truthRef: ${proofDepthTruth.truthRef}`,
          `truthDigest: ${proofDepthTruth.truthDigest}`,
          `depthPolicyRef: ${proofDepthTruth.depthPolicyRef ?? "none"}`,
          `depthPolicyDigest: ${proofDepthTruth.depthPolicyDigest ?? "none"}`,
          `targetRefs: ${stableCompactRefs(proofDepthTruth.targetRefs)}`,
          `requiredDepthClassRefs: ${stableCompactRefs(proofDepthTruth.requiredDepthClassRefs)}`,
          `declaredDepthClassRefs: ${stableCompactRefs(proofDepthTruth.declaredDepthClassRefs)}`,
          `declaredDepthObligationRefs: ${stableCompactRefs(proofDepthTruth.declaredDepthObligationRefs)}`,
          `notApplicableDepthClassRefs: ${stableCompactRefs(proofDepthTruth.notApplicableDepthClassRefs)}`,
          `typedDepthGapRefs: ${stableCompactRefs(proofDepthTruth.typedDepthGapRefs)}`,
          `proofStrengthAdmissionRefs: ${stableCompactRefs(proofDepthTruth.proofStrengthAdmissionRefs)}`,
          `fdStrengthCriterionRefs: ${stableCompactRefs(proofDepthTruth.fdStrengthCriterionRefs)}`,
          `adversarialVerificationRefs: ${stableCompactRefs(proofDepthTruth.adversarialVerificationRefs)}`,
          `adversarialCounterexampleRefs: ${stableCompactRefs(proofDepthTruth.adversarialCounterexampleRefs)}`,
          `sourceProjectionRefs: ${stableCompactRefs(proofDepthTruth.sourceProjectionRefs)}`,
          `depthComplete: ${String(proofDepthTruth.depthComplete)}`,
          `proofStrengthAdmitted: ${String(proofDepthTruth.proofStrengthAdmitted)}`
        ].join("\n");
  const calibrationText =
    input.plan.computeStageRole !== "evaluate" ||
    input.plan.goldenInstanceCalibration.length === 0
      ? null
      : [
          "Calibration instances for evaluator judgment. Examples define admissible shape; counterexamples are refutation material — a candidate matching a counterexample shall be rejected.",
          "These are calibration REFS with a digest-bound instance set, not answers; resolving and applying them is the evaluator's judgment.",
          ...input.plan.goldenInstanceCalibration.map(
            (row) =>
              `contract: ${row.contractRef} | examples: ${stableCompactRefs(row.exampleInstanceRefs)} | counterexamples: ${stableCompactRefs(row.counterexampleInstanceRefs)} | digest: ${row.instanceSetDigest}`
          )
        ].join("\n");
  const latitudeText =
    input.plan.declaredLatitude.length === 0
      ? null
      : [
          "Declared latitude grants PERMISSION within the named scope; it does not prescribe outcomes and does not weaken admitted prior truth.",
          ...input.plan.declaredLatitude.map(
            (row) =>
              `scope: ${row.scopeRef} | owner: ${row.ownerRoute} | latitude: ${row.latitudeNote}`
          )
        ].join("\n");
  return [
    sectionText,
    ...(latitudeText === null ? [] : ["## abg.declared_latitude", latitudeText]),
    ...(calibrationText === null ? [] : ["## abg.golden_instance_calibration", calibrationText]),
    "## abg.instruction_authority_precedence",
    [
      "ABG-rendered dependency truth, proof-depth truth, runtime bound refs, and admitted prior artifacts are authoritative for this dispatch.",
      "Product section text, stage policy data, templates, and worker instructions may narrow or strengthen admitted prior obligations, but they shall not weaken, replace, or contradict them.",
      "If a product instruction conflicts with an admitted prior artifact, dependency/proof truth, or runtime binding, the admitted truth wins and the conflict is a dispatch/evaluation defect.",
      "The F_P worker must not use a weaker product instruction to satisfy an obligation carried by admitted prior truth.",
      "The F_P evaluator must reject a candidate that follows a weaker product instruction when admitted prior truth requires the stronger obligation."
    ].join("\n"),
    "## abg.dependency_instruction_truth",
    dependencyText,
    "## abg.proof_depth_instruction_truth",
    proofDepthText,
    "## abg.runtime.bound_refs",
    runtimeBindingText
  ].join("\n\n");
}

function manifestDigest(input: Omit<PromptManifest, "manifestDigest">): string {
  return stableSha256Digest(input);
}

function classifyCarriers(
  sections: readonly InstructionSectionDecision[],
  disposition: InstructionSectionDisposition
): readonly string[] {
  return uniqueSorted(
    sections
      .filter((section) => section.disposition === disposition)
      .flatMap((section) => [...section.carrierRefs, ...section.gapRefs])
  );
}

function dependencyInstructionTruthRefs(
  input: DerivedDependencyInstructionTruth | null
): readonly string[] {
  return input === null ? Object.freeze([]) : Object.freeze([input.truthRef]);
}

function dependencyGraphRefs(
  input: DerivedDependencyInstructionTruth | null
): readonly string[] {
  return input?.dependencyGraphRef === undefined || input.dependencyGraphRef === null
    ? Object.freeze([])
    : Object.freeze([input.dependencyGraphRef]);
}

function typedPrerequisiteGapRefs(
  input: DerivedDependencyInstructionTruth | null
): readonly string[] {
  return input === null ? Object.freeze([]) : uniqueSorted(input.typedPrerequisiteGapRefs);
}

function proofDepthInstructionTruthRefs(
  input: DerivedProofDepthInstructionTruth | null
): readonly string[] {
  return input === null ? Object.freeze([]) : Object.freeze([input.truthRef]);
}

function depthPolicyRefs(
  input: DerivedProofDepthInstructionTruth | null
): readonly string[] {
  return input?.depthPolicyRef === undefined || input.depthPolicyRef === null
    ? Object.freeze([])
    : Object.freeze([input.depthPolicyRef]);
}

function typedDepthGapRefs(
  input: DerivedProofDepthInstructionTruth | null
): readonly string[] {
  return input === null ? Object.freeze([]) : uniqueSorted(input.typedDepthGapRefs);
}

function proofStrengthAdmissionRefs(
  input: DerivedProofDepthInstructionTruth | null
): readonly string[] {
  return input === null ? Object.freeze([]) : uniqueSorted(input.proofStrengthAdmissionRefs);
}

function adversarialCounterexampleRefs(
  input: DerivedProofDepthInstructionTruth | null
): readonly string[] {
  return input === null ? Object.freeze([]) : uniqueSorted(input.adversarialCounterexampleRefs);
}

function normalizeInstructionWorkKind(input: InstructionWorkKind | undefined): InstructionWorkKind {
  switch (input) {
    case undefined:
      return "not_applicable";
    case "not_applicable":
    case "target_work":
    case "dependency_disambiguation":
      return input;
    default:
      throw new TypeError(`instructionWorkKind: unsupported value ${JSON.stringify(input)}`);
  }
}

export function constructDerivedDependencyInstructionTruth(
  input: Omit<DerivedDependencyInstructionTruth, "kind" | "truthDigest"> & {
    readonly truthDigest?: string | undefined;
  }
): DerivedDependencyInstructionTruth {
  requireNonEmptyString(input.truthRef, "truthRef");
  const workKind = normalizeInstructionWorkKind(input.workKind);
  const dependencyGraphRef = requireNullableNonEmptyString(
    input.dependencyGraphRef,
    "dependencyGraphRef"
  );
  const dependencyGraphDigest = requireNullableNonEmptyString(
    input.dependencyGraphDigest,
    "dependencyGraphDigest"
  );
  const typedPrerequisiteGapRefs = uniqueSorted(
    requireStringArray(input.typedPrerequisiteGapRefs, "typedPrerequisiteGapRefs")
  );
  const noDependencyPolicyRef = requireNullableNonEmptyString(
    input.noDependencyPolicyRef,
    "noDependencyPolicyRef"
  );
  const withoutDigest = Object.freeze({
    truthRef: input.truthRef,
    workKind,
    dependencyGraphRef,
    dependencyGraphDigest,
    targetRefs: uniqueSorted(requireStringArray(input.targetRefs, "targetRefs")),
    prerequisiteNodeRefs: uniqueSorted(
      requireStringArray(input.prerequisiteNodeRefs, "prerequisiteNodeRefs")
    ),
    prerequisiteEdgeRefs: uniqueSorted(
      requireStringArray(input.prerequisiteEdgeRefs, "prerequisiteEdgeRefs")
    ),
    dependencyClosed: deriveDependencyClosed({
      workKind,
      dependencyGraphRef,
      dependencyGraphDigest,
      typedPrerequisiteGapRefs,
      noDependencyPolicyRef
    }),
    typedPrerequisiteGapRefs,
    noDependencyPolicyRef,
    sourceProjectionRefs: uniqueSorted(
      requireStringArray(input.sourceProjectionRefs, "sourceProjectionRefs")
    )
  });
  return Object.freeze({
    kind: "derived_dependency_instruction_truth",
    ...withoutDigest,
    truthDigest: input.truthDigest ?? dependencyInstructionTruthDigest(withoutDigest)
  });
}

export function constructDerivedProofDepthInstructionTruth(
  input: Omit<DerivedProofDepthInstructionTruth, "kind" | "truthDigest"> & {
    readonly truthDigest?: string | undefined;
    readonly admittedLedgerRefs?: ReadonlySet<string> | undefined;
  }
): DerivedProofDepthInstructionTruth {
  requireNonEmptyString(input.truthRef, "truthRef");
  const depthPolicyRef = requireNullableNonEmptyString(
    input.depthPolicyRef,
    "depthPolicyRef"
  );
  const depthPolicyDigest = requireNullableNonEmptyString(
    input.depthPolicyDigest,
    "depthPolicyDigest"
  );
  const requiredDepthClassRefs = uniqueSorted(
    requireStringArray(input.requiredDepthClassRefs, "requiredDepthClassRefs")
  );
  const declaredDepthClassRefs = uniqueSorted(
    requireStringArray(input.declaredDepthClassRefs, "declaredDepthClassRefs")
  );
  const notApplicableDepthClassRefs = uniqueSorted(
    requireStringArray(
      input.notApplicableDepthClassRefs,
      "notApplicableDepthClassRefs"
    )
  );
  const typedDepthGapRefs = uniqueSorted(
    requireStringArray(input.typedDepthGapRefs, "typedDepthGapRefs")
  );
  const proofStrengthAdmissionRefs = uniqueSorted(
    requireStringArray(
      input.proofStrengthAdmissionRefs,
      "proofStrengthAdmissionRefs"
    )
  );
  const fdStrengthCriterionRefs = uniqueSorted(
    requireStringArray(input.fdStrengthCriterionRefs, "fdStrengthCriterionRefs")
  );
  const adversarialVerificationRefs = uniqueSorted(
    requireStringArray(
      input.adversarialVerificationRefs,
      "adversarialVerificationRefs"
    )
  );
  const adversarialCounterexampleRefs = uniqueSorted(
    requireStringArray(
      input.adversarialCounterexampleRefs,
      "adversarialCounterexampleRefs"
    )
  );
  const withoutDigest = Object.freeze({
    truthRef: input.truthRef,
    depthPolicyRef,
    depthPolicyDigest,
    targetRefs: uniqueSorted(requireStringArray(input.targetRefs, "targetRefs")),
    requiredDepthClassRefs,
    declaredDepthClassRefs,
    declaredDepthObligationRefs: uniqueSorted(
      requireStringArray(
        input.declaredDepthObligationRefs,
        "declaredDepthObligationRefs"
      )
    ),
    notApplicableDepthClassRefs,
    typedDepthGapRefs,
    proofStrengthAdmissionRefs,
    fdStrengthCriterionRefs,
    adversarialVerificationRefs,
    adversarialCounterexampleRefs,
    sourceProjectionRefs: uniqueSorted(
      requireStringArray(input.sourceProjectionRefs, "sourceProjectionRefs")
    ),
    depthComplete: deriveDepthComplete({
      depthPolicyRef,
      depthPolicyDigest,
      requiredDepthClassRefs,
      declaredDepthClassRefs,
      notApplicableDepthClassRefs,
      typedDepthGapRefs
    }),
    proofStrengthAdmitted: deriveProofStrengthAdmitted({
      admittedLedgerRefs: input.admittedLedgerRefs,
      proofStrengthAdmissionRefs,
      fdStrengthCriterionRefs,
      adversarialVerificationRefs,
      adversarialCounterexampleRefs
    })
  });
  return Object.freeze({
    kind: "derived_proof_depth_instruction_truth",
    ...withoutDigest,
    truthDigest: input.truthDigest ?? proofDepthInstructionTruthDigest(withoutDigest)
  });
}

export function constructInstructionAssemblyRule(
  input: InstructionAssemblyRuleInput
): InstructionAssemblyRule {
  const raw = input as unknown;
  if (isRecord(raw)) {
    for (const forbidden of INSTRUCTION_ASSEMBLY_FORBIDDEN_RULE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(raw, forbidden)) {
        throw new TypeError(
          `instruction assembly rule shall not redeclare carrier truth field ${forbidden}`
        );
      }
    }
  }
  requireNonEmptyString(input.ruleRef, "ruleRef");
  requireNonEmptyString(input.compressionPolicyRef, "compressionPolicyRef");
  requireNonEmptyString(input.proportionalityPolicyRef, "proportionalityPolicyRef");
  return Object.freeze({
    kind: "instruction_assembly_rule",
    ruleRef: input.ruleRef,
    appliesToGraphFunctionRefs: requireStringArray(
      input.appliesToGraphFunctionRefs,
      "appliesToGraphFunctionRefs"
    ),
    appliesToVectorRefs: requireStringArray(input.appliesToVectorRefs, "appliesToVectorRefs"),
    sectionRules: Object.freeze(
      input.sectionRules.map((row) =>
        Object.freeze({
          sectionRef: row.sectionRef,
          required: row.required,
          policyRefs: requireStringArray(row.policyRefs, "sectionRules.policyRefs")
        })
      )
    ),
    relevanceRules: Object.freeze(
      input.relevanceRules.map((row) =>
        Object.freeze({
          ruleRef: row.ruleRef,
          requiredInputRefs: requireStringArray(
            row.requiredInputRefs,
            "relevanceRules.requiredInputRefs"
          ),
          allowFutureStageRefs: requireStringArray(
            row.allowFutureStageRefs,
            "relevanceRules.allowFutureStageRefs"
          )
        })
      )
    ),
    compressionPolicyRef: input.compressionPolicyRef,
    proportionalityPolicyRef: input.proportionalityPolicyRef,
    runtimeBindingSlotClasses: Object.freeze([...input.runtimeBindingSlotClasses]),
    policyRefs: requireStringArray(input.policyRefs ?? [], "policyRefs"),
    evidenceRefs: requireStringArray(input.evidenceRefs ?? [], "evidenceRefs")
  });
}

export function constructInstructionSectionDecision(
  input: Omit<InstructionSectionDecision, "kind">
): InstructionSectionDecision {
  return Object.freeze({
    kind: "instruction_section_decision",
    sectionRef: input.sectionRef,
    disposition: input.disposition,
    dependencyRefs: requireStringArray(input.dependencyRefs, "dependencyRefs"),
    carrierRefs: requireStringArray(input.carrierRefs, "carrierRefs"),
    compressionMode: input.compressionMode,
    text: input.text,
    digestRef: input.digestRef,
    excerptDigest: input.excerptDigest,
    fullContentAdmitted: input.fullContentAdmitted,
    stageRef: input.stageRef,
    gapRefs: requireStringArray(input.gapRefs, "gapRefs")
  });
}

export function constructRuntimeBindingSlot(
  input: Omit<RuntimeBindingSlot, "kind">
): RuntimeBindingSlot {
  return Object.freeze({
    kind: "runtime_binding_slot",
    slotRef: input.slotRef,
    slotClass: input.slotClass,
    required: input.required,
    sourceTruthKind: input.sourceTruthKind,
    evidenceRefs: requireStringArray(input.evidenceRefs, "evidenceRefs")
  });
}

export function compileInstructionAssemblyPlan(
  input: CompileInstructionAssemblyPlanInput
): InstructionAssemblyCompileResult {
  const issues: InstructionAssemblyIssue[] = [];
  const instructionWorkKind = normalizeInstructionWorkKind(input.instructionWorkKind);
  const causalExcerptMaxChars = input.causalExcerptMaxChars ?? MAX_RENDERED_EXCERPT_CHARS;
  if (
    !Number.isInteger(causalExcerptMaxChars) ||
    causalExcerptMaxChars < 1000 ||
    causalExcerptMaxChars > 400000
  ) {
    issues.push(
      Object.freeze({
        kind: "instruction_assembly_issue",
        issueKind: "renderer_gap",
        algebraRef: "startup",
        message: `causalExcerptMaxChars must be an integer in [1000, 400000], got ${String(input.causalExcerptMaxChars)}`,
        evidenceRefs: Object.freeze([input.planRef])
      })
    );
  }
  const goldenInstanceCalibration: GoldenInstanceCalibrationRow[] = [];
  for (const row of input.goldenInstanceCalibration ?? []) {
    if (!goldenInstanceBindingHasDigest(row)) {
      issues.push(
        Object.freeze({
          kind: "instruction_assembly_issue",
          issueKind: "golden_instance_calibration_invalid",
          algebraRef: "startup",
          message: `golden instance calibration requires a content digest for ${row.contractRef}`,
          evidenceRefs: Object.freeze([row.contractRef])
        })
      );
      continue;
    }
    if (!goldenInstanceBindingHasMaterial(row)) {
      issues.push(
        Object.freeze({
          kind: "instruction_assembly_issue",
          issueKind: "golden_instance_calibration_invalid",
          algebraRef: "startup",
          message: `golden instance calibration requires at least one example or counterexample for ${row.contractRef}`,
          evidenceRefs: Object.freeze([row.contractRef])
        })
      );
      continue;
    }
    goldenInstanceCalibration.push(
      Object.freeze({
        contractRef: row.contractRef,
        exampleInstanceRefs: Object.freeze([...row.exampleInstanceRefs]),
        counterexampleInstanceRefs: Object.freeze([...row.counterexampleInstanceRefs]),
        instanceSetDigest: row.instanceSetDigest
      })
    );
  }
  const declaredLatitude: DeclaredLatitudeRow[] = [];
  const latitudeIssues: InstructionAssemblyIssue[] = [];
  for (const row of input.declaredLatitude ?? []) {
    if (!(GTL_PROGRAM_UNDETERMINED_OWNER_ROUTE_VALUES as readonly string[]).includes(row.ownerRoute)) {
      latitudeIssues.push(
        Object.freeze({
          kind: "instruction_assembly_issue",
          issueKind: "declared_latitude_invalid",
          algebraRef: "startup",
          message: `declared latitude owner route must be F_P or F_H, got ${row.ownerRoute} for ${row.scopeRef}`,
          evidenceRefs: Object.freeze([row.scopeRef])
        })
      );
      continue;
    }
    if (row.latitudeNote.trim().length === 0) {
      latitudeIssues.push(
        Object.freeze({
          kind: "instruction_assembly_issue",
          issueKind: "declared_latitude_invalid",
          algebraRef: "startup",
          message: `declared latitude requires a non-empty latitude note for ${row.scopeRef} (an empty note is an undeclared hole)`,
          evidenceRefs: Object.freeze([row.scopeRef])
        })
      );
      continue;
    }
    declaredLatitude.push(
      Object.freeze({
        scopeRef: row.scopeRef,
        ownerRoute: row.ownerRoute as DeclaredLatitudeRow["ownerRoute"],
        latitudeNote: row.latitudeNote
      })
    );
  }
  const computeStageRole = normalizeInstructionAssemblyComputeStageRole(
    input.computeStageRole
  );
  const dependencyInstructionTruth =
    input.dependencyInstructionTruth === undefined ||
    input.dependencyInstructionTruth === null
      ? null
      : constructDerivedDependencyInstructionTruth(input.dependencyInstructionTruth);
  const proofDepthInstructionTruth =
    input.proofDepthInstructionTruth === undefined ||
    input.proofDepthInstructionTruth === null
      ? null
      : constructDerivedProofDepthInstructionTruth(input.proofDepthInstructionTruth);
  issues.push(...latitudeIssues);
  const ruleForbidden = hasForbiddenRuleField(input.rule);
  for (const field of ruleForbidden) {
    issues.push(
      issue({
        issueKind: "duplicate_carrier_truth",
        algebraRef: "field_cut",
        message: `instruction assembly rule redeclares ${field}`,
        evidenceRefs: [input.rule.ruleRef]
      })
    );
  }
  for (const algebra of INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS) {
    if (!input.knownAlgebraRefs.includes(algebra)) {
      issues.push(
        issue({
          issueKind: "missing_known_algebra",
          algebraRef: algebra,
          message: `compiler decision lacks known algebra ${algebra}`,
          evidenceRefs: [input.planRef]
        })
      );
    }
  }
  if (!input.rule.appliesToGraphFunctionRefs.includes(input.graphFunctionRef)) {
    issues.push(
      issue({
        issueKind: "scope_mismatch",
        algebraRef: "source_trace",
        message: "assembly rule does not apply to selected graph function",
        evidenceRefs: [input.rule.ruleRef, input.graphFunctionRef]
      })
    );
  }
  if (!input.rule.appliesToVectorRefs.includes(input.vectorRef)) {
    issues.push(
      issue({
        issueKind: "scope_mismatch",
        algebraRef: "source_trace",
        message: "assembly rule does not apply to selected vector",
        evidenceRefs: [input.rule.ruleRef, input.vectorRef]
      })
    );
  }
  if (input.registryEntryRefs.length === 0) {
    issues.push(
      issue({
        issueKind: "missing_source_truth",
        algebraRef: "source_trace",
        message: "compiled plan requires at least one admitted registry entry ref",
        evidenceRefs: [input.planRef]
      })
    );
  }
  if (input.derivedTruth.sourceTypeRefs.length === 0 || input.derivedTruth.targetTypeRefs.length === 0) {
    issues.push(
      issue({
        issueKind: "type_coverage_gap",
        algebraRef: "type_coverage",
        message: "compiled plan requires source and target type coverage",
        evidenceRefs: [input.planRef]
      })
    );
  }
  if (input.derivedTruth.outputContractRefs.length === 0) {
    issues.push(
      issue({
        issueKind: "output_contract_gap",
        algebraRef: "output_contract_derivation",
        message: "compiled plan requires derived output contract refs",
        evidenceRefs: [input.targetNodeRef]
      })
    );
  }
  if (input.derivedTruth.proofRefs.length === 0) {
    issues.push(
      issue({
        issueKind: "proof_gap",
        algebraRef: "authority_proof_renderer_derivation",
        message: "compiled plan requires derived proof refs",
        evidenceRefs: [input.targetNodeRef]
      })
    );
  }
  if (input.derivedTruth.authorityRefs.length === 0) {
    issues.push(
      issue({
        issueKind: "authority_gap",
        algebraRef: "authority_proof_renderer_derivation",
        message: "compiled plan requires derived authority refs",
        evidenceRefs: [input.targetNodeRef]
      })
    );
  }
  if (input.derivedTruth.rendererRefs.length === 0 && input.proportionalityClass !== "P0") {
    issues.push(
      issue({
        issueKind: "renderer_gap",
        algebraRef: "authority_proof_renderer_derivation",
        message: "non-P0 plan requires an admitted renderer ref",
        evidenceRefs: [input.targetNodeRef]
      })
    );
  }
  for (const requiredRef of input.requiredInputRefs) {
    if (!input.availableInputRefs.includes(requiredRef)) {
      issues.push(
        issue({
          issueKind: "relevance_gap",
          algebraRef: "relevance",
          message: `required input ${requiredRef} is not available to the current edge`,
          evidenceRefs: [requiredRef]
        })
      );
    }
  }
  const futureAllowed = new Set(
    input.rule.relevanceRules.flatMap((row) => row.allowFutureStageRefs)
  );
  for (const section of input.sectionDecisions) {
    if (
      section.disposition === "include" &&
      section.dependencyRefs.length === 0
    ) {
      issues.push(
        issue({
          issueKind: "relevance_gap",
          algebraRef: "relevance",
          message: `included section ${section.sectionRef} has no dependency refs`,
          evidenceRefs: [section.sectionRef]
        })
      );
    }
    if (
      section.disposition === "include" &&
      section.stageRef.startsWith("stage://future") &&
      !futureAllowed.has(section.stageRef)
    ) {
      issues.push(
        issue({
          issueKind: "future_stage_bleed",
          algebraRef: "relevance",
          message: `included section ${section.sectionRef} carries future-stage truth`,
          evidenceRefs: [section.sectionRef, section.stageRef]
        })
      );
    }
    if (
      section.disposition === "include" &&
      section.compressionMode === "excerpt" &&
      (section.text.length === 0 || section.excerptDigest === null)
    ) {
      issues.push(
        issue({
          issueKind: "compression_gap",
          algebraRef: "compression",
          message: `excerpt section ${section.sectionRef} requires text and excerpt digest`,
          evidenceRefs: [section.sectionRef]
        })
      );
    }
    if (
      section.disposition === "include" &&
      section.compressionMode === "full" &&
      !section.fullContentAdmitted
    ) {
      issues.push(
        issue({
          issueKind: "compression_gap",
          algebraRef: "compression",
          message: `full section ${section.sectionRef} requires admitted full content`,
          evidenceRefs: [section.sectionRef]
        })
      );
    }
    const sectionText = lower(section.text);
    for (const marker of input.expectedAnswerMarkers) {
      if (marker.length > 0 && sectionText.includes(lower(marker))) {
        issues.push(
          issue({
            issueKind: "answer_shaped_content",
            algebraRef: "non_tautology",
            message: `section ${section.sectionRef} carries answer-shaped marker`,
            evidenceRefs: [section.sectionRef, marker]
          })
        );
      }
    }
  }
  const slotClasses = new Set(input.bindingSlots.map((slot) => slot.slotClass));
  for (const requiredSlotClass of input.rule.runtimeBindingSlotClasses) {
    if (!slotClasses.has(requiredSlotClass)) {
      issues.push(
        issue({
          issueKind: "runtime_binding_gap",
          algebraRef: "runtime_binding",
          message: `runtime binding slot ${requiredSlotClass} is not declared`,
          evidenceRefs: [input.rule.ruleRef]
        })
      );
    }
  }
  if (input.proportionalityClass === "P0" && input.derivedTruth.activeRegime === "F_P") {
    issues.push(
      issue({
        issueKind: "p0_dispatch_forbidden",
        algebraRef: "proportionality",
        message: "P0 deterministic plan cannot target an F_P active regime",
        evidenceRefs: [input.planRef, input.vectorRef]
      })
    );
  }
  if (
    input.knownAlgebraRefs.includes("dependency_sufficiency") &&
    instructionWorkKind === "not_applicable"
  ) {
    issues.push(
      issue({
        issueKind: "dependency_sufficiency_gap",
        algebraRef: "dependency_sufficiency",
        message:
          "dependency sufficiency algebra requires explicit target_work or dependency_disambiguation classification",
        evidenceRefs: [input.planRef, input.vectorRef]
      })
    );
  }
  if (instructionWorkKind === "target_work") {
    if (dependencyInstructionTruth === null) {
      issues.push(
        issue({
          issueKind: "dependency_sufficiency_gap",
          algebraRef: "dependency_sufficiency",
          message: "target work requires derived dependency instruction truth",
          evidenceRefs: [input.planRef, input.vectorRef]
        })
      );
    } else {
      if (dependencyInstructionTruth.workKind !== "target_work") {
        issues.push(
          issue({
            issueKind: "dependency_sufficiency_gap",
            algebraRef: "dependency_sufficiency",
            message: "target work requires dependency truth classified as target_work",
            evidenceRefs: [dependencyInstructionTruth.truthRef, input.vectorRef]
          })
        );
      }
      if (
        (dependencyInstructionTruth.dependencyGraphRef === null ||
          dependencyInstructionTruth.dependencyGraphDigest === null) &&
        dependencyInstructionTruth.noDependencyPolicyRef === null
      ) {
        issues.push(
          issue({
            issueKind: "dependency_sufficiency_gap",
            algebraRef: "dependency_graph_projection",
            message: "target work requires a dependency graph or admitted no-dependency policy",
            evidenceRefs: [dependencyInstructionTruth.truthRef, input.vectorRef]
          })
        );
      }
      if (
        !dependencyInstructionTruth.dependencyClosed &&
        dependencyInstructionTruth.noDependencyPolicyRef === null
      ) {
        issues.push(
          issue({
            issueKind: "dependency_sufficiency_gap",
            algebraRef: "prerequisite_closure",
            message: "target work requires F_D prerequisite closure before F_P dispatch",
            evidenceRefs: [dependencyInstructionTruth.truthRef, input.vectorRef]
          })
        );
      }
      for (const gapRef of dependencyInstructionTruth.typedPrerequisiteGapRefs) {
        issues.push(
          issue({
            issueKind: "typed_prerequisite_gap",
            algebraRef: "dependency_sufficiency",
            message: `target work has unresolved typed prerequisite gap ${gapRef}`,
            evidenceRefs: [dependencyInstructionTruth.truthRef, gapRef]
          })
        );
        if (gapRef.includes("requirement_node") || gapRef.includes("missing_node")) {
          issues.push(
            issue({
              issueKind: "unresolved_requirement_node",
              algebraRef: "obligation_lineage",
              message: `target work has unresolved requirement/dependency node ${gapRef}`,
              evidenceRefs: [dependencyInstructionTruth.truthRef, gapRef]
            })
          );
        }
        if (gapRef.includes("dependency_edge") || gapRef.includes("missing_edge")) {
          issues.push(
            issue({
              issueKind: "missing_dependency_edge",
              algebraRef: "dependency_graph_projection",
              message: `target work has missing dependency edge ${gapRef}`,
              evidenceRefs: [dependencyInstructionTruth.truthRef, gapRef]
            })
          );
        }
      }
    }
    if (proofDepthInstructionTruth === null) {
      issues.push(
        issue({
          issueKind: "depth_policy_incomplete",
          algebraRef: "proof_policy_depth_completeness",
          message: "target work requires derived proof-depth instruction truth",
          evidenceRefs: [input.planRef, input.vectorRef]
        })
      );
    } else {
      if (
        proofDepthInstructionTruth.depthPolicyRef === null ||
        proofDepthInstructionTruth.depthPolicyDigest === null
      ) {
        issues.push(
          issue({
            issueKind: "depth_policy_incomplete",
            algebraRef: "depth_obligation_policy",
            message: "target work requires admitted proof-depth policy identity",
            evidenceRefs: [proofDepthInstructionTruth.truthRef, input.vectorRef]
          })
        );
      }
      if (!proofDepthInstructionTruth.depthComplete) {
        issues.push(
          issue({
            issueKind: "depth_policy_incomplete",
            algebraRef: "proof_policy_depth_completeness",
            message: "target work requires complete proof-policy depth before closure-bearing dispatch",
            evidenceRefs: [proofDepthInstructionTruth.truthRef, input.vectorRef]
          })
        );
      }
      const coveredDepthClasses = new Set([
        ...proofDepthInstructionTruth.declaredDepthClassRefs,
        ...proofDepthInstructionTruth.notApplicableDepthClassRefs
      ]);
      for (const depthClassRef of proofDepthInstructionTruth.requiredDepthClassRefs) {
        if (!coveredDepthClasses.has(depthClassRef)) {
          issues.push(
            issue({
              issueKind: "missing_depth_obligation_class",
              algebraRef: "depth_obligation_policy",
              message: `proof policy does not account for required depth class ${depthClassRef}`,
              evidenceRefs: [proofDepthInstructionTruth.truthRef, depthClassRef]
            })
          );
        }
      }
      for (const gapRef of proofDepthInstructionTruth.typedDepthGapRefs) {
        issues.push(
          issue({
            issueKind: gapRef.includes("not_applicable")
              ? "depth_class_not_applicable_unjustified"
              : gapRef.includes("missing_depth") ||
                  gapRef.includes("missing_depth_obligation_class")
                ? "missing_depth_obligation_class"
                : "depth_policy_incomplete",
            algebraRef: "proof_policy_depth_completeness",
            message: `target work has unresolved proof-depth gap ${gapRef}`,
            evidenceRefs: [proofDepthInstructionTruth.truthRef, gapRef]
          })
        );
      }
      if (
        !proofDepthInstructionTruth.proofStrengthAdmitted ||
        proofDepthInstructionTruth.proofStrengthAdmissionRefs.length === 0
      ) {
        issues.push(
          issue({
            issueKind: "proof_strength_not_admitted",
            algebraRef: "proof_strength_admission",
            message: "target work requires admitted proof-strength before closure-bearing dispatch",
            evidenceRefs: [proofDepthInstructionTruth.truthRef, input.vectorRef]
          })
        );
      }
      if (
        proofDepthInstructionTruth.proofStrengthAdmissionRefs.length > 0 &&
        proofDepthInstructionTruth.fdStrengthCriterionRefs.length === 0 &&
        proofDepthInstructionTruth.adversarialVerificationRefs.length === 0
      ) {
        issues.push(
          issue({
            issueKind: "proof_strength_not_adversarially_verified",
            algebraRef: "adversarial_verification",
            message:
              "proof-strength admission requires a total F_D criterion or adversarial verification",
            evidenceRefs: [proofDepthInstructionTruth.truthRef, input.vectorRef]
          })
        );
      }
      for (const counterexampleRef of proofDepthInstructionTruth.adversarialCounterexampleRefs) {
        issues.push(
          issue({
            issueKind: "adversarial_counterexample_found",
            algebraRef: "adversarial_verification",
            message: `adversarial verification found blocking counterexample ${counterexampleRef}`,
            evidenceRefs: [proofDepthInstructionTruth.truthRef, counterexampleRef]
          })
        );
      }
    }
  } else if (
    instructionWorkKind === "dependency_disambiguation" &&
    dependencyInstructionTruth !== null &&
    dependencyInstructionTruth.workKind !== "dependency_disambiguation"
  ) {
    issues.push(
      issue({
        issueKind: "dependency_sufficiency_gap",
        algebraRef: "dependency_sufficiency",
        message: "dependency-disambiguation dispatch requires matching dependency truth classification",
        evidenceRefs: [dependencyInstructionTruth.truthRef, input.vectorRef]
      })
    );
  }
  if (issues.length > 0) {
    return Object.freeze({
      kind: "instruction_assembly_compile_rejected",
      accepted: false,
      plan: null,
      issues: Object.freeze(issues)
    });
  }
  const withoutDigest = Object.freeze({
    kind: "compiled_prompt_plan" as const,
    causalExcerptMaxChars,
    declaredLatitude: Object.freeze(declaredLatitude),
    goldenInstanceCalibration: Object.freeze(goldenInstanceCalibration),
    planRef: input.planRef,
    ruleRef: input.rule.ruleRef,
    computeStageRole,
    graphFunctionRef: input.graphFunctionRef,
    vectorRef: input.vectorRef,
    registryEntryRefs: uniqueSorted(input.registryEntryRefs),
    sourceNodeRefs: uniqueSorted(input.sourceNodeRefs),
    targetNodeRef: input.targetNodeRef,
    derivedTruth: Object.freeze({
      ...input.derivedTruth,
      sourceTypeRefs: uniqueSorted(input.derivedTruth.sourceTypeRefs),
      targetTypeRefs: uniqueSorted(input.derivedTruth.targetTypeRefs),
      outputContractRefs: uniqueSorted(input.derivedTruth.outputContractRefs),
      proofRefs: uniqueSorted(input.derivedTruth.proofRefs),
      authorityRefs: uniqueSorted(input.derivedTruth.authorityRefs),
      rendererRefs: uniqueSorted(input.derivedTruth.rendererRefs),
      carrierClassRefs: uniqueSorted(input.derivedTruth.carrierClassRefs)
    }),
    knownAlgebraRefs: Object.freeze([...input.knownAlgebraRefs]),
    requiredInputRefs: uniqueSorted(input.requiredInputRefs),
    availableInputRefs: uniqueSorted(input.availableInputRefs),
    sectionDecisions: Object.freeze([...input.sectionDecisions]),
    bindingSlots: Object.freeze([...input.bindingSlots]),
    proportionalityClass: input.proportionalityClass,
    instructionWorkKind,
    dependencyInstructionTruth,
    proofDepthInstructionTruth,
    shouldDispatchFp: input.proportionalityClass !== "P0",
    fpValidationEvidenceRefs: uniqueSorted(input.fpValidationEvidenceRefs ?? []),
    compilerEvidenceRefs: uniqueSorted(input.compilerEvidenceRefs ?? []),
    compilerDiagnostics: Object.freeze([] as InstructionAssemblyIssue[])
  });
  const plan = Object.freeze({
    ...withoutDigest,
    planDigest: planDigest(withoutDigest)
  });
  return Object.freeze({
    kind: "instruction_assembly_compile_accepted",
    accepted: true,
    plan,
    issues: Object.freeze([] as InstructionAssemblyIssue[])
  });
}

export function admitCompiledPromptPlanAtStartup(input: {
  readonly plan: CompiledPromptPlan;
  readonly registryEntryRefs: readonly string[];
  readonly startupEventRefs: readonly string[];
}): CompiledPromptPlanStartupAdmission {
  const issues: InstructionAssemblyIssue[] = [];
  if (input.startupEventRefs.length === 0) {
    issues.push(
      issue({
        issueKind: "startup_admission_gap",
        algebraRef: "startup",
        message: "compiled prompt plan startup admission requires startup event refs",
        evidenceRefs: [input.plan.planRef]
      })
    );
  }
  for (const entryRef of input.plan.registryEntryRefs) {
    if (!input.registryEntryRefs.includes(entryRef)) {
      issues.push(
        issue({
          issueKind: "startup_admission_gap",
          algebraRef: "startup",
          message: `compiled prompt plan references unadmitted registry entry ${entryRef}`,
          evidenceRefs: [input.plan.planRef, entryRef]
        })
      );
    }
  }
  return Object.freeze({
    kind: "compiled_prompt_plan_startup_admission",
    admitted: issues.length === 0,
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    startupEventRefs: uniqueSorted(input.startupEventRefs),
    registryEntryRefs: uniqueSorted(input.registryEntryRefs),
    issues: Object.freeze(issues)
  });
}

export function bindInstructionEnvelope(input: {
  readonly envelopeRef: string;
  readonly plan: CompiledPromptPlan;
  readonly startupAdmission: CompiledPromptPlanStartupAdmission;
  readonly runtimeFacts: readonly RuntimeBindingFact[];
}): InstructionEnvelopeBindResult {
  const issues: InstructionAssemblyIssue[] = [];
  if (!input.startupAdmission.admitted) {
    issues.push(
      issue({
        issueKind: "startup_admission_gap",
        algebraRef: "startup",
        message: "instruction envelope requires admitted compiled prompt plan",
        evidenceRefs: [input.plan.planRef]
      })
    );
  }
  if (input.startupAdmission.planDigest !== input.plan.planDigest) {
    issues.push(
      issue({
        issueKind: "startup_admission_gap",
        algebraRef: "startup",
        message: "compiled prompt plan digest does not match startup admission",
        evidenceRefs: [input.plan.planRef]
      })
    );
  }
  const factsBySlot = new Map<RuntimeBindingSlotClass, RuntimeBindingFact[]>();
  for (const fact of input.runtimeFacts) {
    const current = factsBySlot.get(fact.slotClass) ?? [];
    current.push(fact);
    factsBySlot.set(fact.slotClass, current);
    if (!fact.admitted || !fact.digest.startsWith("sha256:")) {
      issues.push(
        issue({
          issueKind: "runtime_binding_gap",
          algebraRef: "runtime_binding",
          message: `runtime binding fact ${fact.ref} is not admitted with sha256 digest`,
          evidenceRefs: [fact.ref, ...fact.sourceEventRefs]
        })
      );
    }
  }
  for (const slot of input.plan.bindingSlots) {
    if (slot.required && (factsBySlot.get(slot.slotClass) ?? []).length === 0) {
      issues.push(
        issue({
          issueKind: "runtime_binding_gap",
          algebraRef: "runtime_binding",
          message: `required runtime binding slot ${slot.slotClass} is missing`,
          evidenceRefs: [slot.slotRef]
        })
      );
    }
  }
  if (issues.length > 0) {
    return Object.freeze({
      kind: "instruction_envelope_bind_rejected",
      accepted: false,
      envelope: null,
      issues: Object.freeze(issues)
    });
  }
  const withoutDigest = Object.freeze({
    kind: "instruction_envelope" as const,
    envelopeRef: input.envelopeRef,
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    graphFunctionRef: input.plan.graphFunctionRef,
    vectorRef: input.plan.vectorRef,
    boundRuntimeRefs: Object.freeze([...input.runtimeFacts]),
    outputContractRefs: uniqueSorted(input.plan.derivedTruth.outputContractRefs),
    shouldDispatchFp: input.plan.shouldDispatchFp
  });
  const envelope = Object.freeze({
    ...withoutDigest,
    envelopeDigest: envelopeDigest(withoutDigest)
  });
  return Object.freeze({
    kind: "instruction_envelope_bind_accepted",
    accepted: true,
    envelope,
    issues: Object.freeze([] as InstructionAssemblyIssue[])
  });
}

export function renderPromptManifest(input: {
  readonly manifestRef: string;
  readonly plan: CompiledPromptPlan;
  readonly envelope: InstructionEnvelope;
  readonly rendererRef: string;
}): PromptManifestRenderResult {
  if (!input.plan.shouldDispatchFp || !input.envelope.shouldDispatchFp) {
    return Object.freeze({
      kind: "prompt_manifest_render_rejected",
      accepted: false,
      manifest: null,
      issues: Object.freeze([
        issue({
          issueKind: "p0_dispatch_forbidden",
          algebraRef: "proportionality",
          message: "P0 deterministic plan shall not render an F_P prompt",
          evidenceRefs: [input.plan.planRef, input.envelope.envelopeRef]
        })
      ])
    });
  }
  const renderedPrompt = renderedPromptFor({
    plan: input.plan,
    envelope: input.envelope
  });
  const withoutDigest = Object.freeze({
    kind: "prompt_manifest" as const,
    manifestRef: input.manifestRef,
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    envelopeRef: input.envelope.envelopeRef,
    envelopeDigest: input.envelope.envelopeDigest,
    rendererRef: input.rendererRef,
    promptDigest: stableSha256Digest(renderedPrompt),
    includedCarrierRefs: classifyCarriers(input.plan.sectionDecisions, "include"),
    omittedCarrierRefs: classifyCarriers(input.plan.sectionDecisions, "omit"),
    refOnlyCarrierRefs: classifyCarriers(input.plan.sectionDecisions, "ref_only"),
    gapRefs: classifyCarriers(input.plan.sectionDecisions, "gap"),
    forbiddenCarrierRefs: classifyCarriers(input.plan.sectionDecisions, "forbidden"),
    dependencyInstructionTruthRefs: dependencyInstructionTruthRefs(
      input.plan.dependencyInstructionTruth
    ),
    dependencyGraphRefs: dependencyGraphRefs(input.plan.dependencyInstructionTruth),
    typedPrerequisiteGapRefs: typedPrerequisiteGapRefs(input.plan.dependencyInstructionTruth),
    proofDepthInstructionTruthRefs: proofDepthInstructionTruthRefs(
      input.plan.proofDepthInstructionTruth
    ),
    depthPolicyRefs: depthPolicyRefs(input.plan.proofDepthInstructionTruth),
    typedDepthGapRefs: typedDepthGapRefs(input.plan.proofDepthInstructionTruth),
    proofStrengthAdmissionRefs: proofStrengthAdmissionRefs(
      input.plan.proofDepthInstructionTruth
    ),
    adversarialCounterexampleRefs: adversarialCounterexampleRefs(
      input.plan.proofDepthInstructionTruth
    ),
    outputContractRefs: uniqueSorted(input.envelope.outputContractRefs),
    renderedPrompt
  });
  const manifest = Object.freeze({
    ...withoutDigest,
    manifestDigest: manifestDigest(withoutDigest)
  });
  return Object.freeze({
    kind: "prompt_manifest_render_accepted",
    accepted: true,
    manifest,
    issues: Object.freeze([] as InstructionAssemblyIssue[])
  });
}

export function replayPromptManifest(input: {
  readonly plan: CompiledPromptPlan;
  readonly envelope: InstructionEnvelope;
  readonly manifest: PromptManifest;
}): PromptManifestReplayResult {
  const expectedPrompt = renderedPromptFor({
    plan: input.plan,
    envelope: input.envelope
  });
  const expectedPromptDigest = stableSha256Digest(expectedPrompt);
  const withoutDigest = Object.freeze({
    kind: "prompt_manifest" as const,
    manifestRef: input.manifest.manifestRef,
    planRef: input.plan.planRef,
    planDigest: input.plan.planDigest,
    envelopeRef: input.envelope.envelopeRef,
    envelopeDigest: input.envelope.envelopeDigest,
    rendererRef: input.manifest.rendererRef,
    promptDigest: expectedPromptDigest,
    includedCarrierRefs: classifyCarriers(input.plan.sectionDecisions, "include"),
    omittedCarrierRefs: classifyCarriers(input.plan.sectionDecisions, "omit"),
    refOnlyCarrierRefs: classifyCarriers(input.plan.sectionDecisions, "ref_only"),
    gapRefs: classifyCarriers(input.plan.sectionDecisions, "gap"),
    forbiddenCarrierRefs: classifyCarriers(input.plan.sectionDecisions, "forbidden"),
    dependencyInstructionTruthRefs: dependencyInstructionTruthRefs(
      input.plan.dependencyInstructionTruth
    ),
    dependencyGraphRefs: dependencyGraphRefs(input.plan.dependencyInstructionTruth),
    typedPrerequisiteGapRefs: typedPrerequisiteGapRefs(input.plan.dependencyInstructionTruth),
    proofDepthInstructionTruthRefs: proofDepthInstructionTruthRefs(
      input.plan.proofDepthInstructionTruth
    ),
    depthPolicyRefs: depthPolicyRefs(input.plan.proofDepthInstructionTruth),
    typedDepthGapRefs: typedDepthGapRefs(input.plan.proofDepthInstructionTruth),
    proofStrengthAdmissionRefs: proofStrengthAdmissionRefs(
      input.plan.proofDepthInstructionTruth
    ),
    adversarialCounterexampleRefs: adversarialCounterexampleRefs(
      input.plan.proofDepthInstructionTruth
    ),
    outputContractRefs: uniqueSorted(input.envelope.outputContractRefs),
    renderedPrompt: expectedPrompt
  });
  const expectedManifestDigest = manifestDigest(withoutDigest);
  const issues: InstructionAssemblyIssue[] = [];
  if (input.manifest.promptDigest !== expectedPromptDigest) {
    issues.push(
      issue({
        issueKind: "manifest_replay_mismatch",
        algebraRef: "manifest",
        message: "prompt manifest prompt digest does not replay",
        evidenceRefs: [input.manifest.manifestRef]
      })
    );
  }
  if (input.manifest.manifestDigest !== expectedManifestDigest) {
    issues.push(
      issue({
        issueKind: "manifest_replay_mismatch",
        algebraRef: "manifest",
        message: "prompt manifest digest does not replay",
        evidenceRefs: [input.manifest.manifestRef]
      })
    );
  }
  return Object.freeze({
    kind: "prompt_manifest_replay_result",
    passed: issues.length === 0,
    expectedPromptDigest,
    expectedManifestDigest,
    issues: Object.freeze(issues)
  });
}
