// Implements: REQ-R-ABG3-INTERPRET
// Implements: REQ-R-ABG3-RUN
// Implements: REQ-R-ABG3-EVENTS

import type {
  ActorInvocationRef,
  ExecutionBasis,
  FdAuthoritySeverityClass,
  FdPressureRoutingDecision,
  PayloadAmbiguityStatus,
  PayloadClosureDecisionKind,
  PluginTraversalKind,
  RuntimeAggregateProjection,
  RuntimeEvent,
  RuntimeRegime
} from "./carriers.js";
import {
  FD_AUTHORITY_SEVERITY_CLASS_VALUES,
  FD_PRESSURE_ROUTING_DECISION_VALUES,
  PAYLOAD_AMBIGUITY_STATUS_VALUES,
  PAYLOAD_CLOSURE_DECISION_KIND_VALUES
} from "./carriers.js";
import type { FpTransformRequest } from "./fp_stages.js";
import { constructFpTransformRequest } from "./fp_stages.js";
import type {
  AbgFallbackBundle,
  PluginTraversalObserverBindingSelection
} from "./plugin_traversal_observer.js";
import {
  tryResolvePluginTraversalObserverBinding
} from "./plugin_traversal_observer.js";
import type {
  TraversalAttemptEnvelope,
  TraversalStrategySelection
} from "./traversal_modulation.js";
import type {
  EdgeAssuranceDefaultContract,
  EdgeAssuranceResolution
} from "./edge_assurance_contract.js";
import type { ConstructionPressurePackage } from "./construction_pressure_package.js";
import { resolveEdgeAssuranceContract } from "./edge_assurance_contract.js";
import type {
  FreshRetryContextProjection,
  RetryFrontierProjection
} from "./retry_frontier.js";
import { deriveFreshRetryContextProjection } from "./retry_frontier.js";
import type {
  AdmittedOutputAuthorityProjection,
  InstructionCausalContextProjection
} from "./payload_ledger.js";
import {
  deriveAdmittedOutputAuthorityProjection,
  deriveInstructionCausalContextProjection,
  derivePayloadLedgerProjection
} from "./payload_ledger.js";
import type {
  GtlTargetCarrierDefaultsBundle
} from "../../../gtl/m01/contracts/index.js";
import type {
  GtlEvaluationScopeRef
} from "../../../gtl/m02/contracts/compute_notation.js";
import {
  admitGtlEvaluationScopeRef,
  constructGtlEvaluationScopeRef
} from "../../../gtl/m02/contracts/compute_notation.js";
import type {
  ConsequenceTraversalAction
} from "./consequence_traversal_action.js";
import {
  admitConsequenceTraversalAction,
  constructConsequenceTraversalAction
} from "./consequence_traversal_action.js";
import type {
  AllowedConsequenceTraversalCatalog
} from "./allowed_consequence_traversal_catalog.js";
import {
  deriveAllowedConsequenceTraversalCatalogFromGtl
} from "./allowed_consequence_traversal_catalog.js";
import type {
  EvaluationRuleOutcome,
  EvaluationRuleRole
} from "./evaluation_set.js";
import type {
  PromptManifest
} from "./instruction_assembly.js";
import type {
  ComposedStageTaskOutcome,
  ComposedStageTaskRole
} from "./composed_stage_set.js";
import {
  resolveAbgFnCompositionSelection,
  selectedAbgFnRegimeBindingForCompute
} from "./fn_composition.js";
import {
  parseBoolean,
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import {
  assertProjectionBasis,
  assertVectorIndexInRange,
  freezeNumberArray,
  freezeStringArray,
  frameIdForBasis,
  graphCallIdForBasis
} from "./runtime_support.js";
import { sourceProjectionRef } from "./projection.js";
import { stableSha256Digest } from "../../../shared/runtime_identity.js";
import {
  ENGINE_AUTHORITY_FIELD_KEYS,
  isEngineAuthorityFieldKey
} from "../../../shared/engine_authority_fields.js";

export const ENGINE_PLUGIN_KIND_VALUES = Object.freeze([
  "runtime_event_sink",
  "fd_evaluator",
  "fp_evaluator",
  "fp_dispatch",
  "fh_admission",
  "consequence_projection",
  "result_assessment",
  "event_ingress",
  "continuation_repair",
  "policy_provider",
  "assurance_authority_snapshot_provider",
  "assurance_evidence_adapter",
  "assurance_ambiguity_classifier",
  "assurance_closure_policy_provider",
  "assurance_gain_function_adapter",
  "runtime_identity_provider",
  "operator_asset_resolver",
  "context_resolver",
  "projection_consumer",
  "hook_ref"
] as const);

export type EnginePluginKind =
  (typeof ENGINE_PLUGIN_KIND_VALUES)[number];

export const ENGINE_PLUGIN_AUTHORITY_VALUES = Object.freeze([
  "sink",
  "effect_plugin",
  "provider",
  "resolver",
  "projection_consumer",
  "declaration_ref"
] as const);

export type EnginePluginAuthority =
  (typeof ENGINE_PLUGIN_AUTHORITY_VALUES)[number];

export type EnginePluginEventAuthority =
  | "engine_emit_only"
  | "sink_receive_only"
  | "none";

export const ENGINE_COMPUTE_STAGE_ROLE_VALUES = Object.freeze([
  "transform",
  "evaluate",
  "consequence",
  "human_callout"
] as const);

export type EngineComputeStageRole =
  (typeof ENGINE_COMPUTE_STAGE_ROLE_VALUES)[number];

export const ENGINE_COMPUTE_STAGE_PURPOSE_VALUES = Object.freeze([
  "candidate_construction",
  "candidate_evaluation",
  "consequence_projection",
  "external_human_callout"
] as const);

export type EngineComputeStagePurpose =
  (typeof ENGINE_COMPUTE_STAGE_PURPOSE_VALUES)[number];

export type EngineHumanBoundary = "external_callout";

export const ENGINE_PLUGIN_RUNTIME_BINDING_STATUS_VALUES = Object.freeze([
  "runner_consumed",
  "public_runtime_consumed",
  "assurance_consumed",
  "engine_law_consumed",
  "read_model_consumed",
  "declarative_contract"
] as const);

export type EnginePluginRuntimeBindingStatus =
  (typeof ENGINE_PLUGIN_RUNTIME_BINDING_STATUS_VALUES)[number];

export interface EnginePluginContract {
  readonly kind: "engine_plugin_contract";
  readonly ref: string;
  readonly pluginKind: EnginePluginKind;
  readonly authority: EnginePluginAuthority;
  readonly inputCarrier: string;
  readonly outputCarrier: string;
  readonly eventAuthority: EnginePluginEventAuthority;
  readonly computeStageRole: EngineComputeStageRole | null;
  readonly computeMeans: RuntimeRegime | null;
  readonly computeStagePurpose: EngineComputeStagePurpose | null;
  readonly humanBoundary: EngineHumanBoundary | null;
  readonly maySelectNextVector: false;
  readonly mayEmitRuntimeEvents: false;
  readonly mayCloseTraversal: false;
  readonly mayOwnIterationLoop: false;
}

export interface EngineComputeStageBinding {
  readonly kind: "engine_compute_stage_binding";
  readonly stageRole: EngineComputeStageRole;
  readonly computeMeans: RuntimeRegime | null;
  readonly purpose: EngineComputeStagePurpose;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly predecessorRefs: readonly string[];
  readonly externalHumanCallout: boolean;
  readonly responseAdmissionRequired: boolean;
  readonly mayWriteLedgers: false;
  readonly mayEmitRuntimeEvents: false;
  readonly maySelectTraversal: false;
  readonly mayCloseTraversal: false;
}

export interface EnginePluginInventoryEntry {
  readonly kind: "engine_plugin_inventory_entry";
  readonly contract: EnginePluginContract;
  readonly runtimeBindingStatus: EnginePluginRuntimeBindingStatus;
  readonly proofScope: string;
  readonly engineOwnedLaw: string;
  readonly pluginOwnedScope: string;
  readonly positiveProof: string;
  readonly negativeProof: string;
  readonly collapseFamily: EnginePluginAuthority;
  readonly distinctAuthorityReason: string | null;
}

export interface EnginePluginInput {
  readonly kind: "engine_plugin_input";
  readonly contract: EnginePluginContract;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly computeStageBinding: EngineComputeStageBinding | null;
  readonly basisId: string;
  readonly graphCallId: string | null;
  readonly frameId: string | null;
  readonly graphFunctionId: string;
  readonly jobId: string;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly regime: RuntimeRegime;
  readonly sourceProjectionRef: string;
  readonly expectedEdge: string | null;
  readonly expectedAssessmentIds: readonly string[];
  readonly consumedFieldRefs: readonly string[];
  readonly observedStateProjectionRef: string;
  readonly observedStateRefs: readonly string[];
  readonly priorStageProjectionRefs: readonly string[];
  readonly priorStageFoldInputRefs: readonly string[];
  readonly stageSetDependencyRefs: readonly string[];
  readonly constructionPressurePackage: ConstructionPressurePackage | null;
  readonly constructionPressurePackageRef: string | null;
  readonly constructionPressureRefs: readonly string[];
  readonly closedVectorIndexes: readonly number[];
  readonly assessedEdges: readonly string[];
  readonly retryAttemptRefs: RuntimeAggregateProjection["retryAttemptRefs"];
  readonly retryProgressRefs: RuntimeAggregateProjection["retryProgressRefs"];
  readonly retryContext: FreshRetryContextProjection;
  readonly retryFrontier: RetryFrontierProjection;
  readonly outputAuthorityProjections: readonly AdmittedOutputAuthorityProjection[];
  readonly instructionCausalContext: InstructionCausalContextProjection | null;
  readonly instructionPromptManifest: PromptManifest | null;
  readonly actorInvocationRef: ActorInvocationRef | null;
  readonly attachedResultArtifact: Readonly<Record<string, unknown>> | null;
  readonly fpTransformRequest: FpTransformRequest | null;
  readonly pluginTraversalObserverBinding: PluginTraversalObserverBindingSelection | null;
  readonly edgeAssuranceResolution: EdgeAssuranceResolution;
  readonly allowedConsequenceTraversalCatalog: AllowedConsequenceTraversalCatalog;
  readonly traversalStrategySelection: TraversalStrategySelection | null;
  readonly traversalAttemptEnvelope: TraversalAttemptEnvelope | null;
}

export interface EnginePluginOutcomeBase {
  readonly evidenceRefs: readonly string[];
  readonly reason: string | null;
}

export interface FdEvaluationOutcome extends EnginePluginOutcomeBase {
  readonly kind: "fd_evaluation";
  readonly status: "accepted" | "blocked";
  readonly severityClass: FdAuthoritySeverityClass | null;
  readonly routingDecision: FdPressureRoutingDecision;
  readonly affectedFieldRefs: readonly string[];
  readonly consumedFieldRefs: readonly string[];
  readonly pressureRefs: readonly string[];
  readonly diagnosticRefs: readonly string[];
}

export type FpEvaluationCloseDisposition =
  | PayloadClosureDecisionKind
  | "no_close"
  | "human_required";

export type FpExecutiveDisposition =
  | "local_repair"
  | "nonlocal_reentry"
  | "reprice"
  | "block"
  | "close_candidate";

export interface FpEvaluationFinding {
  readonly kind: "fp_evaluation_finding";
  readonly findingRef: string;
  readonly evaluatorRef: string;
  readonly hookActionRef: string | null;
  readonly gainReportRef: string | null;
  readonly metricRefs: readonly string[];
  readonly closeDisposition: FpEvaluationCloseDisposition;
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly compositionContributionRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly diagnosticRefs: readonly string[];
  readonly evaluationScopeRef: GtlEvaluationScopeRef | null;
  readonly executiveDisposition: FpExecutiveDisposition | null;
}

export interface FpEvaluationOutcome extends EnginePluginOutcomeBase {
  readonly kind: "fp_evaluation";
  readonly status: "evaluated" | "blocked";
  readonly findings: readonly FpEvaluationFinding[];
  readonly ambiguityStatus: PayloadAmbiguityStatus;
  readonly diagnosticRefs: readonly string[];
}

export interface FpDispatchOutcome extends EnginePluginOutcomeBase {
  readonly kind: "fp_dispatch";
  readonly status: "dispatched" | "blocked";
  readonly resultRef: string | null;
  readonly attachedResultArtifact: Readonly<Record<string, unknown>> | null;
}

export interface FhAdmissionOutcome extends EnginePluginOutcomeBase {
  readonly kind: "fh_admission";
  readonly status: "escalated" | "blocked";
}

export interface ConsequenceProjectionOutcome extends EnginePluginOutcomeBase {
  readonly kind: "consequence_projection";
  readonly status: "projected" | "blocked";
  readonly consequenceRef: string | null;
  readonly domainReadModelRefs: readonly string[];
  readonly traversalAction: ConsequenceTraversalAction | null;
}

export type EnginePluginOutcome =
  | FdEvaluationOutcome
  | FpEvaluationOutcome
  | FpDispatchOutcome
  | FhAdmissionOutcome
  | ConsequenceProjectionOutcome;

export type EnginePluginMaybePromise<T> = T | Promise<T>;

export interface FdEvaluatorPlugin {
  readonly contract: EnginePluginContract;
  readonly evaluate: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<FdEvaluationOutcome>;
}

export interface FpEvaluatorPlugin {
  readonly contract: EnginePluginContract;
  readonly evaluate: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<FpEvaluationOutcome>;
}

export interface FpDispatchPlugin {
  readonly contract: EnginePluginContract;
  // The runner emits fp_dispatch_requested before invoking this effect edge.
  readonly dispatch: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<FpDispatchOutcome>;
}

export interface FhAdmissionPlugin {
  readonly contract: EnginePluginContract;
  readonly admit: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<FhAdmissionOutcome>;
}

export interface ConsequenceProjectionPlugin {
  readonly contract: EnginePluginContract;
  readonly project: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<ConsequenceProjectionOutcome>;
}

export interface EvaluationRulePlugin {
  readonly contract: EnginePluginContract;
  readonly ruleRef: string;
  readonly ruleRole?: EvaluationRuleRole | undefined;
  readonly required?: boolean | undefined;
  readonly parallelGroupRef?: string | null | undefined;
  readonly dependencyRefs?: readonly string[] | undefined;
  readonly inputLedgerRefs?: readonly string[] | undefined;
  readonly outputCarrierRefs?: readonly string[] | undefined;
  readonly evaluate: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<EvaluationRuleOutcome>;
}

export interface ComposedStageTaskPlugin {
  readonly contract: EnginePluginContract;
  readonly taskRef: string;
  readonly taskRole: ComposedStageTaskRole;
  readonly required?: boolean | undefined;
  readonly parallelGroupRef?: string | null | undefined;
  readonly dependencyRefs?: readonly string[] | undefined;
  readonly inputLedgerRefs?: readonly string[] | undefined;
  readonly outputCarrierRefs?: readonly string[] | undefined;
  readonly run: (
    input: EnginePluginInput
  ) => EnginePluginMaybePromise<ComposedStageTaskOutcome>;
}

export interface EngineRunnerPluginSet {
  readonly fdEvaluator?: FdEvaluatorPlugin;
  readonly fpEvaluator?: FpEvaluatorPlugin;
  readonly fpDispatch?: FpDispatchPlugin;
  readonly fhAdmission?: FhAdmissionPlugin;
  readonly consequenceProjection?: ConsequenceProjectionPlugin;
  readonly transformTasks?: readonly ComposedStageTaskPlugin[] | undefined;
  readonly requiredTransformTaskRefs?: readonly string[] | undefined;
  readonly evaluationRules?: readonly EvaluationRulePlugin[] | undefined;
  readonly requiredEvaluationRuleRefs?: readonly string[] | undefined;
  readonly consequenceTasks?: readonly ComposedStageTaskPlugin[] | undefined;
  readonly requiredConsequenceTaskRefs?: readonly string[] | undefined;
}

interface EnginePluginContractInput {
  readonly ref: string;
  readonly pluginKind: EnginePluginKind;
  readonly authority: EnginePluginAuthority;
  readonly inputCarrier: string;
  readonly outputCarrier: string;
  readonly eventAuthority?: EnginePluginEventAuthority | undefined;
  readonly computeStageRole?: EngineComputeStageRole | null | undefined;
  readonly computeMeans?: RuntimeRegime | null | undefined;
  readonly computeStagePurpose?: EngineComputeStagePurpose | null | undefined;
  readonly humanBoundary?: EngineHumanBoundary | null | undefined;
  readonly maySelectNextVector?: false | undefined;
  readonly mayEmitRuntimeEvents?: false | undefined;
  readonly mayCloseTraversal?: false | undefined;
  readonly mayOwnIterationLoop?: false | undefined;
}

const ENGINE_PLUGIN_CONTRACT_FIELD_KEYS = Object.freeze([
  "kind",
  "ref",
  "pluginKind",
  "authority",
  "inputCarrier",
  "outputCarrier",
  "eventAuthority",
  "computeStageRole",
  "computeMeans",
  "computeStagePurpose",
  "humanBoundary",
  "maySelectNextVector",
  "mayEmitRuntimeEvents",
  "mayCloseTraversal",
  "mayOwnIterationLoop"
] as const);

const ENGINE_PLUGIN_CONTRACT_FIELD_KEY_SET: ReadonlySet<string> = new Set(
  ENGINE_PLUGIN_CONTRACT_FIELD_KEYS
);

function isReadonlyRecord(
  input: unknown
): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function assertOnlyEnginePluginContractFields(
  input: Readonly<Record<string, unknown>>,
  label: string
): void {
  for (const field of Object.keys(input)) {
    if (!ENGINE_PLUGIN_CONTRACT_FIELD_KEY_SET.has(field)) {
      if (isEngineAuthorityFieldKey(field)) {
        throw new TypeError(`${label}.${field}: plugin contract cannot own engine authority`);
      }
      throw new TypeError(`${label}.${field}: unknown engine plugin contract field`);
    }
  }
}

const FORBIDDEN_OUTCOME_AUTHORITY_FIELDS = ENGINE_AUTHORITY_FIELD_KEYS;

function assertPluginKind(kind: string, label: string): EnginePluginKind {
  switch (kind) {
    case "runtime_event_sink":
    case "fd_evaluator":
    case "fp_evaluator":
    case "fp_dispatch":
    case "fh_admission":
    case "consequence_projection":
    case "result_assessment":
    case "event_ingress":
    case "continuation_repair":
    case "policy_provider":
    case "assurance_authority_snapshot_provider":
    case "assurance_evidence_adapter":
    case "assurance_ambiguity_classifier":
    case "assurance_closure_policy_provider":
    case "assurance_gain_function_adapter":
    case "runtime_identity_provider":
    case "operator_asset_resolver":
    case "context_resolver":
    case "projection_consumer":
    case "hook_ref":
      return kind;
    default:
      throw new TypeError(
        `${label}: expected engine plugin kind, got ${JSON.stringify(kind)}`
      );
  }
}

function assertPluginAuthority(
  authority: string,
  label: string
): EnginePluginAuthority {
  switch (authority) {
    case "sink":
    case "effect_plugin":
    case "provider":
    case "resolver":
    case "projection_consumer":
    case "declaration_ref":
      return authority;
    default:
      throw new TypeError(
        `${label}: expected engine plugin authority, got ${JSON.stringify(authority)}`
      );
  }
}

function assertEventAuthority(
  authority: string,
  label: string
): EnginePluginEventAuthority {
  if (
    authority === "engine_emit_only" ||
    authority === "sink_receive_only" ||
    authority === "none"
  ) {
    return authority;
  }
  throw new TypeError(
    `${label}: expected plugin event authority, got ${JSON.stringify(authority)}`
  );
}

function assertComputeStageRole(
  value: string,
  label: string
): EngineComputeStageRole {
  for (const candidate of ENGINE_COMPUTE_STAGE_ROLE_VALUES) {
    if (value === candidate) {
      return candidate;
    }
  }
  throw new TypeError(
    `${label}: expected compute stage role, got ${JSON.stringify(value)}`
  );
}

function assertComputeStagePurpose(
  value: string,
  label: string
): EngineComputeStagePurpose {
  for (const candidate of ENGINE_COMPUTE_STAGE_PURPOSE_VALUES) {
    if (value === candidate) {
      return candidate;
    }
  }
  throw new TypeError(
    `${label}: expected compute stage purpose, got ${JSON.stringify(value)}`
  );
}

function assertRuntimeRegime(value: string, label: string): RuntimeRegime {
  if (value === "F_D" || value === "F_P" || value === "F_H") {
    return value;
  }
  throw new TypeError(
    `${label}: expected runtime regime, got ${JSON.stringify(value)}`
  );
}

function assertHumanBoundary(
  value: string,
  label: string
): EngineHumanBoundary {
  if (value === "external_callout") {
    return value;
  }
  throw new TypeError(
    `${label}: expected external_callout, got ${JSON.stringify(value)}`
  );
}

function assertFalseAuthorityFlag(value: unknown, label: string): false {
  if (value === undefined) {
    return false;
  }
  if (parseBoolean(value, label) !== false) {
    throw new TypeError(`${label}: plugin contract cannot own engine authority`);
  }
  return false;
}

function rejectForbiddenOutcomeAuthorityFields(
  input: Readonly<Record<string, unknown>>,
  label: string
): void {
  for (const field of FORBIDDEN_OUTCOME_AUTHORITY_FIELDS) {
    if (Object.hasOwn(input, field)) {
      throw new TypeError(
        `${label}.${field}: plugin outcome cannot own engine authority`
      );
    }
  }
}

function normalizeReason(
  input: string | null | undefined,
  label: string
): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  if (input.length === 0) {
    throw new TypeError(`${label} must be non-empty when supplied`);
  }
  return input;
}

function parseOptionalReason(
  input: Readonly<Record<string, unknown>>,
  label: string
): string | null {
  const reason = parseOptionalField(input, "reason");
  if (reason === undefined || reason === null) {
    return null;
  }
  return parseNonEmptyString(reason, `${label}.reason`);
}

function parseOptionalEvidenceRefs(
  input: Readonly<Record<string, unknown>>,
  label: string
): readonly string[] {
  const evidence = parseOptionalField(input, "evidenceRefs");
  if (evidence === undefined) {
    return Object.freeze([]);
  }
  return parseStringArray(evidence, `${label}.evidenceRefs`);
}

function assertFdAuthoritySeverityClass(
  input: string,
  label: string
): FdAuthoritySeverityClass {
  for (const severityClass of FD_AUTHORITY_SEVERITY_CLASS_VALUES) {
    if (input === severityClass) {
      return severityClass;
    }
  }
  throw new TypeError(
    `${label}: expected F_D authority severity class, got ${JSON.stringify(input)}`
  );
}

function assertFdPressureRoutingDecision(
  input: string,
  label: string
): FdPressureRoutingDecision {
  for (const routingDecision of FD_PRESSURE_ROUTING_DECISION_VALUES) {
    if (input === routingDecision) {
      return routingDecision;
    }
  }
  throw new TypeError(
    `${label}: expected F_D pressure routing decision, got ${JSON.stringify(input)}`
  );
}

function assertPayloadAmbiguityStatus(
  input: string,
  label: string
): PayloadAmbiguityStatus {
  for (const ambiguityStatus of PAYLOAD_AMBIGUITY_STATUS_VALUES) {
    if (input === ambiguityStatus) {
      return ambiguityStatus;
    }
  }
  throw new TypeError(
    `${label}: expected payload ambiguity status, got ${JSON.stringify(input)}`
  );
}

function assertPayloadClosureDecisionKind(
  input: string,
  label: string
): PayloadClosureDecisionKind {
  for (const decision of PAYLOAD_CLOSURE_DECISION_KIND_VALUES) {
    if (input === decision) {
      return decision;
    }
  }
  throw new TypeError(
    `${label}: expected payload closure decision, got ${JSON.stringify(input)}`
  );
}

function assertFpEvaluationCloseDisposition(
  input: string,
  label: string
): FpEvaluationCloseDisposition {
  if (input === "no_close" || input === "human_required") {
    return input;
  }
  return assertPayloadClosureDecisionKind(input, label);
}

function assertFpExecutiveDisposition(
  input: string,
  label: string
): FpExecutiveDisposition {
  if (
    input === "local_repair" ||
    input === "nonlocal_reentry" ||
    input === "reprice" ||
    input === "block" ||
    input === "close_candidate"
  ) {
    return input;
  }
  throw new TypeError(
    `${label}: unsupported executive disposition ${JSON.stringify(input)}`
  );
}

function fieldRefsIntersect(
  left: readonly string[],
  right: readonly string[]
): boolean {
  const rightSet = new Set(right);
  return left.some((fieldRef) => rightSet.has(fieldRef));
}

function defaultFdPressureRefs(input: {
  readonly severityClass: FdAuthoritySeverityClass | null;
  readonly affectedFieldRefs: readonly string[];
  readonly routingDecision: FdPressureRoutingDecision;
}): readonly string[] {
  if (input.routingDecision === "continue" || input.severityClass === null) {
    return Object.freeze([]);
  }
  return Object.freeze([
    [
      "fd-pressure",
      input.routingDecision,
      input.severityClass,
      input.affectedFieldRefs.length === 0
        ? "no-field"
        : input.affectedFieldRefs.join("+")
    ].join(":")
  ]);
}

export function deriveFdPressureRoutingDecision(input: {
  readonly status: FdEvaluationOutcome["status"];
  readonly severityClass: FdAuthoritySeverityClass | null;
  readonly affectedFieldRefs: readonly string[];
  readonly consumedFieldRefs: readonly string[];
}): FdPressureRoutingDecision {
  if (input.status === "accepted") {
    return "continue";
  }
  if (input.severityClass === null) {
    throw new TypeError("FdEvaluationOutcome blocked status requires severityClass");
  }
  switch (input.severityClass) {
    case "protocol_invalid":
    case "construction_context_invalid":
      return "block";
    case "diagnostic_shape_invalid":
      return fieldRefsIntersect(input.affectedFieldRefs, input.consumedFieldRefs)
        ? "block"
        : "preserve_pressure";
    case "content_unproven":
      return "route_to_fp";
    default: {
      const exhaustive: never = input.severityClass;
      throw new TypeError(
        `Unsupported F_D severity class ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

interface EngineComputeStageDefaults {
  readonly computeStageRole: EngineComputeStageRole | null;
  readonly computeMeans: RuntimeRegime | null;
  readonly computeStagePurpose: EngineComputeStagePurpose | null;
  readonly humanBoundary: EngineHumanBoundary | null;
}

function defaultComputeStageForPluginKind(
  pluginKind: EnginePluginKind
): EngineComputeStageDefaults {
  switch (pluginKind) {
    case "fd_evaluator":
      return Object.freeze({
        computeStageRole: "evaluate",
        computeMeans: "F_D",
        computeStagePurpose: "candidate_evaluation",
        humanBoundary: null
      });
    case "fp_evaluator":
      return Object.freeze({
        computeStageRole: "evaluate",
        computeMeans: "F_P",
        computeStagePurpose: "candidate_evaluation",
        humanBoundary: null
      });
    case "fp_dispatch":
      return Object.freeze({
        computeStageRole: "transform",
        computeMeans: "F_P",
        computeStagePurpose: "candidate_construction",
        humanBoundary: null
      });
    case "fh_admission":
      return Object.freeze({
        computeStageRole: "human_callout",
        computeMeans: "F_H",
        computeStagePurpose: "external_human_callout",
        humanBoundary: "external_callout"
      });
    case "consequence_projection":
      return Object.freeze({
        computeStageRole: "consequence",
        computeMeans: "F_D",
        computeStagePurpose: "consequence_projection",
        humanBoundary: null
      });
    case "projection_consumer":
      return Object.freeze({
        computeStageRole: "consequence",
        computeMeans: "F_D",
        computeStagePurpose: "consequence_projection",
        humanBoundary: null
      });
    case "runtime_event_sink":
    case "result_assessment":
    case "event_ingress":
    case "continuation_repair":
    case "policy_provider":
    case "assurance_authority_snapshot_provider":
    case "assurance_evidence_adapter":
    case "assurance_ambiguity_classifier":
    case "assurance_closure_policy_provider":
    case "assurance_gain_function_adapter":
    case "runtime_identity_provider":
    case "operator_asset_resolver":
    case "context_resolver":
    case "hook_ref":
      return Object.freeze({
        computeStageRole: null,
        computeMeans: null,
        computeStagePurpose: null,
        humanBoundary: null
      });
    default: {
      const exhaustive: never = pluginKind;
      throw new TypeError(
        `Unsupported engine plugin kind ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function expectedPurposeForStageRole(
  role: EngineComputeStageRole
): EngineComputeStagePurpose {
  switch (role) {
    case "transform":
      return "candidate_construction";
    case "evaluate":
      return "candidate_evaluation";
    case "consequence":
      return "consequence_projection";
    case "human_callout":
      return "external_human_callout";
    default: {
      const exhaustive: never = role;
      throw new TypeError(
        `Unsupported compute stage role ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

function normalizeComputeStageContract(
  input: EnginePluginContractInput
): EngineComputeStageDefaults {
  const defaults = defaultComputeStageForPluginKind(input.pluginKind);
  const role = input.computeStageRole ?? defaults.computeStageRole;
  const means = input.computeMeans ?? defaults.computeMeans;
  const purpose = input.computeStagePurpose ?? defaults.computeStagePurpose;
  const humanBoundary = input.humanBoundary ?? defaults.humanBoundary;
  if (
    defaults.computeStageRole !== null &&
    (role !== defaults.computeStageRole ||
      means !== defaults.computeMeans ||
      purpose !== defaults.computeStagePurpose ||
      humanBoundary !== defaults.humanBoundary)
  ) {
    throw new TypeError(
      "EnginePluginContract compute category contradicts pluginKind"
    );
  }
  if (role === null) {
    if (purpose !== null || means !== null || humanBoundary !== null) {
      throw new TypeError(
        "EnginePluginContract compute category requires computeStageRole"
      );
    }
    return Object.freeze({
      computeStageRole: null,
      computeMeans: null,
      computeStagePurpose: null,
      humanBoundary: null
    });
  }
  if (purpose === null) {
    throw new TypeError(
      "EnginePluginContract compute category requires computeStagePurpose"
    );
  }
  const expectedPurpose = expectedPurposeForStageRole(role);
  if (purpose !== expectedPurpose) {
    throw new TypeError(
      "EnginePluginContract computeStagePurpose contradicts computeStageRole"
    );
  }
  if (role === "human_callout") {
    if (means !== "F_H" || humanBoundary !== "external_callout") {
      throw new TypeError(
        "EnginePluginContract human_callout requires F_H external_callout"
      );
    }
  } else {
    if (humanBoundary !== null) {
      throw new TypeError(
        "EnginePluginContract humanBoundary is only lawful for human_callout"
      );
    }
    if (means === "F_H") {
      throw new TypeError(
        "EnginePluginContract F_H compute is only lawful as human_callout"
      );
    }
  }
  return Object.freeze({
    computeStageRole: role,
    computeMeans: means,
    computeStagePurpose: purpose,
    humanBoundary
  });
}

function pluginContract(input: EnginePluginContractInput): EnginePluginContract {
  const compute = normalizeComputeStageContract(input);
  return Object.freeze({
    kind: "engine_plugin_contract",
    ref: input.ref,
    pluginKind: input.pluginKind,
    authority: input.authority,
    inputCarrier: input.inputCarrier,
    outputCarrier: input.outputCarrier,
    eventAuthority: input.eventAuthority ?? "engine_emit_only",
    computeStageRole: compute.computeStageRole,
    computeMeans: compute.computeMeans,
    computeStagePurpose: compute.computeStagePurpose,
    humanBoundary: compute.humanBoundary,
    maySelectNextVector: input.maySelectNextVector ?? false,
    mayEmitRuntimeEvents: input.mayEmitRuntimeEvents ?? false,
    mayCloseTraversal: input.mayCloseTraversal ?? false,
    mayOwnIterationLoop: input.mayOwnIterationLoop ?? false
  });
}

export function constructEnginePluginContract(
  input: EnginePluginContractInput
): EnginePluginContract {
  if (isReadonlyRecord(input)) {
    assertOnlyEnginePluginContractFields(input, "EnginePluginContract");
  }
  return pluginContract({
    ref: parseNonEmptyString(input.ref, "EnginePluginContract.ref"),
    pluginKind: assertPluginKind(
      input.pluginKind,
      "EnginePluginContract.pluginKind"
    ),
    authority: assertPluginAuthority(
      input.authority,
      "EnginePluginContract.authority"
    ),
    inputCarrier: parseNonEmptyString(
      input.inputCarrier,
      "EnginePluginContract.inputCarrier"
    ),
    outputCarrier: parseNonEmptyString(
      input.outputCarrier,
      "EnginePluginContract.outputCarrier"
    ),
    eventAuthority:
      input.eventAuthority === undefined
        ? undefined
        : assertEventAuthority(
            input.eventAuthority,
            "EnginePluginContract.eventAuthority"
          ),
    computeStageRole:
      input.computeStageRole === undefined || input.computeStageRole === null
        ? input.computeStageRole
        : assertComputeStageRole(
            input.computeStageRole,
            "EnginePluginContract.computeStageRole"
          ),
    computeMeans:
      input.computeMeans === undefined || input.computeMeans === null
        ? input.computeMeans
        : assertRuntimeRegime(
            input.computeMeans,
            "EnginePluginContract.computeMeans"
          ),
    computeStagePurpose:
      input.computeStagePurpose === undefined ||
      input.computeStagePurpose === null
        ? input.computeStagePurpose
        : assertComputeStagePurpose(
            input.computeStagePurpose,
            "EnginePluginContract.computeStagePurpose"
          ),
    humanBoundary:
      input.humanBoundary === undefined || input.humanBoundary === null
        ? input.humanBoundary
        : assertHumanBoundary(
            input.humanBoundary,
            "EnginePluginContract.humanBoundary"
          ),
    maySelectNextVector: false,
    mayEmitRuntimeEvents: false,
    mayCloseTraversal: false,
    mayOwnIterationLoop: false
  });
}

export function admitEnginePluginContract(
  input: unknown,
  label = "EnginePluginContract"
): EnginePluginContract {
  const contractObject = parsePlainObject(input, label);
  assertOnlyEnginePluginContractFields(contractObject, label);
  const kind = parseString(contractObject["kind"], `${label}.kind`);
  if (kind !== "engine_plugin_contract") {
    throw new TypeError(
      `${label}.kind: expected "engine_plugin_contract", got ${JSON.stringify(kind)}`
    );
  }
  const eventAuthorityInput = parseOptionalField(contractObject, "eventAuthority");
  const computeStageRoleInput = parseOptionalField(contractObject, "computeStageRole");
  const computeMeansInput = parseOptionalField(contractObject, "computeMeans");
  const computeStagePurposeInput = parseOptionalField(
    contractObject,
    "computeStagePurpose"
  );
  const humanBoundaryInput = parseOptionalField(contractObject, "humanBoundary");
  return pluginContract({
    ref: parseNonEmptyString(contractObject["ref"], `${label}.ref`),
    pluginKind: assertPluginKind(
      parseString(contractObject["pluginKind"], `${label}.pluginKind`),
      `${label}.pluginKind`
    ),
    authority: assertPluginAuthority(
      parseString(contractObject["authority"], `${label}.authority`),
      `${label}.authority`
    ),
    inputCarrier: parseNonEmptyString(
      contractObject["inputCarrier"],
      `${label}.inputCarrier`
    ),
    outputCarrier: parseNonEmptyString(
      contractObject["outputCarrier"],
      `${label}.outputCarrier`
    ),
    eventAuthority:
      eventAuthorityInput === undefined
        ? "engine_emit_only"
        : assertEventAuthority(
            parseString(eventAuthorityInput, `${label}.eventAuthority`),
            `${label}.eventAuthority`
          ),
    computeStageRole:
      computeStageRoleInput === undefined || computeStageRoleInput === null
        ? computeStageRoleInput
        : assertComputeStageRole(
            parseString(computeStageRoleInput, `${label}.computeStageRole`),
            `${label}.computeStageRole`
          ),
    computeMeans:
      computeMeansInput === undefined || computeMeansInput === null
        ? computeMeansInput
        : assertRuntimeRegime(
            parseString(computeMeansInput, `${label}.computeMeans`),
            `${label}.computeMeans`
          ),
    computeStagePurpose:
      computeStagePurposeInput === undefined || computeStagePurposeInput === null
        ? computeStagePurposeInput
        : assertComputeStagePurpose(
            parseString(
              computeStagePurposeInput,
              `${label}.computeStagePurpose`
            ),
            `${label}.computeStagePurpose`
          ),
    humanBoundary:
      humanBoundaryInput === undefined || humanBoundaryInput === null
        ? humanBoundaryInput
        : assertHumanBoundary(
            parseString(humanBoundaryInput, `${label}.humanBoundary`),
            `${label}.humanBoundary`
          ),
    maySelectNextVector: assertFalseAuthorityFlag(
      parseOptionalField(contractObject, "maySelectNextVector"),
      `${label}.maySelectNextVector`
    ),
    mayEmitRuntimeEvents: assertFalseAuthorityFlag(
      parseOptionalField(contractObject, "mayEmitRuntimeEvents"),
      `${label}.mayEmitRuntimeEvents`
    ),
    mayCloseTraversal: assertFalseAuthorityFlag(
      parseOptionalField(contractObject, "mayCloseTraversal"),
      `${label}.mayCloseTraversal`
    ),
    mayOwnIterationLoop: assertFalseAuthorityFlag(
      parseOptionalField(contractObject, "mayOwnIterationLoop"),
      `${label}.mayOwnIterationLoop`
    )
  });
}

function computeStageBinding(input: {
  readonly contract: EnginePluginContract;
  readonly selectedCompositionRef: string;
  readonly selectedCompositionDigest: string;
  readonly selectedCompositionSelectionRef: string;
  readonly selectedRegimeBindingRef: string | null;
  readonly predecessorRefs: readonly string[];
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
}): EngineComputeStageBinding | null {
  if (
    input.contract.computeStageRole === null ||
    input.contract.computeStagePurpose === null
  ) {
    return null;
  }
  return Object.freeze({
    kind: "engine_compute_stage_binding",
    stageRole: input.contract.computeStageRole,
    computeMeans: input.contract.computeMeans,
    purpose: input.contract.computeStagePurpose,
    selectedCompositionRef: input.selectedCompositionRef,
    selectedCompositionDigest: input.selectedCompositionDigest,
    selectedCompositionSelectionRef: input.selectedCompositionSelectionRef,
    selectedRegimeBindingRef: input.selectedRegimeBindingRef,
    inputCarrierRefs: freezeStringArray(input.inputCarrierRefs),
    outputCarrierRefs: freezeStringArray(input.outputCarrierRefs),
    predecessorRefs: freezeStringArray(input.predecessorRefs),
    externalHumanCallout: input.contract.humanBoundary === "external_callout",
    responseAdmissionRequired:
      input.contract.humanBoundary === "external_callout",
    mayWriteLedgers: false,
    mayEmitRuntimeEvents: false,
    maySelectTraversal: false,
    mayCloseTraversal: false
  });
}

export function constructEnginePluginInput(input: {
  readonly contract: EnginePluginContract;
  readonly basis: ExecutionBasis;
  readonly projection: RuntimeAggregateProjection;
  readonly replayEvents?: readonly RuntimeEvent[] | undefined;
  readonly vectorIndex: number;
  readonly edge: string;
  readonly regime: RuntimeRegime;
  readonly actorInvocationRef?: ActorInvocationRef | null | undefined;
  readonly attachedResultArtifact?:
    | Readonly<Record<string, unknown>>
    | null
    | undefined;
  readonly traversalStrategySelection?:
    | TraversalStrategySelection
    | null
    | undefined;
  readonly traversalAttemptEnvelope?: TraversalAttemptEnvelope | null | undefined;
  readonly abgFallbackBundle?: AbgFallbackBundle | null | undefined;
  readonly pluginTraversalObserverFallbackEnabled?: boolean | undefined;
  readonly pluginTraversalObserverFallbackKinds?:
    | readonly PluginTraversalKind[]
    | undefined;
  readonly edgeAssuranceDefaults?:
    | EdgeAssuranceDefaultContract
    | null
    | undefined;
  readonly constructionPressurePackage?:
    | ConstructionPressurePackage
    | null
    | undefined;
  readonly targetCarrierDefaults?:
    | GtlTargetCarrierDefaultsBundle
    | null
    | undefined;
  readonly priorStageProjectionRefs?: readonly string[] | undefined;
  readonly priorStageFoldInputRefs?: readonly string[] | undefined;
  readonly stageSetDependencyRefs?: readonly string[] | undefined;
  readonly instructionPromptManifest?: PromptManifest | null | undefined;
}): EnginePluginInput {
  const contract = admitEnginePluginContract(input.contract);
  assertProjectionBasis(input.basis, input.projection, "EnginePluginInput");
  assertVectorIndexInRange(input.basis, input.vectorIndex);
  const vector = input.basis.graph.vectors[input.vectorIndex];
  if (vector === undefined) {
    throw new TypeError("EnginePluginInput requires a graph vector");
  }
  const replayEvents = input.replayEvents ?? Object.freeze([]);
  const retryContext = deriveFreshRetryContextProjection({
    basis: input.basis,
    runtimeProjection: input.projection,
    events: replayEvents,
    vectorIndex: input.vectorIndex
  });
  const retryFrontier = retryContext.frontier;
  const outputAuthorityVectorIndexes = Object.freeze([
    ...new Set([
      ...input.projection.closedVectorIndexes,
      input.vectorIndex
    ])
  ]);
  const targetCarrierDefaults = input.targetCarrierDefaults ?? null;
  const outputAuthorityProjections =
    targetCarrierDefaults === null
      ? Object.freeze([])
      : Object.freeze(
          outputAuthorityVectorIndexes.map((vectorIndex) =>
            deriveAdmittedOutputAuthorityProjection({
              ledger: derivePayloadLedgerProjection({
                basis: input.basis,
                runtimeProjection: input.projection,
                events: replayEvents,
                vectorIndex,
                targetCarrierDefaults
              })
            })
          )
        );
  const instructionCausalContext =
    targetCarrierDefaults === null
      ? null
      : deriveInstructionCausalContextProjection({
          basis: input.basis,
          runtimeProjection: input.projection,
          events: replayEvents,
          vectorIndex: input.vectorIndex,
          targetCarrierDefaults
        });
  const normalizedActorInvocationRef =
    input.actorInvocationRef === undefined ||
    input.actorInvocationRef === null
      ? null
      : Object.freeze({
          actorInvocationId: input.actorInvocationRef.actorInvocationId,
          attemptIndex: input.actorInvocationRef.attemptIndex,
          dispatchRef: input.actorInvocationRef.dispatchRef,
          resultRef: input.actorInvocationRef.resultRef
        });
  const compositionSelection = resolveAbgFnCompositionSelection({
    vector,
    graphFunction: input.basis.graphFunction,
    job: input.basis.job,
    roles: input.basis.job.roles,
    module: {
      name: input.basis.moduleName,
      policyHooks: input.basis.modulePolicyHooks
    }
  });
  const selectedRegimeBinding =
    contract.computeStageRole === null
      ? null
      : selectedAbgFnRegimeBindingForCompute({
          selection: compositionSelection,
          stageRole: contract.computeStageRole,
          computeMeans: contract.computeMeans
        });
  const regimeBindingRef = selectedRegimeBinding?.bindingRef ?? null;
  const sourceRef = sourceProjectionRef(input.projection);
  const priorStageProjectionRefs = freezeStringArray(
    input.priorStageProjectionRefs ?? Object.freeze([])
  );
  const priorStageFoldInputRefs = freezeStringArray(
    input.priorStageFoldInputRefs ?? Object.freeze([])
  );
  const stageSetDependencyRefs = freezeStringArray(
    input.stageSetDependencyRefs ?? Object.freeze([])
  );
  const predecessorRefs = freezeStringArray([
    ...new Set([
      sourceRef,
      ...priorStageProjectionRefs,
      ...priorStageFoldInputRefs,
      ...stageSetDependencyRefs
    ])
  ]);
  const stageBinding = computeStageBinding({
    contract,
    selectedCompositionRef: compositionSelection.contract.contractRef,
    selectedCompositionDigest: compositionSelection.contract.contractDigest,
    selectedCompositionSelectionRef:
      compositionSelection.selectionRef,
    selectedRegimeBindingRef: regimeBindingRef,
    predecessorRefs,
    inputCarrierRefs: [contract.inputCarrier],
    outputCarrierRefs: [contract.outputCarrier]
  });
  const pluginTraversalKind: PluginTraversalKind | null =
    contract.computeStageRole === "transform" ||
    contract.computeStageRole === "evaluate" ||
    contract.computeStageRole === "consequence"
      ? contract.computeStageRole
      : null;
  const pluginTraversalObserverBinding =
    pluginTraversalKind !== null
      ? tryResolvePluginTraversalObserverBinding({
          traversalKind: pluginTraversalKind,
          vector,
          graphFunction: input.basis.graphFunction,
          roles: input.basis.job.roles,
          defaultsBundle: input.abgFallbackBundle ?? null,
          fallbackEnabled:
            input.pluginTraversalObserverFallbackKinds?.includes(
              pluginTraversalKind
            ) ??
            input.pluginTraversalObserverFallbackEnabled ??
            false
        })
      : null;
  const fpTransformRequest =
    input.regime === "F_P" &&
    contract.computeStageRole === "transform" &&
    normalizedActorInvocationRef !== null
      ? constructFpTransformRequest({
          basis: input.basis,
          projection: input.projection,
          vectorIndex: input.vectorIndex,
          edge: input.edge,
          actorInvocationRef: normalizedActorInvocationRef,
          sourceProjectionRef: sourceRef,
          expectedAssessmentIds: vector.evaluators.map(
            (evaluator) => evaluator.name
          ),
          retryFrontier,
          pluginTraversalObserverBinding,
          instructionCausalContext
        })
      : null;
  const edgeAssuranceResolution = resolveEdgeAssuranceContract({
    vector,
    graphFunction: input.basis.graphFunction,
    job: input.basis.job,
    roles: input.basis.job.roles,
    module: {
      name: input.basis.moduleName,
      policyHooks: input.basis.modulePolicyHooks
    },
    defaults: input.edgeAssuranceDefaults ?? null
  });
  const allowedConsequenceTraversalCatalog =
    deriveAllowedConsequenceTraversalCatalogFromGtl({
      graphFunction: input.basis.graphFunction,
      graphVector: vector,
      vectorIndex: input.vectorIndex,
      edgeRef: input.edge
    });
  return Object.freeze({
    kind: "engine_plugin_input",
    contract,
    selectedCompositionRef: compositionSelection.contract.contractRef,
    selectedCompositionDigest: compositionSelection.contract.contractDigest,
    selectedCompositionSelectionRef: compositionSelection.selectionRef,
    selectedRegimeBindingRef: regimeBindingRef,
    computeStageBinding: stageBinding,
    basisId: input.basis.id,
    graphCallId: input.projection.graphCallId ?? graphCallIdForBasis(input.basis),
    frameId: input.projection.frameId ?? frameIdForBasis(input.basis),
    graphFunctionId: input.basis.graphFunction.id,
    jobId: input.basis.job.id,
    vectorIndex: input.vectorIndex,
    edge: input.edge,
    regime: input.regime,
    sourceProjectionRef: sourceRef,
    expectedEdge: input.edge,
    expectedAssessmentIds: freezeStringArray(
      vector.evaluators.map((evaluator) => evaluator.name)
    ),
    consumedFieldRefs: freezeStringArray(
      vector.evaluators.flatMap((evaluator) => evaluator.consumedFieldRefs)
    ),
    observedStateProjectionRef: input.projection.observedState.projectionRef,
    observedStateRefs: freezeStringArray(
      input.projection.observedState.observedStateRefs
    ),
    priorStageProjectionRefs,
    priorStageFoldInputRefs,
    stageSetDependencyRefs,
    constructionPressurePackage: input.constructionPressurePackage ?? null,
    constructionPressurePackageRef:
      input.constructionPressurePackage?.packageRef ?? null,
    constructionPressureRefs: freezeStringArray(
      input.constructionPressurePackage?.pressureRefs.map(
        (row) => row.pressureRef
      ) ?? Object.freeze([])
    ),
    closedVectorIndexes: freezeNumberArray(input.projection.closedVectorIndexes),
    assessedEdges: freezeStringArray(input.projection.assessedEdges),
    retryAttemptRefs: Object.freeze([...input.projection.retryAttemptRefs]),
    retryProgressRefs: Object.freeze([...input.projection.retryProgressRefs]),
    retryContext,
    retryFrontier,
    outputAuthorityProjections,
    instructionCausalContext,
    instructionPromptManifest: input.instructionPromptManifest ?? null,
    actorInvocationRef: normalizedActorInvocationRef,
    attachedResultArtifact:
      input.attachedResultArtifact === undefined ||
      input.attachedResultArtifact === null
        ? null
        : parsePlainObject(
            input.attachedResultArtifact,
            "EnginePluginInput.attachedResultArtifact"
          ),
    fpTransformRequest,
    pluginTraversalObserverBinding,
    edgeAssuranceResolution,
    allowedConsequenceTraversalCatalog,
    traversalStrategySelection: input.traversalStrategySelection ?? null,
    traversalAttemptEnvelope: input.traversalAttemptEnvelope ?? null
  });
}

export function constructFdEvaluationOutcome(input: {
  readonly status: FdEvaluationOutcome["status"];
  readonly severityClass?: FdAuthoritySeverityClass | null | undefined;
  readonly affectedFieldRefs?: readonly string[] | undefined;
  readonly consumedFieldRefs?: readonly string[] | undefined;
  readonly pressureRefs?: readonly string[] | undefined;
  readonly diagnosticRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[];
  readonly reason?: string | null;
}): FdEvaluationOutcome {
  const affectedFieldRefs = freezeStringArray(
    input.affectedFieldRefs ?? Object.freeze([])
  );
  const consumedFieldRefs = freezeStringArray(
    input.consumedFieldRefs ?? Object.freeze([])
  );
  const severityClass =
    input.status === "accepted" ? null : input.severityClass ?? null;
  const routingDecision = deriveFdPressureRoutingDecision({
    status: input.status,
    severityClass,
    affectedFieldRefs,
    consumedFieldRefs
  });
  const diagnosticRefs = freezeStringArray(
    input.diagnosticRefs ??
      (severityClass === null
        ? Object.freeze([])
        : Object.freeze([
            `fd_severity:${severityClass}`,
            `fd_routing:${routingDecision}`
          ]))
  );
  return Object.freeze({
    kind: "fd_evaluation",
    status: input.status,
    severityClass,
    routingDecision,
    affectedFieldRefs,
    consumedFieldRefs,
    pressureRefs: freezeStringArray(
      input.pressureRefs ??
        defaultFdPressureRefs({
          severityClass,
          affectedFieldRefs,
          routingDecision
        })
    ),
    diagnosticRefs,
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    reason: normalizeReason(input.reason, "FdEvaluationOutcome.reason")
  });
}

export function constructFpEvaluationFinding(input: {
  readonly findingRef: string;
  readonly evaluatorRef: string;
  readonly hookActionRef?: string | null | undefined;
  readonly gainReportRef?: string | null | undefined;
  readonly metricRefs?: readonly string[] | undefined;
  readonly closeDisposition: FpEvaluationCloseDisposition;
  readonly residualPressureRefs?: readonly string[] | undefined;
  readonly continuationRefs?: readonly string[] | undefined;
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly compositionContributionRef: string;
  readonly compositionRef: string;
  readonly compositionDigest: string;
  readonly diagnosticRefs?: readonly string[] | undefined;
  readonly evaluationScopeRef?: GtlEvaluationScopeRef | null | undefined;
  readonly executiveDisposition?: FpExecutiveDisposition | null | undefined;
}): FpEvaluationFinding {
  const evidenceRefs = freezeStringArray(input.evidenceRefs);
  const authorityRefs = freezeStringArray(input.authorityRefs);
  if (evidenceRefs.length === 0) {
    throw new TypeError("FpEvaluationFinding.evidenceRefs must not be empty");
  }
  if (authorityRefs.length === 0) {
    throw new TypeError("FpEvaluationFinding.authorityRefs must not be empty");
  }
  return Object.freeze({
    kind: "fp_evaluation_finding",
    findingRef: parseNonEmptyString(
      input.findingRef,
      "FpEvaluationFinding.findingRef"
    ),
    evaluatorRef: parseNonEmptyString(
      input.evaluatorRef,
      "FpEvaluationFinding.evaluatorRef"
    ),
    hookActionRef: normalizeReason(
      input.hookActionRef,
      "FpEvaluationFinding.hookActionRef"
    ),
    gainReportRef: normalizeReason(
      input.gainReportRef,
      "FpEvaluationFinding.gainReportRef"
    ),
    metricRefs: freezeStringArray(input.metricRefs ?? Object.freeze([])),
    closeDisposition: assertFpEvaluationCloseDisposition(
      input.closeDisposition,
      "FpEvaluationFinding.closeDisposition"
    ),
    residualPressureRefs: freezeStringArray(
      input.residualPressureRefs ?? Object.freeze([])
    ),
    continuationRefs: freezeStringArray(
      input.continuationRefs ?? Object.freeze([])
    ),
    evidenceRefs,
    authorityRefs,
    compositionContributionRef: parseNonEmptyString(
      input.compositionContributionRef,
      "FpEvaluationFinding.compositionContributionRef"
    ),
    compositionRef: parseNonEmptyString(
      input.compositionRef,
      "FpEvaluationFinding.compositionRef"
    ),
    compositionDigest: parseNonEmptyString(
      input.compositionDigest,
      "FpEvaluationFinding.compositionDigest"
    ),
    diagnosticRefs: freezeStringArray(input.diagnosticRefs ?? Object.freeze([])),
    evaluationScopeRef:
      input.evaluationScopeRef === undefined || input.evaluationScopeRef === null
        ? null
        : constructGtlEvaluationScopeRef(input.evaluationScopeRef),
    executiveDisposition:
      input.executiveDisposition === undefined ||
      input.executiveDisposition === null
        ? null
        : assertFpExecutiveDisposition(
            input.executiveDisposition,
            "FpEvaluationFinding.executiveDisposition"
          )
  });
}

export function constructFpEvaluationOutcome(input: {
  readonly status: FpEvaluationOutcome["status"];
  readonly findings?: readonly FpEvaluationFinding[] | undefined;
  readonly ambiguityStatus?: PayloadAmbiguityStatus | undefined;
  readonly diagnosticRefs?: readonly string[] | undefined;
  readonly evidenceRefs?: readonly string[];
  readonly reason?: string | null;
}): FpEvaluationOutcome {
  if (input.status !== "evaluated" && input.status !== "blocked") {
    throw new TypeError(
      `FpEvaluationOutcome.status: expected evaluated or blocked, got ${JSON.stringify(input.status)}`
    );
  }
  const findings = Object.freeze([...(input.findings ?? Object.freeze([]))]);
  if (input.status === "evaluated" && findings.length === 0) {
    throw new TypeError("FpEvaluationOutcome evaluated status requires findings");
  }
  const ambiguityStatus =
    input.ambiguityStatus === undefined
      ? input.status === "evaluated"
        ? "fulfilled"
        : "partial"
      : assertPayloadAmbiguityStatus(
          input.ambiguityStatus,
          "FpEvaluationOutcome.ambiguityStatus"
        );
  return Object.freeze({
    kind: "fp_evaluation",
    status: input.status,
    findings,
    ambiguityStatus,
    diagnosticRefs: freezeStringArray(input.diagnosticRefs ?? Object.freeze([])),
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    reason: normalizeReason(input.reason, "FpEvaluationOutcome.reason")
  });
}

export function constructFpDispatchOutcome(input: {
  readonly status: FpDispatchOutcome["status"];
  readonly resultRef?: string | null;
  readonly attachedResultArtifact?: Readonly<Record<string, unknown>> | null;
  readonly evidenceRefs?: readonly string[];
  readonly reason?: string | null;
}): FpDispatchOutcome {
  return Object.freeze({
    kind: "fp_dispatch",
    status: input.status,
    resultRef: normalizeReason(input.resultRef, "FpDispatchOutcome.resultRef"),
    attachedResultArtifact:
      input.attachedResultArtifact === undefined ||
      input.attachedResultArtifact === null
        ? null
        : parsePlainObject(
            input.attachedResultArtifact,
            "FpDispatchOutcome.attachedResultArtifact"
          ),
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    reason: normalizeReason(input.reason, "FpDispatchOutcome.reason")
  });
}

export function constructFhAdmissionOutcome(input: {
  readonly status: FhAdmissionOutcome["status"];
  readonly evidenceRefs?: readonly string[];
  readonly reason?: string | null;
}): FhAdmissionOutcome {
  return Object.freeze({
    kind: "fh_admission",
    status: input.status,
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    reason: normalizeReason(input.reason, "FhAdmissionOutcome.reason")
  });
}

export function constructConsequenceProjectionOutcome(input: {
  readonly status: ConsequenceProjectionOutcome["status"];
  readonly consequenceRef?: string | null;
  readonly domainReadModelRefs?: readonly string[] | undefined;
  readonly traversalAction?: ConsequenceTraversalAction | null | undefined;
  readonly evidenceRefs?: readonly string[];
  readonly reason?: string | null;
}): ConsequenceProjectionOutcome {
  const traversalAction =
    input.traversalAction === undefined || input.traversalAction === null
      ? null
      : constructConsequenceTraversalAction(input.traversalAction);
  if (input.status === "blocked" && traversalAction !== null) {
    throw new TypeError(
      "ConsequenceProjectionOutcome.traversalAction cannot be supplied for a blocked outcome"
    );
  }
  return Object.freeze({
    kind: "consequence_projection",
    status: input.status,
    consequenceRef: normalizeReason(
      input.consequenceRef,
      "ConsequenceProjectionOutcome.consequenceRef"
    ),
    domainReadModelRefs: freezeStringArray(
      input.domainReadModelRefs ?? Object.freeze([])
    ),
    traversalAction,
    evidenceRefs: freezeStringArray(input.evidenceRefs ?? Object.freeze([])),
    reason: normalizeReason(input.reason, "ConsequenceProjectionOutcome.reason")
  });
}

export function admitFdEvaluationOutcome(
  input: unknown,
  label = "FdEvaluationOutcome"
): FdEvaluationOutcome {
  const outcomeObject = parsePlainObject(input, label);
  rejectForbiddenOutcomeAuthorityFields(outcomeObject, label);
  const kind = parseString(outcomeObject["kind"], `${label}.kind`);
  if (kind !== "fd_evaluation") {
    throw new TypeError(
      `${label}.kind: expected "fd_evaluation", got ${JSON.stringify(kind)}`
    );
  }
  const status = parseString(outcomeObject["status"], `${label}.status`);
  if (status !== "accepted" && status !== "blocked") {
    throw new TypeError(
      `${label}.status: expected accepted or blocked, got ${JSON.stringify(status)}`
    );
  }
  const severityInput = parseOptionalField(outcomeObject, "severityClass");
  const severityClass =
    severityInput === undefined || severityInput === null
      ? null
      : assertFdAuthoritySeverityClass(
          parseString(severityInput, `${label}.severityClass`),
          `${label}.severityClass`
        );
  if (status === "accepted" && severityClass !== null) {
    throw new TypeError(`${label}.severityClass: accepted F_D outcome cannot carry severity`);
  }
  const affectedFieldRefs = parseStringArray(
    parseOptionalField(outcomeObject, "affectedFieldRefs") ?? [],
    `${label}.affectedFieldRefs`
  );
  const consumedFieldRefs = parseStringArray(
    parseOptionalField(outcomeObject, "consumedFieldRefs") ?? [],
    `${label}.consumedFieldRefs`
  );
  const pressureRefs = parseStringArray(
    parseOptionalField(outcomeObject, "pressureRefs") ?? [],
    `${label}.pressureRefs`
  );
  const diagnosticRefs = parseStringArray(
    parseOptionalField(outcomeObject, "diagnosticRefs") ?? [],
    `${label}.diagnosticRefs`
  );
  const admitted = constructFdEvaluationOutcome({
    status,
    severityClass,
    affectedFieldRefs,
    consumedFieldRefs,
    ...(pressureRefs.length === 0 ? {} : { pressureRefs }),
    ...(diagnosticRefs.length === 0 ? {} : { diagnosticRefs }),
    evidenceRefs: parseOptionalEvidenceRefs(outcomeObject, label),
    reason: parseOptionalReason(outcomeObject, label)
  });
  const routingInput = parseOptionalField(outcomeObject, "routingDecision");
  if (routingInput !== undefined) {
    const suppliedRouting = assertFdPressureRoutingDecision(
      parseString(routingInput, `${label}.routingDecision`),
      `${label}.routingDecision`
    );
    if (suppliedRouting !== admitted.routingDecision) {
      throw new TypeError(
        `${label}.routingDecision contradicts admitted F_D authority routing`
      );
    }
  }
  return admitted;
}

function admitFpEvaluationFinding(
  input: unknown,
  label = "FpEvaluationFinding"
): FpEvaluationFinding {
  const finding = parsePlainObject(input, label);
  rejectForbiddenOutcomeAuthorityFields(finding, label);
  const kind = parseString(finding["kind"], `${label}.kind`);
  if (kind !== "fp_evaluation_finding") {
    throw new TypeError(
      `${label}.kind: expected "fp_evaluation_finding", got ${JSON.stringify(kind)}`
    );
  }
  const hookActionRef = parseOptionalField(finding, "hookActionRef");
  const gainReportRef = parseOptionalField(finding, "gainReportRef");
  const evaluationScopeRef = parseOptionalField(finding, "evaluationScopeRef");
  const executiveDisposition = parseOptionalField(
    finding,
    "executiveDisposition"
  );
  return constructFpEvaluationFinding({
    findingRef: parseNonEmptyString(finding["findingRef"], `${label}.findingRef`),
    evaluatorRef: parseNonEmptyString(
      finding["evaluatorRef"],
      `${label}.evaluatorRef`
    ),
    hookActionRef:
      hookActionRef === undefined || hookActionRef === null
        ? null
        : parseNonEmptyString(hookActionRef, `${label}.hookActionRef`),
    gainReportRef:
      gainReportRef === undefined || gainReportRef === null
        ? null
        : parseNonEmptyString(gainReportRef, `${label}.gainReportRef`),
    metricRefs: parseStringArray(
      parseOptionalField(finding, "metricRefs") ?? [],
      `${label}.metricRefs`
    ),
    closeDisposition: assertFpEvaluationCloseDisposition(
      parseString(finding["closeDisposition"], `${label}.closeDisposition`),
      `${label}.closeDisposition`
    ),
    residualPressureRefs: parseStringArray(
      parseOptionalField(finding, "residualPressureRefs") ?? [],
      `${label}.residualPressureRefs`
    ),
    continuationRefs: parseStringArray(
      parseOptionalField(finding, "continuationRefs") ?? [],
      `${label}.continuationRefs`
    ),
    evidenceRefs: parseStringArray(
      finding["evidenceRefs"],
      `${label}.evidenceRefs`
    ),
    authorityRefs: parseStringArray(
      finding["authorityRefs"],
      `${label}.authorityRefs`
    ),
    compositionContributionRef: parseNonEmptyString(
      finding["compositionContributionRef"],
      `${label}.compositionContributionRef`
    ),
    compositionRef: parseNonEmptyString(
      finding["compositionRef"],
      `${label}.compositionRef`
    ),
    compositionDigest: parseNonEmptyString(
      finding["compositionDigest"],
      `${label}.compositionDigest`
    ),
    diagnosticRefs: parseStringArray(
      parseOptionalField(finding, "diagnosticRefs") ?? [],
      `${label}.diagnosticRefs`
    ),
    evaluationScopeRef:
      evaluationScopeRef === undefined || evaluationScopeRef === null
        ? null
        : admitGtlEvaluationScopeRef(
            evaluationScopeRef,
            `${label}.evaluationScopeRef`
          ),
    executiveDisposition:
      executiveDisposition === undefined || executiveDisposition === null
        ? null
        : assertFpExecutiveDisposition(
            parseString(executiveDisposition, `${label}.executiveDisposition`),
            `${label}.executiveDisposition`
          )
  });
}

export function admitFpEvaluationOutcome(
  input: unknown,
  label = "FpEvaluationOutcome"
): FpEvaluationOutcome {
  const outcomeObject = parsePlainObject(input, label);
  rejectForbiddenOutcomeAuthorityFields(outcomeObject, label);
  const kind = parseString(outcomeObject["kind"], `${label}.kind`);
  if (kind !== "fp_evaluation") {
    throw new TypeError(
      `${label}.kind: expected "fp_evaluation", got ${JSON.stringify(kind)}`
    );
  }
  const status = parseString(outcomeObject["status"], `${label}.status`);
  if (status !== "evaluated" && status !== "blocked") {
    throw new TypeError(
      `${label}.status: expected evaluated or blocked, got ${JSON.stringify(status)}`
    );
  }
  const findingsRaw = parseOptionalField(outcomeObject, "findings") ?? [];
  if (!Array.isArray(findingsRaw)) {
    throw new TypeError(`${label}.findings: expected list`);
  }
  const ambiguityStatusRaw = parseOptionalField(outcomeObject, "ambiguityStatus");
  return constructFpEvaluationOutcome({
    status,
    findings: Object.freeze(
      findingsRaw.map((finding, index) =>
        admitFpEvaluationFinding(finding, `${label}.findings[${index}]`)
      )
    ),
    ambiguityStatus:
      ambiguityStatusRaw === undefined
        ? undefined
        : assertPayloadAmbiguityStatus(
            parseString(ambiguityStatusRaw, `${label}.ambiguityStatus`),
            `${label}.ambiguityStatus`
          ),
    diagnosticRefs: parseStringArray(
      parseOptionalField(outcomeObject, "diagnosticRefs") ?? [],
      `${label}.diagnosticRefs`
    ),
    evidenceRefs: parseOptionalEvidenceRefs(outcomeObject, label),
    reason: parseOptionalReason(outcomeObject, label)
  });
}

export function admitFpDispatchOutcome(
  input: unknown,
  label = "FpDispatchOutcome"
): FpDispatchOutcome {
  const outcomeObject = parsePlainObject(input, label);
  rejectForbiddenOutcomeAuthorityFields(outcomeObject, label);
  const kind = parseString(outcomeObject["kind"], `${label}.kind`);
  if (kind !== "fp_dispatch") {
    throw new TypeError(
      `${label}.kind: expected "fp_dispatch", got ${JSON.stringify(kind)}`
    );
  }
  const status = parseString(outcomeObject["status"], `${label}.status`);
  if (status !== "dispatched" && status !== "blocked") {
    throw new TypeError(
      `${label}.status: expected dispatched or blocked, got ${JSON.stringify(status)}`
    );
  }
  const resultRef = parseOptionalField(outcomeObject, "resultRef");
  const attachedResultArtifact = parseOptionalField(
    outcomeObject,
    "attachedResultArtifact"
  );
  return constructFpDispatchOutcome({
    status,
    resultRef:
      resultRef === undefined || resultRef === null
        ? null
        : parseNonEmptyString(resultRef, `${label}.resultRef`),
    attachedResultArtifact:
      attachedResultArtifact === undefined || attachedResultArtifact === null
        ? null
        : parsePlainObject(
            attachedResultArtifact,
            `${label}.attachedResultArtifact`
          ),
    evidenceRefs: parseOptionalEvidenceRefs(outcomeObject, label),
    reason: parseOptionalReason(outcomeObject, label)
  });
}

export function admitFhAdmissionOutcome(
  input: unknown,
  label = "FhAdmissionOutcome"
): FhAdmissionOutcome {
  const outcomeObject = parsePlainObject(input, label);
  rejectForbiddenOutcomeAuthorityFields(outcomeObject, label);
  const kind = parseString(outcomeObject["kind"], `${label}.kind`);
  if (kind !== "fh_admission") {
    throw new TypeError(
      `${label}.kind: expected "fh_admission", got ${JSON.stringify(kind)}`
    );
  }
  const status = parseString(outcomeObject["status"], `${label}.status`);
  if (status !== "escalated" && status !== "blocked") {
    throw new TypeError(
      `${label}.status: expected escalated or blocked, got ${JSON.stringify(status)}`
    );
  }
  return constructFhAdmissionOutcome({
    status,
    evidenceRefs: parseOptionalEvidenceRefs(outcomeObject, label),
    reason: parseOptionalReason(outcomeObject, label)
  });
}

export function admitConsequenceProjectionOutcome(
  input: unknown,
  label = "ConsequenceProjectionOutcome"
): ConsequenceProjectionOutcome {
  const outcomeObject = parsePlainObject(input, label);
  rejectForbiddenOutcomeAuthorityFields(outcomeObject, label);
  const kind = parseString(outcomeObject["kind"], `${label}.kind`);
  if (kind !== "consequence_projection") {
    throw new TypeError(
      `${label}.kind: expected "consequence_projection", got ${JSON.stringify(kind)}`
    );
  }
  const status = parseString(outcomeObject["status"], `${label}.status`);
  if (status !== "projected" && status !== "blocked") {
    throw new TypeError(
      `${label}.status: expected projected or blocked, got ${JSON.stringify(status)}`
    );
  }
  const consequenceRef = parseOptionalField(outcomeObject, "consequenceRef");
  const traversalAction = parseOptionalField(outcomeObject, "traversalAction");
  return constructConsequenceProjectionOutcome({
    status,
    consequenceRef:
      consequenceRef === undefined || consequenceRef === null
        ? null
        : parseNonEmptyString(consequenceRef, `${label}.consequenceRef`),
    domainReadModelRefs: parseStringArray(
      parseOptionalField(outcomeObject, "domainReadModelRefs") ?? [],
      `${label}.domainReadModelRefs`
    ),
    traversalAction:
      traversalAction === undefined || traversalAction === null
        ? null
        : admitConsequenceTraversalAction(
            traversalAction,
            `${label}.traversalAction`
          ),
    evidenceRefs: parseOptionalEvidenceRefs(outcomeObject, label),
    reason: parseOptionalReason(outcomeObject, label)
  });
}

const runtimeEventSinkContract = constructEnginePluginContract({
  ref: "plugin://abg/runtime-event-sink",
  pluginKind: "runtime_event_sink",
  authority: "sink",
  inputCarrier: "RuntimeEvent",
  outputCarrier: "void",
  eventAuthority: "sink_receive_only"
});

const fdEvaluatorContract = constructEnginePluginContract({
  ref: "plugin://abg/fd-evaluator",
  pluginKind: "fd_evaluator",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FdEvaluationOutcome"
});

const fpEvaluatorContract = constructEnginePluginContract({
  ref: "plugin://abg/fp-evaluator",
  pluginKind: "fp_evaluator",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FpEvaluationOutcome"
});

const fpDispatchContract = constructEnginePluginContract({
  ref: "plugin://abg/fp-dispatch",
  pluginKind: "fp_dispatch",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FpDispatchOutcome"
});

const fhAdmissionContract = constructEnginePluginContract({
  ref: "plugin://abg/fh-admission",
  pluginKind: "fh_admission",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "FhAdmissionOutcome"
});

const consequenceProjectionContract = constructEnginePluginContract({
  ref: "plugin://abg/consequence-projection",
  pluginKind: "consequence_projection",
  authority: "effect_plugin",
  inputCarrier: "EnginePluginInput",
  outputCarrier: "ConsequenceProjectionOutcome"
});

const inventoryInputs = Object.freeze([
  {
    contract: runtimeEventSinkContract,
    engineOwnedLaw: "ABG emits admitted runtime events and preserves append-only truth.",
    pluginOwnedScope: "Receive event effects such as append, stream, mirror, or observe.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.runtime_event_sink.positive",
    negativeProof: "t072-m03-plugin-contract-negative.runtime_event_sink.authority",
    distinctAuthorityReason: "Sink receives events after ABG admission; it does not produce plugin outcomes."
  },
  {
    contract: fdEvaluatorContract,
    engineOwnedLaw: "ABG selects the vector, admits F_D output, emits evaluation/closure, and repeats.",
    pluginOwnedScope: "Run deterministic checks and return accepted or blocked.",
    positiveProof: "test_m03_engine_owned_iterate_runner_unit.fd_evaluator.positive",
    negativeProof: "t072-m03-plugin-contract-negative.fd_evaluator.authority",
    distinctAuthorityReason: null
  },
  {
    contract: fpEvaluatorContract,
    engineOwnedLaw: "ABG selects evaluate.C/F_P, admits findings, writes evaluation ledgers, folds assurance, and preserves traversal authority.",
    pluginOwnedScope: "Produce probabilistic evaluation findings over admitted transform output and current ledgers.",
    positiveProof: "test_t144_abg_probabilistic_monad_plugin_boundary.fp_evaluator.positive",
    negativeProof: "test_t144_abg_probabilistic_monad_plugin_boundary.fp_evaluator.authority",
    distinctAuthorityReason: null
  },
  {
    contract: fpDispatchContract,
    engineOwnedLaw: "ABG selects the vector, binds one actor invocation to one F_P dispatch attempt, and publishes runtime truth.",
    pluginOwnedScope: "Run or bind the external probabilistic worker effect for the supplied invocation.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.fp_dispatch.positive",
    negativeProof: "t072-m03-plugin-contract-negative.fp_dispatch.authority",
    distinctAuthorityReason: null
  },
  {
    contract: fhAdmissionContract,
    engineOwnedLaw: "ABG selects the vector and publishes human-gate-required runtime truth.",
    pluginOwnedScope: "Bind the human approval or escalation surface.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.fh_admission.positive",
    negativeProof: "t072-m03-plugin-contract-negative.fh_admission.authority",
    distinctAuthorityReason: null
  },
  {
    contract: consequenceProjectionContract,
    engineOwnedLaw: "ABG invokes consequence projection after admitted transform/evaluation facts and before returning traversal truth.",
    pluginOwnedScope: "Project product read-model refs over ABG-admitted facts without mutating runtime truth.",
    positiveProof: "test_t144_abg_probabilistic_monad_plugin_boundary.consequence_projection.positive",
    negativeProof: "test_t144_abg_probabilistic_monad_plugin_boundary.consequence_projection.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/result-assessment",
      pluginKind: "result_assessment",
      authority: "effect_plugin",
      inputCarrier: "ResultArtifact",
      outputCarrier: "ResultIngestOutcome"
    }),
    engineOwnedLaw: "ABG admits result truth before it can affect replay-derived closure.",
    pluginOwnedScope: "Parse or fetch external result artifacts.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.result_assessment.positive",
    negativeProof: "t072-m03-plugin-contract-negative.result_assessment.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/event-ingress",
      pluginKind: "event_ingress",
      authority: "provider",
      inputCarrier: "ExternalEventEnvelope",
      outputCarrier: "RuntimeEventCandidate"
    }),
    engineOwnedLaw: "ABG admission decides whether external event candidates enter runtime truth.",
    pluginOwnedScope: "Provide external event envelopes.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.event_ingress.positive",
    negativeProof: "t072-m03-plugin-contract-negative.event_ingress.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/continuation-repair",
      pluginKind: "continuation_repair",
      authority: "effect_plugin",
      inputCarrier: "RetryRepairDecision",
      outputCarrier: "RetryRepairPluginOutcome"
    }),
    engineOwnedLaw: "ABG owns retry budget, continuation termination, reopen identity, and repair events.",
    pluginOwnedScope: "Perform external repair effects requested by ABG decision carriers.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.continuation_repair.positive",
    negativeProof: "t072-m03-plugin-contract-negative.continuation_repair.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/policy-provider",
      pluginKind: "policy_provider",
      authority: "provider",
      inputCarrier: "StartIntent",
      outputCarrier: "ResolvedPolicyIdentity"
    }),
    engineOwnedLaw: "ABG admits resolved policy before it can bind traversal regime.",
    pluginOwnedScope: "Provide policy bundles from domain configuration or runtime substrate.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.policy_provider.positive",
    negativeProof: "t072-m03-plugin-contract-negative.policy_provider.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-authority-snapshot-provider",
      pluginKind: "assurance_authority_snapshot_provider",
      authority: "provider",
      inputCarrier: "AssuranceScopeRef",
      outputCarrier: "AssuranceAuthoritySnapshot"
    }),
    engineOwnedLaw: "ABG admits authority/input snapshots and owns digest-bound assurance projection.",
    pluginOwnedScope: "Provide current authority and input snapshot refs for one assurance scope.",
    positiveProof: "test_t092_total_assurance_projection_unit.authority_snapshot_provider.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.authority_snapshot_provider.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-evidence-adapter",
      pluginKind: "assurance_evidence_adapter",
      authority: "provider",
      inputCarrier: "TraversalEnvelopeView",
      outputCarrier: "AssuranceEvidenceRow"
    }),
    engineOwnedLaw: "ABG admits evidence rows from current runtime truth and owns row classification.",
    pluginOwnedScope: "Adapt admitted runtime facts into evidence candidates.",
    positiveProof: "test_t092_total_assurance_projection_unit.evidence_adapter.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.evidence_adapter.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-ambiguity-classifier",
      pluginKind: "assurance_ambiguity_classifier",
      authority: "provider",
      inputCarrier: "AssuranceAuthoritySnapshot + AssuranceEvidenceRow",
      outputCarrier: "AssuranceAmbiguityRow"
    }),
    engineOwnedLaw: "ABG owns the closed ambiguity vocabulary, total row projection, and precedence.",
    pluginOwnedScope: "Propose domain-aware classification for admitted authority/evidence inputs.",
    positiveProof: "test_t092_total_assurance_projection_unit.ambiguity_classifier.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.ambiguity_classifier.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-closure-policy-provider",
      pluginKind: "assurance_closure_policy_provider",
      authority: "provider",
      inputCarrier: "AssuranceProjection",
      outputCarrier: "AssuranceClosurePolicy"
    }),
    engineOwnedLaw: "ABG folds assurance rows into one closure decision.",
    pluginOwnedScope: "Provide retry, reprice, block, and defer policy values.",
    positiveProof: "test_t092_total_assurance_projection_unit.closure_policy_provider.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.closure_policy_provider.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/assurance-gain-function-adapter",
      pluginKind: "assurance_gain_function_adapter",
      authority: "provider",
      inputCarrier: "AssuranceEvidenceRow",
      outputCarrier: "GainSignal"
    }),
    engineOwnedLaw: "ABG admits gain signals as evidence inputs without letting them close scopes.",
    pluginOwnedScope: "Provide downstream domain gain signals or scoring.",
    positiveProof: "test_t092_total_assurance_projection_unit.gain_function_adapter.positive",
    negativeProof: "test_t092_total_assurance_projection_unit.gain_function_adapter.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/runtime-identity-provider",
      pluginKind: "runtime_identity_provider",
      authority: "provider",
      inputCarrier: "StartIntent",
      outputCarrier: "ResolvedRuntimeIdentity"
    }),
    engineOwnedLaw: "ABG admits runtime identity before event, projection, or dispatch binding.",
    pluginOwnedScope: "Provide worker/backend/build identity from runtime substrate.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.runtime_identity_provider.positive",
    negativeProof: "t072-m03-plugin-contract-negative.runtime_identity_provider.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/operator-asset-resolver",
      pluginKind: "operator_asset_resolver",
      authority: "resolver",
      inputCarrier: "OperatorAssetQueryContract",
      outputCarrier: "OperatorAssetResolution"
    }),
    engineOwnedLaw: "ABG consumes admitted asset resolution without learning domain asset layout.",
    pluginOwnedScope: "Resolve operator assets from a domain-owned store or projection.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.operator_asset_resolver.positive",
    negativeProof: "t072-m03-plugin-contract-negative.operator_asset_resolver.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/context-resolver",
      pluginKind: "context_resolver",
      authority: "resolver",
      inputCarrier: "ContextRef",
      outputCarrier: "ResolvedContext"
    }),
    engineOwnedLaw: "ABG consumes admitted context snapshots and keeps traversal authority.",
    pluginOwnedScope: "Resolve workspace, registry, event, or external context references.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.context_resolver.positive",
    negativeProof: "t072-m03-plugin-contract-negative.context_resolver.authority",
    distinctAuthorityReason: null
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/projection-consumer",
      pluginKind: "projection_consumer",
      authority: "projection_consumer",
      inputCarrier: "RuntimeAggregateProjection",
      outputCarrier: "ProjectionReadModel",
      eventAuthority: "none"
    }),
    engineOwnedLaw: "ABG projections are replay-derived read models.",
    pluginOwnedScope: "Consume projections for gaps, live status, dashboards, or reporting.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.projection_consumer.positive",
    negativeProof: "t072-m03-plugin-contract-negative.projection_consumer.authority",
    distinctAuthorityReason: "Projection consumers are read-model observers, not effect plugins."
  },
  {
    contract: constructEnginePluginContract({
      ref: "plugin://abg/hook-ref",
      pluginKind: "hook_ref",
      authority: "declaration_ref",
      inputCarrier: "GtlHookRef",
      outputCarrier: "EnginePluginContract",
      eventAuthority: "none"
    }),
    engineOwnedLaw: "ABG treats GTL hook references as declarations until resolved through a contract.",
    pluginOwnedScope: "Declare a hook target without executable hidden controller authority.",
    positiveProof: "test_m03_plugin_contract_inventory_unit.hook_ref.positive",
    negativeProof: "t072-m03-plugin-contract-negative.hook_ref.authority",
    distinctAuthorityReason: "GTL hook refs are declarations, not runtime implementation callbacks."
  }
] as const);

function runtimeBindingStatusFor(
  pluginKind: EnginePluginKind
): EnginePluginRuntimeBindingStatus {
  switch (pluginKind) {
    case "runtime_event_sink":
    case "fd_evaluator":
    case "fp_evaluator":
    case "fp_dispatch":
    case "fh_admission":
    case "consequence_projection":
      return "runner_consumed";
    case "result_assessment":
    case "event_ingress":
    case "policy_provider":
    case "runtime_identity_provider":
    case "operator_asset_resolver":
      return "public_runtime_consumed";
    case "assurance_authority_snapshot_provider":
    case "assurance_evidence_adapter":
    case "assurance_ambiguity_classifier":
    case "assurance_closure_policy_provider":
    case "assurance_gain_function_adapter":
      return "assurance_consumed";
    case "continuation_repair":
      return "engine_law_consumed";
    case "projection_consumer":
      return "read_model_consumed";
    case "context_resolver":
    case "hook_ref":
      return "declarative_contract";
    default: {
      const exhaustive: never = pluginKind;
      throw new TypeError(`Unsupported engine plugin kind ${JSON.stringify(exhaustive)}`);
    }
  }
}

function proofScopeFor(pluginKind: EnginePluginKind): string {
  const status = runtimeBindingStatusFor(pluginKind);
  switch (status) {
    case "runner_consumed":
      return "runner consumer proof";
    case "public_runtime_consumed":
      return "public runtime consumer proof";
    case "assurance_consumed":
      return "assurance projection provider proof";
    case "engine_law_consumed":
      return "engine-owned law proof; extension effects remain downstream";
    case "read_model_consumed":
      return "replay-derived read-model consumer proof";
    case "declarative_contract":
      return "declarative contract proof; no executable plugin authority in current TS surface";
    default: {
      const exhaustive: never = status;
      throw new TypeError(
        `Unsupported engine plugin runtime binding status ${JSON.stringify(exhaustive)}`
      );
    }
  }
}

const inventoryEntries: readonly EnginePluginInventoryEntry[] = Object.freeze(
  inventoryInputs.map((entry) =>
    Object.freeze({
      kind: "engine_plugin_inventory_entry",
      contract: entry.contract,
      runtimeBindingStatus: runtimeBindingStatusFor(entry.contract.pluginKind),
      proofScope: proofScopeFor(entry.contract.pluginKind),
      engineOwnedLaw: entry.engineOwnedLaw,
      pluginOwnedScope: entry.pluginOwnedScope,
      positiveProof: entry.positiveProof,
      negativeProof: entry.negativeProof,
      collapseFamily: entry.contract.authority,
      distinctAuthorityReason: entry.distinctAuthorityReason
    })
  )
);

export function enginePluginInventory(): readonly EnginePluginInventoryEntry[] {
  return inventoryEntries;
}

// T-195 P0-2: F_D evaluation is an EXTENSION hook — absence means "no
// additional mechanical checks declared", which is lawful, but the
// vacuity must be replay-visible, never silent.
export const defaultFdEvaluatorPlugin: FdEvaluatorPlugin = Object.freeze({
  contract: fdEvaluatorContract,
  evaluate: (input: EnginePluginInput): FdEvaluationOutcome =>
    constructFdEvaluationOutcome({
      status: "accepted",
      evidenceRefs: [
        "fd-evaluator://abg/default/no-declared-checks",
        input.sourceProjectionRef
      ]
    })
});

export const defaultFpEvaluatorPlugin: FpEvaluatorPlugin = Object.freeze({
  contract: fpEvaluatorContract,
  evaluate: (input: EnginePluginInput): FpEvaluationOutcome =>
    constructFpEvaluationOutcome({
      status: "evaluated",
      findings: [
        constructFpEvaluationFinding({
          findingRef: `finding:fp_evaluation:${stableSha256Digest({
            basisId: input.basisId,
            vectorIndex: input.vectorIndex,
            edge: input.edge,
            sourceProjectionRef: input.sourceProjectionRef
          })}`,
          evaluatorRef: input.contract.ref,
          gainReportRef: `gain:fp_evaluation:${input.basisId}:${input.vectorIndex}`,
          metricRefs: [`metric:fp_evaluation:${input.basisId}:${input.vectorIndex}`],
          closeDisposition: "close",
          evidenceRefs: [input.sourceProjectionRef],
          authorityRefs: Object.freeze([
            ...new Set([
              ...input.expectedAssessmentIds,
              `authority:fp_evaluation:${input.basisId}:${input.vectorIndex}`
            ])
          ]),
          compositionContributionRef:
            input.selectedRegimeBindingRef ?? input.selectedCompositionRef,
          compositionRef: input.selectedCompositionRef,
          compositionDigest: input.selectedCompositionDigest
        })
      ],
      evidenceRefs: [input.sourceProjectionRef]
    })
});

// T-195 P0-3: the ONLY event kinds a workspace plugin may emit through
// the handed sink (sink_receive_only, enforced at the CLI seam) — the
// transport execution envelope. Core truth enters through outcomes.
export const TRANSPORT_SINK_EVENT_KIND_VALUES = Object.freeze([
  "actor_process_started",
  "actor_process_start_failed",
  "actor_process_stream_observed",
  "actor_process_heartbeat",
  "actor_process_timeout",
  "actor_process_signal_sent",
  "actor_process_exited",
  "runtime_activity_probe_observed",
  "runtime_external_interruption_observed"
] as const);

export const missingFpEvaluatorPlugin: FpEvaluatorPlugin = Object.freeze({
  contract: fpEvaluatorContract,
  evaluate: (input: EnginePluginInput): FpEvaluationOutcome =>
    constructFpEvaluationOutcome({
      status: "blocked",
      reason: [
        "missing fp_evaluator plugin for selected evaluate.C/F_P",
        input.selectedRegimeBindingRef ?? input.selectedCompositionRef
      ].join(": ")
    })
});

// T-195 P0-2 adjudication (bisect-verified): "dispatched" here does NOT
// claim completed work — it records that the dispatch REQUEST stands and
// the run halts at the lawful dispatch-pending stop (public outcome
// dispatch_required). resultRef names the request, not result truth.
export const defaultFpDispatchPlugin: FpDispatchPlugin = Object.freeze({
  contract: fpDispatchContract,
  dispatch: (input: EnginePluginInput): FpDispatchOutcome =>
    constructFpDispatchOutcome({
      status: "dispatched",
      resultRef: `result:fp_dispatch:${JSON.stringify({
        basisId: input.basisId,
        edge: input.edge
      })}`,
      evidenceRefs: [input.sourceProjectionRef]
    })
});

export const defaultFhAdmissionPlugin: FhAdmissionPlugin = Object.freeze({
  contract: fhAdmissionContract,
  admit: (input: EnginePluginInput): FhAdmissionOutcome =>
    constructFhAdmissionOutcome({
      status: "escalated",
      reason: "human gate required",
      evidenceRefs: [input.sourceProjectionRef]
    })
});

// T-195 P0-2: the consequence stage is part of the MECHANICAL lane — the
// default is the engine's own identity projection (not a claim of
// external work), with the default's use replay-visible.
export const defaultConsequenceProjectionPlugin: ConsequenceProjectionPlugin =
  Object.freeze({
    contract: consequenceProjectionContract,
    project: (input: EnginePluginInput): ConsequenceProjectionOutcome =>
      constructConsequenceProjectionOutcome({
        status: "projected",
        consequenceRef: `consequence:${JSON.stringify({
          compositionRef: input.selectedCompositionRef,
          vectorIndex: input.vectorIndex,
          edge: input.edge
        })}`,
        domainReadModelRefs: [input.sourceProjectionRef],
        evidenceRefs: [
          "consequence-projection://abg/default/identity-projection",
          input.sourceProjectionRef
        ]
      })
  });
