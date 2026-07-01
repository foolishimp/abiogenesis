// Implements: T-183
// Implements: REQ-R-ABG3-INSTRUCTION-ASSEMBLY

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
  "runtime_binding"
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
  | "runtime_binding_gap"
  | "startup_admission_gap"
  | "manifest_replay_mismatch"
  | "p0_dispatch_forbidden";

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
  readonly planRef: string;
  readonly rule: InstructionAssemblyRule;
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
  readonly fpValidationEvidenceRefs?: readonly string[] | undefined;
  readonly compilerEvidenceRefs?: readonly string[] | undefined;
}

export interface CompiledPromptPlan {
  readonly kind: "compiled_prompt_plan";
  readonly planRef: string;
  readonly planDigest: string;
  readonly ruleRef: string;
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

function envelopeDigest(input: Omit<InstructionEnvelope, "envelopeDigest">): string {
  return stableSha256Digest(input);
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
      const carrierLine = `carriers: ${stableJson(section.carrierRefs)}`;
      const dependencyLine = `dependencies: ${stableJson(section.dependencyRefs)}`;
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
              `  ref: ${fact.ref}`,
              `  digest: ${fact.digest}`,
              `  payloadDigest: ${fact.payloadDigest ?? "none"}`,
              `  contentRef: ${fact.contentRef ?? "none"}`,
              `  contentDigest: ${fact.contentDigest ?? "none"}`,
              `  contentExcerpt: ${stableJson(fact.contentExcerpt ?? null)}`,
              `  sourceEventRefs: ${stableJson(fact.sourceEventRefs)}`
            ].join("\n")
          )
          .join("\n");
  return [
    sectionText,
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
    planRef: input.planRef,
    ruleRef: input.rule.ruleRef,
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
