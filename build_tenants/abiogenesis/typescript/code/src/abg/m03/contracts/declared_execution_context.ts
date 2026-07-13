// Implements: T-256; REQ-R-ABG3-INSTRUCTION-ASSEMBLY-001..017;
// REQ-L-GTL3-C-ALGEBRA-009/-011/-013/-016.

import {
  nodeContractKey,
  type AssetSurface,
  type GraphFunction,
  type GraphVector,
  type Node,
  type Rule,
  type SerializedAttrEntry,
  type SerializedAttrs,
  type SerializedAttrValue,
  type SerializedJsonValue
} from "../../../gtl/m01/contracts/carriers.js";
import { serializedJsonValueToPlain } from "../../../gtl/m01/contracts/constructors.js";
import {
  admitCProgramSyntax,
  type AdmittedCProgramDeclarationNode
} from "../../../gtl/m01/algebra/c_algebra.js";
import type { Module } from "../../../gtl/m02/contracts/carriers.js";
import {
  stableJsonEquals,
  stableSha256Digest,
  sha256DigestForText
} from "../../../shared/runtime_identity.js";
import { compileCAlgebraToHog } from "./c_algebra_hog_compiler.js";
import type { HogProgramDeclaration, HogProgramStage } from "./hog_program.js";
import {
  compileGraphVectorCProgramSelection,
  type CompiledGraphVectorCProgramBinding
} from "./graph_vector_c_program_compiler.js";
import type {
  GraphVectorExecutionHandoffCapabilityBlocked,
  GraphVectorExecutionHandoffOutcome,
  GraphVectorExecutionHandoffPublished,
  TenantCapabilityCoverageProjection,
  TraversalStartupBlock
} from "./graph_vector_execution_handoff.js";
import type {
  AdmittedRuntimeCatalogBasis,
  CatalogDeclarationModuleBinding,
  CatalogExecutionBinding
} from "./runtime_catalog.js";
import {
  INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS,
  RUNTIME_BINDING_SLOT_CLASS_VALUES,
  admitCompiledPromptPlanAtStartup,
  bindInstructionEnvelope,
  compileInstructionAssemblyPlan,
  constructInstructionSectionDecision,
  constructInstructionAssemblyRule,
  constructRuntimeBindingSlot,
  type CompiledPromptPlan,
  type CompiledPromptPlanStartupAdmission,
  type DerivedDependencyInstructionTruth,
  type DerivedInstructionCarrierTruth,
  type DerivedProofDepthInstructionTruth,
  type InstructionAssemblyComputeStageRole,
  type InstructionAssemblyRelevanceRule,
  type InstructionEnvelope,
  type InstructionProportionalityClass,
  type InstructionSectionDecision,
  type InstructionWorkKind,
  type RuntimeBindingFact,
  type RuntimeBindingSlot,
  type RuntimeBindingSlotClass
} from "./instruction_assembly.js";

export const EXECUTION_CONTEXT_PROJECTION_RULE_KIND =
  "gtl.execution_context_projection" as const;
export const INSTRUCTION_PROTOCOL_RULE_KIND = "gtl.instruction_protocol" as const;

export const EXECUTION_CONTEXT_SLOT_VALUES = Object.freeze([
  "role_or_worker_selection_ref",
  "configuration_digest",
  "instruction_protocol_ref",
  "result_contract_ref",
  "capability_requirement_refs",
  "interaction_subject_ref"
] as const);

export type ExecutionContextSlot =
  (typeof EXECUTION_CONTEXT_SLOT_VALUES)[number];

export const EXECUTION_CONTEXT_VALUE_KIND_VALUES = Object.freeze([
  "ref",
  "digest",
  "ref_list"
] as const);

export type ExecutionContextValueKind =
  (typeof EXECUTION_CONTEXT_VALUE_KIND_VALUES)[number];

export interface ExecutionContextFieldRowDeclaration {
  readonly slot: ExecutionContextSlot;
  readonly fieldPath: string;
  readonly valueKind: ExecutionContextValueKind;
  readonly required: boolean;
}

export interface ExecutionContextProjectionDeclaration {
  readonly projectionRef: string;
  readonly version: string;
  readonly sourceNodeRef: string;
  readonly fieldRows: readonly ExecutionContextFieldRowDeclaration[];
  readonly policyRefs: readonly string[];
}

export interface InstructionProtocolSectionDeclaration {
  readonly sectionRef: string;
  readonly sectionKindRef: string;
  readonly content: string;
  readonly contentDigest: `sha256:${string}`;
  readonly required: boolean;
  readonly policyRefs: readonly string[];
}

export interface InstructionProtocolDeclaration {
  readonly instructionProtocolRef: string;
  readonly version: string;
  readonly instructionAssetNodeRef: string;
  readonly allowedStageRoles: readonly string[];
  readonly sections: readonly InstructionProtocolSectionDeclaration[];
  readonly relevancePolicyRefs: readonly string[];
  readonly compressionPolicyRef: string;
  readonly proportionalityPolicyRef: string;
  readonly runtimeBindingSlotClasses: readonly RuntimeBindingSlotClass[];
  readonly instructionWorkKind: InstructionWorkKind;
  readonly policyRefs: readonly string[];
}

export interface DeclaredCStageInvocationBasis {
  readonly kind: "declared_c_stage_invocation_basis";
  readonly programBindingDigest: `sha256:${string}`;
  readonly stageIndex: number;
  readonly stageRole: string;
  readonly regime: "F_P" | "F_H";
  readonly termDigest: `sha256:${string}`;
  readonly instructionCategoryRefs: readonly string[];
  readonly basisDigest: `sha256:${string}`;
}

export interface AdmittedInvocationCarrier {
  readonly kind: "admitted_invocation_carrier";
  readonly sourceNodeRef: string;
  readonly schemaRef: string;
  readonly carrierRef: string;
  readonly carrierDigest: `sha256:${string}`;
  readonly admissionRef: string;
  readonly value: unknown;
}

export interface AdmittedInvocationCarrierSet {
  readonly kind: "admitted_invocation_carrier_set";
  readonly carriers: readonly AdmittedInvocationCarrier[];
  readonly carrierSetDigest: `sha256:${string}`;
}

export interface CompiledExecutionContextFieldRow
  extends ExecutionContextFieldRowDeclaration {
  readonly projectionRef: string;
  readonly sourceNodeRef: string;
  readonly sourceSchemaRef: string;
  readonly sourceTypeRef: string | null;
}

export interface CompiledInstructionProtocol {
  readonly instructionProtocolRef: string;
  readonly version: string;
  readonly instructionAssetNodeRef: string;
  readonly instructionAssetSurface: AssetSurface;
  readonly allowedStageRoles: readonly string[];
  readonly sections: readonly InstructionProtocolSectionDeclaration[];
  readonly relevancePolicyRefs: readonly string[];
  readonly compressionPolicyRef: string;
  readonly proportionalityPolicyRef: string;
  readonly runtimeBindingSlotClasses: readonly RuntimeBindingSlotClass[];
  readonly instructionWorkKind: InstructionWorkKind;
  readonly policyRefs: readonly string[];
  readonly sourceModuleRef: string;
  readonly sourceModuleDigest: string;
  readonly protocolDigest: `sha256:${string}`;
}

export interface CompiledExecutionContextContract {
  readonly kind: "compiled_execution_context_contract";
  readonly contractRef: string;
  readonly contractDigest: `sha256:${string}`;
  readonly sourceOutcomeStatus: "published_startup_blocked" | "blocked_capability";
  readonly sourceBasisDigest: `sha256:${string}`;
  readonly publishedHandoffRef: string | null;
  readonly selectedProgramBinding: CompiledGraphVectorCProgramBinding;
  readonly selectedStage: HogProgramStage;
  readonly selectedStageIndex: number;
  readonly selectedStageDigest: `sha256:${string}`;
  readonly selectedStageRole: string;
  readonly selectedComputeStageRole: InstructionAssemblyComputeStageRole;
  readonly selectedRegime: "F_P" | "F_H";
  readonly declarationModuleRefs: readonly string[];
  readonly declarationClosureDigest: `sha256:${string}`;
  readonly fieldRows: readonly CompiledExecutionContextFieldRow[];
  readonly protocols: readonly CompiledInstructionProtocol[];
  readonly staticProtocolRefs: readonly string[];
  readonly targetCompatibilityRefs: readonly string[];
  readonly targetBindingDigest: `sha256:${string}`;
  readonly capabilityBasisDigest: `sha256:${string}` | null;
}

export interface AdmittedExecutionContextValues {
  readonly kind: "admitted_execution_context_values";
  readonly selectionContractRef: string | null;
  readonly configurationDigest: `sha256:${string}` | null;
  readonly instructionProtocolRef: string;
  readonly resultContractRef: string;
  readonly capabilityRequirementRefs: readonly string[];
  readonly interactionSubjectRef: string | null;
  readonly sourceCarrierRefs: readonly string[];
  readonly sourceCarrierDigests: readonly `sha256:${string}`[];
  readonly valuesDigest: `sha256:${string}`;
}

interface DerivedInstructionAssemblyRuntimeBasis {
  readonly kind: "derived_instruction_assembly_runtime_basis";
  readonly relevanceRules: readonly InstructionAssemblyRelevanceRule[];
  readonly sectionDecisions: readonly InstructionSectionDecision[];
  readonly bindingSlots: readonly RuntimeBindingSlot[];
  readonly runtimeFacts: readonly RuntimeBindingFact[];
  readonly availableInputRefs: readonly string[];
  readonly proportionalityClass: InstructionProportionalityClass;
  readonly expectedAnswerMarkers: readonly string[];
  readonly instructionWorkKind: InstructionWorkKind;
  readonly dependencyInstructionTruth: DerivedDependencyInstructionTruth | null;
  readonly proofDepthInstructionTruth: DerivedProofDepthInstructionTruth | null;
  readonly fpValidationEvidenceRefs: readonly string[];
  readonly compilerEvidenceRefs: readonly string[];
  readonly basisDigest: `sha256:${string}`;
}

export interface CanonicalFpInstructionAssembly {
  readonly kind: "canonical_fp_instruction_assembly";
  readonly plan: CompiledPromptPlan;
  readonly startupAdmission: CompiledPromptPlanStartupAdmission;
  readonly startupAdmissionBasisDigest: `sha256:${string}`;
  readonly envelope: InstructionEnvelope;
}

interface DeclaredExecutionRequestBase {
  readonly kind: "declared_execution_request";
  readonly requestRef: string;
  readonly requestDigest: `sha256:${string}`;
  readonly handoffRef: string;
  readonly stageRole: string;
  readonly stageTermDigest: `sha256:${string}`;
  readonly contextContractRef: string;
  readonly contextContractDigest: `sha256:${string}`;
  readonly startupBlock: TraversalStartupBlock;
  readonly startupBlockDigest: `sha256:${string}`;
}

export interface DeclaredFpExecutionRequest extends DeclaredExecutionRequestBase {
  readonly regime: "F_P";
  readonly planRef: string;
  readonly planDigest: `sha256:${string}`;
  readonly startupAdmissionBasisDigest: `sha256:${string}`;
  readonly envelopeRef: string;
  readonly envelopeDigest: `sha256:${string}`;
}

export interface DeclaredFhInteractionRequest
  extends DeclaredExecutionRequestBase {
  readonly regime: "F_H";
  readonly interactionSubjectRef: string;
  readonly declarationClosureDigest: `sha256:${string}`;
  readonly instructionProtocol: CompiledInstructionProtocol;
  readonly selectedProtocolSectionRefs: readonly string[];
  readonly protocolClosureDigest: `sha256:${string}`;
  readonly resultContractRef: string;
  readonly targetBindingDigest: `sha256:${string}`;
  readonly capabilityRefs: readonly string[];
  readonly capabilityBasisDigest: `sha256:${string}`;
  readonly sourceCarrierRefs: readonly string[];
  readonly sourceCarrierDigests: readonly `sha256:${string}`[];
}

export type DeclaredExecutionRequest =
  | DeclaredFpExecutionRequest
  | DeclaredFhInteractionRequest;

export const EXECUTION_CONTEXT_DIAGNOSTIC_ID_VALUES = Object.freeze([
  "execution-context-source-outcome-invalid",
  "execution-context-stage-basis-invalid",
  "execution-context-program-binding-mismatch",
  "execution-context-declaration-source-projection-missing",
  "execution-context-declaration-module-unresolved",
  "execution-context-declaration-module-ambiguous",
  "execution-context-declaration-module-digest-mismatch",
  "execution-context-bound-module-declaration-invalid",
  "execution-context-profile-shape-invalid",
  "execution-context-profile-wire-vocabulary-invalid",
  "execution-context-derived-truth-redeclared",
  "execution-context-projection-source-invalid",
  "execution-context-carrier-row-invalid",
  "execution-context-field-path-invalid",
  "execution-context-field-value-invalid",
  "execution-context-protocol-ref-invalid",
  "execution-context-protocol-content-digest-mismatch",
  "execution-context-protocol-stage-incompatible",
  "execution-context-instruction-asset-invalid",
  "execution-context-result-contract-incompatible",
  "execution-context-capability-incompatible",
  "execution-context-instruction-rule-invalid",
  "execution-context-prompt-plan-rejected",
  "execution-context-prompt-plan-startup-rejected",
  "execution-context-instruction-envelope-rejected"
] as const);

export type ExecutionContextDiagnosticId =
  (typeof EXECUTION_CONTEXT_DIAGNOSTIC_ID_VALUES)[number];

export type ExecutionContextRepairAffordance =
  | "correct_source_outcome"
  | "restore_replay_projection"
  | "admit_declaration_module"
  | "correct_reference"
  | "correct_field_shape"
  | "admit_runtime_carrier"
  | "repair_digest"
  | "correct_protocol"
  | "correct_result_contract"
  | "correct_capability_requirements"
  | "repair_tenant_capability_coverage"
  | "restore_instruction_compiler_input"
  | "restore_startup_admission"
  | "restore_runtime_binding_truth";

export interface ExecutionContextDiagnostic {
  readonly kind: "execution_context_diagnostic";
  readonly classification:
    | "invalid_program"
    | "invalid_runtime_binding"
    | "semantic_not_realized";
  readonly diagnosticId: ExecutionContextDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly actualRelation: string;
  readonly evidenceRefs: readonly string[];
  readonly repairAffordance: ExecutionContextRepairAffordance;
}

export interface DeclaredExecutionContextJoinRequestConstructed {
  readonly kind: "declared_execution_context_join_outcome";
  readonly status: "request_constructed";
  readonly compiledContract: CompiledExecutionContextContract;
  readonly values: AdmittedExecutionContextValues;
  readonly request: DeclaredExecutionRequest;
  readonly instructionAssembly: CanonicalFpInstructionAssembly | null;
  readonly diagnostics: readonly ExecutionContextDiagnostic[];
}

export interface DeclaredExecutionContextJoinCapabilityBlocked {
  readonly kind: "declared_execution_context_join_outcome";
  readonly status: "blocked_capability";
  readonly compiledContract: CompiledExecutionContextContract;
  readonly sourceCapabilityOutcome: GraphVectorExecutionHandoffCapabilityBlocked;
  readonly diagnostics: readonly ExecutionContextDiagnostic[];
}

export interface DeclaredExecutionContextJoinInvalid {
  readonly kind: "declared_execution_context_join_outcome";
  readonly status: "invalid";
  readonly diagnostics: readonly ExecutionContextDiagnostic[];
}

export type DeclaredExecutionContextJoinOutcome =
  | DeclaredExecutionContextJoinRequestConstructed
  | DeclaredExecutionContextJoinCapabilityBlocked
  | DeclaredExecutionContextJoinInvalid;

export interface JoinDeclaredExecutionContextInput {
  readonly sourceOutcome: GraphVectorExecutionHandoffOutcome;
  readonly stageBasis: DeclaredCStageInvocationBasis;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly invocationCarriers: AdmittedInvocationCarrierSet;
}

class ExecutionContextCompilationError extends Error {
  readonly diagnosticId: ExecutionContextDiagnosticId;
  readonly path: string;
  readonly expectedRelation: string;
  readonly evidenceRefs: readonly string[];
  readonly classification: ExecutionContextDiagnostic["classification"];

  constructor(input: {
    readonly diagnosticId: ExecutionContextDiagnosticId;
    readonly path: string;
    readonly expectedRelation: string;
    readonly actualRelation: string;
    readonly evidenceRefs?: readonly string[] | undefined;
    readonly classification?: ExecutionContextDiagnostic["classification"] | undefined;
  }) {
    super(input.actualRelation);
    this.name = "ExecutionContextCompilationError";
    this.diagnosticId = input.diagnosticId;
    this.path = input.path;
    this.expectedRelation = input.expectedRelation;
    this.evidenceRefs = Object.freeze([...(input.evidenceRefs ?? [])]);
    this.classification = input.classification ?? "invalid_program";
  }
}

const SHA256_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const EXACT_PROFILE_VERSION_PATTERN =
  /^\d+\.\d+\.\d+(?:-[0-9A-Za-z][0-9A-Za-z.-]*)?$/u;

function assertNonEmpty(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label} must be a non-empty string`);
  }
  return value;
}

function assertDigest(value: unknown, label: string): `sha256:${string}` {
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    throw new TypeError(`${label} must be canonical lowercase sha256`);
  }
  return value as `sha256:${string}`;
}

function profileVersion(value: unknown, label: string): string {
  const version = assertNonEmpty(value, label);
  if (!EXACT_PROFILE_VERSION_PATTERN.test(version)) {
    throw new TypeError(`${label} must be an exact profile version`);
  }
  return version;
}

function isPlainRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype: unknown = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function assertKnownKeys(
  value: Readonly<Record<string, unknown>>,
  keys: readonly string[],
  label: string
): void {
  const expected = new Set(keys);
  for (const key of Object.keys(value)) {
    if (!expected.has(key)) {
      throw new TypeError(`${label}.${key} is unknown`);
    }
  }
  for (const key of keys) {
    if (!Object.hasOwn(value, key)) {
      throw new TypeError(`${label}.${key} is required`);
    }
  }
}

function freezeUniqueStrings(values: unknown, label: string): readonly string[] {
  if (!Array.isArray(values)) {
    throw new TypeError(`${label} must be an array`);
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const [index, value] of values.entries()) {
    const ref = assertNonEmpty(value, `${label}[${String(index)}]`);
    if (seen.has(ref)) {
      throw new TypeError(`${label} contains duplicate ${JSON.stringify(ref)}`);
    }
    seen.add(ref);
    result.push(ref);
  }
  return Object.freeze(result);
}

function freezeUniqueDeclaredStrings(
  values: readonly string[],
  label: string
): readonly string[] {
  return freezeUniqueStrings([...values], label);
}

function serializedJson(value: unknown, label: string): SerializedJsonValue {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    (typeof value === "number" && Number.isFinite(value))
  ) {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze({
      kind: "array" as const,
      items: Object.freeze(
        value.map((item, index) => serializedJson(item, `${label}[${String(index)}]`))
      )
    });
  }
  if (!isPlainRecord(value)) {
    throw new TypeError(`${label} must be I-JSON`);
  }
  return Object.freeze({
    kind: "object" as const,
    entries: Object.freeze(
      Object.keys(value)
        .sort()
        .map((key) =>
          Object.freeze({ key, value: serializedJson(value[key], `${label}.${key}`) })
        )
    )
  });
}

function scalarEntry(key: string, value: string | null): SerializedAttrEntry {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "scalar" as const, value })
  });
}

function stringListEntry(key: string, value: readonly string[]): SerializedAttrEntry {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "string_list" as const, value: Object.freeze([...value]) })
  });
}

function jsonEntry(key: string, value: unknown): SerializedAttrEntry {
  return Object.freeze({
    key,
    value: Object.freeze({ kind: "json_blob" as const, value: serializedJson(value, key) })
  });
}

function ruleConfig(entries: readonly SerializedAttrEntry[]): SerializedAttrs {
  return Object.freeze({ entries: Object.freeze([...entries]) });
}

function valueForKey(config: SerializedAttrs, key: string): SerializedAttrValue {
  const entries = config.entries.filter((entry) => entry.key === key);
  if (entries.length !== 1) {
    throw new TypeError(`Rule.config.${key} must occur exactly once`);
  }
  const entry = entries[0];
  if (entry === undefined) {
    throw new TypeError(`Rule.config.${key} is missing`);
  }
  return entry.value;
}

function exactConfigKeys(
  config: SerializedAttrs,
  expectedKeys: readonly string[],
  label: string
): void {
  const expected = new Set(expectedKeys);
  for (const entry of config.entries) {
    if (!expected.has(entry.key)) {
      throw new TypeError(`${label}.${entry.key} is unknown`);
    }
  }
  if (config.entries.length !== expectedKeys.length) {
    throw new TypeError(`${label} must carry exactly ${String(expectedKeys.length)} keys`);
  }
  for (const key of expectedKeys) {
    valueForKey(config, key);
  }
}

function scalarConfig(
  config: SerializedAttrs,
  key: string,
  nullable = false
): string | null {
  const value = valueForKey(config, key);
  if (value.kind !== "scalar") {
    throw new TypeError(`Rule.config.${key} must be scalar`);
  }
  if (value.value === null && nullable) {
    return null;
  }
  return assertNonEmpty(value.value, `Rule.config.${key}`);
}

function stringListConfig(config: SerializedAttrs, key: string): readonly string[] {
  const value = valueForKey(config, key);
  if (value.kind !== "string_list") {
    throw new TypeError(`Rule.config.${key} must be string_list`);
  }
  return freezeUniqueStrings([...value.value], `Rule.config.${key}`);
}

function runtimeBindingSlotClasses(
  config: SerializedAttrs,
  key: string
): readonly RuntimeBindingSlotClass[] {
  return Object.freeze(
    stringListConfig(config, key).map((value) =>
      allowedValue(value, RUNTIME_BINDING_SLOT_CLASS_VALUES, `Rule.config.${key}`)
    )
  );
}

function jsonConfig(config: SerializedAttrs, key: string): unknown {
  const value = valueForKey(config, key);
  if (value.kind !== "json_blob") {
    throw new TypeError(`Rule.config.${key} must be json_blob`);
  }
  return serializedJsonValueToPlain(value.value);
}

function allowedValue<T extends string>(
  value: string,
  allowed: readonly T[],
  label: string
): T {
  const match = allowed.find((candidate) => candidate === value);
  if (match === undefined) {
    throw new TypeError(`${label} has unsupported value ${JSON.stringify(value)}`);
  }
  return match;
}

function fieldPath(value: unknown, label: string): string {
  const path = assertNonEmpty(value, label);
  const segments = path.split(".");
  if (
    segments.some(
      (segment) =>
        segment.length === 0 || segment === "*" || /^\d+$/u.test(segment)
    )
  ) {
    throw new TypeError(`${label} must be a dot-separated own-property path`);
  }
  return path;
}

function fieldRows(value: unknown): readonly ExecutionContextFieldRowDeclaration[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError("Rule.config.field_rows must be a non-empty array");
  }
  const slots = new Set<string>();
  return Object.freeze(
    value.map((raw, index) => {
      const label = `Rule.config.field_rows[${String(index)}]`;
      if (!isPlainRecord(raw)) {
        throw new TypeError(`${label} must be an object`);
      }
      assertKnownKeys(raw, ["field_path", "required", "slot", "value_kind"], label);
      const slot = allowedValue(
        assertNonEmpty(raw["slot"], `${label}.slot`),
        EXECUTION_CONTEXT_SLOT_VALUES,
        `${label}.slot`
      );
      if (slots.has(slot)) {
        throw new TypeError(`${label}.slot duplicates ${JSON.stringify(slot)}`);
      }
      slots.add(slot);
      if (typeof raw["required"] !== "boolean") {
        throw new TypeError(`${label}.required must be boolean`);
      }
      return Object.freeze({
        slot,
        fieldPath: fieldPath(raw["field_path"], `${label}.field_path`),
        valueKind: allowedValue(
          assertNonEmpty(raw["value_kind"], `${label}.value_kind`),
          EXECUTION_CONTEXT_VALUE_KIND_VALUES,
          `${label}.value_kind`
        ),
        required: raw["required"]
      });
    })
  );
}

function protocolSections(
  value: unknown
): readonly InstructionProtocolSectionDeclaration[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError("Rule.config.sections must be a non-empty array");
  }
  const refs = new Set<string>();
  const digests = new Set<string>();
  return Object.freeze(
    value.map((raw, index) => {
      const label = `Rule.config.sections[${String(index)}]`;
      if (!isPlainRecord(raw)) {
        throw new TypeError(`${label} must be an object`);
      }
      assertKnownKeys(
        raw,
        [
          "content",
          "content_digest",
          "policy_refs",
          "required",
          "section_kind_ref",
          "section_ref"
        ],
        label
      );
      const sectionRef = assertNonEmpty(raw["section_ref"], `${label}.section_ref`);
      const sectionKindRef = assertNonEmpty(
        raw["section_kind_ref"],
        `${label}.section_kind_ref`
      );
      const content = assertNonEmpty(raw["content"], `${label}.content`);
      const contentDigest = assertDigest(
        raw["content_digest"],
        `${label}.content_digest`
      );
      if (typeof raw["required"] !== "boolean") {
        throw new TypeError(`${label}.required must be boolean`);
      }
      const policyRefs = freezeUniqueStrings(raw["policy_refs"], `${label}.policy_refs`);
      if (contentDigest !== sha256DigestForText(content)) {
        throw new ExecutionContextCompilationError({
          diagnosticId: "execution-context-protocol-content-digest-mismatch",
          path: `${label}.content_digest`,
          expectedRelation: "sha256 digest over exact declared UTF-8 section text",
          actualRelation: `received ${contentDigest}`,
          evidenceRefs: [sectionRef]
        });
      }
      if (refs.has(sectionRef) || digests.has(contentDigest)) {
        throw new TypeError(`${label} duplicates section or content identity`);
      }
      refs.add(sectionRef);
      digests.add(contentDigest);
      return Object.freeze({
        sectionRef,
        sectionKindRef,
        content,
        contentDigest,
        required: raw["required"],
        policyRefs
      });
    })
  );
}

export function constructExecutionContextProjectionRule(
  input: ExecutionContextProjectionDeclaration
): Rule {
  const projectionRef = assertNonEmpty(input.projectionRef, "projectionRef");
  const declaration = admitExecutionContextProjectionRule(
    Object.freeze({
      name: projectionRef,
      kind: EXECUTION_CONTEXT_PROJECTION_RULE_KIND,
      config: ruleConfig([
        scalarEntry("version", profileVersion(input.version, "version")),
        scalarEntry(
          "source_node_ref",
          assertNonEmpty(input.sourceNodeRef, "sourceNodeRef")
        ),
        jsonEntry(
          "field_rows",
          input.fieldRows.map((row) => ({
            slot: row.slot,
            field_path: row.fieldPath,
            value_kind: row.valueKind,
            required: row.required
          }))
        ),
        stringListEntry("policy_refs", input.policyRefs)
      ]),
      tags: Object.freeze(["gtl:execution-context-projection"])
    })
  );
  return declaration.rule;
}

export function constructInstructionProtocolRule(
  input: InstructionProtocolDeclaration
): Rule {
  const instructionProtocolRef = assertNonEmpty(
    input.instructionProtocolRef,
    "instructionProtocolRef"
  );
  const declaration = admitInstructionProtocolRule(
    Object.freeze({
      name: instructionProtocolRef,
      kind: INSTRUCTION_PROTOCOL_RULE_KIND,
      config: ruleConfig([
        scalarEntry("version", profileVersion(input.version, "version")),
        scalarEntry(
          "instruction_asset_node_ref",
          assertNonEmpty(input.instructionAssetNodeRef, "instructionAssetNodeRef")
        ),
        stringListEntry("allowed_stage_roles", input.allowedStageRoles),
        jsonEntry(
          "sections",
          input.sections.map((section) => ({
            section_ref: section.sectionRef,
            section_kind_ref: section.sectionKindRef,
            content: section.content,
            content_digest: section.contentDigest,
            required: section.required,
            policy_refs: section.policyRefs
          }))
        ),
        stringListEntry("relevance_policy_refs", input.relevancePolicyRefs),
        scalarEntry(
          "compression_policy_ref",
          assertNonEmpty(input.compressionPolicyRef, "compressionPolicyRef")
        ),
        scalarEntry(
          "proportionality_policy_ref",
          assertNonEmpty(input.proportionalityPolicyRef, "proportionalityPolicyRef")
        ),
        stringListEntry(
          "runtime_binding_slot_classes",
          input.runtimeBindingSlotClasses
        ),
        scalarEntry("instruction_work_kind", input.instructionWorkKind),
        stringListEntry("policy_refs", input.policyRefs)
      ]),
      tags: Object.freeze(["gtl:instruction-protocol"])
    })
  );
  return declaration.rule;
}

interface AdmittedExecutionContextProjectionRule {
  readonly rule: Rule;
  readonly declaration: ExecutionContextProjectionDeclaration;
  readonly profileDigest: `sha256:${string}`;
}

interface AdmittedInstructionProtocolRule {
  readonly rule: Rule;
  readonly declaration: InstructionProtocolDeclaration;
  readonly profileDigest: `sha256:${string}`;
}

export function admitExecutionContextProjectionRule(
  rule: Rule
): AdmittedExecutionContextProjectionRule {
  if (rule.kind !== EXECUTION_CONTEXT_PROJECTION_RULE_KIND || rule.name.length === 0) {
    throw new TypeError("execution-context projection Rule kind/name mismatch");
  }
  exactConfigKeys(
    rule.config,
    [
      "version",
      "source_node_ref",
      "field_rows",
      "policy_refs"
    ],
    "ExecutionContextProjectionRule.config"
  );
  const rows = fieldRows(jsonConfig(rule.config, "field_rows"));
  const declaration = Object.freeze({
    projectionRef: rule.name,
    version: profileVersion(
      scalarConfig(rule.config, "version"),
      "ExecutionContextProjectionRule.config.version"
    ),
    sourceNodeRef: scalarConfig(rule.config, "source_node_ref") ?? "",
    fieldRows: rows,
    policyRefs: stringListConfig(rule.config, "policy_refs")
  });
  return Object.freeze({
    rule,
    declaration,
    profileDigest: stableSha256Digest(rule)
  });
}

export function admitInstructionProtocolRule(
  rule: Rule
): AdmittedInstructionProtocolRule {
  if (rule.kind !== INSTRUCTION_PROTOCOL_RULE_KIND || rule.name.length === 0) {
    throw new TypeError("instruction-protocol Rule kind/name mismatch");
  }
  exactConfigKeys(
    rule.config,
    [
      "version",
      "instruction_asset_node_ref",
      "allowed_stage_roles",
      "sections",
      "relevance_policy_refs",
      "compression_policy_ref",
      "proportionality_policy_ref",
      "runtime_binding_slot_classes",
      "instruction_work_kind",
      "policy_refs"
    ],
    "InstructionProtocolRule.config"
  );
  const declaration = Object.freeze({
    instructionProtocolRef: rule.name,
    version: profileVersion(
      scalarConfig(rule.config, "version"),
      "InstructionProtocolRule.config.version"
    ),
    instructionAssetNodeRef:
      scalarConfig(rule.config, "instruction_asset_node_ref") ?? "",
    allowedStageRoles: stringListConfig(rule.config, "allowed_stage_roles"),
    sections: protocolSections(jsonConfig(rule.config, "sections")),
    relevancePolicyRefs: stringListConfig(rule.config, "relevance_policy_refs"),
    compressionPolicyRef:
      scalarConfig(rule.config, "compression_policy_ref") ?? "",
    proportionalityPolicyRef:
      scalarConfig(rule.config, "proportionality_policy_ref") ?? "",
    runtimeBindingSlotClasses: runtimeBindingSlotClasses(
      rule.config,
      "runtime_binding_slot_classes"
    ),
    instructionWorkKind: allowedValue(
      scalarConfig(rule.config, "instruction_work_kind") ?? "",
      ["not_applicable", "target_work", "dependency_disambiguation"] as const,
      "InstructionProtocolRule.config.instruction_work_kind"
    ),
    policyRefs: stringListConfig(rule.config, "policy_refs")
  });
  if (declaration.allowedStageRoles.length === 0) {
    throw new TypeError("instruction protocol must permit at least one stage role");
  }
  return Object.freeze({
    rule,
    declaration,
    profileDigest: stableSha256Digest(rule)
  });
}

export function constructDeclaredCStageInvocationBasis(input: {
  readonly programBindingDigest: `sha256:${string}`;
  readonly stageIndex: number;
  readonly stageRole: string;
  readonly regime: "F_P" | "F_H";
  readonly termDigest: `sha256:${string}`;
  readonly instructionCategoryRefs?: readonly string[] | undefined;
}): DeclaredCStageInvocationBasis {
  const basis = Object.freeze({
    kind: "declared_c_stage_invocation_basis" as const,
    programBindingDigest: assertDigest(
      input.programBindingDigest,
      "DeclaredCStageInvocationBasis.programBindingDigest"
    ),
    stageIndex: input.stageIndex,
    stageRole: assertNonEmpty(input.stageRole, "DeclaredCStageInvocationBasis.stageRole"),
    regime: input.regime,
    termDigest: assertDigest(
      input.termDigest,
      "DeclaredCStageInvocationBasis.termDigest"
    ),
    instructionCategoryRefs: freezeUniqueDeclaredStrings(
      input.instructionCategoryRefs ?? [],
      "DeclaredCStageInvocationBasis.instructionCategoryRefs"
    )
  });
  if (!Number.isInteger(basis.stageIndex) || basis.stageIndex < 0) {
    throw new TypeError("DeclaredCStageInvocationBasis.stageIndex must be a non-negative integer");
  }
  return Object.freeze({ ...basis, basisDigest: stableSha256Digest(basis) });
}

export function declaredExecutionStageRef(input: {
  readonly programBindingDigest: `sha256:${string}`;
  readonly stageIndex: number;
}): string {
  assertDigest(input.programBindingDigest, "programBindingDigest");
  if (!Number.isInteger(input.stageIndex) || input.stageIndex < 0) {
    throw new TypeError("stageIndex must be a non-negative integer");
  }
  return `abg://c-stage/${input.programBindingDigest.slice("sha256:".length)}/${String(input.stageIndex)}`;
}

export function constructAdmittedInvocationCarrier(input: {
  readonly sourceNodeRef: string;
  readonly schemaRef: string;
  readonly carrierRef: string;
  readonly admissionRef: string;
  readonly value: unknown;
}): AdmittedInvocationCarrier {
  const basis = Object.freeze({
    kind: "admitted_invocation_carrier" as const,
    sourceNodeRef: assertNonEmpty(input.sourceNodeRef, "sourceNodeRef"),
    schemaRef: assertNonEmpty(input.schemaRef, "schemaRef"),
    carrierRef: assertNonEmpty(input.carrierRef, "carrierRef"),
    admissionRef: assertNonEmpty(input.admissionRef, "admissionRef"),
    value: input.value
  });
  return Object.freeze({ ...basis, carrierDigest: stableSha256Digest(input.value) });
}

export function constructAdmittedInvocationCarrierSet(
  carriers: readonly AdmittedInvocationCarrier[]
): AdmittedInvocationCarrierSet {
  if (carriers.length === 0) {
    throw new TypeError("AdmittedInvocationCarrierSet.carriers must be non-empty");
  }
  const refs = freezeUniqueDeclaredStrings(
    carriers.map((carrier) => carrier.carrierRef),
    "AdmittedInvocationCarrierSet.carrierRefs"
  );
  const sourceRefs = freezeUniqueDeclaredStrings(
    carriers.map((carrier) => carrier.sourceNodeRef),
    "AdmittedInvocationCarrierSet.sourceNodeRefs"
  );
  if (refs.length !== carriers.length || sourceRefs.length !== carriers.length) {
    throw new TypeError("AdmittedInvocationCarrierSet contains duplicate identity");
  }
  const frozen = Object.freeze([...carriers]);
  return Object.freeze({
    kind: "admitted_invocation_carrier_set" as const,
    carriers: frozen,
    carrierSetDigest: stableSha256Digest(frozen)
  });
}

function repairAffordance(
  diagnosticId: ExecutionContextDiagnosticId
): ExecutionContextRepairAffordance {
  switch (diagnosticId) {
    case "execution-context-source-outcome-invalid":
      return "correct_source_outcome";
    case "execution-context-declaration-source-projection-missing":
      return "restore_replay_projection";
    case "execution-context-declaration-module-unresolved":
    case "execution-context-declaration-module-ambiguous":
    case "execution-context-declaration-module-digest-mismatch":
    case "execution-context-bound-module-declaration-invalid":
      return "admit_declaration_module";
    case "execution-context-carrier-row-invalid":
      return "admit_runtime_carrier";
    case "execution-context-protocol-content-digest-mismatch":
      return "repair_digest";
    case "execution-context-protocol-ref-invalid":
    case "execution-context-protocol-stage-incompatible":
    case "execution-context-instruction-asset-invalid":
      return "correct_protocol";
    case "execution-context-result-contract-incompatible":
      return "correct_result_contract";
    case "execution-context-capability-incompatible":
      return "correct_capability_requirements";
    case "execution-context-instruction-rule-invalid":
    case "execution-context-prompt-plan-rejected":
      return "restore_instruction_compiler_input";
    case "execution-context-prompt-plan-startup-rejected":
      return "restore_startup_admission";
    case "execution-context-instruction-envelope-rejected":
      return "restore_runtime_binding_truth";
    case "execution-context-profile-shape-invalid":
    case "execution-context-profile-wire-vocabulary-invalid":
    case "execution-context-derived-truth-redeclared":
    case "execution-context-field-path-invalid":
    case "execution-context-field-value-invalid":
      return "correct_field_shape";
    case "execution-context-stage-basis-invalid":
    case "execution-context-program-binding-mismatch":
    case "execution-context-projection-source-invalid":
      return "correct_reference";
  }
}

function diagnosticFromError(error: unknown): ExecutionContextDiagnostic {
  if (error instanceof ExecutionContextCompilationError) {
    return Object.freeze({
      kind: "execution_context_diagnostic" as const,
      classification: error.classification,
      diagnosticId: error.diagnosticId,
      path: error.path,
      expectedRelation: error.expectedRelation,
      actualRelation: error.message,
      evidenceRefs: error.evidenceRefs,
      repairAffordance: repairAffordance(error.diagnosticId)
    });
  }
  const actualRelation = error instanceof Error ? error.message : String(error);
  return Object.freeze({
    kind: "execution_context_diagnostic" as const,
    classification: "invalid_program" as const,
    diagnosticId: "execution-context-profile-shape-invalid" as const,
    path: "$",
    expectedRelation: "one closed T-256 execution-context join",
    actualRelation,
    evidenceRefs: Object.freeze([]),
    repairAffordance: "correct_field_shape" as const
  });
}

function invalid(error: unknown): DeclaredExecutionContextJoinInvalid {
  return Object.freeze({
    kind: "declared_execution_context_join_outcome" as const,
    status: "invalid" as const,
    diagnostics: Object.freeze([diagnosticFromError(error)])
  });
}

function sourceProgramBinding(
  outcome: GraphVectorExecutionHandoffPublished | GraphVectorExecutionHandoffCapabilityBlocked
): CompiledGraphVectorCProgramBinding {
  return outcome.status === "published_startup_blocked"
    ? outcome.handoff.programBinding
    : outcome.programBinding;
}

function sourceComposition(
  outcome: GraphVectorExecutionHandoffPublished | GraphVectorExecutionHandoffCapabilityBlocked
) {
  return outcome.status === "published_startup_blocked"
    ? outcome.handoff.compositionSelection
    : outcome.compositionSelection;
}

function exactSourceOutcome(
  outcome: GraphVectorExecutionHandoffOutcome
): GraphVectorExecutionHandoffPublished | GraphVectorExecutionHandoffCapabilityBlocked {
  if (
    outcome.status !== "published_startup_blocked" &&
    outcome.status !== "blocked_capability"
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-source-outcome-invalid",
      path: "$.sourceOutcome.status",
      expectedRelation: "published_startup_blocked or blocked_capability",
      actualRelation: `received ${outcome.status}`,
      evidenceRefs: [outcome.boundary?.graphVectorRef ?? "unresolved-boundary"]
    });
  }
  return outcome;
}

interface ResolvedWorkProgram {
  readonly executionBinding: CatalogExecutionBinding;
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly cProgram: AdmittedCProgramDeclarationNode;
  readonly program: HogProgramDeclaration;
  readonly programBinding: CompiledGraphVectorCProgramBinding;
}

function resolveWorkProgram(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished | GraphVectorExecutionHandoffCapabilityBlocked;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
}): ResolvedWorkProgram {
  const expectedBinding = sourceProgramBinding(input.outcome);
  const bindings = input.catalogBasis.executionBindings.filter(
    (binding) =>
      binding.module.graphFunctions.some(
        (graphFunction) => graphFunction.id === expectedBinding.hostGraphFunctionRef
      )
  );
  if (bindings.length !== 1) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-program-binding-mismatch",
      path: "$.catalogBasis.executionBindings",
      expectedRelation:
        "one exact catalog-bound Module containing the selected work GraphFunction",
      actualRelation: `resolved ${String(bindings.length)} containing bindings`,
      evidenceRefs: [expectedBinding.hostGraphFunctionRef]
    });
  }
  const executionBinding = bindings[0];
  if (executionBinding === undefined) {
    throw new TypeError("execution binding resolution failed");
  }
  if (
    executionBinding.moduleDigest !== stableSha256Digest(executionBinding.module) ||
    executionBinding.graphFunctionDigest !==
      stableSha256Digest(executionBinding.graphFunction)
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-program-binding-mismatch",
      path: "$.catalogBasis.executionBindings[0]",
      expectedRelation: "digest-matching admitted Module and GraphFunction",
      actualRelation: "catalog execution binding identity is stale",
      evidenceRefs: [executionBinding.entryRef]
    });
  }
  const containedGraphFunctions = executionBinding.module.graphFunctions.filter(
    (graphFunction) => graphFunction.id === expectedBinding.hostGraphFunctionRef
  );
  const graphFunction = containedGraphFunctions[0];
  if (containedGraphFunctions.length !== 1 || graphFunction === undefined) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-program-binding-mismatch",
      path: "$.catalogBasis.executionBindings[0].module.graphFunctions",
      expectedRelation: "one exact selected helper GraphFunction in the admitted Module",
      actualRelation: `resolved ${String(containedGraphFunctions.length)} helper GraphFunctions`,
      evidenceRefs: [expectedBinding.hostGraphFunctionRef, executionBinding.entryRef]
    });
  }
  if (graphFunction.template.kind !== "inline_graph") {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-program-binding-mismatch",
      path: "$.catalogBasis.executionBindings[0].graphFunction.template",
      expectedRelation: "inline graph containing the selected GraphVector",
      actualRelation: graphFunction.template.kind,
      evidenceRefs: [graphFunction.id]
    });
  }
  const vectors = graphFunction.template.graph.vectors.filter(
    (vector) => vector.id === expectedBinding.graphVectorRef
  );
  if (vectors.length !== 1) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-program-binding-mismatch",
      path: "$.catalogBasis.executionBindings[0].graphFunction.template.graph.vectors",
      expectedRelation: "one exact selected GraphVector",
      actualRelation: `resolved ${String(vectors.length)} vectors`,
      evidenceRefs: [expectedBinding.graphVectorRef]
    });
  }
  const vector = vectors[0];
  if (vector === undefined) {
    throw new TypeError("selected GraphVector resolution failed");
  }
  const selection = compileGraphVectorCProgramSelection({ graphFunction, graphVector: vector });
  if (
    selection.binding === null ||
    selection.selectedCandidates.length !== 1 ||
    !stableJsonEquals(selection.binding, expectedBinding)
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-program-binding-mismatch",
      path: "$.sourceOutcome.programBinding",
      expectedRelation: "exact replay-bound T-255 program selection",
      actualRelation: selection.diagnostics.map((row) => row.actualRelation).join("; ") ||
        "binding identity differs",
      evidenceRefs: [expectedBinding.bindingDigest, executionBinding.entryRef]
    });
  }
  const selected = selection.selectedCandidates[0];
  const admitted = admitCProgramSyntax(selected?.candidate);
  if (!admitted.accepted || admitted.program === null) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-program-binding-mismatch",
      path: "$.catalogBasis.selectedProgram",
      expectedRelation: "one admitted C program",
      actualRelation: admitted.diagnostics.map((row) => row.message).join("; "),
      evidenceRefs: [expectedBinding.selectedProgramRef]
    });
  }
  const lowered = compileCAlgebraToHog(admitted.program);
  if (!lowered.accepted || lowered.program === null) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-program-binding-mismatch",
      path: "$.catalogBasis.selectedProgram.term",
      expectedRelation: "one flat executable C program",
      actualRelation: lowered.diagnostics.map((row) => row.message).join("; "),
      evidenceRefs: [expectedBinding.selectedProgramRef]
    });
  }
  if (
    input.outcome.status === "published_startup_blocked" &&
    !stableJsonEquals(lowered.program, input.outcome.handoff.normalizedProgram)
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-program-binding-mismatch",
      path: "$.sourceOutcome.handoff.normalizedProgram",
      expectedRelation: "catalog-derived normalized program",
      actualRelation: "published handoff program differs from catalog-bound program",
      evidenceRefs: [input.outcome.handoff.handoffRef]
    });
  }
  return Object.freeze({
    executionBinding,
    graphFunction,
    graphVector: vector,
    cProgram: admitted.program,
    program: lowered.program,
    programBinding: selection.binding
  });
}

function validateStageBasis(input: {
  readonly stageBasis: DeclaredCStageInvocationBasis;
  readonly program: HogProgramDeclaration;
  readonly programBinding: CompiledGraphVectorCProgramBinding;
  readonly outcome: GraphVectorExecutionHandoffPublished | GraphVectorExecutionHandoffCapabilityBlocked;
}): {
  readonly stage: HogProgramStage;
  readonly computeStageRole: InstructionAssemblyComputeStageRole;
} {
  const expectedBasis = Object.freeze({
    kind: input.stageBasis.kind,
    programBindingDigest: input.stageBasis.programBindingDigest,
    stageIndex: input.stageBasis.stageIndex,
    stageRole: input.stageBasis.stageRole,
    regime: input.stageBasis.regime,
    termDigest: input.stageBasis.termDigest,
    instructionCategoryRefs: input.stageBasis.instructionCategoryRefs
  });
  if (
    input.stageBasis.kind !== "declared_c_stage_invocation_basis" ||
    input.stageBasis.basisDigest !== stableSha256Digest(expectedBasis) ||
    input.stageBasis.programBindingDigest !== input.programBinding.bindingDigest ||
    !Number.isInteger(input.stageBasis.stageIndex) ||
    input.stageBasis.stageIndex < 0
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-stage-basis-invalid",
      path: "$.stageBasis",
      expectedRelation: "canonical basis for the exact selected C program",
      actualRelation: "stage basis identity or program binding differs",
      evidenceRefs: [input.programBinding.bindingDigest]
    });
  }
  const stage = input.program.stages[input.stageBasis.stageIndex];
  const categoryRefs = Object.freeze([...(stage?.instructionCategoryRefs ?? [])]);
  const compositionRegimes = sourceComposition(input.outcome).contract.regimes.filter(
    (row) => row.regime === stage?.defaultRegime
  );
  if (
    stage === undefined ||
    stage.stageRole !== input.stageBasis.stageRole ||
    stage.defaultRegime !== input.stageBasis.regime ||
    stableSha256Digest(stage) !== input.stageBasis.termDigest ||
    !stableJsonEquals(categoryRefs, input.stageBasis.instructionCategoryRefs) ||
    compositionRegimes.length !== 1
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-stage-basis-invalid",
      path: "$.stageBasis",
      expectedRelation:
        "exact index, domain role, regime, term digest, categories, and one regime-matched composition binding",
      actualRelation: "declared stage basis does not match selected program and composition",
      evidenceRefs: [input.stageBasis.basisDigest, input.programBinding.bindingDigest]
    });
  }
  const composition = compositionRegimes[0];
  if (composition === undefined) {
    throw new TypeError("composition regime resolution failed");
  }
  return Object.freeze({
    stage,
    computeStageRole: instructionComputeStageRole(composition.stageRole)
  });
}

function declarationClosure(input: {
  readonly executionBinding: CatalogExecutionBinding;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
}): readonly CatalogDeclarationModuleBinding[] {
  if (input.executionBinding.declarationSourceRefs.length === 0) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-declaration-source-projection-missing",
      path: "$.catalogBasis.executionBindings.declarationSourceRefs",
      expectedRelation: "ordered replay-projected declaration source refs",
      actualRelation: "no declaration source refs were projected",
      evidenceRefs: [input.executionBinding.entryRef]
    });
  }
  return Object.freeze(
    input.executionBinding.declarationSourceRefs.map((sourceRef) => {
      const matches = input.catalogBasis.declarationModuleBindings.filter(
        (binding) => binding.moduleRef === sourceRef
      );
      if (matches.length === 0) {
        throw new ExecutionContextCompilationError({
          diagnosticId: "execution-context-declaration-module-unresolved",
          path: "$.catalogBasis.declarationModuleBindings",
          expectedRelation: "one admitted declaration Module for each projected source ref",
          actualRelation: `no binding for ${sourceRef}`,
          evidenceRefs: [input.executionBinding.entryRef, sourceRef]
        });
      }
      if (matches.length !== 1) {
        throw new ExecutionContextCompilationError({
          diagnosticId: "execution-context-declaration-module-ambiguous",
          path: "$.catalogBasis.declarationModuleBindings",
          expectedRelation: "one admitted declaration Module per source ref",
          actualRelation: `resolved ${String(matches.length)} bindings for ${sourceRef}`,
          evidenceRefs: [sourceRef]
        });
      }
      const match = matches[0];
      if (
        match === undefined ||
        match.invocationAuthority !== false ||
        match.moduleDigest !== stableSha256Digest(match.module)
      ) {
        throw new ExecutionContextCompilationError({
          diagnosticId: "execution-context-declaration-module-digest-mismatch",
          path: "$.catalogBasis.declarationModuleBindings",
          expectedRelation: "digest-matching non-invoking declaration Module binding",
          actualRelation: `stale or authority-bearing binding for ${sourceRef}`,
          evidenceRefs: [sourceRef]
        });
      }
      return match;
    })
  );
}

export function catalogExecutionBindingDeclaresExecutionContext(input: {
  readonly executionBinding: CatalogExecutionBinding;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
}): boolean {
  if (input.executionBinding.declarationSourceRefs.length === 0) {
    return false;
  }
  return declarationClosure({
    executionBinding: input.executionBinding,
    catalogBasis: input.catalogBasis
  }).some((binding) =>
    binding.module.rules.some(
      (rule) =>
        rule.kind === EXECUTION_CONTEXT_PROJECTION_RULE_KIND ||
        rule.kind === INSTRUCTION_PROTOCOL_RULE_KIND
    )
  );
}

function boundModuleNodes(module: Module): readonly Node[] {
  const byId = new Map<string, Node>();
  for (const graphFunction of module.graphFunctions) {
    const nodes = [
      ...graphFunction.inputs,
      ...graphFunction.outputs,
      ...(graphFunction.template.kind === "inline_graph"
        ? graphFunction.template.graph.nodes
        : [])
    ];
    for (const node of nodes) {
      const existing = byId.get(node.id);
      if (existing !== undefined && !stableJsonEquals(existing, node)) {
        throw new ExecutionContextCompilationError({
          diagnosticId: "execution-context-bound-module-declaration-invalid",
          path: `$.declarationModule[${JSON.stringify(module.name)}].nodes`,
          expectedRelation: "one exact Node value per local ref",
          actualRelation: `conflicting Node identity ${node.id}`,
          evidenceRefs: [module.name, node.id]
        });
      }
      byId.set(node.id, node);
    }
  }
  return Object.freeze([...byId.values()]);
}

function assertInstructionAssetSurface(surface: AssetSurface, nodeRef: string): void {
  if (
    surface.constructorRefs.length === 0 ||
    surface.rendererRefs.length === 0 ||
    surface.renderedViewDigestPolicyRef === null ||
    surface.sectionKindRefs.length === 0 ||
    surface.outputContractRefs.length === 0 ||
    surface.authoritySlots.length === 0 ||
    surface.proofObligationRefs.length === 0
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-instruction-asset-invalid",
      path: "$.declarationModules.instructionAssetNode.assetSurface",
      expectedRelation: "complete renderer-backed prompt AssetSurface",
      actualRelation: "instruction AssetSurface is incomplete",
      evidenceRefs: [nodeRef]
    });
  }
}

interface CompiledDeclarationProfiles {
  readonly fieldRows: readonly CompiledExecutionContextFieldRow[];
  readonly protocols: readonly CompiledInstructionProtocol[];
  readonly declarationClosureDigest: `sha256:${string}`;
}

function profileAdmissionDiagnosticId(
  error: unknown
): ExecutionContextDiagnosticId {
  const message = error instanceof Error ? error.message : String(error);
  if (
    /(?:source_schema_ref|source_type_ref|applies_to_regime|sourceSchemaRef|sourceTypeRef|appliesToRegime)/u.test(
      message
    )
  ) {
    return "execution-context-derived-truth-redeclared";
  }
  if (
    message.includes(" is unknown") ||
    message.includes("must carry exactly") ||
    message.includes("must occur exactly once")
  ) {
    return "execution-context-profile-wire-vocabulary-invalid";
  }
  return "execution-context-profile-shape-invalid";
}

function compileDeclarationProfiles(input: {
  readonly closure: readonly CatalogDeclarationModuleBinding[];
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly programBinding: CompiledGraphVectorCProgramBinding;
  readonly selectedRegime: "F_P" | "F_H";
  readonly stageRole: string;
  readonly instructionCategoryRefs: readonly string[];
}): CompiledDeclarationProfiles {
  const fieldRows: CompiledExecutionContextFieldRow[] = [];
  const protocols: CompiledInstructionProtocol[] = [];
  const projectionRefs = new Set<string>();
  const protocolRefs = new Set<string>();
  const slotRefs = new Set<string>();
  const selectedInputNodes = selectedSourceNodes({
    graphFunction: input.graphFunction,
    graphVector: input.graphVector,
    programBinding: input.programBinding
  });
  const activeSlots =
    input.selectedRegime === "F_P"
      ? new Set<ExecutionContextSlot>([
          "role_or_worker_selection_ref",
          "configuration_digest",
          "instruction_protocol_ref",
          "result_contract_ref",
          "capability_requirement_refs"
        ])
      : new Set<ExecutionContextSlot>([
          "interaction_subject_ref",
          "instruction_protocol_ref",
          "result_contract_ref",
          "capability_requirement_refs"
        ]);

  for (const binding of input.closure) {
    for (const rule of binding.module.rules) {
      if (rule.kind === EXECUTION_CONTEXT_PROJECTION_RULE_KIND) {
        let admitted: AdmittedExecutionContextProjectionRule;
        try {
          admitted = admitExecutionContextProjectionRule(rule);
        } catch (error: unknown) {
          if (error instanceof ExecutionContextCompilationError) {
            throw error;
          }
          throw new ExecutionContextCompilationError({
            diagnosticId: profileAdmissionDiagnosticId(error),
            path: `$.declarationModules[${JSON.stringify(binding.moduleRef)}].rules`,
            expectedRelation: "one closed execution-context projection profile",
            actualRelation: error instanceof Error ? error.message : String(error),
            evidenceRefs: [binding.moduleRef, rule.name]
          });
        }
        const declaration = admitted.declaration;
        if (projectionRefs.has(declaration.projectionRef)) {
          throw new ExecutionContextCompilationError({
            diagnosticId: "execution-context-profile-shape-invalid",
            path: "$.declarationModules.rules",
            expectedRelation: "unique projection refs across admitted closure",
            actualRelation: `duplicate ${declaration.projectionRef}`,
            evidenceRefs: [binding.moduleRef]
          });
        }
        projectionRefs.add(declaration.projectionRef);
        const sourceNodes = selectedInputNodes.filter(
          (node) => node.id === declaration.sourceNodeRef
        );
        const sourceNode = sourceNodes[0];
        if (sourceNodes.length === 0) {
          continue;
        }
        if (
          sourceNodes.length !== 1 ||
          sourceNode === undefined ||
          !input.programBinding.orderedSourceNodeContractKeys.includes(
            nodeContractKey(sourceNode)
          )
        ) {
          throw new ExecutionContextCompilationError({
            diagnosticId: "execution-context-projection-source-invalid",
            path: `$.projection[${JSON.stringify(declaration.projectionRef)}].sourceNodeRef`,
            expectedRelation: "one exact selected C-program input Node",
            actualRelation: "source Node, schema, type, or ordered interface differs",
            evidenceRefs: [declaration.sourceNodeRef, input.programBinding.bindingDigest]
          });
        }
        for (const row of declaration.fieldRows) {
          if (!activeSlots.has(row.slot)) {
            continue;
          }
          if (!row.required) {
            throw new ExecutionContextCompilationError({
              diagnosticId: "execution-context-profile-shape-invalid",
              path: "$.declarationModules.rules.field_rows.required",
              expectedRelation: "every active execution-context slot is required",
              actualRelation: `slot ${row.slot} is optional`,
              evidenceRefs: [declaration.projectionRef]
            });
          }
          if (slotRefs.has(row.slot)) {
            throw new ExecutionContextCompilationError({
              diagnosticId: "execution-context-profile-shape-invalid",
              path: "$.declarationModules.rules.field_rows",
              expectedRelation: "each execution slot declared exactly once",
              actualRelation: `duplicate slot ${row.slot}`,
              evidenceRefs: [declaration.projectionRef]
            });
          }
          slotRefs.add(row.slot);
          fieldRows.push(
            Object.freeze({
              ...row,
              projectionRef: declaration.projectionRef,
              sourceNodeRef: declaration.sourceNodeRef,
              sourceSchemaRef: sourceNode.schema.ref,
              sourceTypeRef: sourceNode.typeRef
            })
          );
        }
      }

      if (rule.kind === INSTRUCTION_PROTOCOL_RULE_KIND) {
        let admitted: AdmittedInstructionProtocolRule;
        try {
          admitted = admitInstructionProtocolRule(rule);
        } catch (error: unknown) {
          if (error instanceof ExecutionContextCompilationError) {
            throw error;
          }
          throw new ExecutionContextCompilationError({
            diagnosticId: profileAdmissionDiagnosticId(error),
            path: `$.declarationModules[${JSON.stringify(binding.moduleRef)}].rules`,
            expectedRelation: "one closed instruction-protocol profile",
            actualRelation: error instanceof Error ? error.message : String(error),
            evidenceRefs: [binding.moduleRef, rule.name]
          });
        }
        if (protocolRefs.has(admitted.declaration.instructionProtocolRef)) {
          throw new ExecutionContextCompilationError({
            diagnosticId: "execution-context-protocol-ref-invalid",
            path: "$.declarationModules.rules",
            expectedRelation: "unique instruction protocol refs",
            actualRelation: `duplicate ${admitted.declaration.instructionProtocolRef}`,
            evidenceRefs: [binding.moduleRef]
          });
        }
        protocolRefs.add(admitted.declaration.instructionProtocolRef);
        const nodes = boundModuleNodes(binding.module).filter(
          (node) => node.id === admitted.declaration.instructionAssetNodeRef
        );
        const node = nodes[0];
        if (nodes.length !== 1 || node === undefined) {
          throw new ExecutionContextCompilationError({
            diagnosticId: "execution-context-instruction-asset-invalid",
            path: "$.declarationModules.instructionProtocol.instructionAssetNodeRef",
            expectedRelation: "one exact Node in the owning admitted Module",
            actualRelation: `resolved ${String(nodes.length)} Nodes`,
            evidenceRefs: [admitted.declaration.instructionAssetNodeRef, binding.moduleRef]
          });
        }
        assertInstructionAssetSurface(node.assetSurface, node.id);
        const protocolBasis = Object.freeze({
          ...admitted.declaration,
          instructionAssetSurface: node.assetSurface,
          sourceModuleRef: binding.moduleRef,
          sourceModuleDigest: binding.moduleDigest,
          profileDigest: admitted.profileDigest
        });
        protocols.push(
          Object.freeze({
            instructionProtocolRef: admitted.declaration.instructionProtocolRef,
            version: admitted.declaration.version,
            instructionAssetNodeRef: admitted.declaration.instructionAssetNodeRef,
            instructionAssetSurface: node.assetSurface,
            allowedStageRoles: admitted.declaration.allowedStageRoles,
            sections: admitted.declaration.sections,
            relevancePolicyRefs: admitted.declaration.relevancePolicyRefs,
            compressionPolicyRef: admitted.declaration.compressionPolicyRef,
            proportionalityPolicyRef:
              admitted.declaration.proportionalityPolicyRef,
            runtimeBindingSlotClasses:
              admitted.declaration.runtimeBindingSlotClasses,
            instructionWorkKind: admitted.declaration.instructionWorkKind,
            policyRefs: admitted.declaration.policyRefs,
            sourceModuleRef: binding.moduleRef,
            sourceModuleDigest: binding.moduleDigest,
            protocolDigest: stableSha256Digest(protocolBasis)
          })
        );
      }
    }
  }

  const expectedSlots =
    input.selectedRegime === "F_P"
      ? [
          "role_or_worker_selection_ref",
          "configuration_digest",
          "instruction_protocol_ref",
          "result_contract_ref",
          "capability_requirement_refs"
        ]
      : [
          "interaction_subject_ref",
          "instruction_protocol_ref",
          "result_contract_ref",
          "capability_requirement_refs"
        ];
  if (
    fieldRows.length !== expectedSlots.length ||
    expectedSlots.some((slot) => !slotRefs.has(slot))
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-profile-shape-invalid",
      path: "$.declarationModules.rules.field_rows",
      expectedRelation: `exact ${input.selectedRegime} execution slot closure`,
      actualRelation: `received ${[...slotRefs].join(", ")}`,
      evidenceRefs: input.closure.map((binding) => binding.moduleRef)
    });
  }
  for (const categoryRef of input.instructionCategoryRefs) {
    const matches = protocols.flatMap((protocol) =>
      protocol.sections
        .filter((section) => section.sectionRef === categoryRef)
        .map((section) => ({ protocol, section }))
    );
    if (
      matches.length !== 1 ||
      !matches[0]?.protocol.allowedStageRoles.includes(input.stageRole)
    ) {
      throw new ExecutionContextCompilationError({
        diagnosticId: "execution-context-protocol-stage-incompatible",
        path: "$.stageBasis.instructionCategoryRefs",
        expectedRelation: "each category resolves once in a protocol permitting the stage role",
        actualRelation: `${categoryRef} resolved ${String(matches.length)} times or rejected the role`,
        evidenceRefs: [categoryRef, input.stageRole]
      });
    }
  }
  const closureIdentity = Object.freeze(
    input.closure.map((binding) => ({
      moduleRef: binding.moduleRef,
      moduleDigest: binding.moduleDigest,
      sourceEntryRefs: binding.sourceEntryRefs,
      sourceDeclarationRefs: binding.sourceDeclarationRefs,
      sourceEventRefs: binding.sourceEventRefs
    }))
  );
  return Object.freeze({
    fieldRows: Object.freeze(fieldRows),
    protocols: Object.freeze(protocols),
    declarationClosureDigest: stableSha256Digest(closureIdentity)
  });
}

function targetBindingForOutcome(
  outcome: GraphVectorExecutionHandoffPublished | GraphVectorExecutionHandoffCapabilityBlocked
) {
  return outcome.status === "published_startup_blocked"
    ? outcome.handoff.targetCarrierBinding
    : outcome.targetCarrierBinding;
}

function resolveTargetNode(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished | GraphVectorExecutionHandoffCapabilityBlocked;
  readonly graphFunction: GraphFunction;
}): Node {
  const binding = targetBindingForOutcome(input.outcome);
  const declaredCandidates = [
    ...input.graphFunction.outputs,
    ...(input.graphFunction.template.kind === "inline_graph"
      ? input.graphFunction.template.graph.nodes
      : [])
  ].filter((node) => node.id === binding.targetNodeRef);
  const target = declaredCandidates[0];
  if (
    target === undefined ||
    declaredCandidates.some((candidate) => !stableJsonEquals(candidate, target))
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-result-contract-incompatible",
      path: "$.sourceOutcome.targetCarrierBinding.targetNodeRef",
      expectedRelation: "one exact target Node in selected work GraphFunction",
      actualRelation:
        target === undefined
          ? "resolved 0 target Nodes"
          : "resolved conflicting target Node declarations",
      evidenceRefs: [binding.targetNodeRef]
    });
  }
  return target;
}

function targetCompatibilityRefs(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished | GraphVectorExecutionHandoffCapabilityBlocked;
  readonly graphFunction: GraphFunction;
}): readonly string[] {
  const binding = targetBindingForOutcome(input.outcome);
  const target = resolveTargetNode(input);
  return canonicalUniqueStrings([
    ...target.assetSurface.outputContractRefs,
    binding.contractRef,
    binding.envelopeContractRef,
    binding.schemaRef
  ]);
}

function capabilityProjection(
  outcome: GraphVectorExecutionHandoffPublished
): TenantCapabilityCoverageProjection | null {
  return outcome.handoff.capabilityCompatibility.coverageProjection;
}

function compileStaticContract(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished | GraphVectorExecutionHandoffCapabilityBlocked;
  readonly stageBasis: DeclaredCStageInvocationBasis;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
}): {
  readonly contract: CompiledExecutionContextContract;
  readonly work: ResolvedWorkProgram;
} {
  const work = resolveWorkProgram({
    outcome: input.outcome,
    catalogBasis: input.catalogBasis
  });
  const stageSelection = validateStageBasis({
    stageBasis: input.stageBasis,
    program: work.program,
    programBinding: work.programBinding,
    outcome: input.outcome
  });
  const { stage } = stageSelection;
  if (stage.defaultRegime !== "F_P" && stage.defaultRegime !== "F_H") {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-stage-basis-invalid",
      path: "$.stageBasis.regime",
      expectedRelation: "an F_P or F_H stage owned by the declared execution-context join",
      actualRelation: `received ${stage.defaultRegime}`,
      evidenceRefs: [input.stageBasis.basisDigest]
    });
  }
  const closure = declarationClosure({
    executionBinding: work.executionBinding,
    catalogBasis: input.catalogBasis
  });
  const profiles = compileDeclarationProfiles({
    closure,
    graphFunction: work.graphFunction,
    graphVector: work.graphVector,
    programBinding: work.programBinding,
    selectedRegime: stage.defaultRegime,
    stageRole: stage.stageRole,
    instructionCategoryRefs: Object.freeze([...(stage.instructionCategoryRefs ?? [])])
  });
  const targetRefs = targetCompatibilityRefs({
    outcome: input.outcome,
    graphFunction: work.graphFunction
  });
  const targetBinding =
    input.outcome.status === "published_startup_blocked"
      ? input.outcome.handoff.targetCarrierBinding
      : input.outcome.targetCarrierBinding;
  const sourceBasisDigest =
    input.outcome.status === "published_startup_blocked"
      ? input.outcome.handoff.handoffDigest
      : stableSha256Digest(input.outcome);
  const contractBasis = Object.freeze({
    kind: "compiled_execution_context_contract" as const,
    sourceOutcomeStatus: input.outcome.status,
    sourceBasisDigest,
    publishedHandoffRef:
      input.outcome.status === "published_startup_blocked"
        ? input.outcome.handoff.handoffRef
        : null,
    selectedProgramBinding: work.programBinding,
    selectedStage: stage,
    selectedStageIndex: input.stageBasis.stageIndex,
    selectedStageDigest: stableSha256Digest(stage),
    selectedStageRole: stage.stageRole,
    selectedComputeStageRole: stageSelection.computeStageRole,
    selectedRegime: stage.defaultRegime,
    declarationModuleRefs: Object.freeze(closure.map((binding) => binding.moduleRef)),
    declarationClosureDigest: profiles.declarationClosureDigest,
    fieldRows: profiles.fieldRows,
    protocols: profiles.protocols,
    staticProtocolRefs: input.stageBasis.instructionCategoryRefs,
    targetCompatibilityRefs: targetRefs,
    targetBindingDigest: stableSha256Digest(targetBinding),
    capabilityBasisDigest:
      input.outcome.status === "published_startup_blocked"
        ? stableSha256Digest(input.outcome.handoff.capabilityCompatibility)
        : null
  });
  const contractDigest = stableSha256Digest(contractBasis);
  return Object.freeze({
    work,
    contract: Object.freeze({
      ...contractBasis,
      contractRef: `abg://execution-context-contract/${contractDigest.slice("sha256:".length)}`,
      contractDigest
    })
  });
}

function ownFieldPath(value: unknown, path: string): unknown {
  let current: unknown = value;
  for (const segment of path.split(".")) {
    if (!isPlainRecord(current) || !Object.hasOwn(current, segment)) {
      throw new ExecutionContextCompilationError({
        diagnosticId: "execution-context-field-path-invalid",
        path,
        expectedRelation: "declared own-property path on an admitted carrier",
        actualRelation: `segment ${JSON.stringify(segment)} is absent or non-own`,
        classification: "invalid_runtime_binding"
      });
    }
    const descriptor = Object.getOwnPropertyDescriptor(current, segment);
    if (descriptor?.get !== undefined || descriptor?.set !== undefined) {
      throw new ExecutionContextCompilationError({
        diagnosticId: "execution-context-field-path-invalid",
        path,
        expectedRelation: "data properties only",
        actualRelation: `segment ${JSON.stringify(segment)} is an accessor`,
        classification: "invalid_runtime_binding"
      });
    }
    current = descriptor?.value;
  }
  return current;
}

function admittedFieldValue(input: {
  readonly value: unknown;
  readonly row: CompiledExecutionContextFieldRow;
}): string | readonly string[] {
  try {
    if (input.row.valueKind === "ref_list") {
      return freezeUniqueStrings(input.value, input.row.fieldPath);
    }
    const value = assertNonEmpty(input.value, input.row.fieldPath);
    return input.row.valueKind === "digest"
      ? assertDigest(value, input.row.fieldPath)
      : value;
  } catch (error: unknown) {
    if (error instanceof ExecutionContextCompilationError) {
      throw error;
    }
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-field-value-invalid",
      path: input.row.fieldPath,
      expectedRelation: `one exact ${input.row.valueKind} value`,
      actualRelation: error instanceof Error ? error.message : String(error),
      evidenceRefs: [input.row.projectionRef, input.row.sourceNodeRef],
      classification: "invalid_runtime_binding"
    });
  }
}

function bindInvocationValues(input: {
  readonly contract: CompiledExecutionContextContract;
  readonly carriers: AdmittedInvocationCarrierSet;
  readonly sourceNodes: readonly Node[];
}): AdmittedExecutionContextValues {
  if (
    input.carriers.kind !== "admitted_invocation_carrier_set" ||
    input.carriers.carrierSetDigest !== stableSha256Digest(input.carriers.carriers)
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-carrier-row-invalid",
      path: "$.invocationCarriers",
      expectedRelation: "canonical admitted invocation carrier set",
      actualRelation: "carrier-set identity differs",
      classification: "invalid_runtime_binding"
    });
  }
  const values = new Map<ExecutionContextSlot, string | readonly string[]>();
  const orderedCarriers = Object.freeze(
    input.sourceNodes.map((sourceNode) => {
      const matches = input.carriers.carriers.filter(
        (carrier) => carrier.sourceNodeRef === sourceNode.id
      );
      const carrier = matches[0];
      if (
        matches.length !== 1 ||
        carrier === undefined ||
        carrier.kind !== "admitted_invocation_carrier" ||
        carrier.schemaRef !== sourceNode.schema.ref ||
        carrier.carrierDigest !== stableSha256Digest(carrier.value) ||
        carrier.admissionRef.length === 0
      ) {
        throw new ExecutionContextCompilationError({
          diagnosticId: "execution-context-carrier-row-invalid",
          path: "$.invocationCarriers.carriers",
          expectedRelation:
            "one digest-valid admitted carrier for every selected source Node and schema",
          actualRelation: `carrier resolution failed for ${sourceNode.id}`,
          evidenceRefs: [sourceNode.id],
          classification: "invalid_runtime_binding"
        });
      }
      return carrier;
    })
  );
  if (orderedCarriers.length !== input.carriers.carriers.length) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-carrier-row-invalid",
      path: "$.invocationCarriers.carriers",
      expectedRelation: "exact selected source-carrier closure without extra carriers",
      actualRelation: `selected ${String(orderedCarriers.length)} of ${String(input.carriers.carriers.length)} carriers`,
      evidenceRefs: input.sourceNodes.map((node) => node.id),
      classification: "invalid_runtime_binding"
    });
  }
  for (const row of input.contract.fieldRows) {
    const matches = orderedCarriers.filter(
      (carrier) => carrier.sourceNodeRef === row.sourceNodeRef
    );
    const carrier = matches[0];
    if (
      matches.length !== 1 ||
      carrier === undefined ||
      carrier.kind !== "admitted_invocation_carrier" ||
      carrier.schemaRef !== row.sourceSchemaRef ||
      carrier.carrierDigest !== stableSha256Digest(carrier.value) ||
      carrier.admissionRef.length === 0
    ) {
      throw new ExecutionContextCompilationError({
        diagnosticId: "execution-context-carrier-row-invalid",
        path: "$.invocationCarriers.carriers",
        expectedRelation: "one digest-valid admitted carrier for the exact source Node and schema",
        actualRelation: `carrier resolution failed for ${row.sourceNodeRef}`,
        evidenceRefs: [row.projectionRef, row.sourceNodeRef],
        classification: "invalid_runtime_binding"
      });
    }
    const value = admittedFieldValue({
      value: ownFieldPath(carrier.value, row.fieldPath),
      row
    });
    values.set(row.slot, value);
  }
  const stringValue = (slot: ExecutionContextSlot): string | null => {
    const value = values.get(slot);
    if (value === undefined) {
      return null;
    }
    if (typeof value !== "string") {
      throw new ExecutionContextCompilationError({
        diagnosticId: "execution-context-field-value-invalid",
        path: `$.executionContext.${slot}`,
        expectedRelation: "one string value",
        actualRelation: "received a ref list",
        classification: "invalid_runtime_binding"
      });
    }
    return value;
  };
  const refs = values.get("capability_requirement_refs");
  if (!Array.isArray(refs)) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-field-value-invalid",
      path: "$.executionContext.capability_requirement_refs",
      expectedRelation: "one ref list",
      actualRelation: "missing or scalar capability requirements",
      classification: "invalid_runtime_binding"
    });
  }
  const valuesBasis = Object.freeze({
    selectionContractRef: stringValue("role_or_worker_selection_ref"),
    configurationDigest: stringValue("configuration_digest"),
    instructionProtocolRef: stringValue("instruction_protocol_ref"),
    resultContractRef: stringValue("result_contract_ref"),
    capabilityRequirementRefs: Object.freeze([...refs]),
    interactionSubjectRef: stringValue("interaction_subject_ref"),
    sourceCarrierRefs: Object.freeze(orderedCarriers.map((carrier) => carrier.carrierRef)),
    sourceCarrierDigests: Object.freeze(
      orderedCarriers.map((carrier) => carrier.carrierDigest)
    )
  });
  if (
    valuesBasis.instructionProtocolRef === null ||
    valuesBasis.resultContractRef === null ||
    (input.contract.selectedRegime === "F_P" &&
      (valuesBasis.selectionContractRef === null ||
        valuesBasis.configurationDigest === null)) ||
    (input.contract.selectedRegime === "F_H" &&
      valuesBasis.interactionSubjectRef === null)
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-field-value-invalid",
      path: "$.executionContext",
      expectedRelation: `complete ${input.contract.selectedRegime} execution values`,
      actualRelation: "one or more required values are absent",
      classification: "invalid_runtime_binding"
    });
  }
  return Object.freeze({
    kind: "admitted_execution_context_values" as const,
    ...valuesBasis,
    instructionProtocolRef: valuesBasis.instructionProtocolRef,
    resultContractRef: valuesBasis.resultContractRef,
    configurationDigest:
      valuesBasis.configurationDigest === null
        ? null
        : assertDigest(valuesBasis.configurationDigest, "configurationDigest"),
    valuesDigest: stableSha256Digest(valuesBasis)
  });
}

function coveredCapabilities(
  projection: TenantCapabilityCoverageProjection | null
): ReadonlySet<string> {
  return new Set(
    projection?.coverageRows
      .filter((row) => row.supportedDisposition === "supported")
      .map((row) => row.capabilityId) ?? []
  );
}

interface ResolvedRequestBasis {
  readonly protocol: CompiledInstructionProtocol;
  readonly protocolClosureDigest: `sha256:${string}`;
  readonly capabilityBasisDigest: `sha256:${string}`;
}

function resolveRequestBasis(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished;
  readonly contract: CompiledExecutionContextContract;
  readonly values: AdmittedExecutionContextValues;
}): ResolvedRequestBasis {
  const protocolMatches = input.contract.protocols.filter(
    (protocol) => protocol.instructionProtocolRef === input.values.instructionProtocolRef
  );
  const protocol = protocolMatches[0];
  if (protocolMatches.length !== 1 || protocol === undefined) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-protocol-ref-invalid",
      path: "$.executionContext.instructionProtocolRef",
      expectedRelation: "one exact compiled instruction protocol",
      actualRelation: `resolved ${String(protocolMatches.length)} protocols`,
      evidenceRefs: [input.values.instructionProtocolRef]
    });
  }
  if (!protocol.allowedStageRoles.includes(input.contract.selectedStageRole)) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-protocol-stage-incompatible",
      path: "$.executionContext.instructionProtocolRef",
      expectedRelation: "protocol permits selected C-stage role",
      actualRelation: `${protocol.instructionProtocolRef} rejects ${input.contract.selectedStageRole}`,
      evidenceRefs: [protocol.protocolDigest]
    });
  }
  for (const categoryRef of input.contract.staticProtocolRefs) {
    if (!protocol.sections.some((section) => section.sectionRef === categoryRef)) {
      throw new ExecutionContextCompilationError({
        diagnosticId: "execution-context-protocol-ref-invalid",
        path: "$.executionContext.instructionProtocolRef",
        expectedRelation: "runtime protocol owns every statically selected section",
        actualRelation: `${categoryRef} belongs to another or no protocol`,
        evidenceRefs: [protocol.instructionProtocolRef]
      });
    }
  }
  if (!input.contract.targetCompatibilityRefs.includes(input.values.resultContractRef)) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-result-contract-incompatible",
      path: "$.executionContext.resultContractRef",
      expectedRelation: "T-255 target-compatible result contract",
      actualRelation: input.values.resultContractRef,
      evidenceRefs: input.contract.targetCompatibilityRefs
    });
  }
  const coverage = capabilityProjection(input.outcome);
  const supported = coveredCapabilities(coverage);
  const unsupported = input.values.capabilityRequirementRefs.filter(
    (ref) => !supported.has(ref)
  );
  if (unsupported.length > 0) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-capability-incompatible",
      path: "$.executionContext.capabilityRequirementRefs",
      expectedRelation: "requirements covered by exact T-255 admitted manifest basis",
      actualRelation: `unsupported ${unsupported.join(", ")}`,
      evidenceRefs: [
        input.outcome.handoff.handoffRef,
        ...(coverage === null ? [] : [coverage.projectionDigest])
      ],
      classification: "semantic_not_realized"
    });
  }
  const capabilityBasisDigest = stableSha256Digest(
    input.outcome.handoff.capabilityCompatibility
  );
  if (input.contract.capabilityBasisDigest !== capabilityBasisDigest) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-capability-incompatible",
      path: "$.compiledContract.capabilityBasisDigest",
      expectedRelation: "exact T-255 capability basis",
      actualRelation: "compiled capability identity differs",
      evidenceRefs: [input.outcome.handoff.handoffRef]
    });
  }
  const protocolClosureDigest = stableSha256Digest({
    protocolDigest: protocol.protocolDigest,
    selectedSectionRefs: input.contract.staticProtocolRefs
  });
  return Object.freeze({
    protocol,
    protocolClosureDigest,
    capabilityBasisDigest
  });
}

function canonicalUniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)].sort());
}

function instructionComputeStageRole(
  role: string
): InstructionAssemblyComputeStageRole {
  return allowedValue(
    role,
    ["transform", "evaluate", "consequence", "human_callout"] as const,
    "selected C stage role"
  );
}

function selectedSourceNodes(input: {
  readonly graphFunction: GraphFunction;
  readonly graphVector: GraphVector;
  readonly programBinding: CompiledGraphVectorCProgramBinding;
}): readonly Node[] {
  const containingVectors =
    input.graphFunction.template.kind === "inline_graph"
      ? input.graphFunction.template.graph.vectors.filter(
          (vector) => vector.id === input.graphVector.id
        )
      : [];
  const nodes = input.graphVector.source;
  const actualContractKeys = nodes.map((node) => nodeContractKey(node));
  if (
    input.graphVector.id !== input.programBinding.graphVectorRef ||
    containingVectors.length !== 1 ||
    !stableJsonEquals(
      actualContractKeys,
      input.programBinding.orderedSourceNodeContractKeys
    )
  ) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-instruction-rule-invalid",
      path: "$.instructionAssembly.sourceNodeRefs",
      expectedRelation:
        "exact contained GraphVector and ordered selected C-program source Node closure",
      actualRelation: `resolved ordered contract keys ${JSON.stringify(actualContractKeys)}`,
      evidenceRefs: [input.programBinding.bindingDigest]
    });
  }
  return Object.freeze(nodes);
}

function instructionProportionalityClass(
  program: AdmittedCProgramDeclarationNode
): InstructionProportionalityClass {
  const value = program.proportionalityClass;
  if (value !== "P0" && value !== "P1" && value !== "P2" && value !== "P3") {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-instruction-rule-invalid",
      path: "$.selectedProgram.proportionalityClass",
      expectedRelation: "one declared P0, P1, P2, or P3 proportionality class",
      actualRelation: value === null ? "proportionality is absent" : `received ${value}`,
      evidenceRefs: [program.programRef]
    });
  }
  return value;
}

function derivedRuntimeFacts(input: {
  readonly slotClass: RuntimeBindingSlotClass;
  readonly sourceNodes: readonly Node[];
  readonly targetNode: Node;
  readonly work: ResolvedWorkProgram;
  readonly carriers: readonly AdmittedInvocationCarrier[];
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly protocol: CompiledInstructionProtocol;
}): readonly RuntimeBindingFact[] {
  const sourceEventRefs = canonicalUniqueStrings([
    ...input.catalogBasis.admissionEventRefs,
    ...input.carriers.map((carrier) => carrier.admissionRef)
  ]);
  switch (input.slotClass) {
    case "source_node":
      return Object.freeze(
        input.sourceNodes.map((node) => {
          const carrier = input.carriers.find(
            (candidate) => candidate.sourceNodeRef === node.id
          );
          if (carrier === undefined) {
            throw new ExecutionContextCompilationError({
              diagnosticId: "execution-context-carrier-row-invalid",
              path: "$.invocationCarriers",
              expectedRelation: "one admitted carrier for each selected source Node",
              actualRelation: `carrier is absent for ${node.id}`,
              evidenceRefs: [node.id]
            });
          }
          return Object.freeze({
            kind: "runtime_binding_fact" as const,
            slotClass: "source_node" as const,
            ref: node.id,
            digest: stableSha256Digest(node),
            sourceEventRefs: Object.freeze([carrier.admissionRef]),
            admitted: true,
            payloadDigest: carrier.carrierDigest
          });
        })
      );
    case "selected_graph_function":
      return Object.freeze([
        Object.freeze({
          kind: "runtime_binding_fact" as const,
          slotClass: input.slotClass,
          ref: input.work.graphFunction.id,
          digest: stableSha256Digest(input.work.graphFunction),
          sourceEventRefs,
          admitted: true
        })
      ]);
    case "vector":
      return Object.freeze([
        Object.freeze({
          kind: "runtime_binding_fact" as const,
          slotClass: input.slotClass,
          ref: input.work.graphVector.id,
          digest: stableSha256Digest(input.work.graphVector),
          sourceEventRefs,
          admitted: true
        })
      ]);
    case "target_node":
      return Object.freeze([
        Object.freeze({
          kind: "runtime_binding_fact" as const,
          slotClass: input.slotClass,
          ref: input.targetNode.id,
          digest: stableSha256Digest(input.targetNode),
          sourceEventRefs,
          admitted: true
        })
      ]);
    case "input_asset":
    case "payload":
      return Object.freeze(
        input.carriers.map((carrier) =>
          Object.freeze({
            kind: "runtime_binding_fact" as const,
            slotClass: input.slotClass,
            ref: carrier.carrierRef,
            digest: carrier.carrierDigest,
            sourceEventRefs: Object.freeze([carrier.admissionRef]),
            admitted: true,
            payloadDigest: carrier.carrierDigest
          })
        )
      );
    case "policy":
      return Object.freeze([
        Object.freeze({
          kind: "runtime_binding_fact" as const,
          slotClass: input.slotClass,
          ref: input.protocol.instructionProtocolRef,
          digest: input.protocol.protocolDigest,
          sourceEventRefs,
          admitted: true
        })
      ]);
    default:
      throw new ExecutionContextCompilationError({
        diagnosticId: "execution-context-instruction-rule-invalid",
        path: "$.instructionProtocol.runtimeBindingSlotClasses",
        expectedRelation:
          "a slot class derivable from selected graph, vector, Node, carrier, or protocol truth",
        actualRelation: `no T-256 derivation exists for ${input.slotClass}`,
        evidenceRefs: [input.protocol.instructionProtocolRef]
      });
  }
}

function deriveInstructionAssemblyRuntimeBasis(input: {
  readonly work: ResolvedWorkProgram;
  readonly sourceNodes: readonly Node[];
  readonly targetNode: Node;
  readonly protocol: CompiledInstructionProtocol;
  readonly values: AdmittedExecutionContextValues;
  readonly invocationCarriers: AdmittedInvocationCarrierSet;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly stageRef: string;
}): DerivedInstructionAssemblyRuntimeBasis {
  const carriers = Object.freeze(
    input.values.sourceCarrierRefs.map((carrierRef) => {
      const matches = input.invocationCarriers.carriers.filter(
        (carrier) => carrier.carrierRef === carrierRef
      );
      const carrier = matches[0];
      if (matches.length !== 1 || carrier === undefined) {
        throw new ExecutionContextCompilationError({
          diagnosticId: "execution-context-carrier-row-invalid",
          path: "$.invocationCarriers",
          expectedRelation: "one exact carrier retained by admitted context values",
          actualRelation: `${carrierRef} resolved ${String(matches.length)} times`,
          evidenceRefs: [input.values.valuesDigest]
        });
      }
      return carrier;
    })
  );
  const sourceNodeRefs = Object.freeze(input.sourceNodes.map((node) => node.id));
  const carrierRefs = Object.freeze(carriers.map((carrier) => carrier.carrierRef));
  const relevanceRules = Object.freeze(
    input.protocol.relevancePolicyRefs.map((ruleRef) =>
      Object.freeze({
        ruleRef,
        requiredInputRefs: sourceNodeRefs,
        allowFutureStageRefs: Object.freeze([])
      })
    )
  );
  const sectionDecisions = Object.freeze(
    input.protocol.sections.map((section) =>
      constructInstructionSectionDecision({
        sectionRef: section.sectionRef,
        disposition: "include",
        dependencyRefs: sourceNodeRefs,
        carrierRefs,
        compressionMode: "full",
        text: section.content,
        digestRef: section.contentDigest,
        excerptDigest: null,
        fullContentAdmitted: true,
        stageRef: input.stageRef,
        gapRefs: []
      })
    )
  );
  const bindingSlots = Object.freeze(
    input.protocol.runtimeBindingSlotClasses.map((slotClass) =>
      constructRuntimeBindingSlot({
        slotRef: `abg://instruction-slot/${input.stageRef.slice("abg://c-stage/".length)}/${slotClass}`,
        slotClass,
        required: true,
        sourceTruthKind: "admitted_ref",
        evidenceRefs: canonicalUniqueStrings([
          input.values.valuesDigest,
          ...carriers.map((carrier) => carrier.admissionRef)
        ])
      })
    )
  );
  const runtimeFacts = Object.freeze(
    input.protocol.runtimeBindingSlotClasses.flatMap((slotClass) =>
      derivedRuntimeFacts({
        slotClass,
        sourceNodes: input.sourceNodes,
        targetNode: input.targetNode,
        work: input.work,
        carriers,
        catalogBasis: input.catalogBasis,
        protocol: input.protocol
      })
    )
  );
  const basis = Object.freeze({
    kind: "derived_instruction_assembly_runtime_basis" as const,
    relevanceRules,
    sectionDecisions,
    bindingSlots,
    runtimeFacts,
    availableInputRefs: sourceNodeRefs,
    proportionalityClass: instructionProportionalityClass(input.work.cProgram),
    expectedAnswerMarkers: Object.freeze([]),
    instructionWorkKind: input.protocol.instructionWorkKind,
    dependencyInstructionTruth: null,
    proofDepthInstructionTruth: null,
    fpValidationEvidenceRefs: Object.freeze([]),
    compilerEvidenceRefs: canonicalUniqueStrings([
      input.work.executionBinding.entryRef,
      input.protocol.instructionProtocolRef,
      input.values.valuesDigest,
      ...carriers.map((carrier) => carrier.admissionRef)
    ])
  });
  return Object.freeze({ ...basis, basisDigest: stableSha256Digest(basis) });
}

function derivedInstructionTruth(input: {
  readonly sourceNodes: readonly Node[];
  readonly targetNode: Node;
  readonly protocol: CompiledInstructionProtocol;
  readonly basis: DerivedInstructionAssemblyRuntimeBasis;
}): DerivedInstructionCarrierTruth {
  return Object.freeze({
    kind: "derived_instruction_carrier_truth" as const,
    sourceTypeRefs: canonicalUniqueStrings(
      input.sourceNodes.map((node) => node.typeRef ?? node.schema.ref)
    ),
    targetTypeRefs: Object.freeze([
      input.targetNode.typeRef ?? input.targetNode.schema.ref
    ]),
    outputContractRefs: canonicalUniqueStrings(
      input.targetNode.assetSurface.outputContractRefs
    ),
    proofRefs: canonicalUniqueStrings([
      ...input.targetNode.assetSurface.proofObligationRefs,
      ...input.protocol.instructionAssetSurface.proofObligationRefs
    ]),
    authorityRefs: canonicalUniqueStrings([
      ...input.targetNode.assetSurface.authoritySlots.map(
        (slot) => slot.authorityKindRef
      ),
      ...input.protocol.instructionAssetSurface.authoritySlots.map(
        (slot) => slot.authorityKindRef
      )
    ]),
    rendererRefs: canonicalUniqueStrings([
      ...input.targetNode.assetSurface.rendererRefs,
      ...input.protocol.instructionAssetSurface.rendererRefs
    ]),
    activeRegime: "F_P" as const,
    carrierClassRefs: canonicalUniqueStrings(
      input.basis.bindingSlots.map((slot) => slot.slotClass)
    )
  });
}

function compileCanonicalFpInstructionAssembly(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished;
  readonly contract: CompiledExecutionContextContract;
  readonly values: AdmittedExecutionContextValues;
  readonly work: ResolvedWorkProgram;
  readonly catalogBasis: AdmittedRuntimeCatalogBasis;
  readonly resolved: ResolvedRequestBasis;
  readonly invocationCarriers: AdmittedInvocationCarrierSet;
}): CanonicalFpInstructionAssembly {
  const sourceNodes = selectedSourceNodes({
    graphFunction: input.work.graphFunction,
    graphVector: input.work.graphVector,
    programBinding: input.work.programBinding
  });
  const targetNode = resolveTargetNode({
    outcome: input.outcome,
    graphFunction: input.work.graphFunction
  });
  const stageRef = declaredExecutionStageRef({
    programBindingDigest: input.work.programBinding.bindingDigest,
    stageIndex: input.contract.selectedStageIndex
  });
  const runtimeBasis = deriveInstructionAssemblyRuntimeBasis({
    work: input.work,
    sourceNodes,
    targetNode,
    protocol: input.resolved.protocol,
    values: input.values,
    invocationCarriers: input.invocationCarriers,
    catalogBasis: input.catalogBasis,
    stageRef
  });
  let rule;
  try {
    rule = constructInstructionAssemblyRule({
      ruleRef: input.resolved.protocol.instructionProtocolRef,
      appliesToGraphFunctionRefs: Object.freeze([input.work.graphFunction.id]),
      appliesToVectorRefs: Object.freeze([
        input.work.programBinding.graphVectorRef
      ]),
      sectionRules: Object.freeze(
        input.resolved.protocol.sections.map((section) => ({
          sectionRef: section.sectionRef,
          required: section.required,
          policyRefs: section.policyRefs
        }))
      ),
      relevanceRules: runtimeBasis.relevanceRules,
      compressionPolicyRef: input.resolved.protocol.compressionPolicyRef,
      proportionalityPolicyRef: input.resolved.protocol.proportionalityPolicyRef,
      runtimeBindingSlotClasses:
        input.resolved.protocol.runtimeBindingSlotClasses,
      policyRefs: input.resolved.protocol.policyRefs,
      evidenceRefs: canonicalUniqueStrings([
        input.contract.contractRef,
        input.values.valuesDigest,
        runtimeBasis.basisDigest
      ])
    });
  } catch (error: unknown) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-instruction-rule-invalid",
      path: "$.instructionAssembly.rule",
      expectedRelation: "one canonical T-183 InstructionAssemblyRule",
      actualRelation: error instanceof Error ? error.message : String(error),
      evidenceRefs: [input.resolved.protocol.instructionProtocolRef]
    });
  }
  const declarationEntryRefs = input.catalogBasis.declarationModuleBindings
    .filter((binding) => input.contract.declarationModuleRefs.includes(binding.moduleRef))
    .flatMap((binding) => binding.sourceEntryRefs);
  const registryEntryRefs = canonicalUniqueStrings([
    input.work.executionBinding.entryRef,
    ...declarationEntryRefs
  ]);
  const planBasis = Object.freeze({
    contextContractDigest: input.contract.contractDigest,
    executionContextValuesDigest: input.values.valuesDigest,
    protocolDigest: input.resolved.protocol.protocolDigest,
    stageDigest: input.contract.selectedStageDigest,
    runtimeBasisDigest: runtimeBasis.basisDigest
  });
  const planDigestBasis = stableSha256Digest(planBasis);
  const compileResult = compileInstructionAssemblyPlan({
    planRef: `abg://compiled-prompt-plan/${planDigestBasis.slice("sha256:".length)}`,
    rule,
    computeStageRole: input.contract.selectedComputeStageRole,
    graphFunctionRef: input.work.graphFunction.id,
    vectorRef: input.work.programBinding.graphVectorRef,
    registryEntryRefs,
    sourceNodeRefs: Object.freeze(sourceNodes.map((node) => node.id)),
    targetNodeRef: targetNode.id,
    derivedTruth: derivedInstructionTruth({
      sourceNodes,
      targetNode,
      protocol: input.resolved.protocol,
      basis: runtimeBasis
    }),
    knownAlgebraRefs: INSTRUCTION_ASSEMBLY_KNOWN_ALGEBRAS,
    requiredInputRefs: canonicalUniqueStrings(
      runtimeBasis.relevanceRules.flatMap((row) => row.requiredInputRefs)
    ),
    availableInputRefs: runtimeBasis.availableInputRefs,
    sectionDecisions: runtimeBasis.sectionDecisions,
    bindingSlots: runtimeBasis.bindingSlots,
    proportionalityClass: runtimeBasis.proportionalityClass,
    expectedAnswerMarkers: runtimeBasis.expectedAnswerMarkers,
    instructionWorkKind: runtimeBasis.instructionWorkKind,
    dependencyInstructionTruth: runtimeBasis.dependencyInstructionTruth,
    proofDepthInstructionTruth: runtimeBasis.proofDepthInstructionTruth,
    fpValidationEvidenceRefs: runtimeBasis.fpValidationEvidenceRefs,
    compilerEvidenceRefs: canonicalUniqueStrings([
      ...runtimeBasis.compilerEvidenceRefs,
      input.contract.contractRef,
      input.values.valuesDigest,
      runtimeBasis.basisDigest
    ])
  });
  if (!compileResult.accepted || compileResult.plan === null) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-prompt-plan-rejected",
      path: "$.instructionAssembly.plan",
      expectedRelation: "accepted canonical T-183 CompiledPromptPlan",
      actualRelation: compileResult.issues.map((issue) => issue.message).join("; "),
      evidenceRefs: compileResult.issues.flatMap((issue) => issue.evidenceRefs)
    });
  }
  const startupAdmission = admitCompiledPromptPlanAtStartup({
    plan: compileResult.plan,
    registryEntryRefs: input.catalogBasis.projection.runtimeRegistryProjection.entries.map(
      (entry) => entry.entryRef
    ),
    startupEventRefs: input.catalogBasis.admissionEventRefs
  });
  if (!startupAdmission.admitted) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-prompt-plan-startup-rejected",
      path: "$.instructionAssembly.startupAdmission",
      expectedRelation: "admitted canonical T-183 prompt plan startup basis",
      actualRelation: startupAdmission.issues.map((issue) => issue.message).join("; "),
      evidenceRefs: startupAdmission.issues.flatMap((issue) => issue.evidenceRefs)
    });
  }
  const envelopeResult = bindInstructionEnvelope({
    envelopeRef: `abg://instruction-envelope/${planDigestBasis.slice("sha256:".length)}`,
    plan: compileResult.plan,
    startupAdmission,
    runtimeFacts: runtimeBasis.runtimeFacts
  });
  if (!envelopeResult.accepted || envelopeResult.envelope === null) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-instruction-envelope-rejected",
      path: "$.instructionAssembly.envelope",
      expectedRelation: "one runtime-bound canonical T-183 InstructionEnvelope",
      actualRelation: envelopeResult.issues.map((issue) => issue.message).join("; "),
      evidenceRefs: envelopeResult.issues.flatMap((issue) => issue.evidenceRefs),
      classification: "invalid_runtime_binding"
    });
  }
  return Object.freeze({
    kind: "canonical_fp_instruction_assembly" as const,
    plan: compileResult.plan,
    startupAdmission,
    startupAdmissionBasisDigest: stableSha256Digest(startupAdmission),
    envelope: envelopeResult.envelope
  });
}

function commonRequestBasis(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished;
  readonly contract: CompiledExecutionContextContract;
}) {
  return Object.freeze({
    kind: "declared_execution_request" as const,
    handoffRef: input.outcome.handoff.handoffRef,
    stageRole: input.contract.selectedStageRole,
    stageTermDigest: input.contract.selectedStageDigest,
    contextContractRef: input.contract.contractRef,
    contextContractDigest: input.contract.contractDigest,
    startupBlock: input.outcome.handoff.startupBlock,
    startupBlockDigest: input.outcome.handoff.startupBlock.blockDigest
  });
}

function finalizeRequest<T extends Readonly<Record<string, unknown>>>(
  variant: T
): T & {
  readonly requestRef: string;
  readonly requestDigest: `sha256:${string}`;
} {
  const requestDigest = stableSha256Digest(variant);
  return Object.freeze({
    ...variant,
    requestRef: `abg://declared-execution-request/${requestDigest.slice("sha256:".length)}`,
    requestDigest
  });
}

function constructFhRequest(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished;
  readonly contract: CompiledExecutionContextContract;
  readonly values: AdmittedExecutionContextValues;
  readonly resolved: ResolvedRequestBasis;
}): DeclaredFhInteractionRequest {
  if (input.values.interactionSubjectRef === null) {
    throw new ExecutionContextCompilationError({
      diagnosticId: "execution-context-field-value-invalid",
      path: "$.executionContext",
      expectedRelation: "complete F_H interaction request basis",
      actualRelation: "interaction subject is missing",
      classification: "invalid_runtime_binding"
    });
  }
  return finalizeRequest({
    ...commonRequestBasis(input),
    regime: "F_H" as const,
    interactionSubjectRef: input.values.interactionSubjectRef,
    declarationClosureDigest: input.contract.declarationClosureDigest,
    instructionProtocol: input.resolved.protocol,
    selectedProtocolSectionRefs: input.contract.staticProtocolRefs,
    protocolClosureDigest: input.resolved.protocolClosureDigest,
    resultContractRef: input.values.resultContractRef,
    targetBindingDigest: input.contract.targetBindingDigest,
    capabilityRefs: input.values.capabilityRequirementRefs,
    capabilityBasisDigest: input.resolved.capabilityBasisDigest,
    sourceCarrierRefs: input.values.sourceCarrierRefs,
    sourceCarrierDigests: input.values.sourceCarrierDigests
  });
}

function constructFpRequest(input: {
  readonly outcome: GraphVectorExecutionHandoffPublished;
  readonly contract: CompiledExecutionContextContract;
  readonly assembly: CanonicalFpInstructionAssembly;
}): DeclaredFpExecutionRequest {
  return finalizeRequest({
    ...commonRequestBasis(input),
    regime: "F_P" as const,
    planRef: input.assembly.plan.planRef,
    planDigest: assertDigest(input.assembly.plan.planDigest, "CompiledPromptPlan.planDigest"),
    startupAdmissionBasisDigest: input.assembly.startupAdmissionBasisDigest,
    envelopeRef: input.assembly.envelope.envelopeRef,
    envelopeDigest: assertDigest(
      input.assembly.envelope.envelopeDigest,
      "InstructionEnvelope.envelopeDigest"
    )
  });
}

export function joinDeclaredExecutionContext(
  input: JoinDeclaredExecutionContextInput
): DeclaredExecutionContextJoinOutcome {
  try {
    if (Object.prototype.hasOwnProperty.call(input, "instructionAssemblyBasis")) {
      throw new ExecutionContextCompilationError({
        diagnosticId: "execution-context-instruction-rule-invalid",
        path: "$.instructionAssemblyBasis",
        expectedRelation:
          "instruction assembly truth derived inside the canonical T-183 adapter",
        actualRelation: "caller-authored instruction assembly truth was supplied",
        evidenceRefs: []
      });
    }
    const outcome = exactSourceOutcome(input.sourceOutcome);
    const compiled = compileStaticContract({
      outcome,
      stageBasis: input.stageBasis,
      catalogBasis: input.catalogBasis
    });
    if (outcome.status === "blocked_capability") {
      return Object.freeze({
        kind: "declared_execution_context_join_outcome" as const,
        status: "blocked_capability" as const,
        compiledContract: compiled.contract,
        sourceCapabilityOutcome: outcome,
        diagnostics: Object.freeze([
          Object.freeze({
            kind: "execution_context_diagnostic" as const,
            classification: "semantic_not_realized" as const,
            diagnosticId: "execution-context-capability-incompatible" as const,
            path: "$.sourceOutcome",
            expectedRelation: "T-268 admitted tenant capability coverage",
            actualRelation: "exact T-255 capability block preserved; no request constructed",
            evidenceRefs: Object.freeze([
              outcome.programBinding.bindingDigest,
              ...outcome.diagnostics.flatMap((row) => row.evidenceRefs)
            ]),
            repairAffordance: "repair_tenant_capability_coverage" as const
          })
        ])
      });
    }
    const values = bindInvocationValues({
      contract: compiled.contract,
      carriers: input.invocationCarriers,
      sourceNodes: selectedSourceNodes({
        graphFunction: compiled.work.graphFunction,
        graphVector: compiled.work.graphVector,
        programBinding: compiled.work.programBinding
      })
    });
    const resolved = resolveRequestBasis({
      outcome,
      contract: compiled.contract,
      values
    });
    let request: DeclaredExecutionRequest;
    let instructionAssembly: CanonicalFpInstructionAssembly | null;
    if (compiled.contract.selectedRegime === "F_P") {
      instructionAssembly = compileCanonicalFpInstructionAssembly({
        outcome,
        contract: compiled.contract,
        values,
        work: compiled.work,
        catalogBasis: input.catalogBasis,
        resolved,
        invocationCarriers: input.invocationCarriers
      });
      request = constructFpRequest({
        outcome,
        contract: compiled.contract,
        assembly: instructionAssembly
      });
    } else {
      instructionAssembly = null;
      request = constructFhRequest({
        outcome,
        contract: compiled.contract,
        values,
        resolved
      });
    }
    return Object.freeze({
      kind: "declared_execution_context_join_outcome" as const,
      status: "request_constructed" as const,
      compiledContract: compiled.contract,
      values,
      request,
      instructionAssembly,
      diagnostics: Object.freeze([])
    });
  } catch (error: unknown) {
    return invalid(error);
  }
}
