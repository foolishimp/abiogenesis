// Implements: T-133
// Implements: REQ-L-GTL3-GRAPHVECTOR
// Implements: REQ-L-GTL3-HOOKS

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  GraphVector,
  HookRef,
  Node,
  SerializedAttrEntry,
  SerializedAttrs,
  SerializedAttrValue
} from "./carriers.js";
import {
  stableJsonEquals,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";
import { loadAbgConfigSections } from "../../../shared/abg_config/load.js";

export const TARGET_CARRIER_CONTRACT_DECLARATION_KEY =
  "gtl.target_carrier_contract" as const;

const INSTALLED_TARGET_CARRIER_DEFAULTS_RELATIVE_PATH = join(
  ".abiogenesis",
  "config",
  "gtl.target-carrier-defaults.json"
);

const PACKAGE_TARGET_CARRIER_DEFAULTS_RELATIVE_PATH = join(
  "config",
  "gtl.target-carrier-defaults.json"
);

export type TargetCarrierContractBindingSource =
  | "graph_vector_declarations"
  | "gtl_defaults_config";

export interface GenericTargetCarrierTemplate {
  readonly templateRef: string;
  readonly hookRefTemplate: string;
  readonly contractRefTemplate: string;
  readonly outputSurfaceRefTemplate: string;
  readonly outputCarrierFamilyRef: string;
  readonly outputCarrierKindSource: "target_asset_surface_kind_or_name";
  readonly envelopeContractRef: string;
  readonly nestedPayloadPath: string;
  readonly requiredFieldRefs: readonly string[];
  readonly optionalFieldRefs: readonly string[];
  readonly fixedProtocolFieldRefs: readonly string[];
  readonly workerFillableFieldRefs: readonly string[];
  readonly literalDomainRefTemplates: readonly string[];
  readonly enumDomainRefs: readonly string[];
  readonly schemaRefSource: "target_schema_ref";
  readonly admissionRef: string;
  readonly payloadLedgerBindingRef: string;
  readonly edgeAssuranceBindingRef: string;
  readonly handoffProjectionRef: string;
  readonly constructionTemplateRef: string;
  readonly replayDigestPolicyRef: string;
  readonly materializationPolicyRef: string;
  readonly closurePreconditionRef: string;
  readonly testCaseGenerationRef: string;
}

export interface GtlTargetCarrierDefaultsBundle {
  readonly kind: "gtl_target_carrier_defaults_bundle";
  readonly gtlDefaultsFamily: "gtl_defaults";
  readonly version: number;
  readonly bundleRef: string;
  readonly bundlePath: string;
  readonly bundleDigest: string;
  readonly genericOutputTemplate: GenericTargetCarrierTemplate;
}

export interface TargetCarrierContractBinding {
  readonly kind: "target_carrier_contract_binding";
  readonly source: TargetCarrierContractBindingSource;
  readonly sourceRef: string;
  readonly attrKey: typeof TARGET_CARRIER_CONTRACT_DECLARATION_KEY;
  readonly hookRef: string;
  readonly contractRef: string;
  readonly templateRef: string;
  readonly targetNodeRef: string;
  readonly outputSurfaceRef: string;
  readonly outputCarrierFamilyRef: string;
  readonly outputCarrierKind: string;
  readonly envelopeContractRef: string;
  readonly nestedPayloadPath: string;
  readonly requiredFieldRefs: readonly string[];
  readonly optionalFieldRefs: readonly string[];
  readonly fixedProtocolFieldRefs: readonly string[];
  readonly workerFillableFieldRefs: readonly string[];
  readonly literalDomainRefs: readonly string[];
  readonly enumDomainRefs: readonly string[];
  readonly schemaRef: string;
  readonly admissionRef: string;
  readonly payloadLedgerBindingRef: string;
  readonly edgeAssuranceBindingRef: string;
  readonly handoffProjectionRef: string;
  readonly constructionTemplateRef: string;
  readonly replayDigestPolicyRef: string;
  readonly materializationPolicyRef: string;
  readonly closurePreconditionRef: string;
  readonly testCaseGenerationRef: string;
  readonly configDigest: string;
}

export type TargetCarrierCandidateAdmissionStatus =
  | "admitted"
  | "rejected";

export type TargetCarrierCandidateRejectionClass =
  | "candidate_not_object"
  | "missing_nested_carrier"
  | "missing_required_field"
  | "wrong_literal_domain"
  | "fixed_protocol_field_mutation";

export interface TargetCarrierCandidateAdmitted {
  readonly kind: "target_carrier_candidate_admission";
  readonly status: "admitted";
  readonly payloadRef: string;
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly validationRef: string;
}

export interface TargetCarrierCandidateRejected {
  readonly kind: "target_carrier_candidate_admission";
  readonly status: "rejected";
  readonly payloadRef: string;
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly rejectionClass: TargetCarrierCandidateRejectionClass;
  readonly reason: string;
}

export type TargetCarrierCandidateAdmission =
  | TargetCarrierCandidateAdmitted
  | TargetCarrierCandidateRejected;

function isRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function assertRecord(
  input: unknown,
  label: string
): Readonly<Record<string, unknown>> {
  if (!isRecord(input)) {
    throw new TypeError(`${label}: expected object`);
  }
  return input;
}

function assertPositiveInteger(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw new TypeError(`${label}: expected positive integer`);
  }
  return value;
}

function assertNonEmptyString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${label}: expected non-empty string`);
  }
  return value;
}

function assertStringArray(
  value: unknown,
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  if (!Array.isArray(value)) {
    throw new TypeError(`${label}: expected string array`);
  }
  if (value.length === 0 && options?.allowEmpty !== true) {
    throw new TypeError(`${label}: expected at least one string`);
  }
  const seen = new Set<string>();
  const result: string[] = [];
  for (const [index, item] of value.entries()) {
    const stringValue = assertNonEmptyString(item, `${label}[${index}]`);
    if (seen.has(stringValue)) {
      throw new TypeError(`${label}: duplicate string ${JSON.stringify(stringValue)}`);
    }
    seen.add(stringValue);
    result.push(stringValue);
  }
  return Object.freeze(result);
}

const digestForValue = stableSha256Digest;
const valuesEqual = stableJsonEquals;

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

function scalarEntry(key: string, value: string): SerializedAttrEntry {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar" as const,
      value
    })
  });
}

function stringListEntry(
  key: string,
  value: readonly string[]
): SerializedAttrEntry {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list" as const,
      value: Object.freeze([...value])
    })
  });
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
  if (value.kind !== "scalar") {
    throw new TypeError(`${label}.${key}: expected scalar string`);
  }
  return assertNonEmptyString(value.value, `${label}.${key}`);
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
  return assertStringArray(value.value, `${label}.${key}`, options);
}

function targetCarrierKind(target: Node): string {
  return target.assetSurface.kind.length > 0 ? target.assetSurface.kind : target.name;
}

function renderTemplate(
  template: string,
  values: Readonly<Record<string, string>>,
  label: string
): string {
  const rendered = template.replace(/\{([A-Za-z0-9_]+)\}/g, (match, key: string) => {
    const value = values[key];
    if (value === undefined) {
      throw new TypeError(`${label}: unknown template key ${key} in ${match}`);
    }
    return value;
  });
  return assertNonEmptyString(rendered, label);
}

function templateValues(input: {
  readonly target: Node;
  readonly templateRef: string;
}): Readonly<Record<string, string>> {
  return Object.freeze({
    templateRef: input.templateRef,
    targetNodeRef: input.target.id,
    targetName: input.target.name,
    outputCarrierKind: targetCarrierKind(input.target),
    targetSchemaRef: input.target.schema.ref
  });
}

function genericConfigForTarget(input: {
  readonly target: Node;
  readonly defaults: GtlTargetCarrierDefaultsBundle;
}): SerializedAttrs {
  const template = input.defaults.genericOutputTemplate;
  const values = templateValues({
    target: input.target,
    templateRef: template.templateRef
  });
  const outputCarrierKind = renderTemplate(
    "{outputCarrierKind}",
    values,
    "GenericTargetCarrierTemplate.outputCarrierKind"
  );
  return Object.freeze({
    entries: Object.freeze([
      scalarEntry(
        "contract_ref",
        renderTemplate(
          template.contractRefTemplate,
          values,
          "GenericTargetCarrierTemplate.contractRefTemplate"
        )
      ),
      scalarEntry("template_ref", template.templateRef),
      scalarEntry(
        "target_node_ref",
        assertNonEmptyString(values["targetNodeRef"], "GenericTargetCarrierTemplate.targetNodeRef")
      ),
      scalarEntry(
        "output_surface_ref",
        renderTemplate(
          template.outputSurfaceRefTemplate,
          values,
          "GenericTargetCarrierTemplate.outputSurfaceRefTemplate"
        )
      ),
      scalarEntry("output_carrier_family_ref", template.outputCarrierFamilyRef),
      scalarEntry("output_carrier_kind", outputCarrierKind),
      scalarEntry("envelope_contract_ref", template.envelopeContractRef),
      scalarEntry("nested_payload_path", template.nestedPayloadPath),
      stringListEntry("required_field_refs", template.requiredFieldRefs),
      stringListEntry("optional_field_refs", template.optionalFieldRefs),
      stringListEntry("fixed_protocol_field_refs", template.fixedProtocolFieldRefs),
      stringListEntry("worker_fillable_field_refs", template.workerFillableFieldRefs),
      stringListEntry(
        "literal_domain_refs",
        template.literalDomainRefTemplates.map((entry) =>
          renderTemplate(entry, values, "GenericTargetCarrierTemplate.literalDomainRefTemplates")
        )
      ),
      stringListEntry("enum_domain_refs", template.enumDomainRefs),
      scalarEntry(
        "schema_ref",
        assertNonEmptyString(values["targetSchemaRef"], "GenericTargetCarrierTemplate.targetSchemaRef")
      ),
      scalarEntry("admission_ref", template.admissionRef),
      scalarEntry("payload_ledger_binding_ref", template.payloadLedgerBindingRef),
      scalarEntry("edge_assurance_binding_ref", template.edgeAssuranceBindingRef),
      scalarEntry("handoff_projection_ref", template.handoffProjectionRef),
      scalarEntry("construction_template_ref", template.constructionTemplateRef),
      scalarEntry("replay_digest_policy_ref", template.replayDigestPolicyRef),
      scalarEntry("materialization_policy_ref", template.materializationPolicyRef),
      scalarEntry("closure_precondition_ref", template.closurePreconditionRef),
      scalarEntry("test_case_generation_ref", template.testCaseGenerationRef)
    ])
  });
}

function genericHookRefForTarget(input: {
  readonly target: Node;
  readonly defaults: GtlTargetCarrierDefaultsBundle;
}): HookRef {
  const template = input.defaults.genericOutputTemplate;
  const values = templateValues({
    target: input.target,
    templateRef: template.templateRef
  });
  return Object.freeze({
    ref: renderTemplate(
      template.hookRefTemplate,
      values,
      "GenericTargetCarrierTemplate.hookRefTemplate"
    ),
    config: genericConfigForTarget(input)
  });
}

function targetCarrierHookRef(attrs: SerializedAttrs): HookRef | null {
  const value = attrValueForKey(attrs, TARGET_CARRIER_CONTRACT_DECLARATION_KEY);
  if (value === null) {
    return null;
  }
  if (value.kind !== "hook_ref") {
    throw new TypeError("Target carrier contract binding must be a hook_ref");
  }
  return value.value;
}

export function targetCarrierContractDeclarationForTarget(input: {
  readonly target: Node;
  readonly defaults: GtlTargetCarrierDefaultsBundle;
}): SerializedAttrEntry {
  return Object.freeze({
    key: TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
    value: Object.freeze({
      kind: "hook_ref" as const,
      value: genericHookRefForTarget(input)
    })
  });
}

function bindingFromHookRef(input: {
  readonly hookRef: HookRef;
  readonly source: TargetCarrierContractBindingSource;
  readonly sourceRef: string;
}): TargetCarrierContractBinding {
  const config = input.hookRef.config;
  const binding = {
    kind: "target_carrier_contract_binding" as const,
    source: input.source,
    sourceRef: input.sourceRef,
    attrKey: TARGET_CARRIER_CONTRACT_DECLARATION_KEY,
    hookRef: assertNonEmptyString(
      input.hookRef.ref,
      "TargetCarrierContractBinding.hookRef"
    ),
    contractRef: configScalarString(config, "contract_ref", "TargetCarrierContractBinding"),
    templateRef: configScalarString(config, "template_ref", "TargetCarrierContractBinding"),
    targetNodeRef: configScalarString(config, "target_node_ref", "TargetCarrierContractBinding"),
    outputSurfaceRef: configScalarString(config, "output_surface_ref", "TargetCarrierContractBinding"),
    outputCarrierFamilyRef: configScalarString(config, "output_carrier_family_ref", "TargetCarrierContractBinding"),
    outputCarrierKind: configScalarString(config, "output_carrier_kind", "TargetCarrierContractBinding"),
    envelopeContractRef: configScalarString(config, "envelope_contract_ref", "TargetCarrierContractBinding"),
    nestedPayloadPath: configScalarString(config, "nested_payload_path", "TargetCarrierContractBinding"),
    requiredFieldRefs: configStringList(config, "required_field_refs", "TargetCarrierContractBinding"),
    optionalFieldRefs: configStringList(config, "optional_field_refs", "TargetCarrierContractBinding", {
      allowEmpty: true
    }),
    fixedProtocolFieldRefs: configStringList(config, "fixed_protocol_field_refs", "TargetCarrierContractBinding"),
    workerFillableFieldRefs: configStringList(config, "worker_fillable_field_refs", "TargetCarrierContractBinding", {
      allowEmpty: true
    }),
    literalDomainRefs: configStringList(config, "literal_domain_refs", "TargetCarrierContractBinding", {
      allowEmpty: true
    }),
    enumDomainRefs: configStringList(config, "enum_domain_refs", "TargetCarrierContractBinding", {
      allowEmpty: true
    }),
    schemaRef: configScalarString(config, "schema_ref", "TargetCarrierContractBinding"),
    admissionRef: configScalarString(config, "admission_ref", "TargetCarrierContractBinding"),
    payloadLedgerBindingRef: configScalarString(config, "payload_ledger_binding_ref", "TargetCarrierContractBinding"),
    edgeAssuranceBindingRef: configScalarString(config, "edge_assurance_binding_ref", "TargetCarrierContractBinding"),
    handoffProjectionRef: configScalarString(config, "handoff_projection_ref", "TargetCarrierContractBinding"),
    constructionTemplateRef: configScalarString(config, "construction_template_ref", "TargetCarrierContractBinding"),
    replayDigestPolicyRef: configScalarString(config, "replay_digest_policy_ref", "TargetCarrierContractBinding"),
    materializationPolicyRef: configScalarString(config, "materialization_policy_ref", "TargetCarrierContractBinding"),
    closurePreconditionRef: configScalarString(config, "closure_precondition_ref", "TargetCarrierContractBinding"),
    testCaseGenerationRef: configScalarString(config, "test_case_generation_ref", "TargetCarrierContractBinding"),
    configDigest: digestForValue(config)
  } satisfies TargetCarrierContractBinding;
  return Object.freeze(binding);
}

function assertBindingMatchesVectorTarget(input: {
  readonly binding: TargetCarrierContractBinding;
  readonly vector: GraphVector;
}): void {
  if (input.binding.targetNodeRef !== input.vector.target.id) {
    throw new TypeError(
      `Target carrier contract ${input.binding.contractRef} target_node_ref does not match vector target`
    );
  }
  if (input.binding.schemaRef !== input.vector.target.schema.ref) {
    throw new TypeError(
      `Target carrier contract ${input.binding.contractRef} schema_ref does not match vector target schema`
    );
  }
}

function candidateAdmissionBase(input: {
  readonly binding: TargetCarrierContractBinding;
  readonly payloadRef: string;
}): Pick<
  TargetCarrierCandidateAdmitted,
  "kind" | "payloadRef" | "contractRef" | "contractDigest"
> {
  return Object.freeze({
    kind: "target_carrier_candidate_admission" as const,
    payloadRef: input.payloadRef,
    contractRef: input.binding.contractRef,
    contractDigest: input.binding.configDigest
  });
}

function rejectCandidate(input: {
  readonly binding: TargetCarrierContractBinding;
  readonly payloadRef: string;
  readonly rejectionClass: TargetCarrierCandidateRejectionClass;
  readonly reason: string;
}): TargetCarrierCandidateRejected {
  return Object.freeze({
    ...candidateAdmissionBase(input),
    status: "rejected" as const,
    rejectionClass: input.rejectionClass,
    reason: input.reason
  });
}

function hasOwnField(
  input: Readonly<Record<string, unknown>>,
  fieldRef: string
): boolean {
  return Object.hasOwn(input, fieldRef) && input[fieldRef] !== undefined;
}

function valueAtPath(input: unknown, pathRef: string): unknown {
  const parts = pathRef.split(".");
  let current = input;
  for (const part of parts) {
    if (!isRecord(current) || !hasOwnField(current, part)) {
      return undefined;
    }
    current = current[part];
  }
  return current;
}

function expectedFixedProtocolFieldValue(
  binding: TargetCarrierContractBinding,
  fieldRef: string,
  expectedFixedFieldValues: Readonly<Record<string, unknown>> | undefined
): { readonly hasValue: boolean; readonly value?: unknown } {
  if (
    expectedFixedFieldValues !== undefined &&
    hasOwnField(expectedFixedFieldValues, fieldRef)
  ) {
    return Object.freeze({
      hasValue: true,
      value: expectedFixedFieldValues[fieldRef]
    });
  }
  if (fieldRef === "kind") {
    return Object.freeze({
      hasValue: true,
      value: binding.outputCarrierKind
    });
  }
  return Object.freeze({ hasValue: false });
}

export function validateTargetCarrierCandidate(input: {
  readonly binding: TargetCarrierContractBinding;
  readonly payloadRef: string;
  readonly candidate: unknown;
  readonly expectedFixedFieldValues?: Readonly<Record<string, unknown>> | undefined;
}): TargetCarrierCandidateAdmission {
  assertNonEmptyString(input.payloadRef, "TargetCarrierCandidate.payloadRef");
  if (!isRecord(input.candidate)) {
    return rejectCandidate({
      binding: input.binding,
      payloadRef: input.payloadRef,
      rejectionClass: "candidate_not_object",
      reason: "target carrier candidate is not an object"
    });
  }

  if (valueAtPath(input.candidate, input.binding.nestedPayloadPath) === undefined) {
    return rejectCandidate({
      binding: input.binding,
      payloadRef: input.payloadRef,
      rejectionClass: "missing_nested_carrier",
      reason: `target carrier candidate missing nested payload path ${input.binding.nestedPayloadPath}`
    });
  }

  for (const fieldRef of input.binding.requiredFieldRefs) {
    if (valueAtPath(input.candidate, fieldRef) === undefined) {
      return rejectCandidate({
        binding: input.binding,
        payloadRef: input.payloadRef,
        rejectionClass: "missing_required_field",
        reason: `target carrier candidate missing required field ${fieldRef}`
      });
    }
  }

  for (const literalDomainRef of input.binding.literalDomainRefs) {
    const separatorIndex = literalDomainRef.indexOf(":");
    if (separatorIndex <= 0 || separatorIndex === literalDomainRef.length - 1) {
      throw new TypeError(
        `TargetCarrierContractBinding.literalDomainRefs: unsupported literal ${literalDomainRef}`
      );
    }
    const fieldRef = literalDomainRef.slice(0, separatorIndex);
    const expectedValue = literalDomainRef.slice(separatorIndex + 1);
    const actualValue = valueAtPath(input.candidate, fieldRef);
    if (actualValue !== expectedValue) {
      return rejectCandidate({
        binding: input.binding,
        payloadRef: input.payloadRef,
        rejectionClass: "wrong_literal_domain",
        reason: `target carrier candidate field ${fieldRef} does not match literal ${expectedValue}`
      });
    }
  }

  for (const fieldRef of input.binding.fixedProtocolFieldRefs) {
    const expected = expectedFixedProtocolFieldValue(
      input.binding,
      fieldRef,
      input.expectedFixedFieldValues
    );
    if (!expected.hasValue) {
      continue;
    }
    const actualValue = valueAtPath(input.candidate, fieldRef);
    if (actualValue !== undefined && !valuesEqual(actualValue, expected.value)) {
      return rejectCandidate({
        binding: input.binding,
        payloadRef: input.payloadRef,
        rejectionClass: "fixed_protocol_field_mutation",
        reason: `target carrier candidate illegally mutates fixed protocol field ${fieldRef}`
      });
    }
  }

  return Object.freeze({
    ...candidateAdmissionBase(input),
    status: "admitted" as const,
    validationRef: `target-carrier-validation:${input.binding.contractRef}:${input.binding.configDigest}:${input.payloadRef}`
  });
}

function admitGenericTargetCarrierTemplate(
  input: unknown
): GenericTargetCarrierTemplate {
  const template = assertRecord(input, "GenericTargetCarrierTemplate");
  const outputCarrierKindSource = assertNonEmptyString(
    template["outputCarrierKindSource"],
    "GenericTargetCarrierTemplate.outputCarrierKindSource"
  );
  if (outputCarrierKindSource !== "target_asset_surface_kind_or_name") {
    throw new TypeError(
      "GenericTargetCarrierTemplate.outputCarrierKindSource: unsupported source"
    );
  }
  const schemaRefSource = assertNonEmptyString(
    template["schemaRefSource"],
    "GenericTargetCarrierTemplate.schemaRefSource"
  );
  if (schemaRefSource !== "target_schema_ref") {
    throw new TypeError("GenericTargetCarrierTemplate.schemaRefSource: unsupported source");
  }
  return Object.freeze({
    templateRef: assertNonEmptyString(template["templateRef"], "GenericTargetCarrierTemplate.templateRef"),
    hookRefTemplate: assertNonEmptyString(template["hookRefTemplate"], "GenericTargetCarrierTemplate.hookRefTemplate"),
    contractRefTemplate: assertNonEmptyString(template["contractRefTemplate"], "GenericTargetCarrierTemplate.contractRefTemplate"),
    outputSurfaceRefTemplate: assertNonEmptyString(template["outputSurfaceRefTemplate"], "GenericTargetCarrierTemplate.outputSurfaceRefTemplate"),
    outputCarrierFamilyRef: assertNonEmptyString(template["outputCarrierFamilyRef"], "GenericTargetCarrierTemplate.outputCarrierFamilyRef"),
    outputCarrierKindSource,
    envelopeContractRef: assertNonEmptyString(template["envelopeContractRef"], "GenericTargetCarrierTemplate.envelopeContractRef"),
    nestedPayloadPath: assertNonEmptyString(template["nestedPayloadPath"], "GenericTargetCarrierTemplate.nestedPayloadPath"),
    requiredFieldRefs: assertStringArray(template["requiredFieldRefs"], "GenericTargetCarrierTemplate.requiredFieldRefs"),
    optionalFieldRefs: assertStringArray(template["optionalFieldRefs"], "GenericTargetCarrierTemplate.optionalFieldRefs", {
      allowEmpty: true
    }),
    fixedProtocolFieldRefs: assertStringArray(template["fixedProtocolFieldRefs"], "GenericTargetCarrierTemplate.fixedProtocolFieldRefs"),
    workerFillableFieldRefs: assertStringArray(template["workerFillableFieldRefs"], "GenericTargetCarrierTemplate.workerFillableFieldRefs", {
      allowEmpty: true
    }),
    literalDomainRefTemplates: assertStringArray(template["literalDomainRefTemplates"], "GenericTargetCarrierTemplate.literalDomainRefTemplates", {
      allowEmpty: true
    }),
    enumDomainRefs: assertStringArray(template["enumDomainRefs"], "GenericTargetCarrierTemplate.enumDomainRefs", {
      allowEmpty: true
    }),
    schemaRefSource,
    admissionRef: assertNonEmptyString(template["admissionRef"], "GenericTargetCarrierTemplate.admissionRef"),
    payloadLedgerBindingRef: assertNonEmptyString(template["payloadLedgerBindingRef"], "GenericTargetCarrierTemplate.payloadLedgerBindingRef"),
    edgeAssuranceBindingRef: assertNonEmptyString(template["edgeAssuranceBindingRef"], "GenericTargetCarrierTemplate.edgeAssuranceBindingRef"),
    handoffProjectionRef: assertNonEmptyString(template["handoffProjectionRef"], "GenericTargetCarrierTemplate.handoffProjectionRef"),
    constructionTemplateRef: assertNonEmptyString(template["constructionTemplateRef"], "GenericTargetCarrierTemplate.constructionTemplateRef"),
    replayDigestPolicyRef: assertNonEmptyString(template["replayDigestPolicyRef"], "GenericTargetCarrierTemplate.replayDigestPolicyRef"),
    materializationPolicyRef: assertNonEmptyString(template["materializationPolicyRef"], "GenericTargetCarrierTemplate.materializationPolicyRef"),
    closurePreconditionRef: assertNonEmptyString(template["closurePreconditionRef"], "GenericTargetCarrierTemplate.closurePreconditionRef"),
    testCaseGenerationRef: assertNonEmptyString(template["testCaseGenerationRef"], "GenericTargetCarrierTemplate.testCaseGenerationRef")
  });
}

export function admitGtlTargetCarrierDefaultsBundle(
  input: unknown,
  options: {
    readonly bundlePath: string;
    readonly bundleDigest?: string | undefined;
  }
): GtlTargetCarrierDefaultsBundle {
  const bundle = assertRecord(input, "GtlTargetCarrierDefaultsBundle");
  const kind = assertNonEmptyString(bundle["kind"], "GtlTargetCarrierDefaultsBundle.kind");
  if (kind !== "gtl_target_carrier_defaults_bundle") {
    throw new TypeError(
      "GtlTargetCarrierDefaultsBundle.kind: expected gtl_target_carrier_defaults_bundle"
    );
  }
  const gtlDefaultsFamily = assertNonEmptyString(
    bundle["gtlDefaultsFamily"],
    "GtlTargetCarrierDefaultsBundle.gtlDefaultsFamily"
  );
  if (gtlDefaultsFamily !== "gtl_defaults") {
    throw new TypeError(
      "GtlTargetCarrierDefaultsBundle.gtlDefaultsFamily: expected gtl_defaults"
    );
  }
  const version = assertPositiveInteger(
    bundle["version"],
    "GtlTargetCarrierDefaultsBundle.version"
  );
  const bundleRef = assertNonEmptyString(
    bundle["bundleRef"],
    "GtlTargetCarrierDefaultsBundle.bundleRef"
  );
  const genericOutputTemplate = admitGenericTargetCarrierTemplate(
    bundle["genericOutputTemplate"]
  );
  const normalized = {
    kind,
    gtlDefaultsFamily,
    version,
    bundleRef,
    bundlePath: options.bundlePath,
    bundleDigest:
      options.bundleDigest ??
      digestForValue({
        kind,
        gtlDefaultsFamily,
        version,
        bundleRef,
        genericOutputTemplate
      }),
    genericOutputTemplate
  } satisfies GtlTargetCarrierDefaultsBundle;
  return Object.freeze(normalized);
}

export function loadGtlTargetCarrierDefaultsBundleFromFile(
  bundlePath: string
): GtlTargetCarrierDefaultsBundle {
  assertNonEmptyString(bundlePath, "GtlTargetCarrierDefaultsBundle.bundlePath");
  const raw = readFileSync(bundlePath, "utf8");
  return admitGtlTargetCarrierDefaultsBundle(JSON.parse(raw), {
    bundlePath
  });
}

export function resolveGtlTargetCarrierDefaultsPath(
  workspaceRoot = process.cwd()
): string {
  const installedPath = join(
    workspaceRoot,
    INSTALLED_TARGET_CARRIER_DEFAULTS_RELATIVE_PATH
  );
  if (existsSync(installedPath)) {
    return installedPath;
  }
  const packagePath = join(workspaceRoot, PACKAGE_TARGET_CARRIER_DEFAULTS_RELATIVE_PATH);
  if (existsSync(packagePath)) {
    return packagePath;
  }
  const modulePath = fileURLToPath(import.meta.url);
  let current = dirname(modulePath);
  while (true) {
    const modulePackagePath = join(
      current,
      PACKAGE_TARGET_CARRIER_DEFAULTS_RELATIVE_PATH
    );
    if (existsSync(modulePackagePath)) {
      return modulePackagePath;
    }
    const parent = dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }
  throw new TypeError(
    `GTL target-carrier defaults config not found under ${workspaceRoot}`
  );
}

export function loadGtlTargetCarrierDefaultsBundle(
  workspaceRoot = process.cwd()
): GtlTargetCarrierDefaultsBundle {
  const sections = loadAbgConfigSections(workspaceRoot);
  if (sections === null || sections.targetCarriers === null) {
    throw new TypeError(
      `GTL target-carrier defaults section not found in abg.config.json under ${workspaceRoot}`
    );
  }
  return admitGtlTargetCarrierDefaultsBundle(sections.targetCarriers.value, {
    bundlePath: sections.targetCarriers.bundlePath,
    bundleDigest: sections.targetCarriers.bundleDigest
  });
}

export function resolveTargetCarrierContractBinding(input: {
  readonly vector: GraphVector;
  readonly defaults: GtlTargetCarrierDefaultsBundle;
}): TargetCarrierContractBinding {
  const hookRef = targetCarrierHookRef(input.vector.declarations);
  if (hookRef !== null) {
    const binding = bindingFromHookRef({
      hookRef,
      source: "graph_vector_declarations",
      sourceRef: input.vector.id
    });
    assertBindingMatchesVectorTarget({ binding, vector: input.vector });
    return binding;
  }
  const binding = bindingFromHookRef({
    hookRef: genericHookRefForTarget({
      target: input.vector.target,
      defaults: input.defaults
    }),
    source: "gtl_defaults_config",
    sourceRef: `${input.defaults.bundleRef}#${input.defaults.bundleDigest}`
  });
  assertBindingMatchesVectorTarget({ binding, vector: input.vector });
  return binding;
}
