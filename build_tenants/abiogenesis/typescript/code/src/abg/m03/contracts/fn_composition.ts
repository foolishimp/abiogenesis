// Implements: REQ-R-ABG3-FN-COMPOSITION
// Implements: REQ-L-GTL3-COMPUTE-NOTATION
// Implements: REQ-L-GTL3-HOOKS

import type {
  GraphFunction,
  GraphVector,
  HookRef,
  SerializedAttrs,
  SerializedAttrEntry,
  SerializedAttrValue,
  SerializedJsonValue
} from "../../../gtl/m01/contracts/carriers.js";
import type {
  Job,
  Role
} from "../../../gtl/m02/contracts/carriers.js";
import type { RuntimeRegime } from "./carriers.js";
import {
  assertNonEmptyString,
  freezeStringArray
} from "./runtime_support.js";
import {
  stableJson,
  stableSha256Digest
} from "../../../shared/runtime_identity.js";

export const ABG_FN_COMPOSITION_DECLARATION_KEY =
  "abg.fn_composition" as const;

export const ABG_FN_COMPOSITION_SOURCE_VALUES = Object.freeze([
  "graph_vector_declarations",
  "graph_function_declarations",
  "job_policy_hooks",
  "role_policy_hooks",
  "module_policy_hooks"
] as const);

export type AbgFnCompositionSource =
  (typeof ABG_FN_COMPOSITION_SOURCE_VALUES)[number];

export type AbgFnComputeStageRole =
  | "transform"
  | "evaluate"
  | "consequence"
  | "human_callout";

export type AbgFnRegimeRole =
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

export type AbgFnRegimeAuthority =
  | "closure"
  | "evidence"
  | "judgment"
  | "advisory"
  | "absent";

export interface AbgFnHostBinding {
  readonly graphFunctionRef: string | null;
  readonly graphVectorRef: string | null;
  readonly sourceNodeRefs: readonly string[];
  readonly targetNodeRef: string | null;
  readonly targetSchemaRef: string | null;
  readonly owningDeclarationRef: string | null;
}

export interface AbgFnRegimeBinding {
  readonly bindingRef: string;
  readonly stageRole: AbgFnComputeStageRole;
  readonly regime: RuntimeRegime;
  readonly role: AbgFnRegimeRole;
  readonly order: number;
  readonly authority: AbgFnRegimeAuthority;
  readonly inputCarrierRefs: readonly string[];
  readonly outputCarrierRefs: readonly string[];
  readonly evidenceRefs: readonly string[];
}

export interface AbgFnCompositionContract {
  readonly kind: "abg.fn_composition";
  readonly version: "1";
  readonly contractRef: string;
  readonly contractDigest: string;
  readonly hookRef: string;
  readonly host: AbgFnHostBinding;
  readonly regimes: readonly AbgFnRegimeBinding[];
  readonly standardsContextRefs: readonly string[];
  readonly policyContextRefs: readonly string[];
  readonly carrierContextRefs: readonly string[];
  readonly assuranceContextRefs: readonly string[];
  readonly closureContractRef: string;
  readonly optimizationContractRef: string | null;
}

export interface AbgFnCompositionSelection {
  readonly kind: "abg_fn_composition_selection";
  readonly selectionRef: string;
  readonly source: AbgFnCompositionSource;
  readonly sourceRef: string;
  readonly attrKey: typeof ABG_FN_COMPOSITION_DECLARATION_KEY;
  readonly contract: AbgFnCompositionContract;
}

export interface AbgFnCompositionDeclarationInit {
  readonly contractRef: string;
  readonly hookRef: string;
  readonly regimes: readonly AbgFnRegimeBinding[];
  readonly standardsContextRefs: readonly string[];
  readonly policyContextRefs: readonly string[];
  readonly carrierContextRefs: readonly string[];
  readonly assuranceContextRefs: readonly string[];
  readonly closureContractRef: string;
  readonly optimizationContractRef?: string | null | undefined;
  readonly hostGraphFunctionRef?: string | null | undefined;
  readonly hostGraphVectorRef?: string | null | undefined;
  readonly hostSourceNodeRefs?: readonly string[] | undefined;
  readonly hostTargetNodeRef?: string | null | undefined;
  readonly hostTargetSchemaRef?: string | null | undefined;
  readonly owningDeclarationRef?: string | null | undefined;
}

export interface DefaultAbgFnCompositionDeclarationInit {
  readonly scopeRef: string;
  readonly contractRef?: string | undefined;
  readonly hookRef?: string | undefined;
  readonly standardsContextRefs?: readonly string[] | undefined;
  readonly policyContextRefs?: readonly string[] | undefined;
  readonly carrierContextRefs?: readonly string[] | undefined;
  readonly assuranceContextRefs?: readonly string[] | undefined;
  readonly closureContractRef?: string | undefined;
  readonly hostGraphFunctionRef?: string | null | undefined;
  readonly hostGraphVectorRef?: string | null | undefined;
  readonly hostSourceNodeRefs?: readonly string[] | undefined;
  readonly hostTargetNodeRef?: string | null | undefined;
  readonly hostTargetSchemaRef?: string | null | undefined;
  readonly owningDeclarationRef?: string | null | undefined;
}

export interface AbgFnCompositionModulePolicySource {
  readonly name: string;
  readonly policyHooks: SerializedAttrs;
}

interface HookMatch {
  readonly source: AbgFnCompositionSource;
  readonly sourceRef: string;
  readonly attrKey: typeof ABG_FN_COMPOSITION_DECLARATION_KEY;
  readonly hookRef: HookRef;
}

function attrScalarEntry(key: string, value: string): SerializedAttrEntry {
  assertNonEmptyString(value, `ABGFnCompositionDeclaration.${key}`);
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "scalar",
      value
    })
  });
}

function attrStringListEntry(
  key: string,
  values: readonly string[]
): SerializedAttrEntry {
  return Object.freeze({
    key,
    value: Object.freeze({
      kind: "string_list",
      value: freezeUniqueStringArray(values, `ABGFnCompositionDeclaration.${key}`, {
        allowEmpty: true
      })
    })
  });
}

function serializedStringArray(values: readonly string[]): SerializedJsonValue {
  return Object.freeze({
    kind: "array",
    items: Object.freeze([...values])
  });
}

function serializedRegimeBinding(
  binding: AbgFnRegimeBinding
): SerializedJsonValue {
  return Object.freeze({
    kind: "object",
    entries: Object.freeze([
      Object.freeze({ key: "bindingRef", value: binding.bindingRef }),
      Object.freeze({ key: "stageRole", value: binding.stageRole }),
      Object.freeze({ key: "regime", value: binding.regime }),
      Object.freeze({ key: "role", value: binding.role }),
      Object.freeze({ key: "order", value: binding.order }),
      Object.freeze({ key: "authority", value: binding.authority }),
      Object.freeze({
        key: "inputCarrierRefs",
        value: serializedStringArray(binding.inputCarrierRefs)
      }),
      Object.freeze({
        key: "outputCarrierRefs",
        value: serializedStringArray(binding.outputCarrierRefs)
      }),
      Object.freeze({
        key: "evidenceRefs",
        value: serializedStringArray(binding.evidenceRefs)
      })
    ])
  });
}

function attrRegimeBindingsEntry(
  regimes: readonly AbgFnRegimeBinding[]
): SerializedAttrEntry {
  return Object.freeze({
    key: "regime_bindings",
    value: Object.freeze({
      kind: "json_blob",
      value: Object.freeze({
        kind: "array",
        items: Object.freeze(regimes.map(serializedRegimeBinding))
      })
    })
  });
}

function optionalScalarAttrEntry(
  entries: SerializedAttrEntry[],
  key: string,
  value: string | null | undefined
): void {
  if (value !== undefined && value !== null) {
    entries.push(attrScalarEntry(key, value));
  }
}

export function constructAbgFnCompositionDeclarations(
  input: AbgFnCompositionDeclarationInit
): SerializedAttrs {
  const entries: SerializedAttrEntry[] = [
    attrScalarEntry("contract_ref", input.contractRef)
  ];
  optionalScalarAttrEntry(
    entries,
    "host_graph_function_ref",
    input.hostGraphFunctionRef
  );
  optionalScalarAttrEntry(entries, "host_graph_vector_ref", input.hostGraphVectorRef);
  if (input.hostSourceNodeRefs !== undefined) {
    entries.push(
      attrStringListEntry("host_source_node_refs", input.hostSourceNodeRefs)
    );
  }
  optionalScalarAttrEntry(entries, "host_target_node_ref", input.hostTargetNodeRef);
  optionalScalarAttrEntry(
    entries,
    "host_target_schema_ref",
    input.hostTargetSchemaRef
  );
  optionalScalarAttrEntry(
    entries,
    "owning_declaration_ref",
    input.owningDeclarationRef
  );
  entries.push(
    attrStringListEntry("standards_context_refs", input.standardsContextRefs),
    attrStringListEntry("policy_context_refs", input.policyContextRefs),
    attrStringListEntry("carrier_context_refs", input.carrierContextRefs),
    attrStringListEntry("assurance_context_refs", input.assuranceContextRefs),
    attrScalarEntry("closure_contract_ref", input.closureContractRef)
  );
  optionalScalarAttrEntry(
    entries,
    "optimization_contract_ref",
    input.optimizationContractRef
  );
  entries.push(attrRegimeBindingsEntry(input.regimes));

  return Object.freeze({
    entries: Object.freeze([
      Object.freeze({
        key: ABG_FN_COMPOSITION_DECLARATION_KEY,
        value: Object.freeze({
          kind: "hook_ref",
          value: Object.freeze({
            ref: input.hookRef,
            config: Object.freeze({
              entries: Object.freeze(entries)
            })
          })
        })
      })
    ])
  });
}

function defaultRegimeBinding(input: {
  readonly scopeRef: string;
  readonly stageRole: AbgFnComputeStageRole;
  readonly regime: RuntimeRegime;
  readonly role: AbgFnRegimeRole;
  readonly order: number;
  readonly authority: AbgFnRegimeAuthority;
  readonly outputCarrierRef: string;
}): AbgFnRegimeBinding {
  return Object.freeze({
    bindingRef: `regime-binding://${input.scopeRef}/${input.stageRole}/${input.regime}`,
    stageRole: input.stageRole,
    regime: input.regime,
    role: input.role,
    order: input.order,
    authority: input.authority,
    inputCarrierRefs: Object.freeze(["EnginePluginInput"]),
    outputCarrierRefs: Object.freeze([input.outputCarrierRef]),
    evidenceRefs: Object.freeze([
      `evidence://${input.scopeRef}/${input.stageRole}/${input.regime}`
    ])
  });
}

export function constructDefaultAbgFnCompositionDeclarations(
  input: DefaultAbgFnCompositionDeclarationInit
): SerializedAttrs {
  assertNonEmptyString(input.scopeRef, "DefaultAbgFnComposition.scopeRef");
  return constructAbgFnCompositionDeclarations({
    contractRef: input.contractRef ?? `abg.fn_composition://${input.scopeRef}`,
    hookRef: input.hookRef ?? `hook://${input.scopeRef}/abg-fn-composition`,
    hostGraphFunctionRef: input.hostGraphFunctionRef,
    hostGraphVectorRef: input.hostGraphVectorRef,
    hostSourceNodeRefs: input.hostSourceNodeRefs,
    hostTargetNodeRef: input.hostTargetNodeRef,
    hostTargetSchemaRef: input.hostTargetSchemaRef,
    owningDeclarationRef: input.owningDeclarationRef,
    standardsContextRefs: input.standardsContextRefs ?? Object.freeze([]),
    policyContextRefs: input.policyContextRefs ?? Object.freeze([]),
    carrierContextRefs: input.carrierContextRefs ?? Object.freeze([]),
    assuranceContextRefs: input.assuranceContextRefs ?? Object.freeze([]),
    closureContractRef:
      input.closureContractRef ?? `closure://${input.scopeRef}/fd-evaluate`,
    regimes: Object.freeze([
      defaultRegimeBinding({
        scopeRef: input.scopeRef,
        stageRole: "transform",
        regime: "F_P",
        role: "construct",
        order: 0,
        authority: "evidence",
        outputCarrierRef: "FpDispatchOutcome"
      }),
      defaultRegimeBinding({
        scopeRef: input.scopeRef,
        stageRole: "evaluate",
        regime: "F_D",
        role: "validate",
        order: 1,
        authority: "closure",
        outputCarrierRef: "FdEvaluationOutcome"
      }),
      defaultRegimeBinding({
        scopeRef: input.scopeRef,
        stageRole: "evaluate",
        regime: "F_P",
        role: "validate",
        order: 2,
        authority: "judgment",
        outputCarrierRef: "FpEvaluationOutcome"
      }),
      defaultRegimeBinding({
        scopeRef: input.scopeRef,
        stageRole: "consequence",
        regime: "F_D",
        role: "observe",
        order: 3,
        authority: "evidence",
        outputCarrierRef: "ConsequenceProjectionOutcome"
      }),
      defaultRegimeBinding({
        scopeRef: input.scopeRef,
        stageRole: "human_callout",
        regime: "F_H",
        role: "escalate",
        order: 4,
        authority: "judgment",
        outputCarrierRef: "FhAdmissionOutcome"
      })
    ])
  });
}

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

function attrsWithoutKey(attrs: SerializedAttrs, key: string): SerializedAttrs {
  return Object.freeze({
    entries: Object.freeze(attrs.entries.filter((entry) => entry.key !== key))
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

function configOptionalScalarString(
  attrs: SerializedAttrs,
  key: string,
  label: string
): string | null {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    return null;
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

function serializedJsonValueToPlain(value: SerializedJsonValue): unknown {
  if (
    value === null ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }
  if (value.kind === "array") {
    return Object.freeze(value.items.map(serializedJsonValueToPlain));
  }
  return Object.freeze(
    Object.fromEntries(
      value.entries.map((entry) => [
        entry.key,
        serializedJsonValueToPlain(entry.value)
      ])
    )
  );
}

function isReadonlyUnknownArray(input: unknown): input is readonly unknown[] {
  return Array.isArray(input);
}

function isReadonlyUnknownRecord(
  input: unknown
): input is Readonly<Record<string, unknown>> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function configJsonArray(
  attrs: SerializedAttrs,
  key: string,
  label: string
): readonly unknown[] {
  const value = attrValueForKey(attrs, key);
  if (value === null) {
    throw new TypeError(`${label}.${key}: required`);
  }
  if (value.kind !== "json_blob") {
    throw new TypeError(`${label}.${key}: expected json_blob`);
  }
  const plain = serializedJsonValueToPlain(value.value);
  if (!isReadonlyUnknownArray(plain)) {
    throw new TypeError(`${label}.${key}: expected array`);
  }
  return Object.freeze(Array.from(plain));
}

function readRecord(
  input: unknown,
  label: string
): Readonly<Record<string, unknown>> {
  if (!isReadonlyUnknownRecord(input)) {
    throw new TypeError(`${label}: expected object`);
  }
  return input;
}

function readStringField(
  input: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): string {
  const value = input[key];
  if (typeof value !== "string") {
    throw new TypeError(`${label}.${key}: expected string`);
  }
  assertNonEmptyString(value, `${label}.${key}`);
  return value;
}

function readNumberField(
  input: Readonly<Record<string, unknown>>,
  key: string,
  label: string
): number {
  const value = input[key];
  if (!Number.isInteger(value)) {
    throw new TypeError(`${label}.${key}: expected integer`);
  }
  return Number(value);
}

function readStringArrayField(
  input: Readonly<Record<string, unknown>>,
  key: string,
  label: string,
  options?: { readonly allowEmpty?: boolean }
): readonly string[] {
  const value = input[key];
  if (!Array.isArray(value)) {
    throw new TypeError(`${label}.${key}: expected string array`);
  }
  return freezeUniqueStringArray(
    value.map((entry, index) => {
      if (typeof entry !== "string") {
        throw new TypeError(`${label}.${key}[${index}]: expected string`);
      }
      return entry;
    }),
    `${label}.${key}`,
    options
  );
}

function assertComputeStageRole(
  value: string,
  label: string
): AbgFnComputeStageRole {
  switch (value) {
    case "transform":
    case "evaluate":
    case "consequence":
    case "human_callout":
      return value;
    default:
      throw new TypeError(`${label}: expected ABG fn compute stage role`);
  }
}

function assertRuntimeRegime(value: string, label: string): RuntimeRegime {
  switch (value) {
    case "F_D":
    case "F_P":
    case "F_H":
      return value;
    default:
      throw new TypeError(`${label}: expected F_D, F_P, or F_H`);
  }
}

function assertRegimeRole(value: string, label: string): AbgFnRegimeRole {
  switch (value) {
    case "construct":
    case "observe":
    case "validate":
    case "gate":
    case "diagnose":
    case "repair":
    case "rank":
    case "escalate":
    case "close":
    case "absentia":
      return value;
    default:
      throw new TypeError(`${label}: expected ABG fn regime role`);
  }
}

function assertRegimeAuthority(
  value: string,
  label: string
): AbgFnRegimeAuthority {
  switch (value) {
    case "closure":
    case "evidence":
    case "judgment":
    case "advisory":
    case "absent":
      return value;
    default:
      throw new TypeError(`${label}: expected ABG fn regime authority`);
  }
}

function regimeBindingFromPlain(input: unknown, label: string): AbgFnRegimeBinding {
  const record = readRecord(input, label);
  const regime = assertRuntimeRegime(
    readStringField(record, "regime", label),
    `${label}.regime`
  );
  const stageRole = assertComputeStageRole(
    readStringField(record, "stageRole", label),
    `${label}.stageRole`
  );
  const role = assertRegimeRole(readStringField(record, "role", label), `${label}.role`);
  const authority = assertRegimeAuthority(
    readStringField(record, "authority", label),
    `${label}.authority`
  );
  if (regime !== "F_D" && (authority === "closure" || role === "close")) {
    throw new TypeError(`${label}: non-F_D regime binding cannot claim closure`);
  }
  if (stageRole === "human_callout") {
    if (regime !== "F_H") {
      throw new TypeError(`${label}: human_callout requires F_H`);
    }
  } else if (regime === "F_H") {
    throw new TypeError(`${label}: F_H compute is only lawful as human_callout`);
  }
  return Object.freeze({
    bindingRef: readStringField(record, "bindingRef", label),
    stageRole,
    regime,
    role,
    order: readNumberField(record, "order", label),
    authority,
    inputCarrierRefs: readStringArrayField(record, "inputCarrierRefs", label, {
      allowEmpty: true
    }),
    outputCarrierRefs: readStringArrayField(record, "outputCarrierRefs", label, {
      allowEmpty: true
    }),
    evidenceRefs: readStringArrayField(record, "evidenceRefs", label, {
      allowEmpty: true
    })
  });
}

function regimeBindingsFromConfig(attrs: SerializedAttrs): readonly AbgFnRegimeBinding[] {
  const bindings = configJsonArray(
    attrs,
    "regime_bindings",
    "ABGFnCompositionContract"
  ).map((entry, index) =>
    regimeBindingFromPlain(entry, `ABGFnCompositionContract.regime_bindings[${index}]`)
  );
  if (bindings.length === 0) {
    throw new TypeError("ABGFnCompositionContract.regime_bindings: expected at least one binding");
  }
  const byRef = new Set<string>();
  for (const binding of bindings) {
    if (byRef.has(binding.bindingRef)) {
      throw new TypeError(
        `ABGFnCompositionContract.regime_bindings: duplicate bindingRef ${JSON.stringify(binding.bindingRef)}`
      );
    }
    byRef.add(binding.bindingRef);
  }
  return Object.freeze([...bindings].sort((left, right) => left.order - right.order));
}

function hookMatch(input: {
  readonly attrs: SerializedAttrs;
  readonly source: AbgFnCompositionSource;
  readonly sourceRef: string;
}): HookMatch | null {
  const value = attrValueForKey(input.attrs, ABG_FN_COMPOSITION_DECLARATION_KEY);
  if (value === null) {
    return null;
  }
  if (value.kind !== "hook_ref") {
    throw new TypeError("ABG fn composition declaration must be a hook_ref");
  }
  assertNonEmptyString(value.value.ref, "ABGFnComposition.HookRef.ref");
  return Object.freeze({
    source: input.source,
    sourceRef: input.sourceRef,
    attrKey: ABG_FN_COMPOSITION_DECLARATION_KEY,
    hookRef: value.value
  });
}

function singleRoleHookMatch(roles: readonly Role[]): HookMatch | null {
  const matches: HookMatch[] = [];
  for (const role of roles) {
    const match = hookMatch({
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
      "Multiple role ABG fn composition defaults require explicit resolved-policy choice"
    );
  }
  return matches[0] ?? null;
}

function contractFromHookRef(hookRef: HookRef): AbgFnCompositionContract {
  const config = hookRef.config;
  const computedDigest = stableSha256Digest(
    canonicalSerializedAttrs(attrsWithoutKey(config, "contract_digest"))
  );
  const suppliedDigest = configOptionalScalarString(
    config,
    "contract_digest",
    "ABGFnCompositionContract"
  );
  if (suppliedDigest !== null && suppliedDigest !== computedDigest) {
    throw new TypeError(
      "ABGFnCompositionContract.contract_digest does not match normalized contract digest"
    );
  }
  return Object.freeze({
    kind: "abg.fn_composition",
    version: "1",
    contractRef: configScalarString(
      config,
      "contract_ref",
      "ABGFnCompositionContract"
    ),
    contractDigest: computedDigest,
    hookRef: hookRef.ref,
    host: Object.freeze({
      graphFunctionRef: configOptionalScalarString(
        config,
        "host_graph_function_ref",
        "ABGFnCompositionContract"
      ),
      graphVectorRef: configOptionalScalarString(
        config,
        "host_graph_vector_ref",
        "ABGFnCompositionContract"
      ),
      sourceNodeRefs: configOptionalStringList(
        config,
        "host_source_node_refs",
        "ABGFnCompositionContract"
      ),
      targetNodeRef: configOptionalScalarString(
        config,
        "host_target_node_ref",
        "ABGFnCompositionContract"
      ),
      targetSchemaRef: configOptionalScalarString(
        config,
        "host_target_schema_ref",
        "ABGFnCompositionContract"
      ),
      owningDeclarationRef: configOptionalScalarString(
        config,
        "owning_declaration_ref",
        "ABGFnCompositionContract"
      )
    }),
    regimes: regimeBindingsFromConfig(config),
    standardsContextRefs: configStringList(
      config,
      "standards_context_refs",
      "ABGFnCompositionContract",
      { allowEmpty: true }
    ),
    policyContextRefs: configStringList(
      config,
      "policy_context_refs",
      "ABGFnCompositionContract",
      { allowEmpty: true }
    ),
    carrierContextRefs: configStringList(
      config,
      "carrier_context_refs",
      "ABGFnCompositionContract",
      { allowEmpty: true }
    ),
    assuranceContextRefs: configStringList(
      config,
      "assurance_context_refs",
      "ABGFnCompositionContract",
      { allowEmpty: true }
    ),
    closureContractRef: configScalarString(
      config,
      "closure_contract_ref",
      "ABGFnCompositionContract"
    ),
    optimizationContractRef: configOptionalScalarString(
      config,
      "optimization_contract_ref",
      "ABGFnCompositionContract"
    )
  });
}

export function decodeAbgFnCompositionContract(
  hookRef: HookRef
): AbgFnCompositionContract {
  return contractFromHookRef(hookRef);
}

function validateHost(input: {
  readonly contract: AbgFnCompositionContract;
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
}): void {
  const { contract, vector, graphFunction } = input;
  if (
    contract.host.graphFunctionRef !== null &&
    contract.host.graphFunctionRef !== graphFunction.id
  ) {
    throw new TypeError("ABGFnCompositionContract.host_graph_function_ref mismatch");
  }
  if (
    contract.host.graphVectorRef !== null &&
    contract.host.graphVectorRef !== vector.id
  ) {
    throw new TypeError("ABGFnCompositionContract.host_graph_vector_ref mismatch");
  }
  if (
    contract.host.sourceNodeRefs.length > 0 &&
    JSON.stringify(contract.host.sourceNodeRefs) !==
      JSON.stringify(vector.source.map((node) => node.id))
  ) {
    throw new TypeError("ABGFnCompositionContract.host_source_node_refs mismatch");
  }
  if (
    contract.host.targetNodeRef !== null &&
    contract.host.targetNodeRef !== vector.target.id
  ) {
    throw new TypeError("ABGFnCompositionContract.host_target_node_ref mismatch");
  }
  if (
    contract.host.targetSchemaRef !== null &&
    contract.host.targetSchemaRef !== vector.target.schema.ref
  ) {
    throw new TypeError("ABGFnCompositionContract.host_target_schema_ref mismatch");
  }
}

function selectionRef(input: {
  readonly source: AbgFnCompositionSource;
  readonly sourceRef: string;
  readonly contractRef: string;
  readonly contractDigest: string;
}): string {
  return `abg.fn_composition.selection:${stableSha256Digest(input)}`;
}

function selectionFromMatch(input: {
  readonly match: HookMatch;
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
}): AbgFnCompositionSelection {
  const contract = contractFromHookRef(input.match.hookRef);
  validateHost({
    contract,
    vector: input.vector,
    graphFunction: input.graphFunction
  });
  return Object.freeze({
    kind: "abg_fn_composition_selection",
    selectionRef: selectionRef({
      source: input.match.source,
      sourceRef: input.match.sourceRef,
      contractRef: contract.contractRef,
      contractDigest: contract.contractDigest
    }),
    source: input.match.source,
    sourceRef: input.match.sourceRef,
    attrKey: input.match.attrKey,
    contract
  });
}

export function resolveAbgFnCompositionSelection(input: {
  readonly vector: GraphVector;
  readonly graphFunction: GraphFunction;
  readonly job?: Job | null | undefined;
  readonly roles?: readonly Role[] | undefined;
  readonly module?: AbgFnCompositionModulePolicySource | null | undefined;
}): AbgFnCompositionSelection {
  const matches: readonly (HookMatch | null)[] = Object.freeze([
    hookMatch({
      attrs: input.vector.declarations,
      source: "graph_vector_declarations",
      sourceRef: input.vector.id
    }),
    hookMatch({
      attrs: input.graphFunction.declarations,
      source: "graph_function_declarations",
      sourceRef: input.graphFunction.id
    }),
    input.job === undefined || input.job === null
      ? null
      : hookMatch({
          attrs: input.job.policyHooks,
          source: "job_policy_hooks",
          sourceRef: input.job.id
        }),
    singleRoleHookMatch(input.roles ?? Object.freeze([])),
    input.module === undefined || input.module === null
      ? null
      : hookMatch({
          attrs: input.module.policyHooks,
          source: "module_policy_hooks",
          sourceRef: input.module.name
        })
  ]);
  const match = matches.find((candidate) => candidate !== null) ?? null;
  if (match === null) {
    throw new TypeError("selected abg.fn_composition is required for compute plugin invocation");
  }
  return selectionFromMatch({
    match,
    vector: input.vector,
    graphFunction: input.graphFunction
  });
}

export function selectedAbgFnRegimeBindingForCompute(input: {
  readonly selection: AbgFnCompositionSelection;
  readonly stageRole: AbgFnComputeStageRole;
  readonly computeMeans: RuntimeRegime | null;
}): AbgFnRegimeBinding | null {
  if (input.computeMeans === null) {
    return null;
  }
  const matching = input.selection.contract.regimes.filter(
    (binding) =>
      binding.stageRole === input.stageRole &&
      binding.regime === input.computeMeans
  );
  if (matching.length === 0) {
    throw new TypeError(
      `selected abg.fn_composition has no regime binding for ${input.stageRole}/${input.computeMeans}`
    );
  }
  if (matching.length > 1) {
    throw new TypeError(
      `selected abg.fn_composition has ambiguous regime bindings for ${input.stageRole}/${input.computeMeans}`
    );
  }
  return matching[0] ?? null;
}
