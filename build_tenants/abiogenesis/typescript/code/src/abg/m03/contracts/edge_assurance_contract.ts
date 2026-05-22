// Implements: T-131
// Implements: REQ-L-GTL3-GRAPHVECTOR
// Implements: REQ-L-GTL3-HOOKS
// Implements: REQ-R-ABG3-ASSURANCE
// Implements: REQ-R-ABG3-PAYLOAD

import type {
  GraphFunction,
  GraphVector,
  HookRef,
  SerializedAttrs,
  SerializedAttrValue
} from "../../../gtl/m01/contracts/carriers.js";
import type {
  Job,
  Role
} from "../../../gtl/m02/contracts/carriers.js";
import {
  parseNonEmptyString,
  parseOptionalField,
  parsePlainObject,
  parseString,
  parseStringArray
} from "../../../shared/validation/primitives.js";
import {
  assertNonEmptyString,
  freezeStringArray
} from "./runtime_support.js";
import {
  stableJson,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import type {
  HookActionRecord,
  HookFindingAdmission
} from "./hook_actions.js";
import { assertHookFindingAdmissionMatchesAction } from "./hook_actions.js";
import type {
  AssuranceClosureDecision,
  AssuranceProjection
} from "./assurance.js";

export const EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY =
  "abg.edge_assurance_contract" as const;

export const EDGE_ASSURANCE_CLOSE_DISPOSITION_VALUES = Object.freeze([
  "close",
  "retry",
  "repair",
  "re_enter",
  "reprice",
  "block",
  "yield",
  "qualified_defer",
  "human_assurance_required"
] as const);

export type EdgeAssuranceCloseDisposition =
  (typeof EDGE_ASSURANCE_CLOSE_DISPOSITION_VALUES)[number];

export type EdgeAssuranceContractSource =
  | "graph_vector_declarations"
  | "graph_function_declarations"
  | "job_policy_hooks"
  | "role_policy_hooks"
  | "module_policy_hooks"
  | "abg_defaults";

export interface EdgeAssuranceContract {
  readonly kind: "edge_assurance_contract";
  readonly hookRef: string;
  readonly targetOutcomeRef: string;
  readonly authoritySurfaceRefs: readonly string[];
  readonly targetObligationBindingRefs: readonly string[];
  readonly transformFpContractRef: string;
  readonly evalFpContractRef: string;
  readonly evalPromptInputContractRef: string;
  readonly evalExpectedOutputContractRef: string;
  readonly admissibleEvidencePolicyRef: string;
  readonly admittedEvidenceKindRefs: readonly string[];
  readonly gainReportSchemaRef: string;
  readonly metricFunctionRef: string;
  readonly closeDecisionSchemaRef: string;
  readonly residualPressureSchemaRef: string;
  readonly continuationSchemaRef: string;
  readonly compositionLawRef: string;
  readonly cheapStructuralCheckRefs: readonly string[];
  readonly policyRefs: readonly string[];
  readonly configDigest: string;
}

export interface EdgeAssuranceContractSelection {
  readonly kind: "edge_assurance_contract_selection";
  readonly selectionRef: string;
  readonly source: EdgeAssuranceContractSource;
  readonly sourceRef: string;
  readonly attrKey: string | null;
  readonly contract: EdgeAssuranceContract;
  readonly defaultKey: string | null;
}

export interface EdgeAssuranceAbsentiaResolution {
  readonly kind: "edge_assurance_absentia_resolution";
  readonly disposition: "fh_required";
  readonly reason: "edge_assurance_contract_absent";
  readonly source: "fh_absentia";
  readonly edgeRef: string;
  readonly requiredHumanActionRefs: readonly string[];
  readonly replayVisibilityRef: string;
}

export const EDGE_ASSURANCE_FH_ABSENTIA_ACTION_REFS = Object.freeze([
  "fh://edge-assurance/declare-close",
  "fh://edge-assurance/declare-continuation",
  "fh://edge-assurance/direct-worksite-transform"
] as const);

export type EdgeAssuranceResolution =
  | EdgeAssuranceContractSelection
  | EdgeAssuranceAbsentiaResolution;

export interface EdgeAssuranceDefaultContract {
  readonly sourceRef: string;
  readonly contract: EdgeAssuranceContract;
  readonly defaultKey?: string | null | undefined;
}

export interface EdgeAssuranceModulePolicySource {
  readonly name: string;
  readonly policyHooks: SerializedAttrs;
}

export interface EdgeAssuranceContractResolutionInput {
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly job?: Job | null | undefined;
  readonly roles?: readonly Role[] | undefined;
  readonly module?: EdgeAssuranceModulePolicySource | null | undefined;
  readonly defaults?: EdgeAssuranceDefaultContract | null | undefined;
}

export interface FpEdgeAssuranceEvalFinding {
  readonly kind: "fp_edge_assurance_eval_finding";
  readonly findingRef: string;
  readonly hookActionRef: string;
  readonly edgeAssuranceSelectionRef: string;
  readonly evalFpContractRef: string;
  readonly gainReportRef: string;
  readonly metricRefs: readonly string[];
  readonly closeDisposition: EdgeAssuranceCloseDisposition;
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly compositionContributionRef: string;
  readonly reason: string | null;
}

export interface EdgeAssuranceEvaluationProjection {
  readonly kind: "edge_assurance_evaluation_projection";
  readonly projectionRef: string;
  readonly edgeAssuranceSelectionRef: string;
  readonly hookActionRef: string;
  readonly admissionRef: string;
  readonly findingRef: string;
  readonly gainReportRef: string;
  readonly metricRefs: readonly string[];
  readonly proposedCloseDisposition: EdgeAssuranceCloseDisposition;
  readonly assuranceClosureDecision: AssuranceClosureDecision["decision"];
  readonly assuranceProjectionRef: string;
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly nextActionBasisRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly compositionContributionRef: string;
}

export interface EdgeAssuranceEvaluationReadModel {
  readonly kind: "edge_assurance_evaluation_read_model";
  readonly projectionRef: string;
  readonly edgeAssuranceSelectionRef: string;
  readonly findingRef: string;
  readonly gainReportRef: string;
  readonly metricRefs: readonly string[];
  readonly proposedCloseDisposition: EdgeAssuranceCloseDisposition;
  readonly assuranceClosureDecision: AssuranceClosureDecision["decision"];
  readonly residualPressureRefs: readonly string[];
  readonly continuationRefs: readonly string[];
  readonly nextActionBasisRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly compositionContributionRef: string;
}

interface HookMatch {
  readonly source: Exclude<EdgeAssuranceContractSource, "abg_defaults">;
  readonly sourceRef: string;
  readonly attrKey: typeof EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY;
  readonly hookRef: HookRef;
}

const REQUIRED_LIST_FIELDS = Object.freeze([
  "authority_surface_refs",
  "target_obligation_binding_refs",
  "admitted_evidence_kind_refs"
] as const);

const FORBIDDEN_FP_EVAL_FINDING_AUTHORITY_FIELDS = Object.freeze([
  "runtimeEvents",
  "events",
  "nextVectorIndex",
  "closedVectorIndexes",
  "transition",
  "closureDecision",
  "closureKind",
  "edgeConverged",
  "ledger",
  "projection",
  "directLedgerRows",
  "mayCloseTraversal",
  "mayEmitRuntimeEvents",
  "maySelectNextVector"
] as const);

const digestForValue = stableSha256Digest;

function canonicalSerializedAttrs(attrs: SerializedAttrs): SerializedAttrs {
  return Object.freeze({
    entries: Object.freeze(
      [...attrs.entries].sort((left, right) => {
        const keyOrder = left.key.localeCompare(right.key);
        if (keyOrder !== 0) {
          return keyOrder;
        }
        return stableJson(left.value).localeCompare(stableJson(right.value));
      })
    )
  });
}

function attrValueForKey(
  attrs: SerializedAttrs,
  key: string
): SerializedAttrValue | null {
  const matching = attrs.entries.filter((entry) => entry.key === key);
  if (matching.length > 1) {
    throw new TypeError(`Duplicate GTL attr ${JSON.stringify(key)}`);
  }
  return matching[0]?.value ?? null;
}

function configScalarString(
  attrs: SerializedAttrs,
  key: string,
  label: string
): string {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    throw new TypeError(`${label}.${key}: required`);
  }
  if (value.kind !== "scalar" || typeof value.value !== "string") {
    throw new TypeError(`${label}.${key}: expected scalar string`);
  }
  assertNonEmptyString(value.value, `${label}.${key}`);
  return value.value;
}

function freezeUniqueStringArray(
  values: readonly string[],
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  if (values.length === 0 && options?.allowEmpty !== true) {
    throw new TypeError(`${label}: expected at least one ref`);
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    assertNonEmptyString(value, label);
    if (seen.has(value)) {
      throw new TypeError(`${label}: duplicate ref ${JSON.stringify(value)}`);
    }
    seen.add(value);
    result.push(value);
  }
  return freezeStringArray(result);
}

function configStringList(
  attrs: SerializedAttrs,
  key: string,
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    throw new TypeError(`${label}.${key}: required`);
  }
  if (value.kind !== "string_list") {
    throw new TypeError(`${label}.${key}: expected string_list`);
  }
  return freezeUniqueStringArray(value.value, `${label}.${key}`, options);
}

function configOptionalStringList(
  attrs: SerializedAttrs,
  key: string,
  label: string
): readonly string[] {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    return Object.freeze([]);
  }
  if (value.kind !== "string_list") {
    throw new TypeError(`${label}.${key}: expected string_list`);
  }
  return freezeUniqueStringArray(value.value, `${label}.${key}`, {
    allowEmpty: true
  });
}

function edgeAssuranceHookMatch(input: {
  readonly attrs: SerializedAttrs;
  readonly source: HookMatch["source"];
  readonly sourceRef: string;
}): HookMatch | null {
  const value = attrValueForKey(
    input.attrs,
    EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY
  );
  if (value === null) {
    return null;
  }
  if (value.kind !== "hook_ref") {
    throw new TypeError("Edge assurance contract qualifier must be a hook_ref");
  }
  assertNonEmptyString(value.value.ref, "EdgeAssuranceContract.HookRef.ref");
  return Object.freeze({
    source: input.source,
    sourceRef: input.sourceRef,
    attrKey: EDGE_ASSURANCE_CONTRACT_DECLARATION_KEY,
    hookRef: value.value
  });
}

function singleRoleHookMatch(input: {
  readonly roles: readonly Role[];
}): HookMatch | null {
  const matches: HookMatch[] = [];
  for (const role of input.roles) {
    const match = edgeAssuranceHookMatch({
      attrs: role.policyHooks,
      source: "role_policy_hooks",
      sourceRef: role.id
    });
    if (match !== null) {
      matches.push(match);
    }
  }
  if (matches.length > 1) {
    throw new TypeError(
      "Multiple role edge assurance defaults require explicit resolved-policy choice"
    );
  }
  return matches[0] ?? null;
}

function contractFromHookRef(hookRef: HookRef): EdgeAssuranceContract {
  const config = hookRef.config;
  for (const field of REQUIRED_LIST_FIELDS) {
    configStringList(config, field, "EdgeAssuranceContract");
  }
  const contract = {
    kind: "edge_assurance_contract" as const,
    hookRef: hookRef.ref,
    targetOutcomeRef: configScalarString(
      config,
      "target_outcome_ref",
      "EdgeAssuranceContract"
    ),
    authoritySurfaceRefs: configStringList(
      config,
      "authority_surface_refs",
      "EdgeAssuranceContract"
    ),
    targetObligationBindingRefs: configStringList(
      config,
      "target_obligation_binding_refs",
      "EdgeAssuranceContract"
    ),
    transformFpContractRef: configScalarString(
      config,
      "transform_fp_contract_ref",
      "EdgeAssuranceContract"
    ),
    evalFpContractRef: configScalarString(
      config,
      "eval_fp_contract_ref",
      "EdgeAssuranceContract"
    ),
    evalPromptInputContractRef: configScalarString(
      config,
      "eval_prompt_input_contract_ref",
      "EdgeAssuranceContract"
    ),
    evalExpectedOutputContractRef: configScalarString(
      config,
      "eval_expected_output_contract_ref",
      "EdgeAssuranceContract"
    ),
    admissibleEvidencePolicyRef: configScalarString(
      config,
      "admissible_evidence_policy_ref",
      "EdgeAssuranceContract"
    ),
    admittedEvidenceKindRefs: configStringList(
      config,
      "admitted_evidence_kind_refs",
      "EdgeAssuranceContract"
    ),
    gainReportSchemaRef: configScalarString(
      config,
      "gain_report_schema_ref",
      "EdgeAssuranceContract"
    ),
    metricFunctionRef: configScalarString(
      config,
      "metric_function_ref",
      "EdgeAssuranceContract"
    ),
    closeDecisionSchemaRef: configScalarString(
      config,
      "close_decision_schema_ref",
      "EdgeAssuranceContract"
    ),
    residualPressureSchemaRef: configScalarString(
      config,
      "residual_pressure_schema_ref",
      "EdgeAssuranceContract"
    ),
    continuationSchemaRef: configScalarString(
      config,
      "continuation_schema_ref",
      "EdgeAssuranceContract"
    ),
    compositionLawRef: configScalarString(
      config,
      "composition_law_ref",
      "EdgeAssuranceContract"
    ),
    cheapStructuralCheckRefs: configOptionalStringList(
      config,
      "cheap_structural_check_refs",
      "EdgeAssuranceContract"
    ),
    policyRefs: configOptionalStringList(
      config,
      "policy_refs",
      "EdgeAssuranceContract"
    ),
    configDigest: digestForValue(canonicalSerializedAttrs(config))
  } satisfies EdgeAssuranceContract;
  return Object.freeze(contract);
}

function selectionRef(input: {
  readonly source: EdgeAssuranceContractSource;
  readonly sourceRef: string;
  readonly hookRef: string;
}): string {
  return `edge-assurance-contract-selection:${stableJson(input)}`;
}

function contractSelection(input: {
  readonly source: EdgeAssuranceContractSource;
  readonly sourceRef: string;
  readonly attrKey: string | null;
  readonly contract: EdgeAssuranceContract;
  readonly defaultKey?: string | null | undefined;
}): EdgeAssuranceContractSelection {
  return Object.freeze({
    kind: "edge_assurance_contract_selection",
    selectionRef: selectionRef({
      source: input.source,
      sourceRef: input.sourceRef,
      hookRef: input.contract.hookRef
    }),
    source: input.source,
    sourceRef: input.sourceRef,
    attrKey: input.attrKey,
    contract: input.contract,
    defaultKey: input.defaultKey ?? null
  });
}

function absentiaResolution(edgeRef: string): EdgeAssuranceAbsentiaResolution {
  assertNonEmptyString(edgeRef, "EdgeAssuranceAbsentiaResolution.edgeRef");
  return Object.freeze({
    kind: "edge_assurance_absentia_resolution",
    disposition: "fh_required",
    reason: "edge_assurance_contract_absent",
    source: "fh_absentia",
    edgeRef,
    requiredHumanActionRefs: freezeStringArray(
      EDGE_ASSURANCE_FH_ABSENTIA_ACTION_REFS
    ),
    replayVisibilityRef: `edge-assurance-absentia:${edgeRef}`
  });
}

function resolveHookMatch(
  input: EdgeAssuranceContractResolutionInput
): HookMatch | null {
  const vectorMatch = edgeAssuranceHookMatch({
    attrs: input.vector.declarations,
    source: "graph_vector_declarations",
    sourceRef: input.vector.id
  });
  const graphFunctionMatch =
    vectorMatch ??
    edgeAssuranceHookMatch({
      attrs: input.graphFunction.declarations,
      source: "graph_function_declarations",
      sourceRef: input.graphFunction.id
    });
  const jobMatch =
    graphFunctionMatch ??
    (input.job === undefined || input.job === null
      ? null
      : edgeAssuranceHookMatch({
          attrs: input.job.policyHooks,
          source: "job_policy_hooks",
          sourceRef: input.job.id
        }));
  const roleMatch =
    jobMatch ??
    singleRoleHookMatch({
      roles: input.roles ?? input.job?.roles ?? Object.freeze([])
    });
  return (
    roleMatch ??
    (input.module === undefined || input.module === null
      ? null
      : edgeAssuranceHookMatch({
          attrs: input.module.policyHooks,
          source: "module_policy_hooks",
          sourceRef: input.module.name
        }))
  );
}

export function constructEdgeAssuranceContract(input: {
  readonly hookRef: string;
  readonly targetOutcomeRef: string;
  readonly authoritySurfaceRefs: readonly string[];
  readonly targetObligationBindingRefs: readonly string[];
  readonly transformFpContractRef: string;
  readonly evalFpContractRef: string;
  readonly evalPromptInputContractRef: string;
  readonly evalExpectedOutputContractRef: string;
  readonly admissibleEvidencePolicyRef: string;
  readonly admittedEvidenceKindRefs: readonly string[];
  readonly gainReportSchemaRef: string;
  readonly metricFunctionRef: string;
  readonly closeDecisionSchemaRef: string;
  readonly residualPressureSchemaRef: string;
  readonly continuationSchemaRef: string;
  readonly compositionLawRef: string;
  readonly cheapStructuralCheckRefs?: readonly string[] | undefined;
  readonly policyRefs?: readonly string[] | undefined;
}): EdgeAssuranceContract {
  const contract = {
    kind: "edge_assurance_contract" as const,
    hookRef: parseNonEmptyString(input.hookRef, "EdgeAssuranceContract.hookRef"),
    targetOutcomeRef: parseNonEmptyString(
      input.targetOutcomeRef,
      "EdgeAssuranceContract.targetOutcomeRef"
    ),
    authoritySurfaceRefs: freezeUniqueStringArray(
      input.authoritySurfaceRefs,
      "EdgeAssuranceContract.authoritySurfaceRefs"
    ),
    targetObligationBindingRefs: freezeUniqueStringArray(
      input.targetObligationBindingRefs,
      "EdgeAssuranceContract.targetObligationBindingRefs"
    ),
    transformFpContractRef: parseNonEmptyString(
      input.transformFpContractRef,
      "EdgeAssuranceContract.transformFpContractRef"
    ),
    evalFpContractRef: parseNonEmptyString(
      input.evalFpContractRef,
      "EdgeAssuranceContract.evalFpContractRef"
    ),
    evalPromptInputContractRef: parseNonEmptyString(
      input.evalPromptInputContractRef,
      "EdgeAssuranceContract.evalPromptInputContractRef"
    ),
    evalExpectedOutputContractRef: parseNonEmptyString(
      input.evalExpectedOutputContractRef,
      "EdgeAssuranceContract.evalExpectedOutputContractRef"
    ),
    admissibleEvidencePolicyRef: parseNonEmptyString(
      input.admissibleEvidencePolicyRef,
      "EdgeAssuranceContract.admissibleEvidencePolicyRef"
    ),
    admittedEvidenceKindRefs: freezeUniqueStringArray(
      input.admittedEvidenceKindRefs,
      "EdgeAssuranceContract.admittedEvidenceKindRefs"
    ),
    gainReportSchemaRef: parseNonEmptyString(
      input.gainReportSchemaRef,
      "EdgeAssuranceContract.gainReportSchemaRef"
    ),
    metricFunctionRef: parseNonEmptyString(
      input.metricFunctionRef,
      "EdgeAssuranceContract.metricFunctionRef"
    ),
    closeDecisionSchemaRef: parseNonEmptyString(
      input.closeDecisionSchemaRef,
      "EdgeAssuranceContract.closeDecisionSchemaRef"
    ),
    residualPressureSchemaRef: parseNonEmptyString(
      input.residualPressureSchemaRef,
      "EdgeAssuranceContract.residualPressureSchemaRef"
    ),
    continuationSchemaRef: parseNonEmptyString(
      input.continuationSchemaRef,
      "EdgeAssuranceContract.continuationSchemaRef"
    ),
    compositionLawRef: parseNonEmptyString(
      input.compositionLawRef,
      "EdgeAssuranceContract.compositionLawRef"
    ),
    cheapStructuralCheckRefs: freezeUniqueStringArray(
      input.cheapStructuralCheckRefs ?? Object.freeze([]),
      "EdgeAssuranceContract.cheapStructuralCheckRefs",
      { allowEmpty: true }
    ),
    policyRefs: freezeUniqueStringArray(
      input.policyRefs ?? Object.freeze([]),
      "EdgeAssuranceContract.policyRefs",
      { allowEmpty: true }
    ),
    configDigest: digestForValue({
      hookRef: input.hookRef,
      targetOutcomeRef: input.targetOutcomeRef,
      authoritySurfaceRefs: input.authoritySurfaceRefs,
      targetObligationBindingRefs: input.targetObligationBindingRefs,
      transformFpContractRef: input.transformFpContractRef,
      evalFpContractRef: input.evalFpContractRef,
      evalPromptInputContractRef: input.evalPromptInputContractRef,
      evalExpectedOutputContractRef: input.evalExpectedOutputContractRef,
      admissibleEvidencePolicyRef: input.admissibleEvidencePolicyRef,
      admittedEvidenceKindRefs: input.admittedEvidenceKindRefs,
      gainReportSchemaRef: input.gainReportSchemaRef,
      metricFunctionRef: input.metricFunctionRef,
      closeDecisionSchemaRef: input.closeDecisionSchemaRef,
      residualPressureSchemaRef: input.residualPressureSchemaRef,
      continuationSchemaRef: input.continuationSchemaRef,
      compositionLawRef: input.compositionLawRef,
      cheapStructuralCheckRefs: input.cheapStructuralCheckRefs ?? [],
      policyRefs: input.policyRefs ?? []
    })
  } satisfies EdgeAssuranceContract;
  return Object.freeze(contract);
}

export function tryResolveEdgeAssuranceContract(
  input: EdgeAssuranceContractResolutionInput
): EdgeAssuranceContractSelection | null {
  const match = resolveHookMatch(input);
  if (match !== null) {
    return contractSelection({
      source: match.source,
      sourceRef: match.sourceRef,
      attrKey: match.attrKey,
      contract: contractFromHookRef(match.hookRef)
    });
  }
  const defaults = input.defaults ?? null;
  if (defaults === null) {
    return null;
  }
  return contractSelection({
    source: "abg_defaults",
    sourceRef: defaults.sourceRef,
    attrKey: null,
    contract: defaults.contract,
    defaultKey: defaults.defaultKey ?? "edgeAssuranceContract"
  });
}

export function resolveEdgeAssuranceContract(
  input: EdgeAssuranceContractResolutionInput
): EdgeAssuranceResolution {
  const selection = tryResolveEdgeAssuranceContract(input);
  if (selection !== null) {
    return selection;
  }
  return absentiaResolution(input.vector.id);
}

function assertCloseDisposition(
  value: string,
  label: string
): EdgeAssuranceCloseDisposition {
  for (const candidate of EDGE_ASSURANCE_CLOSE_DISPOSITION_VALUES) {
    if (value === candidate) {
      return candidate;
    }
  }
  throw new TypeError(`${label}: expected edge assurance close disposition`);
}

function normalizeNullableString(
  value: unknown,
  label: string
): string | null {
  if (value === undefined || value === null) {
    return null;
  }
  return parseNonEmptyString(value, label);
}

function parseOptionalStringList(
  input: Readonly<Record<string, unknown>>,
  field: string,
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  const value = parseOptionalField(input, field);
  if (value === undefined) {
    return Object.freeze([]);
  }
  return freezeUniqueStringArray(
    parseStringArray(value, `${label}.${field}`),
    `${label}.${field}`,
    options
  );
}

function rejectForbiddenEvalFindingAuthorityFields(
  input: Readonly<Record<string, unknown>>,
  label: string
): void {
  for (const field of FORBIDDEN_FP_EVAL_FINDING_AUTHORITY_FIELDS) {
    if (Object.hasOwn(input, field)) {
      throw new TypeError(
        `${label}.${field}: F_P edge assurance eval finding cannot own engine authority`
      );
    }
  }
}

export function constructFpEdgeAssuranceEvalFinding(input: {
  readonly findingRef: string;
  readonly hookActionRef: string;
  readonly edgeAssuranceSelectionRef: string;
  readonly evalFpContractRef: string;
  readonly gainReportRef: string;
  readonly metricRefs: readonly string[];
  readonly closeDisposition: EdgeAssuranceCloseDisposition;
  readonly residualPressureRefs?: readonly string[] | undefined;
  readonly continuationRefs?: readonly string[] | undefined;
  readonly evidenceRefs: readonly string[];
  readonly authorityRefs: readonly string[];
  readonly compositionContributionRef: string;
  readonly reason?: string | null | undefined;
}): FpEdgeAssuranceEvalFinding {
  return Object.freeze({
    kind: "fp_edge_assurance_eval_finding",
    findingRef: parseNonEmptyString(
      input.findingRef,
      "FpEdgeAssuranceEvalFinding.findingRef"
    ),
    hookActionRef: parseNonEmptyString(
      input.hookActionRef,
      "FpEdgeAssuranceEvalFinding.hookActionRef"
    ),
    edgeAssuranceSelectionRef: parseNonEmptyString(
      input.edgeAssuranceSelectionRef,
      "FpEdgeAssuranceEvalFinding.edgeAssuranceSelectionRef"
    ),
    evalFpContractRef: parseNonEmptyString(
      input.evalFpContractRef,
      "FpEdgeAssuranceEvalFinding.evalFpContractRef"
    ),
    gainReportRef: parseNonEmptyString(
      input.gainReportRef,
      "FpEdgeAssuranceEvalFinding.gainReportRef"
    ),
    metricRefs: freezeUniqueStringArray(
      input.metricRefs,
      "FpEdgeAssuranceEvalFinding.metricRefs"
    ),
    closeDisposition: assertCloseDisposition(
      input.closeDisposition,
      "FpEdgeAssuranceEvalFinding.closeDisposition"
    ),
    residualPressureRefs: freezeUniqueStringArray(
      input.residualPressureRefs ?? Object.freeze([]),
      "FpEdgeAssuranceEvalFinding.residualPressureRefs",
      { allowEmpty: true }
    ),
    continuationRefs: freezeUniqueStringArray(
      input.continuationRefs ?? Object.freeze([]),
      "FpEdgeAssuranceEvalFinding.continuationRefs",
      { allowEmpty: true }
    ),
    evidenceRefs: freezeUniqueStringArray(
      input.evidenceRefs,
      "FpEdgeAssuranceEvalFinding.evidenceRefs"
    ),
    authorityRefs: freezeUniqueStringArray(
      input.authorityRefs,
      "FpEdgeAssuranceEvalFinding.authorityRefs"
    ),
    compositionContributionRef: parseNonEmptyString(
      input.compositionContributionRef,
      "FpEdgeAssuranceEvalFinding.compositionContributionRef"
    ),
    reason: normalizeNullableString(
      input.reason,
      "FpEdgeAssuranceEvalFinding.reason"
    )
  });
}

export function admitFpEdgeAssuranceEvalFinding(
  input: unknown,
  label = "FpEdgeAssuranceEvalFinding"
): FpEdgeAssuranceEvalFinding {
  const finding = parsePlainObject(input, label);
  rejectForbiddenEvalFindingAuthorityFields(finding, label);
  const kind = parseString(finding["kind"], `${label}.kind`);
  if (kind !== "fp_edge_assurance_eval_finding") {
    throw new TypeError(
      `${label}.kind: expected "fp_edge_assurance_eval_finding", got ${JSON.stringify(kind)}`
    );
  }
  return constructFpEdgeAssuranceEvalFinding({
    findingRef: parseNonEmptyString(finding["findingRef"], `${label}.findingRef`),
    hookActionRef: parseNonEmptyString(
      finding["hookActionRef"],
      `${label}.hookActionRef`
    ),
    edgeAssuranceSelectionRef: parseNonEmptyString(
      finding["edgeAssuranceSelectionRef"],
      `${label}.edgeAssuranceSelectionRef`
    ),
    evalFpContractRef: parseNonEmptyString(
      finding["evalFpContractRef"],
      `${label}.evalFpContractRef`
    ),
    gainReportRef: parseNonEmptyString(
      finding["gainReportRef"],
      `${label}.gainReportRef`
    ),
    metricRefs: parseStringArray(finding["metricRefs"], `${label}.metricRefs`),
    closeDisposition: assertCloseDisposition(
      parseString(finding["closeDisposition"], `${label}.closeDisposition`),
      `${label}.closeDisposition`
    ),
    residualPressureRefs: parseOptionalStringList(
      finding,
      "residualPressureRefs",
      label,
      { allowEmpty: true }
    ),
    continuationRefs: parseOptionalStringList(
      finding,
      "continuationRefs",
      label,
      { allowEmpty: true }
    ),
    evidenceRefs: parseStringArray(finding["evidenceRefs"], `${label}.evidenceRefs`),
    authorityRefs: parseStringArray(finding["authorityRefs"], `${label}.authorityRefs`),
    compositionContributionRef: parseNonEmptyString(
      finding["compositionContributionRef"],
      `${label}.compositionContributionRef`
    ),
    reason: normalizeNullableString(
      parseOptionalField(finding, "reason"),
      `${label}.reason`
    )
  });
}

export function assertFpEdgeAssuranceEvalFindingMatchesHookAction(input: {
  readonly hookAction: HookActionRecord;
  readonly selection: EdgeAssuranceContractSelection;
  readonly finding: FpEdgeAssuranceEvalFinding;
  readonly admission?: HookFindingAdmission | null | undefined;
}): void {
  if (input.hookAction.hookClass !== "evaluate") {
    throw new TypeError(
      "FpEdgeAssuranceEvalFinding requires an evaluate HookActionRecord"
    );
  }
  if (input.finding.hookActionRef !== input.hookAction.hookActionRef) {
    throw new TypeError(
      "FpEdgeAssuranceEvalFinding.hookActionRef does not match HookActionRecord"
    );
  }
  if (!input.hookAction.returnedFindingRefs.includes(input.finding.findingRef)) {
    throw new TypeError(
      "FpEdgeAssuranceEvalFinding.findingRef was not returned by HookActionRecord"
    );
  }
  if (
    input.finding.edgeAssuranceSelectionRef !== input.selection.selectionRef
  ) {
    throw new TypeError(
      "FpEdgeAssuranceEvalFinding.edgeAssuranceSelectionRef does not match selection"
    );
  }
  if (input.finding.evalFpContractRef !== input.selection.contract.evalFpContractRef) {
    throw new TypeError(
      "FpEdgeAssuranceEvalFinding.evalFpContractRef does not match selected contract"
    );
  }
  const admission = input.admission ?? null;
  if (admission !== null) {
    assertHookFindingAdmissionMatchesAction({
      hookAction: input.hookAction,
      admission
    });
    if (admission.findingRef !== input.finding.findingRef) {
      throw new TypeError(
        "HookFindingAdmission.findingRef does not match FpEdgeAssuranceEvalFinding"
      );
    }
  }
}

function assertAllRefsPresent(input: {
  readonly refs: readonly string[];
  readonly availableRefs: ReadonlySet<string>;
  readonly label: string;
}): void {
  for (const ref of input.refs) {
    if (!input.availableRefs.has(ref)) {
      throw new TypeError(`${input.label}: unadmitted ref ${JSON.stringify(ref)}`);
    }
  }
}

function edgeAssuranceEvaluationProjectionRef(input: {
  readonly selection: EdgeAssuranceContractSelection;
  readonly hookAction: HookActionRecord;
  readonly admission: HookFindingAdmission;
  readonly finding: FpEdgeAssuranceEvalFinding;
  readonly assuranceProjection: AssuranceProjection;
  readonly closureDecision: AssuranceClosureDecision;
}): string {
  return [
    "edge_assurance_evaluation_projection",
    input.selection.selectionRef,
    input.hookAction.hookActionRef,
    input.admission.admissionRef,
    input.finding.findingRef,
    input.assuranceProjection.projectionRef,
    input.closureDecision.decision
  ].join(":");
}

function nextActionBasisRefs(input: {
  readonly finding: FpEdgeAssuranceEvalFinding;
  readonly closureDecision: AssuranceClosureDecision;
}): readonly string[] {
  // Close advances only through the composition contribution. Non-close folds
  // retain continuation and residual basis; qualified defer also preserves the
  // composition contribution because the local edge may be conditionally usable.
  if (input.closureDecision.decision === "close") {
    return freezeUniqueStringArray(
      [input.finding.compositionContributionRef],
      "EdgeAssuranceEvaluationProjection.nextActionBasisRefs"
    );
  }
  if (input.closureDecision.decision === "qualified_defer") {
    return freezeUniqueStringArray(
      [
        ...input.finding.continuationRefs,
        ...input.finding.residualPressureRefs,
        input.finding.compositionContributionRef
      ],
      "EdgeAssuranceEvaluationProjection.nextActionBasisRefs"
    );
  }
  return freezeUniqueStringArray(
    [
      ...input.finding.continuationRefs,
      ...input.finding.residualPressureRefs,
      ...input.finding.authorityRefs
    ],
    "EdgeAssuranceEvaluationProjection.nextActionBasisRefs",
    { allowEmpty: true }
  );
}

export function deriveEdgeAssuranceEvaluationProjection(input: {
  readonly selection: EdgeAssuranceContractSelection;
  readonly hookAction: HookActionRecord;
  readonly admission: HookFindingAdmission;
  readonly finding: FpEdgeAssuranceEvalFinding;
  readonly assuranceProjection: AssuranceProjection;
  readonly closureDecision: AssuranceClosureDecision;
}): EdgeAssuranceEvaluationProjection {
  assertFpEdgeAssuranceEvalFindingMatchesHookAction({
    hookAction: input.hookAction,
    selection: input.selection,
    finding: input.finding,
    admission: input.admission
  });
  if (input.admission.status !== "admitted") {
    throw new TypeError(
      "EdgeAssuranceEvaluationProjection requires an admitted hook finding"
    );
  }
  if (
    input.closureDecision.projectionRef !== input.assuranceProjection.projectionRef
  ) {
    throw new TypeError(
      "EdgeAssuranceEvaluationProjection requires closure decision for assurance projection"
    );
  }
  const admittedEvidenceRefs = new Set(
    input.assuranceProjection.evidenceRows.map((row) => row.evidenceRef)
  );
  assertAllRefsPresent({
    refs: input.finding.evidenceRefs,
    availableRefs: admittedEvidenceRefs,
    label: "EdgeAssuranceEvaluationProjection.evidenceRefs"
  });
  const admittedAuthorityRefs = new Set(
    input.assuranceProjection.authoritySnapshot.authorityRefs
  );
  assertAllRefsPresent({
    refs: input.finding.authorityRefs,
    availableRefs: admittedAuthorityRefs,
    label: "EdgeAssuranceEvaluationProjection.authorityRefs"
  });
  const basisRefs = nextActionBasisRefs({
    finding: input.finding,
    closureDecision: input.closureDecision
  });
  return Object.freeze({
    kind: "edge_assurance_evaluation_projection",
    projectionRef: edgeAssuranceEvaluationProjectionRef(input),
    edgeAssuranceSelectionRef: input.selection.selectionRef,
    hookActionRef: input.hookAction.hookActionRef,
    admissionRef: input.admission.admissionRef,
    findingRef: input.finding.findingRef,
    gainReportRef: input.finding.gainReportRef,
    metricRefs: input.finding.metricRefs,
    proposedCloseDisposition: input.finding.closeDisposition,
    assuranceClosureDecision: input.closureDecision.decision,
    assuranceProjectionRef: input.assuranceProjection.projectionRef,
    residualPressureRefs: input.finding.residualPressureRefs,
    continuationRefs: input.finding.continuationRefs,
    nextActionBasisRefs: basisRefs,
    evidenceRefs: input.finding.evidenceRefs,
    authorityRefs: input.finding.authorityRefs,
    compositionContributionRef: input.finding.compositionContributionRef
  });
}

export function deriveEdgeAssuranceEvaluationReadModel(input: {
  readonly projection: EdgeAssuranceEvaluationProjection;
}): EdgeAssuranceEvaluationReadModel {
  return Object.freeze({
    kind: "edge_assurance_evaluation_read_model",
    projectionRef: input.projection.projectionRef,
    edgeAssuranceSelectionRef: input.projection.edgeAssuranceSelectionRef,
    findingRef: input.projection.findingRef,
    gainReportRef: input.projection.gainReportRef,
    metricRefs: input.projection.metricRefs,
    proposedCloseDisposition: input.projection.proposedCloseDisposition,
    assuranceClosureDecision: input.projection.assuranceClosureDecision,
    residualPressureRefs: input.projection.residualPressureRefs,
    continuationRefs: input.projection.continuationRefs,
    nextActionBasisRefs: input.projection.nextActionBasisRefs,
    evidenceRefs: input.projection.evidenceRefs,
    authorityRefs: input.projection.authorityRefs,
    compositionContributionRef: input.projection.compositionContributionRef
  });
}
